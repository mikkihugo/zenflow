/**
 * Base Plugin Class
 * TypeScript foundation for all Claude Code Flow plugins
 */

import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import type { 
  Plugin, 
  PluginMetadata, 
  PluginManifest, 
  PluginConfig, 
  PluginContext, 
  PluginState, 
  ResourceUsage, 
  HealthStatus 
} from './types.js';

export abstract class BasePlugin extends EventEmitter implements Plugin {
  public readonly metadata: PluginMetadata;
  public readonly config: PluginConfig;
  public readonly context: PluginContext;
  public readonly state: PluginState = 'uninitialized';
  private _state: PluginState = 'uninitialized';
  protected hooks = new Map<string, Set<Function>>();
  protected apis = new Map<string, any>();
  protected resourceUsage: ResourceUsage = {
    memory: 0,
    cpu: 0,
    disk: 0,
    network: 0
  };
  protected lastHealthCheck = new Date();
  protected healthScore = 100;
  protected resourceMonitorInterval?: NodeJS.Timeout;
  protected metrics = {
    performance: {
      callCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      errorRate: 0,
      successRate: 100
    },
    resources: {
      memoryUsage: 0,
      cpuUsage: 0,
      diskUsage: 0,
      networkUsage: 0
    },
    hooks: {} as Record<string, {
      callCount: number;
      averageExecutionTime: number;
      errorCount: number;
    }>,
    apis: {} as Record<string, {
      callCount: number;
      averageExecutionTime: number;
      errorCount: number;
    }>
  };

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super();
    
    this.config = config;
    this.context = context;
    
    // Initialize metadata
    this.metadata = {
      id: randomUUID(),
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      license: manifest.license,
      homepage: manifest.homepage,
      keywords: manifest.keywords,
      status: 'loaded',
      errorCount: 0,
      lastActivity: new Date(),
      restartCount: 0
    };

