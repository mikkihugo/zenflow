/**
 * UEL Monitoring Event Factory.
 *
 * Factory for creating and managing MonitoringEventAdapter instances
 * with unified configuration management and pre-configured setups.
 * Following the exact same patterns as other UEL adapter factories.
 */
/**
 * @file Interface implementation: monitoring-event-factory.
 */
import { type MonitoringEventAdapter, type MonitoringEventAdapterConfig } from './monitoring-event-adapter.ts';
/**
 * Monitoring event manager factory class.
 *
 * @example
 */
export declare class MonitoringEventFactory {
    private static instances;
    private static defaultConfigs;
    /**
     * Create a new monitoring event adapter instance.
     *
     * @param name
     * @param config
     */
    static create(name: string, config?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Get existing monitoring event adapter instance.
     *
     * @param name
     */
    static get(name: string): MonitoringEventAdapter | undefined;
    /**
     * Get or create monitoring event adapter instance.
     *
     * @param name
     * @param config
     */
    static getOrCreate(name: string, config?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Remove monitoring event adapter instance.
     *
     * @param name
     */
    static remove(name: string): Promise<boolean>;
    /**
     * List all monitoring event adapter names.
     */
    static list(): string[];
    /**
     * Get all monitoring event adapter instances.
     */
    static getAll(): MonitoringEventAdapter[];
    /**
     * Clear all monitoring event adapter instances.
     */
    static clear(): Promise<void>;
    /**
     * Register default configuration for a monitoring event adapter.
     *
     * @param name
     * @param config
     */
    static registerDefaultConfig(name: string, config: Partial<MonitoringEventAdapterConfig>): void;
    /**
     * Check if monitoring event adapter exists.
     *
     * @param name
     */
    static has(name: string): boolean;
    /**
     * Get monitoring event adapter count.
     */
    static count(): number;
}
/**
 * Pre-configured monitoring event adapter configurations.
 */
export declare const MonitoringEventConfigs: {
    /**
     * Performance monitoring focused configuration.
     */
    PERFORMANCE_FOCUSED: Partial<MonitoringEventAdapterConfig>;
    /**
     * Health monitoring focused configuration.
     */
    HEALTH_FOCUSED: Partial<MonitoringEventAdapterConfig>;
    /**
     * Analytics monitoring focused configuration.
     */
    ANALYTICS_FOCUSED: Partial<MonitoringEventAdapterConfig>;
    /**
     * Alert management focused configuration.
     */
    ALERT_FOCUSED: Partial<MonitoringEventAdapterConfig>;
    /**
     * Dashboard integration focused configuration.
     */
    DASHBOARD_FOCUSED: Partial<MonitoringEventAdapterConfig>;
    /**
     * High-throughput monitoring configuration.
     */
    HIGH_THROUGHPUT: Partial<MonitoringEventAdapterConfig>;
    /**
     * Low-latency monitoring configuration.
     */
    LOW_LATENCY: Partial<MonitoringEventAdapterConfig>;
};
/**
 * Quick factory methods for common monitoring patterns.
 */
export declare const MonitoringEventAdapterFactory: {
    /**
     * Create performance-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createPerformanceMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Create health-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createHealthMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Create analytics-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createAnalyticsMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Create alert-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createAlertMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Create dashboard-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createDashboardMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Create high-throughput monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createHighThroughputMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Create low-latency monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createLowLatencyMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
    /**
     * Create comprehensive monitoring adapter with all features enabled.
     *
     * @param name
     * @param overrides
     */
    createComprehensiveMonitor(name: string, overrides?: Partial<MonitoringEventAdapterConfig>): MonitoringEventAdapter;
};
/**
 * Registry for monitoring event adapters with automatic lifecycle management.
 *
 * @example
 */
export declare class MonitoringEventRegistry {
    private static adapters;
    private static lifecycleHooks;
    /**
     * Register monitoring event adapter with lifecycle management.
     *
     * @param name
     * @param adapter
     * @param hooks
     * @param hooks.onStart
     * @param hooks.onStop
     * @param hooks.onError
     */
    static register(name: string, adapter: MonitoringEventAdapter, hooks?: {
        onStart?: (adapter: MonitoringEventAdapter) => Promise<void>;
        onStop?: (adapter: MonitoringEventAdapter) => Promise<void>;
        onError?: (adapter: MonitoringEventAdapter, error: Error) => Promise<void>;
    }): Promise<void>;
    /**
     * Unregister monitoring event adapter.
     *
     * @param name
     */
    static unregister(name: string): Promise<boolean>;
    /**
     * Get registered monitoring event adapter.
     *
     * @param name
     */
    static get(name: string): MonitoringEventAdapter | undefined;
    /**
     * Start all registered monitoring event adapters.
     */
    static startAll(): Promise<void>;
    /**
     * Stop all registered monitoring event adapters.
     */
    static stopAll(): Promise<void>;
    /**
     * Get health status of all registered adapters.
     */
    static getHealthStatus(): Promise<Record<string, any>>;
    /**
     * Get performance metrics of all registered adapters.
     */
    static getMetrics(): Promise<Record<string, any>>;
    /**
     * List all registered adapter names.
     */
    static list(): string[];
    /**
     * Get count of registered adapters.
     */
    static count(): number;
    /**
     * Clear all registered adapters.
     */
    static clear(): Promise<void>;
}
/**
 * Singleton monitoring event manager for global access.
 *
 * @example
 */
export declare class MonitoringEventManager {
    private static instance;
    private static config;
    /**
     * Initialize global monitoring event manager.
     *
     * @param config
     */
    static initialize(config: MonitoringEventAdapterConfig): Promise<MonitoringEventAdapter>;
    /**
     * Get global monitoring event manager instance.
     */
    static getInstance(): MonitoringEventAdapter;
    /**
     * Shutdown global monitoring event manager.
     */
    static shutdown(): Promise<void>;
    /**
     * Check if monitoring event manager is initialized.
     */
    static isInitialized(): boolean;
    /**
     * Get current configuration.
     */
    static getConfig(): MonitoringEventAdapterConfig | null;
}
export { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, MonitoringEventAdapter, MonitoringEventAdapterConfig, } from './monitoring-event-adapter.ts';
export default MonitoringEventFactory;
//# sourceMappingURL=monitoring-event-factory.d.ts.map