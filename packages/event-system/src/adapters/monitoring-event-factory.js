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
import { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, } from './monitoring-event-adapter';
/**
 * Monitoring event manager factory class.
 *
 * @example
 */
export class MonitoringEventFactory {
    static instances = new Map();
    static defaultConfigs = new Map();
    /**
     * Create a new monitoring event adapter instance.
     *
     * @param name
     * @param config
     */
    static create(name, config) {
        if (MonitoringEventFactory.instances.has(name)) {
            throw new Error(`Monitoring event adapter '${name}' already exists`);
        }
        const defaultConfig = MonitoringEventFactory.defaultConfigs.get(name) || {};
        const finalConfig = createDefaultMonitoringEventAdapterConfig(name, {
            ...defaultConfig,
            ...config,
        });
        const adapter = createMonitoringEventAdapter(finalConfig);
        MonitoringEventFactory.instances.set(name, adapter);
        return adapter;
    }
    /**
     * Get existing monitoring event adapter instance.
     *
     * @param name
     */
    static get(name) {
        return MonitoringEventFactory.instances.get(name);
    }
    /**
     * Get or create monitoring event adapter instance.
     *
     * @param name
     * @param config
     */
    static getOrCreate(name, config) {
        const existing = MonitoringEventFactory.get(name);
        if (existing) {
            return existing;
        }
        return MonitoringEventFactory.create(name, config);
    }
    /**
     * Remove monitoring event adapter instance.
     *
     * @param name
     */
    static async remove(name) {
        const adapter = MonitoringEventFactory.instances.get(name);
        if (!adapter) {
            return false;
        }
        await adapter.destroy();
        MonitoringEventFactory.instances.delete(name);
        return true;
    }
    /**
     * List all monitoring event adapter names.
     */
    static list() {
        return Array.from(MonitoringEventFactory.instances.keys());
    }
    /**
     * Get all monitoring event adapter instances.
     */
    static getAll() {
        return Array.from(MonitoringEventFactory.instances.values());
    }
    /**
     * Clear all monitoring event adapter instances.
     */
    static async clear() {
        const adapters = Array.from(MonitoringEventFactory.instances.values());
        await Promise.all(adapters.map((adapter) => adapter.destroy()));
        MonitoringEventFactory.instances.clear();
    }
    /**
     * Register default configuration for a monitoring event adapter.
     *
     * @param name
     * @param config
     */
    static registerDefaultConfig(name, config) {
        MonitoringEventFactory.defaultConfigs.set(name, config);
    }
    /**
     * Check if monitoring event adapter exists.
     *
     * @param name
     */
    static has(name) {
        return MonitoringEventFactory.instances.has(name);
    }
    /**
     * Get monitoring event adapter count.
     */
    static count() {
        return MonitoringEventFactory.instances.size;
    }
}
/**
 * Pre-configured monitoring event adapter configurations.
 */
