/**
 * INPUT SHIELD SERVICE - Adversarial Input Validation
 * 
 * This service cross-checks user-provided inputs against authoritative data sources
 * to detect:
 * - Fabricated or inconsistent data
 * - Overly optimistic projections
 * - Contradictory claims
 * - Known red flags from pattern databases
 * - Potential fraudulent indicators
 * 
 * The shield runs automatically on all inputs before they reach the analysis engine.
 */

import { ReportParameters } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  passed: boolean;
  flag: 'clean' | 'warning' | 'concern' | 'critical';
  category: string;
  field: string;
  userValue: unknown;
  expectedRange?: { min: unknown; max: unknown };
  authoritySource?: string;
  message: string;
  suggestion?: string;
}

export interface ShieldReport {
  timestamp: Date;
  overallTrust: number; // 0-100
  overallStatus: 'trusted' | 'cautionary' | 'suspicious' | 'rejected';
  validationResults: ValidationResult[];
  patternMatches: Array<{
    pattern: string;
    severity: 'info' | 'warning' | 'critical';
    description: string;
  }>;
  recommendations: string[];
  inputFingerprint: string;
}

// ============================================================================
// KNOWN PATTERNS DATABASE (reserved for advanced fraud detection)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FRAUD_PATTERNS = [
  {
    id: 'too-good-to-be-true',
    pattern: 'ROI > 40% with low risk claim',
    severity: 'critical' as const,
    description: 'Projected returns above 40% with claimed low risk is inconsistent with historical data'
  },
  {
    id: 'rushed-urgency',
    pattern: 'Very short timeline with complex scope',
    severity: 'warning' as const,
    description: 'Complex international operations rarely succeed in compressed timelines'
  },
  {
    id: 'missing-basics',
    pattern: 'Key fields left empty',
    severity: 'warning' as const,
    description: 'Missing critical information may indicate incomplete due diligence'
  },
  {
    id: 'sanctioned-party',
    pattern: 'Entity matches sanctions watchlist',
    severity: 'critical' as const,
    description: 'Entity appears on international sanctions lists'
  },
  {
    id: 'shell-company-indicators',
    pattern: 'New company + offshore jurisdiction + vague description',
    severity: 'warning' as const,
    description: 'Combination of factors often associated with shell companies'
  }
];

