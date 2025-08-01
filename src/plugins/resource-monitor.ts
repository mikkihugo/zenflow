/**
 * Resource Monitor Plugin
 * Real-time monitoring and enforcement of plugin resource usage limits
 */

import { PerformanceObserver } from 'node:perf_hooks';
import { cpuUsage, memoryUsage } from 'node:process';
import { EventEmitter } from 'node:events';

export interface ResourceMetrics {
  pluginName: string;
  timestamp: Date;
  memory: {
    heapUsed: number;
    heapTotal: number;
    percentage: number;
  };
  cpu: {
    user: number;
    system: number;
    percentage: number;
  };
  disk: {
    bytesRead: number;
    bytesWritten: number;
    operations: number;
  };
  network: {
    requests: number;
    bytesIn: number;
    bytesOut: number;
  };
  handles: {
    open: number;
    limit: number;
  };
}

export interface ResourceAlert {
  id: string;
  pluginName: string;
  alertType: 'warning' | 'critical';
  resourceType: 'memory' | 'cpu' | 'disk' | 'network' | 'handles';
  threshold: number;
  currentValue: number;
  percentage: number;
  timestamp: Date;
  acknowledged: boolean;
  message: string;
}

export interface ResourceLimits {
  memory: number; // MB
  cpu: number; // percentage
  disk: number; // MB/s
  network: number; // requests/minute
  handles: number; // max open handles
}

export interface EnforcementAction {
  id: string;
  pluginName: string;
  action: 'throttle' | 'suspend' | 'terminate' | 'quarantine';
  reason: string;
  timestamp: Date;
  executedAt: Date;
  successful: boolean;
}

// Basic plugin interfaces
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  type: string;
  dependencies: {
    system: string[];
    plugins: Record<string, string>;
  };
  configuration: {
    required: string[];
  };
}

export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, unknown>;
  resourceLimits?: {
    memory?: number;
    cpu?: number;
    disk?: number;
    network?: number;
    handles?: number;
  };
}

export interface PluginContext {
  logger: {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, error?: unknown): void;
  };
  resources: {
    limits: Array<{
      type: string;
      maximum: number;
      recommended: number;
    }>;
  };
  apis: {
    logger: {
      info(message: string): void;
    };
  };
}

// Base Plugin class
export abstract class BasePlugin extends EventEmitter {
  protected state: string = 'uninitialized';
  protected metadata: {
    status: string;
    errorCount: number;
    lastActivity: Date;
  } = {
    status: 'loaded',
    errorCount: 0,
    lastActivity: new Date()
  };

  constructor(
    protected manifest: PluginManifest,
    protected config: PluginConfig,
    protected context: PluginContext
  ) {
    super();
  }

  abstract onInitialize(): Promise<void>;
  abstract onStart(): Promise<void>;
  abstract onStop(): Promise<void>;
  abstract onDestroy(): Promise<void>;

  protected setState(state: string): void {
    this.state = state;
  }

  protected updateLastActivity(): void {
    this.metadata.lastActivity = new Date();
  }
}

export interface ResourceMonitorConfig extends PluginConfig {
  enabled: boolean;
  interval: number; // monitoring interval in ms
  retentionPeriod: number; // how long to keep metrics (ms)
  maxAlerts: number; // max alerts per plugin
  enforcementEnabled: boolean;
  gracePeriod: number; // time between enforcement actions (ms)
  alertThresholds: {
    memory: { warning: number; critical: number }; // percentage
    cpu: { warning: number; critical: number }; // percentage
    disk: { warning: number; critical: number }; // MB/s
    network: { warning: number; critical: number }; // requests/minute
    handles: { warning: number; critical: number }; // percentage
  };
}

export interface PluginData {
  manifest: PluginManifest;
  config: PluginConfig;
  worker?: any;
  limits: ResourceLimits;
  metrics: ResourceMetrics[];
  alerts: ResourceAlert[];
  lastEnforcement?: EnforcementAction;
}

