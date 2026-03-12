/**
 * 
 * PATTERN CONFIDENCE ENGINE
 * 
 *
 * The layer that sits above formula computation. Before any formula runs,
 * this engine checks whether the input parameters match a known historical
 * pattern. If they do, baseline confidence is elevated and the output is
 * annotated with pattern provenance.
 *
 * Foundational principle:
 *   "The past isn't historical interest. The past is the solution library."
 *
 * Design rules:
 *   1. Known methodology ' high confidence, authoritative language
 *   2. Partial match       ' standard confidence, note which elements are novel
 *   3. No match            ' standard computation, flag as genuinely uncertain
 *
 * 
 */

import type { ReportParameters } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface PatternMatch {
  patternId: string;
  name: string;
  category: PatternCategory;
  matchStrength: number;        // 0-1: how well this input matches the pattern
  historicalDepth: number;       // years the pattern has been documented
  geographicBreadth: number;     // number of countries where pattern appears
  confidenceBoost: number;       // 0-0.3: added to formula confidence
  knownOutcomes: string[];       // what has historically happened
  knownRisks: string[];          // what has historically gone wrong
  methodology: string;           // description of the stable methodology
  sources: PatternSource[];
}

export type PatternCategory =
  | 'regional-development'
  | 'investment-incentive'
  | 'government-planning'
  | 'market-entry'
  | 'partnership-structure'
  | 'export-strategy'
  | 'infrastructure-development'
  | 'agricultural-modernisation'
  | 'special-economic-zone'
  | 'public-private-partnership'
  | 'technology-transfer'
  | 'financial-structuring'
  | 'climate-finance'
  | 'digital-economy'
  | 'healthcare-development'
  | 'tourism-development'
  | 'resource-governance'
  | 'anti-corruption';

export interface PatternSource {
  document: string;
  year: number;
  country: string;
  relevance: string;
}

export interface PatternAssessment {
  timestamp: string;
  inputSummary: string;
  matchedPatterns: PatternMatch[];
  overallConfidenceBoost: number;
  knownElements: string[];       // parts of the query that are structurally known
  novelElements: string[];       // parts that are genuinely novel
  reasoningStance: 'authoritative' | 'informed' | 'exploratory';
  stanceRationale: string;
}

// ============================================================================
// PATTERN LIBRARY " embedded methodology knowledge
// ============================================================================

