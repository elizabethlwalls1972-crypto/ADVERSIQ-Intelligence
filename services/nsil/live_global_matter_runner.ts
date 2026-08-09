import * as fs from 'fs';
import * as path from 'path';
import { RegionalCityDiscoveryEngine, type DiscoveredCity } from '../RegionalCityDiscoveryEngine';
import {
  aggregateGlobalSearch,
  fetchIntelligenceSnapshot,
  type IntelligenceSnapshot,
  type SearchResultItem,
} from '../externalDataIntegrations';
import { GlobalNSILOrchestrator, type GlobalProblemAnalysis } from './global_nsil_orchestrator';
import { NSILTrajectoryLogger } from './trajectory_logger';
import { NSILFailureDetector } from './failure_detector';
import { NSILRefiner } from './nsil_refiner';
import { MemoryStore } from './stores';
import { ContinualHarnessAdapter, type ContinualHarnessAdaptation } from './continual_harness_adapter';

export interface LiveGlobalMatterOptions {
  outputDir?: string;
  cityLimitPerSector?: number;
  maxMatters?: number;
  minMatterScore?: number;
  continuous?: boolean;
  intervalMinutes?: number;
}

export interface LiveEvidenceSource {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
  snippet: string;
}

export interface LiveGlobalMatter {
  matterId: string;
  detectedAt: string;
  city: DiscoveredCity;
  sector: string;
  issueTitle: string;
  issueThesis: string;
  globalHole: string;
  investmentMatch: string;
  gdpGrowthPathway: string;
  score: number;
  scoreDrivers: Record<string, number>;
  evidence: LiveEvidenceSource[];
  intelligence: IntelligenceSnapshot;
  nsil?: {
    inputId: string;
    sessionId?: string;
    confidence: number;
    successProbability: number;
    approach: string;
    implementationPhases: GlobalProblemAnalysis['recommendation']['implementation_phases'];
    risks: GlobalProblemAnalysis['recommendation']['risks_and_mitigations'];
  };
}

export interface LiveGlobalMatterRun {
  runId: string;
  generatedAt: string;
  sourceModel: 'live_external_apis';
  continualHarnessMode: 'observe_act_refine_autonomous';
  sectorsScanned: string[];
  countriesScanned: string[];
  totalCitiesScanned: number;
  totalMattersGenerated: number;
  acceptedMatters: number;
  matterScoreFloor: number;
  matters: LiveGlobalMatter[];
  harness: {
    trajectoriesObserved: number;
    failuresDetected: number;
    refinerChanges: number;
    promptEdits: number;
    subagentEdits: number;
    skillEdits: number;
    harnessMemoryEdits: number;
    memoryPatternsWritten: number;
  };
  continualHarnessState?: {
    statePath: string;
    adaptation: ContinualHarnessAdaptation;
  };
  outputFiles: string[];
}

const DEFAULT_SECTORS = [
  'Manufacturing',
  'Agriculture',
  'Logistics',
  'Energy',
  'ICT',
  'Textiles',
  'Tourism',
  'Healthcare',
  'Mining',
  'Finance',
  'Education',
  'Climate Infrastructure',
];

const GLOBAL_MARKET_PRESSURES = [
  {
    label: 'FDI capital gap',
    source: 'UNCTAD World Investment Report 2025',
    url: 'https://unctad.org/publication/world-investment-report-2025',
    thesis: 'Productive FDI has weakened, so overlooked regional cities need sharper investable project packaging and verified counterpart matching.',
    keywords: ['fdi', 'foreign direct investment', 'investment', 'capital', 'project finance'],
  },
  {
    label: 'Trade growth slowdown',
    source: 'WTO Global Trade Outlook and Statistics 2026',
    url: 'https://www.wto.org/english/res_e/publications_e/gtos0326_e.htm',
    thesis: 'Merchandise trade growth is slowing, creating value for cities that can reduce logistics friction and offer resilient supply-chain alternatives.',
    keywords: ['trade', 'tariff', 'export', 'supply chain', 'logistics'],
  },
  {
    label: 'Critical-input volatility',
    source: 'UNCTAD Global Trade Update January 2026',
    url: 'https://unctad.org/publication/global-trade-update-january-2026-top-trends-redefining-global-trade-2026',
    thesis: 'Critical minerals, food, energy, and industrial inputs are exposed to oversupply, geopolitical risk, and concentration shocks.',
    keywords: ['critical minerals', 'energy', 'food security', 'geopolitical', 'inputs'],
  },
  {
    label: 'Digital investment concentration',
    source: 'UNCTAD World Investment Report 2025',
    url: 'https://unctad.org/publication/world-investment-report-2025',
    thesis: 'Digital-economy investment is concentrating in already-visible markets, leaving secondary cities under-discovered despite talent and cost advantages.',
    keywords: ['digital', 'ict', 'ai', 'data center', 'technology'],
  },
];

