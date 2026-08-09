/**
 * Runtime OS morphology builder.
 *
 * This converts an executed NSIL analysis into a graph that can be inspected by
 * MoGenWiringTransformer. The intent is to make the OS reason about its own
 * wiring: which engines fed which decisions, where weak bridges exist, and
 * which synthetic hard cases should be used to stress future runs.
 */

import type { ReportParameters } from '../../types';
import {
  MoGenWiringTransformer,
  type BrainWiringGraph,
  type WiringEdge,
  type WiringNode,
  type WiringTransformResult,
} from './mogen_wiring_transformer';

export interface RuntimeMorphologyInput {
  reportId: string;
  params: Partial<ReportParameters>;
  componentsRun: string[];
  inputStatus: string;
  recommendationAction: string;
  recommendationConfidence: number;
  hasPersonaAnalysis: boolean;
  hasCounterfactual: boolean;
  hasUnbiasedAnalysis: boolean;
  hasGlobalStandards: boolean;
  hasUniversalIntelligence: boolean;
  hasContinualHarness: boolean;
  hasReflexive: boolean;
}

export function buildRuntimeOSGraph(input: RuntimeMorphologyInput): BrainWiringGraph {
  const componentSet = new Set(input.componentsRun);
  const nodes: WiringNode[] = [
    node('input-shield', 'Input Shield', 'layer', 1, confidenceFromStatus(input.inputStatus), ['validation', input.inputStatus]),
    node('outcome-tracker', 'Outcome Tracker', 'memory', 2, present(componentSet, 'OutcomeTracker'), ['outcomes', 'learning']),
    node('parallel-core', 'Parallel Core Analysis', 'pipeline', 3, 0.85, ['fanout']),
    node('persona-engine', 'Persona Engine', 'agent', 4, input.hasPersonaAnalysis ? 0.86 : 0.25, ['debate', 'personas']),
    node('counterfactual-engine', 'Counterfactual Engine', 'agent', 4, input.hasCounterfactual ? 0.84 : 0.25, ['counterfactual', 'stress']),
    node('unbiased-analysis', 'Unbiased Analysis', 'judge', 4, input.hasUnbiasedAnalysis ? 0.82 : 0.25, ['balance']),
    node('global-standards', 'IFC Global Standards', 'judge', 4, input.hasGlobalStandards ? 0.8 : 0.25, ['compliance']),
    node('autonomous-layer', 'Autonomous Intelligence Layer', 'pipeline', 5, presentAny(componentSet, ['CreativeSynthesis', 'AutonomousGoal', 'ScenarioSimulation']), ['autonomous']),
    node('reflexive-layer', 'Reflexive Intelligence Layer', 'pipeline', 6, input.hasReflexive ? 0.82 : 0.25, ['self-model']),
    node('compound-intelligence', 'Compound Intelligence Orchestrator', 'pipeline', 7, input.hasUniversalIntelligence ? 0.84 : 0.25, ['universal', 'compound']),
    node('continual-harness', 'Continual Harness Bridge', 'pipeline', 8, input.hasContinualHarness ? 0.82 : 0.25, ['trajectory', 'refinement']),
    node('recommendation-synthesis', 'Recommendation Synthesis', 'layer', 9, clamp(input.recommendationConfidence / 100, 0, 1), [input.recommendationAction]),
    node('engine-versions', 'Engine Version Provenance', 'memory', 10, 0.9, ['audit']),
  ];

  const activeComponentNodes = input.componentsRun
    .filter(component => !nodes.some(n => n.id === slug(component)))
    .slice(0, 36)
    .map((component, index) =>
      node(slug(component), component, inferKind(component), 4 + (index % 6), 0.72, ['runtime-component'])
    );
  nodes.push(...activeComponentNodes);

  const edges: WiringEdge[] = [
    edge('input-shield', 'outcome-tracker', 'feeds'),
    edge('input-shield', 'parallel-core', 'feeds'),
    edge('parallel-core', 'persona-engine', 'feeds'),
    edge('parallel-core', 'counterfactual-engine', 'feeds'),
    edge('parallel-core', 'unbiased-analysis', 'feeds'),
    edge('parallel-core', 'global-standards', 'feeds'),
    edge('persona-engine', 'recommendation-synthesis', 'votes'),
    edge('counterfactual-engine', 'recommendation-synthesis', 'audits'),
    edge('unbiased-analysis', 'recommendation-synthesis', 'votes'),
    edge('global-standards', 'recommendation-synthesis', 'blocks'),
    edge('autonomous-layer', 'recommendation-synthesis', 'feeds'),
    edge('reflexive-layer', 'recommendation-synthesis', 'audits'),
    edge('compound-intelligence', 'recommendation-synthesis', 'feeds'),
    edge('continual-harness', 'recommendation-synthesis', 'repairs'),
    edge('recommendation-synthesis', 'engine-versions', 'stores'),
    edge('recommendation-synthesis', 'continual-harness', 'stores'),
  ];

  for (const component of activeComponentNodes) {
    const parent = parentForComponent(component.label ?? component.id);
    edges.push(edge(parent, component.id, 'calls', component.confidence));
    edges.push(edge(component.id, 'recommendation-synthesis', 'feeds', component.confidence));
  }

  return {
    id: `${input.reportId}-runtime-os-morphology`,
    nodes,
    edges,
    metadata: {
      source: 'NSILIntelligenceHub.runFullAnalysis',
      country: input.params.country || input.params.userCountry || input.params.region || 'Global',
      componentsRun: input.componentsRun.length,
      recommendationAction: input.recommendationAction,
      recommendationConfidence: input.recommendationConfidence,
    },
  };
}