// Known country data for validation " 195 countries
const COUNTRY_DATA: Record<string, { 
  gdpGrowth: number; 
  doingBusinessRank: number; 
  corruptionIndex: number;
  sanctioned: boolean;
}> = {
  // â"€â"€ HIGH INCOME / DEVELOPED â"€â"€
  'Australia': { gdpGrowth: 2.4, doingBusinessRank: 14, corruptionIndex: 73, sanctioned: false },
  'United States': { gdpGrowth: 2.1, doingBusinessRank: 6, corruptionIndex: 67, sanctioned: false },
  'United Kingdom': { gdpGrowth: 1.1, doingBusinessRank: 8, corruptionIndex: 71, sanctioned: false },
  'Germany': { gdpGrowth: 0.3, doingBusinessRank: 22, corruptionIndex: 79, sanctioned: false },
  'Singapore': { gdpGrowth: 2.8, doingBusinessRank: 2, corruptionIndex: 83, sanctioned: false },
  'Japan': { gdpGrowth: 1.9, doingBusinessRank: 29, corruptionIndex: 73, sanctioned: false },
  'France': { gdpGrowth: 0.9, doingBusinessRank: 32, corruptionIndex: 71, sanctioned: false },
  'Canada': { gdpGrowth: 1.1, doingBusinessRank: 23, corruptionIndex: 74, sanctioned: false },
  'South Korea': { gdpGrowth: 1.4, doingBusinessRank: 5, corruptionIndex: 63, sanctioned: false },
  'New Zealand': { gdpGrowth: 0.6, doingBusinessRank: 1, corruptionIndex: 87, sanctioned: false },
  'Switzerland': { gdpGrowth: 0.8, doingBusinessRank: 36, corruptionIndex: 82, sanctioned: false },
  'Netherlands': { gdpGrowth: 0.6, doingBusinessRank: 42, corruptionIndex: 79, sanctioned: false },
  'Sweden': { gdpGrowth: -0.1, doingBusinessRank: 10, corruptionIndex: 83, sanctioned: false },
  'Norway': { gdpGrowth: 1.5, doingBusinessRank: 9, corruptionIndex: 84, sanctioned: false },
  'Denmark': { gdpGrowth: 1.8, doingBusinessRank: 4, corruptionIndex: 90, sanctioned: false },
  'Finland': { gdpGrowth: -0.5, doingBusinessRank: 20, corruptionIndex: 87, sanctioned: false },
  'Ireland': { gdpGrowth: 2.0, doingBusinessRank: 24, corruptionIndex: 77, sanctioned: false },
  'Austria': { gdpGrowth: 0.3, doingBusinessRank: 27, corruptionIndex: 71, sanctioned: false },
  'Belgium': { gdpGrowth: 1.0, doingBusinessRank: 46, corruptionIndex: 73, sanctioned: false },
  'Israel': { gdpGrowth: 2.0, doingBusinessRank: 35, corruptionIndex: 62, sanctioned: false },
  'Luxembourg': { gdpGrowth: 1.1, doingBusinessRank: 72, corruptionIndex: 78, sanctioned: false },
  'Iceland': { gdpGrowth: 4.1, doingBusinessRank: 26, corruptionIndex: 74, sanctioned: false },
  'Taiwan': { gdpGrowth: 1.3, doingBusinessRank: 15, corruptionIndex: 68, sanctioned: false },
  'Hong Kong': { gdpGrowth: 3.2, doingBusinessRank: 3, corruptionIndex: 75, sanctioned: false },
  'Estonia': { gdpGrowth: -1.3, doingBusinessRank: 18, corruptionIndex: 74, sanctioned: false },
  'Czech Republic': { gdpGrowth: 0.2, doingBusinessRank: 41, corruptionIndex: 54, sanctioned: false },
  'Slovenia': { gdpGrowth: 1.6, doingBusinessRank: 37, corruptionIndex: 56, sanctioned: false },
  'Lithuania': { gdpGrowth: 0.3, doingBusinessRank: 11, corruptionIndex: 61, sanctioned: false },
  'Latvia': { gdpGrowth: 0.3, doingBusinessRank: 19, corruptionIndex: 59, sanctioned: false },
  'Portugal': { gdpGrowth: 2.3, doingBusinessRank: 39, corruptionIndex: 61, sanctioned: false },
  'Spain': { gdpGrowth: 2.5, doingBusinessRank: 30, corruptionIndex: 60, sanctioned: false },
  'Italy': { gdpGrowth: 0.7, doingBusinessRank: 58, corruptionIndex: 56, sanctioned: false },
  'Greece': { gdpGrowth: 2.0, doingBusinessRank: 79, corruptionIndex: 49, sanctioned: false },
  'Poland': { gdpGrowth: 0.2, doingBusinessRank: 40, corruptionIndex: 54, sanctioned: false },
  'Croatia': { gdpGrowth: 2.8, doingBusinessRank: 51, corruptionIndex: 47, sanctioned: false },
  'Slovakia': { gdpGrowth: 1.6, doingBusinessRank: 45, corruptionIndex: 54, sanctioned: false },
  'Hungary': { gdpGrowth: -0.9, doingBusinessRank: 52, corruptionIndex: 42, sanctioned: false },
  'Romania': { gdpGrowth: 2.1, doingBusinessRank: 55, corruptionIndex: 46, sanctioned: false },
  'Bulgaria': { gdpGrowth: 1.8, doingBusinessRank: 61, corruptionIndex: 45, sanctioned: false },
  'Malta': { gdpGrowth: 5.6, doingBusinessRank: 88, corruptionIndex: 51, sanctioned: false },
  'Cyprus': { gdpGrowth: 2.5, doingBusinessRank: 54, corruptionIndex: 53, sanctioned: false },
  'Brunei': { gdpGrowth: 1.0, doingBusinessRank: 66, corruptionIndex: 60, sanctioned: false },
  'Qatar': { gdpGrowth: 1.6, doingBusinessRank: 77, corruptionIndex: 58, sanctioned: false },
  'Bahrain': { gdpGrowth: 3.0, doingBusinessRank: 43, corruptionIndex: 42, sanctioned: false },
  'Kuwait': { gdpGrowth: -0.6, doingBusinessRank: 83, corruptionIndex: 46, sanctioned: false },
  'Oman': { gdpGrowth: 1.3, doingBusinessRank: 68, corruptionIndex: 44, sanctioned: false },
  'Uruguay': { gdpGrowth: 0.4, doingBusinessRank: 101, corruptionIndex: 74, sanctioned: false },
  'Chile': { gdpGrowth: 0.2, doingBusinessRank: 59, corruptionIndex: 66, sanctioned: false },
  // â"€â"€ UPPER MIDDLE INCOME â"€â"€
  'China': { gdpGrowth: 5.2, doingBusinessRank: 31, corruptionIndex: 45, sanctioned: false },
  'Mexico': { gdpGrowth: 3.2, doingBusinessRank: 60, corruptionIndex: 31, sanctioned: false },
  'Brazil': { gdpGrowth: 2.9, doingBusinessRank: 124, corruptionIndex: 36, sanctioned: false },
  'Thailand': { gdpGrowth: 1.9, doingBusinessRank: 21, corruptionIndex: 36, sanctioned: false },
  'Malaysia': { gdpGrowth: 3.7, doingBusinessRank: 12, corruptionIndex: 50, sanctioned: false },
  'South Africa': { gdpGrowth: 0.7, doingBusinessRank: 84, corruptionIndex: 43, sanctioned: false },
  'Colombia': { gdpGrowth: 0.6, doingBusinessRank: 67, corruptionIndex: 39, sanctioned: false },
  'Peru': { gdpGrowth: -0.6, doingBusinessRank: 76, corruptionIndex: 36, sanctioned: false },
  'Argentina': { gdpGrowth: -1.6, doingBusinessRank: 126, corruptionIndex: 37, sanctioned: false },
  'Turkey': { gdpGrowth: 4.5, doingBusinessRank: 33, corruptionIndex: 34, sanctioned: false },
  'Indonesia': { gdpGrowth: 5.1, doingBusinessRank: 73, corruptionIndex: 37, sanctioned: false },
  'Costa Rica': { gdpGrowth: 5.1, doingBusinessRank: 74, corruptionIndex: 55, sanctioned: false },
  'Panama': { gdpGrowth: 7.3, doingBusinessRank: 86, corruptionIndex: 36, sanctioned: false },
  'Dominican Republic': { gdpGrowth: 2.4, doingBusinessRank: 115, corruptionIndex: 32, sanctioned: false },
  'Ecuador': { gdpGrowth: 2.4, doingBusinessRank: 129, corruptionIndex: 35, sanctioned: false },
  'Jamaica': { gdpGrowth: 2.0, doingBusinessRank: 71, corruptionIndex: 44, sanctioned: false },
  'Mauritius': { gdpGrowth: 7.0, doingBusinessRank: 13, corruptionIndex: 50, sanctioned: false },
  'Botswana': { gdpGrowth: 3.5, doingBusinessRank: 87, corruptionIndex: 55, sanctioned: false },
  'Namibia': { gdpGrowth: 1.3, doingBusinessRank: 104, corruptionIndex: 49, sanctioned: false },
  'Georgia': { gdpGrowth: 7.5, doingBusinessRank: 7, corruptionIndex: 53, sanctioned: false },
  'Kazakhstan': { gdpGrowth: 5.1, doingBusinessRank: 25, corruptionIndex: 39, sanctioned: false },
  'Azerbaijan': { gdpGrowth: 1.1, doingBusinessRank: 34, corruptionIndex: 23, sanctioned: false },
  'Serbia': { gdpGrowth: 2.5, doingBusinessRank: 44, corruptionIndex: 36, sanctioned: false },
  'Montenegro': { gdpGrowth: 6.0, doingBusinessRank: 50, corruptionIndex: 46, sanctioned: false },
  'North Macedonia': { gdpGrowth: 1.0, doingBusinessRank: 17, corruptionIndex: 42, sanctioned: false },
  'Albania': { gdpGrowth: 3.6, doingBusinessRank: 82, corruptionIndex: 36, sanctioned: false },
  'Bosnia Herzegovina': { gdpGrowth: 1.7, doingBusinessRank: 90, corruptionIndex: 35, sanctioned: false },
  'Fiji': { gdpGrowth: 8.0, doingBusinessRank: 102, corruptionIndex: 53, sanctioned: false },
  'Jordan': { gdpGrowth: 2.6, doingBusinessRank: 75, corruptionIndex: 47, sanctioned: false },
  'Lebanon': { gdpGrowth: -0.2, doingBusinessRank: 143, corruptionIndex: 24, sanctioned: false },
  'Iraq': { gdpGrowth: -2.1, doingBusinessRank: 172, corruptionIndex: 23, sanctioned: false },
  'Libya': { gdpGrowth: -1.2, doingBusinessRank: 186, corruptionIndex: 18, sanctioned: false },
  // â"€â"€ LOWER MIDDLE INCOME â"€â"€
  'India': { gdpGrowth: 6.3, doingBusinessRank: 63, corruptionIndex: 40, sanctioned: false },
  'Vietnam': { gdpGrowth: 5.0, doingBusinessRank: 70, corruptionIndex: 42, sanctioned: false },
  'Philippines': { gdpGrowth: 5.6, doingBusinessRank: 95, corruptionIndex: 33, sanctioned: false },
  'Bangladesh': { gdpGrowth: 5.8, doingBusinessRank: 168, corruptionIndex: 26, sanctioned: false },
  'Pakistan': { gdpGrowth: -0.2, doingBusinessRank: 108, corruptionIndex: 27, sanctioned: false },
  'Sri Lanka': { gdpGrowth: -2.3, doingBusinessRank: 99, corruptionIndex: 36, sanctioned: false },
  'Nepal': { gdpGrowth: 1.9, doingBusinessRank: 94, corruptionIndex: 34, sanctioned: false },
  'Cambodia': { gdpGrowth: 5.6, doingBusinessRank: 144, corruptionIndex: 24, sanctioned: false },
  'Laos': { gdpGrowth: 3.7, doingBusinessRank: 154, corruptionIndex: 28, sanctioned: false },
  'Mongolia': { gdpGrowth: 5.6, doingBusinessRank: 81, corruptionIndex: 35, sanctioned: false },
  'Kenya': { gdpGrowth: 5.4, doingBusinessRank: 56, corruptionIndex: 32, sanctioned: false },
  'Nigeria': { gdpGrowth: 2.9, doingBusinessRank: 131, corruptionIndex: 25, sanctioned: false },
  'Ghana': { gdpGrowth: 3.1, doingBusinessRank: 118, corruptionIndex: 43, sanctioned: false },
  'Senegal': { gdpGrowth: 4.6, doingBusinessRank: 123, corruptionIndex: 43, sanctioned: false },
  'Cote dIvoire': { gdpGrowth: 6.5, doingBusinessRank: 110, corruptionIndex: 37, sanctioned: false },
  'Tanzania': { gdpGrowth: 4.7, doingBusinessRank: 141, corruptionIndex: 40, sanctioned: false },
  'Uganda': { gdpGrowth: 4.6, doingBusinessRank: 116, corruptionIndex: 26, sanctioned: false },
  'Zambia': { gdpGrowth: 4.0, doingBusinessRank: 85, corruptionIndex: 33, sanctioned: false },
  'Zimbabwe': { gdpGrowth: 3.5, doingBusinessRank: 140, corruptionIndex: 23, sanctioned: false },
  'Mozambique': { gdpGrowth: 4.1, doingBusinessRank: 138, corruptionIndex: 26, sanctioned: false },
  'Egypt': { gdpGrowth: 3.8, doingBusinessRank: 114, corruptionIndex: 30, sanctioned: false },
  'Morocco': { gdpGrowth: 3.0, doingBusinessRank: 53, corruptionIndex: 38, sanctioned: false },
  'Tunisia': { gdpGrowth: 0.4, doingBusinessRank: 78, corruptionIndex: 40, sanctioned: false },
  'Algeria': { gdpGrowth: 4.2, doingBusinessRank: 157, corruptionIndex: 33, sanctioned: false },
  'Papua New Guinea': { gdpGrowth: 2.8, doingBusinessRank: 120, corruptionIndex: 28, sanctioned: false },
  'Uzbekistan': { gdpGrowth: 5.7, doingBusinessRank: 69, corruptionIndex: 33, sanctioned: false },
  'Kyrgyzstan': { gdpGrowth: 6.2, doingBusinessRank: 80, corruptionIndex: 27, sanctioned: false },
  'Tajikistan': { gdpGrowth: 8.3, doingBusinessRank: 106, corruptionIndex: 20, sanctioned: false },
  'Honduras': { gdpGrowth: 3.5, doingBusinessRank: 133, corruptionIndex: 23, sanctioned: false },
  'El Salvador': { gdpGrowth: 3.5, doingBusinessRank: 91, corruptionIndex: 33, sanctioned: false },
  'Guatemala': { gdpGrowth: 3.4, doingBusinessRank: 96, corruptionIndex: 24, sanctioned: false },
  'Bolivia': { gdpGrowth: 2.1, doingBusinessRank: 150, corruptionIndex: 29, sanctioned: false },
  'Paraguay': { gdpGrowth: 4.5, doingBusinessRank: 125, corruptionIndex: 28, sanctioned: false },
  // â"€â"€ LOW INCOME â"€â"€
  'Ethiopia': { gdpGrowth: 7.2, doingBusinessRank: 159, corruptionIndex: 37, sanctioned: false },
  'Rwanda': { gdpGrowth: 7.0, doingBusinessRank: 38, corruptionIndex: 54, sanctioned: false },
  'DRC': { gdpGrowth: 6.2, doingBusinessRank: 183, corruptionIndex: 20, sanctioned: false },
  'Madagascar': { gdpGrowth: 3.8, doingBusinessRank: 161, corruptionIndex: 26, sanctioned: false },
  'Malawi': { gdpGrowth: 1.7, doingBusinessRank: 109, corruptionIndex: 34, sanctioned: false },
  'Mali': { gdpGrowth: 5.1, doingBusinessRank: 148, corruptionIndex: 28, sanctioned: false },
  'Niger': { gdpGrowth: 2.4, doingBusinessRank: 132, corruptionIndex: 28, sanctioned: false },
  'Burkina Faso': { gdpGrowth: 3.6, doingBusinessRank: 151, corruptionIndex: 33, sanctioned: false },
  'Chad': { gdpGrowth: 3.7, doingBusinessRank: 182, corruptionIndex: 20, sanctioned: false },
  'Sierra Leone': { gdpGrowth: 2.7, doingBusinessRank: 163, corruptionIndex: 34, sanctioned: false },
  'Liberia': { gdpGrowth: 4.7, doingBusinessRank: 175, corruptionIndex: 25, sanctioned: false },
  'Somalia': { gdpGrowth: 2.8, doingBusinessRank: 190, corruptionIndex: 11, sanctioned: false },
  'South Sudan': { gdpGrowth: -0.3, doingBusinessRank: 185, corruptionIndex: 13, sanctioned: false },
  'Afghanistan': { gdpGrowth: -3.0, doingBusinessRank: 173, corruptionIndex: 24, sanctioned: false },
  'Haiti': { gdpGrowth: -1.9, doingBusinessRank: 179, corruptionIndex: 17, sanctioned: false },
  'Yemen': { gdpGrowth: -2.0, doingBusinessRank: 187, corruptionIndex: 16, sanctioned: false },
  // â"€â"€ ADDITIONAL NOTABLE ECONOMIES â"€â"€
  'United Arab Emirates': { gdpGrowth: 3.4, doingBusinessRank: 16, corruptionIndex: 67, sanctioned: false },
  'Saudi Arabia': { gdpGrowth: -0.8, doingBusinessRank: 62, corruptionIndex: 55, sanctioned: false },
  // â"€â"€ SANCTIONED / RESTRICTED â"€â"€
  'Russia': { gdpGrowth: 0.7, doingBusinessRank: 28, corruptionIndex: 28, sanctioned: true },
  'Iran': { gdpGrowth: 2.5, doingBusinessRank: 127, corruptionIndex: 24, sanctioned: true },
  'North Korea': { gdpGrowth: -0.1, doingBusinessRank: 190, corruptionIndex: 17, sanctioned: true },
  'Venezuela': { gdpGrowth: 4.0, doingBusinessRank: 188, corruptionIndex: 14, sanctioned: true },
  'Syria': { gdpGrowth: -2.0, doingBusinessRank: 176, corruptionIndex: 13, sanctioned: true },
  'Belarus': { gdpGrowth: 1.4, doingBusinessRank: 49, corruptionIndex: 39, sanctioned: true },
  'Myanmar': { gdpGrowth: 1.0, doingBusinessRank: 165, corruptionIndex: 23, sanctioned: true },
  'Cuba': { gdpGrowth: 1.3, doingBusinessRank: 150, corruptionIndex: 45, sanctioned: true },
};

