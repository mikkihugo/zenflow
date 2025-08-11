/**
 * Swarm Coordination Performance Optimizer.
 * Optimizes message routing, caching, latency, and scaling for swarm systems.
 */
/**
 * @file Swarm-optimizer implementation.
 */
import type { SwarmOptimizer } from '../interfaces/optimization-interfaces.ts';
export interface SwarmOptimizationConfig {
    maxAgents: number;
    targetLatency: number;
    cacheEnabled: boolean;
    routingAlgorithm: 'shortest_path' | 'load_balanced' | 'adaptive';
    loadBalancingStrategy: 'round-robin' | 'least-connections' | 'weighted' | 'adaptive';
    compressionEnabled: boolean;
    redundancyLevel: number;
}
export interface MessageRoutingStats {
    averageHops: number;
    messageLatency: number;
    routingEfficiency: number;
    congestionLevel: number;
}
export interface CoordinationMetrics {
    activeAgents: number;
    messagesThroughput: number;
    coordinationOverhead: number;
    faultTolerance: number;
    networkUtilization: number;
}
export interface SwarmTopology {
    type: 'mesh' | 'hierarchical' | 'ring' | 'star';
    nodes: number;
    connections: number;
}
export interface RoutingOptimization {
    routingLatency: number;
    messageCompression: number;
    protocolEfficiency: number;
    topologyOptimization: string;
    routingAlgorithmImprovement: number;
    executionTime: number;
    performance: {
        latencyImprovement: number;
        executionTime: number;
        beforeLatency: number;
        afterLatency: number;
    };
}
export interface CoordinationLayer {
    [key: string]: any;
}
export interface CacheStrategy {
    hitRatio: number;
    evictionPolicy: 'LRU' | 'LFU' | 'TTL' | 'adaptive';
    cacheSize: number;
    layers: number;
}
export interface Protocol {
    [key: string]: any;
}
export interface LatencyReduction {
    reductionPercentage: number;
    averageLatency: number;
    p95Latency: number;
    optimizationTechniques: string[];
}
export interface ScalingStrategy {
    maxAgents: number;
    loadBalancing: 'round-robin' | 'least-connections' | 'weighted' | 'adaptive';
    autoScaling: boolean;
    resourceAllocation: string;
    utilizationAnalysis: any;
}
export declare class SwarmCoordinationOptimizer implements SwarmOptimizer {
    private config;
    private logger;
    constructor(config?: Partial<SwarmOptimizationConfig>);
    /**
     * Optimize message routing for improved latency and efficiency.
     *
     * @param topology
     */
    optimizeMessageRouting(topology: SwarmTopology): Promise<RoutingOptimization>;
    /**
     * Implement intelligent caching for coordination data.
     *
     * @param coordinationLayer
     */
    implementCaching(coordinationLayer: CoordinationLayer): Promise<CacheStrategy>;
    /**
     * Reduce coordination latency through various optimizations.
     *
     * @param communicationProtocols
     */
    reduceLatency(communicationProtocols: Protocol[]): Promise<LatencyReduction>;
    /**
     * Implement horizontal scaling strategies.
     *
     * @param swarmSize
     */
    scaleHorizontally(swarmSize: number): Promise<ScalingStrategy>;
    /**
     * Analyze topology efficiency.
     *
     * @param topology
     */
    private analyzeTopologyEfficiency;
    /**
     * Optimize routing algorithms for the given topology.
     *
     * @param topology
     */
    private optimizeRoutingAlgorithms;
    /**
     * Implement message compression.
     *
     * @param topology
     */
    private implementMessageCompression;
    /**
     * Optimize network protocols.
     *
     * @param topology
     */
    private optimizeNetworkProtocols;
    /**
     * Calculate optimal cache size based on coordination patterns.
     *
     * @param patterns
     */
    private calculateOptimalCacheSize;
    /**
     * Select eviction policy based on access patterns.
     *
     * @param patterns
     */
    private selectEvictionPolicy;
    /**
     * Determine optimal load balancing strategy.
     *
     * @param swarmSize
     */
    private determineOptimalLoadBalancing;
    /**
     * Measure routing performance.
     *
     * @param _topology
     */
    private measureRoutingPerformance;
    /**
     * Calculate topology efficiency.
     *
     * @param topology
     */
    private calculateTopologyEfficiency;
    /**
     * Identify topology bottlenecks.
     *
     * @param topology
     */
    private identifyTopologyBottlenecks;
    /**
     * Helper methods with mock implementations.
     *
     * @param _topology
     */
    private implementAdaptiveRouting;
    private analyzeCoordinationPatterns;
    private implementMultiLayerCaching;
    private enableIntelligentPrefetching;
    private implementCacheWarming;
    private measureCacheHitRatio;
    private measureAverageLatency;
    private measureP95Latency;
    private optimizeProtocolStack;
    private implementConnectionPooling;
    private enableMessageBatching;
    private implementZeroCopyMessaging;
    private optimizeSerializationDeserialization;
    private implementPredictiveRouting;
    private analyzeResourceUtilization;
    private implementAutoScaling;
    private optimizeResourceAllocation;
    private implementDynamicTopologyAdjustment;
    private enableFaultToleranceMechanisms;
    private calculateMaxSupportedAgents;
    private benchmarkRoutingAlgorithm;
    private analyzeMessagePatterns;
    private selectCompressionAlgorithm;
    private applyMessageCompression;
    private measureProtocolEfficiency;
    private testProtocolOptimization;
    private applyProtocolOptimization;
}
//# sourceMappingURL=swarm-optimizer.d.ts.map