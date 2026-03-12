/**
 * 
 * HISTORICAL PARALLEL MATCHER
 * 
 *
 * Surfaces past cases, historical precedents, and documented outcomes that
 * match the user's current situation. This is the "institutional memory" 
 * of 60 years of partnership methodology " made accessible.
 *
 * When a user enters a scenario, this engine answers:
 *   "What happened before when someone tried something similar?"
 *
 * Data sources:
 *   1. BacktestingCalibrationEngine historical cases
 *   2. MethodologyKnowledgeBase documented patterns
 *   3. PatternConfidenceEngine pattern library
 *
 * 
 */

import { ReportParameters } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface HistoricalCase {
  caseId: string;
  title: string;
  year: number;
  country: string;
  region: string;
  sector: string;
  initiative: string;
  outcome: 'success' | 'partial-success' | 'failed' | 'ongoing';
  description: string;
  keyFactors: string[];
  lessonsLearned: string[];
  relevanceScore: number; // 0-100, how relevant to user's situation
  whatWorked: string[];
  whatFailed: string[];
  timeToOutcome: string;
}

export interface ParallelMatchResult {
  timestamp: string;
  userSituation: string;
  matches: HistoricalCase[];
  synthesisInsight: string;
  successRate: number; // % of similar historical cases that succeeded
  commonSuccessFactors: string[];
  commonFailureFactors: string[];
  recommendedActions: string[];
}

// ============================================================================
// HISTORICAL CASE LIBRARY
// ============================================================================

