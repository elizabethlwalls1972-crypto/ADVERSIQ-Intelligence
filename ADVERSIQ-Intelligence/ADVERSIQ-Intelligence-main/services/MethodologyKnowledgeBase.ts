/**
 * 
 * METHODOLOGY KNOWLEDGE BASE
 * 
 *
 * The internal reference library. When the system encounters a question,
 * it checks this knowledge base BEFORE reaching for external sources.
 *
 * This is the "parent" knowledge " accumulated from decades of documented
 * practice. The system looks here first, reaches outward only when this
 * is insufficient.
 *
 * 
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MethodologyEntry {
  id: string;
  domain: string;
  principle: string;
  stableForYears: number;
  applicableCountries: number;
  description: string;
  keyInsights: string[];
  commonMistakes: string[];
  whatAlwaysWorks: string[];
  whatNeverWorks: string[];
  standardTimelines: Record<string, string>;
  standardCostRanges: Record<string, string>;
  governmentBehaviourPattern: string;
  investorBehaviourPattern: string;
}

export interface CountryIntelligence {
  country: string;
  region: string;
  investmentFramework: string;
  keyAgencies: string[];
  incentiveStructure: string;
  typicalTimeline: string;
  knownChallenges: string[];
  whatWorksHere: string[];
  historicalContext: string;
}

export interface SectorIntelligence {
  sector: string;
  globalTrend: string;
  emergingMarketContext: string;
  typicalInvestmentRange: string;
  standardStructure: string;
  regulatoryPattern: string;
  knownRisks: string[];
  successFactors: string[];
}

// ============================================================================
// METHODOLOGY KNOWLEDGE BASE
// ============================================================================

export class MethodologyKnowledgeBase {

  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  // CORE METHODOLOGY ENTRIES
  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  private static METHODOLOGIES: MethodologyEntry[] = [
    {
      id: 'METH-001',
      domain: 'Investment Attraction',
      principle: 'Incentive packages follow universal structure: tax holidays, import duty exemptions, simplified registration, and infrastructure support.',
      stableForYears: 58,
      applicableCountries: 140,
      description: 'Every country that actively seeks foreign investment uses the same structural toolkit. The specific rates vary; the structure does not.',
      keyInsights: [
        'Tax holiday duration is the primary negotiation variable (typically 4-8 years)',
        'Import duty exemptions on capital equipment are near-universal',
        'Tiered incentives (higher for less-developed areas) are standard practice',
        'Performance-based incentives (employment targets, export ratios) are gaining ground',
        'Incentive regimes are reviewed every 5-10 years but structural changes are rare',
      ],
      commonMistakes: [
        'Assuming incentives are unique to one country when they are standard globally',
        'Overvaluing tax holidays without considering effective tax rate post-holiday',
        'Ignoring regulatory compliance costs that offset incentive value',
        'Failing to negotiate beyond the published incentive schedule',
      ],
      whatAlwaysWorks: [
        'Requesting incentive comparison across competing locations',
        'Negotiating timeline extensions for significant employment creation',
        'Structuring phased investment to maximise incentive utilisation',
        'Engaging with investment promotion agency early in process',
      ],
      whatNeverWorks: [
        'Assuming published incentives apply automatically without application',
        'Expecting incentives alone to compensate for poor infrastructure',
        'Treating incentive regimes as permanent - they all have sunset provisions',
        'Ignoring local content requirements attached to incentive packages',
      ],
      standardTimelines: {
        'Application to approval': '2-6 months',
        'Approval to first benefit realisation': '3-12 months',
        'Total incentive period': '4-8 years typical, up to 15 for strategic projects',
        'Renewal/review cycle': '5-10 years',
      },
      standardCostRanges: {
        'Application and registration': '$5,000 - $50,000',
        'Compliance and reporting': '$10,000 - $30,000/year',
        'Professional advisory (legal/tax)': '$20,000 - $100,000',
      },
      governmentBehaviourPattern: 'Governments will always start with the standard published package. Everything beyond that requires negotiation leverage - typically employment commitments, technology transfer, or strategic sector alignment.',
      investorBehaviourPattern: 'Investors compare 3-5 competing locations and use incentive packages as a tiebreaker rather than a primary selection criterion. Infrastructure and labour availability dominate the decision.',
    },
    {
      id: 'METH-002',
      domain: 'Regional Development Planning',
      principle: 'Medium-term plans with sectoral breakdown, regional allocation, and infrastructure prioritisation. The framework has not changed since the 1960s.',
      stableForYears: 63,
      applicableCountries: 120,
      description: 'Every developing and middle-income country produces medium-term development plans that follow the same structure. The names and administration labels change; the methodology persists.',
      keyInsights: [
        'Plan cycles are 5-6 years, tied to political terms',
        'Sectoral categories are always: agriculture, industry, services, infrastructure',
        'Decentralisation is always stated as a goal; centralisation is the persistent reality',
        'Growth centre designation is universal - growth pole theory from the 1950s',
        'Regional disparity measurements use the same GRDP-per-capita methodology globally',
      ],
      commonMistakes: [
        'Treating each new plan as a genuine departure from the previous one',
        'Assuming stated decentralisation goals will materialise in budget allocations',
        'Overlooking that infrastructure priorities follow political, not purely economic, logic',
        'Ignoring subnational development plans which often carry more operational relevance',
      ],
      whatAlwaysWorks: [
        'Aligning project proposals with the current administration plan language',
        'Engaging with regional development councils, not just national agencies',
        'Referencing specific plan targets and KPIs in project documentation',
        'Building on existing infrastructure corridors rather than proposing new ones',
      ],
      whatNeverWorks: [
        'Expecting a new administration to continue the previous one\'s specific projects',
        'Treating national plan targets as guaranteed budget commitments',
        'Assuming regional offices have the same authority as national offices',
        'Proposing projects that contradict the current plan priorities, regardless of merit',
      ],
      standardTimelines: {
        'Plan preparation': '12-18 months before term start',
        'Plan validity': '5-6 years',
        'Mid-term review': 'Year 3',
        'Project pipeline inclusion': '6-12 months lead time required',
      },
      standardCostRanges: {
        'Feasibility study': '$50,000 - $500,000',
        'Environmental impact assessment': '$30,000 - $200,000',
        'Project preparation facility': '$100,000 - $2M',
      },
      governmentBehaviourPattern: 'New administrations rebrand predecessor programmes but rarely abandon the underlying projects or methodologies. Alignment with current branding is essential for approval.',
      investorBehaviourPattern: 'Investors who reference the development plan in their proposals get faster approvals. The plan is the vocabulary of government decision-making.',
    },
    {
      id: 'METH-003',
      domain: 'Due Diligence and Feasibility',
      principle: 'The components of a feasibility study have been standardised since the UNIDO methodology of the 1970s.',
      stableForYears: 50,
      applicableCountries: 150,
      description: 'Market analysis, technical feasibility, financial projections, risk assessment, environmental impact, social impact, institutional analysis. This structure is universal.',
      keyInsights: [
        'UNIDO feasibility study format is the global standard, still',
        'World Bank and ADB require the same components with minor variations',
        'Private sector due diligence follows the same structure under different labels',
        'Financial projections always require base, optimistic, and pessimistic scenarios',
        'Environmental and social impact assessment requirements are converging globally',
      ],
      commonMistakes: [
        'Inventing a new feasibility structure when the standard is established and expected',
        'Underestimating the time and cost of a proper feasibility study',
        'Treating financial projections as single-point estimates rather than ranges',
        'Omitting institutional/governance analysis - the section most likely to kill a project',
      ],
      whatAlwaysWorks: [
        'Following the UNIDO structure - reviewers expect it',
        'Including sensitivity analysis showing what breaks the project',
        'Producing executive summaries that stand alone as decision documents',
        'Getting independent verification of key market assumptions',
      ],
      whatNeverWorks: [
        'Submitting feasibility studies without financial projections',
        'Using only optimistic scenarios',
        'Omitting risk assessment or treating risks as unlikely',
        'Producing feasibility studies longer than 100 pages without clear executive summary',
      ],
      standardTimelines: {
        'Pre-feasibility': '4-8 weeks',
        'Full feasibility': '3-6 months',
        'Environmental assessment': '4-12 months',
        'Review and approval': '2-6 months after submission',
      },
      standardCostRanges: {
        'Pre-feasibility study': '$20,000 - $80,000',
        'Full feasibility study': '$100,000 - $500,000',
        'Environmental impact assessment': '$50,000 - $300,000',
        'Independent verification': '$30,000 - $100,000',
      },
      governmentBehaviourPattern: 'Government reviewers check feasibility studies against the expected format. Missing sections trigger immediate rejection or delay, regardless of project quality.',
      investorBehaviourPattern: 'Institutional investors will not proceed without a feasibility study that meets international standards. The format matters as much as the content.',
    },
    {
      id: 'METH-004',
      domain: 'Public-Private Partnership',
      principle: 'PPP structures follow a universal lifecycle: identification, appraisal, procurement, contract management, and monitoring. The risk allocation matrix is the core document.',
      stableForYears: 45,
      applicableCountries: 130,
      description: 'PPPs across infrastructure, social services, and utility sectors follow the same structural framework regardless of jurisdiction. The risk allocation matrix determines project viability.',
      keyInsights: [
        'Risk allocation follows the principle: allocate to the party best able to manage',
        'Demand risk is the most contested allocation - government guarantee or private risk',
        'Contract tenor 20-30 years with termination provisions is standard',
        'Minimum Revenue Guarantee (MRG) or Viability Gap Funding (VGF) for social infrastructure',
        'Unsolicited proposals represent 30-40% of PPP pipeline in emerging markets',
      ],
      commonMistakes: ['Inadequate demand forecasting (optimism bias is universal)', 'Ignoring renegotiation probability (60-70% of PPPs are renegotiated)', 'Insufficient fiscal commitment analysis', 'Treating PPP as off-balance-sheet financing when it creates contingent liabilities'],
      whatAlwaysWorks: ['International competitive bidding with pre-qualification', 'Independent demand study by credible firm', 'Transaction advisor with regional PPP track record', 'Stakeholder consultation before procurement launch'],
      whatNeverWorks: ['Direct negotiation without competitive tension', 'Inadequate risk allocation documentation', 'Expecting PPP to substitute for weak institutional capacity', 'Treating PPP as a way to avoid public expenditure rather than optimise it'],
      standardTimelines: { 'Project preparation': '12-24 months', 'Procurement': '6-18 months', 'Financial close': '3-6 months after preferred bidder', 'Construction': '2-5 years', 'Operations': '15-30 years' },
      standardCostRanges: { 'Transaction advisory': '$500K - $5M', 'Legal advisory': '$300K - $3M', 'Technical studies': '$200K - $2M', 'Bid preparation (private sector)': '$1M - $10M' },
      governmentBehaviourPattern: 'Governments announce PPP programmes ambitiously but pipeline conversion rates are typically 10-25%. Institutional readiness (PPP unit, legal framework, fiscal space) determines success rate.',
      investorBehaviourPattern: 'International PPP investors require sovereign credit rating B+ or above, established PPP legal framework, and demonstrated payment track record on previous contracts.',
    },
    {
      id: 'METH-005',
      domain: 'Export Development and Market Entry',
      principle: 'Market entry strategies for emerging market companies follow a ladder: indirect export - direct export - licensing/franchise - JV - wholly-owned subsidiary.',
      stableForYears: 55,
      applicableCountries: 160,
      description: 'The internationalisation pathway has been documented since the Uppsala model (1977). Companies from every country follow the same incremental commitment path.',
      keyInsights: [
        'The psychic distance effect is real - companies expand first to culturally similar markets',
        'Export readiness assessment is a prerequisite; 60% of first-time exporters fail within 3 years',
        'Trade shows and trade missions remain the most effective B2B market entry channels',
        'Free trade agreements reduce tariff barriers but non-tariff barriers persist',
        'E-commerce platforms (Alibaba, Amazon B2B) have compressed the market entry timeline',
      ],
      commonMistakes: ['Entering too many markets simultaneously', 'Underestimating certification and standards compliance costs', 'Relying on a single in-market partner without alternatives', 'Failing to adapt product/service to local market preferences'],
      whatAlwaysWorks: ['Starting with one market and building proof of concept', 'Engaging trade promotion agencies in both origin and destination countries', 'Securing key certifications before market entry', 'Building relationships through trade missions and industry events'],
      whatNeverWorks: ['Mass market entry without market intelligence', 'Expecting domestic pricing to work in export markets', 'Ignoring intellectual property protection in target markets', 'Treating export as surplus disposal rather than strategic market development'],
      standardTimelines: { 'Export readiness assessment': '1-3 months', 'Market research and selection': '2-4 months', 'Regulatory and certification': '3-12 months', 'First shipment to sustained orders': '6-18 months' },
      standardCostRanges: { 'Export readiness programme': '$5K - $30K', 'Market research': '$10K - $50K', 'Product certification': '$5K - $100K', 'Trade mission participation': '$3K - $15K per event' },
      governmentBehaviourPattern: 'Trade promotion agencies focus on volume metrics (number of exporters assisted) rather than survival rates. The most effective programmes combine financial support with mentoring.',
      investorBehaviourPattern: 'Companies that invest in proper market research before entry have 3x higher survival rates than those that enter opportunistically.',
    },
    {
      id: 'METH-006',
      domain: 'Special Economic Zone Design',
      principle: 'SEZ success depends on five pillars: strategic location, institutional autonomy, competitive incentives, quality infrastructure, and proactive investment promotion. This has been stable since the 1960s.',
      stableForYears: 63,
      applicableCountries: 145,
      description: 'From Shenzhen to Dubai to PEZA, successful SEZs share the same design principles. Failure is almost always traceable to violation of these principles.',
      keyInsights: [
        'Location within 50km of port/airport with road connectivity is non-negotiable for manufacturing zones',
        'Institutional autonomy (zone authority with streamlined approvals) is the #1 success factor',
        'First-mover anchor tenant strategy reduces vacancy risk by 60%',
        'Cluster development (related industries co-located) produces 25-40% higher tenant survival rates',
        'Zone generation evolution: 1st gen (trade), 2nd gen (manufacturing), 3rd gen (mixed-use innovation), 4th gen (smart/green)',
      ],
      commonMistakes: ['Building infrastructure before tenant demand analysis', 'Designing incentives without fiscal impact assessment', 'Placing zones in politically preferred but economically suboptimal locations', 'Duplicating zones without specialisation differentiation'],
      whatAlwaysWorks: ['Anchor tenant strategy - secure 1-2 large tenants before marketing', 'One-stop-shop with real authority (not just a window)', 'Infrastructure built to international standards from day one', 'Active IPA with dedicated zone promotion team'],
      whatNeverWorks: ['Build it and they will come approach', 'Zones without reliable power, water, and telecoms', 'Bureaucratic duplication within the zone', 'Zones in remote locations without transport links'],
      standardTimelines: { 'Feasibility and design': '12-18 months', 'Legal framework establishment': '6-12 months', 'Infrastructure construction (Phase 1)': '18-36 months', 'Anchor tenant attraction': 'concurrent with construction', 'Break-even occupancy': '5-8 years' },
      standardCostRanges: { 'Pre-development studies': '$500K - $2M', 'Infrastructure (per hectare)': '$500K - $3M', 'Zone management setup': '$1M - $5M annual', 'Investor promotion': '$500K - $2M annual' },
      governmentBehaviourPattern: 'Governments prefer to announce zone creation over the politically harder work of institutional reform. The announcement-to-operation ratio globally is approximately 5:1.',
      investorBehaviourPattern: 'Tenants evaluate zones on three criteria: infrastructure quality, regulatory simplicity, and peer tenant quality (cluster effect). Incentives are a distant fourth.',
    },
    {
      id: 'METH-007',
      domain: 'Development Finance and Impact Investment',
      principle: 'Development finance follows a standard project cycle: identification - preparation - appraisal - negotiation - board approval - implementation - evaluation.',
      stableForYears: 50,
      applicableCountries: 140,
      description: 'Whether World Bank, ADB, AfDB, IFC, or bilateral donors - the project cycle is identical. The acronyms differ; the methodology does not.',
      keyInsights: [
        'The project cycle is typically 6-8 years from identification to completion evaluation',
        'Preparation phase consumes 60% of the effort; implementation follows momentum',
        'Environmental and social safeguards are the primary cause of delay (50% of cases)',
        'Co-financing multiplier effect: $1 DFI -> $3-5 total project funding',
        'Results frameworks (logical framework approach) are universal - output -> outcome -> impact',
      ],
      commonMistakes: ['Underestimating DFI procurement timelines (18-24 months is normal)', 'Assuming DFI funding means DFI implementation - government ownership is required', 'Inadequate safeguards preparation', 'Treating monitoring and evaluation as an afterthought'],
      whatAlwaysWorks: ['Country strategy alignment - projects must fit DFI country programme', 'Government ownership and commitment letters early', 'Experienced project implementation unit with DFI experience', 'Realistic disbursement schedules with contingencies'],
      whatNeverWorks: ['Rushing DFI processes - they have institutional calendars', 'Projects without government counterpart funding commitment', 'Proposals that ignore DFI safeguard requirements', 'Standalone projects outside the country strategy'],
      standardTimelines: { 'Concept to approval': '18-36 months', 'Approval to first disbursement': '6-12 months', 'Implementation': '4-7 years', 'Completion evaluation': '12-18 months post-close' },
      standardCostRanges: { 'Project preparation (DFI-funded)': '$500K - $3M', 'Implementation support': '5-8% of project cost', 'Mid-term review': '$100K - $500K', 'Impact evaluation': '$200K - $1M' },
      governmentBehaviourPattern: 'Governments treat DFI funds as external resources requiring less internal accountability. Successful projects always have strong government ownership and counterpart commitment.',
      investorBehaviourPattern: 'Private sector co-investors use DFI participation as a risk mitigation signal. DFI involvement reduces perceived country risk by 1-2 notches.',
    },
    {
      id: 'METH-008',
      domain: 'Technology Transfer and Industrial Upgrading',
      principle: 'Technology transfer follows a 4-stage pathway: import > absorb > adapt > innovate. This has been the documented pattern since Japan in the 1950s.',
      stableForYears: 65,
      applicableCountries: 130,
      description: 'Korea, Taiwan, China, Vietnam - all followed the same technology transfer pathway. Time-to-innovation varies but the sequence does not.',
      keyInsights: [
        'Absorption capacity (human capital, institutional readiness) determines transfer speed',
        'Licensing precedes manufacturing; manufacturing precedes innovation',
        'Diaspora networks accelerate transfer by 3-5 years in documented cases',
        'IPR framework maturity correlates with 2nd-stage (adapt) success',
        'Government R&D co-investment triggers private sector R&D within 3-7 years',
      ],
      commonMistakes: ['Attempting to leapfrog stages (jumping from import to innovate)', 'Expecting technology transfer without human capital investment', 'Treating IP protection as a barrier rather than an enabler', 'Ignoring the absorptive capacity constraints of local institutions'],
      whatAlwaysWorks: ['Structured training programmes with technology source companies', 'University-industry partnerships for applied R&D', 'Reverse diaspora programmes for technology returnees', 'Government R&D co-investment matching private sector commitment'],
      whatNeverWorks: ['Mandating technology transfer without absorptive capacity', 'Expecting multinational IP licensing without IPR enforcement', 'Innovation programmes without baseline manufacturing capability', 'Technology parks without surrounding industrial ecosystem'],
      standardTimelines: { 'Import stage': '3-5 years', 'Absorption stage': '5-10 years', 'Adaptation stage': '5-15 years', 'Innovation stage': '10-25 years', 'Full cycle': '25-50 years' },
      standardCostRanges: { 'Technology licensing': '$100K - $10M', 'Training programmes': '$50K - $500K per cohort', 'R&D centre establishment': '$5M - $50M', 'IP registration and protection': '$20K - $200K per patent family' },
      governmentBehaviourPattern: 'Governments routinely overestimate how quickly technology transfer produces innovation. Realistic planning requires 15-25 year horizons for meaningful domestic innovation capability.',
      investorBehaviourPattern: 'Technology companies will transfer operational technology but guard core IP. Partnership structures that align incentives (shared revenue from adaptations) produce better outcomes than mandated transfer.',
    },
    {
      id: 'METH-009',
      domain: 'Climate Finance and Green Transition',
      principle: 'Climate finance mobilisation follows: NDC commitment > sector transition plan > project pipeline > blended finance > implementation > MRV (Measurement, Reporting, Verification).',
      stableForYears: 15,
      applicableCountries: 195,
      description: 'Post-Paris Agreement, climate finance has created a new but structured methodology. GCF, GEF, CTF, and bilateral climate funds all require the same project preparation framework.',
      keyInsights: [
        'GCF board meets 3x/year - project cycle is 18-36 months minimum',
        'Accredited Entity model means most countries access GCF through intermediaries',
        'Blended finance (concessional + commercial) is the dominant model',
        'Climate taxonomy alignment is becoming a precondition for all DFI funding',
        'Just Transition framing (protecting workers and communities) is now mandatory',
      ],
      commonMistakes: ['Treating climate finance as free money - it has strict MRV requirements', 'Ignoring adaptation - 50% of climate finance should go to adaptation', 'Underestimating GCF safeguard requirements', 'Failing to demonstrate additionality (would not happen without climate finance)'],
      whatAlwaysWorks: ['NDA engagement from concept stage', 'Project design aligned with NDC priority sectors', 'Blended finance structure showing private sector leverage', 'Robust MRV framework using international standards'],
      whatNeverWorks: ['Applications without NDA endorsement', 'Projects without clear climate rationale (development co-benefits are not enough)', 'Proposals without private sector co-financing for mitigation', 'Projects in sectors not identified in the countrys NDC'],
      standardTimelines: { 'Concept note to funding proposal': '12-24 months', 'GCF board review': '3-6 months', 'Effectiveness to first disbursement': '6-12 months', 'Project implementation': '5-10 years' },
      standardCostRanges: { 'Readiness programme': '$300K - $1M', 'Project preparation': '$500K - $3M', 'MRV system setup': '$200K - $1M', 'Independent evaluation': '$100K - $500K' },
      governmentBehaviourPattern: 'NDAs (National Designated Authorities) vary dramatically in capacity. Active NDAs with dedicated climate finance units process 5x more projects than passive ones.',
      investorBehaviourPattern: 'Climate-labelled investments command 10-30bp pricing advantage. Private sector enters when blended finance reduces risk to commercial bankability levels.',
    },
    {
      id: 'METH-010',
      domain: 'Anti-Corruption and Governance',
      principle: 'Anti-corruption compliance requires: a) preventive framework (policies, training, due diligence), b) detective framework (monitoring, reporting, auditing), c) corrective framework (investigation, sanctions, remediation).',
      stableForYears: 30,
      applicableCountries: 195,
      description: 'Post-FCPA/UK Bribery Act, anti-corruption compliance has globalised. The compliance programme structure is identical across jurisdictions. Extra-territorial enforcement means every international transaction must comply.',
      keyInsights: [
        'Adequate procedures defence (UK Bribery Act) is the global compliance standard',
        'Third-party due diligence is where 70% of corruption exposure occurs',
        'Facilitation payments are the most politically contentious area - banned under UK law, permitted under US law',
        'Compliance programme effectiveness is measured by detection rate, not zero-incident claims',
        'Whistleblower mechanisms that actually protect whistleblowers are the strongest deterrent',
      ],
      commonMistakes: ['Zero-tolerance policies without implementation mechanisms', 'Due diligence limited to counterparty checks without ongoing monitoring', 'Training programmes that are tick-box exercises', 'Assuming compliance in one jurisdiction satisfies all'],
      whatAlwaysWorks: ['Risk-based approach: focus compliance resources on highest-risk transactions', 'Senior management tone from the top - visible commitment', 'Confidential reporting channels with non-retaliation guarantees', 'Regular third-party compliance audits'],
      whatNeverWorks: ['Paper policies without enforcement', 'Relying on local law compliance alone when international law applies extra-territorially', 'Ignoring facilitation payment exposure', 'Treating compliance as a legal department function rather than organisational culture'],
      standardTimelines: { 'Compliance programme design': '3-6 months', 'Implementation and training': '6-12 months', 'First compliance audit': '12 months after launch', 'Maturity (embedded culture)': '3-5 years' },
      standardCostRanges: { 'Compliance programme design': '$50K - $500K', 'Annual compliance management': '$100K - $1M', 'Third-party due diligence (per transaction)': '$5K - $50K', 'Compliance audit': '$30K - $200K' },
      governmentBehaviourPattern: 'Anti-corruption enforcement follows political cycles. Agencies are most active in the first 2 years of reform-oriented administrations. Structural enforcement requires independent, adequately funded institutions.',
      investorBehaviourPattern: 'International investors increasingly use corruption risk as a no-go criterion rather than a risk to manage. CPI below 30 triggers enhanced due diligence; below 20 triggers no-go for many institutional investors.',
    },
  ];

  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  // COUNTRY INTELLIGENCE PROFILES
  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  private static COUNTRIES: CountryIntelligence[] = [
    {
      country: 'Philippines',
      region: 'Southeast Asia',
      investmentFramework: 'CREATE Act (2021), BOI Strategic Investment Priorities Plan, PEZA for zone-based investments',
      keyAgencies: ['Board of Investments (BOI)', 'PEZA', 'NEDA', 'BSP', 'SEC'],
      incentiveStructure: '4-7 year income tax holiday for registered projects; enhanced deductions; customs duty exemptions for capital equipment',
      typicalTimeline: 'BOI registration: 2-4 months. PEZA registration: 3-6 months. Full operational setup: 6-18 months.',
      knownChallenges: [
        'Infrastructure quality outside Metro Manila and CALABARZON',
        'Regulatory complexity across national, regional, and LGU levels',
        'Foreign ownership restrictions in certain sectors (60/40 rule)',
        'Power costs among highest in ASEAN',
      ],
      whatWorksHere: [
        'IT-BPM sector - Philippines is #2 globally',
        'Engaging with LGU leadership directly for local permits',
        'Aligning with PDP (Philippine Development Plan) priorities for faster approval',
        'Export-oriented manufacturing in PEZA zones for simplified customs',
      ],
      historicalContext: 'Regional development planning since 1963. 12 administrative regions (1972), expanded to 17. Growth centre strategy has consistently favoured NCR-adjacent regions. IT-BPM emerged 2000s as genuine regional employment driver.',
    },
    {
      country: 'Vietnam',
      region: 'Southeast Asia',
      investmentFramework: 'Investment Law (2020), Special investment incentives for priority sectors and locations',
      keyAgencies: ['Ministry of Planning and Investment', 'Provincial People\'s Committees', 'Agency for Enterprise Development'],
      incentiveStructure: '2-4 year tax exemption, 50% reduction for 4-9 following years; land rental exemptions in industrial zones',
      typicalTimeline: 'Investment registration certificate: 15-45 days (fast by ASEAN standards). Full setup: 3-12 months.',
      knownChallenges: [
        'Land use rights system (no private land ownership)',
        'Labour cost escalation in established zones (Ho Chi Minh City, Hanoi)',
        'Intellectual property enforcement improving but inconsistent',
        'Dual approval system (national + provincial) for larger investments',
      ],
      whatWorksHere: [
        'Manufacturing for export - electronics, textiles, food processing',
        'Locating in second-tier provinces for better incentives and lower costs',
        'Samsung, Intel supply chain proximity for electronics sector',
        'Infrastructure improvement trajectory - rapid multi-year improvement',
      ],
      historicalContext: 'Doi Moi economic reforms (1986). Rapid industrialisation model. Growth concentrated in Hanoi-Hai Phong and Ho Chi Minh City corridors. Second-tier cities emerging as competitive alternatives.',
    },
    {
      country: 'Indonesia',
      region: 'Southeast Asia',
      investmentFramework: 'Omnibus Law on Job Creation (2020), Positive Investment List replacing Negative Investment List',
      keyAgencies: ['BKPM (Investment Coordinating Board)', 'Ministry of Investment', 'Special Economic Zone Councils'],
      incentiveStructure: 'Tax holiday 5-20 years for pioneer industries; tax allowance (30% of investment deducted over 6 years); SEZ fiscal incentives',
      typicalTimeline: 'OSS (Online Single Submission) registration: 1-3 months. Full operational: 6-24 months depending on sector and location.',
      knownChallenges: [
        'Decentralisation has created regulatory fragmentation across 34 provinces',
        'Logistics costs high due to archipelago geography',
        'Labour regulations vary significantly by province',
        'Nickel downstreaming policy creating export restrictions',
      ],
      whatWorksHere: [
        'Resource-based processing (nickel, palm oil, rubber)',
        'Digital economy - Gojek, Tokopedia demonstrate market size',
        'Engaging with provincial governments for operational permits',
        'Java-centric initially, then expanding to resource-rich outer islands',
      ],
      historicalContext: 'Guided economy (1966-1998). Reformasi and decentralisation post-1998. Omnibus Law (2020) represents most significant regulatory reform in decades. Infrastructure push under current administration.',
    },
    {
      country: 'Australia',
      region: 'Oceania',
      investmentFramework: 'FIRB (Foreign Investment Review Board) screening, state-level investment attraction programmes',
      keyAgencies: ['Austrade', 'FIRB', 'State Investment Agencies (Invest NSW, Invest Victoria, etc.)'],
      incentiveStructure: 'Limited federal tax incentives; state-level payroll tax reductions, land deals, infrastructure co-investment; R&D tax incentive (43.5% refundable offset)',
      typicalTimeline: 'FIRB approval: 30-90 days. State-level negotiation: 2-6 months. Operational setup: 3-12 months.',
      knownChallenges: [
        'High labour costs relative to ASEAN',
        'Small domestic market (26M population)',
        'Regional areas face workforce attraction challenges',
        'Regulatory compliance standards high; compliance costs significant for international entrants',
      ],
      whatWorksHere: [
        'Regional Australia has genuine opportunity gaps and willing local government',
        'R&D tax incentive is globally competitive for innovation-oriented investments',
        'Critical minerals processing - government actively seeking investment',
        'Agricultural technology and food processing for export to Asia',
      ],
      historicalContext: 'Regional development has been a persistent challenge. Population concentrated in 5 coastal capitals. Regional Development Australia network provides local coordination. Skills shortage in regional areas is the primary constraint.',
    },
    {
      country: 'New Zealand',
      region: 'Oceania',
      investmentFramework: 'Overseas Investment Act (2005, amended 2021), Callaghan Innovation grants, Regional Growth Fund',
      keyAgencies: ['NZTE', 'Callaghan Innovation', 'Regional Economic Development agencies'],
      incentiveStructure: 'Limited tax incentives; R&D tax credit (15%); Provincial Growth Fund for regional projects; co-investment through NZGCP',
      typicalTimeline: 'OIO consent (if required): 2-6 months. Setup: 2-8 months.',
      knownChallenges: [
        'Very small domestic market (5.1M population)',
        'Geographic isolation adds logistics cost',
        'Overseas investment screening for sensitive land and significant business assets',
        'Skilled labour shortages in technical and specialist roles',
      ],
      whatWorksHere: [
        'Agricultural technology and premium food/beverage',
        'Renewable energy - high percentage of renewable electricity',
        'Regional councils actively seeking industry diversification',
        'Strong intellectual property protection and rule of law',
      ],
      historicalContext: 'Economic reforms from 1984 onwards. Regional economic development via regional councils and economic development agencies. Tourism-dependent regions diversifying post-COVID.',
    },
    // â"€â"€ SUB-SAHARAN AFRICA â"€â"€
    {
      country: 'Kenya',
      region: 'East Africa',
      investmentFramework: 'Kenya Investment Authority mandate; Vision 2030; SEZ Act 2015; Bottom of the Pyramid programmes',
      keyAgencies: ['KenInvest', 'EPZA', 'Kenya SEZ Authority', 'NEMA'],
      incentiveStructure: 'SEZ: 10% CIT first 10yr then 15%; EPZ: 10yr tax holiday; investment deductions; customs duty exemptions on capital goods',
      typicalTimeline: 'Business registration: 3-5 days online. KenInvest facilitation: 1-3 months. SEZ/EPZ setup: 3-6 months.',
      knownChallenges: ['Power reliability outside Nairobi', 'Corruption index remains challenging', 'Land ownership documentation issues', 'Regional security concerns in border areas'],
      whatWorksHere: ['Mobile money ecosystem (M-Pesa) for financial inclusion', 'Technology sector (Silicon Savannah narrative)', 'Agricultural processing and floriculture (worlds #3 cut flower exporter)', 'Regional HQ for East African operations'],
      historicalContext: 'Harambee period (1963-78). Structural adjustment (1980s-90s). Vision 2030 industrial transformation agenda. Significant infrastructure investment (SGR, Lamu Port). Devolution since 2013 created 47 counties with own governance.',
    },
    {
      country: 'Rwanda',
      region: 'East Africa',
      investmentFramework: 'Investment Code Law 2021; Kigali International Financial Centre; Made in Rwanda policy',
      keyAgencies: ['Rwanda Development Board (RDB)'],
      incentiveStructure: 'CIT 0-15% for priority sectors; 7yr+ tax holidays for strategic investments; IP incentives; innovation hub benefits',
      typicalTimeline: 'Business registration: 6 hours (online). RDB facilitation: 1-4 weeks. Full operational: 1-3 months.',
      knownChallenges: ['Small domestic market (14M population)', 'Landlocked - logistics costs via Mombasa or Dar es Salaam', 'Limited local supply chain depth', 'Regional geopolitical dynamics (DRC border)'],
      whatWorksHere: ['ICT/innovation sector - government actively enabling', 'Tourism (gorilla trekking, conference tourism)', 'Business registration speed - one of fastest in Africa', 'Clean governance culture - CPI 54 (one of highest in Africa)'],
      historicalContext: 'Post-genocide reconstruction (1994+). Vision 2020 and Vision 2050 driving transformation. Kigali as conference hub. Smart Africa initiative driving digital transformation across continent. KIFC positioning as regional financial centre.',
    },
    {
      country: 'Nigeria',
      region: 'West Africa',
      investmentFramework: 'NIPC Act; Pioneer Status incentive; Free Zone framework; Startup Act 2022',
      keyAgencies: ['NIPC', 'BOI Nigeria', 'NEPZA', 'NITDA'],
      incentiveStructure: 'Pioneer Status: 3-5yr tax holiday; free zone customs exemptions; gas utilisation incentives; startup tax exemption (3yr)',
      typicalTimeline: 'CAC registration: 1-2 weeks. Pioneer status: 2-4 months. Free zone entry: 1-3 months.',
      knownChallenges: ['Foreign exchange volatility and access', 'Power infrastructure deficit (average 4,000MW for 200M+ population)', 'Regulatory fragmentation across 36 states + FCT', 'Security concerns in northern and Niger Delta regions'],
      whatWorksHere: ['Technology sector (Africas largest startup ecosystem)', 'Consumer market size (200M+ population)', 'Oil & gas upstream and services', 'Financial services innovation (fintech)'],
      historicalContext: 'Oil boom (1970s). Structural adjustment (1980s-90s). Democratic governance since 1999. Fintech revolution (2010s). Africa largest economy by GDP. Significant diaspora investment channel. Startup ecosystem in Lagos reaching critical mass.',
    },
    {
      country: 'South Africa',
      region: 'Southern Africa',
      investmentFramework: 'Protection of Investment Act 2015; SEZ Act 2014; InvestSA; Industrial Policy Action Plan',
      keyAgencies: ['InvestSA', 'DTIC', 'IDC', 'SEZ operators', 'NEF'],
      incentiveStructure: 'SEZ reduced CIT (15% vs 27%); Section 12I tax allowance; IDZ customs incentives; BEE-linked procurement',
      typicalTimeline: 'Company registration: 1-2 weeks. BEE certification: 2-4 months. SEZ entry: 3-6 months.',
      knownChallenges: ['BEE compliance complexity', 'Load shedding (electricity supply instability)', 'Labour market rigidity and strike frequency', 'Crime and security costs'],
      whatWorksHere: ['Automotive manufacturing (BMW, Mercedes, Toyota production)', 'Mining services and beneficiation', 'Financial services hub for Africa', 'Renewable energy IPP programme (most successful competitive procurement in emerging markets)'],
      historicalContext: 'Post-apartheid economic transformation (1994+). Growth concentrated in Gauteng-KZN-Western Cape triangle. REIPP programme demonstrating world-class renewable energy procurement. Consistently Africas most diversified economy.',
    },
    {
      country: 'Ghana',
      region: 'West Africa',
      investmentFramework: 'GIPC Act 2013; Free Zones Act; 1D1F (One District One Factory) programme; AfCFTA Secretariat host',
      keyAgencies: ['GIPC', 'GFZA', 'Ghana Revenue Authority'],
      incentiveStructure: 'Free zones: 10yr tax holiday then 15% CIT; agro-processing: 0% for 5yr; general manufacturing: reduced CIT; tree crops: 10yr tax holiday',
      typicalTimeline: 'GIPC registration: 5-10 business days. Free zone: 1-3 months.',
      knownChallenges: ['Cedi depreciation', 'Fiscal pressures (IMF programme)', 'Minimum capital requirements for foreign investors ($200K-$500K)', 'Power tariff increases'],
      whatWorksHere: ['Cocoa processing and agribusiness', 'Oil & gas services (Jubilee field ecosystem)', 'AfCFTA pilot trading under African free trade agreement', 'Financial services (growing hub)'],
      historicalContext: 'First sub-Saharan country to gain independence (1957). Structural adjustment (1980s-90s). Oil discovery (2007) transformed fiscal outlook. Hosts AfCFTA Secretariat - pivotal role in African trade integration. Democratic governance since 1992 (longest unbroken in West Africa).',
    },
    {
      country: 'Ethiopia',
      region: 'East Africa',
      investmentFramework: 'Investment Proclamation 2020; Industrial Parks framework; Privatisation programme',
      keyAgencies: ['EIC (Ethiopian Investment Commission)', 'IPDC', 'Privatisation Advisory Council'],
      incentiveStructure: 'Industrial parks: up to 10yr tax holiday; customs duty exemptions; one-stop shop services; external loan guarantees',
      typicalTimeline: 'EIC: 1-2 months. Industrial park entry: 2-6 months. Full operational: 6-18 months.',
      knownChallenges: ['Foreign currency shortage', 'Logistics bottleneck (Djibouti port dependency)', 'Telecom monopoly (partial privatisation underway)', 'Political transition and regional security'],
      whatWorksHere: ['Textile and garment manufacturing (Hawassa, Bole Lemi parks)', 'Horticulture for export', 'Industrial parks with ready-built sheds', 'Large labour force at competitive cost'],
      historicalContext: 'Command economy until 1991. EPRDF development state model (1991-2019). Industrial park strategy modeled on Asian export-zones. Largest population in East Africa (120M+). Telecom privatisation (Safaricom entry) signals broader liberalisation. Conflict period (2020-22) disrupted but investment framework restructuring continues.',
    },
    {
      country: 'Morocco',
      region: 'North Africa',
      investmentFramework: 'Investment Charter 2023; CFC Casablanca; Industrial Acceleration Plan; automotive/aerospace ecosystems',
      keyAgencies: ['AMDIE', 'CFC Authority', 'Regional Investment Centers'],
      incentiveStructure: 'CFC: 0% CIT 5yr then 8.75%; industrial zones: 5yr holiday + reduced rate; export incentives; automotive ecosystem incentives',
      typicalTimeline: 'Company setup: 1-2 weeks. CFC: 2-4 weeks. Industrial zone entry: 1-3 months.',
      knownChallenges: ['French/Arabic language requirements for documentation', 'Labour market informality', 'Water scarcity in agricultural regions', 'Regional economic disparities'],
      whatWorksHere: ['Automotive manufacturing (Renault, PSA - Africa #1 auto producer)', 'Aerospace components (Bombardier, Safran)', 'Offshoring (CFC Casablanca for financial services)', 'Renewable energy (Noor Ouarzazate worlds largest concentrated solar plant)'],
      historicalContext: 'Hassan II industrial policy legacy. Mohamed VI economic modernisation. Automotive ecosystem breakthrough (2012+). Africa first high-speed rail. CFC positioning as gateway between Europe, Africa, and Middle East. Strategic geographic position.',
    },
    // â"€â"€ LATIN AMERICA & CARIBBEAN â"€â"€
    {
      country: 'Brazil',
      region: 'South America',
      investmentFramework: 'National Treatment principle; Manaus Free Trade Zone; PADIS; state-level incentive competition (guerra fiscal)',
      keyAgencies: ['ApexBrasil', 'BNDES', 'SUFRAMA', 'State Investment Agencies'],
      incentiveStructure: 'Manaus FTZ incentives (tax exemptions until 2073); SUDENE/SUDAM regional incentives; state ICMS tax competition; innovation tax breaks (Lei do Bem)',
      typicalTimeline: 'Company formation: 2-6 weeks (varies). State incentive negotiation: 3-12 months.',
      knownChallenges: ['Tax complexity (custo Brasil)', 'Labour law rigidity (CLT framework)', 'Logistics infrastructure gaps', 'Bureaucratic compliance costs'],
      whatWorksHere: ['Agribusiness - world #1 soybean, coffee, sugar, beef, orange juice exporter', 'Manaus FTZ for electronics assembly', 'Pre-salt oil & gas upstream', 'BNDES development financing as catalyst'],
      historicalContext: 'Import substitution (1930s-80s). Plano Real stabilisation (1994). Commodity supercycle (2004-11). Petrobras pre-salt development. Largest economy in Latin America and 8th globally. Strong regulatory institutions (CADE, CVM, IBAMA).',
    },
    {
      country: 'Colombia',
      region: 'South America',
      investmentFramework: 'Free Trade Zone regime; Mega-Investments; ProColombia; Orange Economy (creative industries)',
      keyAgencies: ['ProColombia', 'INNpulsa', 'Bancoldex'],
      incentiveStructure: 'FTZ: 20% CIT (vs 35%); mega-investments: 15yr legal stability; Orange Economy 7yr tax exemption; ZOMAC (conflict zone) incentives',
      typicalTimeline: 'Company setup: 1-2 weeks. FTZ: 2-4 months.',
      knownChallenges: ['Security concerns in some regions (greatly improved)', 'Infrastructure gaps (mountain geography)', 'Informal economy large (40%+)', 'Labour costs rising in major cities'],
      whatWorksHere: ['Technology sector (Medelln transformation)', 'Creative industries (Orange Economy)', 'Agricultural exports (coffee, flowers, avocados)', 'Nearshoring from US companies'],
      historicalContext: 'Peace process (2016 FARC agreement). OECD membership (2020). Demographic dividend window. Medelln as innovation city narrative. Pacific Alliance member with Chile, Peru, Mexico. Significant reduction in violence metrics over 20 years.',
    },
    {
      country: 'Costa Rica',
      region: 'Central America',
      investmentFramework: 'Free Zone Regime; CINDE investment promotion; Life Sciences and Medical Devices cluster',
      keyAgencies: ['CINDE', 'PROCOMER', 'COMEX'],
      incentiveStructure: 'Free zone: 100% income tax exemption 8yr then 50% for 4yr; duty-free imports; no restrictions on profit repatriation',
      typicalTimeline: 'Company setup: 1-2 weeks. Free zone: 1-3 months.',
      knownChallenges: ['Small domestic market (5.2M)', 'Rising cost competitiveness vs other CAFTA countries', 'Limited industrial land in Greater Metropolitan Area', 'Fiscal deficit pressures on incentive sustainability'],
      whatWorksHere: ['Medical devices manufacturing (#1 employer in free zones)', 'Shared services / BPO for North American market', 'Life sciences and precision manufacturing', 'Carbon neutrality positioning for ESG-aligned investors'],
      historicalContext: 'Intel investment (1997) - transformational FDI case study. Diversification from agriculture to high-value manufacturing. No military since 1948 - investment in education instead. Environmental leadership. OECD accession process.',
    },
    // â"€â"€ EASTERN EUROPE & CENTRAL ASIA â"€â"€
    {
      country: 'Poland',
      region: 'Central Europe',
      investmentFramework: 'Polish Investment Zone; EU structural funds; SEZ regime (nationwide since 2018)',
      keyAgencies: ['PAIH (Polish Investment and Trade Agency)', 'Regional authorities'],
      incentiveStructure: 'Polish Investment Zone: 10-15yr CIT exemption (25-70% QI cost); EU fund co-financing; R&D super-deduction (200%)',
      typicalTimeline: 'Company setup: 2-4 weeks. Investment Zone decision: 1-2 months.',
      knownChallenges: ['Skilled labour competition among investors', 'Wage escalation (8-12% annually in manufacturing)', 'Regulatory change pace', 'Political dynamics affecting judicial independence perception'],
      whatWorksHere: ['Automotive and EV battery manufacturing (Europe #1 battery production base)', 'Shared services and BPO (Krakw, WrocÅ‚aw, d)', 'IT development (strong STEM graduates)', 'Food processing for EU market'],
      historicalContext: 'Shock therapy (1990). EU accession (2004). Largest beneficiary of EU cohesion funds. Rapid industrialisation via FDI-led export manufacturing. 30+ consecutive years of GDP growth (only European country).',
    },
    {
      country: 'Kazakhstan',
      region: 'Central Asia',
      investmentFramework: 'Entrepreneurial Code; AIFC (Astana International Financial Centre); SEZ framework',
      keyAgencies: ['Kazakh Invest', 'AIFC Authority'],
      incentiveStructure: 'SEZ: CIT/property/land tax exemptions up to 25yr; customs duty exemptions; AIFC: independent common law jurisdiction within Kazakhstan',
      typicalTimeline: 'Company registration: 1-2 weeks. AIFC: 1-2 weeks. SEZ: 1-3 months.',
      knownChallenges: ['Dependence on oil revenue', 'Distance from global shipping routes', 'Continental climate extremes', 'Russian economic linkages and sanctions spillover'],
      whatWorksHere: ['Oil & gas upstream and midstream', 'Mining (uranium #1 globally, copper, gold)', 'AIFC as regional financial centre', 'Logistics hub on Belt and Road corridor'],
      historicalContext: 'Independence (1991). Oil-led growth model. New capital Astana/Nur-Sultan. AIFC modeled on DIFC. Belt and Road transit corridor positioning. Trans-Caspian International Transport Route (Middle Corridor) gaining importance.',
    },
    // â"€â"€ MIDDLE EAST â"€â"€
    {
      country: 'United Arab Emirates',
      region: 'Gulf',
      investmentFramework: 'Federal Decree-Law on Commercial Companies 2020; Free Zone frameworks; CIT introduction (9%, 2023)',
      keyAgencies: ['Ministry of Economy', 'ADIO (Abu Dhabi)', 'Dubai FDI', 'Free Zone Authorities (JAFZA, DIFC, ADGM, DMCC, etc.)'],
      incentiveStructure: 'Free zones: 50yr licence with 0/9% CIT on qualifying income; 0% PIT; 100% foreign ownership; no customs duties; repatriation freedom',
      typicalTimeline: 'Free zone company: 3-7 days. Onshore: 2-4 weeks.',
      knownChallenges: ['New CIT regime (2023) creating compliance costs', 'Visa-linked business models disrupted by recent reforms', 'Market saturation in some free zones', 'Geopolitical proximity risks'],
      whatWorksHere: ['Trading and re-export hub (Dubai: 80% of UAE non-oil trade)', 'Financial services (DIFC, ADGM)', 'Technology and innovation (Hub71, DTEC)', 'Tourism and hospitality'],
      historicalContext: 'Oil discovery (1960s). Federation (1971). Dubai diversification model (1990s+). EXPO 2020. 200+ free zones. Position as global connectivity hub. Economic diversification from oil to services, tourism, logistics, tech. CIT introduction in 2023 signals maturation of fiscal framework.',
    },
    {
      country: 'Saudi Arabia',
      region: 'Gulf',
      investmentFramework: 'Vision 2030; MISA licensing; NEOM; Red Sea Global; Giga-projects',
      keyAgencies: ['MISA', 'PIF (Public Investment Fund)', 'Royal Commission for Industrial Cities', 'NEOM Authority'],
      incentiveStructure: '0% PIT; reduced CIT for priority sectors; giga-project-specific incentives; industrial land at subsidised rates; Saudization credit incentives',
      typicalTimeline: 'MISA licence: 1-4 weeks. Operational: 2-6 months.',
      knownChallenges: ['Saudization quotas (Nitaqat) - local employment requirements', 'Social and cultural transformation pace', 'Mega-project execution risk (multiple giga-projects simultaneous)', 'Labour market competition for skilled nationals'],
      whatWorksHere: ['Mega-project supply chain and services (NEOM, The Line, Red Sea)', 'Entertainment and tourism sector (opening rapidly)', 'Renewable energy (ACWA Power - worlds largest green hydrogen)', 'Defence industrial localisation'],
      historicalContext: 'Oil-based economy since 1930s. Vision 2030 (2016) most ambitious transformation agenda globally. PIF as sovereign catalyst ($700B+ AUM). Massive infrastructure spending. Social reforms (entertainment, tourism, gender participation). IPO of Aramco. Giga-projects represent $1T+ planned investment.',
    },
    // â"€â"€ ADDITIONAL PACIFIC ISLANDS â"€â"€
    {
      country: 'Fiji',
      region: 'Pacific Islands',
      investmentFramework: 'Investment Fiji mandate; Film Tax Rebate; ICT incentives; Northern Development Programme',
      keyAgencies: ['Investment Fiji', 'Fiji Revenue & Customs Service'],
      incentiveStructure: 'Tax-free regions (northern/maritime); 47% film production rebate; duty concessions for priority sectors; 13yr tax exemptions for hotel development',
      typicalTimeline: 'Registration: 2-4 weeks. Foreign investment registration: 1-2 months.',
      knownChallenges: ['Small economy (900K population)', 'Climate vulnerability (cyclones, sea-level rise)', 'Geographic isolation and logistics costs', 'Brain drain to Australia/NZ'],
      whatWorksHere: ['Tourism (65% of GDP linkages)', 'Film and creative industry (rebate programme)', 'Bottled water (Fiji Water global brand)', 'Blue economy (sustainable fisheries, marine tourism)'],
      historicalContext: 'Independence (1970). Coup cycle (1987, 2000, 2006). Democratic elections resumed 2014. Pacific Islands Forum leadership role. Climate advocacy on global stage. Regional hub for Pacific Island development agencies.',
    },
  ];

  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  // SECTOR INTELLIGENCE
  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  private static SECTORS: SectorIntelligence[] = [
    {
      sector: 'Renewable Energy',
      globalTrend: 'Solar and wind costs have fallen 85-90% since 2010. Grid parity achieved in most markets. Battery storage emerging as next cost curve.',
      emergingMarketContext: 'Emerging markets represent 70% of projected clean energy investment growth. Rural electrification and industrial decarbonisation driving demand.',
      typicalInvestmentRange: '$5M-$500M per project depending on technology and capacity',
      standardStructure: 'Project finance with 70-80% debt, 20-30% equity. Power Purchase Agreement (PPA) as revenue anchor. EPC contractor for construction.',
      regulatoryPattern: 'Feed-in tariffs giving way to competitive auctions. Grid connection approval is the primary regulatory bottleneck.',
      knownRisks: [
        'Grid curtailment when generation exceeds transmission capacity',
        'PPA counterparty credit risk in emerging markets',
        'Land acquisition and community consent timelines',
        'Technology obsolescence risk for 20-25 year project life',
      ],
      successFactors: [
        'Secured grid connection agreement before financial close',
        'Creditworthy PPA offtaker (utility or corporate)',
        'Local community engagement from project initiation',
        'Proven EPC contractor with regional track record',
      ],
    },
    {
      sector: 'IT-BPM / Business Process Outsourcing',
      globalTrend: 'Global market $350B+. Shifting from cost arbitrage to value-added services. AI augmentation replacing low-end process work.',
      emergingMarketContext: 'Philippines (#2), India (#1), Vietnam (emerging). English proficiency, timezone compatibility, and cultural affinity are key differentiators.',
      typicalInvestmentRange: '$500K-$50M for seat capacity buildout',
      standardStructure: 'Build-own-operate or lease from developer. Revenue based on FTE pricing ($800-$2,500/month per agent depending on complexity).',
      regulatoryPattern: 'PEZA/BOI registration for tax incentives. Data privacy compliance (local + client jurisdiction). Labour law compliance for shift work.',
      knownRisks: [
        'Attrition rates 25-40% annually in mature markets',
        'Salary escalation 8-12% annually in competitive locations',
        'AI/automation displacement of routine process work',
        'Single-client concentration risk',
      ],
      successFactors: [
        'Location in tier-2 city with university pipeline',
        'Multi-client portfolio from year 2',
        'Investment in employee development and retention programmes',
        'Compliance infrastructure for data privacy from day one',
      ],
    },
    {
      sector: 'Agriculture and Agribusiness',
      globalTrend: 'Global food demand growing 1.5-2% annually. Precision agriculture, vertical farming, and supply chain traceability are transformation vectors.',
      emergingMarketContext: 'Smallholder fragmentation limits productivity. Aggregation, cold chain, and market access are the primary intervention points.',
      typicalInvestmentRange: '$100K-$50M depending on value chain position',
      standardStructure: 'Contract farming, cooperative aggregation, or direct operation. Revenue from commodity sales, processing margin, or export premium.',
      regulatoryPattern: 'Land use regulations, export permits, food safety certification (HACCP/GlobalGAP), phytosanitary requirements for export.',
      knownRisks: [
        'Weather and climate variability - the fundamental agricultural risk',
        'Price volatility for commodity crops',
        'Land tenure uncertainty in reform-affected areas',
        'Post-harvest loss (20-40% in emerging markets)',
      ],
      successFactors: [
        'Secured offtake agreement or market access before production',
        'Cold chain and logistics infrastructure investment',
        'Compliance with export destination food safety standards',
        'Smallholder integration with fair pricing mechanisms',
      ],
    },
    {
      sector: 'Mining and Extractives',
      globalTrend: 'Critical minerals supercycle driven by energy transition (lithium, cobalt, copper, nickel, rare earths). ESG requirements transforming operating standards.',
      emergingMarketContext: 'Resource-rich developing countries seeking downstream processing and value addition. Community benefit-sharing and environmental remediation are flashpoint issues.',
      typicalInvestmentRange: '$10M-$5B per project (exploration to production)',
      standardStructure: 'Exploration concession - bankable feasibility study - project finance (60-80% debt) - EPC contract - offtake agreements - operations - closure plan.',
      regulatoryPattern: 'Mining code with fiscal regime (royalties 2-10%), environmental bond, community development agreement, progressive taxation. Resource nationalism on the rise.',
      knownRisks: ['Commodity price volatility', 'Resource nationalism and fiscal regime changes', 'Community opposition and social licence loss', 'Environmental remediation liability', 'Artisanal mining conflict'],
      successFactors: ['Secured offtake agreements before development decision', 'Established community benefit-sharing agreement early', 'World-class EIA and environmental management plan', 'Diversified customer base for production', 'Closure plan and financial assurance from day one'],
    },
    {
      sector: 'Financial Technology (Fintech)',
      globalTrend: 'Global fintech market $310B+. Mobile money, digital banking, InsurTech, RegTech, embedded finance. Regulatory sandboxes proliferating.',
      emergingMarketContext: 'Financial inclusion gap (1.4B unbanked globally) is the primary demand driver. Mobile-first markets leapfrogging traditional banking. M-Pesa model replicated across Africa and Asia.',
      typicalInvestmentRange: '$100K-$50M for platform development and licensing',
      standardStructure: 'Seed/Series A - regulatory licence - market launch - scale - Series B/C - profitability - potential exit. Payment processing, lending, and InsurTech are the dominant verticals.',
      regulatoryPattern: 'Regulatory sandbox - limited licence - full licence. Central bank supervision. Anti-money laundering (AML/CFT) requirements. Data protection compliance.',
      knownRisks: ['Regulatory uncertainty - frameworks evolving rapidly', 'Customer acquisition cost in competitive markets', 'Cybersecurity and data breach liability', 'Correspondent banking relationships for cross-border'],
      successFactors: ['Early regulatory engagement (sandbox programme)', 'Partnership with established financial institution', 'Mobile-first UX design for target market', 'Robust KYC/AML infrastructure from inception'],
    },
    {
      sector: 'Healthcare and Life Sciences',
      globalTrend: 'Global healthcare market $12T+. Post-COVID infrastructure investment. Telehealth normalised. Pharmaceutical supply chain diversification from China/India.',
      emergingMarketContext: 'Universal health coverage push driving infrastructure demand. Local pharmaceutical manufacturing for supply security. Medical tourism growth in specialised markets.',
      typicalInvestmentRange: '$1M-$500M depending on sub-sector (clinic to manufacturing plant)',
      standardStructure: 'Regulatory approval - facility design - GMP certification - production/operations - WHO prequalification (for generics). Medical devices: CE marking or FDA equivalent.',
      regulatoryPattern: 'National drug authority approval cycle 12-36 months. GMP compliance mandatory. Price controls in many markets. Health technology assessment emerging.',
      knownRisks: ['Regulatory approval timeline uncertainty', 'Price controls and margin compression', 'Intellectual property enforcement gaps', 'Supply chain dependency for APIs and excipients'],
      successFactors: ['Regulatory strategy aligned with target market approvals', 'GMP compliance from design phase', 'WHO prequalification for procurement access', 'Local clinical trial data where required'],
    },
    {
      sector: 'Tourism and Hospitality',
      globalTrend: 'Global tourism $9.5T economic impact pre-COVID, recovered to 95% by 2024. Experiential and sustainable tourism growing at 2x rate of mass tourism.',
      emergingMarketContext: 'Tourism contributes 10-40% of GDP in many developing countries. Ecotourism, cultural tourism, and community-based tourism create local employment. Over-tourism in hotspots driving diversification.',
      typicalInvestmentRange: '$500K-$200M (eco-lodge to resort development)',
      standardStructure: 'Tourism master plan - market analysis - site development - operator selection - construction - soft opening - full operations. Management contract or franchise model for international brands.',
      regulatoryPattern: 'Tourism authority licensing. Environmental approval for coastal/protected area development. Cultural heritage protection requirements. Aviation bilateral agreements affect visitor flows.',
      knownRisks: ['Seasonality and demand volatility', 'Climate vulnerability (coastal, alpine)', 'Over-dependence on single source market', 'Infrastructure bottlenecks (airport capacity, roads)'],
      successFactors: ['Distinctive value proposition (not competing on price)', 'Year-round programming to reduce seasonality', 'Community integration and local employment', 'Digital marketing and direct booking capability'],
    },
    {
      sector: 'Digital Economy and E-Commerce',
      globalTrend: 'Global e-commerce $6.3T. Platform economies dominating. Gig economy regulation evolving. Data economy creating new value chains.',
      emergingMarketContext: 'Mobile internet penetration enabling leapfrog. Social commerce dominant in Southeast Asia. Last-mile logistics is the primary bottleneck. Digital payment infrastructure enables e-commerce growth.',
      typicalInvestmentRange: '$50K-$100M (startup to platform scale)',
      standardStructure: 'Platform development > market launch > user acquisition > marketplace monetisation > logistics build-out > profitability. Asset-light models preferred but logistics investment often necessary.',
      regulatoryPattern: 'Consumer protection regulations. Data localisation requirements. Digital services tax (emerging in many jurisdictions). Competition law for platform dominance.',
      knownRisks: ['Winner-takes-most market dynamics', 'Regulatory disruption (data localisation, digital tax)', 'Customer acquisition costs in competitive markets', 'Logistics and fulfilment complexity'],
      successFactors: ['Local market adaptation (not copy-paste from other markets)', 'Payment infrastructure integration', 'Last-mile logistics partnership or build', 'Trust-building mechanisms (ratings, buyer protection)'],
    },
    {
      sector: 'Infrastructure and Construction',
      globalTrend: 'Global infrastructure investment gap $15T by 2040. Climate-resilient infrastructure emerging requirement. Smart cities and digital infrastructure co-investment.',
      emergingMarketContext: 'Urbanisation driving massive infrastructure demand. PPP models for financing. MDB co-financing essential for de-risking. Chinese Belt and Road creating competition/opportunity dynamic.',
      typicalInvestmentRange: '$5M-$10B per project',
      standardStructure: 'Feasibility - procurement (ICB/PPP) - financial close - EPC contract - construction - commissioning - operations. Project finance dominant for large projects.',
      regulatoryPattern: 'Government procurement law. PPP framework. Environmental clearance. Land acquisition (often the longest process). Building codes and safety standards.',
      knownRisks: ['Cost and time overruns (global average: 25% over budget, 20% over time)', 'Land acquisition delays', 'Currency risk on long-tenor projects', 'Political cycle - projects can be deprioritised mid-construction'],
      successFactors: ['Bankable feasibility study with realistic cost estimates', 'Secured land and environmental clearances before construction', 'Experienced EPC contractor with local track record', 'Adequate contingency (15-20% of base cost)'],
    },
  ];

  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  // QUERY METHODS
  // â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  /**
   * Look up methodology for a given domain.
   */
  static findMethodology(domain: string): MethodologyEntry | undefined {
    const lower = domain.toLowerCase();
    return this.METHODOLOGIES.find(m =>
      m.domain.toLowerCase().includes(lower) ||
      m.principle.toLowerCase().includes(lower)
    );
  }

  /**
   * Get all methodology entries.
   */
  static getAllMethodologies(): MethodologyEntry[] {
    return [...this.METHODOLOGIES];
  }

  /**
   * Look up country intelligence.
   */
  static findCountry(country: string): CountryIntelligence | undefined {
    const lower = country.toLowerCase();
    return this.COUNTRIES.find(c => c.country.toLowerCase() === lower);
  }

  /**
   * Get all country profiles.
   */
  static getAllCountries(): CountryIntelligence[] {
    return [...this.COUNTRIES];
  }

  /**
   * Look up sector intelligence.
   */
  static findSector(sector: string): SectorIntelligence | undefined {
    const lower = sector.toLowerCase();
    return this.SECTORS.find(s =>
      s.sector.toLowerCase().includes(lower) ||
      lower.includes(s.sector.toLowerCase().split('/')[0].trim())
    );
  }

  /**
   * Get all sector profiles.
   */
  static getAllSectors(): SectorIntelligence[] {
    return [...this.SECTORS];
  }

  /**
   * Comprehensive lookup: given report parameters, return all
   * relevant internal knowledge (methodology + country + sector).
   */
  static lookupAll(params: { country?: string; industry?: string[]; problemStatement?: string }): {
    methodologies: MethodologyEntry[];
    countryIntel: CountryIntelligence | undefined;
    sectorIntel: SectorIntelligence[];
    internalKnowledgeAvailable: boolean;
  } {
    const countryIntel = params.country ? this.findCountry(params.country) : undefined;

    const sectorIntel: SectorIntelligence[] = [];
    if (params.industry) {
      for (const ind of params.industry) {
        const found = this.findSector(ind);
        if (found) sectorIntel.push(found);
      }
    }

    // Find applicable methodologies from problem statement
    const methodologies: MethodologyEntry[] = [];
    const problemLower = (params.problemStatement || '').toLowerCase();
    for (const meth of this.METHODOLOGIES) {
      const keywords = meth.domain.toLowerCase().split(' ');
      if (keywords.some(kw => problemLower.includes(kw))) {
        methodologies.push(meth);
      }
    }

    // Also add methodologies that contextually apply
    if (countryIntel) {
      // Regional development always applies when a country is selected
      const rdp = this.METHODOLOGIES.find(m => m.id === 'METH-002');
      if (rdp && !methodologies.includes(rdp)) methodologies.push(rdp);
    }

    return {
      methodologies,
      countryIntel,
      sectorIntel,
      internalKnowledgeAvailable: methodologies.length > 0 || !!countryIntel || sectorIntel.length > 0,
    };
  }

  /**
   * Generate a knowledge briefing for the user " what the system
   * already knows before the user tells it anything.
   */
  static generateKnowledgeBriefing(params: { country?: string; industry?: string[] }): string {
    const lookup = this.lookupAll(params);
    const lines: string[] = [];

    if (!lookup.internalKnowledgeAvailable) {
      return 'The knowledge base does not have specific embedded intelligence for this combination. Standard analytical methods will be applied.';
    }

    lines.push('**Internal Knowledge Assessment**\n');

    if (lookup.countryIntel) {
      const c = lookup.countryIntel;
      lines.push(`**${c.country} (${c.region})**`);
      lines.push(`Framework: ${c.investmentFramework}`);
      lines.push(`Typical timeline: ${c.typicalTimeline}`);
      lines.push(`Key agencies: ${c.keyAgencies.join(', ')}`);
      lines.push(`What works: ${c.whatWorksHere.slice(0, 2).join('; ')}`);
      lines.push(`Challenges: ${c.knownChallenges.slice(0, 2).join('; ')}`);
      lines.push('');
    }

    for (const s of lookup.sectorIntel) {
      lines.push(`**${s.sector}**`);
      lines.push(`Global trend: ${s.globalTrend.substring(0, 120)}...`);
      lines.push(`Investment range: ${s.typicalInvestmentRange}`);
      lines.push(`Key risks: ${s.knownRisks.slice(0, 2).join('; ')}`);
      lines.push('');
    }

    for (const m of lookup.methodologies) {
      lines.push(`**Methodology: ${m.domain}** (stable ${m.stableForYears} years, ${m.applicableCountries} countries)`);
      lines.push(`Principle: ${m.principle.substring(0, 150)}...`);
      lines.push('');
    }

    return lines.join('\n');
  }
}

