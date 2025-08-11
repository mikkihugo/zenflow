/**
 * Advanced Task Distribution Engine
 * Provides intelligent task decomposition, optimal agent assignment,
 * dynamic work redistribution, and priority-based scheduling.
 */
/**
 * @file Task-distribution processing engine.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../../core/logger.ts';
import type { EventBusInterface as IEventBus } from '../../core/event-bus.ts';
export interface TaskDefinition {
    id: string;
    name: string;
    description: string;
    type: string;
    priority: TaskPriority;
    complexity: TaskComplexity;
    requirements: TaskRequirements;
    constraints: TaskConstraints;
    dependencies: TaskDependency[];
    estimatedDuration: number;
    deadline?: Date;
    metadata: Record<string, unknown>;
    created: Date;
    submittedBy: string;
}
export interface TaskDependency {
    taskId: string;
    type: 'blocking' | 'soft' | 'data' | 'resource';
    weight: number;
    condition?: string;
}
export interface TaskRequirements {
    capabilities: string[];
    minAgents: number;
    maxAgents: number;
    preferredAgents?: string[];
    excludedAgents?: string[];
    resourceRequirements: ResourceRequirements;
    qualityRequirements: QualityRequirements;
}
export interface ResourceRequirements {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
    gpu?: number;
    specializedTools?: string[];
}
export interface QualityRequirements {
    accuracy: number;
    speed: number;
    reliability: number;
    completeness: number;
}
export interface TaskConstraints {
    startAfter?: Date;
    completeBefore?: Date;
    maxRetries: number;
    timeoutMs: number;
    isolationLevel: 'none' | 'process' | 'container' | 'vm';
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
}
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type TaskComplexity = 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert';
export type TaskStatus = 'pending' | 'queued' | 'assigned' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type CancellationReason = 'user-request' | 'timeout' | 'resource-unavailable' | 'dependency-failure' | 'priority-override' | 'system-shutdown' | 'agent-failure' | 'task_stuck' | 'agent_unavailable';
export interface DecomposedTask {
    id: string;
    parentId: string;
    subtasks: SubTask[];
    executionPlan: ExecutionPlan;
    coordination: CoordinationStrategy;
}
export interface SubTask {
    id: string;
    name: string;
    description: string;
    type: string;
    requirements: TaskRequirements;
    dependencies: string[];
    estimatedDuration: number;
    criticalPath: boolean;
    parallelizable: boolean;
    order: number;
}
export interface ExecutionPlan {
    strategy: 'sequential' | 'parallel' | 'pipeline' | 'adaptive';
    phases: ExecutionPhase[];
    checkpoints: Checkpoint[];
    rollbackPlan: RollbackStep[];
}
export interface ExecutionPhase {
    id: string;
    name: string;
    subtasks: string[];
    parallelism: number;
    timeout: number;
    successCriteria: string[];
}
export interface Checkpoint {
    id: string;
    afterPhase: string;
    validationRules: ValidationRule[];
    rollbackTriggers: string[];
}
export interface ValidationRule {
    condition: string;
    severity: 'warning' | 'error' | 'critical';
    action: 'continue' | 'pause' | 'rollback' | 'fail';
}
export interface RollbackStep {
    action: string;
    parameters: Record<string, unknown>;
    timeout: number;
}
export interface CoordinationStrategy {
    type: 'centralized' | 'distributed' | 'hierarchical' | 'peer-to-peer';
    coordinator?: string;
    communicationPattern: 'broadcast' | 'multicast' | 'point-to-point' | 'gossip';
    syncPoints: string[];
    conflictResolution: 'priority' | 'consensus' | 'coordinator' | 'voting';
}
export interface AgentCapability {
    agentId: string;
    capabilities: string[];
    currentLoad: number;
    maxLoad: number;
    performance: PerformanceProfile;
    availability: AvailabilityProfile;
    trustScore: number;
    specializations: string[];
    cost: number;
}
export interface PerformanceProfile {
    taskTypes: Record<string, PerformanceMetrics>;
    overall: PerformanceMetrics;
    trends: PerformanceTrend[];
}
export interface PerformanceMetrics {
    successRate: number;
    averageTime: number;
    qualityScore: number;
    efficiency: number;
    reliability: number;
    lastUpdated: Date;
    sampleSize: number;
}
export interface PerformanceTrend {
    metric: string;
    direction: 'improving' | 'stable' | 'declining';
    slope: number;
    confidence: number;
}
export interface AvailabilityProfile {
    currentStatus: 'available' | 'busy' | 'maintenance' | 'offline';
    utilization: number;
    predictedAvailability: PredictedSlot[];
    workingHours?: {
        start: number;
        end: number;
    };
    maintenanceWindows: TimeWindow[];
}
export interface PredictedSlot {
    start: Date;
    end: Date;
    probability: number;
    capacity: number;
}
export interface TimeWindow {
    start: Date;
    end: Date;
    recurring?: 'daily' | 'weekly' | 'monthly';
    description?: string;
}
export interface TaskAssignment {
    taskId: string;
    agentId: string;
    assignedAt: Date;
    expectedCompletion: Date;
    assignment: AssignmentDetails;
    monitoring: AssignmentMonitoring;
}
export interface AssignmentDetails {
    confidence: number;
    reasoning: string[];
    alternativeAgents: string[];
    resourceAllocation: ResourceAllocation;
    qualityExpectation: QualityExpectation;
}
export interface ResourceAllocation {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
    gpu?: number;
    priority: number;
}
export interface QualityExpectation {
    accuracy: number;
    speed: number;
    completeness: number;
    confidence: number;
}
export interface AssignmentMonitoring {
    checkInterval: number;
    progressTracking: boolean;
    qualityChecks: QualityCheck[];
    escalationTriggers: EscalationTrigger[];
}
export interface QualityCheck {
    checkType: 'progress' | 'output' | 'resource' | 'performance';
    frequency: number;
    threshold: number;
    action: 'warn' | 'escalate' | 'reassign' | 'terminate';
}
export interface EscalationTrigger {
    condition: string;
    threshold: number;
    action: 'notify' | 'reassign' | 'add_agents' | 'priority_boost';
    target?: string;
}
export interface DistributionMetrics {
    totalTasks: number;
    queuedTasks: number;
    runningTasks: number;
    completedTasks: number;
    failedTasks: number;
    avgWaitTime: number;
    avgExecutionTime: number;
    agentUtilization: Record<string, number>;
    throughput: number;
    successRate: number;
    loadBalance: number;
    resourceEfficiency: number;
}
/**
 * Advanced Task Distribution Engine with ML-based optimization.
 *
 * @example
 */
