/**
 * DECISION TREE SYNTHESIZER - Template Selection for Report Synthesis
 * 
 * Uses a decision tree to select the optimal report template and structure
 * based on input characteristics, scores, and use case requirements.
 * 
 * Instead of fixed templates, dynamically assembles report sections
 * based on what's most relevant for the specific scenario.
 * 
 * Features:
 * - Rule-based decision tree for template selection
 * - Conditional section inclusion
 * - Priority-based content ordering
 * - Audience-aware language adaptation
 */

import type { ReportParameters, ReportPayload } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export type TemplateId = 
  | 'investor-brief'
  | 'partner-outreach'
  | 'board-presentation'
  | 'due-diligence'
  | 'risk-assessment'
  | 'market-entry'
  | 'expansion-strategy'
  | 'comprehensive';

export type SectionId =
  | 'executive-summary'
  | 'opportunity-overview'
  | 'market-analysis'
  | 'risk-register'
  | 'financial-projections'
  | 'stakeholder-map'
  | 'implementation-roadmap'
  | 'partner-profiles'
  | 'competitive-landscape'
  | 'regulatory-pathway'
  | 'scenario-analysis'
  | 'recommendation'
  | 'appendices';

export interface DecisionNode {
  id: string;
  condition: (params: ReportParameters, payload?: ReportPayload) => boolean;
  trueChild?: DecisionNode | TemplateId;
  falseChild?: DecisionNode | TemplateId;
}

export interface TemplatePlan {
  templateId: TemplateId;
  sections: SectionPlan[];
  audience: string;
  tone: 'formal' | 'executive' | 'technical' | 'conversational';
  estimatedPages: number;
  priority: 'high' | 'medium' | 'low';
}

export interface SectionPlan {
  sectionId: SectionId;
  title: string;
  priority: number;
  included: boolean;
  conditionalReason?: string;
  subSections?: string[];
  dataPoints: string[];
}

export interface SynthesisResult {
  plan: TemplatePlan;
  decisionPath: string[];
  confidence: number;
  alternativeTemplates: TemplateId[];
}

// ============================================================================
// SECTION DEFINITIONS
// ============================================================================

const SECTION_DEFINITIONS: Record<SectionId, { title: string; basePriority: number; dataPoints: string[] }> = {
  'executive-summary': {
    title: 'Executive Summary',
    basePriority: 100,
    dataPoints: ['overall-score', 'recommendation', 'top-risks', 'top-opportunities']
  },
  'opportunity-overview': {
    title: 'Opportunity Overview',
    basePriority: 90,
    dataPoints: ['problem-statement', 'strategic-intent', 'target-market', 'value-proposition']
  },
  'market-analysis': {
    title: 'Market Analysis',
    basePriority: 80,
    dataPoints: ['market-size', 'growth-rates', 'competitive-dynamics', 'entry-barriers']
  },
  'risk-register': {
    title: 'Risk Register',
    basePriority: 85,
    dataPoints: ['political-risk', 'regulatory-risk', 'operational-risk', 'financial-risk', 'mitigations']
  },
  'financial-projections': {
    title: 'Financial Projections',
    basePriority: 75,
    dataPoints: ['rroi', 'tco', 'break-even', 'scenario-ranges']
  },
  'stakeholder-map': {
    title: 'Stakeholder & Alignment Map',
    basePriority: 70,
    dataPoints: ['seam-score', 'key-stakeholders', 'alignment-gaps', 'influence-network']
  },
  'implementation-roadmap': {
    title: 'Implementation Roadmap',
    basePriority: 65,
    dataPoints: ['ivas-score', 'milestones', 'timeline', 'resource-requirements']
  },
  'partner-profiles': {
    title: 'Partner Profiles',
    basePriority: 60,
    dataPoints: ['partner-matches', 'fit-scores', 'contact-info', 'partnership-models']
  },
  'competitive-landscape': {
    title: 'Competitive Landscape',
    basePriority: 55,
    dataPoints: ['competitors', 'market-share', 'differentiation', 'moats']
  },
  'regulatory-pathway': {
    title: 'Regulatory Pathway',
    basePriority: 60,
    dataPoints: ['rni-score', 'licenses-required', 'timeline', 'compliance-costs']
  },
  'scenario-analysis': {
    title: 'Scenario Analysis',
    basePriority: 50,
    dataPoints: ['base-case', 'upside', 'downside', 'stress-tests']
  },
  'recommendation': {
    title: 'Recommendation & Next Steps',
    basePriority: 95,
    dataPoints: ['proceed-signal', 'critical-actions', 'decision-points', 'go-no-go']
  },
  'appendices': {
    title: 'Appendices',
    basePriority: 10,
    dataPoints: ['data-sources', 'methodology', 'detailed-scores', 'persona-debate']
  }
};

