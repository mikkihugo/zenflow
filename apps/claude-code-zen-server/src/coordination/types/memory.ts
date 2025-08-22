/**
 * @file Memory Types - Coordination Memory Management
 *
 * Type definitions for memory and state management within the coordination layer.
 * These types support persistent memory, working memory, and shared memory systems.
 */

/**
 * Memory entry identifier
 */
export type MemoryId = string;

/**
 * Memory entry types
 */
export type MemoryType =
  | 'working' // Temporary working memory
  | 'persistent' // Long-term persistent memory
  | 'shared' // Shared between agents
  | 'cached' // Cached data with TTL
  | 'session' // Session-specific memory
  | 'configuration'); // Configuration memory

/**
 * Memory priority levels
 */
export type MemoryPriority = 'low | medium' | 'high | critical');

/**
 * Memory access patterns
 */
export type MemoryAccessPattern =
  | 'read-only'
  | 'write-only'
  | 'read-write'
  | 'append-only');

/**
 * Basic memory entry structure
 */
export interface MemoryEntry {
  id: MemoryId;
  type: MemoryType;
  key: string;
  value: any;
  timestamp: Date;
  lastAccessed: Date;
  priority: MemoryPriority;
  ttl?: number; // Time to live in milliseconds
  tags: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Memory query interface
 */
export interface MemoryQuery {
  type?: MemoryType;
  key?: string;
  keyPattern?: string; // Regex pattern for key matching
  tags?: string[];
  minPriority?: MemoryPriority;
  maxAge?: number; // Maximum age in milliseconds
  limit?: number;
  offset?: number;
}

/**
 * Memory operation result
 */
export interface MemoryOperationResult {
  success: boolean;
  memoryId?: MemoryId;
  error?: string;
  affected?: number; // Number of entries affected
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  totalEntries: number;
  entriesByType: Record<MemoryType, number>;
  entriesByPriority: Record<MemoryPriority, number>;
  memoryUsage: {
    estimated: number; // Estimated memory usage in bytes
    entries: number;
    averageEntrySize: number;
  };
  performance: {
    averageReadTime: number;
    averageWriteTime: number;
    hitRate: number; // Cache hit rate (0-1)
    missRate: number; // Cache miss rate (0-1)
  };
}

/**
 * Memory configuration
 */
export interface MemoryConfig {
  maxEntries: number;
  maxMemorySize: number; // Maximum memory usage in bytes
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  compressionEnabled: boolean;
  persistentStorage: boolean;
  backupInterval?: number; // Backup interval in milliseconds
}

/**
 * Memory manager interface
 */
export interface MemoryManager {
  /**
   * Store a memory entry
   */
  store(
    entry: Omit<MemoryEntry, 'id | timestamp' | 'lastAccessed'>
  ): Promise<MemoryOperationResult>;

  /**
   * Retrieve memory entries
   */
  retrieve(query: MemoryQuery): Promise<MemoryEntry[]>;

  /**
   * Get a specific memory entry by ID
   */
  get(id: MemoryId): Promise<MemoryEntry | null>;

  /**
   * Update a memory entry
   */
  update(
    id: MemoryId,
    updates: Partial<MemoryEntry>
  ): Promise<MemoryOperationResult>;

  /**
   * Delete memory entries
   */
  delete(query: MemoryQuery): Promise<MemoryOperationResult>;

  /**
   * Clear all memory entries
   */
  clear(type?: MemoryType): Promise<MemoryOperationResult>;

  /**
   * Get memory statistics
   */
  getStats(): Promise<MemoryStats>;

  /**
   * Perform memory cleanup (remove expired entries)
   */
  cleanup(): Promise<MemoryOperationResult>;

  /**
   * Export memory data
   */
  export(format?: 'json | binary'): Promise<string | Buffer>;

