/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CASE STUDY ANALYZER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Takes uploaded document text (case studies, reports, proposals, mandates)
 * and runs FULL NSIL + adversarial + historical analysis to produce:
 *
 *   1. Structured case study breakdown (sections, evidence, gaps)
 *   2. Strength/weakness diagnostic with scores
 *   3. NSIL scoring across all relevant dimensions
 *   4. Historical parallel matching
 *   5. Adversarial persona debate (5 perspectives)
 *   6. Replication viability assessment
 *   7. Partner/investment matching readiness
 *   8. Recommended documents & letters to generate
 *
 * This service bridges the upload gap - uploaded documents are no longer
 * cosmetic. Every uploaded file feeds directly into the intelligence pipeline.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { IngestedDocumentMeta } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface CaseStudySection {
  id: string;
  title: string;
  content: string;
  quality: 'strong' | 'adequate' | 'weak' | 'missing';
  score: number; // 0-100
  notes: string;
}

export interface StrengthWeakness {
  type: 'strength' | 'weakness';
  category: string;
  description: string;
  evidence: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  recommendation?: string;
}

export interface CaseStudyAnalysis {
  id: string;
  sourceFilename: string;
  analyzedAt: string;
  processingTimeMs: number;

  // Structured breakdown
  title: string;
  country: string;
  sector: string;
  timeframe: string;
  stakeholders: string[];

  // Case study sections
  sections: CaseStudySection[];
  overallCompleteness: number; // 0-100

  // Strengths & weaknesses
  strengths: StrengthWeakness[];
  weaknesses: StrengthWeakness[];

  // NSIL-style scoring
  scores: {
    governanceQuality: number;
    stakeholderAlignment: number;
    financialViability: number;
    implementationReadiness: number;
    riskManagement: number;
    evidenceStrength: number;
    replicationViability: number;
    partnerMatchReadiness: number;
    overallViability: number;
  };

  // Adversarial perspectives
  adversarialDebate: {
    skeptic: string;
    advocate: string;
    regulator: string;
    accountant: string;
    operator: string;
    consensus: string;
    consensusStrength: number;
  };

  // Historical parallels
  historicalParallels: {
    name: string;
    country: string;
    similarity: number;
    outcome: string;
    lesson: string;
  }[];

  // Recommendations
  recommendations: string[];
  suggestedDocuments: string[];
  suggestedLetters: string[];

  // Raw content for re-use
  rawContent: string;
  wordCount: number;
}

// ============================================================================
// TEXT PARSING UTILITIES
// ============================================================================

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function extractCountry(text: string): string {
  const countryPatterns = [
    /philippines/i, /vietnam/i, /indonesia/i, /thailand/i, /malaysia/i,
    /india/i, /china/i, /japan/i, /south korea/i, /australia/i,
    /new zealand/i, /united states/i, /united kingdom/i, /canada/i,
    /brazil/i, /mexico/i, /nigeria/i, /south africa/i, /kenya/i,
    /egypt/i, /morocco/i, /ghana/i, /ethiopia/i, /tanzania/i,
    /colombia/i, /peru/i, /chile/i, /argentina/i, /poland/i,
    /germany/i, /france/i, /italy/i, /spain/i, /portugal/i,
    /netherlands/i, /sweden/i, /norway/i, /denmark/i, /finland/i,
    /singapore/i, /hong kong/i, /taiwan/i, /bangladesh/i, /pakistan/i,
    /sri lanka/i, /myanmar/i, /cambodia/i, /laos/i, /nepal/i
  ];
  for (const pattern of countryPatterns) {
    const match = text.match(pattern);
    if (match) return match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
  }
  return 'Unknown';
}

function extractSector(text: string): string {
  const sectorPatterns: [RegExp, string][] = [
    [/agricultur|farm|crop|rural/i, 'Agriculture & Rural Development'],
    [/energy|power|solar|wind|renewable/i, 'Energy'],
    [/health|hospital|medical|pharma/i, 'Healthcare'],
    [/education|school|university|training/i, 'Education'],
    [/infrastructure|road|bridge|port|transport/i, 'Infrastructure'],
    [/technology|digital|software|IT|telecom/i, 'Technology'],
    [/finance|bank|credit|microfinance/i, 'Financial Services'],
    [/manufacturing|industrial|factory/i, 'Manufacturing'],
    [/tourism|hospitality|hotel/i, 'Tourism'],
    [/mining|mineral|resource/i, 'Mining & Resources'],
    [/environment|climate|sustainability/i, 'Environment & Climate'],
    [/governance|government|public.*sector|decentraliz/i, 'Governance & Public Sector'],
    [/trade|export|import|commerce/i, 'Trade & Commerce'],
    [/housing|urban|real.*estate/i, 'Housing & Urban Development'],
  ];
  for (const [pattern, sector] of sectorPatterns) {
    if (pattern.test(text)) return sector;
  }
  return 'General Development';
}

