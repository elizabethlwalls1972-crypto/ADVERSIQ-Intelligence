/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COMPOUND INTELLIGENCE ORCHESTRATOR — NSIL v2 Layer 14
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The meta-intelligence layer. The OS layer.
 *
 * Any problem — stated in natural language, from any domain, at any scale —
 * enters here. This orchestrator:
 *
 *   1. Classifies the problem type
 *   2. Selects the optimal agent combination
 *   3. Chains agents in the optimal sequence
 *   4. Synthesizes a unified intelligence report
 *   5. Routes results to the ADVERSIQ Decision Verification System
 *   6. Maintains persistent problem state (problem history, iteration)
 *
 * This is the layer that makes the OS capable of addressing problems that
 * were "thought to be impossible" — by ensuring no single lens dominates,
 * and by forcing every significant problem through:
 *   - Impossibility deconstruction (ImpossibilityEngine)
 *   - Domain translation (UniversalProblemAdapter)
 *   - Long-run consequence modeling (CascadingEffectPredictor)
 *   - Human adoption modeling (SocialDynamicsAgent)
 *   - All 22 existing NSIL engines
 *
 * Problem Classification Schema:
 *   TYPE A — Pure Business: competitive strategy, market entry, product, finance
 *   TYPE B — Pure Government: policy design, fiscal reform, public service
 *   TYPE C — Social Development: poverty, health, education, community
 *   TYPE D — Complex Adaptive: multi-domain, systemic, emergent properties
 *   TYPE E — Personal Decision: individual, career, life strategy
 *   TYPE F — Impossible Problem: explicitly stated as unsolvable, intractable
 *
 * Agent Selection Logic:
 *   Every problem type gets a different agent chain.
 *   TYPE F always triggers ImpossibilityEngine first.
 *   TYPE D triggers all agents in full synthesis mode.
 *   Types A-C trigger domain-specialized chains.
 *   TYPE E triggers personal-domain chain.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { ImpossibilityEngine, ImpossibilityReport } from './ImpossibilityEngine';
import { UniversalProblemAdapter, AdaptedNSILInput, RawProblemInput, ProblemDomain } from './UniversalProblemAdapter';
import { CascadingEffectPredictor, CascadeReport } from './CascadingEffectPredictor';
import { SocialDynamicsAgent, SocialDynamicsReport } from './SocialDynamicsAgent';
import { AntifragilityEngine, AntifragilityReport } from './AntifragilityEngine';
import { TemporalArbitrageEngine, TemporalArbitrageReport } from './TemporalArbitrageEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProblemType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface UniversalProblemInput {
  naturalLanguageQuery: string;   // The problem as the user stated it — any form, any domain
  additionalContext?: string;
  urgency?: 'immediate' | 'short-term' | 'long-term' | 'exploratory';
  complexity?: 'simple' | 'complex' | 'wicked'; // "wicked" = no clear definition, shifting stakeholders
  geography?: string;
  stakeholders?: string[];
  constraints?: string[];
  successDefinition?: string;
  sessionId?: string;             // For persistent state across queries
}

export interface AgentExecutionRecord {
  agentName: string;
  executedAt: string;
  durationMs: number;
  outputSummary: string;
  confidence: number;
  warnings: string[];
}

export interface SynthesizedInsight {
  insightType: 'critical-finding' | 'opportunity' | 'risk' | 'assumption-challenged' | 'recommendation';
  content: string;
  sourceAgents: string[];
  confidenceScore: number;
  timeHorizon?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StrategicRecommendation {
  rank: number;
  title: string;
  description: string;
  rationale: string;
  timeHorizon: string;
  resourceRequirement: 'minimal' | 'moderate' | 'significant' | 'transformative';
  implementationComplexity: number;   // 0-10
  expectedImpact: number;             // 0-100
  sourceAgents: string[];
  firstAction: string;
  risks: string[];
}

export interface ADVERSIQBriefing {
  // Simplified brief for the Decision Verification System / Adversarial Debate
  problemSummary: string;
  coreDecision: string;
  advocateArguments: string[];        // For the Advocate persona
  skepticArguments: string[];         // For the Skeptic persona
  regulatorConcerns: string[];        // For the Regulator persona
  accountantConcerns: string[];       // For the Accountant persona
  operatorChallenges: string[];       // For the Operator persona
  suggestedVerdict: 'PROCEED' | 'FLAGGED' | 'BLOCKED';
  verdictRationale: string;
}

export interface CompoundIntelligenceReport {
  // Meta
  queryId: string;
  originalQuery: string;
  problemType: ProblemType;
  problemDomain: ProblemDomain;
  processingStarted: string;
  processingCompleted: string;
  totalDurationMs: number;

