/**
 * OSMorphologyGraph.ts
 *
 * Builds a 3D wiring graph of the system's own cognition. Models how cognitive
 * modules connect, where weak bridges exist, and how load is distributed across
 * the cognitive substrate. Used by the self-auditing subsystem to detect
 * structural fragility and drive morphogenic evolution of the cognitive network.
 */

/**
 * A cognitive module represented as a node in the morphology graph.
 */
export interface Node {
  id: string;
  type: string;
  label: string;
  connections: Map<string, number>;
  activity: number;
}

/**
 * A weighted directed edge between two cognitive nodes.
 */
export interface Edge {
  source: string;
  target: string;
  weight: number;
  type: string;
}

/**
 * A scenario produced by stress-testing the cognitive graph against a
 * specific vulnerability (e.g. removal of a weak bridge).
 */
export interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  targetNode: string;
  expectedBehavior: string;
  actualBehavior: string;
  passed: boolean;
}

/**
 * Result of evolving the cognitive graph.
 */
export interface EvolutionReport {
  strengthenedEdges: number;
  prunedEdges: number;
  nodesUpdated: number;
  timestamp: string;
}

type EdgeKey = `${string}->${string}`;

function makeEdgeKey(source: string, target: string): EdgeKey {
  return `${source}->${target}` as EdgeKey;
}

export class OSMorphologyGraph {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<EdgeKey, Edge> = new Map();

  private readonly MAX_ACTIVITY: number = 1.0;
  private readonly MAX_WEIGHT: number = 1.0;
  private readonly PRUNE_WEIGHT: number = 0.05;
  private readonly HEBARIAN_BOOST: number = 0.08;

  constructor() {}

  /**
   * Register a cognitive module as a node in the graph.
   *
   * @param node - The node to register.
   * @throws {Error} If a node with the same id already exists.
   * @throws {Error} If required fields are missing or invalid.
   */
  public addNode(node: Node): void {
    if (!node || typeof node !== 'object') {
      throw new Error('[OSMorphology] addNode requires a valid Node object');
    }
    if (!node.id || typeof node.id !== 'string') {
      throw new Error('[OSMorphology] Node.id is required and must be a string');
    }
    if (!node.type || typeof node.type !== 'string') {
      throw new Error('[OSMorphology] Node.type is required and must be a string');
    }
    if (!node.label || typeof node.label !== 'string') {
      throw new Error('[OSMorphology] Node.label is required and must be a string');
    }
    if (this.nodes.has(node.id)) {
      throw new Error(`[OSMorphology] Node with id "${node.id}" already exists`);
    }
    if (!node.connections || !(node.connections instanceof Map)) {
      node.connections = new Map();
    }
    if (typeof node.activity !== 'number' || node.activity < 0 || node.activity > this.MAX_ACTIVITY) {
      throw new Error(`[OSMorphology] Node.activity must be a number in [0, ${this.MAX_ACTIVITY}]`);
    }

    this.nodes.set(node.id, node);
    console.log(`[OSMorphology] Node registered: ${node.id} (${node.type}) "${node.label}"`);
  }

  /**
   * Create a directed, weighted edge between two existing nodes. The edge is
   * also recorded in each endpoint's `connections` map. Self-loops are
   * rejected.
   *
   * @param source - id of the source node.
   * @param target - id of the target node.
   * @param weight - edge strength in [0, 1].
   * @throws {Error} If either node is missing, weight is out of range, or the
   *   edge is a self-loop.
   */
  public addEdge(source: string, target: string, weight: number): void {
    if (!this.nodes.has(source)) {
      throw new Error(`[OSMorphology] Source node "${source}" does not exist`);
    }
    if (!this.nodes.has(target)) {
      throw new Error(`[OSMorphology] Target node "${target}" does not exist`);
    }
    if (source === target) {
      throw new Error(`[OSMorphology] Self-loop edges are not permitted (node "${source}")`);
    }
    if (typeof weight !== 'number' || Number.isNaN(weight) || weight < 0 || weight > this.MAX_WEIGHT) {
      throw new Error(`[OSMorphology] Weight must be a number in [0, ${this.MAX_WEIGHT}]`);
    }

    const key = makeEdgeKey(source, target);
    const edge: Edge = {
      source,
      target,
      weight,
      type: 'excitatory',
    };

    const sourceNode = this.nodes.get(source)!;
    const targetNode = this.nodes.get(target)!;

    sourceNode.connections.set(target, weight);
    targetNode.connections.set(source, weight);

    this.edges.set(key, edge);
    console.log(`[OSMorphology] Edge added: ${source} -> ${target} (weight=${weight.toFixed(3)})`);
  }

