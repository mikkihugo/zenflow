/**
 * Memory Load Balancer - Intelligent Request Distribution
 *
 * Provides sophisticated load balancing algorithms for memory operations,
 * including round-robin, least-connections, weighted, and resource-aware strategies.
 */
import { TypedEventBase } from '@claude-zen/foundation';
import type { MemoryNode, MemoryLoadMetrics } from './types';
interface LoadBalancingConfig {
    enabled: boolean;
    algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'resource-aware';
    weights?: Record<string, number>;
    thresholds?: {
        maxLatency: number;
        maxErrorRate: number;
        maxConnectionsPerNode: number;
        maxMemoryUsage: number;
    };
}
interface LoadBalancingStats {
    totalRequests: number;
    nodeDistribution: Record<string, number>;
    averageLatency: number;
    overloadedNodes: string[];
    algorithm: string;
}
export declare class MemoryLoadBalancer extends TypedEventBase {
    private logger;
    private config;
    private nodes;
    private roundRobinIndex;
    private stats;
    constructor(config: LoadBalancingConfig);
    addNode(node: MemoryNode): void;
    removeNode(nodeId: string): void;
    selectNode(availableNodes: MemoryNode[]): MemoryNode;
    private selectRoundRobin;
    private selectLeastConnections;
    private selectWeighted;
    private selectResourceAware;
    private calculateNodeScore;
    private checkNodeOverload;
    updateNodeMetrics(nodeId: string, metrics: Partial<MemoryLoadMetrics>): void;
    getNodeLoad(nodeId: string): number;
    getOptimalNodeCount(): number;
    getStats(): LoadBalancingStats;
    getNodeDistribution(): Record<string, number>;
    reset(): void;
    setAlgorithm(algorithm: LoadBalancingConfig['algorithm']): void;
    setWeights(weights: Record<string, number>): void;
    setThresholds(thresholds: LoadBalancingConfig['thresholds']): void;
}
export {};
//# sourceMappingURL=memory-load-balancer.d.ts.map