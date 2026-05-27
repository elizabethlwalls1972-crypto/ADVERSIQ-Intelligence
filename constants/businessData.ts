// Comprehensive Business Data Constants
// Replaces hardcoded limited options with extensive industry, country, and business data

export const ENTITY_TYPES = [
  // Corporate
  { value: 'Corporation', label: 'Corporation', category: 'Corporate' },
  { value: 'LLC', label: 'Limited Liability Company (LLC)', category: 'Corporate' },
  { value: 'S-Corp', label: 'S-Corporation', category: 'Corporate' },
  { value: 'C-Corp', label: 'C-Corporation', category: 'Corporate' },
  { value: 'B-Corp', label: 'B-Corporation', category: 'Corporate' },
  { value: 'Benefit-Corp', label: 'Benefit Corporation', category: 'Corporate' },
  { value: 'PublicCorp', label: 'Public Corporation', category: 'Corporate' },
  { value: 'PrivateCorp', label: 'Private Corporation', category: 'Corporate' },
  
  // Partnership & Collaboration
  { value: 'Partnership', label: 'General Partnership', category: 'Partnership' },
  { value: 'LLP', label: 'Limited Liability Partnership (LLP)', category: 'Partnership' },
  { value: 'LP', label: 'Limited Partnership (LP)', category: 'Partnership' },
  { value: 'Consortium', label: 'Consortium/Joint Venture', category: 'Partnership' },
  { value: 'Cooperative', label: 'Cooperative', category: 'Partnership' },
  { value: 'Consortium', label: 'Strategic Consortium', category: 'Partnership' },
  
  // Startup & Growth
  { value: 'Startup', label: 'Startup', category: 'Growth' },
  { value: 'Scaleup', label: 'Scaleup', category: 'Growth' },
  { value: 'SME', label: 'Small & Medium Enterprise (SME)', category: 'Growth' },
  { value: 'Unicorn', label: 'Unicorn ($1B+ valuation)', category: 'Growth' },
  
  // Public/Non-Profit
  { value: 'NGO', label: 'Non-Governmental Organization (NGO)', category: 'Public' },
  { value: 'Nonprofit', label: 'Non-Profit Organization', category: 'Public' },
  { value: 'Charity', label: 'Registered Charity', category: 'Public' },
  { value: 'Foundation', label: 'Foundation', category: 'Public' },
  { value: 'Trust', label: 'Trust', category: 'Public' },
  
  // Government & Sovereign
  { value: 'Government', label: 'Government Agency/Ministry', category: 'Government' },
  { value: 'Department', label: 'Government Department', category: 'Government' },
  { value: 'Authority', label: 'Public Authority/Board', category: 'Government' },
  { value: 'Sovereign', label: 'Sovereign Wealth Fund', category: 'Government' },
  { value: 'StateFund', label: 'State Investment Fund', category: 'Government' },
  
  // Investment & Financial
  { value: 'Fund', label: 'Investment Fund', category: 'Financial' },
  { value: 'PE', label: 'Private Equity Fund', category: 'Financial' },
  { value: 'VC', label: 'Venture Capital Fund', category: 'Financial' },
  { value: 'Hedge', label: 'Hedge Fund', category: 'Financial' },
  { value: 'Bank', label: 'Financial Institution/Bank', category: 'Financial' },
  { value: 'InsuranceCompany', label: 'Insurance Company', category: 'Financial' },
  
  // International & Hybrid
  { value: 'MultinationalCorp', label: 'Multinational Corporation', category: 'International' },
  { value: 'TransnationalEntity', label: 'Transnational Entity', category: 'International' },
  { value: 'DevelopmentBank', label: 'Development Bank', category: 'International' },
  { value: 'InternationalOrg', label: 'International Organization', category: 'International' },
  { value: 'TradeOrg', label: 'Trade Organization', category: 'International' },
  
  // Industry-Specific
  { value: 'HoldingCompany', label: 'Holding Company', category: 'Industry-Specific' },
  { value: 'InsuranceCompany', label: 'Insurance Company', category: 'Industry-Specific' },
  { value: 'RealEstateInvestment', label: 'Real Estate Investment Trust (REIT)', category: 'Industry-Specific' },
  { value: 'UniversityResearch', label: 'University/Research Institution', category: 'Industry-Specific' },
  { value: 'Hospital', label: 'Hospital/Healthcare System', category: 'Industry-Specific' },
  { value: 'PublicUtility', label: 'Public Utility', category: 'Industry-Specific' },
];

