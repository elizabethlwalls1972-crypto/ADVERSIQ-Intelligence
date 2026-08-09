import { ReportOrchestrator } from './ReportOrchestrator';
import { GovernanceService } from './GovernanceService';
import { ReportParameters, ReportPayload } from '../types';
import { ConsultantGateService } from './ConsultantGateService';
import { RegionalDevelopmentOrchestrator } from './RegionalDevelopmentOrchestrator';
import type { PartnerCandidate } from './PartnerIntelligenceEngine';

export type PhaseStatus = 'pending' | 'passed' | 'failed' | 'blocked';

export interface PhaseResult {
  name: string;
  status: PhaseStatus;
  reason?: string;
  remediation?: string[];
}

export interface ControlRule {
  metric: string;
  threshold: string;
  action: string;
}

export interface ActionItem {
  title: string;
  owner?: string;
  due?: string;
  criteria?: string;
}

export interface DecisionPacket {
  runId: string;
  generatedAt: string;
  mode: 'online' | 'offline';
  scenario: {
    type: string;
    location?: string;
    intent: string[];
    requiredFeeds: string[];
    gate: { ok: boolean; blockers: string[] };
  };
  phases: PhaseResult[];
  scores?: {
    overall?: number;
    spi?: number;
    rroi?: number;
    synergy?: number;
    dependency?: number;
  };
  risks?: { risk: string; mitigation: string; metric?: string }[];
  controls: ControlRule[];
  actions: ActionItem[];
  evidence: string[];
  exports: { loiReady: boolean; reportReady: boolean; blockers: string[] };
}

export class DecisionPipeline {
  private static readonly regionalPartners: PartnerCandidate[] = [
    { id: 'gov-dev-agency', name: 'Development Agency', type: 'government', countries: ['philippines', 'australia', 'new zealand', 'united kingdom', 'united states'], sectors: ['regional development', 'policy', 'infrastructure'] },
    { id: 'multilateral-bank', name: 'Multilateral Bank', type: 'multilateral', countries: ['philippines', 'australia', 'new zealand', 'united kingdom', 'united states'], sectors: ['energy', 'housing', 'digital', 'health', 'infrastructure'] },
    { id: 'banking-consortium', name: 'Banking Consortium', type: 'bank', countries: ['philippines', 'australia', 'new zealand', 'united kingdom'], sectors: ['banking', 'trade', 'housing', 'energy'] },
    { id: 'delivery-partner', name: 'Delivery Partner', type: 'corporate', countries: ['philippines', 'australia', 'new zealand', 'united kingdom'], sectors: ['logistics', 'infrastructure', 'digital'] }
  ];

