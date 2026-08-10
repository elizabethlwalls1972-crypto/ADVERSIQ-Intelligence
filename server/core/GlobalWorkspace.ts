import * as fs from 'fs';
import * as path from 'path';

export interface ConsciousContent {
  id: string;
  timestamp: string;
  source: string;
  content: any;
  strength: number;
  ignition: boolean;
  broadcastTargets: string[];
}

export interface BroadcastEvent {
  id: string;
  timestamp: string;
  content: ConsciousContent;
  source: string;
  strength: number;
}

export interface CompetitionResult {
  winner: ConsciousContent | null;
  candidates: ConsciousContent[];
  ignitionThreshold: number;
  totalBroadcasts: number;
}

export class GlobalWorkspace {
  private consciousContent: Map<string, ConsciousContent> = new Map();
  private broadcastHistory: BroadcastEvent[] = [];
  private ignitionThreshold: number = 0.5;
  private maxContentAgeMs: number = 60000;
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'global_workspace');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async broadcast(content: any, source: string): Promise<ConsciousContent> {
    const id = `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const strength = this.computeBroadcastStrength(content);
    const ignition = strength >= this.ignitionThreshold;

    const consciousContent: ConsciousContent = {
      id,
      timestamp: new Date().toISOString(),
      source,
      content,
      strength,
      ignition,
      broadcastTargets: [],
    };

    this.consciousContent.set(id, consciousContent);

    if (ignition) {
      this.propagateToTargets(consciousContent);
    }

    this.persistBroadcast({
      id,
      timestamp: consciousContent.timestamp,
      content: consciousContent,
      source,
      strength,
    });

    this.cleanupExpired();

    return consciousContent;
  }

  getConsciousContent(): ConsciousContent[] {
    this.cleanupExpired();
    return Array.from(this.consciousContent.values())
      .sort((a, b) => b.strength - a.strength);
  }

  resolveCompetition(): CompetitionResult {
    const contents = this.getConsciousContent();
    const winner = contents.length > 0 ? contents[0] : null;

    return {
      winner,
      candidates: contents,
      ignitionThreshold: this.ignitionThreshold,
      totalBroadcasts: this.broadcastHistory.length,
    };
  }

  getBroadcastStrength(content: any): number {
    if (typeof content === 'string') {
      return Math.min(content.length / 1000, 1.0);
    }
    if (typeof content === 'object' && content !== null) {
      const keys = Object.keys(content);
      return Math.min(keys.length / 10, 1.0);
    }
    return 0.5;
  }

  private propagateToTargets(content: ConsciousContent): void {
    content.broadcastTargets = ['actionSelection', 'episodicMemory', 'proceduralMemory', 'learning'];
  }

  private computeBroadcastStrength(content: any): number {
    const baseStrength = this.getBroadcastStrength(content);
    const recencyBoost = this.getRecencyBoost();
    return Math.min(baseStrength + recencyBoost, 1.0);
  }

  private getRecencyBoost(): number {
    const recent = this.broadcastHistory.slice(-5);
    if (recent.length === 0) return 0;
    const avgStrength = recent.reduce((sum, b) => sum + b.strength, 0) / recent.length;
    return avgStrength * 0.2;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [id, content] of this.consciousContent) {
      const age = now - new Date(content.timestamp).getTime();
      if (age > this.maxContentAgeMs) {
        this.consciousContent.delete(id);
      }
    }
  }

  private persistBroadcast(event: BroadcastEvent): void {
    try {
      this.broadcastHistory.push(event);
      if (this.broadcastHistory.length > 1000) {
        this.broadcastHistory = this.broadcastHistory.slice(-500);
      }
    } catch (err) {
      console.error('[GlobalWorkspace] Failed to persist broadcast:', err);
    }
  }

  getBroadcastCount(): number {
    return this.broadcastHistory.length;
  }

  getIgnitionCount(): number {
    return this.broadcastHistory.filter(b => b.content.ignition).length;
  }
}

export default GlobalWorkspace;