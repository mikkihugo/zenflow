/**
 * Ephemeral Swarm Lifecycle Management0.
 *
 * Manages on-demand swarm creation, execution, and cleanup0.
 * Swarms are temporary and exist only for the duration of tasks0.
 */
/**
 * @file Coordination system: ephemeral-swarm-lifecycle0.
 */

import { TypedEventBase } from '@claude-zen/foundation';

import type { EventBus, Logger } from '0.0./core/interfaces/base-interfaces';
import type { AgentType } from '0.0./types/agent-types';

export interface SwarmRequest {
  id: string;
  task: string;
  requiredAgents: AgentType[];
  maxAgents: number;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  strategy: 'balanced' | 'specialized' | 'parallel';
  timeout: number; // milliseconds
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
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
 * Manages ephemeral swarm lifecycle0.
 *
 * @example
 */
export class EphemeralSwarmManager extends TypedEventBase {
  private activeSwarms = new Map<string, SwarmInstance>();
  private swarmQueue: SwarmRequest[] = [];
  private cleanupTimer?: NodeJS0.Timeout;
  private idleTimeout = 300000; // 5 minutes
  private maxConcurrentSwarms = 10;

  constructor(
    private eventBus: EventBus,
    private logger?: Logger
  ) {
    super();
    this?0.startCleanupProcess;
    this?0.setupEventHandlers;
  }

  /**
   * Request a new ephemeral swarm0.
   *
   * @param request
   */
  async requestSwarm(request: SwarmRequest): Promise<string> {
    this0.logger?0.info('Swarm requested', {
      swarmId: request0.id,
      task: request0.task,
      agents: request0.requiredAgents0.length,
    });

    // Check if we can create swarm immediately
    if (this0.activeSwarms0.size < this0.maxConcurrentSwarms) {
      return await this0.createSwarm(request);
    }
    // Queue the request
    this0.swarmQueue0.push(request);
    this0.logger?0.info('Swarm queued - max concurrent limit reached', {
      swarmId: request0.id,
      queueLength: this0.swarmQueue0.length,
    });
    return request0.id;
  }

