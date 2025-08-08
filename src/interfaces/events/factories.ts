/**
 * Unified Event Layer (UEL) - Factory Implementation
 *
 * Central factory for creating event manager instances based on event type,
 * processing requirements, and configuration. Supports dependency injection and
 * provides a single point of access for all event manager implementations.
 */

import type { IConfig, ILogger } from '../../core/interfaces/base-interfaces';
import { inject, injectable } from '../../di/decorators/injectable';
import { CORE_TOKENS } from '../../di/tokens/core-tokens';
import type {
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManagerType,
  IEventManager,
  IEventManagerFactory,
  IEventManagerRegistry,
  SystemEvent,
} from './core/interfaces';
import { EventManagerPresets, EventManagerTypes, EventTypeGuards } from './core/interfaces';
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
} from './types';
import { DefaultEventManagerConfigs, EventCategories } from './types';

/**
 * Configuration for event manager creation through factories
 *
 * Provides comprehensive options for customizing event manager creation,
 * including type selection, configuration overrides, and reuse policies.
 *
 * @interface EventManagerFactoryConfig
 * @example
 * ```typescript
 * const factoryConfig: EventManagerFactoryConfig = {
 *   managerType: EventManagerTypes.COORDINATION,
 *   name: 'swarm-coordinator',
 *   config: {
 *     maxListeners: 500,
 *     processing: { strategy: 'queued', queueSize: 10000 }
 *   },
 *   reuseExisting: false,
 *   preset: 'HIGH_THROUGHPUT'
 * };
 *
 * const manager = await factory.createEventManager(factoryConfig);
 * ```
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
  customImplementation?: new (
    ...args: any[]
  ) => IEventManager;

  /** Preset configuration to apply (REAL_TIME, BATCH_PROCESSING, etc.) */
  preset?: keyof typeof EventManagerPresets;
}

/**
 * Event manager type mapping for better type safety
 */
export type EventManagerTypeMap<T extends EventManagerType> = T extends 'system'
  ? ISystemEventManager
  : T extends 'coordination'
    ? ICoordinationEventManager
    : T extends 'communication'
      ? ICommunicationEventManager
      : T extends 'monitoring'
        ? IMonitoringEventManager
        : T extends 'interface'
          ? IInterfaceEventManager
          : T extends 'neural'
            ? INeuralEventManager
            : T extends 'database'
              ? IDatabaseEventManager
              : T extends 'memory'
                ? IMemoryEventManager
                : T extends 'workflow'
                  ? IWorkflowEventManager
                  : IEventManager;

/**
 * Event manager registry for managing event manager instances
 *
 * @example
 */
export interface EventManagerRegistry {
  [managerId: string]: {
    manager: IEventManager;
    config: EventManagerConfig;
    created: Date;
    lastUsed: Date;
    status: 'running' | 'stopped' | 'error';
    metadata: Record<string, any>;
  };
}

/**
 * Event manager transaction for batch operations
 *
 * @example
 */
export interface EventManagerTransaction {
  id: string;
  operations: Array<{
    manager: string;
    operation: 'emit' | 'subscribe' | 'unsubscribe';
    data: any;
    result?: any;
    error?: Error;
  }>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: Error;
}

/**
 * Specialized system event manager interface for system lifecycle events
 *
 * Extends the base event manager with system-specific methods for handling
 * application lifecycle, startup, shutdown, and health monitoring events.
 *
 * @interface ISystemEventManager
 * @augments IEventManager
 * @example
 * ```typescript
 * const systemManager = await factory.createSystemEventManager('app-system');
 *
 * // Emit system lifecycle event
 * await systemManager.emitSystemEvent({
 *   id: 'startup-001',
 *   timestamp: new Date(),
 *   source: 'application',
 *   type: 'system:startup',
 *   operation: 'initialize',
 *   status: 'success'
 * });
 *
 * // Subscribe to system events
 * const subId = systemManager.subscribeSystemEvents((event) => {
 *   console.log(`System event: ${event.operation} - ${event.status}`);
 * });
 *
 * // Check system health
 * const health = await systemManager.getSystemHealth();
 * ```
 */
export interface ISystemEventManager extends IEventManager {
  /**
   * Emit a system lifecycle event
   *
   * @param event - System lifecycle event to emit
   * @throws {EventEmissionError} If emission fails
   */
  emitSystemEvent(event: SystemLifecycleEvent): Promise<void>;

