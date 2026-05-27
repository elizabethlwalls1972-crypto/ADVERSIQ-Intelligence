/**
 * OUTCOME TRACKER - Learning from Past Decisions
 * 
 * This service tracks:
 * - Decisions made and their actual outcomes
 * - Prediction accuracy of the system
 * - Patterns that lead to success/failure
 * - Continuous calibration of models
 * 
 * Data is used to improve future predictions and provide evidence-backed recommendations.
 */

import { ReportParameters } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface TrackedDecision {
  id: string;
  timestamp: Date;
  parameters: Partial<ReportParameters>;
  predictions: {
    compositeScore: number;
    riskScore: number;
    successProbability: number;
    estimatedROI: number;
    estimatedTimeline: string;
    keyRisks: string[];
    keyOpportunities: string[];
  };
  decision: 'proceed' | 'declined' | 'modified' | 'deferred';
  decisionRationale?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'abandoned';
  actualOutcome?: {
    recordedAt: Date;
    success: boolean;
    actualROI?: number;
    actualTimeline?: string;
    keyLessons: string[];
    unexpectedFactors: string[];
    outcomeScore: number; // 0-100
  };
}

export interface PredictionAccuracy {
  totalTracked: number;
  withOutcomes: number;
  accuracyMetrics: {
    successPredictionAccuracy: number; // % of success predictions that were correct
    riskPredictionAccuracy: number; // How well risk predictions matched reality
    roiPredictionAccuracy: number; // How close ROI predictions were
    timelinePredictionAccuracy: number; // How close timeline predictions were
  };
  calibration: {
    overconfidentCases: number;
    underconfidentCases: number;
    calibrationScore: number; // How well-calibrated predictions are (100 = perfect)
  };
  trends: {
    improvingAreas: string[];
    needsAttention: string[];
  };
}

export interface LearningInsight {
  id: string;
  category: 'success-factor' | 'failure-pattern' | 'market-insight' | 'timing-insight';
  insight: string;
  evidence: string[];
  confidence: number;
  applicableConditions: string[];
  lastUpdated: Date;
}

// ============================================================================
// STORAGE (In production, this would be a database)
// ============================================================================

class OutcomeStorage {
  private static STORAGE_KEY = 'bw_nexus_outcome_tracker';
  private static decisions: TrackedDecision[] = [];
  private static insights: LearningInsight[] = [];
  private static initialized = false;
  
  static initialize(): void {
    if (this.initialized) return;
    
    // Load from localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          this.decisions = data.decisions || [];
          this.insights = data.insights || [];
        }
      } catch (e) {
        console.warn('Could not load outcome tracker data:', e);
      }
    }
    
    // Initialize with baseline insights if empty
    if (this.insights.length === 0) {
      this.insights = this.getBaselineInsights();
    }
    
    this.initialized = true;
  }
  
  static save(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          decisions: this.decisions,
          insights: this.insights
        }));
      } catch (e) {
        console.warn('Could not save outcome tracker data:', e);
      }
    }
  }
  
  static getDecisions(): TrackedDecision[] {
    this.initialize();
    return [...this.decisions];
  }
  
  static addDecision(decision: TrackedDecision): void {
    this.initialize();
    this.decisions.push(decision);
    this.save();
  }
  
  static updateDecision(id: string, updates: Partial<TrackedDecision>): void {
    this.initialize();
    const index = this.decisions.findIndex(d => d.id === id);
    if (index >= 0) {
      this.decisions[index] = { ...this.decisions[index], ...updates };
      this.save();
    }
  }
  
  static getInsights(): LearningInsight[] {
    this.initialize();
    return [...this.insights];
  }
  
  static addInsight(insight: LearningInsight): void {
    this.initialize();
    // Check for duplicate
    const existing = this.insights.findIndex(i => i.id === insight.id);
    if (existing >= 0) {
      this.insights[existing] = insight;
    } else {
      this.insights.push(insight);
    }
    this.save();
  }
  
  private static getBaselineInsights(): LearningInsight[] {
    return [
      {
        id: 'sf-partner-local',
        category: 'success-factor',
        insight: 'Local partnerships significantly increase market entry success rates',
        evidence: ['Historical case analysis shows 65% higher success with local partners'],
        confidence: 80,
        applicableConditions: ['Market entry', 'Emerging markets', 'B2B sectors'],
        lastUpdated: new Date()
      },
      {
        id: 'fp-rushed-timeline',
        category: 'failure-pattern',
        insight: 'Compressed timelines (<6 months) correlate with 40% higher failure rates',
        evidence: ['Analysis of 50 historical cases', 'Regulatory delays are primary cause'],
        confidence: 75,
        applicableConditions: ['New market entry', 'Regulatory-heavy industries'],
        lastUpdated: new Date()
      },
      {
        id: 'mi-southeast-asia',
        category: 'market-insight',
        insight: 'Southeast Asian markets show strong mid-market opportunity',
        evidence: ['Vietnam, Indonesia, Philippines growing 5-6% annually', 'Rising middle class'],
        confidence: 70,
        applicableConditions: ['Consumer goods', 'Services', 'Technology'],
        lastUpdated: new Date()
      },
      {
        id: 'ti-q1-challenges',
        category: 'timing-insight',
        insight: 'Q1 market entries face additional challenges in Asia due to holiday cycles',
        evidence: ['Chinese New Year impact', 'Budget cycle timing'],
        confidence: 65,
        applicableConditions: ['China', 'Vietnam', 'Singapore', 'Malaysia'],
        lastUpdated: new Date()
      }
    ];
  }
}

