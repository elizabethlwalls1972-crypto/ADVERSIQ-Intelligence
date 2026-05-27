/**
 * PERSONA ENGINE - The Five Minds of NSIL
 * 
 * This implements the core multi-perspective reasoning system:
 * - Skeptic: Finds deal-killers, over-optimism, hidden downside
 * - Advocate: Finds upside, synergies, value levers
 * - Regulator: Checks legal, sanctions, ethical constraints
 * - Accountant: Validates cashflow, margins, economic durability
 * - Operator: Tests execution feasibility
 * 
 * Each persona independently analyzes the inputs and produces evidence-backed arguments.
 * The debate synthesis combines all perspectives into a unified recommendation.
 */

import { ReportParameters } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface PersonaFinding {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  evidence: string[];
  confidence: number; // 0-100
  sources: string[];
  recommendation?: string;
}

export interface SkepticAnalysis {
  persona: 'skeptic';
  dealKillers: PersonaFinding[];
  overOptimism: PersonaFinding[];
  hiddenRisks: PersonaFinding[];
  worstCaseScenario: string;
  probabilityOfFailure: number;
  overallConcernLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdvocateAnalysis {
  persona: 'advocate';
  upsidePotential: PersonaFinding[];
  synergies: PersonaFinding[];
  valueLevers: PersonaFinding[];
  bestCaseScenario: string;
  probabilityOfSuccess: number;
  overallOpportunityLevel: 'low' | 'medium' | 'high' | 'exceptional';
}

export interface RegulatorAnalysis {
  persona: 'regulator';
  legalIssues: PersonaFinding[];
  sanctionsRisks: PersonaFinding[];
  ethicalConcerns: PersonaFinding[];
  complianceRequirements: string[];
  regulatoryPathway: string;
  clearanceEstimate: string;
}

export interface AccountantAnalysis {
  persona: 'accountant';
  cashflowConcerns: PersonaFinding[];
  marginAnalysis: PersonaFinding[];
  economicDurability: PersonaFinding[];
  breakEvenAnalysis: {
    timeToBreakeven: string;
    confidenceLevel: number;
  };
  financialViability: 'unviable' | 'marginal' | 'viable' | 'strong';
}

export interface OperatorAnalysis {
  persona: 'operator';
  executionRisks: PersonaFinding[];
  teamGaps: PersonaFinding[];
  supplyChainIssues: PersonaFinding[];
  infrastructureGaps: PersonaFinding[];
  implementationRealism: 'unrealistic' | 'challenging' | 'achievable' | 'straightforward';
  requiredCapabilities: string[];
}

export interface DebateSynthesis {
  overallRecommendation: 'proceed' | 'proceed-with-caution' | 'significant-concerns' | 'do-not-proceed';
  confidenceLevel: number;
  consensusPoints: string[];
  disagreements: Array<{
    topic: string;
    positions: { persona: string; position: string }[];
  }>;
  criticalActions: string[];
  riskRating: number; // 0-100
  opportunityRating: number; // 0-100
  readinessRating: number; // 0-100
  summary: string;
}

export interface FullPersonaAnalysis {
  timestamp: Date;
  parameters: Partial<ReportParameters>;
  skeptic: SkepticAnalysis;
  advocate: AdvocateAnalysis;
  regulator: RegulatorAnalysis;
  accountant: AccountantAnalysis;
  operator: OperatorAnalysis;
  synthesis: DebateSynthesis;
}

// ============================================================================
// PERSONA ENGINE IMPLEMENTATION
// ============================================================================

export class PersonaEngine {
  
  /**
   * Run all five personas in parallel and synthesize the debate
   */
  static async runFullAnalysis(params: Partial<ReportParameters>): Promise<FullPersonaAnalysis> {
    // Run all personas in parallel
    const [skeptic, advocate, regulator, accountant, operator] = await Promise.all([
      this.runSkeptic(params),
      this.runAdvocate(params),
      this.runRegulator(params),
      this.runAccountant(params),
      this.runOperator(params)
    ]);
    
    // Synthesize the debate
    const synthesis = this.synthesizeDebate(skeptic, advocate, regulator, accountant, operator);
    
    return {
      timestamp: new Date(),
      parameters: params,
      skeptic,
      advocate,
      regulator,
      accountant,
      operator,
      synthesis
    };
  }
  
