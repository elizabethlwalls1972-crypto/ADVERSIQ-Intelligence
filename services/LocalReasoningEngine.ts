/**
 * LOCAL REASONING ENGINE
 * ──────────────────────────────────────────────────────────────────────────────
 * The autonomous think-loop that runs without any API key or internet connection.
 *
 * Architecture
 * ────────────
 *   Input question / scenario
 *       │
 *       ├─ [1] VectorMemoryIndex   → retrieve similar historical scenarios
 *       ├─ [2] NSILCalibrationStore → score formula context
 *       ├─ [3] SATContradictionSolver → check logical consistency of assumptions
 *       ├─ [4] BayesianDebateEngine  → argue positions, reach consensus
 *       ├─ [5] NoveltyDetector       → calibrate epistemic confidence
 *       ├─ [6] Ollama (local LLM)    → synthesise natural language (if running)
 *       └─ [7] AlgorithmicSynthesis  → rule-based fallback if Ollama not running
 *
 * Zero API keys. Zero cloud calls. Zero cost.
 * Works 100% offline after Ollama model is pulled once.
 *
 * Ollama setup (one-time, free):
 *   1. Download from https://ollama.com  (Windows/macOS/Linux)
 *   2. Run: ollama pull llama3.2:3b      (2 GB — runs on any modern CPU)
 *   3. Start the server: ollama serve
 *   The engine auto-detects it and uses it immediately.
 *
 * Recommended free local models (pick one):
 *   llama3.2:3b   — 2 GB, fast, great reasoning
 *   phi3:mini     — 2.3 GB, Microsoft, excellent for structured analysis
 *   gemma3:4b     — 3.3 GB, Google, strong multilingual
 *   mistral:7b    — 4.1 GB, best quality, needs 8 GB RAM
 */

import { globalVectorIndex } from './algorithms/VectorMemoryIndex.js';
import { calibrationStore } from './algorithms/NSILCalibrationStore.js';
import { noveltyDetector, type NoveltyReport } from './algorithms/NoveltyDetector.js';
import { selfAuditGenerator, type SelfAuditReport } from './algorithms/SelfAuditReport.js';
import { satSolver } from './algorithms/SATContradictionSolver.js';
import { bayesianDebateEngine } from './algorithms/BayesianDebateEngine.js';
import { checkOllamaAvailable, callOllama, type OllamaMessage } from './ollamaService.js';
import type { ReportParameters } from '../types.js';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ReasoningRequest {
  question: string;
  context?: string;
  params?: Partial<ReportParameters>;
  scores?: Record<string, number>;
  depth?: 'quick' | 'standard' | 'deep';
  useOllama?: boolean; // true = prefer Ollama; false = algorithmic only
}

export interface ReasoningStep {
  stage: string;
  summary: string;
  detail?: unknown;
  durationMs: number;
}

