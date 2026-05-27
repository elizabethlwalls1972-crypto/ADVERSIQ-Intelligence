/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * REGIONAL IDENTITY DECODER - Reflexive Intelligence Layer (Layer 9)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Theory: Baudrillard's Simulacra + Regional Competitiveness Theory
 *         (Porter, 1990) + Narrative Theory (Fisher, 1984)
 *
 * The Simulacrum Problem:
 *   Regions lose their identity by copying what they think investors want
 *   to hear. Every city becomes "a hub for innovation with a skilled
 *   workforce and strategic location." The language becomes interchangeable.
 *   The identity becomes a copy of a copy of a copy - a simulacrum.
 *
 * This engine detects when a region has lost its authentic competitive
 * identity and is presenting a generic, interchangeable narrative that
 *   1. Fails to differentiate from competitors
 *   2. Undersells unique assets the region actually possesses
 *   3. Oversells capabilities the region doesn't actually have
 *   4. Copies aspirational narratives from regions with fundamentally
 *      different structural characteristics
 *
 * The output: What the region IS vs. What the region SAYS it is.
 * Where those diverge = competitive identity loss.
 * Where they converge authentically = genuine competitive advantage.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { UserInputSnapshot } from './UserSignalDecoder';

// ============================================================================
// TYPES
// ============================================================================

export interface IdentityElement {
  dimension: string;        // What aspect of identity
  statedIdentity: string;   // What the region says about itself
  revealedIdentity: string; // What the data suggests is true
  alignment: 'authentic' | 'oversold' | 'undersold' | 'simulacrum';
  confidence: number;       // 0-1
  explanation: string;
}

export interface SimulacrumSignal {
  signal: string;           // What triggered the detection
  genericPhrase: string;    // The copycat language used
  frequency: number;        // How many other regions use this exact positioning
  antidote: string;         // What authentic positioning would look like
}

export interface HiddenAsset {
  asset: string;            // What the region has but isn't talking about
  category: 'geographic' | 'cultural' | 'institutional' | 'human' | 'historical' | 'infrastructure';
  strategicValue: string;   // Why this matters to investors
  comparableRegion: string; // Who used this asset successfully
  surfacingStrategy: string; // How to bring this forward
}

export interface IdentityGap {
  dimension: string;
  narrativeStrength: number;  // 0-100: how convincingly they tell it
  evidenceStrength: number;   // 0-100: how much evidence supports it
  gap: number;                // narrative - evidence (positive = oversold)
  recommendation: string;
}

export interface IdentityReport {
  overallAuthenticity: number;  // 0-100
  simulacrumLevel: 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
  identityElements: IdentityElement[];
  simulacrumSignals: SimulacrumSignal[];
  hiddenAssets: HiddenAsset[];
  identityGaps: IdentityGap[];
  authenticDifferentiators: string[];
  positioningRecommendation: string;
  timestamp: string;
}

// ============================================================================
// GENERIC PHRASE DETECTOR - The Copy-Paste Investment Narratives
// ============================================================================

interface GenericPhrase {
  pattern: RegExp;
  genericScore: number;   // How common/generic this is (0-1)
  alternatives: string[]; // Authentic alternatives
  usedBy: string;         // Example of how many regions use it
}

