/**
 * MoGenWiringTransformer
 *
 * MoGen-inspired structural adapter for NSIL brains and pipeline wiring.
 *
 * The source paper models neuron fragments as sparse 3D point clouds, injects
 * local k-nearest-neighbor context, scores generated shapes with interpretable
 * geometric/topological metrics, and improves a downstream classifier with
 * synthetic hard cases. This module adapts that pattern to software cognition:
 * agents, layers, tools, memories, and pipelines become a sparse wiring graph.
 */

export type WiringNodeKind =
  | 'agent'
  | 'layer'
  | 'tool'
  | 'memory'
  | 'formula'
  | 'judge'
  | 'pipeline'
  | 'external';

export type WiringEdgeKind =
  | 'calls'
  | 'feeds'
  | 'audits'
  | 'votes'
  | 'stores'
  | 'retrieves'
  | 'blocks'
  | 'repairs';

export interface WiringNode {
  id: string;
  label?: string;
  kind: WiringNodeKind;
  layer?: number;
  weight?: number;
  confidence?: number;
  tags?: string[];
  position?: Point3D;
}

export interface WiringEdge {
  source: string;
  target: string;
  kind: WiringEdgeKind;
  weight?: number;
  confidence?: number;
}

export interface BrainWiringGraph {
  id: string;
  nodes: WiringNode[];
  edges: WiringEdge[];
  metadata?: Record<string, unknown>;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface WiringPoint extends Point3D {
  nodeId: string;
  kind: WiringNodeKind;
  degree: number;
  inDegree: number;
  outDegree: number;
  weight: number;
  confidence: number;
}

export interface LocalGeometryContext {
  point: WiringPoint;
  neighbors: Array<{
    nodeId: string;
    dx: number;
    dy: number;
    dz: number;
    distance: number;
  }>;
  density: number;
  localCoherence: number;
}

export interface WiringMorphologyMetrics {
  centerDistance: number;
  spread: {
    x: number;
    y: number;
    z: number;
    xy: number;
    xz: number;
    yz: number;
  };
  nearestNeighbor: { mean: number; std: number };
  farthestNeighbor: { mean: number; std: number };
  mst: {
    totalWeight: number;
    longestEdge: number;
    leaves: number;
    disconnectedRisk: number;
  };
  topology: {
    hubRatio: number;
    sinkRatio: number;
    sourceRatio: number;
    branchiness: number;
  };
}

export interface WiringCondition {
  targetCenter?: Partial<Point3D>;
  targetSpread?: Partial<Record<'x' | 'y' | 'z', number>>;
  branchiness?: number;
  hubPressure?: number;
  confidenceFloor?: number;
  activeMask?: Partial<Record<'center' | 'spread' | 'branchiness' | 'hubPressure' | 'confidence', boolean>>;
  guidanceScale?: number;
}

export interface WiringAnomaly {
  type: 'dust' | 'overmerge' | 'bottleneck' | 'low_confidence_bridge' | 'underconnected_sink';
  severity: number;
  nodeIds: string[];
  reason: string;
  repairHint: string;
}

export interface WiringTransformResult {
  graphId: string;
  points: WiringPoint[];
  localContext: LocalGeometryContext[];
  metrics: WiringMorphologyMetrics;
  anomalies: WiringAnomaly[];
  syntheticHardCases: BrainWiringGraph[];
  recommendations: string[];
}

export interface TransformOptions {
  kNeighbors?: number;
  syntheticCases?: number;
  condition?: WiringCondition;
}

const KIND_AXIS: Record<WiringNodeKind, number> = {
  agent: 0.9,
  layer: 0.65,
  tool: 0.4,
  memory: 0.15,
  formula: -0.1,
  judge: -0.35,
  pipeline: -0.6,
  external: -0.85,
};

export class MoGenWiringTransformer {
  transform(graph: BrainWiringGraph, options: TransformOptions = {}): WiringTransformResult {
    const points = this.graphToPointCloud(graph, options.condition);
    const localContext = this.injectLocalContext(points, options.kNeighbors ?? 6);
    const metrics = this.evaluate(points);
    const anomalies = this.detectAnomalies(points, metrics);
    const syntheticHardCases = this.generateSyntheticHardCases(graph, options.syntheticCases ?? 4);

    return {
      graphId: graph.id,
      points,
      localContext,
      metrics,
      anomalies,
      syntheticHardCases,
      recommendations: this.recommendRepairs(anomalies, metrics),
    };
  }

