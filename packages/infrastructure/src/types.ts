/**
 * @fileoverview Type-Safe Infrastructure Interfaces
 *
 * Proper TypeScript interfaces to replace dangerous `any` types throughout
 * the infrastructure facade system. Provides compile-time type safety and
 * better developer experience.
 */

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface Config {
  readonly debug: boolean;
  readonly env: 'development' | 'production' | 'test';
  readonly logging: {
    readonly level: 'debug' | 'info' | 'warn' | 'error';
  };
  readonly metrics: {
    readonly enabled: boolean;
  };
  readonly storage: {
    readonly backend: 'memory' | 'sqlite' | 'lancedb' | 'kuzu';
  };
  readonly neural: {
    readonly enabled: boolean;
  };
  readonly telemetry: {
    readonly enabled: boolean;
  };
}

export interface ConfigValidationResult {
  readonly valid: boolean;
  readonly config: Config;
  readonly errors?: readonly string[];
}

export interface ConfigHelpers {
  readonly validate: (config?: Partial<Config>) => Promise<ConfigValidationResult>;
  readonly getBasic: () => Promise<{ debug: boolean; env: string }>;
  readonly reload: () => Promise<Config>;
  readonly toObject: () => Promise<Config>;
}

// =============================================================================
// TELEMETRY TYPES
// =============================================================================

export interface TelemetrySpan {
  readonly setAttributes: (attributes: Record<string, string | number | boolean>) => void;
  readonly end: () => void;
}

export interface TelemetrySystemAccess {
  readonly recordMetric: (name: string, value?: number) => Promise<void>;
  readonly recordHistogram: (name: string, value: number) => Promise<void>;
  readonly recordGauge: (name: string, value: number) => Promise<void>;
  readonly withTrace: <T>(fn: () => T) => T;
  readonly withAsyncTrace: <T>(fn: () => Promise<T>) => Promise<T>;
  readonly startTrace: (name: string) => TelemetrySpan;
  readonly recordEvent?: (name: string, data: Record<string, unknown>) => Promise<void>;
}

export interface TelemetryConfig {
  readonly endpoint?: string;
  readonly apiKey?: string;
  readonly sampleRate?: number;
  readonly enabled: boolean;
}

// =============================================================================
// DATABASE TYPES
// =============================================================================

export interface DatabaseRow {
  readonly [key: string]: unknown;
}

export interface QueryResult {
  readonly rows: readonly DatabaseRow[];
  readonly rowCount: number;
  readonly fields?: readonly string[];
}

export interface DatabaseTransaction {
  readonly commit: () => Promise<void>;
  readonly rollback: () => Promise<void>;
  readonly query: (sql: string, params?: readonly unknown[]) => Promise<QueryResult>;
}

export interface KeyValueStore {
  readonly set: (key: string, value: string) => Promise<void>;
  readonly get: (key: string) => Promise<string | null>;
  readonly delete: (key: string) => Promise<void>;
  readonly exists: (key: string) => Promise<boolean>;
  readonly keys: (pattern?: string) => Promise<readonly string[]>;
}

export interface DatabaseSystemAccess {
  readonly query: (sql: string, params?: readonly unknown[]) => Promise<QueryResult>;
  readonly transaction: <T>(fn: (tx: DatabaseTransaction) => Promise<T>) => Promise<T>;
  readonly getKV: (namespace: string) => KeyValueStore;
  readonly close: () => Promise<void>;
  readonly isHealthy: () => Promise<boolean>;
}

// =============================================================================
// EVENT SYSTEM TYPES
// =============================================================================

export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

export interface EventBus {
  readonly emit: <T = unknown>(event: string, data: T) => Promise<void>;
  readonly on: <T = unknown>(event: string, handler: EventHandler<T>) => () => void;
  readonly off: <T = unknown>(event: string, handler: EventHandler<T>) => void;
  readonly once: <T = unknown>(event: string, handler: EventHandler<T>) => void;
  readonly removeAllListeners: (event?: string) => void;
}

// EventSystemAccess interface is defined in events.ts to avoid duplication

// =============================================================================
// LOAD BALANCING TYPES
// =============================================================================

export interface LoadBalancerRequest {
  readonly id: string;
  readonly payload: unknown;
  readonly priority?: 'low' | 'medium' | 'high';
  readonly timeout?: number;
}

export interface LoadBalancerResponse<T = unknown> {
  readonly id: string;
  readonly result: T;
  readonly processingTime: number;
  readonly handlerInfo: {
    readonly id: string;
    readonly load: number;
  };
}

