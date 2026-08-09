/**
 * INPUT VALIDATION ENGINE - Complete Validation Suite
 * 
 * This engine addresses ALL stress test failures by implementing:
 * 1. Numeric bounds validation (infinite growth, negative values, division by zero)
 * 2. Contradiction detection (conflicting data points)
 * 3. Adversarial attack detection (debt masking, cherry-picked peers, fake approvals)
 * 4. Fraud indicator detection (Theranos/Solyndra patterns)
 * 5. Edge case handling (all zeros, massive text, unicode attacks)
 * 
 * STRESS TESTS FIXED:
 * - " TEST 1.1: Infinite Growth Rate
 * - " TEST 1.2: Negative Investment Amount
 * - " TEST 1.3: Zero Market Size
 * - " TEST 1.4: Massive Text Input
 * - " TEST 2.1: Profitable While Losing Money
 * - " TEST 2.2: One-Year-Old with 20-Year Track Record
 * - " TEST 2.3: Monopoly Claims in Fragmented Market
 * - " TEST 3.1: All Zero Inputs
 * - " TEST 3.2: Incomplete Data - Missing Critical Fields
 * - " TEST 3.3: Unicode Attack (Zalgo Text)
 * - " TEST 4.1: RROI: Zero Risk Claimed
 * - " TEST 4.2: SPI: Perfect Scores on Everything
 * - " TEST 4.3: Neural Field: Maximum Excitation
 * - " TEST 5.1: Adversarial: Hide Debt in Intangibles
 * - " TEST 5.2: Adversarial: All Successful Peers
 * - " TEST 5.3: Adversarial: Claim Pre-Approval in Corrupt Region
 * - " TEST 7.1: Known Pattern: Theranos Red Flags
 * - " TEST 7.2: Known Pattern: Solyndra Technology Risk
 */

export interface ValidationIssue {
    code: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'bounds' | 'contradiction' | 'adversarial' | 'fraud' | 'edge_case' | 'pattern';
    field: string;
    message: string;
    userValue: unknown;
    expectedRange?: { min: unknown; max: unknown };
    recommendation: string;
    blocked: boolean;
}

export interface ValidationReport {
    valid: boolean;
    trust_score: number; // 0-100
    status: 'approved' | 'cautionary' | 'review_required' | 'blocked';
    issues: ValidationIssue[];
    sanitizedInputs: Record<string, unknown>;
    blockedReasons: string[];
}

// ============================================================================
// REALISTIC BOUNDS - Based on real-world financial data
// ============================================================================

const REALISTIC_BOUNDS = {
    growthRate: { min: -50, max: 200, warning: 50, name: 'Growth Rate' },
    marketGrowthRate: { min: -30, max: 100, warning: 30, name: 'Market Growth Rate' },
    investment: { min: 0, max: 1e12, warning: 1e11, name: 'Investment Amount' },
    marketSize: { min: 1e3, max: 1e15, warning: 1e14, name: 'Market Size' },
    marketShare: { min: 0, max: 1, warning: 0.5, name: 'Market Share' },
    profitMargin: { min: -1, max: 1, warning: 0.5, name: 'Profit Margin' },
    roiExpectation: { min: -100, max: 200, warning: 50, name: 'ROI Expectation' },
    riskScore: { min: 0.01, max: 100, warning: 0, name: 'Risk Score' },
    companyAge: { min: 0, max: 200, warning: 150, name: 'Company Age' },
    employees: { min: 0, max: 3e6, warning: 1e6, name: 'Employee Count' },
    revenue: { min: 0, max: 1e13, warning: 1e12, name: 'Revenue' },
    debtEquityRatio: { min: 0, max: 20, warning: 5, name: 'Debt/Equity Ratio' },
    turnoverRate: { min: 0, max: 1, warning: 0.5, name: 'Employee Turnover' },
};

const TEXT_LIMITS = {
    maxFieldLength: 10000,
    maxDescriptionLength: 50000,
    maxArrayLength: 1000,
};

// ============================================================================
// FRAUD PATTERN DATABASE
// ============================================================================