export const MonitoringEventConfigs = {
    /**
     * Performance monitoring focused configuration.
     */
    PERFORMANCE_FOCUSED: {
        performanceMonitoring: {
            enabled: true,
            wrapMetricsEvents: true,
            wrapThresholdEvents: true,
            wrapAlertEvents: true,
            wrapOptimizationEvents: true,
            monitors: ['performance-monitor', 'resource-monitor', 'latency-monitor'],
        },
        monitoring: {
            strategy: 'metrics',
            correlationTTL: 300000, // 5 minutes
            trackMetricsFlow: true,
            trackPerformanceInsights: true,
        },
        metricsOptimization: {
            enabled: true,
            optimizationInterval: 60000, // 1 minute
            performanceThresholds: {
                latency: 50,
                throughput: 2000,
                accuracy: 0.99,
                resourceUsage: 0.6,
            },
        },
    },
    /**
     * Health monitoring focused configuration.
     */
    HEALTH_FOCUSED: {
        healthMonitoring: {
            enabled: true,
            wrapHealthCheckEvents: true,
            wrapStatusEvents: true,
            wrapRecoveryEvents: true,
            wrapCorrelationEvents: true,
            components: [
                'system-health',
                'service-health',
                'component-health',
                'network-health',
            ],
        },
        monitoring: {
            strategy: 'health',
            correlationTTL: 600000, // 10 minutes
            trackHealthStatus: true,
        },
        healthMonitoringConfig: {
            enabled: true,
            healthCheckInterval: 15000, // 15 seconds
            autoRecoveryEnabled: true,
            correlateHealthData: true,
        },
    },
    /**
     * Analytics monitoring focused configuration.
     */
    ANALYTICS_FOCUSED: {
        analyticsMonitoring: {
            enabled: true,
            wrapCollectionEvents: true,
            wrapAggregationEvents: true,
            wrapReportingEvents: true,
            wrapInsightEvents: true,
            analyzers: [
                'performance-analyzer',
                'trend-analyzer',
                'anomaly-detector',
                'predictive-analyzer',
            ],
        },
        monitoring: {
            strategy: 'analytics',
            correlationTTL: 900000, // 15 minutes
            trackPerformanceInsights: true,
        },
        metricsOptimization: {
            enabled: true,
            dataAggregation: true,
            intelligentSampling: true,
            anomalyDetection: true,
        },
    },
    /**
     * Alert management focused configuration.
     */
    ALERT_FOCUSED: {
        alertManagement: {
            enabled: true,
            wrapAlertEvents: true,
            wrapEscalationEvents: true,
            wrapResolutionEvents: true,
            wrapNotificationEvents: true,
            alertLevels: ['info', 'warning', 'error', 'critical'],
        },
        monitoring: {
            strategy: 'alerts',
            correlationTTL: 1800000, // 30 minutes
            correlationPatterns: [
                'monitoring:alert->monitoring:health',
                'monitoring:health->monitoring:alert',
                'monitoring:metrics->monitoring:alert',
            ],
        },
        healthMonitoringConfig: {
            enabled: true,
            autoRecoveryEnabled: true,
            alertThresholds: {
                'monitoring-latency': 100,
                'data-accuracy': 0.99,
                'resource-usage': 0.5,
                'monitoring-availability': 0.95,
            },
        },
    },
    /**
     * Dashboard integration focused configuration.
     */
    DASHBOARD_FOCUSED: {
        dashboardIntegration: {
            enabled: true,
            wrapUpdateEvents: true,
            wrapVisualizationEvents: true,
            wrapStreamingEvents: true,
            wrapInteractionEvents: true,
            dashboards: [
                'main-dashboard',
                'metrics-dashboard',
                'health-dashboard',
                'alert-dashboard',
            ],
        },
        monitoring: {
            strategy: 'metrics',
            trackMetricsFlow: true,
            trackHealthStatus: true,
            trackPerformanceInsights: true,
        },
        performance: {
            enableRealTimeTracking: true,
            enablePerformanceAggregation: true,
            monitoringInterval: 2000, // 2 seconds for real-time updates
        },
    },
    /**
     * High-throughput monitoring configuration.
     */
    HIGH_THROUGHPUT: {
        processing: {
            strategy: 'batched',
            batchSize: 100,
            queueSize: 10000,
        },
        performance: {
            enableMetricsCorrelation: true,
            enableRealTimeTracking: true,
            enablePerformanceAggregation: true,
            maxConcurrentMonitors: 100,
        },
        monitoring: {
            correlationTTL: 180000, // 3 minutes
            maxCorrelationDepth: 50,
        },
    },
    /**
     * Low-latency monitoring configuration.
     */
    LOW_LATENCY: {
        processing: {
            strategy: 'immediate',
            queueSize: 2000,
        },
        performance: {
            monitoringInterval: 1000, // 1 second
            enablePerformanceTracking: true,
        },
        metricsOptimization: {
            enabled: true,
            optimizationInterval: 30000, // 30 seconds
            performanceThresholds: {
                latency: 10,
                throughput: 5000,
                accuracy: 0.995,
                resourceUsage: 0.8,
            },
        },
    },
};
/**
 * Quick factory methods for common monitoring patterns.
 */