  /**
   * Subscribe to system lifecycle events
   *
   * @param listener - Function to handle system events
   * @returns Subscription ID for unsubscribing
   */
  subscribeSystemEvents(listener: (event: SystemLifecycleEvent) => void): string;

  /**
   * Get overall system health status
   *
   * @returns Promise resolving to health summary with any issues
   */
  getSystemHealth(): Promise<{ healthy: boolean; issues: string[] }>;
}

export interface ICoordinationEventManager extends IEventManager {
  emitCoordinationEvent(event: CoordinationEvent): Promise<void>;
  subscribeSwarmEvents(listener: (event: CoordinationEvent) => void): string;
  subscribeAgentEvents(listener: (event: CoordinationEvent) => void): string;
  subscribeTaskEvents(listener: (event: CoordinationEvent) => void): string;
  getCoordinationMetrics(): Promise<{
    activeSwarms: number;
    totalAgents: number;
    completedTasks: number;
  }>;
}

export interface ICommunicationEventManager extends IEventManager {
  emitCommunicationEvent(event: CommunicationEvent): Promise<void>;
  subscribeWebSocketEvents(listener: (event: CommunicationEvent) => void): string;
  subscribeMCPEvents(listener: (event: CommunicationEvent) => void): string;
  subscribeHTTPEvents(listener: (event: CommunicationEvent) => void): string;
  getConnectionMetrics(): Promise<{
    activeConnections: number;
    totalRequests: number;
    errorRate: number;
  }>;
}

export interface IMonitoringEventManager extends IEventManager {
  emitMonitoringEvent(event: MonitoringEvent): Promise<void>;
  subscribeMetricsEvents(listener: (event: MonitoringEvent) => void): string;
  subscribeHealthEvents(listener: (event: MonitoringEvent) => void): string;
  subscribeAlertEvents(listener: (event: MonitoringEvent) => void): string;
  getMonitoringData(): Promise<{ alerts: number; metrics: Record<string, number>; health: string }>;
}

export interface IInterfaceEventManager extends IEventManager {
  emitInterfaceEvent(event: InterfaceEvent): Promise<void>;
  subscribeCLIEvents(listener: (event: InterfaceEvent) => void): string;
  subscribeWebEvents(listener: (event: InterfaceEvent) => void): string;
  subscribeAPIEvents(listener: (event: InterfaceEvent) => void): string;
  getInterfaceMetrics(): Promise<{
    totalRequests: number;
    activeUsers: number;
    responseTime: number;
  }>;
}

export interface INeuralEventManager extends IEventManager {
  emitNeuralEvent(event: NeuralEvent): Promise<void>;
  subscribeTrainingEvents(listener: (event: NeuralEvent) => void): string;
  subscribeInferenceEvents(listener: (event: NeuralEvent) => void): string;
  getNeuralMetrics(): Promise<{
    activeModels: number;
    trainingJobs: number;
    inferenceRequests: number;
  }>;
}

export interface IDatabaseEventManager extends IEventManager {
  emitDatabaseEvent(event: DatabaseEvent): Promise<void>;
  subscribeQueryEvents(listener: (event: DatabaseEvent) => void): string;
  subscribeTransactionEvents(listener: (event: DatabaseEvent) => void): string;
  getDatabaseMetrics(): Promise<{
    activeConnections: number;
    queryCount: number;
    averageQueryTime: number;
  }>;
}

export interface IMemoryEventManager extends IEventManager {
  emitMemoryEvent(event: MemoryEvent): Promise<void>;
  subscribeCacheEvents(listener: (event: MemoryEvent) => void): string;
  subscribeGCEvents(listener: (event: MemoryEvent) => void): string;
  getMemoryMetrics(): Promise<{ cacheHitRate: number; memoryUsage: number; gcFrequency: number }>;
}

export interface IWorkflowEventManager extends IEventManager {
  emitWorkflowEvent(event: WorkflowEvent): Promise<void>;
  subscribeExecutionEvents(listener: (event: WorkflowEvent) => void): string;
  subscribeTaskEvents(listener: (event: WorkflowEvent) => void): string;
  getWorkflowMetrics(): Promise<{
    activeWorkflows: number;
    completedTasks: number;
    failureRate: number;
  }>;
}

