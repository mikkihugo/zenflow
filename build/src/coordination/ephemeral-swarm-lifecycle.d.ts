/**
 * Ephemeral Swarm Lifecycle Management.
 *
 * Manages on-demand swarm creation, execution, and cleanup.
 * Swarms are temporary and exist only for the duration of tasks.
 */
/**
 * @file Coordination system: ephemeral-swarm-lifecycle.
 */
import { EventEmitter } from 'node:events';
import type { IEventBus, ILogger } from '../core/interfaces/base-interfaces.ts';
import type { AgentType } from '../types/agent-types.ts';
export interface SwarmRequest {
    id: string;
    task: string;
    requiredAgents: AgentType[];
    maxAgents: number;
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    strategy: 'balanced' | 'specialized' | 'parallel';
    timeout: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
}
export interface SwarmInstance {
    id: string;
    status: SwarmStatus;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    lastActivity: Date;
    agents: EphemeralAgent[];
    task: SwarmTask;
    performance: SwarmPerformance;
    cleanup?: {
        scheduledAt: Date;
        reason: string;
    };
}
export interface EphemeralAgent {
    id: string;
    type: AgentType;
    status: 'spawning' | 'active' | 'idle' | 'busy' | 'completing' | 'terminated';
    spawnedAt: Date;
    lastActivity: Date;
    taskCount: number;
    claudeSubAgent?: string;
}
export interface SwarmTask {
    id: string;
    description: string;
    steps: TaskStep[];
    currentStep: number;
    progress: number;
    results: any[];
}
export interface TaskStep {
    id: string;
    description: string;
    assignedAgent?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    result?: any;
}
export interface SwarmPerformance {
    totalExecutionTime: number;
    agentUtilization: number;
    tasksCompleted: number;
    successRate: number;
    efficiency: number;
}
export type SwarmStatus = 'requested' | 'provisioning' | 'initializing' | 'active' | 'idle' | 'completing' | 'cleanup' | 'terminated';
/**
 * Manages ephemeral swarm lifecycle.
 *
 * @example
 */
export declare class EphemeralSwarmManager extends EventEmitter {
    private eventBus;
    private logger?;
    private activeSwarms;
    private swarmQueue;
    private cleanupTimer?;
    private idleTimeout;
    private maxConcurrentSwarms;
    constructor(eventBus: IEventBus, logger?: ILogger | undefined);
    /**
     * Request a new ephemeral swarm.
     *
     * @param request
     */
    requestSwarm(request: SwarmRequest): Promise<string>;
    /**
     * Create and provision a new swarm.
     *
     * @param request
     */
    private createSwarm;
    /**
     * Spawn agents for the swarm.
     *
     * @param swarm
     * @param request
     */
    private spawnAgents;
    /**
     * Spawn a single agent.
     *
     * @param agent
     * @param swarmId
     */
    private spawnSingleAgent;
    /**
     * Initialize swarm coordination.
     *
     * @param swarm
     */
    private initializeSwarm;
    /**
     * Start swarm task execution.
     *
     * @param swarm
     */
    private startSwarmExecution;
    /**
     * Execute a single task step.
     *
     * @param swarm
     * @param step
     */
    private executeTaskStep;
    /**
     * Select best agent for a task step.
     *
     * @param swarm
     * @param _step
     */
    private selectAgentForStep;
    /**
     * Generate task steps from swarm request.
     *
     * @param request
     */
    private generateTaskSteps;
    /**
     * Schedule swarm cleanup.
     *
     * @param swarmId
     * @param reason
     */
    private scheduleSwarmCleanup;
    /**
     * Terminate a swarm and clean up resources.
     *
     * @param swarmId
     * @param reason
     */
    terminateSwarm(swarmId: string, reason: string): Promise<void>;
    /**
     * Process queued swarm requests.
     */
    private processSwarmQueue;
    /**
     * Start periodic cleanup process.
     */
    private startCleanupProcess;
    /**
     * Clean up idle swarms.
     */
    private cleanupIdleSwarms;
    /**
     * Set up event handlers.
     */
    private setupEventHandlers;
    /**
     * Handle task completion.
     *
     * @param data
     */
    private handleTaskCompletion;
    /**
     * Handle agent becoming idle.
     *
     * @param data
     */
    private handleAgentIdle;
    /**
     * Get current swarm status.
     */
    getSwarmStatus(): SwarmManagerStatus;
    /**
     * Map agent type to Claude Code sub-agent.
     *
     * @param agentType
     */
    private getClaudeSubAgent;
    /**
     * Shutdown the manager.
     */
    shutdown(): Promise<void>;
}
interface SwarmManagerStatus {
    activeSwarms: number;
    queuedRequests: number;
    totalAgents: number;
    swarms: Array<{
        id: string;
        status: SwarmStatus;
        agentCount: number;
        progress: number;
        uptime: number;
    }>;
}
export default EphemeralSwarmManager;
//# sourceMappingURL=ephemeral-swarm-lifecycle.d.ts.map