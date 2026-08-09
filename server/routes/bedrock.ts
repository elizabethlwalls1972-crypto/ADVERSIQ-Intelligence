/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AI Inference Route (Legacy Bedrock-compatible endpoint)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Routes inference requests through the active AI provider chain:
 * Together.ai → OpenAI → Groq (automatic failover).
 *
 * This endpoint exists for backward compatibility. New integrations
 * should use /api/ai routes directly.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response } from 'express';
import { callTogether, isTogetherAvailable } from '../../services/togetherAIService.js';
import { callGroq, isGroqAvailable } from '../../services/groqService.js';

const router = Router();

interface AIRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

router.post('/invoke', async (req: Request, res: Response) => {
  const { prompt, model, maxTokens, temperature, systemPrompt }: AIRequest = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const opts = {
    model,
    maxTokens: maxTokens ?? 4096,
    temperature: temperature ?? 0.4,
  };

  try {
    let result: string;

    if (isTogetherAvailable()) {
      result = await callTogether(messages, opts);
    } else if (isGroqAvailable()) {
      result = await callGroq(messages, opts);
    } else {
      res.status(503).json({
        error: 'No AI provider available',
        message: 'Configure TOGETHER_API_KEY or GROQ_API_KEY in .env to enable AI inference',
      });
      return;
    }

    res.json({ response: result, model: opts.model || 'default' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI inference failed';
    res.status(500).json({ error: message });
  }
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  const togetherUp = isTogetherAvailable();
  const groqUp = isGroqAvailable();
  const configured = togetherUp || groqUp;

  res.json({
    service: 'AI Intelligence',
    status: configured ? 'operational' : 'no-provider',
    configured,
    providers: {
      together: togetherUp,
      groq: groqUp,
    },
  });
});

export default router;
