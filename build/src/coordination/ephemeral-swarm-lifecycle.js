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
/**
 * Manages ephemeral swarm lifecycle.
 *
 * @example
 */
export class EphemeralSwarmManager extends EventEmitter {
    eventBus;
    logger;
    activeSwarms = new Map();
    swarmQueue = [];
    cleanupTimer;
    idleTimeout = 300000; // 5 minutes
    maxConcurrentSwarms = 10;
    constructor(eventBus, logger) {
        super();
        this.eventBus = eventBus;
        this.logger = logger;
        this.startCleanupProcess();
        this.setupEventHandlers();
    }
    /**
     * Request a new ephemeral swarm.
     *
     * @param request
     */
    async requestSwarm(request) {
        this.logger?.info('Swarm requested', {
            swarmId: request.id,
            task: request.task,
            agents: request.requiredAgents.length,
        });
        // Check if we can create swarm immediately
        if (this.activeSwarms.size < this.maxConcurrentSwarms) {
            return await this.createSwarm(request);
        }
        else {
            // Queue the request
            this.swarmQueue.push(request);
            this.logger?.info('Swarm queued - max concurrent limit reached', {
                swarmId: request.id,
                queueLength: this.swarmQueue.length,
            });
            return request.id;
        }
    }
    /**
     * Create and provision a new swarm.
     *
     * @param request
     */
    async createSwarm(request) {
        const swarm = {
            id: request.id,
            status: 'provisioning',
            createdAt: new Date(),
            lastActivity: new Date(),
            agents: [],
            task: {
                id: `task_${request.id}`,
                description: request.task,
                steps: this.generateTaskSteps(request),
                currentStep: 0,
                progress: 0,
                results: [],
            },
            performance: {
                totalExecutionTime: 0,
                agentUtilization: 0,
                tasksCompleted: 0,
                successRate: 0,
                efficiency: 0,
            },
        };
        this.activeSwarms.set(request.id, swarm);
        try {
            // 1. Spawn agents
            await this.spawnAgents(swarm, request);
            // 2. Initialize swarm
            await this.initializeSwarm(swarm);
            // 3. Start execution
            await this.startSwarmExecution(swarm);
            this.emit('swarm:created', { swarmId: request.id, swarm });
            return request.id;
        }
        catch (error) {
            this.logger?.error('Failed to create swarm', {
                swarmId: request.id,
                error: error instanceof Error ? error.message : String(error),
            });
            await this.terminateSwarm(request.id, 'creation_failed');
            throw error;
        }
    }
    /**
     * Spawn agents for the swarm.
     *
     * @param swarm
     * @param request
     */
    async spawnAgents(swarm, request) {
        this.logger?.debug('Spawning agents for swarm', {
            swarmId: swarm.id,
            agentTypes: request.requiredAgents,
        });
        const spawnPromises = request.requiredAgents.map(async (agentType) => {
            const claudeSubAgent = this.getClaudeSubAgent(agentType);
            const agent = {
                id: `${swarm.id}_${agentType}_${Date.now()}`,
                type: agentType,
                status: 'spawning',
                spawnedAt: new Date(),
                lastActivity: new Date(),
                taskCount: 0,
                ...(claudeSubAgent ? { claudeSubAgent } : {}),
            };
            // Only add claudeSubAgent if it exists
            if (claudeSubAgent) {
                agent.claudeSubAgent = claudeSubAgent;
            }
            // Spawn the agent (this would integrate with Claude Code Task tool)
            await this.spawnSingleAgent(agent, swarm.id);
            agent.status = 'active';
            swarm.agents.push(agent);
            return agent;
        });
        await Promise.all(spawnPromises);
        this.logger?.info('All agents spawned', {
            swarmId: swarm.id,
            agentCount: swarm.agents.length,
        });
    }
    /**
     * Spawn a single agent.
     *
     * @param agent
     * @param swarmId
     */
    async spawnSingleAgent(agent, swarmId) {
        // This integrates with our enhanced Task tool
        this.eventBus.emit('agent:spawn:request', {
            swarmId,
            agentId: agent.id,
            agentType: agent.type,
            claudeSubAgent: agent.claudeSubAgent,
            ephemeral: true,
        });
        // Wait for agent to be ready (simplified - would use proper async waiting)
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    /**
     * Initialize swarm coordination.
     *
     * @param swarm
     */
    async initializeSwarm(swarm) {
        swarm.status = 'initializing';
        swarm.lastActivity = new Date();
        // Set up agent coordination
        this.eventBus.emit('swarm:initialize', {
            swarmId: swarm.id,
            agents: swarm.agents.map((a) => ({ id: a.id, type: a.type })),
            task: swarm.task,
        });
        // Wait for initialization to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));
        swarm.status = 'active';
        swarm.startedAt = new Date();
    }
    /**
     * Start swarm task execution.
     *
     * @param swarm
     */
    async startSwarmExecution(swarm) {
        this.logger?.info('Starting swarm execution', { swarmId: swarm.id });
        // Execute task steps
        for (let i = 0; i < swarm.task.steps.length; i++) {
            const step = swarm.task.steps[i];
            if (step) {
                swarm.task.currentStep = i;
                await this.executeTaskStep(swarm, step);
                // Update progress
                swarm.task.progress = ((i + 1) / swarm.task.steps.length) * 100;
            }
            swarm.lastActivity = new Date();
        }
        // Mark as completing
        swarm.status = 'completing';
        swarm.completedAt = new Date();
        // Schedule cleanup
        this.scheduleSwarmCleanup(swarm.id, 'task_completed');
    }
    /**
     * Execute a single task step.
     *
     * @param swarm
     * @param step
     */
    async executeTaskStep(swarm, step) {
        step.status = 'running';
        step.startTime = new Date();
        try {
            // Find best agent for this step
            const agent = this.selectAgentForStep(swarm, step);
            if (agent) {
                step.assignedAgent = agent.id;
                agent.status = 'busy';
                agent.taskCount++;
            }
            // Execute the step (this would use the Task tool with the assigned agent)
            this.eventBus.emit('task:execute', {
                swarmId: swarm.id,
                stepId: step.id,
                agentId: agent?.id,
                description: step.description,
            });
            // Simulate execution time
            await new Promise((resolve) => setTimeout(resolve, 5000));
            step.status = 'completed';
            step.endTime = new Date();
            step.result = `Completed: ${step.description}`;
            if (agent) {
                agent.status = 'active';
                agent.lastActivity = new Date();
            }
        }
        catch (error) {
            step.status = 'failed';
            step.endTime = new Date();
            this.logger?.error('Task step failed', {
                swarmId: swarm.id,
                stepId: step.id,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Select best agent for a task step.
     *
     * @param swarm
     * @param _step
     */
    selectAgentForStep(swarm, _step) {
        const availableAgents = swarm.agents.filter((a) => a.status === 'active' || a.status === 'idle');
        if (availableAgents.length === 0)
            return null;
        // Simple selection: least busy agent
        return availableAgents.reduce((best, current) => current?.taskCount < best.taskCount ? current : best);
    }
    /**
     * Generate task steps from swarm request.
     *
     * @param request
     */
    generateTaskSteps(request) {
        // This would be more sophisticated in practice
        return [
            {
                id: `step_1_${request.id}`,
                description: `Analyze: ${request.task}`,
                status: 'pending',
            },
            {
                id: `step_2_${request.id}`,
                description: `Execute: ${request.task}`,
                status: 'pending',
            },
            {
                id: `step_3_${request.id}`,
                description: `Validate: ${request.task}`,
                status: 'pending',
            },
        ];
    }
    /**
     * Schedule swarm cleanup.
     *
     * @param swarmId
     * @param reason
     */
    scheduleSwarmCleanup(swarmId, reason) {
        const swarm = this.activeSwarms.get(swarmId);
        if (!swarm)
            return;
        const cleanupDelay = reason === 'task_completed' ? 60000 : 10000; // 1 min or 10 sec
        swarm.cleanup = {
            scheduledAt: new Date(Date.now() + cleanupDelay),
            reason,
        };
        setTimeout(() => {
            this.terminateSwarm(swarmId, reason);
        }, cleanupDelay);
        this.logger?.debug('Swarm cleanup scheduled', {
            swarmId,
            reason,
            cleanupIn: cleanupDelay,
        });
    }
    /**
     * Terminate a swarm and clean up resources.
     *
     * @param swarmId
     * @param reason
     */
    async terminateSwarm(swarmId, reason) {
        const swarm = this.activeSwarms.get(swarmId);
        if (!swarm)
            return;
        this.logger?.info('Terminating swarm', { swarmId, reason });
        swarm.status = 'cleanup';
        try {
            // Terminate all agents
            for (const agent of swarm.agents) {
                agent.status = 'terminated';
                this.eventBus.emit('agent:terminate', {
                    swarmId,
                    agentId: agent.id,
                });
            }
            // Clean up resources
            this.eventBus.emit('swarm:cleanup', {
                swarmId,
                reason,
            });
            swarm.status = 'terminated';
            this.activeSwarms.delete(swarmId);
            this.emit('swarm:terminated', { swarmId, reason, swarm });
            // Process queued requests
            await this.processSwarmQueue();
        }
        catch (error) {
            this.logger?.error('Error during swarm termination', {
                swarmId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * Process queued swarm requests.
     */
    async processSwarmQueue() {
        if (this.swarmQueue.length === 0)
            return;
        if (this.activeSwarms.size >= this.maxConcurrentSwarms)
            return;
        const nextRequest = this.swarmQueue.shift();
        if (nextRequest) {
            await this.createSwarm(nextRequest);
        }
    }
    /**
     * Start periodic cleanup process.
     */
    startCleanupProcess() {
        this.cleanupTimer = setInterval(() => {
            this.cleanupIdleSwarms();
        }, 60000); // Check every minute
    }
    /**
     * Clean up idle swarms.
     */
    cleanupIdleSwarms() {
        const now = Date.now();
        for (const [swarmId, swarm] of this.activeSwarms) {
            const idleTime = now - swarm.lastActivity.getTime();
            if (idleTime > this.idleTimeout && swarm.status === 'idle') {
                this.scheduleSwarmCleanup(swarmId, 'idle_timeout');
            }
        }
    }
    /**
     * Set up event handlers.
     */
    setupEventHandlers() {
        this.eventBus.on('task:completed', (data) => {
            this.handleTaskCompletion(data);
        });
        this.eventBus.on('agent:idle', (data) => {
            this.handleAgentIdle(data);
        });
    }
    /**
     * Handle task completion.
     *
     * @param data
     */
    handleTaskCompletion(data) {
        const swarm = this.activeSwarms.get(data?.['swarmId']);
        if (swarm) {
            swarm.lastActivity = new Date();
            swarm.performance.tasksCompleted++;
            // Check if all tasks are done
            const allStepsCompleted = swarm.task.steps.every((step) => step.status === 'completed' || step.status === 'failed');
            if (allStepsCompleted) {
                this.scheduleSwarmCleanup(data?.['swarmId'], 'all_tasks_completed');
            }
        }
    }
    /**
     * Handle agent becoming idle.
     *
     * @param data
     */
    handleAgentIdle(data) {
        const swarm = this.activeSwarms.get(data?.['swarmId']);
        if (swarm) {
            const agent = swarm.agents.find((a) => a.id === data?.['agentId']);
            if (agent) {
                agent.status = 'idle';
                agent.lastActivity = new Date();
            }
            // Check if all agents are idle
            const allAgentsIdle = swarm.agents.every((a) => a.status === 'idle');
            if (allAgentsIdle && swarm.status === 'active') {
                swarm.status = 'idle';
                swarm.lastActivity = new Date();
            }
        }
    }
    /**
     * Get current swarm status.
     */
    getSwarmStatus() {
        return {
            activeSwarms: this.activeSwarms.size,
            queuedRequests: this.swarmQueue.length,
            totalAgents: Array.from(this.activeSwarms.values()).reduce((sum, swarm) => sum + swarm.agents.length, 0),
            swarms: Array.from(this.activeSwarms.entries()).map(([id, swarm]) => ({
                id,
                status: swarm.status,
                agentCount: swarm.agents.length,
                progress: swarm.task.progress,
                uptime: Date.now() - swarm.createdAt.getTime(),
            })),
        };
    }
    /**
     * Map agent type to Claude Code sub-agent.
     *
     * @param agentType
     */
    getClaudeSubAgent(agentType) {
        const mappings = {
            'code-review-swarm': 'code-reviewer',
            debug: 'debugger',
            'ai-ml-specialist': 'ai-ml-specialist',
            'database-architect': 'database-architect',
            'system-architect': 'system-architect',
        };
        return mappings[agentType];
    }
    /**
     * Shutdown the manager.
     */
    async shutdown() {
        this.logger?.info('Shutting down ephemeral swarm manager');
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        // Terminate all active swarms
        const terminationPromises = Array.from(this.activeSwarms.keys()).map((swarmId) => this.terminateSwarm(swarmId, 'manager_shutdown'));
        await Promise.all(terminationPromises);
    }
}
export default EphemeralSwarmManager;
