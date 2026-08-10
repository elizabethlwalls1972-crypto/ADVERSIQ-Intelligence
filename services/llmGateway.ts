/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — LLM GATEWAY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Unified gateway for all LLM calls within the Omni-Node architecture.
 * Routes through the existing AIProviderOrchestrator, ensuring every new
 * module (QuorumGatekeeper, AutonomousSwarm, AlgorithmicMutator, etc.)
 * uses the same provider cascade and fallback logic as Susan's brain.
 *
 * This replaces the need for each module to import provider-specific services.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { callGemma, type GemmaMessage } from '../gemmaService';
import { monitoringService } from './MonitoringService';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LLMGatewayOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  systemInstruction?: string;
  timeoutMs?: number;
}

// ─── Core Gateway Function ──────────────────────────────────────────────────

/**
 * Generate a text response from the best available LLM provider.
 * This is the single entry point for all Omni-Node modules.
 */
export async function generateLLMPrompt(
  prompt: string,
  options: LLMGatewayOptions = {}
): Promise<string> {
  const {
    temperature = 0.4,
    maxTokens = 4096,
    systemInstruction,
    timeoutMs = 30000,
    jsonMode = false,
  } = options;

  const startTime = performance.now();

  const messages: GemmaMessage[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  if (jsonMode) {
    messages.push({ role: 'user', content: prompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanation.' });
  } else {
    messages.push({ role: 'user', content: prompt });
  }

  try {
    const result: string = await Promise.race([
      callGemma(messages, { temperature, maxTokens }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`LLM Gateway timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);

    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'llm-gateway',
      provider: 'omni-node',
      latencyMs: Math.round(performance.now() - startTime),
      success: true,
    });

    return result;
  } catch (err) {
    monitoringService.trackAICall({
      timestamp: new Date().toISOString(),
      model: 'llm-gateway',
      provider: 'omni-node',
      latencyMs: Math.round(performance.now() - startTime),
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });

    console.error('[LLM Gateway] All providers failed:', err instanceof Error ? err.message : err);
    throw err;
  }
}

/**
 * Generate a structured JSON response from the LLM.
 */
export async function generateLLMJSON<T = unknown>(
  prompt: string,
  options: Omit<LLMGatewayOptions, 'jsonMode'> = {}
): Promise<T> {
  const raw = await generateLLMPrompt(prompt, { ...options, jsonMode: true });

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Attempt to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error(`LLM Gateway: Failed to parse JSON response: ${cleaned.slice(0, 200)}`);
  }
}

export default { generateLLMPrompt, generateLLMJSON };
