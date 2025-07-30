/**
 * Plugin Health Monitor
 * Comprehensive health monitoring, metrics collection, and diagnostic system for plugins
 */

import { performance } from 'node:perf_hooks';

interface HealthMetrics {pluginName = new Map()

private
healthCheckInterval?: NodeJS.Timeout;
private
metricsCollectionInterval?: NodeJS.Timeout;
private
trendAnalysisInterval?: NodeJS.Timeout;

private
healthThresholds = new Map()
private
healthTrends = new Map()
private
systemHealthHistory = [];

private
readonly;
config = {};
)
{
  super();

  this.config = {enabled = this.createDefaultHealthChecks(pluginName, manifest, config);

  this.plugins.set(pluginName, {
      plugin,
      manifest,
      config,metrics = setInterval(() => {
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

private
async;
performScheduledHealthChecks();
: Promise<void>
{
    const now = new Date();

    for (let [pluginName, pluginData] of this.plugins) {
      for (const healthCheck of pluginData.healthChecks) {
        if (this.shouldRunHealthCheck(healthCheck, now)) {
          try {
            await this.runHealthCheck(pluginName, healthCheck);
          } catch (_error = now.getTime() - healthCheck.lastRun.getTime();
    return timeSinceLastRun >= healthCheck.interval;
  }

  private async runHealthCheck(pluginName = this.plugins.get(pluginName);
    if (!pluginData) return;

    const startTime = performance.now();
    let result = new Date();

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
        default = await this.performBasicHealthCheck(pluginData.plugin);
      }

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
        healthCheckName = {status = performance.now();
      const result = await plugin.healthCheck();
      const responseTime = performance.now() - startTime;

      // Enhance basic result with response time
      result.metrics = {
        ...result.metrics,
        responseTime,timestamp = await this.performBasicHealthCheck(plugin);
    
    // Add detailed checks
    const detailedIssues = [];
    const _detailedScore = basicResult.score;

    // Check resource usage
    if (typeof (plugin as any).getResourceUsage === 'function') {
      try {
        const resourceUsage = await (plugin as any).getResourceUsage();
        basicResult.metrics.resourceUsage = resourceUsage;

        // Check memory usage
        if (resourceUsage.allocated.memory > 500 * 1024 * 1024) { // 500MB
          detailedIssues.push({severity = 10;
        }
      } catch (_error) {
        // Resource usage check failed
      }
    }

    // Check API endpoints
    if (typeof (plugin as any).getRegisteredAPIs === 'function') {
      try {
        const apis = await (plugin as any).getRegisteredAPIs();
        basicResult.metrics.apiCount = apis.length;
        
        if (apis.length === 0) {
          detailedIssues.push({severity = 5;
        }
      } catch (_error) {
        // API check failed
      }
    }

    return {
      ...basicResult,score = performance.now();
    
    try {
      // Perform multiple operations to test performance
      const operations = [];
      for (let i = 0; i < 5; i++) {
        operations.push(plugin.healthCheck());
      }

      const totalTime = performance.now() - startTime;
      const averageResponseTime = totalTime / operations.length;

      const issues = [];
      const score = 100;

      // Evaluate performance
      if (averageResponseTime > 1000) { // 1 second
        issues.push({severity = 30;
      } else if (averageResponseTime > 500) {
        issues.push({severity = 15;
      }

      return {status = [];
    const _score = 100;
    const metrics = {timestamp = === 'function') {
      try {
        const dependencyResults = await (plugin as any).checkDependencies();
        metrics.dependencies = dependencyResults;

        for (const [_depName, depStatus] of Object.entries(dependencyResults)) {
          if (depStatus === 'failed' || depStatus === 'unhealthy') {
            issues.push({severity = 20;
          } else if (depStatus === 'degraded') {
            issues.push({severity = 10;
          }
        }
      } catch (_error = 15;
      }
    } else 
      // No dependency checking available
      metrics.dependencyCheckAvailable = false;

    return {status = new Date();

    for (const [pluginName, pluginData] of this.plugins) {
      try {
        const metrics = await this.gatherPluginHealthMetrics(pluginName, pluginData);
        pluginData.metrics.push(metrics);

        // Emit metrics collected event
        this.emit('metrics-collected', { pluginName, metrics });
      } catch (_error = new Date();

    // Get basic performance metrics

    return {
      pluginName,timestamp = === 'function') {
      try {
        const deps = await (plugin as any).checkDependencies();
        const failedChecks = Object.entries(deps)
          .filter(([, status]) => status === 'failed')
          .map(([name]) => name);

        return {status = === 0 ? 'healthy' : 'failing',
          failedChecks,latency = === 'function') {
      try {
        return await (plugin as any).getMetrics();
      } catch (error) 
        return {error = this.healthThresholds.get(pluginName) || [];

    for (const threshold of thresholds) {
      const metricValue = this.extractMetricValue(result.metrics, threshold.metric);
      if (metricValue !== null && this.checkThreshold(metricValue, threshold)) {
        this.emit('health-alert', {healthCheckName = threshold.critical ? 'critical' : 'warning',timestamp = 3) {
      this.emit('health-alert', {
        pluginName,healthCheckName = metricPath.split('.');
    let value = metrics;

    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }

    return typeof value === 'number' ?value = threshold.critical;
    
    switch (threshold.comparison) {
      case 'greater_than':
        return value > criticalValue;
      case 'less_than':
        return value < criticalValue;
      case 'equals':
        return value === criticalValue;
      case 'not_equals':
        return value !== criticalValue;default = await this.calculateHealthTrends(pluginName, pluginData.metrics);
      this.healthTrends.set(pluginName, trends);
      
      for (const trend of trends) {
        if (trend.trend === 'critical' || trend.trend === 'degrading') {
          this.emit('health-trend-alert', {
            pluginName,
            trend,timestamp = await this.generateSystemHealthSummary();
    this.systemHealthHistory.push({timestamp = this.systemHealthHistory.slice(-this.config.maxHistoryPoints);
    }

    this.emit('system-health-updated', systemSummary);
  }

  private async calculateHealthTrends(pluginName = [];
    const _recentMetrics = metrics.slice(-20); // Last 20 data points

    // Analyze response time trend
    const responseTimes = recentMetrics.map(_m => ({timestamp = 5) {
      const responseTimeTrend = this.calculateTrend(responseTimes);
      trends.push({
        pluginName,metric = recentMetrics.map(_m => ({timestamp = 5) {

      trends.push({
        pluginName,metric = dataPoints.length;
    const sumX = dataPoints.reduce((sum, _point, index) => sum + index, 0);
    const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
    const sumXY = dataPoints.reduce((sum, point, index) => sum + (index * point.value), 0);
    const sumXX = dataPoints.reduce((sum, _point, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const meanY = sumY / n;
    const _totalVariation = dataPoints.reduce((sum, point) => sum + (point.value - meanY) ** 2, 0);
    const _explainedVariation = dataPoints.reduce((sum, _point, index) => {
      const predictedY = slope * index + intercept;
      return sum + (predictedY - meanY) ** 2;
    }, 0);

    // Predict next value

    // Determine trend
    let trend = 0.1;
    
    if (Math.abs(slope) < slopeThreshold) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = slope > slopeThreshold * 3 ? 'critical' : 'degrading';
    } else {
      trend = 'improving';
    }

    return {
      trend,confidence = Array.from(this.plugins.values());

    const _degradedCount = plugins.filter(p => p.lastHealthResult?.status === 'degraded').length;

    // Calculate overall system score
    const totalScore = plugins.reduce((sum, p) => sum + (p.lastHealthResult?.score || 0), 0);
    const _averageScore = plugins.length > 0 ? totalScore / plugins.length = plugins.flatMap(p => p.metrics);
    const recentMetrics = allMetrics.filter(m => Date.now() - m.timestamp.getTime() < 300000); // Last 5 minutes

    // Determine overall status
    const _overall = 'critical';
    } else if (degradedCount > 0 || averageScore < 70) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    // Generate recommendations
    const _recommendations = this.generateHealthRecommendations(plugins, allTrends);

    return {
      overall,score = === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private generateHealthRecommendations(plugins = [];

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
      const avgErrorRate = this.calculateAverage(recentMetrics.map((m) => m.performance.errorRate));
      return avgErrorRate > 5; // 5% error rate
    });

    if (highErrorRatePlugins.length > 0) {
      recommendations.push(`Review error handling for ${highErrorRatePlugins.length} plugin(s) with high error rates`);
    }

    return recommendations;
  }

  // Setup methods
  private createDefaultHealthChecks(pluginName = [];

    // Basic health check
    checks.push({name = [
      {metric = [...(this.healthThresholds.get(pluginName) || [])];

    // Add plugin-specific thresholds from config
    if (config.healthThresholds) {
      thresholds.push(...config.healthThresholds);
    }

    this.healthThresholds.set(pluginName, thresholds);
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    for (const [_pluginName, pluginData] of this.plugins) {
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
  async getPluginHealth(pluginName = this.plugins.get(pluginName);
    if (!pluginData) return null;

    return pluginData.lastHealthResult || null;
  }

  async getPluginHealthReport(pluginName = this.plugins.get(pluginName);
    if (!pluginData) return null;

    const recentMetrics = pluginData.metrics.slice(-10); // Last 10 metrics
    const trends = this.healthTrends.get(pluginName) || [];

    return {
      pluginName,currentHealth = > ({name = [];

    if (pluginData.lastHealthResult?.score < 70) {
      recommendations.push('Plugin health score is below optimal threshold');
    }

    const failingChecks = pluginData.healthChecks.filter((hc) => hc.consecutiveFailures > 0);
    if (failingChecks.length > 0) {
      recommendations.push(`${failingChecks.length} health check(s) are failing`);
    }

    const recentMetrics = pluginData.metrics.slice(-5);
    if (recentMetrics.length > 0) {
      const avgResponseTime = this.calculateAverage(recentMetrics.map((m) => m.performance.responseTime));
      if (avgResponseTime > 500) {
        recommendations.push('Consider optimizing plugin response time');
      }
    }

    return recommendations;
  }

  async getSystemHealth(): Promise<SystemHealthSummary> {
    return await this.generateSystemHealthSummary();
  }

  getPluginMetrics(pluginName = this.plugins.get(pluginName);
    if (!pluginData) return [];

    const metrics = pluginData.metrics;
    return limit ? metrics.slice(-limit) : metrics;
  }

  async runImmediateHealthCheck(pluginName = this.plugins.get(pluginName);
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
