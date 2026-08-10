import { PerceptualAssociativeMemory } from './PerceptualAssociativeMemory.js';
import { EpisodicMemory } from './EpisodicMemory.js';
import { GlobalWorkspace } from './GlobalWorkspace.js';
import { ActionSelection } from './ActionSelection.js';
import { ProceduralMemory } from './ProceduralMemory.js';
import { LearningMechanisms } from './LearningMechanisms.js';
import SelfLearningAlgorithm from './SelfLearningAlgorithm.js';

export interface LIDACycleResult {
  cycleNumber: number;
  timestamp: string;
  perception: any;
  attention: any;
  consciousContent: any;
  selectedAction: any;
  episodeStored: boolean;
  learningUpdate: any;
  selfLearningResult?: any;
}

export interface LIDAState {
  cycleCount: number;
  isRunning: boolean;
  lastCycleResult: LIDACycleResult | null;
  modules: {
    perceptualMemory: string;
    episodicMemory: string;
    globalWorkspace: string;
    actionSelection: string;
    proceduralMemory: string;
    learning: string;
    selfLearning: string;
  };
}

export class LIDAController {
  private perceptualMemory: PerceptualAssociativeMemory;
  private episodicMemory: EpisodicMemory;
  private globalWorkspace: GlobalWorkspace;
  private actionSelection: ActionSelection;
  private proceduralMemory: ProceduralMemory;
  private learning: LearningMechanisms;
  private selfLearning: SelfLearningAlgorithm;
  private cycleCount: number = 0;
  private isRunning: boolean = false;
  private lastCycleResult: LIDACycleResult | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.perceptualMemory = new PerceptualAssociativeMemory();
    this.episodicMemory = new EpisodicMemory();
    this.globalWorkspace = new GlobalWorkspace();
    this.actionSelection = new ActionSelection();
    this.proceduralMemory = new ProceduralMemory();
    this.learning = new LearningMechanisms();
    this.selfLearning = new SelfLearningAlgorithm();
  }

  async runCycle(input: any): Promise<LIDACycleResult> {
    this.cycleCount++;
    const timestamp = new Date().toISOString();

    const perception = await this.perceptualMemory.storePercept(input);
    const attention = await this.perceptualMemory.gatePercept(perception);
    const consciousContent = await this.globalWorkspace.broadcast(attention, 'LIDAController');
    const selectedAction = await this.actionSelection.selectAction(
      consciousContent.broadcastTargets.map((t: string) => ({
        id: t,
        name: t,
        type: 'cognitive',
        utility: 0.5,
        parameters: {},
        prerequisites: [],
        confidence: 0.5,
      })),
      consciousContent
    );
    const episodeStored = await this.episodicMemory.storeEpisode({
      id: `cycle_${this.cycleCount}`,
      timestamp,
      content: input,
      context: consciousContent,
      action: selectedAction.selectedAction,
      outcome: null,
      successMetric: 0.5,
      temporalContext: { before: [], after: [] },
    });
    const learningUpdate = await this.learning.learnFromCycle({
      cycleNumber: this.cycleCount,
      perception,
      attention,
      consciousContent,
      selectedAction: selectedAction.selectedAction,
      episodeStored,
    });

    let selfLearningResult = null;
    try {
      selfLearningResult = await this.selfLearning.runSelfLearningCycle(input, consciousContent.broadcastTargets.join(', '));
    } catch {
      // Self-learning is non-critical; continue even if it fails
    }

    this.lastCycleResult = {
      cycleNumber: this.cycleCount,
      timestamp,
      perception,
      attention,
      consciousContent,
      selectedAction: selectedAction.selectedAction,
      episodeStored,
      learningUpdate,
      selfLearningResult,
    };

    return this.lastCycleResult;
  }

  async runContinuous(intervalMs: number = 100): Promise<void> {
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return;
      try {
        await this.runCycle({ timestamp: Date.now(), source: 'continuous' });
      } catch (err) {
        console.error('[LIDA] Cycle error:', err);
      }
    }, intervalMs);
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getState(): LIDAState {
    return {
      cycleCount: this.cycleCount,
      isRunning: this.isRunning,
      lastCycleResult: this.lastCycleResult,
      modules: {
        perceptualMemory: 'active',
        episodicMemory: 'active',
        globalWorkspace: 'active',
        actionSelection: 'active',
        proceduralMemory: 'active',
        learning: 'active',
        selfLearning: 'active',
      },
    };
  }

  getCycleCount(): number {
    return this.cycleCount;
  }

  reset(): void {
    this.stop();
    this.cycleCount = 0;
    this.lastCycleResult = null;
    this.isRunning = false;
  }
}

export default LIDAController;