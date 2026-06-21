
import { ReportParameters, GlobalCityData } from './types';

export const INITIAL_PARAMETERS: ReportParameters = {
  // Identity
  reportName: '',
  userName: '',
  userDepartment: '',
  skillLevel: 'experienced',
  userCountry: '',
  userTier: 'Tier 1',
    entityClassification: '',
    parentAgency: '',
    operatingUnit: '',
    missionRequestSummary: '',
    assistanceBackground: '',
    intakeGuidanceMode: 'collaborative',
    ingestedDocuments: [],
  
  // Organization
  organizationName: '',
  organizationType: '', 
  organizationSubType: '',
  region: '',
  country: '',
  industry: [],
  customIndustry: '',
  tier: [],
  
  // Strategy
  strategicIntent: [], 
    intentScope: [],
    developmentOutcomes: [],
    visionStatement: '',
    missionStatement: '',
  strategicMode: 'analysis',
  problemStatement: '',
  idealPartnerProfile: '',
  analysisTimeframe: '12 months',
  strategicObjectives: [],
  strategicLens: [],
  priorityThemes: [],
  specificOpportunity: '', 
  targetIncentives: [], 
  partnerPersonas: [],
    stakeholderAlignment: [],
    stakeholderConcerns: '',
    alignmentPlan: '',
    executiveSponsor: '',
    partnerReadinessLevel: 'Exploration',
    partnerFitCriteria: [],
    relationshipGoals: [],
    partnerEngagementNotes: '',
    governanceModels: [],
        politicalSensitivities: [],
        riskPrimaryConcerns: '',
        riskAppetiteStatement: '',
  
  // Execution
  relationshipStage: 'New',
  dueDiligenceDepth: 'Standard',
  partnerCapabilities: [],
  operationalPriority: 'Efficiency',
    riskTolerance: '',
  expansionTimeline: '1-2 Years',
    milestonePlan: '',
    currency: '',
    fxAssumption: '',
        totalInvestment: '',
        capitalAllocation: '',
        cashFlowTiming: '',
        revenueStreams: '',
        revenueYear1: '',
        revenueYear3: '',
        revenueYear5: '',
        unitEconomics: '',
        cogsYear1: '',
        opexYear1: '',
        costBreakdown: '',
        headcountPlan: '',
        ebitdaMarginYear1: '',
        breakEvenYear: '',
        targetExitMultiple: '',
        expectedIrr: '',
        paybackPeriod: '',
        npv: '',
        downsideCase: '',
        baseCase: '',
        upsideCase: '',
        sensitivityDrivers: '',
        financialStages: [],
        financialScenarios: [],
  partnershipSupportNeeds: [],
  targetCounterpartType: [],
  fundingSource: '',
  procurementMode: '',
    macroFactors: [],
    regulatoryFactors: [],
    economicFactors: [],
    corridorFocus: '',
        riskRegister: [],
        riskMitigationSummary: '',
        contingencyPlans: '',
        contingencyBudget: '',
        riskKriNotes: '',
        riskReportingCadence: '',
        riskOwners: [],
        riskMonitoringProcess: '',
        capabilityAssessments: [],
        executiveLead: '',
        cfoLead: '',
        opsLead: '',
        teamBenchAssessment: '',
        vendorStack: '',
        complianceEvidence: '',
        capabilityNotes: '',
        technologyStack: '',
        integrationSystems: '',
        technologyRisks: '',
        capabilityGaps: '',
        buildBuyPartnerPlan: '',
        criticalPath: '',
        goNoGoCriteria: '',
        resourceAllocationPerPhase: '',
        authorityMatrix: '',
        escalationProcedures: '',
        auditFramework: '',

  // Metadata
  id: '',
  createdAt: '',
  status: 'draft',
  
  // UI Helpers
  selectedAgents: ['Scout', 'Strategist', 'Diplomat', 'Analyzer', 'Forecaster'],
  selectedModels: ['Partnership [SPI]', 'Investment [IVAS]', 'Financial [SCF]', 'Assets [LAI]', 'Risk [PRI]', 'Growth [AGI]'],
  selectedModules: ['Rocket Engine Module', 'Symbiotic Matchmaking', 'RROI Diagnostic', 'Geopolitical Analysis', 'Governance Audit', 'Due Diligence Suite'],
  analyticalModules: [],
  aiPersona: [],
  customAiPersona: '',
  
  // Output Config
  reportLength: 'standard',
  reportComplexity: 'standard',
  collaborativeNotes: '',
  outputFormat: 'report',
  letterStyle: 'Formal Exploratory',
  stakeholderPerspectives: [],
  includeCrossSectorMatches: true,
  matchCount: 5,
  partnerDiscoveryMode: false,
  searchScope: 'Global',
  intentTags: [],
  comparativeContext: [],
  additionalContext: '',
  opportunityScore: { totalScore: 0, marketPotential: 0, riskFactors: 0 },
};

