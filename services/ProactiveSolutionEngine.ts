/**
 * PROACTIVE SOLUTION ENGINE
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs BEFORE the AI responds. Detects what the user actually needs,
 * auto-fires relevant live data tools in parallel, and assembles a rich
 * intelligence package so the AI has real context instead of guessing.
 *
 * This is what separates a reactive chatbot from a proactive intelligence OS.
 *
 * Architecture:
 *   User message → Signal Detection → Tool Auto-Selection → Parallel Execution
 *                → Intelligence Synthesis → Solution Paths → Prompt Block
 *
 * All tools used are free, no API key required.
 */

// ─── Signal detection types ────────────────────────────────────────────────────
interface DetectedSignals {
  countries: string[];
  sectors: string[];
  currencies: string[];
  dollarAmounts: number[];
  isInvestmentQuery: boolean;
  isRiskQuery: boolean;
  isMarketEntryQuery: boolean;
  isComplianceQuery: boolean;
  isGeopoliticalQuery: boolean;
  isAcademicQuery: boolean;
  isTechQuery: boolean;
  isSupplyChainQuery: boolean;
  isWorkforceQuery: boolean;
  isFinancialQuery: boolean;
  intentKeywords: string[];
}

export interface ProactiveContext {
  signals: DetectedSignals;
  toolsRun: string[];
  intelligenceBlock: string;     // Formatted block injected into AI prompt
  solutionPaths: string[];       // Proactively identified solution approaches
  criticalGaps: string[];        // What's still missing for a complete answer
  rawFindings: Record<string, unknown>;
  processingMs: number;
}

// ─── Country → ISO2 map (duplicated from ai.ts so engine is self-contained) ──
const COUNTRY_ISO2: Record<string, string> = {
  'philippines': 'PH', 'indonesia': 'ID', 'vietnam': 'VN', 'thailand': 'TH',
  'malaysia': 'MY', 'singapore': 'SG', 'myanmar': 'MM', 'cambodia': 'KH',
  'laos': 'LA', 'timor': 'TL', 'brunei': 'BN',
  'nigeria': 'NG', 'kenya': 'KE', 'ghana': 'GH', 'ethiopia': 'ET',
  'south africa': 'ZA', 'egypt': 'EG', 'morocco': 'MA', 'tanzania': 'TZ',
  'rwanda': 'RW', 'senegal': 'SN', 'ivory coast': 'CI', 'uganda': 'UG',
  'india': 'IN', 'pakistan': 'PK', 'bangladesh': 'BD', 'sri lanka': 'LK',
  'nepal': 'NP', 'brazil': 'BR', 'colombia': 'CO', 'peru': 'PE',
  'chile': 'CL', 'mexico': 'MX', 'argentina': 'AR',
  'ukraine': 'UA', 'turkey': 'TR', 'saudi arabia': 'SA', 'uae': 'AE',
  'united arab emirates': 'AE', 'qatar': 'QA', 'jordan': 'JO',
  'kazakhstan': 'KZ', 'uzbekistan': 'UZ', 'georgia': 'GE', 'armenia': 'AM',
  'china': 'CN', 'japan': 'JP', 'south korea': 'KR', 'taiwan': 'TW',
  'australia': 'AU', 'new zealand': 'NZ', 'papua new guinea': 'PG',
  'france': 'FR', 'germany': 'DE', 'united kingdom': 'GB', 'uk': 'GB',
  'italy': 'IT', 'spain': 'ES', 'poland': 'PL', 'netherlands': 'NL',
  'canada': 'CA', 'united states': 'US', 'usa': 'US',
};

// ─── Sector keywords ──────────────────────────────────────────────────────────
const SECTOR_KEYWORDS: Record<string, string[]> = {
  'manufacturing': ['manufactur', 'factory', 'production', 'industrial', 'assembly', 'OEM'],
  'infrastructure': ['infrastructure', 'roads', 'bridges', 'ports', 'utilities', 'grid', 'rail'],
  'technology': ['tech', 'software', 'saas', 'digital', 'ai ', 'fintech', 'startup', 'platform'],
  'agriculture': ['agri', 'farm', 'food', 'crop', 'livestock', 'fishery', 'aquaculture'],
  'energy': ['energy', 'solar', 'wind', 'renewable', 'oil', 'gas', 'power', 'electricity'],
  'healthcare': ['health', 'medical', 'hospital', 'pharma', 'biotech', 'clinical'],
  'finance': ['bank', 'financ', 'invest', 'capital', 'fund', 'equity', 'debt', 'credit'],
  'mining': ['mining', 'mineral', 'extraction', 'ore', 'lithium', 'cobalt', 'copper'],
  'real estate': ['real estate', 'property', 'housing', 'development', 'construction'],
  'logistics': ['logistics', 'supply chain', 'transport', 'shipping', 'freight', 'warehousing'],
  'education': ['education', 'school', 'university', 'training', 'skills', 'edtech'],
  'government': ['government', 'public sector', 'ministry', 'agency', 'policy', 'regulatory'],
};