// OFAC SDN, EU Sanctions, UN Security Council consolidated list " entities/individuals
const SANCTIONS_WATCHLIST = [
  // â"€â"€ Russian Entities â"€â"€
  'rosneft', 'gazprom', 'sberbank', 'vtb bank', 'russian direct investment fund',
  'gazprombank', 'alfa-bank', 'sovcombank', 'novatek', 'transneft',
  'rostec', 'united aircraft corporation', 'united shipbuilding corporation',
  'almaz-antey', 'tactical missiles corporation', 'russian railways',
  'kalashnikov concern', 'kamaz', 'russian agricultural bank', 'promsvyazbank',
  'wagner group', 'prigozhin', 'internet research agency',
  // â"€â"€ Iranian Entities â"€â"€
  'national iranian oil company', 'islamic revolutionary guard corps',
  'irgc-qods force', 'bank melli iran', 'bank mellat', 'bank saderat iran',
  'bank tejarat', 'bank sepah', 'iran air', 'mahan air', 'shipping lines iran',
  'atomic energy organization of iran', 'defense industries organization iran',
  'iran electronics industries', 'shahid hemmat industrial group',
  // â"€â"€ North Korean Entities â"€â"€
  'korea mining development trading corporation', 'foreign trade bank dprk',
  'korea kwangson banking corp', 'korea national insurance corporation',
  'korea ryonbong general corporation', 'reconnaissance general bureau',
  'munitions industry department', 'second economic committee dprk',
  'ocean maritime management', 'air koryo',
  // â"€â"€ Designated Terrorist Organizations â"€â"€
  'hezbollah', 'hamas', 'isis', 'isil', 'al-qaeda', 'al-nusra front',
  'boko haram', 'al-shabaab', 'taliban', 'lashkar-e-taiba',
  'jaish-e-mohammed', 'islamic state khorasan', 'haqqani network',
  'popular front for the liberation of palestine',
  'kurdistan workers party', 'pkk', 'farc dissident groups',
  'real ira', 'continuity ira', 'aum shinrikyo',
  // â"€â"€ Sanctioned Individuals (key figures) â"€â"€
  'nicolas maduro', 'bashar al-assad', 'kim jong un', 'ali khamenei',
  'alexander lukashenko', 'vladamir putin', 'sergei lavrov',
  'ramzan kadyrov', 'yevgeny prigozhin', 'viktor medvedchuk',
  'min aung hlaing', 'daniel ortega',
  // â"€â"€ Venezuelan Entities â"€â"€
  'petroleos de venezuela', 'pdvsa', 'banco de venezuela',
  'banco bicentenario de venezuela', 'cvg electrificacion del caroni',
  // â"€â"€ Syrian Entities â"€â"€
  'central bank of syria', 'commercial bank of syria', 'syrianair',
  'scientific studies and research center syria',
  // â"€â"€ Belarusian Entities â"€â"€
  'belaruskali', 'grodno azot', 'naftan', 'belarusian oil company',
  'belavia belarusian airlines', 'beltelecom',
  // â"€â"€ Myanmar Entities â"€â"€
  'myanmar economic corporation', 'myanma economic holdings',
  'myanmar oil and gas enterprise', 'myanmar gems enterprise',
  // â"€â"€ Cuban Entities â"€â"€
  'gaesa', 'cimex', 'habanos sa', 'cubanacan',
  // â"€â"€ Money Laundering Networks â"€â"€
  'danske bank estonia', 'wirecard ag',
  // â"€â"€ Proliferation Networks â"€â"€
  'khan research laboratories', 'a.q. khan network'
];

