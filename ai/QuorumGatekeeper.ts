/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — QUORUM GATEKEEPER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The Infinite Bench: Dynamically analyzes incoming mandates and spawns
 * the exact domain experts required, replacing the hardcoded 5-agent limit.
 *
 * Instead of always using the same 5 personas (Skeptic, Advocate, Regulator,
 * Accountant, Operator), the Gatekeeper reads the strategic mandate and
 * drafts specialists from an infinite back-bench — e.g., Sovereign Geologist,
 * Logistics Cartographer, Renewable Energy Economist.
 *
 * Security: CONFIDENTIAL / FOR STRATEGIC DEPLOYMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { generateLLMJSON } from '../services/llmGateway';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DynamicPersona {
  roleName: string;
  systemPrompt: string;
  adversarialStance: 'ATTACK' | 'DEFEND' | 'SYNTHESIZE';
}

// ─── Quorum Gatekeeper ──────────────────────────────────────────────────────

export class QuorumGatekeeper {
  /**
   * Analyze a strategic mandate and spawn the exact specialist personas required.
   * Uses LLM to dynamically determine the optimal quorum composition.
   *
   * @param mandate - The strategic directive to analyze
   * @param requiredCount - Number of personas to spawn (default: 5)
   * @returns Array of dynamically generated persona definitions
   */
  public async assembleQuorum(
    mandate: string,
    requiredCount: number = 5
  ): Promise<DynamicPersona[]> {
    console.log(`[GATEKEEPER] Analyzing mandate to spawn dynamic quorum of ${requiredCount}...`);

    const gatekeeperPrompt = `
You are the ADVERSIQ Gatekeeper. The user has submitted the following strategic mandate:

"${mandate}"

Identify the ${requiredCount} specific expert personas required to stress-test this mandate.
Each persona must have a unique specialization relevant to the mandate's domain.

RULES:
- At least one persona MUST have adversarialStance "ATTACK" (the critic/skeptic)
- At least one persona MUST have adversarialStance "DEFEND" (the advocate)
- At least one persona MUST have adversarialStance "SYNTHESIZE" (the integrator)
- Each roleName must be specific (e.g., "Sovereign Geologist" not just "Expert")
- Each systemPrompt must define the persona's expertise and analytical focus

Return ONLY a JSON array of objects with keys: roleName, systemPrompt, adversarialStance.
`;

    try {
      const quorum = await generateLLMJSON<DynamicPersona[]>(gatekeeperPrompt, {
        temperature: 0.6,
        maxTokens: 3000,
      });

      // Validate and sanitize
      const validated = (Array.isArray(quorum) ? quorum : []).slice(0, requiredCount).map(p => ({
        roleName: String(p.roleName || 'Unnamed Expert').slice(0, 100),
        systemPrompt: String(p.systemPrompt || 'Analyze the mandate from your expertise.').slice(0, 500),
        adversarialStance: (['ATTACK', 'DEFEND', 'SYNTHESIZE'] as const).includes(p.adversarialStance)
          ? p.adversarialStance
          : 'SYNTHESIZE' as const,
      }));

      console.log(`[GATEKEEPER] Quorum Assembled: ${validated.map(p => p.roleName).join(', ')}`);
      return validated;
    } catch (err) {
      console.warn('[GATEKEEPER] LLM quorum generation failed, using default quorum:', err instanceof Error ? err.message : err);
      return this.getDefaultQuorum();
    }
  }

  /**
   * Fallback: return the standard 5-persona quorum if LLM is unavailable.
   */
  private getDefaultQuorum(): DynamicPersona[] {
    return [
      {
        roleName: 'The Skeptic',
        systemPrompt: 'Challenge every assumption. Find what could go wrong. Identify hidden risks and unsupported claims.',
        adversarialStance: 'ATTACK',
      },
      {
        roleName: 'The Advocate',
        systemPrompt: 'Build the strongest possible case for the opportunity. Identify advantages and strategic upside.',
        adversarialStance: 'DEFEND',
      },
      {
        roleName: 'The Regulator',
        systemPrompt: 'Evaluate compliance, legal frameworks, regulatory risk, and institutional requirements.',
        adversarialStance: 'ATTACK',
      },
      {
        roleName: 'The Accountant',
        systemPrompt: 'Stress-test the financial model. Analyze returns, cash flows, capital requirements, and financial risks.',
        adversarialStance: 'ATTACK',
      },
      {
        roleName: 'The Operator',
        systemPrompt: 'Assess operational feasibility. Evaluate supply chains, workforce, infrastructure, and execution risks.',
        adversarialStance: 'SYNTHESIZE',
      },
    ];
  }
}

export default QuorumGatekeeper;
