
export interface Situation { actors: string[]; pressures: string[]; uncertainties: string[]; }
export class SituationAnalysisEngine {
  analyze(s: Situation): { complexity: number; stability: number; drivers: string[] } {
    const complexity = (s.actors.length * 0.2 + s.pressures.length * 0.3 + s.uncertainties.length * 0.5) / 10;
    const stability = Math.max(0, 1 - s.uncertainties.length * 0.1 - s.pressures.length * 0.05);
    return { complexity: Math.min(1, complexity), stability, drivers: s.pressures.slice(0, 3) };
  }
}
export default SituationAnalysisEngine;
