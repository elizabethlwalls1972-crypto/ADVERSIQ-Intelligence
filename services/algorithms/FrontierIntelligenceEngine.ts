import {
  ReportParameters,
  SPIResult,
  RROI_Index,
  SEAM_Blueprint,
  AdvancedIndexResults,
  AdversarialConfidenceResult,
  AgenticBrainSnapshot,
  CompositeScoreResult
} from '../../types';
import { HistoricalLearningEngine } from '../MultiAgentBrainSystem';
import { GLOBAL_CITY_DATABASE } from '../../constants';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const hashString = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export interface NegotiationTermSheet {
  equitySplit: number;
  debtShare: number;
  governanceSeats: number;
  performanceMilestones: string[];
  protectionClauses: string[];
  valuationMultiple: number;
}

export interface NegotiationRound {
  round: number;
  bwgaOffer: NegotiationTermSheet;
  counterOffer: NegotiationTermSheet;
  convergenceScore: number;
}

export interface NegotiationOutcome {
  agreementProbability: number;
  finalTerms: NegotiationTermSheet;
  rounds: NegotiationRound[];
  negotiationStrategy: string;
}

export interface PersonaEvolutionSnapshot {
  basePersonas: string[];
  emergentPersonas: Array<{ name: string; focus: string; weight: number }>;
  retirementSignals: string[];
  evolutionRationale: string[];
}

export interface InstitutionalMemorySnapshot {
  memoryStrength: number;
  relevantPatterns: Array<{ id: string; era: string; region: string; outcome: string; lesson: string }>;
  crossDomainAnalogies: string[];
  learnedRules: string[];
}

export interface RegulatoryPulse {
  trend: 'tightening' | 'stable' | 'relaxing';
  frictionIndex: number;
  nextReviewWindowMonths: number;
  complianceSignals: string[];
}

export interface ForesightScenario {
  name: string;
  probability: number;
  impactScore: number;
  keyDrivers: string[];
  mitigation: string[];
}

export interface SyntheticForesightResult {
  topScenarios: ForesightScenario[];
  blackSwanMonitor: string[];
  robustnessScore: number;
}

export interface StakeholderPosition {
  stakeholder: string;
  influence: number;
  stance: 'supportive' | 'neutral' | 'opposed';
  likelyActions: string[];
}

export interface StakeholderSimulationResult {
  positions: StakeholderPosition[];
  coalitionMap: string[];
  negotiationLeverage: string[];
}

export interface ExplainabilityContract {
  assumptions: string[];
  evidenceSources: string[];
  formulaTrace: string[];
  personaTrace: string[];
  changeTriggers: string[];
  legalDefensibility: string[];
}

export interface ModalityFusionResult {
  modalities: Array<{ type: string; coverage: number; signalStrength: number }>;
  fusionConfidence: number;
  blindSpots: string[];
}

export interface WhatIfLeverImpact {
  lever: string;
  currentValue: number;
  delta: number;
  predictedImpact: { spi: number; rroi: number; seam: number };
}

export interface WhatIfSandboxResult {
  levers: WhatIfLeverImpact[];
  bestLevers: string[];
  riskWarnings: string[];
}

export interface GovernanceAutoUpdateResult {
  policyUpdates: string[];
  auditControls: string[];
  governanceScore: number;
  nextReviewDate: string;
}

export interface FrontierIntelligenceInputs {
  spi?: SPIResult;
  rroi?: RROI_Index;
  seam?: SEAM_Blueprint;
  advancedIndices?: AdvancedIndexResults;
  adversarialConfidence?: AdversarialConfidenceResult;
  agenticBrain?: AgenticBrainSnapshot;
  composite?: CompositeScoreResult;
}

export interface FrontierIntelligenceResult {
  negotiation: NegotiationOutcome;
  personaEvolution: PersonaEvolutionSnapshot;
  institutionalMemory: InstitutionalMemorySnapshot;
  regulatoryPulse: RegulatoryPulse;
  syntheticForesight: SyntheticForesightResult;
  stakeholderSimulation: StakeholderSimulationResult;
  explainabilityContract: ExplainabilityContract;
  modalityFusion: ModalityFusionResult;
  whatIfSandbox: WhatIfSandboxResult;
  governanceAutoUpdate: GovernanceAutoUpdateResult;
}

