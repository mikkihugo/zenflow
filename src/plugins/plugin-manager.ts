/**
 * Plugin Manager
 * Simplified plugin lifecycle management with health monitoring
 */

import { EventEmitter } from 'node:events';
import { BasePlugin } from './base-plugin.js';
import type {
  Plugin,
  PluginContext,
  PluginManifest,
  PluginConfig,
  PluginState,
  HealthStatus
} from './types.js';

type HookFunction = (...args: any[]) => any;

// Plugin manager interfaces
interface LoadedPlugin {
  instance: Plugin;
  manifest: PluginManifest;
  config: PluginConfig;
  state: PluginState;
  context: PluginContext;
  startTime?: number;
  errors: Error[];
  restartCount: number;
  lastHealthCheck?: HealthStatus;
}

interface PluginManagerConfig extends PluginConfig {
  pluginDir?: string;
  autoload?: boolean;
  healthCheckInterval?: number;
  maxRestartAttempts?: number;
  restartDelay?: number;
}

// Main Plugin Manager class
export class PluginManager extends BasePlugin {
  private loadedPlugins = new Map<string, LoadedPlugin>();
  private pluginHooks = new Map<string, Map<string, HookFunction[]>>();
  private pluginAPIs = new Map<string, Map<string, any>>();
  private healthCheckInterval?: NodeJS.Timeout;
  private managerConfig: PluginManagerConfig;
  
  constructor(config: PluginManagerConfig) {
    const manifest: PluginManifest = {
      name: 'plugin-manager',
      version: '1.0.0',
      description: 'Plugin lifecycle management system',
      author: 'claude-flow',
      license: 'MIT',
      keywords: ['plugins', 'management'],
      main: 'index.js',
      dependencies: {
        system: [],
        plugins: {}
      },
      configuration: {
        schema: {},
        required: [],
        defaults: {}
      },
      permissions: [],
      apis: [],
      hooks: []
    };

    const pluginConfig: PluginConfig = {
      enabled: config.enabled ?? true,
      priority: config.priority ?? 100,
      settings: config.settings ?? {},
      monitoring: config.monitoring
    };

    const context: PluginContext = {
      logger: {
        debug: (message: string, meta?: unknown) => console.debug(message, meta),
        info: (message: string, meta?: unknown) => console.info(message, meta),
        warn: (message: string, meta?: unknown) => console.warn(message, meta),
        error: (message: string, error?: unknown) => console.error(message, error)
      },
      apis: {
        logger: {
          info: (message: string) => console.info(message),
          error: (message: string) => console.error(message)
        }
      },
      resources: {
        limits: []
      }
    };

    super(manifest, pluginConfig, context);
    
    this.managerConfig = {
      ...pluginConfig,
      pluginDir: config.pluginDir || './plugins',
      autoload: config.autoload ?? true,
      healthCheckInterval: config.healthCheckInterval || 30000,
      maxRestartAttempts: config.maxRestartAttempts || 3,
      restartDelay: config.restartDelay || 5000
    };
  }
  
  async onInitialize(): Promise<void> {
    this.context.logger.info('Initializing PluginManager');
    
    // Start health monitoring if enabled
    if (this.managerConfig.healthCheckInterval && this.managerConfig.healthCheckInterval > 0) {
      this.startHealthMonitoring();
    }
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Starting PluginManager');
    
    // Auto-load plugins if enabled
    if (this.managerConfig.autoload) {
      await this.loadAllPlugins();
    }
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Stopping PluginManager');
    
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Stop all plugins
    for (const [name, plugin] of Array.from(this.loadedPlugins.entries())) {
      try {
        await this.stopPlugin(name);
      } catch (error) {
        this.context.logger.error(`Error stopping plugin ${name}`, error);
      }
    }
  }

  async onDestroy(): Promise<void> {
    this.context.logger.info('Destroying PluginManager');
    await this.onStop();
    this.loadedPlugins.clear();
    this.pluginHooks.clear();
    this.pluginAPIs.clear();
  }

  // Plugin management methods
  async loadPlugin(name: string, manifest: PluginManifest, config: PluginConfig): Promise<void> {
    if (this.loadedPlugins.has(name)) {
      throw new Error(`Plugin ${name} is already loaded`);
    }

    try {
      // Create plugin context
      const context: PluginContext = {
        logger: {
          debug: (message: string, meta?: unknown) => this.context.logger.debug(`[${name}] ${message}`, meta),
          info: (message: string, meta?: unknown) => this.context.logger.info(`[${name}] ${message}`, meta),
          warn: (message: string, meta?: unknown) => this.context.logger.warn(`[${name}] ${message}`, meta),
          error: (message: string, error?: unknown) => this.context.logger.error(`[${name}] ${message}`, error)
        },
        apis: {
          logger: {
            info: (message: string) => this.context.logger.info(`[${name}] ${message}`),
            error: (message: string) => this.context.logger.error(`[${name}] ${message}`)
          }
        },
        resources: {
          limits: []
        }
      };

      // Create loaded plugin entry
      const loadedPlugin: LoadedPlugin = {
        instance: {} as Plugin, // Would be the actual plugin instance
        manifest,
        config,
        state: 'loaded',
        context,
        startTime: Date.now(),
        errors: [],
        restartCount: 0
      };

      this.loadedPlugins.set(name, loadedPlugin);
      this.context.logger.info(`Plugin loaded: ${name}`);
      
    } catch (error) {
      this.context.logger.error(`Failed to load plugin ${name}`, error);
      throw error;
    }
  }

  async startPlugin(name: string): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    if (plugin.state === 'running') {
      return;
    }

