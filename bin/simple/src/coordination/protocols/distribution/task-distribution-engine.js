import { EventEmitter } from 'node:events';
export class TaskDistributionEngine extends EventEmitter {
    config;
    logger;
    eventBus;
    tasks = new Map();
    decomposedTasks = new Map();
    assignments = new Map();
    agentCapabilities = new Map();
    queue;
    decomposer;
    assignmentOptimizer;
    workloadBalancer;
    performancePredictor;
    failureHandler;
    metrics;
    processingInterval;
    constructor(config, logger, eventBus) {
        super();
        this.config = config;
        this.logger = logger;
        this.eventBus = eventBus;
        this.queue = new TaskQueue(this.logger);
        this.decomposer = new TaskDecomposer(this.logger);
        this.assignmentOptimizer = new AssignmentOptimizer(this.config, this.logger);
        this.workloadBalancer = new WorkloadBalancer(this.config, this.logger);
        this.performancePredictor = new PerformancePredictor(this.logger);
        this.failureHandler = new FailureHandler(this.logger);
        this.metrics = this.initializeMetrics();
        this.setupEventHandlers();
        this.startProcessing();
    }
    setupEventHandlers() {
        this.eventBus.on('agent:registered', (data) => {
            this.handleAgentRegistration(data);
        });
        this.eventBus.on('agent:capabilities-updated', (data) => {
            this.handleAgentCapabilitiesUpdate(data);
        });
        this.eventBus.on('agent:performance-update', (data) => {
            this.handleAgentPerformanceUpdate(data);
        });
        this.eventBus.on('task:progress-update', (data) => {
            this.handleTaskProgressUpdate(data);
        });
        this.eventBus.on('task:completed', (data) => {
            this.handleTaskCompletion(data);
        });
        this.eventBus.on('task:failed', (data) => {
            this.handleTaskFailure(data);
        });
        this.eventBus.on('agent:unavailable', (data) => {
            this.handleAgentUnavailable(data);
        });
    }
    async submitTask(taskDef) {
        const task = {
            ...taskDef,
            id: this.generateTaskId(),
            created: new Date(),
        };
        this.tasks.set(task.id, task);
        this.metrics.totalTasks++;
        this.logger.info('Task submitted for distribution', {
            taskId: task.id,
            name: task.name,
            priority: task.priority,
            complexity: task.complexity,
        });
        if (task.complexity === 'complex' || task.complexity === 'expert') {
            const decomposed = await this.decomposer.decompose(task);
            this.decomposedTasks.set(task.id, decomposed);
            for (const subtask of decomposed.subtasks) {
                await this.queue.enqueue(this.subtaskToTask(subtask, task.id));
            }
        }
        else {
            await this.queue.enqueue(task);
        }
        this.emit('task:submitted', { taskId: task.id, task });
        return task.id;
    }
    async registerAgent(agentCapability) {
        this.agentCapabilities.set(agentCapability.agentId, agentCapability);
        this.logger.info('Agent registered for task distribution', {
            agentId: agentCapability.agentId,
            capabilities: agentCapability.capabilities,
            maxLoad: agentCapability.maxLoad,
        });
        this.emit('agent:registered', { agentId: agentCapability.agentId });
        await this.optimizeAssignments();
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getTaskStatus(taskId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return undefined;
        const assignment = this.assignments.get(taskId);
        if (!assignment)
            return 'pending';
        return 'assigned';
    }
    async cancelTask(taskId, reason) {
        const task = this.tasks.get(taskId);
        if (!task)
            return false;
        const assignment = this.assignments.get(taskId);
        if (assignment) {
            this.eventBus.emit('task:cancel', {
                taskId,
                agentId: assignment.agentId,
                reason,
                cancelledBy: 'task-distribution-engine',
                rollbackRequired: true,
                affectedDependencies: [],
                timestamp: new Date(),
                source: 'task-distribution-engine',
                id: `task-cancel-${taskId}-${Date.now()}`,
                version: '1.0.0',
            });
        }
        await this.queue.remove(taskId);
        this.assignments.delete(taskId);
        this.logger.info('Task cancelled', { taskId, reason });
        this.emit('task:cancelled', { taskId, reason });
        return true;
    }
    async reassignTask(taskId, reason) {
        const task = this.tasks.get(taskId);
        const currentAssignment = this.assignments.get(taskId);
        if (!(task && currentAssignment))
            return false;
        this.assignments.delete(taskId);
        const agent = this.agentCapabilities.get(currentAssignment?.agentId);
        if (agent) {
            agent.currentLoad = Math.max(0, agent.currentLoad - 1);
        }
        await this.queue.enqueue(task);
        this.logger.info('Task reassigned', {
            taskId,
            reason,
            previousAgent: currentAssignment?.agentId,
        });
        this.emit('task:reassigned', {
            taskId,
            reason,
            previousAgent: currentAssignment?.agentId,
        });
        return true;
    }
    getQueueStatus() {
        const pendingTasks = this.queue.size();
        const processingTasks = this.assignments.size;
        let availableAgents = 0;
        let busyAgents = 0;
        let offlineAgents = 0;
        const utilization = {};
        for (const [agentId, agent] of this.agentCapabilities) {
            utilization[agentId] = agent.currentLoad / agent.maxLoad;
            switch (agent.availability.currentStatus) {
                case 'available':
                    availableAgents++;
                    break;
                case 'busy':
                    busyAgents++;
                    break;
                case 'offline':
                    offlineAgents++;
                    break;
            }
        }
        return {
            pending: pendingTasks,
            processing: processingTasks,
            agents: {
                available: availableAgents,
                busy: busyAgents,
                offline: offlineAgents,
                utilization,
            },
        };
    }
    startProcessing() {
        this.processingInterval = setInterval(async () => {
            await this.processQueue();
            await this.updateMetrics();
            await this.performHealthChecks();
            if (this.config.enableDynamicRebalancing) {
                await this.rebalanceWorkload();
            }
        }, 1000);
    }
    async processQueue() {
        const availableAgents = Array.from(this.agentCapabilities.values()).filter((agent) => agent.availability.currentStatus === 'available' &&
            agent.currentLoad < agent.maxLoad);
        if (availableAgents.length === 0)
            return;
        const tasksToAssign = await this.queue.getNext(availableAgents.length);
        for (const task of tasksToAssign) {
            try {
                const assignment = await this.findOptimalAssignment(task, availableAgents);
                if (assignment) {
                    await this.assignTask(task, assignment);
                }
                else {
                    await this.queue.enqueue(task);
                }
            }
            catch (error) {
                this.logger.error('Failed to process task', { taskId: task.id, error });
                await this.handleTaskFailure({
                    taskId: task.id,
                    error: error,
                });
            }
        }
    }
    async findOptimalAssignment(task, availableAgents) {
        const suitableAgents = availableAgents.filter((agent) => this.isAgentSuitable(agent, task));
        if (suitableAgents.length === 0)
            return null;
        const optimizedAssignment = await this.assignmentOptimizer.findOptimalAssignment(task, suitableAgents, this.assignments, this.metrics);
        return optimizedAssignment;
    }
    isAgentSuitable(agent, task) {
        const hasRequiredCapabilities = task.requirements.capabilities.every((capability) => agent.capabilities.includes(capability));
        if (!hasRequiredCapabilities)
            return false;
        if (agent.currentLoad >= agent.maxLoad)
            return false;
        if (task.requirements.excludedAgents?.includes(agent.agentId))
            return false;
        if (agent.trustScore < 0.5)
            return false;
        const canHandleResources = task.requirements.resourceRequirements.cpu <= 1.0 &&
            task.requirements.resourceRequirements.memory <= 1.0;
        return canHandleResources;
    }
    async assignTask(task, agent) {
        const assignment = {
            taskId: task.id,
            agentId: agent.agentId,
            assignedAt: new Date(),
            expectedCompletion: new Date(Date.now() + task.estimatedDuration),
            assignment: {
                confidence: await this.calculateAssignmentConfidence(task, agent),
                reasoning: await this.generateAssignmentReasoning(task, agent),
                alternativeAgents: await this.findAlternativeAgents(task, agent),
                resourceAllocation: this.calculateResourceAllocation(task, agent),
                qualityExpectation: this.calculateQualityExpectation(task, agent),
            },
            monitoring: this.createMonitoringPlan(task, agent),
        };
        this.assignments.set(task.id, assignment);
        agent.currentLoad++;
        this.logger.info('Task assigned to agent', {
            taskId: task.id,
            agentId: agent.agentId,
            confidence: assignment.assignment.confidence,
        });
        this.eventBus.emit('task:assign', {
            taskId: task.id,
            agentId: agent.agentId,
            taskType: task.type,
            task: {
                id: task.id,
                description: task.description,
                requirements: task.requirements.capabilities,
            },
            priority: task.priority === 'normal'
                ? 'medium'
                : task.priority,
            dependencies: [],
            requiredCapabilities: task.requirements.capabilities || [],
            resourceRequirements: {
                cpu: 1,
                memory: 512,
                network: 100,
                disk: 256,
            },
            timestamp: new Date(),
            source: 'task-distribution-engine',
            id: `task-assign-${task.id}-${Date.now()}`,
            version: '1.0.0',
        });
        this.emit('task:assigned', {
            taskId: task.id,
            agentId: agent.agentId,
            assignment,
        });
    }
    async calculateAssignmentConfidence(task, agent) {
        return await this.performancePredictor.predictSuccess(task, agent);
    }
    async generateAssignmentReasoning(task, agent) {
        const reasons = [];
        const matchScore = this.calculateCapabilityMatch(task, agent);
        reasons.push(`Capability match: ${(matchScore * 100).toFixed(1)}%`);
        const performanceScore = this.calculatePerformanceScore(task, agent);
        reasons.push(`Performance score: ${(performanceScore * 100).toFixed(1)}%`);
        const loadScore = 1 - agent.currentLoad / agent.maxLoad;
        reasons.push(`Load availability: ${(loadScore * 100).toFixed(1)}%`);
        return reasons;
    }
    async findAlternativeAgents(task, primaryAgent) {
        const alternatives = Array.from(this.agentCapabilities.values())
            .filter((agent) => agent.agentId !== primaryAgent.agentId &&
            this.isAgentSuitable(agent, task))
            .sort((a, b) => {
            const scoreA = this.calculateAgentScore(task, a);
            const scoreB = this.calculateAgentScore(task, b);
            return scoreB - scoreA;
        })
            .slice(0, 3)
            .map((agent) => agent.agentId);
        return alternatives;
    }
    calculateCapabilityMatch(task, agent) {
        const requiredCaps = new Set(task.requirements.capabilities);
        const agentCaps = new Set(agent.capabilities);
        const intersection = new Set([...requiredCaps].filter((x) => agentCaps.has(x)));
        return intersection.size / requiredCaps.size;
    }
    calculatePerformanceScore(task, agent) {
        const taskTypePerf = agent.performance.taskTypes[task.type];
        return taskTypePerf
            ? taskTypePerf.successRate * taskTypePerf.efficiency
            : agent.performance.overall.successRate;
    }
    calculateAgentScore(task, agent) {
        const capabilityScore = this.calculateCapabilityMatch(task, agent);
        const performanceScore = this.calculatePerformanceScore(task, agent);
        const availabilityScore = 1 - agent.currentLoad / agent.maxLoad;
        const trustScore = agent.trustScore;
        return (capabilityScore * 0.3 +
            performanceScore * 0.3 +
            availabilityScore * 0.2 +
            trustScore * 0.2);
    }
    calculateResourceAllocation(task, _agent) {
        const allocation = {
            cpu: Math.min(task.requirements.resourceRequirements.cpu, 1.0),
            memory: Math.min(task.requirements.resourceRequirements.memory, 1.0),
            network: Math.min(task.requirements.resourceRequirements.network, 1.0),
            storage: Math.min(task.requirements.resourceRequirements.storage, 1.0),
            priority: this.getPriorityWeight(task.priority),
            ...(task.requirements.resourceRequirements.gpu !== undefined
                ? { gpu: task.requirements.resourceRequirements.gpu }
                : {}),
        };
        return allocation;
    }
    calculateQualityExpectation(task, agent) {
        const baseQuality = agent.performance.overall.qualityScore;
        const taskTypeQuality = agent.performance.taskTypes[task.type]?.qualityScore || baseQuality;
        return {
            accuracy: Math.min(task.requirements.qualityRequirements.accuracy, taskTypeQuality),
            speed: task.requirements.qualityRequirements.speed,
            completeness: task.requirements.qualityRequirements.completeness,
            confidence: 0.8,
        };
    }
    createMonitoringPlan(task, _agent) {
        return {
            checkInterval: Math.min(task.estimatedDuration / 10, 30000),
            progressTracking: true,
            qualityChecks: [
                {
                    checkType: 'progress',
                    frequency: 60000,
                    threshold: 0.1,
                    action: 'warn',
                },
                {
                    checkType: 'performance',
                    frequency: 120000,
                    threshold: 0.5,
                    action: 'escalate',
                },
            ],
            escalationTriggers: [
                {
                    condition: 'no_progress_15min',
                    threshold: 900000,
                    action: 'reassign',
                },
                {
                    condition: 'quality_below_threshold',
                    threshold: 0.3,
                    action: 'add_agents',
                },
            ],
        };
    }
    getPriorityWeight(priority) {
        switch (priority) {
            case 'critical':
                return 1.0;
            case 'urgent':
                return 0.8;
            case 'high':
                return 0.6;
            case 'normal':
                return 0.4;
            case 'low':
                return 0.2;
            default:
                return 0.4;
        }
    }
    subtaskToTask(subtask, parentId) {
        return {
            id: subtask.id,
            name: subtask.name,
            description: subtask.description,
            type: subtask.type,
            priority: 'normal',
            complexity: 'simple',
            requirements: subtask.requirements,
            constraints: {
                maxRetries: 3,
                timeoutMs: subtask.estimatedDuration * 2,
                isolationLevel: 'process',
                securityLevel: 'medium',
            },
            dependencies: subtask.dependencies.map((depId) => ({
                taskId: depId,
                type: 'blocking',
                weight: 1,
            })),
            estimatedDuration: subtask.estimatedDuration,
            metadata: { parentId, order: subtask.order },
            created: new Date(),
            submittedBy: 'system',
        };
    }
    async optimizeAssignments() {
        const pendingTasks = await this.queue.peek(10);
        if (pendingTasks.length > 0) {
            this.logger.debug('Assignment optimization triggered', {
                pendingTasks: pendingTasks.length,
            });
        }
    }
    async updateMetrics() {
        const queuedTasks = this.queue.size();
        const runningTasks = this.assignments.size;
        const agentUtilization = {};
        for (const [agentId, agent] of this.agentCapabilities) {
            agentUtilization[agentId] = agent.currentLoad / agent.maxLoad;
        }
        this.metrics = {
            ...this.metrics,
            queuedTasks,
            runningTasks,
            agentUtilization,
            loadBalance: this.calculateLoadBalance(),
            resourceEfficiency: this.calculateResourceEfficiency(),
        };
        this.emit('metrics:updated', { metrics: this.metrics });
    }
    calculateLoadBalance() {
        const utilizations = Array.from(this.agentCapabilities.values()).map((agent) => agent.currentLoad / agent.maxLoad);
        if (utilizations.length === 0)
            return 1;
        const avg = utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length;
        const variance = utilizations.reduce((sum, util) => sum + (util - avg) ** 2, 0) /
            utilizations.length;
        return Math.max(0, 1 - Math.sqrt(variance));
    }
    calculateResourceEfficiency() {
        const totalCapacity = Array.from(this.agentCapabilities.values()).reduce((sum, agent) => sum + agent.maxLoad, 0);
        const usedCapacity = Array.from(this.agentCapabilities.values()).reduce((sum, agent) => sum + agent.currentLoad, 0);
        return totalCapacity > 0 ? usedCapacity / totalCapacity : 0;
    }
    async performHealthChecks() {
        const now = Date.now();
        for (const [taskId, assignment] of this.assignments) {
            const runtime = now - assignment.assignedAt.getTime();
            const task = this.tasks.get(taskId);
            if (task && runtime > task.estimatedDuration * 2) {
                this.logger.warn('Task potentially stuck', {
                    taskId,
                    runtime,
                    estimated: task.estimatedDuration,
                });
                await this.handleStuckTask(taskId);
            }
        }
    }
    async rebalanceWorkload() {
        const imbalance = this.detectLoadImbalance();
        if (imbalance.severity > 0.3) {
            await this.workloadBalancer.rebalance(this.agentCapabilities, this.assignments, imbalance);
        }
    }
    detectLoadImbalance() {
        const utilizations = Array.from(this.agentCapabilities.entries()).map(([agentId, agent]) => ({
            agentId,
            utilization: agent.currentLoad / agent.maxLoad,
        }));
        const avg = utilizations.reduce((sum, { utilization }) => sum + utilization, 0) /
            utilizations.length;
        const overloaded = utilizations
            .filter(({ utilization }) => utilization > avg + 0.3)
            .map(({ agentId }) => agentId);
        const underloaded = utilizations
            .filter(({ utilization }) => utilization < avg - 0.3)
            .map(({ agentId }) => agentId);
        const severity = overloaded.length > 0 && underloaded.length > 0
            ? Math.min(overloaded.length, underloaded.length) / utilizations.length
            : 0;
        return { severity, overloaded, underloaded };
    }
    async handleStuckTask(taskId) {
        this.logger.info('Handling stuck task', { taskId });
        await this.reassignTask(taskId, 'task_stuck');
    }
    async handleAgentRegistration(data) {
        this.logger.debug('Agent registration event received', data);
    }
    async handleAgentCapabilitiesUpdate(data) {
        const agent = this.agentCapabilities.get(data?.agentId);
        if (agent) {
            agent.capabilities = data?.capabilities;
            agent.performance = data?.performance || agent.performance;
        }
    }
    async handleAgentPerformanceUpdate(data) {
        const agent = this.agentCapabilities.get(data?.agentId);
        if (agent) {
            agent.performance = { ...agent.performance, ...data?.performance };
        }
    }
    async handleTaskProgressUpdate(data) {
        this.emit('task:progress', data);
    }
    async handleTaskCompletion(data) {
        const assignment = this.assignments.get(data?.taskId);
        if (assignment) {
            const agent = this.agentCapabilities.get(assignment.agentId);
            if (agent) {
                agent.currentLoad = Math.max(0, agent.currentLoad - 1);
            }
            this.assignments.delete(data?.taskId);
            this.metrics.completedTasks++;
        }
        this.emit('task:completed', data);
    }
    async handleTaskFailure(data) {
        const assignment = this.assignments.get(data?.taskId);
        if (assignment) {
            const agent = this.agentCapabilities.get(assignment.agentId);
            if (agent) {
                agent.currentLoad = Math.max(0, agent.currentLoad - 1);
            }
            this.assignments.delete(data?.taskId);
            this.metrics.failedTasks++;
            await this.failureHandler.handleFailure(data?.taskId, data?.error, this.tasks, this.queue);
        }
        this.emit('task:failed', data);
    }
    async handleAgentUnavailable(data) {
        const agent = this.agentCapabilities.get(data?.agentId);
        if (agent) {
            agent.availability.currentStatus = 'offline';
            const affectedAssignments = Array.from(this.assignments.entries()).filter(([_, assignment]) => assignment.agentId === data?.agentId);
            for (const [taskId] of affectedAssignments) {
                await this.reassignTask(taskId, 'agent_unavailable');
            }
        }
    }
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    initializeMetrics() {
        return {
            totalTasks: 0,
            queuedTasks: 0,
            runningTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            avgWaitTime: 0,
            avgExecutionTime: 0,
            agentUtilization: {},
            throughput: 0,
            successRate: 1,
            loadBalance: 1,
            resourceEfficiency: 0,
        };
    }
    async shutdown() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }
        this.emit('shutdown');
        this.logger.info('Task distribution engine shutdown');
    }
}
class TaskQueue {
    logger;
    queue = [];
    constructor(logger) {
        this.logger = logger;
        void this.logger;
    }
    async enqueue(task) {
        this.queue.push(task);
        this.queue.sort((a, b) => this.comparePriority(a.priority, b.priority));
    }
    async getNext(count) {
        return this.queue.splice(0, count);
    }
    async peek(count) {
        return this.queue.slice(0, count);
    }
    async remove(taskId) {
        const index = this.queue.findIndex((task) => task.id === taskId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            return true;
        }
        return false;
    }
    size() {
        return this.queue.length;
    }
    comparePriority(a, b) {
        const weights = { critical: 5, urgent: 4, high: 3, normal: 2, low: 1 };
        return weights[b] - weights[a];
    }
}
class TaskDecomposer {
    logger;
    constructor(logger) {
        this.logger = logger;
        void this.logger;
    }
    async decompose(task) {
        return {
            id: `decomposed-${task.id}`,
            parentId: task.id,
            subtasks: [],
            executionPlan: {
                strategy: 'parallel',
                phases: [],
                checkpoints: [],
                rollbackPlan: [],
            },
            coordination: {
                type: 'centralized',
                communicationPattern: 'broadcast',
                syncPoints: [],
                conflictResolution: 'priority',
            },
        };
    }
}
class AssignmentOptimizer {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        void this.config;
        void this.logger;
    }
    async findOptimalAssignment(task, agents, _assignments, _metrics) {
        if (agents.length === 0)
            return null;
        const scored = agents.map((agent) => ({
            agent,
            score: this.calculateAssignmentScore(task, agent, _assignments),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored[0]?.agent ?? agents[0] ?? null;
    }
    calculateAssignmentScore(task, agent, _assignments) {
        const capabilityMatch = task.requirements.capabilities.every((cap) => agent.capabilities.includes(cap))
            ? 1
            : 0;
        const loadScore = 1 - agent.currentLoad / agent.maxLoad;
        const trustScore = agent.trustScore;
        return capabilityMatch * 0.4 + loadScore * 0.3 + trustScore * 0.3;
    }
}
class WorkloadBalancer {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        void this.config;
    }
    async rebalance(_agents, _assignments, imbalance) {
        this.logger.info('Rebalancing workload', { imbalance });
    }
}
class PerformancePredictor {
    logger;
    constructor(logger) {
        this.logger = logger;
        void this.logger;
    }
    async predictSuccess(task, agent) {
        const baseRate = agent.performance.overall.successRate;
        const taskTypePerf = agent.performance.taskTypes[task.type];
        return taskTypePerf ? taskTypePerf.successRate : baseRate;
    }
}
class FailureHandler {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async handleFailure(taskId, error, tasks, queue) {
        const task = tasks.get(taskId);
        if (!task)
            return;
        if (task.constraints.maxRetries > 0) {
            task.constraints.maxRetries--;
            await queue.enqueue(task);
            this.logger.info('Task re-queued after failure', {
                taskId,
                retriesLeft: task.constraints.maxRetries,
            });
        }
        else {
            this.logger.error('Task failed permanently', {
                taskId,
                error: error.message,
            });
        }
    }
}
export default TaskDistributionEngine;
//# sourceMappingURL=task-distribution-engine.js.map