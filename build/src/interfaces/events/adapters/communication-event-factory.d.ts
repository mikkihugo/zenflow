/**
 * UEL Communication Event Factory.
 *
 * Factory implementation for creating and managing Communication Event Adapters.
 * Following the exact same patterns as system and coordination event factories.
 *
 * Provides centralized management, health monitoring, and metrics collection.
 * For all communication event adapters in the UEL system.
 */
/**
 * @file Interface implementation: communication-event-factory.
 */
import { EventEmitter } from 'node:events';
import type { EventManagerMetrics, EventManagerStatus, IEventManagerFactory } from '../core/interfaces.ts';
import { CommunicationEventAdapter, type CommunicationEventAdapterConfig } from './communication-event-adapter.ts';
/**
 * Communication Event Manager Factory.
 *
 * Manages the lifecycle of communication event adapters, providing:
 * - Centralized creation and configuration management
 * - Health monitoring and metrics collection
 * - Batch operations for multiple adapters
 * - Resource cleanup and graceful shutdown.
 *
 * @example
 */
export declare class CommunicationEventFactory extends EventEmitter implements IEventManagerFactory<CommunicationEventAdapterConfig> {
    private adapters;
    private logger;
    private startTime;
    private totalErrors;
    private totalCreated;
    constructor();
    /**
     * Create new communication event adapter instance.
     *
     * @param config
     */
    create(config: CommunicationEventAdapterConfig): Promise<CommunicationEventAdapter>;
    /**
     * Create multiple communication event adapters.
     *
     * @param configs
     */
    createMultiple(configs: CommunicationEventAdapterConfig[]): Promise<CommunicationEventAdapter[]>;
    /**
     * Get communication event adapter by name.
     *
     * @param name
     */
    get(name: string): CommunicationEventAdapter | undefined;
    /**
     * List all communication event adapters.
     */
    list(): CommunicationEventAdapter[];
    /**
     * Check if communication event adapter exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove communication event adapter by name.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Health check all communication event adapters.
     */
    healthCheckAll(): Promise<Map<string, EventManagerStatus>>;
    /**
     * Get metrics for all communication event adapters.
     */
    getMetricsAll(): Promise<Map<string, EventManagerMetrics>>;
    /**
     * Start all communication event adapters.
     */
    startAll(): Promise<void>;
    /**
     * Stop all communication event adapters.
     */
    stopAll(): Promise<void>;
    /**
     * Shutdown factory and all communication event adapters.
     */
    shutdown(): Promise<void>;
    /**
     * Get active adapter count.
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
     * Create communication event adapter with WebSocket focus.
     *
     * @param name
     * @param config
     */
    createWebSocketAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
    /**
     * Create communication event adapter with MCP focus.
     *
     * @param name
     * @param config
     */
    createMCPAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
    /**
     * Create communication event adapter with HTTP focus.
     *
     * @param name
     * @param config
     */
    createHTTPAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
    /**
     * Create communication event adapter with protocol management focus.
     *
     * @param name
     * @param config
     */
    createProtocolAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
    /**
     * Create comprehensive communication event adapter (all communication types).
     *
     * @param name
     * @param config.
     * @param config
     */
    createComprehensiveAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
    /**
     * Get communication health summary for all adapters.
     */
    getCommunicationHealthSummary(): Promise<{
        totalAdapters: number;
        healthyAdapters: number;
        degradedAdapters: number;
        unhealthyAdapters: number;
        connectionHealth: Record<string, any>;
        protocolHealth: Record<string, any>;
    }>;
    /**
     * Get communication metrics summary for all adapters.
     */
    getCommunicationMetricsSummary(): Promise<{
        totalEvents: number;
        successfulEvents: number;
        failedEvents: number;
        avgLatency: number;
        totalThroughput: number;
        connectionMetrics: Record<string, any>;
        protocolMetrics: Record<string, any>;
    }>;
    /**
     * Configure all adapters with new settings.
     *
     * @param configUpdates
     */
    reconfigureAll(configUpdates: Partial<CommunicationEventAdapterConfig>): Promise<void>;
    /**
     * Validate communication event adapter configuration.
     *
     * @param config
     */
    private validateConfig;
    /**
     * Set up event forwarding from adapter to factory.
     *
     * @param adapter
     */
    private setupEventForwarding;
}
/**
 * Global communication event factory instance.
 */
export declare const communicationEventFactory: CommunicationEventFactory;
/**
 * Convenience functions for creating communication event adapters.
 *
 * @param config
 * @example
 */
export declare function createCommunicationEventAdapter(config: CommunicationEventAdapterConfig): Promise<CommunicationEventAdapter>;
export declare function createWebSocketCommunicationAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
export declare function createMCPCommunicationAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
export declare function createHTTPCommunicationAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
export declare function createProtocolCommunicationAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
export declare function createComprehensiveCommunicationAdapter(name: string, config?: Partial<CommunicationEventAdapterConfig>): Promise<CommunicationEventAdapter>;
export default CommunicationEventFactory;
//# sourceMappingURL=communication-event-factory.d.ts.map