/**
 * @fileoverview Memory Domain Types - Single Source of Truth
 *
 * All memory-related types, interfaces, and configurations.
 * Following Google TypeScript style guide and domain architecture standard.
 */

// Re-export core memory interfaces
export type {
  IMemoryStore,
  MemoryStats,
  StoreOptions,
} from '../core/interfaces/base-interfaces.ts';

// Re-export memory backend types
export type { BackendInterface, JSONValue } from './core/memory-system.ts';

// Memory configuration types
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

// Session memory types
export interface SessionState {
  readonly sessionId: string;
  readonly data: Record<string, unknown>;
  readonly metadata: {
    readonly created: number;
    readonly updated: number;
    readonly accessed: number;
    readonly size: number;
    readonly tags?: readonly string[];
    readonly priority?: 'low' | 'medium' | 'high';
    readonly ttl?: number;
  };
  readonly vectors?: ReadonlyMap<string, readonly number[]>;
}

export interface SessionMemoryStoreOptions {
  readonly backendConfig: MemoryConfig;
  readonly enableCache?: boolean;
  readonly cacheSize?: number;
  readonly cacheTTL?: number;
  readonly enableVectorStorage?: boolean;
  readonly vectorDimensions?: number;
}

// Cache types
export interface CacheEntry {
  readonly key: string;
  readonly value: unknown;
  readonly expiry: number;
  readonly size: number;
  readonly accessCount: number;
  readonly lastAccessed: number;
  readonly metadata?: Record<string, unknown>;
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

// Memory backend interfaces
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

// Vector memory types (for LanceDB backend)
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

// Memory operation types
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

// Batch operations
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

// Memory provider factory types
export interface MemoryProviderConfig {
  readonly type: MemoryConfig['type'];
  readonly config: MemoryConfig;
  readonly logger?: unknown; // ILogger interface
}

// API request/response types for REST endpoints
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

// Memory monitoring and metrics
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

// Memory health monitoring
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

// Error types
export class MemoryError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MemoryError';
  }
}

export class MemoryConnectionError extends MemoryError {
  constructor(
    message: string,
    public readonly backend: string
  ) {
    super(message, 'MEMORY_CONNECTION_ERROR');
    this.name = 'MemoryConnectionError';
  }
}

export class MemoryStorageError extends MemoryError {
  constructor(
    message: string,
    public readonly key?: string,
    public readonly operation?: string
  ) {
    super(message, 'MEMORY_STORAGE_ERROR');
    this.name = 'MemoryStorageError';
  }
}

export class MemoryCapacityError extends MemoryError {
  constructor(
    message: string,
    public readonly currentSize: number,
    public readonly maxSize: number
  ) {
    super(message, 'MEMORY_CAPACITY_ERROR');
    this.name = 'MemoryCapacityError';
  }
}

// Factory and provider types
export type MemoryBackendType = MemoryConfig['type'];

export interface MemoryBackendFactory {
  create(type: MemoryBackendType, config: MemoryConfig): MemoryBackend;
  isSupported(type: MemoryBackendType): boolean;
  getAvailableBackends(): readonly MemoryBackendType[];
}

// Memory system factory type (for DI)
export interface MemorySystemFactory {
  createMemoryStore(config: MemoryConfig): Promise<IMemoryStore>;
  createSessionStore(options: SessionMemoryStoreOptions): Promise<SessionMemoryStore>;
  createVectorStore(
    config: MemoryConfig & { vectorDimensions: number }
  ): Promise<VectorMemoryStore>;
}

// Additional specialized store interfaces
export interface SessionMemoryStore extends IMemoryStore {
  getSession(sessionId: string): Promise<SessionState | null>;
  updateSession(sessionId: string, updates: Partial<SessionState['data']>): Promise<void>;
  deleteSession(sessionId: string): Promise<boolean>;
  listSessions(options?: { limit?: number; offset?: number }): Promise<readonly SessionState[]>;
}

export interface VectorMemoryStore {
  storeVector(data: VectorData): Promise<void>;
  searchVectors(options: VectorSearchOptions): Promise<readonly VectorSearchResult[]>;
  deleteVector(id: string): Promise<boolean>;
  updateVector(id: string, updates: Partial<VectorData>): Promise<void>;
  getVector(id: string): Promise<VectorData | null>;
}

// Event types for memory operations
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

// Utility types
export type MemoryKey = string;
export type MemoryValue = unknown;
export type MemoryTTL = number;
export type MemorySize = number;
