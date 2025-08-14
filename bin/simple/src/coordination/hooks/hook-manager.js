import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
import { DefaultHookSystem } from './hook-system-core.ts';
const logger = getLogger('HookManager');
export class DefaultHookManager extends EventEmitter {
    hookSystem;
    config;
    activeHooks = new Set();
    logger;
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
    }
    async executeHook(hookName, context, _timeout) {
        const startTime = Date.now();
        const hookId = `${hookName}-${startTime}`;
        try {
            if (this.activeHooks.size >= this.config.maxConcurrentHooks) {
                throw new Error('Maximum concurrent hooks exceeded');
            }
            this.activeHooks.add(hookId);
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
            return Promise.allSettled(promises).then((results) => results.map((result) => result?.status === 'fulfilled'
                ? result?.value
                : {
                    success: false,
                    error: new Error('Hook execution failed'),
                    duration: 0,
                }));
        }
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
    getActiveHooks() {
        return Array.from(this.activeHooks);
    }
    getStats() {
        return {
            activeHooks: this.activeHooks.size,
            maxConcurrentHooks: this.config.maxConcurrentHooks,
            totalExecuted: 0,
        };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    getConfig() {
        return { ...this.config };
    }
    async shutdown() {
        const timeout = 10000;
        const startTime = Date.now();
        while (this.activeHooks.size > 0 && Date.now() - startTime < timeout) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.activeHooks.clear();
        this.emit('shutdown');
    }
}
export const defaultHookManager = new DefaultHookManager();
export default DefaultHookManager;
//# sourceMappingURL=hook-manager.js.map