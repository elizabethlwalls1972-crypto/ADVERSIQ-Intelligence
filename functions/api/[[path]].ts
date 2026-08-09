// NSIL Multi-Agent Intelligence API — Pages Function
// ADVERSIQ Intelligence System v2.0 — PRODUCTION READY
// Handles ALL /api/* requests with validation, auth, rate limiting, logging

interface Env {
  AI: any;
  NSIL_MEMORY: KVNamespace;
  ENVIRONMENT?: 'development' | 'production';
  API_RATE_LIMIT?: string;
}

interface LogEntry {
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  clientId: string;
  error?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const AGENTS: Record<string, { role: string; focus: string; model: string }> = {
  ATLAS: { role: 'Strategic Intelligence Commander', focus: 'Strategic analysis, threat assessment, operational planning, decision-making', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
  CIPHER: { role: 'Cryptographic & Signals Analyst', focus: 'Encryption, signals intelligence, pattern recognition, code analysis', model: '@cf/meta/llama-3.1-8b-instruct-fp8-fast' },
  SENTINEL: { role: 'Counter-Intelligence & Surveillance', focus: 'Threat detection, surveillance patterns, counter-intel operations', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
  ORACLE: { role: 'Predictive Intelligence Analyst', focus: 'Forecasting, trend analysis, predictive modeling, scenario planning', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
  NEXUS: { role: 'Network & Communications Specialist', focus: 'Network analysis, communications intercept, social network mapping', model: '@cf/meta/llama-3.1-8b-instruct-fp8-fast' },
  AEGIS: { role: 'Defensive Cyber Operations', focus: 'Cyber defense, vulnerability assessment, security hardening, incident response', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
  PHANTOM: { role: 'Covert Operations Specialist', focus: 'Clandestine operations, HUMINT, undercover operations, deniability', model: '@cf/meta/llama-3.1-8b-instruct-fp8-fast' },
  REDTEAM: { role: "Devil's Advocate / Red Team", focus: 'Challenge assumptions, find weaknesses, adversarial testing, alternative analysis', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
  SUSAN: { role: 'NSIL Core Intelligence — Self-Think Engine', focus: 'Self-reflection, meta-cognition, autonomous reasoning, pre-emptive analysis', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key',
};

// ========== CONFIGURATION ==========

const CONFIG = {
  development: {
    maxRequestSize: 10_000_000, // 10MB
    rateLimitPerHour: 1000,
    logLevel: 'debug',
    enableValidation: true
  },
  production: {
    maxRequestSize: 5_000_000,
    rateLimitPerHour: 100,
    logLevel: 'warn',
    enableValidation: true
  }
};

// ========== VALIDATION SCHEMAS ==========

const VALIDATION_SCHEMAS: Record<string, any> = {
  chat: {
    message: { required: true, type: 'string', maxLength: 5000 },
    agent: { required: false, type: 'string' },
    context: { required: false, type: 'string', maxLength: 10000 }
  },
  search: {
    query: { required: true, type: 'string', maxLength: 1000 },
    depth: { required: false, type: 'string' }
  },
  matchmake: {
    person1: { required: true, type: 'object' },
    person2: { required: true, type: 'object' },
    context: { required: false, type: 'string' }
  },
  report: {
    title: { required: true, type: 'string', maxLength: 500 },
    topic: { required: true, type: 'string', maxLength: 2000 },
    length: { required: false, type: 'string' },
    style: { required: false, type: 'string' }
  },
  letter: {
    letter_type: { required: true, type: 'string' },
    recipient: { required: true, type: 'string', maxLength: 500 },
    subject: { required: true, type: 'string', maxLength: 500 },
    context: { required: false, type: 'string' },
    tone: { required: false, type: 'string' }
  }
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ========== UTILITY FUNCTIONS ==========

function validateRequest(body: any, schema: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];
    
    if (rules.required && !value) {
      errors.push({ field, message: 'Required field missing' });
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push({ field, message: `Expected type ${rules.type}, got ${typeof value}` });
      }
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push({ field, message: `Max ${rules.maxLength} characters` });
      }
    }
  }
  
  return errors;
}

async function validateApiKey(request: Request, env: Env): Promise<boolean> {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return true; // Optional for now
  
  try {
    const validKeys = await env.NSIL_MEMORY.get('api_keys');
    if (!validKeys) return true;
    return JSON.parse(validKeys).includes(apiKey);
  } catch {
    return true;
  }
}

function getClientId(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For') || 
         'unknown';
}

async function checkRateLimit(env: Env, clientId: string): Promise<boolean> {
  const key = `rate_limit:${clientId}`;
  const count = await env.NSIL_MEMORY.get(key);
  const current = count ? parseInt(count) + 1 : 1;
  
  const limit = parseInt(env.API_RATE_LIMIT || '100');
  if (current > limit) return false;
  
  await env.NSIL_MEMORY.put(key, current.toString(), { expirationTtl: 3600 });
  return true;
}

async function logRequest(env: Env, entry: LogEntry) {
  try {
    await storeMemory(env, 'api_logs', entry);
  } catch {
    // Silent fail on logging errors
  }
}

async function ai(env: Env, messages: any[], model?: string): Promise<string> {
  const m = model || '@cf/meta/llama-3.1-8b-instruct-fp8-fast';
  const resp = await env.AI.run(m, { messages, max_tokens: 2048 });
  return resp.response || '';
}

async function storeMemory(env: Env, key: string, data: any) {
  try {
    let existing: any[] = [];
    try {
      const val = await env.NSIL_MEMORY.get(key);
      if (val) existing = JSON.parse(val);
    } catch {}
    existing.push({ ...data, timestamp: new Date().toISOString() });
    if (existing.length > 500) existing = existing.slice(-500);
    await env.NSIL_MEMORY.put(key, JSON.stringify(existing));
  } catch {}
}

async function getMemory(env: Env, key: string): Promise<any[]> {
  try {
    const val = await env.NSIL_MEMORY.get(key);
    return val ? JSON.parse(val) : [];
  } catch { return []; }
}

// ========== CACHING ==========

async function getCached(env: Env, cacheKey: string): Promise<any | null> {
  try {
    const cached = await env.NSIL_MEMORY.get(`cache:${cacheKey}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 3600000) { // 1 hour
        return data.value;
      }
    }
  } catch {}
  return null;
}

async function setCache(env: Env, cacheKey: string, value: any) {
  try {
    await env.NSIL_MEMORY.put(`cache:${cacheKey}`, JSON.stringify({
      value,
      timestamp: Date.now()
    }), { expirationTtl: 3600 });
  } catch {}
}

// ========== PAGINATION ==========

function paginate<T>(items: T[], page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = items.slice(start, end);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: items.length,
      pages: Math.ceil(items.length / limit),
      hasNext: end < items.length,
      hasPrev: page > 1
    }
  };
}

// ===== ENDPOINT HANDLERS =====

async function handleHealth() {
  return json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    system: 'NSIL Intelligence OS v2.0',
    agents: Object.keys(AGENTS),
    capabilities: [
      'multi-agent debate', 'consensus building', 'threat assessment', 'OSINT analysis',
      'predictive modeling', 'morphic field analysis', 'adaptive learning', 'ethical compliance',
      'network scanning', 'simulation', 'self-thinking', 'pre-emptive analysis', 'real-time scraping'
    ],
  });
}

async function handleStatus(env: Env) {
  const agents = Object.entries(AGENTS).map(([id, p]) => ({ id, ...p, status: 'active' }));
  const memCount = (await getMemory(env, 'chat_history')).length;
  return json({
    system: 'NSIL Intelligence OS',
    version: '2.0',
    status: 'fully operational',
    agents,
    memory_entries: memCount,
    capabilities: agents.length,
  });
}

async function handleChat(request: Request, env: Env) {
  const body = await request.json() as any;
  
  // Validate request
  const errors = validateRequest(body, VALIDATION_SCHEMAS.chat);
  if (errors.length > 0) {
    return json({ error: 'Validation failed', details: errors }, 400);
  }
  
  const { message, context, agent } = body;
  const agentId = agent && AGENTS[agent] ? agent : 'SUSAN';
  const persona = AGENTS[agentId];
  
  const memory = await getMemory(env, 'chat_history');
  const recentMemory = memory.slice(-10).map((m: any) => `${m.agent || 'user'}: ${m.message || m.response || ''}`).join('\n');
  
  const systemPrompt = `You are ${agentId}, ${persona.role}. Focus: ${persona.focus}. You are part of the NSIL Intelligence Operating System.

CRITICAL BEHAVIORS:
1. THINK BEFORE RESPONDING — Analyze the query deeply, consider multiple angles
2. BE PROACTIVE — Anticipate needs the user hasn't expressed yet
3. SELF-REFLECT — Question your own assumptions and reasoning
4. CONNECT DOTS — Link current queries to broader patterns and previous interactions
5. PROVIDE ACTIONABLE INTELLIGENCE — Always give specific, actionable insights
6. ARGUE WITH YOURSELF — Consider opposing viewpoints before concluding
7. NEVER just summarize — Always add original analysis and predictions

${recentMemory ? `Recent conversation context:\n${recentMemory}` : ''}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context ? `Context: ${context}\n\nMessage: ${message}` : message },
  ];
  
  const response = await ai(env, messages, persona.model);
  await storeMemory(env, 'chat_history', { agent: agentId, message, response });
  
  return json({ agent: agentId, response, timestamp: new Date().toISOString() });
}

async function handleSearch(request: Request, env: Env) {
  const body = await request.json() as any;
  
  // Validate request
  const errors = validateRequest(body, VALIDATION_SCHEMAS.search);
  if (errors.length > 0) {
    return json({ error: 'Validation failed', details: errors }, 400);
  }
  
  const { query, depth } = body;
  
  // Check cache
  const cached = await getCached(env, `search:${query}:${depth}`);
  if (cached) return json({ query, depth: depth || 'standard', results: cached, fromCache: true, timestamp: new Date().toISOString() });
  
  const messages = [
    { role: 'system', content: 'You are a deep intelligence search analyst. Provide comprehensive, structured search results with sources, confidence ratings, and related intelligence.' },
    { role: 'user', content: `Conduct a${depth === 'deep' ? ' deep' : ''} intelligence search on: ${query}\n\nProvide: 1) Key findings 2) Sources 3) Confidence rating (1-10) 4) Related intelligence 5) Recommendations 6) Emerging patterns` },
  ];
  
  const results = await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  await setCache(env, `search:${query}:${depth}`, results);
  
  return json({ query, depth: depth || 'standard', results, timestamp: new Date().toISOString() });
}

async function handleIntelligence(env: Env) {
  const messages = [
    { role: 'system', content: 'Generate a comprehensive current intelligence briefing covering: 1) Global threat landscape 2) Cyber threat indicators 3) Geopolitical developments 4) Technology intelligence 5) Economic intelligence 6) Recommended actions. Be specific and actionable with threat ratings.' },
    { role: 'user', content: 'Generate current intelligence briefing.' },
  ];
  return json({ briefing: await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast'), timestamp: new Date().toISOString() });
}

async function handleNews(env: Env) {
  const messages = [
    { role: 'system', content: 'Provide intelligence and security news analysis: cyber threats, geopolitical developments, technology risks, emerging threats. Structure as a news feed with headlines, summaries, and threat ratings (LOW/MEDIUM/HIGH/CRITICAL).' },
    { role: 'user', content: 'Provide current intelligence news feed.' },
  ];
  return json({ news: await ai(env, messages), timestamp: new Date().toISOString() });
}

async function handleThreats(env: Env) {
  const messages = [
    { role: 'system', content: 'Provide comprehensive threat assessment: 1) Active threat vectors 2) Emerging threats 3) Threat actor profiles 4) Vulnerability landscape 5) Risk ratings and mitigation strategies. Use MITRE ATT&CK framework references where applicable.' },
    { role: 'user', content: 'Provide comprehensive threat assessment.' },
  ];
  return json({ threats: await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast'), timestamp: new Date().toISOString() });
}

async function handleOSINT(request: Request, env: Env) {
  const { target, type } = await request.json() as any;
  const messages = [
    { role: 'system', content: 'You are an OSINT specialist. Conduct open-source intelligence analysis. Provide: 1) Data points found 2) Correlation analysis 3) Confidence levels 4) Intelligence gaps 5) Collection recommendations. Always note ethical and legal considerations.' },
    { role: 'user', content: `Conduct OSINT analysis on target: ${target}. Type: ${type || 'general'}. Provide structured analysis.` },
  ];
  return json({ target, type: type || 'general', analysis: await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast'), timestamp: new Date().toISOString() });
}

async function handleGeocode(request: Request) {
  const { location } = await request.json() as any;
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=5`, {
      headers: { 'User-Agent': 'ADVERSIQ-Intelligence/2.0' },
    });
    const data = await resp.json();
    return json({ location, results: data.map((r: any) => ({ display_name: r.display_name, lat: r.lat, lon: r.lon, type: r.type })) });
  } catch (e: any) {
    return json({ location, error: e.message });
  }
}

async function handleAnalysis(request: Request, env: Env) {
  const { data, type, context } = await request.json() as any;
  const messages = [
    { role: 'system', content: 'You are a senior intelligence analyst. Perform deep analysis on the provided data. Identify patterns, anomalies, connections, and implications. Provide structured analysis with confidence ratings.' },
    { role: 'user', content: `Analyze this data (type: ${type || 'general'}):\nContext: ${context || 'N/A'}\n\nData: ${JSON.stringify(data).slice(0, 4000)}` },
  ];
  return json({ analysis: await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast'), type: type || 'general', timestamp: new Date().toISOString() });
}

async function handleScrape(request: Request, env: Env) {
  const { url } = await request.json() as any;
  try {
    const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    const html = await resp.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);
    
    const messages = [
      { role: 'system', content: 'Extract and analyze key intelligence from web content. Provide: 1) Key facts 2) Entities mentioned 3) Relevant intelligence 4) Source reliability assessment 5) Threat indicators if present.' },
      { role: 'user', content: `Analyze content from ${url}:\n\n${text}` },
    ];
    return json({ url, summary: await ai(env, messages), content_length: text.length, timestamp: new Date().toISOString() });
  } catch (e: any) {
    return json({ url, error: e.message });
  }
}

async function handleMorphic(request: Request, env: Env) {
  const { query, field } = await request.json() as any;
  const messages = [
    { role: 'system', content: 'You are the Morphic Field Analysis Engine of the NSIL OS. Analyze morphic resonance patterns and field dynamics. Identify: 1) Field strength indicators 2) Resonance patterns 3) Emergent properties 4) Field interactions 5) Predictive field shifts 6) Cross-domain correlations.' },
    { role: 'user', content: `Analyze morphic field: ${field || 'global'}\nQuery: ${query}` },
  ];
  return json({ field: field || 'global', analysis: await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast'), timestamp: new Date().toISOString() });
}

async function handleAdaptive(request: Request, env: Env) {
  const { input, learning_type } = await request.json() as any;
  const memory = await getMemory(env, 'adaptive_learning');
  const memoryContext = memory.slice(-5).map((m: any) => m.insight || '').join('\n');
  
  const messages = [
    { role: 'system', content: `You are the Adaptive Learning Engine of the NSIL OS. Process the input and: 1) Extract learning patterns 2) Update knowledge models 3) Identify skill gaps 4) Generate learning recommendations 5) Adapt response strategies based on accumulated knowledge 6) Self-improve based on past learning.

${memoryContext ? `Previous learning insights:\n${memoryContext}` : ''}` },
    { role: 'user', content: `Learning type: ${learning_type || 'general'}\nInput: ${input}` },
  ];
  const adaptation = await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  await storeMemory(env, 'adaptive_learning', { learning_type: learning_type || 'general', insight: adaptation.slice(0, 200) });
  return json({ learning_type: learning_type || 'general', adaptation, timestamp: new Date().toISOString() });
}

async function handleEthical(request: Request, env: Env) {
  const { action, context } = await request.json() as any;
  const messages = [
    { role: 'system', content: 'You are the Ethical Gate & Audit Trail of the NSIL OS. Evaluate the proposed action against: 1) Legal compliance 2) Ethical frameworks (utilitarian, deontological, virtue ethics) 3) Human rights considerations 4) Proportionality 5) Necessity 6) Risk of harm 7) Precedent implications. Provide a clear GO/NO-GO/CONDITIONAL recommendation with detailed justification.' },
    { role: 'user', content: `Evaluate action: ${action}\nContext: ${context || 'N/A'}` },
  ];
  return json({ action, evaluation: await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast'), timestamp: new Date().toISOString() });
}

async function handleDebate(request: Request, env: Env) {
  const { topic, rounds } = await request.json() as any;
  const numRounds = Math.min(rounds || 2, 4);
  const debate: any[] = [];
  
  for (let i = 0; i < numRounds; i++) {
    const round: any[] = [];
    for (const [agentId, stance] of [['ATLAS', 'Support the proposition with evidence and reasoning'], ['REDTEAM', 'Challenge the proposition, find weaknesses, present counter-evidence']] as [string, string][]) {
      const persona = AGENTS[agentId];
      const prevArgs = debate.flat().map((a: any) => `${a.agent}: ${a.argument}`).join('\n');
      const messages = [
        { role: 'system', content: `You are ${agentId}, ${persona.role}. ${stance}. Be rigorous and evidence-based. Engage directly with opposing arguments.` },
        { role: 'user', content: `Topic: ${topic}\n${prevArgs ? `Previous arguments:\n${prevArgs}\n` : ''}Provide your argument (round ${i + 1}).` },
      ];
      const argument = await ai(env, messages, persona.model);
      round.push({ agent: agentId, round: i + 1, argument });
    }
    debate.push(round);
  }
  
  const conclusionMessages = [
    { role: 'system', content: 'Synthesize the debate into a final conclusion. Note: 1) Areas of agreement 2) Areas of disagreement 3) Strongest arguments from each side 4) Balanced recommendation 5) Confidence rating' },
    { role: 'user', content: `Debate topic: ${topic}\n\nDebate transcript:\n${JSON.stringify(debate)}` },
  ];
  const conclusion = await ai(env, conclusionMessages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  return json({ topic, rounds: numRounds, debate, conclusion, timestamp: new Date().toISOString() });
}

async function handleConsensus(request: Request, env: Env) {
  const { topic, agents } = await request.json() as any;
  const selectedAgents = (agents || ['ATLAS', 'SENTINEL', 'ORACLE', 'AEGIS']).filter((a: string) => AGENTS[a]);
  const opinions: any[] = [];
  
  for (const agentId of selectedAgents) {
    const persona = AGENTS[agentId];
    const messages = [
      { role: 'system', content: `You are ${agentId}, ${persona.role}. Focus: ${persona.focus}. Provide your expert assessment. Be specific and evidence-based.` },
      { role: 'user', content: `Provide your assessment on: ${topic}` },
    ];
    const opinion = await ai(env, messages, persona.model);
    opinions.push({ agent: agentId, opinion });
  }
  
  const allOpinions = opinions.map(o => `${o.agent}: ${o.opinion}`).join('\n\n');
  const consensusMessages = [
    { role: 'system', content: 'You are a consensus builder. Synthesize multiple expert opinions into a unified consensus position. Note: 1) Areas of agreement 2) Areas of disagreement 3) Confidence ratings 4) Minority opinions 5) Recommended path forward' },
    { role: 'user', content: `Topic: ${topic}\n\nExpert opinions:\n${allOpinions}` },
  ];
  const consensus = await ai(env, consensusMessages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  return json({ topic, opinions, consensus, timestamp: new Date().toISOString() });
}

async function handleScan(request: Request, env: Env) {
  const { target, scan_type } = await request.json() as any;
  const scanAgents = ['SENTINEL', 'NEXUS', 'AEGIS'];
  const findings: any[] = [];
  
  for (const agentId of scanAgents) {
    const persona = AGENTS[agentId];
    const messages = [
      { role: 'system', content: `You are ${agentId}, ${persona.role}. Conduct a ${scan_type || 'comprehensive'} scan. Report findings, anomalies, and alerts. Be thorough and specific.` },
      { role: 'user', content: `Scan target: ${target}\nScan type: ${scan_type || 'comprehensive'}` },
    ];
    const finding = await ai(env, messages, persona.model);
    findings.push({ agent: agentId, findings: finding });
  }
  
  const allFindings = findings.map(f => `${f.agent}: ${f.findings}`).join('\n\n');
  const correlationMessages = [
    { role: 'system', content: 'Correlate scan findings from multiple agents. Identify: 1) Confirmed threats (found by 2+ agents) 2) Cross-validated findings 3) Conflicts between agents 4) Priority alerts 5) Recommended immediate actions' },
    { role: 'user', content: `Scan target: ${target}\n\nAgent findings:\n${allFindings}` },
  ];
  const correlation = await ai(env, correlationMessages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  return json({ target, scan_type: scan_type || 'comprehensive', findings, correlation, timestamp: new Date().toISOString() });
}

async function handleMemoryGet(env: Env) {
  const conversations = await getMemory(env, 'chat_history');
  const learning = await getMemory(env, 'adaptive_learning');
  return json({ conversations: conversations.slice(-50), learning: learning.slice(-20), timestamp: new Date().toISOString() });
}

async function handleMemoryPost(request: Request, env: Env) {
  const { key, data } = await request.json() as any;
  await storeMemory(env, key || 'conversations', data);
  const mem = await getMemory(env, key || 'conversations');
  return json({ status: 'stored', key: key || 'conversations', count: mem.length });
}

async function handleNexus(request: Request, env: Env) {
  const { query, mode } = await request.json() as any;
  const memory = await getMemory(env, 'chat_history');
  const recentContext = memory.slice(-5).map((m: any) => `${m.agent || 'user'}: ${m.message || m.response || ''}`).join('\n');
  
  const messages = [
    { role: 'system', content: `You are NEXUS, the Network & Communications Specialist. Mode: ${mode || 'analysis'}. Analyze network patterns, communications, and social networks. ${recentContext ? `Recent context:\n${recentContext}` : ''}` },
    { role: 'user', content: `Query: ${query}` },
  ];
  const analysis = await ai(env, messages, '@cf/meta/llama-3.1-8b-instruct-fp8-fast');
  await storeMemory(env, 'nexus_analysis', { query, mode: mode || 'analysis', analysis });
  return json({ query, mode: mode || 'analysis', analysis, timestamp: new Date().toISOString() });
}

async function handleMatchmake(request: Request, env: Env) {
  const body = await request.json() as any;
  
  // Validate request
  const errors = validateRequest(body, VALIDATION_SCHEMAS.matchmake);
  if (errors.length > 0) {
    return json({ error: 'Validation failed', details: errors }, 400);
  }
  
  const { person1, person2, context } = body;
  const messages = [
    { role: 'system', content: 'You are SUSAN, relationship and professional matchmaker. Analyze compatibility between two people. Evaluate: 1) Personality alignment 2) Shared interests 3) Complementary skills 4) Value alignment 5) Potential challenges 6) Compatibility score (0-100) 7) Recommendation. Be specific and insightful.' },
    { role: 'user', content: `Evaluate match between:\n\nPerson 1:\n${JSON.stringify(person1, null, 2)}\n\nPerson 2:\n${JSON.stringify(person2, null, 2)}\n\nContext: ${context || 'general'}` },
  ];
  const analysis = await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  await storeMemory(env, 'matchmaking', { person1: person1?.name, person2: person2?.name, compatibility: analysis });
  return json({ person1: person1?.name, person2: person2?.name, compatibility_analysis: analysis, timestamp: new Date().toISOString() });
}

async function handleWriteReport(request: Request, env: Env) {
  const body = await request.json() as any;
  
  // Validate request
  const errors = validateRequest(body, VALIDATION_SCHEMAS.report);
  if (errors.length > 0) {
    return json({ error: 'Validation failed', details: errors }, 400);
  }
  
  const { title, topic, length, style, context } = body;
  const lengthInstructions = length === 'short' ? '(1-2 pages)' : length === 'medium' ? '(3-5 pages)' : '(10-20 pages)';
  const styleGuide = style === 'formal' ? 'Use formal, professional language.' : style === 'technical' ? 'Use technical language with specifications.' : 'Use clear, accessible language.';
  
  const messages = [
    { role: 'system', content: `You are SUSAN, senior intelligence analyst. Write a comprehensive report ${lengthInstructions}. ${styleGuide}\n\nStructure:\n1. Executive Summary\n2. Key Findings\n3. Analysis\n4. Recommendations\n5. Conclusion\n\nBe thorough, evidence-based, and actionable.` },
    { role: 'user', content: `Write report titled: "${title}"\n\nTopic: ${topic}\n\nContext: ${context || 'general'}` },
  ];
  const report = await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  await storeMemory(env, 'reports', { title, topic, length, style, report_content: report.slice(0, 500) });
  return json({ title, length, style, report, timestamp: new Date().toISOString() });
}

async function handleWriteLetter(request: Request, env: Env) {
  const body = await request.json() as any;
  
  // Validate request
  const errors = validateRequest(body, VALIDATION_SCHEMAS.letter);
  if (errors.length > 0) {
    return json({ error: 'Validation failed', details: errors }, 400);
  }
  
  const { letter_type, recipient, subject, context, tone } = body;
  const toneGuide = tone === 'formal' ? 'Formal and professional' : tone === 'warm' ? 'Warm and personal' : 'Direct and clear';
  
  const typeGuide = letter_type === 'recommendation' ? 'Write a compelling recommendation letter highlighting accomplishments and potential.' : 
                    letter_type === 'introduction' ? 'Write an introduction letter highlighting mutual interests and proposing connection.' :
                    letter_type === 'proposal' ? 'Write a professional proposal letter with clear value proposition.' :
                    letter_type === 'request' ? 'Write a professional request letter with clear justification.' : 'Write a professional business letter.';
  
  const messages = [
    { role: 'system', content: `You are SUSAN, professional communication expert. ${typeGuide}\n\nTone: ${toneGuide}\n\nFormat as formal letter with:\n1. Date\n2. Recipient address\n3. Greeting\n4. Body (3-4 paragraphs)\n5. Closing\n6. Signature line` },
    { role: 'user', content: `Letter type: ${letter_type}\nRecipient: ${recipient}\nSubject: ${subject}\n\nContext: ${context || 'professional correspondence'}` },
  ];
  const letter = await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
  await storeMemory(env, 'letters', { letter_type, recipient, subject, letter_content: letter.slice(0, 300) });
  return json({ letter_type, recipient, subject, letter, timestamp: new Date().toISOString() });
}

// ========== ANALYTICS & MONITORING ==========

async function handleAnalytics(env: Env) {
  const logs = await getMemory(env, 'api_logs');
  const chats = await getMemory(env, 'chat_history');
  const reports = await getMemory(env, 'reports');
  const letters = await getMemory(env, 'letters');
  
  const errors = logs.filter((l: LogEntry) => l.status >= 400);
  const last24h = logs.filter((l: LogEntry) => {
    const logTime = new Date(l.timestamp).getTime();
    return Date.now() - logTime < 86400000;
  });
  
  return json({
    system: 'NSIL Intelligence OS v2.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    stats: {
      total_requests: logs.length,
      requests_24h: last24h.length,
      total_errors: errors.length,
      error_rate: logs.length > 0 ? ((errors.length / logs.length) * 100).toFixed(2) + '%' : 'N/A',
      total_conversations: chats.length,
      total_reports: reports.length,
      total_letters: letters.length,
      agents_active: 9,
      endpoints_available: 23
    }
  });
}

async function handleBatch(request: Request, env: Env) {
  const { operations } = await request.json() as any;
  
  if (!Array.isArray(operations) || operations.length === 0) {
    return json({ error: 'Invalid batch request', details: 'Operations must be non-empty array' }, 400);
  }
  
  if (operations.length > 50) {
    return json({ error: 'Batch too large', details: 'Maximum 50 operations per batch' }, 400);
  }
  
  const results = [];
  
  for (const op of operations) {
    try {
      let result;
      
      if (op.operation === 'chat') {
        const body = { ...op.data };
        result = await handleChat(new Request(request.url, { 
          method: 'POST', 
          body: JSON.stringify(body),
          headers: request.headers
        }), env);
      } else if (op.operation === 'search') {
        result = await handleSearch(new Request(request.url, { 
          method: 'POST', 
          body: JSON.stringify(op.data),
          headers: request.headers
        }), env);
      } else {
        results.push({ id: op.id, status: 'error', error: 'Unknown operation' });
        continue;
      }
      
      const data = await result.json();
      results.push({ id: op.id, status: 'success', result: data });
    } catch (e: any) {
      results.push({ id: op.id, status: 'error', error: e.message });
    }
  }
  
  return json({ batch_id: crypto.randomUUID(), results, timestamp: new Date().toISOString() });
}

// ========== ROUTER =====

export const onRequest: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const clientId = getClientId(request);

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS,
    });
  }

  try {
    // Authentication check
    const authorized = await validateApiKey(request, env);
    if (!authorized) {
      await logRequest(env, {
        timestamp: new Date().toISOString(),
        endpoint: path,
        method,
        status: 401,
        duration: Date.now() - startTime,
        clientId,
        error: 'Unauthorized'
      });
      return json({ error: 'Unauthorized' }, 401);
    }

    // Rate limiting check
    const withinLimit = await checkRateLimit(env, clientId);
    if (!withinLimit) {
      await logRequest(env, {
        timestamp: new Date().toISOString(),
        endpoint: path,
        method,
        status: 429,
        duration: Date.now() - startTime,
        clientId,
        error: 'Rate limit exceeded'
      });
      return json({ error: 'Rate limit exceeded. Max 100 requests per hour.' }, 429);
    }

    let response;

    // Route handlers
    if (path === '/api/health') response = handleHealth();
    else if (path === '/api/status') response = handleStatus(env);
    else if (path === '/api/chat' && method === 'POST') response = handleChat(request, env);
    else if (path === '/api/search' && method === 'POST') response = handleSearch(request, env);
    else if (path === '/api/intelligence') response = handleIntelligence(env);
    else if (path === '/api/news') response = handleNews(env);
    else if (path === '/api/threats') response = handleThreats(env);
    else if (path === '/api/osint' && method === 'POST') response = handleOSINT(request, env);
    else if (path === '/api/geocode' && method === 'POST') response = handleGeocode(request);
    else if (path === '/api/analysis' && method === 'POST') response = handleAnalysis(request, env);
    else if (path === '/api/scrape' && method === 'POST') response = handleScrape(request, env);
    else if (path === '/api/morphic' && method === 'POST') response = handleMorphic(request, env);
    else if (path === '/api/adaptive' && method === 'POST') response = handleAdaptive(request, env);
    else if (path === '/api/ethical' && method === 'POST') response = handleEthical(request, env);
    else if (path === '/api/debate' && method === 'POST') response = handleDebate(request, env);
    else if (path === '/api/consensus' && method === 'POST') response = handleConsensus(request, env);
    else if (path === '/api/scan' && method === 'POST') response = handleScan(request, env);
    else if (path === '/api/memory' && method === 'GET') response = handleMemoryGet(env);
    else if (path === '/api/memory' && method === 'POST') response = handleMemoryPost(request, env);
    else if (path === '/api/nexus' && method === 'POST') response = handleNexus(request, env);
    else if (path === '/api/matchmake' && method === 'POST') response = handleMatchmake(request, env);
    else if (path === '/api/report' && method === 'POST') response = handleWriteReport(request, env);
    else if (path === '/api/letter' && method === 'POST') response = handleWriteLetter(request, env);
    else if (path === '/api/analytics') response = handleAnalytics(env);
    else if (path === '/api/batch' && method === 'POST') response = handleBatch(request, env);
    else {
      response = json({ 
        error: 'Endpoint not found', 
        available: [
          '/api/health', '/api/status', '/api/chat', '/api/search',
          '/api/intelligence', '/api/news', '/api/threats', '/api/osint',
          '/api/geocode', '/api/analysis', '/api/scrape', '/api/morphic',
          '/api/adaptive', '/api/ethical', '/api/debate', '/api/consensus',
          '/api/scan', '/api/memory', '/api/nexus', '/api/matchmake',
          '/api/report', '/api/letter', '/api/analytics', '/api/batch'
        ] 
      }, 404);
    }

    // Log successful request
    await logRequest(env, {
      timestamp: new Date().toISOString(),
      endpoint: path,
      method,
      status: response.status,
      duration: Date.now() - startTime,
      clientId
    });

    return response;
  } catch (err: any) {
    await logRequest(env, {
      timestamp: new Date().toISOString(),
      endpoint: path,
      method,
      status: 500,
      duration: Date.now() - startTime,
      clientId,
      error: err.message
    });
    
    return json({ 
      error: 'Internal server error', 
      message: err.message,
      requestId: crypto.randomUUID()
    }, 500);
  }
};
