/**
 * Core system tokens for dependency injection.
 * Defines tokens for fundamental system services.
 */
/**
 * @file Core-tokens implementation.
 */
export interface ILogger {
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export interface IConfig {
    get<T>(key: string, defaultValue?: T): T;
    set(key: string, value: any): void;
    has(key: string): boolean;
}
export interface IEventBus {
    emit(event: string, data: any): void;
    on(event: string, handler: (data: any) => void): void;
    off(event: string, handler: (data: any) => void): void;
}
export interface IDatabase {
    initialize?(): Promise<void>;
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    execute(sql: string, params?: any[]): Promise<void>;
    transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>;
    shutdown?(): Promise<void>;
    createTask(task: any): Promise<void>;
    updateTask(taskId: string, updates: any): Promise<void>;
    getSwarmTasks(swarmId: string, status?: string): Promise<any[]>;
    updateAgent(agentId: string, updates: any): Promise<void>;
    getMetrics(entityId: string, metricType: string): Promise<any[]>;
}
export interface IHttpClient {
    get<T>(url: string, config?: any): Promise<T>;
    post<T>(url: string, data?: any, config?: any): Promise<T>;
    put<T>(url: string, data?: any, config?: any): Promise<T>;
    delete<T>(url: string, config?: any): Promise<T>;
}
export declare const CORE_TOKENS: {
    readonly Logger: import("../index.ts").DIToken<ILogger>;
    readonly Config: import("../index.ts").DIToken<IConfig>;
    readonly EventBus: import("../index.ts").DIToken<IEventBus>;
    readonly Database: import("../index.ts").DIToken<IDatabase>;
    readonly HttpClient: import("../index.ts").DIToken<IHttpClient>;
};
export declare const MEMORY_TOKENS: {
    readonly Backend: import("../index.ts").DIToken<unknown>;
    readonly Provider: import("../index.ts").DIToken<unknown>;
    readonly ProviderFactory: import("../index.ts").DIToken<unknown>;
    readonly Config: import("../index.ts").DIToken<unknown>;
    readonly Controller: import("../index.ts").DIToken<unknown>;
};
export declare const DATABASE_TOKENS: {
    readonly Adapter: import("../index.ts").DIToken<unknown>;
    readonly Provider: import("../index.ts").DIToken<unknown>;
    readonly ProviderFactory: import("../index.ts").DIToken<unknown>;
    readonly Config: import("../index.ts").DIToken<unknown>;
    readonly Controller: import("../index.ts").DIToken<unknown>;
    readonly DALFactory: import("../index.ts").DIToken<unknown>;
};
export declare const SWARM_TOKENS: {
    readonly DatabaseManager: import("../index.ts").DIToken<unknown>;
    readonly MaintenanceManager: import("../index.ts").DIToken<unknown>;
    readonly BackupManager: import("../index.ts").DIToken<unknown>;
    readonly Config: import("../index.ts").DIToken<unknown>;
    readonly StoragePath: import("../index.ts").DIToken<unknown>;
};
//# sourceMappingURL=core-tokens.d.ts.map