/**
 * @file Monitoring Event Factory - Main Factory Class
 *
 * Core factory class for creating monitoring event managers.
 */
import type { Config, Logger } from '@claude-zen/foundation';
import { EventEmitter } from '@claude-zen/foundation';
import type { EventManager, EventManagerConfig, EventManagerFactory } from '../../core/interfaces';
import type { MonitoringEventFactoryConfig, MonitoringFactoryMetrics, MonitoringHealthResult } from './types';
/**
 * Monitoring Event Factory implementation.
 *
 * Factory for creating and managing monitoring event manager instances
 * with comprehensive lifecycle management and monitoring orchestration.
 */
export declare class MonitoringEventFactory extends EventEmitter implements EventManagerFactory<EventManagerConfig> {
    private readonly factoryConfig;
    private readonly systemConfig?;
    private readonly logger;
    private readonly instances;
    private readonly startTime;
    private totalCreated;
    private totalErrors;
    private monitoringMetrics;
    constructor(factoryConfig?: MonitoringEventFactoryConfig, logger?: Logger, systemConfig?: Config);
    /**
     * Create a new monitoring event manager instance.
     */
    create(config: EventManagerConfig): Promise<EventManager>;
    /**
     * Create multiple monitoring event managers.
     */
    createMultiple(configs: EventManagerConfig[]): Promise<EventManager[]>;
    /**
     * Get an existing monitoring event manager instance.
     */
    get(name: string): EventManager | undefined;
    /**
     * List all monitoring event manager instances.
     */
    list(): EventManager[];
    /**
     * Check if a monitoring event manager instance exists.
     */
    has(name: string): boolean;
    /**
     * Remove and destroy a monitoring event manager instance.
     */
    remove(name: string): Promise<boolean>;
    /**
     * Get factory metrics including monitoring performance.
     */
    getFactoryMetrics(): Promise<MonitoringFactoryMetrics>;
    /**
     * Perform health check on the factory and all instances.
     */
    healthCheck(): Promise<MonitoringHealthResult>;
    /**
     * Update monitoring metrics from execution results.
     */
    updateMonitoringMetrics(metrics: Partial<typeof this.monitoringMetrics>): void;
    /**
     * Shutdown the factory and all managed instances.
     */
    shutdown(): Promise<void>;
    /**
     * Get the number of active instances.
     */
    getActiveCount(): number;
    private startMonitoringSystem;
    private determineOverallHealth;
}
//# sourceMappingURL=factory.d.ts.map