function extractStakeholders(text: string): string[] {
  const stakeholders: string[] = [];
  const patterns: [RegExp, string][] = [
    [/local.*government|LGU|municipal/i, 'Local Government Units'],
    [/national.*government|central.*government/i, 'National Government'],
    [/NGO|non-government/i, 'NGOs'],
    [/private.*sector|business|corporate/i, 'Private Sector'],
    [/community|citizen|resident|people/i, 'Community / Citizens'],
    [/farmer|fisherfolk|producer/i, 'Primary Producers'],
    [/investor|fund|capital/i, 'Investors'],
    [/international.*body|world.*bank|UN|FAO|ADB/i, 'International Bodies'],
    [/university|academic|research/i, 'Academic / Research'],
    [/cooperative|association/i, 'Cooperatives / Associations'],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(text)) stakeholders.push(label);
  }
  return stakeholders.length > 0 ? stakeholders : ['Not Identified'];
}

function extractTitle(text: string): string {
  // Try to find a title-like first line
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines.slice(0, 5)) {
    if (line.length > 10 && line.length < 200 && !line.startsWith('http')) {
      return line.replace(/^#+\s*/, '').replace(/^\d+\s*/, '');
    }
  }
  return 'Uploaded Case Study';
}

// ============================================================================
// SECTION EXTRACTION
// ============================================================================

interface SectionCandidate {
  id: string;
  title: string;
  keywords: RegExp;
  required: boolean;
}

const CASE_STUDY_SECTIONS: SectionCandidate[] = [
  { id: 'background', title: 'Background & Context', keywords: /background|context|introduction|overview|rationale|history/i, required: true },
  { id: 'problem', title: 'Problem Definition', keywords: /problem|challenge|issue|gap|need|shortcoming|weakness/i, required: true },
  { id: 'intervention', title: 'Intervention / Approach', keywords: /intervention|approach|solution|strategy|method|programme|project|training|initiative/i, required: true },
  { id: 'governance', title: 'Governance & Institutional Framework', keywords: /governance|institution|structure|mechanism|authority|coordination|management|oversight/i, required: false },
  { id: 'implementation', title: 'Implementation Process', keywords: /implement|process|execution|operation|delivery|undertaking|facilitat/i, required: true },
  { id: 'stakeholders', title: 'Stakeholder Engagement', keywords: /stakeholder|participation|engagement|partnership|collaboration|consultation|civil.*society/i, required: false },
  { id: 'outcomes', title: 'Outcomes & Results', keywords: /outcome|result|effect|impact|achievement|success|accomplishment|gain/i, required: true },
  { id: 'financial', title: 'Financial / Resource Analysis', keywords: /financ|budget|fund|cost|investment|resource|capital|revenue/i, required: false },
  { id: 'risks', title: 'Risks & Constraints', keywords: /risk|constraint|barrier|obstacle|limitation|problem|issue|challenge|difficulty/i, required: false },
  { id: 'lessons', title: 'Lessons Learned & Preconditions', keywords: /lesson|precondition|condition|learning|recommendation|conclusion|replicat/i, required: true },
];

function extractSections(text: string): CaseStudySection[] {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30);
  const sections: CaseStudySection[] = [];

  for (const sectionDef of CASE_STUDY_SECTIONS) {
    const matchingParagraphs = paragraphs.filter(p => sectionDef.keywords.test(p));
    const content = matchingParagraphs.slice(0, 4).join('\n\n').trim();
    const hasContent = content.length > 50;

    let quality: CaseStudySection['quality'] = 'missing';
    let score = 0;

    if (hasContent) {
      const wordCount = countWords(content);
      if (wordCount > 200) { quality = 'strong'; score = Math.min(95, 60 + wordCount / 20); }
      else if (wordCount > 80) { quality = 'adequate'; score = 40 + wordCount / 10; }
      else { quality = 'weak'; score = Math.max(15, wordCount / 5); }
    }

    const notes = !hasContent
      ? `${sectionDef.title} is not addressed in the document.${sectionDef.required ? ' This is a critical gap.' : ''}`
      : quality === 'weak'
        ? `${sectionDef.title} is present but lacks depth. More evidence and detail needed.`
        : quality === 'adequate'
          ? `${sectionDef.title} is covered with basic information. Could be strengthened with specific data and examples.`
          : `${sectionDef.title} is well-documented with sufficient detail.`;

    sections.push({
      id: sectionDef.id,
      title: sectionDef.title,
      content: content || '',
      quality,
      score: Math.round(score),
      notes,
    });
  }

  return sections;
}

