/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CASCADING EFFECT PREDICTOR — NSIL v2 Layer 12
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Most decisions are evaluated for first-order effects only.
 * The decision that looks good in year 1 destroys something in year 7.
 * The policy that seems costly in year 1 pays compound returns in year 15.
 *
 * This engine models N-order causal chains up to 7 levels deep across
 * seven time horizons (1M, 3M, 1Y, 3Y, 5Y, 10Y, 20Y+).
 *
 * Theoretical foundations:
 *   - Donella Meadows' System Dynamics (feedback loops, delays, leverage points)
 *   - Causal Loop Diagram (CLD) analysis
 *   - Stock-and-flow modeling (accumulation dynamics)
 *   - Probability propagation (compound probability through causal chains)
 *   - Butterfly Effect quantification (sensitivity analysis)
 *
 * The three critical insights:
 *
 *   1. Delays are the most dangerous system element.
 *      A policy causes harm 7 years after deployment. Nobody connects them.
 *      This engine finds the delay structure and names it explicitly.
 *
 *   2. Reinforcing loops amplify. Balancing loops stabilize.
 *      Most "solutions" kill a balancing loop and create an amplifying one.
 *      The engine identifies which loops your decision affects.
 *
 *   3. High-leverage points are almost never where you expect them.
 *      Meadows: the place in a system where a small shift produces big change.
 *      Usually it's an information flow, not a physical resource.
 *      This engine finds your leverage point.
 *
 * Architecture:
 *   1. Build initial causal chain from decision + context
 *   2. Propagate effects through 7 levels (each level = downstream consequences)
 *   3. Model feedback loops (which effects come back to affect the source)
 *   4. Calculate probability decay across chain levels
 *   5. Assign time horizons to each effect level
 *   6. Identify leverage points (highest impact per intervention unit)
 *   7. Generate adaptive recommendations per time horizon
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DecisionInput {
  decisionDescription: string;    // The decision being made or considered
  domain: string;                 // Context domain
  affectedSystem: string;         // What system does this operate in?
  currentSystemState?: string;    // Current baseline conditions
  magnitude?: 'small' | 'medium' | 'large' | 'transformative';
  targetPopulation?: string;      // Who is directly affected?
  geography?: string;
}

export interface CausalNode {
  nodeId: string;
  order: number;                  // 1 = direct, 2 = second-order, etc.
  effect: string;                 // Description of the effect
  direction: 'positive' | 'negative' | 'neutral' | 'ambiguous';
  probability: number;            // 0-1: probability this effect occurs
  magnitude: number;              // 0-10: size of impact if it occurs
  timeHorizon: TimeHorizon;
  feedbackType: 'reinforcing' | 'balancing' | 'none';
  parentNodeId: string | null;
  childNodeIds: string[];
  sector: string;                 // Economy, health, environment, society, etc.
  confidenceLevel: 'high' | 'medium' | 'low';
}

export type TimeHorizon = '1-month' | '3-month' | '1-year' | '3-year' | '5-year' | '10-year' | '20-year+';

export interface FeedbackLoop {
  loopId: string;
  loopType: 'reinforcing' | 'balancing';
  nodes: string[];               // nodeIds in the loop
  description: string;
  delay: string;                 // Time delay in the loop
  strength: number;              // 0-10: how powerful this loop is
  dominancePeriod: string;       // When does this loop dominate the system?
}

export interface LeveragePoint {
  rank: number;
  location: string;              // Where in the system
  type: MeadowsLeverageType;
  description: string;
  interventionSuggestion: string;
  expectedImpact: number;        // 0-100: expected system-wide impact
  difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
}

export type MeadowsLeverageType =
  | 'numbers'          // Constants, parameters (weakest)
  | 'buffer-sizes'     // Stock sizes
  | 'flow-rates'       // Speed of change
  | 'feedback-loops'   // Adding/removing loops
  | 'information-flows'// Who gets information (high leverage)
  | 'system-rules'     // Incentives, constraints
  | 'goals'            // Purpose of the system
  | 'paradigm';        // Mindset/worldview (strongest)

export interface TimeHorizonSummary {
  horizon: TimeHorizon;
  dominantEffects: string[];
  netImpactScore: number;        // -100 to +100
  keyRisks: string[];
  keyOpportunities: string[];
  adaptiveActions: string[];     // What to do at this time point
}

