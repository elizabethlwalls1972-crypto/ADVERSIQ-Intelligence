/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * UNIVERSAL TRANSLATION LAYER - Reflexive Intelligence Layer (Layer 9)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Theory: Audience-Adaptive Communication + Rhetorical Theory (Aristotle) +
 *         Register Theory (Halliday, 1978)
 *
 * The Problem:
 *   A brilliant analysis means nothing if the audience can't understand it.
 *   An investor reads differently from a mayor. A community leader reads
 *   differently from a consultant. A minister reads differently from a
 *   bureaucrat. Wall Street speaks a specific dialect.
 *
 * What This Engine Does:
 *   Takes the system's analytical output and translates it into
 *   audience-specific formats:
 *
 *   1. INVESTOR - ROI-focused, risk-quantified, decision-ready
 *   2. GOVERNMENT - Policy-aligned, precedent-cited, mandate-supportive
 *   3. COMMUNITY - Impact-centred, plain language, inclusion-focused
 *   4. PARTNER/IPA - Technical, benchmarked, actionable
 *   5. EXECUTIVE - Summary-first, strategic, board-ready
 *
 * The key insight: The same data point has different meanings for
 * different audiences. "Young population" to an investor = "labour supply";
 * to a government = "employment challenge"; to a community = "our children's
 * future"; to an IPA = "demographic dividend window."
 *
 * This engine doesn't change the truth - it changes the FRAMING to match
 * how each audience processes information and makes decisions.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// TYPES
// ============================================================================

export type AudienceType = 'investor' | 'government' | 'community' | 'partner' | 'executive';

export interface TranslationInput {
  finding: string;             // The raw analytical finding
  category: FindingCategory;   // What type of finding
  confidence: number;          // 0-100
  region: string;
  sector: string;
  context: string;             // Additional context
  sourceEngine: string;        // Which engine produced this
}

export type FindingCategory =
  | 'opportunity'
  | 'risk'
  | 'competitive-advantage'
  | 'competitive-gap'
  | 'recommendation'
  | 'warning'
  | 'hidden-asset'
  | 'lifecycle-position'
  | 'identity-insight'
  | 'market-signal';

export interface TranslatedOutput {
  audience: AudienceType;
  headline: string;            // One-line summary for this audience
  body: string;                // Full translated finding
  callToAction: string;        // What this audience should do
  dataPoints: string[];        // Specific data they'll want to see
  framingNotes: string;        // How to present this in conversation
  toneGuide: string;           // How to speak to this audience
}

export interface AudiencePackage {
  audience: AudienceType;
  title: string;
  summary: string;
  sections: TranslatedOutput[];
  documentType: string;          // What type of document to create
  deliveryFormat: string;        // How to deliver it
  languageLevel: 'technical' | 'professional' | 'accessible' | 'simplified';
  rhetoricalApproach: string;    // Aristotelian: ethos, pathos, or logos-led
}

export interface TranslationReport {
  inputFindings: number;
  audiencePackages: AudiencePackage[];
  crossAudienceInsights: string[];
  doorOpenerDocuments: DoorOpenerDoc[];
  timestamp: string;
}

export interface DoorOpenerDoc {
  audience: AudienceType;
  title: string;
  purpose: string;
  structure: string[];
  keyMessage: string;
  length: string;
}

// ============================================================================
// AUDIENCE PROFILES - How Each Audience Thinks
// ============================================================================

interface AudienceProfile {
  type: AudienceType;
  primaryConcern: string;
  decisionDriver: string;
  languagePreference: string;
  attentionSpan: string;
  rhetoricalLead: 'ethos' | 'pathos' | 'logos';
  avoidTopics: string[];
  emphasiseTopics: string[];
  documentPreference: string;
  framingRules: string[];
}

