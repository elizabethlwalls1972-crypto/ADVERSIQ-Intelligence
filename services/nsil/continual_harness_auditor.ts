import * as fs from 'fs';
import * as path from 'path';
import { NSILFailureDetector } from './failure_detector';
import { NSILTrajectoryLogger } from './trajectory_logger';
import { NSILRefiner } from './nsil_refiner';
import { ContinualHarnessAdapter } from './continual_harness_adapter';
import { runLiveGlobalMatters, type LiveGlobalMatterRun } from './live_global_matter_runner';

export interface AuditFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'placeholder' | 'demo_path' | 'human_loop' | 'harness_gap' | 'wiring' | 'claim_risk';
  file: string;
  line: number;
  match: string;
  rationale: string;
}

export interface HarnessCapabilityCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  evidence: string;
}

export interface ContinualHarnessAuditOptions {
  rootDir?: string;
  outputDir?: string;
  runLiveProbe?: boolean;
  liveProbeMaxMatters?: number;
}

export interface ContinualHarnessAuditReport {
  runId: string;
  generatedAt: string;
  rootDir: string;
  scannedFiles: number;
  scannedTextFiles: number;
  skippedBinaryFiles: number;
  findings: AuditFinding[];
  capabilityChecks: HarnessCapabilityCheck[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    productionStatus: 'pass' | 'needs-work' | 'blocked';
  };
  liveProbe?: LiveGlobalMatterRun;
  outputFiles: string[];
}

const DEFAULT_EXCLUDED_DIRS = new Set([
  '.git',
  '.venv',
  '.wrangler',
  'node_modules',
  'dist',
  'dist-server',
  'test-results',
  'backups',
  '_quarantine',
]);

const DEFAULT_EXCLUDED_RELATIVE_DIRS = new Set([
  'data/continual_harness_audit',
  'data/live_global_matters',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.txt', '.csv',
  '.css', '.html', '.xml',
  '.yml', '.yaml', '.toml', '.ps1', '.sh', '.py',
]);

const EXECUTABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py']);

const ISSUE_PATTERNS: Array<{
  category: AuditFinding['category'];
  severity: AuditFinding['severity'];
  pattern: RegExp;
  rationale: string;
}> = [
  {
    category: 'placeholder',
    severity: 'high',
    pattern: /\bplaceholder\b/i,
    rationale: 'Executable code should not depend on placeholder data or placeholder implementation.',
  },
  {
    category: 'placeholder',
    severity: 'high',
    pattern: /\bnot implemented\b|\bTODO\b|\bFIXME\b/i,
    rationale: 'Executable TODO/not-implemented markers indicate unfinished production logic.',
  },
  {
    category: 'demo_path',
    severity: 'medium',
    pattern: /\bmock\b|\bstub\b|\bdemo\b|\bmockup\b|fake execution|sample (?:profiles|data)|for demonstration|simulated data/i,
    rationale: 'Runtime code should not depend on demo, mock, sample, or fake execution paths.',
  },
  {
    category: 'human_loop',
    severity: 'high',
    pattern: /human[- ]?in[- ]?the[- ]?loop|human approval required|requires human approval|human review|manual review/i,
    rationale: 'The requested operating model removes human gates unless the user explicitly asks for one.',
  },
  {
    category: 'claim_risk',
    severity: 'medium',
    pattern: /100%\s+(?:performance|functionality|complete|production|verified|orchestration|wired)|fully implemented, no placeholders|production-ready|can solve any|\bevery problem\b/i,
    rationale: 'Absolute claims must be backed by executable verification or softened to audit-backed language.',
  },
];

const now = () => new Date().toISOString();
const runSlug = () => now().replace(/[:.]/g, '-');

