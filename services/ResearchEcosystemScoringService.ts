
export interface EcosystemInput { publications: number; citations: number; collaborations: number; funding: number; }
export class ResearchEcosystemScoringService {
  score(e: EcosystemInput): number {
    const norm = (e.publications * 0.3 + e.citations * 0.4 + e.collaborations * 0.2 + e.funding * 0.1);
    return Math.min(1, norm / 100);
  }
  rank(ecosystems: { id: string; data: EcosystemInput }[]): { id: string; score: number }[] {
    return ecosystems.map(x => ({ id: x.id, score: this.score(x.data) })).sort((a, b) => b.score - a.score);
  }
}
export default ResearchEcosystemScoringService;
