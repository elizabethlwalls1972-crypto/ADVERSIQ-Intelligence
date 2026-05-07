/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SOCIAL DYNAMICS AGENT — NSIL v2 Layer 13
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The most advanced decisions fail not because they are technically wrong but
 * because of how people respond to them. This engine models the human system.
 *
 * Theoretical foundations:
 *
 *   1. Alex Pentland's Social Physics (MIT Media Lab)
 *      - Social influence spreads through exposure + engagement + trust
 *      - "Idea flow" is the primary driver of organizational and community change
 *      - Engagement diversity predicts adoption better than engagement volume
 *
 *   2. Everett Rogers' Diffusion of Innovations (1962, 2003)
 *      - Adoption S-curve: Innovators (2.5%) → Early Adopters (13.5%) →
 *        Early Majority (34%) → Late Majority (34%) → Laggards (16%)
 *      - Critical mass threshold: typically 15-25% adoption triggers self-sustaining spread
 *      - 5 attributes predict adoption speed: Relative Advantage, Compatibility,
 *        Complexity, Trialability, Observability
 *
 *   3. Deffuant Bounded Confidence Model
 *      - Agents only update their opinions toward those within their
 *        "confidence threshold" of their own view
 *      - This explains why societies fragment into stable belief clusters
 *        even when information is universally available
 *      - Predicts the minimum viable bridge size needed to connect factions
 *
 *   4. Network Centrality (Watts-Strogatz + Barabasi-Albert)
 *      - Hubs disproportionately accelerate or block diffusion
 *      - Small-world networks mean 6 degrees of separation is structural
 *      - Identifying opinion leaders = identifying the 5% of nodes whose
 *        adoption changes the trajectory for the remaining 95%
 *
 * Architecture:
 *   1. Population segmentation (by adoption propensity)
 *   2. Rogers diffusion curve modeling
 *   3. Resistance mapping (who, why, how much)
 *   4. Tipping point calculation (when does the S-curve inflect?)
 *   5. Opinion leader identification
 *   6. Engagement strategy per segment
 *   7. Deffuant faction bridge analysis
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocialInterventionInput {
  interventionDescription: string; // What is being introduced?
  domain: string;
  targetPopulation: string;         // Who is the affected group?
  populationSize?: number;          // Approximate population count
  currentAdoptionRate?: number;     // 0-1: if something exists, how adopted is it?
  geography?: string;
  culturalContext?: string;
  keyBeneficiaries?: string[];       // Who benefits most?
  keyResistors?: string[];           // Who might resist and why?
  relativeAdvantage?: number;        // 0-10: how much better than current?
  complexity?: number;               // 0-10: how difficult to understand/use?
  observability?: number;            // 0-10: how visible are the benefits?
}

export interface AdoptionSegment {
  segmentName: string;
  rogersCategory: 'innovators' | 'early-adopters' | 'early-majority' | 'late-majority' | 'laggards';
  populationShare: number;          // 0-1
  estimatedCount?: number;
  characteristics: string[];
  adoptionMotivation: string;
  timeToAdopt: string;
  engagementStrategy: string;
  keyMessages: string[];
}

export interface ResistanceProfile {
  sourceGroup: string;
  resistanceType: 'loss-aversion' | 'identity-threat' | 'economic-interest' | 'complexity-barrier' | 'trust-deficit' | 'cultural-incompatibility';
  strength: number;                 // 0-10
  evidenceBasis: string;
  overcomingStrategy: string;
  timeToNeutralizeMonths: number;
}

export interface TippingPointAnalysis {
  criticalMassThreshold: number;    // 0-1: adoption rate needed for self-sustaining spread
  currentTrajectory: string;        // 'below' | 'approaching' | 'reached' | 'exceeded'
  estimatedTimeToTippingPoint: string;
  tippingPointTriggers: string[];   // What events would accelerate reaching it?
  tippingPointBlockers: string[];   // What could prevent reaching it?
  postTippingPointBehavior: string; // What happens after critical mass?
}