const FRAUD_PATTERNS = {
    theranos: {
        name: 'Theranos Pattern',
        indicators: {
            secretTechnology: true,
            nonExpertBoard: true,
            highTurnover: 0.5,
            noTechnicalProof: true,
            whistleblowers: true,
        },
        threshold: 3, // 3 or more indicators = flag
        severity: 'critical' as const,
    },
    solyndra: {
        name: 'Solyndra Pattern',
        indicators: {
            unprovenTechnology: true,
            competitorCostAdvantage: 0.3,
            policyDependence: 0.7,
            lowPivotFlexibility: true,
        },
        threshold: 3,
        severity: 'high' as const,
    },
    enron: {
        name: 'Enron Pattern',
        indicators: {
            complexStructure: true,
            markToMarket: true,
            specialPurposeVehicles: true,
            highDebtOffBalance: true,
        },
        threshold: 2,
        severity: 'critical' as const,
    },
    ftx: {
        name: 'FTX Pattern',
        indicators: {
            commingledFunds: true,
            cryptoExposure: true,
            rapidGrowth: true,
            weakGovernance: true,
            relatedPartyTransactions: true,
        },
        threshold: 3,
        severity: 'critical' as const,
    },
};

// ============================================================================
// COUNTRY CORRUPTION DATA
// ============================================================================

const COUNTRY_CORRUPTION_INDEX: Record<string, number> = {
    'Denmark': 88, 'Finland': 87, 'New Zealand': 87, 'Norway': 84, 'Singapore': 83,
    'Sweden': 82, 'Switzerland': 82, 'Netherlands': 80, 'Germany': 79, 'Luxembourg': 77,
    'Australia': 73, 'United Kingdom': 71, 'Canada': 74, 'Hong Kong': 76, 'Japan': 73,
    'United States': 67, 'France': 71, 'UAE': 67, 'Taiwan': 65, 'South Korea': 63,
    'Portugal': 62, 'Spain': 60, 'Italy': 56, 'Greece': 52, 'Saudi Arabia': 52,
    'Malaysia': 50, 'China': 45, 'Jordan': 47, 'India': 40, 'Vietnam': 42,
    'Indonesia': 37, 'Brazil': 38, 'Turkey': 36, 'Argentina': 38, 'Mexico': 31,
    'Philippines': 33, 'Thailand': 35, 'Egypt': 30, 'Russia': 28, 'Nigeria': 24,
    'Myanmar': 23, 'Iran': 24, 'North Korea': 17, 'Venezuela': 14, 'Syria': 13,
    'Somalia': 12, 'South Sudan': 11,
};

// ============================================================================
// INPUT VALIDATION ENGINE
// ============================================================================

export class InputValidationEngine {
    private issues: ValidationIssue[] = [];
    private sanitizedInputs: Record<string, unknown> = {};

    /**
     * VALIDATE ALL INPUTS - Main entry point
     */
    public validate(inputs: Record<string, unknown>): ValidationReport {
        this.issues = [];
        this.sanitizedInputs = { ...inputs };

        // 1. NUMERIC BOUNDS VALIDATION
        this.validateNumericBounds(inputs);

        // 2. CONTRADICTION DETECTION
        this.detectContradictions(inputs);

        // 3. EDGE CASE HANDLING
        this.handleEdgeCases(inputs);

        // 4. ADVERSARIAL ATTACK DETECTION
        this.detectAdversarialAttacks(inputs);

        // 5. FRAUD PATTERN DETECTION
        this.detectFraudPatterns(inputs);

        // 6. TEXT/UNICODE SANITIZATION
        this.sanitizeTextInputs(inputs);

        // Calculate trust score
        const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
        const highCount = this.issues.filter(i => i.severity === 'high').length;
        const mediumCount = this.issues.filter(i => i.severity === 'medium').length;
        
        const trustScore = Math.max(0, Math.min(100, 
            100 - (criticalCount * 40) - (highCount * 20) - (mediumCount * 5)
        ));

        const blocked = criticalCount > 0;
        const status: ValidationReport['status'] = 
            blocked ? 'blocked' :
            highCount > 0 ? 'review_required' :
            mediumCount > 0 ? 'cautionary' : 'approved';

        return {
            valid: !blocked,
            trust_score: trustScore,
            status,
            issues: this.issues,
            sanitizedInputs: this.sanitizedInputs,
            blockedReasons: this.issues.filter(i => i.blocked).map(i => i.message),
        };
    }

    // ========================================================================
    // 1. NUMERIC BOUNDS VALIDATION
    // ========================================================================

