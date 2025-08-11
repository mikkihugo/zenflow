/**
 * UEL (Unified Event Layer) - Event Registry System.
 *
 * Central registry for managing all event types, factories, and lifecycle management.
 * Provides type-safe event registration, discovery, and health monitoring.
 *
 * @file Event Registry Implementation following UACL/USL patterns.
 */
import type { ILogger } from '../../core/interfaces/base-interfaces.ts';
import type { EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventManagerType, IEventManager, IEventManagerFactory, IEventManagerRegistry, SystemEvent } from './core/interfaces.ts';
/**
 * Registry entry for managing event manager instances and their lifecycle.
 *
 * Tracks the complete lifecycle and usage statistics of registered event managers.
 *
 * @interface EventRegistryEntry
 * @example
 * ```typescript
 * const entry: EventRegistryEntry = {
 *   manager: systemEventManager,
 *   factory: systemEventFactory,
 *   config: managerConfig,
 *   created: new Date(),
 *   lastAccessed: new Date(),
 *   lastHealthCheck: new Date(),
 *   status: 'healthy',
 *   usage: {
 *     accessCount: 150,
 *     totalEvents: 2500,
 *     totalSubscriptions: 25,
 *     errorCount: 2
 *   },
 *   metadata: {
 *     version: '1.0.0',
 *     tags: ['system', 'core']
 *   }
 * };
 * ```
 */
export interface EventRegistryEntry {
    /** The registered event manager instance */
    manager: IEventManager;
    /** Factory that created this manager */
    factory: IEventManagerFactory;
    /** Configuration used to create the manager */
    config: EventManagerConfig;
    /** Timestamp when the manager was created */
    created: Date;
    /** Timestamp when the manager was last accessed */
    lastAccessed: Date;
    /** Timestamp of the last health check */
    lastHealthCheck: Date;
    /** Current operational status of the manager */
    status: 'healthy' | 'unhealthy' | 'stopped' | 'error';
    /** Latest health check results */
    healthStatus?: EventManagerStatus;
    /** Latest performance metrics */
    metrics?: EventManagerMetrics;
    /** Usage statistics for monitoring and optimization */
    usage: {
        /** Number of times this manager has been accessed */
        accessCount: number;
        /** Total number of events processed */
        totalEvents: number;
        /** Total number of active subscriptions */
        totalSubscriptions: number;
        /** Total number of errors encountered */
        errorCount: number;
    };
    /** Additional metadata and tags for categorization */
    metadata: Record<string, any>;
}
/**
 * Event type registry for managing event type configurations.
 *
 * @example
 */
export interface EventTypeRegistry {
    [eventType: string]: {
        /** Event type identifier */
        type: string;
        /** Event category */
        category: string;
        /** Default priority */
        priority: number;
        /** Schema for validation */
        schema?: any;
        /** Associated manager types */
        managerTypes: EventManagerType[];
        /** Configuration options */
        config: Record<string, any>;
        /** Registration timestamp */
        registered: Date;
        /** Usage statistics */
        usage: {
            totalEmissions: number;
            totalSubscriptions: number;
            averageLatency: number;
        };
    };
}
/**
 * Factory registry for managing event manager factories.
 *
 * @example
 */
export interface FactoryRegistry {
    [key: string]: {
        /** Factory instance */
        factory: IEventManagerFactory;
        /** Factory metadata */
        metadata: {
            name: string;
            version: string;
            capabilities: string[];
            supported: EventManagerType[];
        };
        /** Registration timestamp */
        registered: Date;
        /** Usage statistics */
        usage: {
            managersCreated: number;
            totalRequests: number;
            successRate: number;
        };
    } | undefined;
}
/**
 * Health monitoring configuration.
 *
 * @example
 */
export interface HealthMonitoringConfig {
    /** Health check interval in milliseconds */
    checkInterval: number;
    /** Health check timeout */
    timeout: number;
    /** Number of failed checks before marking unhealthy */
    failureThreshold: number;
    /** Auto-recovery attempts */
    autoRecovery: boolean;
    /** Recovery retry count */
    maxRecoveryAttempts: number;
    /** Notifications on health changes */
    notifyOnStatusChange: boolean;
}
/**
 * Event discovery configuration.
 *
 * @example
 */
export interface EventDiscoveryConfig {
    /** Auto-discover event types */
    autoDiscover: boolean;
    /** Event type patterns to match */
    patterns: string[];
    /** Directories to scan for events */
    scanPaths: string[];
    /** File extensions to include */
    fileExtensions: string[];
}
/**
 * Main event registry implementation for centralized event manager management.
 *
 * Provides centralized registration, discovery, and lifecycle management of event managers.
 * And their factories. Includes health monitoring, metrics collection, and event broadcasting..
 *
 * @class EventRegistry
 * @implements IEventManagerRegistry
 * @example
 * ```typescript
 * // Initialize registry
 * const registry = new EventRegistry(logger);
 * await registry.initialize({
 *   healthMonitoring: { checkInterval: 30000, timeout: 5000 },
 *   discovery: { autoDiscover: true, patterns: ['*Event'] }
 * });
 *
 * // Register factory and managers
 * registry.registerFactory(EventManagerTypes.SYSTEM, systemFactory);
 * registry.registerManager('system-1', manager, factory, config);
 *
 * // Health monitoring and metrics
 * const healthStatus = await registry.healthCheckAll();
 * const metrics = await registry.getGlobalMetrics();
 *
 * // Event broadcasting
 * await registry.broadcast(globalEvent);
 * await registry.broadcastToType(EventManagerTypes.SYSTEM, systemEvent);
 * ```
 */