export interface OpinionLeader {
  leaderCategory: 'formal-authority' | 'social-influencer' | 'domain-expert' | 'community-anchor' | 'bridge-builder';
  description: string;
  networkReach: 'local' | 'regional' | 'national' | 'global';
  engagementApproach: string;
  adoptionImpactMultiplier: number; // How many followers typically follow their adoption?
  priorityScore: number;            // 0-100
}

export interface SocialFaction {
  factionName: string;
  coreBeliefProfile: string;
  sizeEstimate: string;             // 'small' | 'medium' | 'large'
  openness: number;                 // 0-10: Deffuant confidence threshold proxy
  currentStance: 'champion' | 'neutral' | 'skeptical' | 'opposed';
  bridgeStrategy: string;
}

export interface DiffusionProjection {
  month1AdoptionRate: number;       // 0-1
  month6AdoptionRate: number;
  year1AdoptionRate: number;
  year3AdoptionRate: number;
  year5AdoptionRate: number;
  sCurveShape: 'fast' | 'normal' | 'slow' | 'stalled';
  peakAdoptionRate: number;
  limitingFactors: string[];
}

export interface SocialDynamicsReport {
  interventionDescription: string;
  adoptionSegments: AdoptionSegment[];
  resistanceProfiles: ResistanceProfile[];
  tippingPointAnalysis: TippingPointAnalysis;
  opinionLeaders: OpinionLeader[];
  factions: SocialFaction[];
  diffusionProjection: DiffusionProjection;
  overallAdoptabilityScore: number; // 0-100
  criticalSuccessFactor: string;    // Single most important factor for success
  biggestSocialRisk: string;
  launchRecommendation: string;
  processingNotes: string[];
}

// ─── Rogers Diffusion Engine ─────────────────────────────────────────────────

const ROGERS_SEGMENTS: AdoptionSegment[] = [
  {
    segmentName: 'Innovators',
    rogersCategory: 'innovators',
    populationShare: 0.025,
    characteristics: ['High risk tolerance', 'Strong domain expertise', 'Extensive external networks', 'Financial resources to absorb failure', 'Driven by novelty'],
    adoptionMotivation: 'Novelty, technical curiosity, desire to be first, network status',
    timeToAdopt: 'Immediately (Days-Weeks)',
    engagementStrategy: 'Direct technical briefings, beta access, co-creation involvement',
    keyMessages: ['Be the first', 'Shape the future', 'Technical advantages: [specific benefit]']
  },
  {
    segmentName: 'Early Adopters',
    rogersCategory: 'early-adopters',
    populationShare: 0.135,
    characteristics: ['High social connectivity', 'Opinion leaders', 'Respected by peers', 'Willing to try new ideas but more strategically than Innovators', 'Local prestige matters'],
    adoptionMotivation: 'Competitive advantage, social status, genuine belief in the innovation\'s value',
    timeToAdopt: '1-6 months',
    engagementStrategy: 'Peer case studies, exclusive early access, recognition programs, train-the-trainer',
    keyMessages: ['Competitive edge', 'Peer success stories', 'Join the leading group']
  },
  {
    segmentName: 'Early Majority',
    rogersCategory: 'early-majority',
    populationShare: 0.34,
    characteristics: ['Deliberate decision-makers', 'Wait for proof before adopting', 'Strong local networks', 'Risk-averse but not laggards', 'Driven by practical utility'],
    adoptionMotivation: 'Proven utility, peer adoption (especially by Early Adopters they trust), risk mitigation',
    timeToAdopt: '6-24 months (after critical mass signals)',
    engagementStrategy: 'Testimonials from Early Adopters, ROI demonstrations, simplified onboarding, peer network leverage',
    keyMessages: ['Proven by people like you', 'Safe and supported', 'Practical benefits clearly demonstrated']
  },
  {
    segmentName: 'Late Majority',
    rogersCategory: 'late-majority',
    populationShare: 0.34,
    characteristics: ['Skeptical', 'Adopt due to economic necessity or social pressure', 'Below-average social status', 'Change is difficult and stressful', 'Require hand-holding'],
    adoptionMotivation: 'Social pressure, fear of being left behind, economic necessity, norm establishment',
    timeToAdopt: '24-60 months',
    engagementStrategy: 'Mandatory or strongly incentivized adoption, maximum simplicity, peer support networks, patience',
    keyMessages: ['Everyone is doing it', 'You won\'t be left behind', 'Simple to use', 'Supported at every step']
  },
  {
    segmentName: 'Laggards',
    rogersCategory: 'laggards',
    populationShare: 0.16,
    characteristics: ['Traditional orientation', 'Suspicious of change agents', 'Limited resources', 'Decision reference point is the past', 'May never adopt voluntarily'],
    adoptionMotivation: 'Forced adoption (no alternative), extreme economic pressure, long-term demonstrated norm',
    timeToAdopt: '5+ years or never',
    engagementStrategy: 'Do not prioritize. Minimum viable support. Focus energy on Early/Late Majority.',
    keyMessages: ['This is the new normal', 'Your existing values are supported', 'Simple fallback options available']
  }
];

