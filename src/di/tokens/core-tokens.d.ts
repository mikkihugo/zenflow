/**
 * Core system tokens for dependency injection.
 * Defines tokens for fundamental system services.
 */
/**
 * @file Core-tokens implementation.
 */
import type { SystemEvent } from '../../coordination/core/event-bus';
export interface Logger {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, meta?: unknown): void;
}
export interface Config {
    get<T>(key: string, defaultValue?: T): T;
    set(key: string, value: unknown): void;
    has(key: string): boolean;
}
export interface EventBus {
    emit(event: string, data: unknown): boolean;
    emitSystemEvent(event: SystemEvent): boolean;
    on(event: string, handler: (data: unknown) => void): this;
    off(event: string, handler: (data: unknown) => void): this;
}
export interface Database {
    initialize?(): Promise<void>;
    query<T>(sql: string, params?: unknown[]): Promise<T[]>;
    execute(sql: string, params?: unknown[]): Promise<void>;
    transaction<T>(fn: (db: Database) => Promise<T>): Promise<T>;
    shutdown?(): Promise<void>;
    createTask(task: unknown): Promise<void>;
    updateTask(taskId: string, updates: unknown): Promise<void>;
    getSwarmTasks(swarmId: string, status?: string): Promise<any[]>;
    updateAgent(agentId: string, updates: unknown): Promise<void>;
    getMetrics(entityId: string, metricType: string): Promise<any[]>;
}
export interface HttpClient {
    get<T>(url: string, config?: unknown): Promise<T>;
    post<T>(url: string, data?: unknown, config?: unknown): Promise<T>;
    put<T>(url: string, data?: unknown, config?: unknown): Promise<T>;
    delete<T>(url: string, config?: unknown): Promise<T>;
}
export declare const CORE_TOKENS: {
    readonly Logger: import("../types/di-types").DIToken<Logger>;
    readonly Config: import("../types/di-types").DIToken<Config>;
    readonly EventBus: import("../types/di-types").DIToken<EventBus>;
    readonly Database: import("../types/di-types").DIToken<Database>;
    readonly HttpClient: import("../types/di-types").DIToken<HttpClient>;
};
export declare const MEMORY_TOKENS: {
    readonly Backend: import("../types/di-types").DIToken<unknown>;
    readonly Provider: import("../types/di-types").DIToken<unknown>;
    readonly ProviderFactory: import("../types/di-types").DIToken<unknown>;
    readonly Config: import("../types/di-types").DIToken<unknown>;
    readonly Controller: import("../types/di-types").DIToken<unknown>;
};
export declare const DATABASE_TOKENS: {
    readonly Adapter: import("../types/di-types").DIToken<unknown>;
    readonly Provider: import("../types/di-types").DIToken<unknown>;
    readonly ProviderFactory: import("../types/di-types").DIToken<unknown>;
    readonly Config: import("../types/di-types").DIToken<unknown>;
    readonly Controller: import("../types/di-types").DIToken<unknown>;
    readonly DALFactory: import("../types/di-types").DIToken<unknown>;
};
export declare const SWARM_TOKENS: {
    readonly DatabaseManager: import("../types/di-types").DIToken<unknown>;
    readonly MaintenanceManager: import("../types/di-types").DIToken<unknown>;
    readonly BackupManager: import("../types/di-types").DIToken<unknown>;
    readonly Config: import("../types/di-types").DIToken<unknown>;
    readonly StoragePath: import("../types/di-types").DIToken<unknown>;
};
//# sourceMappingURL=core-tokens.d.ts.map