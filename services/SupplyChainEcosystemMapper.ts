/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * SUPPLY CHAIN ECOSYSTEM MAPPER
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Maps the supplier, logistics, and partner ecosystem available at each
 * potential relocation destination. Answers: "If I move my operations here,
 * who can supply me, ship for me, and support me?"
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface SupplierEntry {
  category: string;
  examples: string[];
  maturity: 'established' | 'growing' | 'nascent';
  localAlternatives: number; // count of known local suppliers
}

export interface LogisticsProfile {
  portAccess: { name: string; distanceKm: number; containerCapacity: string };
  airportAccess: { name: string; distanceKm: number; cargoCapability: boolean; internationalRoutes: number };
  freightCorridors: string[];
  avgExportDays: Record<string, number>; // destination â†' days
}

export interface PartnerEcosystem {
  legalFirms: string[];
  accountingFirms: string[];
  hrRecruitmentAgencies: string[];
  itServiceProviders: string[];
  bankingPartners: string[];
  coworkingSpaces: string[];
}

export interface SupplyChainMap {
  cityId: string;
  city: string;
  country: string;
  suppliers: SupplierEntry[];
  logistics: LogisticsProfile;
  partners: PartnerEcosystem;
  supplyChainScore: number; // 0-100
  gaps: string[];
  advantages: string[];
}

