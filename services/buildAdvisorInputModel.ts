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

const buildDerivedRiskSignals = (params: ReportParameters) => {
  const sensitivitySignals = (params.politicalSensitivities?.length ?? 0) + (params.priorityThemes?.length ?? 0);
  const base = params.riskTolerance === 'high' ? 2 : params.riskTolerance === 'low' ? 4 : 3;
  const riskCount = Math.max(1, Math.min(6, sensitivitySignals || base));
  const sourceSignals = [
    ...(params.politicalSensitivities ?? []),
    ...(params.priorityThemes ?? []),
    params.riskTolerance ? `${params.riskTolerance} risk tolerance` : undefined,
    params.country ? `${params.country} jurisdiction exposure` : undefined,
    params.expansionTimeline ? `${params.expansionTimeline} delivery timeline` : undefined,
  ].filter(Boolean) as string[];

  return Array.from({ length: riskCount }, (_, idx) => ({
    id: `derived-risk-${idx + 1}`,
    sourceSignal: sourceSignals[idx % Math.max(1, sourceSignals.length)] || 'limited intake evidence',
    derived: true,
  }));
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
      risks: buildDerivedRiskSignals(params),
    },
  };
};

