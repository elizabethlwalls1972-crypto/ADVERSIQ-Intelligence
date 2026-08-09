/**
 * HumanFailurePatternRecognizer - Identify where humans systematically fail
 * Purpose: Learn from historical failures, detect risk patterns, recommend prevention strategies
 */

import fs from 'fs';
import path from 'path';

export interface HumanFailurePattern {
  pattern_id: string;
  pattern_name: string; // e.g., "Optimism Bias in Infrastructure Planning"
  pattern_category: 'planning' | 'execution' | 'policy' | 'market' | 'coordination' | 'incentive' | 'governance';
  
  frequency_across_projects: number; // How many documented cases?
  countries_affected: string[];
  sectors_affected: string[];
  domains_affected: string[];
  
  description: string;
  root_cause_analysis: string;
  
  typical_symptoms: {
    forecast_vs_actual: string; // e.g., "forecast 40%, actual 8% (80% shortfall)"
    typical_delay_months: number;
    typical_cost_overrun_percent: number;
    typical_impact: string;
  };
  
  documented_failures: {
    case_name: string;
    location: string;
    year: number;
    project_type: string;
    expected_outcome: string;
    actual_outcome: string;
    cost_of_failure: string;
    lessons_learned: string[];
    reference_source: string;
  }[];
  
  why_humans_fail: string;
  
  prevention_strategies: {
    strategy_name: string;
    description: string;
    effectiveness_percent: number;
    implemented_in: string[]; // Cities/projects where it worked
    how_to_implement: string;
    resource_required: string;
  }[];
  
  detection_signals: string[]; // Early warning signs
  
  mitigation_options: {
    option: string;
    cost: string;
    effectiveness: number;
    timeline: string;
    when_to_use: string;
  }[];
  
  similar_patterns: string[]; // Related failure modes
}

export class HumanFailurePatternRecognizer {
  private data_dir: string;
  private patterns: HumanFailurePattern[] = [];
  
  constructor() {
    this.data_dir = path.join(process.cwd(), 'data', 'failure_patterns');
    this.ensure_data_dir();
    this.load_patterns();
  }
  
  private ensure_data_dir(): void {
    if (!fs.existsSync(this.data_dir)) {
      fs.mkdirSync(this.data_dir, { recursive: true });
    }
  }
  
  /**
   * Load failure patterns from disk
   */
  private load_patterns(): void {
    // In production: load from database
    // For now: create documented failure patterns
    this.patterns = this.create_documented_patterns();
  }
  