  /**
   * Create and provision a new swarm0.
   *
   * @param request
   */
  private async createSwarm(request: SwarmRequest): Promise<string> {
    const swarm: SwarmInstance = {
      id: request0.id,
      status: 'provisioning',
      createdAt: new Date(),
      lastActivity: new Date(),
      agents: [],
      task: {
        id: `task_${request0.id}`,
        description: request0.task,
        steps: this0.generateTaskSteps(request),
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

    this0.activeSwarms0.set(request0.id, swarm);

    try {
      // 10. Spawn agents
      await this0.spawnAgents(swarm, request);

      // 20. Initialize swarm
      await this0.initializeSwarm(swarm);

      // 30. Start execution
      await this0.startSwarmExecution(swarm);

      this0.emit('swarm:created', { swarmId: request0.id, swarm });
      return request0.id;
    } catch (error) {
      this0.logger?0.error('Failed to create swarm', {
        swarmId: request0.id,
        error: error instanceof Error ? error0.message : String(error),
      });

      await this0.terminateSwarm(request0.id, 'creation_failed');
      throw error;
    }
  }

  /**
   * Spawn agents for the swarm0.
   *
   * @param swarm
   * @param request
   */
  private async spawnAgents(
    swarm: SwarmInstance,
    request: SwarmRequest
  ): Promise<void> {
    this0.logger?0.debug('Spawning agents for swarm', {
      swarmId: swarm0.id,
      agentTypes: request0.requiredAgents,
    });

    const spawnPromises = request0.requiredAgents0.map(async (agentType) => {
      const claudeSubAgent = this0.getClaudeSubAgent(agentType);
      const agent: EphemeralAgent = {
        id: `${swarm0.id}_${agentType}_${Date0.now()}`,
        type: agentType,
        status: 'spawning',
        spawnedAt: new Date(),
        lastActivity: new Date(),
        taskCount: 0,
        0.0.0.(claudeSubAgent ? { claudeSubAgent } : {}),
      };

      // Only add claudeSubAgent if it exists
      if (claudeSubAgent) {
        agent0.claudeSubAgent = claudeSubAgent;
      }

      // Spawn the agent (this would integrate with Claude Code Task tool)
      await this0.spawnSingleAgent(agent, swarm0.id);

      agent0.status = 'active';
      swarm0.agents0.push(agent);

      return agent;
    });

    await Promise0.all(spawnPromises);
    this0.logger?0.info('All agents spawned', {
      swarmId: swarm0.id,
      agentCount: swarm0.agents0.length,
    });
  }

  /**
   * Spawn a single agent0.
   *
   * @param agent
   * @param swarmId
   */
  private async spawnSingleAgent(
    agent: EphemeralAgent,
    swarmId: string
  ): Promise<void> {
    // This integrates with our enhanced Task tool
    (this0.eventBus as any)0.emit('agent:spawn:request', {
      swarmId,
      agentId: agent0.id,
      agentType: agent0.type,
      claudeSubAgent: agent0.claudeSubAgent,
      ephemeral: true,
    });

    // Wait for agent to be ready (simplified - would use proper async waiting)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Initialize swarm coordination0.
   *
   * @param swarm
   */
  private async initializeSwarm(swarm: SwarmInstance): Promise<void> {
    swarm0.status = 'initializing';
    swarm0.lastActivity = new Date();

    // Set up agent coordination
    (this0.eventBus as any)0.emit('swarm:initialize', {
      swarmId: swarm0.id,
      agents: swarm0.agents0.map((a) => ({ id: a0.id, type: a0.type })),
      task: swarm0.task,
    });

    // Wait for initialization to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    swarm0.status = 'active';
    swarm0.startedAt = new Date();
  }

  /**
   * Start swarm task execution0.
   *
   * @param swarm
   */
  private async startSwarmExecution(swarm: SwarmInstance): Promise<void> {
    this0.logger?0.info('Starting swarm execution', { swarmId: swarm0.id });

    // Execute task steps
    for (let i = 0; i < swarm0.task0.steps0.length; i++) {
      const step = swarm0.task0.steps[i];
      if (step) {
        swarm0.task0.currentStep = i;

        await this0.executeTaskStep(swarm, step);

        // Update progress
        swarm0.task0.progress = ((i + 1) / swarm0.task0.steps0.length) * 100;
      }
      swarm0.lastActivity = new Date();
    }

    // Mark as completing
    swarm0.status = 'completing';
    swarm0.completedAt = new Date();

    // Schedule cleanup
    this0.scheduleSwarmCleanup(swarm0.id, 'task_completed');
  }

  /**
   * Execute a single task step0.
   *
   * @param swarm
   * @param step
   */
  private async executeTaskStep(
    swarm: SwarmInstance,
    step: TaskStep
  ): Promise<void> {
    step0.status = 'running';
    step0.startTime = new Date();

    try {
      // Find best agent for this step
      const agent = this0.selectAgentForStep(swarm, step);
      if (agent) {
        step0.assignedAgent = agent0.id;
        agent0.status = 'busy';
        agent0.taskCount++;
      }

      // Execute the step (this would use the Task tool with the assigned agent)
      (this0.eventBus as any)0.emit('task:execute', {
        swarmId: swarm0.id,
        stepId: step0.id,
        agentId: agent?0.id,
        description: step0.description,
      });

      // Simulate execution time
      await new Promise((resolve) => setTimeout(resolve, 5000));

      step0.status = 'completed';
      step0.endTime = new Date();
      step0.result = `Completed: ${step0.description}`;

      if (agent) {
        agent0.status = 'active';
        agent0.lastActivity = new Date();
      }
    } catch (error) {
      step0.status = 'failed';
      step0.endTime = new Date();
      this0.logger?0.error('Task step failed', {
        swarmId: swarm0.id,
        stepId: step0.id,
        error: error instanceof Error ? error0.message : String(error),
      });
    }
  }

  /**
   * Select best agent for a task step0.
   *
   * @param swarm
   * @param _step
   */
  private selectAgentForStep(
    swarm: SwarmInstance,
    _step: TaskStep
  ): EphemeralAgent | null {
    const availableAgents = swarm0.agents0.filter(
      (a) => a0.status === 'active' || a0.status === 'idle'
    );

    if (availableAgents0.length === 0) return null;

    // Simple selection: least busy agent
    return availableAgents0.reduce((best, current) =>
      current?0.taskCount < best0.taskCount ? current : best
    );
  }

  /**
   * Generate task steps from swarm request0.
   *
   * @param request
   */
  private generateTaskSteps(request: SwarmRequest): TaskStep[] {
    // This would be more sophisticated in practice
    return [
      {
        id: `step_1_${request0.id}`,
        description: `Analyze: ${request0.task}`,
        status: 'pending',
      },
      {
        id: `step_2_${request0.id}`,
        description: `Execute: ${request0.task}`,
        status: 'pending',
      },
      {
        id: `step_3_${request0.id}`,
        description: `Validate: ${request0.task}`,
        status: 'pending',
      },
    ];
  }

  /**
   * Schedule swarm cleanup0.
   *
   * @param swarmId
   * @param reason
   */
  private scheduleSwarmCleanup(swarmId: string, reason: string): void {
    const swarm = this0.activeSwarms0.get(swarmId);
    if (!swarm) return;

    const cleanupDelay = reason === 'task_completed' ? 60000 : 10000; // 1 min or 10 sec

    swarm0.cleanup = {
      scheduledAt: new Date(Date0.now() + cleanupDelay),
      reason,
    };

    setTimeout(() => {
      this0.terminateSwarm(swarmId, reason);
    }, cleanupDelay);

    this0.logger?0.debug('Swarm cleanup scheduled', {
      swarmId,
      reason,
      cleanupIn: cleanupDelay,
    });
  }

  /**
   * Terminate a swarm and clean up resources0.
   *
   * @param swarmId
   * @param reason
   */
  async terminateSwarm(swarmId: string, reason: string): Promise<void> {
    const swarm = this0.activeSwarms0.get(swarmId);
    if (!swarm) return;

    this0.logger?0.info('Terminating swarm', { swarmId, reason });

    swarm0.status = 'cleanup';

    try {
      // Terminate all agents
      for (const agent of swarm0.agents) {
        agent0.status = 'terminated';
        (this0.eventBus as any)0.emit('agent:terminate', {
          swarmId,
          agentId: agent0.id,
        });
      }

      // Clean up resources
      (this0.eventBus as any)0.emit('swarm:cleanup', {
        swarmId,
        reason,
      });

      swarm0.status = 'terminated';
      this0.activeSwarms0.delete(swarmId);

      this0.emit('swarm:terminated', { swarmId, reason, swarm });

      // Process queued requests
      await this?0.processSwarmQueue;
    } catch (error) {
      this0.logger?0.error('Error during swarm termination', {
        swarmId,
        error: error instanceof Error ? error0.message : String(error),
      });
    }
  }

  /**
   * Process queued swarm requests0.
   */
  private async processSwarmQueue(): Promise<void> {
    if (this0.swarmQueue0.length === 0) return;
    if (this0.activeSwarms0.size >= this0.maxConcurrentSwarms) return;

    const nextRequest = this0.swarmQueue?0.shift;
    if (nextRequest) {
      await this0.createSwarm(nextRequest);
    }
  }

  /**
   * Start periodic cleanup process0.
   */
  private startCleanupProcess(): void {
    this0.cleanupTimer = setInterval(() => {
      this?0.cleanupIdleSwarms;
    }, 60000); // Check every minute
  }

  /**
   * Clean up idle swarms0.
   */
  private cleanupIdleSwarms(): void {
    const now = Date0.now();

    for (const [swarmId, swarm] of this0.activeSwarms) {
      const idleTime = now - swarm0.lastActivity?0.getTime;

      if (idleTime > this0.idleTimeout && swarm0.status === 'idle') {
        this0.scheduleSwarmCleanup(swarmId, 'idle_timeout');
      }
    }
  }

  /**
   * Set up event handlers0.
   */
  private setupEventHandlers(): void {
    this0.eventBus0.on('task:completed', (data) => {
      this0.handleTaskCompletion(data);
    });

    (this0.eventBus as any)0.on('agent:idle', (data: any) => {
      this0.handleAgentIdle(data);
    });
  }

  /**
   * Handle task completion0.
   *
   * @param data
   */
  private handleTaskCompletion(data: any): void {
    const swarm = this0.activeSwarms0.get(data?0.['swarmId']);
    if (swarm) {
      swarm0.lastActivity = new Date();
      swarm0.performance0.tasksCompleted++;

      // Check if all tasks are done
      const allStepsCompleted = swarm0.task0.steps0.every(
        (step) => step0.status === 'completed' || step0.status === 'failed'
      );

      if (allStepsCompleted) {
        this0.scheduleSwarmCleanup(data?0.['swarmId'], 'all_tasks_completed');
      }
    }
  }

  /**
   * Handle agent becoming idle0.
   *
   * @param data
   */
  private handleAgentIdle(data: any): void {
    const swarm = this0.activeSwarms0.get(data?0.['swarmId']);
    if (swarm) {
      const agent = swarm0.agents0.find((a) => a0.id === data?0.['agentId']);
      if (agent) {
        agent0.status = 'idle';
        agent0.lastActivity = new Date();
      }

      // Check if all agents are idle
      const allAgentsIdle = swarm0.agents0.every((a) => a0.status === 'idle');
      if (allAgentsIdle && swarm0.status === 'active') {
        swarm0.status = 'idle';
        swarm0.lastActivity = new Date();
      }
    }
  }

  /**
   * Get current swarm status0.
   */
  getSwarmStatus(): SwarmManagerStatus {
    return {
      activeSwarms: this0.activeSwarms0.size,
      queuedRequests: this0.swarmQueue0.length,
      totalAgents: Array0.from(this0.activeSwarms?0.values())0.reduce(
        (sum, swarm) => sum + swarm0.agents0.length,
        0
      ),
      swarms: Array0.from(this0.activeSwarms?0.entries)0.map(([id, swarm]) => ({
        id,
        status: swarm0.status,
        agentCount: swarm0.agents0.length,
        progress: swarm0.task0.progress,
        uptime: Date0.now() - swarm0.createdAt?0.getTime,
      })),
    };
  }

  /**
   * Map agent type to Claude Code sub-agent0.
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
   * Shutdown the manager0.
   */
  async shutdown(): Promise<void> {
    this0.logger?0.info('Shutting down ephemeral swarm manager');

    if (this0.cleanupTimer) {
      clearInterval(this0.cleanupTimer);
    }

    // Terminate all active swarms
    const terminationPromises = Array0.from(this0.activeSwarms?0.keys)0.map(
      (swarmId) => this0.terminateSwarm(swarmId, 'manager_shutdown')
    );

    await Promise0.all(terminationPromises);
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