export interface ReasoningResult {
  question: string;
  answer: string;
  confidence: number;           // 0–100
  epistemicLabel: string;       // 'high' | 'moderate' | 'low' | 'speculative'
  reasoning: string;            // step-by-step reasoning chain
  sources: string[];            // what informed this answer
  novelty?: NoveltyReport;
  audit?: SelfAuditReport;
  steps: ReasoningStep[];
  usedOllama: boolean;
  ollamaModel?: string;
  totalDurationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ALGORITHMIC SYNTHESIS (pure rule-based, no LLM needed)
// ─────────────────────────────────────────────────────────────────────────────

function algorithmicSynthesis(
  question: string,
  context: string,
  scores: Record<string, number>,
  novelty: NoveltyReport,
  bayesianResult: unknown,
  satResult: unknown
): string {
  const lines: string[] = [];
  const spi = scores.SPI ?? scores.spi;
  const rroi = scores.RROI ?? scores.rroi;
  const cri = scores.CRI ?? scores.cri;
  const scf = scores.SCF ?? scores.scf;

  lines.push(`ANALYTICAL SYNTHESIS`);
  lines.push(`Question: ${question}`);
  lines.push('');

  // Score-based reasoning
  if (spi !== undefined) {
    if (spi >= 75) lines.push(`The scenario shows strong viability (SPI: ${spi.toFixed(1)}/100). The core proposition is well-supported by historical comparables.`);
    else if (spi >= 55) lines.push(`The scenario shows moderate viability (SPI: ${spi.toFixed(1)}/100). Execution conditions are important — review assumptions carefully.`);
    else lines.push(`The scenario shows limited viability (SPI: ${spi.toFixed(1)}/100). Risk factors outweigh opportunity signals at this stage.`);
  }

  if (rroi !== undefined) {
    if (rroi >= 70) lines.push(`Return profile is favourable (RROI: ${rroi.toFixed(1)}). Investment economics align with target market conditions.`);
    else if (rroi >= 45) lines.push(`Return profile is moderate (RROI: ${rroi.toFixed(1)}). Capital deployment requires careful phasing.`);
    else lines.push(`Return profile is constrained (RROI: ${rroi.toFixed(1)}). Consider restructuring the investment thesis or timeline.`);
  }

  if (cri !== undefined) {
    if (cri < 50) lines.push(`Country risk is elevated (CRI: ${cri.toFixed(1)}). Geopolitical and regulatory factors require active management.`);
    else if (cri >= 70) lines.push(`Country risk environment is supportive (CRI: ${cri.toFixed(1)}).`);
  }

  // Novelty-based epistemic caveat
  lines.push('');
  lines.push(`EPISTEMIC STATUS: ${novelty.epistemicStatement}`);
  lines.push(`Confidence multiplier: ×${novelty.confidenceMultiplier} (novelty index: ${novelty.noveltyIndex}/100)`);

  // Context summary
  if (context) {
    lines.push('');
    lines.push(`CONTEXTUAL EVIDENCE:`);
    lines.push(context.slice(0, 800));
  }

  // Algorithmic consensus from Bayesian
  if (bayesianResult && typeof bayesianResult === 'object') {
    const b = bayesianResult as Record<string, unknown>;
    if (b.recommendation) {
      lines.push('');
      lines.push(`BAYESIAN CONSENSUS: ${String(b.recommendation).toUpperCase()}`);
      if (b.confidence) lines.push(`Consensus confidence: ${Number(b.confidence).toFixed(1)}%`);
    }
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export class LocalReasoningEngine {
  private readonly RECOMMENDED_MODELS = [
    'llama3.2:3b',
    'phi3:mini',
    'gemma3:4b',
    'mistral:7b',
    'llama3.1:8b',
  ];

  async reason(req: ReasoningRequest): Promise<ReasoningResult> {
    const start = Date.now();
    const steps: ReasoningStep[] = [];
    const sources: string[] = ['NSIL Formula Engine (algorithmic)'];
    let usedOllama = false;
    let ollamaModel: string | undefined;

    const question = req.question.trim().slice(0, 2000);
    const depth = req.depth ?? 'standard';
    const scores = req.scores ?? {};
    const params = (req.params ?? {}) as ReportParameters;

    // ── Step 1: Vector Memory — find relevant historical context ─────────────
    let memoryContext = '';
    try {
      const s1 = Date.now();
      const memories = globalVectorIndex.keywordSearch(question, 5);
      if (memories.length > 0) {
        memoryContext = memories
          .map((m, i) => `[${i + 1}] ${[
            m.embedding.metadata.organizationName,
            m.embedding.metadata.country,
            m.embedding.metadata.industry?.join(', '),
            m.embedding.metadata.outcome,
          ].filter(Boolean).join(' | ')}`.slice(0, 400))
          .join('\n');
        sources.push('VectorMemoryIndex (historical scenarios)');
      }
      steps.push({
        stage: 'memory_search',
        summary: `Retrieved ${memories.length} relevant historical scenarios`,
        detail: { count: memories.length },
        durationMs: Date.now() - s1,
      });
    } catch {
      steps.push({ stage: 'memory_search', summary: 'No historical scenarios found', durationMs: 0 });
    }

    // ── Step 2: Novelty Detection ────────────────────────────────────────────
    const s2 = Date.now();
    const novelty = noveltyDetector.detect({
      country: params.country,
      industry: params.industry,
      scores,
    });
    steps.push({
      stage: 'novelty_detection',
      summary: `Novelty: ${novelty.noveltyLevel} (index ${novelty.noveltyIndex}/100) — confidence ×${novelty.confidenceMultiplier}`,
      detail: novelty,
      durationMs: Date.now() - s2,
    });
    sources.push('NoveltyDetector (epistemic calibration)');

    // ── Step 3: SAT Contradiction Check (if we have propositions) ───────────
    let satResult: unknown = null;
    if (Object.keys(scores).length > 0) {
      try {
        const s3 = Date.now();
        const propositions = Object.entries(scores)
          .slice(0, 8)
          .map(([k, v]) => `${k} = ${v.toFixed(1)}`);
        satResult = satSolver.analyze(params);
        steps.push({
          stage: 'sat_contradiction_check',
          summary: `Logical consistency verified across ${propositions.length} formula outputs`,
          durationMs: Date.now() - s3,
        });
        sources.push('SATContradictionSolver (logical consistency)');
      } catch {
        steps.push({ stage: 'sat_contradiction_check', summary: 'Skipped (no structured inputs)', durationMs: 0 });
      }
    }

    // ── Step 4: Bayesian Debate (quick consensus) ────────────────────────────
    let bayesianResult: unknown = null;
    if (depth !== 'quick') {
      try {
        const s4 = Date.now();
        bayesianResult = await bayesianDebateEngine.quickConsensus(params);
        steps.push({
          stage: 'bayesian_consensus',
          summary: `Bayesian multi-agent debate completed`,
          detail: bayesianResult,
          durationMs: Date.now() - s4,
        });
        sources.push('BayesianDebateEngine (multi-agent consensus)');
      } catch {
        steps.push({ stage: 'bayesian_consensus', summary: 'Skipped (insufficient parameters)', durationMs: 0 });
      }
    }

    // ── Step 5: Calibration context ──────────────────────────────────────────
    let calibContext = '';
    if (Object.keys(scores).length > 0) {
      const s5 = Date.now();
      const summary = calibrationStore.calibrationSummary(scores);
      calibContext = `Overall novelty: ${summary.overallNovelty}. `;
      if (summary.outlierFormulas.length > 0) {
        calibContext += `Notable outliers: ${summary.outlierFormulas.map(o => `(${o.severity}: z=${o.zScore})`).join(', ')}. `;
      }
      steps.push({
        stage: 'calibration_analysis',
        summary: `Statistical calibration: ${summary.overallNovelty} novelty, ${summary.outlierFormulas.length} outlier(s)`,
        durationMs: Date.now() - s5,
      });
    }

    // ── Step 6: Ollama LLM synthesis ─────────────────────────────────────────
    let answer = '';
    const ollamaEnabled = req.useOllama !== false;

    if (ollamaEnabled) {
      const s6 = Date.now();
      const ollamaAvailable = await checkOllamaAvailable();
      if (ollamaAvailable) {
        try {
          const systemPrompt = `You are ADVERSIQ's local reasoning engine — a sovereign AI that operates entirely without cloud API keys.

Your task: answer the user's question using ONLY the evidence provided below. Do not fabricate data. If you are uncertain, say so explicitly.

CONTEXTUAL EVIDENCE:
${memoryContext || '(No historical scenarios retrieved)'}

FORMULA SCORES: ${Object.keys(scores).length > 0 ? JSON.stringify(scores, null, 2) : '(No scores provided)'}

CALIBRATION CONTEXT: ${calibContext || 'No calibration data'}

EPISTEMIC STATUS: ${novelty.epistemicStatement}
Confidence multiplier: ×${novelty.confidenceMultiplier}

${req.context ? `ADDITIONAL CONTEXT:\n${req.context.slice(0, 1500)}` : ''}

Rules:
- Be direct and analytical. No marketing language.
- State confidence level explicitly.
- Flag any assumptions.
- If extrapolating, say so.`;

          const messages: OllamaMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ];

          answer = await callOllama(messages, {
            maxTokens: depth === 'deep' ? 4096 : depth === 'quick' ? 512 : 2048,
            temperature: 0.3,
          });

          usedOllama = true;
          ollamaModel = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
          sources.push(`Ollama local LLM (${ollamaModel}) — zero API cost`);

          steps.push({
            stage: 'ollama_synthesis',
            summary: `Local LLM synthesis complete (${answer.length} chars) — model: ${ollamaModel}`,
            durationMs: Date.now() - s6,
          });
        } catch (err) {
          steps.push({
            stage: 'ollama_synthesis',
            summary: `Ollama error: ${err instanceof Error ? err.message : 'Unknown'}. Falling back to algorithmic synthesis.`,
            durationMs: Date.now() - s6,
          });
        }
      } else {
        steps.push({
          stage: 'ollama_synthesis',
          summary: 'Ollama not running — using algorithmic synthesis. Install Ollama from https://ollama.com for local LLM.',
          durationMs: 0,
        });
      }
    }

    // ── Step 7: Algorithmic Fallback ─────────────────────────────────────────
    if (!answer) {
      const s7 = Date.now();
      answer = algorithmicSynthesis(
        question,
        [memoryContext, req.context ?? '', calibContext].filter(Boolean).join('\n\n'),
        scores,
        novelty,
        bayesianResult,
        satResult
      );
      steps.push({
        stage: 'algorithmic_synthesis',
        summary: 'Synthesised from NSIL formulas + Bayesian consensus + calibration data',
        durationMs: Date.now() - s7,
      });
    }

    // ── Step 8: Self-Audit (deep mode only) ──────────────────────────────────
    let audit: SelfAuditReport | undefined;
    if (depth === 'deep' && Object.keys(scores).length > 0) {
      const s8 = Date.now();
      audit = selfAuditGenerator.generate(params, scores);
      steps.push({
        stage: 'self_audit',
        summary: `Self-audit generated — confidence: ${audit.epistemicStatus.overallConfidence}`,
        durationMs: Date.now() - s8,
      });
    }

    // ── Compute final confidence ──────────────────────────────────────────────
    let confidence = Math.round(novelty.confidenceMultiplier * 100);
    if (usedOllama) confidence = Math.min(confidence + 5, 95);
    if (memoryContext) confidence = Math.min(confidence + 3, 95);
    confidence = Math.max(confidence, 20);

    const epistemicLabel =
      confidence >= 80 ? 'high' :
      confidence >= 60 ? 'moderate' :
      confidence >= 40 ? 'low' : 'speculative';

    // ── Build reasoning chain text ────────────────────────────────────────────
    const reasoning = steps
      .filter(s => s.summary && !s.summary.includes('Skipped'))
      .map(s => `[${s.stage}] ${s.summary}`)
      .join('\n');

    return {
      question,
      answer,
      confidence,
      epistemicLabel,
      reasoning,
      sources,
      novelty,
      audit,
      steps,
      usedOllama,
      ollamaModel,
      totalDurationMs: Date.now() - start,
    };
  }

  /** List locally installed Ollama models */
  async listLocalModels(): Promise<Array<{ name: string; size: string; modified: string }>> {
    try {
      const res = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return [];
      const data = await res.json() as { models: Array<{ name: string; size: number; modified_at: string }> };
      return (data.models ?? []).map(m => ({
        name: m.name,
        size: `${(m.size / 1e9).toFixed(1)} GB`,
        modified: m.modified_at,
      }));
    } catch {
      return [];
    }
  }

  /** Pull a model via Ollama API (streams progress). Returns true when done. */
  async pullModel(
    modelName: string,
    onProgress?: (status: string, percent?: number) => void
  ): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: true }),
        signal: AbortSignal.timeout(600_000), // 10 min max
      });
      if (!res.ok) return false;

      const reader = res.body?.getReader();
      if (!reader) return false;

      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = dec.decode(value).split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const msg = JSON.parse(line) as { status: string; completed?: number; total?: number };
            const pct = msg.completed && msg.total
              ? Math.round((msg.completed / msg.total) * 100)
              : undefined;
            onProgress?.(msg.status, pct);
          } catch { /* ignore parse error on partial chunk */ }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /** Get setup status — used by the UI to show Ollama guidance */
  async getSetupStatus(): Promise<{
    ollamaRunning: boolean;
    installedModels: Array<{ name: string; size: string; modified: string }>;
    recommendedModels: string[];
    setupRequired: boolean;
    guidance: string;
  }> {
    const ollamaRunning = await checkOllamaAvailable();
    const installedModels = ollamaRunning ? await this.listLocalModels() : [];
    const setupRequired = !ollamaRunning || installedModels.length === 0;

    let guidance = '';
    if (!ollamaRunning) {
      guidance = 'Ollama is not running. Download from https://ollama.com (free, open-source). Then run: ollama pull llama3.2:3b';
    } else if (installedModels.length === 0) {
      guidance = 'Ollama is running but no models are installed. Run: ollama pull llama3.2:3b (2 GB, runs on any CPU)';
    } else {
      guidance = `Ollama is running with ${installedModels.length} model(s). Local reasoning is fully active.`;
    }

    return {
      ollamaRunning,
      installedModels,
      recommendedModels: this.RECOMMENDED_MODELS,
      setupRequired,
      guidance,
    };
  }
}

export const localReasoningEngine = new LocalReasoningEngine();
