/**
 * ADAPTIVE SKILL-LEVEL SYSTEM
 * 
 * Same data, different interfaces based on user sophistication
 * Beginner ' Intermediate ' Advanced ' Expert
 * 
 * No user gets lost. Everyone can add custom data. Everyone gets guidance.
 */

import type { ReportParameters } from '../types';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'custom';

export interface AdaptiveUserProfile {
  skillLevel: SkillLevel;
  domain?: string; // If expert: 'finance', 'government', 'corporate', etc.
  industryExperience: number; // Years
  marketExperience: number; // Years
  previousAnalyses: number;
  customDataSources: string[]; // If they've added their own data
}

export interface SkillLevelInterface {
  questionnaire: string[]; // Questions to ask this user
  defaultOptions: string[]; // Pre-filled choices
  allowCustomInput: boolean;
  detailLevel: 'summary' | 'moderate' | 'comprehensive';
  reportSections: string[]; // Which report sections to show
  explanationLevel: 'minimal' | 'moderate' | 'deep';
  interactivityLevel: 'passive' | 'guided' | 'interactive';
}

/**
 * BEGINNER INTERFACE
 * - Simple questions with guided paths
 * - Pre-populated choices
 * - Explanations for every term
 * - Can add custom data with help
 */
export const BEGINNER_INTERFACE: SkillLevelInterface = {
  questionnaire: [
    'What is your organization?',
    'What country/region are you targeting?',
    'What do you want to accomplish? (simplified list)',
    'How much do you plan to invest? (rough range)'
  ],
  defaultOptions: [
    'Manufacturing',
    'Services',
    'Technology',
    'Other'
  ],
  allowCustomInput: true, // With guided help
  detailLevel: 'summary',
  reportSections: [ // Simplified report for beginners
    'executiveSummary',
    'marketAnalysis',
    'recommendations',
  ],
  explanationLevel: 'deep',
  interactivityLevel: 'guided'
};

/**
 * INTERMEDIATE INTERFACE
 * - More specific questions
 * - Mix of predefined and custom options
 * - Technical terms explained on hover
 * - Can view source data
 */
export const INTERMEDIATE_INTERFACE: SkillLevelInterface = {
  questionnaire: [
    'Organization name & structure',
    'Revenue band & headcount',
    'Target region (specific)',
    'Target sector & subsector',
    'Strategic intent (detailed)',
    'Timeline & budget',
    'Key success metrics',
    'Risk tolerance'
  ],
  defaultOptions: [
    'Greenfield entry',
    'Partnership/JV',
    'Acquisition',
    'Franchise/License'
  ],
  allowCustomInput: true,
  detailLevel: 'moderate',
  reportSections: [ // Standard, comprehensive report
    'executiveSummary',
    'marketAnalysis',
    'recommendations',
    'implementation',
    'risks'
  ],
  explanationLevel: 'moderate',
  interactivityLevel: 'interactive'
};

/**
 * ADVANCED INTERFACE
 * - Detailed technical questions
 * - Mostly custom input expected
 * - Access to raw data
 * - Can define custom metrics
 * - Can compare scenarios
 */
export const ADVANCED_INTERFACE: SkillLevelInterface = {
  questionnaire: [
    'Full organization profile (can import from Crunchbase/SEC)',
    'Detailed target profile (with geographic specificity)',
    'Investment structure (debt/equity breakdown)',
    'Expected cash flows (or scenarios)',
    'Key success factors (you define)',
    'Risk parameters (you prioritize)',
    'Comparison targets (other companies/regions)'
  ],
  defaultOptions: [], // Expected to provide custom
  allowCustomInput: true, // Primary mode
  detailLevel: 'comprehensive',
  reportSections: [
    'full_executive_summary',
    'historical_pattern_analysis',
    'government_incentive_comparison',
    'banking_environment_analysis',
    'competitive_landscape',
    'financial_projections_detailed',
    'risk_assessment_comprehensive',
    'scenario_analysis',
    'sensitivity_analysis',
    'implementation_roadmap_detailed'
  ],
  explanationLevel: 'minimal',
  interactivityLevel: 'interactive'
};

