/**
 * Advanced Swarm Coordination Protocols.
 * Comprehensive system for sophisticated multi-agent collaboration.
 */
/**
 * @file Protocols module exports.
 */
export { type CommunicationNode, CommunicationProtocols, type ConsensusProposal, type ConsensusVote, type GossipState, type Message, type MessageHandler, type MessagePayload, type MessagePriority, type MessageType, } from './communication/communication-protocols.ts';
export { type AgentCapability, type DistributionMetrics, type TaskAssignment, type TaskComplexity, type TaskConstraints, type TaskDefinition, TaskDistributionEngine, type TaskPriority, type TaskRequirements, type TaskStatus, } from './distribution/task-distribution-engine.ts';
export { type AgentInstance, type AgentLifecycleConfig, AgentLifecycleManager, type AgentStatus, type AgentTemplate, type HealthStatus, type LifecycleMetrics, type ScalingDecision, type SpawnRequest, type SpawnResult, type TerminationRequest, type TerminationResult, } from './lifecycle/agent-lifecycle-manager.ts';
export { type AdaptationConfig, type BatchProcessor, type BatchSizingConfig, type CachingConfig, type ConnectionPool, type ConnectionPoolingConfig, type LatencyMetrics, type LoadPrediction, type MonitoringConfig, type OptimizationConfig, type PerformanceMetrics, PerformanceOptimizer, type ResourceMetrics, type ThroughputMetrics, } from './optimization/performance-optimizer.ts';
export { type ConsensusConfig, type ConsensusState, type CoordinationNode, CoordinationPatterns, type DelegationRequest, type ElectionMessage, type ElectionState, type EscalationRequest, type HierarchicalConfig, type HierarchyNode, type LeaderElectionConfig, type LogEntry, type WorkItem, type WorkQueue, type WorkStealingConfig, } from './patterns/coordination-patterns.ts';
export { type Connection, type NetworkNode, type TopologyConfig, type TopologyDecision, TopologyManager, type TopologyMetrics, type TopologyType, } from './topology/topology-manager.ts';
/**
 * Advanced Coordination System Factory.
 * Creates and configures integrated coordination systems.
 */
