/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ NEXUS AI — OLLAMA LOCAL MODEL SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Runs AI inference locally via Ollama — zero cost, zero API keys, full privacy.
 * Ollama must be installed and running: https://ollama.com
 *
 * Default endpoint: http://localhost:11434
 * Default model:    llama3.1:8b  (configurable via OLLAMA_MODEL env var)
 *
 * Install & run:
 *   1. Download Ollama from https://ollama.com
 *   2. ollama pull llama3.1:8b
 *   3. ollama serve   (runs on port 11434 by default)
 *
 * The orchestrator will auto-detect Ollama availability and fall back to
 * cloud providers (Gemma → Groq → Together → OpenAI → Anthropic) if
 * Ollama is not running.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { monitoringService } from './MonitoringService';

// ─── Configuration ────────────────────────────────────────────────────────────

const OLLAMA_BASE_URL = typeof process !== 'undefined'
  ? (process.env?.OLLAMA_BASE_URL || 'http://localhost:11434')
  : 'http://localhost:11434';

const OLLAMA_DEFAULT_MODEL = typeof process !== 'undefined'
  ? (process.env?.OLLAMA_MODEL || 'llama3.1:8b')
  : 'llama3.1:8b';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
}

interface OllamaChatResponse {
  message: { role: string; content: string };
  done: boolean;
  total_duration?: number;
  eval_count?: number;
  prompt_eval_count?: number;
}

// ─── Availability Detection ───────────────────────────────────────────────────

let _available: boolean | null = null;
let _lastCheck = 0;
const CHECK_INTERVAL_MS = 30_000; // Re-check every 30 seconds

/**
 * Ping Ollama to see if it's running locally.
 * Caches the result for 30 seconds to avoid hammering.
 */
export async function checkOllamaAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_available !== null && (now - _lastCheck) < CHECK_INTERVAL_MS) {
    return _available;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    _available = res.ok;
    _lastCheck = now;

    if (_available) {
      const data = await res.json();
      const models = data.models?.map((m: { name: string }) => m.name) || [];
      console.log(`[Ollama] Available with models: ${models.join(', ') || 'none'}`);
    }

    return _available;
  } catch {
    _available = false;
    _lastCheck = now;
    return false;
  }
}

/**
 * Synchronous check using cached availability.
 * Use checkOllamaAvailable() for a fresh async check.
 */
export function isOllamaAvailable(): boolean {
  return _available === true;
}

/** Reset cached availability (e.g. after user starts Ollama). */
export function resetOllamaCache(): void {
  _available = null;
  _lastCheck = 0;
}

// ─── Core API Call ────────────────────────────────────────────────────────────

/**
 * Call Ollama's local chat API.
 * Compatible with the OpenAI chat format for easy integration.
 */
export async function callOllama(
  messages: OllamaMessage[],
  options: OllamaOptions = {},
  onToken?: (token: string) => void
): Promise<string> {
  const model = options.model || OLLAMA_DEFAULT_MODEL;
  const callStart = performance.now();
  const useStream = Boolean(onToken);

  const requestBody = {
    model,
    messages,
    stream: useStream,
    options: {
      num_predict: options.maxTokens ?? 8192,
      temperature: options.temperature ?? 0.4,
      top_p: options.topP ?? 0.9,
      top_k: options.topK ?? 50,
    },
  };

  let res: Response;
  try {
    res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    // Ollama not running or network error
    _available = false;
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model,
      provider: 'ollama',
      latencyMs: Math.round(performance.now() - callStart),
      success: false,
      error: err instanceof Error ? err.message : 'Connection failed',
    });
    throw new Error(`Ollama not reachable at ${OLLAMA_BASE_URL}: ${err instanceof Error ? err.message : 'Connection failed'}`);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model,
      provider: 'ollama',
      latencyMs: Math.round(performance.now() - callStart),
      success: false,
      error: `${res.status}: ${errText.slice(0, 200)}`,
    });
    throw new Error(`Ollama ${res.status}: ${errText.slice(0, 200)}`);
  }

  // ── Non-streaming ──
  if (!useStream) {
    const data: OllamaChatResponse = await res.json();
    const text = data.message?.content || '';
    const tokensUsed = (data.eval_count || 0) + (data.prompt_eval_count || 0);

    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model,
      provider: 'ollama',
      latencyMs: Math.round(performance.now() - callStart),
      success: true,
      inputTokens: data.prompt_eval_count,
      outputTokens: data.eval_count,
    });

    return text;
  }

  // ── Streaming (NDJSON) ──
  const reader = res.body?.getReader();
  if (!reader) throw new Error('No stream body from Ollama');

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
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const chunk: OllamaChatResponse = JSON.parse(trimmed);
        const tok = chunk.message?.content || '';
        if (tok) {
          full += tok;
          onToken!(tok);
        }
      } catch {
        /* partial JSON chunk */
      }
    }
  }

  monitoringService.trackAICall({
    timestamp: new Date().toISOString(),
    model,
    provider: 'ollama',
    latencyMs: Math.round(performance.now() - callStart),
    success: true,
  });

  return full;
}

// ─── Convenience Wrappers ─────────────────────────────────────────────────────

/**
 * Simple one-shot prompt via Ollama.
 * Drop-in replacement for generateWithGemma / generateWithTogether.
 */
export async function generateWithOllama(
  prompt: string,
  systemInstruction?: string,
  onToken?: (token: string) => void
): Promise<string> {
  const msgs: OllamaMessage[] = [];
  if (systemInstruction) msgs.push({ role: 'system', content: systemInstruction });
  msgs.push({ role: 'user', content: prompt });
  return callOllama(msgs, {}, onToken);
}

/**
 * Structured JSON output from Ollama.
 * Wraps the prompt to encourage valid JSON responses.
 */
export async function callOllamaJSON<T = unknown>(
  prompt: string,
  systemInstruction?: string,
  options: Omit<OllamaOptions, 'stream'> = {}
): Promise<T> {
  const jsonSystemPrompt = (systemInstruction || '') +
    '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.';

  const result = await callOllama(
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
  callOllama,
  callOllamaJSON,
  generateWithOllama,
  checkOllamaAvailable,
  isOllamaAvailable,
  resetOllamaCache,
  OLLAMA_BASE_URL,
  OLLAMA_DEFAULT_MODEL,
};
