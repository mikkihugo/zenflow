/**
 * Shared Types
 *
 * Cross-domain types and utilities used throughout the system.
 * Consolidated from: shared-types.ts, global.d.ts, singletons.ts, event-types.ts
 */
export type UUID = string;
export type Timestamp = number;
export type ISODateString = string;
export interface BaseEntity {
    id: UUID;
    created: Date;
    updated: Date;
    metadata?: Record<string, unknown>;
}
export interface Identifiable {
    id: string;
}
export interface Timestamped {
    timestamp: Date;
}
export interface Versioned {
    version: string;
    previousVersion?: string;
}
export interface SystemEvent extends Timestamped {
    id: UUID;
    type: EventType;
    source: string;
    target?: string;
    payload: unknown;
    priority: EventPriority;
    correlationId?: string;
}
export type EventType = 'system.startup' | 'system.shutdown' | 'system.error' | 'system.config-change' | 'swarm.created' | 'swarm.updated' | 'swarm.deleted' | 'agent.connected' | 'agent.disconnected' | 'task.created' | 'task.completed' | 'task.failed' | 'api.request' | 'api.response' | 'custom';
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';
export interface EventEmitter {
    emit(event: SystemEvent): void;
    on(type: EventType, handler: EventHandler): void;
    off(type: EventType, handler?: EventHandler): void;
    once(type: EventType, handler: EventHandler): void;
}
export type EventHandler = (event: SystemEvent) => void | Promise<void>;
export interface Service {
    name: string;
    version: string;
    status: ServiceStatus;
    health: ServiceHealth;
    dependencies: string[];
}
export type ServiceStatus = 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    lastCheck: Date;
}
export interface HealthCheck {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    duration: number;
    message?: string;
}
export interface ServiceIntegration {
    service: string;
    version: string;
    endpoint: string;
    auth?: ServiceAuth;
    config: IntegrationConfig;
}
export interface ServiceAuth {
    type: 'none' | 'bearer' | 'basic' | 'api-key';
    credentials?: Record<string, string>;
}
export interface IntegrationConfig {
    timeout: number;
    retries: number;
    circuitBreaker?: CircuitBreakerConfig;
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    timeout: number;
    monitoringPeriod: number;
}
export interface DataSource {
    type: 'memory' | 'file' | 'database' | 'remote';
    config: DataSourceConfig;
    schema?: DataSchema;
}
export interface DataSourceConfig {
    connection: string;
    options?: Record<string, unknown>;
    credentials?: Record<string, string>;
}
export interface DataSchema {
    version: string;
    fields: SchemaField[];
    indexes?: SchemaIndex[];
}
export interface SchemaField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required: boolean;
    validation?: ValidationRule[];
}
export interface SchemaIndex {
    name: string;
    fields: string[];
    unique: boolean;
}
export interface ValidationRule {
    type: 'regex' | 'range' | 'length' | 'custom';
    value: unknown;
    message?: string;
}
export interface SecurityContext {
    userId?: string;
    roles: string[];
    permissions: string[];
    sessionId?: string;
    apiKey?: string;
}
export interface AccessControl {
    resource: string;
    action: string;
    conditions?: AccessCondition[];
}
export interface AccessCondition {
    field: string;
    operator: 'eq' | 'ne' | 'in' | 'not-in' | 'gt' | 'lt';
    value: unknown;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
export type Awaitable<T> = T | Promise<T>;
export type Constructor<T = {}> = new (...args: unknown[]) => T;
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export type Result<T, E = Error> = Success<T> | Failure<E>;
export interface Success<T> {
    success: true;
    data: T;
}
export interface Failure<E> {
    success: false;
    error: E;
}
export declare function success<T>(data: T): Success<T>;
export declare function failure<E>(error: E): Failure<E>;
export declare function isBaseEntity(obj: unknown): obj is BaseEntity;
export declare function isSystemEvent(obj: unknown): obj is SystemEvent;
export declare function isService(obj: unknown): obj is Service;
export declare function isSuccess<T>(result: Result<T, unknown>): result is Success<T>;
export declare function isFailure<E>(result: Result<unknown, E>): result is Failure<E>;
export declare const DEFAULT_TIMEOUT = 30000;
export declare const DEFAULT_RETRY_ATTEMPTS = 3;
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const EVENT_PRIORITIES: Record<EventPriority, number>;
export declare const SERVICE_STATUSES: Record<ServiceStatus, string>;
//# sourceMappingURL=shared.d.ts.map