/**
 * FACT (Fast Augmented Context Tools) Type Definitions.
 *
 * Type definitions for the FACT storage system - independent from RAG/vector systems.
 */
/**
 * @file TypeScript type definitions.
 */

export interface FACTStorageConfig {
  backend: 'sqlite|jsonb|file|memory';
  maxMemoryCacheSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  maxEntryAge: number;
  backendConfig?: Record<string, unknown>;
}

export interface FACTKnowledgeEntry {
  id: string;
  query: string;
  result: unknown;
  source: string;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  metadata: {
    type: string;
    domains: string[];
    confidence?: number;
    version?: string;
    [key: string]: unknown;
  };
}

export interface FACTSearchQuery {
  query?: string;
  type?: string;
  domains?: string[];
  maxResults?: number;
  limit?: number; // Alias for maxResults for compatibility
  minConfidence?: number;
  timeout?: number;
  timeRange?: {
    start: number;
    end: number;
  };
}

export interface FACTStorageStats {
  memoryEntries: number;
  persistentEntries: number;
  totalMemorySize: number;
  cacheHitRate: number;
  oldestEntry: number;
  newestEntry: number;
  topDomains: string[];
  storageHealth: 'excellent|good|fair|poor';
}

export interface FACTStorageBackend {
  initialize(): Promise<void>;
  store(entry: FACTKnowledgeEntry): Promise<void>;
  get(id: string): Promise<FACTKnowledgeEntry | null>;
  search(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]>;
  delete(id: string): Promise<boolean>;
  cleanup(maxAge: number): Promise<number>;
  clear(): Promise<void>;
  getStats(): Promise<Partial<FACTStorageStats>>;
  shutdown(): Promise<void>;
}

export interface FACTBackendStats {
  persistentEntries?: number;
  oldestEntry?: number;
  newestEntry?: number;
  storageSize?: number;
  [key: string]: unknown;
}