export declare class EventRegistry implements IEventManagerRegistry {
    private _logger;
    private eventManagers;
    private factories;
    private eventTypes;
    private factoryRegistry;
    private healthMonitoring;
    private discoveryConfig;
    private healthCheckInterval?;
    private initialized;
    constructor(_logger: ILogger);
    /**
     * Initialize the registry system.
     *
     * Sets up health monitoring, event discovery, and registers default event types.
     *
     * @param config - Initialization configuration options.
     * @param config.healthMonitoring - Health monitoring settings overrides.
     * @param config.discovery - Event discovery settings overrides.
     * @param config.autoRegisterDefaults - Whether to register default event types (default: true).
     * @throws {Error} If initialization fails.
     * @example
     * ```typescript
     * await registry.initialize({
     *   healthMonitoring: {
     *     checkInterval: 30000,
     *     timeout: 5000,
     *     failureThreshold: 3,
     *     autoRecovery: true
     *   },
     *   discovery: {
     *     autoDiscover: true,
     *     patterns: ['*Event', '*event'],
     *     scanPaths: ['./events']
     *   },
     *   autoRegisterDefaults: true
     * });
     * ```
     */
    initialize(config?: {
        healthMonitoring?: Partial<HealthMonitoringConfig>;
        discovery?: Partial<EventDiscoveryConfig>;
        autoRegisterDefaults?: boolean;
    }): Promise<void>;
    /**
     * Register an event manager factory for a specific type.
     *
     * Registers a factory that can create event managers of the specified type.
     * Updates the factory registry with metadata and usage tracking.
     *
     * @template T - Configuration type extending EventManagerConfig.
     * @param type - Event manager type this factory creates.
     * @param factory - Factory instance to register.
     * @throws {Error} If factory registration fails.
     * @example
     * ```typescript
     * const systemFactory = new SystemEventManagerFactory();
     * registry.registerFactory(EventManagerTypes.SYSTEM, systemFactory);
     * ```
     */
    registerFactory<T extends EventManagerConfig>(type: EventManagerType, factory: IEventManagerFactory<T>): void;
    /**
     * Get factory for event manager type.
     */
    getFactory<T extends EventManagerConfig>(type: EventManagerType): IEventManagerFactory<T> | undefined;
    /**
     * List all registered factory types.
     */
    listFactoryTypes(): EventManagerType[];
    /**
     * Register an event manager instance with the registry.
     *
     * Creates a registry entry to track the manager's lifecycle, usage, and health.
     *
     * @param name - Unique name for the event manager.
     * @param manager - Event manager instance to register.
     * @param factory - Factory that created this manager.
     * @param config - Configuration used to create the manager.
     * @example
     * ```typescript
     * registry.registerManager(
     *   'system-core',
     *   systemManager,
     *   systemFactory,
     *   managerConfig
     * );
     * ```
     */
    registerManager(name: string, manager: IEventManager, factory: IEventManagerFactory, config: EventManagerConfig): void;
    /**
     * Find event manager by name.
     */
    findEventManager(name: string): IEventManager | undefined;
    /**
     * Get all event managers.
     */
    getAllEventManagers(): Map<string, IEventManager>;
    /**
     * Get event managers by type.
     */
    getEventManagersByType(type: EventManagerType): IEventManager[];
    /**
     * Get event managers by status.
     */
    getEventManagersByStatus(status: EventRegistryEntry['status']): IEventManager[];
    /**
     * Register event type for discovery and validation.
     */
    registerEventType(eventType: string, config: {
        category: string;
        priority?: number;
        schema?: any;
        managerTypes: EventManagerType[];
        options?: Record<string, any>;
    }): void;
    /**
     * Get registered event types.
     */
    getEventTypes(): string[];
    /**
     * Get event type configuration.
     */
    getEventTypeConfig(eventType: string): EventTypeRegistry[string] | undefined;
    /**
     * Perform health check on all event managers.
     */
    healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
    /**
     * Get global metrics across all event managers.
     */
    getGlobalMetrics(): Promise<{
        totalManagers: number;
        totalEvents: number;
        totalSubscriptions: number;
        averageLatency: number;
        errorRate: number;
        managersByType: Record<EventManagerType, number>;
        managersByStatus: Record<string, number>;
        factoryUsage: Record<EventManagerType, number>;
    }>;
    /**
     * Broadcast event to all event managers.
     */
    broadcast<T extends SystemEvent>(event: T): Promise<void>;
    /**
     * Broadcast event to specific event manager type.
     */
    broadcastToType<T extends SystemEvent>(type: EventManagerType, event: T): Promise<void>;
    /**
     * Shutdown all event managers.
     */
    shutdownAll(): Promise<void>;
    /**
     * Get registry statistics.
     */
    getRegistryStats(): {
        totalManagers: number;
        totalFactories: number;
        totalEventTypes: number;
        healthyManagers: number;
        managersByType: Record<EventManagerType, number>;
        factoryUsage: Record<EventManagerType, number>;
        uptime: number;
    };
    /**
     * Export registry configuration.
     */
    exportConfig(): {
        eventTypes: EventTypeRegistry;
        healthMonitoring: HealthMonitoringConfig;
        discovery: EventDiscoveryConfig;
        managers: Array<{
            name: string;
            type: EventManagerType;
            config: EventManagerConfig;
            status: string;
            usage: EventRegistryEntry['usage'];
        }>;
    };
    /**
     * Private methods for internal operations.
     */
    private performHealthCheck;
    private startHealthMonitoring;
    private stopHealthMonitoring;
    private registerDefaultEventTypes;
    private performEventDiscovery;
}
export default EventRegistry;
//# sourceMappingURL=registry.d.ts.map