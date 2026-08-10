/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — ADVERSARIAL SELF-PLAY ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Runs 24/7 in the background, autonomously generating complex economic
 * strategies, attacking them via the dynamic quorum, and syncing acquired
 * intelligence to the Morphic Field.
 *
 * This is the engine that makes ADVERSIQ continuously smarter even when
 * no human is using it — discovering strategic friction points, mapping
 * failure modes, and strengthening the collective intelligence network.
 *
 * Security: CONFIDENTIAL / FOR STRATEGIC DEPLOYMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { QuorumGatekeeper, type DynamicPersona } from './QuorumGatekeeper';
import { MorphicFieldEngine } from '../core/MorphicFieldEngine';
import { generateLLMPrompt } from '../services/llmGateway';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DebateResult {
  identifiedFrictionPoints: number;
  frictionDetails: string[];
  consensusReached: boolean;
  consensusLevel: number;
  vector: number[];
  duration: number;
}

interface SelfPlayStats {
  totalRounds: number;
  totalFrictionPoints: number;
  lastRunTimestamp: string | null;
  isRunning: boolean;
}

// ─── Adversarial Self-Play Engine ───────────────────────────────────────────

export class AdversarialSelfPlay {
  private isRunning: boolean = false;
  private stats: SelfPlayStats = {
    totalRounds: 0,
    totalFrictionPoints: 0,
    lastRunTimestamp: null,
    isRunning: false,
  };

  private readonly CYCLE_INTERVAL_MS = 300_000; // 5 minutes between cycles
  private readonly MAX_CYCLES_PER_SESSION = 100;

  /**
   * Start the infinite self-play loop.
   * Runs continuously until stop() is called.
   */
  public async initiateInfiniteLoop(): Promise<void> {
    if (this.isRunning) {
      console.warn('[SELF-PLAY] Already running. Ignoring duplicate start.');
      return;
    }

    this.isRunning = true;
    this.stats.isRunning = true;
    console.log(`[SELF-PLAY] Autonomous Foundry Online. Initiating continuous generation.`);

    let cycleCount = 0;

    while (this.isRunning && cycleCount < this.MAX_CYCLES_PER_SESSION) {
      try {
        // Generate a complex economic strategy scenario
        const scenario = await generateLLMPrompt(
          'Generate a highly complex, theoretical cross-border investment strategy involving at least 3 countries, multiple regulatory frameworks, and at least one emerging technology sector. Include specific financial parameters, geopolitical risks, and stakeholder dynamics. Make it realistic and challenging.',
          { temperature: 0.8, maxTokens: 2000 }
        );

        // Assemble a dynamic quorum to stress-test it
        const gatekeeper = new QuorumGatekeeper();
        const quorum = await gatekeeper.assembleQuorum(scenario, 5);

        console.log(`[SELF-PLAY] Round ${cycleCount + 1}: Executing background debate...`);

        // Run the adversarial debate
        const debateResult = await this.simulateDebate(quorum, scenario);

        // Sync friction points to the Morphic Field
        if (debateResult.identifiedFrictionPoints > 0) {
          try {
            const morphicEngine = new MorphicFieldEngine();
            await morphicEngine.syncWithMorphicField(
              ['SPI', 'SEAM', 'RNI', 'CRI'],
              debateResult.consensusLevel,
              debateResult.vector
            );
            console.log(
              `[SELF-PLAY] Round ${cycleCount + 1}: ${debateResult.identifiedFrictionPoints} friction points mapped. Morphic Field updated.`
            );
          } catch (syncErr) {
            console.warn('[SELF-PLAY] Morphic Field sync failed (non-blocking):', syncErr instanceof Error ? syncErr.message : syncErr);
          }
        }

        // Update stats
        this.stats.totalRounds++;
        this.stats.totalFrictionPoints += debateResult.identifiedFrictionPoints;
        this.stats.lastRunTimestamp = new Date().toISOString();
        cycleCount++;

      } catch (err) {
        console.warn(`[SELF-PLAY] Cycle ${cycleCount + 1} failed (non-fatal):`, err instanceof Error ? err.message : err);
      }

      // Wait before next cycle
      if (this.isRunning) {
        await new Promise(resolve => setTimeout(resolve, this.CYCLE_INTERVAL_MS));
      }
    }

    console.log(`[SELF-PLAY] Session ended after ${cycleCount} cycles.`);
    this.isRunning = false;
    this.stats.isRunning = false;
  }

  /**
   * Stop the self-play loop gracefully.
   */
  public stop(): void {
    console.log('[SELF-PLAY] Shutdown requested. Will stop after current cycle.');
    this.isRunning = false;
    this.stats.isRunning = false;
  }

  /**
   * Get current self-play statistics.
   */
  public getStats(): SelfPlayStats {
    return { ...this.stats };
  }

  /**
   * Simulate a multi-persona adversarial debate on a given scenario.
   */
  private async simulateDebate(
    quorum: DynamicPersona[],
    scenario: string
  ): Promise<DebateResult> {
    const startTime = Date.now();
    const frictionDetails: string[] = [];
    let totalConfidence = 0;

    for (const persona of quorum) {
      try {
        const analysis = await generateLLMPrompt(
          `You are ${persona.roleName}. Your stance is ${persona.adversarialStance}.\n\nSystem: ${persona.systemPrompt}\n\nAnalyze this strategy and identify specific friction points, risks, or opportunities:\n\n${scenario.slice(0, 2000)}\n\nRespond with 2-3 specific, actionable points.`,
          { temperature: 0.5, maxTokens: 500, timeoutMs: 15000 }
        );

        if (persona.adversarialStance === 'ATTACK') {
          frictionDetails.push(`[${persona.roleName}]: ${analysis.slice(0, 300)}`);
        }
        totalConfidence += 0.2;
      } catch {
        console.warn(`[SELF-PLAY] Persona "${persona.roleName}" failed to respond.`);
      }
    }

    const consensusLevel = Math.min(totalConfidence, 1);

    // Generate a simple vector representation of the debate outcome
    const vector = [
      frictionDetails.length / quorum.length,           // friction density
      consensusLevel,                                     // agreement level
      Math.random() * 0.3 + 0.1,                         // noise factor
    ];

    return {
      identifiedFrictionPoints: frictionDetails.length,
      frictionDetails,
      consensusReached: consensusLevel > 0.75,
      consensusLevel,
      vector,
      duration: Date.now() - startTime,
    };
  }
}

export default AdversarialSelfPlay;