/**
 * EXPERT INTERFACE
 * - Full data access
 * - Custom algorithm configuration
 * - Multi-scenario modeling
 * - Can extend the system
 * - Access to raw agent responses
 */
export const EXPERT_INTERFACE: SkillLevelInterface = {
  questionnaire: [], // They know what they need
  defaultOptions: [],
  allowCustomInput: true,
  detailLevel: 'comprehensive',
  reportSections: [
    'all' // Access to everything
  ],
  explanationLevel: 'minimal',
  interactivityLevel: 'interactive'
};

/**
 * CUSTOM DOMAIN EXPERT INTERFACE
 * - If they specify domain: 'finance', 'government', 'corporate'
 * - Specialized questions for their domain
 * - Deep dives into relevant data
 */
export const DOMAIN_EXPERT_INTERFACES: Record<string, SkillLevelInterface> = {
  finance: {
    questionnaire: [
      'Investment size & structure',
      'Required IRR/payback period',
      'Currency exposure preferences',
      'Hedging strategy',
      'Financing source (equity/debt/mixed)',
      'Tax optimization priorities',
      'Historical cost of capital'
    ],
    defaultOptions: [],
    allowCustomInput: true,
    detailLevel: 'comprehensive',
    reportSections: [
      'financial_projections_detailed',
      'banking_environment_analysis',
      'currency_risk_analysis',
      'historical_financing_patterns',
      'tax_optimization_scenarios'
    ],
    explanationLevel: 'minimal',
    interactivityLevel: 'interactive'
  },

  government: {
    questionnaire: [
      'Policy objective (job creation, tax revenue, infrastructure, etc.)',
      'Incentive budget available',
      'Target sectors',
      'Investment size preferences',
      'Employment requirements',
      'Technology/skills transfer goals',
      'Local content requirements'
    ],
    defaultOptions: [],
    allowCustomInput: true,
    detailLevel: 'comprehensive',
    reportSections: [
      'government_incentive_history',
      'comparative_incentive_analysis',
      'outcome_analysis_by_incentive_type',
      'policy_recommendations',
      'forecast_of_likely_investor_response'
    ],
    explanationLevel: 'minimal',
    interactivityLevel: 'interactive'
  },

  corporate: {
    questionnaire: [
      'Company profile (size, sector, market position)',
      'Strategic objectives (revenue growth, market share, capacity)',
      'Competitive positioning',
      'Synergy opportunities',
      'Divestiture/consolidation plans',
      'Organizational capabilities to leverage',
      'Investment decision timeline'
    ],
    defaultOptions: [],
    allowCustomInput: true,
    detailLevel: 'comprehensive',
    reportSections: [
      'competitive_landscape_detailed',
      'strategic_positioning_analysis',
      'corporate_expansion_patterns',
      'synergy_identification',
      'market_share_scenarios',
      'acquisition_vs_organic_analysis'
    ],
    explanationLevel: 'minimal',
    interactivityLevel: 'interactive'
  }
};

/**
 * ADAPTIVE QUESTIONNAIRE SYSTEM
 * Asks progressively more detailed questions based on answers
 */
export class AdaptiveQuestionnaire {
  /**
   * Detect user skill level from initial answers
   */
  static detectSkillLevel(answers: Record<string, any>): SkillLevel {
    let score = 0;

    // Check depth of understanding in answers
    if (answers.organizationName && answers.organizationName.length > 3) score += 10;
    if (answers.revenueBand && answers.revenueBand !== 'not_sure') score += 5;
    if (answers.strategicIntent && answers.strategicIntent.length > 50) score += 15;
    if (answers.investmentStructure && typeof answers.investmentStructure === 'object') score += 20;
    if (answers.successMetrics && answers.successMetrics.length > 5) score += 10;
    if (answers.riskScenarios && Array.isArray(answers.riskScenarios)) score += 15;
    if (answers.customData && Object.keys(answers.customData).length > 0) score += 20;

    if (score > 70) return 'expert';
    if (score > 50) return 'advanced';
    if (score > 25) return 'intermediate';
    return 'beginner';
  }

