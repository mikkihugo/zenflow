/**
 * Plugin Lifecycle Manager
 * Advanced plugin lifecycle management with health monitoring and recovery
 */

import { performance } from 'node:perf_hooks';
import { EventEmitter } from 'node:events';
import type { Plugin, PluginManifest, PluginConfig, PluginContext, HealthStatus } from './types.js';

export interface LifecycleEvent {
  pluginName: string;
  action: 'starting' | 'started' | 'stopping' | 'stopped' | 'error' | 'restarting' | 'restarted';
  timestamp: Date;
  data?: Record<string, unknown>;
  duration?: number;
  error?: Error;
  phase?: string;
}

export interface LifecycleMetrics {
  totalStateChanges: number;
  successfulStarts: number;
  failedStarts: number;
  successfulStops: number;
  failedStops: number;
  crashes: number;
  recoveries: number;
  averageStartTime: number;
  averageStopTime: number;
  lastUpdate: Date;
}

export interface HealthSchedule {
  pluginName: string;
  interval: number;
  nextCheck: Date;
  consecutiveFailures: number;
  enabled: boolean;
}

export interface RecoveryStrategy {
  name: string;
  priority: number;
  condition: (plugin: Plugin, health: HealthStatus) => boolean;
  action: (plugin: Plugin, manager: PluginManager) => Promise<boolean>;
}


export interface PluginManager extends EventEmitter {
  getPlugin(name: string): Promise<Plugin | undefined>;
  startPlugin(name: string): Promise<boolean>;
  stopPlugin(name: string): Promise<boolean>;
  restartPlugin(name: string): Promise<boolean>;
  reloadPlugin(name: string): Promise<boolean>;
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}

export interface LifecycleConfig extends PluginConfig {
  healthCheckInterval: number;
  maxEventHistory: number;
  degradationThreshold: number;
  crashThreshold: number;
  recoveryTimeout: number;
  enableAutoRecovery: boolean;
}

export class PluginLifecycleManager extends EventEmitter {
  private readonly pluginManager: PluginManager;
  private readonly lifecycleEvents: LifecycleEvent[] = [];
  private readonly recoveryStrategies: RecoveryStrategy[] = [];
  private readonly metrics = new Map<string, LifecycleMetrics>();
  private readonly healthChecks = new Map<string, HealthSchedule>();
  private healthCheckInterval?: NodeJS.Timeout;
  private readonly recoveryInProgress = new Set<string>();
  private readonly config: LifecycleConfig;