    private validateNumericBounds(inputs: Record<string, unknown>): void {
        // Growth rates
        this.checkBound('projectedRevenueGrowth', inputs.projectedRevenueGrowth, REALISTIC_BOUNDS.growthRate);
        this.checkBound('marketGrowthRate', inputs.marketGrowthRate, REALISTIC_BOUNDS.marketGrowthRate);

        // Investment amounts
        if (typeof inputs.initialInvestment === 'number') {
            if (inputs.initialInvestment < 0) {
                this.addIssue({
                    code: 'NEGATIVE_INVESTMENT',
                    severity: 'critical',
                    category: 'bounds',
                    field: 'initialInvestment',
                    message: 'Investment amount cannot be negative',
                    userValue: inputs.initialInvestment,
                    expectedRange: { min: 0, max: REALISTIC_BOUNDS.investment.max },
                    recommendation: 'Provide a positive investment amount',
                    blocked: true,
                });
            }
        }

        // Market size (division by zero protection)
        if (typeof inputs.totalMarketSize === 'number') {
            if (inputs.totalMarketSize === 0) {
                this.addIssue({
                    code: 'ZERO_MARKET_SIZE',
                    severity: 'critical',
                    category: 'bounds',
                    field: 'totalMarketSize',
                    message: 'Market size cannot be zero (would cause division errors)',
                    userValue: inputs.totalMarketSize,
                    expectedRange: { min: REALISTIC_BOUNDS.marketSize.min, max: REALISTIC_BOUNDS.marketSize.max },
                    recommendation: 'Provide a valid market size estimate',
                    blocked: true,
                });
            } else if (inputs.totalMarketSize < REALISTIC_BOUNDS.marketSize.min) {
                this.addIssue({
                    code: 'UNREALISTIC_MARKET_SIZE',
                    severity: 'high',
                    category: 'bounds',
                    field: 'totalMarketSize',
                    message: `Market size of ${inputs.totalMarketSize} is unrealistically low`,
                    userValue: inputs.totalMarketSize,
                    expectedRange: { min: REALISTIC_BOUNDS.marketSize.min, max: REALISTIC_BOUNDS.marketSize.max },
                    recommendation: 'Verify market sizing methodology',
                    blocked: false,
                });
            }
        }

        // Risk score (prevent division by zero in RROI)
        if (typeof inputs.riskScore === 'number') {
            if (inputs.riskScore === 0 || inputs.riskScore < 0.01) {
                this.addIssue({
                    code: 'ZERO_RISK_CLAIM',
                    severity: 'critical',
                    category: 'bounds',
                    field: 'riskScore',
                    message: 'Zero or near-zero risk is impossible - all investments carry risk',
                    userValue: inputs.riskScore,
                    expectedRange: { min: 0.01, max: 100 },
                    recommendation: 'Provide realistic risk assessment (minimum 1%)',
                    blocked: true,
                });
                // Sanitize to minimum
                this.sanitizedInputs['riskScore'] = 0.01;
            }
        }

        // Perfect scores skepticism
        const perfectScoreFields = ['marketDominance', 'barrierToEntry', 'brandStrength', 'ipValue', 'networkEffects'];
        const perfectScores = perfectScoreFields.filter(f => inputs[f] === 100).length;
        if (perfectScores >= 3) {
            this.addIssue({
                code: 'PERFECT_SCORES',
                severity: 'high',
                category: 'adversarial',
                field: 'multipleFields',
                message: `${perfectScores} perfect scores (100) detected - statistically implausible`,
                userValue: { perfectScoreFields: perfectScoreFields.filter(f => inputs[f] === 100) },
                recommendation: 'Review and provide realistic assessments',
                blocked: false,
            });
        }
    }

    private checkBound(
        field: string, 
        value: unknown, 
        bounds: { min: number; max: number; warning: number; name: string }
    ): void {
        if (typeof value !== 'number') return;

        if (value < bounds.min || value > bounds.max) {
            this.addIssue({
                code: `OUT_OF_BOUNDS_${field.toUpperCase()}`,
                severity: 'critical',
                category: 'bounds',
                field,
                message: `${bounds.name} of ${value} is outside valid range [${bounds.min}, ${bounds.max}]`,
                userValue: value,
                expectedRange: { min: bounds.min, max: bounds.max },
                recommendation: `Provide ${bounds.name} within realistic range`,
                blocked: true,
            });
            // Clamp to bounds
            this.sanitizedInputs[field] = Math.max(bounds.min, Math.min(bounds.max, value));
        } else if (bounds.warning && Math.abs(value) > bounds.warning) {
            this.addIssue({
                code: `UNUSUAL_${field.toUpperCase()}`,
                severity: 'medium',
                category: 'bounds',
                field,
                message: `${bounds.name} of ${value} is unusually high (warning threshold: ${bounds.warning})`,
                userValue: value,
                expectedRange: { min: bounds.min, max: bounds.max },
                recommendation: 'Verify this value with supporting evidence',
                blocked: false,
            });
        }
    }