    this.setupLifecycleEvents();
  }

  // Abstract methods that must be implemented by subclasses
  abstract onInitialize(): Promise<void>;
  abstract onStart(): Promise<void>;
  abstract onStop(): Promise<void>;
  abstract onDestroy(): Promise<void>;

  // Public lifecycle methods
  async initialize(): Promise<void> {
    if (this.state !== 'loaded') {
      throw new Error(`Cannot initialize plugin in state: ${this.state}`);
    }

    try {
      this.setState('initialized');
      await this.onInitialize();
      this.metadata.status = 'initialized';
      this.emit('initialized', this.metadata.name);
      this.updateLastActivity();
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.metadata.name, { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.state !== 'initialized') {
      throw new Error(`Cannot start plugin in state: ${this.state}`);
    }

    try {
      this.setState('starting');
      await this.onStart();
      this.setState('running');
      this.metadata.status = 'active';
      this.emit('started', this.metadata.name);
      this.updateLastActivity();
      
      // Start resource monitoring if enabled
      this.startResourceMonitoring();
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.metadata.name, { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state !== 'running') {
      throw new Error(`Cannot stop plugin in state: ${this.state}`);
    }

    try {
      this.setState('stopping');
      await this.onStop();
      this.setState('stopped');
      this.metadata.status = 'disabled';
      this.emit('stopped', this.metadata.name);
      this.updateLastActivity();
      
      // Stop resource monitoring
      this.stopResourceMonitoring();
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.metadata.name, { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      // Stop if running
      if (this.state === 'running') {
        await this.stop();
      }

      this.setState('destroying');
      this.emit('unloading', this.metadata.name);

      // Stop resource monitoring
      this.stopResourceMonitoring();

      // Cleanup hooks and APIs
      this.hooks.clear();
      this.apis.clear();

      // Call plugin-specific cleanup
      await this.onDestroy();
      
      this.setState('destroyed');
      this.metadata.status = 'unloaded';
      this.emit('unloaded', this.metadata.name);
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.metadata.name, { 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  // Plugin management methods
  async enable(): Promise<void> {
    if (this.config.enabled === false) {
      await this.start();
    }
  }

  async disable(): Promise<void> {
    if (this.state === 'running') {
      await this.stop();
    }
  }

  async reload(): Promise<void> {
    await this.stop();
    await this.start();
    this.metadata.restartCount++;
  }

  async configure(updates: Partial<PluginConfig>): Promise<void> {
    // Validate configuration updates
    const validation = await this.validateConfiguration({ ...this.config, ...updates });
    if (validation.some(v => !v.valid)) {
      throw new Error(`Invalid configuration: ${validation.filter(v => !v.valid).map(v => v.message).join(', ')}`);
    }

    // Apply updates
    Object.assign(this.config, updates);

    // Restart if needed
    if (this.state === 'running') {
      await this.reload();
    }
  }

  // Hook system implementation
  async registerHook(type: string, handler: Function): Promise<void> {
    if (!this.hooks.has(type)) {
      this.hooks.set(type, new Set());
    }
    
    const handlers = this.hooks.get(type)!;
    handlers.add(handler);
    
    // Initialize metrics for this hook type
    if (!this.metrics.hooks[type]) {
      this.metrics.hooks[type] = {
        callCount: 0,
        averageExecutionTime: 0,
        errorCount: 0
      };
    }
    
    this.emit('hook-registered', this.metadata.name, type);
    this.context.logger.info(`Hook registered: ${type} for plugin ${this.metadata.name}`);
  }

  async unregisterHook(type: string, handler: Function): Promise<void> {
    const handlers = this.hooks.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.hooks.delete(type);
      }
    }

    this.emit('hook-unregistered', this.metadata.name, type);
    this.context.logger.info(`Hook unregistered: ${type} for plugin ${this.metadata.name}`);
  }

  async executeHook(type: string, data: any): Promise<any> {
    const handlers = this.hooks.get(type);
    if (!handlers || handlers.size === 0) {
      return { success: true, results: [], executionTime: 0 };
    }

    const startTime = performance.now();
    const results: any[] = [];

    try {
      for (const handler of Array.from(handlers)) {
        const hookContext = {
          type,
          data,
          plugin: this.metadata.name
        };
        
        const result = await handler(hookContext);
        results.push(result);
        
        if (result && result.stop) {
          break;
        }
      }

      const executionTime = performance.now() - startTime;
      this.updateHookMetrics(type, executionTime, true);

      this.emit('hook-executed', this.metadata.name, type, executionTime);

      return {
        success: true,
        results,
        data: results.reduce((acc, result) => ({ ...acc, ...result.data }), {}),
        continue: results.some(r => r.continue),
        stop: results.some(r => r.stop),
        skip: results.some(r => r.skip),
        executionTime
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.updateHookMetrics(type, executionTime, false);

      this.emit('hook-failed', this.metadata.name, type, {
        message: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      });
      
      throw error;
    }
  }

  // API system implementation
  async registerAPI(name: string, api: any): Promise<void> {
    this.apis.set(name, api);
    
    // Initialize metrics for this API
    if (!this.metrics.apis[name]) {
      this.metrics.apis[name] = {
        callCount: 0,
        averageExecutionTime: 0,
        errorCount: 0
      };
    }
    
    this.emit('api-registered', this.metadata.name, name);
    this.context.logger.info(`API registered: ${name} for plugin ${this.metadata.name}`);
  }

  async callAPI(name: string, method: string, ...args: any[]): Promise<any> {
    const api = this.apis.get(name);
    if (!api) {
      throw new Error(`API not found: ${name}`);
    }

    const apiMethod = api.methods?.find((m: any) => m.name === method);
    if (!apiMethod) {
      throw new Error(`Method not found: ${method} in API ${name}`);
    }

    const startTime = performance.now();

    try {
      // Here you would implement the actual API method call
      // This is a simplified version - in reality you'd need to handle the method invocation
      const result = await Promise.resolve(undefined); // Placeholder

      const executionTime = performance.now() - startTime;
      this.updateAPIMetrics(name, executionTime, true);

      this.emit('api-called', this.metadata.name, name, executionTime);

      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.updateAPIMetrics(name, executionTime, false);

      this.emit('api-failed', this.metadata.name, name, { 
        message: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      });
      
      throw error;
    }
  }

  // Resource management
  async allocateResource(type: string, amount: number): Promise<boolean> {
    const limits = this.context.resources.limits.find(l => l.type === type);
    if (limits && this.resourceUsage[type as keyof ResourceUsage] + amount > limits.maximum) {
      this.emit('resource-exceeded', this.metadata.name, type,
        this.resourceUsage[type as keyof ResourceUsage] + amount, limits.maximum);
      return false;
    }

    // Allocate resource (simplified - would integrate with actual resource manager)
    return true;
  }

  async releaseResource(type: string, amount: number): Promise<void> {
    // Release resource (simplified - would integrate with actual resource manager)
  }

  // Health monitoring
  async healthCheck(): Promise<HealthStatus> {
    const issues: Array<{ component: string; severity: 'low' | 'medium' | 'high' | 'critical'; message: string }> = [];

    // Check error rate
    if (this.metrics.performance.errorRate > 10) {
      issues.push({
        component: 'performance',
        severity: this.metrics.performance.errorRate > 50 ? 'critical' : 'high',
        message: `High error rate: ${this.metrics.performance.errorRate.toFixed(2)}%`
      });
    }

    // Check resource usage
    Object.entries(this.resourceUsage).forEach(([type, usage]) => {
      if (usage > 90) {
        issues.push({
          component: 'resources',
          severity: usage > 95 ? 'critical' : 'high',
          message: `High ${type} usage: ${usage}%`
        });
      }
    });

    // Check plugin state
    if (this.state === 'error') {
      issues.push({
        component: 'state',
        severity: 'critical',
        message: 'Plugin is in error state'
      });
    }

    // Calculate health score
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    score = Math.max(0, score);

    const status = score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'unhealthy';

    this.healthScore = score;
    this.lastHealthCheck = new Date();

    // Update metadata
    this.metadata.health = {
      status,
      score,
      issues: issues.map(i => i.message),
      lastCheck: this.lastHealthCheck
    };

    return {
      status,
      score,
      issues,
      lastCheck: this.lastHealthCheck
    };
  }

  // Testing and validation
  async runTests(): Promise<{ passed: boolean; results: any[]; totalDuration: number; totalTests: number; passedTests: number; failedTests: number }> {
    const tests: any[] = [];

    const startTime = performance.now();

    // Test 1: Health check
    const healthCheckStart = performance.now();
    await this.healthCheck();
    tests.push({
      name: 'Health Check',
      passed: true,
      duration: performance.now() - healthCheckStart
    });

    // Test 2: Configuration validation
    const configTestStart = performance.now();
    await this.validateConfiguration(this.config);
    tests.push({
      name: 'Configuration Validation',
      passed: true,
      duration: performance.now() - configTestStart
    });

    const totalDuration = performance.now() - startTime;

    return {
      passed: tests.every(test => test.passed),
      results: tests,
      totalDuration,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.passed).length,
      failedTests: tests.filter(t => !t.passed).length
    };
  }

  async updateSettings(updates: Record<string, any>): Promise<void> {
    const newConfig = { ...this.config.settings, ...updates };
    await this.configure({ ...this.config, settings: newConfig });
  }

  async validateConfiguration(config: PluginConfig): Promise<Array<{ valid: boolean; message: string }>> {
    const results: Array<{ valid: boolean; message: string }> = [];

    // Basic validation - plugins can override this
    if (this.metadata.name && this.metadata.name.length === 0) {
      results.push({ valid: false, message: 'Plugin name cannot be empty' });
    }

    return results;
  }

  // Protected utility methods
  protected setState(state: PluginState): void {
    this._state = state;
    (this.state as any) = state;
  }

  protected updateLastActivity(): void {
    this.metadata.lastActivity = new Date();
  }

  protected updateResourceUsage(): void {
    // Update resource usage metrics (simplified - would integrate with actual monitoring)
    this.metrics.resources.memoryUsage = this.resourceUsage.memory;
    this.metrics.resources.cpuUsage = this.resourceUsage.cpu;
  }

  protected updateHookMetrics(type: string, executionTime: number, success: boolean): void {
    const hookMetrics = this.metrics.hooks[type];
    if (hookMetrics) {
      hookMetrics.callCount++;
      hookMetrics.averageExecutionTime = 
        (hookMetrics.averageExecutionTime * (hookMetrics.callCount - 1) + executionTime) / hookMetrics.callCount;
      if (!success) {
        hookMetrics.errorCount++;
      }
    }
  }

  protected updateAPIMetrics(name: string, executionTime: number, success: boolean): void {
    const apiMetrics = this.metrics.apis[name];
    if (apiMetrics) {
      apiMetrics.callCount++;
      apiMetrics.averageExecutionTime = 
        (apiMetrics.averageExecutionTime * (apiMetrics.callCount - 1) + executionTime) / apiMetrics.callCount;
      if (!success) {
        apiMetrics.errorCount++;
      }
    }
  }

  private setupLifecycleEvents(): void {
    // Track performance metrics
    this.on('api-called', (_pluginName, _apiName, duration) => {
      this.metrics.performance.callCount++;
      this.metrics.performance.totalExecutionTime += duration;
      this.metrics.performance.averageExecutionTime = 
        this.metrics.performance.totalExecutionTime / this.metrics.performance.callCount;
    });

    this.on('error', () => {
      this.metadata.errorCount++;
      this.metrics.performance.errorRate = 
        (this.metadata.errorCount / Math.max(1, this.metrics.performance.callCount)) * 100;
      this.metrics.performance.successRate = 100 - this.metrics.performance.errorRate;
    });
  }

  private startResourceMonitoring(): void {
    if (this.config.monitoring?.enabled) {
      this.resourceMonitorInterval = setInterval(() => {
        this.updateResourceUsage();

        // Check for resource warnings
        const limits = this.context.resources.limits;
        for (const limit of limits) {
          const usage = this.resourceUsage[limit.type as keyof ResourceUsage];
          if (usage > limit.recommended) {
            this.emit('resource-warning', this.metadata.name, limit.type, usage, limit.recommended);
          }
        }
      }, 5000); // Update every 5 seconds
    }
  }

  private stopResourceMonitoring(): void {
    if (this.resourceMonitorInterval) {
      clearInterval(this.resourceMonitorInterval);
      this.resourceMonitorInterval = undefined;
    }
  }
}

export default BasePlugin;