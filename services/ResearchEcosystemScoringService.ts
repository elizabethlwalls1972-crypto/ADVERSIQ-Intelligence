import { getVDemProfile } from './vdemGovernanceService';

export interface ResearchEcosystemInputs {
  country?: string;
  readiness?: number;
  gdp?: number;
  gdpGrowth?: number;
  costOfLiving?: number;
  rankedPartnerCount?: number;
  compliancePresent?: boolean;
  gateReady?: boolean;

  // Optional explicit policy/market inputs (preferred when available)
  researchSpendPctGDP?: number;
  phdGraduatesPer100k?: number;
  scientistCompRatioToMinWage?: number;
  computeCapacityIndex?: number;
  talentMobilityIndex?: number;
  startupCapitalIndex?: number;
  scaleCapitalIndex?: number;
  patentToStartupConversion?: number;
  industryAbsorptionIndex?: number;
  policyExecutionIndex?: number;
  marketAccessIndex?: number;
}

export interface ResearchEcosystemAssessment {
  talentAttractivenessIndex: number;
  innovationConversionIndex: number;
  ecosystemReadinessScore: number;
  confidence: number;
  subScores: {
    phdPipeline: number;
    researchFunding: number;
    governanceForScience: number;
    talentMobility: number;
    compensationCompetitiveness: number;
    infrastructureAndCompute: number;
    translationCapacity: number;
    startupCapital: number;
    scaleCapital: number;
    industryAbsorption: number;
    policyExecution: number;
    marketAccess: number;
  };
  formulas: {
    tai: string;
    ici: string;
    ers: string;
  };
  interpretation: string;
}

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

function governanceScienceScore(country?: string): number {
  if (!country) return 45;
  const profile = getVDemProfile(country);
  if (!profile) return 45;
  const avg = [
    profile.liberalDemocracy,
    profile.ruleOfLaw,
    profile.freedomOfExpression,
    profile.corruptionControl,
    profile.accountability,
  ].filter((v): v is number => typeof v === 'number');
  if (!avg.length) return 45;
  return clamp((avg.reduce((a, b) => a + b, 0) / avg.length) * 100);
}

function confidenceFromCoverage(inputs: ResearchEcosystemInputs): number {
  const fields: Array<keyof ResearchEcosystemInputs> = [
    'researchSpendPctGDP',
    'phdGraduatesPer100k',
    'scientistCompRatioToMinWage',
    'computeCapacityIndex',
    'talentMobilityIndex',
    'startupCapitalIndex',
    'scaleCapitalIndex',
    'patentToStartupConversion',
    'industryAbsorptionIndex',
    'policyExecutionIndex',
    'marketAccessIndex',
    'gdp',
    'gdpGrowth',
    'rankedPartnerCount',
  ];
  const present = fields.filter((key) => inputs[key] !== undefined && inputs[key] !== null).length;
  return clamp(Math.round((present / fields.length) * 100));
}

