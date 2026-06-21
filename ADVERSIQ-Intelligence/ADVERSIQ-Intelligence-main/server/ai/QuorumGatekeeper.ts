import { generateLLMPrompt } from '../services/llmGateway.js';

export interface DynamicPersona {
  roleName: string;
  systemPrompt: string;
  adversarialStance: 'ATTACK' | 'DEFEND' | 'SYNTHESIZE';
  expertise: string[];
  bias: number; // -1 to 1, where -1 is destructive, 1 is preservationist
}

/**
 * QuorumGatekeeper: Dynamically assembles domain experts
 * Instead of hardcoded 5 agents, this generates the exact personas needed
 * for the strategic mandate at hand.
 */
export class QuorumGatekeeper {
  private memoizedQuorums: Map<string, DynamicPersona[]> = new Map();

  public async assembleQuorum(mandate: string, requiredCount: number = 5): Promise<DynamicPersona[]> {
    const mandateHash = this.hashMemoize(mandate);
    
    if (this.memoizedQuorums.has(mandateHash)) {
      console.log(`[GATEKEEPER] Quorum retrieved from cache`);
      return this.memoizedQuorums.get(mandateHash)!;
    }

    console.log(`[GATEKEEPER] Analyzing mandate to spawn dynamic quorum (${requiredCount} personas)...`);
    
    const gatekeeperPrompt = `
You are the ADVERSIQ Quorum Gatekeeper. The user has submitted the following strategic mandate:

"${mandate}"

Your task: Identify the ${requiredCount} MOST CRITICAL expert personas required to stress-test and advance this mandate.

For each persona, generate:
1. roleName (unique identifier)
2. systemPrompt (their core perspective and constraints)
3. adversarialStance (ATTACK = challenges assumptions, DEFEND = supports resilience, SYNTHESIZE = finds middle ground)
4. expertise (array of 3-5 domains they specialize in)
5. bias (number -1 to 1: -1 = radical transformation, 0 = balanced, 1 = preservation)

Return ONLY a valid JSON array with no markdown formatting:
[
  {
    "roleName": "string",
    "systemPrompt": "string",
    "adversarialStance": "ATTACK" | "DEFEND" | "SYNTHESIZE",
    "expertise": ["string"],
    "bias": -1 to 1
  }
]
`;

    try {
      const response = await generateLLMPrompt(gatekeeperPrompt);
      const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const quorum: DynamicPersona[] = JSON.parse(cleanedResponse);
      
      this.memoizedQuorums.set(mandateHash, quorum);
      console.log(`[GATEKEEPER] Quorum Assembled: ${quorum.map(p => p.roleName).join(', ')}`);
      return quorum;
    } catch (err) {
      console.error(`[GATEKEEPER ERROR]`, err);
      // Fallback to default personas
      return this.getDefaultQuorum(mandate);
    }
  }

  private getDefaultQuorum(mandate: string): DynamicPersona[] {
    return [
      {
        roleName: 'The Skeptic',
        systemPrompt: 'Challenge every assumption. Identify hidden risks and structural fragility.',
        adversarialStance: 'ATTACK',
        expertise: ['risk-analysis', 'game-theory', 'failure-modes'],
        bias: -0.7
      },
      {
        roleName: 'The Accountant',
        systemPrompt: 'Focus on capital flows, cost-benefit, and financial sustainability.',
        adversarialStance: 'DEFEND',
        expertise: ['finance', 'accounting', 'valuation'],
        bias: 0.3
      },
      {
        roleName: 'The Architect',
        systemPrompt: 'Design resilient systems that scale and adapt over time.',
        adversarialStance: 'SYNTHESIZE',
        expertise: ['systems-design', 'governance', 'scalability'],
        bias: 0.1
      },
      {
        roleName: 'The Pragmatist',
        systemPrompt: 'Find what actually works in real conditions, not theory.',
        adversarialStance: 'ATTACK',
        expertise: ['implementation', 'operations', 'logistics'],
        bias: -0.2
      },
      {
        roleName: 'The Visionary',
        systemPrompt: 'Imagine transformative outcomes and breakthrough opportunities.',
        adversarialStance: 'DEFEND',
        expertise: ['innovation', 'strategic-vision', 'disruptive-potential'],
        bias: 0.8
      }
    ];
  }

  private hashMemoize(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
}