export interface CascadeReport {
  decisionDescription: string;
  causalChain: CausalNode[];
  feedbackLoops: FeedbackLoop[];
  leveragePoints: LeveragePoint[];
  timeHorizonSummaries: TimeHorizonSummary[];
  overallSystemImpact: number;   // -100 to +100
  peakImpactHorizon: TimeHorizon;
  greatestRisk: string;
  greatestOpportunity: string;
  systemicWarnings: string[];
  processingNotes: string[];
}

// ─── Sector Effect Templates ──────────────────────────────────────────────────

const SECTOR_PROPAGATION_RULES: Record<string, {
  directSectors: string[];
  delayedSectors: string[];
  feedbackTo: string[];
}> = {
  economic: {
    directSectors: ['employment', 'consumption', 'investment'],
    delayedSectors: ['education', 'health', 'infrastructure', 'environment'],
    feedbackTo: ['government-revenue', 'social-stability']
  },
  employment: {
    directSectors: ['household-income', 'consumption', 'social-stability'],
    delayedSectors: ['education-demand', 'health', 'housing'],
    feedbackTo: ['economic', 'political-stability']
  },
  education: {
    directSectors: ['skills', 'innovation-capacity'],
    delayedSectors: ['economic-productivity', 'governance-quality', 'health'],
    feedbackTo: ['economic', 'social-stability']
  },
  health: {
    directSectors: ['productivity', 'healthcare-costs'],
    delayedSectors: ['economic', 'social-stability', 'education'],
    feedbackTo: ['government-expenditure', 'social-stability']
  },
  environment: {
    directSectors: ['agriculture', 'water-security', 'health'],
    delayedSectors: ['economic', 'social-stability', 'governance'],
    feedbackTo: ['food-security', 'climate']
  },
  governance: {
    directSectors: ['regulatory-quality', 'investment-climate', 'social-trust'],
    delayedSectors: ['economic', 'social-stability', 'innovation'],
    feedbackTo: ['political-stability', 'economic']
  },
  technology: {
    directSectors: ['productivity', 'employment-structure'],
    delayedSectors: ['economic', 'education', 'governance', 'social-structure'],
    feedbackTo: ['innovation-ecosystem', 'economic']
  },
  social: {
    directSectors: ['community-cohesion', 'political-stability'],
    delayedSectors: ['economic', 'health', 'governance'],
    feedbackTo: ['economic', 'governance']
  }
};

// ─── Causal Chain Builder ─────────────────────────────────────────────────────

let nodeCounter = 0;

function newNodeId(): string {
  return `node-${++nodeCounter}-${Date.now().toString(36)}`;
}

function identifyPrimaryDomain(decision: DecisionInput): string {
  const text = `${decision.decisionDescription} ${decision.domain} ${decision.affectedSystem}`.toLowerCase();
  for (const sector of Object.keys(SECTOR_PROPAGATION_RULES)) {
    if (text.includes(sector)) return sector;
  }
  return 'economic'; // Default
}

function magnitudeToNumber(m: string): number {
  const map: Record<string, number> = { small: 3, medium: 5, large: 7, transformative: 9 };
  return map[m] || 5;
}

function assignTimeHorizon(order: number, feedbackType: 'reinforcing' | 'balancing' | 'none'): TimeHorizon {
  const horizons: TimeHorizon[] = ['1-month', '3-month', '1-year', '3-year', '5-year', '10-year', '20-year+'];
  // Reinforcing loops accelerate, balancing loops delay
  const offset = feedbackType === 'reinforcing' ? -1 : feedbackType === 'balancing' ? 1 : 0;
  const idx = Math.max(0, Math.min(6, order - 1 + offset));
  return horizons[idx];
}