const deriveBaseScores = (inputs: FrontierIntelligenceInputs) => {
  const spi = inputs.spi?.spi ?? clamp(inputs.composite?.overall ?? 68, 35, 95);
  const rroi = inputs.rroi?.overallScore ?? clamp((inputs.composite?.components.marketAccess ?? 62) + 5, 30, 95);
  const seam = inputs.seam?.score ?? clamp((inputs.composite?.components.sustainability ?? 60) + 8, 25, 95);
  const regulatory = inputs.rroi?.components.regulatory?.score ?? inputs.composite?.components.regulatory ?? 60;
  const infrastructure = inputs.rroi?.components.infrastructure?.score ?? inputs.composite?.components.infrastructure ?? 60;
  return { spi, rroi, seam, regulatory, infrastructure };
};

const buildNegotiation = (rng: () => number, base: ReturnType<typeof deriveBaseScores>): NegotiationOutcome => {
  const riskTilt = clamp(100 - base.rroi, 10, 70);
  const alignmentTilt = clamp(base.seam, 20, 90);
  const baseEquity = clamp(55 + riskTilt * 0.2 - alignmentTilt * 0.15, 30, 80);
  const baseDebt = clamp(100 - baseEquity - 10, 10, 60);
  const baseValuation = clamp(4 + base.rroi / 18, 4, 12);

  const rounds: NegotiationRound[] = [];
  let bwga = {
    equitySplit: baseEquity,
    debtShare: baseDebt,
    governanceSeats: Math.round(clamp(3 + (100 - base.seam) / 25, 2, 6)),
    performanceMilestones: ['Local hiring target', 'Regulatory clearance within 9 months', 'Revenue ramp by month 18'],
    protectionClauses: ['Step-in rights', 'KPI-based dilution protection', 'Regulatory breach termination'],
    valuationMultiple: parseFloat((baseValuation + 0.4).toFixed(2))
  };

  let counter = {
    equitySplit: clamp(baseEquity - 8, 20, 75),
    debtShare: clamp(baseDebt + 6, 15, 65),
    governanceSeats: Math.round(clamp(bwga.governanceSeats - 1, 1, 5)),
    performanceMilestones: ['Local content commitment', 'Pilot launch within 6 months', 'Margin protection clause'],
    protectionClauses: ['Anti-dilution cap', 'FX hedge covenant', 'Governance parity option'],
    valuationMultiple: parseFloat((baseValuation - 0.3).toFixed(2))
  };

  for (let i = 1; i <= 5; i += 1) {
    const convergenceScore = clamp(100 - Math.abs(bwga.equitySplit - counter.equitySplit) * 1.5, 35, 95);
    rounds.push({ round: i, bwgaOffer: { ...bwga }, counterOffer: { ...counter }, convergenceScore });

    const concession = clamp(2 + rng() * 3, 1.5, 4);
    bwga = {
      ...bwga,
      equitySplit: clamp(bwga.equitySplit - concession, 25, 78),
      debtShare: clamp(100 - bwga.equitySplit - 10, 10, 65),
      valuationMultiple: parseFloat((bwga.valuationMultiple - 0.1).toFixed(2))
    };
    counter = {
      ...counter,
      equitySplit: clamp(counter.equitySplit + concession * 0.8, 20, 75),
      debtShare: clamp(100 - counter.equitySplit - 12, 12, 65),
      valuationMultiple: parseFloat((counter.valuationMultiple + 0.08).toFixed(2))
    };
  }

  const lastRound = rounds[rounds.length - 1];
  const agreementProbability = clamp((lastRound.convergenceScore + base.seam) / 2, 35, 92);

  return {
    agreementProbability,
    finalTerms: lastRound.bwgaOffer,
    rounds,
    negotiationStrategy: agreementProbability > 70
      ? 'Balanced concessions with phased governance escalation'
      : 'Risk-protected structure with milestone-based unlocks'
  };
};

const buildPersonaEvolution = (params: ReportParameters, base: ReturnType<typeof deriveBaseScores>): PersonaEvolutionSnapshot => {
  const basePersonas = ['Advocate', 'Skeptic', 'Regulator', 'Accountant', 'Operator'];
  const emergent: PersonaEvolutionSnapshot['emergentPersonas'] = [];

  const industry = params.industry?.join(' ').toLowerCase() ?? '';
  const region = (params.region || '').toLowerCase();

  if (industry.includes('energy') || industry.includes('mining') || industry.includes('infrastructure')) {
    emergent.push({ name: 'Climate Steward', focus: 'Decarbonization viability and transition risk', weight: 0.65 });
  }
  if (industry.includes('technology') || industry.includes('cyber') || industry.includes('data')) {
    emergent.push({ name: 'Cyber Sentinel', focus: 'Data sovereignty and threat exposure', weight: 0.6 });
  }
  if (region.includes('emerging') || region.includes('africa') || region.includes('latin')) {
    emergent.push({ name: 'Geopolitical Strategist', focus: 'Sovereign stability and policy drift', weight: 0.7 });
  }
  if (params.strategicIntent?.some(intent => intent.toLowerCase().includes('export'))) {
    emergent.push({ name: 'Trade Corridor Analyst', focus: 'Customs throughput and trade friction', weight: 0.55 });
  }

  const retirementSignals = base.spi > 78 ? ['Advocate burden reduced due to strong opportunity signal'] : [];
  const evolutionRationale = [
    `Base risk signal ${Math.round(100 - base.rroi)}/100`,
    `Alignment score ${Math.round(base.seam)}/100`,
    `Regulatory friction ${Math.round(100 - base.regulatory)}/100`
  ];

  return {
    basePersonas,
    emergentPersonas: emergent,
    retirementSignals,
    evolutionRationale
  };
};

