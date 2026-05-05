/**
 * TOOL REGISTRY — Dynamic Tool/Function Calling for ADVERSIQ
 * 
 * Provides structured tool schemas so the AI brain can decide
 * WHEN to call WHICH tool based on the situation.
 * 
 * Architecture:
 * ┌──────────────────────────────────────────────┐
 * │  ToolRegistry                                │
 * │  ├─ register(tool)     → add tool + schema   │
 * │  ├─ call(name, args)   → execute dynamically  │
 * │  ├─ getSchemas()       → for AI prompt injection│
 * │  └─ match(intent)      → suggest relevant tools│
 * └──────────────────────────────────────────────┘
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  enum?: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  category: 'research' | 'verification' | 'analysis' | 'generation' | 'data';
  parameters: ToolParameter[];
  returns: string;
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  data: unknown;
  error?: string;
  executionTimeMs: number;
  confidence?: number;
}

export interface Tool {
  schema: ToolSchema;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export type ToolCallDecision = {
  toolName: string;
  args: Record<string, unknown>;
  reason: string;
  priority: number;
};

// ============================================================================
// TOOL REGISTRY
// ============================================================================

class ToolRegistryImpl {
  private tools = new Map<string, Tool>();
  private callLog: Array<{ toolName: string; timestamp: number; success: boolean; timeMs: number }> = [];

  register(tool: Tool): void {
    this.tools.set(tool.schema.name, tool);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getSchemas(): ToolSchema[] {
    return Array.from(this.tools.values()).map(t => t.schema);
  }

  getSchemasForPrompt(): string {
    const schemas = this.getSchemas();
    if (schemas.length === 0) return '';
    return schemas.map(s => {
      const params = s.parameters.map(p =>
        `    - ${p.name} (${p.type}${p.required ? ', required' : ''}): ${p.description}`
      ).join('\n');
      return `TOOL: ${s.name}\n  Category: ${s.category}\n  Description: ${s.description}\n  Parameters:\n${params}\n  Returns: ${s.returns}`;
    }).join('\n\n');
  }

  /**
   * Match tools relevant to a given intent/context
   */
  matchTools(intent: string, context?: Record<string, unknown>): ToolCallDecision[] {
    const decisions: ToolCallDecision[] = [];
    const intentLower = intent.toLowerCase();

    for (const [name, tool] of this.tools) {
      const schema = tool.schema;
      let priority = 0;
      let reason = '';

      // Keyword matching against tool description and category
      const descLower = schema.description.toLowerCase();
      const words = intentLower.split(/\s+/);
      const matchCount = words.filter(w => descLower.includes(w) || name.toLowerCase().includes(w)).length;

      if (matchCount >= 2) {
        priority = matchCount;
        reason = `Matches intent keywords (${matchCount} hits)`;
      }

      // Category-based matching
      if (intentLower.includes('search') || intentLower.includes('research') || intentLower.includes('find')) {
        if (schema.category === 'research') { priority += 3; reason = 'Research intent detected'; }
      }
      if (intentLower.includes('verify') || intentLower.includes('check') || intentLower.includes('validate')) {
        if (schema.category === 'verification') { priority += 3; reason = 'Verification intent detected'; }
      }
      if (intentLower.includes('analyz') || intentLower.includes('assess') || intentLower.includes('evaluat')) {
        if (schema.category === 'analysis') { priority += 3; reason = 'Analysis intent detected'; }
      }
      if (intentLower.includes('generate') || intentLower.includes('write') || intentLower.includes('create') || intentLower.includes('draft')) {
        if (schema.category === 'generation') { priority += 3; reason = 'Generation intent detected'; }
      }

      // Context-based matching
      if (context) {
        if (context.country && (name.includes('entity') || name.includes('sanctions') || name.includes('geo'))) {
          priority += 2;
          reason += '; country context present';
        }
        if (context.organizationName && name.includes('entity')) {
          priority += 3;
          reason += '; entity name present';
        }
      }

      if (priority > 0) {
        decisions.push({ toolName: name, args: {}, reason, priority });
      }
    }

    return decisions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Execute a tool by name with arguments
   */
  async call(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { toolName: name, success: false, data: null, error: `Tool "${name}" not found`, executionTimeMs: 0 };
    }

    // Validate required parameters
    for (const param of tool.schema.parameters) {
      if (param.required && !(param.name in args)) {
        return { toolName: name, success: false, data: null, error: `Missing required parameter: ${param.name}`, executionTimeMs: 0 };
      }
    }

    const start = Date.now();
    try {
      const data = await tool.execute(args);
      const timeMs = Date.now() - start;
      this.callLog.push({ toolName: name, timestamp: Date.now(), success: true, timeMs });
      return { toolName: name, success: true, data, executionTimeMs: timeMs };
    } catch (err) {
      const timeMs = Date.now() - start;
      this.callLog.push({ toolName: name, timestamp: Date.now(), success: false, timeMs });
      return { toolName: name, success: false, data: null, error: String(err), executionTimeMs: timeMs };
    }
  }

  /**
   * Execute multiple tools in parallel
   */
  async callParallel(calls: Array<{ name: string; args: Record<string, unknown> }>): Promise<ToolResult[]> {
    return Promise.all(calls.map(c => this.call(c.name, c.args)));
  }

  getCallLog() {
    return this.callLog.slice(-100);
  }
}

