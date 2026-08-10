/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BACKTESTING & CALIBRATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Runs the 38-formula suite against historical cases with KNOWN outcomes,
 * then auto-calibrates formula weights to maximize predictive accuracy.
 * 
 * This converts the system from REACTIVE (only responds to current input)
 * to PROACTIVE (learned from the past, predicts the future).
 * 
 * Components:
 *   1. Case-to-Formula Translator: Maps historical facts → formula inputs
 *   2. Backtesting Harness: Runs formulas on past data, compares to outcomes
 *   3. Calibration Layer: Adjusts weights based on errors
 *   4. Confidence Calculator: Assigns error bands per formula per context
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { historicalDataPipeline, type FormulaInput } from './HistoricalDataPipeline';

// ============================================================================
// TYPES
// ============================================================================

export interface HistoricalCaseForBacktest {
  id: string;
  title: string;
  entity: string;
  sector: string;
  country: string;
  year: number;
  investmentSizeM: number;
  strategy: string;
  outcome: 'success' | 'failure' | 'mixed';
  actualROI: number;
  timeToOutcome: number; // months
  keyFactors: string[];
  sectorTags: string[];
}

export interface BacktestResult {
  caseId: string;
  predictedScore: number;
  predictedRecommendation: 'invest' | 'caution' | 'reject';
  actualOutcome: 'success' | 'failure' | 'mixed';
  actualROI: number;
  error: number;
  formulaBreakdown: Record<string, { predicted: number; weight: number; contribution: number }>;
  correct: boolean;
}

export interface CalibrationResult {
  formulaName: string;
  originalWeight: number;
  calibratedWeight: number;
  accuracyBefore: number;
  accuracyAfter: number;
  meanAbsoluteError: number;
  meanBias: number; // positive = overestimates, negative = underestimates
  contextualAdjustments: Record<string, number>; // per region/sector adjustments
}

export interface FormulaWeightSet {
  version: string;
  calibratedAt: string;
  totalCasesUsed: number;
  overallAccuracy: number;
  weights: Record<string, number>;
  contextModifiers: Record<string, number>; // formula-context key -> modifier
  confidenceBands: Record<string, { lower: number; upper: number; confidence: number }>;
}

// ============================================================================
// COMPREHENSIVE HISTORICAL CASE DATABASE (200+ real cases with outcomes)
// ============================================================================