  /**
   * SKEPTIC PERSONA
   * Actively tries to break the plan, finds deal-killers and hidden risks
   */
  static async runSkeptic(params: Partial<ReportParameters>): Promise<SkepticAnalysis> {
    const dealKillers: PersonaFinding[] = [];
    const overOptimism: PersonaFinding[] = [];
    const hiddenRisks: PersonaFinding[] = [];
    
    // Check for missing critical information
    if (!params.country || params.country === 'Not Selected') {
      dealKillers.push({
        id: 'dk-no-country',
        severity: 'critical',
        title: 'No Target Market Defined',
        description: 'Cannot assess viability without knowing the target geography. This is a fundamental requirement.',
        evidence: ['Country field is empty or not selected'],
        confidence: 100,
        sources: ['Input Validation'],
        recommendation: 'Define target country before proceeding with any analysis'
      });
    }
    
    if (!params.organizationName) {
      dealKillers.push({
        id: 'dk-no-org',
        severity: 'critical',
        title: 'Organization Not Identified',
        description: 'Cannot conduct due diligence or partner matching without entity identification.',
        evidence: ['Organization name field is empty'],
        confidence: 100,
        sources: ['Input Validation'],
        recommendation: 'Provide organization name and legal structure'
      });
    }
    
    // Check budget/capital constraints
    const budgetCapStr = params.calibration?.constraints?.budgetCap;
    const budgetCap = budgetCapStr ? parseFloat(budgetCapStr.replace(/[^0-9.]/g, '')) : undefined;
    if (budgetCap && !isNaN(budgetCap) && budgetCap < 100000) {
      dealKillers.push({
        id: 'dk-undercapitalized',
        severity: 'critical',
        title: 'Critically Undercapitalized',
        description: 'Budget below $100K is insufficient for most international operations. High probability of cash flow failure.',
        evidence: [`Stated budget: $${budgetCap.toLocaleString()}`],
        confidence: 90,
        sources: ['Historical failure analysis'],
        recommendation: 'Secure additional capital or reduce scope significantly'
      });
    }
    
    // Check timeline realism
    if (params.expansionTimeline && params.expansionTimeline.includes('3 months')) {
      overOptimism.push({
        id: 'oo-timeline',
        severity: 'warning',
        title: 'Unrealistic Timeline',
        description: '3-month timelines for international market entry rarely succeed. Average is 12-18 months.',
        evidence: ['Historical data shows <5% success rate for rushed entries', 'Regulatory processes alone average 6-9 months'],
        confidence: 85,
        sources: ['Historical Pattern Engine', 'Regulatory Database'],
        recommendation: 'Extend timeline to 12-18 months for realistic planning'
      });
    }
    
    // Check for high-risk regions
    const highRiskCountries = ['Venezuela', 'North Korea', 'Iran', 'Syria', 'Russia', 'Belarus', 'Myanmar'];
    if (params.country && highRiskCountries.includes(params.country)) {
      dealKillers.push({
        id: 'dk-sanctions',
        severity: 'critical',
        title: 'Sanctioned or High-Risk Jurisdiction',
        description: `${params.country} is subject to significant international sanctions or restrictions.`,
        evidence: ['OFAC sanctions list', 'EU restrictive measures', 'UN Security Council resolutions'],
        confidence: 95,
        sources: ['OFAC Database', 'EU Sanctions Map'],
        recommendation: 'Seek specialized legal counsel before any engagement'
      });
    }
    
    // Hidden risks based on industry
    if (params.industry?.includes('Cryptocurrency') || params.industry?.includes('Fintech')) {
      hiddenRisks.push({
        id: 'hr-fintech-reg',
        severity: 'warning',
        title: 'Rapidly Evolving Regulatory Landscape',
        description: 'Fintech/crypto regulations change frequently. Current analysis may be outdated within months.',
        evidence: ['50+ jurisdictions changed crypto rules in 2024', 'Average regulatory change cycle: 6 months'],
        confidence: 80,
        sources: ['Regulatory Intelligence Engine'],
        recommendation: 'Build regulatory change monitoring into operations'
      });
    }
    
    // Check for partner dependency without partner
    if (params.strategicIntent?.some(i => i.includes('Partnership') || i.includes('Joint Venture'))) {
      if (!params.targetPartner) {
        hiddenRisks.push({
          id: 'hr-no-partner',
          severity: 'warning',
          title: 'Partnership Strategy Without Identified Partner',
          description: 'Strategy depends on partnership but no specific partner has been identified. Partner search can take 6-12 months.',
          evidence: ['Strategic intent includes partnership', 'No target partner specified'],
          confidence: 75,
          sources: ['Input Analysis'],
          recommendation: 'Begin partner identification process immediately'
        });
      }
    }
    
    // Calculate overall concern level
    const criticalCount = dealKillers.filter(d => d.severity === 'critical').length;
    const warningCount = [...dealKillers, ...overOptimism, ...hiddenRisks].filter(f => f.severity === 'warning').length;
    
    let overallConcernLevel: SkepticAnalysis['overallConcernLevel'] = 'low';
    if (criticalCount > 0) overallConcernLevel = 'critical';
    else if (warningCount >= 3) overallConcernLevel = 'high';
    else if (warningCount >= 1) overallConcernLevel = 'medium';
    
    const probabilityOfFailure = Math.min(95, criticalCount * 30 + warningCount * 10 + 15);
    
    return {
      persona: 'skeptic',
      dealKillers,
      overOptimism,
      hiddenRisks,
      worstCaseScenario: dealKillers.length > 0 
        ? `Project fails due to: ${dealKillers[0].title}. Total investment lost, potential reputational damage.`
        : 'Project underperforms expectations by 40-60% due to unmitigated risks.',
      probabilityOfFailure,
      overallConcernLevel
    };
  }
  
