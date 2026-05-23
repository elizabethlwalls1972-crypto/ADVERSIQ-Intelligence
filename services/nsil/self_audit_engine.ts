/**
 * SelfAuditEngine - Analyze system knowledge and identify gaps before answering
 * Before processing ANY question, system asks: What do I know? What am I missing? Where am I weak?
 */

import fs from 'fs';
import path from 'path';
import { UniversalInput } from './universal_input_processor';

export interface KnowledgeInventory {
  have_historical_data: boolean;
  have_country_data: boolean;
  have_sector_data: boolean;
  have_similar_problems_solved: boolean;
  coverage_percent: number; // 0-100%
  
  countries_covered: string[];
  sectors_covered: string[];
  problem_types_covered: string[];
  failure_patterns_documented: number;
  historical_cases_available: number;
  real_time_data_feeds: number;
}

export interface KnowledgeGaps {
  missing_data_types: string[];
  missing_countries: string[];
  missing_sectors: string[];
  missing_historical_parallels: number;
  missing_language_support: string[];
  data_freshness_issue: boolean;
  real_time_data_unavailable: boolean;
}

export interface WeaknessDetection {
  formula_blindness: string[]; // Formulas not yet created for this problem type
  human_failure_patterns: string[]; // Known failure modes that apply
  method_gaps: string[]; // Approaches we haven't tried yet
  blind_spots: string[]; // Things system might not see
  edge_cases: string[]; // Unusual combinations of constraints
}

export interface ActionNeeded {
  fetch_historical_data: boolean;
  create_new_formula: boolean;
  search_global_database: boolean;
  analyze_human_failures: boolean;
  generate_novel_method: boolean;
  request_additional_data: boolean;
  actions_required: string[];
}

export interface SelfAuditResult {
  audit_id: string;
  input_id: string;
  timestamp: string;
  
  knowledge_inventory: KnowledgeInventory;
  knowledge_gaps: KnowledgeGaps;
  weakness_detection: WeaknessDetection;
  action_needed: ActionNeeded;
  
  confidence_in_answering: number; // 0-100%
  risk_level: 'low' | 'medium' | 'high'; // Risk of bad answer due to missing knowledge
  confidence_text: string; // Human-readable confidence explanation
  
  recommended_actions: string[];
  estimated_data_gathering_time_seconds: number;
}

export class SelfAuditEngine {
  private data_dir: string;
  private audit_results: SelfAuditResult[] = [];
  
  // Mock knowledge base (in production, these come from actual data stores)
  private countries_with_data: string[] = [
    'philippines', 'brazil', 'india', 'australia', 'china', 'usa', 'germany', 'japan',
    'mexico', 'indonesia', 'vietnam', 'thailand', 'argentina', 'south korea', 'canada',
    'france', 'uk', 'italy', 'spain', 'netherlands'
  ];
  
  private sectors_with_data: string[] = [
    'manufacturing', 'agriculture', 'technology', 'tourism', 'renewable energy',
    'trade logistics', 'healthcare', 'education', 'finance', 'real estate'
  ];
  
  private documented_failure_patterns = [
    'infrastructure_mismatch',
    'policy_friction',
    'market_invisibility',
    'supply_chain_isolation',
    'ecosystem_fragmentation',
    'skills_mismatch',
    'regulatory_arbitrage_failure',
    'optimism_bias_in_planning',
    'cost_overrun',
    'timeline_delay',
    'execution_friction',
    'stakeholder_misalignment',
    'insufficient_groundtruth_tracking',
    'formula_blindness_in_domain',
    'regional_pattern_transfer_failure'
  ];
  
  private problem_types_solved = [
    'how_to', 'why', 'what_if', 'fix_this', 'improve_this',
    'diagnose', 'forecast', 'comparison'
  ];
  
  private historical_cases_count = 1200; // Growing database
  private real_time_feeds = 15; // World Bank, IMF, UN, industry reports, etc
  
  constructor() {
    this.data_dir = path.join(process.cwd(), 'data', 'audit_results');
    this.ensure_data_dir();
  }
  
  private ensure_data_dir(): void {
    if (!fs.existsSync(this.data_dir)) {
      fs.mkdirSync(this.data_dir, { recursive: true });
    }
  }
  