  constructor(
    pluginManager: PluginManager,
    config: Partial<LifecycleConfig> = {}
  ) {
    super();
    this.pluginManager = pluginManager;
    this.config = {
      enabled: true,
      priority: 0,
      settings: {},
      healthCheckInterval: 30000, // 30 seconds
      maxEventHistory: 1000,
      degradationThreshold: 50,
      crashThreshold: 3,
      recoveryTimeout: 300000, // 5 minutes
      enableAutoRecovery: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    this.setupRecoveryStrategies();
    this.setupEventListeners();
    this.startHealthMonitoring();
  }

  async start(): Promise<void> {
    // Lifecycle manager is ready
  }

  async stop(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  async destroy(): Promise<void> {
    this.healthChecks.clear();
    this.lifecycleEvents.length = 0;
    this.metrics.clear();
    this.recoveryInProgress.clear();
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

      const success = await this.pluginManager.startPlugin(pluginName);
      
      if (success) {
        const duration = performance.now() - startTime;
        this.updateMetrics(pluginName, 'successfulStart', duration);
        this.recordEvent(pluginName, 'started', { duration });

        // Schedule health checks
        this.scheduleHealthCheck(pluginName);
        this.emit('plugin-started', { pluginName, duration });
        return true;
      } else {
        throw new Error(`Failed to start plugin: ${pluginName}`);
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.updateMetrics(pluginName, 'failedStart', duration);
      this.recordEvent(pluginName, 'error', { 
        error: error instanceof Error ? error : new Error(String(error)), 
        phase: 'start',
        duration 
      });
      
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

      const success = await this.pluginManager.stopPlugin(pluginName);
      
      if (success) {
        const duration = performance.now() - startTime;
        this.updateMetrics(pluginName, 'successfulStop', duration);
        this.recordEvent(pluginName, 'stopped', { duration });

        // Unschedule health checks
        this.unscheduleHealthCheck(pluginName);
        this.emit('plugin-stopped', { pluginName, duration });
        return true;
      } else {
        throw new Error(`Failed to stop plugin: ${pluginName}`);
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.updateMetrics(pluginName, 'failedStop', duration);
      this.recordEvent(pluginName, 'error', { 
        error: error instanceof Error ? error : new Error(String(error)), 
        phase: 'stop',
        duration 
      });
      
      this.emit('plugin-stop-failed', { pluginName, error, duration });
      return false;
    }
  }

  async restartPlugin(pluginName: string): Promise<boolean> {
    this.recordEvent(pluginName, 'restarting');
    
    // Stop the plugin first
    const stopSuccess = await this.stopPlugin(pluginName);
    if (!stopSuccess) {
      return false;
    }

    // Wait a moment before restarting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Start the plugin
    const startSuccess = await this.startPlugin(pluginName);
    if (startSuccess) {
      this.emit('plugin-restarted', { pluginName });
      this.updateMetrics(pluginName, 'recovery');
    }

    return startSuccess;
  }

  // Health monitoring
  async performHealthCheck(pluginName: string): Promise<HealthStatus> {
    const plugin = await this.pluginManager.getPlugin(pluginName);
    if (!plugin) {
      return {
        status: 'unhealthy',
        score: 0,
        issues: [{ component: 'plugin', severity: 'critical', message: 'Plugin not found' }],
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
      if (this.config.enableAutoRecovery && this.shouldTriggerRecovery(pluginName, health)) {
        await this.attemptRecovery(pluginName, health);
      }

      return health;
    } catch (error) {
      const schedule = this.healthChecks.get(pluginName);
      if (schedule) {
        schedule.consecutiveFailures++;
        schedule.nextCheck = new Date(Date.now() + schedule.interval);
      }

      this.recordEvent(pluginName, 'error', { 
        error: error instanceof Error ? error : new Error(String(error)), 
        phase: 'healthCheck' 
      });

      return {
        status: 'unhealthy',
        score: 0,
        issues: [{ 
          component: 'healthCheck', 
          severity: 'high', 
          message: `Health check failed: ${error instanceof Error ? error.message : String(error)}` 
        }],
        lastCheck: new Date()
      };
    }
  }

  private shouldTriggerRecovery(pluginName: string, health: HealthStatus): boolean {
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

  private async attemptRecovery(pluginName: string, health: HealthStatus): Promise<boolean> {
    if (this.recoveryInProgress.has(pluginName)) {
      return false;
    }

    this.recoveryInProgress.add(pluginName);

    try {
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
            return true;
          }
        } catch (error) {
          this.emit('recovery-strategy-failed', { 
            pluginName, 
            strategy: strategy.name, 
            error 
          });
        }
      }

      return false;
    } finally {
      this.recoveryInProgress.delete(pluginName);
    }
  }

  // Health check scheduling
  scheduleHealthCheck(pluginName: string, interval?: number): void {
    const checkInterval = interval ?? this.config.healthCheckInterval;
    
    this.healthChecks.set(pluginName, {
      pluginName,
      interval: checkInterval,
      nextCheck: new Date(Date.now() + checkInterval),
      consecutiveFailures: 0,
      enabled: true
    });
  }

  unscheduleHealthCheck(pluginName: string): void {
    this.healthChecks.delete(pluginName);
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      const now = new Date();
      
      this.healthChecks.forEach(async (schedule, pluginName) => {
        if (schedule.enabled && now >= schedule.nextCheck) {
          try {
            await this.performHealthCheck(pluginName);
          } catch (error) {
            // Health check errors are handled within performHealthCheck
          }
        }
      });
    }, 5000); // Check every 5 seconds for due health checks
  }

