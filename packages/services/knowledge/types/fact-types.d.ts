/**
 * FACT (Fast Augmented Context Tools) Type Definitions.
 *
 * Type definitions for the FACT storage system - independent from RAG/vector systems.
 */
/**
 * @file TypeScript type definitions.
 */
export interface FACTStorageConfig {
  backend: 'sqlite|jsonb|file|memory;
'  maxMemoryCacheSize:number;
  defaultTTL:number;
  cleanupInterval:number;
  maxEntryAge:number;
  backendConfig?:Record<string, unknown>;
}
export interface FACTKnowledgeEntry {
  id: string;
};
}
export interface FACTSearchQuery {
  query?:string;
  type?:string;
  domains?:string[];
  maxResults?:number;
  limit?:number;
  minConfidence?:number;
  timeout?:number;
  timeRange?:{
    start:number;
    end:number;
};
}
export interface FACTStorageStats {
  memoryEntries:number;
  persistentEntries:number;
  totalMemorySize:number;
  cacheHitRate:number;
  oldestEntry:number;
  newestEntry:number;
  topDomains:string[];
  storageHealth: 'excellent|good|fair|poor;
'}
export interface FACTStorageBackend {
  initialize(): void {
  persistentEntries?:number;
  oldestEntry?:number;
  newestEntry?:number;
  storageSize?:number;
  [key:string]: unknown;
}
//# sourceMappingURL=fact-types.d.ts.map
