/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * GOVERNMENT INCENTIVE VAULT
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Comprehensive global database of government incentives, grants, tax holidays,
 * SEZ benefits, and investment programs. The Incentive Stacking Calculator
 * determines the TOTAL incentive package a company can claim for any
 * company + regional city pair.
 *
 * This is the first system that calculates COMBINED, STACKABLE incentives.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export type IncentiveType = 'tax_holiday' | 'grant' | 'subsidy' | 'land_concession' | 'training_grant' |
  'sez_benefit' | 'export_incentive' | 'r_and_d_credit' | 'employment_subsidy' | 'infrastructure_support' |
  'visa_fast_track' | 'utility_discount' | 'duty_exemption' | 'loan_guarantee';

export type IncentiveLevel = 'national' | 'regional' | 'municipal' | 'sez';

export interface IncentiveRecord {
  id: string;
  country: string;
  region?: string;
  city?: string;
  name: string;
  type: IncentiveType;
  level: IncentiveLevel;
  description: string;
  value: IncentiveValue;
  eligibility: string[];
  targetSectors: string[];
  minInvestment?: number;     // USD
  minJobs?: number;
  durationYears: number;
  stackable: boolean;
  stacksWith?: string[];      // IDs of compatible incentives
  sourceUrl?: string;
  lastVerified: string;
}

export interface IncentiveValue {
  type: 'percentage' | 'fixed' | 'per_employee' | 'per_sqm';
  amount: number;
  maxAmount?: number;
  currency: string;
}

export interface StackedIncentivePackage {
  company: string;
  city: string;
  country: string;
  applicableIncentives: AppliedIncentive[];
  totalFirstYearValue: number;
  totalLifetimeValue: number;
  effectiveTaxRate: number;
  savingsVsTier1: number;
  stackingNotes: string[];
  applicationTimeline: string;
  riskFactors: string[];
  generatedAt: string;
}

export interface AppliedIncentive {
  incentive: IncentiveRecord;
  estimatedAnnualValue: number;
  estimatedLifetimeValue: number;
  eligibilityMatch: number;  // 0-100
  notes: string;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  sectors: string[];
  headcount: number;
  annualRevenue: number;
  investmentAmount: number;
  jobsToCreate: number;
  functions: string[];
}

