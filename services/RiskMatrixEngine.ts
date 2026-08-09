// ─────────────────────────────────────────────────────────────────────────────
// RiskMatrixEngine.ts  -  Programmatic likelihood x impact risk matrix builder
// ─────────────────────────────────────────────────────────────────────────────
// Fills the gap identified in the codebase audit: no programmatic risk matrix
// computation engine existed (only AI prompt templates and static text).
// This builds a real 5x5 risk matrix, scores risks, computes aggregate
// exposure, and produces heat-map data consumable by the frontend and AI.
// ─────────────────────────────────────────────────────────────────────────────

export type LikelihoodLevel = 1 | 2 | 3 | 4 | 5;
export type ImpactLevel = 1 | 2 | 3 | 4 | 5;
export type RiskSeverity = 'negligible' | 'low' | 'moderate' | 'high' | 'critical';
export type RiskCategory = 'market' | 'operational' | 'financial' | 'legal' | 'regulatory' | 'political' | 'technical' | 'reputational' | 'environmental' | 'relationship';

export interface RiskEntry {
  id: string;
  name: string;
  category: RiskCategory;
  description: string;
  likelihood: LikelihoodLevel;      // 1=Rare .. 5=Almost Certain
  impact: ImpactLevel;              // 1=Negligible .. 5=Catastrophic
  score: number;                    // likelihood * impact (1-25)
  severity: RiskSeverity;
  impactUSD: number;                // estimated financial impact
  expectedLoss: number;             // probability-weighted loss
  mitigationStrategy: string;
  residualLikelihood: LikelihoodLevel;
  residualImpact: ImpactLevel;
  residualScore: number;
  residualSeverity: RiskSeverity;
  owner: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'transferred';
}

export interface MatrixCell {
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  score: number;
  severity: RiskSeverity;
  risks: string[];   // risk IDs in this cell
}

export interface RiskMatrixResult {
  /** 5x5 matrix grid (25 cells) */
  matrix: MatrixCell[][];
  /** All assessed risks */
  risks: RiskEntry[];
  /** Aggregate metrics */
  aggregate: {
    totalRisks: number;
    criticalCount: number;
    highCount: number;
    moderateCount: number;
    lowCount: number;
    negligibleCount: number;
    totalExposureUSD: number;
    expectedLossUSD: number;
    averageScore: number;
    riskConcentration: string;   // category with most risk
  };
  /** Top 5 risks by score */
  topRisks: RiskEntry[];
  /** Heat-map data for frontend rendering */
  heatMap: Array<{ x: number; y: number; value: number; label: string }>;
  computedAt: string;
}

// ── Severity mapping: score (1-25) -> severity label ──────────────────────

const SEVERITY_THRESHOLDS: Array<[number, RiskSeverity]> = [
  [20, 'critical'],     // 20-25
  [12, 'high'],         // 12-19
  [6, 'moderate'],      // 6-11
  [3, 'low'],           // 3-5
  [0, 'negligible'],    // 1-2
];

