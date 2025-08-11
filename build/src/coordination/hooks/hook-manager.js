/**
 * Hook Manager - Manages hook lifecycle and execution.
 */
/**
 * @file Hook management system.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
import { DefaultHookSystem } from './hook-system-core.ts';
const logger = getLogger('HookManager');
/**
 * Default Hook Manager Implementation.
 *
 * @example
 */
export class DefaultHookManager extends EventEmitter {
    hookSystem;
    config;
    activeHooks = new Set();
    logger;
    // xxx NEEDS_HUMAN: performanceOptimizer declared but not used - verify if needed for future features
    // private performanceOptimizer: {
    //   optimize: (context: any) => Promise<{ optimized: boolean; context: any }>;
    //   getMetrics: () => { hooks: number };
    // };
    constructor(hookSystem, config) {
        super();
        this.hookSystem = hookSystem || new DefaultHookSystem();
        this.config = {
            maxConcurrentHooks: 10,
            defaultTimeout: 30000,
            enableLogging: true,
            ...config,
        };
        this.logger = logger;
        // xxx NEEDS_HUMAN: performanceOptimizer initialization removed - was not being used
        // this.performanceOptimizer = {
        //   optimize: async (context: any) => ({ optimized: true, context }),
        //   getMetrics: () => ({ hooks: this.activeHooks.size }),
        // };
    }
    async executeHook(hookName, context, _timeout) {
        const startTime = Date.now();
        const hookId = `${hookName}-${startTime}`;
        try {
            // Check concurrent limit
            if (this.activeHooks.size >= this.config.maxConcurrentHooks) {
                throw new Error('Maximum concurrent hooks exceeded');
            }
            this.activeHooks.add(hookId);
            // Execute based on hook name
            let result;
            switch (hookName) {
                case 'safety-validation':
                    result = await this.hookSystem.validateSafety(context);
                    break;
                case 'agent-assignment':
                    result = await this.hookSystem.assignAgents(context);
                    break;
                case 'performance-tracking':
                    result = await this.hookSystem.trackPerformance(context);
                    break;
                case 'context-loading':
                    result = await this.hookSystem.loadContext(context);
                    break;
                default:
                    result = { executed: true, hookName, context };
            }
            const duration = Date.now() - startTime;
            if (this.config.enableLogging) {
                this.logger.info(`Hook ${hookName} executed successfully in ${duration}ms`);
            }
            return {
                success: true,
                result,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            if (this.config.enableLogging) {
                this.logger.error(`Hook ${hookName} failed after ${duration}ms:`, error);
            }
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
                duration,
            };
        }
        finally {
            this.activeHooks.delete(hookId);
        }
    }
    async executeMultipleHooks(hooks, options) {
        const { parallel = false, failFast = false } = options || {};
        if (parallel) {
            const promises = hooks.map(({ name, context }) => this.executeHook(name, context));
            if (failFast) {
                return Promise.all(promises);
            }
            else {
                return Promise.allSettled(promises).then((results) => results.map((result) => result?.status === 'fulfilled'
                    ? result?.value
                    : {
                        success: false,
                        error: new Error('Hook execution failed'),
                        duration: 0,
                    }));
            }
        }
        else {
            const results = [];
            for (const { name, context } of hooks) {
                const result = await this.executeHook(name, context);
                results.push(result);
                if (failFast && !result?.success) {
                    break;
                }
            }
            return results;
        }
    }
    getActiveHooks() {
        return Array.from(this.activeHooks);
    }
    getStats() {
        return {
            activeHooks: this.activeHooks.size,
            maxConcurrentHooks: this.config.maxConcurrentHooks,
            totalExecuted: 0, // Would need to track this
        };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    getConfig() {
        return { ...this.config };
    }
    async shutdown() {
        // Wait for active hooks to complete
        const timeout = 10000; // 10 seconds
        const startTime = Date.now();
        while (this.activeHooks.size > 0 && Date.now() - startTime < timeout) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.activeHooks.clear();
        this.emit('shutdown');
    }
}
// Default instance
export const defaultHookManager = new DefaultHookManager();
// Export for compatibility
export default DefaultHookManager;
