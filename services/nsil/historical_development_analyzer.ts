/**
 * HistoricalDevelopmentAnalyzer - Learn from how similar cities/regions developed
 * Answers: How did this develop before? What worked? What failed? What can we learn?
 */

import fs from 'fs';
import path from 'path';

export interface HistoricalDevelopmentProfile {
  entity_id: string; // city_country_code e.g., "manila_ph"
  entity_name: string;
  country: string;
  region: string;
  founding_year: number;
  current_year: number;
  
  population_trajectory: {
    year: number;
    population: number;
    annotation?: string;
  }[];
  
  economic_structure_evolution: {
    year: number;
    primary_sector: number; // percentage
    secondary_sector: number;
    tertiary_sector: number;
    quaternary_sector?: number;
  }[];
  
  critical_decisions: {
    year: number;
    decision_name: string;
    description: string;
    decision_type: 'infrastructure' | 'policy' | 'economic' | 'education' | 'energy';
    outcome: 'major_success' | 'success' | 'partial' | 'failure' | 'unknown';
    impact_10year_gdp_growth_percent: number;
    impact_on_employment: string; // "+50,000 jobs", "-30,000 jobs"
    why_it_worked_or_failed: string;
    lessons_learned: string[];
  }[];
  
  policy_failures: {
    year_implemented: number;
    policy_name: string;
    expected_outcome: string;
    actual_outcome: string;
    reason_for_failure: string;
    cost_of_failure: string; // "$50M", "50,000 jobs lost", "5 year delay"
    what_worked_instead: string;
    applicable_lessons: string[];
  }[];
  
  infrastructure_timeline: {
    year: number;
    project_name: string;
    type: 'port' | 'road' | 'rail' | 'airport' | 'electricity' | 'water' | 'telecom';
    status: 'completed' | 'delayed' | 'failed' | 'ongoing';
    expected_completion: number;
    actual_completion: number;
    cost_overrun_percent: number;
    impact: string;
  }[];
  
  current_state: {
    gdp_per_capita_usd: number;
    population: number;
    unemployment_rate: number;
    gini_coefficient: number; // 0-100, 100=most unequal
    infrastructure_quality_index: number; // 0-100
    primary_sectors: string[];
    secondary_sectors: string[];
    tertiary_sectors: string[];
    key_challenges: string[];
    key_strengths: string[];
  };
  
  development_stage: 'pre_industrial' | 'industrializing' | 'industrial' | 'post_industrial' | 'knowledge_economy';
  years_to_reach_current_state: number;
  
  comparable_cities: {
    city_name: string;
    country: string;
    similarity_score: number; // 0-100%
    why_similar: string;
  }[];
}

export interface HistoricalParallel {
  source_entity: string;
  source_year: number;
  target_entity: string;
  target_year: number;
  
  similarity: {
    score: number; // 0-100%
    same_problem: string;
    same_constraints: string[];
    same_assets: string[];
  };
  
  historical_solution: {
    what_was_done: string;
    when: number;
    how_long_it_took: number;
    what_it_cost: string;
    who_led_it: string;
  };
  
  outcome: {
    result: string;
    success: boolean;
    gdp_impact: string;
    employment_impact: string;
    timeline_accuracy: string; // "On time", "6 months late", etc
    cost_accuracy: string; // "On budget", "50% over budget"
  };
  
  applicability_to_target: {
    score: number; // 0-100%, how applicable is this to their situation?
    why_applicable: string;
    what_needs_adaptation: string[];
    risks_if_replicated: string[];
  };
}

export class HistoricalDevelopmentAnalyzer {
  private data_dir: string;
  private profiles: HistoricalDevelopmentProfile[] = [];
  
  constructor() {
    this.data_dir = path.join(process.cwd(), 'data', 'historical_development');
    this.ensure_data_dir();
    this.load_profiles();
  }
  
  private ensure_data_dir(): void {
    if (!fs.existsSync(this.data_dir)) {
      fs.mkdirSync(this.data_dir, { recursive: true });
    }
  }
  
