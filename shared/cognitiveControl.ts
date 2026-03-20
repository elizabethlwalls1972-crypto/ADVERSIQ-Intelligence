export type ControlMode = 'reactive' | 'agentic_lite' | 'agentic_full' | 'deliberative';

export type ControlProvider = 'bedrock' | 'openai' | 'together';

export interface RequestEnvelope {
  requestId: string;
  timestamp: string;
  messageChars: number;
  readinessScore?: number;
  hasAttachments?: boolean;
  sessionDepth?: number;
  taskType?: string;
  retryCount?: number;
}

export interface ProviderAvailability {
  bedrock: boolean;
  openai: boolean;
  together: boolean;
}

export interface LearningHint {
  preferredMode: ControlMode;
  confidence: number;
  reason: string;
}

export interface ControlDecision {
  mode: ControlMode;
  score: number;
  timeoutMs: number;
  maxTools: number;
  tokenBudget: number;
  maxRetries: number;
  providerOrder: ControlProvider[];
  explain: string[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const uniqueProviders = (providers: ControlProvider[]): ControlProvider[] => Array.from(new Set(providers));

export const deriveControlDecision = (
  envelope: RequestEnvelope,
  providers: ProviderAvailability,
  hint?: LearningHint | null
): ControlDecision => {
  const readiness = clamp(Number(envelope.readinessScore ?? 20), 0, 100);
  const chars = clamp(Number(envelope.messageChars || 0), 0, 12000);
  const depth = clamp(Number(envelope.sessionDepth ?? 1), 1, 100);
  const hasAttachments = Boolean(envelope.hasAttachments);
  const retries = clamp(Number(envelope.retryCount ?? 0), 0, 5);

  const complexityScore =
    readiness * 0.45 +
    Math.min(chars / 80, 25) +
    Math.min(depth * 1.2, 15) +
    (hasAttachments ? 12 : 0) -
    retries * 3;

  const score = clamp(Math.round(complexityScore), 0, 100);

  let mode: ControlMode = 'reactive';
  if (score >= 80) mode = 'deliberative';
  else if (score >= 60) mode = 'agentic_full';
  else if (score >= 35) mode = 'agentic_lite';

  if (hint && hint.confidence >= 0.62) {
    if (hint.preferredMode === 'reactive' && mode !== 'reactive') mode = 'agentic_lite';
    if (hint.preferredMode === 'deliberative' && mode !== 'deliberative') mode = 'agentic_full';
  }

  const modePolicy = {
    reactive: { timeoutMs: 12000, maxTools: 1, tokenBudget: 1200, maxRetries: 1 },
    agentic_lite: { timeoutMs: 18000, maxTools: 3, tokenBudget: 2400, maxRetries: 1 },
    agentic_full: { timeoutMs: 26000, maxTools: 6, tokenBudget: 4200, maxRetries: 2 },
    deliberative: { timeoutMs: 34000, maxTools: 8, tokenBudget: 6000, maxRetries: 2 },
  } as const;

  const liveOrder: ControlProvider[] = [
    providers.bedrock ? 'bedrock' : null,
    providers.openai ? 'openai' : null,
    providers.together ? 'together' : null,
  ].filter((p): p is ControlProvider => Boolean(p));

  const fallbackOrder: ControlProvider[] = ['bedrock', 'openai', 'together'];
  const providerOrder = uniqueProviders(liveOrder.length ? [...liveOrder, ...fallbackOrder] : fallbackOrder);

  const explain: string[] = [
    `score=${score}`,
    `readiness=${readiness}`,
    `messageChars=${chars}`,
    `sessionDepth=${depth}`,
    hasAttachments ? 'attachments=true' : 'attachments=false',
  ];

  if (hint && hint.confidence > 0) {
    explain.push(`learningHint=${hint.preferredMode}@${hint.confidence.toFixed(2)}`);
  }

  return {
    mode,
    score,
    timeoutMs: modePolicy[mode].timeoutMs,
    maxTools: modePolicy[mode].maxTools,
    tokenBudget: modePolicy[mode].tokenBudget,
    maxRetries: modePolicy[mode].maxRetries,
    providerOrder,
    explain,
  };
};
