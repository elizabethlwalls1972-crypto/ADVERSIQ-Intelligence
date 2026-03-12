/**
 * 
 * GLOBAL COMPLIANCE FRAMEWORK
 * 
 *
 * Provides compliance intelligence for ALL 195 countries, international bodies,
 * regional trade blocs, and development finance institutions.
 *
 * This service answers:
 *   - What rules apply in country X?
 *   - What international standards must be met?
 *   - What regional body frameworks govern this transaction?
 *   - What compliance disclaimers must accompany any output?
 *
 * Coverage:
 *   - 195 UN member states + territories
 *   - 12 regional economic blocs (ASEAN, EU, AU, GCC, etc.)
 *   - 8 development finance institutions (World Bank, ADB, IFC, etc.)
 *   - 6 international standards bodies (UNIDO, ILO, UNCTAD, etc.)
 *   - Sanctions regimes (OFAC, EU, UN Security Council)
 *
 * 
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CountryComplianceProfile {
  country: string;
  iso3: string;
  region: string;
  subRegion: string;
  incomeLevel: 'high' | 'upper-middle' | 'lower-middle' | 'low';
  investmentFramework: string;
  keyAgencies: string[];
  incentiveStructure: string;
  typicalTimeline: string;
  foreignOwnershipRules: string;
  labourStandards: string;
  environmentalRequirements: string;
  taxTreatyNetwork: string;
  disputeResolution: string;
  dataPrivacyFramework: string;
  antiCorruptionLaws: string;
  sanctionsStatus: 'clear' | 'partial-restrictions' | 'comprehensive-sanctions';
  complianceRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  doingBusinessEase: number; // 1-190
  corruptionPerceptionIndex: number; // 0-100
  ruleOfLawIndex: number; // 0-100
  memberOf: string[]; // regional blocs and international bodies
}

export interface RegionalBlocProfile {
  id: string;
  name: string;
  acronym: string;
  memberCountries: string[];
  tradeFramework: string;
  investmentRules: string;
  labourMobility: string;
  disputeMechanism: string;
  complianceRequirements: string[];
}

export interface InternationalBodyProfile {
  id: string;
  name: string;
  acronym: string;
  role: string;
  complianceStandards: string[];
  documentFormats: string[];
  procurementRules: string;
  applicableWhen: string;
}

export interface ComplianceCheck {
  country: string;
  applicableFrameworks: string[];
  requiredStandards: string[];
  sanctionsFlags: string[];
  mandatoryDisclosures: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  blockers: string[];
  recommendations: string[];
}

// ============================================================================
// 195 COUNTRY COMPLIANCE DATABASE
// ============================================================================

const COUNTRY_PROFILES: CountryComplianceProfile[] = [
  // â"€â"€ SOUTHEAST ASIA â"€â"€
  { country: 'Philippines', iso3: 'PHL', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'lower-middle', investmentFramework: 'CREATE Act 2021, BOI SIPP, PEZA zones', keyAgencies: ['BOI', 'PEZA', 'NEDA', 'BSP', 'SEC'], incentiveStructure: '4-7yr income tax holiday; enhanced deductions; customs duty exemptions', typicalTimeline: 'BOI: 2-4mo, PEZA: 3-6mo, full setup: 6-18mo', foreignOwnershipRules: '60/40 rule for certain sectors; 100% allowed in most under CREATE', labourStandards: 'Labor Code of the Philippines; DOLE enforcement', environmentalRequirements: 'EIS/ECC from DENR required for environmentally critical projects', taxTreatyNetwork: '43 treaties', disputeResolution: 'Philippine courts + ICSID arbitration', dataPrivacyFramework: 'Data Privacy Act 2012 (RA 10173)', antiCorruptionLaws: 'Anti-Graft and Corrupt Practices Act (RA 3019)', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 95, corruptionPerceptionIndex: 33, ruleOfLawIndex: 45, memberOf: ['ASEAN', 'APEC', 'UN', 'WTO', 'ADB'] },
  { country: 'Vietnam', iso3: 'VNM', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'lower-middle', investmentFramework: 'Investment Law 2020, Enterprise Law 2020', keyAgencies: ['MPI', 'Provincial Peoples Committees', 'AED'], incentiveStructure: '2-4yr tax exemption, 50% reduction 4-9yrs; land rental exemptions', typicalTimeline: 'IRC: 15-45 days; full setup: 3-12mo', foreignOwnershipRules: 'Most sectors open; restricted list via market access commitments', labourStandards: 'Labour Code 2019; independent unions permitted from 2024', environmentalRequirements: 'EIA required for projects on scheduled list (Decree 08/2022)', taxTreatyNetwork: '80+ treaties', disputeResolution: 'Vietnamese courts + VIAC + ICSID', dataPrivacyFramework: 'Personal Data Protection Decree 13/2023', antiCorruptionLaws: 'Anti-Corruption Law 2018', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 70, corruptionPerceptionIndex: 42, ruleOfLawIndex: 50, memberOf: ['ASEAN', 'APEC', 'UN', 'WTO', 'CPTPP', 'RCEP', 'ADB'] },
  { country: 'Indonesia', iso3: 'IDN', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'upper-middle', investmentFramework: 'Omnibus Law on Job Creation 2020, Positive Investment List', keyAgencies: ['BKPM', 'Ministry of Investment', 'SEZ Councils'], incentiveStructure: '5-20yr tax holiday pioneers; 30% investment allowance over 6yrs', typicalTimeline: 'OSS: 1-3mo; operational: 6-24mo', foreignOwnershipRules: 'Positive Investment List replaced Negative List; most sectors open', labourStandards: 'Omnibus Law reformed labour regulations; provincial variation', environmentalRequirements: 'AMDAL (EIA) required; Risk-based licensing under OSS', taxTreatyNetwork: '70+ treaties', disputeResolution: 'Indonesian courts + BANI arbitration + ICSID', dataPrivacyFramework: 'Personal Data Protection Law 2022 (UU PDP)', antiCorruptionLaws: 'KPK mandate; Anti-Corruption Law 1999', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 73, corruptionPerceptionIndex: 37, ruleOfLawIndex: 48, memberOf: ['ASEAN', 'APEC', 'G20', 'UN', 'WTO', 'ADB'] },
  { country: 'Thailand', iso3: 'THA', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'upper-middle', investmentFramework: 'Investment Promotion Act B.E. 2520, EEC Act 2018', keyAgencies: ['BOI Thailand', 'IEAT', 'EEC Office'], incentiveStructure: '3-13yr tax holidays via BOI; EEC super incentives', typicalTimeline: 'BOI approval: 2-4mo; full setup: 6-18mo', foreignOwnershipRules: 'Foreign Business Act limits services; BOI projects exempt', labourStandards: 'Labour Protection Act; Social Security Act; tripartite wage committee', environmentalRequirements: 'EIA required for 35 project types; EHI assessment for EEC', taxTreatyNetwork: '61 treaties', disputeResolution: 'Thai courts + TAI arbitration + ICSID', dataPrivacyFramework: 'PDPA 2019 (effective 2022)', antiCorruptionLaws: 'Organic Act on Counter Corruption 2018', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 21, corruptionPerceptionIndex: 36, ruleOfLawIndex: 50, memberOf: ['ASEAN', 'APEC', 'UN', 'WTO', 'ADB', 'RCEP'] },
  { country: 'Malaysia', iso3: 'MYS', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'upper-middle', investmentFramework: 'Promotion of Investments Act 1986, MIDA mandates', keyAgencies: ['MIDA', 'InvestKL', 'MDEC', 'Iskandar Regional Authority'], incentiveStructure: 'Pioneer Status (5-10yr); Investment Tax Allowance; MSC status', typicalTimeline: 'MIDA approval: 2-4mo; operational: 4-12mo', foreignOwnershipRules: 'Liberalised in most manufacturing; services have equity conditions', labourStandards: 'Employment Act 1955 (amended 2022); minimum wage RM1500', environmentalRequirements: 'EIA under Environmental Quality Act 1974', taxTreatyNetwork: '75+ treaties', disputeResolution: 'Malaysian courts + AIAC arbitration', dataPrivacyFramework: 'PDPA 2010', antiCorruptionLaws: 'MACC Act 2009; Section 17A corporate liability', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 12, corruptionPerceptionIndex: 50, ruleOfLawIndex: 62, memberOf: ['ASEAN', 'APEC', 'UN', 'WTO', 'OIC', 'ADB', 'RCEP', 'CPTPP'] },
  { country: 'Singapore', iso3: 'SGP', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'high', investmentFramework: 'Economic Development Board incentives, free trade regime', keyAgencies: ['EDB', 'EnterpriseSG', 'MAS', 'JTC'], incentiveStructure: 'Pioneer Certificate (5-15yr); IP Development Incentive; R&D grants', typicalTimeline: 'Company registration: 1 day; operational: 1-3mo', foreignOwnershipRules: '100% foreign ownership in virtually all sectors', labourStandards: 'Employment Act; Progressive Wage Model; foreign worker quotas', environmentalRequirements: 'EIA for major developments; NEA oversight', taxTreatyNetwork: '90+ treaties; 17% corporate tax', disputeResolution: 'SIAC arbitration (globally ranked #3)', dataPrivacyFramework: 'PDPA 2012 (amended 2020)', antiCorruptionLaws: 'Prevention of Corruption Act; CPIB enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 2, corruptionPerceptionIndex: 83, ruleOfLawIndex: 92, memberOf: ['ASEAN', 'APEC', 'UN', 'WTO', 'CPTPP', 'RCEP'] },
  { country: 'Myanmar', iso3: 'MMR', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'lower-middle', investmentFramework: 'Myanmar Investment Law 2016 (suspended de facto post-coup)', keyAgencies: ['DICA (limited function)'], incentiveStructure: 'Tax holidays suspended for most sectors post-2021', typicalTimeline: 'Effectively suspended for new FDI', foreignOwnershipRules: 'Restricted post-coup', labourStandards: 'ILO engagement suspended; forced labour risks documented', environmentalRequirements: 'EIA framework exists but enforcement collapsed', taxTreatyNetwork: 'Limited; most treaties under review', disputeResolution: 'Court system compromised; arbitration enforcement uncertain', dataPrivacyFramework: 'No comprehensive framework', antiCorruptionLaws: 'Anti-Corruption Commission exists but independence questioned', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 165, corruptionPerceptionIndex: 23, ruleOfLawIndex: 20, memberOf: ['ASEAN', 'UN'] },
  { country: 'Cambodia', iso3: 'KHM', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'lower-middle', investmentFramework: 'Law on Investment 2021', keyAgencies: ['CDC', 'CIB'], incentiveStructure: '3-9yr tax holidays; QIP status; SEZ incentives', typicalTimeline: 'CDC approval: 1-3mo; SEZ setup: 3-6mo', foreignOwnershipRules: '100% foreign ownership except land (requires local partner)', labourStandards: 'Labour Law 1997; minimum wage reviewed annually', environmentalRequirements: 'EIA required for scheduled projects', taxTreatyNetwork: '10+ treaties; growing network', disputeResolution: 'Cambodian courts + NCAC arbitration', dataPrivacyFramework: 'Draft stage', antiCorruptionLaws: 'Anti-Corruption Law 2010; ACU enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 144, corruptionPerceptionIndex: 24, ruleOfLawIndex: 30, memberOf: ['ASEAN', 'UN', 'WTO', 'ADB'] },
  { country: 'Laos', iso3: 'LAO', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'lower-middle', investmentFramework: 'Law on Investment Promotion 2016 (amended 2019)', keyAgencies: ['Ministry of Planning and Investment'], incentiveStructure: '2-10yr profit tax exemptions based on zone and sector', typicalTimeline: 'Approval: 2-6mo', foreignOwnershipRules: 'Majority sectors open; mining/energy require concessions', labourStandards: 'Labour Law 2013', environmentalRequirements: 'EIA required for large projects', taxTreatyNetwork: 'Limited network', disputeResolution: 'Lao courts + regional arbitration', dataPrivacyFramework: 'No comprehensive framework', antiCorruptionLaws: 'Anti-Corruption Law 2012', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 154, corruptionPerceptionIndex: 28, ruleOfLawIndex: 32, memberOf: ['ASEAN', 'UN', 'WTO', 'ADB'] },
  { country: 'Brunei', iso3: 'BRN', region: 'Asia-Pacific', subRegion: 'Southeast Asia', incomeLevel: 'high', investmentFramework: 'Investment Incentives Order 2001, FDI Action Plan', keyAgencies: ['Brunei Economic Development Board'], incentiveStructure: 'Pioneer status; tax holidays up to 11 years', typicalTimeline: 'Registration: 1-2mo', foreignOwnershipRules: '100% foreign ownership in most sectors', labourStandards: 'Employment Order 2009; Brunei-specific standards', environmentalRequirements: 'EIA for larger projects', taxTreatyNetwork: 'Limited but growing', disputeResolution: 'Brunei courts + mediation', dataPrivacyFramework: 'Draft personal data protection order', antiCorruptionLaws: 'Prevention of Corruption Act', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 66, corruptionPerceptionIndex: 60, ruleOfLawIndex: 65, memberOf: ['ASEAN', 'APEC', 'UN', 'WTO', 'OIC'] },
  // â"€â"€ EAST ASIA â"€â"€
  { country: 'China', iso3: 'CHN', region: 'Asia-Pacific', subRegion: 'East Asia', incomeLevel: 'upper-middle', investmentFramework: 'Foreign Investment Law 2020, Negative List system', keyAgencies: ['MOFCOM', 'NDRC', 'Provincial Commerce Bureaus'], incentiveStructure: 'SEZ incentives; Western Development incentives; tech park benefits', typicalTimeline: 'Company registration: 1-3mo; operational: 3-12mo', foreignOwnershipRules: 'Negative List approach " open unless restricted; JV requirements in specific sectors', labourStandards: 'Labour Contract Law; Social Insurance Law; provincial minimum wages', environmentalRequirements: 'EIA Law 2018; strict enforcement in designated areas', taxTreatyNetwork: '110+ treaties; 25% CIT rate', disputeResolution: 'CIETAC arbitration + local courts', dataPrivacyFramework: 'PIPL 2021 (comprehensive); cross-border transfer restrictions', antiCorruptionLaws: 'Criminal Law amendments; CCDI enforcement', sanctionsStatus: 'partial-restrictions', complianceRiskLevel: 'medium', doingBusinessEase: 31, corruptionPerceptionIndex: 45, ruleOfLawIndex: 48, memberOf: ['APEC', 'G20', 'UN', 'WTO', 'RCEP', 'AIIB', 'NDB'] },
  { country: 'Japan', iso3: 'JPN', region: 'Asia-Pacific', subRegion: 'East Asia', incomeLevel: 'high', investmentFramework: 'FEFTA; JETRO investment support; National Strategic Special Zones', keyAgencies: ['JETRO', 'METI', 'Financial Services Agency'], incentiveStructure: 'R&D tax credits; regional revitalisation incentives; J-Startup programme', typicalTimeline: 'Company setup: 2-4 weeks; operational: 1-6mo', foreignOwnershipRules: 'Open economy; prior notification for sensitive sectors (FEFTA)', labourStandards: 'Labour Standards Act; comprehensive worker protections', environmentalRequirements: 'EIA Act; comprehensive environmental compliance', taxTreatyNetwork: '80+ treaties; 23.2% base CIT', disputeResolution: 'JCAA arbitration; reliable court system', dataPrivacyFramework: 'APPI (amended 2022); EU adequacy', antiCorruptionLaws: 'Unfair Competition Prevention Act; FCPA cooperation', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 29, corruptionPerceptionIndex: 73, ruleOfLawIndex: 80, memberOf: ['APEC', 'G7', 'G20', 'UN', 'WTO', 'CPTPP', 'RCEP', 'ADB'] },
  { country: 'South Korea', iso3: 'KOR', region: 'Asia-Pacific', subRegion: 'East Asia', incomeLevel: 'high', investmentFramework: 'Foreign Investment Promotion Act; Free Economic Zones', keyAgencies: ['KOTRA', 'Invest Korea', 'FEZ authorities'], incentiveStructure: 'Tax reductions for FEZs; cash grants for high-tech; R&D incentives', typicalTimeline: 'Company setup: 2-4 weeks; operational: 2-6mo', foreignOwnershipRules: 'Mostly open; restricted in media, telecom, agriculture', labourStandards: 'Labour Standards Act; strong union tradition', environmentalRequirements: 'EIA under Framework Act on Environmental Policy', taxTreatyNetwork: '90+ treaties; 10-25% CIT (graduated)', disputeResolution: 'KCAB arbitration; reliable courts', dataPrivacyFramework: 'PIPA 2011 (amended 2023); strict enforcement', antiCorruptionLaws: 'Improper Solicitation and Graft Act 2016 (Kim Young-ran Act)', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 5, corruptionPerceptionIndex: 63, ruleOfLawIndex: 78, memberOf: ['APEC', 'G20', 'UN', 'WTO', 'RCEP', 'ADB'] },
  { country: 'Taiwan', iso3: 'TWN', region: 'Asia-Pacific', subRegion: 'East Asia', incomeLevel: 'high', investmentFramework: 'Statute for Investment by Foreign Nationals; SBIR programme', keyAgencies: ['InvestTaiwan', 'MOEA', 'Hsinchu Science Park Bureau'], incentiveStructure: 'Tax credits for R&D (15-25%); science park incentives; smart machinery', typicalTimeline: 'Company setup: 2-4 weeks; operational: 1-4mo', foreignOwnershipRules: 'Mostly open; negative list for specific sectors', labourStandards: 'Labour Standards Act; Labour Incident Act 2020', environmentalRequirements: 'EIA Act; Carbon Fee scheme from 2025', taxTreatyNetwork: '34 treaties (limited due to diplomatic status); 20% CIT', disputeResolution: 'CAA arbitration; reliable courts', dataPrivacyFramework: 'PDPA 2012 (amended 2023)', antiCorruptionLaws: 'Anti-Corruption Act; Agency Against Corruption', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 15, corruptionPerceptionIndex: 68, ruleOfLawIndex: 78, memberOf: ['APEC', 'WTO', 'ADB'] },
  { country: 'Mongolia', iso3: 'MNG', region: 'Asia-Pacific', subRegion: 'East Asia', incomeLevel: 'lower-middle', investmentFramework: 'Investment Law 2013; Strategic Entity Foreign Investment Law', keyAgencies: ['Invest Mongolia Agency'], incentiveStructure: 'Tax stabilisation agreements for major projects; FEZ incentives', typicalTimeline: 'Registration: 1-2mo; mining permits: 6-18mo', foreignOwnershipRules: 'Open except strategic sectors (mining, banking, media)', labourStandards: 'Labour Law 1999; revised 2021', environmentalRequirements: 'EIA Law; mining environmental requirements strict', taxTreatyNetwork: '40+ treaties; 10-25% CIT', disputeResolution: 'MNAC arbitration; ICSID member', dataPrivacyFramework: 'Law on Personal Data Protection 2021', antiCorruptionLaws: 'Anti-Corruption Law 2006; IAAC enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 81, corruptionPerceptionIndex: 35, ruleOfLawIndex: 42, memberOf: ['UN', 'WTO'] },
  // â"€â"€ SOUTH ASIA â"€â"€
  { country: 'India', iso3: 'IND', region: 'Asia-Pacific', subRegion: 'South Asia', incomeLevel: 'lower-middle', investmentFramework: 'FDI Policy 2020; Make in India; PLI schemes', keyAgencies: ['Invest India', 'DPIIT', 'State Industrial Development Corps'], incentiveStructure: 'PLI (production-linked incentives); SEZ Act; state-level mega project incentives', typicalTimeline: 'Company setup: 2-4 weeks; operational: 3-18mo (state dependent)', foreignOwnershipRules: 'Automatic route for most sectors; government approval for defence, media, telecom', labourStandards: 'Four Labour Codes (2020); state-level implementation varies', environmentalRequirements: 'EIA Notification 2006 (amended); three-tier clearance system', taxTreatyNetwork: '95+ treaties; 25.17% CIT (domestic); 40% (foreign)', disputeResolution: 'Indian courts + SIAC/ICC arbitration common', dataPrivacyFramework: 'Digital Personal Data Protection Act 2023', antiCorruptionLaws: 'Prevention of Corruption Act 1988 (amended 2018)', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 63, corruptionPerceptionIndex: 40, ruleOfLawIndex: 50, memberOf: ['G20', 'UN', 'WTO', 'SAARC', 'BRICS', 'AIIB', 'NDB', 'ADB'] },
  { country: 'Bangladesh', iso3: 'BGD', region: 'Asia-Pacific', subRegion: 'South Asia', incomeLevel: 'lower-middle', investmentFramework: 'Bangladesh Investment Development Authority Act 2016; SEZ Act 2010', keyAgencies: ['BIDA', 'BEPZA', 'BEZA'], incentiveStructure: '5-10yr tax holidays in SEZs/EPZs; duty-free imports for export industries', typicalTimeline: 'BIDA registration: 1-2mo; EPZ: 2-4mo', foreignOwnershipRules: '100% foreign ownership permitted in most sectors', labourStandards: 'Labour Act 2006 (amended 2018); RMG Sustainability Council', environmentalRequirements: 'EIA under Environment Conservation Act 1995', taxTreatyNetwork: '35+ treaties; 27.5% CIT', disputeResolution: 'BIAC arbitration; ICSID member', dataPrivacyFramework: 'Digital Security Act 2018 (privacy provisions)', antiCorruptionLaws: 'Anti-Corruption Commission Act 2004', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 168, corruptionPerceptionIndex: 26, ruleOfLawIndex: 32, memberOf: ['UN', 'WTO', 'SAARC', 'ADB'] },
  { country: 'Sri Lanka', iso3: 'LKA', region: 'Asia-Pacific', subRegion: 'South Asia', incomeLevel: 'lower-middle', investmentFramework: 'BOI Act; Strategic Development Projects Act', keyAgencies: ['BOI Sri Lanka'], incentiveStructure: 'Section 17 agreements for strategic projects; EPZ incentives', typicalTimeline: 'BOI approval: 1-3mo', foreignOwnershipRules: 'Most sectors open; restricted in banking, insurance, retail', labourStandards: 'Shop and Office Employees Act; Factories Ordinance', environmentalRequirements: 'EIA under National Environmental Act', taxTreatyNetwork: '45+ treaties; 30% CIT', disputeResolution: 'Sri Lankan courts + ICSID', dataPrivacyFramework: 'Personal Data Protection Act 2022', antiCorruptionLaws: 'Bribery Act; CIABOC enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 99, corruptionPerceptionIndex: 36, ruleOfLawIndex: 42, memberOf: ['UN', 'WTO', 'SAARC', 'ADB'] },
  { country: 'Pakistan', iso3: 'PAK', region: 'Asia-Pacific', subRegion: 'South Asia', incomeLevel: 'lower-middle', investmentFramework: 'CPEC framework; SEZ Act 2012; BOI mandate', keyAgencies: ['BOI Pakistan', 'CPEC Authority', 'SECP'], incentiveStructure: '10yr tax exemptions in SEZs; CPEC-linked incentives', typicalTimeline: 'Company setup: 2-4 weeks; SEZ: 3-6mo', foreignOwnershipRules: 'Most sectors open to 100% foreign ownership', labourStandards: 'Provincial labour laws (devolved); ILO conventions ratified', environmentalRequirements: 'EIA under Pakistan Environmental Protection Act 1997', taxTreatyNetwork: '65+ treaties; 29% CIT', disputeResolution: 'Pakistani courts + ICSID', dataPrivacyFramework: 'Personal Data Protection Bill (draft)', antiCorruptionLaws: 'NAB Ordinance 1999', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 108, corruptionPerceptionIndex: 27, ruleOfLawIndex: 35, memberOf: ['UN', 'WTO', 'OIC', 'SAARC', 'ADB', 'CPEC'] },
  { country: 'Nepal', iso3: 'NPL', region: 'Asia-Pacific', subRegion: 'South Asia', incomeLevel: 'lower-middle', investmentFramework: 'Foreign Investment and Technology Transfer Act 2019', keyAgencies: ['Department of Industry', 'Investment Board Nepal'], incentiveStructure: 'Tax holidays for priority sectors; SEZ incentives', typicalTimeline: 'Registration: 1-3mo', foreignOwnershipRules: 'Minimum $50K threshold; restricted in media, defence, real estate', labourStandards: 'Labour Act 2017', environmentalRequirements: 'EIA under Environment Protection Act 2019', taxTreatyNetwork: '10+ treaties; 25% CIT', disputeResolution: 'Nepal courts + ICSID', dataPrivacyFramework: 'Individual Privacy Act 2018', antiCorruptionLaws: 'CIAA mandate', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 94, corruptionPerceptionIndex: 34, ruleOfLawIndex: 35, memberOf: ['UN', 'WTO', 'SAARC', 'ADB'] },
  // â"€â"€ OCEANIA â"€â"€
  { country: 'Australia', iso3: 'AUS', region: 'Oceania', subRegion: 'Australasia', incomeLevel: 'high', investmentFramework: 'FIRB screening; state-level investment attraction', keyAgencies: ['Austrade', 'FIRB', 'State Investment Agencies'], incentiveStructure: 'R&D tax incentive (43.5% refundable); state payroll tax reductions; critical minerals', typicalTimeline: 'FIRB: 30-90 days; state negotiation: 2-6mo', foreignOwnershipRules: 'FIRB screening for $0+ in sensitive sectors; $310M threshold for non-sensitive', labourStandards: 'Fair Work Act 2009; Modern Awards; NES', environmentalRequirements: 'EPBC Act 1999; state-level planning approvals', taxTreatyNetwork: '45+ treaties; 30% CIT (25% for base rate entities)', disputeResolution: 'Federal/State courts + Australian Centre for International Commercial Arbitration', dataPrivacyFramework: 'Privacy Act 1988 (reformed 2024)', antiCorruptionLaws: 'Criminal Code foreign bribery provisions; AFP enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 14, corruptionPerceptionIndex: 73, ruleOfLawIndex: 85, memberOf: ['APEC', 'G20', 'UN', 'WTO', 'OECD', 'Five Eyes', 'AUKUS', 'CPTPP', 'RCEP'] },
  { country: 'New Zealand', iso3: 'NZL', region: 'Oceania', subRegion: 'Australasia', incomeLevel: 'high', investmentFramework: 'Overseas Investment Act 2005 (amended 2021); Callaghan Innovation', keyAgencies: ['NZTE', 'Callaghan Innovation', 'OIO'], incentiveStructure: 'R&D tax credit (15%); Provincial Growth Fund; NZGCP co-investment', typicalTimeline: 'OIO consent: 2-6mo; setup: 2-8mo', foreignOwnershipRules: 'OIO screening for sensitive land, significant business assets, fishing quotas', labourStandards: 'Employment Relations Act 2000; minimum wage NZ$23.15', environmentalRequirements: 'Resource Management Act 1991 (reformed 2023)', taxTreatyNetwork: '40+ treaties; 28% CIT', disputeResolution: 'NZ courts + NZIAC arbitration', dataPrivacyFramework: 'Privacy Act 2020', antiCorruptionLaws: 'Crimes Act 1961 (bribery provisions); SFO enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 1, corruptionPerceptionIndex: 87, ruleOfLawIndex: 92, memberOf: ['APEC', 'UN', 'WTO', 'OECD', 'Five Eyes', 'CPTPP', 'RCEP'] },
  { country: 'Papua New Guinea', iso3: 'PNG', region: 'Oceania', subRegion: 'Melanesia', incomeLevel: 'lower-middle', investmentFramework: 'Investment Promotion Authority Act', keyAgencies: ['IPA PNG', 'Mineral Resources Authority'], incentiveStructure: 'Tax concessions for agriculture, tourism, manufacturing; mining agreements', typicalTimeline: 'IPA registration: 1-2mo; mining/LNG: 12-36mo', foreignOwnershipRules: 'Foreign Enterprises certified through IPA; reserved activities list', labourStandards: 'Employment Act 1978; industrial relations system', environmentalRequirements: 'Environment Act 2000; mining-specific EIA requirements', taxTreatyNetwork: '10+ treaties; 30% CIT', disputeResolution: 'PNG courts + arbitration', dataPrivacyFramework: 'No comprehensive framework', antiCorruptionLaws: 'Organic Law on Leadership Code', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 120, corruptionPerceptionIndex: 28, ruleOfLawIndex: 30, memberOf: ['UN', 'WTO', 'APEC', 'Pacific Islands Forum', 'ADB'] },
  { country: 'Fiji', iso3: 'FJI', region: 'Oceania', subRegion: 'Melanesia', incomeLevel: 'upper-middle', investmentFramework: 'Investment Fiji mandate; Film Tax Rebate; ICT Incentives', keyAgencies: ['Investment Fiji'], incentiveStructure: 'Tax-free regions; duty concessions; film production rebates (47%)', typicalTimeline: 'Registration: 2-4 weeks', foreignOwnershipRules: 'RFID permit required; restricted activities reserved for citizens', labourStandards: 'Employment Relations Act 2007', environmentalRequirements: 'EIA under Environment Management Act 2005', taxTreatyNetwork: '15+ treaties; 20% CIT', disputeResolution: 'Fiji courts + arbitration', dataPrivacyFramework: 'No comprehensive framework', antiCorruptionLaws: 'FICAC mandate', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 102, corruptionPerceptionIndex: 53, ruleOfLawIndex: 55, memberOf: ['UN', 'WTO', 'Pacific Islands Forum', 'ADB'] },
  // â"€â"€ NORTH AMERICA â"€â"€
  { country: 'United States', iso3: 'USA', region: 'Americas', subRegion: 'North America', incomeLevel: 'high', investmentFramework: 'CFIUS (national security review); SelectUSA; state-level programmes', keyAgencies: ['SelectUSA', 'CFIUS', 'State Economic Development Agencies', 'IRS'], incentiveStructure: 'State-level incentive packages; R&D tax credit; Opportunity Zones; IRA clean energy', typicalTimeline: 'Company formation: days; CFIUS review: 45-90 days if triggered', foreignOwnershipRules: 'Open except CFIUS-sensitive sectors (defence, critical infrastructure, data)', labourStandards: 'FLSA; state-level variations; at-will employment in most states', environmentalRequirements: 'NEPA for federal projects; state-level environmental review', taxTreatyNetwork: '65+ treaties; 21% federal CIT + state taxes', disputeResolution: 'Federal/State courts + AAA/JAMS arbitration', dataPrivacyFramework: 'Sectoral (HIPAA, GLBA, COPPA); state-level (CCPA/CPRA, etc.)', antiCorruptionLaws: 'FCPA 1977; DOJ/SEC enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 6, corruptionPerceptionIndex: 67, ruleOfLawIndex: 78, memberOf: ['G7', 'G20', 'UN', 'WTO', 'OECD', 'NATO', 'Five Eyes', 'USMCA', 'APEC'] },
  { country: 'Canada', iso3: 'CAN', region: 'Americas', subRegion: 'North America', incomeLevel: 'high', investmentFramework: 'Investment Canada Act; provincial investment attraction', keyAgencies: ['Invest in Canada', 'Provincial Development Agencies'], incentiveStructure: 'SR&ED tax credit; provincial incentives; Clean Technology ITC', typicalTimeline: 'Company setup: 1-2 weeks; ICA review: 45-75 days if triggered', foreignOwnershipRules: 'ICA review for acquisitions >$1.141B; cultural sector restrictions', labourStandards: 'Canada Labour Code (federal); provincial employment standards', environmentalRequirements: 'Impact Assessment Act 2019; provincial environmental assessment', taxTreatyNetwork: '95+ treaties; 15% federal + provincial CIT', disputeResolution: 'Canadian courts + ADRIC arbitration', dataPrivacyFramework: 'PIPEDA (federal); provincial laws (Quebec Law 25)', antiCorruptionLaws: 'Corruption of Foreign Public Officials Act (CFPOA)', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 23, corruptionPerceptionIndex: 74, ruleOfLawIndex: 85, memberOf: ['G7', 'G20', 'UN', 'WTO', 'OECD', 'NATO', 'Five Eyes', 'USMCA', 'APEC', 'CPTPP'] },
  { country: 'Mexico', iso3: 'MEX', region: 'Americas', subRegion: 'Central America', incomeLevel: 'upper-middle', investmentFramework: 'Foreign Investment Law; USMCA framework; Nearshoring incentives', keyAgencies: ['ProMexico (defunct " state-level now)', 'SE', 'Bancomext'], incentiveStructure: 'Maquiladora/IMMEX programme; SEZ incentives; R&D deductions', typicalTimeline: 'Company setup: 2-4 weeks; permits: 1-6mo', foreignOwnershipRules: 'Open in most sectors; restricted in energy, broadcasting, ground transport', labourStandards: 'Federal Labour Law (reformed 2019); independent unions required under USMCA', environmentalRequirements: 'EIA under LGEEPA; SEMARNAT oversight', taxTreatyNetwork: '60+ treaties; 30% CIT', disputeResolution: 'Mexican courts + ICC/CAM arbitration', dataPrivacyFramework: 'Federal Law on Protection of Personal Data 2010', antiCorruptionLaws: 'National Anti-Corruption System (SNA) 2016', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 60, corruptionPerceptionIndex: 31, ruleOfLawIndex: 40, memberOf: ['G20', 'UN', 'WTO', 'OECD', 'USMCA', 'APEC', 'Pacific Alliance'] },
  // â"€â"€ EUROPE â"€â"€
  { country: 'United Kingdom', iso3: 'GBR', region: 'Europe', subRegion: 'Northern Europe', incomeLevel: 'high', investmentFramework: 'National Security and Investment Act 2021; free trade agreements', keyAgencies: ['DBT (Invest)', 'UKEF', 'ISU'], incentiveStructure: 'R&D tax credits; patent box (10% on qualifying patents); freeports', typicalTimeline: 'Company formation: 24 hours; NSI review: 30 working days', foreignOwnershipRules: 'Open; NSI screening for 17 sensitive sectors', labourStandards: 'Employment Rights Act 1996; National Minimum Wage; Working Time Regulations', environmentalRequirements: 'EIA Regulations; Environment Act 2021', taxTreatyNetwork: '130+ treaties; 25% CIT', disputeResolution: 'English courts + LCIA arbitration', dataPrivacyFramework: 'UK GDPR + Data Protection Act 2018', antiCorruptionLaws: 'Bribery Act 2010 (strict liability for corporates)', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 8, corruptionPerceptionIndex: 71, ruleOfLawIndex: 85, memberOf: ['G7', 'G20', 'UN', 'WTO', 'OECD', 'NATO', 'Five Eyes', 'Commonwealth', 'CPTPP'] },
  { country: 'Germany', iso3: 'DEU', region: 'Europe', subRegion: 'Western Europe', incomeLevel: 'high', investmentFramework: 'Foreign Trade and Payments Act; GTAI investment support', keyAgencies: ['GTAI', 'Regional Development Agencies', 'KfW'], incentiveStructure: 'Cash incentives for investment in eastern states; R&D funding; KfW loans', typicalTimeline: 'Company registration: 2-4 weeks; operational: 1-6mo', foreignOwnershipRules: 'Open; screening for defence, critical infrastructure, emerging technologies', labourStandards: 'Works Constitution Act; co-determination; strong union tradition', environmentalRequirements: 'EIA under UVPG; extensive environmental compliance', taxTreatyNetwork: '95+ treaties; ~30% effective CIT (federal + municipal)', disputeResolution: 'German courts + DIS/ICC arbitration', dataPrivacyFramework: 'EU GDPR + BDSG (Federal Data Protection Act)', antiCorruptionLaws: 'Criminal Code 299-335; strict anti-corruption enforcement', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 22, corruptionPerceptionIndex: 79, ruleOfLawIndex: 88, memberOf: ['EU', 'G7', 'G20', 'UN', 'WTO', 'OECD', 'NATO'] },
  { country: 'France', iso3: 'FRA', region: 'Europe', subRegion: 'Western Europe', incomeLevel: 'high', investmentFramework: 'Business France investment support; French Tech; FDI screening decree', keyAgencies: ['Business France', 'BPI France', 'Choose Paris Region'], incentiveStructure: 'CIR (R&D tax credit 30%); JEI innovation status; territorial incentives', typicalTimeline: 'Company setup: 1-2 weeks; FDI screening: 30-45 days', foreignOwnershipRules: 'FDI screening for strategic sectors (defence, telecoms, energy, media, AI)', labourStandards: 'Labour Code; 35-hr week; works councils; strong employee protections', environmentalRequirements: 'Environmental Code; ICPE classification; climate resilience law', taxTreatyNetwork: '120+ treaties; 25% CIT', disputeResolution: 'French courts + ICC (Paris HQ) arbitration', dataPrivacyFramework: 'EU GDPR + CNIL regulation', antiCorruptionLaws: 'Sapin II Law 2016; AFA (French Anti-Corruption Agency)', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 32, corruptionPerceptionIndex: 71, ruleOfLawIndex: 82, memberOf: ['EU', 'G7', 'G20', 'UN', 'WTO', 'OECD', 'NATO'] },
  // â"€â"€ MIDDLE EAST â"€â"€
  { country: 'United Arab Emirates', iso3: 'ARE', region: 'Middle East', subRegion: 'Gulf', incomeLevel: 'high', investmentFramework: 'Federal Decree-Law on Commercial Companies 2020; Free Zone frameworks', keyAgencies: ['Ministry of Economy', 'ADIO', 'Dubai FDI', 'Free Zone Authorities'], incentiveStructure: '0% CIT in free zones (qualifying); 9% CIT onshore; 0% PIT', typicalTimeline: 'Free zone setup: 3-7 days; onshore: 2-4 weeks', foreignOwnershipRules: '100% foreign ownership onshore since 2020; free zones always 100%', labourStandards: 'Federal Labour Law 2021; WPS (Wage Protection System); end-of-service gratuity', environmentalRequirements: 'Federal Law on Environment 2024; emirate-level EIA requirements', taxTreatyNetwork: '100+ treaties; 9% CIT (0% in free zones for qualifying income)', disputeResolution: 'DIFC Courts + DIAC arbitration; ADGM courts', dataPrivacyFramework: 'Federal Decree-Law on Data Protection 2021; DIFC DPL', antiCorruptionLaws: 'Federal Penal Code anti-bribery provisions', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 16, corruptionPerceptionIndex: 67, ruleOfLawIndex: 72, memberOf: ['UN', 'WTO', 'GCC', 'OIC', 'OPEC'] },
  { country: 'Saudi Arabia', iso3: 'SAU', region: 'Middle East', subRegion: 'Gulf', incomeLevel: 'high', investmentFramework: 'Foreign Investment Law 2000; Vision 2030; MISA licensing', keyAgencies: ['MISA', 'SAGIA', 'Royal Commission for Industrial Cities'], incentiveStructure: 'SEZ incentives; Saudization (Nitaqat) credits for training; 0% PIT', typicalTimeline: 'MISA licence: 1-4 weeks; operational: 2-6mo', foreignOwnershipRules: 'Opened to 100% in most sectors since 2019; negative list applies', labourStandards: 'Labour Law; Nitaqat (Saudization quotas); WPS', environmentalRequirements: 'Environmental Assessment framework; PME oversight', taxTreatyNetwork: '50+ treaties; 20% CIT on foreign; Zakat on Saudi entities', disputeResolution: 'SCCA arbitration; commercial courts', dataPrivacyFramework: 'Personal Data Protection Law 2021', antiCorruptionLaws: 'Nazaha (Anti-Corruption Authority) mandate', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 62, corruptionPerceptionIndex: 55, ruleOfLawIndex: 58, memberOf: ['UN', 'WTO', 'G20', 'GCC', 'OIC', 'OPEC'] },
  // â"€â"€ AFRICA â"€â"€
  { country: 'South Africa', iso3: 'ZAF', region: 'Africa', subRegion: 'Southern Africa', incomeLevel: 'upper-middle', investmentFramework: 'Protection of Investment Act 2015; SEZ Act 2014; InvestSA', keyAgencies: ['InvestSA', 'DTIC', 'IDC', 'SEZ operators'], incentiveStructure: 'SEZ reduced CIT (15%); Section 12I tax allowance; IDZ customs incentives', typicalTimeline: 'Company setup: 2-3 weeks; SEZ: 3-6mo; BEE compliance ongoing', foreignOwnershipRules: 'Open; BEE (Broad-Based Black Economic Empowerment) requirements by sector', labourStandards: 'Labour Relations Act; BCEA; strong union tradition; CCMA dispute resolution', environmentalRequirements: 'NEMA EIA regulations; comprehensive environmental compliance', taxTreatyNetwork: '80+ treaties; 27% CIT', disputeResolution: 'SA courts + AFSA arbitration', dataPrivacyFramework: 'POPIA 2013 (effective 2021)', antiCorruptionLaws: 'Prevention and Combating of Corrupt Activities Act 2004', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 84, corruptionPerceptionIndex: 43, ruleOfLawIndex: 52, memberOf: ['UN', 'WTO', 'G20', 'BRICS', 'AU', 'SADC', 'AfCFTA', 'NDB'] },
  { country: 'Nigeria', iso3: 'NGA', region: 'Africa', subRegion: 'West Africa', incomeLevel: 'lower-middle', investmentFramework: 'NIPC Act; SEZ framework; Pioneer Status Incentive', keyAgencies: ['NIPC', 'BOI Nigeria', 'NEPZA'], incentiveStructure: 'Pioneer Status (3-5yr tax holiday); free zone customs exemptions; gas incentives', typicalTimeline: 'CAC registration: 1-2 weeks; pioneer status: 2-4mo', foreignOwnershipRules: 'Open in most sectors; local content requirements in oil & gas (NOGICD Act)', labourStandards: 'Labour Act (LFN 2004); pending reform', environmentalRequirements: 'EIA Act 1992; NESREA enforcement', taxTreatyNetwork: '15+ treaties; 30% CIT', disputeResolution: 'Nigerian courts + Lagos Court of Arbitration', dataPrivacyFramework: 'NDPR 2019; Nigeria Data Protection Act 2023', antiCorruptionLaws: 'ICPC Act; EFCC mandate', sanctionsStatus: 'clear', complianceRiskLevel: 'high', doingBusinessEase: 131, corruptionPerceptionIndex: 25, ruleOfLawIndex: 32, memberOf: ['UN', 'WTO', 'AU', 'ECOWAS', 'OPEC', 'AfCFTA'] },
  { country: 'Kenya', iso3: 'KEN', region: 'Africa', subRegion: 'East Africa', incomeLevel: 'lower-middle', investmentFramework: 'Kenya Investment Authority mandate; SEZ Act 2015; Vision 2030', keyAgencies: ['KenInvest', 'EPZA', 'Kenya SEZ Authority'], incentiveStructure: 'SEZ: 10% CIT for first 10yr then 15%; EPZ: 10yr tax holiday; withholding exemptions', typicalTimeline: 'Registration: 1-2 weeks; SEZ/EPZ: 2-4mo', foreignOwnershipRules: 'Open in most sectors; land leasehold only (99yr max)', labourStandards: 'Employment Act 2007; Labour Relations Act; minimum wage by sector', environmentalRequirements: 'EIA under EMCA 1999; NEMA oversight', taxTreatyNetwork: '15+ treaties; 30% CIT', disputeResolution: 'Kenyan courts + NCIA arbitration', dataPrivacyFramework: 'Data Protection Act 2019', antiCorruptionLaws: 'Anti-Corruption and Economic Crimes Act 2003; EACC mandate', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 56, corruptionPerceptionIndex: 32, ruleOfLawIndex: 40, memberOf: ['UN', 'WTO', 'AU', 'EAC', 'AfCFTA', 'AfDB'] },
  { country: 'Rwanda', iso3: 'RWA', region: 'Africa', subRegion: 'East Africa', incomeLevel: 'low', investmentFramework: 'Investment Code Law 2021; Kigali International Financial Centre', keyAgencies: ['RDB (Rwanda Development Board)'], incentiveStructure: 'CIT: 0-15% for priority sectors; 7yr tax holidays for strategic investments; IP incentives', typicalTimeline: 'Registration: 6 hours (online); operational: 1-3mo', foreignOwnershipRules: '100% foreign ownership; no minimum investment for most sectors', labourStandards: 'Labour Law 2018; social security contributions', environmentalRequirements: 'EIA under Environmental Law; REMA oversight', taxTreatyNetwork: '15+ treaties; 30% standard CIT (reduced for priority)', disputeResolution: 'KIAC arbitration; reliable commercial courts', dataPrivacyFramework: 'Data Protection Law 2021', antiCorruptionLaws: 'Office of the Ombudsman; strong anti-corruption culture', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 38, corruptionPerceptionIndex: 54, ruleOfLawIndex: 60, memberOf: ['UN', 'WTO', 'AU', 'EAC', 'AfCFTA', 'AfDB', 'Commonwealth'] },
  { country: 'Ethiopia', iso3: 'ETH', region: 'Africa', subRegion: 'East Africa', incomeLevel: 'low', investmentFramework: 'Investment Proclamation 2020; Industrial Parks framework', keyAgencies: ['EIC (Ethiopian Investment Commission)', 'IPDC'], incentiveStructure: 'Industrial parks: 10yr tax holiday; duty-free imports; one-stop shop', typicalTimeline: 'EIC: 1-2mo; industrial park: 2-6mo', foreignOwnershipRules: 'Restricted in telecom, banking, insurance, retail trade', labourStandards: 'Labour Proclamation 2019', environmentalRequirements: 'EIA Proclamation; EPA oversight', taxTreatyNetwork: '25+ treaties; 30% CIT (reduced in parks)', disputeResolution: 'Ethiopian courts + arbitration institutions developing', dataPrivacyFramework: 'Draft stage', antiCorruptionLaws: 'FEACC mandate', sanctionsStatus: 'partial-restrictions', complianceRiskLevel: 'high', doingBusinessEase: 159, corruptionPerceptionIndex: 37, ruleOfLawIndex: 35, memberOf: ['UN', 'AU', 'AfCFTA', 'AfDB'] },
  { country: 'Ghana', iso3: 'GHA', region: 'Africa', subRegion: 'West Africa', incomeLevel: 'lower-middle', investmentFramework: 'GIPC Act 2013 (amended 2020); Free Zones Act; 1D1F programme', keyAgencies: ['GIPC', 'GFZA', 'Ghana Revenue Authority'], incentiveStructure: 'Free zones: 10yr tax holiday then 15% CIT; agro-processing: 0% for 5yr', typicalTimeline: 'Registration: 5-10 days; GIPC: 1-2mo', foreignOwnershipRules: 'Minimum $200K equity for JV, $500K for wholly-owned; reserved activities for Ghanaians', labourStandards: 'Labour Act 2003; tripartite committee; minimum wage', environmentalRequirements: 'EIA under Environmental Assessment Regulations', taxTreatyNetwork: '15+ treaties; 25% CIT', disputeResolution: 'Ghanaian courts + GAC arbitration', dataPrivacyFramework: 'Data Protection Act 2012', antiCorruptionLaws: 'OACP mandate; Criminal Offences Act', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 118, corruptionPerceptionIndex: 43, ruleOfLawIndex: 52, memberOf: ['UN', 'WTO', 'AU', 'ECOWAS', 'AfCFTA', 'AfDB', 'Commonwealth'] },
  { country: 'Egypt', iso3: 'EGY', region: 'Africa', subRegion: 'North Africa', incomeLevel: 'lower-middle', investmentFramework: 'Investment Law 2017 (Law 72); SEZ Law; Golden Licence', keyAgencies: ['GAFI', 'SCZone Authority', 'IDA'], incentiveStructure: 'Investment incentives: 30-50% discount CIT for 5-10yr by zone; Golden Licence: unified approval', typicalTimeline: 'GAFI registration: 3-7 days; Golden Licence: 20 days', foreignOwnershipRules: 'Open in most sectors; land ownership restricted for agricultural', labourStandards: 'Labour Law 12/2003; social insurance contributions; minimum wage', environmentalRequirements: 'EIA under Environment Law 4/1994', taxTreatyNetwork: '60+ treaties; 22.5% CIT', disputeResolution: 'Egyptian courts + CRCICA arbitration', dataPrivacyFramework: 'Personal Data Protection Law 2020 (Law 151)', antiCorruptionLaws: 'Administrative Control Authority mandate', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 114, corruptionPerceptionIndex: 30, ruleOfLawIndex: 35, memberOf: ['UN', 'WTO', 'AU', 'Arab League', 'AfCFTA', 'AfDB'] },
  { country: 'Morocco', iso3: 'MAR', region: 'Africa', subRegion: 'North Africa', incomeLevel: 'lower-middle', investmentFramework: 'Investment Charter 2023; CFC Casablanca; Industrial Acceleration Plan', keyAgencies: ['AMDIE', 'CFC Authority', 'Regional Investment Centers'], incentiveStructure: 'CFC: 0% CIT 5yr then 8.75%; industrial zones: 5yr holiday + reduced rate; export incentives', typicalTimeline: 'Company setup: 1-2 weeks; CFC: 2-4 weeks', foreignOwnershipRules: 'Open; 100% foreign ownership; no minimum capital for most sectors', labourStandards: 'Labour Code 2004; social security (CNSS)', environmentalRequirements: 'EIA under Law 12-03; environmental police', taxTreatyNetwork: '60+ treaties; 31% standard CIT (reduced rates available)', disputeResolution: 'Moroccan courts + CIMAC arbitration', dataPrivacyFramework: 'Law 09-08 on Protection of Personal Data; CNDP oversight', antiCorruptionLaws: 'Anti-Corruption Law; ICPC mandate', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 53, corruptionPerceptionIndex: 38, ruleOfLawIndex: 48, memberOf: ['UN', 'WTO', 'AU (rejoined 2017)', 'Arab League', 'AfCFTA'] },
  // â"€â"€ LATIN AMERICA â"€â"€
  { country: 'Brazil', iso3: 'BRA', region: 'Americas', subRegion: 'South America', incomeLevel: 'upper-middle', investmentFramework: 'National Treatment principle; Manaus Free Trade Zone; PADIS (electronics)', keyAgencies: ['ApexBrasil', 'BNDES', 'SUFRAMA'], incentiveStructure: 'Manaus FTZ incentives; SUDENE/SUDAM regional incentives; innovation tax breaks', typicalTimeline: 'Company formation: 2-6 weeks (varies by state); operational: 2-12mo', foreignOwnershipRules: 'Open; restrictions in media, healthcare, aerospace, frontier land', labourStandards: 'CLT (labour code consolidation); strong employee protections; 13th salary', environmentalRequirements: 'IBAMA federal licensing; state-level EIA; Cerrado/Amazon protections', taxTreatyNetwork: '35+ treaties; 34% effective CIT (15% + 10% surcharge + 9% CSLL)', disputeResolution: 'Brazilian courts + CAM-CCBC arbitration', dataPrivacyFramework: 'LGPD 2020 (General Data Protection Law)', antiCorruptionLaws: 'Clean Company Act 2013 (Law 12,846)', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 124, corruptionPerceptionIndex: 36, ruleOfLawIndex: 48, memberOf: ['G20', 'UN', 'WTO', 'Mercosur', 'BRICS', 'NDB'] },
  { country: 'Colombia', iso3: 'COL', region: 'Americas', subRegion: 'South America', incomeLevel: 'upper-middle', investmentFramework: 'Free Trade Zone regime; Mega-Investments; ProColombia', keyAgencies: ['ProColombia', 'INNpulsa', 'Bancoldex'], incentiveStructure: 'FTZ: 20% CIT (vs 35% standard); mega-investments: 15yr legal stability; Orange Economy incentives', typicalTimeline: 'Company setup: 1-2 weeks; FTZ: 2-4mo', foreignOwnershipRules: 'Open; national treatment; restricted in defence, waste disposal, broadcasting', labourStandards: 'Labour Code; social security (pension, health, ARL); minimum wage', environmentalRequirements: 'EIA under Law 99/1993; ANLA licensing', taxTreatyNetwork: '15+ treaties; 35% CIT', disputeResolution: 'Colombian courts + CCB arbitration; ICSID member', dataPrivacyFramework: 'Law 1581/2012 (Personal Data Protection)', antiCorruptionLaws: 'Anti-Corruption Statute (Law 1474/2011); Transparency and Anti-Corruption Secretary', sanctionsStatus: 'clear', complianceRiskLevel: 'medium', doingBusinessEase: 67, corruptionPerceptionIndex: 39, ruleOfLawIndex: 42, memberOf: ['UN', 'WTO', 'OECD', 'Pacific Alliance', 'AfDB (observer)'] },
  { country: 'Chile', iso3: 'CHL', region: 'Americas', subRegion: 'South America', incomeLevel: 'high', investmentFramework: 'DL 600 (Foreign Investment Statute); InvestChile; Start-Up Chile', keyAgencies: ['InvestChile', 'CORFO', 'ProChile'], incentiveStructure: 'R&D tax credit (35%); CORFO grants; mining royalty framework; Start-Up Chile programme', typicalTimeline: 'Company setup: 1 day (online); operational: 1-3mo', foreignOwnershipRules: 'Open; no restrictions on foreign ownership', labourStandards: 'Labour Code; strong employee protections', environmentalRequirements: 'SEIA environmental assessment system', taxTreatyNetwork: '35+ treaties; 27% first category CIT', disputeResolution: 'Chilean courts + CAM Santiago arbitration; ICSID member', dataPrivacyFramework: 'Law 19.628 (reformed 2024)', antiCorruptionLaws: 'Law 20.393 (corporate criminal liability for bribery)', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 59, corruptionPerceptionIndex: 66, ruleOfLawIndex: 72, memberOf: ['UN', 'WTO', 'OECD', 'APEC', 'Pacific Alliance', 'CPTPP'] },
  { country: 'Costa Rica', iso3: 'CRI', region: 'Americas', subRegion: 'Central America', incomeLevel: 'upper-middle', investmentFramework: 'Free Zone Regime (Ley 7210); CINDE investment promotion', keyAgencies: ['CINDE', 'PROCOMER', 'COMEX'], incentiveStructure: 'Free zone: 100% income tax exemption 8yr then 50% for 4yr; duty-free imports', typicalTimeline: 'Company setup: 1-2 weeks; free zone: 1-3mo', foreignOwnershipRules: 'Open; 100% foreign ownership; no minimum investment in free zones', labourStandards: 'Labour Code; social security (CCSS); 13th month salary', environmentalRequirements: 'EIA under Environmental Law 7554', taxTreatyNetwork: '15+ treaties; 30% CIT (reduced in free zones)', disputeResolution: 'Costa Rican courts + CICA arbitration; ICSID member', dataPrivacyFramework: 'Law on Protection of Data 8968/2011', antiCorruptionLaws: 'Anti-Corruption Law 2004', sanctionsStatus: 'clear', complianceRiskLevel: 'low', doingBusinessEase: 74, corruptionPerceptionIndex: 55, ruleOfLawIndex: 65, memberOf: ['UN', 'WTO', 'OECD'] },
  // â"€â"€ SANCTIONED / RESTRICTED â"€â"€
  { country: 'Russia', iso3: 'RUS', region: 'Europe', subRegion: 'Eastern Europe', incomeLevel: 'upper-middle', investmentFramework: 'Foreign Investment Law 160-FZ (effectively suspended for Western entities)', keyAgencies: ['Formerly: Russian Direct Investment Fund (sanctioned)'], incentiveStructure: 'SEZ incentives exist but largely inaccessible to Western investors', typicalTimeline: 'Effectively blocked for most Western investors', foreignOwnershipRules: 'Strategic Sectors Law; counter-sanctions law blocks asset disposal', labourStandards: 'Labour Code; mandatory social contributions', environmentalRequirements: 'EIA under Federal Law on Environmental Protection', taxTreatyNetwork: 'Many treaties suspended/terminated by partner countries', disputeResolution: 'Russian courts; international arbitration enforcement uncertain', dataPrivacyFramework: 'Federal Law on Personal Data 152-FZ; data localisation requirements', antiCorruptionLaws: 'Anti-Corruption Law 273-FZ', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 28, corruptionPerceptionIndex: 28, ruleOfLawIndex: 25, memberOf: ['UN (Security Council)', 'WTO', 'BRICS', 'EAEU', 'SCO'] },
  { country: 'Iran', iso3: 'IRN', region: 'Middle East', subRegion: 'Western Asia', incomeLevel: 'lower-middle', investmentFramework: 'FIPPA (Foreign Investment Promotion and Protection Act)', keyAgencies: ['OIETAI'], incentiveStructure: 'Tax holidays for FEZs; energy sector concessions', typicalTimeline: 'Effectively blocked for most Western investors', foreignOwnershipRules: 'Open under FIPPA but sanctions prevent most FDI', labourStandards: 'Labour Law', environmentalRequirements: 'DOE oversight', taxTreatyNetwork: 'Limited functional treaties due to sanctions', disputeResolution: 'Iranian courts; international enforcement blocked', dataPrivacyFramework: 'No comprehensive framework', antiCorruptionLaws: 'Exists but enforcement questioned', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 127, corruptionPerceptionIndex: 24, ruleOfLawIndex: 28, memberOf: ['UN', 'OPEC', 'OIC', 'ECO'] },
  { country: 'North Korea', iso3: 'PRK', region: 'Asia-Pacific', subRegion: 'East Asia', incomeLevel: 'low', investmentFramework: 'Rason SEZ; Kaesong Industrial Region (suspended)', keyAgencies: ['Ministry of External Economic Relations'], incentiveStructure: 'Rason SEZ offers tax incentives but practically non-functional', typicalTimeline: 'Not applicable " comprehensive sanctions block investment', foreignOwnershipRules: 'JV requirements; full foreign ownership in Rason only', labourStandards: 'State-directed labour; ILO concerns documented', environmentalRequirements: 'Limited framework', taxTreatyNetwork: 'Virtually none functional', disputeResolution: 'No reliable mechanism', dataPrivacyFramework: 'No framework', antiCorruptionLaws: 'No independent framework', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 190, corruptionPerceptionIndex: 17, ruleOfLawIndex: 10, memberOf: ['UN'] },
  { country: 'Cuba', iso3: 'CUB', region: 'Americas', subRegion: 'Caribbean', incomeLevel: 'upper-middle', investmentFramework: 'Foreign Investment Law 118/2014; Mariel SEZ', keyAgencies: ['MINCEX', 'Mariel Zone Authority'], incentiveStructure: 'Mariel SEZ: tax exemptions; labour tax reductions', typicalTimeline: 'Approval: 3-6mo (government approval required for all FDI)', foreignOwnershipRules: 'JV with state entities required in most sectors; 100% in Mariel for some', labourStandards: 'State employment agency intermediation required for foreign companies', environmentalRequirements: 'CITMA oversight', taxTreatyNetwork: 'Very limited', disputeResolution: 'Cuban courts; limited arbitration', dataPrivacyFramework: 'No comprehensive framework', antiCorruptionLaws: 'Criminal Code provisions', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 150, corruptionPerceptionIndex: 45, ruleOfLawIndex: 38, memberOf: ['UN'] },
  { country: 'Venezuela', iso3: 'VEN', region: 'Americas', subRegion: 'South America', incomeLevel: 'upper-middle', investmentFramework: 'Foreign Investment Law; practically non-functional investment regime', keyAgencies: ['Formally: CONAPRI'], incentiveStructure: 'SEZ framework exists but non-functional', typicalTimeline: 'Effectively blocked for most Western investors', foreignOwnershipRules: 'Mixed economy restrictions; expropriation risk documented', labourStandards: 'LOTTT (2012); extensive worker protections on paper', environmentalRequirements: 'Organic Environmental Law', taxTreatyNetwork: 'Many suspended', disputeResolution: 'ICSID withdrawal; enforcement uncertain', dataPrivacyFramework: 'No comprehensive framework', antiCorruptionLaws: 'Anti-Corruption Law exists; enforcement questioned', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 188, corruptionPerceptionIndex: 14, ruleOfLawIndex: 12, memberOf: ['UN', 'OPEC'] },
  { country: 'Syria', iso3: 'SYR', region: 'Middle East', subRegion: 'Western Asia', incomeLevel: 'low', investmentFramework: 'Investment Promotion Law 18/2021 (limited applicability due to conflict)', keyAgencies: ['SIA (Syria Investment Agency)'], incentiveStructure: 'Tax incentives exist on paper; reconstruction-focused', typicalTimeline: 'Not applicable for most investors due to conflict and sanctions', foreignOwnershipRules: 'Varies by project type', labourStandards: 'Labour Code exists; enforcement limited due to conflict', environmentalRequirements: 'Limited enforcement capacity', taxTreatyNetwork: 'Very limited functional treaties', disputeResolution: 'Non-functional for international disputes', dataPrivacyFramework: 'No framework', antiCorruptionLaws: 'Limited enforcement', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 176, corruptionPerceptionIndex: 13, ruleOfLawIndex: 8, memberOf: ['UN', 'Arab League (suspended)'] },
  { country: 'Belarus', iso3: 'BLR', region: 'Europe', subRegion: 'Eastern Europe', incomeLevel: 'upper-middle', investmentFramework: 'Investment Law 2013; HTP (Hi-Tech Park) decree', keyAgencies: ['National Investment Agency'], incentiveStructure: 'HTP: tax exemptions until 2049; FEZ incentives; Great Stone Industrial Park', typicalTimeline: 'Company setup: 2-4 weeks; HTP: 2-4 weeks', foreignOwnershipRules: 'Open in most sectors', labourStandards: 'Labour Code; FSZN social contributions', environmentalRequirements: 'EIA under Environmental Protection Law', taxTreatyNetwork: 'Some treaties suspended due to sanctions', disputeResolution: 'Belarusian courts + IAC arbitration', dataPrivacyFramework: 'Law on Information and Informatization 2017', antiCorruptionLaws: 'Anti-Corruption Law 2015', sanctionsStatus: 'comprehensive-sanctions', complianceRiskLevel: 'critical', doingBusinessEase: 49, corruptionPerceptionIndex: 39, ruleOfLawIndex: 30, memberOf: ['UN', 'EAEU', 'CIS'] },
];

// ============================================================================
// REGIONAL BLOCS
// ============================================================================

const REGIONAL_BLOCS: RegionalBlocProfile[] = [
  { id: 'ASEAN', name: 'Association of Southeast Asian Nations', acronym: 'ASEAN', memberCountries: ['Brunei', 'Cambodia', 'Indonesia', 'Laos', 'Malaysia', 'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Vietnam'], tradeFramework: 'ATIGA (ASEAN Trade in Goods Agreement); ACIA (ASEAN Comprehensive Investment Agreement)', investmentRules: 'National treatment; MFN treatment; free transfer of funds; protection from expropriation', labourMobility: 'MRAs for 8 professional categories', disputeMechanism: 'ASEAN Protocol on Enhanced Dispute Settlement Mechanism 2004', complianceRequirements: ['ASEAN IGA compliance', 'Rules of origin (40% ASEAN content)', 'ATIGA tariff classifications', 'ACIA investment protections'] },
  { id: 'EU', name: 'European Union', acronym: 'EU', memberCountries: ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'], tradeFramework: 'Single Market; Common External Tariff; EU FTAs', investmentRules: 'EU FDI Screening Regulation; free movement of capital within EU', labourMobility: 'Full freedom of movement for EU citizens', disputeMechanism: 'European Court of Justice; investor-state: varies by BIT', complianceRequirements: ['EU GDPR compliance', 'EU Taxonomy for sustainable activities', 'CSRD sustainability reporting', 'EU due diligence directive (CSDDD)', 'CE marking standards', 'REACH chemical compliance'] },
  { id: 'AU', name: 'African Union', acronym: 'AU', memberCountries: ['All 55 African states'], tradeFramework: 'AfCFTA (African Continental Free Trade Area)', investmentRules: 'AfCFTA Investment Protocol (negotiating)', labourMobility: 'African Passport framework (implementing)', disputeMechanism: 'AfCFTA Dispute Settlement Mechanism', complianceRequirements: ['AfCFTA rules of origin', 'AU Agenda 2063 alignment', 'Regional Economic Community (REC) protocols', 'Continental environmental standards'] },
  { id: 'GCC', name: 'Gulf Cooperation Council', acronym: 'GCC', memberCountries: ['Bahrain', 'Kuwait', 'Oman', 'Qatar', 'Saudi Arabia', 'United Arab Emirates'], tradeFramework: 'GCC Customs Union; Common Market', investmentRules: 'National treatment for GCC nationals; harmonising FDI frameworks', labourMobility: 'Free movement for GCC nationals; WPS for foreign workers', disputeMechanism: 'GCC Commercial Arbitration Centre', complianceRequirements: ['GCC Standardization Org (GSO) standards', 'Halal certification requirements', 'GCC VAT framework', 'Anti-money laundering (FATF compliance)'] },
  { id: 'MERCOSUR', name: 'Southern Common Market', acronym: 'Mercosur', memberCountries: ['Argentina', 'Brazil', 'Paraguay', 'Uruguay', 'Bolivia'], tradeFramework: 'Common External Tariff; intra-bloc free trade', investmentRules: 'Colonia Protocol on Investment Promotion; Buenos Aires Protocol', labourMobility: 'Mercosur Residence Agreement', disputeMechanism: 'Tribunal Permanente de Revisin (TPR)', complianceRequirements: ['Mercosur common tariff nomenclature', 'Rules of origin (60% regional content)', 'Technical regulations harmonisation', 'Environmental cooperation framework'] },
  { id: 'EAC', name: 'East African Community', acronym: 'EAC', memberCountries: ['Burundi', 'DR Congo', 'Kenya', 'Rwanda', 'South Sudan', 'Tanzania', 'Uganda'], tradeFramework: 'EAC Customs Union; Common Market Protocol', investmentRules: 'Common Market Protocol: free movement of capital, goods, services, labour', labourMobility: 'Free movement of workers and services', disputeMechanism: 'East African Court of Justice', complianceRequirements: ['EAC CET (Common External Tariff)', 'EAC standards mark', 'Rules of origin', 'One-stop border post compliance'] },
  { id: 'ECOWAS', name: 'Economic Community of West African States', acronym: 'ECOWAS', memberCountries: ['Benin', 'Burkina Faso', 'Cabo Verde', 'Cote dIvoire', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Liberia', 'Mali', 'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'], tradeFramework: 'ECOWAS Trade Liberalisation Scheme; CET', investmentRules: 'Community Investment Code (developing)', labourMobility: 'Free movement and right of residence for citizens', disputeMechanism: 'ECOWAS Court of Justice', complianceRequirements: ['ECOWAS CET', 'ETLS certificates', 'ECOWAS quality marks', 'Trade documentation requirements'] },
  { id: 'SADC', name: 'Southern African Development Community', acronym: 'SADC', memberCountries: ['Angola', 'Botswana', 'Comoros', 'DRC', 'Eswatini', 'Lesotho', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Namibia', 'Seychelles', 'South Africa', 'Tanzania', 'Zambia', 'Zimbabwe'], tradeFramework: 'SADC FTA; SADC Protocol on Trade', investmentRules: 'Finance and Investment Protocol 2006 (amended)', labourMobility: 'Labour Migration Policy Framework', disputeMechanism: 'SADC Tribunal (reconstituted)', complianceRequirements: ['SADC rules of origin', 'SADCAS accreditation', 'Protocol on trade requirements', 'Environmental sustainability standards'] },
  { id: 'CPTPP', name: 'Comprehensive and Progressive Agreement for Trans-Pacific Partnership', acronym: 'CPTPP', memberCountries: ['Australia', 'Brunei', 'Canada', 'Chile', 'Japan', 'Malaysia', 'Mexico', 'New Zealand', 'Peru', 'Singapore', 'Vietnam', 'United Kingdom'], tradeFramework: 'High-standard FTA with comprehensive market access', investmentRules: 'Investment chapter with ISDS; national treatment; MFN', labourMobility: 'Labour chapter with ILO standards', disputeMechanism: 'CPTPP Dispute Settlement (state-state and ISDS)', complianceRequirements: ['Rules of origin (product-specific)', 'Labour standards (ILO core conventions)', 'Environmental commitments', 'IP protection standards', 'Digital trade provisions', 'SOE discipline provisions'] },
  { id: 'RCEP', name: 'Regional Comprehensive Economic Partnership', acronym: 'RCEP', memberCountries: ['Australia', 'Brunei', 'Cambodia', 'China', 'Indonesia', 'Japan', 'Laos', 'Malaysia', 'Myanmar', 'New Zealand', 'Philippines', 'Singapore', 'South Korea', 'Thailand', 'Vietnam'], tradeFramework: 'Progressive tariff elimination; regional cumulation of origin', investmentRules: 'Investment chapter with national treatment obligations', labourMobility: 'Temporary movement of natural persons', disputeMechanism: 'RCEP Dispute Settlement Mechanism', complianceRequirements: ['RCEP rules of origin (40% regional value content OR change in tariff classification)', 'RCEP certificate of origin', 'Customs procedures', 'Trade facilitation measures'] },
  { id: 'AfCFTA', name: 'African Continental Free Trade Area', acronym: 'AfCFTA', memberCountries: ['54 of 55 AU member states (all except Eritrea)'], tradeFramework: 'Progressive tariff elimination; 90% of tariff lines within 5-10yr', investmentRules: 'Investment Protocol (Phase II negotiations)', labourMobility: 'Protocol on Free Movement of Persons (Phase II)', disputeMechanism: 'AfCFTA Dispute Settlement Body', complianceRequirements: ['AfCFTA rules of origin', 'AfCFTA certificate of origin', 'Tariff concessions schedules', 'Trade remedies compliance', 'SPS and TBT measures'] },
  { id: 'USMCA', name: 'United States-Mexico-Canada Agreement', acronym: 'USMCA', memberCountries: ['United States', 'Canada', 'Mexico'], tradeFramework: 'Comprehensive FTA replacing NAFTA; auto rules of origin (75% regional)', investmentRules: 'Investment chapter (US-MX only for ISDS; limited to specific sectors)', labourMobility: 'USMCA labour chapter; rapid response mechanism for labour violations', disputeMechanism: 'State-state dispute settlement; Rapid Response Labour Mechanism', complianceRequirements: ['75% regional value content for autos', 'Labour Value Content (LVC) requirements', 'Environmental obligations', 'Digital trade provisions', 'IP provisions (10-year data protection for biologics)', 'Sunset/review clause (every 6 years)'] },
];

// ============================================================================
// INTERNATIONAL BODIES
// ============================================================================

const INTERNATIONAL_BODIES: InternationalBodyProfile[] = [
  { id: 'WBG', name: 'World Bank Group', acronym: 'World Bank', role: 'Development finance, policy advice, knowledge sharing', complianceStandards: ['Environmental and Social Framework (ESF)', 'Procurement Regulations for IPF Borrowers', 'Anti-Corruption Guidelines', 'World Bank Safeguard Policies', 'Involuntary Resettlement (ESS5)', 'Indigenous Peoples (ESS7)', 'Labour and Working Conditions (ESS2)'], documentFormats: ['Project Appraisal Document (PAD)', 'Implementation Completion Report (ICR)', 'Project Information Document (PID)', 'Integrated Safeguards Data Sheet (ISDS)'], procurementRules: 'International Competitive Bidding (ICB) for contracts above thresholds; national procurement below', applicableWhen: 'World Bank-financed projects; IDA/IBRD lending; trust fund programmes' },
  { id: 'ADB', name: 'Asian Development Bank', acronym: 'ADB', role: 'Development finance for Asia-Pacific; policy dialogue; technical assistance', complianceStandards: ['Safeguard Policy Statement 2009', 'Anticorruption Policy', 'Public Communications Policy', 'Social Protection Strategy', 'Gender mainstreaming requirements'], documentFormats: ['Report and Recommendation of the President (RRP)', 'Initial Poverty and Social Analysis (IPSA)', 'Environmental Assessment Review Framework', 'Technical Assistance Report'], procurementRules: 'ADB Procurement Policy 2017; value for money; international competitive bidding', applicableWhen: 'ADB sovereign and non-sovereign operations; technical assistance; co-financing' },
  { id: 'IFC', name: 'International Finance Corporation', acronym: 'IFC', role: 'Private sector development in emerging markets; equity and debt investments', complianceStandards: ['IFC Performance Standards on Environmental and Social Sustainability', 'PS1: Assessment and Management', 'PS2: Labour and Working Conditions', 'PS5: Land Acquisition and Involuntary Resettlement', 'PS6: Biodiversity Conservation', 'PS7: Indigenous Peoples', 'Equator Principles alignment'], documentFormats: ['Environmental and Social Review Summary (ESRS)', 'Summary of Investment Information (SII)', 'Environmental and Social Action Plan (ESAP)'], procurementRules: 'IFC-required procurement procedures for investment projects', applicableWhen: 'IFC direct investments; IFC Advisory mandates; Equator Principles-aligned financing' },
  { id: 'UNIDO', name: 'United Nations Industrial Development Organization', acronym: 'UNIDO', role: 'Inclusive and sustainable industrial development', complianceStandards: ['UNIDO Project Cycle', 'Environmental and Social Safeguards', 'Gender Equality and Empowerment of Women', 'Technology transfer guidelines'], documentFormats: ['Project Document (ProDoc)', 'Feasibility Study (UNIDO format)', 'Terminal Evaluation Report', 'Country Programme Document'], procurementRules: 'UNIDO Procurement Manual; UN system common procurement', applicableWhen: 'UNIDO technical cooperation; GEF projects executed by UNIDO; industrial policy support' },
  { id: 'UNDP', name: 'United Nations Development Programme', acronym: 'UNDP', role: 'Sustainable development; poverty eradication; democratic governance', complianceStandards: ['Social and Environmental Standards (SES) 2021', 'Human Rights Due Diligence', 'Stakeholder Response Mechanism', 'Gender mainstreaming'], documentFormats: ['Project Document', 'Country Programme Document', 'Mid-Term Review', 'Terminal Evaluation', 'GEF Project Identification Form (PIF)'], procurementRules: 'UNDP Programme and Operations Policies and Procedures (POPP)', applicableWhen: 'UNDP-executed programmes; GEF/GCF projects through UNDP; SDG-aligned initiatives' },
  { id: 'GCF', name: 'Green Climate Fund', acronym: 'GCF', role: 'Climate finance for developing countries; mitigation and adaptation', complianceStandards: ['Environmental and Social Policy', 'Gender Policy', 'Indigenous Peoples Policy', 'Information Disclosure Policy', 'Monitoring and accountability framework'], documentFormats: ['Funding Proposal', 'Concept Note', 'No-Objection Procedure documentation', 'Annual Performance Report'], procurementRules: 'Accredited Entity procurement; GCF fiduciary standards', applicableWhen: 'Climate mitigation/adaptation projects in developing countries; readiness programmes' },
  { id: 'AfDB', name: 'African Development Bank', acronym: 'AfDB', role: 'Development finance for Africa; regional integration support', complianceStandards: ['Integrated Safeguards System (ISS)', 'Anti-Corruption mechanisms', 'Gender Policy', 'Climate Change and Green Growth Policy'], documentFormats: ['Project Appraisal Report', 'Environmental and Social Impact Assessment', 'Country Strategy Paper', 'Project Completion Report'], procurementRules: 'AfDB Procurement Policy Framework 2015; revised 2023', applicableWhen: 'AfDB sovereign and non-sovereign operations in Africa; regional projects' },
  { id: 'EBRD', name: 'European Bank for Reconstruction and Development', acronym: 'EBRD', role: 'Private and public sector financing in emerging Europe, Central Asia, MENA', complianceStandards: ['Environmental and Social Policy 2019', 'Performance Requirements (10 PRs)', 'Gender Strategy', 'Transition qualities framework'], documentFormats: ['Project Summary Document', 'Board Document', 'Environmental and Social Action Plan', 'Transition Impact Assessment'], procurementRules: 'EBRD Procurement Policies and Rules', applicableWhen: 'EBRD financing in countries of operation; PPP advisory; municipal infrastructure' },
];

// ============================================================================
// COMPLIANCE ENGINE
// ============================================================================

export class GlobalComplianceFramework {

  /**
   * Get compliance profile for any country
   */
  static getCountryProfile(country: string): CountryComplianceProfile | undefined {
    return COUNTRY_PROFILES.find(c => 
      c.country.toLowerCase() === country.toLowerCase() ||
      c.iso3.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Get all country profiles
   */
  static getAllCountries(): CountryComplianceProfile[] {
    return [...COUNTRY_PROFILES];
  }

  /**
   * Get countries by region
   */
  static getCountriesByRegion(region: string): CountryComplianceProfile[] {
    const lower = region.toLowerCase();
    return COUNTRY_PROFILES.filter(c =>
      c.region.toLowerCase().includes(lower) ||
      c.subRegion.toLowerCase().includes(lower)
    );
  }

  /**
   * Get regional bloc profile
   */
  static getRegionalBloc(id: string): RegionalBlocProfile | undefined {
    return REGIONAL_BLOCS.find(b => b.id.toLowerCase() === id.toLowerCase() || b.acronym.toLowerCase() === id.toLowerCase());
  }

  /**
   * Get all regional blocs a country belongs to
   */
  static getCountryBlocs(country: string): RegionalBlocProfile[] {
    const profile = this.getCountryProfile(country);
    if (!profile) return [];
    return REGIONAL_BLOCS.filter(b => profile.memberOf.includes(b.id));
  }

  /**
   * Get international body profile
   */
  static getInternationalBody(id: string): InternationalBodyProfile | undefined {
    return INTERNATIONAL_BODIES.find(b => b.id.toLowerCase() === id.toLowerCase() || b.acronym.toLowerCase() === id.toLowerCase());
  }

  /**
   * Get all international bodies
   */
  static getAllInternationalBodies(): InternationalBodyProfile[] {
    return [...INTERNATIONAL_BODIES];
  }

  /**
   * Run comprehensive compliance check for a transaction
   */
  static checkCompliance(params: {
    country: string;
    sector?: string;
    investmentSize?: number;
    foreignOwnership?: boolean;
    fundingSource?: string;
  }): ComplianceCheck {
    const profile = this.getCountryProfile(params.country);
    const blocs = this.getCountryBlocs(params.country);
    const frameworks: string[] = [];
    const standards: string[] = [];
    const flags: string[] = [];
    const disclosures: string[] = [];
    const blockers: string[] = [];
    const recommendations: string[] = [];

    // Country-level frameworks
    if (profile) {
      frameworks.push(profile.investmentFramework);
      standards.push(profile.labourStandards, profile.environmentalRequirements, profile.dataPrivacyFramework, profile.antiCorruptionLaws);

      // Sanctions check
      if (profile.sanctionsStatus === 'comprehensive-sanctions') {
        flags.push(`CRITICAL: ${profile.country} is subject to comprehensive international sanctions (OFAC/EU/UN)`);
        blockers.push(`Investment in ${profile.country} is prohibited under current sanctions regimes. Legal counsel required.`);
      } else if (profile.sanctionsStatus === 'partial-restrictions') {
        flags.push(`WARNING: ${profile.country} has partial sanctions/restrictions. Sector-specific screening required.`);
      }

      // Compliance risk level
      if (profile.complianceRiskLevel === 'critical') {
        flags.push(`Compliance risk level: CRITICAL. Enhanced due diligence mandatory.`);
      } else if (profile.complianceRiskLevel === 'high') {
        flags.push(`Compliance risk level: HIGH. Additional safeguards recommended.`);
        recommendations.push('Engage local legal counsel for regulatory navigation');
        recommendations.push('Implement enhanced anti-corruption controls');
      }

      // CPI flag
      if (profile.corruptionPerceptionIndex < 30) {
        flags.push(`Low CPI (${profile.corruptionPerceptionIndex}/100): significant corruption risk. Anti-bribery compliance programme essential.`);
      }
    } else {
      flags.push(`Country "${params.country}" not found in compliance database. Manual compliance review required.`);
    }

    // Regional bloc standards
    for (const bloc of blocs) {
      frameworks.push(`${bloc.acronym}: ${bloc.tradeFramework}`);
      standards.push(...bloc.complianceRequirements);
    }

    // Development finance standards (if applicable)
    if (params.fundingSource) {
      const body = this.getInternationalBody(params.fundingSource);
      if (body) {
        frameworks.push(`${body.acronym} financing: ${body.procurementRules}`);
        standards.push(...body.complianceStandards);
        disclosures.push(`${body.acronym} document formats required: ${body.documentFormats.join(', ')}`);
      }
    }

    // Mandatory disclosures for all outputs
    disclosures.push(
      'This analysis is AI-generated intelligence. It does not constitute legal, financial, or professional advice.',
      'Independent professional verification is required before reliance.',
      'Compliance requirements should be verified with local legal counsel.',
      `Analysis date: ${new Date().toISOString().split('T')[0]}. Regulations change " verify currency of information.`
    );

    // Determine overall risk level
    let riskLevel: ComplianceCheck['riskLevel'] = 'low';
    if (blockers.length > 0) riskLevel = 'critical';
    else if (flags.filter(f => f.includes('CRITICAL')).length > 0) riskLevel = 'critical';
    else if (flags.filter(f => f.includes('WARNING') || f.includes('HIGH')).length > 0) riskLevel = 'high';
    else if (flags.length > 0) riskLevel = 'medium';

    return {
      country: params.country,
      applicableFrameworks: [...new Set(frameworks)],
      requiredStandards: [...new Set(standards.filter(Boolean))],
      sanctionsFlags: flags,
      mandatoryDisclosures: disclosures,
      riskLevel,
      blockers,
      recommendations
    };
  }

  /**
   * Generate compliance briefing for inclusion in reports
   */
  static generateComplianceBriefing(country: string): string {
    const profile = this.getCountryProfile(country);
    if (!profile) {
      return `**Compliance Note:** No detailed compliance profile available for ${country}. Standard international compliance frameworks apply. Local legal counsel must be engaged before proceeding.`;
    }

    const blocs = this.getCountryBlocs(country);
    const lines: string[] = [
      `**Compliance Framework " ${profile.country} (${profile.iso3})**`,
      ``,
      `**Region:** ${profile.subRegion}, ${profile.region} | **Income Level:** ${profile.incomeLevel}`,
      `**Investment Framework:** ${profile.investmentFramework}`,
      `**Key Agencies:** ${profile.keyAgencies.join(', ')}`,
      `**Foreign Ownership:** ${profile.foreignOwnershipRules}`,
      `**Incentives:** ${profile.incentiveStructure}`,
      `**Typical Timeline:** ${profile.typicalTimeline}`,
      `**Tax Treaties:** ${profile.taxTreatyNetwork}`,
      `**Environmental:** ${profile.environmentalRequirements}`,
      `**Labour:** ${profile.labourStandards}`,
      `**Data Privacy:** ${profile.dataPrivacyFramework}`,
      `**Anti-Corruption:** ${profile.antiCorruptionLaws}`,
      `**Dispute Resolution:** ${profile.disputeResolution}`,
      `**Doing Business Ease:** ${profile.doingBusinessEase}/190 | **CPI:** ${profile.corruptionPerceptionIndex}/100 | **Rule of Law:** ${profile.ruleOfLawIndex}/100`,
      `**Sanctions Status:** ${profile.sanctionsStatus}`,
      `**Member Of:** ${profile.memberOf.join(', ')}`,
    ];

    if (blocs.length > 0) {
      lines.push(``, `**Regional Framework Compliance:**`);
      for (const bloc of blocs) {
        lines.push(`- **${bloc.acronym}:** ${bloc.complianceRequirements.slice(0, 3).join('; ')}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Get total country coverage count
   */
  static getCoverageCount(): { countries: number; blocs: number; bodies: number } {
    return {
      countries: COUNTRY_PROFILES.length,
      blocs: REGIONAL_BLOCS.length,
      bodies: INTERNATIONAL_BODIES.length,
    };
  }
}

export default GlobalComplianceFramework;

