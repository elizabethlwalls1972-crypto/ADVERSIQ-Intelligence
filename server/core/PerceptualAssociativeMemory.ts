import * as fs from 'fs';
import * as path from 'path';

export interface Percept {
  id: string;
  timestamp: string;
  content: string;
  source: string;
  salience: number;
  features: Map<string, number>;
}

export interface AttentionWeight {
  feature: string;
  weight: number;
  priority: number;
}

export interface AttentionGatingResult {
  gatedPercepts: Percept[];
  attentionWeights: AttentionWeight[];
  totalSalience: number;
  dominantFeatures: string[];
}

export class PerceptualAssociativeMemory {
  private percepts: Map<string, Percept> = new Map();
  private attentionWeights: Map<string, number> = new Map();
  private salienceThreshold: number = 0.3;
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'lida', 'perceptual_memory');
    this.ensureDataDir();
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async storePercept(input: any): Promise<Percept> {
    const id = `percept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const content = typeof input === 'string' ? input : JSON.stringify(input);
    const features = this.extractFeatures(content);
    const salience = this.computeSalience(features);

    const percept: Percept = {
      id,
      timestamp: new Date().toISOString(),
      content,
      source: 'external',
      salience,
      features,
    };

    this.percepts.set(id, percept);
    this.updateAttentionWeights(features);
    this.persistPercept(percept);

    return percept;
  }

  async gatePercept(percept: Percept): Promise<AttentionGatingResult> {
    const weights = this.getAttentionWeights();
    const gatedPercepts: Percept[] = [];

    if (percept.salience >= this.salienceThreshold) {
      gatedPercepts.push(percept);
    }

    for (const [id, p] of this.percepts) {
      if (p.id !== percept.id && p.salience >= this.salienceThreshold) {
        gatedPercepts.push(p);
      }
    }

    const dominantFeatures = weights
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .map(w => w.feature);

    const totalSalience = gatedPercepts.reduce((sum, p) => sum + p.salience, 0);

    return {
      gatedPercepts,
      attentionWeights: weights,
      totalSalience,
      dominantFeatures,
    };
  }

  private extractFeatures(content: string): Map<string, number> {
    const features = new Map<string, number>();
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = new Map<string, number>();

    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }

    let maxCount = 0;
    for (const [, count] of wordCount) {
      if (count > maxCount) maxCount = count;
    }

    for (const [word, count] of wordCount) {
      features.set(word, count / Math.max(maxCount, 1));
    }

    return features;
  }

  private computeSalience(features: Map<string, number>): number {
    let totalWeight = 0;
    let featureCount = 0;

    for (const [, weight] of features) {
      totalWeight += weight;
      featureCount++;
    }

    return featureCount > 0 ? totalWeight / featureCount : 0;
  }

  private updateAttentionWeights(features: Map<string, number>): void {
    for (const [feature, weight] of features) {
      const current = this.attentionWeights.get(feature) || 0;
      this.attentionWeights.set(feature, current + weight * 0.1);
    }

    for (const [feature] of this.attentionWeights) {
      const current = this.attentionWeights.get(feature) || 0;
      this.attentionWeights.set(feature, current * 0.95);
    }
  }

  getAttentionWeights(): AttentionWeight[] {
    const weights: AttentionWeight[] = [];
    let maxWeight = 0;

    for (const [feature, weight] of this.attentionWeights) {
      if (weight > maxWeight) maxWeight = weight;
    }

    for (const [feature, weight] of this.attentionWeights) {
      weights.push({
        feature,
        weight: maxWeight > 0 ? weight / maxWeight : 0,
        priority: weight > 0.5 ? 1 : weight > 0.2 ? 2 : 3,
      });
    }

    return weights.sort((a, b) => b.weight - a.weight);
  }

  private persistPercept(percept: Percept): void {
    try {
      const filename = path.join(this.dataDir, `${percept.id}.json`);
      fs.writeFileSync(filename, JSON.stringify(percept, null, 2));
    } catch (err) {
      console.error('[PAM] Failed to persist percept:', err);
    }
  }

  getPerceptCount(): number {
    return this.percepts.size;
  }

  getPercept(id: string): Percept | undefined {
    return this.percepts.get(id);
  }
}

export default PerceptualAssociativeMemory;