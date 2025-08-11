/**
 * Advanced Agent Lifecycle Management System
 * Provides dynamic agent spawning/termination, health monitoring,
 * automatic replacement, capability discovery, and performance ranking.
 */
/**
 * @file Agent-lifecycle management system.
 */
import { type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { EventBusInterface as IEventBus } from '../../core/event-bus.ts';
export interface AgentLifecycleConfig {
    maxAgents: number;
    minAgents: number;
    spawnTimeout: number;
    shutdownTimeout: number;
    healthCheckInterval: number;
    performanceWindow: number;
    autoRestart: boolean;
    autoScale: boolean;
    resourceLimits: ResourceLimits;
    qualityThresholds: QualityThresholds;
}
export interface ResourceLimits {
    maxCpuPercent: number;
    maxMemoryMB: number;
    maxNetworkMbps: number;
    maxDiskIOPS: number;
    maxOpenFiles: number;
    maxProcesses: number;
}
export interface QualityThresholds {
    minSuccessRate: number;
    minResponseTime: number;
    maxErrorRate: number;
    minReliability: number;
    minEfficiency: number;
}
export interface AgentTemplate {
    id: string;
    name: string;
    type: string;
    executable: string;
    args: string[];
    environment: Record<string, string>;
    capabilities: string[];
    resources: ResourceRequirements;
    healthCheck: HealthCheckConfig;
    scaling: ScalingConfig;
    metadata: Record<string, unknown>;
}
export interface ResourceRequirements {
    cpu: number;
    memory: number;
    network: number;
    disk: number;
    gpu?: number;
    priority: number;
}
export interface HealthCheckConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    endpoint?: string;
    command?: string;
    expectedOutput?: string;
    thresholds: {
        cpu: number;
        memory: number;
        responseTime: number;
        errorRate: number;
    };
}
export interface ScalingConfig {
    minInstances: number;
    maxInstances: number;
    targetUtilization: number;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    cooldownPeriod: number;
    strategy: 'reactive' | 'predictive' | 'scheduled';
}
export interface AgentInstance {
    id: string;
    templateId: string;
    name: string;
    type: string;
    status: AgentStatus;
    process?: ChildProcess;
    pid?: number;
    startTime: Date;
    lastSeen: Date;
    health: HealthStatus;
    performance: PerformanceMetrics;
    resources: ResourceUsage;
    capabilities: DiscoveredCapabilities;
    assignments: TaskAssignment[];
    errors: AgentError[];
    metadata: Record<string, unknown>;
}
export type AgentStatus = 'spawning' | 'initializing' | 'ready' | 'active' | 'idle' | 'busy' | 'degraded' | 'unhealthy' | 'terminating' | 'terminated' | 'failed';
export interface HealthStatus {
    overall: number;
    components: {
        responsiveness: number;
        performance: number;
        reliability: number;
        resourceUsage: number;
        connectivity: number;
    };
    issues: HealthIssue[];
    trend: 'improving' | 'stable' | 'degrading';
    lastCheck: Date;
}
export interface HealthIssue {
    type: 'performance' | 'reliability' | 'resource' | 'connectivity' | 'security';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
    resolution?: string;
    impact: number;
}
export interface PerformanceMetrics {
    tasksCompleted: number;
    tasksFailed: number;
    averageResponseTime: number;
    successRate: number;
    throughput: number;
    efficiency: number;
    reliability: number;
    qualityScore: number;
    uptime: number;
    lastActivity: Date;
    trends: PerformanceTrend[];
}
export interface PerformanceTrend {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    rate: number;
    confidence: number;
    period: number;
}
export interface ResourceUsage {
    cpu: number;
    memory: number;
    network: number;
    disk: number;
    gpu?: number;
    handles: number;
    threads: number;
    timestamp: Date;
}
export interface DiscoveredCapabilities {
    declared: string[];
    verified: string[];
    inferred: string[];
    specialized: string[];
    quality: Record<string, number>;
    confidence: Record<string, number>;
    lastUpdated: Date;
}
export interface TaskAssignment {
    taskId: string;
    assignedAt: Date;
    expectedDuration: number;
    status: 'assigned' | 'active' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    quality: number;
}
export interface AgentError {
    timestamp: Date;
    type: 'startup' | 'runtime' | 'communication' | 'resource' | 'task' | 'shutdown';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    stack?: string;
    context: Record<string, unknown>;
    recovered: boolean;
    recovery?: string;
}
export interface SpawnRequest {
    templateId: string;
    count: number;
    priority: number;
    constraints?: Record<string, unknown>;
    timeout?: number;
    requester: string;
    reason: string;
}
export interface SpawnResult {
    success: boolean;
    agentIds: string[];
    failures: Array<{
        error: string;
        reason: string;
    }>;
    duration: number;
}
export interface TerminationRequest {
    agentIds: string[];
    reason: string;
    graceful: boolean;
    timeout?: number;
    requester: string;
}
export interface TerminationResult {
    success: boolean;
    terminated: string[];
    failures: Array<{
        agentId: string;
        error: string;
    }>;
    duration: number;
}
export interface ScalingDecision {
    action: 'scale_up' | 'scale_down' | 'no_action';
    targetCount: number;
    currentCount: number;
    reasoning: string[];
    confidence: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}
