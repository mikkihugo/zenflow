/**
 * Coordination manager for task scheduling and resource management
 */
import { SystemEvents } from '../utils/types.js';
import { CoordinationError, DeadlockError } from '../utils/errors.js';
import { TaskScheduler } from './scheduler.js';
import { ResourceManager } from './resources.js';
import { MessageRouter } from './messaging.js';
import { AdvancedTaskScheduler } from './advanced-scheduler.js';
import { ConflictResolver } from './conflict-resolution.js';
import { CoordinationMetricsCollector } from './metrics.js';
/**
 * Coordination manager implementation
 */
export class CoordinationManager {
    constructor(config, eventBus, logger) {
        this.config = config;
        this.eventBus = eventBus;
        this.logger = logger;
        this.initialized = false;
        this.advancedSchedulingEnabled = false;
        this.scheduler = new TaskScheduler(config, eventBus, logger);
        this.resourceManager = new ResourceManager(config, eventBus, logger);
        this.messageRouter = new MessageRouter(config, eventBus, logger);
        this.conflictResolver = new ConflictResolver(logger, eventBus);
        this.metricsCollector = new CoordinationMetricsCollector(logger, eventBus);
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.logger.info('Initializing coordination manager...');
        try {
            // Initialize components
            await this.scheduler.initialize();
            await this.resourceManager.initialize();
            await this.messageRouter.initialize();
            // Start metrics collection
            this.metricsCollector.start();
            // Start deadlock detection if enabled
            if (this.config.deadlockDetection) {
                this.startDeadlockDetection();
            }
            // Set up event handlers
            this.setupEventHandlers();
            this.initialized = true;
            this.logger.info('Coordination manager initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize coordination manager', error);
            throw new CoordinationError('Coordination manager initialization failed', { error });
        }
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        this.logger.info('Shutting down coordination manager...');
        try {
            // Stop deadlock detection
            if (this.deadlockCheckInterval) {
                clearInterval(this.deadlockCheckInterval);
            }
            // Stop metrics collection
            this.metricsCollector.stop();
            // Shutdown components
            await Promise.all([
                this.scheduler.shutdown(),
                this.resourceManager.shutdown(),
                this.messageRouter.shutdown(),
            ]);
            this.initialized = false;
            this.logger.info('Coordination manager shutdown complete');
        }
        catch (error) {
            this.logger.error('Error during coordination manager shutdown', error);
            throw error;
        }
    }
    async assignTask(task, agentId) {
        if (!this.initialized) {
            throw new CoordinationError('Coordination manager not initialized');
        }
        await this.scheduler.assignTask(task, agentId);
    }
    async getAgentTaskCount(agentId) {
        if (!this.initialized) {
            throw new CoordinationError('Coordination manager not initialized');
        }
        return this.scheduler.getAgentTaskCount(agentId);
    }
    async acquireResource(resourceId, agentId) {
        if (!this.initialized) {
            throw new CoordinationError('Coordination manager not initialized');
        }
        await this.resourceManager.acquire(resourceId, agentId);
    }
    async releaseResource(resourceId, agentId) {
        if (!this.initialized) {
            throw new CoordinationError('Coordination manager not initialized');
        }
        await this.resourceManager.release(resourceId, agentId);
    }
    async sendMessage(from, to, message) {
        if (!this.initialized) {
            throw new CoordinationError('Coordination manager not initialized');
        }
        await this.messageRouter.send(from, to, message);
    }
    async getHealthStatus() {
        try {
            const [schedulerHealth, resourceHealth, messageHealth] = await Promise.all([
                this.scheduler.getHealthStatus(),
                this.resourceManager.getHealthStatus(),
                this.messageRouter.getHealthStatus(),
            ]);
            const metrics = {
                ...schedulerHealth.metrics,
                ...resourceHealth.metrics,
                ...messageHealth.metrics,
            };
            const healthy = schedulerHealth.healthy &&
                resourceHealth.healthy &&
                messageHealth.healthy;
            const errors = [
                schedulerHealth.error,
                resourceHealth.error,
                messageHealth.error,
            ].filter(Boolean);
            const status = {
                healthy,
                metrics,
            };
            if (errors.length > 0) {
                status.error = errors.join('; ');
            }
            return status;
        }
        catch (error) {
            return {
                healthy: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    setupEventHandlers() {
        // Handle task events
        this.eventBus.on(SystemEvents.TASK_COMPLETED, async (data) => {
            const { taskId, result } = data;
            try {
                await this.scheduler.completeTask(taskId, result);
            }
            catch (error) {
                this.logger.error('Error handling task completion', { taskId, error });
            }
        });
        this.eventBus.on(SystemEvents.TASK_FAILED, async (data) => {
            const { taskId, error } = data;
            try {
                await this.scheduler.failTask(taskId, error);
            }
            catch (err) {
                this.logger.error('Error handling task failure', { taskId, error: err });
            }
        });
        // Handle agent termination
        this.eventBus.on(SystemEvents.AGENT_TERMINATED, async (data) => {
            const { agentId } = data;
            try {
                // Release all resources held by the agent
                await this.resourceManager.releaseAllForAgent(agentId);
                // Cancel all tasks assigned to the agent
                await this.scheduler.cancelAgentTasks(agentId);
            }
            catch (error) {
                this.logger.error('Error handling agent termination', { agentId, error });
            }
        });
    }
    startDeadlockDetection() {
        this.deadlockCheckInterval = setInterval(async () => {
            try {
                const deadlock = await this.detectDeadlock();
                if (deadlock) {
                    this.logger.error('Deadlock detected', deadlock);
                    // Emit deadlock event
                    this.eventBus.emit(SystemEvents.DEADLOCK_DETECTED, deadlock);
                    // Attempt to resolve deadlock
                    await this.resolveDeadlock(deadlock);
                }
            }
            catch (error) {
                this.logger.error('Error during deadlock detection', error);
            }
        }, 10000); // Check every 10 seconds
    }
    async detectDeadlock() {
        // Get resource allocation graph
        const allocations = await this.resourceManager.getAllocations();
        const waitingFor = await this.resourceManager.getWaitingRequests();
        // Build dependency graph
        const graph = new Map();
        // Add edges for resources agents are waiting for
        for (const [agentId, resources] of waitingFor) {
            if (!graph.has(agentId)) {
                graph.set(agentId, new Set());
            }
            // Find who owns these resources
            for (const resource of resources) {
                const owner = allocations.get(resource);
                if (owner && owner !== agentId) {
                    graph.get(agentId).add(owner);
                }
            }
        }
        // Detect cycles using DFS
        const visited = new Set();
        const recursionStack = new Set();
        const cycle = [];
        const hasCycle = (node) => {
            visited.add(node);
            recursionStack.add(node);
            const neighbors = graph.get(node) || new Set();
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (hasCycle(neighbor)) {
                        cycle.unshift(node);
                        return true;
                    }
                }
                else if (recursionStack.has(neighbor)) {
                    cycle.unshift(node);
                    cycle.unshift(neighbor);
                    return true;
                }
            }
            recursionStack.delete(node);
            return false;
        };
        // Check for cycles
        for (const node of graph.keys()) {
            if (!visited.has(node) && hasCycle(node)) {
                // Extract unique agents in cycle
                const agents = Array.from(new Set(cycle));
                // Find resources involved
                const resources = [];
                for (const agent of agents) {
                    const waiting = waitingFor.get(agent) || [];
                    resources.push(...waiting);
                }
                return {
                    agents,
                    resources: Array.from(new Set(resources)),
                };
            }
        }
        return null;
    }
    async resolveDeadlock(deadlock) {
        this.logger.warn('Attempting to resolve deadlock', deadlock);
        // Simple resolution: release resources from the lowest priority agent
        // In a real implementation, use more sophisticated strategies
        try {
            // Find the agent with the lowest priority or least work done
            const agentToPreempt = deadlock.agents[0]; // Simplified
            // Release all resources held by this agent
            await this.resourceManager.releaseAllForAgent(agentToPreempt);
            // Reschedule the agent's tasks
            await this.scheduler.rescheduleAgentTasks(agentToPreempt);
            this.logger.info('Deadlock resolved by preempting agent', {
                agentId: agentToPreempt,
            });
        }
        catch (error) {
            throw new DeadlockError('Failed to resolve deadlock', deadlock.agents, deadlock.resources);
        }
    }
    async getAgentTasks(agentId) {
        if (!this.initialized) {
            throw new CoordinationError('Coordination manager not initialized');
        }
        return this.scheduler.getAgentTasks(agentId);
    }
    async cancelTask(taskId, reason) {
        if (!this.initialized) {
            throw new CoordinationError('Coordination manager not initialized');
        }
        await this.scheduler.cancelTask(taskId, reason || 'User requested cancellation');
    }
    async performMaintenance() {
        if (!this.initialized) {
            return;
        }
        this.logger.debug('Performing coordination manager maintenance');
        try {
            await Promise.all([
                this.scheduler.performMaintenance(),
                this.resourceManager.performMaintenance(),
                this.messageRouter.performMaintenance(),
            ]);
            // Clean up old conflicts
            this.conflictResolver.cleanupOldConflicts(24 * 60 * 60 * 1000); // 24 hours
        }
        catch (error) {
            this.logger.error('Error during coordination manager maintenance', error);
        }
    }
    async getCoordinationMetrics() {
        const baseMetrics = await this.getHealthStatus();
        const coordinationMetrics = this.metricsCollector.getCurrentMetrics();
        const conflictStats = this.conflictResolver.getStats();
        return {
            ...baseMetrics.metrics,
            coordination: coordinationMetrics,
            conflicts: conflictStats,
            advancedScheduling: this.advancedSchedulingEnabled,
        };
    }
    enableAdvancedScheduling() {
        if (this.advancedSchedulingEnabled) {
            return;
        }
        this.logger.info('Enabling advanced scheduling features');
        // Replace basic scheduler with advanced one
        const advancedScheduler = new AdvancedTaskScheduler(this.config, this.eventBus, this.logger);
        // Transfer state if needed (in a real implementation)
        this.scheduler = advancedScheduler;
        this.advancedSchedulingEnabled = true;
    }
    async reportConflict(type, id, agents) {
        this.logger.warn('Conflict reported', { type, id, agents });
        let conflict;
        if (type === 'resource') {
            conflict = await this.conflictResolver.reportResourceConflict(id, agents);
        }
        else {
            conflict = await this.conflictResolver.reportTaskConflict(id, agents, 'assignment');
        }
        // Auto-resolve using default strategy
        try {
            await this.conflictResolver.autoResolve(conflict.id);
        }
        catch (error) {
            this.logger.error('Failed to auto-resolve conflict', {
                conflictId: conflict.id,
                error,
            });
        }
    }
}