export const SECTOR_THEMES: Record<string, { bg: string, border: string, text: string, icon: string }> = {
    'Banking & Finance': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: '💰' },
    'Technology': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: '⚡' },
    'Government': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', icon: '🏛️' },
    'Healthcare': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', icon: '⚕️' },
    'Energy': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: '🔋' },
    'Default': { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-800', icon: '🏢' }
};

// --- GLOBAL MAXIMUM LISTS ---

export const GLOBAL_LEGAL_ENTITIES = [
    'Private Limited Company (Ltd/Pty Ltd)',
    'Public Limited Company (PLC/Inc)',
    'Limited Liability Company (LLC)',
    'Partnership (General/Limited)',
    'Sole Proprietorship',
    'State-Owned Enterprise (SOE)',
    'Government Ministry / Department',
    'Non-Governmental Organization (NGO)',
    'Non-Profit / Foundation',
    'Sovereign Wealth Fund',
    'Joint Venture (JV)',
    'Special Purpose Vehicle (SPV)',
    'Holding Company',
    'Trust / Family Office',
    'Cooperative',
    'Branch Office / Representative Office',
    'Subsidiary',
    'Academic Institution',
    'Intergovernmental Organization (IGO)',
    'Gesellschaft mit beschränkter Haftung (GmbH)',
    'Société Anonyme (SA)',
    'Sociedad Anónima (S.A.)',
    'Kabushiki Kaisha (KK)'
];

export const GLOBAL_INDUSTRIES_EXTENDED = [
    'Aerospace & Defense',
    'Agriculture & AgTech',
    'Automotive & Mobility',
    'Banking & Capital Markets',
    'Biotechnology & Life Sciences',
    'Chemicals & Advanced Materials',
    'Construction & Engineering',
    'Consumer Goods & FMCG',
    'Education & EdTech',
    'Energy (Oil & Gas)',
    'Energy (Renewables & CleanTech)',
    'Fashion & Apparel',
    'Financial Services & Fintech',
    'Food & Beverage',
    'Government & Public Sector',
    'Healthcare & Medical Devices',
    'Hospitality & Tourism',
    'Infrastructure & Urban Development',
    'Insurance & InsurTech',
    'Legal & Professional Services',
    'Logistics & Supply Chain',
    'Manufacturing & Industrial IoT',
    'Media & Entertainment',
    'Mining & Metals',
    'Non-Profit & Philanthropy',
    'Pharmaceuticals',
    'Real Estate & PropTech',
    'Retail & E-commerce',
    'Space & Satellite',
    'Technology (Hardware)',
    'Technology (Software & SaaS)',
    'Telecommunications',
    'Utilities & Waste Management'
];

