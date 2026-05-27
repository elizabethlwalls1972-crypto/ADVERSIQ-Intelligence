export interface CaseGraphNode {
  id: string;
  type: 'fact' | 'stakeholder' | 'risk' | 'objective' | 'constraint' | 'evidence' | 'jurisdiction';
  label: string;
  confidence: number;
  source: string;
}

export interface CaseGraphEdge {
  from: string;
  to: string;
  relation: 'supports' | 'constrains' | 'influences' | 'requires' | 'targets';
  weight: number;
}

export interface CaseGraph {
  nodes: CaseGraphNode[];
  edges: CaseGraphEdge[];
  summary: {
    evidenceStrength: number;
    stakeholderCoverage: number;
    riskDensity: number;
    objectiveClarity: number;
    confidence: number;
  };
}

export interface CaseGraphInput {
  userName?: string;
  organizationName?: string;
  organizationType?: string;
  contactRole?: string;
  country?: string;
  jurisdiction?: string;
  organizationMandate?: string;
  targetAudience?: string;
  situationType?: string;
  currentMatter?: string;
  objectives?: string;
  constraints?: string;
  decisionDeadline?: string;
  uploadedDocuments?: string[];
  additionalContext?: string[];
  aiInsights?: string[];
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const sentenceChunks = (text: string): string[] =>
  text
    .split(/[\n.!?]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 10)
    .slice(0, 8);

const containsAny = (value: string, terms: string[]) =>
  terms.some((term) => value.toLowerCase().includes(term));

export class CaseGraphBuilder {
  static build(input: CaseGraphInput): CaseGraph {
    const nodes: CaseGraphNode[] = [];
    const edges: CaseGraphEdge[] = [];

    const addNode = (node: CaseGraphNode) => {
      nodes.push(node);
      return node.id;
    };

    const matterText = input.currentMatter || '';
    const objectiveText = input.objectives || '';
    const constraintText = input.constraints || '';

    const jurisdictionId = addNode({
      id: 'jurisdiction',
      type: 'jurisdiction',
      label: `${input.country || 'Unknown country'} / ${input.jurisdiction || 'Unknown jurisdiction'}`,
      confidence: input.country || input.jurisdiction ? 75 : 20,
      source: 'intake'
    });

    const objectiveId = addNode({
      id: 'objective-primary',
      type: 'objective',
      label: objectiveText || 'Objective not fully defined',
      confidence: clamp(objectiveText.length * 1.2, 20, 95),
      source: 'intake'
    });

    const constraintId = addNode({
      id: 'constraint-primary',
      type: 'constraint',
      label: constraintText || 'Constraints not fully defined',
      confidence: clamp(constraintText.length, 15, 90),
      source: 'intake'
    });

    edges.push({ from: constraintId, to: objectiveId, relation: 'constrains', weight: 0.8 });
    edges.push({ from: jurisdictionId, to: objectiveId, relation: 'requires', weight: 0.7 });

    const stakeholders = sentenceChunks(matterText)
      .flatMap((segment) => segment.match(/\b(board|investor|regulator|agency|ministry|partner|community|court|legal|customer|supplier|bank)\b/gi) || [])
      .map((match) => match.toLowerCase())
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .slice(0, 6);

    stakeholders.forEach((stakeholder, index) => {
      const stakeholderId = addNode({
        id: `stakeholder-${index}`,
        type: 'stakeholder',
        label: stakeholder,
        confidence: 70,
        source: 'matter-extraction'
      });
      edges.push({ from: stakeholderId, to: objectiveId, relation: 'targets', weight: 0.65 });
    });

    const riskTerms = ['risk', 'delay', 'dispute', 'compliance', 'approval', 'exposure', 'penalty', 'uncertain'];
    sentenceChunks(`${matterText}. ${constraintText}`).forEach((segment, index) => {
      if (containsAny(segment, riskTerms)) {
        const riskId = addNode({
          id: `risk-${index}`,
          type: 'risk',
          label: segment,
          confidence: 68,
          source: 'matter-extraction'
        });
        edges.push({ from: riskId, to: objectiveId, relation: 'influences', weight: 0.75 });
      }
    });

    sentenceChunks(matterText).forEach((segment, index) => {
      const factId = addNode({
        id: `fact-${index}`,
        type: 'fact',
        label: segment,
        confidence: 60,
        source: 'matter-extraction'
      });
      edges.push({ from: factId, to: objectiveId, relation: 'supports', weight: 0.6 });
    });

    (input.uploadedDocuments || []).forEach((doc, index) => {
      const evidenceId = addNode({
        id: `evidence-${index}`,
        type: 'evidence',
        label: doc,
        confidence: 75,
        source: 'upload'
      });
      edges.push({ from: evidenceId, to: objectiveId, relation: 'supports', weight: 0.85 });
    });

    const evidenceStrength = clamp(
      (nodes.filter((node) => node.type === 'evidence').length * 20) +
        (nodes.filter((node) => node.type === 'fact').length * 6),
      0,
      100
    );

    const stakeholderCoverage = clamp(nodes.filter((node) => node.type === 'stakeholder').length * 20, 0, 100);
    const riskDensity = clamp(nodes.filter((node) => node.type === 'risk').length * 16, 0, 100);
    const objectiveClarity = clamp(objectiveText.length * 1.4, 0, 100);

    const confidence = clamp(
      (evidenceStrength * 0.3) +
        (stakeholderCoverage * 0.2) +
        (riskDensity * 0.2) +
        (objectiveClarity * 0.3)
    );

    return {
      nodes,
      edges,
      summary: {
        evidenceStrength,
        stakeholderCoverage,
        riskDensity,
        objectiveClarity,
        confidence
      }
    };
  }
}

export default CaseGraphBuilder;
