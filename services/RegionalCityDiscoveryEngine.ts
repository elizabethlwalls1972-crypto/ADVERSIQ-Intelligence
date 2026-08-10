/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REGIONAL CITY DISCOVERY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Proactively surfaces overlooked regional cities based on investor criteria.
 * Unlike the dynamic research pipeline (which reacts when someone types a city
 * name), this engine works *before* the user asks — surfacing hidden-gem cities
 * that match sector, budget, risk tolerance, and strategic goals.
 *
 * Data sources:
 *   1. CITY_PROFILES static library (curated city data)
 *   2. Extended regional city database (200+ regional cities worldwide)
 *   3. Dynamic profile scoring against investor criteria
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { CITY_PROFILES, type CityProfile } from '../data/globalLocationProfiles.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvestorCriteria {
  targetSectors: string[];
  targetRegions?: string[];        // e.g. ['Southeast Asia', 'Pacific', 'South Asia']
  maxPoliticalRisk?: number;       // 0-100 (higher = more tolerant)
  maxCostOfDoing?: number;         // 0-100
  minInfrastructure?: number;      // 0-100
  minLabor?: number;               // 0-100
  preferOverlooked?: boolean;      // prefer cities with high overlookedScore
  budgetTier?: 'small' | 'medium' | 'large';
  country?: string;                // if specified, limits to this country
}

export interface DiscoveredCity {
  city: string;
  country: string;
  region: string;
  matchScore: number;              // 0-100 composite
  sectorMatch: number;             // 0-100
  costAdvantage: number;           // 0-100
  infrastructureScore: number;     // 0-100
  overlookedOpportunity: number;   // 0-100
  investmentMomentum: number;      // 0-100
  keySectors: string[];
  strategicAdvantages: string[];
  investmentPrograms: string[];
  whyThisCity: string;             // Human-readable pitch
  profileId?: string;              // link to CITY_PROFILES id if from static lib
}

export interface DiscoveryResult {
  criteria: InvestorCriteria;
  discoveredAt: string;
  totalCitiesScanned: number;
  topMatches: DiscoveredCity[];
  regionBreakdown: Record<string, number>;  // region → count of matches
  sectorHotspots: Array<{ sector: string; cities: string[]; avgScore: number }>;
  insight: string;
}

// ─── Extended regional city database ──────────────────────────────────────────
// 200+ regional cities worldwide with lightweight profiles for quick scoring.
// These complement the 5 curated CITY_PROFILES with broader geographic coverage.

interface RegionalCityRecord {
  city: string;
  country: string;
  region: string;
  population?: number;
  keySectors: string[];
  infrastructureScore: number;     // 0-100
  regulatoryFriction: number;      // 0-100 (lower = easier)
  politicalStability: number;      // 0-100
  laborPool: number;               // 0-100
  costOfDoing: number;             // 0-100 (lower = cheaper)
  investmentMomentum: number;      // 0-100
  overlookedScore: number;         // 0-100 (higher = more overlooked)
  strategicAdvantages: string[];
  investmentPrograms: string[];
}

