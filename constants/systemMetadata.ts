// System metadata with descriptions, experience levels, and help text
// Used by MainCanvas to provide contextual guidance based on user experience level

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Early Stage Founder/New to Planning',
    description: 'Just starting out. Need step-by-step guidance, definitions, and examples.',
    icon: '🌍+/-',
    helpVerbosity: 'detailed',
    suggestDocuments: true,
  },
  {
    id: 'intermediate',
    label: 'Growing Organization',
    description: 'Have some experience. Want balanced guidance with key insights.',
    icon: '📈',
    helpVerbosity: 'moderate',
    suggestDocuments: true,
  },
  {
    id: 'advanced',
    label: 'Experienced Executive/Investor',
    description: 'Highly experienced. Just need field prompts and templates.',
    icon: '🚀',
    helpVerbosity: 'minimal',
    suggestDocuments: false,
  },
];

// Field descriptions with different verbosity levels
export const FIELD_DESCRIPTIONS = {
  // Foundation Section
  companyName: {
    label: 'Organization Name',
    short: 'Your official business name',
    detailed: 'Enter your organization\'s legal or commonly recognized name. This is how you\'re officially registered or known in the market.',
    why: 'Needed for all official documents and legal references',
    example: 'TechVentures Inc., Global Solutions Ltd., or The Foundation Trust',
    helpBeginners: [
      'This is the name on your business registration documents',
      'Should match your legal paperwork',
      'If you\'re a startup with a working name, use that'
    ]
  },
  
  entityType: {
    label: 'Entity Type',
    short: 'Your business structure',
    detailed: 'Choose the legal structure that best describes your organization. This affects taxes, liability, and governance.',
    why: 'Determines your legal liability, taxation, and regulatory requirements',
    example: 'LLC, Corporation, Nonprofit, Startup, or Government Agency',
    helpBeginners: [
      'LLC = Protected personal assets, flexible taxes',
      'Corporation = More formal, better for investors',
      'Nonprofit = Mission-driven, tax benefits',
      'Startup = Early-stage with growth focus'
    ]
  },
  
  country: {
    label: 'Country/Location',
    short: 'Where you operate',
    detailed: 'Select your primary country of operation. This affects market access, regulations, and regulatory requirements.',
    why: 'Determines market access, regulatory environment, and compliance needs',
    example: 'United States, Singapore, Netherlands, or multiple regions',
    helpBeginners: [
      'Choose your headquarters or main operational location',
      'If you operate globally, choose your primary market',
      'Different countries have different business regulations'
    ]
  },
  
  primaryOwner: {
    label: 'Primary Owner/Founder',
    short: 'Main decision-maker',
    detailed: 'Name the primary founder, CEO, or main decision-maker who is leading this organization.',
    why: 'Establishes leadership and decision-making authority',
    example: 'Jane Smith, CEO | John Chen, Founder | Maria Garcia, Executive Director',
    helpBeginners: [
      'Usually the founder or current CEO',
      'Can be a single person or role',
      'Important for partner identification and engagement'
    ]
  },
  
  email: {
    label: 'Contact Email',
    short: 'How to reach you',
    detailed: 'Provide the primary email address for business inquiries and communications.',
    why: 'Enables partner outreach and business communication',
    example: 'info@yourcompany.com, jane@company.com, or hello@startup.io',
    helpBeginners: [
      'Use your business email, not personal Gmail',
      'Make sure it\'s monitored regularly',
      'Partners will use this to contact you'
    ]
  },

  // Market Section
  tam: {
    label: 'Total Addressable Market (TAM)',
    short: 'Your market size opportunity',
    detailed: 'Total Addressable Market is the maximum potential revenue for your business if you captured 100% of your target market.',
    why: 'Shows the scale of opportunity and growth potential to investors and partners',
    example: '$2.5B for enterprise software, $50M for niche consulting, or $100M+ for regional services',
    helpBeginners: [
      'TAM = Total market size you\'re trying to capture',
      'Often estimated by: target customers A -  average price',
      'Don\'t worry about being perfect - reasonable estimates are fine',
      'You can research industry reports or use benchmarks'
    ]
  },
  
  growthRate: {
    label: 'Market Growth Rate',
    short: 'How fast your market is growing',
    detailed: 'The projected annual growth rate of your market segment. Shows momentum and opportunity expansion.',
    why: 'Indicates market attractiveness and potential for rapid scaling',
    example: '15% CAGR, 25% annual growth, or -5% mature market decline',
    helpBeginners: [
      'CAGR = Compound Annual Growth Rate',
      'Industry reports usually provide this',
      'Higher growth = better for new market entrants',
      'Even 0% or negative growth can be acceptable in profitable markets'
    ]
  },
  
  industry: {
    label: 'Industry/Sector',
    short: 'Your business category',
    detailed: 'The primary industry or sector classification for your organization.',
    why: 'Helps stakeholders understand your business context and competitive environment',
    example: 'FinTech, Healthcare, SaaS, Manufacturing, Energy, or Logistics',
    helpBeginners: [
      'Choose your primary sector',
      'You can be in multiple industries, but pick the main one',
      'Use standard industry classifications if possible',
      'This affects which competitors you compare against'
    ]
  },
  
  segments: {
    label: 'Target Segments',
    short: 'Who are your main customers',
    detailed: 'Define your primary customer segments. Who do you serve? What types of clients are your focus?',
    why: 'Shows market focus and helps identify partnership opportunities',
    example: 'Enterprise, SMEs, Government, Startups, or specific verticals like Healthcare Providers, Retailers',
    helpBeginners: [
      'List 1-3 main customer types',
      'Be specific: "Healthcare" vs "Hospital Systems"',
      'Consider both customer size and industry',
      'Example: Enterprise banks, Government agencies, or SME retailers'
    ]
  },
  
  competitors: {
    label: 'Competitive Landscape',
    short: 'Your main competitors',
    detailed: 'Identify your primary competitors and your unique competitive advantage.',
    why: 'Shows market awareness and positioning differentiation',
    example: 'Competitors: CompetitorA, CompetitorB. Our advantage: Lower cost, Better service, Proprietary tech',
    helpBeginners: [
      'List 2-4 main competitors',
      'Then state: What makes you different?',
      'This could be: price, service, technology, customer focus',
      'Your advantage is what makes partnerships want to work with you'
    ]
  },

  // Operations Section
  competencies: {
    label: 'Core Competencies',
    short: 'What you\'re best at',
    detailed: 'Your organization\'s key strengths, capabilities, and what you do better than anyone else.',
    why: 'Defines your partnership value proposition - what you bring to collaborations',
    example: 'Advanced AI development, 24/7 support, Industry expertise, Proprietary database',
    helpBeginners: [
      'List 2-4 things you excel at',
      'These should be hard to copy',
      'Example: "Deep domain expertise in insurance", "Real-time data processing", "Award-winning design"',
      'Partners want to know what special skills you have'
    ]
  },
  
  technology: {
    label: 'Technology Stack',
    short: 'Your technical foundation',
    detailed: 'The key technologies, platforms, and tools your organization uses.',
    why: 'Shows technical capability and potential for integration with partners',
    example: 'Cloud: Azure. Languages: Python, Go. Frameworks: React, Node.js. Database: PostgreSQL',
    helpBeginners: [
      'List main categories: Cloud platform, Programming languages, Frameworks, Databases',
      'Only include technologies critical to your business',
      'Shows whether you can integrate with partners\' systems',
      'Example: "Azure + Python + PostgreSQL + React"'
    ]
  },
  
  teamSize: {
    label: 'Team Size',
    short: 'How many people work with you',
    detailed: 'Your total workforce or full-time equivalent (FTE). Shows organizational scale.',
    why: 'Indicates operational capacity and ability to execute partnerships',
    example: '5-10 people, 25 team members, 100+ staff',
    helpBeginners: [
      'Count full-time employees + significant contractors',
      'Include contractors as 0.5-1.0 FTE each',
      'For startups: just count core team',
      'Larger teams can take on bigger partnerships'
    ]
  },
  
  processes: {
    label: 'Key Processes',
    short: 'How you operate',
    detailed: 'Your critical business processes and operational workflows. What are your key procedures?',
    why: 'Demonstrates operational maturity and integration capability',
    example: 'Agile development, Daily standup meetings, Quarterly planning cycles, Continuous deployment',
    helpBeginners: [
      'List 2-4 important processes',
      'Examples: Customer onboarding, Product development, Quality assurance',
      'Show how organized and systematic you are',
      'Partners need to know you can deliver consistently'
    ]
  },

  // Financial Section
  revenue1: {
    label: 'Year 1 Revenue Projection',
    short: 'Expected first year income',
    detailed: 'Your projected revenue for the first year of operation or fiscal year.',
    why: 'Shows revenue model viability and growth trajectory',
    example: '$500K, $2M, $5M, or realistic startup projection',
    helpBeginners: [
      'Be realistic but optimistic',
      'Calculate: expected customers A -  average deal size',
      'For startups: conservative estimate is better than aggressive',
      'Don\'t worry about decimal points - order of magnitude matters'
    ]
  },
  
  revenue3: {
    label: 'Year 3 Revenue Target',
    short: 'Revenue goal in 3 years',
    detailed: 'Your revenue projection for year 3. Shows growth ambition and scaling plan.',
    why: 'Demonstrates growth trajectory and market potential to investors and partners',
    example: '$5M by year 3, $25M target, or 3x Year 1 revenue',
    helpBeginners: [
      'Typically 3-10x your Year 1 revenue',
      'Shows growth rate and scaling capability',
      'Partners want to know you\'re serious about growth',
      'This is your internal target - be ambitious but believable'
    ]
  },
  
  marginTarget: {
    label: 'Target Margin',
    short: 'Your profit goal',
    detailed: 'Your target profit margin (revenue minus costs). Shows business unit economics.',
    why: 'Demonstrates business model sustainability and profitability',
    example: '40% gross margin, 20% operating margin, or path to profitability',
    helpBeginners: [
      'Gross margin = (Revenue - COGS) / Revenue',
      'Operating margin = (Revenue - All Costs) / Revenue',
      'SaaS often targets 40%+, Services 20-30%, Startups often negative initially',
      'Show: Current margin and target margin'
    ]
  },
  
  opexBudget: {
    label: 'Operating Budget',
    short: 'Your annual spending',
    detailed: 'Your total operating expenses (team, tools, marketing, facilities, etc.) for the year.',
    why: 'Shows financial discipline and capital efficiency',
    example: '$1M/year ($500K team, $300K tech, $200K other), or monthly burn rate',
    helpBeginners: [
      'Include: Salaries, Cloud/hosting, Software tools, Marketing, Office space',
      'Think monthly burn rate A -  12',
      'For bootstrapped: your personal cost of running the business',
      'Helps partners understand your financial constraints'
    ]
  },

  // Partnerships Section
  partners: {
    label: 'Strategic Partners',
    short: 'Key collaborators',
    detailed: 'Current or planned strategic partners, integrations, or alliances that strengthen your offering.',
    why: 'Shows ecosystem support and integrated value proposition',
    example: 'Partnerships with Salesforce or industry leaders. Distribution agreements.',
    helpBeginners: [
      'List 1-3 key partners or partner types',
      'Or describe what partnerships you\'re seeking',
      'Example: "Reseller partnerships with systems integrators", "API integration with major platforms"',
      'Partners validate your credibility'
    ]
  },

  // Governance Section
  risks: {
    label: 'Risk Management',
    short: 'How you manage risks',
    detailed: 'Key risks to your business and how you mitigate them. Shows strategic thinking.',
    why: 'Demonstrates mature planning and risk awareness',
    example: 'Market risk: Diversify customers. Tech risk: Redundancy. Talent risk: Cross-training',
    helpBeginners: [
      'Identify 2-3 biggest risks to your business',
      'For each risk: What\'s your mitigation plan?',
      'Example: "Market concentration - plan to expand to 3 new verticals by Q3"',
      'Investors appreciate honest risk assessment'
    ]
  },
  
  compliance: {
    label: 'Compliance & Governance',
    short: 'Your regulatory requirements',
    detailed: 'Key compliance requirements, certifications, or governance standards you follow.',
    why: 'Shows regulatory maturity and operational discipline',
    example: 'GDPR compliance, ISO 27001, SOC 2, HIPAA, Local regulations',
    helpBeginners: [
      'What regulations affect your business?',
      'Do you have certifications? (SOC 2, ISO 27001, GDPR, etc.)',
      'What industry standards do you follow?',
      'Compliance is often a partnership requirement'
    ]
  },

  // Metrics Section
  kpis: {
    label: 'Key Performance Indicators (KPIs)',
    short: 'How you measure success',
    detailed: 'Your key metrics that measure business performance and success.',
    why: 'Shows measurement discipline and focus on outcomes',
    example: 'Monthly Recurring Revenue (MRR), Customer Acquisition Cost (CAC), Churn Rate, Net Promoter Score (NPS)',
    helpBeginners: [
      'Track 3-5 key metrics that matter most',
      'Examples: Revenue growth, Customer retention, Product quality (uptime)',
      'Each metric should tie to business goals',
      'Partners want to know you measure what matters'
    ]
  }
};