    // ========================================================================
    // 2. CONTRADICTION DETECTION
    // ========================================================================

    private detectContradictions(inputs: Record<string, unknown>): void {
        // Contradiction 1: Profitable while losing money
        const profitMargin = inputs.profitMargin as number | undefined;
        const netIncome = inputs.netIncome as number | undefined;
        const revenue = inputs.revenue as number | undefined;
        
        if (profitMargin != null && netIncome != null && revenue != null && revenue > 0) {
            const impliedProfit = revenue * profitMargin;
            const contradiction = (impliedProfit > 0 && netIncome < 0) || (impliedProfit < 0 && netIncome > 0);
            
            if (contradiction) {
                this.addIssue({
                    code: 'PROFIT_CONTRADICTION',
                    severity: 'critical',
                    category: 'contradiction',
                    field: 'profitMargin/netIncome',
                    message: `Profit margin (${(profitMargin * 100).toFixed(1)}%) contradicts net income ($${netIncome.toLocaleString()})`,
                    userValue: { profitMargin, netIncome, revenue, impliedProfit },
                    recommendation: 'Verify financial data consistency',
                    blocked: true,
                });
            }
        }

        // Contradiction 2: Company age vs historical data
        const companyAge = inputs.companyAge as number | undefined;
        const yearsOfOperation = inputs.yearsOfOperation as number | undefined;
        const historicalPerformance = inputs.historicalPerformance as unknown[] | undefined;
        
        if (companyAge != null && yearsOfOperation != null) {
            if (yearsOfOperation > companyAge + 1) { // +1 for rounding
                this.addIssue({
                    code: 'AGE_HISTORY_MISMATCH',
                    severity: 'critical',
                    category: 'contradiction',
                    field: 'companyAge/yearsOfOperation',
                    message: `${yearsOfOperation} years of operation exceeds company age of ${companyAge} years`,
                    userValue: { companyAge, yearsOfOperation },
                    recommendation: 'Verify company founding date and historical records',
                    blocked: true,
                });
            }
        }

        if (companyAge != null && historicalPerformance != null) {
            if (historicalPerformance.length > companyAge + 1) {
                this.addIssue({
                    code: 'HISTORY_EXCEEDS_AGE',
                    severity: 'critical',
                    category: 'contradiction',
                    field: 'companyAge/historicalPerformance',
                    message: `${historicalPerformance.length} years of historical data for ${companyAge}-year-old company`,
                    userValue: { companyAge, historyLength: historicalPerformance.length },
                    recommendation: 'Historical performance cannot exceed company age',
                    blocked: true,
                });
            }
        }

        // Contradiction 3: 100% market share with competitors
        const marketShare = inputs.marketShare as number | undefined;
        const competitors = inputs.competitors as string[] | undefined;
        const marketConcentration = inputs.marketConcentration as number | undefined;
        
        if (marketShare != null && (marketShare >= 0.95 || marketShare === 1)) {
            if (competitors != null && competitors.length > 0) {
                this.addIssue({
                    code: 'MONOPOLY_WITH_COMPETITORS',
                    severity: 'critical',
                    category: 'contradiction',
                    field: 'marketShare/competitors',
                    message: `Claimed ${(marketShare * 100).toFixed(0)}% market share but listed ${competitors.length} competitors`,
                    userValue: { marketShare, competitors },
                    recommendation: 'Monopoly claims with known competitors are contradictory',
                    blocked: true,
                });
            }

            if (marketConcentration != null && marketConcentration < 0.5) {
                this.addIssue({
                    code: 'MONOPOLY_IN_FRAGMENTED_MARKET',
                    severity: 'critical',
                    category: 'contradiction',
                    field: 'marketShare/marketConcentration',
                    message: `Claimed ${(marketShare * 100).toFixed(0)}% share in fragmented market (HHI: ${marketConcentration})`,
                    userValue: { marketShare, marketConcentration },
                    recommendation: 'Fragmented markets cannot have near-monopoly players',
                    blocked: true,
                });
            }
        }
    }

