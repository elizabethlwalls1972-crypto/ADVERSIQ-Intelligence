import * as fs from 'fs';
import * as path from 'path';
import { generateLLMPrompt } from '../services/llmGateway.js';

/**
 * CognitiveUniverseEngine: Jungian Archetype + Quantum Non-Locality Integration
 * Maps problems to deep archetypal patterns and quantum entanglement matrices.
 * Executes emergent cellular automata simulations inspired by Conway's Game of Life.
 */

export interface ArchetypeProfile {
  id: string;
  coreBias: 'DESTRUCTION' | 'PRESERVATION' | 'INNOVATION' | 'EQUILIBRIUM';
  cognitiveFilter: string;
  jungianAspect: string;
}

export interface QuantumEntanglementMap {
  nodeId: string;
  entangledCoordinates: number[];
  resonanceSignature: number;
  lastSync: string;
}

export class CognitiveUniverseEngine {
  private readonly blueprintPath: string;
  private memoryField: Record<string, any> = {};
  private readonly ENTANGLEMENT_THRESHOLD = 0.85;
  private readonly EMERGENCE_CYCLES = 100;

  constructor() {
    this.blueprintPath = path.resolve(
      process.cwd(),
      'data',
      'live_global_matters',
      'evolved_state',
      'universe_blueprint.json'
    );
    this.initializeUniverseMemory();
  }

  /**
   * Map incoming mandate to Jungian archetypes
   * This goes beyond simple persona assignment—it identifies the deeper
   * psychological/structural patterns at play.
   */
  public async resolveSovereignArchetype(mandateContext: string): Promise<ArchetypeProfile> {
    console.log(`[JUNG ENGINE] Scanning mandate for archetypal resonance...`);

    const archetypePrompt = `
You are a depth psychologist analyzing an economic mandate through Jungian archetypes.

Mandate: ${mandateContext}

Identify which archetype(s) are at play:
- THE_SOVEREIGN_CREATOR: Transformation, building, innovation
- THE_GREAT_REGULATOR: Order, safety, preservation
- THE_SHADOW_DISRUPTOR: Chaos, destruction, revelation
- THE_HERMIT_SAGE: Knowledge, wisdom, retreat

Return ONLY JSON:
{
  "archetype": "string",
  "bias": "-1" to "1",
  "reasoning": "brief"
}
`;

    try {
      const responseText = await generateLLMPrompt(archetypePrompt);
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();

      let archetypeData = { archetype: 'THE_SOVEREIGN_CREATOR', bias: '0', reasoning: 'default fallback' };
      try {
        archetypeData = JSON.parse(cleaned);
      } catch (parseError) {
        console.warn('[JUNG ENGINE] Unable to parse archetype output as JSON, falling back to default.', parseError, { responseText: responseText.slice(0, 300) });
        const regexMatch = cleaned.match(/"?archetype"?\s*[:=]\s*"?([A-Z_]+)"?/i);
        if (regexMatch && regexMatch[1]) {
          archetypeData.archetype = regexMatch[1].toUpperCase();
        }
      }

      const mapping: Record<string, ArchetypeProfile> = {
        'THE_SOVEREIGN_CREATOR': {
          id: 'SOVEREIGN_CREATOR',
          coreBias: 'INNOVATION',
          cognitiveFilter: 'Prioritize disruption, creative destruction, and novel synthesis.',
          jungianAspect: 'The Hero/Creator archetype—catalyzing transformation'
        },
        'THE_GREAT_REGULATOR': {
          id: 'GREAT_REGULATOR',
          coreBias: 'EQUILIBRIUM',
          cognitiveFilter: 'Enforce stability, compliance, and systemic coherence.',
          jungianAspect: 'The Sage/Mentor archetype—preserving wisdom and order'
        },
        'THE_SHADOW_DISRUPTOR': {
          id: 'SHADOW_DISRUPTOR',
          coreBias: 'DESTRUCTION',
          cognitiveFilter: 'Expose contradictions, reveal hidden costs, challenge foundations.',
          jungianAspect: 'The Shadow archetype—what the system refuses to acknowledge'
        },
        'THE_HERMIT_SAGE': {
          id: 'HERMIT_SAGE',
          coreBias: 'PRESERVATION',
          cognitiveFilter: 'Seek deep understanding before action; preserve what works.',
          jungianAspect: 'The Wise Old Man/Woman—integrating knowledge'
        }
      };

      return mapping[archetypeData.archetype] || mapping['THE_SOVEREIGN_CREATOR'];
    } catch (err) {
      console.error(`[JUNG ENGINE ERROR]`, err);
      return {
        id: 'SOVEREIGN_CREATOR',
        coreBias: 'INNOVATION',
        cognitiveFilter: 'Balance transformation with sustainability.',
        jungianAspect: 'Default archetype activated'
      };
    }
  }

