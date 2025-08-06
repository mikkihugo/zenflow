/**
 * UEL Communication Event Adapter
 *
 * Unified Event Layer adapter for communication-related events, providing
 * a consistent interface to scattered EventEmitter patterns across the communication system
 * while maintaining full backward compatibility and adding enhanced monitoring,
 * event correlation, performance tracking, and unified communication functionality.
 *
 * This adapter follows the exact same patterns as the system and coordination event adapters,
 * implementing the IEventManager interface and providing unified configuration
 * management for communication events across Claude-Zen.
 */

// Import communication system classes to wrap their EventEmitter usage
import type { WebSocketClientAdapter } from '../../clients/adapters/websocket-client-adapter';
import type { HTTPMCPServer } from '../../mcp/http-mcp-server';
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
  SystemEvent,
} from '../core/interfaces';
import { EventManagerTypes } from '../core/interfaces';
import type { CommunicationEvent } from '../types';
import { EventPriorityMap } from '../types';

// Note: MCP SDK imports commented out for tests - would be real imports in production
// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
// import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// Mock logger for tests - would be real logger in production
interface Logger {
  info: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any, error?: any) => void;
}

const createLogger = (name: string): Logger => ({
  info: (_message: string, _meta?: any) => {},
  debug: (_message: string, _meta?: any) => {},
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${name}: ${message}`, meta),
  error: (message: string, meta?: any, error?: any) =>
    console.error(`[ERROR] ${name}: ${message}`, meta, error),
});

import { EventEmitter } from 'node:events';

/**
 * Communication event adapter configuration extending UEL EventManagerConfig
 *
 * @example
 */
export interface CommunicationEventAdapterConfig extends EventManagerConfig {
  /** WebSocket communication integration settings */
  websocketCommunication?: {
    enabled: boolean;
    wrapConnectionEvents?: boolean;
    wrapMessageEvents?: boolean;
    wrapHealthEvents?: boolean;
    wrapReconnectionEvents?: boolean;
    clients?: string[]; // List of WebSocket clients to wrap
  };

  /** MCP protocol integration settings */
  mcpProtocol?: {
    enabled: boolean;
    wrapServerEvents?: boolean;
    wrapClientEvents?: boolean;
    wrapToolEvents?: boolean;
    wrapProtocolEvents?: boolean;
    servers?: string[]; // List of MCP servers to wrap
    clients?: string[]; // List of MCP clients to wrap
  };

  /** Protocol communication integration settings */
  protocolCommunication?: {
    enabled: boolean;
    wrapRoutingEvents?: boolean;
    wrapOptimizationEvents?: boolean;
    wrapFailoverEvents?: boolean;
    wrapSwitchingEvents?: boolean;
    protocols?: string[]; // List of protocols to wrap
  };

  /** HTTP communication integration settings */
  httpCommunication?: {
    enabled: boolean;
    wrapRequestEvents?: boolean;
    wrapResponseEvents?: boolean;
    wrapTimeoutEvents?: boolean;
    wrapRetryEvents?: boolean;
  };

  /** Performance optimization settings */
  performance?: {
    enableConnectionCorrelation?: boolean;
    enableMessageTracking?: boolean;
    enableProtocolMetrics?: boolean;
    maxConcurrentConnections?: number;
    connectionTimeout?: number;
    enablePerformanceTracking?: boolean;
  };

  /** Communication correlation configuration */
  communication?: {
    enabled: boolean;
    strategy: 'websocket' | 'mcp' | 'http' | 'protocol' | 'custom';
    correlationTTL: number;
    maxCorrelationDepth: number;
    correlationPatterns: string[];
    trackMessageFlow: boolean;
    trackConnectionHealth: boolean;
  };

  /** Connection health monitoring configuration */
  connectionHealthMonitoring?: {
    enabled: boolean;
    healthCheckInterval: number;
    connectionHealthThresholds: Record<string, number>;
    protocolHealthThresholds: Record<string, number>;
    autoRecoveryEnabled: boolean;
  };

  /** Communication optimization configuration */
  communicationOptimization?: {
    enabled: boolean;
    optimizationInterval: number;
    performanceThresholds: {
      latency: number;
      throughput: number;
      reliability: number;
    };
    connectionPooling: boolean;
    messageCompression: boolean;
  };
}

/**
 * Communication event operation metrics for performance monitoring
 *
 * @example
 */
interface CommunicationEventMetrics {
  eventType: string;
  component: string;
  operation: string;
  executionTime: number;
  success: boolean;
  correlationId?: string;
  connectionId?: string;
  messageId?: string;
  protocolType?: string;
  communicationLatency?: number;
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
 * Communication correlation entry for tracking related events
 *
 * @example
 */
interface CommunicationCorrelation {
  correlationId: string;
  events: CommunicationEvent[];
  startTime: Date;
  lastUpdate: Date;
  connectionId?: string;
  protocolType: string;
  messageIds: string[];
  operation: string;
  status: 'active' | 'completed' | 'failed' | 'timeout';
  performance: {
    totalLatency: number;
    communicationEfficiency: number;
    resourceUtilization: number;
  };
  metadata: Record<string, any>;
}

/**
 * Communication health tracking entry
 *
 * @example
 */
interface CommunicationHealthEntry {
  component: string;
  componentType: 'websocket' | 'mcp-server' | 'mcp-client' | 'http' | 'protocol';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  consecutiveFailures: number;
  communicationLatency: number;
  throughput: number;
  reliability: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
  connectionCount?: number;
  activeMessageCount?: number;
  metadata: Record<string, any>;
}

/**
 * Wrapped communication component for unified event management
 *
 * @example
 */
interface WrappedCommunicationComponent {
  component: any;
  componentType: 'websocket' | 'mcp-server' | 'mcp-client' | 'http' | 'protocol';
  wrapper: EventEmitter;
  originalMethods: Map<string, Function>;
  eventMappings: Map<string, string>;
  isActive: boolean;
  healthMetrics: {
    lastSeen: Date;
    communicationCount: number;
    errorCount: number;
    avgLatency: number;
  };
}

/**
 * Unified Communication Event Adapter
 *
 * Provides a unified interface to communication-level EventEmitter patterns
 * while implementing the IEventManager interface for UEL compatibility.
 *
 * Features:
 * - WebSocket connection lifecycle and message routing
 * - MCP protocol event management and tool execution tracking
 * - HTTP communication monitoring and optimization
 * - Inter-protocol communication and message routing
 * - Performance monitoring for communication operations
 * - Event correlation and pattern detection for communication workflows
 * - Unified configuration management for communication components
 * - Health monitoring and auto-recovery for communication failures
 * - Event forwarding and transformation for communication events
 * - Error handling with retry logic for communication operations
 *
 * @example
 */
export class CommunicationEventAdapter implements IEventManager {
  // Core event manager properties
  public readonly config: CommunicationEventAdapterConfig;
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

  // Communication component integration
  private wrappedComponents = new Map<string, WrappedCommunicationComponent>();
  private websocketClients = new Map<string, WebSocketClientAdapter>();
  private mcpServers = new Map<string, HTTPMCPServer>();
  private mcpClients = new Map<string, any>();

  // Event correlation and tracking
  private communicationCorrelations = new Map<string, CommunicationCorrelation>();
  private communicationHealth = new Map<string, CommunicationHealthEntry>();
  private metrics: CommunicationEventMetrics[] = [];
  private subscriptions = new Map<string, EventSubscription>();
  private filters = new Map<string, EventFilter>();
  private transforms = new Map<string, EventTransform>();

  // Event processing queues
  private eventQueue: CommunicationEvent[] = [];
  private processingEvents = false;
  private eventHistory: CommunicationEvent[] = [];

  // Communication-specific tracking
  private connectionMetrics = new Map<string, any>();
  private messageMetrics = new Map<string, any>();
  private protocolMetrics = new Map<string, any>();
  private communicationPatterns = new Map<string, any>();

  constructor(config: CommunicationEventAdapterConfig) {
    this.name = config.name;
    this.type = EventManagerTypes.COMMUNICATION;
    this.config = {
      // Default configuration values
      websocketCommunication: {
        enabled: true,
        wrapConnectionEvents: true,
        wrapMessageEvents: true,
        wrapHealthEvents: true,
        wrapReconnectionEvents: true,
        clients: ['default'],
        ...config.websocketCommunication,
      },
      mcpProtocol: {
        enabled: true,
        wrapServerEvents: true,
        wrapClientEvents: true,
        wrapToolEvents: true,
        wrapProtocolEvents: true,
        servers: ['http-mcp-server'],
        clients: ['default-mcp-client'],
        ...config.mcpProtocol,
      },
      protocolCommunication: {
        enabled: true,
        wrapRoutingEvents: true,
        wrapOptimizationEvents: true,
        wrapFailoverEvents: true,
        wrapSwitchingEvents: true,
        protocols: ['http', 'https', 'ws', 'wss', 'stdio'],
        ...config.protocolCommunication,
      },
      httpCommunication: {
        enabled: true,
        wrapRequestEvents: true,
        wrapResponseEvents: true,
        wrapTimeoutEvents: true,
        wrapRetryEvents: true,
        ...config.httpCommunication,
      },
      performance: {
        enableConnectionCorrelation: true,
        enableMessageTracking: true,
        enableProtocolMetrics: true,
        maxConcurrentConnections: 1000,
        connectionTimeout: 30000,
        enablePerformanceTracking: true,
        ...config.performance,
      },
      communication: {
        enabled: true,
        strategy: 'websocket',
        correlationTTL: 300000, // 5 minutes
        maxCorrelationDepth: 20,
        correlationPatterns: [
          'communication:websocket->communication:mcp',
          'communication:http->communication:mcp',
          'communication:protocol->communication:websocket',
          'communication:mcp->communication:http',
        ],
        trackMessageFlow: true,
        trackConnectionHealth: true,
        ...config.communication,
      },
      connectionHealthMonitoring: {
        enabled: true,
        healthCheckInterval: 30000, // 30 seconds
        connectionHealthThresholds: {
          'websocket-client': 0.95,
          'mcp-server': 0.9,
          'mcp-client': 0.85,
          'http-client': 0.9,
          'protocol-manager': 0.8,
        },
        protocolHealthThresholds: {
          'communication-latency': 100, // ms
          throughput: 1000, // ops/sec
          reliability: 0.95,
          'connection-availability': 0.9,
        },
        autoRecoveryEnabled: true,
        ...config.connectionHealthMonitoring,
      },
      communicationOptimization: {
        enabled: true,
        optimizationInterval: 60000, // 1 minute
        performanceThresholds: {
          latency: 50, // ms
          throughput: 500, // ops/sec
          reliability: 0.98,
        },
        connectionPooling: true,
        messageCompression: true,
        ...config.communicationOptimization,
      },
      ...config,
    };

    this.logger = createLogger(`CommunicationEventAdapter:${this.name}`);
    this.logger.info(`Creating communication event adapter: ${this.name}`);

    // Set max listeners to handle many communication components
    this.eventEmitter.setMaxListeners(2000);
  }

  // ============================================
  // IEventManager Interface Implementation
  // ============================================

  /**
   * Start the communication event adapter
   */
  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn(`Communication event adapter ${this.name} is already running`);
      return;
    }

    this.logger.info(`Starting communication event adapter: ${this.name}`);

    try {
      // Initialize communication component integrations
      await this.initializeCommunicationIntegrations();

      // Start event processing
      this.startEventProcessing();

      // Start health monitoring if enabled
      if (this.config.connectionHealthMonitoring?.enabled) {
        this.startCommunicationHealthMonitoring();
      }

      // Start correlation cleanup if enabled
      if (this.config.communication?.enabled) {
        this.startCommunicationCorrelationCleanup();
      }

      // Start communication optimization if enabled
      if (this.config.communicationOptimization?.enabled) {
        this.startCommunicationOptimization();
      }

      this.running = true;
      this.startTime = new Date();
      this.emitInternal('start');

      this.logger.info(`Communication event adapter started successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to start communication event adapter ${this.name}:`, error);
      this.emitInternal('error', error);
      throw error;
    }
  }

  /**
   * Stop the communication event adapter
   */
  async stop(): Promise<void> {
    if (!this.running) {
      this.logger.warn(`Communication event adapter ${this.name} is not running`);
      return;
    }

    this.logger.info(`Stopping communication event adapter: ${this.name}`);

    try {
      // Stop event processing
      this.processingEvents = false;

      // Unwrap communication components
      await this.unwrapCommunicationComponents();

      // Clear event queues
      this.eventQueue.length = 0;

      this.running = false;
      this.emitInternal('stop');

      this.logger.info(`Communication event adapter stopped successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to stop communication event adapter ${this.name}:`, error);
      this.emitInternal('error', error);
      throw error;
    }
  }

  /**
   * Restart the communication event adapter
   */
  async restart(): Promise<void> {
    this.logger.info(`Restarting communication event adapter: ${this.name}`);
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
   * Emit a communication event with correlation and performance tracking
   *
   * @param event
   * @param options
   */
  async emit<T extends SystemEvent>(event: T, options?: EventEmissionOptions): Promise<void> {
    const startTime = Date.now();
    const _eventId = event.id || this.generateEventId();

    try {
      // Validate event (assume valid for SystemEvent - would check CommunicationEvent fields in real implementation)
      if (!event.id || !event.timestamp || !event.source || !event.type) {
        throw new Error('Invalid communication event format');
      }

      // Apply timeout if specified
      const timeout = options?.timeout || this.config.performance?.connectionTimeout || 30000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Event timeout after ${timeout}ms`)), timeout);
      });

      // Process event emission with timeout
      const emissionPromise = this.processCommunicationEventEmission(event, options);
      await Promise.race([emissionPromise, timeoutPromise]);

      const duration = Date.now() - startTime;

      // Record success metrics
      this.recordCommunicationEventMetrics({
        eventType: event.type,
        component: event.source,
        operation: event.operation,
        executionTime: duration,
        success: true,
        correlationId: event.correlationId,
        connectionId: this.extractConnectionId(event),
        messageId: this.extractMessageId(event),
        protocolType: this.extractProtocolType(event),
        communicationLatency: duration,
        timestamp: new Date(),
      });

      this.eventCount++;
      this.successCount++;
      this.totalLatency += duration;

      this.eventEmitter.emit('emission', { event, success: true, duration });
    } catch (error) {
      const duration = Date.now() - startTime;

      // Record error metrics
      this.recordCommunicationEventMetrics({
        eventType: event.type,
        component: event.source,
        operation: event.operation,
        executionTime: duration,
        success: false,
        correlationId: event.correlationId,
        connectionId: this.extractConnectionId(event),
        messageId: this.extractMessageId(event),
        protocolType: this.extractProtocolType(event),
        communicationLatency: duration,
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        timestamp: new Date(),
      });

      this.eventCount++;
      this.errorCount++;
      this.totalLatency += duration;

      this.eventEmitter.emit('emission', { event, success: false, duration, error });
      this.eventEmitter.emit('error', error);

      this.logger.error(`Communication event emission failed for ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Emit batch of communication events with optimized processing
   *
   * @param batch
   * @param options
   */
  async emitBatch<T extends CommunicationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(
        `Emitting communication event batch: ${batch.id} (${batch.events.length} events)`
      );

      // Process events based on strategy
      switch (this.config.processing?.strategy) {
        case 'immediate':
          await this.processCommunicationBatchImmediate(batch, options);
          break;
        case 'queued':
          await this.processCommunicationBatchQueued(batch, options);
          break;
        case 'batched':
          await this.processCommunicationBatchBatched(batch, options);
          break;
        case 'throttled':
          await this.processCommunicationBatchThrottled(batch, options);
          break;
        default:
          await this.processCommunicationBatchQueued(batch, options);
      }

      const duration = Date.now() - startTime;
      this.logger.debug(
        `Communication event batch processed successfully: ${batch.id} in ${duration}ms`
      );
    } catch (error) {
      this.logger.error(`Communication event batch processing failed for ${batch.id}:`, error);
      throw error;
    }
  }

  /**
   * Emit communication event immediately without queuing
   *
   * @param event
   */
  async emitImmediate<T extends CommunicationEvent>(event: T): Promise<void> {
    await this.emit(event, { timeout: 5000 });
  }

  /**
   * Subscribe to communication events with filtering and transformation
   *
   * @param eventTypes
   * @param listener
   * @param options
   */
  subscribe<T extends SystemEvent>(
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
      `Created communication subscription ${subscriptionId} for events: ${types.join(', ')}`
    );
    this.eventEmitter.emit('subscription', { subscriptionId, subscription });

    return subscriptionId;
  }

  /**
   * Unsubscribe from communication events
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

    this.logger.debug(`Removed communication subscription: ${subscriptionId}`);
    return true;
  }

  /**
   * Unsubscribe all communication listeners for event type
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
      `Removed ${removedCount} communication subscriptions${eventType ? ` for ${eventType}` : ''}`
    );
    return removedCount;
  }

  /**
   * Add communication event filter
   *
   * @param filter
   */
  addFilter(filter: EventFilter): string {
    const filterId = this.generateFilterId();
    this.filters.set(filterId, filter);
    this.logger.debug(`Added communication event filter: ${filterId}`);
    return filterId;
  }

  /**
   * Remove communication event filter
   *
   * @param filterId
   */
  removeFilter(filterId: string): boolean {
    const result = this.filters.delete(filterId);
    if (result) {
      this.logger.debug(`Removed communication event filter: ${filterId}`);
    }
    return result;
  }

  /**
   * Add communication event transform
   *
   * @param transform
   */
  addTransform(transform: EventTransform): string {
    const transformId = this.generateTransformId();
    this.transforms.set(transformId, transform);
    this.logger.debug(`Added communication event transform: ${transformId}`);
    return transformId;
  }

  /**
   * Remove communication event transform
   *
   * @param transformId
   */
  removeTransform(transformId: string): boolean {
    const result = this.transforms.delete(transformId);
    if (result) {
      this.logger.debug(`Removed communication event transform: ${transformId}`);
    }
    return result;
  }

  /**
   * Query communication event history with filtering and pagination
   *
   * @param options
   */
  async query<T extends SystemEvent>(options: EventQueryOptions): Promise<T[]> {
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
   * Get communication event history for specific event type
   *
   * @param eventType
   * @param limit
   */
  async getEventHistory(eventType: string, limit?: number): Promise<CommunicationEvent[]> {
    const events = this.eventHistory.filter((event) => event.type === eventType);
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Perform health check on the communication event adapter
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const now = new Date();
    const uptime = this.startTime ? now.getTime() - this.startTime.getTime() : 0;
    const errorRate = this.eventCount > 0 ? (this.errorCount / this.eventCount) * 100 : 0;

    // Check communication component health
    const componentHealth = await this.checkCommunicationComponentHealth();

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
        correlations: this.communicationCorrelations.size,
        wrappedComponents: this.wrappedComponents.size,
        websocketClients: this.websocketClients.size,
        mcpServers: this.mcpServers.size,
        mcpClients: this.mcpClients.size,
        componentHealth,
        avgCommunicationLatency: this.eventCount > 0 ? this.totalLatency / this.eventCount : 0,
      },
    };
  }

  /**
   * Get performance metrics for the communication adapter
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
   * Get active communication subscriptions
   */
  getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter((sub) => sub.active);
  }

  /**
   * Update adapter configuration
   *
   * @param config
   */
  updateConfig(config: Partial<CommunicationEventAdapterConfig>): void {
    this.logger.info(`Updating configuration for communication event adapter: ${this.name}`);
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
    this.logger.info(`Destroying communication event adapter: ${this.name}`);

    try {
      // Stop the adapter if still running
      if (this.running) {
        await this.stop();
      }

      // Clear all data structures
      this.subscriptions.clear();
      this.filters.clear();
      this.transforms.clear();
      this.communicationCorrelations.clear();
      this.communicationHealth.clear();
      this.metrics.length = 0;
      this.eventHistory.length = 0;
      this.eventQueue.length = 0;
      this.wrappedComponents.clear();
      this.websocketClients.clear();
      this.mcpServers.clear();
      this.mcpClients.clear();
      this.connectionMetrics.clear();
      this.messageMetrics.clear();
      this.protocolMetrics.clear();
      this.communicationPatterns.clear();

      // Remove all event listeners
      this.eventEmitter.removeAllListeners();

      this.logger.info(`Communication event adapter destroyed successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to destroy communication event adapter ${this.name}:`, error);
      throw error;
    }
  }

  // ============================================
  // Communication-Specific Event Management Methods
  // ============================================

  /**
   * Emit WebSocket communication event with enhanced tracking
   *
   * @param event
   */
  async emitWebSocketCommunicationEvent(
    event: Omit<CommunicationEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    const communicationEvent: CommunicationEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      priority: event.priority || EventPriorityMap[event.type] || 'medium',
      correlationId: event.correlationId || this.generateCorrelationId(),
    };

    // Start event correlation if enabled
    if (this.config.communication?.enabled) {
      this.startCommunicationEventCorrelation(communicationEvent);
    }

    await this.emit(communicationEvent);
  }

  /**
   * Emit MCP protocol event with enhanced tracking
   *
   * @param event
   */
  async emitMCPProtocolEvent(event: Omit<CommunicationEvent, 'id' | 'timestamp'>): Promise<void> {
    const communicationEvent: CommunicationEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      priority: event.priority || EventPriorityMap[event.type] || 'medium',
      correlationId: event.correlationId || this.generateCorrelationId(),
    };

    // Start event correlation if enabled
    if (this.config.communication?.enabled) {
      this.startCommunicationEventCorrelation(communicationEvent);
    }

    await this.emit(communicationEvent);
  }

  /**
   * Subscribe to WebSocket communication events with convenience
   *
   * @param listener
   */
  subscribeWebSocketCommunicationEvents(listener: EventListener<CommunicationEvent>): string {
    return this.subscribe(['communication:websocket'], listener);
  }

  /**
   * Subscribe to MCP protocol events
   *
   * @param listener
   */
  subscribeMCPProtocolEvents(listener: EventListener<CommunicationEvent>): string {
    return this.subscribe(['communication:mcp'], listener);
  }

  /**
   * Subscribe to HTTP communication events
   *
   * @param listener
   */
  subscribeHTTPCommunicationEvents(listener: EventListener<CommunicationEvent>): string {
    return this.subscribe(['communication:http'], listener);
  }

  /**
   * Subscribe to protocol communication events
   *
   * @param listener
   */
  subscribeProtocolCommunicationEvents(listener: EventListener<CommunicationEvent>): string {
    return this.subscribe(['communication:protocol'], listener);
  }

  /**
   * Get communication health status for all components
   */
  async getCommunicationHealthStatus(): Promise<Record<string, CommunicationHealthEntry>> {
    const healthStatus: Record<string, CommunicationHealthEntry> = {};

    for (const [component, health] of this.communicationHealth.entries()) {
      healthStatus[component] = { ...health };
    }

    return healthStatus;
  }

  /**
   * Get correlated communication events for a specific correlation ID
   *
   * @param correlationId
   */
  getCommunicationCorrelatedEvents(correlationId: string): CommunicationCorrelation | null {
    return this.communicationCorrelations.get(correlationId) || null;
  }

  /**
   * Get active communication correlations
   */
  getActiveCommunicationCorrelations(): CommunicationCorrelation[] {
    return Array.from(this.communicationCorrelations.values()).filter((c) => c.status === 'active');
  }

  /**
   * Get connection performance metrics
   *
   * @param connectionId
   */
  getConnectionMetrics(connectionId?: string): Record<string, any> {
    if (connectionId) {
      return this.connectionMetrics.get(connectionId) || {};
    }
    return Object.fromEntries(this.connectionMetrics.entries());
  }

  /**
   * Get message performance metrics
   *
   * @param messageId
   */
  getMessageMetrics(messageId?: string): Record<string, any> {
    if (messageId) {
      return this.messageMetrics.get(messageId) || {};
    }
    return Object.fromEntries(this.messageMetrics.entries());
  }

  /**
   * Get protocol execution metrics
   *
   * @param protocolType
   */
  getProtocolMetrics(protocolType?: string): Record<string, any> {
    if (protocolType) {
      return this.protocolMetrics.get(protocolType) || {};
    }
    return Object.fromEntries(this.protocolMetrics.entries());
  }

  /**
   * Force health check on all wrapped communication components
   */
  async performCommunicationHealthCheck(): Promise<Record<string, CommunicationHealthEntry>> {
    const healthResults: Record<string, CommunicationHealthEntry> = {};

    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      try {
        const startTime = Date.now();

        // Perform component-specific health check
        const isHealthy = wrapped.isActive;
        let communicationLatency = 0;
        let throughput = 0;
        let reliability = 1.0;

        // Get component-specific health data if available
        if (wrapped.component && typeof wrapped.component.healthCheck === 'function') {
          const health = await wrapped.component.healthCheck();
          communicationLatency = health.responseTime || 0;
          reliability = 1 - (health.errorRate || 0);
        } else if (wrapped.component && typeof wrapped.component.getMetrics === 'function') {
          const metrics = await wrapped.component.getMetrics();
          communicationLatency = metrics.averageLatency || 0;
          throughput = metrics.throughput || 0;
          reliability = 1 - metrics.errorCount / Math.max(metrics.requestCount, 1);
        }

        const responseTime = Date.now() - startTime;
        const threshold =
          this.config.connectionHealthMonitoring?.connectionHealthThresholds?.[componentName] ||
          0.8;
        const healthScore =
          reliability * (communicationLatency < 100 ? 1 : 0.5) * (throughput > 10 ? 1 : 0.5);

        const healthEntry: CommunicationHealthEntry = {
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
            : (this.communicationHealth.get(componentName)?.consecutiveFailures || 0) + 1,
          communicationLatency,
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
        if (wrapped.componentType === 'websocket') {
          healthEntry.connectionCount = this.getActiveConnectionCount(componentName);
        } else if (wrapped.componentType === 'mcp-server') {
          healthEntry.activeMessageCount = this.getActiveMessageCount(componentName);
        }

        this.communicationHealth.set(componentName, healthEntry);
        healthResults[componentName] = healthEntry;
      } catch (error) {
        const healthEntry: CommunicationHealthEntry = {
          component: componentName,
          componentType: wrapped.componentType,
          status: 'unhealthy',
          lastCheck: new Date(),
          consecutiveFailures:
            (this.communicationHealth.get(componentName)?.consecutiveFailures || 0) + 1,
          communicationLatency: 0,
          throughput: 0,
          reliability: 0,
          resourceUsage: { cpu: 0, memory: 0, network: 0 },
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };

        this.communicationHealth.set(componentName, healthEntry);
        healthResults[componentName] = healthEntry;
      }
    }

    return healthResults;
  }

  // ============================================
  // Internal Implementation Methods
  // ============================================

  /**
   * Initialize communication component integrations
   */
  private async initializeCommunicationIntegrations(): Promise<void> {
    this.logger.debug('Initializing communication component integrations');

    // Wrap WebSocket clients if enabled
    if (this.config.websocketCommunication?.enabled) {
      await this.wrapWebSocketClients();
    }

    // Wrap MCP servers if enabled
    if (this.config.mcpProtocol?.enabled) {
      await this.wrapMCPServers();
      await this.wrapMCPClients();
    }

    // Wrap HTTP communication if enabled
    if (this.config.httpCommunication?.enabled) {
      await this.wrapHTTPCommunication();
    }

    // Wrap protocol communication if enabled
    if (this.config.protocolCommunication?.enabled) {
      await this.wrapProtocolCommunication();
    }

    this.logger.debug(`Wrapped ${this.wrappedComponents.size} communication components`);
  }

  /**
   * Wrap WebSocket client events with UEL integration
   */
  private async wrapWebSocketClients(): Promise<void> {
    const clients = this.config.websocketCommunication?.clients || ['default'];

    for (const clientName of clients) {
      const wrapper = new EventEmitter();
      const wrappedComponent: WrappedCommunicationComponent = {
        component: null, // Would be actual WebSocketClientAdapter instance
        componentType: 'websocket',
        wrapper,
        originalMethods: new Map(),
        eventMappings: new Map([
          ['connect', 'communication:websocket'],
          ['disconnect', 'communication:websocket'],
          ['message', 'communication:websocket'],
          ['error', 'communication:websocket'],
          ['reconnecting', 'communication:websocket'],
          ['reconnected', 'communication:websocket'],
          ['heartbeat', 'communication:websocket'],
        ]),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          communicationCount: 0,
          errorCount: 0,
          avgLatency: 0,
        },
      };

      // Set up event forwarding from WebSocket client to UEL
      wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
        wrapper.on(originalEvent, (data) => {
          const communicationEvent: CommunicationEvent = {
            id: this.generateEventId(),
            timestamp: new Date(),
            source: `websocket-client-${clientName}`,
            type: uelEvent as any,
            operation: this.extractCommunicationOperation(originalEvent),
            protocol: this.extractProtocol(originalEvent, data),
            endpoint: data?.endpoint || data?.url,
            priority: EventPriorityMap[uelEvent] || 'medium',
            correlationId: this.generateCorrelationId(),
            details: {
              ...data,
              connectionId: data?.connectionId,
              messageType: data?.messageType,
              responseTime: data?.duration || data?.responseTime,
              dataSize: data?.dataSize,
            },
            metadata: { originalEvent, data, clientName },
          };

          this.eventEmitter.emit(uelEvent, communicationEvent);
          this.updateComponentHealthMetrics(clientName, !originalEvent.includes('error'));
        });
      });

      this.wrappedComponents.set(`websocket-client-${clientName}`, wrappedComponent);
      this.logger.debug(`Wrapped WebSocket client events: ${clientName}`);
    }
  }

  /**
   * Wrap MCP server events with UEL integration
   */
  private async wrapMCPServers(): Promise<void> {
    const servers = this.config.mcpProtocol?.servers || ['http-mcp-server'];

    for (const serverName of servers) {
      const wrapper = new EventEmitter();
      const wrappedComponent: WrappedCommunicationComponent = {
        component: null, // Would be actual HTTPMCPServer instance
        componentType: 'mcp-server',
        wrapper,
        originalMethods: new Map(),
        eventMappings: new Map([
          ['server:started', 'communication:mcp'],
          ['server:stopped', 'communication:mcp'],
          ['tool:called', 'communication:mcp'],
          ['tool:completed', 'communication:mcp'],
          ['tool:error', 'communication:mcp'],
          ['client:connected', 'communication:mcp'],
          ['client:disconnected', 'communication:mcp'],
          ['protocol:error', 'communication:mcp'],
        ]),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          communicationCount: 0,
          errorCount: 0,
          avgLatency: 0,
        },
      };

      // Set up event forwarding
      wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
        wrapper.on(originalEvent, (data) => {
          const communicationEvent: CommunicationEvent = {
            id: this.generateEventId(),
            timestamp: new Date(),
            source: `mcp-server-${serverName}`,
            type: uelEvent as any,
            operation: this.extractCommunicationOperation(originalEvent),
            protocol: 'http',
            endpoint: data?.endpoint,
            priority: this.determineCommunicationEventPriority(originalEvent),
            correlationId: this.generateCorrelationId(),
            details: {
              ...data,
              toolName: data?.toolName,
              requestId: data?.requestId,
              statusCode: data?.statusCode,
              responseTime: data?.responseTime,
            },
            metadata: { originalEvent, data, serverName },
          };

          this.eventEmitter.emit(uelEvent, communicationEvent);
          this.updateComponentHealthMetrics(
            `mcp-server-${serverName}`,
            !originalEvent.includes('error')
          );
        });
      });

      this.wrappedComponents.set(`mcp-server-${serverName}`, wrappedComponent);
      this.logger.debug(`Wrapped MCP server events: ${serverName}`);
    }
  }

  /**
   * Wrap MCP client events with UEL integration
   */
  private async wrapMCPClients(): Promise<void> {
    const clients = this.config.mcpProtocol?.clients || ['default-mcp-client'];

    for (const clientName of clients) {
      const wrapper = new EventEmitter();
      const wrappedComponent: WrappedCommunicationComponent = {
        component: null, // Would be actual MCP Client instance
        componentType: 'mcp-client',
        wrapper,
        originalMethods: new Map(),
        eventMappings: new Map([
          ['client:connected', 'communication:mcp'],
          ['client:disconnected', 'communication:mcp'],
          ['tool:request', 'communication:mcp'],
          ['tool:response', 'communication:mcp'],
          ['tool:timeout', 'communication:mcp'],
          ['protocol:error', 'communication:mcp'],
        ]),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          communicationCount: 0,
          errorCount: 0,
          avgLatency: 0,
        },
      };

      // Set up event forwarding
      wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
        wrapper.on(originalEvent, (data) => {
          const communicationEvent: CommunicationEvent = {
            id: this.generateEventId(),
            timestamp: new Date(),
            source: `mcp-client-${clientName}`,
            type: uelEvent as any,
            operation: this.extractCommunicationOperation(originalEvent),
            protocol: data?.protocol || 'stdio',
            endpoint: data?.endpoint,
            priority: this.determineCommunicationEventPriority(originalEvent),
            correlationId: this.generateCorrelationId(),
            details: {
              ...data,
              toolName: data?.toolName,
              requestId: data?.requestId,
              responseTime: data?.responseTime,
            },
            metadata: { originalEvent, data, clientName },
          };

          this.eventEmitter.emit(uelEvent, communicationEvent);
          this.updateComponentHealthMetrics(
            `mcp-client-${clientName}`,
            !originalEvent.includes('error')
          );
        });
      });

      this.wrappedComponents.set(`mcp-client-${clientName}`, wrappedComponent);
      this.logger.debug(`Wrapped MCP client events: ${clientName}`);
    }
  }

  /**
   * Wrap HTTP communication events with UEL integration
   */
  private async wrapHTTPCommunication(): Promise<void> {
    const wrapper = new EventEmitter();
    const wrappedComponent: WrappedCommunicationComponent = {
      component: null, // Would be actual HTTP client/server instance
      componentType: 'http',
      wrapper,
      originalMethods: new Map(),
      eventMappings: new Map([
        ['request', 'communication:http'],
        ['response', 'communication:http'],
        ['timeout', 'communication:http'],
        ['error', 'communication:http'],
        ['retry', 'communication:http'],
      ]),
      isActive: true,
      healthMetrics: {
        lastSeen: new Date(),
        communicationCount: 0,
        errorCount: 0,
        avgLatency: 0,
      },
    };

    // Set up event forwarding
    wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
      wrapper.on(originalEvent, (data) => {
        const communicationEvent: CommunicationEvent = {
          id: this.generateEventId(),
          timestamp: new Date(),
          source: 'http-communication',
          type: uelEvent as any,
          operation: this.extractCommunicationOperation(originalEvent),
          protocol: data?.protocol || 'http',
          endpoint: data?.url || data?.endpoint,
          priority: this.determineCommunicationEventPriority(originalEvent),
          correlationId: this.generateCorrelationId(),
          details: {
            ...data,
            statusCode: data?.statusCode,
            responseTime: data?.responseTime,
            retryAttempt: data?.retryAttempt,
          },
          metadata: { originalEvent, data },
        };

        this.eventEmitter.emit(uelEvent, communicationEvent);
        this.updateComponentHealthMetrics('http-communication', !originalEvent.includes('error'));
      });
    });

    this.wrappedComponents.set('http-communication', wrappedComponent);
    this.logger.debug('Wrapped HTTP communication events');
  }

  /**
   * Wrap protocol communication events with UEL integration
   */
  private async wrapProtocolCommunication(): Promise<void> {
    const protocols = this.config.protocolCommunication?.protocols || [
      'http',
      'https',
      'ws',
      'wss',
      'stdio',
    ];

    for (const protocolType of protocols) {
      const wrapper = new EventEmitter();
      const wrappedComponent: WrappedCommunicationComponent = {
        component: null, // Would be actual protocol manager instance
        componentType: 'protocol',
        wrapper,
        originalMethods: new Map(),
        eventMappings: new Map([
          ['protocol:initialized', 'communication:protocol'],
          ['protocol:switched', 'communication:protocol'],
          ['protocol:optimized', 'communication:protocol'],
          ['protocol:failover', 'communication:protocol'],
          ['routing:message', 'communication:protocol'],
          ['routing:error', 'communication:protocol'],
        ]),
        isActive: true,
        healthMetrics: {
          lastSeen: new Date(),
          communicationCount: 0,
          errorCount: 0,
          avgLatency: 0,
        },
      };

      // Set up event forwarding
      wrappedComponent.eventMappings.forEach((uelEvent, originalEvent) => {
        wrapper.on(originalEvent, (data) => {
          const communicationEvent: CommunicationEvent = {
            id: this.generateEventId(),
            timestamp: new Date(),
            source: `${protocolType}-protocol`,
            type: uelEvent as any,
            operation: this.extractCommunicationOperation(originalEvent),
            protocol: protocolType as any,
            endpoint: data?.endpoint,
            priority: this.determineCommunicationEventPriority(originalEvent),
            correlationId: this.generateCorrelationId(),
            details: {
              ...data,
              protocolType,
              routingInfo: data?.routingInfo,
            },
            metadata: { originalEvent, data, protocolType },
          };

          this.eventEmitter.emit(uelEvent, communicationEvent);
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
   * Unwrap all communication components
   */
  private async unwrapCommunicationComponents(): Promise<void> {
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

        this.logger.debug(`Unwrapped communication component: ${componentName}`);
      } catch (error) {
        this.logger.warn(`Failed to unwrap communication component ${componentName}:`, error);
      }
    }

    this.wrappedComponents.clear();
  }

  /**
   * Process communication event emission with correlation and filtering
   *
   * @param event
   * @param options
   * @param _options
   */
  private async processCommunicationEventEmission<T extends SystemEvent>(
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
    if (this.config.communication?.enabled && event.correlationId) {
      this.updateCommunicationEventCorrelation(event);
    }

    // Update communication-specific metrics
    this.updateCommunicationMetrics(event);

    // Apply global filters
    for (const filter of this.filters.values()) {
      if (!this.applyFilter(event, filter)) {
        this.logger.debug(`Communication event ${event.id} filtered out`);
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
          `Communication subscription listener error for ${subscription.id}:`,
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
   * Start event processing loop for communication events
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
          await this.processCommunicationEventEmission(event);
        } catch (error) {
          this.logger.error('Communication event processing error:', error);
        }
      }

      // Process next event
      setImmediate(processQueue);
    };

    processQueue();
  }

  /**
   * Start health monitoring for communication components
   */
  private startCommunicationHealthMonitoring(): void {
    const interval = this.config.connectionHealthMonitoring?.healthCheckInterval || 30000;

    setInterval(async () => {
      try {
        await this.performCommunicationHealthCheck();

        // Emit health status events for unhealthy components
        for (const [component, health] of this.communicationHealth.entries()) {
          if (health.status !== 'healthy') {
            await this.emitWebSocketCommunicationEvent({
              source: component,
              type: 'communication:websocket',
              operation: 'error',
              protocol: 'ws',
              endpoint: component,
              details: {
                requestId: `health-${Date.now()}`,
                responseTime: health.communicationLatency,
                errorCode: 'HEALTH_DEGRADED',
              },
            });
          }
        }
      } catch (error) {
        this.logger.error('Communication health monitoring error:', error);
      }
    }, interval);
  }

  /**
   * Start communication correlation cleanup to prevent memory leaks
   */
  private startCommunicationCorrelationCleanup(): void {
    const cleanupInterval = 60000; // 1 minute
    const correlationTTL = this.config.communication?.correlationTTL || 300000; // 5 minutes

    setInterval(() => {
      const now = Date.now();
      const expiredCorrelations: string[] = [];

      for (const [correlationId, correlation] of this.communicationCorrelations.entries()) {
        if (now - correlation.lastUpdate.getTime() > correlationTTL) {
          expiredCorrelations.push(correlationId);
        }
      }

      expiredCorrelations.forEach((id) => {
        const correlation = this.communicationCorrelations.get(id);
        if (correlation) {
          correlation.status = 'timeout';
          this.communicationCorrelations.delete(id);
        }
      });

      if (expiredCorrelations.length > 0) {
        this.logger.debug(
          `Cleaned up ${expiredCorrelations.length} expired communication correlations`
        );
      }
    }, cleanupInterval);
  }

  /**
   * Start communication optimization if enabled
   */
  private startCommunicationOptimization(): void {
    const interval = this.config.communicationOptimization?.optimizationInterval || 60000;

    setInterval(async () => {
      if (!this.config.communicationOptimization?.enabled) return;

      try {
        // Analyze communication performance
        const communicationHealth = await this.performCommunicationHealthCheck();

        // Check if optimization is needed
        for (const [componentName, health] of Object.entries(communicationHealth)) {
          const thresholds = this.config.communicationOptimization.performanceThresholds;

          if (
            health.communicationLatency > thresholds.latency ||
            health.throughput < thresholds.throughput ||
            health.reliability < thresholds.reliability
          ) {
            this.logger.info(`Triggering optimization for ${componentName}`, {
              latency: health.communicationLatency,
              throughput: health.throughput,
              reliability: health.reliability,
            });

            // Emit optimization event
            await this.emitWebSocketCommunicationEvent({
              source: 'communication-optimizer',
              type: 'communication:protocol',
              operation: 'send',
              protocol: 'custom',
              endpoint: componentName,
              details: {
                requestId: `optimization-${Date.now()}`,
                responseTime: health.communicationLatency,
                statusCode: health.throughput > thresholds.throughput ? 200 : 500,
              },
            });
          }
        }
      } catch (error) {
        this.logger.error('Communication optimization error:', error);
      }
    }, interval);
  }

  /**
   * Start communication event correlation for tracking related events
   *
   * @param event
   */
  private startCommunicationEventCorrelation(event: CommunicationEvent): void {
    const correlationId = event.correlationId || this.generateCorrelationId();

    if (!this.communicationCorrelations.has(correlationId)) {
      const correlation: CommunicationCorrelation = {
        correlationId,
        events: [event],
        startTime: new Date(),
        lastUpdate: new Date(),
        connectionId: this.extractConnectionId(event),
        protocolType: this.extractProtocolType(event),
        messageIds: this.extractMessageIds(event),
        operation: event.operation,
        status: 'active',
        performance: {
          totalLatency: 0,
          communicationEfficiency: 1.0,
          resourceUtilization: 0,
        },
        metadata: {},
      };

      this.communicationCorrelations.set(correlationId, correlation);
    } else {
      this.updateCommunicationEventCorrelation(event);
    }
  }

  /**
   * Update existing communication event correlation
   *
   * @param event
   */
  private updateCommunicationEventCorrelation(event: CommunicationEvent): void {
    const correlationId = event.correlationId;
    if (!correlationId) return;

    const correlation = this.communicationCorrelations.get(correlationId);
    if (correlation) {
      correlation.events.push(event);
      correlation.lastUpdate = new Date();

      // Update message and connection tracking
      const messageId = this.extractMessageId(event);
      const connectionId = this.extractConnectionId(event);

      if (messageId && !correlation.messageIds.includes(messageId)) {
        correlation.messageIds.push(messageId);
      }

      if (connectionId && !correlation.connectionId) {
        correlation.connectionId = connectionId;
      }

      // Update performance metrics
      const totalTime = correlation.lastUpdate.getTime() - correlation.startTime.getTime();
      correlation.performance.totalLatency = totalTime;
      correlation.performance.communicationEfficiency =
        this.calculateCommunicationEfficiency(correlation);

      // Check for completion patterns
      if (this.isCommunicationCorrelationComplete(correlation)) {
        correlation.status = 'completed';
      }
    }
  }

  /**
   * Check if communication correlation is complete based on patterns
   *
   * @param correlation
   */
  private isCommunicationCorrelationComplete(correlation: CommunicationCorrelation): boolean {
    const patterns = this.config.communication?.correlationPatterns || [];

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
   * Calculate communication efficiency for correlation
   *
   * @param correlation
   */
  private calculateCommunicationEfficiency(correlation: CommunicationCorrelation): number {
    const events = correlation.events;
    if (events.length < 2) return 1.0;

    // Calculate efficiency based on event timing and success rate
    const successfulEvents = events.filter((e) =>
      e.details?.statusCode !== undefined ? e.details.statusCode < 400 : e.operation !== 'error'
    ).length;
    const timeEfficiency = Math.max(0, 1 - correlation.performance.totalLatency / 60000); // Penalize long correlations
    const successRate = successfulEvents / events.length;

    return (timeEfficiency + successRate) / 2;
  }

  /**
   * Check health of all communication components
   */
  private async checkCommunicationComponentHealth(): Promise<
    Record<string, CommunicationHealthEntry>
  > {
    const componentHealth: Record<string, CommunicationHealthEntry> = {};

    for (const [componentName, wrapped] of this.wrappedComponents.entries()) {
      const existing = this.communicationHealth.get(componentName);
      const healthEntry: CommunicationHealthEntry = existing || {
        component: componentName,
        componentType: wrapped.componentType,
        status: wrapped.isActive ? 'healthy' : 'unhealthy',
        lastCheck: new Date(),
        consecutiveFailures: 0,
        communicationLatency: wrapped.healthMetrics.avgLatency,
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
  private async processCommunicationBatchImmediate<T extends CommunicationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    await Promise.all(batch.events.map((event) => this.emit(event, options)));
  }

  private async processCommunicationBatchQueued<T extends CommunicationEvent>(
    batch: EventBatch<T>,
    _options?: EventEmissionOptions
  ): Promise<void> {
    this.eventQueue.push(...(batch.events as CommunicationEvent[]));
  }

  private async processCommunicationBatchBatched<T extends CommunicationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const batchSize = this.config.processing?.batchSize || 50;

    for (let i = 0; i < batch.events.length; i += batchSize) {
      const chunk = batch.events.slice(i, i + batchSize);
      await Promise.all(chunk.map((event) => this.emit(event, options)));
    }
  }

  private async processCommunicationBatchThrottled<T extends CommunicationEvent>(
    batch: EventBatch<T>,
    options?: EventEmissionOptions
  ): Promise<void> {
    const throttleMs = this.config.processing?.throttleMs || 100;

    for (const event of batch.events) {
      await this.emit(event, options);
      await new Promise((resolve) => setTimeout(resolve, throttleMs));
    }
  }

  private applyFilter(event: CommunicationEvent, filter: EventFilter): boolean {
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

  private async applyTransform<T extends CommunicationEvent>(
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
      throw new Error(`Communication event transformation validation failed for ${event.id}`);
    }

    return transformedEvent;
  }

  private getEventSortValue(event: CommunicationEvent, sortBy: string): any {
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

  private extractCommunicationOperation(eventType: string): CommunicationEvent['operation'] {
    if (eventType.includes('connect')) return 'connect';
    if (eventType.includes('disconnect')) return 'disconnect';
    if (eventType.includes('send') || eventType.includes('request')) return 'send';
    if (eventType.includes('receive') || eventType.includes('response')) return 'receive';
    if (eventType.includes('error')) return 'error';
    if (eventType.includes('timeout')) return 'timeout';
    if (eventType.includes('retry')) return 'retry';
    return 'send';
  }

  private extractProtocol(eventType: string, data: any): CommunicationEvent['protocol'] {
    if (data?.protocol) return data.protocol;
    if (eventType.includes('websocket') || eventType.includes('ws')) return 'ws';
    if (eventType.includes('http')) return 'http';
    if (eventType.includes('mcp')) return 'stdio';
    return 'custom';
  }

  private extractConnectionId(event: CommunicationEvent): string | undefined {
    return event.details?.connectionId || event.metadata?.connectionId;
  }

  private extractMessageId(event: CommunicationEvent): string | undefined {
    return event.details?.requestId || event.metadata?.messageId;
  }

  private extractProtocolType(event: CommunicationEvent): string {
    return event.protocol || 'unknown';
  }

  private extractMessageIds(event: CommunicationEvent): string[] {
    const messageId = this.extractMessageId(event);
    return messageId ? [messageId] : [];
  }

  private determineCommunicationEventPriority(eventType: string): EventPriority {
    if (
      eventType.includes('error') ||
      eventType.includes('timeout') ||
      eventType.includes('disconnect')
    )
      return 'high';
    if (
      eventType.includes('connect') ||
      eventType.includes('started') ||
      eventType.includes('stopped')
    )
      return 'high';
    if (eventType.includes('completed') || eventType.includes('response')) return 'medium';
    return 'medium';
  }

  private updateComponentHealthMetrics(componentName: string, success: boolean): void {
    const wrapped = this.wrappedComponents.get(componentName);
    if (wrapped) {
      wrapped.healthMetrics.lastSeen = new Date();
      wrapped.healthMetrics.communicationCount++;
      if (!success) {
        wrapped.healthMetrics.errorCount++;
      }
    }
  }

  private updateCommunicationMetrics(event: CommunicationEvent): void {
    // Update connection metrics
    const connectionId = this.extractConnectionId(event);
    if (connectionId && event.type === 'communication:websocket') {
      const metrics = this.connectionMetrics.get(connectionId) || {
        eventCount: 0,
        lastUpdate: new Date(),
      };
      metrics.eventCount++;
      metrics.lastUpdate = new Date();
      this.connectionMetrics.set(connectionId, metrics);
    }

    // Update message metrics
    const messageId = this.extractMessageId(event);
    if (messageId && (event.type === 'communication:mcp' || event.type === 'communication:http')) {
      const metrics = this.messageMetrics.get(messageId) || {
        eventCount: 0,
        lastUpdate: new Date(),
      };
      metrics.eventCount++;
      metrics.lastUpdate = new Date();
      this.messageMetrics.set(messageId, metrics);
    }

    // Update protocol metrics
    const protocolType = this.extractProtocolType(event);
    if (protocolType && event.type === 'communication:protocol') {
      const metrics = this.protocolMetrics.get(protocolType) || {
        eventCount: 0,
        lastUpdate: new Date(),
      };
      metrics.eventCount++;
      metrics.lastUpdate = new Date();
      this.protocolMetrics.set(protocolType, metrics);
    }
  }

  private getActiveConnectionCount(_componentName: string): number {
    // Would query actual component for connection count
    return this.connectionMetrics.size;
  }

  private getActiveMessageCount(_componentName: string): number {
    // Would query actual component for active message count
    return this.messageMetrics.size;
  }

  private recordCommunicationEventMetrics(metrics: CommunicationEventMetrics): void {
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
    for (const correlation of this.communicationCorrelations.values()) {
      size += correlation.events.length * 500;
    }

    // Estimate metrics memory
    size += this.metrics.length * 200;

    // Estimate communication-specific memory
    size += this.connectionMetrics.size * 100;
    size += this.messageMetrics.size * 100;
    size += this.protocolMetrics.size * 100;

    return size;
  }

  /**
   * ID generation methods
   */
  private generateEventId(): string {
    return `comm-evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `comm-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFilterId(): string {
    return `comm-flt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransformId(): string {
    return `comm-txf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `comm-cor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
 * Factory function for creating CommunicationEventAdapter instances
 *
 * @param config
 */
export function createCommunicationEventAdapter(
  config: CommunicationEventAdapterConfig
): CommunicationEventAdapter {
  return new CommunicationEventAdapter(config);
}

/**
 * Helper function for creating default communication event adapter configuration
 *
 * @param name
 * @param overrides
 */
export function createDefaultCommunicationEventAdapterConfig(
  name: string,
  overrides?: Partial<CommunicationEventAdapterConfig>
): CommunicationEventAdapterConfig {
  return {
    name,
    type: EventManagerTypes.COMMUNICATION,
    processing: {
      strategy: 'immediate',
      queueSize: 5000,
    },
    retry: {
      attempts: 3,
      delay: 1000,
      backoff: 'linear',
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
      metricsInterval: 2000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
    },
    websocketCommunication: {
      enabled: true,
      wrapConnectionEvents: true,
      wrapMessageEvents: true,
      wrapHealthEvents: true,
      wrapReconnectionEvents: true,
      clients: ['default'],
    },
    mcpProtocol: {
      enabled: true,
      wrapServerEvents: true,
      wrapClientEvents: true,
      wrapToolEvents: true,
      wrapProtocolEvents: true,
      servers: ['http-mcp-server'],
      clients: ['default-mcp-client'],
    },
    protocolCommunication: {
      enabled: true,
      wrapRoutingEvents: true,
      wrapOptimizationEvents: true,
      wrapFailoverEvents: true,
      wrapSwitchingEvents: true,
      protocols: ['http', 'https', 'ws', 'wss', 'stdio'],
    },
    httpCommunication: {
      enabled: true,
      wrapRequestEvents: true,
      wrapResponseEvents: true,
      wrapTimeoutEvents: true,
      wrapRetryEvents: true,
    },
    performance: {
      enableConnectionCorrelation: true,
      enableMessageTracking: true,
      enableProtocolMetrics: true,
      maxConcurrentConnections: 1000,
      connectionTimeout: 30000,
      enablePerformanceTracking: true,
    },
    communication: {
      enabled: true,
      strategy: 'websocket',
      correlationTTL: 300000,
      maxCorrelationDepth: 20,
      correlationPatterns: [
        'communication:websocket->communication:mcp',
        'communication:http->communication:mcp',
        'communication:protocol->communication:websocket',
        'communication:mcp->communication:http',
      ],
      trackMessageFlow: true,
      trackConnectionHealth: true,
    },
    connectionHealthMonitoring: {
      enabled: true,
      healthCheckInterval: 30000,
      connectionHealthThresholds: {
        'websocket-client': 0.95,
        'mcp-server': 0.9,
        'mcp-client': 0.85,
        'http-client': 0.9,
        'protocol-manager': 0.8,
      },
      protocolHealthThresholds: {
        'communication-latency': 100,
        throughput: 1000,
        reliability: 0.95,
        'connection-availability': 0.9,
      },
      autoRecoveryEnabled: true,
    },
    communicationOptimization: {
      enabled: true,
      optimizationInterval: 60000,
      performanceThresholds: {
        latency: 50,
        throughput: 500,
        reliability: 0.98,
      },
      connectionPooling: true,
      messageCompression: true,
    },
    ...overrides,
  };
}

/**
 * Helper functions for communication event operations
 */
export const CommunicationEventHelpers = {
  /**
   * Create WebSocket connection event
   *
   * @param connectionId
   * @param url
   * @param details
   */
  createWebSocketConnectionEvent(
    connectionId: string,
    url: string,
    details?: any
  ): Omit<CommunicationEvent, 'id' | 'timestamp'> {
    return {
      source: 'websocket-client',
      type: 'communication:websocket',
      operation: 'connect',
      protocol: 'ws',
      endpoint: url,
      priority: 'high',
      details: {
        ...details,
        connectionId,
      },
    };
  },

  /**
   * Create MCP tool execution event
   *
   * @param toolName
   * @param requestId
   * @param details
   */
  createMCPToolExecutionEvent(
    toolName: string,
    requestId: string,
    details?: any
  ): Omit<CommunicationEvent, 'id' | 'timestamp'> {
    return {
      source: 'mcp-server',
      type: 'communication:mcp',
      operation: 'send',
      protocol: 'http',
      endpoint: `/tools/${toolName}`,
      priority: 'medium',
      details: {
        ...details,
        toolName,
        requestId,
      },
    };
  },

  /**
   * Create HTTP request event
   *
   * @param method
   * @param url
   * @param details
   */
  createHTTPRequestEvent(
    method: string,
    url: string,
    details?: any
  ): Omit<CommunicationEvent, 'id' | 'timestamp'> {
    return {
      source: 'http-client',
      type: 'communication:http',
      operation: 'send',
      protocol: 'http',
      endpoint: url,
      priority: 'medium',
      details: {
        ...details,
        method,
      },
    };
  },

  /**
   * Create protocol switching event
   *
   * @param fromProtocol
   * @param toProtocol
   * @param details
   */
  createProtocolSwitchingEvent(
    fromProtocol: string,
    toProtocol: string,
    details?: any
  ): Omit<CommunicationEvent, 'id' | 'timestamp'> {
    return {
      source: 'protocol-manager',
      type: 'communication:protocol',
      operation: 'send',
      protocol: toProtocol as any,
      endpoint: 'protocol-switch',
      priority: 'medium',
      details: {
        ...details,
        fromProtocol,
        toProtocol,
      },
    };
  },

  /**
   * Create communication error event
   *
   * @param component
   * @param protocol
   * @param error
   * @param details
   */
  createCommunicationErrorEvent(
    component: string,
    protocol: string,
    error: Error,
    details?: any
  ): Omit<CommunicationEvent, 'id' | 'timestamp'> {
    return {
      source: component,
      type: 'communication:websocket',
      operation: 'error',
      protocol: protocol as any,
      endpoint: component,
      priority: 'high',
      details: {
        ...details,
        errorCode: error.name,
        errorMessage: error.message,
      },
    };
  },
};

export default CommunicationEventAdapter;
