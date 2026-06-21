import express, { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataDir = path.join(process.cwd(), 'data');
const learningDir = path.join(process.cwd(), 'core', 'continuous-learning');

interface LearningMetrics {
  totalConversations: number;
  totalProblems: number;
  totalSolutions: number;
  successRate: number;
  averageConfidence: number;
  topPatterns: string[];
  learningTrend: number[];
  lastUpdate: string;
}

interface LearningState {
  feature_weights: Record<string, number>;
  learning_config: Record<string, unknown>;
  metrics_log: unknown[];
  outcome_log: unknown[];
  pattern_store: Record<string, unknown>;
  model_state: Record<string, unknown>;
}

// Get comprehensive learning metrics
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const conversationPath = path.join(dataDir, 'memory', 'conversations.jsonl');
    const problemsPath = path.join(dataDir, 'memory', 'problems.jsonl');
    const solutionsPath = path.join(dataDir, 'memory', 'solutions.jsonl');
    const outcomePath = path.join(learningDir, 'outcome_log.json');
    const patternPath = path.join(learningDir, 'pattern_store.json');

    let totalConversations = 0;
    let totalProblems = 0;
    let totalSolutions = 0;
    let successCount = 0;
    let totalOutcomes = 0;

    // Count conversations
    if (fs.existsSync(conversationPath)) {
      const conversations = fs.readFileSync(conversationPath, 'utf-8').split('\n').filter(l => l.trim());
      totalConversations = conversations.length;
    }

    // Count problems
    if (fs.existsSync(problemsPath)) {
      const problems = fs.readFileSync(problemsPath, 'utf-8').split('\n').filter(l => l.trim());
      totalProblems = problems.length;
    }

    // Count solutions
    if (fs.existsSync(solutionsPath)) {
      const solutions = fs.readFileSync(solutionsPath, 'utf-8').split('\n').filter(l => l.trim());
      totalSolutions = solutions.length;
    }

    // Calculate success rate
    if (fs.existsSync(outcomePath)) {
      const outcomeLog = JSON.parse(fs.readFileSync(outcomePath, 'utf-8'));
      if (Array.isArray(outcomeLog)) {
        totalOutcomes = outcomeLog.length;
        successCount = outcomeLog.filter((o: any) => o.success === true).length;
      }
    }

    // Get top patterns
    let topPatterns: string[] = [];
    if (fs.existsSync(patternPath)) {
      const patternStore = JSON.parse(fs.readFileSync(patternPath, 'utf-8'));
      topPatterns = Object.keys(patternStore).slice(0, 5);
    }

    const successRate = totalOutcomes > 0 ? (successCount / totalOutcomes) * 100 : 0;

    const metrics: LearningMetrics = {
      totalConversations,
      totalProblems,
      totalSolutions,
      successRate: Math.round(successRate * 100) / 100,
      averageConfidence: 0.82, // Placeholder - calculate from actual data if available
      topPatterns,
      learningTrend: [0.65, 0.68, 0.72, 0.75, 0.78, 0.82], // Sample trend
      lastUpdate: new Date().toISOString(),
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve metrics', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get current learning state
router.get('/state', (req: Request, res: Response) => {
  try {
    const state: Partial<LearningState> = {};

    // Load all state files
    const files = {
      feature_weights: path.join(learningDir, 'feature_weights.json'),
      learning_config: path.join(learningDir, 'learning_config.json'),
      metrics_log: path.join(learningDir, 'metrics_log.json'),
      outcome_log: path.join(learningDir, 'outcome_log.json'),
      pattern_store: path.join(learningDir, 'pattern_store.json'),
      model_state: path.join(learningDir, 'model_state.json'),
    };

    for (const [key, filePath] of Object.entries(files)) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        (state as any)[key] = JSON.parse(content);
      }
    }

    res.json(state);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve learning state', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get telemetry logs (system operations)
router.get('/telemetry', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const telemetryPath = path.join(dataDir, 'omni_node_telemetry.jsonl');

    if (!fs.existsSync(telemetryPath)) {
      return res.json({ telemetry: [] });
    }

    const lines = fs.readFileSync(telemetryPath, 'utf-8').split('\n').filter(l => l.trim());
    const telemetry = lines.slice(-limit).map(line => JSON.parse(line));

    res.json({ telemetry, total: lines.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve telemetry', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get self-play scenarios (autonomous learning)
router.get('/scenarios', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const scenariosPath = path.join(dataDir, 'self_play_scenarios.jsonl');

    if (!fs.existsSync(scenariosPath)) {
      return res.json({ scenarios: [] });
    }

    const lines = fs.readFileSync(scenariosPath, 'utf-8').split('\n').filter(l => l.trim());
    const scenarios = lines.slice(-limit).map(line => JSON.parse(line));

    res.json({ scenarios, total: lines.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve scenarios', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get learning insights (summary analysis)
router.get('/insights', (req: Request, res: Response) => {
  try {
    const outcomePath = path.join(learningDir, 'outcome_log.json');
    const patternPath = path.join(learningDir, 'pattern_store.json');

    const insights = {
      systemStatus: 'OPERATIONAL',
      learningPhase: 'ACTIVE_COLLECTION',
      recommendedActions: [
        'Continue collecting diverse decision scenarios',
        'Monitor success rate threshold (current: dynamic)',
        'Validate pattern consistency with domain experts',
      ],
      alerts: [] as string[],
      lastAnalysis: new Date().toISOString(),
    };

    // Check for issues
    if (fs.existsSync(outcomePath)) {
      const outcomes = JSON.parse(fs.readFileSync(outcomePath, 'utf-8'));
      const failureRate = outcomes.filter((o: any) => !o.success).length / outcomes.length;
      if (failureRate > 0.3) {
        insights.alerts.push('High failure rate detected - review recent decisions');
      }
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