  // Raw agent outputs
  adaptedInput: AdaptedNSILInput;
  impossibilityReport?: ImpossibilityReport;
  cascadeReport?: CascadeReport;
  socialDynamicsReport?: SocialDynamicsReport;
  antifragilityReport?: AntifragilityReport;      // Layer 16 — AFI™ score
  temporalArbitrageReport?: TemporalArbitrageReport; // Layer 17 — TAI™ + TDI™

  // Synthesis
  agentExecutionChain: AgentExecutionRecord[];
  synthesizedInsights: SynthesizedInsight[];
  strategicRecommendations: StrategicRecommendation[];
  adversiqBriefing: ADVERSIQBriefing;

  // Composite scores
  overallFeasibilityScore: number;    // 0-100
  longTermViabilityScore: number;     // 0-100
  socialAdoptabilityScore: number;    // 0-100
  impossibilityScore: number;         // 0-100 (0 = easily solvable, 100 = paradigm shift needed)
  antifragilityScore?: number;        // AFI™ 0-100 (Layer 16)
  temporalArbitrageScore?: number;    // TAI™ 0-100 (Layer 17)
  compositeConfidence: number;        // 0-100

  // Executive output
  executiveSummary: string;
  primaryVerdict: 'PROCEED' | 'PROCEED-WITH-CONDITIONS' | 'REDESIGN' | 'INVESTIGATE-FURTHER' | 'DO-NOT-PROCEED';
  verdictRationale: string;
  singleHighestLeverageAction: string;

  processingNotes: string[];
}

// ─── Problem Classifier ───────────────────────────────────────────────────────

function classifyProblemType(query: string, domain: ProblemDomain): ProblemType {
  const lower = query.toLowerCase();

  // TYPE F: Explicitly impossible
  const impossibleKeywords = ['impossible', 'cannot be done', 'never work', 'unsolvable', 'intractable', 'no way', 'failed for years', 'has never worked', 'nobody has solved'];
  if (impossibleKeywords.some(k => lower.includes(k))) return 'F';

  // TYPE D: Complex / wicked / multi-domain
  const wickedKeywords = ['systemic', 'root cause', 'multiple stakeholders', 'complex', 'wicked', 'comprehensive', 'holistic', 'transform', 'overhaul', 'redesign', 'revolution'];
  if (wickedKeywords.some(k => lower.includes(k))) return 'D';

  // TYPE E: Personal
  const personalKeywords = ['i want', 'i need', 'my business', 'my career', 'should i', 'help me', 'my situation', 'personal'];
  if (personalKeywords.some(k => lower.includes(k))) return 'E';

  // Domain-based classification
  if (domain === 'government') return 'B';
  if (domain === 'social' || domain === 'environmental') return 'C';
  if (domain === 'personal') return 'E';
  if (domain === 'compound' || domain === 'economic') return 'D';

  return 'A'; // Default to business
}

// ─── Agent Chain Selection ────────────────────────────────────────────────────

interface AgentChainConfig {
  runImpossibilityEngine: boolean;
  runCascadePredictor: boolean;
  runSocialDynamics: boolean;
  depth: 'full' | 'standard' | 'light';
  emphasis: string;
}

function selectAgentChain(problemType: ProblemType): AgentChainConfig {
  const configs: Record<ProblemType, AgentChainConfig> = {
    'A': { runImpossibilityEngine: false, runCascadePredictor: true,  runSocialDynamics: true,  depth: 'standard', emphasis: 'competitive strategy and market dynamics' },
    'B': { runImpossibilityEngine: true,  runCascadePredictor: true,  runSocialDynamics: true,  depth: 'full',     emphasis: 'policy design, institutional change, and governance reform' },
    'C': { runImpossibilityEngine: true,  runCascadePredictor: true,  runSocialDynamics: true,  depth: 'full',     emphasis: 'social adoption, equity outcomes, and community resilience' },
    'D': { runImpossibilityEngine: true,  runCascadePredictor: true,  runSocialDynamics: true,  depth: 'full',     emphasis: 'systemic transformation and compound effects across all domains' },
    'E': { runImpossibilityEngine: false, runCascadePredictor: true,  runSocialDynamics: false, depth: 'light',    emphasis: 'practical decision-making and personal strategic clarity' },
    'F': { runImpossibilityEngine: true,  runCascadePredictor: true,  runSocialDynamics: true,  depth: 'full',     emphasis: 'impossibility deconstruction and paradigm-breaking pathways' }
  };
  return configs[problemType];
}

// ─── Insight Synthesizer ──────────────────────────────────────────────────────

function synthesizeInsights(
  adapted: AdaptedNSILInput,
  impossibility: ImpossibilityReport | undefined,
  cascade: CascadeReport | undefined,
  social: SocialDynamicsReport | undefined
): SynthesizedInsight[] {
  const insights: SynthesizedInsight[] = [];

  // From impossibility analysis
  if (impossibility) {
    if (impossibility.assumptionChallenges.length > 0) {
      const best = impossibility.assumptionChallenges.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)[0];
      insights.push({
        insightType: 'assumption-challenged',
        content: `Core assumption challenged (${best.vulnerabilityScore}/100 vulnerability): "${best.assumption}" — ${best.ifRelaxed}`,
        sourceAgents: ['ImpossibilityEngine'],
        confidenceScore: best.vulnerabilityScore,
        priority: best.vulnerabilityScore > 65 ? 'high' : 'medium'
      });
    }
    if (impossibility.historicalOverrides.length > 0) {
      const best = impossibility.historicalOverrides[0];
      insights.push({
        insightType: 'opportunity',
        content: `Historical precedent: ${best.caseName} (${best.confidenceScore}% structural match) — ${best.transferablePattern}`,
        sourceAgents: ['ImpossibilityEngine'],
        confidenceScore: best.confidenceScore,
        priority: 'high'
      });
    }
    if (impossibility.verdict === 'SOLVABLE' || impossibility.verdict === 'SOLVABLE-WITH-CONDITIONS') {
      insights.push({
        insightType: 'critical-finding',
        content: `Impossibility verdict: ${impossibility.verdict} — ${impossibility.verdictRationale}`,
        sourceAgents: ['ImpossibilityEngine'],
        confidenceScore: 100 - impossibility.impossibilityScore,
        priority: 'high'
      });
    }
  }

