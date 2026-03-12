import { EventBus } from './EventBus';
import { persistentMemory } from './PersistentMemorySystem';
import { researchLocation, type LocationResult } from './geminiLocationService';
import { deepLocationResearch, type DeepResearchResult } from './deepLocationResearchService';
import { multiSourceResearch } from './multiSourceResearchService_v2';

export interface AutomaticSearchConfig {
  enabled: boolean;
  triggerOnInput: boolean;
  proactiveSearch: boolean;
  feedToReports: boolean;
  searchDelay: number; // ms
  maxConcurrentSearches: number;
}

export interface SearchTrigger {
  id: string;
  query: string;
  context: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  triggeredBy: 'user_input' | 'autonomous' | 'report_building';
  timestamp: Date;
}

export interface SearchResult {
  query: string;
  result: LocationResult | null;
  deepResult?: DeepResearchResult;
  confidence: number;
  searchTime: number;
  sources: string[];
  timestamp: Date;
}

export class AutomaticSearchService {
  private config: AutomaticSearchConfig = {
    enabled: true,
    triggerOnInput: true,
    proactiveSearch: true,
    feedToReports: true,
    searchDelay: 2000,
    maxConcurrentSearches: 3
  };

  private activeSearches = new Set<string>();
  private searchQueue: SearchTrigger[] = [];
  private lastSearchTime = 0;
  private searchHistory: Map<string, SearchResult> = new Map();
  private isProactiveSearching = false; // Re-entrancy guard

  constructor() {
    this.setupEventListeners();
    this.loadSearchHistory();
  }

  // Configure the automatic search behavior
  updateConfig(newConfig: Partial<AutomaticSearchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    EventBus.emit({ type: 'searchConfigUpdated', config: this.config });
  }

  // Trigger automatic search based on user input
  async triggerSearch(query: string, context: string, priority: SearchTrigger['priority'] = 'medium'): Promise<void> {
    if (!this.config.enabled) return;

    // Check if we recently searched for this
    const recentResult = this.searchHistory.get(query.toLowerCase());
    if (recentResult && Date.now() - recentResult.timestamp.getTime() < 300000) { // 5 minutes
      // Emit asynchronously to prevent call-stack recursion when listeners re-trigger searches
      setTimeout(() => EventBus.emit({ type: 'searchResultReady', query, result: recentResult }), 0);
      return;
    }

    const trigger: SearchTrigger = {
      id: crypto.randomUUID(),
      query: query.trim(),
      context,
      priority,
      triggeredBy: 'user_input',
      timestamp: new Date()
    };

    this.searchQueue.push(trigger);
    this.processSearchQueue();
  }

  // Proactive search for report building
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async proactiveSearchForReport(params: any): Promise<void> {
    if (!this.config.proactiveSearch) return;

    // Re-entrancy guard " prevents infinite recursion via EventBus listeners
    if (this.isProactiveSearching) return;
    this.isProactiveSearching = true;

    try {
      const potentialQueries = this.extractLocationQueriesFromParams(params);

      for (const query of potentialQueries) {
        await this.triggerSearch(query, 'report_building', 'high');
      }
    } finally {
      this.isProactiveSearching = false;
    }
  }

  // Process the search queue
  private async processSearchQueue(): Promise<void> {
    if (this.activeSearches.size >= this.config.maxConcurrentSearches) return;

    const trigger = this.searchQueue.shift();
    if (!trigger) return;

    // Rate limiting
    const timeSinceLastSearch = Date.now() - this.lastSearchTime;
    if (timeSinceLastSearch < 1000) { // 1 second minimum between searches
      setTimeout(() => this.processSearchQueue(), 1000 - timeSinceLastSearch);
      return;
    }

    this.activeSearches.add(trigger.id);
    this.lastSearchTime = Date.now();

    try {
      const result = await this.performSearch(trigger);
      this.searchHistory.set(trigger.query.toLowerCase(), result);

      // Feed to autonomous system
      if (this.config.feedToReports) {
        EventBus.emit({ type: 'searchResultReady', query: trigger.query, result, trigger });
      }

      // Remember the search
      await persistentMemory.remember('searches', {
        action: 'Automatic search',
        context: { query: trigger.query, context: trigger.context, priority: trigger.priority },
        outcome: { success: !!result.result, confidence: result.confidence },
        confidence: result.confidence
      });

    } catch (_error) {
      console.error('Automatic search failed:', _error);
      await persistentMemory.remember('search_failures', {
        action: 'Automatic search failed',
        context: { query: trigger.query, error: (_error as Error).message },
        outcome: { success: false },
        confidence: 0
      });
    } finally {
      this.activeSearches.delete(trigger.id);
      // Process next in queue
      setTimeout(() => this.processSearchQueue(), 500);
    }
  }

