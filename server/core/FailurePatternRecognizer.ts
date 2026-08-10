import * as fs from 'fs';
import * as path from 'path';

export interface FailurePattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  domain: string;
  triggers: string[];
  consequences: string[];
  mitigations: string[];
}

export interface FailureCase {
  id: string;
  timestamp: string;
  domain: string;
  action: string;
  expectedOutcome: string;
  actualOutcome: string;
  failureMode: string;
  lesson: string;
}

export interface ActionRecommendation {
  action: string;
  risk: number;
  recommendation: 'avoid' | 'mitigate' | 'proceed';
  reason: string;
}

export class FailurePatternRecognizer {
  private patterns: Map<string, FailurePattern> = new Map();
  private failureCases: Map<string, FailureCase> = new Map();
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'failure_patterns');
    this.ensureDataDir();
    this.seedDefaultPatterns();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private seedDefaultPatterns(): void {
    const defaults: FailurePattern[] = [
      {
        id: 'pattern_overconfidence',
        name: 'Overconfidence Bias',
        description: 'Overestimating the likelihood of success based on limited positive outcomes',
        frequency: 0,
        severity: 'high',
        domain: 'general',
        triggers: ['recent success', 'high confidence', 'limited data'],
        consequences: ['underestimation of risk', 'insufficient contingency planning', 'unexpected failure'],
        mitigations: ['require diverse evidence', 'stress-test assumptions', 'seek dissenting opinions'],
      },
      {
        id: 'pattern_sunk_cost',
        name: 'Sunk Cost Fallacy',
        description: 'Continuing a failing strategy because of invested resources rather than future value',
        frequency: 0,
        severity: 'medium',
        domain: 'general',
        triggers: ['already invested', 'cannot abandon', 'past commitment'],
        consequences: ['wasted resources', 'missed opportunities', 'compounding losses'],
        mitigations: ['evaluate future value only', 'set clear exit criteria', 'separate past from future'],
      },
      {
        id: 'pattern_confirmation',
        name: 'Confirmation Bias',
        description: 'Seeking or interpreting information that confirms pre-existing beliefs',
        frequency: 0,
        severity: 'medium',
        domain: 'general',
        triggers: ['strong prior belief', 'selective data gathering', 'echo chamber'],
        consequences: ['poor decision quality', 'missed risks', 'suboptimal outcomes'],
        mitigations: ['seek disconfirming evidence', 'use diverse data sources', 'blind analysis'],
      },
    ];

    for (const pattern of defaults) {
      this.patterns.set(pattern.id, pattern);
    }
  }

  async detectFailurePatterns(history: any[]): Promise<FailurePattern[]> {
    const detected: FailurePattern[] = [];

    for (const [, pattern] of this.patterns) {
      for (const entry of history) {
        if (this.matchesTrigger(entry, pattern.triggers)) {
          detected.push(pattern);
          break;
        }
      }
    }

    return detected;
  }

  async getFailureRisk(plan: any): Promise<{ risk: number; patterns: FailurePattern[]; mitigations: string[] }> {
    const actions = plan.actions || plan.steps || plan.tasks || [];
    const matchedPatterns: FailurePattern[] = [];
    const allMitigations: string[] = [];
    let totalRisk = 0;

    for (const action of actions) {
      for (const [, pattern] of this.patterns) {
        if (this.matchesTrigger(action, pattern.triggers)) {
          if (!matchedPatterns.find(p => p.id === pattern.id)) {
            matchedPatterns.push(pattern);
            totalRisk += pattern.severity === 'critical' ? 0.9 : pattern.severity === 'high' ? 0.7 : pattern.severity === 'medium' ? 0.4 : 0.2;
            allMitigations.push(...pattern.mitigations);
          }
        }
      }
    }

    return {
      risk: Math.min(totalRisk, 1.0),
      patterns: matchedPatterns,
      mitigations: [...new Set(allMitigations)],
    };
  }

  async addFailureCase(failureCase: Omit<FailureCase, 'id' | 'timestamp'>): Promise<string> {
    const id = `failure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullCase: FailureCase = {
      ...failureCase,
      id,
      timestamp: new Date().toISOString(),
    };

    this.failureCases.set(id, fullCase);
    this.persistFailureCase(fullCase);

    await this.updatePatternFromCase(fullCase);

    return id;
  }

  async getPatternsForDomain(domain: string): Promise<FailurePattern[]> {
    return Array.from(this.patterns.values())
      .filter(p => p.domain === domain || p.domain === 'general')
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  async avoidKnownFailures(availableActions: any[], context: any): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = [];

    for (const action of availableActions) {
      const actionStr = typeof action === 'string' ? action : JSON.stringify(action);
      let risk = 0;
      const matchedPatterns: string[] = [];

      for (const [, pattern] of this.patterns) {
        if (pattern.triggers.some(t => actionStr.toLowerCase().includes(t.toLowerCase()))) {
          risk += pattern.severity === 'critical' ? 0.3 : pattern.severity === 'high' ? 0.2 : pattern.severity === 'medium' ? 0.1 : 0.05;
          matchedPatterns.push(pattern.name);
        }
      }

      let recommendation: 'avoid' | 'mitigate' | 'proceed';
      if (risk > 0.5) {
        recommendation = 'avoid';
      } else if (risk > 0.2) {
        recommendation = 'mitigate';
      } else {
        recommendation = 'proceed';
      }

      recommendations.push({
        action: actionStr.substring(0, 100),
        risk: Math.min(risk, 1.0),
        recommendation,
        reason: matchedPatterns.length > 0 ? `Matches patterns: ${matchedPatterns.join(', ')}` : 'No known failure patterns matched',
      });
    }

    recommendations.sort((a, b) => a.risk - b.risk);
    return recommendations;
  }

  private matchesTrigger(entry: any, triggers: string[]): boolean {
    const entryStr = JSON.stringify(entry).toLowerCase();
    return triggers.some(t => entryStr.includes(t.toLowerCase()));
  }

  private async updatePatternFromCase(caseData: FailureCase): Promise<void> {
    for (const [, pattern] of this.patterns) {
      if (pattern.triggers.some(t => caseData.failureMode.toLowerCase().includes(t.toLowerCase()))) {
        pattern.frequency++;
        if (caseData.failureMode === pattern.name) {
          pattern.severity = pattern.severity === 'low' ? 'medium' : pattern.severity === 'medium' ? 'high' : 'critical';
        }
      }
    }
  }

  private persistFailureCase(caseData: FailureCase): void {
    try {
      const filename = path.join(this.dataDir, `${caseData.id}.json`);
      fs.writeFileSync(filename, JSON.stringify(caseData, null, 2));
    } catch (err) {
      console.error('[FailurePatternRecognizer] Failed to persist case:', err);
    }
  }

  getPatternCount(): number {
    return this.patterns.size;
  }

  getFailureCaseCount(): number {
    return this.failureCases.size;
  }
}

export default FailurePatternRecognizer;