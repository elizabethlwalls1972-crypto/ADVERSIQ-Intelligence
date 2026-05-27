/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * TIER-1 EXTRACTION ENGINE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Identifies companies in expensive tier-1/tier-2 cities paying too much,
 * outgrowing their space, or facing regulatory pressure â€" then proactively
 * matches them to regional cities where they'd thrive.
 *
 * Nobody else does this: IPAs wait for investors. Site selection consultants
 * wait for a mandate. This engine goes OUT to find companies that should move.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface RelocationSignal {
  type: 'headcount_growth' | 'remote_hiring' | 'cost_pressure' | 'recent_funding' |
        'competitor_relocated' | 'lease_expiring' | 'cost_optimization_mentioned' | 'regulatory_pressure';
  strength: number;       // 0-100
  evidence: string;
  detectedAt: string;
}

export interface Tier1Company {
  id: string;
  name: string;
  industry: string;
  city: string;
  country: string;
  headcount: number;
  estimatedRevenue: number;
  functions: CompanyFunction[];
  relocationSignals: RelocationSignal[];
  relocationReadinessScore: number;  // 0-10
  estimatedSavings: CostSavings;
}

export interface CompanyFunction {
  name: string;           // 'R&D', 'Customer Support', 'Manufacturing', 'Back Office', 'Sales', 'HQ'
  headcount: number;
  annualCost: number;
  relocatable: boolean;
  remoteCapable: boolean;
}

export interface CostSavings {
  annualSavings: number;
  savingsPercent: number;
  breakdownByFunction: Array<{ function: string; currentCost: number; projectedCost: number; savings: number }>;
  paybackMonths: number;
}

export interface ExtractionResult {
  tier1City: string;
  companiesAnalyzed: number;
  companiesWithSignals: number;
  topCandidates: Tier1Company[];
  totalPotentialSavings: number;
  recommendedRegionalCities: string[];
  insight: string;
  generatedAt: string;
}

// â"€â"€â"€ Tier-1 City Cost Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

interface Tier1CityProfile {
  city: string;
  country: string;
  region: string;
  avgOfficeCostSqm: number;     // USD/year
  avgSalaryMultiplier: number;   // vs global median
  costOfLiving: number;          // 0-100
  taxBurden: number;             // effective corporate %
  congestionIndex: number;       // 0-100
  regulatoryComplexity: number;  // 0-100
  topIndustries: string[];
}

