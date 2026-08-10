/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ADVERSIQ INTELLIGENCE — AUTONOMOUS SWARM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Allows any persona to pause the debate and spawn a recursive sub-agent
 * to hunt for missing facts or scrape target PDFs across the web.
 *
 * Recursive depth is capped at MAX_DEPTH (3) with Judge 1 safety validation
 * at each level to prevent infinite loops and runaway operations.
 *
 * Security: CONFIDENTIAL / FOR STRATEGIC DEPLOYMENT
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { searchWeb, scrapePDF } from '../services/osintTools';
import { Judge1SafetyCheck } from './judges';

// ─── Autonomous Swarm ───────────────────────────────────────────────────────

export class AutonomousSwarm {
  private readonly MAX_DEPTH = 3;
  private readonly MIN_DATA_LENGTH = 100;

  /**
   * Execute a recursive sub-agent branch to find missing intelligence.
   *
   * @param persona - Name of the persona that detected the blind spot
   * @param missingFact - Description of the missing information to find
   * @param depth - Current recursion depth (starts at 0)
   * @returns Verified data string or system halt message
   */
  public async executeSubAgentBranch(
    persona: string,
    missingFact: string,
    depth: number = 0
  ): Promise<string> {
    // ── Depth Guard ──
    if (depth >= this.MAX_DEPTH) {
      return `[SYSTEM HALT] Max recursion depth (${this.MAX_DEPTH}) reached for "${missingFact}". Proceed with Monte Carlo probabilities on available data.`;
    }

    // ── Safety Gate — Judge 1 validates every branch ──
    const isApproved = await Judge1SafetyCheck.validateBranch(persona, missingFact);
    if (!isApproved) {
      return `[WARDEN OVERRIDE] Branch terminated by Judge 1 for "${persona}". Risk of infinite loop or unsafe content detected.`;
    }

    console.log(`[SWARM] ${persona} spawned Sub-Agent for: "${missingFact}" (Depth: ${depth})`);

    try {
      // ── Primary Search ──
      let rawData = await searchWeb(missingFact);

      // ── PDF Detection & Deep Scrape ──
      if (rawData.includes('.pdf')) {
        const pdfUrl = this.extractUrl(rawData);
        if (pdfUrl) {
          console.log(`[SWARM] PDF detected. Spawning deeper scraper for ${pdfUrl}`);
          const pdfData = await scrapePDF(pdfUrl);
          if (pdfData.length > this.MIN_DATA_LENGTH) {
            rawData = pdfData;
          }
        }
      }

      // ── Sufficiency Check — recurse if data is thin ──
      if (!this.isDataSufficient(missingFact, rawData)) {
        console.log(`[SWARM] Data insufficient (${rawData.length} chars). Digging deeper...`);
        return this.executeSubAgentBranch(persona, missingFact, depth + 1);
      }

      return `[SWARM RESOLVED] Verified Data for "${missingFact}":\n${rawData}`;
    } catch (err) {
      console.warn(`[SWARM] Branch error at depth ${depth}:`, err instanceof Error ? err.message : err);
      return `[SWARM ERROR] Failed to resolve "${missingFact}" at depth ${depth}: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }
  }

  /**
   * Extract the first HTTP URL from a text block.
   */
  private extractUrl(text: string): string | null {
    const match = text.match(/https?:\/\/[^\s"'<>]+\.pdf[^\s"'<>]*/i);
    return match ? match[0] : null;
  }

  /**
   * Determine if the retrieved data is sufficient to answer the question.
   */
  private isDataSufficient(goal: string, data: string): boolean {
    // Must have minimum content length
    if (data.length < this.MIN_DATA_LENGTH) return false;

    // Must not be an error message
    if (data.includes('[OSINT] Search failed') || data.includes('[OSINT] No results')) return false;

    // Check if data contains at least some relevant keywords from the goal
    const goalWords = goal.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const dataLower = data.toLowerCase();
    const matchCount = goalWords.filter(w => dataLower.includes(w)).length;
    const matchRatio = goalWords.length > 0 ? matchCount / goalWords.length : 0;

    return matchRatio >= 0.2; // At least 20% keyword overlap
  }
}

export default AutonomousSwarm;