export const toolRegistry = new ToolRegistryImpl();

// ============================================================================
// REGISTER BUILT-IN TOOLS
// ============================================================================

import { satSolver } from './SATContradictionSolver';
import { bayesianDebateEngine } from './BayesianDebateEngine';
import { dagScheduler } from './DAGScheduler';
import { globalVectorIndex } from './VectorMemoryIndex';
import { HumanCognitionEngine } from './HumanCognitionEngine';
import type { ReportParameters } from '../../types';

// SAT Contradiction Check
toolRegistry.register({
  schema: {
    name: 'contradiction_check',
    description: 'Run DPLL satisfiability analysis to detect logical contradictions in user inputs or engine conclusions',
    category: 'verification',
    parameters: [
      { name: 'riskTolerance', type: 'string', description: 'Risk level: conservative, moderate, aggressive, high', required: false },
      { name: 'budget', type: 'string', description: 'Budget description', required: false },
      { name: 'strategicIntent', type: 'array', description: 'Strategic goals', required: false },
      { name: 'timeline', type: 'string', description: 'Timeline description', required: false },
    ],
    returns: 'Contradiction analysis with satisfiability status, contradiction list, and confidence score',
  },
  execute: async (args) => satSolver.analyze(args as unknown as ReportParameters),
});

// Bayesian Debate
toolRegistry.register({
  schema: {
    name: 'adversarial_debate',
    description: 'Run 5-persona Bayesian debate with Nash bargaining to reach consensus on proceed/pause/restructure/reject',
    category: 'analysis',
    parameters: [
      { name: 'country', type: 'string', description: 'Target country', required: false },
      { name: 'industry', type: 'array', description: 'Industry sectors', required: false },
      { name: 'riskTolerance', type: 'string', description: 'Risk tolerance level', required: false },
    ],
    returns: 'Debate result with recommendation, consensus strength, and per-persona reasoning',
  },
  execute: async (args) => bayesianDebateEngine.runDebate(args as unknown as ReportParameters),
});

// Formula Execution (DAG)
toolRegistry.register({
  schema: {
    name: 'formula_scoring',
    description: 'Execute 21+ interdependent scoring formulas via DAG scheduler for comprehensive case assessment',
    category: 'analysis',
    parameters: [
      { name: 'country', type: 'string', description: 'Target country', required: false },
      { name: 'industry', type: 'array', description: 'Industry sectors', required: false },
      { name: 'budget', type: 'string', description: 'Budget', required: false },
    ],
    returns: 'All formula scores with execution order and timing',
  },
  execute: async (args) => dagScheduler.execute(args as unknown as ReportParameters),
});

// Memory Retrieval
toolRegistry.register({
  schema: {
    name: 'memory_search',
    description: 'Search vector memory index for similar historical cases using cosine similarity and LSH',
    category: 'research',
    parameters: [
      { name: 'country', type: 'string', description: 'Country to match', required: false },
      { name: 'industry', type: 'array', description: 'Industries to match', required: false },
      { name: 'maxResults', type: 'number', description: 'Maximum results to return (default 5)', required: false },
    ],
    returns: 'Similar cases ranked by relevance with match reasons',
  },
  execute: async (args) => {
    const max = (args.maxResults as number) || 5;
    return globalVectorIndex.findSimilar(args as unknown as ReportParameters, max);
  },
});

// Human Cognition Engine
toolRegistry.register({
  schema: {
    name: 'cognitive_modelling',
    description: 'Run computational neuroscience models: Wilson-Cowan neural fields, Friston Free Energy, attention allocation, emotional processing',
    category: 'analysis',
    parameters: [
      { name: 'decisionType', type: 'string', description: 'Type of decision being modelled', required: false },
    ],
    returns: 'Cognitive processing results including attention map, emotional response, working memory load, and conscious access status',
  },
  execute: async (args) => {
    const hce = new HumanCognitionEngine();
    return hce.process(args as unknown as ReportParameters);
  },
});

// Quick Consensus Check
toolRegistry.register({
  schema: {
    name: 'quick_consensus',
    description: 'Fast consensus check without full debate — returns likely recommendation and confidence in <50ms',
    category: 'analysis',
    parameters: [],
    returns: 'Quick recommendation (proceed/pause/restructure/reject) with confidence percentage',
  },
  execute: async (args) => bayesianDebateEngine.quickConsensus(args as unknown as ReportParameters),
});