import type { ILogger } from '../../core/logger.ts';
import type { EventBusInterface as IEventBus } from '../core/event-bus.ts';
import { CommunicationProtocols } from './communication/communication-protocols.ts';
import { TaskDistributionEngine } from './distribution/task-distribution-engine.ts';
import { AgentLifecycleManager } from './lifecycle/agent-lifecycle-manager.ts';
import { PerformanceOptimizer } from './optimization/performance-optimizer.ts';
import { CoordinationPatterns } from './patterns/coordination-patterns.ts';
import { TopologyManager, type TopologyType } from './topology/topology-manager.ts';
export interface AdvancedCoordinationConfig {
    nodeId: string;
    topology: {
        type: TopologyType;
        parameters: Record<string, unknown>;
        constraints: {
            maxLatency: number;
            minBandwidth: number;
            faultTolerance: number;
            scalabilityTarget: number;
        };
        adaptation: {
            enabled: boolean;
            sensitivity: number;
            cooldownPeriod: number;
            maxSwitchesPerHour: number;
        };
    };
    distribution: {
        maxConcurrentTasks: number;
        defaultTimeout: number;
        qualityThreshold: number;
        loadBalanceTarget: number;
        enablePredictiveAssignment: boolean;
        enableDynamicRebalancing: boolean;
    };
    communication: {
        maxMessageHistory: number;
        messageTimeout: number;
        gossipInterval: number;
        heartbeatInterval: number;
        compressionThreshold: number;
        encryptionEnabled: boolean;
        consensusTimeout: number;
        maxHops: number;
    };
    lifecycle: {
        maxAgents: number;
        minAgents: number;
        spawnTimeout: number;
        shutdownTimeout: number;
        healthCheckInterval: number;
        performanceWindow: number;
        autoRestart: boolean;
        autoScale: boolean;
        resourceLimits: {
            maxCpuPercent: number;
            maxMemoryMB: number;
            maxNetworkMbps: number;
            maxDiskIOPS: number;
            maxOpenFiles: number;
            maxProcesses: number;
        };
        qualityThresholds: {
            minSuccessRate: number;
            minResponseTime: number;
            maxErrorRate: number;
            minReliability: number;
            minEfficiency: number;
        };
    };
    patterns: {
        election: {
            algorithm: 'bully' | 'ring' | 'raft' | 'fast-bully';
            timeoutMs: number;
            heartbeatInterval: number;
            maxRetries: number;
            priorityBased: boolean;
            minNodes: number;
        };
        consensus: {
            algorithm: 'raft' | 'pbft' | 'tendermint';
            electionTimeout: [number, number];
            heartbeatInterval: number;
            logReplicationTimeout: number;
            maxLogEntries: number;
            snapshotThreshold: number;
        };
        workStealing: {
            maxQueueSize: number;
            stealThreshold: number;
            stealRatio: number;
            retryInterval: number;
            maxRetries: number;
            loadBalancingInterval: number;
        };
        hierarchical: {
            maxDepth: number;
            fanOut: number;
            delegationThreshold: number;
            escalationTimeout: number;
            rebalanceInterval: number;
        };
    };
    optimization: {
        batchSizing: {
            initialSize: number;
            minSize: number;
            maxSize: number;
            adaptationRate: number;
            targetLatency: number;
            targetThroughput: number;
            windowSize: number;
        };
        connectionPooling: {
            initialSize: number;
            maxSize: number;
            minIdle: number;
            maxIdle: number;
            connectionTimeout: number;
            idleTimeout: number;
            keepAliveInterval: number;
            retryAttempts: number;
        };
        caching: {
            maxSize: number;
            ttl: number;
            refreshThreshold: number;
            compressionEnabled: boolean;
            deduplicationEnabled: boolean;
            prefetchEnabled: boolean;
        };
        monitoring: {
            metricsInterval: number;
            alertThresholds: {
                latency: number;
                throughput: number;
                errorRate: number;
                cpuUsage: number;
                memoryUsage: number;
                queueDepth: number;
                connectionUtilization: number;
            };
            historySizeLimit: number;
            anomalyDetection: boolean;
            predictionEnabled: boolean;
        };
        adaptation: {
            enabled: boolean;
            sensitivity: number;
            cooldownPeriod: number;
            maxChangesPerPeriod: number;
            learningRate: number;
            explorationRate: number;
        };
    };
}
export interface AdvancedCoordinationSystem {
    topologyManager: TopologyManager;
    distributionEngine: TaskDistributionEngine;
    communicationProtocols: CommunicationProtocols;
    lifecycleManager: AgentLifecycleManager;
    coordinationPatterns: CoordinationPatterns;
    performanceOptimizer: PerformanceOptimizer;
}
export interface CoordinationMetrics {
    topology: any;
    distribution: any;
    communication: any;
    lifecycle: any;
    patterns: any;
    optimization: any;
    overall: {
        efficiency: number;
        reliability: number;
        scalability: number;
        adaptability: number;
    };
}
/**
 * Create an integrated advanced coordination system.
 *
 * @param config
 * @param logger
 * @param eventBus
 * @example
 */
export declare function createAdvancedCoordinationSystem(config: AdvancedCoordinationConfig, logger: ILogger, eventBus: IEventBus): Promise<AdvancedCoordinationSystem>;
/**
 * Get comprehensive coordination metrics.
 *
 * @param systems
 * @example
 */
export declare function getCoordinationMetrics(systems: AdvancedCoordinationSystem): CoordinationMetrics;
/**
 * Shutdown coordination system gracefully.
 *
 * @param systems
 * @param logger
 * @example
 */
export declare function shutdownCoordinationSystem(systems: AdvancedCoordinationSystem, logger: ILogger): Promise<void>;
/**
 * Default configuration for advanced coordination system.
 *
 * @param nodeId
 * @example
 */
export declare function getDefaultCoordinationConfig(nodeId: string): AdvancedCoordinationConfig;
declare const _default: {
    createAdvancedCoordinationSystem: typeof createAdvancedCoordinationSystem;
    getCoordinationMetrics: typeof getCoordinationMetrics;
    shutdownCoordinationSystem: typeof shutdownCoordinationSystem;
    getDefaultCoordinationConfig: typeof getDefaultCoordinationConfig;
};
export default _default;
//# sourceMappingURL=index.d.ts.map