export class ResearchEcosystemScoringService {
  static assess(inputs: ResearchEcosystemInputs): ResearchEcosystemAssessment {
    const readiness = clamp(inputs.readiness ?? 45);
    const governanceForScience = governanceScienceScore(inputs.country);

    const phdPipeline = clamp(
      inputs.phdGraduatesPer100k !== undefined
        ? inputs.phdGraduatesPer100k / 1.6
        : (readiness * 0.55 + governanceForScience * 0.45)
    );

    const researchFunding = clamp(
      inputs.researchSpendPctGDP !== undefined
        ? inputs.researchSpendPctGDP * 20
        : (inputs.gdpGrowth !== undefined ? 45 + (inputs.gdpGrowth * 6) : 48)
    );

    const talentMobility = clamp(
      inputs.talentMobilityIndex !== undefined
        ? inputs.talentMobilityIndex
        : (governanceForScience * 0.65 + readiness * 0.35)
    );

    const compensationCompetitiveness = clamp(
      inputs.scientistCompRatioToMinWage !== undefined
        ? inputs.scientistCompRatioToMinWage * 25
        : (inputs.costOfLiving !== undefined ? 70 - (inputs.costOfLiving * 0.35) : 50)
    );

    const infrastructureAndCompute = clamp(
      inputs.computeCapacityIndex !== undefined
        ? inputs.computeCapacityIndex
        : (readiness * 0.6 + (inputs.compliancePresent ? 12 : 0) + (inputs.gdp ? 12 : 0))
    );

    // TAI formula: weighted 6-factor model
    const talentAttractivenessIndex = clamp(
      phdPipeline * 0.20 +
      researchFunding * 0.20 +
      governanceForScience * 0.15 +
      talentMobility * 0.15 +
      compensationCompetitiveness * 0.15 +
      infrastructureAndCompute * 0.15
    );

    const translationCapacity = clamp(
      inputs.patentToStartupConversion !== undefined
        ? inputs.patentToStartupConversion
        : (readiness * 0.45 + Math.min(30, (inputs.rankedPartnerCount ?? 0) * 6))
    );

    const startupCapital = clamp(
      inputs.startupCapitalIndex !== undefined
        ? inputs.startupCapitalIndex
        : (inputs.gdpGrowth !== undefined ? 40 + (inputs.gdpGrowth * 7) : 50)
    );

    const scaleCapital = clamp(
      inputs.scaleCapitalIndex !== undefined
        ? inputs.scaleCapitalIndex
        : (inputs.gdp ? 58 : 44) + (inputs.gdpGrowth !== undefined ? inputs.gdpGrowth * 4 : 0)
    );

    const industryAbsorption = clamp(
      inputs.industryAbsorptionIndex !== undefined
        ? inputs.industryAbsorptionIndex
        : (governanceForScience * 0.35 + readiness * 0.45 + Math.min(20, (inputs.rankedPartnerCount ?? 0) * 4))
    );

    const policyExecution = clamp(
      inputs.policyExecutionIndex !== undefined
        ? inputs.policyExecutionIndex
        : ((inputs.gateReady ? 75 : 45) + (inputs.compliancePresent ? 10 : -5))
    );

    const marketAccess = clamp(
      inputs.marketAccessIndex !== undefined
        ? inputs.marketAccessIndex
        : (inputs.gdp !== undefined ? 62 : 46)
    );

    // ICI formula: weighted 6-factor model
    const innovationConversionIndex = clamp(
      translationCapacity * 0.25 +
      startupCapital * 0.20 +
      scaleCapital * 0.20 +
      industryAbsorption * 0.15 +
      policyExecution * 0.10 +
      marketAccess * 0.10
    );

    const ecosystemReadinessScore = clamp(talentAttractivenessIndex * 0.55 + innovationConversionIndex * 0.45);
    const confidence = confidenceFromCoverage(inputs);

    const interpretation = ecosystemReadinessScore >= 75
      ? 'Strong regional research-to-investment ecosystem. Prioritize scale pathways and talent anchoring.'
      : ecosystemReadinessScore >= 55
        ? 'Developing ecosystem with visible upside. Focus on funding velocity, talent attraction, and translation bottlenecks.'
        : 'Foundational gaps remain. Prioritize research capacity, incentives, and execution infrastructure before scaling.';

    return {
      talentAttractivenessIndex: Math.round(talentAttractivenessIndex),
      innovationConversionIndex: Math.round(innovationConversionIndex),
      ecosystemReadinessScore: Math.round(ecosystemReadinessScore),
      confidence,
      subScores: {
        phdPipeline: Math.round(phdPipeline),
        researchFunding: Math.round(researchFunding),
        governanceForScience: Math.round(governanceForScience),
        talentMobility: Math.round(talentMobility),
        compensationCompetitiveness: Math.round(compensationCompetitiveness),
        infrastructureAndCompute: Math.round(infrastructureAndCompute),
        translationCapacity: Math.round(translationCapacity),
        startupCapital: Math.round(startupCapital),
        scaleCapital: Math.round(scaleCapital),
        industryAbsorption: Math.round(industryAbsorption),
        policyExecution: Math.round(policyExecution),
        marketAccess: Math.round(marketAccess),
      },
      formulas: {
        tai: 'TAI = 0.20*PhD + 0.20*Funding + 0.15*Governance + 0.15*Mobility + 0.15*Compensation + 0.15*Infrastructure',
        ici: 'ICI = 0.25*Translation + 0.20*StartupCapital + 0.20*ScaleCapital + 0.15*IndustryAbsorption + 0.10*PolicyExecution + 0.10*MarketAccess',
        ers: 'ERS = 0.55*TAI + 0.45*ICI',
      },
      interpretation,
    };
  }

  static formatForPrompt(assessment: ResearchEcosystemAssessment): string {
    const lines = [
      '### ── RESEARCH ECOSYSTEM READINESS ──',
      `**TAI (Talent Attractiveness):** ${assessment.talentAttractivenessIndex}/100  |  **ICI (Innovation Conversion):** ${assessment.innovationConversionIndex}/100  |  **ERS:** ${assessment.ecosystemReadinessScore}/100`,
      `**Model Confidence:** ${assessment.confidence}/100`,
      `**Interpretation:** ${assessment.interpretation}`,
      '**Formula Stack:**',
      `- ${assessment.formulas.tai}`,
      `- ${assessment.formulas.ici}`,
      `- ${assessment.formulas.ers}`,
    ];
    return lines.join('\n');
  }
}

export default ResearchEcosystemScoringService;