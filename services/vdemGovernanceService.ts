
export interface VDemScore { electoral: number; liberal: number; participatory: number; deliberative: number; egalitarian: number; }

export interface VDemGovernanceProfile {
  region: string;
  score: VDemScore;
  index: number;
  governanceBand: 'low' | 'medium' | 'high';
  recommendations: string[];
}

const defaultBaseline: VDemScore = { electoral: 0.6, liberal: 0.6, participatory: 0.5, deliberative: 0.5, egalitarian: 0.55 };
const baselines: Record<string, VDemScore> = {
  default: defaultBaseline,
  australia: { electoral: 0.8, liberal: 0.75, participatory: 0.7, deliberative: 0.72, egalitarian: 0.7 },
  philippines: { electoral: 0.55, liberal: 0.52, participatory: 0.48, deliberative: 0.45, egalitarian: 0.5 },
  indonesia: { electoral: 0.58, liberal: 0.55, participatory: 0.52, deliberative: 0.5, egalitarian: 0.53 },
};

function computeIndex(score: VDemScore): number {
  return (score.electoral + score.liberal + score.participatory + score.deliberative + score.egalitarian) / 5;
}

function governanceBandFromIndex(index: number): VDemGovernanceProfile['governanceBand'] {
  if (index >= 0.75) return 'high';
  if (index >= 0.55) return 'medium';
  return 'low';
}

function recommendationsFor(score: VDemScore, region: string): string[] {
  const recs: string[] = [];
  if (score.participatory < 0.6) recs.push(`strengthen civic participation channels in ${region}`);
  if (score.egalitarian < 0.6) recs.push(`address inequality in ${region}`);
  if (score.deliberative < 0.6) recs.push(`improve institutional deliberation in ${region}`);
  if (score.liberal < 0.6) recs.push(`enhance liberal democratic institutions in ${region}`);
  return recs;
}

export function getVDemProfile(region: string): VDemGovernanceProfile {
  const normalized = region?.trim().toLowerCase() || 'default';
  const score = baselines[normalized] || baselines.default;
  const index = computeIndex(score);
  return {
    region: region || 'default',
    score,
    index,
    governanceBand: governanceBandFromIndex(index),
    recommendations: recommendationsFor(score, region || 'default'),
  };
}

export function compareGovernance(regionA: string, regionB: string) {
  const a = getVDemProfile(regionA);
  const b = getVDemProfile(regionB);
  return {
    summary: `Compared governance between ${a.region} (${a.governanceBand}) and ${b.region} (${b.governanceBand}).`,
    comparison: {
      aIndex: a.index,
      bIndex: b.index,
      delta: Math.abs(a.index - b.index),
    },
    countryA: a,
    countryB: b,
  };
}

export class VdemGovernanceService {
  scoreRegion(region: string): VDemScore { return baselines[region.toLowerCase()] || baselines.default; }
  governanceIndex(region: string): number { return computeIndex(this.scoreRegion(region.toLowerCase())); }
  recommends(region: string): string[] { return recommendationsFor(this.scoreRegion(region.toLowerCase()), region); }
}

export default VdemGovernanceService;
