/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UNIVERSAL PROBLEM ADAPTER — NSIL v2 Layer 11
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The NSIL was originally built for regional economic development consulting.
 * Its 10-layer architecture (adversarial debate, formula scoring, Monte Carlo,
 * cognitive modeling, ethical governance) is domain-agnostic.
 *
 * This adapter translates ANY problem — business growth, government fiscal policy,
 * healthcare reform, education design, environmental economics, personal career
 * strategy — into the NSIL's parameter format so every engine can process it.
 *
 * Domain taxonomy:
 *   BUSINESS      — growth, strategy, product, competition, operations, finance
 *   GOVERNMENT    — policy, fiscal, infrastructure, public services, regulation
 *   SOCIAL        — equity, health, education, community, rights, welfare
 *   ENVIRONMENTAL — climate, resources, biodiversity, sustainability, land
 *   ECONOMIC      — macro, trade, monetary, labour, productivity, growth
 *   PERSONAL      — career, income, skills, goals, relationships, transitions
 *
 * Architecture:
 *   1. Domain classifier — identifies which domain(s) the problem belongs to
 *   2. Entity extractor — pulls key actors, organizations, locations, sectors
 *   3. Objective parser — identifies primary and secondary goals
 *   4. Constraint mapper — identifies what cannot change vs what is assumed fixed
 *   5. Success metric builder — translates vague goals into measurable outcomes
 *   6. NSIL parameter constructor — builds the ReportParameters-compatible object
 *   7. Domain context injector — adds domain-specific scoring weights and knowledge
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProblemDomain =
  | 'business'
  | 'government'
  | 'social'
  | 'environmental'
  | 'economic'
  | 'personal'
  | 'compound'; // Multiple domains intersecting

export interface RawProblemInput {
  problemStatement: string;       // Free-text description of any problem
  additionalContext?: string;     // Optional background
  stakeholders?: string[];        // Who is involved or affected
  constraints?: string[];         // What cannot change
  timeline?: string;              // Urgency or time horizon
  successDefinition?: string;     // What would "solved" look like
  geography?: string;             // Location if relevant
}

export interface ExtractedEntity {
  name: string;
  type: 'person' | 'organization' | 'location' | 'sector' | 'concept';
  role: string;                   // How this entity relates to the problem
  importance: 'primary' | 'secondary' | 'contextual';
}

export interface ParsedObjective {
  objective: string;
  type: 'primary' | 'secondary' | 'implicit';
  measurability: 'quantitative' | 'qualitative' | 'binary';
  suggestedMetric: string;        // How to measure achievement
  timeframe: string;
}

export interface MappedConstraint {
  constraint: string;
  type: 'hard' | 'soft' | 'assumed';
  // hard = genuinely cannot change, soft = negotiable, assumed = untested belief
  challengeability: number;       // 0-100: how likely this can actually be changed
}

export interface DomainContext {
  domain: ProblemDomain;
  subdomain: string;
  scoringWeightOverrides: Record<string, number>;  // Override default NSIL weights
  relevantFormulas: string[];                       // Which NSIL formulas apply
  knowledgeBaseModules: string[];                   // Which knowledge modules to activate
  benchmarkSources: string[];                       // Reference databases to query
  ethicalDimensions: string[];                      // Domain-specific ethical considerations
}

export interface AdaptedNSILInput {
  // Standard NSIL fields (compatible with ReportParameters)
  organizationName: string;
  currentMatter: string;
  objectives: string;
  targetSectors: string[];
  targetCountry: string;
  targetRegion: string;
  constraints: string;
  timeline: string;
  investmentSize: string;
  partnerType: string;
  complianceRequirements: string;

  // Extended Universal fields
  problemDomain: ProblemDomain;
  domainContext: DomainContext;
  extractedEntities: ExtractedEntity[];
  parsedObjectives: ParsedObjective[];
  mappedConstraints: MappedConstraint[];
  successMetrics: string[];
  adaptationNotes: string[];

  // Meta
  originalInput: RawProblemInput;
  adaptedAt: string;
  confidenceScore: number;        // 0-100: how well the adapter captured the problem
}

// ─── Domain Knowledge ─────────────────────────────────────────────────────────