export function assessRuntimeOSMorphology(input: RuntimeMorphologyInput): WiringTransformResult {
  const graph = buildRuntimeOSGraph(input);
  const transformer = new MoGenWiringTransformer();
  return transformer.transform(graph, {
    kNeighbors: 8,
    syntheticCases: 8,
    condition: {
      confidenceFloor: input.recommendationAction === 'do-not-proceed' ? 0 : 0.55,
      guidanceScale: 0.75,
      activeMask: { confidence: true, spread: false, center: false },
    },
  });
}

function node(
  id: string,
  label: string,
  kind: WiringNode['kind'],
  layer: number,
  confidence: number,
  tags: string[] = []
): WiringNode {
  return {
    id,
    label,
    kind,
    layer,
    confidence: clamp(confidence, 0, 1),
    weight: clamp(0.35 + confidence * 0.65, 0, 1),
    tags,
  };
}

function edge(source: string, target: string, kind: WiringEdge['kind'], confidence: number = 0.75): WiringEdge {
  return { source, target, kind, confidence: clamp(confidence, 0, 1), weight: clamp(confidence, 0.1, 1) };
}

function confidenceFromStatus(status: string): number {
  if (/reject/i.test(status)) return 0.15;
  if (/warning|review|conditional/i.test(status)) return 0.55;
  return 0.85;
}

function present(componentSet: Set<string>, component: string): number {
  return componentSet.has(component) ? 0.82 : 0.25;
}

function presentAny(componentSet: Set<string>, components: string[]): number {
  return components.some(component => componentSet.has(component)) ? 0.82 : 0.25;
}

function inferKind(component: string): WiringNode['kind'] {
  if (/store|memory|tracker|logger|version|provenance/i.test(component)) return 'memory';
  if (/gate|standards|shield|audit|detector|governance|tribunal|judge/i.test(component)) return 'judge';
  if (/orchestrator|pipeline|harness|bridge/i.test(component)) return 'pipeline';
  if (/formula|index|score|monte|financial|risk/i.test(component)) return 'formula';
  if (/search|retrieval|tool|api|data|fabric/i.test(component)) return 'tool';
  return 'agent';
}

function parentForComponent(component: string): string {
  if (/persona|counterfactual|unbiased|standards/i.test(component)) return 'parallel-core';
  if (/creative|crossdomain|goal|ethical|emotional|scenario|adaptive|evolving/i.test(component)) return 'autonomous-layer';
  if (/reflexive|signal|echo|lifecycle|mirror|identity|translation|latent/i.test(component)) return 'reflexive-layer';
  if (/globalnsil|trajectory|failure|refiner|harness/i.test(component)) return 'continual-harness';
  if (/compound|impossibility|cascade|social|antifragility|temporal/i.test(component)) return 'compound-intelligence';
  return 'parallel-core';
}

function slug(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}
