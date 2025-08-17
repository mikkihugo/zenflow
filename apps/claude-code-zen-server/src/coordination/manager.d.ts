/**
 * Coordination Manager - Agent coordination and swarm management
 * Handles agent lifecycle, communication, and task distribution.
 * Following Google TypeScript standards with strict typing.
 */
/**
 * @file Coordination system: manager.
 */
import { EventEmitter } from 'node:events';
import type { EventBus, Logger } from '../di/index';
export interface CoordinationConfig {
    maxAgents: number;
    heartbeatInterval: number;
    timeout: number;
    enableHealthCheck?: boolean;
}
export interface Agent {
    id: string;
    type: string;
    status: 'idle' | 'busy' | 'error' | 'offline';
    capabilities: string[];
    lastHeartbeat: Date;
    taskCount: number;
    created: Date;
}
export interface Task {
    id: string;
    type: string;
    priority: number;
    assignedAgent?: string;
    status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
    created: Date;
    metadata?: Record<string, unknown>;
}
/**
 * Coordination Manager for agent and task management.
 *
 * @example
 */
export declare class CoordinationManager extends EventEmitter {
    private _logger;
    private _eventBus;
    private config;
    private agents;
    private tasks;
    private heartbeatTimer?;
    private isRunning;
    constructor(config: CoordinationConfig, _logger: Logger, _eventBus: EventBus);
    /**
     * Start coordination services.
     */
    start(): Promise<void>;
    /**
     * Stop coordination services.
     */
    stop(): Promise<void>;
    /**
     * Register an agent.
     *
     * @param agentConfig
     * @param agentConfig.id
     * @param agentConfig.type
     * @param agentConfig.capabilities
     */
    registerAgent(agentConfig: {
        id: string;
        type: string;
        capabilities: string[];
    }): Promise<void>;
    /**
     * Unregister an agent.
     *
     * @param agentId
     */
    unregisterAgent(agentId: string): Promise<void>;
    /**
     * Submit a task for execution.
     *
     * @param taskConfig
     * @param taskConfig.id
     * @param taskConfig.type
     * @param taskConfig.priority
     * @param taskConfig.requiredCapabilities
     * @param taskConfig.metadata
     */
    submitTask(taskConfig: {
        id: string;
        type: string;
        priority: number;
        requiredCapabilities?: string[];
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Get available agents.
     */
    getAvailableAgents(): Agent[];
    /**
     * Get agents by capability.
     *
     * @param capability
     */
    getAgentsByCapability(capability: string): Agent[];
    /**
     * Get pending tasks.
     */
    getPendingTasks(): Task[];
    /**
     * Update agent heartbeat.
     *
     * @param agentId
     */
    updateAgentHeartbeat(agentId: string): void;
    /**
     * Update task status.
     *
     * @param taskId
     * @param status
     */
    updateTaskStatus(taskId: string, status: Task['status']): void;
    /**
     * Get coordination statistics.
     */
    getStats(): {
        totalAgents: number;
        availableAgents: number;
        busyAgents: number;
        offlineAgents: number;
        totalTasks: number;
        pendingTasks: number;
        runningTasks: number;
        completedTasks: number;
    };
    private setupEventHandlers;
    private startHeartbeatMonitoring;
    private checkAgentHeartbeats;
    private assignTask;
}
export default CoordinationManager;
//# sourceMappingURL=manager.d.ts.map