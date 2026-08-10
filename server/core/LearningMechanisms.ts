import * as fs from 'fs';
import * as path from 'path';

export interface LearningEvent {
  id: string;
  timestamp: string;
  type: 'perceptual' | 'episodic' | 'procedural' | 'metacognitive';
  input: any;
  output: any;
  feedback: any;
  success: boolean;
}

export interface LearningUpdate {
  cyclesCompleted: number;
  newProcedures: number;
  updatedProcedures: number;
  insights: string[];
  confidenceChange: number;
}

export class LearningMechanisms {
  private learningEvents: LearningEvent[] = [];
  private dataDir: string;
  private totalCycles: number = 0;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'learning');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async learnFromCycle(cycle: {
    cycleNumber: number;
    perception: any;
    attention: any;
    consciousContent: any;
    selectedAction: any;
    episodeStored: boolean;
  }): Promise<LearningUpdate> {
    this.totalCycles++;

    const insights = this.generateInsights(cycle);
    const confidenceChange = this.computeConfidenceChange(cycle);

    const event: LearningEvent = {
      id: `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'procedural',
      input: cycle.perception,
      output: cycle.selectedAction,
      feedback: cycle,
      success: cycle.episodeStored,
    };

    this.learningEvents.push(event);
    this.persistLearningEvent(event);

    return {
      cyclesCompleted: this.totalCycles,
      newProcedures: insights.filter(i => i.includes('new')).length,
      updatedProcedures: insights.filter(i => i.includes('updated')).length,
      insights,
      confidenceChange,
    };
  }

  async learnFromPercept(percept: any): Promise<string[]> {
    const insights: string[] = [];

    if (percept.salience > 0.7) {
      insights.push('High-salience percept detected - flagging for attention');
    }

    if (percept.features && percept.features.size > 5) {
      insights.push('Complex feature pattern identified - updating perceptual model');
    }

    return insights;
  }

  async learnFromEpisode(episode: any): Promise<string[]> {
    const insights: string[] = [];

    if (episode.successMetric > 0.7) {
      insights.push('Successful episode - reinforcing procedure');
    } else if (episode.successMetric < 0.3) {
      insights.push('Failed episode - updating procedure to avoid similar paths');
    }

    return insights;
  }

  async learnFromFeedback(
    procedureId: string,
    feedback: { success: boolean; outcome: any }
  ): Promise<string[]> {
    const insights: string[] = [];

    if (feedback.success) {
      insights.push(`Procedure ${procedureId} succeeded - strengthening pathway`);
    } else {
      insights.push(`Procedure ${procedureId} failed - weakening pathway and exploring alternatives`);
    }

    return insights;
  }

  async consolidate(): Promise<{
    totalEvents: number;
    consolidated: number;
    discarded: number;
  }> {
    const total = this.learningEvents.length;
    let discarded = 0;

    this.learningEvents = this.learningEvents.filter((event, index) => {
      const age = Date.now() - new Date(event.timestamp).getTime();
      const ageDays = age / (1000 * 60 * 60 * 24);

      if (ageDays > 7 && !event.success && index > 100) {
        discarded++;
        return false;
      }
      return true;
    });

    return {
      totalEvents: total,
      consolidated: total - discarded,
      discarded,
    };
  }

  private generateInsights(cycle: any): string[] {
    const insights: string[] = [];

    if (cycle.episodeStored) {
      insights.push('Episode stored - procedural memory updated');
    }

    if (cycle.attention && cycle.attention.dominantFeatures) {
      insights.push(`Dominant features identified: ${cycle.attention.dominantFeatures.slice(0, 3).join(', ')}`);
    }

    if (cycle.selectedAction) {
      insights.push(`Action selected: ${cycle.selectedAction.name || cycle.selectedAction}`);
    }

    insights.push(`Cycle ${cycle.cycleNumber} completed successfully`);

    return insights;
  }

  private computeConfidenceChange(cycle: any): number {
    if (cycle.episodeStored && cycle.selectedAction) {
      return 0.05;
    } else if (!cycle.episodeStored) {
      return -0.02;
    }
    return 0;
  }

  private persistLearningEvent(event: LearningEvent): void {
    try {
      const filename = path.join(this.dataDir, `${event.id}.json`);
      fs.writeFileSync(filename, JSON.stringify(event, null, 2));
    } catch (err) {
      console.error('[LearningMechanisms] Failed to persist event:', err);
    }
  }

  getEventCount(): number {
    return this.learningEvents.length;
  }

  getTotalCycles(): number {
    return this.totalCycles;
  }
}

export default LearningMechanisms;