// ============================================================================
// STRENGTH / WEAKNESS EXTRACTION
// ============================================================================

function analyzeStrengthsWeaknesses(text: string, sections: CaseStudySection[]): { strengths: StrengthWeakness[]; weaknesses: StrengthWeakness[] } {
  const strengths: StrengthWeakness[] = [];
  const weaknesses: StrengthWeakness[] = [];

  // Analyze based on section quality
  for (const section of sections) {
    if (section.quality === 'strong') {
      strengths.push({
        type: 'strength',
        category: section.title,
        description: `${section.title} is thoroughly documented.`,
        evidence: section.content.substring(0, 200) + '...',
        severity: 'moderate',
      });
    }
    if (section.quality === 'missing' || section.quality === 'weak') {
      weaknesses.push({
        type: 'weakness',
        category: section.title,
        description: section.quality === 'missing'
          ? `${section.title} is completely absent from the document.`
          : `${section.title} lacks sufficient depth and evidence.`,
        evidence: section.quality === 'missing' ? 'No content found' : section.content.substring(0, 150),
        severity: section.quality === 'missing' ? 'critical' : 'major',
        recommendation: section.quality === 'missing'
          ? `Add a dedicated ${section.title} section with specific data, timelines, and evidence.`
          : `Expand ${section.title} with quantitative data, specific examples, and measurable indicators.`,
      });
    }
  }

  // Content-based strength/weakness patterns
  const contentPatterns: { pattern: RegExp; isStrength: boolean; category: string; description: string; severity: StrengthWeakness['severity'] }[] = [
    { pattern: /participat|bottom.*up|community.*driven|people.*centered/i, isStrength: true, category: 'Participatory Approach', description: 'Uses participatory/community-driven methodology.', severity: 'moderate' },
    { pattern: /pilot.*test|pilot.*municipality|action.*training/i, isStrength: true, category: 'Evidence-Based Testing', description: 'Includes pilot testing or action-research methodology.', severity: 'moderate' },
    { pattern: /replicat|scale|expand/i, isStrength: true, category: 'Scalability Consideration', description: 'Addresses replication or scaling potential.', severity: 'minor' },
    { pattern: /tripartite|GO.*NGO|public.*private/i, isStrength: true, category: 'Multi-Sector Collaboration', description: 'Demonstrates cross-sector partnership model.', severity: 'moderate' },
    { pattern: /legislative|legal.*framework|republic.*act|local.*government.*code/i, isStrength: true, category: 'Legal/Policy Grounding', description: 'Grounded in legislative or policy framework.', severity: 'moderate' },
    { pattern: /no.*measurable|lack.*data|no.*quantitative|limited.*data/i, isStrength: false, category: 'Evidence Gap', description: 'Lacks quantitative evidence or measurable outcomes.', severity: 'critical' },
    { pattern: /political.*dependency|political.*influence|unsupportive.*official/i, isStrength: false, category: 'Political Dependency Risk', description: 'Success depends on political support which may change.', severity: 'major' },
    { pattern: /limited.*fund|insufficient.*budget|resource.*constraint/i, isStrength: false, category: 'Financial Sustainability', description: 'Financial sustainability is uncertain or under-resourced.', severity: 'major' },
    { pattern: /not.*sustain|sustainability.*concern|how.*to.*sustain/i, isStrength: false, category: 'Sustainability Risk', description: 'Long-term sustainability of outcomes is questioned.', severity: 'major' },
    { pattern: /wait.*and.*see|limited.*attendance|low.*participation/i, isStrength: false, category: 'Participation Risk', description: 'Community engagement faces participation barriers.', severity: 'moderate' },
    { pattern: /no.*KPI|no.*indicator|no.*metric|no.*baseline/i, isStrength: false, category: 'Measurement Gap', description: 'No clear KPIs, indicators, or baseline metrics defined.', severity: 'critical' },
    { pattern: /centrali[sz]|reconcentrat|recentrali[sz]/i, isStrength: false, category: 'Governance Regression Risk', description: 'Risk of recentralization or power reconcentration.', severity: 'major' },
  ];

  for (const { pattern, isStrength, category, description, severity } of contentPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Find surrounding context for evidence
      const matchIndex = text.indexOf(match[0]);
      const start = Math.max(0, matchIndex - 100);
      const end = Math.min(text.length, matchIndex + match[0].length + 100);
      const evidence = '...' + text.substring(start, end).trim() + '...';

      if (isStrength) {
        strengths.push({ type: 'strength', category, description, evidence, severity });
      } else {
        weaknesses.push({
          type: 'weakness', category, description, evidence, severity,
          recommendation: `Address ${category.toLowerCase()} with specific mitigation actions and contingency plans.`,
        });
      }
    }
  }

  // Check for missing KPIs / metrics
  const hasNumbers = /\d+%|\$[\d,]+|[\d,]+ (hectares|farmers|beneficiaries|people|households|communities|villages|municipalities)/i.test(text);
  if (!hasNumbers) {
    weaknesses.push({
      type: 'weakness',
      category: 'Quantitative Evidence',
      description: 'Document contains no measurable outcomes, figures, or quantitative evidence.',
      evidence: 'No numerical data found in text.',
      severity: 'critical',
      recommendation: 'Add specific metrics: beneficiary numbers, area coverage, budget figures, timeline milestones, and outcome indicators.',
    });
  } else {
    strengths.push({
      type: 'strength',
      category: 'Quantitative Evidence',
      description: 'Contains specific numbers, metrics, or measurable data points.',
      evidence: 'Numerical data found in document.',
      severity: 'moderate',
    });
  }

  return { strengths, weaknesses };
}

