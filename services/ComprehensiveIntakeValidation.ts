/**
 * COMPREHENSIVE INTAKE VALIDATION & READINESS ENGINE
 * 
 * Validates that all 9 sections are complete and coherent
 * Identifies specific gaps and recommends next steps
 */

import { AdvisorSnapshot, ComprehensiveSystemModel } from './ComprehensiveSystemModel';
import { buildAdvisorSnapshot } from './GlobalIntelligenceEngine';

export interface ValidationResult {
  section: string;
  completeness: number;  // 0-100
  status: 'complete' | 'in-progress' | 'incomplete';
  gaps: string[];  // specific missing fields
  criticalGaps: boolean;  // are there fields that MUST be filled
  recommendations: string[];  // what to fill next
}

export interface ComprehensiveValidationReport {
  overallCompleteness: number;  // 0-100
  overallStatus: 'red' | 'yellow' | 'green';
  canProceedWithAnalysis: boolean;
  sectionScores: ValidationResult[];
  criticalPath: string[];  // must-fill sections in order
  timeEstimate: string;  // "2 hours to complete" etc
  advisorSnapshot: AdvisorSnapshot;
}

export function validateComprehensiveIntake(model: ComprehensiveSystemModel): ComprehensiveValidationReport {
  const results: ValidationResult[] = [];

  // 1. Identity Section
  results.push(validateIdentity(model));

  // 2. Mandate Section
  results.push(validateMandate(model));

  // 3. Market Section
  results.push(validateMarket(model));

  // 4. Partners Section
  results.push(validatePartners(model));

  // 5. Financial Section
  results.push(validateFinancial(model));

  // 6. Risks Section
  results.push(validateRisks(model));

  // 7. Capabilities Section
  results.push(validateCapabilities(model));

  // 8. Execution Section
  results.push(validateExecution(model));

  // 9. Governance Section
  results.push(validateGovernance(model));

  // Calculate overall metrics
  const overallCompleteness = Math.round(
    results.reduce((sum, r) => sum + r.completeness, 0) / results.length
  );

  const overallStatus = 
    overallCompleteness >= 90 ? 'green' :
    overallCompleteness >= 70 ? 'yellow' : 'red';

  const canProceedWithAnalysis = overallCompleteness >= 70;

  // Identify critical path
  const criticalPath = [
    'Identity',
    'Mandate',
    'Market',
    'Partners',
    'Financial',
  ];

  const advisorSnapshot = buildAdvisorSnapshot(model);

  return {
    overallCompleteness,
    overallStatus,
    canProceedWithAnalysis,
    sectionScores: results,
    criticalPath,
    timeEstimate: estimateFillingTime(results),
    advisorSnapshot,
  };
}

function validateIdentity(model: ComprehensiveSystemModel): ValidationResult {
  const identity = model.identity;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: !!identity.organization?.legalName, field: 'Organization Legal Name' },
    { filled: !!identity.organization?.entityType, field: 'Entity Type' },
    { filled: !!identity.organization?.industryClassification, field: 'Industry Classification' },
    { filled: identity.organization?.yearsInOperation !== undefined, field: 'Years in Operation' },
    { filled: !!identity.organization?.headquarters?.country, field: 'Headquarters Country' },
    { filled: !!identity.organization?.operatingRegions?.length, field: 'Operating Regions' },
    { filled: identity.capacity?.employees !== undefined, field: 'Employee Count' },
    { filled: identity.capacity?.annualRevenue !== undefined, field: 'Annual Revenue' },
    { filled: identity.capacity?.ebitda !== undefined, field: 'EBITDA' },
    { filled: !!identity.capacity?.keySegments?.length, field: 'Key Business Segments' },
    { filled: identity.capacity?.marketShare !== undefined, field: 'Market Share' },
    { filled: !!identity.capacity?.profitabilityTrend, field: 'Profitability Trend' },
    { filled: !!identity.structure?.decisionMaker, field: 'Decision Maker' },
    { filled: !!identity.competition?.coreAdvantages?.length, field: 'Competitive Advantages' },
    { filled: identity.competition?.customerConcentrationRisk !== undefined, field: 'Customer Concentration Risk' },
    { filled: !!identity.financialStability?.creditRating, field: 'Credit Rating' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = [
    'Organization Legal Name',
    'Entity Type',
    'Industry Classification',
    'Headquarters Country',
    'Annual Revenue',
    'Decision Maker',
  ].some(field => gaps.includes(field));

  return {
    section: 'Identity & Foundation',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Start by filling organization basics (name, type, industry)',
      'Then add organizational capacity metrics',
      'Finally, complete competitive and financial position',
    ],
  };
}

