/**
 * Claude-Zen Performance Monitoring System
 * Comprehensive real-time monitoring, analytics, and optimization
 */

export {
  AnomalyDetection,
  BottleneckAnalysis,
  PerformanceAnalyzer,
  PerformanceInsights,
  TrendAnalysis,
} from './analytics/performance-analyzer';
export {
  CompositeMetrics,
  FactMetrics,
  McpToolMetrics,
  MetricsCollector,
  RagMetrics,
  SwarmMetrics,
  SystemMetrics,
} from './core/metrics-collector';
export { DashboardConfig, DashboardData, DashboardServer } from './dashboard/dashboard-server';
export {
  IntegrationConfig,
  SystemHooks,
  SystemIntegration,
} from './integrations/system-integration';
export {
  OptimizationAction,
  OptimizationEngine,
  OptimizationResult,
  OptimizationStrategy,
} from './optimization/optimization-engine';

import { type IntegrationConfig, SystemIntegration } from './integrations/system-integration';

/**
 * Main monitoring system factory
 */
export class PerformanceMonitoringSystem {
  private integration: SystemIntegration;

  constructor(config: Partial<IntegrationConfig> = {}) {
    const defaultConfig: IntegrationConfig = {
      metricsInterval: 1000, // 1 second
      dashboardPort: 3001,
      enableOptimization: true,
      enableAlerts: true,
      logLevel: 'info',
    };

    const finalConfig = { ...defaultConfig, ...config };
    this.integration = new SystemIntegration(finalConfig);
  }

  /**
   * Start the complete monitoring system
   */
  public async start(): Promise<void> {
    await this.integration.start();
  }

  /**
   * Stop the monitoring system
   */
  public async stop(): Promise<void> {
    await this.integration.stop();
  }

  /**
   * Get system integration hooks for external systems
   */
  public getHooks(): import('./integrations/system-integration').SystemHooks {
    return this.integration.getSystemHooks();
  }

  /**
   * Get current system status
   */
  public getStatus(): ReturnType<typeof this.integration.getSystemStatus> {
    return this.integration.getSystemStatus();
  }

  /**
   * Get the underlying integration instance for advanced usage
   */
  public getIntegration(): SystemIntegration {
    return this.integration;
  }
}

/**
 * Create and start a monitoring system with default configuration
 */
export async function createMonitoringSystem(
  config?: Partial<IntegrationConfig>
): Promise<PerformanceMonitoringSystem> {
  const system = new PerformanceMonitoringSystem(config);
  await system.start();
  return system;
}

/**
 * Quick setup function for Claude-Zen integration
 */
export async function setupClaudeZenMonitoring(
  options: { dashboardPort?: number; enableOptimization?: boolean; metricsInterval?: number } = {}
): Promise<{
  system: PerformanceMonitoringSystem;
  hooks: import('./integrations/system-integration').SystemHooks;
  dashboardUrl: string;
}> {
  const config: Partial<IntegrationConfig> = {
    dashboardPort: options.dashboardPort || 3001,
    enableOptimization: options.enableOptimization !== false,
    metricsInterval: options.metricsInterval || 1000,
    enableAlerts: true,
    logLevel: 'info',
  };

  const system = await createMonitoringSystem(config);
  const hooks = system.getHooks();
  const dashboardUrl = `http://localhost:${config.dashboardPort}`;

  console.log(`🚀 Claude-Zen Performance Monitoring System started`);
  console.log(`📊 Dashboard available at: ${dashboardUrl}`);
  console.log(`⚡ Real-time metrics collection: ${config.metricsInterval}ms intervals`);
  console.log(`🔧 Automatic optimization: ${config.enableOptimization ? 'enabled' : 'disabled'}`);

  return { system, hooks, dashboardUrl };
}

/**
 * Example usage and integration patterns
 */
export const examples = {
  /**
   * Basic setup example
   */
  basicSetup: async () => {
    const { system, hooks, dashboardUrl } = await setupClaudeZenMonitoring();

    // Example: Integrate with FACT system
    const factSystem = {
      onCacheHit: hooks.onFactCacheHit,
      onCacheMiss: hooks.onFactCacheMiss,
      onQuery: hooks.onFactQuery,
    };

    // Example: Integrate with RAG system
    const ragSystem = {
      onVectorQuery: hooks.onRagVectorQuery,
      onEmbedding: hooks.onRagEmbedding,
      onRetrieval: hooks.onRagRetrieval,
    };

    // Example: Integrate with Swarm system
    const swarmSystem = {
      onAgentSpawn: hooks.onSwarmAgentSpawn,
      onConsensus: hooks.onSwarmConsensus,
      onTaskComplete: hooks.onSwarmTaskComplete,
    };

    console.log('Monitoring system ready with all integrations');
    return { system, factSystem, ragSystem, swarmSystem, dashboardUrl };
  },

  /**
   * Custom configuration example
   */
  customSetup: async () => {
    const system = new PerformanceMonitoringSystem({
      metricsInterval: 2000, // 2 seconds
      dashboardPort: 4000,
      enableOptimization: false, // Manual optimization only
      enableAlerts: true,
      logLevel: 'debug',
    });

    await system.start();

    // Custom event handling
    const integration = system.getIntegration();
    integration.on('metrics:enhanced', (metrics) => {
      console.log('Custom metrics processing:', metrics.system.cpu.usage);
    });

    integration.on('insights:processed', (insights) => {
      if (insights.healthScore < 80) {
        console.log('Health score warning:', insights.healthScore);
      }
    });

    return system;
  },

  /**
   * Production deployment example
   */
  productionSetup: async () => {
    const { system, hooks } = await setupClaudeZenMonitoring({
      dashboardPort: process.env.DASHBOARD_PORT ? parseInt(process.env.DASHBOARD_PORT) : 3001,
      enableOptimization: process.env.NODE_ENV === 'production',
      metricsInterval: process.env.NODE_ENV === 'production' ? 5000 : 1000,
    });

    // Production-specific monitoring
    const integration = system.getIntegration();

    // Log critical issues
    integration.on('insights:processed', (insights) => {
      const criticalAnomalies = insights.anomalies.filter((a) => a.severity === 'critical');
      if (criticalAnomalies.length > 0) {
        console.error('CRITICAL PERFORMANCE ISSUES:', criticalAnomalies);
        // In production, you might send alerts to external monitoring systems
      }
    });

    // Track optimization impact
    integration.on('optimization:processed', (result) => {
      if (result.success) {
        const impact = (result.impact.performance * 100).toFixed(1);
        console.log(`Performance optimization: +${impact}% improvement`);
      }
    });

    return { system, hooks };
  },
};

// Default export for easy importing
export default PerformanceMonitoringSystem;
