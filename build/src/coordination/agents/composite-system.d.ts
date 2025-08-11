/**
 * @file Composite Pattern Implementation for Agent Hierarchies
 * Provides uniform interfaces for individual agents and agent groups.
 */
import { EventEmitter } from 'node:events';
export interface AgentCapability {
    name: string;
    version: string;
    description: string;
    parameters?: Record<string, any>;
    requiredResources?: ResourceRequirements;
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
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    requiredCapabilities: string[];
    inputs: Record<string, any>;
    expectedOutputs: string[];
    timeout?: number;
    dependencies?: string[];
    metadata?: Record<string, any>;
}
export interface TaskResult {
    taskId: string;
    agentId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    outputs?: Record<string, any>;
    error?: string;
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
    lastActivity: Date;
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
    [key: string]: unknown;
}
export interface AgentComponent extends EventEmitter {
    getId(): string;
    getName(): string;
    getType(): 'individual' | 'group';
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
    constructor(id: string, name: string, initialCapabilities?: AgentCapability[], resourceLimits?: ResourceRequirements);
    getId(): string;
    getName(): string;
    getType(): 'individual' | 'group';
    getCapabilities(): AgentCapability[];
    getStatus(): AgentStatus;
    getMetrics(): AgentMetrics;
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
}
export interface CompositeStatus {
    id: string;
    state: 'active' | 'partial' | 'inactive';
    health: number;
    memberCount: number;
    activeMemberCount: number;
    totalQueuedTasks: number;
    totalCompletedTasks: number;
    totalFailedTasks: number;
    lastActivity: Date;
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
    constructor(id: string, name: string, members?: AgentComponent[]);
    getId(): string;
    getName(): string;
    getType(): 'individual' | 'group';
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
    setLoadBalancingStrategy(strategy: 'round-robin' | 'least-loaded' | 'capability-based'): void;
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
    executeTask(task: TaskDefinition): Promise<TaskResult>;
    private findBestHandlerInHierarchy;
}
export declare class AgentFactory {
    static createAgent(id: string, name: string, capabilities: AgentCapability[], resourceLimits?: ResourceRequirements): Agent;
    static createGroup(id: string, name: string, members?: AgentComponent[]): AgentGroup;
    static createHierarchicalGroup(id: string, name: string, members?: AgentComponent[], maxDepth?: number, currentDepth?: number): HierarchicalAgentGroup;
    static createCapability(name: string, version?: string, description?: string, parameters?: Record<string, any>, requiredResources?: ResourceRequirements): AgentCapability;
}
//# sourceMappingURL=composite-system.d.ts.map