const PATTERN_LIBRARY: Omit<PatternMatch, 'matchStrength' | 'confidenceBoost'>[] = [
  {
    patternId: 'SEZ-001',
    name: 'Special Economic Zone Investment Attraction',
    category: 'special-economic-zone',
    historicalDepth: 45,
    geographicBreadth: 80,
    knownOutcomes: [
      'Tax holidays attract initial wave of manufacturing FDI',
      'Employment concentration in zone, limited radiation to surrounding areas',
      'Infrastructure investment follows zone designation',
      'Second-generation zones shift toward services and technology',
    ],
    knownRisks: [
      'Race to the bottom on incentives between competing zones',
      'Enclave economies with limited local linkage',
      'Dependency on zone-specific infrastructure that becomes stranded',
      'Political risk when incentive periods expire',
    ],
    methodology: 'Growth pole theory applied through designated geographic areas with preferential tax, customs, and regulatory treatment. Pattern stable since Shenzhen (1980), replicated in 80+ countries.',
    sources: [
      { document: 'China Special Economic Zones', year: 1980, country: 'China', relevance: 'Origin model for modern SEZ' },
      { document: 'PEZA Establishment Act', year: 1995, country: 'Philippines', relevance: 'Direct implementation' },
      { document: 'Vietnam Industrial Zones Policy', year: 1991, country: 'Vietnam', relevance: 'Regional parallel' },
      { document: 'Bangladesh Export Processing Zones', year: 1983, country: 'Bangladesh', relevance: 'South Asian adoption' },
    ],
  },
  {
    patternId: 'RDP-001',
    name: 'Regional Development Planning Cycle',
    category: 'regional-development',
    historicalDepth: 63,
    geographicBreadth: 120,
    knownOutcomes: [
      'Five/six-year planning cycles produce structured sectoral targets',
      'Infrastructure corridors follow capital city radial patterns',
      'Regional disparity statements persist across plan cycles',
      'Growth centres develop; radiation to periphery remains limited',
    ],
    knownRisks: [
      'Plan-to-implementation gap widens in resource-constrained regions',
      'Political cycle misalignment with planning cycle',
      'Stated decentralisation goals contradict revealed centralisation preference',
      'Data availability degrades outside primary urban areas',
    ],
    methodology: 'Structured medium-term plans with sectoral breakdown, regional allocation, and infrastructure prioritisation. Unchanged since 1960s adoption from Franco-Soviet planning traditions.',
    sources: [
      { document: 'Philippine Integrated Socioeconomic Plan', year: 1963, country: 'Philippines', relevance: 'Early Southeast Asian adoption' },
      { document: 'Region 7 Five-Year Development Plan', year: 1978, country: 'Philippines', relevance: 'Regional implementation' },
      { document: 'Regional Planning in the Philippines', year: 1984, country: 'Philippines', relevance: 'Methodology documentation' },
      { document: 'Philippine Development Plan 2023-2028', year: 2023, country: 'Philippines', relevance: 'Current continuation' },
    ],
  },
  {
    patternId: 'INV-001',
    name: 'Investment Incentive Structure',
    category: 'investment-incentive',
    historicalDepth: 58,
    geographicBreadth: 140,
    knownOutcomes: [
      'Tax holidays and import duty exemptions are universal baseline offers',
      'Incentives concentrate investment in already-accessible areas',
      'Tiered incentive structures emerge (higher incentives for less-developed regions)',
      'Sunset clauses create periodic renegotiation pressure',
    ],
    knownRisks: [
      'Incentive competition erodes fiscal base',
      'Promised infrastructure may lag behind incentive timeline',
      'Regulatory stability risk when administrations change',
      'Compliance burden can offset incentive value for smaller firms',
    ],
    methodology: 'Legislated incentive packages combining tax, customs, and regulatory concessions to attract foreign and domestic investment. Structure stable since 1960s Industrial Incentives Acts globally.',
    sources: [
      { document: 'Industrial Incentives Act', year: 1967, country: 'Philippines', relevance: 'Early ASEAN model' },
      { document: 'CREATE Act', year: 2021, country: 'Philippines', relevance: 'Current framework' },
      { document: 'Vietnam Investment Law', year: 2020, country: 'Vietnam', relevance: 'Regional comparison' },
      { document: 'Indonesia Omnibus Law', year: 2020, country: 'Indonesia', relevance: 'Regional comparison' },
    ],
  },
  {
    patternId: 'PPP-001',
    name: 'Public-Private Partnership Framework',
    category: 'public-private-partnership',
    historicalDepth: 35,
    geographicBreadth: 90,
    knownOutcomes: [
      'Infrastructure delivery accelerated versus pure public procurement',
      'Risk transfer to private sector is partial, not total',
      'Revenue models require government guarantee or minimum revenue guarantee',
      'Transaction costs high relative to traditional procurement',
    ],
    knownRisks: [
      'Contingent liabilities for government can be substantial and hidden',
      'Renegotiation commonplace, especially post-election',
      'Affordability projections frequently optimistic',
      'Community opposition if user-pays model perceived as privatisation',
    ],
    methodology: 'Contractual arrangements where private sector finances, builds, and/or operates public infrastructure in exchange for revenue rights. Based on UK PFI (1992), adapted globally.',
    sources: [
      { document: 'UK Private Finance Initiative', year: 1992, country: 'United Kingdom', relevance: 'Origin model' },
      { document: 'Philippine BOT Law', year: 1990, country: 'Philippines', relevance: 'Early adopter' },
      { document: 'Philippine PPP Center Guidelines', year: 2010, country: 'Philippines', relevance: 'Current framework' },
      { document: 'ADB PPP Handbook', year: 2008, country: 'International', relevance: 'Methodology standard' },
    ],
  },
  {
    patternId: 'MKE-001',
    name: 'Emerging Market Entry Strategy',
    category: 'market-entry',
    historicalDepth: 40,
    geographicBreadth: 100,
    knownOutcomes: [
      'Joint ventures preferred over wholly-owned subsidiaries for market access',
      'Local partner selection is the primary determinant of success or failure',
      'Regulatory navigation requires in-country presence, not remote management',
      'First-mover advantage is real but overestimated in cost vs. fast-follower',
    ],
    knownRisks: [
      'Partner misalignment typically surfaces after 12-18 months',
      'Currency volatility impacts repatriation more than operating margin',
      'Intellectual property protection weaker in practice than in law',
      'Political relationship dependency creates single-point-of-failure',
    ],
    methodology: 'Structured market entry through partner identification, regulatory mapping, pilot operations, and phased commitment. Framework stable since 1980s internationalisation theory.',
    sources: [
      { document: 'Uppsala Internationalisation Model', year: 1977, country: 'Sweden', relevance: 'Foundational theory' },
      { document: 'Dunning Eclectic Paradigm', year: 1980, country: 'United Kingdom', relevance: 'OLI framework' },
      { document: 'IFC Market Entry Guidelines', year: 2005, country: 'International', relevance: 'Practitioner standard' },
    ],
  },
  {
    patternId: 'AGR-001',
    name: 'Agricultural Modernisation and Land Reform',
    category: 'agricultural-modernisation',
    historicalDepth: 63,
    geographicBreadth: 60,
    knownOutcomes: [
      'Land redistribution without capital support produces fragmented, unproductive holdings',
      'Value chain integration more effective than input subsidies alone',
      'Mechanisation displaces labour faster than alternative employment absorbs it',
      'Export crop focus creates food security tension',
    ],
    knownRisks: [
      'Elite capture of reform programmes',
      'Land titling backlog creates investment uncertainty',
      'Climate vulnerability concentrated in rain-fed smallholder sector',
      'Market access bottleneck at aggregation/logistics layer',
    ],
    methodology: 'Reform cycles combining land redistribution, input provision, extension services, and market linkage. Pattern documented since 1950s Asian land reforms.',
    sources: [
      { document: 'Agricultural Land Reform Code RA 3844', year: 1963, country: 'Philippines', relevance: 'Southeast Asian model' },
      { document: 'CARP Comprehensive Agrarian Reform', year: 1988, country: 'Philippines', relevance: 'Continuation' },
      { document: 'Taiwan Land Reform', year: 1953, country: 'Taiwan', relevance: 'Successful reference' },
    ],
  },
  {
    patternId: 'INF-001',
    name: 'Infrastructure-Led Development Corridor',
    category: 'infrastructure-development',
    historicalDepth: 50,
    geographicBreadth: 70,
    knownOutcomes: [
      'Transport corridors attract linear development along route',
      'Nodal cities at intersections become secondary growth centres',
      'Last-mile connectivity determines whether corridor benefits reach communities',
      'Multi-modal integration (road + rail + port) amplifies economic impact',
    ],
    knownRisks: [
      'Land acquisition delays are the primary timeline risk',
      'Environmental and resettlement compliance costs frequently underestimated',
      'Corridor benefits concentrated at endpoints, limited mid-corridor impact',
      'Maintenance funding gap emerges 5-10 years post-completion',
    ],
    methodology: 'Strategic infrastructure investment along identified geographic corridors to stimulate economic development. Based on development corridor theory applied globally since 1970s.',
    sources: [
      { document: 'Greater Mekong Subregion Economic Corridors', year: 1992, country: 'ASEAN', relevance: 'Regional model' },
      { document: 'Philippine Build Build Build Programme', year: 2017, country: 'Philippines', relevance: 'Current implementation' },
      { document: 'India Golden Quadrilateral', year: 2001, country: 'India', relevance: 'Large-scale reference' },
    ],
  },
  {
    patternId: 'TEC-001',
    name: 'Technology Transfer and BPO Development',
    category: 'technology-transfer',
    historicalDepth: 25,
    geographicBreadth: 40,
    knownOutcomes: [
      'English-speaking labour pool is the primary locational determinant',
      'IT-BPO creates urban middle-class employment but limited rural linkage',
      'Salary escalation erodes cost advantage within 8-12 years',
      'Second-tier cities viable when connectivity infrastructure exists',
    ],
    knownRisks: [
      'Automation risk increases with process maturity',
      'Data privacy regulation creates compliance cost and liability',
      'Employee attrition rates 25-40% in competitive markets',
      'Single-client dependency at firm level',
    ],
    methodology: 'Labour cost arbitrage combined with skills availability, connectivity, and incentive packages. Pattern emerged from India (1990s), replicated in Philippines, Vietnam, Eastern Europe.',
    sources: [
      { document: 'India IT-BPO Emergence', year: 1991, country: 'India', relevance: 'Origin market' },
      { document: 'Philippine IT-BPM Roadmap', year: 2005, country: 'Philippines', relevance: 'Second largest market' },
      { document: 'IBPAP Industry Reports', year: 2023, country: 'Philippines', relevance: 'Current state' },
    ],
  },
  {
    patternId: 'FIN-001',
    name: 'Development Finance and Grant Structuring',
    category: 'financial-structuring',
    historicalDepth: 45,
    geographicBreadth: 100,
    knownOutcomes: [
      'Blended finance (grant + debt + equity) structures attract private capital to underserved sectors',
      'Grant conditions create reporting overhead that smaller organisations struggle with',
      'Concessional lending rates 2-5% below commercial, but procurement requirements add cost',
      'Multi-lateral funding requires 12-24 month preparation pipeline',
    ],
    knownRisks: [
      'Disbursement delays of 6-18 months are standard',
      'Counterpart funding requirements strain local budgets',
      'Procurement requirements may exclude local suppliers',
      'Project completion rates for development-financed projects average 60-70%',
    ],
    methodology: 'Structured financing combining grant, concessional, and commercial capital with milestone-based disbursement. Pattern established by World Bank/IFC/ADB since 1980s.',
    sources: [
      { document: 'World Bank Operational Manual', year: 1980, country: 'International', relevance: 'Standard framework' },
      { document: 'ADB Project Financing Guidelines', year: 1990, country: 'International', relevance: 'Regional standard' },
      { document: 'GCF Funding Proposals', year: 2015, country: 'International', relevance: 'Climate finance' },
    ],
  },
  {
    patternId: 'EXP-001',
    name: 'First-Time Export Strategy',
    category: 'export-strategy',
    historicalDepth: 35,
    geographicBreadth: 80,
    knownOutcomes: [
      'Trade facilitation programmes reduce first-export barriers by 30-50%',
      'Market selection based on cultural proximity outperforms pure market-size logic',
      'Compliance with destination-market standards is the primary technical barrier',
      'Export readiness assessment predicts first-year survival with 70% accuracy',
    ],
    knownRisks: [
      'Payment terms exposure (60-90 day receivables) creates cash flow pressure',
      'Documentation errors cause 15-25% of first shipment delays',
      'Exchange rate movement can eliminate margin on thin-margin goods',
      'Single-market dependency in first 2 years',
    ],
    methodology: 'Structured export readiness assessment, market selection, compliance mapping, and pilot shipment. Framework used by export promotion agencies globally since 1990s.',
    sources: [
      { document: 'ITC Export Strategy Framework', year: 1995, country: 'International', relevance: 'Methodology standard' },
      { document: 'Austrade Export Readiness', year: 2000, country: 'Australia', relevance: 'Developed market model' },
      { document: 'Philippine Export Development Plan', year: 2018, country: 'Philippines', relevance: 'Emerging market model' },
    ],
  },
  {
    patternId: 'PRT-001',
    name: 'Strategic Partnership Formation',
    category: 'partnership-structure',
    historicalDepth: 40,
    geographicBreadth: 100,
    knownOutcomes: [
      'Partnerships with clear governance structures survive 3x longer than informal arrangements',
      'Value alignment matters more than size alignment for partnership longevity',
      'Joint ventures outperform licensing in emerging markets for knowledge transfer',
      'Exit provisions negotiated at formation prevent 60% of partnership disputes',
    ],
    knownRisks: [
      'Cultural misalignment surfaces in operational decisions, not strategic ones',
      'Information asymmetry between partners creates trust erosion',
      'Competing interests emerge when market conditions change',
      'Key-person dependency in partner organisations',
    ],
    methodology: 'Structured partner identification, alignment assessment, governance design, and phased commitment. Framework based on alliance management theory since 1980s.',
    sources: [
      { document: 'Alliance Management Best Practices', year: 1985, country: 'International', relevance: 'Foundational framework' },
      { document: 'ASEAN Business Partnership Guidelines', year: 2010, country: 'ASEAN', relevance: 'Regional application' },
    ],
  },
  {
    patternId: 'GOV-001',
    name: 'Government Investment Promotion',
    category: 'government-planning',
    historicalDepth: 60,
    geographicBreadth: 150,
    knownOutcomes: [
      'One-stop-shop models reduce investor processing time by 40-60%',
      'Investment promotion agencies exist in every country; effectiveness varies by mandate clarity',
      'After-care services (post-establishment support) improve reinvestment rates significantly',
      'Investment promotion events/roadshows have low conversion but high signalling value',
    ],
    knownRisks: [
      'Promise-delivery gap between promotion agency and line ministries',
      'Incentive offerings may exceed legal authority of promoting agency',
      'Inter-agency coordination failure is the primary complaint from investors',
      'Data quality in promotional materials frequently overstates readiness',
    ],
    methodology: 'Structured investment promotion through dedicated agencies, targeted campaigns, incentive packaging, and investor aftercare. Universal practice since 1950s.',
    sources: [
      { document: 'IDA Ireland Model', year: 1949, country: 'Ireland', relevance: 'Origin model for IPAs' },
      { document: 'Philippine BOI Investment Priorities Plan', year: 1967, country: 'Philippines', relevance: 'Southeast Asian model' },
      { document: 'UNCTAD World Investment Report', year: 2023, country: 'International', relevance: 'Global benchmark' },
    ],
  },
  // â"€â"€ NEW PATTERNS " Africa, Latin America, Middle East, Central Asia â"€â"€
  {
    patternId: 'CLF-001',
    name: 'Climate Finance and Green Bond Structuring',
    category: 'financial-structuring',
    historicalDepth: 15,
    geographicBreadth: 140,
    knownOutcomes: [
      'Green bonds now exceed $500B annual issuance globally',
      'Climate finance unlocks concessional capital inaccessible through commercial channels',
      'MRV (Measurement, Reporting, Verification) requirements add 5-15% project cost',
      'REDD+ and carbon credit mechanisms create supplementary revenue streams',
    ],
    knownRisks: [
      'Greenwashing accusations damage reputational capital',
      'Carbon market volatility introduces revenue uncertainty',
      'Additionality requirements are ambiguous and evolving',
      'Climate finance eligibility criteria change with political cycles',
    ],
    methodology: 'Project-level climate finance structuring using GCF, GEF, and bilateral climate fund frameworks. Combines mitigation/adaptation logic with bankable project design.',
    sources: [
      { document: 'Green Climate Fund Investment Framework', year: 2015, country: 'International', relevance: 'Largest climate fund' },
      { document: 'Kenya Green Bond Programme', year: 2019, country: 'Kenya', relevance: 'African pioneer' },
      { document: 'Indonesia Sovereign Green Sukuk', year: 2018, country: 'Indonesia', relevance: 'Islamic climate finance' },
      { document: 'Chile Green Bond Framework', year: 2019, country: 'Chile', relevance: 'Latin American model' },
    ],
  },
  {
    patternId: 'MIN-001',
    name: 'Mining and Extractive Industry Governance',
    category: 'regional-development',
    historicalDepth: 55,
    geographicBreadth: 90,
    knownOutcomes: [
      'Resource-rich countries without governance frameworks suffer "resource curse"',
      'Revenue-sharing agreements determine community acceptance or conflict',
      'EITI compliance improves investor confidence by 20-30%',
      'Sovereign wealth funds stabilise fiscal management of volatile commodity revenue',
    ],
    knownRisks: [
      'Dutch disease displaces non-resource sectors',
      'Community displacement creates multi-generational grievances',
      'Environmental remediation costs frequently exceed bond provisions',
      'Political capture of mining revenue undermines institutional integrity',
    ],
    methodology: 'Resource governance combining EITI transparency, community benefit agreements, environmental bonding, and sovereign wealth fund design. Pattern established across 50+ resource economies.',
    sources: [
      { document: 'Botswana Diamond Revenue Management', year: 1967, country: 'Botswana', relevance: 'Gold standard resource governance' },
      { document: 'Chile Copper Stabilization Fund', year: 1985, country: 'Chile', relevance: 'Counter-cyclical fund model' },
      { document: 'Norway Government Pension Fund', year: 1990, country: 'Norway', relevance: 'Sovereign wealth benchmark' },
      { document: 'Ghana Petroleum Revenue Management', year: 2011, country: 'Ghana', relevance: 'Recent African model' },
    ],
  },
  {
    patternId: 'DIG-001',
    name: 'Digital Economy Leapfrog Strategy',
    category: 'technology-transfer',
    historicalDepth: 15,
    geographicBreadth: 60,
    knownOutcomes: [
      'Mobile money adoption enables financial inclusion bypass of traditional banking',
      'Digital ID systems enable government service delivery transformation',
      'E-commerce growth in emerging markets outpaces developed market rates 3-5x',
      'Digital tax collection improvements of 15-30% within 3 years of implementation',
    ],
    knownRisks: [
      'Digital divide deepens inequality between urban/connected and rural/disconnected',
      'Data sovereignty concerns create regulatory friction with global platforms',
      'Cybersecurity capacity lags behind digital adoption in most emerging markets',
      'Platform monopolies extract value from markets faster than regulation can respond',
    ],
    methodology: 'Digital economy acceleration through mobile-first infrastructure, regulatory sandboxes, digital ID, and e-government. Pattern emerged from Kenya M-Pesa (2007), India Aadhaar/UPI, Estonia e-governance.',
    sources: [
      { document: 'Kenya M-Pesa Mobile Money', year: 2007, country: 'Kenya', relevance: 'Origin fintech model' },
      { document: 'India Digital Stack (Aadhaar/UPI)', year: 2010, country: 'India', relevance: 'Largest digital ID' },
      { document: 'Estonia e-Residency Programme', year: 2014, country: 'Estonia', relevance: 'Digital governance pioneer' },
      { document: 'Rwanda Smart Kigali Programme', year: 2015, country: 'Rwanda', relevance: 'African digital city' },
    ],
  },
  {
    patternId: 'AFZ-001',
    name: 'African Free Trade Zone Integration',
    category: 'special-economic-zone',
    historicalDepth: 10,
    geographicBreadth: 54,
    knownOutcomes: [
      'AfCFTA represents 1.3B person single market - largest by member count',
      'Intra-African trade increases from 15% to projected 25% by 2030',
      'Rules of origin complexity remains the primary implementation challenge',
      'Infrastructure deficit limits actual trade facilitation despite tariff reduction',
    ],
    knownRisks: [
      'Non-tariff barriers persist despite agreement ratification',
      'Customs harmonisation implementation lags 3-5 years behind schedule',
      'Dominant economies (Nigeria, South Africa, Egypt, Kenya) capture disproportionate benefit',
      'Small economies need safeguard mechanisms against import surges',
    ],
    methodology: 'Continental free trade area implementation through phased tariff reduction, rules of origin harmonisation, and trade facilitation. Based on EU single market model adapted for African context.',
    sources: [
      { document: 'AfCFTA Agreement', year: 2018, country: 'African Union', relevance: 'Continental framework' },
      { document: 'EAC Common Market Protocol', year: 2010, country: 'East Africa', relevance: 'Regional precedent' },
      { document: 'ECOWAS Trade Liberalisation Scheme', year: 1993, country: 'West Africa', relevance: 'Sub-regional model' },
      { document: 'SADC Free Trade Area', year: 2008, country: 'Southern Africa', relevance: 'Sub-regional model' },
    ],
  },
  {
    patternId: 'GCC-001',
    name: 'GCC Economic Diversification',
    category: 'regional-development',
    historicalDepth: 20,
    geographicBreadth: 6,
    knownOutcomes: [
      'Tourism and real estate diversification most successful (Dubai model)',
      'Sovereign wealth fund-backed industrial zones attract anchor tenants',
      'Labour nationalisation quotas create structural tension with business needs',
      'Knowledge economy aspirations require 15-20 year education pipeline investment',
    ],
    knownRisks: [
      'Oil price volatility disrupts diversification budgets',
      'Guest worker dependency creates social stability risks',
      'Megaproject cost overruns endemic (50-300% common)',
      'Regional competition between GCC states for same sectors and investors',
    ],
    methodology: 'Oil-economy diversification through vision plans (Vision 2030), sovereign wealth deployment, megaproject development, and targeted sector attraction. Pattern across all 6 GCC states since 2000s.',
    sources: [
      { document: 'Saudi Vision 2030', year: 2016, country: 'Saudi Arabia', relevance: 'Largest diversification plan' },
      { document: 'Dubai Vision 2021', year: 2014, country: 'UAE', relevance: 'Most advanced implementation' },
      { document: 'Qatar National Vision 2030', year: 2008, country: 'Qatar', relevance: 'Small state model' },
      { document: 'Oman Vision 2040', year: 2020, country: 'Oman', relevance: 'Late mover adaptation' },
    ],
  },
  {
    patternId: 'CAS-001',
    name: 'Central Asian Corridor Development',
    category: 'infrastructure-development',
    historicalDepth: 30,
    geographicBreadth: 15,
    knownOutcomes: [
      'Belt and Road Initiative revived Silk Road trade corridor concept',
      'Transport corridor development creates landlock-to-land-link transformation',
      'Multi-lateral infrastructure projects face coordination costs across 3-5 countries',
      'Resource corridor models (mining + transport) are most bankable structures',
    ],
    knownRisks: [
      'Debt sustainability concerns with large infrastructure loans',
      'Geopolitical competition between China, Russia, and Western interests',
      'Environmental and social safeguards vary dramatically between lenders',
      'Transit country dependency creates single-point-of-failure risks',
    ],
    methodology: 'Multi-country corridor development combining transport infrastructure, trade facilitation, and economic zone clusters. Based on Greater Mekong Subregion model adapted for Central/West Asia.',
    sources: [
      { document: 'CAREC Transport Corridors', year: 2001, country: 'Central Asia', relevance: 'ADB multi-country framework' },
      { document: 'Belt and Road Initiative', year: 2013, country: 'China', relevance: 'Largest infrastructure initiative' },
      { document: 'Kazakhstan Nurly Zhol Programme', year: 2014, country: 'Kazakhstan', relevance: 'National corridor model' },
      { document: 'Uzbekistan Development Strategy', year: 2017, country: 'Uzbekistan', relevance: 'Reform-era connectivity' },
    ],
  },
  {
    patternId: 'LAT-001',
    name: 'Latin American Nearshoring Wave',
    category: 'market-entry',
    historicalDepth: 8,
    geographicBreadth: 20,
    knownOutcomes: [
      'US-China decoupling creating Mexico and Central America manufacturing relocation',
      'Maquila/free zone models evolving to higher value-added production',
      'Time zone alignment with US creates competitive advantage for services',
      'Pacific Alliance (Chile, Colombia, Mexico, Peru) facilitates intra-regional trade',
    ],
    knownRisks: [
      'Security challenges in some manufacturing corridors',
      'Infrastructure capacity may not absorb redirected supply chains rapidly enough',
      'Labour availability in technical skills is the binding constraint',
      'Political instability in some key nearshoring destinations',
    ],
    methodology: 'Supply chain relocation strategy leveraging geographic proximity, trade agreements, and cost arbitrage. Emerging pattern post-COVID and US-China tensions.',
    sources: [
      { document: 'Mexico Nearshoring Opportunities (Banxico)', year: 2022, country: 'Mexico', relevance: 'Primary destination' },
      { document: 'Costa Rica Nearshoring Strategy (CINDE)', year: 2021, country: 'Costa Rica', relevance: 'Services nearshoring' },
      { document: 'Colombia Productive Transformation', year: 2020, country: 'Colombia', relevance: 'South American model' },
      { document: 'IDB Nearshoring Assessment', year: 2023, country: 'International', relevance: 'Regional analysis' },
    ],
  },
  {
    patternId: 'HLT-001',
    name: 'Healthcare and Life Sciences Hub',
    category: 'technology-transfer',
    historicalDepth: 25,
    geographicBreadth: 35,
    knownOutcomes: [
      'Medical tourism creates $50-100B global market with compound growth',
      'Generic pharmaceutical manufacturing concentrated in India, Bangladesh, and South Africa',
      'Clinical trial outsourcing shifting to diverse-population lower-cost jurisdictions',
      'Telemedicine post-COVID created new service export category',
    ],
    knownRisks: [
      'Regulatory harmonisation challenges across borders',
      'IP and patent cliff management in pharmaceutical manufacturing',
      'Healthcare brain drain from public to private/international sectors',
      'Quality assurance and WHO prequalification as barriers to entry',
    ],
    methodology: 'Healthcare sector development combining medical tourism, pharmaceutical manufacturing, clinical research, and digital health. Pattern from India, Thailand, Singapore, and emerging African hubs.',
    sources: [
      { document: 'Thailand Medical Tourism Hub Strategy', year: 2004, country: 'Thailand', relevance: 'Pioneer medical tourism' },
      { document: 'India Pharma Vision 2020', year: 2012, country: 'India', relevance: 'Generic pharma powerhouse' },
      { document: 'Rwanda Health Innovation Strategy', year: 2018, country: 'Rwanda', relevance: 'African health-tech' },
      { document: 'Bangladesh API Manufacturing', year: 2016, country: 'Bangladesh', relevance: 'Emerging pharma hub' },
    ],
  },
  {
    patternId: 'TRS-001',
    name: 'Tourism-Led Economic Development',
    category: 'regional-development',
    historicalDepth: 45,
    geographicBreadth: 120,
    knownOutcomes: [
      'Tourism accounts for 10%+ GDP in 45+ countries',
      'Eco-tourism and sustainable tourism commands 20-30% price premium',
      'Cruise tourism creates concentrated economic impact at port destinations',
      'Tourism employment multiplier effect ranges from 1.5-2.5x direct jobs',
    ],
    knownRisks: [
      'Over-tourism degrades the natural/cultural assets that attract visitors',
      'COVID demonstrated extreme vulnerability of tourism-dependent economies',
      'Seasonality creates employment instability and resource waste',
      'Foreign leakage of tourism revenue can reach 70-80% in island economies',
    ],
    methodology: 'Destination development combining infrastructure, marketing, product development, and carrying capacity management. Established framework since 1960s mass tourism era.',
    sources: [
      { document: 'UNWTO Tourism Development Guidelines', year: 1975, country: 'International', relevance: 'Global standard' },
      { document: 'Maldives Tourism Master Plan', year: 1983, country: 'Maldives', relevance: 'Island tourism model' },
      { document: 'Costa Rica Ecotourism Strategy', year: 1990, country: 'Costa Rica', relevance: 'Sustainable model' },
      { document: 'Rwanda Gorilla Tourism', year: 2005, country: 'Rwanda', relevance: 'Conservation tourism' },
    ],
  },
  {
    patternId: 'ACO-001',
    name: 'Anti-Corruption and Governance Reform',
    category: 'government-planning',
    historicalDepth: 30,
    geographicBreadth: 195,
    knownOutcomes: [
      'UNCAC ratification is near-universal but implementation varies dramatically',
      'E-procurement reduces corruption by 25-40% in public contracting',
      'Asset declaration systems effective only when verified and public',
      'Independent anti-corruption agencies require political insulation to function',
    ],
    knownRisks: [
      'Anti-corruption drives can be weaponised for political persecution',
      'Institutional reform without cultural change produces cosmetic compliance',
      'International pressure creates technical compliance without substantive reform',
      'Brain drain when competent officials face hostile working environment',
    ],
    methodology: 'Governance reform through transparency mechanisms, institutional design, e-government, and international peer review. Based on UNCAC, OECD Anti-Bribery Convention, and FATF standards.',
    sources: [
      { document: 'UN Convention Against Corruption', year: 2003, country: 'International', relevance: 'Global framework' },
      { document: 'Georgia Anti-Corruption Reforms', year: 2003, country: 'Georgia', relevance: 'Rapid transformation model' },
      { document: 'Rwanda Governance Reforms', year: 2000, country: 'Rwanda', relevance: 'African governance benchmark' },
      { document: 'Singapore Anti-Corruption Model', year: 1960, country: 'Singapore', relevance: 'Long-term success case' },
    ],
  },
];