// ============================================================================
// SCORING ENGINE
// ============================================================================

function scoreCase(sections: CaseStudySection[], text: string, strengths: StrengthWeakness[], weaknesses: StrengthWeakness[]): CaseStudyAnalysis['scores'] {
  const sectionScore = (id: string) => sections.find(s => s.id === id)?.score || 0;

  const governanceQuality = Math.round((sectionScore('governance') * 0.6 + sectionScore('stakeholders') * 0.4) || 30);
  const stakeholderAlignment = Math.round((sectionScore('stakeholders') * 0.5 + sectionScore('implementation') * 0.3 + sectionScore('outcomes') * 0.2) || 25);
  const financialViability = Math.round(sectionScore('financial') || (/budget|fund|cost|invest/i.test(text) ? 40 : 15));
  const implementationReadiness = Math.round((sectionScore('implementation') * 0.5 + sectionScore('governance') * 0.3 + sectionScore('lessons') * 0.2) || 20);
  const riskManagement = Math.round((sectionScore('risks') * 0.6 + sectionScore('lessons') * 0.4) || 20);
  const evidenceStrength = Math.round((sectionScore('outcomes') * 0.4 + sectionScore('implementation') * 0.3 + sectionScore('background') * 0.3) || 20);

  // Replication based on lessons and preconditions
  const replicationViability = Math.round((sectionScore('lessons') * 0.5 + sectionScore('governance') * 0.3 + sectionScore('implementation') * 0.2) || 15);

  // Partner match readiness based on overall structure quality
  const partnerMatchReadiness = Math.round(
    (evidenceStrength * 0.25 + financialViability * 0.25 + governanceQuality * 0.2 + riskManagement * 0.15 + stakeholderAlignment * 0.15) || 20
  );

  // Adjust for strengths/weaknesses
  const strengthBonus = Math.min(15, strengths.length * 3);
  const weaknessPenalty = Math.min(20, weaknesses.filter(w => w.severity === 'critical').length * 7 + weaknesses.filter(w => w.severity === 'major').length * 4);

  const clamp = (v: number) => Math.max(5, Math.min(95, v));

  const overallViability = clamp(Math.round(
    (governanceQuality * 0.15 + stakeholderAlignment * 0.12 + financialViability * 0.15 +
      implementationReadiness * 0.15 + riskManagement * 0.1 + evidenceStrength * 0.15 +
      replicationViability * 0.1 + partnerMatchReadiness * 0.08) + strengthBonus - weaknessPenalty
  ));

  return {
    governanceQuality: clamp(governanceQuality),
    stakeholderAlignment: clamp(stakeholderAlignment),
    financialViability: clamp(financialViability),
    implementationReadiness: clamp(implementationReadiness),
    riskManagement: clamp(riskManagement),
    evidenceStrength: clamp(evidenceStrength),
    replicationViability: clamp(replicationViability),
    partnerMatchReadiness: clamp(partnerMatchReadiness),
    overallViability,
  };
}

