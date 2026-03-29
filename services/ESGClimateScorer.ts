/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * ESG & CLIMATE RESILIENCE SCORER
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Scores cities on Environmental, Social, and Governance factors plus climate
 * resilience. Critical for companies with ESG mandates, sustainability targets,
 * or climate risk concerns when choosing relocation destinations.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface ESGProfile {
  cityId: string;
  city: string;
  country: string;
  environmental: {
    carbonIntensity: number;        // g CO2/kWh of local grid
    renewableEnergyPct: number;     // % of energy from renewables
    airQualityIndex: number;        // 0-500 (lower=better, WHO standard)
    waterStress: 'low' | 'medium' | 'high' | 'extreme';
    wasteManagement: 'advanced' | 'adequate' | 'basic' | 'poor';
    score: number; // 0-100
  };
  social: {
    humanDevelopmentIndex: number;  // 0-1
    genderEqualityIndex: number;   // 0-1
    laborRightsScore: number;      // 0-100
    communityWelfare: number;      // 0-100
    healthcareAccess: number;      // 0-100
    score: number; // 0-100
  };
  governance: {
    corruptionPerceptionsIndex: number; // 0-100 (higher=cleaner)
    ruleOfLaw: number;             // 0-100
    regulatoryQuality: number;     // 0-100
    transparency: number;          // 0-100
    score: number; // 0-100
  };
  climateResilience: {
    floodRisk: 'low' | 'moderate' | 'high' | 'extreme';
    cycloneExposure: 'none' | 'low' | 'moderate' | 'high';
    earthquakeRisk: 'low' | 'moderate' | 'high';
    seaLevelRise: 'minimal' | 'moderate' | 'significant';
    heatStress: 'low' | 'moderate' | 'high' | 'extreme';
    adaptationReadiness: number;   // 0-100
    score: number; // 0-100
  };
  compositeESG: number;
  tier: 'leader' | 'performer' | 'average' | 'laggard';
  insights: string[];
}

