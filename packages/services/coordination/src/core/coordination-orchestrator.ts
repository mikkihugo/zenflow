/**
 * @fileoverview Coordination Orchestrator - Lightweight coordination layer
 * 
 * Simple orchestrator that coordinates existing package functionality for
 * SAFe 6.0, TaskMaster, Teamwork, Kanban, AGUI, and SPARC processes.
 * 
 * @author Claude Code Zen Team
 * @version 1.0.0
 */

import {
  EventBus,
  getLogger,
  ok,
  err,
  Result,
  generateUUID,
  now,
  type Logger,
  type UUID
} from '@claude-zen/foundation';

import type {
  AgentId,
  AgentState,
  CoordinationConfig,
  CoordinationTask,
  CoordinationEvent
} from './coordination-interfaces.js';

/**
 * Lightweight coordination orchestrator that connects existing package functionality.
 * Acts as a coordination layer rather than reimplementing business logic.
 */
export class CoordinationOrchestrator {
  private readonly logger: Logger;
  private readonly eventBus: EventBus;
  private readonly config: CoordinationConfig;
  
  // Simple state tracking
  private readonly registeredAgents = new Set<string>();
  private readonly activeTasks = new Map<UUID, CoordinationTask>();
  
  private isInitialized = false;

  constructor(config: CoordinationConfig, eventBus?: EventBus) {
    this.config = config;
    this.logger = getLogger('coordination-orchestrator');
    this.eventBus = eventBus ?? new EventBus(config.eventBusConfig);

    this.logger.info('Coordination Orchestrator created - connecting to existing packages');
  }