// ============================================================================
// ADVERSARIAL DEBATE
// ============================================================================

function runAdversarialDebate(text: string, scores: CaseStudyAnalysis['scores'], strengths: StrengthWeakness[], weaknesses: StrengthWeakness[]): CaseStudyAnalysis['adversarialDebate'] {
  const criticalWeaknesses = weaknesses.filter(w => w.severity === 'critical');
  const majorStrengths = strengths.filter(s => s.severity !== 'minor');

  const skeptic = criticalWeaknesses.length > 0
    ? `This case has ${criticalWeaknesses.length} critical gap(s): ${criticalWeaknesses.map(w => w.category).join(', ')}. Overall viability at ${scores.overallViability}% is not defensible for investment without addressing these. Financial viability scores only ${scores.financialViability}/100 - no investor will proceed without clearer revenue models, cost structures, and exit pathways. The sustainability question remains unanswered.`
    : `The case is structurally sound but scores ${scores.overallViability}/100 overall. Evidence strength (${scores.evidenceStrength}/100) and risk management (${scores.riskManagement}/100) need improvement before this reaches investor-grade. Specific quantitative outcomes would strengthen confidence.`;

  const advocate = majorStrengths.length > 0
    ? `This case demonstrates ${majorStrengths.length} notable strengths: ${majorStrengths.slice(0, 3).map(s => s.category).join(', ')}. Governance quality at ${scores.governanceQuality}/100 and stakeholder alignment at ${scores.stakeholderAlignment}/100 show institutional foundations exist. The replication viability score of ${scores.replicationViability}/100 indicates potential for scaling to similar contexts. With targeted improvements to the identified gaps, this case could become a strong investment/partnership proposition.`
    : `The case addresses a real development need and attempts a structured approach. The implementation process is documented, which provides a foundation. With additional evidence and financial modeling, this could progress.`;

  const regulator = `From a compliance and governance standpoint: governance quality scores ${scores.governanceQuality}/100. ${scores.governanceQuality > 60 ? 'Institutional structures are present, but need clear accountability chains, reporting obligations, and sunset clauses.' : 'The governance framework is insufficient for regulatory confidence. Need clear legal mandates, accountability structures, oversight bodies, and compliance monitoring.'} Risk management at ${scores.riskManagement}/100 ${scores.riskManagement > 50 ? 'identifies risks but needs mitigation protocols with trigger thresholds.' : 'is critically weak - no structured risk register, no mitigation hierarchy, no escalation procedures.'}`;

  const accountant = `Financial viability: ${scores.financialViability}/100. ${scores.financialViability > 60 ? 'Budget structures exist but need unit economics, cost-per-beneficiary analysis, and sustainability projections.' : 'No adequate financial analysis. Need: total programme cost, cost-per-beneficiary, funding sources, sustainability model, ROI/SROI projections, and exit costs.'} Evidence strength at ${scores.evidenceStrength}/100 ${scores.evidenceStrength > 50 ? 'provides some basis for projections but requires baseline data and counterfactual analysis.' : 'is too low for any credible financial projection. Baseline data and control comparisons essential.'}`;

  const operator = `Implementation readiness: ${scores.implementationReadiness}/100. ${scores.implementationReadiness > 60 ? 'The process is documented and has been tested through pilot implementation. For scaling: need standardized operating procedures, training modules, handover protocols.' : 'Implementation detail is insufficient. Need: phased timeline with milestones, resource allocation per phase, staffing plan, supply chain requirements, and quality assurance checkpoints.'} Stakeholder alignment at ${scores.stakeholderAlignment}/100 ${scores.stakeholderAlignment > 50 ? 'is workable but partnership agreements need formalizing.' : 'is a blocker - without aligned stakeholders, execution will fail regardless of design quality.'}`;

  const avgScore = scores.overallViability;
  const consensusStrength = Math.round(avgScore * 0.6 + (criticalWeaknesses.length === 0 ? 20 : 0) + (majorStrengths.length > 2 ? 15 : 5));
  const consensus = avgScore >= 65
    ? `Conditional proceed. The case has structural merit (${avgScore}/100) but requires specific improvements before it reaches investment or partnership readiness. Address the identified gaps - particularly ${weaknesses.slice(0, 2).map(w => w.category).join(' and ')} - then re-assess.`
    : avgScore >= 40
      ? `Hold and strengthen. The case scores ${avgScore}/100, below the threshold for partner/investor engagement. Fundamental gaps in ${weaknesses.filter(w => w.severity === 'critical').map(w => w.category).join(', ')} must be resolved. Recommend structured development using the guided intake protocol to fill evidence gaps.`
      : `Do not proceed in current form. Overall viability at ${avgScore}/100 indicates the case is not ready for external presentation. Recommend complete rework using the 10-step intake protocol to build from structured foundations.`;

  return { skeptic, advocate, regulator, accountant, operator, consensus, consensusStrength: Math.min(95, Math.max(10, consensusStrength)) };
}

