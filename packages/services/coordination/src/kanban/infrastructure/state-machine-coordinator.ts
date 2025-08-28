/**
 * @fileoverview State Machine Coordinator Infrastructure Service
 *
 * Infrastructure layer for XState workflow coordination and state management.
 * Handles state machine lifecycle, transitions, and integration with domain services.
 *
 * **Responsibilities:**
 * - XState machine lifecycle management
 * - State transition coordination
 * - Context synchronization with domain state
 * - State machine persistence and recovery
 * - Event integration between state machines and domain services
 *
 * **Infrastructure Concerns:**
 * - XState interpreter management
 * - State machine configuration
 * - Transition logging and monitoring
 * - Error handling and recovery
 * - Performance optimization
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type { WorkflowKanbanEvents, WorkflowTask, TaskState, KanbanContext } from '../types/index';
import type { EventCoordinatorService } from './event-coordinator';
const logger = getLogger('StateMachineCoordinator'');

/**
 * State machine configuration interface
 */
export interface StateMachineConfig {
  /** Enable state machine persistence */
  enablePersistence: boolean;
  /** Enable transition logging */
  enableTransitionLogging: boolean;
  /** State machine execution timeout in milliseconds */
  executionTimeout: number;
  /** Maximum concurrent state machines */
  maxConcurrentMachines: number;
  /** Auto-cleanup idle machines after milliseconds */
  autoCleanupTimeout: number;
}

/**
 * State machine metrics interface
 */
export interface StateMachineMetrics {
  activeMachines: number;
  totalTransitions: number;
  averageTransitionTime: number;
  errorCount: number;
  lastTransitionTime: Date;
  machineStates: Record<string, string>;
}

/**
 * State machine transition result
 */
export interface TransitionResult {
  success: boolean;
  fromState: string;
  toState: string;
  context: any;
  timestamp: Date;
  duration: number;
  error?: string;
}

/**
 * State Machine Coordinator Infrastructure Service
 *
 * Manages XState workflow coordination with domain integration.
 * Provides infrastructure support for workflow state management.
 */
export class StateMachineCoordinatorService {
  private readonly config: StateMachineConfig;
  private readonly eventCoordinator: EventCoordinatorService;
  private metrics: StateMachineMetrics;
  private activeMachines: Map<string, any> = new Map();
  private transitionHistory: TransitionResult[] = [];
  private initialized = false;

  constructor(
    eventCoordinator: EventCoordinatorService,
    config: Partial<StateMachineConfig> = {}
  ) {
    this.eventCoordinator = eventCoordinator;
    this.config = {
      enablePersistence: true,
      enableTransitionLogging: true,
      executionTimeout: 30000,
      maxConcurrentMachines: 10,
      autoCleanupTimeout: 300000, // 5 minutes
      ...config,
    };

    this.metrics = {
      activeMachines: 0,
      totalTransitions: 0,
      averageTransitionTime: 0,
      errorCount: 0,
      lastTransitionTime: new Date(),
      machineStates: {},
    };

    logger.info('StateMachineCoordinatorService created,this.config');
  }

  /**
   * Initialize state machine coordinator
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('StateMachineCoordinatorService already initialized'');
      return;
    }

    try {
      // Set up event listeners for state machine coordination
      this.setupEventListeners();

      // Set up cleanup timer if enabled
      if (this.config.autoCleanupTimeout > 0) {
        this.setupAutoCleanup();
      }

      this.initialized = true;
      logger.info('StateMachineCoordinatorService initialized successfully'');
    } catch (error) {
      logger.error('Failed to initialize StateMachineCoordinatorService:,error');
      throw error;
    }
  }

  /**
   * Create and start a workflow state machine
   */
  async createWorkflowMachine(
    machineId: string,
    initialContext: KanbanContext
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('StateMachineCoordinator not initialized'');
    }

    if (this.activeMachines.size >= this.config.maxConcurrentMachines) {
      throw new Error('Maximum concurrent state machines reached'');
    }

    try {
      // Create workflow state machine configuration
      const machineConfig = this.createWorkflowMachineConfig(initialContext);
      
      // For now, create a placeholder machine representation
      const machine = {
        id: machineId,
        state:'idle,
        context: initialContext,
        createdAt: new Date(),
        lastTransition: new Date(),
      };

      this.activeMachines.set(machineId, machine);
      this.metrics.activeMachines = this.activeMachines.size;
      this.metrics.machineStates[machineId] = 'idle';
      // Emit machine creation event
      await this.eventCoordinator.emitEventSafe('workflow:machine_created,{
        machineId,
        initialState:'idle,
        context: initialContext,
        timestamp: new Date(),
      });

      logger.info(`Workflow state machine created: ${machineId}`);
      return machineId;
    } catch (error) {
      logger.error(`Failed to create workflow machine ${machineId}:`, error);
      throw error;
    }
  }

