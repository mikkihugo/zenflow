/**
 * UEL (Unified Event Layer) - Event Manager System.
 *
 * Comprehensive event manager for lifecycle management, factory registration,
 * and coordinated event processing across all UEL components.
 *
 * @file Event Manager Implementation following UACL/USL patterns.
 */
import type { IConfig, ILogger } from '../../core/interfaces/base-interfaces.ts';
import type { EventManagerConfig, EventManagerStatus, EventManagerType, IEventManager, IEventManagerFactory, SystemEvent } from './core/interfaces.ts';
import { EventManagerPresets } from './core/interfaces.ts';
import type { ICommunicationEventManager, ICoordinationEventManager, IDatabaseEventManager, IInterfaceEventManager, IMemoryEventManager, IMonitoringEventManager, INeuralEventManager, ISystemEventManager, IWorkflowEventManager } from './factories.ts';
import { EventRegistry } from './registry.ts';
/**
 * Configuration options for creating new event managers.
 *
 * @interface EventManagerCreationOptions
 * @example
 * ```typescript
 * const options: EventManagerCreationOptions = {
 *   type: EventManagerTypes.SYSTEM,
 *   name: 'critical-system',
 *   preset: 'REAL_TIME',
 *   autoStart: true,
 *   healthMonitoring: {
 *     enabled: true,
 *     interval: 30000,
 *     timeout: 5000
 *   },
 *   recovery: {
 *     autoRestart: true,
 *     maxRestarts: 3,
 *     backoffMultiplier: 2
 *   }
 * };
 * ```
 */
export interface EventManagerCreationOptions {
    /** Type of event manager to create (system, coordination, etc.) */
    type: EventManagerType;
    /** Unique name/identifier for the manager */
    name: string;
    /** Optional configuration overrides for the manager */
    config?: Partial<EventManagerConfig>;
    /** Preset configuration to apply (REAL_TIME, BATCH_PROCESSING, etc.) */
    preset?: keyof typeof EventManagerPresets;
    /** Whether to automatically start the manager after creation */
    autoStart?: boolean;
    /** Health monitoring configuration */
    healthMonitoring?: {
        /** Whether health monitoring is enabled */
        enabled: boolean;
        /** Health check interval in milliseconds */
        interval: number;
        /** Health check timeout in milliseconds */
        timeout: number;
    };
    /** Automatic recovery settings */
    recovery?: {
        /** Whether to automatically restart failed managers */
        autoRestart: boolean;
        /** Maximum number of restart attempts */
        maxRestarts: number;
        /** Multiplier for backoff delay between restarts */
        backoffMultiplier: number;
    };
}
/**
 * Connection management for event manager integration.
 *
 * @example
 */
export interface ConnectionManager {
    /** Active connections by type */
    connections: Map<EventManagerType, Set<IEventManager>>;
    /** Connection health status */
    health: Map<string, {
        healthy: boolean;
        lastCheck: Date;
        failures: number;
    }>;
    /** Auto-reconnect settings */
    autoReconnect: boolean;
    /** Maximum reconnection attempts */
    maxReconnectAttempts: number;
    /** Connection timeout */
    connectionTimeout: number;
}
/**
 * Event manager coordination settings.
 *
 * @example
 */
export interface CoordinationSettings {
    /** Enable cross-manager event routing */
    crossManagerRouting: boolean;
    /** Event deduplication */
    eventDeduplication: boolean;
    /** Batch event processing */
    batchProcessing: {
        enabled: boolean;
        batchSize: number;
        flushInterval: number;
    };
    /** Priority queue settings */
    priorityQueue: {
        enabled: boolean;
        maxSize: number;
        processingDelay: number;
    };
}
/**
 * Manager statistics and metrics.
 *
 * @example
 */
export interface ManagerStatistics {
    /** Total managers created */
    totalCreated: number;
    /** Active managers */
    activeManagers: number;
    /** Failed managers */
    failedManagers: number;
    /** Recovery attempts */
    recoveryAttempts: number;
    /** Successful recoveries */
    successfulRecoveries: number;
    /** Average startup time */
    averageStartupTime: number;
    /** Total events processed */
    totalEventsProcessed: number;
    /** Events per second */
    eventsPerSecond: number;
    /** Average latency */
    averageLatency: number;
}
/**
 * Main event manager class for comprehensive UEL management.
 *
 * Provides centralized management of event managers, factories, and coordination.
 * Handles lifecycle management, health monitoring, and recovery operations.
 *
 * @class EventManager
 * @example
 * ```typescript
 * // Create and initialize event manager
 * const eventManager = new EventManager(logger, config);
 * await eventManager.initialize({
 *   healthMonitoring: true,
 *   autoRegisterFactories: true
 * });
 *
 * // Create specialized event managers
 * const systemManager = await eventManager.createSystemEventManager('core-system');
 * const coordManager = await eventManager.createCoordinationEventManager('swarm-coord');
 *
 * // Monitor system health
 * const healthStatus = await eventManager.performHealthCheck();
 * const metrics = await eventManager.getGlobalMetrics();
 * ```
 */