  /**
   * Find edges whose weight falls below the given threshold. These are the
   * weak bridges that could fail and sever connectivity between cognitive
   * modules.
   *
   * @param threshold - weight below which an edge is considered "weak".
   * @returns Array of weak bridge edges.
   * @throws {Error} If threshold is not a finite number in [0, 1].
   */
  public getWeakBridges(threshold: number): Edge[] {
    if (typeof threshold !== 'number' || Number.isNaN(threshold) || threshold < 0 || threshold > this.MAX_WEIGHT) {
      throw new Error(`[OSMorphology] Threshold must be a number in [0, ${this.MAX_WEIGHT}]`);
    }

    const weakBridges = Array.from(this.edges.values()).filter(
      (edge) => edge.weight < threshold
    );

    console.log(`[OSMorphology] Detected ${weakBridges.length} weak bridge(s) below threshold ${threshold}`);
    return weakBridges;
  }

  /**
   * Generate stress-test scenarios targeting weak bridges and bottlenecks.
   * Each scenario simulates the failure of a vulnerable edge and records the
   * expected vs. actual behavior after re-simulating connectivity.
   *
   * @returns An array of stress-test scenarios.
   */
  public getStressTestScenarios(): StressTestScenario[] {
    const scenarios: StressTestScenario[] = [];
    let scenarioIndex = 0;

    const weakBridges = this.getWeakBridges(0.3);

    for (const edge of weakBridges) {
      scenarioIndex++;
      const scenarioId = `stress_${scenarioIndex}`;
      const { reachable, total } = this.simulateFailure(edge.source, edge.target);

      scenarios.push({
        id: scenarioId,
        name: `BridgeFailure_${edge.source}_${edge.target}`,
        description: `Simulates failure of the ${edge.weight.toFixed(3)}-weight connection from ${edge.source} to ${edge.target}.`,
        targetNode: edge.target,
        expectedBehavior: `Cognitive content should still reach ${edge.target} via alternative pathways.`,
        actualBehavior: `Reachable nodes after failure: ${reachable}/${total}.`,
        passed: reachable >= total * 0.5,
      });
    }

    const bottlenecks = this.findBottlenecks();
    for (const bottleneck of bottlenecks) {
      scenarioIndex++;
      const scenarioId = `stress_${scenarioIndex}`;
      const degree = this.degreeCentrality(bottleneck.id);

      scenarios.push({
        id: scenarioId,
        name: `BottleneckOverload_${bottleneck.id}`,
        description: `Simulates saturating the high-centrality node "${bottleneck.id}" (degree=${degree.toFixed(2)}).`,
        targetNode: bottleneck.id,
        expectedBehavior: `Node should gracefully degrade rather than drop all connectivity.`,
        actualBehavior: `Node "${bottleneck.id}" has ${degree.toFixed(2)} normalized centrality under load.`,
        passed: degree < 0.8,
      });
    }

    console.log(`[OSMorphology] Generated ${scenarios.length} stress-test scenario(s)`);
    return scenarios;
  }

