/**
 * STRESS TEST WITH FIX VERIFICATION
 * 
 * This runs all the stress tests through the NEW validation engines
 * to verify that the fixes actually work.
 * 
 * Tests the following fixed systems:
 * - InputValidationEngine: Catches invalid inputs
 * - FormulaBoundsEngine: Prevents infinite/NaN outputs
 * - Adversarial Detection: Catches manipulation attempts
 * - Fraud Pattern Detection: Flags known failure patterns
 */

import { InputValidationEngine as _InputValidationEngine, validateInputs, ValidationReport } from './InputValidationEngine';
import { 
    FormulaBoundsEngine as _FormulaBoundsEngine, 
    calculateSafeRROI, 
    calculateSafeSPI, 
    runBoundedWilsonCowan,
    FormulaOutput 
} from './FormulaBoundsEngine';

export interface VerifiedTestResult {
    testName: string;
    category: string;
    previousStatus: 'FAILED' | 'CRITICAL';
    newStatus: 'FIXED' | 'PARTIAL' | 'STILL_FAILING';
    validationResult?: ValidationReport;
    formulaResult?: FormulaOutput;
    explanation: string;
}

export class StressTestVerification {
    private results: VerifiedTestResult[] = [];

    /**
     * RUN ALL VERIFICATION TESTS
     * These tests verify that the new validation engines catch the previously-failing scenarios
     */
    public async runAllVerifications(): Promise<{
        totalTests: number;
        fixed: number;
        partial: number;
        stillFailing: number;
        results: VerifiedTestResult[];
        summary: string;
    }> {
        console.log('\n"§ RUNNING STRESS TEST VERIFICATION "§');
        console.log('Checking that new engines catch previously-failing scenarios...\n');

        this.results = [];

        // =====================================================================
        // CATEGORY 1: INPUT EXTREMES (Previously 4 failures)
        // =====================================================================
        console.log('"Š VERIFYING INPUT EXTREMES...');

        // Test 1.1: Infinite Growth Rate
        this.verifyInputValidation(
            'Infinite Growth Rate',
            'Input Extremes',
            { projectedRevenueGrowth: 999999, marketGrowthRate: 10000 },
            'OUT_OF_BOUNDS'
        );

        // Test 1.2: Negative Investment
        this.verifyInputValidation(
            'Negative Investment Amount',
            'Input Extremes',
            { initialInvestment: -50000000, expectedReturn: 20 },
            'NEGATIVE_INVESTMENT'
        );

        // Test 1.3: Zero Market Size
        this.verifyInputValidation(
            'Zero Market Size',
            'Input Extremes',
            { totalMarketSize: 0, companyMarketShare: 100 },
            'ZERO_MARKET_SIZE'
        );

        // Test 1.4: Massive Text Input
        this.verifyInputValidation(
            'Massive Text Input',
            'Input Extremes',
            { projectDescription: 'A'.repeat(1000000), companyName: 'B'.repeat(100000) },
            'TEXT_TOO_LONG'
        );

        // =====================================================================
        // CATEGORY 2: CONTRADICTIONS (Previously 3 failures)
        // =====================================================================
        console.log('  VERIFYING CONTRADICTION DETECTION...');

        // Test 2.1: Profitable While Losing Money
        this.verifyInputValidation(
            'Profitable While Losing Money',
            'Contradictions',
            { profitMargin: 0.3, netIncome: -10000000, revenue: 50000000 },
            'PROFIT_CONTRADICTION'
        );

        // Test 2.2: Company Age vs History Mismatch
        this.verifyInputValidation(
            'One-Year-Old with 20-Year Track Record',
            'Contradictions',
            { companyAge: 1, yearsOfOperation: 20, historicalPerformance: Array(20).fill({ year: 2020 }) },
            'AGE_HISTORY_MISMATCH|HISTORY_EXCEEDS_AGE'
        );

        // Test 2.3: Monopoly Claims with Competitors
        this.verifyInputValidation(
            'Monopoly Claims in Fragmented Market',
            'Contradictions',
            { marketShare: 1.0, competitors: ['Company A', 'Company B', 'Company C'], marketConcentration: 0.1 },
            'MONOPOLY'
        );

        // =====================================================================
        // CATEGORY 3: EDGE CASES (Previously 3 failures)
        // =====================================================================
        console.log('" VERIFYING EDGE CASE HANDLING...');

        // Test 3.1: All Zeros
        this.verifyInputValidation(
            'All Zero Inputs',
            'Edge Cases',
            { revenue: 0, costs: 0, investment: 0, marketSize: 0, growth: 0 },
            'ALL_ZEROS'
        );

        // Test 3.2: Missing Critical Fields
        this.verifyInputValidation(
            'Incomplete Data - Missing Critical Fields',
            'Edge Cases',
            { companyName: 'Test Corp' }, // Missing country, industry
            'MISSING_CRITICAL_FIELDS'
        );

        // Test 3.3: Unicode Attack
        this.verifyInputValidation(
            'Unicode Attack (Zalgo Text)',
            'Edge Cases',
            { 
                companyName: 'Test-Zalgo-Company',
                region: 'Test-Region',
                description: 'Test zalgo description'
            },
            'UNICODE_ATTACK'
        );

        // =====================================================================
        // CATEGORY 4: FORMULA BREAKING (Previously 3 failures)
        // =====================================================================
        console.log('VERIFYING FORMULA BOUNDS...');

        // Test 4.1: RROI with Zero Risk
        this.verifyFormulaBounds(
            'RROI: Zero Risk Claimed',
            'Formula Breaking',
            () => calculateSafeRROI(500, 0, 0),
            'zero risk'
        );

        // Test 4.2: SPI with Perfect Scores
        this.verifyFormulaBounds(
            'SPI: Perfect Scores on Everything',
            'Formula Breaking',
            () => calculateSafeSPI({
                marketDominance: 100,
                barrierToEntry: 100,
                brandStrength: 100,
                ipValue: 100,
                networkEffects: 100
            }),
            'perfect score'
        );

        // Test 4.3: Neural Field Explosion
        this.verifyNeuralField(
            'Neural Field: Maximum Excitation',
            'Formula Breaking',
            { excitatoryInput: 1e10, inhibitoryInput: 0, timeSteps: 1000 }
        );

        // =====================================================================
        // CATEGORY 5: ADVERSARIAL ATTACKS (Previously 3 CRITICAL failures)
        // =====================================================================
        console.log('VERIFYING ADVERSARIAL DETECTION...');

        // Test 5.1: Hidden Debt in Intangibles
        this.verifyInputValidation(
            'Adversarial: Hide Debt in Intangibles',
            'Adversarial',
            { 
                debtEquityRatio: 0.29, 
                intangibleAssets: 500000000, 
                tangibleAssets: 50000000,
                totalLiabilities: 600000000 
            },
            'HIDDEN_LEVERAGE'
        );

        // Test 5.2: Cherry-Picked Comparables
        this.verifyInputValidation(
            'Adversarial: All Successful Peers',
            'Adversarial',
            { 
                comparableCompanies: [
                    { name: 'Tesla', returns: 1500 },
                    { name: 'Nvidia', returns: 2000 },
                    { name: 'Apple', returns: 500 }
                ],
                industry: ['Manufacturing']
            },
            'CHERRY_PICKED_PEERS'
        );

        // Test 5.3: Fake Pre-Approval in Corrupt Region
        this.verifyInputValidation(
            'Adversarial: Claim Pre-Approval in Corrupt Region',
            'Adversarial',
            { 
                regulatoryStatus: 'pre-approved',
                country: 'Venezuela',
                timeToApproval: '1 week'
            },
            'SUSPICIOUS_PRE_APPROVAL'
        );

        // =====================================================================
        // CATEGORY 7: KNOWN FAILURE PATTERNS (Previously 2 failures)
        // =====================================================================
        console.log('"‹ VERIFYING FRAUD PATTERN DETECTION...');

        // Test 7.1: Theranos Pattern
        this.verifyInputValidation(
            'Known Pattern: Theranos Red Flags',
            'Real-World Failures',
            { 
                technologyValidation: 'proprietary_secret',
                boardExpertise: 'politicians_not_scientists',
                employeeTurnover: 0.8,
                whistleblowers: true,
                founderCharisma: 10,
                technicalProof: 0
            },
            'THERANOS_PATTERN'
        );

        // Test 7.2: Solyndra Pattern
        this.verifyInputValidation(
            'Known Pattern: Solyndra Technology Risk',
            'Real-World Failures',
            { 
                technologyType: 'unproven',
                competitorCostAdvantage: 0.5,
                policyDependence: 0.9,
                pivotFlexibility: 0.1
            },
            'SOLYNDRA_PATTERN'
        );

        // Generate summary
        const fixed = this.results.filter(r => r.newStatus === 'FIXED').length;
        const partial = this.results.filter(r => r.newStatus === 'PARTIAL').length;
        const stillFailing = this.results.filter(r => r.newStatus === 'STILL_FAILING').length;

        const summary = this.generateSummary(fixed, partial, stillFailing);
        console.log('\n' + summary);

        return {
            totalTests: this.results.length,
            fixed,
            partial,
            stillFailing,
            results: this.results,
            summary
        };
    }