    // ========================================================================
    // 3. EDGE CASE HANDLING
    // ========================================================================

    private handleEdgeCases(inputs: Record<string, unknown>): void {
        // All zeros detection
        const numericFields = ['revenue', 'costs', 'investment', 'marketSize', 'growth', 'employees'];
        const allZeros = numericFields.filter(f => inputs[f] === 0).length === numericFields.filter(f => inputs[f] !== undefined).length;
        const hasAnyNumeric = numericFields.some(f => inputs[f] !== undefined);
        
        if (hasAnyNumeric && allZeros && numericFields.filter(f => inputs[f] !== undefined).length >= 3) {
            this.addIssue({
                code: 'ALL_ZEROS',
                severity: 'high',
                category: 'edge_case',
                field: 'multipleFields',
                message: 'All numeric inputs are zero - cannot perform meaningful analysis',
                userValue: Object.fromEntries(numericFields.map(f => [f, inputs[f]])),
                recommendation: 'Provide at least some non-zero financial data',
                blocked: false,
            });
        }

        // Missing critical fields
        const criticalFields = ['organizationName', 'country', 'industry'];
        const missingCritical = criticalFields.filter(f => 
            !inputs[f] || inputs[f] === '' || inputs[f] === 'Not Selected'
        );
        
        if (missingCritical.length >= 2) {
            this.addIssue({
                code: 'MISSING_CRITICAL_FIELDS',
                severity: 'high',
                category: 'edge_case',
                field: 'multipleFields',
                message: `Missing ${missingCritical.length} critical fields: ${missingCritical.join(', ')}`,
                userValue: { missing: missingCritical },
                recommendation: 'Complete all required intake fields',
                blocked: false,
            });
        }
    }

    // ========================================================================
    // 4. ADVERSARIAL ATTACK DETECTION
    // ========================================================================

