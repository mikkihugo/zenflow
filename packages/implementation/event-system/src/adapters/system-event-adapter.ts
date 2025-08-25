import { EventEmitter } from '@claude-zen/foundation';
/**
 * @file UEL System Event Adapter.
 *
 * Unified Event Layer adapter for system-level events, providing
 * a consistent interface to scattered EventEmitter patterns across the core system
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified system-level functionality.
 *
 * This adapter follows the exact same patterns as the USL service adapters,
 * implementing the EventManager interface and providing unified configuration
 * management for system events across Claude-Zen.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
// Import logger (using relative path)
import { getLogger } from '@claude-zen/foundation';
// Import types (will be set as any for now to fix type resolution issues)
// import type { ApplicationCoordinator } from '../core/application-coordinator';
// import type { CoreSystem } from '../core/core-system';
import type {
  EventBatch,
  EventEmissionOptions,
  EventFilter,
  EventListener,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManagerType,
  EventQueryOptions,
  EventSubscription,
  EventTransform,
  EventManager,
  SystemEvent,
} from '../core/interfaces';
import {
  EventEmissionError,
  EventManagerTypes,
  EventTimeoutError,
} from '../core/interfaces';
import type { SystemLifecycleEvent } from '../types';
import { EventPriorityMap } from '../types';

/**
 * System event adapter configuration extending UEL EventManagerConfig.
 *
 * @example
 */
export interface SystemEventAdapterConfig extends EventManagerConfig {
  /** Core system integration settings */
  coreSystem?: {
    enabled: boolean;
    wrapLifecycleEvents?: boolean;
    wrapHealthEvents?: boolean;
    wrapConfigEvents?: boolean;
  };

  /** Application coordinator integration settings */
  applicationCoordinator?: {
    enabled: boolean;
    wrapComponentEvents?: boolean;
    wrapStatusEvents?: boolean;
    wrapWorkspaceEvents?: boolean;
  };

  /** Process management integration settings */
  processManagement?: {
    enabled: boolean;
    wrapServiceEvents?: boolean;
    wrapDaemonEvents?: boolean;
    wrapResourceEvents?: boolean;
  };

  /** Error recovery integration settings */
  errorRecovery?: {
    enabled: boolean;
    wrapRecoveryEvents?: boolean;
    wrapStrategyEvents?: boolean;
    correlateErrors?: boolean;
  };

  /** Performance optimization settings */
  performance?: {
    enableEventCorrelation?: boolean;
    maxConcurrentEvents?: number;
    eventTimeout?: number;
    enablePerformanceTracking?: boolean;
  };

  /** Event correlation configuration */
  correlation?: {
    enabled: boolean;
    strategy: 'session|component|operation|custom;
    correlationTTL: number;
    maxCorrelationDepth: number;
    correlationPatterns: string[];
  };

  /** Health monitoring configuration */
  healthMonitoring?: {
    enabled: boolean;
    healthCheckInterval: number;
    componentHealthThresholds: Record<string, number>;
    autoRecoveryEnabled: boolean;
  };
}

/**
 * System event operation metrics for performance monitoring.
 *
 * @example
 */
interface SystemEventMetrics {
  eventType: string;
  component: string;
  operation: string;
  executionTime: number;
  success: boolean;
  correlationId?: string;
  errorType?: string;
  recoveryAttempts?: number;
  timestamp: Date;
}

/**
 * Event correlation entry for tracking related events.
 *
 * @example
 */
interface EventCorrelation {
  correlationId: string;
  events: SystemEvent[];
  startTime: Date;
  lastUpdate: Date;
  component: string;
  operation: string;
  status: 'active|completed|failed|timeout;
  metadata: Record<string, unknown>;
}

/**
 * System health tracking entry.
 *
 * @example
 */
interface SystemHealthEntry {
  component: string;
  status: 'healthy|degraded|unhealthy|unknown;
  lastCheck: Date;
  consecutiveFailures: number;
  errorRate: number;
  responseTime: number;
  metadata: Record<string, unknown>;
}

/**
 * Wrapped system component for unified event management.
 *
 * @example
 */
interface WrappedSystemComponent {
  component: EventEmitter|null;
  wrapper: EventEmitter;
  originalMethods: Map<string, Function>;
  eventMappings: Map<string, string>;
  isActive: boolean;
}

/**
 * Unified System Event Adapter.
 *
 * Provides a unified interface to system-level EventEmitter patterns.
 * While implementing the EventManager interface for UEL compatibility.
 *
 * Features:
 * - Application lifecycle event management
 * - System health monitoring and status reporting
 * - Configuration change detection and notification
 * - Error correlation and recovery tracking
 * - Performance monitoring for system operations
 * - Event correlation and pattern detection
 * - Unified configuration management
 * - Health monitoring and auto-recovery
 * - Event forwarding and transformation
 * - Error handling with retry logic.
 *
 * @example
 */
export class SystemEventAdapter implements EventManager {
  // Core event manager properties
  public readonly config: SystemEventAdapterConfig;
  public readonly name: string;
  public readonly type: EventManagerType;

  // Event manager state
  private running = false;
  private eventEmitter = new EventEmitter();
  private logger: Logger;
  private startTime?: Date;
  private eventCount = 0;
  private successCount = 0;
  private errorCount = 0;
  private totalLatency = 0;

  // System component integration
  private wrappedComponents = new Map<string, WrappedSystemComponent>();
  private coreSystem?: unknown; // CoreSystem type not available
  private applicationCoordinator?: unknown; // ApplicationCoordinator type not available

  // Event correlation and tracking
  private eventCorrelations = new Map<string, EventCorrelation>();
  private systemHealth = new Map<string, SystemHealthEntry>();
  private metrics: SystemEventMetrics[] = [];
  private subscriptions = new Map<string, EventSubscription>();
  private filters = new Map<string, EventFilter>();
  private transforms = new Map<string, EventTransform>();

  // Event processing queues.
  private eventQueue: SystemEvent[] = [];
  private processingEvents = false;
  private eventHistory: SystemEvent[] = [];

