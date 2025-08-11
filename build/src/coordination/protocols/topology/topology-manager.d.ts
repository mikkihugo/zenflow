/**
 * Advanced Dynamic Topology Management System
 * Provides intelligent, adaptive topology switching based on workload patterns
 * and performance metrics with fault tolerance and self-healing capabilities.
 */
/**
 * @file Topology management system.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { EventBusInterface as IEventBus } from '../../core/event-bus.ts';
export type TopologyType = 'mesh' | 'hierarchical' | 'ring' | 'star' | 'hybrid' | 'small-world' | 'scale-free';
export interface TopologyConfig {
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
}
export interface NetworkNode {
    id: string;
    type: 'agent' | 'broker' | 'coordinator' | 'gateway';
    capabilities: string[];
    connections: Map<string, Connection>;
    metrics: NodeMetrics;
    location: {
        x: number;
        y: number;
        z?: number;
    };
    lastSeen: Date;
    health: number;
}
export interface Connection {
    targetId: string;
    type: 'direct' | 'relay' | 'broadcast' | 'multicast';
    quality: ConnectionQuality;
    traffic: TrafficStats;
    established: Date;
    lastActivity: Date;
}
export interface ConnectionQuality {
    latency: number;
    bandwidth: number;
    reliability: number;
    jitter: number;
    packetLoss: number;
}
export interface TrafficStats {
    bytesIn: number;
    bytesOut: number;
    messagesIn: number;
    messagesOut: number;
    errors: number;
    lastReset: Date;
}
export interface NodeMetrics {
    cpuUsage: number;
    memoryUsage: number;
    networkUsage: number;
    taskLoad: number;
    responseTime: number;
    uptime: number;
}
export interface TopologyMetrics {
    networkDiameter: number;
    avgPathLength: number;
    clusteringCoefficient: number;
    redundancy: number;
    loadBalance: number;
    communicationEfficiency: number;
    faultTolerance: number;
}
export interface TopologyDecision {
    currentTopology: TopologyType;
    recommendedTopology: TopologyType;
    confidence: number;
    reason: string;
    expectedImprovement: number;
    migrationCost: number;
    riskLevel: 'low' | 'medium' | 'high';
}
/**
 * Intelligent topology management with ML-based optimization.
 *
 * @example
 */
export declare class TopologyManager extends EventEmitter {
    private logger;
    private eventBus;
    private nodes;
    private currentConfig;
    private metrics;
    private topologyHistory;
    private adaptationEngine;
    private networkOptimizer;
    private faultDetector;
    private migrationController;
    private monitoringInterval?;
    private lastMigration;
    constructor(initialConfig: TopologyConfig, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    /**
     * Register a new node in the topology.
     *
     * @param nodeConfig
     * @param nodeConfig.id
     * @param nodeConfig.type
     * @param nodeConfig.capabilities
     * @param nodeConfig.location
     * @param nodeConfig.location.x
     * @param nodeConfig.location.y
     * @param nodeConfig.location.z
     */
    registerNode(nodeConfig: {
        id: string;
        type: NetworkNode['type'];
        capabilities: string[];
        location?: {
            x: number;
            y: number;
            z?: number;
        };
    }): Promise<void>;
    /**
     * Remove a node from the topology.
     *
     * @param nodeId
     */
    unregisterNode(nodeId: string): Promise<void>;
    /**
     * Get current topology metrics.
     */
    getTopologyMetrics(): TopologyMetrics;
    /**
     * Get topology decision recommendation.
     */
    getTopologyDecision(): Promise<TopologyDecision>;
    /**
     * Manually trigger topology migration.
     *
     * @param targetTopology
     * @param force
     */
    migrateTopology(targetTopology: TopologyType, force?: boolean): Promise<boolean>;
    /**
     * Get network topology visualization data.
     */
    getTopologyVisualization(): {
        nodes: Array<{
            id: string;
            type: string;
            x: number;
            y: number;
            health: number;
        }>;
        edges: Array<{
            source: string;
            target: string;
            quality: number;
            type: string;
        }>;
        metrics: TopologyMetrics;
    };
    /**
     * Force network optimization.
     */
    optimizeNetwork(): Promise<void>;
    private establishNodeConnections;
    private disconnectNodeConnections;
    private getConnectionStrategy;
    private startMonitoring;
    private updateTopologyMetrics;
    private calculateTopologyMetrics;
    private calculateNetworkDiameter;
    private calculateAveragePathLength;
    private calculateClusteringCoefficient;
    private calculateRedundancy;
    private calculateLoadBalance;
    private calculateCommunicationEfficiency;
    private calculateFaultTolerance;
    private calculateConnectivity;
    private dfsVisit;
    private countAlternatePaths;
    private checkForOptimizationNeeds;
    private performHealthChecks;
    private handleUnhealthyNode;
    private attemptNodeRecovery;
    private scheduleTopologyOptimization;
    private executeMigration;
    private handleNodeMetricsUpdate;
    private handleConnectionQualityChange;
    private handleNetworkFault;
    private handleWorkloadPatternChange;
    private handleNodeFailure;
    private initializeMetrics;
    private initializeNodeMetrics;
    private initializeTrafficStats;
    shutdown(): Promise<void>;
}
export default TopologyManager;
//# sourceMappingURL=topology-manager.d.ts.map