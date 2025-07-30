/**
 * Database Monitor - TypeScript Edition
 * Comprehensive database health monitoring and metrics collection system
 * with alerting, performance tracking, and automated issue detection
 */

import {
  DatabaseManager,
  DatabaseHealthReport,
  DatabaseMetrics,
  DatabaseConnection,
  JSONObject,
  UUID
} from '../types/database';
import { JSONValue } from '../types/core';
import { EventEmitter } from 'events';

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

interface Alert {
  id: UUID;
  level: 'info' | 'warning' | 'critical' | 'emergency';
  type: 'performance' | 'availability' | 'capacity' | 'security';
  database: string;
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  metadata?: JSONObject;
}

interface PerformanceMetric {
  timestamp: Date;
  database: string;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

interface TrendAnalysis {
  metric: string;
  database: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  rate: number; // Rate of change per hour
  confidence: number; // 0-1
  prediction?: {
    nextHour: number;
    nextDay: number;
    nextWeek: number;
  };
}

interface MonitoringStats {
  totalChecks: number;
  failedChecks: number;
  activeAlerts: number;
  resolvedAlerts: number;
  averageCheckDuration: number;
  lastCheck: Date;
  uptime: number;
}

export class DatabaseMonitor extends EventEmitter {
  private databaseManager: DatabaseManager;
  private config: Required<MonitorConfig>;
  private monitoringTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private startTime: Date = new Date();
  
  // Data storage
  private alerts: Map<UUID, Alert> = new Map();
  private metrics: PerformanceMetric[] = [];
  private healthHistory: Map<string, DatabaseHealthReport[]> = new Map();
  private trends: Map<string, TrendAnalysis> = new Map();
  
  // Statistics
  private stats: MonitoringStats = {
    totalChecks: 0,
    failedChecks: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    averageCheckDuration: 0,
    lastCheck: new Date(),
    uptime: 0
  };

  constructor(databaseManager: DatabaseManager, config: MonitorConfig = {}) {
    super();
    
    this.databaseManager = databaseManager;
    this.config = {
      checkInterval: config.checkInterval || 30000, // 30 seconds
      metricsRetention: config.metricsRetention || 86400000, // 24 hours
      alertThresholds: {
        errorRate: 5.0, // 5%
        responseTime: 1000, // 1 second
        connectionUsage: 80, // 80%
        memoryUsage: 85, // 85%
        diskUsage: 90, // 90%
        queryQueueSize: 50,
        ...config.alertThresholds
      },
      enableAlerts: config.enableAlerts !== false,
      enableTrends: config.enableTrends !== false,
      enablePredictiveAnalysis: config.enablePredictiveAnalysis !== false
    };

    // Listen to database manager events
    this.setupEventListeners();
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Database monitor is already running');
      return;
    }

    console.log('🔍 Starting database monitor...');
    this.isRunning = true;
    this.startTime = new Date();