  constructor(config: SystemEventAdapterConfig) {
    this.name = config?.name;
    this.type = config?.type;
    this.config = {
      // Default configuration values
      coreSystem: {
        enabled: true,
        wrapLifecycleEvents: true,
        wrapHealthEvents: true,
        wrapConfigEvents: true,
        ...config?.coreSystem,
      },
      applicationCoordinator: {
        enabled: true,
        wrapComponentEvents: true,
        wrapStatusEvents: true,
        wrapWorkspaceEvents: true,
        ...config?.applicationCoordinator,
      },
      processManagement: {
        enabled: true,
        wrapServiceEvents: true,
        wrapDaemonEvents: true,
        wrapResourceEvents: true,
        ...config?.processManagement,
      },
      errorRecovery: {
        enabled: true,
        wrapRecoveryEvents: true,
        wrapStrategyEvents: true,
        correlateErrors: true,
        ...config?.errorRecovery,
      },
      performance: {
        enableEventCorrelation: true,
        maxConcurrentEvents: 100,
        eventTimeout: 30000,
        enablePerformanceTracking: true,
        ...config?.performance,
      },
      correlation: {
        enabled: true,
        strategy:'component',
        correlationTTL: 300000, // 5 minutes
        maxCorrelationDepth: 10,
        correlationPatterns: [
          'system:startup->system:health',
          'system:error->system:recovery',
          'config:change->system:restart',
        ],
        ...config?.correlation,
      },
      healthMonitoring: {
        enabled: true,
        healthCheckInterval: 30000, // 30 seconds
        componentHealthThresholds: {
          'core-system': 0.95,
          'application-coordinator': 0.9,
          'workflow-engine': 0.85,
          'memory-system': 0.9,
          'interface-manager': 0.8,
        },
        autoRecoveryEnabled: true,
        ...config?.healthMonitoring,
      },
      ...config,
    };

    this.logger = getLogger(`SystemEventAdapter:${this.name}`);`
    this.logger.info(`Creating system event adapter: ${this.name}`);`

    // Set max listeners to handle many system components
  }

  // ============================================
  // EventManager Interface Implementation
  // ============================================

  /**
   * Start the system event adapter.
   */
  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn(`System event adapter ${this.name} is already running`);`
      return;
    }

    this.logger.info(`Starting system event adapter: ${this.name}`);`