const AUDIENCE_PROFILES: AudienceProfile[] = [
  {
    type: 'investor',
    primaryConcern: 'Return on investment and risk mitigation',
    decisionDriver: 'Financial return relative to risk-adjusted comparable investments',
    languagePreference: 'Financial and commercial language. Numbers first, narrative second.',
    attentionSpan: '2 minutes for initial pitch, 15 minutes for detailed case',
    rhetoricalLead: 'logos',
    avoidTopics: ['social impact (unless ESG)', 'political complexity', 'historical grievances', 'unquantified claims'],
    emphasiseTopics: ['IRR/ROI projections', 'market size', 'competitive cost position', 'risk mitigation mechanisms', 'exit options', 'comparable deals'],
    documentPreference: 'Investment memo: 2-page summary + detailed financial appendix',
    framingRules: [
      'Lead with the number - "12% projected IRR" not "an exciting opportunity"',
      'Quantify every claim - "3,200 engineering graduates/year" not "skilled workforce"',
      'Address risk upfront - investors respect honesty more than optimism',
      'Include comparables - "similar to X deal in Y region that returned Z%"',
      'Specify the ask - how much, for what, under what terms'
    ]
  },
  {
    type: 'government',
    primaryConcern: 'Policy alignment, job creation, and political viability',
    decisionDriver: 'Alignment with government priorities and electoral impact',
    languagePreference: 'Policy-aligned, precedent-backed, mandate-referenced.',
    attentionSpan: '5 minutes for briefing, 1 page for ministerial summary',
    rhetoricalLead: 'ethos',
    avoidTopics: ['criticism of current policy', 'partisan framing', 'private sector jargon', 'speculative projections'],
    emphasiseTopics: ['job creation numbers', 'alignment with national development plan', 'international precedent', 'regional equity', 'skill development', 'tax revenue impact'],
    documentPreference: 'Policy brief: 1-page executive summary with recommendations',
    framingRules: [
      'Reference the government\'s own priorities - "aligned with the National Development Plan"',
      'Lead with jobs - "X,000 direct jobs + Y,000 indirect"',
      'Cite international precedent - "Rwanda/Estonia/Ireland achieved similar with..."',
      'Frame as supporting the mandate - not creating new obligations',
      'Include implementation pathway - government needs to know "how", not just "what"'
    ]
  },
  {
    type: 'community',
    primaryConcern: 'Local impact - employment, environment, community benefit',
    decisionDriver: 'Will this help my community? Will it harm what I value?',
    languagePreference: 'Plain, accessible, honest. No jargon. Specific local impact.',
    attentionSpan: 'Variable - deep interest if directly affected, otherwise low engagement',
    rhetoricalLead: 'pathos',
    avoidTopics: ['financial returns', 'macroeconomic statistics', 'technical analysis', 'abstract policy', 'acronyms'],
    emphasiseTopics: ['local jobs', 'community facilities', 'environmental protection', 'youth opportunities', 'cultural respect', 'infrastructure improvements'],
    documentPreference: 'Community impact summary: visual, plain language, 1 page',
    framingRules: [
      'Start with impact - "This means X jobs for local people"',
      'Use local context - reference specific places, schools, roads that will benefit',
      'Be honest about trade-offs - communities detect spin instantly',
      'Show respect for existing identity - development should enhance, not replace',
      'Include community voice - show how local input will shape the project'
    ]
  },
  {
    type: 'partner',
    primaryConcern: 'Technical capability, operational readiness, and collaboration potential',
    decisionDriver: 'Can we work with this region? Do they have what we need operationally?',
    languagePreference: 'Technical, specific, data-rich. IPA-to-IPA professional language.',
    attentionSpan: '30 minutes for detailed briefing - they want depth',
    rhetoricalLead: 'logos',
    avoidTopics: ['oversimplification', 'political framing', 'generic claims', 'unverifiable data'],
    emphasiseTopics: ['specific infrastructure specs', 'talent pipeline data', 'regulatory details', 'land availability', 'utility costs', 'benchmark comparisons'],
    documentPreference: 'Technical brief: comprehensive data package with comparisons',
    framingRules: [
      'Lead with data - partners want specifics, not narrative',
      'Include source citations - IPA professionals verify claims',
      'Provide benchmark comparisons - "vs Penang, vs Clark, vs Da Nang"',
      'Detail the operational environment - utilities, logistics, labour market',
      'Include contact/coordination mechanisms for follow-up'
    ]
  },
  {
    type: 'executive',
    primaryConcern: 'Strategic fit, market opportunity, and execution risk',
    decisionDriver: 'Does this align with our strategy? Can we execute here?',
    languagePreference: 'Concise, strategic, board-ready. Structure over detail.',
    attentionSpan: '90 seconds for elevator pitch, 5 minutes for strategic case',
    rhetoricalLead: 'ethos',
    avoidTopics: ['operational details', 'community politics', 'policy minutiae', 'lengthy historical context'],
    emphasiseTopics: ['strategic alignment', 'market access', 'competitive positioning', 'execution team quality', 'timeline and milestones', 'success metrics'],
    documentPreference: 'Executive summary: 1 page, 3 key points, clear recommendation',
    framingRules: [
      'Summary first - the recommendation goes on line 1, not page 10',
      'Three key points - executives process in threes',
      'Strategic framing - "This positions us as..." not "This saves us..."',
      'Include the "So what?" - every data point must connect to a strategic implication',
      'Provide a clear decision framework - what to decide, by when, based on what'
    ]
  }
];

