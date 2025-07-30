/**
 * Memory System Types
 * Persistent memory and state management across sessions
 */

import type { Identifiable, JSONObject } from './core.js';

// =============================================================================
// MEMORY CORE TYPES
// =============================================================================

export type MemoryType = 'volatile' | 'persistent' | 'session' | 'cache' | 'shared' | 'distributed';
export type MemoryBackend = 'sqlite' | 'redis' | 'lancedb' | 'memory' | 'file' | 'hybrid';
export type ConsistencyLevel = 'eventual' | 'weak' | 'strong' | 'causal' | 'linearizable';
export type AccessPattern = 'sequential' | 'random' | 'locality' | 'streaming' | 'bulk';

export interface MemoryConfig {
  // Backend configurationbackend = ============================================================================
// MEMORY ENTRY
// =============================================================================

export interface MemoryEntry extends Identifiable {key = ============================================================================
// MEMORY NAMESPACE
// =============================================================================

export interface MemoryNamespace extends Identifiable {name = ============================================================================
// MEMORY OPERATIONS
// =============================================================================

export interface MemoryOperations {
  // Basic operations
  get(key = ============================================================================
// QUERY SYSTEM
// =============================================================================

export interface MemoryQuery {
  namespace?: string;filters = ============================================================================
// SPECIALIZED SEARCH
// =============================================================================

export interface VectorSearchOptions {
  namespace?: string;
  k?: number; // number of results
  threshold?: number; // minimum similarity
  filters?: MemoryFilter[];
  includeDistances?: boolean;
  includeVectors?: boolean;
}

export interface VectorSearchResult {entry = ============================================================================
// TRANSACTIONS
// =============================================================================

export interface Transaction extends Identifiable {status = ============================================================================
// BACKUP & RECOVERY
// =============================================================================

export interface BackupOptions {
  namespace?: string;
  incremental?: boolean;
  compression?: boolean;
  encryption?: boolean;
  destination?: string;
  metadata?: JSONObject;
}

export interface BackupInfo extends Identifiable {namespace = ============================================================================
// MONITORING & STATISTICS
// =============================================================================

export interface MemoryStatistics {
  namespace?: string;
  
  // Storage statisticsentryCount = ============================================================================
// MAINTENANCE OPERATIONS
// =============================================================================

export interface CleanupResult {
  entriesRemoved: number;
  bytesFreed: number;
  duration: number; // milliseconds
  
  breakdown: {
    expired: number;
    orphaned: number;
    corrupted: number;
    duplicate: number;
  };
  
  errors: string[];
}

export interface OptimizationResult {
  improvements: {
    type: string;
    description: string;
    benefit: string;
    applied: boolean;
  }[];

  performance: {
    before: PerformanceSnapshot;
    after: PerformanceSnapshot;
    improvement: number; // percentage
  };

  duration: number; // milliseconds
  errors: string[];
}

export interface VacuumResult {
  bytesReclaimed: number;
  fragmentationReduced: number; // percentage
  indexesRebuilt: number;
  duration: number; // milliseconds
  errors: string[];
}

export interface ReindexResult {
  indexesRebuilt: number;
  indexSize: number; // bytes
  duration: number; // milliseconds
  performance: {
    searchSpeedup: number; // percentage
    writeSlowdown: number; // percentage
  };
  errors: string[];
}

export interface PerformanceSnapshot {
  timestamp: Date;
  throughput: number; // operations per second
  latency: number; // milliseconds
  memoryUsage: number; // bytes
  cpuUsage: number; // percentage
  hitRate: number; // 0-1
}

export interface TimeRange {
  start: Date;
  end: Date;
}
