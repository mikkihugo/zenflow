/**
 * @fileoverview Core coordination interfaces for unified coordination system
 * 
 * This module defines the essential interfaces and types for the Claude Code Zen
 * coordination system, following Google TypeScript Style Guide and event-driven
 * architecture principles.
 * 
 * @author Claude Code Zen Team
 * @version 1.0.0
 */

import type { 
  BaseEvent, 
  EventBusConfig, 
  EventPayload, 
  Result, 
  UUID, 
  Timestamp
} from '@claude-zen/foundation';

// =============================================================================
// COORDINATION CORE INTERFACES
// =============================================================================

/**
 * Represents the unique identifier for an agent in the coordination system.
 */
export interface AgentId {
  /** Unique agent identifier */
  readonly id: string;
  /** Swarm identifier the agent belongs to */
  readonly swarmId: string;
  /** Type of agent (flexible string) */
  readonly type: string;
  /** Instance number for load balancing */
  readonly instance: number;
}

/**
 * Defines the capabilities of an agent within the coordination system.
 */
export interface AgentCapability {
  /** Name of the capability */
  readonly name: string;
  /** Version of the capability implementation */
  readonly version: string;
  /** Whether this capability is currently enabled */
  readonly enabled: boolean;
  /** Configuration specific to this capability */
  readonly config?: Record<string, unknown>;
}

/**
 * Current state and health information for an agent.
 */
export interface AgentState {
  /** Agent identifier */
  readonly agentId: AgentId;
  /** Current operational status */
  readonly status: 'active' | 'idle' | 'busy' | 'error' | 'offline';
  /** List of capabilities this agent provides */
  readonly capabilities: ReadonlyArray<AgentCapability>;
  /** Current performance metrics */
  readonly performance: PerformanceMetrics;
  /** Last heartbeat timestamp */
  readonly lastHeartbeat: Timestamp;
  /** Additional metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Performance metrics for agents and coordination activities.
 */
export interface PerformanceMetrics {
  /** CPU utilization percentage (0-100) */
  readonly cpuUsage: number;
  /** Memory utilization percentage (0-100) */
  readonly memoryUsage: number;
  /** Number of completed tasks */
  readonly completedTasks: number;
  /** Number of failed tasks */
  readonly failedTasks: number;
  /** Average response time in milliseconds */
  readonly averageResponseTime: number;
  /** Uptime in milliseconds */
  readonly uptime: number;
}

/**
 * Represents a coordination task within the system.
 */
export interface CoordinationTask {
  /** Unique task identifier */
  readonly taskId: UUID;
  /** Type of coordination task */
  readonly type: 'agent-assignment' | 'resource-allocation' | 'workflow-coordination' | 'health-check';
  /** Priority level (1-5, where 5 is highest) */
  readonly priority: number;
  /** Task payload data */
  readonly payload: EventPayload;
  /** Target agent or swarm for this task */
  readonly target?: AgentId | string;
  /** Task creation timestamp */
  readonly createdAt: Timestamp;
  /** Task deadline (optional) */
  readonly deadline?: Timestamp;
  /** Current status of the task */
  readonly status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
}

/**
 * Configuration for coordination behavior.
 */
export interface CoordinationConfig {
  /** Maximum number of concurrent tasks */
  readonly maxConcurrentTasks: number;
  /** Default task timeout in milliseconds */
  readonly defaultTaskTimeout: number;
  /** Health check interval in milliseconds */
  readonly healthCheckInterval: number;
  /** Whether to enable performance monitoring */
  readonly enablePerformanceMonitoring: boolean;
  /** Event bus configuration */
  readonly eventBusConfig: EventBusConfig;
  /** Retry configuration for failed operations */
  readonly retryConfig: {
    readonly maxAttempts: number;
    readonly backoffMs: number;
    readonly exponentialBackoff: boolean;
  };
}

// =============================================================================
// COORDINATION SERVICE INTERFACES
// =============================================================================

/**
 * Core interface for agent coordination services.
 */
export interface IAgentCoordinationService {
  /**
   * Registers an agent with the coordination system.
   * 
   * @param agentState - The initial state of the agent
   * @returns Promise resolving to success/error result
   */
  registerAgent(agentState: AgentState): Promise<Result<void, Error>>;

  /**
   * Unregisters an agent from the coordination system.
   * 
   * @param agentId - The agent to unregister
   * @returns Promise resolving to success/error result
   */
  unregisterAgent(agentId: AgentId): Promise<Result<void, Error>>;

  /**
   * Updates the state of an existing agent.
   * 
   * @param agentState - The new state of the agent
   * @returns Promise resolving to success/error result
   */
  updateAgentState(agentState: AgentState): Promise<Result<void, Error>>;