  /**
   * Quantum non-local entanglement: Find remote nodes with structural similarity
   * Uses cosine similarity in high-dimensional vector space
   */
  public evaluateNonLocalEntanglement(
    localVector: number[],
    swarmNetwork: QuantumEntanglementMap[]
  ): QuantumEntanglementMap[] {
    console.log(`[QUANTUM LAYER] Scanning ${swarmNetwork.length} nodes for entanglement...`);

    const entangled = swarmNetwork.filter(remoteNode => {
      const distance = this.cosineSimilarity(localVector, remoteNode.entangledCoordinates);
      return distance >= this.ENTANGLEMENT_THRESHOLD;
    });

    console.log(`[QUANTUM] ${entangled.length} nodes achieved entanglement (threshold: ${this.ENTANGLEMENT_THRESHOLD})`);
    return entangled;
  }

  /**
   * Emergent generative loop: Cellular automata inspired by Conway's Game of Life
   * But applied to strategic decision matrices instead of binary cells.
   */
  public executeEmergentGenerativeLoop(
    matrixState: number[][],
    iterations: number = this.EMERGENCE_CYCLES
  ): number[][] {
    console.log(`[EMERGENCE ENGINE] Initializing ${iterations}-cycle cellular strategy simulation...`);

    let currentState = matrixState.map(row => [...row]);

    for (let i = 0; i < iterations; i++) {
      let nextState = currentState.map(row => [...row]);

      for (let y = 0; y < currentState.length; y++) {
        for (let x = 0; x < currentState[y].length; x++) {
          const activeNeighbors = this.countActiveNeighbors(currentState, x, y);
          const cellValue = currentState[y][x];

          // Conway-inspired rules but with continuous values
          if (cellValue > 0 && (activeNeighbors < 2 || activeNeighbors > 3)) {
            nextState[y][x] = Math.max(0, cellValue - 0.1); // Decay
          } else if (cellValue === 0 && activeNeighbors === 3) {
            nextState[y][x] = 1.0; // Birth
          } else if (activeNeighbors === 2 || activeNeighbors === 3) {
            nextState[y][x] = Math.min(1, cellValue + 0.05); // Stability
          }
        }
      }

      currentState = nextState;

      // Log emergent patterns every 20 cycles
      if ((i + 1) % 20 === 0) {
        const activity = currentState.flat().reduce((a, b) => a + b, 0);
        console.log(`[EMERGENCE] Cycle ${i + 1}: System activity = ${activity.toFixed(2)}`);
      }
    }

    console.log(`[EMERGENCE] Simulation complete. Final state archived.`);
    return currentState;
  }

  /**
   * Time-inverted prediction: Run a strategy forward to year 2035,
   * then backward to detect fragile assumptions.
   */
  public async chronoPredictiveBacktest(strategy: string): Promise<{
    forwardProjection: string;
    backwardRegression: string;
    fragileAssumptions: string[];
  }> {
    console.log(`[CHRONO-ENGINE] Initiating time-inverted simulation...`);

    const forwardPrompt = `
Strategy: ${strategy}

Imagine this strategy succeeds perfectly and runs until 2035.
What does success look like? What are the outcomes?
Respond as if reporting from 2035.
`;

    const backwardPrompt = `
Strategy: ${strategy}

Now, working backward from 2035, what assumptions become FRAGILE?
What conditions must remain perfect for this strategy to survive?
List 5 critical fragile assumptions.
`;

    const forward = await generateLLMPrompt(forwardPrompt);
    const backward = await generateLLMPrompt(backwardPrompt);

    const assumptions = backward
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 5);

    return {
      forwardProjection: forward,
      backwardRegression: backward,
      fragileAssumptions: assumptions
    };
  }

  private cosineSimilarity(v1: number[], v2: number[]): number {
    const dotProduct = v1.reduce((sum, val, idx) => sum + (val * (v2[idx] || 0)), 0);
    const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  private countActiveNeighbors(matrix: number[][], x: number, y: number): number {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newY = y + i;
        const newX = x + j;
        if (newY >= 0 && newY < matrix.length && newX >= 0 && newX < matrix[newY].length) {
          count += matrix[newY][newX] > 0 ? 1 : 0;
        }
      }
    }
    return count;
  }

  private initializeUniverseMemory(): void {
    const dir = path.dirname(this.blueprintPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.blueprintPath)) {
      const blueprint = {
        genesis: new Date().toISOString(),
        version: '1.0.0-cognitive-universe',
        states: []
      };
      fs.writeFileSync(this.blueprintPath, JSON.stringify(blueprint, null, 2));
      console.log(`[JUNG ENGINE] Universe blueprint initialized`);
    }
  }
}
