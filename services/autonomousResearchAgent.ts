/**
 * 
 * AUTONOMOUS LOCATION RESEARCH AGENT
 * 
 * 
 * Self-directed research orchestrator that:
 * - Detects data gaps automatically
 * - Launches refinement searches based on findings
 * - Synthesizes conflicting information
 * - Iterates until completeness threshold reached
 * - Makes autonomous decisions about what to research next
 */

import { type MultiSourceResult } from './multiSourceResearchService_v2';
import { type CityProfile } from '../data/globalLocationProfiles';

export interface ResearchGap {
  category: string;
  missing: string[];
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AutonousResearchConfig {
  targetCompletenessScore: number; // 0-100, default 85
  maxIterations: number; // default 5
  timeoutMs: number; // default 120000 (2 minutes)
  enableConflictResolution: boolean; // default true
  enableIndustrySpecificSearches: boolean; // default true
}

interface ResearchSession {
  id: string;
  location: string;
  startTime: number;
  iteration: number;
  completenessScore: number;
  dataGaps: ResearchGap[];
  researchHistory: string[];
  result: MultiSourceResult | null;
}

class AutonomousResearchAgent {
  private activeSessions: Map<string, ResearchSession> = new Map();
  private config: AutonousResearchConfig = {
    targetCompletenessScore: 85,
    maxIterations: 5,
    timeoutMs: 120000,
    enableConflictResolution: true,
    enableIndustrySpecificSearches: true
  };

