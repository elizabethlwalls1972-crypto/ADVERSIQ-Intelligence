import { EventBus } from './EventBus';
import { persistentMemory } from './PersistentMemorySystem';

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  schedule: {
    type: 'interval' | 'cron' | 'event-triggered';
    interval?: number; // minutes
    cronExpression?: string;
    triggerEvent?: string;
  };
  action: () => Promise<void> | void;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  maxRuns?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout?: number; // seconds
}

export interface Trigger {
  id: string;
  name: string;
  eventType: string;
  condition: (eventData: Record<string, unknown>) => boolean;
  action: (eventData: Record<string, unknown>) => Promise<void> | void;
  enabled: boolean;
  cooldown: number; // minutes between triggers
  lastTriggered?: Date;
  triggerCount: number;
}

export class AutonomousScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private triggers: Map<string, Trigger> = new Map();
  private runningTasks: Set<string> = new Set();
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  constructor() {
    this.setupEventListeners();
    this.loadFromStorage();
  }

  // Start the scheduler
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.checkInterval = setInterval(() => this.checkAndExecuteTasks(), 60000); // Check every minute

    EventBus.emit({ type: 'schedulerStarted' });
  }

  // Stop the scheduler
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    EventBus.emit({ type: 'schedulerStopped' });
  }

  // Add scheduled task
  addTask(task: Omit<ScheduledTask, 'id' | 'runCount' | 'lastRun' | 'nextRun'>): string {
    const id = crypto.randomUUID();
    const fullTask: ScheduledTask = {
      ...task,
      id,
      runCount: 0,
      nextRun: this.calculateNextRun(task.schedule)
    };

    this.tasks.set(id, fullTask);
    this.saveToStorage();

    EventBus.emit({ type: 'taskScheduled', task: fullTask });

    return id;
  }

  // Remove task
  removeTask(taskId: string): boolean {
    const removed = this.tasks.delete(taskId);
    if (removed) {
      this.saveToStorage();
      EventBus.emit({ type: 'taskRemoved', taskId });
    }
    return removed;
  }

  // Add trigger
  addTrigger(trigger: Omit<Trigger, 'id' | 'triggerCount' | 'lastTriggered'>): string {
    const id = crypto.randomUUID();
    const fullTrigger: Trigger = {
      ...trigger,
      id,
      triggerCount: 0
    };

    this.triggers.set(id, fullTrigger);
    this.saveToStorage();

    return id;
  }

  // Remove trigger
  removeTrigger(triggerId: string): boolean {
    const removed = this.triggers.delete(triggerId);
    if (removed) {
      this.saveToStorage();
    }
    return removed;
  }

  // Manual task execution
  async executeTaskNow(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || !task.enabled || this.runningTasks.has(taskId)) {
      return false;
    }

    return await this.executeTask(task);
  }

  // Get all tasks
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  // Get all triggers
  getTriggers(): Trigger[] {
    return Array.from(this.triggers.values());
  }

  // Enable/disable task
  setTaskEnabled(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.enabled = enabled;
    task.nextRun = enabled ? this.calculateNextRun(task.schedule) : undefined;
    this.saveToStorage();

    return true;
  }

  // Enable/disable trigger
  setTriggerEnabled(triggerId: string, enabled: boolean): boolean {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return false;

    trigger.enabled = enabled;
    this.saveToStorage();

    return true;
  }

  private async checkAndExecuteTasks(): Promise<void> {
    if (!this.isRunning) return;

    const now = new Date();

    // Check scheduled tasks
    for (const task of this.tasks.values()) {
      if (!task.enabled || this.runningTasks.has(task.id)) continue;

      if (task.nextRun && now >= task.nextRun) {
        await this.executeTask(task);
      }
    }
  }

  private async executeTask(task: ScheduledTask): Promise<boolean> {
    if (this.runningTasks.has(task.id)) return false;

    this.runningTasks.add(task.id);
    const startTime = Date.now();

    try {
      // Check if max runs reached
      if (task.maxRuns && task.runCount >= task.maxRuns) {
        this.removeTask(task.id);
        return false;
      }

      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        if (task.timeout) {
          setTimeout(() => reject(new Error('Task timeout')), task.timeout * 1000);
        }
      });

      await Promise.race([
        task.action(),
        timeoutPromise
      ]);

      task.runCount++;
      task.lastRun = new Date();
      task.nextRun = this.calculateNextRun(task.schedule);

      await persistentMemory.remember('task_execution', {
        action: 'Execute scheduled task',
        context: { taskId: task.id, name: task.name },
        outcome: { success: true, duration: Date.now() - startTime },
        confidence: 0.9
      });

      EventBus.emit({ type: 'taskExecuted',
        task,
        success: true,
        duration: Date.now() - startTime
      });

      return true;

    } catch (error) {
      task.runCount++;
      task.lastRun = new Date();

      await persistentMemory.remember('task_failure', {
        action: 'Execute scheduled task',
        context: { taskId: task.id, name: task.name, error: error instanceof Error ? error.message : String(error) },
        outcome: { success: false, duration: Date.now() - startTime },
        confidence: 0
      });

      EventBus.emit({ type: 'taskExecuted',
        task,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });

      return false;

    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  private calculateNextRun(schedule: ScheduledTask['schedule']): Date | undefined {
    const now = new Date();

    switch (schedule.type) {
      case 'interval':
        if (schedule.interval) {
          return new Date(now.getTime() + schedule.interval * 60000);
        }
        break;
      case 'cron':
        // Simple cron parsing (would need a full cron library for complex expressions)
        if (schedule.cronExpression) {
          return this.parseSimpleCron(schedule.cronExpression);
        }
        break;
      case 'event-triggered':
        return undefined; // No next run for event-triggered
    }

    return undefined;
  }

  private parseSimpleCron(expression: string): Date {
    // Very basic cron parsing - in reality, use a proper cron library
    const parts = expression.split(' ');
    if (parts.length >= 5) {
      const minute = parts[0] === '*' ? new Date().getMinutes() : parseInt(parts[0]);
      const hour = parts[1] === '*' ? new Date().getHours() : parseInt(parts[1]);

      const next = new Date();
      next.setMinutes(minute);
      next.setHours(hour);

      if (next <= new Date()) {
        next.setDate(next.getDate() + 1);
      }

      return next;
    }

    return new Date(Date.now() + 60000); // Default to 1 minute
  }

  private setupEventListeners(): void {
    // Listen for key events that might trigger tasks
    const watchedEvents = ['errorReported', 'errorOccurred', 'systemDegraded', 'systemOverload', 'memoryUpdated', 'searchCompleted'] as const;
    for (const eventType of watchedEvents) {
      EventBus.on(eventType, (event: Record<string, unknown>) => {
        this.checkTriggers(eventType, event);
      });
    }
  }

  private async checkTriggers(eventType: string, data: Record<string, unknown>): Promise<void> {
    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled || trigger.eventType !== eventType) continue;

      // Check cooldown
      if (trigger.lastTriggered) {
        const timeSinceLast = (Date.now() - trigger.lastTriggered.getTime()) / 60000;
        if (timeSinceLast < trigger.cooldown) continue;
      }

      // Check condition
      try {
        if (trigger.condition(data)) {
          trigger.triggerCount++;
          trigger.lastTriggered = new Date();

          await trigger.action(data);

          EventBus.emit({ type: 'triggerExecuted', trigger, data });
        }
      } catch (error) {
        console.error('Trigger execution failed:', error);
      }
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        tasks: Array.from(this.tasks.entries()),
        triggers: Array.from(this.triggers.entries()),
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('bwNexusScheduler', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save scheduler data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = localStorage.getItem('bwNexusScheduler');
      if (data) {
        const parsed = JSON.parse(data);
        this.tasks = new Map(parsed.tasks);
        this.triggers = new Map(parsed.triggers);
      }
    } catch (error) {
      console.warn('Failed to load scheduler data:', error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: this.tasks.size,
      activeTriggers: this.triggers.size,
      runningTasks: this.runningTasks.size,
      nextTaskRuns: Array.from(this.tasks.values())
        .filter(t => t.enabled && t.nextRun)
        .map(t => ({ id: t.id, name: t.name, nextRun: t.nextRun }))
        .sort((a, b) => a.nextRun!.getTime() - b.nextRun!.getTime())
        .slice(0, 5)
    };
  }
}

export const autonomousScheduler = new AutonomousScheduler();
