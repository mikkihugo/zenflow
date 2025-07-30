/**
 * Plugin Resource Monitor
 * Real-time monitoring and enforcement of plugin resource usage limits
 */

import { EventEmitter } from 'events';
import { performance, PerformanceObserver } from 'perf_hooks';
import { cpuUsage, memoryUsage } from 'process';
import { Worker } from 'worker_threads';
import {
  Plugin,
  PluginManifest,
  PluginConfig,
  ResourceUsage,
  ResourceLimit,
  JSONObject
} from '../types/plugin.js';

interface ResourceMetrics {
  pluginName: string;
  timestamp: Date;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    percentage: number;
  };
  cpu: {
    user: number;
    system: number;
    percentage: number;
  };
  disk: {
    reads: number;
    writes: number;
    bytesRead: number;
    bytesWritten: number;
  };
  network: {
    requests: number;
    bytesIn: number;
    bytesOut: number;
    connectionsActive: number;
  };
  handles: {
    open: number;
    limit: number;
  };
  performance: {
    operationsPerSecond: number;
    averageLatency: number;
    errorRate: number;
  };
}

interface ResourceAlert {
  id: string;
  pluginName: string;
  alertType: 'warning' | 'critical' | 'limit_exceeded';
  resource: 'memory' | 'cpu' | 'disk' | 'network' | 'handles';
  currentValue: number;
  limitValue: number;
  percentage: number;
  timestamp: Date;
  message: string;
  acknowledged: boolean;
}

interface ResourceEnforcement {
  action: 'throttle' | 'suspend' | 'terminate' | 'quarantine';
  reason: string;
  triggeredBy: ResourceAlert;
  executedAt: Date;
  successful: boolean;
}

interface MonitoringConfig {
  enabled: boolean;
  interval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  alertThresholds: {
    memory: { warning: number; critical: number }; // percentage
    cpu: { warning: number; critical: number }; // percentage
    disk: { warning: number; critical: number }; // MB/s
    network: { warning: number; critical: number }; // requests/minute
  };
  enforcementEnabled: boolean;
  maxAlerts: number;
  gracePeriod: number; // milliseconds before enforcement
}

export class ResourceMonitor extends EventEmitter {
  private plugins: Map<string, {
    manifest: PluginManifest;
    config: PluginConfig;
    worker?: Worker;
    limits: ResourceLimit[];
    metrics: ResourceMetrics[];
    alerts: ResourceAlert[];
    lastEnforcement?: ResourceEnforcement;
  }> = new Map();

  private monitoringInterval?: NodeJS.Timeout;
  private performanceObserver?: PerformanceObserver;
  private networkCounters: Map<string, { requests: number; bytesIn: number; bytesOut: number }> = new Map();
  private diskCounters: Map<string, { reads: number; writes: number; bytesRead: number; bytesWritten: number }> = new Map();

  private readonly config: MonitoringConfig;

  constructor(config: Partial<MonitoringConfig> = {}) {
    super();

    this.config = {
      enabled: true,
      interval: 5000, // 5 seconds
      retentionPeriod: 3600000, // 1 hour
      alertThresholds: {
        memory: { warning: 75, critical: 90 },
        cpu: { warning: 70, critical: 85 },
        disk: { warning: 50, critical: 100 }, // MB/s
        network: { warning: 1000, critical: 2000 } // requests/minute
      },
      enforcementEnabled: true,
      maxAlerts: 100,
      gracePeriod: 30000, // 30 seconds
      ...config
    };

    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  // Plugin registration for monitoring
  registerPlugin(
    pluginName: string,
    manifest: PluginManifest,
    config: PluginConfig,
    worker?: Worker
  ): void {
    const limits = config.resourceLimits ? this.parseResourceLimits(config.resourceLimits) : [];

    this.plugins.set(pluginName, {
      manifest,
      config,
      worker,
      limits,
      metrics: [],
      alerts: []
    });

    // Initialize counters
    this.networkCounters.set(pluginName, { requests: 0, bytesIn: 0, bytesOut: 0 });
    this.diskCounters.set(pluginName, { reads: 0, writes: 0, bytesRead: 0, bytesWritten: 0 });

    this.emit('plugin-registered', { pluginName, limits });
  }

  unregisterPlugin(pluginName: string): void {
    this.plugins.delete(pluginName);
    this.networkCounters.delete(pluginName);
    this.diskCounters.delete(pluginName);
    this.emit('plugin-unregistered', { pluginName });
  }

  // Resource monitoring
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);

