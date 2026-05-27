import { ReportParameters, MotivationAnalysis, MotivationRedFlag } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// ============================================================================
// EXPANDED TRIGGER WORD PATTERNS
// ============================================================================

interface TriggerPattern {
  pattern: RegExp;
  category: string;
  implication: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

const TRIGGER_PATTERNS: TriggerPattern[] = [
  // CRISIS SIGNALS
  { pattern: /turnaround|restructur|rescue|distress|troubled|failing/i, category: 'crisis', implication: 'Organization in distress mode', riskLevel: 'high', recommendation: 'Conduct thorough due diligence on organizational health' },
  { pattern: /urgent|immediate|asap|emergency|critical timeline/i, category: 'urgency', implication: 'Time pressure may lead to suboptimal decisions', riskLevel: 'medium', recommendation: 'Validate urgency drivers and consider phased approach' },
  { pattern: /desperate|last resort|no other option|must happen/i, category: 'desperation', implication: 'Limited negotiating leverage', riskLevel: 'high', recommendation: 'Expand options before committing' },
  
  // CAPITAL SIGNALS
  { pattern: /liquidity|cash flow|funding gap|capital shortage/i, category: 'capital-stress', implication: 'Financial pressure driving decisions', riskLevel: 'high', recommendation: 'Ensure financial sustainability before partnership' },
  { pattern: /investor pressure|board mandate|shareholder demand/i, category: 'external-pressure', implication: 'External stakeholders driving agenda', riskLevel: 'medium', recommendation: 'Align all stakeholders on partnership objectives' },
  { pattern: /debt|leverage|refinanc/i, category: 'debt-concern', implication: 'Debt structure may constrain options', riskLevel: 'medium', recommendation: 'Review debt covenants and constraints' },
  
  // EXPANSION SIGNALS
  { pattern: /expansion|scale|grow|market entry|new market/i, category: 'growth', implication: 'Growth-oriented strategy', riskLevel: 'low', recommendation: 'Validate market opportunity and execution capacity' },
  { pattern: /diversif|portfolio|spread risk/i, category: 'diversification', implication: 'Risk spreading motivation', riskLevel: 'low', recommendation: 'Ensure diversification adds value, not complexity' },
  { pattern: /first mover|competitive advantage|market share/i, category: 'competitive', implication: 'Competitive positioning priority', riskLevel: 'medium', recommendation: 'Validate sustainable competitive advantage' },
  
  // RISK SIGNALS
  { pattern: /sanction|embargo|restricted|blacklist/i, category: 'sanctions', implication: 'Sanctions exposure requires careful navigation', riskLevel: 'critical', recommendation: 'Conduct comprehensive sanctions screening' },
  { pattern: /corruption|bribery|fcpa|anti-corruption/i, category: 'corruption', implication: 'Corruption risk in operating environment', riskLevel: 'critical', recommendation: 'Implement robust anti-corruption controls' },
  { pattern: /political|government relations|regulatory capture/i, category: 'political', implication: 'Political factors influence outcomes', riskLevel: 'medium', recommendation: 'Develop political risk mitigation strategy' },
  { pattern: /litigation|lawsuit|legal dispute|arbitration/i, category: 'legal', implication: 'Legal complications may arise', riskLevel: 'high', recommendation: 'Review legal exposure and contingencies' },
  
  // GOVERNANCE SIGNALS
  { pattern: /family business|founder|succession/i, category: 'governance', implication: 'Governance complexity in family/founder context', riskLevel: 'medium', recommendation: 'Clarify decision-making authority and succession' },
  { pattern: /conflict of interest|related party|insider/i, category: 'conflict', implication: 'Potential conflicts require management', riskLevel: 'high', recommendation: 'Establish clear conflict management protocols' },
  { pattern: /minority|majority control|voting rights/i, category: 'control', implication: 'Control dynamics affect partnership structure', riskLevel: 'medium', recommendation: 'Define governance rights clearly' },
  
  // OPPORTUNITY SIGNALS
  { pattern: /innovation|technology|digital transform/i, category: 'innovation', implication: 'Technology-driven opportunity', riskLevel: 'low', recommendation: 'Validate technology readiness and IP position' },
  { pattern: /sustainab|esg|green|climate|carbon/i, category: 'sustainability', implication: 'ESG considerations important', riskLevel: 'low', recommendation: 'Align on sustainability metrics and targets' },
  { pattern: /export|trade|cross-border|international/i, category: 'trade', implication: 'Cross-border operations involved', riskLevel: 'medium', recommendation: 'Review trade compliance and logistics' },
  
  // PARTNERSHIP SIGNALS
  { pattern: /joint venture|jv|partnership|alliance|consortium/i, category: 'partnership', implication: 'Collaborative structure planned', riskLevel: 'low', recommendation: 'Define partnership governance and exit mechanisms' },
  { pattern: /acquisition|acquire|buy|m&a|takeover/i, category: 'acquisition', implication: 'Acquisition-focused strategy', riskLevel: 'medium', recommendation: 'Conduct comprehensive due diligence' },
  { pattern: /exclusive|sole|monopoly|only partner/i, category: 'exclusivity', implication: 'Exclusivity expectations present', riskLevel: 'medium', recommendation: 'Evaluate exclusivity trade-offs carefully' },
  
  // HIDDEN RISK SIGNALS
  { pattern: /confidential|secret|off the record|not public/i, category: 'confidentiality', implication: 'Information asymmetry may exist', riskLevel: 'high', recommendation: 'Ensure adequate disclosure before commitment' },
  { pattern: /previous failure|past attempt|tried before|second chance/i, category: 'history', implication: 'Previous attempts failed - learn from history', riskLevel: 'high', recommendation: 'Analyze previous failure causes thoroughly' },
  { pattern: /competitor|rival|threat|losing ground/i, category: 'competitive-threat', implication: 'Competitive pressure driving urgency', riskLevel: 'medium', recommendation: 'Separate reactive vs. strategic motivations' }
];

interface TriggeredSignal {
  pattern: string;
  category: string;
  implication: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  matchedText: string;
}

class MotivationDetector {
  /**
   * Scan all text inputs for trigger patterns
   */
  static scanForTriggers(params: ReportParameters): TriggeredSignal[] {
    const signals: TriggeredSignal[] = [];
    
    // Collect all text to scan
    const textsToScan = [
      params.missionRequestSummary || '',
      params.problemStatement || '',
      params.additionalContext || '',
      params.collaborativeNotes || '',
      ...(params.strategicIntent || []),
      ...(params.priorityThemes || []),
      ...(params.politicalSensitivities || []),
      params.idealPartnerProfile || '',
      params.targetPartner || ''
    ].filter(Boolean);
    
    const combinedText = textsToScan.join(' ');
    
    // Scan for each pattern
    TRIGGER_PATTERNS.forEach(trigger => {
      const match = combinedText.match(trigger.pattern);
      if (match) {
        signals.push({
          pattern: trigger.pattern.source,
          category: trigger.category,
          implication: trigger.implication,
          riskLevel: trigger.riskLevel,
          recommendation: trigger.recommendation,
          matchedText: match[0]
        });
      }
    });
    
    return signals;
  }

