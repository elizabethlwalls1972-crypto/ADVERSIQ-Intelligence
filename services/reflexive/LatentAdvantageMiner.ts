/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LATENT ADVANTAGE MINER - Reflexive Intelligence Layer (Layer 9)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Theory: "Junk DNA" Concept + Hidden Asset Theory +
 *         Porter's Diamond (under-recognised factor conditions)
 *
 * The Biology Metaphor:
 *   For decades, geneticists dismissed 98% of DNA as "junk" because they
 *   couldn't see its function. Then they discovered it regulated everything.
 *   The "junk DNA" was the most important part.
 *
 * The Regional Economics Parallel:
 *   When a region describes itself, it leads with what it thinks investors
 *   want: tax rates, labour costs, industrial zones. But buried in the
 *   description are casual mentions of assets that are - historically and
 *   globally - among the most powerful investment attractors:
 *
 *   "We have a small port" → Ports cannot be replicated. Ever.
 *   "There's a university nearby" → University anchors persist through cycles.
 *   "Many of our people work overseas" → Diaspora = investment channel.
 *   "We have nice beaches" → Lifestyle = tech talent magnet.
 *   "It rains a lot" → Hydroelectric potential.
 *   "We're near the border" → Cross-border economic zone potential.
 *
 * This engine scans every input field for casually mentioned assets that
 * the user doesn't realise are strategically significant, cross-references
 * against a library of historical cases where those assets created
 * transformative value, and surfaces them with evidence.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { UserInputSnapshot } from './UserSignalDecoder';

// ============================================================================
// TYPES
// ============================================================================

export interface LatentAdvantage {
  asset: string;                  // What the user casually mentioned
  userPhrasing: string;           // How they mentioned it
  inputField: string;             // Which field they mentioned it in
  strategicCategory: StrategicCategory;
  historicalValue: string;        // Why this matters historically
  currentMarketValue: string;     // Why this matters now
  globalPrecedents: Precedent[];  // Where this created transformative value
  exploitationStrategy: string;   // How to leverage this
  urgency: 'immediate' | 'medium-term' | 'long-term';
  confidenceScore: number;        // 0-1
}

export type StrategicCategory =
  | 'geographic-permanent'     // Cannot be replicated (port, border, climate)
  | 'infrastructure-legacy'    // Built investment that persists (rail, military base)
  | 'human-capital'            // People advantages (diaspora, education, language)
  | 'institutional-anchor'     // Institutions that persist (university, hospital)
  | 'cultural-unique'          // Non-replicable cultural assets
  | 'resource-natural'         // Natural resource endowments
  | 'network-position'         // Position in trade/supply chain networks
  | 'timing-window';           // Temporary but critical advantages

export interface Precedent {
  region: string;
  country: string;
  asset: string;
  outcome: string;
  timePeriod: string;
  scaleOfImpact: string;
}

export interface AssetBlindSpot {
  category: StrategicCategory;
  question: string;              // Question to ask the user
  whyItMatters: string;
  ifYes: string;                 // What it means if they have this
}

export interface LatentAdvantageReport {
  advantagesFound: number;
  totalStrategicValue: 'transformative' | 'significant' | 'moderate' | 'incremental';
  latentAdvantages: LatentAdvantage[];
  blindSpotQuestions: AssetBlindSpot[];
  junkDNARatio: number;           // % of user's input that is actually strategically significant
  narrativeGap: string;           // Summary of what user is underselling
  timestamp: string;
}

// ============================================================================
// ASSET DETECTION PATTERNS
// ============================================================================

interface AssetPattern {
  triggers: RegExp[];
  assetName: string;
  category: StrategicCategory;
  historicalValue: string;
  currentValue: string;
  precedents: Precedent[];
  strategy: string;
  urgency: LatentAdvantage['urgency'];
}