const DOMAIN_CLASSIFIERS: Array<{
  domain: ProblemDomain;
  keywords: string[];
  weight: number;
}> = [
  { domain: 'business', keywords: ['revenue', 'profit', 'customers', 'market', 'product', 'startup', 'company', 'sales', 'growth', 'competition', 'brand', 'scale', 'investor', 'valuation', 'b2b', 'b2c', 'saas', 'enterprise', 'launch', 'team', 'hiring'], weight: 1 },
  { domain: 'government', keywords: ['policy', 'government', 'ministry', 'regulation', 'public', 'services', 'citizens', 'tax', 'fiscal', 'budget', 'infrastructure', 'legislation', 'reform', 'procurement', 'municipality', 'province', 'national', 'state', 'law'], weight: 1 },
  { domain: 'social', keywords: ['poverty', 'inequality', 'health', 'education', 'community', 'welfare', 'rights', 'inclusion', 'access', 'housing', 'food', 'safety', 'violence', 'discrimination', 'marginalized', 'vulnerable', 'social', 'equity', 'justice'], weight: 1 },
  { domain: 'environmental', keywords: ['climate', 'carbon', 'emissions', 'environment', 'forest', 'water', 'biodiversity', 'pollution', 'renewable', 'energy', 'sustainability', 'conservation', 'land', 'ocean', 'waste', 'ecosystem', 'nature', 'green'], weight: 1 },
  { domain: 'economic', keywords: ['gdp', 'inflation', 'unemployment', 'trade', 'currency', 'monetary', 'fiscal', 'macro', 'productivity', 'labour', 'supply chain', 'industry', 'sector', 'export', 'import', 'capital', 'investment', 'economic'], weight: 1 },
  { domain: 'personal', keywords: ['i want', 'my business', 'my career', 'my goal', 'personal', 'myself', 'i need', 'how do i', 'my situation', 'my company', 'my plan', 'transition', 'change career', 'skills', 'side business', 'freelance'], weight: 1.5 }
];

