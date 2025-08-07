/**
 * UEL Coordination Event Adapter
 *
 * Unified Event Layer adapter for coordination-related events, providing
 * a consistent interface to scattered EventEmitter patterns across the coordination system
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified coordination functionality.
 *
 * This adapter follows the exact same patterns as the system event adapter,
 * implementing the IEventManager interface and providing unified configuration
 * management for coordination events across Claude-Zen.
 */

import { EventEmitter } from 'node:events';
import type { AgentManager } from '../../../coordination/agents/agent-manager';
import type { Orchestrator } from '../../../coordination/orchestrator';
// Import coordination system classes to wrap their EventEmitter usage
import type { SwarmCoordinator } from '../../../coordination/swarm/core/swarm-coordinator';
import { createLogger, type Logger } from '../../../core/logger';
import type {
  EventBatch,
  EventEmissionOptions,
  EventFilter,
  EventListener,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventQueryOptions,
  EventSubscription,
  EventTransform,
  IEventManager,
} from '../core/interfaces';
import { EventEmissionError, EventManagerTypes, EventTimeoutError } from '../core/interfaces';
import type { CoordinationEvent, EventPriority } from '../types';
import { EventPriorityMap } from '../types';

/**
 * Coordination event adapter configuration extending UEL EventManagerConfig
 *
 * @example
 */
export interface CoordinationEventAdapterConfig extends EventManagerConfig {
  /** Swarm coordination integration settings */
  swarmCoordination?: {
    enabled: boolean;
    wrapLifecycleEvents?: boolean;
    wrapPerformanceEvents?: boolean;
    wrapTopologyEvents?: boolean;
    wrapHealthEvents?: boolean;
    coordinators?: string[]; // List of coordinators to wrap
  };

  /** Agent management integration settings */
  agentManagement?: {
    enabled: boolean;
    wrapAgentEvents?: boolean;
    wrapHealthEvents?: boolean;
    wrapRegistryEvents?: boolean;
    wrapLifecycleEvents?: boolean;
  };

  /** Task orchestration integration settings */
  taskOrchestration?: {
    enabled: boolean;
    wrapTaskEvents?: boolean;
    wrapDistributionEvents?: boolean;
    wrapExecutionEvents?: boolean;
    wrapCompletionEvents?: boolean;
  };

  /** Protocol management integration settings */
  protocolManagement?: {
    enabled: boolean;
    wrapCommunicationEvents?: boolean;
    wrapTopologyEvents?: boolean;
    wrapLifecycleEvents?: boolean;
    wrapCoordinationEvents?: boolean;
  };

  /** Performance optimization settings */
  performance?: {
    enableSwarmCorrelation?: boolean;
    enableAgentTracking?: boolean;
    enableTaskMetrics?: boolean;
    maxConcurrentCoordinations?: number;
    coordinationTimeout?: number;
    enablePerformanceTracking?: boolean;
  };

  /** Coordination correlation configuration */
  coordination?: {
    enabled: boolean;
    strategy: 'swarm' | 'agent' | 'task' | 'topology' | 'custom';
    correlationTTL: number;
    maxCorrelationDepth: number;
    correlationPatterns: string[];
    trackAgentCommunication: boolean;
    trackSwarmHealth: boolean;
  };

  /** Agent health monitoring configuration */
  agentHealthMonitoring?: {
    enabled: boolean;
    healthCheckInterval: number;
    agentHealthThresholds: Record<string, number>;
    swarmHealthThresholds: Record<string, number>;
    autoRecoveryEnabled: boolean;
  };

  /** Swarm optimization configuration */
  swarmOptimization?: {
    enabled: boolean;
    optimizationInterval: number;
    performanceThresholds: {
      latency: number;
      throughput: number;
      reliability: number;
    };
    autoScaling: boolean;
    loadBalancing: boolean;
  };
}

/**
 * Coordination event operation metrics for performance monitoring
 *
 * @example
 */
interface CoordinationEventMetrics {
  eventType: string;
  component: string;
  operation: string;
  executionTime: number;
  success: boolean;
  correlationId?: string;
  swarmId?: string;
  agentId?: string;
  taskId?: string;
  coordinationLatency?: number;
  resourceUsage?: {
    cpu: number;
    memory: number;
    network: number;
  };
  errorType?: string;
  recoveryAttempts?: number;
  timestamp: Date;
}

/**
 * Coordination correlation entry for tracking related events
 *
 * @example
 */
interface CoordinationCorrelation {
  correlationId: string;
  events: CoordinationEvent[];
  startTime: Date;
  lastUpdate: Date;
  swarmId?: string;
  agentIds: string[];
  taskIds: string[];
  operation: string;
  status: 'active' | 'completed' | 'failed' | 'timeout';
  performance: {
    totalLatency: number;
    coordinationEfficiency: number;
    resourceUtilization: number;
  };
  metadata: Record<string, any>;
}

/**
 * Coordination health tracking entry
 *
 * @example
 */
interface CoordinationHealthEntry {
  component: string;
  componentType: 'swarm' | 'agent' | 'orchestrator' | 'protocol';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  consecutiveFailures: number;
  coordinationLatency: number;
  throughput: number;
  reliability: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
  agentCount?: number;
  activeTaskCount?: number;
  metadata: Record<string, any>;
}

/**
 * Wrapped coordination component for unified event management
 *
 * @example
 */
interface WrappedCoordinationComponent {
  component: any;
  componentType: 'swarm' | 'agent' | 'orchestrator' | 'protocol';
  wrapper: EventEmitter;
  originalMethods: Map<string, Function>;
  eventMappings: Map<string, string>;
  isActive: boolean;
  healthMetrics: {
    lastSeen: Date;
    coordinationCount: number;
    errorCount: number;
    avgLatency: number;
  };
}

/**
 * Unified Coordination Event Adapter
 *
 * Provides a unified interface to coordination-level EventEmitter patterns
 * while implementing the IEventManager interface for UEL compatibility.
 *
 * Features:
 * - Swarm lifecycle and coordination event management
 * - Agent management and health monitoring
 * - Task distribution and execution tracking
 * - Inter-swarm communication and protocol management
 * - Performance monitoring for coordination operations
 * - Event correlation and pattern detection for coordination workflows
 * - Unified configuration management for coordination components
 * - Health monitoring and auto-recovery for coordination failures
 * - Event forwarding and transformation for coordination events
 * - Error handling with retry logic for coordination operations
 *
 * @example
 */
export class CoordinationEventAdapter implements IEventManager {
  // Core event manager properties
  public readonly config: CoordinationEventAdapterConfig;
  public readonly name: string;
  public readonly type: string;

  // Event manager state
  private running = false;
  private eventEmitter = new EventEmitter();
  private logger: Logger;
  private startTime?: Date;
  private eventCount = 0;
  private successCount = 0;
  private errorCount = 0;
  private totalLatency = 0;

  // Coordination component integration
  private wrappedComponents = new Map<string, WrappedCoordinationComponent>();
  private swarmCoordinators = new Map<string, SwarmCoordinator>();
  private agentManagers = new Map<string, AgentManager>();
  private orchestrators = new Map<string, Orchestrator>();

  // Event correlation and tracking
  private coordinationCorrelations = new Map<string, CoordinationCorrelation>();
  private coordinationHealth = new Map<string, CoordinationHealthEntry>();
  private metrics: CoordinationEventMetrics[] = [];
  private subscriptions = new Map<string, EventSubscription>();
  private filters = new Map<string, EventFilter>();
  private transforms = new Map<string, EventTransform>();

  // Event processing queues
  private eventQueue: CoordinationEvent[] = [];
  private processingEvents = false;
  private eventHistory: CoordinationEvent[] = [];