const ASSET_PATTERNS: AssetPattern[] = [
  {
    triggers: [/\bport\b/i, /\bharbou?r\b/i, /\bshipping\b/i, /\bdock\b/i, /\bwharf\b/i, /\bmaritime\b/i],
    assetName: 'Deep/Medium Port Access',
    category: 'geographic-permanent',
    historicalValue: 'Ports have been the single most consistent predictor of long-term regional prosperity for 3,000 years. Every major global economic centre was built around a port.',
    currentValue: 'With global supply chain restructuring (China+1, nearshoring), port access is MORE valuable than any point in the last 30 years. New manufacturing needs new logistics routes.',
    precedents: [
      { region: 'Rotterdam', country: 'Netherlands', asset: 'Port', outcome: 'Positioned as Europe\'s logistics hub - expanded from shipping to circular economy, data, and energy', timePeriod: '1950-present', scaleOfImpact: 'National economic anchor' },
      { region: 'Tanjung Pelepas', country: 'Malaysia', asset: 'New port development', outcome: 'Attracted Maersk away from Singapore - creating entire new economic zone', timePeriod: '2000-2020', scaleOfImpact: 'Regional economic transformation' },
      { region: 'Subic Bay', country: 'Philippines', asset: 'Former naval port', outcome: 'Converted to freeport zone - now major logistics and ship repair hub', timePeriod: '1992-present', scaleOfImpact: 'Provincial economic anchor' }
    ],
    strategy: 'Audit current port capacity vs utilisation. Identify emerging cargo opportunities (EV components, renewable energy equipment, critical minerals). Position as alternative logistics route for supply chain diversification.',
    urgency: 'immediate'
  },
  {
    triggers: [/\buniversit(y|ies)\b/i, /\bcollege\b/i, /\bacadem(y|ic|ia)\b/i, /\bresearch\s*(centre|center|institute)\b/i],
    assetName: 'University/Research Anchor',
    category: 'institutional-anchor',
    historicalValue: 'Universities are the most reliable anchor institutions in economic development. They persist through recessions, political changes, and industry shifts. No major tech cluster exists without a university anchor.',
    currentValue: 'University R&D + talent pipeline is now table-stakes for knowledge economy investment. Investors increasingly locate near research capabilities rather than near cheap labour.',
    precedents: [
      { region: 'Pittsburgh', country: 'USA', asset: 'Carnegie Mellon + Univ of Pittsburgh', outcome: 'Post-steel transformation to robotics, AI, healthcare - CMU research created multi-billion dollar ecosystem', timePeriod: '1980-present', scaleOfImpact: 'Complete economic reinvention' },
      { region: 'Penang', country: 'Malaysia', asset: 'USM + regional colleges', outcome: 'University-industry collaboration created semiconductor talent pipeline - key to retaining Intel, Dell, etc.', timePeriod: '1990-present', scaleOfImpact: 'Industry cluster sustainability' },
      { region: 'Lund/Malmö', country: 'Sweden', asset: 'Lund University', outcome: 'MAX IV laboratory and ESS attracted global research investment to southern Sweden', timePeriod: '2000-present', scaleOfImpact: 'International science hub' }
    ],
    strategy: 'Map university research strengths to investor sector needs. Create industry-university partnership programme with co-investment model. Develop talent pipeline metrics (graduates per year by discipline). Position university as anchor for cluster development.',
    urgency: 'immediate'
  },
  {
    triggers: [/\bdiaspora\b/i, /\boverseas\s*(workers?|communit|population|filipino|nationals?)\b/i, /\bofw\b/i, /\bremittance/i, /\bmigrant\s*workers?\b/i],
    assetName: 'Diaspora Investment Channel',
    category: 'human-capital',
    historicalValue: 'The 3I model (Ireland, Israel, India) demonstrates that diaspora networks create investment channels, knowledge transfer, and market access that no government agency can replicate.',
    currentValue: 'With remote work normalised, diaspora members can now contribute knowledge and connections without physically returning. Digital diaspora engagement is an untapped investment channel for most developing regions.',
    precedents: [
      { region: 'Ireland', country: 'Ireland', asset: 'Irish-American diaspora', outcome: 'Diaspora networks facilitated US tech company entry. Cultural affinity + tax policy created Celtic Tiger.', timePeriod: '1990-2008', scaleOfImpact: 'National economic transformation' },
      { region: 'Bangalore', country: 'India', asset: 'Indian IT diaspora in Silicon Valley', outcome: 'Returnees and diaspora connections created $200B+ IT industry. Knowledge transfer + VC connections.', timePeriod: '1990-present', scaleOfImpact: 'Global industry creation' },
      { region: 'Israel', country: 'Israel', asset: 'Global Jewish diaspora', outcome: 'Diaspora investment + military tech transfer created "Startup Nation" - most startups per capita globally', timePeriod: '1990-present', scaleOfImpact: 'National innovation ecosystem' }
    ],
    strategy: 'Map diaspora concentrations by country and sector expertise. Create diaspora investment incentive programme. Establish knowledge transfer fellowships. Build digital engagement platform for diaspora entrepreneur networks.',
    urgency: 'medium-term'
  },
  {
    triggers: [/\bborder\b/i, /\bcross.?border\b/i, /\bfrontier\b/i, /\bneighbou?ring\s*countr/i],
    assetName: 'Cross-Border Economic Zone Potential',
    category: 'network-position',
    historicalValue: 'Border regions that integrate economically with neighbouring countries create arbitrage advantages (cost, regulation, market access) that interior regions cannot access.',
    currentValue: 'Regional trade agreements (RCEP, AfCFTA, USMCA) are making cross-border economic zones more viable than ever. Border regions are positioned to capture new trade flows.',
    precedents: [
      { region: 'Johor', country: 'Malaysia', asset: 'Singapore border', outcome: 'Iskandar Development Region captures Singapore spillover - $20B+ cumulative investment', timePeriod: '2006-present', scaleOfImpact: 'State-level economic transformation' },
      { region: 'Tijuana', country: 'Mexico', asset: 'US-Mexico border', outcome: 'Twin-plant (maquiladora) model created manufacturing powerhouse serving US market', timePeriod: '1970-present', scaleOfImpact: 'Binational manufacturing hub' },
      { region: 'Shenzhen', country: 'China', asset: 'Hong Kong border', outcome: 'Proximity to Hong Kong\'s capital and expertise + China\'s labour = fastest economic transformation in history', timePeriod: '1980-2020', scaleOfImpact: 'Global economic significance' }
    ],
    strategy: 'Map cost/regulatory arbitrage vs neighbour. Identify industries that benefit from border straddling. Propose cross-border economic zone framework to both governments. Target investors seeking dual-market access.',
    urgency: 'medium-term'
  },
  {
    triggers: [/\bbeach\b/i, /\bcoast\b/i, /\blifestyle\b/i, /\btouris[mt]\b/i, /\bnatural\s*beauty\b/i, /\bscenic\b/i, /\bresort\b/i],
    assetName: 'Lifestyle-Driven Talent Attraction',
    category: 'geographic-permanent',
    historicalValue: 'Since 2015, lifestyle factors have increasingly driven investment location decisions - particularly in tech and creative industries where talent is mobile and chooses where to live.',
    currentValue: 'Post-COVID remote work has accelerated this trend. Tech companies now locate where talent wants to live, not where costs are lowest. Lifestyle is an investment attractor.',
    precedents: [
      { region: 'Lisbon', country: 'Portugal', asset: 'Lifestyle + cost', outcome: 'Became Europe\'s startup capital - lifestyle attracted mobile tech talent from London, Berlin, Paris', timePeriod: '2015-present', scaleOfImpact: 'National tech ecosystem creation' },
      { region: 'Byron Bay', country: 'Australia', asset: 'Lifestyle', outcome: 'Attracted tech companies and remote workers despite zero infrastructure investment - pure lifestyle pull', timePeriod: '2018-present', scaleOfImpact: 'Local economic diversification' },
      { region: 'Da Nang', country: 'Vietnam', asset: 'Beach + low cost', outcome: 'Attracting IT companies and digital nomads - becoming Vietnam\'s lifestyle tech hub', timePeriod: '2018-present', scaleOfImpact: 'Emerging tech cluster' }
    ],
    strategy: 'Position lifestyle as talent attraction strategy (not tourism). Create digital nomad visa or remote worker programme. Develop co-working infrastructure near lifestyle assets. Market to tech companies seeking lifestyle-driven talent retention.',
    urgency: 'medium-term'
  },
  {
    triggers: [/\brail\b/i, /\btrain\b/i, /\brailway\b/i, /\brailroad\b/i, /\btransit\b/i, /\bmetro\s*line\b/i],
    assetName: 'Rail Corridor Access',
    category: 'infrastructure-legacy',
    historicalValue: 'Rail infrastructure represents billions in sunk investment. Rail corridors create permanent connectivity advantages. In the age of container shipping, rail connectivity to ports multiplies economic impact.',
    currentValue: 'Green logistics drive is reviving rail. EU, China (Belt and Road), and US (infrastructure bill) are all investing in rail. Regions on rail corridors benefit from investment they didn\'t pay for.',
    precedents: [
      { region: 'Duisburg', country: 'Germany', asset: 'Rhine-Ruhr rail hub', outcome: 'Became western terminus of China-Europe rail freight - attracting Chinese logistics investment', timePeriod: '2014-present', scaleOfImpact: 'International logistics hub creation' },
      { region: 'Kansas City', country: 'USA', asset: 'Rail crossroads', outcome: 'Four Class I railroads converge - creating "logistics capital" positioning', timePeriod: '1990-present', scaleOfImpact: 'National logistics significance' }
    ],
    strategy: 'Map rail connectivity to ports and markets. Identify intermodal opportunities (rail-port, rail-road). Position for green logistics companies seeking rail-based supply chains. Develop rail-proximate industrial sites.',
    urgency: 'long-term'
  },
  {
    triggers: [/\bmilitary\b/i, /\bbase\b/i, /\bdefens?ce\b/i, /\barmy\b/i, /\bnavy\b/i, /\bair\s*force\b/i],
    assetName: 'Military/Defence Infrastructure',
    category: 'infrastructure-legacy',
    historicalValue: 'Military bases represent the largest government infrastructure investments ever made in most regions - runways, ports, utilities, communications, housing - all transferable to civilian economic use.',
    currentValue: 'Defence spending is increasing globally. Defence supply chains are reshoring. Regions with military infrastructure have pre-built advantages for defence manufacturing and dual-use technology.',
    precedents: [
      { region: 'Clark/Subic', country: 'Philippines', asset: 'Former US bases', outcome: 'Converted to freeport zones - $10B+ cumulative investment. Runway, port, and utilities already built.', timePeriod: '1992-present', scaleOfImpact: 'Provincial economic transformation' },
      { region: 'San Diego', country: 'USA', asset: 'Navy base', outcome: 'Military R&D seeded biotech, telecommunications, and defense tech clusters', timePeriod: '1950-present', scaleOfImpact: 'Metropolitan economic identity' }
    ],
    strategy: 'Audit military infrastructure for civilian conversion potential. Map security-cleared workforce to defence manufacturing needs. Develop dual-use technology park near military facilities. Target defence supply chain investors.',
    urgency: 'immediate'
  },
  {
    triggers: [/\bsolar\b/i, /\bwind\b/i, /\bgeothermal\b/i, /\bhydro\b/i, /\brenewable\b/i, /\bgreen\s*energy\b/i, /\btidal\b/i],
    assetName: 'Renewable Energy Generation Potential',
    category: 'resource-natural',
    historicalValue: 'Energy abundance has always determined industrial location. The shift from fossil to renewable doesn\'t change this - it just changes which regions have the advantage.',
    currentValue: 'Clean energy access is now a prerequisite for data centre, manufacturing, and tech investment. Investors increasingly require renewable energy sourcing. Regions with generation potential have permanent advantage.',
    precedents: [
      { region: 'Morocco', country: 'Morocco', asset: 'Solar irradiation', outcome: 'Noor solar complex attracted automotive manufacturing investment - manufacturers wanted green supply chain', timePeriod: '2016-present', scaleOfImpact: 'National industrial strategy transformation' },
      { region: 'Iceland', country: 'Iceland', asset: 'Geothermal', outcome: 'Cheap geothermal energy attracted aluminium smelting and now data centre investment', timePeriod: '1960-present', scaleOfImpact: 'National economic pillar' },
      { region: 'South Australia', country: 'Australia', asset: 'Wind + solar', outcome: 'Became Australia\'s renewable energy leader - attracting green hydrogen and battery manufacturing', timePeriod: '2015-present', scaleOfImpact: 'State economic reshaping' }
    ],
    strategy: 'Quantify renewable energy generation potential (solar irradiation, wind speed, geothermal, hydro). Map to energy-intensive industry requirements. Develop green energy zone concept. Target ESG-mandated investors.',
    urgency: 'immediate'
  },
  {
    triggers: [/\byoung\s*(population|people|workforce|demographic)\b/i, /\byouth\b/i, /\bdemographic\s*(dividend|bonus)\b/i, /\bmedian\s*age\b/i],
    assetName: 'Demographic Dividend Window',
    category: 'timing-window',
    historicalValue: 'Every Asian economic miracle (Japan, Korea, China, Vietnam) rode a demographic dividend - 20-30 year window when workforce-age population peaks relative to dependents.',
    currentValue: 'One-third of the world\'s nations have already passed through their demographic dividend window. Those still in it have a diminishing, non-renewable advantage. Every year counts.',
    precedents: [
      { region: 'Vietnam', country: 'Vietnam', asset: 'Young population', outcome: 'Median age 30 - driving manufacturing boom as China ages. Window closes ~2040.', timePeriod: '2010-2040', scaleOfImpact: 'National economic trajectory' },
      { region: 'Philippines', country: 'Philippines', asset: 'Young English-speaking population', outcome: 'BPO industry grew from $0 to $30B+ in 20 years - powered by young, English-speaking workforce', timePeriod: '2000-2023', scaleOfImpact: 'National employment pillar' }
    ],
    strategy: 'Quantify demographic dividend timeline - when does the window peak and close? Develop workforce pipeline strategies aligned to high-value sectors. Market the demographic advantage specifically against aging competitor regions.',
    urgency: 'immediate'
  },
  {
    triggers: [/\btrade\s*(agreement|deal|pact|accord)\b/i, /\bfree\s*trade\b/i, /\brcep\b/i, /\bafcfta\b/i, /\busmca\b/i, /\bbilateral\b/i],
    assetName: 'Trade Agreement Network Position',
    category: 'network-position',
    historicalValue: 'Regions positioned at the intersection of multiple trade agreements capture preferential access to multiple markets simultaneously - a compounding advantage.',
    currentValue: 'With RCEP, AfCFTA, and supply chain restructuring, trade agreement positioning is creating new winners and losers. Regions that understand their network position can market it.',
    precedents: [
      { region: 'Vietnam', country: 'Vietnam', asset: 'RCEP + EU FTA + CPTPP', outcome: 'Triple trade agreement coverage makes Vietnam uniquely positioned for export manufacturing', timePeriod: '2020-present', scaleOfImpact: 'National FDI magnet' },
      { region: 'Morocco', country: 'Morocco', asset: 'EU + Africa FTAs', outcome: 'Bridge between EU and African markets - attracting manufacturing for dual-market access', timePeriod: '2010-present', scaleOfImpact: 'Continental gateway positioning' }
    ],
    strategy: 'Map all trade agreements your country is party to. Identify tariff advantages vs competitor locations for key products. Create investor-ready trade agreement guide showing effective market access. Position as multi-market gateway.',
    urgency: 'immediate'
  }
];