// ─── Resistance Profiler ─────────────────────────────────────────────────────

function buildResistanceProfiles(input: SocialInterventionInput): ResistanceProfile[] {
  const profiles: ResistanceProfile[] = [];
  const complexity = input.complexity || 5;
  const advantage = input.relativeAdvantage || 5;

  // Loss aversion (Kahneman): people feel losses 2.25x more strongly than equivalent gains
  if (input.keyResistors && input.keyResistors.length > 0) {
    for (const resistor of input.keyResistors.slice(0, 3)) {
      profiles.push({
        sourceGroup: resistor,
        resistanceType: 'economic-interest',
        strength: 7,
        evidenceBasis: `"${resistor}" named as potential resistor. Economic interest resistance assumes those who benefit from the status quo will resist change proportional to their stake.`,
        overcomingStrategy: `Map what "${resistor}" currently has to lose, then design win-win components that reduce their loss while achieving the intervention's core goals. Bring them in early as co-designers.`,
        timeToNeutralizeMonths: 12
      });
    }
  }

  // Complexity barrier
  if (complexity > 6) {
    profiles.push({
      sourceGroup: 'General Population (complexity-driven)',
      resistanceType: 'complexity-barrier',
      strength: complexity - 4,
      evidenceBasis: `High complexity score (${complexity}/10) creates a structural adoption barrier. Most behavioral economics research shows complexity is a leading predictor of non-adoption.`,
      overcomingStrategy: 'Progressive disclosure: show only what is needed at each step. Invest in UX/simplification before scaling. Provide peer guides, not instruction manuals.',
      timeToNeutralizeMonths: 6
    });
  }

  // Trust deficit (always present for new interventions)
  profiles.push({
    sourceGroup: 'Trust-deficit segment (standard for new initiatives)',
    resistanceType: 'trust-deficit',
    strength: 5,
    evidenceBasis: 'New interventions always face trust deficit until demonstrated results accumulate. Typical resolution: 12-24 months of consistent performance.',
    overcomingStrategy: 'Radical transparency about results (including failures). Third-party validation. Use trusted local institutions as delivery channels rather than the intervention sponsor.',
    timeToNeutralizeMonths: 18
  });

  return profiles;
}

// ─── Tipping Point Calculator ─────────────────────────────────────────────────

