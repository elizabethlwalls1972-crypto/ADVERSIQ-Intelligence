/**
 * GlobalNSILOrchestrator - Master integration of UniversalInputProcessor,
 * SelfAuditEngine, HistoricalDevelopmentAnalyzer, HumanFailurePatternRecognizer
 * 
 * This orchestrator shows how all components work together to:
 * 1. Accept ANY problem from anywhere
 * 2. Understand through analysis
 * 3. Generate solutions
 * 4. Learn from outcomes
 */

import { UniversalInputProcessor, UniversalInput } from './universal_input_processor';
import { SelfAuditEngine, SelfAuditResult } from './self_audit_engine';
import { HistoricalDevelopmentAnalyzer, HistoricalParallel } from './historical_development_analyzer';
import { HumanFailurePatternRecognizer, HumanFailurePattern } from './human_failure_pattern_recognizer';
import { NSILTrajectoryLogger } from './trajectory_logger';
import { NSILFailureDetector } from './failure_detector';
import { NSILRefiner } from './nsil_refiner';

export interface GlobalProblemAnalysis {
  input_id: string;
  trajectory_session_id?: string;
  audit_id: string;
  timestamp: string;
  
  input: UniversalInput;
  audit: SelfAuditResult;
  
  historical_parallels: HistoricalParallel[];
  applicable_failure_patterns: HumanFailurePattern[];
  
  analysis: {
    problem_summary: string;
    root_causes: string[];
    historical_context: string;
    failure_pattern_risks: string[];
    success_probability: number;
  };
  
  recommendation: {
    approach: string;
    why_this_approach: string;
    implementation_phases: {
      phase: number;
      description: string;
      duration: string;
      budget: string;
      success_metrics: string[];
    }[];
    expected_outcome: string;
    timeline_months: number;
    budget_required: string;
    confidence: number;
    risks_and_mitigations: {
      risk: string;
      mitigation: string;
    }[];
  };
  
  historical_precedent: {
    case_name: string;
    location: string;
    year: number;
    outcome: string;
    applicability_percent: number;
  };
}

export class GlobalNSILOrchestrator {
  private input_processor: UniversalInputProcessor;
  private self_audit: SelfAuditEngine;
  private historical_analyzer: HistoricalDevelopmentAnalyzer;
  private failure_recognizer: HumanFailurePatternRecognizer;
  private trajectory_logger: NSILTrajectoryLogger;
  private failure_detector: NSILFailureDetector;
  private refiner: NSILRefiner;
  
  private completed_analyses: GlobalProblemAnalysis[] = [];
  
  constructor() {
    this.input_processor = new UniversalInputProcessor();
    this.self_audit = new SelfAuditEngine();
    this.historical_analyzer = new HistoricalDevelopmentAnalyzer();
    this.failure_recognizer = new HumanFailurePatternRecognizer();
    this.trajectory_logger = new NSILTrajectoryLogger();
    this.failure_detector = new NSILFailureDetector();
    this.refiner = new NSILRefiner([]);
  }
  
