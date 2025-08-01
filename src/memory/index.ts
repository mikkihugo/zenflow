/**
 * Memory System - Index
 * Exports for memory management components
 */

// Memory manager (wrapper for existing systems)
export { MemoryManager } from './manager';
// Re-export types
export type {
  CacheEntry,
  MemoryStats,
  QueryOptions,
  SessionState,
  VectorSearchResult,
} from './memory';
// Core memory system (renamed from enhanced-memory)
// Default export is the main Memory class
export { EnhancedMemory as Memory, EnhancedMemory, EnhancedMemory as default } from './memory';