/**
 * Main factory class for creating UEL event manager instances
 *
 * Provides centralized creation, caching, and management of event managers.
 * Supports factory caching, transaction logging, and batch operations.
 *
 * @class UELFactory
 * @example
 * ```typescript
 * // Create factory instance
 * const factory = new UELFactory(logger, config);
 *
 * // Create different types of event managers
 * const systemManager = await factory.createSystemEventManager('app-system');
 * const coordManager = await factory.createCoordinationEventManager('swarm-coord');
 *
 * // Execute transaction across multiple managers
 * const transaction = await factory.executeTransaction([
 *   { manager: 'app-system', operation: 'emit', data: systemEvent },
 *   { manager: 'swarm-coord', operation: 'emit', data: coordEvent }
 * ]);
 *
 * // Get factory statistics
 * const stats = factory.getStats();
 * console.log(`Total managers: ${stats.totalManagers}`);
 * ```
 */
@injectable
export class UELFactory {
  private managerCache = new Map<string, IEventManager>();
  private factoryCache = new Map<EventManagerType, IEventManagerFactory>();
  private managerRegistry: EventManagerRegistry = {};
  private transactionLog = new Map<string, EventManagerTransaction>();

  constructor(
    @inject(CORE_TOKENS.Logger) private _logger: ILogger,
    @inject(CORE_TOKENS.Config) private _config: IConfig
  ) {
    this.initializeFactories();
  }

