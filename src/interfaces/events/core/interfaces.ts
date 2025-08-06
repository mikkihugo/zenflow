/**
 * UEL (Unified Event Layer) Core Interfaces
 * 
 * Provides unified abstractions for all event management implementations:
 * - System, Coordination, Communication, Monitoring, and UI events
 * - Consistent subscription, emission, and filtering patterns
 * - Factory pattern for event manager creation and management
 * - Health checks and performance monitoring
 */

import { EventEmitter } from 'node:events';

/**
 * Event priority levels for processing order
 */
export type EventPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Event processing strategies
 */
export type EventProcessingStrategy = 'immediate' | 'queued' | 'batched' | 'throttled';

/**
 * Event filtering criteria for selective event processing
 * 
 * @interface EventFilter
 * @example
 * ```typescript
 * const filter: EventFilter = {
 *   types: ['system:lifecycle', 'coordination:swarm'],
 *   sources: ['agent-manager', 'swarm-coordinator'],
 *   priorities: ['critical', 'high'],
 *   metadata: { component: 'core' },
 *   customFilter: (event) => event.timestamp > new Date('2024-01-01')
 * };
 * ```
 */
export interface EventFilter {
  /** Array of event types to include in filtering */
  types?: string[];
  /** Array of event sources to include in filtering */
  sources?: string[];
  /** Array of event priorities to include in filtering */
  priorities?: EventPriority[];
  /** Key-value pairs for metadata-based filtering */
  metadata?: Record<string, any>;
  /** Custom filtering function for advanced criteria */
  customFilter?: (event: SystemEvent) => boolean;
}

/**
 * Event transformation configuration for event processing pipeline
 * 
 * @interface EventTransform
 * @example
 * ```typescript
 * const transform: EventTransform = {
 *   mapper: (event) => ({ ...event, processedAt: new Date() }),
 *   enricher: async (event) => ({ 
 *     ...event, 
 *     metadata: { ...event.metadata, enriched: true } 
 *   }),
 *   validator: (event) => event.type.startsWith('system:')
 * };
 * ```
 */
export interface EventTransform {
  /** Synchronous event transformation function */
  mapper?: (event: SystemEvent) => SystemEvent;
  /** Asynchronous event enrichment function */
  enricher?: (event: SystemEvent) => Promise<SystemEvent>;
  /** Event validation function returning true for valid events */
  validator?: (event: SystemEvent) => boolean;
}

/**
 * Event manager retry configuration for handling failed operations
 * 
 * @interface EventRetryConfig
 * @example
 * ```typescript
 * const retryConfig: EventRetryConfig = {
 *   attempts: 3,
 *   delay: 1000,
 *   backoff: 'exponential',
 *   maxDelay: 10000,
 *   retryCondition: (error, event) => {
 *     return error.code !== 'VALIDATION_ERROR' && event.priority !== 'low';
 *   }
 * };
 * ```
 */
export interface EventRetryConfig {
  /** Maximum number of retry attempts */
  attempts: number;
  /** Initial delay between retries in milliseconds */
  delay: number;
  /** Backoff strategy for increasing delay between retries */
  backoff: 'linear' | 'exponential' | 'fixed';
  /** Maximum delay between retries in milliseconds */
  maxDelay?: number;
  /** Function to determine if an error/event combination should be retried */
  retryCondition?: (error: any, event: SystemEvent) => boolean;
}

/**
 * Event manager health configuration
 */
export interface EventHealthConfig {
  checkInterval: number; // ms
  timeout: number; // ms
  failureThreshold: number;
  successThreshold: number;
  enableAutoRecovery: boolean;
}

/**
 * Event manager monitoring configuration
 */
export interface EventMonitoringConfig {
  enabled: boolean;
  metricsInterval: number; // ms
  trackLatency: boolean;
  trackThroughput: boolean;
  trackErrors: boolean;
  enableProfiling: boolean;
}

/**
 * Base event manager configuration
 */
export interface EventManagerConfig {
  name: string;
  type: EventManagerType;
  maxListeners?: number;
  processing: {
    strategy: EventProcessingStrategy;
    batchSize?: number;
    throttleMs?: number;
    queueSize?: number;
  };
  retry?: EventRetryConfig;
  health?: EventHealthConfig;
  monitoring?: EventMonitoringConfig;
  filters?: EventFilter[];
  transforms?: EventTransform[];
  metadata?: Record<string, any>;
}

