import { Router, Request, Response } from 'express';
import LIDAController from '../core/LIDAController.js';
import UniversalInputProcessor from '../core/UniversalInputProcessor.js';
import SelfAuditingKnowledge from '../core/SelfAuditingKnowledge.js';
import HistoricalParallelMatcher from '../core/HistoricalParallelMatcher.js';
import FailurePatternRecognizer from '../core/FailurePatternRecognizer.js';
import OSMorphologyGraph from '../core/OSMorphologyGraph.js';
import SelfLearningAlgorithm from '../core/SelfLearningAlgorithm.js';

const router = Router();

const lidaController = new LIDAController();
const inputProcessor = new UniversalInputProcessor();
const selfAudit = new SelfAuditingKnowledge();
const historicalMatcher = new HistoricalParallelMatcher();
const failureRecognizer = new FailurePatternRecognizer();
const morphologyGraph = new OSMorphologyGraph();
const selfLearning = new SelfLearningAlgorithm();

/**
 * POST /api/lida/cycle
 * Run a single LIDA cognitive cycle
 */
router.post('/cycle', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: 'input is required' });
    const result = await lidaController.runCycle(input);
    res.json(result);
  } catch (err) {
    console.error('[LIDA API ERROR]', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/lida/input
 * Process universal input (any format, any language, any domain)
 */
router.post('/input', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: 'input is required' });
    const result = await inputProcessor.processInput(input);
    res.json(result);
  } catch (err) {
    console.error('[LIDA API ERROR]', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/lida/audit
 * Self-audit knowledge - find what the system knows and doesn't know
 */
router.post('/audit', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const result = await selfAudit.auditKnowledge(query);
    res.json(result);
  } catch (err) {
    console.error('[LIDA API ERROR]', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/lida/historical
 * Find historical parallels for a problem
 */
router.post('/historical', async (req: Request, res: Response) => {
  try {
    const { problem, limit } = req.body;
    if (!problem) return res.status(400).json({ error: 'problem is required' });
    const result = await historicalMatcher.findParallels(problem, limit || 5);
    res.json(result);
  } catch (err) {
    console.error('[LIDA API ERROR]', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/lida/failure-risk
 * Assess failure risk for a plan
 */
router.post('/failure-risk', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ error: 'plan is required' });
    const result = await failureRecognizer.getFailureRisk(plan);
    res.json(result);
  } catch (err) {
    console.error('[LIDA API ERROR]', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/lida/status
 * Get LIDA system status
 */
router.get('/status', (req: Request, res: Response) => {
   try {
     const status = {
       lida: lidaController.getState(),
       inputProcessor: { processedCount: inputProcessor.getProcessedCount() },
       selfAudit: { status: 'active' },
       historical: { caseCount: historicalMatcher.getCaseCount() },
       failurePatterns: { patternCount: failureRecognizer.getPatternCount() },
       morphology: { nodeCount: morphologyGraph.getNodeCount(), edgeCount: morphologyGraph.getEdgeCount() },
       selfLearning: {
         cycleNumber: selfLearning.getCycleNumber(),
         dataSources: selfLearning.listDataSources().map(s => s.location),
         issuesDetected: selfLearning.getDetectedIssues().length,
         solutionsGenerated: selfLearning.getGeneratedSolutions().length,
         outcomesRecorded: selfLearning.getLearningOutcomes().length,
         knowledgeGaps: selfLearning.getKnowledgeGaps(),
         learnedPatterns: selfLearning.getLearnedPatterns(),
       },
     };
     res.json(status);
   } catch (err) {
     res.status(500).json({ error: String(err) });
   }
 });

/**
 * POST /api/lida/mandate
 * Execute a full strategic mandate through the LIDA pipeline
 */
router.post('/mandate', async (req: Request, res: Response) => {
  try {
    const { mandate } = req.body;
    if (!mandate || typeof mandate !== 'string') {
      return res.status(400).json({ error: 'mandate (string) is required' });
    }

    const lidaCycle = await lidaController.runCycle(mandate);
    const parsedInput = await inputProcessor.processInput(mandate);
    const audit = await selfAudit.auditKnowledge(mandate);
    const parallels = await historicalMatcher.findParallels(mandate, 5);
    const failureRisk = await failureRecognizer.getFailureRisk({ actions: [mandate] });

    res.json({
      mandate,
      lidaCycle,
      parsedInput,
      audit,
      parallels,
      failureRisk,
    });
  } catch (err) {
    console.error('[LIDA API ERROR]', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
  * POST /api/lida/self-learning/read
  * Add a data source for the self-learning algorithm to read from
  */
router.post('/self-learning/read', async (req: Request, res: Response) => {
  try {
    const { source } = req.body;
    if (!source || !source.type || !source.location) {
      return res.status(400).json({ error: 'source with type and location is required' });
    }

    selfLearning.addDataSource(source);
    const data = await selfLearning.readData(source);

    res.json({
      message: 'Data source added and read successfully',
      source: source.location,
      dataType: typeof data,
      dataSize: JSON.stringify(data).length,
    });
  } catch (err) {
    console.error('[SELF-LEARNING] Read error:', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
  * POST /api/lida/self-learning/detect
  * Detect issues in the provided data
  */
router.post('/self-learning/detect', async (req: Request, res: Response) => {
  try {
    const { data, context } = req.body;
    if (data === undefined) {
      return res.status(400).json({ error: 'data is required' });
    }

    const issues = await selfLearning.detectIssues(data, context);

    res.json({
      issuesDetected: issues.length,
      issues: issues,
    });
  } catch (err) {
    console.error('[SELF-LEARNING] Detect error:', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
  * POST /api/lida/self-learning/solve
  * Generate solutions for detected issues
  */
router.post('/self-learning/solve', async (req: Request, res: Response) => {
  try {
    const { issueIds } = req.body;
    const issues = issueIds
      ? selfLearning.getDetectedIssues().filter(i => issueIds.includes(i.id))
      : selfLearning.getDetectedIssues();

    if (issues.length === 0) {
      return res.status(400).json({ error: 'No issues to solve. Run /self-learning/detect first.' });
    }

    const solutions = await selfLearning.generateSolutions(issues);

    res.json({
      solutionsGenerated: solutions.length,
      solutions: solutions,
    });
  } catch (err) {
    console.error('[SELF-LEARNING] Solve error:', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
  * POST /api/lida/self-learning/cycle
  * Run a full self-learning cycle: read data, detect issues, generate solutions
  */
router.post('/self-learning/cycle', async (req: Request, res: Response) => {
  try {
    const { data, context } = req.body;
    if (data === undefined) {
      return res.status(400).json({ error: 'data is required' });
    }

    const report = await selfLearning.runSelfLearningCycle(data, context);

    res.json(report);
  } catch (err) {
    console.error('[SELF-LEARNING] Cycle error:', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
  * POST /api/lida/self-learning/outcome
  * Record the outcome of a solution (feedback loop)
  */
router.post('/self-learning/outcome', async (req: Request, res: Response) => {
  try {
    const { solutionId, issueId, success, actualOutcome } = req.body;
    if (!solutionId || !issueId) {
      return res.status(400).json({ error: 'solutionId and issueId are required' });
    }

    const outcome = {
      solutionId,
      issueId,
      success,
      actualOutcome: actualOutcome || '',
      lessonsLearned: success
        ? ['Solution was effective - reinforcing approach']
        : ['Solution was not effective - revising approach'],
      confidenceDelta: success ? 0.1 : -0.1,
      timestamp: new Date().toISOString(),
    };

    await selfLearning.recordOutcome(outcome);

    res.json({
      message: 'Outcome recorded successfully',
      outcome,
      learningRate: selfLearning.getStats().learningRate,
    });
  } catch (err) {
    console.error('[SELF-LEARNING] Outcome error:', err);
    res.status(500).json({ error: String(err) });
  }
});

/**
  * GET /api/lida/self-learning/status
  * Get self-learning algorithm status
  */
router.get('/self-learning/status', (req: Request, res: Response) => {
  try {
    const status = {
      selfLearning: {
        cycleNumber: selfLearning.getCycleNumber(),
        dataSources: selfLearning.listDataSources().map(s => s.location),
        issuesDetected: selfLearning.getDetectedIssues().length,
        solutionsGenerated: selfLearning.getGeneratedSolutions().length,
        outcomesRecorded: selfLearning.getLearningOutcomes().length,
        knowledgeGaps: selfLearning.getKnowledgeGaps(),
        learnedPatterns: selfLearning.getLearnedPatterns(),
      },
      stats: selfLearning.getStats(),
    };
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
  * GET /api/lida/self-learning/stats
  * Get detailed self-learning statistics
  */
router.get('/self-learning/stats', (req: Request, res: Response) => {
  try {
    res.json(selfLearning.getStats());
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});


/**
 * POST /api/lida/bootstrap
 * Run the self-aware, self-healing bootstrap loop (knowSelf -> diagnose -> selfHeal -> reachOut -> pipeline)
 */
router.post('/bootstrap', async (req: Request, res: Response) => {
  try {
    const { SystemBootstrap } = await import('../core/SystemBootstrap.js');
    const bootstrap = new SystemBootstrap();
    const report = await bootstrap.bootstrap(req.body && req.body.input);
    res.json(report);
  } catch (err) {
    console.error('[BOOTSTRAP ERROR]', err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
