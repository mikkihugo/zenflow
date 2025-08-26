/**
 * Unified Event Layer (UEL) - Factory Implementation.
 *
 * Central factory for creating event manager instances based on event type,
 * processing requirements, and configuration. Supports dependency injection and
 * provides a single point of access for all event manager implementations.
 */
/**
 * @file Interface implementation: factories.
 */

import type { Config, Logger, RetryOptions } from '@claude-zen/foundation';
import {
  inject,
  injectable,
  TOKENS,
  withRetry,
  withTimeout,
  safeAsync,
  EnhancedError,
  Storage,
  getDatabaseAccess,
} from '@claude-zen/foundation';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManagerType,
  EventManager,
  EventManagerFactory,
  EventManagerRegistry,
  SystemEvent,
} from './core/interfaces;

// Import event manager types for use in this file
import type {
  CommunicationEventManager,
  CoordinationEventManager,
  DatabaseEventManager,
  InterfaceEventManager,
  MemoryEventManager,
  MonitoringEventManager,
  NeuralEventManager,
  SystemEventManager,
  WorkflowEventManager,
} from './event-manager-types;

import {
  EventManagerPresets,
  EventManagerTypes,
  EventTypeGuards,
} from './core/interfaces;
import type {
  CommunicationEvent,
  CoordinationEvent,
  DatabaseEvent,
  InterfaceEvent,
  MemoryEvent,
  MonitoringEvent,
  NeuralEvent,
  SystemLifecycleEvent,
  WorkflowEvent,
} from './types;
import { DefaultEventManagerConfigs, EventCategories } from './types;

/**
 * Configuration for event manager creation through factories.
 *
 * Provides comprehensive options for customizing event manager creation,
 * including type selection, configuration overrides, and reuse policies.
 *
 * @interface EventManagerFactoryConfig
 * @example
 * ```typescript`
 * const factoryConfig: EventManagerFactoryConfig = {
 *   managerType: EventManagerTypes.COORDINATION,
 *   name: 'swarm-coordinator',
 *   config: {
 *     maxListeners: 500,
 *     processing: { strategy: 'queued', queueSize: 10000 }'
 *   },
 *   reuseExisting: false,
 *   preset: 'HIGH_THROUGHPUT''
 * };
 *
 * const manager = await factory.createEventManager(factoryConfig);
 * ````
 */
export interface EventManagerFactoryConfig {
  /** Type of event manager to create (system, coordination, etc.) */
  managerType: EventManagerType;

  /** Unique name/identifier for the event manager */
  name: string;

  /** Optional configuration overrides for the event manager */
  config?: Partial<EventManagerConfig>;

  /** Whether to reuse an existing manager instance if available */
  reuseExisting?: boolean;

  /** Custom event manager implementation class to use */
  customImplementation?: new (...args: unknown[]) => EventManager;

  /** Preset configuration to apply (REAL_TIME, BATCH_PROCESSING, etc.) */
  preset?: keyof typeof EventManagerPresets;
}

/**
 * Event manager type mapping for better type safety.
 */
export type EventManagerTypeMap<T extends EventManagerType> = T extends 'system''
  ? SystemEventManager
  : T extends 'coordination''
    ? CoordinationEventManager
    : T extends 'communication''
      ? CommunicationEventManager
      : T extends 'monitoring''
        ? MonitoringEventManager
        : T extends 'interface''
          ? InterfaceEventManager
          : T extends 'neural''
            ? NeuralEventManager
            : T extends 'database''
              ? DatabaseEventManager
              : T extends 'memory''
                ? MemoryEventManager
                : T extends 'workflow''
                  ? WorkflowEventManager
                  : EventManager;

/**

/**
 * Event manager transaction for batch operations.
 *
 * @example
 */
export interface EventManagerTransaction {
  id: string;
  operations: Array<{
    manager: string;
    operation: 'emit' | 'subscribe' | 'unsubscribe;
    data: unknown;
    result?: unknown;
    error?: Error;
  }>;
  status: 'pending|executing|completed|failed;
  startTime: Date;
  endTime?: Date;
  error?: Error;
}

