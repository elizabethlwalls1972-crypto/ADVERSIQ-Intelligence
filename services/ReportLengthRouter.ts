/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — REPORT LENGTH ROUTER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Determines the appropriate report length tier based on:
 *   - Source document richness (word count / estimated page count)
 *   - Case readiness score (0–100)
 *   - Number of brain engines that produced output
 *   - Sector + jurisdiction complexity
 *
 * Returns a full OPTIONS MENU for the user, including:
 *   1. Primary report tier (recommended)
 *   2. All tier options (scale up / scale down)
 *   3. Additional complementary reports
 *   4. Unconventional ideas the system can surface
 *   5. Letter options
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportTierKey =
  | 'quick-note'
  | 'situation-brief'
  | 'advisory-report'
  | 'strategy-document'
  | 'full-case-study';

export interface ReportTier {
  key: ReportTierKey;
  label: string;
  pageRange: string;
  wordRange: string;
  sectionCount: number;
  description: string;
  bestFor: string;
  turnaround: string;
  /** Max words the AI will generate across all sections */
  maxWords: number;
  /** Section titles included */
  sections: string[];
  recommended?: boolean;
}

export interface AdditionalReport {
  id: string;
  title: string;
  description: string;
  rationale: string;
  pages: string;
  category: 'analysis' | 'strategy' | 'compliance' | 'communication' | 'finance';
}

export interface UnconventionalIdea {
  id: string;
  title: string;
  concept: string;
  precedent?: string;
  boldnesScore: number; // 1–10, where 10 = completely unprecedented
  risk: 'low' | 'medium' | 'high';
  potentialImpact: 'moderate' | 'significant' | 'transformational';
  whyNotConsidered: string;
}

export interface LetterOption {
  id: string;
  title: string;
  addressedTo: string;
  purpose: string;
  recommended: boolean;
  pages: string;
}

export interface ReportOptionsMenu {
  /** The tier the system recommends for this case */
  recommendedTier: ReportTierKey;
  /** All available tiers with recommended flag set */
  tiers: ReportTier[];
  /** Complementary documents that strengthen the primary report */
  additionalReports: AdditionalReport[];
  /** Ideas the system surfaces that would NOT normally be considered */
  unconventionalIdeas: UnconventionalIdea[];
  /** Letter options */
  letters: LetterOption[];
  /** Diagnostic context used to choose the tier */
  diagnostics: {
    sourcePageEstimate: number;
    sourceWordCount: number;
    caseReadiness: number;
    enginesActivated: number;
    complexityScore: number;
    jurisdiction: string;
    sector: string;
  };
}

// ─── Tier definitions ─────────────────────────────────────────────────────────

