/**
 * @file The primary orchestrator for the AI swarm, with full strategic capabilities and persistence.
 */

import { EventEmitter } from 'eventemitter3';

import type { Logger } from '../core/interfaces/base-interfaces';
import type { Database } from '../di/tokens/core-tokens';
import type { SwarmCoordinator } from '../di/tokens/swarm-tokens';
import type { Agent, ExecutionPlan, SwarmStrategy, Task } from './types';

import { ZenSwarmStrategy } from './strategies/zen-swarm.strategy';

export class Orchestrator extends EventEmitter implements SwarmCoordinator {
  private strategy: SwarmStrategy | ZenSwarmStrategy;
  private db: Database;
  private executionPlans = new Map<string, ExecutionPlan>();
  private activeExecutions = new Map<string, any>();
  private taskAssignments = new Map<string, any[]>();
  private isActive = false;
  private _logger: Logger;

  constructor(logger: Logger, database: Database, strategy?: SwarmStrategy) {
    super();
    this._logger = logger;
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
    this['_logger']?.info(
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
      await (plan.parallelizable ? this.executeParallel(task, plan, execution) : this.executeSequential(task, plan, execution));
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

  private async executeSequential(
    task: Task,
    plan: ExecutionPlan,
    execution: unknown
  ): Promise<void> {
    for (let i = 0; i < plan.phases.length; i++) {
      const phase = plan.phases[i];
      execution.currentPhase = i;
      const result = await this.executePhase(
        task,
        phase ?? '',
        plan,
        execution
      );
      execution.phaseResults.push(result);
      await this.db.updateTask(task.id, {
        progress: Math.round(((i + 1) / plan.phases.length) * 100),
      });
    }
  }

  private async executeParallel(
    task: Task,
    plan: ExecutionPlan,
    execution: unknown
  ): Promise<void> {
    const phasePromises = plan.phases.map((phase) =>
      this.executePhase(task, phase, plan, execution)
    );
    execution.phaseResults = await Promise.all(phasePromises);
  }

  private async executePhase(
    task: Task,
    phase: string,
    plan: ExecutionPlan,
    _execution: unknown
  ): Promise<unknown> {
    const phaseIndex = plan.phases.indexOf(phase);
    const assignments = plan.phaseAssignments.filter(
      (assignment) => assignment.phase === phase
    );
    const agentAssignments = await this.assignAgentsToPhase(task, assignments);
    const results = await Promise.all(
      agentAssignments.map((agentAssignment) =>
        this.strategy.assignTaskToAgent(agentAssignment.agent.id, {
          ...task,
          id: `${task.id}-${phase}`,
          description: `${task.description} (Phase: ${phase})`,
        })
      )
    );
    return { phase, phaseIndex, results };
  }

  private async assignAgentsToPhase(
    task: Task,
    assignments: unknown[]
  ): Promise<Array<{ agent: unknown; assignment: unknown }>> {
    const agentAssignments: Array<{ agent: unknown; assignment: unknown }> = [];
    for (const assignment of assignments) {
      const agent = await this.findSuitableAgent(
        assignment.requiredCapabilities
      );
      if (agent) {
        await this.db.updateAgent(agent.id, { status: 'busy' });
        agentAssignments.push({ agent, assignment });
      } else {
        this.queueAssignment(task.id, assignment);
      }
    }
    return agentAssignments;
  }

  private queueAssignment(taskId: string, assignment: unknown): void {
    if (!this.taskAssignments.has(taskId)) {
      this.taskAssignments.set(taskId, []);
    }
    this.taskAssignments.get(taskId)?.push(assignment);
  }

  private async findSuitableAgent(
    requiredCapabilities: string[]
  ): Promise<Agent | null> {
    const agents = await this.strategy.getAgents();
    // Convert SwarmAgents to Agent format for compatibility
    const compatibleAgents: Agent[] = agents
      .filter((agent) => agent.status === 'idle' || agent.status === 'busy')
      .map((agent) => ({
        id: agent.id,
        capabilities: agent.capabilities,
        status: agent.status as 'idle' | 'busy',
      }));

    const suitableAgents = compatibleAgents.filter(
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
        const score = perf.length > 0 ? perf[0]?.['metric_value'] : 0.5;
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
    await Promise.resolve(); // Satisfy require-await rule
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
  ): unknown {
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
        determinePhases: (t: Task) =>
          t.description.length > 100 ? ['analyze', 'exec'] : ['exec'],
        isParallelizable: () => true,
      },
      consensus: {
        determinePhases: () => ['propose', 'vote'],
        isParallelizable: () => false,
      },
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
          await this.executeTask(task, plan);
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
        const tasksToRebalance = await this.db.getSwarmTasks(
          'default',
          'executing'
        );
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

  // SwarmCoordinator interface implementation
  async initializeSwarm(options: any): Promise<void> {
    this['_logger']?.info('Initializing swarm with options', options);
    await this.initialize();
  }

  async addAgent(config: unknown): Promise<string> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this['_logger']?.info(`Adding agent with config`, { agentId, config });

    // Create agent record in database
    await this.db.execute(
      'INSERT NTO agents (id, config, status, created_at) VALUES (?, ?, ?, ?)',
      [agentId, JSON.stringify(config), 'active', new Date().toISOString()]
    );

    return agentId;
  }

  async removeAgent(agentId: string): Promise<void> {
    this['_logger']?.info(`Removing agent`, { agentId });

    // Update agent status in database
    await this.db.execute(
      'UPDATE agents SET status = ?, removed_at = ? WHERE id = ?',
      ['removed', new Date().toISOString(), agentId]
    );
  }

  async assignTask(task: unknown): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this['_logger']?.info(`Assigning task`, { taskId, task });

    // Submit task through existing method
    await this.submitTask({ ...task, id: taskId });

    return taskId;
  }

  getMetrics(): unknown {
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
