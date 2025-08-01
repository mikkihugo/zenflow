/**
 * Plugin Manager
 * Advanced plugin lifecycle management with health monitoring, security, and metrics
 */

import { EventEmitter } from 'node:events';
import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { BasePlugin } from './base-plugin.js';
import type {
  Plugin,
  PluginContext,
  PluginManifest,
  PluginConfig,
  PluginState,
  HealthCheckResult,
  HookFunction,
  HookOptions
} from './base-plugin.js';

// Plugin manager interfaces
interface LoadedPlugin {
  instance: Plugin;
  manifest: PluginManifest;
  config: PluginConfig;
  state: PluginState;
  context: PluginContext;
  worker?: Worker;
  startTime?: number;
  errors: Error[];
  restartCount: number;
  lastHealthCheck?: HealthCheckResult;
}

interface PluginManagerConfig {
  pluginDir?: string;
  autoload?: boolean;
  healthCheckInterval?: number;
  maxRestartAttempts?: number;
  restartDelay?: number;
  enableHotReload?: boolean;
  enableSandbox?: boolean;
  resourceLimits?: {
    maxMemory?: number;
    maxCpu?: number;
    maxStorage?: number;
    maxNetwork?: number;
  };
}

interface DependencyNode {
  name: string;
  dependencies: Set<string>;
  dependents: Set<string>;
}

// Main Plugin Manager class
export class PluginManager extends BasePlugin {
  private plugins = new Map<string, LoadedPlugin>();
  private hooks = new Map<string, Map<string, HookFunction[]>>();
  private apis = new Map<string, Map<string, any>>();
  private mcpTools = new Map<string, any>();
  private dependencyGraph = new Map<string, DependencyNode>();
  private healthCheckInterval?: NodeJS.Timeout;
  private monitoringInterval?: NodeJS.Timeout;
  private config: PluginManagerConfig;
  
  constructor(config: PluginManagerConfig = {}) {
    super({
      name: 'plugin-manager',
      version: '1.0.0',
      ...config
    });
    
    this.config = {
      pluginDir: config.pluginDir || './plugins',
      autoload: config.autoload ?? true,
      healthCheckInterval: config.healthCheckInterval || 30000,
      maxRestartAttempts: config.maxRestartAttempts || 3,
      restartDelay: config.restartDelay || 5000,
      enableHotReload: config.enableHotReload ?? false,
      enableSandbox: config.enableSandbox ?? false,
      resourceLimits: config.resourceLimits || {}
    };
  }
  
  async onInitialize(): Promise<void> {
    // Initialize hook system
    this.initializeHookSystem();
    
    // Initialize API registry
    this.initializeAPIRegistry();
    
    // Initialize MCP tool registry
    this.initializeMCPRegistry();
    
    // Start health monitoring
    if (this.config.healthCheckInterval > 0) {
      this.startHealthMonitoring();
    }
    
    // Auto-load plugins if configured
    if (this.config.autoload) {
      await this.discoverAndLoadPlugins();
    }
  }
  
  async onStart(): Promise<void> {
    // Start all loaded plugins
    for (const [name, plugin] of this.plugins) {
      if (plugin.state === 'initialized') {
        await this.startPlugin(name);
      }
    }
  }
  
  async onStop(): Promise<void> {
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Stop all plugins
    for (const [name] of this.plugins) {
      await this.stopPlugin(name);
    }
  }
  
  async onDestroy(): Promise<void> {
    // Unload all plugins
    for (const [name] of this.plugins) {
      await this.unloadPlugin(name);
    }
    
    // Clear registries
    this.hooks.clear();
    this.apis.clear();
    this.mcpTools.clear();
    this.plugins.clear();
    this.dependencyGraph.clear();
  }
  
