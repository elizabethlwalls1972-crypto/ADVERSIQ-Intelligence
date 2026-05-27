/**
 * COMPREHENSIVE SYSTEM DEVELOPMENT DATA MODEL
 * This extends ReportParameters to capture everything needed to develop any system
 */

// Financial Model (in-depth)
export interface FinancialModel {
  // Investment
  capitalInvested: number;  // $ USD
  investmentType: 'equity' | 'debt' | 'grant' | 'sweat';
  investmentPhasing: { year1: number; year2: number; year3: number };
  workingCapitalNeeded: number;  // $ USD
  contingencyPercentage: number;  // % of budget
  fundingSourceBreakdown: {
    internal: number;
    debt: number;
    equity: number;
    grants: number;
  };

  // Revenue Streams (up to 5)
  revenueStreams: Array<{
    name: string;
    unitPrice: number;
    unitsPerYear: { year1: number; year2: number; year3: number; year5: number };
    type: 'recurring' | 'one-time' | 'hybrid';
  }>;
  
  totalRevenue: {
    year1: number;
    year3: number;
    year5: number;
  };
  
  revenueGrowthRate: number;  // %
  recurringPercentage: number;  // % of revenue

  // Costs
  cogsAsPercentage: number;  // %
  grossMarginTarget: number;  // %
  opexBudget: number;  // $ USD
  headcountPlan: {
    year1: number;
    year3: number;
    year5: number;
  };
  keyCostDrivers: string[];  // e.g., "Salaries", "Cloud infrastructure"
  costReductionOpportunities: string[];

  // Returns
  breakEvenMonths: number;
  year5EbitdaMargin: number;  // %
  npv: number;  // $ at discount rate
  discountRate: number;  // %
  irr: number;  // %
  returnMultiple: number;  // total cash returned / invested
  paybackPeriodMonths: number;
  roic: number;  // %

  // Scenarios
  baseCase: {
    assumptions: string[];
    year5Revenue: number;
    year5Margin: number;
  };
  
  downsideCase: {
    revenueImpact: number;  // % reduction from base
    year5Revenue: number;
    year5Margin: number;
  };
  
  upsideCase: {
    revenueImpact: number;  // % increase from base
    year5Revenue: number;
    year5Margin: number;
  };

  // Sensitivity
  topSensitivityDrivers: Array<{
    driver: string;  // e.g., "Customer Acquisition Cost"
    baselineValue: number;
    impactOnIRR: number;  // % point change per 10% change in driver
  }>;
}

// Risk Register
export interface RiskItem {
  id: string;
  name: string;
  category: 'market' | 'operational' | 'financial' | 'legal' | 'relationship' | 'technical';
  probability: number;  // 0-100
  impactUSD: number;  // potential loss in dollars
  mitigationPlan: string;
  owner: string;  // who's responsible
  status: 'open' | 'mitigated' | 'accepted' | 'avoided';
  contingencyBudget?: number;  // $ set aside
}

export interface RiskRegister {
  risks: RiskItem[];
  totalExposure: number;  // sum of (probability * impact)
  riskAppetite: 'low' | 'medium' | 'high';
  riskCapitalAllocated: number;  // $ for contingencies
}

// Market Context
export interface MarketContext {
  // TAM/SAM/SOM
  tam: {
    dollars: number;  // $ billions
    units: number;  // if applicable
  };
  sam: {
    dollars: number;
    units: number;
  };
  som: {
    dollars: number;
    units: number;
  };
  
  // Growth & Maturity
  marketGrowthRate: number;  // % CAGR
  maturityStage: 'emerging' | 'growth' | 'mature' | 'decline';
  marketSegments: Array<{
    name: string;
    percentageOfMarket: number;
    growthRate: number;
  }>;

  // Dynamics
  topTrends: string[];  // top 5 market trends
  disruptionThreats: string[];
  regulatoryEnvironment: 'favorable' | 'neutral' | 'hostile' | 'unknown';
  priceElasticity: 'elastic' | 'inelastic';
  customerConcentration: number;  // % revenue from top customer
  buyerDecisionCycle: number;  // days

  // Geographic
  targetCountry: string;
  targetRegion: string;
  targetCities: string[];
  localMarketSize: number;  // $ millions
  competitorCount: number;
  importExportRegulations: string;
  taxTreatyStatus: string;
  ipProtectionQuality: number;  // 1-10 (1=weak, 10=strong)
  geopoliticalRiskScore: number;  // 1-10 (1=safe, 10=dangerous)

  // Macro
  gdpGrowth: number;  // 3-year forecast
  inflationRate: number;  // %
  currencyVolatility: number;  // historical std dev
  interestRateEnvironment: string;  // 'rising' | 'stable' | 'falling'
  tradePolicy: string;  // summary of tariffs, sanctions, etc.
  laborCostTrend: 'increasing' | 'stable' | 'decreasing';

  // Industry-Specific
  consolidationTrend: boolean;  // true = industry consolidating
  pricingPressure: 'intense' | 'moderate' | 'minimal';
  supplierConcentration: 'high' | 'medium' | 'low';
  customerConcentrationLevel: 'high' | 'medium' | 'low';
  switchingCosts: 'high' | 'medium' | 'low';
  barrierToEntry: 'high' | 'medium' | 'low';
}