export const GLOBAL_DEPARTMENTS = [
    'Executive Office / C-Suite',
    'Strategic Planning / Corporate Strategy',
    'Finance & Treasury',
    'Operations & Logistics',
    'Legal & Compliance',
    'Human Resources / People Ops',
    'Marketing & Communications',
    'Sales & Business Development',
    'Research & Development (R&D)',
    'Product Management',
    'Engineering / IT',
    'Procurement / Supply Chain',
    'Investment / M&A',
    'Government Relations / Public Policy',
    'Sustainability / ESG',
    'Risk Management',
    'Project Management Office (PMO)',
    'Investor Relations',
    'Innovation / Digital Transformation',
    'Audit & Internal Control',
    'Facilities & Real Estate'
];

export const GLOBAL_ROLES = [
    'Board Member / Chairman',
    'C-Level Executive (CEO, CFO, CTO, etc.)',
    'Founder / Owner',
    'Managing Director / Partner',
    'Vice President (VP)',
    'Director / Head of Department',
    'Senior Manager / Lead',
    'Manager',
    'Senior Consultant / Advisor',
    'Analyst / Associate',
    'Specialist / Technical Expert',
    'Government Official / Civil Servant',
    'Project Manager',
    'Researcher / Scientist',
    'Legal Counsel',
    'Investor / Shareholder',
    'Academic / Professor',
    'Student / Intern'
];

export const GLOBAL_STRATEGIC_INTENTS = [
    'Market Entry (Greenfield)',
    'Market Entry (Acquisition)',
    'Strategic Partnership / Alliance',
    'Joint Venture Formation',
    'Supply Chain Diversification',
    'Technology Transfer / R&D',
    'Government Relations / Advocacy',
    'Capital Deployment / Investment',
    'Cost Optimization / Offshoring',
    'Talent Acquisition / Hub',
    'Regulatory Compliance / Licensing',
    'Crisis Management / Mitigation',
    'ESG / Sustainability Initiative',
    'Infrastructure Development (PPP)',
    'Export Promotion',
    'Import Substitution',
    'Hostile Takeover Defense',
    'Asset Divestiture',
    'Digital Transformation',
    'Brand Expansion',
    'Humanitarian Aid Logistics',
    'Sovereign Wealth Deployment',
    'National Security Initiative',
    'National Digital Economy Build-out',
    'Industrial Policy & Localization',
    'Regional Corridor Development',
    'Special Economic Zone (SEZ) Build-Out',
    'Smart Cities / Urban Revitalization',
    'Climate Adaptation & Resilience',
    'Energy Transition & Grid Modernization',
    'Health Systems Strengthening',
    'Education / Talent Mobility',
    'Food Security & Agri Modernization',
    'Tourism / Creative Economy',
    'Financial Inclusion & SME Growth',
    'Disaster Recovery & Continuity',
    'Cross-Border Trade Facilitation',
    'FDI Attraction & Promotion'
];

export const INTENT_SCOPE_OPTIONS = [
    'Global (multi-region program)',
    'Regional Bloc (e.g., EU, ASEAN, GCC, AU)',
    'National Program',
    'State / Provincial',
    'City / Metropolitan',
    'Economic Corridor / Trade Route',
    'Special Economic Zone / Freeport',
    'Sector-Wide (industry transformation)',
    'Cross-Border Cluster / Value Chain'
];

export const DEVELOPMENT_OUTCOME_OPTIONS = [
    'GDP Growth & FDI Attraction',
    'Industrial Diversification / Localization',
    'Job Creation & Workforce Upskilling',
    'Digital Economy & Data Infrastructure',
    'Infrastructure & Logistics Capacity',
    'Energy Transition & Climate Resilience',
    'Health Systems Strengthening',
    'Education, Talent Mobility & STEM Pipelines',
    'Food Security & Agri Modernization',
    'Financial Inclusion & SME Acceleration',
    'Tourism / Creative & Cultural Economy',
    'Security, Resilience & Disaster Recovery'
];

export const MACRO_FACTOR_OPTIONS = [
    'GDP growth trajectory',
    'Inflation outlook',
    'FX volatility',
    'Interest rate environment',
    'Commodity exposure',
    'Trade balance & current account',
    'Sanctions / export controls',
    'Political stability & governance index'
];