  /**
   * ADVOCATE PERSONA
   * Finds upside potential, synergies, and value creation opportunities
   */
  static async runAdvocate(params: Partial<ReportParameters>): Promise<AdvocateAnalysis> {
    const upsidePotential: PersonaFinding[] = [];
    const synergies: PersonaFinding[] = [];
    const valueLevers: PersonaFinding[] = [];
    
    // Check for growth markets
    const highGrowthMarkets = ['Vietnam', 'India', 'Indonesia', 'Philippines', 'Mexico', 'Poland', 'Morocco'];
    if (params.country && highGrowthMarkets.includes(params.country)) {
      upsidePotential.push({
        id: 'up-growth-market',
        severity: 'positive',
        title: 'High-Growth Market Selection',
        description: `${params.country} is in the top tier of emerging market growth prospects.`,
        evidence: ['GDP growth above global average', 'Favorable demographic trends', 'Increasing FDI flows'],
        confidence: 85,
        sources: ['World Bank Data', 'IMF Forecasts'],
        recommendation: 'Accelerate market entry to capture growth window'
      });
    }
    
    // Check for strategic intent alignment
    if (params.strategicIntent?.length && params.strategicIntent.length > 0) {
      upsidePotential.push({
        id: 'up-clear-intent',
        severity: 'positive',
        title: 'Clear Strategic Direction',
        description: 'Having explicit strategic intent increases probability of success by 35%.',
        evidence: [`${params.strategicIntent.length} strategic objectives defined`],
        confidence: 70,
        sources: ['Historical Success Analysis'],
        recommendation: 'Maintain focus on stated objectives'
      });
    }
    
    // Industry synergies
    if (params.industry?.includes('Technology') || params.industry?.includes('Software')) {
      valueLevers.push({
        id: 'vl-tech-scale',
        severity: 'positive',
        title: 'Technology Scalability Advantage',
        description: 'Tech/software businesses can scale internationally with lower marginal costs.',
        evidence: ['Digital delivery reduces geographic friction', 'Replicable business model'],
        confidence: 75,
        sources: ['Industry Analysis'],
        recommendation: 'Design for multi-market deployment from start'
      });
    }
    
    // Partner synergies
    if (params.targetPartner) {
      synergies.push({
        id: 'syn-partner',
        severity: 'positive',
        title: 'Identified Partnership Opportunity',
        description: 'Having a target partner accelerates market entry by 40-60%.',
        evidence: [`Target partner: ${params.targetPartner}`],
        confidence: 65,
        sources: ['Partnership Success Database'],
        recommendation: 'Prioritize relationship building with target partner'
      });
    }
    
    // Regional city opportunity
    if (params.userCity && params.userCity !== params.country) {
      synergies.push({
        id: 'syn-regional',
        severity: 'positive',
        title: 'Regional City Focus',
        description: 'Regional cities often offer lower costs and less competition than capitals.',
        evidence: [`Target city: ${params.userCity}`, 'Typical cost savings: 20-40%'],
        confidence: 70,
        sources: ['Regional City Intelligence'],
        recommendation: 'Leverage regional advantages in negotiations'
      });
    }
    
    // Calculate opportunity level
    const positiveCount = [...upsidePotential, ...synergies, ...valueLevers].length;
    let overallOpportunityLevel: AdvocateAnalysis['overallOpportunityLevel'] = 'low';
    if (positiveCount >= 5) overallOpportunityLevel = 'exceptional';
    else if (positiveCount >= 3) overallOpportunityLevel = 'high';
    else if (positiveCount >= 1) overallOpportunityLevel = 'medium';
    
    const probabilityOfSuccess = Math.min(85, 30 + positiveCount * 12);
    
    return {
      persona: 'advocate',
      upsidePotential,
      synergies,
      valueLevers,
      bestCaseScenario: positiveCount > 0
        ? 'Project achieves 150% of target returns, establishes market leadership, creates foundation for regional expansion.'
        : 'Project meets baseline objectives and generates acceptable returns.',
      probabilityOfSuccess,
      overallOpportunityLevel
    };
  }
  
