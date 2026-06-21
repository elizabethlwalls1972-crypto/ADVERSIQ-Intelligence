export type GemmaRole = 'system' | 'user' | 'assistant';

export interface GemmaMessage {
  role: GemmaRole;
  content: string;
}

export interface GemmaOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  thinkingBudget?: number;
}

const API_BASE = '/api';

function messagesToPrompt(messages: GemmaMessage[]): string {
  return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n');
}

async function postChat(prompt: string, options: GemmaOptions = {}): Promise<string> {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: prompt,
      model: options.model,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      thinkingBudget: options.thinkingBudget,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemma-compatible backend request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.text || data.response || data.message || '';
}

export function isGemmaAvailable(): boolean {
  return true;
}

export async function callGemma(messages: GemmaMessage[], options: GemmaOptions = {}): Promise<string> {
  return postChat(messagesToPrompt(messages), options);
}

export async function callGeminiThinking(messages: GemmaMessage[], options: GemmaOptions = {}): Promise<string> {
  return postChat(messagesToPrompt(messages), { ...options, model: options.model || 'gemini-thinking' });
}

export async function callGemmaFast(messages: GemmaMessage[], options: GemmaOptions = {}): Promise<string> {
  return postChat(messagesToPrompt(messages), { ...options, model: options.model || 'gemma-fast' });
}

export async function callGemmaJSON<T>(prompt: string, options: GemmaOptions = {}): Promise<T> {
  const text = await postChat(`${prompt}\n\nReturn only valid JSON.`, options);
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return JSON.parse(match ? match[0] : text) as T;
}