  /**
   * Create an event manager instance with full configuration support
   *
   * Creates a new event manager using the appropriate factory, with support for
   * caching, configuration merging, and automatic registration.
   *
   * @template T - Event manager type
   * @param factoryConfig - Configuration for manager creation
   * @returns Promise resolving to the created event manager
   * @throws {Error} If manager creation or validation fails
   * @example
   * ```typescript
   * const manager = await factory.createEventManager({
   *   managerType: EventManagerTypes.SYSTEM,
   *   name: 'critical-system',
   *   config: {
   *     maxListeners: 1000,
   *     processing: { strategy: 'immediate' }
   *   },
   *   preset: 'REAL_TIME',
   *   reuseExisting: false
   * });
   * ```
   */
  async createEventManager<T extends EventManagerType>(
    factoryConfig: EventManagerFactoryConfig & { managerType: T }
  ): Promise<EventManagerTypeMap<T>> {
    const { managerType, name, config, reuseExisting = true, preset } = factoryConfig;

    const cacheKey = this.generateCacheKey(managerType, name);

    if (reuseExisting && this.managerCache.has(cacheKey)) {
      this.logger.debug(`Returning cached event manager: ${cacheKey}`);
      const cachedManager = this.managerCache.get(cacheKey)!;
      this.updateManagerUsage(cacheKey);
      return cachedManager as EventManagerTypeMap<T>;
    }

    this.logger.info(`Creating new event manager: ${managerType}/${name}`);

    try {
      // Validate configuration
      this.validateManagerConfig(managerType, name, config);

      // Get or create event manager factory
      const factory = await this.getOrCreateFactory(managerType);

      // Merge with default configuration and preset
      const mergedConfig = this.mergeWithDefaults(managerType, name, config, preset);

      // Create event manager instance
      const manager = await factory.create(mergedConfig);

      // Register and cache the manager
      const managerId = this.registerManager(manager, mergedConfig, cacheKey);
      this.managerCache.set(cacheKey, manager);

      this.logger.info(`Successfully created event manager: ${managerId}`);
      return manager as EventManagerTypeMap<T>;
    } catch (error) {
      this.logger.error(`Failed to create event manager: ${error}`);
      throw new Error(
        `Event manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create system event manager with convenience methods
   *
   * @param name
   * @param config
   */
  async createSystemEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<ISystemEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.SYSTEM,
      name,
      config,
      preset: 'REAL_TIME',
    })) as ISystemEventManager;
  }

  /**
   * Create coordination event manager for swarm operations
   *
   * @param name
   * @param config
   */
  async createCoordinationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<ICoordinationEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.COORDINATION,
      name,
      config,
      preset: 'HIGH_THROUGHPUT',
    })) as ICoordinationEventManager;
  }

  /**
   * Create communication event manager for protocol events
   *
   * @param name
   * @param config
   */
  async createCommunicationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<ICommunicationEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.COMMUNICATION,
      name,
      config,
      preset: 'REAL_TIME',
    })) as ICommunicationEventManager;
  }

  /**
   * Create monitoring event manager for metrics and health
   *
   * @param name
   * @param config
   */
  async createMonitoringEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IMonitoringEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.MONITORING,
      name,
      config,
      preset: 'BATCH_PROCESSING',
    })) as IMonitoringEventManager;
  }

  /**
   * Create interface event manager for UI interactions
   *
   * @param name
   * @param config
   */
  async createInterfaceEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IInterfaceEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.INTERFACE,
      name,
      config,
      preset: 'REAL_TIME',
    })) as IInterfaceEventManager;
  }

  /**
   * Create neural event manager for AI operations
   *
   * @param name
   * @param config
   */
  async createNeuralEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<INeuralEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.NEURAL,
      name,
      config,
      preset: 'RELIABLE',
    })) as INeuralEventManager;
  }

  /**
   * Create database event manager for DB operations
   *
   * @param name
   * @param config
   */
  async createDatabaseEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IDatabaseEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.DATABASE,
      name,
      config,
      preset: 'BATCH_PROCESSING',
    })) as IDatabaseEventManager;
  }

  /**
   * Create memory event manager for cache operations
   *
   * @param name
   * @param config
   */
  async createMemoryEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IMemoryEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.MEMORY,
      name,
      config,
    })) as IMemoryEventManager;
  }

  /**
   * Create workflow event manager for orchestration
   *
   * @param name
   * @param config
   */
  async createWorkflowEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IWorkflowEventManager> {
    return (await this.createEventManager({
      managerType: EventManagerTypes.WORKFLOW,
      name,
      config,
      preset: 'RELIABLE',
    })) as IWorkflowEventManager;
  }

  /**
   * Get event manager by ID from registry
   *
   * @param managerId
   */
  getEventManager(managerId: string): IEventManager | null {
    return this.managerRegistry[managerId]?.manager || null;
  }

  /**
   * List all registered event managers
   */
  listEventManagers(): EventManagerRegistry {
    return { ...this.managerRegistry };
  }

  /**
   * Health check for all event managers
   */
  async healthCheckAll(): Promise<EventManagerStatus[]> {
    const results: EventManagerStatus[] = [];

    for (const [_managerId, entry] of Object.entries(this.managerRegistry)) {
      try {
        const status = await entry.manager.healthCheck();
        results.push(status);

        // Update manager status
        entry.status = status.status === 'healthy' ? 'running' : 'error';
      } catch (error) {
        results.push({
          name: entry.manager.name,
          type: entry.manager.type,
          status: 'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1.0,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        });

        entry.status = 'error';
      }
    }

    return results;
  }

  /**
   * Execute transaction across multiple event managers
   *
   * Performs multiple operations across different event managers as a coordinated
   * transaction with rollback support and detailed logging.
   *
   * @param operations - Array of operations to execute across managers
   * @returns Promise resolving to transaction result with operation details
   * @throws {Error} If transaction setup fails
   * @example
   * ```typescript
   * const transaction = await factory.executeTransaction([
   *   {
   *     manager: 'system-manager',
   *     operation: 'emit',
   *     data: {
   *       event: systemEvent,
   *       options: { priority: 'high' }
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
   * console.log(`Transaction ${transaction.id}: ${transaction.status}`);
   * ```
   */
  async executeTransaction(
    operations: Array<{
      manager: string;
      operation: 'emit' | 'subscribe' | 'unsubscribe';
      data: any;
    }>
  ): Promise<EventManagerTransaction> {
    const transactionId = this.generateTransactionId();
    const transaction: EventManagerTransaction = {
      id: transactionId,
      operations: operations.map((op) => ({ ...op, result: undefined, error: undefined })),
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
            throw new Error(`Event manager not found: ${op.manager}`);
          }

          switch (op.operation) {
            case 'emit':
              return await manager.emit(op.data.event, op.data.options);
            case 'subscribe':
              return manager.subscribe(op.data.eventTypes, op.data.listener, op.data.options);
            case 'unsubscribe':
              return manager.unsubscribe(op.data.subscriptionId);
            default:
              throw new Error(`Unknown operation: ${op.operation}`);
          }
        })
      );

      // Update operation results
      transaction.operations.forEach((op, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          op.result = result.value;
        } else {
          op.error = result.reason;
        }
      });

      transaction.status = 'completed';
      transaction.endTime = new Date();
    } catch (error) {
      transaction.status = 'failed';
      transaction.endTime = new Date();
      transaction.error = error as Error;

      this.logger.error(`Transaction failed: ${transactionId}`, error);
    }

    return transaction;
  }

  /**
   * Stop and clean up all event managers
   */
  async shutdownAll(): Promise<void> {
    this.logger.info('Shutting down all event managers');

    const shutdownPromises = Object.values(this.managerRegistry).map(async (entry) => {
      try {
        await entry.manager.stop();
        await entry.manager.destroy();
        entry.status = 'stopped';
      } catch (error) {
        this.logger.warn(`Failed to shutdown event manager: ${error}`);
      }
    });

    await Promise.allSettled(shutdownPromises);

    // Clear caches
    this.managerCache.clear();
    this.managerRegistry = {};
    this.factoryCache.clear();
  }

  /**
   * Get factory statistics
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

    ['running', 'stopped', 'error'].forEach((status) => {
      managersByStatus[status] = 0;
    });

    // Count managers
    Object.values(this.managerRegistry).forEach((entry) => {
      managersByType[entry.manager.type]++;
      managersByStatus[entry.status]++;
    });

    return {
      totalManagers: Object.keys(this.managerRegistry).length,
      managersByType,
      managersByStatus,
      cacheSize: this.managerCache.size,
      transactions: this.transactionLog.size,
    };
  }

  /**
   * Private methods for internal operations
   */

  private async initializeFactories(): Promise<void> {
    this.logger.debug('Initializing event manager factories');
    // Placeholder for factory initialization
    // Real implementation would load specific factory classes
  }

  private async getOrCreateFactory(managerType: EventManagerType): Promise<IEventManagerFactory> {
    if (this.factoryCache.has(managerType)) {
      return this.factoryCache.get(managerType)!;
    }

    // Dynamic import based on manager type
    let FactoryClass: new (...args: any[]) => IEventManagerFactory;

    switch (managerType) {
      case EventManagerTypes.SYSTEM: {
        const { SystemEventManagerFactory } = await import('./adapters/system-event-factory');
        FactoryClass = SystemEventManagerFactory;
        break;
      }

      case EventManagerTypes.COORDINATION: {
        const { CoordinationEventManagerFactory } = await import(
          './adapters/coordination-event-factory'
        );
        FactoryClass = CoordinationEventManagerFactory;
        break;
      }

      case EventManagerTypes.COMMUNICATION: {
        const { CommunicationEventFactory: CommunicationEventManagerFactory } = await import(
          './adapters/communication-event-factory'
        );
        FactoryClass = CommunicationEventManagerFactory;
        break;
      }

      case EventManagerTypes.MONITORING: {
        const { MonitoringEventFactory: MonitoringEventManagerFactory } = await import(
          './adapters/monitoring-event-factory'
        );
        FactoryClass = MonitoringEventManagerFactory;
        break;
      }

      case EventManagerTypes.INTERFACE: {
        // xxx NEEDS_HUMAN: InterfaceEventManagerFactory not implemented yet
        // Using a stub factory for now
        const InterfaceEventManagerFactory = class {
          createManager() {
            return null;
          }
          async initialize() {
            return this;
          }
        };
        FactoryClass = InterfaceEventManagerFactory;
        break;
      }

      case EventManagerTypes.NEURAL: {
        // xxx NEEDS_HUMAN: NeuralEventManagerFactory not implemented yet
        // Using a stub factory for now
        const NeuralEventManagerFactory = class {
          createManager() {
            return null;
          }
          async initialize() {
            return this;
          }
        };
        FactoryClass = NeuralEventManagerFactory;
        break;
      }

      case EventManagerTypes.DATABASE: {
        // xxx NEEDS_HUMAN: DatabaseEventManagerFactory not implemented yet
        // Using a stub factory for now
        const DatabaseEventManagerFactory = class {
          createManager() {
            return null;
          }
          async initialize() {
            return this;
          }
        };
        FactoryClass = DatabaseEventManagerFactory;
        break;
      }

      case EventManagerTypes.MEMORY: {
        // xxx NEEDS_HUMAN: MemoryEventManagerFactory not implemented yet
        // Using a stub factory for now
        const MemoryEventManagerFactory = class {
          createManager() {
            return null;
          }
          async initialize() {
            return this;
          }
        };
        FactoryClass = MemoryEventManagerFactory;
        break;
      }

      case EventManagerTypes.WORKFLOW: {
        // xxx NEEDS_HUMAN: WorkflowEventManagerFactory not implemented yet
        // Using a stub factory for now
        const WorkflowEventManagerFactory = class {
          createManager() {
            return null;
          }
          async initialize() {
            return this;
          }
        };
        FactoryClass = WorkflowEventManagerFactory;
        break;
      }
      default: {
        // xxx NEEDS_HUMAN: CustomEventManagerFactory not implemented yet
        // Using a stub factory for now
        const CustomEventManagerFactory = class {
          createManager() {
            return null;
          }
          async initialize() {
            return this;
          }
        };
        FactoryClass = CustomEventManagerFactory;
        break;
      }
    }

    const factory = new FactoryClass(this.logger, this.config);
    this.factoryCache.set(managerType, factory);

    return factory;
  }

  private validateManagerConfig(
    managerType: EventManagerType,
    name: string,
    _config?: Partial<EventManagerConfig>
  ): void {
    if (!EventTypeGuards.isEventManagerType(managerType)) {
      throw new Error(`Invalid event manager type: ${managerType}`);
    }

    if (!name || typeof name !== 'string') {
      throw new Error(`Invalid event manager name: ${name}`);
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
      DefaultEventManagerConfigs[managerType] || DefaultEventManagerConfigs[EventCategories.SYSTEM];
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
    manager: IEventManager,
    config: EventManagerConfig,
    cacheKey: string
  ): string {
    const managerId = this.generateManagerId(config);

    this.managerRegistry[managerId] = {
      manager,
      config,
      created: new Date(),
      lastUsed: new Date(),
      status: 'running',
      metadata: {
        cacheKey,
        version: '1.0.0',
      },
    };

    return managerId;
  }

  private updateManagerUsage(cacheKey: string): void {
    // Find manager by cache key and update last used time
    for (const entry of Object.values(this.managerRegistry)) {
      if (entry.metadata.cacheKey === cacheKey) {
        entry.lastUsed = new Date();
        break;
      }
    }
  }

  private generateCacheKey(managerType: EventManagerType, name: string): string {
    return `${managerType}:${name}`;
  }

  private generateManagerId(config: EventManagerConfig): string {
    return `${config.type}:${config.name}:${Date.now()}`;
  }

  private generateTransactionId(): string {
    return `tx:${Date.now()}:${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Event manager registry implementation
 *
 * @example
 */
@injectable
export class UELRegistry implements IEventManagerRegistry {
  private factories = new Map<EventManagerType, IEventManagerFactory>();
  private globalEventManagers = new Map<string, IEventManager>();

  constructor(
    @inject(CORE_TOKENS.Logger) private _logger: ILogger
  ) {}

  registerFactory<T extends EventManagerConfig>(
    type: EventManagerType,
    factory: IEventManagerFactory<T>
  ): void {
    this.factories.set(type, factory as IEventManagerFactory);
    this.logger.debug(`Registered event manager factory: ${type}`);
  }

  getFactory<T extends EventManagerConfig>(
    type: EventManagerType
  ): IEventManagerFactory<T> | undefined {
    return this.factories.get(type) as IEventManagerFactory<T>;
  }

  listFactoryTypes(): EventManagerType[] {
    return Array.from(this.factories.keys());
  }

  getAllEventManagers(): Map<string, IEventManager> {
    return new Map(this.globalEventManagers);
  }

  findEventManager(name: string): IEventManager | undefined {
    return this.globalEventManagers.get(name);
  }

  getEventManagersByType(type: EventManagerType): IEventManager[] {
    return Array.from(this.globalEventManagers.values()).filter((manager) => manager.type === type);
  }

  async healthCheckAll(): Promise<Map<string, EventManagerStatus>> {
    const results = new Map<string, EventManagerStatus>();

    for (const [name, manager] of this.globalEventManagers) {
      try {
        const status = await manager.healthCheck();
        results.set(name, status);
      } catch (error) {
        results.set(name, {
          name: manager.name,
          type: manager.type,
          status: 'unhealthy',
          lastCheck: new Date(),
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1.0,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
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
    const managers = Array.from(this.globalEventManagers.values());

    const metricsPromises = managers.map(async (manager) => {
      try {
        return await manager.getMetrics();
      } catch (error) {
        this.logger.warn(`Failed to get metrics for manager ${manager.name}:`, error);
        return null;
      }
    });

    const allMetrics = (await Promise.allSettled(metricsPromises))
      .filter((result) => result.status === 'fulfilled' && result.value !== null)
      .map((result) => (result as PromiseFulfilledResult<EventManagerMetrics>).value);

    const totalEvents = allMetrics.reduce((sum, metrics) => sum + metrics.eventsProcessed, 0);
    const totalSubscriptions = allMetrics.reduce(
      (sum, metrics) => sum + metrics.subscriptionCount,
      0
    );
    const averageLatency =
      allMetrics.length > 0
        ? allMetrics.reduce((sum, metrics) => sum + metrics.averageLatency, 0) / allMetrics.length
        : 0;
    const errorRate =
      totalEvents > 0
        ? allMetrics.reduce((sum, metrics) => sum + metrics.eventsFailed, 0) / totalEvents
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
    const shutdownPromises = Array.from(this.globalEventManagers.values()).map((manager) =>
      manager.destroy()
    );

    await Promise.allSettled(shutdownPromises);

    this.globalEventManagers.clear();
    this.factories.clear();
  }

  async broadcast<T extends SystemEvent>(event: T): Promise<void> {
    const broadcastPromises = Array.from(this.globalEventManagers.values()).map((manager) =>
      manager.emit(event)
    );

    await Promise.allSettled(broadcastPromises);
  }

  async broadcastToType<T extends SystemEvent>(type: EventManagerType, event: T): Promise<void> {
    const managers = this.getEventManagersByType(type);
    const broadcastPromises = managers.map((manager) => manager.emit(event));

    await Promise.allSettled(broadcastPromises);
  }
}

// Convenience factory functions (following DAL/UACL/USL pattern)

/**
 * Create a simple event manager for quick setup
 *
 * @param managerType
 * @param name
 * @param config
 */
export async function createEventManager<T extends EventManagerType>(
  managerType: T,
  name: string,
  config?: Partial<EventManagerConfig>
): Promise<EventManagerTypeMap<T>> {
  const { UELFactory } = await import('./factories');
  const { DIContainer } = await import('../../di/container/di-container');
  const { CORE_TOKENS } = await import('../../di/tokens/core-tokens');

  // Create basic DI container for factory dependencies
  const container = new DIContainer();

  // Register basic logger and config
  container.register(CORE_TOKENS.Logger, () => ({
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }));

  container.register(CORE_TOKENS.Config, () => ({}));

  const factory = container.resolve(UELFactory);

  return await factory.createEventManager<T>({
    managerType,
    name,
    config,
  });
}

/**
 * Create system event manager with convenience
 *
 * @param name
 * @param config
 */
export async function createSystemEventBus(
  name: string = 'default-system',
  config?: Partial<EventManagerConfig>
): Promise<ISystemEventManager> {
  return (await createEventManager(EventManagerTypes.SYSTEM, name, config)) as ISystemEventManager;
}

/**
 * Create coordination event manager with convenience
 *
 * @param name
 * @param config
 */
export async function createCoordinationEventBus(
  name: string = 'default-coordination',
  config?: Partial<EventManagerConfig>
): Promise<ICoordinationEventManager> {
  return (await createEventManager(
    EventManagerTypes.COORDINATION,
    name,
    config
  )) as ICoordinationEventManager;
}

/**
 * Create communication event manager with convenience
 *
 * @param name
 * @param config
 */
export async function createCommunicationEventBus(
  name: string = 'default-communication',
  config?: Partial<EventManagerConfig>
): Promise<ICommunicationEventManager> {
  return (await createEventManager(
    EventManagerTypes.COMMUNICATION,
    name,
    config
  )) as ICommunicationEventManager;
}

/**
 * Create monitoring event manager with convenience
 *
 * @param name
 * @param config
 */
export async function createMonitoringEventBus(
  name: string = 'default-monitoring',
  config?: Partial<EventManagerConfig>
): Promise<IMonitoringEventManager> {
  return (await createEventManager(
    EventManagerTypes.MONITORING,
    name,
    config
  )) as IMonitoringEventManager;
}

export default UELFactory;