export interface LifecycleMetrics {
    totalAgents: number;
    agentsByStatus: Record<AgentStatus, number>;
    agentsByType: Record<string, number>;
    spawnRate: number;
    terminationRate: number;
    averageLifetime: number;
    averageHealth: number;
    resourceUtilization: ResourceUsage;
    failureRate: number;
    recoveryRate: number;
}
/**
 * Advanced Agent Lifecycle Manager with intelligent orchestration.
 *
 * @example
 */
export declare class AgentLifecycleManager extends EventEmitter {
    private config;
    private logger;
    private eventBus;
    private agents;
    private templates;
    private spawnQueue;
    private terminationQueue;
    private healthMonitor;
    private performanceTracker;
    private capabilityDiscovery;
    private scalingEngine;
    private recoveryEngine;
    private metrics;
    private processingInterval?;
    private healthInterval?;
    private scalingInterval?;
    constructor(config: AgentLifecycleConfig, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    /**
     * Register an agent template.
     *
     * @param template
     */
    registerTemplate(template: AgentTemplate): Promise<void>;
    /**
     * Spawn agents from template.
     *
     * @param request
     */
    spawnAgents(request: SpawnRequest): Promise<SpawnResult>;
    /**
     * Terminate agents.
     *
     * @param request
     */
    terminateAgents(request: TerminationRequest): Promise<TerminationResult>;
    /**
     * Get agent status.
     *
     * @param agentId
     */
    getAgent(agentId: string): AgentInstance | undefined;
    /**
     * Get all agents.
     */
    getAllAgents(): AgentInstance[];
    /**
     * Get agents by status.
     *
     * @param status
     */
    getAgentsByStatus(status: AgentStatus): AgentInstance[];
    /**
     * Get agents by type.
     *
     * @param type
     */
    getAgentsByType(type: string): AgentInstance[];
    /**
     * Get lifecycle metrics.
     */
    getMetrics(): LifecycleMetrics;
    /**
     * Get scaling recommendation.
     */
    getScalingRecommendation(): Promise<ScalingDecision>;
    /**
     * Manually trigger scaling.
     *
     * @param templateId
     * @param targetCount
     */
    triggerScaling(templateId: string, targetCount: number): Promise<void>;
    /**
     * Force health check on agent.
     *
     * @param agentId
     */
    checkAgentHealth(agentId: string): Promise<HealthStatus>;
    /**
     * Get agent performance ranking.
     *
     * @param type
     */
    getPerformanceRanking(type?: string): Array<{
        agentId: string;
        score: number;
        rank: number;
    }>;
    private spawnSingleAgent;
    private terminateSingleAgent;
    private createAgentProcess;
    private waitForAgentReady;
    private gracefulShutdown;
    private startAgentMonitoring;
    private stopAgentMonitoring;
    private startProcessing;
    private processSpawnQueue;
    private processTerminationQueue;
    private performHealthChecks;
    private detectUnhealthyAgents;
    private handleUnhealthyAgent;
    private performAutoScaling;
    private executeScalingDecision;
    private selectAgentsForTermination;
    private calculatePerformanceScore;
    private updateMetrics;
    private calculateSpawnRate;
    private calculateTerminationRate;
    private calculateAverageLifetime;
    private calculateResourceUtilization;
    private calculateFailureRate;
    private calculateRecoveryRate;
    private handleAgentHeartbeat;
    private handleTaskCompletion;
    private handleTaskFailure;
    private handleAgentError;
    private handleResourcePressure;
    private handleDemandChange;
    private handleProcessExit;
    private handleProcessError;
    private handleProcessOutput;
    private addAgentError;
    private generateAgentId;
    private initializeHealth;
    private initializePerformance;
    private initializeResourceUsage;
    private initializeCapabilities;
    private initializeMetrics;
    shutdown(): Promise<void>;
}
export default AgentLifecycleManager;
//# sourceMappingURL=agent-lifecycle-manager.d.ts.map