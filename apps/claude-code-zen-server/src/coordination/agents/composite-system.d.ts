/**
 * @file Composite Pattern Implementation for Agent Hierarchies
 * Provides uniform interfaces for individual agents and agent groups.
 */
import { EventEmitter } from 'node:events';
export interface AgentCapability {
    name: string;
    version: string;
    description: string;
    parameters?: Record<string, unknown>;
    resourceRequirements?: ResourceRequirements;
}
export interface ResourceRequirements {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
}
export interface ResourceAllocation {
    allocated: ResourceRequirements;
    used: ResourceRequirements;
    available: ResourceRequirements;
    efficiency: number;
}
export interface TaskDefinition {
    id: string;
    type: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    payload: Record<string, unknown>;
    requirements: {
        capabilities: string[];
        resources: ResourceRequirements;
        timeout?: number;
    };
    dependencies?: string[];
    metadata?: Record<string, unknown>;
}
export interface TaskResult {
    taskId: string;
    agentId: string;
    success: boolean;
    result?: string;
    executionTime: number;
    timestamp: Date;
    error?: {
        message: string;
    };
    status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    startTime?: Date;
    endTime?: Date;
    outputs?: Record<string, unknown>;
    metrics?: TaskMetrics;
}
export interface TaskMetrics {
    executionTime: number;
    resourceUsage: ResourceRequirements;
    memoryPeak: number;
    cpuPeak: number;
    networkUsage: number;
    errorCount: number;
    retryCount: number;
}
export interface AgentStatus {
    id: string;
    state: 'initializing' | 'idle' | 'busy' | 'error' | 'offline';
    health: number;
    uptime: number;
    currentTask?: string;
    queuedTasks: number;
    completedTasks: number;
    failedTasks: number;
    totalCompletedTasks: number;
    totalFailedTasks: number;
    averageExecutionTime: number;
    minExecutionTime: number;
    maxExecutionTime: number;
    lastActivity: Date;
    currentTasks: number;
    lastTaskTimestamp: Date;
    resourceUtilization: {
        cpu: number;
        memory: number;
        network: number;
        storage: number;
    };
    resources: ResourceAllocation;
}
export interface AgentMetrics {
    totalTasks: number;
    successRate: number;
    averageExecutionTime: number;
    resourceEfficiency: number;
    reliability: number;
    lastWeekActivity: number[];
    capabilities: AgentCapability[];
}
export interface AgentConfig {
    maxConcurrentTasks?: number;
    capabilities?: AgentCapability[];
    taskExecutor?: (task: TaskDefinition) => Promise<TaskResult>;
    loadBalancing?: LoadBalancingStrategy;
    failureHandling?: 'retry' | 'skip' | 'cascade';
    maxRetries?: number;
    [key: string]: unknown;
}
export type LoadBalancingStrategy = 'round-robin' | 'least-loaded' | 'capability-based';
export interface AgentComponent extends EventEmitter {
    getId(): string;
    getName(): string;
    getType(): 'individual' | 'group' | 'composite';
    getCapabilities(): AgentCapability[];
    getStatus(): AgentStatus | CompositeStatus;
    getMetrics(): AgentMetrics | CompositeMetrics;
    executeTask(task: TaskDefinition): Promise<TaskResult>;
    canHandleTask(task: TaskDefinition): boolean;
    addCapability(capability: AgentCapability): void;
    removeCapability(capabilityName: string): void;
    allocateResources(requirements: ResourceRequirements): boolean;
    releaseResources(requirements: ResourceRequirements): void;
    getAvailableResources(): ResourceRequirements;
    initialize(config: AgentConfig): Promise<void>;
    shutdown(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
}
export declare class Agent extends EventEmitter implements AgentComponent {
    private id;
    private name;
    private capabilities;
    private status;
    private currentTask?;
    private taskQueue;
    private taskHistory;
    private maxConcurrentTasks;
    private resourceLimits;
    private taskExecutor?;
    private executionStats;
    constructor(id: string, name: string, initialCapabilities?: AgentCapability[], resourceLimits?: ResourceRequirements);
    getId(): string;
    getName(): string;
    getType(): 'individual' | 'group' | 'composite';
    getCapabilities(): AgentCapability[];
    getStatus(): AgentStatus;
    getMetrics(): AgentMetrics;
    executeTask(task: TaskDefinition): Promise<TaskResult>;
    canHandleTask(task: TaskDefinition): boolean;
    addCapability(capability: AgentCapability): void;
    removeCapability(capabilityName: string): void;
    allocateResources(requirements: ResourceRequirements): boolean;
    releaseResources(requirements: ResourceRequirements): void;
    getResourceLimits(): ResourceRequirements;
    getAvailableResources(): ResourceRequirements;
    initialize(config: AgentConfig): Promise<void>;
    shutdown(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    private executeTaskImmediately;
    private performTaskExecution;
    private estimateTaskResources;
    private estimateExecutionTime;
    private canAllocateResources;
    private updateAvailableResources;
    private updateHealth;
    private processTaskQueue;
    private cancelCurrentTask;
    private generateWeeklyActivity;
    private updateExecutionStats;
}
export interface CompositeStatus {
    id: string;
    state: 'active' | 'partial' | 'inactive' | 'shutdown';
    health: number;
    memberCount: number;
    totalMembers: number;
    activeMemberCount: number;
    totalQueuedTasks: number;
    totalCompletedTasks: number;
    totalFailedTasks: number;
    currentTasks: number;
    averageExecutionTime: number;
    minExecutionTime: number;
    maxExecutionTime: number;
    uptime: number;
    lastActivity: Date;
    lastTaskTimestamp: Date;
    resourceUtilization: {
        cpu: number;
        memory: number;
        network: number;
        storage: number;
    };
    resourceCapacity: {
        cpu: number;
        memory: number;
        network: number;
        storage: number;
    };
    hierarchyDepth?: number;
    resources: {
        totalAllocated: ResourceRequirements;
        totalAvailable: ResourceRequirements;
        averageEfficiency: number;
    };
}
export interface CompositeMetrics {
    totalTasks: number;
    successRate: number;
    averageExecutionTime: number;
    resourceEfficiency: number;
    reliability: number;
    lastWeekActivity: number[];
    capabilities: AgentCapability[];
    memberMetrics: {
        totalMembers: number;
        activeMembers: number;
        averageHealth: number;
        distributionByType: Record<string, number>;
    };
}
export declare class AgentGroup extends EventEmitter implements AgentComponent {
    private id;
    private name;
    private members;
    private groupCapabilities;
    private loadBalancingStrategy;
    private currentRoundRobinIndex;
    private isShutdown;
    constructor(id: string, name: string, members?: AgentComponent[]);
    getId(): string;
    getName(): string;
    getType(): 'individual' | 'group' | 'composite';
    getCapabilities(): AgentCapability[];
    getStatus(): CompositeStatus;
    getMetrics(): CompositeMetrics;
    executeTask(task: TaskDefinition): Promise<TaskResult>;
    canHandleTask(task: TaskDefinition): boolean;
    addCapability(capability: AgentCapability): void;
    removeCapability(capabilityName: string): void;
    allocateResources(requirements: ResourceRequirements): boolean;
    releaseResources(requirements: ResourceRequirements): void;
    getAvailableResources(): ResourceRequirements;
    initialize(config: AgentConfig): Promise<void>;
    shutdown(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    addMember(member: AgentComponent): void;
    removeMember(memberId: string): boolean;
    getMember(memberId: string): AgentComponent | undefined;
    getMembers(): AgentComponent[];
    getMemberIds(): string[];
    setLoadBalancingStrategy(strategy: LoadBalancingStrategy): void;
    getLoadBalancingStrategy(): LoadBalancingStrategy;
    getTotalAgentCount(): number;
    broadcastTask(task: TaskDefinition): Promise<TaskResult[]>;
    private selectAgentForTask;
    private selectRoundRobin;
    private selectLeastLoaded;
    protected selectByCapability(eligibleMembers: AgentComponent[], task: TaskDefinition): AgentComponent | null;
    private updateGroupCapabilities;
    private aggregateResources;
}
export declare class HierarchicalAgentGroup extends AgentGroup {
    private subGroups;
    private maxDepth;
    private currentDepth;
    constructor(id: string, name: string, members?: AgentComponent[], maxDepth?: number, currentDepth?: number);
    addSubGroup(subGroup: AgentGroup): void;
    removeSubGroup(subGroupId: string): boolean;
    getSubGroups(): AgentGroup[];
    getHierarchyDepth(): number;
    getTotalAgentCount(): number;
    getStatus(): CompositeStatus;
    executeTask(task: TaskDefinition): Promise<TaskResult>;
    private findBestHandlerInHierarchy;
}
export declare class AgentFactory {
    static createAgent(id: string, name: string, capabilities: AgentCapability[], resourceLimits?: ResourceRequirements): Agent;
    static createGroup(id: string, name: string, members?: AgentComponent[]): AgentGroup;
    static createAgentGroup(id: string, name: string, members?: AgentComponent[]): AgentGroup;
    static createHierarchicalGroup(id: string, name: string, members?: AgentComponent[], maxDepth?: number, currentDepth?: number): HierarchicalAgentGroup;
    static createCapability(name: string, version?: string, description?: string, parameters?: Record<string, unknown>, requiredResources?: ResourceRequirements): AgentCapability;
}
//# sourceMappingURL=composite-system.d.ts.map