export const COUNTRIES = [
  // Africa
  { value: 'ZA', label: 'South Africa', region: 'Africa', code: '+27' },
  { value: 'EG', label: 'Egypt', region: 'Africa', code: '+20' },
  { value: 'NG', label: 'Nigeria', region: 'Africa', code: '+234' },
  { value: 'KE', label: 'Kenya', region: 'Africa', code: '+254' },
  { value: 'ET', label: 'Ethiopia', region: 'Africa', code: '+251' },
  { value: 'GH', label: 'Ghana', region: 'Africa', code: '+233' },
  { value: 'MA', label: 'Morocco', region: 'Africa', code: '+212' },
  { value: 'TZ', label: 'Tanzania', region: 'Africa', code: '+255' },
  { value: 'UG', label: 'Uganda', region: 'Africa', code: '+256' },
  { value: 'CI', label: 'Côte d\'Ivoire', region: 'Africa', code: '+225' },
  
  // Asia Pacific
  { value: 'CN', label: 'China', region: 'Asia Pacific', code: '+86' },
  { value: 'IN', label: 'India', region: 'Asia Pacific', code: '+91' },
  { value: 'JP', label: 'Japan', region: 'Asia Pacific', code: '+81' },
  { value: 'SG', label: 'Singapore', region: 'Asia Pacific', code: '+65' },
  { value: 'HK', label: 'Hong Kong', region: 'Asia Pacific', code: '+852' },
  { value: 'AU', label: 'Australia', region: 'Asia Pacific', code: '+61' },
  { value: 'NZ', label: 'New Zealand', region: 'Asia Pacific', code: '+64' },
  { value: 'KR', label: 'South Korea', region: 'Asia Pacific', code: '+82' },
  { value: 'TH', label: 'Thailand', region: 'Asia Pacific', code: '+66' },
  { value: 'MY', label: 'Malaysia', region: 'Asia Pacific', code: '+60' },
  { value: 'ID', label: 'Indonesia', region: 'Asia Pacific', code: '+62' },
  { value: 'PH', label: 'Philippines', region: 'Asia Pacific', code: '+63' },
  { value: 'VN', label: 'Vietnam', region: 'Asia Pacific', code: '+84' },
  { value: 'TW', label: 'Taiwan', region: 'Asia Pacific', code: '+886' },
  { value: 'BD', label: 'Bangladesh', region: 'Asia Pacific', code: '+880' },
  { value: 'PK', label: 'Pakistan', region: 'Asia Pacific', code: '+92' },
  
  // Europe
  { value: 'GB', label: 'United Kingdom', region: 'Europe', code: '+44' },
  { value: 'DE', label: 'Germany', region: 'Europe', code: '+49' },
  { value: 'FR', label: 'France', region: 'Europe', code: '+33' },
  { value: 'IT', label: 'Italy', region: 'Europe', code: '+39' },
  { value: 'ES', label: 'Spain', region: 'Europe', code: '+34' },
  { value: 'NL', label: 'Netherlands', region: 'Europe', code: '+31' },
  { value: 'SE', label: 'Sweden', region: 'Europe', code: '+46' },
  { value: 'NO', label: 'Norway', region: 'Europe', code: '+47' },
  { value: 'CH', label: 'Switzerland', region: 'Europe', code: '+41' },
  { value: 'AT', label: 'Austria', region: 'Europe', code: '+43' },
  { value: 'BE', label: 'Belgium', region: 'Europe', code: '+32' },
  { value: 'DK', label: 'Denmark', region: 'Europe', code: '+45' },
  { value: 'FI', label: 'Finland', region: 'Europe', code: '+358' },
  { value: 'IE', label: 'Ireland', region: 'Europe', code: '+353' },
  { value: 'PL', label: 'Poland', region: 'Europe', code: '+48' },
  { value: 'RU', label: 'Russia', region: 'Europe', code: '+7' },
  { value: 'UA', label: 'Ukraine', region: 'Europe', code: '+380' },
  { value: 'TR', label: 'Turkey', region: 'Europe', code: '+90' },
  { value: 'GR', label: 'Greece', region: 'Europe', code: '+30' },
  { value: 'PT', label: 'Portugal', region: 'Europe', code: '+351' },
  { value: 'CZ', label: 'Czech Republic', region: 'Europe', code: '+420' },
  { value: 'HU', label: 'Hungary', region: 'Europe', code: '+36' },
  { value: 'RO', label: 'Romania', region: 'Europe', code: '+40' },
  
  // Middle East & North Africa
  { value: 'SA', label: 'Saudi Arabia', region: 'Middle East', code: '+966' },
  { value: 'AE', label: 'United Arab Emirates', region: 'Middle East', code: '+971' },
  { value: 'QA', label: 'Qatar', region: 'Middle East', code: '+974' },
  { value: 'BH', label: 'Bahrain', region: 'Middle East', code: '+973' },
  { value: 'KW', label: 'Kuwait', region: 'Middle East', code: '+965' },
  { value: 'OM', label: 'Oman', region: 'Middle East', code: '+968' },
  { value: 'IL', label: 'Israel', region: 'Middle East', code: '+972' },
  { value: 'JO', label: 'Jordan', region: 'Middle East', code: '+962' },
  { value: 'LB', label: 'Lebanon', region: 'Middle East', code: '+961' },
  { value: 'IQ', label: 'Iraq', region: 'Middle East', code: '+964' },
  { value: 'IR', label: 'Iran', region: 'Middle East', code: '+98' },
  
  // North America
  { value: 'US', label: 'United States', region: 'North America', code: '+1' },
  { value: 'CA', label: 'Canada', region: 'North America', code: '+1' },
  { value: 'MX', label: 'Mexico', region: 'North America', code: '+52' },
  
  // South America
  { value: 'BR', label: 'Brazil', region: 'South America', code: '+55' },
  { value: 'AR', label: 'Argentina', region: 'South America', code: '+54' },
  { value: 'CL', label: 'Chile', region: 'South America', code: '+56' },
  { value: 'CO', label: 'Colombia', region: 'South America', code: '+57' },
  { value: 'PE', label: 'Peru', region: 'South America', code: '+51' },
  { value: 'VE', label: 'Venezuela', region: 'South America', code: '+58' },
  { value: 'EC', label: 'Ecuador', region: 'South America', code: '+593' },
];

