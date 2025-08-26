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

import {
  createMonitoringEventAdapter,
  type MonitoringEventAdapter,
  type MonitoringEventAdapterConfig,
} from './monitoring-event-adapter;

/**
 * Monitoring event manager factory class.
 *
 * @example
 */
export class MonitoringEventFactory {
  private static instances = new Map<string, MonitoringEventAdapter>();

  /**
   * Create a new monitoring event adapter instance.
   *
   * @param name
   * @param config
   */
  static create(
    name: string,
    _config?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
    if (MonitoringEventFactory.instances.has(name)) {
      throw new Error(`Monitoring event adapter '${name}'already exists`);`
    }

    const defaultConfig = MonitoringEventFactory.defaultConfigs.get(name)||{};
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
  static get(name: string): MonitoringEventAdapter|undefined {
    return MonitoringEventFactory.instances.get(name);
  }

  /**
   * Get or create monitoring event adapter instance.
   *
   * @param name
   * @param config
   */
  static getOrCreate(
    name: string,
    config?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  static async remove(name: string): Promise<boolean> {
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
  static list(): string[] {
    return Array.from(MonitoringEventFactory.instances.keys())();
  }

  /**
   * Get all monitoring event adapter instances.
   */
  static getAll(): MonitoringEventAdapter[] {
    return Array.from(MonitoringEventFactory.instances.values())();
  }

  /**
   * Clear all monitoring event adapter instances.
   */
  static async clear(): Promise<void> {
    const adapters = Array.from(MonitoringEventFactory.instances.values())();
    await Promise.all(adapters.map((adapter) => adapter.destroy()));
    MonitoringEventFactory.instances.clear();
  }

  /**
   * Register default configuration for a monitoring event adapter.
   *
   * @param name
   * @param config
   */
  static registerDefaultConfig(
    name: string,
    config: Partial<MonitoringEventAdapterConfig>
  ): void {
    MonitoringEventFactory.defaultConfigs.set(name, config);
  }

  /**
   * Check if monitoring event adapter exists.
   *
   * @param name
   */
  static has(name: string): boolean {
    return MonitoringEventFactory.instances.has(name);
  }

  /**
   * Get monitoring event adapter count.
   */
  static count(): number {
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
      strategy: 'metrics' as const,
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
  } as Partial<MonitoringEventAdapterConfig>,

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
      strategy: 'health' as const,
      correlationTTL: 600000, // 10 minutes
      trackHealthStatus: true,
    },
    healthMonitoringConfig: {
      enabled: true,
      healthCheckInterval: 15000, // 15 seconds
      autoRecoveryEnabled: true,
      correlateHealthData: true,
    },
  } as Partial<MonitoringEventAdapterConfig>,

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
      strategy: 'analytics' as const,
      correlationTTL: 900000, // 15 minutes
      trackPerformanceInsights: true,
    },
    metricsOptimization: {
      enabled: true,
      dataAggregation: true,
      intelligentSampling: true,
      anomalyDetection: true,
    },
  } as Partial<MonitoringEventAdapterConfig>,

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
      enabled: true,
      strategy: 'alerts' as const,
      metricsInterval: 10000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
      enableProfiling: false,
      correlationTTL: 1800000, // 30 minutes
      maxCorrelationDepth: 5,
      correlationPatterns: [
        'monitoring:alert->monitoring:health',
        'monitoring:health->monitoring:alert',
        'monitoring:metrics->monitoring:alert',
      ],
      trackMetricsFlow: true,
      trackHealthStatus: true,
      trackPerformanceInsights: true,
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
  } as any,

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
      strategy: 'metrics' as const,
      trackMetricsFlow: true,
      trackHealthStatus: true,
      trackPerformanceInsights: true,
    },
    performance: {
      enableRealTimeTracking: true,
      enablePerformanceAggregation: true,
      monitoringInterval: 2000, // 2 seconds for real-time updates
    },
  } as Partial<MonitoringEventAdapterConfig>,

  /**
   * High-throughput monitoring configuration.
   */
  HIGH_THROUGHPUT: {
    processing: {
      strategy: 'batched' as const,
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
  } as Partial<MonitoringEventAdapterConfig>,

  /**
   * Low-latency monitoring configuration.
   */
  LOW_LATENCY: {
    processing: {
      strategy: 'immediate' as const,
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
  } as Partial<MonitoringEventAdapterConfig>,
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
  createPerformanceMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  createHealthMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  createAnalyticsMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  createAlertMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  createDashboardMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  createHighThroughputMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  createLowLatencyMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
  createComprehensiveMonitor(
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ): MonitoringEventAdapter {
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
        strategy: 'metrics' as const,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        enableProfiling: false,
        correlationTTL: 1800000,
        maxCorrelationDepth: 5,
        correlationPatterns: [],
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
  private static adapters = new Map<string, MonitoringEventAdapter>();
  private static lifecycleHooks = new Map<
    string,
    {
      onStart?: (adapter: MonitoringEventAdapter) => Promise<void>;
      onStop?: (adapter: MonitoringEventAdapter) => Promise<void>;
      onError?: (
        adapter: MonitoringEventAdapter,
        error: Error
      ) => Promise<void>;
    }
  >();

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
  static async register(
    name: string,
    adapter: MonitoringEventAdapter,
    hooks?: {
      onStart?: (adapter: MonitoringEventAdapter) => Promise<void>;
      onStop?: (adapter: MonitoringEventAdapter) => Promise<void>;
      onError?: (
        adapter: MonitoringEventAdapter,
        error: Error
      ) => Promise<void>;
    }
  ): Promise<void> {
    if (MonitoringEventRegistry.adapters.has(name)) {
      throw new Error(
        `Monitoring event adapter '${name}' is already registered``
      );
    }

