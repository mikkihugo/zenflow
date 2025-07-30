/**
 * Plugin Lifecycle Manager
 * Advanced plugin lifecycle management with health monitoring and recovery
 */

import { EventEmitter } from 'events';
import {
  Plugin,
  PluginManager,
  PluginMetadata,
  PluginHealthResult,
  PluginStatus,
  PluginEvents,
  JSONObject
} from '../types/plugin.js';
import { performance } from 'perf_hooks';

interface LifecycleEvent {
  pluginName: string;
  event: keyof PluginEvents;
  timestamp: Date;
  data?: any;
  error?: Error;
}

interface HealthCheckSchedule {
  pluginName: string;
  interval: number;
  nextCheck: Date;
  consecutiveFailures: number;
  enabled: boolean;
}

interface RecoveryStrategy {
  name: string;
  condition: (plugin: Plugin, health: PluginHealthResult) => boolean;
  action: (plugin: Plugin, manager: PluginManager) => Promise<boolean>;
  priority: number;
  maxAttempts: number;
}

interface LifecycleMetrics {
  totalStateChanges: number;
  successfulStarts: number;
  failedStarts: number;
  successfulStops: number;
  failedStops: number;
  crashes: number;
  recoveries: number;
  averageStartTime: number;
  averageStopTime: number;
}

export class PluginLifecycleManager extends EventEmitter {
  private pluginManager: PluginManager;
  private healthChecks: Map<string, HealthCheckSchedule> = new Map();
  private lifecycleEvents: LifecycleEvent[] = [];
  private recoveryStrategies: RecoveryStrategy[] = [];
  private metrics: Map<string, LifecycleMetrics> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private recoveryInProgress: Set<string> = new Set();
  
  private readonly config: {
    healthCheckInterval: number;
    maxEventHistory: number;
    enableAutoRecovery: boolean;
    maxRecoveryAttempts: number;
    recoveryDelayMs: number;
    crashThreshold: number;
    degradationThreshold: number;
  };

  constructor(pluginManager: PluginManager, config: Partial<typeof PluginLifecycleManager.prototype.config> = {}) {
    super();
    
    this.pluginManager = pluginManager;
    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      maxEventHistory: 1000,
      enableAutoRecovery: true,
      maxRecoveryAttempts: 3,
      recoveryDelayMs: 5000,
      crashThreshold: 3, // consecutive failures before considering crashed
      degradationThreshold: 50, // health score below this triggers recovery
      ...config
    };