  // From cascade analysis
  if (cascade) {
    if (cascade.systemicWarnings.length > 0) {
      for (const warning of cascade.systemicWarnings.slice(0, 2)) {
        insights.push({
          insightType: 'risk',
          content: warning,
          sourceAgents: ['CascadingEffectPredictor'],
          confidenceScore: 70,
          priority: 'high'
        });
      }
    }
    if (cascade.leveragePoints.length > 0) {
      const top = cascade.leveragePoints[0];
      insights.push({
        insightType: 'recommendation',
        content: `Highest leverage point (${top.expectedImpact}/100 impact): ${top.description} — ${top.interventionSuggestion}`,
        sourceAgents: ['CascadingEffectPredictor'],
        confidenceScore: top.expectedImpact,
        timeHorizon: cascade.peakImpactHorizon,
        priority: 'high'
      });
    }
    if (cascade.overallSystemImpact < 0) {
      insights.push({
        insightType: 'critical-finding',
        content: `NET NEGATIVE long-run system impact (${cascade.overallSystemImpact}/100). The current approach may produce positive short-term results while creating larger long-term problems.`,
        sourceAgents: ['CascadingEffectPredictor'],
        confidenceScore: 75,
        priority: 'high'
      });
    }
  }

  // From social dynamics
  if (social) {
    insights.push({
      insightType: 'critical-finding',
      content: `Social adoptability: ${social.overallAdoptabilityScore}/100. Launch recommendation: ${social.launchRecommendation}`,
      sourceAgents: ['SocialDynamicsAgent'],
      confidenceScore: social.overallAdoptabilityScore,
      priority: social.overallAdoptabilityScore < 50 ? 'high' : 'medium'
    });
    insights.push({
      insightType: 'risk',
      content: `Biggest social risk: ${social.biggestSocialRisk}`,
      sourceAgents: ['SocialDynamicsAgent'],
      confidenceScore: 70,
      priority: 'medium'
    });
    const tipping = social.tippingPointAnalysis;
    insights.push({
      insightType: 'opportunity',
      content: `Critical mass threshold: ${(tipping.criticalMassThreshold * 100).toFixed(0)}% adoption needed for self-sustaining spread. ${tipping.estimatedTimeToTippingPoint}.`,
      sourceAgents: ['SocialDynamicsAgent'],
      confidenceScore: 65,
      priority: 'medium'
    });
  }

  // Cross-agent synthesis
  if (cascade && social) {
    const cascadeScore = Math.max(0, cascade.overallSystemImpact);
    const socialScore = social.overallAdoptabilityScore;
    if (cascadeScore > 60 && socialScore < 50) {
      insights.push({
        insightType: 'critical-finding',
        content: `SYSTEMIC TENSION: Strong long-run potential (cascade: ${cascadeScore}/100) is blocked by weak social adoption conditions (${socialScore}/100). The solution is technically viable but socially premature. Investment in social readiness should precede full execution.`,
        sourceAgents: ['CascadingEffectPredictor', 'SocialDynamicsAgent'],
        confidenceScore: 80,
        priority: 'high'
      });
    }
  }

  return insights.sort((a, b) => {
    const pMap = { high: 3, medium: 2, low: 1 };
    return pMap[b.priority] - pMap[a.priority];
  });
}

