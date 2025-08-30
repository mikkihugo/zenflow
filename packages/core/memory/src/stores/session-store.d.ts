/**
 * @fileoverview Session-based Memory Storage with Foundation Integration
 *
 * Enhanced memory system using @claude-zen/foundation utilities:
 * - Result pattern for type-safe error handling
 * - Structured error handling with context
 * - Professional logging with performance tracking
 * - Safe async operations with retry logic
 */
import { Result, EventEmitter } from '@claude-zen/foundation';
import type {
  MemoryStore,
  MemoryStats,
  StoreOptions,
  SessionMemoryStoreOptions as SessionMemoryStoreOptionsType,
  MemoryError,
  MemoryConnectionError,
  SessionState,
} from './types';
type SessionMemoryStoreOptions = SessionMemoryStoreOptionsType;
export declare class SessionMemoryStore
  extends EventEmitter
  implements MemoryStore
{
  private backend;
  private initialized;
  private sessions;
  private options;
  private cache;
  private cacheKeys;
  private storage;
  private circuitBreaker;
  private errorAggregator;
  private telemetryInitialized;
  constructor(options: SessionMemoryStoreOptions);
  initialize(): Promise<Result<void, MemoryConnectionError>>;
  store(
    sessionId: string,
    key: string,
    data: unknown,
    options?: StoreOptions
  ): Promise<void>;
  store(key: string, data: unknown, options?: StoreOptions): Promise<void>;
  retrieve<T = unknown>(sessionId: string, key: string): Promise<T | null>;
  retrieve<T = unknown>(key: string): Promise<T | null>;
  retrieveSession(sessionId: string): Promise<SessionState | null>;
  delete(sessionId: string, key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  getStats(): Promise<MemoryStats>;
  shutdown(): Promise<Result<void, MemoryError>>;
  clear(): Promise<void>;
  size(): Promise<number>;
  health(): Promise<boolean>;
  stats(): Promise<MemoryStats>;
  private loadFromStorage;
  private saveToStorage;
  private updateCache;
  private getCachedData;
  private ensureInitialized;
  /**
   * Circuit breaker operation handler with comprehensive error handling and metrics
   */
  private performStorageOperation;
}
export declare class MemoryManager {
  private errorAggregator;
  private managerLogger;
  private performanceTracker;
  private store;
  private circuitBreaker;
  private telemetryManager;
  private managerInitialized;
  constructor(options: SessionMemoryStoreOptions);
  initialize(): Promise<Result<void, MemoryConnectionError>>;
  storeData(
    key: string,
    data: unknown,
    options?: StoreOptions
  ): Promise<Result<void, MemoryError>>;
  retrieve<T = unknown>(key: string): Promise<Result<T | null, MemoryError>>;
  shutdown(): Promise<Result<void, MemoryError>>;
  clear(): Promise<Result<void, MemoryError>>;
  size(): Promise<number>;
  health(): Promise<boolean>;
  stats(): Promise<MemoryStats>;
  delete(key: string): Promise<Result<boolean, MemoryError>>;
  /**
   * Circuit breaker operation handler for manager operations
   */
  private performManagerOperation;
}
export {};
//# sourceMappingURL=session-store.d.ts.map
