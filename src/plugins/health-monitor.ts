/**
 * Plugin Health Monitor
 * Comprehensive health monitoring, metrics collection, and diagnostic system for plugins
 */

import { performance } from 'node:perf_hooks';
import { BasePlugin } from './base-plugin.js';
import type { Plugin, PluginManifest, PluginContext, PluginConfig } from './types.js';

interface HealthMetrics {
  timestamp: Date;
  pluginName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  responseTime: number;
  issues: HealthIssue[];
  performance: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  resources: {
    memory: number;
    cpu: number;
  };
  dependencies?: Record<string, string>;
}

interface HealthIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
}

interface HealthCheck {
  name: string;
  type: 'basic' | 'detailed' | 'performance' | 'dependency' | 'custom';
  interval: number;
  timeout: number;
  lastRun: Date;
  lastResult?: HealthMetrics;
  consecutiveFailures: number;
  customCheck?: (plugin: Plugin) => Promise<HealthMetrics>;
}

interface HealthThreshold {
  metric: string;
  comparison: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  warning: number;
  critical: number;
}

interface HealthTrend {
  pluginName: string;
  metric: string;
  trend: 'improving' | 'stable' | 'degrading' | 'critical';
  confidence: number;
  prediction: number;
  timestamp: Date;
}

interface SystemHealthSummary {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  timestamp: Date;
  pluginCounts: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    total: number;
  };
  recommendations: string[];
  trends: HealthTrend[];
  recentMetrics: HealthMetrics[];
}

interface PluginData {
  plugin: Plugin;
  manifest: PluginManifest;
  config: PluginConfig;
  healthChecks: HealthCheck[];
  metrics: HealthMetrics[];
  lastHealthResult?: HealthMetrics;
}

interface HealthMonitorConfig extends PluginConfig {
  healthCheckInterval: number;
  metricsInterval: number;
  trendAnalysisInterval: number;
  enablePredictive: boolean;
  retentionPeriod: number;
  maxHistoryPoints: number;
  alertThresholds: {
    consecutiveFailures: number;
    responseTimeWarning: number;
    responseTimeCritical: number;
  };
}

export class HealthMonitor extends BasePlugin {
  private plugins = new Map<string, PluginData>();
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsCollectionInterval?: NodeJS.Timeout;
  private trendAnalysisInterval?: NodeJS.Timeout;
  private healthThresholds = new Map<string, HealthThreshold[]>();
  private healthTrends = new Map<string, HealthTrend[]>();
  private systemHealthHistory: SystemHealthSummary[] = [];
  public readonly config: HealthMonitorConfig;

  constructor(manifest: PluginManifest, config: HealthMonitorConfig, context: PluginContext) {
    super(manifest, config, context);
    
    const defaultConfig: HealthMonitorConfig = {
      enabled: true,
      priority: 50,
      settings: {},
      healthCheckInterval: 30000, // 30 seconds
      metricsInterval: 10000, // 10 seconds
      trendAnalysisInterval: 300000, // 5 minutes
      enablePredictive: true,
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      maxHistoryPoints: 1000,
      alertThresholds: {
        consecutiveFailures: 3,
        responseTimeWarning: 500,
        responseTimeCritical: 1000
      }
    };
    
    this.config = { ...defaultConfig, ...config };
  }