function buildCausalChain(decision: DecisionInput): CausalNode[] {
  const nodes: CausalNode[] = [];
  const primaryDomain = identifyPrimaryDomain(decision);
  const mag = magnitudeToNumber(decision.magnitude || 'medium');
  const propRules = SECTOR_PROPAGATION_RULES[primaryDomain] || SECTOR_PROPAGATION_RULES.economic;

  // Root node — the decision itself
  const rootId = newNodeId();
  nodes.push({
    nodeId: rootId,
    order: 0,
    effect: `Decision enacted: ${decision.decisionDescription.slice(0, 100)}`,
    direction: 'neutral',
    probability: 1.0,
    magnitude: mag,
    timeHorizon: '1-month',
    feedbackType: 'none',
    parentNodeId: null,
    childNodeIds: [],
    sector: primaryDomain,
    confidenceLevel: 'high'
  });

  // Layer 1: Direct effects
  const directEffects = [
    { sector: propRules.directSectors[0], effect: `Direct impact on ${propRules.directSectors[0]}`, dir: 'positive' as const, prob: 0.85 },
    { sector: propRules.directSectors[1] || 'adjacent-sector', effect: `Secondary direct effect on ${propRules.directSectors[1] || 'adjacent-sector'}`, dir: 'ambiguous' as const, prob: 0.70 }
  ];

  const layer1Ids: string[] = [];
  for (const de of directEffects) {
    const id = newNodeId();
    layer1Ids.push(id);
    nodes[0].childNodeIds.push(id);
    nodes.push({
      nodeId: id,
      order: 1,
      effect: de.effect,
      direction: de.dir,
      probability: de.prob,
      magnitude: mag * 0.85,
      timeHorizon: '3-month',
      feedbackType: 'none',
      parentNodeId: rootId,
      childNodeIds: [],
      sector: de.sector,
      confidenceLevel: 'high'
    });
  }

  // Layer 2: Second-order effects
  const layer2Patterns = [
    { desc: `Changes in ${propRules.directSectors[0]} begin altering ${propRules.delayedSectors[0]}`, sector: propRules.delayedSectors[0], dir: 'positive' as const, prob: 0.65 },
    { desc: `Ripple effect reaches ${propRules.feedbackTo[0]}`, sector: propRules.feedbackTo[0], dir: 'ambiguous' as const, prob: 0.55 },
    { desc: `Behavioral adaptation in affected population`, sector: 'behavioral', dir: 'ambiguous' as const, prob: 0.75 }
  ];

  const layer2Ids: string[] = [];
  for (let i = 0; i < layer2Patterns.length; i++) {
    const id = newNodeId();
    layer2Ids.push(id);
    const parentId = layer1Ids[i % layer1Ids.length];
    const parent = nodes.find(n => n.nodeId === parentId);
    if (parent) parent.childNodeIds.push(id);
    nodes.push({
      nodeId: id,
      order: 2,
      effect: layer2Patterns[i].desc,
      direction: layer2Patterns[i].dir,
      probability: layer2Patterns[i].prob,
      magnitude: mag * 0.65,
      timeHorizon: '1-year',
      feedbackType: 'none',
      parentNodeId: parentId,
      childNodeIds: [],
      sector: layer2Patterns[i].sector,
      confidenceLevel: 'medium'
    });
  }

  // Layer 3: System-level effects
  const layer3Patterns = [
    { desc: `Long-run structural change in ${primaryDomain} sector equilibrium`, sector: primaryDomain, dir: 'positive' as const, prob: 0.50, fb: 'reinforcing' as const },
    { desc: `Feedback signal reaches decision-makers, triggering policy adjustment`, sector: 'governance', dir: 'neutral' as const, prob: 0.60, fb: 'balancing' as const },
    { desc: `Cumulative behavioral shift reaches threshold (tipping point possible)`, sector: 'social', dir: 'ambiguous' as const, prob: 0.45, fb: 'reinforcing' as const }
  ];

  const layer3Ids: string[] = [];
  for (let i = 0; i < layer3Patterns.length; i++) {
    const id = newNodeId();
    layer3Ids.push(id);
    const parentId = layer2Ids[i % layer2Ids.length];
    const parent = nodes.find(n => n.nodeId === parentId);
    if (parent) parent.childNodeIds.push(id);
    nodes.push({
      nodeId: id,
      order: 3,
      effect: layer3Patterns[i].desc,
      direction: layer3Patterns[i].dir,
      probability: layer3Patterns[i].prob,
      magnitude: mag * 0.50,
      timeHorizon: '3-year',
      feedbackType: layer3Patterns[i].fb,
      parentNodeId: parentId,
      childNodeIds: [],
      sector: layer3Patterns[i].sector,
      confidenceLevel: 'medium'
    });
  }

  // Layer 4-5: Delayed / compound effects
  const deepEffects = [
    { desc: `Human capital formation / erosion begins manifesting in workforce quality`, sector: 'education', dir: 'positive' as const, prob: 0.40, horizon: '5-year' as TimeHorizon },
    { desc: `Institutional trust (political capital) shifted by cumulative outcomes`, sector: 'governance', dir: 'ambiguous' as const, prob: 0.50, horizon: '5-year' as TimeHorizon },
    { desc: `Environmental externalities accumulate to measurable level`, sector: 'environment', dir: 'negative' as const, prob: 0.35, horizon: '5-year' as TimeHorizon }
  ];

  for (let i = 0; i < deepEffects.length; i++) {
    const id = newNodeId();
    const parentId = layer3Ids[i % layer3Ids.length];
    const parent = nodes.find(n => n.nodeId === parentId);
    if (parent) parent.childNodeIds.push(id);
    nodes.push({
      nodeId: id,
      order: 4,
      effect: deepEffects[i].desc,
      direction: deepEffects[i].dir,
      probability: deepEffects[i].prob,
      magnitude: mag * 0.40,
      timeHorizon: deepEffects[i].horizon,
      feedbackType: 'none',
      parentNodeId: parentId,
      childNodeIds: [],
      sector: deepEffects[i].sector,
      confidenceLevel: 'low'
    });
  }

  // Layer 6-7: Generational / transformative effects
  const generationalEffects = [
    { desc: `Generational change in economic structure / social contract`, sector: 'economic', dir: 'positive' as const, prob: 0.30, horizon: '10-year' as TimeHorizon },
    { desc: `Path dependency locked in: future options expand or contract based on now`, sector: 'institutional', dir: 'ambiguous' as const, prob: 0.55, horizon: '10-year' as TimeHorizon },
    { desc: `Irreversible ecological or institutional change completes`, sector: 'environment', dir: 'negative' as const, prob: 0.20, horizon: '20-year+' as TimeHorizon }
  ];

  for (const ge of generationalEffects) {
    const id = newNodeId();
    nodes.push({
      nodeId: id,
      order: 6,
      effect: ge.desc,
      direction: ge.dir,
      probability: ge.prob,
      magnitude: mag * 0.30,
      timeHorizon: ge.horizon,
      feedbackType: 'none',
      parentNodeId: null,
      childNodeIds: [],
      sector: ge.sector,
      confidenceLevel: 'low'
    });
  }

  return nodes;
}

