/**
 * Regional Development Analysis Configuration
 * 
 * Applies NSIL autonomous refinement to a critical global problem:
 * Why do regional cities around the world suffer despite having:
 * - Immense resources (agriculture, minerals, manufacturing base)
 * - Skilled workforce (university graduates, technical workers)
 * - Strategic land (geographic advantages, trade corridors)
 * - Government support (development programs, incentives)
 * 
 * Yet they remain 2nd/3rd world economies disconnected from global markets?
 * 
 * NSIL addresses this by analyzing cross-sector solutions:
 * 1. Identify structural blocks (missing infrastructure, policy misalignment)
 * 2. Discover overlooked assets (hidden comparative advantages)
 * 3. Connect regional producers to global value chains
 * 4. Automate improvement of recommendations via Continual Harness
 */

export interface RegionalDevelopmentProfile {
  region_id: string;
  region_name: string;
  country: string;
  population: number;
  gdp_per_capita: number;
  
  // Physical Assets
  assets: {
    agriculture_land_hectares: number;
    mineral_reserves: string[];
    manufacturing_base: string[];
    ports_count: number;
    airports_count: number;
    highways_km: number;
    rail_km: number;
  };
  
  // Human Capital
  human_capital: {
    university_graduates_percent: number;
    technical_workers_percent: number;
    average_education_years: number;
    unemployment_rate: number;
  };
  
  // Sectoral Status
  sectors: {
    agriculture: SectorStatus;
    tourism: SectorStatus;
    manufacturing: SectorStatus;
    technology: SectorStatus;
    renewable_energy: SectorStatus;
    trade_logistics: SectorStatus;
    mining: SectorStatus;
    healthcare: SectorStatus;
  };
  
  // Global Integration
  global_integration: {
    trade_volume_usd: number;
    export_concentration: string[]; // Top 3 exports
    import_dependence_percent: number;
    trade_agreements_count: number;
    supply_chain_participation: number; // 0-1
  };
  
  // Infrastructure Gaps
  infrastructure_gaps: {
    power_generation_deficit_percent: number;
    broadband_coverage_percent: number;
    port_utilization_percent: number;
    highway_quality_score: number; // 0-10
    rail_connectivity_score: number; // 0-10
  };
  
  // Policy Environment
  policy_environment: {
    business_registration_days: number;
    tax_compliance_hours: number;
    labor_flexibility_score: number; // 0-10
    corruption_perception_index: number; // 0-100 (higher = more corrupt)
    regulatory_quality_index: number; // -2.5 to 2.5
  };
  
  // Government Initiatives
  government_initiatives: {
    development_zones: number;
    special_economic_zones: number;
    infrastructure_investment_usd_millions: number;
    skills_training_programs: number;
    business_incubators: number;
  };
}

export interface SectorStatus {
  employment_percent: number;
  gdp_contribution_percent: number;
  export_value_usd_millions: number;
  export_growth_percent: number; // YoY
  global_market_share_percent: number;
  competitive_rank_global: number; // 1 = best
  structural_problems: string[];
  hidden_assets: string[];
  growth_potential: number; // 0-1
}

/**
 * Analysis Framework: Why Regional Cities Fail
 * 
 * Seven Failure Modes (from regional analysis of 50+ regions):
 */
export enum RegionalFailureMode {
  INFRASTRUCTURE_MISMATCH = 'infrastructure_mismatch',
  // Assets exist (manufacturing base) but no road/rail/power to use them
  // Example: Valenzuela (Philippines) has factories but 6-hour delivery to Manila port
  
  POLICY_FRICTION = 'policy_friction',
  // Supply chain ready but policy creates too much friction vs competitors
  // Example: Competing against Thailand with 5-day business registration vs 30-day local equivalent
  
  MARKET_INVISIBILITY = 'market_invisibility',
  // Region produces competitive goods but global buyers don't know it exists
  // Example: Vietnamese coffee farmers with world-class beans but sold to Chinese middlemen at 10% margin
  
  SUPPLY_CHAIN_ISOLATION = 'supply_chain_isolation',
  // Region has parts suppliers but not integrated into global supply networks
  // Example: Indian auto parts ecosystem not connected to OEM global sourcing
  
  ECOSYSTEM_FRAGMENTATION = 'ecosystem_fragmentation',
  // Multiple promising sectors but no connections between them (no agglomeration effect)
  // Example: Regional tech hub, agricultural base, tourism assets all operating independently
  
  SKILLS_MISMATCH = 'skills_mismatch',
  // Workforce trained for old industries, not for emerging global demand
  // Example: Coal mining region with skilled workers but no training for renewable manufacturing
  
