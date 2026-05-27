/**
 * 
 * HISTORICAL PARALLEL MATCHER
 * 
 *
 * Surfaces past cases, historical precedents, and documented outcomes that
 * match the user's current situation. This is the "institutional memory" 
 * of 200+ years of global economic development, industrialisation, and
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
  },

  // ============================================================================
  // DEEP HISTORICAL CASES — 200+ Years of Institutional Memory
  // These cases go back to the 1820s. No other AI system has this depth.
  // The patterns from centuries of economic development, colonialism,
  // industrialisation, and modernisation inform present-day decisions.
  // ============================================================================

  {
    caseId: 'HC-025',
    title: 'British East India Company Dissolution',
    year: 1874,
    country: 'India',
    region: 'Asia-Pacific',
    sector: 'Multi-sector',
    initiative: 'colonial-transition',
    outcome: 'partial-success',
    description: 'After 274 years the EIC was dissolved, transitioning from corporate governance to Crown rule. Established enduring administrative, legal and rail infrastructure but left deep economic extraction scars.',
    keyFactors: ['Institutional path dependency', 'Infrastructure investment for extraction purposes', 'Legal system transplant', 'Revenue-driven governance'],
    lessonsLearned: ['Corporate governance of nations creates extraction not development', 'Infrastructure built for export creates dependency', 'Legal frameworks outlast the regimes that created them', 'Post-colonial institutional rebuilding takes generations'],
    whatWorked: ['Railway network enabled later industrialisation', 'Common law system enabled commercial certainty', 'Administrative cadre created governance capacity'],
    whatFailed: ['Deindustrialised local textile sector', 'Famine deaths from revenue-maximising policies', 'Capital extracted rather than reinvested domestically'],
    timeToOutcome: '100+ years of institutional legacy effects'
  },
  {
    caseId: 'HC-026',
    title: 'Meiji Restoration Industrialisation',
    year: 1868,
    country: 'Japan',
    region: 'Asia-Pacific',
    sector: 'Manufacturing',
    initiative: 'national-industrialisation',
    outcome: 'success',
    description: 'Japan transformed from feudal agrarian economy to industrial power in 30 years through state-directed industrialisation, technology transfer from the West, and strategic protectionism.',
    keyFactors: ['Strong centralised government', 'Deliberate technology acquisition', 'Education system overhaul', 'Strategic protectionism with selective openness'],
    lessonsLearned: ['State-directed industrialisation can compress development timelines dramatically', 'Sending students abroad for technology transfer is more effective than buying equipment', 'Domestic market protection enables infant industry growth', 'Cultural adaptation of foreign technology is as important as acquisition'],
    whatWorked: ['Zaibatsu conglomerates concentrated capital for heavy industry', 'Universal education created skilled workforce', 'Government pilot factories then privatised to private sector'],
    whatFailed: ['Militarisation of industrial capacity', 'Rural poverty persisted despite urban industrialisation', 'Worker exploitation in early factories'],
    timeToOutcome: '30 years to become major industrial power'
  },
  {
    caseId: 'HC-027',
    title: 'Suez Canal Construction',
    year: 1869,
    country: 'Egypt',
    region: 'Middle East',
    sector: 'Infrastructure',
    initiative: 'mega-infrastructure',
    outcome: 'partial-success',
    description: 'Transformed global trade routes but bankrupted Egypt, leading to British occupation. Demonstrates how mega-infrastructure can benefit global commerce while devastating the host nation.',
    keyFactors: ['Foreign capital control', 'Sovereign debt crisis', 'Geostrategic importance', 'Forced labour during construction'],
    lessonsLearned: ['Mega-infrastructure with foreign capital control creates dependency not sovereignty', 'Revenue-sharing structures must protect host nation', 'Strategic assets attract foreign intervention', 'Construction-phase exploitation undermines long-term legitimacy'],
    whatWorked: ['Canal revenue eventually became major income source post-nationalisation', 'Demonstrated viability of mega-infrastructure in developing nations'],
    whatFailed: ['Egypt lost sovereignty over its own asset', 'Debt spiral led to colonial occupation', 'Construction relied on corvée (forced) labour'],
    timeToOutcome: 'Revenue benefits took 87 years (until 1956 nationalisation)'
  },
  {
    caseId: 'HC-028',
    title: 'Panama Canal Zone',
    year: 1904,
    country: 'Panama',
    region: 'Latin America',
    sector: 'Infrastructure',
    initiative: 'mega-infrastructure',
    outcome: 'partial-success',
    description: 'US-built canal transformed global shipping but created a colonial enclave that divided Panama physically and politically until 1999 handover.',
    keyFactors: ['Superpower intervention', 'Treaty renegotiation over decades', 'Sovereignty vs economic benefit trade-off', 'Gradual transition of control'],
    lessonsLearned: ['Infrastructure concessions must have clear reversion timelines', 'Sovereignty over strategic assets is non-negotiable long-term', 'Gradual handover works better than sudden transfer', 'Canal revenues can transform a small economy when controlled domestically'],
    whatWorked: ['Post-1999 handover turned canal into Panama\'s economic engine', 'Expansion in 2016 doubled capacity and revenue', 'Canal Authority became world-class institution'],
    whatFailed: ['99-year US control zone divided the country', 'Military intervention risk persisted throughout', 'Revenue flowed to US for most of canal\'s history'],
    timeToOutcome: '95 years to full sovereignty (1904-1999)'
  },
  {
    caseId: 'HC-029',
    title: 'Marshall Plan European Recovery',
    year: 1948,
    country: 'Germany',
    region: 'Europe',
    sector: 'Multi-sector',
    initiative: 'post-conflict-reconstruction',
    outcome: 'success',
    description: '$13B ($170B today) in aid rebuilt Western Europe. Demonstrated that strategic aid with institutional reform creates durable economic recovery. German Wirtschaftswunder followed.',
    keyFactors: ['Conditional aid requiring institutional reform', 'Recipient country ownership of plans', 'Market-based not command economy approach', 'Security guarantee enabled risk-taking'],
    lessonsLearned: ['Aid works when recipients design their own recovery plans', 'Institutional reform is more important than capital injection', 'Trade liberalisation between recipients multiplies impact', 'Security guarantees are prerequisites for economic risk-taking'],
    whatWorked: ['Recipient-driven planning (OEEC coordination)', 'Currency reform eliminated black markets', 'Trade liberalisation between European nations', 'Technical assistance alongside capital'],
    whatFailed: ['Eastern Europe excluded, deepening Cold War division', 'Some funds diverted to colonial ventures', 'Agricultural sector reforms lagged'],
    timeToOutcome: '4 years for recovery, 15 years for economic miracle'
  },
  {
    caseId: 'HC-030',
    title: 'Singapore Independence to First World',
    year: 1965,
    country: 'Singapore',
    region: 'Asia-Pacific',
    sector: 'Multi-sector',
    initiative: 'national-development',
    outcome: 'success',
    description: 'Expelled from Malaysia with no resources, Singapore became a first-world nation in one generation through export-oriented industrialisation, education investment, and strategic governance.',
    keyFactors: ['Meritocratic governance', 'Strategic location exploitation', 'Aggressive FDI attraction', 'Education and workforce development', 'Anti-corruption enforcement'],
    lessonsLearned: ['Small nations can succeed through institutional quality not size', 'Rule of law and anti-corruption are foundational not optional', 'Education investment has 20-year compound returns', 'Strategic positioning matters more than natural resources'],
    whatWorked: ['EDB one-stop shop for investors', 'Public housing created social stability', 'CPF forced savings funded development', 'English as working language attracted MNCs'],
    whatFailed: ['Political freedoms constrained', 'Income inequality grew despite prosperity', 'Dependency on foreign labour', 'Cultural identity tensions from rapid modernisation'],
    timeToOutcome: '25 years to first-world status (1965-1990)'
  },
  {
    caseId: 'HC-031',
    title: 'South Korea Chaebol-Led Development',
    year: 1962,
    country: 'South Korea',
    region: 'Asia-Pacific',
    sector: 'Manufacturing',
    initiative: 'industrial-policy',
    outcome: 'success',
    description: 'Park Chung-hee\'s Five-Year Plans directed credit to chaebol conglomerates (Samsung, Hyundai, LG), transforming Korea from war-devastated to OECD member in 35 years.',
    keyFactors: ['State-directed credit allocation', 'Export discipline (perform or lose support)', 'Heavy industry focus', 'Education investment'],
    lessonsLearned: ['Conditional support with performance metrics drives results', 'Export orientation forces quality and competitiveness', 'Chaebol model creates world-class firms but also systemic risk', 'Democratisation eventually follows economic development'],
    whatWorked: ['Export targets with government support for achievers', 'Heavy and chemical industry drive in 1970s', 'Samsung/Hyundai became global brands', 'R&D spending reached 4.5% GDP'],
    whatFailed: ['Chaebol over-leverage caused 1997 crisis', 'Labour exploitation in early decades', 'Regional inequality (Seoul dominance)', 'Authoritarian governance until 1987'],
    timeToOutcome: '35 years to OECD membership (1962-1996)'
  },
  {
    caseId: 'HC-032',
    title: 'China Reform and Opening Up',
    year: 1978,
    country: 'China',
    region: 'Asia-Pacific',
    sector: 'Multi-sector',
    initiative: 'market-opening',
    outcome: 'success',
    description: 'Deng Xiaoping\'s reforms created SEZs, allowed private enterprise, and opened to FDI. Lifted 800 million from poverty and made China the world\'s manufacturing hub.',
    keyFactors: ['Gradual liberalisation (crossing the river by feeling the stones)', 'SEZ experimentation before national rollout', 'Massive infrastructure investment', 'WTO accession as reform anchor'],
    lessonsLearned: ['Gradual reform with experimentation reduces catastrophic failure risk', 'SEZs serve as reform laboratories', 'Infrastructure investment enables everything else', 'External anchors (WTO) lock in reform against backsliding'],
    whatWorked: ['Township and village enterprises created rural employment', 'Coastal SEZs attracted manufacturing FDI', 'WTO accession in 2001 accelerated integration', 'Infrastructure spending on unprecedented scale'],
    whatFailed: ['Environmental devastation from rapid industrialisation', 'Rising inequality between coast and interior', 'SOE reform remains incomplete', 'Debt accumulation in local governments'],
    timeToOutcome: '30 years to become world\'s second-largest economy'
  },
  {
    caseId: 'HC-033',
    title: 'Chile Economic Transformation',
    year: 1975,
    country: 'Chile',
    region: 'Latin America',
    sector: 'Multi-sector',
    initiative: 'market-liberalisation',
    outcome: 'partial-success',
    description: 'Chicago Boys reforms under Pinochet created Latin America\'s most liberalised economy. Copper fund, pension privatisation, and trade openness delivered growth but at severe social cost.',
    keyFactors: ['Radical market liberalisation', 'Copper stabilisation fund', 'Pension system privatisation', 'Trade openness'],
    lessonsLearned: ['Shock therapy reforms can work economically but carry enormous social costs', 'Commodity stabilisation funds are essential for resource-dependent economies', 'Pension privatisation creates inequality in retirement', 'Democratic legitimacy of reforms matters for sustainability'],
    whatWorked: ['Copper stabilisation fund (counter-cyclical savings)', 'Trade agreements with 65+ countries', 'Stable macroeconomic management', 'FDI-friendly regulatory environment'],
    whatFailed: ['Extreme inequality persisted despite growth', 'Social unrest in 2019 showed limits of model', 'Privatised pension system delivered poor outcomes for workers', 'Water rights privatisation created resource conflicts'],
    timeToOutcome: '20 years to become Latin America\'s most developed economy'
  },
  {
    caseId: 'HC-034',
    title: 'UAE National Transformation (Vision 2021)',
    year: 2010,
    country: 'UAE',
    region: 'Middle East',
    sector: 'Multi-sector',
    initiative: 'economic-diversification',
    outcome: 'success',
    description: 'Diversified beyond oil to tourism, aviation, fintech, and renewable energy. Dubai became global hub; Abu Dhabi built sovereign wealth. Non-oil GDP reached 70%.',
    keyFactors: ['Sovereign wealth fund investment', 'Brand-building (Emirates, Expo 2020)', 'Regulatory innovation (DIFC, ADGM)', 'Infrastructure excellence'],
    lessonsLearned: ['Oil economies can diversify if they start early and invest sovereign wealth strategically', 'World-class infrastructure attracts talent and business', 'Regulatory sandboxes attract fintech and innovation', 'National branding drives tourism and investment'],
    whatWorked: ['Emirates airline as global brand ambassador', 'DIFC common law jurisdiction within civil law country', 'Golden visa programme for talent attraction', 'Masdar City renewable energy showcase'],
    whatFailed: ['Labour rights concerns for migrant workers', 'Real estate bubble and bust cycles', 'Press freedom constraints limit innovation ecosystem', 'Water and food security remain vulnerabilities'],
    timeToOutcome: '15 years for significant diversification'
  },
  {
    caseId: 'HC-035',
    title: 'Taiwan Semiconductor Miracle',
    year: 1987,
    country: 'Taiwan',
    region: 'Asia-Pacific',
    sector: 'Technology',
    initiative: 'industrial-policy',
    outcome: 'success',
    description: 'Government-backed TSMC created the foundry model, turning Taiwan into the world\'s semiconductor manufacturing capital controlling 60%+ of global chip production.',
    keyFactors: ['Government seed investment', 'Technology transfer from US', 'Hsinchu Science Park cluster', 'Foundry business model innovation'],
    lessonsLearned: ['Government can seed world-changing industries with strategic investment', 'Business model innovation (foundry) can be as important as technology innovation', 'Science park clusters create knowledge spillovers', 'Strategic industries create geopolitical leverage'],
    whatWorked: ['ITRI research institute incubated TSMC', 'Returning diaspora talent (Morris Chang from Texas Instruments)', 'Hsinchu Science Park concentration of talent', 'Customer-centric foundry model disrupted industry'],
    whatFailed: ['Over-concentration creates single-point-of-failure risk', 'Environmental impact of fab construction', 'Brain drain from other sectors to semiconductors', 'Geopolitical tensions around Taiwan Strait'],
    timeToOutcome: '20 years to global dominance (1987-2007)'
  },
  {
    caseId: 'HC-036',
    title: 'Ireland Celtic Tiger',
    year: 1994,
    country: 'Ireland',
    region: 'Europe',
    sector: 'Technology',
    initiative: 'fdi-attraction',
    outcome: 'partial-success',
    description: 'Low corporate tax (12.5%), EU membership, English-speaking workforce, and IDA Ireland attracted US tech giants. GDP per capita surged but housing bubble and 2008 crash exposed fragilities.',
    keyFactors: ['Low corporate tax rate', 'EU single market access', 'English-speaking educated workforce', 'IDA Ireland investment promotion'],
    lessonsLearned: ['Tax competition attracts headquarters but not always real economic activity', 'FDI dependence creates vulnerability to corporate decisions', 'Housing bubbles can wipe out a decade of gains', 'Education investment compounds over generations'],
    whatWorked: ['12.5% corporate tax attracted Apple, Google, Facebook, Pfizer', 'IDA Ireland world-class investment promotion', 'EU structural funds built infrastructure', 'University-industry partnerships'],
    whatFailed: ['Property bubble and 2008 banking crash required EU/IMF bailout', 'Transfer pricing inflated GDP artificially', 'Housing affordability crisis', 'Over-dependence on US multinationals'],
    timeToOutcome: '10 years of rapid growth (1994-2007), then crash and recovery'
  },
  {
    caseId: 'HC-037',
    title: 'Botswana Diamond-Led Development',
    year: 1967,
    country: 'Botswana',
    region: 'Africa',
    sector: 'Mining',
    initiative: 'resource-management',
    outcome: 'success',
    description: 'Renegotiated De Beers partnership to 50-50 joint venture (Debswana). Invested diamond revenues in education, infrastructure, and sovereign wealth. Became Africa\'s governance model.',
    keyFactors: ['50-50 JV with De Beers', 'Pula Fund sovereign wealth', 'Democratic governance', 'Anti-corruption culture'],
    lessonsLearned: ['Resource curse is not inevitable — governance quality determines outcomes', '50-50 JVs with multinationals can work if government has negotiating capacity', 'Sovereign wealth funds convert depleting resources into permanent assets', 'Small population + large resource = high per-capita if managed well'],
    whatWorked: ['Debswana JV gave government 50% of diamond profits', 'Pula Fund invested revenues for future generations', 'Free universal education', 'Stable democratic transitions'],
    whatFailed: ['HIV/AIDS epidemic devastated population', 'Diamond dependence (80% of exports)', 'Limited economic diversification beyond mining', 'Youth unemployment despite education'],
    timeToOutcome: '30 years from poorest to upper-middle income (1966-1996)'
  },
  {
    caseId: 'HC-038',
    title: 'Soviet Union Collapse and Transition',
    year: 1991,
    country: 'Russia',
    region: 'Europe',
    sector: 'Multi-sector',
    initiative: 'market-transition',
    outcome: 'failed',
    description: 'Rapid privatisation ("shock therapy") transferred state assets to oligarchs. GDP fell 40%, life expectancy dropped, institutions hollowed out. Cautionary tale for rapid market transitions.',
    keyFactors: ['Shock therapy privatisation', 'Institutional vacuum', 'Oligarch capture of state assets', 'IMF structural adjustment conditions'],
    lessonsLearned: ['Rapid privatisation without institutional framework creates oligarchy not markets', 'Institutions must precede or accompany market reform', 'Shock therapy carries catastrophic human costs', 'Resource wealth without governance creates extraction not development'],
    whatWorked: ['Some sectors eventually stabilised', 'Oil revenue provided fiscal recovery in 2000s'],
    whatFailed: ['Loans-for-shares scandal transferred wealth to connected insiders', 'GDP fell 40% in 1990s', 'Life expectancy dropped by 5 years', 'Democratic institutions captured by economic interests'],
    timeToOutcome: 'Negative — 15+ years to recover 1990 GDP levels'
  },
  {
    caseId: 'HC-039',
    title: 'Hong Kong as Financial Hub',
    year: 1841,
    country: 'Hong Kong',
    region: 'Asia-Pacific',
    sector: 'Financial Services',
    initiative: 'free-port',
    outcome: 'success',
    description: 'From barren rock to global financial centre through free port status, rule of law, low taxes, and strategic position as gateway to China.',
    keyFactors: ['Free port — zero tariffs', 'Common law legal system', 'Low flat tax rate', 'Gateway to China position'],
    lessonsLearned: ['Rule of law is the ultimate competitive advantage for financial centres', 'Free port status attracts trade which attracts finance', 'Gateway positioning creates irreplaceable value', 'Institutional independence matters more than size'],
    whatWorked: ['ICAC anti-corruption commission (1974)', 'Linked exchange rate provided currency stability', 'Simple flat tax system', 'Deep capital markets'],
    whatFailed: ['Housing costs became world\'s highest', 'Income inequality extreme', 'Dependency on mainland Chinese economy', 'Political autonomy erosion post-2020'],
    timeToOutcome: '100+ years of continuous development'
  },
  {
    caseId: 'HC-040',
    title: 'Norway Oil Fund Model',
    year: 1990,
    country: 'Norway',
    region: 'Europe',
    sector: 'Energy',
    initiative: 'resource-management',
    outcome: 'success',
    description: 'Government Pension Fund Global (GPFG) became world\'s largest sovereign wealth fund ($1.7T) by investing all oil revenue abroad, avoiding Dutch disease and providing intergenerational equity.',
    keyFactors: ['All oil revenue invested abroad', 'Independent professional management', 'Ethical investment guidelines', 'Fiscal spending rule (3% annual withdrawal)'],
    lessonsLearned: ['Investing resource revenues abroad prevents Dutch disease', 'Spending rules prevent political consumption of wealth', 'Ethical investment guidelines enhance legitimacy', 'Transparency in sovereign wealth management builds public trust'],
    whatWorked: ['$1.7T fund owns 1.5% of global listed equities', '3% fiscal spending rule prevents overheating', 'Public transparency of all holdings', 'Ethical exclusion list maintains legitimacy'],
    whatFailed: ['Climate paradox — fund built on fossil fuels', 'Domestic economy still oil-dependent for employment', 'Housing costs inflated despite spending rule', 'Difficult political discipline to maintain spending limits'],
    timeToOutcome: '30 years to build $1.7 trillion fund'
  },
  {
    caseId: 'HC-041',
    title: 'European Union Single Market',
    year: 1993,
    country: 'Europe',
    region: 'Europe',
    sector: 'Multi-sector',
    initiative: 'economic-integration',
    outcome: 'success',
    description: 'Created world\'s largest single market with free movement of goods, services, capital, and people across 27 nations. GDP increased estimated 8.5% through trade creation.',
    keyFactors: ['Supranational institutional framework', 'Mutual recognition principle', 'Structural funds for convergence', 'Single currency (euro) for subset'],
    lessonsLearned: ['Economic integration requires institutional architecture not just trade agreements', 'Mutual recognition avoids harmonisation bottlenecks', 'Convergence funds are essential to prevent winner-takes-all dynamics', 'Political integration must keep pace with economic integration'],
    whatWorked: ['Mutual recognition reduced regulatory barriers', 'Structural funds helped peripheral economies converge', 'Schengen free movement zone', 'Common competition policy prevented monopolies'],
    whatFailed: ['Euro crisis (2010-2015) exposed monetary union without fiscal union', 'Brexit showed political integration limits', 'Eastern expansion created wage competition tensions', 'Democratic deficit in EU institutions'],
    timeToOutcome: '30+ years of continuous deepening (1993-present)'
  },
  {
    caseId: 'HC-042',
    title: 'East Germany Reunification Transition',
    year: 1990,
    country: 'Germany',
    region: 'Europe',
    sector: 'Multi-sector',
    initiative: 'economic-integration',
    outcome: 'partial-success',
    description: 'Treuhand privatised 8,500 East German firms. €2 trillion transferred East. GDP converged to 75% of West levels but full convergence remains elusive 35 years later.',
    keyFactors: ['Currency union at political not economic rate', 'Rapid privatisation via Treuhand', 'Massive fiscal transfers', 'EU structural fund support'],
    lessonsLearned: ['Currency union at political exchange rates destroys competitiveness overnight', 'Even €2 trillion in transfers cannot guarantee full convergence', 'Social identity and dignity matter as much as economic metrics', 'Deindustrialisation creates generational political consequences'],
    whatWorked: ['Infrastructure modernisation (Autobahn, telecom)', 'Education system integration', 'Some cities (Leipzig, Dresden) became innovation hubs'],
    whatFailed: ['Deindustrialisation eliminated 3.5 million jobs', '1:1 currency conversion made East uncompetitive', 'Population exodus to West', 'Political alienation fuelled far-right movements'],
    timeToOutcome: '35+ years, convergence still incomplete'
  },
  {
    caseId: 'HC-043',
    title: 'Saudi Arabia ARAMCO IPO & Vision 2030',
    year: 2016,
    country: 'Saudi Arabia',
    region: 'Middle East',
    sector: 'Multi-sector',
    initiative: 'economic-diversification',
    outcome: 'ongoing',
    description: 'Crown Prince MBS launched Vision 2030 to diversify from oil. ARAMCO IPO raised $25.6B. NEOM, entertainment sector opening, tourism push, PIF investments globally.',
    keyFactors: ['Sovereign wealth fund (PIF) as transformation vehicle', 'Social liberalisation alongside economic reform', 'Mega-project strategy (NEOM, Red Sea, Qiddiya)', 'Deliberate geopolitical repositioning'],
    lessonsLearned: ['Sovereign wealth funds can drive diversification if given autonomy', 'Social reform must accompany economic reform for talent attraction', 'Mega-projects carry enormous execution risk', 'Diversification from oil requires generation-long commitment'],
    whatWorked: ['Entertainment sector opening attracted young population support', 'Tourism visa liberalisation', 'Women driving/workforce participation reforms', 'PIF global investment portfolio'],
    whatFailed: ['NEOM cost overruns and scale concerns', 'Human rights record deters some investors', 'Oil price dependency not yet materially reduced', 'Execution gap between vision and delivery'],
    timeToOutcome: 'Ongoing — 2030 targets partially met'
  },
  {
    caseId: 'HC-044',
    title: 'New Zealand Economic Reforms (Rogernomics)',
    year: 1984,
    country: 'New Zealand',
    region: 'Oceania',
    sector: 'Multi-sector',
    initiative: 'market-liberalisation',
    outcome: 'success',
    description: 'Radical deregulation, SOE reform, central bank independence, and GST introduction transformed NZ from most regulated OECD economy to one of the most open.',
    keyFactors: ['Fiscal crisis forced reform', 'Comprehensive not piecemeal approach', 'Independent Reserve Bank with inflation target', 'GST replacing complex tax system'],
    lessonsLearned: ['Crisis creates reform window that must be used decisively', 'Central bank independence with clear mandate works', 'Simple broad-based tax (GST) is more efficient than complex exemptions', 'Agricultural subsidy removal can succeed if done comprehensively'],
    whatWorked: ['Reserve Bank Act with inflation targeting became global model', 'Farm subsidy elimination made agriculture globally competitive', 'SOE reform improved service delivery', 'Treaty of Waitangi settlements addressed historical grievances'],
    whatFailed: ['Short-term unemployment spike during transition', 'Income inequality increased', 'Asset sales proved politically controversial', 'Rural communities bore disproportionate adjustment costs'],
    timeToOutcome: '10 years for structural transformation, ongoing refinement'
  },
  {
    caseId: 'HC-045',
    title: 'Bangladesh Garment Industry Rise',
    year: 1978,
    country: 'Bangladesh',
    region: 'Asia-Pacific',
    sector: 'Manufacturing',
    initiative: 'export-oriented-industry',
    outcome: 'partial-success',
    description: 'From near-zero to $45B+ garment exports making Bangladesh the world\'s second-largest apparel exporter. Lifted millions from poverty but Rana Plaza disaster exposed safety failures.',
    keyFactors: ['Low labour costs', 'MFA quota system created initial opportunity', 'Women\'s workforce participation', 'Backward linkage development'],
    lessonsLearned: ['Low-cost manufacturing can be a viable development path but requires safety investment', 'Women\'s economic participation transforms entire economies', 'Tragedy (Rana Plaza) can force industry-wide reform', 'Moving up the value chain requires deliberate policy not just market forces'],
    whatWorked: ['4 million+ jobs, majority women', 'Bangladesh Accord post-Rana Plaza improved safety', 'Backward integration (local fabric production)', 'Microfinance (Grameen Bank) complemented formal employment'],
    whatFailed: ['Rana Plaza collapse killed 1,134 workers (2013)', 'Wages remained among world\'s lowest', 'Environmental pollution from dyeing', 'Union suppression and worker rights violations'],
    timeToOutcome: '30 years to become second-largest exporter'
  },
  {
    caseId: 'HC-046',
    title: 'Estonia Digital Transformation (e-Estonia)',
    year: 2000,
    country: 'Estonia',
    region: 'Europe',
    sector: 'Technology',
    initiative: 'digital-government',
    outcome: 'success',
    description: 'Built world\'s most advanced digital government: e-Residency, digital ID, blockchain-secured records, i-Voting. 99% of government services online.',
    keyFactors: ['Post-Soviet clean slate', 'Small population enabled experimentation', 'Political commitment to digital-first', 'X-Road data exchange backbone'],
    lessonsLearned: ['Small countries can become global digital leaders', 'Interoperability infrastructure (X-Road) is more important than individual services', 'Digital identity is foundational for everything else', 'e-Residency creates borderless business environment'],
    whatWorked: ['X-Road data exchange layer connects all systems', 'Digital ID for all citizens from birth', 'e-Residency attracted 100,000+ digital entrepreneurs', 'i-Voting increased participation'],
    whatFailed: ['2007 Russian cyberattack exposed vulnerabilities', 'Digital divide for elderly population', 'ID card security flaw in 2017', 'e-Residency revenue impact smaller than projected'],
    timeToOutcome: '15 years to become world digital leader'
  },
  {
    caseId: 'HC-047',
    title: 'Panama Canal Expansion (Neo-Panamax)',
    year: 2007,
    country: 'Panama',
    region: 'Latin America',
    sector: 'Infrastructure',
    initiative: 'mega-infrastructure',
    outcome: 'success',
    description: 'Third set of locks expanded capacity for Neo-Panamax ships. Cost $5.25B, completed 2016. Doubled canal capacity and cemented Panama as global logistics hub.',
    keyFactors: ['National referendum approved project', 'Autonomous Canal Authority management', 'Engineering innovation (water-saving basins)', 'Global trade growth projection'],
    lessonsLearned: ['National referendum creates democratic legitimacy for mega-projects', 'Autonomous institution management outperforms political management', 'Expansion of existing strategic assets has lower risk than greenfield', 'Cost overruns are normal for mega-infrastructure — plan accordingly'],
    whatWorked: ['66% voter approval in 2006 referendum', 'Water-saving basins reduced environmental impact', 'Revenue doubled post-expansion', 'Panama became regional logistics and financial hub'],
    whatFailed: ['$1.6B cost overrun (original budget $5.25B)', '2 years behind schedule', 'Labour disputes during construction', 'Water supply challenges during droughts'],
    timeToOutcome: '9 years construction (2007-2016), immediate revenue impact'
  },
  {
    caseId: 'HC-048',
    title: 'Industrial Revolution — Manchester Model',
    year: 1820,
    country: 'United Kingdom',
    region: 'Europe',
    sector: 'Manufacturing',
    initiative: 'industrial-urbanisation',
    outcome: 'success',
    description: 'Manchester became "Cottonopolis" — first industrial city. Steam power, canals, then railways transformed cotton manufacturing, creating the template for industrial urbanisation worldwide.',
    keyFactors: ['Canal and rail transport networks', 'Coal and water power proximity', 'Labour migration from rural areas', 'Financial innovation (joint-stock companies)'],
    lessonsLearned: ['Transport infrastructure enables industrial clustering', 'Industrial cities create massive wealth but also massive social problems', 'Worker conditions must be addressed or revolution follows', 'First-mover industrial cities set global patterns'],
    whatWorked: ['Canal network then railway reduced transport costs', 'Manchester Exchange set global cotton prices', 'Technical innovation in spinning and weaving'],
    whatFailed: ['Life expectancy dropped to 26 years for workers', 'Child labour exploitation', 'Environmental devastation', 'Social unrest (Peterloo Massacre 1819)'],
    timeToOutcome: '50 years of industrial dominance (1770-1820)'
  },
  {
    caseId: 'HC-049',
    title: 'TVA — Tennessee Valley Authority',
    year: 1933,
    country: 'United States',
    region: 'North America',
    sector: 'Infrastructure',
    initiative: 'regional-development',
    outcome: 'success',
    description: 'New Deal regional development authority transformed the Tennessee Valley from poorest region to industrial heartland through integrated dam building, electrification, and economic planning.',
    keyFactors: ['Federal authority with regional scope', 'Integrated approach (power, flood control, navigation, development)', 'Public power model', 'Technical assistance to farmers'],
    lessonsLearned: ['Integrated regional development authorities can transform entire regions', 'Cheap power attracts industry', 'Environmental stewardship and development can coexist with planning', 'Federal-regional governance models work for cross-boundary challenges'],
    whatWorked: ['29 dams provided flood control and cheap electricity', 'Fertiliser production improved agriculture', 'Nuclear power development in 1960s', 'Regional income converged toward national average'],
    whatFailed: ['160,000 people displaced by reservoir flooding', 'Environmental impact of dam construction', 'Coal plant pollution (addressed later)', 'Model difficult to replicate in different governance contexts'],
    timeToOutcome: '20 years for regional transformation'
  },
  {
    caseId: 'HC-050',
    title: 'African Continental Free Trade Area (AfCFTA)',
    year: 2021,
    country: 'Africa',
    region: 'Africa',
    sector: 'Multi-sector',
    initiative: 'economic-integration',
    outcome: 'ongoing',
    description: 'World\'s largest free trade area by member states (54 countries, 1.3B people). Aims to boost intra-African trade from 15% to 25%+ and create $3.4T economic bloc.',
    keyFactors: ['African Union institutional backing', 'Phased tariff reduction approach', 'Rules of origin negotiations', 'Digital trade protocols'],
    lessonsLearned: ['Continental integration requires decades of patient institution-building', 'Implementation gaps between signing and actual trade liberalisation are enormous', 'Infrastructure deficits (roads, ports, customs) matter more than tariff barriers', 'Digital trade protocols can leapfrog physical trade barriers'],
    whatWorked: ['54 of 55 AU members signed (Eritrea exception)', 'Guided Trade Initiative pilot programme', 'Pan-African Payment and Settlement System (PAPSS)', 'Political momentum from multiple African leaders'],
    whatFailed: ['Implementation far behind schedule', 'Non-tariff barriers remain dominant constraint', 'Infrastructure gaps make physical trade costly', 'Overlapping regional economic communities create confusion'],
    timeToOutcome: 'Ongoing — generational project (2021-2050+)'
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

