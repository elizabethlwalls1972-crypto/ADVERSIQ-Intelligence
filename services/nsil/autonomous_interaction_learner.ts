import * as fs from 'fs';
import * as path from 'path';

export type InteractionMode =
  | 'diagnostic'
  | 'direct_answer'
  | 'guided_intake'
  | 'decision_verification'
  | 'document_builder';

export interface InteractionPolicy {
  mode: InteractionMode;
  confidence: number;
  directives: string[];
  tacticalFrame: TacticalInteractionFrame;
  maxFollowUpQuestions: number;
  responseDepth: 'brief' | 'standard' | 'deep';
  reason: string;
}

export interface TacticalInteractionFrame {
  frame: string;
  hypotheses: string[];
  probes: string[];
  actions: string[];
  verificationChecks: string[];
  adaptationRule: string;
}

export interface InteractionObservation {
  requestId: string;
  timestamp: string;
  message: string;
  response?: string;
  taskType?: string;
  intent?: string;
  readinessScore?: number;
  unresolvedGapCount?: number;
  provider?: string;
  latencyMs?: number;
  nsilComponentsRun?: string[];
  context?: unknown;
}

export interface InteractionLearningState {
  version: number;
  updatedAt: string;
  observations: Array<{
    requestId: string;
    timestamp: string;
    mode: InteractionMode;
    signals: InteractionSignals;
    outcomeScore: number;
  }>;
  policyWeights: Record<InteractionMode, number>;
  learnedDirectives: Array<{
    id: string;
    text: string;
    evidence: string[];
    confidence: number;
    updatedAt: string;
  }>;
}

interface InteractionSignals {
  ambiguity: number;
  diagnosticIntent: number;
  correctionPressure: number;
  decisionComplexity: number;
  documentIntent: number;
  lowReadiness: number;
  responseMismatch: number;
  sourceExpectation: number;
}

const MODES: InteractionMode[] = [
  'diagnostic',
  'direct_answer',
  'guided_intake',
  'decision_verification',
  'document_builder',
];

const clamp = (value: number, min = 0, max = 1): number => Math.max(min, Math.min(max, value));

const now = () => new Date().toISOString();

const normalizeId = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 90);

export class AutonomousInteractionLearner {
  private statePath: string;
  private state: InteractionLearningState;

  constructor(dataDir = 'data/evolved_state') {
    fs.mkdirSync(dataDir, { recursive: true });
    this.statePath = path.join(dataDir, 'autonomous_interaction_learning.json');
    this.state = this.load();
  }

  planTurn(input: Omit<InteractionObservation, 'requestId' | 'timestamp' | 'response'>): InteractionPolicy {
    const signals = this.extractSignals(input.message, undefined, input);
    const mode = this.chooseMode(signals, input.taskType);
    const baseDirectives = this.buildDirectives(mode, signals);
    const learned = this.state.learnedDirectives
      .filter((item) => item.confidence >= 0.58)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 4)
      .map((item) => item.text);

    const confidence = clamp(
      this.state.policyWeights[mode] * 0.55 +
      (1 - signals.ambiguity) * 0.2 +
      signals.decisionComplexity * 0.15 +
      (1 - signals.responseMismatch) * 0.1,
    );