// ============================================================================
// BLIND SPOT QUESTIONS - Asset Categories Users Rarely Mention
// ============================================================================

const BLIND_SPOT_QUESTIONS: AssetBlindSpot[] = [
  { category: 'geographic-permanent', question: 'Does your region have a functioning port or deepwater harbour, even if currently underutilised?', whyItMatters: 'Ports are the most permanent competitive advantage any region can have - they cannot be replicated elsewhere', ifYes: 'This is likely your strongest long-term asset. Even if currently underutilised, port access should be central to your investment narrative.' },
  { category: 'human-capital', question: 'Is there a significant diaspora from your region living and working in developed economies?', whyItMatters: 'Diaspora networks have created more successful investment channels than any government programme in history', ifYes: 'Your diaspora is a multi-billion dollar untapped investment and knowledge transfer channel. Ireland, Israel, and India all built their economic miracles on diaspora connections.' },
  { category: 'institutional-anchor', question: 'Are there universities or research institutions in your region, even if not globally ranked?', whyItMatters: 'Universities persist through economic cycles and create the one thing investors value most: reliable talent pipeline', ifYes: 'Even a modest university can become an industry anchor with the right partnership model. Carnegie Mellon was a small technical school before Pittsburgh reinvented itself around it.' },
  { category: 'network-position', question: 'Is your region on or near any international trade corridor, shipping lane, or planned infrastructure project?', whyItMatters: 'Network position creates passive economic advantage - investment flows through corridor nodes regardless of active attraction efforts', ifYes: 'Map your position on the corridor and identify which industries benefit from that connectivity. Corridor nodes attract logistics, manufacturing, and services investment.' },
  { category: 'cultural-unique', question: 'Does your region have unique cultural heritage, cuisine, artistic traditions, or historical significance?', whyItMatters: 'Cultural identity is the only competitive advantage that literally cannot be copied by any other location', ifYes: 'This asset is permanently yours. No competitor can replicate authentic cultural heritage. Use it for differentiation, tourism, creative economy, and brand identity.' },
  { category: 'resource-natural', question: 'Does your region have significant solar, wind, geothermal, or hydroelectric potential - even if currently undeveloped?', whyItMatters: 'Clean energy generation potential is rapidly becoming a prerequisite for investment attraction, not just a bonus', ifYes: 'With data centres, manufacturing, and tech companies increasingly requiring renewable energy sourcing, your generation potential is a permanent competitive advantage.' },
  { category: 'timing-window', question: 'Is your region\'s population younger on average than your competitors, with growing working-age cohorts?', whyItMatters: 'The demographic dividend is a 20-30 year window that closes permanently. Every Asian economic miracle rode this wave.', ifYes: 'This is an urgent, non-renewable advantage. Every year of the demographic dividend that passes without industrialisation is permanently lost.' }
];