const ALL_TIERS: ReportTier[] = [
  {
    key: 'quick-note',
    label: '1-Page Executive Briefing Note',
    pageRange: '1',
    wordRange: '300–500',
    sectionCount: 3,
    maxWords: 500,
    description:
      'A single-page situation note: what is happening, what it means, and one recommended action. ' +
      'Formatted for reading in under 2 minutes.',
    bestFor: 'Ministry briefings, oral presentations, internal updates, urgent decision points.',
    turnaround: 'Immediate',
    sections: [
      'Situation Summary (3 sentences)',
      'Critical Finding & What It Means',
      'Single Recommended Action',
    ],
  },
  {
    key: 'situation-brief',
    label: '2–4 Page Situation Brief',
    pageRange: '2–4',
    wordRange: '800–1,500',
    sectionCount: 5,
    maxWords: 1500,
    description:
      'A concise advisory brief covering the core problem, key evidence, stakeholder landscape, ' +
      'and priority recommendations. Suitable for senior decision-makers.',
    bestFor: 'Ministerial briefings, board papers, donor introductions, quick stakeholder alignment.',
    turnaround: '2–5 minutes to generate',
    sections: [
      'Executive Summary',
      'Problem Statement & Evidence',
      'Stakeholder Overview',
      'Key Risks',
      'Priority Recommendations (top 3)',
    ],
  },
  {
    key: 'advisory-report',
    label: '5–12 Page Advisory Report',
    pageRange: '5–12',
    wordRange: '2,500–4,500',
    sectionCount: 8,
    maxWords: 4500,
    description:
      'A structured advisory report with full problem diagnosis, historical precedent analysis, ' +
      'stakeholder mapping, risk register, and a multi-pillar recommendation set with implementation steps.',
    bestFor: 'NEDA submissions, donor presentations, interagency working groups, cabinet papers.',
    turnaround: '5–10 minutes to generate',
    sections: [
      'Executive Summary',
      'Problem Diagnosis',
      'Historical Parallel Analysis',
      'Stakeholder & Adversarial Map',
      'Intelligence Scores',
      'Reform Strategy (3 pillars)',
      'Risk Register',
      'Recommended Immediate Actions',
    ],
  },
  {
    key: 'strategy-document',
    label: '15–25 Page Strategy Document',
    pageRange: '15–25',
    wordRange: '5,000–8,000',
    sectionCount: 12,
    maxWords: 8000,
    description:
      'A comprehensive strategy document with full research synthesis, regional comparative analysis, ' +
      'fiscal modelling, partner matrix, implementation roadmap, M&E framework, and appendices.',
    bestFor: 'Government strategy papers, multilateral funding proposals, academic policy submissions.',
    turnaround: '15–25 minutes to generate',
    sections: [
      'Executive Summary',
      'Introduction & Mandate',
      'Situation Analysis',
      'Historical & Comparative Evidence',
      'Stakeholder & Political Economy Analysis',
      'Composite Intelligence Scores',
      'Three-Pillar Reform Framework',
      'Partner Intelligence Matrix',
      'Fiscal & Budget Analysis',
      'Implementation Roadmap (36 months)',
      'Risk Register & Mitigation',
      'Monitoring & Evaluation Framework',
    ],
  },
  {
    key: 'full-case-study',
    label: '30–50 Page Full Case Study',
    pageRange: '30–50',
    wordRange: '10,000–15,000',
    sectionCount: 18,
    maxWords: 15000,
    description:
      'The complete BW Global Advisory intelligence product. Every engine output included in full. ' +
      'Source document annotations, counterfactual modelling, sector deep-dives, regional scorecards, ' +
      'partner investment profiles, full legal/regulatory analysis, and multi-scenario planning.',
    bestFor: 'ADB/World Bank funding applications, presidential policy proposals, academic publications, comprehensive reform agendas.',
    turnaround: '30–45 minutes to generate',
    sections: [
      'Cover & Classification',
      'Executive Summary',
      'Methodology & Intelligence Sources',
      'Country & Sector Context',
      'Regional Development Dynamics',
      'Historical Parallel Deep-Dive (5 cases)',
      'Stakeholder & Political Economy Matrix',
      'Adversarial Scenario Analysis',
      'Composite Intelligence Scorecards',
      'Decentralization Diagnostic',
      'Infrastructure & Connectivity Gap Analysis',
      'Fiscal Architecture Reform',
      'Conflict-Development Integration Framework',
      'Partner Intelligence & Investment Matrix',
      'Three-Pillar Reform Strategy',
      'Implementation Roadmap (60 months)',
      'Risk, Uncertainty & Mitigation Register',
      'Monitoring, Evaluation & Learning Framework',
    ],
  },
];

// ─── Complexity scorer ────────────────────────────────────────────────────────

function computeComplexityScore(params: {
  sourceWordCount: number;
  caseReadiness: number;
  enginesActivated: number;
  hasConflict: boolean;
  hasMultipleRegions: boolean;
  hasMultistakeholder: boolean;
}): number {
  let score = 0;
  // Source richness
  if (params.sourceWordCount > 10000) score += 30;
  else if (params.sourceWordCount > 4000) score += 20;
  else if (params.sourceWordCount > 1000) score += 10;
  else score += 5;
  // Case readiness
  score += Math.round(params.caseReadiness * 0.3);
  // Engine breadth
  score += Math.min(30, params.enginesActivated * 3);
  // Structural complexity flags
  if (params.hasConflict) score += 10;
  if (params.hasMultipleRegions) score += 10;
  if (params.hasMultistakeholder) score += 10;
  return Math.min(100, score);
}