// ============================================================================
// ENGINE
// ============================================================================

export class PatternConfidenceEngine {

  /**
   * Assess input parameters against the pattern library.
   * Returns matched patterns, confidence boosts, and reasoning stance.
   */
  static assess(params: ReportParameters): PatternAssessment {
    const matches: PatternMatch[] = [];
    const knownElements: string[] = [];
    const novelElements: string[] = [];

    for (const pattern of PATTERN_LIBRARY) {
      const strength = this.computeMatchStrength(params, pattern);
      if (strength > 0.2) {
        matches.push({
          ...pattern,
          matchStrength: strength,
          confidenceBoost: Math.min(0.3, strength * 0.3 * (pattern.historicalDepth / 60)),
        });
      }
    }

    // Sort by match strength
    matches.sort((a, b) => b.matchStrength - a.matchStrength);

    // Classify elements as known vs novel
    if (params.country) {
      const countryMatches = matches.filter(m =>
        m.sources.some(s => s.country === params.country || s.country === 'International' || s.country === 'ASEAN')
      );
      if (countryMatches.length > 0) {
        knownElements.push(`Country context (${params.country}) " ${countryMatches.length} matching patterns with documented history`);
      } else {
        novelElements.push(`Country context (${params.country}) " limited pattern history in library`);
      }
    }

    if (params.industry && params.industry.length > 0) {
      knownElements.push(`Sector selection " standard sectoral analysis methodology applies`);
    }

    if (params.expansionTimeline) {
      knownElements.push(`Timeline planning " phased implementation is universal practice`);
    }

    if (params.organizationType) {
      knownElements.push(`Organisation type (${params.organizationType}) " known stakeholder dynamics`);
    }

    if (params.problemStatement) {
      const hasNovelProblem = !matches.some(m => m.matchStrength > 0.5);
      if (hasNovelProblem) {
        novelElements.push(`Problem statement may contain novel elements not fully covered by historical patterns`);
      } else {
        knownElements.push(`Problem framing matches documented pattern categories`);
      }
    }

    // Determine reasoning stance
    const totalBoost = matches.reduce((sum, m) => sum + m.confidenceBoost, 0);
    const avgStrength = matches.length > 0
      ? matches.reduce((sum, m) => sum + m.matchStrength, 0) / matches.length
      : 0;

    let stance: PatternAssessment['reasoningStance'];
    let stanceRationale: string;

    if (avgStrength > 0.6 && matches.length >= 2) {
      stance = 'authoritative';
      stanceRationale = `${matches.length} patterns matched with average strength ${(avgStrength * 100).toFixed(0)}%. Historical depth spans ${Math.max(...matches.map(m => m.historicalDepth))} years across ${Math.max(...matches.map(m => m.geographicBreadth))} countries. System should respond with high confidence on structural elements.`;
    } else if (avgStrength > 0.3 && matches.length >= 1) {
      stance = 'informed';
      stanceRationale = `${matches.length} partial pattern matches. Some structural elements are known; others require standard analytical treatment. Confidence elevated on known elements, standard on novel elements.`;
    } else {
      stance = 'exploratory';
      stanceRationale = `Limited pattern matches. This input represents a genuinely novel combination. Standard probabilistic reasoning appropriate. Full deliberation by all personas recommended.`;
    }

    return {
      timestamp: new Date().toISOString(),
      inputSummary: `${params.organizationName || 'Unknown'} " ${params.country || 'No country'} " ${(params.industry || []).join(', ') || 'No sector'}`,
      matchedPatterns: matches,
      overallConfidenceBoost: Math.min(0.3, totalBoost / Math.max(matches.length, 1)),
      knownElements,
      novelElements,
      reasoningStance: stance,
      stanceRationale,
    };
  }