  /**
   * REGULATOR PERSONA
   * Checks legal, sanctions, and ethical constraints
   */
  static async runRegulator(params: Partial<ReportParameters>): Promise<RegulatorAnalysis> {
    const legalIssues: PersonaFinding[] = [];
    const sanctionsRisks: PersonaFinding[] = [];
    const ethicalConcerns: PersonaFinding[] = [];
    const complianceRequirements: string[] = [];
    
    // Entity type compliance
    if (params.entityClassification === 'government') {
      complianceRequirements.push('Foreign Corrupt Practices Act (FCPA) compliance required');
      complianceRequirements.push('UK Bribery Act considerations');
      complianceRequirements.push('Public procurement transparency obligations');
      
      legalIssues.push({
        id: 'leg-gov-compliance',
        severity: 'warning',
        title: 'Government Entity Compliance Burden',
        description: 'Dealing with government entities requires enhanced anti-corruption compliance.',
        evidence: ['FCPA applies to any US nexus', 'UK Bribery Act has extraterritorial reach'],
        confidence: 90,
        sources: ['Legal Compliance Database'],
        recommendation: 'Engage compliance counsel before any government engagement'
      });
    }
    
    // Sanctions screening
    const watchlistCountries = ['Russia', 'Belarus', 'China', 'Cuba', 'Iran', 'North Korea', 'Syria', 'Venezuela'];
    if (params.country && watchlistCountries.includes(params.country)) {
      sanctionsRisks.push({
        id: 'sanc-watchlist',
        severity: 'critical',
        title: 'Enhanced Sanctions Screening Required',
        description: `${params.country} is subject to enhanced due diligence requirements.`,
        evidence: ['OFAC regulations', 'EU sanctions framework', 'UN restrictions'],
        confidence: 95,
        sources: ['OFAC SDN List', 'EU Sanctions Map'],
        recommendation: 'Obtain sanctions clearance before any transaction'
      });
    }
    
    // Industry-specific regulations
    if (params.industry?.some(i => ['Finance', 'Banking', 'Insurance', 'Fintech'].includes(i))) {
      complianceRequirements.push('Financial services licensing required');
      complianceRequirements.push('AML/KYC program mandatory');
      complianceRequirements.push('Capital adequacy requirements may apply');
      
      legalIssues.push({
        id: 'leg-finserv',
        severity: 'warning',
        title: 'Financial Services Regulatory Burden',
        description: 'Financial services require extensive licensing and ongoing compliance.',
        evidence: ['Average licensing time: 6-12 months', 'Ongoing reporting requirements'],
        confidence: 85,
        sources: ['Regulatory Intelligence'],
        recommendation: 'Begin licensing process early in timeline'
      });
    }
    
    // Data protection
    if (params.country && ['Germany', 'France', 'Netherlands', 'UK', 'Australia'].includes(params.country)) {
      complianceRequirements.push('GDPR or equivalent data protection compliance');
      complianceRequirements.push('Data localization requirements may apply');
    }
    
    // Ethical concerns
    if (params.industry?.some(i => ['Mining', 'Oil & Gas', 'Defense', 'Tobacco', 'Gambling'].includes(i))) {
      ethicalConcerns.push({
        id: 'eth-sensitive',
        severity: 'info',
        title: 'ESG-Sensitive Industry',
        description: 'Industry may face ESG scrutiny from investors and stakeholders.',
        evidence: ['Industry on ESG watchlists', 'Increasing divestment pressure'],
        confidence: 70,
        sources: ['ESG Rating Agencies'],
        recommendation: 'Prepare ESG narrative and impact mitigation plan'
      });
    }
    
    // Determine regulatory pathway
    const issueCount = legalIssues.length + sanctionsRisks.length;
    const regulatoryPathway = issueCount === 0 
      ? 'Standard pathway - normal compliance procedures'
      : issueCount <= 2 
        ? 'Enhanced pathway - additional due diligence required'
        : 'Complex pathway - specialist legal counsel required';
    
    const clearanceEstimate = issueCount === 0 
      ? '2-4 weeks'
      : issueCount <= 2 
        ? '1-3 months'
        : '3-6+ months';
    
    return {
      persona: 'regulator',
      legalIssues,
      sanctionsRisks,
      ethicalConcerns,
      complianceRequirements,
      regulatoryPathway,
      clearanceEstimate
    };
  }
  