// ============================================================================
// TEMPLATE DEFINITIONS
// ============================================================================

const TEMPLATE_SECTIONS: Record<TemplateId, SectionId[]> = {
  'investor-brief': [
    'executive-summary',
    'opportunity-overview',
    'financial-projections',
    'risk-register',
    'recommendation'
  ],
  'partner-outreach': [
    'executive-summary',
    'opportunity-overview',
    'stakeholder-map',
    'partner-profiles',
    'recommendation'
  ],
  'board-presentation': [
    'executive-summary',
    'market-analysis',
    'financial-projections',
    'risk-register',
    'scenario-analysis',
    'recommendation'
  ],
  'due-diligence': [
    'executive-summary',
    'market-analysis',
    'competitive-landscape',
    'financial-projections',
    'risk-register',
    'regulatory-pathway',
    'stakeholder-map',
    'appendices'
  ],
  'risk-assessment': [
    'executive-summary',
    'risk-register',
    'regulatory-pathway',
    'scenario-analysis',
    'recommendation',
    'appendices'
  ],
  'market-entry': [
    'executive-summary',
    'market-analysis',
    'competitive-landscape',
    'regulatory-pathway',
    'implementation-roadmap',
    'partner-profiles',
    'recommendation'
  ],
  'expansion-strategy': [
    'executive-summary',
    'opportunity-overview',
    'market-analysis',
    'stakeholder-map',
    'implementation-roadmap',
    'financial-projections',
    'recommendation'
  ],
  'comprehensive': [
    'executive-summary',
    'opportunity-overview',
    'market-analysis',
    'competitive-landscape',
    'stakeholder-map',
    'partner-profiles',
    'financial-projections',
    'risk-register',
    'regulatory-pathway',
    'implementation-roadmap',
    'scenario-analysis',
    'recommendation',
    'appendices'
  ]
};

// ============================================================================
// DECISION TREE
// ============================================================================

const buildDecisionTree = (): DecisionNode => {
  return {
    id: 'root',
    condition: (params) => params.organizationType === 'Investor' || 
                           params.strategicIntent?.some(i => i.toLowerCase().includes('investment')),
    trueChild: {
      id: 'investor-path',
      condition: (params) => params.riskTolerance === 'low',
      trueChild: 'due-diligence',
      falseChild: 'investor-brief'
    },
    falseChild: {
      id: 'non-investor',
      condition: (params) => params.strategicIntent?.some(i => 
        i.toLowerCase().includes('partner') || i.toLowerCase().includes('joint')),
      trueChild: 'partner-outreach',
      falseChild: {
        id: 'strategy-focus',
        condition: (params) => params.strategicIntent?.some(i =>
          i.toLowerCase().includes('expansion') || i.toLowerCase().includes('market entry')),
        trueChild: {
          id: 'expansion-type',
          condition: (params) => params.expansionTimeline === 'immediate' || 
                                 params.expansionTimeline === '0-6 months',
          trueChild: 'market-entry',
          falseChild: 'expansion-strategy'
        },
        falseChild: {
          id: 'risk-focus',
          condition: (params) => params.riskTolerance === 'low' || 
                                 params.priorityThemes?.includes('Risk Management'),
          trueChild: 'risk-assessment',
          falseChild: {
            id: 'board-check',
            condition: (params) => params.organizationType === 'Government' ||
                                   params.organizationType === 'Corporate' ||
                                   (params.headcountBand?.includes('1000') ?? false),
            trueChild: 'board-presentation',
            falseChild: 'comprehensive'
          }
        }
      }
    }
  };
};

// ============================================================================
// DECISION TREE SYNTHESIZER
// ============================================================================