  async onInitialize(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Start health check interval
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

  async onStart(): Promise<void> {
    this.context.logger.info('Health Monitor plugin started');
  }

  async onStop(): Promise<void> {
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
    
    this.context.logger.info('Health Monitor plugin stopped');
  }

  async onDestroy(): Promise<void> {
    await this.onStop();
    this.plugins.clear();
    this.healthThresholds.clear();
    this.healthTrends.clear();
    this.systemHealthHistory = [];
    this.context.logger.info('Health Monitor plugin destroyed');
  }

  async registerPlugin(pluginName: string, plugin: Plugin, manifest: PluginManifest, config: PluginConfig): Promise<void> {
    const healthChecks = this.createDefaultHealthChecks(pluginName, manifest, config);
    this.plugins.set(pluginName, {
      plugin,
      manifest,
      config,
      healthChecks,
      metrics: [],
      lastHealthResult: undefined
    });

    this.setupHealthThresholds(pluginName, config);
    this.emit('plugin-registered', pluginName);
  }

  private async performScheduledHealthChecks(): Promise<void> {
    const now = new Date();
    for (const [pluginName, pluginData] of this.plugins) {
      for (const healthCheck of pluginData.healthChecks) {
        if (this.shouldRunHealthCheck(healthCheck, now)) {
          try {
            await this.runHealthCheck(pluginName, healthCheck);
          } catch (error) {
            this.context.apis.logger.error(`Health check failed for ${pluginName}: ${error}`);
          }
        }
      }
    }
  }

  private shouldRunHealthCheck(healthCheck: HealthCheck, now: Date): boolean {
    const timeSinceLastRun = now.getTime() - healthCheck.lastRun.getTime();
    return timeSinceLastRun >= healthCheck.interval;
  }

  private async runHealthCheck(pluginName: string, healthCheck: HealthCheck): Promise<void> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return;

    const startTime = performance.now();
    let result: HealthMetrics;

    switch (healthCheck.type) {
      case 'basic':
        result = await this.performBasicHealthCheck(pluginName, pluginData.plugin);
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
        result = await this.performBasicHealthCheck(pluginName, pluginData.plugin);
    }

    // Update health check result
    healthCheck.lastRun = new Date();
    healthCheck.lastResult = result;
    pluginData.lastHealthResult = result;

    // Reset consecutive failures on success
    if (result.status === 'healthy') {
      healthCheck.consecutiveFailures = 0;
    } else {
      healthCheck.consecutiveFailures++;
    }

    // Check for alerts
    this.checkHealthAlerts(pluginName, result, healthCheck);

    // Emit health check completed event
    this.emit('health-check-completed', {
      pluginName,
      healthCheckName: healthCheck.name,
      result,
      executionTime: performance.now() - startTime
    });
  }

  private async performBasicHealthCheck(pluginName: string, plugin: Plugin): Promise<HealthMetrics> {
    const startTime = performance.now();
    const result = await plugin.healthCheck();
    const responseTime = performance.now() - startTime;

    // Enhance basic result with response time
    const enhancedResult = {
      ...result,
      pluginName,
      responseTime,
      timestamp: new Date(),
      performance: {
        responseTime,
        errorRate: 0,
        throughput: 1000 / responseTime
      },
      resources: {
        memory: 0,
        cpu: 0
      }
    };

    // Ensure all issues have timestamps and proper structure
    if (enhancedResult.issues) {
      enhancedResult.issues = enhancedResult.issues.map(issue => ({
        component: issue.component || pluginName,
        severity: issue.severity as 'low' | 'medium' | 'high' | 'critical',
        message: issue.message,
        timestamp: issue.timestamp || new Date()
      } as HealthIssue));
    }

    return enhancedResult;
  }

