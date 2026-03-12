/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INVESTMENT LIFECYCLE MAPPER - Reflexive Intelligence Layer (Layer 9)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Theory: Product Lifecycle Theory (Vernon, 1966) + Kondratieff Long Waves +
 *         Schumpeterian Creative Destruction applied to regional investment
 *
 * Every region goes through investment cycles:
 *   Emergence → Boom → Peak → Decline → Dormancy → Reactivation
 *
 * The critical insight: what worked during the BOOM phase can be RECYCLED
 * during the reactivation phase - but only if someone maps what those
 * success factors were. Governments forget. Institutional memory decays.
 * This engine preserves it.
 *
 * This is the "recycling the past" engine. It:
 *   1. Models the investment lifecycle curve for a region
 *   2. Identifies which phase the region currently occupies
 *   3. Maps what worked during the boom (the recyclable DNA)
 *   4. Suggests reactivation strategies based on historical phase patterns
 *   5. Identifies similar regions at different lifecycle stages for learning
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// TYPES
// ============================================================================

export type LifecyclePhase = 'emergence' | 'growth' | 'boom' | 'peak' | 'plateau' | 'decline' | 'dormancy' | 'reactivation';

export interface LifecycleIndicator {
  dimension: string;
  signal: string;
  weight: number;
  phaseImplication: LifecyclePhase;
}

export interface RecyclableAsset {
  asset: string;
  originalContext: string;     // When/how it was valuable
  currentState: string;         // What condition it's in now
  reactivationPotential: number; // 0-1
  recyclingStrategy: string;    // How to reuse it
  historicalPrecedent: string;  // Where this recycling has worked before
}

export interface PhaseTransitionInsight {
  currentPhase: LifecyclePhase;
  nextLikelyPhase: LifecyclePhase;
  transitionProbability: number;
  timeHorizonYears: number;
  catalysts: string[];
  blockers: string[];
  historicalBenchmark: string;
}

export interface SimilarRegionMatch {
  regionName: string;
  country: string;
  lifecyclePhase: LifecyclePhase;
  similarityScore: number;     // 0-1
  whatTheyDid: string;
  lessonsTransferable: string[];
  timeOffset: string;          // e.g., "10 years ahead" or "5 years behind"
}

export interface LifecycleContext {
  region: string;
  country: string;
  sector: string;
  currentFDITrend: 'rising' | 'flat' | 'declining' | 'unknown';
  yearsOfFDIData: number;
  hasHistoricalInvestment: boolean;
  previousPeakSector: string;
  populationTrend: 'growing' | 'stable' | 'declining';
  infrastructureAge: 'new' | 'developing' | 'mature' | 'aging';
  governmentPriority: 'high' | 'medium' | 'low';
  existingAssets: string[];
}

export interface LifecycleReport {
  currentPhase: LifecyclePhase;
  phaseConfidence: number;       // 0-100
  phaseRationale: string;
  recyclableAssets: RecyclableAsset[];
  phaseTransition: PhaseTransitionInsight;
  similarRegions: SimilarRegionMatch[];
  reactivationPlaybook: string[];  // Ordered steps for reactivation
  cycleDuration: { typical: number; thisRegion: number }; // years
  timestamp: string;
}

// ============================================================================
// LIFECYCLE PHASE FINGERPRINTS
// ============================================================================

interface PhaseFingerprint {
  phase: LifecyclePhase;
  fdiTrend: string[];
  populationSignals: string[];
  infrastructureSignals: string[];
  governmentSignals: string[];
  typicalDuration: number; // years
  description: string;
}