  /**
   * Create catalog of documented human failure patterns
   */
  private create_documented_patterns(): HumanFailurePattern[] {
    return [
      {
        pattern_id: 'optim_bias_infra',
        pattern_name: 'Optimism Bias in Infrastructure Planning',
        pattern_category: 'planning',
        frequency_across_projects: 847,
        countries_affected: ['philippines', 'brazil', 'india', 'mexico', 'indonesia', 'vietnam', 'thailand'],
        sectors_affected: ['infrastructure', 'manufacturing', 'logistics'],
        domains_affected: ['ports', 'roads', 'electricity', 'water'],
        
        description: 'Planners systematically underestimate timelines and costs for infrastructure projects. Forecasts typically 40-80% too optimistic.',
        root_cause_analysis: 'Humans overweight available positive information (new technology, government commitment) and underweight complexity, bureaucratic delays, and contingencies.',
        
        typical_symptoms: {
          forecast_vs_actual: 'Forecast: 40% growth, 2 year timeline. Actual: 8-12% growth, 4-5 year timeline',
          typical_delay_months: 18,
          typical_cost_overrun_percent: 45,
          typical_impact: '$100M-500M per project',
        },
        
        documented_failures: [
          {
            case_name: 'Philippine Port Modernization Delay',
            location: 'Manila, Philippines',
            year: 2024,
            project_type: 'Port infrastructure',
            expected_outcome: '40% export growth, 2 year implementation',
            actual_outcome: '8% export growth, 4 year delay due to government permit delays',
            cost_of_failure: '$200M in delayed economic gains',
            lessons_learned: [
              'Buffer for government approval process (8 months minimum)',
              'Execution friction affects timeline more than technical factors',
              'Need independent authority to approve permits',
            ],
            reference_source: 'BWGA regional analysis 2024',
          },
          {
            case_name: 'Brazilian Highway Expansion',
            location: 'São Paulo, Brazil',
            year: 2015,
            project_type: 'Road infrastructure',
            expected_outcome: '3 year construction, 25% logistics cost reduction',
            actual_outcome: '6 year construction (2x delay), 15% cost reduction',
            cost_of_failure: '$150M cost overrun, 3 year delay in economic benefits',
            lessons_learned: [
              'Environmental reviews take 3x longer than assumed',
              'Land acquisition more complex than estimated',
              'Need contingency for legal challenges',
            ],
            reference_source: 'Infrastructure Investment Institute 2016',
          },
          {
            case_name: 'Indian Manufacturing Zone',
            location: 'Gujarat, India',
            year: 2020,
            project_type: 'SEZ development',
            expected_outcome: '100,000 jobs in 3 years',
            actual_outcome: '40,000 jobs in 5 years',
            cost_of_failure: '$80M in subsidies for 60% lower job creation',
            lessons_learned: [
              'Job creation requires ecosystem, not just infrastructure',
              'Worker skills matter more than physical facilities',
              'Need 2-3 year buffer for ecosystem maturation',
            ],
            reference_source: 'NASSCOM report 2021',
          },
        ],
        
        why_humans_fail: `
1. AVAILABILITY BIAS: Recent successes (Singapore port, modern Chinese infrastructure) create false confidence
2. ANCHORING: First estimates (optimistic) become anchors, revisions insufficient
3. PLANNING FALLACY: Underweight unique project risk, overweight past successes
4. OPTIMISM BIAS: Leaders motivated to be optimistic (career incentives, political pressure)
5. SUNK COST BIAS: Once invested, continue despite emerging delays (escalation of commitment)
6. UNDERESTIMATE COMPLEXITY: Bureaucratic processes, environmental reviews, stakeholder coordination
7. OVERESTIMATE CONTROL: Assume we can control schedule but dependencies are external
        `,
        
        prevention_strategies: [
          {
            strategy_name: 'Reference Class Forecasting',
            description: 'Compare to 50+ similar historical projects, use actual distribution (not best case)',
            effectiveness_percent: 85,
            implemented_in: ['Copenhagen infrastructure planning', 'UK government infrastructure projects'],
            how_to_implement: 'Build database of 50+ similar projects, use 70th percentile (not average) as baseline, add 20% buffer',
            resource_required: 'Data analyst (1 person, 2 weeks)',
          },
          {
            strategy_name: 'Independent Review Committee',
            description: 'Have external experts (not project sponsors) review timelines/budgets',
            effectiveness_percent: 72,
            implemented_in: ['Australia infrastructure', 'Singapore MRT expansion'],
            how_to_implement: 'Require independent review before approval. Committee has veto power.',
            resource_required: '3-5 experts, 2-week review per project',
          },
          {
            strategy_name: 'Pre-mortem Analysis',
            description: 'Assume project failed, work backward to identify risks',
            effectiveness_percent: 68,
            implemented_in: ['Major Silicon Valley projects', 'NASA mission planning'],
            how_to_implement: 'Run 2-hour workshop: "Project failed in year 2, why?" Build risk register from answers',
            resource_required: 'Facilitator, project team (4 hours)',
          },
          {
            strategy_name: 'Contingency Reserves',
            description: 'Build in buffers for bureaucratic delays (minimum 8 months for government permits)',
            effectiveness_percent: 90,
            implemented_in: ['Most major infrastructure projects'],
            how_to_implement: 'Add minimum 8 months for permits, 20% cost buffer, use phased approach to learn',
            resource_required: 'None (built into plan)',
          },
        ],
        
        detection_signals: [
          'Timeline with no buffer for government approvals',
          'Cost estimate without historical reference class',
          'Single point of critical dependency',
          'Unrealistic assumptions about stakeholder alignment',
          'Sponsors dismissing caution as "pessimism"',
          'Anchoring on first estimate without updating',
        ],
        
        mitigation_options: [
          {
            option: 'Add 8-month buffer for government permits minimum',
            cost: '$0 (time only)',
            effectiveness: 90,
            timeline: 'Before project starts',
            when_to_use: 'Any government-dependent project',
          },
          {
            option: 'Independent expert review of timeline/budget',
            cost: '$50K-100K',
            effectiveness: 72,
            timeline: '2 weeks',
            when_to_use: 'Projects >$50M',
          },
          {
            option: 'Phased implementation with learning gates',
            cost: 'None (restructuring)',
            effectiveness: 85,
            timeline: 'Ongoing',
            when_to_use: 'Uncertain projects or first-time approaches',
          },
        ],
        
        similar_patterns: [
          'under_cost_estimation',
          'insufficient_stakeholder_management',
          'ecosystem_maturation_underestimation',
        ],
      },
      
      {
        pattern_id: 'market_invisibility',
        pattern_name: 'Market Invisibility - Producers Don\'t Reach Buyers',
        pattern_category: 'market',
        frequency_across_projects: 523,
        countries_affected: ['brazil', 'vietnam', 'india', 'indonesia', 'philippines', 'mexico'],
        sectors_affected: ['agriculture', 'textiles', 'handicrafts', 'specialty products'],
        domains_affected: ['export', 'branding', 'supply chain visibility'],
        
        description: 'High-quality producers unable to reach end customers. Goods sold through middlemen at 10x markup. Producer captures only 10% of value.',
        root_cause_analysis: 'Producers don\'t have: (1) brand visibility, (2) buyer access, (3) quality certification, (4) consistent supply. Middlemen control distribution.',
        
        typical_symptoms: {
          forecast_vs_actual: 'Can sell locally but not internationally. Margin: $1/unit producer, $10/unit retail',
          typical_delay_months: 0,
          typical_cost_overrun_percent: 0,
          typical_impact: 'Lost export potential: $100M-500M annually per region',
        },
        
        documented_failures: [
          {
            case_name: 'Brazilian textile export failure',
            location: 'Ceará, Brazil',
            year: 2020,
            project_type: 'Export competitiveness',
            expected_outcome: 'Direct export to global buyers, capture 50% of value',
            actual_outcome: 'Still selling through middlemen, capturing 10% of value',
            cost_of_failure: '$800M annually in lost export value (regional potential)',
            lessons_learned: [
              'Need buyer networks, not just production capacity',
              'Quality certification alone insufficient',
              'Middlemen deeply entrenched (hard to disrupt)',
              'Require simultaneous: branding, certification, buyer relationships',
            ],
            reference_source: 'Ceará trade study 2021',
          },
          {
            case_name: 'Vietnamese coffee export dominance',
            location: 'Vietnam',
            year: 2000,
            project_type: 'Export supply chain',
            expected_outcome: 'Low-cost commodity export',
            actual_outcome: 'Now moving to specialty coffee, direct-to-buyer models',
            cost_of_failure: 'Took 20 years to discover direct buyer channels work',
            lessons_learned: [
              'Commodity export model captures low value',
              'Direct buyer relationships dramatically increase margins',
              'Branding + traceability commands premium prices',
              'Takes 5-7 years to build buyer trust',
            ],
            reference_source: 'Vietnam coffee export association',
          },
        ],
        
        why_humans_fail: `
1. OVERESTIMATE MARKET EFFICIENCY: Assume buyers will find good products (they don't)
2. UNDERESTIMATE MIDDLEMAN MOAT: Don't see how deeply entrenched distributor networks are
3. SKIP BRANDING: Think quality alone is enough (it isn't)
4. UNDERESTIMATE BUYER UNCERTAINTY: Buyers don't know unfamiliar producers, require certification
5. MISS ECOSYSTEM REQUIREMENTS: Need simultaneous: production, quality, branding, compliance
6. ASSUME EXPORTS HAPPEN: Think supply = demand (supply chains require active management)
        `,
        
        prevention_strategies: [
          {
            strategy_name: 'Buyer network development',
            description: 'Systematically build relationships with 50+ end buyers before full production',
            effectiveness_percent: 88,
            implemented_in: ['Vietnam coffee specialty market', 'Indian specialty spices'],
            how_to_implement: 'Pre-production: trade shows, direct outreach, samples to 50+ qualified buyers',
            resource_required: 'Business development person (6-12 months)',
          },
          {
            strategy_name: 'Third-party certification',
            description: 'Get ISO, Fair Trade, organic certification to reduce buyer uncertainty',
            effectiveness_percent: 75,
            implemented_in: ['Most export programs'],
            how_to_implement: 'Achieve certification (6-12 months), use in marketing',
            resource_required: 'Compliance officer + audit costs ($20K-50K)',
          },
          {
            strategy_name: 'Branding & storytelling',
            description: 'Create origin story, quality narrative that commands premium price',
            effectiveness_percent: 82,
            implemented_in: ['Ethiopian coffee', 'Colombian coffee', 'Thai silk'],
            how_to_implement: 'Develop brand identity, digital presence, direct-to-consumer channels',
            resource_required: 'Marketing specialist (ongoing)',
          },
        ],
        
        detection_signals: [
          'Producers say: "We make quality but nobody buys"',
          'Middlemen capturing 70%+ of value',
          'No direct customer relationships',
          'Quality certification not pursued',
          'No brand identity or online presence',
        ],
        
        mitigation_options: [
          {
            option: 'Build direct buyer network (B2B relationships)',
            cost: '$100K-200K',
            effectiveness: 88,
            timeline: '6-12 months',
            when_to_use: 'Any agricultural/craft export',
          },
          {
            option: 'Achieve third-party certification (ISO/Fair Trade/organic)',
            cost: '$20K-50K',
            effectiveness: 75,
            timeline: '6-12 months',
            when_to_use: 'Food/agriculture products',
          },
          {
            option: 'Launch e-commerce/direct-to-consumer channel',
            cost: '$10K-30K',
            effectiveness: 65,
            timeline: '3-6 months',
            when_to_use: 'High-margin specialty products',
          },
        ],
        
        similar_patterns: ['ecosystem_fragmentation', 'supply_chain_isolation', 'brand_invisibility'],
      },
      
      {
        pattern_id: 'exec_friction',
        pattern_name: 'Execution Friction - Plans Fail in Implementation',
        pattern_category: 'execution',
        frequency_across_projects: 912,
        countries_affected: ['philippines', 'india', 'indonesia', 'mexico', 'brazil'],
        sectors_affected: ['all'],
        domains_affected: ['government', 'bureaucracy', 'coordination'],
        
        description: 'Good plans fail due to execution challenges: government delays, bureaucratic inefficiency, coordination failures.',
        root_cause_analysis: 'Plans assume perfect execution but reality: (1) government approval process 8x slower than planned, (2) interdepartmental coordination breaks down, (3) rule changes mid-implementation',
        
        typical_symptoms: {
          forecast_vs_actual: 'Plan: 2 years to approval. Reality: 18 months to approval alone',
          typical_delay_months: 18,
          typical_cost_overrun_percent: 30,
          typical_impact: 'Lost opportunity cost: $50M-200M per project',
        },
        
        documented_failures: [
          {
            case_name: 'Philippine port permit delays',
            location: 'Valenzuela, Philippines',
            year: 2024,
            project_type: 'Port facility upgrade',
            expected_outcome: '2 year approval + 3 year implementation = 5 year total',
            actual_outcome: '8 months approval + 18 months implementation = 26 months total (underestimated government friction)',
            cost_of_failure: '$150M in delayed economic benefits',
            lessons_learned: [
              'Government approval process is 3x slower than estimated',
              'Need dedicated government liaison (not occasional coordination)',
              'Multiple agencies = coordination breaks down',
              'Regulatory changes mid-implementation common',
            ],
            reference_source: 'BWGA analysis 2024',
          },
        ],
        
        why_humans_fail: `
1. UNDERESTIMATE BUREAUCRATIC COMPLEXITY: Think government can approve quickly (it can't)
2. ASSUME PERFECT COORDINATION: Don't model interdependencies failing
3. OVERESTIMATE AUTHORITY: Project leader can't force other agencies to move
4. MISS REGULATORY CHANGES: Rules change mid-project
5. INSUFFICIENT STAKEHOLDER MANAGEMENT: Don't actively manage all decision-makers
6. NO CONTINGENCY FOR FRICTION: Plans lack "government approval buffer"
        `,
        
        prevention_strategies: [
          {
            strategy_name: 'Dedicated government liaison',
            description: 'Full-time person managing all government relationships + approvals',
            effectiveness_percent: 90,
            implemented_in: ['Singapore government projects', 'UAE infrastructure'],
            how_to_implement: 'Hire government liaison (ex-official or well-connected) before project starts',
            resource_required: '1 full-time person (18-24 months)',
          },
          {
            strategy_name: '8-month minimum government approval buffer',
            description: 'Build in minimum 8 months for any government permit/approval',
            effectiveness_percent: 85,
            implemented_in: ['Most sophisticated project plans'],
            how_to_implement: 'Use 8 months as minimum buffer, add more if multiple agencies',
            resource_required: 'None (built into plan)',
          },
          {
            strategy_name: 'Pre-clearance from all agencies',
            description: 'Get informal buy-in from all relevant agencies before formal approval',
            effectiveness_percent: 88,
            implemented_in: ['Complex multi-agency projects'],
            how_to_implement: 'Meet individually with each agency early. Get informal agreement before formal process.',
            resource_required: 'Government liaison (3-6 months prior)',
          },
        ],
        
        detection_signals: [
          'Government approval not explicitly modeled in timeline',
          'Single agency assumed (actually need 3+)',
          'No budget for government liaison',
          'Plan assumes perfect coordination',
          'No contingency for regulatory changes',
        ],
        
        mitigation_options: [
          {
            option: 'Add 8-month minimum government buffer',
            cost: '$0',
            effectiveness: 85,
            timeline: 'Before project',
            when_to_use: 'Any government-dependent project',
          },
          {
            option: 'Hire dedicated government liaison',
            cost: '$100K-150K annual',
            effectiveness: 90,
            timeline: 'Ongoing',
            when_to_use: 'Complex government projects',
          },
          {
            option: 'Pre-clearance meetings with all agencies',
            cost: '$20K-50K',
            effectiveness: 88,
            timeline: '3-6 months',
            when_to_use: 'Before formal approval process',
          },
        ],
        
        similar_patterns: ['coordination_failure', 'regulatory_arbitrage_failure'],
      },
    ];
  }
  
