import { Router, Request, Response } from 'express';
import { omniNode } from '../core/AdversiqOmniNode.js';

const router = Router();

/**
 * POST /api/omni/mandate
 * Execute a strategic mandate through the full ADVERSIQ pipeline
 */
router.post('/mandate', async (req: Request, res: Response) => {
  try {
    const { mandate } = req.body;

    if (!mandate || typeof mandate !== 'string') {
      return res.status(400).json({ error: 'mandate (string) is required' });
    }

    const result = await omniNode.executeStrategicMandate(mandate);
    res.json(result);
  } catch (err) {
    console.error(`[OMNI API ERROR]`, err);
    res.status(500).json({ error: String(err) });
  }
});

/**
 * GET /api/omni/status
 * Get current system status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = omniNode.getSystemStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/omni/autonomous
 * Enable autonomous mode (system makes decisions without human input)
 */
router.post('/autonomous', async (req: Request, res: Response) => {
  try {
    await omniNode.enableAutonomousMode();
    res.json({ status: 'autonomous_mode_enabled' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/omni/emergency-mutate
 * Force an algorithmic mutation (trigger evolution)
 */
router.post('/emergency-mutate', async (req: Request, res: Response) => {
  try {
    const { formula } = req.body;
    if (!formula) {
      return res.status(400).json({ error: 'formula is required' });
    }

    await omniNode.triggerEmergencyMutation(formula);
    res.json({ status: 'mutation_triggered', formula });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

/**
 * POST /api/omni/mandate-with-research
 * Execute strategic mandate with integrated research findings
 * Combines mandate execution with multi-domain research
 */
router.post('/mandate-with-research', async (req: Request, res: Response) => {
  try {
    const { mandate, domains, researchContext } = req.body;

    if (!mandate || typeof mandate !== 'string') {
      return res.status(400).json({ error: 'mandate (string) is required' });
    }

    console.log(`[OMNI] Executing mandate with research integration: ${mandate.substring(0, 50)}...`);

    // Execute mandate and collect research findings
    const mandateResult = await omniNode.executeStrategicMandate(mandate);
    
    // Note: Full research integration would require importing AutonomousSwarm here
    // For now, this endpoint demonstrates the concept of combining mandate + research

    res.json({
      mandateExecution: mandateResult,
      researchIntegration: {
        status: 'research_capabilities_available_at_/api/research',
        recommendedApproach: 'Use /api/research/conduct for specialized domain analysis',
        combinedApproach: 'Execute mandate first, then enrich with research findings'
      }
    });
  } catch (err) {
    console.error(`[OMNI API ERROR]`, err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