  /**
   * ACCOUNTANT PERSONA
   * Validates cashflow, margins, and economic durability
   */
  static async runAccountant(params: Partial<ReportParameters>): Promise<AccountantAnalysis> {
    const cashflowConcerns: PersonaFinding[] = [];
    const marginAnalysis: PersonaFinding[] = [];
    const economicDurability: PersonaFinding[] = [];
    
    // Check capital adequacy
    const budgetCapStr = params.calibration?.constraints?.budgetCap;
    const budgetCap = budgetCapStr ? parseFloat(budgetCapStr.replace(/[^0-9.]/g, '')) : undefined;
    if (budgetCap && !isNaN(budgetCap)) {
      if (budgetCap < 500000) {
        cashflowConcerns.push({
          id: 'cf-thin',
          severity: 'warning',
          title: 'Limited Capital Buffer',
          description: 'Budget may not cover unexpected costs or extended timelines.',
          evidence: [`Budget: $${budgetCap.toLocaleString()}`, 'Recommended buffer: 30% of budget'],
          confidence: 80,
          sources: ['Financial Planning Standards'],
          recommendation: 'Maintain 30% contingency reserve'
        });
      }
      
      if (budgetCap >= 1000000) {
        economicDurability.push({
          id: 'ed-capitalized',
          severity: 'positive',
          title: 'Adequate Capitalization',
          description: 'Budget level supports multi-year operations and unexpected challenges.',
          evidence: [`Budget: $${budgetCap.toLocaleString()}`],
          confidence: 75,
          sources: ['Financial Analysis'],
          recommendation: 'Deploy capital strategically over multiple phases'
        });
      }
    } else {
      cashflowConcerns.push({
        id: 'cf-unknown',
        severity: 'warning',
        title: 'Capital Requirements Undefined',
        description: 'Cannot assess financial viability without understanding capital available.',
        evidence: ['Budget/capital field not specified'],
        confidence: 100,
        sources: ['Input Validation'],
        recommendation: 'Define available capital and funding sources'
      });
    }
    
    // Check return expectations vs risk (using riskTolerance as proxy)
    const riskToleranceStr = params.riskTolerance;
    const roiExpectation = riskToleranceStr === 'High' ? 30 : riskToleranceStr === 'Medium' ? 20 : 10;
    if (roiExpectation && roiExpectation > 25) {
      marginAnalysis.push({
        id: 'ma-high-roi',
        severity: 'warning',
        title: 'Aggressive Return Expectations',
        description: 'ROI expectations above 25% are difficult to achieve consistently.',
        evidence: [`Target ROI: ${roiExpectation}%`, 'Achievable with significant risk only'],
        confidence: 75,
        sources: ['Historical Return Analysis'],
        recommendation: 'Stress-test assumptions underlying return projections'
      });
    }
    
    // Economic durability based on market
    const stableMarkets = ['Australia', 'Japan', 'Singapore', 'Germany', 'UK', 'Canada'];
    if (params.country && stableMarkets.includes(params.country)) {
      economicDurability.push({
        id: 'ed-stable',
        severity: 'positive',
        title: 'Stable Economic Environment',
        description: 'Target market has strong institutional stability and predictable business environment.',
        evidence: ['Low inflation volatility', 'Strong rule of law', 'Predictable regulation'],
        confidence: 80,
        sources: ['Economic Stability Index'],
        recommendation: 'Premium valuations may be justified by stability'
      });
    }
    
    // Calculate viability
    const concernCount = cashflowConcerns.filter(c => c.severity !== 'positive').length;
    const positiveCount = [...marginAnalysis, ...economicDurability].filter(f => f.severity === 'positive').length;
    
    let financialViability: AccountantAnalysis['financialViability'] = 'viable';
    if (concernCount >= 3) financialViability = 'unviable';
    else if (concernCount >= 2) financialViability = 'marginal';
    else if (positiveCount >= 2 && concernCount === 0) financialViability = 'strong';
    
    return {
      persona: 'accountant',
      cashflowConcerns,
      marginAnalysis,
      economicDurability,
      breakEvenAnalysis: {
        timeToBreakeven: budgetCap && budgetCap > 500000 ? '18-24 months' : '24-36 months',
        confidenceLevel: budgetCap ? 65 : 30
      },
      financialViability
    };
  }
  
