/**
 * System Integration Hub.
 * Connects monitoring system with existing Claude-Zen components.
 */
/**
 * @file System-integration implementation.
 */
import { EventEmitter } from 'node:events';
export interface IntegrationConfig {
    metricsInterval: number;
    dashboardPort: number;
    enableOptimization: boolean;
    enableAlerts: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
}
export interface SystemHooks {
    onFactCacheHit?: (key: string, latency: number) => void;
    onFactCacheMiss?: (key: string) => void;
    onFactQuery?: (query: string, duration: number, success: boolean) => void;
    onFactStorage?: (operation: 'store' | 'retrieve', size: number, duration: number) => void;
    onRagVectorQuery?: (query: any, latency: number, results: number) => void;
    onRagEmbedding?: (text: string, duration: number, dimensions: number) => void;
    onRagRetrieval?: (query: string, chunks: number, relevance: number) => void;
    onSwarmAgentSpawn?: (agentId: string, type: string) => void;
    onSwarmAgentTerminate?: (agentId: string, reason: string) => void;
    onSwarmConsensus?: (proposal: any, duration: number, result: boolean) => void;
    onSwarmTaskAssign?: (taskId: string, agentId: string) => void;
    onSwarmTaskComplete?: (taskId: string, duration: number, success: boolean) => void;
    onMcpToolInvoke?: (toolName: string, parameters: any) => void;
    onMcpToolComplete?: (toolName: string, duration: number, success: boolean, error?: string) => void;
    onMcpToolTimeout?: (toolName: string, duration: number) => void;
}
export declare class SystemIntegration extends EventEmitter {
    private metricsCollector;
    private performanceAnalyzer;
    private optimizationEngine;
    private dashboardServer;
    private config;
    private hooks;
    private isRunning;
    private factMetrics;
    private ragMetrics;
    private swarmMetrics;
    private mcpMetrics;
    constructor(config: IntegrationConfig);
    /**
     * Setup event handlers between components.
     */
    private setupEventHandlers;
    /**
     * Setup system integration hooks.
     */
    private setupSystemHooks;
    /**
     * Start the monitoring system.
     */
    start(): Promise<void>;
    /**
     * Stop the monitoring system.
     */
    stop(): Promise<void>;
    /**
     * Handle collected metrics.
     *
     * @param metrics
     */
    private handleMetricsCollected;
    /**
     * Handle generated insights.
     *
     * @param insights
     */
    private handleInsightsGenerated;
    /**
     * Handle completed optimizations.
     *
     * @param result
     */
    private handleOptimizationCompleted;
    /**
     * Enhance metrics with integration data.
     *
     * @param metrics
     */
    private enhanceMetrics;
    /**
     * Generate alerts based on insights.
     *
     * @param insights
     */
    private generateAlerts;
    /**
     * Get system hooks for external integration.
     */
    getSystemHooks(): SystemHooks;
    /**
     * Get current system status.
     */
    getSystemStatus(): {
        isRunning: boolean;
        components: {
            metricsCollector: boolean;
            performanceAnalyzer: boolean;
            optimizationEngine: boolean;
            dashboardServer: boolean;
        };
        statistics: {
            totalMetricsCollected: number;
            totalInsightsGenerated: number;
            totalOptimizationsRun: number;
            dashboardClients: number;
        };
    };
    /**
     * Reset integration metrics.
     */
    resetMetrics(): void;
    /**
     * Logging utility.
     *
     * @param level
     * @param _message
     * @param {...any} _args
     */
    private log;
}
//# sourceMappingURL=system-integration.d.ts.map