// â"€â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const SUPPLY_CHAIN_MAPS: SupplyChainMap[] = [
  {
    cityId: 'cebu-city',
    city: 'Cebu City',
    country: 'Philippines',
    suppliers: [
      { category: 'IT Equipment & Hardware', examples: ['Silicon Valley Computer', 'Octagon', 'PC Express'], maturity: 'established', localAlternatives: 15 },
      { category: 'Office Furniture & Fit-out', examples: ['Mandaue Foam', 'Our Home', 'BLIMS'], maturity: 'established', localAlternatives: 20 },
      { category: 'Telecommunications', examples: ['PLDT Enterprise', 'Globe Business', 'Converge ICT'], maturity: 'established', localAlternatives: 5 },
      { category: 'Food & Catering', examples: ['Yellow Cab Corporate', 'Max\'s Catering', 'Local caterers'], maturity: 'established', localAlternatives: 50 },
      { category: 'Printing & Marketing Materials', examples: ['National Printing', 'Copy Central'], maturity: 'established', localAlternatives: 10 },
    ],
    logistics: {
      portAccess: { name: 'Port of Cebu', distanceKm: 5, containerCapacity: '1.2M TEUs/year' },
      airportAccess: { name: 'Mactan-Cebu International Airport', distanceKm: 15, cargoCapability: true, internationalRoutes: 35 },
      freightCorridors: ['Cebu-Manila (daily)', 'Cebu-Hong Kong (3x/week)', 'Cebu-Singapore (2x/week)', 'Cebu-Japan (weekly)'],
      avgExportDays: { 'Japan': 5, 'Australia': 7, 'USA West Coast': 18, 'Europe': 25, 'Singapore': 3 },
    },
    partners: {
      legalFirms: ['SyCip Salazar (regional)', 'Gullas & Associates', 'Cebu law firms cluster'],
      accountingFirms: ['SGV (EY)', 'P&A Grant Thornton', 'Local CPA firms'],
      hrRecruitmentAgencies: ['Manpower Cebu', 'Jobstreet Visayas', 'Sprout HR'],
      itServiceProviders: ['Yondu', 'Exist Software', 'Local MSPs'],
      bankingPartners: ['BPI', 'BDO', 'Metrobank', 'UnionBank'],
      coworkingSpaces: ['aSpace Cebu', 'The Company Cebu', 'KMC Solutions'],
    },
    supplyChainScore: 78,
    gaps: ['Limited high-end manufacturing suppliers', 'No local semiconductor sources', 'International courier options limited vs Manila'],
    advantages: ['Mature IT-BPO supply ecosystem', 'Port and airport proximity', 'Established service provider network'],
  },
  {
    cityId: 'davao-city',
    city: 'Davao City',
    country: 'Philippines',
    suppliers: [
      { category: 'IT Equipment & Hardware', examples: ['Octagon Davao', 'PC Express', 'Silicon Valley'], maturity: 'established', localAlternatives: 8 },
      { category: 'Office Furniture', examples: ['Mandaue Foam Davao', 'Our Home', 'Local suppliers'], maturity: 'established', localAlternatives: 12 },
      { category: 'Telecommunications', examples: ['PLDT Enterprise', 'Globe Business'], maturity: 'established', localAlternatives: 3 },
      { category: 'Agricultural Processing Equipment', examples: ['Dole Philippines suppliers', 'Del Monte chain'], maturity: 'established', localAlternatives: 20 },
    ],
    logistics: {
      portAccess: { name: 'Sasa Port / Davao International Container Terminal', distanceKm: 8, containerCapacity: '300K TEUs/year' },
      airportAccess: { name: 'Francisco Bangoy International Airport', distanceKm: 12, cargoCapability: true, internationalRoutes: 8 },
      freightCorridors: ['Davao-Manila (daily)', 'Davao-Cebu (daily)', 'Davao-Singapore (weekly)', 'Davao-General Santos (daily)'],
      avgExportDays: { 'Japan': 7, 'Australia': 8, 'USA West Coast': 20, 'Singapore': 5 },
    },
    partners: {
      legalFirms: ['Ponce Enrile Reyes & Manalastas (branch)', 'Local Davao firms'],
      accountingFirms: ['SGV Davao', 'Local CPA practices'],
      hrRecruitmentAgencies: ['Jobstreet Mindanao', 'KMC Davao'],
      itServiceProviders: ['ICT Davao members', 'Local MSPs'],
      bankingPartners: ['BPI', 'BDO', 'Metrobank', 'Landbank'],
      coworkingSpaces: ['Aeon Bldg spaces', 'Damosa IT Hub tenants'],
    },
    supplyChainScore: 62,
    gaps: ['Fewer international freight options', 'Limited high-tech suppliers', 'Courier delivery slower than Manila/Cebu'],
    advantages: ['Agricultural supply chain mature', 'Growing BPO support ecosystem', 'Lower supplier costs than Cebu'],
  },
  {
    cityId: 'townsville',
    city: 'Townsville',
    country: 'Australia',
    suppliers: [
      { category: 'IT & Technology', examples: ['Telstra Business', 'Ergon Energy', 'Local MSPs'], maturity: 'established', localAlternatives: 5 },
      { category: 'Defence & Engineering', examples: ['TAFE NQ graduates', 'Defence supply chain cluster'], maturity: 'established', localAlternatives: 15 },
      { category: 'Construction & Fit-out', examples: ['Hutchinson Builders', 'Local contractors'], maturity: 'established', localAlternatives: 20 },
      { category: 'Marine & Port Services', examples: ['Ports North contractors', 'Marine survey firms'], maturity: 'established', localAlternatives: 10 },
    ],
    logistics: {
      portAccess: { name: 'Port of Townsville', distanceKm: 5, containerCapacity: '500K tonnes/year' },
      airportAccess: { name: 'Townsville Airport', distanceKm: 6, cargoCapability: true, internationalRoutes: 2 },
      freightCorridors: ['Townsville-Brisbane (daily road/rail)', 'Townsville-Singapore (fortnightly)', 'Townsville-PNG (weekly)'],
      avgExportDays: { 'Singapore': 8, 'Japan': 12, 'USA': 25, 'PNG': 3, 'New Zealand': 10 },
    },
    partners: {
      legalFirms: ['Preston Law', 'Roberts & Kane', 'National firms with branches'],
      accountingFirms: ['BDO Townsville', 'Local practices'],
      hrRecruitmentAgencies: ['Hays NQ', 'Drake International'],
      itServiceProviders: ['ICT NQ', 'Managed service providers'],
      bankingPartners: ['Commonwealth Bank', 'NAB', 'Westpac', 'Suncorp'],
      coworkingSpaces: ['The Hub Townsville', 'Library innovation spaces'],
    },
    supplyChainScore: 60,
    gaps: ['Limited international freight routes', 'No major tech suppliers locally', 'Specialized supplies come from Brisbane (1400km)'],
    advantages: ['Defence supply chain established', 'Port expansion underway', 'Government procurement accessible'],
  },
  {
    cityId: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    suppliers: [
      { category: 'IT & Cloud Services', examples: ['AWS Singapore', 'Google Cloud', 'Azure', 'NCS Group'], maturity: 'established', localAlternatives: 50 },
      { category: 'Professional Services', examples: ['Big 4 accounting', 'Global law firms', 'McKinsey/BCG/Bain'], maturity: 'established', localAlternatives: 100 },
      { category: 'Financial Services', examples: ['DBS', 'OCBC', 'UOB', 'Global banks'], maturity: 'established', localAlternatives: 200 },
      { category: 'Logistics & Warehousing', examples: ['DHL', 'FedEx', 'UPS', 'Kerry Logistics'], maturity: 'established', localAlternatives: 30 },
    ],
    logistics: {
      portAccess: { name: 'Port of Singapore', distanceKm: 5, containerCapacity: '37M TEUs/year' },
      airportAccess: { name: 'Changi Airport', distanceKm: 20, cargoCapability: true, internationalRoutes: 380 },
      freightCorridors: ['Global hub â€" daily to all major ports', 'Air cargo to 100+ destinations'],
      avgExportDays: { 'Australia': 5, 'Japan': 4, 'USA West Coast': 16, 'Europe': 20, 'India': 5 },
    },
    partners: {
      legalFirms: ['Allen & Gledhill', 'Rajah & Tann', 'WongPartnership', 'Global firm branches'],
      accountingFirms: ['Deloitte', 'PwC', 'EY', 'KPMG'],
      hrRecruitmentAgencies: ['Robert Half', 'Michael Page', 'Hays'],
      itServiceProviders: ['NCS', 'ST Engineering', 'GovTech partners'],
      bankingPartners: ['DBS', 'OCBC', 'UOB', 'Standard Chartered', 'HSBC'],
      coworkingSpaces: ['WeWork', 'JustCo', 'The Great Room'],
    },
    supplyChainScore: 98,
    gaps: ['Extremely high costs', 'Limited manufacturing capability'],
    advantages: ['World-class logistics hub', 'Any supplier available', 'Regulatory clarity'],
  },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class SupplyChainEcosystemMapper {

  /** Get supply chain map for a specific city */
  static getMap(cityId: string): SupplyChainMap | null {
    return SUPPLY_CHAIN_MAPS.find(m => m.cityId === cityId) || null;
  }

  /** Get all mapped cities */
  static getAllMaps(): SupplyChainMap[] {
    return [...SUPPLY_CHAIN_MAPS];
  }

  /** Compare supply chain ecosystems */
  static compare(cityIds: string[]): {
    cities: Array<{ cityId: string; city: string; score: number; strengths: string[]; gaps: string[] }>;
    bestOverall: string;
  } {
    const maps = cityIds.map(id => this.getMap(id)).filter(Boolean) as SupplyChainMap[];
    const cities = maps.map(m => ({
      cityId: m.cityId,
      city: m.city,
      score: m.supplyChainScore,
      strengths: m.advantages,
      gaps: m.gaps,
    })).sort((a, b) => b.score - a.score);
    return { cities, bestOverall: cities[0]?.city || 'N/A' };
  }

  /** Find cities with a specific supplier category */
  static findBySupplierNeed(category: string): SupplyChainMap[] {
    return SUPPLY_CHAIN_MAPS.filter(m =>
      m.suppliers.some(s => s.category.toLowerCase().includes(category.toLowerCase()) && s.maturity !== 'nascent')
    );
  }

  /** Get logistics comparison */
  static compareLogistics(cityIds: string[], destination: string): Array<{ city: string; exportDays: number | null; freightRoutes: number }> {
    return cityIds.map(id => {
      const m = this.getMap(id);
      if (!m) return { city: id, exportDays: null, freightRoutes: 0 };
      return {
        city: m.city,
        exportDays: m.logistics.avgExportDays[destination] || null,
        freightRoutes: m.logistics.freightCorridors.length,
      };
    });
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(cityId: string): string {
    const m = this.getMap(cityId);
    if (!m) return '';
    const lines: string[] = [`\n### â"€â"€ SUPPLY CHAIN: ${m.city} (Score: ${m.supplyChainScore}/100) â"€â"€`];
    lines.push(`**Suppliers:** ${m.suppliers.map(s => `${s.category} (${s.maturity}, ${s.localAlternatives} local)`).join(' | ')}`);
    lines.push(`**Port:** ${m.logistics.portAccess.name} (${m.logistics.portAccess.distanceKm}km) | **Airport:** ${m.logistics.airportAccess.name} (${m.logistics.airportAccess.internationalRoutes} intl routes)`);
    lines.push(`**Export times:** ${Object.entries(m.logistics.avgExportDays).map(([k, v]) => `${k}: ${v}d`).join(', ')}`);
    lines.push(`**Service partners:** ${m.partners.legalFirms.length} legal, ${m.partners.accountingFirms.length} accounting, ${m.partners.hrRecruitmentAgencies.length} HR, ${m.partners.itServiceProviders.length} IT`);
    lines.push(`**Gaps:** ${m.gaps.join(' | ')}`);
    lines.push(`**Advantages:** ${m.advantages.join(' | ')}`);
    return lines.join('\n');
  }
}
