/**
 * @file Swarm Batch Coordination
 * Implements concurrent swarm operations following claude-zen patterns.
 * Enables batch agent spawning, task distribution, and coordination.
 */
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('SwarmBatch');
/**
 * Coordinates multiple swarm operations concurrently.
 * Implements claude-zen's swarm batch optimization patterns.
 *
 * @example
 */
export class SwarmBatchCoordinator {
    config;
    activeSwarms;
    constructor(config = {}) {
        this.config = {
            maxConcurrentSwarms: config?.maxConcurrentSwarms ?? 5,
            maxAgentsPerSwarm: config?.maxAgentsPerSwarm ?? 10,
            defaultTimeout: config?.defaultTimeout ?? 30000,
            enableCoordinationOptimization: config?.enableCoordinationOptimization ?? true,
        };
        this.activeSwarms = new Map();
    }
    /**
     * Execute multiple swarm operations concurrently.
     * Implements claude-zen's batch swarm coordination.
     *
     * @param operations
     */
    async executeBatch(operations) {
        logger.info(`Starting batch swarm operations: ${operations.length} operations`);
        // Group operations by type for optimization
        const groupedOps = this.groupOperationsByType(operations);
        const results = [];
        // Execute swarm initialization operations first
        if (groupedOps.init.length > 0) {
            const initResults = await this.executeSwarmInits(groupedOps.init);
            results.push(...initResults);
        }
        // Execute agent spawning operations
        if (groupedOps.spawn.length > 0) {
            const spawnResults = await this.executeAgentSpawning(groupedOps.spawn);
            results.push(...spawnResults);
        }
        // Execute task assignment and coordination operations
        const coordinationOps = [...groupedOps.assign, ...groupedOps.coordinate];
        if (coordinationOps.length > 0) {
            const coordResults = await this.executeCoordinationOperations(coordinationOps);
            results.push(...coordResults);
        }
        // Execute status and termination operations
        const managementOps = [...groupedOps.status, ...groupedOps.terminate];
        if (managementOps.length > 0) {
            const mgmtResults = await this.executeManagementOperations(managementOps);
            results.push(...mgmtResults);
        }
        logger.info(`Completed batch swarm operations: ${results.length} operations processed`);
        return results;
    }
    /**
     * Group operations by type for intelligent execution order.
     *
     * @param operations
     */
    groupOperationsByType(operations) {
        const groups = {
            init: [],
            spawn: [],
            assign: [],
            coordinate: [],
            status: [],
            terminate: [],
        };
        for (const operation of operations) {
            groups[operation.type]?.push(operation);
        }
        return groups;
    }
    /**
     * Execute swarm initialization operations concurrently.
     *
     * @param operations
     */
    async executeSwarmInits(operations) {
        const results = [];
        // Execute swarm inits with controlled concurrency
        const chunks = this.chunkOperations(operations, this.config.maxConcurrentSwarms);
        for (const chunk of chunks) {
            const chunkPromises = chunk.map((op) => this.executeSwarmInit(op));
            const chunkResults = await Promise.allSettled(chunkPromises);
            chunkResults?.forEach((result, index) => {
                if (result?.status === 'fulfilled') {
                    results.push(result?.value);
                }
                else {
                    const operation = chunk[index];
                    if (operation) {
                        results.push(this.createErrorResult(operation, result?.reason));
                    }
                }
            });
        }
        return results;
    }
    /**
     * Execute agent spawning operations with batch optimization.
     *
     * @param operations
     */
    async executeAgentSpawning(operations) {
        // Group spawning operations by swarm for optimization
        const swarmGroups = new Map();
        for (const op of operations) {
            const swarmId = op.swarmId || 'default';
            if (!swarmGroups.has(swarmId)) {
                swarmGroups.set(swarmId, []);
            }
            swarmGroups.get(swarmId)?.push(op);
        }
        const results = [];
        // Execute spawning for each swarm concurrently
        const swarmPromises = Array.from(swarmGroups.entries()).map(([swarmId, ops]) => this.executeSwarmAgentSpawning(swarmId, ops));
        const swarmResults = await Promise.allSettled(swarmPromises);
        swarmResults?.forEach((result) => {
            if (result?.status === 'fulfilled') {
                results.push(...result?.value);
            }
            else {
                // Create error results for failed swarm spawning
                logger.warn('Swarm agent spawning failed:', result?.reason);
            }
        });
        return results;
    }
    /**
     * Execute coordination operations with adaptive strategies.
     *
     * @param operations
     */
    async executeCoordinationOperations(operations) {
        const results = [];
        if (this.config.enableCoordinationOptimization) {
            // Optimize coordination order based on dependencies and priorities
            const optimizedOrder = this.optimizeCoordinationOrder(operations);
            for (const operation of optimizedOrder) {
                const result = await this.executeCoordinationOperation(operation);
                results.push(result);
            }
        }
        else {
            // Execute with controlled concurrency
            const chunks = this.chunkOperations(operations, this.config.maxConcurrentSwarms);
            for (const chunk of chunks) {
                const chunkPromises = chunk.map((op) => this.executeCoordinationOperation(op));
                const chunkResults = await Promise.allSettled(chunkPromises);
                chunkResults?.forEach((result, index) => {
                    if (result?.status === 'fulfilled') {
                        results.push(result?.value);
                    }
                    else {
                        const operation = chunk[index];
                        if (operation) {
                            results.push(this.createErrorResult(operation, result?.reason));
                        }
                    }
                });
            }
        }
        return results;
    }
    /**
     * Execute management operations (status, terminate).
     *
     * @param operations.
     * @param operations
     */
    async executeManagementOperations(operations) {
        const results = [];
        // Execute management operations with high concurrency (they're typically lightweight)
        const chunks = this.chunkOperations(operations, this.config.maxConcurrentSwarms * 2);
        for (const chunk of chunks) {
            const chunkPromises = chunk.map((op) => this.executeManagementOperation(op));
            const chunkResults = await Promise.allSettled(chunkPromises);
            chunkResults?.forEach((result, index) => {
                if (result?.status === 'fulfilled') {
                    results.push(result?.value);
                }
                else {
                    const operation = chunk[index];
                    if (operation) {
                        results.push(this.createErrorResult(operation, result?.reason));
                    }
                }
            });
        }
        return results;
    }
    /**
     * Execute individual swarm initialization.
     *
     * @param operation
     */
    async executeSwarmInit(operation) {
        const startTime = Date.now();
        try {
            const swarmId = this.generateSwarmId();
            const topology = operation.topology || 'hierarchical';
            // Initialize swarm state
            const swarmState = {
                id: swarmId,
                topology,
                agents: [],
                status: 'initializing',
                createdAt: Date.now(),
                lastActivity: Date.now(),
            };
            this.activeSwarms.set(swarmId, swarmState);
            // Simulate swarm initialization (replace with actual implementation)
            await this.simulateOperation(100);
            swarmState.status = 'active';
            return {
                operation,
                success: true,
                result: {
                    swarmId,
                    metrics: {
                        executionTime: Date.now() - startTime,
                        successRate: 1.0,
                        resourceUtilization: 0.1,
                    },
                },
                executionTime: Date.now() - startTime,
            };
        }
        catch (error) {
            return this.createErrorResult(operation, error, startTime);
        }
    }
    /**
     * Execute agent spawning for a specific swarm.
     *
     * @param swarmId
     * @param operations
     */
    async executeSwarmAgentSpawning(swarmId, operations) {
        const results = [];
        const swarmState = this.activeSwarms.get(swarmId);
        if (!swarmState) {
            return operations.map((op) => this.createErrorResult(op, new Error(`Swarm ${swarmId} not found`)));
        }
        // Batch spawn agents for efficiency
        const agentTypes = operations.map((op) => op.agentType).filter(Boolean);
        const totalAgents = operations.reduce((sum, op) => sum + (op.agentCount || 1), 0);
        if (totalAgents > this.config.maxAgentsPerSwarm) {
            throw new Error(`Requested ${totalAgents} agents exceeds limit of ${this.config.maxAgentsPerSwarm}`);
        }
        const startTime = Date.now();
        try {
            // Simulate batch agent spawning
            const spawnedAgents = await this.batchSpawnAgents(swarmId, agentTypes);
            // Update swarm state
            swarmState.agents.push(...spawnedAgents);
            swarmState.lastActivity = Date.now();
            // Create results for each operation
            for (const operation of operations) {
                const agentCount = operation.agentCount || 1;
                const relevantAgents = spawnedAgents.slice(0, agentCount);
                results.push({
                    operation,
                    success: true,
                    result: {
                        swarmId,
                        agentIds: relevantAgents.map((a) => a.id),
                        metrics: {
                            executionTime: Date.now() - startTime,
                            successRate: 1.0,
                            resourceUtilization: agentCount * 0.1,
                        },
                    },
                    executionTime: Date.now() - startTime,
                });
            }
        }
        catch (error) {
            return operations.map((op) => this.createErrorResult(op, error, startTime));
        }
        return results;
    }
    /**
     * Execute coordination operation.
     *
     * @param operation
     */
    async executeCoordinationOperation(operation) {
        const startTime = Date.now();
        try {
            const swarmId = operation.swarmId || 'default';
            const swarmState = this.activeSwarms.get(swarmId);
            if (!swarmState) {
                throw new Error(`Swarm ${swarmId} not found`);
            }
            // Execute task coordination
            const taskResults = await this.coordinateTask(swarmState, operation);
            swarmState.lastActivity = Date.now();
            return {
                operation,
                success: true,
                result: {
                    swarmId,
                    taskResults,
                    metrics: {
                        executionTime: Date.now() - startTime,
                        successRate: taskResults.length > 0
                            ? taskResults?.filter((r) => r.status === 'completed').length / taskResults.length
                            : 0,
                        resourceUtilization: swarmState.agents.length * 0.2,
                    },
                },
                executionTime: Date.now() - startTime,
            };
        }
        catch (error) {
            return this.createErrorResult(operation, error, startTime);
        }
    }
    /**
     * Execute management operation (status, terminate).
     *
     * @param operation
     */
    async executeManagementOperation(operation) {
        const startTime = Date.now();
        try {
            switch (operation.type) {
                case 'status':
                    return await this.getSwarmStatus(operation, startTime);
                case 'terminate':
                    return await this.terminateSwarm(operation, startTime);
                default:
                    throw new Error(`Unknown management operation: ${operation.type}`);
            }
        }
        catch (error) {
            return this.createErrorResult(operation, error, startTime);
        }
    }
    /**
     * Optimize coordination order based on priorities and dependencies.
     *
     * @param operations
     */
    optimizeCoordinationOrder(operations) {
        // Sort by priority (critical first) and estimated duration
        return operations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            const aPriority = priorityOrder[a.task?.priority || 'medium'];
            const bPriority = priorityOrder[b.task?.priority || 'medium'];
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            // Secondary sort by estimated duration (shorter first)
            const aDuration = a.task?.estimatedDuration || 1000;
            const bDuration = b.task?.estimatedDuration || 1000;
            return aDuration - bDuration;
        });
    }
    /**
     * Coordinate task execution within a swarm.
     *
     * @param swarmState
     * @param operation
     */
    async coordinateTask(swarmState, operation) {
        const strategy = operation.coordination?.strategy || 'parallel';
        const timeout = operation.coordination?.timeout || this.config.defaultTimeout;
        // Execute task coordination based on strategy
        const taskResults = [];
        if (strategy === 'parallel') {
            // Execute all agent tasks in parallel with timeout
            const promises = swarmState.agents.map(async (agent) => {
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout));
                try {
                    const result = await Promise.race([
                        this.executeTaskOnAgent(agent.id, operation),
                        timeoutPromise,
                    ]);
                    return { agentId: agent.id, result, status: 'completed' };
                }
                catch (error) {
                    return { agentId: agent.id, result: error, status: 'failed' };
                }
            });
            const results = await Promise.allSettled(promises);
            taskResults?.push(...results.map((r) => r.status === 'fulfilled'
                ? r.value
                : { agentId: 'unknown', result: r.reason, status: 'failed' }));
        }
        else {
            // Sequential execution for other strategies
            for (const agent of swarmState.agents) {
                try {
                    const result = await this.executeTaskOnAgent(agent.id, operation);
                    taskResults?.push({ agentId: agent.id, result, status: 'completed' });
                }
                catch (error) {
                    taskResults?.push({ agentId: agent.id, result: error, status: 'failed' });
                }
            }
        }
        for (const agent of swarmState.agents) {
            await this.simulateOperation(Math.random() * 200);
            taskResults?.push({
                agentId: agent.id,
                result: { taskId: operation.task?.id, completed: true },
                status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
            });
        }
        return taskResults;
    }
    /**
     * Batch spawn agents efficiently.
     *
     * @param swarmId
     * @param agentTypes
     */
    async batchSpawnAgents(swarmId, agentTypes) {
        const agents = [];
        // Simulate batch agent creation
        for (const agentType of agentTypes) {
            await this.simulateOperation(50); // Faster than individual spawning
            agents.push({
                id: this.generateAgentId(),
                type: agentType,
                swarmId,
                status: 'active',
                createdAt: Date.now(),
            });
        }
        return agents;
    }
    /**
     * Get swarm status.
     *
     * @param operation
     * @param startTime
     */
    async getSwarmStatus(operation, startTime) {
        const swarmId = operation.swarmId || 'default';
        const swarmState = this.activeSwarms.get(swarmId);
        if (!swarmState) {
            throw new Error(`Swarm ${swarmId} not found`);
        }
        return {
            operation,
            success: true,
            result: {
                swarmId,
                metrics: {
                    executionTime: Date.now() - startTime,
                    successRate: 1.0,
                    resourceUtilization: swarmState.agents.length * 0.05,
                },
            },
            executionTime: Date.now() - startTime,
        };
    }
    /**
     * Terminate swarm.
     *
     * @param operation
     * @param startTime
     */
    async terminateSwarm(operation, startTime) {
        const swarmId = operation.swarmId || 'default';
        if (this.activeSwarms.has(swarmId)) {
            this.activeSwarms.delete(swarmId);
        }
        await this.simulateOperation(100);
        return {
            operation,
            success: true,
            result: {
                swarmId,
                metrics: {
                    executionTime: Date.now() - startTime,
                    successRate: 1.0,
                    resourceUtilization: 0,
                },
            },
            executionTime: Date.now() - startTime,
        };
    }
    /**
     * Utility methods.
     *
     * @param operations
     * @param chunkSize
     */
    chunkOperations(operations, chunkSize) {
        const chunks = [];
        for (let i = 0; i < operations.length; i += chunkSize) {
            chunks.push(operations.slice(i, i + chunkSize));
        }
        return chunks;
    }
    createErrorResult(operation, error, startTime) {
        const executionTime = startTime ? Date.now() - startTime : 0;
        return {
            operation,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            executionTime,
        };
    }
    generateSwarmId() {
        return `swarm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateAgentId() {
        return `agent-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async simulateOperation(duration) {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }
    /**
     * Execute task on a specific agent.
     *
     * @param agentId
     * @param operation
     */
    async executeTaskOnAgent(agentId, operation) {
        // Simulate task execution on agent
        await this.simulateOperation(Math.random() * 300 + 100);
        return {
            agentId,
            taskId: operation.task?.id || 'unknown',
            result: `Task completed by ${agentId}`,
            timestamp: Date.now(),
        };
    }
    /**
     * Convert SwarmOperation to BatchOperation for use with BatchEngine.
     *
     * @param swarmOps
     */
    static createBatchOperations(swarmOps) {
        return swarmOps.map((swarmOp, index) => ({
            id: `swarm-${index}-${swarmOp.type}-${Date.now()}`,
            type: 'swarm',
            operation: swarmOp.type,
            params: {
                swarmId: swarmOp.swarmId,
                agentType: swarmOp.agentType,
                agentCount: swarmOp.agentCount,
                topology: swarmOp.topology,
                task: swarmOp.task,
                coordination: swarmOp.coordination,
            },
        }));
    }
    /**
     * Get active swarms count.
     */
    getActiveSwarms() {
        return this.activeSwarms.size;
    }
    /**
     * Get total active agents across all swarms.
     */
    getTotalActiveAgents() {
        let total = 0;
        for (const swarm of Array.from(this.activeSwarms.values())) {
            total += swarm.agents.length;
        }
        return total;
    }
}