// ============================================================================
// VOCABULARY TRANSLATION - Same Fact, Different Words
// ============================================================================

interface VocabTranslation {
  concept: string;
  investor: string;
  government: string;
  community: string;
  partner: string;
  executive: string;
}

const VOCABULARY: VocabTranslation[] = [
  { concept: 'young population', investor: 'scalable labour supply with 20-year growth runway', government: 'demographic dividend opportunity requiring employment pipeline', community: 'opportunities for our young people to build careers at home', partner: 'workforce-age population growing at X%/year, median age Y', executive: 'workforce scalability advantage - demographic dividend through 20XX' },
  { concept: 'port access', investor: 'direct export logistics reducing per-unit shipping costs by X%', government: 'trade infrastructure asset supporting export-led growth strategy', community: 'jobs in shipping, logistics, and port services for local families', partner: 'X TEU capacity port with Y shipping lines, Z-day transit to major markets', executive: 'permanent logistical advantage - port access non-replicable by competitors' },
  { concept: 'low costs', investor: 'cost-competitive location with X% savings vs Y on fully-loaded basis', government: 'competitive cost position attracting employment-generating investment', community: 'companies can afford to set up here, creating jobs with good wages', partner: 'operating cost comparison: labour X, utilities Y, rent Z vs benchmark', executive: 'cost position creates 3-5 year window before peer regions match' },
  { concept: 'risk exists', investor: 'identified risk factors with proposed mitigation mechanisms', government: 'challenges requiring policy attention to protect development gains', community: 'we need to be aware of these challenges and plan together', partner: 'risk-adjusted assessment with detailed mitigation recommendations', executive: 'manageable downside with clear mitigation pathway' },
  { concept: 'university present', investor: 'talent pipeline institution producing X graduates/year in relevant disciplines', government: 'educational anchor supporting knowledge economy transition', community: 'our university giving young people skills for the jobs of the future', partner: 'tertiary institution with X enrolment, Y research output, Z industry partnerships', executive: 'institutional anchor providing sustainable talent supply' },
  { concept: 'economic zone', investor: 'designated zone with X tax rate, Y year holiday, Z% foreign ownership allowed', government: 'special economic zone aligned with UNCTAD best practice guidelines', community: 'designated area where new companies will build and create jobs', partner: 'PEZA/SEZ/FTZ with detailed incentive package and operational requirements', executive: 'pre-packaged regulatory environment eliminating setup friction' },
  { concept: 'infrastructure gap', investor: 'infrastructure development opportunity with government co-investment potential', government: 'infrastructure investment need with quantified economic multiplier effect', community: 'roads, power, and services that need improving for everyone\'s benefit', partner: 'infrastructure deficit requiring X investment, timeline Y, responsible agency Z', executive: 'infrastructure constraint with defined upgrade pathway and timeline' },
  { concept: 'diaspora network', investor: 'established international business networks providing market access and deal flow', government: 'diaspora engagement strategy supporting inward investment and knowledge transfer', community: 'our people overseas who can bring skills and connections back home', partner: 'diaspora-linked investment channel with quantified capital and expertise potential', executive: 'pre-existing international network - lower market entry cost' }
];