  async onHealthCheck(): Promise<Partial<HealthCheckResult>> {
    const issues: string[] = [];
    const pluginHealth: Record<string, any> = {};
    
    for (const [name, plugin] of this.plugins) {
      pluginHealth[name] = {
        state: plugin.state,
        errors: plugin.errors.length,
        restarts: plugin.restartCount,
        lastCheck: plugin.lastHealthCheck
      };
      
      if (plugin.state === 'error') {
        issues.push(`Plugin ${name} is in error state`);
      }
      
      if (plugin.errors.length > 0) {
        issues.push(`Plugin ${name} has ${plugin.errors.length} errors`);
      }
    }
    
    return {
      issues,
      performance: {
        totalPlugins: this.plugins.size,
        activePlugins: Array.from(this.plugins.values()).filter(p => p.state === 'active').length,
        errorPlugins: Array.from(this.plugins.values()).filter(p => p.state === 'error').length
      },
      custom: {
        plugins: pluginHealth
      }
    };
  }
  
  async onGetMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {
      totalPlugins: this.plugins.size,
      pluginsByState: {},
      totalHooks: 0,
      totalAPIs: 0,
      totalMCPTools: this.mcpTools.size
    };
    
    // Count plugins by state
    for (const plugin of this.plugins.values()) {
      metrics.pluginsByState[plugin.state] = (metrics.pluginsByState[plugin.state] || 0) + 1;
    }
    
    // Count hooks
    for (const hookMap of this.hooks.values()) {
      for (const handlers of hookMap.values()) {
        metrics.totalHooks += handlers.length;
      }
    }
    
    // Count APIs
    for (const apiMap of this.apis.values()) {
      metrics.totalAPIs += apiMap.size;
    }
    
    // Get plugin metrics
    metrics.pluginMetrics = {};
    for (const [name, plugin] of this.plugins) {
      if (plugin.instance.getMetrics) {
        try {
          metrics.pluginMetrics[name] = await plugin.instance.getMetrics();
        } catch (error) {
          metrics.pluginMetrics[name] = { error: error.message };
        }
      }
    }
    