function calculateTippingPoint(input: SocialInterventionInput): TippingPointAnalysis {
  const advantage = input.relativeAdvantage || 5;
  const complexity = input.complexity || 5;
  const observability = input.observability || 5;
  const currentAdoption = input.currentAdoptionRate || 0;

  // Rogers says critical mass is typically 15-25%
  // We adjust based on complexity and observability
  const threshold = Math.max(0.10, Math.min(0.35, 
    0.20 - (advantage * 0.01) + (complexity * 0.01) - (observability * 0.005)
  ));

  const currentStatus = currentAdoption >= threshold ? 'exceeded' :
    currentAdoption >= threshold * 0.7 ? 'approaching' :
    currentAdoption > 0 ? 'below' : 'below';

  const monthsToTipping = currentAdoption >= threshold ? 0 :
    Math.round((threshold - currentAdoption) / 0.005); // ~0.5% growth per month average

  return {
    criticalMassThreshold: threshold,
    currentTrajectory: currentStatus,
    estimatedTimeToTippingPoint: currentAdoption >= threshold ? 'Already reached' : 
      `Approximately ${monthsToTipping} months at baseline adoption rate`,
    tippingPointTriggers: [
      `A high-profile early adopter in the top 5% of social influence (opinion leader) publicly adopts`,
      `A documented success case with >3x relative advantage over the alternative`,
      `Government or institutional endorsement reduces perceived risk`,
      `Competitive pressure: peer adoption forces reconsideration`
    ],
    tippingPointBlockers: [
      `Complexity barriers prevent initial trial by Early Majority`,
      `Absence of visible role models in the target community`,
      `Economic crisis shifts attention away from adoption`,
      `One high-profile failure during early rollout poisons perception for 12-24 months`
    ],
    postTippingPointBehavior: `After critical mass (${(threshold * 100).toFixed(0)}%), adoption becomes self-sustaining through social proof. The Early and Late Majority adopt because "everyone is doing it." Marketing and incentive costs drop significantly. Focus shifts from acquisition to quality maintenance.`
  };
}

// ─── Opinion Leader Templates ─────────────────────────────────────────────────

function identifyOpinionLeaders(input: SocialInterventionInput): OpinionLeader[] {
  return [
    {
      leaderCategory: 'formal-authority',
      description: `Official decision-makers and institutional leaders in the ${input.domain} domain`,
      networkReach: 'regional',
      engagementApproach: 'Brief at highest level. Provide clear cost-benefit analysis. Offer a controlled pilot with clear success metrics. Never ask them to champion something they cannot verify.',
      adoptionImpactMultiplier: 15,
      priorityScore: 85
    },
    {
      leaderCategory: 'social-influencer',
      description: `Respected voices in the ${input.targetPopulation} community with high social credibility`,
      networkReach: 'local',
      engagementApproach: 'Authentic relationship first. Involve in co-design, not just promotion. Their credibility is their asset — protect it by giving them full information including limitations.',
      adoptionImpactMultiplier: 25,
      priorityScore: 92
    },
    {
      leaderCategory: 'domain-expert',
      description: `Technical or subject-matter experts whose endorsement carries credibility weight`,
      networkReach: 'national',
      engagementApproach: 'Provide full technical access. Enable independent verification. Respect their methodology. Expert skeptics who are later convinced become more powerful advocates than original champions.',
      adoptionImpactMultiplier: 20,
      priorityScore: 78
    },
    {
      leaderCategory: 'bridge-builder',
      description: `Individuals who span multiple factions or communities — critical for crossing the Deffuant confidence gap`,
      networkReach: 'regional',
      engagementApproach: 'Identify the 3-5 people in the network who are trusted by MULTIPLE factions simultaneously. These people are rare and extremely high-value. Focus disproportionate attention on them.',
      adoptionImpactMultiplier: 35,
      priorityScore: 95
    }
  ];
}

// ─── Faction Analysis (Deffuant Model) ───────────────────────────────────────

