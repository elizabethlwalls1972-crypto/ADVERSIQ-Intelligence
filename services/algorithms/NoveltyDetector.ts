/**
 * NOVELTY DETECTOR
 * ──────────────────────────────────────────────────────────────────────────────
 * Detects when a scenario is genuinely novel — i.e. outside the experience
 * envelope of the NSIL calibration history.
 *
 * This is the difference between synthesis and retrieval.
 * When novelty is LOW, NSIL is drawing on well-calibrated patterns.
 * When novelty is HIGH, NSIL is extrapolating — and says so.
 *
 * Methods:
 *  1. Input-space novelty   — are the country/sector/intent inputs unusual?
 *  2. Score-space novelty   — are the formula outputs outside historical range?
 *  3. Combined novelty      — weighted composite novelty index (0–100)
 *
 * No LLM retraining involved. This is pure statistical epistemics.
 */

import { calibrationStore } from './NSILCalibrationStore';

// ─────────────────────────────────────────────────────────────────────────────
// KNOWN COUNTRY COVERAGE (populated from calibration seed — 34 countries)
// ─────────────────────────────────────────────────────────────────────────────
const SEEN_COUNTRIES = new Set([
  'vietnam','indonesia','philippines','thailand','malaysia','singapore',
  'cambodia','myanmar','laos','bangladesh','india','pakistan','sri lanka',
  'kenya','nigeria','ghana','south africa','ethiopia','tanzania','morocco',
  'egypt','brazil','colombia','peru','chile','mexico','argentina',
  'germany','france','netherlands','united kingdom','australia','new zealand','japan'
]);

const SEEN_SECTORS = new Set([
  'manufacturing','technology','agriculture','logistics','retail',
  'healthcare','education','energy','construction','finance','tourism',
  'real estate','mining','telecommunications','infrastructure'
]);

export interface NoveltyReport {
  /** 0–100 composite novelty index (100 = completely unprecedented) */
  noveltyIndex: number;
  /** Low / moderate / high / extreme */
  noveltyLevel: 'low' | 'moderate' | 'high' | 'extreme';
  /** True = system is extrapolating beyond known data */
  isExtrapolating: boolean;
  /** Confidence multiplier to apply to outputs (0.6 – 1.0) */
  confidenceMultiplier: number;
  /** Breakdown by dimension */
  dimensions: {
    inputNovelty: number;
    scoreNovelty: number;
    sectorNovelty: number;
  };
  /** Specific novel elements identified */
  novelElements: string[];
  /** What the system IS well-calibrated for in this run */
  calibratedElements: string[];
  /** Plain-language epistemic statement */
  epistemicStatement: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOVELTY DETECTOR
// ─────────────────────────────────────────────────────────────────────────────

export class NoveltyDetector {
  private seenCountries: Set<string>;
  private seenSectors: Set<string>;
  private seenCombinations = new Set<string>();

  constructor() {
    this.seenCountries = new Set(SEEN_COUNTRIES);
    this.seenSectors = new Set(SEEN_SECTORS);
  }

  // ─── Register a completed run to expand the experience envelope ───────────
  register(params: {
    country?: string;
    industry?: string[];
    scores?: Record<string, number>;
  }): void {
    if (params.country) this.seenCountries.add(params.country.toLowerCase().trim());
    if (params.industry) {
      for (const s of params.industry) this.seenSectors.add(s.toLowerCase().trim());
    }
    if (params.country && params.industry?.length) {
      this.seenCombinations.add(
        `${params.country.toLowerCase()}:${[...params.industry].sort().join('|')}`
      );
    }
    if (params.scores) {
      calibrationStore.recordRun(params.scores, {
        country: params.country,
        industry: params.industry,
      });
    }
  }

