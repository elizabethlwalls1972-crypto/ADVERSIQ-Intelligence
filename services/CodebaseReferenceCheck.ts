export interface CodebaseAuditEvidence {
  filePath: string;
  relevanceScore: number;
  matchedInContext: boolean;
  basis: string;
}

export interface CodebaseAuditResult {
  totalFiles: number;
  filesReviewed: number;
  matchedFiles: number;
  coveragePct: number;
  verdict: 'pass' | 'partial' | 'review';
  findings: string[];
  evidence: CodebaseAuditEvidence[];
}

const relevantDirectories = [
  '/services/',
  '/services/agents/',
  '/services/algorithms/',
  '/services/routes/',
  '/services/autonomy/'
];

const domainKeywords = [
  'policy', 'risk', 'finance', 'governance', 'compliance', 'partner',
  'market', 'sector', 'project', 'logistics', 'operations', 'intelligence',
  'letter', 'proposal', 'case study', 'report', 'strategy', 'analysis'
];

// Converts a module path to a simplified tag set
function collectPathTags(filePath: string): string[] {
  const normalized = filePath.toLowerCase();
  return domainKeywords.filter((k) => normalized.includes(k.replace(' ', '-')) || normalized.includes(k));
}

type CodebaseAuditInput = Record<string, unknown> & {
  problemStatement?: string;
  strategicIntent?: string[];
  additionalContext?: string;
  currentMatter?: string;
  organizationName?: string;
  industry?: string[];
  targetAudience?: string;
};

function stringFromField(field: unknown): string {
  if (Array.isArray(field)) {
    return field.filter((x): x is string => typeof x === 'string').join(' ');
  }
  if (typeof field === 'string') {
    return field;
  }
  return '';
}

export function evaluateCodebaseCoverage(params: CodebaseAuditInput): CodebaseAuditResult {
  const sourceText = [
    stringFromField(params.problemStatement),
    stringFromField(params.strategicIntent),
    stringFromField(params.additionalContext),
    stringFromField(params.currentMatter),
    stringFromField(params.organizationName),
    stringFromField(params.industry),
    stringFromField(params.targetAudience),
  ].filter(Boolean).join(' ').toLowerCase();

  // Dynamically capture known source files in relevant folders (if supported by build tooling).
  type ViteImportMeta = { globEager?: (pattern: string) => Record<string, unknown> };
  const viteMeta = import.meta as unknown as ViteImportMeta;
  const rawModuleMap = viteMeta.globEager ? viteMeta.globEager('../services/**/*.{ts,tsx,js,jsx}') : {};
  const managedModules = Object.keys(rawModuleMap)
    .map((path) => path.replace(/^\.{1}/, ''))
    .filter((path) => relevantDirectories.some((dir) => path.includes(dir)));

  const evidence: CodebaseAuditEvidence[] = managedModules.map((filePath) => {
    const tags = collectPathTags(filePath);
    const matchedInContext = tags.some((tag) => sourceText.includes(tag));
    return {
      filePath,
      relevanceScore: Math.min(100, Math.max(0, tags.length * 20)),
      matchedInContext,
      basis: matchedInContext
        ? `Matched by context keywords: ${tags.join(', ')}`
        : tags.length > 0
          ? `Potentially relevant dispatch points: ${tags.join(', ')}`
          : 'No direct keyword match',
    };
  });

  const matchedFiles = evidence.filter((e) => e.matchedInContext).length;
  const filesReviewed = evidence.length;
  const coveragePct = filesReviewed > 0 ? Math.round((matchedFiles / filesReviewed) * 100) : 0;
  let verdict: CodebaseAuditResult['verdict'] = 'review';
  if (coveragePct >= 80) verdict = 'pass';
  else if (coveragePct >= 45) verdict = 'partial';

  const findings: string[] = [
    `Found ${filesReviewed} relevant code modules under services/agents/algorithms/routes/autonomy.`,
    `Matched ${matchedFiles} modules to input context (${coveragePct}%).`,
  ];
  if (coveragePct < 45) {
    findings.push('Coverage low: ensure additional engine or algorithm entries are included for this request.');
  } else if (coveragePct < 80) {
    findings.push('Partial coverage: consider adding explicit agentic rules or upgrading to full NSIL module set.');
  } else {
    findings.push('Excellent coverage: the brain currently routes to the high-priority codebase modules.');
  }

  return {
    totalFiles: filesReviewed,
    filesReviewed,
    matchedFiles,
    coveragePct,
    verdict,
    findings,
    evidence,
  };
}