  graphToPointCloud(graph: BrainWiringGraph, condition: WiringCondition = {}): WiringPoint[] {
    const degrees = this.computeDegrees(graph);
    const layerValues = graph.nodes.map(n => n.layer ?? 0);
    const minLayer = Math.min(...layerValues, 0);
    const maxLayer = Math.max(...layerValues, 1);
    const layerSpan = Math.max(1, maxLayer - minLayer);

    const raw = graph.nodes.map((node, index) => {
      const degree = degrees.get(node.id) ?? { inDegree: 0, outDegree: 0 };
      const totalDegree = degree.inDegree + degree.outDegree;
      const angle = (index / Math.max(1, graph.nodes.length)) * Math.PI * 2;
      const layer = ((node.layer ?? 0) - minLayer) / layerSpan;
      const radius = 0.25 + Math.min(totalDegree, 12) / 12;
      const explicit = node.position;

      return {
        nodeId: node.id,
        kind: node.kind,
        x: explicit?.x ?? Math.cos(angle) * radius,
        y: explicit?.y ?? layer * 2 - 1,
        z: explicit?.z ?? KIND_AXIS[node.kind] + Math.sin(angle) * radius * 0.35,
        degree: totalDegree,
        inDegree: degree.inDegree,
        outDegree: degree.outDegree,
        weight: clamp(node.weight ?? 1, 0, 1),
        confidence: clamp(node.confidence ?? 0.75, 0, 1),
      };
    });

    return this.applyCondition(raw, condition);
  }

