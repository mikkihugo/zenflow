/**
 * @fileoverview Extracted DI Container Setup from legacy claude-zen-core.ts
 *
 * This module preserves the valuable dependency injection patterns while
 * making them reusable across the new architecture.
 */
import { EventEmitter } from 'node:events';
import { type DIContainer, type Config, type Database, type EventBus, type Logger } from '../di/index';
/**
 * Console Logger Implementation
 * Preserved from claude-zen-core.ts
 */
export declare class ConsoleLogger implements Logger {
    private logger;
    log(message: string): void;
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
}
/**
 * Application Configuration Implementation
 * Preserved from claude-zen-core.ts
 */
export declare class AppConfig implements Config {
    private config;
    constructor();
    private loadFromEnvironment;
    get<T>(key: string, defaultValue?: T): T;
    set<T>(key: string, value: T): void;
    has(key: string): boolean;
}
/**
 * Application Event Bus Implementation
 * Preserved from claude-zen-core.ts
 */
export declare class AppEventBus extends EventEmitter implements EventBus {
    emit(event: string | symbol, ...args: unknown[]): boolean;
    on(event: string | symbol, listener: (...args: unknown[]) => void): this;
}
/**
 * Mock Database Implementation
 * Preserved from claude-zen-core.ts
 */
export declare class MockDatabase implements Database {
    private data;
    private initialized;
    initialize(): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<boolean>;
    close(): Promise<void>;
}
/**
 * Create and configure comprehensive DI container
 * Preserves the exact setup from claude-zen-core.ts
 */
export declare function createClaudeZenDIContainer(): DIContainer;
/**
 * Initialize core services in the DI container
 */
export declare function initializeDIServices(container: DIContainer): Promise<void>;
/**
 * Graceful shutdown of DI container
 * Preserves the cleanup pattern from claude-zen-core.ts
 */
export declare function shutdownDIContainer(container: DIContainer): Promise<void>;
//# sourceMappingURL=di-container.d.ts.map