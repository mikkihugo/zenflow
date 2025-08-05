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
 * Event filtering criteria
 */
export interface EventFilter {
  types?: string[];
  sources?: string[];
  priorities?: EventPriority[];
  metadata?: Record<string, any>;
  customFilter?: (event: SystemEvent) => boolean;
}

/**
 * Event transformation configuration
 */
export interface EventTransform {
  mapper?: (event: SystemEvent) => SystemEvent;
  enricher?: (event: SystemEvent) => Promise<SystemEvent>;
  validator?: (event: SystemEvent) => boolean;
}

/**
 * Event manager retry configuration
 */
export interface EventRetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay?: number;
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
 * Base system event interface
 */
export interface SystemEvent {
  id: string;
  timestamp: Date;
  source: string;
  type: string;
  priority?: EventPriority;
  metadata?: Record<string, any>;
  correlationId?: string;
  parentEventId?: string;
  sequence?: number;
}

/**
 * Event listener function signature
 */
export type EventListener<T extends SystemEvent = SystemEvent> = (event: T) => void | Promise<void>;

/**
 * Event subscription configuration
 */
export interface EventSubscription<T extends SystemEvent = SystemEvent> {
  id: string;
  eventTypes: string[];
  listener: EventListener<T>;
  filter?: EventFilter;
  transform?: EventTransform;
  priority: EventPriority;
  created: Date;
  active: boolean;
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
 */
export interface IEventManager {
  // Configuration
  readonly config: EventManagerConfig;
  readonly name: string;
  readonly type: EventManagerType;
  
  // Lifecycle management
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  isRunning(): boolean;
  
  // Event emission
  emit<T extends SystemEvent>(event: T, options?: EventEmissionOptions): Promise<void>;
  emitBatch<T extends SystemEvent>(batch: EventBatch<T>, options?: EventEmissionOptions): Promise<void>;
  emitImmediate<T extends SystemEvent>(event: T): Promise<void>;
  
  // Event subscription
  subscribe<T extends SystemEvent>(
    eventTypes: string | string[],
    listener: EventListener<T>,
    options?: Partial<EventSubscription<T>>
  ): string; // Returns subscription ID
  
  unsubscribe(subscriptionId: string): boolean;
  unsubscribeAll(eventType?: string): number; // Returns count of removed subscriptions
  
  // Event filtering and transformation
  addFilter(filter: EventFilter): string; // Returns filter ID
  removeFilter(filterId: string): boolean;
  addTransform(transform: EventTransform): string; // Returns transform ID
  removeTransform(transformId: string): boolean;
  
  // Event querying and history
  query<T extends SystemEvent>(options: EventQueryOptions): Promise<T[]>;
  getEventHistory(eventType: string, limit?: number): Promise<SystemEvent[]>;
  
  // Health monitoring
  healthCheck(): Promise<EventManagerStatus>;
  getMetrics(): Promise<EventManagerMetrics>;
  getSubscriptions(): EventSubscription[];
  
  // Configuration updates
  updateConfig(config: Partial<EventManagerConfig>): void;
  
  // Event handlers (EventEmitter compatibility)
  on(event: 'start' | 'stop' | 'error' | 'subscription' | 'emission', handler: (...args: any[]) => void): void;
  off(event: string, handler?: (...args: any[]) => void): void;
  once(event: string, handler: (...args: any[]) => void): void;
  
  // Cleanup
  destroy(): Promise<void>;
}

/**
 * Event manager factory interface for creating and managing event managers
 */
export interface IEventManagerFactory<TConfig extends EventManagerConfig = EventManagerConfig> {
  // Event manager creation
  create(config: TConfig): Promise<IEventManager>;
  createMultiple(configs: TConfig[]): Promise<IEventManager[]>;
  
  // Event manager management
  get(name: string): IEventManager | undefined;
  list(): IEventManager[];
  has(name: string): boolean;
  remove(name: string): Promise<boolean>;
  
  // Batch operations
  healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
  getMetricsAll(): Promise<Map<string, EventManagerMetrics>>;
  startAll(): Promise<void>;
  stopAll(): Promise<void>;
  
  // Factory management
  shutdown(): Promise<void>;
  getActiveCount(): number;
  getFactoryMetrics(): {
    totalManagers: number;
    runningManagers: number;
    errorCount: number;
    uptime: number;
  };
}

/**
 * Event manager registry for global event manager management
 */
export interface IEventManagerRegistry {
  // Factory registration
  registerFactory<T extends EventManagerConfig>(type: EventManagerType, factory: IEventManagerFactory<T>): void;
  getFactory<T extends EventManagerConfig>(type: EventManagerType): IEventManagerFactory<T> | undefined;
  listFactoryTypes(): EventManagerType[];
  
  // Event manager management across all factories
  getAllEventManagers(): Map<string, IEventManager>;
  findEventManager(name: string): IEventManager | undefined;
  getEventManagersByType(type: EventManagerType): IEventManager[];
  
  // Global operations
  healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
  getGlobalMetrics(): Promise<{
    totalManagers: number;
    totalEvents: number;
    totalSubscriptions: number;
    averageLatency: number;
    errorRate: number;
  }>;
  shutdownAll(): Promise<void>;
  
  // Event broadcasting across all managers
  broadcast<T extends SystemEvent>(event: T): Promise<void>;
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
 * Error types for event operations
 */
export class EventError extends Error {
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

export class EventSubscriptionError extends EventError {
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
 * Type guards for runtime type checking
 */
export const EventTypeGuards = {
  isEventManagerType: (value: any): value is EventManagerType => {
    return Object.values(EventManagerTypes).includes(value);
  },
  
  isEventPriority: (value: any): value is EventPriority => {
    return ['critical', 'high', 'medium', 'low'].includes(value);
  },
  
  isEventProcessingStrategy: (value: any): value is EventProcessingStrategy => {
    return ['immediate', 'queued', 'batched', 'throttled'].includes(value);
  },
  
  isSystemEvent: (value: any): value is SystemEvent => {
    return value && 
           typeof value.id === 'string' &&
           value.timestamp instanceof Date &&
           typeof value.source === 'string' &&
           typeof value.type === 'string';
  },
  
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