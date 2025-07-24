/**
 * @fileoverview Shared utilities for Claude Zen + ruv-FANN integration
 * @module shared-utils
 */
import { LogLevel, LogEntry } from '@shared/types';
export declare class Logger {
    private module;
    private logLevel;
    constructor(module: string, logLevel?: LogLevel);
    private shouldLog;
    private formatMessage;
    private getLevelTag;
    debug(message: string, metadata?: any): void;
    info(message: string, metadata?: any): void;
    warn(message: string, metadata?: any): void;
    error(message: string, metadata?: any): void;
    createLogEntry(level: LogLevel, message: string, metadata?: any): LogEntry;
}
export declare function generateId(prefix?: string): string;
export declare function generateSwarmId(serviceName: string): string;
export declare function generateAgentId(agentType: string): string;
export declare function generateTaskId(): string;
export declare class PerformanceTimer {
    private startTime;
    private endTime?;
    private markers;
    constructor();
    mark(label: string): void;
    end(): number;
    getDuration(): number;
    getMarkerDuration(label: string): number;
    getAllMarkers(): Record<string, number>;
}
export declare function measureAsync<T>(fn: () => Promise<T>, logger?: Logger): Promise<{
    result: T;
    duration: number;
}>;
export declare function formatBytes(bytes: number): string;
export declare function formatDuration(ms: number): string;
export declare function formatPercentage(value: number, total: number): string;
export declare function validateServiceName(name: string): boolean;
export declare function validateSwarmConfig(config: any): {
    valid: boolean;
    errors: string[];
};
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number, error: any) => void;
}): Promise<T>;
export declare function sleep(ms: number): Promise<void>;
export declare class ConcurrencyLimiter {
    private limit;
    private running;
    private queue;
    constructor(limit: number);
    run<T>(fn: () => Promise<T>): Promise<T>;
    private processQueue;
    getStats(): {
        running: number;
        queued: number;
        limit: number;
    };
}
export declare function getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
};
export declare function formatMemoryUsage(): string;
export declare function mergeConfigs<T extends Record<string, any>>(base: T, override: Partial<T>): T;
export declare const utils: {
    Logger: typeof Logger;
    generateId: typeof generateId;
    generateSwarmId: typeof generateSwarmId;
    generateAgentId: typeof generateAgentId;
    generateTaskId: typeof generateTaskId;
    PerformanceTimer: typeof PerformanceTimer;
    measureAsync: typeof measureAsync;
    formatBytes: typeof formatBytes;
    formatDuration: typeof formatDuration;
    formatPercentage: typeof formatPercentage;
    validateServiceName: typeof validateServiceName;
    validateSwarmConfig: typeof validateSwarmConfig;
    retry: typeof retry;
    sleep: typeof sleep;
    ConcurrencyLimiter: typeof ConcurrencyLimiter;
    getMemoryUsage: typeof getMemoryUsage;
    formatMemoryUsage: typeof formatMemoryUsage;
    mergeConfigs: typeof mergeConfigs;
};
export default utils;
//# sourceMappingURL=index.d.ts.map