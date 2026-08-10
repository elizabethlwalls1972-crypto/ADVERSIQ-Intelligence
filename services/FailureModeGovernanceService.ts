
type FsModule = {
  existsSync: (path: string) => boolean;
  mkdirSync: (path: string, options?: { recursive?: boolean }) => void;
  writeFileSync: (path: string, contents: string) => void;
};

type PathModule = {
  join: (...segments: string[]) => string;
};

export interface FailureMode { id: string; mode: string; frequency: number; severity: 'low'|'medium'|'high'|'critical'; mitigations: string[]; }

export class FailureModeGovernanceService {
  private modes: Map<string, FailureMode> = new Map();
  private dir: string | null = null;

  constructor() {
    this.dir = this.resolvePersistenceDir();
    this.seed();
  }

  private seed() {
    const defaults: FailureMode[] = [
      { id: 'fm_overconf', mode: 'Overconfidence in limited data', frequency: 0, severity: 'high', mitigations: ['require diverse evidence'] },
      { id: 'fm_sunk', mode: 'Sunk cost fallacy', frequency: 0, severity: 'medium', mitigations: ['evaluate future value only'] },
    ];
    for (const d of defaults) this.modes.set(d.id, d);
  }

  private resolvePersistenceDir(): string | null {
    if (typeof window !== 'undefined') return null;

    const g = globalThis as typeof globalThis & { process?: { cwd?: () => string } };
    const cwd = g.process?.cwd?.();
    if (!cwd) return null;

    const pathMod = this.loadNodeModule<PathModule>('node:path') ?? this.loadNodeModule<PathModule>('path');
    if (!pathMod) return null;

    return pathMod.join(cwd, 'data', 'lida', 'failure_patterns');
  }

  private loadNodeModule<T>(moduleName: string): T | null {
    if (typeof window !== 'undefined') return null;

    try {
      const requireFn = new Function('moduleName', 'return require(moduleName);') as (moduleName: string) => T;
      return requireFn(moduleName);
    } catch {
      return null;
    }
  }

  register(m: FailureMode) { this.modes.set(m.id, m); this.persist(); }

  assess(plan: any): { risk: number; triggered: FailureMode[] } {
    const triggered = Array.from(this.modes.values()).filter(m => JSON.stringify(plan).toLowerCase().includes(m.mode.split(' ')[0].toLowerCase()));
    const risk = Math.min(1, triggered.reduce((s, m) => s + (m.severity === 'critical' ? 0.9 : m.severity === 'high' ? 0.7 : m.severity === 'medium' ? 0.4 : 0.2), 0));
    return { risk, triggered };
  }

  private persist() {
    if (!this.dir) return;

    try {
      const fsMod = this.loadNodeModule<FsModule>('node:fs') ?? this.loadNodeModule<FsModule>('fs');
      const pathMod = this.loadNodeModule<PathModule>('node:path') ?? this.loadNodeModule<PathModule>('path');

      if (!fsMod || !pathMod) return;

      if (!fsMod.existsSync(this.dir)) {
        fsMod.mkdirSync(this.dir, { recursive: true });
      }
      fsMod.writeFileSync(pathMod.join(this.dir, 'fm_governance.json'), JSON.stringify(Array.from(this.modes.values()), null, 2));
    } catch {
      // Browser-safe no-op; persistence is optional for client-only execution.
    }
  }
}

export default FailureModeGovernanceService;