function chooseTier(complexityScore: number, sourcePageEstimate: number): ReportTierKey {
  if (sourcePageEstimate >= 25 || complexityScore >= 80) return 'full-case-study';
  if (sourcePageEstimate >= 10 || complexityScore >= 60) return 'strategy-document';
  if (sourcePageEstimate >= 4 || complexityScore >= 40) return 'advisory-report';
  if (sourcePageEstimate >= 1 || complexityScore >= 20) return 'situation-brief';
  return 'quick-note';
}

// ─── Additional reports builder ───────────────────────────────────────────────

function buildAdditionalReports(params: {
  jurisdiction: string;
  sector: string;
  hasConflict: boolean;
  caseReadiness: number;
}): AdditionalReport[] {
  const reports: AdditionalReport[] = [];

  reports.push({
    id: 'add-due-diligence',
    title: 'Regional Fiscal Due Diligence Report',
    description: `Deep-dive analysis of IRA allocation mechanics, LGU revenue-expenditure gaps by region, and fiscal transfer reform options for ${params.jurisdiction}.`,
    rationale: 'The source document identifies growing vertical fiscal imbalance as a structural blocker. A dedicated fiscal analysis provides the numbers needed for reform proposals.',
    pages: '8–14 pages',
    category: 'finance',
  });

  reports.push({
    id: 'add-partner-matrix',
    title: 'Partner Investment & Engagement Matrix',
    description: `Ranked institutional partners (ADB, World Bank, JICA, AIIB, DFC, USAID, Temasek) mapped against all three reform pillars with entry points, modalities, and funding envelopes.`,
    rationale: 'PartnerIntelligenceEngine has already scored 12 candidates. A standalone partner document accelerates donor engagement and co-financing discussions.',
    pages: '6–10 pages',
    category: 'strategy',
  });

  reports.push({
    id: 'add-stakeholder-engagement',
    title: 'Stakeholder Engagement & Political Economy Analysis',
    description: `Full adversarial mapping of supporters, resistors, and blockers across 5 stakeholder groups — central agencies, LGU mayors, donor community, Mindanao leadership, OFW diaspora.`,
    rationale: 'AdversarialReasoningService produced a 5-persona map. This expands it into a full engagement strategy with messaging, sequencing, and red-flag early-warning indicators.',
    pages: '8–12 pages',
    category: 'communication',
  });

  if (params.hasConflict) {
    reports.push({
      id: 'add-conflict-development',
      title: 'Mindanao Conflict-Development Integration Brief',
      description: `Dedicated analysis of the Mindanao/ARMM situation: governance capture, ARMM worsening indicators, peace process history (Jakarta Accord, MILF/MNLF), and integrated compact framework.`,
      rationale: 'The source document identifies conflict as the single largest barrier to southern Philippine development. This cannot be treated as a sub-section — it requires its own document with Presidential-level recommendations.',
      pages: '10–16 pages',
      category: 'analysis',
    });
  }

  reports.push({
    id: 'add-infra-corridor',
    title: 'Domestic Corridor Infrastructure Business Case',
    description: `Investment-grade business case for the Cebu–Davao–Cagayan de Oro domestic corridor: traffic modelling, financing structure, JICA/AIIB co-financing pathway, procurement approach, and 36-month delivery schedule.`,
    rationale: 'NSIL and RegionalOrchestrator both rank domestic corridor investment as the highest-leverage single intervention. This document turns strategy into a bankable project.',
    pages: '12–20 pages',
    category: 'finance',
  });

  if (params.caseReadiness >= 50) {
    reports.push({
      id: 'add-risk-register',
      title: 'Risk Assessment & Mitigation Register',
      description: `Full risk register across political, fiscal, conflict, donor fragmentation, and OFW-remittance-reinforcement dimensions. Includes CounterfactualEngine what-if scenarios.`,
      rationale: 'Any submission to ADB, World Bank, or Congress requires a standalone risk register at this level of reform ambition.',
      pages: '5–8 pages',
      category: 'compliance',
    });
  }

  return reports;
}

