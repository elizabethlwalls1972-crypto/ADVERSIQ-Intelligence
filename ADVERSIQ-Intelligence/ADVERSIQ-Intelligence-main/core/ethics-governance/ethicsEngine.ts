// ============================================================================
// ETHICS & GOVERNANCE ENGINE v6.0
// Real compliance validation, bias detection, and decision explainability
// ============================================================================

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Compliance Rule Registry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface ComplianceRule {
  id: string;
  name: string;
  category: 'sanctions' | 'aml' | 'esg' | 'data_privacy' | 'human_rights' | 'anti_corruption' | 'trade' | 'general';
  description: string;
  evaluate: (action: string, params: any) => ComplianceResult;
  severity: 'block' | 'warn' | 'info';
}

interface ComplianceResult {
  ruleId: string;
  passed: boolean;
  severity: 'block' | 'warn' | 'info';
  message: string;
  details?: string;
  regulation?: string;
}

interface BiasReport {
  biasType: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedFields: string[];
  mitigationSuggestion: string;
  confidence: number;
}

export interface EthicsAssessment {
  isCompliant: boolean;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  complianceResults: ComplianceResult[];
  biasReport: BiasReport[];
  explanation: string;
  recommendations: string[];
  auditTrail: AuditEntry[];
}

interface AuditEntry {
  timestamp: string;
  action: string;
  decision: string;
  reasoning: string;
  rules_evaluated: string[];
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Sanctioned & High-Risk Lists â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SANCTIONED_COUNTRIES = new Set([
  'north korea', 'iran', 'syria', 'cuba', 'crimea', 'donetsk', 'luhansk',
  'dprk', 'myanmar'
]);

const HIGH_RISK_COUNTRIES = new Set([
  'afghanistan', 'iraq', 'libya', 'somalia', 'south sudan', 'yemen',
  'venezuela', 'belarus', 'russia', 'eritrea', 'central african republic'
]);

const RESTRICTED_INDUSTRIES = new Set([
  'weapons', 'arms', 'military', 'tobacco', 'gambling', 'adult entertainment',
  'predatory lending', 'surveillance technology'
]);

const SENSITIVE_INDUSTRIES = new Set([
  'finance', 'banking', 'healthcare', 'pharma', 'mining', 'oil & gas',
  'defence', 'nuclear', 'chemical'
]);

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Rule Definitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'SANCTIONS-001',
    name: 'International Sanctions Check',
    category: 'sanctions',
    description: 'Checks target country against international sanctions lists (UN, EU, OFAC)',
    severity: 'block',
    evaluate: (_action, params) => {
      const country = (params?.country || '').toLowerCase().trim();
      if (SANCTIONED_COUNTRIES.has(country)) {
        return {
          ruleId: 'SANCTIONS-001',
          passed: false,
          severity: 'block',
          message: `Country "${params.country}" is on international sanctions lists. Engagement blocked.`,
          regulation: 'UN Security Council Resolutions, EU Sanctions Regulation, US OFAC SDN List'
        };
      }
      return { ruleId: 'SANCTIONS-001', passed: true, severity: 'block', message: 'Sanctions check passed' };
    }
  },
  {
    id: 'RISK-001',
    name: 'High-Risk Country Warning',
    category: 'aml',
    description: 'Flags high-risk jurisdictions requiring enhanced due diligence',
    severity: 'warn',
    evaluate: (_action, params) => {
      const country = (params?.country || '').toLowerCase().trim();
      if (HIGH_RISK_COUNTRIES.has(country)) {
        return {
          ruleId: 'RISK-001',
          passed: true, // warning, not block
          severity: 'warn',
          message: `Country "${params.country}" is a high-risk jurisdiction. Enhanced due diligence required.`,
          regulation: 'FATF Grey/Black List, EU High-Risk Third Countries'
        };
      }
      return { ruleId: 'RISK-001', passed: true, severity: 'warn', message: 'AML risk check passed' };
    }
  },
  {
    id: 'INDUSTRY-001',
    name: 'Restricted Industry Check',
    category: 'general',
    description: 'Blocks engagement with restricted industries',
    severity: 'block',
    evaluate: (_action, params) => {
      const industries: string[] = params?.industry || [];
      const blocked = industries.filter(i => RESTRICTED_INDUSTRIES.has(i.toLowerCase().trim()));
      if (blocked.length > 0) {
        return {
          ruleId: 'INDUSTRY-001',
          passed: false,
          severity: 'block',
          message: `Industry "${blocked.join(', ')}" is restricted. Engagement blocked.`,
          regulation: 'Internal Ethics Policy'
        };
      }
      return { ruleId: 'INDUSTRY-001', passed: true, severity: 'block', message: 'Industry check passed' };
    }
  },
  {
    id: 'ESG-001',
    name: 'ESG Risk Assessment',
    category: 'esg',
    description: 'Evaluates environmental, social, and governance risk factors',
    severity: 'warn',
    evaluate: (_action, params) => {
      const industries: string[] = params?.industry || [];
      const sensitive = industries.filter(i => SENSITIVE_INDUSTRIES.has(i.toLowerCase().trim()));
      if (sensitive.length > 0) {
        return {
          ruleId: 'ESG-001',
          passed: true,
          severity: 'warn',
          message: `Industry "${sensitive.join(', ')}" carries elevated ESG risk. Review sustainability practices.`,
          details: 'Consider environmental impact assessment, labor practices review, and governance structure evaluation.'
        };
      }
      return { ruleId: 'ESG-001', passed: true, severity: 'warn', message: 'ESG risk assessment passed' };
    }
  },
  {
    id: 'PRIVACY-001',
    name: 'Data Privacy Compliance',
    category: 'data_privacy',
    description: 'Checks for data privacy requirements based on jurisdiction',
    severity: 'warn',
    evaluate: (_action, params) => {
      const country = (params?.country || '').toLowerCase().trim();
      const region = (params?.region || '').toLowerCase().trim();
      const gdprRegions = ['europe', 'eu', 'eea'];
      const gdprCountries = [
        'germany', 'france', 'italy', 'spain', 'netherlands', 'belgium',
        'austria', 'sweden', 'denmark', 'finland', 'ireland', 'portugal',
        'poland', 'czech republic', 'greece', 'romania', 'hungary'
      ];

      if (gdprRegions.includes(region) || gdprCountries.includes(country)) {
        return {
          ruleId: 'PRIVACY-001',
          passed: true,
          severity: 'warn',
          message: 'GDPR compliance required. Ensure data processing agreements are in place.',
          regulation: 'EU General Data Protection Regulation (GDPR)'
        };
      }
      if (country === 'australia') {
        return {
          ruleId: 'PRIVACY-001',
          passed: true,
          severity: 'info',
          message: 'Australian Privacy Principles (APPs) apply. Ensure compliance with Privacy Act 1988.',
          regulation: 'Australian Privacy Act 1988'
        };
      }
      return { ruleId: 'PRIVACY-001', passed: true, severity: 'warn', message: 'Data privacy check passed' };
    }
  },
  {
    id: 'CORRUPT-001',
    name: 'Anti-Corruption Due Diligence',
    category: 'anti_corruption',
    description: 'Flags scenarios requiring anti-corruption due diligence',
    severity: 'warn',
    evaluate: (_action, params) => {
      const intent: string[] = params?.strategicIntent || [];
      const govInvolved = intent.some(i =>
        ['government', 'public sector', 'state-owned', 'sovereign'].some(k => i.toLowerCase().includes(k))
      );
      const counterparts: string[] = params?.targetCounterpartType || [];
      const govCounterpart = counterparts.some(c =>
        ['government', 'public', 'state', 'sovereign'].some(k => c.toLowerCase().includes(k))
      );

      if (govInvolved || govCounterpart) {
        return {
          ruleId: 'CORRUPT-001',
          passed: true,
          severity: 'warn',
          message: 'Government stakeholder involvement detected. Anti-corruption due diligence required.',
          regulation: 'UN Convention Against Corruption, FCPA, UK Bribery Act'
        };
      }
      return { ruleId: 'CORRUPT-001', passed: true, severity: 'warn', message: 'Anti-corruption check passed' };
    }
  },
  {
    id: 'ACTION-001',
    name: 'Blocked Actions',
    category: 'general',
    description: 'Blocks explicitly harmful or illegal actions',
    severity: 'block',
    evaluate: (action, _params) => {
      const blockedActions = [
        'harmful-action', 'illegal-action', 'money-laundering', 'fraud',
        'bribery', 'insider-trading', 'market-manipulation', 'sanctions-evasion',
        'tax-evasion', 'human-trafficking', 'forced-labor'
      ];
      const lower = action.toLowerCase().trim();
      if (blockedActions.some(b => lower.includes(b))) {
        return {
          ruleId: 'ACTION-001',
          passed: false,
          severity: 'block',
          message: `Action "${action}" is explicitly prohibited.`,
          regulation: 'Internal Ethics Policy, International Law'
        };
      }
      return { ruleId: 'ACTION-001', passed: true, severity: 'block', message: 'Action check passed' };
    }
  }
];

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Audit Trail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const auditLog: AuditEntry[] = [];