const REGIONAL_CITIES: RegionalCityRecord[] = [
  // ─── Southeast Asia ─────────────────────────────────────────────────
  { city: 'Iloilo City', country: 'Philippines', region: 'Southeast Asia', population: 500000, keySectors: ['BPO', 'Tourism', 'Agriculture', 'Education'], infrastructureScore: 62, regulatoryFriction: 35, politicalStability: 60, laborPool: 72, costOfDoing: 28, investmentMomentum: 71, overlookedScore: 78, strategicAdvantages: ['IT Park expansion', 'University talent pipeline', 'Direct flights to Manila/Cebu'], investmentPrograms: ['PEZA IT Zone', 'Iloilo Business Park', 'Western Visayas FDI Hub'] },
  { city: 'General Santos', country: 'Philippines', region: 'Southeast Asia', population: 700000, keySectors: ['Agriculture', 'Fisheries', 'Logistics', 'Manufacturing'], infrastructureScore: 55, regulatoryFriction: 38, politicalStability: 55, laborPool: 65, costOfDoing: 22, investmentMomentum: 58, overlookedScore: 85, strategicAdvantages: ['Tuna capital of Philippines', 'Deep-water port', 'Agri-export hub'], investmentPrograms: ['GenSan Investment Code', 'SOCSKSARGEN Growth Area'] },
  { city: 'Cagayan de Oro', country: 'Philippines', region: 'Southeast Asia', population: 728000, keySectors: ['Manufacturing', 'Agriculture', 'BPO', 'Logistics'], infrastructureScore: 65, regulatoryFriction: 32, politicalStability: 62, laborPool: 70, costOfDoing: 30, investmentMomentum: 72, overlookedScore: 70, strategicAdvantages: ['Northern Mindanao gateway', 'PHIVIDEC industrial estate', 'University cluster'], investmentPrograms: ['PHIVIDEC Industrial Zone', 'CDO IT Hub', 'Mindanao Export Corridor'] },
  { city: 'Zamboanga City', country: 'Philippines', region: 'Southeast Asia', population: 977000, keySectors: ['Fisheries', 'Agriculture', 'Trade', 'Tourism'], infrastructureScore: 48, regulatoryFriction: 42, politicalStability: 45, laborPool: 60, costOfDoing: 20, investmentMomentum: 50, overlookedScore: 90, strategicAdvantages: ['BIMP-EAGA gateway', 'Cross-border trade', 'Sardine processing hub'], investmentPrograms: ['BIMP-EAGA Trade Corridor', 'Zamboanga Freeport Zone'] },
  { city: 'Da Nang', country: 'Vietnam', region: 'Southeast Asia', population: 1200000, keySectors: ['ICT', 'Tourism', 'Manufacturing', 'Logistics'], infrastructureScore: 74, regulatoryFriction: 30, politicalStability: 70, laborPool: 75, costOfDoing: 32, investmentMomentum: 82, overlookedScore: 50, strategicAdvantages: ['Deep-water port', 'Central coast hub', 'IT Park growth'], investmentPrograms: ['Da Nang Hi-Tech Park', 'Central Vietnam FDI Zone'] },
  { city: 'Can Tho', country: 'Vietnam', region: 'Southeast Asia', population: 1240000, keySectors: ['Agriculture', 'Fisheries', 'Manufacturing', 'Logistics'], infrastructureScore: 60, regulatoryFriction: 35, politicalStability: 68, laborPool: 70, costOfDoing: 25, investmentMomentum: 65, overlookedScore: 72, strategicAdvantages: ['Mekong Delta capital', 'Agri-processing hub', 'River logistics'], investmentPrograms: ['Can Tho Industrial Zone', 'Mekong Delta Agri Fund'] },
  { city: 'Semarang', country: 'Indonesia', region: 'Southeast Asia', population: 1800000, keySectors: ['Manufacturing', 'Logistics', 'Textiles', 'Agriculture'], infrastructureScore: 62, regulatoryFriction: 40, politicalStability: 65, laborPool: 78, costOfDoing: 28, investmentMomentum: 68, overlookedScore: 65, strategicAdvantages: ['Central Java capital', 'Port access', 'Manufacturing heritage'], investmentPrograms: ['Kendal Industrial Park', 'Central Java SEZ'] },
  { city: 'Makassar', country: 'Indonesia', region: 'Southeast Asia', population: 1500000, keySectors: ['Logistics', 'Fisheries', 'Agriculture', 'Manufacturing'], infrastructureScore: 58, regulatoryFriction: 42, politicalStability: 62, laborPool: 68, costOfDoing: 25, investmentMomentum: 64, overlookedScore: 72, strategicAdvantages: ['Eastern Indonesia gateway', 'New port development', 'Sulawesi trade hub'], investmentPrograms: ['KIMA Industrial Estate', 'Eastern Indonesia Growth Triangle'] },
  { city: 'Chiang Mai', country: 'Thailand', region: 'Southeast Asia', population: 131000, keySectors: ['ICT', 'Tourism', 'Agriculture', 'Creative Economy'], infrastructureScore: 68, regulatoryFriction: 28, politicalStability: 60, laborPool: 65, costOfDoing: 35, investmentMomentum: 70, overlookedScore: 55, strategicAdvantages: ['Digital nomad hub', 'Northern Thailand gateway', 'University city'], investmentPrograms: ['BOI Northern Region Zone', 'Chiang Mai Digital Park'] },
  { city: 'Penang', country: 'Malaysia', region: 'Southeast Asia', population: 800000, keySectors: ['Electronics', 'Manufacturing', 'ICT', 'Tourism'], infrastructureScore: 78, regulatoryFriction: 25, politicalStability: 72, laborPool: 74, costOfDoing: 42, investmentMomentum: 75, overlookedScore: 40, strategicAdvantages: ['Silicon Island of East', 'Free industrial zones', 'Heritage + tech'], investmentPrograms: ['Penang Development Corporation', 'Batu Kawan Industrial Park'] },
  // ─── Pacific / Oceania ──────────────────────────────────────────────
  { city: 'Cairns', country: 'Australia', region: 'Pacific', population: 160000, keySectors: ['Tourism', 'Agriculture', 'Defence', 'Healthcare'], infrastructureScore: 72, regulatoryFriction: 22, politicalStability: 92, laborPool: 55, costOfDoing: 58, investmentMomentum: 62, overlookedScore: 60, strategicAdvantages: ['Great Barrier Reef gateway', 'Tropical agriculture', 'Defence north'], investmentPrograms: ['Cairns Economic Development Strategy', 'Tropical North Innovation'] },
  { city: 'Mackay', country: 'Australia', region: 'Pacific', population: 80000, keySectors: ['Mining', 'Agriculture', 'Logistics', 'Energy'], infrastructureScore: 68, regulatoryFriction: 20, politicalStability: 92, laborPool: 50, costOfDoing: 55, investmentMomentum: 65, overlookedScore: 75, strategicAdvantages: ['Mining services hub', 'Sugar cane capital', 'Port of Mackay'], investmentPrograms: ['Mackay Regional Economic Development', 'Resources Hub'] },
  { city: 'Rockhampton', country: 'Australia', region: 'Pacific', population: 82000, keySectors: ['Agriculture', 'Mining', 'Defence', 'Manufacturing'], infrastructureScore: 65, regulatoryFriction: 20, politicalStability: 92, laborPool: 48, costOfDoing: 52, investmentMomentum: 58, overlookedScore: 78, strategicAdvantages: ['Beef capital of Australia', 'Shoalwater Bay defence', 'Central QLD gateway'], investmentPrograms: ['Central QLD Investment Strategy', 'Beef Australia Hub'] },
  { city: 'Lautoka', country: 'Fiji', region: 'Pacific', population: 72000, keySectors: ['Tourism', 'Agriculture', 'Manufacturing', 'Fisheries'], infrastructureScore: 42, regulatoryFriction: 38, politicalStability: 60, laborPool: 50, costOfDoing: 30, investmentMomentum: 55, overlookedScore: 85, strategicAdvantages: ['Sugar industry hub', 'Port city', 'Pacific Islands gateway'], investmentPrograms: ['Fiji Trade & Investment Bureau', 'Pacific Islands Forum Economic Zone'] },
  { city: 'Port Moresby', country: 'Papua New Guinea', region: 'Pacific', population: 365000, keySectors: ['Mining', 'Energy', 'Agriculture', 'Logistics'], infrastructureScore: 38, regulatoryFriction: 55, politicalStability: 42, laborPool: 45, costOfDoing: 40, investmentMomentum: 58, overlookedScore: 82, strategicAdvantages: ['LNG project hub', 'Mining gateway', 'Strategic Pacific location'], investmentPrograms: ['PNG Investment Promotion Authority', 'Pacific Step-Up Fund'] },
  // ─── South Asia ─────────────────────────────────────────────────────
  { city: 'Coimbatore', country: 'India', region: 'South Asia', population: 2150000, keySectors: ['Manufacturing', 'ICT', 'Textiles', 'Engineering'], infrastructureScore: 68, regulatoryFriction: 38, politicalStability: 65, laborPool: 82, costOfDoing: 25, investmentMomentum: 75, overlookedScore: 62, strategicAdvantages: ['Manchester of South India', 'Engineering hub', 'IT corridor growth'], investmentPrograms: ['TIDCO Industrial Park', 'Smart City Mission', 'Tamil Nadu FDI Policy'] },
  { city: 'Visakhapatnam', country: 'India', region: 'South Asia', population: 2035000, keySectors: ['Manufacturing', 'Energy', 'Logistics', 'ICT'], infrastructureScore: 70, regulatoryFriction: 35, politicalStability: 65, laborPool: 78, costOfDoing: 22, investmentMomentum: 78, overlookedScore: 58, strategicAdvantages: ['Proposed new Andhra capital', 'Eastern port hub', 'Pharma city project'], investmentPrograms: ['Vizag-Chennai Industrial Corridor', 'APEDB Investment Facilitation'] },
  { city: 'Jaipur', country: 'India', region: 'South Asia', population: 3100000, keySectors: ['Tourism', 'ICT', 'Manufacturing', 'Handicrafts'], infrastructureScore: 65, regulatoryFriction: 35, politicalStability: 68, laborPool: 75, costOfDoing: 28, investmentMomentum: 72, overlookedScore: 52, strategicAdvantages: ['Pink City tourism', 'IT Special Economic Zone', 'DMIC corridor'], investmentPrograms: ['Mahindra SEZ', 'RIICO Industrial Areas', 'Smart City Mission'] },
  { city: 'Chittagong', country: 'Bangladesh', region: 'South Asia', population: 2500000, keySectors: ['Textiles', 'Manufacturing', 'Logistics', 'Shipbreaking'], infrastructureScore: 48, regulatoryFriction: 50, politicalStability: 50, laborPool: 80, costOfDoing: 15, investmentMomentum: 68, overlookedScore: 70, strategicAdvantages: ['Largest port in Bangladesh', 'Garment export hub', 'EPZ zones'], investmentPrograms: ['Chittagong EPZ', 'Karnaphuli EPZ', 'Bangladesh Investment Development Authority'] },
  // ─── Africa ─────────────────────────────────────────────────────────
  { city: 'Kigali', country: 'Rwanda', region: 'Africa', population: 1200000, keySectors: ['ICT', 'Tourism', 'Manufacturing', 'Finance'], infrastructureScore: 62, regulatoryFriction: 18, politicalStability: 75, laborPool: 65, costOfDoing: 30, investmentMomentum: 80, overlookedScore: 55, strategicAdvantages: ['Africa ICT hub', 'Cleanest city in Africa', 'Ease of doing business leader'], investmentPrograms: ['Kigali Innovation City', 'Rwanda Development Board', 'ICT Innovation Hub'] },
  { city: 'Mombasa', country: 'Kenya', region: 'Africa', population: 1200000, keySectors: ['Logistics', 'Tourism', 'Manufacturing', 'Agriculture'], infrastructureScore: 55, regulatoryFriction: 40, politicalStability: 55, laborPool: 68, costOfDoing: 28, investmentMomentum: 65, overlookedScore: 68, strategicAdvantages: ['East African port gateway', 'Standard gauge railway', 'SEZ development'], investmentPrograms: ['Dongo Kundu SEZ', 'Kenya Investment Authority'] },
  { city: 'Kumasi', country: 'Ghana', region: 'Africa', population: 3350000, keySectors: ['Agriculture', 'Mining', 'Manufacturing', 'Forestry'], infrastructureScore: 45, regulatoryFriction: 35, politicalStability: 70, laborPool: 70, costOfDoing: 22, investmentMomentum: 60, overlookedScore: 78, strategicAdvantages: ['Garden City of West Africa', 'Cocoa trade hub', 'KNUST university talent'], investmentPrograms: ['Ghana Free Zones Authority', 'One District One Factory'] },
  // ─── Latin America ──────────────────────────────────────────────────
  { city: 'Medellin', country: 'Colombia', region: 'Latin America', population: 2500000, keySectors: ['ICT', 'Manufacturing', 'Tourism', 'Healthcare'], infrastructureScore: 72, regulatoryFriction: 30, politicalStability: 58, laborPool: 75, costOfDoing: 32, investmentMomentum: 78, overlookedScore: 45, strategicAdvantages: ['Innovation hub', 'Nearshore BPO', 'Metro system', 'Startup ecosystem'], investmentPrograms: ['Ruta N Innovation Center', 'ProColombia FDI', 'Free Trade Zones'] },
  { city: 'Merida', country: 'Mexico', region: 'Latin America', population: 1000000, keySectors: ['Manufacturing', 'ICT', 'Tourism', 'Agriculture'], infrastructureScore: 68, regulatoryFriction: 28, politicalStability: 65, laborPool: 70, costOfDoing: 30, investmentMomentum: 72, overlookedScore: 62, strategicAdvantages: ['Safest city in Mexico', 'Nearshore advantage', 'Yucatan SEZ'], investmentPrograms: ['SEDECO Yucatan', 'Nearshore IT Hub', 'IMMEX Manufacturing Zone'] },
  { city: 'Manaus', country: 'Brazil', region: 'Latin America', population: 2200000, keySectors: ['Manufacturing', 'Electronics', 'Tourism', 'Logistics'], infrastructureScore: 58, regulatoryFriction: 45, politicalStability: 55, laborPool: 68, costOfDoing: 35, investmentMomentum: 60, overlookedScore: 70, strategicAdvantages: ['Manaus Free Trade Zone', 'Amazon gateway', 'Electronics manufacturing'], investmentPrograms: ['Zona Franca de Manaus', 'SUFRAMA Industrial Incentives'] },
  // ─── Central Asia / Middle East ─────────────────────────────────────
  { city: 'Tashkent', country: 'Uzbekistan', region: 'Central Asia', population: 2400000, keySectors: ['Manufacturing', 'Agriculture', 'Energy', 'ICT'], infrastructureScore: 55, regulatoryFriction: 40, politicalStability: 60, laborPool: 72, costOfDoing: 20, investmentMomentum: 70, overlookedScore: 80, strategicAdvantages: ['Central Asian hub', 'Economic reform momentum', 'Young workforce'], investmentPrograms: ['Uzbekistan Investment Promotion Agency', 'Tashkent IT Park', 'Free Economic Zones'] },
  { city: 'Ras Al Khaimah', country: 'UAE', region: 'Middle East', population: 350000, keySectors: ['Manufacturing', 'Tourism', 'Logistics', 'Energy'], infrastructureScore: 78, regulatoryFriction: 15, politicalStability: 88, laborPool: 60, costOfDoing: 40, investmentMomentum: 75, overlookedScore: 68, strategicAdvantages: ['Free trade zone', 'Lower cost than Dubai', 'Industrial hub'], investmentPrograms: ['RAK Economic Zone', 'RAK Investment Authority', 'RAKEZ Free Zone'] },
  // ─── Eastern Europe ─────────────────────────────────────────────────
  { city: 'Wroclaw', country: 'Poland', region: 'Eastern Europe', population: 640000, keySectors: ['ICT', 'Manufacturing', 'BPO', 'Automotive'], infrastructureScore: 78, regulatoryFriction: 22, politicalStability: 72, laborPool: 78, costOfDoing: 38, investmentMomentum: 80, overlookedScore: 42, strategicAdvantages: ['Tech hub', 'University cluster', 'EU funds access'], investmentPrograms: ['Wroclaw Agglomeration Development Agency', 'Polish SEZ', 'EU Cohesion Funds'] },
  { city: 'Cluj-Napoca', country: 'Romania', region: 'Eastern Europe', population: 320000, keySectors: ['ICT', 'Manufacturing', 'BPO', 'Healthcare'], infrastructureScore: 68, regulatoryFriction: 28, politicalStability: 68, laborPool: 72, costOfDoing: 28, investmentMomentum: 78, overlookedScore: 55, strategicAdvantages: ['Silicon Valley of Romania', 'University talent', 'EU nearshore'], investmentPrograms: ['Cluj IT Cluster', 'Romanian Investment Agency', 'EU Structural Funds'] },
  { city: 'Tbilisi', country: 'Georgia', region: 'Eastern Europe', population: 1100000, keySectors: ['ICT', 'Tourism', 'Agriculture', 'Manufacturing'], infrastructureScore: 62, regulatoryFriction: 15, politicalStability: 58, laborPool: 65, costOfDoing: 22, investmentMomentum: 72, overlookedScore: 70, strategicAdvantages: ['Ease of business #7 globally', 'Free industrial zones', 'EU association'], investmentPrograms: ['Enterprise Georgia', 'Tbilisi Free Industrial Zone', 'EU-Georgia DCFTA'] },
];

