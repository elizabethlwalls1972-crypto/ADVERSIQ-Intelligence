import { EventBus } from './EventBus';
import { persistentMemory } from './PersistentMemorySystem';
import { automaticSearchService, type SearchResult } from './AutomaticSearchService';
import { ReactiveIntelligenceEngine } from './ReactiveIntelligenceEngine';

export interface ConsultantInsight {
  id: string;
  type: 'location_intel' | 'market_analysis' | 'risk_assessment' | 'recommendation';
  title: string;
  content: string;
  confidence: number;
  sources: string[];
  proactive: boolean;
  timestamp: Date;
}

export interface BWConsultantState {
  isActive: boolean;
  currentFocus: string | null;
  insights: ConsultantInsight[];
  searchResults: SearchResult[];
  learningMode: boolean;
  adaptationLevel: number; // 0-100
}

export class BWConsultantAgenticAI {
  private state: BWConsultantState = {
    isActive: true,
    currentFocus: null,
    insights: [],
    searchResults: [],
    learningMode: true,
    adaptationLevel: 0
  };

  private adaptationHistory: Map<string, number> = new Map(); // Track successful adaptations

  constructor() {
    this.setupEventListeners();
    this.initializeLearning();
  }

  // Main consultant interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async consult(params: any, context: string = 'general'): Promise<ConsultantInsight[]> {
    console.log('- BW Consultant: Starting consultation for', context);

    // Update focus
    this.state.currentFocus = context;

    // Only trigger proactive searches for primary consultations
    // NEVER re-trigger searches from search_result_integration context " this causes infinite recursion:
    // consult ' proactiveSearchForReport ' triggerSearch ' emit(searchResultReady) ' App handler ' consult ' ...
    if (context !== 'search_result_integration') {
      await automaticSearchService.proactiveSearchForReport(params);
    }

    // Generate insights based on current knowledge
    const insights = await this.generateInsights(params, context);

    // Learn from this consultation
    await this.learnFromConsultation(params, insights);

    // Update adaptation level
    this.updateAdaptationLevel();

    EventBus.emit({ type: 'consultantInsightsGenerated', insights, context });

