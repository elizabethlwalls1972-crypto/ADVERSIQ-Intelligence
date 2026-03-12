/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REGIONAL MIRRORING ENGINE - Reflexive Intelligence Layer (Layer 9)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Theory: Structural Similarity Analysis + Analogical Reasoning
 *         (Gentner, 1983: Structure-Mapping Theory)
 *
 * This engine answers the question: "What other region is structurally
 * identical to this one - and what did they do that worked?"
 *
 * This is NOT cross-domain transfer (biology → economics). That's CDT.
 * This is REGION → REGION: "Cebu 2010 ≈ Da Nang 2020"
 *
 * The insight: Regions don't know who their structural twins are. They
 * benchmark against aspirational peers (everyone wants to be Singapore)
 * rather than structural matches. This engine forces honest matching and
 * extracts transferable strategies from real analogues.
 *
 * Dimensions of structural similarity:
 *   1. Economic profile (GDP per capita, sector mix, FDI dependency)
 *   2. Demographics (population, urbanisation, education, age structure)
 *   3. Infrastructure (transport, digital, energy, industrial zones)
 *   4. Geographic positioning (port, border, corridor, hinterland)
 *   5. Institutional context (governance quality, regulatory framework)
 *   6. Sector specialisation (dominant industry, diversification level)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { UserInputSnapshot } from './UserSignalDecoder';

// ============================================================================
// TYPES
// ============================================================================

export interface RegionalProfile {
  region: string;
  country: string;
  economicProfile: EconomicProfile;
  demographics: DemographicProfile;
  infrastructure: InfrastructureProfile;
  geography: GeographicProfile;
  institutionalContext: InstitutionalProfile;
  sectorProfile: SectorProfile;
}

export interface EconomicProfile {
  gdpPerCapita: 'low' | 'lower-middle' | 'upper-middle' | 'high';
  fdiDependency: 'low' | 'medium' | 'high';
  sectorConcentration: 'diversified' | 'moderate' | 'concentrated';
  tradeOpenness: 'closed' | 'moderate' | 'open';
}

export interface DemographicProfile {
  populationScale: 'small' | 'medium' | 'large' | 'mega';
  urbanisation: 'rural' | 'urbanising' | 'urban' | 'hyper-urban';
  educationLevel: 'basic' | 'secondary' | 'tertiary' | 'advanced';
  ageStructure: 'young' | 'balanced' | 'aging';
  languageAdvantage: boolean;
}

export interface InfrastructureProfile {
  transportConnectivity: 'isolated' | 'limited' | 'connected' | 'hub';
  digitalInfrastructure: 'basic' | 'developing' | 'mature' | 'advanced';
  energyReliability: 'unreliable' | 'adequate' | 'reliable' | 'surplus';
  industrialZones: boolean;
}

export interface GeographicProfile {
  hasPort: boolean;
  hasBorderCrossing: boolean;
  isOnTradeCorridor: boolean;
  coastalAccess: boolean;
  proximityToCapital: 'near' | 'moderate' | 'remote';
  climateZone: 'tropical' | 'subtropical' | 'temperate' | 'arid' | 'cold';
}

export interface InstitutionalProfile {
  governanceQuality: 'weak' | 'developing' | 'moderate' | 'strong';
  regulatoryFramework: 'opaque' | 'emerging' | 'transparent' | 'stable';
  investorProtection: 'low' | 'medium' | 'high';
  specialEconomicZone: boolean;
}

export interface SectorProfile {
  dominantSector: string;
  emergingSectors: string[];
  sectorMaturity: 'nascent' | 'growing' | 'mature' | 'declining';
}

export interface MirrorMatch {
  mirrorRegion: string;
  country: string;
  overallSimilarity: number;    // 0-1
  dimensionScores: {
    economic: number;
    demographic: number;
    infrastructure: number;
    geographic: number;
    institutional: number;
    sector: number;
  };
  whatTheyDid: string;
  transferableStrategies: string[];
  warnings: string[];            // What didn't work / what to avoid
  timeRelationship: string;      // "5 years ahead", "same stage", etc.
}

export interface AspirationGap {
  aspirationalPeer: string;      // Who they want to be like
  structuralTwin: string;        // Who they actually resemble
  gapDimensions: string[];       // Where the biggest gaps are
  realisticTimeline: string;     // How long to bridge the gap
  bridgeStrategies: string[];    // How to close the gap
}