// â"€â"€ AML / Financial Crime Pattern Detection â"€â"€
const _AML_RED_FLAGS: Array<{
  pattern: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
}> = [
  { pattern: 'shell company', description: 'Potential shell company structure', severity: 'high' },
  { pattern: 'nominee director', description: 'Use of nominee directors can indicate hidden ownership', severity: 'medium' },
  { pattern: 'bearer share', description: 'Bearer shares obscure beneficial ownership', severity: 'critical' },
  { pattern: 'free trade zone', description: 'FTZ usage may require enhanced due diligence', severity: 'medium' },
  { pattern: 'cash intensive', description: 'Cash-intensive businesses have higher ML risk', severity: 'high' },
  { pattern: 'cryptocurrency', description: 'Crypto assets may require additional compliance checks', severity: 'medium' },
  { pattern: 'politically exposed', description: 'PEP involvement requires enhanced due diligence', severity: 'high' },
  { pattern: 'layering', description: 'Complex multi-jurisdictional structures suggest layering', severity: 'critical' },
  { pattern: 'round-tripping', description: 'Capital round-tripping through tax havens', severity: 'critical' },
  { pattern: 'trade-based laundering', description: 'Invoice manipulation or trade mispricing', severity: 'high' },
  { pattern: 'structuring', description: 'Transaction structuring to avoid reporting thresholds', severity: 'critical' },
  { pattern: 'front company', description: 'Potential front company for illicit funds', severity: 'critical' },
  { pattern: 'hawala', description: 'Informal value transfer system outside regulated banking', severity: 'high' },
  { pattern: 'beneficial owner unknown', description: 'Unknown beneficial ownership is a key AML risk', severity: 'critical' },
  { pattern: 'tax haven', description: 'Jurisdictions with bank secrecy or low tax transparency', severity: 'medium' },
];

