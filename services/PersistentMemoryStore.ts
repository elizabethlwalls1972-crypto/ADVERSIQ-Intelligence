/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PIPELINE 6: PERSISTENT MEMORY STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Per-user persistent memory for preferences, prior analyses, project state,
 * and conversation summaries. File-backed JSONL store under server/data/memory/.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  userId: string;
  type: 'preference' | 'analysis_summary' | 'conversation' | 'project' | 'feedback' | 'fact';
  key: string;
  value: unknown;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  expiresAt?: string;
}

export interface MemoryQuery {
  userId: string;
  type?: MemoryEntry['type'];
  key?: string;
  limit?: number;
  since?: string; // ISO date
}

export interface ConversationSummary {
  sessionId: string;
  topic: string;
  keyPoints: string[];
  decisions: string[];
  openQuestions: string[];
  timestamp: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'server', 'data', 'memory');
const MAX_ENTRIES_PER_USER = 5000;

// ─── Ensure directory exists ────────────────────────────────────────────────

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function userFilePath(userId: string): string {
  // Sanitize userId to prevent path traversal
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  return path.join(DATA_DIR, `${safe}.jsonl`);
}

// ─── Core Operations ────────────────────────────────────────────────────────

export function storeMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>): MemoryEntry {
  ensureDir();
  const filePath = userFilePath(entry.userId);

  // Check if key already exists — update instead of duplicate
  const existing = queryMemory({ userId: entry.userId, key: entry.key, type: entry.type });
  if (existing.length > 0) {
    return updateMemory(existing[0].id, entry.userId, { value: entry.value, metadata: entry.metadata });
  }

  const full: MemoryEntry = {
    ...entry,
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
  };

  fs.appendFileSync(filePath, JSON.stringify(full) + '\n');
  return full;
}

export function queryMemory(query: MemoryQuery): MemoryEntry[] {
  ensureDir();
  const filePath = userFilePath(query.userId);
  if (!fs.existsSync(filePath)) return [];

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  let results: MemoryEntry[] = [];

  for (const line of lines) {
    try {
      const entry: MemoryEntry = JSON.parse(line);
      if (query.type && entry.type !== query.type) continue;
      if (query.key && entry.key !== query.key) continue;
      if (query.since && entry.updatedAt < query.since) continue;
      results.push(entry);
    } catch {
      // Skip malformed lines
    }
  }

  // Sort by most recently updated
  results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (query.limit) {
    results = results.slice(0, query.limit);
  }

  return results;
}

export function updateMemory(
  entryId: string,
  userId: string,
  updates: Partial<Pick<MemoryEntry, 'value' | 'metadata' | 'expiresAt'>>
): MemoryEntry {
  ensureDir();
  const filePath = userFilePath(userId);
  if (!fs.existsSync(filePath)) {
    throw new Error(`No memory file for user ${userId}`);
  }

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  let updated: MemoryEntry | null = null;

  const newLines = lines.map(line => {
    try {
      const entry: MemoryEntry = JSON.parse(line);
      if (entry.id === entryId) {
        updated = {
          ...entry,
          ...updates,
          updatedAt: new Date().toISOString(),
          accessCount: entry.accessCount + 1,
        };
        return JSON.stringify(updated);
      }
      return line;
    } catch {
      return line;
    }
  });

  if (!updated) throw new Error(`Memory entry ${entryId} not found`);

  fs.writeFileSync(filePath, newLines.join('\n') + '\n');
  return updated;
}

export function deleteMemory(entryId: string, userId: string): boolean {
  ensureDir();
  const filePath = userFilePath(userId);
  if (!fs.existsSync(filePath)) return false;

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  const filtered = lines.filter(line => {
    try {
      const entry: MemoryEntry = JSON.parse(line);
      return entry.id !== entryId;
    } catch {
      return true;
    }
  });

  if (filtered.length === lines.length) return false;

  fs.writeFileSync(filePath, filtered.join('\n') + '\n');
  return true;
}

// ─── Convenience: Conversation Memory ───────────────────────────────────────