export interface MirroringReport {
  inputRegion: string;
  inputCountry: string;
  topMirrors: MirrorMatch[];
  aspirationGap: AspirationGap | null;
  structuralInsights: string[];
  strategicRecommendations: string[];
  timestamp: string;
}

// ============================================================================
// REFERENCE REGION DATABASE
// ============================================================================

interface ReferenceRegion {
  region: string;
  country: string;
  economic: EconomicProfile;
  demographic: DemographicProfile;
  infrastructure: InfrastructureProfile;
  geography: GeographicProfile;
  institutional: InstitutionalProfile;
  sector: SectorProfile;
  historyNote: string;
  strategies: string[];
  warnings: string[];
}

const REFERENCE_REGIONS: ReferenceRegion[] = [
  {
    region: 'Penang', country: 'Malaysia',
    economic: { gdpPerCapita: 'upper-middle', fdiDependency: 'high', sectorConcentration: 'concentrated', tradeOpenness: 'open' },
    demographic: { populationScale: 'medium', urbanisation: 'urban', educationLevel: 'tertiary', ageStructure: 'balanced', languageAdvantage: true },
    infrastructure: { transportConnectivity: 'connected', digitalInfrastructure: 'mature', energyReliability: 'reliable', industrialZones: true },
    geography: { hasPort: true, hasBorderCrossing: false, isOnTradeCorridor: true, coastalAccess: true, proximityToCapital: 'moderate', climateZone: 'tropical' },
    institutional: { governanceQuality: 'moderate', regulatoryFramework: 'transparent', investorProtection: 'medium', specialEconomicZone: true },
    sector: { dominantSector: 'Electronics/Semiconductors', emergingSectors: ['Medical devices', 'Shared services'], sectorMaturity: 'mature' },
    historyNote: 'Transformed from trading port to semiconductor hub via FTZ strategy. InvestPenang model of proactive IPA.',
    strategies: ['Free Trade Zone designation', 'Proactive IPA with dedicated aftercare', 'Vendor development programme for local suppliers', 'University-industry collaboration for talent'],
    warnings: ['Heavy reliance on single sector creates vulnerability', 'Cost escalation may push commodity manufacturing out']
  },
  {
    region: 'Clark/Subic', country: 'Philippines',
    economic: { gdpPerCapita: 'lower-middle', fdiDependency: 'high', sectorConcentration: 'moderate', tradeOpenness: 'open' },
    demographic: { populationScale: 'medium', urbanisation: 'urbanising', educationLevel: 'secondary', ageStructure: 'young', languageAdvantage: true },
    infrastructure: { transportConnectivity: 'connected', digitalInfrastructure: 'developing', energyReliability: 'adequate', industrialZones: true },
    geography: { hasPort: true, hasBorderCrossing: false, isOnTradeCorridor: false, coastalAccess: true, proximityToCapital: 'near', climateZone: 'tropical' },
    institutional: { governanceQuality: 'developing', regulatoryFramework: 'emerging', investorProtection: 'medium', specialEconomicZone: true },
    sector: { dominantSector: 'BPO/Logistics', emergingSectors: ['Aviation', 'Manufacturing'], sectorMaturity: 'growing' },
    historyNote: 'Converted former US military bases into special economic zones. Massive infrastructure already in place.',
    strategies: ['Military base conversion to economic zone', 'Leverage existing runway/port infrastructure', 'BPO overflow from Metro Manila', 'Japanese manufacturing cluster development'],
    warnings: ['Infrastructure advantage can be squandered without consistent governance', 'Proximity to Manila creates brain drain risk']
  },
  {
    region: 'Batangas', country: 'Philippines',
    economic: { gdpPerCapita: 'lower-middle', fdiDependency: 'medium', sectorConcentration: 'moderate', tradeOpenness: 'moderate' },
    demographic: { populationScale: 'medium', urbanisation: 'urbanising', educationLevel: 'secondary', ageStructure: 'young', languageAdvantage: true },
    infrastructure: { transportConnectivity: 'connected', digitalInfrastructure: 'developing', energyReliability: 'adequate', industrialZones: true },
    geography: { hasPort: true, hasBorderCrossing: false, isOnTradeCorridor: false, coastalAccess: true, proximityToCapital: 'near', climateZone: 'tropical' },
    institutional: { governanceQuality: 'developing', regulatoryFramework: 'emerging', investorProtection: 'medium', specialEconomicZone: true },
    sector: { dominantSector: 'Oil refining/Petrochemicals', emergingSectors: ['Manufacturing', 'Logistics'], sectorMaturity: 'mature' },
    historyNote: 'Industrial port city south of Manila. Manufacturing base with petrochemical anchor.',
    strategies: ['Port-based industrial strategy', 'CALABARZON corridor integration', 'Petrochemical downstream diversification'],
    warnings: ['Environmental constraints from petrochemical legacy', 'Competing with multiple CALABARZON locations']
  },
  {
    region: 'Ho Chi Minh City', country: 'Vietnam',
    economic: { gdpPerCapita: 'lower-middle', fdiDependency: 'high', sectorConcentration: 'diversified', tradeOpenness: 'open' },
    demographic: { populationScale: 'large', urbanisation: 'hyper-urban', educationLevel: 'tertiary', ageStructure: 'young', languageAdvantage: false },
    infrastructure: { transportConnectivity: 'hub', digitalInfrastructure: 'developing', energyReliability: 'adequate', industrialZones: true },
    geography: { hasPort: true, hasBorderCrossing: false, isOnTradeCorridor: true, coastalAccess: true, proximityToCapital: 'remote', climateZone: 'tropical' },
    institutional: { governanceQuality: 'developing', regulatoryFramework: 'emerging', investorProtection: 'medium', specialEconomicZone: true },
    sector: { dominantSector: 'Manufacturing/Electronics', emergingSectors: ['Software', 'Fintech', 'Automotive'], sectorMaturity: 'growing' },
    historyNote: 'Vietnam\'s economic engine. Benefiting from China+1 manufacturing shift. Rapid growth trajectory.',
    strategies: ['China+1 positioning for manufacturing', 'Young workforce as competitive advantage', 'Industrial zone proliferation', 'Japanese/Korean investor targeting'],
    warnings: ['Infrastructure struggling to keep pace with growth', 'Skilled labour shortage emerging', 'Wage inflation accelerating']
  },
  {
    region: 'Johor', country: 'Malaysia',
    economic: { gdpPerCapita: 'upper-middle', fdiDependency: 'high', sectorConcentration: 'moderate', tradeOpenness: 'open' },
    demographic: { populationScale: 'medium', urbanisation: 'urbanising', educationLevel: 'secondary', ageStructure: 'balanced', languageAdvantage: true },
    infrastructure: { transportConnectivity: 'hub', digitalInfrastructure: 'mature', energyReliability: 'reliable', industrialZones: true },
    geography: { hasPort: true, hasBorderCrossing: true, isOnTradeCorridor: true, coastalAccess: true, proximityToCapital: 'remote', climateZone: 'tropical' },
    institutional: { governanceQuality: 'moderate', regulatoryFramework: 'transparent', investorProtection: 'medium', specialEconomicZone: true },
    sector: { dominantSector: 'Oil & Gas/Electronics', emergingSectors: ['Data centres', 'Iskandar development'], sectorMaturity: 'mature' },
    historyNote: 'Singapore spillover economy. Iskandar development zone creating new economic centre.',
    strategies: ['Cross-border economic integration with Singapore', 'Cost arbitrage positioning', 'Special development corridor (Iskandar)', 'Data centre cluster targeting'],
    warnings: ['Over-dependence on Singapore linkage', 'Land speculation risks', 'Political uncertainty affecting long-term plans']
  },
  {
    region: 'Pune', country: 'India',
    economic: { gdpPerCapita: 'lower-middle', fdiDependency: 'medium', sectorConcentration: 'diversified', tradeOpenness: 'moderate' },
    demographic: { populationScale: 'large', urbanisation: 'urban', educationLevel: 'tertiary', ageStructure: 'young', languageAdvantage: true },
    infrastructure: { transportConnectivity: 'connected', digitalInfrastructure: 'developing', energyReliability: 'adequate', industrialZones: true },
    geography: { hasPort: false, hasBorderCrossing: false, isOnTradeCorridor: false, coastalAccess: false, proximityToCapital: 'moderate', climateZone: 'tropical' },
    institutional: { governanceQuality: 'moderate', regulatoryFramework: 'emerging', investorProtection: 'medium', specialEconomicZone: true },
    sector: { dominantSector: 'IT/Automotive', emergingSectors: ['Defense', 'Biotech', 'EV'], sectorMaturity: 'mature' },
    historyNote: 'India\'s second-city IT hub. Strong university base (120+ engineering colleges). Automotive manufacturing cluster.',
    strategies: ['Second-city cost advantage vs Mumbai', 'University talent pipeline at scale', 'Automotive cluster as manufacturing anchor', 'IT/BPO cluster with lifestyle advantage'],
    warnings: ['Infrastructure congestion growing', 'Water scarcity risk', 'Pune-Mumbai corridor development needed']
  },
  {
    region: 'Kigali', country: 'Rwanda',
    economic: { gdpPerCapita: 'low', fdiDependency: 'medium', sectorConcentration: 'concentrated', tradeOpenness: 'moderate' },
    demographic: { populationScale: 'medium', urbanisation: 'urbanising', educationLevel: 'secondary', ageStructure: 'young', languageAdvantage: true },
    infrastructure: { transportConnectivity: 'limited', digitalInfrastructure: 'developing', energyReliability: 'adequate', industrialZones: true },
    geography: { hasPort: false, hasBorderCrossing: true, isOnTradeCorridor: false, coastalAccess: false, proximityToCapital: 'near', climateZone: 'tropical' },
    institutional: { governanceQuality: 'strong', regulatoryFramework: 'transparent', investorProtection: 'high', specialEconomicZone: true },
    sector: { dominantSector: 'ICT/Tourism', emergingSectors: ['Financial services', 'Green industry'], sectorMaturity: 'nascent' },
    historyNote: 'Remarkable post-conflict transformation. "Singapore of Africa" strategy. Vision 2050 driving deliberate development.',
    strategies: ['Vision-led development with strong governance', 'Clean city/safe city brand differentiator', 'Digital-first strategy (fintech, e-governance)', 'Conference/event tourism positioning'],
    warnings: ['Small domestic market limits manufacturing', 'Landlocked geography constrains logistics', 'Heavy reliance on strong governance continuing']
  },
  {
    region: 'Querétaro', country: 'Mexico',
    economic: { gdpPerCapita: 'upper-middle', fdiDependency: 'high', sectorConcentration: 'moderate', tradeOpenness: 'open' },
    demographic: { populationScale: 'medium', urbanisation: 'urban', educationLevel: 'tertiary', ageStructure: 'young', languageAdvantage: false },
    infrastructure: { transportConnectivity: 'connected', digitalInfrastructure: 'mature', energyReliability: 'reliable', industrialZones: true },
    geography: { hasPort: false, hasBorderCrossing: false, isOnTradeCorridor: true, coastalAccess: false, proximityToCapital: 'near', climateZone: 'arid' },
    institutional: { governanceQuality: 'moderate', regulatoryFramework: 'transparent', investorProtection: 'medium', specialEconomicZone: false },
    sector: { dominantSector: 'Aerospace/Automotive', emergingSectors: ['IT services', 'Medical devices'], sectorMaturity: 'growing' },
    historyNote: 'Mexico\'s aerospace capital. Deliberate cluster strategy with Bombardier as anchor. Strong tech university.',
    strategies: ['Anchor investor strategy (Bombardier → cluster)', 'Aerospace training centre development', 'Industry-university alignment', 'Safety/security brand vs other Mexican states'],
    warnings: ['Aerospace supply chains are long-cycle investments', 'Regional competition from Monterrey and Guadalajara']
  }
];

