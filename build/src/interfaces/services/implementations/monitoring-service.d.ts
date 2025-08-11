/**
 * Monitoring Service Implementation.
 *
 * Service implementation for system monitoring, metrics collection,
 * alerting, and performance tracking.
 */
/**
 * @file Monitoring service implementation.
 */
import type { IService } from '../core/interfaces.ts';
import type { MonitoringServiceConfig, ServiceOperationOptions } from '../types.ts';
import { BaseService } from './base-service.ts';
/**
 * Monitoring service implementation.
 *
 * @example
 */
export declare class MonitoringService extends BaseService implements IService {
    private metrics;
    private alerts;
    private collectors;
    private metricsTimer?;
    private alertsTimer?;
    constructor(config: MonitoringServiceConfig);
    protected doInitialize(): Promise<void>;
    protected doStart(): Promise<void>;
    protected doStop(): Promise<void>;
    protected doDestroy(): Promise<void>;
    protected doHealthCheck(): Promise<boolean>;
    protected executeOperation<T = any>(operation: string, params?: any, _options?: ServiceOperationOptions): Promise<T>;
    private collectMetrics;
    private getMetrics;
    private recordMetric;
    private createAlert;
    private updateAlert;
    private deleteAlert;
    private getAlerts;
    private triggerAlert;
    private getMonitoringStats;
    private clearMetrics;
    private exportMetrics;
    private initializeDefaultCollectors;
    private initializeAlertSystem;
    private startMetricsCollection;
    private startAlertMonitoring;
    private checkAlerts;
    private evaluateAlert;
    private sendAlertNotifications;
    private sendNotification;
    private estimateMemoryUsage;
    private convertMetricsToCSV;
}
export default MonitoringService;
//# sourceMappingURL=monitoring-service.d.ts.map