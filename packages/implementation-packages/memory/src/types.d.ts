/**
 * @fileoverview Memory Domain Types - Single Source of Truth
 *
 * All memory-related types, interfaces, and configurations.
 * Following Google TypeScript style guide and domain architecture standard.
 */
export type { BackendInterface, JSONValue } from './core/memory-system';
export interface StoreOptions {
    readonly ttl?: number;
    readonly compress?: boolean;
    readonly encrypt?: boolean;
    readonly priority?: 'low' | 'medium' | 'high';
    readonly metadata?: Record<string, unknown>;
    readonly namespace?: string;
    readonly tags?: string[];
    readonly vector?: number[];
}
export interface MemoryStore {
    store(key: string, value: unknown, options?: StoreOptions): Promise<void>;
    retrieve<T = unknown>(key: string): Promise<T | null>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    health(): Promise<boolean>;
    stats(): Promise<MemoryStats>;
}
export interface MemoryStats {
    entries: number;
    size: number;
    lastModified: number;
    namespaces: number;
    totalEntries?: number;
    totalSize?: number;
    cacheHits?: number;
    cacheMisses?: number;
    lastAccessed?: number;
    created?: number;
    modified?: number;
}
export interface MemoryConfig {
    readonly type: 'sqlite' | 'json' | 'lancedb' | 'memory';
    readonly path?: string;
    readonly maxSize?: number;
    readonly ttl?: number;
    readonly compression?: boolean;
    readonly encryption?: boolean;
    readonly connectionPool?: {
        min: number;
        max: number;
        idleTimeout: number;
    };
}
export interface SessionState {
    sessionId: string;
    data: Record<string, unknown>;
    metadata: {
        created: number;
        updated: number;
        accessed: number;
        size: number;
        tags?: string[];
        priority?: 'low' | 'medium' | 'high';
        ttl?: number;
    };
    vectors?: Map<string, number[]>;
}
export interface SessionMemoryStoreOptions {
    readonly backendConfig: MemoryConfig;
    readonly enableCache?: boolean;
    readonly cacheSize?: number;
    readonly cacheTTL?: number;
    readonly enableVectorStorage?: boolean;
    readonly vectorDimensions?: number;
}
export interface CacheEntry {
    key: string;
    data: unknown;
    timestamp: number;
    expiry?: number;
    size?: number;
    accessCount?: number;
    lastAccessed?: number;
    metadata?: Record<string, unknown>;
}
export interface CacheOptions {
    readonly ttl?: number;
    readonly maxSize?: number;
    readonly evictionPolicy?: 'lru' | 'lfu' | 'fifo' | 'ttl';
    readonly compress?: boolean;
    readonly metadata?: Record<string, unknown>;
}
export interface CacheStats {
    readonly hitRate: number;
    readonly missRate: number;
    readonly evictionCount: number;
    readonly totalSize: number;
    readonly entryCount: number;
    readonly averageAccessTime: number;
}
export interface MemoryBackend {
    store(key: string, value: unknown, options?: StoreOptions): Promise<void>;
    retrieve(key: string): Promise<unknown>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    health(): Promise<boolean>;
    stats(): Promise<MemoryBackendStats>;
}
export interface MemoryBackendStats {
    readonly type: string;
    readonly connected: boolean;
    readonly totalKeys: number;
    readonly totalSize: number;
    readonly hitRate?: number;
    readonly responseTime: number;
    readonly errors: number;
    readonly uptime: number;
}
export interface VectorData {
    readonly id: string;
    readonly vector: readonly number[];
    readonly metadata?: Record<string, unknown>;
    readonly timestamp: number;
}
export interface VectorSearchOptions {
    readonly query: readonly number[];
    readonly limit?: number;
    readonly threshold?: number;
    readonly filter?: Record<string, unknown>;
    readonly includeMetadata?: boolean;
}
export interface VectorSearchResult {
    readonly id: string;
    readonly score: number;
    readonly metadata?: Record<string, unknown>;
    readonly vector?: readonly number[];
}
export interface MemoryOperation {
    readonly type: 'store' | 'retrieve' | 'delete' | 'clear';
    readonly key: string;
    readonly value?: unknown;
    readonly options?: StoreOptions;
    readonly timestamp: number;
}
export interface MemoryOperationResult {
    readonly success: boolean;
    readonly operation: MemoryOperation;
    readonly result?: unknown;
    readonly error?: string;
    readonly duration: number;
    readonly size?: number;
}
export interface BatchOperation {
    readonly operations: readonly MemoryOperation[];
    readonly continueOnError?: boolean;
    readonly timeout?: number;
}
export interface BatchOperationResult {
    readonly success: boolean;
    readonly results: readonly MemoryOperationResult[];
    readonly totalOperations: number;
    readonly successfulOperations: number;
    readonly failedOperations: number;
    readonly totalDuration: number;
}
export interface MemoryProviderConfig {
    readonly type: MemoryConfig['type'];
    readonly config: MemoryConfig;
    readonly logger?: unknown;
}
export interface MemoryRequest {
    readonly key: string;
    readonly value?: unknown;
    readonly options?: {
        readonly ttl?: number;
        readonly compress?: boolean;
        readonly metadata?: Record<string, unknown>;
    };
}
export interface MemoryResponse<T = unknown> {
    readonly success: boolean;
    readonly data?: {
        readonly key: string;
        readonly value?: T;
        readonly exists?: boolean;
        readonly stored?: boolean;
        readonly retrieved?: boolean;
        readonly deleted?: boolean;
        readonly metadata?: Record<string, unknown>;
    };
    readonly error?: string;
    readonly metadata: {
        readonly size: number;
        readonly timestamp: number;
        readonly executionTime: number;
        readonly backend: string;
    };
}
export interface MemoryBatchRequest {
    readonly operations: readonly {
        readonly type: 'store' | 'retrieve' | 'delete';
        readonly key: string;
        readonly value?: unknown;
        readonly options?: MemoryRequest['options'];
    }[];
    readonly continueOnError?: boolean;
}
export interface MemoryStatusResponse {
    readonly success: boolean;
    readonly data: {
        readonly status: 'healthy' | 'degraded' | 'unhealthy';
        readonly totalKeys: number;
        readonly backend: string;
        readonly uptime: number;
        readonly configuration: MemoryConfig;
    };
    readonly metadata: {
        readonly size: number;
        readonly timestamp: number;
        readonly executionTime: number;
        readonly backend: string;
    };
}
export interface MemoryAnalyticsResponse {
    readonly success: boolean;
    readonly data: {
        readonly totalKeys: number;
        readonly backend: string;
        readonly performance: {
            readonly averageResponseTime: number;
            readonly successRate: number;
            readonly errorRate: number;
            readonly operationsPerSecond: number;
        };
        readonly usage: {
            readonly memoryUsed: number;
            readonly maxMemory: number;
            readonly utilizationPercent: number;
        };
        readonly health: {
            readonly status: 'healthy' | 'degraded' | 'unhealthy';
            readonly uptime: number;
            readonly lastHealthCheck: number;
        };
    };
    readonly metadata: MemoryResponse['metadata'];
}
export interface MemoryMetrics {
    readonly operations: {
        readonly total: number;
        readonly store: number;
        readonly retrieve: number;
        readonly delete: number;
        readonly clear: number;
    };
    readonly performance: {
        readonly averageResponseTime: number;
        readonly p95ResponseTime: number;
        readonly p99ResponseTime: number;
        readonly successRate: number;
        readonly errorRate: number;
        readonly throughput: number;
    };
    readonly storage: {
        readonly totalKeys: number;
        readonly totalSize: number;
        readonly averageKeySize: number;
        readonly maxKeySize: number;
        readonly utilizationPercent: number;
    };
    readonly cache?: CacheStats;
}
export interface MemoryHealthCheck {
    readonly status: 'healthy' | 'degraded' | 'unhealthy';
    readonly checks: {
        readonly connection: boolean;
        readonly latency: number;
        readonly memoryUsage: number;
        readonly diskSpace?: number;
        readonly errorRate: number;
    };
    readonly timestamp: number;
    readonly uptime: number;
}
export { ContextError, ValidationError, ConfigurationError, NetworkError, TimeoutError, ResourceError, Result, ok, err, safeAsync, safe, withRetry, withTimeout, withContext } from '@claude-zen/foundation';
import { ContextError } from '@claude-zen/foundation';
export declare class MemoryError extends ContextError {
    constructor(message: string, context?: Record<string, any>, code?: string);
}
export declare class MemoryConnectionError extends MemoryError {
    constructor(message: string, backend: string, context?: Record<string, any>);
}
export declare class MemoryStorageError extends MemoryError {
    constructor(message: string, context?: Record<string, any>);
}
export declare class MemoryCapacityError extends MemoryError {
    constructor(message: string, currentSize: number, maxSize: number, context?: Record<string, any>);
}
export type MemoryBackendType = MemoryConfig['type'];
export interface MemoryBackendFactory {
    create(type: MemoryBackendType, config: MemoryConfig): MemoryBackend;
    isSupported(type: MemoryBackendType): boolean;
    getAvailableBackends(): readonly MemoryBackendType[];
}
export interface MemorySystemFactory {
    createMemoryStore(config: MemoryConfig): Promise<MemoryStore>;
    createSessionStore(options: SessionMemoryStoreOptions): Promise<SessionMemoryStore>;
    createVectorStore(config: MemoryConfig & {
        vectorDimensions: number;
    }): Promise<VectorMemoryStore>;
}
export interface SessionMemoryStore extends MemoryStore {
    getSession(sessionId: string): Promise<SessionState | null>;
    updateSession(sessionId: string, updates: Partial<SessionState['data']>): Promise<void>;
    deleteSession(sessionId: string): Promise<boolean>;
    listSessions(options?: {
        limit?: number;
        offset?: number;
    }): Promise<readonly SessionState[]>;
}
export interface VectorMemoryStore {
    storeVector(data: VectorData): Promise<void>;
    searchVectors(options: VectorSearchOptions): Promise<readonly VectorSearchResult[]>;
    deleteVector(id: string): Promise<boolean>;
    updateVector(id: string, updates: Partial<VectorData>): Promise<void>;
    getVector(id: string): Promise<VectorData | null>;
}
export interface MemoryEvent {
    readonly type: 'stored' | 'retrieved' | 'deleted' | 'cleared' | 'error';
    readonly key?: string;
    readonly backend: string;
    readonly timestamp: number;
    readonly duration?: number;
    readonly size?: number;
    readonly error?: string;
    readonly metadata?: Record<string, unknown>;
}
export type MemoryKey = string;
export type MemoryValue = unknown;
export type MemoryTTL = number;
export type MemorySize = number;
//# sourceMappingURL=types.d.ts.map