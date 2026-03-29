/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * GLOBAL CITY INDEX
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Standardised scoring and ranking system for cities worldwide. Aggregates
 * multiple dimensions: economic, talent, infrastructure, governance, lifestyle,
 * innovation, cost â€" into a single composite index with sector-weighted variants.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface CityIndexEntry {
  cityId: string;
  city: string;
  country: string;
  region: string;
  population: number;
  dimensions: {
    economic: number;       // GDP growth, FDI inflows, business formation rate
    talent: number;         // University density, STEM graduates, English proficiency
    infrastructure: number; // Internet speed, power reliability, transport, port/airport
    governance: number;     // Ease of doing business, corruption index, regulatory quality
    lifestyle: number;      // Safety, healthcare, education, cultural amenities
    innovation: number;     // R&D spend, patents, startup ecosystem, tech adoption
    cost: number;           // Operating costs, labor costs, real estate (inverted â€" lower=better value)
  };
  compositeScore: number;
  tier: 'alpha' | 'beta' | 'gamma' | 'delta' | 'emerging';
  highlights: string[];
  risks: string[];
}

export interface SectorWeights {
  economic: number;
  talent: number;
  infrastructure: number;
  governance: number;
  lifestyle: number;
  innovation: number;
  cost: number;
}

// â"€â"€â"€ City Database â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const CITY_INDEX: CityIndexEntry[] = [
  { cityId: 'singapore', city: 'Singapore', country: 'Singapore', region: 'Southeast Asia', population: 5900000, dimensions: { economic: 95, talent: 90, infrastructure: 97, governance: 96, lifestyle: 88, innovation: 92, cost: 35 }, compositeScore: 0, tier: 'alpha', highlights: ['World #1 ease of doing business', 'Stable government', 'Regional HQ hub'], risks: ['Extremely high costs', 'Small domestic market', 'Restrictive labor market for foreign workers'] },
  { cityId: 'dubai', city: 'Dubai', country: 'UAE', region: 'Middle East', population: 3500000, dimensions: { economic: 88, talent: 72, infrastructure: 92, governance: 85, lifestyle: 82, innovation: 78, cost: 50 }, compositeScore: 0, tier: 'alpha', highlights: ['Zero corporate tax (most sectors)', 'World-class infrastructure', 'Global connectivity'], risks: ['High real estate costs', 'Summer heat limits outdoor work', 'Visa complexity'] },
  { cityId: 'ho-chi-minh', city: 'Ho Chi Minh City', country: 'Vietnam', region: 'Southeast Asia', population: 9000000, dimensions: { economic: 82, talent: 68, infrastructure: 58, governance: 55, lifestyle: 60, innovation: 62, cost: 82 }, compositeScore: 0, tier: 'beta', highlights: ['Fastest-growing large economy', 'Young workforce', 'Manufacturing hub'], risks: ['Infrastructure still developing', 'Bureaucratic complexity', 'IP protection concerns'] },
  { cityId: 'cebu-city', city: 'Cebu City', country: 'Philippines', region: 'Southeast Asia', population: 960000, dimensions: { economic: 72, talent: 75, infrastructure: 62, governance: 65, lifestyle: 72, innovation: 55, cost: 85 }, compositeScore: 0, tier: 'beta', highlights: ['IT-BPO hub with 175K+ workers', 'Strong English proficiency', 'World-class lifestyle'], risks: ['Traffic congestion', 'Typhoon exposure', 'Water supply challenges'] },
  { cityId: 'davao-city', city: 'Davao City', country: 'Philippines', region: 'Southeast Asia', population: 1800000, dimensions: { economic: 68, talent: 70, infrastructure: 60, governance: 72, lifestyle: 70, innovation: 48, cost: 88 }, compositeScore: 0, tier: 'gamma', highlights: ['Investor-friendly governance', 'Lower costs than Cebu/Manila', 'Growing BPO sector'], risks: ['Limited international flights', 'Smaller talent pool', 'Distance from capital'] },
  { cityId: 'pagadian-city', city: 'Pagadian City', country: 'Philippines', region: 'Southeast Asia', population: 200000, dimensions: { economic: 42, talent: 45, infrastructure: 38, governance: 55, lifestyle: 50, innovation: 25, cost: 95 }, compositeScore: 0, tier: 'emerging', highlights: ['Lowest cost location', 'Pro-investment mayor', 'Untapped workforce'], risks: ['Limited infrastructure', 'Small talent pool', 'Brain drain to larger cities'] },
  { cityId: 'townsville', city: 'Townsville', country: 'Australia', region: 'Oceania', population: 180000, dimensions: { economic: 58, talent: 55, infrastructure: 68, governance: 82, lifestyle: 70, innovation: 45, cost: 60 }, compositeScore: 0, tier: 'gamma', highlights: ['Defence & resources anchor', 'JCU research partnerships', 'Port expansion'], risks: ['Small labor market', 'Cyclone risk', 'Distance from major cities'] },
  { cityId: 'darwin', city: 'Darwin', country: 'Australia', region: 'Oceania', population: 150000, dimensions: { economic: 55, talent: 42, infrastructure: 62, governance: 80, lifestyle: 60, innovation: 38, cost: 55 }, compositeScore: 0, tier: 'delta', highlights: ['ASEAN gateway', 'Government co-investment', 'Abundant land'], risks: ['Very small labor market', 'Isolation', 'Extreme climate'] },
  { cityId: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Southeast Asia', population: 1800000, dimensions: { economic: 78, talent: 72, infrastructure: 80, governance: 72, lifestyle: 75, innovation: 68, cost: 72 }, compositeScore: 0, tier: 'beta', highlights: ['MSC Malaysia incentives', 'Multicultural workforce', 'Strong infrastructure'], risks: ['Political uncertainty', 'Talent competition from Singapore', 'Bureaucratic layers'] },
  { cityId: 'bangkok', city: 'Bangkok', country: 'Thailand', region: 'Southeast Asia', population: 10500000, dimensions: { economic: 75, talent: 65, infrastructure: 72, governance: 58, lifestyle: 72, innovation: 60, cost: 75 }, compositeScore: 0, tier: 'beta', highlights: ['Large consumer market', 'Manufacturing base', 'Tourism infrastructure'], risks: ['Political instability history', 'Traffic/flooding', 'English proficiency gaps'] },
  { cityId: 'jakarta', city: 'Jakarta', country: 'Indonesia', region: 'Southeast Asia', population: 11000000, dimensions: { economic: 80, talent: 62, infrastructure: 55, governance: 52, lifestyle: 55, innovation: 58, cost: 78 }, compositeScore: 0, tier: 'beta', highlights: ['Largest ASEAN economy', 'Young demographic dividend', 'Unicorn ecosystem'], risks: ['Flooding/sinking', 'Bureaucracy', 'Capital moving to Nusantara'] },
  { cityId: 'auckland', city: 'Auckland', country: 'New Zealand', region: 'Oceania', population: 1700000, dimensions: { economic: 72, talent: 75, infrastructure: 78, governance: 90, lifestyle: 88, innovation: 65, cost: 45 }, compositeScore: 0, tier: 'beta', highlights: ['Excellent governance', 'Quality of life', 'Tech sector growing'], risks: ['High costs', 'Small domestic market', 'Geographic isolation'] },
  { cityId: 'pune', city: 'Pune', country: 'India', region: 'South Asia', population: 7400000, dimensions: { economic: 78, talent: 82, infrastructure: 58, governance: 55, lifestyle: 60, innovation: 75, cost: 88 }, compositeScore: 0, tier: 'beta', highlights: ['IT capital of India (after Bangalore)', 'Massive talent pool', 'Automotive hub'], risks: ['Infrastructure gaps', 'Traffic/air quality', 'Regulatory complexity'] },
  { cityId: 'kigali', city: 'Kigali', country: 'Rwanda', region: 'East Africa', population: 1200000, dimensions: { economic: 62, talent: 45, infrastructure: 55, governance: 78, lifestyle: 58, innovation: 48, cost: 85 }, compositeScore: 0, tier: 'emerging', highlights: ['Africa\'s cleanest city', 'Visionary leadership', 'Growing tech hub'], risks: ['Small market', 'Limited talent pipeline', 'Landlocked'] },
  { cityId: 'lisbon', city: 'Lisbon', country: 'Portugal', region: 'Europe', population: 550000, dimensions: { economic: 68, talent: 72, infrastructure: 78, governance: 80, lifestyle: 85, innovation: 72, cost: 65 }, compositeScore: 0, tier: 'beta', highlights: ['EU market access', 'Startup visa', 'Quality of life'], risks: ['Small domestic market', 'Salary inflation in tech', 'Housing crisis'] },
  { cityId: 'medellin', city: 'MedellÃ­n', country: 'Colombia', region: 'Latin America', population: 2500000, dimensions: { economic: 65, talent: 62, infrastructure: 65, governance: 58, lifestyle: 70, innovation: 60, cost: 82 }, compositeScore: 0, tier: 'gamma', highlights: ['Innovation transformation story', 'Lower costs than LATAM peers', 'Spring-like climate'], risks: ['Security perception', 'Bureaucracy', 'Currency volatility'] },
];