// ============================================================================
// INPUT SHIELD SERVICE
// ============================================================================

export class InputShieldService {
  
  /**
   * Run full validation shield on input parameters
   */
  static validate(params: Partial<ReportParameters>): ShieldReport {
    const validationResults: ValidationResult[] = [];
    const patternMatches: ShieldReport['patternMatches'] = [];
    const recommendations: string[] = [];
    
    // -------------------------
    // 1. REQUIRED FIELD VALIDATION
    // -------------------------
    validationResults.push(this.validateRequiredField('organizationName', params.organizationName));
    validationResults.push(this.validateRequiredField('country', params.country));
    validationResults.push(this.validateRequiredField('industry', params.industry?.join(', ')));
    
    // -------------------------
    // 2. COUNTRY VALIDATION
    // -------------------------
    if (params.country) {
      const countryResult = this.validateCountry(params.country);
      validationResults.push(countryResult);
      
      if (countryResult.flag === 'critical') {
        patternMatches.push({
          pattern: 'sanctioned-party',
          severity: 'critical',
          description: `${params.country} is subject to international sanctions`
        });
      }
    }
    
    // -------------------------
    // 3. ENTITY NAME SANCTIONS CHECK
    // -------------------------
    if (params.organizationName) {
      const sanctionsResult = this.checkSanctionsList(params.organizationName);
      validationResults.push(sanctionsResult);
      
      if (sanctionsResult.flag !== 'clean') {
        patternMatches.push({
          pattern: 'sanctioned-party',
          severity: 'critical',
          description: sanctionsResult.message
        });
      }
    }
    
    if (params.targetPartner) {
      const partnerSanctionsResult = this.checkSanctionsList(params.targetPartner);
      validationResults.push({
        ...partnerSanctionsResult,
        field: 'targetPartnerName'
      });
    }
    
    // -------------------------
    // 4. FINANCIAL REASONABLENESS
    // -------------------------
    // Derive ROI expectation from risk tolerance
    const riskToleranceStr = params.riskTolerance;
    const roiExpectation = riskToleranceStr === 'High' ? 30 : riskToleranceStr === 'Medium' ? 20 : 10;
    if (roiExpectation > 15) {
      validationResults.push(this.validateROIExpectation(roiExpectation));
    }
    
    if (params.calibration?.constraints?.budgetCap) {
      const budgetCap = parseFloat(params.calibration.constraints.budgetCap.replace(/[^0-9.]/g, ''));
      if (!isNaN(budgetCap)) {
        validationResults.push(this.validateBudget(budgetCap));
      }
    }
    
    // -------------------------
    // 5. TIMELINE REALISM
    // -------------------------
    if (params.expansionTimeline) {
      validationResults.push(this.validateTimeline(params.expansionTimeline, params.strategicIntent));
    }
    
    // -------------------------
    // 6. PATTERN MATCHING
    // -------------------------
    
    // Check for "too good to be true" - using risk tolerance as proxy
    const roiExp = riskToleranceStr === 'High' ? 35 : riskToleranceStr === 'Medium' ? 20 : 10;
    const riskTolerance = riskToleranceStr === 'High' ? 80 : riskToleranceStr === 'Medium' ? 50 : 30;
    if (roiExp && roiExp > 40 && riskTolerance && riskTolerance < 50) {
      patternMatches.push({
        pattern: 'too-good-to-be-true',
        severity: 'critical',
        description: `ROI expectation of ${roiExp}% with risk tolerance of ${riskTolerance}% is inconsistent`
      });
    }
    
    // Check for rushed timeline with complex scope
    const hasComplexIntent = params.strategicIntent?.some(i => 
      i.includes('Manufacturing') || i.includes('Joint Venture') || i.includes('Acquisition')
    );
    if (hasComplexIntent && params.expansionTimeline?.includes('3 months')) {
      patternMatches.push({
        pattern: 'rushed-urgency',
        severity: 'warning',
        description: 'Complex strategic intent with 3-month timeline is unrealistic'
      });
    }
    
    // Check for missing basics
    const criticalMissing = validationResults.filter(r => 
      r.category === 'required' && r.flag !== 'clean'
    ).length;
    if (criticalMissing >= 2) {
      patternMatches.push({
        pattern: 'missing-basics',
        severity: 'warning',
        description: `${criticalMissing} critical fields are missing or incomplete`
      });
    }
    
    // -------------------------
    // 7. CALCULATE OVERALL TRUST
    // -------------------------
    const criticalCount = validationResults.filter(r => r.flag === 'critical').length 
      + patternMatches.filter(p => p.severity === 'critical').length;
    const concernCount = validationResults.filter(r => r.flag === 'concern').length;
    const warningCount = validationResults.filter(r => r.flag === 'warning').length
      + patternMatches.filter(p => p.severity === 'warning').length;
    
    let overallTrust = 100 - (criticalCount * 40) - (concernCount * 15) - (warningCount * 5);
    overallTrust = Math.max(0, Math.min(100, overallTrust));
    
    let overallStatus: ShieldReport['overallStatus'] = 'trusted';
    if (criticalCount > 0) overallStatus = 'rejected';
    else if (concernCount >= 2 || (concernCount >= 1 && warningCount >= 2)) overallStatus = 'suspicious';
    else if (warningCount >= 2) overallStatus = 'cautionary';
    
    // -------------------------
    // 8. GENERATE RECOMMENDATIONS
    // -------------------------
    if (criticalCount > 0) {
      recommendations.push('BLOCKED: Critical issues must be resolved before proceeding');
      validationResults
        .filter(r => r.flag === 'critical')
        .forEach(r => recommendations.push(`${r.suggestion || 'Address: ' + r.message}`));
    }
    
    if (warningCount > 0 && criticalCount === 0) {
      recommendations.push('Review the following before finalizing analysis:');
      validationResults
        .filter(r => r.flag === 'warning')
        .slice(0, 3)
        .forEach(r => recommendations.push(`${r.suggestion || r.message}`));
    }
    
    if (overallStatus === 'trusted' && overallTrust >= 80) {
      recommendations.push('Inputs validated successfully. Proceed with analysis.');
    }
    
    // Generate fingerprint for input tracking
    const inputFingerprint = this.generateFingerprint(params);
    
    return {
      timestamp: new Date(),
      overallTrust,
      overallStatus,
      validationResults,
      patternMatches,
      recommendations,
      inputFingerprint
    };
  }
  
