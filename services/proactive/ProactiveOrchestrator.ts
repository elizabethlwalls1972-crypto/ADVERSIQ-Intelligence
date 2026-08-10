
export class ProactiveOrchestrator {
  private signals: any[] = [];
  ingest(signal: any) { this.signals.push({ ...signal, at: Date.now() }); }
  pending(): any[] { return this.signals.filter(s => !s.handled); }
  prioritize(): any[] { return this.pending().sort((a, b) => (b.urgency ?? 0) - (a.urgency ?? 0)); }
}

export const proactiveOrchestrator = new ProactiveOrchestrator();
export default ProactiveOrchestrator;