    try {
      // Initialize system component integrations
      await this.initializeSystemIntegrations();

      // Start event processing
      this.startEventProcessing();

      // Start health monitoring if enabled
      if (this.config.healthMonitoring?.enabled) {
        this.startHealthMonitoring();
      }

      // Start correlation cleanup if enabled
      if (this.config.correlation?.enabled) {
        this.startCorrelationCleanup();
      }

      this.running = true;
      this.startTime = new Date();
      this.emitInternal('start');'

      this.logger.info(
        `System event adapter started successfully: ${this.name}``
      );
    } catch (error) {
      this.logger.error(
        `Failed to start system event adapter ${this.name}:`,`
        error
      );
      this.emitInternal('error', error);'
      throw error;
    }
  }

  /**
   * Stop the system event adapter.
   */
  async stop(): Promise<void> {
    if (!this.running) {
      this.logger.warn(`System event adapter ${this.name} is not running`);`
      return;
    }

    this.logger.info(`Stopping system event adapter: ${this.name}`);`

    try {
      // Stop event processing
      this.processingEvents = false;

      // Unwrap system components
      await this.unwrapSystemComponents();

      // Clear event queues
      this.eventQueue.length = 0;

      this.running = false;
      this.emitInternal('stop');'

      this.logger.info(
        `System event adapter stopped successfully: ${this.name}``
      );
    } catch (error) {
      this.logger.error(
        `Failed to stop system event adapter ${this.name}:`,`
        error
      );
      this.emitInternal('error', error);'
      throw error;
    }
  }

  /**
   * Restart the system event adapter.
   */
  async restart(): Promise<void> {
    this.logger.info(`Restarting system event adapter: ${this.name}`);`
    await this.stop();
    await this.start();
  }

  /**
   * Check if the adapter is running.
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Emit a system event with correlation and performance tracking.
   *
   * @param event
   * @param options
   */
  async emit<T extends SystemEvent>(
    event: T,
    options?: EventEmissionOptions
  ): Promise<void> {
    const startTime = Date.now();
    const eventId = event.id||this.generateEventId();

    try {
      // Validate event
      if (!this.validateEvent(event)) {
        throw new EventEmissionError(
          this.name,
          eventId,
          new Error('Invalid event format')'
        );
      }

      // Apply timeout if specified
      const timeout =
        options?.timeout||this.config.performance?.eventTimeout||30000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new EventTimeoutError(this.name, timeout, eventId)),
          timeout
        );
      });

      // Process event emission with timeout
      const emissionPromise = this.processEventEmission(event, options);
      await Promise.race([emissionPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      // Record success metrics
      this.recordEventMetrics({
        eventType: event.type,
        component: event.source,
        operation:'emit',
        executionTime: duration,
        success: true,
        correlationId: event.correlationId||undefined,
        timestamp: new Date(),
      });

      this.eventCount++;
      this.successCount++;
      this.totalLatency += duration;

      this.eventEmitter.emit('emission', { event, success: true, duration });'
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record error metrics
      this.recordEventMetrics({
        eventType: event.type,
        component: event.source,
        operation: 'emit',
        executionTime: duration,
        success: false,
        correlationId: event.correlationId||undefined,
        errorType:
          error instanceof Error ? error.constructor.name :'UnknownError',
        timestamp: new Date(),
      });

      this.eventCount++;
      this.errorCount++;
      this.totalLatency += duration;

      this.eventEmitter.emit('emission', {'
        event,
        success: false,
        duration,
        error,
      });
      this.eventEmitter.emit('error', error);'

      this.logger.error(`Event emission failed for ${event.type}:`, error);`
      throw error;
    }
  }

  /**
   * Emit batch of events with optimized processing.
   *
   * @param batch
   * @param options
   */
  async emitBatch<T extends SystemEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(
        `Emitting event batch: ${batch.id} (${batch.events.length} events)``
      );

      // Process events based on strategy
      switch (this.config.processing?.strategy) {
        case 'immediate':'
          await this.processBatchImmediate(batch, options);
          break;
        case 'queued':'
          await this.processBatchQueued(batch, options);
          break;
        case 'batched':'
          await this.processBatchBatched(batch, options);
          break;
        case 'throttled':'
          await this.processBatchThrottled(batch, options);
          break;
        default:
          await this.processBatchQueued(batch, options);
      }

      const duration = Date.now() - startTime;
      this.logger.debug(
        `Event batch processed successfully: ${batch.id} in ${duration}ms``
      );
    } catch (error) {
      this.logger.error(
        `Event batch processing failed for ${batch.id}:`,`
        error
      );
      throw error;
    }
  }

  /**
   * Emit event immediately without queuing.
   *
   * @param event
   */
  async emitImmediate<T extends SystemEvent>(event: T): Promise<void> {
    await this.emit(event, { timeout: 5000 });
  }

  /**
   * Subscribe to system events with filtering and transformation.
   *
   * @param eventTypes
   * @param listener
   * @param options
   */
  subscribe<T extends SystemEvent>(
    eventTypes: string|string[],
    listener: EventListener<T>,
    options?: Partial<EventSubscription<T>>
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    const subscription: EventSubscription<T> = {
      id: subscriptionId,
      eventTypes: types,
      listener,
      ...(options?.filter && { filter: options?.filter }),
      ...(options?.transform && { transform: options?.transform }),
      priority: options?.priority||'medium',
      created: new Date(),
      active: true,
      metadata: options?.metadata||{},
    };

    this.subscriptions.set(subscriptionId, subscription as EventSubscription);

    this.logger.debug(
      `Created subscription ${subscriptionId} for events: ${types.join(', ')}``
    );
    this.eventEmitter.emit('subscription', { subscriptionId, subscription });'

    return subscriptionId;
  }

  /**
   * Unsubscribe from events.
   *
   * @param subscriptionId
   */
  unsubscribe(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return false;
    }

    subscription.active = false;
    this.subscriptions.delete(subscriptionId);

    this.logger.debug(`Removed subscription: ${subscriptionId}`);`
    return true;
  }

  /**
   * Unsubscribe all listeners for event type.
   *
   * @param eventType
   */
  unsubscribeAll(eventType?: string): number {
    let removedCount = 0;

    if (eventType) {
      // Remove subscriptions for specific event type
      for (const [id, subscription] of this.subscriptions.entries()) {
        if (subscription.eventTypes.includes(eventType)) {
          this.unsubscribe(id);
          removedCount++;
        }
      }
    } else {
      // Remove all subscriptions
      removedCount = this.subscriptions.size;
      this.subscriptions.clear();
      this.eventEmitter.removeAllListeners();
    }

    this.logger.debug(
      `Removed ${removedCount} subscriptions${eventType ? ` for ${eventType}` : ''}``
    );
    return removedCount;
  }

  /**
   * Add event filter.
   *
   * @param filter
   */
  addFilter(filter: EventFilter): string {
    const filterId = this.generateFilterId();
    this.filters.set(filterId, filter);
    this.logger.debug(`Added event filter: ${filterId}`);`
    return filterId;
  }

  /**
   * Remove event filter.
   *
   * @param filterId
   */
  removeFilter(filterId: string): boolean {
    const result = this.filters.delete(filterId);
    if (result) {
      this.logger.debug(`Removed event filter: ${filterId}`);`
    }
    return result;
  }

  /**
   * Add event transform.
   *
   * @param transform
   */
  addTransform(transform: EventTransform): string {
    const transformId = this.generateTransformId();
    this.transforms.set(transformId, transform);
    this.logger.debug(`Added event transform: ${transformId}`);`
    return transformId;
  }

  /**
   * Remove event transform.
   *
   * @param transformId
   */
  removeTransform(transformId: string): boolean {
    const result = this.transforms.delete(transformId);
    if (result) {
      this.logger.debug(`Removed event transform: ${transformId}`);`
    }
    return result;
  }

  /**
   * Query event history with filtering and pagination.
   *
   * @param options
   */
  async query<T extends SystemEvent>(options: EventQueryOptions): Promise<T[]> {
    let events = [...this.eventHistory] as T[];

    // Apply filters
    if (options?.filter) {
      events = events.filter((event) =>
        this.applyFilter(event, options?.filter!)
      );
    }

    // Apply sorting
    if (options?.sortBy) {
      events.sort((a, b) => {
        const aVal = this.getEventSortValue(a, options?.sortBy!);
        const bVal = this.getEventSortValue(b, options?.sortBy!);
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return options.sortOrder === 'desc'? -comparison : comparison;'
      });
    }

    // Apply pagination
    const offset = options?.offset||0;
    const limit = options?.limit||100;
    events = events.slice(offset, offset + limit);

    return events;
  }

  /**
   * Get event history for specific event type.
   *
   * @param eventType
   * @param limit
   */
  async getEventHistory(
    eventType: string,
    limit?: number
  ): Promise<SystemEvent[]> {
    const events = this.eventHistory.filter(
      (event) => event.type === eventType
    );
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Perform health check on the system event adapter.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const now = new Date();
    const uptime = this.startTime
      ? now.getTime() - this.startTime.getTime()
      : 0;
    const errorRate =
      this.eventCount > 0 ? (this.errorCount / this.eventCount) * 100 : 0;

    // Check system component health
    const componentHealth = await this.checkSystemComponentHealth();

    // Determine overall health status
    let status: EventManagerStatus['status'] = 'healthy';
    if (errorRate > 20||!this.running) {
      status ='unhealthy;
    } else if (
      errorRate > 10||Object.values(componentHealth).some((h) => h.status !=='healthy')'
    ) {
      status = 'degraded';
    }

    return {
      name: this.name,
      type: this.type,
      status,
      lastCheck: now,
      subscriptions: this.subscriptions.size,
      queueSize: this.eventQueue.length,
      errorRate: errorRate / 100,
      uptime,
      metadata: {
        eventCount: this.eventCount,
        successCount: this.successCount,
        errorCount: this.errorCount,
        correlations: this.eventCorrelations.size,
        wrappedComponents: this.wrappedComponents.size,
        componentHealth,
      },
    };
  }

  /**
   * Get performance metrics for the adapter.
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const now = new Date();
    const recentMetrics = this.metrics.filter(
      (m) => now.getTime() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    const avgLatency =
      this.eventCount > 0 ? this.totalLatency / this.eventCount : 0;
    const throughput =
      recentMetrics.length > 0 ? recentMetrics.length / 300 : 0; // events per second

    // Calculate percentile latencies
    const latencies = recentMetrics
      .map((m) => m.executionTime)
      .sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      name: this.name,
      type: this.type,
      eventsProcessed: this.eventCount,
      eventsEmitted: this.successCount,
      eventsFailed: this.errorCount,
      averageLatency: avgLatency,
      p95Latency: latencies[p95Index]||0,
      p99Latency: latencies[p99Index]||0,
      throughput,
      subscriptionCount: this.subscriptions.size,
      queueSize: this.eventQueue.length,
      memoryUsage: this.estimateMemoryUsage(),
      timestamp: now,
    };
  }

  /**
   * Get active subscriptions.
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter((sub) => sub.active);
  }

  /**
   * Update adapter configuration.
   *
   * @param config
   */
  updateConfig(config: Partial<SystemEventAdapterConfig>): void {
    this.logger.info(
      `Updating configuration for system event adapter: ${this.name}``
    );
    Object.assign(this.config, config);
    this.logger.info(`Configuration updated successfully for: ${this.name}`);`
  }

  /**
   * Event handler management (EventEmitter compatibility).
   *
   * @param event
   * @param handler.
   * @param handler
   */
  on(
    event:'start|stop|error|subscription|emission',
    handler: (...args: unknown[]) => void
  ): void {
    this.eventEmitter.on(event, handler);
  }

  off(event: string, handler?: (...args: unknown[]) => void): void {
    if (handler) {
      this.eventEmitter.off(event, handler);
    } else {
      this.eventEmitter.removeAllListeners(event);
    }
  }

  once(event: string, handler: (...args: unknown[]) => void): void {
    this.eventEmitter.once(event, handler);
  }

  /**
   * Cleanup and destroy the adapter.
   */
  async destroy(): Promise<void> {
    this.logger.info(`Destroying system event adapter: ${this.name}`);`

    try {
      // Stop the adapter if still running
      if (this.running) {
        await this.stop();
      }

      // Clear all data structures
      this.subscriptions.clear();
      this.filters.clear();
      this.transforms.clear();
      this.eventCorrelations.clear();
      this.systemHealth.clear();
      this.metrics.length = 0;
      this.eventHistory.length = 0;
      this.eventQueue.length = 0;
      this.wrappedComponents.clear();

      // Remove all event listeners
      this.eventEmitter.removeAllListeners();

      this.logger.info(
        `System event adapter destroyed successfully: ${this.name}``
      );
    } catch (error) {
      this.logger.error(
        `Failed to destroy system event adapter ${this.name}:`,`
        error
      );
      throw error;
    }
  }

  // ============================================
  // System-Specific Event Management Methods
  // ============================================

  /**
   * Emit system lifecycle event with enhanced tracking.
   *
   * @param event
   */
  async emitSystemLifecycleEvent(
    event: Omit<SystemLifecycleEvent, 'id|timestamp'>'
  ): Promise<void> {
    const systemEvent: SystemLifecycleEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      priority: event.priority|'|EventPriorityMap[event.type]||'medium',
      correlationId: event.correlationId||this.generateCorrelationId(),
    };

    // Start event correlation if enabled
    if (this.config.correlation?.enabled) {
      this.startEventCorrelation(systemEvent);
    }

    await this.emit(systemEvent);
  }

  /**
   * Subscribe to system lifecycle events with convenience.
   *
   * @param listener
   */
  subscribeSystemLifecycleEvents(
    listener: EventListener<SystemLifecycleEvent>
  ): string {
    return this.subscribe(
      ['system:startup',
        'system:shutdown',
        'system:restart',
        'system:error',
        'system:health',
      ],
      listener
    );
  }

  /**
   * Subscribe to application lifecycle events.
   *
   * @param listener
   */
  subscribeApplicationEvents(
    listener: EventListener<SystemLifecycleEvent>
  ): string {
    return this.subscribe(['system:startup', 'system:health'], listener);'
  }

  /**
   * Subscribe to error and recovery events.
   *
   * @param listener
   */
  subscribeErrorRecoveryEvents(
    listener: EventListener<SystemLifecycleEvent>
  ): string {
    return this.subscribe(['system:error'], listener);'
  }

  /**
   * Get system health status for all components.
   */
  async getSystemHealthStatus(): Promise<Record<string, SystemHealthEntry>> {
    const healthStatus: Record<string, SystemHealthEntry> = {};

    for (const [component, health] of this.systemHealth.entries()) {
      healthStatus[component] = { ...health };
    }

    return healthStatus;
  }

  /**
   * Get correlated events for a specific correlation ID.
   *
   * @param correlationId
   */
  getCorrelatedEvents(correlationId: string): EventCorrelation|null {
    return this.eventCorrelations.get(correlationId)||null;
  }

  /**
   * Get active event correlations.
   */
  getActiveCorrelations(): EventCorrelation[] {
    return Array.from(this.eventCorrelations.values()).filter(
      (c) => c.status ==='active''
    );
  }

  /**
   * Force health check on all wrapped components.
   */
  async performSystemHealthCheck(): Promise<Record<string, SystemHealthEntry>> {
    const healthResults: Record<string, SystemHealthEntry> = {};

    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      try {
        const startTime = Date.now();

        // Perform component-specific health check
        let isHealthy = wrapped.isActive;
        let errorRate = 0;

        // Get component-specific health data if available
        if (
          wrapped.component &&
          typeof (wrapped.component as any).getStatus === 'function''
        ) {
          const status = await (wrapped.component as any).getStatus();
          isHealthy = status.status === 'ready'||status.status ==='healthy';
          errorRate = status.errorRate||0;
        }

        const responseTime = Date.now() - startTime;
        const threshold =
          this.config.healthMonitoring?.componentHealthThresholds?.[
            componentName
          ]||0.8;
        const healthScore = isHealthy ? 1 - errorRate : 0;

        const healthEntry: SystemHealthEntry = {
          component: componentName,
          status:
            healthScore >= threshold
              ?'healthy''
              : healthScore >= threshold * 0.7
                ? 'degraded''
                : 'unhealthy',
          lastCheck: new Date(),
          consecutiveFailures: isHealthy
            ? 0
            : (this.systemHealth.get(componentName)?.consecutiveFailures||0) +
              1,
          errorRate,
          responseTime,
          metadata: {
            healthScore,
            threshold,
            isActive: wrapped.isActive,
          },
        };

        this.systemHealth.set(componentName, healthEntry);
        healthResults[componentName] = healthEntry;
      } catch (error) {
        const healthEntry: SystemHealthEntry = {
          component: componentName,
          status:'unhealthy',
          lastCheck: new Date(),
          consecutiveFailures:
            (this.systemHealth.get(componentName)?.consecutiveFailures||0) +
            1,
          errorRate: 1.0,
          responseTime: 0,
          metadata: {
            error: error instanceof Error ? error.message :'Unknown error',
          },
        };

        this.systemHealth.set(componentName, healthEntry);
        healthResults[componentName] = healthEntry;
      }
    }

    return healthResults;
  }

  // ============================================
  // Internal Implementation Methods
  // ============================================

  /**
   * Initialize system component integrations.
   */
  private async initializeSystemIntegrations(): Promise<void> {
    this.logger.debug('Initializing system component integrations');'

    // Wrap CoreSystem if enabled
    if (this.config.coreSystem?.enabled) {
      await this.wrapCoreSystem();
    }

    // Wrap ApplicationCoordinator if enabled
    if (this.config.applicationCoordinator?.enabled) {
      await this.wrapApplicationCoordinator();
    }

    // Wrap ErrorRecoverySystem if enabled
    if (this.config.errorRecovery?.enabled) {
      await this.wrapErrorRecoverySystem();
    }

    this.logger.debug(
      `Wrapped ${this.wrappedComponents.size} system components``
    );
  }

  /**
   * Wrap CoreSystem events with UEL integration.
   */
  private async wrapCoreSystem(): Promise<void> {
    // Note: In a real implementation, we would get a reference to the actual CoreSystem instance
    // For now, we'll create a mock wrapper to demonstrate the pattern'

    const wrapper = new EventEmitter();
    const wrappedComponent: WrappedSystemComponent = {
      component: null, // Would be actual CoreSystem instance
      wrapper,
      originalMethods: new Map(),
      eventMappings: new Map([
        ['system-initialized', 'system:startup'],
        ['system-ready', 'system:health'],
        ['system-error', 'system:error'],
        ['system-shutdown', 'system:shutdown'],
      ]),
      isActive: true,
    };

    // Set up event forwarding from CoreSystem to UEL
    wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
      wrapper.on(originalEvent, (data) => {
        const systemEvent: SystemLifecycleEvent = {
          id: this.generateEventId(),
          timestamp: new Date(),
          source: 'core-system',
          type: uelEvent as any,
          operation: this.extractOperationFromEvent(originalEvent),
          status: this.extractStatusFromData(data),
          priority: EventPriorityMap[uelEvent]||'medium',
          correlationId: this.generateCorrelationId(),
          payload: {
            source: 'core-system',
            originalEvent,
            operation: this.extractOperationFromEvent(originalEvent),
            status: this.extractStatusFromData(data),
            component: 'core-system',
            eventData: data||{},
          },
          metadata: { originalEvent, data },
        };

        this.eventEmitter.emit(uelEvent, systemEvent);
      });
    });

    this.wrappedComponents.set('core-system', wrappedComponent);'
    this.logger.debug('Wrapped CoreSystem events');'
  }

  /**
   * Wrap ApplicationCoordinator events with UEL integration.
   */
  private async wrapApplicationCoordinator(): Promise<void> {
    const wrapper = new EventEmitter();
    const wrappedComponent: WrappedSystemComponent = {
      component: null, // Would be actual ApplicationCoordinator instance
      wrapper,
      originalMethods: new Map(),
      eventMappings: new Map([
        ['component-initialized', 'system:startup'],
        ['component-status-change', 'system:health'],
        ['component-error', 'system:error'],
        ['workspace-loaded', 'system:health'],
      ]),
      isActive: true,
    };

    // Set up event forwarding
    wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
      wrapper.on(originalEvent, (data) => {
        const systemEvent: SystemLifecycleEvent = {
          id: this.generateEventId(),
          timestamp: new Date(),
          source: 'application-coordinator',
          type: uelEvent as any,
          operation: this.extractOperationFromEvent(originalEvent),
          status: this.extractStatusFromData(data),
          priority: EventPriorityMap[uelEvent]||'medium',
          correlationId: this.generateCorrelationId(),
          payload: {
            source: 'application-coordinator',
            originalEvent,
            operation: this.extractOperationFromEvent(originalEvent),
            status: this.extractStatusFromData(data),
            component: 'application-coordinator',
            eventData: data||{},
          },
          metadata: { originalEvent, data },
        };

        this.eventEmitter.emit(uelEvent, systemEvent);
      });
    });

    this.wrappedComponents.set('application-coordinator', wrappedComponent);'
    this.logger.debug('Wrapped ApplicationCoordinator events');'
  }

  /**
   * Wrap ErrorRecoverySystem events with UEL integration.
   */
  private async wrapErrorRecoverySystem(): Promise<void> {
    const wrapper = new EventEmitter();
    const wrappedComponent: WrappedSystemComponent = {
      component: null, // Would be actual ErrorRecoverySystem instance
      wrapper,
      originalMethods: new Map(),
      eventMappings: new Map([
        ['recovery:started', 'system:error'],
        ['recovery:completed', 'system:health'],
        ['recovery:failed', 'system:error'],
        ['strategy:registered', 'system:health'],
      ]),
      isActive: true,
    };

    // Set up event forwarding
    wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
      wrapper.on(originalEvent, (data) => {
        const systemEvent: SystemLifecycleEvent = {
          id: this.generateEventId(),
          timestamp: new Date(),
          source: 'error-recovery',
          type: uelEvent as any,
          operation: this.extractOperationFromEvent(originalEvent),
          status: this.extractStatusFromData(data),
          priority: 'high', // Error recovery events are high priority'
          correlationId: this.generateCorrelationId(),
          payload: {
            source: 'error-recovery',
            originalEvent,
            operation: this.extractOperationFromEvent(originalEvent),
            status: this.extractStatusFromData(data),
            component: 'error-recovery',
            severity: 'high',
            eventData: data||{},
          },
          metadata: { originalEvent, data },
        };

        this.eventEmitter.emit(uelEvent, systemEvent);

        // Correlate error recovery events if enabled
        if (this.config.errorRecovery?.correlateErrors) {
          this.correlateErrorRecoveryEvent(systemEvent, data);
        }
      });
    });

    this.wrappedComponents.set('error-recovery', wrappedComponent);'
    this.logger.debug('Wrapped ErrorRecoverySystem events');'
  }

  /**
   * Unwrap all system components.
   */
  private async unwrapSystemComponents(): Promise<void> {
    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      try {
        // Restore original methods if they were wrapped
        wrapped.originalMethods.forEach((originalMethod, methodName) => {
          if (wrapped.component && methodName in wrapped.component) {
            (wrapped.component as any)[methodName] = originalMethod;
          }
        });

        // Remove event listeners
        wrapped.wrapper.removeAllListeners();
        wrapped.isActive = false;

        this.logger.debug(`Unwrapped component: ${componentName}`);`
      } catch (error) {
        this.logger.warn(`Failed to unwrap component ${componentName}:`, error);`
      }
    }

    this.wrappedComponents.clear();
  }

  /**
   * Process event emission with correlation and filtering.
   *
   * @param event
   * @param options
   * @param _options
   */
  private async processEventEmission<T extends SystemEvent>(
    event: T,
    _options?: EventEmissionOptions
  ): Promise<void> {
    // Add to event history
    this.eventHistory.push(event);

    // Limit history size
    if (this.eventHistory.length > 10000) {
      this.eventHistory = this.eventHistory.slice(-5000);
    }

    // Handle event correlation
    if (this.config.correlation?.enabled && event.correlationId) {
      this.updateEventCorrelation(event);
    }

    // Apply global filters
    for (const filter of this.filters.values()) {
      if (!this.applyFilter(event, filter)) {
        this.logger.debug(`Event ${event.id} filtered out`);`
        return;
      }
    }

    // Apply global transforms
    let transformedEvent = event;
    for (const transform of this.transforms.values()) {
      transformedEvent = await this.applyTransform(transformedEvent, transform);
    }

    // Process subscriptions manually to handle filtering and transformation per subscription
    for (const subscription of this.subscriptions.values()) {
      if (
        !(
          subscription.active &&
          subscription.eventTypes.includes(transformedEvent.type)
        )
      ) {
        continue;
      }

      try {
        // Apply subscription-specific filters
        if (
          subscription.filter &&
          !this.applyFilter(transformedEvent, subscription.filter)
        ) {
          continue;
        }

        // Apply subscription-specific transforms
        let subscriptionEvent = transformedEvent;
        if (subscription.transform) {
          subscriptionEvent = await this.applyTransform(
            transformedEvent,
            subscription.transform
          );
        }

        // Call the listener
        await subscription.listener(subscriptionEvent);
      } catch (error) {
        this.logger.error(
          `Subscription listener error for ${subscription.id}:`,`
          error
        );
        this.eventEmitter.emit('subscription-error', {'
          subscriptionId: subscription.id,
          error,
        });
      }
    }

    // Also emit to the event emitter for compatibility
    this.eventEmitter.emit(transformedEvent.type, transformedEvent);
    this.eventEmitter.emit('*', transformedEvent); // Wildcard listeners'
  }

  /**
   * Start event processing loop.
   */
  private startEventProcessing(): void {
    this.processingEvents = true;

    const processQueue = async () => {
      if (!this.processingEvents||this.eventQueue.length === 0) {
        setTimeout(processQueue, 100);
        return;
      }

      const event = this.eventQueue.shift();
      if (event) {
        try {
          await this.processEventEmission(event);
        } catch (error) {
          this.logger.error('Event processing error:', error);'
        }
      }

      // Process next event
      setImmediate(processQueue);
    };

    processQueue();
  }

  /**
   * Start health monitoring for system components.
   */
  private startHealthMonitoring(): void {
    const interval = this.config.healthMonitoring?.healthCheckInterval||30000;

    setInterval(async () => {
      try {
        await this.performSystemHealthCheck();

        // Emit health status events
        for (const [component, health] of this.systemHealth.entries()) {
          if (health.status !=='healthy') {'
            await this.emitSystemLifecycleEvent({
              source: component,
              type: 'system:health',
              operation: 'status',
              status: health.status === 'unhealthy' ? 'error' : 'warning',
              payload: {},
              details: {
                component,
                healthScore: (health.metadata as any)?.['healthScore'] as|number|undefined,
                // errorRate: health.errorRate, // Not part of SystemLifecycleEvent details interface
                // consecutiveFailures: health.consecutiveFailures, // Not part of SystemLifecycleEvent details interface
              },
            });
          }
        }
      } catch (error) {
        this.logger.error('Health monitoring error:', error);'
      }
    }, interval);
  }

  /**
   * Start correlation cleanup to prevent memory leaks.
   */
  private startCorrelationCleanup(): void {
    const cleanupInterval = 60000; // 1 minute
    const correlationTTL = this.config.correlation?.correlationTTL||300000; // 5 minutes

    setInterval(() => {
      const now = Date.now();
      const expiredCorrelations: string[] = [];

      for (const [
        correlationId,
        correlation,
      ] of this.eventCorrelations.entries()) {
        if (now - correlation.lastUpdate.getTime() > correlationTTL) {
          expiredCorrelations.push(correlationId);
        }
      }

      expiredCorrelations.forEach((id) => {
        const correlation = this.eventCorrelations.get(id);
        if (correlation) {
          correlation.status ='timeout;
          this.eventCorrelations.delete(id);
        }
      });

      if (expiredCorrelations.length > 0) {
        this.logger.debug(
          `Cleaned up ${expiredCorrelations.length} expired correlations``
        );
      }
    }, cleanupInterval);
  }

  /**
   * Start event correlation for tracking related events.
   *
   * @param event
   */
  private startEventCorrelation(event: SystemEvent): void {
    const correlationId = event.correlationId||this.generateCorrelationId();

    if (this.eventCorrelations.has(correlationId)) {
      this.updateEventCorrelation(event);
    } else {
      const correlation: EventCorrelation = {
        correlationId,
        events: [event],
        startTime: new Date(),
        lastUpdate: new Date(),
        component: event.source,
        operation: this.extractOperationFromEvent(event.type),
        status:'active',
        metadata: {},
      };

      this.eventCorrelations.set(correlationId, correlation);
    }
  }

  /**
   * Update existing event correlation.
   *
   * @param event
   */
  private updateEventCorrelation(event: SystemEvent): void {
    const correlationId = event.correlationId;
    if (!correlationId) return;

    const correlation = this.eventCorrelations.get(correlationId);
    if (correlation) {
      correlation.events.push(event);
      correlation.lastUpdate = new Date();

      // Check for completion patterns
      if (this.isCorrelationComplete(correlation)) {
        correlation.status = 'completed';
      }
    }
  }

  /**
   * Correlate error recovery events for enhanced tracking.
   *
   * @param event
   * @param data
   */
  private correlateErrorRecoveryEvent(
    event: SystemLifecycleEvent,
    data: Record<string, unknown>
  ): void {
    // Create correlation between error and recovery events
    const recoveryCorrelationId = this.generateCorrelationId();

    // Update event with recovery correlation
    event.correlationId = recoveryCorrelationId;
    event.metadata = {
      ...event.metadata,
      recoveryData: data,
    };

    this.startEventCorrelation(event);
  }

  /**
   * Check if event correlation is complete based on patterns.
   *
   * @param correlation
   */
  private isCorrelationComplete(correlation: EventCorrelation): boolean {
    const patterns = this.config.correlation?.correlationPatterns||[];

    for (const pattern of patterns) {
      const [startEvent, endEvent] = pattern.split('->');'
      const hasStart = correlation.events.some((e) => e.type === startEvent);
      const hasEnd = correlation.events.some((e) => e.type === endEvent);

      if (hasStart && hasEnd) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check health of all system components.
   */
  private async checkSystemComponentHealth(): Promise<
    Record<string, SystemHealthEntry>
  > {
    const componentHealth: Record<string, SystemHealthEntry> = {};

    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      const existing = this.systemHealth.get(componentName);
      const healthEntry: SystemHealthEntry = existing||{
        component: componentName,
        status: wrapped.isActive ?'healthy' : 'unhealthy',
        lastCheck: new Date(),
        consecutiveFailures: 0,
        errorRate: 0,
        responseTime: 0,
        metadata: {},
      };

      componentHealth[componentName] = healthEntry;
    }

    return componentHealth;
  }

  /**
   * Batch processing methods for different strategies.
   *
   * @param batch
   * @param options
   */
  private async processBatchImmediate<T extends SystemEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    await Promise.all(batch.events.map((event) => this.emit(event, options)));
  }

  private async processBatchQueued<T extends SystemEvent>(
    batch: EventBatch<T>,
    _options?: EventEmissionOptions
  ): Promise<void> {
    this.eventQueue.push(...batch.events);
  }

  private async processBatchBatched<T extends SystemEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const batchSize = this.config.processing?.batchSize||50;

    for (let i = 0; i < batch.events.length; i += batchSize) {
      const chunk = batch.events.slice(i, i + batchSize);
      await Promise.all(chunk.map((event) => this.emit(event, options)));
    }
  }

  private async processBatchThrottled<T extends SystemEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const throttleMs = this.config.processing?.throttleMs||100;

    for (const event of batch.events) {
      await this.emit(event, options);
      await new Promise((resolve) => setTimeout(resolve, throttleMs));
    }
  }

  /**
   * Utility methods for event processing.
   *
   * @param event
   */
  private validateEvent(event: SystemEvent): boolean {
    return !!(event.id && event.timestamp && event.source && event.type);
  }

  private applyFilter(event: SystemEvent, filter: EventFilter): boolean {
    // Type filter
    if (filter.types && !filter.types.includes(event.type)) {
      return false;
    }

    // Source filter
    if (filter.sources && !filter.sources.includes(event.source)) {
      return false;
    }

    // Priority filter
    if (
      filter.priorities &&
      event.priority &&
      !filter.priorities.includes(event.priority)
    ) {
      return false;
    }

    // Metadata filter
    if (filter.metadata) {
      for (const [key, value] of Object.entries(filter.metadata)) {
        if (!event.metadata||event.metadata[key] !== value) {
          return false;
        }
      }
    }

    // Custom filter
    if (filter.customFilter && !filter.customFilter(event)) {
      return false;
    }

    return true;
  }

  private async applyTransform<T extends SystemEvent>(
    event: T,
    transform: EventTransform
  ): Promise<T> {
    let transformedEvent = event;

    // Apply mapper
    if (transform.mapper) {
      transformedEvent = transform.mapper(transformedEvent) as T;
    }

    // Apply enricher
    if (transform.enricher) {
      transformedEvent = (await transform.enricher(transformedEvent)) as T;
    }

    // Apply validator
    if (transform.validator && !transform.validator(transformedEvent)) {
      throw new Error(`Event transformation validation failed for ${event.id}`);`
    }

    return transformedEvent;
  }

  private getEventSortValue(
    event: SystemEvent,
    sortBy: string
  ): string|number {
    switch (sortBy) {
      case'timestamp':'
        return event.timestamp.getTime();
      case 'priority': {'
        const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorities[event.priority||'medium'];'
      }
      case 'type':'
        return event.type;
      case 'source':'
        return event.source;
      default:
        return event.timestamp.getTime();
    }
  }

  private extractOperationFromEvent(
    eventType: string
  ): SystemLifecycleEvent['operation'] {'
    if (eventType.includes('start')||eventType.includes('init'))'
      return 'start;
    if (eventType.includes('stop')||eventType.includes('shutdown'))'
      return 'stop;
    if (eventType.includes('restart')) return 'restart;
    if (eventType.includes('health')) return 'status;
    return 'status;
  }

  private extractStatusFromData(data: unknown): SystemLifecycleEvent['status'] {'
    if (!data) return 'success;
    const dataObj = data as any;
    if (dataObj?.error||dataObj?.status ==='error') return 'error;
    if (dataObj?.warning||dataObj?.status ==='warning') return 'warning;
    if (dataObj?.status === 'critical') return 'critical';
    return 'success;
  }

  private recordEventMetrics(metrics: SystemEventMetrics): void {
    if (!this.config.performance?.enablePerformanceTracking) {
      return;
    }

    this.metrics.push(metrics);

    // Keep only recent metrics (last hour)
    const cutoff = new Date(Date.now() - 3600000);
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
  }

  private estimateMemoryUsage(): number {
    let size = 0;

    // Estimate subscriptions memory
    size += this.subscriptions.size * 200;

    // Estimate event history memory
    size += this.eventHistory.length * 500;

    // Estimate correlations memory
    for (const correlation of this.eventCorrelations.values()) {
      size += correlation.events.length * 300;
    }

    // Estimate metrics memory
    size += this.metrics.length * 150;

    return size;
  }

  /**
   * D generation methods.
   */
  private generateEventId(): string {
    return `sys-evt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;`
  }

  private generateSubscriptionId(): string {
    return `sys-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;`
  }

  private generateFilterId(): string {
    return `sys-flt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;`
  }

  private generateTransformId(): string {
    return `sys-txf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;`
  }

  private generateCorrelationId(): string {
    return `sys-cor-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;`
  }

  /**
   * Emit wrapper for internal use.
   *
   * @param event
   * @param data
   */
  private emitInternal(event: string, data?: unknown): void {
    this.eventEmitter.emit(event, data);
  }
}

/**
 * Factory function for creating SystemEventAdapter instances.
 *
 * @param config
 * @example
 */
export function createSystemEventAdapter(
  config: SystemEventAdapterConfig
): SystemEventAdapter {
  return new SystemEventAdapter(config);
}

/**
 * Helper function for creating default system event adapter configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export function createDefaultSystemEventAdapterConfig(
  name: string,
  overrides?: Partial<SystemEventAdapterConfig>
): SystemEventAdapterConfig {
  return {
    name,
    type: EventManagerTypes.SYSTEM,
    processing: {
      strategy: 'immediate',
      queueSize: 1000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential',
      maxDelay: 5000,
    },
    health: {
      checkInterval: 30000,
      timeout: 5000,
      failureThreshold: 3,
      successThreshold: 2,
      enableAutoRecovery: true,
    },
    monitoring: {
      enabled: true,
      metricsInterval: 10000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
    },
    coreSystem: {
      enabled: true,
      wrapLifecycleEvents: true,
      wrapHealthEvents: true,
      wrapConfigEvents: true,
    },
    applicationCoordinator: {
      enabled: true,
      wrapComponentEvents: true,
      wrapStatusEvents: true,
      wrapWorkspaceEvents: true,
    },
    processManagement: {
      enabled: true,
      wrapServiceEvents: true,
      wrapDaemonEvents: true,
      wrapResourceEvents: true,
    },
    errorRecovery: {
      enabled: true,
      wrapRecoveryEvents: true,
      wrapStrategyEvents: true,
      correlateErrors: true,
    },
    performance: {
      enableEventCorrelation: true,
      maxConcurrentEvents: 100,
      eventTimeout: 30000,
      enablePerformanceTracking: true,
    },
    correlation: {
      enabled: true,
      strategy: 'component',
      correlationTTL: 300000,
      maxCorrelationDepth: 10,
      correlationPatterns: [
        'system:startup->system:health',
        'system:error->system:recovery',
        'config:change->system:restart',
      ],
    },
    healthMonitoring: {
      enabled: true,
      healthCheckInterval: 30000,
      componentHealthThresholds: {
        'core-system': 0.95,
        'application-coordinator': 0.9,
        'workflow-engine': 0.85,
        'memory-system': 0.9,
        'interface-manager': 0.8,
      },
      autoRecoveryEnabled: true,
    },
    ...overrides,
  };
}

/**
 * Helper functions for system event operations.
 */
export const SystemEventHelpers = {
  /**
   * Create system startup event.
   *
   * @param component
   * @param details
   */
  createStartupEvent(
    component: string,
    details?: {
      component?: string;
      version?: string;
      duration?: number;
      errorCode?: string;
      errorMessage?: string;
      healthScore?: number;
    }
  ): Omit<SystemLifecycleEvent, 'id|timestamp''> {'
    return {
      source: component,
      type: 'system:startup',
      operation: 'start',
      status: 'success',
      priority: 'high',
      payload: {},
      details,
    };
  },

  /**
   * Create system shutdown event.
   *
   * @param component
   * @param details
   */
  createShutdownEvent(
    component: string,
    details?: {
      component?: string;
      version?: string;
      duration?: number;
      errorCode?: string;
      errorMessage?: string;
      healthScore?: number;
    }
  ): Omit<SystemLifecycleEvent, 'id|timestamp''> {'
    return {
      source: component,
      type: 'system:shutdown',
      operation: 'stop',
      status: 'success',
      priority: 'critical',
      payload: {},
      details,
    };
  },

  /**
   * Create system health event.
   *
   * @param component
   * @param healthScore
   * @param details
   */
  createHealthEvent(
    component: string,
    healthScore: number,
    details?: unknown
  ): Omit<SystemLifecycleEvent, 'id|timestamp''> {'
    return {
      source: component,
      type: 'system:health',
      operation: 'status',
      status:
        healthScore >= 0.8
          ? 'success''
          : healthScore >= 0.5
            ? 'warning''
            : 'error',
      priority: 'medium',
      payload: {
        component,
        healthScore,
        operation: 'status',
        severity:
          healthScore >= 0.8
            ? 'info''
            : healthScore >= 0.5
              ? 'warning''
              : 'error',
        source: component,
        helperFunction: 'createHealthStatusEvent',
        eventData: details||{},
      },
      details: {
        ...(details && typeof details ==='object''
          ? (details as Record<string, unknown>)
          : {}),
        healthScore,
      },
    };
  },

  /**
   * Create system error event.
   *
   * @param component
   * @param error
   * @param details
   */
  createErrorEvent(
    component: string,
    error: Error,
    details?: unknown
  ): Omit<SystemLifecycleEvent, 'id|timestamp''> {'
    return {
      source: component,
      type: 'system:error',
      operation: 'status',
      status: 'error',
      priority: 'high',
      payload: {
        component,
        error: {
          name: error.name,
          message: error.message,
        },
        operation: 'status',
        severity: 'error',
        source: component,
        helperFunction: 'createErrorEvent',
        eventData: details||{},
      },
      details: {
        ...(details && typeof details ==='object''
          ? (details as Record<string, unknown>)
          : {}),
        errorCode: error.name,
        errorMessage: error.message,
      },
    };
  },
};

export default SystemEventAdapter;
