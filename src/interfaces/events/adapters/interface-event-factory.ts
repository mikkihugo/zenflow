/**
 * @fileoverview Interface Event Manager Factory Implementation
 *
 * Factory for creating interface event managers that handle UI interactions,
 * CLI commands, web requests, and API calls. Provides specialized event
 * management for user interface components and interaction patterns.
 *
 * ## Features
 *
 * - **Multi-Interface Support**: CLI, Web, and API event handling
 * - **User Interaction Tracking**: Button clicks, form submissions, navigation
 * - **Request/Response Events**: HTTP requests, API calls, WebSocket messages
 * - **UI State Management**: Component state changes, modal events, navigation
 * - **Performance Monitoring**: Response times, error rates, user engagement
 *
 * ## Event Types Handled
 *
 * - `interface:cli` - Command line interface events
 * - `interface:web` - Web browser interface events
 * - `interface:api` - API request/response events
 * - `interface:websocket` - Real-time communication events
 * - `interface:user` - User interaction and behavior events
 *
 * @example
 * ```typescript
 * const factory = new InterfaceEventManagerFactory(logger, config);
 * const manager = await factory.create({
 *   name: 'web-interface',
 *   type: 'interface',
 *   maxListeners: 1000,
 *   processing: {
 *     strategy: 'immediate',
 *     batchSize: 10
 *   }
 * });
 *
 * // Subscribe to UI events
 * manager.subscribeCLIEvents((event) => {
 *   console.log(`CLI command: ${event.data.command}`);
 * });
 *
 * // Emit interface event
 * await manager.emitInterfaceEvent({
 *   id: 'web-001',
 *   timestamp: new Date(),
 *   source: 'web-ui',
 *   type: 'interface:web',
 *   interface: 'web',
 *   action: 'click',
 *   target: 'submit-button',
 *   data: { formData: { name: 'test' } }
 * });
 * ```
 *
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 1.0.0
 */

import type {
  IConfig,
  ILogger,
} from '../../../core/interfaces/base-interfaces';
import { BaseEventManager } from '../core/base-event-manager';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  IEventManager,
  IEventManagerFactory,
} from '../core/interfaces';
import type { IInterfaceEventManager } from '../event-manager-types';
import type { InterfaceEvent } from '../types';

/**
 * Interface Event Manager implementation for UI and interaction events.
 *
 * Specialized event manager for handling interface-related events across
 * different UI channels including CLI, web interfaces, and API endpoints.
 * Provides real-time event processing with interface-specific optimizations.
 *
 * ## Interface Types
 *
 * - **CLI Interface**: Command line interactions, terminal events
 * - **Web Interface**: Browser events, HTTP requests, form submissions
 * - **API Interface**: REST API calls, WebSocket connections, data transfers
 * - **User Interface**: User behavior tracking, session management
 *
 * ## Performance Features
 *
 * - **Immediate Processing**: Real-time event handling for responsive UI
 * - **Batched Analytics**: Efficient processing of user behavior data
 * - **Error Recovery**: Graceful handling of interface failures
 * - **Metrics Collection**: Performance tracking and user engagement stats
 */