    /**
     * VERIFY INPUT VALIDATION
     * Checks if the new InputValidationEngine catches the issue
     */
    private verifyInputValidation(
        testName: string,
        category: string,
        input: Record<string, unknown>,
        expectedCodePattern: string
    ): void {
        const report = validateInputs(input);
        
        // Check if any issue matches the expected pattern
        const patterns = expectedCodePattern.split('|');
        const issueFound = report.issues.some(issue => 
            patterns.some(pattern => issue.code.includes(pattern))
        );

        const blocked = report.blockedReasons.length > 0;
        const hasIssues = report.issues.length > 0;

        let status: 'FIXED' | 'PARTIAL' | 'STILL_FAILING';
        let explanation: string;

        if (issueFound && (blocked || hasIssues)) {
            status = 'FIXED';
            explanation = `✓ Now detected: ${report.issues.find(i => patterns.some(p => i.code.includes(p)))?.message || 'Issue caught'}`;
        } else if (hasIssues) {
            status = 'PARTIAL';
            explanation = `⚠ Different issue detected: ${report.issues[0]?.code}`;
        } else {
            status = 'STILL_FAILING';
            explanation = `✗ Not detected - validation passed when it should have failed`;
        }

        console.log(`  ${status === 'FIXED' ? '"' : status === 'PARTIAL' ? '' : '-'} ${testName}: ${status}`);

        this.results.push({
            testName,
            category,
            previousStatus: 'FAILED',
            newStatus: status,
            validationResult: report,
            explanation
        });
    }

