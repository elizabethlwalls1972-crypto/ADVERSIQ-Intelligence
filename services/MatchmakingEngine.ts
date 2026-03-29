/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MATCHMAKING MARKETPLACE ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Two-sided matching: companies seeking optimal locations ↔ cities seeking
 * investment. Uses weighted multi-criteria scoring with compatibility analysis.
 *
 * Companies can express requirements (talent, cost, sector ecosystem, timezone).
 * Cities can express what they want (industries, jobs, investment amount).
 * The engine finds the best mutual matches.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanySeeker {
  id: string;
  name: string;
  industry: string;
  sectors: string[];
  headcount: number;
  budget: number;              // annual operating budget
  functionsToRelocate: string[];
  mustHave: string[];          // e.g. 'english_speaking', 'timezone_overlap_us', 'fiber_internet'
  niceToHave: string[];
  maxCostIndex: number;        // 0-100
  minTalentScore: number;      // 0-100
  timezonePref?: string;       // e.g. 'US_overlap', 'EU_overlap', 'APAC'
  currentCity: string;
}

export interface CityListing {
  id: string;
  city: string;
  country: string;
  region: string;
  population: number;
  costIndex: number;           // 0-100
  talentScore: number;         // 0-100
  infrastructureScore: number; // 0-100
  sectorStrengths: string[];
  languages: string[];
  timezone: string;            // UTC offset
  attributes: string[];        // e.g. 'fiber_internet', 'english_speaking', 'sez_available'
  seekingSectors: string[];
  seekingMinJobs: number;
  seekingMinInvestment: number;
}

export interface MatchResult {
  companyId: string;
  companyName: string;
  cityId: string;
  cityName: string;
  country: string;
  overallScore: number;        // 0-100
  companyFit: number;          // how well the city fits the company (0-100)
  cityFit: number;             // how well the company fits the city (0-100)
  breakdown: MatchBreakdown;
  dealbreakers: string[];
  highlights: string[];
}

export interface MatchBreakdown {
  costScore: number;
  talentScore: number;
  sectorScore: number;
  infrastructureScore: number;
  timezoneScore: number;
  mustHaveScore: number;
  niceToHaveScore: number;
}

export interface MarketplaceOutput {
  seekerCount: number;
  listingCount: number;
  matchesFound: number;
  topMatches: MatchResult[];
  unmatchedSeekers: string[];
  unmatchedCities: string[];
  insight: string;
  generatedAt: string;
}

// ─── City Listings Database ───────────────────────────────────────────────────

