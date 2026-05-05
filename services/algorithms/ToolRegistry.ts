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

// ============================================================================
// FREE GLOBAL INTELLIGENCE TOOLS — no API key, no cost, live data
// ============================================================================

import { localReasoningEngine } from '../LocalReasoningEngine.js';

// ── Exchange Rates — frankfurter.app, free, no key ───────────────────────────
toolRegistry.register({
  schema: {
    name: 'exchange_rates',
    description: 'Get live foreign exchange rates from any base currency. No API key required. Use for currency risk analysis, investment returns in local currency, or TCO conversion.',
    category: 'data',
    parameters: [
      { name: 'base', type: 'string', description: 'Base currency code e.g. USD, EUR, GBP', required: true },
      { name: 'targets', type: 'string', description: 'Comma-separated target currencies e.g. PHP,VND,KES,NGN,BRL', required: false },
    ],
    returns: 'Live exchange rates from frankfurter.app with date',
  },
  execute: async (args) => {
    const base = String(args.base ?? 'USD').toUpperCase().slice(0, 3);
    const targets = args.targets ? `&to=${String(args.targets).toUpperCase().slice(0, 100)}` : '';
    const url = `https://api.frankfurter.app/latest?from=${base}${targets}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } });
    if (!res.ok) throw new Error(`Exchange rate API error ${res.status}`);
    const data = await res.json() as { amount: number; base: string; date: string; rates: Record<string, number> };
    return {
      base: data.base,
      date: data.date,
      rates: data.rates,
      source: 'Frankfurter (ECB data) — free, no API key',
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── RSS/ATOM News Feed — any public RSS URL, free, no key ────────────────────
toolRegistry.register({
  schema: {
    name: 'rss_news',
    description: 'Fetch and parse any public RSS/ATOM news feed. Returns latest headlines with dates. Suggested feeds: BBC World (https://feeds.bbci.co.uk/news/world/rss.xml), Reuters (https://feeds.reuters.com/reuters/topNews), FT (https://www.ft.com/?format=rss).',
    category: 'research',
    parameters: [
      { name: 'feedUrl', type: 'string', description: 'Full RSS/ATOM feed URL', required: true },
      { name: 'limit', type: 'number', description: 'Max articles to return (default 10, max 20)', required: false },
    ],
    returns: 'Array of { title, link, pubDate, description } from the feed',
  },
  execute: async (args) => {
    const feedUrl = String(args.feedUrl ?? '').trim();
    if (!feedUrl.startsWith('http')) throw new Error('feedUrl must be a valid http/https URL');
    const limit = Math.min(Number(args.limit ?? 10), 20);

    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0', 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
    });
    if (!res.ok) throw new Error(`RSS fetch error ${res.status}`);
    const xml = await res.text();

    // Parse RSS items with simple regex (no XML library needed for standard feeds)
    const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
    const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    const extract = (block: string, tag: string): string => {
      const m = block.match(new RegExp(`<${tag}(?:[^>]*)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/${tag}>`, 'i'));
      return m ? m[1].trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : '';
    };

    while ((match = itemRegex.exec(xml)) && items.length < limit) {
      const block = match[1];
      items.push({
        title: extract(block, 'title').slice(0, 200),
        link: extract(block, 'link') || extract(block, 'guid'),
        pubDate: extract(block, 'pubDate') || extract(block, 'published') || extract(block, 'updated'),
        description: extract(block, 'description').replace(/<[^>]+>/g, '').slice(0, 400),
      });
    }

    // Also handle ATOM <entry> format
    if (items.length === 0) {
      const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
      while ((match = entryRegex.exec(xml)) && items.length < limit) {
        const block = match[1];
        const linkMatch = block.match(/<link[^>]+href="([^"]+)"/i);
        items.push({
          title: extract(block, 'title').slice(0, 200),
          link: linkMatch?.[1] || '',
          pubDate: extract(block, 'published') || extract(block, 'updated'),
          description: extract(block, 'summary').replace(/<[^>]+>/g, '').slice(0, 400),
        });
      }
    }

    const feedTitle = xml.match(/<title(?:[^>]*)>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1] ?? feedUrl;
    return {
      feed: feedTitle.slice(0, 100),
      itemCount: items.length,
      items,
      source: feedUrl,
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── Open-Meteo — weather forecast, free, no key ──────────────────────────────
toolRegistry.register({
  schema: {
    name: 'weather_forecast',
    description: 'Get current weather and 7-day forecast for any city. Free, no API key. Useful for agriculture, logistics, disaster risk, and operational planning analysis.',
    category: 'data',
    parameters: [
      { name: 'city', type: 'string', description: 'City name e.g. Manila, Nairobi, Lagos, Jakarta', required: false },
      { name: 'latitude', type: 'number', description: 'Latitude (alternative to city)', required: false },
      { name: 'longitude', type: 'number', description: 'Longitude (alternative to city)', required: false },
    ],
    returns: 'Current temperature, wind speed, precipitation, and 7-day forecast from Open-Meteo',
  },
  execute: async (args) => {
    let lat = Number(args.latitude ?? 0);
    let lon = Number(args.longitude ?? 0);
    let cityName = String(args.city ?? '').trim();

    // Geocode city via Nominatim if lat/lon not provided
    if ((!lat || !lon) && cityName) {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
        { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json() as Array<{ lat: string; lon: string; display_name: string }>;
        if (geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lon = parseFloat(geoData[0].lon);
          cityName = geoData[0].display_name.split(',')[0];
        }
      }
    }
    if (!lat || !lon) throw new Error('Provide city name or latitude/longitude');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Open-Meteo API error ${res.status}`);

    const data = await res.json() as {
      current: { temperature_2m: number; relative_humidity_2m: number; precipitation: number; wind_speed_10m: number };
      daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_sum: number[]; wind_speed_10m_max: number[] };
      timezone: string;
    };

    const forecast = (data.daily.time ?? []).map((date, i) => ({
      date,
      maxTemp: data.daily.temperature_2m_max?.[i],
      minTemp: data.daily.temperature_2m_min?.[i],
      precipitation: data.daily.precipitation_sum?.[i],
      maxWind: data.daily.wind_speed_10m_max?.[i],
    }));

    return {
      location: cityName || `${lat},${lon}`,
      timezone: data.timezone,
      current: {
        temperature: `${data.current.temperature_2m}°C`,
        humidity: `${data.current.relative_humidity_2m}%`,
        precipitation: `${data.current.precipitation} mm`,
        windSpeed: `${data.current.wind_speed_10m} km/h`,
      },
      forecast7Day: forecast,
      source: 'Open-Meteo (free, no API key)',
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── OpenAlex — academic & research papers, free, no key ─────────────────────
toolRegistry.register({
  schema: {
    name: 'research_papers',
    description: 'Search peer-reviewed academic research papers on any topic via OpenAlex. Free, no API key. Useful for finding evidence base for sector trends, technology adoption, development economics, public health, etc.',
    category: 'research',
    parameters: [
      { name: 'query', type: 'string', description: 'Research topic e.g. "fintech financial inclusion Southeast Asia" or "renewable energy Africa"', required: true },
      { name: 'limit', type: 'number', description: 'Number of papers to return (default 5, max 10)', required: false },
      { name: 'fromYear', type: 'number', description: 'Filter papers from this year onwards e.g. 2020', required: false },
    ],
    returns: 'Array of papers with title, authors, year, abstract, citations, and open access URL',
  },
  execute: async (args) => {
    const query = String(args.query ?? '').trim().slice(0, 200);
    if (!query) throw new Error('query required');
    const limit = Math.min(Number(args.limit ?? 5), 10);
    const fromYear = args.fromYear ? `&filter=publication_year:>${Number(args.fromYear) - 1}` : '';

    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&sort=relevance_score:desc&per-page=${limit}&select=title,authorships,publication_year,abstract_inverted_index,cited_by_count,open_access,doi${fromYear}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0 (mailto:admin@adversiq.ai)' },
    });
    if (!res.ok) throw new Error(`OpenAlex API error ${res.status}`);

    const data = await res.json() as {
      results: Array<{
        title: string;
        authorships: Array<{ author: { display_name: string } }>;
        publication_year: number;
        abstract_inverted_index?: Record<string, number[]>;
        cited_by_count: number;
        open_access: { is_oa: boolean; oa_url?: string };
        doi?: string;
      }>;
    };

    const papers = (data.results ?? []).map(p => {
      // Reconstruct abstract from inverted index
      let abstract = '';
      if (p.abstract_inverted_index) {
        const words: Array<[string, number]> = [];
        for (const [word, positions] of Object.entries(p.abstract_inverted_index)) {
          positions.forEach(pos => words.push([word, pos]));
        }
        abstract = words.sort((a, b) => a[1] - b[1]).map(w => w[0]).join(' ').slice(0, 500);
      }
      return {
        title: p.title,
        authors: (p.authorships ?? []).slice(0, 3).map(a => a.author?.display_name).filter(Boolean).join(', '),
        year: p.publication_year,
        abstract,
        citations: p.cited_by_count,
        openAccess: p.open_access?.is_oa ?? false,
        url: p.open_access?.oa_url ?? (p.doi ? `https://doi.org/${p.doi.replace('https://doi.org/', '')}` : null),
      };
    });

    return {
      query,
      paperCount: papers.length,
      papers,
      source: 'OpenAlex (free, no API key — 250M+ scholarly works)',
      retrievedAt: new Date().toISOString(),
    };
  },
});