  /**
   * Configure agent behavior
   */
  configure(config: Partial<AutonousResearchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Analyze research result and identify data gaps
   */
  analyzeDataGaps(result: MultiSourceResult, profile: CityProfile): ResearchGap[] {
    const gaps: ResearchGap[] = [];

    // Check demographics
    if (!profile.demographics?.population || profile.demographics.population.includes('not verified')) {
      gaps.push({
        category: 'Demographics',
        missing: ['Population', 'Population Growth', 'Median Age'],
        confidence: 0.8,
        priority: 'high'
      });
    }

    // Check economics
    if (!profile.economics?.gdpLocal || profile.economics.gdpLocal.includes('not verified')) {
      gaps.push({
        category: 'Economics',
        missing: ['City GDP', 'GDP Growth Rate', 'Per Capita Income'],
        confidence: 0.85,
        priority: 'critical'
      });
    }

    // Check infrastructure
    if (!profile.infrastructure?.airports || profile.infrastructure.airports[0]?.name.includes('Research')) {
      gaps.push({
        category: 'Infrastructure',
        missing: ['Airports', 'Seaports', 'Railway Network'],
        confidence: 0.75,
        priority: 'high'
      });
    }

    // Check leadership
    if (!profile.leaders || profile.leaders.length === 0) {
      gaps.push({
        category: 'Leadership',
        missing: ['Mayor', 'Governor', 'City Officials'],
        confidence: 0.9,
        priority: 'high'
      });
    }

    // Check investments
    if (!profile.investmentPrograms || profile.investmentPrograms[0]?.includes('Contact')) {
      gaps.push({
        category: 'Investment',
        missing: ['Special Economic Zones', 'Tax Incentives', 'Foreign Investment'],
        confidence: 0.8,
        priority: 'medium'
      });
    }

    // Check recent news
    if (!profile.recentNews || profile.recentNews.length < 3) {
      gaps.push({
        category: 'News & Developments',
        missing: ['Recent Projects', 'Market Developments', 'Economic News'],
        confidence: 0.7,
        priority: 'medium'
      });
    }

    // Check industry/trade data
    if (!profile.keySectors || profile.keySectors.length === 0) {
      gaps.push({
        category: 'Industry',
        missing: ['Key Sectors', 'Trade Partners', 'Export Products'],
        confidence: 0.85,
        priority: 'high'
      });
    }

    return gaps;
  }

  /**
   * Calculate research completeness score
   */
  calculateCompletenessScore(result: MultiSourceResult, gaps: ResearchGap[]): number {
    let score = 100;

    // Deduct for critical gaps
    for (const gap of gaps) {
      if (gap.priority === 'critical') {
        score -= gap.missing.length * 10 * gap.confidence;
      } else if (gap.priority === 'high') {
        score -= gap.missing.length * 5 * gap.confidence;
      } else if (gap.priority === 'medium') {
        score -= gap.missing.length * 2 * gap.confidence;
      }
    }

    // Bonus for rich sources
    if (result.sources.length > 15) score += 5;
    if (result.sources.filter(s => s.reliability === 'high').length > 10) score += 5;

    // Bonus for leadership data
    if (result.profile.leaders.length > 2) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate targeted search queries based on gaps
   */
  generateRefinementQueries(
    location: string,
    profile: CityProfile,
    gaps: ResearchGap[]
  ): string[] {
    const queries: string[] = [];
    const { city, region, country } = profile;

    for (const gap of gaps.slice(0, 3)) { // Top 3 gaps
      if (gap.category === 'Demographics') {
        queries.push(`${city} population statistics census ${country}`);
        queries.push(`${city} demographics age distribution growth rate`);
      }

      if (gap.category === 'Economics') {
        queries.push(`${city} GDP economic data regional economy ${country}`);
        queries.push(`${city} per capita income average salary employment`);
        queries.push(`${region} economic zone industrial park ${country}`);
      }

      if (gap.category === 'Infrastructure') {
        queries.push(`${city} airport seaport transport infrastructure ${country}`);
        queries.push(`${city} railway network roads connectivity`);
      }

      if (gap.category === 'Leadership') {
        queries.push(`${city} mayor governor city officials ${country} ${new Date().getFullYear()}`);
        queries.push(`${city} city council leadership government`);
      }

      if (gap.category === 'Investment') {
        queries.push(`${city} special economic zone investment incentives ${country}`);
        queries.push(`${city} business park tax incentives foreign investment`);
      }

      if (gap.category === 'Industry') {
        queries.push(`${city} major industries key sectors economy`);
        queries.push(`${city} trade exports imports business sectors`);
      }
    }

    // Industry-specific searches
    if (this.config.enableIndustrySpecificSearches && profile.keySectors.length > 0) {
      const sector = profile.keySectors[0];
      queries.push(`${city} ${sector} industry ecosystem companies`);
      queries.push(`${city} ${sector} market size growth potential`);
    }

    return queries;
  }

  /**
   * Detect conflicting information across sources
   */
  detectConflicts(result: MultiSourceResult): Array<{
    field: string;
    values: Array<{ value: string; sources: string[] }>;
  }> {
    const conflicts: Array<{
      field: string;
      values: Array<{ value: string; sources: string[] }>;
    }> = [];

    // Extract values from sources and look for conflicts
    // This is simplified - in production would do deeper analysis
    const populationMentions = new Map<string, string[]>();

    for (const source of result.sources) {
      if (source.dataExtracted.includes('population')) {
        const value = source.dataExtracted.substring(0, 50);
        if (!populationMentions.has(value)) {
          populationMentions.set(value, []);
        }
        populationMentions.get(value)!.push(source.title);
      }
    }

    if (populationMentions.size > 1) {
      conflicts.push({
        field: 'Population',
        values: Array.from(populationMentions.entries()).map(([value, sources]) => ({
          value,
          sources
        }))
      });
    }

    return conflicts;
  }

  /**
   * Create research session
   */
  createSession(location: string): ResearchSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const session: ResearchSession = {
      id: sessionId,
      location,
      startTime: Date.now(),
      iteration: 0,
      completenessScore: 0,
      dataGaps: [],
      researchHistory: [],
      result: null
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Update session with research results
   */
  updateSession(
    sessionId: string,
    iteration: number,
    result: MultiSourceResult,
    gaps: ResearchGap[],
    completenessScore: number
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.iteration = iteration;
    session.result = result;
    session.dataGaps = gaps;
    session.completenessScore = completenessScore;
    session.researchHistory.push(
      `Iteration ${iteration}: Score ${completenessScore}/100, Gaps: ${gaps.length}`
    );
  }

  /**
   * Get session info
   */
  getSession(sessionId: string): ResearchSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Should continue research based on completeness
   */
  shouldContinueResearch(
    completenessScore: number,
    iteration: number,
    elapsedTimeMs: number
  ): boolean {
    if (completenessScore >= this.config.targetCompletenessScore) {
      return false; // Target reached
    }

    if (iteration >= this.config.maxIterations) {
      return false; // Max iterations reached
    }

    if (elapsedTimeMs >= this.config.timeoutMs) {
      return false; // Timeout reached
    }

    return true;
  }

  /**
   * Clean up completed session
   */
  completeSession(sessionId: string): ResearchSession | null {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.activeSessions.delete(sessionId);
    }
    return session;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): ResearchSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Determine priority for next search
   */
  determinePriority(gaps: ResearchGap[]): ResearchGap[] {
    return gaps.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }
}

// Singleton instance
export const autonomousResearchAgent = new AutonomousResearchAgent();

export type { ResearchSession };