const PHASE_FINGERPRINTS: PhaseFingerprint[] = [
  {
    phase: 'emergence',
    fdiTrend: ['rising'],
    populationSignals: ['growing'],
    infrastructureSignals: ['new', 'developing'],
    governmentSignals: ['high'],
    typicalDuration: 5,
    description: 'Region is being "discovered" by investors. Government is actively promoting. Infrastructure is being built. Early movers are arriving.'
  },
  {
    phase: 'growth',
    fdiTrend: ['rising'],
    populationSignals: ['growing'],
    infrastructureSignals: ['developing'],
    governmentSignals: ['high', 'medium'],
    typicalDuration: 8,
    description: 'Investment is accelerating. Multiple investors arriving. Supply chains forming. Talent pipeline developing. Success stories emerging.'
  },
  {
    phase: 'boom',
    fdiTrend: ['rising'],
    populationSignals: ['growing', 'stable'],
    infrastructureSignals: ['mature'],
    governmentSignals: ['high'],
    typicalDuration: 5,
    description: 'Peak investment phase. Multiple sectors active. Land values rising. Congestion emerging. Risk of overheating.'
  },
  {
    phase: 'peak',
    fdiTrend: ['flat'],
    populationSignals: ['stable'],
    infrastructureSignals: ['mature'],
    governmentSignals: ['medium'],
    typicalDuration: 3,
    description: 'Investment stabilising. Cost advantages narrowing. Initial competitive advantages being competed away. Government attention shifting.'
  },
  {
    phase: 'plateau',
    fdiTrend: ['flat'],
    populationSignals: ['stable', 'declining'],
    infrastructureSignals: ['mature', 'aging'],
    governmentSignals: ['medium', 'low'],
    typicalDuration: 5,
    description: 'Region maintains but does not grow. Existing investors stay but new investment slows. Institutional memory of boom-era success fading.'
  },
  {
    phase: 'decline',
    fdiTrend: ['declining'],
    populationSignals: ['declining'],
    infrastructureSignals: ['aging'],
    governmentSignals: ['low'],
    typicalDuration: 8,
    description: 'Investment leaving. Talent outmigrating. Infrastructure degrading. Government resources redirected elsewhere. Narrative becomes negative.'
  },
  {
    phase: 'dormancy',
    fdiTrend: ['declining', 'flat'],
    populationSignals: ['declining', 'stable'],
    infrastructureSignals: ['aging'],
    governmentSignals: ['low'],
    typicalDuration: 10,
    description: 'Region forgotten by investors. Assets underutilised. Institutional memory of previous success largely lost. BUT: physical infrastructure, geographic advantages, and cultural assets persist.'
  },
  {
    phase: 'reactivation',
    fdiTrend: ['rising'],
    populationSignals: ['stable', 'growing'],
    infrastructureSignals: ['aging', 'developing'],
    governmentSignals: ['high'],
    typicalDuration: 5,
    description: 'New catalyst triggers reinvestment. Previous infrastructure repurposed. New narrative built on historical foundations. This is where recycling the past creates the most value.'
  }
];

// ============================================================================
// REGIONAL LIFECYCLE EXAMPLES (for matching)
// ============================================================================

