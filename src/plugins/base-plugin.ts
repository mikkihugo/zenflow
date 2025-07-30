/**
 * Base Plugin Class
 * TypeScript foundation for all Claude Code Flow plugins
 */

import { EventEmitter } from 'events';
import { 
  Plugin, 
  PluginConfig, 
  PluginManifest, 
  PluginMetadata, 
  PluginContext,
  PluginHealthResult,
  PluginMetrics,
  PluginDiagnostics,
  PluginTestResult,
  ResourceUsage,
  HookType,
  HookHandler,
  HookOptions,
  HookResult,
  PluginAPI,
  ValidationResult,
  PluginEvents,
  JSONObject
} from '../types/plugin.js';
import { LifecycleState } from '../types/core.js';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

export abstract class BasePlugin extends EventEmitter implements Plugin {
  public readonly id: string;
  public readonly manifest: PluginManifest;
  public readonly config: PluginConfig;
  public readonly metadata: PluginMetadata;
  public readonly context: PluginContext;

  protected state: LifecycleState = 'uninitialized';
  protected hooks: Map<HookType, Set<HookHandler>> = new Map();
  protected apis: Map<string, PluginAPI> = new Map();
  protected resourceUsage: ResourceUsage;
  protected metrics: PluginMetrics;
  protected healthScore: number = 100;
  protected lastHealthCheck: Date = new Date();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super();
    
    this.id = crypto.randomUUID();
    this.manifest = manifest;
    this.config = config;
    this.context = context;
    
    // Initialize metadata
    this.metadata = {
      id: this.id,
      name: manifest.name,
      version: manifest.version,
      type: manifest.type,
      status: 'unloaded',
      loadedAt: new Date(),
      lastActivity: new Date(),
      errorCount: 0,
      restartCount: 0,
      metrics: {
        callCount: 0,
        averageExecutionTime: 0,
        totalExecutionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        successRate: 100
      },
      health: {
        status: 'healthy',
        score: 100,
        issues: [],
        lastCheck: new Date()
      },
      dependencies: {
        loaded: [],
        missing: [],
        conflicts: []
      }
    };

    // Initialize resource usage tracking
    this.resourceUsage = {
      memory: 0,
      cpu: 0,
      disk: 0,
      network: 0,
      handles: 0,
      timestamp: new Date()
    };

    // Initialize metrics
    this.metrics = {
      pluginName: manifest.name,
      performance: {
        callCount: 0,
        averageExecutionTime: 0,
        totalExecutionTime: 0,
        errorRate: 0,
        successRate: 100,
        throughput: 0
      },
      resources: {
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
        networkUsage: 0
      },
      hooks: {},
      apis: {}
    };

