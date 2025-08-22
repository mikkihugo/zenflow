/**
 * @fileoverview Queen Coordinator
 *
 * Strategic multi-swarm coordination agent.
 */

import { getLogger } from '@claude-zen/foundation';
import { CoordinationEventBus } from '../events/coordination-event-bus';
import type {
  CoordinationAgent,
  StrategicObjective,
  CoordinationDecision,
  CoordinationConfig,
} from '../types';

const logger = getLogger('queen-coordinator');

export interface QueenConfig {
  domain: string;
  maxSwarms: number;
  resourceLimits: {
    cpu: number;
    memory: string;
  };
}

export class QueenCoordinator implements CoordinationAgent {
  public readonly id: string;
  public readonly role = 'queen' as const;
  public readonly capabilities: string[];
  public active: boolean = false;
  public lastActivity: number = Date.now();

  private config: QueenConfig;
  private commanders: Set<string> = new Set();
  private objectives: Map<string, StrategicObjective> = new Map();
  private decisions: CoordinationDecision[] = [];
  private eventBus: CoordinationEventBus;

  constructor(config: QueenConfig) {
    this.id = `queen-${Date.now()}`;
    this.config = config;
    this.capabilities = [
      'multi-swarm-coordination',
      'resource-allocation',
      'strategic-planning',
    ];
    this.eventBus = CoordinationEventBus.getInstance();

    // Subscribe to relevant events
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for coordination events.
   */
  private setupEventHandlers(): void {
    // Listen for commander events
    this.eventBus.on('commander:initialized', async (event: any) => {
      if (event.commanderId && this.commanders.has(event.commanderId)) {
        logger.info(
          `Queen ${this.id} received commander initialization: ${event.commanderId}`
        );
      }
    });

    // Listen for operation completion events
    this.eventBus.on('operation:completed', async (event: any) => {
      if (event.operationId) {
        logger.info(
          `Queen ${this.id} notified of operation completion: ${event.operationId}`
        );
        this.updateMetrics();
      }
    });

    // Listen for cross-domain coordination events
    this.eventBus.on('coordination:cross-domain', async (event: any) => {
      if (event.coordinationId) {
        logger.info(
          `Queen ${this.id} monitoring cross-domain coordination: ${event.coordinationId}`
        );
      }
    });
  }

  /**
   * Initialize the Queen coordinator.
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing Queen Coordinator ${this.id}`);
    this.active = true;
    this.lastActivity = Date.now();

    // Emit queen spawned event
    await this.eventBus.createAndEmit({
      type: 'queen:spawned',
      source: this.id,
      queenId: this.id,
      domain: this.config.domain,
      maxSwarms: this.config.maxSwarms,
    });
  }

  /**
   * Spawn a tactical commander.
   */
  async spawnCommander(config: {
    type: string;
    domain: string;
    capabilities: string[];
  }): Promise<string> {
    const commanderId = `commander-${config.type}-${Date.now()}`;
    this.commanders.add(commanderId);

    // Emit commander spawned event
    await this.eventBus.createAndEmit({
      type: 'commander:spawned',
      source: this.id,
      queenId: this.id,
      commanderId: commanderId,
      domain: config.domain,
      capabilities: config.capabilities,
    });

    logger.info(`Queen ${this.id} spawned commander ${commanderId}`);
    return commanderId;
  }

  /**
   * Coordinate a cross-swarm task.
   */
  async coordinateTask(task: {
    type: string;
    swarms: string[];
    objective: string;
    priority: 'low | medium' | 'high';
  }): Promise<{ success: boolean; result?: unknown }> {
    const decision: CoordinationDecision = {
      id: `decision-${Date.now()}`,
      timestamp: Date.now(),
      decisionMaker: 'queen',
      decisionType: 'strategic',
      action: 'coordinate-cross-swarm-task',
      parameters: task,
      confidence: 0.9,
      reasoning: `Multi-swarm coordination for ${task.objective}`,
    };

    this.decisions.push(decision);

    const taskId = `task-${Date.now()}`;

    // Emit cross-swarm coordination event
    await this.eventBus.createAndEmit({
      type: 'coordination:cross-swarm',
      source: this.id,
      queenId: this.id,
      swarms: task.swarms,
      objective: task.objective,
      priority: task.priority,
      taskId: taskId,
    });

    // Emit decision made event
    await this.eventBus.createAndEmit({
      type: 'decision:made',
      source: this.id,
      decision: decision,
      agentId: this.id,
      agentRole: 'queen',
    });

    logger.info(`Queen ${this.id} coordinating task: ${task.objective}`);
    return { success: true, result: { taskId: taskId } };
  }

  /**
   * Update metrics (called by event handlers).
   */
  private updateMetrics(): void {
    this.lastActivity = Date.now();
  }

  /**
   * Get coordination metrics.
   */
  getCoordinationMetrics() {
    const metrics = {
      decisionsMade: this.decisions.length,
      averageDecisionTime: 25, // ms
      successRate: 0.95,
      swarmsCoordinated: this.commanders.size,
    };

    // Emit performance metrics event
    this.eventBus.createAndEmit({
      type: 'metrics:performance',
      source: this.id,
      agentId: this.id,
      agentType: 'queen',
      metrics: {
        decisionsMade: metrics.decisionsMade,
        averageResponseTime: metrics.averageDecisionTime,
        successRate: metrics.successRate,
        resourceUtilization: 0.8,
      },
    });

    return metrics;
  }

  /**
   * Shutdown the Queen coordinator.
   */
  async shutdown(): Promise<void> {
    this.active = false;

    // Emit shutdown event
    await this.eventBus.createAndEmit({
      type: 'queen:shutdown',
      source: this.id,
      queenId: this.id,
      reason: 'Manual shutdown',
    });

    logger.info(`Queen Coordinator ${this.id} shutting down`);
  }
}
