/**
 * Core Memory System Types and Interfaces.
 *
 * Provides central types and interfaces for the memory management system.
 * Including backend interfaces and core system types.
 */
/**
 * @file Memory management: memory-system.
 */

import type { MemoryStats } from '../backends/base-backend';

// Re-export MemoryStats for convenience
export type { MemoryStats };

// JSON Value type for database compatibility
export type JSONValue =|string|number|boolean|null|{ [key: string]: JSONValue }|JSONValue[];

/**
 * Backend Stats format used by some legacy implementations.
 *
 * @deprecated Use MemoryStats from base-backend.ts instead.
 * @example
 */
export interface BackendStats {
  /** Number of entries */
  entries: number;
  /** Total size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: number;
  /** Number of namespaces */
  namespaces?: number;
}

/**
 * Utility function to convert MemoryStats to BackendStats format
 * for compatibility with legacy code.
 *
 * @param memoryStats
 * @example
 */
export function memoryStatsToBackendStats(
  memoryStats: MemoryStats
): BackendStats {
  return {
    entries: memoryStats.totalEntries,
    size: memoryStats.totalSize,
    lastModified: memoryStats.modified,
    namespaces: undefined, // Not tracked in MemoryStats
  };
}

/**
 * Utility function to convert BackendStats to MemoryStats format
 * for compatibility with BaseMemoryBackend.
 *
 * @param backendStats
 * @example
 */
export function backendStatsToMemoryStats(
  backendStats: BackendStats
): MemoryStats {
  return {
    totalEntries: backendStats.entries,
    totalSize: backendStats.size,
    cacheHits: 0, // Not tracked in BackendStats
    cacheMisses: 0, // Not tracked in BackendStats
    lastAccessed: backendStats.lastModified,
    created: Date.now(), // Not tracked in BackendStats
    modified: backendStats.lastModified,
  };
}

/**
 * Backend Interface for memory storage implementations.
 * Compatible with BaseMemoryBackend implementations.
 *
 * @example
 */
export interface BackendInterface {
  /** Initialize the backend */
  initialize(): Promise<void>;

  /** Store a value with the given key */
  store(key: string, value: JSONValue, namespace?: string): Promise<void>;

  /** Retrieve a value by key */
  retrieve<T = JSONValue>(key: string): Promise<T|null>;

  /** Alternative method name for retrieve */
  get<T = JSONValue>(key: string): Promise<T|null>;

  /** Alternative method name for store */
  set(key: string, value: JSONValue): Promise<void>;

  /** Delete a value by key - returns true if key existed and was deleted, false otherwise */
  delete(key: string): Promise<boolean>;

  /** Search for values matching a pattern */
  search(
    pattern: string,
    namespace?: string
  ): Promise<Record<string, JSONValue>>;

  /** List available namespaces */
  listNamespaces(): Promise<string[]>;

  /** Clear all data */
  clear(): Promise<void>;

  /** Close the backend connection */
  close(): Promise<void>;

  /** Get backend statistics - async version for interface compatibility */
  getStats?(): Promise<MemoryStats>|MemoryStats;

  /** Get backend health status */
  health?(): Promise<boolean>;

  /** Get the size/count of stored items */
  size?(): Promise<number>;
}

/**
 * Backend Configuration.
 *
 * @example
 */
export interface BackendConfig {
  type:'sqlite|lancedb|json|memory';
  path?: string;
  maxSize?: number;
  ttl?: number;
  compression?: boolean;
}

/**
 * Memory System Configuration.
 *
 * @example
 */
export interface MemorySystemConfig {
  backend: BackendConfig;
  enableCache?: boolean;
  cacheSize?: number;
  cacheTTL?: number;
  enableVectorStorage?: boolean;
  vectorDimensions?: number;
}

/**
 * Memory Entry Metadata.
 *
 * @example
 */
export interface MemoryEntryMetadata {
  created: Date;
  updated: Date;
  accessed: Date;
  size: number;
  ttl?: number;
  tags?: string[];
  priority?: 'low|medium|high';
}

/**
 * Memory Entry with metadata.
 *
 * @example
 */
export interface MemoryEntryWithMetadata<T = JSONValue> {
  key: string;
  value: T;
  metadata: MemoryEntryMetadata;
}

/**
 * Memory Operation Result.
 *
 * @example
 */
export interface MemoryOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime: number;
    backend: string;
    timestamp: number;
  };
}

/**
 * Memory Search Options.
 *
 * @example
 */
export interface MemorySearchOptions {
  pattern?: string;
  limit?: number;
  offset?: number;
  namespace?: string;
  includeMetadata?: boolean;
}

/**
 * Memory Health Check Result.
 *
 * @example
 */
export interface MemoryHealthCheck {
  healthy: boolean;
  latency: number;
  backend: string;
  timestamp: number;
  details?: Record<string, unknown>;
}