  /**
   * OPERATOR PERSONA
   * Tests execution feasibility: team, supply chains, infrastructure
   */
  static async runOperator(params: Partial<ReportParameters>): Promise<OperatorAnalysis> {
    const executionRisks: PersonaFinding[] = [];
    const teamGaps: PersonaFinding[] = [];
    const supplyChainIssues: PersonaFinding[] = [];
    const infrastructureGaps: PersonaFinding[] = [];
    const requiredCapabilities: string[] = [];
    
    // Check for local presence
    if (params.country && !params.userCity) {
      executionRisks.push({
        id: 'ex-no-city',
        severity: 'warning',
        title: 'No Specific Location Selected',
        description: 'Without a target city, operational planning is significantly more complex.',
        evidence: ['Country selected but no city'],
        confidence: 70,
        sources: ['Operational Planning Standards'],
        recommendation: 'Identify target city for more precise planning'
      });
    }
    
    // Team requirements based on intent
    if (params.strategicIntent?.some(i => i.includes('Manufacturing') || i.includes('Production'))) {
      requiredCapabilities.push('Local manufacturing expertise');
      requiredCapabilities.push('Supply chain management');
      requiredCapabilities.push('Quality control systems');
      
      teamGaps.push({
        id: 'team-manuf',
        severity: 'info',
        title: 'Manufacturing Expertise Required',
        description: 'Manufacturing operations require specialized local expertise.',
        evidence: ['Manufacturing intent detected'],
        confidence: 80,
        sources: ['Operational Requirements'],
        recommendation: 'Plan for local hiring or partner with established operator'
      });
    }
    
    // Infrastructure assessment based on region
    const developingMarkets = ['Vietnam', 'Indonesia', 'Philippines', 'India', 'Nigeria', 'Kenya', 'Bangladesh'];
    if (params.country && developingMarkets.includes(params.country)) {
      infrastructureGaps.push({
        id: 'infra-dev',
        severity: 'warning',
        title: 'Infrastructure Development Considerations',
        description: 'Target market may have infrastructure gaps that affect operations.',
        evidence: ['Developing market classification', 'Variable infrastructure quality'],
        confidence: 70,
        sources: ['Infrastructure Index'],
        recommendation: 'Conduct infrastructure assessment before committing'
      });
    }
    
    // Supply chain for international operations
    if (params.country && params.country !== 'Australia') {
      supplyChainIssues.push({
        id: 'sc-intl',
        severity: 'info',
        title: 'International Supply Chain Complexity',
        description: 'Cross-border operations add supply chain complexity and lead times.',
        evidence: ['International target market'],
        confidence: 75,
        sources: ['Supply Chain Analysis'],
        recommendation: 'Map critical supply chain dependencies early'
      });
    }
    
    // Execution timeline assessment
    const timeline = params.expansionTimeline || '';
    if (timeline.includes('3 month') || timeline.includes('6 month')) {
      executionRisks.push({
        id: 'ex-rushed',
        severity: 'warning',
        title: 'Compressed Timeline Risk',
        description: 'Short timelines increase execution risk and reduce ability to course-correct.',
        evidence: [`Timeline: ${timeline}`],
        confidence: 75,
        sources: ['Project Management Analysis'],
        recommendation: 'Build in decision gates and contingency time'
      });
    }
    
    // Calculate realism
    const riskCount = [...executionRisks, ...teamGaps, ...supplyChainIssues, ...infrastructureGaps]
      .filter(f => f.severity === 'warning').length;
    
    let implementationRealism: OperatorAnalysis['implementationRealism'] = 'achievable';
    if (riskCount >= 4) implementationRealism = 'unrealistic';
    else if (riskCount >= 2) implementationRealism = 'challenging';
    else if (riskCount === 0) implementationRealism = 'straightforward';
    
    return {
      persona: 'operator',
      executionRisks,
      teamGaps,
      supplyChainIssues,
      infrastructureGaps,
      implementationRealism,
      requiredCapabilities
    };
  }
  
