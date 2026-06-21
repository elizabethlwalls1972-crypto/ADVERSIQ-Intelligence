import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ReportParameters, ReportPayload } from '../types';
import { DecisionPipeline } from '../services/DecisionPipeline';

const RUN_ID = 'NSIL-GEN-1228A';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'data', 'liveRuns');

(async () => {
  console.log(`\n🚀 Running General Santos scenario (${RUN_ID})...`);
  const params = buildScenarioParams();
  const { packet, payload } = await DecisionPipeline.run(params);
  if (!payload) {
    console.error('Pipeline blocked. Blockers:', packet.exports.blockers);
    return;
  }

  const summary = buildSummary(payload, params);

  await mkdir(OUTPUT_DIR, { recursive: true });
  const payloadPath = path.join(OUTPUT_DIR, `${RUN_ID}.payload.json`);
  const summaryPath = path.join(OUTPUT_DIR, `${RUN_ID}.summary.json`);
  const packetPath = path.join(OUTPUT_DIR, `${RUN_ID}.packet.json`);

  await writeFile(payloadPath, JSON.stringify(payload, null, 2), 'utf8');
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  await writeFile(packetPath, JSON.stringify(packet, null, 2), 'utf8');

  console.log('✅ Live run payload saved to:', payloadPath);
  console.log('✅ Summary saved to:', summaryPath);
  console.log('✅ Decision packet saved to:', packetPath);
  console.log('Done.');
})().catch(error => {
  console.error('Failed to run General Santos scenario:', error);
  process.exitCode = 1;
});