const DOMAIN_CONTEXTS: Record<ProblemDomain, Omit<DomainContext, 'domain'>> = {
  business: {
    subdomain: 'commercial strategy',
    scoringWeightOverrides: { marketAccess: 0.25, talentReadiness: 0.20, financialReadiness: 0.20, regulatoryPathway: 0.10, operationalCapacity: 0.15, innovationCapacity: 0.10 },
    relevantFormulas: ['SPI', 'RROI', 'SCF', 'MPI', 'CAI', 'TAM', 'SAM'],
    knowledgeBaseModules: ['MarketEntryMethodology', 'CompetitiveAnalysis', 'FinancialProjection', 'OperationalStrategy'],
    benchmarkSources: ['World Bank Business Rankings', 'Industry Benchmarks', 'Startup Outcome Data'],
    ethicalDimensions: ['fair competition', 'labour standards', 'consumer protection', 'tax compliance']
  },
  government: {
    subdomain: 'public policy and governance',
    scoringWeightOverrides: { institutionalCapacity: 0.25, stakeholderAlignment: 0.20, regulatoryPathway: 0.20, financialReadiness: 0.15, politicalStability: 0.20 },
    relevantFormulas: ['SEAM', 'GCI', 'CCS', 'TPI', 'ARI', 'ESG', 'IVAS'],
    knowledgeBaseModules: ['GovernanceReform', 'PublicFinance', 'PolicyDesign', 'InstitutionalDevelopment', 'HistoricalGovernancePatterns'],
    benchmarkSources: ['World Governance Indicators', 'VDEM Database', 'Transparency International', 'IMF Fiscal Monitor'],
    ethicalDimensions: ['democratic accountability', 'intergenerational equity', 'distributional justice', 'rule of law', 'transparency']
  },
  social: {
    subdomain: 'social development and inclusion',
    scoringWeightOverrides: { communityBenefit: 0.30, ethicalAlignment: 0.25, stakeholderAlignment: 0.20, financialSustainability: 0.15, policySupport: 0.10 },
    relevantFormulas: ['ESG', 'SEAM', 'GCI', 'CCS'],
    knowledgeBaseModules: ['SocialProtection', 'HealthcareDesign', 'EducationSystems', 'CommunityDevelopment'],
    benchmarkSources: ['UNDP Human Development Index', 'WHO Health Data', 'UNESCO Education Stats', 'World Bank Poverty Data'],
    ethicalDimensions: ['human dignity', 'universal access', 'non-discrimination', 'participation rights', 'cultural sensitivity']
  },
  environmental: {
    subdomain: 'environmental and climate economics',
    scoringWeightOverrides: { environmentalImpact: 0.30, regulatoryCompliance: 0.20, communityBenefit: 0.20, financialSustainability: 0.20, innovationCapacity: 0.10 },
    relevantFormulas: ['ESG', 'GRI', 'SEAM', 'SPI'],
    knowledgeBaseModules: ['ClimateEconomics', 'NaturalCapitalAccounting', 'GreenFinance', 'EcosystemServices'],
    benchmarkSources: ['IPCC Reports', 'World Bank Climate Data', 'Carbon Disclosure Project', 'Global Forest Watch'],
    ethicalDimensions: ['intergenerational equity', 'climate justice', 'biodiversity rights', 'precautionary principle', 'polluter pays']
  },
  economic: {
    subdomain: 'macroeconomic policy and development',
    scoringWeightOverrides: { macroStability: 0.25, institutionalCapacity: 0.20, tradePolicy: 0.15, labourMarket: 0.15, infrastructureReadiness: 0.15, innovationCapacity: 0.10 },
    relevantFormulas: ['RROI', 'SPI', 'SCF', 'IVAS', 'GCI'],
    knowledgeBaseModules: ['MacroeconomicPolicy', 'TradeEconomics', 'MonetaryPolicy', 'FiscalPolicy', 'LabourEconomics'],
    benchmarkSources: ['IMF World Economic Outlook', 'World Bank Economic Data', 'OECD Statistics', 'UN Comtrade'],
    ethicalDimensions: ['distributional equity', 'intergenerational sustainability', 'labour rights', 'democratic accountability']
  },
  personal: {
    subdomain: 'individual and small enterprise development',
    scoringWeightOverrides: { personalReadiness: 0.30, marketOpportunity: 0.25, financialViability: 0.20, networkAccess: 0.15, skillsGap: 0.10 },
    relevantFormulas: ['SPI', 'SCF', 'MPI'],
    knowledgeBaseModules: ['EntrepreneurshipPatterns', 'CareerDevelopment', 'SmallBusinessStrategy', 'PersonalFinance'],
    benchmarkSources: ['Small Business Outcome Data', 'Industry Entry Benchmarks', 'Skills Market Data'],
    ethicalDimensions: ['personal autonomy', 'fair market access', 'consumer protection']
  },
  compound: {
    subdomain: 'multi-domain complex problem',
    scoringWeightOverrides: {},
    relevantFormulas: ['SPI', 'RROI', 'SEAM', 'SCF', 'ESG', 'GCI'],
    knowledgeBaseModules: ['SystemsThinking', 'CrossSectorPartnerships', 'ComplexProblemFrameworks'],
    benchmarkSources: ['Cross-sector outcome databases', 'Systems change evaluations'],
    ethicalDimensions: ['systemic equity', 'power dynamics', 'unintended consequences', 'inclusion']
  }
};

// ─── Domain Classification ─────────────────────────────────────────────────────

function classifyDomain(input: RawProblemInput): ProblemDomain {
  const text = `${input.problemStatement} ${input.additionalContext || ''}`.toLowerCase();
  
  const scores = DOMAIN_CLASSIFIERS.map(d => ({
    domain: d.domain,
    score: d.keywords.filter(kw => text.includes(kw)).length * d.weight
  }));

  const sorted = scores.sort((a, b) => b.score - a.score);
  
  // If top 2 have similar scores, it's compound
  if (sorted.length >= 2 && sorted[0].score > 0 && sorted[1].score >= sorted[0].score * 0.7) {
    return 'compound';
  }

  return sorted[0].score > 0 ? sorted[0].domain : 'economic'; // Default to economic
}

// ─── Entity Extraction ─────────────────────────────────────────────────────────