function buildFactionAnalysis(input: SocialInterventionInput): SocialFaction[] {
  return [
    {
      factionName: 'Champions (inherently aligned)',
      coreBeliefProfile: `Already aligned with the intervention's goals. Likely early adopters.`,
      sizeEstimate: 'small',
      openness: 9,
      currentStance: 'champion',
      bridgeStrategy: 'Activate immediately. Use them to build social proof. Give them tools to persuade others.'
    },
    {
      factionName: 'Pragmatic Middle (evidence-driven)',
      coreBeliefProfile: 'No strong prior opinion. Will adopt if evidence and ease are compelling.',
      sizeEstimate: 'large',
      openness: 6,
      currentStance: 'neutral',
      bridgeStrategy: 'This is the decisive battleground. Focus on demonstrated results, simplified access, peer testimonials from people LIKE THEM. Don\'t use champions to reach this group — they don\'t trust champions. Use early pragmatic converts.'
    },
    {
      factionName: 'Identity-Invested Resistors',
      coreBeliefProfile: 'Core identity or values feel threatened by this change. High emotion, low evidence-responsiveness.',
      sizeEstimate: 'small',
      openness: 2,
      currentStance: 'opposed',
      bridgeStrategy: 'Do NOT try to convince with facts (Deffuant model: too far outside confidence threshold). Find the smallest, most specific thing they DO want that this intervention can also deliver. Build on that common ground. Accept that full conversion is unlikely — aim for neutralization (they stop actively opposing).'
    },
    {
      factionName: 'Status Quo Beneficiaries',
      coreBeliefProfile: 'Currently benefit from the existing system. Have concrete economic or political reasons to block change.',
      sizeEstimate: 'small',
      openness: 3,
      currentStance: 'opposed',
      bridgeStrategy: 'Map their specific losses. Design compensation or transition mechanisms. Alternatively, use regulatory or political levers to remove their blocking power. Never ignore this group — they punch above their weight in blocking potential.'
    }
  ];
}

// ─── Diffusion Projection ────────────────────────────────────────────────────

function projectDiffusion(input: SocialInterventionInput): DiffusionProjection {
  const advantage = (input.relativeAdvantage || 5) / 10;
  const complexity = (input.complexity || 5) / 10;
  const observability = (input.observability || 5) / 10;

  // Rogers innovation attributes composite score
  const adoptabilityScore = (advantage * 0.35 + (1 - complexity) * 0.25 + observability * 0.20 + 0.10 + 0.10);

  const baseGrowthRate = adoptabilityScore * 0.08; // max 8% per month at peak
  const initial = input.currentAdoptionRate || 0.01;

  // Logistic S-curve simulation (simplified)
  const K = 0.85; // Maximum adoption (not everyone adopts)

  function logistic(t: number): number {
    const r = baseGrowthRate * 12; // annual growth rate
    return K / (1 + ((K - initial) / initial) * Math.exp(-r * t));
  }

  const m1 = Math.min(K, logistic(1 / 12));
  const m6 = Math.min(K, logistic(0.5));
  const y1 = Math.min(K, logistic(1));
  const y3 = Math.min(K, logistic(3));
  const y5 = Math.min(K, logistic(5));

  const shape: DiffusionProjection['sCurveShape'] = 
    adoptabilityScore > 0.65 ? 'fast' :
    adoptabilityScore > 0.45 ? 'normal' :
    adoptabilityScore > 0.30 ? 'slow' : 'stalled';

  const limiters: string[] = [];
  if (complexity > 0.6) limiters.push('High complexity is limiting early adoption velocity');
  if (advantage < 0.4) limiters.push('Limited relative advantage reduces motivation to switch from status quo');
  if (observability < 0.4) limiters.push('Benefits are not easily observable, slowing social proof accumulation');
  if (!input.keyBeneficiaries || input.keyBeneficiaries.length === 0) limiters.push('Clear beneficiary segment not defined — broad targeting reduces adoption efficiency');

  return {
    month1AdoptionRate: Math.round(m1 * 1000) / 1000,
    month6AdoptionRate: Math.round(m6 * 1000) / 1000,
    year1AdoptionRate: Math.round(y1 * 1000) / 1000,
    year3AdoptionRate: Math.round(y3 * 1000) / 1000,
    year5AdoptionRate: Math.round(y5 * 1000) / 1000,
    sCurveShape: shape,
    peakAdoptionRate: K,
    limitingFactors: limiters.length > 0 ? limiters : ['No critical limiting factors identified — adoption conditions are favorable']
  };
}

// ─── Main Engine ─────────────────────────────────────────────────────────────