  /**
   * Get early warning signals based on input analysis
   */
  static getEarlyWarnings(params: ReportParameters): {
    warnings: Array<{
      title: string;
      description: string;
      severity: 'info' | 'warning' | 'critical';
      action: string;
    }>;
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  } {
    const triggers = this.scanForTriggers(params);
    const warnings: Array<{
      title: string;
      description: string;
      severity: 'info' | 'warning' | 'critical';
      action: string;
    }> = [];

    // Convert triggers to warnings
    triggers.forEach(trigger => {
      warnings.push({
        title: `${trigger.category.toUpperCase()} Signal Detected`,
        description: `${trigger.implication}. Matched: "${trigger.matchedText}"`,
        severity: trigger.riskLevel === 'critical' ? 'critical' : 
                  trigger.riskLevel === 'high' ? 'warning' : 'info',
        action: trigger.recommendation
      });
    });

    // Determine overall risk level
    const criticalCount = triggers.filter(t => t.riskLevel === 'critical').length;
    const highCount = triggers.filter(t => t.riskLevel === 'high').length;
    
    let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalCount > 0) overallRiskLevel = 'critical';
    else if (highCount >= 2) overallRiskLevel = 'high';
    else if (highCount >= 1 || triggers.length >= 3) overallRiskLevel = 'medium';

    return { warnings, overallRiskLevel };
  }

