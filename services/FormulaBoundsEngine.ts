/**
 * FORMULA BOUNDS ENFORCEMENT ENGINE
 * 
 * This engine ensures all formula outputs remain within realistic bounds.
 * It prevents:
 * - Infinite/NaN outputs from division by near-zero
 * - Astronomical scores from extreme inputs
 * - Neural field explosions in Wilson-Cowan equations
 * - Unbounded accumulation over iterations
 * 
 * STRESS TESTS FIXED:
 * - " TEST 4.1: RROI with zero risk (division by zero)
 * - " TEST 4.2: SPI with all perfect scores
 * - " TEST 4.3: Wilson-Cowan neural field explosion
 * 
 * All 38 formulas are covered with appropriate bounds.
 */

export interface FormulaOutput {
    raw: number;
    bounded: number;
    wasCapped: boolean;
    cappedReason?: string;
    confidence: number;
    warningFlags: string[];
}

export interface FormulaBounds {
    min: number;
    max: number;
    warningThreshold: number;
    description: string;
}

// ============================================================================
// FORMULA BOUNDS DEFINITIONS
// ============================================================================

export const FORMULA_BOUNDS: Record<string, FormulaBounds> = {
    // Strategic/Core Indices (0-100 scale)
    SPI: { min: 0, max: 100, warningThreshold: 95, description: 'Strategic Positioning Index' },
    RROI: { min: -100, max: 500, warningThreshold: 100, description: 'Risk-adjusted ROI' },
    SEAM: { min: 0, max: 100, warningThreshold: 92, description: 'Strategic Economic Alignment' },
    RNI: { min: 0, max: 100, warningThreshold: 95, description: 'Risk-Normalized Index' },
    BARNA: { min: 0, max: 100, warningThreshold: 90, description: 'Balanced Risk-Adjusted Net Assessment' },
    AGI: { min: 0, max: 100, warningThreshold: 95, description: 'Adaptive Growth Index' },
    
    // Financial Indices
    SCF: { min: -1e12, max: 1e12, warningThreshold: 1e11, description: 'Sustainability Cash Flow' },
    TCO: { min: 0, max: 1e12, warningThreshold: 1e11, description: 'Total Cost of Ownership' },
    FMS: { min: 0, max: 100, warningThreshold: 90, description: 'Financial Maturity Score' },
    CRI: { min: 0, max: 100, warningThreshold: 95, description: 'Credit Risk Index' },
    
    // Market/Opportunity Indices
    LAI: { min: 0, max: 100, warningThreshold: 95, description: 'Location Attractiveness Index' },
    PSS: { min: 0, max: 100, warningThreshold: 95, description: 'Partnership Synergy Score' },
    ESI: { min: 0, max: 100, warningThreshold: 90, description: 'Economic Stability Index' },
    ISI: { min: 0, max: 100, warningThreshold: 90, description: 'Infrastructure Strength Index' },
    OSI: { min: 0, max: 100, warningThreshold: 90, description: 'Operational Scalability Index' },
    
    // Ethics/Governance Indices
    CSR: { min: 0, max: 100, warningThreshold: 95, description: 'Corporate Social Responsibility Score' },
    DVS: { min: 0, max: 100, warningThreshold: 90, description: 'Diversity Value Score' },
    
    // Advanced Indices
    IVAS: { min: 0, max: 100, warningThreshold: 95, description: 'Integrated Value Assessment Score' },
    SAE: { min: 0, max: 100, warningThreshold: 95, description: 'Strategic Alignment Effectiveness' },
    NVI: { min: 0, max: 100, warningThreshold: 95, description: 'Net Value Index' },
    FRS: { min: 0, max: 100, warningThreshold: 95, description: 'Financial Resilience Score' },
    PRI: { min: 0, max: 100, warningThreshold: 95, description: 'Political Risk Index' },
    VCI: { min: 0, max: 100, warningThreshold: 95, description: 'Value Creation Index' },
    ATI: { min: 0, max: 100, warningThreshold: 95, description: 'Adaptability & Transformation Index' },
    CAP: { min: 0, max: 100, warningThreshold: 95, description: 'Competitive Advantage Positioning' },
    IDV: { min: 0, max: 100, warningThreshold: 95, description: 'Innovation & Digital Value' },
    PPL: { min: 0, max: 100, warningThreshold: 95, description: 'Profit Potential Level' },
    CLO: { min: 0, max: 100, warningThreshold: 95, description: 'Cost Leadership Opportunity' },
    SRA: { min: 0, max: 100, warningThreshold: 95, description: 'Strategic Risk Assessment' },
    RFI: { min: 0, max: 100, warningThreshold: 95, description: 'Regulatory Friction Index' },
    CIS: { min: 0, max: 100, warningThreshold: 95, description: 'Competitive Intelligence Score' },
    SEQ: { min: 0, max: 100, warningThreshold: 95, description: 'Strategic Equity Score' },
    DCS: { min: 0, max: 100, warningThreshold: 95, description: 'Digital Capability Score' },
    DQS: { min: 0, max: 100, warningThreshold: 95, description: 'Data Quality Score' },
    GCS: { min: 0, max: 100, warningThreshold: 95, description: 'Governance Compliance Score' },
    RDBI: { min: 0, max: 100, warningThreshold: 95, description: 'Regional Development Benefit Index' },
    AFC: { min: -1e12, max: 1e12, warningThreshold: 1e11, description: 'Adjusted Future Cash flows' },
    
    // Neural Field Variables (bounded for stability)
    NEURAL_E: { min: 0, max: 1, warningThreshold: 0.95, description: 'Excitatory neural activity' },
    NEURAL_I: { min: 0, max: 1, warningThreshold: 0.95, description: 'Inhibitory neural activity' },
    NEURAL_FIELD: { min: -1, max: 1, warningThreshold: 0.9, description: 'Neural field state' },
};

