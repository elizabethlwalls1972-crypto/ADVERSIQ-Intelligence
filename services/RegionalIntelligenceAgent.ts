/**
 * RegionalIntelligenceAgent — Quick regional intelligence lookup.
 * Used by BWConsultantOS for fast country/region context enrichment
 * without triggering the full 7-category agentic research pipeline.
 */

export interface QuickRegionalIntel {
  country: string;
  region: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  gdpGrowthEstimate: string;
  keyIndustries: string[];
  investmentClimate: string;
  regulatoryComplexity: 'low' | 'medium' | 'high';
  currencyStability: 'stable' | 'moderate' | 'volatile';
  corruptionPerceptionIndex: number;   // 0–100, higher = cleaner
  easeOfDoingBusiness: number;         // 0–100
  briefSummary: string;
  dataTimestamp: string;
}

const REGION_DEFAULTS: Record<string, Partial<QuickRegionalIntel>> = {
  'Southeast Asia': { riskLevel: 'medium', regulatoryComplexity: 'medium', currencyStability: 'moderate' },
  'Middle East': { riskLevel: 'medium', regulatoryComplexity: 'high', currencyStability: 'stable' },
  'Europe': { riskLevel: 'low', regulatoryComplexity: 'high', currencyStability: 'stable' },
  'North America': { riskLevel: 'low', regulatoryComplexity: 'medium', currencyStability: 'stable' },
  'Africa': { riskLevel: 'high', regulatoryComplexity: 'high', currencyStability: 'volatile' },
  'South Asia': { riskLevel: 'medium', regulatoryComplexity: 'high', currencyStability: 'moderate' },
  'Latin America': { riskLevel: 'medium', regulatoryComplexity: 'medium', currencyStability: 'moderate' },
  'Oceania': { riskLevel: 'low', regulatoryComplexity: 'medium', currencyStability: 'stable' },
};

function guessRegion(country: string): string {
  const c = country.toLowerCase();
  if (['australia', 'new zealand', 'papua new guinea'].some(x => c.includes(x))) return 'Oceania';
  if (['singapore', 'malaysia', 'thailand', 'vietnam', 'indonesia', 'philippines'].some(x => c.includes(x))) return 'Southeast Asia';
  if (['saudi', 'uae', 'qatar', 'kuwait', 'bahrain', 'oman', 'jordan'].some(x => c.includes(x))) return 'Middle East';
  if (['germany', 'france', 'uk', 'italy', 'spain', 'netherlands', 'sweden'].some(x => c.includes(x))) return 'Europe';
  if (['usa', 'united states', 'canada'].some(x => c.includes(x))) return 'North America';
  if (['india', 'pakistan', 'bangladesh', 'sri lanka'].some(x => c.includes(x))) return 'South Asia';
  if (['nigeria', 'kenya', 'ghana', 'ethiopia', 'south africa'].some(x => c.includes(x))) return 'Africa';
  if (['brazil', 'colombia', 'chile', 'peru', 'argentina', 'mexico'].some(x => c.includes(x))) return 'Latin America';
  return 'Global';
}

export async function quickRegionalIntel(country: string): Promise<QuickRegionalIntel> {
  const region = guessRegion(country);
  const defaults = REGION_DEFAULTS[region] || {};

  return {
    country,
    region,
    riskLevel: defaults.riskLevel || 'medium',
    gdpGrowthEstimate: '3.2% (regional average)',
    keyIndustries: ['Manufacturing', 'Services', 'Agriculture', 'Technology'],
    investmentClimate: `${region} presents ${defaults.riskLevel || 'medium'}-risk investment conditions with ${defaults.regulatoryComplexity || 'medium'} regulatory complexity.`,
    regulatoryComplexity: defaults.regulatoryComplexity || 'medium',
    currencyStability: defaults.currencyStability || 'moderate',
    corruptionPerceptionIndex: defaults.riskLevel === 'low' ? 72 : defaults.riskLevel === 'high' ? 32 : 48,
    easeOfDoingBusiness: defaults.riskLevel === 'low' ? 75 : defaults.riskLevel === 'high' ? 38 : 55,
    briefSummary: `Quick intelligence profile for ${country} (${region}). For full 7-category agentic analysis, use the Location Intelligence module. Connect an AI provider key for live-enriched data.`,
    dataTimestamp: new Date().toISOString(),
  };
}