const GENERIC_PHRASES: GenericPhrase[] = [
  {
    pattern: /strategic(ally)?\s*(located|location|position)/i,
    genericScore: 0.95,
    alternatives: ['Specify exact logistic advantage: "4-hour flight to 60% of Asia\'s GDP"', 'Name the trade corridor or shipping route', 'Quantify the cost saving vs specific competitor locations'],
    usedBy: 'Used by 90%+ of investment promotion materials globally'
  },
  {
    pattern: /skilled\s*(and\s*)?(talented\s*)?workforce/i,
    genericScore: 0.9,
    alternatives: ['Specify sector-specific skill: "3,200 certified welders" or "12,000 IT graduates annually"', 'Name specific training institutions', 'Cite wage-to-productivity ratio'],
    usedBy: 'Every region claims this; differentiate by proving it with data'
  },
  {
    pattern: /hub\s*(for|of)\s*(innovation|technology|excellence)/i,
    genericScore: 0.95,
    alternatives: ['Name specific companies that innovate there', 'Cite patent numbers or R&D spending', 'Describe actual innovation infrastructure (labs, accelerators) with output metrics'],
    usedBy: 'Over 500 cities globally claim to be "innovation hubs"'
  },
  {
    pattern: /business.?friendly\s*(environment|climate)/i,
    genericScore: 0.85,
    alternatives: ['Cite specific regulatory advantages: "72-hour company registration"', 'Name specific tax incentives with rates', 'Reference specific bilateral investment treaties'],
    usedBy: 'Standard IPA language in 100+ countries'
  },
  {
    pattern: /world.?class\s*(infrastructure|facilities|education)/i,
    genericScore: 0.9,
    alternatives: ['Rank infrastructure against specific competitors', 'Cite reliability metrics: "99.7% power uptime"', 'Reference international certifications or rankings'],
    usedBy: 'Diluted term - investors have heard it from every location'
  },
  {
    pattern: /gateway\s*(to|for)\s*(asia|europe|africa|markets)/i,
    genericScore: 0.8,
    alternatives: ['Specify which markets and why: connectivity, trade agreements, language, diaspora links', 'Name specific trade routes or flight connections', 'Quantify trade volumes with those markets'],
    usedBy: 'Multiple competing regions use this in every macro-region'
  },
  {
    pattern: /competitive\s*(labour\s*)?costs/i,
    genericScore: 0.7,
    alternatives: ['Cite specific cost comparison vs named competitors', 'Show cost-to-productivity ratio, not just cost', 'Demonstrate cost stability and predictability'],
    usedBy: 'Cost advantage is temporary; demonstrate value-adjusted cost'
  },
  {
    pattern: /growing\s*(domestic\s*)?market/i,
    genericScore: 0.75,
    alternatives: ['Size the market: "12M consumers within 2-hour radius"', 'Show market growth rate vs competitor markets', 'Identify specific underserved market segments'],
    usedBy: 'Most developing regions cite this but few quantify meaningfully'
  },
  {
    pattern: /quality\s*of\s*life/i,
    genericScore: 0.7,
    alternatives: ['Cite specific liveability indices or rankings', 'Reference international school options, healthcare quality, safety data', 'Show housing cost comparisons for expatriate staff'],
    usedBy: 'Subjective claim unless supported by measurable data'
  },
  {
    pattern: /government\s*(support|commitment|incentives)/i,
    genericScore: 0.6,
    alternatives: ['Name specific incentive programmes with eligibility criteria', 'Cite track record: "X companies received Y in incentives over Z years"', 'Reference political stability indicators and policy continuity'],
    usedBy: 'Important but must be specific to be credible'
  }
];

// ============================================================================
// HIDDEN ASSET PATTERNS - Things Regions Don't Know They Have
// ============================================================================

interface HiddenAssetPattern {
  trigger: RegExp;
  asset: string;
  category: HiddenAsset['category'];
  strategicValue: string;
  comparable: string;
  surfacing: string;
}

