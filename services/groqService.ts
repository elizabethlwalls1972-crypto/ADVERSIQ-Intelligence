/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI - GROQ SERVICE (Free Secondary AI Provider)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Ultra-fast LLM inference via Groq's LPU hardware.
 * Model: llama-3.3-70b-versatile (default - full reasoning + answering)
 * Fast:  llama-3.1-8b-instant
 *
 * Free tier: ~30 req/min, 14,400 req/day
 * Get a FREE key at: https://console.groq.com
 *
 * Set VITE_GROQ_API_KEY in .env (browser) and
 *     GROQ_API_KEY in .env (server) to activate.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { monitoringService } from './MonitoringService';

export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';
export const GROQ_FAST_MODEL = 'llama-3.1-8b-instant';
export const GROQ_REASONING_MODEL = 'openai/gpt-oss-120b';

// Re-use the same message shape as Together for interoperability
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

function getGroqKey(): string {
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
    ''
  );
}

/** Returns true if a valid Groq API key is configured. */
export function isGroqAvailable(): boolean {
  const key = getGroqKey();
  if (!key || key.length < 20) return false;
  const lower = key.toLowerCase();
  return !(
    lower.includes('your-') ||
    lower.includes('your_') ||
    lower.includes('key-here') ||
    lower.includes('placeholder')
  );
}

/**
 * Call Groq chat completions API.
 * OpenAI-compatible format - same message structure as Together.ai.
 *
 * - `onToken` triggers streaming mode via SSE.
 * - Without `onToken`, returns the full completion.
 */
export async function callGroq(
  messages: GroqMessage[],
  options: GroqOptions = {},
  onToken?: (token: string) => void
): Promise<string> {
  const key = getGroqKey();

  const lower = key.toLowerCase();
  if (
    !key ||
    key.length < 20 ||
    lower.includes('your-') ||
    lower.includes('your_') ||
    lower.includes('key-here') ||
    lower.includes('placeholder')
  ) {
    throw new Error('GROQ_API_KEY not configured - get a free key at https://console.groq.com');
  }

  const modelUsed = options.model ?? GROQ_DEFAULT_MODEL;
  const callStart = performance.now();

  const isReasoningModel = modelUsed === GROQ_REASONING_MODEL;

  const body: Record<string, unknown> = {
    model: modelUsed,
    messages,
    max_completion_tokens: isReasoningModel ? (options.maxTokens ?? 8192) : (options.maxTokens ?? 1024),
    temperature: options.temperature ?? 1,
    top_p: 1,
    stream: Boolean(onToken),
    stop: null,
    ...(isReasoningModel ? { reasoning_effort: 'medium' } : {}),
  };

  let res: Response;
  try {
    res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'groq',
      latencyMs: Math.round(performance.now() - callStart),
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    });
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'groq',
      latencyMs: Math.round(performance.now() - callStart),
      success: false,
      error: `${res.status}: ${errText.slice(0, 200)}`,
    });
    throw new Error(`Groq ${res.status}: ${errText}`);
  }

  // ── Non-streaming ──
  if (!onToken) {
    const data = await res.json();
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'groq',
      latencyMs: Math.round(performance.now() - callStart),
      success: true,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
    });
    return data.choices?.[0]?.message?.content || '';
  }

  // ── SSE streaming ──
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No stream body from Groq');

  const dec = new TextDecoder();
  let full = '',
    buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.replace(/^data:\s*/, '').trim();
      if (!trimmed || trimmed === '[DONE]') continue;
      try {
        const tok = JSON.parse(trimmed).choices?.[0]?.delta?.content || '';
        if (tok) {
          full += tok;
          onToken(tok);
        }
      } catch {
        /* partial chunk */
      }
    }
  }
  monitoringService.trackAICall({
    timestamp: new Date().toISOString(),
    model: modelUsed,
    provider: 'groq',
    latencyMs: Math.round(performance.now() - callStart),
    success: true,
  });
  return full;
}

/**
 * Simple one-shot prompt via Groq.
 * Drop-in replacement for generateWithTogether when Groq is available.
 */
export async function generateWithGroq(
  prompt: string,
  systemInstruction?: string,
  onToken?: (token: string) => void
): Promise<string> {
  const msgs: GroqMessage[] = [];
  if (systemInstruction) msgs.push({ role: 'system', content: systemInstruction });
  msgs.push({ role: 'user', content: prompt });
  return callGroq(msgs, {}, onToken);
}

export default { callGroq, isGroqAvailable, generateWithGroq };
