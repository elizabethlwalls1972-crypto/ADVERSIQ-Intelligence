
export interface CaseNode { id: string; features: string[]; }
export class CaseGraphBuilder {
  private nodes: CaseNode[] = [];
  addCase(n: CaseNode) { this.nodes.push(n); }
  edges(minOverlap = 1): { a: string; b: string; weight: number }[] {
    const edges: { a: string; b: string; weight: number }[] = [];
    for (let i = 0; i < this.nodes.length; i++) for (let j = i + 1; j < this.nodes.length; j++) {
      const overlap = this.nodes[i].features.filter(f => this.nodes[j].features.includes(f)).length;
      if (overlap >= minOverlap) edges.push({ a: this.nodes[i].id, b: this.nodes[j].id, weight: overlap });
    }
    return edges;
  }
}
export default CaseGraphBuilder;
