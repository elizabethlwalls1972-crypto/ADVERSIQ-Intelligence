/**
 * 
 * DOCUMENT TYPE ROUTER
 * 
 *
 * Maps the 200+ document types and 150+ letter types from the Document Factory
 * catalog to DISTINCT generation paths. Each document type gets:
 *
 *   1. Unique section structure " different documents have different sections
 *   2. Tone and audience configuration " investor vs government vs community
 *   3. Prompt templates " AI receives document-type-specific instructions
 *   4. Length constraints " executive brief (2pg) vs full report (40pg)
 *   5. NSIL intelligence injection " which intelligence to prioritise
 *   6. Compliance framing " what disclaimers and standards apply
 *
 * Categories:
 *   - Strategic Documents (25+ types)
 *   - Market Intelligence (30+ types)
 *   - Financial Analysis (35+ types)
 *   - Due Diligence (25+ types)
 *   - Risk Assessment (20+ types)
 *   - Governance & Compliance (25+ types)
 *   - Partner & Stakeholder (15+ types)
 *   - Government Submissions (20+ types)
 *   - International Body Applications (15+ types)
 *   - Trade & Customs (10+ types)
 *   - Community & Social Impact (10+ types)
 *   - Letters (150+ types across 8 categories)
 *
 * 
 */

// ============================================================================
// TYPES
// ============================================================================

export type DocumentTone = 'formal-corporate' | 'formal-government' | 'technical-analytical' | 'persuasive-investment' | 'community-engagement' | 'academic-research' | 'diplomatic';

export type AudienceType = 'investors' | 'government-officials' | 'board-directors' | 'technical-team' | 'community-stakeholders' | 'international-bodies' | 'legal-counsel' | 'general-public' | 'academic-peer';

export type DocumentLength = 'brief' | 'standard' | 'comprehensive' | 'detailed';

export interface SectionTemplate {
  id: string;
  title: string;
  promptInstruction: string;
  maxWords: number;
  required: boolean;
  intelligencePriority: ('patterns' | 'historicalParallels' | 'ethicalAssessment' | 'situationAnalysis' | 'formulaScores' | 'creativeStrategies' | 'compliance' | 'emotionalClimate' | 'crossDomain')[];
}

export interface DocumentTypeConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  tone: DocumentTone;
  audience: AudienceType;
  length: DocumentLength;
  sections: SectionTemplate[];
  complianceFramework: string[];
  keyFocus: string;
}

export interface LetterTypeConfig {
  id: string;
  name: string;
  category: string;
  tone: DocumentTone;
  audience: AudienceType;
  maxWords: number;
  structure: string[];
  keyElements: string[];
}

// ============================================================================
// DOCUMENT TYPE CONFIGURATIONS
// ============================================================================