// ============================================================================
// STABILITY CONSTANTS
// ============================================================================

const STABILITY_CONSTANTS = {
    MIN_DIVISOR: 0.01,          // Minimum divisor to prevent near-zero division
    MAX_GROWTH_RATE: 10,        // Maximum allowed multiplier per iteration
    MAX_ITERATIONS: 1000,       // Maximum iterations before forced termination
    NEURAL_DECAY: 0.1,          // Wilson-Cowan decay constant
    NEURAL_MAX_INPUT: 100,      // Maximum neural input before saturation
    CONFIDENCE_DECAY: 0.1,      // Confidence reduction per warning
    PERFECT_SCORE_PENALTY: 0.2, // Confidence penalty for perfect scores
};

// ============================================================================
// FORMULA BOUNDS ENFORCEMENT ENGINE
// ============================================================================

export class FormulaBoundsEngine {
    private warningFlags: string[] = [];

    /**
     * ENFORCE BOUNDS ON FORMULA OUTPUT
     */
    public enforceBounds(
        formulaName: string,
        rawValue: number,
        inputContext?: Record<string, unknown>
    ): FormulaOutput {
        this.warningFlags = [];
        const bounds = FORMULA_BOUNDS[formulaName] || FORMULA_BOUNDS['SPI']; // Default to SPI bounds

        // Handle special values
        if (!Number.isFinite(rawValue)) {
            this.warningFlags.push(`${formulaName} produced non-finite value (${rawValue})`);
            return {
                raw: rawValue,
                bounded: rawValue === Infinity ? bounds.max : rawValue === -Infinity ? bounds.min : 50,
                wasCapped: true,
                cappedReason: `Non-finite value replaced with bound`,
                confidence: 0.1,
                warningFlags: this.warningFlags,
            };
        }

        let bounded = rawValue;
        let wasCapped = false;
        let cappedReason: string | undefined;
        let confidence = 1.0;

        // Check against bounds
        if (rawValue > bounds.max) {
            bounded = bounds.max;
            wasCapped = true;
            cappedReason = `Capped from ${rawValue.toExponential(2)} to max ${bounds.max}`;
            this.warningFlags.push(`${formulaName} exceeded maximum (${rawValue.toExponential(2)} > ${bounds.max})`);
            confidence *= 0.5;
        } else if (rawValue < bounds.min) {
            bounded = bounds.min;
            wasCapped = true;
            cappedReason = `Capped from ${rawValue.toExponential(2)} to min ${bounds.min}`;
            this.warningFlags.push(`${formulaName} below minimum (${rawValue.toExponential(2)} < ${bounds.min})`);
            confidence *= 0.5;
        }

        // Warning threshold check
        if (Math.abs(rawValue) > bounds.warningThreshold && !wasCapped) {
            this.warningFlags.push(`${formulaName} above warning threshold (${rawValue} > ${bounds.warningThreshold})`);
            confidence -= STABILITY_CONSTANTS.CONFIDENCE_DECAY;
        }

        // Perfect score skepticism - apply penalty for 100% scores
        if (bounded === bounds.max && bounds.max === 100) {
            confidence -= STABILITY_CONSTANTS.PERFECT_SCORE_PENALTY;
            this.warningFlags.push(`Perfect score detected - confidence reduced`);
        }

        // Context-based adjustments
        if (inputContext) {
            confidence = this.adjustConfidenceFromContext(inputContext, confidence);
        }

        return {
            raw: rawValue,
            bounded,
            wasCapped,
            cappedReason,
            confidence: Math.max(0.1, Math.min(1.0, confidence)),
            warningFlags: this.warningFlags,
        };
    }

