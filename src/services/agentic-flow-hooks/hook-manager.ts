/**
 * Agentic Zen Hook Manager
 * 
 * Core hook management system for the Claude-Zen ecosystem.
 * Provides hook registration, execution, metrics, and pipeline management.
 */

import { EventEmitter } from 'events';
import type {
  AgenticHookType,
  HookRegistration,
  AgenticHookContext,
  HookHandlerResult,
  HookMetrics,
  HookPipeline
} from './types';

export class HookManager extends EventEmitter {
  private hooks: Map<string, HookRegistration> = new Map();
  private pipelines: Map<string, HookPipeline> = new Map();
  private metrics: Map<string, HookMetrics> = new Map();
  private cache: Map<string, any> = new Map();
  private logger: any;

  constructor(logger: any) {
    super();
    this.logger = logger;
  }

  /**
   * Register a new hook
   */
  register(hook: HookRegistration): void {
    this.hooks.set(hook.id, hook);
    this.initializeMetrics(hook.id);
    this.logger.debug(`Registered hook: ${hook.id} (type: ${hook.type})`);
    this.emit('hookRegistered', hook);
  }

  /**
   * Unregister a hook
   */
  unregister(id: string): boolean {
    const removed = this.hooks.delete(id);
    this.metrics.delete(id);
    if (removed) {
      this.logger.debug(`Unregistered hook: ${id}`);
      this.emit('hookUnregistered', id);
    }
    return removed;
  }

  /**
   * Execute hooks for a specific type
   */
  async executeHooks(type: AgenticHookType, context: AgenticHookContext): Promise<HookHandlerResult[]> {
    const relevantHooks = this.getHooksForType(type);
    const results: HookHandlerResult[] = [];

    for (const hook of relevantHooks) {
      try {
        const startTime = Date.now();
        const result = await this.executeHook(hook, context);
        const duration = Date.now() - startTime;
        
        this.updateMetrics(hook.id, true, duration);
        results.push(result);
        
        this.emit('hookExecuted', { hook: hook.id, result, duration });
      } catch (error) {
        this.updateMetrics(hook.id, false, 0);
        this.logger.error(`Hook execution failed: ${hook.id}`, error);
        
        results.push({
          success: false,
          modified: false,
          error: error instanceof Error ? error.message : String(error)
        });
        
        this.emit('hookError', { hook: hook.id, error });
      }
    }

    return results;
  }

  /**
   * Execute a single hook
   */
  private async executeHook(hook: HookRegistration, context: AgenticHookContext): Promise<HookHandlerResult> {
    if (!hook.enabled) {
      return { success: true, modified: false };
    }

    // Apply filters if present
    if (hook.filter && !this.passesFilter(hook.filter, context)) {
      return { success: true, modified: false };
    }

    return await hook.handler(context);
  }

  /**
   * Get hooks for a specific type, sorted by priority
   */
  private getHooksForType(type: AgenticHookType): HookRegistration[] {
    return Array.from(this.hooks.values())
      .filter(hook => hook.type === type && hook.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if context passes hook filter
   */
  private passesFilter(filter: any, context: AgenticHookContext): boolean {
    // Simple filter implementation - can be extended
    if (filter.conditions) {
      for (const [key, value] of Object.entries(filter.conditions)) {
        if (context.metadata[key] !== value) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Initialize metrics for a hook
   */
  private initializeMetrics(hookId: string): void {
    this.metrics.set(hookId, {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      errorRate: 0
    });
  }

  /**
   * Update metrics for a hook
   */
  private updateMetrics(hookId: string, success: boolean, duration: number): void {
    const metrics = this.metrics.get(hookId);
    if (!metrics) return;

    metrics.totalExecutions++;
    metrics.lastExecutionTime = Date.now();

    if (success) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }

    // Update average execution time
    const totalTime = metrics.averageExecutionTime * (metrics.totalExecutions - 1) + duration;
    metrics.averageExecutionTime = totalTime / metrics.totalExecutions;

    // Update error rate
    metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions;

    this.metrics.set(hookId, metrics);
  }

  /**
   * Get metrics for all hooks
   */
  getMetrics(): Record<string, HookMetrics> {
    const result: Record<string, HookMetrics> = {};
    this.metrics.forEach((metrics, hookId) => {
      result[hookId] = { ...metrics };
    });
    return result;
  }

  /**
   * Get metrics for a specific hook
   */
  getHookMetrics(hookId: string): HookMetrics | undefined {
    return this.metrics.get(hookId);
  }

  /**
   * Get all registered hooks
   */
  getRegisteredHooks(): HookRegistration[] {
    return Array.from(this.hooks.values());
  }

  /**
   * Get hooks by type
   */
  getHooksByType(type: AgenticHookType): HookRegistration[] {
    return Array.from(this.hooks.values()).filter(hook => hook.type === type);
  }

  /**
   * Create a pipeline
   */
  createPipeline(pipeline: HookPipeline): void {
    this.pipelines.set(pipeline.id, pipeline);
    this.logger.debug(`Created pipeline: ${pipeline.id}`);
    this.emit('pipelineCreated', pipeline);
  }

  /**
   * Execute a pipeline
   */
  async executePipeline(pipelineId: string, context: AgenticHookContext): Promise<HookHandlerResult[]> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline || !pipeline.enabled) {
      return [];
    }

    const results: HookHandlerResult[] = [];

    if (pipeline.parallel) {
      // Execute hooks in parallel
      const promises = pipeline.hooks.map(hookId => {
        const hook = this.hooks.get(hookId);
        return hook ? this.executeHook(hook, context) : Promise.resolve({ success: false, modified: false, error: 'Hook not found' });
      });
      
      const parallelResults = await Promise.allSettled(promises);
      for (const result of parallelResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({ success: false, modified: false, error: result.reason });
        }
      }
    } else {
      // Execute hooks sequentially
      for (const hookId of pipeline.hooks) {
        const hook = this.hooks.get(hookId);
        if (hook) {
          try {
            const result = await this.executeHook(hook, context);
            results.push(result);
          } catch (error) {
            results.push({
              success: false,
              modified: false,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }
    }

    this.emit('pipelineExecuted', { pipeline: pipelineId, results });
    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.debug('Hook cache cleared');
  }

  /**
   * Shutdown the hook manager
   */
  async shutdown(): Promise<void> {
    this.hooks.clear();
    this.pipelines.clear();
    this.metrics.clear();
    this.cache.clear();
    this.removeAllListeners();
    this.logger.info('Hook manager shutdown complete');
  }

  /**
   * Get system status
   */
  getStatus(): {
    registeredHooks: number;
    activeHooks: number;
    pipelines: number;
    totalExecutions: number;
  } {
    let totalExecutions = 0;
    this.metrics.forEach((metrics) => {
      totalExecutions += metrics.totalExecutions;
    });

    return {
      registeredHooks: this.hooks.size,
      activeHooks: Array.from(this.hooks.values()).filter(h => h.enabled).length,
      pipelines: this.pipelines.size,
      totalExecutions
    };
  }
}