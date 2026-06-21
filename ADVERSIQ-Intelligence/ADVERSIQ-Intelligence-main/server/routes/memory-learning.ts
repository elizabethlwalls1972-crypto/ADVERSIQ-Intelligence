/**
 * Memory & Conversation API Routes
 * 
 * Endpoints for:
 * - Saving conversations with semantic tagging
 * - Learning from problems and solutions
 * - Retrieving similar past issues
 * - Memory statistics and improvement tracking
 * - User session management
 */

import { Router, Request, Response } from 'express';
import { memoryEngine } from '../core/ProblemSolutionMemoryEngine.js';

const router = Router();

/**
 * POST /api/memory/save-conversation
 * Save a user conversation for learning
 */
router.post('/save-conversation', (req: Request, res: Response) => {
  try {
    const {
      userId,
      title,
      tags,
      messages,
      problemsIdentified,
      solutionsApplied,
      outcome,
      learningsExtracted,
      researchFindingsUsed,
      isPublic
    } = req.body;

    if (!userId || !title || !messages) {
      return res.status(400).json({
        error: 'Required fields: userId, title, messages'
      });
    }

    const saved = memoryEngine.saveConversation(
      userId,
      title,
      tags || [],
      messages,
      problemsIdentified || [],
      solutionsApplied || [],
      outcome || 'unresolved',
      learningsExtracted || [],
      researchFindingsUsed || [],
      isPublic || false
    );

    res.json({
      status: 'conversation_saved',
      id: saved.id,
      messageCount: messages.length,
      problemsIdentified: problemsIdentified?.length || 0
    });
  } catch (error) {
    console.error('[MEMORY API] Error saving conversation:', error);
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});

/**
 * POST /api/memory/register-problem
 * Register a new problem pattern for future learning
 */
router.post('/register-problem', (req: Request, res: Response) => {
  try {
    const {
      domain,
      pattern,
      symptoms,
      rootCauses,
      tags
    } = req.body;

    if (!domain || !pattern) {
      return res.status(400).json({
        error: 'Required fields: domain, pattern'
      });
    }

    const problem = memoryEngine.registerProblem(
      domain,
      pattern,
      symptoms || [],
      rootCauses || [],
      tags || []
    );

    res.json({
      status: 'problem_registered',
      id: problem.id,
      frequency: problem.frequency,
      firstSeen: problem.firstIdentified
    });
  } catch (error) {
    console.error('[MEMORY API] Error registering problem:', error);
    res.status(500).json({ error: 'Failed to register problem' });
  }
});

/**
 * POST /api/memory/register-solution
 * Register a solution for a known problem
 */
router.post('/register-solution', (req: Request, res: Response) => {
  try {
    const {
      problemId,
      steps,
      formulasUsed,
      timeToResolve,
      successRate,
      evidence,
      applicableConditions
    } = req.body;

    if (!problemId || !steps) {
      return res.status(400).json({
        error: 'Required fields: problemId, steps'
      });
    }

    const solution = memoryEngine.registerSolution(
      problemId,
      steps,
      formulasUsed || [],
      timeToResolve || 0,
      successRate || 0.5,
      evidence || [],
      applicableConditions || []
    );

    res.json({
      status: 'solution_registered',
      problemId: solution.problemId,
      stepsCount: steps.length,
      formulasUsed: formulasUsed?.length || 0
    });
  } catch (error) {
    console.error('[MEMORY API] Error registering solution:', error);
    res.status(500).json({ error: 'Failed to register solution' });
  }
});

/**
 * GET /api/memory/find-similar/:domain
 * Find problems similar to user's current issue
 * 
 * Query params:
 * - query: the user's problem description
 * - tags: comma-separated semantic tags
 */
router.get('/find-similar/:domain', (req: Request, res: Response) => {
  try {
    const { domain } = req.params;
    const { query, tags } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'Required query parameter: query'
      });
    }

    const tagArray = (tags as string)?.split(',').filter(Boolean) || [];
    const matches = memoryEngine.findRelevantProblems(
      query as string,
      domain,
      tagArray
    );

    res.json({
      domain,
      query,
      matchesFound: matches.length,
      matches: matches.map(m => ({
        problemId: m.problemId,
        pattern: m.pattern,
        matchScore: (m.matchScore * 100).toFixed(1) + '%',
        solutions: m.applicableSolutions.length,
        successRate: m.applicableSolutions[0]?.successRate 
          ? `${(m.applicableSolutions[0].successRate * 100).toFixed(1)}%`
          : 'unknown'
      }))
    });
  } catch (error) {
    console.error('[MEMORY API] Error finding similar problems:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * POST /api/memory/update-outcome
 * Update solution effectiveness based on real outcome
 */
router.post('/update-outcome', (req: Request, res: Response) => {
  try {
    const {
      solutionId,
      succeeded,
      sector,
      actualTimeMs
    } = req.body;

    if (!solutionId || succeeded === undefined) {
      return res.status(400).json({
        error: 'Required fields: solutionId, succeeded'
      });
    }

    memoryEngine.updateSolutionEffectiveness(
      solutionId,
      succeeded,
      sector,
      actualTimeMs
    );

    res.json({
      status: 'outcome_recorded',
      solutionId,
      outcome: succeeded ? 'success' : 'failed'
    });
  } catch (error) {
    console.error('[MEMORY API] Error updating outcome:', error);
    res.status(500).json({ error: 'Failed to update outcome' });
  }
});

/**
 * GET /api/memory/stats
 * Get memory engine statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = memoryEngine.getMemoryStats();

    res.json({
      knowledgeBase: {
        problemsLearned: stats.problemsLearned,
        solutionsAvailable: stats.solutionsAvailable,
        averageSuccessRate: `${(stats.averageSuccessRate * 100).toFixed(1)}%`
      },
      usage: {
        conversationsSaved: stats.conversationsSaved
      },
      topProblems: stats.mostFrequentProblems.map(p => ({
        id: p.id,
        pattern: p.pattern,
        frequency: p.frequency,
        domain: p.domain,
        tags: p.tags
      }))
    });
  } catch (error) {
    console.error('[MEMORY API] Error getting stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

/**
 * GET /api/memory/history/:userId
 * Get conversation history for a user
 */
router.get('/history/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const history = memoryEngine.getConversationHistory(userId);

    res.json({
      userId,
      conversationsCount: history.length,
      conversations: history.map(c => ({
        id: c.id,
        title: c.title,
        timestamp: c.timestamp,
        outcome: c.outcome,
        messageCount: c.messages.length,
        tags: c.tags,
        problemsSolved: c.problemsIdentified.length
      }))
    });
  } catch (error) {
    console.error('[MEMORY API] Error getting history:', error);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

/**
 * POST /api/memory/clear-session/:userId
 * Clear user session (reset for new user)
 * Preserves learned knowledge in permanent store
 */
router.post('/clear-session/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    memoryEngine.clearUserSession(userId);

    res.json({
      status: 'session_cleared',
      userId,
      message: 'User session reset. Knowledge base preserved.'
    });
  } catch (error) {
    console.error('[MEMORY API] Error clearing session:', error);
    res.status(500).json({ error: 'Failed to clear session' });
  }
});

export default router;
