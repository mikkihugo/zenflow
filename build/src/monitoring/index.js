/**
 * @file Monitoring module exports.
 */
import { getLogger } from '../core/logger.ts';
const logger = getLogger('src-monitoring-index');
/**
 * Claude-Zen Performance Monitoring System.
 * Comprehensive real-time monitoring, analytics, and optimization.
 */
export { PerformanceAnalyzer, } from './analytics/performance-analyzer.ts';
export { MetricsCollector, } from './core/metrics-collector.ts';
export { DashboardServer, } from './dashboard/dashboard-server.ts';
export { SystemIntegration, } from './integrations/system-integration.ts';
export { OptimizationEngine, } from './optimization/optimization-engine.ts';
export * from './performance/real-time-monitor.ts';
import { getConfig } from '../../config';
import { SystemIntegration } from './integrations/system-integration.ts';
/**
 * Main monitoring system factory.
 *
 * @example
 */
export class PerformanceMonitoringSystem {
    integration;
    constructor(config = {}) {
        const centralConfig = getConfig();
        const defaultConfig = {
            metricsInterval: centralConfig?.core?.performance?.metricsInterval || 1000, // 1 second
            dashboardPort: centralConfig?.monitoring?.dashboard?.port,
            enableOptimization: centralConfig?.core?.performance?.enableMetrics,
            enableAlerts: true,
            logLevel: centralConfig?.core?.logger?.level,
        };
        const finalConfig = { ...defaultConfig, ...config };
        this.integration = new SystemIntegration(finalConfig);
    }
    /**
     * Start the complete monitoring system.
     */
    async start() {
        await this.integration.start();
    }
    /**
     * Stop the monitoring system.
     */
    async stop() {
        await this.integration.stop();
    }
    /**
     * Get system integration hooks for external systems.
     */
    getHooks() {
        return this.integration.getSystemHooks();
    }
    /**
     * Get current system status.
     */
    getStatus() {
        return this.integration.getSystemStatus();
    }
    /**
     * Get the underlying integration instance for advanced usage.
     */
    getIntegration() {
        return this.integration;
    }
}
/**
 * Create and start a monitoring system with default configuration.
 *
 * @param config
 * @example
 */
export async function createMonitoringSystem(config) {
    const system = new PerformanceMonitoringSystem(config);
    await system.start();
    return system;
}
/**
 * Quick setup function for Claude-Zen integration.
 *
 * @param options
 * @param options.dashboardPort
 * @param options.enableOptimization
 * @param options.metricsInterval
 * @example
 */
export async function setupClaudeZenMonitoring(options = {}) {
    const centralConfig = getConfig();
    const config = {
        dashboardPort: options?.dashboardPort || centralConfig?.monitoring?.dashboard?.port,
        enableOptimization: options?.enableOptimization !== false,
        metricsInterval: options?.metricsInterval || centralConfig?.core?.performance?.metricsInterval || 1000,
        enableAlerts: true,
        logLevel: centralConfig?.core?.logger?.level,
    };
    const system = await createMonitoringSystem(config);
    const hooks = system.getHooks();
    const dashboardUrl = `http://${centralConfig?.monitoring?.dashboard?.host}:${config?.dashboardPort}`;
    return { system, hooks, dashboardUrl };
}
/**
 * Example usage and integration patterns.
 */
export const examples = {
    /**
     * Basic setup example.
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
        return { system, factSystem, ragSystem, swarmSystem, dashboardUrl };
    },
    /**
     * Custom configuration example.
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
        integration.on('metrics:enhanced', (metrics) => { });
        integration.on('insights:processed', (insights) => {
            if (insights.healthScore < 80) {
            }
        });
        return system;
    },
    /**
     * Production deployment example.
     */
    productionSetup: async () => {
        const centralConfig = getConfig();
        const { system, hooks } = await setupClaudeZenMonitoring({
            dashboardPort: centralConfig?.monitoring?.dashboard?.port,
            enableOptimization: centralConfig?.environment?.isProduction,
            metricsInterval: centralConfig?.environment?.isProduction ? 5000 : 1000,
        });
        // Production-specific monitoring
        const integration = system.getIntegration();
        // Log critical issues
        integration.on('insights:processed', (insights) => {
            const criticalAnomalies = insights.anomalies.filter((a) => a.severity === 'critical');
            if (criticalAnomalies.length > 0) {
                logger.error('CRITICAL PERFORMANCE ISSUES:', criticalAnomalies);
                // In production, you might send alerts to external monitoring systems
            }
        });
        // Track optimization impact
        integration.on('optimization:processed', (result) => {
            if (result?.success) {
                const impact = (result?.impact?.performance * 100).toFixed(1);
                // Track optimization metrics
                if (result?.metrics) {
                }
            }
        });
        return { system, hooks };
    },
};
// Default export for easy importing
export default PerformanceMonitoringSystem;
