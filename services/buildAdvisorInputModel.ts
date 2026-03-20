import { ReportParameters } from '../types';
import { AdvisorInputModel } from './ComprehensiveSystemModel';

const STRUCTURE_MAP: Record<string, AdvisorInputModel['mandate']['governance']['preferredStructure']> = {
  'joint-venture': 'jv',
  'joint venture': 'jv',
  'jv': 'jv',
  alliance: 'alliance',
  partnership: 'alliance',
  acquisition: 'equity',
  equity: 'equity',
  licensing: 'license',
  distribution: 'distribution',
  reseller: 'distribution',
};

const normalizeStructure = (mode?: string) => {
  if (!mode) return undefined;
  const key = mode.toLowerCase();
  return STRUCTURE_MAP[key];
};

const deriveAlignmentScore = (params: ReportParameters): number => {
  const alignmentSignals =
    (params.partnerFitCriteria?.length ?? 0) +
    (params.relationshipGoals?.length ?? 0) +
    (params.stakeholderAlignment?.length ?? 0);

  let score = 5 + alignmentSignals;
  if (params.riskTolerance === 'high') score += 1;
  if (params.riskTolerance === 'low') score -= 1;

  return Math.min(10, Math.max(2, score));
};

const deriveMarketGrowthRate = (params: ReportParameters): number => {
  const marketPotential = params.opportunityScore?.marketPotential;
  if (typeof marketPotential === 'number') {
    return Math.min(40, Math.max(5, Math.round(marketPotential / 2)));
  }

  const numericTimeline = parseInt(params.expansionTimeline || '', 10);
  if (!Number.isNaN(numericTimeline) && numericTimeline > 0) {
    return Math.min(35, Math.max(6, Math.round((36 / numericTimeline) * 5)));
  }

  if (params.matchCount && params.matchCount > 0) {
    return Math.min(30, 12 + params.matchCount * 2);
  }

  return 12;
};

/**
 * Build placeholder risk entries when the user hasn't supplied explicit risks.
 * Each entry is tagged as synthetic so downstream consumers (e.g. GlobalIntelligenceEngine)
 * can distinguish fabricated placeholders from real risk-register data.
 */
const buildPlaceholderRisks = (params: ReportParameters) => {
  const sensitivitySignals = (params.politicalSensitivities?.length ?? 0) + (params.priorityThemes?.length ?? 0);
  const base = params.riskTolerance === 'high' ? 2 : params.riskTolerance === 'low' ? 4 : 3;
  const riskCount = Math.max(1, Math.min(6, sensitivitySignals || base));
  return Array.from({ length: riskCount }, (_, idx) => ({ id: `placeholder-risk-${idx}`, synthetic: true }));
};

export const buildAdvisorInputFromParams = (params: ReportParameters): AdvisorInputModel => {
  const industry = params.industryClassification || params.industry?.[0] || params.customIndustry || 'General Market';
  const region = params.region || params.country || params.userCountry || 'Global';
  const partnerGeo = params.targetPartner || params.partnerPersonas?.[0] || region;

  return {
    identity: {
      organization: {
        legalName: params.organizationName || params.reportName || 'Your Program',
        industryClassification: industry,
        headquarters: {
          country: params.country || params.userCountry,
          city: params.userCity,
        },
      },
    },
    market: {
      targetRegion: region,
      targetCountry: params.country || params.userCountry,
      marketGrowthRate: deriveMarketGrowthRate(params),
    },
    mandate: {
      targetPartner: {
        industry: params.targetPartner || params.partnerPersonas?.[0] || industry,
        geography: partnerGeo,
      },
      governance: {
        preferredStructure: normalizeStructure(params.strategicMode),
      },
    },
    partners: {
      strategicAlignment: {
        score: deriveAlignmentScore(params),
      },
    },
    risks: {
      risks: buildPlaceholderRisks(params),
    },
  };
};

