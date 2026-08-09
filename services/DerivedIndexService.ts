import { ReportParameters, PRIResult, TCOResult, CRIResult } from '../types';
import CompositeScoreService from './CompositeScoreService';
import { GLOBAL_CITY_DATABASE } from '../constants';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const HEADCOUNT_MAP: Record<string, number> = {
  '<5': 4,
  '5-10': 8,
  '11-50': 30,
  '51-100': 75,
  '101-500': 300,
  '501-1000': 750,
  '1001-5000': 2500,
  'over_10000': 12000
};

const estimateHeadcount = (band?: string): number => {
  if (!band) return 500;
  return HEADCOUNT_MAP[band] ?? 500;
};

const salaryFromLaborIndex = (index: number): number => {
  const normalized = clamp(index, 20, 120);
  return 20_000 + (normalized / 120) * 130_000;
};

const getCityData = (country?: string) => {
  if (country && GLOBAL_CITY_DATABASE[country]) {
    return GLOBAL_CITY_DATABASE[country];
  }
  return {
    city: 'Reference City',
    country: country || 'Global',
    region: 'Global',
    population: 8_000_000,
    talentPool: { laborCosts: 60, educationLevel: 70, skillsAvailability: 70 },
    infrastructure: { transportation: 65, digital: 70, utilities: 70 },
    businessEnvironment: { easeOfDoingBusiness: 65, corruptionIndex: 45, regulatoryQuality: 65 },
    marketAccess: { domesticMarket: 70, exportPotential: 65, regionalConnectivity: 65 },
    gdp: { totalBillionUSD: 200, perCapitaUSD: 40_000 }
  };
};

const formatSensitivity = (value: number, highLabel: string, lowLabel: string): string => {
  if (value >= 70) return `${highLabel}`;
  if (value <= 40) return `${lowLabel}`;
  return 'Moderate';
};

export class DerivedIndexService {
  static async calculatePRI(params: ReportParameters): Promise<PRIResult> {
    const composite = await CompositeScoreService.getScores(params);
    const political = composite.components.politicalStability;
    const regulatory = composite.components.regulatory;
    const market = 100 - composite.components.riskFactors;
    const security = composite.components.digitalReadiness;

    const overall = clamp(
      Math.round(political * 0.3 + regulatory * 0.25 + market * 0.25 + security * 0.2),
      0,
      100
    );

    const riskBand: PRIResult['riskBand'] = overall >= 75 ? 'Low' : overall >= 55 ? 'Medium' : 'High';
    const commentary = [
      `Political stability indexed at ${Math.round(political)}/100`,
      `Regulatory readiness indexed at ${Math.round(regulatory)}/100`,
      `Market risk counterweight indexed at ${Math.round(market)}/100`
    ];

    if (params.riskTolerance === 'low' && overall < 60) {
      commentary.push('User risk tolerance is low, so additional governance safeguards are recommended.');
    }

    return {
      overall,
      riskBand,
      components: {
        political: Math.round(political),
        regulatory: Math.round(regulatory),
        market: Math.round(market),
        security: Math.round(security)
      },
      commentary
    };
  }

  static async calculateTCO(params: ReportParameters): Promise<TCOResult> {
    const cityData = getCityData(params.country);
    const composite = await CompositeScoreService.getScores(params);
    const headcount = estimateHeadcount(params.headcountBand);
    const laborIndex = cityData.talentPool.laborCosts ?? 60;
    const baseSalary = salaryFromLaborIndex(laborIndex);

    const operating = Math.round(headcount * baseSalary * 5 * 0.9);
    const infraScore = cityData.infrastructure.utilities ?? 65;
    const capital = Math.round(headcount * (120_000 - infraScore * 800) + composite.inputs.gdpPerCapita * 25);
    const complianceIndex = 100 - (cityData.businessEnvironment.easeOfDoingBusiness ?? 65);
    const compliance = Math.round(complianceIndex * 35_000 + (100 - composite.components.regulatory) * 12_000);

    const fiveYearUSD = operating + capital + compliance;
    const annualRunRateUSD = Math.round(fiveYearUSD / 5);

    const sensitivity = {
      fxExposure: params.region === 'Asia-Pacific' ? 'High (currency baskets diversify exposure)' : 'Moderate',
      inflationOutlook: formatSensitivity(composite.inputs.inflation ?? 5, 'Elevated inflation pass-through', 'Benign inflation environment')
    };

    const notes = [
      `Headcount band ${params.headcountBand || 'unspecified'} translates to ~${headcount.toLocaleString()} FTEs`,
      `Labor cost index ${laborIndex}/100 approximates base salary of $${Math.round(baseSalary).toLocaleString()}`,
      `Compliance drag driven by ease-of-doing-business score ${(cityData.businessEnvironment.easeOfDoingBusiness ?? 65).toFixed(0)}/100`
    ];

    return {
      fiveYearUSD,
      annualRunRateUSD,
      breakdown: {
        operating,
        capital,
        compliance
      },
      sensitivity,
      notes
    };
  }

  static async calculateCRI(params: ReportParameters): Promise<CRIResult> {
    const composite = await CompositeScoreService.getScores(params);
    const cityData = getCityData(params.country);

    const communityFit = clamp(
      Math.round(
        composite.components.sustainability * 0.4 +
          composite.components.marketAccess * 0.3 +
          (params.priorityThemes?.includes('Sustainability') ? 8 : 0)
      ),
      0,
      100
    );

    const governanceFit = clamp(
      Math.round(
        composite.components.regulatory * 0.5 +
          composite.components.politicalStability * 0.3 +
          (params.stakeholderAlignment?.length || 0) * 3
      ),
      0,
      100
    );

    const partnerTrust = clamp(
      Math.round(
        composite.components.digitalReadiness * 0.3 +
          composite.components.talent * 0.25 +
          (params.partnerPersonas?.length || 0) * 4 +
          (params.organizationType === 'Government Agency' ? 6 : 0)
      ),
      0,
      100
    );

    const score = clamp(Math.round(communityFit * 0.35 + governanceFit * 0.35 + partnerTrust * 0.3), 0, 100);
    const resonanceTier: CRIResult['resonanceTier'] = score >= 75 ? 'High' : score >= 55 ? 'Medium' : 'Emerging';

    const signals = [
      `Community fit boosted by sustainability index ${Math.round(composite.components.sustainability)}/100`,
      `Governance fit tied to regulatory quality ${(cityData.businessEnvironment.regulatoryQuality ?? 65).toFixed(0)}/100`,
      `Partner trust lifted by ${params.partnerPersonas?.length || 0} declared partner personas`
    ];

    return {
      score,
      resonanceTier,
      components: {
        communityFit,
        governanceFit,
        partnerTrust
      },
      signals
    };
  }
}

export default DerivedIndexService;

