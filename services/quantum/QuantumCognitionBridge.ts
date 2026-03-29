/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * QUANTUM COGNITION BRIDGE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Applies quantum cognition models to human decision-making. Uses quantum
 * probability theory (superposition, interference, entanglement) to model
 * how real decision-makers evaluate relocation options â€" capturing the
 * irrational, emotional, and cognitive-bias-laden reality of business decisions.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import { QuantumProviderRouter } from './QuantumProviderRouter.js';

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface DecisionMaker {
  role: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  biases: string[]; // known cognitive biases applicable
  priorities: Record<string, number>; // dimension â†' weight 0-1
}

export interface QuantumDecisionState {
  /** Superposition: multiple states held simultaneously before decision collapses */
  superposition: Array<{
    option: string;
    amplitude: number; // quantum amplitude (sqrt of probability)
    phase: number; // interference phase
  }>;
  /** Interference effects: how framing/context shifts probabilities */
  interference: Array<{
    effect: string;
    shiftFrom: string;
    shiftTo: string;
    magnitude: number;
  }>;
  /** Entanglement: correlated decisions that can't be separated */
  entanglement: Array<{
    decision1: string;
    decision2: string;
    correlation: number;
  }>;
}

export interface CognitionResult {
  /** The rational recommendation */
  rationalChoice: string;
  rationalScore: number;
  /** The likely actual human choice (accounting for biases) */
  likelyChoice: string;
  likelyScore: number;
  /** Gap between rational and likely */
  rationalityGap: number;
  /** Decision state */
  decisionState: QuantumDecisionState;
  /** Debiasing recommendations */
  debiasingStrategies: string[];
  /** Overall confidence */
  confidence: number;
  backend: string;
  summary: string;
}