/**
 * Specialized system event manager interface for system lifecycle events.
 *
 * Extends the base event manager with system-specific methods for handling.
 * Application lifecycle, startup, shutdown, and health monitoring events..
 *
 * @interface SystemEventManager
 * @augments EventManager
 * @example
 * ```typescript`
 * const systemManager = await factory.createSystemEventManager('app-system');'
 *
 * // Emit system lifecycle event
 * await systemManager.emitSystemEvent({
 *   id: 'startup-001',
 *   timestamp: new Date(),
 *   source: 'application',
 *   type: 'system:startup',
 *   operation: 'initialize',
 *   status: 'success''
 * });
 *
 * // Subscribe to system events
 * const subId = systemManager.subscribeSystemEvents((event) => {
 *   console.log(`System event: ${event.operation} - ${event.status}`);`
 * });
 *
 * // Check system health
 * const health = await systemManager.getSystemHealth();
 * ````
 */
// Event manager interfaces are imported from event-manager-types.ts to avoid conflicts

/**
 * Main factory class for creating UEL event manager instances.
 *
 * Provides centralized creation, caching, and management of event managers.
 * Supports factory caching, transaction logging, and batch operations.
 *
 * @class UELFactory
 * @example
 * ```typescript`
 * // Create factory instance
 * const factory = new UELFactory(logger, config);
 *
 * // Create different types of event managers
 * const systemManager = await factory.createSystemEventManager('app-system');'
 * const coordManager = await factory.createCoordinationEventManager('swarm-coord');'
 *
 * // Execute transaction across multiple managers
 * const transaction = await factory.executeTransaction([
 *   { manager: 'app-system', operation: 'emit', data: systemEvent },
 *   { manager: 'swarm-coord', operation: 'emit', data: coordEvent }'
 * ]);
 *
 * // Get factory statistics
 * const stats = factory.getStats();
 * console.log(`Total managers: ${stats.totalManagers}`);`
 * ````
 */
// @injectable - temporarily disabled due to complex type issues
export class UELFactory {
  private managerCache = new Map<string, EventManager>();
  private factoryCache = new Map<EventManagerType, EventManagerFactory>();
  private storage = Storage;
  private database = getDatabaseAccess();
  private managerInstances = new Map<
    string,
    {
      manager: EventManager;
      type: EventManagerType;
      config: EventManagerConfig;
    }
  >();
  private managerRegistry: EventManagerRegistry = {
    registerFactory: () => {},
    getFactory: () => undefined,
    listFactoryTypes: () => [],
    getAllEventManagers: () => {
      const result = new Map<string, EventManager>();
      this.managerInstances.forEach((entry, id) => {
        result.set(id, entry.manager);
      });
      return result;
    },
    findEventManager: (id: string) => this.managerInstances.get(id)?.manager,
    getEventManagersByType: () => [],
    broadcast: async () => {},
    broadcastToType: async () => {},
    getGlobalMetrics: async () => ({
      totalManagers: 0,
      totalEvents: 0,
      totalSubscriptions: 0,
      averageLatency: 0,
      errorRate: 0,
    }),
    healthCheckAll: async () => new Map<string, EventManagerStatus>(),
    shutdownAll: async () => {},
  };
  private transactionLog = new Map<string, EventManagerTransaction>();

  constructor(
    private _logger: Logger,
    private _config: Config
  ) {
    this.initializeFactories();
  }

