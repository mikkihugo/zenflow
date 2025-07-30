/**
 * Plugin Health Monitor
 * Comprehensive health monitoring, metrics collection, and diagnostic system for plugins
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import {
  Plugin,
  PluginManifest,
  PluginConfig,
  PluginHealthResult,
  PluginHealthReport,
  PluginSystemHealth,
  PluginMetrics,
  PluginDiagnostics,
  PluginTestResult,
  PluginStatus,
  ResourceUsage,
  JSONObject
} from '../types/plugin.js';

interface HealthMetrics {
  pluginName: string;
  timestamp: Date;
  uptime: number; // milliseconds
  performance: {
    responseTime: number; // ms
    throughput: number; // operations per second
    errorRate: number; // percentage
    successRate: number; // percentage
  };
  stability: {
    crashes: number;
    restarts: number;
    consecutiveSuccesses: number;
    consecutiveFailures: number;
    lastCrash?: Date;
    lastRestart?: Date;
  };
  dependencies: {
    status: 'healthy' | 'degraded' | 'failing';
    failedChecks: string[];
    latency: number; // ms
  };
  custom: JSONObject; // Plugin-specific metrics
}

interface HealthCheck {
  name: string;
  pluginName: string;
  type: 'basic' | 'detailed' | 'performance' | 'dependency' | 'custom';
  enabled: boolean;
  interval: number; // milliseconds
  timeout: number; // milliseconds
  retries: number;
  lastRun?: Date;
  lastResult?: PluginHealthResult;
  consecutiveFailures: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface HealthThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
  comparison: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
}

interface HealthTrend {
  pluginName: string;
  metric: string;
  trend: 'improving' | 'stable' | 'degrading' | 'critical';
  confidence: number; // 0-1
  predictedValue: number;
  dataPoints: { timestamp: Date; value: number }[];
}

interface SystemHealthSummary {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  pluginCount: {
    total: number;
    healthy: number;
    degraded: number;
    critical: number;
    offline: number;
  };
  systemMetrics: {
    averageResponseTime: number;
    totalThroughput: number;
    systemErrorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  alerts: {
    critical: number;
    warnings: number;
    total: number;
  };
  trends: HealthTrend[];
  recommendations: string[];
}

export class HealthMonitor extends EventEmitter {
  private plugins: Map<string, {
    plugin: Plugin;
    manifest: PluginManifest;
    config: PluginConfig;
    metrics: HealthMetrics[];
    healthChecks: HealthCheck[];
    lastHealthResult?: PluginHealthResult;
    startTime: Date;
  }> = new Map();

  private healthCheckInterval?: NodeJS.Timeout;
  private metricsCollectionInterval?: NodeJS.Timeout;
  private trendAnalysisInterval?: NodeJS.Timeout;
  
  private healthThresholds: Map<string, HealthThreshold[]> = new Map();
  private healthTrends: Map<string, HealthTrend[]> = new Map();
  private systemHealthHistory: { timestamp: Date; summary: SystemHealthSummary }[] = [];

  private readonly config: {
    enabled: boolean;
    healthCheckInterval: number;
    metricsInterval: number;
    trendAnalysisInterval: number;
    retentionPeriod: number;
    maxHistoryPoints: number;
    enablePredictive: boolean;
    enableAutomaticRecovery: boolean;
  };

  constructor(config: Partial<typeof HealthMonitor.prototype.config> = {}) {
    super();

    this.config = {
      enabled: true,
      healthCheckInterval: 30000, // 30 seconds
      metricsInterval: 10000, // 10 seconds
      trendAnalysisInterval: 300000, // 5 minutes
      retentionPeriod: 86400000, // 24 hours
      maxHistoryPoints: 1000,
      enablePredictive: true,
      enableAutomaticRecovery: false,
      ...config
    };

    if (this.config.enabled) {
      this.startMonitoring();
    }

    this.setupDefaultThresholds();
  }

  // Plugin registration for health monitoring
  registerPlugin(
    pluginName: string,
    plugin: Plugin,
    manifest: PluginManifest,
    config: PluginConfig
  ): void {
    const healthChecks = this.createDefaultHealthChecks(pluginName, manifest, config);

    this.plugins.set(pluginName, {
      plugin,
      manifest,
      config,
      metrics: [],
      healthChecks,
      startTime: new Date()
    });

    // Set up plugin-specific thresholds
    this.setupPluginThresholds(pluginName, config);

    this.emit('plugin-registered', { pluginName, healthChecks: healthChecks.length });
  }

  unregisterPlugin(pluginName: string): void {
    this.plugins.delete(pluginName);
    this.healthThresholds.delete(pluginName);
    this.healthTrends.delete(pluginName);
    this.emit('plugin-unregistered', { pluginName });
  }

  // Health monitoring
  private startMonitoring(): void {
    // Regular health checks
    this.healthCheckInterval = setInterval(() => {
      this.performScheduledHealthChecks();
    }, this.config.healthCheckInterval);

    // Metrics collection
    this.metricsCollectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);

    // Trend analysis
    if (this.config.enablePredictive) {
      this.trendAnalysisInterval = setInterval(() => {
        this.analyzeTrends();
      }, this.config.trendAnalysisInterval);
    }

    // Cleanup old data
    setInterval(() => {
      this.cleanupOldData();
    }, 600000); // Every 10 minutes
  }

  private async performScheduledHealthChecks(): Promise<void> {
    const now = new Date();

    for (const [pluginName, pluginData] of this.plugins) {
      for (const healthCheck of pluginData.healthChecks) {
        if (this.shouldRunHealthCheck(healthCheck, now)) {
          try {
            await this.runHealthCheck(pluginName, healthCheck);
          } catch (error: any) {
            this.emit('health-check-error', {
              pluginName,
              healthCheckName: healthCheck.name,
              error: error.message
            });
          }
        }
      }
    }
  }

  private shouldRunHealthCheck(healthCheck: HealthCheck, now: Date): boolean {
    if (!healthCheck.enabled) return false;
    
    if (!healthCheck.lastRun) return true;
    
    const timeSinceLastRun = now.getTime() - healthCheck.lastRun.getTime();
    return timeSinceLastRun >= healthCheck.interval;
  }

  private async runHealthCheck(pluginName: string, healthCheck: HealthCheck): Promise<void> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return;

    const startTime = performance.now();
    let result: PluginHealthResult;

    try {
      healthCheck.lastRun = new Date();

      switch (healthCheck.type) {
        case 'basic':
          result = await this.performBasicHealthCheck(pluginData.plugin);
          break;
        case 'detailed':
          result = await this.performDetailedHealthCheck(pluginData.plugin);
          break;
        case 'performance':
          result = await this.performPerformanceHealthCheck(pluginData.plugin);
          break;
        case 'dependency':
          result = await this.performDependencyHealthCheck(pluginData.plugin);
          break;
        case 'custom':
          result = await this.performCustomHealthCheck(pluginData.plugin, healthCheck);
          break;
        default:
          result = await this.performBasicHealthCheck(pluginData.plugin);
      }

      const duration = performance.now() - startTime;
      
      // Update health check result
      healthCheck.lastResult = result;
      pluginData.lastHealthResult = result;
      
      // Reset consecutive failures on success
      if (result.status === 'healthy') {
        healthCheck.consecutiveFailures = 0;
      } else {
        healthCheck.consecutiveFailures++;
      }

      // Emit health check completed event
      this.emit('health-check-completed', {
        pluginName,
        healthCheckName: healthCheck.name,
        result,
        duration
      });

      // Check for alerts
      await this.evaluateHealthAlerts(pluginName, result, healthCheck);

    } catch (error: any) {
      healthCheck.consecutiveFailures++;
      
      result = {
        status: 'unhealthy',
        score: 0,
        issues: [{
          severity: 'critical',
          message: `Health check failed: ${error.message}`,
          component: 'health-monitor'
        }],
        metrics: {},
        lastCheck: new Date()
      };

      this.emit('health-check-failed', {
        pluginName,
        healthCheckName: healthCheck.name,
        error: error.message,
        consecutiveFailures: healthCheck.consecutiveFailures
      });
    }
  }

  private async performBasicHealthCheck(plugin: Plugin): Promise<PluginHealthResult> {
    try {
      // Check if plugin is responsive
      const startTime = performance.now();
      const result = await plugin.healthCheck();
      const responseTime = performance.now() - startTime;

      // Enhance basic result with response time
      result.metrics = {
        ...result.metrics,
        responseTime,
        timestamp: Date.now()
      };

      return result;
    } catch (error: any) {
      return {
        status: 'unhealthy',
        score: 0,
        issues: [{
          severity: 'critical',
          message: `Basic health check failed: ${error.message}`,
          component: 'plugin'
        }],
        metrics: { responseTime: -1, timestamp: Date.now() },
        lastCheck: new Date()
      };
    }
  }

  private async performDetailedHealthCheck(plugin: Plugin): Promise<PluginHealthResult> {
    const basicResult = await this.performBasicHealthCheck(plugin);
    
    // Add detailed checks
    const detailedIssues = [];
    let detailedScore = basicResult.score;

    // Check resource usage
    if (typeof (plugin as any).getResourceUsage === 'function') {
      try {
        const resourceUsage = await (plugin as any).getResourceUsage();
        basicResult.metrics.resourceUsage = resourceUsage;

        // Check memory usage
        if (resourceUsage.allocated.memory > 500 * 1024 * 1024) { // 500MB
          detailedIssues.push({
            severity: 'medium',
            message: `High memory usage: ${(resourceUsage.allocated.memory / 1024 / 1024).toFixed(1)}MB`,
            component: 'resources'
          });
          detailedScore -= 10;
        }
      } catch (error) {
        // Resource usage check failed
      }
    }

    // Check API endpoints
    if (typeof (plugin as any).getRegisteredAPIs === 'function') {
      try {
        const apis = await (plugin as any).getRegisteredAPIs();
        basicResult.metrics.apiCount = apis.length;
        
        if (apis.length === 0) {
          detailedIssues.push({
            severity: 'low',
            message: 'No APIs registered',
            component: 'api'
          });
          detailedScore -= 5;
        }
      } catch (error) {
        // API check failed
      }
    }

    return {
      ...basicResult,
      score: Math.max(0, detailedScore),
      issues: [...basicResult.issues, ...detailedIssues]
    };
  }

  private async performPerformanceHealthCheck(plugin: Plugin): Promise<PluginHealthResult> {
    const startTime = performance.now();
    
    try {
      // Perform multiple operations to test performance
      const operations = [];
      for (let i = 0; i < 5; i++) {
        operations.push(plugin.healthCheck());
      }

      const results = await Promise.all(operations);
      const totalTime = performance.now() - startTime;
      const averageResponseTime = totalTime / operations.length;

      const issues = [];
      let score = 100;

      // Evaluate performance
      if (averageResponseTime > 1000) { // 1 second
        issues.push({
          severity: 'high',
          message: `Slow response time: ${averageResponseTime.toFixed(1)}ms`,
          component: 'performance'
        });
        score -= 30;
      } else if (averageResponseTime > 500) {
        issues.push({
          severity: 'medium',
          message: `Moderate response time: ${averageResponseTime.toFixed(1)}ms`,
          component: 'performance'
        });
        score -= 15;
      }

      return {
        status: score > 70 ? 'healthy' : score > 40 ? 'degraded' : 'unhealthy',
        score,
        issues,
        metrics: {
          averageResponseTime,
          totalOperations: operations.length,
          totalTime,
          timestamp: Date.now()
        },
        lastCheck: new Date()
      };

    } catch (error: any) {
      return {
        status: 'unhealthy',
        score: 0,
        issues: [{
          severity: 'critical',
          message: `Performance test failed: ${error.message}`,
          component: 'performance'
        }],
        metrics: { timestamp: Date.now() },
        lastCheck: new Date()
      };
    }
  }

  private async performDependencyHealthCheck(plugin: Plugin): Promise<PluginHealthResult> {
    const issues = [];
    let score = 100;
    const metrics: JSONObject = { timestamp: Date.now() };

    // Check if plugin has dependency checking capability
    if (typeof (plugin as any).checkDependencies === 'function') {
      try {
        const dependencyResults = await (plugin as any).checkDependencies();
        metrics.dependencies = dependencyResults;

        for (const [depName, depStatus] of Object.entries(dependencyResults)) {
          if (depStatus === 'failed' || depStatus === 'unhealthy') {
            issues.push({
              severity: 'high',
              message: `Dependency ${depName} is ${depStatus}`,
              component: 'dependencies'
            });
            score -= 20;
          } else if (depStatus === 'degraded') {
            issues.push({
              severity: 'medium',
              message: `Dependency ${depName} is degraded`,
              component: 'dependencies'
            });
            score -= 10;
          }
        }
      } catch (error: any) {
        issues.push({
          severity: 'medium',
          message: `Dependency check failed: ${error.message}`,
          component: 'dependencies'
        });
        score -= 15;
      }
    } else {
      // No dependency checking available
      metrics.dependencyCheckAvailable = false;
    }

    return {
      status: score > 70 ? 'healthy' : score > 40 ? 'degraded' : 'unhealthy',
      score,
      issues,
      metrics,
      lastCheck: new Date()
    };
  }

  private async performCustomHealthCheck(plugin: Plugin, healthCheck: HealthCheck): Promise<PluginHealthResult> {
    // Custom health checks would be defined by plugins themselves
    // This is a placeholder implementation
    return await this.performBasicHealthCheck(plugin);
  }

  // Metrics collection
  private async collectMetrics(): Promise<void> {
    const now = new Date();

    for (const [pluginName, pluginData] of this.plugins) {
      try {
        const metrics = await this.gatherPluginHealthMetrics(pluginName, pluginData);
        pluginData.metrics.push(metrics);

        // Emit metrics collected event
        this.emit('metrics-collected', { pluginName, metrics });
      } catch (error: any) {
        this.emit('metrics-error', { pluginName, error: error.message });
      }
    }
  }

  private async gatherPluginHealthMetrics(
    pluginName: string,
    pluginData: { plugin: Plugin; manifest: PluginManifest; config: PluginConfig; startTime: Date }
  ): Promise<HealthMetrics> {
    const now = new Date();
    const uptime = now.getTime() - pluginData.startTime.getTime();

    // Get basic performance metrics
    const performanceMetrics = await this.getPerformanceMetrics(pluginData.plugin);
    const stabilityMetrics = await this.getStabilityMetrics(pluginName);
    const dependencyMetrics = await this.getDependencyMetrics(pluginData.plugin);
    const customMetrics = await this.getCustomMetrics(pluginData.plugin);

    return {
      pluginName,
      timestamp: now,
      uptime,
      performance: performanceMetrics,
      stability: stabilityMetrics,
      dependencies: dependencyMetrics,
      custom: customMetrics
    };
  }

  private async getPerformanceMetrics(plugin: Plugin): Promise<HealthMetrics['performance']> {
    // This would track actual performance metrics over time
    // For now, returning default values
    return {
      responseTime: 100,
      throughput: 10,
      errorRate: 0,
      successRate: 100
    };
  }

  private async getStabilityMetrics(pluginName: string): Promise<HealthMetrics['stability']> {
    // This would track stability metrics
    // For now, returning default values
    return {
      crashes: 0,
      restarts: 0,
      consecutiveSuccesses: 10,
      consecutiveFailures: 0
    };
  }

  private async getDependencyMetrics(plugin: Plugin): Promise<HealthMetrics['dependencies']> {
    if (typeof (plugin as any).checkDependencies === 'function') {
      try {
        const deps = await (plugin as any).checkDependencies();
        const failedChecks = Object.entries(deps)
          .filter(([, status]) => status === 'failed')
          .map(([name]) => name);

        return {
          status: failedChecks.length === 0 ? 'healthy' : 'failing',
          failedChecks,
          latency: 50 // Would measure actual latency
        };
      } catch (error) {
        return {
          status: 'failing',
          failedChecks: ['dependency-check-failed'],
          latency: -1
        };
      }
    }

    return {
      status: 'healthy',
      failedChecks: [],
      latency: 0
    };
  }

  private async getCustomMetrics(plugin: Plugin): Promise<JSONObject> {
    if (typeof (plugin as any).getMetrics === 'function') {
      try {
        return await (plugin as any).getMetrics();
      } catch (error) {
        return { error: 'Failed to get custom metrics' };
      }
    }

    return {};
  }

  // Health evaluation and alerts
  private async evaluateHealthAlerts(
    pluginName: string,
    result: PluginHealthResult,
    healthCheck: HealthCheck
  ): Promise<void> {
    const thresholds = this.healthThresholds.get(pluginName) || [];

    for (const threshold of thresholds) {
      const metricValue = this.extractMetricValue(result.metrics, threshold.metric);
      if (metricValue !== null && this.checkThreshold(metricValue, threshold)) {
        this.emit('health-alert', {
          pluginName,
          healthCheckName: healthCheck.name,
          threshold,
          actualValue: metricValue,
          severity: metricValue >= threshold.critical ? 'critical' : 'warning',
          timestamp: new Date()
        });
      }
    }

    // Check for consecutive failures
    if (healthCheck.consecutiveFailures >= 3) {
      this.emit('health-alert', {
        pluginName,
        healthCheckName: healthCheck.name,
        severity: 'critical',
        message: `${healthCheck.consecutiveFailures} consecutive health check failures`,
        timestamp: new Date()
      });

      // Consider automatic recovery
      if (this.config.enableAutomaticRecovery) {
        this.emit('automatic-recovery-triggered', { pluginName, healthCheck: healthCheck.name });
      }
    }
  }

  private extractMetricValue(metrics: JSONObject, metricPath: string): number | null {
    const path = metricPath.split('.');
    let value: any = metrics;

    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return typeof value === 'number' ? value : null;
  }

  private checkThreshold(value: number, threshold: HealthThreshold): boolean {
    const criticalValue = threshold.critical;
    
    switch (threshold.comparison) {
      case 'greater_than':
        return value > criticalValue;
      case 'less_than':
        return value < criticalValue;
      case 'equals':
        return value === criticalValue;
      case 'not_equals':
        return value !== criticalValue;
      default:
        return false;
    }
  }

  // Trend analysis
  private async analyzeTrends(): Promise<void> {
    for (const [pluginName, pluginData] of this.plugins) {
      const trends = await this.calculateHealthTrends(pluginName, pluginData.metrics);
      this.healthTrends.set(pluginName, trends);
      
      for (const trend of trends) {
        if (trend.trend === 'critical' || trend.trend === 'degrading') {
          this.emit('health-trend-alert', {
            pluginName,
            trend,
            timestamp: new Date()
          });
        }
      }
    }

    // Update system health summary
    const systemSummary = await this.generateSystemHealthSummary();
    this.systemHealthHistory.push({ timestamp: new Date(), summary: systemSummary });

    // Limit history size
    if (this.systemHealthHistory.length > this.config.maxHistoryPoints) {
      this.systemHealthHistory = this.systemHealthHistory.slice(-this.config.maxHistoryPoints);
    }

    this.emit('system-health-updated', systemSummary);
  }

  private async calculateHealthTrends(pluginName: string, metrics: HealthMetrics[]): Promise<HealthTrend[]> {
    if (metrics.length < 5) return []; // Need at least 5 data points

    const trends: HealthTrend[] = [];
    const recentMetrics = metrics.slice(-20); // Last 20 data points

    // Analyze response time trend
    const responseTimes = recentMetrics.map(m => ({
      timestamp: m.timestamp,
      value: m.performance.responseTime
    }));

    if (responseTimes.length >= 5) {
      const responseTimeTrend = this.calculateTrend(responseTimes);
      trends.push({
        pluginName,
        metric: 'responseTime',
        trend: responseTimeTrend.trend,
        confidence: responseTimeTrend.confidence,
        predictedValue: responseTimeTrend.predictedValue,
        dataPoints: responseTimes
      });
    }

    // Analyze error rate trend
    const errorRates = recentMetrics.map(m => ({
      timestamp: m.timestamp,
      value: m.performance.errorRate
    }));

    if (errorRates.length >= 5) {
      const errorRateTrend = this.calculateTrend(errorRates);
      trends.push({
        pluginName,
        metric: 'errorRate',
        trend: errorRateTrend.trend,
        confidence: errorRateTrend.confidence,
        predictedValue: errorRateTrend.predictedValue,
        dataPoints: errorRates
      });
    }

    return trends;
  }

  private calculateTrend(dataPoints: { timestamp: Date; value: number }[]): {
    trend: 'improving' | 'stable' | 'degrading' | 'critical';
    confidence: number;
    predictedValue: number;
  } {
    // Simple linear regression for trend analysis
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, point, index) => sum + index, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
    const sumXY = dataPoints.reduce((sum, point, index) => sum + (index * point.value), 0);
    const sumXX = dataPoints.reduce((sum, point, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const meanY = sumY / n;
    const totalVariation = dataPoints.reduce((sum, point) => sum + Math.pow(point.value - meanY, 2), 0);
    const explainedVariation = dataPoints.reduce((sum, point, index) => {
      const predictedY = slope * index + intercept;
      return sum + Math.pow(predictedY - meanY, 2);
    }, 0);
    const rSquared = explainedVariation / totalVariation;

    // Predict next value
    const predictedValue = slope * n + intercept;

    // Determine trend
    let trend: 'improving' | 'stable' | 'degrading' | 'critical';
    const slopeThreshold = 0.1;
    
    if (Math.abs(slope) < slopeThreshold) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = slope > slopeThreshold * 3 ? 'critical' : 'degrading';
    } else {
      trend = 'improving';
    }

    return {
      trend,
      confidence: Math.max(0, Math.min(1, rSquared)),
      predictedValue
    };
  }

  // System health summary
  async generateSystemHealthSummary(): Promise<SystemHealthSummary> {
    const plugins = Array.from(this.plugins.values());
    const healthyCount = plugins.filter(p => p.lastHealthResult?.status === 'healthy').length;
    const degradedCount = plugins.filter(p => p.lastHealthResult?.status === 'degraded').length;
    const criticalCount = plugins.filter(p => p.lastHealthResult?.status === 'unhealthy').length;
    const offlineCount = plugins.filter(p => !p.lastHealthResult).length;

    // Calculate overall system score
    const totalScore = plugins.reduce((sum, p) => sum + (p.lastHealthResult?.score || 0), 0);
    const averageScore = plugins.length > 0 ? totalScore / plugins.length : 100;

    // Calculate system metrics
    const allMetrics = plugins.flatMap(p => p.metrics);
    const recentMetrics = allMetrics.filter(m => Date.now() - m.timestamp.getTime() < 300000); // Last 5 minutes

    const systemMetrics = {
      averageResponseTime: this.calculateAverage(recentMetrics.map(m => m.performance.responseTime)),
      totalThroughput: recentMetrics.reduce((sum, m) => sum + m.performance.throughput, 0),
      systemErrorRate: this.calculateAverage(recentMetrics.map(m => m.performance.errorRate)),
      memoryUsage: 0, // Would calculate from actual system metrics
      cpuUsage: 0 // Would calculate from actual system metrics
    };

    // Get all trends
    const allTrends = Array.from(this.healthTrends.values()).flat();
    
    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'critical';
    if (criticalCount > 0 || averageScore < 40) {
      overall = 'critical';
    } else if (degradedCount > 0 || averageScore < 70) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    // Generate recommendations
    const recommendations = this.generateHealthRecommendations(plugins, allTrends);

    return {
      overall,
      score: Math.round(averageScore),
      pluginCount: {
        total: plugins.length,
        healthy: healthyCount,
        degraded: degradedCount,
        critical: criticalCount,
        offline: offlineCount
      },
      systemMetrics,
      alerts: {
        critical: criticalCount,
        warnings: degradedCount,
        total: criticalCount + degradedCount
      },
      trends: allTrends,
      recommendations
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private generateHealthRecommendations(
    plugins: any[],
    trends: HealthTrend[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for plugins with poor health
    const unhealthyPlugins = plugins.filter(p => p.lastHealthResult?.status === 'unhealthy');
    if (unhealthyPlugins.length > 0) {
      recommendations.push(`Investigate ${unhealthyPlugins.length} unhealthy plugin(s)`);
    }

    // Check for degrading trends
    const degradingTrends = trends.filter(t => t.trend === 'degrading' && t.confidence > 0.7);
    if (degradingTrends.length > 0) {
      recommendations.push(`Monitor ${degradingTrends.length} plugin(s) with degrading performance trends`);
    }

    // Check for high error rates
    const highErrorRatePlugins = plugins.filter(p => {
      const recentMetrics = p.metrics.slice(-5);
      const avgErrorRate = this.calculateAverage(recentMetrics.map((m: any) => m.performance.errorRate));
      return avgErrorRate > 5; // 5% error rate
    });

    if (highErrorRatePlugins.length > 0) {
      recommendations.push(`Review error handling for ${highErrorRatePlugins.length} plugin(s) with high error rates`);
    }

    return recommendations;
  }

  // Setup methods
  private createDefaultHealthChecks(
    pluginName: string,
    manifest: PluginManifest,
    config: PluginConfig
  ): HealthCheck[] {
    const checks: HealthCheck[] = [];

    // Basic health check
    checks.push({
      name: 'basic-health',
      pluginName,
      type: 'basic',
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      retries: 2,
      consecutiveFailures: 0,
      priority: 'high'
    });

    // Performance check
    checks.push({
      name: 'performance',
      pluginName,
      type: 'performance',
      enabled: true,
      interval: 60000, // 1 minute
      timeout: 10000, // 10 seconds
      retries: 1,
      consecutiveFailures: 0,
      priority: 'medium'
    });

    // Dependency check (if plugin supports it)
    checks.push({
      name: 'dependencies',
      pluginName,
      type: 'dependency',
      enabled: true,
      interval: 120000, // 2 minutes
      timeout: 15000, // 15 seconds
      retries: 1,
      consecutiveFailures: 0,
      priority: 'medium'
    });

    return checks;
  }

  private setupDefaultThresholds(): void {
    const defaultThresholds: HealthThreshold[] = [
      {
        metric: 'responseTime',
        warning: 500,
        critical: 1000,
        unit: 'ms',
        comparison: 'greater_than'
      },
      {
        metric: 'performance.errorRate',
        warning: 5,
        critical: 10,
        unit: '%',
        comparison: 'greater_than'
      },
      {
        metric: 'score',
        warning: 70,
        critical: 40,
        unit: 'points',
        comparison: 'less_than'
      }
    ];

    // Apply default thresholds to all plugins
    for (const [pluginName] of this.plugins) {
      this.healthThresholds.set(pluginName, [...defaultThresholds]);
    }
  }

  private setupPluginThresholds(pluginName: string, config: PluginConfig): void {
    const thresholds = [...(this.healthThresholds.get(pluginName) || [])];

    // Add plugin-specific thresholds from config
    if (config.healthThresholds) {
      thresholds.push(...config.healthThresholds);
    }

    this.healthThresholds.set(pluginName, thresholds);
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    for (const [pluginName, pluginData] of this.plugins) {
      // Clean up old metrics
      pluginData.metrics = pluginData.metrics.filter(
        metric => metric.timestamp.getTime() > cutoffTime
      );
    }

    // Clean up system health history
    this.systemHealthHistory = this.systemHealthHistory.filter(
      entry => entry.timestamp.getTime() > cutoffTime
    );
  }

  // Public API methods
  async getPluginHealth(pluginName: string): Promise<PluginHealthResult | null> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return null;

    return pluginData.lastHealthResult || null;
  }

  async getPluginHealthReport(pluginName: string): Promise<PluginHealthReport | null> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return null;

    const recentMetrics = pluginData.metrics.slice(-10); // Last 10 metrics
    const trends = this.healthTrends.get(pluginName) || [];

    return {
      pluginName,
      currentHealth: pluginData.lastHealthResult || {
        status: 'unhealthy',
        score: 0,
        issues: [{ severity: 'critical', message: 'No health data available', component: 'monitor' }],
        metrics: {},
        lastCheck: new Date()
      },
      metrics: recentMetrics,
      trends,
      uptime: Date.now() - pluginData.startTime.getTime(),
      healthChecks: pluginData.healthChecks.map(hc => ({
        name: hc.name,
        type: hc.type,
        enabled: hc.enabled,
        lastRun: hc.lastRun,
        consecutiveFailures: hc.consecutiveFailures
      })),
      recommendations: this.generatePluginRecommendations(pluginData),
      generatedAt: new Date()
    };
  }

  private generatePluginRecommendations(pluginData: any): string[] {
    const recommendations: string[] = [];

    if (pluginData.lastHealthResult?.score < 70) {
      recommendations.push('Plugin health score is below optimal threshold');
    }

    const failingChecks = pluginData.healthChecks.filter((hc: any) => hc.consecutiveFailures > 0);
    if (failingChecks.length > 0) {
      recommendations.push(`${failingChecks.length} health check(s) are failing`);
    }

    const recentMetrics = pluginData.metrics.slice(-5);
    if (recentMetrics.length > 0) {
      const avgResponseTime = this.calculateAverage(recentMetrics.map((m: any) => m.performance.responseTime));
      if (avgResponseTime > 500) {
        recommendations.push('Consider optimizing plugin response time');
      }
    }

    return recommendations;
  }

  async getSystemHealth(): Promise<SystemHealthSummary> {
    return await this.generateSystemHealthSummary();
  }

  getPluginMetrics(pluginName: string, limit?: number): HealthMetrics[] {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return [];

    const metrics = pluginData.metrics;
    return limit ? metrics.slice(-limit) : metrics;
  }

  async runImmediateHealthCheck(pluginName: string, checkType?: string): Promise<PluginHealthResult | null> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return null;

    const healthCheck = checkType 
      ? pluginData.healthChecks.find(hc => hc.name === checkType || hc.type === checkType)
      : pluginData.healthChecks.find(hc => hc.type === 'basic');

    if (!healthCheck) return null;

    await this.runHealthCheck(pluginName, healthCheck);
    return pluginData.lastHealthResult || null;
  }

  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = undefined;
    }

    if (this.trendAnalysisInterval) {
      clearInterval(this.trendAnalysisInterval);
      this.trendAnalysisInterval = undefined;
    }

    this.plugins.clear();
    this.healthThresholds.clear();
    this.healthTrends.clear();
    this.systemHealthHistory.length = 0;
  }
}

export default HealthMonitor;