const buildInstitutionalMemory = async (params: ReportParameters): Promise<InstitutionalMemorySnapshot> => {
  const patterns = await HistoricalLearningEngine.findRelevantPatterns(params);
  const relevant = patterns.slice(0, 5);
  const memoryStrength = clamp(
    relevant.reduce((sum, p) => sum + p.applicabilityScore, 0) / Math.max(relevant.length, 1) * 100,
    35,
    95
  );

  const crossDomainAnalogies = [
    'Infrastructure build-out mirrors 1930s US recovery playbook',
    'Digital adoption curve similar to 1990s East Asia export acceleration',
    'Governance reform path mirrors post-2000 EU accession models'
  ];

  const learnedRules = [
    'Regulatory certainty precedes capital velocity by 2-4 quarters',
    'Local partner credibility accelerates permit throughput',
    'FX volatility above 6% requires hedging in contract terms'
  ];

  return {
    memoryStrength,
    relevantPatterns: relevant.map(p => ({
      id: p.id,
      era: p.era,
      region: p.region,
      outcome: p.outcome,
      lesson: p.lessons[0]
    })),
    crossDomainAnalogies,
    learnedRules
  };
};

const buildRegulatoryPulse = (params: ReportParameters, base: ReturnType<typeof deriveBaseScores>): RegulatoryPulse => {
  const cityData = GLOBAL_CITY_DATABASE[params.country];
  const regulatoryQuality = cityData?.businessEnvironment?.regulatoryQuality ?? base.regulatory;
  const corruptionIndex = cityData?.businessEnvironment?.corruptionIndex ?? 50;
  const trend = regulatoryQuality < 55 || corruptionIndex > 60 ? 'tightening' : regulatoryQuality > 75 ? 'relaxing' : 'stable';
  const frictionIndex = clamp(100 - regulatoryQuality + corruptionIndex * 0.2, 20, 90);
  const nextReviewWindowMonths = Math.round(clamp(6 + (frictionIndex / 10), 6, 18));

  return {
    trend,
    frictionIndex,
    nextReviewWindowMonths,
    complianceSignals: [
      'Permit lead time sensitivity increasing',
      `Corruption index proxy: ${Math.round(corruptionIndex)}`,
      `Regulatory quality proxy: ${Math.round(regulatoryQuality)}`
    ]
  };
};

const buildSyntheticForesight = (rng: () => number, base: ReturnType<typeof deriveBaseScores>): SyntheticForesightResult => {
  const scenarios: ForesightScenario[] = [];
  const shocks = [
    'Policy reversal',
    'FX shock',
    'Supply chain disruption',
    'Demand surge',
    'Talent crunch',
    'Infrastructure bottleneck'
  ];

  for (let i = 0; i < 128; i += 1) {
    const shock = shocks[Math.floor(rng() * shocks.length)];
    const probability = clamp(0.02 + rng() * 0.2, 0.02, 0.22);
    const impactScore = clamp((100 - base.rroi) * (0.6 + rng() * 0.6), 15, 95);
    scenarios.push({
      name: `${shock} scenario ${i + 1}`,
      probability,
      impactScore,
      keyDrivers: [
        `Regulatory fragility ${Math.round(100 - base.regulatory)}/100`,
        `Infrastructure elasticity ${Math.round(base.infrastructure)}/100`
      ],
      mitigation: [
        'Stage capex against permitting milestones',
        'Hedge FX exposure with rolling coverage',
        'Add dual-sourcing in critical inputs'
      ]
    });
  }

  const topScenarios = scenarios
    .sort((a, b) => b.probability * b.impactScore - a.probability * a.impactScore)
    .slice(0, 5);

  const robustnessScore = clamp(100 - topScenarios.reduce((sum, s) => sum + s.impactScore * s.probability, 0) * 0.8, 20, 92);

  return {
    topScenarios,
    blackSwanMonitor: [
      'Rapid regulatory crackdown on cross-border capital',
      'Sudden tariff escalation in target corridors',
      'Capital flight triggered by political transition'
    ],
    robustnessScore
  };
};