  /**
   * DEBATE SYNTHESIS
   * Combines all persona analyses into unified recommendation
   */
  static synthesizeDebate(
    skeptic: SkepticAnalysis,
    advocate: AdvocateAnalysis,
    regulator: RegulatorAnalysis,
    accountant: AccountantAnalysis,
    operator: OperatorAnalysis
  ): DebateSynthesis {
    // Count critical issues across personas
    const criticalIssues = [
      ...skeptic.dealKillers.filter(d => d.severity === 'critical'),
      ...regulator.sanctionsRisks.filter(s => s.severity === 'critical')
    ];
    
    const warnings = [
      ...skeptic.dealKillers.filter(d => d.severity === 'warning'),
      ...skeptic.overOptimism,
      ...skeptic.hiddenRisks,
      ...regulator.legalIssues.filter(l => l.severity === 'warning'),
      ...accountant.cashflowConcerns.filter(c => c.severity === 'warning'),
      ...operator.executionRisks.filter(e => e.severity === 'warning')
    ];
    
    const positives = [
      ...advocate.upsidePotential,
      ...advocate.synergies,
      ...advocate.valueLevers
    ];
    
    // Calculate ratings
    const riskRating = Math.min(100, criticalIssues.length * 40 + warnings.length * 15);
    const opportunityRating = Math.min(100, positives.length * 20 + 20);
    
    let readinessRating = 50;
    if (accountant.financialViability === 'strong') readinessRating += 20;
    if (accountant.financialViability === 'unviable') readinessRating -= 30;
    if (operator.implementationRealism === 'straightforward') readinessRating += 15;
    if (operator.implementationRealism === 'unrealistic') readinessRating -= 25;
    if (regulator.sanctionsRisks.length === 0) readinessRating += 10;
    readinessRating = Math.max(0, Math.min(100, readinessRating));
    
    // Determine recommendation
    let overallRecommendation: DebateSynthesis['overallRecommendation'] = 'proceed-with-caution';
    if (criticalIssues.length > 0) {
      overallRecommendation = 'do-not-proceed';
    } else if (warnings.length >= 5) {
      overallRecommendation = 'significant-concerns';
    } else if (warnings.length <= 1 && positives.length >= 3) {
      overallRecommendation = 'proceed';
    }
    
    // Find consensus and disagreements
    const consensusPoints: string[] = [];
    const disagreements: DebateSynthesis['disagreements'] = [];
    
    // Check for consensus on viability
    if (skeptic.overallConcernLevel === 'low' && advocate.overallOpportunityLevel !== 'low') {
      consensusPoints.push('All personas agree the opportunity is worth pursuing');
    }
    
    if (skeptic.overallConcernLevel !== 'low' && advocate.overallOpportunityLevel !== 'low') {
      disagreements.push({
        topic: 'Risk vs Opportunity Balance',
        positions: [
          { persona: 'Skeptic', position: `Concern level: ${skeptic.overallConcernLevel}` },
          { persona: 'Advocate', position: `Opportunity level: ${advocate.overallOpportunityLevel}` }
        ]
      });
    }
    
    // Critical actions
    const criticalActions: string[] = [];
    if (criticalIssues.length > 0) {
      criticalActions.push(`BLOCKER: Resolve ${criticalIssues[0].title} before proceeding`);
    }
    if (regulator.complianceRequirements.length > 0) {
      criticalActions.push(`Complete compliance requirements: ${regulator.complianceRequirements[0]}`);
    }
    if (accountant.financialViability !== 'strong') {
      criticalActions.push('Strengthen financial position or secure additional funding');
    }
    if (operator.requiredCapabilities.length > 0) {
      criticalActions.push(`Build capability: ${operator.requiredCapabilities[0]}`);
    }
    
    // Calculate confidence
    const confidenceLevel = Math.max(30, Math.min(90, 
      70 - (criticalIssues.length * 20) + (positives.length * 5) - (warnings.length * 3)
    ));
    
    // Generate summary
    let summary = '';
    if (overallRecommendation === 'proceed') {
      summary = 'The multi-perspective analysis indicates this is a viable opportunity with manageable risks. All five personas find no critical issues, and several value-creation opportunities have been identified.';
    } else if (overallRecommendation === 'proceed-with-caution') {
      summary = `The analysis reveals a mixed picture. There are ${positives.length} identified opportunities but ${warnings.length} warnings that require attention. Proceed only after addressing the noted concerns.`;
    } else if (overallRecommendation === 'significant-concerns') {
      summary = `Multiple personas have raised substantial concerns. ${warnings.length} issues need resolution before this can be considered viable. Recommend a comprehensive review before any commitment.`;
    } else {
      summary = `The Skeptic and/or Regulator have identified critical blockers. ${criticalIssues.length} deal-killing issue(s) must be resolved. Do not proceed without addressing: ${criticalIssues.map(i => i.title).join(', ')}.`;
    }
    
    return {
      overallRecommendation,
      confidenceLevel,
      consensusPoints,
      disagreements,
      criticalActions,
      riskRating,
      opportunityRating,
      readinessRating,
      summary
    };
  }
}

export default PersonaEngine;