export class ResourceMonitor extends BasePlugin {
  private readonly plugins = new Map<string, PluginData>();
  private monitoringInterval?: NodeJS.Timeout;
  private performanceObserver?: PerformanceObserver;
  private readonly networkCounters = new Map<string, { requests: number; bytesIn: number; bytesOut: number }>();
  private readonly diskCounters = new Map<string, { reads: number; writes: number; bytesRead: number; bytesWritten: number }>();
  protected readonly resourceConfig: ResourceMonitorConfig;

  constructor(manifest: PluginManifest, config: ResourceMonitorConfig, context: PluginContext) {
    super(manifest, config, context);
    
    this.resourceConfig = {
      enabled: true,
      interval: 5000, // 5 seconds
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      maxAlerts: 100,
      enforcementEnabled: false,
      gracePeriod: 60000, // 1 minute
      alertThresholds: {
        memory: { warning: 80, critical: 95 },
        cpu: { warning: 75, critical: 90 },
        disk: { warning: 50, critical: 100 }, // MB/s
        network: { warning: 1000, critical: 2000 }, // requests/minute
        handles: { warning: 75, critical: 90 } // percentage
      },
      ...config
    };
  }

  async onInitialize(): Promise<void> {
    if (this.resourceConfig.enabled) {
      await this.startMonitoring();
    }
  }

  async onStart(): Promise<void> {
    // Resource monitor starts automatically if enabled
  }

  async onStop(): Promise<void> {
    await this.stopMonitoring();
  }

  async onDestroy(): Promise<void> {
    await this.cleanup();
  }

  registerPlugin(pluginName: string, manifest: PluginManifest, config: PluginConfig, worker?: any): void {
    const limits: ResourceLimits = config.resourceLimits ? this.parseResourceLimits(config.resourceLimits) : this.getDefaultLimits();
    
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

    this.emit('plugin-registered', pluginName);
  }

  unregisterPlugin(pluginName: string): void {
    this.plugins.delete(pluginName);
    this.networkCounters.delete(pluginName);
    this.diskCounters.delete(pluginName);
    this.emit('plugin-unregistered', pluginName);
  }

  private async startMonitoring(): Promise<void> {
    // Start periodic metric collection
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.resourceConfig.interval);