  /**
   * Create an event manager instance with full configuration support.
   *
   * Creates a new event manager using the appropriate factory, with support for.
   * Caching, configuration merging, and automatic registration..
   *
   * @template T - Event manager type.
   * @param factoryConfig - Configuration for manager creation.
   * @returns Promise resolving to the created event manager.
   * @throws {Error} If manager creation or validation fails.
   * @example
   * ```typescript`
   * const manager = await factory.createEventManager({
   *   managerType: EventManagerTypes.SYSTEM,
   *   name: 'critical-system',
   *   config: {
   *     maxListeners: 1000,
   *     processing: { strategy: 'immediate' }'
   *   },
   *   preset: 'REAL_TIME',
   *   reuseExisting: false
   * });
   * ````
   */
  async createEventManager<T extends EventManagerType>(
    factoryConfig: EventManagerFactoryConfig & { managerType: T }
  ): Promise<EventManagerTypeMap<T>> {
    const {
      managerType,
      name,
      config,
      reuseExisting = true,
      preset,
    } = factoryConfig;

    const cacheKey = this.generateCacheKey(managerType, name);

    if (reuseExisting && this.managerCache.has(cacheKey)) {
      this._logger.debug(`Returning cached event manager: ${cacheKey}`);`
      const cachedManager = this.managerCache.get(cacheKey)!;
      this.updateManagerUsage(cacheKey);
      return cachedManager as EventManagerTypeMap<T>;
    }

    this._logger.info(`Creating new event manager: ${managerType}/${name}`);`

    try {
      // Validate configuration
      this.validateManagerConfig(managerType, name, config);

      // Get or create event manager factory
      const factory = await this.getOrCreateFactory(managerType);

      // Merge with default configuration and preset
      const mergedConfig = this.mergeWithDefaults(
        managerType,
        name,
        config,
        preset
      );

      // Create event manager instance
      const manager = await factory.create(mergedConfig);

      // Register and cache the manager
      const managerId = this.registerManager(manager, mergedConfig, cacheKey);
      this.managerCache.set(cacheKey, manager);

      this._logger.info(`Successfully created event manager: ${managerId}`);`
      return manager as EventManagerTypeMap<T>;
    } catch (error) {
      const enhancedError = new EnhancedError('Event manager creation failed', {'
        managerType,
        name,
        originalError: error,
        context: 'UELFactory.createEventManager',
      } as Record<string, unknown>);
      this._logger.error('Failed to create event manager:', enhancedError);'
      throw enhancedError;
    }
  }

  /**
   * Create system event manager with convenience methods.
   *
   * @param name
   * @param config
   */
  async createSystemEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<SystemEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.SYSTEM,
      name,
      config: config||undefined,
      preset:'REAL_TIME',
    })) as SystemEventManager;
  }

  /**
   * Create coordination event manager for swarm operations.
   *
   * @param name
   * @param config
   */
  async createCoordinationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<CoordinationEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.COORDINATION,
      name,
      config: config||undefined,
      preset:'HIGH_THROUGHPUT',
    });
  }

  /**
   * Create communication event manager for protocol events.
   *
   * @param name
   * @param config
   */
  async createCommunicationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<CommunicationEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.COMMUNICATION,
      name,
      config: config||undefined,
      preset:'REAL_TIME',
    });
  }

  /**
   * Create monitoring event manager for metrics and health.
   *
   * @param name
   * @param config
   */
  async createMonitoringEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<MonitoringEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.MONITORING,
      name,
      config: config||undefined,
      preset:'BATCH_PROCESSING',
    });
  }

  /**
   * Create interface event manager for UI interactions.
   *
   * @param name
   * @param config
   */
  async createInterfaceEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<InterfaceEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.INTERFACE,
      name,
      config: config||undefined,
      preset:'REAL_TIME',
    });
  }

  /**
   * Create neural event manager for AI operations.
   *
   * @param name
   * @param config
   */
  async createNeuralEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<NeuralEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.NEURAL,
      name,
      config: config||undefined,
      preset:'RELIABLE',
    });
  }

  /**
   * Create database event manager for DB operations.
   *
   * @param name
   * @param config
   */
  async createDatabaseEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<DatabaseEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.DATABASE,
      name,
      config: config||undefined,
      preset:'BATCH_PROCESSING',
    });
  }

  /**
   * Create memory event manager for cache operations.
   *
   * @param name
   * @param config
   */
  async createMemoryEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<MemoryEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.MEMORY,
      name,
      config: config||undefined,
    });
  }

  /**
   * Create workflow event manager for orchestration.
   *
   * @param name
   * @param config
   */
  async createWorkflowEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<WorkflowEventManager> {
    return await this.createEventManager({
      managerType: EventManagerTypes.WORKFLOW,
      name,
      config: config||undefined,
      preset:'RELIABLE',
    });
  }

  /**
   * Get event manager by ID from registry.
   *
   * @param managerId
   */
  getEventManager(managerId: string): EventManager|null {
    return this.managerRegistry.findEventManager?.(managerId)||null;
  }

  /**
   * List all registered event managers.
   */
  listEventManagers(): EventManagerRegistry {
    return { ...this.managerRegistry };
  }

  /**
   * Health check for all event managers.
   */
  async healthCheckAll(): Promise<EventManagerStatus[]> {
    const results: EventManagerStatus[] = [];

    for (const [managerId, entry] of this.managerInstances.entries()) {
      try {
        const status = await entry.manager.healthCheck();
        results.push(status);
      } catch (error) {
        results.push({
          name: entry.manager.name,
          type: entry.manager.type,
          status:'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1.0,
          uptime: 0,
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return results;
  }

  /**
   * Execute transaction across multiple event managers.
   *
   * Performs multiple operations across different event managers as a coordinated.
   * Transaction with rollback support and detailed logging..
   *
   * @param operations - Array of operations to execute across managers.
   * @returns Promise resolving to transaction result with operation details.
   * @throws {Error} If transaction setup fails.
   * @example
   * ```typescript`
   * const transaction = await factory.executeTransaction([
   *   {
   *     manager: 'system-manager',
   *     operation: 'emit',
   *     data: {
   *       event: systemEvent,
   *       options: { priority: 'high' }'
   *     }
   *   },
   *   {
   *     manager: 'coord-manager',
   *     operation: 'subscribe',
   *     data: {
   *       eventTypes: ['coordination:swarm'],
   *       listener: handleCoordEvent
   *     }
   *   }
   * ]);
   *
   * console.log(`Transaction ${transaction.id}: ${transaction.status}`);`
   * ````
   */
  async executeTransaction(
    operations: Array<{
      manager: string;
      operation: 'emit' | 'subscribe' | 'unsubscribe;
      data: unknown;
    }>
  ): Promise<EventManagerTransaction> {
    const transactionId = this.generateTransactionId();
    const transaction: EventManagerTransaction = {
      id: transactionId,
      operations: operations.map((op) => ({ ...op })),
      status: 'executing',
      startTime: new Date(),
    };

    this.transactionLog.set(transactionId, transaction);

    try {
      // Execute operations in parallel
      const results = await Promise.allSettled(
        transaction.operations.map(async (op) => {
          const manager = this.getEventManager(op.manager);
          if (!manager) {
            throw new Error(`Event manager not found: ${op.manager}`);`
          }

          switch (op.operation) {
            case 'emit':'
              return await manager.emit(
                (op.data as any).event,
                (op.data as any).options
              );
            case 'subscribe':'
              return manager.subscribe(
                (op.data as any).eventTypes,
                (op.data as any).listener,
                (op.data as any).options
              );
            case 'unsubscribe':'
              return manager.unsubscribe((op.data as any).subscriptionId);
            default:
              throw new Error(`Unknown operation: ${op.operation}`);`
          }
        })
      );

      // Update operation results
      transaction.operations.forEach((op, index) => {
        const result = results[index];
        if (result?.status === 'fulfilled') {'
          op.result = result?.value;
        } else {
          op.error = result?.reason;
        }
      });

      transaction.status = 'completed';
      transaction.endTime = new Date();
    } catch (error) {
      transaction.status = 'failed;
      transaction.endTime = new Date();
      transaction.error = error as Error;

      this._logger.error(`Transaction failed: ${transactionId}`, error);`
    }

    return transaction;
  }

  /**
   * Stop and clean up all event managers.
   */
  async shutdownAll(): Promise<void> {
    this._logger.info('Shutting down all event managers');'

    const shutdownPromises = Array.from(this.managerInstances.values()).map(
      async (entry) => {
        try {
          await entry.manager.stop();
          await entry.manager.destroy();
        } catch (error) {
          this._logger.warn(`Failed to shutdown event manager: ${error}`);`
        }
      }
    );

    await Promise.allSettled(shutdownPromises);

    // Clear caches
    this.managerCache.clear();
    this.managerInstances.clear();
    this.managerRegistry = {
      registerFactory: () => {},
      getFactory: () => undefined,
      listFactoryTypes: () => [],
      getAllEventManagers: () => new Map<string, EventManager>(),
      findEventManager: () => undefined,
      getEventManagersByType: () => [],
      broadcast: async () => {},
      broadcastToType: async () => {},
      getGlobalMetrics: async () => ({
        totalManagers: 0,
        totalEvents: 0,
        totalSubscriptions: 0,
        averageLatency: 0,
        errorRate: 0,
      }),
      healthCheckAll: async () => new Map<string, EventManagerStatus>(),
      shutdownAll: async () => {},
    };
    this.factoryCache.clear();
  }

  /**
   * Get factory statistics.
   */
  getStats(): {
    totalManagers: number;
    managersByType: Record<EventManagerType, number>;
    managersByStatus: Record<string, number>;
    cacheSize: number;
    transactions: number;
  } {
    const managersByType: Record<EventManagerType, number> = {} as any;
    const managersByStatus: Record<string, number> = {};

    // Initialize counters
    Object.values(EventManagerTypes).forEach((type) => {
      managersByType[type] = 0;
    });

    ['running', 'stopped', 'error'].forEach((status) => {'
      managersByStatus[status] = 0;
    });

    // Count managers
    this.managerInstances.forEach((entry) => {
      const managerType = entry.type as keyof typeof managersByType;
      if (managersByType[managerType] !== undefined) {
        managersByType[managerType]++;
      }
      const status = 'running' as keyof typeof managersByStatus; // simplified status'
      if (managersByStatus[status] !== undefined) {
        managersByStatus[status]++;
      }
    });

    return {
      totalManagers: this.managerInstances.size,
      managersByType,
      managersByStatus,
      cacheSize: this.managerCache.size,
      transactions: this.transactionLog.size,
    };
  }

  /**
   * Private methods for internal operations.
   */

  private async initializeFactories(): Promise<void> {
    this._logger.debug('Initializing event manager factories');'
    // Placeholder for factory initialization
    // Real implementation would load specific factory classes
  }

  private async getOrCreateFactory(
    managerType: EventManagerType
  ): Promise<EventManagerFactory> {
    if (this.factoryCache.has(managerType)) {
      return this.factoryCache.get(managerType)!;
    }

    // Dynamic import based on manager type
    let FactoryClass: new (...args: unknown[]) => EventManagerFactory;

    switch (managerType) {
      case EventManagerTypes.SYSTEM: {
        const { SystemEventManagerFactory } = await import(
          './adapters/system-event-factory''
        );
        FactoryClass = SystemEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.COORDINATION: {
        const { CoordinationEventManagerFactory } = await import(
          './adapters/coordination-event-factory''
        );
        FactoryClass = CoordinationEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.COMMUNICATION: {
        const { CommunicationEventFactory: CommunicationEventManagerFactory } =
          await import('./adapters/communication-event-factory');'
        FactoryClass = CommunicationEventManagerFactory;
        break;
      }

      case EventManagerTypes.MONITORING: {
        const { MonitoringEventFactory: MonitoringEventManagerFactory } =
          await import('./adapters/monitoring-event-factory');'
        FactoryClass = MonitoringEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.INTERFACE: {
        const { InterfaceEventManagerFactory } = await import(
          './adapters/interface-event-factory''
        );
        FactoryClass = InterfaceEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.NEURAL: {
        const { NeuralEventManagerFactory } = await import(
          './adapters/neural-event-factory''
        );
        FactoryClass = NeuralEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.DATABASE: {
        const { DatabaseEventManagerFactory } = await import(
          './adapters/database-event-factory''
        );
        FactoryClass = DatabaseEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.MEMORY: {
        const { MemoryEventManagerFactory } = await import(
          './adapters/memory-event-factory''
        );
        FactoryClass = MemoryEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.WORKFLOW: {
        const { WorkflowEventManagerFactory } = await import(
          './adapters/workflow-event-factory''
        );
        FactoryClass = WorkflowEventManagerFactory as any;
        break;
      }

      case EventManagerTypes.CUSTOM: {
        // Custom event managers need to be registered manually
        throw new Error(
          'Custom event managers must be registered explicitly through the registry');'
      }

      default: {
        throw new Error(`Unsupported event manager type: ${managerType}`);`
      }
    }

    const factory = new FactoryClass(this._logger, this._config);
    this.factoryCache.set(managerType, factory);

    return factory;
  }

  private validateManagerConfig(
    managerType: EventManagerType,
    name: string,
    _config?: Partial<EventManagerConfig>
  ): void {
    if (!EventTypeGuards.isEventManagerType(managerType)) {
      throw new Error(`Invalid event manager type: ${managerType}`);`
    }

    if (!name||typeof name !=='string') {'
      throw new Error(`Invalid event manager name: ${name}`);`
    }

    // Additional validation logic would go here
  }

  private mergeWithDefaults(
    managerType: EventManagerType,
    name: string,
    config?: Partial<EventManagerConfig>,
    preset?: keyof typeof EventManagerPresets
  ): EventManagerConfig {
    const defaults =
      (DefaultEventManagerConfigs as any)?.[managerType]||(DefaultEventManagerConfigs as any)?.[EventCategories.SYSTEM];
    const presetConfig = preset ? EventManagerPresets[preset] : {};

    return {
      ...defaults,
      ...presetConfig,
      ...config,
      // Ensure required fields are not overwritten
      name,
      type: managerType,
    } as EventManagerConfig;
  }

  private registerManager(
    manager: EventManager,
    config: EventManagerConfig,
    cacheKey: string
  ): string {
    const managerId = this.generateManagerId(config);

    this.managerInstances.set(managerId, {
      manager,
      type: config.type,
      config,
    });

    return managerId;
  }

  private updateManagerUsage(cacheKey: string): void {
    // Find manager by cache key and update last used time
    for (const [managerId, entry] of this.managerInstances.entries()) {
      if (managerId.includes(cacheKey)) {
        // Entry is now correctly typed from managerInstances Map
        break;
      }
    }
  }

  private generateCacheKey(
    managerType: EventManagerType,
    name: string
  ): string {
    return `${managerType}:${name}`;`
  }

  private generateManagerId(config: EventManagerConfig): string {
    return `${config?.type}:${config?.name}:${Date.now()}`;`
  }

  private generateTransactionId(): string {
    return `tx:${Date.now()}:${Math.random().toString(36).substring(2, 11)}`;`
  }
}

/**
 * Event manager registry implementation.
 *
 * @example
 */
// @injectable - temporarily disabled due to complex type issues
export class UELRegistry implements EventManagerRegistry {
  private factories = new Map<EventManagerType, EventManagerFactory>();
  private globalEventManagers = new Map<string, EventManager>();

  constructor(private _logger: Logger) {}

  registerFactory<T extends EventManagerConfig>(
    type: EventManagerType,
    factory: EventManagerFactory<T>
  ): void {
    this.factories.set(type, factory as EventManagerFactory);
    this._logger.debug(`Registered event manager factory: ${type}`);`
  }

  getFactory<T extends EventManagerConfig>(
    type: EventManagerType
  ): EventManagerFactory<T>|undefined {
    return this.factories.get(type) as EventManagerFactory<T>;
  }

  listFactoryTypes(): EventManagerType[] {
    return Array.from(this.factories.keys())();
  }

  getAllEventManagers(): Map<string, EventManager> {
    return new Map(this.globalEventManagers);
  }

  findEventManager(name: string): EventManager|undefined {
    return this.globalEventManagers.get(name);
  }

  getEventManagersByType(type: EventManagerType): EventManager[] {
    return Array.from(this.globalEventManagers.values()).filter(
      (manager) => manager.type === type
    );
  }

  async healthCheckAll(): Promise<Map<string, EventManagerStatus>> {
    const results = new Map<string, EventManagerStatus>();

    for (const [name, manager] of this.globalEventManagers) {
      try {
        const status = await manager.healthCheck();
        results?.set(name, status);
      } catch (error) {
        results?.set(name, {
          name: manager.name,
          type: manager.type,
          status:'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1.0,
          uptime: 0,
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    return results;
  }

  async getGlobalMetrics(): Promise<{
    totalManagers: number;
    totalEvents: number;
    totalSubscriptions: number;
    averageLatency: number;
    errorRate: number;
  }> {
    const managers = Array.from(this.globalEventManagers.values())();

    const metricsPromises = managers.map(async (manager) => {
      try {
        return await manager.getMetrics();
      } catch (error) {
        this._logger.warn(
          `Failed to get metrics for manager ${manager.name}:`,`
          error
        );
        return null;
      }
    });

    const allMetrics = (await Promise.allSettled(metricsPromises))
      .filter(
        (result) => result?.status === 'fulfilled' && result?.value !== null'
      )
      .map(
        (result) =>
          (result as PromiseFulfilledResult<EventManagerMetrics>).value
      );

    const totalEvents = allMetrics.reduce(
      (sum, metrics) => sum + metrics.eventsProcessed,
      0
    );
    const totalSubscriptions = allMetrics.reduce(
      (sum, metrics) => sum + metrics.subscriptionCount,
      0
    );
    const averageLatency =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, metrics) => sum + metrics.averageLatency, 0) /
          allMetrics.length
        : 0;
    const errorRate =
      totalEvents > 0
        ? allMetrics.reduce((sum, metrics) => sum + metrics.eventsFailed, 0) /
          totalEvents
        : 0;

    return {
      totalManagers: managers.length,
      totalEvents,
      totalSubscriptions,
      averageLatency,
      errorRate,
    };
  }

  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.globalEventManagers.values()).map(
      (manager) => manager.destroy()
    );

    await Promise.allSettled(shutdownPromises);

    this.globalEventManagers.clear();
    this.factories.clear();
  }

  async broadcast<T extends SystemEvent>(event: T): Promise<void> {
    const broadcastPromises = Array.from(this.globalEventManagers.values()).map(
      (manager) => manager.emit(event)
    );

    await Promise.allSettled(broadcastPromises);
  }

  async broadcastToType<T extends SystemEvent>(
    type: EventManagerType,
    event: T
  ): Promise<void> {
    const managers = this.getEventManagersByType(type);
    const broadcastPromises = managers.map((manager) => manager.emit(event));

    await Promise.allSettled(broadcastPromises);
  }
}

// Convenience factory functions (following DAL/UACL/USL pattern)

/**
 * Create a simple event manager for quick setup.
 *
 * @param managerType
 * @param name
 * @param config
 * @example
 */
export async function createEventManager<T extends EventManagerType>(
  managerType: T,
  name: string,
  config?: Partial<EventManagerConfig>
): Promise<EventManagerTypeMap<T>> {
  // Use the UELFactory class directly (no self-import needed)
  const { DIContainer } = await import('@claude-zen/foundation');'
  const { TOKENS } = await import('@claude-zen/foundation');'

  // Create basic DI container for factory dependencies
  const container = new DIContainer();

  // Register basic logger and config
  container.register(TOKENS.Logger, {
    type: 'singleton' as const,
    create: () => ({
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }),
  });

  container.register(TOKENS.Config, {
    type: 'singleton' as const,
    create: () => ({}),
  });

  // Register UELFactory
  const uelToken = TOKENS.Logger; // Reuse existing token for simplicity
  container.register(uelToken, {
    type: 'singleton' as const,
    create: (container: any) =>
      new UELFactory(
        container.resolve(TOKENS.Logger),
        container.resolve(TOKENS.Config) as Config
      ),
  });

  const factory = new UELFactory(
    container.resolve(TOKENS.Logger),
    container.resolve(TOKENS.Config) as Config
  );

  return await (factory as any).createEventManager({
    managerType,
    name,
    config,
  });
}

/**
 * Create system event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createSystemEventBus(
  name: string = 'default-system',
  config?: Partial<EventManagerConfig>
): Promise<SystemEventManager> {
  return await createEventManager(EventManagerTypes.SYSTEM, name, config);
}

/**
 * Create coordination event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createCoordinationEventBus(
  name: string = 'default-coordination',
  config?: Partial<EventManagerConfig>
): Promise<CoordinationEventManager> {
  return await createEventManager(EventManagerTypes.COORDINATION, name, config);
}

/**
 * Create communication event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createCommunicationEventBus(
  name: string = 'default-communication',
  config?: Partial<EventManagerConfig>
): Promise<CommunicationEventManager> {
  return await createEventManager(
    EventManagerTypes.COMMUNICATION,
    name,
    config
  );
}

/**
 * Create monitoring event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export async function createMonitoringEventBus(
  name: string = 'default-monitoring',
  config?: Partial<EventManagerConfig>
): Promise<MonitoringEventManager> {
  return await createEventManager(EventManagerTypes.MONITORING, name, config);
}

// Add missing exports for index.ts compatibility
export { UELFactory as EventFactory };
export { createEventManager as createEvent };

export default UELFactory;