// â"€â"€â"€ Global Incentive Database â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const INCENTIVE_DB: IncentiveRecord[] = [
  // â"€â"€â"€ Philippines â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'PH-CREATE-01', country: 'Philippines', name: 'CREATE MORE Act â€" Income Tax Holiday', type: 'tax_holiday', level: 'national', description: 'Corporate income tax holiday for registered business enterprises in priority sectors', value: { type: 'percentage', amount: 100, currency: 'PHP' }, eligibility: ['Registered with BOI/PEZA', 'Priority investment area', 'Min $50K investment'], targetSectors: ['Technology', 'Manufacturing', 'BPO', 'Agribusiness', 'Infrastructure'], minInvestment: 50000, minJobs: 10, durationYears: 7, stackable: true, stacksWith: ['PH-PEZA-01', 'PH-PEZA-02', 'PH-TRAIN-01'], lastVerified: '2025-01-15' },
  { id: 'PH-PEZA-01', country: 'Philippines', city: 'Cebu City', name: 'PEZA Special Economic Zone Benefits', type: 'sez_benefit', level: 'regional', description: '5% gross income earned (GIE) in lieu of all taxes after ITH period', value: { type: 'percentage', amount: 5, currency: 'PHP' }, eligibility: ['Located in PEZA zone', 'Export-oriented'], targetSectors: ['Technology', 'Manufacturing', 'BPO', 'Electronics'], durationYears: 20, stackable: true, stacksWith: ['PH-CREATE-01', 'PH-TRAIN-01'], lastVerified: '2025-01-15' },
  { id: 'PH-PEZA-02', country: 'Philippines', city: 'Davao City', name: 'PEZA Davao IT Park Benefits', type: 'sez_benefit', level: 'regional', description: 'Tax and duty-free importation of capital equipment and raw materials', value: { type: 'percentage', amount: 100, currency: 'PHP' }, eligibility: ['Located in Davao PEZA IT Park', 'Export min 70%'], targetSectors: ['Technology', 'BPO', 'Digital Services'], durationYears: 15, stackable: true, lastVerified: '2025-01-15' },
  { id: 'PH-TRAIN-01', country: 'Philippines', name: 'DOLE Training Grant', type: 'training_grant', level: 'national', description: 'Government co-funding for employee training and upskilling programs', value: { type: 'per_employee', amount: 500, currency: 'USD' }, eligibility: ['Registered employer', 'Training plan approved by DOLE'], targetSectors: ['Technology', 'Manufacturing', 'BPO', 'Agriculture'], durationYears: 3, stackable: true, lastVerified: '2025-01-15' },
  { id: 'PH-TIEZA-01', country: 'Philippines', name: 'TIEZA Tourism Infrastructure Grant', type: 'grant', level: 'national', description: 'Support for tourism-related infrastructure in development zones', value: { type: 'fixed', amount: 200000, maxAmount: 500000, currency: 'USD' }, eligibility: ['Tourism-related project', 'In designated tourism zone'], targetSectors: ['Tourism', 'Hospitality', 'Infrastructure'], durationYears: 5, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Australia â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'AU-NTGI-01', country: 'Australia', region: 'Northern Territory', city: 'Darwin', name: 'NT Government Investment Attraction', type: 'grant', level: 'regional', description: 'Grants and payroll tax exemptions for companies establishing in NT', value: { type: 'fixed', amount: 500000, maxAmount: 2000000, currency: 'AUD' }, eligibility: ['Establish operations in NT', 'Create min 20 local jobs'], targetSectors: ['Mining', 'Defence', 'Renewable Energy', 'Agriculture', 'Technology'], minJobs: 20, durationYears: 5, stackable: true, stacksWith: ['AU-RND-01', 'AU-PAYROLL-NT'], lastVerified: '2025-01-15' },
  { id: 'AU-RND-01', country: 'Australia', name: 'R&D Tax Incentive', type: 'r_and_d_credit', level: 'national', description: '43.5% refundable tax offset for R&D expenditure (turnover < $20M)', value: { type: 'percentage', amount: 43.5, currency: 'AUD' }, eligibility: ['Conducting eligible R&D activities', 'Registered with AusIndustry'], targetSectors: ['Technology', 'Manufacturing', 'Biotech', 'Agriculture', 'Mining'], durationYears: 99, stackable: true, lastVerified: '2025-01-15' },
  { id: 'AU-PAYROLL-NT', country: 'Australia', region: 'Northern Territory', name: 'NT Payroll Tax Exemption', type: 'employment_subsidy', level: 'regional', description: 'Payroll tax exemption for first 2 years of operation in NT', value: { type: 'percentage', amount: 100, currency: 'AUD' }, eligibility: ['New business in NT', 'Min 5 FTE employees'], targetSectors: ['Technology', 'Manufacturing', 'Mining', 'Agriculture', 'Professional Services'], minJobs: 5, durationYears: 2, stackable: true, lastVerified: '2025-01-15' },
  { id: 'AU-QLD-01', country: 'Australia', region: 'Queensland', city: 'Townsville', name: 'Townsville Enterprise Hub Incentive', type: 'infrastructure_support', level: 'municipal', description: 'Subsidized office space and infrastructure for new enterprises', value: { type: 'per_sqm', amount: 120, currency: 'AUD' }, eligibility: ['Establish in Townsville', 'Technology or innovation sector'], targetSectors: ['Technology', 'Defence', 'Renewable Energy', 'Marine'], durationYears: 3, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Colombia â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'CO-FTZ-01', country: 'Colombia', city: 'Medellin', name: 'Ruta N Free Trade Zone Benefits', type: 'sez_benefit', level: 'municipal', description: 'Reduced 20% income tax rate + duty-free imports for companies in Ruta N zone', value: { type: 'percentage', amount: 50, currency: 'COP' }, eligibility: ['Located in Ruta N zone', 'Technology or innovation sector'], targetSectors: ['Technology', 'BPO', 'Creative', 'Biotech'], durationYears: 10, stackable: true, stacksWith: ['CO-TRAIN-01'], lastVerified: '2025-01-15' },
  { id: 'CO-TRAIN-01', country: 'Colombia', name: 'SENA Workforce Training Fund', type: 'training_grant', level: 'national', description: 'Government-funded training programs for new hires', value: { type: 'per_employee', amount: 400, currency: 'USD' }, eligibility: ['Registered employer', 'Formal contracts'], targetSectors: ['Technology', 'Manufacturing', 'BPO', 'Agriculture'], durationYears: 2, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Georgia â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'GE-ITZ-01', country: 'Georgia', city: 'Tbilisi', name: 'Free Industrial Zone Tax Benefits', type: 'sez_benefit', level: 'national', description: 'Zero corporate tax, zero VAT, zero property tax in FIZ', value: { type: 'percentage', amount: 100, currency: 'GEL' }, eligibility: ['Located in Free Industrial Zone', 'Export-oriented'], targetSectors: ['Manufacturing', 'Technology', 'Logistics', 'Trading'], durationYears: 99, stackable: false, lastVerified: '2025-01-15' },
  { id: 'GE-IT-01', country: 'Georgia', name: 'Virtual Zone Person Status', type: 'tax_holiday', level: 'national', description: 'Zero profit tax on IT services exported from Georgia', value: { type: 'percentage', amount: 100, currency: 'GEL' }, eligibility: ['IT company', 'Services exported'], targetSectors: ['Technology', 'Digital Services', 'BPO'], durationYears: 99, stackable: false, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Romania â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'RO-IT-01', country: 'Romania', city: 'Cluj-Napoca', name: 'IT Sector Income Tax Exemption', type: 'tax_holiday', level: 'national', description: 'Income tax exemption for IT employees', value: { type: 'percentage', amount: 100, currency: 'RON' }, eligibility: ['IT company', 'Employee with relevant degree or certification'], targetSectors: ['Technology', 'Software', 'Digital Services'], durationYears: 99, stackable: true, stacksWith: ['RO-RND-01'], lastVerified: '2025-01-15' },
  { id: 'RO-RND-01', country: 'Romania', name: 'R&D Super Deduction', type: 'r_and_d_credit', level: 'national', description: '50% additional deduction for R&D costs + accelerated depreciation', value: { type: 'percentage', amount: 50, currency: 'RON' }, eligibility: ['R&D activities', 'Registered project'], targetSectors: ['Technology', 'Manufacturing', 'Biotech', 'Automotive'], durationYears: 99, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Rwanda â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'RW-ICT-01', country: 'Rwanda', city: 'Kigali', name: 'Kigali Innovation City ICT Incentives', type: 'tax_holiday', level: 'municipal', description: '7-year CIT holiday + 15% preferential rate after for ICT companies in KIC', value: { type: 'percentage', amount: 100, currency: 'RWF' }, eligibility: ['Located in Kigali Innovation City', 'ICT sector', 'Min $50K investment'], targetSectors: ['Technology', 'Digital Services', 'Fintech', 'EdTech'], minInvestment: 50000, durationYears: 7, stackable: true, stacksWith: ['RW-SEZ-01'], lastVerified: '2025-01-15' },
  { id: 'RW-SEZ-01', country: 'Rwanda', name: 'SEZ Exemptions', type: 'sez_benefit', level: 'national', description: 'Zero customs duty, reduced CIT for SEZ enterprises', value: { type: 'percentage', amount: 100, currency: 'RWF' }, eligibility: ['Located in designated SEZ'], targetSectors: ['Manufacturing', 'Logistics', 'Technology'], durationYears: 10, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Vietnam â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'VN-DA-01', country: 'Vietnam', city: 'Da Nang', name: 'Da Nang High-Tech Park Incentives', type: 'tax_holiday', level: 'regional', description: '4-year CIT exemption + 50% reduction for 9 years (10% CIT rate)', value: { type: 'percentage', amount: 100, currency: 'VND' }, eligibility: ['Located in Da Nang High-Tech Park', 'High-tech investment'], targetSectors: ['Technology', 'Electronics', 'R&D', 'Software'], minInvestment: 100000, durationYears: 4, stackable: true, stacksWith: ['VN-TRAIN-01'], lastVerified: '2025-01-15' },
  { id: 'VN-TRAIN-01', country: 'Vietnam', name: 'Workforce Training Support', type: 'training_grant', level: 'national', description: 'Government co-funding for vocational training', value: { type: 'per_employee', amount: 300, currency: 'USD' }, eligibility: ['Registered employer', 'Approved training plan'], targetSectors: ['Technology', 'Manufacturing', 'BPO'], durationYears: 2, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Poland â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'PL-SEZ-01', country: 'Poland', city: 'Wroclaw', name: 'Polish Investment Zone CIT Relief', type: 'tax_holiday', level: 'national', description: 'CIT exemption for qualifying investments in the Polish Investment Zone', value: { type: 'percentage', amount: 100, currency: 'PLN' }, eligibility: ['Min investment threshold met', 'New investment in designated area'], targetSectors: ['Technology', 'Manufacturing', 'Automotive', 'BPO'], minInvestment: 200000, durationYears: 15, stackable: true, stacksWith: ['PL-RND-01'], lastVerified: '2025-01-15' },
  { id: 'PL-RND-01', country: 'Poland', name: 'Innovation Box (IP Box)', type: 'r_and_d_credit', level: 'national', description: '5% CIT rate on income from qualifying IP rights', value: { type: 'percentage', amount: 5, currency: 'PLN' }, eligibility: ['Income from qualifying IP', 'R&D conducted in Poland'], targetSectors: ['Technology', 'Biotech', 'Manufacturing'], durationYears: 99, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Malaysia â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'MY-MSC-01', country: 'Malaysia', city: 'Penang', name: 'MSC Malaysia Status', type: 'tax_holiday', level: 'national', description: '10-year corporate tax exemption for MSC status companies', value: { type: 'percentage', amount: 100, currency: 'MYR' }, eligibility: ['Technology company', 'MSC Malaysia status approved', 'Min knowledge workers'], targetSectors: ['Technology', 'Digital Services', 'Creative'], durationYears: 10, stackable: true, stacksWith: ['MY-TRAIN-01'], lastVerified: '2025-01-15' },
  { id: 'MY-TRAIN-01', country: 'Malaysia', name: 'HRDF Training Levy Rebate', type: 'training_grant', level: 'national', description: 'Training levy rebate for approved training programs', value: { type: 'per_employee', amount: 600, currency: 'MYR' }, eligibility: ['Registered employer', 'HRDF contributor'], targetSectors: ['Technology', 'Manufacturing', 'Finance', 'BPO'], durationYears: 99, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ UAE (Ras Al Khaimah) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'AE-RAK-01', country: 'UAE', city: 'Ras Al Khaimah', name: 'RAK Economic Zone Tax Benefits', type: 'tax_holiday', level: 'regional', description: '0% corporate tax, 0% personal income tax, 100% repatriation', value: { type: 'percentage', amount: 100, currency: 'AED' }, eligibility: ['Registered in RAK Economic Zone'], targetSectors: ['Technology', 'Manufacturing', 'Logistics', 'Finance', 'Creative'], durationYears: 50, stackable: true, stacksWith: ['AE-RAK-02'], lastVerified: '2025-01-15' },
  { id: 'AE-RAK-02', country: 'UAE', city: 'Ras Al Khaimah', name: 'RAK Duty-Free Import', type: 'duty_exemption', level: 'regional', description: '100% import duty exemption in free zone', value: { type: 'percentage', amount: 100, currency: 'AED' }, eligibility: ['Located in RAK free zone'], targetSectors: ['Manufacturing', 'Trade', 'Logistics'], durationYears: 50, stackable: true, lastVerified: '2025-01-15' },

  // â"€â"€â"€ Uzbekistan â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
  { id: 'UZ-FEZ-01', country: 'Uzbekistan', city: 'Tashkent', name: 'Free Economic Zone Incentives', type: 'sez_benefit', level: 'national', description: 'Tax and customs exemptions for FEZ enterprises', value: { type: 'percentage', amount: 100, currency: 'UZS' }, eligibility: ['Located in designated FEZ', 'Min investment $300K'], targetSectors: ['Manufacturing', 'Technology', 'Textiles', 'Agriculture'], minInvestment: 300000, durationYears: 10, stackable: false, lastVerified: '2025-01-15' },
];

