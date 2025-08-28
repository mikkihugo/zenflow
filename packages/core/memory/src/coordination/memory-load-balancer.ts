/**
 * Memory Load Balancer - Intelligent Request Distribution
 *
 * Provides sophisticated load balancing algorithms for memory operations,
 * including round-robin, least-connections, weighted, and resource-aware strategies.
 */

import { EventEmitter} from '@claude-zen/foundation';
import { getLogger, recordMetric} from '@claude-zen/foundation';
import type { Logger} from '@claude-zen/foundation';
import type { MemoryNode, MemoryLoadMetrics} from './types';

interface LoadBalancingConfig {
  enabled:boolean;
  algorithm:
    | 'round-robin')    | 'least-connections')    | 'weighted')    | 'resource-aware';
  weights?:Record<string, number>;
  thresholds?:{
    maxLatency:number;
    maxErrorRate:number;
    maxConnectionsPerNode:number;
    maxMemoryUsage:number;
};
}

interface LoadBalancingStats {
  totalRequests:number;
  nodeDistribution:Record<string, number>;
  averageLatency:number;
  overloadedNodes:string[];
  algorithm:string;
}

export class MemoryLoadBalancer extends EventEmitter {
  private logger:Logger;
  private config:LoadBalancingConfig;
  private nodes = new Map<string, MemoryNode>();
  private roundRobinIndex = 0;
  private stats:LoadBalancingStats;

  constructor(config:LoadBalancingConfig) {
    super();
    this.config = config;
    this.logger = getLogger('MemoryLoadBalancer');
    this.stats = {
      totalRequests:0,
      nodeDistribution:{},
      averageLatency:0,
      overloadedNodes:[],
      algorithm:config.algorithm,
};
}

  addNode(node:MemoryNode): void {
    this.nodes.set(node.id, node);
    this.stats.nodeDistribution[node.id] = 0;
    this.logger.debug(`Added node to load balancer:${node.id}`);
}

  removeNode(nodeId:string): void {
    this.nodes.delete(nodeId);
    delete this.stats.nodeDistribution[nodeId];
    this.stats.overloadedNodes = this.stats.overloadedNodes.filter(
      (id) => id !== nodeId
    );
    this.logger.debug(`Removed node from load balancer:${nodeId}`);
}

  selectNode(availableNodes:MemoryNode[]): MemoryNode {
    if (!this.config.enabled || availableNodes.length === 0) {
      throw new Error('No nodes available for load balancing');
}

    if (availableNodes.length === 1) {
      return availableNodes[0];
}

    let selectedNode:MemoryNode;

    switch (this.config.algorithm) {
      case 'round-robin':
        selectedNode = this.selectRoundRobin(availableNodes);
        break;

      case 'least-connections':
        selectedNode = this.selectLeastConnections(availableNodes);
        break;

      case 'weighted':
        selectedNode = this.selectWeighted(availableNodes);
        break;

      case 'resource-aware':
        selectedNode = this.selectResourceAware(availableNodes);
        break;

      default:
        selectedNode = availableNodes[0];
}

    // Update statistics
    this.stats.totalRequests++;
    this.stats.nodeDistribution[selectedNode.id]++;

    // Check for overloaded nodes
    this.checkNodeOverload(selectedNode);

    recordMetric('memory_load_balancer_request', 1, {
      algorithm:this.config.algorithm,
      nodeId:selectedNode.id,
});

    return selectedNode;
}

  private selectRoundRobin(nodes:MemoryNode[]): MemoryNode {
    const nodeIndex = this.roundRobinIndex % nodes.length;
    this.roundRobinIndex++;
    return nodes[nodeIndex];
}

  private selectLeastConnections(nodes:MemoryNode[]): MemoryNode {
    return nodes.reduce((least, current) => {
      if (current.metrics.connections < least.metrics.connections) {
        return current;
}
      if (current.metrics.connections === least.metrics.connections) {
        // Secondary sort by response time
        return current.metrics.averageResponseTime <
          least.metrics.averageResponseTime
          ? current
          :least;
}
      return least;
});
}

  private selectWeighted(nodes:MemoryNode[]): MemoryNode {
    const weights = this.config.weights || {};

    // Calculate total weight
    const totalWeight = nodes.reduce((sum, node) => {
      const weight = weights[node.id] || node.weight || 1;
      return sum + weight;
}, 0);

    // Random selection based on weights
    let random = Math.random() * totalWeight;

    for (const node of nodes) {
      const weight = weights[node.id] || node.weight || 1;
      random -= weight;
      if (random <= 0) {
        return node;
}
}

    // Fallback to first node
    return nodes[0];
}

  private selectResourceAware(nodes:MemoryNode[]): MemoryNode {
    // Score nodes based on multiple factors
    const scoredNodes = nodes.map((node) => ({
      node,
      score:this.calculateNodeScore(node),
}));

    // Sort by score (higher is better)
    scoredNodes.sort((a, b) => b.score - a.score);

    return scoredNodes[0].node;
}