// Suggested additional fields based on experience level
export const OPTIONAL_FIELDS = [
  {
    id: 'previousExperience',
    label: 'Previous Experience',
    category: 'Foundation',
    description: 'Team\'s experience in this industry or with this business model',
    suggestToLevel: ['beginner', 'intermediate'],
    placeholder: 'e.g., "Founder has 10 years in FinTech", "Team previously scaled 2 exits"'
  },
  {
    id: 'fundingStatus',
    label: 'Funding Status',
    category: 'Financial',
    description: 'Current funding round and total raised',
    suggestToLevel: ['beginner', 'intermediate', 'advanced'],
    placeholder: 'e.g., "Seed funded ($500K)", "Series A", "Bootstrapped"'
  },
  {
    id: 'customerBase',
    label: 'Customer Base',
    category: 'Market',
    description: 'Number of current customers and customer diversity',
    suggestToLevel: ['intermediate', 'advanced'],
    placeholder: 'e.g., "150+ paying customers", "10 enterprise clients"'
  },
  {
    id: 'partnershipGoals',
    label: 'Partnership Objectives',
    category: 'Partnerships',
    description: 'What types of partnerships are you seeking?',
    suggestToLevel: ['beginner', 'intermediate', 'advanced'],
    placeholder: 'e.g., "Integration partners", "Resellers", "Strategic acquirers"'
  },
  {
    id: 'geographicExpansion',
    label: 'Geographic Expansion Plans',
    category: 'Market',
    description: 'Plans to expand into new regions',
    suggestToLevel: ['intermediate', 'advanced'],
    placeholder: 'e.g., "Expanding to APAC in 2025", "Europe pilot program"'
  },
  {
    id: 'productRoadmap',
    label: 'Product Roadmap',
    category: 'Operations',
    description: 'Key product developments planned',
    suggestToLevel: ['intermediate', 'advanced'],
    placeholder: 'e.g., "Q2: API launch", "Q3: Mobile app", "Q4: Enterprise features"'
  },
  {
    id: 'trackRecord',
    label: 'Track Record / Traction',
    category: 'Foundation',
    description: 'Achievements, milestones, or proof points',
    suggestToLevel: ['intermediate', 'advanced'],
    placeholder: 'e.g., "50% month-over-month growth", "Featured in TechCrunch", "1000+ users"'
  }
];