// Team & Capability Assessment
export interface TeamMember {
  name: string;
  title: string;
  background: string;  // years, key achievements
  criticalToSuccess: boolean;
  backfillAvailable: boolean;
}

export interface CapabilityAssessment {
  executiveTeam: {
    ceo?: TeamMember;
    cfo?: TeamMember;
    coo?: TeamMember;
    cto?: TeamMember;
    others: TeamMember[];
  };

  specializedRolesNeeded: Array<{
    role: string;
    justification: string;
    marketAvailability: 'scarce' | 'available' | 'abundant';
  }>;

  benchStrength: string;  // narrative on who can step up

  organizationalCapabilities: {
    salesCapability: {
      rating: 1 | 2 | 3 | 4 | 5;  // 1=weak, 5=excellent
      evidence: string[];
    };
    operationsCapability: {
      rating: 1 | 2 | 3 | 4 | 5;
      evidence: string[];
    };
    pAndLManagement: {
      rating: 1 | 2 | 3 | 4 | 5;
      evidence: string[];
    };
    internationalExperience: {
      rating: 1 | 2 | 3 | 4 | 5;
      evidence: string[];
    };
    mAndAIntegration: {
      rating: 1 | 2 | 3 | 4 | 5;
      evidence: string[];
    };
    changeManagement: {
      rating: 1 | 2 | 3 | 4 | 5;
      evidence: string[];
    };
  };

  // Technology Stack
  technologyStack: {
    coreEngine: string;
    platform: 'cloud' | 'on-premise' | 'hybrid';
    integrationRequirements: string[];
    ip: {
      patents: string[];
      trademarks: string[];
      proprietaryProcesses: string[];
    };
    technicalDebt: string[];
    scalability: 'limited' | 'moderate' | 'excellent';
  };

  // Capability Gaps
  capabilitiesWeHave: string[];
  capabilitiesWeNeed: string[];
  capabilitiesWeCanBuild: Array<{
    capability: string;
    timeline: number;  // months
  }>;
  capabilitiesWeMustAcquire: string[];
}

// Partnership & Stakeholder Assessment
export interface PartnerAssessment {
  partnerNames: string[];
  partnerSize: 'startup' | 'mid-market' | 'enterprise';
  partnerRevenue: number;  // $ millions
  partnerCapabilities: string[];
  partnerGeography: string[];
  partnerStrategicDirection: string;
  primaryContact: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };

  strategicAlignment: {
    score: number;  // 1-10
    ourGoalsVsPartner: string;
    ourTimelineVsPartner: string;
    ourRiskToleranceVsPartner: string;
  };

  culturalFit: {
    decisionMakingSpeed: 'aligned' | 'misaligned';  // us vs partner
    hierarchy: 'aligned' | 'misaligned';
    innovationAppetite: 'aligned' | 'misaligned';
    riskAversion: 'aligned' | 'misaligned';
    communicationStyle: 'aligned' | 'misaligned';
  };

  competitiveConflicts: {
    directCompetition: boolean;
    customerConflict: boolean;
    supplierConflict: boolean;
    nonCompeteImplications: string;
    channelConflictRisk: 'high' | 'medium' | 'low';
  };

  relationshipDynamics: {
    relationshipHistory: 'new' | 'existing' | 'previous';
    trustLevel: number;  // 1-10
    priorDealingOutcome: 'successful' | 'mixed' | 'failed';
    relationshipDepth: 'single-contact' | 'multi-contact' | 'deep';
    expectedCommunicationCadence: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dealExperience: boolean;
  };
}

// Execution Plan
export interface ExecutionPhase {
  name: string;
  startMonth: number;
  endMonth: number;
  milestones: Array<{
    name: string;
    dueMonth: number;
    owner: string;
    description: string;
    keyDecisions: string[];
    approvalsNeeded: string[];
  }>;
  budgetRequired: number;  // $ USD
}

export interface ExecutionPlan {
  phases: Array<{
    phase1Foundation: ExecutionPhase;
    phase2Ramp: ExecutionPhase;
    phase3Scale: ExecutionPhase;
  }>;

  goNoCriteria: Array<{
    phase: 1 | 2 | 3;
    criteria: string[];
    month: number;
  }>;

  criticalPath: string[];  // items that can't slip
  parallelWorkstreams: string[];  // can work in parallel
  dependencies: Array<{
    blockedTask: string;
    blockedByTask: string;
  }>;
  bufferTimePercentage: number;  // % contingency
}

// Governance
export interface GovernanceFramework {
  steeringCommittee: {
    members: string[];
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  };
  
  workingGroups: Array<{
    name: string;
    leads: string[];
    frequency: string;
  }>;

  decisionAuthorityMatrix: Record<string, string>;  // decision -> who decides
  escalationPath: string[];
  meetingCadence: string;

  keyMetricsAndDashboards: Array<{
    category: 'financial' | 'operational' | 'strategic' | 'health';
    metrics: Array<{
      name: string;
      target: number;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    }>;
  }>;

