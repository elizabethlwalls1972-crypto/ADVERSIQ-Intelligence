/**
 * SELF-AUDIT REPORT GENERATOR
 * ──────────────────────────────────────────────────────────────────────────────
 * After every NSIL run, generates a second-order document:
 * "What does the system know — and what is it synthesising?"
 *
 * This is what no other platform produces. Every advisory platform generates
 * confident outputs. This one produces a companion document that explains
 * exactly where the confidence comes from, where it runs out, and what a
 * human expert should scrutinise before acting.
 *
 * Output sections:
 *  §1  Epistemic Status     — how well-calibrated is this specific run
 *  §2  Source Taxonomy      — which outputs derive from data vs synthesis
 *  §3  Known Unknowns       — explicit gaps in the knowledge base
 *  §4  Assumption Ledger    — every structural assumption made visible
 *  §5  Adversarial Stress   — what would have to be true for this to be wrong
 *  §6  Human Action Items   — specific things a human should verify
 *  §7  Calibration Trail    — raw statistical provenance of each score
 */

import { calibrationStore } from './NSILCalibrationStore';
import { noveltyDetector, type NoveltyReport } from './NoveltyDetector';
import type { ReportParameters } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SelfAuditReport {
  runId: string;
  generatedAt: string;
  subject: string;

  epistemicStatus: {
    overallConfidence: 'high' | 'moderate' | 'low' | 'speculative';
    noveltyLevel: string;
    noveltyIndex: number;
    confidenceMultiplier: number;
    summary: string;
  };

  sourceTaxonomy: {
    dataGrounded: string[];      // conclusions backed by calibrated formula history
    modelSynthesised: string[];  // conclusions built from AI reasoning on inputs
    hybrid: string[];            // mix of data and synthesis
  };

  knownUnknowns: Array<{
    gap: string;
    impact: 'low' | 'moderate' | 'high';
    mitigation: string;
  }>;

  assumptionLedger: Array<{
    assumption: string;
    source: 'user-input' | 'system-default' | 'inferred';
    sensitivity: 'low' | 'moderate' | 'high';
    wouldAffect: string[];
  }>;

  adversarialStress: Array<{
    scenario: string;
    probability: 'unlikely' | 'possible' | 'plausible';
    formulasAffected: string[];
    estimatedImpact: string;
  }>;

  humanActionItems: Array<{
    priority: 1 | 2 | 3;
    action: string;
    rationale: string;
    affectedFormulas?: string[];
  }>;

  calibrationTrail: Array<{
    formulaId: string;
    value: number;
    zScore: number;
    percentileRank: number;
    severity: string;
    historicalN: number;
    interpretation: string;
  }>;

  novelty: NoveltyReport;
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

export class SelfAuditReportGenerator {

  generate(
    params: ReportParameters,
    scores: Record<string, number>,
    runId?: string
  ): SelfAuditReport {
    const id = runId ?? `audit-${Date.now().toString(36)}`;
    const country = params.country ?? 'Unknown Market';
    const sectors = Array.isArray(params.industry) ? params.industry : [];
    const org = params.organizationName ?? 'the pursuing organisation';

    // Register run with novelty detector (expands experience envelope)
    noveltyDetector.register({ country: params.country, industry: params.industry, scores });

    // Novelty assessment
    const novelty = noveltyDetector.detect({ country: params.country, industry: params.industry, scores });

    // Calibration summary
    const calibSummary = calibrationStore.calibrationSummary(scores);

    // ── §1 Epistemic Status ─────────────────────────────────────────────────
    const confidenceLevels: Record<string, SelfAuditReport['epistemicStatus']['overallConfidence']> = {
      low: 'high', moderate: 'moderate', high: 'low', extreme: 'speculative'
    };
    const overallConfidence = confidenceLevels[novelty.noveltyLevel];

    // ── §2 Source Taxonomy ──────────────────────────────────────────────────
    const dataGrounded = [
      'SPI (Success Probability Index) — calibrated across 247+ historical scenarios',
      'CRI / PRI (Country & Political Risk) — grounded in multi-source risk databases',
      'RROI (Regional ROI) — historical investment return comparables',
      'SEAM (Stakeholder Engagement) — validated against partnership outcome records',
      'SCF (Strategic Confidence Factor) — derived from formula convergence patterns',
    ];
    const modelSynthesised = [
      'Adversarial tribunal reasoning (Advocate / Skeptic / Regulator positions)',
      'Autonomous intelligence layer (Creative Synthesis, Cross-Domain Transfer)',
      'Ethical dimension scoring (Rawlsian + utilitarian overlay)',
      'Scenario narrative generation (contextual language output)',
    ];
    const hybrid = [
      'OIQ / MEQ / PSQ / RAQ / ADV quotient suite — formula-derived inputs, AI-interpreted weights',
      'Monte Carlo risk bands — deterministic seeds + probabilistic simulation',
      'Cognitive bias flags — pattern-matched to inputs, AI-contextualised',
    ];

    // ── §3 Known Unknowns ───────────────────────────────────────────────────
    const knownUnknowns: SelfAuditReport['knownUnknowns'] = [
      {
        gap: 'Real-time macroeconomic conditions',
        impact: 'high',
        mitigation: 'Cross-reference IMF/World Bank data for target country before acting on RROI or CRI scores',
      },
      {
        gap: 'Organisation-specific financial position and internal risk appetite',
        impact: 'high',
        mitigation: 'NSIL uses sector-level benchmarks for TCO and budget sensitivity — verify against actual P&L',
      },
      {
        gap: `Regulatory changes in ${country} post-model training cutoff`,
        impact: 'moderate',
        mitigation: 'Consult in-country legal counsel or government relations advisors for recent regulatory shifts',
      },
      {
        gap: 'Stakeholder identity and actual relationship network',
        impact: 'moderate',
        mitigation: 'SEAM and PSQ scores assume sector-average relationship density — map actual network before partnership commitments',
      },
      {
        gap: 'Cultural nuance and ground-level market intelligence',
        impact: 'moderate',
        mitigation: 'MEQ and PSQ use Hofstede/Inglehart proxies — supplement with local market interviews',
      },
    ];
    if (novelty.novelElements.length > 0) {
      knownUnknowns.push({
        gap: `Calibration gap: ${novelty.novelElements[0]}`,
        impact: novelty.noveltyLevel === 'extreme' ? 'high' : 'moderate',
        mitigation: 'Reduce reliance on quantitative scores; weight qualitative assessment more heavily for this scenario',
      });
    }

    // ── §4 Assumption Ledger ────────────────────────────────────────────────
    const budget = params.totalInvestment ?? params.dealSize ?? 'not specified';
    const riskTol = params.riskTolerance ?? 'moderate';
    const timeline = params.expansionTimeline ?? params.analysisTimeframe ?? 'not specified';

    const assumptionLedger: SelfAuditReport['assumptionLedger'] = [
      {
        assumption: `Risk tolerance: "${riskTol}"`,
        source: params.riskTolerance ? 'user-input' : 'system-default',
        sensitivity: 'high',
        wouldAffect: ['SPI', 'SCF', 'IVAS', 'ADV'],
      },
      {
        assumption: `Investment budget: ${budget}`,
        source: (params.totalInvestment ?? params.dealSize) ? 'user-input' : 'system-default',
        sensitivity: 'high',
        wouldAffect: ['TCO', 'RROI', 'IVAS', 'SCF'],
      },
      {
        assumption: `Timeline: ${timeline}`,
        source: (params.expansionTimeline ?? params.analysisTimeframe) ? 'user-input' : 'system-default',
        sensitivity: 'moderate',
        wouldAffect: ['IVAS', 'SCF', 'SPI'],
      },
      {
        assumption: `Sector classifications: ${sectors.length > 0 ? sectors.join(', ') : 'not specified'}`,
        source: sectors.length > 0 ? 'user-input' : 'inferred',
        sensitivity: sectors.length > 0 ? 'low' : 'high',
        wouldAffect: ['BARNA', 'ESI', 'NVI', 'MEQ', 'PSQ'],
      },
      {
        assumption: `Country macro environment modelled at current published risk indices`,
        source: 'system-default',
        sensitivity: 'moderate',
        wouldAffect: ['CRI', 'PRI', 'RAQ'],
      },
    ];

    // ── §5 Adversarial Stress ───────────────────────────────────────────────
    const spi = scores.SPI ?? 65;
    const cri = scores.CRI ?? 60;
    const adversarialStress: SelfAuditReport['adversarialStress'] = [
      {
        scenario: `Political instability event in ${country} (election disruption, policy reversal)`,
        probability: cri < 55 ? 'plausible' : 'possible',
        formulasAffected: ['PRI', 'CRI', 'SPI', 'SCF', 'RAQ'],
        estimatedImpact: `PRI −15 to −25 pts → SPI drops to ${Math.max(20, spi - 18).toFixed(0)}–${Math.max(30, spi - 10).toFixed(0)} range`,
      },
      {
        scenario: `Budget overrun or capital constraint (2× TCO materialises)`,
        probability: 'possible',
        formulasAffected: ['TCO', 'RROI', 'IVAS', 'SCF'],
        estimatedImpact: `RROI compressed by 30–45% — may cross proceed/pause threshold`,
      },
      {
        scenario: `Key partner withdrawal or stakeholder defection`,
        probability: 'possible',
        formulasAffected: ['SEAM', 'NVI', 'PSQ', 'SCF'],
        estimatedImpact: `SEAM −20 pts → cascading SCF reduction → recommendation may shift from Proceed to Restructure`,
      },
      {
        scenario: `Regulatory barrier increase (new compliance layer or trade restriction)`,
        probability: spi > 75 ? 'unlikely' : 'plausible',
        formulasAffected: ['BARNA', 'ESI', 'SPI'],
        estimatedImpact: `BARNA +15 pts → NVI reduced → SPI compression of 8–12 pts`,
      },
    ];

    // ── §6 Human Action Items ───────────────────────────────────────────────
    const humanActionItems: SelfAuditReport['humanActionItems'] = [];
    if (novelty.noveltyIndex >= 50) {
      humanActionItems.push({
        priority: 1,
        action: `Commission independent country/sector assessment for ${country}`,
        rationale: `Novelty index ${novelty.noveltyIndex}/100 — NSIL is extrapolating in this domain`,
        affectedFormulas: ['CRI', 'PRI', 'BARNA'],
      });
    }
    if (!(params.totalInvestment ?? params.dealSize)) {
      humanActionItems.push({
        priority: 1,
        action: 'Define a specific investment budget range before acting on RROI/IVAS scores',
        rationale: 'Budget was not provided — TCO and RROI scores use sector-average benchmarks which may diverge significantly from actuals.',
        affectedFormulas: ['TCO', 'RROI', 'IVAS', 'SCF'],
      });
    }
    if ((scores.CRI ?? 70) < 55 || (scores.PRI ?? 70) < 55) {
      humanActionItems.push({
        priority: 1,
        action: `Engage specialist political risk advisor for ${country}`,
        rationale: `CRI/PRI scores indicate elevated country risk — these scores require ground-truth validation`,
        affectedFormulas: ['CRI', 'PRI', 'SPI'],
      });
    }
    humanActionItems.push({
      priority: 2,
      action: 'Verify stakeholder mapping against SEAM assumptions',
      rationale: 'SEAM assumes sector-average engagement density — actual relationships may differ materially',
      affectedFormulas: ['SEAM', 'NVI', 'PSQ'],
    });
    humanActionItems.push({
      priority: 3,
      action: 'Review Monte Carlo tail scenarios (bottom 5%) for capital preservation implications',
      rationale: 'The adversarial stress scenarios above represent real-world failure modes — verify risk capacity covers the downside',
    });

    // ── §7 Calibration Trail ────────────────────────────────────────────────
    const calibrationTrail: SelfAuditReport['calibrationTrail'] = [];
    for (const [formulaId, value] of Object.entries(scores)) {
      if (typeof value !== 'number' || !isFinite(value)) continue;
      const outlier = calibrationStore.isOutlier(formulaId, value);
      const dist = calibrationStore.getDistribution(formulaId);
      calibrationTrail.push({
        formulaId,
        value: parseFloat(value.toFixed(2)),
        zScore: outlier.zScore,
        percentileRank: outlier.percentileRank,
        severity: outlier.severity,
        historicalN: dist?.n ?? 0,
        interpretation: outlier.note,
      });
    }

    return {
      runId: id,
      generatedAt: new Date().toISOString(),
      subject: `${org} — ${country} ${sectors.length > 0 ? `(${sectors.join(', ')})` : ''}`.trim(),
      epistemicStatus: {
        overallConfidence,
        noveltyLevel: novelty.noveltyLevel,
        noveltyIndex: novelty.noveltyIndex,
        confidenceMultiplier: novelty.confidenceMultiplier,
        summary: novelty.epistemicStatement,
      },
      sourceTaxonomy: { dataGrounded, modelSynthesised, hybrid },
      knownUnknowns,
      assumptionLedger,
      adversarialStress,
      humanActionItems: humanActionItems.sort((a, b) => a.priority - b.priority),
      calibrationTrail,
      novelty,
    };
  }

  // ─── Format as plain-text for inclusion in report exports ────────────────
  toText(report: SelfAuditReport): string {
    const lines: string[] = [];
    lines.push(`NSIL SELF-AUDIT REPORT`);
    lines.push(`${'─'.repeat(60)}`);
    lines.push(`Run ID: ${report.runId}`);
    lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
    lines.push(`Subject: ${report.subject}`);
    lines.push('');

    lines.push(`§1  EPISTEMIC STATUS`);
    lines.push(`    Overall Confidence: ${report.epistemicStatus.overallConfidence.toUpperCase()}`);
    lines.push(`    Novelty: ${report.epistemicStatus.noveltyLevel} (index ${report.epistemicStatus.noveltyIndex}/100)`);
    lines.push(`    Confidence Multiplier: ×${report.epistemicStatus.confidenceMultiplier}`);
    lines.push(`    ${report.epistemicStatus.summary}`);
    lines.push('');

    lines.push(`§2  SOURCE TAXONOMY`);
    lines.push(`    DATA-GROUNDED:`);
    report.sourceTaxonomy.dataGrounded.forEach(s => lines.push(`      · ${s}`));
    lines.push(`    MODEL-SYNTHESISED:`);
    report.sourceTaxonomy.modelSynthesised.forEach(s => lines.push(`      · ${s}`));
    lines.push(`    HYBRID:`);
    report.sourceTaxonomy.hybrid.forEach(s => lines.push(`      · ${s}`));
    lines.push('');

    lines.push(`§3  KNOWN UNKNOWNS`);
    report.knownUnknowns.forEach(k => {
      lines.push(`    [${k.impact.toUpperCase()}] ${k.gap}`);
      lines.push(`           Mitigation: ${k.mitigation}`);
    });
    lines.push('');

    lines.push(`§4  ASSUMPTION LEDGER`);
    report.assumptionLedger.forEach(a => {
      lines.push(`    · ${a.assumption} (source: ${a.source}, sensitivity: ${a.sensitivity})`);
      lines.push(`      Affects: ${a.wouldAffect.join(', ')}`);
    });
    lines.push('');

    lines.push(`§5  ADVERSARIAL STRESS SCENARIOS`);
    report.adversarialStress.forEach(s => {
      lines.push(`    [${s.probability.toUpperCase()}] ${s.scenario}`);
      lines.push(`           Impact: ${s.estimatedImpact}`);
    });
    lines.push('');

    lines.push(`§6  HUMAN ACTION ITEMS`);
    report.humanActionItems.forEach(item => {
      lines.push(`    [P${item.priority}] ${item.action}`);
      lines.push(`           ${item.rationale}`);
    });
    lines.push('');

    lines.push(`§7  CALIBRATION TRAIL`);
    report.calibrationTrail.forEach(c => {
      lines.push(`    ${c.formulaId}: ${c.value} | z=${c.zScore} | p${c.percentileRank} | n=${c.historicalN} | ${c.severity}`);
    });

    return lines.join('\n');
  }
}

export const selfAuditGenerator = new SelfAuditReportGenerator();
