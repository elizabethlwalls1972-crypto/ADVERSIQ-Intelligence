import type { InteractionPolicy } from './autonomous_interaction_learner';

export interface ResearchQuestion {
  id: string;
  query: string;
  purpose: string;
  expectedUse: 'verify_fact' | 'find_risk' | 'map_context' | 'identify_options' | 'test_assumption';
}

export interface ResearchCognitionPlan {
  frame: string;
  userProblem: string;
  questions: ResearchQuestion[];
  reasoningRules: string[];
}

export interface ResearchEvidenceBundle {
  query: string;
  sources: string[];
  content: string;
}

const clean = (value: string): string => value.replace(/\s+/g, ' ').trim();

const firstSentence = (value: string): string => {
  const text = clean(value);
  const sentence = text.match(/^.{20,220}?(?:[.!?](?:\s|$)|$)/)?.[0] ?? text.slice(0, 220);
  return clean(sentence);
};

const extractCountry = (message: string): string => {
  const match = message.match(/\b(Philippines|Singapore|Australia|India|Indonesia|Vietnam|Thailand|Malaysia|United States|USA|Brazil|Chile|South Africa|Kenya|Nigeria|Ethiopia|China|Japan|South Korea|UAE|Saudi Arabia|Mexico|Canada|United Kingdom|UK)\b/i);
  return match?.[0] ?? '';
};

const extractSector = (message: string): string => {
  const match = message.match(/\b(healthcare|energy|infrastructure|fintech|financial services|agriculture|manufacturing|education|logistics|real estate|climate|technology|software|tourism|mining|water|housing|transport|ports?)\b/i);
  return match?.[0] ?? '';
};

const extractCity = (message: string): string => {
  const match = message.match(/\b(Pagad(?:i|a)an(?:\s+City)?|Cebu(?:\s+City)?|Davao(?:\s+City)?|Manila|Iloilo(?:\s+City)?|Cagayan de Oro|General Santos)\b/i);
  return match?.[0] ?? '';
};

const dedupeQuestions = (questions: ResearchQuestion[]): ResearchQuestion[] => {
  const seen = new Set<string>();
  const result: ResearchQuestion[] = [];
  for (const question of questions) {
    const key = question.query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(question);
  }
  return result.slice(0, 3);
};

export class AutonomousResearchCognition {
  plan(message: string, policy: InteractionPolicy, context?: unknown): ResearchCognitionPlan {
    const country = extractCountry(message);
    const city = extractCity(message);
    const sector = extractSector(message);
    const problem = firstSentence(message);
    const contextText = context ? JSON.stringify(context).slice(0, 500) : '';
    const anchor = [country, sector].filter(Boolean).join(' ') || problem;

    const questions: ResearchQuestion[] = [
      {
        id: 'primary_problem_scan',
        query: clean(`${anchor} ${problem}`),
        purpose: 'Find live context directly related to the user-entered problem.',
        expectedUse: 'map_context',
      },
    ];

    if (policy.mode === 'diagnostic') {
      questions.push({
        id: 'system_failure_pattern',
        query: clean(`agentic AI route wiring live retrieval fallback failure ${problem}`),
        purpose: 'Check whether the failure is route, provider, live retrieval, or harness-state behavior.',
        expectedUse: 'find_risk',
      });
    }

    if (policy.mode === 'decision_verification') {
      questions.push({
        id: 'assumption_stress_test',
        query: clean(`${anchor} risks regulation funding implementation evidence`),
        purpose: 'Find outside signals that stress-test the decision assumptions.',
        expectedUse: 'test_assumption',
      });
    }

    if (/\b(government|lgu|mayor|procurement|public[- ]private|ppp|public sector|city hall)\b/i.test(message)) {
      questions.push({
        id: 'public_counterparty_due_diligence',
        query: clean(`${city || anchor} ${country} government procurement counterpart authority anti corruption security business risk`),
        purpose: 'Verify public-counterparty authority, procurement integrity, anti-corruption exposure, and local security signals.',
        expectedUse: 'verify_fact',
      });
    }

    if (policy.mode === 'document_builder') {
      questions.push({
        id: 'audience_evidence',
        query: clean(`${anchor} official policy investment program stakeholder evidence`),
        purpose: 'Find evidence useful for a decision-ready document or letter.',
        expectedUse: 'verify_fact',
      });
    }

    if (policy.mode === 'guided_intake') {
      questions.push({
        id: 'case_shape',
        query: clean(`${anchor} market context key stakeholders risks`),
        purpose: 'Infer the missing case shape without forcing a rigid intake form.',
        expectedUse: 'identify_options',
      });
    }

    if (policy.mode === 'direct_answer') {
      questions.push({
        id: 'direct_answer_check',
        query: clean(`${anchor} latest facts official source`),
        purpose: 'Bound the direct answer with one current verification check.',
        expectedUse: 'verify_fact',
      });
    }

    return {
      frame: `Research is in service of solving the user's problem, not summarising websites. Interaction mode: ${policy.mode}.`,
      userProblem: problem,
      questions: dedupeQuestions(questions),
      reasoningRules: [
        'Do not quote or paraphrase sources as the answer; convert them into decision-relevant implications.',
        'Separate verified facts, inferred implications, and unresolved gaps.',
        'Prefer official/economic/current sources for material claims.',
        'If sources are weak, downgrade confidence and state the missing verification.',
        'Use the user-entered problem as the controlling objective; sources are evidence, not the agenda.',
      ],
    };
  }

  buildEvidenceReasoningBlock(plan: ResearchCognitionPlan, bundles: ResearchEvidenceBundle[]): string {
    const lines: string[] = [
      'AUTONOMOUS RESEARCH COGNITION:',
      `Frame: ${plan.frame}`,
      `User problem: ${plan.userProblem}`,
      'Research questions:',
      ...plan.questions.map((question) => `- ${question.id}: ${question.query} | purpose=${question.purpose} | use=${question.expectedUse}`),
      'Reasoning rules:',
      ...plan.reasoningRules.map((rule) => `- ${rule}`),
    ];

    const usefulBundles = bundles.filter((bundle) => bundle.content.trim() || bundle.sources.length);
    if (!usefulBundles.length) {
      lines.push('Live evidence status: no useful external evidence returned; solve from internal NSIL reasoning and clearly mark unverified claims.');
      return lines.join('\n');
    }

    lines.push('Live evidence digests:');
    usefulBundles.slice(0, 3).forEach((bundle, index) => {
      const content = bundle.content
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 18)
        .join('\n')
        .slice(0, 2400);
      lines.push(`Evidence bundle ${index + 1}: ${bundle.query}`);
      if (bundle.sources.length) lines.push(`Sources: ${bundle.sources.slice(0, 8).join('; ')}`);
      if (content) lines.push(content);
    });

    lines.push('Required synthesis behavior: turn the evidence into a fault tree, decision tree, risk register, or action sequence as appropriate. Do not produce a source summary unless the user explicitly asks for one.');
    return lines.join('\n');
  }
}

export const autonomousResearchCognition = new AutonomousResearchCognition();