export const MonitoringEventAdapterFactory = {
    /**
     * Create performance-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createPerformanceMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.PERFORMANCE_FOCUSED,
            ...overrides,
        });
    },
    /**
     * Create health-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createHealthMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.HEALTH_FOCUSED,
            ...overrides,
        });
    },
    /**
     * Create analytics-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createAnalyticsMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.ANALYTICS_FOCUSED,
            ...overrides,
        });
    },
    /**
     * Create alert-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createAlertMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.ALERT_FOCUSED,
            ...overrides,
        });
    },
    /**
     * Create dashboard-focused monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createDashboardMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.DASHBOARD_FOCUSED,
            ...overrides,
        });
    },
    /**
     * Create high-throughput monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createHighThroughputMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.HIGH_THROUGHPUT,
            ...overrides,
        });
    },
    /**
     * Create low-latency monitoring adapter.
     *
     * @param name
     * @param overrides
     */
    createLowLatencyMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.LOW_LATENCY,
            ...overrides,
        });
    },
    /**
     * Create comprehensive monitoring adapter with all features enabled.
     *
     * @param name
     * @param overrides
     */
    createComprehensiveMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            performanceMonitoring: {
                enabled: true,
                wrapMetricsEvents: true,
                wrapThresholdEvents: true,
                wrapAlertEvents: true,
                wrapOptimizationEvents: true,
            },
            healthMonitoring: {
                enabled: true,
                wrapHealthCheckEvents: true,
                wrapStatusEvents: true,
                wrapRecoveryEvents: true,
                wrapCorrelationEvents: true,
            },
            analyticsMonitoring: {
                enabled: true,
                wrapCollectionEvents: true,
                wrapAggregationEvents: true,
                wrapReportingEvents: true,
                wrapInsightEvents: true,
            },
            alertManagement: {
                enabled: true,
                wrapAlertEvents: true,
                wrapEscalationEvents: true,
                wrapResolutionEvents: true,
                wrapNotificationEvents: true,
            },
            dashboardIntegration: {
                enabled: true,
                wrapUpdateEvents: true,
                wrapVisualizationEvents: true,
                wrapStreamingEvents: true,
                wrapInteractionEvents: true,
            },
            monitoring: {
                enabled: true,
                strategy: 'metrics',
                trackMetricsFlow: true,
                trackHealthStatus: true,
                trackPerformanceInsights: true,
            },
            ...overrides,
        });
    },
};
/**
 * Registry for monitoring event adapters with automatic lifecycle management.
 *
 * @example
 */
