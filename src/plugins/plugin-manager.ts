/**
 * Enhanced Plugin Manager (TypeScript)
 * Advanced plugin lifecycle management with health monitoring, security, and metrics
 */

import { EventEmitter } from 'events';
import { readdir, readFile, access, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { Worker } from 'worker_threads';
import {
  PluginManager as IPluginManager,
  Plugin,
  PluginConfig,
  PluginManifest,
  PluginMetadata,
  PluginContext,
  PluginHealthResult,
  PluginHealthReport,
  PluginSystemHealth,
  PluginMetrics,
  PluginDiagnostics,
  PluginTestResult,
  PluginEvents,
  PluginType,
  PluginStatus,
  PluginPermission,
  HookType,
  HookContext,
  HookResult,
  RegisteredHook,
  PluginAPI,
  ResourceUsage,
  ValidationResult,
  PermissionAuditReport,
  JSONObject
} from '../types/plugin.js';
import {
  PluginLogger,
  PluginMemoryAPI,
  PluginEventAPI,
  PluginHttpAPI,
  PluginFilesystemAPI,
  PluginDatabaseAPI,
  PluginCacheAPI,
  PluginQueueAPI,
  PluginSecretsAPI
} from '../types/plugin.js';
import { BasePlugin } from './base-plugin.js';
import { performance } from 'perf_hooks';
import crypto from 'crypto';
import SecurityManager from './security-manager.js';
import ResourceMonitor from './resource-monitor.js';
import HealthMonitor from './health-monitor.js';

interface LoadedPlugin {
  plugin: Plugin;
  manifest: PluginManifest;
  config: PluginConfig;
  worker?: Worker;
  sandboxed: boolean;
  lastHealthCheck: Date;
  permissions: Set<PluginPermission>;
}

interface PluginDiscoveryResult {
  manifest: PluginManifest;
  path: string;
  valid: boolean;
  errors: string[];
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

export class PluginManager extends EventEmitter implements IPluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private hooks: Map<HookType, RegisteredHook[]> = new Map();
  private apis: Map<string, Map<string, PluginAPI>> = new Map(); // pluginName -> apiName -> API
  private resourceMonitor: ResourceMonitor;
  private securityManager: SecurityManager;
  private healthMonitor: HealthMonitor;

  private readonly config: PluginManagerConfig;
  private readonly systemContext: PluginContext;

  constructor(config: Partial<PluginManagerConfig> = {}) {
    super();

    this.config = {
      pluginDir: './src/plugins',
      maxPlugins: 100,
      maxMemoryPerPlugin: 512, // MB
      maxCpuPerPlugin: 50, // percentage
      enableSandboxing: true,
      enableHealthMonitoring: true,
      healthCheckInterval: 30000, // 30 seconds
      resourceCheckInterval: 5000, // 5 seconds
      enableMetrics: true,
      enableSecurity: true,
      autoRestart: true,
      maxRestartAttempts: 3,
      restartDelay: 1000,
      permissionAuditInterval: 300000, // 5 minutes
      ...config
    };

    // Initialize system context
    this.systemContext = this.createSystemContext();

    // Initialize security and monitoring systems
    this.securityManager = new SecurityManager({
      enableSecurity: this.config.enableSecurity,
      isolateMemory: this.config.enableSandboxing,
      isolateCpu: this.config.enableSandboxing,
      isolateNetwork: false,
      isolateFilesystem: this.config.enableSandboxing,
      maxWorkers: this.config.maxPlugins,
      workerTimeout: 30000
    });

    this.resourceMonitor = new ResourceMonitor({
      enabled: this.config.enableHealthMonitoring,
      interval: this.config.resourceCheckInterval,
      enforcementEnabled: this.config.enableSecurity,
      alertThresholds: {
        memory: { warning: 75, critical: 90 },
        cpu: { warning: this.config.maxCpuPerPlugin * 0.8, critical: this.config.maxCpuPerPlugin },
        disk: { warning: 50, critical: 100 },
        network: { warning: 1000, critical: 2000 }
      }
    });

    this.healthMonitor = new HealthMonitor({
      enabled: this.config.enableHealthMonitoring,
      healthCheckInterval: this.config.healthCheckInterval,
      metricsInterval: 10000, // 10 seconds
      enablePredictive: true,
      enableAutomaticRecovery: this.config.autoRestart
    });

    // Set up event handlers
    this.setupSecurityEventHandlers();
    this.setupResourceEventHandlers();
    this.setupHealthEventHandlers();
    this.startBackgroundTasks();
  }

  // Plugin lifecycle management
  async loadPlugin(path: string, config?: PluginConfig): Promise<Plugin> {
    try {
      const manifestPath = join(path, 'package.json');
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const packageJson = JSON.parse(manifestContent);

      // Extract plugin manifest from package.json
      const manifest: PluginManifest = this.extractManifest(packageJson, path);
      
      // Validate manifest
      await this.validateManifest(manifest);

      // Create plugin configuration
      const pluginConfig: PluginConfig = {
        name: manifest.name,
        version: manifest.version,
        enabled: true,
        autoLoad: true,
        settings: manifest.configuration.defaults,
        environment: {},
        resources: {
          memory: Math.min(this.config.maxMemoryPerPlugin, 256),
          cpu: Math.min(this.config.maxCpuPerPlugin, 25),
          disk: 100,
          network: true
        },
        permissions: [],
        sandbox: this.config.enableSandboxing,
        trustedDomains: [],
        hooks: {},
        monitoring: {
          enabled: this.config.enableHealthMonitoring,
          metrics: this.config.enableMetrics,
          logging: true,
          performance: true,
          errors: true
        },
        development: {
          hotReload: false,
          debugMode: false,
          profiling: false,
          sourceMaps: true
        },
        ...config
      };

      // Load plugin class
      const pluginModule = await this.loadPluginModule(path, manifest);
      const PluginClass = pluginModule.default || pluginModule[manifest.name] || pluginModule;

      // Create plugin context
      const context = this.createPluginContext(manifest, pluginConfig);

      // Instantiate plugin
      const plugin: Plugin = new PluginClass(manifest, pluginConfig, context);

      // Security validation
      await this.securityManager.validatePlugin(plugin, manifest, pluginConfig);

      // Create loaded plugin entry
      const loadedPlugin: LoadedPlugin = {
        plugin,
        manifest,
        config: pluginConfig,
        sandboxed: pluginConfig.sandbox,
        lastHealthCheck: new Date(),
        permissions: new Set(pluginConfig.permissions)
      };

      // Setup sandboxing if enabled
      if (pluginConfig.sandbox) {
        loadedPlugin.worker = await this.createSandboxWorker(plugin, manifest, pluginConfig);
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

    } catch (error) {
      this.emit('error', path, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async unloadPlugin(name: string): Promise<boolean> {
    const loadedPlugin = this.plugins.get(name);
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

    } catch (error) {
      this.emit('error', name, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async reloadPlugin(name: string): Promise<void> {
    const loadedPlugin = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    const originalPath = loadedPlugin.manifest.entryPoints.main;
    const originalConfig = { ...loadedPlugin.config };

    await this.unloadPlugin(name);
    await this.loadPlugin(originalPath, originalConfig);

    this.emit('restarted', name);
  }

  async enablePlugin(name: string): Promise<void> {
    const loadedPlugin = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    if (loadedPlugin.config.enabled) {
      return;
    }

    loadedPlugin.config.enabled = true;
    await loadedPlugin.plugin.start();
  }

  async disablePlugin(name: string): Promise<void> {
    const loadedPlugin = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    if (!loadedPlugin.config.enabled) {
      return;
    }

    loadedPlugin.config.enabled = false;
    await loadedPlugin.plugin.stop();
  }

  // Plugin discovery and management
  async getPlugin(name: string): Promise<Plugin | null> {
    const loadedPlugin = this.plugins.get(name);
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

  async getPluginsByType(type: PluginType): Promise<Plugin[]> {
    return Array.from(this.plugins.values())
      .filter(lp => lp.manifest.type === type)
      .map(lp => lp.plugin);
  }

  async discoverPlugins(directory: string): Promise<PluginManifest[]> {
    const results: PluginDiscoveryResult[] = [];

    try {
      const entries = await readdir(directory, { withFileTypes: true });
      const pluginDirs = entries.filter(entry => entry.isDirectory());

      for (const dir of pluginDirs) {
        const pluginPath = join(directory, dir.name);
        try {
          const result = await this.discoverSinglePlugin(pluginPath);
          results.push(result);
        } catch (error) {
          results.push({
            manifest: null as any,
            path: pluginPath,
            valid: false,
            errors: [error.message]
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to discover plugins in ${directory}: ${error.message}`);
    }

    return results.filter(r => r.valid).map(r => r.manifest);
  }

  async installPlugin(source: string): Promise<Plugin> {
    // Implementation would handle installing from various sources (npm, git, local)
    throw new Error('Plugin installation not yet implemented');
  }

  async uninstallPlugin(name: string): Promise<boolean> {
    await this.unloadPlugin(name);
    // Would also remove plugin files
    return true;
  }

  async updatePlugin(name: string): Promise<Plugin> {
    // Implementation would handle updating plugins
    throw new Error('Plugin updates not yet implemented');
  }

  // Hook management
  async executeHooks(type: HookType, context: HookContext): Promise<HookResult[]> {
    const hooks = this.hooks.get(type) || [];
    const results: HookResult[] = [];

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
        this.emit('hook-failed', hook.pluginName, type, {
          message: error.message,
          stack: error.stack,
          timestamp: new Date()
        });
        
        if (hook.options.retries > 0) {
          // Retry logic would be implemented here
        }
      }
    }

    return results;
  }

  async getHooks(type?: HookType): Promise<RegisteredHook[]> {
    if (type) {
      return this.hooks.get(type) || [];
    }
    
    return Array.from(this.hooks.values()).flat();
  }

  // API management
  async getAPI(pluginName: string, apiName: string): Promise<PluginAPI | null> {
    const pluginAPIs = this.apis.get(pluginName);
    return pluginAPIs?.get(apiName) || null;
  }

  async callAPI(pluginName: string, apiName: string, method: string, args: any[]): Promise<any> {
    const api = await this.getAPI(pluginName, apiName);
    if (!api) {
      throw new Error(`API not found: ${pluginName}.${apiName}`);
    }

    const plugin = await this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    return await plugin.callAPI(apiName, method, args);
  }

  async getAllAPIs(): Promise<Array<{ plugin: string; api: PluginAPI }>> {
    const results: Array<{ plugin: string; api: PluginAPI }> = [];
    
    for (const [pluginName, pluginAPIs] of this.apis) {
      for (const [apiName, api] of pluginAPIs) {
        results.push({ plugin: pluginName, api });
      }
    }
    
    return results;
  }

  // Health and monitoring
  async getSystemHealth(): Promise<PluginSystemHealth> {
    const plugins = Array.from(this.plugins.values());
    const activePlugins = plugins.filter(p => p.config.enabled).length;
    const errorPlugins = plugins.filter(p => p.plugin.metadata.status === 'error').length;
    
    const totalThroughput = plugins.reduce((sum, p) => 
      sum + (p.plugin.metadata.metrics?.throughput || 0), 0);
    
    const averageResponseTime = plugins.reduce((sum, p) => 
      sum + (p.plugin.metadata.metrics?.averageExecutionTime || 0), 0) / plugins.length;

    const systemLoad = await this.resourceMonitor.getSystemLoad();
    const memoryUsage = await this.resourceMonitor.getMemoryUsage();

    const issues = await this.collectSystemIssues();
    const status = errorPlugins === 0 ? 'healthy' : errorPlugins < plugins.length * 0.1 ? 'degraded' : 'critical';

    return {
      status,
      pluginCount: plugins.length,
      activePlugins,
      errorPlugins,
      performance: {
        averageResponseTime,
        totalThroughput,
        systemLoad,
        memoryUsage
      },
      issues,
      recommendations: this.generateSystemRecommendations(issues)
    };
  }

  async getPluginMetrics(name?: string): Promise<PluginMetrics[]> {
    const targetPlugins = name ? 
      [this.plugins.get(name)].filter(Boolean) : 
      Array.from(this.plugins.values());

    const results: PluginMetrics[] = [];
    
    for (const loadedPlugin of targetPlugins) {
      if (loadedPlugin) {
        const metrics = await loadedPlugin.plugin.getMetrics();
        results.push(metrics);
      }
    }

    return results;
  }

  async performHealthCheck(): Promise<PluginHealthReport> {
    const plugins: { [name: string]: PluginHealthResult } = {};
    const systemHealth = await this.getSystemHealth();

    for (const [name, loadedPlugin] of this.plugins) {
      try {
        plugins[name] = await loadedPlugin.plugin.healthCheck();
        loadedPlugin.lastHealthCheck = new Date();
      } catch (error) {
        plugins[name] = {
          status: 'unhealthy',
          score: 0,
          issues: [{
            severity: 'critical',
            message: `Health check failed: ${error.message}`,
            component: 'system'
          }],
          metrics: {},
          lastCheck: new Date()
        };
      }
    }

    const healthyCount = Object.values(plugins).filter(h => h.status === 'healthy').length;
    const degradedCount = Object.values(plugins).filter(h => h.status === 'degraded').length;
    const unhealthyCount = Object.values(plugins).filter(h => h.status === 'unhealthy').length;
    const criticalIssues = Object.values(plugins)
      .flatMap(h => h.issues)
      .filter(i => i.severity === 'critical').length;

    return {
      overall: systemHealth.status,
      timestamp: new Date(),
      plugins,
      system: {
        resourceUsage: await this.resourceMonitor.getSystemResourceUsage(),
        performance: {
          averageResponseTime: systemHealth.performance.averageResponseTime,
          totalThroughput: systemHealth.performance.totalThroughput
        },
        errors: systemHealth.issues.map(i => i.issue)
      },
      summary: {
        totalPlugins: this.plugins.size,
        healthyPlugins: healthyCount,
        degradedPlugins: degradedCount,
        unhealthyPlugins: unhealthyCount,
        criticalIssues
      }
    };
  }

  // Configuration management
  async updatePluginConfig(name: string, updates: Partial<PluginConfig>): Promise<void> {
    const loadedPlugin = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    await loadedPlugin.plugin.configure(updates);
    Object.assign(loadedPlugin.config, updates);
  }

  async getPluginConfig(name: string): Promise<PluginConfig | null> {
    const loadedPlugin = this.plugins.get(name);
    return loadedPlugin?.config || null;
  }

  async validatePluginConfig(name: string, config: PluginConfig): Promise<ValidationResult[]> {
    const loadedPlugin = this.plugins.get(name);
    if (!loadedPlugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    return await loadedPlugin.plugin.validateConfiguration(config);
  }

  // Security and permissions
  async checkPermission(pluginName: string, permission: PluginPermission): Promise<boolean> {
    const loadedPlugin = this.plugins.get(pluginName);
    if (!loadedPlugin) {
      return false;
    }

    return loadedPlugin.permissions.has(permission);
  }

  async grantPermission(pluginName: string, permission: PluginPermission): Promise<void> {
    const loadedPlugin = this.plugins.get(pluginName);
    if (!loadedPlugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    loadedPlugin.permissions.add(permission);
    
    // Update plugin configuration
    if (!loadedPlugin.config.permissions.includes(permission)) {
      loadedPlugin.config.permissions.push(permission);
    }
  }

  async revokePermission(pluginName: string, permission: PluginPermission): Promise<void> {
    const loadedPlugin = this.plugins.get(pluginName);
    if (!loadedPlugin) {
      throw new Error(`Plugin not found: ${pluginName}`);
    }

    loadedPlugin.permissions.delete(permission);
    
    // Update plugin configuration
    const index = loadedPlugin.config.permissions.indexOf(permission);
    if (index > -1) {
      loadedPlugin.config.permissions.splice(index, 1);
    }
  }

  async auditPermissions(): Promise<PermissionAuditReport> {
    return await this.permissionAuditor.generateReport();
  }

  // Private implementation methods
  private async loadPluginModule(path: string, manifest: PluginManifest): Promise<any> {
    const entryPoint = join(path, manifest.entryPoints.main);
    
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

  private extractManifest(packageJson: any, path: string): PluginManifest {
    const claudePlugin = packageJson.claudePlugin || {};
    
    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description || '',
      type: claudePlugin.type || 'custom',
      author: packageJson.author || '',
      license: packageJson.license || '',
      homepage: packageJson.homepage,
      repository: packageJson.repository?.url,
      dependencies: {
        system: claudePlugin.dependencies?.system || [],
        plugins: claudePlugin.dependencies?.plugins || {},
        node: packageJson.engines?.node || '>=14.0.0',
        npm: packageJson.dependencies || {}
      },
      capabilities: {
        hooks: claudePlugin.capabilities?.hooks || [],
        apis: claudePlugin.capabilities?.apis || [],
        permissions: claudePlugin.capabilities?.permissions || [],
        resources: claudePlugin.capabilities?.resources || [],
        platforms: claudePlugin.capabilities?.platforms || ['linux', 'darwin', 'win32'],
        languages: claudePlugin.capabilities?.languages || ['javascript', 'typescript']
      },
      configuration: {
        schema: claudePlugin.configuration?.schema || {},
        defaults: claudePlugin.configuration?.defaults || {},
        required: claudePlugin.configuration?.required || [],
        sensitive: claudePlugin.configuration?.sensitive || []
      },
      entryPoints: {
        main: claudePlugin.entryPoints?.main || 'index.js',
        worker: claudePlugin.entryPoints?.worker,
        hooks: claudePlugin.entryPoints?.hooks,
        cli: claudePlugin.entryPoints?.cli,
        web: claudePlugin.entryPoints?.web
      },
      assets: {
        files: claudePlugin.assets?.files || [],
        directories: claudePlugin.assets?.directories || [],
        templates: claudePlugin.assets?.templates || [],
        schemas: claudePlugin.assets?.schemas || []
      },
      keywords: packageJson.keywords || [],
      category: claudePlugin.category || 'general',
      maturity: claudePlugin.maturity || 'beta',
      compatibility: {
        minVersion: claudePlugin.compatibility?.minVersion || '1.0.0',
        maxVersion: claudePlugin.compatibility?.maxVersion,
        breaking: claudePlugin.compatibility?.breaking || []
      }
    };
  }

  private async validateManifest(manifest: PluginManifest): Promise<void> {
    const errors: string[] = [];

    // Required fields
    if (!manifest.name) errors.push('Missing required field: name');
    if (!manifest.version) errors.push('Missing required field: version');
    if (!manifest.type) errors.push('Missing required field: type');

    // Validate plugin type
    const validTypes: PluginType[] = [
      'ai-provider', 'architect-advisor', 'security-auth', 'notifications',
      'export-system', 'documentation-linker', 'workflow-engine', 'github-integration',
      'memory-backend', 'performance-monitor', 'code-analysis', 'test-runner',
      'database-connector', 'neural-processor', 'vision-processor', 'custom'
    ];
    
    if (!validTypes.includes(manifest.type)) {
      errors.push(`Invalid plugin type: ${manifest.type}`);
    }

    if (errors.length > 0) {
      throw new Error(`Invalid plugin manifest: ${errors.join(', ')}`);
    }
  }

  private createSystemContext(): PluginContext {
    return {
      plugin: null as any, // Will be set per plugin
      config: null as any, // Will be set per plugin
      manifest: null as any, // Will be set per plugin
      system: {
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        instanceId: crypto.randomUUID(),
        startTime: new Date()
      },
      apis: {
        logger: new ConsoleLogger(),
        memory: new InMemoryAPI(),
        events: new EventAPI(this),
        http: new HttpAPI(),
        filesystem: new FilesystemAPI(),
        database: new DatabaseAPI(),
        cache: new CacheAPI(),
        queue: new QueueAPI(),
        secrets: new SecretsAPI()
      },
      hooks: null as any, // Will be set per plugin
      router: null as any, // Will be set per plugin
      scheduler: null as any, // Will be set per plugin
      metrics: null as any, // Will be set per plugin
      security: {
        permissions: [],
        sandbox: false
      },
      resources: {
        allocated: {
          memory: 0,
          cpu: 0,
          disk: 0,
          network: 0,
          handles: 0,
          timestamp: new Date()
        },
        limits: [],
        monitoring: true
      }
    };
  }

  private createPluginContext(manifest: PluginManifest, config: PluginConfig): PluginContext {
    const context = { ...this.systemContext };
    context.plugin = null as any; // Will be set after plugin instantiation
    context.config = config;
    context.manifest = manifest;
    context.security = {
      permissions: config.permissions,
      sandbox: config.sandbox,
      userId: undefined,
      sessionId: undefined,
      requestId: undefined
    };
    return context;
  }

  private async createSandboxWorker(plugin: Plugin, manifest: PluginManifest, config: PluginConfig): Promise<Worker> {
    if (!this.config.enableSandboxing) {
      throw new Error('Sandboxing is disabled');
    }

    try {
      const worker = await this.securityManager.createSandboxedPlugin(plugin, manifest, config);
      if (!worker) {
        throw new Error('Failed to create sandboxed worker');
      }

      // Register plugin with resource monitor
      this.resourceMonitor.registerPlugin(manifest.name, manifest, config, worker);

      return worker;
    } catch (error: any) {
      this.emit('error', manifest.name, error);
      throw error;
    }
  }

  private async registerPluginIntegrations(plugin: Plugin, manifest: PluginManifest): Promise<void> {
    // Register plugin APIs
    if (!this.apis.has(manifest.name)) {
      this.apis.set(manifest.name, new Map());
    }

    // Would register actual plugin hooks and APIs here
  }

  private async unregisterPluginIntegrations(plugin: Plugin, manifest: PluginManifest): Promise<void> {
    // Unregister hooks
    for (const [hookType, hooks] of this.hooks) {
      const remainingHooks = hooks.filter(h => h.pluginName !== manifest.name);
      if (remainingHooks.length === 0) {
        this.hooks.delete(hookType);
      } else {
        this.hooks.set(hookType, remainingHooks);
      }
    }

    // Unregister APIs
    this.apis.delete(manifest.name);
  }

  private async discoverSinglePlugin(pluginPath: string): Promise<PluginDiscoveryResult> {
    try {
      const manifestPath = join(pluginPath, 'package.json');
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const packageJson = JSON.parse(manifestContent);
      const manifest = this.extractManifest(packageJson, pluginPath);
      
      await this.validateManifest(manifest);
      
      return {
        manifest,
        path: pluginPath,
        valid: true,
        errors: []
      };
    } catch (error) {
      return {
        manifest: null as any,
        path: pluginPath,
        valid: false,
        errors: [error.message]
      };
    }
  }

  private setupEventListeners(): void {
    // Plugin error handling
    this.on('error', async (pluginName, error) => {
      const loadedPlugin = this.plugins.get(pluginName);
      if (loadedPlugin && this.config.autoRestart) {
        await this.attemptPluginRestart(pluginName, loadedPlugin);
      }
    });
  }

  private async attemptPluginRestart(pluginName: string, loadedPlugin: LoadedPlugin): Promise<void> {
    if (loadedPlugin.plugin.metadata.restartCount >= this.config.maxRestartAttempts) {
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

  private async collectSystemIssues(): Promise<Array<{
    plugin: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    issue: string;
    impact: string;
  }>> {
    const issues: Array<{
      plugin: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      issue: string;
      impact: string;
    }> = [];

    for (const [name, loadedPlugin] of this.plugins) {
      const health = await loadedPlugin.plugin.healthCheck();
      
      for (const issue of health.issues) {
        issues.push({
          plugin: name,
          severity: issue.severity,
          issue: issue.message,
          impact: issue.component
        });
      }
    }

    return issues;
  }

  private generateSystemRecommendations(issues: Array<{
    plugin: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    issue: string;
    impact: string;
  }>): string[] {
    const recommendations: string[] = [];
    
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
          pluginName: violation.pluginName,
          reason: violation.violation,
          severity: violation.severity
        });
      }
    });

    this.securityManager.on('plugin-sandboxed', (data) => {
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

    this.resourceMonitor.on('monitoring-error', (error) => {
      console.error('Resource monitoring error:', error);
    });
  }

  private setupHealthEventHandlers(): void {
    this.healthMonitor.on('health-check-completed', (data) => {
      this.emit('health-check-completed', data);
    });

    this.healthMonitor.on('health-check-failed', (data) => {
      this.emit('health-check-failed', data);
      
      // Consider auto-restart for critical health failures
      if (data.consecutiveFailures >= 3 && this.config.autoRestart) {
        this.emit('auto-restart-triggered', { pluginName: data.pluginName, reason: 'health-check-failures' });
      }
    });

    this.healthMonitor.on('health-alert', (alert) => {
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
        console.error(`System health is critical: ${systemHealth.score}/100`);
      }
    });

    this.healthMonitor.on('automatic-recovery-triggered', async (data) => {
      this.emit('automatic-recovery-triggered', data);
      
      if (this.config.autoRestart) {
        try {
          await this.restartPlugin(data.pluginName);
          console.info(`Auto-restarted plugin ${data.pluginName} due to health issues`);
        } catch (error: any) {
          console.error(`Failed to auto-restart plugin ${data.pluginName}:`, error.message);
        }
      }
    });

    this.healthMonitor.on('metrics-collected', (data) => {
      this.emit('plugin-metrics-collected', data);
    });

    this.healthMonitor.on('metrics-error', (error) => {
      console.error('Health metrics collection error:', error);
    });
  }

  // Security and Resource API Methods
  async validatePluginSecurity(pluginName: string): Promise<ValidationResult> {
    const pluginData = this.plugins.get(pluginName);
    if (!pluginData) {
      return {
        isValid: false,
        errors: ['Plugin not found'],
        warnings: []
      };
    }

    return await this.securityManager.validatePluginSecurity(
      pluginData.plugin,
      pluginData.manifest,
      pluginData.config
    );
  }

  getPluginSecurityStatus(pluginName: string) {
    return this.securityManager.getPluginSecurityStatus(pluginName);
  }

  getPluginResourceUsage(pluginName: string): ResourceUsage | null {
    return this.resourceMonitor.getResourceUsage(pluginName);
  }

  getSystemResourceSummary() {
    return this.resourceMonitor.getSystemResourceSummary();
  }

  getActiveResourceAlerts(pluginName?: string) {
    return this.resourceMonitor.getActiveAlerts(pluginName);
  }

  async generateSecurityReport() {
    return this.securityManager.getSecurityReport();
  }

  async generatePermissionAuditReport(): Promise<PermissionAuditReport> {
    return await this.securityManager.generatePermissionAuditReport();
  }

  acknowledgeResourceAlert(alertId: string): boolean {
    return this.resourceMonitor.acknowledgeAlert(alertId);
  }

  // Health monitoring API methods
  async getPluginHealth(pluginName: string): Promise<PluginHealthResult | null> {
    return await this.healthMonitor.getPluginHealth(pluginName);
  }

  async getPluginHealthReport(pluginName: string): Promise<PluginHealthReport | null> {
    return await this.healthMonitor.getPluginHealthReport(pluginName);
  }

  async getSystemHealth(): Promise<any> {
    return await this.healthMonitor.getSystemHealth();
  }

  getPluginHealthMetrics(pluginName: string, limit?: number) {
    return this.healthMonitor.getPluginMetrics(pluginName, limit);
  }

  async runImmediateHealthCheck(pluginName: string, checkType?: string): Promise<PluginHealthResult | null> {
    return await this.healthMonitor.runImmediateHealthCheck(pluginName, checkType);
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    // Cleanup security manager
    await this.securityManager.cleanup();
    
    // Cleanup resource monitor
    await this.resourceMonitor.cleanup();
    
    // Cleanup health monitor
    await this.healthMonitor.cleanup();
    
    // Cleanup plugins
    for (const [pluginName] of this.plugins) {
      try {
        await this.unloadPlugin(pluginName);
      } catch (error) {
        // Continue cleanup even if individual plugin cleanup fails
      }
    }
    
    this.plugins.clear();
    this.hooks.clear();
    this.apis.clear();
  }
}

// Supporting classes (simplified implementations)
class PermissionAuditor {
  constructor(private manager: PluginManager) {}
  
  async generateReport(): Promise<PermissionAuditReport> {
    // Implementation would generate comprehensive permission audit
    return {
      timestamp: new Date(),
      plugins: {},
      summary: {
        totalPlugins: 0,
        highRiskPlugins: 0,
        permissionViolations: 0,
        recommendations: []
      }
    };
  }
}

class ResourceMonitor {
  constructor(private manager: PluginManager, private config: PluginManagerConfig) {}
  
  async getSystemLoad(): Promise<number> {
    // Implementation would return actual system load
    return 0.5;
  }
  
  async getMemoryUsage(): Promise<number> {
    const usage = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024; // MB
  }
  
  async getSystemResourceUsage(): Promise<ResourceUsage> {
    return {
      memory: await this.getMemoryUsage(),
      cpu: await this.getSystemLoad() * 100,
      disk: 0,
      network: 0,
      handles: 0,
      timestamp: new Date()
    };
  }
  
  async collectMetrics(): Promise<void> {
    // Implementation would collect system metrics
  }
}

class SecurityManager {
  constructor(private config: PluginManagerConfig) {}
  
  async validatePlugin(plugin: Plugin, manifest: PluginManifest, config: PluginConfig): Promise<void> {
    // Implementation would perform security validation
  }
}

class HealthMonitor {
  constructor(private manager: PluginManager, private config: PluginManagerConfig) {}
}

// API implementations (simplified)
class ConsoleLogger implements PluginLogger {
  trace(message: string, meta?: JSONObject): void {
    console.log(`[TRACE] ${message}`, meta);
  }
  debug(message: string, meta?: JSONObject): void {
    console.log(`[DEBUG] ${message}`, meta);
  }
  info(message: string, meta?: JSONObject): void {
    console.log(`[INFO] ${message}`, meta);
  }
  warn(message: string, meta?: JSONObject): void {
    console.warn(`[WARN] ${message}`, meta);
  }
  error(message: string, error?: Error, meta?: JSONObject): void {
    console.error(`[ERROR] ${message}`, error, meta);
  }
  fatal(message: string, error?: Error, meta?: JSONObject): void {
    console.error(`[FATAL] ${message}`, error, meta);
  }
}

class InMemoryAPI implements PluginMemoryAPI {
  private storage = new Map<string, any>();
  
  async get(key: string, namespace?: string): Promise<any> {
    return this.storage.get(`${namespace || 'default'}:${key}`);
  }
  
  async set(key: string, value: any, options?: { ttl?: number; namespace?: string }): Promise<void> {
    this.storage.set(`${options?.namespace || 'default'}:${key}`, value);
  }
  
  async delete(key: string, namespace?: string): Promise<boolean> {
    return this.storage.delete(`${namespace || 'default'}:${key}`);
  }
  
  async exists(key: string, namespace?: string): Promise<boolean> {
    return this.storage.has(`${namespace || 'default'}:${key}`);
  }
  
  async list(namespace?: string): Promise<string[]> {
    const prefix = `${namespace || 'default'}:`;
    return Array.from(this.storage.keys()).filter(k => k.startsWith(prefix));
  }
  
  async clear(namespace?: string): Promise<void> {
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
}

class EventAPI implements PluginEventAPI {
  constructor(private emitter: EventEmitter) {}
  
  async emit(event: string, data: any): Promise<void> {
    this.emitter.emit(event, data);
  }
  
  async on(event: string, handler: (data: any) => void): Promise<void> {
    this.emitter.on(event, handler);
  }
  
  async off(event: string, handler: (data: any) => void): Promise<void> {
    this.emitter.off(event, handler);
  }
  
  async once(event: string, handler: (data: any) => void): Promise<void> {
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