export function storeConversationSummary(userId: string, summary: ConversationSummary): MemoryEntry {
  return storeMemory({
    userId,
    type: 'conversation',
    key: `session_${summary.sessionId}`,
    value: summary,
    metadata: { topic: summary.topic, pointCount: summary.keyPoints.length },
  });
}

export function getRecentConversations(userId: string, limit: number = 10): ConversationSummary[] {
  const entries = queryMemory({ userId, type: 'conversation', limit });
  return entries.map(e => e.value as ConversationSummary);
}

// ─── Convenience: User Preferences ─────────────────────────────────────────

export function setPreference(userId: string, key: string, value: unknown): MemoryEntry {
  return storeMemory({
    userId,
    type: 'preference',
    key: `pref_${key}`,
    value,
    metadata: {},
  });
}

export function getPreference(userId: string, key: string): unknown | null {
  const entries = queryMemory({ userId, type: 'preference', key: `pref_${key}`, limit: 1 });
  return entries.length > 0 ? entries[0].value : null;
}

// ─── Convenience: Store Analysis Result ─────────────────────────────────────

export function storeAnalysisResult(userId: string, topic: string, analysis: Record<string, unknown>): MemoryEntry {
  return storeMemory({
    userId,
    type: 'analysis_summary',
    key: `analysis_${topic.toLowerCase().replace(/\s+/g, '_').slice(0, 50)}`,
    value: analysis,
    metadata: { topic },
  });
}

export function getAnalysisHistory(userId: string, limit: number = 20): MemoryEntry[] {
  return queryMemory({ userId, type: 'analysis_summary', limit });
}

// ─── Build context from memory for prompt injection ─────────────────────────

export function buildMemoryContext(userId: string, _currentQuery: string): string {
  const preferences = queryMemory({ userId, type: 'preference', limit: 10 });
  const recentAnalyses = queryMemory({ userId, type: 'analysis_summary', limit: 5 });
  const recentConversations = queryMemory({ userId, type: 'conversation', limit: 3 });
  const facts = queryMemory({ userId, type: 'fact', limit: 10 });

  const sections: string[] = [];

  if (preferences.length > 0) {
    sections.push('USER PREFERENCES:\n' + preferences.map(p => `- ${p.key}: ${JSON.stringify(p.value)}`).join('\n'));
  }

  if (facts.length > 0) {
    sections.push('KNOWN FACTS:\n' + facts.map(f => `- ${f.key}: ${JSON.stringify(f.value)}`).join('\n'));
  }

  if (recentAnalyses.length > 0) {
    sections.push('RECENT ANALYSES:\n' + recentAnalyses.map(a => `- ${a.metadata?.topic || a.key} (${a.updatedAt})`).join('\n'));
  }

  if (recentConversations.length > 0) {
    const convos = recentConversations.map(c => {
      const summary = c.value as ConversationSummary;
      return `- ${summary.topic}: ${summary.keyPoints.slice(0, 2).join('; ')}`;
    });
    sections.push('RECENT CONVERSATIONS:\n' + convos.join('\n'));
  }

  if (sections.length === 0) return '';

  return `[PERSISTENT MEMORY - User Context]\n${sections.join('\n\n')}\n[END MEMORY]`;
}

// ─── Garbage collection ─────────────────────────────────────────────────────

export function compactUserMemory(userId: string): number {
  ensureDir();
  const filePath = userFilePath(userId);
  if (!fs.existsSync(filePath)) return 0;

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  const now = new Date().toISOString();

  // Remove expired entries
  const valid = lines.filter(line => {
    try {
      const entry: MemoryEntry = JSON.parse(line);
      if (entry.expiresAt && entry.expiresAt < now) return false;
      return true;
    } catch {
      return false;
    }
  });

  // Keep only most recent MAX_ENTRIES_PER_USER
  const kept = valid.slice(-MAX_ENTRIES_PER_USER);
  const removed = lines.length - kept.length;

  if (removed > 0) {
    fs.writeFileSync(filePath, kept.join('\n') + '\n');
  }

  return removed;
}
