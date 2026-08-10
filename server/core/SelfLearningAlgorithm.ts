import * as fs from 'fs';
import * as path from 'path';
import SelfAuditingKnowledge from './SelfAuditingKnowledge.js';
import HistoricalParallelMatcher from './HistoricalParallelMatcher.js';
import FailurePatternRecognizer from './FailurePatternRecognizer.js';
import LearningMechanisms from './LearningMechanisms.js';

export interface DataSource {
  type: 'file' | 'url' | 'structured' | 'api';
  location: string;
  format: 'json' | 'csv' | 'text' | 'yaml' | 'xml';
  lastRead?: string;
  recordCount?: number;
}

export interface DetectedIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  location: string;
  confidence: number;
  suggestedFix?: string;
  relatedPatterns: string[];
  timestamp: string;
}

export interface GeneratedSolution {
  id: string;
  issueId: string;
  approach: string;
  steps: string[];
  expectedOutcome: string;
  confidence: number;
  estimatedEffort: string;
  risks: string[];
  alternatives: string[];
  timestamp: string;
}

export interface LearningOutcome {
  solutionId: string;
  issueId: string;
  success: boolean;
  actualOutcome: string;
  lessonsLearned: string[];
  confidenceDelta: number;
  timestamp: string;
}

export interface SelfLearningReport {
  cycleNumber: number;
  timestamp: string;
  dataSourcesRead: number;
  issuesDetected: number;
  solutionsGenerated: number;
  outcomesRecorded: number;
  learningRate: number;
  topIssues: DetectedIssue[];
  topSolutions: GeneratedSolution[];
  knowledgeGaps: string[];
}

interface LearnedPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  lastSeen: string;
  solutions: string[];
}

interface DataSnapshot {
  id: string;
  source: DataSource;
  content: any;
  timestamp: string;
  issueCount: number;
  processed: boolean;
}