// ─── Signal Detection ─────────────────────────────────────────────────────────
function detectSignals(message: string): DetectedSignals {
  const lower = message.toLowerCase();

  // Detect countries
  const countries: string[] = [];
  for (const country of Object.keys(COUNTRY_ISO2)) {
    if (lower.includes(country)) countries.push(country);
  }

  // Detect sectors
  const sectors: string[] = [];
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      sectors.push(sector);
    }
  }

  // Detect currencies mentioned
  const currencies: string[] = [];
  const currencyMatches = message.match(/\b(USD|EUR|GBP|AUD|JPY|CNY|INR|SGD|MYR|THB|VND|PHP|IDR|NGN|KES|BRL|MXN|ZAR)\b/g);
  if (currencyMatches) currencies.push(...new Set(currencyMatches));

  // Detect dollar amounts
  const dollarAmounts: number[] = [];
  const amountMatches = message.matchAll(/\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(billion|million|M\b|B\b|k\b)?/gi);
  for (const match of amountMatches) {
    const num = parseFloat(match[1].replace(/,/g, ''));
    const mult = /billion|B\b/i.test(match[2] ?? '') ? 1e9 : /million|M\b/i.test(match[2] ?? '') ? 1e6 : /k\b/i.test(match[2] ?? '') ? 1e3 : 1;
    if (num > 0) dollarAmounts.push(num * mult);
  }

  return {
    countries,
    sectors,
    currencies,
    dollarAmounts,
    isInvestmentQuery: /invest|capital|fund|equity|roi|return|yield|valuation|deal|acquisition|m&a/i.test(lower),
    isRiskQuery: /risk|threat|danger|exposure|vulnerab|hazard|mitigation|sanction|compliance/i.test(lower),
    isMarketEntryQuery: /market entry|enter.*market|expansion|new market|go.to.market|launch|penetrat/i.test(lower),
    isComplianceQuery: /regulat|complian|legal|law|license|permit|governance|policy|sanction/i.test(lower),
    isGeopoliticalQuery: /geopolit|political|government|election|conflict|war|tension|diplomacy|bilateral/i.test(lower),
    isAcademicQuery: /research|evidence|study|paper|literature|academic|journal|peer.review/i.test(lower),
    isTechQuery: /ai |ml |software|tech|digital|startup|saas|platform|api|cloud|data/i.test(lower),
    isSupplyChainQuery: /supply chain|logistics|warehouse|freight|shipping|procurement|vendor|sourcing/i.test(lower),
    isWorkforceQuery: /workforce|talent|hiring|employment|labour|labor|skills|workers|human capital/i.test(lower),
    isFinancialQuery: /gdp|interest rate|inflation|currency|exchange|forex|monetary|fiscal|debt/i.test(lower),
    intentKeywords: lower.match(/\b(invest|risk|market|compliance|strategy|expand|assess|evaluat|analyz|solve|find|identify|recommend)\w*/g) ?? [],
  };
}

// ─── Free API fetchers ─────────────────────────────────────────────────────────

async function fetchGDELTNews(query: string, maxRecords = 5): Promise<string> {
  try {
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${maxRecords}&format=json&sourcelang=english`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } });
    if (!res.ok) return '';
    const data = await res.json() as { articles?: Array<{ title: string; url: string; seendate: string; sourcecountry: string; tone: number }> };
    if (!data.articles?.length) return '';
    const articles = data.articles.slice(0, maxRecords).map(a =>
      `• ${a.title} [${a.sourcecountry ?? 'Global'}, tone:${a.tone?.toFixed(1) ?? '?'}] (${a.seendate?.slice(0, 8) ?? 'recent'})`
    );
    return `GDELT Live News (${data.articles.length} articles):\n${articles.join('\n')}`;
  } catch {
    return '';
  }
}

async function fetchIMFGrowth(countryCode: string, countryName: string): Promise<string> {
  try {
    // IMF World Economic Outlook API — real GDP growth + current account
    const indicators = [
      { id: 'NGDP_RPCH', label: 'Real GDP Growth (%)' },
      { id: 'PCPIPCH', label: 'Inflation (%)' },
      { id: 'BCA_NGDPD', label: 'Current Account (% GDP)' },
      { id: 'GGXWDG_NGDP', label: 'Govt Debt (% GDP)' },
    ];
    const results: string[] = [];
    await Promise.allSettled(indicators.map(async (ind) => {
      const url = `https://www.imf.org/external/datamapper/api/v1/${ind.id}/${countryCode}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) return;
      const d = await r.json() as { values?: Record<string, Record<string, number>> };
      const vals = d.values?.[ind.id]?.[countryCode];
      if (!vals) return;
      // Get the most recent year
      const years = Object.keys(vals).sort().slice(-3);
      const recentStr = years.map(y => `${y}: ${vals[y]?.toFixed(1) ?? 'N/A'}`).join(', ');
      results.push(`  ${ind.label}: ${recentStr}`);
    }));
    if (!results.length) return '';
    return `IMF Data — ${countryName.toUpperCase()}:\n${results.join('\n')}`;
  } catch {
    return '';
  }
}