  /**
   * Get next question based on current answers
   */
  static getNextQuestion(
    skillLevel: SkillLevel,
    currentAnswers: Record<string, any>,
    questionsAsked: number
  ): string | null {
    const interface_ =
      skillLevel === 'expert'
        ? EXPERT_INTERFACE
        : skillLevel === 'advanced'
        ? ADVANCED_INTERFACE
        : skillLevel === 'intermediate'
        ? INTERMEDIATE_INTERFACE
        : BEGINNER_INTERFACE;

    if (questionsAsked >= interface_.questionnaire.length) {
      return null; // All questions asked
    }

    // Could implement branching logic here
    // If they answer "beginner" to one question, skip technical questions

    return interface_.questionnaire[questionsAsked];
  }
}

/**
 * CUSTOM DATA INTEGRATION FOR ALL LEVELS
 * Everyone can add their own data, with appropriate scaffolding
 */
export class CustomDataIntegration {
  /**
   * Get data entry form appropriate for skill level
   */
  static getDataEntryForm(skillLevel: SkillLevel) {
    if (skillLevel === 'beginner') {
      return {
        title: 'Add Information You Know',
        description: 'Help us provide better analysis by sharing what you know',
        fields: [
          {
            label: 'Do you know any successful companies in this market?',
            type: 'text',
            placeholder: 'Company name (e.g., Samsung, Infosys)'
          },
          {
            label: 'What was their annual revenue?',
            type: 'number',
            placeholder: 'In millions USD'
          },
          {
            label: 'How many jobs did they create?',
            type: 'number'
          }
        ]
      };
    }

    if (skillLevel === 'intermediate') {
      return {
        title: 'Provide Custom Data',
        description: 'Add company data, government incentives, or market information',
        fields: [
          {
            label: 'Data source type',
            type: 'select',
            options: ['Company case', 'Government incentive', 'Market data', 'Labor data', 'Other']
          },
          { label: 'Year(s) covered', type: 'text', placeholder: '1998-2004' },
          {
            label: 'Key metrics (JSON)',
            type: 'textarea',
            placeholder: '{"revenue": 100, "jobs": 500, "roi": 2.5}'
          },
          { label: 'Source (URL or description)', type: 'text' }
        ]
      };
    }

    if (skillLevel === 'advanced' || skillLevel === 'expert') {
      return {
        title: 'Data Integration',
        description: 'Connect or upload your data sources',
        fields: [
          {
            label: 'Data source type',
            type: 'select',
            options: [
              'API (Crunchbase, Bloomberg, etc.)',
              'CSV upload',
              'JSON/REST endpoint',
              'Direct database connection',
              'Custom calculation'
            ]
          },
          { label: 'Source configuration', type: 'textarea', placeholder: 'API key, file, or query' },
          {
            label: 'Data mapping (how to integrate)',
            type: 'textarea',
            placeholder: 'Field mapping and transformation logic'
          },
          {
            label: 'Validation rules',
            type: 'textarea',
            placeholder: 'Data quality checks'
          }
        ]
      };
    }

    return {};
  }
}

/**
 * REPORT RENDERER ADAPTS TO SKILL LEVEL
 */
export class AdaptiveReportRenderer {
  /**
   * Get report sections appropriate for skill level
   */
  static getReportSections(skillLevel: SkillLevel): string[] {
    const interfaces = {
      beginner: BEGINNER_INTERFACE,
      intermediate: INTERMEDIATE_INTERFACE,
      advanced: ADVANCED_INTERFACE,
      expert: EXPERT_INTERFACE
    };

    return interfaces[skillLevel].reportSections;
  }

  /**
   * Render section with appropriate detail level
   */
  static renderSection(
    sectionName: string,
    data: any,
    skillLevel: SkillLevel
  ): {
    title: string;
    content: string;
    details?: any;
    explanation?: string;
    sources?: string[];
  } {
    const detail =
      skillLevel === 'beginner'
        ? 'summary'
        : skillLevel === 'intermediate'
        ? 'moderate'
        : 'comprehensive';

    // Would implement section-specific rendering here
    return {
      title: sectionName,
      content: `Content for ${sectionName} at ${detail} level`,
      explanation:
        skillLevel === 'beginner'
          ? 'Explanation of what this means and why it matters'
          : undefined,
      sources: skillLevel !== 'beginner' ? ['Source 1', 'Source 2'] : undefined
    };
  }
}

export default AdaptiveQuestionnaire;