export class DecisionTreeSynthesizer {
  private decisionTree: DecisionNode;

  constructor() {
    this.decisionTree = buildDecisionTree();
  }

  /**
   * Traverse decision tree to select optimal template
   */
  selectTemplate(params: ReportParameters, payload?: ReportPayload): SynthesisResult {
    const decisionPath: string[] = [];
    let currentNode: DecisionNode | TemplateId = this.decisionTree;
    
    while (typeof currentNode !== 'string') {
      decisionPath.push(currentNode.id);
      const result = currentNode.condition(params, payload);
      decisionPath.push(`→ ${result ? 'true' : 'false'}`);
      
      if (result) {
        currentNode = currentNode.trueChild || 'comprehensive';
      } else {
        currentNode = currentNode.falseChild || 'comprehensive';
      }
    }

    const templateId = currentNode;
    const plan = this.buildTemplatePlan(templateId, params, payload);
    
    // Calculate confidence based on how well params match template
    const confidence = this.calculateConfidence(templateId, params);
    
    // Find alternative templates that might also fit
    const alternativeTemplates = this.findAlternatives(templateId, params);

    return {
      plan,
      decisionPath,
      confidence,
      alternativeTemplates
    };
  }

  /**
   * Build detailed template plan with conditional sections
   */
  private buildTemplatePlan(templateId: TemplateId, params: ReportParameters, payload?: ReportPayload): TemplatePlan {
    const sectionIds = TEMPLATE_SECTIONS[templateId];
    const sections: SectionPlan[] = [];

    for (const sectionId of sectionIds) {
      const def = SECTION_DEFINITIONS[sectionId];
      const included = this.shouldIncludeSection(sectionId, params, payload);
      
      sections.push({
        sectionId,
        title: def.title,
        priority: this.adjustPriority(def.basePriority, sectionId, params),
        included: included.include,
        conditionalReason: included.reason,
        dataPoints: def.dataPoints
      });
    }

    // Sort by priority
    sections.sort((a, b) => b.priority - a.priority);

    return {
      templateId,
      sections,
      audience: this.determineAudience(params),
      tone: this.determineTone(params),
      estimatedPages: this.estimatePages(sections),
      priority: this.determinePriority(params)
    };
  }

  /**
   * Determine if a section should be included
   */
  private shouldIncludeSection(sectionId: SectionId, params: ReportParameters, _payload?: ReportPayload): 
    { include: boolean; reason?: string } {
    
    switch (sectionId) {
      case 'partner-profiles':
        if (!params.targetCounterpartType?.length) {
          return { include: false, reason: 'No partner types specified' };
        }
        break;
      
      case 'regulatory-pathway': {
        const regulated = ['finance', 'healthcare', 'pharma', 'banking', 'insurance', 'energy'];
        if (!params.industry?.some(i => regulated.some(r => i.toLowerCase().includes(r)))) {
          return { include: false, reason: 'Not a heavily regulated industry' };
        }
        break;
      }
      
      case 'stakeholder-map':
        if (!params.stakeholderAlignment?.length && !params.targetCounterpartType?.length) {
          return { include: false, reason: 'No stakeholders identified' };
        }
        break;
      
      case 'scenario-analysis':
        if (params.riskTolerance === 'high') {
          return { include: false, reason: 'High risk tolerance - scenarios less critical' };
        }
        break;
      
      case 'appendices':
        // Always include for due diligence, otherwise conditional
        if (params.riskTolerance !== 'low' && params.organizationType !== 'Investor') {
          return { include: false, reason: 'Appendices optional for non-diligence reports' };
        }
        break;
    }

    return { include: true };
  }

  /**
   * Adjust section priority based on context
   */
  private adjustPriority(basePriority: number, sectionId: SectionId, params: ReportParameters): number {
    let priority = basePriority;

    // Boost risk sections for low risk tolerance
    if (params.riskTolerance === 'low' && 
        ['risk-register', 'regulatory-pathway', 'scenario-analysis'].includes(sectionId)) {
      priority += 15;
    }

    // Boost financial sections for investors
    if (params.organizationType === 'Investor' &&
        ['financial-projections', 'scenario-analysis'].includes(sectionId)) {
      priority += 10;
    }

    // Boost partner sections for partnership focus
    if (params.strategicIntent?.some(i => i.toLowerCase().includes('partner')) &&
        ['partner-profiles', 'stakeholder-map'].includes(sectionId)) {
      priority += 12;
    }

    // Boost implementation for short timelines
    if ((params.expansionTimeline === 'immediate' || params.expansionTimeline === '0-6 months') &&
        sectionId === 'implementation-roadmap') {
      priority += 15;
    }

    return Math.min(priority, 100);
  }

