/**
 * Database Monitor - TypeScript Edition
 * Comprehensive database health monitoring and metrics collection system
 * with alerting, performance tracking, and automated issue detection
 */

import { EventEmitter } from 'events';
import { JSONValue } from '../types/core';
import {
  DatabaseConnection,
  DatabaseHealthReport,
  DatabaseManager,
  DatabaseMetrics,
  JSONObject,
  type UUID,
} from '../types/database';

interface MonitorConfig {
  checkInterval?: number;
  metricsRetention?: number;
  alertThresholds?: AlertThresholds;
  enableAlerts?: boolean;
  enableTrends?: boolean;
  enablePredictiveAnalysis?: boolean;
}

interface AlertThresholds {
  errorRate?: number; // Percentage (0-100)
  responseTime?: number; // Milliseconds
  connectionUsage?: number; // Percentage (0-100)
  memoryUsage?: number; // Percentage (0-100)
  diskUsage?: number; // Percentage (0-100)
  queryQueueSize?: number; // Number of queued queries
}

interface Alert {id = false
private
startTime = new Date();

// Data storage
private
alerts = new Map();
private
metrics = [];
private
healthHistory = new Map();
private
trends = new Map();

// Statistics
private
stats = {totalChecks = {}) {
    super();

this.databaseManager = databaseManager;
this.config = {checkInterval = = false,enableTrends = = false,enablePredictiveAnalysis = = false
    };

// Listen to database manager events
this.setupEventListeners();
}

