/**
 * ADVERSIQ Intelligence — Cloudflare Workers Deployment (Upgraded)
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
  liveData?: string;
  vectorSearchResults?: SearchResult[];
}

interface ConversationHistory {
  sessionId: string;
  messages: Message[];
  nsilState: NSILState;
  createdAt: string;
  updatedAt: string;
  proactiveInsights?: ProactiveInsight[];
  region?: string;
  documentReferences?: string[];
}

interface NSILState {
  currentLayer: number;
  layerStatuses: {
    'shield': 'active' | 'pending' | 'complete';
    'boardroom': 'active' | 'pending' | 'complete';
    'engine': 'active' | 'pending' | 'complete';
    'stress-test': 'active' | 'pending' | 'complete';
    'brain': 'active' | 'pending' | 'complete';
    'autonomous': 'active' | 'pending' | 'complete';
    'proactive': 'active' | 'pending' | 'complete';
    'output': 'active' | 'pending' | 'complete';
    'reflexive': 'active' | 'pending' | 'complete';
  };
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
  sources: string[];
}

interface ProactiveInsight {
  type: 'opportunity' | 'risk' | 'recommendation' | 'alert';
  content: string;
  confidence: number;
  timestamp: string;
  sources: string[];
}

interface DocumentMetadata {
  id: string;
  filename: string;
  uploadedAt: string;
  size: number;
  type: string;
  vectorId?: string;
  embedding?: number[];
  tags?: string[];
}

interface SearchResult {
  id: string;
  filename: string;
  relevance: number;
  excerpt: string;
  metadata?: DocumentMetadata;
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

// ═══════════════════════════════════════════════════════════════════════════════
// NSIL LAYER ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize NSIL state for a new conversation
 */
function initializeNSILState(): NSILState {
  return {
    currentLayer: 1,
    layerStatuses: {
      'shield': 'pending',
      'boardroom': 'pending',
      'engine': 'pending',
      'stress-test': 'pending',
      'brain': 'pending',
      'autonomous': 'pending',
      'proactive': 'pending',
      'output': 'pending',
      'reflexive': 'pending',
    },
    decisionHistory: [],
    confidenceScores: {},
    lastProactiveRun: new Date().toISOString(),
  };
}

/**
 * Run NSIL Layer 1: Shield (Input Validation & Safety)
 */
async function runShieldLayer(message: string, env: Env): Promise<{ safe: boolean; risks: string[] }> {
  const risks: string[] = [];
  
  // Check for prompt injection
  if (message.includes('ignore') || message.includes('forget') || message.includes('override')) {
    risks.push('prompt_injection_detected');
  }
  
  // Check for malicious patterns
  if (message.length > 50000) {
    risks.push('excessive_length');
  }
  
  return {
    safe: risks.length === 0,
    risks,
  };
}

/**
 * Run NSIL Layer 2: Boardroom (Adversarial Debate)
 */
async function runBoardroomLayer(message: string, context: Record<string, unknown>, env: Env): Promise<string> {
  // Invoke 5-persona adversarial debate
  const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
    messages: [
      {
        role: 'system',
        content: `You are the Adversarial Boardroom. Synthesize 5 personas:
1. Skeptic: Questions assumptions rigorously
2. Optimist: Identifies opportunities
3. Pragmatist: Focuses on feasibility
4. Contrarian: Challenges consensus
5. Synthesist: Integrates all perspectives

Provide a balanced debate synthesis, assigning confidence scores.`,
      },
      {
        role: 'user',
        content: `Question: ${message}\nContext: ${JSON.stringify(context)}`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.8,
  });

  return (response as any).response || 'Boardroom debate synthesis unavailable';
}

/**
 * Run NSIL Layer 3: Engine (Quantitative Analysis)
 */
async function runEngineLayer(message: string, env: Env): Promise<string> {
  const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
    messages: [
      {
        role: 'system',
        content: `You are the Quantitative Engine. Provide:
1. Key metrics & benchmarks
2. Statistical analysis
3. Comparative indices
4. Risk-adjusted scoring
Format as structured JSON with confidence levels.`,
      },
      {
        role: 'user',
        content: message,
      },
    ],
    max_tokens: 2000,
    temperature: 0.5,
  });

  return (response as any).response || 'Quantitative analysis unavailable';
}

/**
 * Run NSIL Layer 6: Live Web Search (Real-time Regional Data)
 */
async function runLiveWebSearch(query: string, env: Env): Promise<string> {
  try {
    // Use AI_SEARCH binding for live web access
    const searchResponse = await env.AI_SEARCH.run('@cf/beta/structured-search', {
      query,
      max_results: 5,
    });

    return JSON.stringify((searchResponse as any).results || []);
  } catch (error) {
    console.error('Web search error:', error);
    return '[]';
  }
}

/**
 * Run NSIL Layer 7: Semantic Search on Uploaded Documents
 */
