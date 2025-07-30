/**
 * Enhanced Plugin Manager (TypeScript)
 * Advanced plugin lifecycle management with health monitoring, security, and metrics
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  Plugin,
  type PluginCacheAPI,
  type PluginDatabaseAPI,
  type PluginEventAPI,
  type PluginFilesystemAPI,
  type PluginHttpAPI,
  type PluginQueueAPI,
  type PluginSecretsAPI,
} from '../types/plugin.js';
import HealthMonitor from './health-monitor.js';
import ResourceMonitor from './resource-monitor.js';
import SecurityManager from './security-manager.js';

interface LoadedPlugin {plugin = new Map()
private
hooks = new Map()
private
apis = new Map() // pluginName -> apiName -> API
private
resourceMonitor = {};
)
{
  super();

  this.config = {pluginDir = this.createSystemContext();

  // Initialize security and monitoring systems
  this.securityManager = new SecurityManager({enableSecurity = new ResourceMonitor({enabled = new HealthMonitor({enabled = join(path, 'package.json');
  const manifestContent = await readFile(manifestPath, 'utf-8');
  const packageJson = JSON.parse(manifestContent);

  // Extract plugin manifest from package.json
  const manifest = this.extractManifest(packageJson, path);

  // Validate manifest
  await this.validateManifest(manifest);

  // Create plugin configuration
  const pluginConfig = {name = await this.loadPluginModule(path, manifest);
  const PluginClass = pluginModule.default || pluginModule[manifest.name] || pluginModule;

  // Create plugin context
  const context = this.createPluginContext(manifest, pluginConfig);

  // Instantiate plugin
  const plugin = new PluginClass(manifest, pluginConfig, context);

  // Security validation
  await this.securityManager.validatePlugin(plugin, manifest, pluginConfig);

  // Create loaded plugin entry
  const _loadedPlugin = {plugin = await this.createSandboxWorker(plugin, manifest, pluginConfig);
}

// Store plugin
this.plugins.set(manifest.name, loadedPlugin);

// Register with health monitor
this.healthMonitor.registerPlugin(manifest.name, plugin, manifest, pluginConfig);

// Initialize plugin
await plugin.load(pluginConfig);

// Register plugin hooks and APIs
await this.registerPluginIntegrations(plugin, manifest);

this.emit('loaded', manifest.name, plugin.metadata);
return plugin;

} catch (error)
{
      this.emit('error', path, {message = this.plugins.get(name);
    if (!loadedPlugin) {
      return false;
    }

    try {
      this.emit('unloading', name);

      // Stop plugin
      await loadedPlugin.plugin.unload();

      // Cleanup security sandbox
      if (loadedPlugin.sandboxed && loadedPlugin.worker) {
        await this.securityManager.destroySandbox(name);
      }

      // Unregister from resource monitoring
      this.resourceMonitor.unregisterPlugin(name);

      // Unregister from health monitoring
      this.healthMonitor.unregisterPlugin(name);

      // Remove hooks and APIs
      await this.unregisterPluginIntegrations(loadedPlugin.plugin, loadedPlugin.manifest);

      // Remove from storage
      this.plugins.delete(name);

      this.emit('unloaded', name);
      return true;

    } catch (_error) {
      this.emit('error', name, {message = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin notfound = loadedPlugin.manifest.entryPoints.main;
    const originalConfig = { ...loadedPlugin.config };

    await this.unloadPlugin(name);
    await this.loadPlugin(originalPath, originalConfig);

    this.emit('restarted', name);
  }

  async enablePlugin(name = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin notfound = true;
    await loadedPlugin.plugin.start();
  }

  async disablePlugin(name = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin notfound = false;
    await loadedPlugin.plugin.stop();
  }

  // Plugin discovery and management
  async getPlugin(name = this.plugins.get(name);
    return loadedPlugin?.plugin || null;
  }

  async getAllPlugins(): Promise<Plugin[]> {
    return Array.from(this.plugins.values()).map(lp => lp.plugin);
  }

  async getActivePlugins(): Promise<Plugin[]> {
    return Array.from(this.plugins.values())
      .filter(lp => lp.config.enabled && lp.plugin.metadata.status === 'active')
      .map(lp => lp.plugin);
  }

  async getPluginsByType(type = > lp.manifest.type === type)
      .map(lp => lp.plugin);
  }

  async discoverPlugins(directory = [];

    try {
      const entries = await readdir(directory, {withFileTypes = entries.filter(entry => entry.isDirectory());

      for (const dir of pluginDirs) {
        const pluginPath = join(directory, dir.name);
        try {
          const result = await this.discoverSinglePlugin(pluginPath);
          results.push(result);
        } catch (error) {
          results.push({manifest = > r.valid).map(r => r.manifest);
  }

  async installPlugin(source = this.hooks.get(type) || [];
    const results = [];

    for (const hook of hooks.sort((a, b) => b.options.priority - a.options.priority)) {
      try {
        const startTime = performance.now();
        const result = await Promise.race([
          hook.handler(context),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Hook timeout')), hook.options.timeout || 5000)
          )
        ]);

        const executionTime = performance.now() - startTime;
        
        // Update hook metrics
        hook.callCount++;
        hook.averageExecutionTime = 
          (hook.averageExecutionTime * (hook.callCount - 1) + executionTime) / hook.callCount;
        hook.lastCalled = new Date();

        results.push(result);

        this.emit('hook-executed', hook.pluginName, type, executionTime);

        if (result.stop) {
          break;
        }
      } catch (error) {
        hook.errorCount++;
        this.emit('hook-failed', hook.pluginName, type, {message = this.apis.get(pluginName);
    return pluginAPIs?.get(apiName) || null;
  }

  async callAPI(pluginName = await this.getAPI(pluginName, apiName);
    if (!api) {
      throw new Error(`API notfound = await this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin notfound = [];
    
    for (const [pluginName, pluginAPIs] of this.apis) {
      for (const [apiName, api] of pluginAPIs) {
        results.push({plugin = Array.from(this.plugins.values());

    const errorPlugins = plugins.filter(p => p.plugin.metadata.status === 'error').length;

    const memoryUsage = await this.resourceMonitor.getMemoryUsage();

    const issues = await this.collectSystemIssues();
    const status = errorPlugins === 0 ? 'healthy' : errorPlugins < plugins.length * 0.1 ? 'degraded' : 'critical';

    return {
      status,pluginCount = name ? 
      [this.plugins.get(name)].filter(Boolean) : 
      Array.from(this.plugins.values());

    const results = [];
    
    for (const loadedPlugin of targetPlugins) {
      if (loadedPlugin) {
        const metrics = await loadedPlugin.plugin.getMetrics();
        results.push(metrics);
      }
    }

    return results;
  }

  async performHealthCheck(): Promise<PluginHealthReport> {
    const plugins = {};
    const systemHealth = await this.getSystemHealth();

    for (const [name, loadedPlugin] of this.plugins) {
      try {
        plugins[name] = await loadedPlugin.plugin.healthCheck();
        loadedPlugin.lastHealthCheck = new Date();
      } catch (error) {
        plugins[name] = {status = Object.values(plugins).filter(h => h.status === 'healthy').length;

    const criticalIssues = Object.values(plugins)
      .flatMap(h => h.issues)
      .filter(i => i.severity === 'critical').length;

    return {overall = > i.issue)
      },summary = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin notfound = this.plugins.get(name);
    return loadedPlugin?.config || null;
  }

  async validatePluginConfig(name = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin notfound = this.plugins.get(pluginName);
    if (!loadedPlugin) {
      return false;
    }

    return loadedPlugin.permissions.has(permission);
  }

  async grantPermission(pluginName = this.plugins.get(pluginName);
    if (!loadedPlugin) {
      throw new Error(`Plugin notfound = this.plugins.get(pluginName);
    if (!loadedPlugin) {
      throw new Error(`Plugin notfound = loadedPlugin.config.permissions.indexOf(permission);
    if (index > -1) {
      loadedPlugin.config.permissions.splice(index, 1);
    }
  }

  async auditPermissions(): Promise<PermissionAuditReport> {
    return await this.permissionAuditor.generateReport();
  }

  // Private implementation methods
  private async loadPluginModule(path = join(path, manifest.entryPoints.main);
    
    // Check if file exists and is accessible
    await access(entryPoint);
    
    // Dynamic import with error handling
    try {
      const module = await import(resolve(entryPoint));
      return module;
    } catch (error) {
      throw new Error(`Failed to load plugin module from ${entryPoint}: ${error.message}`);
    }
  }

  private extractManifest(packageJson = packageJson.claudePlugin || {};
    
    return {name = 14.0.0',npm = [];

    // Required fields
    if (!_manifest._name) errors.push('Missing requiredfield = [
      'ai-provider', 'architect-advisor', 'security-auth', 'notifications',
      'export-system', 'documentation-linker', 'workflow-engine', 'github-integration',
      'memory-backend', 'performance-monitor', 'code-analysis', 'test-runner',
      'database-connector', 'neural-processor', 'vision-processor', 'custom'
    ];
    
    if (!validTypes.includes(manifest.type)) {
      errors.push(`Invalid plugin type = { ...this.systemContext };
    context.plugin = null as any; // Will be set after plugin instantiation
    context.config = config;
    context.manifest = manifest;
    context.security = {permissions = await this.securityManager.createSandboxedPlugin(plugin, manifest, config);
      if (!worker) {
        throw new Error('Failed to create sandboxed worker');
      }

      // Register plugin with resource monitor
      this.resourceMonitor.registerPlugin(manifest.name, manifest, config, worker);

      return worker;
    } catch (error = hooks.filter(h => h.pluginName !== manifest.name);
      if (remainingHooks.length === 0) {
        this.hooks.delete(hookType);
      } else {
        this.hooks.set(hookType, remainingHooks);
      }
    }

    // Unregister APIs
    this.apis.delete(manifest.name);
  }

  private async discoverSinglePlugin(pluginPath = join(pluginPath, 'package.json');
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const packageJson = JSON.parse(manifestContent);
      const manifest = this.extractManifest(packageJson, pluginPath);
      
      await this.validateManifest(manifest);
      
      return {
        manifest,
        path => {
      const loadedPlugin = this.plugins.get(pluginName);
      if (loadedPlugin && this.config.autoRestart) {
        await this.attemptPluginRestart(pluginName, loadedPlugin);
      }
    });
  }

  private async attemptPluginRestart(pluginName = this.config.maxRestartAttempts) {
      this.emit('plugin-restart-failed', pluginName, 'Max restart attempts exceeded');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, this.config.restartDelay));
      await this.reloadPlugin(pluginName);
      this.emit('plugin-restarted', pluginName);
    } catch (error) {
      this.emit('plugin-restart-failed', pluginName, error.message);
    }
  }

  private startBackgroundTasks(): void {
    if (this.config.enableHealthMonitoring) {
      setInterval(() => {
        this.performHealthCheck().catch(error => {
          this.emit('health-check-failed', error.message);
        });
      }, this.config.healthCheckInterval);
    }

    if (this.config.enableMetrics) {
      setInterval(() => {
        this.resourceMonitor.collectMetrics().catch(error => {
          this.emit('metrics-collection-failed', error.message);
        });
      }, this.config.resourceCheckInterval);
    }
  }

  private async collectSystemIssues(): Promise<Array<{plugin = [];

    for (const [name, loadedPlugin] of this.plugins) {
      const health = await loadedPlugin.plugin.healthCheck();
      
      for (const issue of health.issues) {
        issues.push({plugin = [];
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    
    if (criticalIssues.length > 0) {
      recommendations.push(`Immediately address ${criticalIssues.length} critical issue(s)`);
    }
    
    if (highIssues.length > 0) {
      recommendations.push(`Review and fix ${highIssues.length} high priority issue(s)`);
    }
    
    return recommendations;
  }

  // Security and Resource Event Handlers
  private setupSecurityEventHandlers(): void {
    this.securityManager.on('security-violation', (violation) => {
      this.emit('security-violation', violation);
      
      // Take action based on severity
      if (violation.blocked) {
        this.emit('plugin-blocked', {
          pluginName => {
      this.emit('plugin-sandboxed', data);
    });

    this.securityManager.on('plugin-quarantined', (data) => {
      this.emit('plugin-quarantined', data);
    });

    this.securityManager.on('permission-audit', (audit) => {
      this.emit('permission-audit', audit);
    });
  }

  private setupResourceEventHandlers(): void {
    this.resourceMonitor.on('resource-alert', (alert) => {
      this.emit('resource-alert', alert);
      
      // Log critical alerts
      if (alert.alertType === 'critical') {
        console.error(`Critical resource alert for ${alert.pluginName}: ${alert.message}`);
      }
    });

    this.resourceMonitor.on('resource-enforcement', (enforcement) => {
      this.emit('resource-enforcement', enforcement);
      
      console.warn(`Resource enforcement action for ${enforcement.pluginName}: ${enforcement.action} - ${enforcement.reason}`);
    });

    this.resourceMonitor.on('plugin-terminated', async (data) => {
      this.emit('plugin-terminated', data);
      
      // Clean up terminated plugin
      const pluginData = this.plugins.get(data.pluginName);
      if (pluginData) {
        pluginData.plugin.status = 'stopped';
        await this.unregisterPluginIntegrations(pluginData.plugin, pluginData.manifest);
      }
    });

    this.resourceMonitor.on('plugin-quarantined', (data) => {
      this.emit('plugin-quarantined', data);
    });

    this.resourceMonitor.on('monitoring-error', (_error) => {
      console.error('Resource monitoring error => {
      this.emit('health-check-completed', data);
    });

    this.healthMonitor.on('health-check-failed', (data) => {
      this.emit('health-check-failed', data);
      
      // Consider auto-restart for critical health failures
      if (data.consecutiveFailures >= 3 && this.config.autoRestart) {
        this.emit('auto-restart-triggered', { pluginName => {
      this.emit('health-alert', alert);
      
      if (alert.severity === 'critical') {
        console.error(`Critical health alert for ${alert.pluginName}: ${alert.message || 'Health threshold exceeded'}`);
      }
    });

    this.healthMonitor.on('health-trend-alert', (trendAlert) => {
      this.emit('health-trend-alert', trendAlert);
      
      if (trendAlert.trend.trend === 'critical') {
        console.warn(`Critical health trend detected for ${trendAlert.pluginName}: ${trendAlert.trend.metric} trending ${trendAlert.trend.trend}`);
      }
    });

    this.healthMonitor.on('system-health-updated', (systemHealth) => {
      this.emit('system-health-updated', systemHealth);
      
      if (systemHealth.overall === 'critical') {
        console.error(`System health is critical => {
      this.emit('automatic-recovery-triggered', data);
      
      if (this.config.autoRestart) {
        try {
          await this.restartPlugin(data.pluginName);
          console.info(`Auto-restarted plugin ${data.pluginName} due to health issues`);
        } catch (error => {
      this.emit('plugin-metrics-collected', data);
    });

    this.healthMonitor.on('metrics-error', (error) => {
      console.error('Health metrics collectionerror = this.plugins.get(pluginName);
    if (!pluginData) {
      return {isValid = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024; // MB
  }
  
  async getSystemResourceUsage(): Promise<ResourceUsage> {
    return {memory = new Map<string, any>();
  
  async get(key = `${namespace || 'default'}:`;
    return Array.from(this.storage.keys()).filter(k => k.startsWith(prefix));
  }
  
  async clear(namespace?: string): Promise<void> 
    if (namespace) {
      const prefix = `${namespace}:`;
      for (const key of this.storage.keys()) {
        if (key.startsWith(prefix)) {
          this.storage.delete(key);
        }
      }
    } else {
      this.storage.clear();
    }
}

class EventAPI implements PluginEventAPI {
  constructor(private emitter = > void): Promise<void> {
    this.emitter.on(event, handler);
  }
  
  async off(event = > void): Promise<void> {
    this.emitter.off(event, handler);
  }
  
  async once(event = > void): Promise<void> {
    this.emitter.once(event, handler);
  }
}

// Placeholder implementations for other APIs
class HttpAPI implements PluginHttpAPI {
  async request(): Promise<any> { throw new Error('Not implemented'); }
  async get(): Promise<any> { throw new Error('Not implemented'); }
  async post(): Promise<any> { throw new Error('Not implemented'); }
  async put(): Promise<any> { throw new Error('Not implemented'); }
  async delete(): Promise<any> { throw new Error('Not implemented'); }
}

class FilesystemAPI implements PluginFilesystemAPI {
  async readFile(): Promise<Buffer> { throw new Error('Not implemented'); }
  async writeFile(): Promise<void> { throw new Error('Not implemented'); }
  async exists(): Promise<boolean> { throw new Error('Not implemented'); }
  async mkdir(): Promise<void> { throw new Error('Not implemented'); }
  async readdir(): Promise<string[]> { throw new Error('Not implemented'); }
  async stat(): Promise<any> { throw new Error('Not implemented'); }
  async watch(): Promise<void> { throw new Error('Not implemented'); }
}

class DatabaseAPI implements PluginDatabaseAPI {
  async query(): Promise<any[]> { throw new Error('Not implemented'); }
  async execute(): Promise<any> { throw new Error('Not implemented'); }
  async transaction(): Promise<any[]> { throw new Error('Not implemented'); }
}

class CacheAPI implements PluginCacheAPI {
  async get(): Promise<any> { throw new Error('Not implemented'); }
  async set(): Promise<void> { throw new Error('Not implemented'); }
  async delete(): Promise<boolean> { throw new Error('Not implemented'); }
  async clear(): Promise<void> { throw new Error('Not implemented'); }
  async keys(): Promise<string[]> { throw new Error('Not implemented'); }
  async size(): Promise<number> { throw new Error('Not implemented'); }
}

class QueueAPI implements PluginQueueAPI {
  async enqueue(): Promise<string> { throw new Error('Not implemented'); }
  async dequeue(): Promise<any> { throw new Error('Not implemented'); }
  async ack(): Promise<void> { throw new Error('Not implemented'); }
  async nack(): Promise<void> { throw new Error('Not implemented'); }
  async getQueueSize(): Promise<number> { throw new Error('Not implemented'); }
}

class SecretsAPI implements PluginSecretsAPI {
  async get(): Promise<string | null> { throw new Error('Not implemented'); }
  async set(): Promise<void> { throw new Error('Not implemented'); }
  async delete(): Promise<boolean> { throw new Error('Not implemented'); }
  async list(): Promise<string[]> { throw new Error('Not implemented'); }
}

interface PluginManagerConfig {
  pluginDir: string;
  maxPlugins: number;
  maxMemoryPerPlugin: number;
  maxCpuPerPlugin: number;
  enableSandboxing: boolean;
  enableHealthMonitoring: boolean;
  healthCheckInterval: number;
  resourceCheckInterval: number;
  enableMetrics: boolean;
  enableSecurity: boolean;
  autoRestart: boolean;
  maxRestartAttempts: number;
  restartDelay: number;
  permissionAuditInterval: number;
}

export default PluginManager;