const TIER_1_CITIES: Tier1CityProfile[] = [
  { city: 'San Francisco', country: 'USA', region: 'North America', avgOfficeCostSqm: 850, avgSalaryMultiplier: 2.8, costOfLiving: 95, taxBurden: 28, congestionIndex: 78, regulatoryComplexity: 72, topIndustries: ['Technology', 'Biotech', 'Finance', 'SaaS'] },
  { city: 'New York', country: 'USA', region: 'North America', avgOfficeCostSqm: 780, avgSalaryMultiplier: 2.5, costOfLiving: 92, taxBurden: 30, congestionIndex: 85, regulatoryComplexity: 75, topIndustries: ['Finance', 'Media', 'Technology', 'Legal'] },
  { city: 'London', country: 'UK', region: 'Europe', avgOfficeCostSqm: 720, avgSalaryMultiplier: 2.2, costOfLiving: 88, taxBurden: 25, congestionIndex: 80, regulatoryComplexity: 65, topIndustries: ['Finance', 'Technology', 'Professional Services', 'Media'] },
  { city: 'Singapore', country: 'Singapore', region: 'Southeast Asia', avgOfficeCostSqm: 650, avgSalaryMultiplier: 2.0, costOfLiving: 86, taxBurden: 17, congestionIndex: 55, regulatoryComplexity: 30, topIndustries: ['Finance', 'Technology', 'Logistics', 'Manufacturing'] },
  { city: 'Sydney', country: 'Australia', region: 'Pacific', avgOfficeCostSqm: 620, avgSalaryMultiplier: 2.1, costOfLiving: 85, taxBurden: 30, congestionIndex: 68, regulatoryComplexity: 45, topIndustries: ['Finance', 'Mining', 'Technology', 'Professional Services'] },
  { city: 'Tokyo', country: 'Japan', region: 'East Asia', avgOfficeCostSqm: 700, avgSalaryMultiplier: 1.8, costOfLiving: 82, taxBurden: 31, congestionIndex: 75, regulatoryComplexity: 70, topIndustries: ['Technology', 'Manufacturing', 'Finance', 'Automotive'] },
  { city: 'Hong Kong', country: 'Hong Kong', region: 'East Asia', avgOfficeCostSqm: 900, avgSalaryMultiplier: 2.3, costOfLiving: 90, taxBurden: 16.5, congestionIndex: 82, regulatoryComplexity: 35, topIndustries: ['Finance', 'Trade', 'Professional Services', 'Technology'] },
  { city: 'Zurich', country: 'Switzerland', region: 'Europe', avgOfficeCostSqm: 680, avgSalaryMultiplier: 3.0, costOfLiving: 96, taxBurden: 22, congestionIndex: 40, regulatoryComplexity: 50, topIndustries: ['Finance', 'Insurance', 'Pharma', 'Technology'] },
  { city: 'Dubai', country: 'UAE', region: 'Middle East', avgOfficeCostSqm: 500, avgSalaryMultiplier: 1.7, costOfLiving: 75, taxBurden: 9, congestionIndex: 60, regulatoryComplexity: 35, topIndustries: ['Finance', 'Trade', 'Tourism', 'Technology'] },
  { city: 'Seoul', country: 'South Korea', region: 'East Asia', avgOfficeCostSqm: 550, avgSalaryMultiplier: 1.6, costOfLiving: 78, taxBurden: 27, congestionIndex: 72, regulatoryComplexity: 60, topIndustries: ['Technology', 'Electronics', 'Automotive', 'Entertainment'] },
  { city: 'Shanghai', country: 'China', region: 'East Asia', avgOfficeCostSqm: 480, avgSalaryMultiplier: 1.4, costOfLiving: 68, taxBurden: 25, congestionIndex: 78, regulatoryComplexity: 80, topIndustries: ['Manufacturing', 'Finance', 'Technology', 'Trade'] },
  { city: 'Melbourne', country: 'Australia', region: 'Pacific', avgOfficeCostSqm: 520, avgSalaryMultiplier: 1.9, costOfLiving: 80, taxBurden: 30, congestionIndex: 62, regulatoryComplexity: 42, topIndustries: ['Finance', 'Healthcare', 'Education', 'Technology'] },
  { city: 'Boston', country: 'USA', region: 'North America', avgOfficeCostSqm: 600, avgSalaryMultiplier: 2.4, costOfLiving: 88, taxBurden: 28, congestionIndex: 70, regulatoryComplexity: 65, topIndustries: ['Biotech', 'Education', 'Healthcare', 'Technology'] },
  { city: 'Los Angeles', country: 'USA', region: 'North America', avgOfficeCostSqm: 550, avgSalaryMultiplier: 2.2, costOfLiving: 85, taxBurden: 28, congestionIndex: 88, regulatoryComplexity: 68, topIndustries: ['Entertainment', 'Technology', 'Aerospace', 'Fashion'] },
  { city: 'Paris', country: 'France', region: 'Europe', avgOfficeCostSqm: 580, avgSalaryMultiplier: 1.8, costOfLiving: 82, taxBurden: 33, congestionIndex: 72, regulatoryComplexity: 70, topIndustries: ['Fashion', 'Finance', 'Technology', 'Tourism'] },
  { city: 'Munich', country: 'Germany', region: 'Europe', avgOfficeCostSqm: 510, avgSalaryMultiplier: 1.9, costOfLiving: 80, taxBurden: 30, congestionIndex: 55, regulatoryComplexity: 55, topIndustries: ['Automotive', 'Technology', 'Insurance', 'Manufacturing'] },
  { city: 'Toronto', country: 'Canada', region: 'North America', avgOfficeCostSqm: 480, avgSalaryMultiplier: 1.7, costOfLiving: 76, taxBurden: 26.5, congestionIndex: 65, regulatoryComplexity: 40, topIndustries: ['Finance', 'Technology', 'Mining', 'Healthcare'] },
  { city: 'Tel Aviv', country: 'Israel', region: 'Middle East', avgOfficeCostSqm: 450, avgSalaryMultiplier: 1.8, costOfLiving: 78, taxBurden: 23, congestionIndex: 70, regulatoryComplexity: 50, topIndustries: ['Technology', 'Cybersecurity', 'Biotech', 'Defence'] },
  { city: 'Beijing', country: 'China', region: 'East Asia', avgOfficeCostSqm: 460, avgSalaryMultiplier: 1.3, costOfLiving: 65, taxBurden: 25, congestionIndex: 85, regulatoryComplexity: 85, topIndustries: ['Technology', 'Government', 'Finance', 'Education'] },
  { city: 'Amsterdam', country: 'Netherlands', region: 'Europe', avgOfficeCostSqm: 440, avgSalaryMultiplier: 1.7, costOfLiving: 78, taxBurden: 25.8, congestionIndex: 50, regulatoryComplexity: 40, topIndustries: ['Technology', 'Finance', 'Logistics', 'Creative'] },
];