/**
 * Base system event interface that all UEL events must implement
 * 
 * @interface SystemEvent
 * @example
 * ```typescript
 * const systemEvent: SystemEvent = {
 *   id: 'evt_12345',
 *   timestamp: new Date(),
 *   source: 'event-manager',
 *   type: 'system:lifecycle',
 *   priority: 'high',
 *   metadata: { component: 'core', version: '1.0.0' },
 *   correlationId: 'corr_67890',
 *   parentEventId: 'evt_11111',
 *   sequence: 1
 * };
 * ```
 */
export interface SystemEvent {
  /** Unique identifier for the event */
  id: string;
  /** Timestamp when the event was created */
  timestamp: Date;
  /** Source system or component that generated the event */
  source: string;
  /** Event type following domain:action pattern */
  type: string;
  /** Processing priority of the event */
  priority?: EventPriority;
  /** Additional metadata associated with the event */
  metadata?: Record<string, any>;
  /** Correlation ID for tracking related events */
  correlationId?: string;
  /** ID of parent event if this is a child event */
  parentEventId?: string;
  /** Sequence number for ordered events */
  sequence?: number;
}

/**
 * Event listener function signature for handling events
 * 
 * @template T - Event type extending SystemEvent
 * @param event - The event to handle
 * @returns void or Promise<void> for async handlers
 * 
 * @example
 * ```typescript
 * // Synchronous listener
 * const syncListener: EventListener = (event) => {
 *   console.log('Received event:', event.type);
 * };
 * 
 * // Asynchronous listener
 * const asyncListener: EventListener = async (event) => {
 *   await processEvent(event);
 *   console.log('Processed event:', event.id);
 * };
 * ```
 */
export type EventListener<T extends SystemEvent = SystemEvent> = (event: T) => void | Promise<void>;

/**
 * Event subscription configuration for managing event listeners
 * 
 * @template T - Event type extending SystemEvent
 * @interface EventSubscription
 * @example
 * ```typescript
 * const subscription: EventSubscription = {
 *   id: 'sub_12345',
 *   eventTypes: ['system:lifecycle', 'coordination:swarm'],
 *   listener: async (event) => console.log('Handling:', event.type),
 *   filter: { priorities: ['critical', 'high'] },
 *   transform: { mapper: (e) => ({ ...e, handled: true }) },
 *   priority: 'high',
 *   created: new Date(),
 *   active: true,
 *   metadata: { component: 'event-processor' }
 * };
 * ```
 */
export interface EventSubscription<T extends SystemEvent = SystemEvent> {
  /** Unique identifier for the subscription */
  id: string;
  /** Array of event types this subscription handles */
  eventTypes: string[];
  /** Event listener function to invoke */
  listener: EventListener<T>;
  /** Optional filter to apply before invoking listener */
  filter?: EventFilter;
  /** Optional transformation to apply to events */
  transform?: EventTransform;
  /** Priority of this subscription for ordering */
  priority: EventPriority;
  /** Timestamp when subscription was created */
  created: Date;
  /** Whether this subscription is currently active */
  active: boolean;
  /** Additional metadata for the subscription */
  metadata?: Record<string, any>;
}

/**
 * Event manager status information
 */
export interface EventManagerStatus {
  name: string;
  type: EventManagerType;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'stopped';
  lastCheck: Date;
  subscriptions: number;
  queueSize: number;
  errorRate: number;
  uptime: number;
  metadata?: Record<string, any>;
}

/**
 * Event manager performance metrics
 */
export interface EventManagerMetrics {
  name: string;
  type: EventManagerType;
  eventsProcessed: number;
  eventsEmitted: number;
  eventsFailed: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number; // events per second
  subscriptionCount: number;
  queueSize: number;
  memoryUsage: number;
  timestamp: Date;
}

/**
 * Event batch for bulk operations
 */
export interface EventBatch<T extends SystemEvent = SystemEvent> {
  id: string;
  events: T[];
  size: number;
  created: Date;
  metadata?: Record<string, any>;
}

/**
 * Event emission options
 */