async function fetchGovernanceIndicators(countryCode: string, countryName: string): Promise<string> {
  try {
    // World Bank WGI indicators — critical for investment risk
    const indicators = [
      { code: 'CC.EST', label: 'Corruption Control' },
      { code: 'GE.EST', label: 'Govt Effectiveness' },
      { code: 'RQ.EST', label: 'Regulatory Quality' },
      { code: 'RL.EST', label: 'Rule of Law' },
      { code: 'PV.EST', label: 'Political Stability' },
      { code: 'IC.REG.DURS', label: 'Days to Start Business' },
      { code: 'LP.LPI.OVRL.XQ', label: 'Logistics Performance Index' },
    ];
    const results: string[] = [];
    await Promise.allSettled(indicators.map(async (ind) => {
      const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${ind.code}?format=json&mrv=1&per_page=1`;
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) return;
      const d = await r.json() as Array<unknown>;
      const entries = d[1] as Array<{ value: number | null; date: string }> | undefined;
      if (!entries?.[0]?.value) return;
      const val = entries[0].value;
      const formatted = Math.abs(val) < 10 ? val.toFixed(2) : val.toFixed(0);
      results.push(`  ${ind.label}: ${formatted} (${entries[0].date})`);
    }));
    if (!results.length) return '';
    return `Governance Indicators — ${countryName.toUpperCase()}:\n${results.join('\n')}`;
  } catch {
    return '';
  }
}

async function fetchRestCountryProfile(countryCode: string, countryName: string): Promise<string> {
  try {
    const url = `https://restcountries.com/v3.1/alpha/${countryCode}?fields=name,capital,population,area,currencies,languages,region,subregion,borders,timezones,flags,gini`;
    const r = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0' } });
    if (!r.ok) return '';
    const d = await r.json() as {
      name: { common: string };
      capital?: string[];
      population?: number;
      area?: number;
      currencies?: Record<string, { name: string; symbol: string }>;
      languages?: Record<string, string>;
      region?: string;
      subregion?: string;
      borders?: string[];
      timezones?: string[];
      gini?: Record<string, number>;
    };
    const currency = d.currencies ? Object.values(d.currencies).map(c => `${c.name} (${c.symbol})`).join(', ') : 'N/A';
    const giniEntries = d.gini ? Object.entries(d.gini).sort().slice(-1) : [];
    const giniStr = giniEntries.length ? `  Gini (inequality): ${giniEntries[0][1]} (${giniEntries[0][0]})\n` : '';
    return `Country Profile — ${countryName.toUpperCase()}:\n  Region: ${d.region ?? 'N/A'} / ${d.subregion ?? ''}\n  Capital: ${d.capital?.[0] ?? 'N/A'}\n  Population: ${(d.population ?? 0).toLocaleString()}\n  Area: ${(d.area ?? 0).toLocaleString()} km²\n  Currency: ${currency}\n  Bordering countries: ${(d.borders ?? []).join(', ') || 'Island nation'}\n${giniStr}`;
  } catch {
    return '';
  }
}

async function fetchOpenAlexResearch(query: string, limit = 3): Promise<string> {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&sort=cited_by_count:desc&per-page=${limit}&select=title,publication_year,cited_by_count,open_access`;
    const r = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'ADVERSIQ-Intelligence/1.0 (mailto:admin@adversiq.ai)' } });
    if (!r.ok) return '';
    const d = await r.json() as { results?: Array<{ title: string; publication_year: number; cited_by_count: number; open_access?: { is_oa: boolean } }> };
    if (!d.results?.length) return '';
    const papers = d.results.slice(0, limit).map(p =>
      `• "${p.title}" (${p.publication_year}, ${p.cited_by_count} citations${p.open_access?.is_oa ? ', open access' : ''})`
    );
    return `Academic Evidence Base (OpenAlex):\n${papers.join('\n')}`;
  } catch {
    return '';
  }
}

async function fetchExchangeRates(baseCurrency = 'USD', targets: string[] = []): Promise<string> {
  try {
    const symbols = targets.length > 0 ? `&symbols=${targets.join(',')}` : '';
    const url = `https://api.frankfurter.app/latest?base=${baseCurrency}${symbols}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return '';
    const d = await r.json() as { base: string; date: string; rates: Record<string, number> };
    const rateStr = Object.entries(d.rates).slice(0, 12).map(([k, v]) => `${k}: ${v.toFixed(4)}`).join(' | ');
    return `Live Exchange Rates (ECB, ${d.date}) — Base ${d.base}: ${rateStr}`;
  } catch {
    return '';
  }
}

// ─── Solution Path Synthesis ──────────────────────────────────────────────────
function deriveSolutionPaths(signals: DetectedSignals, findings: Record<string, string>): string[] {
  const paths: string[] = [];

  if (signals.isInvestmentQuery && signals.countries.length > 0) {
    const country = signals.countries[0];
    const iso = COUNTRY_ISO2[country];
    paths.push(`Market Entry Path: Direct FDI into ${country} — assess political stability, regulatory quality, and governance indicators (World Bank WGI) before structuring deal`);
    if (iso) paths.push(`Risk-Adjusted Path: Joint venture with local partner in ${country} to share regulatory burden and reduce political exposure`);
    if (signals.sectors.length > 0) {
      paths.push(`Sector Path: ${signals.sectors[0]} investment in ${country} — check sectoral incentive zones, special economic zones, and foreign ownership caps`);
    }
  }

  if (signals.isMarketEntryQuery) {
    paths.push(`Sequenced Entry: Phase 1 — establish legal entity and regulatory approval (3-6 months); Phase 2 — pilot operations in target cluster; Phase 3 — scale with local financing`);
    paths.push(`Partnership Path: Identify anchor partner (local firm, development bank, or government agency) to share risk and access distribution networks`);
  }

  if (signals.isRiskQuery) {
    paths.push(`Risk Mitigation: Structure political risk insurance (MIGA/OPIC equivalent), diversify counterparty exposure, and build governance protocol for board-level risk monitoring`);
    paths.push(`Hedge Path: Currency hedging via NDF/forward contracts for capital repatriation, combined with contractual milestone-based payment release`);
  }

  if (signals.isComplianceQuery) {
    paths.push(`Compliance Path: Map local regulatory requirements → IFC Performance Standards alignment → anti-corruption due diligence (FCPA/Bribery Act) → obtain specialist legal opinion before commitment`);
  }

  if (signals.isSupplyChainQuery) {
    paths.push(`Supply Chain Path: Multi-source strategy across 2-3 geographies to reduce concentration risk; apply logistics performance index data to rank preferred hubs`);
  }

  if (signals.isWorkforceQuery) {
    paths.push(`Workforce Path: Skills gap analysis against target country's labour market; consider blended model (senior expats + local talent pipeline with structured training)`);
  }

  if (paths.length === 0) {
    paths.push(`General Path: Structured intelligence gathering → stakeholder mapping → options analysis → risk-weighted decision matrix`);
  }

  return paths.slice(0, 5);
}

// ─── Critical Gap Identification ──────────────────────────────────────────────
function identifyCriticalGaps(signals: DetectedSignals, findings: Record<string, string>): string[] {
  const gaps: string[] = [];

  if (signals.countries.length === 0) gaps.push('No specific country or region identified — narrowing geography would enable precise risk scoring and regulatory mapping');
  if (signals.sectors.length === 0) gaps.push('Sector not specified — sector determines regulatory regime, capital requirements, and partnership structures');
  if (signals.dollarAmounts.length === 0 && signals.isInvestmentQuery) gaps.push('Deal size / capital envelope not specified — size determines optimal vehicle (JV, wholly-owned subsidiary, fund structure, etc.)');
  if (signals.isInvestmentQuery && !signals.isComplianceQuery) gaps.push('Compliance/legal due diligence not mentioned — critical for cross-border investment (FCPA, local anti-corruption, ownership restrictions)');
  if (signals.isRiskQuery && signals.countries.length > 0 && !findings['governance']) gaps.push('Governance quality data unavailable — political stability and corruption control scores are key investment risk drivers');

  return gaps.slice(0, 4);
}

// ─── Main Engine ──────────────────────────────────────────────────────────────
export class ProactiveSolutionEngine {
  async run(message: string, timeoutMs = 10000): Promise<ProactiveContext> {
    const start = Date.now();
    const signals = detectSignals(message);
    const findings: Record<string, string> = {};
    const toolsRun: string[] = [];

    // Build parallel fetch tasks based on detected signals
    const tasks: Array<Promise<void>> = [];

    // Always: GDELT live news for any substantive query
    if (message.length > 30) {
      tasks.push((async () => {
        const r = await fetchGDELTNews(message.slice(0, 150), 5);
        if (r) { findings['gdelt_news'] = r; toolsRun.push('gdelt_news'); }
      })());
    }

    // Country-specific: IMF + Governance + Country Profile
    for (const country of signals.countries.slice(0, 2)) {
      const iso = COUNTRY_ISO2[country];
      if (!iso) continue;

      tasks.push((async () => {
        const r = await fetchIMFGrowth(iso, country);
        if (r) { findings[`imf_${country}`] = r; toolsRun.push(`imf:${country}`); }
      })());

      tasks.push((async () => {
        const r = await fetchGovernanceIndicators(iso, country);
        if (r) { findings[`governance_${country}`] = r; toolsRun.push(`governance:${country}`); }
      })());

      tasks.push((async () => {
        const r = await fetchRestCountryProfile(iso, country);
        if (r) { findings[`profile_${country}`] = r; toolsRun.push(`profile:${country}`); }
      })());
    }

    // Academic research: for investment, risk, sector, or academic queries
    if (signals.isInvestmentQuery || signals.isRiskQuery || signals.isAcademicQuery || signals.sectors.length > 0) {
      const researchQuery = signals.sectors.length > 0
        ? `${signals.sectors[0]} ${signals.countries[0] ?? ''} investment risk development`.trim()
        : message.slice(0, 100);
      tasks.push((async () => {
        const r = await fetchOpenAlexResearch(researchQuery, 3);
        if (r) { findings['research'] = r; toolsRun.push('openalex_research'); }
      })());
    }

    // Exchange rates: for financial or investment queries
    if (signals.isFinancialQuery || signals.isInvestmentQuery || signals.currencies.length > 0) {
      const targets = signals.currencies.length > 0 ? signals.currencies.slice(0, 8) :
        signals.countries.length > 0 ? ['EUR', 'GBP', 'AUD', 'SGD', 'JPY', 'CNY'] : ['EUR', 'GBP', 'AUD'];
      tasks.push((async () => {
        const r = await fetchExchangeRates('USD', targets);
        if (r) { findings['exchange_rates'] = r; toolsRun.push('exchange_rates'); }
      })());
    }

    // Race all tasks against timeout
    await Promise.race([
      Promise.allSettled(tasks),
      new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
    ]);

    // Build intelligence block
    const solutionPaths = deriveSolutionPaths(signals, findings);
    const criticalGaps = identifyCriticalGaps(signals, findings);

    const parts: string[] = [];
    parts.push(`PROACTIVE INTELLIGENCE PACKAGE (auto-assembled before AI response):`);
    parts.push(`Signals detected: ${[
      ...signals.countries.map(c => `country:${c}`),
      ...signals.sectors.map(s => `sector:${s}`),
      signals.isInvestmentQuery ? 'intent:investment' : null,
      signals.isRiskQuery ? 'intent:risk' : null,
      signals.isMarketEntryQuery ? 'intent:market_entry' : null,
      signals.isGeopoliticalQuery ? 'intent:geopolitical' : null,
      signals.dollarAmounts.length > 0 ? `deal_size:$${(signals.dollarAmounts[0] / 1e6).toFixed(0)}M` : null,
    ].filter(Boolean).join(' | ')}`);

    if (Object.keys(findings).length > 0) {
      parts.push('\n' + Object.values(findings).join('\n\n'));
    } else {
      parts.push('No live data sources returned within time window — use training knowledge + NSIL analysis.');
    }

    if (solutionPaths.length > 0) {
      parts.push(`\nPROACTIVELY IDENTIFIED SOLUTION PATHS:\n${solutionPaths.map((p, i) => `${i + 1}. ${p}`).join('\n')}`);
    }

    if (criticalGaps.length > 0) {
      parts.push(`\nCRITICAL GAPS (ask user or flag in response):\n${criticalGaps.map(g => `• ${g}`).join('\n')}`);
    }

    return {
      signals,
      toolsRun,
      intelligenceBlock: parts.join('\n'),
      solutionPaths,
      criticalGaps,
      rawFindings: findings,
      processingMs: Date.now() - start,
    };
  }
}

export const proactiveSolutionEngine = new ProactiveSolutionEngine();