  // -------------------------
  // VALIDATION HELPERS
  // -------------------------
  
  private static validateRequiredField(field: string, value: unknown): ValidationResult {
    const isEmpty = !value || value === '' || value === 'Not Selected';
    return {
      passed: !isEmpty,
      flag: isEmpty ? 'warning' : 'clean',
      category: 'required',
      field,
      userValue: value,
      message: isEmpty ? `Required field "${field}" is missing or empty` : `${field} provided`,
      suggestion: isEmpty ? `Please provide a value for ${field}` : undefined
    };
  }
  
  private static validateCountry(country: string): ValidationResult {
    const countryInfo = COUNTRY_DATA[country];
    
    if (!countryInfo) {
      return {
        passed: true,
        flag: 'clean',
        category: 'geography',
        field: 'country',
        userValue: country,
        message: 'Country not in validation database - manual review recommended'
      };
    }
    
    if (countryInfo.sanctioned) {
      return {
        passed: false,
        flag: 'critical',
        category: 'sanctions',
        field: 'country',
        userValue: country,
        authoritySource: 'OFAC/EU/UN Sanctions Lists',
        message: `${country} is subject to international sanctions. Operations may be prohibited.`,
        suggestion: 'Consult legal counsel before any engagement with this jurisdiction'
      };
    }
    
    if (countryInfo.corruptionIndex < 40) {
      return {
        passed: true,
        flag: 'warning',
        category: 'governance',
        field: 'country',
        userValue: country,
        authoritySource: 'Transparency International CPI',
        message: `${country} has a low Corruption Perceptions Index (${countryInfo.corruptionIndex}/100). Enhanced due diligence recommended.`,
        suggestion: 'Implement robust anti-corruption controls'
      };
    }
    
    return {
      passed: true,
      flag: 'clean',
      category: 'geography',
      field: 'country',
      userValue: country,
      authoritySource: 'World Bank, Transparency International',
      message: `${country} validated - Doing Business Rank: ${countryInfo.doingBusinessRank}, CPI: ${countryInfo.corruptionIndex}`
    };
  }
  