    return insights;
  }

  // Generate proactive insights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateInsights(params: any, context: string): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];

    // Location-based insights
    if (params.country || params.region) {
      const locationInsights = await this.generateLocationInsights(params);
      insights.push(...locationInsights);
    }

    // Market analysis insights
    if (params.industry || params.dealSize) {
      const marketInsights = await this.generateMarketInsights(params);
      insights.push(...marketInsights);
    }

    // Risk assessment insights
    const riskInsights = await this.generateRiskInsights(params);
    insights.push(...riskInsights);

    // Proactive recommendations
    const recommendations = await this.generateProactiveRecommendations(params, context);
    insights.push(...recommendations);

    // Store insights
    this.state.insights.push(...insights);

    return insights;
  }

  // Generate location intelligence insights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateLocationInsights(params: any): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];

    // Wait for search results
    const searchResults = await this.waitForSearchResults(params, 5000);

    for (const result of searchResults) {
      if (result.result?.profile) {
        const profile = result.result.profile;

        // Leadership insight
        if (profile.leaders?.length) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'location_intel',
            title: `Leadership Intelligence: ${profile.city}`,
            content: `Key leaders in ${profile.city}: ${profile.leaders.slice(0, 3).map(l => l.name).join(', ')}`,
            confidence: 0.85,
            sources: result.sources,
            proactive: true,
            timestamp: new Date()
          });
        }

        // Economic insight
        if (profile.economics?.gdpLocal) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'market_analysis',
            title: `Economic Overview: ${profile.city}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content: `${profile.city} has a GDP of ${profile.economics.gdpLocal} with key industries: ${(profile as any).industries?.slice(0, 3).join(', ') || profile.keySectors?.slice(0, 3).join(', ') || 'Various'}`,
            confidence: 0.8,
            sources: result.sources,
            proactive: true,
            timestamp: new Date()
          });
        }

        // Infrastructure insight
        if (profile.infrastructure) {
          const infra = profile.infrastructure;
          const infraText = [
            infra.airports?.length ? `${infra.airports.length} airports` : '',
            infra.seaports?.length ? `${infra.seaports.length} seaports` : '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (infra as any).internetSpeed ? `Internet speed: ${(infra as any).internetSpeed} Mbps` : (infra.internetPenetration ? `Internet: ${infra.internetPenetration}` : '')
          ].filter(Boolean).join(', ');

          if (infraText) {
            insights.push({
              id: crypto.randomUUID(),
              type: 'location_intel',
              title: `Infrastructure: ${profile.city}`,
              content: `${profile.city} infrastructure: ${infraText}`,
              confidence: 0.75,
              sources: result.sources,
              proactive: true,
              timestamp: new Date()
            });
          }
        }
      }
    }

    return insights;
  }

  // Generate market analysis insights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateMarketInsights(params: any): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];

    // Industry analysis
    if (params.industry?.length) {
      for (const industry of params.industry) {
        const marketInsight = await this.analyzeIndustryMarket(industry, params);
        if (marketInsight) insights.push(marketInsight);
      }
    }

    // Deal size analysis
    if (params.dealSize) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'market_analysis',
        title: 'Deal Size Market Context',
        content: `For deals of ${params.dealSize}, consider regional economic indicators and investment patterns in ${params.country || 'target market'}`,
        confidence: 0.7,
        sources: ['Market analysis', 'Economic data'],
        proactive: true,
        timestamp: new Date()
      });
    }

    return insights;
  }

  // Generate risk assessment insights
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateRiskInsights(params: any): Promise<ConsultantInsight[]> {
    const insights: ConsultantInsight[] = [];

    // Check liability risks
    const liabilityRisks = persistentMemory.assessLiability('consultation', params);

    if (liabilityRisks.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'risk_assessment',
        title: 'Liability Risk Assessment',
        content: `Identified ${liabilityRisks.length} potential liability concerns: ${liabilityRisks.map(r => r.description).join(', ')}`,
        confidence: 0.9,
        sources: ['Risk assessment engine'],
        proactive: true,
        timestamp: new Date()
      });
    }

    // Location-based risks
    if (params.country) {
      const locationRisks = await this.assessLocationRisks(params.country);
      if (locationRisks) insights.push(locationRisks);
    }

    return insights;
  }

  // Generate proactive recommendations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async generateProactiveRecommendations(params: any, context: string): Promise<ConsultantInsight[]> {
    const recommendations: ConsultantInsight[] = [];

    // Based on learning history
    const similarConsultations = persistentMemory.searchMemory(context);

    if (similarConsultations.length > 0) {
      const successfulPatterns = similarConsultations.filter(c => c.outcome?.success);

      if (successfulPatterns.length > 0) {
        recommendations.push({
          id: crypto.randomUUID(),
          type: 'recommendation',
          title: 'Proactive Recommendation',
          content: `Based on ${successfulPatterns.length} similar successful consultations, consider: ${successfulPatterns[0].action}`,
          confidence: 0.8,
          sources: ['Learning history'],
          proactive: true,
          timestamp: new Date()
        });
      }
    }

    // Search-based recommendations
    const searchStats = automaticSearchService.getSearchStats();
    if (searchStats.recentSearches > 0) {
      recommendations.push({
        id: crypto.randomUUID(),
        type: 'recommendation',
        title: 'Intelligence Enhancement',
        content: `Recent searches found ${searchStats.recentSearches} relevant intelligence items. Consider incorporating location data into your analysis.`,
        confidence: 0.7,
        sources: ['Search analytics'],
        proactive: true,
        timestamp: new Date()
      });
    }

    return recommendations;
  }

  // Wait for search results with timeout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async waitForSearchResults(params: any, timeout: number): Promise<SearchResult[]> {
    return new Promise((resolve) => {
      const results: SearchResult[] = [];
      const timeoutId = setTimeout(() => {
        EventBus.off('searchResultReady', handler);
        resolve(results);
      }, timeout);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (event: any) => {
        if (event.result) {
          results.push(event.result);
          if (results.length >= 3) { // Collect up to 3 results
            clearTimeout(timeoutId);
            EventBus.off('searchResultReady', handler);
            resolve(results);
          }
        }
      };

      EventBus.on('searchResultReady', handler);
    });
  }

  // Analyze industry market
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async analyzeIndustryMarket(industry: string, params: any): Promise<ConsultantInsight | null> {
    const country = params.country || 'target market';
    const query = `${industry} market outlook ${country}`;

    await automaticSearchService.triggerSearch(query, 'market_analysis', 'medium');

    let evidence: Array<{ title: string; url?: string; snippet?: string }> = [];
    try {
      evidence = await ReactiveIntelligenceEngine.liveSearch(query, params);
    } catch (error) {
      console.warn('Industry market live search failed:', error);
    }

    const topEvidence = evidence.slice(0, 3);
    const sources = topEvidence.map(r => r.url || r.title).filter(Boolean) as string[];
    const summary = topEvidence.length
      ? `Live sources indicate current focus areas for ${industry} in ${country}: ${topEvidence.map(r => r.title).join('; ')}.`
      : `Live market search did not return sources. Consider verifying data availability for ${industry} in ${country}.`;

    const confidence = topEvidence.length >= 3 ? 0.8 : topEvidence.length > 0 ? 0.65 : 0.5;

    return {
      id: crypto.randomUUID(),
      type: 'market_analysis',
      title: `Industry Analysis: ${industry}`,
      content: summary,
      confidence,
      sources: sources.length ? sources : ['Live search (no citations returned)'],
      proactive: true,
      timestamp: new Date()
    };
  }

  // Assess location risks
  private async assessLocationRisks(country: string): Promise<ConsultantInsight | null> {
    const query = `${country} political risk regulatory environment economic outlook`;
    await automaticSearchService.triggerSearch(query, 'risk_analysis', 'medium');

    let evidence: Array<{ title: string; url?: string; snippet?: string }> = [];
    try {
      evidence = await ReactiveIntelligenceEngine.liveSearch(query, { country });
    } catch (error) {
      console.warn('Location risk live search failed:', error);
    }

    const topEvidence = evidence.slice(0, 3);
    const sources = topEvidence.map(r => r.url || r.title).filter(Boolean) as string[];
    const summary = topEvidence.length
      ? `Top risk signals for ${country} from live sources: ${topEvidence.map(r => r.title).join('; ')}.`
      : `Risk assessment for ${country} requires additional sources. No live citations returned.`;

    const confidence = topEvidence.length >= 3 ? 0.85 : topEvidence.length > 0 ? 0.7 : 0.55;

    return {
      id: crypto.randomUUID(),
      type: 'risk_assessment',
      title: `Location Risk: ${country}`,
      content: summary,
      confidence,
      sources: sources.length ? sources : ['Live search (no citations returned)'],
      proactive: true,
      timestamp: new Date()
    };
  }

  // Learn from consultation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async learnFromConsultation(params: any, insights: ConsultantInsight[]): Promise<void> {
    if (!this.state.learningMode) return;

    // Remember successful insights
    for (const insight of insights) {
      if (insight.confidence > 0.7) {
        await persistentMemory.remember('successful_insights', {
          action: 'Generated insight',
          context: { type: insight.type, title: insight.title, params },
          outcome: { success: true, confidence: insight.confidence },
          confidence: insight.confidence
        });
      }
    }

    // Track adaptation patterns
    const adaptationKey = JSON.stringify(params);
    const currentLevel = this.adaptationHistory.get(adaptationKey) || 0;
    this.adaptationHistory.set(adaptationKey, currentLevel + 1);
  }

  // Update adaptation level
  private updateAdaptationLevel(): void {
    const totalAdaptations = Array.from(this.adaptationHistory.values()).reduce((sum, val) => sum + val, 0);
    this.state.adaptationLevel = Math.min(totalAdaptations / 10 * 100, 100); // Scale to 0-100
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Listen for search results
    EventBus.on('searchResultReady', (event) => {
      this.state.searchResults.push(event.result);
    });

    // Listen for user interactions to learn
    EventBus.on('userInteraction', (event) => {
      this.learnFromUserInteraction(event);
    });

    // Listen for report generation to provide insights
    EventBus.on('reportGenerationStarted', async (event) => {
      const insights = await this.consult(event.params, 'report_generation');
      EventBus.emit({ type: 'consultantReportInsights', insights });
    });
  }

  // Learn from user interactions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async learnFromUserInteraction(interaction: any): Promise<void> {
    await persistentMemory.remember('user_interactions', {
      action: interaction.type,
      context: interaction,
      outcome: { success: true },
      confidence: 0.8
    });
  }

  // Initialize learning from history
  private async initializeLearning(): Promise<void> {
    const learningData = persistentMemory.searchMemory('successful_insights');
    for (const data of learningData) {
      if (data.context?.params) {
        const key = JSON.stringify(data.context.params);
        const current = this.adaptationHistory.get(key) || 0;
        this.adaptationHistory.set(key, current + 1);
      }
    }
  }

  // Get consultant status
  getStatus() {
    return {
      ...this.state,
      totalInsights: this.state.insights.length,
      recentInsights: this.state.insights.filter(i => Date.now() - i.timestamp.getTime() < 3600000).length, // Last hour
      searchIntegration: automaticSearchService.getSearchStats(),
      adaptationLevel: this.state.adaptationLevel
    };
  }

  // Toggle learning mode
  setLearningMode(enabled: boolean): void {
    this.state.learningMode = enabled;
  }

  // Clear insights
  clearInsights(): void {
    this.state.insights = [];
  }
}

export const bwConsultantAI = new BWConsultantAgenticAI();
