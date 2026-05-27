import {
  ReportParameters,
  AdversarialShieldResult,
  AdversarialInputCheck,
  PersonaPanelResult,
  PersonaInsight,
  PersonaRole,
  MotivationAnalysis,
  CounterfactualLabResult,
  CounterfactualScenario,
  OutcomeLearningSnapshot,
  OutcomeAlignment,
  AdversarialConfidenceResult
} from '../types';
import { InputShieldService, ShieldReport, ValidationResult } from './InputShieldService';
import { PersonaEngine, FullPersonaAnalysis, PersonaFinding } from './PersonaEngine';
import { CounterfactualEngine, CounterfactualAnalysis, Scenario } from './CounterfactualEngine';
import OutcomeTracker from './OutcomeTracker';
import MotivationDetector from './MotivationDetector';

export interface AdversarialOutputs {
  adversarialShield: AdversarialShieldResult;
  personaPanel: PersonaPanelResult;
  motivation: MotivationAnalysis;
  counterfactuals: CounterfactualLabResult;
  outcomeLearning: OutcomeLearningSnapshot;
  adversarialConfidence: AdversarialConfidenceResult;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

class AdversarialReasoningService {
  static async generate(params: ReportParameters): Promise<AdversarialOutputs> {
    const personaAnalysis = await PersonaEngine.runFullAnalysis(params);
    const shieldReport = InputShieldService.validate(params);
    const motivation = MotivationDetector.analyze(params);
    const counterfactualAnalysis = CounterfactualEngine.analyze(params);
    const outcomeLearning = this.buildOutcomeSnapshot(params);
    const adversarialConfidence = this.computeAdversarialConfidence({
      shield: shieldReport,
      persona: personaAnalysis,
      counterfactual: counterfactualAnalysis,
      motivation,
      outcomeLearning
    });

    return {
      adversarialShield: this.mapShield(shieldReport),
      personaPanel: this.mapPersonaPanel(personaAnalysis),
      motivation,
      counterfactuals: this.mapCounterfactuals(counterfactualAnalysis),
      outcomeLearning,
      adversarialConfidence
    };
  }

  private static mapShield(report: ShieldReport): AdversarialShieldResult {
    const checks: AdversarialInputCheck[] = report.validationResults.map((result: ValidationResult) => ({
      field: result.field,
      userClaim: String(result.userValue ?? 'n/a'),
      externalEvidence: result.authoritySource ? [result.authoritySource] : [],
      contradictionLevel: this.computeContradictionLevel(result.flag),
      challengePrompt: result.message,
      severity: result.flag === 'critical' ? 'critical' : result.flag === 'warning' || result.flag === 'concern' ? 'warning' : 'info'
    }));

    const escalations = report.patternMatches
      .filter(match => match.severity === 'critical')
      .map(match => `${match.pattern}: ${match.description}`);

    const contradictionIndex = clamp(100 - report.overallTrust, 0, 100);

    return {
      contradictionIndex,
      checks,
      escalations,
      reviewedAt: report.timestamp.toISOString()
    };
  }

  private static mapPersonaPanel(analysis: FullPersonaAnalysis): PersonaPanelResult {
    const consensus = this.mapConsensus(analysis.synthesis.overallRecommendation);
    const agreementLevel = clamp(100 - analysis.synthesis.disagreements.length * 12, 20, 95);

    const insights: PersonaInsight[] = [
      this.buildPersonaInsight('Skeptic', 'oppose', [...analysis.skeptic.dealKillers, ...analysis.skeptic.hiddenRisks]),
      this.buildPersonaInsight('Advocate', 'support', [...analysis.advocate.upsidePotential, ...analysis.advocate.valueLevers]),
      this.buildPersonaInsight('Regulator', 'neutral', [...analysis.regulator.legalIssues, ...analysis.regulator.sanctionsRisks]),
      this.buildPersonaInsight('Accountant', 'neutral', [...analysis.accountant.cashflowConcerns, ...analysis.accountant.marginAnalysis]),
      this.buildPersonaInsight('Operator', 'neutral', [...analysis.operator.executionRisks, ...analysis.operator.teamGaps])
    ].filter((insight): insight is PersonaInsight => Boolean(insight));

    const blindSpots = analysis.synthesis.disagreements.map(disagreement => disagreement.topic);

    return {
      consensus,
      agreementLevel,
      insights,
      blindSpots
    };
  }