  static async run(params: ReportParameters): Promise<{ packet: DecisionPacket; payload?: ReportPayload }> {
    const now = new Date().toISOString();
    const phases: PhaseResult[] = [];
    const mode: 'online' | 'offline' = process.env.API_BASE_URL ? 'online' : 'offline';

    const requiredFeeds = this.resolveFeeds(params);
    const scenarioGateBlockers = this.resolveGateBlockers(params, requiredFeeds);
    const gateOk = scenarioGateBlockers.length === 0;
    phases.push({
      name: 'governance-gate',
      status: gateOk ? 'passed' : 'blocked',
      reason: gateOk ? undefined : 'Missing required inputs',
      remediation: gateOk ? undefined : scenarioGateBlockers
    });
    if (!gateOk) {
      return {
        packet: {
          runId: params.id,
          generatedAt: now,
          mode,
          scenario: this.buildScenario(params, requiredFeeds, scenarioGateBlockers),
          phases,
          controls: [],
          actions: [],
          evidence: [],
          exports: { loiReady: false, reportReady: false, blockers: scenarioGateBlockers }
        }
      };
    }

    const dataIssues = requiredFeeds.filter(feed => !feed || feed.trim().length === 0);
    const dataOk = dataIssues.length === 0;
    phases.push({
      name: 'data-readiness',
      status: dataOk ? 'passed' : 'blocked',
      reason: dataOk ? undefined : 'Missing data feeds',
      remediation: dataOk ? undefined : dataIssues.map(feed => `Provide feed: ${feed || 'unknown'}`)
    });
    if (!dataOk) {
      return {
        packet: {
          runId: params.id,
          generatedAt: now,
          mode,
          scenario: this.buildScenario(params, requiredFeeds, dataIssues),
          phases,
          controls: [],
          actions: [],
          evidence: [],
          exports: { loiReady: false, reportReady: false, blockers: dataIssues }
        }
      };
    }

    phases.push({ name: 'model-bundle-selected', status: 'passed' });

    const consultantGate = ConsultantGateService.evaluate(params);
    if (!consultantGate.isReady) {
      phases.push({
        name: 'consultant-gate',
        status: 'blocked',
        reason: 'Consultant-grade intake is incomplete',
        remediation: consultantGate.missing
      });

      return {
        packet: {
          runId: params.id,
          generatedAt: now,
          mode,
          scenario: this.buildScenario(params, requiredFeeds, []),
          phases,
          controls: [],
          actions: [],
          evidence: [],
          exports: { loiReady: false, reportReady: false, blockers: consultantGate.missing }
        }
      };
    }

    const caseMethodGaps = this.evaluateCaseMethodGaps(params);
    if (caseMethodGaps.length > 0) {
      phases.push({
        name: 'case-method-layer',
        status: 'blocked',
        reason: 'Case Study Method Layer incomplete',
        remediation: caseMethodGaps
      });

      return {
        packet: {
          runId: params.id,
          generatedAt: now,
          mode,
          scenario: this.buildScenario(params, requiredFeeds, []),
          phases,
          controls: [],
          actions: [],
          evidence: [],
          exports: { loiReady: false, reportReady: false, blockers: caseMethodGaps }
        }
      };
    }

    const regionalKernel = RegionalDevelopmentOrchestrator.run({
      regionProfile: params.region || params.organizationType || params.problemStatement || '',
      sector: params.industry && params.industry.length > 0 ? params.industry[0] : 'regional development',
      constraints: params.riskTolerance ? String(params.riskTolerance) : 'Not specified',
      fundingEnvelope: params.dealSize || 'Not specified',
      governanceContext: [params.organizationType, params.entityClassification, params.userDepartment].filter(Boolean).join(' '),
      country: params.country || params.userCountry || 'unspecified',
      jurisdiction: params.region || params.country || 'unspecified',
      objective: params.problemStatement || params.reportName,
      currentMatter: params.problemStatement || params.reportName,
      evidenceNotes: [
        ...(params.strategicIntent || []),
        ...(params.additionalContext ? [params.additionalContext] : [])
      ].slice(0, 10),
      partnerCandidates: this.regionalPartners
    });

    if (regionalKernel.governanceReadiness < 75) {
      const blockers = [
        `Regional kernel readiness ${regionalKernel.governanceReadiness}% is below threshold`,
        ...(regionalKernel.notes.length > 0 ? regionalKernel.notes : [])
      ];

      phases.push({
        name: 'regional-kernel-gate',
        status: 'blocked',
        reason: 'Regional Development Kernel threshold not met',
        remediation: blockers
      });

      return {
        packet: {
          runId: params.id,
          generatedAt: now,
          mode,
          scenario: this.buildScenario(params, requiredFeeds, []),
          phases,
          controls: [],
          actions: [],
          evidence: [],
          exports: { loiReady: false, reportReady: false, blockers }
        }
      };
    }

    let payload: ReportPayload | undefined;
    try {
      payload = await ReportOrchestrator.assembleReportPayload(params);
      phases.push({ name: 'orchestration-run', status: 'passed' });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      phases.push({ name: 'orchestration-run', status: 'failed', reason });
      return {
        packet: {
          runId: params.id,
          generatedAt: now,
          mode,
          scenario: this.buildScenario(params, requiredFeeds, []),
          phases,
          controls: [],
          actions: [],
          evidence: [],
          exports: { loiReady: false, reportReady: false, blockers: [reason] }
        }
      };
    }

    const controls = this.buildControls(payload);
    phases.push({ name: 'controls-bound', status: 'passed' });

    const actions = this.buildActions(payload);
    phases.push({ name: 'decision-packet-assembled', status: 'passed' });

    const evidence = this.buildEvidence(payload);
    const validation = ReportOrchestrator.validatePayload(payload);
    const exports = {
      loiReady: validation.isComplete,
      reportReady: validation.isComplete,
      blockers: validation.missingFields
    };

    const packet: DecisionPacket = {
      runId: params.id,
      generatedAt: now,
      mode,
      scenario: this.buildScenario(params, requiredFeeds, []),
      phases,
      scores: this.buildScores(payload),
      risks: this.buildRisks(payload),
      controls,
      actions,
      evidence,
      exports
    };

    try {
      await GovernanceService.recordProvenance({
        reportId: params.id,
        artifact: 'decision-packet',
        action: 'assembled',
        actor: 'DecisionPipeline',
        source: 'pipeline',
        tags: ['decision-packet', 'live-run']
      });
    } catch {
      // Provenance logging is non-blocking; continue without failing the packet assembly
    }

    return { packet, payload };
  }

  private static resolveFeeds(params: ReportParameters): string[] {
    const baseFeeds = [
      'DOTr port time-stamps',
      'PSA fisheries situationer',
      'DA advisory',
      'DOF trade anomaly alerts',
      'LGU permit queue exports'
    ];
    if (params.additionalContext) {
      baseFeeds.push('Context note: ' + params.additionalContext);
    }
    return baseFeeds;
  }