function validateMandate(model: ComprehensiveSystemModel): ValidationResult {
  const mandate = model.mandate;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: !!mandate.vision, field: 'Strategic Vision' },
    { filled: mandate.strategicIntents?.length > 0, field: 'Strategic Intents' },
    { filled: !!mandate.problemStatement, field: 'Problem Statement' },
    { filled: !!mandate.currentState, field: 'Current State' },
    { filled: !!mandate.desiredFutureState, field: 'Desired Future State' },
    { filled: mandate.objectives?.length > 0, field: 'Strategic Objectives' },
    { filled: !!mandate.targetPartner?.size, field: 'Target Partner Profile' },
    { filled: !!mandate.valueProposition?.whatWeBring, field: 'Value Proposition' },
    { filled: !!mandate.governance?.preferredStructure, field: 'Governance Structure' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = [
    'Problem Statement',
    'Strategic Intents',
    'Strategic Objectives',
  ].some(field => gaps.includes(field));

  return {
    section: 'Mandate & Strategy',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Define the core problem you\'re solving',
      'List 2-3 strategic intents (what you want to achieve)',
      'Create measurable objectives with KPIs',
      'Describe ideal partner profile',
      'Articulate value proposition for both parties',
    ],
  };
}

function validateMarket(model: ComprehensiveSystemModel): ValidationResult {
  const market = model.market;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: market.tam?.dollars !== undefined, field: 'TAM (Total Addressable Market)' },
    { filled: market.sam?.dollars !== undefined, field: 'SAM (Serviceable Addressable Market)' },
    { filled: market.som?.dollars !== undefined, field: 'SOM (Serviceable Obtainable Market)' },
    { filled: market.marketGrowthRate !== undefined, field: 'Market Growth Rate' },
    { filled: !!market.maturityStage, field: 'Market Maturity Stage' },
    { filled: market.topTrends?.length > 0, field: 'Top Market Trends' },
    { filled: !!market.targetCountry, field: 'Target Country' },
    { filled: !!market.targetRegion, field: 'Target Region' },
    { filled: market.targetCities?.length > 0, field: 'Target Cities' },
    { filled: market.localMarketSize !== undefined, field: 'Local Market Size' },
    { filled: market.gdpGrowth !== undefined, field: 'GDP Growth' },
    { filled: market.inflationRate !== undefined, field: 'Inflation Rate' },
    { filled: !!market.regulatoryEnvironment, field: 'Regulatory Environment' },
    { filled: market.geopoliticalRiskScore !== undefined, field: 'Geopolitical Risk Score' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = [
    'Target Country',
    'Target Region',
    'Local Market Size',
    'Market Growth Rate',
  ].some(field => gaps.includes(field));

  return {
    section: 'Market & Context',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Define your target geography (country, region, city)',
      'Estimate market size (TAM/SAM/SOM)',
      'Assess market growth and maturity',
      'Analyze macroeconomic factors',
      'Document regulatory and geopolitical risks',
    ],
  };
}

function validatePartners(model: ComprehensiveSystemModel): ValidationResult {
  const partners = model.partners;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: partners.partnerNames?.length > 0, field: 'Partner Names' },
    { filled: !!partners.partnerSize, field: 'Partner Size' },
    { filled: partners.partnerCapabilities?.length > 0, field: 'Partner Capabilities' },
    { filled: partners.partnerGeography?.length > 0, field: 'Partner Geography' },
    { filled: !!partners.primaryContact?.name, field: 'Primary Contact' },
    { filled: partners.strategicAlignment?.score !== undefined, field: 'Strategic Alignment Score' },
    { filled: !!partners.culturalFit?.decisionMakingSpeed, field: 'Cultural Fit Assessment' },
    { filled: partners.competitiveConflicts?.directCompetition !== undefined, field: 'Competitive Conflicts' },
    { filled: !!partners.relationshipDynamics?.relationshipHistory, field: 'Relationship History' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = [
    'Partner Names',
    'Primary Contact',
    'Strategic Alignment Score',
  ].some(field => gaps.includes(field));

  return {
    section: 'Partners & Ecosystem',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Identify and name target partners',
      'Get primary contact information',
      'Assess strategic and cultural alignment',
      'Evaluate competitive conflicts',
      'Understand relationship dynamics',
    ],
  };
}