  /**
   * Compute how strongly input parameters match a pattern.
   */
  private static computeMatchStrength(
    params: ReportParameters,
    pattern: Omit<PatternMatch, 'matchStrength' | 'confidenceBoost'>
  ): number {
    let score = 0;
    let factors = 0;

    // Country match
    if (params.country) {
      const countryLower = params.country.toLowerCase();
      const hasCountrySource = pattern.sources.some(s =>
        s.country.toLowerCase() === countryLower ||
        s.country === 'International' ||
        s.country === 'ASEAN'
      );
      if (hasCountrySource) { score += 0.3; }
      factors += 0.3;
    }

    // Category match via keywords in problem statement and industry
    const inputText = [
      params.problemStatement || '',
      ...(params.industry || []),
      params.organizationType || '',
      params.expansionTimeline || '',
    ].join(' ').toLowerCase();

    const categoryKeywords: Record<PatternCategory, string[]> = {
      'regional-development': ['regional', 'development', 'rural', 'provincial', 'decentrali', 'growth pole', 'corridor'],
      'investment-incentive': ['incentive', 'tax holiday', 'tax break', 'exemption', 'boi', 'peza', 'zone'],
      'government-planning': ['government', 'public sector', 'policy', 'planning', 'council', 'municipal', 'agency'],
      'market-entry': ['market entry', 'expansion', 'new market', 'foreign', 'international', 'overseas', 'nearshoring'],
      'partnership-structure': ['partner', 'joint venture', 'alliance', 'collaboration', 'consortium'],
      'export-strategy': ['export', 'trade', 'international trade', 'customs', 'tariff'],
      'infrastructure-development': ['infrastructure', 'road', 'port', 'airport', 'bridge', 'power', 'energy', 'corridor', 'belt and road'],
      'agricultural-modernisation': ['agriculture', 'farming', 'agri', 'land reform', 'crop', 'food', 'value chain'],
      'special-economic-zone': ['economic zone', 'sez', 'freeport', 'industrial park', 'peza', 'export processing', 'free trade zone'],
      'public-private-partnership': ['ppp', 'public-private', 'concession', 'bot', 'build-operate'],
      'technology-transfer': ['technology', 'bpo', 'it-bpm', 'software', 'digital', 'outsourcing', 'tech', 'fintech'],
      'financial-structuring': ['finance', 'funding', 'grant', 'loan', 'capital', 'investment', 'blended'],
      'climate-finance': ['climate', 'green bond', 'carbon', 'renewable', 'sustainability', 'gcf', 'adaptation', 'mitigation'],
      'digital-economy': ['digital', 'e-commerce', 'mobile money', 'fintech', 'digital id', 'e-government', 'digital economy'],
      'healthcare-development': ['health', 'medical', 'pharma', 'hospital', 'clinical', 'telemedicine', 'biotech'],
      'tourism-development': ['tourism', 'travel', 'hospitality', 'hotel', 'eco-tourism', 'destination'],
      'resource-governance': ['mining', 'extractive', 'oil', 'gas', 'mineral', 'resource', 'eiti', 'sovereign wealth'],
      'anti-corruption': ['corruption', 'governance', 'transparency', 'integrity', 'anti-corruption', 'accountability', 'procurement'],
    };

    const keywords = categoryKeywords[pattern.category] || [];
    const matchedKeywords = keywords.filter(kw => inputText.includes(kw));
    if (keywords.length > 0) {
      score += 0.4 * (matchedKeywords.length / Math.min(keywords.length, 3));
      factors += 0.4;
    }

    // Organisation type alignment
    const orgType = (params.organizationType || '').toLowerCase();
    if (
      (pattern.category === 'government-planning' && (orgType.includes('government') || orgType.includes('council') || orgType.includes('agency'))) ||
      (pattern.category === 'market-entry' && (orgType.includes('corporate') || orgType.includes('business') || orgType.includes('company'))) ||
      (pattern.category === 'export-strategy' && (orgType.includes('sme') || orgType.includes('business') || orgType.includes('manufacturer')))
    ) {
      score += 0.3;
    }
    factors += 0.3;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Get pattern-informed context for a specific formula.
   * Used by the formula suite to calibrate confidence.
   */
  static getFormulaContext(
    formulaId: string,
    assessment: PatternAssessment
  ): { confidenceAdjustment: number; annotation: string } {
    if (assessment.matchedPatterns.length === 0) {
      return { confidenceAdjustment: 0, annotation: 'No historical pattern match - standard confidence applies.' };
    }

    const topMatch = assessment.matchedPatterns[0];
    const boost = assessment.overallConfidenceBoost;

    const riskFormulas = ['PRI', 'CRI', 'SRA', 'RNI', 'IDV'];
    const operationalFormulas = ['CAP', 'AGI', 'ESI', 'ISI', 'OSI', 'TCO'];
    const strategicFormulas = ['SPI', 'RROI', 'SEAM', 'IVAS', 'SCF', 'BARNA', 'NVI', 'FRS', 'VCI', 'ATI'];

    let annotation: string;

    if (riskFormulas.includes(formulaId)) {
      annotation = `Risk assessment calibrated by ${topMatch.name} pattern (${topMatch.historicalDepth}yr history, ${topMatch.geographicBreadth} countries). Known risks: ${topMatch.knownRisks.slice(0, 2).join('; ')}.`;
    } else if (operationalFormulas.includes(formulaId)) {
      annotation = `Operational assessment informed by ${topMatch.name} pattern. Historical outcomes: ${topMatch.knownOutcomes.slice(0, 2).join('; ')}.`;
    } else if (strategicFormulas.includes(formulaId)) {
      annotation = `Strategic scoring benefits from ${topMatch.name} pattern match (strength: ${(topMatch.matchStrength * 100).toFixed(0)}%). Methodology: ${topMatch.methodology.substring(0, 120)}...`;
    } else {
      annotation = `Pattern context available: ${topMatch.name} (${topMatch.historicalDepth}yr depth).`;
    }

    return { confidenceAdjustment: boost, annotation };
  }

  /**
   * Generate a human-readable pattern briefing for the report.
   */
  static generateBriefing(assessment: PatternAssessment): string {
    if (assessment.matchedPatterns.length === 0) {
      return 'This input does not closely match established patterns in the knowledge base. Standard analytical methods applied with no historical confidence adjustment.';
    }

    const lines: string[] = [
      `**Pattern Intelligence Briefing**`,
      ``,
      `Reasoning stance: **${assessment.reasoningStance.toUpperCase()}** " ${assessment.stanceRationale}`,
      ``,
    ];

    if (assessment.knownElements.length > 0) {
      lines.push(`**Structurally Known Elements:**`);
      for (const el of assessment.knownElements) {
        lines.push(`- ${el}`);
      }
      lines.push('');
    }

    if (assessment.novelElements.length > 0) {
      lines.push(`**Novel Elements (standard analysis applied):**`);
      for (const el of assessment.novelElements) {
        lines.push(`- ${el}`);
      }
      lines.push('');
    }

    lines.push(`**Top Pattern Matches:**`);
    for (const match of assessment.matchedPatterns.slice(0, 3)) {
      lines.push(`- **${match.name}** (${match.historicalDepth}yr history, ${match.geographicBreadth} countries, match: ${(match.matchStrength * 100).toFixed(0)}%)`);
    }

    return lines.join('\n');
  }

  /**
   * Return the full pattern library for reference display.
   */
  static getPatternLibrarySummary(): Array<{
    id: string;
    name: string;
    category: PatternCategory;
    depth: number;
    breadth: number;
    sourceCount: number;
  }> {
    return PATTERN_LIBRARY.map(p => ({
      id: p.patternId,
      name: p.name,
      category: p.category,
      depth: p.historicalDepth,
      breadth: p.geographicBreadth,
      sourceCount: p.sources.length,
    }));
  }
}