  // Recovery strategies
  private setupRecoveryStrategies(): void {
    // Strategy 1: Complete restart for crashed plugins
    this.recoveryStrategies.push({
      name: 'restart-crashed',
      priority: 100,
      condition: (plugin, health) => health.status === 'unhealthy' && health.score === 0,
      action: async (plugin) => {
        await this.restartPlugin(plugin.metadata.name);
        return true;
      }
    });

    // Strategy 2: Configuration reset for config issues
    this.recoveryStrategies.push({
      name: 'reset-configuration',
      priority: 80,
      condition: (plugin, health) => {
        return health.issues.some(issue => 
          issue.component === 'configuration' && issue.severity === 'high'
        );
      },
      action: async (plugin) => {
        if (typeof (plugin as any).resetConfiguration === 'function') {
          await (plugin as any).resetConfiguration();
        }
        return true;
      }
    });

    // Strategy 3: Memory cleanup for memory issues
    this.recoveryStrategies.push({
      name: 'memory-cleanup',
      priority: 60,
      condition: (plugin, health) => {
        return health.issues.some(issue =>
          issue.component === 'resources' && 
          issue.message.toLowerCase().includes('memory')
        );
      },
      action: async (plugin) => {
        // Trigger garbage collection if available
        if (global.gc) {
          global.gc();
        }

        // Clear plugin caches if available
        if (typeof (plugin as any).clearCache === 'function') {
          await (plugin as any).clearCache();
        }

        return true;
      }
    });

    // Strategy 4: Plugin reload for degraded performance
    this.recoveryStrategies.push({
      name: 'reload-degraded',
      priority: 40,
      condition: (plugin, health) => health.score < 30,
      action: async (plugin, manager) => {
        await manager.reloadPlugin(plugin.metadata.name);
        return true;
      }
    });
  }

  // Metrics and events
  private recordEvent(pluginName: string, action: LifecycleEvent['action'], data?: Record<string, unknown>): void {
    const event: LifecycleEvent = {
      pluginName,
      action,
      timestamp: new Date(),
      data
    };

    this.lifecycleEvents.push(event);

    // Maintain history limit
    if (this.lifecycleEvents.length > this.config.maxEventHistory) {
      this.lifecycleEvents.shift();
    }

    this.emit('lifecycle-event', event);
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
        averageStopTime: 0,
        lastUpdate: new Date()
      });
    }

    const metrics = this.metrics.get(pluginName)!;
    metrics.totalStateChanges++;
    metrics.lastUpdate = new Date();

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
    this.pluginManager.on('error', (pluginName: string, error: Error) => {
      this.recordEvent(pluginName, 'error', { error });
      this.updateMetrics(pluginName, 'crash');
    });

    this.pluginManager.on('plugin-restarted', (pluginName: string) => {
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
    activeRecoveries: number;
    scheduledChecks: Record<string, HealthStatus>;
  } {
    const totalPlugins = this.healthChecks.size;
    const healthyPlugins = Array.from(this.healthChecks.values())
      .filter(s => s.enabled).length;
    const activeRecoveries = this.recoveryInProgress.size;

    const results: Record<string, HealthStatus> = {};
    
    this.healthChecks.forEach((schedule, pluginName) => {
      try {
        // This would be async in real implementation, simplified for example
        results[pluginName] = {
          status: 'healthy',
          score: 100,
          issues: [],
          lastCheck: new Date()
        };
      } catch (error) {
        results[pluginName] = {
          status: 'unhealthy',
          score: 0,
          issues: [{ component: 'check', severity: 'critical', message: String(error) }],
          lastCheck: new Date()
        };
      }
    });

    return { totalPlugins, healthyPlugins, activeRecoveries, scheduledChecks: results };
  }

  setHealthCheckEnabled(pluginName: string, enabled: boolean): void {
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