function validateFinancial(model: ComprehensiveSystemModel): ValidationResult {
  const financial = model.financial;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: financial.capitalInvested !== undefined, field: 'Capital Investment Required' },
    { filled: !!financial.investmentType, field: 'Investment Type' },
    { filled: financial.workingCapitalNeeded !== undefined, field: 'Working Capital Needed' },
    { filled: financial.revenueStreams?.length > 0, field: 'Revenue Streams' },
    { filled: financial.totalRevenue?.year1 !== undefined, field: 'Year 1 Revenue' },
    { filled: financial.revenueGrowthRate !== undefined, field: 'Revenue Growth Rate' },
    { filled: financial.cogsAsPercentage !== undefined, field: 'COGS as %' },
    { filled: financial.grossMarginTarget !== undefined, field: 'Gross Margin Target' },
    { filled: financial.breakEvenMonths !== undefined, field: 'Break-even Timeline' },
    { filled: financial.irr !== undefined, field: 'Internal Rate of Return (IRR)' },
    { filled: financial.returnMultiple !== undefined, field: 'Return Multiple' },
    { filled: financial.baseCase?.assumptions?.length > 0, field: 'Base Case Assumptions' },
    { filled: financial.topSensitivityDrivers?.length > 0, field: 'Sensitivity Drivers' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = [
    'Capital Investment Required',
    'Revenue Streams',
    'Year 1 Revenue',
    'Break-even Timeline',
  ].some(field => gaps.includes(field));

  return {
    section: 'Financial Model',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Define capital investment required and sources',
      'Build revenue stream model (unit price x volume)',
      'Estimate cost structure (COGS, OpEx)',
      'Calculate returns (IRR, payback, multiple)',
      'Run scenario and sensitivity analysis',
    ],
  };
}

function validateRisks(model: ComprehensiveSystemModel): ValidationResult {
  const risks = model.risks;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: risks.risks?.length >= 3, field: 'Risk Register (min 3 risks)' },
    { filled: !!risks.riskAppetite, field: 'Risk Appetite Definition' },
    { filled: risks.riskCapitalAllocated !== undefined, field: 'Risk Capital Allocated' },
    { filled: risks.totalExposure !== undefined, field: 'Total Risk Exposure Calculated' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = ['Risk Register (min 3 risks)'].some(field => gaps.includes(field));

  return {
    section: 'Risk & Mitigation',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Document top 5 risks (market, operational, financial, legal, relationship)',
      'Estimate probability and financial impact for each',
      'Develop mitigation plans for each risk',
      'Define risk appetite level',
      'Allocate contingency budget',
    ],
  };
}

function validateCapabilities(model: ComprehensiveSystemModel): ValidationResult {
  const capabilities = model.capabilities;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: !!capabilities.executiveTeam?.ceo, field: 'CEO/Executive Leadership' },
    { filled: capabilities.organizationalCapabilities?.salesCapability?.rating !== undefined, field: 'Sales Capability' },
    { filled: capabilities.organizationalCapabilities?.operationsCapability?.rating !== undefined, field: 'Operations Capability' },
    { filled: !!capabilities.technologyStack?.coreEngine, field: 'Technology Stack' },
    { filled: capabilities.capabilitiesWeHave?.length > 0, field: 'Capabilities We Have' },
    { filled: capabilities.capabilitiesWeNeed?.length > 0, field: 'Capabilities We Need' },
    { filled: capabilities.capabilitiesWeCanBuild?.length > 0, field: 'Capabilities We Can Build' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = [
    'CEO/Executive Leadership',
    'Sales Capability',
    'Capabilities We Need',
  ].some(field => gaps.includes(field));

  return {
    section: 'Resources & Capability',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Document executive team and their backgrounds',
      'Rate organizational capabilities (1-5 scale)',
      'Define technology stack and IP',
      'List what capabilities you have',
      'List what capabilities you need (partner must have)',
      'Identify capability gaps',
    ],
  };
}

function validateExecution(model: ComprehensiveSystemModel): ValidationResult {
  const execution = model.execution;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: execution.phases?.length >= 3, field: 'Execution Phases (3+)' },
    { filled: execution.goNoCriteria?.length > 0, field: 'Go/No-Go Criteria' },
    { filled: execution.criticalPath?.length > 0, field: 'Critical Path Identified' },
    { filled: execution.dependencies?.length > 0, field: 'Task Dependencies' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = ['Execution Phases (3+)'].some(field => gaps.includes(field));

  return {
    section: 'Execution Plan',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Break execution into 3 phases: Foundation -> Ramp -> Scale',
      'Define key milestones for each phase',
      'Identify critical path items',
      'Map task dependencies',
      'Set go/no-go criteria at phase gates',
    ],
  };
}