  /**
   * Compute a scalar measure of how much cognitive work the graph is
   * performing. Load is the sum of each node's activity weighted by its
   * connection count, normalized by the maximum possible load.
   *
   * @returns Cognitive load in [0, 1].
   */
  public computeCognitiveLoad(): number {
    let totalLoad = 0;
    for (const node of this.nodes.values()) {
      const weightedDegree = node.connections.size;
      totalLoad += node.activity * weightedDegree;
    }

    const maxPossibleLoad = this.nodes.size * this.MAX_ACTIVITY * this.nodes.size;
    if (maxPossibleLoad === 0) {
      return 0;
    }

    const load = Math.min(totalLoad / maxPossibleLoad, this.MAX_ACTIVITY);
    console.log(`[OSMorphology] Cognitive load: ${(load * 100).toFixed(1)}%`);
    return load;
  }

  /**
   * Identify bottleneck nodes. A node is a bottleneck if it has high
   * degree centrality (a gatekeeper for many connections) or if its removal
   * fragments the graph. Returns nodes whose normalized centrality exceeds
   * a threshold.
   *
   * @returns Array of bottleneck nodes.
   */
  public findBottlenecks(): Node[] {
    if (this.nodes.size === 0) {
      return [];
    }

    const centralities = Array.from(this.nodes.values()).map((node) => ({
      node,
      centrality: this.degreeCentrality(node.id),
    }));

    const maxCentrality = Math.max(...centralities.map((c) => c.centrality), 0);
    const threshold = maxCentrality * 0.6;

    const bottlenecks = centralities
      .filter((c) => c.centrality > threshold && c.centrality > 0)
      .sort((a, b) => b.centrality - a.centrality)
      .map((c) => c.node);

    console.log(`[OSMorphology] Identified ${bottlenecks.length} bottleneck node(s)`);
    return bottlenecks;
  }

  /**
   * Produce a text-based 3D-ish visualization of the graph.
   *
   * @returns A multi-line string representation of the graph.
   */
  public visualize(): string {
    const lines: string[] = [];
    lines.push('--- OSMorphologyGraph (3D Wiring) ---');

    if (this.nodes.size === 0) {
      lines.push('(empty graph)');
      return lines.join('\n');
    }

    lines.push('\n[NODES]');
    for (const node of this.nodes.values()) {
      const degree = node.connections.size;
      lines.push(
        `  • ${node.id} [${node.type}] "${node.label}" | activity=${node.activity.toFixed(2)} degree=${degree}`
      );
    }

    lines.push('\n[EDGES]');
    if (this.edges.size === 0) {
      lines.push('  (none)');
    } else {
      for (const edge of this.edges.values()) {
        lines.push(
          `  • ${edge.source} ->${edge.type === 'inhibitory' ? '~' : '>'}- ${edge.target} | weight=${edge.weight.toFixed(3)}`
        );
      }
    }

    lines.push(`\n[SUMMARY] nodes=${this.nodes.size} edges=${this.edges.size} load=${this.computeCognitiveLoad().toFixed(3)}`);
    return lines.join('\n');
  }

