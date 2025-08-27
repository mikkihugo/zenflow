/**
 * @file Coordination Event Factory - Main Factory Class
 *
 * Main factory class for creating and managing coordination event adapters.
 */
import { EventEmitter } from '@claude-zen/foundation';
import type { EventManager, EventManagerFactory, EventManagerStatus, EventManagerMetrics } from '../../core/interfaces';
import type { CoordinationEventAdapterConfig } from '../coordination';
import type { CoordinationEventFactoryConfig, CoordinationFactoryMetrics } from './types';
/**
 * Coordination Event Manager Factory.
 *
 * Creates and manages CoordinationEventAdapter instances for coordination-level event management.
 * Integrates with the UEL factory system to provide unified access to coordination events.
 */
export declare class CoordinationEventFactory extends EventEmitter implements EventManagerFactory<CoordinationEventAdapterConfig> {
    private readonly logger;
    private readonly instances;
    private readonly factoryConfig;
    private readonly startTime;
    private totalCreated;
    private totalErrors;
    constructor(config?: CoordinationEventFactoryConfig);
    /**
     * Create new coordination event adapter instance.
     */
    create(config: CoordinationEventAdapterConfig): Promise<EventManager>;
    /**
     * Create multiple coordination event adapters.
     */
    createMultiple(configs: CoordinationEventAdapterConfig[]): Promise<EventManager[]>;
    /**
     * Get coordination event manager by name.
     */
    get(name: string): EventManager | undefined;
    /**
     * List all coordination event managers.
     */
    list(): EventManager[];
    /**
     * Check if coordination event manager exists.
     */
    has(name: string): boolean;
    /**
     * Remove coordination event manager by name.
     */
    remove(name: string): Promise<boolean>;
    /**
     * Health check all coordination event managers.
     */
    healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
    /**
     * Get metrics for all coordination event managers.
     */
    getMetricsAll(): Promise<Map<string, EventManagerMetrics>>;
    /**
     * Get active adapter count.
     */
    getActiveCount(): number;
    /**
     * Get factory metrics.
     */
    getFactoryMetrics(): CoordinationFactoryMetrics;
    /**
     * Shutdown factory and all coordination event managers.
     */
    shutdown(): Promise<void>;
    /**
     * Set up event forwarding from adapter to factory.
     */
    private setupEventForwarding;
}
//# sourceMappingURL=factory.d.ts.map