  // Perform the actual search
  private async performSearch(trigger: SearchTrigger): Promise<SearchResult> {
    const startTime = Date.now();

    EventBus.emit({ type: 'searchStarted', query: trigger.query, trigger });

    try {
      // Try primary search first
      let result = await researchLocation(trigger.query);

      if (!result) {
        // Try deep research
        const deepResult = await deepLocationResearch(trigger.query);
        if (deepResult) {
          result = {
            profile: deepResult.profile,
            sources: deepResult.sources?.map(s => s.title) || [],
            summary: deepResult.narratives?.overview || '',
            dataQuality: deepResult.dataQuality as unknown as number
          };
        }
      }

      if (!result) {
        // Try multi-source research as last resort
        const multiResult = await multiSourceResearch(trigger.query);
        if (multiResult) {
          result = {
            profile: multiResult.profile,
            sources: multiResult.sources?.map(s => s.title) || [],
            summary: String(multiResult.narratives?.overview || ''),
            dataQuality: multiResult.dataQuality as unknown as number
          };
        }
      }

      const searchTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(result, searchTime);

      const searchResult: SearchResult = {
        query: trigger.query,
        result,
        confidence,
        searchTime,
        sources: result?.sources || [],
        timestamp: new Date()
      };

      EventBus.emit({ type: 'searchCompleted', query: trigger.query, result: searchResult });

      return searchResult;

    } catch {
      const searchTime = Date.now() - startTime;
      return {
        query: trigger.query,
        result: null,
        confidence: 0,
        searchTime,
        sources: [],
        timestamp: new Date()
      };
    }
  }

  // Extract potential location queries from report parameters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractLocationQueriesFromParams(params: any): string[] {
    const queries: string[] = [];

    // Extract from organization name (might contain city)
    if (params.organizationName) {
      const words = params.organizationName.split(' ');
      for (const word of words) {
        if (word.length > 3 && /^[A-Z][a-z]+$/.test(word)) {
          queries.push(word); // Potential city name
        }
      }
    }

    // Extract from country
    if (params.country) {
      queries.push(params.country);
    }

    // Extract from region
    if (params.region) {
      queries.push(params.region);
    }

    // Extract from industry (might be location-specific)
    if (params.industry && Array.isArray(params.industry)) {
      for (const ind of params.industry) {
        if (ind.toLowerCase().includes('regional') || ind.toLowerCase().includes('local')) {
          queries.push(ind);
        }
      }
    }

    return [...new Set(queries)]; // Remove duplicates
  }

  // Calculate confidence score for search results
  private calculateConfidence(result: LocationResult | null, searchTime: number): number {
    if (!result) return 0;

    let confidence = 0.5; // Base confidence

    // Data completeness
    if (result.profile) {
      const profile = result.profile;
      if (profile.leaders?.length) confidence += 0.1;
      if (profile.economics?.gdpLocal) confidence += 0.1;
      if (profile.demographics?.population) confidence += 0.1;
      if (profile.infrastructure) confidence += 0.1;
    }

    // Source quality
    if (result.sources && result.sources.length > 0) {
      confidence += Math.min(result.sources.length * 0.1, 0.2);
    }

    // Search speed (faster = more reliable)
    if (searchTime < 5000) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Listen for user input changes
    EventBus.on('paramsUpdated', (event) => {
      if (this.config.triggerOnInput) {
        this.proactiveSearchForReport(event.params);
      }
    });

    // Listen for report generation requests
    EventBus.on('reportGenerationStarted', (event) => {
      this.proactiveSearchForReport(event.params);
    });

    // Listen for autonomous system requests
    EventBus.on('autonomousSearchRequest', (event) => {
      this.triggerSearch(event.query, 'autonomous', (event.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical');
    });
  }

  // Get search statistics
  getSearchStats() {
    const history = Array.from(this.searchHistory.values());
    const recent = history.filter(h => Date.now() - h.timestamp.getTime() < 86400000); // Last 24 hours

    return {
      totalSearches: history.length,
      recentSearches: recent.length,
      averageConfidence: history.length > 0 ? history.reduce((sum, h) => sum + h.confidence, 0) / history.length : 0,
      activeSearches: this.activeSearches.size,
      queuedSearches: this.searchQueue.length,
      successRate: history.length > 0 ? history.filter(h => h.result).length / history.length : 0
    };
  }

  // Clear search history
  clearHistory(): void {
    this.searchHistory.clear();
    localStorage.removeItem('bwSearchHistory');
  }

  // Save search history
  private saveSearchHistory(): void {
    try {
      const data = Array.from(this.searchHistory.entries());
      localStorage.setItem('bwSearchHistory', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  // Load search history
  private loadSearchHistory(): void {
    try {
      const data = localStorage.getItem('bwSearchHistory');
      if (data) {
        const parsed = JSON.parse(data);
        this.searchHistory = new Map(parsed);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }
}

export const automaticSearchService = new AutomaticSearchService();
