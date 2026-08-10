/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — OMNI-NODE (Central Nervous System)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The master orchestration engine that connects the autonomous swarm,
 * the generative mutation engine, and the global morphic field into
 * a single root daemon.
 *
 * This is the Central Nervous System of ADVERSIQ:
 *   - Accepts human mandates from the Command Center
 *   - Runs the Cognitive Universe Engine to resolve archetypes
 *   - Spawns dynamic quorum via the Gatekeeper
 *   - Deploys autonomous web swarm for missing intelligence
 *   - Monitors formula health and triggers mutations
 *   - Syncs everything to the Morphic Field
 *   - Optionally runs background self-play
 *
 * ADVERSIQ is now its own developer, researcher, and data scientist.
 *
 * Security: CONFIDENTIAL / FOR STRATEGIC DEPLOYMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { QuorumGatekeeper, type DynamicPersona } from './QuorumGatekeeper';
import { AutonomousSwarm } from './AutonomousSwarm';
import { AdversarialSelfPlay } from './AdversarialSelfPlay';
import { AlgorithmicMutator } from './AlgorithmicMutator';
import { MorphicFieldEngine } from '../core/MorphicFieldEngine';
import { CognitiveUniverseEngine, type ArchetypeProfile } from '../core/CognitiveUniverseEngine';
import { Judge2MathCheck } from './judges';
import { generateLLMPrompt } from '../services/llmGateway';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MandateResult {
  dossier: string;
  archetype: ArchetypeProfile;
  quorumUsed: DynamicPersona[];
  frictionDetected: boolean;
  swarmBranchesUsed: number;
  morphicFieldUpdated: boolean;
  executionTimeMs: number;
}

export interface OmniNodeStatus {
  isOnline: boolean;
  selfPlayActive: boolean;
  morphicFieldStats: {
    totalEntries: number;
    totalSyncs: number;
    lastSync: string | null;
  };
  healthMonitorActive: boolean;
  selfPlayStats: {
    totalRounds: number;
    totalFrictionPoints: number;
    isRunning: boolean;
  };
}

// ─── Omni-Node Root Daemon ──────────────────────────────────────────────────

export class AdversiqOmniNode {
  private isOnline: boolean = false;
  private healthMonitorInterval: ReturnType<typeof setInterval> | null = null;

  private readonly morphicEngine = new MorphicFieldEngine();
  private readonly cognitiveEngine = new CognitiveUniverseEngine();
  private readonly gatekeeper = new QuorumGatekeeper();
  private readonly mutator = new AlgorithmicMutator();
  private readonly swarm = new AutonomousSwarm();
  private readonly selfPlayEngine = new AdversarialSelfPlay();

  // ─── Boot Sequence ────────────────────────────────────────────────────

  /**
   * Initialize the Omni-Node daemon.
   * Brings all subsystems online and starts background processes.
   */
  public async bootSequence(): Promise<void> {
    console.log(`[SYSTEM BOOT] ADVERSIQ Omni-Node coming online...`);
    this.isOnline = true;

    // Initialize morphic field with baseline state
    try {
      await this.morphicEngine.syncWithMorphicField([], 0, [0, 0, 0]);
      console.log(`[SYSTEM BOOT] Morphic Field synchronized.`);
    } catch (err) {
      console.warn(`[SYSTEM BOOT] Morphic Field initialization warning:`, err instanceof Error ? err.message : err);
    }

    // Start background self-play (fire-and-forget)
    this.selfPlayEngine.initiateInfiniteLoop().catch(err =>
      console.error(`[CRITICAL] Background Foundry failed:`, err)
    );
    console.log(`[SYSTEM BOOT] Adversarial Self-Play Foundry started.`);

    // Start algorithmic health monitor
    this.startAlgorithmicHealthMonitor();
    console.log(`[SYSTEM BOOT] Algorithmic Health Monitor started (1h interval).`);

    console.log(`[SYSTEM READY] Omni-Node active. Awaiting Human or Autonomous Directives.`);
  }

  /**
   * Graceful shutdown.
   */
  public shutdown(): void {
    console.log(`[SYSTEM SHUTDOWN] Omni-Node going offline...`);
    this.isOnline = false;
    this.selfPlayEngine.stop();

    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
      this.healthMonitorInterval = null;
    }