  /**
   * Send event to state machine
   */
  async sendEventToMachine(
    machineId: string,
    eventType: string,
    eventData?: any
  ): Promise<TransitionResult> {
    const machine = this.activeMachines.get(machineId);
    if (!machine) {
      throw new Error(`State machine ${machineId} not found`);
    }

    const startTime = Date.now();
    const fromState = machine.state;

    try {
      // Simulate state transition logic
      const toState = this.calculateNextState(fromState, eventType, eventData);
      const duration = Date.now() - startTime;

      // Update machine state
      machine.state = toState;
      machine.lastTransition = new Date();
      machine.context = { ...machine.context, ...eventData };

      // Create transition result
      const result: TransitionResult = {
        success: true,
        fromState,
        toState,
        context: machine.context,
        timestamp: new Date(),
        duration,
      };

      // Update metrics
      this.updateTransitionMetrics(duration, false);
      this.metrics.machineStates[machineId] = toState;

      // Store in history
      this.transitionHistory.push(result);
      if (this.transitionHistory.length > 100) {
        this.transitionHistory.shift();
      }

      // Log transition if enabled
      if (this.config.enableTransitionLogging) {
        logger.info(`State machine ${machineId} transitioned: ${fromState} -> ${toState}`, {
          eventType,
          duration,
        });
      }

      // Emit transition event
      await this.eventCoordinator.emitEventSafe('workflow:state_changed,{
        machineId,
        fromState,
        toState,
        eventType,
        context: machine.context,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateTransitionMetrics(duration, true);
      
      const result: TransitionResult = {
        success: false,
        fromState,
        toState: fromState, // Stay in same state on error
        context: machine.context,
        timestamp: new Date(),
        duration,
        error: error instanceof Error ? error.message :'Unknown error,
      };

      logger.error(`State machine ${machineId} transition failed:`, error);
      return result;
    }
  }

  /**
   * Stop and remove state machine
   */
  async stopMachine(machineId: string): Promise<void> {
    const machine = this.activeMachines.get(machineId);
    if (!machine) {
      logger.warn(`Attempted to stop non-existent machine: ${machineId}`);
      return;
    }

    try {
      // Remove from active machines
      this.activeMachines.delete(machineId);
      delete this.metrics.machineStates[machineId];
      this.metrics.activeMachines = this.activeMachines.size;

      // Emit machine stopped event
      await this.eventCoordinator.emitEventSafe('workflow:machine_stopped,{
        machineId,
        finalState: machine.state,
        context: machine.context,
        timestamp: new Date(),
      });

      logger.info(`State machine stopped: ${machineId}`);
    } catch (error) {
      logger.error(`Failed to stop machine ${machineId}:`, error);
      throw error;
    }
  }

  /**
   * Get state machine metrics
   */
  getMetrics(): StateMachineMetrics {
    return {
      ...this.metrics,
      machineStates: { ...this.metrics.machineStates }, // Copy for immutability
    };
  }

  /**
   * Get machine state information
   */
  getMachineState(machineId: string): { state: string; context: any }| null {
    const machine = this.activeMachines.get(machineId);
    if (!machine) return null;

    return {
      state: machine.state,
      context: { ...machine.context }, // Copy for immutability
    };
  }

  /**
   * Get transition history
   */
  getTransitionHistory(limit: number = 20): TransitionResult[] {
    return this.transitionHistory.slice(-limit);
  }