    return {
      mode,
      confidence,
      directives: [...baseDirectives, ...learned],
      tacticalFrame: this.buildTacticalFrame(mode, signals),
      maxFollowUpQuestions: mode === 'direct_answer' ? 1 : mode === 'guided_intake' ? 3 : 2,
      responseDepth: mode === 'decision_verification' || mode === 'document_builder' ? 'deep' : signals.ambiguity > 0.65 ? 'standard' : 'brief',
      reason: this.describeMode(mode, signals),
    };
  }

  promptBlock(policy: InteractionPolicy): string {
    return [
      'AUTONOMOUS INTERACTION POLICY:',
      `Mode: ${policy.mode}`,
      `Confidence: ${Math.round(policy.confidence * 100)}%`,
      `Response depth: ${policy.responseDepth}`,
      `Maximum follow-up questions: ${policy.maxFollowUpQuestions}`,
      `Reason: ${policy.reason}`,
      'Tactical frame:',
      `- Frame: ${policy.tacticalFrame.frame}`,
      ...policy.tacticalFrame.hypotheses.map((item) => `- Hypothesis: ${item}`),
      ...policy.tacticalFrame.probes.map((item) => `- Probe: ${item}`),
      ...policy.tacticalFrame.actions.map((item) => `- Action: ${item}`),
      ...policy.tacticalFrame.verificationChecks.map((item) => `- Verify: ${item}`),
      `- Adaptation: ${policy.tacticalFrame.adaptationRule}`,
      'Directives:',
      ...policy.directives.map((directive) => `- ${directive}`),
    ].join('\n');
  }

  observeTurn(observation: InteractionObservation, policy: InteractionPolicy): void {
    const signals = this.extractSignals(observation.message, observation.response, observation);
    const outcomeScore = this.scoreOutcome(signals, observation, policy);

    this.state.observations.push({
      requestId: observation.requestId,
      timestamp: observation.timestamp,
      mode: policy.mode,
      signals,
      outcomeScore,
    });
    this.state.observations = this.state.observations.slice(-250);

    const currentWeight = this.state.policyWeights[policy.mode] ?? 0.5;
    this.state.policyWeights[policy.mode] = clamp(currentWeight * 0.88 + outcomeScore * 0.12, 0.15, 0.98);

    this.evolveDirectives(observation, policy, signals, outcomeScore);
    this.state.updatedAt = now();
    this.persist();
  }

  getState(): InteractionLearningState {
    return this.state;
  }

  private chooseMode(signals: InteractionSignals, taskType?: string): InteractionMode {
    if (signals.diagnosticIntent > 0.85) return 'diagnostic';
    if (taskType === 'report_build' || signals.documentIntent > 0.85) return 'document_builder';
    if (taskType === 'info_lookup' && signals.decisionComplexity < 0.62 && signals.documentIntent < 0.4) return 'direct_answer';

    const scores: Record<InteractionMode, number> = {
      diagnostic: signals.diagnosticIntent * 1.45 + signals.correctionPressure * 0.8 + this.state.policyWeights.diagnostic * 0.25,
      direct_answer: (1 - signals.ambiguity) * 0.85 + (1 - signals.decisionComplexity) * 0.45 + this.state.policyWeights.direct_answer * 0.25,
      guided_intake: signals.ambiguity * 0.75 + signals.lowReadiness * 0.45 + this.state.policyWeights.guided_intake * 0.22,
      decision_verification: signals.decisionComplexity * 0.8 + signals.sourceExpectation * 0.4 + this.state.policyWeights.decision_verification * 0.3,
      document_builder: signals.documentIntent * 1.2 + this.state.policyWeights.document_builder * 0.3,
    };

    if (taskType === 'report_build') scores.document_builder += 0.6;
    if (taskType === 'risk_review') scores.decision_verification += 0.4;
    if (taskType === 'info_lookup') {
      scores.direct_answer += 0.65;
      scores.guided_intake -= 0.2;
    }

    return MODES.reduce((best, mode) => scores[mode] > scores[best] ? mode : best, 'guided_intake');
  }

  private extractSignals(message: string, response?: string, observation?: Partial<InteractionObservation>): InteractionSignals {
    const text = message.toLowerCase();
    const responseText = (response || '').toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    const readiness = clamp(Number(observation?.readinessScore ?? 50) / 100);
    const unresolved = clamp(Number(observation?.unresolvedGapCount ?? 0) / 6);

    const hasCountry = /\b(philippines|singapore|australia|india|indonesia|vietnam|thailand|malaysia|united states|usa|uk|brazil|chile|south africa|kenya|nigeria|ethiopia|korea|china|japan|europe|africa|asean|asia)\b/i.test(message);
    const hasDecisionVerb = /\b(should|decide|evaluate|assess|verify|stress test|risk|investment|market entry|partnership|government|deal|funding|strategy|expansion|compliance)\b/i.test(message);
    const hasDocumentVerb = /\b(report|letter|brief|proposal|dossier|case study|memo|submission|generate|write|draft|prepare)\b/i.test(message);
    const diagnosticIntent = /\b(not running|isn't running|not working|configuration|wiring|api key|bug|issue|why|doesn't read|not reading|continual harness|nsil|generic chatbot|intelligence panel|typed|waiting|route|fault)\b/i.test(message) ? 1 : 0;
    const correctionPressure = /\b(no|wrong|not what|again|still|actually|i said|it should|isn't reading|not reading|doesn't understand)\b/i.test(message) ? 0.9 : 0;
    const sourceExpectation = /\b(source|verify|evidence|latest|live|data|citation|official|cross-check|grounded)\b/i.test(message) ? 0.85 : 0;
    const ambiguity = clamp(
      (words.length < 18 ? 0.35 : 0) +
      (!hasCountry ? 0.2 : 0) +
      (!hasDecisionVerb && !hasDocumentVerb ? 0.2 : 0) +
      unresolved * 0.25 +
      (1 - readiness) * 0.25,
    );

    const responseMismatch = response
      ? clamp(
          (responseText.includes('let me know a bit more') && words.length > 18 ? 0.45 : 0) +
          (responseText.includes('no ai provider') ? 0.55 : 0) +
          (responseText.includes('[object object]') ? 0.85 : 0) +
          (response.length > 4500 && words.length < 20 ? 0.35 : 0),
        )
      : 0;

    return {
      ambiguity,
      diagnosticIntent,
      correctionPressure,
      decisionComplexity: clamp((hasDecisionVerb ? 0.45 : 0) + (sourceExpectation ? 0.2 : 0) + Math.min(words.length / 90, 0.35)),
      documentIntent: hasDocumentVerb ? 0.95 : 0,
      lowReadiness: 1 - readiness,
      responseMismatch,
      sourceExpectation,
    };
  }

  private buildDirectives(mode: InteractionMode, signals: InteractionSignals): string[] {
    const directives: string[] = [];

    if (mode === 'diagnostic') {
      directives.push('Treat the user message as a system diagnostic request; identify likely wiring, provider, route, or state-flow causes before giving product advice.');
      directives.push('State whether the issue is likely configuration, API provider availability, or interaction-routing behavior, then give concrete next checks.');
    }

    if (mode === 'guided_intake') {
      directives.push('Do not force a rigid form; first paraphrase the situation you inferred, then ask only the missing questions needed to run verification.');
      directives.push('Convert vague input into a provisional case hypothesis so the user feels read before being asked for more data.');
    }

    if (mode === 'decision_verification') {
      directives.push('Run the answer as decision verification: extract the decision, verify assumptions, name contradictions, stress-test risks, and give the next verification step.');
      directives.push('Do not hide behind generic advice; tie each recommendation to the user-entered facts and unresolved evidence gaps.');
    }

    if (mode === 'document_builder') {
      directives.push('If the user asks for a document, infer the document purpose and propose the minimum structure needed before generating long-form content.');
    }

    if (mode === 'direct_answer') {
      directives.push('Answer the direct question first in plain language, then ask at most one useful follow-up question.');
    }

    if (signals.sourceExpectation > 0.5) {
      directives.push('When source confidence is limited, say what was verified, what remains unverified, and what live source would materially improve confidence.');
    }

    return directives;
  }

  private buildTacticalFrame(mode: InteractionMode, signals: InteractionSignals): TacticalInteractionFrame {
    if (mode === 'diagnostic') {
      return {
        frame: 'Treat the conversation as an operational failure investigation, not a normal advisory request.',
        hypotheses: [
          'The UI may be routing the user text to the wrong backend endpoint.',
          'The backend may be available but bypassing the NSIL/continual harness path.',
          'The response may be falling back to generic copy after a provider or context failure.',
        ],
        probes: [
          'Check the exact user-entered message against the backend payload.',
          'Check route, provider availability, NSIL components run, and interaction policy mode.',
        ],
        actions: [
          'Give the user a concrete fault tree before giving fixes.',
          'Name the highest-probability cause and the next verification command or UI action.',
        ],
        verificationChecks: [
          'The answer references the user-entered facts.',
          'The answer distinguishes route wiring, provider keys, and NSIL harness state.',
        ],
        adaptationRule: 'If the next user says the OS is still not reading input, increase diagnostic priority and suppress generic fallback language.',
      };
    }

    if (mode === 'guided_intake') {
      return {
        frame: 'Build a provisional case model from partial user language before asking for missing data.',
        hypotheses: [
          'The user may know the situation but not the system fields.',
          'The first useful response is a case hypothesis, not a form.',
        ],
        probes: [
          'Ask only for the missing fact that changes the decision path.',
          'Infer sector, geography, decision owner, and stakes from plain language.',
        ],
        actions: [
          'Reflect the inferred situation in one paragraph.',
          'Ask the highest-value follow-up questions only.',
        ],
        verificationChecks: [
          'The user can see their input was understood.',
          'The next step can activate verification layers.',
        ],
        adaptationRule: 'If the user supplies more context, reduce intake questions and shift toward decision verification.',
      };
    }

    if (mode === 'decision_verification') {
      return {
        frame: 'Act like a tactical analyst converting a live decision into verified moves.',
        hypotheses: [
          'The core risk is likely hidden in assumptions, counterparties, timing, or evidence quality.',
          'A useful answer must narrow the decision, not expand generic options.',
        ],
        probes: [
          'Identify what would make the decision wrong.',
          'Find the contradiction between desired outcome, constraints, and evidence.',
        ],
        actions: [
          'Extract decision, assumptions, risks, options, and recommended path.',
          'Give a verification checklist that can be acted on immediately.',
        ],
        verificationChecks: [
          'Every recommendation ties to a user fact or stated assumption.',
          'Confidence is downgraded when evidence is missing.',
        ],
        adaptationRule: 'If contradictions remain unresolved, continue adversarial verification before generating documents.',
      };
    }

    if (mode === 'document_builder') {
      return {
        frame: 'Convert the user intent into a usable artifact while preserving evidence traceability.',
        hypotheses: [
          'The document type may be less important than the decision audience and approval path.',
          'A shorter decision-ready structure may beat a long generic report.',
        ],
        probes: [
          'Identify audience, decision, approval gate, evidence baseline, and required format.',
        ],
        actions: [
          'Offer the minimum viable structure before drafting.',
          'Label assumptions and evidence gaps inside the document plan.',
        ],
        verificationChecks: [
          'The artifact has a clear audience and decision purpose.',
          'Generated sections do not invent missing evidence.',
        ],
        adaptationRule: 'If the user asks for speed, generate a concise artifact first and queue deeper verification afterward.',
      };
    }

    return {
      frame: 'Answer directly while quietly upgrading the case model in the background.',
      hypotheses: [
        'The user needs useful movement more than visible process.',
      ],
      probes: [
        signals.sourceExpectation > 0.5 ? 'Check whether the answer needs verified source boundaries.' : 'Check whether one follow-up question would materially improve the answer.',
      ],
      actions: [
        'Answer first, then ask at most one targeted question.',
      ],
      verificationChecks: [
        'The response is direct and does not over-structure a simple request.',
      ],
      adaptationRule: 'If the user adds complexity, promote the next turn to guided intake or decision verification.',
    };
  }

  private describeMode(mode: InteractionMode, signals: InteractionSignals): string {
    if (mode === 'diagnostic') return 'The user is asking why the OS behavior is failing or miswired.';
    if (mode === 'guided_intake') return `Input is underspecified or low-readiness (ambiguity ${signals.ambiguity.toFixed(2)}).`;
    if (mode === 'decision_verification') return 'The message contains a substantive decision/risk verification request.';
    if (mode === 'document_builder') return 'The message asks for a generated artifact or report path.';
    return 'The message can be answered directly without a heavy intake loop.';
  }

  private scoreOutcome(signals: InteractionSignals, observation: InteractionObservation, policy: InteractionPolicy): number {
    const latencyPenalty = observation.latencyMs && observation.latencyMs > 30000 ? 0.08 : 0;
    const mismatchPenalty = signals.responseMismatch * 0.35;
    const unresolvedPenalty = clamp(Number(observation.unresolvedGapCount ?? 0) / 10) * 0.12;
    const modeFitBonus =
      (signals.diagnosticIntent > 0.7 && policy.mode === 'diagnostic') ||
      (signals.documentIntent > 0.7 && policy.mode === 'document_builder') ||
      (signals.decisionComplexity > 0.5 && policy.mode === 'decision_verification')
        ? 0.12
        : 0;
    const responsePresent = observation.response && observation.response.trim().length > 80 ? 0.16 : -0.1;
    return clamp(0.62 + modeFitBonus + responsePresent - latencyPenalty - mismatchPenalty - unresolvedPenalty);
  }

  private evolveDirectives(
    observation: InteractionObservation,
    policy: InteractionPolicy,
    signals: InteractionSignals,
    outcomeScore: number,
  ): void {
    const candidates: string[] = [];

    if (signals.diagnosticIntent > 0.7 && outcomeScore < 0.78) {
      candidates.push('For diagnostic turns, explicitly trace UI route, backend route, provider availability, and harness state before suggesting UX changes.');
    }
    if (signals.ambiguity > 0.65 && policy.mode !== 'guided_intake') {
      candidates.push('When ambiguity is high, respond with an inferred case hypothesis before asking clarifying questions.');
    }
    if (signals.responseMismatch > 0.35) {
      candidates.push('Avoid generic fallback language when the user supplied substantive context; use the submitted text as the primary evidence source.');
    }
    if (signals.sourceExpectation > 0.6) {
      candidates.push('Separate verified facts from inferred analysis whenever the user asks for live, sourced, or verification-heavy output.');
    }

    for (const text of candidates) {
      const id = normalizeId(text);
      const existing = this.state.learnedDirectives.find((item) => item.id === id);
      if (existing) {
        existing.evidence = [...new Set([...existing.evidence, observation.requestId])].slice(-20);
        existing.confidence = clamp(existing.confidence + 0.04);
        existing.updatedAt = now();
      } else {
        this.state.learnedDirectives.push({
          id,
          text,
          evidence: [observation.requestId],
          confidence: 0.58,
          updatedAt: now(),
        });
      }
    }

    this.state.learnedDirectives = this.state.learnedDirectives
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 40);
  }

  private load(): InteractionLearningState {
    if (fs.existsSync(this.statePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf8')) as InteractionLearningState;
      } catch {
        // Use a clean state if persistence is malformed.
      }
    }

    return {
      version: 1,
      updatedAt: now(),
      observations: [],
      policyWeights: {
        diagnostic: 0.62,
        direct_answer: 0.66,
        guided_intake: 0.64,
        decision_verification: 0.72,
        document_builder: 0.68,
      },
      learnedDirectives: [],
    };
  }

  private persist(): void {
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2), 'utf8');
  }
}

export const autonomousInteractionLearner = new AutonomousInteractionLearner();
