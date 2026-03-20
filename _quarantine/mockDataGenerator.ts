import { ReportParameters } from '../types';
import { 
    COUNTRIES, 
    SECTORS_LIST, 
    MISSION_TYPES, 
    RISK_APPETITE_LEVELS, 
    INITIAL_PARAMETERS 
} from '../constants';

const ADJECTIVES = ['Global', 'Strategic', 'Pacific', 'Northern', 'Sovereign', 'Dynamic', 'Future', 'Integrated', 'NextGen', 'Alpha', 'Omega', 'Prime', 'Apex', 'Unified'];
const NOUNS = ['Holdings', 'Ventures', 'Capital', 'Logistics', 'Energy', 'Systems', 'Solutions', 'Dynamics', 'Partners', 'Group', 'Consortium', 'Labs', 'Frontier'];
const SUFFIXES = ['Ltd', 'Inc', 'GmbH', 'Pty Ltd', 'PLC', 'Corp', 'LLC', 'S.A.'];

const getRandomItem = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateCompanyName = (): string => {
    return `${getRandomItem(ADJECTIVES)} ${getRandomItem(NOUNS)} ${getRandomItem(SUFFIXES)}`;
};

const generateDateWithinLastYear = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365 * 3)); // Last 3 years history
    return date.getTime().toString();
};

const calculateMockScores = (country: string, industry: string, risk: string) => {
    let baseScore = 70;
    
    // Country Logic
    if (['Singapore', 'United States', 'Germany', 'United Kingdom', 'Japan'].includes(country)) baseScore += 15;
    if (['Vietnam', 'Poland', 'Mexico', 'India'].includes(country)) baseScore += 5;
    if (['Nigeria', 'Argentina', 'Pakistan'].includes(country)) baseScore -= 10;
    
    // Industry Logic
    if (industry === 'Technology' || industry === 'Energy') baseScore += 5;
    
    // Risk Logic
    if (risk === 'high' || risk === 'opportunistic') baseScore -= 10; 

    // Random Variance (+/- 10)
    const variance = Math.floor(Math.random() * 20) - 10;
    
    const total = Math.min(99, Math.max(20, baseScore + variance));
    
    return {
        totalScore: total,
        marketPotential: Math.min(99, Math.floor(Math.random() * 30) + 60),
        riskFactors: Math.min(99, 100 - total + Math.floor(Math.random() * 10))
    };
};

export const generateBenchmarkData = (count: number = 100): ReportParameters[] => {
    const benchmarks: ReportParameters[] = [];

    for (let i = 0; i < count; i++) {
        const country = getRandomItem(COUNTRIES);
        const industry = getRandomItem(SECTORS_LIST);
        const risk = getRandomItem(RISK_APPETITE_LEVELS).value;
        const scores = calculateMockScores(country, industry, risk);
        
        // Determine Outcome based on Score (To prove the math works)
        let outcome: 'Success' | 'Failure' | 'Stalled' = 'Stalled';
        let outcomeReason = 'Market volatility delayed execution.';
        let multiplier = 1.0;

        if (scores.totalScore > 80) {
            outcome = 'Success';
            outcomeReason = 'High IVAS score accurately predicted rapid regulatory approval.';
            multiplier = 2.4;
        } else if (scores.totalScore < 50) {
            outcome = 'Failure';
            outcomeReason = 'Low SPI score correctly identified cultural incompatibility in leadership.';
            multiplier = 0.4;
        } else {
            outcome = Math.random() > 0.5 ? 'Success' : 'Stalled';
            outcomeReason = 'Moderate alignment. Execution depended on external capital flows.';
            multiplier = 1.2;
        }

        const benchmark: ReportParameters = {
            ...INITIAL_PARAMETERS,
            id: `HIST-${1000 + i}`,
            reportName: `Analysis: ${country} ${industry} Expansion`,
            userName: getRandomItem(['A. Smith', 'J. Doe', 'M. Chen', 'S. Gupta', 'L. Silva']),
            userTier: getRandomItem(['Tier 1', 'Tier 2']),
            
            organizationName: generateCompanyName(),
            country: country,
            region: 'Global', 
            industry: [industry],
            
            strategicIntent: [getRandomItem(MISSION_TYPES).label],
            strategicMode: 'execution',
            
            riskTolerance: risk,
            analysisTimeframe: 'Historical',
            
            status: 'complete',
            createdAt: generateDateWithinLastYear(),
            
            opportunityScore: scores,
            outcome: outcome,
            outcomeReason: outcomeReason,
            actualReturnMultiplier: multiplier
        };

        benchmarks.push(benchmark);
    }

    // Sort by date descending
    return benchmarks.sort((a, b) => parseInt(b.createdAt) - parseInt(a.createdAt));
};