export class SelfLearningAlgorithm {
  private dataSources: Map<string, DataSource> = new Map();
  private dataSnapshots: DataSnapshot[] = [];
  private detectedIssues: DetectedIssue[] = [];
  private generatedSolutions: GeneratedSolution[] = [];
  private learningOutcomes: LearningOutcome[] = [];
  private learnedPatterns: Map<string, LearnedPattern> = new Map();
  private knowledgeGaps: string[] = [];
  private cycleNumber: number = 0;
  private dataDir: string;
  private selfAudit: SelfAuditingKnowledge;
  private historicalMatcher: HistoricalParallelMatcher;
  private failureRecognizer: FailurePatternRecognizer;
  private learning: LearningMechanisms;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'self-learning');
    this.ensureDataDir();
    this.selfAudit = new SelfAuditingKnowledge();
    this.historicalMatcher = new HistoricalParallelMatcher();
    this.failureRecognizer = new FailurePatternRecognizer();
    this.learning = new LearningMechanisms(this.dataDir);
  }

  addDataSource(source: DataSource): void {
    this.dataSources.set(source.location, source);
  }

  removeDataSource(location: string): boolean {
    return this.dataSources.delete(location);
  }

  getDataSource(location: string): DataSource | undefined {
    return this.dataSources.get(location);
  }

  listDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  async readData(source: DataSource): Promise<any> {
    let content: any = null;

    switch (source.type) {
      case 'file':
        content = this.readFromFile(source.location, source.format);
        break;
      case 'structured':
        content = this.parseStructured(source.location, source.format);
        break;
      case 'api':
        content = await this.fetchFromAPI(source.location);
        break;
      case 'url':
        content = await this.fetchFromURL(source.location, source.format);
        break;
      default:
        throw new Error(`Unknown data source type: ${source.type}`);
    }

    const snapshot: DataSnapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source,
      content,
      timestamp: new Date().toISOString(),
      issueCount: 0,
      processed: false,
    };

    this.dataSnapshots.push(snapshot);
    source.lastRead = new Date().toISOString();

    return content;
  }

  async readAllDataSources(): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    for (const [location, source] of this.dataSources) {
      try {
        const data = await this.readData(source);
        results.set(location, data);
      } catch (err) {
        console.error(`[SelfLearning] Failed to read data source ${location}:`, err);
      }
    }

    return results;
  }

  async detectIssues(data: any, context?: string): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];
    const dataStr = JSON.stringify(data);

    const structuralIssues = await this.detectStructuralIssues(data, context || '');
    issues.push(...structuralIssues);

    const patternIssues = await this.detectPatternIssues(data, context || '');
    issues.push(...patternIssues);

    const anomalyIssues = await this.detectAnomalies(data, context || '');
    issues.push(...anomalyIssues);

    const failureIssues = await this.detectFailurePatterns(data, context || '');
    issues.push(...failureIssues);

    for (const issue of issues) {
      this.detectedIssues.push(issue);
    }

    const snapshot = this.dataSnapshots[this.dataSnapshots.length - 1];
    if (snapshot) {
      snapshot.issueCount = issues.length;
      snapshot.processed = true;
    }

    return issues;
  }

  async generateSolutions(issues: DetectedIssue[]): Promise<GeneratedSolution[]> {
    const solutions: GeneratedSolution[] = [];

    for (const issue of issues) {
      const parallel = await this.historicalMatcher.findParallels({
        description: issue.description,
        category: issue.category,
        severity: issue.severity,
      });

      const solution = this.buildSolution(issue, parallel);
      solutions.push(solution);
      this.generatedSolutions.push(solution);

      this.learnedPatterns.set(issue.category, {
        pattern: issue.category,
        frequency: (this.learnedPatterns.get(issue.category)?.frequency || 0) + 1,
        successRate: 0.5,
        lastSeen: new Date().toISOString(),
        solutions: [solution.id],
      });
    }

    return solutions;
  }

  async recordOutcome(outcome: LearningOutcome): Promise<void> {
    this.learningOutcomes.push(outcome);

    const solution = this.generatedSolutions.find(s => s.id === outcome.solutionId);
    if (solution) {
      const pattern = this.learnedPatterns.get(solution.issue.category);
      if (pattern) {
        pattern.successRate = outcome.success
          ? Math.min(1, pattern.successRate + 0.1)
          : Math.max(0, pattern.successRate - 0.1);
      }
    }

    await this.learning.learnFromCycle({
      cycleNumber: this.cycleNumber,
      perception: { issue: outcome.issueId, outcome: outcome.success },
      attention: { dominantFeatures: [outcome.issueId] },
      consciousContent: { broadcastTargets: [outcome.issueId] },
      selectedAction: { name: outcome.success ? 'solution_applied' : 'solution_revised', utility: outcome.success ? 0.9 : 0.1 },
      episodeStored: true,
    });
  }

  async runSelfLearningCycle(data: any, context?: string): Promise<SelfLearningReport> {
    this.cycleNumber++;
    const timestamp = new Date().toISOString();

    const issues = await this.detectIssues(data, context);
    const solutions = await this.generateSolutions(issues);

    const knowledgeGaps = this.identifyKnowledgeGaps(issues, solutions);
    this.knowledgeGaps = knowledgeGaps;

    const learningRate = this.computeLearningRate();

    const report: SelfLearningReport = {
      cycleNumber: this.cycleNumber,
      timestamp,
      dataSourcesRead: this.dataSources.size,
      issuesDetected: issues.length,
      solutionsGenerated: solutions.length,
      outcomesRecorded: this.learningOutcomes.length,
      learningRate,
      topIssues: issues.slice(0, 5),
      topSolutions: solutions.slice(0, 5),
      knowledgeGaps,
    };

    this.persistReport(report);

    return report;
  }

  getDetectedIssues(): DetectedIssue[] {
    return [...this.detectedIssues];
  }

  getGeneratedSolutions(): GeneratedSolution[] {
    return [...this.generatedSolutions];
  }

  getLearningOutcomes(): LearningOutcome[] {
    return [...this.learningOutcomes];
  }

  getKnowledgeGaps(): string[] {
    return [...this.knowledgeGaps];
  }

  getLearnedPatterns(): LearnedPattern[] {
    return Array.from(this.learnedPatterns.values());
  }

  getCycleNumber(): number {
    return this.cycleNumber;
  }

  getStats(): {
    totalDataSources: number;
    totalSnapshots: number;
    totalIssues: number;
    totalSolutions: number;
    totalOutcomes: number;
    totalPatterns: number;
    learningRate: number;
  } {
    return {
      totalDataSources: this.dataSources.size,
      totalSnapshots: this.dataSnapshots.length,
      totalIssues: this.detectedIssues.length,
      totalSolutions: this.generatedSolutions.length,
      totalOutcomes: this.learningOutcomes.length,
      totalPatterns: this.learnedPatterns.size,
      learningRate: this.computeLearningRate(),
    };
  }

  private readFromFile(location: string, format: string): any {
    if (!fs.existsSync(location)) {
      throw new Error(`File not found: ${location}`);
    }

    const content = fs.readFileSync(location, 'utf-8');

    switch (format) {
      case 'json':
        return JSON.parse(content);
      case 'csv':
        return this.parseCSV(content);
      case 'text':
        return { text: content, lines: content.split('\n').length };
      case 'yaml':
        return this.parseYAML(content);
      case 'xml':
        return this.parseXML(content);
      default:
        return { raw: content };
    }
  }

  private parseStructured(location: string, format: string): any {
    try {
      const parsed = JSON.parse(location);
      return parsed;
    } catch {
      return { raw: location };
    }
  }

  private async fetchFromAPI(location: string): Promise<any> {
    const url = new URL(location);
    const protocol = url.protocol.replace(':', '');

    if (protocol === 'http' || protocol === 'https') {
      const fetch = await import('node-fetch').catch(() => null);
      if (fetch) {
        const response = await fetch.default(location);
        return response.json();
      }
    }

    return { error: `Cannot fetch from ${location}`, note: 'node-fetch not available' };
  }

  private async fetchFromURL(location: string, format: string): Promise<any> {
    return this.fetchFromAPI(location);
  }

  private async detectStructuralIssues(data: any, context: string): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];
    const dataStr = JSON.stringify(data);

    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        issues.push(await this.createIssue('structural', 'empty-object', 'Data object is empty', 'low', dataStr));
      }

      for (const key of keys) {
        if (data[key] === null || data[key] === undefined) {
          issues.push(await this.createIssue('structural', 'null-value', `Field "${key}" has null/undefined value`, 'medium', dataStr, key));
        }
      }
    }

    if (Array.isArray(data) && data.length === 0) {
      issues.push(await this.createIssue('structural', 'empty-array', 'Data array is empty', 'low', dataStr));
    }

    return issues;
  }

  private async detectPatternIssues(data: any, context: string): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];
    const dataStr = JSON.stringify(data);

    const patterns = [
      { regex: /error|fail|exception/i, name: 'error-pattern', severity: 'high', category: 'errors' },
      { regex: /timeout|slow|latency/i, name: 'performance-pattern', severity: 'medium', category: 'performance' },
      { regex: /deprecated|obsolete|legacy/i, name: 'deprecation-pattern', severity: 'medium', category: 'maintenance' },
      { regex: /security|vulnerability|exposure/i, name: 'security-pattern', severity: 'critical', category: 'security' },
      { regex: /missing|not found|unavailable/i, name: 'availability-pattern', severity: 'high', category: 'availability' },
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(dataStr)) {
        issues.push(await this.createIssue(pattern.category, pattern.name, `Detected ${pattern.name} in data`, pattern.severity, dataStr));
      }
    }

    return issues;
  }

  private async detectAnomalies(data: any, context: string): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];

    if (typeof data === 'object' && data !== null) {
      const numericValues = this.extractNumericValues(data);
      if (numericValues.length > 0) {
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const stdDev = Math.sqrt(
          numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length
        );

        for (const value of numericValues) {
          if (stdDev > 0 && Math.abs(value - mean) > 2 * stdDev) {
            issues.push(await this.createIssue('anomaly', 'statistical-outlier', `Value ${value} is a statistical outlier (mean: ${mean.toFixed(2)}, stdDev: ${stdDev.toFixed(2)})`, 'medium', JSON.stringify(data)));
          }
        }
      }
    }

    return issues;
  }

  private async detectFailurePatterns(data: any, context: string): Promise<DetectedIssue[]> {
    const issues: DetectedIssue[] = [];
    const dataStr = JSON.stringify(data);

    const failureRisk = await this.failureRecognizer.getFailureRisk({ data: dataStr });
    for (const pattern of failureRisk.patterns) {
      issues.push(await this.createIssue('failure', pattern.name, `Known failure pattern detected: ${pattern.name}`, pattern.severity === 'high' ? 'high' : 'medium', dataStr, undefined, pattern.mitigations));
    }

    return issues;
  }

  private buildSolution(issue: DetectedIssue, parallels: any): GeneratedSolution {
    const steps = this.generateSolutionSteps(issue, parallels);
    const alternatives = this.generateAlternatives(issue, parallels);

    return {
      id: `solution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issueId: issue.id,
      approach: parallels.length > 0 ? `Based on ${parallels.length} historical parallel(s)` : 'Novel approach based on self-audit',
      steps,
      expectedOutcome: `Resolve ${issue.category} issue: ${issue.description}`,
      confidence: Math.min(0.95, 0.5 + parallels.length * 0.1),
      estimatedEffort: this.estimateEffort(steps.length),
      risks: this.identifyRisks(issue, parallels),
      alternatives,
      timestamp: new Date().toISOString(),
    };
  }

  private generateSolutionSteps(issue: DetectedIssue, parallels: any): string[] {
    const steps: string[] = [];

    steps.push(`Analyze root cause of: ${issue.description}`);
    steps.push(`Gather additional context and data for the ${issue.category} issue`);

    if (parallels && parallels.length > 0) {
      steps.push(`Apply lessons from ${parallels.length} similar historical case(s)`);
      for (const parallel of parallels.slice(0, 3)) {
        if (parallel.lessons) {
          for (const lesson of parallel.lessons) {
            steps.push(`Apply lesson: ${lesson}`);
          }
        }
      }
    }

    steps.push(`Implement the solution with monitoring`);
    steps.push(`Verify the solution resolved the issue`);
    steps.push(`Document the outcome for future learning`);

    return steps;
  }

  private generateAlternatives(issue: DetectedIssue, parallels: any): string[] {
    const alternatives: string[] = [];

    alternatives.push(`Alternative approach: address root cause differently`);
    alternatives.push(`Alternative approach: implement workaround instead of fix`);
    alternatives.push(`Alternative approach: escalate to specialized team`);

    if (parallels && parallels.length > 0) {
      alternatives.push(`Alternative approach: follow the exact procedure from historical case`);
    }

    return alternatives;
  }

  private identifyKnowledgeGaps(issues: DetectedIssue[], solutions: GeneratedSolution[]): string[] {
    const gaps: string[] = [];

    const categories = new Set(issues.map(i => i.category));
    for (const category of categories) {
      const categorySolutions = solutions.filter(s => {
        const issue = this.detectedIssues.find(i => i.id === s.issueId);
        return issue && issue.category === category;
      });

      if (categorySolutions.length === 0) {
        gaps.push(`No solutions generated for category: ${category}`);
      }

      const lowConfidenceSolutions = categorySolutions.filter(s => s.confidence < 0.6);
      if (lowConfidenceSolutions.length > 0) {
        gaps.push(`Low confidence solutions for category: ${category} (${lowConfidenceSolutions.length} solutions below 60% confidence)`);
      }
    }

    if (issues.length > 0 && solutions.length === 0) {
      gaps.push('No solutions could be generated for detected issues');
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      gaps.push(`${criticalIssues.length} critical issue(s) require immediate attention`);
    }

    return gaps;
  }

  private computeLearningRate(): number {
    if (this.learningOutcomes.length === 0) return 0.5;

    const successfulOutcomes = this.learningOutcomes.filter(o => o.success).length;
    return successfulOutcomes / this.learningOutcomes.length;
  }

  private async createIssue(
    category: string,
    name: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    data: string,
    location?: string,
    relatedPatterns?: string[]
  ): Promise<DetectedIssue> {
    let confidence = 0.5;
    try {
      const audit = await this.selfAudit.auditKnowledge(description);
      confidence = audit.confidence;
    } catch {
      confidence = 0.5;
    }

    return {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      category,
      description,
      location: location || 'unknown',
      confidence,
      suggestedFix: relatedPatterns && relatedPatterns.length > 0 ? relatedPatterns[0] : undefined,
      relatedPatterns: relatedPatterns || [],
      timestamp: new Date().toISOString(),
    };
  }

  private extractNumericValues(data: any): number[] {
    const values: number[] = [];

    if (typeof data === 'number') {
      values.push(data);
    } else if (typeof data === 'object' && data !== null) {
      for (const value of Object.values(data)) {
        values.push(...this.extractNumericValues(value));
      }
    } else if (Array.isArray(data)) {
      for (const item of data) {
        values.push(...this.extractNumericValues(item));
      }
    }

    return values;
  }

  private parseCSV(content: string): any {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2) return { raw: content };

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, i) => { row[h] = values[i]; });
      return row;
    });

    return { headers, rows, count: rows.length };
  }

  private parseYAML(content: string): any {
    try {
      const lines = content.split('\n');
      const result: any = {};
      let currentKey = '';
      let currentArray: any[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        if (trimmed.startsWith('- ')) {
          currentArray.push(trimmed.substring(2));
        } else if (trimmed.includes(':')) {
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts.join(':').trim();
          if (value) {
            result[key.trim()] = value;
          } else {
            currentKey = key.trim();
            result[currentKey] = [];
            currentArray = [];
          }
        }
      }

      return result;
    } catch {
      return { raw: content };
    }
  }

  private parseXML(content: string): any {
    const result: any = {};
    const tagRegex = /<(\w+)[^>]*>([^<]*)<\/\1>/g;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      result[match[1]] = match[2];
    }

    return Object.keys(result).length > 0 ? result : { raw: content };
  }

  private persistReport(report: SelfLearningReport): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const filename = path.join(this.dataDir, `report_${report.cycleNumber}.json`);
      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    } catch (err) {
      console.error('[SelfLearning] Failed to persist report:', err);
    }
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private estimateEffort(stepCount: number): string {
    if (stepCount <= 2) return 'Low (minutes)';
    if (stepCount <= 4) return 'Medium (hours)';
    if (stepCount <= 6) return 'High (days)';
    return 'Very High (weeks)';
  }

  private identifyRisks(issue: DetectedIssue, parallels: any): string[] {
    const risks: string[] = [];

    if (issue.severity === 'critical') {
      risks.push('Critical severity - potential for significant impact');
    }

    if (parallels && parallels.length === 0) {
      risks.push('No historical parallels - solution is novel and untested');
    }

    risks.push('Solution may have unintended side effects');

    return risks;
  }
}

export default SelfLearningAlgorithm;