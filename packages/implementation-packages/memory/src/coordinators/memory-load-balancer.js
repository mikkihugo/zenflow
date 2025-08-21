/**
 * Memory Load Balancer - Intelligent Request Distribution
 *
 * Provides sophisticated load balancing algorithms for memory operations,
 * including round-robin, least-connections, weighted, and resource-aware strategies.
 */
import { EventEmitter } from 'eventemitter3';
import { getLogger, recordMetric } from '@claude-zen/foundation';
export class MemoryLoadBalancer extends EventEmitter {
    logger;
    config;
    nodes = new Map();
    roundRobinIndex = 0;
    stats;
    constructor(config) {
        super();
        this.config = config;
        this.logger = getLogger('MemoryLoadBalancer');
        this.stats = {
            totalRequests: 0,
            nodeDistribution: {},
            averageLatency: 0,
            overloadedNodes: [],
            algorithm: config.algorithm
        };
    }
    addNode(node) {
        this.nodes.set(node.id, node);
        this.stats.nodeDistribution[node.id] = 0;
        this.logger.debug(`Added node to load balancer: ${node.id}`);
    }
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        delete this.stats.nodeDistribution[nodeId];
        this.stats.overloadedNodes = this.stats.overloadedNodes.filter(id => id !== nodeId);
        this.logger.debug(`Removed node from load balancer: ${nodeId}`);
    }
    selectNode(availableNodes) {
        if (!this.config.enabled || availableNodes.length === 0) {
            throw new Error('No nodes available for load balancing');
        }
        if (availableNodes.length === 1) {
            return availableNodes[0];
        }
        let selectedNode;
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
            algorithm: this.config.algorithm,
            nodeId: selectedNode.id
        });
        return selectedNode;
    }
    selectRoundRobin(nodes) {
        const nodeIndex = this.roundRobinIndex % nodes.length;
        this.roundRobinIndex++;
        return nodes[nodeIndex];
    }
    selectLeastConnections(nodes) {
        return nodes.reduce((least, current) => {
            if (current.metrics.connections < least.metrics.connections) {
                return current;
            }
            if (current.metrics.connections === least.metrics.connections) {
                // Secondary sort by response time
                return current.metrics.averageResponseTime < least.metrics.averageResponseTime ? current : least;
            }
            return least;
        });
    }
    selectWeighted(nodes) {
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
    selectResourceAware(nodes) {
        // Score nodes based on multiple factors
        const scoredNodes = nodes.map(node => ({
            node,
            score: this.calculateNodeScore(node)
        }));
        // Sort by score (higher is better)
        scoredNodes.sort((a, b) => b.score - a.score);
        return scoredNodes[0].node;
    }
    calculateNodeScore(node) {
        const metrics = node.metrics;
        const thresholds = this.config.thresholds || {
            maxLatency: 100,
            maxErrorRate: 0.05,
            maxConnectionsPerNode: 100,
            maxMemoryUsage: 0.8
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
    checkNodeOverload(node) {
        const thresholds = this.config.thresholds || {
            maxLatency: 100,
            maxErrorRate: 0.05,
            maxConnectionsPerNode: 100,
            maxMemoryUsage: 0.8
        };
        const isOverloaded = node.metrics.averageResponseTime > thresholds.maxLatency ||
            node.status.errorRate > thresholds.maxErrorRate ||
            node.metrics.connections > thresholds.maxConnectionsPerNode ||
            node.metrics.memoryUsage > thresholds.maxMemoryUsage;
        const wasOverloaded = this.stats.overloadedNodes.includes(node.id);
        if (isOverloaded && !wasOverloaded) {
            this.stats.overloadedNodes.push(node.id);
            this.emit('overloaded', node.id);
            this.logger.warn(`Node overloaded: ${node.id}`, {
                latency: node.metrics.averageResponseTime,
                errorRate: node.status.errorRate,
                connections: node.metrics.connections,
                memoryUsage: node.metrics.memoryUsage
            });
            recordMetric('memory_load_balancer_overload', 1, { nodeId: node.id });
        }
        else if (!isOverloaded && wasOverloaded) {
            this.stats.overloadedNodes = this.stats.overloadedNodes.filter(id => id !== node.id);
            this.emit('recovered', node.id);
            this.logger.info(`Node recovered from overload: ${node.id}`);
            recordMetric('memory_load_balancer_recovery', 1, { nodeId: node.id });
        }
    }
    updateNodeMetrics(nodeId, metrics) {
        const node = this.nodes.get(nodeId);
        if (node) {
            Object.assign(node.metrics, metrics);
            // Update average latency in stats
            const totalLatency = Array.from(this.nodes.values())
                .reduce((sum, n) => sum + n.metrics.averageResponseTime, 0);
            this.stats.averageLatency = totalLatency / this.nodes.size;
            // Check for overload with updated metrics
            this.checkNodeOverload(node);
        }
    }
    getNodeLoad(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node)
            return 0;
        // Calculate load as a percentage (0-100)
        const score = this.calculateNodeScore(node);
        return Math.max(0, Math.min(100, 100 - score));
    }
    getOptimalNodeCount() {
        // Calculate optimal node count based on current load
        const totalRequests = this.stats.totalRequests;
        const avgLatency = this.stats.averageLatency;
        const overloadedCount = this.stats.overloadedNodes.length;
        if (totalRequests === 0)
            return 1;
        // Simple heuristic: if more than 30% of nodes are overloaded, recommend more nodes
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
    getStats() {
        return { ...this.stats };
    }
    getNodeDistribution() {
        const total = this.stats.totalRequests;
        if (total === 0)
            return {};
        const distribution = {};
        for (const [nodeId, count] of Object.entries(this.stats.nodeDistribution)) {
            distribution[nodeId] = (count / total) * 100; // Percentage
        }
        return distribution;
    }
    reset() {
        this.stats = {
            totalRequests: 0,
            nodeDistribution: {},
            averageLatency: 0,
            overloadedNodes: [],
            algorithm: this.config.algorithm
        };
        // Reset node distribution counters
        for (const nodeId of this.nodes.keys()) {
            this.stats.nodeDistribution[nodeId] = 0;
        }
        this.roundRobinIndex = 0;
        this.logger.info('Load balancer statistics reset');
    }
    setAlgorithm(algorithm) {
        this.config.algorithm = algorithm;
        this.stats.algorithm = algorithm;
        this.logger.info(`Load balancing algorithm changed to: ${algorithm}`);
        recordMetric('memory_load_balancer_algorithm_change', 1, { algorithm });
    }
    setWeights(weights) {
        this.config.weights = weights;
        this.logger.info('Load balancing weights updated', weights);
    }
    setThresholds(thresholds) {
        this.config.thresholds = { ...this.config.thresholds, ...thresholds };
        this.logger.info('Load balancing thresholds updated', thresholds);
    }
}