export const INDUSTRIES = [
  // Technology
  { value: 'SoftwareDev', label: 'Software Development', category: 'Technology' },
  { value: 'CloudComputing', label: 'Cloud Computing', category: 'Technology' },
  { value: 'AI-ML', label: 'Artificial Intelligence & Machine Learning', category: 'Technology' },
  { value: 'Cybersecurity', label: 'Cybersecurity', category: 'Technology' },
  { value: 'DataAnalytics', label: 'Data Analytics', category: 'Technology' },
  { value: 'IoT', label: 'Internet of Things (IoT)', category: 'Technology' },
  { value: 'Blockchain', label: 'Blockchain & Cryptocurrency', category: 'Technology' },
  { value: 'Telecom', label: 'Telecommunications', category: 'Technology' },
  { value: 'DigitalMedia', label: 'Digital Media & Entertainment', category: 'Technology' },
  { value: 'GameDev', label: 'Game Development', category: 'Technology' },
  
  // Finance
  { value: 'Banking', label: 'Banking & Financial Services', category: 'Finance' },
  { value: 'Insurance', label: 'Insurance', category: 'Finance' },
  { value: 'Investment', label: 'Investment & Asset Management', category: 'Finance' },
  { value: 'FinTech', label: 'Financial Technology (FinTech)', category: 'Finance' },
  { value: 'PaymentSolutions', label: 'Payment Solutions', category: 'Finance' },
  { value: 'RealEstate', label: 'Real Estate', category: 'Finance' },
  
  // Healthcare
  { value: 'Pharmaceutical', label: 'Pharmaceutical', category: 'Healthcare' },
  { value: 'MedicalDevices', label: 'Medical Devices', category: 'Healthcare' },
  { value: 'Hospitals', label: 'Hospitals & Healthcare Services', category: 'Healthcare' },
  { value: 'BioTech', label: 'Biotechnology', category: 'Healthcare' },
  { value: 'HealthTech', label: 'Health Technology', category: 'Healthcare' },
  { value: 'Telemedicine', label: 'Telemedicine', category: 'Healthcare' },
  
  // Energy
  { value: 'OilGas', label: 'Oil & Gas', category: 'Energy' },
  { value: 'RenewableEnergy', label: 'Renewable Energy', category: 'Energy' },
  { value: 'Nuclear', label: 'Nuclear Power', category: 'Energy' },
  { value: 'Mining', label: 'Mining & Metals', category: 'Energy' },
  { value: 'Utilities', label: 'Utilities', category: 'Energy' },
  
  // Manufacturing
  { value: 'Automotive', label: 'Automotive', category: 'Manufacturing' },
  { value: 'Aerospace', label: 'Aerospace & Defense', category: 'Manufacturing' },
  { value: 'Electronics', label: 'Electronics Manufacturing', category: 'Manufacturing' },
  { value: 'Chemicals', label: 'Chemicals & Petrochemicals', category: 'Manufacturing' },
  { value: 'FoodBeverage', label: 'Food & Beverage', category: 'Manufacturing' },
  { value: 'Textiles', label: 'Textiles & Apparel', category: 'Manufacturing' },
  
  // Consumer
  { value: 'Retail', label: 'Retail', category: 'Consumer' },
  { value: 'Ecommerce', label: 'E-commerce', category: 'Consumer' },
  { value: 'Hospitality', label: 'Hospitality & Tourism', category: 'Consumer' },
  { value: 'RestaurantFood', label: 'Food Service & Restaurants', category: 'Consumer' },
  { value: 'Fashion', label: 'Fashion & Luxury Goods', category: 'Consumer' },
  
  // Transport & Logistics
  { value: 'Shipping', label: 'Shipping & Maritime', category: 'Transport' },
  { value: 'Logistics', label: 'Logistics & Supply Chain', category: 'Transport' },
  { value: 'AirCargo', label: 'Air Cargo & Logistics', category: 'Transport' },
  { value: 'Courier', label: 'Courier & Express Delivery', category: 'Transport' },
  
  // Construction
  { value: 'Construction', label: 'Construction', category: 'Construction' },
  { value: 'Infrastructure', label: 'Infrastructure Development', category: 'Construction' },
  { value: 'Urban', label: 'Urban Development', category: 'Construction' },
  
  // Agriculture
  { value: 'Farming', label: 'Farming & Agriculture', category: 'Agriculture' },
  { value: 'AgriTech', label: 'Agricultural Technology', category: 'Agriculture' },
  { value: 'FishAqua', label: 'Fishing & Aquaculture', category: 'Agriculture' },
  
  // Education
  { value: 'HigherEd', label: 'Higher Education', category: 'Education' },
  { value: 'K12', label: 'K-12 Education', category: 'Education' },
  { value: 'EdTech', label: 'Educational Technology', category: 'Education' },
  { value: 'VocationalTraining', label: 'Vocational Training', category: 'Education' },
  
  // Other
  { value: 'Media', label: 'Media & Publishing', category: 'Other' },
  { value: 'Legal', label: 'Legal Services', category: 'Other' },
  { value: 'Consulting', label: 'Management Consulting', category: 'Other' },
  { value: 'HR', label: 'Human Resources & Recruitment', category: 'Other' },
  { value: 'Environmental', label: 'Environmental Services', category: 'Other' },
  { value: 'NGO', label: 'Non-Profit & NGO', category: 'Other' },
];

