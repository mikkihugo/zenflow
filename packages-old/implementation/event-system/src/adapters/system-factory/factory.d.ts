/**
 * @file System Event Factory - Main Factory Class
 *
 * Core factory class for creating system event managers.
 */
import type { Config, Logger } from '@claude-zen/foundation';
import { EventEmitter } from '@claude-zen/foundation';
import type { EventManager, EventManagerConfig, EventManagerFactory } from '../../core/interfaces';
import type { SystemEventFactoryConfig, SystemFactoryMetrics, SystemHealthResult } from './types';
/**
 * System Event Factory implementation.
 *
 * Factory for creating and managing system event manager instances
 * with comprehensive lifecycle management and system orchestration.
 */
export declare class SystemEventFactory extends EventEmitter implements EventManagerFactory<EventManagerConfig> {
    private readonly factoryConfig;
    private readonly systemConfig?;
    private readonly logger;
    private readonly instances;
    private readonly startTime;
    private totalCreated;
    private totalErrors;
    private systemMetrics;
    constructor(factoryConfig?: SystemEventFactoryConfig, logger?: Logger, systemConfig?: Config);
    /**
     * Create a new system event manager instance.
     */
    create(config: EventManagerConfig): Promise<EventManager>;
    /**
     * Create multiple system event managers.
     */
    createMultiple(configs: EventManagerConfig[]): Promise<EventManager[]>;
    /**
     * Get an existing system event manager instance.
     */
    get(name: string): EventManager | undefined;
    /**
     * List all system event manager instances.
     */
    list(): EventManager[];
    /**
     * Check if a system event manager instance exists.
     */
    has(name: string): boolean;
    /**
     * Remove and destroy a system event manager instance.
     */
    remove(name: string): Promise<boolean>;
    /**
     * Get factory metrics including system performance.
     */
    getFactoryMetrics(): Promise<SystemFactoryMetrics>;
    /**
     * Perform health check on the factory and all instances.
     */
    healthCheck(): Promise<SystemHealthResult>;
    /**
     * Update system metrics from execution results.
     */
    updateSystemMetrics(metrics: Partial<typeof this.systemMetrics>): void;
    /**
     * Shutdown the factory and all managed instances.
     */
    shutdown(): Promise<void>;
    /**
     * Get the number of active instances.
     */
    getActiveCount(): number;
    private startSystemMonitoring;
    private determineOverallHealth;
}
//# sourceMappingURL=factory.d.ts.map