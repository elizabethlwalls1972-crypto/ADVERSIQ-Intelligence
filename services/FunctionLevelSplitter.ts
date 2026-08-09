/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * FUNCTION-LEVEL SPLITTER
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Analyzes a company's functional departments and recommends which functions
 * should stay at HQ, which should be relocated, and which should be split
 * across locations. Uses a multi-criteria assessment including cost savings
 * potential, talent availability, risk, and strategic importance.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface FunctionProfile {
  name: string;
  category: 'core' | 'support' | 'growth' | 'operational';
  headcount: number;
  avgSalaryUSD: number;
  requiresProximity: boolean; // needs to be near customers/HQ?
  requiresSpecialist: boolean; // needs rare/specialist talent?
  requiresRegulatory: boolean; // subject to regulatory location requirements?
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  clientFacing: boolean;
}

export interface SplitRecommendation {
  functionName: string;
  recommendation: 'keep' | 'relocate' | 'split';
  confidence: number; // 0-100
  reasoning: string;
  suggestedLocation: string;
  costSavingsPotential: number; // percentage
  riskLevel: 'low' | 'medium' | 'high';
  timeline: string;
  splitRatio?: { hq: number; remote: number }; // e.g. 30% HQ, 70% remote
}

export interface SplitAnalysis {
  companyName: string;
  totalFunctions: number;
  recommendations: SplitRecommendation[];
  summary: {
    keepAtHQ: number;
    relocate: number;
    split: number;
    totalHeadcountRelocatable: number;
    estimatedAnnualSavings: number;
    overallRisk: 'low' | 'medium' | 'high';
  };
}

