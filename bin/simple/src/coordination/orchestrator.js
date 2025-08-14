import { EventEmitter } from 'node:events';
import { ZenSwarmStrategy } from './strategies/zen-swarm.strategy.ts';
export class Orchestrator extends EventEmitter {
    strategy;
    db;
    executionPlans = new Map();
    activeExecutions = new Map();
    taskAssignments = new Map();
    isActive = false;
    _logger;
    constructor(logger, database, strategy) {
        super();
        this._logger = logger;
        this.strategy = strategy || new ZenSwarmStrategy();
        this.db = database;
    }
    async initialize() {
        await this.db.initialize?.();
        this.startTaskDistributor();
        this.startProgressMonitor();
        this.startLoadBalancer();
        this.isActive = true;
        this.emit('initialized');
        this['_logger']?.info('Orchestrator initialized with full strategic capabilities and persistent database.');
    }
    async submitTask(task) {
        const plan = await this.createExecutionPlan(task);
        this.executionPlans.set(task.id, plan);
        await this.db.createTask({
            ...task,
            swarm_id: 'default',
            status: 'queued',
            assigned_agents: [],
            progress: 0,
            requirements: {},
            dependencies: [],
        });
        this.emit('taskSubmitted', { task, plan });
        await this.executeTask(task, plan);
    }
    async executeTask(task, plan) {
        const execution = {
            taskId: task.id,
            plan,
            startTime: Date.now(),
            currentPhase: 0,
            phaseResults: [],
            status: 'executing',
        };
        this.activeExecutions.set(task.id, execution);
        try {
            if (plan.parallelizable) {
                await this.executeParallel(task, plan, execution);
            }
            else {
                await this.executeSequential(task, plan, execution);
            }
            execution.status = 'completed';
            await this.db.updateTask(task.id, {
                status: 'completed',
                result: execution.phaseResults,
                progress: 100,
            });
            this.emit('taskCompleted', { taskId: task.id });
        }
        catch (error) {
            execution.status = 'failed';
            await this.db.updateTask(task.id, {
                status: 'failed',
                error_message: error.message,
            });
            this.emit('taskFailed', { taskId: task.id, error });
        }
        finally {
            this.activeExecutions.delete(task.id);
        }
    }
    async executeSequential(task, plan, execution) {
        for (let i = 0; i < plan.phases.length; i++) {
            const phase = plan.phases[i];
            execution.currentPhase = i;
            const result = await this.executePhase(task, phase ?? '', plan, execution);
            execution.phaseResults.push(result);
            await this.db.updateTask(task.id, {
                progress: Math.round(((i + 1) / plan.phases.length) * 100),
            });
        }
    }
    async executeParallel(task, plan, execution) {
        const phasePromises = plan.phases.map((phase) => this.executePhase(task, phase, plan, execution));
        execution.phaseResults = await Promise.all(phasePromises);
    }
    async executePhase(task, phase, plan, _execution) {
        const phaseIndex = plan.phases.indexOf(phase);
        const assignments = plan.phaseAssignments.filter((assignment) => assignment.phase === phase);
        const agentAssignments = await this.assignAgentsToPhase(task, assignments);
        const results = await Promise.all(agentAssignments.map((agentAssignment) => this.strategy.assignTaskToAgent(agentAssignment.agent.id, {
            ...task,
            id: `${task.id}-${phase}`,
            description: `${task.description} (Phase: ${phase})`,
        })));
        return { phase, phaseIndex, results };
    }
    async assignAgentsToPhase(task, assignments) {
        const agentAssignments = [];
        for (const assignment of assignments) {
            const agent = await this.findSuitableAgent(assignment.requiredCapabilities);
            if (agent) {
                await this.db.updateAgent(agent.id, { status: 'busy' });
                agentAssignments.push({ agent, assignment });
            }
            else {
                this.queueAssignment(task.id, assignment);
            }
        }
        return agentAssignments;
    }
    queueAssignment(taskId, assignment) {
        if (!this.taskAssignments.has(taskId)) {
            this.taskAssignments.set(taskId, []);
        }
        this.taskAssignments.get(taskId)?.push(assignment);
    }
    async findSuitableAgent(requiredCapabilities) {
        const agents = await this.strategy.getAgents();
        const compatibleAgents = agents
            .filter((agent) => agent.status === 'idle' || agent.status === 'busy')
            .map((agent) => ({
            id: agent.id,
            capabilities: agent.capabilities,
            status: agent.status,
        }));
        const suitableAgents = compatibleAgents.filter((agent) => agent.status === 'idle' &&
            requiredCapabilities.every((cap) => agent.capabilities.includes(cap)));
        if (suitableAgents.length === 0) {
            return null;
        }
        if (suitableAgents.length === 1) {
            return suitableAgents[0] ?? null;
        }
        const scoredAgents = await Promise.all(suitableAgents.map(async (agent) => {
            const perf = await this.db.getMetrics(agent.id, 'performance_score');
            const score = perf.length > 0 ? perf[0]?.['metric_value'] : 0.5;
            return { agent, score };
        }));
        scoredAgents.sort((a, b) => b.score - a.score);
        return scoredAgents[0]?.agent ?? null;
    }
    async createExecutionPlan(task) {
        const strategy = this.getStrategyImplementation(task.strategy);
        const phases = strategy.determinePhases(task);
        const phaseAssignments = phases.map(() => [
            { requiredCapabilities: task.requiredCapabilities },
        ]);
        return {
            taskId: task.id,
            phases,
            phaseAssignments,
            parallelizable: strategy.isParallelizable(task),
            checkpoints: [],
        };
    }
    getStrategyImplementation(strategy) {
        const strategies = {
            parallel: {
                determinePhases: () => ['exec'],
                isParallelizable: () => true,
            },
            sequential: {
                determinePhases: () => ['phase1', 'phase2'],
                isParallelizable: () => false,
            },
            adaptive: {
                determinePhases: (t) => t.description.length > 100 ? ['analyze', 'exec'] : ['exec'],
                isParallelizable: () => true,
            },
            consensus: {
                determinePhases: () => ['propose', 'vote'],
                isParallelizable: () => false,
            },
        };
        return strategies[strategy];
    }
    startTaskDistributor() {
        setInterval(async () => {
            if (!this.isActive)
                return;
            const queuedTasks = await this.db.getSwarmTasks('default', 'queued');
            for (const task of queuedTasks) {
                const plan = this.executionPlans.get(task.id);
                if (plan) {
                    await this.executeTask(task, plan);
                }
            }
        }, 5000);
    }
    startProgressMonitor() {
        setInterval(async () => {
            if (!this.isActive)
                return;
            const activeTasks = await this.db.getSwarmTasks('default', 'executing');
            for (const task of activeTasks) {
                const execution = this.activeExecutions.get(task.id);
                if (execution) {
                    const progress = Math.round((execution.currentPhase / execution.plan.phases.length) * 100);
                    if (task.progress !== progress) {
                        await this.db.updateTask(task.id, { progress });
                    }
                }
            }
        }, 2000);
    }
    startLoadBalancer() {
        setInterval(async () => {
            if (!this.isActive)
                return;
            const agents = await this.strategy.getAgents();
            const busyAgents = agents.filter((a) => a.status === 'busy');
            const idleAgents = agents.filter((a) => a.status === 'idle');
            if (busyAgents.length / agents.length > 0.8 && idleAgents.length > 0) {
                const tasksToRebalance = await this.db.getSwarmTasks('default', 'executing');
                if (tasksToRebalance.length > 0) {
                    const taskToRebalance = tasksToRebalance[0];
                    const agentToReassign = idleAgents[0];
                    await this.db.updateTask(taskToRebalance.id, {
                        assigned_agents: [agentToReassign?.id ?? ''],
                    });
                }
            }
        }, 30000);
    }
    async initializeSwarm(options) {
        this['_logger']?.info('Initializing swarm with options', options);
        await this.initialize();
    }
    async addAgent(config) {
        const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        this['_logger']?.info(`Adding agent with config`, { agentId, config });
        await this.db.execute('INSERT INTO agents (id, config, status, created_at) VALUES (?, ?, ?, ?)', [agentId, JSON.stringify(config), 'active', new Date().toISOString()]);
        return agentId;
    }
    async removeAgent(agentId) {
        this['_logger']?.info(`Removing agent`, { agentId });
        await this.db.execute('UPDATE agents SET status = ?, removed_at = ? WHERE id = ?', ['removed', new Date().toISOString(), agentId]);
    }
    async assignTask(task) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        this['_logger']?.info(`Assigning task`, { taskId, task });
        await this.submitTask({ ...task, id: taskId });
        return taskId;
    }
    getMetrics() {
        return {
            activeExecutions: this.activeExecutions.size,
            executionPlans: this.executionPlans.size,
            taskAssignments: this.taskAssignments.size,
            isActive: this.isActive,
            timestamp: new Date().toISOString(),
        };
    }
    async shutdown() {
        this.isActive = false;
        await this.db.shutdown?.();
        this.emit('shutdown');
    }
}
//# sourceMappingURL=orchestrator.js.map