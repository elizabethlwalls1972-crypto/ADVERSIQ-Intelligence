
export class ProactiveSignalMiner {
  mine(history: any[]): { trend: string; strength: number }[] {
    const counts: Record<string, number> = {};
    for (const h of history) for (const k of Object.keys(h || {})) counts[k] = (counts[k] || 0) + 1;
    return Object.entries(counts).map(([k, v]) => ({ trend: k, strength: v / history.length })).sort((a, b) => b.strength - a.strength);
  }
}
export default ProactiveSignalMiner;