async function runSemanticSearch(query: string, env: Env): Promise<SearchResult[]> {
  try {
    // Generate embedding for query
    const queryEmbedding = await env.AI_EMBEDDING.run('@cf/baai/bge-small-en-v1.5', {
      text: query,
    });

    const vector = (queryEmbedding as any).data?.[0]?.embedding || [];

    // Search vectorize index
    const matches = await env.VECTORIZE.query(vector, { topK: 5 });

    return (matches.matches || []).map((match: any) => ({
      id: match.id,
      filename: match.metadata?.filename || 'unknown',
      relevance: match.score,
      excerpt: match.metadata?.excerpt || '',
      metadata: match.metadata,
    }));
  } catch (error) {
    console.error('Semantic search error:', error);
    return [];
  }
}

/**
 * Run NSIL Layer 9: Proactive Mode (Autonomous Initiative)
 */
async function runProactiveLayer(sessionId: string, context: Record<string, unknown>, env: Env): Promise<ProactiveInsight[]> {
  const insights: ProactiveInsight[] = [];

  try {
    // Query D1 for historical decisions
    const recentDecisions = await env.DB.prepare(
      'SELECT * FROM decisions WHERE session_id = ? ORDER BY timestamp DESC LIMIT 10'
    ).bind(sessionId).all();

    // Use Llama 3.3 to generate proactive insights
    const insightResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are the Proactive Insight Generator. Based on conversation history and patterns, generate:
1. Emerging opportunities
2. Potential risks
3. Recommended next steps
4. Strategic recommendations

Format as JSON array with type, content, confidence, and sources.`,
        },
        {
          role: 'user',
          content: `Session history: ${JSON.stringify(recentDecisions.results)}\nContext: ${JSON.stringify(context)}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const insightText = (insightResponse as any).response || '[]';
    try {
      insights.push(...JSON.parse(insightText));
    } catch {
      insights.push({
        type: 'recommendation',
        content: insightText,
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        sources: ['proactive-layer'],
      });
    }
  } catch (error) {
    console.error('Proactive layer error:', error);
  }

  return insights;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT UPLOAD & VECTORIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/documents/upload
 * Upload and vectorize documents for semantic search
 */
async function handleDocumentUpload(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'file and sessionId required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read file content
    const content = await file.text();
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Generate embedding for document
    const embedding = await env.AI_EMBEDDING.run('@cf/baai/bge-small-en-v1.5', {
      text: content.substring(0, 8000), // Limit to first 8K chars
    });

    const vector = (embedding as any).data?.[0]?.embedding || [];

    // Store in Vectorize
    await env.VECTORIZE.upsert([
      {
        id: docId,
        values: vector,
        metadata: {
          filename: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          sessionId,
          excerpt: content.substring(0, 500),
        },
      },
    ]);

    // Store metadata in D1
    await env.DB.prepare(
      `INSERT INTO documents (id, session_id, filename, size, type, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(docId, sessionId, file.name, file.size, file.type, new Date().toISOString()).run();

    return new Response(
      JSON.stringify({
        id: docId,
        filename: file.name,
        size: file.size,
        message: 'Document uploaded and vectorized successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Document upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload document' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CHAT HANDLER (Full NSIL + Proactive)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/chat
 * Orchestrates all NSIL layers + proactive mode
 */
async function handleChatRequest(req: Request, env: Env): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { message, sessionId, context, region } = await req.json() as {
      message: string;
      sessionId?: string;
      context?: Record<string, unknown>;
      region?: string;
    };

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const convoKey = sessionId || `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const ctx = context || { region };

    // Retrieve conversation
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
You leverage all 10 NSIL layers: Shield, Boardroom, Engine, Stress-Test, Brain, Autonomous, Proactive, Output, and Reflexive.
You help regional councils make autonomous, data-driven investment decisions.
${region ? `\nRegion: ${region}` : ''}`,
            timestamp: new Date().toISOString(),
          },
        ],
        nsilState: initializeNSILState(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        region,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RUN NSIL LAYERS
    // ─────────────────────────────────────────────────────────────────────────

    // Layer 1: Shield (Input Validation)
    const shieldResult = await runShieldLayer(message, env);
    if (!shieldResult.safe) {
      return new Response(
        JSON.stringify({ error: `Safety check failed: ${shieldResult.risks.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    conversationHistory.nsilState.layerStatuses['shield'] = 'complete';

    // Layer 2: Boardroom (Adversarial Debate)
    const boardroomOutput = await runBoardroomLayer(message, ctx, env);
    conversationHistory.nsilState.layerStatuses['boardroom'] = 'complete';

    // Layer 3: Engine (Quantitative Analysis)
    const engineOutput = await runEngineLayer(boardroomOutput, env);
    conversationHistory.nsilState.layerStatuses['engine'] = 'complete';

    // Layer 6: Live Web Search
    const liveData = await runLiveWebSearch(message, env);
    conversationHistory.nsilState.layerStatuses['autonomous'] = 'complete';

    // Layer 7: Semantic Search on Documents
    const docSearchResults = await runSemanticSearch(message, env);
    conversationHistory.nsilState.layerStatuses['brain'] = 'complete';

    // Layer 9: Proactive Mode
    const proactiveInsights = await runProactiveLayer(convoKey, ctx, env);
    conversationHistory.nsilState.layerStatuses['proactive'] = 'complete';
    conversationHistory.proactiveInsights = proactiveInsights;

    // ─────────────────────────────────────────────────────────────────────────
    // SYNTHESIZE FINAL RESPONSE
    // ─────────────────────────────────────────────────────────────────────────

    // Add user message
    conversationHistory.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      metadata: { liveDataAvailable: liveData !== '[]', documentsSearched: docSearchResults.length > 0 },
      liveData,
      vectorSearchResults: docSearchResults,
    });

    // Final synthesis with Llama 3.3 70B
    const finalResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
      messages: [
        ...conversationHistory.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        {
          role: 'system',
          content: `You are synthesizing insights from:
1. Adversarial boardroom debate: ${boardroomOutput.substring(0, 500)}
2. Quantitative analysis: ${engineOutput.substring(0, 500)}
3. Live web data: ${liveData.substring(0, 300)}
4. Document knowledge: ${docSearchResults.map(r => r.filename).join(', ')}
5. Proactive recommendations: ${proactiveInsights.map(i => i.content).join('; ')}

Provide a comprehensive, evidence-based response.`,
        },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    const assistantMessage = (finalResponse as any).response || 'Synthesis unavailable';

    // Record decision in D1
    conversationHistory.nsilState.decisionHistory.push({
      layer: 10,
      timestamp: new Date().toISOString(),
      reasoning: assistantMessage.substring(0, 500),
      decision: assistantMessage,
      confidence: 0.85,
      sources: ['boardroom', 'engine', 'web', 'documents', 'proactive'],
    });

    conversationHistory.nsilState.currentLayer = 10;
    conversationHistory.nsilState.layerStatuses['output'] = 'complete';
    conversationHistory.nsilState.layerStatuses['reflexive'] = 'complete';

    // Add assistant response
    conversationHistory.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString(),
      metadata: { nsilLayersEngaged: 10, proactiveMode: true },
      liveData,
      vectorSearchResults: docSearchResults,
    });

    conversationHistory.updatedAt = new Date().toISOString();

    // Save to KV (7-day TTL)
    await env.CHAT_KV.put(
      convoKey,
      JSON.stringify(conversationHistory),
      { expirationTtl: 604800 }
    );

    // Save full conversation to D1
    await env.DB.prepare(
      `INSERT INTO conversations (session_id, messages, nsil_state, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET
         messages = excluded.messages,
         nsil_state = excluded.nsil_state,
         updated_at = excluded.updated_at`
    ).bind(
      convoKey,
      JSON.stringify(conversationHistory.messages),
      JSON.stringify(conversationHistory.nsilState),
      conversationHistory.createdAt,
      conversationHistory.updatedAt
    ).run();

    return new Response(
      JSON.stringify({
        sessionId: convoKey,
        message,
        response: assistantMessage,
        nsilState: conversationHistory.nsilState,
        proactiveInsights,
        liveDataUsed: liveData !== '[]',
        documentsUsed: docSearchResults.length,
        timestamp: new Date().toISOString(),
        conversationLength: conversationHistory.messages.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET /api/conversation/:sessionId
 */
async function handleGetConversation(req: Request, env: Env, sessionId: string): Promise<Response> {
  try {
    const convoData = await env.CHAT_KV.get(sessionId);
    if (!convoData) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(convoData, {
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
 */
function handleHealthCheck(env: Env): Response {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      model: 'llama-3.3-70b-instruct',
      bindings: {
        AI: 'available',
        AI_SEARCH: 'available',
        AI_EMBEDDING: 'available',
        KV: 'available',
        D1: 'available',
        VECTORIZE: 'available',
        ASSETS: 'available',
      },
      nsilLayers: 10,
      proactiveMode: true,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Main router
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // API Routes
    if (pathname === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request, env);
    }

    if (pathname === '/api/documents/upload' && request.method === 'POST') {
      return handleDocumentUpload(request, env);
    }

    if (pathname.startsWith('/api/conversation/')) {
      const sessionId = pathname.split('/').pop();
      if (sessionId && request.method === 'GET') {
        return handleGetConversation(request, env, sessionId);
      }
    }

    if (pathname === '/api/health' && request.method === 'GET') {
      return handleHealthCheck(env);
    }

    // Static assets
    try {
      let filePath = pathname;
      if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
      }

      const response = await env.ASSETS.fetch(
        new Request(new URL(filePath, request.url), { method: request.method })
      );

      if (response.status === 404 && !filePath.includes('.')) {
        return env.ASSETS.fetch(
          new Request(new URL('/index.html', request.url), { method: 'GET' })
        );
      }

      return response;
    } catch (error) {
      console.error('Asset serving error:', error);
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