// ============================================================================
// HISTORICAL PARALLELS
// ============================================================================

function findHistoricalParallels(text: string, country: string, sector: string): CaseStudyAnalysis['historicalParallels'] {
  const parallels: CaseStudyAnalysis['historicalParallels'] = [];

  // Match based on country and sector
  const DATABASE: { name: string; country: string; sector: string; keywords: RegExp; similarity: number; outcome: string; lesson: string }[] = [
    { name: 'PEZA Special Economic Zones', country: 'Philippines', sector: 'Governance & Public Sector', keywords: /SEZ|ecozone|special.*economic|investment.*zone/i, similarity: 78, outcome: 'Created 400+ zones employing 1.6M workers, $52B cumulative investment', lesson: 'Clear legal framework + one-stop-shop governance = investment attraction success' },
    { name: 'Philippine CARP Reform', country: 'Philippines', sector: 'Agriculture & Rural Development', keywords: /agrarian|land.*reform|farmer|CARP|beneficiar/i, similarity: 82, outcome: 'Distributed 4.8M hectares to 2.8M farmer-beneficiaries over 30 years', lesson: 'Land reform requires support services + credit access, not just land transfer' },
    { name: 'KALAHI-CIDSS Community Driven Development', country: 'Philippines', sector: 'Governance & Public Sector', keywords: /community.*driven|participat|barangay|village.*planning|KALAHI/i, similarity: 85, outcome: 'Reached 5,600 villages, $380M investment, community satisfaction 89%', lesson: 'Participatory planning works when combined with real budget authority and capacity building' },
    { name: 'Vietnam Industrial Zone Programme', country: 'Vietnam', sector: 'Infrastructure', keywords: /industrial.*zone|manufacturing|export.*zone/i, similarity: 72, outcome: '400+ industrial zones, $200B FDI attracted over 20 years', lesson: 'Infrastructure-first approach with competitive incentive packages drives FDI' },
    { name: 'Shenzhen SEZ Transformation', country: 'China', sector: 'Governance & Public Sector', keywords: /special.*economic|zone|reform|transformation/i, similarity: 65, outcome: 'From fishing village to $430B GDP city in 40 years', lesson: 'Regulatory autonomy + infrastructure investment + talent attraction = exponential growth' },
    { name: 'Rwanda Decentralisation', country: 'Rwanda', sector: 'Governance & Public Sector', keywords: /decentrali[sz]|local.*government|devolution|governance.*reform/i, similarity: 75, outcome: 'Created 30 districts with real fiscal authority, GDP growth 7.5% average', lesson: 'Genuine fiscal transfer to local government + performance contracts = accountability' },
    { name: 'Indonesia Village Fund (Dana Desa)', country: 'Indonesia', sector: 'Governance & Public Sector', keywords: /village.*fund|local.*fund|communit.*fund|dana.*desa/i, similarity: 73, outcome: '$7B annually to 75,000 villages for community-prioritized development', lesson: 'Direct fiscal transfers + community planning processes = rapid infrastructure delivery' },
    { name: 'Bangladesh Grameen Microfinance', country: 'Bangladesh', sector: 'Financial Services', keywords: /microfinance|micro.*credit|grameen|small.*loan|lending/i, similarity: 68, outcome: '9M borrowers, 97% repayment rate, Nobel Prize recognition', lesson: 'Group lending + social collateral + women focus = sustainable financial inclusion' },
    { name: 'India MGNREGA Employment Guarantee', country: 'India', sector: 'Governance & Public Sector', keywords: /employment.*guarantee|public.*works|rural.*employment|MGNREGA/i, similarity: 70, outcome: 'Largest employment programme globally, 50M+ households annually', lesson: 'Universal guarantee + demand-driven design + digital monitoring = scale' },
    { name: 'Colombia Participatory Budgeting', country: 'Colombia', sector: 'Governance & Public Sector', keywords: /participat.*budget|communit.*budget|citizen.*budget/i, similarity: 76, outcome: 'Improved public trust, better infrastructure alignment with community needs', lesson: 'Genuine budget authority for communities increases engagement and accountability' },
  ];

  for (const entry of DATABASE) {
    const countryMatch = country.toLowerCase() === entry.country.toLowerCase();
    const sectorMatch = sector.toLowerCase().includes(entry.sector.toLowerCase().split(' ')[0]);
    const keywordMatch = entry.keywords.test(text);

    if (keywordMatch || (countryMatch && sectorMatch)) {
      const adjustedSimilarity = entry.similarity + (countryMatch ? 8 : 0) + (sectorMatch ? 5 : 0) + (keywordMatch ? 7 : 0);
      parallels.push({
        name: entry.name,
        country: entry.country,
        similarity: Math.min(95, adjustedSimilarity),
        outcome: entry.outcome,
        lesson: entry.lesson,
      });
    }
  }

  // Sort by similarity descending, limit to 5
  return parallels.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

// ============================================================================
// DOCUMENT & LETTER RECOMMENDATIONS
// ============================================================================

function recommendDocuments(scores: CaseStudyAnalysis['scores'], sector: string): { documents: string[]; letters: string[] } {
  const documents: string[] = ['Executive Brief', 'Case Study Rewrite'];

  if (scores.financialViability > 30) documents.push('Financial Feasibility Summary');
  if (scores.financialViability < 50) documents.push('Financial Gap Analysis');
  if (scores.governanceQuality > 40) documents.push('Governance Framework Assessment');
  if (scores.riskManagement > 30) documents.push('Comprehensive Risk Assessment');
  if (scores.implementationReadiness > 40) documents.push('Implementation Roadmap');
  if (scores.replicationViability > 40) documents.push('Replication Strategy Document');
  if (scores.partnerMatchReadiness > 50) documents.push('Partner Proposal Template');
  if (scores.stakeholderAlignment > 40) documents.push('Stakeholder Engagement Plan');
  if (scores.evidenceStrength > 50) documents.push('Investor Pitch Deck Narrative');

  documents.push('Due Diligence Summary');

  if (sector.includes('Agriculture') || sector.includes('Rural')) {
    documents.push('Community Impact Assessment');
  }
  if (sector.includes('Governance')) {
    documents.push('Government Policy Submission');
    documents.push('Decentralisation Assessment Brief');
  }

  const letters: string[] = [];
  if (scores.partnerMatchReadiness > 40) letters.push('Letter of Intent - Partnership', 'Expression of Interest - Government Project');
  if (scores.financialViability > 40) letters.push('Investor Update Letter', 'DFI Concept Note Cover Letter');
  if (scores.governanceQuality > 40) letters.push('MoU Proposal Letter', 'Government Incentive Application');
  if (scores.stakeholderAlignment > 30) letters.push('Stakeholder Engagement Letter', 'Community Notification Letter');
  letters.push('Proposal Cover Letter');

  return { documents, letters };
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export class CaseStudyAnalyzer {
  /**
   * Analyze uploaded document text and produce full case study analysis
   */
  static analyze(filename: string, text: string): CaseStudyAnalysis {
    const startTime = Date.now();

    // Parse structure
    const title = extractTitle(text);
    const country = extractCountry(text);
    const sector = extractSector(text);
    const stakeholders = extractStakeholders(text);
    const wordCount = countWords(text);

    // Extract timeframe
    const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || [];
    const years = yearMatches.map(Number).sort();
    const timeframe = years.length >= 2 ? `${years[0]} - ${years[years.length - 1]}` : years.length === 1 ? `${years[0]}` : 'Not specified';

    // Extract and score sections
    const sections = extractSections(text);
    const overallCompleteness = Math.round(sections.reduce((sum, s) => sum + s.score, 0) / sections.length);

    // Strengths & weaknesses
    const { strengths, weaknesses } = analyzeStrengthsWeaknesses(text, sections);

    // NSIL-style scoring
    const scores = scoreCase(sections, text, strengths, weaknesses);

    // Adversarial debate
    const adversarialDebate = runAdversarialDebate(text, scores, strengths, weaknesses);

    // Historical parallels
    const historicalParallels = findHistoricalParallels(text, country, sector);

    // Recommendations
    const recommendations: string[] = [];
    for (const weakness of weaknesses.filter(w => w.severity === 'critical' || w.severity === 'major')) {
      if (weakness.recommendation) recommendations.push(weakness.recommendation);
    }
    if (scores.financialViability < 50) recommendations.push('Develop complete financial model: costs, revenue streams, sustainability mechanism, and ROI/SROI projections.');
    if (scores.riskManagement < 50) recommendations.push('Build structured risk register with likelihood/impact scoring, mitigation actions, and escalation triggers.');
    if (scores.evidenceStrength < 50) recommendations.push('Add baseline data, control comparisons, and measurable outcome indicators with targets.');
    if (scores.governanceQuality < 50) recommendations.push('Formalize governance: define roles, accountability chains, reporting frequency, and performance review mechanisms.');
    if (scores.replicationViability < 50) recommendations.push('Document preconditions for replication: minimum institutional requirements, resource thresholds, and adaptation guidelines.');

    // Document/letter recommendations
    const { documents: suggestedDocuments, letters: suggestedLetters } = recommendDocuments(scores, sector);

    const processingTimeMs = Date.now() - startTime;

    return {
      id: `case-${Date.now()}`,
      sourceFilename: filename,
      analyzedAt: new Date().toISOString(),
      processingTimeMs,
      title,
      country,
      sector,
      timeframe,
      stakeholders,
      sections,
      overallCompleteness,
      strengths,
      weaknesses,
      scores,
      adversarialDebate,
      historicalParallels,
      recommendations,
      suggestedDocuments,
      suggestedLetters,
      rawContent: text,
      wordCount,
    };
  }

  /**
   * Convert analysis into IngestedDocumentMeta with full content for NSIL engines
   */
  static toIngestedDocument(analysis: CaseStudyAnalysis): IngestedDocumentMeta {
    return {
      filename: analysis.sourceFilename,
      fileType: 'case-study',
      fileSize: analysis.rawContent.length,
      wordCount: analysis.wordCount,
      uploadedAt: analysis.analyzedAt,
      content: analysis.rawContent,
      extractedInsights: {
        entities: analysis.stakeholders,
        risks: analysis.weaknesses.map(w => `${w.category}: ${w.description}`),
        opportunities: analysis.strengths.map(s => `${s.category}: ${s.description}`),
        strengths: analysis.strengths.map(s => s.description),
        weaknesses: analysis.weaknesses.map(w => w.description),
        recommendations: analysis.recommendations,
        categories: [analysis.sector, analysis.country],
        confidence: analysis.scores.overallViability / 100,
      },
    };
  }

  /**
   * Generate a concise summary suitable for the AI consultant chat
   */
  static toConsultantSummary(analysis: CaseStudyAnalysis): string {
    const criticalWeaknesses = analysis.weaknesses.filter(w => w.severity === 'critical');
    const topStrengths = analysis.strengths.slice(0, 3);

    return [
      `📋 **Case Study Analysis Complete: "${analysis.title}"**`,
      `📍 ${analysis.country} | ${analysis.sector} | ${analysis.timeframe} | ${analysis.wordCount.toLocaleString()} words`,
      ``,
      `**Overall Viability: ${analysis.scores.overallViability}/100**`,
      ``,
      `**Key Scores:**`,
      `• Governance: ${analysis.scores.governanceQuality}/100`,
      `• Financial Viability: ${analysis.scores.financialViability}/100`,
      `• Evidence Strength: ${analysis.scores.evidenceStrength}/100`,
      `• Implementation Readiness: ${analysis.scores.implementationReadiness}/100`,
      `• Risk Management: ${analysis.scores.riskManagement}/100`,
      `• Replication Viability: ${analysis.scores.replicationViability}/100`,
      `• Partner Match Readiness: ${analysis.scores.partnerMatchReadiness}/100`,
      ``,
      `**Top Strengths:** ${topStrengths.map(s => s.category).join(', ') || 'None identified'}`,
      ``,
      criticalWeaknesses.length > 0
        ? `⚠️ **Critical Gaps:** ${criticalWeaknesses.map(w => w.category).join(', ')}`
        : `✅ No critical gaps identified.`,
      ``,
      `**Adversarial Consensus:** ${analysis.adversarialDebate.consensus}`,
      ``,
      analysis.historicalParallels.length > 0
        ? `**Historical Parallels:** ${analysis.historicalParallels.slice(0, 2).map(p => `${p.name} (${p.country}, ${p.similarity}% match)`).join('; ')}`
        : '',
      ``,
      `**Recommended Next Steps:** ${analysis.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join(' ')}`,
      ``,
      `📄 **${analysis.suggestedDocuments.length} documents** and **${analysis.suggestedLetters.length} letters** ready to generate from this case.`,
    ].filter(Boolean).join('\n');
  }
}

export default CaseStudyAnalyzer;