export class SocialDynamicsAgent {
  /**
   * Full social dynamics analysis: adoption modeling, resistance mapping,
   * tipping point calculation, opinion leader identification, faction bridging.
   */
  static analyze(input: SocialInterventionInput): SocialDynamicsReport {
    const notes: string[] = [`[SocialDynamicsAgent] Analyzing: "${input.interventionDescription.slice(0, 60)}..."`];

    notes.push('[Rogers] Segmenting population by adoption propensity...');
    const segments = ROGERS_SEGMENTS.map(s => ({
      ...s,
      estimatedCount: input.populationSize ? Math.round(input.populationSize * s.populationShare) : undefined
    }));

    notes.push('[Resistance] Building resistance profiles...');
    const resistanceProfiles = buildResistanceProfiles(input);
    notes.push(`[Resistance] Found ${resistanceProfiles.length} resistance vectors`);

    notes.push('[TippingPoint] Calculating critical mass threshold...');
    const tippingPointAnalysis = calculateTippingPoint(input);
    notes.push(`[TippingPoint] Critical mass threshold: ${(tippingPointAnalysis.criticalMassThreshold * 100).toFixed(0)}%`);

    notes.push('[OpinionLeaders] Identifying network influence nodes...');
    const opinionLeaders = identifyOpinionLeaders(input);

    notes.push('[Deffuant] Building faction analysis...');
    const factions = buildFactionAnalysis(input);

    notes.push('[Diffusion] Running Rogers S-curve projection...');
    const diffusionProjection = projectDiffusion(input);
    notes.push(`[Diffusion] 1-year projected adoption: ${(diffusionProjection.year1AdoptionRate * 100).toFixed(1)}%. Shape: ${diffusionProjection.sCurveShape}`);

    // Adoptability score
    const advantage = input.relativeAdvantage || 5;
    const complexity = input.complexity || 5;
    const observability = input.observability || 5;
    const adoptabilityScore = Math.round(
      advantage * 12 + (10 - complexity) * 8 + observability * 6 + 34 // baseline 34
    );

    const maxResistanceStrength = resistanceProfiles.length > 0
      ? Math.max(...resistanceProfiles.map(r => r.strength)) : 0;

    const criticalSuccessFactor = diffusionProjection.sCurveShape === 'stalled' || diffusionProjection.sCurveShape === 'slow'
      ? 'Reduce complexity and increase observability of benefits — current adoption velocity will not reach critical mass'
      : 'Identify and activate 3-5 bridge-builder opinion leaders in the target community before broad launch';

    const biggestRisk = maxResistanceStrength > 6
      ? `High-strength resistance (${maxResistanceStrength}/10) from ${resistanceProfiles.find(r => r.strength === maxResistanceStrength)?.sourceGroup}. This can block adoption before critical mass is reached.`
      : 'Stagnating at Early Majority adoption — the "chasm" between Early Adopters and Early Majority is the most common point of failure for otherwise sound interventions.';

    const launchRecommendation = diffusionProjection.sCurveShape === 'stalled'
      ? 'CAUTION: Do not launch broadly yet. Address complexity barriers and relative advantage gaps first. Pilot with Innovators and measure objectively before scaling.'
      : diffusionProjection.sCurveShape === 'slow'
      ? 'STAGED LAUNCH: Begin with high-conviction Early Adopters. Generate visible success cases. Use bridge-builder opinion leaders to carry the message to Early Majority before broad rollout.'
      : 'PROCEED: Conditions support adoption. Focus on activating opinion leaders in the first 90 days to build toward critical mass. Monitor adoption rate against tipping point threshold monthly.';

    notes.push(`[SocialDynamicsAgent] Complete. Adoptability: ${Math.min(100, adoptabilityScore)}/100`);

    return {
      interventionDescription: input.interventionDescription,
      adoptionSegments: segments,
      resistanceProfiles,
      tippingPointAnalysis,
      opinionLeaders,
      factions,
      diffusionProjection,
      overallAdoptabilityScore: Math.min(100, adoptabilityScore),
      criticalSuccessFactor,
      biggestSocialRisk: biggestRisk,
      launchRecommendation,
      processingNotes: notes
    };
  }

  /**
   * Quick adoption score: 0-100
   */
  static quickAdoptabilityScore(input: SocialInterventionInput): number {
    const report = SocialDynamicsAgent.analyze(input);
    return report.overallAdoptabilityScore;
  }
}

export default SocialDynamicsAgent;
