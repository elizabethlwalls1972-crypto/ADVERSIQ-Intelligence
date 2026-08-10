import * as fs from 'fs';
import * as path from 'path';

export interface ParsedInput {
  id: string;
  timestamp: string;
  format: 'text' | 'json' | 'structured' | 'unknown';
  language: string;
  domain: string;
  urgency: number;
  intent: string;
  entities: string[];
  constraints: string[];
  rawContent: any;
  confidence: number;
}

export interface UniversalInputResult {
  parsed: ParsedInput;
  extractedIntent: string;
  extractedEntities: string[];
  extractedConstraints: string[];
  domain: string;
  language: string;
  urgency: number;
  readyForProcessing: boolean;
}

export class UniversalInputProcessor {
  private processedInputs: Map<string, ParsedInput> = new Map();
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'input_processor');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async processInput(input: any): Promise<UniversalInputResult> {
    const id = `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const format = this.detectFormat(input);
    const language = this.detectLanguage(input);
    const domain = this.detectDomain(input);
    const urgency = this.computeUrgency(input);
    const intent = this.extractIntent(input);
    const entities = this.extractEntities(input);
    const constraints = this.extractConstraints(input);
    const confidence = this.computeConfidence(format, language, domain);

    const parsed: ParsedInput = {
      id,
      timestamp,
      format,
      language,
      domain,
      urgency,
      intent,
      entities,
      constraints,
      rawContent: input,
      confidence,
    };

    this.processedInputs.set(id, parsed);
    this.persistInput(parsed);

    return {
      parsed,
      extractedIntent: intent,
      extractedEntities: entities,
      extractedConstraints: constraints,
      domain,
      language,
      urgency,
      readyForProcessing: confidence > 0.3,
    };
  }

  private detectFormat(input: any): string {
    if (typeof input === 'string') {
      try {
        JSON.parse(input);
        return 'json';
      } catch {
        return 'text';
      }
    }
    if (typeof input === 'object' && input !== null) {
      return 'structured';
    }
    return 'unknown';
  }

  private detectLanguage(input: any): string {
    if (typeof input !== 'string') return 'unknown';

    const text = input.toLowerCase();
    const indicators = {
      english: ['the', 'is', 'are', 'was', 'were', 'of', 'and', 'to', 'in', 'for'],
      spanish: ['el', 'la', 'es', 'son', 'de', 'y', 'en', 'para', 'con'],
      french: ['le', 'la', 'est', 'sont', 'de', 'et', 'dans', 'pour', 'avec'],
      german: ['der', 'die', 'ist', 'sind', 'von', 'und', 'in', 'für', 'mit'],
    };

    let bestLanguage = 'unknown';
    let bestScore = 0;

    for (const [lang, words] of Object.entries(indicators)) {
      let score = 0;
      for (const word of words) {
        if (text.includes(word)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestLanguage = lang;
      }
    }

    return bestLanguage;
  }

  private detectDomain(input: any): string {
    if (typeof input !== 'string') return 'general';

    const text = input.toLowerCase();
    const domainKeywords: Record<string, string[]> = {
      cybersecurity: ['threat', 'vulnerability', 'exploit', 'attack', 'defense', 'security', 'firewall', 'encryption'],
      economics: ['market', 'investment', 'revenue', 'profit', 'cost', 'budget', 'financial', 'trade'],
      healthcare: ['patient', 'medical', 'health', 'treatment', 'diagnosis', 'hospital', 'clinical'],
      education: ['student', 'learning', 'course', 'curriculum', 'academic', 'school', 'university'],
      governance: ['policy', 'regulation', 'government', 'legislation', 'compliance', 'authority'],
      technology: ['software', 'hardware', 'system', 'network', 'data', 'algorithm', 'model'],
      environment: ['climate', 'pollution', 'sustainability', 'ecosystem', 'conservation', 'emission'],
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) return domain;
      }
    }

    return 'general';
  }

  private computeUrgency(input: any): number {
    if (typeof input !== 'string') return 0.5;

    const text = input.toLowerCase();
    let urgency = 0.5;

    const urgentWords = ['urgent', 'critical', 'immediate', 'emergency', 'asap', 'now', 'crisis'];
    for (const word of urgentWords) {
      if (text.includes(word)) urgency += 0.15;
    }

    const lowUrgencyWords = ['later', 'whenever', 'someday', 'eventually', 'when convenient'];
    for (const word of lowUrgencyWords) {
      if (text.includes(word)) urgency -= 0.1;
    }

    return Math.min(Math.max(urgency, 0), 1);
  }

  private extractIntent(input: any): string {
    if (typeof input !== 'string') return 'analyze';

    const text = input.toLowerCase();
    const intentPatterns: Record<string, string[]> = {
      solve: ['solve', 'fix', 'resolve', 'address', 'tackle'],
      analyze: ['analyze', 'examine', 'evaluate', 'assess', 'review'],
      predict: ['predict', 'forecast', 'project', 'estimate', 'anticipate'],
      recommend: ['recommend', 'suggest', 'advise', 'propose', 'advise'],
      compare: ['compare', 'contrast', 'differentiate', 'evaluate'],
      learn: ['learn', 'understand', 'explore', 'discover', 'investigate'],
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) return intent;
      }
    }

    return 'analyze';
  }

  private extractEntities(input: any): string[] {
    if (typeof input !== 'string') return [];

    const text = input.toLowerCase();
    const entities: string[] = [];

    const patterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
      /\b[A-Z]{2,}\b/g,
      /\b\d{4}\b/g,
      /\b(?:USD|EUR|GBP|CNY|JPY)\s*[\d,]+\b/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    }

    return [...new Set(entities)];
  }

  private extractConstraints(input: any): string[] {
    if (typeof input !== 'string') return [];

    const text = input.toLowerCase();
    const constraints: string[] = [];

    const constraintPatterns = [
      /must (?:be|not be|include|exclude|contain|not contain)/g,
      /should (?:be|not be|include|exclude)/g,
      /cannot|can't|unable to|impossible/g,
      /within|before|after|during|by|no later than/g,
      /maximum|minimum|at least|at most|no more than|no less than/g,
    ];

    for (const pattern of constraintPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        constraints.push(...matches);
      }
    }

    return constraints;
  }

  private computeConfidence(format: string, language: string, domain: string): number {
    let confidence = 0.5;
    if (format !== 'unknown') confidence += 0.15;
    if (language !== 'unknown') confidence += 0.15;
    if (domain !== 'general') confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  private persistInput(parsed: ParsedInput): void {
    try {
      const filename = path.join(this.dataDir, `${parsed.id}.json`);
      fs.writeFileSync(filename, JSON.stringify(parsed, null, 2));
    } catch (err) {
      console.error('[UniversalInputProcessor] Failed to persist input:', err);
    }
  }

  getProcessedCount(): number {
    return this.processedInputs.size;
  }
}

export default UniversalInputProcessor;