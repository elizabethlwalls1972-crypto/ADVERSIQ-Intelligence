/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI - GOOGLE GEMMA SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Google Gemma model integration via Together.ai or Hugging Face Inference API.
 * Gemma models run through the Together.ai platform (OpenAI-compatible endpoint),
 * providing access to Google's open-weight models with the same infrastructure
 * already used for Llama models.
 *
 * Models:
 *   GEMMA_DEFAULT  - google/gemma-2-27b-it   (reasoning, analysis)
 *   GEMMA_FAST     - google/gemma-2-9b-it    (classification, extraction)
 *
 * Configure TOGETHER_API_KEY in server .env to activate (same key as Llama models).
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { monitoringService } from './services/MonitoringService';

// ─── Model Constants ──────────────────────────────────────────────────────────

export const GEMMA_API_URL = 'https://api.together.xyz/v1/chat/completions';
export const GEMMA_DEFAULT_MODEL = 'google/gemma-2-27b-it';
export const GEMMA_FAST_MODEL = 'google/gemma-2-9b-it';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GemmaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GemmaOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  topP?: number;
  topK?: number;
}

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

let _circuitOpen = false;
let _circuitOpenUntil = 0;

function normalizeApiKey(raw: unknown): string {
  return String(raw ?? '').trim().replace(/^['"]|['"]$/g, '');
}

function markCircuitOpen(): void {
  _circuitOpen = true;
  _circuitOpenUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
}

function isCircuitOpen(): boolean {
  if (!_circuitOpen) return false;
  if (Date.now() > _circuitOpenUntil) {
    _circuitOpen = false;
    return false;
  }
  return true;
}

// ─── Availability ─────────────────────────────────────────────────────────────

/** Returns true if Together.ai key is valid AND circuit-breaker is not tripped. */
export function isGemmaAvailable(): boolean {
  if (isCircuitOpen()) return false;
  const key = normalizeApiKey(
    (typeof process !== 'undefined' && process.env?.TOGETHER_API_KEY) || ''
  );
  if (!key || key.length < 20) return false;
  const lower = key.toLowerCase();
  return !(
    lower.includes('your-') ||
    lower.includes('your_') ||
    lower.includes('key-here') ||
    lower.includes('placeholder')
  );
}

// ─── Core API Call ────────────────────────────────────────────────────────────

/**
 * Call Google Gemma via Together.ai chat completions API.
 * - `onToken` triggers streaming mode via SSE.
 * - Without `onToken`, returns the full completion.
 */
export async function callGemma(
  messages: GemmaMessage[],
  options: GemmaOptions = {},
  onToken?: (token: string) => void
): Promise<string> {
  if (isCircuitOpen()) {
    throw new Error('Gemma circuit-breaker open (previous auth failure)');
  }

  const key = normalizeApiKey(
    (typeof process !== 'undefined' && process.env?.TOGETHER_API_KEY) || ''
  );

  const lower = key.toLowerCase();
  if (
    !key ||
    key.length < 20 ||
    lower.includes('your-') ||
    lower.includes('your_') ||
    lower.includes('key-here') ||
    lower.includes('placeholder')
  ) {
    throw new Error(
      'TOGETHER_API_KEY not configured - required for Gemma models. Get a key at https://api.together.xyz'
    );
  }

  const modelUsed = options.model ?? GEMMA_DEFAULT_MODEL;
  const callStart = performance.now();

  const body = JSON.stringify({
    model: modelUsed,
    messages,
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.4,
    top_p: options.topP ?? 0.9,
    top_k: options.topK ?? 50,
    stream: Boolean(onToken),
  });

  let res: Response;
  try {
    res = await fetch(GEMMA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body,
    });
  } catch (err) {
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'gemma',
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
      provider: 'gemma',
      latencyMs: Math.round(performance.now() - callStart),
      success: false,
      error: `${res.status}: ${errText.slice(0, 200)}`,
    });
    if (res.status === 401 || res.status === 403) {
      markCircuitOpen();
    }
    throw new Error(`Gemma (Together.ai) ${res.status}: ${errText}`);
  }

  // ── Non-streaming ──
  if (!onToken) {
    const data = await res.json();
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: modelUsed,
      provider: 'gemma',
      latencyMs: Math.round(performance.now() - callStart),
      success: true,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
    });
    return data.choices?.[0]?.message?.content || '';
  }

  // ── SSE streaming ──
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No stream body from Gemma (Together.ai)');

  const dec = new TextDecoder();
  let full = '';
  let buf = '';

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
    provider: 'gemma',
    latencyMs: Math.round(performance.now() - callStart),
    success: true,
  });
  return full;
}

// ─── Convenience Wrappers ─────────────────────────────────────────────────────

/**
 * Simple one-shot prompt via Gemma.
 * Drop-in replacement for generateWithTogether / generateWithGroq.
 */
export async function generateWithGemma(
  prompt: string,
  systemInstruction?: string,
  onToken?: (token: string) => void
): Promise<string> {
  const msgs: GemmaMessage[] = [];
  if (systemInstruction) msgs.push({ role: 'system', content: systemInstruction });
  msgs.push({ role: 'user', content: prompt });
  return callGemma(msgs, {}, onToken);
}

/**
 * Fast classification/extraction using the smaller Gemma 9B model.
 */
export async function callGemmaFast(
  messages: GemmaMessage[],
  options: Omit<GemmaOptions, 'model'> = {},
  onToken?: (token: string) => void
): Promise<string> {
  return callGemma(messages, { ...options, model: GEMMA_FAST_MODEL }, onToken);
}

/**
 * Structured JSON output from Gemma.
 * Wraps the prompt to encourage valid JSON responses.
 */
export async function callGemmaJSON<T = unknown>(
  prompt: string,
  systemInstruction?: string,
  options: Omit<GemmaOptions, 'stream'> = {}
): Promise<T> {
  const jsonSystemPrompt = (systemInstruction || '') +
    '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.';

  const result = await callGemma(
    [
      { role: 'system', content: jsonSystemPrompt.trim() },
      { role: 'user', content: prompt },
    ],
    { ...options, temperature: options.temperature ?? 0.2 }
  );

  // Strip markdown code fences if present
  const cleaned = result
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  return JSON.parse(cleaned) as T;
}

export default {
  callGemma,
  callGemmaFast,
  callGemmaJSON,
  generateWithGemma,
  isGemmaAvailable,
  GEMMA_DEFAULT_MODEL,
  GEMMA_FAST_MODEL,
};