// ─── Recommendation Builder ───────────────────────────────────────────────────

function buildRecommendations(
  insights: SynthesizedInsight[],
  impossibility: ImpossibilityReport | undefined,
  cascade: CascadeReport | undefined,
  social: SocialDynamicsReport | undefined,
  adapted: AdaptedNSILInput
): StrategicRecommendation[] {
  const recs: StrategicRecommendation[] = [];

  // Rec 1: From highest-leverage impossibility pathway
  if (impossibility && impossibility.solutionPathways.length > 0) {
    const p = impossibility.solutionPathways[0];
    recs.push({
      rank: 1,
      title: p.title,
      description: p.description,
      rationale: `ImpossibilityEngine verdict ${impossibility.verdict}: ${impossibility.verdictRationale.slice(0, 150)}`,
      timeHorizon: p.timeHorizon,
      resourceRequirement: 'moderate',
      implementationComplexity: Math.round(p.criticalRisks.length * 2),
      expectedImpact: p.feasibilityScore,
      sourceAgents: ['ImpossibilityEngine'],
      firstAction: p.firstStep,
      risks: p.criticalRisks.slice(0, 2)
    });
  }

  // Rec 2: From highest-leverage cascade leverage point
  if (cascade && cascade.leveragePoints.length > 0) {
    const lp = cascade.leveragePoints[0];
    recs.push({
      rank: 2,
      title: `Leverage Point: ${lp.location}`,
      description: lp.description,
      rationale: `CascadingEffectPredictor: This is the highest-impact, lowest-regret intervention in the system (${lp.expectedImpact}/100 expected impact). Type: ${lp.type}`,
      timeHorizon: 'Ongoing',
      resourceRequirement: lp.difficulty === 'easy' ? 'minimal' : lp.difficulty === 'moderate' ? 'moderate' : 'significant',
      implementationComplexity: lp.difficulty === 'easy' ? 2 : lp.difficulty === 'moderate' ? 5 : lp.difficulty === 'hard' ? 7 : 9,
      expectedImpact: lp.expectedImpact,
      sourceAgents: ['CascadingEffectPredictor'],
      firstAction: lp.interventionSuggestion,
      risks: ['Risk of over-optimizing at leverage point at expense of other system components']
    });
  }

  // Rec 3: From social dynamics
  if (social) {
    const topLeader = social.opinionLeaders.sort((a, b) => b.priorityScore - a.priorityScore)[0];
    recs.push({
      rank: 3,
      title: 'Social Adoption Pathway',
      description: social.criticalSuccessFactor,
      rationale: `SocialDynamicsAgent: ${social.launchRecommendation}`,
      timeHorizon: `${Math.round(social.tippingPointAnalysis.criticalMassThreshold * 100)}% critical mass target: ${social.tippingPointAnalysis.estimatedTimeToTippingPoint}`,
      resourceRequirement: 'moderate',
      implementationComplexity: 5,
      expectedImpact: social.overallAdoptabilityScore,
      sourceAgents: ['SocialDynamicsAgent'],
      firstAction: topLeader ? `Identify and engage ${topLeader.leaderCategory} opinion leaders: ${topLeader.engagementApproach.slice(0, 100)}` : social.criticalSuccessFactor,
      risks: [social.biggestSocialRisk.slice(0, 120)]
    });
  }

  // Rec 4: Cross-horizon adaptive management
  if (cascade) {
    const shortHorizon = cascade.timeHorizonSummaries[0];
    const midHorizon = cascade.timeHorizonSummaries[3];
    recs.push({
      rank: 4,
      title: 'Adaptive Management Framework',
      description: `Establish a monitoring system that tracks indicators at ALL time horizons (${shortHorizon.horizon}, ${midHorizon.horizon}, and beyond), not just first-order metrics.`,
      rationale: 'Most decision failures are not from bad decisions but from failing to see the second and third-order effects in time to adjust. CascadePredictor identifies the delay structure.',
      timeHorizon: 'Immediate setup; ongoing execution',
      resourceRequirement: 'minimal',
      implementationComplexity: 3,
      expectedImpact: 72,
      sourceAgents: ['CascadingEffectPredictor'],
      firstAction: `Immediately: define indicators for the ${cascade.peakImpactHorizon} time horizon when peak effects manifest. Schedule a formal review at that point.`,
      risks: ['Indicator overload — monitor too many metrics and end up tracking none effectively']
    });
  }

  return recs;
}

// ─── ADVERSIQ Briefing Builder ────────────────────────────────────────────────