  /**
   * Start monitoring
   */
  start(): void
{
    if (this.isRunning) {
      console.warn('Database monitor is already running');
      return;
    }

    console.warn('🔍 Starting database monitor...');
    this.isRunning = true;
    this.startTime = new Date();

    // Start health check monitoring
    this.monitoringTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error = setInterval(async () => 
      try {
        await this.collectMetrics();
      } catch (error = false;

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    console.warn('✅ Database monitor stopped');
    this.emit('monitor = {}): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged && !alert.resolvedAt)
      .filter(alert => {
        if (filters.level && alert.level !== filters.level) return false;
        if (filters.type && alert.type !== filters.type) return false;
        if (filters.database && alert.database !== filters.database) return false;
        return true;
      })
      .sort((a, b) => {

    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    alert.metadata = {
      ...alert.metadata,
      acknowledgedBy,acknowledgedAt = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolvedAt = new Date();
    alert.metadata = {
      ...alert.metadata,
      resolvedBy,resolvedAt = Math.max(0, this.stats.activeAlerts - 1);

    this.emit('alert = {}): PerformanceMetric[] {
    let filtered = this.metrics;

    if (options.database) {
      filtered = filtered.filter(m => m.database === options.database);
    }

    if (options.metric) {
      filtered = filtered.filter(m => m.metric === options.metric);
    }

    if (options.startTime) {
      filtered = filtered.filter(m => m.timestamp >= options.startTime!);
    }

    if (options.endTime) {
      filtered = filtered.filter(m => m.timestamp <= options.endTime!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Get trend analysis
   */
  getTrendAnalysis(database?: string): TrendAnalysis[] {
    const trends = Array.from(this.trends.values());
    
    if (database) {
      return trends.filter(t => t.database === database);
    }

    return trends;

  /**
   * Get monitoring statistics
   */
  getStats(): MonitoringStats {
    return {
      ...this.stats,
      uptime = {}): Promise<{summary = 'day',
      includeAlerts = true,
      includeTrends = true,
      includeRecommendations = true
    } = options;

    const timeRangeMs = {
      hour,day = new Date(Date.now() - timeRangeMs);
    const healthReport = await this.getHealthReport();
    const connections = await this.databaseManager.getAllDatabases();

    // Generate database summaries
    const databases = connections.map(conn => ({
      id = {summary = > (db.health || 0) > 0.8).length,overallHealth = > sum + (db.queryCount || 0), 0),totalErrors = > sum + (db.errorCount || 0), 0),averageResponseTime = > sum + (db.averageResponseTime || 0), 0) / databases.length = this.getActiveAlerts();
    }

    if (includeTrends) {
      report.trends = this.getTrendAnalysis();
    }

    if (includeRecommendations) {
      report.recommendations = this.generateRecommendations(healthReport, databases);
    }

    return report;
  }

  // Private methods

  private async performHealthCheck(): Promise<void> {
    const checkStart = Date.now();
    
    try {
      console.warn('🔍 Performing database health check...');
      
      const healthReport = await this.databaseManager.checkHealth();
      const connections = await this.databaseManager.getAllDatabases();
      
      // Store health history
      for (const [dbId, dbHealth] of Object.entries(healthReport.databases)) {
        if (!this.healthHistory.has(dbId)) {
          this.healthHistory.set(dbId, []);
        }
        
        const history = this.healthHistory.get(dbId)!;
        history.push({overall = 100;
        if (history.length > maxHistory) {
          history.splice(0, history.length - maxHistory);
        }
      }

      // Check thresholds and generate alerts
      if (this.config.enableAlerts) {
        await this.checkAlertThresholds(healthReport, connections);
      }

      // Update statistics
      this.stats.totalChecks++;
      this.stats.lastCheck = new Date();
      
      const checkDuration = Date.now() - checkStart;
      this.stats.averageCheckDuration = this.stats.totalChecks === 1 
        ?checkDuration = await this.databaseManager.getAllDatabases();
      const metrics = await this.databaseManager.getMetrics();
      const timestamp = new Date();

      // Collect metrics for each database
      for (const i = 0; i < connections.length && i < metrics.length; i++) {
        const connection = connections[i];
        const metric = metrics[i];

        // Store performance metrics
        this.storeMetric(timestamp, connection.id, 'response_time', connection.averageResponseTime || 0, 'ms');
        this.storeMetric(timestamp, connection.id, 'query_count', connection.queryCount || 0, 'count');
        this.storeMetric(timestamp, connection.id, 'error_count', connection.errorCount || 0, 'count');
        this.storeMetric(timestamp, connection.id, 'active_connections', metric.activeConnections, 'count');
        this.storeMetric(timestamp, connection.id, 'total_connections', metric.connectionCount, 'count');
        
        // Calculate derived metrics
        const errorRate = connection.queryCount > 0 
          ? (connection.errorCount / connection.queryCount) *100 = metric.connectionCount > 0 
          ? (metric.activeConnections / metric.connectionCount) *100 = new Date(Date.now() - this.config.metricsRetention);
    const before = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoff);
    
    const removed = before - this.metrics.length;
    if (removed > 0) {
      console.warn(`🧹 Cleaned up ${removed} old metrics`);
    }
  }

  private async checkAlertThresholds(healthReport = this.config.alertThresholds;

    for (const connection of connections) {
      const dbHealth = healthReport.databases[connection.id];
      if (!dbHealth) continue;

      // Check error rate
      if (thresholds.errorRate && connection.queryCount > 0) {
        const errorRate = (connection.errorCount / connection.queryCount) * 100;
        if (errorRate > thresholds.errorRate) {
          this.createAlert('critical', 'performance', connection.id,
            `High errorrate = this.generateAlertId();
    
    const alert = {id = this.getHistoricalMetrics({startTime = new Map<string, PerformanceMetric[]>();
    
    // Group metrics by database + metric type
    for (const metric of recentMetrics) {
      const key = `${metric.database}:${metric.metric}`;
      if (!metricGroups.has(key)) {
        metricGroups.set(key, []);
      }
      metricGroups.get(key)!.push(metric);
    }

    // Analyze trends for each group
    for (const [key, metrics] of metricGroups) {
      if (metrics.length < 2) continue;

      const [database, metricName] = key.split(':');
      metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      const values = metrics.map(m => m.value);
      const trend = this.calculateTrend(values);
      
      this.trends.set(key, {metric = values.length;
    const x = Array.from({length = > i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Calculate coefficient of determination (R²)
    const yMean = sumY / n;
    const totalVariation = values.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
    const residualVariation = values.reduce((sum, yi, i) => {
      const predicted = slope * i + (sumY - slope * sumX) / n;
      return sum + (yi - predicted) ** 2;
    }, 0);
    
    const rSquared = totalVariation > 0 ? 1 - (residualVariation / totalVariation) : 0;
    
    // Determine direction
    const direction = 'stable';
    } else if (rSquared < 0.5) {
      direction = 'volatile';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      direction,rate = [];

    // Analyze overall health
    if (healthReport.overall === 'critical') {
      recommendations.push('URGENT = == 'degraded') {
      recommendations.push('WARNING = db.health as number || 0;
      const errorRate = db.errorCount && db.queryCount 
        ? (db.errorCount as number / db.queryCount as number) *100 = this.getTrendAnalysis();
    for (const trend of trends) {
      if (trend.trend === 'increasing' && trend.confidence > 0.7) {
        if (trend.metric === 'error_rate') {
          recommendations.push(`Increasing error rate trend detected in ${trend.database} - investigate root cause`);
        } else if (trend.metric === 'response_time') {
          recommendations.push(`Response time trending upward in ${trend.database} - consider optimization`);
        }
      }
    }

    return recommendations;
  }

  private setupEventListeners(): void 
    // Listen to database manager events for real-time monitoring
    this.databaseManager.on('database => {
      console.warn(`📊 Database connected => {
      this.createAlert('critical', 'availability', event.id,
        `Database error => {
      this.createAlert('warning', 'performance', event.databaseId,
        `Query error: ${event.error}`, 0, 1);
    });

  private generateAlertId(): UUID 
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
}

export default DatabaseMonitor;
