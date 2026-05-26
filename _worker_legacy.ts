/**
 * ADVERSIQ Intelligence — Cloudflare Workers Deployment
 * 
 * Full NSIL 10-Layer Architecture with Autonomous Proactive Mode
 * 
 * Bindings:
 * - AI: Llama 3.3 70B (reasoning-optimized)
 * - AI_SEARCH: Live web access for real-time regional data
 * - AI_EMBEDDING: Semantic search via vector embeddings
 * - CHAT_KV: Session cache (7-day TTL)
 * - DB (D1): Persistent memory, NSIL state, document index
 * - VECTORIZE: Semantic search index for documents
 * - ASSETS: Static frontend assets
 */

import type { 
  KVNamespace, 
  Ai,
  D1Database,
  VectorizeIndex,
} from '@cloudflare/workers-types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface ConversationHistory {
  sessionId: string;
  messages: Message[];
  nsilState: NSILState;
  createdAt: string;
  updatedAt: string;
  proactiveInsights?: string[];
}

interface NSILState {
  currentLayer: number;      // 1-10 layers
  layerStatuses: Record<string, 'active' | 'pending' | 'complete'>;
  decisionHistory: Decision[];
  confidenceScores: Record<string, number>;
  lastProactiveRun: string;
}

interface Decision {
  layer: number;
  timestamp: string;
  reasoning: string;
  decision: string;
  confidence: number;
}

interface DocumentMetadata {
  id: string;
  filename: string;
  uploadedAt: string;
  size: number;
  type: string;
  vectorId?: string;
  embedding?: number[];
}

interface SearchResult {
  id: string;
  filename: string;
  relevance: number;
  excerpt: string;
}

interface Env {
  AI: Ai;
  AI_SEARCH: Ai;
  AI_EMBEDDING: Ai;
  CHAT_KV: KVNamespace;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  ENVIRONMENT?: string;
}

/**
 * POST /api/chat
 * Receives a user message, calls the AI model, returns response
 * Stores conversation in KV for history/context
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

    // Generate session ID if not provided
    const convoKey = sessionId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Retrieve existing conversation history from KV
    const existingConvoData = await env.CHAT_KV.get(convoKey);
    let conversationHistory: ConversationHistory;

    if (existingConvoData) {
      conversationHistory = JSON.parse(existingConvoData);
    } else {
      conversationHistory = {
        sessionId: convoKey,
        messages: [
          {
            role: 'system',
            content: `You are ADVERSIQ Intelligence - an operating system for regional economic intelligence.
You help regional councils, investment promotion authorities, and development organizations make data-driven investment decisions.
You combine adversarial debate, quantitative scoring, and ethical vetting to recommend regional strategies.
${context ? `\nContext: ${JSON.stringify(context)}` : ''}`,
            timestamp: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Add user message to history
    conversationHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Call Cloudflare Workers AI (Llama 2 7B Chat)
    // The AI binding automatically manages authentication and routing
    const aiResponse = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: conversationHistory.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: 1024,
      temperature: 0.7,
    });

    // Extract the assistant's response
    const assistantMessage = (aiResponse as any).response || 
                           (aiResponse as any).result?.response ||
                           'Unable to process request.';

    // Add assistant response to conversation history
    conversationHistory.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString(),
    });

    // Update timestamp
    conversationHistory.updatedAt = new Date().toISOString();

    // Save updated conversation to KV (7-day expiration)
    await env.CHAT_KV.put(
      convoKey,
      JSON.stringify(conversationHistory),
      { expirationTtl: 604800 } // 7 days in seconds
    );

    return new Response(
      JSON.stringify({
        sessionId: convoKey,
        message: message,
        response: assistantMessage,
        timestamp: new Date().toISOString(),
        conversationLength: conversationHistory.messages.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET /api/conversation/:sessionId
 * Retrieve full conversation history from KV
 */
async function handleGetConversation(
  req: Request,
  env: Env,
  sessionId: string
): Promise<Response> {
  try {
    const convoData = await env.CHAT_KV.get(sessionId);
    if (!convoData) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const conversation: ConversationHistory = JSON.parse(convoData);
    return new Response(JSON.stringify(conversation), {
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
 * GET /api/health
 * Health check endpoint
 */
function handleHealthCheck(): Response {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      bindings: {
        AI: 'available',
        KV: 'available',
        ASSETS: 'available',
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Main request router
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // API Routes
    if (pathname === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request, env);
    }

    if (pathname.startsWith('/api/conversation/')) {
      const sessionId = pathname.split('/').pop();
      if (sessionId && request.method === 'GET') {
        return handleGetConversation(request, env, sessionId);
      }
    }

    if (pathname === '/api/health' && request.method === 'GET') {
      return handleHealthCheck();
    }

    // Static asset serving (frontend)
    // Serve static files from dist/ or fallback to index.html for SPA routing
    try {
      // Determine the file path
      let filePath = pathname;
      if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
      }

      // Try to serve the exact file
      const response = await env.ASSETS.fetch(
        new Request(new URL(filePath, request.url), { method: request.method })
      );

      // If file not found and it's a route (not a file with extension), try index.html
      if (response.status === 404 && !filePath.includes('.')) {
        return env.ASSETS.fetch(
          new Request(new URL('/index.html', request.url), { method: 'GET' })
        );
      }

      return response;
    } catch (error) {
      console.error('Asset serving error:', error);
      // Fallback: serve index.html for SPA routing
      try {
        return env.ASSETS.fetch(
          new Request(new URL('/index.html', request.url), { method: 'GET' })
        );
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }
  },
} as ExportedHandler<Env>;