// ── Local Reason — offline autonomous reasoning, zero API key ─────────────────
toolRegistry.register({
  schema: {
    name: 'local_reason',
    description: 'Run the local autonomous reasoning engine — chains NSIL formulas + Bayesian debate + SAT solver + local Ollama LLM. Works completely offline with zero API keys once Ollama is set up. Use for questions that require deep structured reasoning.',
    category: 'analysis',
    parameters: [
      { name: 'question', type: 'string', description: 'The question or problem to reason about', required: true },
      { name: 'context', type: 'string', description: 'Additional context or background information', required: false },
      { name: 'scores', type: 'object', description: 'NSIL formula scores if available', required: false },
      { name: 'depth', type: 'string', description: 'Reasoning depth: quick | standard | deep', required: false },
    ],
    returns: 'Structured reasoning result with answer, confidence, epistemic status, and step-by-step reasoning chain',
  },
  execute: async (args) => {
    return localReasoningEngine.reason({
      question: String(args.question ?? ''),
      context: args.context ? String(args.context) : undefined,
      scores: args.scores as Record<string, number>,
      depth: (args.depth as 'quick' | 'standard' | 'deep') ?? 'standard',
    });
  },
});

// ── Ollama Status — check local AI setup ─────────────────────────────────────
toolRegistry.register({
  schema: {
    name: 'ollama_status',
    description: 'Check whether the local Ollama AI runtime is running, which models are installed, and get setup guidance. Use this to verify the system can reason fully offline.',
    category: 'data',
    parameters: [],
    returns: 'Ollama running status, installed model list, recommended models, and setup guidance',
  },
  execute: async () => {
    return localReasoningEngine.getSetupStatus();
  },
});


