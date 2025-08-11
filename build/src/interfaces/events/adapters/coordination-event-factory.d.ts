/**
 * Coordination Event Manager Factory.
 *
 * Factory implementation for creating CoordinationEventAdapter instances.
 * Following the UEL factory pattern and integrating with the main UELFactory.
 *
 * This factory specializes in creating coordination event managers for:
 * - Swarm coordination and lifecycle management
 * - Agent management and health monitoring
 * - Task distribution and execution tracking
 * - Inter-swarm communication and protocol management.
 */
/**
 * @file Interface implementation: coordination-event-factory.
 */
import type { IConfig, ILogger } from '../../../core/interfaces/base-interfaces.ts';
import type { IEventManager, IEventManagerFactory } from '../core/interfaces.ts';
import type { CoordinationEventAdapterConfig } from './coordination-event-adapter.ts';
import { CoordinationEventAdapter } from './coordination-event-adapter.ts';
/**
 * Coordination Event Manager Factory.
 *
 * Creates and manages CoordinationEventAdapter instances for coordination-level event management.
 * Integrates with the UEL factory system to provide unified access to coordination events.
 *
 * @example
 */
export declare class CoordinationEventManagerFactory implements IEventManagerFactory<CoordinationEventAdapterConfig> {
    private logger;
    private config;
    private instances;
    constructor(logger?: ILogger, config?: IConfig);
    /**
     * Create a new CoordinationEventAdapter instance.
     *
     * @param config
     */
    create(config: CoordinationEventAdapterConfig): Promise<IEventManager>;
    /**
     * Create multiple coordination event managers.
     *
     * @param configs
     */
    createMultiple(configs: CoordinationEventAdapterConfig[]): Promise<IEventManager[]>;
    /**
     * Get existing coordination event manager by name.
     *
     * @param name
     */
    get(name: string): IEventManager | undefined;
    /**
     * List all coordination event managers.
     */
    list(): IEventManager[];
    /**
     * Check if coordination event manager exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove coordination event manager.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Health check all coordination event managers.
     */
    healthCheckAll(): Promise<Map<string, any>>;
    /**
     * Get metrics from all coordination event managers.
     */
    getMetricsAll(): Promise<Map<string, any>>;
    /**
     * Start all coordination event managers.
     */
    startAll(): Promise<void>;
    /**
     * Stop all coordination event managers.
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
     * Validate coordination event manager configuration.
     *
     * @param config
     */
    private validateConfig;
}
/**
 * Convenience factory functions for coordination event managers.
 */
/**
 * Create a coordination event manager with default configuration.
 *
 * @param name
 * @param overrides
 * @example
 */
export declare function createCoordinationEventManager(name: string, overrides?: Partial<CoordinationEventAdapterConfig>): Promise<CoordinationEventAdapter>;
/**
 * Create coordination event manager for swarm coordination only.
 *
 * @param name
 * @example
 */
export declare function createSwarmCoordinationEventManager(name?: string): Promise<CoordinationEventAdapter>;
/**
 * Create coordination event manager for agent management only.
 *
 * @param name
 * @example
 */
export declare function createAgentManagementEventManager(name?: string): Promise<CoordinationEventAdapter>;
/**
 * Create coordination event manager for task orchestration only.
 *
 * @param name
 * @example
 */
export declare function createTaskOrchestrationEventManager(name?: string): Promise<CoordinationEventAdapter>;
/**
 * Create coordination event manager for protocol management only.
 *
 * @param name
 * @example
 */
export declare function createProtocolManagementEventManager(name?: string): Promise<CoordinationEventAdapter>;
/**
 * Create comprehensive coordination event manager for full coordination monitoring.
 *
 * @param name
 * @example
 */
export declare function createComprehensiveCoordinationEventManager(name?: string): Promise<CoordinationEventAdapter>;
/**
 * Create high-performance coordination event manager for production workloads.
 *
 * @param name
 * @example
 */
export declare function createHighPerformanceCoordinationEventManager(name?: string): Promise<CoordinationEventAdapter>;
/**
 * Create development coordination event manager with enhanced debugging.
 *
 * @param name
 * @example
 */
export declare function createDevelopmentCoordinationEventManager(name?: string): Promise<CoordinationEventAdapter>;
export default CoordinationEventManagerFactory;
//# sourceMappingURL=coordination-event-factory.d.ts.map