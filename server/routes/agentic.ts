import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import type { ReportParameters, ReportPayload } from '../../types.js';
import { ReportOrchestrator } from '../../services/ReportOrchestrator.js';

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const RUNS_FILE = path.join(DATA_DIR, 'agent_runs.json');

type AgenticRunOptions = {
  maxSimilarCases?: number;
  persistReport?: boolean;
  persistRun?: boolean;
};

type SimilarCase = {
  id: string;
  score: number;
  why: string[];
  organizationName?: string;
  country?: string;
  region?: string;
  industry?: string[];
  strategicIntent?: string[];
  outcome?: string;
};

type AgenticRunResult = {
  runId: string;
  startedAt: string;
  completedAt: string;
  plan: Array<{ step: string; tool: string; status: 'ok' | 'skipped' | 'failed'; detail?: string }>;
  memory: { similarCases: SimilarCase[] };
  output: {
    reportId: string;
    payload: ReportPayload;
    executiveBrief: {
      proceedSignal: 'proceed' | 'pause' | 'restructure';
      topDrivers: string[];
      topRisks: string[];
      nextActions: string[];
    };
  };
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function loadJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function saveJsonFile<T>(filePath: string, data: T) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function overlapScore(a: string[] | undefined, b: string[] | undefined): number {
  if (!a?.length || !b?.length) return 0;
  const setA = new Set(a.map(s => s.toLowerCase().trim()).filter(Boolean));
  const setB = new Set(b.map(s => s.toLowerCase().trim()).filter(Boolean));
  let inter = 0;
  for (const item of setA) if (setB.has(item)) inter += 1;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function findSimilarCases(current: ReportParameters, corpus: any[], max: number): SimilarCase[] {
  const targetCountry = (current.country || '').toLowerCase().trim();
  const targetRegion = (current.region || '').toLowerCase().trim();

  const ranked = corpus
    .filter(r => r && typeof r === 'object' && r.id && r.id !== current.id)
    .map((r: any) => {
      const why: string[] = [];
      let score = 0;

      const cCountry = (r.country || '').toLowerCase().trim();
      const cRegion = (r.region || '').toLowerCase().trim();

      if (targetCountry && cCountry && targetCountry === cCountry) {
        score += 0.45;
        why.push('same country');
      } else if (targetRegion && cRegion && targetRegion === cRegion) {
        score += 0.25;
        why.push('same region');
      }

      const industry = overlapScore(current.industry, r.industry);
      if (industry > 0) {
        score += 0.25 * industry;
        why.push('industry overlap');
      }

      const intent = overlapScore(current.strategicIntent, r.strategicIntent);
      if (intent > 0) {
        score += 0.2 * intent;
        why.push('strategic intent overlap');
      }

      if (r.outcome && typeof r.outcome === 'string') {
        score += 0.05;
        why.push('has outcome');
      }

      return {
        id: String(r.id),
        score,
        why,
        organizationName: r.organizationName,
        country: r.country,
        region: r.region,
        industry: Array.isArray(r.industry) ? r.industry : undefined,
        strategicIntent: Array.isArray(r.strategicIntent) ? r.strategicIntent : undefined,
        outcome: r.outcome
      } satisfies SimilarCase;
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);

  return ranked;
}

function buildExecutiveBrief(payload: ReportPayload): AgenticRunResult['output']['executiveBrief'] {
  const overall = payload.confidenceScores.overall ?? 50;
  const stability = payload.confidenceScores.politicalStability ?? 50;
  const ethical = payload.confidenceScores.ethicalAlignment ?? 50;

  const proceedSignal: 'proceed' | 'pause' | 'restructure' =
    overall >= 75 && stability >= 55 && ethical >= 60 ? 'proceed' : overall >= 60 ? 'pause' : 'restructure';

  const topDrivers = [
    `Overall confidence ${Math.round(overall)}/100`,
    `Economic readiness ${Math.round(payload.confidenceScores.economicReadiness ?? 0)}/100`,
    `Symbiotic fit ${Math.round(payload.confidenceScores.symbioticFit ?? 0)}/100`
  ];

  const topRisks = [
    `Political stability ${Math.round(stability)}/100`,
    `Regulatory friction ${Math.round(payload.risks.regulatory.regulatoryFriction ?? 0)}/100`,
    `Supply chain dependency ${Math.round(payload.risks.operational.supplyChainDependency ?? 0)}/100`
  ];

  const nextActions = [
    'Confirm 3 non-negotiable constraints (budget/timeline/risk).',
    'Run SEAM alignment review on top 3 stakeholders/partners.',
    'Commission regulatory pathway + sanctions/compliance check.',
    'Draft an investor-grade one-page and partner outreach brief.'
  ];

  return { proceedSignal, topDrivers, topRisks, nextActions };
}

router.post('/run', async (req: Request, res: Response) => {
  const startedAt = new Date().toISOString();
  const runId = `RUN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const { params, options } = req.body as { params?: ReportParameters; options?: AgenticRunOptions };

    if (!params || typeof params !== 'object') {
      return res.status(400).json({ error: 'params (ReportParameters) is required' });
    }

    const normalizedOptions: Required<AgenticRunOptions> = {
      maxSimilarCases: options?.maxSimilarCases ?? 5,
      persistReport: options?.persistReport ?? true,
      persistRun: options?.persistRun ?? true
    };

    const plan: AgenticRunResult['plan'] = [];

    plan.push({ step: 'Load prior cases (memory)', tool: 'reports.json', status: 'ok' });
    const reports = await loadJsonFile<any[]>(REPORTS_FILE, []);
    const similarCases = findSimilarCases(params, reports, normalizedOptions.maxSimilarCases);

    plan.push({ step: 'Run NSIL formula suite', tool: 'ReportOrchestrator.assembleReportPayload', status: 'ok' });
    const payload = await ReportOrchestrator.assembleReportPayload(params);

    plan.push({ step: 'Validate payload completeness', tool: 'ReportOrchestrator.validatePayload', status: 'ok' });
    const validation = ReportOrchestrator.validatePayload(payload);
    if (!validation.isComplete) {
      plan.push({
        step: 'Flag missing intake fields',
        tool: 'ReportOrchestrator.validatePayload',
        status: 'skipped',
        detail: `Missing: ${validation.missingFields.join(', ')}`
      });
    }

    const executiveBrief = buildExecutiveBrief(payload);

    if (normalizedOptions.persistReport) {
      plan.push({ step: 'Persist report snapshot', tool: 'reports.json', status: 'ok' });
      const updated = [
        {
          ...params,
          status: params.status || 'generated',
          reportPayload: payload,
          updatedAt: Date.now().toString()
        },
        ...reports.filter(r => r?.id !== params.id)
      ];
      await saveJsonFile(REPORTS_FILE, updated);
    } else {
      plan.push({ step: 'Persist report snapshot', tool: 'reports.json', status: 'skipped' });
    }

    if (normalizedOptions.persistRun) {
      plan.push({ step: 'Persist run ledger', tool: 'agent_runs.json', status: 'ok' });
      const runs = await loadJsonFile<any[]>(RUNS_FILE, []);
      runs.unshift({
        runId,
        startedAt,
        completedAt: new Date().toISOString(),
        reportId: params.id,
        country: params.country,
        region: params.region,
        industry: params.industry,
        strategicIntent: params.strategicIntent,
        proceedSignal: executiveBrief.proceedSignal,
        confidence: payload.confidenceScores.overall,
        similarCases
      });
      await saveJsonFile(RUNS_FILE, runs.slice(0, 500));
    } else {
      plan.push({ step: 'Persist run ledger', tool: 'agent_runs.json', status: 'skipped' });
    }

    const completedAt = new Date().toISOString();

    const result: AgenticRunResult = {
      runId,
      startedAt,
      completedAt,
      plan,
      memory: { similarCases },
      output: {
        reportId: params.id,
        payload,
        executiveBrief
      }
    };

    return res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('Agentic run error:', err);
    return res.status(500).json({ error: message, runId, startedAt });
  }
});

export default router;