function extractEntities(input: RawProblemInput): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const text = input.problemStatement;

  // Extract named organizations (Title Case multi-word patterns)
  const orgPattern = /\b([A-Z][a-z]+ (?:Corporation|Company|Group|Ltd|Inc|Authority|Ministry|Department|Agency|Institute|Fund|Bank|NGO|Foundation))\b/g;
  let match;
  while ((match = orgPattern.exec(text)) !== null) {
    entities.push({ name: match[1], type: 'organization', role: 'stakeholder', importance: 'secondary' });
  }

  // Extract countries/regions
  const geoKeywords = ['in', 'across', 'within', 'throughout', 'across', 'for'];
  for (const kw of geoKeywords) {
    const geoPattern = new RegExp(`\\b${kw}\\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)\\b`, 'g');
    while ((match = geoPattern.exec(text)) !== null) {
      if (match[1].length > 2) {
        entities.push({ name: match[1], type: 'location', role: 'operating context', importance: 'secondary' });
      }
    }
  }

  // Add stakeholders from explicit list
  if (input.stakeholders) {
    for (const s of input.stakeholders) {
      entities.push({ name: s, type: 'person', role: 'named stakeholder', importance: 'primary' });
    }
  }

  return entities.slice(0, 10); // Cap at 10 for performance
}

// ─── Objective Parsing ─────────────────────────────────────────────────────────

function parseObjectives(input: RawProblemInput): ParsedObjective[] {
  const text = input.problemStatement.toLowerCase();
  const objectives: ParsedObjective[] = [];

  const objectivePatterns = [
    { pattern: /(?:want to|need to|must|goal is to|objective is to|trying to|aim to)\s+([^.,;]+)/gi, type: 'primary' as const },
    { pattern: /(?:also|additionally|secondary goal|would like to|hoping to)\s+([^.,;]+)/gi, type: 'secondary' as const }
  ];

  for (const { pattern, type } of objectivePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1].trim();
      if (raw.length > 10 && raw.length < 200) {
        objectives.push({
          objective: raw,
          type,
          measurability: raw.match(/\d|percent|revenue|cost|time|rate|number/) ? 'quantitative' : 'qualitative',
          suggestedMetric: `Track progress on "${raw.slice(0, 40)}..." via quarterly review`,
          timeframe: input.timeline || '12-24 months'
        });
      }
    }
  }

  // If no explicit objectives found, derive from the problem statement
  if (objectives.length === 0) {
    objectives.push({
      objective: `Resolve: ${input.problemStatement.slice(0, 120)}`,
      type: 'primary',
      measurability: 'qualitative',
      suggestedMetric: input.successDefinition || 'Define a binary success condition: what does "resolved" look like?',
      timeframe: input.timeline || 'To be determined'
    });
  }

  return objectives.slice(0, 6);
}

// ─── Constraint Mapping ─────────────────────────────────────────────────────────

function mapConstraints(input: RawProblemInput): MappedConstraint[] {
  const constraints: MappedConstraint[] = [];
  const allConstraints = [
    ...(input.constraints || []),
    ...extractImpliedConstraints(input.problemStatement)
  ];

  const hardKeywords = ['cannot', 'must not', 'illegal', 'law requires', 'regulation prevents', 'physically impossible'];
  const softKeywords = ['prefer not to', 'ideally', 'would rather', 'trying to avoid'];

  for (const c of allConstraints) {
    const lower = c.toLowerCase();
    const isHard = hardKeywords.some(k => lower.includes(k));
    const isSoft = softKeywords.some(k => lower.includes(k));
    constraints.push({
      constraint: c,
      type: isHard ? 'hard' : isSoft ? 'soft' : 'assumed',
      challengeability: isHard ? 15 : isSoft ? 60 : 75
    });
  }

  return constraints.slice(0, 8);
}

function extractImpliedConstraints(text: string): string[] {
  const implied: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes('budget') || lower.includes('limited funding')) implied.push('Resource constraints exist');
  if (lower.includes('time') || lower.includes('deadline')) implied.push('Time pressure exists');
  if (lower.includes('stakeholder') || lower.includes('political')) implied.push('Stakeholder management required');
  if (lower.includes('regulatory') || lower.includes('compliance')) implied.push('Regulatory compliance required');
  return implied;
}

// ─── NSIL Parameter Construction ───────────────────────────────────────────────