export const BUSINESS_MODELS = [
  'B2B (Business-to-Business)',
  'B2C (Business-to-Consumer)',
  'B2B2C (Business-to-Business-to-Consumer)',
  'C2C (Consumer-to-Consumer)',
  'D2C (Direct-to-Consumer)',
  'SaaS (Software-as-a-Service)',
  'PaaS (Platform-as-a-Service)',
  'IaaS (Infrastructure-as-a-Service)',
  'Marketplace',
  'Subscription',
  'Freemium',
  'Licensing',
  'Franchising',
  'Agency',
  'Platform',
  'Hardware',
  'Service-Based',
  'Product-Based',
  'Hybrid',
];

export const GROWTH_STAGES = [
  'Ideation/Concept',
  'Pre-Launch/MVP',
  'Early Stage (<$1M revenue)',
  'Growth Stage ($1M-$10M revenue)',
  'Scaling ($10M-$100M revenue)',
  'Mature ($100M+ revenue)',
  'Expansion',
  'Declining',
  'Restructuring',
];

export const FUNDING_TYPES = [
  'Bootstrapped/Self-Funded',
  'Angel Investment',
  'Seed Round',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'Venture Capital',
  'Private Equity',
  'Debt Financing',
  'Grants/Subsidies',
  'Crowdfunding',
  'IPO',
];

export const TEAM_SIZES = [
  { value: '<5', label: 'Micro (1-4)' },
  { value: '5-10', label: 'Small (5-10)' },
  { value: '11-50', label: 'Small-Medium (11-50)' },
  { value: '51-100', label: 'Medium (51-100)' },
  { value: '101-500', label: 'Large (101-500)' },
  { value: '501-1000', label: 'Very Large (501-1,000)' },
  { value: '1001-5000', label: 'Enterprise (1,001-5,000)' },
  { value: '>5000', label: 'Mega (5,000+)' },
];

export const REVENUE_RANGES = [
  '<$100K',
  '$100K - $500K',
  '$500K - $1M',
  '$1M - $5M',
  '$5M - $10M',
  '$10M - $50M',
  '$50M - $100M',
  '$100M - $500M',
  '$500M - $1B',
  '>$1B',
];

export const MARKETS = [
  'Domestic (Local/National)',
  'Regional (Multi-country)',
  'International (Global)',
  'Export-Focused',
];