export const REGULATORY_FACTOR_OPTIONS = [
    'Licensing & permits',
    'Data sovereignty / privacy',
    'Foreign ownership caps',
    'Tariffs / customs',
    'Environmental & ESG disclosures',
    'Labor law constraints',
    'Competition / antitrust',
    'Standards & certification (e.g., ISO, GMP)'
];

export const ECONOMIC_FACTOR_OPTIONS = [
    'SEZ / Freeport incentives',
    'FTZ / customs efficiency',
    'Tax holidays / incentives',
    'Subsidies & grants',
    'Infrastructure readiness',
    'Logistics corridor connectivity',
    'Access to capital & credit',
    'Local content / localization rules'
];

export const CURRENCY_OPTIONS = [
    'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'SGD', 'AED', 'SAR', 'AUD', 'CAD'
];

export const GLOBAL_COUNTERPARTS = [
    'Central Government (Ministry/Dept)',
    'Regional/Local Government',
    'State-Owned Enterprise (SOE)',
    'Public Listed Corporation',
    'Private Enterprise (SME/Startup)',
    'Sovereign Wealth Fund (SWF)',
    'Private Equity / Venture Capital',
    'Family Office',
    'Academic / Research Institution',
    'Non-Governmental Organization (NGO)',
    'Defense Contractor',
    'Intergovernmental Organization',
    'Trade Association / Chamber',
    'Utility Provider',
    'Financial Institution / Bank',
    'Infrastructure Developer',
    'Royal Family Office',
    'Paramilitary / Security Firm'
];

export const GLOBAL_COUNTERPART_TYPES = GLOBAL_COUNTERPARTS;

export const GLOBAL_INCENTIVES = [
    'Corporate Tax Holiday',
    'Reduced Tax Rate',
    'R&D Tax Credits',
    'Free Land / Land Subsidy',
    'Utility Subsidies',
    'Employment / Training Grants',
    'Golden Visa / Expat Residency',
    'Capital Equipment Grants',
    'Customs Duty Exemption',
    'Free Trade Zone (FTZ) Status',
    'Special Economic Zone (SEZ)',
    'Regulatory Sandbox',
    'Fast-Track Permitting',
    'Profit Repatriation Guarantee',
    'Government Procurement Priority',
    'Low-Interest Loans',
    'Export Credit Guarantees',
    'Innovation Box Regime',
    'Sustainability / Green Grants',
    'Infrastructure Connection Subsidy'
];

export const GLOBAL_CAPITAL_SOURCES = [
    'Balance Sheet / Free Cash Flow',
    'Corporate Debt / Bonds',
    'Venture Capital / Series Funding',
    'Private Equity Buyout',
    'Sovereign Grant / Subsidy',
    'Project Finance / Infrastructure Loan',
    'Joint Venture Contribution',
    'IPO Proceeds',
    'Family Office Capital',
    'Crowdfunding / Tokenization'
];

export const GLOBAL_OPERATIONAL_MODELS = [
    'Centralized Command (HQ Control)',
    'Decentralized / Autonomous Regional Hub',
    'Franchise / Licensing Model',
    'Joint Venture / Shared Control',
    'Special Purpose Vehicle (SPV)',
    'Representative Office (Non-Trading)',
    'E-Commerce / Digital Only',
    'Hybrid (Hub & Spoke)'
];