  /**
   * Initialize the coordination orchestrator.
   */
  public async initialize(): Promise<Result<void, Error>> {
    if (this.isInitialized) {
      return ok(undefined);
    }

    try {
      this.setupEventListeners();
      this.isInitialized = true;
      
      this.logger.info('Coordination Orchestrator initialized - ready to coordinate existing packages');
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Initialization failed: ${error}`));
    }
  }

  /**
   * Register an agent for coordination.
   */
  public async registerAgent(agentState: AgentState): Promise<Result<void, Error>> {
    try {
      const agentKey = `${agentState.agentId.swarmId}:${agentState.agentId.id}`;
      this.registeredAgents.add(agentKey);

      // Emit event for other packages to handle
      await this.emitCoordinationEvent({
        type: 'coordination:agent-registered',
        category: 'coordination',
        payload: { agentState },
        coordinationMetadata: {
          initiator: agentState.agentId,
          timestamp: now(),
          correlationId: generateUUID()
        }
      });

      this.logger.info('Agent registered for coordination', { agentId: agentState.agentId });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Agent registration failed: ${error}`));
    }
  }

  /**
   * Submit a coordination task.
   */
  public async submitTask(task: CoordinationTask): Promise<Result<UUID, Error>> {
    try {
      this.activeTasks.set(task.taskId, task);

      // Emit event for package-specific handlers
      await this.emitCoordinationEvent({
        type: 'coordination:task-submitted',
        category: 'coordination',
        payload: { task },
        coordinationMetadata: {
          initiator: this.getSystemAgent(),
          timestamp: now(),
          correlationId: generateUUID()
        }
      });

      this.logger.info('Task submitted for coordination', { 
        taskId: task.taskId, 
        type: task.type 
      });

      return ok(task.taskId);
    } catch (error) {
      return err(new Error(`Task submission failed: ${error}`));
    }
  }

  /**
   * Get coordination system status.
   */
  public getStatus(): {
    initialized: boolean;
    registeredAgents: number;
    activeTasks: number;
  } {
    return {
      initialized: this.isInitialized,
      registeredAgents: this.registeredAgents.size,
      activeTasks: this.activeTasks.size
    };
  }

  /**
   * Coordinate SAFe 6.0 PI Planning (delegates to SAFe package).
   */
  public async coordinatePIPlanning(piId: UUID): Promise<Result<void, Error>> {
    try {
      await this.emitCoordinationEvent({
        type: 'safe:pi-planning-requested',
        category: 'coordination',
        payload: { piId },
        coordinationMetadata: {
          initiator: this.getSystemAgent(),
          timestamp: now(),
          correlationId: generateUUID()
        }
      });

      this.logger.info('PI Planning coordination requested', { piId });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`PI Planning coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate TaskMaster approval (delegates to TaskMaster package).
   */
  public async coordinateApproval(approvalId: UUID): Promise<Result<void, Error>> {
    try {
      await this.emitCoordinationEvent({
        type: 'taskmaster:approval-requested',
        category: 'coordination',
        payload: { approvalId },
        coordinationMetadata: {
          initiator: this.getSystemAgent(),
          timestamp: now(),
          correlationId: generateUUID()
        }
      });

      this.logger.info('TaskMaster approval coordination requested', { approvalId });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Approval coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate Teamwork collaboration (delegates to Teamwork package).
   */
  public async coordinateTeamwork(sessionId: UUID): Promise<Result<void, Error>> {
    try {
      await this.emitCoordinationEvent({
        type: 'teamwork:collaboration-requested',
        category: 'coordination',
        payload: { sessionId },
        coordinationMetadata: {
          initiator: this.getSystemAgent(),
          timestamp: now(),
          correlationId: generateUUID()
        }
      });

      this.logger.info('Teamwork coordination requested', { sessionId });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Teamwork coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate Kanban flow optimization (delegates to Kanban package).
   */
  public async coordinateKanban(boardId: string): Promise<Result<void, Error>> {
    try {
      await this.emitCoordinationEvent({
        type: 'kanban:optimization-requested',
        category: 'coordination',
        payload: { boardId },
        coordinationMetadata: {
          initiator: this.getSystemAgent(),
          timestamp: now(),
          correlationId: generateUUID()
        }
      });

      this.logger.info('Kanban coordination requested', { boardId });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`Kanban coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate SPARC process (delegates to SPARC package).
   */
  public async coordinateSPARC(projectId: UUID, phase: string): Promise<Result<void, Error>> {
    try {
      await this.emitCoordinationEvent({
        type: 'sparc:phase-coordination-requested',
        category: 'coordination',
        payload: { projectId, phase },
        coordinationMetadata: {
          initiator: this.getSystemAgent(),
          timestamp: now(),
          correlationId: generateUUID()
        }
      });

      this.logger.info('SPARC coordination requested', { projectId, phase });
      return ok(undefined);
    } catch (error) {
      return err(new Error(`SPARC coordination failed: ${error}`));
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private setupEventListeners(): void {
    // Listen for coordination events from other packages
    this.eventBus.on('coordination:*', (event: CoordinationEvent) => {
      this.logger.debug('Coordination event received', { type: event.type });
    });

    // Listen for package-specific events that need coordination
    this.eventBus.on('safe:*', (event: CoordinationEvent) => {
      this.logger.debug('SAFe event received for coordination', { type: event.type });
    });

    this.eventBus.on('taskmaster:*', (event: CoordinationEvent) => {
      this.logger.debug('TaskMaster event received for coordination', { type: event.type });
    });

    this.eventBus.on('teamwork:*', (event: CoordinationEvent) => {
      this.logger.debug('Teamwork event received for coordination', { type: event.type });
    });

    this.eventBus.on('kanban:*', (event: CoordinationEvent) => {
      this.logger.debug('Kanban event received for coordination', { type: event.type });
    });

    this.eventBus.on('sparc:*', (event: CoordinationEvent) => {
      this.logger.debug('SPARC event received for coordination', { type: event.type });
    });
  }

  private getSystemAgent(): AgentId {
    return {
      id: 'coordination-orchestrator',
      swarmId: 'system',
      type: 'coordinator',
      instance: 1
    };
  }

  private async emitCoordinationEvent(event: CoordinationEvent): Promise<void> {
    this.eventBus.emit(event.type, event);
  }
}