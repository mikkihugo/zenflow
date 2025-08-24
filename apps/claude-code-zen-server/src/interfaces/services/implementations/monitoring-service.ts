/**
 * Monitoring Service Implementation.
 *
 * Service implementation for system monitoring, metrics collection,
 * alerting, and performance tracking.
 */
/**
 * @file Monitoring service implementation.
 */

import BaseService from './base-service';
import type { Service } from './core/interfaces';
import type { MonitoringServiceConfig, ServiceOperationOptions } from './types';

/**
 * Monitoring service implementation.
 *
 * @example
 */
export class MonitoringService extends BaseService implements Service {
  private metrics = new Map<string, any[]>();
  private alerts = new Map<string, any>();
  private collectors = new Map<string, Function>();
  private metricsTimer?: NodeJS.Timeout;
  private alertsTimer?: NodeJS.Timeout;
  constructor(config: MonitoringServiceConfig) {
    super(config?.name, config?.type, config);
    // Add monitoring service capabilities
    this.addCapability('metrics-collection');
    this.addCapability('alerting');
    this.addCapability('performance-tracking');
    this.addCapability('health-monitoring');
    this.addCapability('log-aggregation');
  }
  // ============================================
  // BaseService Implementation
  // ============================================
  protected async doInitialize(): Promise<void> {
    this.logger.info('Initializing monitoring service: ' + this.name + ')');
    // Initialize default metric collectors
    this.initializeDefaultCollectors();
    // Initialize alert configurations
    this.initializeAlertSystem();
    this.logger.info(
      'Monitoring service ' + this.name + ' initialized successfully'
    );
  }
  protected async doStart(): Promise<void> {
    this.logger.info('Starting monitoring service: ' + this.name + ')');
    const config = this.config as MonitoringServiceConfig;
    // Start metrics collection
    if (config?.metrics?.enabled) {
      this.startMetricsCollection();
    }
    // Start alert monitoring
    if (config?.alerts?.enabled) {
      this.startAlertMonitoring();
    }
    this.logger.info(
      'Monitoring service ' + this.name + ' started successfully'
    );
  }
  protected async doStop(): Promise<void> {
    this.logger.info('Stopping monitoring service: ' + this.name + '');
    // Stop timers
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
    if (this.alertsTimer) {
      clearInterval(this.alertsTimer);
      this.alertsTimer = undefined;
    }
    this.logger.info(
      'Monitoring service ' + this.name + ' stopped successfully'
    );
  }
  protected async doDestroy(): Promise<void> {
    this.logger.info('Destroying monitoring service: ' + this.name + ')');
    // Clear all data
    this.metrics?.clear();
    this.alerts?.clear();
    this.collectors?.clear();
    this.logger.info(
      'Monitoring service ' + this.name + ' destroyed successfully'
    );
  }
  protected async doHealthCheck(): Promise<boolean> {
    try {
      // Check if service is running
      if (this.lifecycleStatus !== 'running') {
        return false;
      }
      // Check if metrics are being collected
      const config = this.config as MonitoringServiceConfig;
      if (config?.metrics?.enabled && this.metrics.size === 0) {
        this.logger.warn('Metrics collection is enabled but no metrics found');
        return false;
      }
      // Check memory usage for metrics storage
      const memoryUsage = this.estimateMemoryUsage();
      if (memoryUsage > 100 * 1024 * 1024) {
        // 100MB threshold
        this.logger.warn(
          'High memory usage in monitoring service: ' + memoryUsage + ' bytes'
        );
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(
        'Health check failed for monitoring service ' + this.name + ':',
        error
      );
      return false;
    }
  }
  protected async executeOperation<T = any>(
    operation: string,
    params?: any,
    _options?: ServiceOperationOptions
  ): Promise<T> {
    this.logger.debug('Executing monitoring operation: ' + operation + '');
    switch (operation) {
      case 'collect-metrics':
        return (await this.collectMetrics(params?.source)) as T;
      case 'get-metrics':
        return this.getMetrics(params?.metricName, params?.timeRange) as T;
      case 'record-metric':
        return this.recordMetric(
          params?.name,
          params?.value,
          params?.timestamp
        ) as T;
      case 'create-alert':
        return this.createAlert(params) as T;
      case 'update-alert':
        return this.updateAlert(params?.alertId, params?.config) as T;
      case 'delete-alert':
        return this.deleteAlert(params?.alertId) as T;
      case 'get-alerts':
        return this.getAlerts(params?.status) as T;
      case 'trigger-alert':
        return (await this.triggerAlert(params?.alertId, params?.data)) as T;
      case 'get-stats':
        return this.getMonitoringStats() as T;
      case 'clear-metrics':
        return (await this.clearMetrics(params?.olderThan)) as T;
      case 'export-metrics':
        return (await this.exportMetrics(
          params?.format,
          params?.timeRange
        )) as T;
      default:
        throw new Error('Unknown monitoring operation: ' + operation);
    }
  }
  // ============================================
  // Monitoring Service Specific Methods
  // ============================================
  private async collectMetrics(source?: string): Promise<unknown> {
    const collectedMetrics: any = {};
    if (source) {
      // Collect from specific source
      const collector = this.collectors.get(source);
      if (collector) {
        collectedMetrics[source] = await collector();
      } else {
        throw new Error('Unknown metric source: ' + source);
      }
    } else {
      // Collect from all sources
      for (const [name, collector] of this.collectors?.entries()) {
        try {
          collectedMetrics[name] = await collector();
        } catch (error: any) {
          this.logger.error(
            'Failed to collect metrics from ' + name + ':',
            error
          );
          collectedMetrics[name] = { error: error.message };
        }
      }
    }
    // Store collected metrics
    const timestamp = Date.now();
    for (const [name, value] of Object.entries(collectedMetrics)) {
      this.recordMetric(name, value, timestamp);
    }
    return collectedMetrics;
  }
  private getMetrics(
    metricName?: string,
    timeRange?: { start: number; end: number }
  ): any {
    if (metricName) {
      const metricData = this.metrics.get(metricName) || [];
      if (timeRange) {
        return metricData?.filter(
          (m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
        );
      }
      return metricData;
    }
    // Return all metrics
    const allMetrics: any = {};
    for (const [name, data] of this.metrics?.entries()) {
      allMetrics[name] = timeRange
        ? data?.filter(
            (m) =>
              m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
          )
        : data;
    }
    return allMetrics;
  }
  private recordMetric(name: string, value: any, timestamp?: number): boolean {
    if (!name) {
      throw new Error('Metric name is required');
    }
    const ts = timestamp || Date.now();
    const metric = {
      name,
      value,
      timestamp: ts,
      recorded: new Date(ts),
    };
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);
    // Limit metric history
    const config = this.config as MonitoringServiceConfig;
    const retention = config?.metrics?.retention || 86400000; // 24 hours
    const cutoff = ts - retention;
    // Remove old metrics
    const filtered = metricArray.filter((m) => m.timestamp > cutoff);
    this.metrics.set(name, filtered);
    // Also limit by count to prevent memory issues
    if (filtered.length > 10000) {
      this.metrics.set(name, filtered.slice(-5000)); // Keep last 5000
    }
    this.logger.debug(
      'Recorded metric : ' + name + ' = ' + JSON.stringify(value)
    );
    return true;
  }
  private createAlert(alertConfig: any): any {
    const alertId = 'alert-' + Date.now();
    const alert = {
      id: alertId,
      name: alertConfig?.name || 'Alert ' + alertId,
      condition: alertConfig?.condition,
      threshold: alertConfig?.threshold,
      metric: alertConfig?.metric,
      status: 'active',
      triggered: false,
      createdAt: new Date(),
      channels: alertConfig?.channels || ['console'],
      metadata: alertConfig?.metadata || {},
    };
    this.alerts.set(alertId, alert);
    this.logger.info('Created alert : ' + alert.name + ' ' + alertId);
    return alert;
  }
  private updateAlert(alertId: string, config: unknown): any {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error('Alert not found: ' + alertId);
    }
    Object.assign(alert, config, { updatedAt: new Date() });
    this.alerts.set(alertId, alert);
    this.logger.info('Updated alert: ' + alertId);
    return alert;
  }
  private deleteAlert(alertId: string): boolean {
    const deleted = this.alerts.delete(alertId);
    if (deleted) {
      this.logger.info('Deleted alert: ' + alertId);
    }
    return deleted;
  }
  private getAlerts(status?: 'active' | 'inactive' | 'triggered'): any[] {
    const alerts = Array.from(this.alerts?.values());
    if (status) {
      return alerts.filter((alert) => alert.status === status);
    }
    return alerts;
  }
  private async triggerAlert(alertId: string, data?: any): Promise<unknown> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error('Alert not found: ' + alertId);
    }
    alert.triggered = true;
    alert.lastTriggered = new Date();
    alert.triggerData = data;
    this.logger.warn('Alert triggered: ' + alert.name + ' ' + alertId);
    // Send notifications
    const notifications = await this.sendAlertNotifications(alert, data);
    return {
      alertId,
      triggered: true,
      timestamp: alert.lastTriggered,
      notifications,
    };
  }
  private getMonitoringStats(): any {
    const config = this.config as MonitoringServiceConfig;
    return {
      metricsCount: this.metrics.size,
      alertsCount: this.alerts.size,
      collectorsCount: this.collectors.size,
      activeAlerts: this.getAlerts('active').length,
      triggeredAlerts: this.getAlerts('triggered').length,
      memoryUsage: this.estimateMemoryUsage(),
      isCollecting: !!this.metricsTimer,
      collectionInterval: config?.metrics?.interval || 0,
      retentionPeriod: config?.metrics?.retention || 0,
    };
  }
  private async clearMetrics(olderThan?: number): Promise<{ cleared: number }> {
    const cutoff = olderThan || Date.now() - 86400000; // Default: 24 hours ago
    let totalCleared = 0;
    for (const [name, metricArray] of this.metrics?.entries()) {
      const originalLength = metricArray.length;
      const filtered = metricArray.filter((m) => m.timestamp > cutoff);
      this.metrics.set(name, filtered);
      totalCleared += originalLength - filtered.length;
    }
    this.logger.info('Cleared ' + totalCleared + ' old metrics');
    return { cleared: totalCleared };
  }
  private async exportMetrics(
    format: 'json' | 'csv' = 'json',
    timeRange?: { start: number; end: number }
  ): Promise<unknown> {
    const metrics = this.getMetrics(undefined, timeRange);
    if (format === 'json') {
      return {
        format: 'json',
        exportedAt: new Date(),
        timeRange,
        data: metrics,
      };
    }
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = this.convertMetricsToCSV(metrics);
      return {
        format: 'csv',
        exportedAt: new Date(),
        timeRange,
        data: csvData,
      };
    }
    throw new Error('Unsupported export format: ' + format);
  }
  // ============================================
  // Helper Methods
  // ============================================
  private initializeDefaultCollectors(): void {
    // System metrics collector
    this.collectors.set('system', async () => ({
      cpu: {
        usage: Math.random() * 100,
        loadAvg: [Math.random() * 2, Math.random() * 2, Math.random() * 2],
      },
      memory: {
        total: 8 * 1024 * 1024 * 1024,
        // 8GB
        used: Math.random() * 4 * 1024 * 1024 * 1024,
        // Random usage
        free: Math.random() * 4 * 1024 * 1024 * 1024,
      },
      uptime: process?.uptime(),
    }));
    // Service metrics collector
    this.collectors.set('service', async () => ({
      operationCount: (this as any).operationCount,
      successCount: (this as any).successCount,
      errorCount: (this as any).errorCount,
      averageLatency:
        (this as any).latencyMetrics && (this as any).latencyMetrics.length > 0
          ? (this as any).latencyMetrics.reduce(
              (sum: number, lat: number) => sum + lat,
              0
            ) / (this as any).latencyMetrics.length
          : 0,
    }));
    // Custom application metrics collector
    this.collectors.set('application', async () => ({
      timestamp: Date.now(),
      activeConnections: Math.floor(Math.random() * 100),
      requestsPerSecond: Math.random() * 1000,
      responseTime: Math.random() * 100 + 10,
    }));
  }
  private initializeAlertSystem(): void {
    const config = this.config as MonitoringServiceConfig;
    if (config?.alerts?.enabled && config?.alerts?.thresholds) {
      // Create default alerts based on thresholds
      Object.entries(config?.alerts?.thresholds).forEach(
        ([metric, threshold]) => {
          this.createAlert({
            name: 'High ' + metric,
            metric,
            condition: 'greater_than',
            threshold,
            channels: config?.alerts?.channels?.map((c: any) => c.type) || [
              'console',
            ],
          });
        }
      );
    }
  }
  private startMetricsCollection(): void {
    const config = this.config as MonitoringServiceConfig;
    const interval = config?.metrics?.interval || 10000; // Default: 10 seconds
    this.metricsTimer = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        this.logger.error('Metrics collection failed: ', error);
      }
    }, interval);
    this.logger.info(
      'Started metrics collection with ' + interval + 'ms interval'
    );
  }
  private startAlertMonitoring(): void {
    this.alertsTimer = setInterval(() => {
      this.checkAlerts();
    }, 30000); // Check every 30 seconds
    this.logger.info('Started alert monitoring');
  }
  private checkAlerts(): void {
    for (const alert of this.alerts?.values()) {
      if (alert.status !== 'active') continue;
      try {
        this.evaluateAlert(alert);
      } catch (error) {
        this.logger.error(
          'Alert evaluation failed for ' + alert.id + ':',
          error
        );
      }
    }
  }
  private evaluateAlert(alert: any): void {
    const metricData = this.metrics.get(alert.metric);
    if (!metricData || metricData.length === 0) {
      return;
    }
    // Get latest metric value
    const latest = metricData[metricData.length - 1];
    let value = latest.value;
    // Handle nested values (e.g., system.cpu.usage)
    if (typeof value === 'object' && alert.metric.includes('.')) {
      const path = alert.metric.split('.');
      for (let i = 1; i < path.length; i++) {
        value = value?.[path[i]];
      }
    }
    if (value === undefined || value === null) {
      return;
    }
    // Evaluate condition
    let shouldTrigger = false;
    switch (alert.condition) {
      case 'greater_than':
        shouldTrigger = value > alert.threshold;
        break;
      case 'less_than':
        shouldTrigger = value < alert.threshold;
        break;
      case 'equals':
        shouldTrigger = value === alert.threshold;
        break;
      case 'not_equals':
        shouldTrigger = value !== alert.threshold;
        break;
    }
    if (shouldTrigger && !alert.triggered) {
      this.triggerAlert(alert.id, {
        value,
        threshold: alert.threshold,
      });
    } else if (!shouldTrigger && alert.triggered) {
      // Reset alert
      alert.triggered = false;
      this.logger.info('Alert reset: ' + alert.name + ' ' + alert.id);
    }
  }
  private async sendAlertNotifications(alert: any, data?: any): Promise<any[]> {
    const notifications: any[] = [];
    for (const channel of alert.channels) {
      try {
        const notification = await this.sendNotification(channel, alert, data);
        notifications.push(notification);
      } catch (error: any) {
        this.logger.error(
          'Failed to send notification via ' + channel + ':',
          error
        );
        notifications.push({
          channel,
          success: false,
          error: error.message,
        });
      }
    }
    return notifications;
  }
  private async sendNotification(
    channel: string,
    alert: any,
    data?: any
  ): Promise<unknown> {
    const message =
      'Alert: ' +
      alert.name +
      ' - ' +
      data?.value +
      ' ' +
      alert.condition +
      ' ' +
      alert.threshold;
    switch (channel) {
      case 'console':
        return {
          channel: 'console',
          success: true,
          message,
        };
      case 'email':
        // Would integrate with email service
        this.logger.info('Email notification: ' + message);
        return {
          channel: 'email',
          success: true,
          message,
        };
      case 'webhook':
        // Would send HTTP request to webhook
        this.logger.info('Webhook notification: ' + message);
        return {
          channel: 'webhook',
          success: true,
          message,
        };
      default:
        throw new Error('Unknown notification channel: ' + channel);
    }
  }
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const metricArray of this.metrics?.values()) {
      totalSize += metricArray.length * 200; // Rough estimate: 200 bytes per metric
    }
    totalSize += this.alerts.size * 500; // Rough estimate: 500 bytes per alert
    return totalSize;
  }
  private convertMetricsToCSV(metrics: any): string {
    const csvLines: string[] = [];
    csvLines.push('timestamp,metric,value'); // Header
    for (const [metricName, metricArray] of Object.entries(metrics)) {
      if (Array.isArray(metricArray)) {
        for (const metric of metricArray) {
          const value =
            typeof metric.value === 'object'
              ? JSON.stringify(metric.value)
              : metric.value;
          csvLines.push('' + metric.timestamp + ',' + metricName + ',' + value);
        }
      }
    }
    return csvLines.join('\n');
  }
}

export default MonitoringService;