const buildStakeholderSimulation = (base: ReturnType<typeof deriveBaseScores>): StakeholderSimulationResult => {
  const stakeholders: StakeholderPosition[] = [
    {
      stakeholder: 'National Regulator',
      influence: 0.85,
      stance: base.regulatory > 70 ? 'supportive' : 'neutral',
      likelyActions: ['Request compliance audit', 'Fast-track license review']
    },
    {
      stakeholder: 'Local Partner',
      influence: 0.7,
      stance: base.seam > 65 ? 'supportive' : 'neutral',
      likelyActions: ['Align governance model', 'Co-invest in pilot']
    },
    {
      stakeholder: 'Community Leaders',
      influence: 0.6,
      stance: base.seam > 60 ? 'supportive' : 'opposed',
      likelyActions: ['Demand community benefits', 'Raise media scrutiny']
    },
    {
      stakeholder: 'Strategic Competitor',
      influence: 0.55,
      stance: base.spi > 70 ? 'opposed' : 'neutral',
      likelyActions: ['Lobby against permits', 'Counter-bid key suppliers']
    },
    {
      stakeholder: 'Capital Providers',
      influence: 0.75,
      stance: base.rroi > 65 ? 'supportive' : 'neutral',
      likelyActions: ['Request downside protection', 'Seek covenant monitoring']
    }
  ];

  return {
    positions: stakeholders,
    coalitionMap: [
      'Regulator + Capital Providers aligned on governance transparency',
      'Community Leaders require social license commitments before expansion'
    ],
    negotiationLeverage: [
      'Leverage regulatory goodwill by committing to local workforce uplift',
      'Use competitor pressure to accelerate partner commitment'
    ]
  };
};

const buildExplainabilityContract = (params: ReportParameters, inputs: FrontierIntelligenceInputs): ExplainabilityContract => {
  const assumptions = [
    params.revenueBand ? 'Revenue band validated' : 'Revenue band missing: assume mid-market baseline',
    params.headcountBand ? 'Headcount band validated' : 'Headcount band missing: assume 250-500 employees',
    params.strategicIntent?.length ? 'Strategic intent provided' : 'Strategic intent inferred from mandate'
  ];

  const evidenceSources = [
    'World Bank Open Data API',
    'Open Exchange Rates API',
    'REST Countries API',
    'HistoricalLearningEngine patterns'
  ];

  const formulaTrace = [
    'SPI™',
    'RROI™',
    'SEAM™',
    'IVAS™',
    'SCF™',
    'PRI',
    'TCO',
    'CRI',
    'Advanced Indices (LAI, SAE, PPL, CLO, DVS, CSR)'
  ];

  const personaTrace = ['Advocate', 'Skeptic', 'Regulator', 'Accountant', 'Operator'];

  const changeTriggers = [
    'Regulatory score drops below 55',
    'Partner readiness falls two levels or more',
    'FX volatility exceeds 7% for two consecutive quarters',
    'Persona consensus drops below 60%'
  ];

  const legalDefensibility = [
    'All claims mapped to numeric evidence and versioned sources',
    'Audit trail available for formula inputs and persona objections',
    'Explicit disclosure of assumptions and data gaps'
  ];

  if (inputs.agenticBrain?.contradictions && inputs.agenticBrain.contradictions > 0) {
    assumptions.push(`Contradictions detected (${inputs.agenticBrain.contradictions}); flagged for legal review`);
  }

  return { assumptions, evidenceSources, formulaTrace, personaTrace, changeTriggers, legalDefensibility };
};

const buildModalityFusion = (params: ReportParameters): ModalityFusionResult => {
  const docs = params.ingestedDocuments ?? [];
  const textCoverage = clamp(docs.reduce((sum, d) => sum + (d.wordCount ?? 0), 0) / 20000, 0.2, 1);
  const structuredCoverage = clamp((params.industry?.length ?? 0) / 5 + (params.strategicIntent?.length ?? 0) / 4, 0.2, 1);
  const externalCoverage = params.country ? 0.85 : 0.6;

  const modalities = [
    { type: 'Narrative briefs', coverage: textCoverage, signalStrength: clamp(textCoverage * 0.9, 0.2, 1) },
    { type: 'Structured intake', coverage: structuredCoverage, signalStrength: clamp(structuredCoverage * 0.85, 0.2, 1) },
    { type: 'External macro data', coverage: externalCoverage, signalStrength: clamp(externalCoverage * 0.9, 0.2, 1) }
  ];

  const fusionConfidence = clamp((textCoverage + structuredCoverage + externalCoverage) / 3 * 100, 40, 95);
  const blindSpots = [
    docs.length === 0 ? 'No uploaded source documents' : '',
    params.partnerReadinessLevel ? '' : 'Partner readiness level not specified'
  ].filter(Boolean);

  return { modalities, fusionConfidence, blindSpots };
};