    MonitoringEventRegistry.adapters.set(name, adapter);

    if (hooks) {
      MonitoringEventRegistry.lifecycleHooks.set(name, hooks);
    }

    // Set up event listeners for lifecycle management
    adapter.on('start', async () => {'
      const hook = MonitoringEventRegistry.lifecycleHooks.get(name)?.onStart;
      if (hook) {
        await hook(adapter);
      }
    });

    adapter.on('stop', async () => {'
      const hook = MonitoringEventRegistry.lifecycleHooks.get(name)?.onStop;
      if (hook) {
        await hook(adapter);
      }
    });

    adapter.on('error', async (...args: unknown[]) => {'
      const error = args[0] as Error;
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
  static async unregister(name: string): Promise<boolean> {
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
  static get(name: string): MonitoringEventAdapter|undefined {
    return MonitoringEventRegistry.adapters.get(name);
  }

  /**
   * Start all registered monitoring event adapters.
   */
  static async startAll(): Promise<void> {
    const startPromises = Array.from(
      MonitoringEventRegistry.adapters.values()
    ).map((adapter) =>
      adapter.isRunning() ? Promise.resolve() : adapter.start()
    );
    await Promise.all(startPromises);
  }

  /**
   * Stop all registered monitoring event adapters.
   */
  static async stopAll(): Promise<void> {
    const stopPromises = Array.from(
      MonitoringEventRegistry.adapters.values()
    ).map((adapter) =>
      adapter.isRunning() ? adapter.stop() : Promise.resolve()
    );
    await Promise.all(stopPromises);
  }

  /**
   * Get health status of all registered adapters.
   */
  static async getHealthStatus(): Promise<Record<string, unknown>> {
    const healthPromises = Array.from(
      MonitoringEventRegistry.adapters.entries()
    ).map(async ([name, adapter]) => {
      const health = await adapter.healthCheck();
      return [name, health];
    });

    const results = await Promise.all(healthPromises);
    return Object.fromEntries(results);
  }

  /**
   * Get performance metrics of all registered adapters.
   */
  static async getMetrics(): Promise<Record<string, unknown>> {
    const metricsPromises = Array.from(
      MonitoringEventRegistry.adapters.entries()
    ).map(async ([name, adapter]) => {
      const metrics = await adapter.getMetrics();
      return [name, metrics];
    });

    const results = await Promise.all(metricsPromises);
    return Object.fromEntries(results);
  }

  /**
   * List all registered adapter names.
   */
  static list(): string[] {
    return Array.from(MonitoringEventRegistry.adapters.keys())();
  }

  /**
   * Get count of registered adapters.
   */
  static count(): number {
    return MonitoringEventRegistry.adapters.size;
  }

  /**
   * Clear all registered adapters.
   */
  static async clear(): Promise<void> {
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
  private static instance: MonitoringEventAdapter|null = null;
  private static config: MonitoringEventAdapterConfig|null = null;

  /**
   * Initialize global monitoring event manager.
   *
   * @param config
   */
  static async initialize(
    config: MonitoringEventAdapterConfig
  ): Promise<MonitoringEventAdapter> {
    if (MonitoringEventManager.instance) {
      throw new Error('Monitoring event manager is already initialized');'
    }

    MonitoringEventManager.instance = createMonitoringEventAdapter(config);
    MonitoringEventManager.config = config;
    await MonitoringEventManager.instance.start();

    return MonitoringEventManager.instance;
  }

  /**
   * Get global monitoring event manager instance.
   */
  static getInstance(): MonitoringEventAdapter {
    if (!MonitoringEventManager.instance) {
      throw new Error(
        'Monitoring event manager is not initialized. Call initialize() first.');'
    }
    return MonitoringEventManager.instance;
  }

  /**
   * Shutdown global monitoring event manager.
   */
  static async shutdown(): Promise<void> {
    if (MonitoringEventManager.instance) {
      await MonitoringEventManager.instance.destroy();
      MonitoringEventManager.instance = null;
      MonitoringEventManager.config = null;
    }
  }

  /**
   * Check if monitoring event manager is initialized.
   */
  static isInitialized(): boolean {
    return MonitoringEventManager.instance !== null;
  }

  /**
   * Get current configuration.
   */
  static getConfig(): MonitoringEventAdapterConfig|null {
    return MonitoringEventManager.config;
  }
}

// Export everything
export {
  createDefaultMonitoringEventAdapterConfig,
  createMonitoringEventAdapter,
  MonitoringEventAdapter,
} from'./monitoring-event-adapter;
export type { MonitoringEventAdapterConfig } from './monitoring-event-adapter;

export default MonitoringEventFactory;
