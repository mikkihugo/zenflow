/**
 * UEL (Unified Event Layer) - Event Registry System.
 *
 * Central registry for managing all event types, factories, and lifecycle management.
 */
import { type Logger } from '@claude-zen/foundation';
import type { EventManagerConfig, EventManagerType, EventManager, EventManagerFactory } from './core/interfaces';
/**
 * Registry entry for managing event manager instances and their lifecycle.
 */
export interface EventRegistryEntry {
    /** The event manager instance */
    manager: EventManager;
    /** Factory used to create this manager */
    factory?: EventManagerFactory;
    /** Configuration used to create this manager */
    config: EventManagerConfig;
    /** Timestamp when this manager was created */
    created: Date;
    /** Timestamp of last access */
    lastAccessed: Date;
    /** Timestamp of last health check */
    lastHealthCheck?: Date;
    /** Current health status */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Usage statistics */
    usage: {
        accessCount: number;
        totalEvents: number;
        totalSubscriptions: number;
        errorCount: number;
    };
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Event Registry for centralized event manager lifecycle management.
 */
export declare class EventRegistry {
    private _managers;
    private _factories;
    private _logger;
    constructor(logger?: Logger);
    /**
     * Register an event manager factory for a specific type.
     */
    registerFactory(type: EventManagerType, factory: EventManagerFactory): void;
    /**
     * Register an event manager instance.
     */
    register(manager: EventManager, config?: EventManagerConfig): void;
    /**
     * Get an event manager by name.
     */
    get(name: string): EventManager | undefined;
    /**
     * List all registered event manager names.
     */
    list(): string[];
    /**
     * Check if an event manager is registered.
     */
    has(name: string): boolean;
    /**
     * Remove an event manager from the registry.
     */
    remove(name: string): Promise<boolean>;
    /**
     * Create a new event manager using a registered factory.
     */
    create(config: EventManagerConfig): Promise<EventManager>;
    /**
     * Get registry statistics.
     */
    getStats(): {
        totalManagers: number;
        totalFactories: number;
        managersByType: Record<EventManagerType, number>;
        healthyManagers: number;
        unhealthyManagers: number;
    };
    /**
     * Perform health checks on all registered managers.
     */
    performHealthChecks(): Promise<void>;
    /**
     * Initialize the registry.
     */
    initialize(): Promise<void>;
    /**
     * Register a manager.
     */
    registerManager(name: string, manager: EventManager, config: EventManagerConfig): Promise<void>;
    /**
     * Find event manager by name.
     */
    findEventManager(name: string): EventManager | undefined;
    /**
     * Get event managers by type.
     */
    getEventManagersByType(type: EventManagerType): EventManager[];
    /**
     * Health check all managers.
     */
    healthCheckAll(): Promise<any>;
    /**
     * Get global metrics.
     */
    getGlobalMetrics(): Promise<any>;
    /**
     * Broadcast to type.
     */
    broadcastToType(type: EventManagerType, event: any): Promise<void>;
    /**
     * Broadcast to all.
     */
    broadcast(event: any): Promise<void>;
    /**
     * Get registry stats.
     */
    getRegistryStats(): any;
    /**
     * Shutdown all managers.
     */
    shutdownAll(): Promise<void>;
    /**
     * Get factory.
     */
    getFactory(type: EventManagerType): EventManagerFactory | undefined;
    /**
     * Cleanup the registry and destroy all managers.
     */
    cleanup(): Promise<void>;
}
/**
 * Get the global event registry instance.
 */
export declare function getEventRegistry(): EventRegistry;
/**
 * Reset the global registry (mainly for testing).
 */
export declare function resetEventRegistry(): void;
//# sourceMappingURL=registry.d.ts.map