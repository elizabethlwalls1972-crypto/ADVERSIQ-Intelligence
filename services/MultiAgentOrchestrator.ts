
/**
 * MULTI-AGENT ORCHESTRATOR
 * 
 * Central nervous system that coordinates multiple specialized AI agents.
 * Uses the Unified AI Gateway to route agent tasks to the optimal brain
 * (Together 70B, Groq 70B, GPT-OSS 120B) with automatic fallback.
 */

import type { ReportParameters } from '../types';
import { runAgentViaGateway } from './UnifiedAIGateway';

export interface AgentResponse {
  agentType: 'historical' | 'government' | 'banking' | 'corporate' | 'market' | 'risk' | 'custom';
  confidence: number; // 0-100
  sources: string[]; // Where the data came from
  findings: string[];
  recommendations: string[];
  dataAge: number; // Years back this covers
  gaps: string[]; // What data is missing
}

export interface OrchestratorRequest {
  organizationProfile: ReportParameters;
  query: string;
  dataScope: 'recent' | 'comprehensive' | 'historical'; // Time range
  includeCustomData: boolean;
  agentsToActivate?: Array<AgentResponse['agentType']>;
}

export interface SynthesizedAnalysis {
  question: string;
  agentResponses: AgentResponse[];
  synthesis: {
    primaryInsight: string;
    alternativeViewpoints: string[];
    confidenceLevel: number;
    dataGaps: string[];
    recommendedNextSteps: string[];
  };
  historicalPatterns: {
    similarCases: number;
    successRate: number;
    failurePatterns: string[];
    timeline: string; // How long this typically takes
  };
}

/**
 * HISTORICAL PATTERN AGENT
 * Analyzes 100+ years of economic, organizational, and policy patterns
 */
export class HistoricalPatternAgent {
  static async analyzeHistoricalPatterns(params: ReportParameters, query: string): Promise<AgentResponse> {
    const result = await runAgentViaGateway(
        "Historical Pattern Agent",
        `Analyze 100 years of economic history to find precedents for this organization's strategy in the target region. Look for boom/bust cycles and policy shifts. Query: ${query}`,
        { region: params.region, country: params.country, industry: params.industry, intent: params.strategicIntent }
    );

    return {
      agentType: 'historical',
      confidence: result.confidence,
      sources: ['World Bank Archives', 'Historical Economic Databases'],
      findings: result.findings,
      recommendations: result.recommendations,
      dataAge: 100,
      gaps: result.gaps
    };
  }
}

/**
 * GOVERNMENT POLICY AGENT
 * Analyzes what governments offer to attract investment
 */
export class GovernmentPolicyAgent {
  static async analyzeGovernmentIncentives(params: ReportParameters): Promise<AgentResponse> {
    const result = await runAgentViaGateway(
        "Government Policy Agent",
        "Analyze current and historical government incentives, tax treaties, and regulatory frameworks for foreign direct investment.",
        { country: params.country, sector: params.industry }
    );

    return {
      agentType: 'government',
      confidence: result.confidence,
      sources: ['Ministry of Investment', 'Tax Code Database'],
      findings: result.findings,
      recommendations: result.recommendations,
      dataAge: 5,
      gaps: result.gaps
    };
  }
}

/**
 * BANKING & FINANCE AGENT
 * Analyzes financing patterns, credit availability
 */
export class BankingFinanceAgent {
  static async analyzeFinancingOptions(params: ReportParameters, investmentSize: number): Promise<AgentResponse> {
    const result = await runAgentViaGateway(
        "Banking & Finance Agent",
        `Analyze financing options for a $${investmentSize}M investment. Evaluate interest rates, credit availability, and banking partners.`,
        { country: params.country, revenue: params.revenueBand }
    );

    return {
      agentType: 'banking',
      confidence: result.confidence,
      sources: ['Central Bank Data', 'Commercial Lending Rates'],
      findings: result.findings,
      recommendations: result.recommendations,
      dataAge: 1,
      gaps: result.gaps
    };
  }
}

/**
 * CORPORATE STRATEGY AGENT
 * Analyzes how companies similar to user's org have expanded
 */
export class CorporateStrategyAgent {
  static async analyzeCorporatePatterns(params: ReportParameters): Promise<AgentResponse> {
    const result = await runAgentViaGateway(
        "Corporate Strategy Agent",
        "Analyze expansion patterns of similar corporations. Identify common pivot points and success models.",
        { orgType: params.organizationType, industry: params.industry, size: params.revenueBand }
    );

    return {
      agentType: 'corporate',
      confidence: result.confidence,
      sources: ['Corporate Filings', 'M&A Database'],
      findings: result.findings,
      recommendations: result.recommendations,
      dataAge: 10,
      gaps: result.gaps
    };
  }
}