    /**
     * SAFE DIVISION - Prevents division by zero/near-zero
     */
    public static safeDivide(numerator: number, denominator: number, fallback?: number): number {
        if (Math.abs(denominator) < STABILITY_CONSTANTS.MIN_DIVISOR) {
            // Return fallback or clamp result
            if (fallback !== undefined) return fallback;
            
            // Return bounded result based on sign
            const sign = (numerator >= 0 && denominator >= 0) || (numerator < 0 && denominator < 0) ? 1 : -1;
            return sign * (numerator / STABILITY_CONSTANTS.MIN_DIVISOR);
        }
        return numerator / denominator;
    }

    /**
     * SAFE RROI CALCULATION - Risk-adjusted return with bounds
     */
    public static calculateSafeRROI(
        expectedReturn: number,
        riskScore: number,
        volatility?: number
    ): FormulaOutput {
        const engine = new FormulaBoundsEngine();
        
        // Ensure minimum risk score
        const safeRisk = Math.max(STABILITY_CONSTANTS.MIN_DIVISOR, riskScore, 0.01);
        
        // Calculate raw RROI
        let rawRROI = expectedReturn / safeRisk;
        
        // Apply volatility adjustment if provided
        if (volatility !== undefined && volatility > 0) {
            rawRROI = rawRROI * (1 - volatility / 100);
        }
        
        // Enforce bounds
        const result = engine.enforceBounds('RROI', rawRROI * 100, { expectedReturn, riskScore, volatility });
        
        // Add warning if risk was artificially low
        if (riskScore < 1) {
            result.warningFlags.push(`Risk score suspiciously low (${riskScore}%) - RROI may be inflated`);
            result.confidence *= 0.7;
        }
        
        return result;
    }

    /**
     * SAFE SPI CALCULATION - Strategic Positioning Index with skepticism
     */
    public static calculateSafeSPI(components: {
        marketDominance?: number;
        barrierToEntry?: number;
        brandStrength?: number;
        ipValue?: number;
        networkEffects?: number;
        economicResilience?: number;
        strategicPositioning?: number;
    }): FormulaOutput {
        const engine = new FormulaBoundsEngine();
        
        const values = Object.values(components).filter(v => v !== undefined) as number[];
        
        // Count perfect scores
        const perfectCount = values.filter(v => v === 100).length;
        
        // Calculate weighted average
        const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 50;
        
        // Apply skepticism penalty for too many perfect scores
        let adjustedSPI = avg;
        if (perfectCount >= 3) {
            adjustedSPI = avg * 0.85; // 15% penalty for questionable data
            engine.warningFlags.push(`${perfectCount} perfect scores - SPI reduced by 15%`);
        } else if (perfectCount >= 2) {
            adjustedSPI = avg * 0.92; // 8% penalty
            engine.warningFlags.push(`${perfectCount} perfect scores - SPI reduced by 8%`);
        }
        
        // Enforce bounds
        const result = engine.enforceBounds('SPI', adjustedSPI, { components });
        
        if (perfectCount >= 3) {
            result.confidence *= 0.6;
        }
        
        return result;
    }