    /**
     * VERIFY FORMULA BOUNDS
     * Checks if the FormulaBoundsEngine properly handles extreme values
     */
    private verifyFormulaBounds(
        testName: string,
        category: string,
        formulaFn: () => FormulaOutput,
        expectedWarningPattern: string
    ): void {
        const result = formulaFn();
        
        const hasWarnings = result.warningFlags.length > 0;
        const wasCapped = result.wasCapped;
        const confidenceReduced = result.confidence < 1.0;
        const warningMatches = result.warningFlags.some(w => 
            w.toLowerCase().includes(expectedWarningPattern.toLowerCase())
        );

        let status: 'FIXED' | 'PARTIAL' | 'STILL_FAILING';
        let explanation: string;

        if ((wasCapped || confidenceReduced) && warningMatches) {
            status = 'FIXED';
            explanation = `" Formula bounded: ${result.warningFlags.join(', ')}`;
        } else if (hasWarnings || confidenceReduced) {
            status = 'PARTIAL';
            explanation = `⚠ Some handling: confidence=${result.confidence.toFixed(2)}, warnings=${result.warningFlags.length}`;
        } else {
            status = 'STILL_FAILING';
            explanation = `- Formula produced result without warnings`;
        }

        console.log(`  ${status === 'FIXED' ? '"' : status === 'PARTIAL' ? '' : '-'} ${testName}: ${status}`);

        this.results.push({
            testName,
            category,
            previousStatus: 'CRITICAL',
            newStatus: status,
            formulaResult: result,
            explanation
        });
    }

