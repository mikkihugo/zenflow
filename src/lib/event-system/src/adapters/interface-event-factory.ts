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
  SharedConfig,
  Logger,
} from '@claude-zen/foundation';
import { BaseEventManager } from '../core/base-event-manager';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManager,
  EventManagerFactory,
  SystemEvent,
} from '../core/interfaces';
import type { InterfaceEventManager } from '../event-manager-types';
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
class InterfaceEventManagerImpl
  extends BaseEventManager
  implements InterfaceEventManager
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

  constructor(config: EventManagerConfig, logger: Logger) {
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
        `Interface event emitted: ${event.interface}:${event.operation}`
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
  override async getMetrics(): Promise<EventManagerMetrics> {
    const baseMetrics = await super.getMetrics();
    const interfaceMetrics = await this.getInterfaceMetrics();

    return {
      ...baseMetrics,
      // Note: interface metrics available via getInterfaceMetrics() method
    };
  }

  /**
   * Health check with interface-specific validation.
   */
  override async healthCheck(): Promise<EventManagerStatus> {
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
        'interface:tui',
      ],
      (event: SystemEvent) => this.handleInterfaceEvent(event as InterfaceEvent)
    );
  }

  private async handleInterfaceEvent(event: InterfaceEvent): Promise<void> {
    const startTime = Date.now();

    try {
      // Route based on interface type
      switch (event.interface) {
        case 'cli':
          await this.notifyInterfaceSubscribers(this.subscriptions.cli, event);
          break;
        case 'web':
          await this.notifyInterfaceSubscribers(this.subscriptions.web, event);
          break;
        case 'api':
          await this.notifyInterfaceSubscribers(this.subscriptions.api, event);
          break;
        case 'tui':
          await this.notifyInterfaceSubscribers(this.subscriptions.websocket, event);
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
    if (event.details?.userId) {
      this.interfaceMetrics.activeUsers.add(event.details.userId);
    }

    // Handle special interface events
    const operation = event.operation;
    switch (operation) {
      case 'start':
        this.logger.info(`User session started: ${event.details?.userId}`);
        break;
      case 'stop':
        this.logger.info(`User session ended: ${event.details?.userId}`);
        if (event.details?.userId) {
          this.interfaceMetrics.activeUsers.delete(event.details.userId);
        }
        break;
      default:
        // Handle other interface operations
        this.logger.debug(`Interface operation: ${operation}`);
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
      case 'tui':
        this.interfaceMetrics.websocketMessages++;
        break;
    }
  }

  private async notifyInterfaceSubscribers(
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

  protected override generateSubscriptionId(): string {
    return `interface-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Handle UI interaction operations.
   * Required by InterfaceEventManager interface.
   */
  async handleUIInteraction(element: string, action: string): Promise<void> {
    this.logger.debug(`Handling UI interaction: ${element} - ${action}`);
    
    try {
      // Emit UI interaction event
      await this.emitInterfaceEvent({
        id: `ui-interaction-${element}-${Date.now()}`,
        timestamp: new Date(),
        source: 'interface-ui-handler',
        type: 'interface:web',
        interface: 'web',
        operation: 'interaction',
        payload: { element, action },
        metadata: {
          element,
          action,
          interactionStart: new Date(),
        },
      });
      
      this.logger.info(`UI interaction handled successfully: ${element} - ${action}`);
    } catch (error) {
      this.logger.error(`Failed to handle UI interaction ${element} - ${action}:`, error);
      throw error;
    }
  }

  /**
   * Update interface component state.
   * Required by InterfaceEventManager interface.
   */
  async updateInterface(componentId: string, state: unknown): Promise<void> {
    this.logger.debug(`Updating interface component: ${componentId}`);
    
    try {
      // Emit interface update event
      await this.emitInterfaceEvent({
        id: `interface-update-${componentId}-${Date.now()}`,
        timestamp: new Date(),
        source: 'interface-state-manager',
        type: 'interface:web',
        interface: 'web',
        operation: 'render',
        payload: { componentId, state },
        metadata: {
          componentId,
          updateStart: new Date(),
        },
      });
      
      this.logger.info(`Interface component updated successfully: ${componentId}`);
    } catch (error) {
      this.logger.error(`Failed to update interface component ${componentId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh interface component.
   * Required by InterfaceEventManager interface.
   */
  async refreshComponent(componentId: string): Promise<void> {
    this.logger.debug(`Refreshing interface component: ${componentId}`);
    
    try {
      // Emit component refresh event
      await this.emitInterfaceEvent({
        id: `component-refresh-${componentId}-${Date.now()}`,
        timestamp: new Date(),
        source: 'interface-component-manager',
        type: 'interface:web',
        interface: 'web',
        operation: 'render',
        payload: { componentId, action: 'refresh' },
        metadata: {
          componentId,
          refreshStart: new Date(),
        },
      });
      
      this.logger.info(`Interface component refreshed successfully: ${componentId}`);
    } catch (error) {
      this.logger.error(`Failed to refresh interface component ${componentId}:`, error);
      throw error;
    }
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
  implements EventManagerFactory<EventManagerConfig>
{
  private managers = new Map<string, EventManager>();

  constructor(
    private logger: Logger,
    private config: SharedConfig
  ) {
    this.logger.debug('InterfaceEventManagerFactory initialized');
  }

  /**
   * Create a new InterfaceEventManager instance.
   *
   * @param config - Configuration for the interface event manager
   * @returns Promise resolving to configured manager instance
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    this.logger.info(`Creating interface event manager: ${config.name}`);

    // Validate interface-specific configuration
    this.validateConfig(config);

    // Apply interface-optimized defaults
    const optimizedConfig = this.applyInterfaceDefaults(config);

    // Create and configure manager
    const manager = new InterfaceEventManagerImpl(optimizedConfig, this.logger);

    // Initialize with interface-specific settings
    await this.configureInterfaceManager(manager, optimizedConfig);

    // Register the manager in our registry
    this.managers.set(config.name, manager as unknown as EventManager);

    this.logger.info(
      `Interface event manager created successfully: ${config.name}`
    );
    return manager as unknown as EventManager;
  }

  /**
   * Create multiple event managers in batch.
   */
  async createMultiple(configs: EventManagerConfig[]): Promise<EventManager[]> {
    this.logger.info(`Creating ${configs.length} interface event managers`);
    
    const results = await Promise.allSettled(
      configs.map(config => this.create(config))
    );
    
    const managers: EventManager[] = [];
    const errors: Error[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        managers.push(result.value);
      } else {
        errors.push(new Error(`Failed to create manager ${configs[index]?.name}: ${result.reason}`));
      }
    });
    
    if (errors.length > 0) {
      this.logger.error(`${errors.length} managers failed to create:`, errors);
      throw new Error(`Failed to create ${errors.length} out of ${configs.length} managers`);
    }
    
    return managers;
  }

  /**
   * Get an event manager by name.
   */
  get(name: string): EventManager | undefined {
    return this.managers.get(name);
  }

  /**
   * List all event managers managed by this factory.
   */
  list(): EventManager[] {
    return Array.from(this.managers.values());
  }

  /**
   * Check if an event manager exists.
   */
  has(name: string): boolean {
    return this.managers.has(name);
  }

  /**
   * Remove and destroy an event manager.
   */
  async remove(name: string): Promise<boolean> {
    const manager = this.managers.get(name);
    if (!manager) {
      return false;
    }
    
    try {
      await manager.destroy();
      this.managers.delete(name);
      this.logger.info(`Interface event manager removed: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove interface event manager ${name}:`, error);
      throw error;
    }
  }

  /**
   * Perform health check on all managed event managers.
   */
  async healthCheckAll(): Promise<Map<string, EventManagerStatus>> {
    const results = new Map<string, EventManagerStatus>();
    
    const healthChecks = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        const status = await manager.healthCheck();
        results.set(name, status);
      } catch (error) {
        this.logger.error(`Health check failed for manager ${name}:`, error);
        results.set(name, {
          name,
          type: 'interface',
          status: 'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1,
          uptime: 0,
          metadata: { error: String(error) }
        });
      }
    });
    
    await Promise.allSettled(healthChecks);
    return results;
  }

  /**
   * Get metrics for all managed event managers.
   */
  async getMetricsAll(): Promise<Map<string, EventManagerMetrics>> {
    const results = new Map<string, EventManagerMetrics>();
    
    const metricRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        const metrics = await manager.getMetrics();
        results.set(name, metrics);
      } catch (error) {
        this.logger.error(`Failed to get metrics for manager ${name}:`, error);
      }
    });
    
    await Promise.allSettled(metricRequests);
    return results;
  }

  /**
   * Start all managed event managers.
   */
  async startAll(): Promise<void> {
    const startRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        await manager.start();
        this.logger.debug(`Started interface event manager: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to start manager ${name}:`, error);
        throw error;
      }
    });
    
    const results = await Promise.allSettled(startRequests);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      throw new Error(`Failed to start ${failures.length} out of ${results.length} managers`);
    }
  }

  /**
   * Stop all managed event managers.
   */
  async stopAll(): Promise<void> {
    const stopRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
      try {
        await manager.stop();
        this.logger.debug(`Stopped interface event manager: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to stop manager ${name}:`, error);
        throw error;
      }
    });
    
    const results = await Promise.allSettled(stopRequests);
    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      throw new Error(`Failed to stop ${failures.length} out of ${results.length} managers`);
    }
  }

  /**
   * Shutdown the factory and all managed event managers.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down interface event manager factory');
    
    try {
      await this.stopAll();
      
      // Destroy all managers
      const destroyRequests = Array.from(this.managers.entries()).map(async ([name, manager]) => {
        try {
          await manager.destroy();
        } catch (error) {
          this.logger.error(`Failed to destroy manager ${name}:`, error);
        }
      });
      
      await Promise.allSettled(destroyRequests);
      this.managers.clear();
      
      this.logger.info('Interface event manager factory shutdown complete');
    } catch (error) {
      this.logger.error('Error during factory shutdown:', error);
      throw error;
    }
  }

  /**
   * Get count of active event managers.
   */
  getActiveCount(): number {
    return this.managers.size;
  }

  /**
   * Get factory performance metrics.
   */
  getFactoryMetrics(): {
    totalManagers: number;
    runningManagers: number;
    errorCount: number;
    uptime: number;
  } {
    const runningManagers = Array.from(this.managers.values())
      .filter(manager => manager.isRunning()).length;
    
    return {
      totalManagers: this.managers.size,
      runningManagers,
      errorCount: 0, // TODO: Track factory-level errors
      uptime: Date.now() - this.factoryStartTime,
    };
  }

  private factoryStartTime = Date.now();

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

    // Note: timeout validation would go here if timeout property existed
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
        batchSize: 10,
        queueSize: 1000,
        ...config.processing,
        strategy: config.processing?.strategy || 'immediate', // UI needs immediate processing
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000, // 30 second metrics collection
        trackLatency: true,
        trackThroughput: false,
        trackErrors: true,
        enableProfiling: false,
        ...config.monitoring,
      },
    };
  }

  /**
   * Configure interface-specific manager settings.
   */
  private async configureInterfaceManager(
    manager: InterfaceEventManagerImpl,
    config: EventManagerConfig
  ): Promise<void> {
    // Start monitoring if enabled
    if (config.monitoring?.enabled) {
      await manager.start();
      this.logger.debug(
        `Interface event manager monitoring started: ${config.name}`
      );
    }

    // Set up health checking with default interval
    const healthCheckInterval = 60000; // 1 minute default
    setInterval(async () => {
      try {
        await manager.healthCheck();
      } catch (error) {
        this.logger.error(
          `Interface manager health check failed: ${config.name}`,
          error
        );
      }
    }, healthCheckInterval);
  }
}

export default InterfaceEventManagerFactory;
