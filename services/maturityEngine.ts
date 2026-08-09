// Maturity Assessment & Smart Analytics Engine

export interface MaturityScore {
  dimension: string;
  score: number; // 1-5 scale
  benchmarkAverage: number;
  status: 'Critical' | 'Below Average' | 'Average' | 'Strong' | 'Excellent';
  recommendations: string[];
}

export interface InsightAlert {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  action?: string;
  affectedStep?: string;
}

// Industry benchmarks for comparison
const industryBenchmarks = {
  'Technology': {
    'Market Positioning': 4.2,
    'Financial Planning': 3.8,
    'Operational Strategy': 4.1,
    'Partnership Ecosystem': 4.3,
    'Compliance & Governance': 3.5,
    'Performance Metrics': 4.0,
    'Innovation Capacity': 4.4,
    'Team Capability': 4.1,
  },
  'Manufacturing': {
    'Market Positioning': 3.2,
    'Financial Planning': 4.0,
    'Operational Strategy': 4.2,
    'Partnership Ecosystem': 3.5,
    'Compliance & Governance': 3.8,
    'Performance Metrics': 3.7,
    'Innovation Capacity': 2.8,
    'Team Capability': 3.3,
  },
  'Retail': {
    'Market Positioning': 3.5,
    'Financial Planning': 3.6,
    'Operational Strategy': 3.7,
    'Partnership Ecosystem': 3.2,
    'Compliance & Governance': 3.4,
    'Performance Metrics': 3.5,
    'Innovation Capacity': 3.0,
    'Team Capability': 3.2,
  },
  'Finance': {
    'Market Positioning': 3.9,
    'Financial Planning': 4.5,
    'Operational Strategy': 4.0,
    'Partnership Ecosystem': 4.2,
    'Compliance & Governance': 4.8,
    'Performance Metrics': 4.3,
    'Innovation Capacity': 3.5,
    'Team Capability': 4.0,
  },
  'Healthcare': {
    'Market Positioning': 3.6,
    'Financial Planning': 4.1,
    'Operational Strategy': 4.2,
    'Partnership Ecosystem': 3.8,
    'Compliance & Governance': 4.7,
    'Performance Metrics': 4.0,
    'Innovation Capacity': 3.3,
    'Team Capability': 3.9,
  },
};

// Calculate maturity score for each dimension
export const calculateMaturityScores = (params: any, industry: string = 'Technology'): MaturityScore[] => {
  const benchmarks = (industryBenchmarks as any)[industry] || industryBenchmarks['Technology'];
  
  const dimensions = [
    {
      name: 'Market Positioning',
      score: calculateMarketPositioningScore(params),
      recommendations: getMarketPositioningRecommendations(params),
    },
    {
      name: 'Financial Planning',
      score: calculateFinancialPlanningScore(params),
      recommendations: getFinancialPlanningRecommendations(params),
    },
    {
      name: 'Operational Strategy',
      score: calculateOperationalScore(params),
      recommendations: getOperationalRecommendations(params),
    },
    {
      name: 'Partnership Ecosystem',
      score: calculatePartnershipScore(params),
      recommendations: getPartnershipRecommendations(params),
    },
    {
      name: 'Compliance & Governance',
      score: calculateComplianceScore(params),
      recommendations: getComplianceRecommendations(params),
    },
    {
      name: 'Performance Metrics',
      score: calculatePerformanceMetricsScore(params),
      recommendations: getPerformanceMetricsRecommendations(params),
    },
    {
      name: 'Innovation Capacity',
      score: calculateInnovationScore(params),
      recommendations: getInnovationRecommendations(params),
    },
    {
      name: 'Team Capability',
      score: calculateTeamCapabilityScore(params),
      recommendations: getTeamCapabilityRecommendations(params),
    },
  ];
  
  return dimensions.map(dim => ({
    dimension: dim.name,
    score: Math.min(5, Math.max(1, dim.score)),
    benchmarkAverage: benchmarks[dim.name as keyof typeof benchmarks] || 3.5,
    status: getMaturityStatus(Math.min(5, Math.max(1, dim.score))),
    recommendations: dim.recommendations,
  }));
};

