/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 7: NATIVE EMBEDDING PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bridges AIEmbeddingService into VectorMemoryIndex as the default embedding
 * path. Provides batch indexing, semantic deduplication, and auto-refresh
 * for the report corpus.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { embedText, embedBatch, cosineSimilarity } from './AIEmbeddingService';

// Alias to match pipeline naming conventions
const embedSingle = embedText;
const embedTexts = embedBatch;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EmbeddedDocument {
  id: string;
  text: string;
  vector: number[];
  metadata: Record<string, unknown>;
  indexedAt: string;
}

export interface SemanticSearchResult {
  document: EmbeddedDocument;
  score: number;
  rank: number;
}

export interface EmbeddingPipelineConfig {
  similarityThreshold: number;
  maxResults: number;
  deduplicationThreshold: number;
  batchSize: number;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: EmbeddingPipelineConfig = {
  similarityThreshold: 0.3,
  maxResults: 20,
  deduplicationThreshold: 0.95,
  batchSize: 32,
};

// ─── In-Memory Vector Store ─────────────────────────────────────────────────

class NativeEmbeddingPipeline {
  private documents: EmbeddedDocument[] = [];
  private config: EmbeddingPipelineConfig;

  constructor(config?: Partial<EmbeddingPipelineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get size(): number {
    return this.documents.length;
  }

  // ─── Index a single document ────────────────────────────────────────────

  async indexDocument(
    id: string,
    text: string,
    metadata: Record<string, unknown> = {}
  ): Promise<EmbeddedDocument> {
    // Check for deduplication
    if (this.documents.length > 0) {
      const queryVec = await embedSingle(text);
      for (const existing of this.documents) {
        const sim = cosineSimilarity(queryVec, existing.vector);
        if (sim >= this.config.deduplicationThreshold) {
          // Update existing instead of duplicating
          existing.text = text;
          existing.metadata = { ...existing.metadata, ...metadata };
          existing.indexedAt = new Date().toISOString();
          return existing;
        }
      }
    }

    const vector = await embedSingle(text);
    const doc: EmbeddedDocument = {
      id,
      text,
      vector,
      metadata,
      indexedAt: new Date().toISOString(),
    };

    this.documents.push(doc);
    return doc;
  }

  // ─── Batch index multiple documents ─────────────────────────────────────

  async indexBatch(
    items: Array<{ id: string; text: string; metadata?: Record<string, unknown> }>
  ): Promise<number> {
    let indexed = 0;
    const batchSize = this.config.batchSize;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const texts = batch.map(item => item.text);

      try {
        const vectors = await embedTexts(texts);

        for (let j = 0; j < batch.length; j++) {
          if (vectors[j] && vectors[j].length > 0) {
            const doc: EmbeddedDocument = {
              id: batch[j].id,
              text: batch[j].text,
              vector: vectors[j],
              metadata: batch[j].metadata || {},
              indexedAt: new Date().toISOString(),
            };
            this.documents.push(doc);
            indexed++;
          }
        }
      } catch (err) {
        console.warn(`[NativeEmbeddingPipeline] Batch ${i / batchSize} failed:`, err);
      }
    }

    return indexed;
  }

  // ─── Semantic search ────────────────────────────────────────────────────

  async search(
    query: string,
    maxResults?: number,
    filter?: (doc: EmbeddedDocument) => boolean
  ): Promise<SemanticSearchResult[]> {
    if (this.documents.length === 0) return [];

    const queryVector = await embedSingle(query);
    const limit = maxResults ?? this.config.maxResults;

    let candidates = this.documents;
    if (filter) {
      candidates = candidates.filter(filter);
    }

    const scored = candidates.map(doc => ({
      document: doc,
      score: cosineSimilarity(queryVector, doc.vector),
      rank: 0,
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored
      .filter(s => s.score >= this.config.similarityThreshold)
      .slice(0, limit)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }

  // ─── Find similar documents ─────────────────────────────────────────────

  async findSimilar(
    documentId: string,
    maxResults: number = 5
  ): Promise<SemanticSearchResult[]> {
    const source = this.documents.find(d => d.id === documentId);
    if (!source) return [];

    const scored = this.documents
      .filter(d => d.id !== documentId)
      .map(doc => ({
        document: doc,
        score: cosineSimilarity(source.vector, doc.vector),
        rank: 0,
      }));

    scored.sort((a, b) => b.score - a.score);

    return scored
      .slice(0, maxResults)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }

  // ─── Remove document ───────────────────────────────────────────────────

  removeDocument(id: string): boolean {
    const idx = this.documents.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.documents.splice(idx, 1);
    return true;
  }

  // ─── Clear all ──────────────────────────────────────────────────────────

  clear(): void {
    this.documents = [];
  }

  // ─── Export for persistence ─────────────────────────────────────────────

  exportDocuments(): EmbeddedDocument[] {
    return [...this.documents];
  }

  importDocuments(docs: EmbeddedDocument[]): void {
    this.documents = [...docs];
  }
}

// ─── Singleton instance ─────────────────────────────────────────────────────

export const globalEmbeddingPipeline = new NativeEmbeddingPipeline();

export { NativeEmbeddingPipeline };
