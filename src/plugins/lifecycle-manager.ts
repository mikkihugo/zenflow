/**
 * Plugin Lifecycle Manager
 * Advanced plugin lifecycle management with health monitoring and recovery
 */

import { performance } from 'node:perf_hooks';
import { Plugin } from '../types/plugin.js';

interface LifecycleEvent {pluginName = > boolean
action = > Promise<boolean>
priority = new Map()
private
lifecycleEvents = [];
private
recoveryStrategies = [];
private
metrics = new Map();
private
healthCheckInterval?: NodeJS.Timeout;
private
recoveryInProgress = new Set();

private
readonly;
config = {};
)
{
  super();

  this.pluginManager = pluginManager;
  this.config = {
      healthCheckInterval, // 30 secondsmaxEventHistory = performance.now();
    
    try {
      this.recordEvent(pluginName, 'starting');

  const plugin = await this.pluginManager.getPlugin(pluginName);
  if (!plugin) {
    throw new Error(`Plugin notfound = performance.now() - startTime;
      this.updateMetrics(pluginName, 'successfulStart', duration);
      this.recordEvent(pluginName, 'started', { duration });
      
      // Schedule health checks
      this.scheduleHealthCheck(pluginName);
      
      this.emit('plugin-started', { pluginName, duration });
      return true;

    } catch (error = performance.now() - startTime;
      this.updateMetrics(pluginName, 'failedStart', duration);
      this.recordEvent(pluginName, 'error', { error,phase = performance.now();
    
    try {
      this.recordEvent(pluginName, 'stopping');
      
      const plugin = await this.pluginManager.getPlugin(pluginName);
      if (!plugin) {
        throw new Error(`Plugin notfound = performance.now() - startTime;
    this.updateMetrics(pluginName, 'successfulStop', duration);
    this.recordEvent(pluginName, 'stopped', { duration });

    // Unschedule health checks
    this.unscheduleHealthCheck(pluginName);

    this.emit('plugin-stopped', { pluginName, duration });
    return true;
  }
  catch (error = performance.now() - startTime
  this.updateMetrics(pluginName, 'failedStop', duration)
  this.recordEvent(pluginName, 'error', { error,phase = await this.stopPlugin(pluginName);
  if (!stopSuccess) {
    return false;
  }

  // Wait a moment before restarting
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const startSuccess = await this.startPlugin(pluginName);
  if (startSuccess) {
    this.emit('plugin-restarted', { pluginName });
    this.updateMetrics(pluginName, 'recovery');
  }

  return startSuccess;
}

// Health monitoring
async;
performHealthCheck(pluginName = await this.pluginManager.getPlugin(pluginName);
if (!plugin) {
      return {status = await plugin.healthCheck();
      
      // Update health check schedule
      const schedule = this.healthChecks.get(pluginName);
      if (schedule) {
        schedule.nextCheck = new Date(Date.now() + schedule.interval);
        schedule.consecutiveFailures = health.status === 'unhealthy' ? 
          schedule.consecutiveFailures + 1 = {status = this.healthChecks.get(pluginName);
      if (schedule) {
        schedule.consecutiveFailures++;
        schedule.nextCheck = new Date(Date.now() + schedule.interval);
      }

      this.recordEvent(pluginName, 'error', { error,phase = this.healthChecks.get(pluginName);
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

  private async attemptRecovery(pluginName = await this.pluginManager.getPlugin(pluginName);
      if (!plugin) {
        return false;
      }

      // Find applicable recovery strategies
      const applicableStrategies = this.recoveryStrategies
        .filter(strategy => strategy.condition(plugin, health))
        .sort((a, b) => b.priority - a.priority);

      for (const strategy of applicableStrategies) {
        try {
          this.emit('recovery-strategy-attempting', { pluginName,strategy = await strategy.action(plugin, this.pluginManager);
          
          if (success) {
            this.emit('recovery-successful', { pluginName,strategy = interval || this.config.healthCheckInterval;
    
    this.healthChecks.set(pluginName, {
      pluginName,interval = setInterval(async () => {
      const now = new Date();
      
      for (const [pluginName, schedule] of this.healthChecks) {
        if (schedule.enabled && now >= schedule.nextCheck) {
          try {
            await this.performHealthCheck(pluginName);
          } catch (_error) {
            // Health check errors are handled within performHealthCheck
          }
        }
      }
    }, 5000); // Check every 5 seconds for due health checks
  }

  // Recovery strategies
  private setupRecoveryStrategies(): void 
    // Strategy1 = > health.status === 'unhealthy' && health.score === 0,
      action => 
        await this.restartPlugin(plugin.metadata.name);
        return true;,
      priority => 
        return health.issues.some(issue => 
          issue.component === 'configuration' && issue.severity === 'high'
        );,
      action => 
        await plugin.resetConfiguration();
        return true;,
      priority => 
        return health.issues.some(issue => 
          issue.component === 'resources' && 
          issue.message.toLowerCase().includes('memory')
        );,
      action => 
        // Trigger garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // Clear plugin caches if available
        if (typeof (plugin as any).clearCache === 'function') {
          await (plugin as any).clearCache();
        }
        
        return true;,priority = > health.score < 30,
      action => 
        await manager.reloadPlugin(plugin.metadata.name);
        return true;,
      priority = pluginName = this.metrics.get(pluginName)!;
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

  private setupEventListeners(): void 
    // Listen to plugin manager events
    this.pluginManager.on('error', (pluginName, error) => 
      this.recordEvent(pluginName, 'error', error );
      this.updateMetrics(pluginName, 'crash'););

    this.pluginManager.on('plugin-restarted', (pluginName) => {
      this.updateMetrics(pluginName, 'recovery');
    });

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

  getMetrics(pluginName?: string): Record<string, LifecycleMetrics> 
    if (pluginName) {
      const metrics = this.metrics.get(pluginName);
      return metrics ? { [pluginName]: metrics } : {};
    }

    return Object.fromEntries(this.metrics);

  getHealthStatus(): {totalPlugins = > s.enabled).length,
      activeRecoveries = ;
    
    const _plugins = Array.from(this.healthChecks.keys());

        results[pluginName] = health;
      } catch (error = status = this.healthChecks.get(pluginName);
    if (schedule) {
      schedule.enabled = enabled;
    }

  addRecoveryStrategy(strategy): void 
    this.recoveryStrategies.push(strategy);
    this.recoveryStrategies.sort((a, b) => b.priority - a.priority);

  removeRecoveryStrategy(name = this.recoveryStrategies.findIndex(s => s.name === name);
    if (index > -1) {
      this.recoveryStrategies.splice(index, 1);
      return true;
    }
    return false;

  async cleanup(): Promise<void> 
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    this.healthChecks.clear();
    this.lifecycleEvents.length = 0;
    this.metrics.clear();
    this.recoveryInProgress.clear();
}

export default PluginLifecycleManager;