export interface EventEmissionOptions {
  priority?: EventPriority;
  timeout?: number;
  retries?: number;
  correlationId?: string;
  parentEventId?: string;
  metadata?: Record<string, any>;
}

/**
 * Event query options for filtering and retrieval
 */
export interface EventQueryOptions {
  filter?: EventFilter;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'priority' | 'type' | 'source';
  sortOrder?: 'asc' | 'desc';
  includeMetadata?: boolean;
}

/**
 * Core event manager interface that all event managers must implement
 * 
 * @interface IEventManager
 * @example
 * ```typescript
 * class MyEventManager implements IEventManager {
 *   async start(): Promise<void> {
 *     // Initialize event processing
 *   }
 * 
 *   async emit<T extends SystemEvent>(event: T): Promise<void> {
 *     // Process and emit event to subscribers
 *   }
 * 
 *   subscribe<T extends SystemEvent>(
 *     eventTypes: string[],
 *     listener: EventListener<T>
 *   ): string {
 *     // Register event listener and return subscription ID
 *     return 'sub_12345';
 *   }
 * }
 * ```
 */
export interface IEventManager {
  // Configuration
  /** Read-only configuration for this event manager */
  readonly config: EventManagerConfig;
  /** Read-only name identifier for this event manager */
  readonly name: string;
  /** Read-only type of this event manager */
  readonly type: EventManagerType;
  
  // Lifecycle management
  /** 
   * Start the event manager and begin processing events
   * @throws {Error} If manager fails to start
   */
  start(): Promise<void>;
  
  /** 
   * Stop the event manager and cease processing events
   * @throws {Error} If manager fails to stop gracefully
   */
  stop(): Promise<void>;
  
  /** 
   * Restart the event manager (stop then start)
   * @throws {Error} If restart sequence fails
   */
  restart(): Promise<void>;
  
  /** 
   * Check if the event manager is currently running
   * @returns True if manager is actively processing events
   */
  isRunning(): boolean;
  
  // Event emission
  /** 
   * Emit an event to all matching subscribers
   * @template T - Event type extending SystemEvent
   * @param event - The event to emit
   * @param options - Optional emission configuration
   * @throws {EventEmissionError} If event emission fails
   */
  emit<T extends SystemEvent>(event: T, options?: EventEmissionOptions): Promise<void>;
  
  /** 
   * Emit a batch of events efficiently
   * @template T - Event type extending SystemEvent
   * @param batch - Batch of events to emit
   * @param options - Optional emission configuration
   * @throws {EventEmissionError} If batch emission fails
   */
  emitBatch<T extends SystemEvent>(batch: EventBatch<T>, options?: EventEmissionOptions): Promise<void>;
  
  /** 
   * Emit an event with immediate processing (bypassing queues)
   * @template T - Event type extending SystemEvent
   * @param event - The event to emit immediately
   * @throws {EventEmissionError} If immediate emission fails
   */
  emitImmediate<T extends SystemEvent>(event: T): Promise<void>;
  
  // Event subscription
  /** 
   * Subscribe to one or more event types
   * @template T - Event type extending SystemEvent
   * @param eventTypes - Single event type or array of event types
   * @param listener - Function to handle matching events
   * @param options - Optional subscription configuration
   * @returns Unique subscription ID for later unsubscription
   * @throws {EventSubscriptionError} If subscription fails
   */
  subscribe<T extends SystemEvent>(
    eventTypes: string | string[],
    listener: EventListener<T>,
    options?: Partial<EventSubscription<T>>
  ): string;
  
  /** 
   * Unsubscribe from events using subscription ID
   * @param subscriptionId - ID returned from subscribe()
   * @returns True if subscription was found and removed
   */
  unsubscribe(subscriptionId: string): boolean;
  
  /** 
   * Unsubscribe all listeners for an event type or all listeners
   * @param eventType - Optional event type to filter removals
   * @returns Number of subscriptions that were removed
   */
  unsubscribeAll(eventType?: string): number;
  
  // Event filtering and transformation
  /** 
   * Add a global event filter
   * @param filter - Filter configuration
   * @returns Unique filter ID for later removal
   * @throws {EventFilterError} If filter is invalid
   */
  addFilter(filter: EventFilter): string;
  