    /**
     * VERIFY NEURAL FIELD STABILITY
     */
    private verifyNeuralField(
        testName: string,
        category: string,
        params: { excitatoryInput: number; inhibitoryInput: number; timeSteps: number }
    ): void {
        const result = runBoundedWilsonCowan(params);

        const isBounded = result.E <= 1 && result.E >= 0 && result.I <= 1 && result.I >= 0;
        const hasWarnings = result.warningFlags.length > 0;
        const stable = result.stable;

        let status: 'FIXED' | 'PARTIAL' | 'STILL_FAILING';
        let explanation: string;

        if (isBounded && hasWarnings) {
            status = 'FIXED';
            explanation = `" Neural field bounded: E=${result.E.toFixed(4)}, I=${result.I.toFixed(4)}, stable=${stable}`;
        } else if (isBounded) {
            status = 'PARTIAL';
            explanation = `⚠ Bounded but no warnings: E=${result.E.toFixed(4)}, I=${result.I.toFixed(4)}`;
        } else {
            status = 'STILL_FAILING';
            explanation = `- Field exploded: E=${result.E}, I=${result.I}`;
        }

        console.log(`  ${status === 'FIXED' ? '"' : status === 'PARTIAL' ? '' : '-'} ${testName}: ${status}`);

        this.results.push({
            testName,
            category,
            previousStatus: 'CRITICAL',
            newStatus: status,
            explanation
        });
    }

    /**
     * GENERATE SUMMARY REPORT
     */
    private generateSummary(fixed: number, partial: number, stillFailing: number): string {
        const total = this.results.length;
        
        let summary = '\n' + '='.repeat(80) + '\n';
        summary += 'STRESS TEST VERIFICATION RESULTS\n';
        summary += '='.repeat(80) + '\n\n';

        summary += `Total Previously-Failing Tests: ${total}\n`;
        summary += `" FIXED: ${fixed} (${(fixed / total * 100).toFixed(1)}%)\n`;
        summary += `⚠ PARTIAL: ${partial} (${(partial / total * 100).toFixed(1)}%)\n`;
        summary += `- STILL FAILING: ${stillFailing} (${(stillFailing / total * 100).toFixed(1)}%)\n\n`;

        summary += 'BY CATEGORY:\n';
        const byCategory = this.results.reduce((acc, r) => {
            if (!acc[r.category]) acc[r.category] = { fixed: 0, partial: 0, failing: 0 };
            if (r.newStatus === 'FIXED') acc[r.category].fixed++;
            else if (r.newStatus === 'PARTIAL') acc[r.category].partial++;
            else acc[r.category].failing++;
            return acc;
        }, {} as Record<string, { fixed: number; partial: number; failing: number }>);

        for (const [cat, stats] of Object.entries(byCategory)) {
            summary += `  ${cat}: ${stats.fixed}✓ ${stats.partial}⚠ ${stats.failing}✗\n`;
        }

        summary += '\n' + '='.repeat(80) + '\n';
        
        if (stillFailing === 0 && partial <= 2) {
            summary += 'VERDICT: All critical issues FIXED. System is production-ready.\n';
        } else if (stillFailing === 0) {
            summary += 'VERDICT: Critical issues fixed. Some partial fixes need review.\n';
        } else {
            summary += `"´ VERDICT: ${stillFailing} tests still failing. More fixes needed.\n`;
        }

        summary += '='.repeat(80) + '\n';

        return summary;
    }
}

// Export for CLI/test usage
export const stressTestVerification = new StressTestVerification();

// Self-executing test function
export async function runVerification(): Promise<void> {
    const verification = new StressTestVerification();
    const results = await verification.runAllVerifications();
    console.log(JSON.stringify({
        fixed: results.fixed,
        partial: results.partial,
        stillFailing: results.stillFailing,
        totalTests: results.totalTests
    }, null, 2));
}

