/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * WORKFORCE INTELLIGENCE ENGINE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Deep workforce analytics for each destination city. Covers labor pool size,
 * skill distribution, salary benchmarks, attrition rates, university pipelines,
 * and workforce quality indicators.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export interface WorkforceProfile {
  cityId: string;
  city: string;
  country: string;
  totalLaborForce: number;
  unemploymentRate: number;
  avgMonthlyWageUSD: number;
  skillDistribution: Record<string, number>; // skill â†' available workers estimate
  salaryBenchmarks: Array<{ role: string; juniorUSD: number; midUSD: number; seniorUSD: number }>;
  universityPipeline: Array<{ institution: string; annualGraduates: number; topPrograms: string[] }>;
  attritionBenchmarks: { itBpo: number; manufacturing: number; professional: number }; // annual %
  englishProficiency: 'native' | 'high' | 'moderate' | 'low';
  workCulture: string[];
  workforceScore: number; // 0-100
  keyInsights: string[];
}

// â"€â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const WORKFORCE_PROFILES: WorkforceProfile[] = [
  {
    cityId: 'cebu-city',
    city: 'Cebu City',
    country: 'Philippines',
    totalLaborForce: 550000,
    unemploymentRate: 5.2,
    avgMonthlyWageUSD: 420,
    skillDistribution: { 'Customer Service': 45000, 'Software Development': 12000, 'Finance & Accounting': 18000, 'Digital Marketing': 8000, 'Data Entry / Admin': 35000, 'Engineering': 6000, 'Healthcare': 15000 },
    salaryBenchmarks: [
      { role: 'Customer Service Agent', juniorUSD: 320, midUSD: 450, seniorUSD: 620 },
      { role: 'Software Developer', juniorUSD: 600, midUSD: 1100, seniorUSD: 1800 },
      { role: 'Accountant', juniorUSD: 400, midUSD: 700, seniorUSD: 1200 },
      { role: 'Project Manager', juniorUSD: 700, midUSD: 1200, seniorUSD: 2000 },
      { role: 'Data Analyst', juniorUSD: 500, midUSD: 900, seniorUSD: 1500 },
      { role: 'QA Engineer', juniorUSD: 500, midUSD: 850, seniorUSD: 1400 },
    ],
    universityPipeline: [
      { institution: 'University of San Carlos', annualGraduates: 5000, topPrograms: ['Engineering', 'IT', 'Business'] },
      { institution: 'University of Cebu', annualGraduates: 8000, topPrograms: ['Nursing', 'Business', 'IT', 'Maritime'] },
      { institution: 'Cebu Institute of Technology - University', annualGraduates: 3500, topPrograms: ['Engineering', 'Architecture', 'IT'] },
      { institution: 'University of the Philippines Cebu', annualGraduates: 800, topPrograms: ['Computer Science', 'Management', 'Communication'] },
    ],
    attritionBenchmarks: { itBpo: 22, manufacturing: 12, professional: 15 },
    englishProficiency: 'high',
    workCulture: ['Strong team orientation', 'Respect for hierarchy', 'Relationship-driven', 'High loyalty when well-treated', 'Resilient and adaptable'],
    workforceScore: 82,
    keyInsights: ['175,000+ in IT-BPO sector makes Cebu the second-largest hub in PH', 'Attrition is the #1 challenge â€" retention programs essential', 'Mid-level talent abundant, senior talent scarce', 'Night shift availability is a competitive advantage'],
  },
  {
    cityId: 'davao-city',
    city: 'Davao City',
    country: 'Philippines',
    totalLaborForce: 380000,
    unemploymentRate: 4.8,
    avgMonthlyWageUSD: 380,
    skillDistribution: { 'Customer Service': 18000, 'Software Development': 5000, 'Finance & Accounting': 8000, 'Agriculture/Agribusiness': 25000, 'Data Entry / Admin': 15000, 'Engineering': 4000 },
    salaryBenchmarks: [
      { role: 'Customer Service Agent', juniorUSD: 280, midUSD: 400, seniorUSD: 560 },
      { role: 'Software Developer', juniorUSD: 520, midUSD: 950, seniorUSD: 1600 },
      { role: 'Accountant', juniorUSD: 350, midUSD: 600, seniorUSD: 1000 },
      { role: 'Project Manager', juniorUSD: 600, midUSD: 1000, seniorUSD: 1700 },
    ],
    universityPipeline: [
      { institution: 'Ateneo de Davao University', annualGraduates: 3000, topPrograms: ['Business', 'Engineering', 'IT'] },
      { institution: 'University of the Philippines Mindanao', annualGraduates: 600, topPrograms: ['Food Science', 'Environmental Science', 'Management'] },
      { institution: 'University of Southeastern Philippines', annualGraduates: 4000, topPrograms: ['Education', 'Engineering', 'IT'] },
    ],
    attritionBenchmarks: { itBpo: 16, manufacturing: 10, professional: 12 },
    englishProficiency: 'high',
    workCulture: ['Strong work ethic', 'Lower attrition than Manila/Cebu', 'Community-oriented', 'Punctual and disciplined'],
    workforceScore: 72,
    keyInsights: ['Lower attrition than Cebu/Manila â€" best retention in PH', 'Growing tech community but still small', 'Salaries 10-15% below Cebu equivalents', '40,000+ IT-BPO workers and growing fast'],
  },
  {
    cityId: 'townsville',
    city: 'Townsville',
    country: 'Australia',
    totalLaborForce: 95000,
    unemploymentRate: 6.8,
    avgMonthlyWageUSD: 4200,
    skillDistribution: { 'Defence / Security': 8000, 'Healthcare': 12000, 'Engineering': 5000, 'Education': 6000, 'IT / Digital': 2500, 'Marine Science': 1500, 'Construction': 8000 },
    salaryBenchmarks: [
      { role: 'Software Developer', juniorUSD: 4500, midUSD: 6500, seniorUSD: 9000 },
      { role: 'Project Manager', juniorUSD: 5000, midUSD: 7500, seniorUSD: 10000 },
      { role: 'Engineer', juniorUSD: 5500, midUSD: 8000, seniorUSD: 11000 },
      { role: 'Admin / Support', juniorUSD: 3200, midUSD: 4000, seniorUSD: 5000 },
    ],
    universityPipeline: [
      { institution: 'James Cook University', annualGraduates: 4000, topPrograms: ['Marine Biology', 'Tropical Health', 'Engineering', 'IT'] },
      { institution: 'TAFE North Queensland', annualGraduates: 5000, topPrograms: ['Trades', 'Healthcare', 'Business'] },
    ],
    attritionBenchmarks: { itBpo: 15, manufacturing: 8, professional: 12 },
    englishProficiency: 'native',
    workCulture: ['Work-life balance priority', 'Direct communication style', 'Safety-conscious', 'Outdoor/active lifestyle'],
    workforceScore: 55,
    keyInsights: ['Small total market â€" specialist roles require FIFO from Brisbane', 'Defence and resources anchor workforce', 'JCU is primary talent pipeline', 'Regional loading on salaries (15-20% above capital city rates)'],
  },
  {
    cityId: 'singapore',
    city: 'Singapore',
    country: 'Singapore',
    totalLaborForce: 3700000,
    unemploymentRate: 2.1,
    avgMonthlyWageUSD: 5200,
    skillDistribution: { 'Finance & Banking': 200000, 'Technology': 180000, 'Engineering': 150000, 'Professional Services': 120000, 'Logistics': 80000, 'Manufacturing': 70000 },
    salaryBenchmarks: [
      { role: 'Software Developer', juniorUSD: 3800, midUSD: 6000, seniorUSD: 10000 },
      { role: 'Financial Analyst', juniorUSD: 3500, midUSD: 5500, seniorUSD: 9000 },
      { role: 'Project Manager', juniorUSD: 4000, midUSD: 7000, seniorUSD: 12000 },
      { role: 'Data Scientist', juniorUSD: 4500, midUSD: 7500, seniorUSD: 12000 },
    ],
    universityPipeline: [
      { institution: 'National University of Singapore', annualGraduates: 8000, topPrograms: ['Computing', 'Engineering', 'Business'] },
      { institution: 'Nanyang Technological University', annualGraduates: 7000, topPrograms: ['Engineering', 'Business', 'Sciences'] },
      { institution: 'Singapore Management University', annualGraduates: 2500, topPrograms: ['Business', 'IT', 'Law'] },
    ],
    attritionBenchmarks: { itBpo: 18, manufacturing: 10, professional: 14 },
    englishProficiency: 'high',
    workCulture: ['High-performance culture', 'Meritocratic', 'Long working hours', 'Multicultural teams', 'Process-driven'],
    workforceScore: 90,
    keyInsights: ['World-class talent but extremely expensive', 'EP/SP visa restrictions tightening â€" local hiring mandates', 'Talent competition intense with all global firms present', 'Best for senior/leadership roles, cost-prohibitive for scale operations'],
  },
  {
    cityId: 'pagadian-city',
    city: 'Pagadian City',
    country: 'Philippines',
    totalLaborForce: 65000,
    unemploymentRate: 7.5,
    avgMonthlyWageUSD: 250,
    skillDistribution: { 'Education': 5000, 'Agriculture': 15000, 'Customer Service': 2000, 'Admin / Clerical': 4000, 'Healthcare': 3000, 'Maritime': 2000 },
    salaryBenchmarks: [
      { role: 'Customer Service Agent', juniorUSD: 200, midUSD: 300, seniorUSD: 420 },
      { role: 'Admin Assistant', juniorUSD: 180, midUSD: 260, seniorUSD: 380 },
      { role: 'Accountant', juniorUSD: 280, midUSD: 450, seniorUSD: 700 },
    ],
    universityPipeline: [
      { institution: 'Western Mindanao State University - Pagadian', annualGraduates: 3000, topPrograms: ['Education', 'Business', 'Agriculture'] },
      { institution: 'Mindanao State University - Pagadian', annualGraduates: 1500, topPrograms: ['Education', 'Agriculture', 'Fisheries'] },
    ],
    attritionBenchmarks: { itBpo: 8, manufacturing: 6, professional: 10 },
    englishProficiency: 'moderate',
    workCulture: ['High loyalty', 'Community-rooted â€" low attrition', 'Eager to learn', 'Less exposure to corporate environments'],
    workforceScore: 42,
    keyInsights: ['Lowest cost workforce in dataset', 'Exceptional retention â€" below 10% attrition', 'Limited skilled talent pool â€" invest in training', 'WMSU is the primary pipeline â€" partnership critical'],
  },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class WorkforceIntelligenceEngine {

  /** Get workforce profile for a city */
  static getProfile(cityId: string): WorkforceProfile | null {
    return WORKFORCE_PROFILES.find(p => p.cityId === cityId) || null;
  }

  /** Get all profiles */
  static getAllProfiles(): WorkforceProfile[] {
    return [...WORKFORCE_PROFILES];
  }

  /** Get salary benchmark for a specific role in a city */
  static getSalary(cityId: string, role: string): { role: string; juniorUSD: number; midUSD: number; seniorUSD: number } | null {
    const profile = this.getProfile(cityId);
    if (!profile) return null;
    return profile.salaryBenchmarks.find(s => s.role.toLowerCase().includes(role.toLowerCase())) || null;
  }

  /** Compare workforce across cities */
  static compare(cityIds: string[]): Array<{
    cityId: string;
    city: string;
    score: number;
    laborForce: number;
    avgWage: number;
    attrition: number;
    english: string;
    topInsight: string;
  }> {
    return cityIds.map(id => {
      const p = this.getProfile(id);
      if (!p) return null;
      return {
        cityId: p.cityId,
        city: p.city,
        score: p.workforceScore,
        laborForce: p.totalLaborForce,
        avgWage: p.avgMonthlyWageUSD,
        attrition: p.attritionBenchmarks.itBpo,
        english: p.englishProficiency,
        topInsight: p.keyInsights[0] || '',
      };
    }).filter(Boolean) as Array<{ cityId: string; city: string; score: number; laborForce: number; avgWage: number; attrition: number; english: string; topInsight: string }>;
  }

  /** Calculate cost comparison for a headcount target */
  static costComparison(cityIds: string[], headcount: number, role: string): Array<{
    city: string;
    monthlyCostUSD: number;
    annualCostUSD: number;
    savingsVsHighest: number;
  }> {
    const costs = cityIds.map(id => {
      const salary = this.getSalary(id, role);
      const profile = this.getProfile(id);
      if (!salary || !profile) return null;
      const mid = salary.midUSD;
      return { city: profile.city, monthlyCostUSD: mid * headcount, annualCostUSD: mid * headcount * 12, savingsVsHighest: 0 };
    }).filter(Boolean) as Array<{ city: string; monthlyCostUSD: number; annualCostUSD: number; savingsVsHighest: number }>;

    const highest = Math.max(...costs.map(c => c.annualCostUSD));
    for (const c of costs) {
      c.savingsVsHighest = highest > 0 ? Math.round(((highest - c.annualCostUSD) / highest) * 100) : 0;
    }
    return costs.sort((a, b) => a.annualCostUSD - b.annualCostUSD);
  }

  /** Generate prompt-ready summary */
  static summarizeForPrompt(cityId: string): string {
    const p = this.getProfile(cityId);
    if (!p) return '';
    const lines: string[] = [`\n### â"€â"€ WORKFORCE INTELLIGENCE: ${p.city} (Score: ${p.workforceScore}/100) â"€â"€`];
    lines.push(`**Labor force:** ${p.totalLaborForce.toLocaleString()} | **Unemployment:** ${p.unemploymentRate}% | **Avg wage:** $${p.avgMonthlyWageUSD}/mo | **English:** ${p.englishProficiency}`);
    lines.push(`**Salary benchmarks:** ${p.salaryBenchmarks.slice(0, 3).map(s => `${s.role}: $${s.juniorUSD}-$${s.seniorUSD}`).join(' | ')}`);
    lines.push(`**University pipeline:** ${p.universityPipeline.map(u => `${u.institution} (${u.annualGraduates}/yr)`).join(' | ')}`);
    lines.push(`**Attrition:** IT-BPO ${p.attritionBenchmarks.itBpo}% | Manufacturing ${p.attritionBenchmarks.manufacturing}% | Professional ${p.attritionBenchmarks.professional}%`);
    lines.push(`**Key insights:** ${p.keyInsights.slice(0, 2).join(' | ')}`);
    return lines.join('\n');
  }
}
