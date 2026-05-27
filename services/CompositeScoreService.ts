import { ReportParameters, CompositeScoreResult } from '../types';
import { LiveDataService } from './LiveDataService';

export interface CompositeScoreContext {
  country?: string;
  region?: string;
  industry?: string[];
  strategicIntent?: string[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const safeNumber = (value: number | null | undefined, fallback: number) =>
  Number.isFinite(value ?? NaN) ? (value as number) : fallback;
const scaleValue = (value: number, min: number, max: number, floor = 5, ceiling = 95) => {
  if (!Number.isFinite(value)) return (floor + ceiling) / 2;
  if (max === min) return ceiling;
  const scaled = ((value - min) / (max - min)) * 100;
  return clamp(scaled, floor, ceiling);
};
const inverseScale = (value: number, min: number, max: number) => 100 - scaleValue(value, min, max);

const REGION_BASELINES: Record<string, { infrastructure: number; digital: number; stability: number; costEfficiency: number; marketAccess: number; regulatory: number; sustainability: number; innovation: number; supplyChain: number; }> = {
  europe: { infrastructure: 85, digital: 88, stability: 82, costEfficiency: 45, marketAccess: 80, regulatory: 82, sustainability: 74, innovation: 80, supplyChain: 78 },
  'north america': { infrastructure: 83, digital: 86, stability: 78, costEfficiency: 50, marketAccess: 82, regulatory: 78, sustainability: 70, innovation: 79, supplyChain: 80 },
  'latin america': { infrastructure: 62, digital: 58, stability: 55, costEfficiency: 65, marketAccess: 60, regulatory: 52, sustainability: 60, innovation: 55, supplyChain: 58 },
  'middle east': { infrastructure: 70, digital: 66, stability: 60, costEfficiency: 55, marketAccess: 68, regulatory: 58, sustainability: 57, innovation: 60, supplyChain: 62 },
  africa: { infrastructure: 50, digital: 45, stability: 48, costEfficiency: 70, marketAccess: 52, regulatory: 45, sustainability: 55, innovation: 48, supplyChain: 50 },
  asia: { infrastructure: 72, digital: 74, stability: 65, costEfficiency: 60, marketAccess: 75, regulatory: 60, sustainability: 63, innovation: 70, supplyChain: 72 },
  oceania: { infrastructure: 80, digital: 82, stability: 80, costEfficiency: 58, marketAccess: 76, regulatory: 80, sustainability: 73, innovation: 78, supplyChain: 74 },
  default: { infrastructure: 65, digital: 60, stability: 60, costEfficiency: 60, marketAccess: 65, regulatory: 60, sustainability: 60, innovation: 60, supplyChain: 60 }
};

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class CompositeScoreService {
  private static cache = new Map<string, { timestamp: number; result: CompositeScoreResult }>();

  private static extractContext(input: ReportParameters | CompositeScoreContext): CompositeScoreContext {
    return {
      country: (input as ReportParameters).country ?? input.country,
      region: (input as ReportParameters).region ?? input.region,
      industry: (input as ReportParameters).industry ?? input.industry,
      strategicIntent: (input as ReportParameters).strategicIntent ?? input.strategicIntent
    };
  }

  static async getScores(input: ReportParameters | CompositeScoreContext): Promise<CompositeScoreResult> {
    const ctx = this.extractContext(input);
    const locator = (ctx.country || ctx.region || 'global').toLowerCase();
    const cached = this.cache.get(locator);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }

    const intelligence = await LiveDataService.getCountryIntelligence(ctx.country || ctx.region || 'global');
    const profile = intelligence.profile;
    const economics = intelligence.economics;

    const gdpCurrent = safeNumber(economics?.gdpCurrent, 80_000_000_000);
    const population = safeNumber(economics?.population ?? profile?.population, 12_000_000);
    const gdpPerCapita = gdpCurrent / clamp(population, 1, Number.MAX_SAFE_INTEGER);
    const gdpGrowth = safeNumber(economics?.gdpGrowth, 3.2);
    const inflation = safeNumber(economics?.inflation, 4.5);
    const fdiInflows = safeNumber(economics?.fdiInflows, 6_000_000_000);
    const tradeBalance = safeNumber(economics?.tradeBalance, 0);
    const tradeBalancePercent = clamp((tradeBalance / Math.max(gdpCurrent, 1)) * 100, -40, 40);
    const fdiPerCapita = fdiInflows / clamp(population, 1, Number.MAX_SAFE_INTEGER);
    const easeOfBusiness = economics?.easeOfBusiness ?? null;
    const unemployment = economics?.unemployment ?? null;
    const regionKey = (profile?.region || ctx.region || 'default').toLowerCase();
    const regionBaseline = REGION_BASELINES[regionKey] || REGION_BASELINES.default;

    const gdpPerCapitaScore = scaleValue(gdpPerCapita, 2_000, 80_000);
    const populationScore = scaleValue(Math.log10(population), 6, 9.5);
    const growthScore = scaleValue(gdpGrowth, -5, 12);
    const inflationScore = inverseScale(inflation, 1, 20);
    const fdiScore = scaleValue(fdiPerCapita, 10, 10_000);
    const tradeScore = scaleValue(tradeBalancePercent, -25, 25);
    const easeScore = easeOfBusiness != null ? inverseScale(easeOfBusiness, 1, 190) : 60;
    const unemploymentScore = unemployment != null ? inverseScale(unemployment, 2, 25) : 60;
    const costEfficiencyScore = inverseScale(gdpPerCapita, 2_000, 70_000);

    const components = {
      infrastructure: clamp(
        0.4 * gdpPerCapitaScore +
          0.2 * regionBaseline.infrastructure +
          0.2 * tradeScore +
          0.2 * fdiScore,
        15,
        100
      ),
      talent: clamp(
        0.35 * populationScore +
          0.25 * unemploymentScore +
          0.2 * gdpPerCapitaScore +
          0.2 * fdiScore,
        15,
        100
      ),
      costEfficiency: clamp(
        0.5 * costEfficiencyScore +
          0.3 * inflationScore +
          0.2 * regionBaseline.costEfficiency,
        10,
        100
      ),
      marketAccess: clamp(
        0.4 * tradeScore +
          0.3 * regionBaseline.marketAccess +
          0.3 * fdiScore,
        10,
        100
      ),
      regulatory: clamp(
        0.5 * easeScore +
          0.3 * regionBaseline.regulatory +
          0.2 * inflationScore,
        10,
        100
      ),
      politicalStability: clamp(
        0.5 * regionBaseline.stability +
          0.2 * tradeScore +
          0.3 * inflationScore,
        10,
        100
      ),
      growthPotential: clamp(
        0.5 * growthScore +
          0.3 * fdiScore +
          0.2 * populationScore,
        10,
        100
      ),
      riskFactors: clamp(
        100 - (0.4 * regionBaseline.stability + 0.3 * easeScore + 0.3 * inflationScore),
        5,
        95
      ),
      digitalReadiness: clamp(
        0.5 * regionBaseline.digital +
          0.3 * gdpPerCapitaScore +
          0.2 * populationScore,
        10,
        100
      ),
      sustainability: clamp(
        0.4 * regionBaseline.sustainability +
          0.3 * tradeScore +
          0.3 * growthScore,
        10,
        100
      ),
      innovation: clamp(
        0.4 * gdpPerCapitaScore +
          0.3 * fdiScore +
          0.3 * regionBaseline.innovation,
        10,
        100
      ),
      supplyChain: clamp(
        0.4 * regionBaseline.supplyChain +
          0.3 * tradeScore +
          0.3 * regionBaseline.infrastructure,
        10,
        100
      )
    };

    const weights: Record<keyof typeof components, number> = {
      infrastructure: 0.1,
      talent: 0.1,
      costEfficiency: 0.08,
      marketAccess: 0.1,
      regulatory: 0.08,
      politicalStability: 0.08,
      growthPotential: 0.1,
      riskFactors: 0.08,
      digitalReadiness: 0.07,
      sustainability: 0.07,
      innovation: 0.07,
      supplyChain: 0.07
    };

    const overall = Object.entries(components).reduce((sum, [key, value]) => sum + value * weights[key as keyof typeof components], 0);

    const dataSources = new Set<string>([...intelligence.dataQuality.sources, 'Composite Score Engine v2']);

    const result: CompositeScoreResult = {
      components,
      overall: Math.round(overall),
      inputs: {
        gdpCurrent,
        population,
        gdpPerCapita,
        gdpGrowth,
        inflation,
        fdiInflows,
        tradeBalance,
        easeOfBusiness,
        unemployment,
        regionBaseline: regionBaseline.stability
      },
      dataSources: Array.from(dataSources)
    };

    this.cache.set(locator, { timestamp: Date.now(), result });
    return result;
  }
}

export default CompositeScoreService;