    // Set up performance monitoring
    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        this.processPerformanceEntry(entry);
      }
    });
    
    this.performanceObserver.observe({ entryTypes: ['measure', 'resource'] });

    // Clean up old metrics periodically
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 300000); // Every 5 minutes
  }

  private async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = undefined;
    }
  }

  private async collectMetrics(): Promise<void> {
    for (const [pluginName, pluginData] of Array.from(this.plugins.entries())) {
      try {
        const metrics = await this.gatherPluginMetrics(pluginName, pluginData);

        // Store metrics
        pluginData.metrics.push(metrics);

        // Keep only recent metrics to prevent memory bloat
        if (pluginData.metrics.length > 1000) {
          pluginData.metrics = pluginData.metrics.slice(-500);
        }

        // Check for alerts
        await this.checkResourceAlerts(pluginName, metrics, pluginData.limits);

        this.emit('metrics-collected', { pluginName, metrics });
      } catch (error) {
        this.emit('error', `Failed to collect metrics for ${pluginName}`, error);
      }
    }
  }

  private async gatherPluginMetrics(pluginName: string, pluginData: PluginData): Promise<ResourceMetrics> {
    const timestamp = new Date();
    
    // Get memory usage
    const memUsage = memoryUsage();
    
    // Get CPU usage
    const cpuData = cpuUsage();
    
    // Get disk I/O (estimated from counters)
    const diskCounter = this.diskCounters.get(pluginName) || { reads: 0, writes: 0, bytesRead: 0, bytesWritten: 0 };
    
    // Get network usage
    const networkCounter = this.networkCounters.get(pluginName) || { requests: 0, bytesIn: 0, bytesOut: 0 };
    
    // Get worker handles (estimated)
    const workerHandles = await this.getWorkerHandles(pluginData.worker);

    return {
      pluginName,
      timestamp,
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        percentage: this.calculateMemoryPercentage(memUsage, pluginData.limits.memory)
      },
      cpu: {
        user: cpuData.user,
        system: cpuData.system,
        percentage: this.calculateCpuPercentage(cpuData)
      },
      disk: {
        bytesRead: diskCounter.bytesRead,
        bytesWritten: diskCounter.bytesWritten,
        operations: diskCounter.reads + diskCounter.writes
      },
      network: {
        requests: networkCounter.requests,
        bytesIn: networkCounter.bytesIn,
        bytesOut: networkCounter.bytesOut
      },
      handles: {
        open: workerHandles.open,
        limit: workerHandles.limit
      }
    };
  }

  private calculateMemoryPercentage(memUsage: NodeJS.MemoryUsage, limitMB: number): number {
    const limitBytes = limitMB * 1024 * 1024;
    return (memUsage.heapUsed / limitBytes) * 100;
  }

  private calculateCpuPercentage(cpuData: NodeJS.CpuUsage): number {
    const totalCpu = cpuData.user + cpuData.system;
    return Math.min(100, (totalCpu / 1000000) * 100); // Convert to percentage
  }

  private async getWorkerHandles(worker: any): Promise<{ open: number; limit: number }> {
    // This would need to be implemented based on the actual worker implementation
    return { open: 10, limit: 1000 }; // Placeholder
  }

  private async checkResourceAlerts(pluginName: string, metrics: ResourceMetrics, limits: ResourceLimits): Promise<void> {
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

  private async checkMemoryAlert(pluginName: string, memory: ResourceMetrics['memory'], pluginData: PluginData): Promise<void> {
    const { warning, critical } = this.resourceConfig.alertThresholds.memory;

    if (memory.percentage >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resourceType: 'memory',
        threshold: critical,
        currentValue: memory.heapUsed,
        percentage: memory.percentage,
        message: `Memory usage critical: ${memory.percentage.toFixed(1)}% (${(memory.heapUsed / 1024 / 1024).toFixed(1)}MB)`
      });
    } else if (memory.percentage >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resourceType: 'memory',
        threshold: warning,
        currentValue: memory.heapUsed,
        percentage: memory.percentage,
        message: `Memory usage warning: ${memory.percentage.toFixed(1)}% (${(memory.heapUsed / 1024 / 1024).toFixed(1)}MB)`
      });
    }
  }

  private async checkCpuAlert(pluginName: string, cpu: ResourceMetrics['cpu'], pluginData: PluginData): Promise<void> {
    const { warning, critical } = this.resourceConfig.alertThresholds.cpu;

    if (cpu.percentage >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resourceType: 'cpu',
        threshold: critical,
        currentValue: cpu.user + cpu.system,
        percentage: cpu.percentage,
        message: `CPU usage critical: ${cpu.percentage.toFixed(1)}%`
      });
    } else if (cpu.percentage >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resourceType: 'cpu',
        threshold: warning,
        currentValue: cpu.user + cpu.system,
        percentage: cpu.percentage,
        message: `CPU usage warning: ${cpu.percentage.toFixed(1)}%`
      });
    }
  }

  private async checkDiskAlert(pluginName: string, disk: ResourceMetrics['disk'], pluginData: PluginData): Promise<void> {
    const diskRateMBps = (disk.bytesRead + disk.bytesWritten) / 1024 / 1024;
    const { warning, critical } = this.resourceConfig.alertThresholds.disk;

    if (diskRateMBps >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resourceType: 'disk',
        threshold: critical,
        currentValue: diskRateMBps,
        percentage: (diskRateMBps / critical) * 100,
        message: `Disk I/O critical: ${diskRateMBps.toFixed(1)} MB/s`
      });
    } else if (diskRateMBps >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resourceType: 'disk',
        threshold: warning,
        currentValue: diskRateMBps,
        percentage: (diskRateMBps / warning) * 100,
        message: `Disk I/O warning: ${diskRateMBps.toFixed(1)} MB/s`
      });
    }
  }

  private async checkNetworkAlert(pluginName: string, network: ResourceMetrics['network'], pluginData: PluginData): Promise<void> {
    const requestsPerMinute = network.requests; // Simplified calculation
    const { warning, critical } = this.resourceConfig.alertThresholds.network;

    if (requestsPerMinute >= critical) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resourceType: 'network',
        threshold: critical,
        currentValue: requestsPerMinute,
        percentage: (requestsPerMinute / critical) * 100,
        message: `Network usage critical: ${requestsPerMinute} requests/min`
      });
    } else if (requestsPerMinute >= warning) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resourceType: 'network',
        threshold: warning,
        currentValue: requestsPerMinute,
        percentage: (requestsPerMinute / warning) * 100,
        message: `Network usage warning: ${requestsPerMinute} requests/min`
      });
    }
  }

  private async checkHandleAlert(pluginName: string, handles: ResourceMetrics['handles'], pluginData: PluginData): Promise<void> {
    const percentage = (handles.open / handles.limit) * 100;

    if (percentage >= 90) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'critical',
        resourceType: 'handles',
        threshold: 90,
        currentValue: handles.open,
        percentage,
        message: `Handle usage critical: ${handles.open}/${handles.limit} (${percentage.toFixed(1)}%)`
      });
    } else if (percentage >= 75) {
      await this.createAlert(pluginData, {
        pluginName,
        alertType: 'warning',
        resourceType: 'handles',
        threshold: 75,
        currentValue: handles.open,
        percentage,
        message: `Handle usage warning: ${handles.open}/${handles.limit} (${percentage.toFixed(1)}%)`
      });
    }
  }

  private async createAlert(pluginData: PluginData, alertData: Omit<ResourceAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<void> {
    const alert: ResourceAlert = {
      ...alertData,
      id: `${alertData.pluginName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false
    };

    pluginData.alerts.push(alert);

    // Keep only recent alerts
    if (pluginData.alerts.length > this.resourceConfig.maxAlerts) {
      pluginData.alerts = pluginData.alerts.slice(-this.resourceConfig.maxAlerts);
    }

    this.emit('resource-alert', alert);

    // Consider enforcement action for critical alerts
    if (alert.alertType === 'critical' && this.resourceConfig.enforcementEnabled) {
      await this.considerEnforcement(alert, pluginData);
    }
  }

  // Resource enforcement
  private async considerEnforcement(alert: ResourceAlert, pluginData: PluginData): Promise<void> {
    // Check if we're still in grace period
    if (pluginData.lastEnforcement) {
      const timeSinceLastEnforcement = Date.now() - pluginData.lastEnforcement.executedAt.getTime();
      if (timeSinceLastEnforcement < this.resourceConfig.gracePeriod) {
        return; // Still in grace period
      }
    }

    // Determine enforcement action
    let action: EnforcementAction['action'] = 'throttle';
    if (alert.percentage > 150) {
      action = 'terminate';
    } else if (alert.percentage > 120) {
      action = 'suspend';
    } else if (alert.percentage > 100) {
      action = 'quarantine';
    }

    const enforcement: EnforcementAction = {
      id: `enforcement-${Date.now()}`,
      pluginName: alert.pluginName,
      action,
      reason: alert.message,
      timestamp: new Date(),
      executedAt: new Date(),
      successful: false
    };

    try {
      const success = await this.executeEnforcement(alert.pluginName, enforcement);
      enforcement.successful = success;
      pluginData.lastEnforcement = enforcement;

      this.emit('resource-enforcement', enforcement);
    } catch (error) {
      this.emit('error', `Failed to execute enforcement for ${alert.pluginName}`, error);
    }
  }

  private async executeEnforcement(pluginName: string, enforcement: EnforcementAction): Promise<boolean> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) return false;

    try {
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
    } catch (error) {
      this.emit('error', `Enforcement action failed for ${pluginName}`, error);
      return false;
    }
  }

  private async throttlePlugin(pluginName: string, pluginData: PluginData): Promise<boolean> {
    // Implementation would depend on the plugin architecture
    this.emit('plugin-throttled', pluginName);
    return true;
  }

  private async suspendPlugin(pluginName: string, pluginData: PluginData): Promise<boolean> {
    // Implementation would depend on the plugin architecture
    this.emit('plugin-suspended', pluginName);
    return true;
  }

  private async terminatePlugin(pluginName: string, pluginData: PluginData): Promise<boolean> {
    // Implementation would depend on the plugin architecture
    this.emit('plugin-terminated', pluginName);
    return true;
  }

  private async quarantinePlugin(pluginName: string, pluginData: PluginData): Promise<boolean> {
    // Implementation would depend on the plugin architecture
    this.emit('plugin-quarantined', pluginName);
    return true;
  }

  private parseResourceLimits(resourceLimits: any): ResourceLimits {
    const limits: ResourceLimits = {
      memory: 512, // Default 512MB
      cpu: 80,     // Default 80%
      disk: 50,    // Default 50MB/s
      network: 1000, // Default 1000 req/min
      handles: 1000  // Default 1000 handles
    };

    if (resourceLimits.memory) {
      limits.memory = resourceLimits.memory;
    }
    if (resourceLimits.cpu) {
      limits.cpu = resourceLimits.cpu;
    }
    if (resourceLimits.disk) {
      limits.disk = resourceLimits.disk;
    }
    if (resourceLimits.network) {
      limits.network = resourceLimits.network;
    }
    if (resourceLimits.handles) {
      limits.handles = resourceLimits.handles;
    }

    return limits;
  }

  private getDefaultLimits(): ResourceLimits {
    return {
      memory: 512,   // 512MB
      cpu: 80,       // 80%
      disk: 50,      // 50MB/s
      network: 1000, // 1000 req/min
      handles: 1000  // 1000 handles
    };
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    // Process performance entries for additional metrics
    // This would be implemented based on specific needs
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.resourceConfig.retentionPeriod;

    for (const [_pluginName, pluginData] of Array.from(this.plugins.entries())) {
      // Clean up old metrics
      pluginData.metrics = pluginData.metrics.filter(metric => metric.timestamp.getTime() > cutoffTime);

      // Clean up old alerts (but keep unacknowledged ones)
      pluginData.alerts = pluginData.alerts.filter(
        alert => !alert.acknowledged || alert.timestamp.getTime() > cutoffTime
      );
    }
  }

  // Public API methods
  getResourceUsage(pluginName: string): ResourceMetrics | null {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData || pluginData.metrics.length === 0) {
      return null;
    }

    return pluginData.metrics[pluginData.metrics.length - 1];
  }

  getMetricsHistory(pluginName: string, limit?: number): ResourceMetrics[] {
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
    for (const [, pluginData] of Array.from(this.plugins.entries())) {
      allAlerts.push(...pluginData.alerts.filter(alert => !alert.acknowledged));
    }

    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  acknowledgeAlert(alertId: string): boolean {
    for (const [, pluginData] of Array.from(this.plugins.entries())) {
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
    totalMemory: number;
    averageCpu: number;
    totalNetwork: number;
    activeAlerts: number;
    criticalAlerts: number;
  } {
    let totalMemory = 0;
    let totalCpu = 0;
    let totalNetwork = 0;
    let activeAlerts = 0;
    let criticalAlerts = 0;
    let pluginCount = 0;

    for (const [, pluginData] of Array.from(this.plugins.entries())) {
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
      totalMemory,
      averageCpu: pluginCount > 0 ? totalCpu / pluginCount : 0,
      totalNetwork,
      activeAlerts,
      criticalAlerts
    };
  }

  // Helper methods for external monitoring
  recordNetworkOperation(pluginName: string, bytesIn: number, bytesOut: number): void {
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