  /**
   * Import memory data
   */
  import(
    data: string | Buffer,
    format?: 'json | binary'
  ): Promise<MemoryOperationResult>;
}

/**
 * Working memory interface for agents
 */
export interface WorkingMemory {
  agentId: string;

  /**
   * Store working data
   */
  store(key: string, value: any, ttl?: number): Promise<void>;

  /**
   * Retrieve working data
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Check if key exists
   */
  has(key: string): Promise<boolean>;

  /**
   * Delete working data
   */
  delete(key: string): Promise<boolean>;

  /**
   * Clear all working memory
   */
  clear(): Promise<void>;

  /**
   * Get all keys
   */
  keys(): Promise<string[]>;

  /**
   * Get working memory size
   */
  size(): Promise<number>;
}

/**
 * Shared memory interface for coordination
 */
export interface SharedMemory {
  /**
   * Store shared data
   */
  store(
    namespace: string,
    key: string,
    value: any,
    ttl?: number
  ): Promise<void>;

  /**
   * Retrieve shared data
   */
  get<T = unknown>(namespace: string, key: string): Promise<T | null>;

  /**
   * List all keys in namespace
   */
  keys(namespace: string): Promise<string[]>;

  /**
   * Delete shared data
   */
  delete(namespace: string, key: string): Promise<boolean>;

  /**
   * Clear namespace
   */
  clearNamespace(namespace: string): Promise<void>;

  /**
   * Get all namespaces
   */
  getNamespaces(): Promise<string[]>;

  /**
   * Subscribe to changes in namespace
   */
  subscribe(
    namespace: string,
    callback: (key: string, value: any) => void
  ): () => void;
}

/**
 * Memory event types
 */
export type MemoryEventType =
  | 'entry_created'
  | 'entry_updated'
  | 'entry_deleted'
  | 'entry_expired'
  | 'cleanup_performed'
  | 'backup_created');

/**
 * Memory event
 */
export interface MemoryEvent {
  type: MemoryEventType;
  memoryId?: MemoryId;
  key?: string;
  namespace?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Memory event listener
 */
export type MemoryEventListener = (event: MemoryEvent) => void;

/**
 * Memory backup metadata
 */
export interface MemoryBackup {
  id: string;
  timestamp: Date;
  entryCount: number;
  size: number; // Size in bytes
  compression: boolean;
  checksum: string;
  metadata?: Record<string, unknown>;
}

/**
 * Memory transaction interface
 */
export interface MemoryTransaction {
  id: string;
  operations: Array<{
    type: 'store | update' | 'delete');
    key: string;
    value?: any;
    namespace?: string;
  }>;

  /**
   * Commit the transaction
   */
  commit(): Promise<MemoryOperationResult>;

  /**
   * Rollback the transaction
   */
  rollback(): Promise<MemoryOperationResult>;

  /**
   * Add operation to transaction
   */
  addOperation(
    type: 'store | update' | 'delete',
    key: string,
    value?: any,
    namespace?: string
  ): void;
}

/**
 * Memory compression interface
 */
export interface MemoryCompression {
  /**
   * Compress memory data
   */
  compress(data: any): Promise<Buffer>;

  /**
   * Decompress memory data
   */
  decompress(compressed: Buffer): Promise<unknown>;

  /**
   * Get compression ratio
   */
  getCompressionRatio(original: any, compressed: Buffer): number;
}

/**
 * Memory indexing interface
 */
export interface MemoryIndex {
  /**
   * Add entry to index
   */
  addEntry(entry: MemoryEntry): Promise<void>;

  /**
   * Remove entry from index
   */
  removeEntry(id: MemoryId): Promise<void>;

  /**
   * Search index
   */
  search(query: MemoryQuery): Promise<MemoryId[]>;

  /**
   * Rebuild index
   */
  rebuild(): Promise<void>;

  /**
   * Get index statistics
   */
  getStats(): Promise<{
    indexSize: number;
    indexedEntries: number;
    lastRebuild: Date;
  }>;
}