// Individual dimension scorers
const calculateMarketPositioningScore = (params: any): number => {
  let score = 2;
  if (params.marketPositioning) score += 0.5;
  if (params.customerPersona) score += 0.5;
  if (params.competitiveAdvantage) score += 0.5;
  if (params.goToMarketStrategy) score += 0.5;
  if (params.pricingModel) score += 0.5;
  return score;
};

const calculateFinancialPlanningScore = (params: any): number => {
  let score = 2;
  if (params.year1Revenue) score += 0.4;
  if (params.operatingMarginTarget) score += 0.4;
  if (params.totalCapital) score += 0.4;
  if (params.q1CashFlow) score += 0.4;
  if (params.grossMargin && params.operatingMargin && params.netMargin) score += 0.4;
  return score;
};

const calculateOperationalScore = (params: any): number => {
  let score = 2;
  if (params.employeeCount) score += 0.3;
  if (params.phase1Milestones) score += 0.3;
  if (params.techStack) score += 0.3;
  if (params.qualityStandards) score += 0.3;
  if (params.inventoryStrategy) score += 0.4;
  return score;
};

const calculatePartnershipScore = (params: any): number => {
  let score = 2;
  if (params.targetPartners) score += 0.5;
  if (params.keySuppliers) score += 0.5;
  if (params.jvOpportunities) score += 0.5;
  if (params.strategicAlliances) score += 0.5;
  return score;
};

const calculateComplianceScore = (params: any): number => {
  let score = 2;
  if (params.applicableRegulations) score += 0.5;
  if (params.governanceStructure) score += 0.5;
  if (params.gdprCompliance) score += 0.5;
  if (params.internalControls) score += 0.5;
  return score;
};

const calculatePerformanceMetricsScore = (params: any): number => {
  let score = 2;
  if (params.financialKpis) score += 0.3;
  if (params.operationalKpis) score += 0.3;
  if (params.csatTarget) score += 0.3;
  if (params.npsTarget) score += 0.3;
  if (params.employeeSatisfaction) score += 0.3;
  return score;
};

const calculateInnovationScore = (params: any): number => {
  let score = 2;
  if (params.techStack && params.techStack.includes('AI')) score += 0.5;
  if (params.techStack && params.techStack.includes('Cloud')) score += 0.5;
  if (params.fiveYearRoadmap) score += 0.5;
  if (params.customSections) score += 0.3;
  return score;
};

const calculateTeamCapabilityScore = (params: any): number => {
  let score = 2;
  if (params.organizationName) score += 0.3;
  if (params.employeeCount && parseInt(params.employeeCount) > 10) score += 0.3;
  if (params.competencies) score += 0.3;
  if (params.humanCapital) score += 0.3;
  if (params.trainingPrograms) score += 0.3;
  return score;
};

// Get recommendations for each dimension
const getMarketPositioningRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  if (!params.marketPositioning) recs.push('Clarify your unique market positioning');
  if (!params.customerPersona) recs.push('Define target customer personas in detail');
  if (!params.competitiveAdvantage) recs.push('Articulate clear competitive advantages');
  if (!params.goToMarketStrategy) recs.push('Develop a detailed go-to-market strategy');
  return recs.length > 0 ? recs : ['Strong market positioning strategy'];
};

const getFinancialPlanningRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  if (!params.year1Revenue) recs.push('Project Year 1 revenue targets');
  if (!params.operatingMarginTarget) recs.push('Set operating margin targets');
  if (!params.totalCapital) recs.push('Define total capital requirements');
  if (!params.q1CashFlow) recs.push('Model quarterly cash flow projections');
  return recs.length > 0 ? recs : ['Comprehensive financial planning in place'];
};

const getOperationalRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  if (!params.employeeCount) recs.push('Define organizational structure and headcount');
  if (!params.phase1Milestones) recs.push('Create detailed implementation roadmap');
  if (!params.techStack) recs.push('Select and document technology infrastructure');
  if (!params.qualityStandards) recs.push('Establish quality assurance standards');
  return recs.length > 0 ? recs : ['Solid operational strategy'];
};

const getPartnershipRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  if (!params.targetPartners) recs.push('Identify strategic partnership targets');
  if (!params.keySuppliers) recs.push('Develop supplier and vendor strategy');
  if (!params.jvOpportunities) recs.push('Explore joint venture opportunities');
  return recs.length > 0 ? recs : ['Strong partnership ecosystem'];
};

const getComplianceRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  if (!params.applicableRegulations) recs.push('Document all applicable regulations');
  if (!params.governanceStructure) recs.push('Establish governance framework');
  if (!params.gdprCompliance) recs.push('Implement data privacy safeguards');
  return recs.length > 0 ? recs : ['Comprehensive compliance framework'];
};

const getPerformanceMetricsRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  if (!params.financialKpis) recs.push('Define financial KPIs and targets');
  if (!params.operationalKpis) recs.push('Establish operational performance metrics');
  if (!params.csatTarget) recs.push('Set customer satisfaction targets');
  return recs.length > 0 ? recs : ['Comprehensive performance tracking'];
};

const getInnovationRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  if (!params.techStack || !params.techStack.includes('AI')) recs.push('Consider AI/ML capabilities for competitive advantage');
  if (!params.techStack || !params.techStack.includes('Cloud')) recs.push('Leverage cloud infrastructure for scalability');
  if (!params.fiveYearRoadmap) recs.push('Develop 5-year innovation roadmap');
  return recs.length > 0 ? recs : ['Strong innovation pipeline'];
};

const getTeamCapabilityRecommendations = (params: any): string[] => {
  const recs: string[] = [];
  const empCount = parseInt(params.employeeCount) || 0;
  if (empCount < 5) recs.push('Plan for team expansion');
  if (!params.competencies) recs.push('Document core competencies');
  if (!params.humanCapital) recs.push('Invest in talent development and training');
  return recs.length > 0 ? recs : ['Strong team capability'];
};

// Get maturity status
const getMaturityStatus = (score: number): 'Critical' | 'Below Average' | 'Average' | 'Strong' | 'Excellent' => {
  if (score < 1.5) return 'Critical';
  if (score < 2.5) return 'Below Average';
  if (score < 3.5) return 'Average';
  if (score < 4.5) return 'Strong';
  return 'Excellent';
};