// ─── Unconventional ideas builder ─────────────────────────────────────────────

function buildUnconventionalIdeas(params: {
  jurisdiction: string;
  sector: string;
  hasConflict: boolean;
}): UnconventionalIdea[] {
  const ideas: UnconventionalIdea[] = [];

  ideas.push({
    id: 'unc-ofw-bonds',
    title: 'OFW Diaspora Regional Development Bonds',
    concept:
      'Issue sub-sovereign bonds targeted exclusively at OFW workers tied directly to development projects in their home regions. ' +
      'Remittances (~$8.5B/yr) currently reinforce Manila and globally connected regions. ' +
      'Diaspora bonds redirect a fraction into lagging regions while giving OFWs a direct stake in their origin communities.',
    precedent: 'India Millennium Deposits (1998) raised $4.2B. Israel Diaspora Bonds — $50B+ raised over 70 years.',
    boldnesScore: 7,
    risk: 'medium',
    potentialImpact: 'significant',
    whyNotConsidered:
      'Philippine policy focus has been on maximising remittance volume not redirecting it. BSP and DBM have no current mechanism for region-targeted diaspora bonds. Politically seen as "taxing" OFWs.',
  });

  ideas.push({
    id: 'unc-competitive-regionalism-score',
    title: 'Public Competitive Regionalism Scorecard',
    concept:
      'Publish a monthly real-time scorecard ranking all 17 Philippine regions on governance quality, infrastructure delivery, ' +
      'business registration speed, and investment attraction. Make it impossible to ignore for local politicians. ' +
      'Connect scorecard position to IRA bonus allocations (+5% for top quartile, accountability review for bottom quartile).',
    precedent: "Singapore's internal agency performance rankings. Colombia's DNP municipal performance index.",
    boldnesScore: 6,
    risk: 'low',
    potentialImpact: 'significant',
    whyNotConsidered:
      'Philippine politics is personality-driven not performance-driven. DILG has resisted public performance rankings because they embarrass incumbent politicians. ' +
      'The Galing Pook awards exist but are awards not consequences.',
  });

  ideas.push({
    id: 'unc-archipelago-logistics',
    title: 'Archipelago Last-Mile Logistics Network (Drone + Ferry)',
    concept:
      'Instead of roads and bridges (geographically impractical across 7,100 islands), ' +
      'invest in a public-private inter-island fast-ferry and cargo-drone network connecting secondary ports. ' +
      'Target the 500 inhabited islands with no current scheduled transport to the nearest commercial hub. ' +
      'This is a domestic connectivity intervention with no road-infrastructure equivalent.',
    precedent: 'Indonesia\'s "Tol Laut" sea toll program connecting outer islands. Vanuatu\'s drone medicine delivery program.',
    boldnesScore: 8,
    risk: 'medium',
    potentialImpact: 'transformational',
    whyNotConsidered:
      'Philippine infrastructure thinking defaults to roads and traditional ports. ' +
      'DPWH and NEDA have no drone logistics mandate. Regulatory framework for commercial cargo drones does not yet exist in the Philippines.',
  });

  if (params.hasConflict) {
    ideas.push({
      id: 'unc-armm-international-zone',
      title: 'ARMM Special Economic Zone Under International Administration',
      concept:
        'Propose a time-limited (10-year) special economic zone in ARMM jointly administered by UNDP, ADB, and an ASEAN governance observer, ' +
        'with Philippine sovereignty fully intact but day-to-day regulatory and procurement governance ring-fenced from domestic political capture. ' +
        'Create a governance trust that bypasses the patronage networks that have captured ARMM for decades.',
      precedent: 'Kosovo international administration model. Timor-Leste UN UNTAET transition. Rwanda post-genocide governance reset with international technical support.',
      boldnesScore: 10,
      risk: 'high',
      potentialImpact: 'transformational',
      whyNotConsidered:
        'Seen domestically as ceding sovereignty. MNLF and MILF would have competing views. Philippine central government would resist the implied criticism of its governance capacity. ' +
        'Politically radioactive — but the ARMM governance failure is documented and worsening.',
    });
  }

  ideas.push({
    id: 'unc-carbon-mindanao',
    title: 'Mindanao Forest Carbon Credit Development Finance',
    concept:
      'Mindanao contains the largest remaining forest cover in the Philippines. ' +
      'Structure a sovereign carbon credit program monetising this asset through voluntary carbon markets (VCM) or Article 6 Paris Agreement bilateral deals, ' +
      'with 100% of proceeds ring-fenced for Mindanao regional development. ' +
      'Bypass IRA allocation politics entirely — Mindanao funds itself through its natural assets.',
    precedent: 'Indonesia-Norway REDD+ agreement ($1B). Ecuador Yasuní ITT (partial). Peru Amazon carbon credit framework.',
    boldnesScore: 7,
    risk: 'medium',
    potentialImpact: 'significant',
    whyNotConsidered:
      'Philippines has no active Article 6 bilateral deal framework. Mindanao forest land tenure is disputed in conflict zones. ' +
      'Carbon market expertise absent from DENR regional offices. ' +
      'Seen as "selling nature" — political optics are complex despite the development finance logic.',
  });

  ideas.push({
    id: 'unc-natural-economic-zones',
    title: 'Cross-Border Natural Economic Zones (Philippines–Indonesia–Malaysia)',
    concept:
      'The Sulu-Sulawesi maritime corridor already functions as an informal cross-border economic zone ' +
      '(the Brunei-Indonesia-Malaysia-Philippines East ASEAN Growth Area exists on paper but is inactive). ' +
      'Formally recognise and invest in this cross-border zone as a growth pole — treating it as a natural economic zone not constrained by national borders. ' +
      'Cebu–Davao–Manado–Tawau as one integrated regional economy.',
    precedent: 'Mekong subregion (GMS). Singapore–Johor–Riau growth triangle. Tumen River Area Development Programme.',
    boldnesScore: 6,
    risk: 'medium',
    potentialImpact: 'transformational',
    whyNotConsidered:
      'Mindanao conflict makes cross-border security cooperation politically difficult. BIMP-EAGA framework has stalled for 30 years due to lack of political champions. ' +
      'Sovereignty sensitivities around Sabah claim complicate Malaysia engagement.',
  });

  return ideas;
}

