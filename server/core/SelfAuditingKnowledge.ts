import { EventEmitter } from "events";

export interface KnowledgeEntry {
  topic: string;
  content: any;
  source: string;
  confidence: number;
  lastUpdated: Date;
}

export interface AuditResult {
  known: boolean;
  confidence: number;
  gaps: string[];
  sources: string[];
}

export interface SelfAuditResult {
  totalKnowledge: number;
  coverage: number;
  gaps: string[];
  weaknesses: string[];
}

export interface KnowledgeGraph {
  nodes: string[];
  edges: string[];
}

export interface KnowledgeConfidenceMap {
  [topic: string]: number;
}

const CONFIDENCE_THRESHOLD = 0.7;
const WEAKNESS_THRESHOLD = 0.4;

export default class SelfAuditingKnowledge extends EventEmitter {
  private knowledge: Map<string, KnowledgeEntry>;
  private gaps: Set<string>;
  private weaknesses: Set<string>;
  private graph: Map<string, Set<string>>;
  private confidenceCache: Map<string, number>;
  private topicHierarchy: Map<string, string[]>;

  constructor() {
    super();
    this.knowledge = new Map();
    this.gaps = new Set();
    this.weaknesses = new Set();
    this.graph = new Map();
    this.confidenceCache = new Map();
    this.topicHierarchy = new Map();
  }

  /**
   * Audits a knowledge query against the knowledge base.
   * @param query - The query string to audit.
   * @returns An audit result containing known status, confidence, gaps, and sources.
   */
  public async auditKnowledge(query: string): Promise<AuditResult> {
    if (!query || typeof query !== "string") {
      throw new Error("Query must be a non-empty string");
    }

    const normalizedQuery = query.trim().toLowerCase();
    const topicMatch = this.findBestTopicMatch(normalizedQuery);
    const gaps: string[] = [];
    const sources: string[] = [];

    if (topicMatch) {
      const entry = this.knowledge.get(topicMatch);
      if (entry) {
        sources.push(entry.source);
        const confidence = this.getKnowledgeConfidence(topicMatch);
        this.detectGapsForTopic(topicMatch, gaps);
        return {
          known: confidence >= CONFIDENCE_THRESHOLD,
          confidence,
          gaps,
          sources,
        };
      }
    }

    const relatedTopics = this.findRelatedTopics(normalizedQuery);
    for (const topic of relatedTopics) {
      const entry = this.knowledge.get(topic);
      if (entry) {
        sources.push(entry.source);
      }
    }

    this.detectGapsForTopic(normalizedQuery, gaps);
    gaps.push(normalizedQuery);

    return {
      known: false,
      confidence: 0,
      gaps: Array.from(new Set(gaps)),
      sources: Array.from(new Set(sources)),
    };
  }

  /**
   * Performs a self-audit of the entire knowledge base.
   * @returns A summary of total knowledge, coverage, gaps, and weaknesses.
   */
  public async selfAudit(): Promise<SelfAuditResult> {
    const totalKnowledge = this.knowledge.size;
    const gaps = Array.from(this.gaps);
    const weaknesses = Array.from(this.weaknesses);

    const totalPossibleTopics = this.estimateTopicSpace();
    const coverage = totalPossibleTopics > 0 ? totalKnowledge / totalPossibleTopics : 0;

    this.emit("selfAudit", {
      totalKnowledge,
      coverage,
      gaps,
      weaknesses,
    });

    return {
      totalKnowledge,
      coverage,
      gaps,
      weaknesses,
    };
  }

