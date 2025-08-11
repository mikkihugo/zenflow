/**
 * @file Monitoring module exports.
 */
/**
 * Claude-Zen Performance Monitoring System.
 * Comprehensive real-time monitoring, analytics, and optimization.
 */
export { AnomalyDetection, BottleneckAnalysis, PerformanceAnalyzer, PerformanceInsights, TrendAnalysis, } from './analytics/performance-analyzer.ts';
export { CompositeMetrics, FactMetrics, McpToolMetrics, MetricsCollector, RagMetrics, SwarmMetrics, SystemMetrics, } from './core/metrics-collector.ts';
export { DashboardConfig, DashboardData, DashboardServer, } from './dashboard/dashboard-server.ts';
export { IntegrationConfig, SystemHooks, SystemIntegration, } from './integrations/system-integration.ts';
export { OptimizationAction, OptimizationEngine, OptimizationResult, OptimizationStrategy, } from './optimization/optimization-engine.ts';
export * from './performance/real-time-monitor.ts';
import { type IntegrationConfig, SystemIntegration } from './integrations/system-integration.ts';
/**
 * Main monitoring system factory.
 *
 * @example
 */
export declare class PerformanceMonitoringSystem {
    private integration;
    constructor(config?: Partial<IntegrationConfig>);
    /**
     * Start the complete monitoring system.
     */
    start(): Promise<void>;
    /**
     * Stop the monitoring system.
     */
    stop(): Promise<void>;
    /**
     * Get system integration hooks for external systems.
     */
    getHooks(): import('./integrations/system-integration.ts').SystemHooks;
    /**
     * Get current system status.
     */
    getStatus(): ReturnType<typeof this.integration.getSystemStatus>;
    /**
     * Get the underlying integration instance for advanced usage.
     */
    getIntegration(): SystemIntegration;
}
/**
 * Create and start a monitoring system with default configuration.
 *
 * @param config
 * @example
 */
export declare function createMonitoringSystem(config?: Partial<IntegrationConfig>): Promise<PerformanceMonitoringSystem>;
/**
 * Quick setup function for Claude-Zen integration.
 *
 * @param options
 * @param options.dashboardPort
 * @param options.enableOptimization
 * @param options.metricsInterval
 * @example
 */
export declare function setupClaudeZenMonitoring(options?: {
    dashboardPort?: number;
    enableOptimization?: boolean;
    metricsInterval?: number;
}): Promise<{
    system: PerformanceMonitoringSystem;
    hooks: import('./integrations/system-integration.ts').SystemHooks;
    dashboardUrl: string;
}>;
/**
 * Example usage and integration patterns.
 */
export declare const examples: {
    /**
     * Basic setup example.
     */
    basicSetup: () => Promise<{
        system: PerformanceMonitoringSystem;
        factSystem: {
            onCacheHit: ((key: string, latency: number) => void) | undefined;
            onCacheMiss: ((key: string) => void) | undefined;
            onQuery: ((query: string, duration: number, success: boolean) => void) | undefined;
        };
        ragSystem: {
            onVectorQuery: ((query: any, latency: number, results: number) => void) | undefined;
            onEmbedding: ((text: string, duration: number, dimensions: number) => void) | undefined;
            onRetrieval: ((query: string, chunks: number, relevance: number) => void) | undefined;
        };
        swarmSystem: {
            onAgentSpawn: ((agentId: string, type: string) => void) | undefined;
            onConsensus: ((proposal: any, duration: number, result: boolean) => void) | undefined;
            onTaskComplete: ((taskId: string, duration: number, success: boolean) => void) | undefined;
        };
        dashboardUrl: string;
    }>;
    /**
     * Custom configuration example.
     */
    customSetup: () => Promise<PerformanceMonitoringSystem>;
    /**
     * Production deployment example.
     */
    productionSetup: () => Promise<{
        system: PerformanceMonitoringSystem;
        hooks: import("./integrations/system-integration.ts").SystemHooks;
    }>;
};
export default PerformanceMonitoringSystem;
//# sourceMappingURL=index.d.ts.map