// ============================================================================
// LIVE WEB INTELLIGENCE TOOLS
// Free APIs — no key required. Called at inference time for real-world data.
// ============================================================================

import { calibrationStore } from './NSILCalibrationStore';
import { noveltyDetector } from './NoveltyDetector';
import { selfAuditGenerator } from './SelfAuditReport';

// ── Wikipedia — free, no key, live ──────────────────────────────────────────
toolRegistry.register({
  schema: {
    name: 'wikipedia_search',
    description: 'Retrieve live Wikipedia article summary for a country, company, sector, or topic. Returns current factual overview.',
    category: 'research',
    parameters: [
      { name: 'query', type: 'string', description: 'Search term — country name, company, sector, or topic', required: true },
    ],
    returns: 'Article title, summary extract, and URL from Wikipedia (live)',
  },
  execute: async (args) => {
    const q = String(args.query ?? '').trim().slice(0, 200);
    if (!q) throw new Error('query required');
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&format=json&redirects=1&titles=${encodeURIComponent(q)}&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } });
    if (!res.ok) throw new Error(`Wikipedia API error ${res.status}`);
    const data = await res.json() as { query: { pages: Record<string, { title: string; extract?: string }> } };
    const pages = Object.values(data.query.pages);
    if (!pages.length || pages[0].title === 'Special:Search') return { found: false, query: q };
    const page = pages[0];
    const extract = (page.extract ?? '').split('\n').filter(Boolean).slice(0, 8).join(' ');
    return {
      found: true,
      title: page.title,
      summary: extract.slice(0, 1200),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
      source: 'Wikipedia (live)',
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── World Bank — free, no key, live economic data ────────────────────────────
toolRegistry.register({
  schema: {
    name: 'worldbank_indicator',
    description: 'Retrieve live World Bank economic indicator for a country. Indicators: GDP growth (NY.GDP.MKTP.KD.ZG), FDI (BX.KLT.DINV.WD.GD.ZS), inflation (FP.CPI.TOTL.ZG), unemployment (SL.UEM.TOTL.ZS), ease of doing business rank (IC.BUS.EASE.XQ).',
    category: 'data',
    parameters: [
      { name: 'countryCode', type: 'string', description: 'ISO 2-letter country code e.g. VN, PH, KE, BR', required: true },
      { name: 'indicator', type: 'string', description: 'World Bank indicator code', required: true },
    ],
    returns: 'Most recent available value with year from World Bank API (live)',
  },
  execute: async (args) => {
    const code = String(args.countryCode ?? '').trim().slice(0, 3).toUpperCase();
    const indicator = String(args.indicator ?? '').trim().slice(0, 60);
    if (!code || !indicator) throw new Error('countryCode and indicator required');
    const url = `https://api.worldbank.org/v2/country/${code}/indicator/${indicator}?format=json&mrv=3&per_page=3`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } });
    if (!res.ok) throw new Error(`World Bank API error ${res.status}`);
    const data = await res.json() as [unknown, Array<{ date: string; value: number | null; country: { value: string } }>];
    const records = Array.isArray(data[1]) ? data[1].filter(r => r.value !== null) : [];
    if (!records.length) return { found: false, countryCode: code, indicator };
    const latest = records[0];
    return {
      found: true,
      country: latest.country?.value ?? code,
      indicator,
      value: latest.value,
      year: latest.date,
      source: 'World Bank Open Data (live)',
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── REST Countries — free, no key, live country metadata ────────────────────
toolRegistry.register({
  schema: {
    name: 'country_profile',
    description: 'Retrieve live country profile: region, subregion, population, capital, currencies, languages, borders, area. Use for contextualising NSIL formula inputs.',
    category: 'data',
    parameters: [
      { name: 'country', type: 'string', description: 'Full country name in English e.g. Vietnam, Philippines', required: true },
    ],
    returns: 'Country metadata from REST Countries API (live)',
  },
  execute: async (args) => {
    const name = String(args.country ?? '').trim().slice(0, 100);
    if (!name) throw new Error('country required');
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false&fields=name,region,subregion,population,capital,currencies,languages,borders,area,flags`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } });
    if (!res.ok) return { found: false, country: name };
    const data = await res.json() as Array<{
      name: { common: string; official: string };
      region: string; subregion: string; population: number;
      capital?: string[]; area: number; borders?: string[];
      currencies?: Record<string, { name: string }>;
      languages?: Record<string, string>;
    }>;
    if (!data.length) return { found: false, country: name };
    const c = data[0];
    return {
      found: true,
      commonName: c.name.common,
      officialName: c.name.official,
      region: c.region,
      subregion: c.subregion,
      population: c.population,
      area: c.area,
      capital: c.capital?.[0] ?? null,
      currencies: Object.values(c.currencies ?? {}).map(v => v.name),
      languages: Object.values(c.languages ?? {}),
      borderingCountries: c.borders ?? [],
      source: 'REST Countries API (live)',
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── DuckDuckGo Instant Answer — free, no key ─────────────────────────────────
toolRegistry.register({
  schema: {
    name: 'live_search',
    description: 'Perform a live web search for current news, events, or facts about a country, company, or sector using DuckDuckGo Instant Answers.',
    category: 'research',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query — be specific e.g. "Vietnam FDI 2025" or "Philippines renewable energy policy"', required: true },
    ],
    returns: 'Instant answer summary and related topics from DuckDuckGo (live)',
  },
  execute: async (args) => {
    const q = String(args.query ?? '').trim().slice(0, 300);
    if (!q) throw new Error('query required');
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } });
    if (!res.ok) throw new Error(`DuckDuckGo API error ${res.status}`);
    const data = await res.json() as {
      Heading?: string; AbstractText?: string; AbstractURL?: string; AbstractSource?: string;
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
    };
    const related = (data.RelatedTopics ?? [])
      .filter(t => t.Text && t.FirstURL)
      .slice(0, 5)
      .map(t => ({ text: t.Text, url: t.FirstURL }));
    return {
      found: !!(data.AbstractText || related.length),
      query: q,
      heading: data.Heading ?? null,
      summary: data.AbstractText ?? null,
      source: data.AbstractSource ?? null,
      url: data.AbstractURL ?? null,
      relatedTopics: related,
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── NSIL Self-Audit — epistemic audit of a completed run ────────────────────
toolRegistry.register({
  schema: {
    name: 'self_audit',
    description: 'Generate a NSIL Self-Audit Report for a completed analysis run. Produces §1 Epistemic Status, §2 Source Taxonomy, §3 Known Unknowns, §4 Assumption Ledger, §5 Adversarial Stress, §6 Human Action Items, §7 Calibration Trail.',
    category: 'verification',
    parameters: [
      { name: 'country', type: 'string', description: 'Target country', required: false },
      { name: 'industry', type: 'array', description: 'Industry sectors', required: false },
      { name: 'scores', type: 'object', description: 'Formula scores object from a completed NSIL run', required: true },
    ],
    returns: 'Full SelfAuditReport object with epistemic status, source taxonomy, known unknowns, and calibration trail',
  },
  execute: async (args) => {
    const scores = (args.scores ?? {}) as Record<string, number>;
    const params = { country: args.country as string, industry: args.industry as string[] } as ReportParameters;
    return selfAuditGenerator.generate(params, scores);
  },
});

// ── Novelty Detection — is this scenario unprecedented? ─────────────────────
toolRegistry.register({
  schema: {
    name: 'novelty_detect',
    description: 'Assess how novel a scenario is relative to NSIL historical calibration data. Returns novelty index (0–100), confidence multiplier, and epistemic statement.',
    category: 'verification',
    parameters: [
      { name: 'country', type: 'string', description: 'Target country', required: false },
      { name: 'industry', type: 'array', description: 'Industry sectors', required: false },
      { name: 'scores', type: 'object', description: 'Formula scores to check against historical distribution', required: false },
    ],
    returns: 'NoveltyReport with index, level, confidence multiplier, novel elements, and epistemic statement',
  },
  execute: async (args) => {
    return noveltyDetector.detect({
      country: args.country as string,
      industry: args.industry as string[],
      scores: args.scores as Record<string, number>,
    });
  },
});

// ── Calibration Store Record — persist scores to distribution ────────────────
toolRegistry.register({
  schema: {
    name: 'calibration_record',
    description: 'Record formula scores from a completed NSIL run into the calibration store. This is how the system self-calibrates over time — each run improves the statistical baseline.',
    category: 'data',
    parameters: [
      { name: 'scores', type: 'object', description: 'Formula scores object', required: true },
      { name: 'country', type: 'string', description: 'Target country for context tagging', required: false },
      { name: 'industry', type: 'array', description: 'Industry sectors for context tagging', required: false },
    ],
    returns: 'Confirmation with updated distribution statistics for each recorded formula',
  },
  execute: async (args) => {
    const scores = (args.scores ?? {}) as Record<string, number>;
    calibrationStore.recordRun(scores, {
      country: args.country as string,
      industry: args.industry as string[],
    });
    const stats: Record<string, { n: number; mean: number; std: number }> = {};
    for (const formulaId of Object.keys(scores)) {
      const dist = calibrationStore.getDistribution(formulaId);
      if (dist) stats[formulaId] = { n: dist.n, mean: parseFloat(dist.mean.toFixed(2)), std: parseFloat(dist.std.toFixed(2)) };
    }
    return { recorded: Object.keys(scores).length, updatedDistributions: stats };
  },
});

