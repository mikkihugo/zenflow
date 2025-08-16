/**
 * Error Monitoring and Reporting Infrastructure.
 *
 * Comprehensive error tracking, aggregation, analysis, and alerting system.
 * for Claude-Zen distributed architecture.
 */
/**
 * @file error-monitoring implementation
 */
import { type BaseClaudeZenError, type ErrorContext, type ErrorMetrics } from './errors';
export interface ErrorReport {
    id: string;
    timestamp: number;
    error: BaseClaudeZenError | Error;
    context: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    component: string;
    recoveryAttempted: boolean;
    recoverySuccessful: boolean;
    userImpact: 'none' | 'minimal' | 'moderate' | 'severe';
    resolution?: string;
    tags: string[];
}
export interface ErrorTrend {
    category: string;
    component: string;
    errorCount: number;
    errorRate: number;
    firstSeen: number;
    lastSeen: number;
    trending: 'up' | 'down' | 'stable';
    averageRecoveryTime: number;
    userImpactLevel: 'none' | 'minimal' | 'moderate' | 'severe';
}
export interface SystemHealthMetrics {
    timestamp: number;
    overallHealth: 'excellent' | 'good' | 'degraded' | 'critical';
    errorRate: number;
    activeErrors: number;
    criticalErrors: number;
    componentHealth: Map<string, 'healthy' | 'warning' | 'error' | 'critical'>;
    performanceImpact: number;
    userSatisfactionScore: number;
    uptime: number;
    mttr: number;
    mtbf: number;
    averageResponseTime: number;
}
export interface AlertConfig {
    name: string;
    condition: (metrics: SystemHealthMetrics, trends: ErrorTrend[]) => boolean;
    severity: 'info' | 'warning' | 'error' | 'critical';
    cooldownMs: number;
    recipients: string[];
    template: string;
}
export declare class ErrorStorage {
    private reports;
    private trends;
    private maxReports;
    private maxTrends;
    storeErrorReport(report: ErrorReport): void;
    private updateTrends;
    private calculateErrorRate;
    private calculateTrending;
    getErrorReports(category?: string, component?: string, severity?: string, limit?: number): ErrorReport[];
    getErrorTrends(): ErrorTrend[];
    getComponentMetrics(component: string): ErrorMetrics;
}
export interface HealthCheck {
    name: string;
    component: string;
    check: () => Promise<{
        healthy: boolean;
        details?: unknown;
        responseTime?: number;
    }>;
    intervalMs: number;
    timeoutMs: number;
    criticalFailureThreshold: number;
}
export declare class HealthMonitor {
    private checks;
    private checkResults;
    private intervals;
    addHealthCheck(check: HealthCheck): void;
    private startHealthCheck;
    private runHealthCheck;
    getSystemHealth(): SystemHealthMetrics;
    stopAllChecks(): void;
}
export declare class AlertSystem {
    private configs;
    private lastAlertTime;
    private alertHandlers;
    addAlertConfig(config: AlertConfig): void;
    addAlertHandler(handler: (alert: AlertConfig, message: string) => Promise<void>): void;
    checkAlerts(metrics: SystemHealthMetrics, trends: ErrorTrend[]): Promise<void>;
    private generateAlertMessage;
}
export declare class ErrorMonitor {
    private storage;
    private healthMonitor;
    private alertSystem;
    private monitoringInterval;
    constructor();
    private setupDefaultHealthChecks;
    private setupDefaultAlerts;
    reportError(error: Error, context?: Partial<ErrorContext>): void;
    updateErrorRecovery(errorId: string, attempted: boolean, successful: boolean, resolution?: string): void;
    private generateErrorId;
    private assessUserImpact;
    private generateErrorTags;
    startMonitoring(intervalMs?: number): void;
    stopMonitoring(): void;
    getSystemMetrics(): SystemHealthMetrics;
    getErrorReports(category?: string, component?: string, limit?: number): ErrorReport[];
    getErrorTrends(): ErrorTrend[];
    getComponentMetrics(component: string): ErrorMetrics;
    addAlertHandler(handler: (alert: AlertConfig, message: string) => Promise<void>): void;
    private checkFactDatabase;
    private checkFactQueryProcessor;
    private checkFactInferenceEngine;
    private checkFactMemoryStore;
    private checkVectorDatabase;
    private checkEmbeddingService;
    private checkDocumentIndex;
    private checkSimilaritySearch;
    private checkRetrieval;
    private getAverageVectorSearchTime;
    private getIndexedDocumentCount;
}
export declare const errorMonitor: ErrorMonitor;
//# sourceMappingURL=error-monitoring.d.ts.map