export declare class EventManager {
    private _logger;
    private _config;
    private registry;
    private activeManagers;
    private factoryCache;
    private connectionManager;
    private coordinationSettings;
    private statistics;
    private initialized;
    private healthCheckInterval?;
    private recoveryAttempts;
    constructor(_logger: ILogger, _config: IConfig);
    /**
     * Initialize the event manager system.
     *
     * Sets up the registry, registers default factories, and starts health monitoring.
     *
     * @param options - Initialization configuration options.
     * @param options.autoRegisterFactories - Whether to register default factories (default: true).
     * @param options.healthMonitoring - Whether to enable health monitoring (default: true).
     * @param options.coordination - Coordination settings overrides.
     * @param options.connection - Connection manager overrides.
     * @throws {Error} If initialization fails.
     * @example
     * ```typescript
     * await eventManager.initialize({
     *   autoRegisterFactories: true,
     *   healthMonitoring: true,
     *   coordination: {
     *     crossManagerRouting: true,
     *     eventDeduplication: true
     *   }
     * });
     * ```
     */
    initialize(options?: {
        autoRegisterFactories?: boolean;
        healthMonitoring?: boolean;
        coordination?: Partial<CoordinationSettings>;
        connection?: Partial<ConnectionManager>;
    }): Promise<void>;
    /**
     * Create and register a new event manager.
     *
     * Creates a new event manager instance using the appropriate factory,
     * registers it with the system, and optionally starts it.
     *
     * @template T - Event manager type.
     * @param options - Configuration options for manager creation.
     * @returns Promise resolving to the created event manager.
     * @throws {Error} If manager creation fails.
     * @example
     * ```typescript
     * const manager = await eventManager.createEventManager({
     *   type: EventManagerTypes.SYSTEM,
     *   name: 'core-system',
     *   preset: 'REAL_TIME',
     *   autoStart: true,
     *   config: {
     *     maxListeners: 1000,
     *     processing: { strategy: 'immediate' }
     *   }
     * });
     * ```
     */
    createEventManager<T extends EventManagerType>(options: EventManagerCreationOptions & {
        type: T;
    }): Promise<IEventManager>;
    /**
     * Create system event manager with UEL integration.
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
     * Create communication event manager for protocols.
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
     * Get event manager by name.
     *
     * @param name
     */
    getEventManager(name: string): IEventManager | undefined;
    /**
     * Get all event managers by type.
     *
     * @param type
     */
    getEventManagersByType(type: EventManagerType): IEventManager[];
    /**
     * Get all active event managers.
     */
    getAllEventManagers(): Map<string, IEventManager>;
    /**
     * Remove and destroy event manager.
     *
     * @param name
     */
    removeEventManager(name: string): Promise<void>;
    /**
     * Restart event manager with recovery logic.
     *
     * @param name
     */
    restartEventManager(name: string): Promise<void>;
    /**
     * Perform comprehensive health check.
     */
    performHealthCheck(): Promise<Map<string, EventManagerStatus>>;
    /**
     * Get global system metrics.
     */
    getGlobalMetrics(): Promise<{
        registry: Awaited<ReturnType<EventRegistry['getGlobalMetrics']>>;
        manager: ManagerStatistics;
        connections: {
            totalConnections: number;
            healthyConnections: number;
            connectionsByType: Record<EventManagerType, number>;
        };
    }>;
    /**
     * Broadcast event to all managers or specific type.
     *
     * @param event
     * @param options
     * @param options.type
     * @param options.excludeManagers
     */
    broadcast<T extends SystemEvent>(event: T, options?: {
        type?: EventManagerType;
        excludeManagers?: string[];
    }): Promise<void>;
    /**
     * Register event manager factory.
     *
     * @param type
     * @param factory
     */
    registerFactory<T extends EventManagerConfig>(type: EventManagerType, factory: IEventManagerFactory<T>): void;
    /**
     * Get comprehensive system status.
     */
    getSystemStatus(): Promise<{
        initialized: boolean;
        totalManagers: number;
        healthyManagers: number;
        healthPercentage: number;
        status: 'healthy' | 'warning' | 'critical';
        registry: ReturnType<EventRegistry['getRegistryStats']>;
        statistics: ManagerStatistics;
        uptime: number;
    }>;
    /**
     * Shutdown all event managers and cleanup.
     */
    shutdown(): Promise<void>;
    /**
     * Private methods for internal operations.
     */
    private getOrCreateFactory;
    private mergeConfiguration;
    private registerDefaultFactories;
    private startHealthMonitoring;
    private stopHealthMonitoring;
}
export default EventManager;
//# sourceMappingURL=manager.d.ts.map