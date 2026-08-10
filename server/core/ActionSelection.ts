import * as fs from 'fs';
import * as path from 'path';

export interface Action {
  id: string;
  name: string;
  type: string;
  utility: number;
  parameters: Record<string, any>;
  prerequisites: string[];
  confidence: number;
}

export interface ActionSelectionResult {
  selectedAction: Action | null;
  alternatives: Action[];
  utilityScore: number;
  confidence: number;
  reasoning: string[];
}

export class ActionSelection {
  private actionHistory: Map<string, { action: Action; success: boolean; timestamp: string }> = new Map();
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'action_selection');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async selectAction(
    availableActions: Action[],
    context: any
  ): Promise<ActionSelectionResult> {
    if (availableActions.length === 0) {
      return {
        selectedAction: null,
        alternatives: [],
        utilityScore: 0,
        confidence: 0,
        reasoning: ['No actions available'],
      };
    }

    const scoredActions = availableActions.map(action => {
      const utility = this.computeUtility(action, context);
      const confidence = this.computeConfidence(action, context);
      return { ...action, utility, confidence };
    });

    scoredActions.sort((a, b) => b.utility - a.utility);

    const selectedAction = scoredActions[0];
    const alternatives = scoredActions.slice(1, Math.min(5, scoredActions.length));

    const reasoning = this.generateReasoning(selectedAction, alternatives, context);

    return {
      selectedAction,
      alternatives,
      utilityScore: selectedAction.utility,
      confidence: selectedAction.confidence,
      reasoning,
    };
  }

  private computeUtility(action: Action, context: any): number {
    let utility = action.utility;

    const historicalSuccess = this.getHistoricalSuccessRate(action.id);
    utility += historicalSuccess * 0.3;

    const contextMatch = this.computeContextMatch(action, context);
    utility += contextMatch * 0.2;

    const prerequisiteBonus = this.checkPrerequisites(action, context);
    utility += prerequisiteBonus * 0.15;

    return Math.min(Math.max(utility, 0), 1);
  }

  private computeConfidence(action: Action, context: any): number {
    const historicalSuccess = this.getHistoricalSuccessRate(action.id);
    const contextMatch = this.computeContextMatch(action, context);
    return (historicalSuccess * 0.6 + contextMatch * 0.4);
  }

  private getHistoricalSuccessRate(actionId: string): number {
    const history = this.actionHistory.get(actionId);
    if (!history) return 0.5;
    return history.success ? 0.9 : 0.1;
  }

  private computeContextMatch(action: Action, context: any): number {
    if (!context || !action.parameters) return 0.5;

    let matches = 0;
    let total = 0;

    for (const [key, value] of Object.entries(action.parameters)) {
      total++;
      if (context[key] !== undefined && context[key] === value) {
        matches++;
      }
    }

    return total > 0 ? matches / total : 0.5;
  }

  private checkPrerequisites(action: Action, context: any): number {
    if (!action.prerequisites || action.prerequisites.length === 0) return 1;

    let satisfied = 0;
    for (const prereq of action.prerequisites) {
      if (context[prereq] !== undefined && context[prereq]) {
        satisfied++;
      }
    }

    return action.prerequisites.length > 0 ? satisfied / action.prerequisites.length : 1;
  }

  private generateReasoning(
    selected: Action,
    alternatives: Action[],
    context: any
  ): string[] {
    const reasoning: string[] = [];
    reasoning.push(`Selected action "${selected.name}" with utility score ${selected.utility.toFixed(3)}`);

    if (alternatives.length > 0) {
      reasoning.push(`${alternatives.length} alternative actions evaluated`);
      const topAlt = alternatives[0];
      reasoning.push(`Next best alternative: "${topAlt.name}" (utility: ${topAlt.utility.toFixed(3)})`);
    }

    const historicalSuccess = this.getHistoricalSuccessRate(selected.id);
    if (historicalSuccess > 0.7) {
      reasoning.push(`Action has high historical success rate (${(historicalSuccess * 100).toFixed(0)}%)`);
    }

    return reasoning;
  }

  async recordOutcome(actionId: string, success: boolean): Promise<void> {
    this.actionHistory.set(actionId, {
      action: { id: actionId, name: actionId, type: 'recorded', utility: 0, parameters: {}, prerequisites: [], confidence: 0 },
      success,
      timestamp: new Date().toISOString(),
    });
  }

  getActionHistoryCount(): number {
    return this.actionHistory.size;
  }
}

export default ActionSelection;