  /**
   * Shutdown state machine coordinator
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      // Stop all active machines
      const machineIds = Array.from(this.activeMachines.keys();
      await Promise.all(machineIds.map(id => this.stopMachine(id));

      this.initialized = false;
      logger.info('StateMachineCoordinatorService shutdown complete'');
    } catch (error) {
      logger.error('Error during StateMachineCoordinatorService shutdown:,error');
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE INFRASTRUCTURE METHODS
  // =============================================================================

  private setupEventListeners(): void {
    // Listen for task events to coordinate state machine transitions
    this.eventCoordinator.addListener('task:created,async (tasks) => {
      // Coordinate task creation with workflow state machines
      for (const task of tasks) {
        const machineId = `task-${task.id}`;
        if (!this.activeMachines.has(machineId)) {
          await this.createWorkflowMachine(machineId, {
            taskId: task.id,
            currentState: task.state,
            metadata: task.metadata|| {},
          });
        }
      }
    });

    this.eventCoordinator.addListener('task:moved,async ([taskId, fromState, toState]) => {
      const machineId = `task-${taskId}`;
      if (this.activeMachines.has(machineId)) {
        await this.sendEventToMachine(machineId,'MOVE_TASK,{
          fromState,
          toState,
          timestamp: new Date(),
        });
      }
    });
  }

  private setupAutoCleanup(): void {
    setInterval(() => {
      const cutoffTime = Date.now() - this.config.autoCleanupTimeout;
      
      for (const [machineId, machine] of this.activeMachines.entries()) {
        if (machine.lastTransition.getTime() < cutoffTime) {
          this.stopMachine(machineId).catch(error => {
            logger.error(`Failed to auto-cleanup machine ${machineId}:`, error);
          });
        }
      }
    }, this.config.autoCleanupTimeout / 2); // Check every half cleanup timeout
  }

  private createWorkflowMachineConfig(initialContext: KanbanContext): any {
    // Workflow state machine configuration
    return {
      id:'workflow-kanban,
      initial:'idle,
      context: initialContext,
      states: {
        idle: {
          on: {
            START_ANALYSIS:'analysis,
            START_DEVELOPMENT:'development,
          },
        },
        analysis: {
          on: {
            COMPLETE_ANALYSIS:'development,
            BLOCK_TASK:'blocked,
          },
        },
        development: {
          on: {
            COMPLETE_DEVELOPMENT:'testing,
            BLOCK_TASK:'blocked,
          },
        },
        testing: {
          on: {
            COMPLETE_TESTING:'review,
            FAIL_TESTING:'development,
            BLOCK_TASK:'blocked,
          },
        },
        review: {
          on: {
            APPROVE_REVIEW:'deployment,
            REQUEST_CHANGES:'development,
            BLOCK_TASK:'blocked,
          },
        },
        deployment: {
          on: {
            COMPLETE_DEPLOYMENT:'done,
            FAIL_DEPLOYMENT:'development,
            BLOCK_TASK:'blocked,
          },
        },
        blocked: {
          on: {
            UNBLOCK_TASK:'analysis,
          },
        },
        done: {
          type:'final,
        },
      },
    };
  }

  private calculateNextState(currentState: string, eventType: string, eventData?: any): string {
    // Simple state transition logic - would be more sophisticated with real XState
    const transitions: Record<string, Record<string, string>> = {
      idle: {
        START_ANALYSIS:'analysis,
        START_DEVELOPMENT:'development,
        MOVE_TASK: eventData?.toState|| currentState,
      },
      analysis: {
        COMPLETE_ANALYSIS:'development,
        BLOCK_TASK:'blocked,
        MOVE_TASK: eventData?.toState|| currentState,
      },
      development: {
        COMPLETE_DEVELOPMENT:'testing,
        BLOCK_TASK:'blocked,
        MOVE_TASK: eventData?.toState|| currentState,
      },
      testing: {
        COMPLETE_TESTING:'review,
        FAIL_TESTING:'development,
        BLOCK_TASK:'blocked,
        MOVE_TASK: eventData?.toState|| currentState,
      },
      review: {
        APPROVE_REVIEW:'deployment,
        REQUEST_CHANGES:'development,
        BLOCK_TASK:'blocked,
        MOVE_TASK: eventData?.toState|| currentState,
      },
      deployment: {
        COMPLETE_DEPLOYMENT:'done,
        FAIL_DEPLOYMENT:'development,
        BLOCK_TASK:'blocked,
        MOVE_TASK: eventData?.toState|| currentState,
      },
      blocked: {
        UNBLOCK_TASK:'analysis,
        MOVE_TASK: eventData?.toState|| currentState,
      },
      done: {
        // Final state - no transitions allowed
      },
    };

    return transitions[currentState]?.[eventType]|| currentState;
  }

  private updateTransitionMetrics(duration: number, isError: boolean): void {
    this.metrics.totalTransitions++;
    this.metrics.lastTransitionTime = new Date();

    if (isError) {
      this.metrics.errorCount++;
    } else {
      // Update average transition time
      const totalTime = this.metrics.averageTransitionTime * (this.metrics.totalTransitions - 1) + duration;
      this.metrics.averageTransitionTime = totalTime / this.metrics.totalTransitions;
    }
  }

  /**
   * Check if coordinator is healthy
   */
  isHealthy(): boolean {
    return this.initialized && 
           this.activeMachines.size < this.config.maxConcurrentMachines &&
           this.metrics.errorCount < this.metrics.totalTransitions * 0.1; // Less than 10% error rate
  }
}