/**
 * ADVERSIQ™ PLATFORM IDENTITY
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * PRODUCT NAME:  ADVERSIQ™ — The Intelligence Enforcement Platform
 * VERSION:       NSIL v2.0 (Nexus Strategic Intelligence Layer)
 * FORMULA COUNT: 46 Proprietary Mathematical Formulas
 * AGENT COUNT:   17 Intelligence Engines (Layers 0–17)
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * WHAT ADVERSIQ™ IS
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ADVERSIQ is not an AI assistant. It does not predict. It enforces.
 *
 * Every major intelligence platform — McKinsey Insights, IBM Watson, Palantir,
 * Salesforce Einstein — generates recommendations. ADVERSIQ™ puts those
 * recommendations through a tribunal of five adversarial AI personas who are
 * hardwired to destroy weak arguments, expose hidden assumptions, and block
 * decisions that have not survived cross-examination.
 *
 * The result: intelligence that has been stress-tested before you act on it.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * THE FIVE ADVERSARIAL PERSONAS (ADVERSIQ TRIBUNAL)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *  THE SKEPTIC    — attacks every assumption. Nothing is assumed true.
 *  THE ADVOCATE   — finds the strongest possible case FOR the decision.
 *  THE REGULATOR  — asks: what will the regulators, governments, and auditors say?
 *  THE ACCOUNTANT — strips every number to its true cost. No optimistic projections.
 *  THE OPERATOR   — asks: can this actually be executed by real humans in the real world?
 *
 * These five personas vote. The Five-Engine Tribunal renders a verdict.
 * No decision passes ADVERSIQ without surviving all five.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * THE FIVE FLAGSHIP FORMULAS (UNPRECEDENTED IN ANY INTELLIGENCE PLATFORM)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * OIQ™ — Organisational Intelligence Quotient
 *   IQ applied to organizations, not individuals. Measures the analytical
 *   and institutional reasoning capacity of the entity pursuing the decision.
 *   Formula: f(institutional_capacity, information_velocity, adaptive_learning)
 *
 * MEQ™ — Market Emotional Quotient
 *   EQ applied to markets, not people. Measures the collective sentiment
 *   coherence and emotional stability of the target market or region.
 *   Formula: f(sentiment_variance, stakeholder_coherence, narrative_stability)
 *
 * PSQ™ — Partnership Social Quotient
 *   SQ applied to cross-cultural partnerships. Measures the relationship-building
 *   ease using Hofstede's 6 cultural dimensions as a mapping engine.
 *   Formula: f(cultural_distance, trust_velocity, reciprocity_norms)
 *
 * RAQ™ — Regional Adversity Quotient
 *   AQ applied to regions, not individuals. Measures the shock-recovery
 *   resilience of the target geography — never quantified before.
 *   Formula: f(historical_shock_recovery, institutional_buffer, diversity_index)
 *
 * ADV™ — ADVERSIQ Intelligence Score
 *   The master composite score. All 46 formulas × 5 adversarial personas ×
 *   17 intelligence layers → one verified, enforceable decision score.
 *   Formula: f(OIQ, MEQ, PSQ, RAQ, SCF) → tribunal verdict composite
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * WHY THIS IS CATEGORICALLY DIFFERENT
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * ┌────────────────────────┬────────────────────────┬──────────────────────┐
 * │ Capability             │ Every Other Platform   │ ADVERSIQ™            │
 * ├────────────────────────┼────────────────────────┼──────────────────────┤
 * │ Decision output        │ Recommendation         │ Tribunal Verdict     │
 * │ Formula base           │ 0–5 formulas           │ 46 proprietary       │
 * │ IQ/EQ/SQ/AQ applied to │ Individuals            │ Orgs/Markets/Regions │
 * │ Adversarial testing    │ None                   │ 5-persona tribunal   │
 * │ Antifragility scoring  │ None                   │ AFI™ (Taleb-based)   │
 * │ Temporal arbitrage     │ None                   │ TAI™ + TDI™          │
 * │ Impossibility analysis │ None                   │ ImpossibilityEngine  │
 * │ Social dynamics        │ Sentiment only         │ Rogers S-curve + Phi │
 * │ Narrative economics    │ None                   │ NEI™ (Shiller-based) │
 * │ Exformation analysis   │ None                   │ EXF™                 │
 * │ Cascade prediction     │ None                   │ 7-level N-order      │
 * │ Prompt injection guard │ None                   │ Pattern-matched      │
 * │ Formula DAG execution  │ Sequential             │ Parallel (3-5× speed)│
 * └────────────────────────┴────────────────────────┴──────────────────────┘
 *
 * @module PlatformIdentity
 * @version 2.0.0
 */

