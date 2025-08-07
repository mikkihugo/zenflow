/**
 * Ephemeral Swarm Lifecycle Management
 *
 * Manages on-demand swarm creation, execution, and cleanup.
 * Swarms are temporary and exist only for the duration of tasks.
 */

import { EventEmitter } from 'node:events';
import type { IEventBus } from '../core/event-bus';
import type { ILogger } from '../core/logger';
import type { AgentType } from '../types/agent-types';

export interface SwarmRequest {
  id: string;
  task: string;
  requiredAgents: AgentType[];
  maxAgents: number;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  strategy: 'balanced' | 'specialized' | 'parallel';
  timeout: number; // milliseconds
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface SwarmInstance {
  id: string;
  status: SwarmStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastActivity: Date;
  agents: EphemeralAgent[];
  task: SwarmTask;
  performance: SwarmPerformance;
  cleanup?: {
    scheduledAt: Date;
    reason: string;
  };
}

export interface EphemeralAgent {
  id: string;
  type: AgentType;
  status: 'spawning' | 'active' | 'idle' | 'busy' | 'completing' | 'terminated';
  spawnedAt: Date;
  lastActivity: Date;
  taskCount: number;
  claudeSubAgent?: string; // If using Claude Code sub-agent
}

export interface SwarmTask {
  id: string;
  description: string;
  steps: TaskStep[];
  currentStep: number;
  progress: number; // 0-100
  results: any[];
}

export interface TaskStep {
  id: string;
  description: string;
  assignedAgent?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: any;
}

export interface SwarmPerformance {
  totalExecutionTime: number;
  agentUtilization: number;
  tasksCompleted: number;
  successRate: number;
  efficiency: number;
}

export type SwarmStatus =
  | 'requested' // Swarm requested but not yet created
  | 'provisioning' // Agents being spawned
  | 'initializing' // Agents setting up
  | 'active' // Working on tasks
  | 'idle' // No active work, waiting
  | 'completing' // Finishing up tasks
  | 'cleanup' // Cleaning up resources
  | 'terminated'; // Swarm destroyed

/**
 * Manages ephemeral swarm lifecycle
 *
 * @example
 */
export class EphemeralSwarmManager extends EventEmitter {
  private activeSwarms = new Map<string, SwarmInstance>();
  private swarmQueue: SwarmRequest[] = [];
  private cleanupTimer?: NodeJS.Timeout;
  private idleTimeout = 300000; // 5 minutes
  private maxConcurrentSwarms = 10;

  constructor(
    private eventBus: IEventBus,
    private logger?: ILogger
  ) {
    super();
    this.startCleanupProcess();
    this.setupEventHandlers();
  }