  /**
   * Calculate confidence in template selection
   */
  private calculateConfidence(templateId: TemplateId, params: ReportParameters): number {
    let confidence = 70; // Base confidence

    // Boost for clear signals
    if (params.organizationType) confidence += 5;
    if (params.strategicIntent?.length) confidence += 5;
    if (params.riskTolerance) confidence += 5;
    if (params.industry?.length) confidence += 3;
    if (params.targetCounterpartType?.length) confidence += 3;

    // Template-specific boosts
    switch (templateId) {
      case 'investor-brief':
        if (params.organizationType === 'Investor') confidence += 10;
        break;
      case 'partner-outreach':
        if (params.targetCounterpartType?.length) confidence += 10;
        break;
      case 'risk-assessment':
        if (params.riskTolerance === 'low') confidence += 10;
        break;
    }

    return Math.min(confidence, 98);
  }

  /**
   * Find alternative templates that might fit
   */
  private findAlternatives(selectedId: TemplateId, params: ReportParameters): TemplateId[] {
    const alternatives: TemplateId[] = [];
    const allTemplates: TemplateId[] = [
      'investor-brief', 'partner-outreach', 'board-presentation',
      'due-diligence', 'risk-assessment', 'market-entry',
      'expansion-strategy', 'comprehensive'
    ];

    for (const template of allTemplates) {
      if (template === selectedId) continue;
      if (template === 'comprehensive') continue; // Always available
      
      // Check if alternative could fit
      const couldFit = this.templateCouldFit(template, params);
      if (couldFit) {
        alternatives.push(template);
      }
    }

    return alternatives.slice(0, 2); // Max 2 alternatives
  }

  private templateCouldFit(templateId: TemplateId, params: ReportParameters): boolean {
    switch (templateId) {
      case 'investor-brief':
        return !!(params.dealSize === 'large' || params.dealSize === 'enterprise');
      case 'partner-outreach':
        return (params.targetCounterpartType?.length || 0) > 0;
      case 'risk-assessment':
        return params.riskTolerance === 'low' || params.riskTolerance === 'conservative';
      case 'market-entry':
        return params.country !== undefined;
      default:
        return false;
    }
  }

  private determineAudience(params: ReportParameters): string {
    if (params.organizationType === 'Investor') return 'Investment Committee / LP';
    if (params.organizationType === 'Government') return 'Government Officials / Policy Makers';
    if (params.organizationType === 'Corporate') return 'Executive Leadership / Board';
    return 'Strategic Decision Makers';
  }

  private determineTone(params: ReportParameters): TemplatePlan['tone'] {
    if (params.organizationType === 'Government') return 'formal';
    if (params.organizationType === 'Investor' || params.riskTolerance === 'low') return 'executive';
    if (params.organizationType === 'Startup') return 'conversational';
    return 'executive';
  }

  private estimatePages(sections: SectionPlan[]): number {
    const includedSections = sections.filter(s => s.included);
    return Math.ceil(includedSections.length * 2.5); // Rough estimate: 2.5 pages per section
  }

  private determinePriority(params: ReportParameters): TemplatePlan['priority'] {
    if (params.expansionTimeline === 'immediate') return 'high';
    if (params.expansionTimeline === '0-6 months') return 'high';
    if (params.riskTolerance === 'low') return 'high';
    return 'medium';
  }

  /**
   * Override template selection (for user preference)
   */
  forceTemplate(templateId: TemplateId, params: ReportParameters, payload?: ReportPayload): TemplatePlan {
    return this.buildTemplatePlan(templateId, params, payload);
  }
}

// Singleton instance
export const decisionTreeSynthesizer = new DecisionTreeSynthesizer();

export default DecisionTreeSynthesizer;
