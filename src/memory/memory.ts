/** Enhanced Memory Management System - TypeScript Edition */
/** Provides persistent storage for session data and cross-session memory */
/** with comprehensive type safety, performance optimizations, vector storage, and caching */

import { EventEmitter } from 'node:events';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

interface EnhancedMemoryOptions {
  directory?: string;
  namespace?: string;
  enableCompression?: boolean;
  maxMemorySize?: number;
  autoSave?: boolean;
  saveInterval?: number;
  enableEncryption?: boolean;
  encryptionKey?: string;
  // New caching options
  enableCache?: boolean;
  cacheSize?: number;
  cacheTTL?: number;
  // Vector storage options
  enableVectorStorage?: boolean;
  vectorDimensions?: number;
  // Query options
  enableIndexing?: boolean;
}

export interface SessionState {
  sessionId: string;
  data: Record<string, any>;
  metadata: {
    created: number;
    updated: number;
    accessed: number;
    size: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    ttl?: number;
    compressed?: boolean;
  };
  vectors?: Map<string, number[]>;
  cache?: {
    lastAccessed: number;
    accessCount: number;
    hitCount: number;
  };
}

export interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  accessCount: number;
  size: number;
}

export interface VectorSearchResult {
  sessionId: string;
  key: string;
  data: any;
  similarity: number;
  metadata: any;
}

export interface QueryOptions {
  sessionId?: string;
  tags?: string[];
  dateRange?: { start: number; end: number };
  priority?: 'low' | 'medium' | 'high';
  limit?: number;
  sortBy?: 'created' | 'updated' | 'accessed' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface MemoryStats {
  totalSessions: number;
  totalSize: number;
  averageAccessTime: number;
  cacheHitRate: number;
}

export class EnhancedMemory extends EventEmitter {
  private initialized = false;
  private sessions = new Map<string, SessionState>();
  private options: Required<EnhancedMemoryOptions>;
  private directory: string;
  private namespace: string;
  private memoryFile: string;
  private compressionEnabled: boolean;
  private encryptionEnabled: boolean;
  private autoSaveTimer?: NodeJS.Timeout;
  private stats: MemoryStats;

  // Cache management
  private cache = new Map<string, CacheEntry>();
  private cacheKeys: string[] = []; // LRU order
  private cacheStats = { hits: 0, misses: 0 };

  // Vector storage
  private vectors = new Map<string, Map<string, number[]>>();

  // Indexing
  private tagIndex = new Map<string, Set<string>>();
  private priorityIndex = new Map<string, Set<string>>();
  private dateIndex = new Map<string, Set<string>>();

  constructor(options: EnhancedMemoryOptions = {}) {
    super();

    this.options = {
      directory: options.directory ?? './data/memory',
      namespace: options.namespace ?? 'claude-flow',
      enableCompression: options.enableCompression ?? false,
      maxMemorySize: options.maxMemorySize ?? 100 * 1024 * 1024, // 100MB
      autoSave: options.autoSave ?? true,
      saveInterval: options.saveInterval ?? 30000, // 30 seconds
      enableEncryption: options.enableEncryption ?? false,
      encryptionKey: options.encryptionKey ?? '',
      enableCache: options.enableCache ?? true,
      cacheSize: options.cacheSize ?? 1000,
      cacheTTL: options.cacheTTL ?? 300000, // 5 minutes
      enableVectorStorage: options.enableVectorStorage ?? true,
      vectorDimensions: options.vectorDimensions ?? 512,
      enableIndexing: options.enableIndexing ?? true,
    };

    this.directory = this.options.directory;
    this.namespace = this.options.namespace;
    this.memoryFile = path.join(this.directory, `${this.namespace}-memory.json`);
    this.compressionEnabled = this.options.enableCompression;
    this.encryptionEnabled = this.options.enableEncryption;

    this.stats = {
      totalSessions: 0,
      totalSize: 0,
      averageAccessTime: 0,
      cacheHitRate: 0,
    };
  }

  /** Initialize the memory system with enhanced error handling */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure memory directory exists
      if (!existsSync(this.directory)) {
        mkdirSync(this.directory, { recursive: true });
      }

      // Load existing memory data
      await this.loadFromDisk();

      // Start auto-save timer if enabled
      if (this.options.autoSave) {
        this.startAutoSave();
      }

      this.initialized = true;
      this.emit('initialized', { namespace: this.namespace });

