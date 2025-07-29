/**
 * Agentic-Flow Hook Manager
 * Central orchestrator for all hook-based automation and workflow management
 */

import { EventEmitter } from 'events';
import {
  Hook,
  HookType,
  HookPayload,
  HookResult,
  HookContext,
  HookRegistration,
  HookExecutionContext,
  HookExecutionStrategy,
  HookManagerConfig,
  HookMetrics,
  HookLifecycleEvent,
  HookGroup,
  HookChain,
  ValidationResult
} from './types.js';

export class HookManager extends EventEmitter {
  private hooks: Map<string, HookRegistration> = new Map();
  private hooksByType: Map<HookType, Set<string>> = new Map();
  private hookGroups: Map<string, HookGroup> = new Map();
  private hookChains: Map<string, HookChain> = new Map();
  private hookMetrics: Map<string, HookMetrics> = new Map();
  private activeExecutions: Map<string, HookExecutionContext> = new Map();
  private enabledHooks: Set<string> = new Set();

  private config: HookManagerConfig = {
    enabled: true,
    globalTimeout: 30000,
    maxConcurrentHooks: 10,
    enableLogging: true,
    logLevel: 'info',
    enableMetrics: true,
    enableProfiling: false,
    errorHandling: 'continue',
    retryStrategy: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    }
  };

  constructor(config?: Partial<HookManagerConfig>) {
    super();
    this.config = { ...this.config, ...config };
    this.setupInternalHooks();
    this.log('info', 'Hook Manager initialized');
  }

  /**
   * Register a new hook
   */
  async registerHook(registration: HookRegistration): Promise<void> {
    const { name, type, hook, group, dependencies } = registration;

    // Validate hook
    const validation = await this.validateHook(hook);
    if (!validation.valid) {
      throw new Error(`Hook validation failed: ${validation.errors.join(', ')}`);
    }

    // Store hook registration
    this.hooks.set(name, registration);
    
    // Index by type
    if (!this.hooksByType.has(type)) {
      this.hooksByType.set(type, new Set());
    }
    this.hooksByType.get(type)!.add(name);

    // Enable hook by default
    if (hook.enabled) {
      this.enabledHooks.add(name);
    }

    // Initialize metrics
    this.hookMetrics.set(name, {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      p95ExecutionTime: 0,
      p99ExecutionTime: 0,
      errorRate: 0,
      executionHistory: []
    });

    // Add to group if specified
    if (group) {
      await this.addHookToGroup(name, group);
    }

    this.emit('hook_registered', {
      type: 'registered',
      hookName: name,
      timestamp: new Date(),
      data: { type, group, dependencies }
    } as HookLifecycleEvent);

    this.log('info', `Hook registered: ${name} (type: ${type})`);
  }

  /**
   * Unregister a hook
   */
  async unregisterHook(name: string): Promise<void> {
    const registration = this.hooks.get(name);
    if (!registration) {
      throw new Error(`Hook not found: ${name}`);
    }

    // Remove from all indexes
    this.hooks.delete(name);
    this.hooksByType.get(registration.type)?.delete(name);
    this.enabledHooks.delete(name);
    this.hookMetrics.delete(name);

    // Remove from groups
    for (const group of this.hookGroups.values()) {
      group.hooks = group.hooks.filter(h => h.name !== name);
    }

    this.emit('hook_unregistered', {
      type: 'unregistered',
      hookName: name,
      timestamp: new Date()
    } as HookLifecycleEvent);

    this.log('info', `Hook unregistered: ${name}`);
  }

  /**
   * Execute hooks of a specific type
   */
  async executeHooks(
    type: HookType,
    payload: HookPayload,
    strategy: HookExecutionStrategy = 'parallel'
  ): Promise<HookExecutionContext> {
    if (!this.config.enabled) {
      this.log('debug', 'Hook execution disabled globally');
      return this.createEmptyExecutionContext(type, strategy);
    }

    const executionId = this.generateExecutionId();
    const startTime = new Date();

    const context: HookExecutionContext = {
      executionId,
      hookType: type,
      startTime,
      hooksExecuted: [],
      hooksSkipped: [],
      hooksFailed: [],
      results: {},
      totalHooks: 0,
      strategy,
      metadata: {}
    };

    this.activeExecutions.set(executionId, context);

    try {
      // Get hooks for this type
      const hookNames = this.getEnabledHooksForType(type);
      context.totalHooks = hookNames.length;

      if (hookNames.length === 0) {
        this.log('debug', `No hooks registered for type: ${type}`);
        return context;
      }

      this.log('debug', `Executing ${hookNames.length} hooks for type: ${type} with strategy: ${strategy}`);

      // Execute hooks based on strategy
      switch (strategy) {
        case 'parallel':
          await this.executeParallel(hookNames, payload, context);
          break;
        case 'sequential':
          await this.executeSequential(hookNames, payload, context);
          break;
        case 'priority':
          await this.executePriority(hookNames, payload, context);
          break;
        case 'conditional':
          await this.executeConditional(hookNames, payload, context);
          break;
        case 'pipeline':
          await this.executePipeline(hookNames, payload, context);
          break;
        default:
          await this.executeParallel(hookNames, payload, context);
      }

      context.endTime = new Date();
      context.duration = context.endTime.getTime() - context.startTime.getTime();

      this.emit('hooks_executed', {
        executionId,
        type,
        strategy,
        duration: context.duration,
        hooksExecuted: context.hooksExecuted,
        hooksFailed: context.hooksFailed
      });

      this.log('info', `Hook execution completed: ${executionId} (${context.duration}ms)`);

    } catch (error) {
      context.endTime = new Date();
      context.duration = context.endTime.getTime() - context.startTime.getTime();
      
      this.emit('hooks_execution_failed', {
        executionId,
        type,
        error: error.message,
        duration: context.duration
      });

      this.log('error', `Hook execution failed: ${executionId} - ${error.message}`);
    } finally {
      this.activeExecutions.delete(executionId);
    }

    return context;
  }

  /**
   * Execute a specific hook by name
   */
  async executeHook(name: string, payload: HookPayload): Promise<HookResult> {
    const registration = this.hooks.get(name);
    if (!registration) {
      throw new Error(`Hook not found: ${name}`);
    }

    if (!this.enabledHooks.has(name)) {
      this.log('debug', `Hook disabled: ${name}`);
      return {
        success: false,
        error: new Error('Hook is disabled'),
        duration: 0,
        hookName: name,
        timestamp: new Date()
      };
    }

    const startTime = Date.now();
    
    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(
        registration.hook,
        payload,
        registration.hook.timeout || this.config.globalTimeout
      );

      const duration = Date.now() - startTime;
      const hookResult: HookResult = {
        ...result,
        duration,
        hookName: name,
        timestamp: new Date()
      };

      // Update metrics
      this.updateHookMetrics(name, hookResult);

      this.emit('hook_executed', {
        type: 'executed',
        hookName: name,
        timestamp: new Date(),
        data: { duration, success: result.success }
      } as HookLifecycleEvent);

      return hookResult;

    } catch (error) {
      const duration = Date.now() - startTime;
      const hookResult: HookResult = {
        success: false,
        error,
        duration,
        hookName: name,
        timestamp: new Date()
      };

      this.updateHookMetrics(name, hookResult);

      this.emit('hook_failed', {
        type: 'failed',
        hookName: name,
        timestamp: new Date(),
        error,
        data: { duration }
      } as HookLifecycleEvent);

      return hookResult;
    }
  }

  /**
   * Execute hooks in parallel
   */
  private async executeParallel(
    hookNames: string[],
    payload: HookPayload,
    context: HookExecutionContext
  ): Promise<void> {
    const promises = hookNames.map(async (name) => {
      try {
        const result = await this.executeHook(name, payload);
        context.results[name] = result;
        
        if (result.success) {
          context.hooksExecuted.push(name);
        } else {
          context.hooksFailed.push(name);
        }
      } catch (error) {
        context.hooksFailed.push(name);
        context.results[name] = {
          success: false,
          error,
          duration: 0,
          hookName: name,
          timestamp: new Date()
        };
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Execute hooks sequentially
   */
  private async executeSequential(
    hookNames: string[],
    payload: HookPayload,
    context: HookExecutionContext
  ): Promise<void> {
    let currentPayload = payload;

    for (const name of hookNames) {
      try {
        const result = await this.executeHook(name, currentPayload);
        context.results[name] = result;

        if (result.success) {
          context.hooksExecuted.push(name);
          // Pass result to next hook if pipeline behavior is desired
          if (result.data) {
            currentPayload = {
              ...currentPayload,
              previousResult: result.data
            };
          }
        } else {
          context.hooksFailed.push(name);
          if (this.config.errorHandling === 'stop') {
            break;
          }
        }
      } catch (error) {
        context.hooksFailed.push(name);
        context.results[name] = {
          success: false,
          error,
          duration: 0,
          hookName: name,
          timestamp: new Date()
        };

        if (this.config.errorHandling === 'stop') {
          break;
        }
      }
    }
  }

  /**
   * Execute hooks by priority order
   */
  private async executePriority(
    hookNames: string[],
    payload: HookPayload,
    context: HookExecutionContext
  ): Promise<void> {
    // Sort hooks by priority
    const sortedHooks = hookNames
      .map(name => ({
        name,
        hook: this.hooks.get(name)!.hook
      }))
      .sort((a, b) => b.hook.priority - a.hook.priority);

    await this.executeSequential(
      sortedHooks.map(h => h.name),
      payload,
      context
    );
  }

  /**
   * Execute hooks conditionally
   */
  private async executeConditional(
    hookNames: string[],
    payload: HookPayload,
    context: HookExecutionContext
  ): Promise<void> {
    for (const name of hookNames) {
      const registration = this.hooks.get(name)!;
      
      // Check conditions
      if (registration.hook.conditions) {
        const shouldExecute = this.evaluateConditions(
          registration.hook.conditions,
          payload
        );
        
        if (!shouldExecute) {
          context.hooksSkipped.push(name);
          continue;
        }
      }

      try {
        const result = await this.executeHook(name, payload);
        context.results[name] = result;

        if (result.success) {
          context.hooksExecuted.push(name);
        } else {
          context.hooksFailed.push(name);
        }
      } catch (error) {
        context.hooksFailed.push(name);
        context.results[name] = {
          success: false,
          error,
          duration: 0,
          hookName: name,
          timestamp: new Date()
        };
      }
    }
  }

  /**
   * Execute hooks in pipeline mode (output of one becomes input of next)
   */
  private async executePipeline(
    hookNames: string[],
    payload: HookPayload,
    context: HookExecutionContext
  ): Promise<void> {
    let currentData = payload.data;

    for (const name of hookNames) {
      const pipelinePayload: HookPayload = {
        ...payload,
        data: currentData
      };

      try {
        const result = await this.executeHook(name, pipelinePayload);
        context.results[name] = result;

        if (result.success) {
          context.hooksExecuted.push(name);
          // Use result data as input for next hook
          currentData = result.data || currentData;
        } else {
          context.hooksFailed.push(name);
          if (this.config.errorHandling === 'stop') {
            break;
          }
        }
      } catch (error) {
        context.hooksFailed.push(name);
        context.results[name] = {
          success: false,
          error,
          duration: 0,
          hookName: name,
          timestamp: new Date()
        };

        if (this.config.errorHandling === 'stop') {
          break;
        }
      }
    }
  }

  /**
   * Get enabled hooks for a specific type
   */
  private getEnabledHooksForType(type: HookType): string[] {
    const typeHooks = this.hooksByType.get(type) || new Set();
    return Array.from(typeHooks).filter(name => this.enabledHooks.has(name));
  }

  /**
   * Execute hook with timeout
   */
  private async executeWithTimeout(
    hook: Hook,
    payload: HookPayload,
    timeout: number
  ): Promise<HookResult> {
    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Hook execution timeout after ${timeout}ms`));
      }, timeout);

      try {
        const result = await hook.execute(payload);
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Update hook metrics
   */
  private updateHookMetrics(name: string, result: HookResult): void {
    if (!this.config.enableMetrics) return;

    const metrics = this.hookMetrics.get(name);
    if (!metrics) return;

    metrics.totalExecutions++;
    
    if (result.success) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }

    // Update execution history
    metrics.executionHistory.push({
      timestamp: result.timestamp,
      duration: result.duration,
      success: result.success,
      error: result.error?.message
    });

    // Keep only last 1000 executions
    if (metrics.executionHistory.length > 1000) {
      metrics.executionHistory = metrics.executionHistory.slice(-1000);
    }

    // Recalculate averages
    const durations = metrics.executionHistory.map(h => h.duration);
    metrics.averageExecutionTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    // Calculate percentiles
    if (durations.length > 0) {
      const sorted = durations.sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p99Index = Math.floor(sorted.length * 0.99);
      metrics.p95ExecutionTime = sorted[p95Index] || 0;
      metrics.p99ExecutionTime = sorted[p99Index] || 0;
    }

    metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions;
    metrics.lastExecution = result.timestamp;
  }

  /**
   * Evaluate hook conditions
   */
  private evaluateConditions(conditions: any[], payload: HookPayload): boolean {
    return conditions.every(condition => {
      const { type, field, value, function: conditionFn } = condition;
      const fieldValue = this.getNestedValue(payload, field);

      switch (type) {
        case 'equals':
          return fieldValue === value;
        case 'contains':
          return String(fieldValue).includes(String(value));
        case 'regex':
          return new RegExp(value).test(String(fieldValue));
        case 'function':
          return conditionFn ? conditionFn(payload) : false;
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        case 'greater':
          return Number(fieldValue) > Number(value);
        case 'less':
          return Number(fieldValue) < Number(value);
        default:
          return false;
      }
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate hook
   */
  private async validateHook(hook: Hook): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!hook.name || typeof hook.name !== 'string') {
      errors.push('Hook name is required and must be a string');
    }

    if (!hook.execute || typeof hook.execute !== 'function') {
      errors.push('Hook execute function is required');
    }

    if (typeof hook.priority !== 'number' || hook.priority < 0) {
      warnings.push('Hook priority should be a positive number');
    }

    if (typeof hook.timeout !== 'number' || hook.timeout <= 0) {
      warnings.push('Hook timeout should be a positive number');
      suggestions.push('Consider setting a reasonable timeout (e.g., 5000ms)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Setup internal system hooks
   */
  private setupInternalHooks(): void {
    // Performance monitoring hook
    this.registerHook({
      name: 'system-performance-monitor',
      type: 'performance-metric',
      hook: {
        name: 'system-performance-monitor',
        description: 'Monitor system performance metrics',
        priority: 1000,
        enabled: true,
        async: true,
        timeout: 5000,
        retries: 1,
        execute: async (payload) => {
          const { metric, value, threshold } = payload.data;
          
          if (threshold && value > threshold) {
            this.emit('performance_threshold_exceeded', {
              metric,
              value,
              threshold,
              timestamp: new Date()
            });
          }

          return {
            success: true,
            data: { metric, value, recorded: true },
            hookName: 'system-performance-monitor',
            duration: 0,
            timestamp: new Date()
          };
        }
      }
    }).catch(error => {
      this.log('error', `Failed to register system performance monitor: ${error.message}`);
    });
  }

  /**
   * Utility methods
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createEmptyExecutionContext(
    type: HookType, 
    strategy: HookExecutionStrategy
  ): HookExecutionContext {
    const now = new Date();
    return {
      executionId: this.generateExecutionId(),
      hookType: type,
      startTime: now,
      endTime: now,
      duration: 0,
      hooksExecuted: [],
      hooksSkipped: [],
      hooksFailed: [],
      results: {},
      totalHooks: 0,
      strategy,
      metadata: {}
    };
  }

  private log(level: string, message: string): void {
    if (!this.config.enableLogging) return;

    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.config.logLevel] || 1;
    const messageLevel = levels[level] || 1;

    if (messageLevel >= currentLevel) {
      console.log(`[HookManager:${level.toUpperCase()}] ${message}`);
    }
  }

  private async addHookToGroup(hookName: string, groupName: string): Promise<void> {
    // Implementation for adding hooks to groups
    // This would integrate with the group management system
  }

  // Public API methods
  async enableHook(name: string): Promise<void> {
    if (!this.hooks.has(name)) {
      throw new Error(`Hook not found: ${name}`);
    }
    
    this.enabledHooks.add(name);
    this.emit('hook_enabled', {
      type: 'enabled',
      hookName: name,
      timestamp: new Date()
    } as HookLifecycleEvent);
  }

  async disableHook(name: string): Promise<void> {
    this.enabledHooks.delete(name);
    this.emit('hook_disabled', {
      type: 'disabled',
      hookName: name,
      timestamp: new Date()
    } as HookLifecycleEvent);
  }

  getHookMetrics(name: string): HookMetrics | null {
    return this.hookMetrics.get(name) || null;
  }

  getAllHookMetrics(): Record<string, HookMetrics> {
    const metrics: Record<string, HookMetrics> = {};
    for (const [name, metric] of this.hookMetrics) {
      metrics[name] = metric;
    }
    return metrics;
  }

  getActiveExecutions(): HookExecutionContext[] {
    return Array.from(this.activeExecutions.values());
  }

  async cleanup(): Promise<void> {
    this.hooks.clear();
    this.hooksByType.clear();
    this.hookGroups.clear();
    this.hookChains.clear();
    this.hookMetrics.clear();
    this.activeExecutions.clear();
    this.enabledHooks.clear();
    this.removeAllListeners();
  }
}