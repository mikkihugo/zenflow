/**
 * Plugin Resource Monitor
 * Real-time monitoring and enforcement of plugin resource usage limits
 */

import { PerformanceObserver } from 'node:perf_hooks';
import { cpuUsage, memoryUsage } from 'node:process';

interface ResourceMetrics {pluginName = new Map()

private
monitoringInterval?: NodeJS.Timeout;
private
performanceObserver?: PerformanceObserver;
private
networkCounters = new Map()
private
diskCounters = new Map()

private
readonly;
config = {};
)
{
  super();

  this.config = {enabled = config.resourceLimits ? this.parseResourceLimits(config.resourceLimits) : [];

  this.plugins.set(pluginName, {
      manifest,
      config,
      worker,
      limits,metrics = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);

  // Set up performance monitoring
  this.performanceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    for (const entry of entries) {
      this.processPerformanceEntry(entry);
    }
  });

  this.performanceObserver.observe({ entryTypes => {
      this.cleanupOldMetrics();
}
, 300000) // Every 5 minutes
}

  private async collectMetrics(): Promise<void>
{
  for (const [pluginName, pluginData] of this.plugins) {
    try {
        const metrics = await this.gatherPluginMetrics(pluginName, pluginData);
        
        // Store metrics
        pluginData.metrics.push(metrics);
        
        // Check for alerts
        await this.checkResourceAlerts(pluginName, metrics, pluginData.limits);
        
        this.emit('metrics-collected', { pluginName, metrics });
      } catch (_error
    = new Date()

    // Get memory usage
    const memUsage = memoryUsage();

    // Get CPU usage
    const _cpuData = cpuUsage();

    // Get disk I/O (estimated)

    return {
      pluginName,
      timestamp,memory = config.resourceLimits?.memory || 512;
    const limitBytes = limitMB * 1024 * 1024;
    return (memUsage.heapUsed / limitBytes) * 100;
  }

  private
  calculateCpuPercentage(cpuData = cpuData.user + cpuData.system;
  return Math.min(100, (totalCpu / 1000000) * 100); // Convert to percentage
}

private
async;
getWorkerHandles(worker = this.plugins.get(pluginName);
if (!pluginData) return;

// Check memory alerts
await this.checkMemoryAlert(pluginName, metrics.memory, pluginData);

// Check CPU alerts
await this.checkCpuAlert(pluginName, metrics.cpu, pluginData);

// Check disk alerts
await this.checkDiskAlert(pluginName, metrics.disk, pluginData);

// Check network alerts
await this.checkNetworkAlert(pluginName, metrics.network, pluginData);

// Check handle alerts
await this.checkHandleAlert(pluginName, metrics.handles, pluginData);
}

  private async checkMemoryAlert(pluginName = this.config.alertThresholds.memory

if (memory.percentage >= critical) {
  await this.createAlert(pluginData, {alertType = warning) {
      await this.createAlert(pluginData, {
        pluginName,alertType = this.config.alertThresholds.cpu;

  if (cpu.percentage >= critical) {
    await this.createAlert(pluginData, {alertType = warning) {
      await this.createAlert(pluginData, {
        pluginName,alertType = (disk.bytesRead + disk.bytesWritten) / 1024 / 1024;
    const { warning, critical } = this.config.alertThresholds.disk;

    if (diskRateMBps >= critical) {
      await this.createAlert(pluginData, {alertType = warning) {
      await this.createAlert(pluginData, {
        pluginName,alertType = network.requests; // Simplified calculation
      const { warning, critical } = this.config.alertThresholds.network;

      if (requestsPerMinute >= critical) {
        await this.createAlert(pluginData, {alertType = warning) {
      await this.createAlert(pluginData, {
        pluginName,alertType = (handles.open / handles.limit) * 100;

        if (percentage >= 90) {
          await this.createAlert(pluginData, {alertType = 75) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType = {id = pluginData.alerts.slice(-this.config.maxAlerts);
        }

        this.emit('resource-alert', alert);

        // Consider enforcement action for critical alerts
        if (alert.alertType === 'critical' && this.config.enforcementEnabled) {
          await this.considerEnforcement(alert, pluginData);
        }
      }

      // Resource enforcement
      private
      async;
      considerEnforcement(alert = Date.now() - pluginData.lastEnforcement.executedAt.getTime();
      if (timeSinceLastEnforcement < this.config.gracePeriod) {
        return; // Still in grace period
      }
    }

    // Determine enforcement action
    let action = 'throttle';

    if (alert.percentage > 150) {
      action = 'terminate';
    } else if (alert.percentage > 120) {
      action = 'suspend';
    } else if (alert.percentage > 100) {
      action = 'quarantine';
    }

    const enforcement = {action = await this.executeEnforcement(alert.pluginName, enforcement);
    enforcement.successful = success;
    pluginData.lastEnforcement = enforcement;

    this.emit('resource-enforcement', enforcement);
  }
  catch (error = this.plugins.get(pluginName)
  if (!pluginData) return false;

  switch (enforcement.action) {
    case 'throttle':
      return await this.throttlePlugin(pluginName, pluginData);

    case 'suspend':
      return await this.suspendPlugin(pluginName, pluginData);

    case 'terminate':
      return await this.terminatePlugin(pluginName, pluginData);

    case 'quarantine':
      return await this.quarantinePlugin(pluginName, pluginData);
    default = [];

    if (resourceLimits.memory) {
      limits.push({resource = Date.now() - this.config.retentionPeriod;

    for (const [_pluginName, pluginData] of this.plugins) {
      // Clean up old metrics
      pluginData.metrics = pluginData.metrics.filter(
        metric => metric.timestamp.getTime() > cutoffTime
      );

      // Clean up old alerts (but keep unacknowledged ones)
      pluginData.alerts = pluginData.alerts.filter(
        alert => !alert.acknowledged || alert.timestamp.getTime() > cutoffTime
      );
    }
  }

  // Public API methods
  getResourceUsage(pluginName = this.plugins.get(pluginName);
    if (!pluginData || pluginData.metrics.length === 0) {
      return null;
    }

    return {allocated = this.plugins.get(pluginName);
    if (!pluginData) return [];

    const metrics = pluginData.metrics;
    return limit ? metrics.slice(-limit) : metrics;
  }

  getActiveAlerts(pluginName?: string)
  : ResourceAlert[]
  {
    if (pluginName) {
      const pluginData = this.plugins.get(pluginName);
      return pluginData ? pluginData.alerts.filter(alert => !alert.acknowledged) : [];
    }

    const allAlerts = [];
    for (const [, pluginData] of this.plugins) {
      allAlerts.push(...pluginData.alerts.filter((alert) => !alert.acknowledged));
    }

    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  acknowledgeAlert(alertId = pluginData.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    this.emit('alert-acknowledged', alert);
    return true;
  }
}
return false;
}

  getSystemResourceSummary():
{
  totalPlugins = 0;
  let _totalCpu = 0;
  let _totalNetwork = 0;
  let _activeAlerts = 0;
  let _criticalAlerts = 0;
  let _pluginCount = 0;

  for (const [, pluginData] of this.plugins) {
    if (pluginData.metrics.length > 0) {
      const latest = pluginData.metrics[pluginData.metrics.length - 1];
      totalMemory += latest.memory.heapUsed;
      _totalCpu += latest.cpu.percentage;
      _totalNetwork += latest.network.requests;
      _pluginCount++;
    }

    const unacknowledgedAlerts = pluginData.alerts.filter((a) => !a.acknowledged);
    _activeAlerts += unacknowledgedAlerts.length;
    _criticalAlerts += unacknowledgedAlerts.filter((a) => a.alertType === 'critical').length;
  }

  return {totalPlugins = this.networkCounters.get(pluginName);
  if (counter) {
    counter.requests++;
    counter.bytesIn += bytesIn;
    counter.bytesOut += bytesOut;
  }
}

recordDiskOperation(pluginName = this.diskCounters.get(pluginName);
if (counter) {
  if (operation === 'read') {
    counter.reads++;
    counter.bytesRead += bytes;
  } else {
    counter.writes++;
    counter.bytesWritten += bytes;
  }
}
}

  async cleanup(): Promise<void>
{
  if (this.monitoringInterval) {
    clearInterval(this.monitoringInterval);
    this.monitoringInterval = undefined;
  }

  if (this.performanceObserver) {
    this.performanceObserver.disconnect();
    this.performanceObserver = undefined;
  }

  this.plugins.clear();
  this.networkCounters.clear();
  this.diskCounters.clear();
}
}

export default ResourceMonitor;