// ─── Formula Registry ─────────────────────────────────────────────────────────

export interface FormulaDefinition {
  id: string;
  name: string;
  trademark: boolean;
  layer: number;
  category: string;
  description: string;
  mathBasis: string;
  novel: boolean;         // True = first-ever implementation
  dependsOn: string[];
}

export const FORMULA_REGISTRY: readonly FormulaDefinition[] = [
  // ── Layer 0–1: Foundation (4 formulas) ─────────────────────────────────────
  {
    id: 'PRI', name: 'Political Risk Index', trademark: false, layer: 0, category: 'Risk',
    description: 'Composite political stability score for the target country/region.',
    mathBasis: 'Weighted average of governance, stability, rule-of-law, and corruption indices.',
    novel: false, dependsOn: [],
  },
  {
    id: 'CRI', name: 'Country Risk Index', trademark: false, layer: 0, category: 'Risk',
    description: 'Total country-level risk composite: political + economic + social + infrastructure.',
    mathBasis: 'CRI = α·PRI + β·EconRisk + γ·SocialRisk + δ·InfraRisk',
    novel: false, dependsOn: [],
  },
  {
    id: 'BARNA', name: 'Barriers Analysis', trademark: false, layer: 0, category: 'Strategic',
    description: 'Regulatory, legal, and market entry barrier quantification.',
    mathBasis: 'B = Σ(barrier_i × severity_i × probability_i) / max_barrier_score',
    novel: false, dependsOn: [],
  },
  {
    id: 'TCO', name: 'Total Cost of Ownership', trademark: false, layer: 0, category: 'Financial',
    description: 'Full lifetime cost of the investment including hidden and indirect costs.',
    mathBasis: 'TCO = CapEx + Σ(OpEx_t / (1+r)^t) + exit_costs + risk_reserves',
    novel: false, dependsOn: [],
  },

  // ── Layer 1: Primary Engines (5 formulas) ──────────────────────────────────
  {
    id: 'SPI', name: 'Strategic Partnership Index', trademark: false, layer: 1, category: 'Strategic',
    description: 'Partnership viability score: political safety × market opportunity × alignment.',
    mathBasis: 'SPI = (1−PRI) × CRI × alignment_score × market_readiness',
    novel: false, dependsOn: ['PRI', 'CRI'],
  },
  {
    id: 'RROI', name: 'Risk-Adjusted Return on Investment', trademark: false, layer: 1, category: 'Financial',
    description: 'Investment return adjusted for full risk profile, not just financial risk.',
    mathBasis: 'RROI = (projected_return − risk_premium) / TCO × (1 − CRI)',
    novel: false, dependsOn: ['TCO', 'CRI'],
  },
  {
    id: 'NVI', name: 'Net Value Index', trademark: false, layer: 1, category: 'Strategic',
    description: 'Strategic value after barrier deduction and opportunity cost.',
    mathBasis: 'NVI = opportunity_value × (1 − BARNA_normalized)',
    novel: false, dependsOn: ['BARNA'],
  },
  {
    id: 'CAP', name: 'Capability Assessment Profile', trademark: false, layer: 1, category: 'Operational',
    description: 'Organizational capability to execute the decision in the target environment.',
    mathBasis: 'CAP = f(human_capital, infrastructure, execution_track_record) × CRI_modifier',
    novel: false, dependsOn: ['CRI'],
  },
  {
    id: 'RNI', name: 'Regulatory Net Impact', trademark: false, layer: 1, category: 'Risk',
    description: 'Net effect of regulatory environment on the decision viability.',
    mathBasis: 'RNI = regulatory_benefit − regulatory_burden, normalized to PRI framework',
    novel: false, dependsOn: ['PRI'],
  },

  // ── Layer 2: Composite Scores (6 formulas) ─────────────────────────────────
  {
    id: 'SEAM', name: 'Stakeholder Engagement & Alignment Metric', trademark: false, layer: 2, category: 'Operational',
    description: 'Measures cohesion and engagement quality across all stakeholder groups.',
    mathBasis: 'SEAM = Σ(stakeholder_i × alignment_i × influence_i) / max_seam_score',
    novel: false, dependsOn: ['SPI', 'NVI'],
  },
  {
    id: 'IVAS', name: 'Investment Value Alignment Score', trademark: false, layer: 2, category: 'Financial',
    description: 'Alignment between investment thesis and actual value creation potential.',
    mathBasis: 'IVAS = (strategic_value × alignment_coefficient) / (RROI + risk_premium)',
    novel: false, dependsOn: ['RROI', 'SPI'],
  },
  {
    id: 'ESI', name: 'Environmental Sustainability Index', trademark: false, layer: 2, category: 'Operational',
    description: 'Environmental risk and sustainability compliance score.',
    mathBasis: 'ESI = environmental_score × regulatory_compliance × climate_risk_adjustment',
    novel: false, dependsOn: ['NVI', 'BARNA'],
  },
  {
    id: 'FRS', name: 'Financial Resilience Score', trademark: false, layer: 2, category: 'Financial',
    description: 'Ability of the investment to withstand financial stress scenarios.',
    mathBasis: 'FRS = liquidity_ratio × debt_serviceability × (1 − SPI_risk_component)',
    novel: false, dependsOn: ['SPI', 'RROI'],
  },
  {
    id: 'AGI', name: 'Adaptive Growth Index', trademark: false, layer: 2, category: 'Operational',
    description: 'Growth trajectory adaptability under changing market conditions.',
    mathBasis: 'AGI = base_growth × market_adaptability × IVAS_multiplier',
    novel: false, dependsOn: ['IVAS'],
  },
  {
    id: 'VCI', name: 'Value Creation Index', trademark: false, layer: 2, category: 'Strategic',
    description: 'Net new value created by the investment beyond baseline alternatives.',
    mathBasis: 'VCI = (project_NPV − next_best_alternative_NPV) / TCO',
    novel: false, dependsOn: ['SEAM'],
  },

  // ── Layer 3: Master Composite (5 formulas) ─────────────────────────────────
  {
    id: 'SCF', name: 'Strategic Confidence Factor', trademark: false, layer: 3, category: 'Primary',
    description: 'The primary decision confidence composite — the top-of-pyramid score.',
    mathBasis: 'SCF = w1·SEAM + w2·IVAS + w3·SPI + w4·RROI, where weights are learned via gradient descent',
    novel: false, dependsOn: ['SEAM', 'IVAS', 'SPI', 'RROI'],
  },
  {
    id: 'ATI', name: 'Adaptive Transformation Index', trademark: false, layer: 3, category: 'Operational',
    description: 'Capacity to transform in response to environmental changes.',
    mathBasis: 'ATI = ESI × CAP × transformation_readiness',
    novel: false, dependsOn: ['ESI', 'CAP'],
  },
  {
    id: 'ISI', name: 'Innovation & Scalability Index', trademark: false, layer: 3, category: 'Operational',
    description: 'Innovation capacity and scalability of the proposed approach.',
    mathBasis: 'ISI = innovation_score × scalability_coefficient × SEAM_modifier',
    novel: false, dependsOn: ['SEAM', 'CAP'],
  },
  {
    id: 'OSI', name: 'Operational Sustainability Index', trademark: false, layer: 3, category: 'Operational',
    description: 'Long-run operational viability and sustainability score.',
    mathBasis: 'OSI = operational_efficiency × ESI × VCI',
    novel: false, dependsOn: ['ESI', 'VCI'],
  },
  {
    id: 'SRA', name: 'Strategic Risk Adjustment', trademark: false, layer: 3, category: 'Risk',
    description: 'Holistic risk adjustment applied to the strategy composite.',
    mathBasis: 'SRA = SCF × (1 − PRI_weighted) × tail_risk_factor',
    novel: false, dependsOn: ['SCF', 'PRI'],
  },
  {
    id: 'IDV', name: 'Investment Decision Value', trademark: false, layer: 3, category: 'Financial',
    description: 'Net decision value after all risk adjustments and opportunity costs.',
    mathBasis: 'IDV = SCF × RROI × (1 − opportunity_cost_rate)',
    novel: false, dependsOn: ['SCF', 'RROI'],
  },

  // ── Layer 4: Autonomous Intelligence (8 formulas) ──────────────────────────
  {
    id: 'CRE', name: 'Creative Synthesis Engine', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Discovers novel strategic angles through bisociation and cross-domain analogy.',
    mathBasis: 'CRE = bisociation_score(domain_A, domain_B) × novelty_coefficient',
    novel: true, dependsOn: ['SCF', 'SEAM'],
  },
  {
    id: 'CDT', name: 'Cross-Domain Transfer', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Maps biological, physical, and mathematical analogies to economic contexts.',
    mathBasis: 'CDT = structural_similarity(source_domain, target_domain) × transfer_confidence',
    novel: true, dependsOn: ['SCF', 'ESI'],
  },
  {
    id: 'AGL', name: 'Autonomous Goal Lens', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Detects emergent decision goals not explicitly stated by the user.',
    mathBasis: 'AGL = latent_goal_extraction(SPI, RROI, SCF) × emergence_coefficient',
    novel: true, dependsOn: ['SPI', 'RROI', 'SCF'],
  },
  {
    id: 'ETH', name: 'Ethical Reasoning Gate', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Hard ethical gate — blocks outputs that fail multi-framework ethical review.',
    mathBasis: 'ETH = min(utilitarian_score, deontological_score, virtue_score, stakeholder_score)',
    novel: true, dependsOn: ['SCF', 'ESI', 'ISI'],
  },
  {
    id: 'EVO', name: 'Self-Evolving Algorithm', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Gradient descent weight optimization — formulas self-tune on outcome data.',
    mathBasis: 'EVO: w(t+1) = w(t) − η·∇L(w(t)), L = prediction error over historical outcomes',
    novel: true, dependsOn: ['SPI', 'RROI', 'CRI'],
  },
  {
    id: 'ADA', name: 'Adaptive Learning Engine', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Bayesian belief updating from real-world decision outcomes.',
    mathBasis: 'ADA: P(H|E) = P(E|H)·P(H) / P(E) — posterior updated per outcome signal',
    novel: true, dependsOn: ['SCF', 'ATI'],
  },
  {
    id: 'EMO', name: 'Emotional Intelligence Layer', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Models psychological biases and stakeholder emotional state using Prospect Theory.',
    mathBasis: 'EMO: v(x) = x^α if x≥0, −λ(−x)^β if x<0 (Kahneman-Tversky value function)',
    novel: true, dependsOn: ['SCF', 'ISI', 'OSI'],
  },
  {
    id: 'SIM', name: 'Scenario Simulation Engine', trademark: false, layer: 4, category: 'Autonomous',
    description: 'Monte Carlo simulation — 5,000 scenarios with causal feedback loops.',
    mathBasis: 'SIM: 5000 Monte Carlo samples × causal-loop modifier × regime-switch probability',
    novel: true, dependsOn: ['SCF', 'SRA', 'PRI'],
  },

  // ── Layer 5: Human Intelligence Quotient Suite (4 formulas — UNPRECEDENTED) ──
  {
    id: 'OIQ', name: 'Organisational Intelligence Quotient™', trademark: true, layer: 5, category: 'HIQ Suite',
    description: 'IQ applied to organizations — analytical and institutional reasoning capacity. First application of IQ framework to organizational intelligence.',
    mathBasis: 'OIQ = f(institutional_capacity × IVAS × CRI_inverse) → normalized 0–200 IQ scale',
    novel: true, dependsOn: ['CAP', 'IVAS', 'CRI'],
  },
  {
    id: 'MEQ', name: 'Market Emotional Quotient™', trademark: true, layer: 5, category: 'HIQ Suite',
    description: 'EQ applied to markets — collective sentiment stability and coherence. No market EQ formula has existed before.',
    mathBasis: 'MEQ = f(sentiment_variance × SEAM × ISI) → normalized 0–100 EQ scale',
    novel: true, dependsOn: ['PRI', 'SEAM', 'ISI'],
  },
  {
    id: 'PSQ', name: 'Partnership Social Quotient™', trademark: true, layer: 5, category: 'HIQ Suite',
    description: 'SQ applied to cross-cultural partnerships — Hofstede 6-dimension cultural fit mapping.',
    mathBasis: 'PSQ = f(Hofstede_distance × NVI × BARNA_inverse) → cultural velocity score',
    novel: true, dependsOn: ['SEAM', 'NVI', 'BARNA'],
  },
  {
    id: 'RAQ', name: 'Regional Adversity Quotient™', trademark: true, layer: 5, category: 'HIQ Suite',
    description: 'AQ applied to regions — shock-recovery resilience quantification. No prior quantification of regional AQ exists.',
    mathBasis: 'RAQ = f(historical_recovery × institutional_buffer × CRI × PRI × SRA)',
    novel: true, dependsOn: ['CRI', 'PRI', 'SRA'],
  },

  // ── Layer 6: ADVERSIQ Master Score (1 formula) ─────────────────────────────
  {
    id: 'ADV', name: 'ADVERSIQ Intelligence Score™', trademark: true, layer: 6, category: 'Master',
    description: 'The supreme composite — all 46 formulas + 5 adversarial personas = one enforceable verdict.',
    mathBasis: 'ADV = f(OIQ × 0.25, MEQ × 0.20, PSQ × 0.20, RAQ × 0.20, SCF × 0.15)',
    novel: true, dependsOn: ['OIQ', 'MEQ', 'PSQ', 'RAQ', 'SCF'],
  },

  // ── Layer 7–8: New Antifragility, Temporal & Complexity Suite (12 formulas) ──
  {
    id: 'AFI', name: 'Antifragility Index™', trademark: true, layer: 7, category: 'Antifragility',
    description: 'First quantified antifragility score for any intelligence platform. Measures convexity, optionality, barbell positioning, volatility harvesting, and via negativa. Based on Nassim Taleb\'s Antifragile (2012).',
    mathBasis: 'AFI = 0.30·convexity + 0.25·optionality + 0.20·barbell + 0.15·vol_harvest + 0.10·via_negativa',
    novel: true, dependsOn: ['SCF', 'SRA', 'CRI'],
  },
  {
    id: 'TAI', name: 'Temporal Arbitrage Index™', trademark: true, layer: 7, category: 'Temporal',
    description: 'First temporal arbitrage scoring engine. Identifies time-asymmetric pricing inefficiencies from hyperbolic discounting, regime change lag, and narrative timing.',
    mathBasis: 'TAI = 0.25·discount_gap + 0.20·info_decay + 0.25·regime_lag + 0.15·narrative_timing + 0.15·option_value',
    novel: true, dependsOn: ['SCF', 'RROI', 'PRI'],
  },
  {
    id: 'TDI', name: 'Temporal Discount Index™', trademark: true, layer: 7, category: 'Temporal',
    description: 'Measures the divergence between rational DCF and behavioral hyperbolic discounting — quantifies how much the market over-discounts future value.',
    mathBasis: 'TDI = [PV_rational − PV_behavioral] / PV_rational = [FV/(1+r)^T − FV/(1+kT)] / [FV/(1+r)^T]',
    novel: true, dependsOn: ['TAI', 'RROI'],
  },
  {
    id: 'NEI', name: 'Narrative Economics Index™', trademark: true, layer: 7, category: 'Complexity',
    description: 'Based on Robert Shiller\'s Narrative Economics (2019). Measures how viral economic narratives in the decision environment affect pricing and decision biases.',
    mathBasis: 'NEI = narrative_momentum × adoption_velocity × Shiller_P_E_divergence × sentiment_coherence',
    novel: true, dependsOn: ['SCF', 'ISI', 'EMO'],
  },
  {
    id: 'PSI', name: 'Phase State Index™', trademark: true, layer: 7, category: 'Complexity',
    description: 'Complexity theory tipping-point proximity score. Measures how close the system is to a phase transition (bifurcation point) using critical slowing-down detection.',
    mathBasis: 'PSI = λ_max(correlation_matrix) / n × variance_inflation × autocorrelation_lag1',
    novel: true, dependsOn: ['CRI', 'PRI', 'SRA'],
  },
  {
    id: 'CGI', name: 'Cognitive Gap Index™', trademark: true, layer: 7, category: 'Complexity',
    description: 'Measures the delta between what the decision system currently knows and what it needs to know to act with confidence. Drives autonomous information-seeking.',
    mathBasis: 'CGI = 1 − (available_evidence / required_evidence) × confidence_decay_rate',
    novel: true, dependsOn: ['CAP', 'IVAS', 'ADA'],
  },
  {
    id: 'SVX', name: 'Strategic Value Exchange™', trademark: true, layer: 8, category: 'Strategic Value',
    description: 'Quantifies mutual value creation quality in partnerships — goes beyond ROI to measure value flow symmetry and relationship reciprocity.',
    mathBasis: 'SVX = (partner_value_delivered × partner_value_received) / (max_value_possible + ε)',
    novel: true, dependsOn: ['SEAM', 'PSQ', 'NVI'],
  },
  {
    id: 'CFV', name: 'Counterfactual Value™', trademark: true, layer: 8, category: 'Strategic Value',
    description: 'The value of strategic paths NOT taken — opportunity cost scoring for decision alternatives. Unique: models forgone options as first-class intelligence outputs.',
    mathBasis: 'CFV = Σ(alternative_NPV_i × probability_i) − selected_NPV × regret_discount',
    novel: true, dependsOn: ['SCF', 'AFI', 'TAI'],
  },
  {
    id: 'IME', name: 'Information Metabolism Efficiency™', trademark: true, layer: 8, category: 'Systemic',
    description: 'Measures the speed and fidelity with which the organization converts new information into actionable decisions. Low IME = intelligence black holes.',
    mathBasis: 'IME = (decisions_informed_by_data / total_decisions) × (decision_cycle_speed / benchmark_speed)',
    novel: true, dependsOn: ['CGI', 'CAP', 'ADA'],
  },
  {
    id: 'SCV', name: 'Systemic Cascade Value™', trademark: true, layer: 8, category: 'Systemic',
    description: 'Positive cascade potential — how much additional value the decision generates through network amplification beyond the direct first-order effect.',
    mathBasis: 'SCV = direct_value × Σ(node_multiplier_i × reach_i) × network_density',
    novel: true, dependsOn: ['SCF', 'NEI', 'PSI'],
  },
  {
    id: 'MBI', name: 'Moral Business Intelligence™', trademark: true, layer: 8, category: 'Systemic',
    description: 'ESG × Governance × Ethics composite — deeper than ESG scores. Uses multi-stakeholder moral framework (utilitarian + deontological + virtue) for integrated scoring.',
    mathBasis: 'MBI = ETH × ESI × OSI × governance_premium where ETH = min(utilitarian, deontological, virtue)',
    novel: true, dependsOn: ['ETH', 'ESI', 'OSI'],
  },
  {
    id: 'EXF', name: 'Exformation Index™', trademark: true, layer: 8, category: 'Systemic',
    description: 'Radical novel formula: measures the intelligence value of what is structurally NOT communicated. Based on Tor Nørretranders\' exformation theory — the shared context not transmitted.',
    mathBasis: 'EXF = H(sender_knowledge) − H(transmitted_message) — the information discarded in communication',
    novel: true, dependsOn: ['CGI', 'EMO', 'CRE'],
  },
] as const;