export declare class TaskDistributionEngine extends EventEmitter {
    private config;
    private logger;
    private eventBus;
    private tasks;
    private decomposedTasks;
    private assignments;
    private agentCapabilities;
    private queue;
    private decomposer;
    private assignmentOptimizer;
    private workloadBalancer;
    private performancePredictor;
    private failureHandler;
    private metrics;
    private processingInterval?;
    constructor(config: {
        maxConcurrentTasks: number;
        defaultTimeout: number;
        qualityThreshold: number;
        loadBalanceTarget: number;
        enablePredictiveAssignment: boolean;
        enableDynamicRebalancing: boolean;
    }, logger: ILogger, eventBus: IEventBus);
    private setupEventHandlers;
    /**
     * Submit a task for distribution.
     *
     * @param taskDef
     */
    submitTask(taskDef: Omit<TaskDefinition, 'id' | 'created'>): Promise<string>;
    /**
     * Register an agent's capabilities.
     *
     * @param agentCapability
     */
    registerAgent(agentCapability: AgentCapability): Promise<void>;
    /**
     * Get current distribution metrics.
     */
    getMetrics(): DistributionMetrics;
    /**
     * Get task status.
     *
     * @param taskId
     */
    getTaskStatus(taskId: string): TaskStatus | undefined;
    /**
     * Cancel a task.
     *
     * @param taskId
     * @param reason
     */
    cancelTask(taskId: string, reason: CancellationReason): Promise<boolean>;
    /**
     * Reassign a task to a different agent.
     *
     * @param taskId
     * @param reason
     */
    reassignTask(taskId: string, reason: CancellationReason): Promise<boolean>;
    /**
     * Get queue status.
     */
    getQueueStatus(): {
        pending: number;
        processing: number;
        agents: {
            available: number;
            busy: number;
            offline: number;
            utilization: Record<string, number>;
        };
    };
    private startProcessing;
    private processQueue;
    private findOptimalAssignment;
    private isAgentSuitable;
    private assignTask;
    private calculateAssignmentConfidence;
    private generateAssignmentReasoning;
    private findAlternativeAgents;
    private calculateCapabilityMatch;
    private calculatePerformanceScore;
    private calculateAgentScore;
    private calculateResourceAllocation;
    private calculateQualityExpectation;
    private createMonitoringPlan;
    private getPriorityWeight;
    private subtaskToTask;
    private optimizeAssignments;
    private updateMetrics;
    private calculateLoadBalance;
    private calculateResourceEfficiency;
    private performHealthChecks;
    private rebalanceWorkload;
    private detectLoadImbalance;
    private handleStuckTask;
    private handleAgentRegistration;
    private handleAgentCapabilitiesUpdate;
    private handleAgentPerformanceUpdate;
    private handleTaskProgressUpdate;
    private handleTaskCompletion;
    private handleTaskFailure;
    private handleAgentUnavailable;
    private generateTaskId;
    private initializeMetrics;
    shutdown(): Promise<void>;
}
export default TaskDistributionEngine;
//# sourceMappingURL=task-distribution-engine.d.ts.map