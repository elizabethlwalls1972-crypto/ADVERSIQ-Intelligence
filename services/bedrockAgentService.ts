/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI - AWS BEDROCK AGENT SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Client-side driver for AWS Bedrock Agents.
 * This replaces the Together.ai backend when Bedrock Agents are deployed.
 *
 * Architecture:
 *   Browser → BedrockAgentRuntime SDK → Bedrock Supervisor Agent
 *                                              ↓
 *                                    Action Groups (Lambda)
 *                                       ├─ bw-research-handler
 *                                       ├─ bw-analysis-handler
 *                                       ├─ bw-document-handler
 *                                       ├─ bw-risk-handler
 *                                       └─ bw-partner-handler
 *
 * Requirements (add to .env):
 *   VITE_AWS_REGION=us-east-1
 *   VITE_AWS_ACCESS_KEY_ID=<your-key>
 *   VITE_AWS_SECRET_ACCESS_KEY=<your-secret>
 *   VITE_BEDROCK_AGENT_ID=<agent-id from AWS console>
 *   VITE_BEDROCK_AGENT_ALIAS_ID=<alias-id from AWS console>
 *
 * Falls back to Together.ai if agent vars are not set.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { generateWithTogether, TOGETHER_SYSTEM_PROMPT } from './togetherAIService';
import { callAI } from './AIProviderOrchestrator';

// ─── Config ───────────────────────────────────────────────────────────────────

// ─── Session management ───────────────────────────────────────────────────────

/** Generate a session ID that persists for the lifetime of the page */
export const getAgentSessionId = (() => {
  let _id: string | null = null;
  return () => {
    if (!_id) _id = `bw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return _id;
  };
})();

export const resetAgentSession = () => {
  // Force a new session on next call by resetting the closure
  (getAgentSessionId as any)._id = null;
};

// ─── Core invoke ─────────────────────────────────────────────────────────────

export interface AgentInvokeOptions {
  /** Overrides default session; use to run isolated sub-tasks */
  sessionId?: string;
  /** If true, streams tokens via onToken callback */
  stream?: boolean;
  /** Called for each streamed token */
  onToken?: (token: string) => void;
  /** Max wait per chunk in ms (default 60000) */
  timeoutMs?: number;
}

/**
 * Invoke the Bedrock Supervisor Agent.
 * Routes through the multi-provider AI orchestrator (Ollama → Gemma → Groq → Together → OpenAI → Anthropic).
 */
export async function invokeBedrockAgent(
  inputText: string,
  options: AgentInvokeOptions = {}
): Promise<string> {
  try {
    const result = await callAI({
      messages: [
        { role: 'system', content: TOGETHER_SYSTEM_PROMPT },
        { role: 'user', content: inputText }
      ],
      taskType: 'general',
      temperature: 0.4,
    });
    if (options.onToken) options.onToken(result.text);
    return result.text;
  } catch {
    // Final fallback: direct Together.ai call
    return generateWithTogether(inputText, TOGETHER_SYSTEM_PROMPT, options.onToken);
  }
 }

// ─── Typed action shortcuts ──────────────────────────────────────────────────

/** Ask the agent to run the full autonomous pipeline for a case */
export async function runAutonomousPipeline(params: {
  organizationName: string;
  country: string;
  sector: string;
  objectives: string;
  documentTypes?: string[];
  onToken?: (t: string) => void;
}): Promise<string> {
  const prompt = `Run the full BW NEXUS autonomous pipeline for this case:\n\nOrganization: ${params.organizationName}\nCountry: ${params.country}\nSector: ${params.sector}\nObjectives: ${params.objectives}\n${params.documentTypes?.length ? `Priority Documents: ${params.documentTypes.join(', ')}` : ''}`;
  try {
    const result = await callAI({
      messages: [
        { role: 'system', content: TOGETHER_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      taskType: 'long-generation',
      temperature: 0.4,
    });
    if (params.onToken) params.onToken(result.text);
    return result.text;
  } catch {
    return generateWithTogether(prompt, TOGETHER_SYSTEM_PROMPT, params.onToken);
  }
}

/** Quick single-question chat via the agent */
export async function agentChat(
  message: string,
  _sessionId: string,
  onToken?: (t: string) => void
): Promise<string> {
  try {
    const result = await callAI({
      messages: [
        { role: 'system', content: TOGETHER_SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      taskType: 'quick-analysis',
      temperature: 0.5,
    });
    if (onToken) onToken(result.text);
    return result.text;
  } catch {
    return generateWithTogether(message, TOGETHER_SYSTEM_PROMPT, onToken);
  }
}

export default {
  invokeBedrockAgent,
  runAutonomousPipeline,
  agentChat,
  getAgentSessionId,
  resetAgentSession,
};
