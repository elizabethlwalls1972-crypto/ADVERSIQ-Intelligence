import { GlobalDataFabricService, type DataFabricSnapshot } from './GlobalDataFabricService';
import { PartnerIntelligenceEngine, type PartnerCandidate, type RankedPartner } from './PartnerIntelligenceEngine';
import { ProblemToSolutionGraphService, type ProblemToSolutionGraph } from './ProblemToSolutionGraphService';

export interface RegionalKernelInput {
  regionProfile: string;
  sector: string;
  constraints: string;
  fundingEnvelope: string;
  governanceContext: string;
  country: string;
  jurisdiction: string;
  objective: string;
  currentMatter: string;
  evidenceNotes: string[];
  partnerCandidates: PartnerCandidate[];
}

export interface RankedIntervention {
  title: string;
  rationale: string;
  score: number;
  requiredDocuments: string[];
  requiredLetters: string[];
}

export interface ExecutionPlanStage {
  stage: string;
  timeline: string;
  actions: string[];
  owners: string[];
  successMeasure: string;
}

export interface RegionalKernelResult {
  interventions: RankedIntervention[];
  partners: RankedPartner[];
  executionPlan: ExecutionPlanStage[];
  graph: ProblemToSolutionGraph;
  dataFabric: DataFabricSnapshot;
  governanceReadiness: number;
  notes: string[];
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export class RegionalDevelopmentOrchestrator {
  static run(input: RegionalKernelInput): RegionalKernelResult {
    const graph = ProblemToSolutionGraphService.buildGraph({
      currentMatter: input.currentMatter,
      objectives: input.objective,
      constraints: input.constraints,
      evidenceNotes: input.evidenceNotes
    });

    const dataFabric = GlobalDataFabricService.buildSnapshot(
      input.country,
      input.jurisdiction,
      [input.regionProfile, input.constraints, input.governanceContext, input.objective, ...input.evidenceNotes]
    );

    const rankedPartners = PartnerIntelligenceEngine.rankPartners({
      country: input.country,
      sector: input.sector,
      objective: input.objective,
      constraints: input.constraints,
      candidates: input.partnerCandidates
    });

    const interventions: RankedIntervention[] = [
      {
        title: 'Institutional Readiness Sprint',
        rationale: 'Close governance and evidence gaps before external engagement.',
        score: 88,
        requiredDocuments: ['Readiness Assessment', 'Governance Gap Register'],
        requiredLetters: ['Internal Alignment Letter']
      },
      {
        title: 'Partner Structuring and Risk Allocation',
        rationale: 'Use ranked partner signals to design feasible collaboration model.',
        score: 84,
        requiredDocuments: ['Partner Evaluation Matrix', 'Risk Allocation Memo'],
        requiredLetters: ['Partner Invitation Letter', 'Risk Disclosure Letter']
      },
      {
        title: 'Funding and Implementation Sequencing',
        rationale: 'Align funding envelope, execution stages, and measurable outcomes.',
        score: 82,
        requiredDocuments: ['Funding Structure Paper', 'Implementation Roadmap'],
        requiredLetters: ['Government/Bank Submission Letter']
      }
    ].sort((a, b) => b.score - a.score);

    const evidenceStrength = input.evidenceNotes.length > 0 ? Math.min(20, input.evidenceNotes.length * 4) : 0;
    const governanceSignals = /governance|compliance|regulat|policy/i.test(input.governanceContext) ? 12 : 4;
    const readiness = clamp(Math.round((dataFabric.overallConfidence * 100) * 0.55 + evidenceStrength + governanceSignals), 30, 98);

    const executionPlan: ExecutionPlanStage[] = [
      {
        stage: 'Sense + Analyze',
        timeline: 'Weeks 1-2',
        actions: ['Validate boundary, objective, and evidence sufficiency', 'Map root causes and bottlenecks'],
        owners: ['Program Lead', 'Policy Analyst'],
        successMeasure: 'Critical gap count reduced and graph accepted'
      },
      {
        stage: 'Plan + Govern',
        timeline: 'Weeks 3-4',
        actions: ['Select top interventions and partner shortlist', 'Run governance gate with legal/compliance checks'],
        owners: ['Governance Lead', 'Legal/Compliance Lead'],
        successMeasure: 'Governance readiness >= 80 and approved intervention slate'
      },
      {
        stage: 'Execute + Verify + Replan',
        timeline: 'Weeks 5-12',
        actions: ['Execute sequenced interventions', 'Track outcomes and trigger re-analysis on signal changes'],
        owners: ['Execution PMO', 'Monitoring & Evaluation'],
        successMeasure: 'Milestones met with variance control and updated adaptive plan'
      }
    ];

    const notes: string[] = [];
    if (dataFabric.overallFreshnessHours > 14) {
      notes.push('Signal freshness is aging; trigger re-analysis before external commitments.');
    }
    if (rankedPartners.length > 0 && rankedPartners[0].score.total < 70) {
      notes.push('Top partner score is weak; broaden partner universe or tighten scope.');
    }

    return {
      interventions,
      partners: rankedPartners,
      executionPlan,
      graph,
      dataFabric,
      governanceReadiness: readiness,
      notes
    };
  }
}