  private static buildPersonaInsight(persona: PersonaRole, stance: PersonaInsight['stance'], findings: PersonaFinding[]): PersonaInsight | null {
    if (!findings.length) return null;
    const headline = findings[0];
    const riskCallouts = findings
      .filter(finding => finding.severity === 'critical' || finding.severity === 'warning')
      .map(finding => finding.title);

    return {
      persona,
      stance,
      summary: headline.description,
      evidence: headline.evidence.slice(0, 2),
      riskCallouts
    };
  }

  private static mapCounterfactuals(analysis: CounterfactualAnalysis): CounterfactualLabResult {
    const baseline = analysis.baseCase;
    const scenarios: CounterfactualScenario[] = analysis.alternativeScenarios.map(scenario => this.buildCounterfactualScenario(baseline, scenario));
    const highest = scenarios.reduce((prev, curr) => {
      const prevScore = (prev?.opportunityCostUSD || 0) * (prev?.regretProbability || 0);
      const currScore = (curr.opportunityCostUSD || 0) * (curr.regretProbability || 0);
      return currScore > prevScore ? curr : prev;
    }, scenarios[0]);

    return {
      scenarios,
      highestRegretScenario: highest?.scenario
    };
  }

  private static buildCounterfactualScenario(baseline: Scenario, alt: Scenario): CounterfactualScenario {
    const baselineExpected = baseline.outcomes.financial.expected;
    const altExpected = alt.outcomes.financial.expected;
    const opportunityCostUSD = (baselineExpected ?? 0) - (altExpected ?? 0);
    const activationMonthsDelta = this.estimateMonths(alt.outcomes.timeline.expected) - this.estimateMonths(baseline.outcomes.timeline.expected);
    const rroiDelta = ((altExpected ?? 0) - (baselineExpected ?? 0)) / Math.max(1, Math.abs(baselineExpected || 1)) * 100;
    const spiDelta = alt.probability - baseline.probability;

    return {
      scenario: alt.name,
      baseline: baseline.description,
      opposite: alt.description,
      impactDelta: {
        spiDelta,
        rroiDelta,
        scfDeltaUSD: Math.round((altExpected ?? 0) - (baselineExpected ?? 0)),
        activationMonthsDelta
      },
      opportunityCostUSD,
      regretProbability: clamp(alt.probability + (opportunityCostUSD > 0 ? 15 : 0), 5, 95),
      recommendation: alt.keyDifferences[0] || alt.description
    };
  }

  private static buildOutcomeSnapshot(params: ReportParameters): OutcomeLearningSnapshot {
    const accuracy = OutcomeTracker.getPredictionAccuracy();
    const insights = OutcomeTracker.getApplicableInsights(params).slice(0, 3);

    const predictions: OutcomeAlignment[] = [
      {
        metric: 'Success prediction accuracy',
        predicted: clamp(accuracy.accuracyMetrics.successPredictionAccuracy, 0, 100),
        status: 'tracking'
      },
      {
        metric: 'Risk calibration',
        predicted: clamp(accuracy.accuracyMetrics.riskPredictionAccuracy, 0, 100),
        status: accuracy.calibration.overconfidentCases > accuracy.calibration.underconfidentCases ? 'pending' : 'tracking'
      },
      {
        metric: 'ROI precision',
        predicted: clamp(accuracy.accuracyMetrics.roiPredictionAccuracy, 0, 100),
        status: accuracy.accuracyMetrics.roiPredictionAccuracy >= 60 ? 'tracking' : 'pending'
      }
    ];

    const learningActions = insights.length
      ? insights.map(insight => `${insight.category}: ${insight.insight}`)
      : ['Capture more outcome data to improve calibration.', 'Close loop on in-progress decisions.'];

    return {
      reportId: params.id,
      predictions,
      learningActions,
      lastUpdated: new Date().toISOString()
    };
  }