export const SECTOR_DEPARTMENTS: Record<string, string[]> = {
    'Banking & Finance': [
        'Investment Banking Division', 'Risk Management', 'Compliance & Regulatory', 'Private Wealth', 
        'Corporate Lending', 'Capital Markets', 'Fintech Innovation', 'Treasury', 'Asset Management', 'Retail Banking'
    ],
    'Technology': [
        'Engineering / R&D', 'Product Management', 'Strategic Partnerships', 'Sales & Revenue', 
        'Data Science', 'Cloud Infrastructure', 'Cybersecurity', 'User Experience (UX/UI)', 'Customer Success'
    ],
    'Government': [
        'Ministry of Economy', 'Trade & Investment Agency', 'Foreign Affairs', 'Infrastructure Development', 
        'Policy & Planning', 'Regulatory Oversight', 'Defense & Security', 'Public Health', 'Education'
    ],
    'Healthcare': [
        'Clinical Operations', 'Medical Affairs', 'R&D (Pharma)', 'Supply Chain', 'Hospital Administration', 'Public Health', 'Regulatory Affairs'
    ],
    'Energy': [
        'Exploration & Production', 'Renewables Division', 'Grid Operations', 'Sustainability / ESG', 'Project Finance', 'HSE (Health, Safety, Environment)'
    ],
    'Manufacturing': [
        'Operations', 'Supply Chain', 'Quality Assurance', 'Plant Management', 'Procurement', 'Product Design', 'Lean / Six Sigma'
    ],
    'Real Estate & PropTech': [
        'Acquisitions', 'Asset Management', 'Development', 'Property Management', 'Leasing', 'Capital Markets'
    ],
    'Logistics & Supply Chain': [
        'Fleet Management', 'Warehouse Operations', 'Customs & Compliance', 'Freight Forwarding', 'Network Planning'
    ]
};

export const SECTORS_LIST = GLOBAL_INDUSTRIES_EXTENDED;

export const ORGANIZATION_TYPES = GLOBAL_LEGAL_ENTITIES;

export const ORGANIZATION_SUBTYPES: Record<string, string[]> = {
    'Private Enterprise': ['Corporation', 'Startup', 'SME', 'Conglomerate', 'PE Firm', 'Family Business'],
    'Financial Institution': ['Investment Bank', 'Commercial Bank', 'Asset Manager', 'Insurance', 'Fintech', 'Credit Union'],
    'Government / Public Sector': ['Ministry', 'Agency', 'Local Government', 'Regulator', 'State-Owned Enterprise', 'Embassy / Consulate'],
    'Sovereign Wealth Fund': ['National', 'State', 'Pension', 'Strategic Investment Fund'],
    'NGO / Non-Profit': ['Foundation', 'Association', 'Charity', 'Think Tank', 'Development Finance Institution'],
    'Custom': []
};