  injectLocalContext(points: WiringPoint[], k: number = 6): LocalGeometryContext[] {
    return points.map(point => {
      const neighbors = points
        .filter(candidate => candidate.nodeId !== point.nodeId)
        .map(candidate => ({
          nodeId: candidate.nodeId,
          dx: candidate.x - point.x,
          dy: candidate.y - point.y,
          dz: candidate.z - point.z,
          distance: distance(point, candidate),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, Math.max(1, k));

      const meanDistance = mean(neighbors.map(n => n.distance));
      const sameKind = neighbors.filter(n => points.find(p => p.nodeId === n.nodeId)?.kind === point.kind).length;

      return {
        point,
        neighbors,
        density: meanDistance === 0 ? 1 : 1 / meanDistance,
        localCoherence: neighbors.length === 0 ? 0 : sameKind / neighbors.length,
      };
    });
  }

  modifiedCosineSchedule(u: number): number {
    const v = clamp(u, 0, 1);
    if (v < 0.5) return 0.5 * Math.pow(1 - Math.cos(Math.PI * v), 2);
    return 1 - 0.5 * Math.pow(1 + Math.cos(Math.PI * v), 2);
  }

  evaluate(points: WiringPoint[]): WiringMorphologyMetrics {
    if (points.length === 0) {
      return emptyMetrics();
    }

    const center = {
      x: mean(points.map(p => p.x)),
      y: mean(points.map(p => p.y)),
      z: mean(points.map(p => p.z)),
    };
    const centered = points.map(p => ({ x: p.x - center.x, y: p.y - center.y, z: p.z - center.z }));
    const nearest = points.map((p, i) => min(points.map((q, j) => i === j ? Number.POSITIVE_INFINITY : distance(p, q))));
    const farthest = points.map((p, i) => max(points.map((q, j) => i === j ? 0 : distance(p, q))));
    const mst = this.minimumSpanningTree(points);
    const degrees = new Map<string, number>();
    for (const edge of mst.edges) {
      degrees.set(edge.a, (degrees.get(edge.a) ?? 0) + 1);
      degrees.set(edge.b, (degrees.get(edge.b) ?? 0) + 1);
    }

    return {
      centerDistance: Math.sqrt(center.x ** 2 + center.y ** 2 + center.z ** 2),
      spread: {
        x: variance(centered.map(p => p.x)),
        y: variance(centered.map(p => p.y)),
        z: variance(centered.map(p => p.z)),
        xy: covariance(centered.map(p => p.x), centered.map(p => p.y)),
        xz: covariance(centered.map(p => p.x), centered.map(p => p.z)),
        yz: covariance(centered.map(p => p.y), centered.map(p => p.z)),
      },
      nearestNeighbor: { mean: mean(nearest), std: std(nearest) },
      farthestNeighbor: { mean: mean(farthest), std: std(farthest) },
      mst: {
        totalWeight: mst.totalWeight,
        longestEdge: mst.longestEdge,
        leaves: Array.from(degrees.values()).filter(v => v <= 1).length,
        disconnectedRisk: clamp(mst.longestEdge / Math.max(mst.totalWeight / Math.max(1, points.length - 1), 0.0001) / 10, 0, 1),
      },
      topology: {
        hubRatio: points.filter(p => p.degree >= 6).length / points.length,
        sinkRatio: points.filter(p => p.outDegree === 0 && p.inDegree > 0).length / points.length,
        sourceRatio: points.filter(p => p.inDegree === 0 && p.outDegree > 0).length / points.length,
        branchiness: mst.edges.length === 0 ? 0 : Array.from(degrees.values()).filter(v => v <= 1).length / points.length,
      },
    };
  }

  detectAnomalies(points: WiringPoint[], metrics: WiringMorphologyMetrics): WiringAnomaly[] {
    const anomalies: WiringAnomaly[] = [];
    const nn = points.map(point => ({
      point,
      nearest: min(points.filter(p => p.nodeId !== point.nodeId).map(p => distance(point, p))),
    }));
    const nnMean = mean(nn.map(v => Number.isFinite(v.nearest) ? v.nearest : 0));
    const nnStd = std(nn.map(v => Number.isFinite(v.nearest) ? v.nearest : 0));

    for (const item of nn) {
      if (item.nearest > nnMean + nnStd * 2.5) {
        anomalies.push({
          type: 'dust',
          severity: clamp(item.nearest / Math.max(nnMean + nnStd, 0.0001) - 1, 0, 1),
          nodeIds: [item.point.nodeId],
          reason: 'Node is geometrically isolated from its nearest structural neighbors.',
          repairHint: 'Attach through an explicit audit/feed edge or move it into a dedicated external boundary.',
        });
      }
    }

    for (const point of points) {
      if (point.degree >= 8 && point.confidence < 0.7) {
        anomalies.push({
          type: 'overmerge',
          severity: clamp(point.degree / 12 + (0.7 - point.confidence), 0, 1),
          nodeIds: [point.nodeId],
          reason: 'Low-confidence node is acting as a high-degree hub.',
          repairHint: 'Split hub responsibilities into agent, memory, and verifier nodes with separate gates.',
        });
      }

      if (point.outDegree === 0 && point.inDegree >= 3) {
        anomalies.push({
          type: 'underconnected_sink',
          severity: clamp(point.inDegree / 8, 0, 1),
          nodeIds: [point.nodeId],
          reason: 'Multiple inputs terminate without visible downstream action.',
          repairHint: 'Add output edges to reporting, memory capture, or self-audit layers.',
        });
      }

      if (point.degree <= 2 && point.confidence < 0.45) {
        anomalies.push({
          type: 'low_confidence_bridge',
          severity: clamp(0.6 - point.confidence, 0, 1),
          nodeIds: [point.nodeId],
          reason: 'A weak low-degree bridge may silently break pipeline flow.',
          repairHint: 'Add tribunal verification or redundant fallback routing around this bridge.',
        });
      }
    }

    if (metrics.mst.disconnectedRisk > 0.65) {
      anomalies.push({
        type: 'bottleneck',
        severity: metrics.mst.disconnectedRisk,
        nodeIds: [],
        reason: 'The longest topology bridge is much larger than the normal structural spacing.',
        repairHint: 'Add intermediate adapter nodes or explicit contracts between distant subsystems.',
      });
    }

    return anomalies.sort((a, b) => b.severity - a.severity);
  }

  generateSyntheticHardCases(graph: BrainWiringGraph, count: number = 4): BrainWiringGraph[] {
    const cases: BrainWiringGraph[] = [];
    for (let i = 0; i < count; i++) {
      const clone = cloneGraph(graph, `${graph.id}_mogen_hard_${i + 1}`);
      const strategy = i % 4;

      if (strategy === 0) this.injectFalseMerge(clone);
      if (strategy === 1) this.injectDustNode(clone);
      if (strategy === 2) this.injectLowConfidenceBridge(clone);
      if (strategy === 3) this.injectSink(clone);

      clone.metadata = {
        ...clone.metadata,
        synthetic: true,
        generator: 'MoGenWiringTransformer',
        hardCaseStrategy: ['false_merge', 'dust_node', 'low_confidence_bridge', 'terminal_sink'][strategy],
      };
      cases.push(clone);
    }
    return cases;
  }

  recommendRepairs(anomalies: WiringAnomaly[], metrics: WiringMorphologyMetrics): string[] {
    const recommendations = new Set<string>();
    for (const anomaly of anomalies.slice(0, 8)) {
      recommendations.add(anomaly.repairHint);
    }
    if (metrics.topology.hubRatio > 0.25) {
      recommendations.add('Reduce hub pressure: insert typed adapter nodes and confidence gates between heavily shared modules.');
    }
    if (metrics.topology.sinkRatio > 0.35) {
      recommendations.add('Route terminal outputs into memory capture, reporting, or self-audit so the OS can learn from them.');
    }
    if (metrics.mst.leaves / Math.max(1, metrics.mst.totalWeight) < 0.05) {
      recommendations.add('Increase observable branch points so reasoning paths are inspectable instead of hidden in single modules.');
    }
    return Array.from(recommendations);
  }

  private applyCondition(points: WiringPoint[], condition: WiringCondition): WiringPoint[] {
    const mask = condition.activeMask ?? {};
    const guidance = condition.guidanceScale ?? 1;
    let conditioned = points.map(p => ({ ...p }));

    if (mask.center !== false && condition.targetCenter) {
      const center = {
        x: mean(conditioned.map(p => p.x)),
        y: mean(conditioned.map(p => p.y)),
        z: mean(conditioned.map(p => p.z)),
      };
      conditioned = conditioned.map(p => ({
        ...p,
        x: p.x + (((condition.targetCenter?.x ?? center.x) - center.x) * guidance),
        y: p.y + (((condition.targetCenter?.y ?? center.y) - center.y) * guidance),
        z: p.z + (((condition.targetCenter?.z ?? center.z) - center.z) * guidance),
      }));
    }

    if (mask.spread !== false && condition.targetSpread) {
      const center = {
        x: mean(conditioned.map(p => p.x)),
        y: mean(conditioned.map(p => p.y)),
        z: mean(conditioned.map(p => p.z)),
      };
      const current = {
        x: Math.sqrt(variance(conditioned.map(p => p.x - center.x))) || 1,
        y: Math.sqrt(variance(conditioned.map(p => p.y - center.y))) || 1,
        z: Math.sqrt(variance(conditioned.map(p => p.z - center.z))) || 1,
      };
      conditioned = conditioned.map(p => ({
        ...p,
        x: center.x + (p.x - center.x) * blend(1, (condition.targetSpread?.x ?? current.x) / current.x, guidance),
        y: center.y + (p.y - center.y) * blend(1, (condition.targetSpread?.y ?? current.y) / current.y, guidance),
        z: center.z + (p.z - center.z) * blend(1, (condition.targetSpread?.z ?? current.z) / current.z, guidance),
      }));
    }

    if (mask.confidence !== false && condition.confidenceFloor !== undefined) {
      conditioned = conditioned.map(p => ({ ...p, confidence: Math.max(p.confidence, condition.confidenceFloor ?? p.confidence) }));
    }

    return conditioned;
  }

  private computeDegrees(graph: BrainWiringGraph): Map<string, { inDegree: number; outDegree: number }> {
    const degrees = new Map<string, { inDegree: number; outDegree: number }>();
    for (const node of graph.nodes) {
      degrees.set(node.id, { inDegree: 0, outDegree: 0 });
    }
    for (const edge of graph.edges) {
      const source = degrees.get(edge.source);
      const target = degrees.get(edge.target);
      if (source) source.outDegree += 1;
      if (target) target.inDegree += 1;
    }
    return degrees;
  }

  private minimumSpanningTree(points: WiringPoint[]): { totalWeight: number; longestEdge: number; edges: Array<{ a: string; b: string; weight: number }> } {
    if (points.length < 2) return { totalWeight: 0, longestEdge: 0, edges: [] };

    const visited = new Set<string>([points[0].nodeId]);
    const edges: Array<{ a: string; b: string; weight: number }> = [];

    while (visited.size < points.length) {
      let best: { a: string; b: string; weight: number } | undefined;
      for (const a of points) {
        if (!visited.has(a.nodeId)) continue;
        for (const b of points) {
          if (visited.has(b.nodeId)) continue;
          const weight = distance(a, b);
          if (!best || weight < best.weight) {
            best = { a: a.nodeId, b: b.nodeId, weight };
          }
        }
      }
      if (!best) break;
      visited.add(best.b);
      edges.push(best);
    }

    return {
      edges,
      totalWeight: edges.reduce((sum, edge) => sum + edge.weight, 0),
      longestEdge: max(edges.map(edge => edge.weight)),
    };
  }

  private injectFalseMerge(graph: BrainWiringGraph): void {
    const candidates = graph.nodes.filter(n => n.kind === 'agent' || n.kind === 'pipeline' || n.kind === 'layer');
    const [a, b] = candidates.slice(0, 2);
    if (!a || !b) return;
    const mergedId = `${a.id}_${b.id}_false_merge`;
    graph.nodes.push({
      id: mergedId,
      label: `False merge of ${a.label ?? a.id} and ${b.label ?? b.id}`,
      kind: 'pipeline',
      layer: Math.max(a.layer ?? 0, b.layer ?? 0),
      confidence: 0.35,
      weight: 0.8,
      tags: ['synthetic', 'hard-negative', 'false-merge'],
    });
    graph.edges.push({ source: a.id, target: mergedId, kind: 'feeds', confidence: 0.35 });
    graph.edges.push({ source: b.id, target: mergedId, kind: 'feeds', confidence: 0.35 });
  }

  private injectDustNode(graph: BrainWiringGraph): void {
    graph.nodes.push({
      id: `dust_${graph.nodes.length + 1}`,
      label: 'Synthetic orphaned capability',
      kind: 'external',
      layer: 99,
      confidence: 0.2,
      weight: 0.1,
      position: { x: 12, y: 12, z: 12 },
      tags: ['synthetic', 'hard-negative', 'dust'],
    });
  }

  private injectLowConfidenceBridge(graph: BrainWiringGraph): void {
    const first = graph.nodes[0];
    const last = graph.nodes[graph.nodes.length - 1];
    if (!first || !last) return;
    const bridgeId = `weak_bridge_${graph.nodes.length + 1}`;
    graph.nodes.push({
      id: bridgeId,
      label: 'Synthetic weak bridge',
      kind: 'tool',
      layer: ((first.layer ?? 0) + (last.layer ?? 0)) / 2,
      confidence: 0.25,
      weight: 0.4,
      tags: ['synthetic', 'hard-negative', 'weak-bridge'],
    });
    graph.edges.push({ source: first.id, target: bridgeId, kind: 'calls', confidence: 0.25 });
    graph.edges.push({ source: bridgeId, target: last.id, kind: 'feeds', confidence: 0.25 });
  }

  private injectSink(graph: BrainWiringGraph): void {
    const sinkId = `terminal_sink_${graph.nodes.length + 1}`;
    graph.nodes.push({
      id: sinkId,
      label: 'Synthetic terminal sink',
      kind: 'memory',
      layer: 10,
      confidence: 0.55,
      weight: 0.5,
      tags: ['synthetic', 'hard-negative', 'sink'],
    });
    for (const node of graph.nodes.slice(0, 4)) {
      if (node.id !== sinkId) {
        graph.edges.push({ source: node.id, target: sinkId, kind: 'stores', confidence: 0.55 });
      }
    }
  }
}

function cloneGraph(graph: BrainWiringGraph, id: string): BrainWiringGraph {
  return {
    id,
    nodes: graph.nodes.map(node => ({ ...node, tags: [...(node.tags ?? [])], position: node.position ? { ...node.position } : undefined })),
    edges: graph.edges.map(edge => ({ ...edge })),
    metadata: { ...graph.metadata },
  };
}

function distance(a: Point3D, b: Point3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  return values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (values.length - 1);
}

function covariance(a: number[], b: number[]): number {
  if (a.length <= 1 || b.length <= 1 || a.length !== b.length) return 0;
  const ma = mean(a);
  const mb = mean(b);
  return a.reduce((sum, value, index) => sum + (value - ma) * (b[index] - mb), 0) / (a.length - 1);
}

function std(values: number[]): number {
  return Math.sqrt(variance(values));
}

function min(values: number[]): number {
  const finite = values.filter(Number.isFinite);
  return finite.length === 0 ? 0 : Math.min(...finite);
}

function max(values: number[]): number {
  const finite = values.filter(Number.isFinite);
  return finite.length === 0 ? 0 : Math.max(...finite);
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function blend(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function emptyMetrics(): WiringMorphologyMetrics {
  return {
    centerDistance: 0,
    spread: { x: 0, y: 0, z: 0, xy: 0, xz: 0, yz: 0 },
    nearestNeighbor: { mean: 0, std: 0 },
    farthestNeighbor: { mean: 0, std: 0 },
    mst: { totalWeight: 0, longestEdge: 0, leaves: 0, disconnectedRisk: 0 },
    topology: { hubRatio: 0, sinkRatio: 0, sourceRatio: 0, branchiness: 0 },
  };
}