  /**
   * Retrieves the current state of an agent.
   * 
   * @param agentId - The agent to query
   * @returns Promise resolving to agent state or error
   */
  getAgentState(agentId: AgentId): Promise<Result<AgentState, Error>>;

  /**
   * Lists all registered agents with optional filtering.
   * 
   * @param filter - Optional filter criteria
   * @returns Promise resolving to agent list or error
   */
  listAgents(filter?: Partial<AgentState>): Promise<Result<ReadonlyArray<AgentState>, Error>>;
}

/**
 * Interface for task orchestration management.
 */
export interface ITaskOrchestrationManager {
  /**
   * Submits a coordination task for execution.
   * 
   * @param task - The task to execute
   * @returns Promise resolving to task result or error
   */
  submitTask(task: CoordinationTask): Promise<Result<UUID, Error>>;

  /**
   * Cancels a pending or in-progress task.
   * 
   * @param taskId - The task to cancel
   * @returns Promise resolving to success/error result
   */
  cancelTask(taskId: UUID): Promise<Result<void, Error>>;

  /**
   * Retrieves the current status of a task.
   * 
   * @param taskId - The task to query
   * @returns Promise resolving to task or error
   */
  getTaskStatus(taskId: UUID): Promise<Result<CoordinationTask, Error>>;

  /**
   * Lists all tasks with optional filtering.
   * 
   * @param filter - Optional filter criteria
   * @returns Promise resolving to task list or error
   */
  listTasks(filter?: Partial<CoordinationTask>): Promise<Result<ReadonlyArray<CoordinationTask>, Error>>;
}

/**
 * Interface for coordination event handling.
 */
export interface ICoordinationEventHandler {
  /**
   * Handles incoming coordination events.
   * 
   * @param event - The event to handle
   * @returns Promise resolving to success/error result
   */
  handleEvent(event: BaseEvent): Promise<Result<void, Error>>;

  /**
   * Starts the event handler.
   * 
   * @returns Promise resolving to success/error result
   */
  start(): Promise<Result<void, Error>>;

  /**
   * Stops the event handler.
   * 
   * @returns Promise resolving to success/error result
   */
  stop(): Promise<Result<void, Error>>;
}

// =============================================================================
// COORDINATION EVENTS
// =============================================================================

/**
 * Base interface for all coordination events.
 */
export interface CoordinationEvent extends BaseEvent {
  /** Event category */
  readonly category: 'coordination';
  /** Coordination-specific metadata */
  readonly coordinationMetadata: {
    readonly initiator: AgentId;
    readonly timestamp: Timestamp;
    readonly correlationId: UUID;
  };
}

/**
 * Event emitted when an agent joins the coordination system.
 */
export interface AgentRegisteredEvent extends CoordinationEvent {
  readonly type: 'coordination:agent-registered';
  readonly payload: {
    readonly agentState: AgentState;
  };
}

/**
 * Event emitted when an agent leaves the coordination system.
 */
export interface AgentUnregisteredEvent extends CoordinationEvent {
  readonly type: 'coordination:agent-unregistered';
  readonly payload: {
    readonly agentId: AgentId;
    readonly reason: string;
  };
}

/**
 * Event emitted when a coordination task is submitted.
 */
export interface TaskSubmittedEvent extends CoordinationEvent {
  readonly type: 'coordination:task-submitted';
  readonly payload: {
    readonly task: CoordinationTask;
  };
}

/**
 * Event emitted when a coordination task is completed.
 */
export interface TaskCompletedEvent extends CoordinationEvent {
  readonly type: 'coordination:task-completed';
  readonly payload: {
    readonly taskId: UUID;
    readonly result: EventPayload;
    readonly executionTime: number;
  };
}

/**
 * Event emitted when a coordination task fails.
 */
export interface TaskFailedEvent extends CoordinationEvent {
  readonly type: 'coordination:task-failed';
  readonly payload: {
    readonly taskId: UUID;
    readonly error: string;
    readonly retryable: boolean;
  };
}

// =============================================================================
// TYPE UNIONS AND UTILITIES
// =============================================================================

/**
 * Union type of all coordination event types.
 */
export type CoordinationEventTypes = 
  | AgentRegisteredEvent
  | AgentUnregisteredEvent
  | TaskSubmittedEvent
  | TaskCompletedEvent
  | TaskFailedEvent;

/**
 * Utility type for extracting event payload types.
 */
export type CoordinationEventPayload<T extends CoordinationEventTypes> = T['payload'];

/**
 * Configuration validator for coordination setup.
 */
export interface ICoordinationConfigValidator {
  /**
   * Validates coordination configuration.
   * 
   * @param config - Configuration to validate
   * @returns Result indicating validation success or error
   */
  validateConfig(config: CoordinationConfig): Result<CoordinationConfig, Error>;
}