  /**
   * Identifies missing knowledge related to a given topic.
   * @param topic - The topic to analyze for missing knowledge.
   * @returns An array of missing related topics.
   */
  public async identifyMissingKnowledge(topic: string): Promise<string[]> {
    if (!topic || typeof topic !== "string") {
      throw new Error("Topic must be a non-empty string");
    }

    const normalizedTopic = topic.trim().toLowerCase();
    const missing: string[] = [];

    const neighbors = this.graph.get(normalizedTopic);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!this.knowledge.has(neighbor)) {
          missing.push(neighbor);
        }
      }
    }

    const relatedTopics = this.findRelatedTopics(normalizedTopic);
    for (const related of relatedTopics) {
      if (!this.knowledge.has(related) && !missing.includes(related)) {
        missing.push(related);
      }
    }

    if (this.knowledge.has(normalizedTopic)) {
      const subTopics = this.topicHierarchy.get(normalizedTopic) || [];
      for (const sub of subTopics) {
        if (!this.knowledge.has(sub) && !missing.includes(sub)) {
          missing.push(sub);
        }
      }
    }

    return missing;
  }

  /**
   * Gets the confidence score for a specific topic.
   * @param topic - The topic to get confidence for.
   * @returns The confidence score between 0 and 1.
   */
  public async getKnowledgeConfidence(topic: string): Promise<number> {
    if (!topic || typeof topic !== "string") {
      throw new Error("Topic must be a non-empty string");
    }

    const normalizedTopic = topic.trim().toLowerCase();

    if (this.confidenceCache.has(normalizedTopic)) {
      return this.confidenceCache.get(normalizedTopic)!;
    }

    const entry = this.knowledge.get(normalizedTopic);
    if (!entry) {
      return 0;
    }

    const agePenalty = this.calculateAgePenalty(entry.lastUpdated);
    const sourceReliability = this.assessSourceReliability(entry.source);
    const graphSupport = this.calculateGraphSupport(normalizedTopic);

    let confidence = entry.confidence * agePenalty * sourceReliability * graphSupport;
    confidence = Math.max(0, Math.min(1, confidence));

    this.confidenceCache.set(normalizedTopic, confidence);

    if (confidence < WEAKNESS_THRESHOLD) {
      this.weaknesses.add(normalizedTopic);
    } else {
      this.weaknesses.delete(normalizedTopic);
    }

    return confidence;
  }

  /**
   * Records new knowledge into the knowledge base.
   * @param topic - The topic of the knowledge.
   * @param content - The content of the knowledge.
   * @param source - The source of the knowledge.
   */
  public async recordKnowledge(topic: string, content: any, source: string): Promise<void> {
    if (!topic || typeof topic !== "string") {
      throw new Error("Topic must be a non-empty string");
    }

    if (!source || typeof source !== "string") {
      throw new Error("Source must be a non-empty string");
    }

    const normalizedTopic = topic.trim().toLowerCase();
    const existingEntry = this.knowledge.get(normalizedTopic);

    const confidence = existingEntry
      ? Math.min(1, existingEntry.confidence + 0.1)
      : 0.5;

    const entry: KnowledgeEntry = {
      topic: normalizedTopic,
      content,
      source,
      confidence,
      lastUpdated: new Date(),
    };

    this.knowledge.set(normalizedTopic, entry);
    this.gaps.delete(normalizedTopic);
    this.weaknesses.delete(normalizedTopic);
    this.confidenceCache.set(normalizedTopic, confidence);

    this.updateGraph(normalizedTopic, topic);
    this.extractRelationships(normalizedTopic, content);

    this.emit("knowledgeRecorded", { topic: normalizedTopic, source, confidence });
  }

  /**
   * Retrieves the knowledge graph structure.
   * @returns An object containing nodes and edges of the knowledge graph.
   */
  public async getKnowledgeGraph(): Promise<KnowledgeGraph> {
    const nodes: string[] = [];
    const edges: string[] = [];

    for (const [node, neighbors] of this.graph.entries()) {
      nodes.push(node);
      for (const neighbor of neighbors) {
        edges.push(`${node} -> ${neighbor}`);
      }
    }

    for (const topic of this.knowledge.keys()) {
      if (!nodes.includes(topic)) {
        nodes.push(topic);
      }
    }

    return {
      nodes: Array.from(new Set(nodes)),
      edges: Array.from(new Set(edges)),
    };
  }

  private findBestTopicMatch(query: string): string | null {
    const queryTerms = query.split(/\s+/);
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const topic of this.knowledge.keys()) {
      const topicTerms = topic.split(/\s+/);
      let matchScore = 0;

      for (const qt of queryTerms) {
        for (const tt of topicTerms) {
          if (tt.includes(qt) || qt.includes(tt)) {
            matchScore += 1 / Math.max(qt.length, tt.length);
          }
        }
      }

      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = topic;
      }
    }

    return bestMatch && bestScore > 0 ? bestMatch : null;
  }

  private findRelatedTopics(query: string): string[] {
    const related: string[] = [];
    const queryTerms = query.split(/\s+/);

    for (const topic of this.knowledge.keys()) {
      for (const qt of queryTerms) {
        if (topic.includes(qt) && !related.includes(topic)) {
          related.push(topic);
          break;
        }
      }
    }

    return related;
  }

  private detectGapsForTopic(topic: string, gaps: string[]): void {
    const normalizedTopic = topic.trim().toLowerCase();
    const neighbors = this.graph.get(normalizedTopic);

    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!this.knowledge.has(neighbor) && !gaps.includes(neighbor)) {
          gaps.push(neighbor);
          this.gaps.add(neighbor);
        }
      }
    }
  }

  private estimateTopicSpace(): number {
    const explicitTopics = this.knowledge.size;
    const graphNodes = this.graph.size;
    const gapCount = this.gaps.size;
    return Math.max(explicitTopics + graphNodes + gapCount, explicitTopics * 1.5);
  }

  private calculateAgePenalty(lastUpdated: Date): number {
    const now = new Date();
    const ageInDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    const maxAge = 365;
    const penalty = Math.max(0.5, 1 - ageInDays / maxAge);
    return penalty;
  }

  private assessSourceReliability(source: string): number {
    const reliableSources = [
      "peer-reviewed",
      "verified",
      "official",
      "certified",
      "audited",
    ];

    const lowerSource = source.toLowerCase();
    for (const reliable of reliableSources) {
      if (lowerSource.includes(reliable)) {
        return 1.0;
      }
    }

    const unreliableSources = ["unverified", "anecdotal", "unknown"];
    for (const unreliable of unreliableSources) {
      if (lowerSource.includes(unreliable)) {
        return 0.5;
      }
    }

    return 0.8;
  }

  private calculateGraphSupport(topic: string): number {
    const neighbors = this.graph.get(topic);
    if (!neighbors || neighbors.size === 0) {
      return 1.0;
    }

    let supportedNeighbors = 0;
    for (const neighbor of neighbors) {
      if (this.knowledge.has(neighbor)) {
        supportedNeighbors++;
      }
    }

    const supportRatio = supportedNeighbors / neighbors.size;
    return Math.max(0.7, 0.7 + 0.3 * supportRatio);
  }

  private updateGraph(topic: string, originalTopic: string): void {
    const topicLower = topic.toLowerCase();
    const originalLower = originalTopic.toLowerCase();

    if (!this.graph.has(topicLower)) {
      this.graph.set(topicLower, new Set());
    }

    if (topicLower !== originalLower && !this.graph.get(topicLower)!.has(originalLower)) {
      this.graph.get(topicLower)!.add(originalLower);
    }

    const words = topicLower.split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && word !== topicLower) {
        if (!this.graph.has(word)) {
          this.graph.set(word, new Set());
        }
        if (!this.graph.get(word)!.has(topicLower)) {
          this.graph.get(word)!.add(topicLower);
        }
        if (!this.graph.get(topicLower)!.has(word)) {
          this.graph.get(topicLower)!.add(word);
        }
      }
    }
  }

  private extractRelationships(topic: string, content: any): void {
    if (typeof content !== "string") {
      return;
    }

    const relationshipPatterns = [
      /\b(is|are|was|were|has|have|contains|includes|related to|connected to|depends on|causes|leads to)\s+(?:to\s+)?([a-zA-Z0-9\s]+?)(?:\s*[.,;]|$)/gi,
    ];

    for (const pattern of relationshipPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const relatedTopic = match[2]?.trim().toLowerCase();
        if (relatedTopic && relatedTopic.length > 2) {
          if (!this.graph.has(topic)) {
            this.graph.set(topic, new Set());
          }
          if (!this.graph.get(topic)!.has(relatedTopic)) {
            this.graph.get(topic)!.add(relatedTopic);
          }
          if (!this.graph.has(relatedTopic)) {
            this.graph.set(relatedTopic, new Set());
          }
          if (!this.graph.get(relatedTopic)!.has(topic)) {
            this.graph.get(relatedTopic)!.add(topic);
          }
        }
      }
    }
  }
}