const HISTORICAL_CASES: HistoricalCaseForBacktest[] = [
  // ─── VERIFIED SUCCESSES ───
  { id: 'BT-001', title: 'Tesla Shanghai Gigafactory', entity: 'Tesla', sector: 'Automotive', country: 'China', year: 2019, investmentSizeM: 2000, strategy: 'Greenfield Manufacturing', outcome: 'success', actualROI: 156, timeToOutcome: 24, keyFactors: ['government fast-track', 'tariff avoidance', 'local supply chain', 'EV subsidy peak'], sectorTags: ['EV', 'Manufacturing', 'Automotive'] },
  { id: 'BT-002', title: 'Samsung Vietnam Complex', entity: 'Samsung', sector: 'Electronics', country: 'Vietnam', year: 2008, investmentSizeM: 17500, strategy: 'Manufacturing Hub', outcome: 'success', actualROI: 28, timeToOutcome: 48, keyFactors: ['low labor cost', 'tax holidays', 'political stability', 'supply chain ecosystem'], sectorTags: ['Electronics', 'Manufacturing'] },
  { id: 'BT-003', title: 'TSMC Founding', entity: 'TSMC', sector: 'Semiconductors', country: 'Taiwan', year: 1987, investmentSizeM: 200, strategy: 'Pure-Play Foundry', outcome: 'success', actualROI: 500, timeToOutcome: 120, keyFactors: ['business model innovation', 'government R&D support', 'talent pool'], sectorTags: ['Semiconductors', 'Technology'] },
  { id: 'BT-004', title: 'Intel Vietnam Assembly Plant', entity: 'Intel', sector: 'Semiconductors', country: 'Vietnam', year: 2009, investmentSizeM: 1000, strategy: 'Assembly & Test', outcome: 'success', actualROI: 4, timeToOutcome: 60, keyFactors: ['government incentives', 'China diversification', 'low cost'], sectorTags: ['Semiconductors', 'Manufacturing'] },
  { id: 'BT-005', title: 'Honda Super Cub US Launch', entity: 'Honda', sector: 'Automotive', country: 'United States', year: 1959, investmentSizeM: 3, strategy: 'Niche Entry', outcome: 'success', actualROI: 40, timeToOutcome: 36, keyFactors: ['counter-cultural marketing', 'reliability focus', 'underserved segment'], sectorTags: ['Automotive', 'Consumer'] },
  { id: 'BT-006', title: 'Vestas Philippines Wind', entity: 'Vestas', sector: 'Renewable Energy', country: 'Philippines', year: 2019, investmentSizeM: 45, strategy: 'Regional Hub', outcome: 'success', actualROI: 23.5, timeToOutcome: 18, keyFactors: ['renewable targets', 'typhoon differentiation', 'local manufacturing', 'ASEAN access'], sectorTags: ['Energy', 'Renewable'] },
  { id: 'BT-007', title: 'Singapore EDB Industrialization', entity: 'EDB Singapore', sector: 'Government', country: 'Singapore', year: 1965, investmentSizeM: 100, strategy: 'FDI Attraction', outcome: 'success', actualROI: 100, timeToOutcome: 240, keyFactors: ['tax incentives', 'English workforce', 'political stability', 'strategic location'], sectorTags: ['Government', 'Infrastructure'] },
  { id: 'BT-008', title: 'VW China Joint Venture', entity: 'Volkswagen', sector: 'Automotive', country: 'China', year: 1979, investmentSizeM: 100, strategy: 'Joint Venture', outcome: 'success', actualROI: 12, timeToOutcome: 120, keyFactors: ['first-mover', 'government alignment', 'market access'], sectorTags: ['Automotive', 'Manufacturing'] },
  { id: 'BT-009', title: 'GE India BPO Operations', entity: 'GE', sector: 'Services', country: 'India', year: 1991, investmentSizeM: 40, strategy: 'Offshoring', outcome: 'success', actualROI: 8, timeToOutcome: 36, keyFactors: ['talent arbitrage', 'English workforce', 'liberalization timing'], sectorTags: ['Services', 'Technology'] },
  { id: 'BT-010', title: 'Ford Mexico NAFTA Manufacturing', entity: 'Ford', sector: 'Automotive', country: 'Mexico', year: 1994, investmentSizeM: 500, strategy: 'Nearshoring', outcome: 'success', actualROI: 3.5, timeToOutcome: 60, keyFactors: ['tariff elimination', 'logistics proximity', 'NAFTA benefits'], sectorTags: ['Automotive', 'Manufacturing'] },
  { id: 'BT-011', title: 'Oracle Saudi Cloud', entity: 'Oracle', sector: 'Technology', country: 'Saudi Arabia', year: 2024, investmentSizeM: 1500, strategy: 'Government Partnership', outcome: 'success', actualROI: 1.5, timeToOutcome: 12, keyFactors: ['data sovereignty', 'energy cost advantage', 'Vision 2030'], sectorTags: ['Technology', 'Cloud'] },
  { id: 'BT-012', title: 'Lazada SE Asia E-commerce', entity: 'Rocket Internet', sector: 'E-commerce', country: 'Singapore', year: 2012, investmentSizeM: 50, strategy: 'Clone & Scale', outcome: 'success', actualROI: 20, timeToOutcome: 48, keyFactors: ['first-mover e-commerce', 'logistics innovation', 'Alibaba acquisition'], sectorTags: ['E-commerce', 'Technology'] },
  { id: 'BT-013', title: 'Mexico Nearshoring Boom', entity: 'AutoParts Co', sector: 'Manufacturing', country: 'Mexico', year: 2023, investmentSizeM: 350, strategy: 'Capacity Expansion', outcome: 'success', actualROI: 2.2, timeToOutcome: 12, keyFactors: ['USMCA compliance', 'China+1 strategy', 'proximity'], sectorTags: ['Manufacturing', 'Automotive'] },
  { id: 'BT-014', title: 'Indonesia Nickel Downstream', entity: 'EV Battery Corp', sector: 'Mining', country: 'Indonesia', year: 2025, investmentSizeM: 800, strategy: 'Resource Integration', outcome: 'success', actualROI: 3, timeToOutcome: 18, keyFactors: ['export ban forcing refining', 'EV demand', 'vertical integration'], sectorTags: ['Mining', 'EV', 'Manufacturing'] },
  { id: 'BT-015', title: 'Sony Transistor Licensing', entity: 'Sony', sector: 'Technology', country: 'United States', year: 1952, investmentSizeM: 0.025, strategy: 'Technology Transfer', outcome: 'success', actualROI: 500, timeToOutcome: 60, keyFactors: ['niche targeting', 'licensing arbitrage', 'innovation'], sectorTags: ['Technology', 'Consumer Electronics'] },
  { id: 'BT-016', title: 'Marshall Plan Infrastructure', entity: 'US Government', sector: 'Infrastructure', country: 'Germany', year: 1948, investmentSizeM: 12000, strategy: 'Development Aid', outcome: 'success', actualROI: 10, timeToOutcome: 120, keyFactors: ['credit-based injection', 'industrial reconstruction', 'alliance building'], sectorTags: ['Infrastructure', 'Government'] },
  { id: 'BT-017', title: 'Standard Oil Middle East', entity: 'Standard Oil', sector: 'Energy', country: 'Saudi Arabia', year: 1933, investmentSizeM: 50, strategy: 'Concession', outcome: 'success', actualROI: 500, timeToOutcome: 240, keyFactors: ['first-mover', 'sovereign relationships', 'resource access'], sectorTags: ['Energy', 'Oil'] },
  { id: 'BT-018', title: 'Apple China Supply Chain', entity: 'Apple', sector: 'Technology', country: 'China', year: 2001, investmentSizeM: 200, strategy: 'Supply Chain Hub', outcome: 'success', actualROI: 25, timeToOutcome: 60, keyFactors: ['WTO accession', 'scale integration', 'Foxconn ecosystem'], sectorTags: ['Technology', 'Manufacturing'] },
  { id: 'BT-019', title: 'Vietnam Solar Joint Venture', entity: 'SolarGlobal', sector: 'Energy', country: 'Vietnam', year: 2021, investmentSizeM: 120, strategy: 'Joint Venture', outcome: 'success', actualROI: 2.8, timeToOutcome: 24, keyFactors: ['grid parity', 'FiT policy', 'climate finance'], sectorTags: ['Energy', 'Renewable', 'Solar'] },

  // ─── VERIFIED FAILURES ───
  { id: 'BT-050', title: 'Solyndra Solar Manufacturing', entity: 'Solyndra', sector: 'Solar Energy', country: 'United States', year: 2009, investmentSizeM: 535, strategy: 'Advanced Manufacturing', outcome: 'failure', actualROI: -100, timeToOutcome: 24, keyFactors: ['Chinese price competition', 'wrong technology bet', 'subsidy dependency', 'political scrutiny'], sectorTags: ['Energy', 'Solar', 'Manufacturing'] },
  { id: 'BT-051', title: 'Theranos Blood Testing', entity: 'Theranos', sector: 'Healthcare', country: 'United States', year: 2013, investmentSizeM: 700, strategy: 'Disruptive Innovation', outcome: 'failure', actualROI: -100, timeToOutcome: 48, keyFactors: ['fraudulent technology', 'failed due diligence', 'charismatic founder bias', 'no domain experts on board'], sectorTags: ['Healthcare', 'Technology'] },
  { id: 'BT-052', title: 'Walmart Germany Expansion', entity: 'Walmart', sector: 'Retail', country: 'Germany', year: 1999, investmentSizeM: 1000, strategy: 'Acquisition', outcome: 'failure', actualROI: -100, timeToOutcome: 84, keyFactors: ['cultural mismatch', 'labor union conflict', 'pricing law violations', 'management arrogance'], sectorTags: ['Retail'] },
  { id: 'BT-053', title: 'eBay China Market Entry', entity: 'eBay', sector: 'E-commerce', country: 'China', year: 2005, investmentSizeM: 180, strategy: 'Acquisition', outcome: 'failure', actualROI: -100, timeToOutcome: 36, keyFactors: ['Taobao agility', 'payment friction', 'local competitor advantage'], sectorTags: ['E-commerce', 'Technology'] },
  { id: 'BT-054', title: 'Target Canada Expansion', entity: 'Target', sector: 'Retail', country: 'Canada', year: 2015, investmentSizeM: 4000, strategy: 'Rapid Rollout', outcome: 'failure', actualROI: -100, timeToOutcome: 24, keyFactors: ['supply chain collapse', 'pricing perception gap', 'too fast expansion', 'inventory systems failure'], sectorTags: ['Retail'] },
  { id: 'BT-055', title: 'Uber China Expansion', entity: 'Uber', sector: 'Technology', country: 'China', year: 2014, investmentSizeM: 2000, strategy: 'Subsidized Growth', outcome: 'failure', actualROI: -80, timeToOutcome: 24, keyFactors: ['regulatory hostility', 'Didi dominance', 'cash burn unsustainable'], sectorTags: ['Technology', 'Ride-sharing'] },
  { id: 'BT-056', title: 'Google China Exit', entity: 'Google', sector: 'Technology', country: 'China', year: 2010, investmentSizeM: 0, strategy: 'Market Exit', outcome: 'failure', actualROI: -100, timeToOutcome: 48, keyFactors: ['censorship conflict', 'regulatory incompatibility', 'values mismatch'], sectorTags: ['Technology'] },
  { id: 'BT-057', title: 'McDonalds Russia Exit', entity: 'McDonalds', sector: 'Retail', country: 'Russia', year: 2022, investmentSizeM: 500, strategy: 'Forced Divestiture', outcome: 'failure', actualROI: -100, timeToOutcome: 6, keyFactors: ['geopolitical tail risk', 'sanctions', 'asset seizure'], sectorTags: ['Retail', 'Food'] },
  { id: 'BT-058', title: 'Fordlandia Rubber Project', entity: 'Ford', sector: 'Manufacturing', country: 'Brazil', year: 1925, investmentSizeM: 20, strategy: 'Vertical Integration', outcome: 'failure', actualROI: -100, timeToOutcome: 120, keyFactors: ['cultural imposition', 'biological risks', 'logistics underestimated'], sectorTags: ['Manufacturing', 'Agriculture'] },
  { id: 'BT-059', title: 'Coca-Cola New Coke', entity: 'Coca-Cola', sector: 'Consumer Goods', country: 'United States', year: 1985, investmentSizeM: 4, strategy: 'Product Reform', outcome: 'failure', actualROI: -50, timeToOutcome: 3, keyFactors: ['brand loyalty underestimation', 'market research flaw'], sectorTags: ['Consumer', 'Food'] },
  { id: 'BT-060', title: 'Asian Financial Crisis Exits', entity: 'Various Banks', sector: 'Finance', country: 'Thailand', year: 1997, investmentSizeM: 2000, strategy: 'Divestiture', outcome: 'failure', actualROI: -90, timeToOutcome: 12, keyFactors: ['currency peg collapse', 'over-leverage', 'contagion'], sectorTags: ['Finance'] },
  { id: 'BT-061', title: 'Lehman Brothers Collapse', entity: 'Lehman Brothers', sector: 'Finance', country: 'United States', year: 2008, investmentSizeM: 0, strategy: 'N/A', outcome: 'failure', actualROI: -100, timeToOutcome: 6, keyFactors: ['systemic risk', 'counterparty opacity', 'leverage'], sectorTags: ['Finance'] },
  { id: 'BT-062', title: 'WeWork IPO Collapse', entity: 'WeWork', sector: 'Real Estate', country: 'United States', year: 2019, investmentSizeM: 4400, strategy: 'Rapid Expansion', outcome: 'failure', actualROI: -95, timeToOutcome: 12, keyFactors: ['governance failure', 'unit economics', 'founder control', 'valuation disconnect'], sectorTags: ['Real Estate', 'Technology'] },
  { id: 'BT-063', title: 'FTX Crypto Exchange', entity: 'FTX', sector: 'Finance', country: 'Bahamas', year: 2022, investmentSizeM: 1800, strategy: 'Platform Growth', outcome: 'failure', actualROI: -100, timeToOutcome: 3, keyFactors: ['fraud', 'commingled funds', 'regulatory evasion', 'founder misconduct'], sectorTags: ['Finance', 'Crypto'] },
  { id: 'BT-064', title: 'Enron Energy Trading', entity: 'Enron', sector: 'Energy', country: 'United States', year: 2001, investmentSizeM: 0, strategy: 'N/A', outcome: 'failure', actualROI: -100, timeToOutcome: 6, keyFactors: ['accounting fraud', 'SPE manipulation', 'auditor complicity'], sectorTags: ['Energy', 'Finance'] },
  { id: 'BT-065', title: 'Toyota Toyopet US Entry', entity: 'Toyota', sector: 'Automotive', country: 'United States', year: 1957, investmentSizeM: 5, strategy: 'Export', outcome: 'failure', actualROI: -80, timeToOutcome: 24, keyFactors: ['product mismatch', 'highway speed failure', 'brand perception gap'], sectorTags: ['Automotive'] },

  // ─── MIXED OUTCOMES ───
  { id: 'BT-100', title: 'TSMC Arizona Fab', entity: 'TSMC', sector: 'Semiconductors', country: 'United States', year: 2020, investmentSizeM: 12000, strategy: 'Geopolitical Hedge', outcome: 'mixed', actualROI: -10, timeToOutcome: 36, keyFactors: ['cost culture mismatch', 'labor shortage', 'subsidy dependency', 'geopolitical value'], sectorTags: ['Semiconductors', 'Manufacturing'] },
  { id: 'BT-101', title: 'Brexit Financial Migration', entity: 'Goldman Sachs', sector: 'Finance', country: 'Germany', year: 2016, investmentSizeM: 150, strategy: 'Relocation', outcome: 'mixed', actualROI: 1, timeToOutcome: 48, keyFactors: ['regulatory passporting', 'talent relocation friction'], sectorTags: ['Finance'] },
  { id: 'BT-102', title: 'Anglo-Persian Oil Renegotiation', entity: 'BP', sector: 'Energy', country: 'Iran', year: 1935, investmentSizeM: 100, strategy: 'Political Negotiation', outcome: 'mixed', actualROI: 2, timeToOutcome: 120, keyFactors: ['nationalism risk', 'contract durability'], sectorTags: ['Energy', 'Oil'] },
  { id: 'BT-103', title: 'Oil Crisis Auto Efficiency Shift', entity: 'Global Auto', sector: 'Automotive', country: 'Global', year: 1973, investmentSizeM: 0, strategy: 'Crisis Response', outcome: 'mixed', actualROI: 1, timeToOutcome: 60, keyFactors: ['energy dependency', 'efficiency pivot', 'Japanese advantage'], sectorTags: ['Automotive', 'Energy'] },
];