// ============================================================================
// UNIVERSAL TRANSLATION LAYER
// ============================================================================

export class UniversalTranslationLayer {

  /**
   * Translate analytical findings into audience-specific packages.
   */
  static translate(
    findings: TranslationInput[],
    audiences: AudienceType[] = ['investor', 'government', 'community', 'partner', 'executive']
  ): TranslationReport {
    const packages = audiences.map(audience => this.createPackage(findings, audience));
    const crossInsights = this.generateCrossAudienceInsights(findings);
    const doorOpeners = audiences.map(audience => this.generateDoorOpener(findings, audience));

    return {
      inputFindings: findings.length,
      audiencePackages: packages,
      crossAudienceInsights: crossInsights,
      doorOpenerDocuments: doorOpeners,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Translate a single finding for a specific audience.
   */
  static translateFinding(finding: TranslationInput, audience: AudienceType): TranslatedOutput {
    const profile = AUDIENCE_PROFILES.find(p => p.type === audience)!;

    return {
      audience,
      headline: this.createHeadline(finding, profile),
      body: this.createBody(finding, profile),
      callToAction: this.createCallToAction(finding, profile),
      dataPoints: this.selectDataPoints(finding, profile),
      framingNotes: this.createFramingNotes(finding, profile),
      toneGuide: profile.languagePreference
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PACKAGE CREATION
  // ──────────────────────────────────────────────────────────────────────────

  private static createPackage(findings: TranslationInput[], audience: AudienceType): AudiencePackage {
    const profile = AUDIENCE_PROFILES.find(p => p.type === audience)!;

    // Filter and order findings by audience relevance
    const relevant = findings
      .filter(f => !this.shouldFilter(f, profile))
      .sort((a, b) => this.audienceRelevance(b, profile) - this.audienceRelevance(a, profile));

    const sections = relevant.map(f => this.translateFinding(f, audience));

    const languageLevels: Record<AudienceType, AudiencePackage['languageLevel']> = {
      investor: 'technical',
      government: 'professional',
      community: 'accessible',
      partner: 'technical',
      executive: 'professional'
    };

    return {
      audience,
      title: this.generatePackageTitle(findings, profile),
      summary: this.generatePackageSummary(relevant, profile),
      sections,
      documentType: profile.documentPreference,
      deliveryFormat: this.recommendDeliveryFormat(profile),
      languageLevel: languageLevels[audience],
      rhetoricalApproach: this.describeRhetoricalApproach(profile)
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TRANSLATION METHODS
  // ──────────────────────────────────────────────────────────────────────────

  private static createHeadline(finding: TranslationInput, profile: AudienceProfile): string {
    const region = finding.region || 'The region';
    const category = finding.category;

    switch (profile.type) {
      case 'investor':
        switch (category) {
          case 'opportunity': return `Investment Opportunity: ${region} - ${finding.sector}`;
          case 'risk': return `Risk Alert: ${finding.finding.slice(0, 60)}`;
          case 'competitive-advantage': return `Competitive Edge: ${region} vs. Benchmark`;
          case 'hidden-asset': return `Undervalued Asset Identified: ${region}`;
          default: return `${region}: ${finding.finding.slice(0, 50)}`;
        }
      case 'government':
        switch (category) {
          case 'opportunity': return `Policy Opportunity: ${finding.sector} Investment Potential in ${region}`;
          case 'risk': return `Policy Attention Required: ${finding.finding.slice(0, 60)}`;
          case 'recommendation': return `Strategic Recommendation for ${region}`;
          default: return `${region}: Policy Brief - ${finding.category}`;
        }
      case 'community':
        switch (category) {
          case 'opportunity': return `New Opportunities Coming to ${region}`;
          case 'risk': return `Challenges Ahead - What It Means for ${region}`;
          case 'hidden-asset': return `${region}'s Hidden Strengths`;
          default: return `What's Happening in ${region}`;
        }
      case 'partner':
        return `${region} Assessment: ${finding.category.replace(/-/g, ' ').toUpperCase()} - ${finding.sector}`;
      case 'executive':
        return `${region}: ${finding.category === 'opportunity' ? 'Strategic Opportunity' : finding.category === 'risk' ? 'Risk Factor' : 'Key Finding'}`;
    }
  }

  private static createBody(finding: TranslationInput, profile: AudienceProfile): string {
    // Translate vocabulary for audience
    let translated = finding.finding;

    for (const vocab of VOCABULARY) {
      if (translated.toLowerCase().includes(vocab.concept)) {
        const replacement = vocab[profile.type as keyof VocabTranslation] as string;
        if (replacement) {
          translated = translated + ` [Translated for ${profile.type}: ${replacement}]`;
          break;
        }
      }
    }

    // Add audience-specific framing
    switch (profile.type) {
      case 'investor':
        return `${translated}\n\nConfidence level: ${finding.confidence}%. Source: ${finding.sourceEngine}.`;
      case 'government':
        return `${translated}\n\nThis finding supports policy action aligned with regional development priorities.`;
      case 'community':
        return this.simplifyLanguage(translated);
      case 'partner':
        return `${translated}\n\nSource engine: ${finding.sourceEngine}. Confidence: ${finding.confidence}%. Sector: ${finding.sector}.`;
      case 'executive':
        return translated.split('.').slice(0, 2).join('.') + '.'; // First two sentences only
    }
  }

  private static createCallToAction(finding: TranslationInput, profile: AudienceProfile): string {
    switch (profile.type) {
      case 'investor': return 'Request detailed financial model and site visit arrangement';
      case 'government': return 'Commission feasibility study and inter-agency coordination';
      case 'community': return 'Join community consultation sessions to shape this opportunity';
      case 'partner': return 'Schedule technical briefing and data sharing session';
      case 'executive': return 'Decide: Proceed to due diligence phase or pass';
    }
  }

  private static selectDataPoints(finding: TranslationInput, profile: AudienceProfile): string[] {
    const base = [`Confidence: ${finding.confidence}%`, `Sector: ${finding.sector}`, `Region: ${finding.region}`];

    switch (profile.type) {
      case 'investor':
        return [...base, 'Comparable deal returns', 'Risk mitigation mechanisms', 'Timeline to revenue'];
      case 'government':
        return [...base, 'Estimated job creation', 'Tax revenue impact', 'Policy alignment score'];
      case 'community':
        return ['Local jobs expected', 'Community facilities impact', 'Environmental considerations'];
      case 'partner':
        return [...base, 'Infrastructure specs', 'Talent pipeline data', 'Regulatory framework details'];
      case 'executive':
        return ['Strategic fit score', 'Risk/reward assessment', 'Decision deadline'];
    }
  }

  private static createFramingNotes(finding: TranslationInput, profile: AudienceProfile): string {
    return profile.framingRules[0] || 'Present factually with audience-appropriate context';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FILTERING & RELEVANCE
  // ──────────────────────────────────────────────────────────────────────────

  private static shouldFilter(finding: TranslationInput, profile: AudienceProfile): boolean {
    const findingLower = finding.finding.toLowerCase();
    return profile.avoidTopics.some(topic => findingLower.includes(topic.toLowerCase()));
  }

  private static audienceRelevance(finding: TranslationInput, profile: AudienceProfile): number {
    let relevance = 50;
    const findingLower = finding.finding.toLowerCase();

    // Boost for matching emphasis topics
    for (const topic of profile.emphasiseTopics) {
      if (findingLower.includes(topic.toLowerCase())) relevance += 10;
    }

    // Category relevance
    switch (profile.type) {
      case 'investor':
        if (finding.category === 'opportunity' || finding.category === 'competitive-advantage') relevance += 20;
        if (finding.category === 'risk') relevance += 15; // Investors want to know risks
        break;
      case 'government':
        if (finding.category === 'recommendation') relevance += 20;
        if (finding.category === 'competitive-gap') relevance += 15;
        break;
      case 'community':
        if (finding.category === 'opportunity') relevance += 20;
        if (finding.category === 'warning') relevance += 15;
        break;
      case 'partner':
        if (finding.category === 'competitive-advantage' || finding.category === 'competitive-gap') relevance += 20;
        break;
      case 'executive':
        if (finding.category === 'recommendation') relevance += 25;
        break;
    }

    // Confidence boost
    relevance += (finding.confidence / 100) * 10;

    return relevance;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LANGUAGE SIMPLIFICATION (for community audience)
  // ──────────────────────────────────────────────────────────────────────────

  private static simplifyLanguage(text: string): string {
    const replacements: Array<[RegExp, string]> = [
      [/\bFDI\b/g, 'foreign investment'],
      [/\bROI\b/g, 'return on investment'],
      [/\binfrastructure\b/gi, 'roads, power, and services'],
      [/\bstakeholders\b/gi, 'people involved'],
      [/\bfeasibility\b/gi, 'whether this can work'],
      [/\bscalable\b/gi, 'able to grow'],
      [/\bpipeline\b/gi, 'supply of'],
      [/\bcompetitive advantage\b/gi, 'edge over other places'],
      [/\bdemographic dividend\b/gi, 'young population advantage'],
      [/\bbenchmark\b/gi, 'compare with'],
      [/\bsector\b/gi, 'industry'],
      [/\breadiness\b/gi, 'preparedness'],
      [/\bmitigation\b/gi, 'ways to reduce'],
      [/\bdiversification\b/gi, 'spreading across different areas']
    ];

    let simplified = text;
    for (const [pattern, replacement] of replacements) {
      simplified = simplified.replace(pattern, replacement);
    }

    return simplified;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DOOR OPENER DOCUMENTS
  // ──────────────────────────────────────────────────────────────────────────

  private static generateDoorOpener(findings: TranslationInput[], audience: AudienceType): DoorOpenerDoc {
    const _profile = AUDIENCE_PROFILES.find(p => p.type === audience)!;
    const region = findings[0]?.region || 'the region';

    const doorOpeners: Record<AudienceType, DoorOpenerDoc> = {
      investor: {
        audience: 'investor',
        title: `Investment Opportunity Brief: ${region}`,
        purpose: 'Open the door for direct investor engagement - get the first meeting',
        structure: ['1. Market Opportunity (2 sentences)', '2. Competitive Position (3 data points)', '3. Risk-Adjusted Return Thesis', '4. Comparable Transactions', '5. Next Steps + Contact'],
        keyMessage: `${region} presents a data-backed investment opportunity in ${findings[0]?.sector || 'key sectors'} with quantified advantages over competitor locations`,
        length: '1 page (front), financial summary (back)'
      },
      government: {
        audience: 'government',
        title: `Policy Brief: Investment-Led Development in ${region}`,
        purpose: 'Secure government support, funding, or policy alignment',
        structure: ['1. Alignment with National Priorities', '2. Job Creation Forecast', '3. International Precedent', '4. Implementation Pathway', '5. Policy Ask (specific)'],
        keyMessage: `Investment in ${region}'s ${findings[0]?.sector || 'economy'} aligns with national development objectives and can create measurable employment and revenue outcomes`,
        length: '2 pages maximum with appendix'
      },
      community: {
        audience: 'community',
        title: `What This Means for ${region}`,
        purpose: 'Build community support and social licence for development',
        structure: ['1. What is happening (plain language)', '2. What it means for jobs', '3. What it means for services', '4. How your voice matters', '5. What happens next'],
        keyMessage: `Real opportunities are available for ${region} that can create jobs and improve services - and the community's input matters`,
        length: '1 page, visual, plain language'
      },
      partner: {
        audience: 'partner',
        title: `Technical Assessment: ${region} - ${findings[0]?.sector || 'Multi-Sector'}`,
        purpose: 'Enable IPA-to-IPA or consultant-to-consultant technical collaboration',
        structure: ['1. Regional Profile & Data', '2. Competitive Benchmarking', '3. Infrastructure Assessment', '4. Talent Pipeline Analysis', '5. Regulatory Framework', '6. Engagement Protocol'],
        keyMessage: `Comprehensive, data-validated assessment of ${region} with benchmarks against comparable locations`,
        length: '5-10 pages, data-rich'
      },
      executive: {
        audience: 'executive',
        title: `${region}: Strategic Assessment`,
        purpose: 'Enable C-suite decision on whether to explore this location',
        structure: ['1. Strategic Recommendation (1 sentence)', '2. Three Reasons Why', '3. Risk Summary (1 paragraph)', '4. Decision Framework'],
        keyMessage: `${region} merits strategic consideration based on [top 3 advantages] with manageable risk profile`,
        length: '1 page, no appendix'
      }
    };

    return doorOpeners[audience];
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CROSS-AUDIENCE INSIGHTS
  // ──────────────────────────────────────────────────────────────────────────

  private static generateCrossAudienceInsights(findings: TranslationInput[]): string[] {
    const insights: string[] = [];

    const opportunities = findings.filter(f => f.category === 'opportunity');
    const risks = findings.filter(f => f.category === 'risk' || f.category === 'warning');

    if (opportunities.length > 0 && risks.length > 0) {
      insights.push('IMPORTANT: Investors and executives need to hear about both opportunities AND risks - filtering out risks destroys credibility');
    }

    if (findings.length > 5) {
      insights.push('With multiple findings, each audience package should be selective - present the 3-5 most relevant findings per audience, not all');
    }

    insights.push('Ensure consistent data across all audience packages - the facts don\'t change, only the framing');
    insights.push('The community audience package should be created BEFORE investor engagement - social licence prevents project delays');

    return insights;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ──────────────────────────────────────────────────────────────────────────

  private static generatePackageTitle(findings: TranslationInput[], profile: AudienceProfile): string {
    const region = findings[0]?.region || 'Regional';
    switch (profile.type) {
      case 'investor': return `${region} Investment Intelligence Brief`;
      case 'government': return `${region} Policy Intelligence Brief`;
      case 'community': return `What This Means for ${region}`;
      case 'partner': return `${region} Technical Assessment Package`;
      case 'executive': return `${region}: Strategic Assessment`;
    }
  }

  private static generatePackageSummary(findings: TranslationInput[], profile: AudienceProfile): string {
    const region = findings[0]?.region || 'The region';
    const opportunities = findings.filter(f => f.category === 'opportunity');
    const risks = findings.filter(f => f.category === 'risk' || f.category === 'warning');

    switch (profile.type) {
      case 'investor':
        return `${region} presents ${opportunities.length} investment opportunities with ${risks.length} identified risk factors. Confidence-weighted assessment follows.`;
      case 'government':
        return `This brief identifies ${findings.length} actionable findings for ${region}, aligned with regional development priorities.`;
      case 'community':
        return `Here's what's being planned for ${region} and what it means for local families and businesses.`;
      case 'partner':
        return `Technical assessment of ${region} across ${findings.length} dimensions with competitive benchmarking.`;
      case 'executive':
        return `${findings.length} key findings on ${region} - recommendation and decision framework follow.`;
    }
  }

  private static recommendDeliveryFormat(profile: AudienceProfile): string {
    switch (profile.type) {
      case 'investor': return 'PDF investment memo + live presentation (15 min max)';
      case 'government': return 'Printed policy brief + 5-minute ministerial briefing';
      case 'community': return 'Town hall presentation + infographic handout + Q&A session';
      case 'partner': return 'Shared digital workspace + video conference walkthrough';
      case 'executive': return '1-page printed summary + 90-second verbal pitch';
    }
  }

  private static describeRhetoricalApproach(profile: AudienceProfile): string {
    switch (profile.rhetoricalLead) {
      case 'logos': return 'Logic-led: Data and evidence first. Build the case through numbers and comparisons. Let the facts make the argument.';
      case 'pathos': return 'Impact-led: Connect to human outcomes first. Show how this affects real people. Use stories and specific examples.';
      case 'ethos': return 'Credibility-led: Establish authority and trust first. Reference precedent, expertise, and institutional backing. Then present findings.';
    }
  }
}

export default UniversalTranslationLayer;