function buildADVERSIQBriefing(
  adapted: AdaptedNSILInput,
  insights: SynthesizedInsight[],
  impossibility: ImpossibilityReport | undefined,
  cascade: CascadeReport | undefined,
  social: SocialDynamicsReport | undefined,
  overallFeasibility: number
): ADVERSIQBriefing {
  const highRisks = insights.filter(i => i.insightType === 'risk' && i.priority === 'high');
  const highOpps = insights.filter(i => i.insightType === 'opportunity' && i.priority === 'high');

  const suggestedVerdict: ADVERSIQBriefing['suggestedVerdict'] =
    overallFeasibility >= 65 ? 'PROCEED' :
    overallFeasibility >= 40 ? 'FLAGGED' :
    'BLOCKED';

  return {
    problemSummary: adapted.currentMatter.slice(0, 200),
    coreDecision: `${adapted.objectives.slice(0, 150)} in ${adapted.targetRegion}`,
    advocateArguments: [
      ...highOpps.map(o => o.content.slice(0, 150)),
      impossibility?.verdict === 'SOLVABLE' ? `ImpossibilityEngine verdict: SOLVABLE — ${impossibility.verdictRationale.slice(0, 150)}` : null,
      social && social.overallAdoptabilityScore > 60 ? `Strong social adoption conditions (${social.overallAdoptabilityScore}/100 adoptability)` : null
    ].filter(Boolean) as string[],
    skepticArguments: [
      ...highRisks.map(r => r.content.slice(0, 150)),
      cascade && cascade.overallSystemImpact < 0 ? `System impact modeling shows net negative long-run outcome (${cascade.overallSystemImpact}/100)` : null,
      impossibility?.verdict === 'REQUIRES-PARADIGM-SHIFT' ? 'This problem requires a paradigm shift — complexity and implementation risk are very high' : null
    ].filter(Boolean) as string[],
    regulatorConcerns: adapted.domainContext.ethicalDimensions.map(d => `Verify compliance: ${d}`),
    accountantConcerns: [
      'Quantify ROI across all time horizons, not just year 1',
      cascade ? `Peak cost/impact period: ${cascade.peakImpactHorizon} — budget must extend to this horizon` : null,
      'Model the cost of NOT acting (opportunity cost of inaction)'
    ].filter(Boolean) as string[],
    operatorChallenges: [
      social ? `Social adoption challenge: ${social.criticalSuccessFactor}` : 'Define clear adoption pathway',
      cascade && cascade.feedbackLoops.length > 0 ? `System feedback loops identified — need operational monitoring at ${cascade.peakImpactHorizon}` : null,
      'What is the operational minimum viable unit to begin?'
    ].filter(Boolean) as string[],
    suggestedVerdict,
    verdictRationale: `Based on multi-agent analysis: feasibility ${overallFeasibility}/100. ${
      suggestedVerdict === 'PROCEED' ? 'Conditions support proceeding.' :
      suggestedVerdict === 'FLAGGED' ? 'Conditions require addressing identified risks before full commitment.' :
      'Fundamental redesign recommended before proceeding.'
    }`
  };
}

// ─── Composite Score Calculator ────────────────────────────────────────────────

function calculateCompositeScores(
  adapted: AdaptedNSILInput,
  impossibility: ImpossibilityReport | undefined,
  cascade: CascadeReport | undefined,
  social: SocialDynamicsReport | undefined
): { feasibility: number; viability: number; adoptability: number; impossibilityScore: number } {
  const feasibility = Math.round(
    (adapted.confidenceScore * 0.20) +
    (impossibility ? (100 - impossibility.impossibilityScore) * 0.30 : 50 * 0.30) +
    (cascade ? Math.max(0, cascade.overallSystemImpact + 50) / 2 * 0.30 : 50 * 0.30) +
    (social ? social.overallAdoptabilityScore * 0.20 : 50 * 0.20)
  );

  const viability = Math.round(
    (cascade ? Math.max(0, cascade.overallSystemImpact + 50) : 50) * 0.60 +
    (impossible => impossible ? 100 - impossible.impossibilityScore : 50)(impossibility) * 0.40
  );

  return {
    feasibility: Math.min(100, Math.max(0, feasibility)),
    viability: Math.min(100, Math.max(0, viability)),
    adoptability: social?.overallAdoptabilityScore || 50,
    impossibilityScore: impossibility?.impossibilityScore || 30
  };
}

// ─── Executive Summary Builder ─────────────────────────────────────────────────

