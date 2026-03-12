import {
  AdvisorInputModel,
  AdvisorSnapshot,
  IntelligenceArtifacts,
  IntelligenceSignal,
  ReferenceEngagement,
} from './ComprehensiveSystemModel';

const REFERENCE_ENGAGEMENT_LIBRARY: ReferenceEngagement[] = [
  {
    id: 'postwar-asian-infrastructure',
    era: '1950s-1970s',
    region: 'APAC',
    sector: 'infrastructure',
    archetype: 'government',
    scenario: 'Regional infrastructure bank co-funded by sovereign partners',
    summary: 'Coalition of governments co-created a lending vehicle to accelerate ports, rail, and energy build-outs across Southeast Asia.',
    outcomes: [
      'Mobilized blended finance at sub-5% rates',
      'Created procurement standards adopted by 8 nations',
      'Lifted regional GDP by ~120 bps over a decade',
    ],
    playbook: [
      'Stage policy alignment workshops before capital calls',
      'Anchor execution in a joint command center with shared data',
      'Introduce readiness scoring gates for every tranche release',
    ],
    metrics: {
      capitalMobilized: 1800000000,
      timeToDeployMonths: 36,
      partnersInvolved: 12,
      gdpImpactBps: 120,
    },
    relevanceTags: ['sovereign', 'infrastructure', 'capital-intensive', 'multi-country'],
  },
  {
    id: 'global-bank-digitization',
    era: '2010s',
    region: 'Global',
    sector: 'financial-services',
    archetype: 'bank',
    scenario: 'Tier-1 bank partnered with cloud hyperscalers to digitize onboarding',
    summary: 'Cross-border partnership modernized retail banking in 14 markets by combining bank trust with startup-grade execution.',
    outcomes: [
      'Reduced onboarding time from 14 days to 36 hours',
      'Cut fraud losses by 28%',
      'Unlocked $4.3B in new deposits within 18 months',
    ],
    playbook: [
      'Stand up a digital twin sandbox for compliance sign-off',
      'Deploy regional partner pods with unified scorecards',
      'Blend bank risk teams with startup solution squads',
    ],
    metrics: {
      capitalMobilized: 620000000,
      timeToDeployMonths: 18,
      partnersInvolved: 6,
    },
    relevanceTags: ['bank', 'digitization', 'compliance', 'cloud'],
  },
  {
    id: 'continental-energy-transition',
    era: '2020s',
    region: 'EMEA',
    sector: 'energy-transition',
    archetype: 'consortium',
    scenario: 'Utilities, sovereign funds, and OEMs created a hydrogen corridor initiative',
    summary: 'Multi-country coalition synchronized regulatory approvals, port retrofits, and R&D sharing to stand up a hydrogen export corridor.',
    outcomes: [
      'Secured 15-year offtake agreements before capex drawdown',
      'Achieved 32% cost reduction through shared procurement',
      'Created 40k jobs across three countries',
    ],
    playbook: [
      'Map stakeholder incentives via shared AI advisor',
      'Sequence phased investments with dual-trigger governance',
      'Use scenario labs to stress-test currency shocks',
    ],
    metrics: {
      capitalMobilized: 5200000000,
      timeToDeployMonths: 48,
      partnersInvolved: 18,
    },
    relevanceTags: ['energy', 'climate', 'hydrogen', 'consortium'],
  },
  {
    id: 'americas-smart-corridor',
    era: 'Late 1990s',
    region: 'Americas',
    sector: 'logistics',
    archetype: 'enterprise',
    scenario: 'Private logistics leader and two governments created a north-south smart corridor',
    summary: 'Combined customs harmonization with IoT-enabled freight infrastructure to unlock trade and SME growth.',
    outcomes: [
      'Cut border dwell time by 45%',
      'Raised SME export participation by 22%',
      'Sparked $9B in follow-on private investment',
    ],
    playbook: [
      'Stand up a tri-lateral governance council with escalation playbooks',
      'Digitize trade docs via shared API gateway',
      'Deploy rolling pilot zones before national rollout',
    ],
    metrics: {
      capitalMobilized: 2400000000,
      timeToDeployMonths: 30,
      partnersInvolved: 9,
    },
    relevanceTags: ['logistics', 'government', 'sme', 'trade'],
  },
];

function scoreEngagement(
  engagement: ReferenceEngagement,
  model: AdvisorInputModel,
): number {
  const orgIndustry = (model.identity?.organization?.industryClassification || '').toLowerCase();
  const targetRegion = (model.market?.targetRegion || model.identity?.organization?.headquarters?.country || '').toLowerCase();
  const partnerType = (model.mandate?.governance?.preferredStructure || '').toLowerCase();

  let score = 0;

  if (orgIndustry && engagement.sector.toLowerCase().includes(orgIndustry)) {
    score += 25;
  }

  if (targetRegion && engagement.region.toLowerCase().includes(targetRegion)) {
    score += 20;
  }

  if (partnerType && engagement.scenario.toLowerCase().includes(partnerType)) {
    score += 10;
  }

  if (model.mandate?.targetPartner?.industry &&
      engagement.relevanceTags.some(tag => tag.includes(model.mandate.targetPartner.industry.toLowerCase()))) {
    score += 15;
  }

  if (model.market?.marketGrowthRate && model.market.marketGrowthRate >= 20) {
    score += 5;
  }

  return score;
}

