/**
 * @file The primary orchestrator for the AI swarm, with full strategic capabilities and persistence.
 */

import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/interfaces/base-interfaces';
import { IDatabase } from '../di/tokens/core-tokens';
import type { ISwarmCoordinator } from '../di/tokens/swarm-tokens';
import type { Task, Agent } from './types';
import { ZenSwarmStrategy } from './strategies/ruv-swarm.strategy';
import type { SwarmStrategy, ExecutionPlan } from './types';

export class Orchestrator extends EventEmitter implements ISwarmCoordinator {
  private strategy: SwarmStrategy | ZenSwarmStrategy;
  private db: IDatabase;
  private executionPlans = new Map<string, ExecutionPlan>();
  private activeExecutions = new Map<string, any>();
  private taskAssignments = new Map<string, any[]>();
  private isActive = false;
  private _logger: ILogger;

  constructor(
    logger: ILogger,
    database: IDatabase,
    strategy?: SwarmStrategy,
  ) {
    this._logger = logger;
    super();
    this.strategy = strategy || new ZenSwarmStrategy();
    this.db = database;
  }

  async initialize(): Promise<void> {
    await this.db.initialize?.();
    this.startTaskDistributor();
    this.startProgressMonitor();
    this.startLoadBalancer();
    this.isActive = true;
    this.emit('initialized');
    this["_logger"]?.info(
      'Orchestrator initialized with full strategic capabilities and persistent database.'
    );
  }