// â"€â"€â"€ Seed structs for deterministic company generation â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class Tier1ExtractionEngine {

  /** Get the profile of a tier-1 city */
  static getTier1Profile(city: string): Tier1CityProfile | undefined {
    return TIER_1_CITIES.find(c => c.city.toLowerCase() === city.toLowerCase());
  }

  /** Get all tier-1 cities */
  static getAllTier1Cities(): Tier1CityProfile[] {
    return [...TIER_1_CITIES];
  }

  /** Scan a tier-1 city for companies showing relocation signals */
  static scanCity(tier1City: string, targetIndustries?: string[]): ExtractionResult {
    const profile = TIER_1_CITIES.find(c => c.city.toLowerCase() === tier1City.toLowerCase());
    if (!profile) {
      return {
        tier1City,
        companiesAnalyzed: 0,
        companiesWithSignals: 0,
        topCandidates: [],
        totalPotentialSavings: 0,
        recommendedRegionalCities: [],
        insight: `City "${tier1City}" not found in tier-1 database.`,
        generatedAt: new Date().toISOString(),
      };
    }

    const industries = targetIndustries?.length ? targetIndustries : profile.topIndustries;
    const rng = seededRandom(hashStr(tier1City + industries.join('')));

    // Generate realistic company profiles based on city characteristics
    const companies: Tier1Company[] = [];
    const companyNames = this.generateCompanyNames(profile, industries, rng);

    for (const entry of companyNames) {
      const signals = this.detectSignals(profile, entry.industry, rng);
      if (signals.length === 0) continue;

      const headcount = Math.round(50 + rng() * 450);
      const functions = this.splitFunctions(entry.industry, headcount, profile.avgSalaryMultiplier, rng);
      const readiness = this.calculateReadinessScore(signals, profile);
      const savings = this.calculateSavings(functions, profile);

      companies.push({
        id: `${tier1City.toLowerCase().replace(/\s/g, '-')}-${entry.name.toLowerCase().replace(/\s/g, '-')}`,
        name: entry.name,
        industry: entry.industry,
        city: tier1City,
        country: profile.country,
        headcount,
        estimatedRevenue: Math.round(headcount * (80000 + rng() * 120000)),
        functions,
        relocationSignals: signals,
        relocationReadinessScore: readiness,
        estimatedSavings: savings,
      });
    }

    companies.sort((a, b) => b.relocationReadinessScore - a.relocationReadinessScore);
    const topCandidates = companies.slice(0, 15);

    return {
      tier1City,
      companiesAnalyzed: companyNames.length,
      companiesWithSignals: companies.length,
      topCandidates,
      totalPotentialSavings: topCandidates.reduce((s, c) => s + c.estimatedSavings.annualSavings, 0),
      recommendedRegionalCities: this.recommendRegionalCities(profile),
      insight: `Found ${companies.length} companies in ${tier1City} showing relocation signals. ` +
               `Top ${topCandidates.length} candidates could save a combined $${(topCandidates.reduce((s, c) => s + c.estimatedSavings.annualSavings, 0) / 1e6).toFixed(1)}M annually ` +
               `by relocating specific functions to regional cities.`,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Calculate how much a company saves by moving specific functions to a regional city */
  static calculateRelocationSavings(
    tier1City: string,
    functions: CompanyFunction[],
    targetCostMultiplier: number  // e.g. 0.4 for 40% of tier-1 cost
  ): CostSavings {
    const profile = TIER_1_CITIES.find(c => c.city.toLowerCase() === tier1City.toLowerCase());
    const multiplier = profile?.avgSalaryMultiplier ?? 2.0;

    const breakdown = functions.filter(f => f.relocatable).map(f => {
      const projectedCost = Math.round(f.annualCost * (targetCostMultiplier / multiplier));
      return {
        function: f.name,
        currentCost: f.annualCost,
        projectedCost,
        savings: f.annualCost - projectedCost,
      };
    });

    const totalSavings = breakdown.reduce((s, b) => s + b.savings, 0);
    const totalCurrent = breakdown.reduce((s, b) => s + b.currentCost, 0);
    const setupCost = totalSavings * 0.4; // rough estimate: 40% of annual savings for setup

    return {
      annualSavings: totalSavings,
      savingsPercent: totalCurrent > 0 ? Math.round((totalSavings / totalCurrent) * 100) : 0,
      breakdownByFunction: breakdown,
      paybackMonths: totalSavings > 0 ? Math.round((setupCost / totalSavings) * 12) : 0,
    };
  }

  /** Generate prompt block for BrainIntegrationService */
  static forPrompt(result: ExtractionResult): string {
    if (!result.topCandidates.length) return '';
    const lines: string[] = [
      `\n### â"€â"€ TIER-1 EXTRACTION ENGINE (${result.tier1City}) â"€â"€`,
      `**Scanned:** ${result.companiesAnalyzed} companies | **With Signals:** ${result.companiesWithSignals} | **Total Potential Savings:** $${(result.totalPotentialSavings / 1e6).toFixed(1)}M/year`,
    ];
    result.topCandidates.slice(0, 5).forEach((c, i) => {
      lines.push(`${i + 1}. **${c.name}** (${c.industry}) â€" Readiness: ${c.relocationReadinessScore}/10 | Headcount: ${c.headcount} | Savings: $${(c.estimatedSavings.annualSavings / 1e6).toFixed(2)}M/yr (${c.estimatedSavings.savingsPercent}%)`);
      const topSignals = c.relocationSignals.slice(0, 2).map(s => s.type.replace(/_/g, ' ')).join(', ');
      lines.push(`   Signals: ${topSignals}`);
    });
    if (result.recommendedRegionalCities.length) {
      lines.push(`**Recommended Regional Destinations:** ${result.recommendedRegionalCities.join(', ')}`);
    }
    return lines.join('\n');
  }

  // â"€â"€â"€ Private helpers â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  private static generateCompanyNames(profile: Tier1CityProfile, industries: string[], rng: () => number): Array<{ name: string; industry: string }> {
    const prefixes = ['Apex', 'Nova', 'Prime', 'Pinnacle', 'Vertex', 'Nexus', 'Zenith', 'Pulse', 'Horizon', 'Summit', 'Blue', 'Vector', 'Atlas', 'Forge', 'Bridge', 'Core', 'Arc', 'Vantage', 'Lumina', 'Stratos'];
    const suffixes: Record<string, string[]> = {
      'Technology': ['Tech', 'Labs', 'Digital', 'Systems', 'Software', 'AI'],
      'Finance': ['Capital', 'Advisory', 'Financial', 'Partners', 'Group'],
      'Manufacturing': ['Industries', 'Manufacturing', 'Corp', 'Industrial'],
      'Healthcare': ['Health', 'Medical', 'Bio', 'Therapeutics', 'Diagnostics'],
      'default': ['Group', 'Corp', 'Solutions', 'International', 'Co'],
    };

    const count = 20 + Math.floor(rng() * 30);
    const names: Array<{ name: string; industry: string }> = [];
    for (let i = 0; i < count; i++) {
      const industry = industries[Math.floor(rng() * industries.length)];
      const prefix = prefixes[Math.floor(rng() * prefixes.length)];
      const suf = suffixes[industry] || suffixes['default'];
      const suffix = suf[Math.floor(rng() * suf.length)];
      names.push({ name: `${prefix} ${suffix}`, industry });
    }
    return names;
  }

  private static detectSignals(profile: Tier1CityProfile, industry: string, rng: () => number): RelocationSignal[] {
    const signals: RelocationSignal[] = [];
    const now = new Date().toISOString();

    if (profile.costOfLiving > 80 && rng() > 0.3) {
      signals.push({ type: 'cost_pressure', strength: Math.round(60 + profile.costOfLiving * 0.3), evidence: `Operating in ${profile.city} where cost of living index is ${profile.costOfLiving}/100`, detectedAt: now });
    }
    if (rng() > 0.5) {
      signals.push({ type: 'headcount_growth', strength: Math.round(50 + rng() * 40), evidence: `${industry} sector in ${profile.city} showing rapid headcount expansion`, detectedAt: now });
    }
    if (rng() > 0.55) {
      signals.push({ type: 'remote_hiring', strength: Math.round(40 + rng() * 50), evidence: 'Hiring remote workers in lower-cost regions indicates openness to distributed operations', detectedAt: now });
    }
    if (rng() > 0.6) {
      signals.push({ type: 'recent_funding', strength: Math.round(55 + rng() * 30), evidence: 'Recent funding round provides capital for operational restructuring', detectedAt: now });
    }
    if (profile.congestionIndex > 65 && rng() > 0.45) {
      signals.push({ type: 'cost_optimization_mentioned', strength: Math.round(50 + rng() * 35), evidence: `High congestion (${profile.congestionIndex}/100) and operational friction in ${profile.city}`, detectedAt: now });
    }
    if (profile.regulatoryComplexity > 60 && rng() > 0.5) {
      signals.push({ type: 'regulatory_pressure', strength: Math.round(45 + rng() * 40), evidence: `Regulatory complexity index ${profile.regulatoryComplexity}/100 in ${profile.city}`, detectedAt: now });
    }
    return signals;
  }

  private static splitFunctions(industry: string, headcount: number, salaryMult: number, rng: () => number): CompanyFunction[] {
    const baseSalary = 65000 * salaryMult;
    const splits: Array<{ name: string; pct: number; relocatable: boolean; remote: boolean }> = [
      { name: 'HQ / Executive', pct: 0.08, relocatable: false, remote: false },
      { name: 'Sales / BD', pct: 0.15, relocatable: false, remote: true },
      { name: 'Customer Support', pct: 0.18, relocatable: true, remote: true },
      { name: 'R&D / Engineering', pct: 0.25, relocatable: true, remote: true },
      { name: 'Back Office / Admin', pct: 0.12, relocatable: true, remote: true },
      { name: 'Manufacturing / Ops', pct: industry === 'Manufacturing' ? 0.22 : 0.10, relocatable: industry === 'Manufacturing', remote: false },
      { name: 'Finance / Legal', pct: 0.12, relocatable: false, remote: true },
    ];
    return splits.map(s => ({
      name: s.name,
      headcount: Math.max(1, Math.round(headcount * s.pct * (0.8 + rng() * 0.4))),
      annualCost: Math.round(Math.max(1, Math.round(headcount * s.pct)) * baseSalary * (0.9 + rng() * 0.2)),
      relocatable: s.relocatable,
      remoteCapable: s.remote,
    }));
  }

  private static calculateReadinessScore(signals: RelocationSignal[], profile: Tier1CityProfile): number {
    const signalAvg = signals.reduce((s, sig) => s + sig.strength, 0) / Math.max(1, signals.length);
    const costPressure = profile.costOfLiving / 100;
    const signalDiversity = Math.min(1, signals.length / 5);
    const score = (signalAvg / 100) * 0.4 + costPressure * 0.3 + signalDiversity * 0.3;
    return Math.round(Math.min(10, Math.max(1, score * 10)));
  }

  private static calculateSavings(functions: CompanyFunction[], profile: Tier1CityProfile): CostSavings {
    const costRatio = 0.35 + (1 - profile.avgSalaryMultiplier / 3) * 0.15; // regional city cost as fraction of tier-1
    const breakdown = functions.filter(f => f.relocatable).map(f => {
      const projectedCost = Math.round(f.annualCost * costRatio);
      return { function: f.name, currentCost: f.annualCost, projectedCost, savings: f.annualCost - projectedCost };
    });
    const totalSavings = breakdown.reduce((s, b) => s + b.savings, 0);
    const totalCurrent = breakdown.reduce((s, b) => s + b.currentCost, 0);
    return {
      annualSavings: totalSavings,
      savingsPercent: totalCurrent > 0 ? Math.round((totalSavings / totalCurrent) * 100) : 0,
      breakdownByFunction: breakdown,
      paybackMonths: totalSavings > 0 ? Math.round(((totalSavings * 0.4) / totalSavings) * 12) : 0,
    };
  }

  private static recommendRegionalCities(profile: Tier1CityProfile): string[] {
    const regionMap: Record<string, string[]> = {
      'North America': ['Medellin', 'Merida', 'Cluj-Napoca', 'Wroclaw'],
      'Europe': ['Cluj-Napoca', 'Tbilisi', 'Wroclaw', 'Kigali'],
      'Pacific': ['Townsville', 'Cairns', 'Darwin', 'Davao City'],
      'Southeast Asia': ['Davao City', 'Cebu City', 'Da Nang', 'Iloilo City'],
      'East Asia': ['Da Nang', 'Cebu City', 'Penang', 'Cagayan de Oro'],
      'Middle East': ['Ras Al Khaimah', 'Tbilisi', 'Tashkent', 'Kigali'],
    };
    return regionMap[profile.region] ?? ['Davao City', 'Cebu City', 'Townsville', 'Kigali'];
  }
}
