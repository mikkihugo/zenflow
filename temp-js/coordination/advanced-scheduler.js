/**
 * Advanced task scheduler with intelligent agent selection and priority handling
 */
import { SystemEvents } from '../utils/types.js';
import { TaskScheduler } from './scheduler.js';
import { WorkStealingCoordinator } from './work-stealing.js';
import { DependencyGraph } from './dependency-graph.js';
import { CircuitBreakerManager } from './circuit-breaker.js';
/**
 * Capability-based scheduling strategy
 */
export class CapabilitySchedulingStrategy {
    constructor() {
        this.name = 'capability';
    }
    selectAgent(task, agents, context) {
        // Filter agents by capability match
        const capableAgents = agents.filter(agent => {
            const capabilities = context.agentCapabilities.get(agent.id) || agent.capabilities;
            return task.type === 'any' ||
                capabilities.includes(task.type) ||
                capabilities.includes('*');
        });
        if (capableAgents.length === 0) {
            return null;
        }
        // Sort by load (ascending) and priority (descending)
        capableAgents.sort((a, b) => {
            const loadA = context.taskLoads.get(a.id) || 0;
            const loadB = context.taskLoads.get(b.id) || 0;
            if (loadA !== loadB) {
                return loadA - loadB;
            }
            const priorityA = context.agentPriorities.get(a.id) || a.priority;
            const priorityB = context.agentPriorities.get(b.id) || b.priority;
            return priorityB - priorityA;
        });
        return capableAgents[0].id;
    }
}
/**
 * Round-robin scheduling strategy
 */
export class RoundRobinSchedulingStrategy {
    constructor() {
        this.name = 'round-robin';
        this.lastIndex = 0;
    }
    selectAgent(task, agents, context) {
        if (agents.length === 0) {
            return null;
        }
        this.lastIndex = (this.lastIndex + 1) % agents.length;
        return agents[this.lastIndex].id;
    }
}
/**
 * Least-loaded scheduling strategy
 */
export class LeastLoadedSchedulingStrategy {
    constructor() {
        this.name = 'least-loaded';
    }
    selectAgent(task, agents, context) {
        if (agents.length === 0) {
            return null;
        }
        let minLoad = Infinity;
        let selectedAgent = null;
        for (const agent of agents) {
            const load = context.taskLoads.get(agent.id) || 0;
            if (load < minLoad) {
                minLoad = load;
                selectedAgent = agent.id;
            }
        }
        return selectedAgent;
    }
}
/**
 * Affinity-based scheduling strategy (prefers agents that previously executed similar tasks)
 */
export class AffinitySchedulingStrategy {
    constructor() {
        this.name = 'affinity';
    }
    selectAgent(task, agents, context) {
        const taskStats = context.taskHistory.get(task.type);
        if (taskStats?.lastAgent) {
            // Check if the last agent is available
            const lastAgent = agents.find(a => a.id === taskStats.lastAgent);
            if (lastAgent) {
                const load = context.taskLoads.get(lastAgent.id) || 0;
                // Use last agent if not overloaded
                if (load < lastAgent.maxConcurrentTasks * 0.8) {
                    return lastAgent.id;
                }
            }
        }
        // Fall back to capability-based selection
        return new CapabilitySchedulingStrategy().selectAgent(task, agents, context);
    }
}
/**
 * Advanced task scheduler with multiple strategies
 */