    this.setupRecoveryStrategies();
    this.setupEventListeners();
    this.startHealthMonitoring();
  }

  // Plugin lifecycle management
  async startPlugin(pluginName: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      this.recordEvent(pluginName, 'starting');
      
      const plugin = await this.pluginManager.getPlugin(pluginName);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginName}`);
      }

      await plugin.start();
      
      const duration = performance.now() - startTime;
      this.updateMetrics(pluginName, 'successfulStart', duration);
      this.recordEvent(pluginName, 'started', { duration });
      
      // Schedule health checks
      this.scheduleHealthCheck(pluginName);
      
      this.emit('plugin-started', { pluginName, duration });
      return true;

    } catch (error: any) {
      const duration = performance.now() - startTime;
      this.updateMetrics(pluginName, 'failedStart', duration);
      this.recordEvent(pluginName, 'error', { error, phase: 'start' });
      
      this.emit('plugin-start-failed', { pluginName, error, duration });
      return false;
    }
  }

  async stopPlugin(pluginName: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      this.recordEvent(pluginName, 'stopping');
      
      const plugin = await this.pluginManager.getPlugin(pluginName);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginName}`);
      }

      await plugin.stop();
      
      const duration = performance.now() - startTime;
      this.updateMetrics(pluginName, 'successfulStop', duration);
      this.recordEvent(pluginName, 'stopped', { duration });
      
      // Unschedule health checks
      this.unscheduleHealthCheck(pluginName);
      
      this.emit('plugin-stopped', { pluginName, duration });
      return true;

    } catch (error: any) {
      const duration = performance.now() - startTime;
      this.updateMetrics(pluginName, 'failedStop', duration);
      this.recordEvent(pluginName, 'error', { error, phase: 'stop' });
      
      this.emit('plugin-stop-failed', { pluginName, error, duration });
      return false;
    }
  }

  async restartPlugin(pluginName: string): Promise<boolean> {
    this.emit('plugin-restarting', { pluginName });
    
    const stopSuccess = await this.stopPlugin(pluginName);
    if (!stopSuccess) {
      return false;
    }

    // Wait a moment before restarting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const startSuccess = await this.startPlugin(pluginName);
    if (startSuccess) {
      this.emit('plugin-restarted', { pluginName });
      this.updateMetrics(pluginName, 'recovery');
    }
    
    return startSuccess;
  }

  // Health monitoring
  async performHealthCheck(pluginName: string): Promise<PluginHealthResult> {
    const plugin = await this.pluginManager.getPlugin(pluginName);
    if (!plugin) {
      return {
        status: 'unhealthy',
        score: 0,
        issues: [{
          severity: 'critical',
          message: 'Plugin not found',
          component: 'lifecycle'
        }],
        metrics: {},
        lastCheck: new Date()
      };
    }

    try {
      const health = await plugin.healthCheck();
      
      // Update health check schedule
      const schedule = this.healthChecks.get(pluginName);
      if (schedule) {
        schedule.nextCheck = new Date(Date.now() + schedule.interval);
        schedule.consecutiveFailures = health.status === 'unhealthy' ? 
          schedule.consecutiveFailures + 1 : 0;
      }

      // Check if recovery is needed
      if (this.config.enableAutoRecovery && this.shouldAttemptRecovery(pluginName, health)) {
        await this.attemptRecovery(pluginName, health);
      }

      this.emit('health-check-completed', { pluginName, health });
      return health;

    } catch (error: any) {
      const health: PluginHealthResult = {
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

      // Update consecutive failures
      const schedule = this.healthChecks.get(pluginName);
      if (schedule) {
        schedule.consecutiveFailures++;
        schedule.nextCheck = new Date(Date.now() + schedule.interval);
      }

      this.recordEvent(pluginName, 'error', { error, phase: 'health-check' });
      this.emit('health-check-failed', { pluginName, error });
      
      return health;
    }
  }

  private shouldAttemptRecovery(pluginName: string, health: PluginHealthResult): boolean {
    // Don't attempt recovery if already in progress
    if (this.recoveryInProgress.has(pluginName)) {
      return false;
    }

    const schedule = this.healthChecks.get(pluginName);
    if (!schedule) {
      return false;
    }

    // Check if health score is below threshold
    if (health.score < this.config.degradationThreshold) {
      return true;
    }

    // Check if we have consecutive failures indicating a crash
    if (schedule.consecutiveFailures >= this.config.crashThreshold) {
      return true;
    }

    // Check for critical issues
    const criticalIssues = health.issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      return true;
    }

    return false;
  }

  private async attemptRecovery(pluginName: string, health: PluginHealthResult): Promise<boolean> {
    this.recoveryInProgress.add(pluginName);
    
    try {
      this.emit('recovery-started', { pluginName, health });

      const plugin = await this.pluginManager.getPlugin(pluginName);
      if (!plugin) {
        return false;
      }

      // Find applicable recovery strategies
      const applicableStrategies = this.recoveryStrategies
        .filter(strategy => strategy.condition(plugin, health))
        .sort((a, b) => b.priority - a.priority);

      for (const strategy of applicableStrategies) {
        try {
          this.emit('recovery-strategy-attempting', { pluginName, strategy: strategy.name });
          
          const success = await strategy.action(plugin, this.pluginManager);
          
          if (success) {
            this.emit('recovery-successful', { pluginName, strategy: strategy.name });
            this.updateMetrics(pluginName, 'recovery');
            return true;
          }
        } catch (error: any) {
          this.emit('recovery-strategy-failed', { 
            pluginName, 
            strategy: strategy.name, 
            error 
          });
        }
      }

      this.emit('recovery-failed', { pluginName });
      return false;

    } finally {
      this.recoveryInProgress.delete(pluginName);
    }
  }

  // Health check scheduling
  private scheduleHealthCheck(pluginName: string, interval?: number): void {
    const checkInterval = interval || this.config.healthCheckInterval;
    
    this.healthChecks.set(pluginName, {
      pluginName,
      interval: checkInterval,
      nextCheck: new Date(Date.now() + checkInterval),
      consecutiveFailures: 0,
      enabled: true
    });
  }

  private unscheduleHealthCheck(pluginName: string): void {
    this.healthChecks.delete(pluginName);
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      const now = new Date();
      
      for (const [pluginName, schedule] of this.healthChecks) {
        if (schedule.enabled && now >= schedule.nextCheck) {
          try {
            await this.performHealthCheck(pluginName);
          } catch (error) {
            // Health check errors are handled within performHealthCheck
          }
        }
      }
    }, 5000); // Check every 5 seconds for due health checks
  }

  // Recovery strategies
  private setupRecoveryStrategies(): void {
    // Strategy 1: Simple restart for crashed plugins
    this.recoveryStrategies.push({
      name: 'restart',
      condition: (plugin, health) => health.status === 'unhealthy' && health.score === 0,
      action: async (plugin, manager) => {
        await this.restartPlugin(plugin.metadata.name);
        return true;
      },
      priority: 100,
      maxAttempts: 3
    });

    // Strategy 2: Configuration reset for degraded plugins
    this.recoveryStrategies.push({
      name: 'config-reset',
      condition: (plugin, health) => {
        return health.issues.some(issue => 
          issue.component === 'configuration' && issue.severity === 'high'
        );
      },
      action: async (plugin, manager) => {
        await plugin.resetConfiguration();
        return true;
      },
      priority: 80,
      maxAttempts: 1
    });

    // Strategy 3: Memory cleanup for resource issues
    this.recoveryStrategies.push({
      name: 'memory-cleanup',
      condition: (plugin, health) => {
        return health.issues.some(issue => 
          issue.component === 'resources' && 
          issue.message.toLowerCase().includes('memory')
        );
      },
      action: async (plugin, manager) => {
        // Trigger garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // Clear plugin caches if available
        if (typeof (plugin as any).clearCache === 'function') {
          await (plugin as any).clearCache();
        }
        
        return true;
      },
      priority: 60,
      maxAttempts: 2
    });

    // Strategy 4: Plugin reload for persistent issues
    this.recoveryStrategies.push({
      name: 'reload',
      condition: (plugin, health) => health.score < 30,
      action: async (plugin, manager) => {
        await manager.reloadPlugin(plugin.metadata.name);
        return true;
      },
      priority: 50,
      maxAttempts: 1
    });
  }

  // Event recording and metrics
  private recordEvent(pluginName: string, event: keyof PluginEvents, data?: any): void {
    const lifecycleEvent: LifecycleEvent = {
      pluginName,
      event,
      timestamp: new Date(),
      data
    };

    this.lifecycleEvents.push(lifecycleEvent);

    // Maintain event history limit
    if (this.lifecycleEvents.length > this.config.maxEventHistory) {
      this.lifecycleEvents.shift();
    }

    this.emit('lifecycle-event', lifecycleEvent);
  }

  private updateMetrics(pluginName: string, type: string, value?: number): void {
    if (!this.metrics.has(pluginName)) {
      this.metrics.set(pluginName, {
        totalStateChanges: 0,
        successfulStarts: 0,
        failedStarts: 0,
        successfulStops: 0,
        failedStops: 0,
        crashes: 0,
        recoveries: 0,
        averageStartTime: 0,
        averageStopTime: 0
      });
    }

    const metrics = this.metrics.get(pluginName)!;
    metrics.totalStateChanges++;

    switch (type) {
      case 'successfulStart':
        metrics.successfulStarts++;
        if (value) {
          metrics.averageStartTime = 
            (metrics.averageStartTime * (metrics.successfulStarts - 1) + value) / metrics.successfulStarts;
        }
        break;
      case 'failedStart':
        metrics.failedStarts++;
        break;
      case 'successfulStop':
        metrics.successfulStops++;
        if (value) {
          metrics.averageStopTime = 
            (metrics.averageStopTime * (metrics.successfulStops - 1) + value) / metrics.successfulStops;
        }
        break;
      case 'failedStop':
        metrics.failedStops++;
        break;
      case 'crash':
        metrics.crashes++;
        break;
      case 'recovery':
        metrics.recoveries++;
        break;
    }
  }

  private setupEventListeners(): void {
    // Listen to plugin manager events
    this.pluginManager.on('error', (pluginName, error) => {
      this.recordEvent(pluginName, 'error', { error });
      this.updateMetrics(pluginName, 'crash');
    });

    this.pluginManager.on('plugin-restarted', (pluginName) => {
      this.updateMetrics(pluginName, 'recovery');
    });
  }

  // Public API
  getLifecycleEvents(pluginName?: string, limit?: number): LifecycleEvent[] {
    let events = pluginName ? 
      this.lifecycleEvents.filter(e => e.pluginName === pluginName) :
      this.lifecycleEvents;

    if (limit) {
      events = events.slice(-limit);
    }

    return events;
  }

  getMetrics(pluginName?: string): Record<string, LifecycleMetrics> {
    if (pluginName) {
      const metrics = this.metrics.get(pluginName);
      return metrics ? { [pluginName]: metrics } : {};
    }

    return Object.fromEntries(this.metrics);
  }

  getHealthStatus(): {
    totalPlugins: number;
    healthyPlugins: number;
    degradedPlugins: number;
    unhealthyPlugins: number;
    scheduledChecks: number;
    activeRecoveries: number;
  } {
    return {
      totalPlugins: this.healthChecks.size,
      healthyPlugins: 0, // Would need to track last health results
      degradedPlugins: 0,
      unhealthyPlugins: 0,
      scheduledChecks: Array.from(this.healthChecks.values()).filter(s => s.enabled).length,
      activeRecoveries: this.recoveryInProgress.size
    };
  }

  async performBulkHealthCheck(): Promise<Record<string, PluginHealthResult>> {
    const results: Record<string, PluginHealthResult> = {};
    
    const plugins = Array.from(this.healthChecks.keys());
    const healthPromises = plugins.map(async (pluginName) => {
      try {
        const health = await this.performHealthCheck(pluginName);
        results[pluginName] = health;
      } catch (error: any) {
        results[pluginName] = {
          status: 'unhealthy',
          score: 0,
          issues: [{
            severity: 'critical',
            message: error.message,
            component: 'health-monitor'
          }],
          metrics: {},
          lastCheck: new Date()
        };
      }
    });

    await Promise.all(healthPromises);
    return results;
  }

  setRecoveryEnabled(pluginName: string, enabled: boolean): void {
    const schedule = this.healthChecks.get(pluginName);
    if (schedule) {
      schedule.enabled = enabled;
    }
  }

  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
    this.recoveryStrategies.sort((a, b) => b.priority - a.priority);
  }

  removeRecoveryStrategy(name: string): boolean {
    const index = this.recoveryStrategies.findIndex(s => s.name === name);
    if (index > -1) {
      this.recoveryStrategies.splice(index, 1);
      return true;
    }
    return false;
  }

  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    this.healthChecks.clear();
    this.lifecycleEvents.length = 0;
    this.metrics.clear();
    this.recoveryInProgress.clear();
  }
}

export default PluginLifecycleManager;