      console.log(`✅ Enhanced memory initialized: ${this.namespace}`);
      console.log(`📁 Directory: ${this.directory}`);
      console.log(`📊 Sessions loaded: ${this.sessions.size}`);
    } catch (error) {
      console.error('❌ Enhanced memory initialization failed:', error);
      throw error;
    }
  }

  /** Store data in a session with metadata tracking */
  async store(
    sessionId: string,
    key: string,
    data: any,
    options?: {
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      ttl?: number;
      vector?: number[];
    }
  ): Promise<void> {
    this.ensureInitialized();

    const startTime = Date.now();

    try {
      let session = this.sessions.get(sessionId);

      if (!session) {
        session = {
          sessionId,
          data: {},
          metadata: {
            created: Date.now(),
            updated: Date.now(),
            accessed: Date.now(),
            size: 0,
            tags: options?.tags || [],
            priority: options?.priority || 'medium',
            ttl: options?.ttl,
          },
          vectors: new Map(),
          cache: {
            lastAccessed: Date.now(),
            accessCount: 0,
            hitCount: 0,
          },
        };
        this.sessions.set(sessionId, session);
        this.stats.totalSessions++;
      }

      // Store the data
      session.data[key] = data;
      session.metadata.updated = Date.now();
      session.metadata.accessed = Date.now();

      // Update tags, priority if provided
      if (options?.tags) {
        session.metadata.tags = [...(session.metadata.tags || []), ...options.tags];
        this.updateTagIndex(sessionId, options.tags);
      }
      if (options?.priority) {
        session.metadata.priority = options.priority;
        this.updatePriorityIndex(sessionId, options.priority);
      }
      if (options?.ttl) {
        session.metadata.ttl = options.ttl;
      }

      // Store vector if provided
      if (options?.vector && this.options.enableVectorStorage) {
        session.vectors?.set(key, options.vector);
        this.updateVectorIndex(sessionId, key, options.vector);
      }

      // Calculate size (approximate)
      const dataString = JSON.stringify(session.data);
      session.metadata.size = dataString.length;

      // Update cache
      if (this.options.enableCache) {
        this.updateCache(sessionId, key, data);
      }

      // Update indices
      this.updateDateIndex(sessionId);

      // Update statistics
      this.updateStats();

      const duration = Date.now() - startTime;
      this.emit('stored', { sessionId, key, duration, cached: this.options.enableCache });
    } catch (error) {
      console.error(`❌ Failed to store data for session ${sessionId}:`, error);
      throw error;
    }
  }

  /** Retrieve data from a session */
  async retrieve(sessionId: string, key?: string): Promise<any> {
    this.ensureInitialized();

    const startTime = Date.now();
    let fromCache = false;

    try {
      // Check cache first
      if (this.options.enableCache && key) {
        const cacheKey = `${sessionId}:${key}`;
        const cached = this.getCachedData(cacheKey);
        if (cached !== null) {
          this.cacheStats.hits++;
          fromCache = true;
          const duration = Date.now() - startTime;
          this.emit('retrieved', { sessionId, key, found: true, duration, fromCache: true });
          return cached;
        }
        this.cacheStats.misses++;
      }

      const session = this.sessions.get(sessionId);

      if (!session) {
        return null;
      }

      // Check TTL
      if (session.metadata.ttl && Date.now() > session.metadata.created + session.metadata.ttl) {
        await this.clearSession(sessionId);
        return null;
      }

      // Update access time and stats
      session.metadata.accessed = Date.now();
      if (session.cache) {
        session.cache.lastAccessed = Date.now();
        session.cache.accessCount++;
      }

      const result = key ? session.data[key] : session.data;

      // Update cache with retrieved data
      if (this.options.enableCache && key && result !== undefined) {
        this.updateCache(sessionId, key, result);
      }

      const duration = Date.now() - startTime;
      this.emit('retrieved', { sessionId, key, found: !!result, duration, fromCache });

      return result;
    } catch (error) {
      console.error(`❌ Failed to retrieve data for session ${sessionId}:`, error);
      throw error;
    }
  }

  /** Get all session IDs */
  getSessions(): string[] {
    this.ensureInitialized();
    return Array.from(this.sessions.keys());
  }

  /** Get memory statistics (basic version) */
  getBasicStats(): MemoryStats {
    this.updateStats();
    return { ...this.stats };
  }

  /** Clear a specific session */
  async clearSession(sessionId: string): Promise<boolean> {
    this.ensureInitialized();

    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.stats.totalSessions--;
      this.emit('sessionCleared', { sessionId });
    }

    return deleted;
  }

  /** Clear all sessions */
  async clearAll(): Promise<void> {
    this.ensureInitialized();

    const count = this.sessions.size;
    this.sessions.clear();
    this.stats.totalSessions = 0;

    this.emit('allCleared', { clearedCount: count });
  }

  /** Save memory to disk */
  async saveToDisk(): Promise<void> {
    this.ensureInitialized();

    try {
      const memoryData = {
        namespace: this.namespace,
        timestamp: Date.now(),
        sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
          id,
          ...session,
        })),
        stats: this.stats,
      };

      let dataToWrite = JSON.stringify(memoryData, null, 2);

      // Apply compression if enabled
      if (this.compressionEnabled) {
        // Simple compression could be implemented here
        // For now, just minify JSON
        dataToWrite = JSON.stringify(memoryData);
      }

      writeFileSync(this.memoryFile, dataToWrite);
      this.emit('saved', { file: this.memoryFile, size: dataToWrite.length });
    } catch (error) {
      console.error('❌ Failed to save memory to disk:', error);
      throw error;
    }
  }

  /** Load memory from disk */
  private async loadFromDisk(): Promise<void> {
    if (!existsSync(this.memoryFile)) {
      console.log('📝 No existing memory file found, starting fresh');
      return;
    }

    try {
      const dataString = readFileSync(this.memoryFile, 'utf8');
      const memoryData = JSON.parse(dataString);

      // Restore sessions
      if (memoryData.sessions) {
        for (const sessionData of memoryData.sessions) {
          this.sessions.set(sessionData.id, {
            sessionId: sessionData.sessionId,
            data: sessionData.data,
            metadata: sessionData.metadata,
          });
        }
      }

      // Restore stats
      if (memoryData.stats) {
        this.stats = { ...this.stats, ...memoryData.stats };
      }

      this.emit('loaded', { sessions: this.sessions.size });
    } catch (error) {
      console.warn('⚠️ Failed to load existing memory, starting fresh:', error);
    }
  }

  /** Start auto-save timer */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      try {
        await this.saveToDisk();
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, this.options.saveInterval);
  }

  /** Update internal statistics */
  private updateStats(): void {
    let totalSize = 0;

    for (const session of Array.from(this.sessions.values())) {
      totalSize += session.metadata.size;
    }

    this.stats.totalSessions = this.sessions.size;
    this.stats.totalSize = totalSize;
  }

  /** Ensure system is initialized */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Enhanced memory system not initialized. Call initialize() first.');
    }
  }

  /** Query data with advanced options */
  async query(
    options: QueryOptions
  ): Promise<Array<{ sessionId: string; key: string; data: any; metadata: any }>> {
    this.ensureInitialized();

    const results: Array<{ sessionId: string; key: string; data: any; metadata: any }> = [];

    for (const [sessionId, session] of Array.from(this.sessions.entries())) {
      // Filter by sessionId if specified
      if (options.sessionId && sessionId !== options.sessionId) continue;

      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        const sessionTags = session.metadata.tags || [];
        const hasMatchingTag = options.tags.some((tag) => sessionTags.includes(tag));
        if (!hasMatchingTag) continue;
      }

      // Filter by priority
      if (options.priority && session.metadata.priority !== options.priority) continue;

      // Filter by date range
      if (options.dateRange) {
        const created = session.metadata.created;
        if (created < options.dateRange.start || created > options.dateRange.end) continue;
      }

      // Add all keys from this session
      for (const [key, data] of Object.entries(session.data)) {
        results.push({ sessionId, key, data, metadata: session.metadata });
      }
    }

    // Sort results
    if (options.sortBy) {
      results.sort((a, b) => {
        let aValue: number, bValue: number;
        switch (options.sortBy) {
          case 'created':
            aValue = a.metadata.created;
            bValue = b.metadata.created;
            break;
          case 'updated':
            aValue = a.metadata.updated;
            bValue = b.metadata.updated;
            break;
          case 'accessed':
            aValue = a.metadata.accessed;
            bValue = b.metadata.accessed;
            break;
          case 'size':
            aValue = a.metadata.size;
            bValue = b.metadata.size;
            break;
          default:
            return 0;
        }

        const result = aValue - bValue;
        return options.sortOrder === 'desc' ? -result : result;
      });
    }

    // Apply limit
    if (options.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  /** Vector similarity search */
  async vectorSearch(
    queryVector: number[],
    options?: {
      topK?: number;
      threshold?: number;
      sessionId?: string;
    }
  ): Promise<VectorSearchResult[]> {
    this.ensureInitialized();

    if (!this.options.enableVectorStorage) {
      throw new Error('Vector storage is not enabled');
    }

    const results: VectorSearchResult[] = [];
    const topK = options?.topK || 10;
    const threshold = options?.threshold || 0.0;

    for (const [sessionId, vectorMap] of Array.from(this.vectors.entries())) {
      if (options?.sessionId && sessionId !== options.sessionId) continue;

      const session = this.sessions.get(sessionId);
      if (!session) continue;

      for (const [key, vector] of vectorMap) {
        const similarity = this.cosineSimilarity(queryVector, vector);

        if (similarity >= threshold) {
          results.push({
            sessionId,
            key,
            data: session.data[key],
            similarity,
            metadata: session.metadata,
          });
        }
      }
    }

    // Sort by similarity (descending) and limit
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  /** Cache management methods */
  private updateCache(sessionId: string, key: string, data: any): void {
    if (!this.options.enableCache) return;

    const cacheKey = `${sessionId}:${key}`;
    const now = Date.now();

    // Remove expired entries
    this.cleanExpiredCache();

    // Check cache size limit
    if (this.cache.size >= this.options.cacheSize) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      key: cacheKey,
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      timestamp: now,
      accessCount: 1,
      size: JSON.stringify(data).length,
    };

    this.cache.set(cacheKey, entry);

    // Update LRU order
    const index = this.cacheKeys.indexOf(cacheKey);
    if (index > -1) {
      this.cacheKeys.splice(index, 1);
    }
    this.cacheKeys.push(cacheKey);
  }

  private getCachedData(cacheKey: string): any {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp > this.options.cacheTTL) {
      this.cache.delete(cacheKey);
      const index = this.cacheKeys.indexOf(cacheKey);
      if (index > -1) this.cacheKeys.splice(index, 1);
      return null;
    }

    // Update access stats
    entry.accessCount++;

    // Update LRU order
    const index = this.cacheKeys.indexOf(cacheKey);
    if (index > -1) {
      this.cacheKeys.splice(index, 1);
      this.cacheKeys.push(cacheKey);
    }

    return entry.data;
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > this.options.cacheTTL) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
      const index = this.cacheKeys.indexOf(key);
      if (index > -1) this.cacheKeys.splice(index, 1);
    });
  }

  private evictLRU(): void {
    if (this.cacheKeys.length === 0) return;

    const oldestKey = this.cacheKeys.shift();
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /** Vector operations */
  private updateVectorIndex(sessionId: string, key: string, vector: number[]): void {
    if (!this.vectors.has(sessionId)) {
      this.vectors.set(sessionId, new Map());
    }
    this.vectors.get(sessionId)!.set(key, vector);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /** Index management */
  private updateTagIndex(sessionId: string, tags: string[]): void {
    tags.forEach((tag) => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(sessionId);
    });
  }

  private updatePriorityIndex(sessionId: string, priority: string): void {
    if (!this.priorityIndex.has(priority)) {
      this.priorityIndex.set(priority, new Set());
    }
    this.priorityIndex.get(priority)!.add(sessionId);
  }

  private updateDateIndex(sessionId: string): void {
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (!this.dateIndex.has(dateKey)) {
      this.dateIndex.set(dateKey, new Set());
    }
    this.dateIndex.get(dateKey)!.add(sessionId);
  }

  /** Get enhanced statistics */
  getStats(): MemoryStats {
    this.updateStats();

    const cacheHitRate =
      this.cacheStats.hits + this.cacheStats.misses > 0
        ? this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)
        : 0;

    return {
      ...this.stats,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100, // Round to 2 decimal places
    };
  }

  /** Get cache statistics */
  getCacheStats(): { size: number; hits: number; misses: number; hitRate: number } {
    const hitRate =
      this.cacheStats.hits + this.cacheStats.misses > 0
        ? this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)
        : 0;

    return {
      size: this.cache.size,
      hits: this.cacheStats.hits,
      misses: this.cacheStats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /** Clear cache */
  clearCache(): void {
    this.cache.clear();
    this.cacheKeys.length = 0;
    this.cacheStats = { hits: 0, misses: 0 };
    this.emit('cacheCleared');
  }

  /** Cleanup and shutdown */
  async shutdown(): Promise<void> {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    if (this.initialized) {
      await this.saveToDisk();
    }

    // Clear all data structures
    this.cache.clear();
    this.cacheKeys.length = 0;
    this.vectors.clear();
    this.tagIndex.clear();
    this.priorityIndex.clear();
    this.dateIndex.clear();

    this.initialized = false;
    this.emit('shutdown');
  }
}

export default EnhancedMemory;
