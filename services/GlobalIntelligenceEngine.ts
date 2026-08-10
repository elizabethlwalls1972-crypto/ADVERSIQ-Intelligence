
import { AdvisorSnapshot, ComprehensiveSystemModel } from './ComprehensiveSystemModel';

export interface IntelligenceSource { id: string; weight: number; fetch: () => Promise<any>; }
export class GlobalIntelligenceEngine {
  private sources: IntelligenceSource[] = [];
  registerSource(s: IntelligenceSource) { this.sources.push(s); }
  async aggregate(query: string): Promise<{ query: string; findings: any[]; confidence: number }> {
    const findings: any[] = [];
    let totalW = 0;
    for (const s of this.sources) {
      try { const r = await s.fetch(); findings.push({ source: s.id, data: r, weight: s.weight }); totalW += s.weight; }
      catch (e) { findings.push({ source: s.id, error: String(e) }); }
    }
    return { query, findings, confidence: this.sources.length ? totalW / this.sources.length : 0 };
  }
}

export function buildAdvisorSnapshot(model: ComprehensiveSystemModel): AdvisorSnapshot {
  return {
    summary: `Advisor snapshot generated for ${model.identity?.organization?.legalName || 'Unnamed Organization'}.`,
    priorityMoves: [],
    engagements: [],
    artifacts: {
      battlePlan: {
        title: 'Battle Plan',
        narrative: 'A concise plan based on the current model.',
        bullets: [],
      },
      riskBrief: {
        title: 'Risk Brief',
        narrative: 'A high-level risk summary.',
        bullets: [],
      },
      opportunityScan: {
        title: 'Opportunity Scan',
        narrative: 'A summary of opportunity areas.',
        bullets: [],
      },
    },
    signals: [],
  };
}

export default GlobalIntelligenceEngine;