  private async performDetailedHealthCheck(plugin: Plugin): Promise<HealthMetrics> {
    const pluginName = plugin.name || 'unknown';
    const basicResult = await this.performBasicHealthCheck(pluginName, plugin);

    // Add detailed checks
    const detailedIssues: HealthIssue[] = [];
    let detailedScore = basicResult.score;

    // Check resource usage
    if (typeof (plugin as any).getResourceUsage === 'function') {
      try {
        const resourceUsage = await (plugin as any).getResourceUsage();
        basicResult.resources = resourceUsage;

        // Check memory usage
        if (resourceUsage.memory > 500 * 1024 * 1024) { // 500MB
          detailedIssues.push({
            severity: 'high',
            message: 'High memory usage detected',
            timestamp: new Date()
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
        if (apis.length === 0) {
          detailedIssues.push({
            severity: 'medium',
            message: 'No APIs registered',
            timestamp: new Date()
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

  private async performPerformanceHealthCheck(plugin: Plugin): Promise<HealthMetrics> {
    const startTime = performance.now();
    
    try {
      // Perform multiple operations to test performance
      const operations: Promise<any>[] = [];
      for (let i = 0; i < 5; i++) {
        operations.push(plugin.healthCheck());
      }

      await Promise.all(operations);
      const totalTime = performance.now() - startTime;
      const averageResponseTime = totalTime / operations.length;

      const issues: HealthIssue[] = [];
      let score = 100;

      // Evaluate performance
      if (averageResponseTime > 1000) { // 1 second
        issues.push({
          severity: 'critical',
          message: 'Very slow response time',
          timestamp: new Date()
        });
        score -= 30;
      } else if (averageResponseTime > 500) {
        issues.push({
          severity: 'high',
          message: 'Slow response time',
          timestamp: new Date()
        });
        score -= 15;
      }

      return {
        pluginName: plugin.metadata.name,
        timestamp: new Date(),
        status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'unhealthy',
        score: Math.max(0, score),
        responseTime: averageResponseTime,
        issues,
        performance: {
          responseTime: averageResponseTime,
          errorRate: 0,
          throughput: 1000 / averageResponseTime
        },
        resources: {
          memory: 0,
          cpu: 0
        }
      };
    } catch (error) {
      return {
        pluginName: plugin.metadata.name,
        timestamp: new Date(),
        status: 'unhealthy',
        score: 0,
        responseTime: performance.now() - startTime,
        issues: [{
          severity: 'critical',
          message: `Performance check failed: ${error}`,
          timestamp: new Date()
        }],
        performance: {
          responseTime: performance.now() - startTime,
          errorRate: 100,
          throughput: 0
        },
        resources: {
          memory: 0,
          cpu: 0
        }
      };
    }
  }

  private async performDependencyHealthCheck(plugin: Plugin): Promise<HealthMetrics> {
    const pluginName = plugin.name || 'unknown';
    const basicResult = await this.performBasicHealthCheck(pluginName, plugin);
    const issues: HealthIssue[] = [];
    let score = 100;
    const metrics: Record<string, any> = {};

    if (typeof (plugin as any).checkDependencies === 'function') {
      try {
        const dependencyResults = await (plugin as any).checkDependencies();
        metrics.dependencies = dependencyResults;

        for (const [depName, depStatus] of Object.entries(dependencyResults)) {
          if (depStatus === 'failed' || depStatus === 'unhealthy') {
            issues.push({
              severity: 'critical',
              message: `Dependency ${depName} is failing`,
              timestamp: new Date()
            });
            score -= 20;
          } else if (depStatus === 'degraded') {
            issues.push({
              severity: 'medium',
              message: `Dependency ${depName} is degraded`,
              timestamp: new Date()
            });
            score -= 10;
          }
        }
      } catch (error) {
        issues.push({
          severity: 'high',
          message: `Dependency check failed: ${error}`,
          timestamp: new Date()
        });
        score -= 15;
      }
    } else {
      // No dependency checking available
      metrics.dependencyCheckAvailable = false;
    }

    return {
      ...basicResult,
      score: Math.max(0, score),
      issues: [...basicResult.issues, ...issues],
      dependencies: metrics.dependencies
    };
  }

  private async performCustomHealthCheck(plugin: Plugin, healthCheck: HealthCheck): Promise<HealthMetrics> {
    if (healthCheck.customCheck) {
      return await healthCheck.customCheck(plugin);
    }
    const pluginName = plugin.name || 'unknown';
    return await this.performBasicHealthCheck(pluginName, plugin);
  }

  private async collectMetrics(): Promise<void> {
    const now = new Date();
    
    for (const [pluginName, pluginData] of this.plugins) {
      try {
        const metrics = await this.gatherPluginHealthMetrics(pluginName, pluginData);
        pluginData.metrics.push(metrics);
        
        // Emit metrics collected event
        this.emit('metrics-collected', { pluginName, metrics });
      } catch (error) {
        this.context.apis.logger.error(`Failed to collect metrics for ${pluginName}: ${error}`);
      }
    }
  }

  private async gatherPluginHealthMetrics(pluginName: string, pluginData: PluginData): Promise<HealthMetrics> {
    const timestamp = new Date();
    const plugin = pluginData.plugin;

    // Get basic performance metrics
    const startTime = performance.now();
    const healthResult = await plugin.healthCheck();
    const responseTime = performance.now() - startTime;

    // Ensure all issues have timestamps
    const processedIssues = healthResult.issues?.map(issue => ({
      ...issue,
      timestamp: issue.timestamp || new Date()
    })) || [];

    return {
      pluginName,
      timestamp,
      status: healthResult.status,
      score: healthResult.score,
      responseTime,
      issues: processedIssues,
      performance: {
        responseTime,
        errorRate: this.calculateErrorRate(plugin),
        throughput: 1000 / responseTime
      },
      resources: await this.getResourceUsage(plugin)
    };
  }

  private calculateErrorRate(plugin: Plugin): number {
    if (typeof (plugin as any).getMetrics === 'function') {
      try {
        const metrics = (plugin as any).getMetrics();
        return metrics.errorRate || 0;
      } catch (error) {
        return 0;
      }
    }
    return 0;
  }

  private async getResourceUsage(plugin: Plugin): Promise<{ memory: number; cpu: number }> {
    if (typeof (plugin as any).getResourceUsage === 'function') {
      try {
        const resourceUsage = await (plugin as any).getResourceUsage();
        return {
          memory: resourceUsage.memory || 0,
          cpu: resourceUsage.cpu || 0
        };
      } catch (error) {
        return { memory: 0, cpu: 0 };
      }
    }
    return { memory: 0, cpu: 0 };
  }

  private checkHealthAlerts(pluginName: string, result: HealthMetrics, healthCheck: HealthCheck): void {
    const thresholds = this.healthThresholds.get(pluginName) || [];
    
    for (const threshold of thresholds) {
      const metricValue = this.extractMetricValue(result, threshold.metric);
      if (metricValue !== null && this.checkThreshold(metricValue, threshold)) {
        this.emit('health-alert', {
          pluginName,
          healthCheckName: healthCheck.name,
          alertType: threshold.critical ? 'critical' : 'warning',
          metric: threshold.metric,
          value: metricValue,
          threshold: threshold.critical || threshold.warning,
          timestamp: new Date()
        });
      }
    }

    // Check consecutive failures
    if (healthCheck.consecutiveFailures >= this.config.alertThresholds.consecutiveFailures) {
      this.emit('health-alert', {
        pluginName,
        healthCheckName: healthCheck.name,
        alertType: 'critical',
        message: `${healthCheck.consecutiveFailures} consecutive failures`,
        timestamp: new Date()
      });
    }
  }

  private extractMetricValue(metrics: HealthMetrics, metricPath: string): number | null {
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
    this.systemHealthHistory.push(systemSummary);
    this.systemHealthHistory = this.systemHealthHistory.slice(-this.config.maxHistoryPoints);

    this.emit('system-health-updated', systemSummary);
  }

  private async calculateHealthTrends(pluginName: string, metrics: HealthMetrics[]): Promise<HealthTrend[]> {
    const trends: HealthTrend[] = [];
    const recentMetrics = metrics.slice(-20); // Last 20 data points

    if (recentMetrics.length < 5) {
      return trends; // Not enough data for trend analysis
    }

    // Analyze response time trend
    const responseTimes = recentMetrics.map((m, i) => ({ timestamp: i, value: m.responseTime }));
    const responseTimeTrend = this.calculateTrend(responseTimes);
    trends.push({
      pluginName,
      metric: 'responseTime',
      trend: responseTimeTrend.trend,
      confidence: responseTimeTrend.confidence,
      prediction: responseTimeTrend.prediction,
      timestamp: new Date()
    });

    // Analyze error rate trend if available
    const errorRates = recentMetrics.map((m, i) => ({ timestamp: i, value: m.performance.errorRate }));
    if (errorRates.length >= 5) {
      const errorTrend = this.calculateTrend(errorRates);
      trends.push({
        pluginName,
        metric: 'errorRate',
        trend: errorTrend.trend,
        confidence: errorTrend.confidence,
        prediction: errorTrend.prediction,
        timestamp: new Date()
      });
    }

    return trends;
  }

  private calculateTrend(dataPoints: Array<{ timestamp: number; value: number }>): {
    trend: 'improving' | 'stable' | 'degrading' | 'critical';
    confidence: number;
    prediction: number;
  } {
    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, point, index) => sum + index, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
    const sumXY = dataPoints.reduce((sum, point, index) => sum + (index * point.value), 0);
    const sumXX = dataPoints.reduce((sum, point, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const meanY = sumY / n;
    const totalVariation = dataPoints.reduce((sum, point) => sum + (point.value - meanY) ** 2, 0);
    const explainedVariation = dataPoints.reduce((sum, point, index) => {
      const predictedY = slope * index + intercept;
      return sum + (predictedY - meanY) ** 2;
    }, 0);

    const confidence = totalVariation > 0 ? explainedVariation / totalVariation : 0;

    // Predict next value
    const prediction = slope * n + intercept;

    // Determine trend
    const slopeThreshold = 0.1;
    let trend: 'improving' | 'stable' | 'degrading' | 'critical';

    if (Math.abs(slope) < slopeThreshold) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = slope > slopeThreshold * 3 ? 'critical' : 'degrading';
    } else {
      trend = 'improving';
    }

    return {
      trend,
      confidence: Math.max(0, Math.min(1, confidence)),
      prediction
    };
  }

  private async generateSystemHealthSummary(): Promise<SystemHealthSummary> {
    const plugins = Array.from(this.plugins.values());
    const healthyCount = plugins.filter(p => p.lastHealthResult?.status === 'healthy').length;
    const degradedCount = plugins.filter(p => p.lastHealthResult?.status === 'degraded').length;
    const unhealthyCount = plugins.filter(p => p.lastHealthResult?.status === 'unhealthy').length;

    // Calculate overall system score
    const totalScore = plugins.reduce((sum, p) => sum + (p.lastHealthResult?.score ?? 0), 0);
    const averageScore = plugins.length > 0 ? totalScore / plugins.length : 0;

    // Get all trends
    const allTrends = Array.from(this.healthTrends.values()).flat();
    const allMetrics = plugins.flatMap(p => p.metrics);
    const recentMetrics = allMetrics.filter(m => Date.now() - m.timestamp.getTime() < 300000); // Last 5 minutes

    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'critical';
    if (unhealthyCount > 0 || averageScore < 50) {
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
      timestamp: new Date(),
      pluginCounts: {
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount,
        total: plugins.length
      },
      recommendations,
      trends: allTrends,
      recentMetrics
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private generateHealthRecommendations(plugins: PluginData[], trends: HealthTrend[]): string[] {
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
      const avgErrorRate = this.calculateAverage(recentMetrics.map(m => m.performance.errorRate));
      return avgErrorRate > 5; // 5% error rate
    });
    if (highErrorRatePlugins.length > 0) {
      recommendations.push(`Review error handling for ${highErrorRatePlugins.length} plugin(s) with high error rates`);
    }

    return recommendations;
  }

  // Setup methods
  private createDefaultHealthChecks(pluginName: string, manifest: PluginManifest, config: PluginConfig): HealthCheck[] {
    const checks: HealthCheck[] = [];

    // Basic health check
    checks.push({
      name: 'basic',
      type: 'basic',
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      lastRun: new Date(0),
      consecutiveFailures: 0
    });

    // Performance check for critical plugins
    if (config.priority && config.priority > 75) {
      checks.push({
        name: 'performance',
        type: 'performance',
        interval: 60000, // 1 minute
        timeout: 10000, // 10 seconds
        lastRun: new Date(0),
        consecutiveFailures: 0
      });
    }

    return checks;
  }

  private setupHealthThresholds(pluginName: string, config: PluginConfig): void {
    const thresholds: HealthThreshold[] = [
      {
        metric: 'responseTime',
        comparison: 'greater_than',
        warning: this.config.alertThresholds.responseTimeWarning,
        critical: this.config.alertThresholds.responseTimeCritical
      },
      {
        metric: 'performance.errorRate',
        comparison: 'greater_than',
        warning: 5, // 5%
        critical: 10 // 10%
      }
    ];

    // Add plugin-specific thresholds from config
    if ((config as any).healthThresholds) {
      thresholds.push(...(config as any).healthThresholds);
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
  async getPluginHealth(pluginName: string): Promise<HealthMetrics | null> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return null;
    
    return pluginData.lastHealthResult ?? null;
  }

  async getPluginHealthReport(pluginName: string): Promise<any> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return null;
    
    const recentMetrics = pluginData.metrics.slice(-10); // Last 10 metrics
    const trends = this.healthTrends.get(pluginName) ?? [];

    return {
      pluginName: pluginName,
      currentHealth: pluginData.lastHealthResult,
      recentMetrics,
      trends,
      healthChecks: pluginData.healthChecks.map(hc => ({
        name: hc.name,
        type: hc.type,
        lastRun: hc.lastRun,
        consecutiveFailures: hc.consecutiveFailures,
        lastResult: hc.lastResult
      })),
      recommendations: this.generatePluginRecommendations(pluginData)
    };
  }

  private generatePluginRecommendations(pluginData: PluginData): string[] {
    const recommendations: string[] = [];
    
    if (pluginData.lastHealthResult?.score && pluginData.lastHealthResult.score < 70) {
      recommendations.push('Plugin health score is below optimal threshold');
    }

    const failingChecks = pluginData.healthChecks.filter(hc => hc.consecutiveFailures > 0);
    if (failingChecks.length > 0) {
      recommendations.push(`${failingChecks.length} health check(s) are failing`);
    }

    const recentMetrics = pluginData.metrics.slice(-5);
    if (recentMetrics.length > 0) {
      const avgResponseTime = this.calculateAverage(recentMetrics.map(m => m.performance.responseTime));
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

  async runImmediateHealthCheck(pluginName: string, checkType?: string): Promise<HealthMetrics | null> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return null;
    
    const healthCheck = checkType
      ? pluginData.healthChecks.find(hc => hc.name === checkType || hc.type === checkType)
      : pluginData.healthChecks.find(hc => hc.type === 'basic');

    if (!healthCheck) return null;
    
    await this.runHealthCheck(pluginName, healthCheck);
    return pluginData.lastHealthResult ?? null;
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