  /**
   * Evolve the graph's morphology using a Hebbian / pruning rule set:
   * - Weak connections that are co-active get strengthened (Hebbian boost).
   * - Unused / negligible-weight edges (below the prune threshold) are removed.
   *
   * @returns An {@link EvolutionReport} describing the changes.
   */
  public evolve(): EvolutionReport {
    let strengthenedEdges = 0;
    let prunedEdges = 0;
    const updatedNodeIds = new Set<string>();
    const edgesToPrune: EdgeKey[] = [];

    for (const [key, edge] of this.edges.entries()) {
      const sourceNode = this.nodes.get(edge.source);
      const targetNode = this.nodes.get(edge.target);

      if (!sourceNode || !targetNode) {
        edgesToPrune.push(key);
        prunedEdges++;
        continue;
      }

      const coActive = sourceNode.activity > 0 && targetNode.activity > 0;

      if (edge.weight < this.PRUNE_WEIGHT && !coActive) {
        edgesToPrune.push(key);
        prunedEdges++;
        continue;
      }

      if (coActive && edge.weight < this.MAX_WEIGHT) {
        const newWeight = Math.min(edge.weight + this.HEBARIAN_BOOST, this.MAX_WEIGHT);
        if (newWeight !== edge.weight) {
          edge.weight = newWeight;
          sourceNode.connections.set(edge.target, newWeight);
          targetNode.connections.set(edge.source, newWeight);
          strengthenedEdges++;
          updatedNodeIds.add(edge.source);
          updatedNodeIds.add(edge.target);
        }
      }
    }

    for (const key of edgesToPrune) {
      const edge = this.edges.get(key);
      if (edge) {
        this.edges.delete(key);
        const sourceNode = this.nodes.get(edge.source);
        const targetNode = this.nodes.get(edge.target);
        sourceNode?.connections.delete(edge.target);
        targetNode?.connections.delete(edge.source);
        console.log(`[OSMorphology] Pruned edge: ${edge.source} -> ${edge.target}`);
      }
    }

    const report: EvolutionReport = {
      strengthenedEdges,
      prunedEdges,
      nodesUpdated: updatedNodeIds.size,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[OSMorphology] Evolution complete: +${report.strengthenedEdges} strengthened, -${report.prunedEdges} pruned, ${report.nodesUpdated} nodes updated`
    );
    return report;
  }

  /** Degree centrality: number of connections / (n - 1). */
  private degreeCentrality(nodeId: string): number {
    const node = this.nodes.get(nodeId);
    if (!node || this.nodes.size <= 1) {
      return 0;
    }
    return node.connections.size / (this.nodes.size - 1);
  }

  /**
   * Simulate removal of an edge and measure how many nodes remain reachable
   * from the source via breadth-first traversal.
   */
  private simulateFailure(source: string, target: string): { reachable: number; total: number } {
    const visited = new Set<string>();
    const queue: string[] = [source];
    visited.add(source);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentNode = this.nodes.get(current);
      if (!currentNode) continue;

      for (const neighborId of currentNode.connections.keys()) {
        if (current === source && neighborId === target) {
          continue;
        }
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }

    return { reachable: visited.size, total: this.nodes.size };
  }

  /**
   * Retrieve a node by id. Returns undefined if not found.
   */
  public getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  /**
   * Retrieve all nodes.
   */
  public getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Retrieve all edges.
   */
  public getEdges(): Edge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Remove a node and every edge incident to it.
   */
  public removeNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) {
      return false;
    }

    for (const neighborId of node.connections.keys()) {
      const neighbor = this.nodes.get(neighborId);
      neighbor?.connections.delete(id);
      const forwardKey = makeEdgeKey(id, neighborId);
      const reverseKey = makeEdgeKey(neighborId, id);
      this.edges.delete(forwardKey);
      this.edges.delete(reverseKey);
    }

    this.nodes.delete(id);
    console.log(`[OSMorphology] Node removed: ${id}`);
    return true;
  }

  public getNodeCount(): number {
    return this.nodes.size;
  }

  public getEdgeCount(): number {
    return this.edges.size;
  }

  public getBottlenecks(threshold: number = 0.6): Node[] {
    const bottlenecks: Node[] = [];
    const maxCentrality = this.getMaxCentrality();

    for (const [, node] of this.nodes) {
      const centrality = node.connections.size / Math.max(maxCentrality, 1);
      if (centrality > threshold) {
        bottlenecks.push(node);
      }
    }

    return bottlenecks;
  }

  private getMaxCentrality(): number {
    let max = 0;
    for (const [, node] of this.nodes) {
      if (node.connections.size > max) max = node.connections.size;
    }
    return max;
  }

  /**
   * Reset the entire graph.
   */
  public reset(): void {
    this.nodes.clear();
    this.edges.clear();
    console.log('[OSMorphology] Graph reset');
  }
}

export default OSMorphologyGraph;