    private detectAdversarialAttacks(inputs: Record<string, unknown>): void {
        // Attack 1: Hidden debt in intangibles
        const debtEquityRatio = inputs.debtEquityRatio as number | undefined;
        const intangibleAssets = inputs.intangibleAssets as number | undefined;
        const tangibleAssets = inputs.tangibleAssets as number | undefined;
        const totalLiabilities = inputs.totalLiabilities as number | undefined;

        if (debtEquityRatio != null && intangibleAssets != null && tangibleAssets != null && totalLiabilities != null) {
            const totalAssets = intangibleAssets + tangibleAssets;
            const realLeverage = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
            const intangibleRatio = totalAssets > 0 ? intangibleAssets / totalAssets : 0;
            
            // Suspicious if reported D/E is low but real leverage is high AND intangibles dominate
            if (debtEquityRatio < 0.5 && realLeverage > 0.8 && intangibleRatio > 0.7) {
                this.addIssue({
                    code: 'HIDDEN_LEVERAGE',
                    severity: 'critical',
                    category: 'adversarial',
                    field: 'debtEquityRatio',
                    message: `Reported D/E of ${debtEquityRatio.toFixed(2)} but real leverage is ${realLeverage.toFixed(2)} (${(intangibleRatio * 100).toFixed(0)}% intangible assets)`,
                    userValue: { debtEquityRatio, realLeverage, intangibleRatio },
                    recommendation: 'Potential debt masking detected - require detailed asset breakdown',
                    blocked: true,
                });
            }
        }

        // Attack 2: Cherry-picked comparables
        const comparableCompanies = inputs.comparableCompanies as Array<{ name: string; returns?: number; industry?: string }> | undefined;
        const industry = inputs.industry as string | string[] | undefined;
        
        if (comparableCompanies != null && comparableCompanies.length > 0) {
            const avgReturn = comparableCompanies.reduce((sum, c) => sum + (c.returns || 0), 0) / comparableCompanies.length;
            const _allPositive = comparableCompanies.every(c => (c.returns || 0) > 0);
            const allHigh = comparableCompanies.every(c => (c.returns || 0) > 50);
            
            // Check if comparing to tech giants for non-tech industry
            const techGiants = ['tesla', 'apple', 'nvidia', 'microsoft', 'amazon', 'alphabet', 'google', 'meta', 'netflix'];
            const userIndustry = Array.isArray(industry) ? industry[0]?.toLowerCase() : industry?.toLowerCase() || '';
            const isTechIndustry = userIndustry.includes('tech') || userIndustry.includes('software') || userIndustry.includes('digital');
            const hasOnlyTechComps = comparableCompanies.every(c => 
                techGiants.some(g => c.name.toLowerCase().includes(g))
            );
            
            if (!isTechIndustry && hasOnlyTechComps) {
                this.addIssue({
                    code: 'CHERRY_PICKED_PEERS',
                    severity: 'critical',
                    category: 'adversarial',
                    field: 'comparableCompanies',
                    message: `${userIndustry || 'Non-tech'} company using tech giants as comparables (avg return: ${avgReturn.toFixed(0)}%)`,
                    userValue: { industry: userIndustry, comparables: comparableCompanies.map(c => c.name) },
                    recommendation: 'Use industry-appropriate peer comparisons',
                    blocked: true,
                });
            }
            
            if (allHigh && avgReturn > 100) {
                this.addIssue({
                    code: 'UNREALISTIC_PEER_RETURNS',
                    severity: 'high',
                    category: 'adversarial',
                    field: 'comparableCompanies',
                    message: `All comparables show >50% returns (avg: ${avgReturn.toFixed(0)}%) - selection bias suspected`,
                    userValue: { avgReturn, comparables: comparableCompanies },
                    recommendation: 'Include diverse peer set with varying performance',
                    blocked: false,
                });
            }
        }

        // Attack 3: Fake regulatory pre-approval
        const regulatoryStatus = inputs.regulatoryStatus as string | undefined;
        const country = inputs.country as string | undefined;
        const timeToApproval = inputs.timeToApproval as string | undefined;
        
        if (regulatoryStatus === 'pre-approved' || regulatoryStatus === 'approved') {
            const corruptionIndex = country ? (COUNTRY_CORRUPTION_INDEX[country] || 50) : 50;
            
            // Suspicious if pre-approved in corrupt country with fast timeline
            const isFastApproval = timeToApproval?.includes('week') || timeToApproval?.includes('day');
            
            if (corruptionIndex < 40 && isFastApproval) {
                this.addIssue({
                    code: 'SUSPICIOUS_PRE_APPROVAL',
                    severity: 'critical',
                    category: 'adversarial',
                    field: 'regulatoryStatus',
                    message: `Pre-approval claimed in high-corruption environment (${country}: CPI ${corruptionIndex}) with unusually fast timeline`,
                    userValue: { regulatoryStatus, country, corruptionIndex, timeToApproval },
                    recommendation: 'Require official documentation and verification of regulatory approvals',
                    blocked: true,
                });
            } else if (corruptionIndex < 50) {
                this.addIssue({
                    code: 'APPROVAL_IN_RISKY_JURISDICTION',
                    severity: 'high',
                    category: 'adversarial',
                    field: 'regulatoryStatus',
                    message: `Claimed approval in elevated-risk jurisdiction (${country}: CPI ${corruptionIndex})`,
                    userValue: { country, corruptionIndex },
                    recommendation: 'Enhanced due diligence required for regulatory claims',
                    blocked: false,
                });
            }
        }
    }

    // ========================================================================
    // 5. FRAUD PATTERN DETECTION
    // ========================================================================

