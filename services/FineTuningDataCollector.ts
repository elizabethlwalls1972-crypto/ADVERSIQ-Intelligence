/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 11: FINE-TUNING DATA COLLECTOR
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Logs every interaction as {input, output, feedback, metadata} in JSONL format.
 * Supports export for LoRA/QLoRA fine-tuning, DPO preference pairs,
 * and RLHF reward model training.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TrainingExample {
  id: string;
  timestamp: string;
  input: {
    messages: Array<{ role: string; content: string }>;
    systemPrompt?: string;
  };
  output: string;
  feedback?: {
    rating: 'positive' | 'negative' | 'neutral';
    comment?: string;
    correctedOutput?: string;
  };
  metadata: {
    userId?: string;
    model?: string;
    tokensUsed?: number;
    latencyMs?: number;
    category?: string;
    confidence?: number;
    brainPhases?: string[];
  };
}

export interface DPOPair {
  prompt: string;
  chosen: string;
  rejected: string;
}

export interface FineTuneExportOptions {
  format: 'openai' | 'alpaca' | 'sharegpt' | 'dpo';
  minRating?: 'positive' | 'neutral';
  maxExamples?: number;
  since?: string;
  categories?: string[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'server', 'data');
const TRAINING_FILE = path.join(DATA_DIR, 'training-data.jsonl');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback-pairs.jsonl');

// ─── Ensure directory ───────────────────────────────────────────────────────

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ─── Collect Training Example ───────────────────────────────────────────────

export function collectExample(example: Omit<TrainingExample, 'id' | 'timestamp'>): TrainingExample {
  ensureDir();

  const full: TrainingExample = {
    ...example,
    id: `train_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  fs.appendFileSync(TRAINING_FILE, JSON.stringify(full) + '\n');
  return full;
}

// ─── Record User Feedback ───────────────────────────────────────────────────

export function recordFeedback(
  exampleId: string,
  rating: 'positive' | 'negative' | 'neutral',
  comment?: string,
  correctedOutput?: string
): boolean {
  ensureDir();

  // Read all examples, find the one to update
  if (!fs.existsSync(TRAINING_FILE)) return false;

  const lines = fs.readFileSync(TRAINING_FILE, 'utf-8').split('\n').filter(Boolean);
  let found = false;

  const updated = lines.map(line => {
    try {
      const example: TrainingExample = JSON.parse(line);
      if (example.id === exampleId) {
        found = true;
        example.feedback = { rating, comment, correctedOutput };
        return JSON.stringify(example);
      }
      return line;
    } catch {
      return line;
    }
  });

  if (found) {
    fs.writeFileSync(TRAINING_FILE, updated.join('\n') + '\n');

    // Also store as DPO pair if negative feedback with correction
    if (rating === 'negative' && correctedOutput) {
      const original = JSON.parse(lines.find(l => l.includes(exampleId)) || '{}') as TrainingExample;
      const dpoPair: DPOPair = {
        prompt: original.input.messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        chosen: correctedOutput,
        rejected: original.output,
      };
      fs.appendFileSync(FEEDBACK_FILE, JSON.stringify(dpoPair) + '\n');
    }
  }

  return found;
}

// ─── Export for Fine-Tuning ─────────────────────────────────────────────────

export function exportForFineTuning(options: FineTuneExportOptions): string[] {
  ensureDir();
  if (!fs.existsSync(TRAINING_FILE)) return [];

  const lines = fs.readFileSync(TRAINING_FILE, 'utf-8').split('\n').filter(Boolean);
  let examples: TrainingExample[] = [];

  for (const line of lines) {
    try {
      examples.push(JSON.parse(line));
    } catch {
      // Skip malformed
    }
  }

  // Apply filters
  if (options.since) {
    examples = examples.filter(e => e.timestamp >= options.since!);
  }
  if (options.categories?.length) {
    examples = examples.filter(e => options.categories!.includes(e.metadata.category || ''));
  }
  if (options.minRating === 'positive') {
    examples = examples.filter(e => e.feedback?.rating === 'positive');
  } else if (options.minRating === 'neutral') {
    examples = examples.filter(e => e.feedback?.rating !== 'negative');
  }
  if (options.maxExamples) {
    examples = examples.slice(-options.maxExamples);
  }

  // Format output
  switch (options.format) {
    case 'openai':
      return examples.map(e => JSON.stringify({
        messages: [
          ...(e.input.systemPrompt ? [{ role: 'system', content: e.input.systemPrompt }] : []),
          ...e.input.messages,
          { role: 'assistant', content: e.feedback?.correctedOutput || e.output },
        ],
      }));

    case 'alpaca':
      return examples.map(e => JSON.stringify({
        instruction: e.input.messages.find(m => m.role === 'user')?.content || '',
        input: e.input.systemPrompt || '',
        output: e.feedback?.correctedOutput || e.output,
      }));

    case 'sharegpt':
      return examples.map(e => JSON.stringify({
        conversations: [
          ...(e.input.systemPrompt ? [{ from: 'system', value: e.input.systemPrompt }] : []),
          ...e.input.messages.map(m => ({ from: m.role === 'user' ? 'human' : 'gpt', value: m.content })),
          { from: 'gpt', value: e.feedback?.correctedOutput || e.output },
        ],
      }));

    case 'dpo':
      if (!fs.existsSync(FEEDBACK_FILE)) return [];
      return fs.readFileSync(FEEDBACK_FILE, 'utf-8').split('\n').filter(Boolean);

    default:
      return examples.map(e => JSON.stringify(e));
  }
}

// ─── Statistics ─────────────────────────────────────────────────────────────

export function getCollectionStats(): {
  totalExamples: number;
  withFeedback: number;
  positiveRatio: number;
  categories: Record<string, number>;
  modelsUsed: Record<string, number>;
  dpoPairs: number;
} {
  ensureDir();
  if (!fs.existsSync(TRAINING_FILE)) {
    return { totalExamples: 0, withFeedback: 0, positiveRatio: 0, categories: {}, modelsUsed: {}, dpoPairs: 0 };
  }

  const lines = fs.readFileSync(TRAINING_FILE, 'utf-8').split('\n').filter(Boolean);
  const examples: TrainingExample[] = [];

  for (const line of lines) {
    try { examples.push(JSON.parse(line)); } catch { /* skip */ }
  }

  const withFeedback = examples.filter(e => e.feedback);
  const positive = withFeedback.filter(e => e.feedback?.rating === 'positive').length;

  const categories: Record<string, number> = {};
  const modelsUsed: Record<string, number> = {};
  for (const e of examples) {
    const cat = e.metadata.category || 'uncategorized';
    categories[cat] = (categories[cat] || 0) + 1;
    const model = e.metadata.model || 'unknown';
    modelsUsed[model] = (modelsUsed[model] || 0) + 1;
  }

  let dpoPairs = 0;
  if (fs.existsSync(FEEDBACK_FILE)) {
    dpoPairs = fs.readFileSync(FEEDBACK_FILE, 'utf-8').split('\n').filter(Boolean).length;
  }

  return {
    totalExamples: examples.length,
    withFeedback: withFeedback.length,
    positiveRatio: withFeedback.length > 0 ? positive / withFeedback.length : 0,
    categories,
    modelsUsed,
    dpoPairs,
  };
}