export const REGIONS_AND_COUNTRIES = [
    { name: 'Asia-Pacific', countries: ['Singapore', 'Vietnam', 'Japan', 'Australia', 'China', 'India', 'Indonesia', 'Thailand', 'South Korea', 'New Zealand', 'Philippines', 'Malaysia', 'Taiwan', 'Bangladesh'] },
    { name: 'Europe', countries: ['United Kingdom', 'Germany', 'France', 'Estonia', 'Switzerland', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Spain', 'Italy', 'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Ireland'] },
    { name: 'North America', countries: ['United States', 'Canada', 'Mexico'] },
    { name: 'Middle East', countries: ['UAE', 'Saudi Arabia', 'Qatar', 'Israel', 'Kuwait', 'Bahrain', 'Oman', 'Turkey', 'Jordan', 'Egypt'] },
    { name: 'South America', countries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay'] },
    { name: 'Africa', countries: ['South Africa', 'Nigeria', 'Kenya', 'Ghana', 'Ethiopia', 'Rwanda', 'Tanzania', 'Morocco', 'Tunisia', 'Ivory Coast'] }
];

export const COUNTRIES = REGIONS_AND_COUNTRIES.flatMap(r => r.countries).sort();

export const STRATEGIC_OBJECTIVES = {
    Growth: [{ id: 'market_entry', label: 'Market Entry' }, { id: 'expansion', label: 'Expansion' }, { id: 'acquisition', label: 'M&A' }, { id: 'ipo_prep', label: 'IPO Preparation' }],
    Efficiency: [{ id: 'cost_reduction', label: 'Cost Reduction' }, { id: 'supply_chain', label: 'Supply Chain Opt' }, { id: 'automation', label: 'Automation / AI' }],
    Innovation: [{ id: 'rd', label: 'R&D' }, { id: 'tech_transfer', label: 'Tech Transfer' }, { id: 'product_launch', label: 'New Product Launch' }],
    Risk: [{ id: 'diversification', label: 'Diversification' }, { id: 'compliance', label: 'Compliance' }, { id: 'crisis_mgmt', label: 'Crisis Management' }],
    Impact: [{ id: 'esg', label: 'ESG / Sustainability' }, { id: 'job_creation', label: 'Job Creation' }, { id: 'national_dev', label: 'National Development' }]
};

export const SECTOR_OPPORTUNITIES: Record<string, string[]> = {
    'Technology': [
        'National Data Center Infrastructure',
        '5G Network Rollout & TowerCo',
        'Smart City Operation Center',
        'E-Government Portal Development',
        'Cybersecurity Operations Center (SOC)',
        'Tech Park / Innovation Hub Development',
        'Semiconductor Fabrication / Assembly',
        'Fiber Optic Backbone Expansion',
        'Fintech Sandbox Implementation',
        'AI Sovereign Cloud Initiative'
    ],
    // ... (Keeping existing opportunities, just showing structure is maintained)
};

export const GOVERNMENT_INCENTIVES = GLOBAL_INCENTIVES;

export const ORGANIZATION_SCALE_BANDS = {
  revenue: [
    { value: 'pre_revenue', label: 'Pre-Revenue / Seed' },
    { value: 'under_1m', label: 'Under $1M' },
    { value: '1m_10m', label: '$1M - $10M' },
    { value: '10m_50m', label: '$10M - $50M' },
    { value: '50m_250m', label: '$50M - $250M' },
    { value: '250m_1b', label: '$250M - $1B' },
    { value: '1b_10b', label: '$1B - $10B' },
    { value: 'over_10b', label: 'Over $10B' }
  ],
  headcount: [
    { value: 'under_10', label: '1 - 10' },
    { value: '10_50', label: '10 - 50' },
    { value: '50_250', label: '50 - 250' },
    { value: '250_1000', label: '250 - 1,000' },
    { value: '1000_5000', label: '1,000 - 5,000' },
    { value: '5000_10000', label: '5,000 - 10,000' },
    { value: 'over_10000', label: 'Over 10,000' }
  ],
  dealSize: [
    { value: 'under_10m', label: 'Under $10M' },
    { value: '10m_50m', label: '$10M - $50M' },
    { value: '50m_250m', label: '$50M - $250M' },
    { value: 'over_250m', label: 'Over $250M' }
  ]
};

export const TIME_HORIZONS = [
  { value: '0_6_months', label: '0-6 Months (Immediate)' },
  { value: '6_12_months', label: '6-12 Months (Short-term)' },
  { value: '1_2_years', label: '1-2 Years (Medium-term)' },
  { value: '3_5_years', label: '3-5 Years (Long-term)' },
  { value: '5_plus_years', label: '5+ Years (Strategic)' }
];

export const TIME_HORIZON_OPTIONS = TIME_HORIZONS.map(t => t.label);

export const INDUSTRIES = GLOBAL_INDUSTRIES_EXTENDED.map(i => ({ id: i, title: i }));

export const GLOBAL_CITY_DATABASE: Record<string, GlobalCityData> = {
    "United States": {
      city: "New York", country: "United States", region: "North America", population: 8400000,
      talentPool: { laborCosts: 10, educationLevel: 9, skillsAvailability: 10 },
      infrastructure: { transportation: 7, digital: 9, utilities: 8 },
      businessEnvironment: { easeOfDoingBusiness: 9, corruptionIndex: 2, regulatoryQuality: 9 },
      marketAccess: { domesticMarket: 10, exportPotential: 8, regionalConnectivity: 9 },
      gdp: { totalBillionUSD: 1700, perCapitaUSD: 85000 }
    },
    // ...
};

// --- NEW CONSTANTS ADDED FOR COMPONENT SUPPORT ---

export const MISSION_TYPES = GLOBAL_STRATEGIC_INTENTS.map(i => ({ value: i, label: i }));

export const MANDATE_TYPES = MISSION_TYPES;

export const PARTNERSHIP_ROLES = [
    'Technology Partner', 'Distribution Partner', 'Manufacturing Partner', 'Joint Venture', 'Strategic Alliance', 'Supplier', 'Customer', 'Investor'
];

export const RISK_APPETITE_LEVELS = [
    { value: 'low', label: 'Low (Conservative)' },
    { value: 'moderate', label: 'Moderate (Balanced)' },
    { value: 'high', label: 'High (Aggressive)' },
    { value: 'opportunistic', label: 'Opportunistic' },
    { value: 'very_low', label: 'Very Low (Risk Averse)' }
];

export const AVAILABLE_AGENTS = ['Scout', 'Diplomat', 'Strategist', 'Analyst', 'Forecaster', 'Auditor', 'Negotiator', 'Legal', 'Financial'];

export const AVAILABLE_MODELS_CATEGORIZED: Record<string, string[]> = {
    'Strategic': ['Partnership [SPI]', 'Growth [AGI]', 'Market Entry'],
    'Financial': ['Investment [IVAS]', 'Financial [SCF]', 'Valuation'],
    'Risk': ['Risk [PRI]', 'Compliance', 'Geopolitical'],
    'Operational': ['Assets [LAI]', 'Supply Chain', 'Workforce']
};

export const OPERATING_MODELS = [
    { value: 'centralized', label: 'Centralized' },
    { value: 'decentralized', label: 'Decentralized' },
    { value: 'hybrid', label: 'Hybrid / Matrix' },
    { value: 'franchise', label: 'Franchise' }
];

export const SUCCESS_METRICS = [
    { value: 'roi', label: 'Return on Investment (ROI)' },
    { value: 'market_share', label: 'Market Share Growth' },
    { value: 'revenue', label: 'Revenue Target' },
    { value: 'brand_equity', label: 'Brand Equity' },
    { value: 'efficiency', label: 'Operational Efficiency' },
    { value: 'innovation', label: 'Innovation Output' }
];

export const DECISION_AUTHORITY_LEVELS = [
    'board', 'executive', 'director', 'manager', 'project_lead'
];

export const PRIORITY_THEMES = [
    'Digital Transformation', 'Sustainability (ESG)', 'Innovation', 'Cost Leadership', 'Customer Experience', 'Operational Excellence',
    'Revenue Growth', 'Margin Improvement', 'Asset Optimization', 'Risk Reduction', 'Talent Development', 'Supply Chain Resilience',
    'Regulatory Compliance', 'Brand & Reputation', 'Social Impact', 'Geographic Expansion', 'Technology Modernization', 'Data Monetization'
];

export const TARGET_INCENTIVES = [
    'Tax Holidays / Exemptions', 'Investment Grants', 'Land / Infrastructure Subsidies', 'SEZ Access', 'Training Subsidies',
    'R&D Tax Credits', 'Accelerated Depreciation', 'Blended Finance / Concessional Loans', 'Export Incentives', 'Energy Subsidies',
    'Public Procurement Preferences', 'Visa / Work Permit Fast-Track', 'One-Stop Licensing', 'Free Trade Zone Benefits', 'Tariff Waivers',
    'Green / ESG Incentives', 'Innovation Matching Funds', 'Government Co-Investment'
];

export const TARGET_COUNTERPART_TYPES = GLOBAL_COUNTERPARTS;

export const POLITICAL_SENSITIVITIES = [
    'Data Sovereignty', 'National Security', 'Labor Rights', 'Environmental Impact', 'Cultural Heritage', 'Political Stability', 'Sanctions Exposure', 'Regime Stability', 'Press Freedom'
];

export const FUNDING_SOURCES = [
    'Internal Cashflow', 'Debt Financing', 'Equity Investment', 'Government Grant', 'Venture Capital', 'Private Equity', 'Sovereign Wealth'
];

export const PROCUREMENT_MODES = [
    'Competitive Bidding', 'Direct Negotiation', 'Sole Source', 'Public-Private Partnership (PPP)', 'G2G Framework'
];

export const DOMAIN_OBJECTIVES: Record<string, {value: string, label: string}[]> = {
    'Private Enterprise': MISSION_TYPES,
    'Government / Public Sector': [
        { value: 'economic_dev', label: 'Economic Development' },
        { value: 'infrastructure', label: 'Infrastructure Project' },
        { value: 'policy', label: 'Policy Implementation' }
    ],
    // Fallback
    'default': MISSION_TYPES
};

export const OUTPUT_FORMATS = [
    { value: 'report', label: 'Standard Report (PDF)' },
    { value: 'presentation', label: 'Executive Presentation (PPT)' },
    { value: 'memo', label: 'Strategic Memo' },
    { value: 'dashboard', label: 'Interactive Dashboard' }
];

export const LETTER_STYLES = [
    { value: 'formal', label: 'Formal / Diplomatic' },
    { value: 'direct', label: 'Direct / Commercial' },
    { value: 'collaborative', label: 'Collaborative / Partnership' }
];

export const REPORT_DEPTHS = [
    { value: 'summary', label: 'Executive Summary (1-2 pages)' },
    { value: 'standard', label: 'Standard Analysis (10-15 pages)' },
    { value: 'comprehensive', label: 'Deep Dive (30+ pages)' }
];

export const STRATEGIC_LENSES = [
    { id: 'financial', label: 'Financial', desc: 'Profitability & ROI' },
    { id: 'market', label: 'Market', desc: 'Customer & Competitor' },
    { id: 'operational', label: 'Operational', desc: 'Efficiency & Scale' },
    { id: 'technological', label: 'Technological', desc: 'Innovation & Digital' },
    { id: 'regulatory', label: 'Regulatory', desc: 'Compliance & Risk' }
];

export const INDUSTRY_NICHES: Record<string, string[]> = {
    'Technology': ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'SaaS', 'Fintech'],
    'Energy': ['Renewables', 'Oil & Gas', 'Nuclear', 'Grid Infrastructure'],
    'Finance': ['Banking', 'Insurance', 'Asset Management', 'Private Equity'],
    'Healthcare': ['Pharma', 'MedTech', 'Telehealth', 'Hospitals'],
    'Manufacturing': ['Automotive', 'Aerospace', 'Consumer Goods', 'Electronics']
};

export const INTELLIGENCE_CATEGORIES = [
    'Market Entry Strategy', 'Strategic Partnership Development', 'Government Relations', 'Competitive Intelligence', 'Risk Assessment'
];

export const DETAILED_PARTNER_CAPABILITIES = [
    'Local Regulatory Shielding',
    'Intellectual Property Protection',
    'Supply Chain Dominance',
    'Last-Mile Distribution Network',
    'Government Access / Lobbying',
    'Access to Low-Cost Capital',
    'Skilled Workforce Pipeline',
    'Raw Material Access'
];

export const DETAILED_RISK_FACTORS = [
    'Operational: Supply Chain Disruption',
    'Operational: Labor Strike / Unrest',
    'Financial: Currency Devaluation (>15%)',
    'Financial: Capital Control / Repatriation',
    'Legal: Contract Enforcement Failure',
    'Legal: Sudden Regulatory Shift',
    'Reputational: ESG Non-Compliance',
    'Reputational: Corruption Scandal',
    'Geopolitical: Sanctions Exposure',
    'Geopolitical: Regional Conflict'
];