// Document generation templates
export const DOCUMENT_TEMPLATES = [
  {
    id: 'partnership-inquiry',
    name: 'Partnership Inquiry Letter',
    description: 'Professional letter introducing your organization to potential partners',
    category: 'Outreach',
    sections: ['Foundation', 'Market', 'Competencies', 'Partnership Goals'],
    icon: '📊',
  },
  {
    id: 'business-proposal',
    name: 'Business Proposal',
    description: 'Comprehensive proposal for a specific business opportunity or partnership',
    category: 'Engagement',
    sections: ['Foundation', 'Market', 'Operations', 'Financial', 'Partnership Goals'],
    icon: '📄"',
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'One-page high-level overview of your organization',
    category: 'Overview',
    sections: ['Foundation', 'Market', 'Competencies', 'Traction'],
    icon: '📄',
  },
  {
    id: 'pitch-deck-outline',
    name: 'Pitch Deck Outline',
    description: 'Structure and talking points for investor or partner pitch',
    category: 'Presentation',
    sections: ['Foundation', 'Market', 'Competencies', 'Financial', 'Risks', 'Partnerships'],
    icon: '⭐',
  },
  {
    id: 'partnership-proposal',
    name: 'Partnership Proposal',
    description: 'Detailed proposal for strategic partnership with specific partner',
    category: 'Engagement',
    sections: ['Foundation', 'Competencies', 'Partnership Goals', 'Operations', 'Financial'],
    icon: '●',
  },
  {
    id: 'confidential-brief',
    name: 'Confidential Information Memorandum',
    description: 'Confidential business overview for qualified partners/investors',
    category: 'Confidential',
    sections: ['Foundation', 'Market', 'Operations', 'Financial', 'Risks', 'Compliance'],
    icon: '📄',
  },
  {
    id: 'capability-statement',
    name: 'Capability Statement',
    description: 'Overview of your organization\'s capabilities and why partners should work with you',
    category: 'Marketing',
    sections: ['Foundation', 'Competencies', 'Technology', 'Track Record'],
    icon: '',
  },
  {
    id: 'partner-collaboration-framework',
    name: 'Partner Collaboration Framework',
    description: 'How you want to work with partners - terms, expectations, benefits',
    category: 'Framework',
    sections: ['Partnerships', 'Operations', 'Governance', 'Financial'],
    icon: '📊',
  },
  {
    id: 'one-pager',
    name: 'One-Page Overview',
    description: 'Quick company overview on single page',
    category: 'Overview',
    sections: ['Foundation', 'Market', 'Competencies', 'Financial'],
    icon: '📄"',
  },
  {
    id: 'contact-engagement-letter',
    name: 'Contact Engagement Letter',
    description: 'Template for reaching out to specific contacts with your proposal',
    category: 'Outreach',
    sections: ['Foundation', 'Partnership Goals', 'Competencies'],
    icon: '📄',
  },
  {
    id: 'market-analysis-brief',
    name: 'Market Analysis Brief',
    description: 'Market opportunity analysis document',
    category: 'Analysis',
    sections: ['Market', 'Competitors', 'Segments', 'Growth', 'TAM'],
    icon: '📈',
  },
  {
    id: 'operations-overview',
    name: 'Operations Overview',
    description: 'How your organization operates - processes, team, technology',
    category: 'Internal',
    sections: ['Operations', 'Technology', 'Team Size', 'Processes', 'KPIs'],
    icon: 'as(TM)i',
  },
];