    // Set up performance monitoring
    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        this.processPerformanceEntry(entry);
      }
    });

    this.performanceObserver.observe({ entryTypes: ['measure', 'mark'] });

    // Cleanup old metrics periodically
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000); // Every 5 minutes
  }

  private async collectMetrics(): Promise<void> {
    for (const [pluginName, pluginData] of this.plugins) {
      try {
        const metrics = await this.gatherPluginMetrics(pluginName, pluginData);
        
        // Store metrics
        pluginData.metrics.push(metrics);
        
        // Check for alerts
        await this.checkResourceAlerts(pluginName, metrics, pluginData.limits);
        
        this.emit('metrics-collected', { pluginName, metrics });
      } catch (error: any) {
        this.emit('monitoring-error', { pluginName, error: error.message });
      }
    }
  }

  private async gatherPluginMetrics(
    pluginName: string,
    pluginData: { worker?: Worker; config: PluginConfig }
  ): Promise<ResourceMetrics> {
    const timestamp = new Date();
    
    // Get memory usage
    const memUsage = memoryUsage();
    const memoryPercentage = this.calculateMemoryPercentage(memUsage, pluginData.config);

    // Get CPU usage
    const cpuData = cpuUsage();
    const cpuPercentage = this.calculateCpuPercentage(cpuData, pluginName);

    // Get disk I/O (estimated)
    const diskData = this.diskCounters.get(pluginName) || { reads: 0, writes: 0, bytesRead: 0, bytesWritten: 0 };

    // Get network usage
    const networkData = this.networkCounters.get(pluginName) || { requests: 0, bytesIn: 0, bytesOut: 0 };

    // Get handle count (if worker exists)
    const handles = pluginData.worker ? await this.getWorkerHandles(pluginData.worker) : { open: 0, limit: 1000 };

    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(pluginName);

    return {
      pluginName,
      timestamp,
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        percentage: memoryPercentage
      },
      cpu: {
        user: cpuData.user,
        system: cpuData.system,
        percentage: cpuPercentage
      },
      disk: {
        reads: diskData.reads,
        writes: diskData.writes,
        bytesRead: diskData.bytesRead,
        bytesWritten: diskData.bytesWritten
      },
      network: {
        requests: networkData.requests,
        bytesIn: networkData.bytesIn,
        bytesOut: networkData.bytesOut,
        connectionsActive: 0 // Would need more sophisticated tracking
      },
      handles,
      performance
    };
  }

  private calculateMemoryPercentage(memUsage: any, config: PluginConfig): number {
    const limitMB = config.resourceLimits?.memory || 512;
    const limitBytes = limitMB * 1024 * 1024;
    return (memUsage.heapUsed / limitBytes) * 100;
  }

  private calculateCpuPercentage(cpuData: any, pluginName: string): number {
    // This is a simplified CPU calculation
    // In a real implementation, you'd track CPU usage over time
    const totalCpu = cpuData.user + cpuData.system;
    return Math.min(100, (totalCpu / 1000000) * 100); // Convert to percentage
  }

  private async getWorkerHandles(worker: Worker): Promise<{ open: number; limit: number }> {
    // This would require platform-specific implementation
    // For now, return estimated values
    return { open: 10, limit: 1000 };
  }

  private calculatePerformanceMetrics(pluginName: string): {
    operationsPerSecond: number;
    averageLatency: number;
    errorRate: number;
  } {
    // This would track actual operation metrics
    // For now, return default values
    return {
      operationsPerSecond: 0,
      averageLatency: 0,
      errorRate: 0
    };
  }

  // Alert system
  private async checkResourceAlerts(
    pluginName: string,
    metrics: ResourceMetrics,
    limits: ResourceLimit[]
  ): Promise<void> {
    const pluginData = this.plugins.get(pluginName);
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

  private async checkMemoryAlert(
    pluginName: string,
    memory: ResourceMetrics['memory'],
    pluginData: any
  ): Promise<void> {
    const { warning, critical } = this.config.alertThresholds.memory;

    if (memory.percentage >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resource: 'memory',
        currentValue: memory.percentage,
        limitValue: critical,
        percentage: memory.percentage,
        message: `Memory usage critical: ${memory.percentage.toFixed(1)}% (${(memory.heapUsed / 1024 / 1024).toFixed(1)}MB)`
      });
    } else if (memory.percentage >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resource: 'memory',
        currentValue: memory.percentage,
        limitValue: warning,
        percentage: memory.percentage,
        message: `Memory usage warning: ${memory.percentage.toFixed(1)}% (${(memory.heapUsed / 1024 / 1024).toFixed(1)}MB)`
      });
    }
  }

  private async checkCpuAlert(
    pluginName: string,
    cpu: ResourceMetrics['cpu'],
    pluginData: any
  ): Promise<void> {
    const { warning, critical } = this.config.alertThresholds.cpu;

    if (cpu.percentage >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resource: 'cpu',
        currentValue: cpu.percentage,
        limitValue: critical,
        percentage: cpu.percentage,
        message: `CPU usage critical: ${cpu.percentage.toFixed(1)}%`
      });
    } else if (cpu.percentage >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resource: 'cpu',
        currentValue: cpu.percentage,
        limitValue: warning,
        percentage: cpu.percentage,
        message: `CPU usage warning: ${cpu.percentage.toFixed(1)}%`
      });
    }
  }

  private async checkDiskAlert(
    pluginName: string,
    disk: ResourceMetrics['disk'],
    pluginData: any
  ): Promise<void> {
    const diskRateMBps = (disk.bytesRead + disk.bytesWritten) / 1024 / 1024;
    const { warning, critical } = this.config.alertThresholds.disk;

    if (diskRateMBps >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resource: 'disk',
        currentValue: diskRateMBps,
        limitValue: critical,
        percentage: (diskRateMBps / critical) * 100,
        message: `Disk I/O critical: ${diskRateMBps.toFixed(1)} MB/s`
      });
    } else if (diskRateMBps >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resource: 'disk',
        currentValue: diskRateMBps,
        limitValue: warning,
        percentage: (diskRateMBps / warning) * 100,
        message: `Disk I/O warning: ${diskRateMBps.toFixed(1)} MB/s`
      });
    }
  }

  private async checkNetworkAlert(
    pluginName: string,
    network: ResourceMetrics['network'],
    pluginData: any
  ): Promise<void> {
    const requestsPerMinute = network.requests; // Simplified calculation
    const { warning, critical } = this.config.alertThresholds.network;

    if (requestsPerMinute >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resource: 'network',
        currentValue: requestsPerMinute,
        limitValue: critical,
        percentage: (requestsPerMinute / critical) * 100,
        message: `Network usage critical: ${requestsPerMinute} requests/min`
      });
    } else if (requestsPerMinute >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resource: 'network',
        currentValue: requestsPerMinute,
        limitValue: warning,
        percentage: (requestsPerMinute / warning) * 100,
        message: `Network usage warning: ${requestsPerMinute} requests/min`
      });
    }
  }

  private async checkHandleAlert(
    pluginName: string,
    handles: ResourceMetrics['handles'],
    pluginData: any
  ): Promise<void> {
    const percentage = (handles.open / handles.limit) * 100;

    if (percentage >= 90) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resource: 'handles',
        currentValue: handles.open,
        limitValue: handles.limit,
        percentage,
        message: `Handle usage critical: ${handles.open}/${handles.limit} (${percentage.toFixed(1)}%)`
      });
    } else if (percentage >= 75) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resource: 'handles',
        currentValue: handles.open,
        limitValue: handles.limit,
        percentage,
        message: `Handle usage warning: ${handles.open}/${handles.limit} (${percentage.toFixed(1)}%)`
      });
    }
  }

  private async createAlert(
    pluginData: any,
    alertData: Omit<ResourceAlert, 'id' | 'timestamp' | 'acknowledged'>
  ): Promise<void> {
    const alert: ResourceAlert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      acknowledged: false,
      ...alertData
    };

    pluginData.alerts.push(alert);

    // Enforce max alerts limit
    if (pluginData.alerts.length > this.config.maxAlerts) {
      pluginData.alerts = pluginData.alerts.slice(-this.config.maxAlerts);
    }

    this.emit('resource-alert', alert);

    // Consider enforcement action for critical alerts
    if (alert.alertType === 'critical' && this.config.enforcementEnabled) {
      await this.considerEnforcement(alert, pluginData);
    }
  }

  // Resource enforcement
  private async considerEnforcement(alert: ResourceAlert, pluginData: any): Promise<void> {
    // Check if we're still in grace period
    if (pluginData.lastEnforcement) {
      const timeSinceLastEnforcement = Date.now() - pluginData.lastEnforcement.executedAt.getTime();
      if (timeSinceLastEnforcement < this.config.gracePeriod) {
        return; // Still in grace period
      }
    }

    // Determine enforcement action
    let action: ResourceEnforcement['action'] = 'throttle';
    
    if (alert.percentage > 150) {
      action = 'terminate';
    } else if (alert.percentage > 120) {
      action = 'suspend';
    } else if (alert.percentage > 100) {
      action = 'quarantine';
    }

    const enforcement: ResourceEnforcement = {
      action,
      reason: `Resource limit exceeded: ${alert.message}`,
      triggeredBy: alert,
      executedAt: new Date(),
      successful: false
    };

    try {
      const success = await this.executeEnforcement(alert.pluginName, enforcement);
      enforcement.successful = success;
      pluginData.lastEnforcement = enforcement;

      this.emit('resource-enforcement', enforcement);
    } catch (error: any) {
      this.emit('enforcement-error', { 
        pluginName: alert.pluginName, 
        action, 
        error: error.message 
      });
    }
  }

  private async executeEnforcement(
    pluginName: string,
    enforcement: ResourceEnforcement
  ): Promise<boolean> {
    const pluginData = this.plugins.get(pluginName);
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
      
      default:
        return false;
    }
  }

  private async throttlePlugin(pluginName: string, pluginData: any): Promise<boolean> {
    // Implement throttling logic (e.g., delay operations)
    this.emit('plugin-throttled', { pluginName });
    return true;
  }

  private async suspendPlugin(pluginName: string, pluginData: any): Promise<boolean> {
    // Suspend plugin operations temporarily
    if (pluginData.worker) {
      // Send suspension signal to worker
      pluginData.worker.postMessage({ type: 'suspend' });
    }
    this.emit('plugin-suspended', { pluginName });
    return true;
  }

  private async terminatePlugin(pluginName: string, pluginData: any): Promise<boolean> {
    // Terminate the plugin worker
    if (pluginData.worker) {
      await pluginData.worker.terminate();
    }
    this.emit('plugin-terminated', { pluginName });
    return true;
  }

  private async quarantinePlugin(pluginName: string, pluginData: any): Promise<boolean> {
    // Move plugin to quarantine (disable but keep monitoring)
    this.emit('plugin-quarantined', { pluginName });
    return true;
  }

  // Utility methods
  private parseResourceLimits(resourceLimits: any): ResourceLimit[] {
    const limits: ResourceLimit[] = [];

    if (resourceLimits.memory) {
      limits.push({
        resource: 'memory',
        limit: resourceLimits.memory,
        unit: 'MB',
        enforcement: 'hard'
      });
    }

    if (resourceLimits.cpu) {
      limits.push({
        resource: 'cpu',
        limit: resourceLimits.cpu,
        unit: '%',
        enforcement: 'soft'
      });
    }

    if (resourceLimits.network) {
      limits.push({
        resource: 'network',
        limit: resourceLimits.network.requestsPerMinute || 100,
        unit: 'requests/minute',
        enforcement: 'soft'
      });
    }

    return limits;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private processPerformanceEntry(entry: any): void {
    // Process performance entries for metrics
    // This would be expanded based on specific performance requirements
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    for (const [pluginName, pluginData] of this.plugins) {
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
  getResourceUsage(pluginName: string): ResourceUsage | null {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData || pluginData.metrics.length === 0) {
      return null;
    }

    const latestMetrics = pluginData.metrics[pluginData.metrics.length - 1];
    
    return {
      allocated: {
        memory: latestMetrics.memory.heapUsed,
        cpu: latestMetrics.cpu.percentage,
        disk: latestMetrics.disk.bytesRead + latestMetrics.disk.bytesWritten,
        network: latestMetrics.network.bytesIn + latestMetrics.network.bytesOut,
        handles: latestMetrics.handles.open,
        timestamp: latestMetrics.timestamp
      },
      limits: pluginData.limits,
      monitoring: true
    };
  }

  getPluginMetrics(pluginName: string, limit?: number): ResourceMetrics[] {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return [];

    const metrics = pluginData.metrics;
    return limit ? metrics.slice(-limit) : metrics;
  }

  getActiveAlerts(pluginName?: string): ResourceAlert[] {
    if (pluginName) {
      const pluginData = this.plugins.get(pluginName);
      return pluginData ? pluginData.alerts.filter(alert => !alert.acknowledged) : [];
    }

    const allAlerts: ResourceAlert[] = [];
    for (const [, pluginData] of this.plugins) {
      allAlerts.push(...pluginData.alerts.filter(alert => !alert.acknowledged));
    }

    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  acknowledgeAlert(alertId: string): boolean {
    for (const [, pluginData] of this.plugins) {
      const alert = pluginData.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        this.emit('alert-acknowledged', alert);
        return true;
      }
    }
    return false;
  }

  getSystemResourceSummary(): {
    totalPlugins: number;
    activeAlerts: number;
    criticalAlerts: number;
    totalMemoryUsage: number;
    averageCpuUsage: number;
    totalNetworkRequests: number;
  } {
    let totalMemory = 0;
    let totalCpu = 0;
    let totalNetwork = 0;
    let activeAlerts = 0;
    let criticalAlerts = 0;
    let pluginCount = 0;

    for (const [, pluginData] of this.plugins) {
      if (pluginData.metrics.length > 0) {
        const latest = pluginData.metrics[pluginData.metrics.length - 1];
        totalMemory += latest.memory.heapUsed;
        totalCpu += latest.cpu.percentage;
        totalNetwork += latest.network.requests;
        pluginCount++;
      }

      const unacknowledgedAlerts = pluginData.alerts.filter(a => !a.acknowledged);
      activeAlerts += unacknowledgedAlerts.length;
      criticalAlerts += unacknowledgedAlerts.filter(a => a.alertType === 'critical').length;
    }

    return {
      totalPlugins: this.plugins.size,
      activeAlerts,
      criticalAlerts,
      totalMemoryUsage: totalMemory,
      averageCpuUsage: pluginCount > 0 ? totalCpu / pluginCount : 0,
      totalNetworkRequests: totalNetwork
    };
  }

  // Network and disk tracking methods (called by plugins)
  recordNetworkRequest(pluginName: string, bytesIn: number, bytesOut: number): void {
    const counter = this.networkCounters.get(pluginName);
    if (counter) {
      counter.requests++;
      counter.bytesIn += bytesIn;
      counter.bytesOut += bytesOut;
    }
  }

  recordDiskOperation(pluginName: string, operation: 'read' | 'write', bytes: number): void {
    const counter = this.diskCounters.get(pluginName);
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

  async cleanup(): Promise<void> {
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