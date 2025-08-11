/**
 * Monitoring Dashboard Integration for ZenSwarm.
 *
 * Provides dashboard-ready data export, real-time metrics streaming,
 * and integration points for monitoring systems like Grafana, Prometheus, etc.
 *
 * Features:
 * - Real-time metrics streaming
 * - Dashboard-ready data formatting
 * - Integration with external monitoring systems
 * - Custom metric aggregation and visualization
 * - Alert correlation and analysis
 * - Performance trend analysis.
 */
/**
 * @file Coordination system: monitoring-dashboard.
 */
import { EventEmitter } from 'node:events';
export declare class MonitoringDashboard extends EventEmitter {
    options: any;
    logger: any;
    private metrics;
    private aggregatedMetrics;
    private alerts;
    private trends;
    private healthStatus;
    private streamingClients;
    private lastUpdate;
    private healthMonitor;
    private recoveryWorkflows;
    private connectionManager;
    private mcpTools;
    private aggregationTimer;
    constructor(options?: any);
    /**
     * Initialize monitoring dashboard.
     */
    initialize(): Promise<void>;
    /**
     * Set integration points.
     *
     * @param healthMonitor
     */
    setHealthMonitor(healthMonitor: any): void;
    setRecoveryWorkflows(recoveryWorkflows: any): void;
    setConnectionManager(connectionManager: any): void;
    setMCPTools(mcpTools: any): void;
    /**
     * Record health metric.
     *
     * @param healthResult
     */
    recordHealthMetric(healthResult: any): void;
    /**
     * Record alert.
     *
     * @param alert
     */
    recordAlert(alert: any): void;
    /**
     * Record recovery metric.
     *
     * @param eventType
     * @param event
     */
    recordRecoveryMetric(eventType: string, event: any): void;
    /**
     * Record connection metric.
     *
     * @param eventType
     * @param event
     */
    recordConnectionMetric(eventType: string, event: any): void;
    /**
     * Add metric to storage.
     *
     * @param key
     * @param metric
     */
    addMetric(key: string, metric: any): void;
    /**
     * Start metric aggregation.
     */
    startMetricAggregation(): void;
    /**
     * Aggregate metrics for dashboard display.
     */
    aggregateMetrics(): void;
    /**
     * Aggregate health metrics.
     *
     * @param aggregations
     * @param timestamp
     */
    aggregateHealthMetrics(aggregations: Map<string, any>, timestamp: Date): void;
    /**
     * Aggregate recovery metrics.
     *
     * @param aggregations
     * @param timestamp
     */
    aggregateRecoveryMetrics(aggregations: Map<string, any>, timestamp: Date): void;
    /**
     * Aggregate connection metrics.
     *
     * @param aggregations
     * @param timestamp
     */
    aggregateConnectionMetrics(aggregations: Map<string, any>, timestamp: Date): void;
    /**
     * Aggregate system metrics.
     *
     * @param aggregations
     * @param timestamp
     */
    aggregateSystemMetrics(aggregations: Map<string, any>, timestamp: Date): void;
    /**
     * Update trend analysis.
     *
     * @param aggregations
     * @param timestamp
     */
    updateTrends(aggregations: Map<string, any>, timestamp: Date): void;
    /**
     * Set up data collection.
     */
    setupDataCollection(): void;
    /**
     * Collect current system state.
     */
    collectSystemState(): void;
    /**
     * Record system metric.
     *
     * @param name
     * @param data
     */
    recordSystemMetric(name: string, data: any): void;
    /**
     * Stream update to real-time clients.
     *
     * @param type
     * @param data
     */
    streamUpdate(type: string, data: any): void;
    /**
     * Add streaming client.
     *
     * @param client
     */
    addStreamingClient(client: any): void;
    /**
     * Get dashboard data in specified format.
     *
     * @param format
     */
    exportDashboardData(format?: string): any;
    /**
     * Generate summary statistics.
     */
    generateSummary(): any;
    /**
     * Export health data for dashboard.
     */
    exportHealthData(): any;
    /**
     * Export recovery data for dashboard.
     */
    exportRecoveryData(): any;
    /**
     * Export connection data for dashboard.
     */
    exportConnectionData(): any;
    /**
     * Export system data for dashboard.
     */
    exportSystemData(): any;
    /**
     * Export alert data for dashboard.
     */
    exportAlertData(): any;
    /**
     * Export trend data for dashboard.
     */
    exportTrendData(): any;
    /**
     * Helper methods for data processing.
     */
    getRecentMetrics(category: string, limit?: number): any[];
    getCategoryBreakdown(category: string): {
        [key: string]: number;
    };
    getPriorityBreakdown(category: string): {
        [key: string]: number;
    };
    getWorkflowBreakdown(): {
        [key: string]: number;
    };
    getRecoverySuccessRate(): number;
    getConnectionTypeBreakdown(): {
        [key: string]: number;
    };
    getConnectionHealthStatus(): any;
    getCurrentSystemState(): any;
    getAlertBreakdown(alerts: any[]): any;
    /**
     * Format data for Prometheus.
     *
     * @param data
     */
    formatForPrometheus(data: any): string;
    /**
     * Format data for Grafana.
     *
     * @param data
     */
    formatForGrafana(data: any): any;
    /**
     * Acknowledge alert.
     *
     * @param alertId
     * @param acknowledgedBy
     */
    acknowledgeAlert(alertId: string, acknowledgedBy?: string): void;
    /**
     * Get monitoring statistics.
     */
    getMonitoringStats(): any;
    /**
     * Cleanup and shutdown.
     */
    shutdown(): Promise<void>;
}
export default MonitoringDashboard;
//# sourceMappingURL=monitoring-dashboard.d.ts.map