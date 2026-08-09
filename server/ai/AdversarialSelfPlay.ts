import { QuorumGatekeeper, DynamicPersona } from './QuorumGatekeeper.js';
import { generateLLMPrompt } from '../services/llmGateway.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * AdversarialSelfPlay: Autonomous background scenario generation
 * Runs 24/7 (or on interval), generating complex economic strategies,
 * attacking them with the quorum, and syncing learned patterns to shared memory.
 */
export class AdversarialSelfPlay {
  private isRunning: boolean = false;
  private generationCount: number = 0;
  private readonly SCENARIO_ARCHIVE = path.resolve(process.cwd(), 'data', 'self_play_scenarios.jsonl');

  public async initiateBackgroundLoop(intervalMs: number = 300000): Promise<void> {
    this.isRunning = true;
    console.log(`[SELF-PLAY] Autonomous Foundry Online. Generating scenarios every ${intervalMs}ms`);

    const runCycle = async () => {
      if (!this.isRunning) return;

      try {
        await this.generateAndDebateScenario();
      } catch (err) {
        console.error(`[SELF-PLAY ERROR]`, err);
      }

      setTimeout(runCycle, intervalMs);
    };

    // Start cycle in background
    setTimeout(runCycle, intervalMs);
  }

  public async generateAndDebateScenario(): Promise<{
    scenario: string;
    debate: any;
    frictionPoints: number;
  }> {
    this.generationCount++;
    console.log(`[SELF-PLAY #${this.generationCount}] Generating theoretical scenario...`);

    const scenario = await this.generateComplexScenario();
    console.log(`[SELF-PLAY] Scenario generated. Assembling quorum...`);

    const gatekeeper = new QuorumGatekeeper();
    const quorum = await gatekeeper.assembleQuorum(scenario, 5);

    console.log(`[SELF-PLAY] Quorum assembled: ${quorum.map(p => p.roleName).join(', ')}`);
    console.log(`[SELF-PLAY] Simulating adversarial debate...`);

    const debateResult = await this.simulateQuorumDebate(scenario, quorum);

    this.archiveScenario({
      id: this.generationCount,
      timestamp: new Date().toISOString(),
      scenario,
      quorum: quorum.map(p => p.roleName),
      debateResult,
      frictionDetected: debateResult.frictionPoints > 0
    });

    console.log(`[SELF-PLAY] Complete. Friction points identified: ${debateResult.frictionPoints}`);

    return {
      scenario,
      debate: debateResult,
      frictionPoints: debateResult.frictionPoints
    };
  }

  private async generateComplexScenario(): Promise<string> {
    const promptSeed = `
You are the ADVERSIQ Foundry. Generate a HIGHLY COMPLEX, realistic economic scenario involving:
1. Cross-border capital deployment
2. Regulatory friction
3. Geopolitical risk factors
4. Resource extraction or infrastructure challenges
5. 3+ years of timeline

The scenario should be intricate enough to challenge an expert quorum.
Return ONLY the scenario text (1-2 paragraphs), no formatting.
`;

    return generateLLMPrompt(promptSeed);
  }

  private async simulateQuorumDebate(
    scenario: string,
    quorum: DynamicPersona[]
  ): Promise<{
    positions: Record<string, string>;
    frictionPoints: number;
    consensus: string;
  }> {
    const positions: Record<string, string> = {};
    let frictionCount = 0;

    for (const persona of quorum) {
      const debatePrompt = `
You are ${persona.roleName}. Your bias is ${persona.bias > 0 ? 'preservationist' : 'transformative'}.
Your stance: ${persona.adversarialStance}

Scenario:
${scenario}

Expertise: ${persona.expertise.join(', ')}
System Prompt: ${persona.systemPrompt}

What is your position on this scenario? Be specific and highlight risks or opportunities.
Respond in 2-3 sentences as ${persona.roleName}.
`;

      const position = await generateLLMPrompt(debatePrompt);
      positions[persona.roleName] = position;
      frictionCount += persona.adversarialStance === 'ATTACK' ? 1 : 0;
    }

    const consensusPrompt = `
Given these positions:
${Object.entries(positions).map(([name, pos]) => `${name}: ${pos}`).join('\n')}

Synthesize a balanced recommendation that acknowledges all perspectives.
`;

    const consensus = await generateLLMPrompt(consensusPrompt);

    return {
      positions,
      frictionPoints: frictionCount,
      consensus
    };
  }

  private archiveScenario(data: any): void {
    const dir = path.dirname(this.SCENARIO_ARCHIVE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFileSync(this.SCENARIO_ARCHIVE, JSON.stringify(data) + '\n', 'utf-8');
  }

  public stopBackgroundLoop(): void {
    this.isRunning = false;
    console.log(`[SELF-PLAY] Background foundry halted.`);
  }

  public getGenerationCount(): number {
    return this.generationCount;
  }
}