  async submitTask(task: Task): Promise<void> {
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

  private async executeTask(task: Task, plan: ExecutionPlan): Promise<void> {
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
      } else {
        await this.executeSequential(task, plan, execution);
      }
      execution.status = 'completed';
      await this.db.updateTask(task.id, {
        status: 'completed',
        result: execution.phaseResults,
        progress: 100,
      });
      this.emit('taskCompleted', { taskId: task.id });
    } catch (error) {
      execution.status = 'failed';
      await this.db.updateTask(task.id, {
        status: 'failed',
        error_message: (error as Error).message,
      });
      this.emit('taskFailed', { taskId: task.id, error });
    } finally {
      this.activeExecutions.delete(task.id);
    }
  }

  private async executeSequential(task: Task, plan: ExecutionPlan, execution: any): Promise<void> {
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

  private async executeParallel(task: Task, plan: ExecutionPlan, execution: any): Promise<void> {
    const phasePromises = plan.phases.map((phase) =>
      this.executePhase(task, phase, plan, execution)
    );
    execution.phaseResults = await Promise.all(phasePromises);
  }

  private async executePhase(
    task: Task,
    phase: string,
    plan: ExecutionPlan,
    _execution: any
  ): Promise<any> {
    const phaseIndex = plan.phases.indexOf(phase);
    const assignments = plan.phaseAssignments[phaseIndex];
    const agentAssignments = await this.assignAgentsToPhase(task, assignments);
    const results = await Promise.all(
      agentAssignments.map((agentAssignment) =>
        this.strategy.assignTaskToAgent(agentAssignment.agent.id, {
          phase,
          taskInfo: task.description,
        })
      )
    );
    return { phase, results };
  }

  private async assignAgentsToPhase(
    task: Task,
    assignments: any[]
  ): Promise<Array<{ agent: any; assignment: any }>> {
    const agentAssignments: Array<{ agent: any; assignment: any }> = [];
    for (const assignment of assignments) {
      const agent = await this.findSuitableAgent(assignment.requiredCapabilities);
      if (agent) {
        await this.db.updateAgent(agent.id, { status: 'busy' });
        agentAssignments.push({ agent, assignment });
      } else {
        this.queueAssignment(task.id, assignment);
      }
    }
    return agentAssignments;
  }

  private queueAssignment(taskId: string, assignment: any): void {
    if (!this.taskAssignments.has(taskId)) {
      this.taskAssignments.set(taskId, []);
    }
    this.taskAssignments.get(taskId)?.push(assignment);
  }

  private async findSuitableAgent(requiredCapabilities: string[]): Promise<Agent | null> {
    const agents = await this.strategy.getAgents();
    const suitableAgents = agents.filter(
      (agent) =>
        agent.status === 'idle' &&
        requiredCapabilities.every((cap) => agent.capabilities.includes(cap))
    );

    if (suitableAgents.length === 0) {
      return null;
    }

    if (suitableAgents.length === 1) {
      return suitableAgents[0] ?? null;
    }

    // Score agents based on performance from the database
    const scoredAgents = await Promise.all(
      suitableAgents.map(async (agent) => {
        const perf = await this.db.getMetrics(agent.id, 'performance_score');
        // Use the most recent performance score, default to 0.5
        const score = perf.length > 0 ? perf[0]?.["metric_value"] : 0.5;
        return { agent, score };
      })
    );

    // Return the agent with the highest score
    scoredAgents.sort((a, b) => b.score - a.score);
    return scoredAgents[0]?.agent ?? null;
  }

  private async createExecutionPlan(task: Task): Promise<ExecutionPlan> {
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

  private getStrategyImplementation(
    strategy: 'parallel' | 'sequential' | 'adaptive' | 'consensus'
  ): any {
    const strategies = {
      parallel: { determinePhases: () => ['exec'], isParallelizable: () => true },
      sequential: { determinePhases: () => ['phase1', 'phase2'], isParallelizable: () => false },
      adaptive: {
        determinePhases: (t: Task) => (t.description.length > 100 ? ['analyze', 'exec'] : ['exec']),
        isParallelizable: () => true,
      },
      consensus: { determinePhases: () => ['propose', 'vote'], isParallelizable: () => false },
    };
    return strategies[strategy];
  }

  private startTaskDistributor(): void {
    setInterval(async () => {
      if (!this.isActive) return;
      const queuedTasks = await this.db.getSwarmTasks('default', 'queued');
      for (const task of queuedTasks) {
        const plan = this.executionPlans.get(task.id);
        if (plan) {
          await this.executeTask(task as any, plan);
        }
      }
    }, 5000);
  }

  private startProgressMonitor(): void {
    setInterval(async () => {
      if (!this.isActive) return;
      const activeTasks = await this.db.getSwarmTasks('default', 'executing');
      for (const task of activeTasks) {
        const execution = this.activeExecutions.get(task.id);
        if (execution) {
          const progress = Math.round(
            (execution.currentPhase / execution.plan.phases.length) * 100
          );
          if (task.progress !== progress) {
            await this.db.updateTask(task.id, { progress });
          }
        }
      }
    }, 2000);
  }

  private startLoadBalancer(): void {
    setInterval(async () => {
      if (!this.isActive) return;
      const agents = await this.strategy.getAgents();
      const busyAgents = agents.filter((a) => a.status === 'busy');
      const idleAgents = agents.filter((a) => a.status === 'idle');

      if (busyAgents.length / agents.length > 0.8 && idleAgents.length > 0) {
        const tasksToRebalance = await this.db.getSwarmTasks('default', 'executing');
        if (tasksToRebalance.length > 0) {
          // In a real implementation, we would have more sophisticated logic to choose which task to rebalance.
          const taskToRebalance = tasksToRebalance[0];
          const agentToReassign = idleAgents[0];
          // This is a simplified reassignment. A real implementation would be more robust.
          await this.db.updateTask(taskToRebalance.id, {
            assigned_agents: [agentToReassign?.id ?? ''],
          });
        }
      }
    }, 30000);
  }

  // ISwarmCoordinator interface implementation
  async initializeSwarm(options: any): Promise<void> {
    this["_logger"]?.info('Initializing swarm with options', options);
    await this.initialize();
  }

  async addAgent(config: any): Promise<string> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this["_logger"]?.info(`Adding agent with config`, { agentId, config });

    // Create agent record in database
    await this.db.execute(
      'INSERT INTO agents (id, config, status, created_at) VALUES (?, ?, ?, ?)',
      [agentId, JSON.stringify(config), 'active', new Date().toISOString()]
    );

    return agentId;
  }

  async removeAgent(agentId: string): Promise<void> {
    this["_logger"]?.info(`Removing agent`, { agentId });

    // Update agent status in database
    await this.db.execute('UPDATE agents SET status = ?, removed_at = ? WHERE id = ?', [
      'removed',
      new Date().toISOString(),
      agentId,
    ]);
  }

  async assignTask(task: any): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this["_logger"]?.info(`Assigning task`, { taskId, task });

    // Submit task through existing method
    await this.submitTask({ ...task, id: taskId });

    return taskId;
  }

  getMetrics(): any {
    return {
      activeExecutions: this.activeExecutions.size,
      executionPlans: this.executionPlans.size,
      taskAssignments: this.taskAssignments.size,
      isActive: this.isActive,
      timestamp: new Date().toISOString(),
    };
  }

  async shutdown(): Promise<void> {
    this.isActive = false;
    await this.db.shutdown?.();
    this.emit('shutdown');
  }
}
