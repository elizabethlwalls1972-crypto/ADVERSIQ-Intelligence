/**
 * Cloudflare Workers Entry Point
 * Handles AI chat API + serves the ADVERSIQ frontend
 */

import type { KVNamespace } from '@cloudflare/workers-types';

interface Env {
  AI: Fetcher;
  CHAT_KV: KVNamespace;
  ENVIRONMENT?: string;
}

/**
 * POST /api/chat
 * Receives a user message, calls the AI model, streams response
 */
async function handleChatRequest(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { message, sessionId, context } = await req.json() as {
      message: string;
      sessionId?: string;
      context?: Record<string, unknown>;
    };

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Store conversation in KV
    const convoKey = sessionId || `conv_${Date.now()}`;
    const existingConvo = await env.CHAT_KV.get(convoKey);
    const messages = existingConvo ? JSON.parse(existingConvo) : [];
    
    messages.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

    // Call Cloudflare AI model (using Workers AI)
    const systemPrompt = `You are ADVERSIQ Intelligence - an operating system for regional economic intelligence. 
You help regional councils, investment promotion authorities, and development organizations make data-driven investment decisions.
You combine adversarial debate, quantitative scoring, and ethical vetting to recommend regional strategies.
${context ? `Context: ${JSON.stringify(context)}` : ''}`;

    // Call the AI model
    const response = await env.AI.fetch('https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run/@cf/meta/llama-2-7b-chat-int8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
        max_tokens: 1024,
      }),
    });

    const aiResult = await response.json() as { result?: { response?: string } };
    const assistantMessage = aiResult.result?.response || 'Unable to process request.';

    messages.push({ role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() });

    // Save updated conversation
    await env.CHAT_KV.put(convoKey, JSON.stringify(messages), { expirationTtl: 86400 * 7 }); // 7 days

    return new Response(
      JSON.stringify({
        sessionId: convoKey,
        response: assistantMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET /api/conversation/:sessionId
 * Retrieve conversation history
 */
async function handleGetConversation(
  req: Request,
  env: Env,
  sessionId: string
): Promise<Response> {
  try {
    const convo = await env.CHAT_KV.get(sessionId);
    if (!convo) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(convo, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Main request router
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route API requests
    if (url.pathname === '/api/chat') {
      return handleChatRequest(request, env);
    }

    if (url.pathname.startsWith('/api/conversation/')) {
      const sessionId = url.pathname.split('/').pop();
      if (sessionId) {
        return handleGetConversation(request, env, sessionId);
      }
    }

    // Serve frontend assets (vite build output)
    // This assumes your vite build is in dist/
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    
    try {
      const response = await env.ASSETS.fetch(new Request(new URL(filePath, request.url), request));
      return response;
    } catch {
      // Fallback for SPA routing
      return await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
  },
} as ExportedHandler<Env>;
