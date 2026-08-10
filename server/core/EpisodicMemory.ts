import * as fs from 'fs';
import * as path from 'path';

export interface Episode {
  id: string;
  timestamp: string;
  content: any;
  context: any;
  action: any;
  outcome: any;
  successMetric: number;
  temporalContext: {
    before: any[];
    after: any[];
  };
}

export interface EpisodeQuery {
  content?: string;
  context?: any;
  timeRange?: { start: string; end: string };
  minSuccessMetric?: number;
  limit?: number;
}

export interface EpisodeRetrievalResult {
  episodes: Episode[];
  totalFound: number;
  averageSuccess: number;
  mostRecentOutcome: any;
}

export class EpisodicMemory {
  private episodes: Map<string, Episode> = new Map();
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'episodic_memory');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async storeEpisode(episode: Omit<Episode, 'id' | 'timestamp'>): Promise<boolean> {
    const id = `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullEpisode: Episode = {
      ...episode,
      id,
      timestamp: new Date().toISOString(),
    };

    this.episodes.set(id, fullEpisode);
    this.persistEpisode(fullEpisode);

    return true;
  }

  async retrieveEpisodes(query: EpisodeQuery): Promise<EpisodeRetrievalResult> {
    let results: Episode[] = [];

    for (const [, episode] of this.episodes) {
      if (query.content && !episode.content?.toString().includes(query.content)) {
        continue;
      }
      if (query.minSuccessMetric !== undefined && episode.successMetric < query.minSuccessMetric) {
        continue;
      }
      if (query.timeRange) {
        const epTime = new Date(episode.timestamp).getTime();
        const start = new Date(query.timeRange.start).getTime();
        const end = new Date(query.timeRange.end).getTime();
        if (epTime < start || epTime > end) continue;
      }
      results.push(episode);
    }

    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const limited = query.limit ? results.slice(0, query.limit) : results;
    const avgSuccess = limited.length > 0
      ? limited.reduce((sum, e) => sum + e.successMetric, 0) / limited.length
      : 0;

    return {
      episodes: limited,
      totalFound: results.length,
      averageSuccess: avgSuccess,
      mostRecentOutcome: limited.length > 0 ? limited[0].outcome : null,
    };
  }

  getTemporalContext(episodeId: string): { before: Episode[]; after: Episode[] } {
    const episode = this.episodes.get(episodeId);
    if (!episode) return { before: [], after: [] };

    const epTime = new Date(episode.timestamp).getTime();
    const before: Episode[] = [];
    const after: Episode[] = [];

    for (const [, e] of this.episodes) {
      if (e.id === episodeId) continue;
      const eTime = new Date(e.timestamp).getTime();
      if (eTime < epTime) before.push(e);
      else if (eTime > epTime) after.push(e);
    }

    before.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    after.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return { before: before.slice(0, 10), after: after.slice(0, 10) };
  }

  async consolidateMemory(): Promise<{ consolidated: number; discarded: number }> {
    const entries = Array.from(this.episodes.entries());
    let discarded = 0;

    for (const [id, episode] of entries) {
      const age = Date.now() - new Date(episode.timestamp).getTime();
      const ageDays = age / (1000 * 60 * 60 * 24);

      if (ageDays > 30 && episode.successMetric < 0.3) {
        this.episodes.delete(id);
        this.removePersistedEpisode(id);
        discarded++;
      }
    }

    return {
      consolidated: entries.length - discarded,
      discarded,
    };
  }

  private persistEpisode(episode: Episode): void {
    try {
      const filename = path.join(this.dataDir, `${episode.id}.json`);
      fs.writeFileSync(filename, JSON.stringify(episode, null, 2));
    } catch (err) {
      console.error('[EpisodicMemory] Failed to persist episode:', err);
    }
  }

  private removePersistedEpisode(id: string): void {
    try {
      const filename = path.join(this.dataDir, `${id}.json`);
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
    } catch (err) {
      console.error('[EpisodicMemory] Failed to remove episode:', err);
    }
  }

  getEpisodeCount(): number {
    return this.episodes.size;
  }

  getEpisode(id: string): Episode | undefined {
    return this.episodes.get(id);
  }
}

export default EpisodicMemory;