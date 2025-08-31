/**
 * FACT (Fast Augmented Context Tools) Type Definitions.
 *
 * Type definitions for the FACT storage system - independent from RAG/vector systems.
 */
/**
 * @file TypeScript type definitions.
 */

export interface FACTStorageConfig {
  backend: 'sqlite' | 'jsonb' | 'file' | 'memory' | 'vector-rag';
  maxMemoryCacheSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  maxEntryAge: number;
  backendConfig?: Record<string, unknown>;
}

export interface FACTKnowledgeEntry {
  id: string;
};
}

export interface VectorFACTKnowledgeEntry extends FACTKnowledgeEntry {
  embedding?: number[];
  semanticTags?: string[];
  knowledgeType: 'fact' | 'architectural-decision' | 'code-pattern' | 'documentation';
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
  searchType?: 'exact' | 'semantic' | 'hybrid';
  similarityThreshold?: number;
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
  vectorEntries?: number;
  embeddingModel?: string;
}

export interface FACTStorageBackend {
  initialize(): void {
  persistentEntries?: number;
  oldestEntry?: number;
  newestEntry?: number;
  storageSize?: number;
  vectorEntries?: number;
  embeddingModel?: string;
  [key: string]: unknown;
}