  // Coordination-specific tracking
  private swarmMetrics = new Map<string, any>();
  private agentMetrics = new Map<string, any>();
  private taskMetrics = new Map<string, any>();
  private coordinationPatterns = new Map<string, any>();

  constructor(config: CoordinationEventAdapterConfig) {
    this.name = config.name;
    this.type = config.type;
    this.config = {
      // Default configuration values
      swarmCoordination: {
        enabled: true,
        wrapLifecycleEvents: true,
        wrapPerformanceEvents: true,
        wrapTopologyEvents: true,
        wrapHealthEvents: true,
        coordinators: ['default', 'sparc'],
        ...config.swarmCoordination,
      },
      agentManagement: {
        enabled: true,
        wrapAgentEvents: true,
        wrapHealthEvents: true,
        wrapRegistryEvents: true,
        wrapLifecycleEvents: true,
        ...config.agentManagement,
      },
      taskOrchestration: {
        enabled: true,
        wrapTaskEvents: true,
        wrapDistributionEvents: true,
        wrapExecutionEvents: true,
        wrapCompletionEvents: true,
        ...config.taskOrchestration,
      },
      protocolManagement: {
        enabled: true,
        wrapCommunicationEvents: true,
        wrapTopologyEvents: true,
        wrapLifecycleEvents: true,
        wrapCoordinationEvents: true,
        ...config.protocolManagement,
      },
      performance: {
        enableSwarmCorrelation: true,
        enableAgentTracking: true,
        enableTaskMetrics: true,
        maxConcurrentCoordinations: 100,
        coordinationTimeout: 30000,
        enablePerformanceTracking: true,
        ...config.performance,
      },
      coordination: {
        enabled: true,
        strategy: 'swarm',
        correlationTTL: 300000, // 5 minutes
        maxCorrelationDepth: 15,
        correlationPatterns: [
          'coordination:swarm->coordination:agent',
          'coordination:task->coordination:agent',
          'coordination:topology->coordination:swarm',
          'coordination:agent->coordination:task',
        ],
        trackAgentCommunication: true,
        trackSwarmHealth: true,
        ...config.coordination,
      },
      agentHealthMonitoring: {
        enabled: true,
        healthCheckInterval: 30000, // 30 seconds
        agentHealthThresholds: {
          'swarm-coordinator': 0.95,
          'agent-manager': 0.9,
          orchestrator: 0.85,
          'task-distributor': 0.9,
          'topology-manager': 0.8,
        },
        swarmHealthThresholds: {
          'coordination-latency': 100, // ms
          throughput: 100, // ops/sec
          reliability: 0.95,
          'agent-availability': 0.9,
        },
        autoRecoveryEnabled: true,
        ...config.agentHealthMonitoring,
      },
      swarmOptimization: {
        enabled: true,
        optimizationInterval: 60000, // 1 minute
        performanceThresholds: {
          latency: 50, // ms
          throughput: 200, // ops/sec
          reliability: 0.98,
        },
        autoScaling: true,
        loadBalancing: true,
        ...config.swarmOptimization,
      },
      ...config,
    };

    this.logger = createLogger(`CoordinationEventAdapter:${this.name}`);
    this.logger.info(`Creating coordination event adapter: ${this.name}`);

    // Set max listeners to handle many coordination components
    this.eventEmitter.setMaxListeners(2000);
  }

  // ============================================
  // IEventManager Interface Implementation
  // ============================================

