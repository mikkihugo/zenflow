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
import type { IConfig, ILogger } from '../../core/interfaces/base-interfaces.ts';
import type { EventManagerConfig, EventManagerStatus, EventManagerType, IEventManager, IEventManagerFactory, IEventManagerRegistry, SystemEvent } from './core/interfaces.ts';
import { EventManagerPresets } from './core/interfaces.ts';
import type { CommunicationEvent, CoordinationEvent, DatabaseEvent, InterfaceEvent, MemoryEvent, MonitoringEvent, NeuralEvent, SystemLifecycleEvent, WorkflowEvent } from './types.ts';
/**
 * Configuration for event manager creation through factories.
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
    customImplementation?: new (...args: any[]) => IEventManager;
    /** Preset configuration to apply (REAL_TIME, BATCH_PROCESSING, etc.) */
    preset?: keyof typeof EventManagerPresets;
}
/**
 * Event manager type mapping for better type safety.
 */
export type EventManagerTypeMap<T extends EventManagerType> = T extends 'system' ? ISystemEventManager : T extends 'coordination' ? ICoordinationEventManager : T extends 'communication' ? ICommunicationEventManager : T extends 'monitoring' ? IMonitoringEventManager : T extends 'interface' ? IInterfaceEventManager : T extends 'neural' ? INeuralEventManager : T extends 'database' ? IDatabaseEventManager : T extends 'memory' ? IMemoryEventManager : T extends 'workflow' ? IWorkflowEventManager : IEventManager;
/**
 * Event manager registry for managing event manager instances.
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
 * Event manager transaction for batch operations.
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
 * Specialized system event manager interface for system lifecycle events.
 *
 * Extends the base event manager with system-specific methods for handling.
 * Application lifecycle, startup, shutdown, and health monitoring events..
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
     * Emit a system lifecycle event.
     *
     * @param event - System lifecycle event to emit.
     * @throws {EventEmissionError} If emission fails.
     */
    emitSystemEvent(event: SystemLifecycleEvent): Promise<void>;
    /**
     * Subscribe to system lifecycle events.
     *
     * @param listener - Function to handle system events.
     * @returns Subscription ID for unsubscribing.
     */
    subscribeSystemEvents(listener: (event: SystemLifecycleEvent) => void): string;
    /**
     * Get overall system health status.
     *
     * @returns Promise resolving to health summary with any issues.
     */
    getSystemHealth(): Promise<{
        healthy: boolean;
        issues: string[];
    }>;
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
    getMonitoringData(): Promise<{
        alerts: number;
        metrics: Record<string, number>;
        health: string;
    }>;
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
    getMemoryMetrics(): Promise<{
        cacheHitRate: number;
        memoryUsage: number;
        gcFrequency: number;
    }>;
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
 * Main factory class for creating UEL event manager instances.
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
export declare class UELFactory {
    private _logger;
    private _config;
    private managerCache;
    private factoryCache;
    private managerRegistry;
    private transactionLog;
    constructor(_logger: ILogger, _config: IConfig);
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
    createEventManager<T extends EventManagerType>(factoryConfig: EventManagerFactoryConfig & {
        managerType: T;
    }): Promise<EventManagerTypeMap<T>>;
    /**
     * Create system event manager with convenience methods.
     *
     * @param name
     * @param config
     */
    createSystemEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<ISystemEventManager>;
    /**
     * Create coordination event manager for swarm operations.
     *
     * @param name
     * @param config
     */
    createCoordinationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<ICoordinationEventManager>;
    /**
     * Create communication event manager for protocol events.
     *
     * @param name
     * @param config
     */
    createCommunicationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<ICommunicationEventManager>;
    /**
     * Create monitoring event manager for metrics and health.
     *
     * @param name
     * @param config
     */
    createMonitoringEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<IMonitoringEventManager>;
    /**
     * Create interface event manager for UI interactions.
     *
     * @param name
     * @param config
     */
    createInterfaceEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<IInterfaceEventManager>;
    /**
     * Create neural event manager for AI operations.
     *
     * @param name
     * @param config
     */
    createNeuralEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<INeuralEventManager>;
    /**
     * Create database event manager for DB operations.
     *
     * @param name
     * @param config
     */
    createDatabaseEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<IDatabaseEventManager>;
    /**
     * Create memory event manager for cache operations.
     *
     * @param name
     * @param config
     */
    createMemoryEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<IMemoryEventManager>;
    /**
     * Create workflow event manager for orchestration.
     *
     * @param name
     * @param config
     */
    createWorkflowEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<IWorkflowEventManager>;
    /**
     * Get event manager by ID from registry.
     *
     * @param managerId
     */
    getEventManager(managerId: string): IEventManager | null;
    /**
     * List all registered event managers.
     */
    listEventManagers(): EventManagerRegistry;
    /**
     * Health check for all event managers.
     */
    healthCheckAll(): Promise<EventManagerStatus[]>;
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
    executeTransaction(operations: Array<{
        manager: string;
        operation: 'emit' | 'subscribe' | 'unsubscribe';
        data: any;
    }>): Promise<EventManagerTransaction>;
    /**
     * Stop and clean up all event managers.
     */
    shutdownAll(): Promise<void>;
    /**
     * Get factory statistics.
     */
    getStats(): {
        totalManagers: number;
        managersByType: Record<EventManagerType, number>;
        managersByStatus: Record<string, number>;
        cacheSize: number;
        transactions: number;
    };
    /**
     * Private methods for internal operations.
     */
    private initializeFactories;
    private getOrCreateFactory;
    private validateManagerConfig;
    private mergeWithDefaults;
    private registerManager;
    private updateManagerUsage;
    private generateCacheKey;
    private generateManagerId;
    private generateTransactionId;
}
/**
 * Event manager registry implementation.
 *
 * @example
 */