function buildScenarioParams(): ReportParameters {
  const now = new Date().toISOString();
  return {
    reportName: 'General Santos Cold-Chain Intelligence Run',
    userName: 'BWGA Agentic Brain',
    userDepartment: 'Intelligence Lab',
    skillLevel: 'expert',
    userCountry: 'Philippines',
    userCity: 'General Santos',
    userTier: 'enterprise',
    entityClassification: 'Consortium',
    parentAgency: 'BW Global Advisory',
    operatingUnit: 'BWGA AI',
    missionRequestSummary: 'Unlock probity-assured cold-chain hub for Mindanao exports.',
    assistanceBackground: 'Scenario test capturing El Nino and customs enforcement dynamics.',
    intakeGuidanceMode: 'expert',
    ingestedDocuments: [],

    organizationName: 'Japanese Cold-Chain & Export Logistics JV',
    organizationType: 'Private Consortium',
    organizationSubType: 'Cold-Chain Infrastructure',
    organizationAddress: 'General Santos, Philippines',
    organizationWebsite: 'https://example-bwga.com',
    revenueBand: '>$50M',
    headcountBand: '500-1000',
    yearsOperation: '10+',
    decisionAuthority: 'Investment Committee',
    industryClassification: 'Logistics',
    organizationSize: 'Large',
    contactEmail: 'intel-lab@bwga.ai',
    contactPhone: '+63 82 555 0100',
    linkedinProfile: '',
    twitterHandle: '',
    organizationDescription: 'Consortium deploying cold-chain and export logistics capabilities across Philippine growth corridors.',
    secondaryContactEmail: '',
    secondaryContactPhone: '',
    exactEmployeeCount: '950',
    annualRevenue: '120000000',

    customOrganizationType: '',
    customOrganizationSubType: '',
    customYearsOperation: '',
    customDecisionAuthority: '',
    customOrganizationSize: '',
    region: 'Southeast Asia',
    country: 'Philippines',
    industry: ['Logistics', 'Cold Chain', 'Agribusiness'],
    nicheAreas: ['Export logistics', 'Food security'],
    customIndustry: '',
    tier: ['Regional'],

    strategicIntent: ['Cold-Chain Hub Build'],
    intentScope: ['Portside infrastructure', 'Reefer trucking'],
    developmentOutcomes: ['Jobs', 'Export resilience'],
    visionStatement: 'Probity-assured Mindanao cold-chain backbone.',
    missionStatement: 'Stabilize agribusiness exports with integrity-first logistics.',
    strategicMode: 'Expansion',
    problemStatement: 'Need to de-risk portside cold-chain hub amid smuggling interference and El Nino supply volatility.',
    idealPartnerProfile: 'DOTr Regional Ops, LGU, trustee bank, customs modernization office.',
    targetPartner: 'Department of Transportation (DOTr)',
    analysisTimeframe: '12 Months',
    strategicObjectives: ['Unlock $45M capex', 'Reduce anomaly rate <0.5%', 'Compress permit latency'],
    strategicLens: ['Resilience', 'Integrity', 'Growth'],
    priorityThemes: ['Climate adaptation', 'Food security', 'Regional corridors'],
    targetCounterpartType: ['Government', 'Development Finance'],
    successMetrics: ['Permit latency', 'Anomaly rate', 'Export throughput'],
    specificOpportunity: 'General Santos cold-chain hub',
    targetIncentives: ['Tax holidays', 'Green lane permits'],
    partnerPersonas: ['Regulator', 'Investor', 'Operator'],
    stakeholderAlignment: ['Cabinet Cluster on Food Security'],
    stakeholderConcerns: 'Smuggling interference, customs delays.',
    alignmentPlan: 'Weekly telemetry briefs + DOTr dashboard.',
    executiveSponsor: 'Mindanao Regional Team',
    partnerReadinessLevel: 'Moderate',
    partnerFitCriteria: ['Probity', 'Telemetry maturity'],
    relationshipGoals: ['Signed LOI', 'Pilot shipping lane'],
    partnerEngagementNotes: 'Requires trustee oversight and digital seals.',
    governanceModels: ['Integrity Pact', 'Independent trustee'],
    riskPrimaryConcerns: 'Procurement capture, customs delay.',
    riskAppetiteStatement: 'Medium risk tolerance with provable mitigations.',

    relationshipStage: 'Exploration',
    dueDiligenceDepth: 'Preliminary',
    partnerCapabilities: ['Port operations', 'Compliance monitoring', 'Escrow trustee'],
    operationalPriority: 'Resilience',
    riskTolerance: 'medium',
    expansionTimeline: '0-6 Months',
    milestonePlan: 'Pilot telemetry → Trustee escrow → Scale deployment',
    currency: 'USD',
    fxAssumption: '54 PHP/USD',
    partnershipSupportNeeds: ['Strategy blueprint', 'Governance framework', 'Evidence packs'],
    fundingSource: 'Blended finance',
    procurementMode: 'Competitive',
    totalInvestment: '45000000',
    capitalAllocation: 'Portside storage 50%, Reefer fleet 25%, HACCP processing 25%',
    cashFlowTiming: 'Quarterly',
    revenueStreams: 'Cold storage, reefer trucking, HACCP processing',
    revenueYear1: '12000000',
    revenueYear3: '28000000',
    revenueYear5: '42000000',
    unitEconomics: 'Per container gross margin 18%',
    cogsYear1: '7200000',
    opexYear1: '5400000',
    costBreakdown: 'Energy 30%, labor 25%, maintenance 20%',
    headcountPlan: 'Phase 1: 180; Phase 2: 320',
    ebitdaMarginYear1: '12%',
    breakEvenYear: 'Year 3',
    targetExitMultiple: '8x EBITDA',
    expectedIrr: '15%',
    paybackPeriod: '4 years',
    npv: '18000000',
    downsideCase: 'Permit delays push IRR to 9%',
    baseCase: 'IRR 15%',
    upsideCase: 'IRR 19% with export incentives',
    sensitivityDrivers: 'Permit latency, anomaly rate, FX',
    financialStages: [],
    financialScenarios: [],
    politicalSensitivities: ['Port integrity sweeps', 'LGU leadership changes'],
    dealSize: '45000000',
    customDealSize: '',
    riskRegister: [],
    riskMitigationSummary: 'Trustee + telemetry + evidence escrow',
    contingencyPlans: 'Modular deployment, diversified sourcing',
    contingencyBudget: '2500000',
    riskKriNotes: 'Anomaly alerts, permit SLA',
    riskReportingCadence: 'Weekly',
    riskOwners: ['Trustee', 'Compliance Office'],
    riskMonitoringProcess: 'Telemetry dashboard + audits',
    riskHorizon: ['Short-term', 'Medium-term'],
    capabilityAssessments: [],
    executiveLead: 'Regional COO',
    cfoLead: 'Finance Director APAC',
    opsLead: 'Mindanao Program Lead',
    teamBenchAssessment: 'Core ops ready; customs liaison pending',
    vendorStack: 'RFID seals, telemetry IoT, trustee ledger',
    complianceEvidence: 'AML/KYC cleared, sanctions screening clean',
    capabilityNotes: 'Need local cold-chain technicians training',
    technologyStack: 'IoT telemetry, BWGA Evidence Locker',
    integrationSystems: 'Customs E2M, DOTr permitting',
    technologyRisks: 'Telemetry tampering',
    capabilityGaps: 'Inspector rotation staffing',
    buildBuyPartnerPlan: 'JV builds, trustee governs, LGU coordinates',

    id: RUN_ID,
    createdAt: now,
    status: 'live-test',
    outcome: undefined,
    outcomeReason: undefined,
    actualReturnMultiplier: undefined,

    selectedAgents: ['NSIL'],
    selectedModels: ['gemini-2.0-pro'],
    selectedModules: ['SPI', 'RROI', 'SEAM', 'Counterfactual'],
    analyticalModules: ['personas', 'counterfactual', 'motivation'],
    aiPersona: ['Skeptic', 'Advocate', 'Regulator', 'Accountant', 'Operator'],
    customAiPersona: '',
    intelligenceCategory: 'Strategic Intelligence',
    activeOpportunity: undefined,

    reportLength: 'Comprehensive',
    reportComplexity: 'standard',
    collaborativeNotes: 'Live orchestration for General Santos scenario.',
    outputFormat: 'full-report',
    letterStyle: 'executive',
    stakeholderPerspectives: ['executive'],
    includeCrossSectorMatches: true,
    matchCount: 5,
    partnerDiscoveryMode: true,
    searchScope: 'regional',
    intentTags: ['general-santos', 'cold-chain', 'live-test'],
    comparativeContext: ['Mindanao'],
    additionalContext: 'El Nino 2023-2024 supply shock; Bureau of Customs integrity sweeps.',
    macroFactors: ['El Nino', 'Food security'],
    regulatoryFactors: ['Customs reforms', 'Food safety'],
    economicFactors: ['Export volatility', 'FX exposure'],
    corridorFocus: 'Mindanao growth corridors',
    opportunityScore: { totalScore: 78, marketPotential: 82, riskFactors: 28 },
    calibration: {
      constraints: {
        budgetCap: '45000000',
        capitalMix: { debt: 35, equity: 45, grant: 20 }
      },
      capabilitiesHave: ['RFID telemetry', 'Trustee partners'],
      capabilitiesNeed: ['Inspector rotation', 'Customs liaison'],
      riskHorizon: ['12 months'],
      operationalChassis: { taxStructure: 'PEZA entity', entityPreference: 'JV' }
    },

    neuroSymbolicState: undefined
  };
}