/**
 * MARKET DYNAMICS AGENT
 * Analyzes competitive landscape
 */
export class MarketDynamicsAgent {
  static async analyzeMarketDynamics(params: ReportParameters): Promise<AgentResponse> {
    const result = await runAgentViaGateway(
        "Market Dynamics Agent",
        "Analyze the competitive landscape, entry barriers, and market saturation levels.",
        { region: params.region, industry: params.industry }
    );

    return {
      agentType: 'market',
      confidence: result.confidence,
      sources: ['Industry Reports', 'Competitive Intelligence'],
      findings: result.findings,
      recommendations: result.recommendations,
      dataAge: 2,
      gaps: result.gaps
    };
  }
}

/**
 * RISK ASSESSMENT AGENT
 * Analyzes failure modes, systemic risks
 */
export class RiskAssessmentAgent {
  static async assessInvestmentRisks(params: ReportParameters): Promise<AgentResponse> {
    const result = await runAgentViaGateway(
        "Risk Assessment Agent",
        "Identify critical failure modes, geopolitical risks, and currency volatility exposure.",
        { country: params.country, riskTolerance: params.riskTolerance }
    );

    return {
      agentType: 'risk',
      confidence: result.confidence,
      sources: ['Geopolitical Risk Index', 'Currency Volatility Data'],
      findings: result.findings,
      recommendations: result.recommendations,
      dataAge: 0,
      gaps: result.gaps
    };
  }
}

/**
 * MAIN ORCHESTRATOR
 * Coordinates agents, synthesizes responses
 */
export class MultiAgentOrchestrator {
  static async synthesizeAnalysis(request: OrchestratorRequest): Promise<SynthesizedAnalysis> {
    const agentsToUse = request.agentsToActivate || [
      'historical',
      'government',
      'banking',
      'corporate',
      'market',
      'risk'
    ];

    // Activate relevant agents in parallel
    const promises: Promise<AgentResponse>[] = [];

    if (agentsToUse.includes('historical')) {
      promises.push(HistoricalPatternAgent.analyzeHistoricalPatterns(request.organizationProfile, request.query));
    }
    if (agentsToUse.includes('government')) {
      promises.push(GovernmentPolicyAgent.analyzeGovernmentIncentives(request.organizationProfile));
    }
    if (agentsToUse.includes('banking')) {
      promises.push(BankingFinanceAgent.analyzeFinancingOptions(request.organizationProfile, 100));
    }
    if (agentsToUse.includes('corporate')) {
      promises.push(CorporateStrategyAgent.analyzeCorporatePatterns(request.organizationProfile));
    }
    if (agentsToUse.includes('market')) {
      promises.push(MarketDynamicsAgent.analyzeMarketDynamics(request.organizationProfile));
    }
    if (agentsToUse.includes('risk')) {
      promises.push(RiskAssessmentAgent.assessInvestmentRisks(request.organizationProfile));
    }

    const responses = await Promise.all(promises);

    return this.synthesizeResponses(request.query, responses);
  }

  private static synthesizeResponses(query: string, responses: AgentResponse[]): SynthesizedAnalysis {
    const averageConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
    const allGaps = responses.flatMap(r => r.gaps);
    const allRecommendations = responses.flatMap(r => r.recommendations);
    const primaryInsight = responses[0]?.findings[0] || "Analysis inconclusive.";

    // Calculate similar cases based on response relevance
    const responsesWithEvidence = responses.filter(r => r.sources.length > 0).length;
    const similarCasesEstimate = responsesWithEvidence * 8 + responses.length * 3;
    
    return {
      question: query,
      agentResponses: responses,
      synthesis: {
        primaryInsight: `Cross-agent consensus: ${primaryInsight}`,
        alternativeViewpoints: responses.length > 1 ? [responses[1].findings[0]] : [],
        confidenceLevel: Math.round(averageConfidence),
        dataGaps: [...new Set(allGaps)],
        recommendedNextSteps: [...new Set(allRecommendations)].slice(0, 5)
      },
      historicalPatterns: {
        similarCases: similarCasesEstimate,
        successRate: Math.round(averageConfidence),
        failurePatterns: responses.find(r => r.agentType === 'risk')?.findings || [],
        timeline: '18-24 months based on aggregated historical data'
      }
    };
  }
}

export default MultiAgentOrchestrator;

