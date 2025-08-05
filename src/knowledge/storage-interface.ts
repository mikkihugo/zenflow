/**
 * FACT Storage Interface
 *
 * Backend-agnostic storage interface for FACT external knowledge system.
 * Allows pluggable storage backends (SQLite, JSONB, File-based, etc.)
 */

export interface FACTKnowledgeEntry {
  id: string;
  query: string;
  response: string;
  metadata: {
    source: string;
    agentId?: string;
    specialization?: string;
    domains: string[];
    type: string;
    confidence: number;
    toolsUsed: string[];
    executionTime: number;
    cacheHit: boolean;
    externalSources: string[];
  };
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface FACTSearchQuery {
  query?: string;
  domains?: string[];
  type?: string;
  source?: string;
  maxAge?: number; // milliseconds
  minConfidence?: number;
  limit?: number;
  sortBy?: 'relevance' | 'timestamp' | 'access_count';
}

export interface FACTStorageStats {
  memoryEntries: number;
  persistentEntries: number;
  totalMemorySize: number;
  cacheHitRate: number;
  oldestEntry: number;
  newestEntry: number;
  topDomains: string[];
  storageHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Backend-agnostic FACT storage interface
 */
export interface FACTStorageBackend {
  /**
   * Initialize the storage backend
   */
  initialize(): Promise<void>;

  /**
   * Store a knowledge entry
   */
  store(entry: FACTKnowledgeEntry): Promise<void>;

  /**
   * Retrieve a knowledge entry by ID
   */
  get(id: string): Promise<FACTKnowledgeEntry | null>;

  /**
   * Search knowledge entries
   */
  search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;

  /**
   * Delete a knowledge entry
   */
  delete(id: string): Promise<boolean>;

  /**
   * Clean up expired entries
   */
  cleanup(maxAge: number): Promise<number>; // Returns count of deleted entries

  /**
   * Get storage statistics
   */
  getStats(): Promise<Partial<FACTStorageStats>>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Shutdown the storage backend
   */
  shutdown(): Promise<void>;

  /**
   * Clear entries by quality threshold
   */
  clearByQuality(minQuality: number): Promise<number>;

  /**
   * Clear entries older than specified age
   */
  clearByAge(maxAgeMs: number): Promise<number>;

  /**
   * Clear memory cache only
   */
  clearMemoryCache(): Promise<number>;

  /**
   * Clear all entries
   */
  clearAll(): Promise<number>;

  /**
   * Optimize storage performance
   */
  optimize(
    strategy?: 'aggressive' | 'balanced' | 'conservative'
  ): Promise<{ optimized: boolean; details: string }>;

  /**
   * Get storage statistics
   */
  getStorageStats(): Promise<FACTStorageStats>;
}

/**
 * FACT storage configuration
 */
export interface FACTStorageConfig {
  backend: 'sqlite' | 'jsonb' | 'file' | 'memory';
  backendConfig?: any; // Backend-specific configuration
  maxMemoryCacheSize: number;
  defaultTTL: number; // milliseconds
  cleanupInterval: number; // milliseconds
  maxEntryAge: number; // milliseconds
}