const COUNTRY_CODES: Record<string, string> = {
  Australia: 'AUS',
  Bangladesh: 'BGD',
  Brazil: 'BRA',
  Colombia: 'COL',
  Fiji: 'FJI',
  Georgia: 'GEO',
  Ghana: 'GHA',
  India: 'IND',
  Indonesia: 'IDN',
  Kenya: 'KEN',
  Malaysia: 'MYS',
  Mexico: 'MEX',
  Philippines: 'PHL',
  Poland: 'POL',
  Romania: 'ROU',
  Rwanda: 'RWA',
  Thailand: 'THA',
  UAE: 'ARE',
  'United Arab Emirates': 'ARE',
  Uzbekistan: 'UZB',
  Vietnam: 'VNM',
};

const slug = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const valueOrNeutral = (value: number | undefined | null, neutral: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : neutral;

export class LiveGlobalMatterRunner {
  private outputDir: string;
  private logger: NSILTrajectoryLogger;
  private detector: NSILFailureDetector;
  private refiner: NSILRefiner;
  private memory: MemoryStore;
  private orchestrator: GlobalNSILOrchestrator;
  private harnessAdapter: ContinualHarnessAdapter;

  constructor(outputDir = 'data/live_global_matters') {
    this.outputDir = outputDir;
    this.logger = new NSILTrajectoryLogger(outputDir);
    this.detector = new NSILFailureDetector();
    this.refiner = new NSILRefiner([], path.join(outputDir, 'evolved_state'));
    this.memory = new MemoryStore(path.join(outputDir, 'evolved_state'));
    this.orchestrator = new GlobalNSILOrchestrator();
    this.harnessAdapter = new ContinualHarnessAdapter(path.join(outputDir, 'evolved_state'));
  }

  async run(options: LiveGlobalMatterOptions = {}): Promise<LiveGlobalMatterRun> {
    const startedAt = new Date();
    const runId = `live-global-${startedAt.toISOString().replace(/[:.]/g, '-')}`;
    const cityLimit = options.cityLimitPerSector ?? 3;
    const maxMatters = options.maxMatters ?? 24;
    const scoreFloor = options.minMatterScore ?? 58;
    const sectors = DEFAULT_SECTORS;
    const candidateCities = this.discoverCandidateCities(sectors, cityLimit);
    const matters: LiveGlobalMatter[] = [];

    for (const { sector, city } of candidateCities) {
      if (matters.length >= maxMatters) break;
      const matter = await this.buildMatter(sector, city);
      if (matter.score >= scoreFloor) {
        matter.nsil = await this.runNSIL(matter);
        matters.push(matter);
        this.writeMemoryPattern(matter);
      }
    }

    const trajectories = this.logger.get_all_trajectories();
    const failures = this.detector.detect_all_failures(trajectories);
    const edits = this.refiner.evolve(trajectories.length || matters.length, trajectories);
    const harnessAdaptation = this.harnessAdapter.evolve(trajectories, failures);
    const harnessCounts = this.countHarnessAdaptation(harnessAdaptation);

    const outputFiles = this.persistRun(runId, {
      runId,
      generatedAt: startedAt.toISOString(),
      sourceModel: 'live_external_apis',
      continualHarnessMode: 'observe_act_refine_autonomous',
      sectorsScanned: sectors,
      countriesScanned: [...new Set(matters.map((matter) => matter.city.country))].sort(),
      totalCitiesScanned: candidateCities.length,
      totalMattersGenerated: candidateCities.length,
      acceptedMatters: matters.length,
      matterScoreFloor: scoreFloor,
      matters,
      harness: {
        trajectoriesObserved: trajectories.length,
        failuresDetected: failures.length,
        refinerChanges: this.countRefinerChanges(edits),
        ...harnessCounts,
        memoryPatternsWritten: matters.length,
      },
      continualHarnessState: {
        statePath: harnessAdaptation.state_path,
        adaptation: harnessAdaptation,
      },
      outputFiles: [],
    });

    return {
      runId,
      generatedAt: startedAt.toISOString(),
      sourceModel: 'live_external_apis',
      continualHarnessMode: 'observe_act_refine_autonomous',
      sectorsScanned: sectors,
      countriesScanned: [...new Set(matters.map((matter) => matter.city.country))].sort(),
      totalCitiesScanned: candidateCities.length,
      totalMattersGenerated: candidateCities.length,
      acceptedMatters: matters.length,
      matterScoreFloor: scoreFloor,
      matters,
      harness: {
        trajectoriesObserved: trajectories.length,
        failuresDetected: failures.length,
        refinerChanges: this.countRefinerChanges(edits),
        ...harnessCounts,
        memoryPatternsWritten: matters.length,
      },
      continualHarnessState: {
        statePath: harnessAdaptation.state_path,
        adaptation: harnessAdaptation,
      },
      outputFiles,
    };
  }

  async runContinuously(options: LiveGlobalMatterOptions = {}): Promise<void> {
    const intervalMs = Math.max(1, options.intervalMinutes ?? 60) * 60_000;
    await this.run(options);
    setInterval(() => {
      this.run(options).catch((error) => {
        console.error('[LiveGlobalMatterRunner] continuous run failed:', error);
      });
    }, intervalMs);
  }

  private discoverCandidateCities(sectors: string[], cityLimit: number): Array<{ sector: string; city: DiscoveredCity }> {
    const seen = new Set<string>();
    const candidates: Array<{ sector: string; city: DiscoveredCity }> = [];

    for (const sector of sectors) {
      const discovery = RegionalCityDiscoveryEngine.discover({
        targetSectors: [sector],
        preferOverlooked: true,
        maxPoliticalRisk: 70,
        maxCostOfDoing: 65,
        minInfrastructure: 38,
      }, cityLimit);

      for (const city of discovery.topMatches) {
        const key = `${sector}:${city.city}:${city.country}`;
        if (!seen.has(key)) {
          seen.add(key);
          candidates.push({ sector, city });
        }
      }
    }

    return candidates.sort((a, b) => b.city.matchScore - a.city.matchScore);
  }

  private async buildMatter(sector: string, city: DiscoveredCity): Promise<LiveGlobalMatter> {
    const countryCode = COUNTRY_CODES[city.country] || city.country.slice(0, 3).toUpperCase();
    const [intelligence, searchBatches] = await Promise.all([
      fetchIntelligenceSnapshot(city.country, countryCode),
      aggregateGlobalSearch(`${city.city} ${city.country} ${sector} regional development investment bottleneck export FDI 2026`),
    ]);

    const searchEvidence = searchBatches
      .flatMap((batch) => batch.results)
      .filter((item) => item.title || item.snippet || item.url)
      .slice(0, 8)
      .map((item) => this.toEvidence(item));

    const pressure = this.selectGlobalPressure(sector, searchEvidence);
    const evidence = [
      {
        title: pressure.source,
        url: pressure.url,
        source: 'official-global-pressure',
        snippet: pressure.thesis,
      },
      {
        title: 'World Bank country indicator API',
        url: `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.KD.ZG?format=json&date=2020:2025`,
        source: 'world-bank-api',
        snippet: `Country macro indicators requested for ${city.country} (${countryCode}).`,
      },
      ...searchEvidence,
    ];
    const scoreDrivers = this.scoreMatter(city, intelligence, evidence, pressure.label);
    const score = Math.round(Object.values(scoreDrivers).reduce((sum, value) => sum + value, 0));
    const gdpGrowth = valueOrNeutral(intelligence.worldBank?.gdpGrowth, 2.5);
    const fdi = valueOrNeutral(intelligence.worldBank?.fdi, 1.5);
    const trade = valueOrNeutral(intelligence.worldBank?.tradeOpenness, 55);

    return {
      matterId: `${slug(city.city)}-${slug(city.country)}-${slug(sector)}-${slug(pressure.label)}`,
      detectedAt: new Date().toISOString(),
      city,
      sector,
      issueTitle: `${city.city} ${sector}: ${pressure.label}`,
      issueThesis: `${city.city} has ${city.keySectors.slice(0, 3).join(', ')} capability, ${city.overlookedOpportunity}/100 overlooked opportunity, and ${city.investmentMomentum}/100 investment momentum. ${pressure.thesis}`,
      globalHole: `${pressure.label}: ${pressure.source}. Local indicators show GDP growth ${gdpGrowth.toFixed(2)}%, FDI inflows ${fdi.toFixed(2)}% of GDP, and trade openness ${trade.toFixed(2)}% of GDP.`,
      investmentMatch: `Match global investors needing ${sector.toLowerCase()} resilience with ${city.city} programs: ${city.investmentPrograms.slice(0, 3).join('; ')}.`,
      gdpGrowthPathway: `Convert the gap into GDP impact by packaging investable projects around ${sector.toLowerCase()}, reducing execution friction, validating buyers/offtakers, and using ${city.country} as the sovereign credibility layer for regional city delivery.`,
      score,
      scoreDrivers,
      evidence,
      intelligence,
    };
  }

  private async runNSIL(matter: LiveGlobalMatter): Promise<NonNullable<LiveGlobalMatter['nsil']>> {
    const sessionId = this.logger.start_session({
      project_type: 'live_global_regional_development_matter',
      sector: matter.sector,
      region: matter.city.region,
      region_id: `${matter.city.city}, ${matter.city.country}`,
      client_id: matter.matterId,
      parameters: {
        matterId: matter.matterId,
        issueTitle: matter.issueTitle,
        score: matter.score,
        evidenceUrls: matter.evidence.map((source) => source.url).filter(Boolean),
      },
    });

    this.logger.log_recommendation({
      primary: matter.investmentMatch,
      secondary: [matter.globalHole, matter.gdpGrowthPathway],
      confidence: clamp(matter.score, 1, 100) / 100,
      rationale: matter.issueThesis,
      audit_trail: matter.evidence.map((source) => `${source.source}:${source.title}`).slice(0, 6),
    });
    this.logger.end_session(0);

    const analysis = await this.orchestrator.solve_global_problem(
      `${matter.issueTitle}. ${matter.issueThesis} ${matter.globalHole} ${matter.gdpGrowthPathway}`,
      matter.city.country,
      'en',
      {
        role: 'autonomous_regional_development_os',
        city: matter.city.city,
        sector: matter.sector,
        source: 'live_global_matter_runner',
      },
    );

    return {
      inputId: analysis.input_id,
      sessionId: analysis.trajectory_session_id || sessionId,
      confidence: analysis.recommendation.confidence,
      successProbability: analysis.analysis.success_probability,
      approach: analysis.recommendation.approach,
      implementationPhases: analysis.recommendation.implementation_phases,
      risks: analysis.recommendation.risks_and_mitigations,
    };
  }

  private scoreMatter(
    city: DiscoveredCity,
    intelligence: IntelligenceSnapshot,
    evidence: LiveEvidenceSource[],
    pressureLabel: string,
  ): Record<string, number> {
    const gdpGrowth = valueOrNeutral(intelligence.worldBank?.gdpGrowth, 2.5);
    const fdi = valueOrNeutral(intelligence.worldBank?.fdi, 1.5);
    const trade = valueOrNeutral(intelligence.worldBank?.tradeOpenness, 55);
    const internet = valueOrNeutral(intelligence.worldBank?.internetUsers, 55);
    const evidenceScore = Math.min(10, evidence.length * 1.25);
    const pressureBoost = pressureLabel.includes('FDI') || pressureLabel.includes('Trade') ? 5 : 3;

    return {
      overlooked: city.overlookedOpportunity * 0.16,
      sectorFit: city.sectorMatch * 0.15,
      investmentMomentum: city.investmentMomentum * 0.14,
      infrastructureReadiness: city.infrastructureScore * 0.11,
      fdiGap: clamp(8 - fdi, 0, 8),
      growthNeed: clamp(5 - gdpGrowth, 0, 8),
      tradePlatform: clamp(trade / 12, 0, 8),
      digitalReadiness: clamp(internet / 14, 0, 7),
      liveEvidence: evidenceScore,
      globalPressure: pressureBoost,
    };
  }

  private countRefinerChanges(edits: {
    orchestration_edits?: unknown[];
    formula_edits?: unknown[];
    debate_edits?: unknown[];
    memory_edits?: unknown[];
  }): number {
    return (
      (edits.orchestration_edits?.length ?? 0) +
      (edits.formula_edits?.length ?? 0) +
      (edits.debate_edits?.length ?? 0) +
      (edits.memory_edits?.length ?? 0)
    );
  }

  private countHarnessAdaptation(adaptation: ContinualHarnessAdaptation): {
    promptEdits: number;
    subagentEdits: number;
    skillEdits: number;
    harnessMemoryEdits: number;
  } {
    return {
      promptEdits: adaptation.prompt_edits.length,
      subagentEdits: adaptation.subagent_edits.length,
      skillEdits: adaptation.skill_edits.length,
      harnessMemoryEdits: adaptation.memory_edits.length,
    };
  }

  private selectGlobalPressure(sector: string, evidence: LiveEvidenceSource[]): typeof GLOBAL_MARKET_PRESSURES[number] {
    const haystack = `${sector} ${evidence.map((item) => `${item.title} ${item.snippet}`).join(' ')}`.toLowerCase();
    const ranked = GLOBAL_MARKET_PRESSURES
      .map((pressure) => ({
        pressure,
        hits: pressure.keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 1 : 0), 0),
      }))
      .sort((a, b) => b.hits - a.hits);
    return ranked[0]?.pressure || GLOBAL_MARKET_PRESSURES[0];
  }

  private toEvidence(item: SearchResultItem): LiveEvidenceSource {
    return {
      title: item.title || item.url || 'Untitled source',
      url: item.url || '',
      source: item.source || 'external-search',
      publishedAt: item.publishedAt,
      snippet: item.snippet || '',
    };
  }

  private writeMemoryPattern(matter: LiveGlobalMatter): void {
    const pattern = `${matter.city.city}, ${matter.city.country} ${matter.sector}: ${matter.globalHole}`;
    const item = this.memory.add_pattern(
      'live_global_regional_development_gap',
      pattern,
      [matter.city.region, matter.city.country],
      [matter.sector],
      clamp(matter.score, 1, 100) / 100,
    );
    for (const source of matter.evidence.slice(0, 3)) {
      this.memory.add_evidence(item.id, `${source.title} ${source.url}`.trim());
    }
  }

  private persistRun(runId: string, run: LiveGlobalMatterRun): string[] {
    fs.mkdirSync(this.outputDir, { recursive: true });
    const jsonPath = path.join(this.outputDir, `${runId}.json`);
    const latestPath = path.join(this.outputDir, 'latest.json');
    const summaryPath = path.join(this.outputDir, `${runId}.summary.md`);
    const withFiles = { ...run, outputFiles: [jsonPath, latestPath, summaryPath] };

    fs.writeFileSync(jsonPath, JSON.stringify(withFiles, null, 2), 'utf8');
    fs.writeFileSync(latestPath, JSON.stringify(withFiles, null, 2), 'utf8');
    fs.writeFileSync(summaryPath, this.toMarkdown(withFiles), 'utf8');
    return withFiles.outputFiles;
  }

  private toMarkdown(run: LiveGlobalMatterRun): string {
    const lines = [
      `# Live Global Regional Development Matters`,
      ``,
      `Run: ${run.runId}`,
      `Generated: ${run.generatedAt}`,
      `Mode: ${run.continualHarnessMode}`,
      `Accepted matters: ${run.acceptedMatters}/${run.totalMattersGenerated}`,
      `Harness p/G/K/M edits: prompt=${run.harness.promptEdits}, subagents=${run.harness.subagentEdits}, skills=${run.harness.skillEdits}, memory=${run.harness.harnessMemoryEdits}`,
      ``,
      `## Top Matters`,
    ];

    for (const matter of run.matters.slice(0, 12)) {
      lines.push(
        ``,
        `### ${matter.issueTitle}`,
        `Score: ${matter.score}/100`,
        `City: ${matter.city.city}, ${matter.city.country} (${matter.city.region})`,
        `Global hole: ${matter.globalHole}`,
        `Investment match: ${matter.investmentMatch}`,
        `GDP pathway: ${matter.gdpGrowthPathway}`,
        `NSIL: ${matter.nsil?.confidence ?? 0}% confidence; ${matter.nsil?.successProbability ?? 0}% success probability`,
      );
      if (matter.evidence.length) {
        lines.push(`Evidence:`);
        for (const source of matter.evidence.slice(0, 3)) {
          lines.push(`- ${source.title}${source.url ? ` (${source.url})` : ''}`);
        }
      }
    }

    return lines.join('\n');
  }
}

export async function runLiveGlobalMatters(options: LiveGlobalMatterOptions = {}): Promise<LiveGlobalMatterRun> {
  const runner = new LiveGlobalMatterRunner(options.outputDir);
  if (options.continuous) {
    await runner.runContinuously(options);
    return new Promise(() => undefined);
  }
  return runner.run(options);
}
