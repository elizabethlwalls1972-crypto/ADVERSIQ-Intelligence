/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 10: REASONING TRACE RECORDER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Records every brain phase, tool call, and decision point. Enables
 * queryable traces, counterfactual explanations, and debugging.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TraceEvent {
  phase: string;
  timestamp: string;
  durationMs: number;
  input: unknown;
  output: unknown;
  decision?: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface ReasoningTrace {
  requestId: string;
  userId?: string;
  query: string;
  startTime: string;
  endTime?: string;
  totalDurationMs?: number;
  events: TraceEvent[];
  finalOutput?: string;
  finalConfidence?: number;
  modelUsed?: string;
  tokensUsed?: number;
  toolCalls?: Array<{ tool: string; args: unknown; result: unknown }>;
  autonomousLoopIterations?: number;
}

export interface TraceQuery {
  requestId?: string;
  userId?: string;
  since?: string;
  limit?: number;
  minDurationMs?: number;
  phase?: string;
}

// ─── In-Memory Trace Store ──────────────────────────────────────────────────

const MAX_TRACES = 1000;
const traceStore: ReasoningTrace[] = [];

// ─── Trace Lifecycle ────────────────────────────────────────────────────────

export function startTrace(requestId: string, query: string, userId?: string): ReasoningTrace {
  const trace: ReasoningTrace = {
    requestId,
    userId,
    query,
    startTime: new Date().toISOString(),
    events: [],
    toolCalls: [],
  };

  traceStore.push(trace);

  // Evict oldest traces if over capacity
  while (traceStore.length > MAX_TRACES) {
    traceStore.shift();
  }

  return trace;
}

export function addTraceEvent(
  requestId: string,
  phase: string,
  input: unknown,
  output: unknown,
  durationMs: number,
  extras?: { decision?: string; confidence?: number; metadata?: Record<string, unknown> }
): void {
  const trace = traceStore.find(t => t.requestId === requestId);
  if (!trace) return;

  trace.events.push({
    phase,
    timestamp: new Date().toISOString(),
    durationMs,
    input: summarizeForTrace(input),
    output: summarizeForTrace(output),
    decision: extras?.decision,
    confidence: extras?.confidence,
    metadata: extras?.metadata,
  });
}

export function addToolCallTrace(
  requestId: string,
  tool: string,
  args: unknown,
  result: unknown
): void {
  const trace = traceStore.find(t => t.requestId === requestId);
  if (!trace) return;

  trace.toolCalls?.push({
    tool,
    args: summarizeForTrace(args),
    result: summarizeForTrace(result),
  });
}

export function completeTrace(
  requestId: string,
  finalOutput: string,
  extras?: {
    finalConfidence?: number;
    modelUsed?: string;
    tokensUsed?: number;
    autonomousLoopIterations?: number;
  }
): ReasoningTrace | undefined {
  const trace = traceStore.find(t => t.requestId === requestId);
  if (!trace) return undefined;

  trace.endTime = new Date().toISOString();
  trace.totalDurationMs = new Date(trace.endTime).getTime() - new Date(trace.startTime).getTime();
  trace.finalOutput = finalOutput.slice(0, 1000);
  trace.finalConfidence = extras?.finalConfidence;
  trace.modelUsed = extras?.modelUsed;
  trace.tokensUsed = extras?.tokensUsed;
  trace.autonomousLoopIterations = extras?.autonomousLoopIterations;

  return trace;
}

// ─── Query Traces ───────────────────────────────────────────────────────────

export function queryTraces(query: TraceQuery): ReasoningTrace[] {
  let results = [...traceStore];

  if (query.requestId) {
    results = results.filter(t => t.requestId === query.requestId);
  }
  if (query.userId) {
    results = results.filter(t => t.userId === query.userId);
  }
  if (query.since) {
    results = results.filter(t => t.startTime >= query.since!);
  }
  if (query.minDurationMs) {
    results = results.filter(t => (t.totalDurationMs ?? 0) >= query.minDurationMs!);
  }
  if (query.phase) {
    results = results.filter(t => t.events.some(e => e.phase === query.phase));
  }

  results.sort((a, b) => b.startTime.localeCompare(a.startTime));

  if (query.limit) {
    results = results.slice(0, query.limit);
  }

  return results;
}

export function getTrace(requestId: string): ReasoningTrace | undefined {
  return traceStore.find(t => t.requestId === requestId);
}

// ─── Counterfactual Explanation ─────────────────────────────────────────────

export function explainTrace(requestId: string): string {
  const trace = getTrace(requestId);
  if (!trace) return 'Trace not found.';

  const lines: string[] = [
    `## Reasoning Trace: ${trace.requestId}`,
    `**Query:** ${trace.query}`,
    `**Duration:** ${trace.totalDurationMs ?? '?'}ms`,
    `**Model:** ${trace.modelUsed ?? 'unknown'}`,
    `**Tokens:** ${trace.tokensUsed ?? '?'}`,
    '',
    '### Decision Timeline:',
  ];

  for (const event of trace.events) {
    lines.push(`- **${event.phase}** (${event.durationMs}ms)${event.decision ? ` → ${event.decision}` : ''}${event.confidence != null ? ` [confidence: ${(event.confidence * 100).toFixed(0)}%]` : ''}`);
  }

  if (trace.toolCalls && trace.toolCalls.length > 0) {
    lines.push('', '### Tool Calls:');
    for (const tc of trace.toolCalls) {
      lines.push(`- **${tc.tool}** → ${JSON.stringify(tc.result).slice(0, 100)}`);
    }
  }

  if (trace.autonomousLoopIterations) {
    lines.push('', `### Autonomous Loop: ${trace.autonomousLoopIterations} iterations`);
  }

  return lines.join('\n');
}

// ─── Summary Statistics ─────────────────────────────────────────────────────

export function getTraceStats(): {
  totalTraces: number;
  avgDurationMs: number;
  avgTokens: number;
  avgConfidence: number;
  phaseBreakdown: Record<string, { count: number; avgMs: number }>;
  toolUsage: Record<string, number>;
} {
  const completed = traceStore.filter(t => t.endTime);
  const phaseBreakdown: Record<string, { count: number; totalMs: number }> = {};
  const toolUsage: Record<string, number> = {};

  for (const trace of completed) {
    for (const event of trace.events) {
      if (!phaseBreakdown[event.phase]) {
        phaseBreakdown[event.phase] = { count: 0, totalMs: 0 };
      }
      phaseBreakdown[event.phase].count++;
      phaseBreakdown[event.phase].totalMs += event.durationMs;
    }
    for (const tc of trace.toolCalls || []) {
      toolUsage[tc.tool] = (toolUsage[tc.tool] || 0) + 1;
    }
  }

  const formattedPhases: Record<string, { count: number; avgMs: number }> = {};
  for (const [phase, data] of Object.entries(phaseBreakdown)) {
    formattedPhases[phase] = { count: data.count, avgMs: Math.round(data.totalMs / data.count) };
  }

  return {
    totalTraces: traceStore.length,
    avgDurationMs: completed.length > 0
      ? Math.round(completed.reduce((s, t) => s + (t.totalDurationMs ?? 0), 0) / completed.length)
      : 0,
    avgTokens: completed.length > 0
      ? Math.round(completed.reduce((s, t) => s + (t.tokensUsed ?? 0), 0) / completed.length)
      : 0,
    avgConfidence: completed.length > 0
      ? completed.reduce((s, t) => s + (t.finalConfidence ?? 0), 0) / completed.length
      : 0,
    phaseBreakdown: formattedPhases,
    toolUsage,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function summarizeForTrace(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.length > 500 ? value.slice(0, 500) + '...' : value;
  if (Array.isArray(value)) return `[Array(${value.length})]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length > 10) return `{Object with ${keys.length} keys}`;
    return value;
  }
  return value;
}