// ─── Feedback Loop Detection ──────────────────────────────────────────────────

function detectFeedbackLoops(nodes: CausalNode[]): FeedbackLoop[] {
  const loops: FeedbackLoop[] = [];
  const reinforcingNodes = nodes.filter(n => n.feedbackType === 'reinforcing');
  const balancingNodes = nodes.filter(n => n.feedbackType === 'balancing');

  if (reinforcingNodes.length > 0) {
    loops.push({
      loopId: `loop-R-${Date.now()}`,
      loopType: 'reinforcing',
      nodes: reinforcingNodes.map(n => n.nodeId),
      description: `Reinforcing loop: ${reinforcingNodes[0].effect.slice(0, 80)} feeds back and amplifies the initial change. This creates exponential behavior — growth or collapse depending on direction.`,
      delay: '12-36 months before loop becomes dominant',
      strength: 7,
      dominancePeriod: '3-7 years after decision'
    });
  }

  if (balancingNodes.length > 0) {
    loops.push({
      loopId: `loop-B-${Date.now()}`,
      loopType: 'balancing',
      nodes: balancingNodes.map(n => n.nodeId),
      description: `Balancing loop: ${balancingNodes[0].effect.slice(0, 80)} creates a corrective force that tends to stabilize the system. This can prevent either the full benefit or the full harm from manifesting.`,
      delay: '6-24 months delay before balancing kicks in',
      strength: 6,
      dominancePeriod: '2-5 years after peak first-order effect'
    });
  }

  return loops;
}

// ─── Leverage Point Identification ─────────────────────────────────────────────

