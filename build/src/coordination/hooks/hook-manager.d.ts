/**
 * Hook Manager - Manages hook lifecycle and execution.
 */
/**
 * @file Hook management system.
 */
import { EventEmitter } from 'node:events';
import type { HookSystem } from './hook-system-core.ts';
export interface HookManagerConfig {
    maxConcurrentHooks: number;
    defaultTimeout: number;
    enableLogging: boolean;
}
export interface HookExecutionResult {
    success: boolean;
    result?: any;
    error?: Error;
    duration: number;
}
/**
 * Default Hook Manager Implementation.
 *
 * @example
 */
export declare class DefaultHookManager extends EventEmitter {
    private hookSystem;
    private config;
    private activeHooks;
    private logger;
    constructor(hookSystem?: HookSystem, config?: Partial<HookManagerConfig>);
    executeHook(hookName: string, context: any, _timeout?: number): Promise<HookExecutionResult>;
    executeMultipleHooks(hooks: Array<{
        name: string;
        context: any;
    }>, options?: {
        parallel?: boolean;
        failFast?: boolean;
    }): Promise<HookExecutionResult[]>;
    getActiveHooks(): string[];
    getStats(): {
        activeHooks: number;
        maxConcurrentHooks: number;
        totalExecuted: number;
    };
    updateConfig(updates: Partial<HookManagerConfig>): void;
    getConfig(): HookManagerConfig;
    shutdown(): Promise<void>;
}
export declare const defaultHookManager: DefaultHookManager;
export default DefaultHookManager;
//# sourceMappingURL=hook-manager.d.ts.map