  /** 
   * Remove a previously added filter
   * @param filterId - ID returned from addFilter()
   * @returns True if filter was found and removed
   */
  removeFilter(filterId: string): boolean;
  
  /** 
   * Add a global event transformation
   * @param transform - Transform configuration
   * @returns Unique transform ID for later removal
   */
  addTransform(transform: EventTransform): string;
  
  /** 
   * Remove a previously added transformation
   * @param transformId - ID returned from addTransform()
   * @returns True if transform was found and removed
   */
  removeTransform(transformId: string): boolean;
  
  // Event querying and history
  /** 
   * Query historical events with filtering and pagination
   * @template T - Event type extending SystemEvent
   * @param options - Query configuration including filters and limits
   * @returns Array of events matching the query
   * @throws {Error} If query execution fails
   */
  query<T extends SystemEvent>(options: EventQueryOptions): Promise<T[]>;
  
  /** 
   * Get event history for a specific event type
   * @param eventType - The event type to retrieve history for
   * @param limit - Optional maximum number of events to return
   * @returns Array of historical events in chronological order
   */
  getEventHistory(eventType: string, limit?: number): Promise<SystemEvent[]>;
  
  // Health monitoring
  /** 
   * Perform a health check on the event manager
   * @returns Current health status including metrics
   * @throws {Error} If health check fails
   */
  healthCheck(): Promise<EventManagerStatus>;
  
  /** 
   * Get current performance metrics
   * @returns Detailed performance and usage metrics
   */
  getMetrics(): Promise<EventManagerMetrics>;
  
  /** 
   * Get all active subscriptions
   * @returns Array of current event subscriptions
   */
  getSubscriptions(): EventSubscription[];
  
  // Configuration updates
  /** 
   * Update event manager configuration dynamically
   * @param config - Partial configuration to merge with current settings
   * @throws {Error} If configuration update fails
   */
  updateConfig(config: Partial<EventManagerConfig>): void;
  
  // Event handlers (EventEmitter compatibility)
  /** 
   * Add listener for manager lifecycle events
   * @param event - Lifecycle event name
   * @param handler - Function to handle the lifecycle event
   */
  on(event: 'start' | 'stop' | 'error' | 'subscription' | 'emission', handler: (...args: any[]) => void): void;
  
  /** 
   * Remove listener for manager events
   * @param event - Event name to remove listeners from
   * @param handler - Optional specific handler to remove
   */
  off(event: string, handler?: (...args: any[]) => void): void;
  
  /** 
   * Add one-time listener for manager events
   * @param event - Event name to listen for once
   * @param handler - Function to handle the event
   */
  once(event: string, handler: (...args: any[]) => void): void;
  
  // Cleanup
  /** 
   * Destroy the event manager and cleanup all resources
   * @throws {Error} If cleanup fails
   */
  destroy(): Promise<void>;
}

/**
 * Event manager factory interface for creating and managing event managers
 * 
 * @template TConfig - Configuration type extending EventManagerConfig
 * @interface IEventManagerFactory
 * @example
 * ```typescript
 * class SystemEventManagerFactory implements IEventManagerFactory {
 *   async create(config: EventManagerConfig): Promise<IEventManager> {
 *     return new SystemEventManager(config);
 *   }
 * 
 *   async createMultiple(configs: EventManagerConfig[]): Promise<IEventManager[]> {
 *     return Promise.all(configs.map(config => this.create(config)));
 *   }
 * }
 * ```
 */
export interface IEventManagerFactory<TConfig extends EventManagerConfig = EventManagerConfig> {
  // Event manager creation
  /** 
   * Create a new event manager instance
   * @param config - Configuration for the event manager
   * @returns Promise resolving to the created event manager
   * @throws {Error} If manager creation fails
   */
  create(config: TConfig): Promise<IEventManager>;
  
  /** 
   * Create multiple event managers in batch
   * @param configs - Array of configurations for event managers
   * @returns Promise resolving to array of created event managers
   * @throws {Error} If any manager creation fails
   */
  createMultiple(configs: TConfig[]): Promise<IEventManager[]>;
  