  /**
   * GLOBAL PROBLEM SOLVING FLOW
   * Process any question/problem from anywhere in the world
   */
  public async solve_global_problem(
    raw_input: string | any,
    origin_country: string,
    origin_language: string = 'en',
    person_context: any = {}
  ): Promise<GlobalProblemAnalysis> {
    console.log('\n========== GLOBAL NSIL ORCHESTRATOR ==========');
    console.log(`Problem from: ${origin_country}`);
    console.log(`Language: ${origin_language}`);
    console.log('============================================\n');
    
    // STEP 1: UNIVERSAL INPUT PROCESSING
    console.log('STEP 1: UNIVERSAL INPUT PROCESSING');
    console.log('Processing question/problem from anywhere...\n');
    
    const input = this.input_processor.process_input(
      raw_input,
      origin_country,
      origin_language,
      person_context
    );
    
    console.log(`✓ Input processed: ${input.metadata.domain} / ${input.metadata.problem_type}`);
    console.log(`✓ Intent extracted: "${input.extracted_intent.core_question}"`);
    console.log(`✓ Entities identified: ${input.entities_identified.locations.join(', ')}`);
    console.log(`✓ Urgency: ${input.metadata.urgency}\n`);
    
    // STEP 2: SELF-AUDIT
    console.log('STEP 2: SELF-AUDIT ENGINE');
    console.log('Analyzing: What do we know? What are we missing? Where are we weak?\n');
    
    const audit = this.self_audit.audit(input);
    
    console.log(`Knowledge inventory coverage: ${audit.knowledge_inventory.coverage_percent}%`);
    console.log(`Have country data: ${audit.knowledge_inventory.have_country_data}`);
    console.log(`Have sector data: ${audit.knowledge_inventory.have_sector_data}`);
    console.log(`Historical cases available: ${audit.knowledge_inventory.historical_cases_available}`);
    console.log(`Confidence in answering: ${audit.confidence_in_answering}% (${audit.risk_level})`);
    console.log(`Risk level: ${audit.confidence_text}\n`);
    
    if (audit.action_needed.actions_required.length > 0) {
      console.log('Actions needed before answering:');
      for (const action of audit.recommended_actions) {
        console.log(`  • ${action}`);
      }
      console.log('');
    }
    
    // STEP 3: HISTORICAL ANALYSIS
    console.log('STEP 3: HISTORICAL DEVELOPMENT ANALYSIS');
    console.log('Finding how similar problems were solved before...\n');
    
    const historical_parallels = this.historical_analyzer.find_historical_parallels(
      input.extracted_intent.core_question,
      input.metadata.origin_country,
      input.extracted_intent.constraints
    );
    
    if (historical_parallels.length > 0) {
      console.log(`Found ${historical_parallels.length} historical parallels:\n`);
      for (let i = 0; i < Math.min(3, historical_parallels.length); i++) {
        const parallel = historical_parallels[i];
        console.log(`  ${i+1}. ${parallel.historical_solution.what_was_done}`);
        console.log(`     Location: ${parallel.source_entity} (${parallel.source_year})`);
        console.log(`     Similarity: ${parallel.similarity.score}%`);
        console.log(`     Applicability: ${parallel.applicability_to_target.score}%`);
        console.log(`     Outcome: ${parallel.outcome.result}`);
        console.log('');
      }
    } else {
      console.log('No direct historical parallels found (novel problem).\n');
    }
    
    // STEP 4: FAILURE PATTERN RECOGNITION
    console.log('STEP 4: FAILURE PATTERN RECOGNITION');
    console.log('Identifying where humans typically fail with this type of problem...\n');
    
    const applicable_patterns = this.failure_recognizer.identify_applicable_patterns(
      input.metadata.problem_type,
      input.metadata.domain,
      input.metadata.origin_country,
      input.extracted_intent.constraints
    );
    
    if (applicable_patterns.length > 0) {
      console.log(`Identified ${applicable_patterns.length} applicable failure patterns:\n`);
      for (let i = 0; i < Math.min(3, applicable_patterns.length); i++) {
        const pattern = applicable_patterns[i];
        console.log(`  ${i+1}. ${pattern.pattern_name}`);
        console.log(`     Frequency: ${pattern.frequency_across_projects} documented cases`);
        console.log(`     Typical cost: ${pattern.typical_symptoms.typical_cost_overrun_percent}% cost overrun`);
        console.log(`     Typical delay: ${pattern.typical_symptoms.typical_delay_months} months`);
        console.log(`     Why it happens: ${pattern.why_humans_fail.substring(0, 100)}...`);
        console.log(`     Prevention: ${pattern.prevention_strategies[0].strategy_name} (${pattern.prevention_strategies[0].effectiveness_percent}% effective)`);
        console.log('');
      }
    } else {
      console.log('No applicable failure patterns detected.\n');
    }
    
    // STEP 5: GENERATE RECOMMENDATION
    console.log('STEP 5: ADAPTIVE RECOMMENDATION GENERATION');
    console.log('Combining historical precedents + failure avoidance + novel approaches...\n');
    
    const recommendation = this.generate_recommendation(
      input,
      audit,
      historical_parallels,
      applicable_patterns
    ).recommendation;
    
    console.log('RECOMMENDATION:');
    console.log(`Approach: ${recommendation.approach}`);
    console.log(`Timeline: ${recommendation.timeline_months} months`);
    console.log(`Budget: ${recommendation.budget_required}`);
    console.log(`Confidence: ${recommendation.confidence}%`);
    console.log(`Expected outcome: ${recommendation.expected_outcome}`);
    console.log('\nImplementation phases:');
    for (const phase of recommendation.implementation_phases) {
      console.log(`  Phase ${phase.phase}: ${phase.description}`);
      console.log(`    Duration: ${phase.duration}, Budget: ${phase.budget}`);
    }
    console.log('');
    
    // STEP 6: TRAJECTORY CAPTURE (for autonomous learning)
    console.log('STEP 6: TRAJECTORY CAPTURE FOR AUTONOMOUS LEARNING');
    console.log('Logging this analysis for learning when outcome is known...\n');
    
    const session_id = this.trajectory_logger.start_session({
      project_type: input.metadata.problem_type,
      sector: input.metadata.domain,
      region: input.metadata.origin_country,
      region_id: input.metadata.origin_country,
      client_id: input.id,
      parameters: {
        question: input.extracted_intent.core_question,
        language: input.metadata.origin_language,
        person_context,
      },
    });
    
    this.trajectory_logger.log_recommendation({
      primary: recommendation.approach,
      secondary: recommendation.implementation_phases.map(p => p.description),
      confidence: recommendation.confidence / 100,
      rationale: recommendation.why_this_approach,
      audit_trail: [
        `self-audit:${audit.audit_id}`,
        `historical-parallels:${historical_parallels.length}`,
        `failure-patterns:${applicable_patterns.length}`,
      ],
    });
    this.trajectory_logger.end_session(0);
    
    console.log(`Session logged: ${session_id}`);
    console.log('When outcome known (6-12 months): System will detect if recommendation was accurate');
    console.log('If outcome ≠ predicted: NSILFailureDetector analyzes gap');
    console.log('NSILRefiner autonomously improves formulas for next similar question\n');
    
    // Compile final analysis
    const analysis: GlobalProblemAnalysis = {
      input_id: input.id,
      trajectory_session_id: session_id,
      audit_id: audit.audit_id,
      timestamp: new Date().toISOString(),
      
      input,
      audit,
      
      historical_parallels,
      applicable_failure_patterns: applicable_patterns,
      
      analysis: {
        problem_summary: input.extracted_intent.core_question,
        root_causes: this.extract_root_causes(applicable_patterns, historical_parallels),
        historical_context: historical_parallels.length > 0 
          ? `Similar to: ${historical_parallels[0].historical_solution.what_was_done}` 
          : 'Novel problem with limited historical precedent',
        failure_pattern_risks: applicable_patterns.map(p => p.pattern_name),
        success_probability: this.calculate_success_probability(audit, applicable_patterns),
      },
      
      recommendation,
      historical_precedent: historical_parallels.length > 0 
        ? {
          case_name: historical_parallels[0].historical_solution.what_was_done,
          location: historical_parallels[0].source_entity,
          year: historical_parallels[0].source_year,
          outcome: historical_parallels[0].outcome.result,
          applicability_percent: historical_parallels[0].applicability_to_target.score,
        }
        : {
          case_name: 'No direct precedent',
          location: 'Novel approach required',
          year: 0,
          outcome: 'Unknown',
          applicability_percent: 0,
        },
    };
    
    this.completed_analyses.push(analysis);
    
    console.log('========== ANALYSIS COMPLETE ==========\n');
    
    return analysis;
  }
  