// â"€â"€â"€ Compute composite scores â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const DEFAULT_WEIGHTS: SectorWeights = { economic: 0.20, talent: 0.20, infrastructure: 0.15, governance: 0.15, lifestyle: 0.10, innovation: 0.10, cost: 0.10 };

function computeComposite(dims: CityIndexEntry['dimensions'], weights: SectorWeights): number {
  return Math.round(
    dims.economic * weights.economic +
    dims.talent * weights.talent +
    dims.infrastructure * weights.infrastructure +
    dims.governance * weights.governance +
    dims.lifestyle * weights.lifestyle +
    dims.innovation * weights.innovation +
    dims.cost * weights.cost
  );
}

// Initialize default scores
for (const c of CITY_INDEX) {
  c.compositeScore = computeComposite(c.dimensions, DEFAULT_WEIGHTS);
}

// â"€â"€â"€ Sector weight presets â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const SECTOR_PRESETS: Record<string, SectorWeights> = {
  'it-bpo': { economic: 0.10, talent: 0.30, infrastructure: 0.20, governance: 0.10, lifestyle: 0.05, innovation: 0.10, cost: 0.15 },
  'manufacturing': { economic: 0.15, talent: 0.15, infrastructure: 0.25, governance: 0.15, lifestyle: 0.05, innovation: 0.05, cost: 0.20 },
  'fintech': { economic: 0.15, talent: 0.25, infrastructure: 0.15, governance: 0.20, lifestyle: 0.05, innovation: 0.15, cost: 0.05 },
  'headquarters': { economic: 0.20, talent: 0.15, infrastructure: 0.15, governance: 0.20, lifestyle: 0.15, innovation: 0.10, cost: 0.05 },
  'rd-innovation': { economic: 0.10, talent: 0.25, infrastructure: 0.10, governance: 0.10, lifestyle: 0.10, innovation: 0.30, cost: 0.05 },
  'cost-center': { economic: 0.10, talent: 0.15, infrastructure: 0.10, governance: 0.10, lifestyle: 0.05, innovation: 0.05, cost: 0.45 },
};

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class GlobalCityIndex {

  /** Get the full city index ranked by composite score */
  static getRankings(weights?: SectorWeights): CityIndexEntry[] {
    const w = weights || DEFAULT_WEIGHTS;
    const entries = CITY_INDEX.map(c => ({ ...c, compositeScore: computeComposite(c.dimensions, w) }));
    return entries.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  /** Get rankings for a specific industry sector */
  static getRankingsBySector(sector: string): CityIndexEntry[] {
    const weights = SECTOR_PRESETS[sector.toLowerCase()] || DEFAULT_WEIGHTS;
    return this.getRankings(weights);
  }

  /** Get a specific city's index entry */
  static getCity(cityId: string): CityIndexEntry | null {
    return CITY_INDEX.find(c => c.cityId === cityId) || null;
  }

  /** Get cities by region */
  static getByRegion(region: string): CityIndexEntry[] {
    return CITY_INDEX.filter(c => c.region.toLowerCase() === region.toLowerCase())
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }

  /** Get cities by tier */
  static getByTier(tier: CityIndexEntry['tier']): CityIndexEntry[] {
    return CITY_INDEX.filter(c => c.tier === tier)
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }

  /** Compare two or more cities side by side */
  static compare(cityIds: string[], sector?: string): {
    cities: Array<CityIndexEntry & { rank: number }>;
    winner: string;
    analysis: string;
  } {
    const weights = sector ? (SECTOR_PRESETS[sector.toLowerCase()] || DEFAULT_WEIGHTS) : DEFAULT_WEIGHTS;
    const all = this.getRankings(weights);
    const cities = cityIds.map(id => {
      const idx = all.findIndex(c => c.cityId === id);
      const city = all[idx];
      return city ? { ...city, rank: idx + 1 } : null;
    }).filter(Boolean) as Array<CityIndexEntry & { rank: number }>;
    cities.sort((a, b) => a.rank - b.rank);
    const winner = cities[0];
    return {
      cities,
      winner: winner?.city || 'Unknown',
      analysis: cities.length >= 2
        ? `${cities[0].city} (rank #${cities[0].rank}, score ${cities[0].compositeScore}) outperforms ${cities[1].city} (rank #${cities[1].rank}, score ${cities[1].compositeScore}). Key differentiators: ${Object.entries(cities[0].dimensions).filter(([k]) => (cities[0].dimensions as Record<string, number>)[k] - (cities[1].dimensions as Record<string, number>)[k] > 10).map(([k]) => k).join(', ') || 'marginal across all dimensions'}.`
        : 'Insufficient cities for comparison.',
    };
  }

  /** Top N recommendations for a given sector */
  static recommend(sector: string, topN: number = 5, region?: string): CityIndexEntry[] {
    let ranked = this.getRankingsBySector(sector);
    if (region) ranked = ranked.filter(c => c.region.toLowerCase() === region.toLowerCase());
    return ranked.slice(0, topN);
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(sector?: string, topN: number = 5): string {
    const ranked = sector ? this.getRankingsBySector(sector) : this.getRankings();
    const top = ranked.slice(0, topN);
    const lines: string[] = [`\n### â"€â"€ GLOBAL CITY INDEX${sector ? ` (${sector.toUpperCase()})` : ''} â"€â"€`];
    top.forEach((c, i) => {
      lines.push(`**#${i + 1} ${c.city}, ${c.country}** â€" Score: ${c.compositeScore} | Tier: ${c.tier.toUpperCase()}`);
      lines.push(`  Eco:${c.dimensions.economic} Tal:${c.dimensions.talent} Infra:${c.dimensions.infrastructure} Gov:${c.dimensions.governance} Life:${c.dimensions.lifestyle} Innov:${c.dimensions.innovation} Cost:${c.dimensions.cost}`);
      lines.push(`  âœ… ${c.highlights[0]} | âš ï¸ ${c.risks[0]}`);
    });
    return lines.join('\n');
  }
}