function validateGovernance(model: ComprehensiveSystemModel): ValidationResult {
  const governance = model.governance;
  const gaps: string[] = [];
  let completeness = 0;
  let fieldCount = 0;

  const checks = [
    { filled: governance.steeringCommittee?.members?.length > 0, field: 'Steering Committee' },
    { filled: !!governance.steeringCommittee?.frequency, field: 'Meeting Frequency' },
    { filled: Object.keys(governance.decisionAuthorityMatrix || {}).length > 0, field: 'Decision Authority Matrix' },
    { filled: governance.keyMetricsAndDashboards?.length > 0, field: 'KPIs & Dashboards' },
    { filled: governance.contingencyPlans?.length > 0, field: 'Contingency Plans' },
  ];

  checks.forEach(check => {
    fieldCount++;
    if (check.filled) {
      completeness++;
    } else {
      gaps.push(check.field);
    }
  });

  completeness = Math.round((completeness / fieldCount) * 100);

  const criticalGaps = [
    'Steering Committee',
    'Decision Authority Matrix',
  ].some(field => gaps.includes(field));

  return {
    section: 'Governance & Monitoring',
    completeness,
    status: completeness >= 90 ? 'complete' : completeness >= 50 ? 'in-progress' : 'incomplete',
    gaps,
    criticalGaps,
    recommendations: [
      'Define steering committee (members, frequency)',
      'Create decision authority matrix (who decides what)',
      'Set key metrics and reporting cadence',
      'Plan contingency scenarios',
      'Establish escalation path',
    ],
  };
}

function estimateFillingTime(results: ValidationResult[]): string {
  const incompleteCount = results.filter(r => r.status === 'incomplete').length;
  const inProgressCount = results.filter(r => r.status === 'in-progress').length;

  if (incompleteCount >= 5) return '8-16 hours to complete (2-3 days)';
  if (incompleteCount >= 3) return '4-8 hours to complete (full day)';
  if (inProgressCount >= 3) return '2-4 hours to complete (half day)';
  return '30 minutes to complete';
}

export function generateReadinessReport(model: ComprehensiveSystemModel): string {
  const validation = validateComprehensiveIntake(model);

  let report = '# SYSTEM DEVELOPMENT READINESS REPORT\n\n';
  report += `**Overall Readiness: ${validation.overallCompleteness}%**\n`;
  report += `**Status: ${validation.overallStatus.toUpperCase()}**\n`;
  report += `**Can Proceed with Analysis: ${validation.canProceedWithAnalysis ? 'YES' : 'NO'}\n`;
  report += `**Estimated Time to Complete: ${validation.timeEstimate}\n\n`;

  report += '## SECTION BREAKDOWN\n\n';
  
  for (const section of validation.sectionScores) {
    const icon = section.status === 'complete' ? '' : section.status === 'in-progress' ? '' : '';
    report += `### ${icon} ${section.section} - ${section.completeness}%\n`;
    report += `Status: **${section.status}**\n`;
    
    if (section.gaps.length > 0) {
      report += `**Missing:**\n`;
      section.gaps.forEach(gap => {
        const isCritical = section.criticalGaps && ['Organization Legal Name', 'Problem Statement', 'Risk Register'].includes(gap);
        report += `- ${isCritical ? '"´ **CRITICAL**' : ''} ${gap}\n`;
      });
    }
    
    report += `**Next Steps:**\n`;
    section.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    report += '\n';
  }

  report += '## CRITICAL PATH (Priority Order)\n\n';
  validation.criticalPath.forEach((item, idx) => {
    report += `${idx + 1}. ${item}\n`;
  });

  if (validation.advisorSnapshot) {
    const snapshot = validation.advisorSnapshot;
    report += '\n## AI ADVISOR SNAPSHOT\n\n';
    report += `**Summary:** ${snapshot.summary}\n\n`;
    report += '**Priority Moves:**\n';
    snapshot.priorityMoves.forEach(move => {
      report += `- ${move}\n`;
    });

    report += '\n**Reference Engagements:**\n';
    snapshot.engagements.forEach(engagement => {
      report += `- ${engagement.scenario} (${engagement.region}, ${engagement.era})\n`;
    });

    report += '\n**Signals:**\n';
    snapshot.signals.forEach(signal => {
      report += `- [${signal.type.toUpperCase()}] ${signal.description}\n`;
    });
  }

  return report;
}