  /**
   * Generate adaptive recommendation
   */
  private generate_recommendation(
    input: UniversalInput,
    audit: SelfAuditResult,
    historical_parallels: HistoricalParallel[],
    applicable_patterns: HumanFailurePattern[]
  ): GlobalProblemAnalysis {
    // This is simplified; in production, would be more sophisticated
    
    return {
      input_id: input.id,
      trajectory_session_id: undefined,
      audit_id: audit.audit_id,
      timestamp: new Date().toISOString(),
      input,
      audit,
      historical_parallels,
      applicable_failure_patterns: applicable_patterns,
      
      analysis: {
        problem_summary: input.extracted_intent.core_question,
        root_causes: [],
        historical_context: '',
        failure_pattern_risks: [],
        success_probability: 65,
      },
      
      recommendation: {
        approach: this.synthesize_approach(historical_parallels, applicable_patterns),
        why_this_approach: `Combines ${historical_parallels.length} historical precedents with ${applicable_patterns.length} failure pattern mitigations`,
        
        implementation_phases: [
          {
            phase: 1,
            description: 'Assessment & Planning',
            duration: '1-2 months',
            budget: '$50K-100K',
            success_metrics: ['Stakeholder alignment', 'Resource allocation approved'],
          },
          {
            phase: 2,
            description: 'Pilot implementation',
            duration: '3-6 months',
            budget: '$200K-500K',
            success_metrics: ['Target 1 achieved', 'Adjustments made'],
          },
          {
            phase: 3,
            description: 'Scale & Optimize',
            duration: '6-12 months',
            budget: '$500K-2M',
            success_metrics: ['Full rollout', 'Sustained metrics'],
          },
        ],
        
        expected_outcome: `${audit.confidence_in_answering}% confidence in achieving objectives`,
        timeline_months: 12,
        budget_required: '$750K-2.6M',
        confidence: audit.confidence_in_answering,
        
        risks_and_mitigations: applicable_patterns.map(pattern => ({
          risk: pattern.pattern_name,
          mitigation: pattern.prevention_strategies[0]?.strategy_name || 'Risk monitoring',
        })),
      },
      
      historical_precedent: historical_parallels.length > 0 
        ? {
          case_name: historical_parallels[0].historical_solution.what_was_done,
          location: historical_parallels[0].source_entity,
          year: historical_parallels[0].source_year,
          outcome: historical_parallels[0].outcome.result,
          applicability_percent: historical_parallels[0].applicability_to_target.score,
        }
        : {
          case_name: 'No direct precedent',
          location: 'Novel approach required',
          year: 0,
          outcome: 'Unknown',
          applicability_percent: 0,
        },
    };
  }
  