const LIKELIHOOD_LABELS = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const IMPACT_LABELS = ['', 'Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

// ── Probability mapping for expected loss calculation ─────────────────────
const LIKELIHOOD_PROBABILITY: Record<LikelihoodLevel, number> = {
  1: 0.05,   // 5%
  2: 0.15,   // 15%
  3: 0.35,   // 35%
  4: 0.65,   // 65%
  5: 0.90,   // 90%
};

// ── Country/sector risk factor library ────────────────────────────────────

interface RiskFactorTemplate {
  name: string;
  category: RiskCategory;
  description: string;
  baseLikelihood: LikelihoodLevel;
  baseImpact: ImpactLevel;
  mitigation: string;
}

const SECTOR_RISK_TEMPLATES: Record<string, RiskFactorTemplate[]> = {
  default: [
    { name: 'Currency Volatility', category: 'financial', description: 'Exchange rate fluctuations eroding margins or investment value', baseLikelihood: 3, baseImpact: 3, mitigation: 'Hedging instruments, multi-currency treasury, natural hedge via local revenue' },
    { name: 'Regulatory Change', category: 'regulatory', description: 'New regulations increasing compliance burden or restricting operations', baseLikelihood: 3, baseImpact: 4, mitigation: 'Regulatory monitoring, government engagement, compliance buffer in budget' },
    { name: 'Political Instability', category: 'political', description: 'Government change, civil unrest, or policy reversal affecting business continuity', baseLikelihood: 2, baseImpact: 5, mitigation: 'Political risk insurance, diversified operations, government relationship management' },
    { name: 'Talent Acquisition', category: 'operational', description: 'Inability to hire or retain qualified workforce at target location', baseLikelihood: 3, baseImpact: 3, mitigation: 'Pre-arrival recruitment, university partnerships, competitive compensation benchmarking' },
    { name: 'Supply Chain Disruption', category: 'operational', description: 'Supplier failures, logistics bottlenecks, or import restrictions', baseLikelihood: 3, baseImpact: 4, mitigation: 'Dual-sourcing strategy, safety stock, local supplier development' },
    { name: 'Market Entry Barriers', category: 'market', description: 'Established competitors, distribution challenges, or customer acquisition costs exceeding projections', baseLikelihood: 3, baseImpact: 3, mitigation: 'Local partnerships, phased market entry, pilot program before full commitment' },
    { name: 'IP / Data Protection', category: 'legal', description: 'Weak IP enforcement or data sovereignty requirements', baseLikelihood: 2, baseImpact: 4, mitigation: 'IP registration pre-entry, data localization architecture, legal counsel engagement' },
    { name: 'Infrastructure Gaps', category: 'technical', description: 'Power reliability, internet connectivity, or logistics infrastructure below requirements', baseLikelihood: 2, baseImpact: 3, mitigation: 'Backup power, redundant connectivity, infrastructure audit pre-commitment' },
    { name: 'Reputational Risk', category: 'reputational', description: 'ESG concerns, labor practice scrutiny, or partner misconduct damaging brand', baseLikelihood: 2, baseImpact: 4, mitigation: 'ESG due diligence, partner vetting, crisis communication plan' },
    { name: 'Contract Enforcement', category: 'legal', description: 'Judicial system delays or difficulty enforcing contracts in target jurisdiction', baseLikelihood: 2, baseImpact: 3, mitigation: 'Arbitration clauses, escrow mechanisms, legal jurisdiction selection' },
  ],
  manufacturing: [
    { name: 'Environmental Compliance', category: 'environmental', description: 'Emissions standards, waste disposal regulations, or carbon tax exposure', baseLikelihood: 3, baseImpact: 4, mitigation: 'Environmental impact assessment, clean technology investment, compliance monitoring' },
    { name: 'Raw Material Price Volatility', category: 'financial', description: 'Input cost fluctuations reducing margins', baseLikelihood: 4, baseImpact: 3, mitigation: 'Long-term supply contracts, commodity hedging, alternative material sourcing' },
  ],
  technology: [
    { name: 'Cybersecurity Breach', category: 'technical', description: 'Data breach, ransomware, or system compromise', baseLikelihood: 3, baseImpact: 5, mitigation: 'SOC/SIEM deployment, penetration testing, incident response plan, cyber insurance' },
    { name: 'Technology Obsolescence', category: 'technical', description: 'Platform or technology becoming outdated faster than planned', baseLikelihood: 3, baseImpact: 3, mitigation: 'Modular architecture, continuous R&D investment, technology roadmap reviews' },
  ],
  finance: [
    { name: 'Credit / Counterparty Risk', category: 'financial', description: 'Default by key counterparties or borrowers', baseLikelihood: 3, baseImpact: 4, mitigation: 'Credit risk assessment framework, collateral requirements, portfolio diversification' },
    { name: 'AML / KYC Compliance', category: 'regulatory', description: 'Anti-money laundering or sanctions compliance failures', baseLikelihood: 2, baseImpact: 5, mitigation: 'Automated AML screening, transaction monitoring, compliance officer appointment' },
  ],
};

export class RiskMatrixEngine {

  // ── Severity from score ─────────────────────────────────────────────────

  static scoreSeverity(score: number): RiskSeverity {
    for (const [threshold, severity] of SEVERITY_THRESHOLDS) {
      if (score >= threshold) return severity;
    }
    return 'negligible';
  }

  // ── Build a single risk entry ───────────────────────────────────────────

  static assessRisk(
    template: RiskFactorTemplate,
    investmentUSD: number,
    politicalStabilityScore: number,  // 0-100
    index: number,
  ): RiskEntry {
    // Adjust likelihood based on political stability
    let adjustedLikelihood = template.baseLikelihood;
    if (template.category === 'political' || template.category === 'regulatory') {
      if (politicalStabilityScore < 40) adjustedLikelihood = Math.min(5, adjustedLikelihood + 1) as LikelihoodLevel;
      else if (politicalStabilityScore > 75) adjustedLikelihood = Math.max(1, adjustedLikelihood - 1) as LikelihoodLevel;
    }

    const score = adjustedLikelihood * template.baseImpact;
    const severity = this.scoreSeverity(score);

    // Financial impact scales with investment size and impact level
    const impactMultipliers: Record<ImpactLevel, number> = { 1: 0.01, 2: 0.05, 3: 0.15, 4: 0.30, 5: 0.60 };
    const impactUSD = investmentUSD * (impactMultipliers[template.baseImpact] ?? 0.10);
    const expectedLoss = impactUSD * LIKELIHOOD_PROBABILITY[adjustedLikelihood];

    // Residual risk assumes mitigation reduces both by 1 level (floor 1)
    const residualLikelihood = Math.max(1, adjustedLikelihood - 1) as LikelihoodLevel;
    const residualImpact = Math.max(1, template.baseImpact - 1) as ImpactLevel;
    const residualScore = residualLikelihood * residualImpact;

    return {
      id: `RISK-${String(index + 1).padStart(3, '0')}`,
      name: template.name,
      category: template.category,
      description: template.description,
      likelihood: adjustedLikelihood,
      impact: template.baseImpact,
      score,
      severity,
      impactUSD: +impactUSD.toFixed(0),
      expectedLoss: +expectedLoss.toFixed(0),
      mitigationStrategy: template.mitigation,
      residualLikelihood,
      residualImpact,
      residualScore,
      residualSeverity: this.scoreSeverity(residualScore),
      owner: 'Project Lead',
      status: 'assessed',
    };
  }

  // ── Build the 5x5 matrix ───────────────────────────────────────────────

  static buildMatrix(risks: RiskEntry[]): MatrixCell[][] {
    const matrix: MatrixCell[][] = [];

    for (let l = 1; l <= 5; l++) {
      const row: MatrixCell[] = [];
      for (let i = 1; i <= 5; i++) {
        const score = l * i;
        const matchingRisks = risks
          .filter(r => r.likelihood === l && r.impact === i)
          .map(r => r.id);
        row.push({
          likelihood: l as LikelihoodLevel,
          impact: i as ImpactLevel,
          score,
          severity: this.scoreSeverity(score),
          risks: matchingRisks,
        });
      }
      matrix.push(row);
    }

    return matrix;
  }

  // ── Generate heat-map data ──────────────────────────────────────────────

  static generateHeatMap(matrix: MatrixCell[][]): Array<{ x: number; y: number; value: number; label: string }> {
    const points: Array<{ x: number; y: number; value: number; label: string }> = [];
    for (const row of matrix) {
      for (const cell of row) {
        if (cell.risks.length > 0) {
          points.push({
            x: cell.impact,
            y: cell.likelihood,
            value: cell.score * cell.risks.length,
            label: `${LIKELIHOOD_LABELS[cell.likelihood]} x ${IMPACT_LABELS[cell.impact]}: ${cell.risks.length} risk(s)`,
          });
        }
      }
    }
    return points;
  }

  // ── Full risk matrix computation ────────────────────────────────────────

  /**
   * Main entry point: build complete risk matrix for a deal/project.
   * Consumed by BrainIntegrationService.
   */
  static computeRiskMatrix(params: {
    investmentUSD: number;
    country?: string;
    sector?: string;
    politicalStabilityScore?: number;  // 0-100 from CompositeScoreService
  }): RiskMatrixResult {
    const {
      investmentUSD,
      sector,
      politicalStabilityScore = 50,
    } = params;

    // Collect applicable risk templates
    const templates: RiskFactorTemplate[] = [...SECTOR_RISK_TEMPLATES.default];
    const sectorKey = (sector ?? '').toLowerCase();
    if (sectorKey.includes('manufactur') || sectorKey.includes('industrial')) {
      templates.push(...SECTOR_RISK_TEMPLATES.manufacturing);
    }
    if (sectorKey.includes('tech') || sectorKey.includes('software') || sectorKey.includes('digital')) {
      templates.push(...SECTOR_RISK_TEMPLATES.technology);
    }
    if (sectorKey.includes('financ') || sectorKey.includes('bank') || sectorKey.includes('insur')) {
      templates.push(...SECTOR_RISK_TEMPLATES.finance);
    }

    // Assess each risk
    const risks = templates.map((t, i) => this.assessRisk(t, investmentUSD, politicalStabilityScore, i));

    // Build matrix
    const matrix = this.buildMatrix(risks);
    const heatMap = this.generateHeatMap(matrix);

    // Aggregate
    const criticalCount = risks.filter(r => r.severity === 'critical').length;
    const highCount = risks.filter(r => r.severity === 'high').length;
    const moderateCount = risks.filter(r => r.severity === 'moderate').length;
    const lowCount = risks.filter(r => r.severity === 'low').length;
    const negligibleCount = risks.filter(r => r.severity === 'negligible').length;
    const totalExposureUSD = risks.reduce((s, r) => s + r.impactUSD, 0);
    const expectedLossUSD = risks.reduce((s, r) => s + r.expectedLoss, 0);
    const averageScore = risks.length > 0 ? +(risks.reduce((s, r) => s + r.score, 0) / risks.length).toFixed(1) : 0;

    // Find concentration
    const catCounts: Record<string, number> = {};
    for (const r of risks) {
      catCounts[r.category] = (catCounts[r.category] ?? 0) + r.score;
    }
    const riskConcentration = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown';

    // Top 5 by score
    const topRisks = [...risks].sort((a, b) => b.score - a.score).slice(0, 5);

    return {
      matrix,
      risks,
      aggregate: {
        totalRisks: risks.length,
        criticalCount,
        highCount,
        moderateCount,
        lowCount,
        negligibleCount,
        totalExposureUSD: +totalExposureUSD.toFixed(0),
        expectedLossUSD: +expectedLossUSD.toFixed(0),
        averageScore,
        riskConcentration,
      },
      topRisks,
      heatMap,
      computedAt: new Date().toISOString(),
    };
  }

  // ── Prompt formatting ───────────────────────────────────────────────────

  static formatForPrompt(result: RiskMatrixResult): string {
    const lines: string[] = [
      '### RISK MATRIX ENGINE (5x5 Likelihood x Impact)',
      `Total Risks: ${result.aggregate.totalRisks} | Critical: ${result.aggregate.criticalCount} | High: ${result.aggregate.highCount} | Moderate: ${result.aggregate.moderateCount}`,
      `Total Exposure: $${(result.aggregate.totalExposureUSD / 1_000_000).toFixed(2)}M | Expected Loss: $${(result.aggregate.expectedLossUSD / 1_000_000).toFixed(2)}M`,
      `Risk Concentration: ${result.aggregate.riskConcentration} | Avg Score: ${result.aggregate.averageScore}/25`,
      '',
      '**Top 5 Risks**:',
    ];

    for (const r of result.topRisks) {
      lines.push(`  ${r.id} ${r.name} [${r.severity.toUpperCase()}] L${r.likelihood}xI${r.impact}=${r.score} | $${(r.impactUSD / 1_000_000).toFixed(2)}M exposure`);
      lines.push(`    Mitigation: ${r.mitigationStrategy}`);
      lines.push(`    Residual: L${r.residualLikelihood}xI${r.residualImpact}=${r.residualScore} [${r.residualSeverity}]`);
    }

    return lines.join('\n');
  }
}