function buildNSILParameters(
  input: RawProblemInput,
  domain: ProblemDomain,
  entities: ExtractedEntity[],
  objectives: ParsedObjective[],
  constraints: MappedConstraint[]
): Pick<AdaptedNSILInput, 'organizationName' | 'currentMatter' | 'objectives' | 'targetSectors' | 'targetCountry' | 'targetRegion' | 'constraints' | 'timeline' | 'investmentSize' | 'partnerType' | 'complianceRequirements'> {
  const primaryOrg = entities.find(e => e.type === 'organization' && e.importance === 'primary');
  const location = entities.find(e => e.type === 'location') || { name: input.geography || 'Global', type: 'location' };

  return {
    organizationName: primaryOrg?.name || `${domain.charAt(0).toUpperCase() + domain.slice(1)} Initiative`,
    currentMatter: input.problemStatement.slice(0, 300),
    objectives: objectives.map(o => o.objective).join('; '),
    targetSectors: [domain, 'cross-sector'],
    targetCountry: location.name || 'Global',
    targetRegion: input.geography || location.name || 'Global',
    constraints: constraints.map(c => c.constraint).join('; ') || 'None specified',
    timeline: input.timeline || '12-36 months',
    investmentSize: 'To be determined based on analysis',
    partnerType: domain === 'government' ? 'Government / Development Bank / IFC' : domain === 'business' ? 'Private Sector / VC / Strategic Partner' : 'Multi-stakeholder',
    complianceRequirements: DOMAIN_CONTEXTS[domain]?.ethicalDimensions.join(', ') || 'Standard compliance'
  };
}

// ─── Main Adapter ─────────────────────────────────────────────────────────────

export class UniversalProblemAdapter {
  /**
   * Transform ANY problem statement into NSIL-compatible input.
   * The NSIL was designed for regional investment decisions.
   * This adapter makes it work for any complex problem.
   */
  static adapt(input: RawProblemInput): AdaptedNSILInput {
    const notes: string[] = [`[UniversalProblemAdapter] Processing: "${input.problemStatement.slice(0, 60)}..."`];

    const domain = classifyDomain(input);
    notes.push(`[Classifier] Domain: ${domain}`);

    const entities = extractEntities(input);
    notes.push(`[EntityExtractor] Found ${entities.length} entities`);

    const objectives = parseObjectives(input);
    notes.push(`[ObjectiveParser] Found ${objectives.length} objectives`);

    const constraints = mapConstraints(input);
    notes.push(`[ConstraintMapper] Found ${constraints.length} constraints`);

    const domainCtx = DOMAIN_CONTEXTS[domain];
    const domainContext: DomainContext = { domain, ...domainCtx };

    const nsil = buildNSILParameters(input, domain, entities, objectives, constraints);

    const successMetrics = [
      input.successDefinition || 'Define: what does "solved" look like in measurable terms?',
      ...objectives.map(o => o.suggestedMetric)
    ].slice(0, 4);

    // Confidence: how well did we capture the problem?
    const confidence = Math.min(95, 40
      + (objectives.length > 0 ? 20 : 0)
      + (constraints.length > 0 ? 15 : 0)
      + (entities.length > 0 ? 15 : 0)
      + (input.additionalContext ? 10 : 0)
    );

    notes.push(`[Adapter] Complete. Confidence: ${confidence}/100`);

    return {
      ...nsil,
      problemDomain: domain,
      domainContext,
      extractedEntities: entities,
      parsedObjectives: objectives,
      mappedConstraints: constraints,
      successMetrics,
      adaptationNotes: notes,
      originalInput: input,
      adaptedAt: new Date().toISOString(),
      confidenceScore: confidence
    };
  }

  /**
   * Get the domain-specific scoring weights for NSIL formula execution
   */
  static getDomainWeights(domain: ProblemDomain): Record<string, number> {
    return DOMAIN_CONTEXTS[domain]?.scoringWeightOverrides || {};
  }

  /**
   * List which NSIL formulas are most relevant for a given domain
   */
  static getRelevantFormulas(domain: ProblemDomain): string[] {
    return DOMAIN_CONTEXTS[domain]?.relevantFormulas || ['SPI', 'SEAM', 'SCF'];
  }
}

export default UniversalProblemAdapter;