const CITY_LISTINGS: CityListing[] = [
  { id: 'davao', city: 'Davao City', country: 'Philippines', region: 'Southeast Asia', population: 1800000, costIndex: 28, talentScore: 62, infrastructureScore: 60, sectorStrengths: ['BPO', 'Technology', 'Agriculture', 'Manufacturing'], languages: ['English', 'Filipino'], timezone: 'UTC+8', attributes: ['english_speaking', 'fiber_internet', 'sez_available', 'low_crime', 'young_workforce'], seekingSectors: ['Technology', 'BPO', 'Manufacturing'], seekingMinJobs: 20, seekingMinInvestment: 50000 },
  { id: 'cebu', city: 'Cebu City', country: 'Philippines', region: 'Southeast Asia', population: 1000000, costIndex: 30, talentScore: 68, infrastructureScore: 65, sectorStrengths: ['BPO', 'Technology', 'Tourism', 'Furniture'], languages: ['English', 'Filipino', 'Cebuano'], timezone: 'UTC+8', attributes: ['english_speaking', 'fiber_internet', 'sez_available', 'international_airport', 'established_bpo'], seekingSectors: ['Technology', 'BPO', 'Creative', 'Manufacturing'], seekingMinJobs: 15, seekingMinInvestment: 30000 },
  { id: 'townsville', city: 'Townsville', country: 'Australia', region: 'Pacific', population: 195000, costIndex: 55, talentScore: 58, infrastructureScore: 72, sectorStrengths: ['Defence', 'Marine', 'Renewable Energy', 'Mining'], languages: ['English'], timezone: 'UTC+10', attributes: ['english_speaking', 'fiber_internet', 'military_base', 'university_city', 'reef_access'], seekingSectors: ['Defence', 'Technology', 'Renewable Energy', 'Marine'], seekingMinJobs: 10, seekingMinInvestment: 100000 },
  { id: 'darwin', city: 'Darwin', country: 'Australia', region: 'Pacific', population: 147000, costIndex: 58, talentScore: 52, infrastructureScore: 68, sectorStrengths: ['Defence', 'Mining', 'Renewable Energy', 'Agriculture'], languages: ['English'], timezone: 'UTC+9.5', attributes: ['english_speaking', 'fiber_internet', 'military_base', 'asia_gateway', 'natural_gas'], seekingSectors: ['Defence', 'Mining', 'Technology', 'Agriculture'], seekingMinJobs: 10, seekingMinInvestment: 150000 },
  { id: 'medellin', city: 'Medellin', country: 'Colombia', region: 'Latin America', population: 2500000, costIndex: 32, talentScore: 65, infrastructureScore: 63, sectorStrengths: ['Technology', 'BPO', 'Creative', 'Fashion'], languages: ['Spanish', 'English'], timezone: 'UTC-5', attributes: ['fiber_internet', 'innovation_hub', 'coworking_dense', 'spring_climate', 'timezone_overlap_us'], seekingSectors: ['Technology', 'Creative', 'BPO'], seekingMinJobs: 10, seekingMinInvestment: 30000 },
  { id: 'cluj', city: 'Cluj-Napoca', country: 'Romania', region: 'Europe', population: 325000, costIndex: 38, talentScore: 75, infrastructureScore: 70, sectorStrengths: ['Technology', 'Software', 'Automotive', 'BPO'], languages: ['Romanian', 'English', 'German', 'Hungarian'], timezone: 'UTC+2', attributes: ['english_speaking', 'fiber_internet', 'eu_member', 'university_city', 'tech_hub', 'timezone_overlap_eu'], seekingSectors: ['Technology', 'Software', 'Automotive'], seekingMinJobs: 10, seekingMinInvestment: 50000 },
  { id: 'tbilisi', city: 'Tbilisi', country: 'Georgia', region: 'Caucasus', population: 1100000, costIndex: 25, talentScore: 55, infrastructureScore: 58, sectorStrengths: ['Technology', 'Tourism', 'Wine', 'Creative'], languages: ['Georgian', 'Russian', 'English'], timezone: 'UTC+4', attributes: ['fiber_internet', 'low_tax', 'visa_free', 'scenic', 'digital_nomad_friendly'], seekingSectors: ['Technology', 'Tourism', 'Creative'], seekingMinJobs: 5, seekingMinInvestment: 20000 },
  { id: 'kigali', city: 'Kigali', country: 'Rwanda', region: 'Africa', population: 1200000, costIndex: 22, talentScore: 50, infrastructureScore: 55, sectorStrengths: ['Technology', 'Fintech', 'Agriculture', 'Manufacturing'], languages: ['English', 'French', 'Kinyarwanda'], timezone: 'UTC+2', attributes: ['english_speaking', 'fiber_internet', 'clean_city', 'innovation_city', 'afcfta_access', 'timezone_overlap_eu'], seekingSectors: ['Technology', 'Fintech', 'Manufacturing', 'Agriculture'], seekingMinJobs: 10, seekingMinInvestment: 50000 },
  { id: 'danang', city: 'Da Nang', country: 'Vietnam', region: 'Southeast Asia', population: 1200000, costIndex: 25, talentScore: 58, infrastructureScore: 62, sectorStrengths: ['Technology', 'Electronics', 'Tourism', 'Manufacturing'], languages: ['Vietnamese', 'English'], timezone: 'UTC+7', attributes: ['fiber_internet', 'beach_city', 'high_tech_park', 'young_workforce', 'growing_fast'], seekingSectors: ['Technology', 'Electronics', 'Manufacturing'], seekingMinJobs: 15, seekingMinInvestment: 50000 },
  { id: 'wroclaw', city: 'Wroclaw', country: 'Poland', region: 'Europe', population: 640000, costIndex: 40, talentScore: 72, infrastructureScore: 72, sectorStrengths: ['Technology', 'BPO', 'Automotive', 'Finance'], languages: ['Polish', 'English', 'German'], timezone: 'UTC+1', attributes: ['english_speaking', 'fiber_internet', 'eu_member', 'university_city', 'timezone_overlap_eu'], seekingSectors: ['Technology', 'Finance', 'Automotive', 'BPO'], seekingMinJobs: 10, seekingMinInvestment: 80000 },
  { id: 'penang', city: 'Penang', country: 'Malaysia', region: 'Southeast Asia', population: 800000, costIndex: 35, talentScore: 64, infrastructureScore: 68, sectorStrengths: ['Electronics', 'Manufacturing', 'Technology', 'Medical Devices'], languages: ['Malay', 'English', 'Mandarin', 'Tamil'], timezone: 'UTC+8', attributes: ['english_speaking', 'fiber_internet', 'sez_available', 'established_manufacturing', 'free_port'], seekingSectors: ['Electronics', 'Manufacturing', 'Technology'], seekingMinJobs: 20, seekingMinInvestment: 100000 },
  { id: 'rak', city: 'Ras Al Khaimah', country: 'UAE', region: 'Middle East', population: 350000, costIndex: 42, talentScore: 55, infrastructureScore: 75, sectorStrengths: ['Manufacturing', 'Logistics', 'Ceramics', 'Pharmaceuticals'], languages: ['Arabic', 'English'], timezone: 'UTC+4', attributes: ['english_speaking', 'fiber_internet', 'free_zone', 'zero_tax', 'logistics_hub'], seekingSectors: ['Manufacturing', 'Logistics', 'Technology', 'Creative'], seekingMinJobs: 5, seekingMinInvestment: 50000 },
  { id: 'iloilo', city: 'Iloilo City', country: 'Philippines', region: 'Southeast Asia', population: 500000, costIndex: 22, talentScore: 55, infrastructureScore: 52, sectorStrengths: ['BPO', 'Technology', 'Agriculture', 'Education'], languages: ['English', 'Filipino', 'Ilonggo'], timezone: 'UTC+8', attributes: ['english_speaking', 'fiber_internet', 'university_city', 'emerging_bpo', 'low_cost'], seekingSectors: ['BPO', 'Technology', 'Education'], seekingMinJobs: 10, seekingMinInvestment: 20000 },
  { id: 'cdo', city: 'Cagayan de Oro', country: 'Philippines', region: 'Southeast Asia', population: 730000, costIndex: 24, talentScore: 54, infrastructureScore: 55, sectorStrengths: ['Agriculture', 'BPO', 'Manufacturing', 'Technology'], languages: ['English', 'Filipino'], timezone: 'UTC+8', attributes: ['english_speaking', 'fiber_internet', 'agri_hub', 'emerging_tech', 'low_cost'], seekingSectors: ['BPO', 'Agriculture', 'Manufacturing', 'Technology'], seekingMinJobs: 10, seekingMinInvestment: 20000 },
  { id: 'tashkent', city: 'Tashkent', country: 'Uzbekistan', region: 'Central Asia', population: 2800000, costIndex: 20, talentScore: 52, infrastructureScore: 50, sectorStrengths: ['Textiles', 'Manufacturing', 'Agriculture', 'Mining'], languages: ['Uzbek', 'Russian', 'English'], timezone: 'UTC+5', attributes: ['low_cost', 'large_workforce', 'free_economic_zones', 'growing_fast'], seekingSectors: ['Manufacturing', 'Textiles', 'Agriculture', 'Technology'], seekingMinJobs: 20, seekingMinInvestment: 50000 },
];

