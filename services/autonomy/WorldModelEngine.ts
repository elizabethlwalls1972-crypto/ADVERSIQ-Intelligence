import type { MissionCaseInput } from './MissionGraphService';
import type { SimulationResult } from '../../types/autonomy';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const scoreComplexity = (input: MissionCaseInput): number => {
  const objectiveComplexity = input.objectives.length > 120 ? 15 : input.objectives.length > 60 ? 10 : 5;
  const matterComplexity = input.currentMatter.length > 200 ? 18 : input.currentMatter.length > 100 ? 12 : 6;
  const constraintComplexity = input.constraints.split(/[;,\n]/).filter(Boolean).length * 3;
  const gapComplexity = input.criticalGapCount * 8;
  return clamp(objectiveComplexity + matterComplexity + constraintComplexity + gapComplexity, 5, 45);
};

export class WorldModelEngine {
  static simulateTask(
    taskId: string,
    taskType: string,
    input: MissionCaseInput,
    sensitivityDrivers: string[] = []
  ): SimulationResult {
    const complexity = scoreComplexity(input);
    const readiness = clamp(input.readinessScore, 0, 100);
    const gapPenalty = input.criticalGapCount * 7;

    const taskBias = taskType === 'case-gap-resolution'
      ? 8
      : taskType === 'report-generation-preflight'
        ? (input.criticalGapCount === 0 ? 10 : -10)
        : 0;

    const baseCase = clamp(readiness - complexity - gapPenalty + taskBias, 10, 95);
    const upsideCase = clamp(baseCase + 12, 15, 99);
    const downsideCase = clamp(baseCase - 18, 1, 90);

    return {
      taskId,
      baseCase,
      upsideCase,
      downsideCase,
      sensitivityDrivers: sensitivityDrivers.length > 0
        ? sensitivityDrivers
        : ['Readiness score', 'Critical gap count', 'Constraint density'],
      recommendedProceed: baseCase >= 62 && downsideCase >= 25
    };
  }
}

export default WorldModelEngine;