export interface LoadBalancerStats {
  readonly requests: number;
  readonly errors: number;
  readonly averageResponseTime: number;
  readonly activeHandlers: number;
}

export interface LoadBalancerConfig {
  readonly strategy: 'round-robin' | 'least-connections' | 'weighted' | 'resource-aware';
  readonly maxRetries: number;
  readonly timeoutMs: number;
  readonly healthCheckInterval?: number;
}

export interface LoadBalancer {
  readonly route: <T = unknown>(request: LoadBalancerRequest) => Promise<LoadBalancerResponse<T>>;
  readonly getStats: () => Promise<LoadBalancerStats>;
  readonly addHandler: (handler: LoadBalancerHandler) => void;
  readonly removeHandler: (handlerId: string) => void;
  readonly isHealthy: () => Promise<boolean>;
}

export interface LoadBalancerHandler {
  readonly id: string;
  readonly handle: (request: LoadBalancerRequest) => Promise<unknown>;
  readonly getLoad: () => number;
  readonly isHealthy: () => Promise<boolean>;
}

export interface LoadBalancingSystemAccess {
  readonly createBalancer: (config?: LoadBalancerConfig) => LoadBalancer;
  readonly route: <T = unknown>(request: LoadBalancerRequest) => Promise<LoadBalancerResponse<T>>;
  readonly getStats: () => Promise<LoadBalancerStats>;
}

// =============================================================================
// PERFORMANCE MONITORING TYPES
// =============================================================================

export interface PerformanceMetrics {
  readonly operations: Record<string, {
    readonly count: number;
    readonly totalTime: number;
    readonly averageTime: number;
    readonly minTime: number;
    readonly maxTime: number;
  }>;
  readonly memory: {
    readonly used: number;
    readonly free: number;
    readonly total: number;
  };
  readonly cpu: {
    readonly usage: number;
  };
}

export interface PerformanceTimer {
  readonly end: () => number;
}

export interface PerformanceTracker {
  readonly startTimer: (name?: string) => PerformanceTimer;
  readonly recordDuration: (name: string, duration: number) => void;
  readonly getMetrics: () => Promise<PerformanceMetrics>;
  readonly reset: () => void;
}

// =============================================================================
// SYSTEM MONITORING TYPES
// =============================================================================

export interface SystemHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly checks: Record<string, {
    readonly status: 'pass' | 'fail' | 'warn';
    readonly message?: string;
    readonly timestamp: string;
  }>;
  readonly uptime: number;
  readonly version: string;
}

export interface SystemMetrics {
  readonly cpu: {
    readonly usage: number;
    readonly load: readonly [number, number, number];
  };
  readonly memory: {
    readonly used: number;
    readonly free: number;
    readonly total: number;
    readonly cached: number;
  };
  readonly disk: {
    readonly used: number;
    readonly free: number;
    readonly total: number;
  };
  readonly network: {
    readonly bytesIn: number;
    readonly bytesOut: number;
    readonly packetsIn: number;
    readonly packetsOut: number;
  };
}

export interface SystemMonitor {
  readonly initialize: () => Promise<SystemMonitor>;
  readonly getMetrics: () => Promise<SystemMetrics>;
  readonly getHealthStatus: () => Promise<SystemHealth>;
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
  readonly isRunning: () => boolean;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value: unknown;
}

export interface ValidationResult<T = unknown> {
  readonly valid: boolean;
  readonly data?: T;
  readonly errors: readonly ValidationError[];
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type MaybePromise<T> = T | Promise<T>;

export interface ServiceHealth {
  readonly healthy: boolean;
  readonly message?: string;
  readonly lastCheck: string;
}

export interface FacadeStatus {
  readonly name: string;
  readonly packages: Record<string, 'available' | 'partial' | 'unavailable'>;
  readonly capability: 'full' | 'partial' | 'degraded' | 'unavailable';
  readonly healthScore: number;
}

// =============================================================================
// SERVICE CONTAINER TYPES
// =============================================================================

export interface ServiceContainer {
  readonly register: (key: string, factory: (container: ServiceContainer) => unknown) => void;
  readonly resolve: <T = unknown>(key: string) => T;
  readonly has: (key: string) => boolean;
  readonly clear: () => void;
}

export interface ServiceContainerConfig {
  readonly name?: string;
  readonly enableLogging?: boolean;
  readonly validateRegistrations?: boolean;
}