  // Event manager management
  /** 
   * Get an event manager by name
   * @param name - Name of the event manager
   * @returns Event manager instance or undefined if not found
   */
  get(name: string): IEventManager | undefined;
  
  /** 
   * List all event managers managed by this factory
   * @returns Array of all event manager instances
   */
  list(): IEventManager[];
  
  /** 
   * Check if an event manager exists
   * @param name - Name of the event manager
   * @returns True if manager exists
   */
  has(name: string): boolean;
  
  /** 
   * Remove and destroy an event manager
   * @param name - Name of the event manager to remove
   * @returns Promise resolving to true if manager was found and removed
   * @throws {Error} If removal fails
   */
  remove(name: string): Promise<boolean>;
  
  // Batch operations
  /** 
   * Perform health check on all managed event managers
   * @returns Promise resolving to map of manager names to health status
   */
  healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
  
  /** 
   * Get metrics for all managed event managers
   * @returns Promise resolving to map of manager names to metrics
   */
  getMetricsAll(): Promise<Map<string, EventManagerMetrics>>;
  
  /** 
   * Start all managed event managers
   * @throws {Error} If any manager fails to start
   */
  startAll(): Promise<void>;
  
  /** 
   * Stop all managed event managers
   * @throws {Error} If any manager fails to stop
   */
  stopAll(): Promise<void>;
  
  // Factory management
  /** 
   * Shutdown the factory and all managed event managers
   * @throws {Error} If shutdown fails
   */
  shutdown(): Promise<void>;
  
  /** 
   * Get count of active event managers
   * @returns Number of currently active managers
   */
  getActiveCount(): number;
  
  /** 
   * Get factory performance metrics
   * @returns Factory metrics including manager counts and uptime
   */
  getFactoryMetrics(): {
    totalManagers: number;
    runningManagers: number;
    errorCount: number;
    uptime: number;
  };
}

/**
 * Event manager registry for global event manager management across all types
 * 
 * @interface IEventManagerRegistry
 * @example
 * ```typescript
 * // Register factories for different event manager types
 * registry.registerFactory(EventManagerTypes.SYSTEM, systemFactory);
 * registry.registerFactory(EventManagerTypes.COORDINATION, coordFactory);
 * 
 * // Broadcast event to all managers
 * await registry.broadcast({
 *   id: 'global-shutdown',
 *   timestamp: new Date(),
 *   source: 'system',
 *   type: 'system:shutdown'
 * });
 * 
 * // Get metrics across all managers
 * const metrics = await registry.getGlobalMetrics();
 * ```
 */
export interface IEventManagerRegistry {
  // Factory registration
  /** 
   * Register an event manager factory for a specific type
   * @template T - Configuration type extending EventManagerConfig
   * @param type - Event manager type to register factory for
   * @param factory - Factory instance to register
   * @throws {Error} If factory registration fails
   */
  registerFactory<T extends EventManagerConfig>(type: EventManagerType, factory: IEventManagerFactory<T>): void;
  
  /** 
   * Get a registered factory by type
   * @template T - Configuration type extending EventManagerConfig
   * @param type - Event manager type to get factory for
   * @returns Factory instance or undefined if not registered
   */
  getFactory<T extends EventManagerConfig>(type: EventManagerType): IEventManagerFactory<T> | undefined;
  
  /** 
   * List all registered factory types
   * @returns Array of event manager types with registered factories
   */
  listFactoryTypes(): EventManagerType[];
  
  // Event manager management across all factories
  /** 
   * Get all event managers from all registered factories
   * @returns Map of manager names to event manager instances
   */
  getAllEventManagers(): Map<string, IEventManager>;
  
  /** 
   * Find a specific event manager by name across all factories
   * @param name - Name of the event manager to find
   * @returns Event manager instance or undefined if not found
   */
  findEventManager(name: string): IEventManager | undefined;
  
  /** 
   * Get all event managers of a specific type
   * @param type - Event manager type to filter by
   * @returns Array of event managers of the specified type
   */
  getEventManagersByType(type: EventManagerType): IEventManager[];
  
  // Global operations
  /** 
   * Perform health check on all registered event managers
   * @returns Promise resolving to map of manager names to health status
   */
  healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
  