function buildSummary(payload: ReportPayload, params: ReportParameters) {
  const overallScore = Number((payload.confidenceScores.overall ?? 0).toFixed(0));
  const synergyScore = Number((payload.confidenceScores.symbioticFit ?? 0).toFixed(0));
  const spiScore = Number((payload.computedIntelligence.spi.spi ?? 0).toFixed(2));
  const rroiScore = Number((payload.computedIntelligence.rroi.overallScore ?? 0).toFixed(2));
  const seamAlignment = Number((payload.computedIntelligence.seam.score ?? 0).toFixed(0));
  const supplyChainDependency = payload.risks.operational.supplyChainDependency ?? 0;

  const keyFindings = [
    payload.economicSignals.costAdvantages[0],
    payload.economicSignals.costAdvantages[1],
    `Talent readiness ${payload.economicSignals.costAdvantages[2]}`,
    `Regulatory friction index ${Number(payload.risks.regulatory.regulatoryFriction ?? 0).toFixed(0)}`
  ].filter(Boolean);

  const liveObservations = [
    `Supply-chain dependency index ${supplyChainDependency}% (requires telemetry enforcement).`,
    `Trade exposure score ${payload.economicSignals.tradeExposure}/100 indicates export upside if probity controls hold.`,
    `Tariff sensitivity ${payload.economicSignals.tariffSensitivity}/100; customs fast lanes critical.`,
    `Ethics mitigation tracks ${payload.risks.regulatory.complianceRoadmap.length} actions.`
  ];

  const riskRegister = [
    {
      risk: 'Smuggling interference / procurement capture',
      metric: `Corruption index ${payload.risks.regulatory.corruptionIndex ?? 0}`,
      mitigation: 'Independent trustee, double-blind procurement, sealed workflows'
    },
    {
      risk: 'Permit latency',
      metric: `Regulatory friction ${Number(payload.risks.regulatory.regulatoryFriction ?? 0).toFixed(0)}`,
      mitigation: 'DOTr facilitation + telemetry SLA visibility'
    },
    {
      risk: 'Supply volatility (El Nino)',
      metric: `Cost advantage signal ${payload.economicSignals.costAdvantages[0]}`,
      mitigation: 'Flexible throughput, diversified sourcing, demand smoothing'
    }
  ];

  const roadmap = [
    { phase: 'Pilot', duration: '3m', gate: 'Telemetry + trustee evidence pack' },
    { phase: 'Phase 1', duration: '9m', gate: 'Customs integration + HACCP validation' },
    { phase: 'Phase 2', duration: '12m', gate: 'Export corridor scale + financing close' }
  ];

  const recommendedReports = [
    'Due Diligence Report - Vendors & Inspectors',
    'Policy Brief - Customs Chain-of-Custody Modernization',
    'Feasibility Study - Climate-Adjusted Throughput'
  ];

  const evidencePacket = [
    'NSIL Run Log (persona debates, counterfactuals, formula outputs)',
    'Telemetry Snapshot (RFID seals, anomaly alerts, trustee approvals)',
    'Data Provenance Sheet (DOTr, PSA, DA, DOF, LGU exports)'
  ];

  const nextMoves = [
    'Activate DOTr-trustee live telemetry corridor (Week 1).',
    'Publish sealed evidence pack to LGU + customs (Week 2).',
    'Stage pilot escrow and inspector rotation (Weeks 3-4).'
  ];

  const learningSignals = [
    `Outcome learning signals tracked: ${(payload.computedIntelligence.outcomeLearning?.predictions?.length) ?? 0}.`,
    `Adversarial confidence: ${payload.computedIntelligence.adversarialConfidence?.score ?? 0}%.`
  ];

  return {
    runId: payload.metadata.reportId,
    generatedAt: payload.metadata.timestamp,
    organization: params.organizationName,
    location: `${params.userCity}, ${params.country}`,
    currentEventContext: 'El Nino 2023-2024 supply shocks and Bureau of Customs integrity sweeps necessitate telemetry-backed cold-chain governance in General Santos.',
    dataFeeds: [
      'DOTr port time-stamps (Oct-Dec 2025)',
      'PSA Fisheries Situationer Q3 2025',
      'DA El Nino Advisory #07',
      'DOF trade anomaly alerts',
      'LGU permit queue exports'
    ],
    models: [
      'NSIL multi-persona debate',
      'SPI core engine',
      'RROI capital stress engine',
      'SEAM alignment model',
      'Counterfactual lab (200 trials)'
    ],
    operators: [
      'BWGA Agentic Brain (Melbourne)',
      'Trustee sandbox (Manila)',
      'Customs liaison (Region XII)',
      'Logistics JV control tower (Tokyo)'
    ],
    quote: `Opportunity signal ${payload.economicSignals.bottleneckReliefPotential ?? 0}/100 with infrastructure readiness ${payload.economicSignals.costAdvantages[1]}.`,
    overallScore,
    synergyScore,
    spiScore,
    rroiScore,
    seamAlignment,
    supplyChainDependency,
    keyFindings,
    liveObservations,
    riskRegister,
    roadmap,
    monitoring: {
      kpis: ['Anomaly rate', 'Permit latency', 'Throughput', 'HACCP compliance'],
      evidence: ['Chain-of-custody logs', 'Inspector rotation ledger', 'Trustee approvals', 'Telemetry archive']
    },
    recommendedReports,
    evidencePacket,
    nextMoves,
    learningSignals
  };
}
