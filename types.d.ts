import React, { ElementType } from 'react';
export type SkillLevel = 'novice' | 'experienced' | 'expert';
export interface IngestedDocumentMeta {
    filename: string;
    fileType?: string;
    fileSize?: number;
    wordCount?: number;
    uploadedAt: string;
    notes?: string;
    content?: string;
    extractedInsights?: {
        entities?: string[];
        financials?: string[];
        risks?: string[];
        opportunities?: string[];
        strengths?: string[];
        weaknesses?: string[];
        recommendations?: string[];
        categories?: string[];
        confidence?: number;
    };
}
export type ChecklistStatus = 'pending' | 'satisfied' | 'failed' | 'skipped';
export interface ChecklistItem {
    id: string;
    label: string;
    category: 'Identity' | 'Strategy' | 'Financial' | 'Risk' | 'Compliance';
    status: ChecklistStatus;
    value?: string | number | boolean | null;
    required: boolean;
    description: string;
    validationRule?: string;
    dependencies?: string[];
}
export interface DynamicFormula {
    id: string;
    name: string;
    expression: string;
    variables: string[];
    description?: string;
    isSystem?: boolean;
}
export interface NeuroSymbolicState {
    checklist: ChecklistItem[];
    formulas: DynamicFormula[];
    variableStore: Record<string, number | string | boolean>;
}
export interface Service {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
}
export interface Feature {
    id: string;
    title: string;
    description: string;
}
export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    duration: string;
    description: string;
    features: string[];
    recommended?: boolean;
}
export interface CopilotOption {
    id: string;
    title: string;
    rationale: string;
}
export interface ChatMessage {
    id?: string;
    role?: 'user' | 'model';
    sender?: 'user' | 'copilot' | 'system';
    text: string;
    isStreaming?: boolean;
    isThinking?: boolean;
    thinkingStep?: string;
    options?: CopilotOption[];
    meta?: {
        followUp?: string;
    };
}
export interface OpportunityScore {
    totalScore: number;
    marketPotential: number;
    riskFactors: number;
}
export interface ReportParameters {
    reportName: string;
    userName: string;
    userDepartment: string;
    skillLevel: string;
    userCountry: string;
    userCity?: string;
    userTier: string;
    entityClassification?: string;
    parentAgency?: string;
    operatingUnit?: string;
    missionRequestSummary?: string;
    assistanceBackground?: string;
    intakeGuidanceMode?: 'orientation' | 'collaborative' | 'expert';
    ingestedDocuments?: IngestedDocumentMeta[];
    organizationName: string;
    organizationType: string;
    organizationSubType: string;
    organizationAddress?: string;
    organizationWebsite?: string;
    revenueBand?: string;
    headcountBand?: string;
    yearsOperation?: string;
    decisionAuthority?: string;
    industryClassification?: string;
    organizationSize?: string;
    contactEmail?: string;
    contactPhone?: string;
    linkedinProfile?: string;
    twitterHandle?: string;
    organizationDescription?: string;
    secondaryContactEmail?: string;
    secondaryContactPhone?: string;
    exactEmployeeCount?: string;
    annualRevenue?: string;
    customOrganizationType?: string;
    customOrganizationSubType?: string;
    customYearsOperation?: string;
    customDecisionAuthority?: string;
    customOrganizationSize?: string;
    region: string;
    country: string;
    industry: string[];
    nicheAreas?: string[];
    customIndustry: string;
    tier: string[];
    strategicIntent: string[];
    strategicMode: string;
    problemStatement: string;
    idealPartnerProfile: string;
    targetPartner?: string;
    analysisTimeframe: string;
    strategicObjectives: string[];
    strategicLens?: string[];
    priorityThemes?: string[];
    targetCounterpartType?: string[];
    successMetrics?: string[];
    specificOpportunity?: string;
    targetIncentives?: string[];
    partnerPersonas?: string[];
    stakeholderAlignment?: string[];
    stakeholderConcerns?: string;
    alignmentPlan?: string;
    executiveSponsor?: string;
    partnerReadinessLevel?: string;
    partnerFitCriteria?: string[];
    relationshipGoals?: string[];
    partnerEngagementNotes?: string;
    relationshipStage: string;
    dueDiligenceDepth: string;
    partnerCapabilities: string[];
    operationalPriority: string;
    riskTolerance: string;
    expansionTimeline: string;
    partnershipSupportNeeds: string[];
    fundingSource?: string;
    procurementMode?: string;
    politicalSensitivities?: string[];
    dealSize?: string;
    customDealSize?: string;
    id: string;
    createdAt: string;
    status: string;
    outcome?: 'Success' | 'Failure' | 'Stalled' | 'Ongoing';
    outcomeReason?: string;
    actualReturnMultiplier?: number;
    reportPayload?: ReportPayload;
    selectedAgents: string[];
    selectedModels: string[];
    selectedModules: string[];
    analyticalModules: string[];
    aiPersona: string[];
    customAiPersona: string;
    intelligenceCategory?: string;
    activeOpportunity?: LiveOpportunityItem;
    reportLength: string;
    reportComplexity: 'flash' | 'standard' | 'omni';
    collaborativeNotes: string;
    outputFormat: string;
    letterStyle: string;
    stakeholderPerspectives: string[];
    includeCrossSectorMatches: boolean;
    matchCount: number;
    partnerDiscoveryMode: boolean;
    searchScope: string;
    intentTags: string[];
    comparativeContext: string[];
    additionalContext: string;
    opportunityScore: OpportunityScore;
    calibration?: {
        constraints?: {
            budgetCap?: string;
            capitalMix?: {
                debt: number;
                equity: number;
                grant: number;
            };
        };
        capabilitiesHave?: string[];
        capabilitiesNeed?: string[];
        riskHorizon?: string[];
        operationalChassis?: {
            taxStructure?: string;
            entityPreference?: string;
        };
    };
    neuroSymbolicState?: NeuroSymbolicState;
}
export interface GlobalCityData {
    city: string;
    country: string;
    region: string;
    population: number;
    talentPool: {
        laborCosts: number;
        educationLevel: number;
        skillsAvailability: number;
    };
    infrastructure: {
        transportation: number;
        digital: number;
        utilities: number;
    };
    businessEnvironment: {
        easeOfDoingBusiness: number;
        corruptionIndex: number;
        regulatoryQuality: number;
    };
    marketAccess: {
        domesticMarket: number;
        exportPotential: number;
        regionalConnectivity: number;
    };
    gdp: {
        totalBillionUSD: number;
        perCapitaUSD: number;
    };
}
export interface RegionProfile {
    id: string;
    name: string;
    country: string;
    population: number;
    gdp: number;
    rawFeatures: {
        name: string;
        rarityScore: number;
        relevanceScore: number;
        marketProxy: number;
    }[];
    sectorHint?: string;
    regulatoryComplexity?: number;
    permitBacklogMonths?: number;
    infrastructureSignal?: number;
    talentSignal?: number;
}
export interface CompositeScoreInputs {
    gdpCurrent: number;
    population: number;
    gdpPerCapita: number;
    gdpGrowth: number;
    inflation: number;
    fdiInflows: number;
    tradeBalance: number;
    easeOfBusiness?: number | null;
    unemployment?: number | null;
    regionBaseline: number;
}
export interface CompositeScoreComponents {
    infrastructure: number;
    talent: number;
    costEfficiency: number;
    marketAccess: number;
    regulatory: number;
    politicalStability: number;
    growthPotential: number;
    riskFactors: number;
    digitalReadiness: number;
    sustainability: number;
    innovation: number;
    supplyChain: number;
}
export interface CompositeScoreResult {
    components: CompositeScoreComponents;
    overall: number;
    inputs: CompositeScoreInputs;
    dataSources: string[];
}
export interface MarketShare {
    country: string;
    share: number;
}
export interface MarketOpportunity {
    country: string;
    city?: string;
    growthRate: number;
    easeOfEntry: number;
    talentAvailability: number;
    innovationIndex: number;
    regulatoryFriction: number;
    marketSize: string;
    opportunityScore: number;
    recommendedStrategy: string;
    rationale: string;
    historicalComparables?: string[];
    timeToActivation?: {
        p10: number;
        p50: number;
        p90: number;
    };
}
export interface DiversificationAnalysis {
    hhiScore: number;
    riskLevel: 'Diversified' | 'Moderate Concentration' | 'High Concentration' | 'Critical Dependency';
    concentrationAnalysis: string;
    recommendedMarkets: MarketOpportunity[];
}
export interface LAIResult {
    title: string;
    description: string;
    components: string[];
    synergyTag?: string;
}
export interface IVASBreakdown {
    activationFriction: string;
    opportunityQuantum: string;
    complianceFriction?: string;
}
export interface IVASResult {
    ivasScore: number;
    activationMonths: number;
    breakdown: IVASBreakdown;
    p10Months?: number;
    p50Months?: number;
    p90Months?: number;
}
export interface SCFResult {
    totalEconomicImpactUSD: number;
    directJobs: number;
    indirectJobs: number;
    annualizedImpact: number;
    impactP10?: number;
    impactP50?: number;
    impactP90?: number;
    jobsP10?: number;
    jobsP50?: number;
    jobsP90?: number;
}
export type RiskBand = 'Low' | 'Medium' | 'High';
export interface PRIResult {
    overall: number;
    riskBand: RiskBand;
    components: {
        political: number;
        regulatory: number;
        market: number;
        security: number;
    };
    commentary: string[];
}
export interface TCOResult {
    fiveYearUSD: number;
    annualRunRateUSD: number;
    breakdown: {
        operating: number;
        capital: number;
        compliance: number;
    };
    sensitivity: {
        fxExposure: string;
        inflationOutlook: string;
    };
    notes: string[];
}
export interface CRIResult {
    score: number;
    resonanceTier: 'High' | 'Medium' | 'Emerging';
    components: {
        communityFit: number;
        governanceFit: number;
        partnerTrust: number;
    };
    signals: string[];
}
export type InsightBand = 'low' | 'medium' | 'high' | 'critical';
export interface DerivedIndexBase {
    score: number;
    band: InsightBand;
    drivers: string[];
    pressurePoints: string[];
    recommendation: string;
    dataSources?: string[];
}
export interface BARNAResult extends DerivedIndexBase {
    leverageProfile: 'weak' | 'balanced' | 'dominant';
    fallbackPositions: string[];
    confidence: number;
}
export interface NVIResult extends DerivedIndexBase {
    monetaryValueUSD: number;
    intangibleValueNarrative: string;
}
export interface CAPResult extends DerivedIndexBase {
    counterpartiesAssessed: number;
    trustSignals: string[];
    redFlags: string[];
    diligenceDepth: 'light' | 'standard' | 'enhanced';
}
export interface AGIResult extends DerivedIndexBase {
    velocityScore: number;
    timeToValueMonths: {
        p10: number;
        p50: number;
        p90: number;
    };
    gatingFactors: string[];
}
export interface VCIResult extends DerivedIndexBase {
    valueBreakdown: {
        revenueLiftUSD: number;
        costSavingsUSD: number;
        strategicPremiumUSD: number;
    };
}
export interface ATIResult extends DerivedIndexBase {
    transitionRoutes: string[];
    changeManagementNeeds: string[];
}
export interface ESIResult extends DerivedIndexBase {
    capacityUtilization: number;
    executionGaps: string[];
    opsPlaybook: string[];
}
export interface ISIResult extends DerivedIndexBase {
    innovationPortfolioMix: {
        core: number;
        adjacent: number;
        transformational: number;
    };
    ipSignals: string[];
}
export interface OSIResult extends DerivedIndexBase {
    sustainabilityMetrics: {
        emissionsScore: number;
        circularityScore: number;
    };
    resilienceDrivers: string[];
}
export interface LAIResult extends DerivedIndexBase {
    advisoryBias: 'overstated' | 'aligned' | 'understated';
    gapScore: number;
}
export interface SAEResult extends DerivedIndexBase {
    exposureBand: 'low' | 'medium' | 'high' | 'critical';
    watchlists: string[];
    requiredControls: string[];
}
export interface PPLResult extends DerivedIndexBase {
    approvalProbability: number;
    leadTimeDays: {
        p50: number;
        p90: number;
    };
    criticalAgencies: string[];
}
export interface CLOResult extends DerivedIndexBase {
    licenseBand: 'secure' | 'watch' | 'fragile';
    engagementActions: string[];
    grievanceSignals: string[];
}
export interface DVSResult extends DerivedIndexBase {
    sensitivityRanked: Array<{
        driver: string;
        impactScore: number;
    }>;
    topLevers: string[];
}
export interface CSRResult extends DerivedIndexBase {
    resilienceBand: 'strong' | 'moderate' | 'weak';
    covenantHeadroom: number;
    stressFactors: string[];
}
export interface RNIResult extends DerivedIndexBase {
    clearancePath: string[];
    policyWatchlist: string[];
    complianceEffort: 'light' | 'moderate' | 'heavy';
}
export interface RFIResult extends DerivedIndexBase {
    frictionIndex: number;
    approvalWindowDays: {
        p50: number;
        p90: number;
    };
    bottlenecks: string[];
}
export interface PSSResult extends DerivedIndexBase {
    sensitivity: number;
    shockScenarios: string[];
    riskAdjustedDelta: number;
}
export interface CISResult extends DerivedIndexBase {
    integrityBand: 'verified' | 'watch' | 'high-risk';
    redFlagCount: number;
    verificationSignals: string[];
}
export interface SEQResult extends DerivedIndexBase {
    dependencyMap: string[];
    sequencingRisks: string[];
}
export interface FMSResult extends DerivedIndexBase {
    fundingCoverageRatio: number;
    cashflowGapUSD: number;
    timingMisalignments: string[];
}
export interface DCSResult extends DerivedIndexBase {
    dependencyConcentration: number;
    singlePointFailures: string[];
}
export interface DQSResult extends DerivedIndexBase {
    coverageScore: number;
    freshnessScore: number;
    verifiabilityScore: number;
    dataGaps: string[];
}
export interface GCSResult extends DerivedIndexBase {
    decisionClarityScore: number;
    exitClarityScore: number;
    governanceRisks: string[];
}
export interface SRAResult extends DerivedIndexBase {
    sovereignRiskBand: 'secure' | 'watch' | 'distressed';
    macroSignals: string[];
    stressEvents: string[];
}
export interface IDVResult extends DerivedIndexBase {
    distanceScore: number;
    culturalBridges: string[];
    alignmentPlaybook: string[];
}
export interface RDBIResult extends DerivedIndexBase {
    direction: 'home-biased' | 'balanced' | 'outbound';
    referenceRegion: string;
    overrideSwitches: string[];
}
export interface AFCResult extends DerivedIndexBase {
    coefficient: number;
    dragFactors: string[];
    accelerationLevers: string[];
    timePenaltyMonths: number;
}
export interface FRSResult extends DerivedIndexBase {
    loopDesign: string[];
    energySources: string[];
    sustainingRisk: number;
    compoundingHalfLifeMonths: number;
    signals: string[];
}
export interface AgenticBrainSnapshot {
    proceedSignal: 'proceed' | 'pause' | 'restructure' | 'reject';
    headline: string;
    consensusStrength: number;
    topDrivers: string[];
    topRisks: string[];
    nextActions: string[];
    performance: {
        totalTimeMs: number;
        inputValidationMs: number;
        memoryRetrievalMs: number;
        reasoningMs: number;
        synthesisMs: number;
        speedupFactor: number;
    };
    trustScore: number;
    contradictions: number;
}
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
    emergentPersonas: Array<{
        name: string;
        focus: string;
        weight: number;
    }>;
    retirementSignals: string[];
    evolutionRationale: string[];
}
export interface InstitutionalMemorySnapshot {
    memoryStrength: number;
    relevantPatterns: Array<{
        id: string;
        era: string;
        region: string;
        outcome: string;
        lesson: string;
    }>;
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
    modalities: Array<{
        type: string;
        coverage: number;
        signalStrength: number;
    }>;
    fusionConfidence: number;
    blindSpots: string[];
}
export interface WhatIfLeverImpact {
    lever: string;
    currentValue: number;
    delta: number;
    predictedImpact: {
        spi: number;
        rroi: number;
        seam: number;
    };
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
export interface AdvancedIndexResults {
    barna: BARNAResult;
    nvi: NVIResult;
    cap: CAPResult;
    agi: AGIResult;
    vci: VCIResult;
    ati: ATIResult;
    esi: ESIResult;
    isi: ISIResult;
    osi: OSIResult;
    rni: RNIResult;
    rfi: RFIResult;
    pss: PSSResult;
    cis: CISResult;
    seq: SEQResult;
    fms: FMSResult;
    dcs: DCSResult;
    dqs: DQSResult;
    gcs: GCSResult;
    sra: SRAResult;
    idv: IDVResult;
    rdbi: RDBIResult;
    afc: AFCResult;
    frs: FRSResult;
    lai: LAIResult;
    sae: SAEResult;
    ppl: PPLResult;
    clo: CLOResult;
    dvs: DVSResult;
    csr: CSRResult;
}
export interface AdversarialInputCheck {
    field: string;
    userClaim: string;
    externalEvidence: string[];
    contradictionLevel: number;
    challengePrompt: string;
    severity: 'info' | 'warning' | 'critical';
}
export interface AdversarialShieldResult {
    contradictionIndex: number;
    checks: AdversarialInputCheck[];
    escalations: string[];
    reviewedAt: string;
}
export interface AdversarialConfidenceResult {
    score: number;
    band: InsightBand;
    coverage: {
        shieldDepth: number;
        personaBreadth: number;
        counterfactualStress: number;
        motivationClarity: number;
        outcomeLearning: number;
    };
    degradationFlags: string[];
    recommendedHardening: string[];
    rationale: string;
}
export type PersonaRole = 'Skeptic' | 'Advocate' | 'Regulator' | 'Accountant' | 'Operator';
export interface PersonaInsight {
    persona: PersonaRole;
    stance: 'support' | 'neutral' | 'oppose';
    summary: string;
    evidence: string[];
    riskCallouts: string[];
}
export interface PersonaPanelResult {
    consensus: 'go' | 'hold' | 'block';
    agreementLevel: number;
    insights: PersonaInsight[];
    blindSpots: string[];
}
export interface MotivationRedFlag {
    flag: string;
    evidence: string;
    probability: number;
}
export interface MotivationAnalysis {
    statedMotivation: string;
    impliedMotivation: string;
    alignmentScore: number;
    redFlags: MotivationRedFlag[];
    narrative: string;
}
export interface CounterfactualImpactDelta {
    spiDelta?: number;
    rroiDelta?: number;
    scfDeltaUSD?: number;
    activationMonthsDelta?: number;
}
export interface CounterfactualScenario {
    scenario: string;
    baseline: string;
    opposite: string;
    impactDelta: CounterfactualImpactDelta;
    opportunityCostUSD: number;
    regretProbability: number;
    recommendation: string;
}
export interface CounterfactualLabResult {
    scenarios: CounterfactualScenario[];
    highestRegretScenario?: string;
}
export interface OutcomeAlignment {
    metric: string;
    predicted: number;
    actual?: number;
    delta?: number;
    status: 'pending' | 'tracking' | 'met' | 'missed';
}
export interface OutcomeLearningSnapshot {
    reportId: string;
    predictions: OutcomeAlignment[];
    learningActions: string[];
    lastUpdated: string;
}
export interface ProvenanceTag {
    metric: string;
    source: string;
    freshness: string;
    coverage?: number;
}
export interface OrchResult {
    details: {
        lais?: LAIResult[];
        ivas?: IVASResult;
        scf?: SCFResult;
        provenance?: ProvenanceTag[];
    };
    nsilOutput: string;
}
export interface RROI_Component {
    name: string;
    score: number;
    analysis: string;
}
export interface RROI_Index {
    overallScore: number;
    summary: string;
    components: {
        infrastructure: RROI_Component;
        talent: RROI_Component;
        regulatory: RROI_Component;
        market: RROI_Component;
    };
}
export interface SEAM_Partner {
    name: string;
    role: string;
    synergy: number;
}
export interface SEAM_Blueprint {
    score: number;
    ecosystemHealth: string;
    partners: SEAM_Partner[];
    gaps: string[];
}
export interface SymbioticPartner {
    entityName: string;
    location: string;
    entityType: string;
    symbiosisScore: number;
    asymmetryAnalysis: string;
    mutualBenefit: string;
    riskFactors: string[];
}
export interface SPI_BreakdownItem {
    label: string;
    value: number;
}
export interface SPIResult {
    spi: number;
    ciLow: number;
    ciHigh: number;
    breakdown: SPI_BreakdownItem[];
    dataSources?: string[];
    historicalContext?: {
        era: string;
        region: string;
        outcome: string;
        lesson: string;
    }[];
}
export type EthicsStatus = 'PASS' | 'CAUTION' | 'BLOCK';
export interface EthicsFlag {
    name: string;
    flag: 'BLOCK' | 'CAUTION';
    reason: string;
    evidence: string[];
}
export interface MitigationStep {
    step: string;
    detail: string;
}
export interface EthicalCheckResult {
    passed: boolean;
    score: number;
    overallFlag: EthicsStatus;
    flags: EthicsFlag[];
    mitigation: MitigationStep[];
    timestamp: string;
    version: string;
}
export interface CaseOutcome {
    result: 'success' | 'failure' | 'mixed';
    roiAchieved?: number;
    jobsCreated?: number;
    timeToMarket?: string;
    keyLearnings: string[];
}
export interface HistoricalCase {
    id: string;
    title: string;
    entity: string;
    sector: string;
    country: string;
    year: number;
    strategy: string;
    investmentSizeMillionUSD: number;
    outcomes: CaseOutcome;
}
export interface CaseSimilarity {
    overall: number;
    sectorMatch: number;
    regionMatch: number;
    strategyMatch: number;
}
export interface PrecedentMatch {
    historicalCase: HistoricalCase;
    similarity: CaseSimilarity;
    probabilityOfSuccess: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    applicableFactors: {
        successFactors: string[];
        warnings: string[];
        timingConsiderations: string[];
        investmentProfile: string;
    };
    timeToMaturity?: number;
}
export type GenerationPhase = 'idle' | 'intake' | 'orchestration' | 'modeling' | 'synthesis' | 'complete';
export interface ReportSection {
    id: string;
    title: string;
    content: string;
    status: 'pending' | 'generating' | 'completed';
}
export interface ReportData {
    executiveSummary: ReportSection;
    marketAnalysis: ReportSection;
    recommendations: ReportSection;
    implementation: ReportSection;
    financials: ReportSection;
    risks: ReportSection;
    confidenceScores?: {
        overall?: number;
        economicReadiness?: number;
        symbioticFit?: number;
        politicalStability?: number;
        partnerReliability?: number;
        ethicalAlignment?: number;
        activationVelocity?: number;
        transparency?: number;
    };
    computedIntelligence?: {
        spi?: SPIResult;
        rroi?: RROI_Index;
        seam?: SEAM_Blueprint;
        symbioticPartners?: SymbioticPartner[];
        diversificationAnalysis?: DiversificationAnalysis;
        ethicsCheck?: EthicalCheckResult;
        ivas?: IVASResult;
        scf?: SCFResult;
        intakeMapping?: IntakeMappingSnapshot;
        provenance?: ProvenanceTag[];
        pri?: PRIResult;
        tco?: TCOResult;
        cri?: CRIResult;
        advancedIndices?: AdvancedIndexResults;
        adversarialShield?: AdversarialShieldResult;
        personaPanel?: PersonaPanelResult;
        motivationAnalysis?: MotivationAnalysis;
        counterfactuals?: CounterfactualLabResult;
        outcomeLearning?: OutcomeLearningSnapshot;
        adversarialConfidence?: AdversarialConfidenceResult;
        agenticBrain?: AgenticBrainSnapshot;
        frontierIntelligence?: FrontierIntelligenceResult;
        codebaseAudit?: {
            totalFiles: number;
            filesReviewed: number;
            matchedFiles: number;
            coveragePct: number;
            verdict: 'pass' | 'partial' | 'review';
            findings: string[];
            evidence: Array<{ filePath: string; relevanceScore: number; matchedInContext: boolean; basis: string }>;
        };
        externalSearchSignals?: Array<{ query: string; results: Array<{ title: string; snippet: string; url: string; source: string; publishedAt?: string }>; source: string; status: 'ok' | 'failed'; error?: string }>;
    };
}
export interface ReportPayload {
    metadata: {
        requesterType: string;
        country: string;
        region: string;
        timestamp: string;
        reportId: string;
        dataSources?: string[];
    };
    problemDefinition: {
        statedProblem: string;
        constraints: string[];
        urgency: string;
    };
    regionalProfile: {
        demographics: {
            population: number;
            gdpPerCapita: number;
            laborCosts: number;
        };
        infrastructure: {
            transportation: number;
            digital: number;
            utilities: number;
        };
        logistics: {
            regionalConnectivity: number;
            exportPotential: number;
        };
    };
    economicSignals: {
        tradeExposure: number;
        tariffSensitivity: number;
        costAdvantages: string[];
        bottleneckReliefPotential: number;
    };
    opportunityMatches: {
        sectors: string[];
        partnerTypes: string[];
        riskAdjustedROI: number;
    };
    risks: {
        political: {
            stabilityScore: number;
            regionalConflictRisk: number;
        };
        regulatory: {
            corruptionIndex: number;
            regulatoryFriction: number;
            complianceRoadmap: string[];
        };
        operational: {
            supplyChainDependency: number;
            currencyRisk: string;
        };
    };
    recommendations: {
        shortTerm: string[];
        midTerm: string[];
        longTerm: string[];
    };
    confidenceScores: {
        overall: number;
        economicReadiness: number;
        symbioticFit: number;
        politicalStability: number;
        partnerReliability: number;
        ethicalAlignment: number;
        activationVelocity: number;
        transparency: number;
    };
    computedIntelligence: {
        spi: SPIResult;
        rroi: RROI_Index;
        seam: SEAM_Blueprint;
        symbioticPartners: SymbioticPartner[];
        diversificationAnalysis: DiversificationAnalysis;
        ethicsCheck: EthicalCheckResult;
        ivas: IVASResult;
        scf: SCFResult;
        intakeMapping: IntakeMappingSnapshot;
        pri: PRIResult;
        tco: TCOResult;
        cri: CRIResult;
        advancedIndices?: AdvancedIndexResults;
        adversarialShield?: AdversarialShieldResult;
        personaPanel?: PersonaPanelResult;
        motivationAnalysis?: MotivationAnalysis;
        counterfactuals?: CounterfactualLabResult;
        outcomeLearning?: OutcomeLearningSnapshot;
        adversarialConfidence?: AdversarialConfidenceResult;
        agenticBrain?: AgenticBrainSnapshot;
        frontierIntelligence?: FrontierIntelligenceResult;
    };
}
export interface CopilotInsight {
    id?: string;
    type: 'risk' | 'opportunity' | 'strategy' | 'insight' | 'warning' | 'question';
    title: string;
    description?: string;
    content?: string;
    confidence?: number;
    isAutonomous?: boolean;
}
export interface LiveOpportunityItem {
    project_name: string;
    country: string;
    sector: string;
    value: string;
    summary: string;
    source_url: string;
    isUserAdded?: boolean;
    ai_feasibility_score?: number;
    ai_risk_assessment?: string;
}
export interface MatchCandidate {
    location: GlobalCityData;
    matchScore: number;
    matchReasons: string[];
    improvementAreas: string[];
    transitionChallenges: string[];
}
export interface RelocationStrategy {
    timeline: string;
    resourceRequirements: string[];
    riskMitigation: string[];
    successProbability: number;
}
export interface AlternativeLocationMatch {
    originalLocation: GlobalCityData;
    matchedLocations: MatchCandidate[];
    relocationStrategy: RelocationStrategy;
}
export interface DeepReasoningAnalysis {
    verdict: 'Strong Buy' | 'Consider' | 'Hard Pass';
    dealKillers: string[];
    hiddenGems: string[];
    reasoningChain: string[];
    counterIntuitiveInsight: string;
}
export interface GenerativeModel {
    modelName: string;
    summary: string;
    description?: string;
    corePrinciples: {
        principle: string;
        rationale: string;
    }[];
}
export interface GeopoliticalAnalysisResult {
    stabilityScore: number;
    currencyRisk: string;
    inflationTrend: string;
    forecast: string;
    regionalConflictRisk: number;
    tradeBarriers: string[];
}
export interface GovernanceAuditResult {
    governanceScore: number;
    corruptionRisk: string;
    regulatoryFriction: number;
    transparencyIndex: number;
    redFlags: string[];
    complianceRoadmap: string[];
}
export interface ModuleScore {
    totalScore: number;
    complexityLevel: number;
    implementationTimeline: number;
}
export interface ComplexityScore {
    totalScore: number;
    technicalComplexity: number;
    regulatoryCompliance: number;
}
export interface CanvasModule {
    id: string;
    title: string;
    icon: React.ComponentType<unknown>;
    component: React.ComponentType<unknown>;
    status: 'active' | 'inactive' | 'completed' | 'locked';
    phase: string;
}
export interface TemporalAnalysis {
    regionProfile: {
        country: string;
        region: string;
    };
    analysisYear: number;
    currentPhase: {
        overall: 'nascent' | 'emerging' | 'developing' | 'mature' | 'post_mature';
        bySector: Record<string, string>;
        confidenceScore: number;
    };
    progression: {
        currentPhase: 'nascent' | 'emerging' | 'developing' | 'mature' | 'post_mature';
        yearsInPhase: number;
        estimatedYearsToNextPhase: number;
        historicalPaceMonths: number;
        accelerators: string[];
        decelerators: string[];
        trajectoryRisk: 'accelerating' | 'on_track' | 'slowing' | 'at_risk';
    };
    historicalComparables: {
        region: string;
        year: number;
        phaseAtThatTime: string;
        whatHappenedNext: string;
        investments: string[];
        outcomeQuality: 'success' | 'failure' | 'mixed';
    }[];
    trajectoryRisk: 'accelerating' | 'on_track' | 'slowing' | 'at_risk';
}
export interface ToolDefinition {
    id: string;
    icon: ElementType;
    label: string;
    description: string;
}
export declare const toolCategories: Record<string, ToolDefinition[]>;
export interface IntakeIdentity {
    entityName: string;
    legalStructure?: string;
    registrationCountry?: string;
    registrationCity?: string;
    headquartersAddress?: string;
    website?: string;
    industryClassification?: string;
    yearsOperating?: number;
}
export interface IntakeMission {
    missionStatement?: string;
    strategicIntent: string[];
    objectives: string[];
    timelineHorizon?: '0-6m' | '6-18m' | '18-36m' | '36m+';
}
export interface IntakeCounterparty {
    name: string;
    type?: string;
    country?: string;
    city?: string;
    relationshipStage?: 'none' | 'intro' | 'pilot' | 'contract';
}
export interface IntakeConstraints {
    budgetUSD?: number;
    capitalMix?: {
        debt?: number;
        equity?: number;
        grant?: number;
    };
    riskTolerance?: 'low' | 'medium' | 'high';
    complianceNotes?: string[];
}
export interface IntakeProof {
    documents?: Array<{
        name: string;
        url?: string;
        type?: string;
    }>;
    references?: Array<{
        name: string;
        role?: string;
        contact?: string;
    }>;
}
export interface IntakeContacts {
    primary?: {
        name: string;
        email: string;
        phone?: string;
    };
    secondary?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    governmentLiaison?: {
        name?: string;
        email?: string;
        phone?: string;
    };
}
export interface SPIInput {
    riskTolerance: 'low' | 'medium' | 'high';
    partnerCount: number;
    hasGovernmentLiaison: boolean;
}
export interface IVASInput {
    activationFrictionSeed: number;
    opportunityQuantumSeed: number;
}
export interface SCFInput {
    baseDealValueUSD: number;
}
export interface RefinedIntake {
    identity: IntakeIdentity;
    mission: IntakeMission;
    counterparties: IntakeCounterparty[];
    constraints?: IntakeConstraints;
    proof?: IntakeProof;
    contacts?: IntakeContacts;
}
export interface IntakeMappingSnapshot {
    refinedIntake: RefinedIntake;
    spiInput: SPIInput;
    ivasInput: IVASInput;
    scfInput: SCFInput;
}