    return metrics;
  }
  
  async onValidateConfiguration(config: PluginConfig): Promise<string[]> {
    const errors: string[] = [];
    
    if (config.pluginDir && typeof config.pluginDir !== 'string') {
      errors.push('pluginDir must be a string');
    }
    
    if (config.healthCheckInterval && config.healthCheckInterval < 0) {
      errors.push('healthCheckInterval must be positive');
    }
    
    if (config.maxRestartAttempts && config.maxRestartAttempts < 0) {
      errors.push('maxRestartAttempts must be positive');
    }
    
    return errors;
  }
  
  // Plugin lifecycle methods
  async loadPlugin(name: string, config?: PluginConfig): Promise<void> {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin ${name} is already loaded`);
    }
    
    this.emit('plugin:loading', { name });
    
    try {
      // Discover plugin path
      const pluginPath = await this.resolvePluginPath(name);
      
      // Load plugin module
      const PluginClass = await this.loadPluginModule(pluginPath);
      
      // Create plugin context
      const context = this.createPluginContext(name);
      
      // Instantiate plugin
      const instance = new PluginClass(config || {});
      instance.setContext(context);
      
      // Get manifest
      const manifest = PluginClass.metadata || {
        name,
        version: '0.0.0',
        description: `Plugin ${name}`
      };
      
      // Validate dependencies
      await this.validateDependencies(name, manifest);
      
      // Store loaded plugin
      const loadedPlugin: LoadedPlugin = {
        instance,
        manifest,
        config: config || {},
        state: 'loaded',
        context,
        errors: [],
        restartCount: 0
      };
      
      this.plugins.set(name, loadedPlugin);
      
      // Update dependency graph
      this.updateDependencyGraph(name, manifest);
      
      // Initialize plugin
      await this.initializePlugin(name);
      
      this.emit('plugin:loaded', { name, manifest });
    } catch (error) {
      this.emit('plugin:error', { name, error });
      throw new Error(`Failed to load plugin ${name}: ${error.message}`);
    }
  }
  
  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    // Check if other plugins depend on this one
    const node = this.dependencyGraph.get(name);
    if (node && node.dependents.size > 0) {
      throw new Error(`Cannot unload ${name}: plugins depend on it: ${Array.from(node.dependents).join(', ')}`);
    }
    
    this.emit('plugin:unloading', { name });
    
    try {
      // Stop plugin if active
      if (plugin.state === 'active') {
        await this.stopPlugin(name);
      }
      
      // Destroy plugin
      if (plugin.state !== 'uninitialized' && plugin.instance.destroy) {
        await plugin.instance.destroy();
      }
      
      // Terminate worker if exists
      if (plugin.worker) {
        await plugin.worker.terminate();
      }
      
      // Remove from registries
      this.removePluginHooks(name);
      this.removePluginAPIs(name);
      this.removePluginMCPTools(name);
      
      // Remove from plugins map
      this.plugins.delete(name);
      
      // Update dependency graph
      this.removeDependencyNode(name);
      
      this.emit('plugin:unloaded', { name });
    } catch (error) {
      this.emit('plugin:error', { name, error });
      throw new Error(`Failed to unload plugin ${name}: ${error.message}`);
    }
  }
  
  async reloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    const config = plugin.config;
    
    await this.unloadPlugin(name);
    await this.loadPlugin(name, config);
  }
  
  private async initializePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    if (plugin.state !== 'loaded') {
      throw new Error(`Plugin ${name} is not in loaded state`);
    }
    
    try {
      await plugin.instance.initialize();
      plugin.state = 'initialized';
      this.emit('plugin:initialized', { name });
    } catch (error) {
      plugin.state = 'error';
      plugin.errors.push(error);
      throw error;
    }
  }
  
  private async startPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    if (plugin.state !== 'initialized') {
      throw new Error(`Plugin ${name} is not initialized`);
    }
    
    try {
      plugin.startTime = Date.now();
      await plugin.instance.start();
      plugin.state = 'active';
      this.emit('plugin:started', { name });
    } catch (error) {
      plugin.state = 'error';
      plugin.errors.push(error);
      throw error;
    }
  }
  
  private async stopPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    if (plugin.state !== 'active') {
      return;
    }
    
    try {
      await plugin.instance.stop();
      plugin.state = 'initialized';
      this.emit('plugin:stopped', { name });
    } catch (error) {
      plugin.state = 'error';
      plugin.errors.push(error);
      throw error;
    }
  }
  
  // Plugin discovery
  private async discoverAndLoadPlugins(): Promise<void> {
    const pluginDir = resolve(this.config.pluginDir!);
    
    try {
      const entries = await readdir(pluginDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = join(pluginDir, entry.name);
          const packagePath = join(pluginPath, 'package.json');
          
          try {
            await stat(packagePath);
            // Plugin directory with package.json found
            await this.loadPlugin(entry.name);
          } catch {
            // Not a valid plugin directory
          }
        }
      }
    } catch (error) {
      this.emit('error', error);
    }
  }
  
  private async resolvePluginPath(name: string): Promise<string> {
    // Try direct path first
    try {
      await stat(name);
      return resolve(name);
    } catch {
      // Not a direct path
    }
    
    // Try in plugin directory
    const pluginPath = join(this.config.pluginDir!, name);
    try {
      await stat(pluginPath);
      return resolve(pluginPath);
    } catch {
      throw new Error(`Plugin ${name} not found`);
    }
  }
  
  private async loadPluginModule(pluginPath: string): Promise<any> {
    const indexPath = join(pluginPath, 'index.js');
    const moduleUrl = pathToFileURL(indexPath).href;
    
    try {
      const module = await import(moduleUrl);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load plugin module: ${error.message}`);
    }
  }
  
  // Hook system
  private initializeHookSystem(): void {
    // Set up context hook methods
    this.context!.hooks = {
      register: (event: string, handler: HookFunction, options?: HookOptions) => {
        this.registerHook('plugin-manager', event, handler, options);
      },
      unregister: (event: string, handler: HookFunction) => {
        this.unregisterHook('plugin-manager', event, handler);
      },
      emit: async (event: string, data: any, options?: any) => {
        return await this.executeHooks(event, data, options);
      }
    };
  }
  
  private registerHook(pluginName: string, event: string, handler: HookFunction, options?: HookOptions): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, new Map());
    }
    
    const eventHooks = this.hooks.get(event)!;
    if (!eventHooks.has(pluginName)) {
      eventHooks.set(pluginName, []);
    }
    
    const handlers = eventHooks.get(pluginName)!;
    handlers.push(handler);
    
    // Sort by priority if specified
    if (options?.priority) {
      handlers.sort((a, b) => {
        const aPriority = (a as any).__priority || 0;
        const bPriority = (b as any).__priority || 0;
        return bPriority - aPriority;
      });
      (handler as any).__priority = options.priority;
    }
  }
  
  private unregisterHook(pluginName: string, event: string, handler: HookFunction): void {
    const eventHooks = this.hooks.get(event);
    if (!eventHooks) return;
    
    const handlers = eventHooks.get(pluginName);
    if (!handlers) return;
    
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    if (handlers.length === 0) {
      eventHooks.delete(pluginName);
    }
    
    if (eventHooks.size === 0) {
      this.hooks.delete(event);
    }
  }
  
  private async executeHooks(event: string, data: any, options?: any): Promise<any> {
    const eventHooks = this.hooks.get(event);
    if (!eventHooks) return data;
    
    let result = data;
    const errors: Error[] = [];
    
    for (const [pluginName, handlers] of eventHooks) {
      for (const handler of handlers) {
        try {
          const startTime = performance.now();
          
          // Set timeout if specified
          const timeout = options?.timeout || 5000;
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Hook timeout')), timeout);
          });
          
          const handlerResult = await Promise.race([
            handler(result, options),
            timeoutPromise
          ]);
          
          const executionTime = performance.now() - startTime;
          
          // Track metrics
          this.emit('hook:executed', {
            event,
            plugin: pluginName,
            executionTime
          });
          
          // Handle flow control
          if (handlerResult && typeof handlerResult === 'object') {
            if (handlerResult.__flow === 'stop') {
              break;
            } else if (handlerResult.__flow === 'continue') {
              continue;
            } else if (handlerResult.__flow === 'skip') {
              return result;
            }
            
            result = handlerResult;
          } else if (handlerResult !== undefined) {
            result = handlerResult;
          }
        } catch (error) {
          errors.push(error);
          this.emit('hook:error', {
            event,
            plugin: pluginName,
            error
          });
          
          if (options?.stopOnError) {
            throw error;
          }
        }
      }
    }
    
    if (errors.length > 0 && options?.throwErrors) {
      throw new AggregateError(errors, `Hook execution errors for ${event}`);
    }
    
    return result;
  }
  
  private removePluginHooks(pluginName: string): void {
    for (const eventHooks of this.hooks.values()) {
      eventHooks.delete(pluginName);
    }
  }
  
  // API registry
  private initializeAPIRegistry(): void {
    this.context!.api = {
      register: (apiName: string, methods: any) => {
        this.registerAPI('plugin-manager', apiName, methods);
      },
      get: (pluginName: string, apiName: string) => {
        return this.getAPI(pluginName, apiName);
      },
      invoke: async (pluginName: string, apiName: string, methodName: string, ...args: any[]) => {
        return await this.invokeAPI(pluginName, apiName, methodName, ...args);
      }
    };
  }
  
  private registerAPI(pluginName: string, apiName: string, methods: any): void {
    if (!this.apis.has(pluginName)) {
      this.apis.set(pluginName, new Map());
    }
    
    const pluginAPIs = this.apis.get(pluginName)!;
    pluginAPIs.set(apiName, methods);
  }
  
  private getAPI(pluginName: string, apiName: string): any {
    const pluginAPIs = this.apis.get(pluginName);
    if (!pluginAPIs) return null;
    
    return pluginAPIs.get(apiName);
  }
  
  private async invokeAPI(pluginName: string, apiName: string, methodName: string, ...args: any[]): Promise<any> {
    const api = this.getAPI(pluginName, apiName);
    if (!api) {
      throw new Error(`API ${apiName} not found for plugin ${pluginName}`);
    }
    
    const method = api[methodName];
    if (typeof method !== 'function') {
      throw new Error(`Method ${methodName} not found in API ${apiName}`);
    }
    
    return await method.apply(api, args);
  }
  
  private removePluginAPIs(pluginName: string): void {
    this.apis.delete(pluginName);
  }
  
  // MCP registry
  private initializeMCPRegistry(): void {
    this.context!.mcp = {
      registerTool: (name: string, tool: any) => {
        this.registerMCPTool(name, tool);
      },
      getTool: (name: string) => {
        return this.getMCPTool(name);
      },
      listTools: () => {
        return Array.from(this.mcpTools.keys());
      }
    };
  }
  
  private registerMCPTool(name: string, tool: any): void {
    if (this.mcpTools.has(name)) {
      throw new Error(`MCP tool ${name} already registered`);
    }
    
    this.mcpTools.set(name, tool);
  }
  
  private getMCPTool(name: string): any {
    return this.mcpTools.get(name);
  }
  
  private removePluginMCPTools(pluginName: string): void {
    // TODO: Track which plugin registered which tools
    // For now, this is a no-op
  }
  
  // Context creation
  private createPluginContext(pluginName: string): PluginContext {
    return {
      hooks: {
        register: (event: string, handler: HookFunction, options?: HookOptions) => {
          this.registerHook(pluginName, event, handler, options);
        },
        unregister: (event: string, handler: HookFunction) => {
          this.unregisterHook(pluginName, event, handler);
        },
        emit: async (event: string, data: any, options?: any) => {
          return await this.executeHooks(event, data, options);
        }
      },
      api: {
        register: (apiName: string, methods: any) => {
          this.registerAPI(pluginName, apiName, methods);
        },
        get: (pluginName: string, apiName: string) => {
          return this.getAPI(pluginName, apiName);
        },
        invoke: async (pluginName: string, apiName: string, methodName: string, ...args: any[]) => {
          return await this.invokeAPI(pluginName, apiName, methodName, ...args);
        }
      },
      mcp: {
        registerTool: (name: string, tool: any) => {
          this.registerMCPTool(name, tool);
        },
        getTool: (name: string) => {
          return this.getMCPTool(name);
        },
        listTools: () => {
          return Array.from(this.mcpTools.keys());
        }
      },
      memory: {
        set: async (key: string, value: any, options?: any) => {
          return await this.context!.memory!.set(`${pluginName}:${key}`, value, options);
        },
        get: async (key: string) => {
          return await this.context!.memory!.get(`${pluginName}:${key}`);
        },
        delete: async (key: string) => {
          return await this.context!.memory!.delete(`${pluginName}:${key}`);
        },
        list: async (pattern?: string) => {
          return await this.context!.memory!.list(`${pluginName}:${pattern || '*'}`);
        }
      }
    };
  }
  
  // Dependency management
  private async validateDependencies(name: string, manifest: PluginManifest): Promise<void> {
    if (!manifest.dependencies) return;
    
    for (const dep of manifest.dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Plugin ${name} depends on ${dep}, which is not loaded`);
      }
    }
  }
  
  private updateDependencyGraph(name: string, manifest: PluginManifest): void {
    const node: DependencyNode = {
      name,
      dependencies: new Set(manifest.dependencies || []),
      dependents: new Set()
    };
    
    this.dependencyGraph.set(name, node);
    
    // Update dependents
    for (const dep of node.dependencies) {
      const depNode = this.dependencyGraph.get(dep);
      if (depNode) {
        depNode.dependents.add(name);
      }
    }
  }
  
  private removeDependencyNode(name: string): void {
    const node = this.dependencyGraph.get(name);
    if (!node) return;
    
    // Remove from dependents
    for (const dep of node.dependencies) {
      const depNode = this.dependencyGraph.get(dep);
      if (depNode) {
        depNode.dependents.delete(name);
      }
    }
    
    this.dependencyGraph.delete(name);
  }
  
  private getLoadOrder(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    
    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);
      
      const node = this.dependencyGraph.get(name);
      if (node) {
        for (const dep of node.dependencies) {
          visit(dep);
        }
      }
      
      result.push(name);
    };
    
    for (const name of this.dependencyGraph.keys()) {
      visit(name);
    }
    
    return result;
  }
  
  // Health monitoring
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const [name, plugin] of this.plugins) {
        if (plugin.state === 'active' && plugin.instance.healthCheck) {
          try {
            const health = await plugin.instance.healthCheck();
            plugin.lastHealthCheck = health;
            
            if (health.status === 'unhealthy' && plugin.restartCount < this.config.maxRestartAttempts!) {
              await this.restartPlugin(name);
            }
          } catch (error) {
            plugin.errors.push(error);
            this.emit('plugin:health-error', { name, error });
          }
        }
      }
    }, this.config.healthCheckInterval);
  }
  
  private async restartPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) return;
    
    plugin.restartCount++;
    this.emit('plugin:restarting', { name, attempt: plugin.restartCount });
    
    try {
      await this.stopPlugin(name);
      await new Promise(resolve => setTimeout(resolve, this.config.restartDelay));
      await this.startPlugin(name);
      
      this.emit('plugin:restarted', { name });
    } catch (error) {
      plugin.state = 'error';
      plugin.errors.push(error);
      this.emit('plugin:restart-failed', { name, error });
    }
  }
  
  // Resource monitoring
  private startResourceMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      for (const [name, plugin] of this.plugins) {
        if (plugin.state === 'active') {
          const usage = await this.getPluginResourceUsage(name);
          
          // Check limits
          const limits = this.config.resourceLimits!;
          if (limits.maxMemory && usage.memory > limits.maxMemory) {
            this.emit('plugin:resource-limit', { name, resource: 'memory', usage: usage.memory, limit: limits.maxMemory });
          }
          
          if (limits.maxCpu && usage.cpu > limits.maxCpu) {
            this.emit('plugin:resource-limit', { name, resource: 'cpu', usage: usage.cpu, limit: limits.maxCpu });
          }
        }
      }
    }, 5000);
  }
  
  private async getPluginResourceUsage(name: string): Promise<any> {
    const plugin = this.plugins.get(name);
    if (!plugin) return {};
    
    // TODO: Implement actual resource monitoring
    // For now, return mock data
    return {
      memory: process.memoryUsage().heapUsed,
      cpu: process.cpuUsage().user
    };
  }
  
  // Public API
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name)?.instance;
  }
  
  getPluginState(name: string): PluginState | undefined {
    return this.plugins.get(name)?.state;
  }
  
  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
  
  getActivePlugins(): string[] {
    return Array.from(this.plugins.entries())
      .filter(([_, plugin]) => plugin.state === 'active')
      .map(([name]) => name);
  }
  
  async getPluginHealth(name: string): Promise<HealthCheckResult | undefined> {
    const plugin = this.plugins.get(name);
    if (!plugin || !plugin.instance.healthCheck) return undefined;
    
    try {
      return await plugin.instance.healthCheck();
    } catch (error) {
      return {
        status: 'unhealthy',
        issues: [`Health check failed: ${error.message}`]
      };
    }
  }
  
  async getSystemHealth(): Promise<HealthCheckResult> {
    const health = await this.healthCheck();
    
    // Aggregate plugin health
    const pluginHealths: Record<string, any> = {};
    for (const [name] of this.plugins) {
      pluginHealths[name] = await this.getPluginHealth(name);
    }
    
    return {
      ...health,
      custom: {
        ...health.custom,
        pluginHealth: pluginHealths
      }
    };
  }
  
  // Static metadata
  static readonly metadata: PluginManifest = {
    name: 'plugin-manager',
    version: '1.0.0',
    description: 'Advanced plugin lifecycle management system',
    author: 'Claude Code Flow',
    capabilities: ['plugin-management', 'lifecycle', 'health', 'monitoring'],
    configuration: {
      pluginDir: {
        type: 'string',
        default: './plugins',
        description: 'Directory to load plugins from'
      },
      autoload: {
        type: 'boolean',
        default: true,
        description: 'Automatically load plugins on startup'
      },
      healthCheckInterval: {
        type: 'number',
        default: 30000,
        description: 'Health check interval in milliseconds'
      },
      maxRestartAttempts: {
        type: 'number',
        default: 3,
        description: 'Maximum restart attempts for unhealthy plugins'
      },
      enableSandbox: {
        type: 'boolean',
        default: false,
        description: 'Enable plugin sandboxing'
      }
    }
  };
}

export default PluginManager;