  /**
   * Synthesize approach from historical and failure pattern data
   */
  private synthesize_approach(
    historical: HistoricalParallel[],
    patterns: HumanFailurePattern[]
  ): string {
    if (historical.length === 0) {
      return 'Novel approach combining best practices from multiple domains';
    }
    
    const primary = historical[0].historical_solution.what_was_done;
    const mitigations = patterns.slice(0, 2).map(p => p.prevention_strategies[0].strategy_name).join(' + ');
    
    return `${primary}, enhanced with: ${mitigations}`;
  }
  
  /**
   * Extract root causes from failure patterns and history
   */
  private extract_root_causes(patterns: HumanFailurePattern[], history: HistoricalParallel[]): string[] {
    const causes: string[] = [];
    
    for (const pattern of patterns.slice(0, 3)) {
      causes.push(pattern.pattern_name);
    }
    
    return causes;
  }
  
  /**
   * Calculate success probability based on audit and patterns
   */
  private calculate_success_probability(
    audit: SelfAuditResult,
    patterns: HumanFailurePattern[]
  ): number {
    let prob = audit.confidence_in_answering;
    
    // Reduce for each failure pattern (assume 10% risk each)
    for (const pattern of patterns.slice(0, 3)) {
      const mitigation_effectiveness = pattern.prevention_strategies[0]?.effectiveness_percent || 70;
      prob *= (1 - (0.10 * (100 - mitigation_effectiveness) / 100));
    }
    
    return Math.round(prob);
  }
  
  /**
   * Record ground truth outcome and trigger learning
   */
  public async learn_from_outcome(
    analysis_id: string,
    actual_outcome: string,
    metrics: { [key: string]: any }
  ): Promise<void> {
    const analysis = this.completed_analyses.find(a => a.input_id === analysis_id);
    if (!analysis) return;
    
    // Record ground truth
    this.trajectory_logger.record_ground_truth(analysis.trajectory_session_id || analysis.input_id, {
      actual_outcome,
      success: metrics.success ?? metrics.failure_pattern === undefined,
      quantitative_result: typeof metrics.score === 'number' ? metrics.score : undefined,
      feedback: JSON.stringify(metrics),
    });
    
    // Detect failures
    const trajectories = this.trajectory_logger.get_recent_trajectories(30 * 24 * 60 * 60 * 1000);
    const failures = this.failure_detector.detect_all_failures(trajectories);
    
    // Refine if failures detected
    if (failures.length > 0) {
      this.refiner.evolve(trajectories.length, trajectories);
      console.log(`System learned from outcome. Detected ${failures.length} improvement opportunities.`);
    }
  }
  
  /**
   * Get all completed analyses
   */
  public get_completed_analyses(): GlobalProblemAnalysis[] {
    return this.completed_analyses;
  }
  
  /**
   * Get analyses by country
   */
  public get_analyses_by_country(country: string): GlobalProblemAnalysis[] {
    return this.completed_analyses.filter(a => 
      a.input.metadata.origin_country.toLowerCase() === country.toLowerCase()
    );
  }
  
  /**
   * Get analyses by domain
   */
  public get_analyses_by_domain(domain: string): GlobalProblemAnalysis[] {
    return this.completed_analyses.filter(a => 
      a.input.metadata.domain.toLowerCase() === domain.toLowerCase()
    );
  }
  
  /**
   * Get system health metrics
   */
  public get_system_metrics(): {
    total_analyses: number;
    avg_confidence: number;
    countries_covered: number;
    domains_covered: number;
    avg_patterns_identified: number;
  } {
    const avg_confidence = this.completed_analyses.length > 0
      ? Math.round(this.completed_analyses.reduce((sum, a) => sum + a.recommendation.confidence, 0) / this.completed_analyses.length)
      : 0;
    
    const countries = new Set(this.completed_analyses.map(a => a.input.metadata.origin_country));
    const domains = new Set(this.completed_analyses.map(a => a.input.metadata.domain));
    
    const avg_patterns = this.completed_analyses.length > 0
      ? Math.round(this.completed_analyses.reduce((sum, a) => sum + a.applicable_failure_patterns.length, 0) / this.completed_analyses.length)
      : 0;
    
    return {
      total_analyses: this.completed_analyses.length,
      avg_confidence,
      countries_covered: countries.size,
      domains_covered: domains.size,
      avg_patterns_identified: avg_patterns,
    };
  }
}

export default GlobalNSILOrchestrator;
