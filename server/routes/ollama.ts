/**
 * OLLAMA LOCAL AI MANAGEMENT ROUTES
 * ─────────────────────────────────────────────────────────────────────────────
 * Exposes the local Ollama runtime so the frontend can:
 *  - Check if Ollama is running
 *  - List installed models
 *  - Pull a new model (streamed progress)
 *  - Run local reasoning on any question (no API key)
 *
 * All endpoints use the LocalReasoningEngine singleton.
 *
 * GET  /api/ollama/status        → Ollama health, installed models, setup guide
 * GET  /api/ollama/models        → List installed models
 * POST /api/ollama/pull          → Pull a model (SSE streamed progress)
 * POST /api/ollama/reason        → Run local reasoning on a question
 */

import { Router, Request, Response } from 'express';
import { localReasoningEngine } from '../../services/LocalReasoningEngine.js';
import { checkOllamaAvailable } from '../../services/ollamaService.js';

const router = Router();

// ── GET /api/ollama/status ────────────────────────────────────────────────────
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await localReasoningEngine.getSetupStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ── GET /api/ollama/models ────────────────────────────────────────────────────
router.get('/models', async (_req: Request, res: Response) => {
  try {
    const running = await checkOllamaAvailable();
    if (!running) {
      res.json({ success: true, running: false, models: [], message: 'Ollama is not running. Download from https://ollama.com' });
      return;
    }
    const models = await localReasoningEngine.listLocalModels();
    res.json({ success: true, running: true, models });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ── POST /api/ollama/pull ─────────────────────────────────────────────────────
// Streams pull progress as Server-Sent Events
router.post('/pull', async (req: Request, res: Response) => {
  const { model } = req.body as { model?: string };
  const modelName = (model ?? 'llama3.2:3b').toString().trim().slice(0, 100);

  // Validate — only allow known safe model names (alphanumeric, colon, dot, hyphen)
  if (!/^[a-zA-Z0-9:.\-_]+$/.test(modelName)) {
    res.status(400).json({ success: false, error: 'Invalid model name' });
    return;
  }

  const running = await checkOllamaAvailable();
  if (!running) {
    res.status(503).json({ success: false, error: 'Ollama is not running. Start with: ollama serve' });
    return;
  }

  // Stream progress as SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  send({ type: 'start', model: modelName, message: `Pulling ${modelName}...` });

  try {
    const success = await localReasoningEngine.pullModel(modelName, (status, percent) => {
      send({ type: 'progress', status, percent: percent ?? null });
    });
    if (success) {
      send({ type: 'done', model: modelName, message: `${modelName} is ready. Local reasoning fully active.` });
    } else {
      send({ type: 'error', message: `Failed to pull ${modelName}` });
    }
  } catch (err) {
    send({ type: 'error', message: err instanceof Error ? err.message : 'Pull failed' });
  }
  res.end();
});

// ── POST /api/ollama/reason ───────────────────────────────────────────────────
router.post('/reason', async (req: Request, res: Response) => {
  try {
    const { question, context, scores, depth } = req.body as {
      question?: string;
      context?: string;
      scores?: Record<string, number>;
      depth?: 'quick' | 'standard' | 'deep';
    };

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      res.status(400).json({ success: false, error: 'question is required' });
      return;
    }

    const result = await localReasoningEngine.reason({
      question: question.slice(0, 2000),
      context: context?.slice(0, 3000),
      scores,
      depth: depth ?? 'standard',
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Reasoning failed' });
  }
});

export default router;
