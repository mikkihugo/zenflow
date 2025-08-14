import { getLogger } from '../core/logger.ts';
const logger = getLogger('src-monitoring-index');
export { PerformanceAnalyzer, } from './analytics/performance-analyzer.ts';
export { MetricsCollector, } from './core/metrics-collector.ts';
export { DashboardServer, } from './dashboard/dashboard-server.ts';
export { SystemIntegration, } from './integrations/system-integration.ts';
export { OptimizationEngine, } from './optimization/optimization-engine.ts';
export * from './performance/real-time-monitor.ts';
import { getConfig } from '../../config';
import { SystemIntegration, } from './integrations/system-integration.ts';
export class PerformanceMonitoringSystem {
    integration;
    constructor(config = {}) {
        const centralConfig = getConfig();
        const defaultConfig = {
            metricsInterval: centralConfig?.core?.performance?.metricsInterval || 1000,
            dashboardPort: centralConfig?.monitoring?.dashboard?.port,
            enableOptimization: centralConfig?.core?.performance?.enableMetrics,
            enableAlerts: true,
            logLevel: centralConfig?.core?.logger?.level,
        };
        const finalConfig = { ...defaultConfig, ...config };
        this.integration = new SystemIntegration(finalConfig);
    }
    async start() {
        await this.integration.start();
    }
    async stop() {
        await this.integration.stop();
    }
    getHooks() {
        return this.integration.getSystemHooks();
    }
    getStatus() {
        return this.integration.getSystemStatus();
    }
    getIntegration() {
        return this.integration;
    }
}
export async function createMonitoringSystem(config) {
    const system = new PerformanceMonitoringSystem(config);
    await system.start();
    return system;
}
export async function setupClaudeZenMonitoring(options = {}) {
    const centralConfig = getConfig();
    const config = {
        dashboardPort: options?.dashboardPort || centralConfig?.monitoring?.dashboard?.port,
        enableOptimization: options?.enableOptimization !== false,
        metricsInterval: options?.metricsInterval ||
            centralConfig?.core?.performance?.metricsInterval ||
            1000,
        enableAlerts: true,
        logLevel: centralConfig?.core?.logger?.level,
    };
    const system = await createMonitoringSystem(config);
    const hooks = system.getHooks();
    const dashboardUrl = `http://${centralConfig?.monitoring?.dashboard?.host}:${config?.dashboardPort}`;
    return { system, hooks, dashboardUrl };
}
export const examples = {
    basicSetup: async () => {
        const { system, hooks, dashboardUrl } = await setupClaudeZenMonitoring();
        const factSystem = {
            onCacheHit: hooks.onFactCacheHit,
            onCacheMiss: hooks.onFactCacheMiss,
            onQuery: hooks.onFactQuery,
        };
        const ragSystem = {
            onVectorQuery: hooks.onRagVectorQuery,
            onEmbedding: hooks.onRagEmbedding,
            onRetrieval: hooks.onRagRetrieval,
        };
        const swarmSystem = {
            onAgentSpawn: hooks.onSwarmAgentSpawn,
            onConsensus: hooks.onSwarmConsensus,
            onTaskComplete: hooks.onSwarmTaskComplete,
        };
        return { system, factSystem, ragSystem, swarmSystem, dashboardUrl };
    },
    customSetup: async () => {
        const system = new PerformanceMonitoringSystem({
            metricsInterval: 2000,
            dashboardPort: 4000,
            enableOptimization: false,
            enableAlerts: true,
            logLevel: 'debug',
        });
        await system.start();
        const integration = system.getIntegration();
        integration.on('metrics:enhanced', (metrics) => { });
        integration.on('insights:processed', (insights) => {
            if (insights.healthScore < 80) {
            }
        });
        return system;
    },
    productionSetup: async () => {
        const centralConfig = getConfig();
        const { system, hooks } = await setupClaudeZenMonitoring({
            dashboardPort: centralConfig?.monitoring?.dashboard?.port,
            enableOptimization: centralConfig?.environment?.isProduction,
            metricsInterval: centralConfig?.environment?.isProduction ? 5000 : 1000,
        });
        const integration = system.getIntegration();
        integration.on('insights:processed', (insights) => {
            const criticalAnomalies = insights.anomalies.filter((a) => a.severity === 'critical');
            if (criticalAnomalies.length > 0) {
                logger.error('CRITICAL PERFORMANCE ISSUES:', criticalAnomalies);
            }
        });
        integration.on('optimization:processed', (result) => {
            if (result?.success) {
                const impact = (result?.impact?.performance * 100).toFixed(1);
                if (result?.metrics) {
                }
            }
        });
        return { system, hooks };
    },
};
export default PerformanceMonitoringSystem;
//# sourceMappingURL=index.js.map