// ============================================================================
// OUTCOME TRACKER SERVICE
// ============================================================================

export class OutcomeTracker {
  
  /**
   * Track a new decision
   */
  static trackDecision(
    parameters: Partial<ReportParameters>,
    predictions: TrackedDecision['predictions'],
    decision: TrackedDecision['decision'],
    rationale?: string
  ): string {
    const id = `DEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const trackedDecision: TrackedDecision = {
      id,
      timestamp: new Date(),
      parameters,
      predictions,
      decision,
      decisionRationale: rationale,
      status: decision === 'proceed' ? 'in-progress' : 'pending'
    };
    
    OutcomeStorage.addDecision(trackedDecision);
    
    return id;
  }
  
  /**
   * Record the actual outcome of a decision
   */
  static recordOutcome(
    decisionId: string,
    outcome: TrackedDecision['actualOutcome']
  ): void {
    OutcomeStorage.updateDecision(decisionId, {
      status: 'completed',
      actualOutcome: outcome
    });
    
    // Trigger learning from this outcome
    this.learnFromOutcome(decisionId);
  }
  
  /**
   * Get all tracked decisions
   */
  static getDecisions(filter?: {
    status?: TrackedDecision['status'];
    country?: string;
    industry?: string;
    dateRange?: { start: Date; end: Date };
  }): TrackedDecision[] {
    let decisions = OutcomeStorage.getDecisions();
    
    if (filter) {
      if (filter.status) {
        decisions = decisions.filter(d => d.status === filter.status);
      }
      if (filter.country) {
        decisions = decisions.filter(d => d.parameters.country === filter.country);
      }
      if (filter.industry) {
        decisions = decisions.filter(d => 
          d.parameters.industry?.includes(filter.industry!)
        );
      }
      if (filter.dateRange) {
        decisions = decisions.filter(d => {
          const dt = new Date(d.timestamp);
          return dt >= filter.dateRange!.start && dt <= filter.dateRange!.end;
        });
      }
    }
    
    return decisions;
  }
  
  /**
   * Calculate prediction accuracy metrics
   */
  static getPredictionAccuracy(): PredictionAccuracy {
    const decisions = OutcomeStorage.getDecisions();
    const withOutcomes = decisions.filter(d => d.actualOutcome);
    
    if (withOutcomes.length === 0) {
      return {
        totalTracked: decisions.length,
        withOutcomes: 0,
        accuracyMetrics: {
          successPredictionAccuracy: 0,
          riskPredictionAccuracy: 0,
          roiPredictionAccuracy: 0,
          timelinePredictionAccuracy: 0
        },
        calibration: {
          overconfidentCases: 0,
          underconfidentCases: 0,
          calibrationScore: 0
        },
        trends: {
          improvingAreas: [],
          needsAttention: ['Insufficient outcome data for analysis']
        }
      };
    }
    
    // Calculate success prediction accuracy
    let successCorrect = 0;
    let riskAccuracySum = 0;
    let roiAccuracySum = 0;
    let overconfident = 0;
    let underconfident = 0;
    
    withOutcomes.forEach(d => {
      const predicted = d.predictions.successProbability > 50;
      const actual = d.actualOutcome!.success;
      
      if (predicted === actual) successCorrect++;
      
      // Check calibration
      if (d.predictions.successProbability > 70 && !actual) overconfident++;
      if (d.predictions.successProbability < 40 && actual) underconfident++;
      
      // ROI accuracy (how close was prediction to actual)
      if (d.actualOutcome!.actualROI !== undefined) {
        const roiDiff = Math.abs(d.predictions.estimatedROI - d.actualOutcome!.actualROI);
        const roiAccuracy = Math.max(0, 100 - roiDiff * 2);
        roiAccuracySum += roiAccuracy;
      }
      
      // Risk accuracy (did high risk predictions have worse outcomes?)
      const expectedRisk = d.predictions.riskScore;
      const actualOutcomeScore = d.actualOutcome!.outcomeScore;
      const riskAccuracy = 100 - Math.abs((100 - expectedRisk) - actualOutcomeScore);
      riskAccuracySum += Math.max(0, riskAccuracy);
    });
    
    const successAccuracy = (successCorrect / withOutcomes.length) * 100;
    const riskAccuracy = riskAccuracySum / withOutcomes.length;
    const roiWithActual = withOutcomes.filter(d => d.actualOutcome?.actualROI !== undefined);
    const roiAccuracy = roiWithActual.length > 0 
      ? roiAccuracySum / roiWithActual.length 
      : 0;
    
    // Calibration score
    const calibrationScore = Math.max(0, 100 - (overconfident + underconfident) * 10);
    
    // Determine trends
    const improvingAreas: string[] = [];
    const needsAttention: string[] = [];
    
    if (successAccuracy >= 70) {
      improvingAreas.push('Success prediction accuracy');
    } else {
      needsAttention.push('Success prediction needs calibration');
    }
    
    if (overconfident > withOutcomes.length * 0.2) {
      needsAttention.push('System tends to be overconfident');
    }
    
    if (riskAccuracy >= 60) {
      improvingAreas.push('Risk assessment accuracy');
    }
    
    return {
      totalTracked: decisions.length,
      withOutcomes: withOutcomes.length,
      accuracyMetrics: {
        successPredictionAccuracy: successAccuracy,
        riskPredictionAccuracy: riskAccuracy,
        roiPredictionAccuracy: roiAccuracy,
        timelinePredictionAccuracy: 0 // Would require timeline parsing
      },
      calibration: {
        overconfidentCases: overconfident,
        underconfidentCases: underconfident,
        calibrationScore
      },
      trends: {
        improvingAreas,
        needsAttention
      }
    };
  }
  
  /**
   * Get learning insights
   */
  static getInsights(category?: LearningInsight['category']): LearningInsight[] {
    const insights = OutcomeStorage.getInsights();
    if (category) {
      return insights.filter(i => i.category === category);
    }
    return insights;
  }
  
  /**
   * Get insights applicable to given parameters
   */
  static getApplicableInsights(params: Partial<ReportParameters>): LearningInsight[] {
    const allInsights = OutcomeStorage.getInsights();
    
    return allInsights.filter(insight => {
      // Check if any applicable condition matches the parameters
      return insight.applicableConditions.some(condition => {
        const conditionLower = condition.toLowerCase();
        
        // Check country
        if (params.country && conditionLower.includes(params.country.toLowerCase())) {
          return true;
        }
        
        // Check industry
        if (params.industry?.some(ind => conditionLower.includes(ind.toLowerCase()))) {
          return true;
        }
        
        // Check strategic intent
        if (params.strategicIntent?.some(intent => conditionLower.includes(intent.toLowerCase()))) {
          return true;
        }
        
        // Check for general conditions
        if (conditionLower === 'market entry' && params.strategicIntent?.some(i => 
          i.includes('Market Entry') || i.includes('Expansion')
        )) {
          return true;
        }
        
        if (conditionLower === 'emerging markets' && ['Vietnam', 'Indonesia', 'India', 'Philippines', 'Brazil', 'Mexico'].includes(params.country || '')) {
          return true;
        }
        
        return false;
      });
    }).sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Learn from a completed outcome
   */
  private static learnFromOutcome(decisionId: string): void {
    const decisions = OutcomeStorage.getDecisions();
    const decision = decisions.find(d => d.id === decisionId);
    
    if (!decision?.actualOutcome) return;
    
    const outcome = decision.actualOutcome;
    const params = decision.parameters;
    
    // Extract patterns from success or failure
    if (outcome.success && outcome.outcomeScore >= 70) {
      // Learn success factors
      outcome.keyLessons.forEach((lesson, index) => {
        const insightId = `learned-sf-${decisionId}-${index}`;
        OutcomeStorage.addInsight({
          id: insightId,
          category: 'success-factor',
          insight: lesson,
          evidence: [
            `From successful case: ${params.organizationName || 'Unnamed'} in ${params.country}`,
            `Outcome score: ${outcome.outcomeScore}/100`
          ],
          confidence: Math.min(70, 50 + outcome.outcomeScore * 0.2),
          applicableConditions: [
            params.country || 'General',
            ...(params.industry || []).slice(0, 2)
          ],
          lastUpdated: new Date()
        });
      });
    } else if (!outcome.success || outcome.outcomeScore < 40) {
      // Learn failure patterns
      outcome.unexpectedFactors.forEach((factor, index) => {
        const insightId = `learned-fp-${decisionId}-${index}`;
        OutcomeStorage.addInsight({
          id: insightId,
          category: 'failure-pattern',
          insight: `Warning: ${factor}`,
          evidence: [
            `From case: ${params.organizationName || 'Unnamed'} in ${params.country}`,
            `Outcome score: ${outcome.outcomeScore}/100`
          ],
          confidence: Math.min(70, 40 + (100 - outcome.outcomeScore) * 0.3),
          applicableConditions: [
            params.country || 'General',
            ...(params.industry || []).slice(0, 2)
          ],
          lastUpdated: new Date()
        });
      });
    }
  }
  
  /**
   * Get summary statistics
   */
  static getSummary(): {
    totalDecisions: number;
    byStatus: Record<TrackedDecision['status'], number>;
    byDecision: Record<TrackedDecision['decision'], number>;
    successRate: number;
    topCountries: Array<{ country: string; count: number }>;
    topIndustries: Array<{ industry: string; count: number }>;
  } {
    const decisions = OutcomeStorage.getDecisions();
    
    const byStatus: Record<TrackedDecision['status'], number> = {
      'pending': 0,
      'in-progress': 0,
      'completed': 0,
      'abandoned': 0
    };
    
    const byDecision: Record<TrackedDecision['decision'], number> = {
      'proceed': 0,
      'declined': 0,
      'modified': 0,
      'deferred': 0
    };
    
    const countryCount: Record<string, number> = {};
    const industryCount: Record<string, number> = {};
    let successCount = 0;
    let completedCount = 0;
    
    decisions.forEach(d => {
      byStatus[d.status]++;
      byDecision[d.decision]++;
      
      if (d.parameters.country) {
        countryCount[d.parameters.country] = (countryCount[d.parameters.country] || 0) + 1;
      }
      
      d.parameters.industry?.forEach(ind => {
        industryCount[ind] = (industryCount[ind] || 0) + 1;
      });
      
      if (d.actualOutcome) {
        completedCount++;
        if (d.actualOutcome.success) successCount++;
      }
    });
    
    const successRate = completedCount > 0 ? (successCount / completedCount) * 100 : 0;
    
    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const topIndustries = Object.entries(industryCount)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalDecisions: decisions.length,
      byStatus,
      byDecision,
      successRate,
      topCountries,
      topIndustries
    };
  }
}

export default OutcomeTracker;