const LIFECYCLE_EXAMPLES: Array<{
  region: string;
  country: string;
  phase: LifecyclePhase;
  sector: string;
  whatWorked: string;
  lessons: string[];
  peakYear: number;
  currentYear: number;
}> = [
  { region: 'Detroit', country: 'USA', phase: 'reactivation', sector: 'Automotive → Tech/EV', whatWorked: 'Reused automotive manufacturing base for EV production. Existing supply chain and workforce retrained.', lessons: ['Manufacturing skills transfer across technology generations', 'Brand identity can be rebuilt on historical foundation'], peakYear: 1960, currentYear: 2024 },
  { region: 'Ruhr Valley', country: 'Germany', phase: 'reactivation', sector: 'Coal/Steel → Tech/Green', whatWorked: 'Converted industrial sites to technology parks and cultural centres. University investment created new knowledge economy.', lessons: ['Industrial heritage becomes cultural/tourism asset', 'University anchor strategy works for post-industrial regions'], peakYear: 1960, currentYear: 2020 },
  { region: 'Pittsburgh', country: 'USA', phase: 'reactivation', sector: 'Steel → Healthcare/Tech', whatWorked: 'Carnegie Mellon + University of Pittsburgh became anchors. Steel-era philanthropy funded transformation.', lessons: ['University + hospital anchor creates post-industrial economy', 'Philanthropic capital from boom era can fund reactivation'], peakYear: 1950, currentYear: 2015 },
  { region: 'Bilbao', country: 'Spain', phase: 'reactivation', sector: 'Shipbuilding → Culture/Tourism', whatWorked: 'Guggenheim Museum as catalyst. Waterfront redevelopment repurposed industrial land.', lessons: ['Single iconic investment can reframe regional narrative', 'Industrial waterfront = premium redevelopment asset'], peakYear: 1970, currentYear: 2000 },
  { region: 'Shenzhen', country: 'China', phase: 'boom', sector: 'Manufacturing → Technology', whatWorked: 'SEZ framework + proximity to Hong Kong + massive labour pool. Rapid iteration culture.', lessons: ['SEZ + geographic advantage + labour = explosive growth', 'Speed and scale attract more speed and scale'], peakYear: 2020, currentYear: 2024 },
  { region: 'Cebu', country: 'Philippines', phase: 'growth', sector: 'BPO/Electronics', whatWorked: 'English-speaking workforce + lower costs than Manila + PEZA zones.', lessons: ['Second-city cost advantage attracts BPO overflow from capital', 'University pipeline critical for IT-BPM'], peakYear: 2025, currentYear: 2024 },
  { region: 'Da Nang', country: 'Vietnam', phase: 'emergence', sector: 'IT/Tourism/Manufacturing', whatWorked: 'Government prioritisation + coastal location + lifestyle appeal for expat talent.', lessons: ['Lifestyle factors increasingly drive tech investment location', 'Government designation accelerates investor attention'], peakYear: 2030, currentYear: 2024 },
  { region: 'Newcastle', country: 'Australia', phase: 'plateau', sector: 'Coal/Mining → Diversifying', whatWorked: 'University of Newcastle growing. Port infrastructure still world-class. Renewable energy potential.', lessons: ['Port infrastructure is permanent competitive advantage', 'Coal regions can pivot to renewable energy with existing grid connection'], peakYear: 2012, currentYear: 2024 },
  { region: 'Townsville', country: 'Australia', phase: 'decline', sector: 'Mining Services', whatWorked: 'Military base + port + proximity to resources. Cyclone resilience culture.', lessons: ['Government/military anchors provide floor during decline', 'Critical minerals offer potential reactivation catalyst'], peakYear: 2013, currentYear: 2024 },
  { region: 'Medellín', country: 'Colombia', phase: 'reactivation', sector: 'Violence → Innovation Hub', whatWorked: 'Cable car infrastructure connecting barrios. Public library parks. Startup ecosystem. Complete narrative transformation.', lessons: ['Infrastructure for the poorest creates political will for broader investment', 'Narrative transformation is possible within 15 years'], peakYear: 2019, currentYear: 2024 }
];

// ============================================================================
// RECYCLABLE ASSET CATEGORIES
// ============================================================================