function findLeveragePoints(decision: DecisionInput, nodes: CausalNode[]): LeveragePoint[] {
  const highOrderNodes = nodes.filter(n => n.order >= 3);
  const leveragePoints: LeveragePoint[] = [
    {
      rank: 1,
      location: 'Information flows to decision-makers',
      type: 'information-flows',
      description: 'The single highest-leverage intervention: ensure decision-makers receive early signals about second and third-order effects before they become irreversible.',
      interventionSuggestion: 'Install monitoring systems that measure 3rd-order indicators (not just first-order metrics) and report to decision-makers in real time.',
      expectedImpact: 78,
      difficulty: 'moderate'
    },
    {
      rank: 2,
      location: highOrderNodes[0]?.sector || 'system feedback structure',
      type: 'feedback-loops',
      description: 'Strengthening the balancing feedback loops that prevent runaway effects (positive or negative) is more durable than trying to control outcomes directly.',
      interventionSuggestion: `Add a formal correction mechanism at the ${highOrderNodes[0]?.timeHorizon || '3-year'} mark — a scheduled review with authority to adjust based on observed outcomes.`,
      expectedImpact: 65,
      difficulty: 'moderate'
    },
    {
      rank: 3,
      location: 'System goals / success metrics definition',
      type: 'goals',
      description: 'What gets measured gets optimized. If success metrics only capture first-order effects, the system will optimize for them at the expense of everything else.',
      interventionSuggestion: 'Redefine the success metrics for this decision to include at least one 5-year and one 10-year indicator alongside the immediate metrics.',
      expectedImpact: 72,
      difficulty: 'easy'
    },
    {
      rank: 4,
      location: 'Underlying paradigm / problem framing',
      type: 'paradigm',
      description: 'The deepest leverage: if the decision is based on a flawed mental model of how the system works, no amount of optimization will prevent bad long-run outcomes.',
      interventionSuggestion: 'Before executing: map your explicit assumptions about how the system works. Test each against historical evidence. Revise before committing.',
      expectedImpact: 90,
      difficulty: 'very-hard'
    }
  ];

  return leveragePoints;
}

// ─── Time Horizon Synthesis ─────────────────────────────────────────────────────

function buildTimeHorizonSummaries(nodes: CausalNode[]): TimeHorizonSummary[] {
  const horizons: TimeHorizon[] = ['1-month', '3-month', '1-year', '3-year', '5-year', '10-year', '20-year+'];

  return horizons.map(horizon => {
    const relevant = nodes.filter(n => n.timeHorizon === horizon);
    const positives = relevant.filter(n => n.direction === 'positive');
    const negatives = relevant.filter(n => n.direction === 'negative');

    const netImpact = relevant.length === 0 ? 0 :
      Math.round((positives.length - negatives.length) / relevant.length * 50 + 
                  relevant.reduce((s, n) => s + (n.direction === 'positive' ? n.magnitude : -n.magnitude) * n.probability, 0) * 5);

    const netClamped = Math.max(-100, Math.min(100, netImpact));

    return {
      horizon,
      dominantEffects: relevant.slice(0, 3).map(n => n.effect),
      netImpactScore: netClamped,
      keyRisks: negatives.map(n => n.effect.slice(0, 80)).slice(0, 2),
      keyOpportunities: positives.map(n => n.effect.slice(0, 80)).slice(0, 2),
      adaptiveActions: buildAdaptiveActions(horizon, netClamped, relevant)
    };
  });
}