const HISTORICAL_CASES: Omit<HistoricalCase, 'relevanceScore'>[] = [
  {
    caseId: 'HC-001',
    title: 'Shenzhen Special Economic Zone',
    year: 1980,
    country: 'China',
    region: 'Asia-Pacific',
    sector: 'Manufacturing',
    initiative: 'special-economic-zone',
    outcome: 'success',
    description: 'China designated Shenzhen as its first SEZ, offering tax holidays, duty-free imports, and simplified regulations to attract FDI. Grew from fishing village to tech metropolis.',
    keyFactors: ['Strong government commitment', 'Infrastructure investment', 'Proximity to Hong Kong', 'Labour cost advantage'],
    lessonsLearned: ['SEZs require 10-15 year commitment before full returns', 'Infrastructure must precede investment attraction', 'Success breeds its own challenges (costs rise, incentives phase out)'],
    whatWorked: ['Tax holidays attracted initial manufacturing FDI', 'Graduated incentive phase-out prevented shock', 'Technology transfer requirements evolved with maturity'],
    whatFailed: ['Initial infrastructure was inadequate', 'Environmental regulations lagged behind growth', 'Income inequality between zone and hinterland'],
    timeToOutcome: '10-15 years to global recognition'
  },
  {
    caseId: 'HC-002',
    title: 'PEZA Philippines Export Zones',
    year: 1995,
    country: 'Philippines',
    region: 'Asia-Pacific',
    sector: 'Electronics',
    initiative: 'investment-attraction',
    outcome: 'success',
    description: 'PEZA created 400+ economic zones attracting $40B+ in investments, primarily in electronics and BPO, making Philippines a global back-office powerhouse.',
    keyFactors: ['English-speaking workforce', 'Competitive labour costs', 'PEZA one-stop shop', 'Stable incentive framework'],
    lessonsLearned: ['One-stop-shop agencies dramatically reduce red tape', 'Sector specialisation creates cluster effects', 'Incentive stability matters more than incentive generosity'],
    whatWorked: ['Simplified registration process', 'Income tax holiday + 5% gross income tax post-holiday', 'Sector-focused zone development'],
    whatFailed: ['Infrastructure outside zones remained weak', 'Over-reliance on a few sectors', 'Limited technology transfer initially'],
    timeToOutcome: '5-8 years to significant FDI flows'
  },
  {
    caseId: 'HC-003',
    title: 'Rwanda IT Hub Development',
    year: 2010,
    country: 'Rwanda',
    region: 'Africa',
    sector: 'Technology',
    initiative: 'technology-hub',
    outcome: 'success',
    description: 'Rwanda\'s Vision 2020 tech strategy built Kigali Innovation City, attracted major tech companies, and achieved Africa\'s fastest broadband penetration growth.',
    keyFactors: ['Strong political will', 'Anti-corruption governance', 'Smart incentive design', 'Digital-first policy'],
    lessonsLearned: ['Small countries can leapfrog through tech focus', 'Governance quality trumps market size', 'Digital infrastructure enables sector-agnostic growth'],
    whatWorked: ['E-government services', 'Drone delivery partnerships', 'Clean business environment reputation'],
    whatFailed: ['Limited local tech talent initially', 'Small domestic market size', 'Regional instability perception'],
    timeToOutcome: '8-10 years for international recognition'
  },
  {
    caseId: 'HC-004',
    title: 'Malaysia Multimedia Super Corridor',
    year: 1996,
    country: 'Malaysia',
    region: 'Asia-Pacific',
    sector: 'Technology',
    initiative: 'technology-corridor',
    outcome: 'partial-success',
    description: 'Ambitious plan to create an Asian Silicon Valley. Attracted some tech investment but didn\'t achieve Silicon Valley status. Later evolved into broader digital economy focus.',
    keyFactors: ['Government investment', 'International advisory panel', 'Incentive packages', 'Infrastructure corridor'],
    lessonsLearned: ['Cannot replicate Silicon Valley through government edict', 'Organic ecosystem growth matters more than top-down planning', 'Adaptation strategy when initial vision proves overambitious'],
    whatWorked: ['MSC status companies received meaningful tax incentives', 'Good physical infrastructure', 'Attracted some global firms'],
    whatFailed: ['Overambitious branding created expectation gap', 'Brain drain to Singapore', 'Bureaucratic processes despite one-stop shop intention'],
    timeToOutcome: 'Ongoing - pivoted strategy in 2010s'
  },
  {
    caseId: 'HC-005',
    title: 'Dubai Free Zones Model',
    year: 2000,
    country: 'UAE',
    region: 'Middle East',
    sector: 'Multi-sector',
    initiative: 'free-zone-cluster',
    outcome: 'success',
    description: 'Dubai created 30+ specialised free zones (JAFZA, DMCC, DIFC, etc.) each targeting specific sectors, attracting 30,000+ companies.',
    keyFactors: ['0% corporate tax', '100% foreign ownership', 'Sector specialisation', 'World-class infrastructure'],
    lessonsLearned: ['Sector-specific zones create critical mass faster than general zones', 'Premium infrastructure justifies premium costs', 'Free zones can co-exist with onshore regulation if boundaries are clear'],
    whatWorked: ['Full foreign ownership in zones', 'No personal income tax', 'Efficient dispute resolution (DIFC courts)'],
    whatFailed: ['Disconnect between free zone and mainland legal systems', 'Cost escalation reduced competitiveness', 'Labour rights concerns'],
    timeToOutcome: '5-10 years per zone to critical mass'
  },
  {
    caseId: 'HC-006',
    title: 'Myanmar Opening 2011-2021',
    year: 2011,
    country: 'Myanmar',
    region: 'Asia-Pacific',
    sector: 'Multi-sector',
    initiative: 'market-opening',
    outcome: 'failed',
    description: 'Myanmar\'s 2011 opening attracted billions in investment commitments. The 2021 military coup destroyed most partnerships and investment plans.',
    keyFactors: ['Political instability', 'Sanctions risk', 'Large untapped market', 'Cheap labour'],
    lessonsLearned: ['Political risk can override all economic fundamentals', 'Diversification across countries is essential', 'Partnership structures must include political risk contingencies', 'Due diligence on governance trajectory is non-negotiable'],
    whatWorked: ['Initial enthusiasm and deal flow was strong', 'Telecoms sector saw rapid growth'],
    whatFailed: ['Inadequate political risk assessment by investors', 'Over-reliance on political stability trajectory', 'Exit costs were devastating for trapped investors'],
    timeToOutcome: '10 years of growth reversed in 1 year'
  },
  {
    caseId: 'HC-007',
    title: 'Costa Rica Intel & Medical Devices',
    year: 1997,
    country: 'Costa Rica',
    region: 'Latin America',
    sector: 'Electronics & Medical',
    initiative: 'sector-development',
    outcome: 'success',
    description: 'Costa Rica attracted Intel (1997) then pivoted to medical devices after Intel left (2014), building a diversified tech/medical export hub.',
    keyFactors: ['Educated workforce', 'Political stability', 'Strategic US proximity', 'Proactive investment promotion'],
    lessonsLearned: ['Don\'t build economy around single anchor tenant', 'Sector diversification is essential risk management', 'Adaptive strategy when anchor firms leave'],
    whatWorked: ['CINDE investment promotion agency effectiveness', 'Free zone incentive structure', 'Education system investment'],
    whatFailed: ['Over-dependence on Intel initially', 'When Intel left, had to rapidly diversify', 'Salary escalation in established sectors'],
    timeToOutcome: '5 years for initial anchor, 15 years for diversified cluster'
  },
  {
    caseId: 'HC-008',
    title: 'Vietnam FDI Manufacturing Boom',
    year: 2015,
    country: 'Vietnam',
    region: 'Asia-Pacific',
    sector: 'Manufacturing',
    initiative: 'manufacturing-fdi',
    outcome: 'success',
    description: 'Vietnam capitalised on US-China trade tensions to attract manufacturing FDI, becoming Samsung\'s largest global production base and a major electronics exporter.',
    keyFactors: ['Trade tension beneficiary', 'Young workforce', 'Competitive costs', 'Improving infrastructure'],
    lessonsLearned: ['Geopolitical shifts create windows of opportunity', 'First movers in redirected supply chains capture disproportionate value', 'Infrastructure investment must keep pace with FDI growth'],
    whatWorked: ['Bilateral trade agreements (CPTPP, EVFTA)', 'Industrial zone development', 'Samsung anchor investment created ecosystem'],
    whatFailed: ['Power grid infrastructure strained', 'Skills gap in advanced manufacturing', 'Environmental compliance challenges'],
    timeToOutcome: '3-5 years for major supply chain shifts'
  },
  {
    caseId: 'HC-009',
    title: 'India-Japan Infrastructure Corridor',
    year: 2017,
    country: 'India',
    region: 'Asia-Pacific',
    sector: 'Infrastructure',
    initiative: 'bilateral-corridor',
    outcome: 'partial-success',
    description: 'India-Japan Act East initiative for industrial corridors (Delhi-Mumbai, Chennai-Bangalore). Large ambitions but implementation delayed by land acquisition and bureaucracy.',
    keyFactors: ['Bilateral government commitment', 'Japanese financing', 'Indian demographic dividend', 'Infrastructure deficit'],
    lessonsLearned: ['Government-to-government commitments don\'t guarantee implementation speed', 'Land acquisition is the #1 bottleneck in India', 'Patient capital is essential for infrastructure corridors'],
    whatWorked: ['High-level political commitment', 'Concessional Japanese financing terms', 'Focused corridor approach'],
    whatFailed: ['Land acquisition delays (predictable but underestimated)', 'Bureaucratic coordination between states', 'Timeline slippage on almost every project'],
    timeToOutcome: 'Ongoing - originally planned 10 years, now 15+'
  },
  {
    caseId: 'HC-010',
    title: 'Kenya-Ethiopia Renewable Energy PPP',
    year: 2019,
    country: 'Kenya',
    region: 'Africa',
    sector: 'Renewable Energy',
    initiative: 'public-private-partnership',
    outcome: 'partial-success',
    description: 'East African renewable energy PPPs attracted significant investment but face challenges with power purchase agreements, grid infrastructure, and currency risks.',
    keyFactors: ['Climate finance availability', 'Renewable resource abundance', 'Power deficit', 'International development support'],
    lessonsLearned: ['PPP success depends on government creditworthiness for offtake agreements', 'Currency risk is the silent killer of infrastructure returns', 'International development finance is slow but reliable'],
    whatWorked: ['Geothermal in Kenya (GDC model)', 'Wind farms (Lake Turkana)', 'Patient DFI capital'],
    whatFailed: ['Currency depreciation eroded returns', 'Grid connectivity lagged behind generation capacity', 'Political interference in tariff setting'],
    timeToOutcome: '5-8 years from commitment to commercial operation'
  },
  {
    caseId: 'HC-011',
    title: 'Singapore Bio-Medical Sciences Hub',
    year: 2000,
    country: 'Singapore',
    region: 'Asia-Pacific',
    sector: 'Pharmaceuticals',
    initiative: 'knowledge-economy',
    outcome: 'success',
    description: 'Singapore\'s Biopolis and Tuas Biomedical Park attracted Novartis, GSK, Pfizer, Roche through research incentives, IP protection, and world-class facilities.',
    keyFactors: ['IP protection', 'Research incentives', 'World-class infrastructure', 'Skilled workforce pipeline'],
    lessonsLearned: ['Knowledge economy requires 15-20 year commitment', 'IP protection is non-negotiable for pharma/biotech', 'R&D incentives must complement, not replace, ecosystem fundamentals'],
    whatWorked: ['Pioneer status tax exemption', 'A*STAR research infrastructure', 'Streamlined clinical trial approvals'],
    whatFailed: ['Small talent pool required constant immigration', 'Cost of operations among highest globally', 'Some companies treated Singapore as R&D satellite, not core'],
    timeToOutcome: '10-15 years to establish credible biomedical ecosystem'
  },
  {
    caseId: 'HC-012',
    title: 'Brazil Embraer Joint Ventures',
    year: 1994,
    country: 'Brazil',
    region: 'Latin America',
    sector: 'Aerospace',
    initiative: 'joint-venture',
    outcome: 'partial-success',
    description: 'Post-privatisation Embraer formed JVs with international aerospace firms. Some succeeded (OGMA Portugal), some failed (Harbin China dispute). Showed complexity of IP-intensive JVs.',
    keyFactors: ['Technology-intensive sector', 'IP control requirements', 'Government strategic interest', 'Cultural differences'],
    lessonsLearned: ['JVs in IP-intensive sectors require explicit IP governance', 'Cultural alignment is as important as financial alignment', 'Government strategic interest can help and hinder simultaneously'],
    whatWorked: ['Clear market segmentation between partners', 'Phased technology transfer with safeguards', 'Local market knowledge of partner'],
    whatFailed: ['IP disputes in some partnerships', 'Misaligned expectations on technology depth', 'Government intervention in partnership terms'],
    timeToOutcome: '5-10 years for partnership maturity'
  },
  // â"€â"€ NEW HISTORICAL CASES " Expanded global coverage â"€â"€
  {
    caseId: 'HC-013',
    title: 'Kenya M-Pesa Mobile Money Revolution',
    year: 2007,
    country: 'Kenya',
    region: 'Africa',
    sector: 'Fintech',
    initiative: 'digital-economy',
    outcome: 'success',
    description: 'Safaricom launched M-Pesa mobile money service, reaching 50M+ users. Revolutionised financial inclusion across East Africa and inspired global mobile money adoption.',
    keyFactors: ['Unbanked population demand', 'Mobile phone penetration', 'Supportive regulatory environment', 'Safaricom agent network'],
    lessonsLearned: ['Technology leapfrogging is possible when legacy infrastructure is absent', 'Regulatory sandboxes enable innovation without systemic risk', 'Agent networks are more important than technology for last-mile reach'],
    whatWorked: ['Regulatory openness from Central Bank of Kenya', 'Agent network of 200,000+ outlets', 'Simple USSD-based interface accessible on basic phones'],
    whatFailed: ['Initial resistance from traditional banking sector', 'Cross-border interoperability took years', 'Agent liquidity management challenges in rural areas'],
    timeToOutcome: '3-5 years to mass adoption, 10 years to national transformation'
  },
  {
    caseId: 'HC-014',
    title: 'Ethiopia Industrial Park Programme',
    year: 2015,
    country: 'Ethiopia',
    region: 'Africa',
    sector: 'Manufacturing',
    initiative: 'industrial-park',
    outcome: 'partial-success',
    description: 'Ethiopia built 12+ industrial parks modelled on Chinese SEZs to attract garment and textile FDI. Attracted major brands but faced labour productivity and logistics challenges.',
    keyFactors: ['Low labour costs', 'Government-built infrastructure', 'Preferential trade access (AGOA)', 'Chinese development model influence'],
    lessonsLearned: ['Low wages alone do not guarantee manufacturing competitiveness', 'Workforce training must parallel infrastructure investment', 'Logistics connectivity is as important as production capacity'],
    whatWorked: ['Government-funded infrastructure reduced investor entry cost', 'AGOA trade preferences attracted export-oriented manufacturers', 'One-stop-shop EIC agency'],
    whatFailed: ['Labour productivity 50% below Asian benchmarks initially', 'Forex shortage restricted raw material imports', 'Workers left due to low wages relative to food costs', 'Political instability disrupted operations'],
    timeToOutcome: '3-5 years for initial investment, full potential unrealised due to conflict'
  },
  {
    caseId: 'HC-015',
    title: 'Morocco Automotive Industry Cluster',
    year: 2012,
    country: 'Morocco',
    region: 'Africa',
    sector: 'Automotive',
    initiative: 'sector-development',
    outcome: 'success',
    description: 'Morocco attracted Renault (Tangier) and PSA (Kenitra), building Africa\'s largest auto production cluster. Now produces 700,000+ vehicles annually for export to Europe.',
    keyFactors: ['EU proximity and trade agreements', 'Government infrastructure investment', 'Trained workforce pipeline', 'Tangier Med port'],
    lessonsLearned: ['Anchor tenant strategy works when supported by supplier ecosystem development', 'Trade agreement access is a decisive locational factor', 'Port infrastructure multiplies manufacturing competitiveness'],
    whatWorked: ['Free zone incentives aligned with anchor needs', 'Dedicated automotive training institute (IFMIA)', 'Tangier Med port ranked among Africa\'s most efficient', 'EU free trade agreement provided market access'],
    whatFailed: ['Local content still below targets', 'Technology transfer slower than planned', 'Wage expectations rising faster than productivity'],
    timeToOutcome: '5-8 years for cluster establishment, continued growth'
  },
  {
    caseId: 'HC-016',
    title: 'Colombia Coffee Value Chain Upgrading',
    year: 2005,
    country: 'Colombia',
    region: 'Latin America',
    sector: 'Agriculture',
    initiative: 'value-chain-upgrading',
    outcome: 'success',
    description: 'Juan Valdez brand and specialty coffee strategy transformed Colombian coffee from commodity to premium product, increasing farmer income by 30-50% through value chain control.',
    keyFactors: ['Strong producer federation (FNC)', 'Geographic indication protection', 'Quality differentiation strategy', 'Direct trade relationships'],
    lessonsLearned: ['Value chain control beats production volume for farmer income', 'Geographic indications create defensible competitive advantage', 'Producer cooperatives need professional management alongside democratic governance'],
    whatWorked: ['National brand strategy (Juan Valdez)', 'Quality certification programmes', 'Direct trade and specialty market access', 'R&D investment in varieties (Cenicafe)'],
    whatFailed: ['Climate change altering growing zones', 'Young generation leaving farms', 'Price still influenced by global commodity markets'],
    timeToOutcome: '10-15 years for full brand/value chain transformation'
  },
  {
    caseId: 'HC-017',
    title: 'Saudi Arabia NEOM Megaproject',
    year: 2017,
    country: 'Saudi Arabia',
    region: 'Middle East',
    sector: 'Multi-sector',
    initiative: 'megaproject-diversification',
    outcome: 'ongoing',
    description: '$500B NEOM megaproject as centrepiece of Vision 2030 diversification from oil. Ambitious scope covers tourism, tech, energy, water, biotech, and advanced manufacturing.',
    keyFactors: ['Sovereign wealth fund backing', 'Vision 2030 mandate', 'Scale of ambition', 'International recruitment'],
    lessonsLearned: ['Sovereign wealth scale can attempt what no private developer could', 'Technology aspirations must be matched by human capital pipelines', 'Megaproject complexity compounds beyond a certain scale threshold'],
    whatWorked: ['Attracted global talent and advisory firms', 'Clear political mandate and funding commitment', 'Innovative sector targeting (future industries)'],
    whatFailed: ['Timeline repeatedly extended', 'Cost estimates escalating', 'Human rights concerns affecting international partnerships', 'Worker welfare issues in construction phase'],
    timeToOutcome: 'Original 2025 completion now 2030+, ongoing'
  },
  {
    caseId: 'HC-018',
    title: 'Georgia Rapid Reforms',
    year: 2004,
    country: 'Georgia',
    region: 'Central Asia',
    sector: 'Governance',
    initiative: 'anti-corruption-reform',
    outcome: 'success',
    description: 'Post-Rose Revolution, Georgia eliminated 75% of regulations, fired entire traffic police force, introduced e-government. Went from doing business rank 137 to 7 in 8 years.',
    keyFactors: ['Post-revolution political mandate', 'Small population enabled rapid change', 'International support', 'Technology-enabled governance'],
    lessonsLearned: ['Radical reform is possible when political moment aligns', 'Anti-corruption reforms can be implemented rapidly if political will exists', 'E-government reduces corruption opportunities systematically'],
    whatWorked: ['Mass dismissal and rebuilding of corrupt institutions', 'One-window government service centres', 'Business registration simplified to 1 day', 'Flat tax implementation'],
    whatFailed: ['Democratic backsliding under subsequent governments', 'Reforms perceived as authoritarian by some', 'Rural areas benefited less than urban'],
    timeToOutcome: '3-5 years for dramatic improvement'
  },
  {
    caseId: 'HC-019',
    title: 'Botswana Diamond Revenue Management',
    year: 1967,
    country: 'Botswana',
    region: 'Africa',
    sector: 'Mining',
    initiative: 'resource-governance',
    outcome: 'success',
    description: 'Botswana-De Beers 50/50 partnership managed diamond revenue through Pula Fund, achieving Africa\'s highest per-capita growth for 30+ years. The antithesis of the resource curse.',
    keyFactors: ['Transparent revenue management', 'Political stability', 'Equal partnership with De Beers', 'Intergenerational wealth preservation'],
    lessonsLearned: ['Resource governance requires institutional frameworks before extraction begins', 'Partnership structures with mining companies matter more than tax rates alone', 'Intergenerational fund design prevents boom-bust fiscal management'],
    whatWorked: ['50/50 Debswana partnership model', 'Pula Fund sovereign wealth vehicle', 'Counter-cyclical fiscal policy', 'Strong public financial management'],
    whatFailed: ['Over-dependence on single commodity (diamonds)', 'HIV/AIDS epidemic impacted development trajectory', 'Economic diversification slower than planned', 'Inequality remained high despite growth'],
    timeToOutcome: '20+ years of sustained growth (1967-1999 peak period)'
  },
  {
    caseId: 'HC-020',
    title: 'India UPI Digital Payments Stack',
    year: 2016,
    country: 'India',
    region: 'Asia-Pacific',
    sector: 'Fintech',
    initiative: 'digital-infrastructure',
    outcome: 'success',
    description: 'Unified Payments Interface (UPI) enabled 10B+ monthly transactions by 2023. Combined with Aadhaar (1.4B digital IDs) and Jan Dhan (500M bank accounts), created world\'s largest digital payments infrastructure.',
    keyFactors: ['Public digital infrastructure approach', 'Interoperability mandate', 'Government-backed identity layer', 'Universal bank account programme'],
    lessonsLearned: ['Public digital infrastructure can scale faster than private platforms', 'Interoperability mandates prevent platform lock-in and increase adoption', 'Digital identity is the foundation layer for all digital services'],
    whatWorked: ['Zero-cost transaction model for consumers', 'QR-code based merchant onboarding', 'Open API architecture enabling private innovation', 'Aadhaar-enabled instant KYC'],
    whatFailed: ['Privacy concerns with centralised biometric database', 'Merchants face interchange fee reduction pressure', 'Rural digital literacy remains a barrier', 'Cybersecurity incidents increasing with scale'],
    timeToOutcome: '5-7 years from launch to dominant payment method'
  },
  {
    caseId: 'HC-021',
    title: 'Nigeria Lagos Free Zone',
    year: 2012,
    country: 'Nigeria',
    region: 'Africa',
    sector: 'Multi-sector',
    initiative: 'special-economic-zone',
    outcome: 'partial-success',
    description: 'Public-private Lagos Free Zone (Tolaram/CCECC) attracted Dangote Refinery ($19B), Kellogg\'s, and others. Demonstrated that private-led zone model works in challenging environments.',
    keyFactors: ['Private sector zone developer', 'Deep-water port access', 'Largest African market proximity', 'Dangote anchor investment'],
    lessonsLearned: ['Private-led zone development can outperform government-led in weak governance contexts', 'Anchor mega-investments create gravitational pull for suppliers', 'Port infrastructure is the critical enabler for manufacturing zones'],
    whatWorked: ['Private developer accountability for infrastructure quality', 'Lekki deep-water port investment', 'Dangote Refinery as anchor tenant', 'One-stop regulatory processing'],
    whatFailed: ['Access road infrastructure chronically inadequate', 'Power supply reliability issues', 'Customs facilitation inconsistent', 'Security concerns in surrounding areas'],
    timeToOutcome: '8-10 years to significant occupancy, ongoing'
  },
  {
    caseId: 'HC-022',
    title: 'Mexico Maquiladora to Advanced Manufacturing',
    year: 2015,
    country: 'Mexico',
    region: 'Latin America',
    sector: 'Manufacturing',
    initiative: 'manufacturing-upgrading',
    outcome: 'success',
    description: 'Mexican automobile sector evolved from assembly-only maquiladoras to advanced manufacturing with R&D centres for BMW, Audi, Toyota. Now 7th largest vehicle producer globally.',
    keyFactors: ['USMCA trade agreement', 'Skilled workforce development', 'Proximity to US market', 'Competitive costs vs US/Canada'],
    lessonsLearned: ['Manufacturing upgrading requires parallel workforce skills development', 'Trade agreements are necessary but not sufficient for upgrading - cluster ecosystem matters', 'Nearshoring momentum can accelerate planned upgrade trajectories'],
    whatWorked: ['Dual education system (German model) for technical training', 'Automotive cluster in Bajo region', 'USMCA rules of origin incentivised domestic production', 'Competitive logistics to US ports'],
    whatFailed: ['Security challenges in some manufacturing regions', 'Wage growth lagging productivity growth', 'Supply chain depth still below Korea/Japan levels', 'Brain drain to US for top talent'],
    timeToOutcome: '10-15 years from assembly to advanced manufacturing'
  },
  {
    caseId: 'HC-023',
    title: 'Kazakhstan Astana International Financial Centre',
    year: 2018,
    country: 'Kazakhstan',
    region: 'Central Asia',
    sector: 'Financial Services',
    initiative: 'financial-centre',
    outcome: 'ongoing',
    description: 'AIFC established with English common law court (AIFC Court headed by former UK judges), zero tax for 50 years, targeting regional financial hub ambition for Central Asia and CIS.',
    keyFactors: ['English common law jurisdiction', 'Zero corporate/income tax until 2066', 'BRI connectivity position', 'Government commitment'],
    lessonsLearned: ['Financial centre development requires legal infrastructure before financial products', 'English common law provides international investor confidence', 'Location between China, Russia, and Europe is strategic for trade finance'],
    whatWorked: ['AIFC Court with international judges', 'Clear regulatory framework modelled on Abu Dhabi', 'Fintech regulatory sandbox', 'Green finance initiatives'],
    whatFailed: ['Limited regional demand for financial services', 'Competition from Dubai and Singapore', 'Geopolitical risk perception (Russia proximity)', 'Talent attraction challenges'],
    timeToOutcome: 'Ongoing - 10-15 year horizon for credibility'
  },
  {
    caseId: 'HC-024',
    title: 'Fiji Climate Resilience and Blue Economy',
    year: 2017,
    country: 'Fiji',
    region: 'Pacific Islands',
    sector: 'Climate/Marine',
    initiative: 'climate-adaptation',
    outcome: 'partial-success',
    description: 'Fiji issued first developing country sovereign green bond ($50M), led COP23, and pioneered Pacific Island climate resilience investment frameworks combining adaptation with blue economy opportunities.',
    keyFactors: ['Climate vulnerability as catalyst', 'COP23 presidency visibility', 'International climate finance access', 'Blue economy potential'],
    lessonsLearned: ['Climate vulnerability can be converted to investment leadership position', 'Small island states can punch above weight in climate diplomacy', 'Green bonds create new financing channels for climate-vulnerable nations'],
    whatWorked: ['Sovereign green bond attracted institutional investors', 'Climate relocation framework (first globally)', 'Marine protected area expansion', 'Blue economy strategy development'],
    whatFailed: ['Bond size limited by market depth', 'Climate adaptation costs far exceed available finance', 'Brain drain of climate professionals to international organisations', 'Insurance costs continuing to rise'],
    timeToOutcome: '5 years for initial programmes, generational challenge for full resilience'
  }
];

