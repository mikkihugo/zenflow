/**
 * @file Strategy Pattern Implementation for Swarm Coordination
 * Provides flexible coordination strategies for different swarm topologies.
 */
import { EventEmitter } from 'node:events';
import type { Agent } from '../types';
export interface CoordinationContext {
    swarmId: string;
    timestamp: Date;
    resources: ResourceMetrics;
    constraints: CoordinationConstraints;
    history: CoordinationHistory[];
    agents: Agent[];
}
export interface CoordinationResult {
    topology: SwarmTopology;
    performance: PerformanceMetrics;
    connections?: ConnectionMap;
    leadership?: LeadershipInfo;
    latency: number;
    success: boolean;
    recommendations?: string[];
}
export interface StrategyMetrics {
    latency: number;
    throughput: number;
    reliability: number;
    scalability: number;
    resourceEfficiency: number;
}
export interface ResourceMetrics {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
}
export interface CoordinationConstraints {
    maxLatency: number;
    minReliability: number;
    resourceLimits: ResourceMetrics;
    securityLevel: 'low' | 'medium' | 'high';
}
export interface CoordinationHistory {
    timestamp: Date;
    action: string;
    agentId: string;
    result: 'success' | 'failure';
    metrics: Partial<StrategyMetrics>;
}
export interface ConnectionMap {
    [agentId: string]: string[];
}
export interface LeadershipInfo {
    leaders: string[];
    hierarchy: {
        [level: number]: string[];
    };
    maxDepth: number;
}
export interface PerformanceMetrics {
    executionTime: number;
    messageCount: number;
    coordinationEfficiency: number;
    resourceUtilization: ResourceMetrics;
}
export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';
export interface CoordinationStrategy<T extends Agent = Agent> {
    coordinate(agents: T[], context: CoordinationContext): Promise<CoordinationResult>;
    getMetrics(): StrategyMetrics;
    getTopologyType(): SwarmTopology;
    validateContext(context: CoordinationContext): boolean;
    optimize(agents: T[], history: CoordinationHistory[]): Promise<void>;
}
export declare class MeshStrategy implements CoordinationStrategy<Agent> {
    private metrics;
    coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult>;
    getMetrics(): StrategyMetrics;
    getTopologyType(): SwarmTopology;
    validateContext(context: CoordinationContext): boolean;
    optimize(_agents: Agent[], history: CoordinationHistory[]): Promise<void>;
    private establishMeshConnections;
    private calculateMeshPerformance;
    private measureLatency;
    private generateRecommendations;
}
export declare class HierarchicalStrategy implements CoordinationStrategy<Agent> {
    private metrics;
    coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult>;
    getMetrics(): StrategyMetrics;
    getTopologyType(): SwarmTopology;
    validateContext(context: CoordinationContext): boolean;
    optimize(agents: Agent[], history: CoordinationHistory[]): Promise<void>;
    private buildHierarchy;
    private optimizeHierarchy;
    private calculateHierarchicalLatency;
    private generateHierarchicalRecommendations;
}
export declare class RingStrategy implements CoordinationStrategy<Agent> {
    private metrics;
    coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult>;
    getMetrics(): StrategyMetrics;
    getTopologyType(): SwarmTopology;
    validateContext(context: CoordinationContext): boolean;
    optimize(agents: Agent[], history: CoordinationHistory[]): Promise<void>;
    private establishRingConnections;
    private calculateRingPerformance;
    private calculateRingLatency;
    private generateRingRecommendations;
}
export declare class StarStrategy implements CoordinationStrategy<Agent> {
    private metrics;
    coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult>;
    getMetrics(): StrategyMetrics;
    getTopologyType(): SwarmTopology;
    validateContext(context: CoordinationContext): boolean;
    optimize(_agents: Agent[], history: CoordinationHistory[]): Promise<void>;
    private selectHub;
    private establishStarConnections;
    private calculateStarPerformance;
    private calculateStarLatency;
    private generateStarRecommendations;
}
export declare class SwarmCoordinator<T extends Agent = Agent> extends EventEmitter {
    private strategy;
    private history;
    private optimizationInterval;
    constructor(strategy: CoordinationStrategy<T>);
    setStrategy(strategy: CoordinationStrategy<T>): void;
    executeCoordination(agents: T[], contextData?: Partial<CoordinationContext>): Promise<CoordinationResult>;
    getStrategy(): CoordinationStrategy<T>;
    getHistory(): CoordinationHistory[];
    clearHistory(): void;
    autoSelectStrategy(agents: T[], context: CoordinationContext): Promise<CoordinationStrategy<T>>;
    private buildContext;
    private logStrategyChange;
    private recordHistory;
    private scoreStrategy;
}
export declare class StrategyFactory {
    static createStrategy(topology: SwarmTopology): CoordinationStrategy;
    static getAllStrategies(): CoordinationStrategy[];
}
//# sourceMappingURL=strategy.d.ts.map