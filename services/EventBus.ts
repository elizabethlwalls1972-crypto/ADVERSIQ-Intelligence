/**
 * EventBus " Unified pub/sub for the BWGA Ai ecosystem
 *
 * Connects: agentic worker, orchestrator, self-learning engine, consultant, App
 * Enables all modules to see the whole "meadow" (bee, flower, ecosystem).
 */
import type {
  ReportPayload,
  CopilotInsight,
  IntakeMappingSnapshot,
  ApprovalRecord,
  ProvenanceEntry,
  MandateRecord
} from '../types';

// Ecosystem pulse: the "meadow" view (alignment, bottlenecks, opportunities)
export type EcosystemPulse = {
  alignment: number; // 0-100 from SEAM or composite
  bottlenecks: string[];
  opportunities: string[];
};

// Memory case from prior runs
export type MemoryCase = {
  id: string;
  score: number;
  why: string[];
  organizationName?: string;
  country?: string;
};

// Executive brief structure
export type ExecutiveBrief = {
  proceedSignal: 'proceed' | 'pause' | 'restructure';
  topDrivers: string[];
  topRisks: string[];
  nextActions: string[];
};

// All event types in the system
export type NexusEvent =
  | { type: 'intakeUpdated'; reportId: string; snapshot: IntakeMappingSnapshot }
  | { type: 'payloadAssembled'; reportId: string; payload: ReportPayload }
  | { type: 'executiveBriefReady'; reportId: string; brief: ExecutiveBrief }
  | { type: 'insightsGenerated'; reportId: string; insights: CopilotInsight[] }
  | { type: 'suggestionsReady'; reportId: string; actions: string[] }
  | { type: 'memoryUpdated'; reportId: string; cases: MemoryCase[] }
  | { type: 'outcomeRecorded'; reportId: string; outcome: { success: boolean; notes?: string } }
  | { type: 'proactiveDiscovery'; reportId: string; actions: string[]; sources: string[] }
  | { type: 'learningUpdate'; reportId: string; message: string; improvements?: string[] }
  | { type: 'ecosystemPulse'; reportId: string; signals: EcosystemPulse }
  | { type: 'approvalUpdated'; reportId: string; approval: ApprovalRecord; mandate?: MandateRecord }
  | { type: 'provenanceLogged'; reportId: string; entry: ProvenanceEntry; mandate?: MandateRecord }
  // Autonomous system events
  | { type: 'fullyAutonomousRunComplete'; runId: string; deepThinking: any; generatedDocument?: any; autonomousActions: any[]; improvements?: any[]; spawnedAgents?: any[]; memory: any; liabilityAssessment: any[]; performance: any }
  | { type: 'improvementsSuggested'; suggestions: any[] }
  | { type: 'agentSpawned'; agent: any }
  | { type: 'taskAssigned'; task: any; agent: any }
  | { type: 'agentTerminated'; agent: any; reason: string }
  | { type: 'schedulerStarted' }
  | { type: 'schedulerStopped' }
  | { type: 'taskScheduled'; task: any }
  | { type: 'taskRemoved'; taskId: string }
  | { type: 'taskExecuted'; task: any; success: boolean; error?: string; duration: number }
  | { type: 'triggerExecuted'; trigger: any; data: any }
  | { type: 'errorReported'; error: any }
  | { type: 'errorResolved'; error: any }
  | { type: 'errorOccurred'; error: any }
  | { type: 'systemDegraded'; resource?: string; usage?: number }
  | { type: 'systemOverload'; resource?: string; usage?: number }
  | { type: 'searchConfigUpdated'; config: any }
  | { type: 'searchResultReady'; query: string; result: any; trigger?: any }
  | { type: 'searchStarted'; query: string; trigger: any }
  | { type: 'searchCompleted'; query: string; result: any }
  | { type: 'consultantInsightsGenerated'; insights: any[]; context: string }
  | { type: 'consultantReportInsights'; insights: any[] }
  | { type: 'paramsUpdated'; params: any }
  | { type: 'reportGenerationStarted'; params: any }
  | { type: 'autonomousSearchRequest'; query: string; priority?: string }
  // Self-fixing engine events
  | { type: 'selfFixApplied'; errorId: string; fixDescription: string; confidence: number }
  | { type: 'serviceRecovery'; errorId: string; [key: string]: unknown }
  | { type: 'networkRetry'; errorId: string; context: unknown; maxRetries: number; backoffMs: number }
  | { type: 'useFallbackData'; errorId: string; reason: string }
  | { type: 'reduceParallelism'; errorId: string; suggestion: string }
  | { type: 'logicRecovery'; errorId: string; action: string }
  | { type: 'securityRestriction'; errorId: string; restriction: string }
  | { type: 'userInteraction'; action: string; [key: string]: any };

type Handler<T extends NexusEvent['type']> = (event: Extract<NexusEvent, { type: T }>) => void;

class EventBusImpl {
  private listeners: Map<string, Set<Function>> = new Map();
  private eventLog: Array<{ ts: number; type: string; reportId: string }> = [];

  subscribe<T extends NexusEvent['type']>(type: T, handler: Handler<T>): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler as Function);
    return () => {
      this.listeners.get(type)?.delete(handler as Function);
    };
  }

  publish(event: NexusEvent): void {
    // Log for traceability
    this.eventLog.push({ ts: Date.now(), type: event.type, reportId: (event as any).reportId || '' });
    if (this.eventLog.length > 100) this.eventLog.shift();

    const set = this.listeners.get(event.type);
    if (!set || set.size === 0) {
      console.debug(`[EventBus] No handlers for ${event.type}`);
      return;
    }
    console.log(`[EventBus] ${event.type} ' ${set.size} handler(s)`);
    for (const handler of set) {
      try {
        (handler as Function)(event);
      } catch (e) {
        console.warn('[EventBus] Handler error for', event.type, e);
      }
    }
  }

  /** Recent events for debugging */
  getRecentEvents(n = 10) {
    return this.eventLog.slice(-n);
  }

  /** Clear all (for tests) */
  clear() {
    this.listeners.clear();
    this.eventLog = [];
  }

  /** Alias for subscribe (for compatibility) */
  on<T extends NexusEvent['type']>(type: T, handler: Handler<T>): () => void {
    return this.subscribe(type, handler);
  }

  /** Alias for publish (for compatibility) */
  emit(event: NexusEvent): void {
    return this.publish(event);
  }

  /** Unsubscribe a handler from an event type */
  off<T extends NexusEvent['type']>(type: T, handler: Function): void {
    this.listeners.get(type)?.delete(handler);
  }
}

export const EventBus = new EventBusImpl();