export class AdvancedTaskScheduler extends TaskScheduler {
    constructor(config, eventBus, logger) {
        super(config, eventBus, logger);
        this.strategies = new Map();
        this.activeAgents = new Map();
        this.taskStats = new Map();
        this.defaultStrategy = 'capability';
        // Initialize components
        this.workStealing = new WorkStealingCoordinator({
            enabled: true,
            stealThreshold: 3,
            maxStealBatch: 2,
            stealInterval: 5000,
        }, eventBus, logger);
        this.dependencyGraph = new DependencyGraph(logger);
        const cbConfig = {
            failureThreshold: 3,
            successThreshold: 2,
            timeout: 30000,
            halfOpenLimit: 1,
        };
        this.circuitBreakers = new CircuitBreakerManager(cbConfig, logger, eventBus);
        // Register default strategies
        this.registerStrategy(new CapabilitySchedulingStrategy());
        this.registerStrategy(new RoundRobinSchedulingStrategy());
        this.registerStrategy(new LeastLoadedSchedulingStrategy());
        this.registerStrategy(new AffinitySchedulingStrategy());
        // Set up event handlers
        this.setupAdvancedEventHandlers();
    }
    async initialize() {
        await super.initialize();
        await this.workStealing.initialize();
        this.logger.info('Advanced task scheduler initialized');
    }
    async shutdown() {
        await this.workStealing.shutdown();
        await super.shutdown();
    }
    /**
     * Register a scheduling strategy
     */
    registerStrategy(strategy) {
        this.strategies.set(strategy.name, strategy);
        this.logger.info('Registered scheduling strategy', { name: strategy.name });
    }
    /**
     * Set the default scheduling strategy
     */
    setDefaultStrategy(name) {
        if (!this.strategies.has(name)) {
            throw new Error(`Strategy not found: ${name}`);
        }
        this.defaultStrategy = name;
    }
    /**
     * Register an agent
     */
    registerAgent(profile) {
        this.activeAgents.set(profile.id, profile);
        this.workStealing.updateAgentWorkload(profile.id, {
            agentId: profile.id,
            taskCount: 0,
            avgTaskDuration: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            priority: profile.priority,
            capabilities: profile.capabilities,
        });
    }
    /**
     * Unregister an agent
     */
    unregisterAgent(agentId) {
        this.activeAgents.delete(agentId);
    }
    /**
     * Override assignTask to use advanced scheduling
     */
    async assignTask(task, agentId) {
        // Add to dependency graph
        this.dependencyGraph.addTask(task);
        // If no agent specified, select one
        if (!agentId) {
            const selectedAgent = await this.selectAgentForTask(task);
            if (!selectedAgent) {
                throw new Error('No suitable agent found for task');
            }
            agentId = selectedAgent;
        }
        // Use circuit breaker for assignment
        await this.circuitBreakers.execute(`assign-${agentId}`, async () => {
            await super.assignTask(task, agentId);
        });
        // Update work stealing metrics
        const taskCount = await this.getAgentTaskCount(agentId);
        this.workStealing.updateAgentWorkload(agentId, { taskCount });
    }
    /**
     * Select the best agent for a task
     */
    async selectAgentForTask(task) {
        const availableAgents = Array.from(this.activeAgents.values());
        if (availableAgents.length === 0) {
            return null;
        }
        // Build scheduling context
        const context = {
            taskLoads: new Map(),
            agentCapabilities: new Map(),
            agentPriorities: new Map(),
            taskHistory: this.taskStats,
            currentTime: new Date(),
        };
        // Populate context
        for (const agent of availableAgents) {
            const taskCount = await this.getAgentTaskCount(agent.id);
            context.taskLoads.set(agent.id, taskCount);
            context.agentCapabilities.set(agent.id, agent.capabilities);
            context.agentPriorities.set(agent.id, agent.priority);
        }
        // Try work stealing first
        const workStealingAgent = this.workStealing.findBestAgent(task, availableAgents);
        if (workStealingAgent) {
            return workStealingAgent;
        }
        // Use configured strategy
        const strategy = this.strategies.get(this.defaultStrategy);
        if (!strategy) {
            throw new Error(`Strategy not found: ${this.defaultStrategy}`);
        }
        return strategy.selectAgent(task, availableAgents, context);
    }
    /**
     * Override completeTask to update stats and dependency graph
     */
    async completeTask(taskId, result) {
        const task = await this.getTask(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }
        // Calculate duration
        const duration = task.startedAt
            ? new Date().getTime() - task.startedAt.getTime()
            : 0;
        // Update task stats
        this.updateTaskStats(task.type, true, duration);
        // Update work stealing metrics
        if (task.assignedAgent) {
            this.workStealing.recordTaskDuration(task.assignedAgent, duration);
        }
        // Mark as completed in dependency graph
        const readyTasks = this.dependencyGraph.markCompleted(taskId);
        // Complete the task
        await super.completeTask(taskId, result);
        // Start ready tasks
        for (const readyTaskId of readyTasks) {
            const readyTask = await this.getTask(readyTaskId);
            if (readyTask) {
                this.eventBus.emit(SystemEvents.TASK_CREATED, { task: readyTask });
            }
        }
    }
    /**
     * Override failTask to update stats and dependency graph
     */
    async failTask(taskId, error) {
        const task = await this.getTask(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }
        // Update task stats
        this.updateTaskStats(task.type, false, 0);
        // Mark as failed in dependency graph
        const toCancelIds = this.dependencyGraph.markFailed(taskId);
        // Fail the task
        await super.failTask(taskId, error);
        // Cancel dependent tasks
        for (const cancelId of toCancelIds) {
            await this.cancelTask(cancelId, 'Parent task failed');
        }
    }
    /**
     * Get a task by ID (helper method)
     */
    async getTask(taskId) {
        // This would need to be implemented based on how tasks are stored
        // For now, return null
        return null;
    }
    /**
     * Update task statistics
     */
    updateTaskStats(taskType, success, duration) {
        const stats = this.taskStats.get(taskType) || {
            totalExecutions: 0,
            avgDuration: 0,
            successRate: 0,
        };
        stats.totalExecutions++;
        if (success) {
            const successCount = Math.round(stats.successRate * (stats.totalExecutions - 1));
            stats.successRate = (successCount + 1) / stats.totalExecutions;
            if (duration > 0) {
                const totalDuration = stats.avgDuration * (stats.totalExecutions - 1);
                stats.avgDuration = (totalDuration + duration) / stats.totalExecutions;
            }
        }
        else {
            const successCount = Math.round(stats.successRate * (stats.totalExecutions - 1));
            stats.successRate = successCount / stats.totalExecutions;
        }
        this.taskStats.set(taskType, stats);
    }
    /**
     * Set up advanced event handlers
     */
    setupAdvancedEventHandlers() {
        // Handle work stealing requests
        this.eventBus.on('workstealing:request', async (data) => {
            const { sourceAgent, targetAgent, taskCount } = data;
            try {
                const tasks = await this.getAgentTasks(sourceAgent);
                const tasksToSteal = tasks
                    .filter(t => t.status === 'queued' || t.status === 'assigned')
                    .slice(0, taskCount);
                for (const task of tasksToSteal) {
                    await this.reassignTask(task.id, targetAgent);
                }
                this.logger.info('Work stealing completed', {
                    from: sourceAgent,
                    to: targetAgent,
                    stolenCount: tasksToSteal.length,
                });
            }
            catch (error) {
                this.logger.error('Work stealing failed', { error });
            }
        });
        // Update workload on task events
        this.eventBus.on(SystemEvents.TASK_ASSIGNED, async (data) => {
            const { agentId } = data;
            const taskCount = await this.getAgentTaskCount(agentId);
            this.workStealing.updateAgentWorkload(agentId, { taskCount });
        });
        this.eventBus.on(SystemEvents.TASK_COMPLETED, async (data) => {
            const { taskId } = data;
            // Update workload after task completion
            // This would need the agent ID from the task
        });
    }
    /**
     * Reassign a task to a different agent
     */
    async reassignTask(taskId, newAgentId) {
        // Cancel the current assignment
        await this.cancelTask(taskId, 'Reassigning to different agent');
        // Get the task
        const task = await this.getTask(taskId);
        if (!task) {
            throw new Error(`Task not found: ${taskId}`);
        }
        // Assign to new agent
        await this.assignTask(task, newAgentId);
    }
    /**
     * Get advanced scheduling metrics
     */
    async getSchedulingMetrics() {
        const baseMetrics = await this.getHealthStatus();
        const workloadStats = this.workStealing.getWorkloadStats();
        const depGraphStats = this.dependencyGraph.getStats();
        const cbMetrics = this.circuitBreakers.getAllMetrics();
        return {
            ...baseMetrics.metrics,
            workStealing: workloadStats,
            dependencies: depGraphStats,
            circuitBreakers: cbMetrics,
            taskStats: Object.fromEntries(this.taskStats),
            activeStrategies: Array.from(this.strategies.keys()),
            defaultStrategy: this.defaultStrategy,
        };
    }
}
