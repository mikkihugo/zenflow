/**
 * @file Coordination Event Adapter Types
 *
 * Type definitions for the coordination event adapter system,
 * including interfaces, configurations, and enums.
 */
import type { EventManagerConfig } from '../../core/interfaces';
import type { CoordinationEvent } from '../../types';
/**
 * Coordination event adapter configuration extending UEL EventManagerConfig.
 */
export interface CoordinationEventAdapterConfig extends EventManagerConfig {
    /** Swarm coordination integration settings */
    swarmCoordination?: {
        enabled: boolean;
        wrapLifecycleEvents?: boolean;
        wrapPerformanceEvents?: boolean;
        wrapTopologyEvents?: boolean;
        wrapHealthEvents?: boolean;
        coordinators?: string[];
    };
    /** Agent management integration settings */
    agentManagement?: {
        enabled: boolean;
        wrapAgentEvents?: boolean;
        wrapHealthEvents?: boolean;
        wrapRegistryEvents?: boolean;
        wrapLifecycleEvents?: boolean;
    };
    /** Task orchestration integration settings */
    taskOrchestration?: {
        enabled: boolean;
        wrapTaskEvents?: boolean;
        wrapDistributionEvents?: boolean;
        wrapExecutionEvents?: boolean;
        wrapCompletionEvents?: boolean;
    };
    /** Protocol management integration settings */
    protocolManagement?: {
        enabled: boolean;
        wrapCommunicationEvents?: boolean;
        wrapTopologyEvents?: boolean;
        wrapLifecycleEvents?: boolean;
        wrapCoordinationEvents?: boolean;
    };
    /** Performance optimization settings */
    performance?: {
        enableSwarmCorrelation?: boolean;
        enableAgentTracking?: boolean;
        enableTaskMetrics?: boolean;
        maxConcurrentCoordinations?: number;
        coordinationTimeout?: number;
        enablePerformanceTracking?: boolean;
    };
    /** Coordination correlation configuration */
    coordination?: {
        enabled: boolean;
        strategy: 'swarm' | 'agent' | 'task' | 'topology' | 'custom';
        correlationTTL: number;
        maxCorrelationDepth: number;
        correlationPatterns: string[];
        trackAgentCommunication: boolean;
        trackSwarmHealth: boolean;
    };
    /** Agent health monitoring configuration */
    agentHealthMonitoring?: {
        enabled: boolean;
        healthCheckInterval: number;
        agentHealthThresholds: Record<string, number>;
        swarmHealthThresholds: Record<string, number>;
        autoRecoveryEnabled: boolean;
    };
    /** Swarm optimization configuration */
    swarmOptimization?: {
        enabled: boolean;
        optimizationInterval: number;
        performanceThresholds: {
            latency: number;
            throughput: number;
            reliability: number;
        };
        autoScaling: boolean;
        loadBalancing: boolean;
    };
}
/**
 * Coordination event operation metrics for performance monitoring.
 */
export interface CoordinationEventMetrics {
    eventType: string;
    component: string;
    operation: string;
    executionTime: number;
    success: boolean;
    correlationId?: string;
    swarmId?: string;
    agentId?: string;
    taskId?: string;
    coordinationLatency?: number;
    resourceUsage?: {
        cpu: number;
        memory: number;
        network: number;
    };
    errorType?: string;
    recoveryAttempts?: number;
    timestamp: Date;
}
/**
 * Coordination correlation entry for tracking related events.
 */
export interface CoordinationCorrelation {
    correlationId: string;
    events: CoordinationEvent[];
    startTime: Date;
    lastUpdate: Date;
    swarmId?: string;
    agentIds: string[];
    taskIds: string[];
    operation: string;
    status: 'active' | 'completed' | 'failed' | 'timeout';
    performance: {
        totalLatency: number;
        coordinationEfficiency: number;
        resourceUtilization: number;
    };
    metadata: Record<string, unknown>;
}
/**
 * Coordination health tracking entry.
 */
export interface CoordinationHealthEntry {
    component: string;
    componentType: 'swarm' | 'agent' | 'orchestrator' | 'protocol';
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    consecutiveFailures: number;
    coordinationLatency: number;
    throughput: number;
    reliability: number;
    resourceUsage: {
        cpu: number;
        memory: number;
        network: number;
    };
    agentCount?: number;
    activeTaskCount?: number;
    metadata: Record<string, unknown>;
}
/**
 * Wrapped coordination component for unified event management.
 */
export interface WrappedCoordinationComponent {
    component?: unknown;
    componentType: 'swarm' | 'agent' | 'orchestrator' | 'protocol';
    wrapper: any;
    originalMethods: Map<string, Function>;
    eventMappings: Map<string, string>;
    isActive: boolean;
    healthMetrics: {
        lastSeen: Date;
        coordinationCount: number;
        errorCount: number;
        avgLatency: number;
    };
}
//# sourceMappingURL=types.d.ts.map