// ─── Engine ───────────────────────────────────────────────────────────────────

export class MatchmakingEngine {

  /** Get all city listings */
  static getAllListings(): CityListing[] {
    return [...CITY_LISTINGS];
  }

  /** Run the full matchmaking algorithm */
  static match(seekers: CompanySeeker[]): MarketplaceOutput {
    const allMatches: MatchResult[] = [];

    for (const seeker of seekers) {
      for (const listing of CITY_LISTINGS) {
        const result = this.scoreMatch(seeker, listing);
        if (result.overallScore >= 40) {
          allMatches.push(result);
        }
      }
    }

    allMatches.sort((a, b) => b.overallScore - a.overallScore);

    const matchedSeekerIds = new Set(allMatches.map(m => m.companyId));
    const matchedCityIds = new Set(allMatches.map(m => m.cityId));

    return {
      seekerCount: seekers.length,
      listingCount: CITY_LISTINGS.length,
      matchesFound: allMatches.length,
      topMatches: allMatches.slice(0, 20),
      unmatchedSeekers: seekers.filter(s => !matchedSeekerIds.has(s.id)).map(s => s.name),
      unmatchedCities: CITY_LISTINGS.filter(l => !matchedCityIds.has(l.id)).map(l => l.city),
      insight: `Generated ${allMatches.length} matches across ${seekers.length} companies and ${CITY_LISTINGS.length} cities. ` +
               `Top match: ${allMatches[0]?.companyName ?? 'N/A'} ↔ ${allMatches[0]?.cityName ?? 'N/A'} (${allMatches[0]?.overallScore ?? 0}/100).`,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Match a single company against all cities */
  static matchCompany(seeker: CompanySeeker): MatchResult[] {
    const results = CITY_LISTINGS.map(listing => this.scoreMatch(seeker, listing))
      .filter(r => r.overallScore >= 30)
      .sort((a, b) => b.overallScore - a.overallScore);
    return results.slice(0, 10);
  }

  /** Match cities looking for a specific industry */
  static matchIndustry(industry: string, headcount: number, budget: number): MatchResult[] {
    const seeker: CompanySeeker = {
      id: `industry-${industry.toLowerCase()}`,
      name: `${industry} Company`,
      industry,
      sectors: [industry],
      headcount,
      budget,
      functionsToRelocate: ['Operations'],
      mustHave: [],
      niceToHave: ['fiber_internet', 'english_speaking'],
      maxCostIndex: 60,
      minTalentScore: 40,
      currentCity: 'Unknown',
    };
    return this.matchCompany(seeker);
  }

  /** Prompt block */
  static forPrompt(output: MarketplaceOutput): string {
    if (!output.topMatches.length) return '';
    const lines: string[] = [
      `\n### ── MATCHMAKING MARKETPLACE ──`,
      `**${output.seekerCount} seekers × ${output.listingCount} cities = ${output.matchesFound} matches**`,
    ];
    output.topMatches.slice(0, 5).forEach((m, i) => {
      lines.push(`${i + 1}. **${m.companyName}** ↔ **${m.cityName}** (${m.country}) — Score: ${m.overallScore}/100`);
      lines.push(`   Company→City: ${m.companyFit}/100 | City→Company: ${m.cityFit}/100`);
      if (m.highlights.length) lines.push(`   ✓ ${m.highlights.slice(0, 2).join(' | ')}`);
      if (m.dealbreakers.length) lines.push(`   ✗ ${m.dealbreakers.join(' | ')}`);
    });
    return lines.join('\n');
  }

  // ─── Private scoring ──────────────────────────────────────────────────────

  private static scoreMatch(seeker: CompanySeeker, listing: CityListing): MatchResult {
    const bd = this.computeBreakdown(seeker, listing);
    const dealbreakers: string[] = [];
    const highlights: string[] = [];

    // Cost check
    if (listing.costIndex > seeker.maxCostIndex) {
      dealbreakers.push(`Cost index ${listing.costIndex} exceeds max ${seeker.maxCostIndex}`);
    } else {
      highlights.push(`${Math.round((1 - listing.costIndex / seeker.maxCostIndex) * 100)}% under cost ceiling`);
    }

    // Talent check
    if (listing.talentScore < seeker.minTalentScore) {
      dealbreakers.push(`Talent score ${listing.talentScore} below min ${seeker.minTalentScore}`);
    }

    // Must-haves
    const missingMust = seeker.mustHave.filter(m => !listing.attributes.includes(m));
    if (missingMust.length) {
      dealbreakers.push(`Missing: ${missingMust.join(', ')}`);
    }

    // Sector match
    const sectorOverlap = seeker.sectors.filter(s =>
      listing.sectorStrengths.some(ls => ls.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ls.toLowerCase()))
    );
    if (sectorOverlap.length) highlights.push(`Sector match: ${sectorOverlap.join(', ')}`);

    // Nice-to-haves
    const niceHits = seeker.niceToHave.filter(n => listing.attributes.includes(n));
    if (niceHits.length) highlights.push(`Bonus: ${niceHits.join(', ')}`);

    // Company fit: how well city serves company
    const companyFit = Math.round(
      bd.costScore * 0.25 + bd.talentScore * 0.20 + bd.sectorScore * 0.20 +
      bd.infrastructureScore * 0.10 + bd.timezoneScore * 0.05 +
      bd.mustHaveScore * 0.15 + bd.niceToHaveScore * 0.05
    );

    // City fit: how well company serves the city
    const cityFit = this.computeCityFit(seeker, listing);

    // Overall = geometric mean of the two directions (biased toward company needs)
    const overallScore = Math.round(companyFit * 0.65 + cityFit * 0.35);

    return {
      companyId: seeker.id,
      companyName: seeker.name,
      cityId: listing.id,
      cityName: listing.city,
      country: listing.country,
      overallScore: dealbreakers.length > 1 ? Math.max(10, overallScore - 30) : overallScore,
      companyFit,
      cityFit,
      breakdown: bd,
      dealbreakers,
      highlights,
    };
  }

  private static computeBreakdown(seeker: CompanySeeker, listing: CityListing): MatchBreakdown {
    const costScore = listing.costIndex <= seeker.maxCostIndex
      ? Math.round(100 - (listing.costIndex / seeker.maxCostIndex) * 50)
      : Math.round(Math.max(0, 50 - (listing.costIndex - seeker.maxCostIndex) * 2));

    const talentScore = listing.talentScore >= seeker.minTalentScore
      ? Math.round(50 + (listing.talentScore - seeker.minTalentScore) * 0.5)
      : Math.round(Math.max(0, listing.talentScore / seeker.minTalentScore * 50));

    const sectorOverlap = seeker.sectors.filter(s =>
      listing.sectorStrengths.some(ls => ls.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ls.toLowerCase()))
    ).length;
    const sectorScore = Math.round(Math.min(100, (sectorOverlap / Math.max(1, seeker.sectors.length)) * 100));

    const infrastructureScore = listing.infrastructureScore;

    // Timezone (simplified)
    const timezoneScore = seeker.timezonePref
      ? (listing.attributes.includes(`timezone_overlap_${seeker.timezonePref.toLowerCase()}`) ? 90 : 50)
      : 70;

    const mustHaveScore = seeker.mustHave.length > 0
      ? Math.round((seeker.mustHave.filter(m => listing.attributes.includes(m)).length / seeker.mustHave.length) * 100)
      : 80;

    const niceToHaveScore = seeker.niceToHave.length > 0
      ? Math.round((seeker.niceToHave.filter(n => listing.attributes.includes(n)).length / seeker.niceToHave.length) * 100)
      : 50;

    return { costScore, talentScore, sectorScore, infrastructureScore, timezoneScore, mustHaveScore, niceToHaveScore };
  }

  private static computeCityFit(seeker: CompanySeeker, listing: CityListing): number {
    let score = 50;
    // Sector alignment
    if (listing.seekingSectors.some(s => seeker.sectors.some(cs => cs.toLowerCase().includes(s.toLowerCase())))) score += 20;
    // Jobs
    if (seeker.headcount >= listing.seekingMinJobs) score += 15;
    else score -= 10;
    // Investment
    if (seeker.budget >= listing.seekingMinInvestment) score += 15;
    else score -= 10;
    return Math.max(0, Math.min(100, score));
  }
}
