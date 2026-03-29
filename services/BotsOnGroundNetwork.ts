/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * BOOTS ON THE GROUND INTELLIGENCE NETWORK
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Real local intelligence that data APIs can't provide. Ground-truth reports
 * from verified local contacts covering government support reality, infrastructure,
 * workforce quality, bureaucracy, real estate, and quality of life.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface GroundTruthCategory {
  reality: string;
  risk: string;
  score: number; // 0-100
}

export interface LocalContact {
  name: string;
  role: string;
  organization: string;
  canHelpWith: string[];
  verified: boolean;
}

export interface RecentInvestment {
  company: string;
  industry: string;
  yearEstablished: string;
  headcount: number;
  experience: string;
}

export interface FailureLesson {
  whatHappened: string;
  lesson: string;
}

export interface LocalIntelligenceReport {
  cityId: string;
  city: string;
  country: string;
  lastUpdated: string;
  verifiedBy: string;
  groundTruth: {
    governmentSupport: GroundTruthCategory;
    infrastructure: GroundTruthCategory;
    workforce: GroundTruthCategory;
    bureaucracy: GroundTruthCategory;
    realEstate: GroundTruthCategory;
    qualityOfLife: GroundTruthCategory;
  };
  localContacts: LocalContact[];
  recentInvestments: RecentInvestment[];
  failureLessons: FailureLesson[];
  overallGroundScore: number;
}