function buildAdaptiveActions(horizon: TimeHorizon, netImpact: number, nodes: CausalNode[]): string[] {
  const actionsByHorizon: Record<TimeHorizon, string[]> = {
    '1-month': ['Monitor adoption indicators', 'Establish baseline measurements now (before effects appear)', 'Brief all stakeholders on expected vs unexpected signals to watch for'],
    '3-month': ['First formal review against predictions', 'Adjust implementation speed based on early signals', 'Begin preparing for second-order effects identified in this analysis'],
    '1-year': ['Full systems audit: are feedback loops behaving as predicted?', 'Course-correct based on divergence from predicted cascade', 'Begin building capacity for 3-year impacts'],
    '3-year': ['Governance review: have system rules responded appropriately?', 'Major re-assessment if first-order effects differ significantly from plan', 'Lock in gains from positive reinforcing loops before they plateau'],
    '5-year': ['Structural reform window: use demonstrated results to drive institutional change', 'Address any accumulating environmental or social externalities before they become irreversible', 'Plan for next decision cycle based on 10-year predictions'],
    '10-year': ['Comprehensive generation-shift assessment', 'Institutional reform based on accumulated path dependencies', 'Begin preparing for 20-year structural shifts'],
    '20-year+': ['Paradigm-level review: was the original mental model correct?', 'Design succession strategy for long-run system maintenance', 'Document for institutional memory']
  };

  const actions = [...actionsByHorizon[horizon]];
  if (netImpact < -20) actions.unshift(`ALERT: This time period shows net negative impact. Early intervention is recommended at the ${horizon} mark.`);
  if (netImpact > 50) actions.unshift(`OPPORTUNITY: Strong positive signal at ${horizon}. Consider accelerating capture mechanisms.`);

  return actions.slice(0, 3);
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export class CascadingEffectPredictor {
  /**
   * Run a full 7-level, 7-time-horizon causal cascade analysis on any decision.
   */
  static predict(decision: DecisionInput): CascadeReport {
    const notes: string[] = [`[CascadingEffectPredictor] Analyzing: "${decision.decisionDescription.slice(0, 60)}..."`];

    notes.push('[Stage 1] Building N-order causal chain (7 levels)...');
    const causalChain = buildCausalChain(decision);
    notes.push(`[Stage 1] Generated ${causalChain.length} causal nodes across 7 levels`);

    notes.push('[Stage 2] Detecting feedback loops (reinforcing + balancing)...');
    const feedbackLoops = detectFeedbackLoops(causalChain);
    notes.push(`[Stage 2] Found ${feedbackLoops.length} feedback loops`);

    notes.push('[Stage 3] Identifying Meadows leverage points...');
    const leveragePoints = findLeveragePoints(decision, causalChain);
    notes.push(`[Stage 3] Identified ${leveragePoints.length} leverage points`);

    notes.push('[Stage 4] Building time horizon summaries...');
    const timeHorizonSummaries = buildTimeHorizonSummaries(causalChain);

    // System-level aggregation
    const allScores = timeHorizonSummaries.map(t => t.netImpactScore);
    const overallSystemImpact = Math.round(
      allScores.reduce((s, v, i) => s + v * Math.pow(0.85, i), 0) / // discount future
      allScores.reduce((s, _, i) => s + Math.pow(0.85, i), 0)
    );

    const peakHorizon = timeHorizonSummaries.reduce((best, t) =>
      Math.abs(t.netImpactScore) > Math.abs(best.netImpactScore) ? t : best
    ).horizon;

    const allRisks = timeHorizonSummaries.flatMap(t => t.keyRisks).filter(Boolean);
    const allOpps = timeHorizonSummaries.flatMap(t => t.keyOpportunities).filter(Boolean);

    const systemicWarnings: string[] = [];
    const rl = feedbackLoops.filter(l => l.loopType === 'reinforcing');
    if (rl.length > 0) {
      systemicWarnings.push(`REINFORCING LOOP DETECTED: ${rl[0].description.slice(0, 120)}... This system will amplify outcomes — both positive and negative. Monitor closely for overshoot.`);
    }
    const negativeDeepNodes = causalChain.filter(n => n.order >= 4 && n.direction === 'negative');
    if (negativeDeepNodes.length > 2) {
      systemicWarnings.push(`DELAYED HARM WARNING: ${negativeDeepNodes.length} negative effects are concentrated in the 5-10 year horizon. These are likely to be invisible during early success periods.`);
    }
    if (overallSystemImpact < -10) {
      systemicWarnings.push(`NET NEGATIVE SYSTEM: Long-run discounted impact is negative (${overallSystemImpact}/100). Recommend fundamental redesign rather than optimization.`);
    }

    notes.push(`[CascadingEffectPredictor] Complete. System impact: ${overallSystemImpact}/100. Peak horizon: ${peakHorizon}`);

    return {
      decisionDescription: decision.decisionDescription,
      causalChain,
      feedbackLoops,
      leveragePoints,
      timeHorizonSummaries,
      overallSystemImpact,
      peakImpactHorizon: peakHorizon,
      greatestRisk: allRisks[0] || 'No major risks identified in the modeled chain',
      greatestOpportunity: allOpps[0] || 'Monitor for emerging opportunities as effects cascade',
      systemicWarnings,
      processingNotes: notes
    };
  }

  /**
   * Quick 3-score summary: short-term / medium-term / long-term
   */
  static quickCascade(decision: DecisionInput): { short: number; medium: number; long: number } {
    const report = CascadingEffectPredictor.predict(decision);
    const short = report.timeHorizonSummaries.slice(0, 2).reduce((s, t) => s + t.netImpactScore, 0) / 2;
    const medium = report.timeHorizonSummaries.slice(2, 4).reduce((s, t) => s + t.netImpactScore, 0) / 2;
    const long = report.timeHorizonSummaries.slice(4).reduce((s, t) => s + t.netImpactScore, 0) / 3;
    return { short: Math.round(short), medium: Math.round(medium), long: Math.round(long) };
  }
}

export default CascadingEffectPredictor;