  /**
   * Run self-audit before answering any question
   */
  public audit(input: UniversalInput): SelfAuditResult {
    const audit_id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Assess knowledge inventory
    const knowledge_inventory = this.assess_knowledge_inventory(input);
    
    // Identify knowledge gaps
    const knowledge_gaps = this.identify_gaps(input, knowledge_inventory);
    
    // Detect weaknesses
    const weakness_detection = this.detect_weaknesses(input, knowledge_inventory);
    
    // Determine actions needed
    const action_needed = this.determine_actions(input, knowledge_gaps, weakness_detection);
    
    // Calculate confidence
    const confidence_result = this.calculate_confidence(knowledge_inventory, knowledge_gaps, weakness_detection, input);
    
    const result: SelfAuditResult = {
      audit_id,
      input_id: input.id,
      timestamp: new Date().toISOString(),
      
      knowledge_inventory,
      knowledge_gaps,
      weakness_detection,
      action_needed,
      
      confidence_in_answering: confidence_result.confidence,
      risk_level: confidence_result.risk_level,
      confidence_text: confidence_result.confidence_text,
      
      recommended_actions: this.generate_recommended_actions(knowledge_gaps, weakness_detection, action_needed),
      estimated_data_gathering_time_seconds: this.estimate_data_gathering_time(action_needed),
    };
    
    // Store audit result
    this.store_audit_result(result);
    this.audit_results.push(result);
    
    return result;
  }
  
  /**
   * Assess what knowledge the system has that applies to this question
   */
  private assess_knowledge_inventory(input: UniversalInput): KnowledgeInventory {
    // Check if we have data for requested countries
    const requested_countries = input.entities_identified.locations.filter(loc => 
      loc.length > 3 // Filter out noise
    );
    const countries_we_have = requested_countries.filter(c => 
      this.countries_with_data.some(cd => cd.toLowerCase().includes(c.toLowerCase()))
    );
    const have_country_data = countries_we_have.length > 0 || requested_countries.length === 0;
    
    // Check if we have sector data
    const requested_sectors = input.entities_identified.sectors;
    const sectors_we_have = requested_sectors.filter(s => 
      this.sectors_with_data.some(sd => sd.toLowerCase().includes(s.toLowerCase()))
    );
    const have_sector_data = sectors_we_have.length > 0 || requested_sectors.length === 0;
    
    // Check if problem type is in our experience
    const problem_type_solved = this.problem_types_solved.includes(input.metadata.problem_type);
    const have_historical_data = this.historical_cases_count > 0;
    
    // Calculate coverage (simplified)
    let coverage_percent = 50; // Base coverage
    if (have_country_data) coverage_percent += 20;
    if (have_sector_data) coverage_percent += 15;
    if (problem_type_solved) coverage_percent += 10;
    if (have_historical_data && this.historical_cases_count > 500) coverage_percent += 5;
    
    return {
      have_historical_data,
      have_country_data,
      have_sector_data,
      have_similar_problems_solved: problem_type_solved,
      coverage_percent: Math.min(100, coverage_percent),
      
      countries_covered: this.countries_with_data,
      sectors_covered: this.sectors_with_data,
      problem_types_covered: this.problem_types_solved,
      failure_patterns_documented: this.documented_failure_patterns.length,
      historical_cases_available: this.historical_cases_count,
      real_time_data_feeds: this.real_time_feeds,
    };
  }
  
  /**
   * Identify gaps in our knowledge for this specific question
   */
  private identify_gaps(input: UniversalInput, inventory: KnowledgeInventory): KnowledgeGaps {
    const gaps: KnowledgeGaps = {
      missing_data_types: [],
      missing_countries: [],
      missing_sectors: [],
      missing_historical_parallels: 0,
      missing_language_support: [],
      data_freshness_issue: false,
      real_time_data_unavailable: false,
    };
    
    // Identify missing countries
    for (const location of input.entities_identified.locations) {
      if (!inventory.countries_covered.some(c => c.toLowerCase().includes(location.toLowerCase()))) {
        gaps.missing_countries.push(location);
      }
    }
    
    // Identify missing sectors
    for (const sector of input.entities_identified.sectors) {
      if (!inventory.sectors_covered.some(s => s.toLowerCase().includes(sector.toLowerCase()))) {
        gaps.missing_sectors.push(sector);
      }
    }
    
    // Language support gaps
    if (input.metadata.origin_language !== 'en' && input.metadata.origin_language !== 'es') {
      gaps.missing_language_support.push(input.metadata.origin_language);
    }
    
    // Data freshness risk from urgency signal.
    if (input.metadata.urgency === 'immediate') {
      gaps.data_freshness_issue = true; // May not have latest real-time data
    }
    
    // Historical parallels (estimate)
    if (gaps.missing_countries.length > 0 || gaps.missing_sectors.length > 0) {
      gaps.missing_historical_parallels = Math.max(gaps.missing_countries.length, gaps.missing_sectors.length) * 5;
    }
    
    return gaps;
  }
  