  /**
   * Request a new ephemeral swarm
   *
   * @param request
   */
  async requestSwarm(request: SwarmRequest): Promise<string> {
    this.logger?.info('Swarm requested', {
      swarmId: request.id,
      task: request.task,
      agents: request.requiredAgents.length,
    });

    // Check if we can create swarm immediately
    if (this.activeSwarms.size < this.maxConcurrentSwarms) {
      return await this.createSwarm(request);
    } else {
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
   * Create and provision a new swarm
   *
   * @param request
   */
  private async createSwarm(request: SwarmRequest): Promise<string> {
    const swarm: SwarmInstance = {
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
    } catch (error) {
      this.logger?.error('Failed to create swarm', {
        swarmId: request.id,
        error: error instanceof Error ? error.message : String(error),
      });

      await this.terminateSwarm(request.id, 'creation_failed');
      throw error;
    }
  }

  /**
   * Spawn agents for the swarm
   *
   * @param swarm
   * @param request
   */
  private async spawnAgents(swarm: SwarmInstance, request: SwarmRequest): Promise<void> {
    this.logger?.debug('Spawning agents for swarm', {
      swarmId: swarm.id,
      agentTypes: request.requiredAgents,
    });

    const spawnPromises = request.requiredAgents.map(async (agentType) => {
      const claudeSubAgent = this.getClaudeSubAgent(agentType);
      const agent: EphemeralAgent = {
        id: `${swarm.id}_${agentType}_${Date.now()}`,
        type: agentType,
        status: 'spawning',
        spawnedAt: new Date(),
        lastActivity: new Date(),
        taskCount: 0,
        claudeSubAgent: claudeSubAgent || '',
      };

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
   * Spawn a single agent
   *
   * @param agent
   * @param swarmId
   */
  private async spawnSingleAgent(agent: EphemeralAgent, swarmId: string): Promise<void> {
    // This integrates with our enhanced Task tool
    (this.eventBus as any).emit('agent:spawn:request', {
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
   * Initialize swarm coordination
   *
   * @param swarm
   */
  private async initializeSwarm(swarm: SwarmInstance): Promise<void> {
    swarm.status = 'initializing';
    swarm.lastActivity = new Date();

    // Set up agent coordination
    (this.eventBus as any).emit('swarm:initialize', {
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
   * Start swarm task execution
   *
   * @param swarm
   */
  private async startSwarmExecution(swarm: SwarmInstance): Promise<void> {
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
   * Execute a single task step
   *
   * @param swarm
   * @param step
   */
  private async executeTaskStep(swarm: SwarmInstance, step: TaskStep): Promise<void> {
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
      (this.eventBus as any).emit('task:execute', {
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
    } catch (error) {
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
   * Select best agent for a task step
   *
   * @param swarm
   * @param _step
   */
  private selectAgentForStep(swarm: SwarmInstance, _step: TaskStep): EphemeralAgent | null {
    const availableAgents = swarm.agents.filter(
      (a) => a.status === 'active' || a.status === 'idle'
    );

    if (availableAgents.length === 0) return null;

    // Simple selection: least busy agent
    return availableAgents.reduce((best, current) =>
      current.taskCount < best.taskCount ? current : best
    );
  }

  /**
   * Generate task steps from swarm request
   *
   * @param request
   */
  private generateTaskSteps(request: SwarmRequest): TaskStep[] {
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
   * Schedule swarm cleanup
   *
   * @param swarmId
   * @param reason
   */
  private scheduleSwarmCleanup(swarmId: string, reason: string): void {
    const swarm = this.activeSwarms.get(swarmId);
    if (!swarm) return;

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
   * Terminate a swarm and clean up resources
   *
   * @param swarmId
   * @param reason
   */
  async terminateSwarm(swarmId: string, reason: string): Promise<void> {
    const swarm = this.activeSwarms.get(swarmId);
    if (!swarm) return;

    this.logger?.info('Terminating swarm', { swarmId, reason });

    swarm.status = 'cleanup';

    try {
      // Terminate all agents
      for (const agent of swarm.agents) {
        agent.status = 'terminated';
        (this.eventBus as any).emit('agent:terminate', {
          swarmId,
          agentId: agent.id,
        });
      }

      // Clean up resources
      (this.eventBus as any).emit('swarm:cleanup', {
        swarmId,
        reason,
      });

      swarm.status = 'terminated';
      this.activeSwarms.delete(swarmId);

      this.emit('swarm:terminated', { swarmId, reason, swarm });

      // Process queued requests
      await this.processSwarmQueue();
    } catch (error) {
      this.logger?.error('Error during swarm termination', {
        swarmId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Process queued swarm requests
   */
  private async processSwarmQueue(): Promise<void> {
    if (this.swarmQueue.length === 0) return;
    if (this.activeSwarms.size >= this.maxConcurrentSwarms) return;

    const nextRequest = this.swarmQueue.shift();
    if (nextRequest) {
      await this.createSwarm(nextRequest);
    }
  }

  /**
   * Start periodic cleanup process
   */
  private startCleanupProcess(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupIdleSwarms();
    }, 60000); // Check every minute
  }

  /**
   * Clean up idle swarms
   */
  private cleanupIdleSwarms(): void {
    const now = Date.now();

    for (const [swarmId, swarm] of this.activeSwarms) {
      const idleTime = now - swarm.lastActivity.getTime();

      if (idleTime > this.idleTimeout && swarm.status === 'idle') {
        this.scheduleSwarmCleanup(swarmId, 'idle_timeout');
      }
    }
  }

  /**
   * Set up event handlers
   */
  private setupEventHandlers(): void {
    this.eventBus.on('task:completed', (data) => {
      this.handleTaskCompletion(data);
    });

    (this.eventBus as any).on('agent:idle', (data: any) => {
      this.handleAgentIdle(data);
    });
  }

  /**
   * Handle task completion
   *
   * @param data
   */
  private handleTaskCompletion(data: any): void {
    const swarm = this.activeSwarms.get(data.swarmId);
    if (swarm) {
      swarm.lastActivity = new Date();
      swarm.performance.tasksCompleted++;

      // Check if all tasks are done
      const allStepsCompleted = swarm.task.steps.every(
        (step) => step.status === 'completed' || step.status === 'failed'
      );

      if (allStepsCompleted) {
        this.scheduleSwarmCleanup(data.swarmId, 'all_tasks_completed');
      }
    }
  }

  /**
   * Handle agent becoming idle
   *
   * @param data
   */
  private handleAgentIdle(data: any): void {
    const swarm = this.activeSwarms.get(data.swarmId);
    if (swarm) {
      const agent = swarm.agents.find((a) => a.id === data.agentId);
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
   * Get current swarm status
   */
  getSwarmStatus(): SwarmManagerStatus {
    return {
      activeSwarms: this.activeSwarms.size,
      queuedRequests: this.swarmQueue.length,
      totalAgents: Array.from(this.activeSwarms.values()).reduce(
        (sum, swarm) => sum + swarm.agents.length,
        0
      ),
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
   * Map agent type to Claude Code sub-agent
   *
   * @param agentType
   */
  private getClaudeSubAgent(agentType: AgentType): string | undefined {
    const mappings: Record<string, string> = {
      'code-review-swarm': 'code-reviewer',
      debug: 'debugger',
      'ai-ml-specialist': 'ai-ml-specialist',
      'database-architect': 'database-architect',
      'system-architect': 'system-architect',
    };

    return mappings[agentType];
  }

  /**
   * Shutdown the manager
   */
  async shutdown(): Promise<void> {
    this.logger?.info('Shutting down ephemeral swarm manager');

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Terminate all active swarms
    const terminationPromises = Array.from(this.activeSwarms.keys()).map((swarmId) =>
      this.terminateSwarm(swarmId, 'manager_shutdown')
    );

    await Promise.all(terminationPromises);
  }
}

interface SwarmManagerStatus {
  activeSwarms: number;
  queuedRequests: number;
  totalAgents: number;
  swarms: Array<{
    id: string;
    status: SwarmStatus;
    agentCount: number;
    progress: number;
    uptime: number;
  }>;
}

export default EphemeralSwarmManager;