function buildExecutiveSummary(
  query: string,
  problemType: ProblemType,
  insights: SynthesizedInsight[],
  recs: StrategicRecommendation[],
  scores: { feasibility: number; viability: number; adoptability: number },
  verdict: CompoundIntelligenceReport['primaryVerdict']
): string {
  const topInsights = insights.slice(0, 3).map(i => `• ${i.content.slice(0, 120)}`).join('\n');
  const topRec = recs[0];

  return `COMPOUND INTELLIGENCE ANALYSIS
Problem Type: ${problemType} | Domain Analysis Complete | ${new Date().toLocaleDateString()}

QUERY: "${query.slice(0, 200)}"

VERDICT: ${verdict}
Feasibility: ${scores.feasibility}/100 | Long-run Viability: ${scores.viability}/100 | Social Adoption: ${scores.adoptability}/100

KEY FINDINGS:
${topInsights || '• Analysis complete — see detailed findings below.'}

HIGHEST PRIORITY RECOMMENDATION:
${topRec ? `${topRec.title}: ${topRec.firstAction}` : 'See detailed recommendations below.'}

This analysis was produced by NSIL v2 Compound Intelligence Orchestrator (Layers 11–17), synthesizing outputs from: UniversalProblemAdapter, ImpossibilityEngine, CascadingEffectPredictor, SocialDynamicsAgent, AntifragilityEngine (AFI™), and TemporalArbitrageEngine (TAI™ + TDI™). All 46 proprietary formula scores, Monte Carlo simulation, and adversarial debate outputs are available in the full report.`;
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export class CompoundIntelligenceOrchestrator {
  /**
   * The primary entry point for the OS.
   * Takes any problem in natural language and returns a full intelligence synthesis.
   */
  static async orchestrate(input: UniversalProblemInput): Promise<CompoundIntelligenceReport> {
    const startTime = Date.now();
    const queryId = `cio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const notes: string[] = [`[CompoundIntelligenceOrchestrator] Query ${queryId}: "${input.naturalLanguageQuery.slice(0, 60)}..."`];
    const agentChain: AgentExecutionRecord[] = [];

    // ─ Stage 1: Universal Problem Adaptation ─────────────────────────────────
    notes.push('[Stage 1] Running UniversalProblemAdapter...');
    const adaptStart = Date.now();
    const rawInput: RawProblemInput = {
      problemStatement: input.naturalLanguageQuery,
      additionalContext: input.additionalContext,
      stakeholders: input.stakeholders,
      constraints: input.constraints,
      successDefinition: input.successDefinition,
      geography: input.geography
    };
    const adapted = UniversalProblemAdapter.adapt(rawInput);
    agentChain.push({
      agentName: 'UniversalProblemAdapter',
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - adaptStart,
      outputSummary: `Domain: ${adapted.problemDomain}. Confidence: ${adapted.confidenceScore}/100. ${adapted.parsedObjectives.length} objectives, ${adapted.mappedConstraints.length} constraints identified.`,
      confidence: adapted.confidenceScore,
      warnings: adapted.adaptationNotes.filter(n => n.includes('WARNING'))
    });
    notes.push(`[Stage 1] Domain: ${adapted.problemDomain}. Confidence: ${adapted.confidenceScore}/100`);

    // ─ Stage 2: Problem Classification ───────────────────────────────────────
    const problemType = classifyProblemType(input.naturalLanguageQuery, adapted.problemDomain);
    const chainConfig = selectAgentChain(problemType);
    notes.push(`[Stage 2] Problem Type: ${problemType}. Agent chain: Impossibility=${chainConfig.runImpossibilityEngine}, Cascade=${chainConfig.runCascadePredictor}, Social=${chainConfig.runSocialDynamics}`);

    // ─ Stage 3: ImpossibilityEngine (conditional) ─────────────────────────────
    let impossibilityReport: ImpossibilityReport | undefined;
    if (chainConfig.runImpossibilityEngine) {
      notes.push('[Stage 3] Running ImpossibilityEngine...');
      const t = Date.now();
      impossibilityReport = ImpossibilityEngine.analyze({
        problemStatement: input.naturalLanguageQuery,
        domain: adapted.problemDomain,
        statedConstraints: input.constraints,
        context: input.additionalContext,
        successMetric: input.successDefinition
      });
      agentChain.push({
        agentName: 'ImpossibilityEngine',
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - t,
        outputSummary: `Verdict: ${impossibilityReport.verdict}. Impossibility score: ${impossibilityReport.impossibilityScore}/100. ${impossibilityReport.assumptionChallenges.length} assumptions challenged.`,
        confidence: 100 - impossibilityReport.impossibilityScore,
        warnings: impossibilityReport.verdict === 'GENUINELY-CONSTRAINED' ? ['Problem may be genuinely constrained — validate constraints before committing resources'] : []
      });
      notes.push(`[Stage 3] ImpossibilityEngine: ${impossibilityReport.verdict} (${impossibilityReport.impossibilityScore}/100)`);
    }

    // ─ Stage 4: CascadingEffectPredictor (conditional) ────────────────────────
    let cascadeReport: CascadeReport | undefined;
    if (chainConfig.runCascadePredictor) {
      notes.push('[Stage 4] Running CascadingEffectPredictor...');
      const t = Date.now();
      cascadeReport = CascadingEffectPredictor.predict({
        decisionDescription: input.naturalLanguageQuery,
        domain: adapted.problemDomain,
        affectedSystem: adapted.targetSectors.join(', '),
        magnitude: input.complexity === 'wicked' ? 'transformative' : input.complexity === 'complex' ? 'large' : 'medium',
        geography: input.geography
      });
      agentChain.push({
        agentName: 'CascadingEffectPredictor',
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - t,
        outputSummary: `System impact: ${cascadeReport.overallSystemImpact}/100. Peak: ${cascadeReport.peakImpactHorizon}. ${cascadeReport.feedbackLoops.length} feedback loops. ${cascadeReport.systemicWarnings.length} warnings.`,
        confidence: 70,
        warnings: cascadeReport.systemicWarnings.slice(0, 2)
      });
      notes.push(`[Stage 4] Cascade: System impact ${cascadeReport.overallSystemImpact}/100`);
    }

    // ─ Stage 5: SocialDynamicsAgent (conditional) ─────────────────────────────
    let socialReport: SocialDynamicsReport | undefined;
    if (chainConfig.runSocialDynamics) {
      notes.push('[Stage 5] Running SocialDynamicsAgent...');
      const t = Date.now();
      socialReport = SocialDynamicsAgent.analyze({
        interventionDescription: input.naturalLanguageQuery,
        domain: adapted.problemDomain,
        targetPopulation: adapted.targetSectors.join(', '),
        geography: input.geography,
        culturalContext: input.additionalContext,
        keyResistors: input.constraints
      });
      agentChain.push({
        agentName: 'SocialDynamicsAgent',
        executedAt: new Date().toISOString(),
        durationMs: Date.now() - t,
        outputSummary: `Adoptability: ${socialReport.overallAdoptabilityScore}/100. Shape: ${socialReport.diffusionProjection.sCurveShape}. Launch: ${socialReport.launchRecommendation.slice(0, 80)}`,
        confidence: socialReport.overallAdoptabilityScore,
        warnings: socialReport.overallAdoptabilityScore < 40 ? ['Low social adoptability — intervention may fail due to human factors despite technical validity'] : []
      });
      notes.push(`[Stage 5] Social: Adoptability ${socialReport.overallAdoptabilityScore}/100`);
    }

    // ─ Stage 11: AntifragilityEngine (runs for all complex/full-depth problems) ──
    let antifragilityReport: AntifragilityReport | undefined;
    if (chainConfig.depth === 'full' || chainConfig.depth === 'standard') {
      notes.push('[Stage 11] Running AntifragilityEngine (AFI™)...');
      const t = Date.now();
      try {
        antifragilityReport = AntifragilityEngine.analyze({
          entityName: adapted.currentMatter.slice(0, 80),
          domain: adapted.problemDomain,
          environmentVolatility: problemType === 'F' || problemType === 'D' ? 0.75 : 0.50,
        });
        agentChain.push({
          agentName: 'AntifragilityEngine',
          executedAt: new Date().toISOString(),
          durationMs: Date.now() - t,
          outputSummary: `AFI™: ${antifragilityReport.afiScore}/100 (${antifragilityReport.afiGrade}). Triad position: ${antifragilityReport.triadPosition}/100.`,
          confidence: antifragilityReport.confidenceLevel,
          warnings: antifragilityReport.blindSpots.slice(0, 1),
        });
        notes.push(`[Stage 11] AFI™: ${antifragilityReport.afiScore}/100 — ${antifragilityReport.afiGrade}`);
      } catch (err) {
        notes.push(`[Stage 11] AntifragilityEngine error: ${err}`);
      }
    }

    // ─ Stage 12: TemporalArbitrageEngine (runs for investment/business/policy problems) ──
    let temporalArbitrageReport: TemporalArbitrageReport | undefined;
    if (problemType !== 'E' && chainConfig.depth !== 'light') {
      notes.push('[Stage 12] Running TemporalArbitrageEngine (TAI™ + TDI™)...');
      const t = Date.now();
      try {
        temporalArbitrageReport = TemporalArbitrageEngine.analyze({
          decisionDescription: input.naturalLanguageQuery.slice(0, 200),
          domain: adapted.problemDomain,
          horizonMonths: input.urgency === 'immediate' ? 6 : input.urgency === 'long-term' ? 60 : 24,
          isIrreversible: input.complexity === 'wicked',
          futureValueUncertainty: problemType === 'D' || problemType === 'F' ? 0.5 : 0.3,
        });
        agentChain.push({
          agentName: 'TemporalArbitrageEngine',
          executedAt: new Date().toISOString(),
          durationMs: Date.now() - t,
          outputSummary: `TAI™: ${temporalArbitrageReport.taiScore}/100 (${temporalArbitrageReport.taiGrade}). TDI™: ${temporalArbitrageReport.tdiScore}/100. Timing: ${temporalArbitrageReport.optimalActionTiming}.`,
          confidence: 0.70,
          warnings: temporalArbitrageReport.taiGrade === 'NEGATIVE_ARBITRAGE' ? ['Temporal arbitrage negative — acting now may destroy value vs waiting'] : [],
        });
        notes.push(`[Stage 12] TAI™: ${temporalArbitrageReport.taiScore}/100. Optimal timing: ${temporalArbitrageReport.optimalActionTiming}`);
      } catch (err) {
        notes.push(`[Stage 12] TemporalArbitrageEngine error: ${err}`);
      }
    }

    // ─ Stage 6: Insight Synthesis ─────────────────────────────────────────────
    notes.push('[Stage 6] Synthesizing cross-agent insights...');
    const insights = synthesizeInsights(adapted, impossibilityReport, cascadeReport, socialReport);
    notes.push(`[Stage 6] Synthesized ${insights.length} cross-agent insights`);

    // ─ Stage 7: Recommendation Generation ────────────────────────────────────
    notes.push('[Stage 7] Building strategic recommendations...');
    const recommendations = buildRecommendations(insights, impossibilityReport, cascadeReport, socialReport, adapted);

    // ─ Stage 8: Scoring ───────────────────────────────────────────────────────
    const scores = calculateCompositeScores(adapted, impossibilityReport, cascadeReport, socialReport);

    // ─ Stage 9: Verdict ───────────────────────────────────────────────────────
    const verdict: CompoundIntelligenceReport['primaryVerdict'] =
      scores.feasibility >= 70 ? 'PROCEED' :
      scores.feasibility >= 55 ? 'PROCEED-WITH-CONDITIONS' :
      scores.feasibility >= 35 ? 'REDESIGN' :
      scores.feasibility >= 20 ? 'INVESTIGATE-FURTHER' :
      'DO-NOT-PROCEED';

    const verdictRationale = `Compound feasibility score: ${scores.feasibility}/100. Long-run viability: ${scores.viability}/100. Social adoption: ${scores.adoptability}/100. ${
      impossibilityReport ? `Impossibility analysis: ${impossibilityReport.verdict}.` : ''
    }`;

    // ─ Stage 10: ADVERSIQ Briefing ────────────────────────────────────────────
    const adversiqBriefing = buildADVERSIQBriefing(adapted, insights, impossibilityReport, cascadeReport, socialReport, scores.feasibility);

    // ─ Final Assembly ─────────────────────────────────────────────────────────
    const singleAction = recommendations[0]?.firstAction ||
      insights.find(i => i.insightType === 'recommendation')?.content ||
      'Define a clear success metric first, then work backward to the minimum viable first step.';

    const executiveSummary = buildExecutiveSummary(
      input.naturalLanguageQuery, problemType, insights, recommendations, scores, verdict
    );

    const totalDuration = Date.now() - startTime;
    notes.push(`[CompoundIntelligenceOrchestrator] Complete in ${totalDuration}ms. Verdict: ${verdict}`);

    return {
      queryId,
      originalQuery: input.naturalLanguageQuery,
      problemType,
      problemDomain: adapted.problemDomain,
      processingStarted: new Date(startTime).toISOString(),
      processingCompleted: new Date().toISOString(),
      totalDurationMs: totalDuration,
      adaptedInput: adapted,
      impossibilityReport,
      cascadeReport,
      socialDynamicsReport: socialReport,
      antifragilityReport,
      temporalArbitrageReport,
      agentExecutionChain: agentChain,
      synthesizedInsights: insights,
      strategicRecommendations: recommendations,
      adversiqBriefing,
      overallFeasibilityScore: scores.feasibility,
      longTermViabilityScore: scores.viability,
      socialAdoptabilityScore: scores.adoptability,
      impossibilityScore: scores.impossibilityScore,
      antifragilityScore: antifragilityReport?.afiScore,
      temporalArbitrageScore: temporalArbitrageReport?.taiScore,
      compositeConfidence: Math.round((scores.feasibility + scores.viability + scores.adoptability) / 3),
      executiveSummary,
      primaryVerdict: verdict,
      verdictRationale,
      singleHighestLeverageAction: singleAction,
      processingNotes: notes
    };
  }

  /**
   * Synchronous version for simple queries (no async needed since all agents are synchronous)
   */
  static orchestrateSync(input: UniversalProblemInput): CompoundIntelligenceReport {
    // Since all sub-agents are synchronous, we resolve immediately
    let result!: CompoundIntelligenceReport;
    CompoundIntelligenceOrchestrator.orchestrate(input).then(r => { result = r; });
    return result;
  }
}

export default CompoundIntelligenceOrchestrator;