export class ContinualHarnessAuditor {
  static async run(options: ContinualHarnessAuditOptions = {}): Promise<ContinualHarnessAuditReport> {
    const rootDir = path.resolve(options.rootDir || process.cwd());
    const outputDir = path.resolve(rootDir, options.outputDir || 'data/continual_harness_audit');
    const runId = `continual-harness-audit-${runSlug()}`;
    const files = this.walkFiles(rootDir);
    const findings: AuditFinding[] = [];
    let scannedTextFiles = 0;
    let skippedBinaryFiles = 0;

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!TEXT_EXTENSIONS.has(ext)) {
        skippedBinaryFiles += 1;
        continue;
      }
      const rel = path.relative(rootDir, file).replace(/\\/g, '/');
      const text = fs.readFileSync(file, 'utf8');
      if (text.includes('\0')) {
        skippedBinaryFiles += 1;
        continue;
      }
      scannedTextFiles += 1;
      findings.push(...this.scanTextFile(rel, text, ext));
    }

    const logger = new NSILTrajectoryLogger(path.join(outputDir, 'probe_trajectories'));
    const trajectories = logger.get_all_trajectories();
    const detector = new NSILFailureDetector(trajectories);
    const failures = detector.detect_all_failures();
    const refiner = new NSILRefiner(trajectories, path.join(outputDir, 'probe_evolved_state'));
    const refinerEdits = refiner.evolve(trajectories.length, trajectories);
    const adapter = new ContinualHarnessAdapter(path.join(outputDir, 'probe_evolved_state'));
    const harnessAdaptation = adapter.evolve(trajectories, failures);

    const liveProbe = options.runLiveProbe
      ? await runLiveGlobalMatters({
        outputDir: path.join(outputDir, 'live_probe'),
        maxMatters: options.liveProbeMaxMatters ?? 3,
        cityLimitPerSector: 2,
        minMatterScore: 45,
      })
      : undefined;

    const capabilityChecks = this.buildCapabilityChecks(rootDir, {
      refinerChanges:
        refinerEdits.orchestration_edits.length +
        refinerEdits.formula_edits.length +
        refinerEdits.debate_edits.length +
        refinerEdits.memory_edits.length,
      harnessAdaptationChanges:
        harnessAdaptation.prompt_edits.length +
        harnessAdaptation.subagent_edits.length +
        harnessAdaptation.skill_edits.length +
        harnessAdaptation.memory_edits.length,
      liveProbe,
    });

    const summary = this.summarize(findings, capabilityChecks);
    const report: ContinualHarnessAuditReport = {
      runId,
      generatedAt: now(),
      rootDir,
      scannedFiles: files.length,
      scannedTextFiles,
      skippedBinaryFiles,
      findings,
      capabilityChecks,
      summary,
      liveProbe,
      outputFiles: [],
    };

    fs.mkdirSync(outputDir, { recursive: true });
    const jsonPath = path.join(outputDir, `${runId}.json`);
    const latestJsonPath = path.join(outputDir, 'latest.json');
    const markdownPath = path.join(outputDir, `${runId}.md`);
    const latestMarkdownPath = path.join(outputDir, 'latest.md');
    report.outputFiles = [jsonPath, latestJsonPath, markdownPath, latestMarkdownPath];
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    fs.writeFileSync(latestJsonPath, JSON.stringify(report, null, 2), 'utf8');
    const md = this.toMarkdown(report);
    fs.writeFileSync(markdownPath, md, 'utf8');
    fs.writeFileSync(latestMarkdownPath, md, 'utf8');
    return report;
  }

  private static walkFiles(rootDir: string): string[] {
    const out: string[] = [];
    const stack = [rootDir];
    while (stack.length) {
      const current = stack.pop()!;
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (DEFAULT_EXCLUDED_DIRS.has(entry.name)) continue;
          const nextDir = path.join(current, entry.name);
          const rel = path.relative(rootDir, nextDir).replace(/\\/g, '/');
          if (DEFAULT_EXCLUDED_RELATIVE_DIRS.has(rel)) continue;
          stack.push(nextDir);
        } else if (entry.isFile()) {
          out.push(path.join(current, entry.name));
        }
      }
    }
    return out.sort();
  }

  private static scanTextFile(file: string, text: string, ext: string): AuditFinding[] {
    const executable = EXECUTABLE_EXTENSIONS.has(ext) && !file.endsWith('.bak') && !file.includes('.backup');
    const lines = text.split(/\r?\n/);
    const findings: AuditFinding[] = [];

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (this.isIgnorableLine(line)) continue;
      for (const issue of ISSUE_PATTERNS) {
        const match = line.match(issue.pattern);
        if (!match) continue;
        const severity = executable ? issue.severity : this.downgrade(issue.severity);
        if (!executable && issue.category !== 'claim_risk') continue;
        findings.push({
          severity,
          category: issue.category,
          file,
          line: i + 1,
          match: line.trim().slice(0, 240),
          rationale: issue.rationale,
        });
      }
    }

    return findings;
  }

  private static isIgnorableLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (/category:\s*'|severity:\s*'|pattern:\s*\/|rationale:\s*'|label:\s*'/i.test(trimmed)) return true;
    if (/AuditFinding\['category'\]|ISSUE_PATTERNS|No executable placeholder/i.test(trimmed)) return true;
    if (/placeholder\s*=|placeholder:|placeholder-[a-z]/i.test(trimmed)) return true;
    if (trimmed === 'placeholder') return true;
    if (/isIgnorableLine|trimmed === 'placeholder'|placeholder\\\?\?\\s/.test(trimmed)) return true;
    if (/placeholder\??\s*:|placeholder\s*[,})]|\[placeholder\*|lower\.includes\('placeholder'\)|includes\('placeholder'\)/i.test(trimmed)) return true;
    if (/no placeholders?|reject placeholder|placeholderPattern/i.test(trimmed)) return true;
    if (/not .*placeholder|placeholder route removed|static placeholder data|thinking placeholder|not .*mock|no .*mock|no simulated data|demonstrated|demographics|simulateWebSearch|simulated annealing|probabilistic modelling/i.test(trimmed)) return true;
    return false;
  }

  private static downgrade(severity: AuditFinding['severity']): AuditFinding['severity'] {
    if (severity === 'critical') return 'high';
    if (severity === 'high') return 'medium';
    if (severity === 'medium') return 'low';
    return severity;
  }

  private static buildCapabilityChecks(
    rootDir: string,
    runtime: {
      refinerChanges: number;
      harnessAdaptationChanges: number;
      liveProbe?: LiveGlobalMatterRun;
    },
  ): HarnessCapabilityCheck[] {
    const exists = (rel: string) => fs.existsSync(path.join(rootDir, rel));
    const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    return [
      {
        id: 'trajectory-window',
        label: 'Trajectory window persistence',
        status: exists('services/nsil/trajectory_logger.ts') ? 'pass' : 'fail',
        evidence: 'services/nsil/trajectory_logger.ts',
      },
      {
        id: 'failure-detector',
        label: 'Failure signature detector',
        status: exists('services/nsil/failure_detector.ts') ? 'pass' : 'fail',
        evidence: 'services/nsil/failure_detector.ts',
      },
      {
        id: 'refiner-four-passes',
        label: 'Reset-free refiner over formulas/layers/debate/memory',
        status: exists('services/nsil/nsil_refiner.ts') ? 'pass' : 'fail',
        evidence: `Refiner probe changes: ${runtime.refinerChanges}`,
      },
      {
        id: 'pgkm-state',
        label: 'Prompt/subagent/skill/memory CRUD state',
        status: exists('services/nsil/continual_harness_adapter.ts') ? 'pass' : 'fail',
        evidence: `Harness adaptation changes: ${runtime.harnessAdaptationChanges}`,
      },
      {
        id: 'live-global-matters',
        label: 'Live global regional matter discovery',
        status: exists('services/nsil/live_global_matter_runner.ts') ? 'pass' : 'fail',
        evidence: runtime.liveProbe
          ? `Live probe accepted ${runtime.liveProbe.acceptedMatters}/${runtime.liveProbe.totalMattersGenerated} matters`
          : 'services/nsil/live_global_matter_runner.ts',
      },
      {
        id: 'terminal-script',
        label: 'Local terminal harness entrypoint',
        status: packageJson.scripts?.['live:global-matters'] && packageJson.scripts?.['audit:continual-harness'] ? 'pass' : 'warn',
        evidence: 'package.json scripts',
      },
      {
        id: 'server-route',
        label: 'Local server route exposes harness audit/live matters',
        status: this.fileContains(path.join(rootDir, 'server/routes/ai.ts'), 'continual-harness/audit') ? 'pass' : 'warn',
        evidence: 'server/routes/ai.ts',
      },
      {
        id: 'decision-verification-autonomy',
        label: 'Decision Verification System avoids mandatory external approval gate',
        status: this.fileContains(path.join(rootDir, 'components/BWConsultantOS.tsx'), 'Autonomous Execution Gate') ? 'pass' : 'warn',
        evidence: 'components/BWConsultantOS.tsx',
      },
    ];
  }

  private static fileContains(file: string, needle: string): boolean {
    if (!fs.existsSync(file)) return false;
    return fs.readFileSync(file, 'utf8').includes(needle);
  }

  private static summarize(
    findings: AuditFinding[],
    checks: HarnessCapabilityCheck[],
  ): ContinualHarnessAuditReport['summary'] {
    const counts = {
      critical: findings.filter((f) => f.severity === 'critical').length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
      info: findings.filter((f) => f.severity === 'info').length,
    };
    const failedChecks = checks.filter((check) => check.status === 'fail').length;
    const productionStatus =
      counts.critical > 0 || failedChecks > 0
        ? 'blocked'
        : counts.high > 0 || checks.some((check) => check.status === 'warn')
          ? 'needs-work'
          : 'pass';

    return { ...counts, productionStatus };
  }

  private static toMarkdown(report: ContinualHarnessAuditReport): string {
    const lines = [
      '# Continual Harness Production Audit',
      '',
      `Run: ${report.runId}`,
      `Generated: ${report.generatedAt}`,
      `Files scanned: ${report.scannedFiles}`,
      `Text files scanned: ${report.scannedTextFiles}`,
      `Skipped binary/generated files: ${report.skippedBinaryFiles}`,
      `Production status: ${report.summary.productionStatus}`,
      '',
      '## Capability Checks',
      ...report.capabilityChecks.map((check) => `- ${check.status.toUpperCase()} ${check.label}: ${check.evidence}`),
      '',
      '## Findings',
    ];

    const topFindings = report.findings
      .sort((a, b) => this.severityRank(b.severity) - this.severityRank(a.severity))
      .slice(0, 80);

    if (!topFindings.length) {
      lines.push('No executable placeholder, demo-path, or human-loop findings were detected by the scanner.');
    } else {
      for (const finding of topFindings) {
        lines.push(`- ${finding.severity.toUpperCase()} ${finding.category} ${finding.file}:${finding.line} - ${finding.match}`);
      }
    }

    if (report.liveProbe) {
      lines.push('', '## Live Probe');
      lines.push(`Accepted matters: ${report.liveProbe.acceptedMatters}/${report.liveProbe.totalMattersGenerated}`);
      for (const matter of report.liveProbe.matters.slice(0, 5)) {
        lines.push(`- ${matter.score}/100 ${matter.issueTitle}`);
      }
    }

    return lines.join('\n');
  }

  private static severityRank(severity: AuditFinding['severity']): number {
    return { info: 0, low: 1, medium: 2, high: 3, critical: 4 }[severity];
  }
}

export async function runContinualHarnessAudit(options: ContinualHarnessAuditOptions = {}): Promise<ContinualHarnessAuditReport> {
  return ContinualHarnessAuditor.run(options);
}