  static analyze(params: ReportParameters): MotivationAnalysis {
    const statedMotivation = params.missionRequestSummary || params.problemStatement || 'Not explicitly stated';
    const impliedMotivation = this.deriveImpliedMotivation(params);
    const redFlags = this.buildRedFlags(params);
    
    // Include trigger-based signals in red flags
    const triggerSignals = this.scanForTriggers(params);
    triggerSignals.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical').forEach(trigger => {
      redFlags.push({
        flag: `${trigger.category} signal: ${trigger.matchedText}`,
        evidence: trigger.implication,
        probability: trigger.riskLevel === 'critical' ? 0.8 : 0.6
      });
    });

    let alignmentScore = 72;
    if (params.stakeholderAlignment?.length) alignmentScore += 6;
    if (params.partnerReadinessLevel === 'high') alignmentScore += 4;
    if (params.expansionTimeline?.includes('3')) alignmentScore -= 8;
    alignmentScore -= redFlags.reduce((sum, flag) => sum + Math.round(flag.probability * 10), 0);
    const normalizedScore = clamp(alignmentScore, 5, 95);

    const narrativeParts: string[] = [];
    narrativeParts.push(`Declared motive centers on ${impliedMotivation.toLowerCase()}.`);
    if (redFlags.length) {
      narrativeParts.push(`${redFlags.length} conflicting signals detected across capital, governance, or timing.`);
    } else {
      narrativeParts.push('No material motivation contradictions detected.');
    }
    if (params.priorityThemes?.length) {
      narrativeParts.push(`Priority themes (${params.priorityThemes.join(', ')}) reinforce the stated posture.`);
    }
    
    // Add trigger summary
    if (triggerSignals.length > 0) {
      const categories = [...new Set(triggerSignals.map(t => t.category))];
      narrativeParts.push(`Early detection identified ${triggerSignals.length} patterns in categories: ${categories.join(', ')}.`);
    }

    return {
      statedMotivation,
      impliedMotivation,
      alignmentScore: normalizedScore,
      redFlags,
      narrative: narrativeParts.join(' ')
    };
  }

  private static deriveImpliedMotivation(params: ReportParameters): string {
    // Use trigger patterns for more sophisticated detection
    const triggers = this.scanForTriggers(params);
    const categories = triggers.map(t => t.category);
    
    if (categories.includes('crisis') || categories.includes('desperation')) {
      return 'crisis stabilization and damage control';
    }
    if (categories.includes('capital-stress') || categories.includes('debt-concern')) {
      return 'capital relief and liquidity access';
    }
    if (categories.includes('growth') || categories.includes('competitive')) {
      return 'aggressive market expansion';
    }
    if (categories.includes('sanctions') || categories.includes('corruption')) {
      return 'risk hedging and governance hardening';
    }
    if (categories.includes('partnership') || categories.includes('acquisition')) {
      return 'strategic partnership or acquisition';
    }
    if (categories.includes('innovation') || categories.includes('sustainability')) {
      return 'innovation-driven transformation';
    }
    
    // Fallback to original logic
    if (params.strategicIntent?.some(intent => /turnaround|stabilize|rescue/i.test(intent))) {
      return 'crisis stabilization and damage control';
    }
    if (params.priorityThemes?.some(theme => /capital|liquidity|financing/i.test(theme))) {
      return 'capital relief and liquidity access';
    }
    if (params.strategicIntent?.some(intent => /expansion|scale|market entry/i.test(intent))) {
      return 'aggressive market expansion';
    }
    if (params.priorityThemes?.some(theme => /governance|compliance|risk/i.test(theme))) {
      return 'risk hedging and governance hardening';
    }
    return 'balanced growth and partnership building';
  }

  private static buildRedFlags(params: ReportParameters): MotivationRedFlag[] {
    const redFlags: MotivationRedFlag[] = [];

    if ((params.expansionTimeline?.includes('3') || params.expansionTimeline?.includes('0_6')) && params.dealSize && params.riskTolerance === 'low') {
      redFlags.push({
        flag: 'Urgency/aversion mismatch',
        evidence: `Compressed timeline (${params.expansionTimeline}) declared with low risk tolerance.`,
        probability: 0.65
      });
    }

    if (params.dealSize && !params.calibration?.constraints?.budgetCap) {
      redFlags.push({
        flag: 'Opaque capital plan',
        evidence: `Deal size ${params.dealSize} specified without any budget ceiling in calibration block.`,
        probability: 0.55
      });
    }

    if (!params.stakeholderAlignment?.length && params.partnerPersonas?.length) {
      redFlags.push({
        flag: 'Unaligned stakeholders',
        evidence: 'Partner personas documented but no internal stakeholder alignment declared.',
        probability: 0.45
      });
    }

    if (params.politicalSensitivities?.includes('Corruption') || params.politicalSensitivities?.includes('Sanctions')) {
      redFlags.push({
        flag: 'Governance pressure',
        evidence: 'User highlighted corruption or sanctions sensitivities, indicating legacy issues.',
        probability: 0.5
      });
    }

    if (params.partnerReadinessLevel === 'low' && params.strategicIntent?.some(intent => /acquisition|joint venture|partnership/i.test(intent || ''))) {
      redFlags.push({
        flag: 'Readiness gap',
        evidence: 'Low partner readiness despite partnership-centric mandate.',
        probability: 0.4
      });
    }

    // Additional red flags based on contradictions
    if (params.riskTolerance === 'high' && params.organizationType?.includes('Government')) {
      redFlags.push({
        flag: 'Risk profile mismatch',
        evidence: 'Government entity declared high risk tolerance - unusual and may indicate pressure.',
        probability: 0.55
      });
    }

    if (params.strategicIntent?.some(i => /acquisition/i.test(i)) && params.strategicIntent?.some(i => /partnership/i.test(i))) {
      redFlags.push({
        flag: 'Unclear transaction type',
        evidence: 'Both acquisition and partnership intents declared - clarify primary objective.',
        probability: 0.4
      });
    }

    return redFlags;
  }
}

export default MotivationDetector;
export { TRIGGER_PATTERNS };
export type { TriggerPattern, TriggeredSignal };