  contingencyPlans: Array<{
    trigger: string;  // "If revenue misses >20%"
    action: string;   // "Then [do this]"
    owner: string;
  }>;
}

export interface ComprehensiveSystemModel {
  // Core identity
  id: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
  status: 'draft' | 'in-progress' | 'ready-for-review' | 'approved' | 'executed';

  // 9 Comprehensive Sections
  identity: {
    organization: {
      legalName: string;
      entityType: string;
      industryClassification: string;
      yearsInOperation: number;
      headquarters: { country: string; city: string };
      operatingRegions: string[];
    };
    capacity: {
      employees: number;
      annualRevenue: number;
      ebitda: number;
      keySegments: Array<{ name: string; percentage: number }>;
      marketShare: number;  // % in primary segment
      profitabilityTrend: 'growing' | 'stable' | 'declining';
    };
    structure: {
      decisionMaker: string;
      boardComposition: string;
      keyAdvisors: TeamMember[];
    };
    competition: {
      competitors: string[];
      coreAdvantages: string[];
      uniqueIp: string[];
      brandRecognition: 'local' | 'regional' | 'national' | 'global';
      customerConcentrationRisk: number;  // % from top 3 customers
    };
    financialStability: {
      creditRating: string;
      debtLevels: number;  // leverage ratio
      liquidityPosition: 'strong' | 'adequate' | 'weak';
    };
  };

  mandate: {
    vision: string;  // 3-5 year outlook
    strategicIntents: string[];
    problemStatement: string;
    currentState: string;
    desiredFutureState: string;
    urgency: 'high' | 'medium' | 'low';
    costOfInaction: number;  // $

    objectives: Array<{
      name: string;
      primaryKpi: string;
      target: number;
      timeline: number;  // months
    }>;

    targetPartner: {
      size: string;
      industry: string;
      geography: string;
      capabilities: string[];
      culture: string;
      decisionMakerProfile: string;
    };

    valueProposition: {
      whatWeBring: string;
      whatWeExpect: string;
      winWinFramework: string;
      riskShare: string;
      upsideShare: string;  // profit split, equity stake
    };

    governance: {
      preferredStructure: 'jv' | 'alliance' | 'equity' | 'license' | 'distribution';
      governanceModel: string;
      decisionProcess: string;
      escalationPath: string;
      integrationTimeline: number;  // months
      integrationLead: string;
    };
  };

  market: MarketContext;
  partners: PartnerAssessment;
  financial: FinancialModel;
  risks: RiskRegister;
  capabilities: CapabilityAssessment;
  execution: ExecutionPlan;
  governance: GovernanceFramework;

  // Readiness Scoring
  readinessScore: {
    identity: number;  // 0-100
    mandate: number;
    market: number;
    partners: number;
    financial: number;
    risks: number;
    capabilities: number;
    execution: number;
    governance: number;
    overall: number;  // weighted average
    status: 'red' | 'yellow' | 'green';
    gaps: string[];  // what's missing
  };
}

// Historical intelligence + advisor artifacts
export interface ReferenceEngagement {
  id: string;
  era: string;  // e.g., "1990s", "Post-2020"
  region: string;  // primary geography
  sector: string;  // industry or macro theme
  archetype: 'government' | 'bank' | 'enterprise' | 'startup' | 'consortium';
  scenario: string;  // short label such as "Market Entry via JV"
  summary: string;
  outcomes: string[];
  playbook: string[];  // notable moves
  metrics: {
    capitalMobilized: number;  // USD
    timeToDeployMonths: number;
    partnersInvolved: number;
    gdpImpactBps?: number;  // GDP basis point impact when relevant
  };
  relevanceTags: string[];  // quick heuristics for matching
}

export interface IntelligenceSignal {
  type: 'trend' | 'risk' | 'opportunity' | 'benchmark';
  description: string;
  confidence: 'low' | 'medium' | 'high';
  source?: string;
}

export interface StrategicArtifactSection {
  title: string;
  narrative: string;
  bullets: string[];
}

export interface IntelligenceArtifacts {
  battlePlan: StrategicArtifactSection;
  riskBrief: StrategicArtifactSection;
  opportunityScan: StrategicArtifactSection;
}

export interface AdvisorSnapshot {
  summary: string;
  priorityMoves: string[];
  engagements: ReferenceEngagement[];
  artifacts: IntelligenceArtifacts;
  signals: IntelligenceSignal[];
}

export interface AdvisorInputModel {
  identity?: {
    organization?: {
      legalName?: string;
      industryClassification?: string;
      headquarters?: {
        country?: string;
        city?: string;
      };
    };
  };
  market?: {
    targetRegion?: string;
    targetCountry?: string;
    marketGrowthRate?: number;
  };
  mandate?: {
    targetPartner?: {
      industry?: string;
      geography?: string;
    };
    governance?: {
      preferredStructure?: 'jv' | 'alliance' | 'equity' | 'license' | 'distribution';
    };
  };
  partners?: {
    strategicAlignment?: {
      score?: number;
    };
  };
  risks?: {
    risks?: Array<unknown>;
  };
}