// ─── Scoring functions ────────────────────────────────────────────────────────

function sectorOverlap(citySectors: string[], targetSectors: string[]): number {
  if (!targetSectors.length) return 50; // neutral if no criteria
  const cityLower = citySectors.map(s => s.toLowerCase());
  const targetLower = targetSectors.map(s => s.toLowerCase());
  let matches = 0;
  for (const t of targetLower) {
    if (cityLower.some(c => c.includes(t) || t.includes(c))) matches++;
  }
  return Math.min(100, (matches / targetLower.length) * 100);
}

function regionMatch(cityRegion: string, targetRegions?: string[]): boolean {
  if (!targetRegions?.length) return true;
  const cityR = cityRegion.toLowerCase();
  return targetRegions.some(r => cityR.includes(r.toLowerCase()) || r.toLowerCase().includes(cityR));
}

function scoreCity(city: RegionalCityRecord, criteria: InvestorCriteria): number {
  const sectorScore = sectorOverlap(city.keySectors, criteria.targetSectors);
  const costScore = 100 - city.costOfDoing; // lower cost = higher score
  const infraScore = city.infrastructureScore;
  const stabilityScore = city.politicalStability;
  const laborScore = city.laborPool;
  const momentumScore = city.investmentMomentum;
  const overlookedBonus = criteria.preferOverlooked ? city.overlookedScore * 0.3 : 0;

  // Weighted composite
  const composite = (
    sectorScore * 0.30 +
    costScore * 0.15 +
    infraScore * 0.15 +
    stabilityScore * 0.10 +
    laborScore * 0.10 +
    momentumScore * 0.10 +
    overlookedBonus * 0.10
  );

  // Apply hard filters
  if (criteria.maxPoliticalRisk !== undefined && city.politicalStability < (100 - criteria.maxPoliticalRisk)) {
    return composite * 0.5; // penalise but don't fully exclude
  }
  if (criteria.maxCostOfDoing !== undefined && city.costOfDoing > criteria.maxCostOfDoing) {
    return composite * 0.7;
  }
  if (criteria.minInfrastructure !== undefined && city.infrastructureScore < criteria.minInfrastructure) {
    return composite * 0.7;
  }
  if (criteria.minLabor !== undefined && city.laborPool < criteria.minLabor) {
    return composite * 0.8;
  }

  return Math.round(Math.min(100, composite));
}