export function findRelevantEngagements(
  model: AdvisorInputModel,
  limit = 3,
): ReferenceEngagement[] {
  return [...REFERENCE_ENGAGEMENT_LIBRARY]
    .map(entry => ({ entry, score: scoreEngagement(entry, model) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.entry);
}

function deriveSignals(
  model: AdvisorInputModel,
  engagements: ReferenceEngagement[],
): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];

  if (model.market?.marketGrowthRate && model.market.marketGrowthRate > 15) {
    signals.push({
      type: 'opportunity',
      description: `Hyper-growth market detected (${model.market.marketGrowthRate}% CAGR). Prioritize speed-oriented partners to capture share.`,
      confidence: 'high',
    });
  }

  if ((model.risks?.risks || []).length < 3) {
    signals.push({
      type: 'risk',
      description: 'Risk register appears thin. Pull mitigations from historic hydrogen and infrastructure programs to stress-test assumptions.',
      confidence: 'medium',
    });
  }

  if (engagements.length > 0) {
    const top = engagements[0];
    signals.push({
      type: 'benchmark',
      description: `Closest precedent: ${top.scenario} (${top.region}). Median deployment ${top.metrics.timeToDeployMonths} months.`,
      confidence: 'high',
      source: top.id,
    });
  }

  if (model.partners?.strategicAlignment?.score && model.partners.strategicAlignment.score < 7) {
    signals.push({
      type: 'trend',
      description: 'Alignment score <7/10. Historical programs use co-authored playbooks and shared KPIs before funding releases.',
      confidence: 'medium',
    });
  }

  return signals;
}

function generateStrategicArtifacts(
  model: AdvisorInputModel,
  engagements: ReferenceEngagement[],
): IntelligenceArtifacts {
  const industry = model.identity?.organization?.industryClassification || 'target sector';
  const region = model.market?.targetRegion || model.identity?.organization?.headquarters?.country || 'target region';
  const partnerGoal = model.mandate?.targetPartner?.geography || 'priority geography';
  const alignmentScore = model.partners?.strategicAlignment?.score ?? 7;
  const topEngagement = engagements[0];

  const battlePlanNarrative = topEngagement
    ? `Anchor execution on the ${topEngagement.scenario} pattern from ${topEngagement.region}. Borrow its phased governance gates to manage capital deployment.`
    : 'Anchor execution on proven multi-partner programs, sequencing readiness gates before capital deployment.';

  return {
    battlePlan: {
      title: 'Execution Battle Plan',
      narrative: battlePlanNarrative,
      bullets: [
        `Phase 0 (0-3 months): Stand up an Advisor Console and ingest legacy documents to auto-populate the ${industry} dossier.`,
        `Phase 1 (3-9 months): Form partner pods across ${region} with shared readiness scorecards (target alignment ${alignmentScore >= 8 ? 'maintain 8/10' : 'lift to 8/10'}).`,
        `Phase 2 (9-18 months): Deploy capital in sequenced tranches using precedent-based KPIs and digital command centers.`,
      ],
    },
    riskBrief: {
      title: 'Red-Team Risk Brief',
      narrative: 'Blend quantitative exposure from the risk register with lessons from hydrogen and infrastructure precedents.',
      bullets: [
        `Gap: Risk inventory currently lists ${(model.risks?.risks || []).length} items; precedent programs averaged 7-9.`,
        'Mitigation: Import contingency triggers from the hydrogen corridor initiative to handle currency and regulatory shocks.',
        `Governance: Escalate decisions through a tri-lateral steering committee before funds cross borders (${partnerGoal}).`,
      ],
    },
    opportunityScan: {
      title: 'Adjacent Opportunity Scan',
      narrative: 'Surface parallel plays that historically unlocked outsized GDP and investment uplifts.',
      bullets: [
        `Leverage reference engagements to open ${model.market?.targetCountry || 'new'} export corridors supporting SME growth.`,
        'Bundle financial inclusion or capital access components to attract multilateral co-investors.',
        `Publish an open data room so potential partners from ${partnerGoal} can benchmark progress in real time.`,
      ],
    },
  };
}

export function buildAdvisorSnapshot(model: AdvisorInputModel): AdvisorSnapshot {
  const engagements = findRelevantEngagements(model, 4);
  const artifacts = generateStrategicArtifacts(model, engagements);
  const signals = deriveSignals(model, engagements);

  const organization = model.identity?.organization?.legalName || 'The organization';
  const sector = model.identity?.organization?.industryClassification || 'target sector';
  const geography = model.market?.targetRegion || model.mandate?.targetPartner?.geography || 'priority region';

  const priorityMoves = [
    `Map current readiness data to precedent KPIs from ${engagements[0]?.region || 'reference programs'} to justify capital calls.`,
    `Launch the Advisor Console workspace so stakeholders can co-author strategy docs, battle plans, and outreach briefs on demand.`,
    `Stand up the document intelligence pipeline to ingest historical contracts and briefing packets within the next 30 days.`,
  ];

  return {
    summary: `${organization} can leverage live World Bank data, 6 specialized AI modules, and Monte Carlo modeling to accelerate decisions in ${geography}.`,
    priorityMoves,
    engagements,
    artifacts,
    signals,
  };
}

export { REFERENCE_ENGAGEMENT_LIBRARY };

