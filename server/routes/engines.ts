/**
 * ADVERSIQ Engine Routes — SAT Contradiction Solver, Monte Carlo, ML Feedback
 * Exposes the three core engines as REST endpoints.
 */

import express, { Request, Response } from 'express';

const router = express.Router();

// ─── SAT Contradiction Solver ─────────────────────────────────────────────────
router.post('/sat/check', async (req: Request, res: Response) => {
  try {
    const { checkContradictions, scenarioToCNF } = await import('../../core/SATContradictionSolver.js' as any);
    const params = req.body as Record<string, any>;

    // Accept either raw constraints array OR scenario parameters
    const constraints = params.constraints
      ? params.constraints
      : scenarioToCNF(params);

    if (!constraints || constraints.length === 0) {
      return res.json({
        satisfiable: true,
        conflictingConstraints: [],
        explanation: 'No constraints to validate. Inputs are consistent.',
        suggestions: [],
        solveTimeMs: 0,
      });
    }

    const result = checkContradictions({ constraints });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// ─── Monte Carlo Engine ───────────────────────────────────────────────────────
router.post('/montecarlo/run', async (req: Request, res: Response) => {
  try {
    const { executeMonteCarlo } = await import('../../core/MonteCarloEngine.js' as any);
    const input = req.body;

    if (!input || typeof input.baseProbability !== 'number') {
      return res.status(400).json({ error: 'baseProbability (number 0-1) is required' });
    }

    const result = executeMonteCarlo(input);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// ─── ML Pipeline Feedback ─────────────────────────────────────────────────────
router.post('/ml/feedback', async (req: Request, res: Response) => {
  try {
    const { retrainModel } = await import('../../core/continuous-learning/mlPipeline.js' as any);
    const { taskId, outcome, accurate, comment } = req.body;

    if (!taskId || typeof accurate !== 'boolean') {
      return res.status(400).json({ error: 'taskId and accurate (boolean) are required' });
    }

    const dataPoint = {
      taskId: String(taskId),
      outcome: {
        actionsTaken: outcome?.actionsTaken || [],
        auditTrail: outcome?.auditTrail || [],
        confidence: outcome?.confidence ?? (accurate ? 0.85 : 0.2),
        success: accurate,
        actualValue: accurate ? 1 : 0,
        predictedValue: outcome?.predictedValue ?? 0.5,
      },
      timestamp: new Date().toISOString(),
    };

    retrainModel([dataPoint]);

    res.json({
      status: 'trained',
      message: `Feedback recorded. ML pipeline updated with task ${taskId} (${accurate ? 'accurate' : 'inaccurate'}).`,
      comment: comment || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// ─── ML Diagnostics ───────────────────────────────────────────────────────────
router.get('/ml/diagnostics', async (_req: Request, res: Response) => {
  try {
    const { getModelDiagnostics } = await import('../../core/continuous-learning/mlPipeline.js' as any);
    const diagnostics = getModelDiagnostics();
    res.json(diagnostics);
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// ─── Full NSIL Pipeline Health ────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    engines: {
      monteCarlo: 'v2.0 — real 5,000-scenario probabilistic engine',
      satSolver: 'v1.0 — DPLL propositional logic contradiction checker',
      mlPipeline: 'v1.0 — gradient descent with pattern store',
      causalEngine: 'v1.0 — Bayesian network with do-calculus',
      ethicsEngine: 'v6.0 — UN/OFAC/GDPR/FATF compliance + bias detection',
      symbioticMatchmaking: 'v2.0 — mutual-benefit NSIL scoring engine',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
