import { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, } from './monitoring-event-adapter.ts';
export class MonitoringEventFactory {
    static instances = new Map();
    static defaultConfigs = new Map();
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
    static get(name) {
        return MonitoringEventFactory.instances.get(name);
    }
    static getOrCreate(name, config) {
        const existing = MonitoringEventFactory.get(name);
        if (existing) {
            return existing;
        }
        return MonitoringEventFactory.create(name, config);
    }
    static async remove(name) {
        const adapter = MonitoringEventFactory.instances.get(name);
        if (!adapter) {
            return false;
        }
        await adapter.destroy();
        MonitoringEventFactory.instances.delete(name);
        return true;
    }
    static list() {
        return Array.from(MonitoringEventFactory.instances.keys());
    }
    static getAll() {
        return Array.from(MonitoringEventFactory.instances.values());
    }
    static async clear() {
        const adapters = Array.from(MonitoringEventFactory.instances.values());
        await Promise.all(adapters.map((adapter) => adapter.destroy()));
        MonitoringEventFactory.instances.clear();
    }
    static registerDefaultConfig(name, config) {
        MonitoringEventFactory.defaultConfigs.set(name, config);
    }
    static has(name) {
        return MonitoringEventFactory.instances.has(name);
    }
    static count() {
        return MonitoringEventFactory.instances.size;
    }
}
export const MonitoringEventConfigs = {
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
            correlationTTL: 300000,
            trackMetricsFlow: true,
            trackPerformanceInsights: true,
        },
        metricsOptimization: {
            enabled: true,
            optimizationInterval: 60000,
            performanceThresholds: {
                latency: 50,
                throughput: 2000,
                accuracy: 0.99,
                resourceUsage: 0.6,
            },
        },
    },
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
            correlationTTL: 600000,
            trackHealthStatus: true,
        },
        healthMonitoringConfig: {
            enabled: true,
            healthCheckInterval: 15000,
            autoRecoveryEnabled: true,
            correlateHealthData: true,
        },
    },
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
            correlationTTL: 900000,
            trackPerformanceInsights: true,
        },
        metricsOptimization: {
            enabled: true,
            dataAggregation: true,
            intelligentSampling: true,
            anomalyDetection: true,
        },
    },
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
            correlationTTL: 1800000,
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
            monitoringInterval: 2000,
        },
    },
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
            correlationTTL: 180000,
            maxCorrelationDepth: 50,
        },
    },
    LOW_LATENCY: {
        processing: {
            strategy: 'immediate',
            queueSize: 2000,
        },
        performance: {
            monitoringInterval: 1000,
            enablePerformanceTracking: true,
        },
        metricsOptimization: {
            enabled: true,
            optimizationInterval: 30000,
            performanceThresholds: {
                latency: 10,
                throughput: 5000,
                accuracy: 0.995,
                resourceUsage: 0.8,
            },
        },
    },
};
export const MonitoringEventAdapterFactory = {
    createPerformanceMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.PERFORMANCE_FOCUSED,
            ...overrides,
        });
    },
    createHealthMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.HEALTH_FOCUSED,
            ...overrides,
        });
    },
    createAnalyticsMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.ANALYTICS_FOCUSED,
            ...overrides,
        });
    },
    createAlertMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.ALERT_FOCUSED,
            ...overrides,
        });
    },
    createDashboardMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.DASHBOARD_FOCUSED,
            ...overrides,
        });
    },
    createHighThroughputMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.HIGH_THROUGHPUT,
            ...overrides,
        });
    },
    createLowLatencyMonitor(name, overrides) {
        return MonitoringEventFactory.create(name, {
            ...MonitoringEventConfigs?.LOW_LATENCY,
            ...overrides,
        });
    },
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
export class MonitoringEventRegistry {
    static adapters = new Map();
    static lifecycleHooks = new Map();
    static async register(name, adapter, hooks) {
        if (MonitoringEventRegistry.adapters.has(name)) {
            throw new Error(`Monitoring event adapter '${name}' is already registered`);
        }
        MonitoringEventRegistry.adapters.set(name, adapter);
        if (hooks) {
            MonitoringEventRegistry.lifecycleHooks.set(name, hooks);
        }
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
    static get(name) {
        return MonitoringEventRegistry.adapters.get(name);
    }
    static async startAll() {
        const startPromises = Array.from(MonitoringEventRegistry.adapters.values()).map((adapter) => adapter.isRunning() ? Promise.resolve() : adapter.start());
        await Promise.all(startPromises);
    }
    static async stopAll() {
        const stopPromises = Array.from(MonitoringEventRegistry.adapters.values()).map((adapter) => adapter.isRunning() ? adapter.stop() : Promise.resolve());
        await Promise.all(stopPromises);
    }
    static async getHealthStatus() {
        const healthPromises = Array.from(MonitoringEventRegistry.adapters.entries()).map(async ([name, adapter]) => {
            const health = await adapter.healthCheck();
            return [name, health];
        });
        const results = await Promise.all(healthPromises);
        return Object.fromEntries(results);
    }
    static async getMetrics() {
        const metricsPromises = Array.from(MonitoringEventRegistry.adapters.entries()).map(async ([name, adapter]) => {
            const metrics = await adapter.getMetrics();
            return [name, metrics];
        });
        const results = await Promise.all(metricsPromises);
        return Object.fromEntries(results);
    }
    static list() {
        return Array.from(MonitoringEventRegistry.adapters.keys());
    }
    static count() {
        return MonitoringEventRegistry.adapters.size;
    }
    static async clear() {
        await MonitoringEventRegistry.stopAll();
        MonitoringEventRegistry.adapters.clear();
        MonitoringEventRegistry.lifecycleHooks.clear();
    }
}
export class MonitoringEventManager {
    static instance = null;
    static config = null;
    static async initialize(config) {
        if (MonitoringEventManager.instance) {
            throw new Error('Monitoring event manager is already initialized');
        }
        MonitoringEventManager.instance = createMonitoringEventAdapter(config);
        MonitoringEventManager.config = config;
        await MonitoringEventManager.instance.start();
        return MonitoringEventManager.instance;
    }
    static getInstance() {
        if (!MonitoringEventManager.instance) {
            throw new Error('Monitoring event manager is not initialized. Call initialize() first.');
        }
        return MonitoringEventManager.instance;
    }
    static async shutdown() {
        if (MonitoringEventManager.instance) {
            await MonitoringEventManager.instance.destroy();
            MonitoringEventManager.instance = null;
            MonitoringEventManager.config = null;
        }
    }
    static isInitialized() {
        return MonitoringEventManager.instance !== null;
    }
    static getConfig() {
        return MonitoringEventManager.config;
    }
}
export { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, MonitoringEventAdapter, } from './monitoring-event-adapter.ts';
export default MonitoringEventFactory;
//# sourceMappingURL=monitoring-event-factory.js.map