  // ─── Analyse novelty of a new scenario ──────────────────────────────────
  detect(params: {
    country?: string;
    industry?: string[];
    scores?: Record<string, number>;
  }): NoveltyReport {
    const novelElements: string[] = [];
    const calibratedElements: string[] = [];

    // 1. Input-space novelty
    let inputNovelty = 0;
    const country = (params.country ?? '').toLowerCase().trim();
    const sectors = (params.industry ?? []).map(s => s.toLowerCase().trim());

    if (country && !this.seenCountries.has(country)) {
      inputNovelty += 40;
      novelElements.push(`Country "${params.country}" is outside the historical calibration set`);
    } else if (country) {
      calibratedElements.push(`Country "${params.country}" — well-calibrated (${this.seenCountries.size} countries in history)`);
    }

    const unseenSectors = sectors.filter(s => !this.seenSectors.has(s));
    if (unseenSectors.length > 0) {
      inputNovelty += 20 * Math.min(unseenSectors.length, 2);
      novelElements.push(`Sector(s) "${unseenSectors.join(', ')}" not previously encountered`);
    }

    const comboKey = `${country}:${[...sectors].sort().join('|')}`;
    if (country && sectors.length && !this.seenCombinations.has(comboKey)) {
      inputNovelty += 15;
      novelElements.push('Country–sector combination is new (no prior run covers this exact pairing)');
    } else if (this.seenCombinations.has(comboKey)) {
      calibratedElements.push('Country–sector combination has been seen before — strong calibration');
    }

    // 2. Score-space novelty (from calibration store)
    let scoreNovelty = 0;
    if (params.scores) {
      const summary = calibrationStore.calibrationSummary(params.scores);
      const extreme = summary.outlierFormulas.filter(o => o.severity === 'extreme').length;
      const high = summary.outlierFormulas.filter(o => o.severity === 'high').length;
      scoreNovelty = Math.min(100, extreme * 25 + high * 12);
      if (extreme > 0) novelElements.push(`${extreme} formula(s) produced scores beyond 3σ of historical distribution`);
      if (high > 0) novelElements.push(`${high} formula(s) produced scores in the 2σ–3σ tail`);
      if (scoreNovelty === 0) calibratedElements.push('All formula scores within normal historical distribution');
    }

    // 3. Sector novelty
    const sectorNovelty = unseenSectors.length > 0
      ? Math.min(100, unseenSectors.length * 25) : 0;

    // Composite novelty index (weighted)
    const noveltyIndex = Math.min(100, Math.round(
      inputNovelty * 0.45 +
      scoreNovelty * 0.40 +
      sectorNovelty * 0.15
    ));

    const noveltyLevel: NoveltyReport['noveltyLevel'] =
      noveltyIndex >= 75 ? 'extreme' :
      noveltyIndex >= 50 ? 'high' :
      noveltyIndex >= 25 ? 'moderate' : 'low';

    const isExtrapolating = noveltyIndex >= 50;

    // Confidence multiplier: suppress confidence when extrapolating
    const confidenceMultiplier = parseFloat(Math.max(0.60, 1 - noveltyIndex / 250).toFixed(3));

    // Epistemic statement
    const epistemicStatement =
      noveltyLevel === 'extreme'
        ? `NSIL is operating at the frontier of its calibration envelope. This scenario is statistically unprecedented. The system is extrapolating — not retrieving. Treat all scores as directional, not definitive. Human expert review is strongly recommended before any capital commitment.`
      : noveltyLevel === 'high'
        ? `This scenario has low historical precedent in the calibration data. NSIL is partially extrapolating. Scores are valid but confidence bands are wider than usual. Independent verification of key assumptions is advisable.`
      : noveltyLevel === 'moderate'
        ? `Some elements of this scenario are novel. NSIL is interpolating between known data points. The output is well-reasoned but acknowledge the reduced calibration density in this specific domain.`
        : `This scenario is within the well-calibrated range of NSIL's historical experience. Formula scores are grounded in strong statistical precedent. High confidence in the reliability of the output.`;

    return {
      noveltyIndex,
      noveltyLevel,
      isExtrapolating,
      confidenceMultiplier,
      dimensions: {
        inputNovelty: Math.min(100, inputNovelty),
        scoreNovelty: Math.min(100, scoreNovelty),
        sectorNovelty: Math.min(100, sectorNovelty),
      },
      novelElements,
      calibratedElements,
      epistemicStatement,
    };
  }
}

export const noveltyDetector = new NoveltyDetector();
