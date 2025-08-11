/**
 * @file Command Pattern Implementation for MCP Tool Execution
 * Provides command encapsulation with undo support, batch operations, and transaction handling.
 */
import { EventEmitter } from 'node:events';
import type { SwarmTopology } from '../coordination/swarm/core/strategy';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}
export interface ResourceMetrics {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
    timestamp: Date;
}
export interface CommandResult<T = any> {
    success: boolean;
    data?: T;
    error?: Error;
    executionTime: number;
    resourceUsage: ResourceMetrics;
    warnings?: string[];
    metadata?: Record<string, any>;
}
export interface CommandContext {
    userId?: string;
    sessionId: string;
    timestamp: Date;
    environment: 'development' | 'staging' | 'production';
    permissions: string[];
    resources: ResourceMetrics;
}
export interface MCPCommand<T = any> {
    execute(): Promise<CommandResult<T>>;
    undo?(): Promise<CommandResult<T>>;
    canUndo(): boolean;
    getCommandType(): string;
    getEstimatedDuration(): number;
    validate(): Promise<ValidationResult>;
    getDescription(): string;
    getRequiredPermissions(): string[];
    clone?(): MCPCommand<T>;
}
export interface Transaction {
    id: string;
    commands: MCPCommand[];
    status: 'pending' | 'executing' | 'completed' | 'failed' | 'rolled_back';
    createdAt: Date;
    completedAt?: Date;
    rollbackReason?: string;
}
export interface QueueMetrics {
    totalExecuted: number;
    totalFailed: number;
    averageExecutionTime: number;
    commandTypeStats: Map<string, {
        count: number;
        avgTime: number;
        failureRate: number;
    }>;
    queueSize: number;
    processingTime: number;
}
export interface SwarmInitResult {
    swarmId: string;
    topology: SwarmTopology;
    agentCount: number;
    estimatedReadyTime: number;
    warnings?: string[];
}
export interface SwarmConfig {
    topology: SwarmTopology;
    agentCount: number;
    capabilities?: string[];
    resourceLimits?: ResourceMetrics;
    timeout?: number;
}
export interface AgentSpawnResult {
    agentId: string;
    capabilities: string[];
    status: 'initializing' | 'ready' | 'error';
    resourceAllocation: ResourceMetrics;
}
export interface TaskOrchestrationResult {
    taskId: string;
    assignedAgents: string[];
    estimatedCompletion: Date;
    dependencies: string[];
    status: 'queued' | 'executing' | 'completed' | 'failed';
}
export declare class SwarmInitCommand implements MCPCommand<SwarmInitResult> {
    private config;
    private swarmManager;
    private context;
    private swarmId?;
    private executionStartTime?;
    constructor(config: SwarmConfig, swarmManager: any, context: CommandContext);
    validate(): Promise<ValidationResult>;
    execute(): Promise<CommandResult<SwarmInitResult>>;
    undo(): Promise<CommandResult<any>>;
    canUndo(): boolean;
    getCommandType(): string;
    getEstimatedDuration(): number;
    getDescription(): string;
    getRequiredPermissions(): string[];
    clone(): MCPCommand<SwarmInitResult>;
    private measureResources;
    private calculateResourceDelta;
}
export declare class AgentSpawnCommand implements MCPCommand<AgentSpawnResult> {
    private agentConfig;
    private swarmManager;
    private swarmId;
    private context;
    private agentId?;
    constructor(agentConfig: {
        type: string;
        capabilities: string[];
        resourceRequirements?: ResourceMetrics;
    }, swarmManager: any, swarmId: string, context: CommandContext);
    validate(): Promise<ValidationResult>;
    execute(): Promise<CommandResult<AgentSpawnResult>>;
    undo(): Promise<void>;
    canUndo(): boolean;
    getCommandType(): string;
    getEstimatedDuration(): number;
    getDescription(): string;
    getRequiredPermissions(): string[];
    private measureResources;
}
export declare class TaskOrchestrationCommand implements MCPCommand<TaskOrchestrationResult> {
    private task;
    private swarmManager;
    private swarmId;
    private context;
    constructor(task: {
        description: string;
        requirements: string[];
        priority: 'low' | 'medium' | 'high' | 'critical';
        timeout?: number;
    }, swarmManager: any, swarmId: string, context: CommandContext);
    validate(): Promise<ValidationResult>;
    execute(): Promise<CommandResult<TaskOrchestrationResult>>;
    canUndo(): boolean;
    getCommandType(): string;
    getEstimatedDuration(): number;
    getDescription(): string;
    getRequiredPermissions(): string[];
    private measureResources;
}
export declare class MCPCommandQueue extends EventEmitter {
    private logger?;
    private commandHistory;
    private undoStack;
    private activeTransactions;
    private metrics;
    private processing;
    private maxConcurrentCommands;
    private currentlyExecuting;
    private queue;
    constructor(logger?: any | undefined);
    execute<T>(command: MCPCommand<T>): Promise<CommandResult<T>>;
    executeBatch<T>(commands: MCPCommand<T>[]): Promise<CommandResult<T>[]>;
    executeTransaction(commands: MCPCommand[]): Promise<CommandResult[]>;
    undo(): Promise<void>;
    retryCommand<T>(originalCommand: MCPCommand<T>, maxRetries?: number, baseDelay?: number): Promise<CommandResult<T>>;
    getMetrics(): QueueMetrics;
    getHistory(): Array<{
        command: MCPCommand;
        result: CommandResult;
        timestamp: Date;
    }>;
    getActiveTransactions(): Transaction[];
    clearHistory(): void;
    scheduleCommand<T>(command: MCPCommand<T>, executeAt: Date): Promise<CommandResult<T>>;
    shutdown(): Promise<void>;
    private executeParallel;
    private startProcessing;
    private executeCommand;
    private rollbackTransaction;
    private updateMetrics;
    private initializeMetrics;
    private emptyResourceMetrics;
}
export declare class CommandFactory {
    static createSwarmInitCommand(config: SwarmConfig, swarmManager: any, context: CommandContext): SwarmInitCommand;
    static createAgentSpawnCommand(agentConfig: {
        type: string;
        capabilities: string[];
        resourceRequirements?: ResourceMetrics;
    }, swarmManager: any, swarmId: string, context: CommandContext): AgentSpawnCommand;
    static createTaskOrchestrationCommand(task: {
        description: string;
        requirements: string[];
        priority: 'low' | 'medium' | 'high' | 'critical';
        timeout?: number;
    }, swarmManager: any, swarmId: string, context: CommandContext): TaskOrchestrationCommand;
}
//# sourceMappingURL=command-system.d.ts.map