// ─── Letter options builder ───────────────────────────────────────────────────

function buildLetterOptions(params: {
  jurisdiction: string;
  hasConflict: boolean;
  caseReadiness: number;
}): LetterOption[] {
  const letters: LetterOption[] = [];

  letters.push({
    id: 'letter-neda-submission',
    title: 'Formal Policy Submission to NEDA',
    addressedTo: 'National Economic and Development Authority (NEDA)',
    purpose: 'Present the three-pillar reform framework for inclusion in the Philippine Development Plan. Requests formal feasibility study commission.',
    recommended: true,
    pages: '3–5 pages',
  });

  letters.push({
    id: 'letter-adb-engagement',
    title: 'ADB Partnership Engagement Letter',
    addressedTo: 'Asian Development Bank — Sustainable Development and Climate Change Department',
    purpose: 'Formalise government engagement with ADB on IRA reform technical assistance and corridor infrastructure co-financing. References existing ADB Philippines country partnership strategy.',
    recommended: true,
    pages: '2–3 pages',
  });

  letters.push({
    id: 'letter-jica-infra',
    title: 'JICA Infrastructure Co-Financing Proposal',
    addressedTo: 'Japan International Cooperation Agency — Philippines Office',
    purpose: 'Propose a government-to-government infrastructure corridor program. JICA has existing ODA pipeline for Philippines transport. This letter initiates the project identification process.',
    recommended: true,
    pages: '2–4 pages',
  });

  letters.push({
    id: 'letter-president-mindanao',
    title: 'Presidential Briefing — Mindanao Development Compact',
    addressedTo: 'Office of the President of the Philippines',
    purpose: 'Elevate the conflict-development nexus above bureaucratic level. Requests Presidential statement of commitment to integrated compact and designation of a Presidential envoy.',
    recommended: params.hasConflict,
    pages: '1–2 pages',
  });

  letters.push({
    id: 'letter-congress-lgc',
    title: 'Congressional Briefing — LGC Amendment Package',
    addressedTo: 'House Committee on Local Government / Senate Committee on Local Government',
    purpose: 'Table an LGC amendment package addressing fiscal vertical imbalance, property tax mandate, IRA equity reform, and intergovernmental coordination mechanisms.',
    recommended: params.caseReadiness >= 60,
    pages: '2–3 pages',
  });

  letters.push({
    id: 'letter-armm-governor',
    title: 'Engagement Letter — ARMM Governor',
    addressedTo: 'BARMM / ARMM Regional Governor',
    purpose: 'Initiate formal dialogue on ARMM governance reform, conflict-development compact, and Mindanao carbon credit framework. Requests joint task force formation.',
    recommended: params.hasConflict,
    pages: '1–2 pages',
  });

  letters.push({
    id: 'letter-world-bank',
    title: 'World Bank Technical Assistance Request',
    addressedTo: 'World Bank Philippines Country Office',
    purpose: 'Request technical assistance for property tax reform design, LGU fiscal capacity building, and IRA allocation formula redesign. References World Bank existing Philippines engagement.',
    recommended: params.caseReadiness >= 40,
    pages: '2–3 pages',
  });

  return letters;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export class ReportLengthRouter {
  /**
   * Compute the full options menu for a given case.
   *
   * @param params - Case parameters from the OS
   * @returns Complete ReportOptionsMenu ready to render in ReportOptionsPanel
   */
  static computeOptions(params: {
    sourceWordCount: number;
    caseReadiness: number;
    enginesActivated: number;
    jurisdiction: string;
    sector: string;
    hasConflict?: boolean;
    hasMultipleRegions?: boolean;
    hasMultistakeholder?: boolean;
  }): ReportOptionsMenu {
    const {
      sourceWordCount,
      caseReadiness,
      enginesActivated,
      jurisdiction,
      sector,
      hasConflict = false,
      hasMultipleRegions = false,
      hasMultistakeholder = false,
    } = params;

    const sourcePageEstimate = Math.round(sourceWordCount / 350);

    const complexityScore = computeComplexityScore({
      sourceWordCount,
      caseReadiness,
      enginesActivated,
      hasConflict,
      hasMultipleRegions,
      hasMultistakeholder,
    });

    const recommendedTierKey = chooseTier(complexityScore, sourcePageEstimate);

    const tiers = ALL_TIERS.map(t => ({
      ...t,
      recommended: t.key === recommendedTierKey,
    }));

    return {
      recommendedTier: recommendedTierKey,
      tiers,
      additionalReports: buildAdditionalReports({ jurisdiction, sector, hasConflict, caseReadiness }),
      unconventionalIdeas: buildUnconventionalIdeas({ jurisdiction, sector, hasConflict }),
      letters: buildLetterOptions({ jurisdiction, hasConflict, caseReadiness }),
      diagnostics: {
        sourcePageEstimate,
        sourceWordCount,
        caseReadiness,
        enginesActivated,
        complexityScore,
        jurisdiction,
        sector,
      },
    };
  }

  /**
   * Estimate word count of an uploaded file's text content.
   */
  static estimateWordCount(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Estimate page count from word count (average 350 words/page for formatted docs).
   */
  static estimatePageCount(wordCount: number): number {
    return Math.max(1, Math.round(wordCount / 350));
  }

  /** Get a single tier by key */
  static getTier(key: ReportTierKey): ReportTier {
    return ALL_TIERS.find(t => t.key === key) ?? ALL_TIERS[2];
  }
}

export default ReportLengthRouter;
