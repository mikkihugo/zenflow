/**
 * Swarm Coordinator.
 * Central coordination for swarm operations and agent management.
 */
/**
 * @file Swarm coordination system.
 */
import { EventEmitter } from 'node:events';
import type { AgentType } from '../types/agent-types';
import type { SwarmTopology } from '../types/shared-types';
export interface SwarmAgent {
    id: string;
    type: AgentType;
    status: 'idle' | 'busy' | 'offline' | 'error';
    capabilities: string[];
    performance: {
        tasksCompleted: number;
        averageResponseTime: number;
        errorRate: number;
    };
    connections: string[];
}
export interface SwarmMetrics {
    agentCount: number;
    activeAgents: number;
    totalTasks: number;
    completedTasks: number;
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
}
export interface SwarmCoordinationEvent {
    type: 'agent_joined' | 'agent_left' | 'task_assigned' | 'task_completed' | 'coordination_event';
    agentId?: string;
    taskId?: string;
    data: any;
    timestamp: Date;
}
export declare class SwarmCoordinator extends EventEmitter {
    private agents;
    private tasks;
    private metrics;
    private startTime;
    private swarmId;
    private state;
    /**
     * Initialize the swarm coordinator.
     *
     * @param config
     */
    initialize(config?: any): Promise<void>;
    /**
     * Shutdown the swarm coordinator.
     */
    shutdown(): Promise<void>;
    /**
     * Get the current state.
     */
    getState(): 'initializing' | 'active' | 'terminated';
    /**
     * Get the swarm ID.
     */
    getSwarmId(): string;
    /**
     * Get total agent count.
     */
    getAgentCount(): number;
    /**
     * Get list of active agent IDs.
     */
    getActiveAgents(): string[];
    /**
     * Get task count.
     */
    getTaskCount(): number;
    /**
     * Get uptime in milliseconds.
     */
    getUptime(): number;
    /**
     * Add an agent to the swarm.
     *
     * @param agent
     */
    addAgent(agent: Omit<SwarmAgent, 'performance' | 'connections'>): Promise<void>;
    /**
     * Remove an agent from the swarm.
     *
     * @param agentId
     */
    removeAgent(agentId: string): Promise<void>;
    /**
     * Get all agents.
     */
    getAgents(): SwarmAgent[];
    /**
     * Get agent by ID.
     *
     * @param agentId
     */
    getAgent(agentId: string): SwarmAgent | undefined;
    /**
     * Assign a task to the best available agent.
     *
     * @param task
     * @param task.id
     * @param task.type
     * @param task.requirements
     * @param task.priority
     */
    assignTask(task: {
        id: string;
        type: string;
        requirements: string[];
        priority: number;
    }): Promise<string | null>;
    /**
     * Complete a task.
     *
     * @param taskId
     * @param result
     */
    completeTask(taskId: string, result: any): Promise<void>;
    /**
     * Get current swarm metrics.
     */
    getMetrics(): SwarmMetrics;
    /**
     * Coordinate swarm operations.
     *
     * @param agents
     * @param topology
     */
    coordinateSwarm(agents: SwarmAgent[], topology?: SwarmTopology): Promise<{
        success: boolean;
        averageLatency: number;
        successRate: number;
        agentsCoordinated: number;
    }>;
    private coordinateAgent;
    private findSuitableAgents;
    private selectBestAgent;
    private calculateAgentScore;
    private updateMetrics;
}
export default SwarmCoordinator;
//# sourceMappingURL=swarm-coordinator.d.ts.map