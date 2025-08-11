/**
 * Comprehensive agent management system.
 */
/**
 * @file Agent management system.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus } from '../../core/event-bus.ts';
import type { ILogger } from '../../core/logger.ts';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';
import type { AgentCapabilities, AgentConfig, AgentEnvironment, AgentId, AgentState, AgentStatus, AgentType } from '../types.ts';
export interface AgentManagerConfig {
    maxAgents: number;
    defaultTimeout: number;
    heartbeatInterval: number;
    healthCheckInterval: number;
    autoRestart: boolean;
    resourceLimits: {
        memory: number;
        cpu: number;
        disk: number;
    };
    agentDefaults: {
        autonomyLevel: number;
        learningEnabled: boolean;
        adaptationEnabled: boolean;
    };
    environmentDefaults: {
        runtime: 'deno' | 'node' | 'claude' | 'browser';
        workingDirectory: string;
        tempDirectory: string;
        logDirectory: string;
    };
}
export interface AgentTemplate {
    name: string;
    type: AgentType;
    capabilities: AgentCapabilities;
    config: Partial<AgentConfig>;
    environment: Partial<AgentEnvironment>;
    startupScript?: string;
    dependencies?: string[];
}
export interface AgentCluster {
    id: string;
    name: string;
    agents: AgentId[];
    coordinator: AgentId;
    strategy: 'round-robin' | 'load-based' | 'capability-based';
    maxSize: number;
    autoScale: boolean;
}
export interface AgentPool {
    id: string;
    name: string;
    type: AgentType;
    minSize: number;
    maxSize: number;
    currentSize: number;
    availableAgents: AgentId[];
    busyAgents: AgentId[];
    template: AgentTemplate;
    autoScale: boolean;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
}
export interface ScalingPolicy {
    name: string;
    enabled: boolean;
    rules: ScalingRule[];
    cooldownPeriod: number;
    maxScaleOperations: number;
}
export interface ScalingRule {
    metric: string;
    threshold: number;
    comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    action: 'scale-up' | 'scale-down';
    amount: number;
    conditions?: string[];
}
export interface AgentHealth {
    agentId: string;
    overall: number;
    components: {
        responsiveness: number;
        performance: number;
        reliability: number;
        resourceUsage: number;
    };
    issues: HealthIssue[];
    lastCheck: Date;
    trend: 'improving' | 'stable' | 'degrading';
}
export interface HealthIssue {
    type: 'performance' | 'reliability' | 'resource' | 'communication';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
    recommendedAction?: string;
}
/**
 * Comprehensive agent management system.
 *
 * @example
 */
export declare class AgentManager extends EventEmitter {
    private logger;
    private eventBus;
    private memory;
    private config;
    private agents;
    private processes;
    private templates;
    private clusters;
    private pools;
    private healthChecks;
    private healthInterval?;
    private heartbeatInterval?;
    private scalingPolicies;
    private resourceUsage;
    private performanceHistory;
    constructor(config: Partial<AgentManagerConfig>, logger: ILogger, eventBus: IEventBus, memory: MemoryCoordinator);
    private setupEventHandlers;
    private initializeDefaultTemplates;
    private initializeSpecializedTemplates;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    createAgent(templateName: string, overrides?: {
        name?: string;
        config?: Partial<AgentConfig>;
        environment?: Partial<AgentEnvironment>;
    }): Promise<string>;
    startAgent(agentId: string): Promise<void>;
    stopAgent(agentId: string, reason?: string): Promise<void>;
    restartAgent(agentId: string, reason?: string): Promise<void>;
    removeAgent(agentId: string): Promise<void>;
    createAgentPool(name: string, templateName: string, config: {
        minSize: number;
        maxSize: number;
        autoScale?: boolean;
        scaleUpThreshold?: number;
        scaleDownThreshold?: number;
    }): Promise<string>;
    scalePool(poolId: string, targetSize: number): Promise<void>;
    private startHealthMonitoring;
    private startHeartbeatMonitoring;
    private performHealthChecks;
    private checkAgentHealth;
    private checkResponsiveness;
    private calculatePerformanceScore;
    private calculateReliabilityScore;
    private calculateResourceScore;
    private detectHealthIssues;
    private checkHeartbeats;
    private spawnAgentProcess;
    private waitForAgentReady;
    private waitForProcessExit;
    private handleProcessExit;
    private handleProcessError;
    private handleHeartbeat;
    private handleAgentError;
    private updateAgentStatus;
    private updateAgentWorkload;
    private updateAgentMetrics;
    private updateResourceUsage;
    private addAgentError;
    private createDefaultMetrics;
    private createDefaultHealth;
    private removeAgentFromPoolsAndClusters;
    private initializeScalingPolicies;
    getAgent(agentId: string): AgentState | undefined;
    getAllAgents(): AgentState[];
    getAgentsByType(type: AgentType): AgentState[];
    getAgentsByStatus(status: AgentStatus): AgentState[];
    getAgentHealth(agentId: string): AgentHealth | undefined;
    getPool(poolId: string): AgentPool | undefined;
    getAllPools(): AgentPool[];
    getAgentTemplates(): AgentTemplate[];
    getSystemStats(): {
        totalAgents: number;
        activeAgents: number;
        healthyAgents: number;
        pools: number;
        clusters: number;
        averageHealth: number;
        resourceUtilization: {
            cpu: number;
            memory: number;
            disk: number;
        };
    };
}
//# sourceMappingURL=agent-manager.d.ts.map