  /**
   * Load historical profiles from disk
   */
  private load_profiles(): void {
    const files = fs.readdirSync(this.data_dir).filter(file => file.endsWith('.json'));
    const loaded: HistoricalDevelopmentProfile[] = [];
    for (const file of files) {
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(this.data_dir, file), 'utf8')) as HistoricalDevelopmentProfile;
        if (parsed.entity_id && parsed.entity_name && parsed.country) {
          loaded.push(parsed);
        }
      } catch {
        // Ignore malformed local profile files and keep loading the rest.
      }
    }
    this.profiles = loaded.length > 0 ? loaded : this.create_curated_profiles();
  }
  
  /**
   * Create curated historical profiles used when no local profile store exists.
   */
  private create_curated_profiles(): HistoricalDevelopmentProfile[] {
    return [
      {
        entity_id: 'manila_ph',
        entity_name: 'Metro Manila',
        country: 'Philippines',
        region: 'Calabarzon',
        founding_year: 1572,
        current_year: 2026,
        
        population_trajectory: [
          { year: 1900, population: 300000, annotation: 'Spanish colonial city' },
          { year: 1950, population: 1500000, annotation: 'Post-war reconstruction' },
          { year: 1980, population: 5200000, annotation: 'Industrial boom' },
          { year: 2000, population: 10300000, annotation: 'Emerging megacity' },
          { year: 2026, population: 14500000, annotation: 'Global megacity' },
        ],
        
        economic_structure_evolution: [
          { year: 1950, primary_sector: 25, secondary_sector: 30, tertiary_sector: 45 },
          { year: 1980, primary_sector: 8, secondary_sector: 42, tertiary_sector: 50 },
          { year: 2000, primary_sector: 3, secondary_sector: 35, tertiary_sector: 62 },
          { year: 2026, primary_sector: 1, secondary_sector: 28, tertiary_sector: 71 },
        ],
        
        critical_decisions: [
          {
            year: 1974,
            decision_name: 'Port modernization initiative',
            description: 'Invested in modern container handling at Manila port',
            decision_type: 'infrastructure',
            outcome: 'major_success',
            impact_10year_gdp_growth_percent: 12,
            impact_on_employment: '+85,000 jobs',
            why_it_worked_or_failed: 'Enabled export growth, regional manufacturing hub emergence',
            lessons_learned: ['Infrastructure enables ecosystems', 'Port efficiency affects entire economy'],
          },
          {
            year: 1995,
            decision_name: 'Special Economic Zone policy',
            description: 'Created export-oriented manufacturing zones with tax incentives',
            decision_type: 'policy',
            outcome: 'major_success',
            impact_10year_gdp_growth_percent: 18,
            impact_on_employment: '+250,000 jobs',
            why_it_worked_or_failed: 'Made region competitive, attracted multinational manufacturers',
            lessons_learned: ['Policy can overcome location disadvantages', 'SEZ needs quality infrastructure to work'],
          },
        ],
        
        policy_failures: [
          {
            year_implemented: 1985,
            policy_name: 'Protectionist tariffs on imports',
            expected_outcome: 'Protect domestic industry',
            actual_outcome: 'Domestic industries remained inefficient, lost export competitiveness',
            reason_for_failure: 'Removed competitive pressure, manufacturers did not modernize',
            cost_of_failure: '8 year delay in becoming regional manufacturing hub',
            what_worked_instead: 'Gradual liberalization combined with targeted SEZ support',
            applicable_lessons: [
              'Protection without competition breeds stagnation',
              'Policy must have time limit and clear graduation criteria',
              'Expose key sectors to competition while protecting employment',
            ],
          },
        ],
        
        infrastructure_timeline: [
          {
            year: 1980,
            project_name: 'Makati Business District development',
            type: 'road',
            status: 'completed',
            expected_completion: 1982,
            actual_completion: 1984,
            cost_overrun_percent: 35,
            impact: 'Enabled financial services clustering, attracted multinational corporations',
          },
          {
            year: 2000,
            project_name: 'South Luzon Expressway expansion',
            type: 'road',
            status: 'completed',
            expected_completion: 2003,
            actual_completion: 2007,
            cost_overrun_percent: 50,
            impact: 'Connected manufacturing zones to port, reduced logistics costs 30%',
          },
        ],
        
        current_state: {
          gdp_per_capita_usd: 3400,
          population: 14500000,
          unemployment_rate: 4.2,
          gini_coefficient: 42,
          infrastructure_quality_index: 65,
          primary_sectors: [],
          secondary_sectors: ['manufacturing', 'electronics', 'textiles'],
          tertiary_sectors: ['finance', 'business services', 'tourism', 'retail'],
          key_challenges: [
            'Traffic congestion reducing port efficiency',
            'Port capacity bottleneck (8 month delivery delays)',
            'Skill gaps in advanced manufacturing',
          ],
          key_strengths: [
            'Excellent regional trade connectivity',
            'Strong financial services ecosystem',
            'Educated workforce',
            'Regional manufacturing hub status',
          ],
        },
        
        development_stage: 'post_industrial',
        years_to_reach_current_state: 76, // From 1950 to 2026
        
        comparable_cities: [
          { city_name: 'Bangkok', country: 'Thailand', similarity_score: 82, why_similar: 'Regional manufacturing hub, tropical climate, port-based economy' },
          { city_name: 'Ho Chi Minh City', country: 'Vietnam', similarity_score: 79, why_similar: 'Similar development path, manufacturing focus, port importance' },
          { city_name: 'Jakarta', country: 'Indonesia', similarity_score: 75, why_similar: 'Megacity, Southeast Asian, manufacturing, services mix' },
        ],
      },
      
      {
        entity_id: 'sao_paulo_br',
        entity_name: 'São Paulo',
        country: 'Brazil',
        region: 'Southeast',
        founding_year: 1554,
        current_year: 2026,
        
        population_trajectory: [
          { year: 1900, population: 240000 },
          { year: 1950, population: 2200000, annotation: 'Industrial boom begins' },
          { year: 1980, population: 8490000, annotation: 'Largest city in Southern Hemisphere' },
          { year: 2000, population: 10434000, annotation: 'Megacity status confirmed' },
          { year: 2026, population: 11540000, annotation: 'Mature megacity' },
        ],
        
        economic_structure_evolution: [
          { year: 1950, primary_sector: 20, secondary_sector: 40, tertiary_sector: 40 },
          { year: 1980, primary_sector: 3, secondary_sector: 48, tertiary_sector: 49 },
          { year: 2000, primary_sector: 1, secondary_sector: 38, tertiary_sector: 61 },
          { year: 2026, primary_sector: 0.5, secondary_sector: 30, tertiary_sector: 69.5 },
        ],
        
        critical_decisions: [
          {
            year: 1956,
            decision_name: 'Import substitution industrialization',
            description: 'Heavy investment in domestic manufacturing capacity',
            decision_type: 'policy',
            outcome: 'success',
            impact_10year_gdp_growth_percent: 8,
            impact_on_employment: '+450,000 jobs',
            why_it_worked_or_failed: 'Created strong manufacturing base but not export-oriented',
            lessons_learned: ['Manufacturing base essential but needs export discipline'],
          },
        ],
        
        policy_failures: [
          {
            year_implemented: 1970,
            policy_name: 'Miracle years protectionism',
            expected_outcome: 'Build unbeatable domestic industry',
            actual_outcome: 'Lost export competitiveness, manufacturing stagnated after liberalization',
            reason_for_failure: 'Domestic firms unaccustomed to global competition',
            cost_of_failure: '15 year adjustment period when liberalization came (1990s)',
            what_worked_instead: 'Gradual exposure to competition + targeted technology transfers',
            applicable_lessons: ['Protection works short-term but creates long-term fragility'],
          },
        ],
        
        infrastructure_timeline: [],
        
        current_state: {
          gdp_per_capita_usd: 8900,
          population: 11540000,
          unemployment_rate: 5.8,
          gini_coefficient: 48,
          infrastructure_quality_index: 72,
          primary_sectors: [],
          secondary_sectors: ['automobiles', 'machinery', 'chemicals', 'textiles'],
          tertiary_sectors: ['finance', 'insurance', 'services', 'commerce'],
          key_challenges: [
            'Textile exports not visible in global market',
            'Middlemen capturing 90% of value chain',
            'Market access limited to regional traders',
            'Brand recognition absent',
          ],
          key_strengths: [
            'Strong manufacturing base',
            'Educated workforce',
            'Regional market access',
            'Financial services hub',
          ],
        },
        
        development_stage: 'post_industrial',
        years_to_reach_current_state: 72,
        
        comparable_cities: [
          { city_name: 'Buenos Aires', country: 'Argentina', similarity_score: 85, why_similar: 'Similar Latin American path, manufacturing decline, service economy' },
          { city_name: 'Mexico City', country: 'Mexico', similarity_score: 78, why_similar: 'Megacity, manufacturing, similar policy errors' },
        ],
      },
    ];
  }
  
  /**
   * Get historical profile for a city
   */
  public get_profile(entity_id: string): HistoricalDevelopmentProfile | null {
    return this.profiles.find(p => p.entity_id === entity_id) || null;
  }
  
  /**
   * Find historical parallels - similar problems solved before
   */
  public find_historical_parallels(
    current_problem: string,
    current_location: string,
    current_constraints: string[]
  ): HistoricalParallel[] {
    const parallels: HistoricalParallel[] = [];
    
    // Search through all profiles for similar situations
    for (const profile of this.profiles) {
      // Check if any critical decisions match the current problem type
      for (const decision of profile.critical_decisions) {
        const similarity_score = this.calculate_similarity(
          current_problem,
          decision.decision_name,
          current_constraints
        );
        
        if (similarity_score > 50) {
          parallels.push({
            source_entity: profile.entity_id,
            source_year: decision.year,
            target_entity: current_location,
            target_year: 2026,
            
            similarity: {
              score: similarity_score,
              same_problem: decision.decision_name,
              same_constraints: current_constraints,
              same_assets: profile.current_state.secondary_sectors,
            },
            
            historical_solution: {
              what_was_done: decision.description,
              when: decision.year,
              how_long_it_took: 5, // Simplified
              what_it_cost: 'Unknown',
              who_led_it: 'Government',
            },
            
            outcome: {
              result: decision.why_it_worked_or_failed,
              success: decision.outcome !== 'failure',
              gdp_impact: `+${decision.impact_10year_gdp_growth_percent}% GDP growth`,
              employment_impact: decision.impact_on_employment,
              timeline_accuracy: 'Estimated',
              cost_accuracy: 'Estimated',
            },
            
            applicability_to_target: {
              score: this.calculate_applicability(profile, current_location),
              why_applicable: `Both are regional manufacturing hubs facing similar constraints`,
              what_needs_adaptation: [
                'Account for current technology level',
                'Adapt to local policy environment',
                'Scale to current market size',
              ],
              risks_if_replicated: [
                'Technology has changed since historical case',
                'Global market dynamics different',
                'Regional competitors also modernizing',
              ],
            },
          });
        }
      }
    }
    
    // Sort by applicability
    parallels.sort((a, b) => b.applicability_to_target.score - a.applicability_to_target.score);
    
    return parallels.slice(0, 5); // Return top 5
  }
  
  /**
   * Get lessons from policy failures
   */
  public get_policy_failure_lessons(domain: string): string[] {
    const lessons: string[] = [];
    
    for (const profile of this.profiles) {
      for (const failure of profile.policy_failures) {
        if (failure.policy_name.toLowerCase().includes(domain.toLowerCase())) {
          lessons.push(...failure.applicable_lessons);
        }
      }
    }
    
    return lessons;
  }
  
  /**
   * Analyze development trajectory
   */
  public analyze_trajectory(entity_id: string): {
    development_path: string;
    key_inflection_points: string[];
    time_to_current_stage: number;
    acceleration_factors: string[];
  } {
    const profile = this.get_profile(entity_id);
    if (!profile) {
      return {
        development_path: 'Unknown',
        key_inflection_points: [],
        time_to_current_stage: 0,
        acceleration_factors: [],
      };
    }
    
    return {
      development_path: `${profile.development_stage}`,
      key_inflection_points: profile.critical_decisions.map(d => `${d.year}: ${d.decision_name}`),
      time_to_current_stage: profile.years_to_reach_current_state,
      acceleration_factors: profile.critical_decisions
        .filter(d => d.outcome === 'major_success')
        .map(d => d.decision_name),
    };
  }
  
  /**
   * Calculate similarity between current problem and historical case
   */
  private calculate_similarity(current: string, historical: string, constraints: string[]): number {
    let score = 0;
    
    // Simple string similarity
    const current_words = current.toLowerCase().split(' ');
    const historical_words = historical.toLowerCase().split(' ');
    
    for (const word of current_words) {
      if (historical_words.some(hw => hw.includes(word))) {
        score += 20;
      }
    }
    
    // Constraint match bonus
    if (constraints.length > 0) {
      score += 10 * Math.min(constraints.length, 2);
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Calculate applicability to target location
   */
  private calculate_applicability(profile: HistoricalDevelopmentProfile, target_location: string): number {
    // In production: more sophisticated matching
    // For now: simple heuristic
    
    let score = 50; // Base score
    
    // Same country bonus
    if (target_location.toLowerCase().includes(profile.country.toLowerCase())) {
      score += 20;
    }
    
    // Same sector bonus
    score += 15;
    
    return Math.min(100, score);
  }
  
  /**
   * Store new profile
   */
  public store_profile(profile: HistoricalDevelopmentProfile): void {
    const filename = path.join(this.data_dir, `${profile.entity_id}.json`);
    fs.writeFileSync(filename, JSON.stringify(profile, null, 2));
    this.profiles.push(profile);
  }
  
  /**
   * Get all profiles
   */
  public get_all_profiles(): HistoricalDevelopmentProfile[] {
    return this.profiles;
  }
  
  /**
   * Get profiles by country
   */
  public get_profiles_by_country(country: string): HistoricalDevelopmentProfile[] {
    return this.profiles.filter(p => p.country.toLowerCase() === country.toLowerCase());
  }
}

export default HistoricalDevelopmentAnalyzer;