// Contact engagement strategies
export const ENGAGEMENT_STRATEGIES = [
  {
    id: 'cold-outreach',
    name: 'Cold Outreach',
    description: 'Initial contact with new potential partners',
    approach: 'Send partnership inquiry letter with one-page overview',
    templates: ['partnership-inquiry', 'one-pager'],
    followUp: '1 week if no response'
  },
  {
    id: 'referral-based',
    name: 'Referral-Based Engagement',
    description: 'Outreach through mutual connections',
    approach: 'Use contact engagement letter with personalization',
    templates: ['contact-engagement-letter', 'executive-summary'],
    followUp: '3-5 days, then call'
  },
  {
    id: 'strategic-meeting',
    name: 'Strategic Meeting Proposal',
    description: 'Propose formal meeting to discuss partnership',
    approach: 'Send business proposal and pitch deck outline',
    templates: ['business-proposal', 'pitch-deck-outline'],
    followUp: 'Scheduled meeting'
  },
  {
    id: 'formal-proposal',
    name: 'Formal Proposal',
    description: 'Detailed partnership proposal for evaluation',
    approach: 'Send partnership proposal with capability statement',
    templates: ['partnership-proposal', 'capability-statement'],
    followUp: '1-2 week review period'
  },
  {
    id: 'confidential-process',
    name: 'Confidential Process',
    description: 'Under NDA, provide detailed information',
    approach: 'Send CIM after NDA signed',
    templates: ['confidential-brief'],
    followUp: 'Schedule due diligence meetings'
  },
];