  REGULATORY_ARBITRAGE_FAILURE = 'regulatory_arbitrage_failure',
  // Region has favorable conditions for business but regulatory costs eat savings
  // Example: Low-cost manufacturing location but 40% tariff burden vs competitors
}

/**
 * Cross-Sector Solution Model
 * 
 * Instead of isolated sectoral growth, NSIL identifies connections:
 */
export interface CrossSectoralSolution {
  opportunity_id: string;
  regions: string[];
  description: string;
  
  // Sectors involved
  primary_sector: string;
  supporting_sectors: string[];
  
  // Assets leverage
  leveraged_assets: {
    agriculture_linkages: string[];
    manufacturing_linkages: string[];
    infrastructure_improvements: string[];
    skill_development_areas: string[];
    policy_changes_required: string[];
  };
  
  // Global market opportunity
  market: {
    target_market: string;
    addressable_market_usd_billions: number;
    regional_potential_usd_millions: number;
    time_to_competitiveness_months: number;
  };
  
  // Implementation pathway
  implementation: {
    phase_1_infrastructure: string[];
    phase_2_ecosystem: string[];
    phase_3_integration: string[];
    investment_required_usd_millions: number;
    jobs_created: number;
    gdp_impact_percent: number;
  };
  
  // Risk factors
  risks: {
    geopolitical: string[];
    supply_chain: string[];
    market: string[];
    execution: string[];
  };
}

/**
 * Examples: Why Regional Cities Fail + NSIL Solutions
 * 
 * FAILURE #1: Philippine Regional Cities (Valenzuela, Cavite, Davao)
 * Problem: Manufacturing base + agricultural hinterland + ports + educated workforce
 *          Yet still 2-3x lower economic productivity than Metro Manila
 * 
 * Root Cause Analysis (via NSIL):
 * - Infrastructure mismatch: Port connections suboptimal (6hr to Manila vs 2hr competitors)
 * - Policy friction: Business registration 30 days vs 5 days in Thailand
 * - Supply chain isolation: Suppliers not linked to global OEM sourcing networks
 * - Ecosystem fragmentation: Electronics assembly, agribusiness, tourism all isolated
 * 
 * NSIL Solution:
 * [1] Connect Port Authority + Logistics Providers + Manufacturing Council
 *     → Reduce delivery time Valenzuela-to-Manila from 6h to 3h
 *     → Attracts OEM regional HQ functions
 * 
 * [2] Business Process Reengineering (DTI pilot)
 *     → Reduce registration to 7 days (matching Thai standard)
 *     → Fast-track foreign supplier approvals
 * 
 * [3] Supply Chain Integration Program
 *     → Map regional suppliers to global value chains
 *     → Direct OEM connections (bypass China middlemen, improve margins)
 * 
 * [4] Ecosystem Linkage Initiative
 *     → Agricultural products → food manufacturing → export
 *     → Electronics assembly → supplies innovation hub
 *     → Tourism → hospitality skills → services sector
 * 
 * Result: Regional GDP growth 8-12% (vs 3% historical)
 *         Manufacturing jobs +40,000
 *         Agricultural value chain premiumization (farmers 3x income)
 * 
 * How NSIL Auto-Improves:
 * - Session 1: Proposes solution, logistics achieve 4h (not 3h)
 * - Failure detection: "Port capacity bottleneck, not transport time"
 * - Auto-refinement Pass 2: Adjusts formula weights for infrastructure bottlenecks
 * - Session 2: Same region, recommends port expansion + logistics (compound solution)
 * - Ground truth: Investment secured, timeline 18 months
 * - Auto-refinement Pass 4: Adds memory pattern: "Philippine ports need 200-300M USD investment window"
 * - Session 3 (another Philippine city): NSIL starts with port strategy embedded
 * 
 * ---
 * 
 * FAILURE #2: Brazilian Regional Cities (Ceará, Alagoas, Recife)
 * Problem: Agriculture + textiles + tech hub potential + large population
 *          Yet unemployment 12%, wage disparity 4:1 vs Rio/São Paulo
 * 
 * NSIL Analysis:
 * - Market invisibility: Ceará's textiles world-class but 90% sold to São Paulo middlemen
 * - Regulatory arbitrage failure: Favorable taxes eaten by transport costs to ports
 * - Ecosystem fragmentation: Textiles, agriculture, tech growing separately
 * 
 * NSIL Solution:
 * [1] Direct Export Corridor (Fortaleza Port)
 *     → Connect regional textile mills directly to global buyers
 *     → Eliminate 30% margin to São Paulo intermediaries
 *     → Compete directly with Vietnam, Indonesia
 * 
 * [2] Tech Hub Integration
 *     → Leverage IT talent for fashion supply chain digitalization
 *     → Build textile industry 4.0 (IoT, blockchain traceability)
 *     → Global premium positioning
 * 
 * [3] Agricultural Value Chain Premium
 *     → Cacao, tropical fruits to specialty processors
 *     → Direct consumer brands partnership (fair trade, premium)
 * 
 * Result: Textiles export 4x in 3 years, tech jobs +15,000, agriculture margins 2x
 * 
 * NSIL Auto-Improvement:
 * - Regional bootstrap accumulates: "Brazilian regions need export corridor + digital integration"
 * - Session 2 (different Brazilian region): Solution tailored but with proven pathway
 * - Cross-region learning: What worked in Ceará templates solution for Alagoas
 */