// ============================================================================
// LATENT ADVANTAGE MINER
// ============================================================================

export class LatentAdvantageMiner {

  /**
   * Mine user inputs for strategically significant assets they mentioned
   * casually, without realising their importance.
   */
  static mine(input: UserInputSnapshot): LatentAdvantageReport {
    const advantages = this.detectAdvantages(input);
    const blindSpots = this.identifyBlindSpots(input, advantages);
    const junkDNARatio = this.calculateJunkDNARatio(input, advantages);
    const totalValue = this.assessTotalValue(advantages);
    const narrativeGap = this.generateNarrativeGap(advantages, blindSpots, input);

    return {
      advantagesFound: advantages.length,
      totalStrategicValue: totalValue,
      latentAdvantages: advantages,
      blindSpotQuestions: blindSpots,
      junkDNARatio,
      narrativeGap,
      timestamp: new Date().toISOString()
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ADVANTAGE DETECTION
  // ──────────────────────────────────────────────────────────────────────────

  private static detectAdvantages(input: UserInputSnapshot): LatentAdvantage[] {
    const advantages: LatentAdvantage[] = [];

    for (const [field, value] of Object.entries(input)) {
      if (!value || typeof value !== 'string') continue;
      const text = value.toLowerCase();

      for (const pattern of ASSET_PATTERNS) {
        for (const trigger of pattern.triggers) {
          const match = text.match(trigger);
          if (match) {
            // Check if this is a casual mention (latent) vs. promoted mention
            const isCasual = this.isCasualMention(value, match[0]);

            if (isCasual) {
              // Avoid duplicates
              if (advantages.some(a => a.asset === pattern.assetName)) continue;

              advantages.push({
                asset: pattern.assetName,
                userPhrasing: this.extractContext(value, match.index || 0, 80),
                inputField: field,
                strategicCategory: pattern.category,
                historicalValue: pattern.historicalValue,
                currentMarketValue: pattern.currentValue,
                globalPrecedents: pattern.precedents,
                exploitationStrategy: pattern.strategy,
                urgency: pattern.urgency,
                confidenceScore: isCasual ? 0.8 : 0.5
              });
            }
            break; // One match per pattern per field
          }
        }
      }
    }

    return advantages.sort((a, b) => {
      // Sort by urgency then confidence
      const urgencyOrder: Record<string, number> = { 'immediate': 3, 'medium-term': 2, 'long-term': 1 };
      const urgDiff = (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
      if (urgDiff !== 0) return urgDiff;
      return b.confidenceScore - a.confidenceScore;
    });
  }

  private static isCasualMention(text: string, matchedWord: string): boolean {
    const lowerText = text.toLowerCase();
    const idx = lowerText.indexOf(matchedWord.toLowerCase());
    if (idx < 0) return true;

    // Check if surrounding context suggests promotion vs. casual mention
    const surroundingStart = Math.max(0, idx - 50);
    const surroundingEnd = Math.min(text.length, idx + matchedWord.length + 50);
    const surrounding = lowerText.slice(surroundingStart, surroundingEnd);

    const promotionalIndicators = [
      'advantage', 'strength', 'competitive', 'world-class', 'leading',
      'premier', 'outstanding', 'exceptional', 'superior', 'key selling'
    ];

    // If none of the promotional indicators are nearby, it's casual
    return !promotionalIndicators.some(ind => surrounding.includes(ind));
  }

  private static extractContext(text: string, matchIndex: number, radius: number): string {
    const start = Math.max(0, matchIndex - radius);
    const end = Math.min(text.length, matchIndex + radius);
    let snippet = text.slice(start, end).trim();
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    return snippet;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BLIND SPOT IDENTIFICATION
  // ──────────────────────────────────────────────────────────────────────────

  private static identifyBlindSpots(
    input: UserInputSnapshot,
    foundAdvantages: LatentAdvantage[]
  ): AssetBlindSpot[] {
    const allText = Object.values(input).join(' ').toLowerCase();
    const foundCategories = new Set(foundAdvantages.map(a => a.strategicCategory));

    return BLIND_SPOT_QUESTIONS.filter(q => {
      // Don't ask about categories where we already found advantages
      if (foundCategories.has(q.category)) return false;

      // Don't ask if there's clear evidence in the text
      switch (q.category) {
        case 'geographic-permanent':
          return !allText.includes('port') && !allText.includes('harbour');
        case 'human-capital':
          return !allText.includes('diaspora') && !allText.includes('overseas');
        case 'institutional-anchor':
          return !allText.includes('university') && !allText.includes('college');
        case 'network-position':
          return !allText.includes('corridor') && !allText.includes('border');
        case 'cultural-unique':
          return !allText.includes('cultural') && !allText.includes('heritage');
        case 'resource-natural':
          return !allText.includes('renewable') && !allText.includes('solar') && !allText.includes('wind');
        case 'timing-window':
          return !allText.includes('young') && !allText.includes('demographic');
        default:
          return true;
      }
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SCORING
  // ──────────────────────────────────────────────────────────────────────────

  private static calculateJunkDNARatio(
    input: UserInputSnapshot,
    advantages: LatentAdvantage[]
  ): number {
    if (advantages.length === 0) return 0;

    const allText = Object.values(input).join(' ');
    const totalWords = allText.split(/\s+/).length;

    // Count words in casual context around discovered advantages
    let significantWords = 0;
    for (const adv of advantages) {
      significantWords += adv.userPhrasing.split(/\s+/).length;
    }

    // Ratio of "important stuff mentioned casually" to total input
    return Math.min(1, significantWords / Math.max(1, totalWords));
  }

  private static assessTotalValue(
    advantages: LatentAdvantage[]
  ): LatentAdvantageReport['totalStrategicValue'] {
    if (advantages.length === 0) return 'incremental';

    const permanentAdvantages = advantages.filter(a =>
      a.strategicCategory === 'geographic-permanent' ||
      a.strategicCategory === 'infrastructure-legacy'
    ).length;

    const immediateAdvantages = advantages.filter(a => a.urgency === 'immediate').length;

    if (permanentAdvantages >= 2 || advantages.length >= 4) return 'transformative';
    if (permanentAdvantages >= 1 || immediateAdvantages >= 2) return 'significant';
    if (advantages.length >= 2) return 'moderate';
    return 'incremental';
  }

  private static generateNarrativeGap(
    advantages: LatentAdvantage[],
    blindSpots: AssetBlindSpot[],
    input: UserInputSnapshot
  ): string {
    const region = input.region || 'This region';

    if (advantages.length === 0 && blindSpots.length === 0) {
      return `${region}'s inputs don't contain obvious hidden assets. ` +
        `This may mean the region's narrative is already complete, or it may mean ` +
        `the submission needs more detail in contextual fields (geography, demographics, ` +
        `infrastructure) where hidden assets typically appear.`;
    }

    const permanentAssets = advantages.filter(a => a.strategicCategory === 'geographic-permanent');
    const humanAssets = advantages.filter(a => a.strategicCategory === 'human-capital');
    const immediateAssets = advantages.filter(a => a.urgency === 'immediate');

    let gap = `${region} is underselling ${advantages.length} strategically significant asset${advantages.length > 1 ? 's' : ''}. `;

    if (permanentAssets.length > 0) {
      gap += `Most critically: ${permanentAssets.map(a => a.asset).join(', ')} ` +
        `- permanent geographic advantages that no competitor can replicate. `;
    }
    if (humanAssets.length > 0) {
      gap += `Human capital advantages (${humanAssets.map(a => a.asset).join(', ')}) are mentioned casually but deserve central narrative positioning. `;
    }
    if (immediateAssets.length > 0) {
      gap += `${immediateAssets.length} advantage${immediateAssets.length > 1 ? 's require' : ' requires'} immediate attention - market conditions make these ` +
        `more valuable now than at any prior point. `;
    }
    if (blindSpots.length > 0) {
      gap += `Additionally, ${blindSpots.length} strategic asset categor${blindSpots.length > 1 ? 'ies were' : 'y was'} not mentioned at all - the system ` +
        `will ask about these to ensure no critical advantages are overlooked.`;
    }

    return gap;
  }
}

export default LatentAdvantageMiner;
