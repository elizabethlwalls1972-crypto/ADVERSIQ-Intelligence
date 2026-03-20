import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ControlMode, LearningHint } from '../../shared/cognitiveControl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LEARNING_FILE = path.join(__dirname, '..', 'data', 'control-learning.jsonl');
const MAX_RECORDS = 800;

interface ControlOutcome {
  requestId: string;
  timestamp: string;
  mode: ControlMode;
  success: boolean;
  latencyMs: number;
  provider?: string;
  errorType?: string;
}

const parseLine = (line: string): ControlOutcome | null => {
  try {
    const parsed = JSON.parse(line) as ControlOutcome;
    if (!parsed || typeof parsed.mode !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
};

const scoreMode = (rows: ControlOutcome[], mode: ControlMode): number => {
  const subset = rows.filter((r) => r.mode === mode);
  if (subset.length < 6) return -1;

  const successRate = subset.filter((r) => r.success).length / subset.length;
  const avgLatency = subset.reduce((sum, r) => sum + Math.max(r.latencyMs, 1), 0) / subset.length;
  const latencyScore = Math.max(0, Math.min(1, 12000 / avgLatency));

  return successRate * 0.78 + latencyScore * 0.22;
};

export class AdaptiveControlLearning {
  static async record(outcome: ControlOutcome): Promise<void> {
    const dir = path.dirname(LEARNING_FILE);
    await fs.mkdir(dir, { recursive: true });
    const line = `${JSON.stringify(outcome)}\n`;
    await fs.appendFile(LEARNING_FILE, line, 'utf8');

    // Periodic compaction keeps file bounded.
    const content = await fs.readFile(LEARNING_FILE, 'utf8').catch(() => '');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= MAX_RECORDS) return;
    const trimmed = lines.slice(-MAX_RECORDS).join('\n') + '\n';
    await fs.writeFile(LEARNING_FILE, trimmed, 'utf8');
  }

  static async getHint(): Promise<LearningHint | null> {
    const content = await fs.readFile(LEARNING_FILE, 'utf8').catch(() => '');
    const rows = content
      .split('\n')
      .filter((l) => l.trim().length > 0)
      .map(parseLine)
      .filter((r): r is ControlOutcome => Boolean(r));

    const recent = rows.slice(-220);
    if (recent.length < 25) return null;

    const candidates: ControlMode[] = ['reactive', 'agentic_lite', 'agentic_full', 'deliberative'];
    const scored = candidates
      .map((mode) => ({ mode, score: scoreMode(recent, mode) }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) return null;

    const best = scored[0];
    const second = scored[1]?.score ?? Math.max(best.score - 0.08, 0);
    const confidence = Math.max(0.35, Math.min(0.95, 0.5 + (best.score - second)));

    return {
      preferredMode: best.mode,
      confidence,
      reason: `historical_winrate=${best.score.toFixed(3)} from ${recent.length} recent turns`,
    };
  }
}
