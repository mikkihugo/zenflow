/**
 * @file Swarm Batch Coordination
 * Implements concurrent swarm operations following claude-zen patterns.
 * Enables batch agent spawning, task distribution, and coordination.
 */
import type { AgentType } from '../types.ts';
import type { BatchOperation } from './batch-engine.ts';
export interface SwarmOperation {
    type: 'init' | 'spawn' | 'assign' | 'coordinate' | 'terminate' | 'status';
    swarmId?: string;
    agentType?: AgentType;
    agentCount?: number;
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    task?: {
        id: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        estimatedDuration?: number;
    };
    coordination?: {
        strategy: 'sequential' | 'parallel' | 'adaptive';
        timeout?: number;
        retryAttempts?: number;
    };
}
export interface SwarmOperationResult {
    operation: SwarmOperation;
    success: boolean;
    result?: {
        swarmId?: string;
        agentIds?: string[];
        taskResults?: Array<{
            agentId: string;
            result: unknown;
            status: string;
        }>;
        metrics?: {
            executionTime: number;
            successRate: number;
            resourceUtilization: number;
        };
    };
    error?: string;
    executionTime: number;
}
export interface SwarmBatchConfig {
    maxConcurrentSwarms?: number;
    maxAgentsPerSwarm?: number;
    defaultTimeout?: number;
    enableCoordinationOptimization?: boolean;
}
/**
 * Coordinates multiple swarm operations concurrently.
 * Implements claude-zen's swarm batch optimization patterns.
 *
 * @example
 */
export declare class SwarmBatchCoordinator {
    private readonly config;
    private readonly activeSwarms;
    constructor(config?: SwarmBatchConfig);
    /**
     * Execute multiple swarm operations concurrently.
     * Implements claude-zen's batch swarm coordination.
     *
     * @param operations
     */
    executeBatch(operations: SwarmOperation[]): Promise<SwarmOperationResult[]>;
    /**
     * Group operations by type for intelligent execution order.
     *
     * @param operations
     */
    private groupOperationsByType;
    /**
     * Execute swarm initialization operations concurrently.
     *
     * @param operations
     */
    private executeSwarmInits;
    /**
     * Execute agent spawning operations with batch optimization.
     *
     * @param operations
     */
    private executeAgentSpawning;
    /**
     * Execute coordination operations with adaptive strategies.
     *
     * @param operations
     */
    private executeCoordinationOperations;
    /**
     * Execute management operations (status, terminate).
     *
     * @param operations.
     * @param operations
     */
    private executeManagementOperations;
    /**
     * Execute individual swarm initialization.
     *
     * @param operation
     */
    private executeSwarmInit;
    /**
     * Execute agent spawning for a specific swarm.
     *
     * @param swarmId
     * @param operations
     */
    private executeSwarmAgentSpawning;
    /**
     * Execute coordination operation.
     *
     * @param operation
     */
    private executeCoordinationOperation;
    /**
     * Execute management operation (status, terminate).
     *
     * @param operation
     */
    private executeManagementOperation;
    /**
     * Optimize coordination order based on priorities and dependencies.
     *
     * @param operations
     */
    private optimizeCoordinationOrder;
    /**
     * Coordinate task execution within a swarm.
     *
     * @param swarmState
     * @param operation
     */
    private coordinateTask;
    /**
     * Batch spawn agents efficiently.
     *
     * @param swarmId
     * @param agentTypes
     */
    private batchSpawnAgents;
    /**
     * Get swarm status.
     *
     * @param operation
     * @param startTime
     */
    private getSwarmStatus;
    /**
     * Terminate swarm.
     *
     * @param operation
     * @param startTime
     */
    private terminateSwarm;
    /**
     * Utility methods.
     *
     * @param operations
     * @param chunkSize
     */
    private chunkOperations;
    private createErrorResult;
    private generateSwarmId;
    private generateAgentId;
    private simulateOperation;
    /**
     * Execute task on a specific agent.
     *
     * @param agentId
     * @param operation
     */
    private executeTaskOnAgent;
    /**
     * Convert SwarmOperation to BatchOperation for use with BatchEngine.
     *
     * @param swarmOps
     */
    static createBatchOperations(swarmOps: SwarmOperation[]): BatchOperation[];
    /**
     * Get active swarms count.
     */
    getActiveSwarms(): number;
    /**
     * Get total active agents across all swarms.
     */
    getTotalActiveAgents(): number;
}
//# sourceMappingURL=swarm-batch.d.ts.map