    console.log(`[SYSTEM SHUTDOWN] All subsystems stopped.`);
  }

  /**
   * Get current system status.
   */
  public getStatus(): OmniNodeStatus {
    return {
      isOnline: this.isOnline,
      selfPlayActive: this.selfPlayEngine.getStats().isRunning,
      morphicFieldStats: this.morphicEngine.getFieldStats(),
      healthMonitorActive: this.healthMonitorInterval !== null,
      selfPlayStats: this.selfPlayEngine.getStats(),
    };
  }

  // ─── Strategic Mandate Execution ──────────────────────────────────────

  /**
   * Execute a strategic mandate through the full Omni-Node pipeline.
   *
   * Pipeline:
   *   1. Cognitive Universe → Resolve Jungian archetype
   *   2. Morphic Field → Calculate resonance with historical strategies
   *   3. Quorum Gatekeeper → Assemble dynamic persona panel
   *   4. For each persona → Analyze mandate + spawn swarm if needed
   *   5. Morphic Field → Sync friction outcomes
   *   6. Return comprehensive dossier
   */
  public async executeStrategicMandate(humanMandate: string): Promise<MandateResult> {
    const startTime = Date.now();
    console.log(`[COMMAND CENTER] New human mandate received: "${humanMandate.slice(0, 100)}..."`);

    // ── Phase 1: Cognitive Universe — Resolve archetype ──
    const archetype = this.cognitiveEngine.resolveSovereignArchetype(humanMandate);
    console.log(`[JUNG ENGINE] Archetype resolved: ${archetype.id} (${archetype.coreBias})`);

    // ── Phase 2: Morphic Field — Check for historical resonance ──
    const strategyVector = this.vectorizeText(humanMandate);
    const resonanceMatches = this.morphicEngine.calculateMorphicResonance(strategyVector);
    if (resonanceMatches.length > 0) {
      console.log(`[MORPHIC FIELD] ${resonanceMatches.length} historical resonance matches found.`);
    }

    // ── Phase 3: Gatekeeper — Assemble dynamic quorum ──
    const activeQuorum = await this.gatekeeper.assembleQuorum(humanMandate, 5);

    // ── Phase 4: Run each persona + autonomous swarm branches ──
    let finalDossier = '';
    let frictionDetected = false;
    let swarmBranchesUsed = 0;

    finalDossier += `\n═══ ARCHETYPE: ${archetype.id} (${archetype.coreBias}) ═══\n`;
    finalDossier += `Cognitive Filter: ${archetype.cognitiveFilter}\n`;

    if (resonanceMatches.length > 0) {
      finalDossier += `\n═══ MORPHIC RESONANCE ═══\n`;
      finalDossier += `${resonanceMatches.length} historical strategy matches found (top similarity: ${(resonanceMatches[0].similarity * 100).toFixed(1)}%)\n`;
    }

    finalDossier += `\n═══ QUORUM ANALYSIS ═══\n`;

    for (const persona of activeQuorum) {
      console.log(`[DEBATE] ${persona.roleName} (${persona.adversarialStance}) is analyzing the mandate...`);

      try {
        // Each persona analyzes the mandate
        const analysis = await generateLLMPrompt(
          `You are ${persona.roleName}. Your adversarial stance is ${persona.adversarialStance}.\n\nSystem: ${persona.systemPrompt}\n\nCognitive Filter (from Archetype ${archetype.id}): ${archetype.cognitiveFilter}\n\nAnalyze the following strategic mandate:\n\n${humanMandate.slice(0, 3000)}\n\nProvide your expert analysis with specific findings, risks, and recommendations.`,
          { temperature: 0.5, maxTokens: 1000, timeoutMs: 20000 }
        );

        finalDossier += `\n[${persona.roleName} — ${persona.adversarialStance}]:\n${analysis}\n`;

        // Detect blind spots and spawn swarm if needed
        if (analysis.toLowerCase().includes('data not available') ||
            analysis.toLowerCase().includes('insufficient information') ||
            analysis.toLowerCase().includes('unable to verify') ||
            analysis.toLowerCase().includes('missing data')) {
          console.log(`[AUTONOMY] ${persona.roleName} detected a blind spot. Spawning web swarm...`);
          const blindSpotQuery = this.extractBlindSpotQuery(analysis, humanMandate);
          const verifiedData = await this.swarm.executeSubAgentBranch(
            persona.roleName,
            blindSpotQuery,
            0
          );
          finalDossier += `\n[${persona.roleName} SWARM VERIFIED]:\n${verifiedData}\n`;
          swarmBranchesUsed++;
        }

        // Check for friction (ATTACK personas finding issues)
        if (persona.adversarialStance === 'ATTACK' &&
            (analysis.toLowerCase().includes('risk') || analysis.toLowerCase().includes('concern'))) {
          frictionDetected = true;
        }
      } catch (err) {
        console.warn(`[DEBATE] ${persona.roleName} failed to respond:`, err instanceof Error ? err.message : err);
        finalDossier += `\n[${persona.roleName}]: Analysis unavailable (${err instanceof Error ? err.message : 'timeout'})\n`;
      }
    }

    // ── Phase 5: Morphic Field — Sync friction outcomes ──
    let morphicFieldUpdated = false;
    if (frictionDetected) {
      try {
        await this.morphicEngine.syncWithMorphicField(
          ['SPI', 'IVAST', 'CRI', 'SEAM'],
          frictionDetected ? -0.3 : 0.5,
          strategyVector
        );
        morphicFieldUpdated = true;
        console.log(`[MORPHIC FIELD] Strategic friction mapped. Field updated.`);
      } catch {
        console.warn('[MORPHIC FIELD] Sync failed (non-blocking).');
      }
    }

    // Log archetype event
    this.cognitiveEngine.logArchetypeEvent(
      archetype.id,
      `Mandate analyzed by ${activeQuorum.length} personas. Friction: ${frictionDetected}. Swarm branches: ${swarmBranchesUsed}.`
    );

    const executionTimeMs = Date.now() - startTime;
    console.log(`[COMMAND CENTER] Mandate execution complete in ${executionTimeMs}ms.`);

    return {
      dossier: finalDossier,
      archetype,
      quorumUsed: activeQuorum,
      frictionDetected,
      swarmBranchesUsed,
      morphicFieldUpdated,
      executionTimeMs,
    };
  }

  // ─── Background Processes ─────────────────────────────────────────────

  /**
   * Hourly algorithmic health monitor.
   * If formula variance exceeds threshold, triggers the AlgorithmicMutator.
   */
  private startAlgorithmicHealthMonitor(): void {
    this.healthMonitorInterval = setInterval(async () => {
      if (!this.isOnline) return;

      try {
        const auditReport = await Judge2MathCheck.auditFormulaVariance();

        if (auditReport.hasCriticalVariance && auditReport.targetFormula) {
          console.log(`[HEALTH MONITOR] Critical variance detected in "${auditReport.targetFormula}". Triggering mutation...`);
          const result = await this.mutator.mutateFormula(
            auditReport.targetFormula,
            auditReport.varianceContext
          );
          console.log(`[HEALTH MONITOR] Mutation result: ${result.message}`);
        } else {
          console.log(`[HEALTH MONITOR] All formulas within acceptable variance.`);
        }
      } catch (err) {
        console.warn('[HEALTH MONITOR] Audit failed (non-blocking):', err instanceof Error ? err.message : err);
      }
    }, 3_600_000); // 1 hour
  }

  // ─── Utility Methods ──────────────────────────────────────────────────

  /**
   * Simple text-to-vector conversion using character frequency analysis.
   * In production, this would use transformer embeddings (BERT, etc.).
   */
  private vectorizeText(text: string): number[] {
    const lower = text.toLowerCase();
    const dimensions = [
      'investment', 'risk', 'compliance', 'trade', 'technology',
      'mining', 'energy', 'agriculture', 'finance', 'governance',
      'infrastructure', 'health', 'education', 'defence', 'tourism',
    ];

    return dimensions.map(dim => {
      const count = (lower.match(new RegExp(dim, 'g')) || []).length;
      return Math.min(count / 3, 1); // Normalize to 0-1
    });
  }

  /**
   * Extract a focused query from a persona's analysis that mentions missing data.
   */
  private extractBlindSpotQuery(analysis: string, mandate: string): string {
    // Try to find specific missing data references
    const patterns = [
      /(?:data not available|insufficient information|unable to verify|missing data)\s+(?:for|on|about|regarding)\s+([^.]+)/i,
      /(?:need|require|lack)\s+(?:more\s+)?(?:data|information|evidence)\s+(?:on|about|for)\s+([^.]+)/i,
    ];

    for (const pattern of patterns) {
      const match = analysis.match(pattern);
      if (match?.[1]) {
        return match[1].trim().slice(0, 200);
      }
    }

    // Fallback: use a condensed version of the mandate
    return `latest data on ${mandate.slice(0, 150)}`;
  }
}

export default AdversiqOmniNode;