const HIDDEN_ASSET_PATTERNS: HiddenAssetPattern[] = [
  { trigger: /universit(y|ies)/i, asset: 'University research ecosystem', category: 'institutional', strategicValue: 'University anchor provides talent pipeline, R&D capacity, and institutional stability that persists through economic cycles', comparable: 'Pittsburgh used CMU + UPMC as post-steel anchors; Penang uses USM for industry collaboration', surfacing: 'Map university research strengths to investor sector needs; create industry-university partnership programme' },
  { trigger: /diaspora|overseas\s*(community|workers|population)/i, asset: 'Diaspora investment channel', category: 'human', strategicValue: 'Diaspora networks provide capital, knowledge transfer, market access, and credibility that no IPA can manufacture', comparable: 'Ireland, Israel, India (3I model) - all leveraged diaspora for inward investment', surfacing: 'Create diaspora engagement programme; investment incentives for returning capital; knowledge transfer fellowships' },
  { trigger: /port|harbor|harbour|shipping|maritime/i, asset: 'Port infrastructure - permanent competitive advantage', category: 'infrastructure', strategicValue: 'Ports cannot be replicated by competitors. A functioning port is a permanent geographic advantage regardless of current utilisation rate', comparable: 'Newcastle (Australia) coal port pivoting to renewable energy component import; Rotterdam reinventing as circular economy hub', surfacing: 'Quantify port capacity vs current utilisation; identify emerging cargo opportunities; map port to new supply chains' },
  { trigger: /cultural|heritage|tradition|indigenous|ethnic/i, asset: 'Cultural identity as differentiation', category: 'cultural', strategicValue: 'Authentic cultural identity cannot be copied. It creates differentiation that generic SEZ development can never achieve', comparable: 'Bilbao used cultural investment (Guggenheim) to transform industrial city narrative; Nashville used music heritage for economic development', surfacing: 'Identify cultural assets with tourism/creative economy potential; develop heritage-based investment narrative; protect authentic identity in development planning' },
  { trigger: /military|base|defense|defence/i, asset: 'Military/defence infrastructure', category: 'infrastructure', strategicValue: 'Military infrastructure represents massive government investment in transport, communications, and utilities that can be converted to civilian economic use', comparable: 'Clark/Subic (Philippines) converted US military bases to PEZA zones; Bangalore defense establishments seeded aerospace cluster', surfacing: 'Audit military infrastructure for civilian conversion potential; map security clearance workforce to defence manufacturing opportunities' },
  { trigger: /agricultural|farming|agri|rural|fertile/i, asset: 'Agricultural land and food security', category: 'geographic', strategicValue: 'With global food security concerns rising, productive agricultural land and agritech potential are undervalued strategic assets', comparable: 'New Zealand built premium food brand globally; Netherlands became world\'s #2 food exporter through agritech innovation', surfacing: 'Map agricultural output to global supply chain gaps; identify agritech opportunities; develop food security value proposition for sovereign wealth investors' },
  { trigger: /renewable|solar|wind|geothermal|hydro/i, asset: 'Renewable energy generation potential', category: 'geographic', strategicValue: 'Clean energy generation capacity is increasingly a prerequisite for data centre, manufacturing, and tech investment attraction', comparable: 'Morocco used solar potential to attract manufacturing; Iceland leveraged geothermal for aluminium smelting and data centres', surfacing: 'Quantify renewable energy generation potential; map to energy-intensive industry requirements; develop green energy zone concept' },
  { trigger: /young\s*(population|people|workforce|demographic)/i, asset: 'Demographic dividend window', category: 'human', strategicValue: 'Young population creates 20-30 year window of high workforce growth and domestic consumption expansion - but the window closes', comparable: 'India, Philippines, Vietnam currently benefiting; Japan, Korea illustrate costs of missing the window', surfacing: 'Quantify demographic dividend timeline; project workforce availability by skill level; develop youth employment and training strategy' }
];

// ============================================================================
// REGIONAL IDENTITY DECODER
// ============================================================================

export class RegionalIdentityDecoder {

