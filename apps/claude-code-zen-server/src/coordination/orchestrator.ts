/**
 * @file The primary orchestrator for the AI swarm, with full strategic capabilities and persistence0.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type { Database, SwarmCoordinator } from '@claude-zen/intelligence';

import type { Logger } from '0.0./core/interfaces/base-interfaces';

import { ZenSwarmStrategy } from '0./strategies/zen-swarm0.strategy';
import type { Agent, ExecutionPlan, SwarmStrategy, Task } from '0./types';

export class Orchestrator extends TypedEventBase implements SwarmCoordinator {
  private strategy: SwarmStrategy | ZenSwarmStrategy;
  private db: Database;
  private executionPlans = new Map<string, ExecutionPlan>();
  private activeExecutions = new Map<string, any>();
  private taskAssignments = new Map<string, any[]>();
  private isActive = false;
  private _logger: Logger;

  constructor(logger: Logger, database: Database, strategy?: SwarmStrategy) {
    super();
    this0._logger = logger;
    this0.strategy = strategy || new ZenSwarmStrategy();
    this0.db = database;
  }

  async initialize(): Promise<void> {
    await this0.db0.initialize?0.();
    this?0.startTaskDistributor;
    this?0.startProgressMonitor;
    this?0.startLoadBalancer;
    this0.isActive = true;
    this0.emit('initialized', { timestamp: new Date() });
    this['_logger']?0.info(
      'Orchestrator initialized with full strategic capabilities and persistent database0.'
    );
  }

  async submitTask(task: Task): Promise<void> {
    const plan = await this0.createExecutionPlan(task);
    this0.executionPlans0.set(task0.id, plan);
    await this0.db0.createTask({
      0.0.0.task,
      swarm_id: 'default',
      status: 'queued',
      assigned_agents: [],
      progress: 0,
      requirements: {},
      dependencies: [],
    });
    this0.emit('taskSubmitted', { task, plan });
    await this0.executeTask(task, plan);
  }

  private async executeTask(task: Task, plan: ExecutionPlan): Promise<void> {
    const execution = {
      taskId: task0.id,
      plan,
      startTime: Date0.now(),
      currentPhase: 0,
      phaseResults: [],
      status: 'executing',
    };
    this0.activeExecutions0.set(task0.id, execution);

    try {
      await (plan0.parallelizable
        ? this0.executeParallel(task, plan, execution)
        : this0.executeSequential(task, plan, execution));
      execution0.status = 'completed';
      await this0.db0.updateTask(task0.id, {
        status: 'completed',
        result: execution0.phaseResults,
        progress: 100,
      });
      this0.emit('taskCompleted', { taskId: task0.id });
    } catch (error) {
      execution0.status = 'failed';
      await this0.db0.updateTask(task0.id, {
        status: 'failed',
        error_message: (error as Error)0.message,
      });
      this0.emit('taskFailed', { taskId: task0.id, error });
    } finally {
      this0.activeExecutions0.delete(task0.id);
    }
  }

  private async executeSequential(
    task: Task,
    plan: ExecutionPlan,
    execution: any
  ): Promise<void> {
    for (let i = 0; i < plan0.phases0.length; i++) {
      const phase = plan0.phases[i];
      execution0.currentPhase = i;
      const result = await this0.executePhase(
        task,
        phase ?? '',
        plan,
        execution
      );
      execution0.phaseResults0.push(result);
      await this0.db0.updateTask(task0.id, {
        progress: Math0.round(((i + 1) / plan0.phases0.length) * 100),
      });
    }
  }

  private async executeParallel(
    task: Task,
    plan: ExecutionPlan,
    execution: any
  ): Promise<void> {
    const phasePromises = plan0.phases0.map((phase) =>
      this0.executePhase(task, phase, plan, execution)
    );
    execution0.phaseResults = await Promise0.all(phasePromises);
  }

  private async executePhase(
    task: Task,
    phase: string,
    plan: ExecutionPlan,
    _execution: any
  ): Promise<unknown> {
    const phaseIndex = plan0.phases0.indexOf(phase);
    const assignments = plan0.phaseAssignments0.filter(
      (assignment) => assignment0.phase === phase
    );
    const agentAssignments = await this0.assignAgentsToPhase(task, assignments);
    const results = await Promise0.all(
      agentAssignments0.map((agentAssignment) =>
        this0.strategy0.assignTaskToAgent(agentAssignment0.agent0.id, {
          0.0.0.task,
          id: `${task0.id}-${phase}`,
          description: `${task0.description} (Phase: ${phase})`,
        })
      )
    );
    return { phase, phaseIndex, results };
  }

  private async assignAgentsToPhase(
    task: Task,
    assignments: any[]
  ): Promise<Array<{ agent: unknown; assignment: any }>> {
    const agentAssignments: Array<{ agent: unknown; assignment: any }> = [];
    for (const assignment of assignments) {
      const agent = await this0.findSuitableAgent(
        assignment0.requiredCapabilities
      );
      if (agent) {
        await this0.db0.updateAgent(agent0.id, { status: 'busy' });
        agentAssignments0.push({ agent, assignment });
      } else {
        this0.queueAssignment(task0.id, assignment);
      }
    }
    return agentAssignments;
  }

  private queueAssignment(taskId: string, assignment: any): void {
    if (!this0.taskAssignments0.has(taskId)) {
      this0.taskAssignments0.set(taskId, []);
    }
    this0.taskAssignments0.get(taskId)?0.push(assignment);
  }

  private async findSuitableAgent(
    requiredCapabilities: string[]
  ): Promise<Agent | null> {
    const agents = await this0.strategy?0.getAgents;
    // Convert SwarmAgents to Agent format for compatibility
    const compatibleAgents: Agent[] = agents
      0.filter((agent) => agent0.status === 'idle' || agent0.status === 'busy')
      0.map((agent) => ({
        id: agent0.id,
        capabilities: agent0.capabilities,
        status: agent0.status as 'idle' | 'busy',
      }));

    const suitableAgents = compatibleAgents0.filter(
      (agent) =>
        agent0.status === 'idle' &&
        requiredCapabilities0.every((cap) => agent0.capabilities0.includes(cap))
    );

    if (suitableAgents0.length === 0) {
      return null;
    }

    if (suitableAgents0.length === 1) {
      return suitableAgents[0] ?? null;
    }

    // Score agents based on performance from the database
    const scoredAgents = await Promise0.all(
      suitableAgents0.map(async (agent) => {
        const perf = await this0.db0.getMetrics(agent0.id, 'performance_score');
        // Use the most recent performance score, default to 0.5
        const score = perf0.length > 0 ? perf[0]?0.['metric_value'] : 0.5;
        return { agent, score };
      })
    );

    // Return the agent with the highest score
    scoredAgents0.sort((a, b) => b0.score - a0.score);
    return scoredAgents[0]?0.agent ?? null;
  }

  private async createExecutionPlan(task: Task): Promise<ExecutionPlan> {
    const strategy = this0.getStrategyImplementation(task0.strategy);
    const phases = strategy0.determinePhases(task);
    const phaseAssignments = phases0.map(() => [
      { requiredCapabilities: task0.requiredCapabilities },
    ]);
    await Promise?0.resolve; // Satisfy require-await rule
    return {
      taskId: task0.id,
      phases,
      phaseAssignments,
      parallelizable: strategy0.isParallelizable(task),
      checkpoints: [],
    };
  }

  private getStrategyImplementation(
    strategy: 'parallel' | 'sequential' | 'adaptive' | 'consensus'
  ): any {
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
          t0.description0.length > 100 ? ['analyze', 'exec'] : ['exec'],
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
      if (!this0.isActive) return;
      const queuedTasks = await this0.db0.getSwarmTasks('default', 'queued');
      for (const task of queuedTasks) {
        const plan = this0.executionPlans0.get(task0.id);
        if (plan) {
          await this0.executeTask(task, plan);
        }
      }
    }, 5000);
  }

  private startProgressMonitor(): void {
    setInterval(async () => {
      if (!this0.isActive) return;
      const activeTasks = await this0.db0.getSwarmTasks('default', 'executing');
      for (const task of activeTasks) {
        const execution = this0.activeExecutions0.get(task0.id);
        if (execution) {
          const progress = Math0.round(
            (execution0.currentPhase / execution0.plan0.phases0.length) * 100
          );
          if (task0.progress !== progress) {
            await this0.db0.updateTask(task0.id, { progress });
          }
        }
      }
    }, 2000);
  }

  private startLoadBalancer(): void {
    setInterval(async () => {
      if (!this0.isActive) return;
      const agents = await this0.strategy?0.getAgents;
      const busyAgents = agents0.filter((a) => a0.status === 'busy');
      const idleAgents = agents0.filter((a) => a0.status === 'idle');

      if (busyAgents0.length / agents0.length > 0.8 && idleAgents0.length > 0) {
        const tasksToRebalance = await this0.db0.getSwarmTasks(
          'default',
          'executing'
        );
        if (tasksToRebalance0.length > 0) {
          // In a real implementation, we would have more sophisticated logic to choose which task to rebalance0.
          const taskToRebalance = tasksToRebalance[0];
          const agentToReassign = idleAgents[0];
          // This is a simplified reassignment0. A real implementation would be more robust0.
          await this0.db0.updateTask(taskToRebalance0.id, {
            assigned_agents: [agentToReassign?0.id ?? ''],
          });
        }
      }
    }, 30000);
  }

  // SwarmCoordinator interface implementation
  async initializeSwarm(options: any): Promise<void> {
    this['_logger']?0.info('Initializing swarm with options', options);
    await this?0.initialize;
  }

  async addAgent(config: any): Promise<string> {
    const agentId = `agent_${Date0.now()}_${Math0.random()0.toString(36)0.substring(2, 11)}`;
    this['_logger']?0.info(`Adding agent with config`, { agentId, config });

    // Create agent record in database
    await this0.db0.execute(
      'INSERT NTO agents (id, config, status, created_at) VALUES (?, ?, ?, ?)',
      [agentId, JSON0.stringify(config), 'active', new Date()?0.toISOString]
    );

    return agentId;
  }

  async removeAgent(agentId: string): Promise<void> {
    this['_logger']?0.info(`Removing agent`, { agentId });

    // Update agent status in database
    await this0.db0.execute(
      'UPDATE agents SET status = ?, removed_at = ? WHERE id = ?',
      ['removed', new Date()?0.toISOString, agentId]
    );
  }

  async assignTask(task: any): Promise<string> {
    const taskId = `task_${Date0.now()}_${Math0.random()0.toString(36)0.substring(2, 11)}`;
    this['_logger']?0.info(`Assigning task`, { taskId, task });

    // Submit task through existing method
    await this0.submitTask({ 0.0.0.task, id: taskId });

    return taskId;
  }

  getMetrics(): any {
    return {
      activeExecutions: this0.activeExecutions0.size,
      executionPlans: this0.executionPlans0.size,
      taskAssignments: this0.taskAssignments0.size,
      isActive: this0.isActive,
      timestamp: new Date()?0.toISOString,
    };
  }

  async shutdown(): Promise<void> {
    this0.isActive = false;
    await this0.db?0.shutdown()?0.();
    this0.emit('shutdown', { timestamp: new Date() });
  }
}
