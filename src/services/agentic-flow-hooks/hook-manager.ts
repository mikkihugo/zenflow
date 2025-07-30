/**
 * Agentic-Flow Hook Manager
 * Central orchestrator for all hook-based automation and workflow management
 */

import { EventEmitter } from 'node:events';
import { Hook, HookExecutionContext } from './types.js';

export class HookManager extends EventEmitter {
  private config = {enabled = { ...this.config, ...config };
  this;
  .
  setupInternalHooks();
  this;
  .
  log('info', 'Hook Manager initialized');
}

/**
 * Register a new hook
 */
async;
registerHook(registration = registration;

// Validate hook
const validation = await this.validateHook(hook);
if (!validation.valid) {
  throw new Error(`Hook validationfailed = this.hooks.get(name);
    if (!registration) {
      throw new Error(`Hook notfound = group.hooks.filter(h => h.name !== name);
}

this.emit('hook_unregistered', {type = 'parallel'
  ): Promise<HookExecutionContext> {
    if (!this._config._enabled) {
      this.log('debug', 'Hook execution disabled globally');
      return this.createEmptyExecutionContext(type, strategy);
    }

    const executionId = this.generateExecutionId();
const startTime = new Date();

const context = {executionId = this.getEnabledHooksForType(type);
context.totalHooks = hookNames.length;

if (hookNames.length === 0) {
  this.log('debug', `No hooks registered fortype = new Date();
      context.duration = context.endTime.getTime() - context.startTime.getTime();

      this.emit('hooks_executed', {
        executionId,
        type,
        strategy,duration = new Date();
      context.duration = context.endTime.getTime() - context.startTime.getTime();
      
      this.emit('hooks_execution_failed', {
        executionId,
        type,error = this.hooks.get(name);
    if (!registration) {
      throw new Error(`Hook notfound = Date.now();

  try {
      // Execute with timeout
      const result = await this.executeWithTimeout(
        registration.hook,
        payload,
        registration.hook.timeout || this.config.globalTimeout
      );

      const duration = Date.now() - startTime;
      const _hookResult = {
        ...result,
        duration,hookName = Date.now() - startTime;
      const hookResult = {success = hookNames.map(async (name) => {
      try {
        const result = await this.executeHook(name, payload);
        context.results[name] = result;
        
        if (result.success) {
          context.hooksExecuted.push(name);
        } else {
          context.hooksFailed.push(name);
        }
      } catch (_error) {
        context.hooksFailed.push(name);
        context.results[name] = {success = payload;

    for (const name of hookNames) {
      try {
        const result = await this.executeHook(name, currentPayload);
        context.results[name] = result;

        if (result.success) {
          context.hooksExecuted.push(name);
          // Pass result to next hook if pipeline behavior is desired
          if (result.data) {
            currentPayload = {
              ...currentPayload,previousResult = === 'stop') {
            break;
          }
        }
      } catch (_error) {
        context.hooksFailed.push(name);
        context.results[name] = {success = === 'stop') {
          break;
        }
      }
    }
  }

  /**
   * Execute hooks by priority order
   */
  private async executePriority(hookNames = hookNames
      .map(name => ({
        name,hook = > b.hook.priority - a.hook.priority);

    await this.executeSequential(
      sortedHooks.map(h => h.name),
      payload,
      context
    );
  }

  /**
   * Execute hooks conditionally
   */
  private
  async;
  executeConditional(hookNames = this.hooks.get(name)!;

  // Check conditions
  if (registration.hook.conditions) {
    const shouldExecute = this.evaluateConditions(registration.hook.conditions, payload);

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
  } catch (_error) {
    context.hooksFailed.push(name);
    context.results[name] = {success = payload.data;

    for (const name of hookNames) {
      const pipelinePayload = {
        ...payload,data = await this.executeHook(name, pipelinePayload);
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
    }
    catch (error) 
        context.hooksFailed.push(name)
    context.results[name] = success = === 'stop')
    break;
  }

  /**
   * Get enabled hooks for a specific type
   */
  private
  getEnabledHooksForType(
type = this.hooksByType.get(type) || new Set();
  return Array.from(typeHooks).filter(name => this.enabledHooks.has(name));
}

/**
 * Execute hook with timeout
 */
private
async;
executeWithTimeout((hook) => {
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
  private updateHookMetrics(name = this.hookMetrics.get(name)
if (!metrics) return;

metrics.totalExecutions++;

if (result.success) {
  metrics.successfulExecutions++;
} else {
  metrics.failedExecutions++;
}

// Update execution history
metrics.executionHistory.push({timestamp = metrics.executionHistory.slice(-1000);
}

// Recalculate averages
const durations = metrics.executionHistory.map((h) => h.duration);
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
  private evaluateConditions(conditions =>
{
  const { type, field, value,function = condition;
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
    default = > current?.[key], obj);
  }

  /**
   * Validate hook
   */
  private
  async;
  validateHook(hook = [];
  const warnings = [];
  const suggestions = [];

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

  return {valid = === 0,
      errors,
      warnings,
      suggestions
    };
}

/**
 * Setup internal system hooks
 */
private
setupInternalHooks();
: void
{
    // Performance monitoring hook
    this.registerHook({
      name => {
          const { metric, value, threshold } = payload.data;
          
          if (threshold && value > threshold) {
            this.emit('performance_threshold_exceeded', {
              metric,
              value,
              threshold,
              timestamp => {
      this.log('error', `Failed to register system performancemonitor = new Date();
    return {
      executionId = {debug = levels[this.config.logLevel] || 1;
    const messageLevel = levels[level] || 1;

    if (messageLevel >= currentLevel) {
      console.warn(`[HookManager = {};
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