// â"€â"€â"€ Engine â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export class GovernmentIncentiveVault {

  /** Search incentives by country */
  static searchByCountry(country: string): IncentiveRecord[] {
    return INCENTIVE_DB.filter(i => i.country.toLowerCase() === country.toLowerCase());
  }

  /** Search incentives by city */
  static searchByCity(city: string): IncentiveRecord[] {
    return INCENTIVE_DB.filter(i => i.city?.toLowerCase() === city.toLowerCase() ||
      i.country.toLowerCase() === city.toLowerCase());
  }

  /** Search by sector */
  static searchBySector(sector: string): IncentiveRecord[] {
    const s = sector.toLowerCase();
    return INCENTIVE_DB.filter(i => i.targetSectors.some(t => t.toLowerCase().includes(s)));
  }

  /** Get all incentives */
  static getAllIncentives(): IncentiveRecord[] {
    return [...INCENTIVE_DB];
  }

  /**
   * INCENTIVE STACKING CALCULATOR
   * For any company + city pair, determines the full combined incentive package.
   */
  static calculateStackedPackage(company: CompanyProfile, city: string, country: string): StackedIncentivePackage {
    const cityIncentives = INCENTIVE_DB.filter(i =>
      i.country.toLowerCase() === country.toLowerCase() &&
      (!i.city || i.city.toLowerCase() === city.toLowerCase())
    );

    const applied: AppliedIncentive[] = [];
    const stackingNotes: string[] = [];
    const riskFactors: string[] = [];

    for (const inc of cityIncentives) {
      const eligScore = this.checkEligibility(company, inc);
      if (eligScore < 30) continue;

      const annualValue = this.estimateAnnualValue(inc, company);
      const lifetimeValue = annualValue * Math.min(inc.durationYears, 10);

      // Check stacking compatibility
      if (inc.stackable === false && applied.length > 0) {
        stackingNotes.push(`${inc.name} is NOT stackable â€" would override other incentives`);
        if (annualValue > applied.reduce((s, a) => s + a.estimatedAnnualValue, 0)) {
          // If this single incentive is better, use it alone
          applied.length = 0;
          applied.push({ incentive: inc, estimatedAnnualValue: annualValue, estimatedLifetimeValue: lifetimeValue, eligibilityMatch: eligScore, notes: 'Non-stackable â€" used as sole incentive' });
          continue;
        }
        continue;
      }

      applied.push({
        incentive: inc,
        estimatedAnnualValue: annualValue,
        estimatedLifetimeValue: lifetimeValue,
        eligibilityMatch: eligScore,
        notes: eligScore >= 80 ? 'Strong match' : eligScore >= 50 ? 'Partial match â€" further review needed' : 'Marginal match',
      });
    }

    const totalFirstYear = applied.reduce((s, a) => s + a.estimatedAnnualValue, 0);
    const totalLifetime = applied.reduce((s, a) => s + a.estimatedLifetimeValue, 0);

    // Estimate effective tax rate after incentives
    const baseTaxRate = this.getBaseTaxRate(country);
    const taxReduction = applied
      .filter(a => ['tax_holiday', 'sez_benefit', 'r_and_d_credit'].includes(a.incentive.type))
      .reduce((s, a) => s + a.incentive.value.amount * 0.01 * (a.eligibilityMatch / 100), 0);
    const effectiveTaxRate = Math.max(0, baseTaxRate * (1 - Math.min(1, taxReduction)));

    // Risk assessment
    if (applied.some(a => a.eligibilityMatch < 60)) riskFactors.push('Some incentives have marginal eligibility â€" need verification');
    if (applied.length > 4) riskFactors.push('Complex multi-incentive stack may face administrative challenges');
    if (country === 'Philippines') riskFactors.push('BOI/PEZA registration process can take 3-6 months');
    if (totalFirstYear > company.investmentAmount * 0.5) riskFactors.push('Incentive value exceeds 50% of investment â€" verify with local advisors');

    return {
      company: company.name,
      city,
      country,
      applicableIncentives: applied,
      totalFirstYearValue: Math.round(totalFirstYear),
      totalLifetimeValue: Math.round(totalLifetime),
      effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
      savingsVsTier1: Math.round(totalFirstYear / Math.max(1, company.annualRevenue) * 100 * 100) / 100,
      stackingNotes,
      applicationTimeline: this.estimateTimeline(country),
      riskFactors,
      generatedAt: new Date().toISOString(),
    };
  }

  /** Generate prompt block */
  static forPrompt(pkg: StackedIncentivePackage): string {
    if (!pkg.applicableIncentives.length) return '';
    const lines: string[] = [
      `\n### â"€â"€ GOVERNMENT INCENTIVE VAULT (${pkg.city}, ${pkg.country}) â"€â"€`,
      `**Package for ${pkg.company}:** ${pkg.applicableIncentives.length} stackable incentives`,
      `**First-Year Value:** $${(pkg.totalFirstYearValue / 1000).toFixed(0)}K | **Lifetime Value:** $${(pkg.totalLifetimeValue / 1e6).toFixed(2)}M | **Effective Tax Rate:** ${pkg.effectiveTaxRate}%`,
    ];
    pkg.applicableIncentives.forEach((a, i) => {
      lines.push(`${i + 1}. **${a.incentive.name}** (${a.incentive.type.replace(/_/g, ' ')}) â€" $${(a.estimatedAnnualValue / 1000).toFixed(0)}K/yr | Match: ${a.eligibilityMatch}%`);
    });
    if (pkg.riskFactors.length) {
      lines.push(`**Risks:** ${pkg.riskFactors.join('; ')}`);
    }
    return lines.join('\n');
  }

  // â"€â"€â"€ Private â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

  private static checkEligibility(company: CompanyProfile, inc: IncentiveRecord): number {
    let score = 50; // base
    const sectorMatch = inc.targetSectors.some(t =>
      company.sectors.some(cs => cs.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(cs.toLowerCase()))
    );
    if (sectorMatch) score += 25;
    else score -= 20;

    if (inc.minInvestment && company.investmentAmount >= inc.minInvestment) score += 10;
    else if (inc.minInvestment && company.investmentAmount < inc.minInvestment) score -= 30;

    if (inc.minJobs && company.jobsToCreate >= inc.minJobs) score += 10;
    else if (inc.minJobs && company.jobsToCreate < inc.minJobs) score -= 25;

    return Math.max(0, Math.min(100, score));
  }

  private static estimateAnnualValue(inc: IncentiveRecord, company: CompanyProfile): number {
    switch (inc.value.type) {
      case 'percentage': {
        if (inc.type === 'tax_holiday' || inc.type === 'sez_benefit') {
          return company.annualRevenue * 0.15 * (inc.value.amount / 100); // rough: 15% of revenue as tax saving
        }
        return company.annualRevenue * (inc.value.amount / 100) * 0.1;
      }
      case 'fixed': return Math.min(inc.value.amount, inc.value.maxAmount ?? inc.value.amount);
      case 'per_employee': return inc.value.amount * company.jobsToCreate;
      case 'per_sqm': return inc.value.amount * company.headcount * 8; // ~8 sqm per employee
      default: return 0;
    }
  }

  private static getBaseTaxRate(country: string): number {
    const rates: Record<string, number> = {
      'Philippines': 0.25, 'Australia': 0.30, 'Colombia': 0.35, 'Georgia': 0.15,
      'Romania': 0.16, 'Rwanda': 0.30, 'Vietnam': 0.20, 'Poland': 0.19,
      'Malaysia': 0.24, 'UAE': 0.09, 'Uzbekistan': 0.15,
    };
    return rates[country] ?? 0.25;
  }

  private static estimateTimeline(country: string): string {
    const timelines: Record<string, string> = {
      'Philippines': '3-6 months (BOI/PEZA registration)',
      'Australia': '2-4 months (state government approval)',
      'Colombia': '2-3 months (Ruta N application)',
      'Georgia': '1-2 months (FIZ application)',
      'Romania': '1-2 months (IT exemption registration)',
      'Rwanda': '2-4 months (RDB registration)',
      'Vietnam': '3-5 months (high-tech park approval)',
      'Poland': '2-4 months (investment zone application)',
      'Malaysia': '3-6 months (MSC status application)',
      'UAE': '2-4 weeks (free zone registration)',
      'Uzbekistan': '2-3 months (FEZ registration)',
    };
    return timelines[country] ?? '2-4 months (estimated)';
  }
}
