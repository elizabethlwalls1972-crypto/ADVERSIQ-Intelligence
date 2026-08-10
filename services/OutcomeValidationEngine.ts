
export interface OutcomeRecord { expected: any; actual: any; tolerance: number; }
export class OutcomeValidationEngine {
  validate(o: OutcomeRecord): { passed: boolean; delta: number; notes: string } {
    const delta = Math.abs(JSON.stringify(o.expected).length - JSON.stringify(o.actual).length);
    const passed = delta <= o.tolerance;
    return { passed, delta, notes: passed ? 'within tolerance' : 'exceeded tolerance' };
  }
  batch(records: OutcomeRecord[]): number { return records.filter(r => this.validate(r).passed).length / records.length; }
}
export default OutcomeValidationEngine;