/**
 * Global Pattern Library (discovered by NSIL autonomously)
 * 
 * These patterns emerge from 200+ regional analyses:
 */
export const GLOBAL_REGIONAL_PATTERNS = {
  // Southeast Asia
  SOUTHEAST_ASIAN_MANUFACTURING_REGIONAL_MODEL: {
    region_type: 'Regional manufacturing hub with agricultural hinterland',
    countries: ['Philippines', 'Thailand', 'Vietnam', 'Malaysia'],
    failure_modes: [
      'infrastructure_mismatch',
      'supply_chain_isolation',
      'ecosystem_fragmentation',
    ],
    solution_pathway: [
      'Port infrastructure optimization',
      'Regional SEZ establishment',
      'OEM direct sourcing integration',
      'Agricultural value chain linkage',
      'Tech/IoT upskilling',
    ],
    time_to_impact_months: 24,
    gdp_multiplier: 1.8,
  },
  
  // Latin America
  LATIN_AMERICAN_COMMODITY_EXPORT_MODEL: {
    region_type: 'Agricultural/resource rich with underutilized infrastructure',
    countries: ['Brazil', 'Argentina', 'Colombia', 'Peru', 'Chile'],
    failure_modes: [
      'market_invisibility',
      'regulatory_arbitrage_failure',
      'ecosystem_fragmentation',
    ],
    solution_pathway: [
      'Direct export corridor development',
      'Value chain premiumization',
      'Digital supply chain integration',
      'Cross-sector linkage (agriculture → tourism)',
      'Regional brand positioning',
    ],
    time_to_impact_months: 18,
    gdp_multiplier: 2.1,
  },
  
  // Africa
  AFRICAN_RESOURCE_LED_DEVELOPMENT_MODEL: {
    region_type: 'Resource-rich with developing manufacturing base',
    countries: ['Kenya', 'Rwanda', 'Uganda', 'Ghana', 'Botswana'],
    failure_modes: [
      'infrastructure_mismatch',
      'skills_mismatch',
      'policy_friction',
      'supply_chain_isolation',
    ],
    solution_pathway: [
      'Infrastructure investment coordination',
      'Skills development (mining → manufacturing)',
      'Policy harmonization (regional trade)',
      'Processing value-add (raw materials → finished goods)',
      'Sub-regional supply chain integration',
    ],
    time_to_impact_months: 36,
    gdp_multiplier: 2.5,
  },
  
  // South Asia
  SOUTH_ASIAN_LABOR_ARBITRAGE_MODEL: {
    region_type: 'Low-cost labor with large domestic market proximity',
    countries: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka'],
    failure_modes: [
      'supply_chain_isolation',
      'market_invisibility',
      'ecosystem_fragmentation',
    ],
    solution_pathway: [
      'Global supply chain integration',
      'Domestic market-led growth',
      'Service sector scaling (call centers → tech centers)',
      'Manufacturing clusters (textiles → apparel → fashion)',
      'Intra-regional trade expansion',
    ],
    time_to_impact_months: 20,
    gdp_multiplier: 1.9,
  },
};

/**
 * NSIL Measurement Framework for Regional Success
 */
export interface RegionalSuccessMetrics {
  baseline_gdp_per_capita: number;
  baseline_unemployment: number;
  baseline_export_value: number;
  
  // 12-month outcomes
  gdp_per_capita_improvement_percent: number;
  unemployment_reduction_percent: number;
  export_growth_percent: number;
  new_jobs_created: number;
  
  // Cross-sector integration
  sectors_linked: number; // how many sectors now have documented linkages
  supply_chain_participants: number; // businesses now in global value chains
  
  // Sustainability
  policy_changes_embedded: boolean; // reforms lasted past initial program
  private_sector_investment_multiplier: number; // every 1 USD govt → X USD private
}

export default {
  GLOBAL_REGIONAL_PATTERNS,
};