const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  // â"€â"€ STRATEGIC DOCUMENTS â"€â"€
  {
    id: 'executive-brief',
    name: 'Executive Brief',
    category: 'Strategic',
    description: 'Concise strategic overview for C-suite and board decision-makers',
    tone: 'formal-corporate',
    audience: 'board-directors',
    length: 'brief',
    keyFocus: 'decision-enabling summary with clear recommendation',
    complianceFramework: ['corporate-governance', 'fiduciary-duty'],
    sections: [
      { id: 'exec-context', title: 'Strategic Context', promptInstruction: 'Provide a crisp 2-paragraph overview of the opportunity, situating it within global and regional trends. Use pattern match data to establish that this type of initiative has a documented track record.', maxWords: 400, required: true, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { id: 'exec-opportunity', title: 'Opportunity Assessment', promptInstruction: 'Assess the specific opportunity using NSIL formula scores. Quantify the potential using historical parallels " cite specific comparable cases and their outcomes.', maxWords: 500, required: true, intelligencePriority: ['formulaScores', 'historicalParallels'] },
      { id: 'exec-risks', title: 'Key Risks & Mitigations', promptInstruction: 'Identify top 5 risks using the ethical assessment and situational analysis. For each risk, provide a specific mitigation strategy grounded in what has worked in similar contexts.', maxWords: 400, required: true, intelligencePriority: ['ethicalAssessment', 'situationAnalysis', 'emotionalClimate'] },
      { id: 'exec-recommendation', title: 'Recommendation', promptInstruction: 'Provide a clear GO/NO-GO/CONDITIONAL recommendation with specific conditions and next steps. Reference the ethical gate result.', maxWords: 300, required: true, intelligencePriority: ['ethicalAssessment', 'formulaScores'] },
    ]
  },
  {
    id: 'full-feasibility-study',
    name: 'Full Feasibility Study',
    category: 'Strategic',
    description: 'Comprehensive feasibility analysis covering market, financial, technical, legal, and social dimensions',
    tone: 'technical-analytical',
    audience: 'investors',
    length: 'comprehensive',
    keyFocus: 'thorough multi-dimensional analysis with evidence-based conclusions',
    complianceFramework: ['investment-appraisal-standards', 'IFC-performance-standards'],
    sections: [
      { id: 'feas-exec', title: 'Executive Summary', promptInstruction: 'Summarise the full feasibility study in 1-2 pages. State the conclusion upfront: is this project feasible? Under what conditions?', maxWords: 800, required: true, intelligencePriority: ['formulaScores', 'patterns'] },
      { id: 'feas-market', title: 'Market Analysis', promptInstruction: 'Analyse market size, growth trajectory, competitive landscape, and demand drivers. Use pattern confidence data to show how similar markets have evolved in comparable countries.', maxWords: 2000, required: true, intelligencePriority: ['patterns', 'historicalParallels', 'situationAnalysis'] },
      { id: 'feas-technical', title: 'Technical Feasibility', promptInstruction: 'Assess infrastructure requirements, technology availability, supply chain considerations, and implementation complexity. Reference what has worked in comparable historical cases.', maxWords: 1500, required: true, intelligencePriority: ['historicalParallels', 'crossDomain'] },
      { id: 'feas-financial', title: 'Financial Analysis', promptInstruction: 'Provide detailed financial projections including CAPEX, OPEX, revenue forecasts, IRR, NPV, payback period. Use formula scores for risk-adjusted returns. State all assumptions clearly.', maxWords: 2000, required: true, intelligencePriority: ['formulaScores', 'patterns'] },
      { id: 'feas-legal', title: 'Legal & Regulatory Framework', promptInstruction: 'Detail the applicable legal framework, licensing requirements, foreign ownership rules, tax regime, and compliance obligations using the GlobalComplianceFramework data.', maxWords: 1500, required: true, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { id: 'feas-social', title: 'Social & Environmental Impact', promptInstruction: 'Assess community impact, environmental considerations, and stakeholder dynamics using the ethical assessment dimensions. Include Rawlsian fairness analysis.', maxWords: 1500, required: true, intelligencePriority: ['ethicalAssessment', 'emotionalClimate'] },
      { id: 'feas-risk', title: 'Risk Matrix & Mitigations', promptInstruction: 'Construct a comprehensive risk matrix (likelihood x impact) covering market, financial, political, regulatory, operational, ESG risks. Provide specific mitigations for each.', maxWords: 1500, required: true, intelligencePriority: ['situationAnalysis', 'ethicalAssessment', 'patterns'] },
      { id: 'feas-implementation', title: 'Implementation Roadmap', promptInstruction: 'Provide a phased implementation plan with timelines, milestones, resource requirements, and decision gates. Use typical timelines from compliance framework.', maxWords: 1200, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
      { id: 'feas-conclusion', title: 'Conclusions & Recommendations', promptInstruction: 'State clear conclusions on feasibility with conditions. Provide prioritised next steps and go/no-go recommendation with reference to ethical gate result.', maxWords: 800, required: true, intelligencePriority: ['ethicalAssessment', 'formulaScores'] },
    ]
  },
  {
    id: 'investment-attraction-strategy',
    name: 'Investment Attraction Strategy',
    category: 'Strategic',
    description: 'Strategy document for governments or agencies to attract foreign direct investment',
    tone: 'formal-government',
    audience: 'government-officials',
    length: 'comprehensive',
    keyFocus: 'actionable strategy with benchmark comparisons and competitive positioning',
    complianceFramework: ['government-procurement', 'UNCTAD-investment-policy-framework'],
    sections: [
      { id: 'ias-context', title: 'National/Regional Context', promptInstruction: 'Analyse the investment climate, competitive advantages, and positioning relative to peer countries. Use compliance framework data for doing-business rankings and CPI comparisons.', maxWords: 1500, required: true, intelligencePriority: ['compliance', 'situationAnalysis', 'patterns'] },
      { id: 'ias-benchmark', title: 'Benchmark Analysis', promptInstruction: 'Compare the jurisdiction to 5-8 competitor destinations using quantitative indicators. Use historical parallels of successful investment attraction campaigns.', maxWords: 1500, required: true, intelligencePriority: ['historicalParallels', 'compliance', 'crossDomain'] },
      { id: 'ias-sectors', title: 'Priority Sector Identification', promptInstruction: 'Identify and rank priority sectors for investment attraction. Use pattern data to show global demand-supply dynamics and competitive advantage analysis.', maxWords: 1500, required: true, intelligencePriority: ['patterns', 'formulaScores', 'crossDomain'] },
      { id: 'ias-value-prop', title: 'Value Proposition Design', promptInstruction: 'Craft compelling value propositions for each priority sector. Reference creative strategies and cross-domain innovations from the intelligence data.', maxWords: 1200, required: true, intelligencePriority: ['creativeStrategies', 'crossDomain', 'patterns'] },
      { id: 'ias-incentives', title: 'Incentive Framework', promptInstruction: 'Design an incentive framework that is competitive, fiscally sustainable, and WTO-compliant. Use compliance data for incentive benchmarking across peer countries.', maxWords: 1200, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
      { id: 'ias-institutional', title: 'Institutional Strengthening', promptInstruction: 'Recommend institutional reforms for IPA (Investment Promotion Agency) effectiveness. Reference best practices from successful IPAs globally.', maxWords: 1000, required: true, intelligencePriority: ['historicalParallels', 'patterns'] },
      { id: 'ias-implementation', title: 'Implementation Plan', promptInstruction: 'Provide a 3-5 year phased implementation plan with KPIs, budget estimates, and institutional responsibilities.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores', 'compliance'] },
    ]
  },
  {
    id: 'investor-deck',
    name: 'Investor Pitch Deck Narrative',
    category: 'Strategic',
    description: 'Narrative content for investor presentation slides',
    tone: 'persuasive-investment',
    audience: 'investors',
    length: 'brief',
    keyFocus: 'compelling narrative with clear ROI proposition',
    complianceFramework: ['securities-regulations-disclaimer'],
    sections: [
      { id: 'pitch-problem', title: 'Problem / Opportunity', promptInstruction: 'Define the problem/opportunity in 2-3 crisp sentences. Quantify the market gap with specific data. Use pattern analysis for market sizing.', maxWords: 300, required: true, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { id: 'pitch-solution', title: 'Solution & Value Proposition', promptInstruction: 'Present the solution concisely. What makes this approach unique? Use cross-domain insights for differentiation.', maxWords: 300, required: true, intelligencePriority: ['creativeStrategies', 'crossDomain'] },
      { id: 'pitch-market', title: 'Market Sizing', promptInstruction: 'TAM/SAM/SOM with supporting data. Reference comparable markets from historical parallels.', maxWords: 400, required: true, intelligencePriority: ['patterns', 'historicalParallels'] },
      { id: 'pitch-traction', title: 'Traction & Proof Points', promptInstruction: 'Evidence of viability. Historical parallels of similar successes. Risk-adjusted projections using formula scores.', maxWords: 400, required: true, intelligencePriority: ['historicalParallels', 'formulaScores'] },
      { id: 'pitch-financials', title: 'Financial Projections', promptInstruction: 'Key financial metrics: revenue growth, margin trajectory, unit economics, IRR/ROI. All using NSIL formula computations.', maxWords: 500, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'pitch-ask', title: 'The Ask', promptInstruction: 'Clear investment ask with use of funds and expected returns. Include key terms and exit timeline.', maxWords: 300, required: true, intelligencePriority: ['formulaScores'] },
    ]
  },
  {
    id: 'partner-proposal',
    name: 'Partnership Proposal',
    category: 'Partner & Stakeholder',
    description: 'Formal proposal for strategic partnership, JV, or collaboration',
    tone: 'formal-corporate',
    audience: 'board-directors',
    length: 'standard',
    keyFocus: 'mutual value creation with clear governance structure',
    complianceFramework: ['partnership-law', 'competition-law'],
    sections: [
      { id: 'part-context', title: 'Strategic Rationale', promptInstruction: 'Why this partnership? What market dynamics or competitive pressures make partnership the optimal vehicle? Use situational analysis.', maxWords: 600, required: true, intelligencePriority: ['situationAnalysis', 'patterns'] },
      { id: 'part-value', title: 'Mutual Value Proposition', promptInstruction: 'What each party brings and gains. Use creative strategies for innovative partnership models. Reference successful partnership parallels.', maxWords: 800, required: true, intelligencePriority: ['creativeStrategies', 'historicalParallels'] },
      { id: 'part-structure', title: 'Proposed Structure', promptInstruction: 'JV structure, equity splits, governance, decision-making, IP treatment. Reference compliance framework for foreign ownership requirements.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'formulaScores'] },
      { id: 'part-financial', title: 'Financial Framework', promptInstruction: 'Capital contributions, profit sharing, reinvestment, exit provisions. Use formula scores for financial modeling.', maxWords: 700, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'part-risk', title: 'Risk Allocation', promptInstruction: 'Risk sharing framework; dispute resolution; termination provisions. Use ethical assessment for fairness of risk allocation.', maxWords: 600, required: true, intelligencePriority: ['ethicalAssessment', 'situationAnalysis'] },
      { id: 'part-next', title: 'Next Steps & Timeline', promptInstruction: 'Concrete next steps, due diligence requirements, timeline to agreement.', maxWords: 400, required: true, intelligencePriority: ['compliance'] },
    ]
  },
  {
    id: 'risk-assessment-report',
    name: 'Comprehensive Risk Assessment',
    category: 'Risk Assessment',
    description: 'Multi-dimensional risk assessment covering political, economic, operational, ESG risks',
    tone: 'technical-analytical',
    audience: 'board-directors',
    length: 'comprehensive',
    keyFocus: 'quantified risk identification with evidence-based mitigation strategies',
    complianceFramework: ['ISO-31000', 'enterprise-risk-management'],
    sections: [
      { id: 'risk-methodology', title: 'Assessment Methodology', promptInstruction: 'Explain the multi-layered assessment methodology: NSIL 29-formula computation, 7-dimension ethical assessment, pattern analysis, historical parallel matching, and situation analysis.', maxWords: 600, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'risk-political', title: 'Political & Regulatory Risk', promptInstruction: 'Assess political stability, regulatory predictability, policy direction, government stability, election cycles, policy reversal risk. Use compliance framework CPI and rule of law data.', maxWords: 1200, required: true, intelligencePriority: ['compliance', 'situationAnalysis', 'emotionalClimate'] },
      { id: 'risk-economic', title: 'Economic & Financial Risk', promptInstruction: 'Assess macroeconomic stability, currency risk, inflation, credit risk, market liquidity. Use formula scores for quantification.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores', 'patterns'] },
      { id: 'risk-operational', title: 'Operational Risk', promptInstruction: 'Assess infrastructure, supply chain, human capital, technology, cybersecurity, business continuity risks. Use historical parallels of operational failures.', maxWords: 1000, required: true, intelligencePriority: ['historicalParallels', 'crossDomain'] },
      { id: 'risk-esg', title: 'ESG Risk', promptInstruction: 'Environmental liabilities, social licence to operate, governance weaknesses, climate risk, community opposition. Use ethical assessment dimensions.', maxWords: 1000, required: true, intelligencePriority: ['ethicalAssessment', 'emotionalClimate'] },
      { id: 'risk-matrix', title: 'Risk Matrix & Scoring', promptInstruction: 'Present a comprehensive risk matrix with likelihood (1-5) x impact (1-5) scoring. Rank all identified risks. Use NSIL scores for quantification.', maxWords: 800, required: true, intelligencePriority: ['formulaScores', 'situationAnalysis'] },
      { id: 'risk-mitigation', title: 'Mitigation Strategy', promptInstruction: 'For each high/critical risk, provide specific mitigation actions, responsible parties, timelines, and residual risk levels. Reference what mitigations worked in historical parallels.', maxWords: 1200, required: true, intelligencePriority: ['historicalParallels', 'creativeStrategies'] },
    ]
  },
  {
    id: 'government-submission',
    name: 'Government Policy Submission',
    category: 'Government Submissions',
    description: 'Formal submission to government on policy consultation, incentive proposal, or regulatory reform',
    tone: 'formal-government',
    audience: 'government-officials',
    length: 'standard',
    keyFocus: 'evidence-based policy recommendations with international benchmark comparisons',
    complianceFramework: ['government-consultation-protocol', 'regulatory-impact-assessment'],
    sections: [
      { id: 'gov-summary', title: 'Executive Summary', promptInstruction: 'Summarise the submission: what is proposed, why it matters, what evidence supports it. Keep to 1 page maximum.', maxWords: 500, required: true, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { id: 'gov-context', title: 'Policy Context', promptInstruction: 'Describe the current policy landscape, existing challenges, and the gap this submission addresses. Use compliance framework for current regulatory analysis.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { id: 'gov-evidence', title: 'Evidence Base', promptInstruction: 'Present international evidence: what have other jurisdictions done? What were the outcomes? Use historical parallels and pattern data.', maxWords: 1200, required: true, intelligencePriority: ['historicalParallels', 'patterns', 'crossDomain'] },
      { id: 'gov-recommendations', title: 'Recommendations', promptInstruction: 'Provide specific, actionable policy recommendations. For each, include: expected impact, implementation complexity, fiscal implications, and international precedent.', maxWords: 1000, required: true, intelligencePriority: ['formulaScores', 'creativeStrategies'] },
      { id: 'gov-impact', title: 'Impact Assessment', promptInstruction: 'Projected economic, social, and environmental impacts of the proposed policy changes. Use ethical assessment for distributive justice analysis.', maxWords: 800, required: true, intelligencePriority: ['ethicalAssessment', 'formulaScores'] },
    ]
  },
  {
    id: 'international-body-application',
    name: 'International Body Funding Application',
    category: 'International Body Applications',
    description: 'Funding application for World Bank, ADB, GCF, or other international development finance institution',
    tone: 'formal-government',
    audience: 'international-bodies',
    length: 'comprehensive',
    keyFocus: 'impact-focused proposal meeting DFI appraisal standards',
    complianceFramework: ['World-Bank-ESF', 'IFC-Performance-Standards', 'GCF-standards'],
    sections: [
      { id: 'intl-summary', title: 'Project Summary', promptInstruction: 'Project title, requesting entity, country, sector, requested amount, co-financing, implementation period. Following DFI standard format.', maxWords: 400, required: true, intelligencePriority: ['compliance'] },
      { id: 'intl-rationale', title: 'Development Rationale', promptInstruction: 'Why this project matters for development. SDG alignment. National development plan alignment. Use compliance framework for country context.', maxWords: 1000, required: true, intelligencePriority: ['compliance', 'ethicalAssessment', 'situationAnalysis'] },
      { id: 'intl-design', title: 'Project Design', promptInstruction: 'Components, activities, outputs, outcomes, and impact pathway. Logical framework. Theory of change. Use creative strategies for innovative design elements.', maxWords: 1500, required: true, intelligencePriority: ['creativeStrategies', 'historicalParallels'] },
      { id: 'intl-financial', title: 'Financial Plan', promptInstruction: 'Detailed budget, financing plan, economic analysis (ERR/IRR), fiscal sustainability. Use formula scores for financial projections.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'intl-safeguards', title: 'Environmental & Social Safeguards', promptInstruction: 'Safeguard categorisation (A/B/C), applicable standards, ESIA summary, stakeholder engagement plan, grievance mechanism. Reference specific DFI standards.', maxWords: 1200, required: true, intelligencePriority: ['ethicalAssessment', 'compliance'] },
      { id: 'intl-implementation', title: 'Implementation Arrangements', promptInstruction: 'Institutional framework, procurement plan, disbursement schedule, monitoring & evaluation, reporting requirements.', maxWords: 1000, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
      { id: 'intl-risk', title: 'Risk Assessment', promptInstruction: 'Project risks & mitigations; institutional capacity risks; fiduciary risks; safeguard risks. Risk matrix with likelihood and impact.', maxWords: 800, required: true, intelligencePriority: ['situationAnalysis', 'formulaScores'] },
      { id: 'intl-sustainability', title: 'Sustainability & Exit Strategy', promptInstruction: 'How will project benefits be sustained after funding ends? Institutional sustainability, financial sustainability, environmental sustainability.', maxWords: 600, required: true, intelligencePriority: ['ethicalAssessment', 'patterns'] },
    ]
  },
  {
    id: 'due-diligence-report',
    name: 'Due Diligence Report',
    category: 'Due Diligence',
    description: 'Comprehensive due diligence assessment for investment, acquisition, or partnership',
    tone: 'technical-analytical',
    audience: 'legal-counsel',
    length: 'comprehensive',
    keyFocus: 'thorough risk identification and verification with actionable findings',
    complianceFramework: ['AML-KYC', 'anti-bribery', 'sanctions-compliance'],
    sections: [
      { id: 'dd-scope', title: 'Scope & Methodology', promptInstruction: 'Define due diligence scope, information sources, limitations, and analytical approach. State what was included and excluded.', maxWords: 500, required: true, intelligencePriority: ['patterns'] },
      { id: 'dd-entity', title: 'Entity & Ownership Review', promptInstruction: 'Corporate structure, beneficial ownership, related parties, litigation history, regulatory standing. Use input shield data for sanctions/fraud checks.', maxWords: 1000, required: true, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { id: 'dd-financial', title: 'Financial Due Diligence', promptInstruction: 'Revenue quality, profitability drivers, working capital analysis, debt profile, tax compliance. Use formula scores for financial health assessment.', maxWords: 1500, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'dd-legal', title: 'Legal & Regulatory Review', promptInstruction: 'Licences, permits, contracts, IP, employment compliance, environmental compliance, pending litigation. Use compliance framework for regulatory mapping.', maxWords: 1200, required: true, intelligencePriority: ['compliance'] },
      { id: 'dd-operational', title: 'Operational Assessment', promptInstruction: 'Operations review, technology stack, supply chain, human resources, management capability. Reference historical parallels for operational benchmarking.', maxWords: 1000, required: true, intelligencePriority: ['historicalParallels', 'crossDomain'] },
      { id: 'dd-commercial', title: 'Commercial Due Diligence', promptInstruction: 'Market position, competitive dynamics, customer concentration, growth trajectory. Use pattern analysis for market sizing and trend assessment.', maxWords: 1000, required: true, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { id: 'dd-esg', title: 'ESG Due Diligence', promptInstruction: 'Environmental liabilities, social licence, governance quality, anti-corruption compliance. Use ethical assessment dimensions for comprehensive ESG scoring.', maxWords: 800, required: true, intelligencePriority: ['ethicalAssessment'] },
      { id: 'dd-findings', title: 'Key Findings & Red Flags', promptInstruction: 'Prioritised findings: deal-breakers (red), significant concerns (amber), minor issues (yellow), clear areas (green). Each with recommended action.', maxWords: 1000, required: true, intelligencePriority: ['situationAnalysis', 'ethicalAssessment'] },
    ]
  },
  {
    id: 'sez-development-plan',
    name: 'Special Economic Zone Development Plan',
    category: 'Strategic',
    description: 'Master plan for Special Economic Zone or Industrial Park development',
    tone: 'formal-government',
    audience: 'government-officials',
    length: 'comprehensive',
    keyFocus: 'evidence-based zone design with international best practice benchmarking',
    complianceFramework: ['UNCTAD-SEZ-guidelines', 'World-Bank-zone-performance'],
    sections: [
      { id: 'sez-rationale', title: 'Strategic Rationale', promptInstruction: 'Why an SEZ? What problem does it solve? What international evidence supports the approach? Use pattern data (SEZ 63-year track record) and historical parallels (Shenzhen, PEZA, Dubai).', maxWords: 1200, required: true, intelligencePriority: ['patterns', 'historicalParallels'] },
      { id: 'sez-location', title: 'Location Analysis', promptInstruction: 'Site selection criteria, infrastructure assessment, connectivity analysis, labour market proximity. Use compliance framework for local requirements.', maxWords: 1000, required: true, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { id: 'sez-sectors', title: 'Target Sectors & Tenants', promptInstruction: 'Which sectors to target, what anchor tenants to attract, how to build cluster effects. Use cross-domain insights for innovative sector combinations.', maxWords: 1200, required: true, intelligencePriority: ['crossDomain', 'creativeStrategies', 'patterns'] },
      { id: 'sez-incentives', title: 'Incentive Design', promptInstruction: 'Tax incentives, customs benefits, regulatory facilitation. Benchmark against competitor zones. Use compliance data for incentive comparison.', maxWords: 1000, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
      { id: 'sez-governance', title: 'Governance & Institutional Framework', promptInstruction: 'Zone authority structure, one-stop-shop design, regulatory autonomy, private sector participation models.', maxWords: 800, required: true, intelligencePriority: ['historicalParallels', 'compliance'] },
      { id: 'sez-financial', title: 'Financial Model', promptInstruction: 'Development costs, revenue model, IRR/NPV analysis, funding structure (government/private/DFI). Use formula scores.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'sez-social', title: 'Social & Environmental Impact', promptInstruction: 'Community impact, employment projections, environmental management, resettlement (if any). Use ethical assessment.', maxWords: 800, required: true, intelligencePriority: ['ethicalAssessment', 'emotionalClimate'] },
      { id: 'sez-implementation', title: 'Implementation Roadmap', promptInstruction: 'Phase 1-3 timeline, milestones, institutional setup sequence, early wins strategy.', maxWords: 1000, required: true, intelligencePriority: ['historicalParallels', 'compliance'] },
    ]
  },
  {
    id: 'community-impact-assessment',
    name: 'Community Impact Assessment',
    category: 'Community & Social Impact',
    description: 'Assessment of project impact on local communities, including benefit-sharing and mitigation',
    tone: 'community-engagement',
    audience: 'community-stakeholders',
    length: 'standard',
    keyFocus: 'genuine community impact with transparent benefit-sharing and grievance mechanisms',
    complianceFramework: ['IFC-PS5-land-acquisition', 'IFC-PS7-indigenous-peoples', 'FPIC'],
    sections: [
      { id: 'cia-context', title: 'Community Context', promptInstruction: 'Describe the affected communities: demographics, livelihoods, cultural significance, existing vulnerabilities. Use emotional climate analysis for community sentiment.', maxWords: 800, required: true, intelligencePriority: ['emotionalClimate', 'situationAnalysis'] },
      { id: 'cia-impacts', title: 'Impact Analysis', promptInstruction: 'Positive and negative impacts on livelihoods, health, education, culture, environment, social cohesion. Use ethical assessment (Rawlsian fairness) for distributive analysis.', maxWords: 1200, required: true, intelligencePriority: ['ethicalAssessment', 'situationAnalysis'] },
      { id: 'cia-benefits', title: 'Benefit-Sharing Framework', promptInstruction: 'How will benefits be shared with affected communities? Employment, procurement, revenue sharing, social infrastructure. Use creative strategies for innovative benefit models.', maxWords: 800, required: true, intelligencePriority: ['creativeStrategies', 'ethicalAssessment'] },
      { id: 'cia-mitigation', title: 'Impact Mitigation Plan', promptInstruction: 'Specific mitigation measures for each negative impact. Compensation framework. Livelihood restoration plan.', maxWords: 800, required: true, intelligencePriority: ['ethicalAssessment', 'historicalParallels'] },
      { id: 'cia-engagement', title: 'Stakeholder Engagement Plan', promptInstruction: 'How communities will be consulted throughout the project lifecycle. FPIC requirements. Grievance mechanism.', maxWords: 600, required: true, intelligencePriority: ['emotionalClimate', 'compliance'] },
    ]
  },

  // ── FOUNDATION & LEGAL ──────────────────────────────────────────────────
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    category: 'Foundation & Legal',
    description: 'Mutual or one-way confidentiality agreement protecting proprietary information',
    tone: 'formal-corporate',
    audience: 'legal-counsel',
    length: 'brief',
    keyFocus: 'clear confidentiality obligations with appropriate scope and remedies',
    complianceFramework: ['contract-law', 'IP-protection'],
    sections: [
      { id: 'nda-parties', title: 'Parties & Recitals', promptInstruction: 'Identify the disclosing and receiving parties. State the purpose of disclosure and the context of the business relationship.', maxWords: 400, required: true, intelligencePriority: ['compliance'] },
      { id: 'nda-scope', title: 'Definition of Confidential Information', promptInstruction: 'Define what constitutes confidential information comprehensively - documents, data, trade secrets, strategies, financial information. Include exclusions (public domain, independently developed, legally required).', maxWords: 600, required: true, intelligencePriority: ['compliance'] },
      { id: 'nda-obligations', title: 'Obligations & Restrictions', promptInstruction: 'Specify obligations of the receiving party: non-disclosure, restricted use, need-to-know basis, return/destruction of materials. Include non-solicitation if applicable.', maxWords: 500, required: true, intelligencePriority: ['compliance'] },
      { id: 'nda-term', title: 'Term, Remedies & Governing Law', promptInstruction: 'Set confidentiality period (typically 2-5 years). Specify injunctive relief, indemnification, governing law, and dispute resolution. Reference jurisdiction-specific enforcement patterns.', maxWords: 400, required: true, intelligencePriority: ['compliance', 'situationAnalysis'] },
    ]
  },
  {
    id: 'mou',
    name: 'Memorandum of Understanding',
    category: 'Foundation & Legal',
    description: 'Framework agreement establishing principles of cooperation before detailed agreements',
    tone: 'formal-government',
    audience: 'government-officials',
    length: 'standard',
    keyFocus: 'clear mutual commitments with appropriate governance and review mechanisms',
    complianceFramework: ['government-mou-protocol', 'international-agreements'],
    sections: [
      { id: 'mou-preamble', title: 'Preamble & Background', promptInstruction: 'State the parties, their respective mandates, and the strategic rationale for this cooperation. Reference historical ties or strategic alignment.', maxWords: 500, required: true, intelligencePriority: ['situationAnalysis', 'historicalParallels'] },
      { id: 'mou-scope', title: 'Scope & Objectives', promptInstruction: 'Define the areas of cooperation, specific objectives, expected outcomes, and exclusions. Be precise about what is and is not covered.', maxWords: 600, required: true, intelligencePriority: ['patterns', 'creativeStrategies'] },
      { id: 'mou-commitments', title: 'Respective Commitments', promptInstruction: 'Detail what each party commits to contribute: resources, expertise, access, funding, personnel. Ensure balanced obligations.', maxWords: 600, required: true, intelligencePriority: ['ethicalAssessment', 'formulaScores'] },
      { id: 'mou-governance', title: 'Governance & Implementation', promptInstruction: 'Establish joint committee structure, meeting frequency, reporting lines, decision-making process, and escalation mechanism.', maxWords: 500, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
      { id: 'mou-term', title: 'Duration, Review & Status', promptInstruction: 'Set MoU term (typically 2-5 years), renewal provisions, review schedule, and amendment process. Clearly state non-binding/binding status of each clause.', maxWords: 400, required: true, intelligencePriority: ['compliance'] },
    ]
  },
  {
    id: 'term-sheet',
    name: 'Term Sheet',
    category: 'Foundation & Legal',
    description: 'Summary of key commercial terms for an investment, acquisition, or partnership',
    tone: 'formal-corporate',
    audience: 'investors',
    length: 'brief',
    keyFocus: 'clear, negotiable term summaries with market-standard structures',
    complianceFramework: ['securities-regulations', 'investment-terms'],
    sections: [
      { id: 'ts-overview', title: 'Transaction Overview', promptInstruction: 'Summarise the transaction: type (equity, debt, JV), parties, target entity/project, proposed timeline. State indicative valuation or deal size.', maxWords: 400, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'ts-economics', title: 'Economic Terms', promptInstruction: 'Detail investment amount, equity stake, valuation methodology, pricing mechanism, anti-dilution, liquidation preference, dividend rights. Use formula scores.', maxWords: 600, required: true, intelligencePriority: ['formulaScores', 'patterns'] },
      { id: 'ts-governance', title: 'Governance & Control', promptInstruction: 'Board composition, voting rights, reserved matters, information rights, tag/drag along, ROFR/ROFO provisions.', maxWords: 500, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
      { id: 'ts-conditions', title: 'Conditions & Closing', promptInstruction: 'Conditions precedent (DD, regulatory approvals, third-party consents), exclusivity period, break fees, confidentiality, governing law.', maxWords: 400, required: true, intelligencePriority: ['compliance'] },
    ]
  },

  // ── FINANCIAL & INVESTMENT ──────────────────────────────────────────────
  {
    id: 'financial-model',
    name: 'Financial Model & Projections Report',
    category: 'Financial & Investment',
    description: 'Comprehensive financial projections with revenue model, costs, cash flows, and valuation',
    tone: 'technical-analytical',
    audience: 'investors',
    length: 'comprehensive',
    keyFocus: 'rigorous financial analysis with transparent assumptions and scenario modelling',
    complianceFramework: ['IFRS', 'investment-appraisal-standards'],
    sections: [
      { id: 'fm-assumptions', title: 'Key Assumptions', promptInstruction: 'State all assumptions clearly: macro assumptions (GDP, inflation, FX), market assumptions (TAM growth, penetration), operational assumptions (capacity, utilisation, headcount). Use compliance data for market benchmarks.', maxWords: 1000, required: true, intelligencePriority: ['patterns', 'compliance'] },
      { id: 'fm-revenue', title: 'Revenue Model', promptInstruction: 'Build bottom-up revenue model: units × price, customer acquisition, churn, upsell. Show 5-year monthly/annual projections. Use pattern data for market sizing.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores', 'patterns'] },
      { id: 'fm-costs', title: 'Cost Structure & CAPEX', promptInstruction: 'Detail operating costs (COGS, SGA, R&D), capital expenditure, working capital needs. Show unit economics and margin trajectory. Reference comparable operations.', maxWords: 1000, required: true, intelligencePriority: ['historicalParallels', 'formulaScores'] },
      { id: 'fm-cashflow', title: 'Cash Flow & Valuation', promptInstruction: 'Present FCF projections, WACC calculation, DCF valuation with terminal value. Include IRR, NPV, payback period, MOIC. Use NSIL formula scores.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'fm-scenarios', title: 'Sensitivity & Scenario Analysis', promptInstruction: 'Run bull/base/bear scenarios. Sensitivity tables for key variables (price, volume, FX, cost). Monte Carlo if data supports it. Identify breakeven conditions.', maxWords: 1000, required: true, intelligencePriority: ['formulaScores', 'situationAnalysis'] },
    ]
  },
  {
    id: 'investment-memo',
    name: 'Investment Memorandum',
    category: 'Financial & Investment',
    description: 'Complete investment justification for investment committee or board approval',
    tone: 'persuasive-investment',
    audience: 'investors',
    length: 'comprehensive',
    keyFocus: 'compelling investment thesis backed by rigorous analysis and due diligence',
    complianceFramework: ['securities-regulations-disclaimer', 'fiduciary-duty'],
    sections: [
      { id: 'im-thesis', title: 'Investment Thesis', promptInstruction: 'State the thesis clearly in 2-3 sentences. Why now? Why this asset/company? What is the edge? Use pattern matching and cross-domain insights.', maxWords: 600, required: true, intelligencePriority: ['patterns', 'crossDomain', 'historicalParallels'] },
      { id: 'im-market', title: 'Market Opportunity', promptInstruction: 'Quantify TAM/SAM/SOM. Growth drivers, secular trends, regulatory tailwinds. Competitive landscape. Use pattern data for market sizing.', maxWords: 1000, required: true, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { id: 'im-business', title: 'Business Overview', promptInstruction: 'Company/project description, products/services, business model, competitive advantages (moat), management team, track record.', maxWords: 1000, required: true, intelligencePriority: ['situationAnalysis', 'historicalParallels'] },
      { id: 'im-financials', title: 'Financial Analysis', promptInstruction: 'Historical financials (3yr), projections (5yr), unit economics, capital efficiency, return profile (IRR/MOIC). Use formula scores.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'im-risks', title: 'Risks & Mitigations', promptInstruction: 'Key risks: market, execution, regulatory, financial, ESG. For each, specific mitigation. Use ethical assessment and situational analysis.', maxWords: 800, required: true, intelligencePriority: ['ethicalAssessment', 'situationAnalysis'] },
      { id: 'im-terms', title: 'Proposed Terms & Recommendation', promptInstruction: 'Entry valuation, structure, governance rights, exit timeline. Clear GO/CONDITIONAL/NO-GO recommendation with conditions.', maxWords: 600, required: true, intelligencePriority: ['formulaScores', 'compliance'] },
    ]
  },
  {
    id: 'valuation-report',
    name: 'Valuation Report',
    category: 'Financial & Investment',
    description: 'Independent valuation assessment using multiple methodologies',
    tone: 'technical-analytical',
    audience: 'investors',
    length: 'standard',
    keyFocus: 'defensible valuation using multiple approaches with clear methodology disclosure',
    complianceFramework: ['IVSC-standards', 'IFRS-13-fair-value'],
    sections: [
      { id: 'val-scope', title: 'Scope & Methodology', promptInstruction: 'Define valuation purpose, effective date, standard of value, premise of value. List methodologies: DCF, comparable companies, precedent transactions, asset-based.', maxWords: 500, required: true, intelligencePriority: ['compliance'] },
      { id: 'val-business', title: 'Business & Industry Overview', promptInstruction: 'Describe the entity, its market position, competitive dynamics, growth trajectory. Use pattern data for industry context.', maxWords: 800, required: true, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { id: 'val-dcf', title: 'Discounted Cash Flow Analysis', promptInstruction: 'Build DCF model: revenue projections, margin assumptions, CAPEX, working capital, WACC, terminal value (Gordon growth or exit multiple). Present sensitivity tables.', maxWords: 1200, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'val-comps', title: 'Comparable Analysis', promptInstruction: 'Identify comparable companies and precedent transactions. Apply relevant multiples (EV/EBITDA, P/E, EV/Revenue). Adjust for size, growth, risk. Present football field chart.', maxWords: 1000, required: true, intelligencePriority: ['historicalParallels', 'patterns'] },
      { id: 'val-conclusion', title: 'Valuation Conclusion', promptInstruction: 'Triangulate across methodologies. Present valuation range with weighting. State key sensitivities and caveats. Provide final opinion.', maxWords: 600, required: true, intelligencePriority: ['formulaScores', 'ethicalAssessment'] },
    ]
  },

  // ── TRADE & COMMERCE ──────────────────────────────────────────────────
  {
    id: 'export-plan',
    name: 'Export Strategy & Plan',
    category: 'Trade & Commerce',
    description: 'Comprehensive export strategy covering markets, logistics, compliance, and financing',
    tone: 'formal-corporate',
    audience: 'board-directors',
    length: 'standard',
    keyFocus: 'actionable export strategy with regulatory compliance and logistics planning',
    complianceFramework: ['export-controls', 'customs-regulations', 'Incoterms-2020'],
    sections: [
      { id: 'exp-market', title: 'Target Market Selection', promptInstruction: 'Rank and analyse target export markets by attractiveness: demand, barriers, competition, logistics cost, regulatory requirements. Use pattern data for trade flow analysis.', maxWords: 1000, required: true, intelligencePriority: ['patterns', 'compliance', 'situationAnalysis'] },
      { id: 'exp-compliance', title: 'Trade Compliance & Regulatory', promptInstruction: 'Map export controls, licensing requirements, sanctions considerations, customs duties, FTA preferences, certificate of origin requirements. Use compliance framework data.', maxWords: 800, required: true, intelligencePriority: ['compliance'] },
      { id: 'exp-logistics', title: 'Logistics & Distribution', promptInstruction: 'Define supply chain: manufacturing, warehousing, shipping routes, Incoterms, insurance, distribution channels. Identify logistics risks.', maxWords: 800, required: true, intelligencePriority: ['crossDomain', 'historicalParallels'] },
      { id: 'exp-financial', title: 'Export Financing & Pricing', promptInstruction: 'Export credit, letters of credit, trade finance instruments, currency risk management, pricing strategy for each market. Use formula scores for financial projections.', maxWords: 800, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'exp-implementation', title: 'Implementation Timeline', promptInstruction: 'Phase 1-3 rollout plan with milestones, resource needs, partner requirements, and KPIs.', maxWords: 600, required: true, intelligencePriority: ['historicalParallels'] },
    ]
  },
  {
    id: 'trade-compliance',
    name: 'Trade Compliance Assessment',
    category: 'Trade & Commerce',
    description: 'Assessment of export control, sanctions, customs compliance posture',
    tone: 'technical-analytical',
    audience: 'legal-counsel',
    length: 'standard',
    keyFocus: 'thorough compliance review with specific remediation actions',
    complianceFramework: ['EAR', 'ITAR', 'EU-dual-use', 'sanctions-OFAC-EU-UN'],
    sections: [
      { id: 'tc-scope', title: 'Compliance Scope & Methodology', promptInstruction: 'Define the scope: export controls, sanctions, customs, anti-boycott, anti-corruption. Describe assessment methodology and standards applied.', maxWords: 400, required: true, intelligencePriority: ['compliance'] },
      { id: 'tc-classification', title: 'Product & Technology Classification', promptInstruction: 'Classify products/technologies under applicable export control regimes (ECCN, ML, Wassenaar). Identify controlled items and licensing requirements.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { id: 'tc-sanctions', title: 'Sanctions & Restricted Parties', promptInstruction: 'Screen all counterparties against OFAC SDN, EU sanctions, UN sanctions, other applicable lists. Identify any PEP connections or high-risk jurisdictions.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'ethicalAssessment'] },
      { id: 'tc-gaps', title: 'Gap Analysis & Remediation', promptInstruction: 'Identify compliance gaps, control weaknesses, and risk areas. Provide specific remediation actions with priority and timeline.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
    ]
  },

  // ── MARKET INTELLIGENCE ──────────────────────────────────────────────────
  {
    id: 'dossier',
    name: 'Comprehensive Market Dossier',
    category: 'Market Intelligence',
    description: 'Complete intelligence package covering market dynamics, competitors, partners, and entry strategy',
    tone: 'technical-analytical',
    audience: 'board-directors',
    length: 'comprehensive',
    keyFocus: 'actionable intelligence with evidence-based insights and strategic implications',
    complianceFramework: ['competitive-intelligence-ethics'],
    sections: [
      { id: 'dos-exec', title: 'Executive Intelligence Summary', promptInstruction: 'Synthesise the key intelligence findings in 1-2 pages. What does the decision-maker need to know? Use all intelligence dimensions.', maxWords: 800, required: true, intelligencePriority: ['patterns', 'situationAnalysis', 'formulaScores'] },
      { id: 'dos-market', title: 'Market Dynamics', promptInstruction: 'Market size (TAM/SAM/SOM), growth trajectory, demand drivers, supply dynamics, pricing trends, regulatory environment. Use pattern data for market intelligence.', maxWords: 1500, required: true, intelligencePriority: ['patterns', 'historicalParallels'] },
      { id: 'dos-competitive', title: 'Competitive Landscape', promptInstruction: 'Map all competitors: direct, indirect, potential entrants. Market share, strategies, strengths/weaknesses. Competitive positioning analysis.', maxWords: 1200, required: true, intelligencePriority: ['patterns', 'crossDomain'] },
      { id: 'dos-partners', title: 'Potential Partners & Stakeholders', promptInstruction: 'Identify and profile potential partners, JV candidates, local allies. Assess alignment, capability, reputation. Use ethical assessment for partner integrity.', maxWords: 1000, required: true, intelligencePriority: ['ethicalAssessment', 'situationAnalysis'] },
      { id: 'dos-regulatory', title: 'Regulatory & Political Intelligence', promptInstruction: 'Map the regulatory landscape, political dynamics, key decision-makers, policy direction. Use compliance framework for regulatory mapping.', maxWords: 1000, required: true, intelligencePriority: ['compliance', 'emotionalClimate'] },
      { id: 'dos-risk', title: 'Risk Assessment & Mitigations', promptInstruction: 'Country risk, market risk, operational risk, regulatory risk. Quantified risk matrix with specific mitigations.', maxWords: 800, required: true, intelligencePriority: ['situationAnalysis', 'formulaScores'] },
      { id: 'dos-strategy', title: 'Strategic Recommendations', promptInstruction: 'Recommend entry strategy, timing, structure, partners, and phasing. Reference creative strategies and cross-domain innovations.', maxWords: 800, required: true, intelligencePriority: ['creativeStrategies', 'crossDomain'] },
    ]
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Intelligence Report',
    category: 'Market Intelligence',
    description: 'Deep competitive analysis with market positioning, strengths/weaknesses, and strategic implications',
    tone: 'technical-analytical',
    audience: 'board-directors',
    length: 'standard',
    keyFocus: 'actionable competitive insights for strategic positioning',
    complianceFramework: ['competitive-intelligence-ethics'],
    sections: [
      { id: 'ci-landscape', title: 'Competitive Landscape Overview', promptInstruction: 'Map the full competitive landscape: direct competitors, indirect competitors, potential entrants, substitutes. Market concentration and trends.', maxWords: 1000, required: true, intelligencePriority: ['patterns'] },
      { id: 'ci-profiles', title: 'Key Competitor Profiles', promptInstruction: 'Profile top 5-8 competitors: strategy, capabilities, market share, financial position, recent moves, strengths/weaknesses. Use cross-domain data.', maxWords: 1500, required: true, intelligencePriority: ['patterns', 'crossDomain', 'historicalParallels'] },
      { id: 'ci-positioning', title: 'Competitive Positioning Analysis', promptInstruction: 'Map competitive positions on key dimensions. Identify white space opportunities. Porter Five Forces analysis. Value chain comparison.', maxWords: 1000, required: true, intelligencePriority: ['creativeStrategies', 'patterns'] },
      { id: 'ci-implications', title: 'Strategic Implications', promptInstruction: 'What does this competitive landscape mean for our strategy? Where to compete, how to differentiate, what capabilities to build.', maxWords: 800, required: true, intelligencePriority: ['creativeStrategies', 'crossDomain'] },
    ]
  },

  // ── OPERATIONAL ──────────────────────────────────────────────────────────
  {
    id: 'project-charter',
    name: 'Project Charter',
    category: 'Operational',
    description: 'Formal authorization document defining project scope, objectives, and governance',
    tone: 'formal-corporate',
    audience: 'board-directors',
    length: 'standard',
    keyFocus: 'clear scope, deliverables, and governance with realistic timeline and resources',
    complianceFramework: ['PMI-PMBOK', 'PRINCE2'],
    sections: [
      { id: 'pc-purpose', title: 'Project Purpose & Business Case', promptInstruction: 'Define the strategic rationale, expected benefits (quantified), alignment with organisational strategy. Reference formula scores for ROI justification.', maxWords: 600, required: true, intelligencePriority: ['formulaScores', 'patterns'] },
      { id: 'pc-scope', title: 'Scope, Deliverables & Exclusions', promptInstruction: 'Define in-scope deliverables, out-of-scope items, success criteria, acceptance criteria. Be specific and measurable.', maxWords: 800, required: true, intelligencePriority: ['situationAnalysis'] },
      { id: 'pc-governance', title: 'Governance & Stakeholders', promptInstruction: 'Project sponsor, steering committee, project manager, key stakeholders, RACI matrix, escalation procedures, reporting cadence.', maxWords: 600, required: true, intelligencePriority: ['compliance'] },
      { id: 'pc-plan', title: 'Timeline, Resources & Budget', promptInstruction: 'Phase-gate timeline, key milestones, resource requirements (people, budget, equipment), critical dependencies. Realistic based on historical parallels.', maxWords: 800, required: true, intelligencePriority: ['historicalParallels', 'formulaScores'] },
      { id: 'pc-risks', title: 'Risks, Assumptions & Constraints', promptInstruction: 'Top 10 risks with likelihood/impact, key assumptions, constraints (budget, time, regulatory). Mitigation strategies for critical risks.', maxWords: 600, required: true, intelligencePriority: ['situationAnalysis', 'ethicalAssessment'] },
    ]
  },
  {
    id: 'implementation-plan',
    name: 'Implementation Roadmap',
    category: 'Operational',
    description: 'Detailed execution plan with phases, milestones, dependencies, and resource allocation',
    tone: 'formal-corporate',
    audience: 'technical-team',
    length: 'comprehensive',
    keyFocus: 'actionable implementation detail with clear accountability and progress tracking',
    complianceFramework: ['PMI-PMBOK', 'agile-frameworks'],
    sections: [
      { id: 'impl-overview', title: 'Implementation Overview', promptInstruction: 'Summarise the implementation approach, methodology (agile/waterfall/hybrid), key principles, critical success factors. Reference what has worked in similar implementations.', maxWords: 600, required: true, intelligencePriority: ['historicalParallels'] },
      { id: 'impl-phases', title: 'Phase Plan & Milestones', promptInstruction: 'Detail each implementation phase: objectives, activities, deliverables, exit criteria. Include go/no-go decision gates. Realistic timelines based on parallels.', maxWords: 1500, required: true, intelligencePriority: ['historicalParallels', 'compliance'] },
      { id: 'impl-resources', title: 'Resource Plan', promptInstruction: 'People (roles, FTEs, skills), budget allocation per phase, technology/infrastructure requirements, third-party dependencies.', maxWords: 800, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'impl-dependencies', title: 'Dependencies & Critical Path', promptInstruction: 'Map all dependencies (internal, external, regulatory). Identify the critical path. Define contingency plans for critical-path delays.', maxWords: 600, required: true, intelligencePriority: ['situationAnalysis'] },
      { id: 'impl-monitoring', title: 'Monitoring & Reporting', promptInstruction: 'KPIs, reporting cadence, dashboards, earned value metrics, change management procedures, lessons learned framework.', maxWords: 600, required: true, intelligencePriority: ['compliance'] },
    ]
  },

  // ── COMMUNICATIONS & IR ──────────────────────────────────────────────────
  {
    id: 'press-release',
    name: 'Press Release',
    category: 'Communications & IR',
    description: 'Media announcement for significant business developments, partnerships, or milestones',
    tone: 'formal-corporate',
    audience: 'general-public',
    length: 'brief',
    keyFocus: 'newsworthy angle with quotable statements and clear facts',
    complianceFramework: ['media-regulations', 'securities-fair-disclosure'],
    sections: [
      { id: 'pr-headline', title: 'Headline & Lead', promptInstruction: 'Write a compelling headline and opening paragraph that answers who/what/when/where/why. Lead with the most newsworthy angle.', maxWords: 200, required: true, intelligencePriority: ['situationAnalysis'] },
      { id: 'pr-body', title: 'Body & Context', promptInstruction: 'Expand on the announcement with supporting details, context, market significance. Include 1-2 executive quotes. Use pattern data for market context.', maxWords: 500, required: true, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { id: 'pr-about', title: 'Background & Boilerplate', promptInstruction: 'Company description, relevant background, scale/impact figures. Standard boilerplate with forward-looking statement disclaimer if applicable.', maxWords: 300, required: true, intelligencePriority: ['compliance'] },
    ]
  },
  {
    id: 'annual-report',
    name: 'Annual Report',
    category: 'Communications & IR',
    description: 'Comprehensive annual review covering performance, strategy, governance, and outlook',
    tone: 'formal-corporate',
    audience: 'investors',
    length: 'comprehensive',
    keyFocus: 'transparent performance disclosure with forward-looking strategy',
    complianceFramework: ['IFRS-reporting', 'corporate-governance-code', 'ESG-disclosure'],
    sections: [
      { id: 'ar-chairman', title: "Chairman's Statement", promptInstruction: 'Reflect on the year: achievements, challenges, strategic direction, outlook. Tone should be authoritative yet accessible. Reference key metrics.', maxWords: 800, required: true, intelligencePriority: ['situationAnalysis', 'emotionalClimate'] },
      { id: 'ar-performance', title: 'Performance Review', promptInstruction: 'Financial performance: revenue, EBITDA, net income, cash flow. Operating highlights by segment. KPI dashboard. Year-over-year comparison.', maxWords: 1500, required: true, intelligencePriority: ['formulaScores', 'patterns'] },
      { id: 'ar-strategy', title: 'Strategy & Outlook', promptInstruction: 'Strategic priorities, market opportunities, investment plans, growth initiatives. 3-year outlook with key targets. Use pattern data for market trends.', maxWords: 1200, required: true, intelligencePriority: ['patterns', 'creativeStrategies'] },
      { id: 'ar-governance', title: 'Governance & Risk', promptInstruction: 'Board composition, governance framework, risk management approach, compliance status. Reference applicable governance codes.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'ethicalAssessment'] },
      { id: 'ar-esg', title: 'ESG & Community Impact', promptInstruction: 'Environmental metrics, social initiatives, community impact, diversity, safety. SDG alignment. Use ethical assessment data.', maxWords: 800, required: true, intelligencePriority: ['ethicalAssessment', 'emotionalClimate'] },
    ]
  },

  // ── ESG & SUSTAINABILITY ──────────────────────────────────────────────────
  {
    id: 'esg-report',
    name: 'ESG Assessment Report',
    category: 'ESG & Sustainability',
    description: 'Comprehensive Environmental, Social, and Governance assessment and disclosure',
    tone: 'technical-analytical',
    audience: 'investors',
    length: 'comprehensive',
    keyFocus: 'transparent ESG disclosure with quantified metrics and improvement roadmap',
    complianceFramework: ['GRI-standards', 'TCFD', 'SASB', 'UN-Global-Compact'],
    sections: [
      { id: 'esg-exec', title: 'ESG Executive Summary', promptInstruction: 'Summarise overall ESG performance, material topics, key metrics, and strategic ESG priorities. SDG alignment summary.', maxWords: 600, required: true, intelligencePriority: ['ethicalAssessment'] },
      { id: 'esg-env', title: 'Environmental Assessment', promptInstruction: 'Climate risk (TCFD-aligned), GHG emissions (Scope 1/2/3), energy usage, water, waste, biodiversity. Net zero progress. Use compliance data for standards alignment.', maxWords: 1200, required: true, intelligencePriority: ['ethicalAssessment', 'compliance', 'patterns'] },
      { id: 'esg-social', title: 'Social Assessment', promptInstruction: 'Labour practices, health & safety, diversity & inclusion, community impact, human rights, supply chain labour. Use emotional climate for stakeholder sentiment analysis.', maxWords: 1200, required: true, intelligencePriority: ['ethicalAssessment', 'emotionalClimate'] },
      { id: 'esg-gov', title: 'Governance Assessment', promptInstruction: 'Board effectiveness, executive compensation, ethics & anti-corruption, transparency, risk oversight, shareholder rights.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'ethicalAssessment'] },
      { id: 'esg-roadmap', title: 'ESG Improvement Roadmap', promptInstruction: 'Priority areas for improvement, targets (with timelines), investment needed, expected outcomes. Reference best practices from comparable companies.', maxWords: 800, required: true, intelligencePriority: ['historicalParallels', 'creativeStrategies'] },
    ]
  },

  // ── HUMAN CAPITAL ──────────────────────────────────────────────────────
  {
    id: 'talent-gap-analysis',
    name: 'Talent Gap Analysis',
    category: 'Human Capital',
    description: 'Assessment of current vs required organisational capabilities with development plan',
    tone: 'technical-analytical',
    audience: 'board-directors',
    length: 'standard',
    keyFocus: 'evidence-based capability gaps with actionable talent strategies',
    complianceFramework: ['labour-law', 'skills-framework'],
    sections: [
      { id: 'tga-current', title: 'Current Capability Assessment', promptInstruction: 'Map current organisational capabilities: technical skills, leadership depth, functional expertise, cultural competencies. Identify strengths and concentrations of risk.', maxWords: 800, required: true, intelligencePriority: ['situationAnalysis'] },
      { id: 'tga-required', title: 'Future Capability Requirements', promptInstruction: 'Define capabilities needed for strategic objectives: new skills, leadership roles, specialist functions, digital competencies. Reference industry benchmarks.', maxWords: 800, required: true, intelligencePriority: ['patterns', 'crossDomain'] },
      { id: 'tga-gaps', title: 'Gap Analysis & Priority Matrix', promptInstruction: 'Map gaps between current and required state. Prioritise by strategic impact and urgency. Quantify the talent deficit.', maxWords: 800, required: true, intelligencePriority: ['formulaScores'] },
      { id: 'tga-strategy', title: 'Talent Strategy & Action Plan', promptInstruction: 'Build vs buy vs borrow decisions for each gap. Recruitment, training, secondment, restructuring plans. Timeline and budget. Reference what comparable organisations have done.', maxWords: 1000, required: true, intelligencePriority: ['historicalParallels', 'creativeStrategies'] },
    ]
  },

  // ── PROCUREMENT ──────────────────────────────────────────────────────────
  {
    id: 'procurement-strategy',
    name: 'Procurement Strategy',
    category: 'Procurement & Supply',
    description: 'Strategic sourcing plan with vendor selection, risk management, and value optimization',
    tone: 'formal-corporate',
    audience: 'board-directors',
    length: 'standard',
    keyFocus: 'value-driven procurement with risk management and compliance',
    complianceFramework: ['public-procurement-rules', 'competition-law'],
    sections: [
      { id: 'proc-need', title: 'Procurement Requirements', promptInstruction: 'Define procurement scope, categories, volumes, quality specifications, timeline requirements. Map to project phases.', maxWords: 600, required: true, intelligencePriority: ['situationAnalysis'] },
      { id: 'proc-market', title: 'Supply Market Analysis', promptInstruction: 'Analyse supply market: vendor landscape, market dynamics, pricing trends, supply risks. Use pattern data for market intelligence.', maxWords: 800, required: true, intelligencePriority: ['patterns', 'crossDomain'] },
      { id: 'proc-approach', title: 'Sourcing Approach', promptInstruction: 'Define sourcing approach for each category: single source, competitive tender, framework agreement. Evaluation criteria and weighting.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
      { id: 'proc-risk', title: 'Risk & Compliance', promptInstruction: 'Supply chain risks, local content requirements, anti-corruption compliance, ESG in procurement. Mitigation strategies.', maxWords: 600, required: true, intelligencePriority: ['compliance', 'ethicalAssessment'] },
    ]
  },
  {
    id: 'vendor-assessment',
    name: 'Vendor Assessment Report',
    category: 'Procurement & Supply',
    description: 'Comprehensive evaluation of potential vendor capability, reliability, and compliance',
    tone: 'technical-analytical',
    audience: 'technical-team',
    length: 'standard',
    keyFocus: 'objective vendor evaluation with scoring and risk assessment',
    complianceFramework: ['vendor-due-diligence', 'anti-bribery'],
    sections: [
      { id: 'va-profile', title: 'Vendor Profile', promptInstruction: 'Company overview, ownership, financial standing, operational scale, geographic footprint, relevant experience, client references.', maxWords: 600, required: true, intelligencePriority: ['situationAnalysis'] },
      { id: 'va-capability', title: 'Technical Capability Assessment', promptInstruction: 'Assess technical capacity, quality systems, certifications, innovation capability, scalability. Score against requirements.', maxWords: 800, required: true, intelligencePriority: ['crossDomain'] },
      { id: 'va-compliance', title: 'Compliance & Risk Assessment', promptInstruction: 'AML/sanctions screening, ESG practices, labour standards, anti-corruption compliance, insurance, financial viability. Use compliance framework.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'ethicalAssessment'] },
      { id: 'va-recommendation', title: 'Scorecard & Recommendation', promptInstruction: 'Weighted scoring across all dimensions. Overall recommendation: approve, conditional, reject. Key conditions and monitoring requirements.', maxWords: 500, required: true, intelligencePriority: ['formulaScores'] },
    ]
  },

  // ── GOVERNANCE & BOARD ──────────────────────────────────────────────────
  {
    id: 'governance-report',
    name: 'Governance & Board Report',
    category: 'Governance & Board',
    description: 'Comprehensive governance assessment covering board effectiveness, controls, and compliance',
    tone: 'formal-corporate',
    audience: 'board-directors',
    length: 'standard',
    keyFocus: 'transparent governance disclosure with improvement recommendations',
    complianceFramework: ['corporate-governance-code', 'SOX', 'King-IV'],
    sections: [
      { id: 'gov-board', title: 'Board Structure & Effectiveness', promptInstruction: 'Board composition, independence, diversity, skill matrix, attendance, committee structure, board evaluation findings.', maxWords: 800, required: true, intelligencePriority: ['compliance'] },
      { id: 'gov-risk', title: 'Risk Management Framework', promptInstruction: 'Enterprise risk management structure, three lines of defence, risk appetite, key risk indicators, emerging risks.', maxWords: 800, required: true, intelligencePriority: ['situationAnalysis', 'formulaScores'] },
      { id: 'gov-compliance', title: 'Regulatory Compliance Status', promptInstruction: 'Compliance with all applicable regulations, governance codes, listing requirements. Material non-compliances and remediation. Use compliance framework.', maxWords: 600, required: true, intelligencePriority: ['compliance'] },
      { id: 'gov-recommendations', title: 'Governance Improvement Recommendations', promptInstruction: 'Specific recommendations for governance strengthening. Priority actions, timeline, responsible parties. Reference best practices.', maxWords: 600, required: true, intelligencePriority: ['historicalParallels', 'ethicalAssessment'] },
    ]
  },

  // ── TECHNICAL ──────────────────────────────────────────────────────────
  {
    id: 'technical-specification',
    name: 'Technical Specification Document',
    category: 'Technical',
    description: 'Detailed technical requirements, standards, and specifications for infrastructure or systems',
    tone: 'technical-analytical',
    audience: 'technical-team',
    length: 'comprehensive',
    keyFocus: 'precise technical requirements with performance standards and compliance',
    complianceFramework: ['ISO-standards', 'industry-specifications'],
    sections: [
      { id: 'ts-overview', title: 'Technical Overview', promptInstruction: 'High-level system/asset description, purpose, operating environment, design life, performance objectives. Use cross-domain data for technology context.', maxWords: 600, required: true, intelligencePriority: ['crossDomain'] },
      { id: 'ts-requirements', title: 'Functional Requirements', promptInstruction: 'Detailed functional requirements: capacity, throughput, availability, reliability, scalability. Each requirement should be specific, measurable, achievable.', maxWords: 1200, required: true, intelligencePriority: ['crossDomain', 'patterns'] },
      { id: 'ts-standards', title: 'Standards & Compliance', promptInstruction: 'Applicable technical standards (ISO, IEC, local building codes), regulatory requirements, environmental standards, safety requirements.', maxWords: 800, required: true, intelligencePriority: ['compliance'] },
      { id: 'ts-testing', title: 'Testing & Acceptance', promptInstruction: 'Test plan: factory acceptance, site acceptance, performance testing, commissioning. Acceptance criteria for each phase. Warranty and defect liability.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'historicalParallels'] },
    ]
  },

  // ── REGULATORY & COMPLIANCE ──────────────────────────────────────────────
  {
    id: 'regulatory-filing',
    name: 'Regulatory Filing & Submission',
    category: 'Regulatory & Compliance',
    description: 'Formal regulatory submission covering all required disclosures and approvals',
    tone: 'formal-government',
    audience: 'government-officials',
    length: 'standard',
    keyFocus: 'comprehensive regulatory compliance with all required disclosures',
    complianceFramework: ['sector-specific-regulations', 'disclosure-requirements'],
    sections: [
      { id: 'rf-summary', title: 'Filing Summary', promptInstruction: 'Regulatory authority, filing type, applicable regulations, filing deadline, key disclosures. Clear statement of what is being sought.', maxWords: 400, required: true, intelligencePriority: ['compliance'] },
      { id: 'rf-entity', title: 'Applicant & Entity Details', promptInstruction: 'Complete entity information: registration, ownership structure, beneficial owners, management team, operational history, existing licences.', maxWords: 600, required: true, intelligencePriority: ['compliance'] },
      { id: 'rf-activity', title: 'Proposed Activity & Impact', promptInstruction: 'Detailed description of proposed regulated activity. Economic impact, employment impact, community impact. Use formula scores for quantification.', maxWords: 1000, required: true, intelligencePriority: ['formulaScores', 'situationAnalysis'] },
      { id: 'rf-compliance', title: 'Compliance Framework', promptInstruction: 'How applicant will meet all regulatory requirements. Internal controls, compliance programme, reporting mechanisms, designated compliance officer.', maxWords: 800, required: true, intelligencePriority: ['compliance', 'ethicalAssessment'] },
    ]
  },

  // ── RESEARCH & ACADEMIC ──────────────────────────────────────────────────
  {
    id: 'research-proposal',
    name: 'Research Proposal',
    category: 'Research & Academic',
    description: 'Formal research proposal with methodology, expected outcomes, and funding requirements',
    tone: 'academic-research',
    audience: 'academic-peer',
    length: 'standard',
    keyFocus: 'methodologically sound research design with clear expected contribution',
    complianceFramework: ['research-ethics', 'academic-standards'],
    sections: [
      { id: 'rp-question', title: 'Research Question & Significance', promptInstruction: 'State the research question clearly. Why does it matter? What gap in knowledge does it fill? Literature review context. Use pattern data for evidence.', maxWords: 800, required: true, intelligencePriority: ['patterns', 'historicalParallels'] },
      { id: 'rp-methodology', title: 'Methodology', promptInstruction: 'Research design, data sources, analytical framework, sample selection, variables, statistical methods. Justify methodological choices.', maxWords: 1000, required: true, intelligencePriority: ['crossDomain'] },
      { id: 'rp-outcomes', title: 'Expected Outcomes & Impact', promptInstruction: 'Anticipated findings, policy implications, practical applications. How will results be disseminated? What impact is expected?', maxWords: 600, required: true, intelligencePriority: ['creativeStrategies', 'patterns'] },
      { id: 'rp-plan', title: 'Timeline & Resources', promptInstruction: 'Research timeline, milestones, team, budget, institutional support, ethical clearance requirements.', maxWords: 500, required: true, intelligencePriority: ['compliance'] },
    ]
  },
];

// ============================================================================
// LETTER TYPE CONFIGURATIONS
// ============================================================================

const LETTER_TYPES: LetterTypeConfig[] = [
  // â"€â"€ INVESTMENT LETTERS â"€â"€
  { id: 'loi-investment', name: 'Letter of Intent " Investment', category: 'Investment', tone: 'formal-corporate', audience: 'investors', maxWords: 1500, structure: ['Preamble', 'Parties', 'Purpose', 'Key Terms', 'Conditions Precedent', 'Confidentiality', 'Non-Binding Statement', 'Signatures'], keyElements: ['Investment amount', 'Equity structure', 'Valuation basis', 'Due diligence period', 'Exclusivity'] },
  { id: 'loi-partnership', name: 'Letter of Intent " Partnership', category: 'Partnership', tone: 'formal-corporate', audience: 'board-directors', maxWords: 1500, structure: ['Introduction', 'Partnership Rationale', 'Scope of Collaboration', 'Governance Principles', 'Resource Commitments', 'Timeline', 'Confidentiality', 'Non-Binding'], keyElements: ['Mutual objectives', 'Contribution framework', 'Decision-making', 'IP treatment', 'Exit provisions'] },
  { id: 'eoi-government', name: 'Expression of Interest " Government Project', category: 'Government', tone: 'formal-government', audience: 'government-officials', maxWords: 2000, structure: ['Covering Statement', 'Company Profile', 'Relevant Experience', 'Proposed Approach', 'Team Qualifications', 'Financial Capacity', 'Compliance Declarations'], keyElements: ['Company credentials', 'Relevant track record', 'Technical capability', 'Financial standing', 'Compliance history'] },
  { id: 'proposal-cover', name: 'Proposal Cover Letter', category: 'Proposal', tone: 'formal-corporate', audience: 'investors', maxWords: 800, structure: ['Addressee', 'Reference to RFP/opportunity', 'Executive summary of proposal', 'Key differentiators', 'Closing commitment'], keyElements: ['Proposal reference', 'Key value proposition', 'Compliance statement', 'Contact details'] },
  { id: 'investor-update', name: 'Investor Update Letter', category: 'Investment', tone: 'formal-corporate', audience: 'investors', maxWords: 1500, structure: ['Summary', 'Key Metrics', 'Progress Update', 'Challenges & Mitigations', 'Upcoming Milestones', 'Financial Summary', 'Ask/Next Steps'], keyElements: ['KPI dashboard', 'Progress vs targets', 'Risk updates', 'Capital deployment'] },
  // â"€â"€ GOVERNMENT LETTERS â"€â"€
  { id: 'gov-incentive-request', name: 'Investment Incentive Application Letter', category: 'Government', tone: 'formal-government', audience: 'government-officials', maxWords: 2000, structure: ['Formal Address', 'Application Reference', 'Company Introduction', 'Investment Description', 'Economic Impact', 'Incentive Request', 'Compliance Commitment', 'Supporting Documents List'], keyElements: ['Investment value', 'Job creation', 'Technology transfer', 'Export potential', 'Local content'] },
  { id: 'gov-regulatory-inquiry', name: 'Regulatory Inquiry Letter', category: 'Government', tone: 'formal-government', audience: 'government-officials', maxWords: 1000, structure: ['Reference', 'Company Introduction', 'Specific Inquiry', 'Context', 'Request for Clarification', 'Timeline Request'], keyElements: ['Specific regulation cited', 'Compliance question', 'Timeframe for response'] },
  { id: 'gov-mou-proposal', name: 'MoU Proposal Letter', category: 'Government', tone: 'formal-government', audience: 'government-officials', maxWords: 2000, structure: ['Formal Address', 'Context', 'Proposed Scope', 'Objectives', 'Commitments', 'Duration', 'Governance', 'Non-Legal Statement'], keyElements: ['MoU objectives', 'Respective commitments', 'Duration', 'Review mechanism'] },
  // â"€â"€ COMPLIANCE LETTERS â"€â"€
  { id: 'aml-declaration', name: 'AML/KYC Declaration Letter', category: 'Compliance', tone: 'formal-corporate', audience: 'legal-counsel', maxWords: 1000, structure: ['Declaration', 'Beneficial Owner Disclosure', 'Source of Funds', 'PEP Declaration', 'Sanctions Declaration', 'Compliance Undertaking', 'Signature'], keyElements: ['UBO details', 'Source of funds', 'PEP status', 'Sanctions clearance'] },
  { id: 'compliance-assurance', name: 'Compliance Assurance Letter', category: 'Compliance', tone: 'formal-corporate', audience: 'legal-counsel', maxWords: 1200, structure: ['Scope of Assurance', 'Compliance Framework', 'Key Controls', 'Findings', 'Recommendations', 'Management Response'], keyElements: ['Applicable regulations', 'Control framework', 'Testing results', 'Material findings'] },
  // â"€â"€ STAKEHOLDER LETTERS â"€â"€
  { id: 'community-notification', name: 'Community Notification Letter', category: 'Community', tone: 'community-engagement', audience: 'community-stakeholders', maxWords: 1000, structure: ['Plain Language Introduction', 'What Is Being Proposed', 'How It May Affect You', 'How You Can Participate', 'Contact Information', 'Feedback Timeline'], keyElements: ['Plain language', 'Impact summary', 'Participation channels', 'Feedback mechanism'] },
  { id: 'stakeholder-engagement', name: 'Stakeholder Engagement Letter', category: 'Community', tone: 'community-engagement', audience: 'community-stakeholders', maxWords: 1200, structure: ['Introduction', 'Project Description', 'Your Role', 'Consultation Process', 'How Your Input Will Be Used', 'Contact Information'], keyElements: ['Clear language', 'Specific role of stakeholder', 'Consultation timeline', 'How feedback is incorporated'] },
  // â"€â"€ TRADE LETTERS â"€â"€
  { id: 'trade-inquiry', name: 'Trade Inquiry Letter', category: 'Trade', tone: 'formal-corporate', audience: 'investors', maxWords: 800, structure: ['Introduction', 'Product/Service Interest', 'Volume/Specification', 'Pricing Request', 'Delivery Terms', 'Payment Terms', 'Quality Standards'], keyElements: ['Product specifications', 'Volume requirements', 'Incoterms', 'Payment method', 'Quality certification'] },
  { id: 'customs-application', name: 'Customs/Trade Facilitation Letter', category: 'Trade', tone: 'formal-government', audience: 'government-officials', maxWords: 1500, structure: ['Application Reference', 'Company Details', 'Trade Description', 'Tariff Classification', 'Country of Origin', 'Preferential Treatment Claim', 'Supporting Documentation'], keyElements: ['HS classification', 'Origin determination', 'FTA/RTA preference', 'Certificate of origin'] },
  // â"€â"€ INTERNATIONAL BODY LETTERS â"€â"€
  { id: 'dfi-concept-note', name: 'DFI Concept Note Cover Letter', category: 'International', tone: 'formal-government', audience: 'international-bodies', maxWords: 1500, structure: ['Formal Address to DFI', 'Project Title', 'Country/Region', 'Sector', 'Funding Request', 'Development Impact Summary', 'Alignment with DFI Strategy', 'NDA/Government Endorsement'], keyElements: ['DFI strategic alignment', 'Development impact', 'Government endorsement', 'Co-financing'] },
  { id: 'un-submission', name: 'UN Agency Submission Letter', category: 'International', tone: 'diplomatic', audience: 'international-bodies', maxWords: 2000, structure: ['Formal Protocol Address', 'Subject Reference', 'Background', 'Submission Content', 'Supporting Evidence', 'Request for Action', 'Respectful Closing'], keyElements: ['Protocol compliance', 'SDG alignment', 'Evidence-based arguments', 'Specific request'] },

  // ── BANKING & FINANCE LETTERS ──────────────────────────────────────────
  { id: 'credit-facility-request', name: 'Credit Facility Request', category: 'Banking & Finance', tone: 'formal-corporate', audience: 'investors', maxWords: 2000, structure: ['Company Overview', 'Facility Request', 'Purpose of Funds', 'Financial Summary', 'Collateral Offered', 'Proposed Terms', 'Supporting Documentation'], keyElements: ['Facility amount', 'Purpose', 'Repayment plan', 'Collateral', 'Financial covenants'] },
  { id: 'guarantee-request', name: 'Bank Guarantee Request', category: 'Banking & Finance', tone: 'formal-corporate', audience: 'investors', maxWords: 1500, structure: ['Company Details', 'Guarantee Type', 'Beneficiary', 'Amount & Currency', 'Terms & Expiry', 'Counter-Guarantee'], keyElements: ['Guarantee type', 'Amount', 'Beneficiary', 'Expiry date', 'Supporting security'] },
  { id: 'letter-of-credit-application', name: 'Letter of Credit Application', category: 'Banking & Finance', tone: 'formal-corporate', audience: 'investors', maxWords: 1500, structure: ['Applicant Details', 'Beneficiary Details', 'LC Type', 'Amount & Currency', 'Goods Description', 'Shipping Terms', 'Documents Required', 'Validity'], keyElements: ['LC type (sight/usance)', 'Incoterms', 'Documents required', 'Shipping details', 'Expiry'] },

  // ── LEGAL NOTICE LETTERS ──────────────────────────────────────────────
  { id: 'cease-and-desist', name: 'Cease and Desist Letter', category: 'Legal Notices', tone: 'formal-corporate', audience: 'legal-counsel', maxWords: 1500, structure: ['Identification of Parties', 'Factual Background', 'Legal Basis', 'Specific Demands', 'Compliance Deadline', 'Consequences of Non-Compliance'], keyElements: ['Infringement specifics', 'Legal basis', 'Demanded action', 'Deadline', 'Legal consequences'] },
  { id: 'demand-letter', name: 'Formal Demand Letter', category: 'Legal Notices', tone: 'formal-corporate', audience: 'legal-counsel', maxWords: 1500, structure: ['Parties', 'Background', 'Obligation', 'Breach', 'Demand', 'Deadline', 'Consequences'], keyElements: ['Contractual basis', 'Amount demanded', 'Payment deadline', 'Legal action warning'] },
  { id: 'termination-notice', name: 'Contract Termination Notice', category: 'Legal Notices', tone: 'formal-corporate', audience: 'legal-counsel', maxWords: 1200, structure: ['Contract Reference', 'Termination Grounds', 'Effective Date', 'Obligations on Termination', 'Return of Property', 'Survival Clauses'], keyElements: ['Contract details', 'Termination clause reference', 'Effective date', 'Post-termination obligations'] },
  { id: 'force-majeure-notice', name: 'Force Majeure Notice', category: 'Legal Notices', tone: 'formal-corporate', audience: 'legal-counsel', maxWords: 1200, structure: ['Contract Reference', 'Force Majeure Event', 'Impact Description', 'Mitigation Steps', 'Relief Sought', 'Duration Estimate'], keyElements: ['Triggering event', 'Clause reference', 'Performance impact', 'Mitigation actions'] },

  // ── EMPLOYMENT LETTERS ──────────────────────────────────────────────────
  { id: 'offer-letter', name: 'Employment Offer Letter', category: 'Employment', tone: 'formal-corporate', audience: 'general-public', maxWords: 1500, structure: ['Position & Start Date', 'Compensation Package', 'Benefits Summary', 'Key Terms', 'Conditions Precedent', 'Acceptance Deadline'], keyElements: ['Role title', 'Compensation', 'Benefits', 'Start date', 'Reporting line', 'Conditions'] },
  { id: 'reference-letter', name: 'Professional Reference Letter', category: 'Employment', tone: 'formal-corporate', audience: 'general-public', maxWords: 1000, structure: ['Relationship Context', 'Role & Responsibilities', 'Key Achievements', 'Professional Qualities', 'Recommendation'], keyElements: ['Employment period', 'Role', 'Key strengths', 'Achievements', 'Character assessment'] },
  { id: 'secondment-agreement', name: 'Secondment Agreement Letter', category: 'Employment', tone: 'formal-corporate', audience: 'general-public', maxWords: 1500, structure: ['Parties', 'Secondee Details', 'Host Organisation', 'Duration', 'Terms', 'Reporting Lines', 'IP & Confidentiality'], keyElements: ['Duration', 'Compensation responsibility', 'Reporting structure', 'IP ownership', 'Return provisions'] },

  // ── MEDIA & PR LETTERS ──────────────────────────────────────────────────
  { id: 'press-release-cover', name: 'Press Release Distribution Cover', category: 'Media & PR', tone: 'formal-corporate', audience: 'general-public', maxWords: 800, structure: ['Journalist/Editor Address', 'News Hook', 'Key Story Points', 'Interview Availability', 'Contact Information'], keyElements: ['News angle', 'Exclusivity offer', 'Spokesperson availability', 'Assets provided'] },
  { id: 'crisis-statement', name: 'Crisis Communication Statement', category: 'Media & PR', tone: 'formal-corporate', audience: 'general-public', maxWords: 1000, structure: ['Acknowledgment', 'Facts Known', 'Actions Taken', 'Stakeholder Protection', 'Contact & Updates'], keyElements: ['Transparent acknowledgment', 'Facts known', 'Remediation steps', 'Support channels'] },
  { id: 'media-inquiry-response', name: 'Media Inquiry Response', category: 'Media & PR', tone: 'formal-corporate', audience: 'general-public', maxWords: 1000, structure: ['Reference to Inquiry', 'Official Position', 'Supporting Facts', 'Additional Context', 'Spokesperson Designation'], keyElements: ['Clear position', 'Supporting facts', 'What can/cannot be disclosed', 'Follow-up availability'] },

  // ── PARTNERSHIP OUTREACH ──────────────────────────────────────────────
  { id: 'partnership-introduction', name: 'Partnership Introduction Letter', category: 'Partnership', tone: 'formal-corporate', audience: 'board-directors', maxWords: 1200, structure: ['Introduction', 'About Our Organisation', 'Why This Partnership', 'Mutual Value Proposition', 'Proposed Next Steps'], keyElements: ['Strategic alignment', 'Value proposition', 'Complementary capabilities', 'Proposed meeting'] },
  { id: 'joint-venture-invitation', name: 'Joint Venture Invitation', category: 'Partnership', tone: 'formal-corporate', audience: 'board-directors', maxWords: 1500, structure: ['Strategic Context', 'JV Opportunity', 'Value Creation Thesis', 'Proposed Structure', 'Due Diligence Process', 'Next Steps'], keyElements: ['JV rationale', 'Equity split concept', 'Governance proposal', 'Timeline'] },
  { id: 'co-investment-invitation', name: 'Co-Investment Invitation', category: 'Partnership', tone: 'persuasive-investment', audience: 'investors', maxWords: 1500, structure: ['Opportunity Summary', 'Investment Thesis', 'Structure & Terms', 'Due Diligence Access', 'Timeline', 'Confidentiality'], keyElements: ['Deal size', 'Return profile', 'Structure', 'DD timeline', 'Commitment deadline'] },

  // ── INVESTOR RELATIONS ──────────────────────────────────────────────────
  { id: 'capital-call-notice', name: 'Capital Call Notice', category: 'Investment', tone: 'formal-corporate', audience: 'investors', maxWords: 1000, structure: ['Fund Reference', 'Call Amount', 'Purpose', 'Payment Instructions', 'Deadline', 'LP Commitment Status'], keyElements: ['Call amount', 'Purpose', 'Payment details', 'Deadline', 'Commitment remaining'] },
  { id: 'distribution-notice', name: 'Distribution Notice', category: 'Investment', tone: 'formal-corporate', audience: 'investors', maxWords: 1000, structure: ['Fund Reference', 'Distribution Amount', 'Source', 'Tax Character', 'Payment Details', 'Portfolio Update'], keyElements: ['Distribution amount', 'Source (income/capital)', 'Tax information', 'Cumulative distributions'] },
  { id: 'fundraising-teaser', name: 'Fundraising Teaser Letter', category: 'Investment', tone: 'persuasive-investment', audience: 'investors', maxWords: 1500, structure: ['Opening Hook', 'Fund/Vehicle Summary', 'Track Record', 'Strategy', 'Terms Overview', 'Next Steps'], keyElements: ['Fund size', 'Strategy', 'Target returns', 'Team credentials', 'Timeline'] },

  // ── CUSTOMER RELATIONS ──────────────────────────────────────────────────
  { id: 'welcome-letter', name: 'Client Welcome Letter', category: 'Customer', tone: 'formal-corporate', audience: 'general-public', maxWords: 800, structure: ['Welcome', 'Engagement Summary', 'Team Introduction', 'What to Expect', 'Key Contacts', 'Next Steps'], keyElements: ['Engagement scope', 'Team contacts', 'Communication channels', 'Onboarding timeline'] },
  { id: 'complaint-resolution', name: 'Complaint Resolution Letter', category: 'Customer', tone: 'formal-corporate', audience: 'general-public', maxWords: 1000, structure: ['Acknowledgment', 'Investigation Summary', 'Findings', 'Resolution Offered', 'Preventive Measures', 'Escalation Path'], keyElements: ['Issue acknowledgment', 'Resolution offered', 'Compensation if applicable', 'Process improvements'] },

  // ── SUPPLIER RELATIONS ──────────────────────────────────────────────────
  { id: 'vendor-onboarding', name: 'Vendor Onboarding Letter', category: 'Supplier', tone: 'formal-corporate', audience: 'general-public', maxWords: 1200, structure: ['Welcome', 'Onboarding Requirements', 'Documentation Needed', 'Compliance Requirements', 'Payment Terms', 'Key Contacts'], keyElements: ['Required documentation', 'Compliance standards', 'Payment terms', 'Performance expectations'] },
  { id: 'quality-concern', name: 'Quality Concern Notice', category: 'Supplier', tone: 'formal-corporate', audience: 'general-public', maxWords: 1000, structure: ['Reference', 'Quality Issue Description', 'Impact', 'Required Action', 'Deadline', 'Consequences'], keyElements: ['Specific deficiency', 'Supporting evidence', 'Corrective action required', 'Response deadline'] },

  // ── DIPLOMATIC ──────────────────────────────────────────────────────────
  { id: 'bilateral-proposal', name: 'Bilateral Cooperation Proposal', category: 'Diplomatic', tone: 'diplomatic', audience: 'government-officials', maxWords: 2000, structure: ['Protocol Address', 'Background', 'Proposed Areas of Cooperation', 'Framework', 'Expected Outcomes', 'Implementation Mechanism', 'Respectful Closing'], keyElements: ['Protocol compliance', 'Mutual benefits', 'Implementation mechanism', 'Review provisions'] },
  { id: 'embassy-visa-support', name: 'Embassy Visa Support Letter', category: 'Diplomatic', tone: 'formal-government', audience: 'government-officials', maxWords: 1000, structure: ['Embassy Address', 'Applicant Details', 'Purpose of Visit', 'Hosting Details', 'Financial Support', 'Organisational Guarantee'], keyElements: ['Applicant identity', 'Visit purpose', 'Hosting arrangements', 'Financial guarantee'] },

  // ── REGULATORY ──────────────────────────────────────────────────────────
  { id: 'license-renewal-request', name: 'License Renewal Request', category: 'Regulatory', tone: 'formal-government', audience: 'government-officials', maxWords: 1500, structure: ['License Reference', 'Compliance Summary', 'Operations Update', 'Renewal Request', 'Supporting Material', 'Contact Details'], keyElements: ['Current license details', 'Compliance record', 'Operational changes', 'Supporting documents'] },
  { id: 'exemption-request', name: 'Regulatory Exemption Request', category: 'Regulatory', tone: 'formal-government', audience: 'government-officials', maxWords: 1500, structure: ['Regulatory Reference', 'Exemption Sought', 'Justification', 'Alternative Compliance', 'Impact Assessment', 'Duration'], keyElements: ['Specific regulation', 'Exemption scope', 'Business justification', 'Alternative measures'] },

  // ── ACKNOWLEDGMENTS ──────────────────────────────────────────────────────
  { id: 'meeting-confirmation', name: 'Meeting Confirmation Letter', category: 'Acknowledgment', tone: 'formal-corporate', audience: 'board-directors', maxWords: 600, structure: ['Meeting Reference', 'Date/Time/Venue', 'Agenda Items', 'Required Attendees', 'Preparation Required', 'Logistics'], keyElements: ['Date', 'Time', 'Location', 'Agenda', 'Participants'] },
  { id: 'closing-confirmation', name: 'Transaction Closing Confirmation', category: 'Acknowledgment', tone: 'formal-corporate', audience: 'legal-counsel', maxWords: 1000, structure: ['Transaction Reference', 'Closing Date', 'Conditions Satisfied', 'Documents Executed', 'Funds Transferred', 'Post-Closing Obligations'], keyElements: ['Transaction details', 'Closing confirmation', 'Conditions satisfied', 'Next steps'] },
];

// ============================================================================
// ROUTER
// ============================================================================

export class DocumentTypeRouter {

  /**
   * Get all available document type configurations
   */
  static getAllDocumentTypes(): DocumentTypeConfig[] {
    return [...DOCUMENT_TYPES];
  }

  /**
   * Get all letter type configurations
   */
  static getAllLetterTypes(): LetterTypeConfig[] {
    return [...LETTER_TYPES];
  }

  /**
   * Get document type by ID
   */
  static getDocumentType(id: string): DocumentTypeConfig | undefined {
    return DOCUMENT_TYPES.find(d => d.id === id);
  }

  /**
   * Get letter type by ID
   */
  static getLetterType(id: string): LetterTypeConfig | undefined {
    return LETTER_TYPES.find(l => l.id === id);
  }

  /**
   * Get document types by category
   */
  static getDocumentsByCategory(category: string): DocumentTypeConfig[] {
    return DOCUMENT_TYPES.filter(d => d.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Get letters by category
   */
  static getLettersByCategory(category: string): LetterTypeConfig[] {
    return LETTER_TYPES.filter(l => l.category.toLowerCase() === category.toLowerCase());
  }

  /**
   * Route document generation " returns the full section structure and prompt instructions
   * for any given document type
   */
  static routeDocument(documentTypeId: string): {
    config: DocumentTypeConfig;
    sectionPrompts: Array<{
      sectionId: string;
      title: string;
      prompt: string;
      maxWords: number;
      intelligenceFocus: string[];
    }>;
  } | null {
    const config = DOCUMENT_TYPES.find(d => d.id === documentTypeId);
    if (!config) return null;

    return {
      config,
      sectionPrompts: config.sections.map(s => ({
        sectionId: s.id,
        title: s.title,
        prompt: s.promptInstruction,
        maxWords: s.maxWords,
        intelligenceFocus: s.intelligencePriority,
      })),
    };
  }

  /**
   * Route letter generation " returns structure and key elements
   */
  static routeLetter(letterTypeId: string): {
    config: LetterTypeConfig;
    promptInstruction: string;
  } | null {
    const config = LETTER_TYPES.find(l => l.id === letterTypeId);
    if (!config) return null;

    const toneInstructions: Record<DocumentTone, string> = {
      'formal-corporate': 'Write in formal corporate style. Professional, precise, confident. Avoid jargon where possible. Use active voice.',
      'formal-government': 'Write in formal government correspondence style. Respectful, structured, evidence-referenced. Follow protocol conventions.',
      'technical-analytical': 'Write in technical analytical style. Data-driven, objective, measured. Support all claims with evidence.',
      'persuasive-investment': 'Write in persuasive investment style. Compelling, fact-backed, ROI-focused. Build a clear case for action.',
      'community-engagement': 'Write in clear, accessible community engagement style. Plain language. No jargon. Empathetic and transparent.',
      'academic-research': 'Write in academic research style. Rigorous, referenced, methodologically sound. Use appropriate citations.',
      'diplomatic': 'Write in diplomatic style. Measured, respectful, protocol-aware. Use appropriate formal conventions.',
    };

    const promptInstruction = [
      `Generate a ${config.name} with the following characteristics:`,
      `Tone: ${toneInstructions[config.tone]}`,
      `Audience: ${config.audience}`,
      `Maximum length: ${config.maxWords} words`,
      ``,
      `Required structure:`,
      ...config.structure.map((s, i) => `${i + 1}. ${s}`),
      ``,
      `Key elements to include:`,
      ...config.keyElements.map(k => `${k}`),
    ].join('\n');

    return { config, promptInstruction };
  }

  /**
   * Get catalog summary " how many document and letter types available
   */
  static getCatalogSummary(): {
    totalDocumentTypes: number;
    totalLetterTypes: number;
    documentCategories: Record<string, number>;
    letterCategories: Record<string, number>;
  } {
    const docCats: Record<string, number> = {};
    for (const d of DOCUMENT_TYPES) {
      docCats[d.category] = (docCats[d.category] || 0) + 1;
    }

    const letCats: Record<string, number> = {};
    for (const l of LETTER_TYPES) {
      letCats[l.category] = (letCats[l.category] || 0) + 1;
    }

    return {
      totalDocumentTypes: DOCUMENT_TYPES.length,
      totalLetterTypes: LETTER_TYPES.length,
      documentCategories: docCats,
      letterCategories: letCats,
    };
  }

  /**
   * Find best document type based on user intent keywords
   */
  static findBestDocumentType(keywords: string): DocumentTypeConfig | null {
    const lower = keywords.toLowerCase();
    const scored = DOCUMENT_TYPES.map(d => {
      let score = 0;
      const fields = [d.name, d.description, d.category, d.keyFocus].join(' ').toLowerCase();
      const words = lower.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue;
        if (fields.includes(word)) score += 10;
      }
      // Boost for exact category match
      if (lower.includes(d.category.toLowerCase())) score += 20;
      // Boost for name word match
      const nameWords = d.name.toLowerCase().split(/\s+/);
      for (const nw of nameWords) {
        if (lower.includes(nw) && nw.length > 3) score += 15;
      }
      return { doc: d, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.score > 0 ? scored[0].doc : null;
  }

  /**
   * Find best letter type based on user intent keywords
   */
  static findBestLetterType(keywords: string): LetterTypeConfig | null {
    const lower = keywords.toLowerCase();
    const scored = LETTER_TYPES.map(l => {
      let score = 0;
      const fields = [l.name, l.category, ...l.keyElements].join(' ').toLowerCase();
      const words = lower.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue;
        if (fields.includes(word)) score += 10;
      }
      if (lower.includes(l.category.toLowerCase())) score += 20;
      return { letter: l, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.score > 0 ? scored[0].letter : null;
  }

  // ========================================================================
  // CATEGORY-AWARE FALLBACK - ensures ALL 247+ doc types and 156+ letter
  // types generate with proper section structure even without individual configs
  // ========================================================================

  private static readonly CATEGORY_SECTION_FALLBACKS: Record<string, Array<{
    title: string;
    promptInstruction: string;
    maxWords: number;
    intelligencePriority: SectionTemplate['intelligencePriority'];
  }>> = {
    // Foundation & Legal
    'foundation': [
      { title: 'Parties & Context', promptInstruction: 'Identify all parties, their respective roles, and the context of this agreement. State the purpose clearly.', maxWords: 600, intelligencePriority: ['compliance'] },
      { title: 'Key Terms & Provisions', promptInstruction: 'Detail the key commercial and legal terms. Use clear, unambiguous language appropriate for the jurisdiction.', maxWords: 1000, intelligencePriority: ['compliance', 'historicalParallels'] },
      { title: 'Obligations & Conditions', promptInstruction: 'Specify obligations of each party, conditions precedent, performance standards, and timelines.', maxWords: 800, intelligencePriority: ['compliance', 'ethicalAssessment'] },
      { title: 'Governance, Term & Remedies', promptInstruction: 'Governance mechanism, duration, renewal, termination, dispute resolution, and governing law.', maxWords: 600, intelligencePriority: ['compliance'] },
    ],
    'foundation-legal': [
      { title: 'Parties & Context', promptInstruction: 'Identify all parties, their respective roles, and the context of this agreement. State the purpose clearly.', maxWords: 600, intelligencePriority: ['compliance'] },
      { title: 'Key Terms & Provisions', promptInstruction: 'Detail the key commercial and legal terms. Use clear, unambiguous language appropriate for the jurisdiction.', maxWords: 1000, intelligencePriority: ['compliance', 'historicalParallels'] },
      { title: 'Obligations & Conditions', promptInstruction: 'Specify obligations of each party, conditions precedent, performance standards, and timelines.', maxWords: 800, intelligencePriority: ['compliance', 'ethicalAssessment'] },
      { title: 'Governance, Term & Remedies', promptInstruction: 'Governance mechanism, duration, renewal, termination, dispute resolution, and governing law.', maxWords: 600, intelligencePriority: ['compliance'] },
    ],
    'legal': [
      { title: 'Recitals & Definitions', promptInstruction: 'Standard recitals establishing context. Define all key terms used in the document.', maxWords: 600, intelligencePriority: ['compliance'] },
      { title: 'Substantive Provisions', promptInstruction: 'The core legal provisions: rights, obligations, scope, limitations, exclusions. Use jurisdiction-aware legal language.', maxWords: 1500, intelligencePriority: ['compliance', 'historicalParallels'] },
      { title: 'Compliance & Regulatory', promptInstruction: 'Applicable regulatory requirements, compliance obligations, reporting duties, audit rights.', maxWords: 800, intelligencePriority: ['compliance'] },
      { title: 'Term, Termination & Dispute Resolution', promptInstruction: 'Duration, renewal, termination triggers, consequences, arbitration/mediation, governing law.', maxWords: 600, intelligencePriority: ['compliance'] },
    ],
    // Strategic
    'strategic': [
      { title: 'Strategic Context', promptInstruction: 'Analyse the current strategic landscape, key trends, and the opportunity or challenge being addressed. Use pattern analysis and situation data.', maxWords: 1000, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { title: 'Analysis & Evidence', promptInstruction: 'Present rigorous analysis with supporting evidence: market data, benchmarks, historical parallels, formula scores.', maxWords: 1500, intelligencePriority: ['formulaScores', 'historicalParallels', 'patterns'] },
      { title: 'Strategic Options & Evaluation', promptInstruction: 'Present strategic options, evaluate each against key criteria, and recommend the optimal path. Use creative strategies.', maxWords: 1200, intelligencePriority: ['creativeStrategies', 'crossDomain'] },
      { title: 'Implementation & Next Steps', promptInstruction: 'Actionable implementation plan with timelines, resources, risks, and governance.', maxWords: 800, intelligencePriority: ['compliance', 'historicalParallels'] },
    ],
    'strategic-intelligence': [
      { title: 'Strategic Context', promptInstruction: 'Analyse the current strategic landscape, key trends, and the opportunity or challenge being addressed. Use pattern analysis and situation data.', maxWords: 1000, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { title: 'Analysis & Evidence', promptInstruction: 'Present rigorous analysis with supporting evidence: market data, benchmarks, historical parallels, formula scores.', maxWords: 1500, intelligencePriority: ['formulaScores', 'historicalParallels', 'patterns'] },
      { title: 'Strategic Options & Evaluation', promptInstruction: 'Present strategic options, evaluate each against key criteria, and recommend the optimal path. Use creative strategies.', maxWords: 1200, intelligencePriority: ['creativeStrategies', 'crossDomain'] },
      { title: 'Implementation & Next Steps', promptInstruction: 'Actionable implementation plan with timelines, resources, risks, and governance.', maxWords: 800, intelligencePriority: ['compliance', 'historicalParallels'] },
    ],
    // Financial
    'financial': [
      { title: 'Financial Overview & Assumptions', promptInstruction: 'State all key financial assumptions: macro, market, operational. Provide the analytical framework used.', maxWords: 800, intelligencePriority: ['formulaScores', 'patterns'] },
      { title: 'Financial Analysis', promptInstruction: 'Detailed financial analysis: projections, ratios, returns, cash flows. Use NSIL formula scores for quantification.', maxWords: 1500, intelligencePriority: ['formulaScores'] },
      { title: 'Risk & Sensitivity', promptInstruction: 'Financial risks, scenario analysis, sensitivity tables. Identify breakeven conditions and key sensitivities.', maxWords: 1000, intelligencePriority: ['formulaScores', 'situationAnalysis'] },
      { title: 'Conclusions & Recommendations', promptInstruction: 'Clear financial conclusions with specific recommendations. State confidence level and key caveats.', maxWords: 600, intelligencePriority: ['formulaScores', 'ethicalAssessment'] },
    ],
    'financial-investment': [
      { title: 'Financial Overview & Assumptions', promptInstruction: 'State all key financial assumptions: macro, market, operational. Provide the analytical framework used.', maxWords: 800, intelligencePriority: ['formulaScores', 'patterns'] },
      { title: 'Financial Analysis', promptInstruction: 'Detailed financial analysis: projections, ratios, returns, cash flows. Use NSIL formula scores for quantification.', maxWords: 1500, intelligencePriority: ['formulaScores'] },
      { title: 'Risk & Sensitivity', promptInstruction: 'Financial risks, scenario analysis, sensitivity tables. Identify breakeven conditions and key sensitivities.', maxWords: 1000, intelligencePriority: ['formulaScores', 'situationAnalysis'] },
      { title: 'Conclusions & Recommendations', promptInstruction: 'Clear financial conclusions with specific recommendations. State confidence level and key caveats.', maxWords: 600, intelligencePriority: ['formulaScores', 'ethicalAssessment'] },
    ],
    // Risk & Due Diligence
    'risk': [
      { title: 'Risk Assessment Methodology', promptInstruction: 'Explain the assessment framework and methodology. List the risk dimensions examined.', maxWords: 500, intelligencePriority: ['formulaScores'] },
      { title: 'Risk Identification & Analysis', promptInstruction: 'Identify and analyse all relevant risks across dimensions: political, market, operational, financial, legal, ESG. Quantify using risk matrix.', maxWords: 1500, intelligencePriority: ['situationAnalysis', 'compliance', 'ethicalAssessment'] },
      { title: 'Risk Matrix & Scoring', promptInstruction: 'Present comprehensive risk matrix with likelihood × impact scoring. Rank all risks. Use NSIL scores.', maxWords: 800, intelligencePriority: ['formulaScores'] },
      { title: 'Mitigation Strategies', promptInstruction: 'Specific mitigation actions for each high/critical risk. Responsible parties, timelines, residual risk. Reference historical precedents.', maxWords: 1000, intelligencePriority: ['historicalParallels', 'creativeStrategies'] },
    ],
    'risk-due-diligence': [
      { title: 'Scope & Methodology', promptInstruction: 'Define the assessment scope, information sources, analytical approach, and limitations.', maxWords: 500, intelligencePriority: ['compliance'] },
      { title: 'Findings & Analysis', promptInstruction: 'Present findings across all dimensions examined. Use evidence-based analysis with specific references.', maxWords: 1500, intelligencePriority: ['compliance', 'situationAnalysis', 'ethicalAssessment'] },
      { title: 'Red Flags & Concerns', promptInstruction: 'Highlight material findings: deal-breakers (red), significant concerns (amber), minor issues (yellow). Each with recommended action.', maxWords: 1000, intelligencePriority: ['ethicalAssessment', 'compliance'] },
      { title: 'Conclusions & Recommendations', promptInstruction: 'Overall assessment with clear recommendation. Conditions for proceeding. Outstanding items requiring resolution.', maxWords: 600, intelligencePriority: ['ethicalAssessment', 'formulaScores'] },
    ],
    // Government & Policy
    'government': [
      { title: 'Policy Context', promptInstruction: 'Describe the current policy landscape, existing frameworks, and the gap or opportunity being addressed.', maxWords: 800, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { title: 'Evidence & International Benchmarks', promptInstruction: 'Present evidence from international experience: what has worked? Use historical parallels and pattern data.', maxWords: 1200, intelligencePriority: ['historicalParallels', 'patterns', 'crossDomain'] },
      { title: 'Recommendations & Impact Assessment', promptInstruction: 'Specific policy recommendations with expected economic, social, and environmental impacts. Use ethical assessment.', maxWords: 1000, intelligencePriority: ['formulaScores', 'ethicalAssessment'] },
      { title: 'Implementation Framework', promptInstruction: 'Implementation plan, institutional responsibilities, budget implications, monitoring framework.', maxWords: 800, intelligencePriority: ['compliance', 'historicalParallels'] },
    ],
    'government-policy': [
      { title: 'Policy Context', promptInstruction: 'Describe the current policy landscape, existing frameworks, and the gap or opportunity being addressed.', maxWords: 800, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { title: 'Evidence & International Benchmarks', promptInstruction: 'Present evidence from international experience: what has worked? Use historical parallels and pattern data.', maxWords: 1200, intelligencePriority: ['historicalParallels', 'patterns', 'crossDomain'] },
      { title: 'Recommendations & Impact Assessment', promptInstruction: 'Specific policy recommendations with expected economic, social, and environmental impacts. Use ethical assessment.', maxWords: 1000, intelligencePriority: ['formulaScores', 'ethicalAssessment'] },
      { title: 'Implementation Framework', promptInstruction: 'Implementation plan, institutional responsibilities, budget implications, monitoring framework.', maxWords: 800, intelligencePriority: ['compliance', 'historicalParallels'] },
    ],
    // Trade
    'trade': [
      { title: 'Trade Context & Opportunity', promptInstruction: 'Market analysis, trade flows, regulatory environment, tariff structure. Use compliance data.', maxWords: 800, intelligencePriority: ['compliance', 'patterns'] },
      { title: 'Compliance & Regulatory Requirements', promptInstruction: 'Export controls, customs requirements, trade agreements, origin rules, sanctions considerations.', maxWords: 1000, intelligencePriority: ['compliance'] },
      { title: 'Commercial & Financial Analysis', promptInstruction: 'Pricing, margins, trade finance instruments, currency exposure, insurance. Use formula scores.', maxWords: 800, intelligencePriority: ['formulaScores'] },
      { title: 'Logistics & Implementation', promptInstruction: 'Supply chain, shipping, warehousing, distribution channels, timeline, risk management.', maxWords: 600, intelligencePriority: ['crossDomain'] },
    ],
    // Partnership
    'partnership': [
      { title: 'Partnership Rationale', promptInstruction: 'Strategic rationale for partnership. Market dynamics or objectives that make partnership the optimal model.', maxWords: 800, intelligencePriority: ['situationAnalysis', 'patterns'] },
      { title: 'Partner Assessment & Value Proposition', promptInstruction: 'Evaluate partner capabilities, alignment, complementarity. What each party brings and gains.', maxWords: 1000, intelligencePriority: ['ethicalAssessment', 'creativeStrategies'] },
      { title: 'Structure & Governance', promptInstruction: 'Proposed structure, equity/contribution model, governance, decision-making, IP treatment, risk allocation.', maxWords: 1000, intelligencePriority: ['compliance', 'formulaScores'] },
      { title: 'Implementation & Next Steps', promptInstruction: 'Timeline, due diligence requirements, key milestones, conditions for proceeding.', maxWords: 600, intelligencePriority: ['compliance'] },
    ],
    'partnership-consortium': [
      { title: 'Partnership Rationale', promptInstruction: 'Strategic rationale for partnership. Market dynamics or objectives that make partnership the optimal model.', maxWords: 800, intelligencePriority: ['situationAnalysis', 'patterns'] },
      { title: 'Partner Assessment & Value Proposition', promptInstruction: 'Evaluate partner capabilities, alignment, complementarity. What each party brings and gains.', maxWords: 1000, intelligencePriority: ['ethicalAssessment', 'creativeStrategies'] },
      { title: 'Structure & Governance', promptInstruction: 'Proposed structure, equity/contribution model, governance, decision-making, IP treatment, risk allocation.', maxWords: 1000, intelligencePriority: ['compliance', 'formulaScores'] },
      { title: 'Implementation & Next Steps', promptInstruction: 'Timeline, due diligence requirements, key milestones, conditions for proceeding.', maxWords: 600, intelligencePriority: ['compliance'] },
    ],
    // Intelligence / Market
    'intelligence': [
      { title: 'Intelligence Summary', promptInstruction: 'Key findings and strategic implications. What does the decision-maker need to know?', maxWords: 600, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { title: 'Market & Competitive Analysis', promptInstruction: 'Market dynamics, size, growth, competitive landscape, key players, trends. Use pattern data.', maxWords: 1500, intelligencePriority: ['patterns', 'crossDomain'] },
      { title: 'Risk & Opportunity Assessment', promptInstruction: 'Key risks and opportunities identified through analysis. Quantify where possible.', maxWords: 1000, intelligencePriority: ['formulaScores', 'situationAnalysis'] },
      { title: 'Strategic Recommendations', promptInstruction: 'Actionable recommendations based on the intelligence gathered.', maxWords: 800, intelligencePriority: ['creativeStrategies'] },
    ],
    // Operational
    'operational': [
      { title: 'Operational Context & Objectives', promptInstruction: 'Current operational landscape, objectives, success criteria, and alignment with strategic goals.', maxWords: 800, intelligencePriority: ['situationAnalysis'] },
      { title: 'Detailed Plan', promptInstruction: 'Specific actions, phases, milestones, deliverables, timelines, responsibilities. Use historical parallels for realistic planning.', maxWords: 1500, intelligencePriority: ['historicalParallels', 'compliance'] },
      { title: 'Resources & Dependencies', promptInstruction: 'People, budget, technology, infrastructure requirements. External dependencies and critical path.', maxWords: 800, intelligencePriority: ['formulaScores'] },
      { title: 'Risk Management & Monitoring', promptInstruction: 'Operational risks, contingency plans, KPIs, reporting cadence, change management.', maxWords: 600, intelligencePriority: ['situationAnalysis'] },
    ],
    'execution-project-management': [
      { title: 'Project Overview & Objectives', promptInstruction: 'Project purpose, scope, success criteria, alignment with organisational strategy.', maxWords: 800, intelligencePriority: ['situationAnalysis'] },
      { title: 'Execution Plan', promptInstruction: 'Phases, milestones, activities, deliverables, timelines, decision gates. Realistic based on comparable projects.', maxWords: 1500, intelligencePriority: ['historicalParallels'] },
      { title: 'Resources & Governance', promptInstruction: 'Team structure, budget, technology, reporting lines, steering committee, escalation procedures.', maxWords: 800, intelligencePriority: ['formulaScores', 'compliance'] },
      { title: 'Risks & Contingencies', promptInstruction: 'Project risks, mitigation strategies, contingency budget, monitoring KPIs.', maxWords: 600, intelligencePriority: ['situationAnalysis'] },
    ],
    // Communications
    'communications': [
      { title: 'Key Messages', promptInstruction: 'Core messages to communicate. Target audience considerations. Tone and positioning.', maxWords: 600, intelligencePriority: ['emotionalClimate'] },
      { title: 'Content & Narrative', promptInstruction: 'The substantive content: facts, context, achievements, outlook. Compelling narrative structure.', maxWords: 1200, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { title: 'Supporting Material', promptInstruction: 'Data points, quotes, evidence, background information that supports the key messages.', maxWords: 800, intelligencePriority: ['formulaScores', 'historicalParallels'] },
    ],
    'communications-ir': [
      { title: 'Key Messages', promptInstruction: 'Core messages to communicate. Target audience considerations. Tone and positioning.', maxWords: 600, intelligencePriority: ['emotionalClimate'] },
      { title: 'Content & Narrative', promptInstruction: 'The substantive content: facts, context, achievements, outlook. Compelling narrative structure.', maxWords: 1200, intelligencePriority: ['patterns', 'situationAnalysis'] },
      { title: 'Supporting Material', promptInstruction: 'Data points, quotes, evidence, background information that supports the key messages.', maxWords: 800, intelligencePriority: ['formulaScores', 'historicalParallels'] },
    ],
    // ESG
    'esg': [
      { title: 'ESG Context & Materiality', promptInstruction: 'Material ESG topics, reporting frameworks applied, scope of assessment.', maxWords: 600, intelligencePriority: ['ethicalAssessment', 'compliance'] },
      { title: 'Environmental Assessment', promptInstruction: 'Climate risk, emissions, energy, water, waste, biodiversity, environmental management.', maxWords: 1200, intelligencePriority: ['ethicalAssessment', 'compliance'] },
      { title: 'Social Assessment', promptInstruction: 'Labour practices, human rights, community impact, health & safety, diversity & inclusion.', maxWords: 1000, intelligencePriority: ['ethicalAssessment', 'emotionalClimate'] },
      { title: 'Governance & Improvement Plan', promptInstruction: 'Governance quality, ethics, transparency, anti-corruption. SDG alignment. Improvement roadmap with targets.', maxWords: 800, intelligencePriority: ['compliance', 'creativeStrategies'] },
    ],
    'esg-social-impact': [
      { title: 'ESG Context & Materiality', promptInstruction: 'Material ESG topics, reporting frameworks applied, scope of assessment.', maxWords: 600, intelligencePriority: ['ethicalAssessment', 'compliance'] },
      { title: 'Environmental Assessment', promptInstruction: 'Climate risk, emissions, energy, water, waste, biodiversity, environmental management.', maxWords: 1200, intelligencePriority: ['ethicalAssessment', 'compliance'] },
      { title: 'Social Assessment', promptInstruction: 'Labour practices, human rights, community impact, health & safety, diversity & inclusion.', maxWords: 1000, intelligencePriority: ['ethicalAssessment', 'emotionalClimate'] },
      { title: 'Governance & Improvement Plan', promptInstruction: 'Governance quality, ethics, transparency, anti-corruption. SDG alignment. Improvement roadmap with targets.', maxWords: 800, intelligencePriority: ['compliance', 'creativeStrategies'] },
    ],
    // Technical
    'technical': [
      { title: 'Technical Overview', promptInstruction: 'System/asset description, purpose, operating environment, design parameters, performance objectives.', maxWords: 800, intelligencePriority: ['crossDomain'] },
      { title: 'Requirements & Specifications', promptInstruction: 'Detailed technical requirements: functional, performance, reliability, scalability. Each specific and measurable.', maxWords: 1500, intelligencePriority: ['crossDomain', 'patterns'] },
      { title: 'Standards & Compliance', promptInstruction: 'Applicable technical standards, regulatory requirements, safety requirements, testing protocols.', maxWords: 800, intelligencePriority: ['compliance'] },
      { title: 'Implementation & Testing', promptInstruction: 'Implementation approach, testing plan, acceptance criteria, commissioning, handover.', maxWords: 600, intelligencePriority: ['historicalParallels'] },
    ],
    'asset-infrastructure': [
      { title: 'Technical Overview', promptInstruction: 'System/asset description, purpose, operating environment, design parameters, performance objectives.', maxWords: 800, intelligencePriority: ['crossDomain'] },
      { title: 'Requirements & Specifications', promptInstruction: 'Detailed technical requirements: functional, performance, reliability, scalability. Each specific and measurable.', maxWords: 1500, intelligencePriority: ['crossDomain', 'patterns'] },
      { title: 'Standards & Compliance', promptInstruction: 'Applicable technical standards, regulatory requirements, safety requirements, testing protocols.', maxWords: 800, intelligencePriority: ['compliance'] },
      { title: 'Implementation & Testing', promptInstruction: 'Implementation approach, testing plan, acceptance criteria, commissioning, handover.', maxWords: 600, intelligencePriority: ['historicalParallels'] },
    ],
    // Research
    'research': [
      { title: 'Research Context & Question', promptInstruction: 'The research question, significance, literature context, and gap being addressed.', maxWords: 800, intelligencePriority: ['patterns', 'historicalParallels'] },
      { title: 'Methodology & Data', promptInstruction: 'Research design, data sources, analytical framework, variables, methods. Justify choices.', maxWords: 1000, intelligencePriority: ['crossDomain'] },
      { title: 'Findings & Analysis', promptInstruction: 'Present findings with supporting evidence. Statistical analysis where applicable. Use pattern data.', maxWords: 1500, intelligencePriority: ['patterns', 'formulaScores'] },
      { title: 'Conclusions & Implications', promptInstruction: 'Conclusions, implications (policy/practical/academic), limitations, recommendations for further research.', maxWords: 600, intelligencePriority: ['creativeStrategies'] },
    ],
    // Human Capital
    'human-capital': [
      { title: 'Organisational Context', promptInstruction: 'Current organisational structure, capabilities, strategic direction, workforce demographics.', maxWords: 600, intelligencePriority: ['situationAnalysis'] },
      { title: 'Assessment & Analysis', promptInstruction: 'Detailed assessment of the human capital topic: gaps, risks, opportunities, benchmarks.', maxWords: 1200, intelligencePriority: ['patterns', 'crossDomain'] },
      { title: 'Recommendations & Action Plan', promptInstruction: 'Specific recommendations with implementation timeline, resource requirements, and expected outcomes.', maxWords: 1000, intelligencePriority: ['historicalParallels', 'creativeStrategies'] },
    ],
    // Procurement
    'procurement-supply-chain': [
      { title: 'Procurement Context', promptInstruction: 'Requirements, categories, current supply arrangements, procurement objectives.', maxWords: 600, intelligencePriority: ['situationAnalysis'] },
      { title: 'Market & Vendor Analysis', promptInstruction: 'Supply market dynamics, vendor landscape, pricing trends, capacity assessment.', maxWords: 1000, intelligencePriority: ['patterns', 'crossDomain'] },
      { title: 'Strategy & Approach', promptInstruction: 'Sourcing strategy, evaluation criteria, procurement method, timeline, compliance requirements.', maxWords: 1000, intelligencePriority: ['compliance', 'historicalParallels'] },
      { title: 'Risk & Value Management', promptInstruction: 'Supply chain risks, local content, ESG in procurement, value engineering, continuous improvement.', maxWords: 600, intelligencePriority: ['ethicalAssessment', 'compliance'] },
    ],
    // Governance & Board
    'governance-board': [
      { title: 'Governance Framework', promptInstruction: 'Board structure, committee composition, governance policies, compliance framework.', maxWords: 800, intelligencePriority: ['compliance'] },
      { title: 'Performance & Oversight', promptInstruction: 'Key metrics, operational performance, risk oversight, financial reporting, audit findings.', maxWords: 1200, intelligencePriority: ['formulaScores', 'situationAnalysis'] },
      { title: 'Issues & Decisions Required', promptInstruction: 'Material issues requiring board attention, options analysis, recommendations for decision.', maxWords: 800, intelligencePriority: ['ethicalAssessment'] },
      { title: 'Outlook & Forward Agenda', promptInstruction: 'Forward-looking priorities, upcoming decisions, regulatory changes, strategic milestones.', maxWords: 600, intelligencePriority: ['patterns', 'compliance'] },
    ],
    // Regulatory & Compliance
    'regulatory-compliance': [
      { title: 'Regulatory Landscape', promptInstruction: 'Applicable regulations, regulatory bodies, compliance obligations, recent changes.', maxWords: 600, intelligencePriority: ['compliance'] },
      { title: 'Compliance Assessment', promptInstruction: 'Current compliance status, gap analysis, control effectiveness, audit findings.', maxWords: 1000, intelligencePriority: ['compliance', 'situationAnalysis'] },
      { title: 'Remediation & Roadmap', promptInstruction: 'Actions required, responsible parties, timelines, investment needed, expected outcomes.', maxWords: 800, intelligencePriority: ['compliance', 'historicalParallels'] },
    ],
  };

  /**
   * Route document generation with category-aware fallback.
   * If the document type has a dedicated config, uses that.
   * Otherwise, uses the document's category to provide appropriate section structure.
   * This ensures ALL 247+ document types generate with proper sections.
   */
  static routeDocumentWithFallback(
    documentTypeId: string,
    category: string,
    documentTitle: string
  ): {
    config: DocumentTypeConfig | null;
    sectionPrompts: Array<{
      sectionId: string;
      title: string;
      prompt: string;
      maxWords: number;
      intelligenceFocus: string[];
    }>;
    isFallback: boolean;
  } {
    // Try exact match first
    const exact = DocumentTypeRouter.routeDocument(documentTypeId);
    if (exact) {
      return { ...exact, isFallback: false };
    }

    // Try category-based fallback
    const categoryKey = category.toLowerCase().replace(/[^a-z-]/g, '');
    const fallbackSections = DocumentTypeRouter.CATEGORY_SECTION_FALLBACKS[categoryKey]
      || DocumentTypeRouter.CATEGORY_SECTION_FALLBACKS['strategic']; // ultimate fallback

    return {
      config: null,
      sectionPrompts: fallbackSections.map((s, i) => ({
        sectionId: `fallback-${categoryKey}-${i}`,
        title: s.title,
        prompt: `Document: "${documentTitle}"\n\n${s.promptInstruction}`,
        maxWords: s.maxWords,
        intelligenceFocus: s.intelligencePriority,
      })),
      isFallback: true,
    };
  }

  /**
   * Route letter generation with category-aware fallback.
   * If the letter type has a dedicated config, uses that.
   * Otherwise, synthesises a prompt from the letter's category and title.
   * This ensures ALL 156+ letter types generate with proper structure.
   */
  static routeLetterWithFallback(
    letterTypeId: string,
    category: string,
    letterTitle: string
  ): {
    config: LetterTypeConfig | null;
    promptInstruction: string;
    isFallback: boolean;
  } {
    // Try exact match first
    const exact = DocumentTypeRouter.routeLetter(letterTypeId);
    if (exact) {
      return { ...exact, isFallback: false };
    }

    // Synthesize a category-aware prompt
    const categoryTones: Record<string, string> = {
      'government': 'formal government correspondence style - respectful, evidence-referenced, protocol-aware',
      'government-outreach': 'formal government correspondence style - respectful, evidence-referenced, protocol-aware',
      'government-response': 'formal government correspondence style - respectful, evidence-referenced, protocol-aware',
      'investment': 'formal corporate style - professional, precise, fact-backed with clear ROI focus',
      'investor-relations': 'formal corporate style - precise, data-driven, compliant with securities regulations',
      'banking-finance': 'formal banking correspondence - precise, compliant, properly structured',
      'banking & finance': 'formal banking correspondence - precise, compliant, properly structured',
      'legal': 'formal legal style - precise, unambiguous, jurisdiction-aware',
      'legal-notices': 'formal legal style - precise, unambiguous, with clear legal basis and demands',
      'compliance': 'formal compliance style - thorough, audit-ready, regulation-referenced',
      'regulatory': 'formal regulatory correspondence - respectful, regulation-referenced, evidence-based',
      'community': 'clear, accessible community engagement style - plain language, empathetic, transparent',
      'partnership': 'formal corporate style - professional, collaborative, value-focused',
      'partnership-outreach': 'formal corporate style - professional, collaborative, mutually beneficial',
      'trade': 'formal commercial style - precise trade terms, Incoterms-aware, compliant',
      'international': 'diplomatic style - measured, respectful, protocol-aware, SDG-aligned',
      'diplomatic': 'diplomatic style - measured, respectful, protocol-compliant',
      'employment': 'professional HR style - clear, compliant with labour law, appropriately warm',
      'media & pr': 'media-friendly style - newsworthy, quotable, fact-based',
      'media-pr': 'media-friendly style - newsworthy, quotable, fact-based',
      'customer': 'professional customer-facing style - clear, helpful, solution-oriented',
      'customer-relations': 'professional customer-facing style - clear, helpful, solution-oriented',
      'supplier': 'professional procurement style - clear expectations, compliance-aware',
      'supplier-relations': 'professional procurement style - clear expectations, compliance-aware',
      'acknowledgment': 'formal confirmation style - precise, complete, action-oriented',
    };

    const toneInstruction = categoryTones[category.toLowerCase()] || categoryTones[letterTypeId.split('-')[0]] || 'formal professional style - clear, precise, audience-appropriate';

    const promptInstruction = [
      `Generate a "${letterTitle}" letter.`,
      ``,
      `Tone: Write in ${toneInstruction}.`,
      ``,
      `Required structure:`,
      `1. Opening / Formal Address`,
      `2. Context & Purpose`,
      `3. Key Content & Details`,
      `4. Supporting Information / Evidence`,
      `5. Next Steps / Call to Action`,
      `6. Professional Closing`,
      ``,
      `Key requirements:`,
      `• Use concrete facts from the case context - no generic template language`,
      `• Reference specific parties, dates, amounts, and jurisdictions`,
      `• Ensure the letter achieves its stated purpose`,
      `• Comply with relevant regulations and protocols for this letter type`,
    ].join('\n');

    return {
      config: null,
      promptInstruction,
      isFallback: true,
    };
  }
}