  /** 
   * Get aggregated metrics from all event managers
   * @returns Promise resolving to global metrics summary
   */
  getGlobalMetrics(): Promise<{
    totalManagers: number;
    totalEvents: number;
    totalSubscriptions: number;
    averageLatency: number;
    errorRate: number;
  }>;
  
  /** 
   * Shutdown all event managers across all factories
   * @throws {Error} If shutdown of any manager fails
   */
  shutdownAll(): Promise<void>;
  
  // Event broadcasting across all managers
  /** 
   * Broadcast an event to all registered event managers
   * @template T - Event type extending SystemEvent
   * @param event - Event to broadcast
   * @throws {EventEmissionError} If broadcast fails
   */
  broadcast<T extends SystemEvent>(event: T): Promise<void>;
  
  /** 
   * Broadcast an event to all event managers of a specific type
   * @template T - Event type extending SystemEvent
   * @param type - Event manager type to broadcast to
   * @param event - Event to broadcast
   * @throws {EventEmissionError} If broadcast fails
   */
  broadcastToType<T extends SystemEvent>(type: EventManagerType, event: T): Promise<void>;
}

/**
 * Event manager types for different categories
 */
export type EventManagerType = 
  | 'system'       // Core system lifecycle events
  | 'coordination' // Swarm coordination and agent management
  | 'communication'// WebSocket, MCP, protocol communication
  | 'monitoring'   // Metrics, health checks, performance
  | 'interface'    // CLI, web, terminal interface events
  | 'neural'       // Neural network and AI operations
  | 'database'     // Database operations and queries
  | 'memory'       // Memory operations and caching
  | 'workflow'     // Workflow execution and orchestration
  | 'custom';      // Custom event types

/**
 * Event manager type mappings for convenience
 */
export const EventManagerTypes = {
  SYSTEM: 'system' as const,
  COORDINATION: 'coordination' as const,
  COMMUNICATION: 'communication' as const,
  MONITORING: 'monitoring' as const,
  INTERFACE: 'interface' as const,
  NEURAL: 'neural' as const,
  DATABASE: 'database' as const,
  MEMORY: 'memory' as const,
  WORKFLOW: 'workflow' as const,
  CUSTOM: 'custom' as const
} as const;

/**
 * Base error class for all UEL event-related operations
 * 
 * @class EventError
 * @extends Error
 * @example
 * ```typescript
 * throw new EventError(
 *   'Failed to process event',
 *   'PROCESSING_ERROR',
 *   'system-manager',
 *   'evt_12345',
 *   originalError
 * );
 * ```
 */