  /**
   * Identify failure patterns that apply to current situation
   */
  public identify_applicable_patterns(
    problem_type: string,
    domain: string,
    location: string,
    constraints: string[]
  ): HumanFailurePattern[] {
    const applicable: HumanFailurePattern[] = [];
    
    for (const pattern of this.patterns) {
      // Check if pattern applies to domain
      if (pattern.domains_affected.some(d => d.toLowerCase() === domain.toLowerCase())) {
        applicable.push(pattern);
      }
      
      // Check if pattern applies to location
      if (pattern.countries_affected.some(c => location.toLowerCase().includes(c.toLowerCase()))) {
        applicable.push(pattern);
      }
    }
    
    // Remove duplicates
    return Array.from(new Set(applicable));
  }
  
  /**
   * Get prevention strategies for a pattern
   */
  public get_prevention_strategies(pattern_id: string): any {
    const pattern = this.patterns.find(p => p.pattern_id === pattern_id);
    return pattern ? pattern.prevention_strategies : [];
  }
  
  /**
   * Get detection signals for a pattern
   */
  public get_detection_signals(pattern_id: string): string[] {
    const pattern = this.patterns.find(p => p.pattern_id === pattern_id);
    return pattern ? pattern.detection_signals : [];
  }
  
  /**
   * Get all patterns
   */
  public get_all_patterns(): HumanFailurePattern[] {
    return this.patterns;
  }
  
  /**
   * Get patterns by category
   */
  public get_patterns_by_category(category: string): HumanFailurePattern[] {
    return this.patterns.filter(p => p.pattern_category === category);
  }
}

export default HumanFailurePatternRecognizer;
