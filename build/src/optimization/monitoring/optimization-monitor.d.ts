/**
 * Performance Optimization Monitor.
 * Real-time monitoring and alerting for optimization processes.
 */
/**
 * @file Optimization-monitor implementation.
 */
import { EventEmitter } from 'node:events';
import type { OptimizationResult, PerformanceMetrics } from '../interfaces/optimization-interfaces.ts';
export interface OptimizationAlert {
    id: string;
    type: 'performance_degradation' | 'optimization_failure' | 'target_missed' | 'resource_threshold';
    severity: 'low' | 'medium' | 'high' | 'critical';
    domain: string;
    message: string;
    metrics: PerformanceMetrics;
    timestamp: Date;
    acknowledged: boolean;
}
export interface OptimizationMonitorConfig {
    enabled: boolean;
    monitoringInterval: number;
    alertThresholds: {
        latency: number;
        throughput: number;
        memoryUsage: number;
        cpuUsage: number;
        errorRate: number;
    };
    retentionPeriod: number;
    realTimeUpdates: boolean;
}
export interface OptimizationDashboard {
    currentMetrics: PerformanceMetrics;
    trends: {
        latency: number[];
        throughput: number[];
        memoryUsage: number[];
        cpuUsage: number[];
    };
    alerts: OptimizationAlert[];
    optimizationHistory: OptimizationResult[];
    systemHealth: {
        overall: 'healthy' | 'warning' | 'critical';
        domains: Record<string, 'healthy' | 'warning' | 'critical'>;
    };
    recommendations: OptimizationRecommendation[];
}
export interface OptimizationRecommendation {
    id: string;
    domain: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    estimatedImpact: number;
    implementationEffort: 'low' | 'medium' | 'high';
    automated: boolean;
}
export declare class OptimizationMonitor extends EventEmitter {
    private config;
    private metricsHistory;
    private alerts;
    private optimizationHistory;
    private isMonitoring;
    private monitoringInterval;
    constructor(config?: Partial<OptimizationMonitorConfig>);
    /**
     * Start optimization monitoring.
     */
    startMonitoring(): void;
    /**
     * Stop optimization monitoring.
     */
    stopMonitoring(): void;
    /**
     * Record optimization result.
     *
     * @param result
     */
    recordOptimizationResult(result: OptimizationResult): void;
    /**
     * Record performance metrics.
     *
     * @param domain
     * @param metrics
     */
    recordMetrics(domain: string, metrics: PerformanceMetrics): void;
    /**
     * Get current optimization dashboard.
     */
    getDashboard(): OptimizationDashboard;
    /**
     * Get alerts by severity.
     *
     * @param severity
     */
    getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): OptimizationAlert[];
    /**
     * Acknowledge alert.
     *
     * @param alertId
     */
    acknowledgeAlert(alertId: string): void;
    /**
     * Get optimization trends for domain.
     *
     * @param _domain
     * @param period
     */
    getOptimizationTrends(_domain: string, period?: number): {
        improvements: number[];
        successes: number[];
        failures: number[];
    };
    /**
     * Perform monitoring cycle.
     */
    private performMonitoringCycle;
    /**
     * Check for performance degradation.
     *
     * @param result
     */
    private checkPerformanceDegradation;
    /**
     * Check threshold violations.
     *
     * @param domain
     * @param metrics
     */
    private checkThresholds;
    /**
     * Create alert.
     *
     * @param alertData
     * @param alertData.type
     * @param alertData.severity
     * @param alertData.domain
     * @param alertData.message
     * @param alertData.metrics
     */
    private createAlert;
    /**
     * Get current system metrics.
     */
    private getCurrentMetrics;
    /**
     * Calculate performance trends.
     */
    private calculateTrends;
    /**
     * Assess system health.
     */
    private assessSystemHealth;
    /**
     * Generate optimization recommendations.
     */
    private generateRecommendations;
    /**
     * Get active alerts.
     */
    private getActiveAlerts;
    /**
     * Get recent optimizations.
     */
    private getRecentOptimizations;
    /**
     * Collect metrics for specific domain.
     *
     * @param domain
     */
    private collectDomainMetrics;
    /**
     * Cleanup old data.
     */
    private cleanupOldData;
}
//# sourceMappingURL=optimization-monitor.d.ts.map