function addAuditEntry(action: string, decision: string, reasoning: string, rulesEvaluated: string[]): void {
  auditLog.push({
    timestamp: new Date().toISOString(),
    action,
    decision,
    reasoning,
    rules_evaluated: rulesEvaluated
  });
  // Keep last 200 entries
  if (auditLog.length > 200) auditLog.splice(0, auditLog.length - 200);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Full compliance check: runs all rules against the action and parameters.
 * Returns a structured EthicsAssessment.
 */
export function checkCompliance(action: string, params?: any): boolean {
  const assessment = fullEthicsAssessment(action, params || {});
  return assessment.isCompliant;
}

/**
 * Full ethics assessment with detailed reporting.
 */
export function fullEthicsAssessment(action: string, params: any): EthicsAssessment {
  const results: ComplianceResult[] = [];

  for (const rule of COMPLIANCE_RULES) {
    try {
      const result = rule.evaluate(action, params);
      results.push(result);
    } catch (err: any) {
      results.push({
        ruleId: rule.id,
        passed: true, // fail-open on rule errors (log it)
        severity: 'info',
        message: `Rule ${rule.id} evaluation error: ${err.message}`
      });
    }
  }

  const blocked = results.filter(r => !r.passed && r.severity === 'block');
  const warnings = results.filter(r => r.severity === 'warn' && (!r.passed || r.message.includes('required') || r.message.includes('elevated')));
  const isCompliant = blocked.length === 0;

  const overallRisk: 'low' | 'medium' | 'high' | 'critical' =
    blocked.length > 0 ? 'critical' :
    warnings.length >= 3 ? 'high' :
    warnings.length >= 1 ? 'medium' : 'low';

  const biasReport = detectBias(params);

  const recommendations: string[] = [];
  if (blocked.length > 0) {
    recommendations.push(`BLOCKED: ${blocked.map(b => b.message).join('; ')}`);
  }
  for (const w of warnings) {
    if (w.regulation) {
      recommendations.push(`Review ${w.regulation}: ${w.message}`);
    }
  }
  for (const b of biasReport) {
    recommendations.push(`Bias mitigation: ${b.mitigationSuggestion}`);
  }
  if (recommendations.length === 0) {
    recommendations.push('No compliance issues detected. Proceed with standard due diligence.');
  }

  const explanation = explainDecision(action, params, results, biasReport);

  addAuditEntry(
    action,
    isCompliant ? 'APPROVED' : 'BLOCKED',
    explanation,
    results.map(r => r.ruleId)
  );

  return {
    isCompliant,
    overallRisk,
    complianceResults: results,
    biasReport,
    explanation,
    recommendations,
    auditTrail: auditLog.slice(-10) // last 10 entries for context
  };
}

/**
 * Detect bias in analysis parameters and outputs.
 */
export function detectBias(data: any): BiasReport[] {
  const biases: BiasReport[] = [];

  if (!data || typeof data !== 'object') return biases;

  // 1. Geographic bias â€” overweight towards wealthy nations
  const country = (data.country || '').toLowerCase();
  const region = (data.region || '').toLowerCase();
  if (['united states', 'united kingdom', 'australia', 'canada', 'germany'].includes(country)) {
    biases.push({
      biasType: 'geographic_familiarity',
      description: 'Analysis may be biased towards well-documented Western economies. Ensure comparable rigor for non-Western markets.',
      severity: 'low',
      affectedFields: ['country', 'region'],
      mitigationSuggestion: 'Cross-reference with local data sources and regional experts.',
      confidence: 0.6
    });
  }

  // 2. Sector bias â€” tech sectors may receive overly optimistic scores
  const industries: string[] = data.industry || [];
  if (industries.some(i => ['technology', 'tech', 'software', 'saas', 'ai'].includes(i.toLowerCase()))) {
    biases.push({
      biasType: 'sector_optimism',
      description: 'Technology sector may receive inflated growth and innovation scores due to training data bias.',
      severity: 'medium',
      affectedFields: ['industry', 'growthPotential', 'innovation'],
      mitigationSuggestion: 'Apply sector-specific discount factor and validate with comparable exit data.',
      confidence: 0.7
    });
  }

  // 3. Missing data bias â€” critical fields not provided
  const missingFields: string[] = [];
  if (!data.country) missingFields.push('country');
  if (!data.industry || data.industry.length === 0) missingFields.push('industry');
  if (!data.organizationType) missingFields.push('organizationType');
  if (!data.headcountBand) missingFields.push('headcountBand');
  if (!data.dealSize) missingFields.push('dealSize');
  if (!data.riskTolerance) missingFields.push('riskTolerance');

  if (missingFields.length >= 3) {
    biases.push({
      biasType: 'incomplete_data',
      description: `${missingFields.length} critical input fields missing (${missingFields.join(', ')}). Analysis may rely heavily on defaults and regional baselines.`,
      severity: 'high',
      affectedFields: missingFields,
      mitigationSuggestion: 'Request user to complete missing fields before relying on analysis for decisions.',
      confidence: 0.9
    });
  }

  // 4. Confirmation bias â€” if stakeholder alignment is strong but risk is also high
  if (data.stakeholderAlignment?.length > 2 && data.riskTolerance === 'high') {
    biases.push({
      biasType: 'confirmation_bias',
      description: 'High stakeholder alignment combined with high risk tolerance may lead to underestimation of risks.',
      severity: 'medium',
      affectedFields: ['stakeholderAlignment', 'riskTolerance'],
      mitigationSuggestion: 'Run adversarial persona analysis to challenge prevailing assumptions.',
      confidence: 0.65
    });
  }

  // 5. Recency bias â€” if expansion timeline is "immediate"
  if (data.expansionTimeline === 'immediate') {
    biases.push({
      biasType: 'urgency_bias',
      description: 'Immediate timeline may compress analysis quality. Rush decisions historically underperform.',
      severity: 'medium',
      affectedFields: ['expansionTimeline'],
      mitigationSuggestion: 'Compare scores against 12-24 month scenario to quantify urgency premium.',
      confidence: 0.75
    });
  }

  return biases;
}

/**
 * Generate human-readable explanation of the ethics decision.
 */
export function explainDecision(action: string, params: any, results?: ComplianceResult[], biases?: BiasReport[]): string {
  const parts: string[] = [];

  parts.push(`Ethics Assessment for action: "${action}"`);
  parts.push(`Country: ${params?.country || 'Not specified'} | Region: ${params?.region || 'Not specified'}`);
  parts.push(`Industries: ${(params?.industry || []).join(', ') || 'Not specified'}`);

  if (results) {
    const blocked = results.filter(r => !r.passed);
    const warnings = results.filter(r => r.passed && r.severity === 'warn' && r.message.includes('required'));

    if (blocked.length > 0) {
      parts.push(`\nBLOCKED by ${blocked.length} rule(s):`);
      for (const b of blocked) {
        parts.push(`  - [${b.ruleId}] ${b.message}${b.regulation ? ` (${b.regulation})` : ''}`);
      }
    }

    if (warnings.length > 0) {
      parts.push(`\nWARNINGS (${warnings.length}):`);
      for (const w of warnings) {
        parts.push(`  - [${w.ruleId}] ${w.message}`);
      }
    }

    if (blocked.length === 0 && warnings.length === 0) {
      parts.push('\nAll compliance rules passed. Action is compliant.');
    }
  } else {
    parts.push(`\nCompliance status: Compliant based on rules engine evaluation.`);
  }

  if (biases && biases.length > 0) {
    parts.push(`\nBias Detection (${biases.length} finding(s)):`);
    for (const b of biases) {
      parts.push(`  - [${b.severity.toUpperCase()}] ${b.biasType}: ${b.description}`);
    }
  }

  return parts.join('\n');
}

/**
 * Get audit trail.
 */
export function getAuditTrail(): AuditEntry[] {
  return [...auditLog];
}

/**
 * Export full ethics assessment for a report.
 */
export function getEthicsReport(action: string, params: any): EthicsAssessment {
  return fullEthicsAssessment(action, params);
}