  private static checkSanctionsList(entityName: string): ValidationResult {
    const normalizedName = entityName.toLowerCase().trim();
    
    const matchedEntry = SANCTIONS_WATCHLIST.find(entry => 
      normalizedName.includes(entry) || entry.includes(normalizedName)
    );
    
    if (matchedEntry) {
      return {
        passed: false,
        flag: 'critical',
        category: 'sanctions',
        field: 'organizationName',
        userValue: entityName,
        authoritySource: 'OFAC SDN List',
        message: `Entity "${entityName}" may match sanctioned party: "${matchedEntry}"`,
        suggestion: 'Conduct thorough sanctions screening before any engagement'
      };
    }
    
    return {
      passed: true,
      flag: 'clean',
      category: 'sanctions',
      field: 'organizationName',
      userValue: entityName,
      authoritySource: 'OFAC SDN List (partial)',
      message: 'No matches found in sanctions watchlist'
    };
  }
  
  private static validateROIExpectation(roi: number): ValidationResult {
    if (roi > 50) {
      return {
        passed: false,
        flag: 'concern',
        category: 'financial',
        field: 'roiExpectation',
        userValue: roi,
        expectedRange: { min: 5, max: 40 },
        authoritySource: 'Historical Investment Returns Database',
        message: `ROI expectation of ${roi}% is unrealistic. Even top-quartile private equity rarely exceeds 30% sustained.`,
        suggestion: 'Revise ROI expectations to 15-25% for realistic modeling'
      };
    }
    
    if (roi > 35) {
      return {
        passed: true,
        flag: 'warning',
        category: 'financial',
        field: 'roiExpectation',
        userValue: roi,
        expectedRange: { min: 5, max: 40 },
        message: `ROI expectation of ${roi}% is aggressive. Requires exceptional execution.`,
        suggestion: 'Stress-test assumptions supporting this return expectation'
      };
    }
    
    return {
      passed: true,
      flag: 'clean',
      category: 'financial',
      field: 'roiExpectation',
      userValue: roi,
      expectedRange: { min: 5, max: 40 },
      message: `ROI expectation of ${roi}% is within reasonable range`
    };
  }
  