  private static resolveGateBlockers(params: ReportParameters, feeds: string[]): string[] {
    const blockers: string[] = [];
    if (!params.problemStatement) blockers.push('Add a problem statement');
    if (!params.country) blockers.push('Select a country');
    if (!params.region) blockers.push('Select a region');
    if (feeds.length === 0) blockers.push('Define required data feeds');
    return blockers;
  }

  private static buildScenario(params: ReportParameters, feeds: string[], blockers: string[]) {
    return {
      type: params.intelligenceCategory || 'Strategic Intelligence',
      location: [params.userCity, params.country].filter(Boolean).join(', '),
      intent: params.strategicIntent || [],
      requiredFeeds: feeds,
      gate: { ok: blockers.length === 0, blockers }
    };
  }

  private static buildScores(payload: ReportPayload) {
    const spi = payload.computedIntelligence?.spi?.spi;
    const rroi = payload.computedIntelligence?.rroi?.overallScore;
    const synergy = payload.confidenceScores?.symbioticFit;
    const dependency = payload.risks?.operational?.supplyChainDependency;
    return {
      overall: payload.confidenceScores?.overall,
      spi,
      rroi,
      synergy,
      dependency
    };
  }

  private static buildRisks(payload: ReportPayload) {
    const risks: { risk: string; mitigation: string; metric?: string }[] = [];
    if (payload.risks?.operational?.supplyChainDependency !== undefined) {
      risks.push({
        risk: 'Supply chain dependency',
        metric: String(payload.risks.operational.supplyChainDependency),
        mitigation: 'Telemetry enforcement and diversified sourcing'
      });
    }
    if (payload.risks?.regulatory?.regulatoryFriction !== undefined) {
      risks.push({
        risk: 'Regulatory friction',
        metric: String(payload.risks.regulatory.regulatoryFriction),
        mitigation: 'Fast lane permitting and trustee oversight'
      });
    }
    return risks;
  }

  private static buildControls(payload: ReportPayload): ControlRule[] {
    const controls: ControlRule[] = [];
    const dependency = payload.risks?.operational?.supplyChainDependency;
    if (dependency !== undefined) {
      controls.push({
        metric: 'Supply chain dependency',
        threshold: '>= 40%',
        action: 'Activate telemetry lane and escrow before spend'
      });
    }
    if (payload.economicSignals?.tariffSensitivity !== undefined) {
      controls.push({
        metric: 'Tariff sensitivity',
        threshold: '>= 30/100',
        action: 'Enable customs fast lane and seal workflows'
      });
    }
    if (payload.confidenceScores?.overall !== undefined) {
      controls.push({
        metric: 'Overall confidence',
        threshold: '< 50/100',
        action: 'Hold exports and request additional evidence pack'
      });
    }
    return controls;
  }

  private static buildActions(payload: ReportPayload): ActionItem[] {
    const actions: ActionItem[] = [];
    const roadmap = payload.computedIntelligence?.seam?.score ? [
      { title: 'Pilot telemetry and trustee evidence pack', owner: 'Trustee', due: 'Week 1' },
      { title: 'Customs integration and HACCP validation', owner: 'Customs liaison', due: 'Week 4' },
      { title: 'Export corridor scale and financing close', owner: 'Investment committee', due: 'Month 6' }
    ] : [];
    actions.push(...roadmap);
    return actions;
  }

  private static buildEvidence(payload: ReportPayload): string[] {
    const evidence: string[] = [];
    evidence.push('NSIL run log');
    evidence.push('Telemetry snapshot');
    evidence.push('Data provenance sheet');
    if (payload.metadata?.dataSources?.length) {
      evidence.push(...payload.metadata.dataSources);
    }
    return Array.from(new Set(evidence));
  }

  private static evaluateCaseMethodGaps(params: ReportParameters): string[] {
    const gaps: string[] = [];

    if (!params.problemStatement || params.problemStatement.trim().length < 60) gaps.push('Boundary clarity');

    const objectiveStrength = (params.strategicIntent || []).join(' ').trim().length;
    if (objectiveStrength < 20) gaps.push('Objective quality');

    const hasEvidence = Boolean(params.additionalContext?.trim()) || (params.ingestedDocuments?.length || 0) > 0;
    if (!hasEvidence) gaps.push('Evidence sufficiency');

    const hasRival = /counterfactual|alternative|rival|other option/i.test(`${params.additionalContext || ''} ${(params.collaborativeNotes || '')}`);
    if (!hasRival) gaps.push('Rival explanations');

    const hasImplementation = Boolean(params.expansionTimeline?.trim()) && /owner|go-no-go|critical path|authority|escalation/i.test(
      `${params.criticalPath || ''} ${params.goNoGoCriteria || ''} ${params.authorityMatrix || ''} ${params.escalationProcedures || ''}`
    );
    if (!hasImplementation) gaps.push('Implementation feasibility');

    return gaps;
  }
}