  /**
   * Start the coordination event adapter
   */
  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn(`Coordination event adapter ${this.name} is already running`);
      return;
    }

    this.logger.info(`Starting coordination event adapter: ${this.name}`);

    try {
      // Initialize coordination component integrations
      await this.initializeCoordinationIntegrations();

      // Start event processing
      this.startEventProcessing();

      // Start health monitoring if enabled
      if (this.config.agentHealthMonitoring?.enabled) {
        this.startCoordinationHealthMonitoring();
      }

      // Start correlation cleanup if enabled
      if (this.config.coordination?.enabled) {
        this.startCoordinationCorrelationCleanup();
      }

      // Start swarm optimization if enabled
      if (this.config.swarmOptimization?.enabled) {
        this.startSwarmOptimization();
      }

      this.running = true;
      this.startTime = new Date();
      this.emitInternal('start');

      this.logger.info(`Coordination event adapter started successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to start coordination event adapter ${this.name}:`, error);
      this.emitInternal('error', error);
      throw error;
    }
  }

  /**
   * Stop the coordination event adapter
   */
  async stop(): Promise<void> {
    if (!this.running) {
      this.logger.warn(`Coordination event adapter ${this.name} is not running`);
      return;
    }

    this.logger.info(`Stopping coordination event adapter: ${this.name}`);

    try {
      // Stop event processing
      this.processingEvents = false;

      // Unwrap coordination components
      await this.unwrapCoordinationComponents();

      // Clear event queues
      this.eventQueue.length = 0;

      this.running = false;
      this.emitInternal('stop');

      this.logger.info(`Coordination event adapter stopped successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to stop coordination event adapter ${this.name}:`, error);
      this.emitInternal('error', error);
      throw error;
    }
  }

  /**
   * Restart the coordination event adapter
   */
  async restart(): Promise<void> {
    this.logger.info(`Restarting coordination event adapter: ${this.name}`);
    await this.stop();
    await this.start();
  }

  /**
   * Check if the adapter is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Emit a coordination event with correlation and performance tracking
   *
   * @param event
   * @param options
   */
  async emit<T extends CoordinationEvent>(event: T, options?: EventEmissionOptions): Promise<void> {
    const startTime = Date.now();
    const eventId = event.id || this.generateEventId();

    try {
      // Validate event
      if (!this.validateCoordinationEvent(event)) {
        throw new EventEmissionError(
          this.name,
          eventId,
          new Error('Invalid coordination event format')
        );
      }

      // Apply timeout if specified
      const timeout = options?.timeout || this.config.performance?.coordinationTimeout || 30000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new EventTimeoutError(this.name, timeout, eventId)), timeout);
      });

      // Process event emission with timeout
      const emissionPromise = this.processCoordinationEventEmission(event, options);
      await Promise.race([emissionPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      // Record success metrics
      this.recordCoordinationEventMetrics({
        eventType: event.type,
        component: event.source,
        operation: event.operation,
        executionTime: duration,
        success: true,
        correlationId: event.correlationId,
        swarmId: this.extractSwarmId(event),
        agentId: this.extractAgentId(event),
        taskId: this.extractTaskId(event),
        coordinationLatency: duration,
        timestamp: new Date(),
      });

      this.eventCount++;
      this.successCount++;
      this.totalLatency += duration;

      this.eventEmitter.emit('emission', { event, success: true, duration });
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record error metrics
      this.recordCoordinationEventMetrics({
        eventType: event.type,
        component: event.source,
        operation: event.operation,
        executionTime: duration,
        success: false,
        correlationId: event.correlationId,
        swarmId: this.extractSwarmId(event),
        agentId: this.extractAgentId(event),
        taskId: this.extractTaskId(event),
        coordinationLatency: duration,
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        timestamp: new Date(),
      });

      this.eventCount++;
      this.errorCount++;
      this.totalLatency += duration;

      this.eventEmitter.emit('emission', { event, success: false, duration, error });
      this.eventEmitter.emit('error', error);

      this.logger.error(`Coordination event emission failed for ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Emit batch of coordination events with optimized processing
   *
   * @param batch
   * @param options
   */
  async emitBatch<T extends CoordinationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(
        `Emitting coordination event batch: ${batch.id} (${batch.events.length} events)`
      );

      // Process events based on strategy
      switch (this.config.processing?.strategy) {
        case 'immediate':
          await this.processCoordinationBatchImmediate(batch, options);
          break;
        case 'queued':
          await this.processCoordinationBatchQueued(batch, options);
          break;
        case 'batched':
          await this.processCoordinationBatchBatched(batch, options);
          break;
        case 'throttled':
          await this.processCoordinationBatchThrottled(batch, options);
          break;
        default:
          await this.processCoordinationBatchQueued(batch, options);
      }

      const duration = Date.now() - startTime;
      this.logger.debug(
        `Coordination event batch processed successfully: ${batch.id} in ${duration}ms`
      );
    } catch (error) {
      this.logger.error(`Coordination event batch processing failed for ${batch.id}:`, error);
      throw error;
    }
  }

  /**
   * Emit coordination event immediately without queuing
   *
   * @param event
   */
  async emitImmediate<T extends CoordinationEvent>(event: T): Promise<void> {
    await this.emit(event, { timeout: 5000 });
  }

  /**
   * Subscribe to coordination events with filtering and transformation
   *
   * @param eventTypes
   * @param listener
   * @param options
   */
  subscribe<T extends CoordinationEvent>(
    eventTypes: string | string[],
    listener: EventListener<T>,
    options?: Partial<EventSubscription<T>>
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

    const subscription: EventSubscription<T> = {
      id: subscriptionId,
      eventTypes: types,
      listener,
      filter: options?.filter,
      transform: options?.transform,
      priority: options?.priority || 'medium',
      created: new Date(),
      active: true,
      metadata: options?.metadata || {},
    };

    this.subscriptions.set(subscriptionId, subscription as EventSubscription);

    this.logger.debug(
      `Created coordination subscription ${subscriptionId} for events: ${types.join(', ')}`
    );
    this.eventEmitter.emit('subscription', { subscriptionId, subscription });

    return subscriptionId;
  }

  /**
   * Unsubscribe from coordination events
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

    this.logger.debug(`Removed coordination subscription: ${subscriptionId}`);
    return true;
  }

  /**
   * Unsubscribe all coordination listeners for event type
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
      `Removed ${removedCount} coordination subscriptions${eventType ? ` for ${eventType}` : ''}`
    );
    return removedCount;
  }

  /**
   * Add coordination event filter
   *
   * @param filter
   */
  addFilter(filter: EventFilter): string {
    const filterId = this.generateFilterId();
    this.filters.set(filterId, filter);
    this.logger.debug(`Added coordination event filter: ${filterId}`);
    return filterId;
  }

  /**
   * Remove coordination event filter
   *
   * @param filterId
   */
  removeFilter(filterId: string): boolean {
    const result = this.filters.delete(filterId);
    if (result) {
      this.logger.debug(`Removed coordination event filter: ${filterId}`);
    }
    return result;
  }

  /**
   * Add coordination event transform
   *
   * @param transform
   */
  addTransform(transform: EventTransform): string {
    const transformId = this.generateTransformId();
    this.transforms.set(transformId, transform);
    this.logger.debug(`Added coordination event transform: ${transformId}`);
    return transformId;
  }

  /**
   * Remove coordination event transform
   *
   * @param transformId
   */
  removeTransform(transformId: string): boolean {
    const result = this.transforms.delete(transformId);
    if (result) {
      this.logger.debug(`Removed coordination event transform: ${transformId}`);
    }
    return result;
  }

  /**
   * Query coordination event history with filtering and pagination
   *
   * @param options
   */
  async query<T extends CoordinationEvent>(options: EventQueryOptions): Promise<T[]> {
    let events = [...this.eventHistory] as T[];

    // Apply filters
    if (options.filter) {
      events = events.filter((event) => this.applyFilter(event, options.filter!));
    }

    // Apply sorting
    if (options.sortBy) {
      events.sort((a, b) => {
        const aVal = this.getEventSortValue(a, options.sortBy!);
        const bVal = this.getEventSortValue(b, options.sortBy!);
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    events = events.slice(offset, offset + limit);

    return events;
  }

  /**
   * Get coordination event history for specific event type
   *
   * @param eventType
   * @param limit
   */
  async getEventHistory(eventType: string, limit?: number): Promise<CoordinationEvent[]> {
    const events = this.eventHistory.filter((event) => event.type === eventType);
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Perform health check on the coordination event adapter
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const now = new Date();
    const uptime = this.startTime ? now.getTime() - this.startTime.getTime() : 0;
    const errorRate = this.eventCount > 0 ? (this.errorCount / this.eventCount) * 100 : 0;

    // Check coordination component health
    const componentHealth = await this.checkCoordinationComponentHealth();

    // Determine overall health status
    let status: EventManagerStatus['status'] = 'healthy';
    if (errorRate > 20 || !this.running) {
      status = 'unhealthy';
    } else if (
      errorRate > 10 ||
      Object.values(componentHealth).some((h) => h.status !== 'healthy')
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
        correlations: this.coordinationCorrelations.size,
        wrappedComponents: this.wrappedComponents.size,
        swarmCoordinators: this.swarmCoordinators.size,
        agentManagers: this.agentManagers.size,
        orchestrators: this.orchestrators.size,
        componentHealth,
        avgCoordinationLatency: this.eventCount > 0 ? this.totalLatency / this.eventCount : 0,
      },
    };
  }

  /**
   * Get performance metrics for the coordination adapter
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const now = new Date();
    const recentMetrics = this.metrics.filter(
      (m) => now.getTime() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );

    const avgLatency = this.eventCount > 0 ? this.totalLatency / this.eventCount : 0;
    const throughput = recentMetrics.length > 0 ? recentMetrics.length / 300 : 0; // events per second

    // Calculate percentile latencies
    const latencies = recentMetrics.map((m) => m.executionTime).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    return {
      name: this.name,
      type: this.type,
      eventsProcessed: this.eventCount,
      eventsEmitted: this.successCount,
      eventsFailed: this.errorCount,
      averageLatency: avgLatency,
      p95Latency: latencies[p95Index] || 0,
      p99Latency: latencies[p99Index] || 0,
      throughput,
      subscriptionCount: this.subscriptions.size,
      queueSize: this.eventQueue.length,
      memoryUsage: this.estimateMemoryUsage(),
      timestamp: now,
    };
  }

  /**
   * Get active coordination subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter((sub) => sub.active);
  }

  /**
   * Update adapter configuration
   *
   * @param config
   */
  updateConfig(config: Partial<CoordinationEventAdapterConfig>): void {
    this.logger.info(`Updating configuration for coordination event adapter: ${this.name}`);
    Object.assign(this.config, config);
    this.logger.info(`Configuration updated successfully for: ${this.name}`);
  }

  /**
   * Event handler management (EventEmitter compatibility)
   *
   * @param event
   * @param handler
   */
  on(
    event: 'start' | 'stop' | 'error' | 'subscription' | 'emission',
    handler: (...args: any[]) => void
  ): void {
    this.eventEmitter.on(event, handler);
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (handler) {
      this.eventEmitter.off(event, handler);
    } else {
      this.eventEmitter.removeAllListeners(event);
    }
  }

  once(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.once(event, handler);
  }

  /**
   * Cleanup and destroy the adapter
   */
  async destroy(): Promise<void> {
    this.logger.info(`Destroying coordination event adapter: ${this.name}`);

    try {
      // Stop the adapter if still running
      if (this.running) {
        await this.stop();
      }

      // Clear all data structures
      this.subscriptions.clear();
      this.filters.clear();
      this.transforms.clear();
      this.coordinationCorrelations.clear();
      this.coordinationHealth.clear();
      this.metrics.length = 0;
      this.eventHistory.length = 0;
      this.eventQueue.length = 0;
      this.wrappedComponents.clear();
      this.swarmCoordinators.clear();
      this.agentManagers.clear();
      this.orchestrators.clear();
      this.swarmMetrics.clear();
      this.agentMetrics.clear();
      this.taskMetrics.clear();
      this.coordinationPatterns.clear();

      // Remove all event listeners
      this.eventEmitter.removeAllListeners();

      this.logger.info(`Coordination event adapter destroyed successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to destroy coordination event adapter ${this.name}:`, error);
      throw error;
    }
  }

  // ============================================
  // Coordination-Specific Event Management Methods
  // ============================================

  /**
   * Emit swarm coordination event with enhanced tracking
   *
   * @param event
   */
  async emitSwarmCoordinationEvent(
    event: Omit<CoordinationEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    const coordinationEvent: CoordinationEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      priority: event.priority || EventPriorityMap[event.type] || 'medium',
      correlationId: event.correlationId || this.generateCorrelationId(),
    };

    // Start event correlation if enabled
    if (this.config.coordination?.enabled) {
      this.startCoordinationEventCorrelation(coordinationEvent);
    }

    await this.emit(coordinationEvent);
  }

  /**
   * Subscribe to swarm lifecycle events with convenience
   *
   * @param listener
   */
  subscribeSwarmLifecycleEvents(listener: EventListener<CoordinationEvent>): string {
    return this.subscribe(['coordination:swarm'], listener);
  }

  /**
   * Subscribe to agent management events
   *
   * @param listener
   */
  subscribeAgentManagementEvents(listener: EventListener<CoordinationEvent>): string {
    return this.subscribe(['coordination:agent'], listener);
  }

  /**
   * Subscribe to task orchestration events
   *
   * @param listener
   */
  subscribeTaskOrchestrationEvents(listener: EventListener<CoordinationEvent>): string {
    return this.subscribe(['coordination:task'], listener);
  }

  /**
   * Subscribe to topology management events
   *
   * @param listener
   */
  subscribeTopologyEvents(listener: EventListener<CoordinationEvent>): string {
    return this.subscribe(['coordination:topology'], listener);
  }

  /**
   * Get coordination health status for all components
   */
  async getCoordinationHealthStatus(): Promise<Record<string, CoordinationHealthEntry>> {
    const healthStatus: Record<string, CoordinationHealthEntry> = {};

    for (const [component, health] of this.coordinationHealth.entries()) {
      healthStatus[component] = { ...health };
    }

    return healthStatus;
  }

  /**
   * Get correlated coordination events for a specific correlation ID
   *
   * @param correlationId
   */
  getCoordinationCorrelatedEvents(correlationId: string): CoordinationCorrelation | null {
    return this.coordinationCorrelations.get(correlationId) || null;
  }

  /**
   * Get active coordination correlations
   */
  getActiveCoordinationCorrelations(): CoordinationCorrelation[] {
    return Array.from(this.coordinationCorrelations.values()).filter((c) => c.status === 'active');
  }

  /**
   * Get swarm performance metrics
   *
   * @param swarmId
   */
  getSwarmMetrics(swarmId?: string): Record<string, any> {
    if (swarmId) {
      return this.swarmMetrics.get(swarmId) || {};
    }
    return Object.fromEntries(this.swarmMetrics.entries());
  }

  /**
   * Get agent performance metrics
   *
   * @param agentId
   */
  getAgentMetrics(agentId?: string): Record<string, any> {
    if (agentId) {
      return this.agentMetrics.get(agentId) || {};
    }
    return Object.fromEntries(this.agentMetrics.entries());
  }

  /**
   * Get task execution metrics
   *
   * @param taskId
   */
  getTaskMetrics(taskId?: string): Record<string, any> {
    if (taskId) {
      return this.taskMetrics.get(taskId) || {};
    }
    return Object.fromEntries(this.taskMetrics.entries());
  }

  /**
   * Force health check on all wrapped coordination components
   */
  async performCoordinationHealthCheck(): Promise<Record<string, CoordinationHealthEntry>> {
    const healthResults: Record<string, CoordinationHealthEntry> = {};

    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      try {
        const startTime = Date.now();

        // Perform component-specific health check
        const isHealthy = wrapped.isActive;
        let coordinationLatency = 0;
        let throughput = 0;
        let reliability = 1.0;

        // Get component-specific health data if available
        if (wrapped.component && typeof wrapped.component.getMetrics === 'function') {
          const metrics = await wrapped.component.getMetrics();
          coordinationLatency = metrics.averageLatency || 0;
          throughput = metrics.throughput || 0;
          reliability = 1 - (metrics.errorRate || 0);
        }

        const responseTime = Date.now() - startTime;
        const threshold =
          this.config.agentHealthMonitoring?.agentHealthThresholds?.[componentName] || 0.8;
        const healthScore =
          reliability * (coordinationLatency < 100 ? 1 : 0.5) * (throughput > 10 ? 1 : 0.5);

        const healthEntry: CoordinationHealthEntry = {
          component: componentName,
          componentType: wrapped.componentType,
          status:
            healthScore >= threshold
              ? 'healthy'
              : healthScore >= threshold * 0.7
                ? 'degraded'
                : 'unhealthy',
          lastCheck: new Date(),
          consecutiveFailures: isHealthy
            ? 0
            : (this.coordinationHealth.get(componentName)?.consecutiveFailures || 0) + 1,
          coordinationLatency,
          throughput,
          reliability,
          resourceUsage: {
            cpu: 0, // Would be populated from actual metrics
            memory: 0,
            network: 0,
          },
          metadata: {
            healthScore,
            threshold,
            isActive: wrapped.isActive,
            responseTime,
          },
        };

        // Update component-specific metrics
        if (wrapped.componentType === 'swarm') {
          healthEntry.agentCount = this.getActiveAgentCount(componentName);
        } else if (wrapped.componentType === 'orchestrator') {
          healthEntry.activeTaskCount = this.getActiveTaskCount(componentName);
        }

        this.coordinationHealth.set(componentName, healthEntry);
        healthResults[componentName] = healthEntry;
      } catch (error) {
        const healthEntry: CoordinationHealthEntry = {
          component: componentName,
          componentType: wrapped.componentType,
          status: 'unhealthy',
          lastCheck: new Date(),
          consecutiveFailures:
            (this.coordinationHealth.get(componentName)?.consecutiveFailures || 0) + 1,
          coordinationLatency: 0,
          throughput: 0,
          reliability: 0,
          resourceUsage: { cpu: 0, memory: 0, network: 0 },
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };

        this.coordinationHealth.set(componentName, healthEntry);
        healthResults[componentName] = healthEntry;
      }
    }

    return healthResults;
  }

  // ============================================
  // Internal Implementation Methods
  // ============================================

  /**
   * Initialize coordination component integrations
   */
  private async initializeCoordinationIntegrations(): Promise<void> {
    this.logger.debug('Initializing coordination component integrations');

    // Wrap SwarmCoordinator if enabled
    if (this.config.swarmCoordination?.enabled) {
      await this.wrapSwarmCoordinators();
    }

    // Wrap AgentManager if enabled
    if (this.config.agentManagement?.enabled) {
      await this.wrapAgentManagers();
    }

    // Wrap Orchestrators if enabled
    if (this.config.taskOrchestration?.enabled) {
      await this.wrapOrchestrators();
    }

    // Wrap Protocol Managers if enabled
    if (this.config.protocolManagement?.enabled) {
      await this.wrapProtocolManagers();
    }

    this.logger.debug(`Wrapped ${this.wrappedComponents.size} coordination components`);
  }

  /**
   * Wrap SwarmCoordinator events with UEL integration
   */
  private async wrapSwarmCoordinators(): Promise<void> {
    const coordinators = this.config.swarmCoordination?.coordinators || ['default'];

    for (const coordinatorName of coordinators) {
      const wrapper = new EventEmitter();
      const wrappedComponent: WrappedCoordinationComponent = {
        component: null, // Would be actual SwarmCoordinator instance
        componentType: 'swarm',
        wrapper,
        originalMethods: new Map(),
        eventMappings: new Map([
          ['swarm:initialized', 'coordination:swarm'],
          ['swarm:shutdown', 'coordination:swarm'],
          ['agent:added', 'coordination:agent'],
          ['agent:removed', 'coordination:agent'],
          ['task:assigned', 'coordination:task'],
          ['task:completed', 'coordination:task'],
          ['coordination:performance', 'coordination:swarm'],
          ['coordination:error', 'coordination:swarm'],
        ]),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          coordinationCount: 0,
          errorCount: 0,
          avgLatency: 0,
        },
      };

      // Set up event forwarding from SwarmCoordinator to UEL
      wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
        wrapper.on(originalEvent, (data) => {
          const coordinationEvent: CoordinationEvent = {
            id: this.generateEventId(),
            timestamp: new Date(),
            source: `swarm-coordinator-${coordinatorName}`,
            type: uelEvent as any,
            operation: this.extractCoordinationOperation(originalEvent),
            targetId: this.extractTargetId(data),
            priority: EventPriorityMap[uelEvent] || 'medium',
            correlationId: this.generateCorrelationId(),
            details: {
              ...data,
              agentCount: data.agentCount,
              topology: data.topology,
              metrics: data.metrics,
            },
            metadata: { originalEvent, data, coordinatorName },
          };

          this.eventEmitter.emit(uelEvent, coordinationEvent);
          this.updateComponentHealthMetrics(coordinatorName, true);
        });
      });

      this.wrappedComponents.set(`swarm-coordinator-${coordinatorName}`, wrappedComponent);
      this.logger.debug(`Wrapped SwarmCoordinator events: ${coordinatorName}`);
    }
  }

  /**
   * Wrap AgentManager events with UEL integration
   */
  private async wrapAgentManagers(): Promise<void> {
    const wrapper = new EventEmitter();
    const wrappedComponent: WrappedCoordinationComponent = {
      component: null, // Would be actual AgentManager instance
      componentType: 'agent',
      wrapper,
      originalMethods: new Map(),
      eventMappings: new Map([
        ['agent-manager:initialized', 'coordination:agent'],
        ['agent-manager:shutdown', 'coordination:agent'],
        ['agent:created', 'coordination:agent'],
        ['agent:started', 'coordination:agent'],
        ['agent:stopped', 'coordination:agent'],
        ['agent:removed', 'coordination:agent'],
        ['agent:restarted', 'coordination:agent'],
        ['agent:status-changed', 'coordination:agent'],
        ['agent:heartbeat-timeout', 'coordination:agent'],
        ['agent:process-exit', 'coordination:agent'],
        ['agent:process-error', 'coordination:agent'],
        ['pool:created', 'coordination:agent'],
        ['pool:scaled', 'coordination:agent'],
      ]),
      isActive: true,
      healthMetrics: {
        lastSeen: new Date(),
        coordinationCount: 0,
        errorCount: 0,
        avgLatency: 0,
      },
    };

    // Set up event forwarding
    wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
      wrapper.on(originalEvent, (data) => {
        const coordinationEvent: CoordinationEvent = {
          id: this.generateEventId(),
          timestamp: new Date(),
          source: 'agent-manager',
          type: uelEvent as any,
          operation: this.extractCoordinationOperation(originalEvent),
          targetId: data.agentId || data.poolId || 'agent-manager',
          priority: this.determineEventPriority(originalEvent),
          correlationId: this.generateCorrelationId(),
          details: {
            ...data,
            agentCount: data.totalAgents,
            metrics: data.metrics,
          },
          metadata: { originalEvent, data },
        };

        this.eventEmitter.emit(uelEvent, coordinationEvent);
        this.updateComponentHealthMetrics('agent-manager', !originalEvent.includes('error'));
      });
    });

    this.wrappedComponents.set('agent-manager', wrappedComponent);
    this.logger.debug('Wrapped AgentManager events');
  }

  /**
   * Wrap Orchestrator events with UEL integration
   */
  private async wrapOrchestrators(): Promise<void> {
    const wrapper = new EventEmitter();
    const wrappedComponent: WrappedCoordinationComponent = {
      component: null, // Would be actual Orchestrator instance
      componentType: 'orchestrator',
      wrapper,
      originalMethods: new Map(),
      eventMappings: new Map([
        ['initialized', 'coordination:task'],
        ['shutdown', 'coordination:task'],
        ['taskSubmitted', 'coordination:task'],
        ['taskCompleted', 'coordination:task'],
        ['taskFailed', 'coordination:task'],
      ]),
      isActive: true,
      healthMetrics: {
        lastSeen: new Date(),
        coordinationCount: 0,
        errorCount: 0,
        avgLatency: 0,
      },
    };

    // Set up event forwarding
    wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
      wrapper.on(originalEvent, (data) => {
        const coordinationEvent: CoordinationEvent = {
          id: this.generateEventId(),
          timestamp: new Date(),
          source: 'orchestrator',
          type: uelEvent as any,
          operation: this.extractCoordinationOperation(originalEvent),
          targetId: data.taskId || data.task?.id || 'orchestrator',
          priority: this.determineEventPriority(originalEvent),
          correlationId: this.generateCorrelationId(),
          details: {
            ...data,
            taskType: data.task?.type,
            progress: data.task?.progress,
            assignedTo: data.task?.assignedTo,
          },
          metadata: { originalEvent, data },
        };

        this.eventEmitter.emit(uelEvent, coordinationEvent);
        this.updateComponentHealthMetrics('orchestrator', !originalEvent.includes('Failed'));
      });
    });

    this.wrappedComponents.set('orchestrator', wrappedComponent);
    this.logger.debug('Wrapped Orchestrator events');
  }

  /**
   * Wrap Protocol Manager events with UEL integration
   */
  private async wrapProtocolManagers(): Promise<void> {
    const protocolTypes = ['topology', 'lifecycle', 'communication'];

    for (const protocolType of protocolTypes) {
      const wrapper = new EventEmitter();
      const wrappedComponent: WrappedCoordinationComponent = {
        component: null, // Would be actual protocol manager instance
        componentType: 'protocol',
        wrapper,
        originalMethods: new Map(),
        eventMappings: new Map([
          ['protocol:initialized', 'coordination:topology'],
          ['protocol:updated', 'coordination:topology'],
          ['protocol:error', 'coordination:topology'],
          ['topology:changed', 'coordination:topology'],
          ['lifecycle:started', 'coordination:agent'],
          ['lifecycle:stopped', 'coordination:agent'],
          ['communication:established', 'coordination:topology'],
          ['communication:lost', 'coordination:topology'],
        ]),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          coordinationCount: 0,
          errorCount: 0,
          avgLatency: 0,
        },
      };

      // Set up event forwarding
      wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
        wrapper.on(originalEvent, (data) => {
          const coordinationEvent: CoordinationEvent = {
            id: this.generateEventId(),
            timestamp: new Date(),
            source: `${protocolType}-protocol`,
            type: uelEvent as any,
            operation: this.extractCoordinationOperation(originalEvent),
            targetId: data.protocolId || data.agentId || `${protocolType}-protocol`,
            priority: this.determineEventPriority(originalEvent),
            correlationId: this.generateCorrelationId(),
            details: {
              ...data,
              protocolType,
              topology: data.topology,
            },
            metadata: { originalEvent, data, protocolType },
          };

          this.eventEmitter.emit(uelEvent, coordinationEvent);
          this.updateComponentHealthMetrics(
            `${protocolType}-protocol`,
            !originalEvent.includes('error')
          );
        });
      });

      this.wrappedComponents.set(`${protocolType}-protocol`, wrappedComponent);
      this.logger.debug(`Wrapped ${protocolType} protocol events`);
    }
  }

  /**
   * Unwrap all coordination components
   */
  private async unwrapCoordinationComponents(): Promise<void> {
    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      try {
        // Restore original methods if they were wrapped
        wrapped.originalMethods.forEach((originalMethod, methodName) => {
          if (wrapped.component?.[methodName]) {
            wrapped.component[methodName] = originalMethod;
          }
        });

        // Remove event listeners
        wrapped.wrapper.removeAllListeners();
        wrapped.isActive = false;

        this.logger.debug(`Unwrapped coordination component: ${componentName}`);
      } catch (error) {
        this.logger.warn(`Failed to unwrap coordination component ${componentName}:`, error);
      }
    }

    this.wrappedComponents.clear();
  }

  /**
   * Process coordination event emission with correlation and filtering
   *
   * @param event
   * @param options
   */
  private async processCoordinationEventEmission<T extends CoordinationEvent>(
    event: T,
    _options?: EventEmissionOptions
  ): Promise<void> {
    // Add to event history
    this.eventHistory.push(event);

    // Limit history size
    if (this.eventHistory.length > 15000) {
      this.eventHistory = this.eventHistory.slice(-7500);
    }

    // Handle event correlation
    if (this.config.coordination?.enabled && event.correlationId) {
      this.updateCoordinationEventCorrelation(event);
    }

    // Update coordination-specific metrics
    this.updateCoordinationMetrics(event);

    // Apply global filters
    for (const filter of this.filters.values()) {
      if (!this.applyFilter(event, filter)) {
        this.logger.debug(`Coordination event ${event.id} filtered out`);
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
      if (!subscription.active || !subscription.eventTypes.includes(transformedEvent.type)) {
        continue;
      }

      try {
        // Apply subscription-specific filters
        if (subscription.filter && !this.applyFilter(transformedEvent, subscription.filter)) {
          continue;
        }

        // Apply subscription-specific transforms
        let subscriptionEvent = transformedEvent;
        if (subscription.transform) {
          subscriptionEvent = await this.applyTransform(transformedEvent, subscription.transform);
        }

        // Call the listener
        await subscription.listener(subscriptionEvent);
      } catch (error) {
        this.logger.error(
          `Coordination subscription listener error for ${subscription.id}:`,
          error
        );
        this.eventEmitter.emit('subscription-error', { subscriptionId: subscription.id, error });
      }
    }

    // Also emit to the event emitter for compatibility
    this.eventEmitter.emit(transformedEvent.type, transformedEvent);
    this.eventEmitter.emit('*', transformedEvent); // Wildcard listeners
  }

  /**
   * Start event processing loop for coordination events
   */
  private startEventProcessing(): void {
    this.processingEvents = true;

    const processQueue = async () => {
      if (!this.processingEvents || this.eventQueue.length === 0) {
        setTimeout(processQueue, 100);
        return;
      }

      const event = this.eventQueue.shift();
      if (event) {
        try {
          await this.processCoordinationEventEmission(event);
        } catch (error) {
          this.logger.error('Coordination event processing error:', error);
        }
      }

      // Process next event
      setImmediate(processQueue);
    };

    processQueue();
  }

  /**
   * Start health monitoring for coordination components
   */
  private startCoordinationHealthMonitoring(): void {
    const interval = this.config.agentHealthMonitoring?.healthCheckInterval || 30000;

    setInterval(async () => {
      try {
        await this.performCoordinationHealthCheck();

        // Emit health status events for unhealthy components
        for (const [component, health] of this.coordinationHealth.entries()) {
          if (health.status !== 'healthy') {
            await this.emitSwarmCoordinationEvent({
              source: component,
              type: 'coordination:swarm',
              operation: 'coordinate',
              targetId: component,
              details: {
                healthScore: health.reliability,
                coordinationLatency: health.coordinationLatency,
                throughput: health.throughput,
                consecutiveFailures: health.consecutiveFailures,
                componentType: health.componentType,
              },
            });
          }
        }
      } catch (error) {
        this.logger.error('Coordination health monitoring error:', error);
      }
    }, interval);
  }

  /**
   * Start coordination correlation cleanup to prevent memory leaks
   */
  private startCoordinationCorrelationCleanup(): void {
    const cleanupInterval = 60000; // 1 minute
    const correlationTTL = this.config.coordination?.correlationTTL || 300000; // 5 minutes

    setInterval(() => {
      const now = Date.now();
      const expiredCorrelations: string[] = [];

      for (const [correlationId, correlation] of this.coordinationCorrelations.entries()) {
        if (now - correlation.lastUpdate.getTime() > correlationTTL) {
          expiredCorrelations.push(correlationId);
        }
      }

      expiredCorrelations.forEach((id) => {
        const correlation = this.coordinationCorrelations.get(id);
        if (correlation) {
          correlation.status = 'timeout';
          this.coordinationCorrelations.delete(id);
        }
      });

      if (expiredCorrelations.length > 0) {
        this.logger.debug(
          `Cleaned up ${expiredCorrelations.length} expired coordination correlations`
        );
      }
    }, cleanupInterval);
  }

  /**
   * Start swarm optimization if enabled
   */
  private startSwarmOptimization(): void {
    const interval = this.config.swarmOptimization?.optimizationInterval || 60000;

    setInterval(async () => {
      if (!this.config.swarmOptimization?.enabled) return;

      try {
        // Analyze swarm performance
        const swarmHealth = await this.performCoordinationHealthCheck();

        // Check if optimization is needed
        for (const [componentName, health] of Object.entries(swarmHealth)) {
          const thresholds = this.config.swarmOptimization.performanceThresholds;

          if (
            health.coordinationLatency > thresholds.latency ||
            health.throughput < thresholds.throughput ||
            health.reliability < thresholds.reliability
          ) {
            this.logger.info(`Triggering optimization for ${componentName}`, {
              latency: health.coordinationLatency,
              throughput: health.throughput,
              reliability: health.reliability,
            });

            // Emit optimization event
            await this.emitSwarmCoordinationEvent({
              source: 'swarm-optimizer',
              type: 'coordination:swarm',
              operation: 'coordinate',
              targetId: componentName,
              details: {
                optimizationType: 'performance',
                metrics: {
                  latency: health.coordinationLatency,
                  throughput: health.throughput,
                  reliability: health.reliability,
                },
              },
            });
          }
        }
      } catch (error) {
        this.logger.error('Swarm optimization error:', error);
      }
    }, interval);
  }

  /**
   * Start coordination event correlation for tracking related events
   *
   * @param event
   */
  private startCoordinationEventCorrelation(event: CoordinationEvent): void {
    const correlationId = event.correlationId || this.generateCorrelationId();

    if (!this.coordinationCorrelations.has(correlationId)) {
      const correlation: CoordinationCorrelation = {
        correlationId,
        events: [event],
        startTime: new Date(),
        lastUpdate: new Date(),
        swarmId: this.extractSwarmId(event),
        agentIds: this.extractAgentIds(event),
        taskIds: this.extractTaskIds(event),
        operation: event.operation,
        status: 'active',
        performance: {
          totalLatency: 0,
          coordinationEfficiency: 1.0,
          resourceUtilization: 0,
        },
        metadata: {},
      };

      this.coordinationCorrelations.set(correlationId, correlation);
    } else {
      this.updateCoordinationEventCorrelation(event);
    }
  }

  /**
   * Update existing coordination event correlation
   *
   * @param event
   */
  private updateCoordinationEventCorrelation(event: CoordinationEvent): void {
    const correlationId = event.correlationId;
    if (!correlationId) return;

    const correlation = this.coordinationCorrelations.get(correlationId);
    if (correlation) {
      correlation.events.push(event);
      correlation.lastUpdate = new Date();

      // Update agent and task tracking
      const agentId = this.extractAgentId(event);
      const taskId = this.extractTaskId(event);

      if (agentId && !correlation.agentIds.includes(agentId)) {
        correlation.agentIds.push(agentId);
      }

      if (taskId && !correlation.taskIds.includes(taskId)) {
        correlation.taskIds.push(taskId);
      }

      // Update performance metrics
      const totalTime = correlation.lastUpdate.getTime() - correlation.startTime.getTime();
      correlation.performance.totalLatency = totalTime;
      correlation.performance.coordinationEfficiency =
        this.calculateCoordinationEfficiency(correlation);

      // Check for completion patterns
      if (this.isCoordinationCorrelationComplete(correlation)) {
        correlation.status = 'completed';
      }
    }
  }

  /**
   * Check if coordination correlation is complete based on patterns
   *
   * @param correlation
   */
  private isCoordinationCorrelationComplete(correlation: CoordinationCorrelation): boolean {
    const patterns = this.config.coordination?.correlationPatterns || [];

    for (const pattern of patterns) {
      const [startEvent, endEvent] = pattern.split('->');
      const hasStart = correlation.events.some((e) => e.type === startEvent);
      const hasEnd = correlation.events.some((e) => e.type === endEvent);

      if (hasStart && hasEnd) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate coordination efficiency for correlation
   *
   * @param correlation
   */
  private calculateCoordinationEfficiency(correlation: CoordinationCorrelation): number {
    const events = correlation.events;
    if (events.length < 2) return 1.0;

    // Calculate efficiency based on event timing and success rate
    const successfulEvents = events.filter((e) => e.details?.success !== false).length;
    const timeEfficiency = Math.max(0, 1 - correlation.performance.totalLatency / 60000); // Penalize long correlations
    const successRate = successfulEvents / events.length;

    return (timeEfficiency + successRate) / 2;
  }

  /**
   * Check health of all coordination components
   */
  private async checkCoordinationComponentHealth(): Promise<
    Record<string, CoordinationHealthEntry>
  > {
    const componentHealth: Record<string, CoordinationHealthEntry> = {};

    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      const existing = this.coordinationHealth.get(componentName);
      const healthEntry: CoordinationHealthEntry = existing || {
        component: componentName,
        componentType: wrapped.componentType,
        status: wrapped.isActive ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        consecutiveFailures: 0,
        coordinationLatency: wrapped.healthMetrics.avgLatency,
        throughput: 0,
        reliability: wrapped.healthMetrics.errorCount === 0 ? 1.0 : 0.8,
        resourceUsage: { cpu: 0, memory: 0, network: 0 },
        metadata: {},
      };

      componentHealth[componentName] = healthEntry;
    }

    return componentHealth;
  }

  /**
   * Batch processing methods for different strategies
   *
   * @param batch
   * @param options
   */
  private async processCoordinationBatchImmediate<T extends CoordinationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    await Promise.all(batch.events.map((event) => this.emit(event, options)));
  }

  private async processCoordinationBatchQueued<T extends CoordinationEvent>(
    batch: EventBatch<T>,
    _options?: EventEmissionOptions
  ): Promise<void> {
    this.eventQueue.push(...(batch.events as CoordinationEvent[]));
  }

  private async processCoordinationBatchBatched<T extends CoordinationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const batchSize = this.config.processing?.batchSize || 50;

    for (let i = 0; i < batch.events.length; i += batchSize) {
      const chunk = batch.events.slice(i, i + batchSize);
      await Promise.all(chunk.map((event) => this.emit(event, options)));
    }
  }

  private async processCoordinationBatchThrottled<T extends CoordinationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const throttleMs = this.config.processing?.throttleMs || 100;

    for (const event of batch.events) {
      await this.emit(event, options);
      await new Promise((resolve) => setTimeout(resolve, throttleMs));
    }
  }

  /**
   * Utility methods for coordination event processing
   *
   * @param event
   */
  private validateCoordinationEvent(event: CoordinationEvent): boolean {
    return !!(
      event.id &&
      event.timestamp &&
      event.source &&
      event.type &&
      event.operation &&
      event.targetId
    );
  }

  private applyFilter(event: CoordinationEvent, filter: EventFilter): boolean {
    // Type filter
    if (filter.types && !filter.types.includes(event.type)) {
      return false;
    }

    // Source filter
    if (filter.sources && !filter.sources.includes(event.source)) {
      return false;
    }

    // Priority filter
    if (filter.priorities && event.priority && !filter.priorities.includes(event.priority)) {
      return false;
    }

    // Metadata filter
    if (filter.metadata) {
      for (const [key, value] of Object.entries(filter.metadata)) {
        if (!event.metadata || event.metadata[key] !== value) {
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

  private async applyTransform<T extends CoordinationEvent>(
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
      throw new Error(`Coordination event transformation validation failed for ${event.id}`);
    }

    return transformedEvent;
  }

  private getEventSortValue(event: CoordinationEvent, sortBy: string): any {
    switch (sortBy) {
      case 'timestamp':
        return event.timestamp.getTime();
      case 'priority': {
        const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorities[event.priority || 'medium'];
      }
      case 'type':
        return event.type;
      case 'source':
        return event.source;
      default:
        return event.timestamp.getTime();
    }
  }

  private extractCoordinationOperation(eventType: string): CoordinationEvent['operation'] {
    if (eventType.includes('init') || eventType.includes('start') || eventType.includes('created'))
      return 'init';
    if (eventType.includes('spawn') || eventType.includes('added')) return 'spawn';
    if (
      eventType.includes('destroy') ||
      eventType.includes('removed') ||
      eventType.includes('shutdown')
    )
      return 'destroy';
    if (eventType.includes('assign') || eventType.includes('distribute')) return 'distribute';
    if (eventType.includes('complete')) return 'complete';
    if (eventType.includes('fail') || eventType.includes('error')) return 'fail';
    return 'coordinate';
  }

  private extractTargetId(data: any): string {
    return data?.swarmId || data?.agentId || data?.taskId || data?.id || 'unknown';
  }

  private extractSwarmId(event: CoordinationEvent): string | undefined {
    return event.details?.swarmId || event.metadata?.swarmId;
  }

  private extractAgentId(event: CoordinationEvent): string | undefined {
    return (
      event.details?.agentId ||
      event.metadata?.agentId ||
      (event.targetId.includes('agent') ? event.targetId : undefined)
    );
  }

  private extractTaskId(event: CoordinationEvent): string | undefined {
    return (
      event.details?.taskId ||
      event.metadata?.taskId ||
      (event.targetId.includes('task') ? event.targetId : undefined)
    );
  }

  private extractAgentIds(event: CoordinationEvent): string[] {
    const agentId = this.extractAgentId(event);
    return agentId ? [agentId] : [];
  }

  private extractTaskIds(event: CoordinationEvent): string[] {
    const taskId = this.extractTaskId(event);
    return taskId ? [taskId] : [];
  }

  private determineEventPriority(eventType: string): EventPriority {
    if (eventType.includes('error') || eventType.includes('fail') || eventType.includes('timeout'))
      return 'high';
    if (eventType.includes('start') || eventType.includes('init') || eventType.includes('shutdown'))
      return 'high';
    if (eventType.includes('complete') || eventType.includes('success')) return 'medium';
    return 'medium';
  }

  private updateComponentHealthMetrics(componentName: string, success: boolean): void {
    const wrapped = this.wrappedComponents.get(componentName);
    if (wrapped) {
      wrapped.healthMetrics.lastSeen = new Date();
      wrapped.healthMetrics.coordinationCount++;
      if (!success) {
        wrapped.healthMetrics.errorCount++;
      }
    }
  }

  private updateCoordinationMetrics(event: CoordinationEvent): void {
    // Update swarm metrics
    const swarmId = this.extractSwarmId(event);
    if (swarmId && event.type === 'coordination:swarm') {
      const metrics = this.swarmMetrics.get(swarmId) || { eventCount: 0, lastUpdate: new Date() };
      metrics.eventCount++;
      metrics.lastUpdate = new Date();
      this.swarmMetrics.set(swarmId, metrics);
    }

    // Update agent metrics
    const agentId = this.extractAgentId(event);
    if (agentId && event.type === 'coordination:agent') {
      const metrics = this.agentMetrics.get(agentId) || { eventCount: 0, lastUpdate: new Date() };
      metrics.eventCount++;
      metrics.lastUpdate = new Date();
      this.agentMetrics.set(agentId, metrics);
    }

    // Update task metrics
    const taskId = this.extractTaskId(event);
    if (taskId && event.type === 'coordination:task') {
      const metrics = this.taskMetrics.get(taskId) || { eventCount: 0, lastUpdate: new Date() };
      metrics.eventCount++;
      metrics.lastUpdate = new Date();
      this.taskMetrics.set(taskId, metrics);
    }
  }

  private getActiveAgentCount(_componentName: string): number {
    // Would query actual component for agent count
    return this.agentMetrics.size;
  }

  private getActiveTaskCount(_componentName: string): number {
    // Would query actual component for active task count
    return this.taskMetrics.size;
  }

  private recordCoordinationEventMetrics(metrics: CoordinationEventMetrics): void {
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
    size += this.subscriptions.size * 300;

    // Estimate event history memory
    size += this.eventHistory.length * 800;

    // Estimate correlations memory
    for (const correlation of this.coordinationCorrelations.values()) {
      size += correlation.events.length * 500;
    }

    // Estimate metrics memory
    size += this.metrics.length * 200;

    // Estimate coordination-specific memory
    size += this.swarmMetrics.size * 100;
    size += this.agentMetrics.size * 100;
    size += this.taskMetrics.size * 100;

    return size;
  }

  /**
   * ID generation methods
   */
  private generateEventId(): string {
    return `coord-evt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateSubscriptionId(): string {
    return `coord-sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateFilterId(): string {
    return `coord-flt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateTransformId(): string {
    return `coord-txf-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateCorrelationId(): string {
    return `coord-cor-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Emit wrapper for internal use
   *
   * @param event
   * @param data
   */
  private emitInternal(event: string, data?: any): void {
    this.eventEmitter.emit(event, data);
  }
}

/**
 * Factory function for creating CoordinationEventAdapter instances
 *
 * @param config
 */
export function createCoordinationEventAdapter(
  config: CoordinationEventAdapterConfig
): CoordinationEventAdapter {
  return new CoordinationEventAdapter(config);
}

/**
 * Helper function for creating default coordination event adapter configuration
 *
 * @param name
 * @param overrides
 */
export function createDefaultCoordinationEventAdapterConfig(
  name: string,
  overrides?: Partial<CoordinationEventAdapterConfig>
): CoordinationEventAdapterConfig {
  return {
    name,
    type: EventManagerTypes.COORDINATION,
    processing: {
      strategy: 'immediate',
      queueSize: 2000,
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
      enableProfiling: true,
    },
    swarmCoordination: {
      enabled: true,
      wrapLifecycleEvents: true,
      wrapPerformanceEvents: true,
      wrapTopologyEvents: true,
      wrapHealthEvents: true,
      coordinators: ['default', 'sparc'],
    },
    agentManagement: {
      enabled: true,
      wrapAgentEvents: true,
      wrapHealthEvents: true,
      wrapRegistryEvents: true,
      wrapLifecycleEvents: true,
    },
    taskOrchestration: {
      enabled: true,
      wrapTaskEvents: true,
      wrapDistributionEvents: true,
      wrapExecutionEvents: true,
      wrapCompletionEvents: true,
    },
    protocolManagement: {
      enabled: true,
      wrapCommunicationEvents: true,
      wrapTopologyEvents: true,
      wrapLifecycleEvents: true,
      wrapCoordinationEvents: true,
    },
    performance: {
      enableSwarmCorrelation: true,
      enableAgentTracking: true,
      enableTaskMetrics: true,
      maxConcurrentCoordinations: 100,
      coordinationTimeout: 30000,
      enablePerformanceTracking: true,
    },
    coordination: {
      enabled: true,
      strategy: 'swarm',
      correlationTTL: 300000,
      maxCorrelationDepth: 15,
      correlationPatterns: [
        'coordination:swarm->coordination:agent',
        'coordination:task->coordination:agent',
        'coordination:topology->coordination:swarm',
        'coordination:agent->coordination:task',
      ],
      trackAgentCommunication: true,
      trackSwarmHealth: true,
    },
    agentHealthMonitoring: {
      enabled: true,
      healthCheckInterval: 30000,
      agentHealthThresholds: {
        'swarm-coordinator': 0.95,
        'agent-manager': 0.9,
        orchestrator: 0.85,
        'task-distributor': 0.9,
        'topology-manager': 0.8,
      },
      swarmHealthThresholds: {
        'coordination-latency': 100,
        throughput: 100,
        reliability: 0.95,
        'agent-availability': 0.9,
      },
      autoRecoveryEnabled: true,
    },
    swarmOptimization: {
      enabled: true,
      optimizationInterval: 60000,
      performanceThresholds: {
        latency: 50,
        throughput: 200,
        reliability: 0.98,
      },
      autoScaling: true,
      loadBalancing: true,
    },
    ...overrides,
  };
}

/**
 * Helper functions for coordination event operations
 */
export const CoordinationEventHelpers = {
  /**
   * Create swarm initialization event
   *
   * @param swarmId
   * @param topology
   * @param details
   */
  createSwarmInitEvent(
    swarmId: string,
    topology: string,
    details?: any
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'swarm-coordinator',
      type: 'coordination:swarm',
      operation: 'init',
      targetId: swarmId,
      priority: 'high',
      details: {
        ...details,
        topology,
      },
    };
  },

  /**
   * Create agent spawn event
   *
   * @param agentId
   * @param swarmId
   * @param details
   */
  createAgentSpawnEvent(
    agentId: string,
    swarmId: string,
    details?: any
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'agent-manager',
      type: 'coordination:agent',
      operation: 'spawn',
      targetId: agentId,
      priority: 'high',
      details: {
        ...details,
        swarmId,
      },
    };
  },

  /**
   * Create task distribution event
   *
   * @param taskId
   * @param assignedTo
   * @param details
   */
  createTaskDistributionEvent(
    taskId: string,
    assignedTo: string[],
    details?: any
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'orchestrator',
      type: 'coordination:task',
      operation: 'distribute',
      targetId: taskId,
      priority: 'medium',
      details: {
        ...details,
        assignedTo,
      },
    };
  },

  /**
   * Create topology change event
   *
   * @param swarmId
   * @param topology
   * @param details
   */
  createTopologyChangeEvent(
    swarmId: string,
    topology: string,
    details?: any
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: 'topology-manager',
      type: 'coordination:topology',
      operation: 'coordinate',
      targetId: swarmId,
      priority: 'medium',
      details: {
        ...details,
        topology,
      },
    };
  },

  /**
   * Create coordination error event
   *
   * @param component
   * @param targetId
   * @param error
   * @param details
   */
  createCoordinationErrorEvent(
    component: string,
    targetId: string,
    error: Error,
    details?: any
  ): Omit<CoordinationEvent, 'id' | 'timestamp'> {
    return {
      source: component,
      type: 'coordination:swarm',
      operation: 'fail',
      targetId,
      priority: 'high',
      details: {
        ...details,
        errorCode: error.name,
        errorMessage: error.message,
      },
    };
  },
};

export default CoordinationEventAdapter;