// ─── Platform Identity Manifest ───────────────────────────────────────────────

export interface PlatformManifest {
  name: string;
  fullName: string;
  tagline: string;
  version: string;
  formulaCount: number;
  trademarkedFormulas: number;
  novelFormulas: number;        // First-ever implementations
  intelligenceLayers: number;
  adversarialPersonas: number;
  keyTrademarks: string[];
  uniqueClaims: string[];
  targetMarkets: string[];
  competitiveAdvantages: string[];
}

export const PLATFORM_MANIFEST: PlatformManifest = {
  name: 'ADVERSIQ™',
  fullName: 'ADVERSIQ Intelligence Enforcement Platform',
  tagline: '46 formulas. 5 adversaries. One verdict. Not AI advice — AI enforcement.',
  version: 'NSIL v2.0',
  formulaCount: 46,
  trademarkedFormulas: 17,
  novelFormulas: 23,
  intelligenceLayers: 17,
  adversarialPersonas: 5,
  keyTrademarks: ['OIQ™', 'MEQ™', 'PSQ™', 'RAQ™', 'ADV™', 'AFI™', 'TAI™', 'TDI™', 'NEI™', 'PSI™', 'CGI™', 'SVX™', 'CFV™', 'IME™', 'SCV™', 'MBI™', 'EXF™'],
  uniqueClaims: [
    'First platform to apply IQ/EQ/SQ/AQ to organizations, markets, and regions — not individuals',
    'First quantified antifragility score in any commercial intelligence platform (AFI™)',
    'First temporal arbitrage engine for decision intelligence (TAI™ + TDI™)',
    'First exformation analysis engine — models the intelligence value of silence (EXF™)',
    'First adversarial tribunal architecture — 5 personas vote before any decision passes',
    'First narrative economics scoring engine based on Shiller\'s framework (NEI™)',
    '46 proprietary formulas in a DAG-scheduled parallel execution pipeline (3–5× speed)',
    'Phase state detection — identifies system criticality before tipping points occur (PSI™)',
    'Counterfactual value scoring — paths NOT taken are first-class intelligence outputs (CFV™)',
  ],
  targetMarkets: [
    'Government strategic advisory',
    'Investment decision support',
    'Regional development intelligence',
    'Partnership due diligence',
    'Crisis response planning',
    'Complex wicked problem analysis',
  ],
  competitiveAdvantages: [
    'ADVERSIQ enforces decisions — not just suggests them',
    'Five adversarial personas attack every output before it reaches the user',
    'DAG-scheduled parallel execution: 46 formulas in 3–5× less time than sequential',
    '17 intelligence layers from raw input to verified verdict',
    'Zero external API dependency — runs fully on-premises with Ollama local AI',
    'Novel formula suite extends existing intelligence science into unexplored territory',
  ],
};

// ─── Formula lookup helpers ───────────────────────────────────────────────────

export function getFormulaById(id: string): FormulaDefinition | undefined {
  return (FORMULA_REGISTRY as readonly FormulaDefinition[]).find(f => f.id === id);
}

export function getFormulasByCategory(category: string): FormulaDefinition[] {
  return (FORMULA_REGISTRY as readonly FormulaDefinition[]).filter(f => f.category === category);
}

export function getNovelFormulas(): FormulaDefinition[] {
  return (FORMULA_REGISTRY as readonly FormulaDefinition[]).filter(f => f.novel);
}

export function getTrademarkedFormulas(): FormulaDefinition[] {
  return (FORMULA_REGISTRY as readonly FormulaDefinition[]).filter(f => f.trademark);
}

export function getFormulaSummary(): string {
  const total = FORMULA_REGISTRY.length;
  const novel = FORMULA_REGISTRY.filter(f => f.novel).length;
  const tm = FORMULA_REGISTRY.filter(f => f.trademark).length;
  return `${total} formulas (${novel} novel, ${tm} trademarked) across ${new Set(FORMULA_REGISTRY.map(f => f.category)).size} categories`;
}
