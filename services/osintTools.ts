/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — OSINT TOOLS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Open-Source Intelligence tools for the Autonomous Swarm.
 * Wraps the existing WebSearchGateway and adds PDF scraping capability.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { webSearch, deepResearch, type WebSearchResult } from './WebSearchGateway';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OSINTSearchResult {
  query: string;
  results: WebSearchResult[];
  synthesizedAnswer: string;
  sources: string[];
  timestamp: string;
}

// ─── Web Search ─────────────────────────────────────────────────────────────

/**
 * Search the web for a given query using the best available search provider.
 * Returns raw text suitable for injection into an LLM prompt.
 */
export async function searchWeb(query: string): Promise<string> {
  try {
    const { results, pages } = await deepResearch(query, { maxResults: 5 });

    if (results.length === 0 && pages.length === 0) {
      return `[OSINT] No results found for: "${query}"`;
    }

    const parts: string[] = [];

    // Add search result snippets
    for (const r of results.slice(0, 5)) {
      parts.push(`• ${r.title} (${r.source}): ${r.snippet}`);
      if (r.url) parts.push(`  Source: ${r.url}`);
    }

    // Add full page content if extracted
    for (const page of pages.slice(0, 2)) {
      parts.push(`\n--- Full page content from ${page.url} ---`);
      parts.push(page.text.slice(0, 3000));
    }

    return parts.join('\n');
  } catch (err) {
    console.warn(`[OSINT] Web search failed for "${query}":`, err instanceof Error ? err.message : err);
    return `[OSINT] Search failed for: "${query}"`;
  }
}

// ─── PDF Scraping ───────────────────────────────────────────────────────────

/**
 * Scrape and extract text from a PDF URL.
 * Uses the server-side content extraction pipeline when available,
 * falls back to Jina Reader for PDF-to-text conversion.
 */
export async function scrapePDF(url: string): Promise<string> {
  try {
    // Try server-side extraction first
    const serverRes = await fetch('/api/search/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(20000),
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      const text = (data.text || data.content || '').trim();
      if (text.length > 100) {
        return `[PDF EXTRACTED from ${url}]\n${text.slice(0, 8000)}`;
      }
    }
  } catch { /* server extraction failed, try Jina */ }

  // Fallback: Jina Reader (handles PDFs via r.jina.ai)
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
    });

    if (res.ok) {
      const text = await res.text();
      const cleaned = text.replace(/\n{3,}/g, '\n\n').trim();
      if (cleaned.length > 100) {
        return `[PDF EXTRACTED via Jina from ${url}]\n${cleaned.slice(0, 8000)}`;
      }
    }
  } catch { /* Jina failed */ }

  return `[OSINT] Failed to extract PDF content from: ${url}`;
}

export default { searchWeb, scrapePDF };