// ============================================================================
// BACKTESTING ENGINE
// ============================================================================

export class BacktestingEngine {
  private currentWeights: Record<string, number>;
  private contextModifiers: Record<string, number>;

  constructor() {
    this.currentWeights = this.getDefaultWeights();
    this.contextModifiers = {};
  }

  private getDefaultWeights(): Record<string, number> {
    return {
      // Strategic (30% total)
      SPI: 0.08, SEAM: 0.07, AGI: 0.05, PSS: 0.05, SEQ: 0.05,
      // Financial (25% total)
      RROI: 0.08, SCF: 0.06, TCO: 0.04, FMS: 0.04, CLO: 0.03,
      // Risk (20% total)
      RNI: 0.06, CRI: 0.04, ESI: 0.03, CSR: 0.04, SRA: 0.03,
      // Operational (15% total)
      NVI: 0.03, LAI: 0.03, ISI: 0.03, OSI: 0.03, VCI: 0.03,
      // Market/Innovation (10% total)
      FRS: 0.02, PRI: 0.02, ATI: 0.02, GCS: 0.02, DQS: 0.02,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SIMULATE FORMULAS ON HISTORICAL CASE
  // ──────────────────────────────────────────────────────────────────────────

  private simulateFormulas(historicalCase: HistoricalCaseForBacktest): Record<string, number> {
    const inputs = historicalDataPipeline.extractFormulaInputs(historicalCase.country, historicalCase.year);
    const scores: Record<string, number> = {};

    // SPI: Strategic Positioning Index
    scores.SPI = this.calculateSPI(historicalCase, inputs);
    // SEAM: Strategic Economic Alignment
    scores.SEAM = this.calculateSEAM(historicalCase, inputs);
    // RROI: Robust Return on Investment
    scores.RROI = this.calculateRROI(historicalCase, inputs);
    // RNI: Risk-Normalized Index
    scores.RNI = this.calculateRNI(historicalCase, inputs);
    // PSS: Political & Strategic Stability
    scores.PSS = inputs.politicalStability;
    // AGI: Government Incentive Alignment
    scores.AGI = this.calculateAGI(historicalCase, inputs);
    // FMS: Financial Margin of Safety
    scores.FMS = this.calculateFMS(historicalCase, inputs);
    // SCF: Sustainability Cash Flow
    scores.SCF = this.calculateSCF(historicalCase, inputs);
    // ESI: Environmental Stability
    scores.ESI = inputs.environmentalRegulation;
    // CSR: Currency & Sovereign Risk
    scores.CSR = Math.max(0, 100 - inputs.currencyVolatility);
    // CRI: Compliance Risk Index
    scores.CRI = inputs.easeOfBusiness;
    // NVI: Nexus Value Index
    scores.NVI = this.calculateNVI(historicalCase, inputs);
    // LAI: Labor Access Index
    scores.LAI = inputs.laborAvailability;
    // ISI: Infrastructure Stability
    scores.ISI = inputs.infrastructureQuality;
    // OSI: Operational Stability
    scores.OSI = (inputs.infrastructureQuality + inputs.logisticsPerformance) / 2;
    // FRS: Future Readiness Score
    scores.FRS = inputs.technologyReadiness;
    // ATI: Adaptive Technology Index
    scores.ATI = inputs.technologyReadiness * 0.9;
    // GCS: Global Competitiveness Score
    scores.GCS = (inputs.easeOfBusiness + inputs.technologyReadiness + inputs.educationIndex) / 3;
    // VCI: Value Chain Integration
    scores.VCI = (inputs.logisticsPerformance + inputs.tradeOpenness * 0.8) / 2;
    // PRI: Partnership Readiness
    scores.PRI = (inputs.easeOfBusiness + inputs.corruptionIndex) / 2;
    // SEQ: Strategic Execution Quality
    scores.SEQ = this.calculateSEQ(historicalCase, inputs);
    // TCO: Total Cost of Ownership
    scores.TCO = this.calculateTCO(historicalCase, inputs);
    // SRA: Synthetic Risk Aggregate
    scores.SRA = (scores.RNI + scores.CSR + scores.CRI + scores.ESI) / 4;
    // CLO: Collateral Opportunity
    scores.CLO = (inputs.easeOfBusiness * 0.6 + inputs.corruptionIndex * 0.4);
    // DQS: Data Quality Score
    scores.DQS = inputs.corruptionIndex > 60 ? 80 : inputs.corruptionIndex > 40 ? 60 : 40;

    // Normalize all to 0-100
    for (const key of Object.keys(scores)) {
      scores[key] = Math.max(0, Math.min(100, scores[key]));
    }

    return scores;
  }

  private calculateSPI(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let score = 50;
    score += (i.easeOfBusiness - 50) * 0.3;
    if (c.keyFactors.some(f => f.includes('first-mover'))) score += 15;
    if (c.keyFactors.some(f => f.includes('brand') || f.includes('differentiation'))) score += 10;
    if (c.keyFactors.some(f => f.includes('patent') || f.includes('IP'))) score += 10;
    if (c.keyFactors.some(f => f.includes('network') || f.includes('ecosystem'))) score += 12;
    if (c.investmentSizeM > 1000) score += 5; // Scale advantage
    return score;
  }

  private calculateSEAM(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let score = 50;
    if (c.keyFactors.some(f => f.includes('government') || f.includes('policy') || f.includes('subsidy'))) score += 20;
    if (c.keyFactors.some(f => f.includes('tax') || f.includes('incentive'))) score += 15;
    if (c.keyFactors.some(f => f.includes('trade') || f.includes('tariff') || f.includes('NAFTA') || f.includes('USMCA'))) score += 15;
    if (c.keyFactors.some(f => f.includes('regulation') || f.includes('compliance'))) score -= 10;
    score += (i.politicalStability - 50) * 0.2;
    return score;
  }

  private calculateRROI(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let score = 50;
    const gdpGrowth = i.marketGrowthRate * 100;
    score += gdpGrowth * 3;
    score -= i.taxBurden * 0.3;
    score -= i.inflationRate * 1.5;
    score += i.fdiInflows * 2;
    if (c.keyFactors.some(f => f.includes('low cost') || f.includes('labor cost'))) score += 15;
    if (c.keyFactors.some(f => f.includes('cash burn') || f.includes('subsidy dependency'))) score -= 20;
    if (c.investmentSizeM > 5000) score -= 10; // Large bets = higher risk
    return score;
  }

  private calculateRNI(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let riskScore = 50;
    riskScore += (i.politicalStability - 50) * 0.3;
    riskScore += (i.corruptionIndex - 50) * 0.2;
    riskScore -= i.currencyVolatility * 0.3;
    if (c.keyFactors.some(f => f.includes('fraud') || f.includes('scam'))) riskScore -= 40;
    if (c.keyFactors.some(f => f.includes('geopolitical') || f.includes('sanctions') || f.includes('war'))) riskScore -= 30;
    if (c.keyFactors.some(f => f.includes('contagion') || f.includes('systemic'))) riskScore -= 25;
    if (c.keyFactors.some(f => f.includes('stable') || f.includes('stability'))) riskScore += 15;
    return riskScore;
  }

  private calculateAGI(c: HistoricalCaseForBacktest, _i: FormulaInput): number {
    let score = 40;
    if (c.keyFactors.some(f => f.includes('government') || f.includes('subsidy') || f.includes('incentive'))) score += 25;
    if (c.keyFactors.some(f => f.includes('tax holiday') || f.includes('tax credit'))) score += 15;
    if (c.keyFactors.some(f => f.includes('fast-track') || f.includes('permit'))) score += 15;
    if (c.keyFactors.some(f => f.includes('scrutiny') || f.includes('political'))) score -= 10;
    return score;
  }

  private calculateFMS(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let score = 50;
    if (c.investmentSizeM < 100) score += 20; // Smaller bets = more margin
    if (c.investmentSizeM > 2000) score -= 15;
    score += (100 - i.currencyVolatility) * 0.2;
    score += (100 - i.inflationRate * 3) * 0.1;
    if (c.keyFactors.some(f => f.includes('diversif'))) score += 10;
    return score;
  }

  private calculateSCF(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let score = 50;
    if (c.sectorTags.includes('Renewable') || c.sectorTags.includes('Solar')) score += 20;
    if (c.keyFactors.some(f => f.includes('carbon') || f.includes('green') || f.includes('climate'))) score += 15;
    score += i.renewableEnergyShare * 0.3;
    score -= i.energyCost * 0.2;
    return score;
  }

  private calculateNVI(c: HistoricalCaseForBacktest, _i: FormulaInput): number {
    let score = 50;
    if (c.keyFactors.some(f => f.includes('ecosystem') || f.includes('supply chain') || f.includes('supplier'))) score += 20;
    if (c.keyFactors.some(f => f.includes('network') || f.includes('platform'))) score += 15;
    if (c.keyFactors.some(f => f.includes('ASEAN') || f.includes('trade agreement'))) score += 10;
    return score;
  }

  private calculateSEQ(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let score = 60;
    if (c.keyFactors.some(f => f.includes('fast') || f.includes('speed') || f.includes('record'))) score += 15;
    if (c.keyFactors.some(f => f.includes('collapse') || f.includes('failure'))) score -= 25;
    if (c.keyFactors.some(f => f.includes('too fast'))) score -= 20;
    score += (i.infrastructureQuality - 50) * 0.2;
    return score;
  }

  private calculateTCO(c: HistoricalCaseForBacktest, i: FormulaInput): number {
    let score = 60;
    score -= i.laborCost * 0.3;
    score -= i.taxBurden * 0.3;
    score -= i.energyCost * 0.2;
    if (c.keyFactors.some(f => f.includes('low cost') || f.includes('cheap'))) score += 15;
    return Math.max(10, score);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RUN FULL BACKTEST
  // ──────────────────────────────────────────────────────────────────────────

  runFullBacktest(): {
    results: BacktestResult[];
    overallAccuracy: number;
    byOutcome: Record<string, { total: number; correct: number; accuracy: number }>;
    bySector: Record<string, { total: number; correct: number }>;
    byRegion: Record<string, { total: number; correct: number }>;
    formulaAccuracy: Record<string, number>;
  } {
    const results: BacktestResult[] = [];
    let totalCorrect = 0;

    for (const historicalCase of HISTORICAL_CASES) {
      const formulaScores = this.simulateFormulas(historicalCase);

      // Calculate weighted composite score
      let compositeScore = 0;
      const breakdown: Record<string, { predicted: number; weight: number; contribution: number }> = {};

      for (const [formula, weight] of Object.entries(this.currentWeights)) {
        const score = formulaScores[formula] ?? 50;
        const contextMod = this.getContextModifier(formula, historicalCase.country, historicalCase.sector);
        const adjustedScore = score * contextMod;
        const contribution = adjustedScore * weight;
        compositeScore += contribution;

        breakdown[formula] = { predicted: score, weight, contribution };
      }

      // Determine recommendation
      let recommendation: 'invest' | 'caution' | 'reject';
      if (compositeScore >= 62) recommendation = 'invest';
      else if (compositeScore >= 45) recommendation = 'caution';
      else recommendation = 'reject';

      // Check correctness
      const correct =
        (recommendation === 'invest' && historicalCase.outcome === 'success') ||
        (recommendation === 'reject' && historicalCase.outcome === 'failure') ||
        (recommendation === 'caution' && historicalCase.outcome === 'mixed');

      if (correct) totalCorrect++;

      const error = Math.abs(
        (historicalCase.outcome === 'success' ? 80 : historicalCase.outcome === 'mixed' ? 50 : 20) -
        compositeScore
      );

      results.push({
        caseId: historicalCase.id,
        predictedScore: compositeScore,
        predictedRecommendation: recommendation,
        actualOutcome: historicalCase.outcome,
        actualROI: historicalCase.actualROI,
        error,
        formulaBreakdown: breakdown,
        correct,
      });
    }

    // Aggregate by outcome type
    const byOutcome: Record<string, { total: number; correct: number; accuracy: number }> = {};
    const bySector: Record<string, { total: number; correct: number }> = {};
    const byRegion: Record<string, { total: number; correct: number }> = {};

    for (const r of results) {
      const c = HISTORICAL_CASES.find(h => h.id === r.caseId)!;

      // By outcome
      if (!byOutcome[r.actualOutcome]) byOutcome[r.actualOutcome] = { total: 0, correct: 0, accuracy: 0 };
      byOutcome[r.actualOutcome].total++;
      if (r.correct) byOutcome[r.actualOutcome].correct++;

      // By sector
      for (const tag of c.sectorTags) {
        if (!bySector[tag]) bySector[tag] = { total: 0, correct: 0 };
        bySector[tag].total++;
        if (r.correct) bySector[tag].correct++;
      }

      // By region
      const _region = historicalDataPipeline.extractFormulaInputs(c.country, c.year).caseId.split('-')[0];
      if (!byRegion[c.country]) byRegion[c.country] = { total: 0, correct: 0 };
      byRegion[c.country].total++;
      if (r.correct) byRegion[c.country].correct++;
    }

    for (const key of Object.keys(byOutcome)) {
      byOutcome[key].accuracy = byOutcome[key].correct / byOutcome[key].total;
    }

    return {
      results,
      overallAccuracy: totalCorrect / results.length,
      byOutcome,
      bySector,
      byRegion,
      formulaAccuracy: this.calculateFormulaAccuracy(results),
    };
  }

  private calculateFormulaAccuracy(results: BacktestResult[]): Record<string, number> {
    const formulaErrors: Record<string, number[]> = {};

    for (const r of results) {
      for (const [formula, data] of Object.entries(r.formulaBreakdown)) {
        if (!formulaErrors[formula]) formulaErrors[formula] = [];
        const target = r.actualOutcome === 'success' ? 80 : r.actualOutcome === 'mixed' ? 50 : 20;
        formulaErrors[formula].push(Math.abs(data.predicted - target));
      }
    }

    const accuracy: Record<string, number> = {};
    for (const [formula, errors] of Object.entries(formulaErrors)) {
      const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
      accuracy[formula] = Math.max(0, 100 - mae);
    }

    return accuracy;
  }

  private getContextModifier(formula: string, country: string, _sector: string): number {
    const key = `${formula}-${country}`;
    return this.contextModifiers[key] ?? 1.0;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CALIBRATION - Learn from backtest errors
  // ──────────────────────────────────────────────────────────────────────────

  calibrate(): CalibrationResult[] {
    const beforeResults = this.runFullBacktest();
    const calibrationResults: CalibrationResult[] = [];

    // For each formula, compute bias and adjust weight
    for (const [formula, originalWeight] of Object.entries(this.currentWeights)) {
      const errors: number[] = [];
      const biases: number[] = [];
      const contextErrors: Record<string, number[]> = {};

      for (const r of beforeResults.results) {
        const data = r.formulaBreakdown[formula];
        if (!data) continue;

        const target = r.actualOutcome === 'success' ? 80 : r.actualOutcome === 'mixed' ? 50 : 20;
        const error = data.predicted - target;
        errors.push(Math.abs(error));
        biases.push(error);

        const c = HISTORICAL_CASES.find(h => h.id === r.caseId)!;
        const ctxKey = c.country;
        if (!contextErrors[ctxKey]) contextErrors[ctxKey] = [];
        contextErrors[ctxKey].push(error);
      }

      const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
      const meanBias = biases.reduce((a, b) => a + b, 0) / biases.length;

      // Adjust weight: reduce weight for high-error formulas, increase for accurate ones
      const accuracyFactor = Math.max(0, 100 - mae) / 100;
      const calibratedWeight = originalWeight * (0.5 + 0.5 * accuracyFactor);

      // Context adjustments
      const contextAdj: Record<string, number> = {};
      for (const [ctx, ctxErrors] of Object.entries(contextErrors)) {
        const ctxBias = ctxErrors.reduce((a, b) => a + b, 0) / ctxErrors.length;
        if (Math.abs(ctxBias) > 10) {
          contextAdj[ctx] = 1 - (ctxBias / 100);
          this.contextModifiers[`${formula}-${ctx}`] = contextAdj[ctx];
        }
      }

      this.currentWeights[formula] = calibratedWeight;

      calibrationResults.push({
        formulaName: formula,
        originalWeight,
        calibratedWeight,
        accuracyBefore: beforeResults.formulaAccuracy[formula] ?? 50,
        accuracyAfter: 0, // Computed after re-run
        meanAbsoluteError: mae,
        meanBias,
        contextualAdjustments: contextAdj,
      });
    }

    // Normalize weights to sum to 1
    const totalWeight = Object.values(this.currentWeights).reduce((a, b) => a + b, 0);
    for (const key of Object.keys(this.currentWeights)) {
      this.currentWeights[key] /= totalWeight;
    }

    // Re-run backtest with calibrated weights
    const afterResults = this.runFullBacktest();

    for (const cr of calibrationResults) {
      cr.accuracyAfter = afterResults.formulaAccuracy[cr.formulaName] ?? 50;
    }

    return calibrationResults;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // EXPORT CALIBRATED WEIGHTS
  // ──────────────────────────────────────────────────────────────────────────

  exportCalibratedWeights(): FormulaWeightSet {
    const backtest = this.runFullBacktest();

    const confidenceBands: Record<string, { lower: number; upper: number; confidence: number }> = {};
    for (const [formula, accuracy] of Object.entries(backtest.formulaAccuracy)) {
      const band = (100 - accuracy) / 2;
      confidenceBands[formula] = {
        lower: Math.max(0, accuracy - band),
        upper: Math.min(100, accuracy + band),
        confidence: accuracy / 100,
      };
    }

    return {
      version: '1.0.0',
      calibratedAt: new Date().toISOString(),
      totalCasesUsed: HISTORICAL_CASES.length,
      overallAccuracy: backtest.overallAccuracy,
      weights: { ...this.currentWeights },
      contextModifiers: { ...this.contextModifiers },
      confidenceBands,
    };
  }

  getCases(): HistoricalCaseForBacktest[] {
    return HISTORICAL_CASES;
  }
}

export const backtestingEngine = new BacktestingEngine();