const RECYCLABLE_CATEGORIES: Array<{
  assetType: string;
  recyclableAs: string;
  condition: string;
  precedentRegion: string;
  strategy: string;
}> = [
  { assetType: 'industrial site', recyclableAs: 'technology park / mixed-use development', condition: 'Requires remediation but land is already zoned industrial', precedentRegion: 'Ruhr Valley, Germany', strategy: 'Heritage industrial conversion - retain architectural identity while repurposing interior' },
  { assetType: 'port infrastructure', recyclableAs: 'logistics hub / export gateway', condition: 'Physical infrastructure persists regardless of cargo volume decline', precedentRegion: 'Newcastle, Australia', strategy: 'Connect to new supply chains - ports built for coal can serve renewable energy component import' },
  { assetType: 'rail network', recyclableAs: 'freight corridor / commuter transport', condition: 'Rail bed persists even when service declines', precedentRegion: 'Multiple US cities', strategy: 'Rail-to-trail for tourism or reactivation for freight as manufacturing returns' },
  { assetType: 'workforce skills', recyclableAs: 'adjacent sector capabilities', condition: 'Skills transfer across technology generations with retraining', precedentRegion: 'Detroit → EV manufacturing', strategy: 'Identify skill adjacencies - welding → advanced manufacturing, mining → tunnelling → infrastructure' },
  { assetType: 'university/research', recyclableAs: 'innovation anchor + talent pipeline', condition: 'Universities persist through economic cycles', precedentRegion: 'Pittsburgh → CMU/UPMC', strategy: 'University as reactivation anchor - partner with institution to create industry clusters' },
  { assetType: 'government relationships', recyclableAs: 'policy advocacy + incentive negotiation', condition: 'Institutional relationships persist even when investment declines', precedentRegion: 'Multiple regions globally', strategy: 'Reactivate dormant government relationships with fresh narrative and data-backed proposals' },
  { assetType: 'cultural identity', recyclableAs: 'brand narrative + tourism asset', condition: 'Cultural identity cannot be replicated - it is permanently unique', precedentRegion: 'Bilbao, Spain', strategy: 'Build investment narrative on authentic cultural identity rather than generic "business-friendly" positioning' },
  { assetType: 'diaspora network', recyclableAs: 'inbound investment channel + knowledge transfer', condition: 'Diaspora maintains connection to origin region across generations', precedentRegion: 'Ireland, Israel, India', strategy: 'Diaspora engagement programme - investment incentives for returning capital, knowledge transfer mechanisms' }
];

// ============================================================================
// INVESTMENT LIFECYCLE MAPPER
// ============================================================================

export class InvestmentLifecycleMapper {