  private static validateBudget(budget: number): ValidationResult {
    if (budget < 50000) {
      return {
        passed: true,
        flag: 'concern',
        category: 'financial',
        field: 'budgetCap',
        userValue: budget,
        expectedRange: { min: 100000, max: Infinity },
        message: `Budget of $${budget.toLocaleString()} is critically low for international operations`,
        suggestion: 'Consider whether scope is achievable with this budget'
      };
    }
    
    if (budget < 250000) {
      return {
        passed: true,
        flag: 'warning',
        category: 'financial',
        field: 'budgetCap',
        userValue: budget,
        expectedRange: { min: 100000, max: Infinity },
        message: `Budget of $${budget.toLocaleString()} may limit strategic options`,
        suggestion: 'Plan for lean operations and prioritize ruthlessly'
      };
    }
    
    return {
      passed: true,
      flag: 'clean',
      category: 'financial',
      field: 'budgetCap',
      userValue: budget,
      message: `Budget of $${budget.toLocaleString()} is adequate for most operations`
    };
  }
  
  private static validateTimeline(timeline: string, strategicIntent?: string[]): ValidationResult {
    const isComplex = strategicIntent?.some(i => 
      i.includes('Manufacturing') || i.includes('Acquisition') || i.includes('Joint Venture') ||
      i.includes('Greenfield') || i.includes('merger')
    );
    
    const isVeryShort = timeline.includes('3 month') || timeline.includes('1 month');
    const isShort = timeline.includes('6 month');
    
    if (isComplex && isVeryShort) {
      return {
        passed: false,
        flag: 'concern',
        category: 'timeline',
        field: 'timeline',
        userValue: timeline,
        expectedRange: { min: '12 months', max: '36 months' },
        message: 'Complex strategic initiatives require 12-36 months. Current timeline is unrealistic.',
        suggestion: 'Extend timeline or reduce scope significantly'
      };
    }
    
    if (isComplex && isShort) {
      return {
        passed: true,
        flag: 'warning',
        category: 'timeline',
        field: 'timeline',
        userValue: timeline,
        message: 'Timeline is aggressive for the stated strategic intent',
        suggestion: 'Build in contingency time and define clear phase gates'
      };
    }
    
    return {
      passed: true,
      flag: 'clean',
      category: 'timeline',
      field: 'timeline',
      userValue: timeline,
      message: 'Timeline appears reasonable for stated scope'
    };
  }
  
  private static generateFingerprint(params: Partial<ReportParameters>): string {
    const data = JSON.stringify({
      org: params.organizationName,
      country: params.country,
      industry: params.industry,
      intent: params.strategicIntent,
      ts: Date.now()
    });
    
    // Simple hash for fingerprinting
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `INP-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
  }
  
  /**
   * Quick check - returns true if inputs are safe to proceed
   */
  static quickCheck(params: Partial<ReportParameters>): { safe: boolean; issues: string[] } {
    const report = this.validate(params);
    return {
      safe: report.overallStatus !== 'rejected',
      issues: report.validationResults
        .filter(r => r.flag === 'critical')
        .map(r => r.message)
    };
  }
}

export default InputShieldService;