export declare class UELRegistry implements IEventManagerRegistry {
    private _logger;
    private factories;
    private globalEventManagers;
    constructor(_logger: ILogger);
    registerFactory<T extends EventManagerConfig>(type: EventManagerType, factory: IEventManagerFactory<T>): void;
    getFactory<T extends EventManagerConfig>(type: EventManagerType): IEventManagerFactory<T> | undefined;
    listFactoryTypes(): EventManagerType[];
    getAllEventManagers(): Map<string, IEventManager>;
    findEventManager(name: string): IEventManager | undefined;
    getEventManagersByType(type: EventManagerType): IEventManager[];
    healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
    getGlobalMetrics(): Promise<{
        totalManagers: number;
        totalEvents: number;
        totalSubscriptions: number;
        averageLatency: number;
        errorRate: number;
    }>;
    shutdownAll(): Promise<void>;
    broadcast<T extends SystemEvent>(event: T): Promise<void>;
    broadcastToType<T extends SystemEvent>(type: EventManagerType, event: T): Promise<void>;
}
/**
 * Create a simple event manager for quick setup.
 *
 * @param managerType
 * @param name
 * @param config
 * @example
 */
export declare function createEventManager<T extends EventManagerType>(managerType: T, name: string, config?: Partial<EventManagerConfig>): Promise<EventManagerTypeMap<T>>;
/**
 * Create system event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export declare function createSystemEventBus(name?: string, config?: Partial<EventManagerConfig>): Promise<ISystemEventManager>;
/**
 * Create coordination event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export declare function createCoordinationEventBus(name?: string, config?: Partial<EventManagerConfig>): Promise<ICoordinationEventManager>;
/**
 * Create communication event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export declare function createCommunicationEventBus(name?: string, config?: Partial<EventManagerConfig>): Promise<ICommunicationEventManager>;
/**
 * Create monitoring event manager with convenience.
 *
 * @param name
 * @param config
 * @example
 */
export declare function createMonitoringEventBus(name?: string, config?: Partial<EventManagerConfig>): Promise<IMonitoringEventManager>;
export default UELFactory;
//# sourceMappingURL=factories.d.ts.map