export class MonitoringEventRegistry {
    static adapters = new Map();
    static lifecycleHooks = new Map();
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
    static async register(name, adapter, hooks) {
        if (MonitoringEventRegistry.adapters.has(name)) {
            throw new Error(`Monitoring event adapter '${name}' is already registered`);
        }
        MonitoringEventRegistry.adapters.set(name, adapter);
        if (hooks) {
            MonitoringEventRegistry.lifecycleHooks.set(name, hooks);
        }
        // Set up event listeners for lifecycle management
        adapter.on('start', async () => {
            const hook = MonitoringEventRegistry.lifecycleHooks.get(name)?.onStart;
            if (hook) {
                await hook(adapter);
            }
        });
        adapter.on('stop', async () => {
            const hook = MonitoringEventRegistry.lifecycleHooks.get(name)?.onStop;
            if (hook) {
                await hook(adapter);
            }
        });
        adapter.on('error', async (error) => {
            const hook = MonitoringEventRegistry.lifecycleHooks.get(name)?.onError;
            if (hook) {
                await hook(adapter, error);
            }
        });
    }
    /**
     * Unregister monitoring event adapter.
     *
     * @param name
     */
    static async unregister(name) {
        const adapter = MonitoringEventRegistry.adapters.get(name);
        if (!adapter) {
            return false;
        }
        await adapter.destroy();
        MonitoringEventRegistry.adapters.delete(name);
        MonitoringEventRegistry.lifecycleHooks.delete(name);
        return true;
    }
    /**
     * Get registered monitoring event adapter.
     *
     * @param name
     */
    static get(name) {
        return MonitoringEventRegistry.adapters.get(name);
    }
    /**
     * Start all registered monitoring event adapters.
     */
    static async startAll() {
        const startPromises = Array.from(MonitoringEventRegistry.adapters.values()).map((adapter) => adapter.isRunning() ? Promise.resolve() : adapter.start());
        await Promise.all(startPromises);
    }
    /**
     * Stop all registered monitoring event adapters.
     */
    static async stopAll() {
        const stopPromises = Array.from(MonitoringEventRegistry.adapters.values()).map((adapter) => adapter.isRunning() ? adapter.stop() : Promise.resolve());
        await Promise.all(stopPromises);
    }
    /**
     * Get health status of all registered adapters.
     */
    static async getHealthStatus() {
        const healthPromises = Array.from(MonitoringEventRegistry.adapters.entries()).map(async ([name, adapter]) => {
            const health = await adapter.healthCheck();
            return [name, health];
        });
        const results = await Promise.all(healthPromises);
        return Object.fromEntries(results);
    }
    /**
     * Get performance metrics of all registered adapters.
     */
    static async getMetrics() {
        const metricsPromises = Array.from(MonitoringEventRegistry.adapters.entries()).map(async ([name, adapter]) => {
            const metrics = await adapter.getMetrics();
            return [name, metrics];
        });
        const results = await Promise.all(metricsPromises);
        return Object.fromEntries(results);
    }
    /**
     * List all registered adapter names.
     */
    static list() {
        return Array.from(MonitoringEventRegistry.adapters.keys());
    }
    /**
     * Get count of registered adapters.
     */
    static count() {
        return MonitoringEventRegistry.adapters.size;
    }
    /**
     * Clear all registered adapters.
     */
    static async clear() {
        await MonitoringEventRegistry.stopAll();
        MonitoringEventRegistry.adapters.clear();
        MonitoringEventRegistry.lifecycleHooks.clear();
    }
}
/**
 * Singleton monitoring event manager for global access.
 *
 * @example
 */
export class MonitoringEventManager {
    static instance = null;
    static config = null;
    /**
     * Initialize global monitoring event manager.
     *
     * @param config
     */
    static async initialize(config) {
        if (MonitoringEventManager.instance) {
            throw new Error('Monitoring event manager is already initialized');
        }
        MonitoringEventManager.instance = createMonitoringEventAdapter(config);
        MonitoringEventManager.config = config;
        await MonitoringEventManager.instance.start();
        return MonitoringEventManager.instance;
    }
    /**
     * Get global monitoring event manager instance.
     */
    static getInstance() {
        if (!MonitoringEventManager.instance) {
            throw new Error('Monitoring event manager is not initialized. Call initialize() first.');
        }
        return MonitoringEventManager.instance;
    }
    /**
     * Shutdown global monitoring event manager.
     */
    static async shutdown() {
        if (MonitoringEventManager.instance) {
            await MonitoringEventManager.instance.destroy();
            MonitoringEventManager.instance = null;
            MonitoringEventManager.config = null;
        }
    }
    /**
     * Check if monitoring event manager is initialized.
     */
    static isInitialized() {
        return MonitoringEventManager.instance !== null;
    }
    /**
     * Get current configuration.
     */
    static getConfig() {
        return MonitoringEventManager.config;
    }
}
// Export everything
export { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, MonitoringEventAdapter, } from './monitoring-event-adapter';
export default MonitoringEventFactory;
//# sourceMappingURL=monitoring-event-factory.js.map