class InterfaceEventManager
  extends BaseEventManager
  implements IInterfaceEventManager
{
  private interfaceMetrics = {
    cliCommands: 0,
    webRequests: 0,
    apiCalls: 0,
    websocketMessages: 0,
    userInteractions: 0,
    totalResponseTime: 0,
    errorCount: 0,
    activeUsers: new Set<string>(),
  };

  private subscriptions = {
    cli: new Map<string, (event: InterfaceEvent) => void>(),
    web: new Map<string, (event: InterfaceEvent) => void>(),
    api: new Map<string, (event: InterfaceEvent) => void>(),
    websocket: new Map<string, (event: InterfaceEvent) => void>(),
    user: new Map<string, (event: InterfaceEvent) => void>(),
  };

  constructor(config: EventManagerConfig, logger: ILogger) {
    super(config, logger);
    this.initializeInterfaceHandlers();
  }

  /**
   * Emit interface-specific event with UI context.
   */
  async emitInterfaceEvent(event: InterfaceEvent): Promise<void> {
    try {
      // Update interface metrics
      this.updateInterfaceMetrics(event);

      // Add interface-specific metadata
      const enrichedEvent = {
        ...event,
        metadata: {
          ...event.metadata,
          timestamp: new Date(),
          processingTime: Date.now(),
        },
      };

      // Emit through base manager
      await this.emit(enrichedEvent);

      // Route to specific interface handlers
      await this.routeInterfaceEvent(enrichedEvent);

      this.logger.debug(
        `Interface event emitted: ${event.interface}:${event.action}`
      );
    } catch (error) {
      this.interfaceMetrics.errorCount++;
      this.logger.error('Failed to emit interface event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to CLI interface events.
   */
  subscribeCLIEvents(listener: (event: InterfaceEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.cli.set(subscriptionId, listener);

    this.logger.debug(`CLI event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to web interface events.
   */
  subscribeWebEvents(listener: (event: InterfaceEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.web.set(subscriptionId, listener);

    this.logger.debug(`Web event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to API interface events.
   */
  subscribeAPIEvents(listener: (event: InterfaceEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.api.set(subscriptionId, listener);

    this.logger.debug(`API event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Subscribe to WebSocket interface events.
   */
  subscribeWebSocketEvents(listener: (event: InterfaceEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.websocket.set(subscriptionId, listener);

    this.logger.debug(
      `WebSocket event subscription created: ${subscriptionId}`
    );
    return subscriptionId;
  }

  /**
   * Subscribe to user interaction events.
   */
  subscribeUserEvents(listener: (event: InterfaceEvent) => void): string {
    const subscriptionId = this.generateSubscriptionId();
    this.subscriptions.user.set(subscriptionId, listener);

    this.logger.debug(`User event subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Get interface-specific metrics and performance data.
   */
  async getInterfaceMetrics(): Promise<{
    totalRequests: number;
    activeUsers: number;
    responseTime: number;
    errorRate: number;
    breakdown: {
      cli: number;
      web: number;
      api: number;
      websocket: number;
      user: number;
    };
  }> {
    const totalRequests =
      this.interfaceMetrics.cliCommands +
      this.interfaceMetrics.webRequests +
      this.interfaceMetrics.apiCalls +
      this.interfaceMetrics.websocketMessages;

    const averageResponseTime =
      totalRequests > 0
        ? this.interfaceMetrics.totalResponseTime / totalRequests
        : 0;

    const errorRate =
      totalRequests > 0 ? this.interfaceMetrics.errorCount / totalRequests : 0;

    return {
      totalRequests,
      activeUsers: this.interfaceMetrics.activeUsers.size,
      responseTime: averageResponseTime,
      errorRate,
      breakdown: {
        cli: this.interfaceMetrics.cliCommands,
        web: this.interfaceMetrics.webRequests,
        api: this.interfaceMetrics.apiCalls,
        websocket: this.interfaceMetrics.websocketMessages,
        user: this.interfaceMetrics.userInteractions,
      },
    };
  }

  /**
   * Get comprehensive event manager metrics.
   */
  async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const interfaceMetrics = await this.getInterfaceMetrics();

    return {
      ...baseMetrics,
      customMetrics: {
        interface: interfaceMetrics,
      },
    };
  }

  /**
   * Health check with interface-specific validation.
   */
  async healthCheck(): Promise<EventManagerStatus> {
    const baseStatus = await super.healthCheck();
    const interfaceMetrics = await this.getInterfaceMetrics();

    // Interface-specific health checks
    const highErrorRate = interfaceMetrics.errorRate > 0.1; // 10% error threshold
    const slowResponseTime = interfaceMetrics.responseTime > 1000; // 1 second threshold

    const isHealthy =
      baseStatus.status === 'healthy' && !highErrorRate && !slowResponseTime;

    return {
      ...baseStatus,
      status: isHealthy ? 'healthy' : 'degraded',
      metadata: {
        ...baseStatus.metadata,
        interface: {
          errorRate: interfaceMetrics.errorRate,
          responseTime: interfaceMetrics.responseTime,
          activeUsers: interfaceMetrics.activeUsers,
          totalRequests: interfaceMetrics.totalRequests,
        },
      },
    };
  }

  /**
   * Private helper methods.
   */

  private initializeInterfaceHandlers(): void {
    this.logger.debug('Initializing interface event handlers');

    // Set up event type routing
    this.subscribe(
      [
        'interface:cli',
        'interface:web',
        'interface:api',
        'interface:websocket',
        'interface:user',
      ],
      this.handleInterfaceEvent.bind(this)
    );
  }

  private async handleInterfaceEvent(event: InterfaceEvent): Promise<void> {
    const startTime = Date.now();

    try {
      // Route based on interface type
      switch (event.interface) {
        case 'cli':
          await this.notifySubscribers(this.subscriptions.cli, event);
          break;
        case 'web':
          await this.notifySubscribers(this.subscriptions.web, event);
          break;
        case 'api':
          await this.notifySubscribers(this.subscriptions.api, event);
          break;
        case 'websocket':
          await this.notifySubscribers(this.subscriptions.websocket, event);
          break;
        case 'user':
          await this.notifySubscribers(this.subscriptions.user, event);
          break;
        default:
          this.logger.warn(`Unknown interface type: ${event.interface}`);
      }

      // Track processing time
      const processingTime = Date.now() - startTime;
      this.interfaceMetrics.totalResponseTime += processingTime;
    } catch (error) {
      this.interfaceMetrics.errorCount++;
      this.logger.error('Interface event handling failed:', error);
      throw error;
    }
  }

  private async routeInterfaceEvent(event: InterfaceEvent): Promise<void> {
    // Additional routing logic for complex interface interactions
    if (event.data?.userId) {
      this.interfaceMetrics.activeUsers.add(event.data.userId);
    }

    // Handle special interface events
    switch (event.action) {
      case 'session-start':
        this.logger.info(`User session started: ${event.data?.userId}`);
        break;
      case 'session-end':
        this.logger.info(`User session ended: ${event.data?.userId}`);
        if (event.data?.userId) {
          this.interfaceMetrics.activeUsers.delete(event.data.userId);
        }
        break;
      case 'error':
        this.logger.error(`Interface error: ${event.data?.error}`);
        break;
    }
  }

  private updateInterfaceMetrics(event: InterfaceEvent): void {
    switch (event.interface) {
      case 'cli':
        this.interfaceMetrics.cliCommands++;
        break;
      case 'web':
        this.interfaceMetrics.webRequests++;
        break;
      case 'api':
        this.interfaceMetrics.apiCalls++;
        break;
      case 'websocket':
        this.interfaceMetrics.websocketMessages++;
        break;
      case 'user':
        this.interfaceMetrics.userInteractions++;
        break;
    }
  }

  private async notifySubscribers(
    subscribers: Map<string, (event: InterfaceEvent) => void>,
    event: InterfaceEvent
  ): Promise<void> {
    const notifications = Array.from(subscribers.values()).map(
      async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          this.logger.error('Interface event listener failed:', error);
        }
      }
    );

    await Promise.allSettled(notifications);
  }

  private generateSubscriptionId(): string {
    return `interface-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Factory for creating InterfaceEventManager instances.
 *
 * Provides configuration management and instance creation for interface
 * event managers with optimized settings for UI responsiveness and
 * user interaction tracking.
 *
 * ## Configuration Options
 *
 * - **Real-time Processing**: Immediate event handling for UI responsiveness
 * - **Batch Analytics**: Efficient processing of user behavior data
 * - **Error Recovery**: Graceful degradation for interface failures
 * - **Performance Monitoring**: Built-in metrics and health checking
 *
 * @example
 * ```typescript
 * const factory = new InterfaceEventManagerFactory(logger, config);
 *
 * const webManager = await factory.create({
 *   name: 'web-interface',
 *   type: 'interface',
 *   maxListeners: 500,
 *   processing: {
 *     strategy: 'immediate',
 *     timeout: 100
 *   }
 * });
 *
 * const cliManager = await factory.create({
 *   name: 'cli-interface',
 *   type: 'interface',
 *   processing: {
 *     strategy: 'queued',
 *     queueSize: 1000
 *   }
 * });
 * ```
 */
export class InterfaceEventManagerFactory
  implements IEventManagerFactory<EventManagerConfig>
{
  constructor(
    private logger: ILogger,
    private config: IConfig
  ) {
    this.logger.debug('InterfaceEventManagerFactory initialized');
  }

  /**
   * Create a new InterfaceEventManager instance.
   *
   * @param config - Configuration for the interface event manager
   * @returns Promise resolving to configured manager instance
   */
  async create(config: EventManagerConfig): Promise<IEventManager> {
    this.logger.info(`Creating interface event manager: ${config.name}`);

    // Validate interface-specific configuration
    this.validateConfig(config);

    // Apply interface-optimized defaults
    const optimizedConfig = this.applyInterfaceDefaults(config);

    // Create and configure manager
    const manager = new InterfaceEventManager(optimizedConfig, this.logger);

    // Initialize with interface-specific settings
    await this.configureInterfaceManager(manager, optimizedConfig);

    this.logger.info(
      `Interface event manager created successfully: ${config.name}`
    );
    return manager;
  }

  /**
   * Validate interface event manager configuration.
   */
  private validateConfig(config: EventManagerConfig): void {
    if (!config.name) {
      throw new Error('Interface event manager name is required');
    }

    if (config.type !== 'interface') {
      throw new Error('Manager type must be "interface"');
    }

    // Validate interface-specific settings
    if (config.maxListeners && config.maxListeners < 100) {
      this.logger.warn(
        'Interface managers should support at least 100 listeners for UI responsiveness'
      );
    }

    if (config.processing?.timeout && config.processing.timeout > 1000) {
      this.logger.warn(
        'Interface processing timeout > 1000ms may impact UI responsiveness'
      );
    }
  }

  /**
   * Apply interface-optimized default configuration.
   */
  private applyInterfaceDefaults(
    config: EventManagerConfig
  ): EventManagerConfig {
    return {
      ...config,
      maxListeners: config.maxListeners || 500,
      processing: {
        strategy: 'immediate', // UI needs immediate processing
        timeout: 100, // Fast timeout for responsiveness
        retries: 2,
        batchSize: 10,
        ...config.processing,
      },
      persistence: {
        enabled: false, // Interface events are typically ephemeral
        ...config.persistence,
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000, // 30 second metrics collection
        healthCheckInterval: 60000, // 1 minute health checks
        ...config.monitoring,
      },
    };
  }

  /**
   * Configure interface-specific manager settings.
   */
  private async configureInterfaceManager(
    manager: InterfaceEventManager,
    config: EventManagerConfig
  ): Promise<void> {
    // Start monitoring if enabled
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(
        `Interface event manager monitoring started: ${config.name}`
      );
    }

    // Set up health checking
    if (config.monitoring?.healthCheckInterval) {
      setInterval(async () => {
        try {
          await manager.healthCheck();
        } catch (error) {
          this.logger.error(
            `Interface manager health check failed: ${config.name}`,
            error
          );
        }
      }, config.monitoring.healthCheckInterval);
    }
  }
}

export default InterfaceEventManagerFactory;