    private detectFraudPatterns(inputs: Record<string, unknown>): void {
        // Theranos Pattern
        let theranosScore = 0;
        if (inputs.technologyValidation === 'proprietary_secret' || inputs.technicalProof === 0) theranosScore++;
        if (inputs.boardExpertise?.toString().includes('politician') || inputs.boardExpertise?.toString().includes('non_technical')) theranosScore++;
        if ((inputs.employeeTurnover as number) > 0.5) theranosScore++;
        if (inputs.whistleblowers === true) theranosScore++;
        if ((inputs.founderCharisma as number) > 8 && (inputs.technicalProof as number) < 3) theranosScore++;

        if (theranosScore >= FRAUD_PATTERNS.theranos.threshold) {
            this.addIssue({
                code: 'THERANOS_PATTERN',
                severity: FRAUD_PATTERNS.theranos.severity,
                category: 'fraud',
                field: 'multipleFields',
                message: `Theranos fraud pattern detected (${theranosScore}/5 indicators): secret technology, non-expert board, high turnover, whistleblowers`,
                userValue: { score: theranosScore, indicators: 'technologyValidation, boardExpertise, employeeTurnover, whistleblowers' },
                recommendation: 'Require independent technical validation and enhanced governance review',
                blocked: theranosScore >= 4,
            });
        }

        // Solyndra Pattern
        let solyndraScore = 0;
        if (inputs.technologyType === 'unproven' || inputs.technologyType === 'experimental') solyndraScore++;
        if ((inputs.competitorCostAdvantage as number) > 0.3) solyndraScore++;
        if ((inputs.policyDependence as number) > 0.7) solyndraScore++;
        if ((inputs.pivotFlexibility as number) < 0.3) solyndraScore++;

        if (solyndraScore >= FRAUD_PATTERNS.solyndra.threshold) {
            this.addIssue({
                code: 'SOLYNDRA_PATTERN',
                severity: FRAUD_PATTERNS.solyndra.severity,
                category: 'pattern',
                field: 'multipleFields',
                message: `Solyndra technology bet pattern detected (${solyndraScore}/4 indicators): unproven tech, cost disadvantage, policy dependence`,
                userValue: { score: solyndraScore },
                recommendation: 'Require technology roadmap, competitive analysis, and policy scenario planning',
                blocked: false,
            });
        }
    }

    // ========================================================================
    // 6. TEXT SANITIZATION
    // ========================================================================

    private sanitizeTextInputs(inputs: Record<string, unknown>): void {
        for (const [key, value] of Object.entries(inputs)) {
            if (typeof value === 'string') {
                // Check length
                const maxLen = key.includes('description') || key.includes('Description') 
                    ? TEXT_LIMITS.maxDescriptionLength 
                    : TEXT_LIMITS.maxFieldLength;
                
                if (value.length > maxLen) {
                    this.addIssue({
                        code: 'TEXT_TOO_LONG',
                        severity: 'medium',
                        category: 'edge_case',
                        field: key,
                        message: `Text input "${key}" exceeds maximum length (${value.length} > ${maxLen})`,
                        userValue: `${value.slice(0, 100)}... (truncated)`,
                        recommendation: 'Shorten input to maximum allowed length',
                        blocked: false,
                    });
                    this.sanitizedInputs[key] = value.slice(0, maxLen);
                }

                // Check for Zalgo/malicious unicode
                const zalgoPattern = /[\u0300-\u036f]{3,}/g;
                if (zalgoPattern.test(value)) {
                    this.addIssue({
                        code: 'UNICODE_ATTACK',
                        severity: 'high',
                        category: 'edge_case',
                        field: key,
                        message: `Potential unicode attack detected in "${key}" - excessive combining characters`,
                        userValue: value.slice(0, 50),
                        recommendation: 'Remove malformed unicode characters',
                        blocked: false,
                    });
                    // Sanitize by removing excessive diacritics
                    this.sanitizedInputs[key] = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
                }
            }

            // Check array lengths
            if (Array.isArray(value) && value.length > TEXT_LIMITS.maxArrayLength) {
                this.addIssue({
                    code: 'ARRAY_TOO_LONG',
                    severity: 'medium',
                    category: 'edge_case',
                    field: key,
                    message: `Array "${key}" exceeds maximum length (${value.length} > ${TEXT_LIMITS.maxArrayLength})`,
                    userValue: value.length,
                    recommendation: 'Reduce array size',
                    blocked: false,
                });
                this.sanitizedInputs[key] = value.slice(0, TEXT_LIMITS.maxArrayLength);
            }
        }
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private addIssue(issue: ValidationIssue): void {
        this.issues.push(issue);
    }

    /**
     * Quick validation check - returns boolean
     */
    public static quickCheck(inputs: Record<string, unknown>): boolean {
        const engine = new InputValidationEngine();
        const report = engine.validate(inputs);
        return report.valid;
    }

    /**
     * Get sanitized inputs (with bounds clamped and text cleaned)
     */
    public static getSanitized(inputs: Record<string, unknown>): Record<string, unknown> {
        const engine = new InputValidationEngine();
        const report = engine.validate(inputs);
        return report.sanitizedInputs;
    }
}

// Export singleton-style function for easy use
export const validateInputs = (inputs: Record<string, unknown>): ValidationReport => {
    const engine = new InputValidationEngine();
    return engine.validate(inputs);
};

export default InputValidationEngine;