// ============================================================================
// HISTORICAL PARALLEL MATCHER
// ============================================================================

export class HistoricalParallelMatcher {

  /**
   * Find historical cases that parallel the user's current situation.
   * Returns matches ranked by relevance with synthesised insights.
   */
  static match(params: Partial<ReportParameters>): ParallelMatchResult {
    const p = params as Record<string, unknown>;
    const country = (p.country as string) || '';
    const region = (p.region as string) || '';
    const sector = ((p.industry as string[]) || [])[0] || '';
    const intent = ((p.strategicIntent as string[]) || [])[0] || '';
    const orgType = (p.organizationType as string) || '';
    const problem = (p.problemStatement as string) || '';
    const riskTolerance = (p.riskTolerance as string) || 'moderate';

    // Score each case for relevance
    const scoredCases: HistoricalCase[] = HISTORICAL_CASES.map(c => {
      let score = 0;

      // Region match (highest weight)
      if (c.region.toLowerCase() === region.toLowerCase()) score += 25;
      else if (c.country.toLowerCase() === country.toLowerCase()) score += 30;

      // Sector match
      if (sector && c.sector.toLowerCase().includes(sector.toLowerCase())) score += 20;
      if (sector && sector.toLowerCase().includes(c.sector.toLowerCase())) score += 15;

      // Initiative/intent match
      if (intent && c.initiative.toLowerCase().includes(intent.toLowerCase())) score += 15;
      if (intent && intent.toLowerCase().includes('partner') && c.initiative.includes('joint-venture')) score += 10;
      if (intent && intent.toLowerCase().includes('zone') && c.initiative.includes('economic-zone')) score += 10;
      if (intent && intent.toLowerCase().includes('attract') && c.initiative.includes('investment-attraction')) score += 10;

      // Problem statement keyword matching
      if (problem) {
        const problemLower = problem.toLowerCase();
        if (problemLower.includes('infrastructure') && c.sector.toLowerCase().includes('infrastructure')) score += 10;
        if (problemLower.includes('manufactur') && c.sector.toLowerCase().includes('manufactur')) score += 10;
        if (problemLower.includes('tech') && c.sector.toLowerCase().includes('tech')) score += 10;
        if (problemLower.includes('energy') && c.sector.toLowerCase().includes('energy')) score += 10;
        if (problemLower.includes('zone') && c.initiative.includes('zone')) score += 10;
        if (problemLower.includes('ppp') && c.initiative.includes('ppp')) score += 10;
      }

      // Organisation type alignment
      if (orgType.toLowerCase().includes('government') && c.initiative.includes('public')) score += 5;

      // Risk alignment " if user has low risk tolerance, prioritise successful cases
      if (riskTolerance === 'low' && c.outcome === 'success') score += 5;
      if (riskTolerance === 'high' && c.outcome === 'failed') score += 5; // learn from failures

      // Recency bonus " more recent cases slightly more relevant
      const yearsAgo = new Date().getFullYear() - c.year;
      if (yearsAgo < 10) score += 5;
      else if (yearsAgo < 20) score += 3;

      return { ...c, relevanceScore: Math.min(100, score) };
    });

    // Sort by relevance and take top matches
    const matches = scoredCases
      .filter(c => c.relevanceScore > 10)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    // Synthesis
    const successfulMatches = matches.filter(m => m.outcome === 'success');
    const failedMatches = matches.filter(m => m.outcome === 'failed');
    const totalRelevant = matches.length || 1;
    const successRate = Math.round((successfulMatches.length / totalRelevant) * 100);

    // Common factors
    const commonSuccessFactors = this.extractCommonFactors(successfulMatches.flatMap(m => m.whatWorked));
    const commonFailureFactors = this.extractCommonFactors(
      [...failedMatches.flatMap(m => m.whatFailed), ...matches.filter(m => m.outcome === 'partial-success').flatMap(m => m.whatFailed)]
    );

    // Synthesis insight
    let synthesisInsight = '';
    if (matches.length === 0) {
      synthesisInsight = 'No close historical parallels found in the case library. This initiative appears novel - exercise additional caution and consider pilot-scale testing.';
    } else if (successRate >= 70) {
      synthesisInsight = `Historical parallels suggest a ${successRate}% success rate for similar initiatives. Key success factors include: ${commonSuccessFactors.slice(0, 3).join(', ')}. However, even successful cases took ${matches[0]?.timeToOutcome || '5-10 years'} to materialise.`;
    } else if (successRate >= 30) {
      synthesisInsight = `Historical parallels show mixed results (${successRate}% success). Common failure points: ${commonFailureFactors.slice(0, 3).join(', ')}. Careful risk mitigation and phased commitment are strongly recommended.`;
    } else {
      synthesisInsight = `Warning: Similar historical initiatives have a low success rate (${successRate}%). Primary failure factors: ${commonFailureFactors.slice(0, 3).join(', ')}. Consider fundamental strategy revision before committing.`;
    }

    // Recommended actions from historical lessons
    const recommendedActions = this.synthesiseRecommendations(matches);

    return {
      timestamp: new Date().toISOString(),
      userSituation: `${(p.organizationName as string) || 'Organisation'} " ${intent || 'partnership'} in ${country || 'target market'} / ${sector || 'sector'}`,
      matches,
      synthesisInsight,
      successRate,
      commonSuccessFactors,
      commonFailureFactors,
      recommendedActions
    };
  }