  /**
   * Map the investment lifecycle position of a region.
   * Identifies recyclable assets and reactivation strategies.
   */
  static map(context: LifecycleContext): LifecycleReport {
    const currentPhase = this.identifyPhase(context);
    const phaseConfidence = this.calculatePhaseConfidence(context, currentPhase);
    const phaseRationale = this.generateRationale(context, currentPhase);
    const recyclableAssets = this.identifyRecyclableAssets(context, currentPhase);
    const phaseTransition = this.predictTransition(context, currentPhase);
    const similarRegions = this.findSimilarRegions(context, currentPhase);
    const reactivationPlaybook = this.generatePlaybook(context, currentPhase, recyclableAssets);

    const phaseInfo = PHASE_FINGERPRINTS.find(p => p.phase === currentPhase);
    const typicalDuration = phaseInfo?.typicalDuration || 5;

    return {
      currentPhase,
      phaseConfidence,
      phaseRationale,
      recyclableAssets,
      phaseTransition,
      similarRegions,
      reactivationPlaybook,
      cycleDuration: {
        typical: PHASE_FINGERPRINTS.reduce((sum, p) => sum + p.typicalDuration, 0),
        thisRegion: Math.round(typicalDuration * (context.yearsOfFDIData > 10 ? 1.2 : 0.8))
      },
      timestamp: new Date().toISOString()
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE IDENTIFICATION
  // ──────────────────────────────────────────────────────────────────────────

  private static identifyPhase(ctx: LifecycleContext): LifecyclePhase {
    let bestMatch: LifecyclePhase = 'emergence';
    let bestScore = 0;

    for (const fp of PHASE_FINGERPRINTS) {
      let score = 0;
      let dimensions = 0;

      // FDI trend match
      if (fp.fdiTrend.includes(ctx.currentFDITrend)) { score += 3; }
      dimensions += 3;

      // Population match
      if (fp.populationSignals.includes(ctx.populationTrend)) { score += 2; }
      dimensions += 2;

      // Infrastructure match
      if (fp.infrastructureSignals.includes(ctx.infrastructureAge)) { score += 2; }
      dimensions += 2;

      // Government priority match
      if (fp.governmentSignals.includes(ctx.governmentPriority)) { score += 1; }
      dimensions += 1;

      // Historical investment context
      if (ctx.hasHistoricalInvestment && (fp.phase === 'decline' || fp.phase === 'dormancy' || fp.phase === 'reactivation')) {
        score += 2;
      }
      if (!ctx.hasHistoricalInvestment && (fp.phase === 'emergence' || fp.phase === 'growth')) {
        score += 2;
      }
      dimensions += 2;

      const normalised = score / dimensions;
      if (normalised > bestScore) {
        bestScore = normalised;
        bestMatch = fp.phase;
      }
    }

    return bestMatch;
  }

  private static calculatePhaseConfidence(ctx: LifecycleContext, phase: LifecyclePhase): number {
    let confidence = 50;

    // More data = higher confidence
    if (ctx.yearsOfFDIData >= 20) confidence += 20;
    else if (ctx.yearsOfFDIData >= 10) confidence += 15;
    else if (ctx.yearsOfFDIData >= 5) confidence += 10;

    // Known FDI trend adds confidence
    if (ctx.currentFDITrend !== 'unknown') confidence += 10;

    // Historical investment knowledge adds confidence
    if (ctx.hasHistoricalInvestment) confidence += 10;

    // Phase-specific confidence adjustments
    if (phase === 'boom' || phase === 'decline') confidence += 5; // Extremes are easier to identify
    if (phase === 'plateau') confidence -= 5; // Hardest to distinguish

    return Math.min(95, Math.max(30, confidence));
  }

  private static generateRationale(ctx: LifecycleContext, phase: LifecyclePhase): string {
    const fp = PHASE_FINGERPRINTS.find(p => p.phase === phase);
    return `${ctx.region}, ${ctx.country} appears to be in the **${phase}** phase of its investment lifecycle. ` +
      `FDI trend: ${ctx.currentFDITrend}. Infrastructure: ${ctx.infrastructureAge}. Population: ${ctx.populationTrend}. ` +
      `Government priority: ${ctx.governmentPriority}. ` +
      (fp ? fp.description : '') +
      (ctx.hasHistoricalInvestment ? ` The region has historical investment experience, which provides recyclable assets for future development.` : '');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RECYCLABLE ASSET IDENTIFICATION
  // ──────────────────────────────────────────────────────────────────────────

  private static identifyRecyclableAssets(ctx: LifecycleContext, phase: LifecyclePhase): RecyclableAsset[] {
    const assets: RecyclableAsset[] = [];

    for (const cat of RECYCLABLE_CATEGORIES) {
      // Check if user's existing assets match a recyclable category
      const match = ctx.existingAssets.some(a =>
        a.toLowerCase().includes(cat.assetType.split(' ')[0]) ||
        cat.assetType.toLowerCase().includes(a.toLowerCase().split(' ')[0])
      );

      if (match) {
        // Reactivation potential depends on lifecycle phase
        let potential = 0.5;
        if (phase === 'dormancy') potential = 0.9;    // Highest recycling value
        if (phase === 'decline') potential = 0.7;
        if (phase === 'reactivation') potential = 0.85;
        if (phase === 'plateau') potential = 0.6;
        if (phase === 'boom') potential = 0.3;         // Already being used

        assets.push({
          asset: cat.assetType,
          originalContext: `Originally valuable as ${cat.assetType} during the region's growth/boom phase`,
          currentState: cat.condition,
          reactivationPotential: potential,
          recyclingStrategy: cat.strategy,
          historicalPrecedent: `${cat.precedentRegion}: ${cat.recyclableAs}`
        });
      }
    }

    // If no explicit matches, suggest based on common regional assets
    if (assets.length === 0 && ctx.hasHistoricalInvestment) {
      assets.push({
        asset: 'institutional memory',
        originalContext: 'Knowledge of what attracted previous investment',
        currentState: 'Likely fading - needs documentation and preservation',
        reactivationPotential: 0.8,
        recyclingStrategy: 'Interview previous-era stakeholders, document success factors, and map which conditions remain',
        historicalPrecedent: 'Every successfully reactivated region started by understanding what worked before'
      });
    }

    return assets;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE TRANSITION PREDICTION
  // ──────────────────────────────────────────────────────────────────────────

  private static predictTransition(ctx: LifecycleContext, phase: LifecyclePhase): PhaseTransitionInsight {
    const transitions: Record<LifecyclePhase, { next: LifecyclePhase; prob: number; years: number; catalysts: string[]; blockers: string[] }> = {
      'emergence': { next: 'growth', prob: 0.7, years: 3, catalysts: ['Anchor investor arrival', 'Government incentive package', 'Infrastructure completion'], blockers: ['Regulatory uncertainty', 'Infrastructure delays', 'Political instability'] },
      'growth': { next: 'boom', prob: 0.5, years: 5, catalysts: ['Sector cluster formation', 'Supply chain completion', 'International recognition'], blockers: ['Cost escalation', 'Talent shortage', 'Overheating concerns'] },
      'boom': { next: 'peak', prob: 0.8, years: 3, catalysts: ['Cost parity with competitors', 'Market saturation', 'Diminishing incentives'], blockers: ['Sustained cost advantages', 'New sector emergence', 'Continuous innovation'] },
      'peak': { next: 'plateau', prob: 0.6, years: 3, catalysts: ['Competitor regions emerging', 'Investor attention shifting', 'Policy neglect'], blockers: ['Diversification success', 'New anchor investments', 'Policy renewal'] },
      'plateau': { next: 'decline', prob: 0.4, years: 5, catalysts: ['Anchor employer departure', 'Population outmigration', 'Infrastructure decay'], blockers: ['Successful reinvention', 'New sector attraction', 'Government intervention'] },
      'decline': { next: 'dormancy', prob: 0.5, years: 5, catalysts: ['Last major employer closes', 'Government deprioritisation', 'Narrative becomes entirely negative'], blockers: ['Reactivation catalyst', 'New government priority', 'External demand shift'] },
      'dormancy': { next: 'reactivation', prob: 0.3, years: 8, catalysts: ['New technology making dormant assets valuable', 'Government regional development push', 'Cost advantage re-emergence'], blockers: ['Continued neglect', 'Population collapse', 'Environmental degradation'] },
      'reactivation': { next: 'growth', prob: 0.6, years: 5, catalysts: ['Successful pilot project', 'Anchor investor commitment', 'Narrative transformation'], blockers: ['Reactivation fatigue', 'Insufficient investment', 'Lack of sustained government commitment'] }
    };

    const t = transitions[phase];
    const benchmark = LIFECYCLE_EXAMPLES.find(e => e.phase === phase);

    return {
      currentPhase: phase,
      nextLikelyPhase: t.next,
      transitionProbability: t.prob,
      timeHorizonYears: t.years,
      catalysts: t.catalysts,
      blockers: t.blockers,
      historicalBenchmark: benchmark
        ? `${benchmark.region}, ${benchmark.country} (${benchmark.sector}): ${benchmark.whatWorked}`
        : `Historical data supports a ${t.years}-year typical transition from ${phase} to ${t.next}`
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SIMILAR REGION MATCHING
  // ──────────────────────────────────────────────────────────────────────────

  private static findSimilarRegions(ctx: LifecycleContext, phase: LifecyclePhase): SimilarRegionMatch[] {
    const matches: SimilarRegionMatch[] = [];

    for (const example of LIFECYCLE_EXAMPLES) {
      let similarity = 0;

      // Same phase or adjacent phase
      if (example.phase === phase) similarity += 0.3;
      else {
        const phases: LifecyclePhase[] = ['emergence', 'growth', 'boom', 'peak', 'plateau', 'decline', 'dormancy', 'reactivation'];
        const diff = Math.abs(phases.indexOf(phase) - phases.indexOf(example.phase));
        if (diff <= 1) similarity += 0.2;
        else if (diff <= 2) similarity += 0.1;
      }

      // Sector overlap
      if (ctx.sector.toLowerCase().includes(example.sector.split('/')[0].toLowerCase().trim()) ||
          example.sector.toLowerCase().includes(ctx.sector.toLowerCase().split(' ')[0])) {
        similarity += 0.25;
      }

      // Same country
      if (ctx.country.toLowerCase() === example.country.toLowerCase()) similarity += 0.15;

      // Region size/type similarity (rough proxy)
      similarity += 0.1; // Base similarity for being a regional example

      // Calculate time offset
      const _yearDiff = example.currentYear - (example.peakYear || 2024);
      let timeOffset: string;
      if (example.phase === phase) timeOffset = 'Same phase';
      else {
        const phases: LifecyclePhase[] = ['emergence', 'growth', 'boom', 'peak', 'plateau', 'decline', 'dormancy', 'reactivation'];
        const phaseDiff = phases.indexOf(example.phase) - phases.indexOf(phase);
        timeOffset = phaseDiff > 0 ? `${Math.abs(phaseDiff) * 5} years ahead` : `${Math.abs(phaseDiff) * 5} years behind`;
      }

      if (similarity >= 0.3) {
        matches.push({
          regionName: example.region,
          country: example.country,
          lifecyclePhase: example.phase,
          similarityScore: Math.min(1, similarity),
          whatTheyDid: example.whatWorked,
          lessonsTransferable: example.lessons,
          timeOffset
        });
      }
    }

    return matches
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // REACTIVATION PLAYBOOK
  // ──────────────────────────────────────────────────────────────────────────

  private static generatePlaybook(ctx: LifecycleContext, phase: LifecyclePhase, assets: RecyclableAsset[]): string[] {
    const playbook: string[] = [];

    // Phase-specific strategies
    switch (phase) {
      case 'dormancy':
        playbook.push('1. AUDIT: Document all remaining assets from previous investment era - infrastructure, skills, relationships, geographic advantages');
        playbook.push('2. NARRATIVE: Build new investment narrative that acknowledges history but frames the future - "built on proven foundations"');
        playbook.push('3. ANCHOR: Identify one catalytic investment that can trigger attention - the "Guggenheim effect"');
        playbook.push('4. RECYCLE: Map specific assets to new sector opportunities using the recyclable asset analysis below');
        playbook.push('5. CONNECT: Engage diaspora network and former investors - they know the region and may reinvest under new conditions');
        break;
      case 'decline':
        playbook.push('1. STABILISE: Identify and protect remaining anchor employers/institutions');
        playbook.push('2. DIVERSIFY: Use remaining investment-era infrastructure to attract adjacent sectors');
        playbook.push('3. RETAIN: Implement talent retention programmes before skills leave permanently');
        playbook.push('4. DOCUMENT: Capture institutional memory of what attracted investment originally');
        playbook.push('5. ADVOCATE: Build data-backed case for government intervention/priority status');
        break;
      case 'plateau':
        playbook.push('1. REINVENT: Identify next-generation sectors that can use existing infrastructure');
        playbook.push('2. UPGRADE: Invest in infrastructure modernisation before decay begins');
        playbook.push('3. ATTRACT: Target investors in adjacent sectors that value existing supply chain');
        playbook.push('4. BRAND: Refresh regional narrative - move from "established" to "innovative"');
        playbook.push('5. PARTNER: Seek strategic partnerships with regions in growth/boom phase');
        break;
      case 'reactivation':
        playbook.push('1. AMPLIFY: Scale the reactivation catalyst - more investment in what\'s working');
        playbook.push('2. CONNECT: Link reactivation sector to existing regional assets and supply chains');
        playbook.push('3. TELL: Broadcast the transformation story - media, conferences, investor roadshows');
        playbook.push('4. SUSTAIN: Ensure government commitment extends beyond political cycle');
        playbook.push('5. MEASURE: Track and publish progress metrics to maintain momentum');
        break;
      default:
        playbook.push('1. ASSESS: Complete lifecycle assessment to understand current position');
        playbook.push('2. PLAN: Develop phase-appropriate investment attraction strategy');
        playbook.push('3. EXECUTE: Implement with clear milestones and accountability');
        playbook.push('4. ADAPT: Monitor lifecycle indicators and adjust strategy as phase shifts');
        break;
    }

    // Add asset-specific strategies
    for (const asset of assets.slice(0, 3)) {
      playbook.push(`RECYCLE: ${asset.asset} → ${asset.recyclingStrategy} (precedent: ${asset.historicalPrecedent})`);
    }

    return playbook;
  }
}

export default InvestmentLifecycleMapper;
