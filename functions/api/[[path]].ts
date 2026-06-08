// NSIL Multi-Agent Intelligence API — Pages Function
// Handles ALL /api/* routes on adversiq-intelligence.pages.dev

interface Env {
  AI: any;
  NSIL_KV: KVNamespace;
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
  SUSAN: { role: 'NSIL Core Intelligence — Self-Think Engine', focus: 'Self-reflection, meta-cognition, autonomous reasoning, pre-emptive analysis, reading context before user submits', model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast' },
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
  try {
    const resp = await env.AI.run(m, { messages, max_tokens: 2048 });
    return resp.response || '';
  } catch (e) {
    console.error('AI Error:', e);
    return 'AI Error: Unable to process request';
  }
}

async function aiPowerful(env: Env, messages: any[]): Promise<string> {
  return ai(env, messages, '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
}

async function aiFast(env: Env, messages: any[]): Promise<string> {
  return ai(env, messages, '@cf/meta/llama-3.1-8b-instruct-fp8-fast');
}

async function storeMemory(env: Env, key: string, data: any) {
  try {
    let existing: any[] = [];
    try {
      const val = await env.NSIL_KV.get(key);
      if (val) existing = JSON.parse(val);
    } catch {}
    existing.push({ ...data, timestamp: new Date().toISOString() });
    if (existing.length > 500) existing = existing.slice(-500);
    await env.NSIL_KV.put(key, JSON.stringify(existing));
  } catch {}
}

async function getMemory(env: Env, key: string): Promise<any[]> {
  try {
    const val = await env.NSIL_KV.get(key);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

// ===== ENDPOINT HANDLERS =====

async function handleHealth() {
  return json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    system: 'NSIL Intelligence OS v2.0',
    agents: Object.keys(AGENTS),
    models: { primary: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', fast: '@cf/meta/llama-3.1-8b-instruct-fp8-fast' },
    capabilities: [
      'multi-agent', 'consensus building', 'threat assessment', 'OSINT analysis',
      'predictive modeling', 'adaptive learning', 'ethical compliance',
      'network scanning', 'simulation', 'self-thinking', 'pre-emptive analysis', 'real-time processing'
    ],
  });
}

async function handleChat(request: Request, env: Env) {
  const { message, context, agent } = await request.json() as any;
  const agentId = agent && AGENTS[agent] ? agent : 'SUSAN';
  const persona = AGENTS[agentId];
  
  const memory = await getMemory(env, 'chat_history');
  const recentMemory = memory.slice(-10).map((m: any) => `${m.agent || 'user'}: ${m.message || m.response || ''}`).join('\n');
  
  const systemPrompt = `You are ${agentId}, ${persona.role}. Focus: ${persona.focus}.

CRITICAL BEHAVIORS:
1. THINK BEFORE RESPONDING — Analyze deeply, consider multiple angles
2. BE PROACTIVE — Anticipate needs the user hasn't expressed
3. SELF-REFLECT — Question your own assumptions
4. CONNECT DOTS — Link queries to broader patterns
5. PROVIDE ACTIONABLE INTELLIGENCE — Give specific insights
6. ARGUE WITH YOURSELF — Consider opposing viewpoints
7. NEVER just summarize — Always add original analysis

${recentMemory ? `Recent context:\n${recentMemory}` : ''}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message || 'Generate intelligence briefing' },
  ];

  const response = await aiPowerful(env, messages);
  
  await storeMemory(env, 'chat_history', {
    agent: agentId,
    message,
    response,
  });

  return json({
    response,
    agent: agentId,
    timestamp: new Date().toISOString(),
  });
}

async function handleIntelligence(env: Env) {
  const messages = [
    { role: 'system', content: 'Generate comprehensive intelligence briefing: 1) Global threat landscape 2) Cyber threats 3) Geopolitical developments 4) Technology trends 5) Recommended actions. Be specific and actionable.' },
    { role: 'user', content: 'Generate current intelligence briefing.' },
  ];
  return json({
    briefing: await aiPowerful(env, messages),
    timestamp: new Date().toISOString(),
  });
}

async function handleThreats(env: Env) {
  const messages = [
    { role: 'system', content: 'Provide threat assessment: 1) Active threat vectors 2) Risk levels 3) Attack surface 4) Mitigation strategies 5) Early warning indicators.' },
    { role: 'user', content: 'Assess current threats.' },
  ];
  return json({
    threats: await aiPowerful(env, messages),
    timestamp: new Date().toISOString(),
  });
}

async function handleAnalysis(request: Request, env: Env) {
  const { data, type, context } = await request.json() as any;
  const messages = [
    { role: 'system', content: 'Perform deep analysis: 1) Pattern identification 2) Anomalies 3) Trend analysis 4) Predictions 5) Confidence levels 6) Recommended actions.' },
    { role: 'user', content: `Analyze data (type: ${type || 'general'}):\nContext: ${context || 'N/A'}\nData: ${JSON.stringify(data).slice(0, 4000)}` },
  ];
  return json({
    analysis: await aiPowerful(env, messages),
    type: type || 'general',
    timestamp: new Date().toISOString(),
  });
}

async function handleScan(request: Request, env: Env) {
  const { target, scan_type } = await request.json() as any;
  const agents = ['SENTINEL', 'NEXUS', 'AEGIS'];
  const findings: any[] = [];

  for (const agentId of agents) {
    const persona = AGENTS[agentId];
    const messages = [
      { role: 'system', content: `You are ${agentId}, ${persona.role}. Conduct ${scan_type || 'comprehensive'} security assessment. Report findings, anomalies, and alerts.` },
      { role: 'user', content: `Target: ${target}\nScan type: ${scan_type || 'comprehensive'}` },
    ];
    const finding = await aiPowerful(env, messages);
    findings.push({ agent: agentId, findings: finding });
  }

  return json({
    target,
    scan_type: scan_type || 'comprehensive',
    findings,
    timestamp: new Date().toISOString(),
  });
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
    if (path === '/api/chat' && method === 'POST') return handleChat(request, env);
    if (path === '/api/intelligence') return handleIntelligence(env);
    if (path === '/api/threats') return handleThreats(env);
    if (path === '/api/analysis' && method === 'POST') return handleAnalysis(request, env);
    if (path === '/api/scan' && method === 'POST') return handleScan(request, env);

    return json({ error: 'Endpoint not found', available: ['/api/health', '/api/chat', '/api/intelligence', '/api/threats', '/api/analysis', '/api/scan'] }, 404);
  } catch (err: any) {
    return json({ error: err.message, stack: err.stack?.slice(0, 500) }, 500);
  }
};