// ============================================================================
// ASPIRATIONAL PEERS (what regions typically compare themselves to)
// ============================================================================

const ASPIRATIONAL_BENCHMARKS: Record<string, { why: string; gap: string[] }> = {
  'Singapore': { why: 'Gold standard for small-economy investment attraction', gap: ['Governance maturity', 'Infrastructure quality', 'Regulatory stability', 'Geographic position'] },
  'Dubai': { why: 'Rapid transformation narrative', gap: ['Capital availability', 'Free zone infrastructure', 'Airline connectivity', 'Political stability'] },
  'Shenzhen': { why: 'Manufacturing-to-tech transformation', gap: ['Scale of workforce', 'Speed of decision-making', 'Government coordination', 'Proximity to supply chains'] },
  'Bangalore': { why: 'IT industry creation from scratch', gap: ['University ecosystem scale', 'English proficiency', 'Industry cluster density', 'Angel/VC ecosystem'] },
  'Estonia': { why: 'Digital government and e-residency model', gap: ['Digital infrastructure', 'Government digital literacy', 'Cybersecurity capabilities', 'Small population advantage'] }
};

// ============================================================================
// REGIONAL MIRRORING ENGINE
// ============================================================================

export class RegionalMirroringEngine {

  /**
   * Find structural mirrors for a region based on user input.
   */
  static mirror(input: UserInputSnapshot): MirroringReport {
    const profile = this.inferProfile(input);
    const mirrors = this.findMirrors(profile);
    const aspirationGap = this.detectAspirationGap(input, mirrors);
    const insights = this.generateInsights(profile, mirrors);
    const recommendations = this.generateRecommendations(mirrors);

    return {
      inputRegion: input.region || 'Unknown',
      inputCountry: input.country || 'Unknown',
      topMirrors: mirrors,
      aspirationGap,
      structuralInsights: insights,
      strategicRecommendations: recommendations,
      timestamp: new Date().toISOString()
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PROFILE INFERENCE FROM USER INPUT
  // ──────────────────────────────────────────────────────────────────────────

  private static inferProfile(input: UserInputSnapshot): RegionalProfile {
    const allText = Object.values(input).join(' ').toLowerCase();

    return {
      region: input.region || '',
      country: input.country || '',
      economicProfile: {
        gdpPerCapita: this.inferEconomicLevel(allText),
        fdiDependency: allText.includes('fdi') || allText.includes('foreign investment') || allText.includes('attract') ? 'high' : 'medium',
        sectorConcentration: (allText.match(/sector|industry|manufacturing|services|tourism|agriculture/g) || []).length > 3 ? 'diversified' : 'concentrated',
        tradeOpenness: allText.includes('export') || allText.includes('trade') || allText.includes('free trade') ? 'open' : 'moderate'
      },
      demographics: {
        populationScale: this.inferPopulationScale(allText),
        urbanisation: this.inferUrbanisation(allText),
        educationLevel: this.inferEducation(allText),
        ageStructure: allText.includes('young') || allText.includes('youth') ? 'young' : allText.includes('aging') || allText.includes('elderly') ? 'aging' : 'balanced',
        languageAdvantage: allText.includes('english') || allText.includes('bilingual') || allText.includes('multilingual')
      },
      infrastructure: {
        transportConnectivity: allText.includes('hub') || allText.includes('airport') && allText.includes('port') ? 'hub' : allText.includes('road') || allText.includes('rail') ? 'connected' : 'limited',
        digitalInfrastructure: allText.includes('digital') || allText.includes('fiber') || allText.includes('broadband') ? 'mature' : 'developing',
        energyReliability: allText.includes('power shortage') || allText.includes('blackout') ? 'unreliable' : 'adequate',
        industrialZones: allText.includes('industrial zone') || allText.includes('economic zone') || allText.includes('sez') || allText.includes('peza') || allText.includes('ftz')
      },
      geography: {
        hasPort: allText.includes('port') || allText.includes('harbor') || allText.includes('harbour') || allText.includes('shipping'),
        hasBorderCrossing: allText.includes('border') || allText.includes('cross-border'),
        isOnTradeCorridor: allText.includes('corridor') || allText.includes('belt and road') || allText.includes('trade route'),
        coastalAccess: allText.includes('coast') || allText.includes('sea') || allText.includes('ocean') || allText.includes('beach'),
        proximityToCapital: allText.includes('capital') && (allText.includes('near') || allText.includes('close')) ? 'near' : 'moderate',
        climateZone: this.inferClimate(allText)
      },
      institutionalContext: {
        governanceQuality: allText.includes('corruption') || allText.includes('weak governance') ? 'weak' : allText.includes('transparent') || allText.includes('strong governance') ? 'strong' : 'developing',
        regulatoryFramework: allText.includes('transparent') || allText.includes('predictable') ? 'transparent' : 'emerging',
        investorProtection: allText.includes('protection') || allText.includes('bilateral') || allText.includes('treaty') ? 'high' : 'medium',
        specialEconomicZone: allText.includes('sez') || allText.includes('special economic zone') || allText.includes('ftz') || allText.includes('peza')
      },
      sectorProfile: {
        dominantSector: (Array.isArray(input.sector) ? input.sector[0] : input.sector) || this.inferSector(allText),
        emergingSectors: this.inferEmergingSectors(allText),
        sectorMaturity: allText.includes('emerging') || allText.includes('nascent') ? 'nascent' : allText.includes('established') || allText.includes('mature') ? 'mature' : 'growing'
      }
    };
  }

  private static inferEconomicLevel(text: string): 'low' | 'lower-middle' | 'upper-middle' | 'high' {
    if (text.includes('developed') || text.includes('high income')) return 'high';
    if (text.includes('upper middle') || text.includes('industrialised')) return 'upper-middle';
    if (text.includes('developing') || text.includes('emerging')) return 'lower-middle';
    if (text.includes('least developed') || text.includes('low income')) return 'low';
    return 'lower-middle';
  }

  private static inferPopulationScale(text: string): 'small' | 'medium' | 'large' | 'mega' {
    if (text.includes('megacity') || text.includes('mega')) return 'mega';
    if (text.includes('large') || text.includes('million')) return 'large';
    if (text.includes('small') || text.includes('town')) return 'small';
    return 'medium';
  }

  private static inferUrbanisation(text: string): 'rural' | 'urbanising' | 'urban' | 'hyper-urban' {
    if (text.includes('rural') || text.includes('agricultural')) return 'rural';
    if (text.includes('city') || text.includes('urban') || text.includes('metro')) return 'urban';
    return 'urbanising';
  }

  private static inferEducation(text: string): 'basic' | 'secondary' | 'tertiary' | 'advanced' {
    if (text.includes('university') || text.includes('tertiary') || text.includes('degree')) return 'tertiary';
    if (text.includes('research') || text.includes('phd') || text.includes('innovation')) return 'advanced';
    if (text.includes('literacy') || text.includes('basic education')) return 'basic';
    return 'secondary';
  }

  private static inferClimate(text: string): 'tropical' | 'subtropical' | 'temperate' | 'arid' | 'cold' {
    if (text.includes('tropical') || text.includes('monsoon')) return 'tropical';
    if (text.includes('desert') || text.includes('arid') || text.includes('dry')) return 'arid';
    if (text.includes('cold') || text.includes('arctic') || text.includes('winter')) return 'cold';
    if (text.includes('temperate') || text.includes('european')) return 'temperate';
    return 'subtropical';
  }

  private static inferSector(text: string): string {
    const sectors: Array<[string, string[]]> = [
      ['Manufacturing', ['manufacturing', 'factory', 'assembly', 'production']],
      ['Technology/IT', ['technology', 'software', 'it ', 'digital', 'tech']],
      ['BPO/Services', ['bpo', 'outsourcing', 'services', 'call center']],
      ['Tourism', ['tourism', 'hotel', 'resort', 'visitor']],
      ['Agriculture', ['agriculture', 'farming', 'agri', 'food']],
      ['Mining/Resources', ['mining', 'mineral', 'resources', 'extraction']],
      ['Renewable Energy', ['renewable', 'solar', 'wind', 'green energy']],
      ['Logistics', ['logistics', 'warehouse', 'distribution', 'shipping']]
    ];
    for (const [sector, keywords] of sectors) {
      if (keywords.some(k => text.includes(k))) return sector;
    }
    return 'Mixed/Unknown';
  }

  private static inferEmergingSectors(text: string): string[] {
    const emerging: string[] = [];
    if (text.includes('renewable') || text.includes('green')) emerging.push('Renewable Energy');
    if (text.includes('digital') || text.includes('fintech')) emerging.push('Digital Economy');
    if (text.includes('ev') || text.includes('electric vehicle')) emerging.push('EV/Automotive');
    if (text.includes('biotech') || text.includes('pharma')) emerging.push('Biotech/Pharma');
    if (text.includes('data') || text.includes('ai ') || text.includes('artificial')) emerging.push('Data/AI');
    return emerging.slice(0, 3);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MIRROR MATCHING
  // ──────────────────────────────────────────────────────────────────────────

  private static findMirrors(profile: RegionalProfile): MirrorMatch[] {
    const matches: MirrorMatch[] = [];

    for (const ref of REFERENCE_REGIONS) {
      const scores = {
        economic: this.scoreEconomicSimilarity(profile.economicProfile, ref.economic),
        demographic: this.scoreDemographicSimilarity(profile.demographics, ref.demographic),
        infrastructure: this.scoreInfrastructureSimilarity(profile.infrastructure, ref.infrastructure),
        geographic: this.scoreGeographicSimilarity(profile.geography, ref.geography),
        institutional: this.scoreInstitutionalSimilarity(profile.institutionalContext, ref.institutional),
        sector: this.scoreSectorSimilarity(profile.sectorProfile, ref.sector)
      };

      // Weighted overall similarity
      const overall = (
        scores.economic * 0.20 +
        scores.demographic * 0.15 +
        scores.infrastructure * 0.20 +
        scores.geographic * 0.15 +
        scores.institutional * 0.15 +
        scores.sector * 0.15
      );

      if (overall >= 0.3) {
        matches.push({
          mirrorRegion: ref.region,
          country: ref.country,
          overallSimilarity: Math.round(overall * 100) / 100,
          dimensionScores: scores,
          whatTheyDid: ref.historyNote,
          transferableStrategies: ref.strategies,
          warnings: ref.warnings,
          timeRelationship: this.estimateTimeRelationship(profile.sectorProfile.sectorMaturity, ref.sector.sectorMaturity)
        });
      }
    }

    return matches
      .sort((a, b) => b.overallSimilarity - a.overallSimilarity)
      .slice(0, 5);
  }

  private static scoreEconomicSimilarity(a: EconomicProfile, b: EconomicProfile): number {
    let score = 0;
    if (a.gdpPerCapita === b.gdpPerCapita) score += 0.4;
    if (a.fdiDependency === b.fdiDependency) score += 0.2;
    if (a.sectorConcentration === b.sectorConcentration) score += 0.2;
    if (a.tradeOpenness === b.tradeOpenness) score += 0.2;
    return score;
  }

  private static scoreDemographicSimilarity(a: DemographicProfile, b: DemographicProfile): number {
    let score = 0;
    if (a.populationScale === b.populationScale) score += 0.25;
    if (a.urbanisation === b.urbanisation) score += 0.2;
    if (a.educationLevel === b.educationLevel) score += 0.2;
    if (a.ageStructure === b.ageStructure) score += 0.15;
    if (a.languageAdvantage === b.languageAdvantage) score += 0.2;
    return score;
  }

  private static scoreInfrastructureSimilarity(a: InfrastructureProfile, b: InfrastructureProfile): number {
    let score = 0;
    if (a.transportConnectivity === b.transportConnectivity) score += 0.3;
    if (a.digitalInfrastructure === b.digitalInfrastructure) score += 0.25;
    if (a.energyReliability === b.energyReliability) score += 0.2;
    if (a.industrialZones === b.industrialZones) score += 0.25;
    return score;
  }

  private static scoreGeographicSimilarity(a: GeographicProfile, b: GeographicProfile): number {
    let score = 0;
    if (a.hasPort === b.hasPort) score += 0.2;
    if (a.hasBorderCrossing === b.hasBorderCrossing) score += 0.15;
    if (a.isOnTradeCorridor === b.isOnTradeCorridor) score += 0.2;
    if (a.coastalAccess === b.coastalAccess) score += 0.15;
    if (a.proximityToCapital === b.proximityToCapital) score += 0.15;
    if (a.climateZone === b.climateZone) score += 0.15;
    return score;
  }

  private static scoreInstitutionalSimilarity(a: InstitutionalProfile, b: InstitutionalProfile): number {
    let score = 0;
    if (a.governanceQuality === b.governanceQuality) score += 0.3;
    if (a.regulatoryFramework === b.regulatoryFramework) score += 0.25;
    if (a.investorProtection === b.investorProtection) score += 0.2;
    if (a.specialEconomicZone === b.specialEconomicZone) score += 0.25;
    return score;
  }

  private static scoreSectorSimilarity(a: SectorProfile, b: SectorProfile): number {
    let score = 0;
    // Fuzzy sector matching
    const aSectors = [a.dominantSector, ...a.emergingSectors].map(s => s.toLowerCase());
    const bSectors = [b.dominantSector, ...b.emergingSectors].map(s => s.toLowerCase());

    for (const as of aSectors) {
      for (const bs of bSectors) {
        if (as.includes(bs.split('/')[0]) || bs.includes(as.split('/')[0])) {
          score += 0.3;
          break;
        }
      }
    }
    if (a.sectorMaturity === b.sectorMaturity) score += 0.2;
    return Math.min(1, score);
  }

  private static estimateTimeRelationship(aMaturity: string, bMaturity: string): string {
    const stages = ['nascent', 'growing', 'mature', 'declining'];
    const aIdx = stages.indexOf(aMaturity);
    const bIdx = stages.indexOf(bMaturity);
    const diff = bIdx - aIdx;
    if (diff === 0) return 'Same development stage';
    if (diff > 0) return `${diff * 5}-${diff * 10} years ahead`;
    return `${Math.abs(diff) * 5}-${Math.abs(diff) * 10} years behind`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ASPIRATION GAP ANALYSIS
  // ──────────────────────────────────────────────────────────────────────────

  private static detectAspirationGap(input: UserInputSnapshot, mirrors: MirrorMatch[]): AspirationGap | null {
    const allText = Object.values(input).join(' ').toLowerCase();
    let aspirational: string | null = null;

    for (const [city, _info] of Object.entries(ASPIRATIONAL_BENCHMARKS)) {
      if (allText.includes(city.toLowerCase())) {
        aspirational = city;
        break;
      }
    }

    if (!aspirational && mirrors.length === 0) return null;
    if (!aspirational) return null;

    const benchmarkInfo = ASPIRATIONAL_BENCHMARKS[aspirational];
    const structuralTwin = mirrors.length > 0 ? `${mirrors[0].mirrorRegion}, ${mirrors[0].country}` : 'No clear structural twin identified';

    return {
      aspirationalPeer: aspirational,
      structuralTwin,
      gapDimensions: benchmarkInfo.gap,
      realisticTimeline: `Closing the gap with ${aspirational} requires 15-25 years of sustained, deliberate policy and investment`,
      bridgeStrategies: [
        `Learn from structural twin (${structuralTwin}) for immediate strategies - they face the same constraints you do`,
        `Study ${aspirational}'s journey at YOUR current stage - not where they are today, but where they were 20 years ago`,
        `Focus on closing one gap dimension at a time: ${benchmarkInfo.gap[0]} is likely the highest-leverage starting point`,
        `Build narrative around authentic strengths rather than mimicking ${aspirational}'s model`
      ]
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INSIGHT GENERATION
  // ──────────────────────────────────────────────────────────────────────────

  private static generateInsights(profile: RegionalProfile, mirrors: MirrorMatch[]): string[] {
    const insights: string[] = [];

    if (mirrors.length === 0) {
      insights.push('No strong structural mirrors found - this region may have a unique profile that requires custom strategy rather than pattern replication');
      return insights;
    }

    const topMirror = mirrors[0];
    insights.push(`Strongest structural mirror: ${topMirror.mirrorRegion}, ${topMirror.country} (${Math.round(topMirror.overallSimilarity * 100)}% similarity)`);

    // Identify strongest and weakest similarity dimensions
    const dims = Object.entries(topMirror.dimensionScores);
    dims.sort((a, b) => b[1] - a[1]);
    insights.push(`Strongest structural overlap: ${dims[0][0]} (${Math.round(dims[0][1] * 100)}%)`);
    insights.push(`Weakest structural overlap: ${dims[dims.length - 1][0]} (${Math.round(dims[dims.length - 1][1] * 100)}%) - this is where divergent strategy may be needed`);

    // Cross-mirror pattern detection
    if (mirrors.length >= 3) {
      const commonStrategies = mirrors[0].transferableStrategies.filter(s =>
        mirrors.slice(1).some(m => m.transferableStrategies.some(ms =>
          ms.toLowerCase().split(' ').some(word => s.toLowerCase().includes(word) && word.length > 5)
        ))
      );
      if (commonStrategies.length > 0) {
        insights.push(`Common strategy across mirrors: ${commonStrategies[0]} - multiple structurally similar regions succeeded with this approach`);
      }
    }

    return insights;
  }

  private static generateRecommendations(mirrors: MirrorMatch[]): string[] {
    const recs: string[] = [];

    if (mirrors.length > 0) {
      recs.push(`Study ${mirrors[0].mirrorRegion}: ${mirrors[0].transferableStrategies[0]}`);
      if (mirrors[0].warnings.length > 0) {
        recs.push(`Warning from ${mirrors[0].mirrorRegion}: ${mirrors[0].warnings[0]}`);
      }
    }
    if (mirrors.length > 1) {
      recs.push(`Alternative model from ${mirrors[1].mirrorRegion}: ${mirrors[1].transferableStrategies[0]}`);
    }

    recs.push('Engage with mirror regions directly - site visits, IPA-to-IPA knowledge exchange, and strategy benchmarking');
    recs.push('Focus on transferable strategies, not aspirational imitation - what worked for your structural twin is more likely to work for you');

    return recs;
  }
}

export default RegionalMirroringEngine;