// Generate AI insights and alerts
export const generateAIInsights = (params: any): InsightAlert[] => {
  const insights: InsightAlert[] = [];
  
  // Revenue vs Market Size
  const revenue = parseFloat(params.year1Revenue) || 0;
  const marketSize = parseFloat(params.marketSize) || 0;
  const marketShare = marketSize > 0 ? (revenue / marketSize) * 100 : 0;
  
  if (revenue > 0 && marketShare > 10) {
    insights.push({
      severity: 'warning',
      title: 'Ambitious Market Share Target',
      message: `Your Year 1 revenue targets ${marketShare.toFixed(1)}% market share. This is aggressive - ensure realistic growth assumptions.`,
      affectedStep: '3.1',
    });
  }
  
  // Budget allocation validation
  const budgetTotal = (parseFloat(params.budgetOperations) || 0) +
                      (parseFloat(params.budgetGrowth) || 0) +
                      (parseFloat(params.budgetContingency) || 0);
  if (budgetTotal > 0 && budgetTotal !== 100) {
    insights.push({
      severity: 'warning',
      title: 'Budget Allocation Imbalance',
      message: `Total budget allocation is ${budgetTotal}%. Ensure it totals 100%.`,
      affectedStep: '3.2',
    });
  }
  
  // Growth rate vs market size
  const growthRate = parseFloat(params.marketGrowthRate) || 0;
  if (growthRate < 5) {
    insights.push({
      severity: 'warning',
      title: 'Low Market Growth',
      message: 'Target market is growing slower than industry average. Consider market diversification.',
      affectedStep: '2.1',
    });
  } else if (growthRate > 50) {
    insights.push({
      severity: 'info',
      title: 'High Growth Market',
      message: 'Excellent market conditions. Ensure you have capacity to capture growth.',
      affectedStep: '2.1',
    });
  }
  
  // Competitive landscape
  const competitors = parseInt(params.competitorCount) || 0;
  if (competitors > 20) {
    insights.push({
      severity: 'warning',
      title: 'Highly Fragmented Market',
      message: `${competitors} competitors detected. Focus on differentiation to stand out.`,
      affectedStep: '2.2',
    });
  } else if (competitors < 3) {
    insights.push({
      severity: 'info',
      title: 'Limited Competition',
      message: 'Few competitors present an opportunity - but verify market demand exists.',
      affectedStep: '2.2',
    });
  }
  
  // Cash flow warning
  const burnRate = parseFloat(params.burnRate) || 0;
  const cashFlow = parseFloat(params.q1CashFlow) || 0;
  if (burnRate > 0 && cashFlow > 0) {
    const monthsOfRunway = cashFlow / burnRate;
    if (monthsOfRunway < 12) {
      insights.push({
        severity: 'critical',
        title: 'Limited Cash Runway',
        message: `Based on burn rate, you have approximately ${monthsOfRunway.toFixed(1)} months of runway. Plan funding accordingly.`,
        affectedStep: '3.4',
      });
    }
  }
  
  // Team size recommendation
  const employees = parseInt(params.employeeCount) || 0;
  if (revenue > 0 && employees > 0) {
    const revenuePerEmployee = revenue / employees;
    if (revenuePerEmployee < 100000) {
      insights.push({
        severity: 'warning',
        title: 'Low Revenue Per Employee',
        message: 'Consider productivity improvements or right-sizing team.',
        affectedStep: '4.1',
      });
    }
  }
  
  // Missing critical sections
  if (!params.gdprCompliance && params.country === 'EU') {
    insights.push({
      severity: 'critical',
      title: 'GDPR Compliance Required',
      message: 'EU operations require GDPR compliance. This must be implemented.',
      affectedStep: '6.3',
    });
  }
  
  // Partnership gaps
  if (!params.targetPartners && params.jvOpportunities) {
    insights.push({
      severity: 'warning',
      title: 'Partnership Strategy Gap',
      message: 'You identified JV opportunities but no target partners. Define partnership strategy first.',
      affectedStep: '5.1',
    });
  }
  
  return insights;
};

// Generate opportunity recommendations
export const generateOpportunities = (params: any): string[] => {
  const opportunities: string[] = [];
  
  const marketGrowth = parseFloat(params.marketGrowthRate) || 0;
  const competitors = parseInt(params.competitorCount) || 0;
  
  if (marketGrowth > 20 && competitors < 10) {
    opportunities.push('High-growth market with limited competition - excellent expansion opportunity');
  }
  
  if (!params.jvOpportunities && params.targetPartners) {
    opportunities.push('Explore joint ventures with identified partners for accelerated growth');
  }
  
  if (!params.techStack || !params.techStack.includes('AI')) {
    opportunities.push('Implement AI/ML capabilities to enhance competitive position');
  }
  
  if (marketGrowth > 15) {
    opportunities.push('Consider geographic expansion into adjacent markets');
  }
  
  const margins = parseFloat(params.grossMargin) || 0;
  if (margins > 50) {
    opportunities.push('Strong margins enable investment in R&D and market expansion');
  }
  
  return opportunities;
};