  private static computeAdversarialConfidence(args: {
    shield: ShieldReport;
    persona: FullPersonaAnalysis;
    counterfactual: CounterfactualAnalysis;
    motivation: MotivationAnalysis;
    outcomeLearning: OutcomeLearningSnapshot;
  }): AdversarialConfidenceResult {
    const { shield, persona, counterfactual, motivation, outcomeLearning } = args;

    const shieldDepth = clamp(
      55 + shield.validationResults.length * 3 - Math.max(0, 80 - shield.overallTrust) * 0.4,
      25,
      95
    );
    const personaBreadth = clamp(
      persona.synthesis.confidenceLevel - persona.synthesis.disagreements.length * 5 + 35,
      25,
      95
    );
    const counterfactualStress = clamp(counterfactual.robustness.score, 25, 95);
    const averageRedFlag = motivation.redFlags.reduce((sum, flag) => sum + flag.probability, 0) /
      Math.max(1, motivation.redFlags.length);
    const motivationClarity = clamp(90 - averageRedFlag / 2, 25, 95);
    const outcomeLearningScore = clamp(
      outcomeLearning.predictions.reduce((sum, prediction) => sum + (prediction.predicted || 0), 0) /
        Math.max(1, outcomeLearning.predictions.length),
      30,
      95
    );

    const score = Math.round(
      shieldDepth * 0.25 +
      personaBreadth * 0.2 +
      counterfactualStress * 0.2 +
      motivationClarity * 0.2 +
      outcomeLearningScore * 0.15
    );

    const degradationFlags: string[] = [];
    if (shield.overallTrust < 60) {
      degradationFlags.push('Input shield trust below 60% - upstream data needs remediation.');
    }
    if (persona.synthesis.disagreements.length > 2) {
      degradationFlags.push('Persona debate unresolved on multiple topics.');
    }
    if (motivation.redFlags.length >= 2) {
      degradationFlags.push('Motivation analysis flagged multiple adverse incentives.');
    }
    if (counterfactual.robustness.score < 50) {
      degradationFlags.push('Counterfactual robustness score below 50/100.');
    }

    const recommendedHardening: string[] = [];
    if (shield.overallTrust < 70) {
      recommendedHardening.push('Trigger enhanced provenance review on critical fields.');
    }
    if (persona.synthesis.disagreements.length) {
      recommendedHardening.push('Schedule red-team replay on disputed persona topics.');
    }
    if (motivation.redFlags.length) {
      recommendedHardening.push('Run live reference or background calls to validate motives.');
    }
    if (!recommendedHardening.length) {
      recommendedHardening.push('Maintain current adversarial cadence; no immediate hardening required.');
    }

    return {
      score,
      band: this.toInsightBand(score),
      coverage: {
        shieldDepth: Math.round(shieldDepth),
        personaBreadth: Math.round(personaBreadth),
        counterfactualStress: Math.round(counterfactualStress),
        motivationClarity: Math.round(motivationClarity),
        outcomeLearning: Math.round(outcomeLearningScore)
      },
      degradationFlags,
      recommendedHardening,
      rationale: `Shield depth ${shieldDepth.toFixed(0)}, persona breadth ${personaBreadth.toFixed(0)}, counterfactual stress ${counterfactualStress.toFixed(0)} underpin adversarial confidence.`
    };
  }

  private static toInsightBand(score: number): AdversarialConfidenceResult['band'] {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'critical';
  }

  private static computeContradictionLevel(flag: ValidationResult['flag']): number {
    switch (flag) {
      case 'critical':
        return 95;
      case 'concern':
        return 70;
      case 'warning':
        return 45;
      default:
        return 15;
    }
  }

  private static mapConsensus(recommendation: FullPersonaAnalysis['synthesis']['overallRecommendation']): PersonaPanelResult['consensus'] {
    switch (recommendation) {
      case 'proceed':
        return 'go';
      case 'proceed-with-caution':
        return 'hold';
      default:
        return 'block';
    }
  }

  private static estimateMonths(timeline?: string): number {
    if (!timeline) return 12;
    const numeric = parseFloat(timeline.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric)) return 12;
    if (/year/i.test(timeline)) return numeric * 12;
    return numeric;
  }
}

export default AdversarialReasoningService;