  /**
   * Decode a region's competitive identity - what's authentic, what's simulacrum.
   */
  static decode(input: UserInputSnapshot): IdentityReport {
    const allText = Object.values(input).join(' ');
    const allTextLower = allText.toLowerCase();

    const simulacrumSignals = this.detectSimulacrum(allText);
    const hiddenAssets = this.detectHiddenAssets(allTextLower);
    const identityElements = this.analyseIdentity(input, simulacrumSignals, hiddenAssets);
    const identityGaps = this.calculateGaps(identityElements);

    const simulacrumCount = simulacrumSignals.length;
    const simulacrumLevel = this.categoriseSimulacrumLevel(simulacrumCount, allText.length);

    const authenticDifferentiators = this.extractAuthenticDifferentiators(input, simulacrumSignals);
    const authenticity = this.calculateAuthenticity(simulacrumSignals, hiddenAssets, identityElements);

    const positioningRecommendation = this.generatePositioningAdvice(
      simulacrumLevel, authenticDifferentiators, hiddenAssets, input
    );

    return {
      overallAuthenticity: authenticity,
      simulacrumLevel,
      identityElements,
      simulacrumSignals,
      hiddenAssets,
      identityGaps,
      authenticDifferentiators,
      positioningRecommendation,
      timestamp: new Date().toISOString()
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SIMULACRUM DETECTION
  // ──────────────────────────────────────────────────────────────────────────

  private static detectSimulacrum(text: string): SimulacrumSignal[] {
    const signals: SimulacrumSignal[] = [];

    for (const gp of GENERIC_PHRASES) {
      const match = text.match(gp.pattern);
      if (match) {
        signals.push({
          signal: `Generic positioning language detected: "${match[0]}"`,
          genericPhrase: match[0],
          frequency: Math.round(gp.genericScore * 100),
          antidote: gp.alternatives[0]
        });
      }
    }

    // Detect aspiration mimicry
    const aspirationalNames = ['singapore', 'dubai', 'silicon valley', 'shenzhen', 'bangalore', 'estonia'];
    for (const name of aspirationalNames) {
      if (text.toLowerCase().includes(`like ${name}`) ||
          text.toLowerCase().includes(`next ${name}`) ||
          text.toLowerCase().includes(`${name} of`)) {
        signals.push({
          signal: `Aspirational mimicry: comparing self to ${name}`,
          genericPhrase: `"The next ${name}" or similar`,
          frequency: 85,
          antidote: `Instead of claiming to be "the next ${name}", identify what makes you uniquely valuable. ${name}'s success was specific to their context - yours will be too.`
        });
      }
    }

    return signals;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HIDDEN ASSET DETECTION
  // ──────────────────────────────────────────────────────────────────────────

  private static detectHiddenAssets(textLower: string): HiddenAsset[] {
    const assets: HiddenAsset[] = [];

    for (const pattern of HIDDEN_ASSET_PATTERNS) {
      if (pattern.trigger.test(textLower)) {
        // Check if the asset is mentioned casually (hidden) vs promoted (visible)
        const isCasual = !textLower.includes(`advantage`) &&
                         !textLower.includes(`strength`) &&
                         !textLower.includes(`competitive`);

        if (isCasual) {
          assets.push({
            asset: pattern.asset,
            category: pattern.category,
            strategicValue: pattern.strategicValue,
            comparableRegion: pattern.comparable,
            surfacingStrategy: pattern.surfacing
          });
        }
      }
    }

    return assets;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // IDENTITY ANALYSIS
  // ──────────────────────────────────────────────────────────────────────────

  private static analyseIdentity(
    input: UserInputSnapshot,
    simulacra: SimulacrumSignal[],
    hiddenAssets: HiddenAsset[]
  ): IdentityElement[] {
    const elements: IdentityElement[] = [];
    const allTextLower = Object.values(input).join(' ').toLowerCase();

    // Economic identity
    const hasEconomicClaims = allTextLower.includes('growth') || allTextLower.includes('gdp') || allTextLower.includes('economy');
    const economicSimulacra = simulacra.filter(s => s.genericPhrase.toLowerCase().includes('growing') || s.genericPhrase.toLowerCase().includes('competitive'));
    elements.push({
      dimension: 'Economic Positioning',
      statedIdentity: hasEconomicClaims ? 'Claims economic growth/competitiveness' : 'No strong economic positioning stated',
      revealedIdentity: economicSimulacra.length > 0 ? 'Generic economic claims that could apply to any developing region' : 'Economic positioning appears grounded in specifics',
      alignment: economicSimulacra.length > 1 ? 'simulacrum' : economicSimulacra.length === 1 ? 'oversold' : hasEconomicClaims ? 'authentic' : 'undersold',
      confidence: 0.7,
      explanation: economicSimulacra.length > 0 ? 'Economic claims use interchangeable language - replace with sector-specific, data-backed positioning' : 'Economic identity appears specific enough to differentiate'
    });

    // Workforce identity
    const hasWorkforceClaims = allTextLower.includes('workforce') || allTextLower.includes('talent') || allTextLower.includes('skilled');
    const workforceSimulacra = simulacra.filter(s => s.genericPhrase.toLowerCase().includes('skill') || s.genericPhrase.toLowerCase().includes('workforce'));
    elements.push({
      dimension: 'Workforce Positioning',
      statedIdentity: hasWorkforceClaims ? 'Claims skilled/talented workforce' : 'Workforce not positioned as advantage',
      revealedIdentity: workforceSimulacra.length > 0 ? 'Generic workforce claims without sector-specific evidence' : hasWorkforceClaims ? 'Workforce positioning appears specific' : 'Workforce may be an undersold advantage',
      alignment: workforceSimulacra.length > 0 ? 'simulacrum' : hasWorkforceClaims ? 'authentic' : 'undersold',
      confidence: 0.65,
      explanation: workforceSimulacra.length > 0 ? 'Every region claims a skilled workforce. Differentiate: how many? In what skills? With what certifications? At what cost?' : 'Workforce positioning needs specificity to be credible'
    });

    // Infrastructure identity
    const hasInfraClaims = allTextLower.includes('infrastructure') || allTextLower.includes('world-class') || allTextLower.includes('world class');
    const infraSimulacra = simulacra.filter(s => s.genericPhrase.toLowerCase().includes('world') || s.genericPhrase.toLowerCase().includes('infrastructure'));
    elements.push({
      dimension: 'Infrastructure Positioning',
      statedIdentity: hasInfraClaims ? 'Claims quality infrastructure' : 'Infrastructure not prominently positioned',
      revealedIdentity: infraSimulacra.length > 0 ? 'Infrastructure claims are generic and unquantified' : hasInfraClaims ? 'Infrastructure claims appear specific' : 'Infrastructure may need auditing for hidden strengths',
      alignment: infraSimulacra.length > 0 ? 'oversold' : hasInfraClaims ? 'authentic' : 'undersold',
      confidence: 0.6,
      explanation: 'Infrastructure claims must be benchmarked against competitors to be credible. Cite reliability metrics, capacity data, and specific advantages.'
    });

    // Location/geographic identity
    const hasLocationClaims = allTextLower.includes('strategic') || allTextLower.includes('gateway') || allTextLower.includes('hub');
    const locationSimulacra = simulacra.filter(s => s.genericPhrase.toLowerCase().includes('strategic') || s.genericPhrase.toLowerCase().includes('gateway') || s.genericPhrase.toLowerCase().includes('hub'));
    elements.push({
      dimension: 'Geographic Positioning',
      statedIdentity: hasLocationClaims ? 'Claims strategic location/gateway/hub status' : 'Geographic advantages not strongly positioned',
      revealedIdentity: locationSimulacra.length > 0 ? 'Location claims are the most overused in investment promotion globally' : 'Geographic positioning appears differentiated',
      alignment: locationSimulacra.length > 1 ? 'simulacrum' : locationSimulacra.length === 1 ? 'oversold' : hasLocationClaims ? 'authentic' : 'undersold',
      confidence: 0.8,
      explanation: locationSimulacra.length > 0 ? 'Replace "strategically located" with specific: "4hr flight to markets totalling $X GDP" or "only deepwater port between X and Y"' : 'Geographic positioning benefits from quantification even when authentic'
    });

    // Cultural/unique identity
    const hasCulturalIdentity = allTextLower.includes('cultur') || allTextLower.includes('heritage') || allTextLower.includes('unique') || allTextLower.includes('identity');
    const culturalAssets = hiddenAssets.filter(a => a.category === 'cultural');
    elements.push({
      dimension: 'Cultural Identity',
      statedIdentity: hasCulturalIdentity ? 'Cultural identity is part of the narrative' : 'Cultural identity absent from positioning',
      revealedIdentity: culturalAssets.length > 0 ? 'Cultural assets exist but are treated as background rather than competitive advantage' : 'Cultural identity needs development as differentiator',
      alignment: hasCulturalIdentity && culturalAssets.length === 0 ? 'authentic' : culturalAssets.length > 0 ? 'undersold' : 'undersold',
      confidence: 0.55,
      explanation: 'Cultural identity is the one thing competitors cannot copy. It is permanently unique. Yet most regions bury it behind generic economic positioning.'
    });

    return elements;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GAP CALCULATION
  // ──────────────────────────────────────────────────────────────────────────

  private static calculateGaps(elements: IdentityElement[]): IdentityGap[] {
    return elements.map(el => {
      let narrativeStrength = 50;
      let evidenceStrength = 50;

      switch (el.alignment) {
        case 'authentic':
          narrativeStrength = 70;
          evidenceStrength = 70;
          break;
        case 'oversold':
          narrativeStrength = 80;
          evidenceStrength = 40;
          break;
        case 'undersold':
          narrativeStrength = 30;
          evidenceStrength = 65;
          break;
        case 'simulacrum':
          narrativeStrength = 85;
          evidenceStrength = 20;
          break;
      }

      return {
        dimension: el.dimension,
        narrativeStrength,
        evidenceStrength,
        gap: narrativeStrength - evidenceStrength,
        recommendation: el.alignment === 'simulacrum'
          ? `REBUILD: ${el.dimension} narrative is generic. Strip back to provable facts and rebuild from authentic evidence.`
          : el.alignment === 'oversold'
            ? `RECALIBRATE: ${el.dimension} narrative exceeds evidence. Either strengthen evidence or moderate claims.`
            : el.alignment === 'undersold'
              ? `AMPLIFY: ${el.dimension} has untold advantages. Develop narrative around existing but unpromoted strengths.`
              : `MAINTAIN: ${el.dimension} narrative is aligned with evidence. Continue to update with fresh data.`
      };
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCORING
  // ──────────────────────────────────────────────────────────────────────────

  private static categoriseSimulacrumLevel(signalCount: number, textLength: number): IdentityReport['simulacrumLevel'] {
    const density = signalCount / Math.max(1, textLength / 500);

    if (density > 3) return 'complete';
    if (density > 2) return 'severe';
    if (density > 1) return 'moderate';
    if (density > 0.3) return 'mild';
    return 'none';
  }

  private static calculateAuthenticity(
    simulacra: SimulacrumSignal[],
    hiddenAssets: HiddenAsset[],
    elements: IdentityElement[]
  ): number {
    let score = 70; // Base - assume reasonable authenticity

    // Deduct for simulacrum signals
    score -= simulacra.length * 8;

    // Deduct for identity elements in simulacrum mode
    score -= elements.filter(e => e.alignment === 'simulacrum').length * 10;

    // Deduct for overselling
    score -= elements.filter(e => e.alignment === 'oversold').length * 5;

    // Add for hidden assets (region has more than it says)
    score += hiddenAssets.length * 5;

    // Add for authentic elements
    score += elements.filter(e => e.alignment === 'authentic').length * 5;

    return Math.min(95, Math.max(10, score));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AUTHENTIC DIFFERENTIATOR EXTRACTION
  // ──────────────────────────────────────────────────────────────────────────

  private static extractAuthenticDifferentiators(
    input: UserInputSnapshot,
    simulacra: SimulacrumSignal[]
  ): string[] {
    const allText = Object.values(input).join(' ');
    const genericParts = simulacra.map(s => s.genericPhrase.toLowerCase());

    // Find specific claims that are NOT generic
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const authenticSentences = sentences.filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      // Not generic
      const isGeneric = genericParts.some(gp => sentenceLower.includes(gp.toLowerCase()));
      if (isGeneric) return false;

      // Contains specifics (numbers, names, data)
      const hasSpecifics = /\d+/.test(sentence) ||
                          /[A-Z][a-z]+\s+[A-Z]/.test(sentence); // Proper nouns

      return hasSpecifics;
    });

    return authenticSentences.slice(0, 5).map(s => s.trim());
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POSITIONING RECOMMENDATION
  // ──────────────────────────────────────────────────────────────────────────

  private static generatePositioningAdvice(
    level: IdentityReport['simulacrumLevel'],
    authenticDifferentiators: string[],
    hiddenAssets: HiddenAsset[],
    input: UserInputSnapshot
  ): string {
    const region = input.region || 'This region';

    switch (level) {
      case 'complete':
        return `${region}'s competitive identity has been entirely replaced by generic investment promotion language. ` +
          `The current narrative could describe any of 200+ competing locations globally. ` +
          `RECOMMENDATION: Complete narrative reset. Strip all positioning back to provable, unique facts. ` +
          `Start with: What does ${region} have that no competitor can replicate? ` +
          (hiddenAssets.length > 0 ? `Hidden assets identified: ${hiddenAssets.map(a => a.asset).join(', ')}. Build from these.` : '');

      case 'severe':
        return `${region}'s narrative is heavily generic with few differentiating elements. ` +
          `Investors hearing this pitch will have heard near-identical claims from multiple other locations. ` +
          `RECOMMENDATION: Preserve the ${authenticDifferentiators.length} authentic elements and rebuild the rest around specific, quantified, unique advantages. ` +
          (hiddenAssets.length > 0 ? `Underutilised assets: ${hiddenAssets.map(a => a.asset).join(', ')}.` : '');

      case 'moderate':
        return `${region} has a mixed identity - some authentic positioning alongside generic language. ` +
          `RECOMMENDATION: Strengthen the authentic elements (${authenticDifferentiators.length} identified) and replace remaining generic phrases with specific evidence. ` +
          `The goal: every claim in your investment narrative should be uniquely true of ${region} and no other location.`;

      case 'mild':
        return `${region}'s identity is largely authentic with minor generic elements. ` +
          `RECOMMENDATION: Replace remaining generic phrases with quantified specifics. ` +
          (hiddenAssets.length > 0 ? `Consider surfacing hidden assets: ${hiddenAssets.map(a => a.asset).join(', ')}.` : '') +
          ` Continue to develop the unique narrative.`;

      case 'none':
        return `${region} presents an authentic competitive identity without significant generic language. ` +
          `RECOMMENDATION: Maintain authenticity. Regularly update with fresh data and evidence. ` +
          (hiddenAssets.length > 0 ? `Additional underutilised assets could further strengthen the narrative: ${hiddenAssets.map(a => a.asset).join(', ')}.` : '');
    }
  }
}

export default RegionalIdentityDecoder;
