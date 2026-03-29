/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * NETWORK EFFECT ENGINE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Maps the existing investor/company ecosystem in each city to quantify
 * network effects â€" the advantage of locating near complementary businesses,
 * suppliers, talent pools, and industry clusters.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface CompanyPresence {
  name: string;
  industry: string;
  headcount: number;
  yearEstablished: number;
  functions: string[];
}

export interface IndustryCluster {
  name: string;
  companies: number;
  totalEmployees: number;
  maturity: 'nascent' | 'growing' | 'mature';
  strengths: string[];
}

export interface NetworkProfile {
  cityId: string;
  city: string;
  country: string;
  majorCompanies: CompanyPresence[];
  industryClusters: IndustryCluster[];
  networkDensity: number; // 0-100: how many companies are already there
  complementarityScore: number; // 0-100: how well clusters support each other
  talentPoolEffect: number; // 0-100: talent availability due to cluster presence
  knowledgeSpillover: number; // 0-100: innovation/learning benefit
  overallNetworkScore: number;
  advantages: string[];
  limitations: string[];
}

// â"€â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const NETWORK_PROFILES: NetworkProfile[] = [
  {
    cityId: 'cebu-city',
    city: 'Cebu City',
    country: 'Philippines',
    majorCompanies: [
      { name: 'JPMorgan', industry: 'Financial Services', headcount: 4000, yearEstablished: 2019, functions: ['global operations', 'technology'] },
      { name: 'Accenture', industry: 'Technology Services', headcount: 3000, yearEstablished: 2015, functions: ['consulting', 'technology', 'operations'] },
      { name: 'Concentrix', industry: 'BPO', headcount: 5000, yearEstablished: 2010, functions: ['customer experience'] },
      { name: 'Qualfon', industry: 'BPO', headcount: 5000, yearEstablished: 2012, functions: ['customer management'] },
      { name: 'Lexmark Research & Development', industry: 'Technology', headcount: 1200, yearEstablished: 2008, functions: ['R&D', 'engineering'] },
      { name: 'Wipro', industry: 'IT Services', headcount: 1500, yearEstablished: 2016, functions: ['engineering', 'support'] },
    ],
    industryClusters: [
      { name: 'IT-BPO / Shared Services', companies: 200, totalEmployees: 175000, maturity: 'mature', strengths: ['Deep talent pool', 'Established training infrastructure', 'Multiple IT parks'] },
      { name: 'Tourism & Hospitality', companies: 500, totalEmployees: 80000, maturity: 'mature', strengths: ['International airport', 'Hotel infrastructure', 'Beach/resort proximity'] },
      { name: 'Furniture & Manufacturing', companies: 150, totalEmployees: 25000, maturity: 'mature', strengths: ['Export-oriented', 'Craft tradition', 'PEZA zones'] },
    ],
    networkDensity: 85,
    complementarityScore: 72,
    talentPoolEffect: 88,
    knowledgeSpillover: 70,
    overallNetworkScore: 79,
    advantages: ['Largest IT-BPO cluster outside Manila', 'Talent mobility within cluster reduces hiring risk', 'Mature service provider ecosystem', 'IT Park infrastructure creates natural networking'],
    limitations: ['IT-BPO dominant â€" less diversity', 'Companies compete fiercely for same talent', 'Limited R&D/innovation cluster'],
  },
  {
    cityId: 'davao-city',
    city: 'Davao City',
    country: 'Philippines',
    majorCompanies: [
      { name: 'Concentrix', industry: 'BPO', headcount: 3500, yearEstablished: 2017, functions: ['customer experience'] },
      { name: 'SITEL (now Foundever)', industry: 'BPO', headcount: 2200, yearEstablished: 2018, functions: ['customer experience'] },
      { name: 'Accenture', industry: 'Technology Services', headcount: 1800, yearEstablished: 2016, functions: ['technology', 'operations'] },
      { name: 'Dole Philippines', industry: 'Agriculture', headcount: 8000, yearEstablished: 1963, functions: ['processing', 'export'] },
      { name: 'Del Monte', industry: 'Agriculture', headcount: 5000, yearEstablished: 1968, functions: ['processing', 'distribution'] },
    ],
    industryClusters: [
      { name: 'IT-BPO', companies: 60, totalEmployees: 40000, maturity: 'growing', strengths: ['Fast growth', 'Lower attrition', 'Government support'] },
      { name: 'Agribusiness', companies: 200, totalEmployees: 50000, maturity: 'mature', strengths: ['Tropical agriculture hub', 'Export infrastructure', 'Processing expertise'] },
      { name: 'Defence & Government', companies: 30, totalEmployees: 15000, maturity: 'mature', strengths: ['Military bases', 'Government procurement', 'Security sector'] },
    ],
    networkDensity: 55,
    complementarityScore: 48,
    talentPoolEffect: 62,
    knowledgeSpillover: 45,
    overallNetworkScore: 53,
    advantages: ['Growing BPO cluster with lower competition for talent', 'Agribusiness ecosystem well-established', 'Government very supportive of new entrants'],
    limitations: ['Smaller total network', 'Less knowledge spillover', 'Fewer complementary industries', 'Limited tech startup ecosystem'],
  },
  {
    cityId: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    majorCompanies: [
      { name: 'Google', industry: 'Technology', headcount: 3000, yearEstablished: 2007, functions: ['engineering', 'cloud', 'APAC HQ'] },
      { name: 'Facebook/Meta', industry: 'Technology', headcount: 2500, yearEstablished: 2010, functions: ['engineering', 'APAC operations'] },
      { name: 'JPMorgan', industry: 'Financial Services', headcount: 5000, yearEstablished: 1964, functions: ['all banking functions'] },
      { name: 'Dyson', industry: 'Consumer Electronics', headcount: 1200, yearEstablished: 2019, functions: ['global HQ', 'R&D'] },
      { name: 'Procter & Gamble', industry: 'FMCG', headcount: 3000, yearEstablished: 1987, functions: ['APAC HQ', 'innovation center'] },
      { name: 'Sea Group', industry: 'Technology', headcount: 10000, yearEstablished: 2009, functions: ['global HQ', 'e-commerce', 'fintech'] },
    ],
    industryClusters: [
      { name: 'Financial Services', companies: 800, totalEmployees: 200000, maturity: 'mature', strengths: ['Global banking hub', 'MAS regulatory framework', 'Fintech sandbox'] },
      { name: 'Technology', companies: 4000, totalEmployees: 180000, maturity: 'mature', strengths: ['Global tech HQs', 'Venture capital', 'Deep tech talent'] },
      { name: 'Biomedical Sciences', companies: 300, totalEmployees: 25000, maturity: 'mature', strengths: ['Research hospitals', 'A*STAR research', 'Regulatory expertise'] },
      { name: 'Logistics & Supply Chain', companies: 500, totalEmployees: 150000, maturity: 'mature', strengths: ['World #1 port', 'Changi air cargo', 'Regional distribution hub'] },
    ],
    networkDensity: 98,
    complementarityScore: 95,
    talentPoolEffect: 92,
    knowledgeSpillover: 95,
    overallNetworkScore: 95,
    advantages: ['Maximum network density â€" every major company present', 'Unparalleled knowledge spillover', 'Venture capital concentration', 'Regulatory sandboxes available'],
    limitations: ['Extremely competitive for talent', 'Cost prohibitive for many', 'Working visa restrictions tightening'],
  },
  {
    cityId: 'townsville',
    city: 'Townsville',
    country: 'Australia',
    majorCompanies: [
      { name: 'Sun Metals (Korea Zinc)', industry: 'Minerals Processing', headcount: 450, yearEstablished: 2017, functions: ['refining', 'operations'] },
      { name: 'Raytheon Australia', industry: 'Defence', headcount: 200, yearEstablished: 2020, functions: ['maintenance', 'sustainment'] },
      { name: 'Sea Swift', industry: 'Maritime Logistics', headcount: 400, yearEstablished: 2005, functions: ['freight', 'logistics'] },
    ],
    industryClusters: [
      { name: 'Defence', companies: 40, totalEmployees: 15000, maturity: 'mature', strengths: ['Lavarack Barracks', 'RAAF Townsville', 'Defence supply chain'] },
      { name: 'Mining & Resources', companies: 30, totalEmployees: 8000, maturity: 'mature', strengths: ['Minerals processing', 'Mining services', 'Port infrastructure'] },
      { name: 'Marine Science', companies: 15, totalEmployees: 2000, maturity: 'growing', strengths: ['Great Barrier Reef research', 'AIMS', 'JCU marine labs'] },
    ],
    networkDensity: 30,
    complementarityScore: 35,
    talentPoolEffect: 28,
    knowledgeSpillover: 32,
    overallNetworkScore: 31,
    advantages: ['Defence cluster provides anchor employment', 'Niche marine science ecosystem', 'Government procurement access'],
    limitations: ['Very limited network density', 'Few complementary industries', 'Minimal tech/innovation presence', 'Small total ecosystem'],
  },
  {
    cityId: 'pagadian-city',
    city: 'Pagadian City',
    country: 'Philippines',
    majorCompanies: [
      { name: 'Century Pacific Food', industry: 'Food Processing', headcount: 450, yearEstablished: 2018, functions: ['processing', 'packaging'] },
      { name: 'Mega Sardines', industry: 'Fisheries', headcount: 800, yearEstablished: 2015, functions: ['processing', 'export'] },
    ],
    industryClusters: [
      { name: 'Fisheries & Marine Products', companies: 50, totalEmployees: 5000, maturity: 'mature', strengths: ['Fishing grounds proximity', 'Processing facilities', 'Export capability'] },
      { name: 'Agriculture', companies: 100, totalEmployees: 12000, maturity: 'mature', strengths: ['Rice', 'Coconut', 'Rubber', 'Palm oil'] },
    ],
    networkDensity: 12,
    complementarityScore: 15,
    talentPoolEffect: 10,
    knowledgeSpillover: 8,
    overallNetworkScore: 11,
    advantages: ['First-mover advantage â€" limited competition for talent', 'Community will rally around new employer', 'Government will provide exceptional support'],
    limitations: ['Near-zero existing network for non-agriculture', 'No knowledge spillover for tech/services', 'Must build ecosystem from scratch'],
  },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class NetworkEffectEngine {

  /** Get network profile for a city */
  static getProfile(cityId: string): NetworkProfile | null {
    return NETWORK_PROFILES.find(p => p.cityId === cityId) || null;
  }

  /** Get all profiles ranked by network score */
  static getRankings(): NetworkProfile[] {
    return [...NETWORK_PROFILES].sort((a, b) => b.overallNetworkScore - a.overallNetworkScore);
  }

  /** Check if a specific industry has a cluster in a city */
  static hasCluster(cityId: string, industry: string): IndustryCluster | null {
    const p = this.getProfile(cityId);
    if (!p) return null;
    return p.industryClusters.find(c => c.name.toLowerCase().includes(industry.toLowerCase())) || null;
  }

  /** Find cities with specific industry clusters */
  static findCitiesWithCluster(industry: string): Array<{ cityId: string; city: string; cluster: IndustryCluster }> {
    return NETWORK_PROFILES
      .filter(p => p.industryClusters.some(c => c.name.toLowerCase().includes(industry.toLowerCase())))
      .map(p => ({
        cityId: p.cityId,
        city: p.city,
        cluster: p.industryClusters.find(c => c.name.toLowerCase().includes(industry.toLowerCase()))!,
      }));
  }

  /** Compare network effects across cities */
  static compare(cityIds: string[]): Array<{
    city: string;
    networkScore: number;
    density: number;
    complementarity: number;
    talentPool: number;
    knowledgeSpillover: number;
    majorCompanyCount: number;
    topAdvantage: string;
  }> {
    return cityIds.map(id => {
      const p = this.getProfile(id);
      if (!p) return null;
      return {
        city: p.city,
        networkScore: p.overallNetworkScore,
        density: p.networkDensity,
        complementarity: p.complementarityScore,
        talentPool: p.talentPoolEffect,
        knowledgeSpillover: p.knowledgeSpillover,
        majorCompanyCount: p.majorCompanies.length,
        topAdvantage: p.advantages[0] || '',
      };
    }).filter(Boolean) as Array<{ city: string; networkScore: number; density: number; complementarity: number; talentPool: number; knowledgeSpillover: number; majorCompanyCount: number; topAdvantage: string }>;
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(cityId: string): string {
    const p = this.getProfile(cityId);
    if (!p) return '';
    const lines: string[] = [`\n### â"€â"€ NETWORK EFFECTS: ${p.city} (Score: ${p.overallNetworkScore}/100) â"€â"€`];
    lines.push(`**Density:** ${p.networkDensity} | **Complementarity:** ${p.complementarityScore} | **Talent Pool Effect:** ${p.talentPoolEffect} | **Knowledge Spillover:** ${p.knowledgeSpillover}`);
    lines.push(`**Major companies:** ${p.majorCompanies.slice(0, 4).map(c => `${c.name} (${c.headcount})`).join(', ')}`);
    lines.push(`**Industry clusters:** ${p.industryClusters.map(c => `${c.name} (${c.totalEmployees.toLocaleString()} employees, ${c.maturity})`).join(' | ')}`);
    lines.push(`**Advantages:** ${p.advantages.slice(0, 2).join(' | ')}`);
    lines.push(`**Limitations:** ${p.limitations.slice(0, 2).join(' | ')}`);
    return lines.join('\n');
  }
}