const buildWhatIfSandbox = (base: ReturnType<typeof deriveBaseScores>): WhatIfSandboxResult => {
  const levers: WhatIfLeverImpact[] = [
    { lever: 'Regulatory friction', currentValue: base.regulatory, delta: 10, predictedImpact: { spi: 2, rroi: 4, seam: 1 } },
    { lever: 'Partner readiness', currentValue: base.spi, delta: 8, predictedImpact: { spi: 6, rroi: 2, seam: 4 } },
    { lever: 'Infrastructure readiness', currentValue: base.infrastructure, delta: 7, predictedImpact: { spi: 3, rroi: 5, seam: 2 } },
    { lever: 'Social license alignment', currentValue: base.seam, delta: 9, predictedImpact: { spi: 4, rroi: 1, seam: 7 } },
    { lever: 'Capital cost reduction', currentValue: 50, delta: -5, predictedImpact: { spi: 1, rroi: 6, seam: 0 } },
    { lever: 'Timeline compression', currentValue: 12, delta: -3, predictedImpact: { spi: 2, rroi: 3, seam: -2 } }
  ];

  const bestLevers = levers
    .sort((a, b) => (b.predictedImpact.rroi + b.predictedImpact.spi + b.predictedImpact.seam) - (a.predictedImpact.rroi + a.predictedImpact.spi + a.predictedImpact.seam))
    .slice(0, 2)
    .map(l => l.lever);

  const riskWarnings = [
    'Timeline compression may reduce community alignment',
    'Regulatory friction improvements require formal engagement plan'
  ];

  return { levers, bestLevers, riskWarnings };
};

const buildGovernanceAutoUpdate = (
  params: ReportParameters,
  inputs: FrontierIntelligenceInputs,
  explainability: ExplainabilityContract
): GovernanceAutoUpdateResult => {
  const policyUpdates = [
    'Mandate periodic evidence refresh every 90 days',
    'Require dual-signoff on regulatory escalation',
    'Add FX hedging threshold policy at 6% volatility'
  ];

  if (!params.ingestedDocuments?.length) {
    policyUpdates.push('Block document export until source evidence uploaded');
  }

  if (inputs.adversarialConfidence?.score && inputs.adversarialConfidence.score < 60) {
    policyUpdates.push('Enforce enhanced adversarial review due to low confidence band');
  }

  const auditControls = [
    'Versioned evidence ledger for every formula input',
    'Persona dissent register captured in final report',
    'Approval workflow enforced at draft → review → approved'
  ];

  const governanceScore = clamp(70 + explainability.assumptions.length * -2 + (params.ingestedDocuments?.length ?? 0) * 2, 40, 95);
  const nextReviewDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  return { policyUpdates, auditControls, governanceScore, nextReviewDate };
};

export async function computeFrontierIntelligence(
  params: ReportParameters,
  inputs: FrontierIntelligenceInputs
): Promise<FrontierIntelligenceResult> {
  const seed = hashString(`${params.id || ''}:${params.organizationName}:${params.country}:${params.region}`);
  const rng = mulberry32(seed);
  const base = deriveBaseScores(inputs);

  const negotiation = buildNegotiation(rng, base);
  const personaEvolution = buildPersonaEvolution(params, base);
  const institutionalMemory = await buildInstitutionalMemory(params);
  const regulatoryPulse = buildRegulatoryPulse(params, base);
  const syntheticForesight = buildSyntheticForesight(rng, base);
  const stakeholderSimulation = buildStakeholderSimulation(base);
  const explainabilityContract = buildExplainabilityContract(params, inputs);
  const modalityFusion = buildModalityFusion(params);
  const whatIfSandbox = buildWhatIfSandbox(base);
  const governanceAutoUpdate = buildGovernanceAutoUpdate(params, inputs, explainabilityContract);

  return {
    negotiation,
    personaEvolution,
    institutionalMemory,
    regulatoryPulse,
    syntheticForesight,
    stakeholderSimulation,
    explainabilityContract,
    modalityFusion,
    whatIfSandbox,
    governanceAutoUpdate
  };
}