    /**
     * WILSON-COWAN NEURAL FIELD - Bounded iteration
     */
    public static runBoundedWilsonCowan(params: {
        excitatoryInput: number;
        inhibitoryInput: number;
        timeSteps: number;
        tau_E?: number;
        tau_I?: number;
        w_EE?: number;
        w_EI?: number;
        w_IE?: number;
        w_II?: number;
    }): {
        E: number;
        I: number;
        stable: boolean;
        iterations: number;
        warningFlags: string[];
    } {
        const {
            excitatoryInput,
            inhibitoryInput,
            timeSteps,
            tau_E = 10,
            tau_I = 20,
            w_EE = 1.5,
            w_EI = 1.0,
            w_IE = 1.2,
            w_II = 0.5,
        } = params;

        const warningFlags: string[] = [];
        const maxSteps = Math.min(timeSteps, STABILITY_CONSTANTS.MAX_ITERATIONS);

        if (timeSteps > STABILITY_CONSTANTS.MAX_ITERATIONS) {
            warningFlags.push(`Iterations capped from ${timeSteps} to ${STABILITY_CONSTANTS.MAX_ITERATIONS}`);
        }

        // Saturate extreme inputs
        const satE = Math.min(STABILITY_CONSTANTS.NEURAL_MAX_INPUT, Math.abs(excitatoryInput));
        const satI = Math.min(STABILITY_CONSTANTS.NEURAL_MAX_INPUT, Math.abs(inhibitoryInput));

        if (excitatoryInput > STABILITY_CONSTANTS.NEURAL_MAX_INPUT) {
            warningFlags.push(`Excitatory input saturated from ${excitatoryInput} to ${satE}`);
        }

        // Sigmoid activation function for stability
        const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

        // Initialize state
        let E = 0.5;
        let I = 0.5;
        let stable = false;
        let iterations = 0;

        // Run bounded simulation
        for (let t = 0; t < maxSteps; t++) {
            iterations = t + 1;

            // Wilson-Cowan equations with sigmoid bounds
            const dE = (-E + sigmoid(w_EE * E - w_IE * I + satE)) / tau_E;
            const dI = (-I + sigmoid(w_EI * E - w_II * I + satI)) / tau_I;

            // Update with decay
            E = Math.max(0, Math.min(1, E + dE * STABILITY_CONSTANTS.NEURAL_DECAY));
            I = Math.max(0, Math.min(1, I + dI * STABILITY_CONSTANTS.NEURAL_DECAY));

            // Check for stability (small changes)
            if (Math.abs(dE) < 0.0001 && Math.abs(dI) < 0.0001) {
                stable = true;
                break;
            }
        }

        if (!stable) {
            warningFlags.push(`Neural field did not stabilize after ${iterations} iterations`);
        }

        return {
            E,
            I,
            stable,
            iterations,
            warningFlags,
        };
    }

    /**
     * BATCH FORMULA VALIDATION
     * Validates all formula outputs at once
     */
    public validateAllFormulas(formulaOutputs: Record<string, number>): {
        valid: boolean;
        results: Record<string, FormulaOutput>;
        totalWarnings: number;
        avgConfidence: number;
    } {
        const results: Record<string, FormulaOutput> = {};
        let totalWarnings = 0;
        let totalConfidence = 0;
        let formulaCount = 0;

        for (const [name, value] of Object.entries(formulaOutputs)) {
            const result = this.enforceBounds(name, value);
            results[name] = result;
            totalWarnings += result.warningFlags.length;
            totalConfidence += result.confidence;
            formulaCount++;
        }

        const avgConfidence = formulaCount > 0 ? totalConfidence / formulaCount : 0;

        return {
            valid: totalWarnings === 0,
            results,
            totalWarnings,
            avgConfidence,
        };
    }

    /**
     * ADJUST CONFIDENCE FROM INPUT CONTEXT
     */
    private adjustConfidenceFromContext(
        context: Record<string, unknown>,
        baseConfidence: number
    ): number {
        let confidence = baseConfidence;

        // Reduce confidence if inputs had validation issues
        if (context.inputsHadIssues) {
            confidence *= 0.8;
            this.warningFlags.push('Input validation detected issues');
        }

        // Reduce confidence for missing data
        const missingFields = context.missingFields as string[] | undefined;
        if (missingFields && missingFields.length > 0) {
            confidence *= Math.max(0.5, 1 - missingFields.length * 0.05);
            this.warningFlags.push(`${missingFields.length} fields imputed with defaults`);
        }

        // Reduce confidence for extreme values in inputs
        if (context.hasExtremeValues) {
            confidence *= 0.7;
            this.warningFlags.push('Extreme input values detected');
        }

        return Math.max(0.1, confidence);
    }
}

// Export convenience functions
export const enforceBounds = (formula: string, value: number): FormulaOutput => {
    const engine = new FormulaBoundsEngine();
    return engine.enforceBounds(formula, value);
};

export const safeDivide = FormulaBoundsEngine.safeDivide;
export const calculateSafeRROI = FormulaBoundsEngine.calculateSafeRROI;
export const calculateSafeSPI = FormulaBoundsEngine.calculateSafeSPI;
export const runBoundedWilsonCowan = FormulaBoundsEngine.runBoundedWilsonCowan;

export default FormulaBoundsEngine;