export class EventError extends Error {
  /**
   * Create a new EventError
   * @param message - Human-readable error message
   * @param code - Machine-readable error code
   * @param manager - Name of the event manager where error occurred
   * @param eventId - Optional ID of the event that caused the error
   * @param cause - Optional underlying error that caused this error
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly manager: string,
    public readonly eventId?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'EventError';
  }
}

/**
 * Error thrown when event subscription operations fail
 * 
 * @class EventSubscriptionError
 * @extends EventError
 * @example
 * ```typescript
 * throw new EventSubscriptionError('system-manager', 'sub_12345', originalError);
 * ```
 */
export class EventSubscriptionError extends EventError {
  /**
   * Create a new EventSubscriptionError
   * @param manager - Name of the event manager where subscription failed
   * @param subscriptionId - ID of the subscription that failed
   * @param cause - Optional underlying error that caused the failure
   */
  constructor(manager: string, subscriptionId: string, cause?: Error) {
    super(`Event subscription failed for manager: ${manager}`, 'SUBSCRIPTION_ERROR', manager, subscriptionId, cause);
    this.name = 'EventSubscriptionError';
  }
}

export class EventEmissionError extends EventError {
  constructor(manager: string, eventId: string, cause?: Error) {
    super(`Event emission failed for manager: ${manager}`, 'EMISSION_ERROR', manager, eventId, cause);
    this.name = 'EventEmissionError';
  }
}

export class EventFilterError extends EventError {
  constructor(manager: string, filterId: string, cause?: Error) {
    super(`Event filter error for manager: ${manager}`, 'FILTER_ERROR', manager, filterId, cause);
    this.name = 'EventFilterError';
  }
}

export class EventTimeoutError extends EventError {
  constructor(manager: string, timeout: number, eventId?: string, cause?: Error) {
    super(`Event timeout (${timeout}ms) for manager: ${manager}`, 'TIMEOUT_ERROR', manager, eventId, cause);
    this.name = 'EventTimeoutError';
  }
}

export class EventRetryExhaustedError extends EventError {
  constructor(manager: string, attempts: number, eventId?: string, cause?: Error) {
    super(`Event retry exhausted (${attempts} attempts) for manager: ${manager}`, 'RETRY_EXHAUSTED', manager, eventId, cause);
    this.name = 'EventRetryExhaustedError';
  }
}

/**
 * Event manager configuration presets for common scenarios
 */
export const EventManagerPresets = {
  REAL_TIME: {
    processing: {
      strategy: 'immediate' as EventProcessingStrategy,
      queueSize: 1000
    },
    monitoring: {
      enabled: true,
      metricsInterval: 1000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false
    }
  },
  BATCH_PROCESSING: {
    processing: {
      strategy: 'batched' as EventProcessingStrategy,
      batchSize: 100,
      queueSize: 10000
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: false,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false
    }
  },
  HIGH_THROUGHPUT: {
    processing: {
      strategy: 'queued' as EventProcessingStrategy,
      queueSize: 50000
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: false,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: true
    }
  },
  RELIABLE: {
    processing: {
      strategy: 'queued' as EventProcessingStrategy,
      queueSize: 5000
    },
    retry: {
      attempts: 5,
      delay: 1000,
      backoff: 'exponential' as const,
      maxDelay: 10000
    },
    health: {
      checkInterval: 5000,
      timeout: 3000,
      failureThreshold: 3,
      successThreshold: 2,
      enableAutoRecovery: true
    },
    monitoring: {
      enabled: true,
      metricsInterval: 5000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false
    }
  }
} as const;

/**
 * Type guards for runtime type checking of UEL interfaces and values
 * 
 * @namespace EventTypeGuards
 * @example
 * ```typescript
 * // Validate event manager type
 * if (EventTypeGuards.isEventManagerType(userInput)) {
 *   // userInput is now typed as EventManagerType
 *   const manager = createManager(userInput);
 * }
 * 
 * // Validate system event
 * if (EventTypeGuards.isSystemEvent(data)) {
 *   // data is now typed as SystemEvent
 *   await eventManager.emit(data);
 * }
 * ```
 */
export const EventTypeGuards = {
  /**
   * Check if a value is a valid EventManagerType
   * @param value - Value to check
   * @returns True if value is a valid EventManagerType
   */
  isEventManagerType: (value: any): value is EventManagerType => {
    return Object.values(EventManagerTypes).includes(value);
  },
  
  /**
   * Check if a value is a valid EventPriority
   * @param value - Value to check
   * @returns True if value is a valid EventPriority
   */
  isEventPriority: (value: any): value is EventPriority => {
    return ['critical', 'high', 'medium', 'low'].includes(value);
  },
  
  /**
   * Check if a value is a valid EventProcessingStrategy
   * @param value - Value to check
   * @returns True if value is a valid EventProcessingStrategy
   */
  isEventProcessingStrategy: (value: any): value is EventProcessingStrategy => {
    return ['immediate', 'queued', 'batched', 'throttled'].includes(value);
  },
  
  /**
   * Check if a value is a valid SystemEvent
   * @param value - Value to check
   * @returns True if value has all required SystemEvent properties
   */
  isSystemEvent: (value: any): value is SystemEvent => {
    return value && 
           typeof value.id === 'string' &&
           value.timestamp instanceof Date &&
           typeof value.source === 'string' &&
           typeof value.type === 'string';
  },
  
  /**
   * Check if a value is a valid EventManagerConfig
   * @param value - Value to check
   * @returns True if value has all required EventManagerConfig properties
   */
  isEventManagerConfig: (value: any): value is EventManagerConfig => {
    return value &&
           typeof value.name === 'string' &&
           EventTypeGuards.isEventManagerType(value.type) &&
           value.processing &&
           EventTypeGuards.isEventProcessingStrategy(value.processing.strategy);
  }
} as const;

// Re-export types for compatibility
export type { SystemEvent as BaseSystemEvent } from '../observer-system';