  /**
   * Quick match " returns the single most relevant case for inline display
   */
  static quickMatch(params: Partial<ReportParameters>): {
    found: boolean;
    case_title: string;
    outcome: string;
    topLesson: string;
    relevance: number;
  } {
    const result = this.match(params);
    if (result.matches.length === 0) {
      return { found: false, case_title: '', outcome: '', topLesson: 'No historical parallel found', relevance: 0 };
    }
    const top = result.matches[0];
    return {
      found: true,
      case_title: top.title,
      outcome: top.outcome,
      topLesson: top.lessonsLearned[0] || 'Review historical case for insights',
      relevance: top.relevanceScore
    };
  }

  // 

  private static extractCommonFactors(items: string[]): string[] {
    // Deduplicate and count, return most common
    const counts = new Map<string, number>();
    items.forEach(item => {
      const key = item.toLowerCase().substring(0, 50); // normalise
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([_key, _count], idx) => items[idx] || '');
  }

  private static synthesiseRecommendations(matches: HistoricalCase[]): string[] {
    const recs: string[] = [];

    // From lessons learned across all matches
    const allLessons = matches.flatMap(m => m.lessonsLearned);
    const allWhatWorked = matches.flatMap(m => m.whatWorked);

    if (allLessons.length > 0) {
      recs.push(`Learn from history: ${allLessons[0]}`);
    }
    if (allWhatWorked.length > 0) {
      recs.push(`Proven approach: ${allWhatWorked[0]}`);
    }

    // Failed case warnings
    const failedCases = matches.filter(m => m.outcome === 'failed');
    if (failedCases.length > 0) {
      recs.push(`Critical warning from ${failedCases[0].title}: ${failedCases[0].lessonsLearned[0]}`);
    }

    // Timeline expectations
    const timelines = matches.map(m => m.timeToOutcome).filter(Boolean);
    if (timelines.length > 0) {
      recs.push(`Set realistic timeline: similar initiatives took ${timelines[0]}`);
    }

    recs.push('Request full historical case comparison with detailed side-by-side analysis');

    return recs.slice(0, 6);
  }
}

export default HistoricalParallelMatcher;