// â"€â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const ESG_PROFILES: ESGProfile[] = [
  {
    cityId: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    environmental: { carbonIntensity: 400, renewableEnergyPct: 4, airQualityIndex: 52, waterStress: 'high', wasteManagement: 'advanced', score: 58 },
    social: { humanDevelopmentIndex: 0.938, genderEqualityIndex: 0.73, laborRightsScore: 72, communityWelfare: 85, healthcareAccess: 95, score: 82 },
    governance: { corruptionPerceptionsIndex: 85, ruleOfLaw: 92, regulatoryQuality: 95, transparency: 88, score: 90 },
    climateResilience: { floodRisk: 'moderate', cycloneExposure: 'none', earthquakeRisk: 'low', seaLevelRise: 'significant', heatStress: 'high', adaptationReadiness: 88, score: 68 },
    compositeESG: 75,
    tier: 'performer',
    insights: ['Excellent governance offsets moderate environmental score', 'Sea level rise is key long-term risk', 'Green Plan 2030 targets 200MW of solar by 2030'],
  },
  {
    cityId: 'cebu-city',
    city: 'Cebu City',
    country: 'Philippines',
    environmental: { carbonIntensity: 680, renewableEnergyPct: 22, airQualityIndex: 68, waterStress: 'medium', wasteManagement: 'basic', score: 38 },
    social: { humanDevelopmentIndex: 0.699, genderEqualityIndex: 0.79, laborRightsScore: 55, communityWelfare: 58, healthcareAccess: 52, score: 52 },
    governance: { corruptionPerceptionsIndex: 34, ruleOfLaw: 42, regulatoryQuality: 48, transparency: 45, score: 42 },
    climateResilience: { floodRisk: 'high', cycloneExposure: 'high', earthquakeRisk: 'moderate', seaLevelRise: 'moderate', heatStress: 'moderate', adaptationReadiness: 35, score: 32 },
    compositeESG: 41,
    tier: 'laggard',
    insights: ['Typhoon exposure demands business continuity planning', 'Gender equality strong for ASEAN', 'Waste and water infrastructure need investment', 'Rising renewables (geothermal + solar)'],
  },
  {
    cityId: 'davao-city',
    city: 'Davao City',
    country: 'Philippines',
    environmental: { carbonIntensity: 650, renewableEnergyPct: 28, airQualityIndex: 55, waterStress: 'low', wasteManagement: 'adequate', score: 45 },
    social: { humanDevelopmentIndex: 0.699, genderEqualityIndex: 0.79, laborRightsScore: 58, communityWelfare: 62, healthcareAccess: 55, score: 55 },
    governance: { corruptionPerceptionsIndex: 34, ruleOfLaw: 42, regulatoryQuality: 52, transparency: 48, score: 44 },
    climateResilience: { floodRisk: 'moderate', cycloneExposure: 'low', earthquakeRisk: 'moderate', seaLevelRise: 'minimal', heatStress: 'moderate', adaptationReadiness: 38, score: 48 },
    compositeESG: 48,
    tier: 'average',
    insights: ['Outside typhoon belt â€" significant climate advantage vs Cebu/Manila', 'Higher renewable energy from hydro', 'Better waste management than national average', 'Governance improving under investment-friendly administration'],
  },
  {
    cityId: 'townsville',
    city: 'Townsville',
    country: 'Australia',
    environmental: { carbonIntensity: 750, renewableEnergyPct: 18, airQualityIndex: 28, waterStress: 'medium', wasteManagement: 'advanced', score: 55 },
    social: { humanDevelopmentIndex: 0.951, genderEqualityIndex: 0.86, laborRightsScore: 88, communityWelfare: 75, healthcareAccess: 80, score: 82 },
    governance: { corruptionPerceptionsIndex: 75, ruleOfLaw: 88, regulatoryQuality: 85, transparency: 80, score: 82 },
    climateResilience: { floodRisk: 'high', cycloneExposure: 'high', earthquakeRisk: 'low', seaLevelRise: 'moderate', heatStress: 'moderate', adaptationReadiness: 72, score: 52 },
    compositeESG: 68,
    tier: 'performer',
    insights: ['Strong social and governance scores (Australian standards)', 'Cyclone risk requires BCP', 'Coal-dominated grid hurts environmental score', 'Great Barrier Reef proximity creates environmental sensitivity'],
  },
  {
    cityId: 'darwin',
    city: 'Darwin',
    country: 'Australia',
    environmental: { carbonIntensity: 580, renewableEnergyPct: 12, airQualityIndex: 22, waterStress: 'low', wasteManagement: 'adequate', score: 52 },
    social: { humanDevelopmentIndex: 0.951, genderEqualityIndex: 0.86, laborRightsScore: 88, communityWelfare: 68, healthcareAccess: 72, score: 78 },
    governance: { corruptionPerceptionsIndex: 75, ruleOfLaw: 88, regulatoryQuality: 82, transparency: 78, score: 80 },
    climateResilience: { floodRisk: 'moderate', cycloneExposure: 'high', earthquakeRisk: 'low', seaLevelRise: 'moderate', heatStress: 'extreme', adaptationReadiness: 65, score: 45 },
    compositeESG: 64,
    tier: 'performer',
    insights: ['Extreme heat stress is real operational concern', 'Cyclone-rated construction essential', 'Gas-dominated energy â€" transitioning', 'Strong Aboriginal land governance adds complexity'],
  },
  {
    cityId: 'pagadian-city',
    city: 'Pagadian City',
    country: 'Philippines',
    environmental: { carbonIntensity: 700, renewableEnergyPct: 15, airQualityIndex: 45, waterStress: 'low', wasteManagement: 'basic', score: 35 },
    social: { humanDevelopmentIndex: 0.699, genderEqualityIndex: 0.79, laborRightsScore: 50, communityWelfare: 48, healthcareAccess: 40, score: 45 },
    governance: { corruptionPerceptionsIndex: 34, ruleOfLaw: 38, regulatoryQuality: 42, transparency: 40, score: 38 },
    climateResilience: { floodRisk: 'moderate', cycloneExposure: 'low', earthquakeRisk: 'low', seaLevelRise: 'minimal', heatStress: 'moderate', adaptationReadiness: 22, score: 45 },
    compositeESG: 41,
    tier: 'laggard',
    insights: ['Low cyclone + earthquake exposure is a hidden advantage', 'Limited climate adaptation infrastructure', 'Healthcare access is key social gap', 'Clean air due to low industrialization'],
  },
  {
    cityId: 'kuala-lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    environmental: { carbonIntensity: 580, renewableEnergyPct: 18, airQualityIndex: 72, waterStress: 'low', wasteManagement: 'adequate', score: 45 },
    social: { humanDevelopmentIndex: 0.803, genderEqualityIndex: 0.68, laborRightsScore: 60, communityWelfare: 70, healthcareAccess: 75, score: 62 },
    governance: { corruptionPerceptionsIndex: 50, ruleOfLaw: 62, regulatoryQuality: 68, transparency: 55, score: 59 },
    climateResilience: { floodRisk: 'high', cycloneExposure: 'none', earthquakeRisk: 'low', seaLevelRise: 'minimal', heatStress: 'high', adaptationReadiness: 55, score: 52 },
    compositeESG: 55,
    tier: 'average',
    insights: ['Haze episodes (palm oil burning) impact air quality seasonally', 'No cyclone exposure', 'Flash flooding is recurring urban challenge', 'Improving governance trajectory'],
  },
  {
    cityId: 'auckland',
    city: 'Auckland',
    country: 'New Zealand',
    environmental: { carbonIntensity: 80, renewableEnergyPct: 85, airQualityIndex: 15, waterStress: 'low', wasteManagement: 'advanced', score: 92 },
    social: { humanDevelopmentIndex: 0.937, genderEqualityIndex: 0.84, laborRightsScore: 90, communityWelfare: 85, healthcareAccess: 88, score: 88 },
    governance: { corruptionPerceptionsIndex: 87, ruleOfLaw: 92, regulatoryQuality: 90, transparency: 88, score: 89 },
    climateResilience: { floodRisk: 'moderate', cycloneExposure: 'low', earthquakeRisk: 'moderate', seaLevelRise: 'moderate', heatStress: 'low', adaptationReadiness: 78, score: 72 },
    compositeESG: 85,
    tier: 'leader',
    insights: ['Near-100% renewable electricity', 'Top-tier governance and social metrics', 'Volcanic/seismic risk present but manageable', 'Premium ESG destination â€" but at a price'],
  },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class ESGClimateScorer {

  /** Get ESG profile for a city */
  static getProfile(cityId: string): ESGProfile | null {
    return ESG_PROFILES.find(p => p.cityId === cityId) || null;
  }

  /** Get all profiles ranked by composite ESG */
  static getRankings(): ESGProfile[] {
    return [...ESG_PROFILES].sort((a, b) => b.compositeESG - a.compositeESG);
  }

  /** Get profiles by tier */
  static getByTier(tier: ESGProfile['tier']): ESGProfile[] {
    return ESG_PROFILES.filter(p => p.tier === tier);
  }

  /** Compare ESG across cities */
  static compare(cityIds: string[]): Array<{
    city: string;
    composite: number;
    env: number;
    social: number;
    gov: number;
    climate: number;
    tier: string;
    topInsight: string;
  }> {
    return cityIds.map(id => {
      const p = this.getProfile(id);
      if (!p) return null;
      return {
        city: p.city,
        composite: p.compositeESG,
        env: p.environmental.score,
        social: p.social.score,
        gov: p.governance.score,
        climate: p.climateResilience.score,
        tier: p.tier,
        topInsight: p.insights[0] || '',
      };
    }).filter(Boolean) as Array<{ city: string; composite: number; env: number; social: number; gov: number; climate: number; tier: string; topInsight: string }>;
  }

  /** Check if a city meets minimum ESG thresholds */
  static meetsThreshold(cityId: string, minComposite: number = 50): { meets: boolean; gaps: string[] } {
    const p = this.getProfile(cityId);
    if (!p) return { meets: false, gaps: ['City not found'] };
    const gaps: string[] = [];
    if (p.environmental.score < 40) gaps.push(`Environmental score (${p.environmental.score}) below threshold`);
    if (p.social.score < 40) gaps.push(`Social score (${p.social.score}) below threshold`);
    if (p.governance.score < 40) gaps.push(`Governance score (${p.governance.score}) below threshold`);
    if (p.climateResilience.score < 30) gaps.push(`Climate resilience (${p.climateResilience.score}) below threshold`);
    return { meets: p.compositeESG >= minComposite && gaps.length === 0, gaps };
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(cityId: string): string {
    const p = this.getProfile(cityId);
    if (!p) return '';
    const lines: string[] = [`\n### â"€â"€ ESG & CLIMATE: ${p.city} (${p.compositeESG}/100 â€" ${p.tier.toUpperCase()}) â"€â"€`];
    lines.push(`**Environmental** (${p.environmental.score}): COâ‚‚ ${p.environmental.carbonIntensity}g/kWh | Renewable ${p.environmental.renewableEnergyPct}% | AQI ${p.environmental.airQualityIndex} | Water: ${p.environmental.waterStress}`);
    lines.push(`**Social** (${p.social.score}): HDI ${p.social.humanDevelopmentIndex} | Gender ${p.social.genderEqualityIndex} | Labor ${p.social.laborRightsScore} | Healthcare ${p.social.healthcareAccess}`);
    lines.push(`**Governance** (${p.governance.score}): CPI ${p.governance.corruptionPerceptionsIndex} | Rule of Law ${p.governance.ruleOfLaw} | Regulatory ${p.governance.regulatoryQuality}`);
    lines.push(`**Climate Resilience** (${p.climateResilience.score}): Flood ${p.climateResilience.floodRisk} | Cyclone ${p.climateResilience.cycloneExposure} | Quake ${p.climateResilience.earthquakeRisk} | Heat ${p.climateResilience.heatStress}`);
    lines.push(`**Insights:** ${p.insights.slice(0, 2).join(' | ')}`);
    return lines.join('\n');
  }
}
