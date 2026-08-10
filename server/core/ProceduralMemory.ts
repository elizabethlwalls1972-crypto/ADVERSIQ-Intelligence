import * as fs from 'fs';
import * as path from 'path';

export interface ProcedureChunk {
  id: string;
  situation: string;
  action: string;
  parameters: Record<string, any>;
  successCount: number;
  failureCount: number;
  lastUsed: string;
  usageCount: number;
}

export interface ProcedureRetrievalResult {
  procedures: ProcedureChunk[];
  bestMatch: ProcedureChunk | null;
  matchScore: number;
}

export class ProceduralMemory {
  private procedures: Map<string, ProcedureChunk> = new Map();
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'procedural_memory');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async storeProcedure(chunk: Omit<ProcedureChunk, 'id'>): Promise<string> {
    const id = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullChunk: ProcedureChunk = {
      ...chunk,
      id,
      lastUsed: new Date().toISOString(),
    };

    this.procedures.set(id, fullChunk);
    this.persistProcedure(fullChunk);

    return id;
  }

  async retrieveProcedure(situation: string): Promise<ProcedureRetrievalResult> {
    const candidates: ProcedureChunk[] = [];

    for (const [, procedure] of this.procedures) {
      const similarity = this.computeSimilarity(situation, procedure.situation);
      if (similarity > 0.3) {
        candidates.push({ ...procedure, successCount: procedure.successCount, failureCount: procedure.failureCount, lastUsed: procedure.lastUsed, usageCount: procedure.usageCount, parameters: procedure.parameters, id: procedure.id, action: procedure.action });
      }
    }

    candidates.sort((a, b) => {
      const scoreA = this.getProcedureScore(a);
      const scoreB = this.getProcedureScore(b);
      return scoreB - scoreA;
    });

    const bestMatch = candidates.length > 0 ? candidates[0] : null;
    const matchScore = bestMatch ? this.getProcedureScore(bestMatch) : 0;

    return {
      procedures: candidates.slice(0, 10),
      bestMatch,
      matchScore,
    };
  }

  async updateProcedure(
    procedureId: string,
    feedback: { success: boolean; outcome: any }
  ): Promise<boolean> {
    const procedure = this.procedures.get(procedureId);
    if (!procedure) return false;

    if (feedback.success) {
      procedure.successCount++;
    } else {
      procedure.failureCount++;
    }

    procedure.usageCount++;
    procedure.lastUsed = new Date().toISOString();

    this.procedures.set(procedureId, procedure);
    this.persistProcedure(procedure);

    return true;
  }

  private computeSimilarity(situationA: string, situationB: string): number {
    const wordsA = new Set(situationA.toLowerCase().split(/\s+/));
    const wordsB = new Set(situationB.toLowerCase().split(/\s+/));

    let intersection = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) intersection++;
    }

    const union = wordsA.size + wordsB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  private getProcedureScore(procedure: ProcedureChunk): number {
    const total = procedure.successCount + procedure.failureCount;
    if (total === 0) return 0.5;
    const successRate = procedure.successCount / total;
    const usageBonus = Math.min(procedure.usageCount / 100, 0.2);
    return successRate + usageBonus;
  }

  private persistProcedure(procedure: ProcedureChunk): void {
    try {
      const filename = path.join(this.dataDir, `${procedure.id}.json`);
      fs.writeFileSync(filename, JSON.stringify(procedure, null, 2));
    } catch (err) {
      console.error('[ProceduralMemory] Failed to persist procedure:', err);
    }
  }

  getProcedureCount(): number {
    return this.procedures.size;
  }

  getProcedure(id: string): ProcedureChunk | undefined {
    return this.procedures.get(id);
  }
}

export default ProceduralMemory;