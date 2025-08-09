/**
 * @file knowledge-storage implementation
 */


import { getLogger } from '../core/logger';

const logger = getLogger('src-knowledge-knowledge-storage');

/**
 * Independent FACT Storage System.
 *
 * Completely separate from RAG/LanceDB - provides pluggable backend storage.
 * for FACT (Fast Augmented Context Tools) external knowledge gathering results.
 *
 * Key Principles:
 * - FACT handles external knowledge gathering and caching
 * - RAG handles vector-based retrieval from existing knowledge corpus
 * - Both systems are complementary but completely independent
 *
 * Storage Features:
 * - Memory cache for fast access (TTL-based)
 * - Pluggable backend storage (SQLite, JSONB, File, Memory)
 * - No vector embeddings (that's RAG's job)
 * - Backend-agnostic design for flexibility.
 */

import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import SQLiteBackend from './knowledge-cache-backends/sqlite-backend';

/**
 * Independent FACT Storage System with pluggable backends.
 *
 * @example
 */
export class FACTStorageSystem extends EventEmitter {
  private config: FACTStorageConfig;
  private backend: FACTStorageBackend;
  private memoryCache = new Map<string, FACTKnowledgeEntry>();
  private cleanupTimer?: NodeJS.Timeout;

  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    entriesCreated: 0,
    entriesDeleted: 0,
  };

  constructor(config: Partial<FACTStorageConfig> = {}) {
    super();

    this.config = {
      backend: 'sqlite',
      maxMemoryCacheSize: 1000, // entries
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      maxEntryAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...config,
    };

    // Initialize backend
    this.backend = this.createBackend();
  }

  /**
   * Initialize the FACT storage system.
   */
  async initialize(): Promise<void> {
    try {
      // Initialize backend
      await this.backend.initialize();

      // Start cleanup timer
      this.startCleanupTimer();

      this.emit('storageInitialized', {
        backend: this.config.backend,
        cacheSize: this.config.maxMemoryCacheSize,
      });
    } catch (error) {
      logger.error('❌ FACT Storage initialization failed:', error);
      throw error;
    }
  }

  /**
   * Store FACT knowledge entry.
   *
   * @param entry
   */
  async storeKnowledge(
    entry: Omit<FACTKnowledgeEntry, 'id' | 'timestamp' | 'accessCount' | 'lastAccessed'>
  ): Promise<string> {
    const id = this.generateEntryId(entry.query, entry.metadata.type);
    const timestamp = Date.now();

    const knowledgeEntry: FACTKnowledgeEntry = {
      id,
      timestamp,
      accessCount: 0,
      lastAccessed: timestamp,
      ...entry,
    };

    try {
      // Store in memory cache
      await this.storeInMemory(knowledgeEntry);

      // Store in backend
      await this.backend.store(knowledgeEntry);

      this.stats.entriesCreated++;
      this.emit('knowledgeStored', { id, type: entry.metadata.type });

      return id;
    } catch (error) {
      logger.error(`❌ Failed to store FACT knowledge: ${id}`, error);
      throw error;
    }
  }

  /**
   * Retrieve FACT knowledge by ID.
   *
   * @param id
   */
  async getKnowledge(id: string): Promise<FACTKnowledgeEntry | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(id);
    if (memoryEntry && this.isEntryValid(memoryEntry)) {
      memoryEntry.accessCount++;
      memoryEntry.lastAccessed = Date.now();
      this.stats.hits++;
      return memoryEntry;
    }

    // Load from backend
    try {
      const backendEntry = await this.backend.get(id);
      if (backendEntry && this.isEntryValid(backendEntry)) {
        backendEntry.accessCount++;
        backendEntry.lastAccessed = Date.now();

        // Cache in memory for future access
        await this.storeInMemory(backendEntry);

        // Update backend with new access stats
        await this.backend.store(backendEntry);

        this.stats.hits++;
        return backendEntry;
      }
    } catch (error) {
      logger.error(`Failed to load FACT knowledge from backend: ${id}`, error);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Search FACT knowledge entries.
   *
   * @param query
   */
  async searchKnowledge(query: FACTSearchQuery): Promise<FACTKnowledgeEntry[]> {
    try {
      // Search backend (more comprehensive than memory-only search)
      const results = await this.backend.search(query);

      // Cache frequently accessed results in memory
      for (const result of results?.slice(0, 10)) {
        // Top 10 results
        if (!this.memoryCache.has(result?.id)) {
          await this.storeInMemory(result);
        }
      }
      return results;
    } catch (error) {
      logger.error('FACT knowledge search failed:', error);
      return [];
    }
  }

  /**
   * Get comprehensive storage statistics.
   */
  async getStorageStats(): Promise<FACTStorageStats> {
    const memoryEntries = this.memoryCache.size;
    const backendStats = await this.backend.getStats();

    // Calculate memory size (rough estimate)
    let totalMemorySize = 0;
    for (const entry of this.memoryCache.values()) {
      totalMemorySize += JSON.stringify(entry).length;
    }

    // Calculate cache hit rate
    const totalRequests = this.stats.hits + this.stats.misses;
    const cacheHitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    // Get top domains from memory cache
    const domainCounts = new Map<string, number>();
    for (const entry of this.memoryCache.values()) {
      for (const domain of entry.metadata.domains) {
        domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      }
    }

    const topDomains = Array.from(domainCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain]) => domain);

    // Determine storage health
    let storageHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (cacheHitRate < 0.5) storageHealth = 'poor';
    else if (cacheHitRate < 0.7) storageHealth = 'fair';
    else if (cacheHitRate < 0.85) storageHealth = 'good';

    return {
      memoryEntries,
      persistentEntries: backendStats.persistentEntries || 0,
      totalMemorySize,
      cacheHitRate,
      oldestEntry: backendStats.oldestEntry || 0,
      newestEntry: backendStats.newestEntry || Date.now(),
      topDomains,
      storageHealth,
    };
  }

  /**
   * Clean up expired entries from both memory and backend.
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    let memoryEvictions = 0;

    // Clean memory cache
    for (const [id, entry] of this.memoryCache.entries()) {
      if (!this.isEntryValid(entry, now)) {
        this.memoryCache.delete(id);
        memoryEvictions++;
      }
    }

    // Clean backend storage
    const backendDeletions = await this.backend.cleanup(this.config.maxEntryAge);

    this.stats.evictions += memoryEvictions;
    this.stats.entriesDeleted += backendDeletions;
    this.emit('cleanupCompleted', { memoryEvictions, backendDeletions });
  }

  /**
   * Clear all storage (memory and backend)
   */
  async clearAll(): Promise<void> {
    // Clear memory.
    this.memoryCache.clear();

    // Clear backend
    await this.backend.clear();

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      entriesCreated: 0,
      entriesDeleted: 0,
    };
    this.emit('storageCleared');
  }

  /**
   * Delete specific knowledge entry.
   *
   * @param id
   */
  async deleteKnowledge(id: string): Promise<boolean> {
    // Remove from memory cache
    const wasInMemory = this.memoryCache.delete(id);

    // Remove from backend
    const wasInBackend = await this.backend.delete(id);

    if (wasInMemory || wasInBackend) {
      this.stats.entriesDeleted++;
      this.emit('knowledgeDeleted', { id });
      return true;
    }

    return false;
  }

  /**
   * Private helper methods.
   */

  private createBackend(): FACTStorageBackend {
    switch (this.config.backend) {
      case 'sqlite':
        return new SQLiteBackend(this.config.backendConfig);

      case 'jsonb':
        // TODO: Implement JSONB backend
        throw new Error('JSONB backend not yet implemented');

      case 'file':
        // TODO: Implement file backend
        throw new Error('File backend not yet implemented');

      case 'memory':
        // TODO: Implement memory-only backend
        throw new Error('Memory-only backend not yet implemented');

      default:
        throw new Error(`Unknown FACT storage backend: ${this.config.backend}`);
    }
  }

  private generateEntryId(query: string, type: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(`${query}-${type}-${Date.now()}`);
    return hash.digest('hex').substring(0, 16);
  }

  private async storeInMemory(entry: FACTKnowledgeEntry): Promise<void> {
    // Evict old entries if cache is full
    if (this.memoryCache.size >= this.config.maxMemoryCacheSize) {
      await this.evictLeastRecentlyUsed();
    }

    this.memoryCache.set(entry.id, entry);
  }

  private isEntryValid(entry: FACTKnowledgeEntry, now: number = Date.now()): boolean {
    return now - entry.timestamp < entry.ttl;
  }

  private async evictLeastRecentlyUsed(): Promise<void> {
    let oldestEntry: FACTKnowledgeEntry | null = null;
    let oldestId = '';

    for (const [id, entry] of this.memoryCache.entries()) {
      if (!oldestEntry || entry.lastAccessed < oldestEntry.lastAccessed) {
        oldestEntry = entry;
        oldestId = id;
      }
    }

    if (oldestEntry) {
      this.memoryCache.delete(oldestId);
      this.stats.evictions++;
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch((error) => {
        logger.error('Scheduled cleanup failed:', error);
      });
    }, this.config.cleanupInterval);
  }

  /**
   * Shutdown storage system.
   */
  async shutdown(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Final cleanup
    await this.cleanup();

    // Shutdown backend
    await this.backend.shutdown();

    this.memoryCache.clear();

    this.emit('storageShutdown');
  }
}

export default FACTStorageSystem;