    // Setup lifecycle event handlers
    this.setupLifecycleEvents();
  }

  // Abstract methods that must be implemented by concrete plugins
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onDestroy(): Promise<void>;

  // Plugin lifecycle management
  async initialize(): Promise<void> {
    if (this.state !== 'uninitialized') {
      throw new Error(`Cannot initialize plugin in state: ${this.state}`);
    }

    try {
      this.setState('initializing');
      this.emit('initializing', this.manifest.name);
      
      // Validate dependencies
      await this.validateDependencies();
      
      // Initialize resource monitoring
      this.startResourceMonitoring();
      
      // Call plugin-specific initialization
      await this.onInitialize();
      
      this.setState('initialized');
      this.metadata.status = 'loaded';
      this.emit('initialized', this.manifest.name);
      
      this.updateLastActivity();
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.manifest.name, { 
        message: error.message, 
        stack: error.stack,
        timestamp: new Date()
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
      this.emit('starting', this.manifest.name);
      
      await this.onStart();
      
      this.setState('running');
      this.metadata.status = 'active';
      this.emit('started', this.manifest.name);
      
      this.updateLastActivity();
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.manifest.name, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
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
      this.emit('stopping', this.manifest.name);
      
      await this.onStop();
      
      this.setState('stopped');
      this.metadata.status = 'disabled';
      this.emit('stopped', this.manifest.name);
      
      this.updateLastActivity();
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.manifest.name, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      if (this.state === 'running') {
        await this.stop();
      }

      this.setState('destroying');
      this.emit('unloading', this.manifest.name);
      
      // Stop resource monitoring
      this.stopResourceMonitoring();
      
      // Cleanup hooks and APIs
      this.hooks.clear();
      this.apis.clear();
      
      // Call plugin-specific cleanup
      await this.onDestroy();
      
      this.setState('destroyed');
      this.metadata.status = 'unloaded';
      this.emit('unloaded', this.manifest.name);
      
    } catch (error) {
      this.setState('error');
      this.metadata.status = 'error';
      this.metadata.errorCount++;
      this.emit('error', this.manifest.name, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      throw error;
    }
  }

  async load(config: PluginConfig): Promise<void> {
    // Update configuration
    Object.assign(this.config, config);
    
    // Initialize and start
    await this.initialize();
    if (config.autoLoad !== false) {
      await this.start();
    }
  }

  async unload(): Promise<void> {
    await this.destroy();
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
  async registerHook(type: HookType, handler: HookHandler, options?: HookOptions): Promise<void> {
    if (!this.hooks.has(type)) {
      this.hooks.set(type, new Set());
    }
    
    this.hooks.get(type)!.add(handler);
    
    // Initialize hook metrics
    if (!this.metrics.hooks[type]) {
      this.metrics.hooks[type] = {
        callCount: 0,
        averageExecutionTime: 0,
        errorCount: 0
      };
    }
    
    this.emit('hook-registered', this.manifest.name, type);
    this.context.apis.logger.info(`Hook registered: ${type}`, { plugin: this.manifest.name });
  }

  async unregisterHook(type: HookType, handler: HookHandler): Promise<void> {
    const handlers = this.hooks.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.hooks.delete(type);
      }
    }
    
    this.emit('hook-unregistered', this.manifest.name, type);
    this.context.apis.logger.info(`Hook unregistered: ${type}`, { plugin: this.manifest.name });
  }

  async executeHook(type: HookType, context: JSONObject): Promise<HookResult> {
    const handlers = this.hooks.get(type);
    if (!handlers || handlers.size === 0) {
      return {
        success: true,
        continue: true,
        stop: false,
        skip: false,
        executionTime: 0,
        resourcesUsed: this.resourceUsage
      };
    }

    const startTime = performance.now();
    const results: HookResult[] = [];

    try {
      for (const handler of handlers) {
        const hookContext = {
          type,
          data: context,
          metadata: {
            pluginName: this.manifest.name,
            timestamp: new Date(),
            requestId: crypto.randomUUID(),
            userId: this.context.security?.userId,
            sessionId: this.context.security?.sessionId
          },
          system: this.context.system,
          previousResults: results,
          signal: new AbortController().signal
        };

        const result = await handler(hookContext);
        results.push(result);

        if (result.stop) {
          break;
        }
      }

      const executionTime = performance.now() - startTime;
      this.updateHookMetrics(type, executionTime, true);

      this.emit('hook-executed', this.manifest.name, type, executionTime);

      return {
        success: true,
        data: results.reduce((acc, result) => ({ ...acc, ...result.data }), {}),
        continue: results.every(r => r.continue),
        stop: results.some(r => r.stop),
        skip: results.some(r => r.skip),
        executionTime,
        resourcesUsed: this.resourceUsage
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.updateHookMetrics(type, executionTime, false);
      
      this.emit('hook-failed', this.manifest.name, type, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });

      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack,
          code: 'HOOK_EXECUTION_ERROR',
          timestamp: new Date()
        },
        continue: false,
        stop: true,
        skip: false,
        executionTime,
        resourcesUsed: this.resourceUsage
      };
    }
  }

  // API system implementation
  async registerAPI(name: string, api: PluginAPI): Promise<void> {
    this.apis.set(name, api);
    
    // Initialize API metrics
    this.metrics.apis[name] = {
      callCount: 0,
      averageExecutionTime: 0,
      errorCount: 0
    };
    
    this.emit('api-registered', this.manifest.name, name);
    this.context.apis.logger.info(`API registered: ${name}`, { plugin: this.manifest.name });
  }

  async unregisterAPI(name: string): Promise<void> {
    this.apis.delete(name);
    delete this.metrics.apis[name];
    
    this.emit('api-unregistered', this.manifest.name, name);
    this.context.apis.logger.info(`API unregistered: ${name}`, { plugin: this.manifest.name });
  }

  async callAPI(name: string, method: string, args: any[]): Promise<any> {
    const api = this.apis.get(name);
    if (!api) {
      throw new Error(`API not found: ${name}`);
    }

    const apiMethod = api.methods.find(m => m.name === method);
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
      
      this.emit('api-called', this.manifest.name, name, executionTime);
      
      return result;
    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.updateAPIMetrics(name, executionTime, false);
      
      this.emit('api-failed', this.manifest.name, name, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  // Resource management
  async allocateResource(type: string, amount: number): Promise<boolean> {
    // Check if resource allocation would exceed limits
    const limits = this.context.resources.limits.find(l => l.type === type);
    if (limits && this.resourceUsage[type as keyof ResourceUsage] + amount > limits.maximum) {
      this.emit('resource-exceeded', this.manifest.name, type, 
        this.resourceUsage[type as keyof ResourceUsage] + amount, limits.maximum);
      return false;
    }

    // Allocate resource (simplified - would integrate with actual resource manager)
    return true;
  }

  async releaseResource(type: string, amount: number): Promise<void> {
    // Release resource (simplified - would integrate with actual resource manager)
  }

  async getResourceUsage(): Promise<ResourceUsage> {
    this.updateResourceUsage();
    return { ...this.resourceUsage };
  }

  // Health and diagnostics
  async healthCheck(): Promise<PluginHealthResult> {
    const issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      component: string;
      recommendation?: string;
    }> = [];

    // Check error rate
    if (this.metrics.performance.errorRate > 10) {
      issues.push({
        severity: 'high',
        message: `High error rate: ${this.metrics.performance.errorRate.toFixed(2)}%`,
        component: 'performance',
        recommendation: 'Review error logs and fix underlying issues'
      });
    }

    // Check memory usage
    if (this.resourceUsage.memory > 1000) { // MB
      issues.push({
        severity: 'medium',
        message: `High memory usage: ${this.resourceUsage.memory}MB`,
        component: 'resources',
        recommendation: 'Consider optimizing memory usage or increasing limits'
      });
    }

    // Check if plugin is responsive
    if (this.state === 'error') {
      issues.push({
        severity: 'critical',
        message: 'Plugin is in error state',
        component: 'lifecycle',
        recommendation: 'Restart plugin or check error logs'
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
      metrics: {
        uptime: Date.now() - this.metadata.loadedAt.getTime(),
        errorCount: this.metadata.errorCount,
        successRate: this.metrics.performance.successRate
      },
      lastCheck: this.lastHealthCheck
    };
  }

  async getMetrics(): Promise<PluginMetrics> {
    this.updateResourceUsage();
    return { ...this.metrics };
  }

  async getDiagnostics(): Promise<PluginDiagnostics> {
    return {
      pluginName: this.manifest.name,
      version: this.manifest.version,
      status: this.metadata.status,
      uptime: Date.now() - this.metadata.loadedAt.getTime(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memoryUsage: process.memoryUsage()
      },
      dependencies: this.metadata.dependencies,
      configuration: {
        valid: true, // Would validate actual config
        errors: [],
        warnings: []
      },
      performance: {
        averageResponseTime: this.metrics.performance.averageExecutionTime,
        throughput: this.metrics.performance.throughput,
        errorRate: this.metrics.performance.errorRate,
        memoryLeaks: false // Would check for actual memory leaks
      },
      security: {
        permissions: this.context.security?.permissions || [],
        violations: [],
        sandboxed: this.config.sandbox
      }
    };
  }

  async performSelfTest(): Promise<PluginTestResult> {
    const tests: Array<{
      name: string;
      status: 'passed' | 'failed' | 'skipped';
      duration: number;
      error?: string;
      message?: string;
    }> = [];

    const startTime = performance.now();

    // Test 1: Basic functionality
    try {
      const testStart = performance.now();
      await this.healthCheck();
      tests.push({
        name: 'Health Check',
        status: 'passed',
        duration: performance.now() - testStart
      });
    } catch (error) {
      tests.push({
        name: 'Health Check',
        status: 'failed',
        duration: performance.now() - startTime,
        error: error.message
      });
    }

    // Test 2: Configuration validation
    try {
      const testStart = performance.now();
      await this.validateConfiguration(this.config);
      tests.push({
        name: 'Configuration Validation',
        status: 'passed',
        duration: performance.now() - testStart
      });
    } catch (error) {
      tests.push({
        name: 'Configuration Validation',
        status: 'failed',
        duration: performance.now() - testStart,
        error: error.message
      });
    }

    const totalDuration = performance.now() - startTime;
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const skippedTests = tests.filter(t => t.status === 'skipped').length;

    return {
      passed: failedTests === 0,
      totalTests: tests.length,
      passedTests,
      failedTests,
      skippedTests,
      duration: totalDuration,
      tests
    };
  }

  // Configuration management
  getConfiguration(): JSONObject {
    return { ...this.config.settings };
  }

  async updateConfiguration(updates: JSONObject): Promise<void> {
    const newSettings = { ...this.config.settings, ...updates };
    await this.configure({ ...this.config, settings: newSettings });
  }

  async validateConfiguration(config: JSONObject): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Basic validation - plugins can override this
    if (this.manifest.configuration.required) {
      for (const field of this.manifest.configuration.required) {
        if (!(field in config)) {
          results.push({
            valid: false,
            field,
            message: `Required field '${field}' is missing`,
            code: 'REQUIRED_FIELD_MISSING'
          });
        }
      }
    }

    return results;
  }

  async resetConfiguration(): Promise<void> {
    await this.configure({
      ...this.config,
      settings: { ...this.manifest.configuration.defaults }
    });
  }

  // Protected utility methods
  protected setState(state: LifecycleState): void {
    this.state = state;
  }

  protected updateLastActivity(): void {
    this.metadata.lastActivity = new Date();
  }

  protected updateResourceUsage(): void {
    const memUsage = process.memoryUsage();
    this.resourceUsage = {
      memory: memUsage.heapUsed / 1024 / 1024, // MB
      cpu: process.cpuUsage().user / 1000, // ms
      disk: 0, // Would implement actual disk usage tracking
      network: 0, // Would implement actual network usage tracking
      handles: (process as any)._getActiveHandles?.()?.length || 0,
      timestamp: new Date()
    };

    // Update metrics
    this.metrics.resources.memoryUsage = this.resourceUsage.memory;
    this.metrics.resources.cpuUsage = this.resourceUsage.cpu;
  }

  protected updateHookMetrics(type: HookType, executionTime: number, success: boolean): void {
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
    this.on('api-called', (pluginName, apiName, duration) => {
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

  private async validateDependencies(): Promise<void> {
    // Validate system dependencies
    for (const dep of this.manifest.dependencies.system) {
      // Would implement actual system dependency validation
    }

    // Validate plugin dependencies
    for (const [pluginName, version] of Object.entries(this.manifest.dependencies.plugins)) {
      // Would implement actual plugin dependency validation
    }

    // Validate Node.js version
    const nodeVersion = process.version;
    // Would implement actual version validation
  }

  private resourceMonitorInterval?: NodeJS.Timeout;

  private startResourceMonitoring(): void {
    if (this.config.monitoring?.enabled) {
      this.resourceMonitorInterval = setInterval(() => {
        this.updateResourceUsage();
        
        // Check for resource warnings
        const limits = this.context.resources.limits;
        for (const limit of limits) {
          const usage = this.resourceUsage[limit.type as keyof ResourceUsage];
          if (usage > limit.recommended) {
            this.emit('resource-warning', this.manifest.name, limit.type, usage, limit.recommended);
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