    // Start health check monitoring
    this.monitoringTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error: any) {
        console.error(`Health check failed: ${error.message}`);
        this.stats.failedChecks++;
      }
    }, this.config.checkInterval);

    // Start metrics collection
    this.metricsTimer = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error: any) {
        console.error(`Metrics collection failed: ${error.message}`);
      }
    }, Math.min(this.config.checkInterval, 10000)); // Collect metrics more frequently

    console.log('✅ Database monitor started');
    this.emit('monitor:started');
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping database monitor...');
    this.isRunning = false;

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    console.log('✅ Database monitor stopped');
    this.emit('monitor:stopped');
  }

  /**
   * Get current health report for all databases
   */
  async getHealthReport(): Promise<DatabaseHealthReport> {
    return this.databaseManager.checkHealth();
  }

  /**
   * Get metrics for a specific database
   */
  async getDatabaseMetrics(databaseId?: string): Promise<DatabaseMetrics[]> {
    return this.databaseManager.getMetrics();
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(filters: {
    level?: Alert['level'];
    type?: Alert['type'];
    database?: string;
  } = {}): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged && !alert.resolvedAt)
      .filter(alert => {
        if (filters.level && alert.level !== filters.level) return false;
        if (filters.type && alert.type !== filters.type) return false;
        if (filters.database && alert.database !== filters.database) return false;
        return true;
      })
      .sort((a, b) => {
        const levelOrder = { emergency: 4, critical: 3, warning: 2, info: 1 };
        return levelOrder[b.level] - levelOrder[a.level];
      });
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: UUID, acknowledgedBy?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.acknowledged = true;
    alert.metadata = {
      ...alert.metadata,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString()
    };

    this.emit('alert:acknowledged', { alert, acknowledgedBy });
    return true;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: UUID, resolvedBy?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolvedAt = new Date();
    alert.metadata = {
      ...alert.metadata,
      resolvedBy,
      resolvedAt: alert.resolvedAt.toISOString()
    };

    this.stats.resolvedAlerts++;
    this.stats.activeAlerts = Math.max(0, this.stats.activeAlerts - 1);

    this.emit('alert:resolved', { alert, resolvedBy });
    return true;
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(options: {
    database?: string;
    metric?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  } = {}): PerformanceMetric[] {
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
  }

  /**
   * Get monitoring statistics
   */
  getStats(): MonitoringStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.startTime.getTime(),
      lastCheck: this.stats.lastCheck
    };
  }

  /**
   * Generate performance report
   */
  async generateReport(options: {
    timeRange?: 'hour' | 'day' | 'week' | 'month';
    includeAlerts?: boolean;
    includeTrends?: boolean;
    includeRecommendations?: boolean;
  } = {}): Promise<{
    summary: JSONObject;
    databases: JSONObject[];
    alerts?: Alert[];
    trends?: TrendAnalysis[];
    recommendations?: string[];
  }> {
    const {
      timeRange = 'day',
      includeAlerts = true,
      includeTrends = true,
      includeRecommendations = true
    } = options;

    const timeRangeMs = {
      hour: 3600000,
      day: 86400000,
      week: 604800000,
      month: 2592000000
    }[timeRange];

    const startTime = new Date(Date.now() - timeRangeMs);
    const healthReport = await this.getHealthReport();
    const connections = await this.databaseManager.getAllDatabases();

    // Generate database summaries
    const databases = connections.map(conn => ({
      id: conn.id,
      type: conn.type,
      status: conn.status,
      queryCount: conn.queryCount,
      errorCount: conn.errorCount,
      averageResponseTime: conn.averageResponseTime,
      health: healthReport.databases[conn.id]?.health || 0
    }));

    const report: any = {
      summary: {
        totalDatabases: connections.length,
        healthyDatabases: databases.filter(db => (db.health || 0) > 0.8).length,
        overallHealth: healthReport.overall,
        totalQueries: databases.reduce((sum, db) => sum + (db.queryCount || 0), 0),
        totalErrors: databases.reduce((sum, db) => sum + (db.errorCount || 0), 0),
        averageResponseTime: databases.length > 0 
          ? databases.reduce((sum, db) => sum + (db.averageResponseTime || 0), 0) / databases.length
          : 0,
        reportPeriod: timeRange,
        generatedAt: new Date().toISOString()
      },
      databases
    };

    if (includeAlerts) {
      report.alerts = this.getActiveAlerts();
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
      console.log('🔍 Performing database health check...');
      
      const healthReport = await this.databaseManager.checkHealth();
      const connections = await this.databaseManager.getAllDatabases();
      
      // Store health history
      for (const [dbId, dbHealth] of Object.entries(healthReport.databases)) {
        if (!this.healthHistory.has(dbId)) {
          this.healthHistory.set(dbId, []);
        }
        
        const history = this.healthHistory.get(dbId)!;
        history.push({
          overall: dbHealth.health > 0.8 ? 'healthy' : dbHealth.health > 0.5 ? 'degraded' : 'critical',
          databases: { [dbId]: dbHealth },
          systemHealth: healthReport.systemHealth
        });
        
        // Keep only recent history
        const maxHistory = 100;
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
        ? checkDuration
        : (this.stats.averageCheckDuration + checkDuration) / 2;

      this.emit('health:checked', { healthReport, duration: checkDuration });
      
    } catch (error: any) {
      this.stats.failedChecks++;
      this.emit('health:check_failed', { error: error.message });
      throw error;
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      const connections = await this.databaseManager.getAllDatabases();
      const metrics = await this.databaseManager.getMetrics();
      const timestamp = new Date();

      // Collect metrics for each database
      for (let i = 0; i < connections.length && i < metrics.length; i++) {
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
          ? (connection.errorCount / connection.queryCount) * 100 
          : 0;
        this.storeMetric(timestamp, connection.id, 'error_rate', errorRate, 'percent');

        const connectionUsage = metric.connectionCount > 0 
          ? (metric.activeConnections / metric.connectionCount) * 100 
          : 0;
        this.storeMetric(timestamp, connection.id, 'connection_usage', connectionUsage, 'percent');
      }

      // Clean up old metrics
      this.cleanupMetrics();

      // Update trends if enabled
      if (this.config.enableTrends) {
        this.updateTrends();
      }

      this.emit('metrics:collected', { count: this.metrics.length });

    } catch (error: any) {
      console.error(`Metrics collection failed: ${error.message}`);
      this.emit('metrics:collection_failed', { error: error.message });
    }
  }

  private storeMetric(timestamp: Date, database: string, metric: string, value: number, unit: string): void {
    this.metrics.push({
      timestamp,
      database,
      metric,
      value,
      unit
    });
  }

  private cleanupMetrics(): void {
    const cutoff = new Date(Date.now() - this.config.metricsRetention);
    const before = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoff);
    
    const removed = before - this.metrics.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} old metrics`);
    }
  }

  private async checkAlertThresholds(
    healthReport: DatabaseHealthReport, 
    connections: DatabaseConnection[]
  ): Promise<void> {
    const thresholds = this.config.alertThresholds;

    for (const connection of connections) {
      const dbHealth = healthReport.databases[connection.id];
      if (!dbHealth) continue;

      // Check error rate
      if (thresholds.errorRate && connection.queryCount > 0) {
        const errorRate = (connection.errorCount / connection.queryCount) * 100;
        if (errorRate > thresholds.errorRate) {
          this.createAlert('critical', 'performance', connection.id,
            `High error rate: ${errorRate.toFixed(2)}%`,
            thresholds.errorRate, errorRate);
        }
      }

      // Check response time
      if (thresholds.responseTime && connection.averageResponseTime > thresholds.responseTime) {
        this.createAlert('warning', 'performance', connection.id,
          `High response time: ${connection.averageResponseTime}ms`,
          thresholds.responseTime, connection.averageResponseTime);
      }

      // Check overall health
      if (dbHealth.health < 0.5) {
        this.createAlert('critical', 'availability', connection.id,
          `Database health critical: ${(dbHealth.health * 100).toFixed(1)}%`,
          0.5, dbHealth.health);
      } else if (dbHealth.health < 0.8) {
        this.createAlert('warning', 'availability', connection.id,
          `Database health degraded: ${(dbHealth.health * 100).toFixed(1)}%`,
          0.8, dbHealth.health);
      }
    }
  }

  private createAlert(
    level: Alert['level'],
    type: Alert['type'],
    database: string,
    message: string,
    threshold: number,
    actualValue: number
  ): void {
    const alertId = this.generateAlertId();
    
    const alert: Alert = {
      id: alertId,
      level,
      type,
      database,
      message,
      threshold,
      actualValue,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.set(alertId, alert);
    this.stats.activeAlerts++;

    console.warn(`🚨 Alert [${level.toUpperCase()}]: ${message}`);
    this.emit('alert:created', alert);
  }

  private updateTrends(): void {
    // Simple trend analysis implementation
    const recentMetrics = this.getHistoricalMetrics({
      startTime: new Date(Date.now() - 3600000) // Last hour
    });

    const metricGroups = new Map<string, PerformanceMetric[]>();
    
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
      
      this.trends.set(key, {
        metric: metricName,
        database,
        trend: trend.direction,
        rate: trend.rate,
        confidence: trend.confidence
      });
    }
  }

  private calculateTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    rate: number;
    confidence: number;
  } {
    if (values.length < 2) {
      return { direction: 'stable', rate: 0, confidence: 0 };
    }

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Calculate coefficient of determination (R²)
    const yMean = sumY / n;
    const totalVariation = values.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualVariation = values.reduce((sum, yi, i) => {
      const predicted = slope * i + (sumY - slope * sumX) / n;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    
    const rSquared = totalVariation > 0 ? 1 - (residualVariation / totalVariation) : 0;
    
    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    if (Math.abs(slope) < 0.1) {
      direction = 'stable';
    } else if (rSquared < 0.5) {
      direction = 'volatile';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      direction,
      rate: slope,
      confidence: Math.max(0, Math.min(1, rSquared))
    };
  }

  private generateRecommendations(
    healthReport: DatabaseHealthReport,
    databases: JSONObject[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze overall health
    if (healthReport.overall === 'critical') {
      recommendations.push('URGENT: Multiple databases are in critical state. Immediate attention required.');
    } else if (healthReport.overall === 'degraded') {
      recommendations.push('WARNING: System performance is degraded. Review database configurations.');
    }

    // Analyze individual databases
    for (const db of databases) {
      const health = db.health as number || 0;
      const errorRate = db.errorCount && db.queryCount 
        ? (db.errorCount as number / db.queryCount as number) * 100 
        : 0;

      if (health < 0.5) {
        recommendations.push(`Critical: Database ${db.id} requires immediate attention`);
      }

      if (errorRate > 10) {
        recommendations.push(`High error rate (${errorRate.toFixed(1)}%) in database ${db.id} - investigate query patterns`);
      }

      if ((db.averageResponseTime as number || 0) > 5000) {
        recommendations.push(`Slow queries detected in database ${db.id} - consider indexing or query optimization`);
      }
    }

    // Check trends
    const trends = this.getTrendAnalysis();
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

  private setupEventListeners(): void {
    // Listen to database manager events for real-time monitoring
    this.databaseManager.on('database:connected', (event) => {
      console.log(`📊 Database connected: ${event.id}`);
      this.emit('database:connected', event);
    });

    this.databaseManager.on('database:error', (event) => {
      this.createAlert('critical', 'availability', event.id,
        `Database error: ${event.error}`, 0, 1);
    });

    this.databaseManager.on('query:error', (event) => {
      this.createAlert('warning', 'performance', event.databaseId,
        `Query error: ${event.error}`, 0, 1);
    });
  }

  private generateAlertId(): UUID {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as UUID;
  }
}

export default DatabaseMonitor;