  /**
   * Detect system weaknesses that might affect this answer
   */
  private detect_weaknesses(input: UniversalInput, inventory: KnowledgeInventory): WeaknessDetection {
    const weaknesses: WeaknessDetection = {
      formula_blindness: [],
      human_failure_patterns: [],
      method_gaps: [],
      blind_spots: [],
      edge_cases: [],
    };
    
    // Detect formula blindness (don't have formulas for this combination)
    const domain = input.metadata.domain;
    const problem_type = input.metadata.problem_type;
    const sector = input.entities_identified.sectors[0];
    
    // Heuristic: certain domain+problem combinations may not have formulas
    if (domain === 'general' && problem_type === 'forecast') {
      weaknesses.formula_blindness.push('no_time_series_model');
    }
    if (sector === 'technology' && problem_type === 'why') {
      weaknesses.formula_blindness.push('limited_tech_sector_analysis');
    }
    
    // Detect applicable failure patterns
    if (problem_type === 'fix_this' || problem_type === 'diagnose') {
      // Problems that need fixing likely involve failure patterns
      weaknesses.human_failure_patterns = this.documented_failure_patterns.slice(0, 5); // Most common
    }
    
    // Detect method gaps
    if (input.context_signals.asks_for_novelty) {
      weaknesses.method_gaps.push('limited_novel_approaches');
      weaknesses.method_gaps.push('may_default_to_historical_solutions');
    }
    
    // Detect blind spots
    if (input.entities_identified.locations.length === 0) {
      weaknesses.blind_spots.push('no_geographic_context');
    }
    if (input.entities_identified.organizations.length === 0) {
      weaknesses.blind_spots.push('no_organizational_context');
    }
    
    // Detect edge cases
    if (input.metadata.urgency === 'immediate' && inventory.coverage_percent < 60) {
      weaknesses.edge_cases.push('urgent_question_with_low_knowledge_coverage');
    }
    if (input.extracted_intent.constraints.length > 3) {
      weaknesses.edge_cases.push('highly_constrained_problem');
    }
    
    return weaknesses;
  }
  
  /**
   * Determine what actions system must take before answering
   */
  private determine_actions(
    input: UniversalInput,
    gaps: KnowledgeGaps,
    weaknesses: WeaknessDetection
  ): ActionNeeded {
    const actions: ActionNeeded = {
      fetch_historical_data: gaps.missing_historical_parallels > 0,
      create_new_formula: weaknesses.formula_blindness.length > 0,
      search_global_database: gaps.missing_countries.length > 0 || gaps.missing_sectors.length > 0,
      analyze_human_failures: weaknesses.human_failure_patterns.length > 0,
      generate_novel_method: weaknesses.method_gaps.length > 0,
      request_additional_data: input.context_signals.has_data_attached === false && input.metadata.urgency === 'immediate',
      actions_required: [],
    };
    
    if (actions.fetch_historical_data) {
      actions.actions_required.push(`Fetch historical development data for ${gaps.missing_countries.length} countries`);
    }
    if (actions.create_new_formula) {
      actions.actions_required.push(`Create formulas for: ${weaknesses.formula_blindness.join(', ')}`);
    }
    if (actions.search_global_database) {
      actions.actions_required.push(`Search global database for similar problems`);
    }
    if (actions.analyze_human_failures) {
      actions.actions_required.push(`Analyze ${weaknesses.human_failure_patterns.length} applicable failure patterns`);
    }
    if (actions.generate_novel_method) {
      actions.actions_required.push(`Generate novel methodologies not yet tried`);
    }
    
    return actions;
  }
  
