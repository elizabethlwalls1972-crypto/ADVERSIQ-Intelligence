export interface ProblemNode {
  id: string;
  type: 'root-cause' | 'bottleneck' | 'leverage-point';
  label: string;
  evidence: string[];
  interventions: string[];
  requiredOutputs: string[];
}

export interface ProblemToSolutionGraph {
  graphId: string;
  generatedAt: string;
  rootCauses: ProblemNode[];
  bottlenecks: ProblemNode[];
  leveragePoints: ProblemNode[];
}

const id = () => Math.random().toString(36).slice(2, 10);

export class ProblemToSolutionGraphService {
  static buildGraph(input: {
    currentMatter: string;
    objectives: string;
    constraints: string;
    evidenceNotes: string[];
  }): ProblemToSolutionGraph {
    const evidence = input.evidenceNotes.length > 0 ? input.evidenceNotes : ['No evidence uploaded yet'];
    const matter = input.currentMatter || 'Case matter not yet detailed';
    const objective = input.objectives || 'Objective not yet specified';
    const constraints = input.constraints || 'Constraint profile not yet specified';

    const rootCauses: ProblemNode[] = [
      {
        id: `rc-${id()}`,
        type: 'root-cause',
        label: matter.length > 140 ? `${matter.slice(0, 137)}...` : matter,
        evidence,
        interventions: [
          'Define clear intervention boundary with measurable outcomes.',
          'Anchor strategy to institutional decision criteria.'
        ],
        requiredOutputs: ['Problem Definition Brief', 'Decision Boundary Note']
      },
      {
        id: `rc-${id()}`,
        type: 'root-cause',
        label: objective,
        evidence,
        interventions: [
          'Convert objective to measurable targets and milestone checkpoints.',
          'Align objective with funding and governance constraints.'
        ],
        requiredOutputs: ['Objective Scorecard', 'Executive Decision Memo']
      }
    ];

    const bottlenecks: ProblemNode[] = [
      {
        id: `bn-${id()}`,
        type: 'bottleneck',
        label: constraints,
        evidence,
        interventions: [
          'Create bottleneck resolution plan with owners and deadlines.',
          'Stress-test bottlenecks under downside scenarios.'
        ],
        requiredOutputs: ['Bottleneck Action Register', 'Risk Stress-Test Annex']
      }
    ];

    const leveragePoints: ProblemNode[] = [
      {
        id: `lp-${id()}`,
        type: 'leverage-point',
        label: 'Policy and partner alignment leverage',
        evidence,
        interventions: [
          'Sequence government, banking, and corporate engagements by highest impact first.',
          'Use targeted letters to unlock approvals and financing commitments.'
        ],
        requiredOutputs: ['Partner Strategy Pack', 'Government/Banking Letter Bundle']
      }
    ];

    return {
      graphId: `pts-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      rootCauses,
      bottlenecks,
      leveragePoints
    };
  }
}
