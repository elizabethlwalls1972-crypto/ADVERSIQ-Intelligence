// NSIL Multi-Agent Intelligence API — Pages Function
// This file handles ALL /api/* requests on adversiq-intelligence.pages.dev

interface Env {
  AI: any;
  NSIL_MEMORY: KVNamespace;
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
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
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
  const { message, context, agent } = await request.json() as any;
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
  const { query, depth } = await request.json() as any;
  const messages = [
    { role: 'system', content: 'You are a deep intelligence search analyst. Provide comprehensive, structured search results with sources, confidence ratings, and related intelligence.' },
    { role: 'user', content: `Conduct a${depth === 'deep' ? ' deep' : ''} intelligence search on: ${query}\n\nProvide: 1) Key findings 2) Sources 3) Confidence rating (1-10) 4) Related intelligence 5) Recommendations 6) Emerging patterns` },
  ];
  return json({ query, depth: depth || 'standard', results: await ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast'), timestamp: new Date().toISOString() });
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

// ===== ROUTER =====

export const onRequest: PagesFunction<Env> = async (context) => {
  const request = context.request;
  const env = context.env;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS,
    });
  }

  try {
    if (path === '/api/health') return handleHealth();
    if (path === '/api/status') return handleStatus(env);
    if (path === '/api/chat' && method === 'POST') return handleChat(request, env);
    if (path === '/api/search' && method === 'POST') return handleSearch(request, env);
    if (path === '/api/intelligence') return handleIntelligence(env);
    if (path === '/api/news') return handleNews(env);
    if (path === '/api/threats') return handleThreats(env);
    if (path === '/api/osint' && method === 'POST') return handleOSINT(request, env);
    if (path === '/api/geocode' && method === 'POST') return handleGeocode(request);
    if (path === '/api/analysis' && method === 'POST') return handleAnalysis(request, env);
    if (path === '/api/scrape' && method === 'POST') return handleScrape(request, env);
    if (path === '/api/morphic' && method === 'POST') return handleMorphic(request, env);
    if (path === '/api/adaptive' && method === 'POST') return handleAdaptive(request, env);
    if (path === '/api/ethical' && method === 'POST') return handleEthical(request, env);
    if (path === '/api/debate' && method === 'POST') return handleDebate(request, env);
    if (path === '/api/consensus' && method === 'POST') return handleConsensus(request, env);
    if (path === '/api/scan' && method === 'POST') return handleScan(request, env);
    if (path === '/api/memory' && method === 'GET') return handleMemoryGet(env);
    if (path === '/api/memory' && method === 'POST') return handleMemoryPost(request, env);
    if (path === '/api/nexus' && method === 'POST') return handleNexus(request, env);

    return json({ error: 'Endpoint not found', available: ['/api/health', '/api/status', '/api/chat', '/api/search', '/api/intelligence', '/api/news', '/api/threats', '/api/osint', '/api/geocode', '/api/analysis', '/api/scrape', '/api/morphic', '/api/adaptive', '/api/ethical', '/api/debate', '/api/consensus', '/api/scan', '/api/memory', '/api/nexus'] }, 404);
  } catch (err: any) {
    return json({ error: err.message, stack: err.stack?.slice(0, 500) }, 500);
  }
};