  /**
   * Calculate confidence level in being able to answer this question well
   */
  private calculate_confidence(
    inventory: KnowledgeInventory,
    gaps: KnowledgeGaps,
    weaknesses: WeaknessDetection,
    input: UniversalInput
  ): { confidence: number; risk_level: 'low' | 'medium' | 'high'; confidence_text: string } {
    let confidence = 100;
    
    // Reduce confidence for missing data
    confidence -= gaps.missing_countries.length * 10;
    confidence -= gaps.missing_sectors.length * 5;
    confidence -= gaps.missing_historical_parallels * 2;
    
    // Reduce confidence for detected weaknesses
    confidence -= weaknesses.formula_blindness.length * 15;
    confidence -= weaknesses.method_gaps.length * 10;
    confidence -= weaknesses.blind_spots.length * 5;
    
    // Adjust for urgency (less time to gather info = lower confidence)
    if (input.metadata.urgency === 'immediate') {
      confidence -= 20;
    }
    
    // Adjust for problem complexity
    if (input.extracted_intent.constraints.length > 5) {
      confidence -= 15;
    }
    
    // Base on inventory coverage
    confidence = Math.max(0, Math.min(100, (confidence * inventory.coverage_percent) / 100));
    
    let risk_level: 'low' | 'medium' | 'high' = 'low';
    let confidence_text = '';
    
    if (confidence >= 75) {
      risk_level = 'low';
      confidence_text = `HIGH CONFIDENCE: We have strong historical data, applicable formulas, and relevant case studies. Recommendation should be reliable.`;
    } else if (confidence >= 50) {
      risk_level = 'medium';
      confidence_text = `MEDIUM CONFIDENCE: We have partial data and some applicable methods. Recommendation may need validation with real-time data.`;
    } else {
      risk_level = 'high';
      confidence_text = `LOW CONFIDENCE: Missing critical data or formulas for this problem type. Recommendation should be treated as initial hypothesis pending validation.`;
    }
    
    return {
      confidence: Math.round(confidence),
      risk_level,
      confidence_text,
    };
  }
  
  /**
   * Generate recommended actions the system should take
   */
  private generate_recommended_actions(
    gaps: KnowledgeGaps,
    weaknesses: WeaknessDetection,
    actions: ActionNeeded
  ): string[] {
    const recommendations: string[] = [];
    
    if (gaps.missing_countries.length > 0) {
      recommendations.push(`1. FETCH: Historical development profiles for ${gaps.missing_countries.join(', ')}`);
    }
    
    if (gaps.missing_sectors.length > 0) {
      recommendations.push(`2. ANALYZE: Sector-specific patterns for ${gaps.missing_sectors.join(', ')}`);
    }
    
    if (weaknesses.formula_blindness.length > 0) {
      recommendations.push(`3. CREATE: New formulas for ${weaknesses.formula_blindness.join(', ')}`);
    }
    
    if (weaknesses.human_failure_patterns.length > 0) {
      recommendations.push(`4. REVIEW: ${weaknesses.human_failure_patterns.length} documented failure patterns that apply`);
    }
    
    if (weaknesses.method_gaps.length > 0) {
      recommendations.push(`5. GENERATE: Novel methods combining historical approaches with new techniques`);
    }
    
    if (gaps.missing_language_support.length > 0) {
      recommendations.push(`6. TRANSLATE: Original context from ${gaps.missing_language_support.join(', ')}`);
    }
    
    return recommendations;
  }
  
  /**
   * Estimate how long data gathering will take
   */
  private estimate_data_gathering_time(actions: ActionNeeded): number {
    let time = 0;
    
    if (actions.fetch_historical_data) time += 5; // seconds
    if (actions.search_global_database) time += 10;
    if (actions.create_new_formula) time += 30;
    if (actions.analyze_human_failures) time += 5;
    if (actions.generate_novel_method) time += 15;
    if (actions.request_additional_data) time += 30;
    
    return time;
  }
  
  /**
   * Store audit result
   */
  private store_audit_result(result: SelfAuditResult): void {
    const filename = path.join(this.data_dir, `${result.audit_id}.json`);
    fs.writeFileSync(filename, JSON.stringify(result, null, 2));
  }
  
  /**
   * Get all audit results
   */
  public get_all_audits(): SelfAuditResult[] {
    return this.audit_results;
  }
  
  /**
   * Get audit by ID
   */
  public get_audit(audit_id: string): SelfAuditResult | null {
    return this.audit_results.find(a => a.audit_id === audit_id) || null;
  }
  
  /**
   * Get audits by risk level
   */
  public get_audits_by_risk(risk_level: 'low' | 'medium' | 'high'): SelfAuditResult[] {
    return this.audit_results.filter(a => a.risk_level === risk_level);
  }
  
  /**
   * Get audit summary
   */
  public get_audit_summary(): {
    total_audits: number;
    avg_confidence: number;
    risk_distribution: { low: number; medium: number; high: number };
  } {
    const avg_confidence = this.audit_results.length > 0
      ? Math.round(this.audit_results.reduce((sum, a) => sum + a.confidence_in_answering, 0) / this.audit_results.length)
      : 0;
    
    const risk_dist = { low: 0, medium: 0, high: 0 };
    for (const audit of this.audit_results) {
      risk_dist[audit.risk_level]++;
    }
    
    return {
      total_audits: this.audit_results.length,
      avg_confidence,
      risk_distribution: risk_dist,
    };
  }
}

export default SelfAuditEngine;