// â"€â"€â"€ Scoring Logic â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function scoreFunctionForRelocation(fn: FunctionProfile): { score: number; factors: string[] } {
  let score = 50; // start neutral
  const factors: string[] = [];

  // Cost savings potential (higher salary = more savings opportunity)
  if (fn.avgSalaryUSD > 8000) { score += 20; factors.push('High salary â€" significant savings potential'); }
  else if (fn.avgSalaryUSD > 5000) { score += 12; factors.push('Moderate salary â€" good savings potential'); }
  else { score += 3; factors.push('Low salary â€" limited savings benefit'); }

  // Proximity requirements
  if (fn.requiresProximity) { score -= 25; factors.push('Requires HQ/client proximity'); }
  else { score += 10; factors.push('Location-independent function'); }

  // Specialist talent
  if (fn.requiresSpecialist) { score -= 15; factors.push('Requires specialist talent â€" harder to source remotely'); }
  else { score += 8; factors.push('Standard talent requirements'); }

  // Regulatory constraints
  if (fn.requiresRegulatory) { score -= 20; factors.push('Regulatory location requirements'); }

  // Data sensitivity
  if (fn.dataClassification === 'restricted') { score -= 20; factors.push('Restricted data â€" security constraints'); }
  else if (fn.dataClassification === 'confidential') { score -= 10; factors.push('Confidential data â€" moderate security needs'); }

  // Client facing
  if (fn.clientFacing) { score -= 10; factors.push('Client-facing role â€" timezone/accent considerations'); }
  else { score += 5; factors.push('Non-client-facing â€" easier to relocate'); }

  // Headcount scale
  if (fn.headcount >= 50) { score += 10; factors.push('Large team â€" economies of scale in relocation'); }
  else if (fn.headcount >= 20) { score += 5; factors.push('Medium team â€" viable for relocation'); }
  else { score -= 5; factors.push('Small team â€" may not justify standalone setup'); }

  // Category
  if (fn.category === 'support') { score += 10; factors.push('Support function â€" strong relocation candidate'); }
  if (fn.category === 'operational') { score += 8; factors.push('Operational function â€" good relocation candidate'); }
  if (fn.category === 'core') { score -= 15; factors.push('Core function â€" keep close to leadership'); }

  return { score: Math.max(0, Math.min(100, score)), factors };
}

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class FunctionLevelSplitter {

  /** Analyze functions and generate split recommendations */
  static analyze(companyName: string, functions: FunctionProfile[], targetCity: string = 'Cebu City'): SplitAnalysis {
    const recommendations: SplitRecommendation[] = functions.map(fn => {
      const { score, factors } = scoreFunctionForRelocation(fn);

      let recommendation: 'keep' | 'relocate' | 'split';
      let suggestedLocation: string;
      let costSavings: number;
      let riskLevel: 'low' | 'medium' | 'high';
      let timeline: string;
      let splitRatio: { hq: number; remote: number } | undefined;

      if (score >= 70) {
        recommendation = 'relocate';
        suggestedLocation = targetCity;
        costSavings = Math.min(65, Math.round((fn.avgSalaryUSD / 150) + 20));
        riskLevel = fn.requiresSpecialist ? 'medium' : 'low';
        timeline = fn.headcount > 50 ? '6-9 months phased' : '3-6 months';
      } else if (score >= 40) {
        recommendation = 'split';
        suggestedLocation = `HQ + ${targetCity}`;
        const remoteRatio = Math.round(Math.min(80, score * 0.8));
        splitRatio = { hq: 100 - remoteRatio, remote: remoteRatio };
        costSavings = Math.round(((fn.avgSalaryUSD / 150) + 10) * (remoteRatio / 100));
        riskLevel = 'medium';
        timeline = '4-8 months phased';
      } else {
        recommendation = 'keep';
        suggestedLocation = 'HQ';
        costSavings = 0;
        riskLevel = 'low';
        timeline = 'N/A';
      }

      return {
        functionName: fn.name,
        recommendation,
        confidence: Math.round(score),
        reasoning: factors.slice(0, 3).join('. ') + '.',
        suggestedLocation,
        costSavingsPotential: costSavings,
        riskLevel,
        timeline,
        splitRatio,
      };
    });

    const keepCount = recommendations.filter(r => r.recommendation === 'keep').length;
    const relocateCount = recommendations.filter(r => r.recommendation === 'relocate').length;
    const splitCount = recommendations.filter(r => r.recommendation === 'split').length;

    const relocatableHeadcount = functions.reduce((sum, fn, i) => {
      const rec = recommendations[i];
      if (rec.recommendation === 'relocate') return sum + fn.headcount;
      if (rec.recommendation === 'split' && rec.splitRatio) return sum + Math.round(fn.headcount * rec.splitRatio.remote / 100);
      return sum;
    }, 0);

    const estimatedSavings = functions.reduce((sum, fn, i) => {
      const rec = recommendations[i];
      return sum + Math.round(fn.headcount * fn.avgSalaryUSD * 12 * (rec.costSavingsPotential / 100));
    }, 0);

    const highRiskCount = recommendations.filter(r => r.riskLevel === 'high').length;
    const overallRisk: 'low' | 'medium' | 'high' = highRiskCount > 2 ? 'high' : highRiskCount > 0 || splitCount > relocateCount ? 'medium' : 'low';

    return {
      companyName,
      totalFunctions: functions.length,
      recommendations,
      summary: {
        keepAtHQ: keepCount,
        relocate: relocateCount,
        split: splitCount,
        totalHeadcountRelocatable: relocatableHeadcount,
        estimatedAnnualSavings: estimatedSavings,
        overallRisk,
      },
    };
  }

  /** Quick analysis with common function templates */
  static quickAnalyze(companyName: string, targetCity: string = 'Cebu City'): SplitAnalysis {
    const defaultFunctions: FunctionProfile[] = [
      { name: 'Executive Leadership', category: 'core', headcount: 5, avgSalaryUSD: 15000, requiresProximity: true, requiresSpecialist: true, requiresRegulatory: false, dataClassification: 'restricted', clientFacing: true },
      { name: 'Sales & Business Development', category: 'growth', headcount: 20, avgSalaryUSD: 8000, requiresProximity: true, requiresSpecialist: false, requiresRegulatory: false, dataClassification: 'confidential', clientFacing: true },
      { name: 'Marketing & Communications', category: 'growth', headcount: 12, avgSalaryUSD: 6000, requiresProximity: false, requiresSpecialist: false, requiresRegulatory: false, dataClassification: 'internal', clientFacing: false },
      { name: 'Software Engineering', category: 'core', headcount: 40, avgSalaryUSD: 9000, requiresProximity: false, requiresSpecialist: true, requiresRegulatory: false, dataClassification: 'confidential', clientFacing: false },
      { name: 'Quality Assurance', category: 'operational', headcount: 15, avgSalaryUSD: 6000, requiresProximity: false, requiresSpecialist: false, requiresRegulatory: false, dataClassification: 'internal', clientFacing: false },
      { name: 'Customer Support', category: 'support', headcount: 50, avgSalaryUSD: 4500, requiresProximity: false, requiresSpecialist: false, requiresRegulatory: false, dataClassification: 'internal', clientFacing: true },
      { name: 'Finance & Accounting', category: 'support', headcount: 10, avgSalaryUSD: 7000, requiresProximity: false, requiresSpecialist: false, requiresRegulatory: true, dataClassification: 'confidential', clientFacing: false },
      { name: 'HR & People Operations', category: 'support', headcount: 8, avgSalaryUSD: 5500, requiresProximity: false, requiresSpecialist: false, requiresRegulatory: false, dataClassification: 'confidential', clientFacing: false },
      { name: 'IT Infrastructure', category: 'operational', headcount: 6, avgSalaryUSD: 7500, requiresProximity: false, requiresSpecialist: true, requiresRegulatory: false, dataClassification: 'restricted', clientFacing: false },
      { name: 'Data Entry & Back Office', category: 'support', headcount: 30, avgSalaryUSD: 3500, requiresProximity: false, requiresSpecialist: false, requiresRegulatory: false, dataClassification: 'internal', clientFacing: false },
    ];
    return this.analyze(companyName, defaultFunctions, targetCity);
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(companyName: string, targetCity: string = 'Cebu City'): string {
    const analysis = this.quickAnalyze(companyName, targetCity);
    const lines: string[] = [`\n### â"€â"€ FUNCTION-LEVEL SPLIT ANALYSIS: ${companyName} â"€â"€`];
    lines.push(`**Keep at HQ:** ${analysis.summary.keepAtHQ} | **Relocate:** ${analysis.summary.relocate} | **Split:** ${analysis.summary.split}`);
    lines.push(`**Relocatable headcount:** ${analysis.summary.totalHeadcountRelocatable} | **Est. annual savings:** $${analysis.summary.estimatedAnnualSavings.toLocaleString()}`);

    for (const r of analysis.recommendations) {
      const icon = r.recommendation === 'relocate' ? 'ðŸŸ¢' : r.recommendation === 'split' ? 'ðŸŸ¡' : 'ðŸ"´';
      lines.push(`${icon} **${r.functionName}**: ${r.recommendation.toUpperCase()} â†' ${r.suggestedLocation} (${r.costSavingsPotential}% savings, ${r.riskLevel} risk)${r.splitRatio ? ` [${r.splitRatio.hq}%/${r.splitRatio.remote}%]` : ''}`);
    }
    return lines.join('\n');
  }
}