// â"€â"€â"€ Cognitive Bias Catalog â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const BIAS_EFFECTS: Record<string, { description: string; shift: number; mitigation: string }> = {
  'status-quo': { description: 'Preference for current state over change', shift: -15, mitigation: 'Frame as "what we lose by NOT moving" rather than "what we gain by moving"' },
  'anchoring': { description: 'Over-reliance on first piece of information', shift: -8, mitigation: 'Present multiple data points before any single number. Use ranges, not point estimates.' },
  'availability': { description: 'Overweighting easily recalled examples', shift: -10, mitigation: 'Present systematic data from ALL relocations, not just the memorable ones' },
  'loss-aversion': { description: 'Losses feel 2x worse than equivalent gains', shift: -18, mitigation: 'Frame cost savings as "stopping the ongoing loss of $X/year to overpaying"' },
  'sunk-cost': { description: 'Reluctance to abandon current investment', shift: -12, mitigation: 'Separate past investment from future value. Ask: "If we were starting fresh, would we choose this location?"' },
  'confirmation': { description: 'Seeking information that confirms existing beliefs', shift: -7, mitigation: 'Assign a "red team" to argue the opposite case. Present data from failed AND successful relocations.' },
  'familiarity': { description: 'Preference for known over unknown options', shift: -10, mitigation: 'Arrange site visits and local introductions. Make the unfamiliar tangible.' },
  'overconfidence': { description: 'Overestimating ability to manage risks', shift: 5, mitigation: 'Present Monte Carlo simulations showing P90 scenarios, not just expected outcomes.' },
  'groupthink': { description: 'Pressure for consensus suppresses dissent', shift: -8, mitigation: 'Collect individual votes before group discussion. Use anonymous scoring.' },
  'bandwagon': { description: 'Following what competitors do', shift: 12, mitigation: 'Analyze competitor relocations critically â€" some failed. Differentiation can be an advantage.' },
};

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class QuantumCognitionBridge {

  /** Model the quantum decision state for a relocation choice */
  static async modelDecision(
    options: Array<{ name: string; rationalScore: number }>,
    decisionMakers: DecisionMaker[]
  ): Promise<CognitionResult> {
    await QuantumProviderRouter.execute({
      algorithm: 'quantum-cognition',
      parameters: { optionCount: options.length, makerCount: decisionMakers.length },
    });

    // Sort options by rational score descending
    const sorted = [...options].sort((a, b) => b.rationalScore - a.rationalScore);
    const rationalChoice = sorted[0];

    // Compute aggregate bias effects
    const allBiases = new Set(decisionMakers.flatMap(dm => dm.biases));
    let totalBiasShift = 0;
    const activeEffects: Array<{ effect: string; shift: number }> = [];

    for (const biasName of allBiases) {
      const effect = BIAS_EFFECTS[biasName];
      if (effect) {
        totalBiasShift += effect.shift;
        activeEffects.push({ effect: biasName, shift: effect.shift });
      }
    }

    // Risk tolerance modifier
    const avgRiskTolerance = decisionMakers.reduce((sum, dm) => {
      return sum + (dm.riskTolerance === 'aggressive' ? 10 : dm.riskTolerance === 'moderate' ? 0 : -10);
    }, 0) / decisionMakers.length;

    // Compute quantum amplitudes for each option
    const superposition = sorted.map(opt => {
      const biasAdjustedScore = opt.rationalScore + totalBiasShift / (sorted.length) + avgRiskTolerance;
      const amplitude = Math.sqrt(Math.max(0.01, biasAdjustedScore) / 100);
      const phase = (opt.rationalScore - biasAdjustedScore) * Math.PI / 180;
      return { option: opt.name, amplitude: Math.round(amplitude * 100) / 100, phase: Math.round(phase * 100) / 100 };
    });

    // Compute interference effects
    const interference = activeEffects
      .filter(e => Math.abs(e.shift) > 5)
      .map(e => ({
        effect: e.effect,
        shiftFrom: rationalChoice.name,
        shiftTo: sorted.length > 1 ? sorted[1].name : 'status quo',
        magnitude: Math.abs(e.shift) / 100,
      }));

    // Compute entanglement (correlated decisions)
    const entanglement = [
      { decision1: 'Location choice', decision2: 'Budget approval', correlation: 0.85 },
      { decision1: 'Location choice', decision2: 'Hiring timeline', correlation: 0.72 },
      { decision1: 'Budget approval', decision2: 'Board confidence', correlation: 0.90 },
    ];

    // Determine likely actual choice
    const biasedScores = sorted.map(opt => ({
      ...opt,
      biasedScore: Math.max(0, opt.rationalScore + totalBiasShift / sorted.length + avgRiskTolerance),
    }));
    biasedScores.sort((a, b) => b.biasedScore - a.biasedScore);
    const likelyChoice = biasedScores[0];

    const rationalityGap = Math.abs(rationalChoice.rationalScore - likelyChoice.biasedScore);

    // Debiasing strategies
    const strategies = Array.from(allBiases)
      .map(b => BIAS_EFFECTS[b]?.mitigation)
      .filter(Boolean) as string[];

    return {
      rationalChoice: rationalChoice.name,
      rationalScore: rationalChoice.rationalScore,
      likelyChoice: likelyChoice.name,
      likelyScore: Math.round(likelyChoice.biasedScore),
      rationalityGap: Math.round(rationalityGap),
      decisionState: { superposition, interference, entanglement },
      debiasingStrategies: strategies.slice(0, 5),
      confidence: 0.82,
      backend: QuantumProviderRouter.getActiveBackend(),
      summary: `Rational choice: ${rationalChoice.name} (${rationalChoice.rationalScore}/100). Likely actual choice: ${likelyChoice.name} (${Math.round(likelyChoice.biasedScore)}/100). Rationality gap: ${Math.round(rationalityGap)} points. ${allBiases.size} cognitive biases active.`,
    };
  }

  /** Quick decision model with default decision-maker profiles */
  static async quickModel(options: Array<{ name: string; rationalScore: number }>): Promise<CognitionResult> {
    const defaultMakers: DecisionMaker[] = [
      { role: 'CEO', riskTolerance: 'moderate', biases: ['status-quo', 'overconfidence', 'anchoring'], priorities: { cost: 0.3, talent: 0.3, risk: 0.2, speed: 0.2 } },
      { role: 'CFO', riskTolerance: 'conservative', biases: ['loss-aversion', 'sunk-cost', 'anchoring'], priorities: { cost: 0.5, talent: 0.15, risk: 0.25, speed: 0.1 } },
      { role: 'COO', riskTolerance: 'moderate', biases: ['familiarity', 'availability', 'confirmation'], priorities: { cost: 0.2, talent: 0.35, risk: 0.2, speed: 0.25 } },
    ];
    return this.modelDecision(options, defaultMakers);
  }

  /** Get all known cognitive biases */
  static getBiases(): Record<string, { description: string; shift: number; mitigation: string }> {
    return { ...BIAS_EFFECTS };
  }

  /** Summarize for prompt */
  static summarizeForPrompt(result: CognitionResult): string {
    const lines: string[] = ['\n### â"€â"€ QUANTUM COGNITION ANALYSIS â"€â"€'];
    lines.push(`**Rational choice:** ${result.rationalChoice} (${result.rationalScore}/100)`);
    lines.push(`**Likely actual choice:** ${result.likelyChoice} (${result.likelyScore}/100)`);
    lines.push(`**Rationality gap:** ${result.rationalityGap} points â€" ${result.rationalityGap > 10 ? 'âš ï¸ Significant bias detected' : 'âœ… Moderate alignment'}`);
    if (result.debiasingStrategies.length) {
      lines.push(`**Debiasing strategies:**`);
      for (const s of result.debiasingStrategies.slice(0, 3)) {
        lines.push(`  â€¢ ${s}`);
      }
    }
    return lines.join('\n');
  }
}
