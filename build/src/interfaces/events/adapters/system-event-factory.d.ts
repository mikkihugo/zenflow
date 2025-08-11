/**
 * System Event Manager Factory.
 *
 * Factory implementation for creating SystemEventAdapter instances.
 * Following the UEL factory pattern and integrating with the main UELFactory.
 */
/**
 * @file Interface implementation: system-event-factory.
 */
import type { IConfig, ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { IEventManager, IEventManagerFactory } from '../core/interfaces.ts';
import type { SystemEventAdapterConfig } from './system-event-adapter.ts';
import { SystemEventAdapter } from './system-event-adapter.ts';
/**
 * System Event Manager Factory.
 *
 * Creates and manages SystemEventAdapter instances for system-level event management.
 * Integrates with the UEL factory system to provide unified access to system events.
 *
 * @example
 */
export declare class SystemEventManagerFactory implements IEventManagerFactory<SystemEventAdapterConfig> {
    private logger;
    private config;
    private instances;
    constructor(logger?: ILogger, config?: IConfig);
    /**
     * Create a new SystemEventAdapter instance.
     *
     * @param config
     */
    create(config: SystemEventAdapterConfig): Promise<IEventManager>;
    /**
     * Create multiple system event managers.
     *
     * @param configs
     */
    createMultiple(configs: SystemEventAdapterConfig[]): Promise<IEventManager[]>;
    /**
     * Get existing system event manager by name.
     *
     * @param name
     */
    get(name: string): IEventManager | undefined;
    /**
     * List all system event managers.
     */
    list(): IEventManager[];
    /**
     * Check if system event manager exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove system event manager.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Health check all system event managers.
     */
    healthCheckAll(): Promise<Map<string, any>>;
    /**
     * Get metrics from all system event managers.
     */
    getMetricsAll(): Promise<Map<string, any>>;
    /**
     * Start all system event managers.
     */
    startAll(): Promise<void>;
    /**
     * Stop all system event managers.
     */
    stopAll(): Promise<void>;
    /**
     * Shutdown the factory and all managed instances.
     */
    shutdown(): Promise<void>;
    /**
     * Get active manager count.
     */
    getActiveCount(): number;
    /**
     * Get factory metrics.
     */
    getFactoryMetrics(): {
        totalManagers: number;
        runningManagers: number;
        errorCount: number;
        uptime: number;
    };
    /**
     * Validate system event manager configuration.
     *
     * @param config
     */
    private validateConfig;
}
/**
 * Convenience factory functions for system event managers.
 */
/**
 * Create a system event manager with default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createSystemEventManager(name: string, overrides?: Partial<SystemEventAdapterConfig>): Promise<SystemEventAdapter>;
/**
 * Create system event manager for core system integration.
 *
 * @param name
 * @example
 */
export declare function createCoreSystemEventManager(name?: string): Promise<SystemEventAdapter>;
/**
 * Create system event manager for application coordination.
 *
 * @param name
 * @example
 */
export declare function createApplicationCoordinatorEventManager(name?: string): Promise<SystemEventAdapter>;
/**
 * Create system event manager for error recovery integration.
 *
 * @param name
 * @example
 */
export declare function createErrorRecoveryEventManager(name?: string): Promise<SystemEventAdapter>;
/**
 * Create comprehensive system event manager for full system monitoring.
 *
 * @param name
 * @example
 */
export declare function createComprehensiveSystemEventManager(name?: string): Promise<SystemEventAdapter>;
export default SystemEventManagerFactory;
//# sourceMappingURL=system-event-factory.d.ts.map