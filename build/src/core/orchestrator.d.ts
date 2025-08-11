/**
 * Orchestrator - Core orchestration system for claude-zen.
 * Coordinates components and manages system lifecycle.
 */
/**
 * @file Orchestrator implementation.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
export interface OrchestratorConfig {
    name?: string;
    timeout?: number;
    maxConcurrentTasks?: number;
    enableHealthCheck?: boolean;
    healthCheckInterval?: number;
}
export interface Task {
    id: string;
    type: string;
    description: string;
    priority: number;
    input?: any;
    metadata?: Record<string, any>;
}
export interface TaskResult {
    success: boolean;
    output?: any;
    duration: number;
    error?: Error;
}
/**
 * Core orchestrator for system coordination.
 *
 * @example
 */
export declare class Orchestrator extends EventEmitter {
    private terminalManager?;
    private memoryManager?;
    private coordinationManager?;
    private mcpServer?;
    private eventBus?;
    private logger?;
    private config;
    private isRunning;
    private activeTasks;
    private healthCheckTimer;
    constructor(config: OrchestratorConfig, terminalManager?: any | undefined, memoryManager?: any | undefined, coordinationManager?: any | undefined, mcpServer?: any | undefined, eventBus?: IEventBus | undefined, logger?: ILogger | undefined);
    /**
     * Start the orchestrator.
     */
    start(): Promise<void>;
    /**
     * Stop the orchestrator.
     */
    stop(): Promise<void>;
    /**
     * Execute a task.
     *
     * @param task
     */
    executeTask(task: Task): Promise<TaskResult>;
    /**
     * Get orchestrator status.
     */
    getStatus(): {
        running: boolean;
        activeTasks: number;
        name: string;
        uptime: number;
    };
    /**
     * Get active tasks.
     */
    getActiveTasks(): Task[];
    private setupEventHandlers;
    private startHealthChecks;
    private performHealthCheck;
    private waitForTasksCompletion;
    private performTask;
}
export default Orchestrator;
//# sourceMappingURL=orchestrator.d.ts.map