  private calculateNodeScore(node:MemoryNode): number {
    const {metrics} = node;
    const thresholds = this.config.thresholds || {
      maxLatency:100,
      maxErrorRate:0.05,
      maxConnectionsPerNode:100,
      maxMemoryUsage:0.8,
};

    // Base score
    let score = 100;

    // Penalize high latency
    if (metrics.averageResponseTime > thresholds.maxLatency) {
      score -= (metrics.averageResponseTime / thresholds.maxLatency) * 20;
}

    // Penalize high error rate
    if (node.status.errorRate > thresholds.maxErrorRate) {
      score -= (node.status.errorRate / thresholds.maxErrorRate) * 30;
}

    // Penalize high connection count
    if (metrics.connections > thresholds.maxConnectionsPerNode) {
      score -= (metrics.connections / thresholds.maxConnectionsPerNode) * 15;
}

    // Penalize high memory usage
    if (metrics.memoryUsage > thresholds.maxMemoryUsage) {
      score -= (metrics.memoryUsage / thresholds.maxMemoryUsage) * 25;
}

    // Bonus for high cache hit rate
    score += metrics.cacheHitRate * 10;

    // Apply node weight multiplier
    score *= node.weight;

    return Math.max(0, score);
}

  private checkNodeOverload(node:MemoryNode): void {
    const thresholds = this.config.thresholds || {
      maxLatency:100,
      maxErrorRate:0.05,
      maxConnectionsPerNode:100,
      maxMemoryUsage:0.8,
};

    const isOverloaded =
      node.metrics.averageResponseTime > thresholds.maxLatency ||
      node.status.errorRate > thresholds.maxErrorRate ||
      node.metrics.connections > thresholds.maxConnectionsPerNode ||
      node.metrics.memoryUsage > thresholds.maxMemoryUsage;

    const wasOverloaded = this.stats.overloadedNodes.includes(node.id);

    if (isOverloaded && !wasOverloaded) {
      this.stats.overloadedNodes.push(node.id);
      this.emit('overloaded', node.id);
      this.logger.warn(`Node overloaded:${node.id}`, {
        latency:node.metrics.averageResponseTime,
        errorRate:node.status.errorRate,
        connections:node.metrics.connections,
        memoryUsage:node.metrics.memoryUsage,
});

      recordMetric('memory_load_balancer_overload', 1, { nodeId:node.id});
} else if (!isOverloaded && wasOverloaded) {
      this.stats.overloadedNodes = this.stats.overloadedNodes.filter(
        (id) => id !== node.id
      );
      this.emit('recovered', node.id);
      this.logger.info(`Node recovered from overload:${node.id}`);

      recordMetric('memory_load_balancer_recovery', 1, { nodeId:node.id});
}
}

  updateNodeMetrics(nodeId:string, metrics:Partial<MemoryLoadMetrics>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      Object.assign(node.metrics, metrics);

      // Update average latency in stats
      const totalLatency = Array.from(this.nodes.values()).reduce(
        (sum, n) => sum + n.metrics.averageResponseTime,
        0
      );
      this.stats.averageLatency = totalLatency / this.nodes.size;

      // Check for overload with updated metrics
      this.checkNodeOverload(node);
}
}

  getNodeLoad(nodeId:string): number {
    const node = this.nodes.get(nodeId);
    if (!node) return 0;

    // Calculate load as a percentage (0-100)
    const score = this.calculateNodeScore(node);
    return Math.max(0, Math.min(100, 100 - score));
}

  getOptimalNodeCount():number {
    // Calculate optimal node count based on current load
    const {totalRequests} = this.stats;
    const avgLatency = this.stats.averageLatency;
    const overloadedCount = this.stats.overloadedNodes.length;

    if (totalRequests === 0) return 1;

    // Simple heuristic:if more than 30% of nodes are overloaded, recommend more nodes
    const currentNodes = this.nodes.size;
    const overloadRatio = overloadedCount / currentNodes;

    if (overloadRatio > 0.3) {
      return Math.ceil(currentNodes * 1.5);
}

    // If average latency is high, recommend more nodes
    const maxLatency = this.config.thresholds?.maxLatency || 100;
    if (avgLatency > maxLatency) {
      return Math.ceil(currentNodes * 1.2);
}

    // If load is very low, we might be able to reduce nodes
    if (overloadRatio === 0 && avgLatency < maxLatency * 0.5) {
      return Math.max(1, Math.floor(currentNodes * 0.8));
}

    return currentNodes;
}

  getStats():LoadBalancingStats {
    return { ...this.stats};
}

  getNodeDistribution():Record<string, number> {
    const total = this.stats.totalRequests;
    if (total === 0) return {};

    const distribution:Record<string, number> = {};
    for (const [nodeId, count] of Object.entries(this.stats.nodeDistribution)) {
      distribution[nodeId] = (count / total) * 100; // Percentage
}

    return distribution;
}

  reset():void {
    this.stats = {
      totalRequests:0,
      nodeDistribution:{},
      averageLatency:0,
      overloadedNodes:[],
      algorithm:this.config.algorithm,
};

    // Reset node distribution counters
    for (const nodeId of this.nodes.keys()) {
      this.stats.nodeDistribution[nodeId] = 0;
}

    this.roundRobinIndex = 0;
    this.logger.info('Load balancer statistics reset');
}

  setAlgorithm(algorithm:LoadBalancingConfig['algorithm']): void {
    this.config.algorithm = algorithm;
    this.stats.algorithm = algorithm;
    this.logger.info(`Load balancing algorithm changed to:${algorithm}`);

    recordMetric('memory_load_balancer_algorithm_change', 1, { algorithm});
}

  setWeights(weights:Record<string, number>):void {
    this.config.weights = weights;
    this.logger.info('Load balancing weights updated', weights);
}

  setThresholds(thresholds:LoadBalancingConfig['thresholds']): void {
    this.config.thresholds = { ...this.config.thresholds, ...thresholds};
    this.logger.info('Load balancing thresholds updated', thresholds);
}
}