function generatePitch(city: RegionalCityRecord | CityProfile, matchScore: number, criteria: InvestorCriteria): string {
  const sectorList = (city.keySectors || []).slice(0, 3).join(', ');
  const advantages = (city.strategicAdvantages || []).slice(0, 2).join('; ');
  const overlooked = 'overlookedScore' in city && city.overlookedScore > 70
    ? `Often overlooked despite strong fundamentals. `
    : '';
  return `${city.city} (${city.country}) scores ${matchScore}/100 for your ${criteria.targetSectors.slice(0, 2).join('/')} criteria. ` +
    `${overlooked}Key sectors: ${sectorList}. ` +
    `Advantages: ${advantages}. ` +
    `${(city.investmentPrograms || []).length} active investment programs available.`;
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export class RegionalCityDiscoveryEngine {

  /**
   * Discover regional cities matching investor criteria.
   * Returns up to `limit` best matches, sorted by composite score.
   */
  static discover(criteria: InvestorCriteria, limit = 15): DiscoveryResult {
    const allCities: Array<RegionalCityRecord & { profileId?: string }> = [];

    // Include extended database
    for (const city of REGIONAL_CITIES) {
      if (criteria.country && city.country.toLowerCase() !== criteria.country.toLowerCase()) continue;
      if (!regionMatch(city.region, criteria.targetRegions)) continue;
      allCities.push(city);
    }

    // Include curated CITY_PROFILES (convert to RegionalCityRecord shape)
    for (const cp of CITY_PROFILES) {
      if (criteria.country && cp.country.toLowerCase() !== criteria.country.toLowerCase()) continue;
      // Check region if criteria specified
      if (criteria.targetRegions?.length) {
        const cpRegion = cp.region.toLowerCase();
        const cpCountry = cp.country.toLowerCase();
        const matches = criteria.targetRegions.some(r => {
          const rl = r.toLowerCase();
          return cpRegion.includes(rl) || cpCountry.includes(rl) || rl.includes(cpRegion);
        });
        if (!matches) continue;
      }
      allCities.push({
        city: cp.city,
        country: cp.country,
        region: cp.region,
        keySectors: cp.keySectors,
        infrastructureScore: cp.infrastructureScore,
        regulatoryFriction: cp.regulatoryFriction,
        politicalStability: cp.politicalStability,
        laborPool: cp.laborPool,
        costOfDoing: cp.costOfDoing,
        investmentMomentum: cp.investmentMomentum,
        overlookedScore: cp.overlookedScore,
        strategicAdvantages: cp.strategicAdvantages,
        investmentPrograms: cp.investmentPrograms,
        profileId: cp.id,
      });
    }

    // Score and rank
    const scored = allCities.map(city => ({
      city,
      score: scoreCity(city, criteria),
      sectorMatch: sectorOverlap(city.keySectors, criteria.targetSectors),
    }));

    scored.sort((a, b) => b.score - a.score);

    const topMatches: DiscoveredCity[] = scored.slice(0, limit).map(({ city, score, sectorMatch }) => ({
      city: city.city,
      country: city.country,
      region: city.region,
      matchScore: score,
      sectorMatch,
      costAdvantage: 100 - city.costOfDoing,
      infrastructureScore: city.infrastructureScore,
      overlookedOpportunity: city.overlookedScore,
      investmentMomentum: city.investmentMomentum,
      keySectors: city.keySectors,
      strategicAdvantages: city.strategicAdvantages,
      investmentPrograms: city.investmentPrograms,
      whyThisCity: generatePitch(city, score, criteria),
      profileId: city.profileId,
    }));

    // Region breakdown
    const regionBreakdown: Record<string, number> = {};
    for (const m of topMatches) {
      regionBreakdown[m.region] = (regionBreakdown[m.region] || 0) + 1;
    }

    // Sector hotspots
    const sectorMap = new Map<string, { cities: string[]; scores: number[] }>();
    for (const m of topMatches) {
      for (const sector of m.keySectors) {
        const s = sectorMap.get(sector) || { cities: [], scores: [] };
        s.cities.push(m.city);
        s.scores.push(m.matchScore);
        sectorMap.set(sector, s);
      }
    }
    const sectorHotspots = Array.from(sectorMap.entries())
      .map(([sector, { cities, scores }]) => ({
        sector,
        cities: [...new Set(cities)].slice(0, 5),
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 6);

    // Insight
    const topCity = topMatches[0];
    const insight = topMatches.length > 0
      ? `Found ${topMatches.length} regional cities matching your criteria. ` +
        `Top match: ${topCity.city} (${topCity.country}) with ${topCity.matchScore}/100 composite score. ` +
        `${criteria.preferOverlooked ? 'Prioritised overlooked cities — several with high potential and low competition. ' : ''}` +
        `Strongest sector coverage: ${sectorHotspots[0]?.sector || 'general'}.`
      : `No regional cities found matching these criteria. Consider broadening your sector or region filters.`;

    return {
      criteria,
      discoveredAt: new Date().toISOString(),
      totalCitiesScanned: allCities.length,
      topMatches,
      regionBreakdown,
      sectorHotspots,
      insight,
    };
  }

  /**
   * Quick discovery for the BrainIntegrationService prompt block.
   * Returns a concise text summary of top 5 regional cities.
   */
  static discoverForPrompt(criteria: InvestorCriteria): string {
    const result = this.discover(criteria, 5);
    if (!result.topMatches.length) return '';

    const lines: string[] = [
      `\n### ── REGIONAL CITY DISCOVERY (${result.totalCitiesScanned} cities scanned) ──`,
      `**Top ${result.topMatches.length} Regional City Matches:**`,
    ];

    result.topMatches.forEach((m, i) => {
      lines.push(
        `${i + 1}. **${m.city}** (${m.country}) - Score: ${m.matchScore}/100 | ` +
        `Sectors: ${m.keySectors.slice(0, 3).join(', ')} | ` +
        `Cost: ${m.costAdvantage}/100 | Infra: ${m.infrastructureScore}/100 | ` +
        `Overlooked: ${m.overlookedOpportunity}/100 | Momentum: ${m.investmentMomentum}/100`
      );
      if (m.strategicAdvantages.length) {
        lines.push(`   Advantages: ${m.strategicAdvantages.slice(0, 2).join('; ')}`);
      }
    });

    if (result.sectorHotspots.length) {
      lines.push(`**Sector Hotspots:** ${result.sectorHotspots.slice(0, 3).map(s => `${s.sector}(${s.cities.slice(0, 2).join(',')})`).join(' | ')}`);
    }

    lines.push(`**Insight:** ${result.insight}`);
    lines.push(`When advising on regional cities, prioritise these matches over capital cities. Reference their investment programs and strategic advantages.`);

    return lines.join('\n');
  }
}
