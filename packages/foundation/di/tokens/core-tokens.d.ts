/**
 * Core system tokens for dependency injection.
 * Defines tokens for fundamental system services.
 */
/**
 * @file Core-tokens implementation.
 */
export interface SystemEvent {
    type: string;
    payload?: unknown;
    timestamp?: Date;
}
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
export interface TaskData {
    id: string;
    swarmId: string;
    type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    updatedAt: Date;
    payload: Record<string, unknown>;
}
export interface AgentData {
    id: string;
    type: string;
    status: 'active' | 'idle' | 'busy' | 'offline';
    capabilities: string[];
    currentLoad: number;
    lastActivity: Date;
}
export interface MetricEntry {
    id: string;
    entityId: string;
    metricType: 'performance' | 'usage' | 'error' | 'custom';
    value: number;
    unit?: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export interface Database {
    initialize?(): Promise<void>;
    query<T>(sql: string, params?: unknown[]): Promise<T[]>;
    execute(sql: string, params?: unknown[]): Promise<void>;
    transaction<T>(fn: (db: Database) => Promise<T>): Promise<T>;
    shutdown?(): Promise<void>;
    createTask(task: Omit<TaskData, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
    updateTask(taskId: string, updates: Partial<TaskData>): Promise<void>;
    getSwarmTasks(swarmId: string, status?: TaskData['status']): Promise<TaskData[]>;
    updateAgent(agentId: string, updates: Partial<AgentData>): Promise<void>;
    getMetrics(entityId: string, metricType: MetricEntry['metricType']): Promise<MetricEntry[]>;
}
export interface HttpClient {
    get<T>(url: string, config?: unknown): Promise<T>;
    post<T>(url: string, data?: unknown, config?: unknown): Promise<T>;
    put<T>(url: string, data?: unknown, config?: unknown): Promise<T>;
    delete<T>(url: string, config?: unknown): Promise<T>;
}
export declare const CORE_TOKENS: {
    readonly Logger: import("..").DIToken<Logger>;
    readonly Config: import("..").DIToken<Config>;
    readonly EventBus: import("..").DIToken<EventBus>;
    readonly Database: import("..").DIToken<Database>;
    readonly HttpClient: import("..").DIToken<HttpClient>;
};
export declare const MEMORY_TOKENS: {
    readonly Backend: import("..").DIToken<unknown>;
    readonly Provider: import("..").DIToken<unknown>;
    readonly ProviderFactory: import("..").DIToken<unknown>;
    readonly Config: import("..").DIToken<unknown>;
    readonly Controller: import("..").DIToken<unknown>;
};
export declare const DATABASE_TOKENS: {
    readonly Adapter: import("..").DIToken<unknown>;
    readonly Provider: import("..").DIToken<unknown>;
    readonly ProviderFactory: import("..").DIToken<unknown>;
    readonly Config: import("..").DIToken<unknown>;
    readonly Controller: import("..").DIToken<unknown>;
    readonly DALFactory: import("..").DIToken<unknown>;
};
export declare const SWARM_TOKENS: {
    readonly DatabaseManager: import("..").DIToken<unknown>;
    readonly MaintenanceManager: import("..").DIToken<unknown>;
    readonly BackupManager: import("..").DIToken<unknown>;
    readonly Config: import("..").DIToken<unknown>;
    readonly StoragePath: import("..").DIToken<unknown>;
};
//# sourceMappingURL=core-tokens.d.ts.map