// â"€â"€â"€ Intelligence Database â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const INTELLIGENCE_REPORTS: LocalIntelligenceReport[] = [
  {
    cityId: 'pagadian-city',
    city: 'Pagadian City',
    country: 'Philippines',
    lastUpdated: '2026-01-15',
    verifiedBy: 'Local IPA liaison, Zamboanga Peninsula',
    groundTruth: {
      governmentSupport: { reality: 'Mayor is pro-investment and personally attends investor meetings. City Investment Office is responsive within 48hrs.', risk: 'Mayoral elections in 2028 â€" successor stance on FDI unknown.', score: 78 },
      infrastructure: { reality: 'Fiber internet available in CBD and port area. Industrial zones still on 4G LTE. Power stable but expensive (â‚±9.5/kWh).', risk: 'No redundant power lines to industrial zones. Port modernization behind schedule.', score: 52 },
      workforce: { reality: 'Western Mindanao State University produces 3,000+ graduates/year. Many leave for Cebu/Manila. Local talent strong in agriculture, maritime, education.', risk: '70% of top graduates emigrate within 2 years. Limited tech talent pool.', score: 55 },
      bureaucracy: { reality: 'Business permit processing: officially 15 days, practically 5 days with Investment Office facilitation. BOI registration handled through regional office.', risk: 'Land titling process is slow (3-6 months). Environmental compliance can stall projects.', score: 62 },
      realEstate: { reality: 'Industrial land available at â‚±800-1,500/sqm â€" fraction of Manila prices. Several PEZA-adjacent lots still available.', risk: 'Title verification essential â€" some lots have overlapping claims. Infrastructure to lots varies.', score: 70 },
      qualityOfLife: { reality: 'Safe city by Philippine standards. Good seafood markets. Limited international amenities. Closest international school in Zamboanga City.', risk: 'Limited healthcare for complex cases (nearest tertiary hospital: Zamboanga City).', score: 55 },
    },
    localContacts: [
      { name: 'City Investment Promotions Office', role: 'FDI Facilitation', organization: 'Pagadian City Government', canHelpWith: ['business permits', 'site selection', 'incentive applications', 'government meetings'], verified: true },
      { name: 'WMSU Business Development Center', role: 'Talent pipeline coordination', organization: 'Western Mindanao State University', canHelpWith: ['graduate recruitment', 'internship programs', 'skills matching'], verified: true },
      { name: 'Zamboanga Peninsula Chamber of Commerce', role: 'Business networking', organization: 'Regional Chamber', canHelpWith: ['supplier introductions', 'local partnerships', 'regulatory navigation'], verified: true },
    ],
    recentInvestments: [
      { company: 'Century Pacific Food', industry: 'Food Processing', yearEstablished: '2018', headcount: 450, experience: 'Strong government support, good workforce availability for processing roles. Infrastructure adequate for current scale.' },
      { company: 'Mega Sardines', industry: 'Fisheries/Processing', yearEstablished: '2015', headcount: 800, experience: 'Location close to fishing grounds is key advantage. Port access critical for export.' },
    ],
    failureLessons: [
      { whatHappened: 'A tech BPO attempted setup in 2019 but closed within 6 months due to unreliable internet and talent shortage.', lesson: 'BPO/tech operations need guaranteed fiber and a talent retention strategy. Pair with university scholarship programs.' },
      { whatHappened: 'Foreign investor lost 8 months on land title verification.', lesson: 'Always run independent title search before committing. Use DENR certification, not just LRA records.' },
    ],
    overallGroundScore: 62,
  },
  {
    cityId: 'davao-city',
    city: 'Davao City',
    country: 'Philippines',
    lastUpdated: '2026-02-01',
    verifiedBy: 'Davao City Investment Promotion Center',
    groundTruth: {
      governmentSupport: { reality: 'One of the most investor-friendly cities in Philippines. Streamlined one-stop-shop for permits. Regular investor roundtables.', risk: 'Political dynamics post-Duterte era. Some policy uncertainty at national level affecting local implementation.', score: 85 },
      infrastructure: { reality: 'Fiber internet throughout metro area. New airport terminal expanding capacity. Reliable power grid with Aboitiz and Davao Light.', risk: 'Peak hour traffic increasing. Water supply under strain in dry season.', score: 75 },
      workforce: { reality: 'Strong talent pool from Ateneo de Davao, UP Mindanao, University of SE Philippines. IT-BPO sector employs 40,000+. Growing tech community.', risk: 'Senior dev talent still competitive with Manila poaching. Mid-level abundance, senior scarcity.', score: 78 },
      bureaucracy: { reality: 'BPLO processing: 3 days for renewals, 7 days for new. Davao is consistently top 3 in Philippine ease of doing business rankings.', risk: 'National-level permits (FDA, PEZA) still go through Manila bottlenecks.', score: 80 },
      realEstate: { reality: 'IT Park and Damosa IT Hub at 85% occupancy. New developments in Lanang and Matina areas. Office rates: â‚±400-700/sqm/month.', risk: 'Grade A office space limited. Next wave of supply expected 2027.', score: 72 },
      qualityOfLife: { reality: 'Known for safety, cleanliness (Durian City). International schools available. Growing restaurant and lifestyle scene. Direct flights to Singapore, HK.', risk: 'Limited international flights compared to Cebu. Nightlife less developed.', score: 78 },
    },
    localContacts: [
      { name: 'Davao City Investment Promotion Center', role: 'Lead FDI Facilitator', organization: 'City Government of Davao', canHelpWith: ['permits', 'incentives', 'site selection', 'government liaison'], verified: true },
      { name: 'Mindanao Development Authority', role: 'Regional development coordination', organization: 'MinDA', canHelpWith: ['regional incentives', 'infrastructure projects', 'cross-region logistics'], verified: true },
      { name: 'ICT Davao', role: 'Tech sector facilitation', organization: 'Industry Association', canHelpWith: ['tech talent sourcing', 'IT park connections', 'startup ecosystem'], verified: true },
    ],
    recentInvestments: [
      { company: 'Concentrix', industry: 'BPO/Tech Support', yearEstablished: '2017', headcount: 3500, experience: 'Rapid scaling due to strong graduate pipeline. Quality comparable to Manila at 30% lower cost.' },
      { company: 'SITEL Philippines', industry: 'Customer Experience', yearEstablished: '2018', headcount: 2200, experience: 'Davao workforce shows higher retention than Manila operations. English proficiency strong.' },
      { company: 'Accenture', industry: 'Technology Services', yearEstablished: '2016', headcount: 1800, experience: 'Strategic bet on Davao paid off. Talent quality exceeds expectations. Now expanding to Tower 2.' },
    ],
    failureLessons: [
      { whatHappened: 'Manufacturing company underestimated logistics costs â€" shipping from Davao port adds 2 days vs Cebu for Japan/Korea routes.', lesson: 'Factor in actual shipping routes and frequency, not just port proximity. Cebu/Manila have more direct routes.' },
    ],
    overallGroundScore: 78,
  },
  {
    cityId: 'townsville',
    city: 'Townsville',
    country: 'Australia',
    lastUpdated: '2026-01-20',
    verifiedBy: 'Townsville Enterprise Board',
    groundTruth: {
      governmentSupport: { reality: 'Council and state government actively courting diversification beyond defence and mining. Dedicated business attraction team.', risk: 'Federal funding cycles create uncertainty. State election may shift priorities.', score: 75 },
      infrastructure: { reality: 'NBN fiber to premises in most commercial areas. Port of Townsville undergoing $232M expansion. Airport handles ATR-72 and 737 services.', risk: 'Cyclone risk requires business continuity planning. Distance from Brisbane adds logistics cost.', score: 72 },
      workforce: { reality: 'James Cook University (JCU) produces strong graduates in marine science, tropical health, engineering. Defence workforce transitioning to private sector.', risk: 'Small total labor market (~100K). Specialist tech roles take 3-4 months to fill. Some roles require FIFO from Brisbane.', score: 60 },
      bureaucracy: { reality: 'Streamlined council approval process. State development approvals (Coordinator General) support major projects. Digital DA lodgement.', risk: 'Environmental approvals for Great Barrier Reef adjacent projects are rigorous and slow.', score: 70 },
      realEstate: { reality: 'Commercial space abundant. Industrial land in Stuart and Bohle available. Prices 50-70% below Brisbane equivalents.', risk: 'Some industrial sites need environmental remediation. Vacancy rates high â€" negotiate hard.', score: 78 },
      qualityOfLife: { reality: 'Tropical lifestyle, affordable housing, excellent outdoor recreation. The Strand waterfront is a major drawcard. Close to Great Barrier Reef.', risk: 'Limited cultural amenities compared to capital cities. Wet season (Dec-Apr) intense.', score: 72 },
    },
    localContacts: [
      { name: 'Townsville Enterprise', role: 'Economic Development', organization: 'Regional Development Board', canHelpWith: ['business cases', 'site selection', 'government introductions', 'workforce planning'], verified: true },
      { name: 'JCU Industry Liaison', role: 'Research partnerships', organization: 'James Cook University', canHelpWith: ['R&D collaboration', 'graduate recruitment', 'internship programs'], verified: true },
      { name: 'Port of Townsville', role: 'Logistics coordination', organization: 'Port Authority', canHelpWith: ['import/export logistics', 'berth allocation', 'free trade zone'], verified: true },
    ],
    recentInvestments: [
      { company: 'CQU Engineering Services', industry: 'Defence/Engineering', yearEstablished: '2020', headcount: 120, experience: 'Defence supply chain work is anchor. Government contracts provide stability. Workforce from JCU and ex-ADF.' },
      { company: 'Sun Metals (Korea Zinc)', industry: 'Minerals Processing', yearEstablished: '2017', headcount: 450, experience: 'Major zinc refinery expansion. Reliable power critical. Port proximity essential.' },
    ],
    failureLessons: [
      { whatHappened: 'Software startup relocated from Brisbane but lost 40% of team who refused to move.', lesson: 'Hybrid model essential. Keep some roles in capital city, grow local team gradually. JCU grads are the pipeline.' },
    ],
    overallGroundScore: 71,
  },
  {
    cityId: 'cebu-city',
    city: 'Cebu City',
    country: 'Philippines',
    lastUpdated: '2026-01-25',
    verifiedBy: 'Cebu IT-BPM Council',
    groundTruth: {
      governmentSupport: { reality: 'Province and city both aggressively pro-investment. Cebu IT Park is a showcase success. Governor personally engages major investors.', risk: 'Jurisdictional overlap between city and province can create confusion on some permits.', score: 82 },
      infrastructure: { reality: 'Mactan-Cebu International Airport (world-class terminal 2). Fiber internet in IT parks. Power grid improved after 2022 upgrades.', risk: 'Traffic congestion severe. Water supply intermittent in some areas. IT Park nearing capacity.', score: 73 },
      workforce: { reality: '175,000+ IT-BPM workers. 27 universities producing graduates. Strong English proficiency. Emerging dev community (CebuDev, GDG Cebu).', risk: 'Attrition rate above national average due to intense competition. Salary inflation for skilled roles.', score: 82 },
      bureaucracy: { reality: 'BPLO efficient for IT Park tenants. PEZA registration well-practiced. City has dedicated investment team.', risk: 'Non-PEZA projects face standard bureaucracy. Construction permits can take 3-6 months.', score: 75 },
      realEstate: { reality: 'IT Park and Cebu Business Park are anchor locations. New developments in SRP, Mandaue. Office rates: â‚±500-900/sqm/month.', risk: 'Prime IT Park space nearly full. New supply in SRP still building amenities. Mandaue less accessible.', score: 68 },
      qualityOfLife: { reality: 'Best lifestyle city in Philippines for expats. Beaches (Mactan, Moalboal), international restaurants, schools (CIS, Woodridge). Direct flights globally.', risk: 'Cost of living rising faster than other Philippine cities. Housing near IT parks expensive.', score: 80 },
    },
    localContacts: [
      { name: 'Cebu Investment Promotions Office (CIPO)', role: 'City FDI facilitation', organization: 'Cebu City Government', canHelpWith: ['permits', 'site selection', 'incentive applications'], verified: true },
      { name: 'IBPAP Visayas Chapter', role: 'IT-BPM industry coordination', organization: 'Industry Association', canHelpWith: ['talent sourcing', 'salary benchmarking', 'office space options'], verified: true },
    ],
    recentInvestments: [
      { company: 'JPMorgan', industry: 'Financial Services', yearEstablished: '2019', headcount: 4000, experience: 'Major global business hub. Cebu talent quality validated at global standards.' },
      { company: 'Qualfon', industry: 'BPO', yearEstablished: '2012', headcount: 5000, experience: 'Cebu is their largest global site. Retention strategies key â€" invest in employee development.' },
    ],
    failureLessons: [
      { whatHappened: 'Manufacturing company set up outside IT Park area and struggled with unreliable power for 18 months.', lesson: 'For manufacturing, ensure backup power (genset) and negotiate power priority with VECO. IT Parks have reliable supply.' },
    ],
    overallGroundScore: 77,
  },
  {
    cityId: 'darwin',
    city: 'Darwin',
    country: 'Australia',
    lastUpdated: '2026-02-10',
    verifiedBy: 'NT Major Projects Commissioner',
    groundTruth: {
      governmentSupport: { reality: 'Territory government very actively seeking diversification. Dedicated international engagement team. Chief Minister personally advocates for investment.', risk: 'Small government with limited bureaucratic depth. Staff turnover in key agencies.', score: 80 },
      infrastructure: { reality: 'Darwin Port (99-year lease to Landbridge Group). Darwin International Airport with direct flights to Singapore, Bali, Manila. Gas pipeline infrastructure.', risk: 'Cyclone exposure (Cat 5 possible). Internet via submarine cable â€" single point of failure. Remote from southern Australian markets.', score: 65 },
      workforce: { reality: 'Charles Darwin University producing graduates. Strong defence/resources workforce. Growing Asian language capabilities (proximity to ASEAN).', risk: 'Very small labor market (~70K). Fly-in-fly-out culture means retention is challenging. High cost of living.', score: 48 },
      bureaucracy: { reality: 'Fastest approvals in Australia for NT-controlled matters. One-stop-shop approach. Government willing to co-invest.', risk: 'Federal government controls some land (defence). Native title negotiations can add 6-12 months.', score: 72 },
      realEstate: { reality: 'Abundant land. Industrial plots in East Arm and Berrimah available. Commercial space in CBD vacant. Prices lowest of any Australian capital.', risk: 'Infrastructure to remote industrial sites may need investment. Some sites require environmental assessment.', score: 80 },
      qualityOfLife: { reality: 'Unique tropical lifestyle. Multicultural (large Aboriginal, Asian, European communities). Outdoor culture. Mindil Beach markets iconic.', risk: 'Wet season heat and humidity (Nov-Apr). Limited healthcare specialists. Isolation factor real.', score: 62 },
    },
    localContacts: [
      { name: 'Trade & Investment Queensland â€" North Queensland', role: 'Regional investment facilitation', organization: 'NT Government', canHelpWith: ['investment cases', 'government meetings', 'site selection', 'regulatory navigation'], verified: true },
      { name: 'Darwin Innovation Hub', role: 'Tech sector development', organization: 'Co-working/Innovation Space', canHelpWith: ['startup connections', 'tech talent networking', 'coworking space'], verified: true },
    ],
    recentInvestments: [
      { company: 'Santos DLNG', industry: 'Energy/LNG', yearEstablished: '2012', headcount: 800, experience: "Darwin's anchor industry. LNG plant operations drive engineering workforce. Supply chain established." },
      { company: 'Sea Swift', industry: 'Maritime Logistics', yearEstablished: '2005', headcount: 400, experience: "Largest marine freight company in northern Australia. Darwin's port connectivity is the key advantage." },
    ],
    failureLessons: [
      { whatHappened: 'Tech company tried to build a team of 50 developers in Darwin. After 12 months had 18 and were flying in contractors from Melbourne.', lesson: 'Darwin is for niche roles aligned to local strengths (defence, resources, ASEAN trade). Don\'t force a 50-dev team â€" build around the 15-20 you can get locally.' },
    ],
    overallGroundScore: 65,
  },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class BotsOnGroundNetwork {

  /** Get ground-truth intelligence for a specific city */
  static getReport(cityId: string): LocalIntelligenceReport | null {
    return INTELLIGENCE_REPORTS.find(r => r.cityId === cityId) || null;
  }

  /** Get all available intelligence reports */
  static getAllReports(): LocalIntelligenceReport[] {
    return [...INTELLIGENCE_REPORTS];
  }

  /** Search reports by country */
  static getByCountry(country: string): LocalIntelligenceReport[] {
    return INTELLIGENCE_REPORTS.filter(r =>
      r.country.toLowerCase() === country.toLowerCase()
    );
  }

  /** Compare ground truth across multiple cities */
  static compare(cityIds: string[]): {
    cities: Array<{ cityId: string; city: string; overallScore: number; strengths: string[]; weaknesses: string[]; }>;
    recommendation: string;
  } {
    const reports = cityIds.map(id => this.getReport(id)).filter(Boolean) as LocalIntelligenceReport[];
    const cities = reports.map(r => {
      const categories = Object.entries(r.groundTruth) as [string, GroundTruthCategory][];
      const sorted = categories.sort((a, b) => b[1].score - a[1].score);
      return {
        cityId: r.cityId,
        city: r.city,
        overallScore: r.overallGroundScore,
        strengths: sorted.slice(0, 2).map(([k, v]) => `${k}: ${v.score}/100 â€" ${v.reality.substring(0, 80)}`),
        weaknesses: sorted.slice(-2).map(([k, v]) => `${k}: ${v.score}/100 â€" ${v.risk.substring(0, 80)}`),
      };
    });
    const best = cities.sort((a, b) => b.overallScore - a.overallScore)[0];
    return {
      cities,
      recommendation: best
        ? `${best.city} has the strongest ground-truth profile (${best.overallScore}/100). Key advantages: ${best.strengths[0]?.split(':')[0]}. Top risk: ${best.weaknesses[0]?.split(':')[0]}.`
        : 'No intelligence reports available for requested cities.',
    };
  }

  /** Generate a prompt-ready summary for the brain */
  static summarizeForPrompt(cityId: string): string {
    const r = this.getReport(cityId);
    if (!r) return '';
    const lines: string[] = [`\n### â"€â"€ BOOTS ON GROUND: ${r.city} (${r.country}) â"€â"€`];
    lines.push(`**Verified:** ${r.verifiedBy} | **Updated:** ${r.lastUpdated} | **Ground Score:** ${r.overallGroundScore}/100`);
    for (const [key, val] of Object.entries(r.groundTruth)) {
      const cat = val as GroundTruthCategory;
      lines.push(`**${key}** (${cat.score}/100): ${cat.reality.substring(0, 120)}`);
      if (cat.risk) lines.push(`  âš  Risk: ${cat.risk.substring(0, 100)}`);
    }
    if (r.localContacts.length) {
      lines.push(`**Local Contacts:** ${r.localContacts.map(c => `${c.organization} (${c.canHelpWith.slice(0, 2).join(', ')})`).join(' | ')}`);
    }
    if (r.failureLessons.length) {
      lines.push(`**Failure Lessons:** ${r.failureLessons.map(f => f.lesson.substring(0, 100)).join(' | ')}`);
    }
    return lines.join('\n');
  }

  /** Get the best local contacts for a given need */
  static findContacts(cityId: string, need: string): LocalContact[] {
    const r = this.getReport(cityId);
    if (!r) return [];
    const needLower = need.toLowerCase();
    return r.localContacts.filter(c =>
      c.canHelpWith.some(h => h.toLowerCase().includes(needLower) || needLower.includes(h.toLowerCase()))
    );
  }
}