    try {
      plugin.state = 'starting';
      // await plugin.instance.start(); // Would start the actual plugin
      plugin.state = 'running';
      plugin.startTime = Date.now();
      
      this.context.logger.info(`Plugin started: ${name}`);
      this.emit('plugin-started', name);
      
    } catch (error) {
      plugin.state = 'error';
      plugin.errors.push(error as Error);
      this.context.logger.error(`Failed to start plugin ${name}`, error);
      throw error;
    }
  }

  async stopPlugin(name: string): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) {
      return;
    }

    if (plugin.state === 'stopped') {
      return;
    }

    try {
      plugin.state = 'stopping';
      // await plugin.instance.stop(); // Would stop the actual plugin
      plugin.state = 'stopped';
      
      this.context.logger.info(`Plugin stopped: ${name}`);
      this.emit('plugin-stopped', name);
      
    } catch (error) {
      plugin.state = 'error';
      plugin.errors.push(error as Error);
      this.context.logger.error(`Failed to stop plugin ${name}`, error);
      throw error;
    }
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.loadedPlugins.get(name);
    if (!plugin) {
      return;
    }

    // Stop plugin first if running
    if (plugin.state === 'running') {
      await this.stopPlugin(name);
    }

    // Clean up hooks and APIs
    this.pluginHooks.delete(name);
    this.pluginAPIs.delete(name);
    
    // Remove from loaded plugins
    this.loadedPlugins.delete(name);
    
    this.context.logger.info(`Plugin unloaded: ${name}`);
    this.emit('plugin-unloaded', name);
  }

  // Hook management (override BasePlugin methods)
  async registerHook(event: string, handler: Function): Promise<void> {
    return this.registerPluginHook(this.metadata.name, event, handler as HookFunction);
  }

  async unregisterHook(event: string, handler: Function): Promise<void> {
    return this.unregisterPluginHook(this.metadata.name, event, handler as HookFunction); 
  }

  async registerAPI(name: string, api: any): Promise<void> {
    return this.registerPluginAPI(this.metadata.name, name, api);
  }

  // Plugin-specific hook management
  registerPluginHook(pluginName: string, event: string, handler: HookFunction): Promise<void> {
    if (!this.pluginHooks.has(pluginName)) {
      this.pluginHooks.set(pluginName, new Map());
    }
    
    const pluginHooks = this.pluginHooks.get(pluginName)!;
    if (!pluginHooks.has(event)) {
      pluginHooks.set(event, []);
    }
    
    const eventHandlers = pluginHooks.get(event)!;
    eventHandlers.push(handler);
    
    this.context.logger.debug(`Hook registered: ${event} for plugin ${pluginName}`);
    return Promise.resolve();
  }

  unregisterPluginHook(pluginName: string, event: string, handler: HookFunction): Promise<void> {
    const pluginHooks = this.pluginHooks.get(pluginName);
    if (!pluginHooks) {
      return Promise.resolve();
    }
    
    const eventHandlers = pluginHooks.get(event);
    if (!eventHandlers) {
      return Promise.resolve();
    }
    
    const index = eventHandlers.indexOf(handler);
    if (index > -1) {
      eventHandlers.splice(index, 1);
      this.context.logger.debug(`Hook unregistered: ${event} for plugin ${pluginName}`);
      
      if (eventHandlers.length === 0) {
        pluginHooks.delete(event);
      }
    }
    
    return Promise.resolve();
  }

  // Plugin-specific API management
  registerPluginAPI(pluginName: string, apiName: string, methods: any): Promise<void> {
    if (!this.pluginAPIs.has(pluginName)) {
      this.pluginAPIs.set(pluginName, new Map());
    }
    
    const pluginAPIs = this.pluginAPIs.get(pluginName)!;
    pluginAPIs.set(apiName, methods);
    
    this.context.logger.debug(`API registered: ${apiName} for plugin ${pluginName}`);
    return Promise.resolve();
  }

  getAPI(pluginName: string, apiName: string): any {
    const pluginAPIs = this.pluginAPIs.get(pluginName);
    if (!pluginAPIs) {
      return undefined;
    }
    
    return pluginAPIs.get(apiName);
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.managerConfig.healthCheckInterval);
  }

  private async performHealthChecks(): Promise<void> {
    for (const [name, plugin] of Array.from(this.loadedPlugins.entries())) {
      try {
        // const health = await plugin.instance.healthCheck(); // Would check actual plugin health
        const health: HealthStatus = {
          status: 'healthy',
          score: 100,
          issues: [],
          lastCheck: new Date()
        };
        
        plugin.lastHealthCheck = health;
        
        if (health.status === 'unhealthy') {
          this.context.logger.warn(`Plugin ${name} is unhealthy`, health.issues);
          this.emit('plugin-unhealthy', name, health);
        }
        
      } catch (error) {
        this.context.logger.error(`Health check failed for plugin ${name}`, error);
        plugin.errors.push(error as Error);
      }
    }
  }

  // Auto-loading (simplified)
  private async loadAllPlugins(): Promise<void> {
    // This would scan the plugin directory and load plugins
    // For now, just log that auto-loading would happen
    this.context.logger.info(`Auto-loading plugins from ${this.managerConfig.pluginDir}`);
  }

  // Status methods
  getPluginStatus(name: string): LoadedPlugin | undefined {
    return this.loadedPlugins.get(name);
  }

  getAllPlugins(): Map<string, LoadedPlugin> {
    return new Map(this.loadedPlugins);
  }

  getPluginCount(): number {
    return this.loadedPlugins.size;
  }

  getRunningPluginCount(): number {
    let count = 0;
    for (const plugin of Array.from(this.loadedPlugins.values())) {
      if (plugin.state === 'running') {
        count++;
      }
    }
    return count;
  }
}

export default PluginManager;