import { EventBus } from './EventBus';
import { persistentMemory } from './PersistentMemorySystem';

export interface SystemError {
  id: string;
  timestamp: Date;
  type: 'runtime' | 'logic' | 'network' | 'security' | 'performance';
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolution?: string;
  autoFixed: boolean;
}

export interface RecoveryAction {
  id: string;
  errorId: string;
  description: string;
  action: () => Promise<void> | void;
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  executed: boolean;
  success?: boolean;
}

export class SelfFixingEngine {
  private errors: Map<string, SystemError> = new Map();
  private recoveryActions: Map<string, RecoveryAction[]> = new Map();
  private isMonitoring = false;
  private errorPatterns: Map<string, { count: number; lastSeen: Date; fixes: string[] }> = new Map();
  private unsubscribers: Array<() => void> = [];

  constructor() {
    this.setupErrorMonitoring();
    this.loadErrorHistory();
  }

  // Start monitoring for errors
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.unsubscribers.push(
      EventBus.on('errorOccurred', this.handleError.bind(this)),
      EventBus.on('systemDegraded', this.handleSystemDegradation.bind(this))
    );

    console.log('Self-fixing engine monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }

  // Report an error
  async reportError(error: Omit<SystemError, 'id' | 'timestamp' | 'resolved'>): Promise<string> {
    const errorId = crypto.randomUUID();
    const fullError: SystemError = {
      ...error,
      id: errorId,
      timestamp: new Date(),
      resolved: false
    };

    this.errors.set(errorId, fullError);
    this.updateErrorPatterns(fullError);

    await persistentMemory.remember('system_errors', {
      action: 'Report error',
      context: { errorId, type: error.type, message: error.message },
      outcome: { success: false },
      confidence: 0
    });

    EventBus.emit({ type: 'errorReported', error: fullError });

    // Attempt auto-fix
    await this.attemptAutoFix(fullError);

    return errorId;
  }

  // Mark error as resolved
  async resolveError(errorId: string, resolution: string): Promise<boolean> {
    const error = this.errors.get(errorId);
    if (!error) return false;

    error.resolved = true;
    error.resolution = resolution;

    await persistentMemory.remember('error_resolution', {
      action: 'Resolve error',
      context: { errorId, resolution },
      outcome: { success: true },
      confidence: 1.0
    });

    this.saveErrorHistory();
    EventBus.emit({ type: 'errorResolved', error });

    return true;
  }

  // Get error diagnostics
  getErrorDiagnostics(): {
    totalErrors: number;
    unresolvedErrors: number;
    errorTypes: Record<string, number>;
    commonPatterns: Array<{ pattern: string; count: number; fixes: string[] }>;
  } {
    const errors = Array.from(this.errors.values());
    const unresolved = errors.filter(e => !e.resolved);
    const types = errors.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const patterns = Array.from(this.errorPatterns.entries())
      .map(([pattern, data]) => ({ pattern, count: data.count, fixes: data.fixes }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: errors.length,
      unresolvedErrors: unresolved.length,
      errorTypes: types,
      commonPatterns: patterns
    };
  }

  // Get recovery suggestions
  getRecoverySuggestions(errorId: string): RecoveryAction[] {
    return this.recoveryActions.get(errorId) || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleError(errorData: any): Promise<void> {
    await this.reportError({
      type: errorData.type || 'runtime',
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      context: errorData.context || {},
      severity: errorData.severity || 'medium',
      autoFixed: false
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleSystemDegradation(data: any): Promise<void> {
    // Handle system performance degradation
    await this.reportError({
      type: 'performance',
      message: 'System performance degraded',
      context: data,
      severity: 'high',
      autoFixed: false
    });
  }

  private async attemptAutoFix(error: SystemError): Promise<void> {
    const actions = this.generateRecoveryActions(error);

    if (actions.length === 0) return;

    this.recoveryActions.set(error.id, actions);

    // Execute low-risk auto-fixes
    const autoActions = actions.filter(action => action.risk === 'low' && action.confidence > 0.7);

    for (const action of autoActions) {
      try {
        await action.action();
        action.executed = true;
        action.success = true;

        error.autoFixed = true;
        await this.resolveError(error.id, `Auto-fixed: ${action.description}`);

        await persistentMemory.remember('auto_fix', {
          action: 'Auto-fix error',
          context: { errorId: error.id, actionId: action.id },
          outcome: { success: true },
          confidence: action.confidence
        });

        break; // Stop after first successful fix

      } catch (fixError: unknown) {
        action.executed = true;
        action.success = false;

        await persistentMemory.remember('auto_fix_failed', {
          action: 'Auto-fix failed',
          context: { errorId: error.id, actionId: action.id, error: fixError instanceof Error ? fixError.message : String(fixError) },
          outcome: { success: false },
          confidence: 0
        });
      }
    }
  }

  private generateRecoveryActions(error: SystemError): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    // Check if we have a known fix pattern from history
    const knownPattern = this.findMatchingPattern(error);
    if (knownPattern && knownPattern.fixes.length > 0) {
      actions.push({
        id: crypto.randomUUID(),
        errorId: error.id,
        description: `Apply known fix: ${knownPattern.fixes[0]}`,
        action: async () => {
          console.log(`[SelfFix] Applying historical fix pattern: ${knownPattern.fixes[0]}`);
          // Register the fix as applied via EventBus so other components can react
          EventBus.emit({ type: 'selfFixApplied',
            errorId: error.id,
            fixDescription: knownPattern.fixes[0],
            confidence: 0.85
          });
        },
        risk: 'low',
        confidence: 0.85,
        executed: false
      });
    }

    switch (error.type) {
      case 'runtime':
        // Clear any corrupted state in localStorage that might cause runtime errors
        actions.push({
          id: crypto.randomUUID(),
          errorId: error.id,
          description: 'Clear corrupted runtime state and reset service caches',
          action: async () => {
            if (typeof window !== 'undefined' && window.localStorage) {
              // Remove corrupted cache entries (not user data)
              const keysToCheck = Object.keys(localStorage);
              for (const key of keysToCheck) {
                if (key.startsWith('cache_') || key.startsWith('temp_') || key.startsWith('dag_')) {
                  try {
                    const val = localStorage.getItem(key);
                    if (val) JSON.parse(val); // test parse
                  } catch {
                    localStorage.removeItem(key);
                    console.log(`[SelfFix] Removed corrupted cache: ${key}`);
                  }
                }
              }
            }
            // Emit recovery event so services can re-initialize
            EventBus.emit({ type: 'serviceRecovery', errorId: error.id });
          },
          risk: 'low',
          confidence: 0.8,
          executed: false
        });
        break;

      case 'network': {
        actions.push({
          id: crypto.randomUUID(),
          errorId: error.id,
          description: 'Retry network operation with exponential backoff',
          action: async () => {
            // Trigger retry via EventBus (LiveDataService listens for this)
            EventBus.emit({ type: 'networkRetry',
              errorId: error.id,
              context: error.context,
              maxRetries: 3,
              backoffMs: 1000
            });
            console.log('[SelfFix] Network retry initiated with exponential backoff');
          },
          risk: 'low',
          confidence: 0.9,
          executed: false
        });

        // If repeated network failures, switch to cached/fallback data
        const networkPattern = this.findMatchingPattern(error);
        if (networkPattern && networkPattern.count >= 3) {
          actions.push({
            id: crypto.randomUUID(),
            errorId: error.id,
            description: 'Switch to cached/fallback data after repeated network failures',
            action: async () => {
              EventBus.emit({ type: 'useFallbackData',
                errorId: error.id,
                reason: `${networkPattern.count} consecutive network failures`
              });
              console.log('[SelfFix] Switched to fallback data mode');
            },
            risk: 'medium',
            confidence: 0.75,
            executed: false
          });
        }
        break;
      }

      case 'performance':
        actions.push({
          id: crypto.randomUUID(),
          errorId: error.id,
          description: 'Clear performance caches and reduce concurrent operations',
          action: async () => {
            if (typeof window !== 'undefined' && window.localStorage) {
              const keys = Object.keys(localStorage);
              let cleared = 0;
              for (const key of keys) {
                if (key.startsWith('cache_') || key.startsWith('temp_') || key.startsWith('composite_')) {
                  localStorage.removeItem(key);
                  cleared++;
                }
              }
              console.log(`[SelfFix] Cleared ${cleared} cache entries to free memory`);
            }
            // Notify system to reduce parallelism
            EventBus.emit({ type: 'reduceParallelism',
              errorId: error.id,
              suggestion: 'Reduce DAG parallel level count'
            });
          },
          risk: 'low',
          confidence: 0.7,
          executed: false
        });
        break;

      case 'logic':
        actions.push({
          id: crypto.randomUUID(),
          errorId: error.id,
          description: 'Reset to default weights and re-run analysis with safe parameters',
          action: async () => {
            // Clear any corrupted runtime weights
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem('bwNexusSelfImprovement');
              console.log('[SelfFix] Reset self-improvement weights to defaults');
            }
            EventBus.emit({ type: 'logicRecovery',
              errorId: error.id,
              action: 'Reset all tuned weights to factory defaults'
            });
          },
          risk: 'medium',
          confidence: 0.6,
          executed: false
        });
        break;

      case 'security':
        actions.push({
          id: crypto.randomUUID(),
          errorId: error.id,
          description: 'Log security event and restrict operations',
          action: async () => {
            await persistentMemory.remember('security_incidents', {
              action: 'Security event detected',
              context: { errorId: error.id, message: error.message, severity: error.severity },
              outcome: { success: false },
              confidence: 1.0
            });
            EventBus.emit({ type: 'securityRestriction',
              errorId: error.id,
              restriction: 'Disable autonomous actions pending review'
            });
            console.log('[SelfFix] Security event logged, autonomous actions restricted');
          },
          risk: 'low',
          confidence: 0.95,
          executed: false
        });
        break;
    }

    return actions;
  }

  private updateErrorPatterns(error: SystemError): void {
    const patternKey = `${error.type}:${error.message.split(' ').slice(0, 3).join(' ')}`;

    if (!this.errorPatterns.has(patternKey)) {
      this.errorPatterns.set(patternKey, { count: 0, lastSeen: new Date(), fixes: [] });
    }

    const pattern = this.errorPatterns.get(patternKey)!;
    pattern.count++;
    pattern.lastSeen = new Date();

    // Add successful fixes to pattern
    if (error.resolved && error.resolution) {
      pattern.fixes.push(error.resolution);
    }
  }

  private findMatchingPattern(error: SystemError): { pattern: string; count: number; fixes: string[] } | null {
    const patternKey = `${error.type}:${error.message.split(' ').slice(0, 3).join(' ')}`;
    const match = this.errorPatterns.get(patternKey);
    if (!match) return null;
    return { pattern: patternKey, count: match.count, fixes: match.fixes };
  }

  private setupErrorMonitoring(): void {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.reportError({
          type: 'runtime',
          message: event.message,
          stack: event.error?.stack,
          context: { filename: event.filename, lineno: event.lineno },
          severity: 'high',
          autoFixed: false
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.reportError({
          type: 'runtime',
          message: `Unhandled promise rejection: ${event.reason}`,
          context: { reason: event.reason },
          severity: 'high',
          autoFixed: false
        });
      });
    }

    // Monitor for performance issues
    if (typeof window !== 'undefined' && 'performance' in window) {
      setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memory = (performance as any).memory;
        if (memory && memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
          EventBus.emit({ type: 'systemDegraded',
            resource: 'memory',
            usage: memory.usedJSHeapSize / memory.totalJSHeapSize
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private saveErrorHistory(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        errors: Array.from(this.errors.entries()),
        patterns: Array.from(this.errorPatterns.entries()),
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('bwNexusErrorHistory', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save error history:', error);
    }
  }

  private loadErrorHistory(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = localStorage.getItem('bwNexusErrorHistory');
      if (data) {
        const parsed = JSON.parse(data);
        this.errors = new Map(parsed.errors);
        this.errorPatterns = new Map(parsed.patterns);
      }
    } catch (error) {
      console.warn('Failed to load error history:', error);
    }
  }

  // Get system health status
  getHealthStatus() {
    const errors = Array.from(this.errors.values());
    const recentErrors = errors.filter(e =>
      Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const criticalErrors = recentErrors.filter(e => e.severity === 'critical');
    const unresolvedErrors = errors.filter(e => !e.resolved);

    return {
      overall: criticalErrors.length > 0 ? 'critical' :
               unresolvedErrors.length > 5 ? 'warning' : 'healthy',
      recentErrors: recentErrors.length,
      unresolvedErrors: unresolvedErrors.length,
      autoFixes: errors.filter(e => e.autoFixed).length
    };
  }
}

export const selfFixingEngine = new SelfFixingEngine();
