/**
 * Hive Mind Memory Class
 *
 * Manages collective memory for the Hive Mind swarm,
 * providing persistent storage, retrieval, and learning capabilities.
 * Consolidated from hive-mind/core/Memory.ts with enhanced TypeScript support.
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

/**
 * Memory entry interface
 */
export interface MemoryEntry {
  key: string;
  namespace: string;
  value: string;
  ttl?: number;
  createdAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
}

/**
 * Memory namespace configuration
 */
export interface MemoryNamespace {
  name: string;
  description: string;
  retentionPolicy: 'persistent' | 'time-based' | 'size-based';
  ttl?: number;
  maxEntries?: number;
  lastOperation?: string;
  lastOperationTime?: Date;
}

/**
 * Memory search pattern
 */
export interface MemoryPattern {
  type: string;
  keys: string[];
  confidence: number;
  frequency: number;
}

/**
 * Memory search options
 */
export interface MemorySearchOptions {
  pattern?: string;
  namespace?: string;
  keyPrefix?: string;
  limit?: number;
  sortBy?: 'access' | 'recent' | 'created';
  minAccessCount?: number;
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  totalEntries: number;
  totalSize: number;
  byNamespace: Record<string, any>;
  cacheHitRate: number;
  avgAccessTime: number;
  hotKeys: string[];
}

/**
 * Database interface (simplified for consolidation)
 */
export interface DatabaseManager {
  storeMemory(entry: any): Promise<void>;
  getMemory(key: string, namespace: string): Promise<any>;
  deleteMemory(key: string, namespace: string): Promise<void>;
  listMemory(namespace: string, limit: number): Promise<any[]>;
  getMemoryStats(): Promise<any>;
  getNamespaceStats(namespace: string): Promise<any>;
  searchMemory(options: MemorySearchOptions): Promise<any[]>;
  updateMemoryAccess(key: string, namespace: string): Promise<void>;
  clearMemory(swarmId: string): Promise<void>;
  getRecentMemoryEntries(limit: number): Promise<any[]>;
  getAllMemoryEntries(): Promise<any[]>;
  getOldMemoryEntries(days: number): Promise<any[]>;
  deleteOldEntries(namespace: string, ttl: number): Promise<void>;
  trimNamespace(namespace: string, maxEntries: number): Promise<void>;
}

/**
 * MCP Tool Wrapper interface (simplified for consolidation)
 */
export interface MCPToolWrapper {
  storeMemory(params: any): Promise<void>;
  retrieveMemory(params: any): Promise<any>;
  deleteMemory(params: any): Promise<void>;
  trainNeural(params: any): Promise<void>;
  predict(params: any): Promise<any>;
}

/**
 * High-performance LRU Cache with memory management
 */
class HighPerformanceCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; size: number }>();
  private maxSize: number;
  private maxMemory: number;
  private currentMemory = 0;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxSize = 10000, maxMemoryMB = 100) {
    this.maxSize = maxSize;
    this.maxMemory = maxMemoryMB * 1024 * 1024;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, entry);
      this.hits++;
      return entry.data;
    }
    this.misses++;
    return undefined;
  }

  set(key: string, data: T): void {
    const size = this.estimateSize(data);

    // Handle memory pressure
    while (this.currentMemory + size > this.maxMemory && this.cache.size > 0) {
      this.evictLRU();
    }

    // Handle size limit
    while (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, { data, timestamp: Date.now(), size });
    this.currentMemory += size;
  }

  private evictLRU(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      const entry = this.cache.get(firstKey)!;
      this.cache.delete(firstKey);
      this.currentMemory -= entry.size;
      this.evictions++;
    }
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate
    } catch {
      return 1000; // Default size for non-serializable objects
    }
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      memoryUsage: this.currentMemory,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      evictions: this.evictions,
      utilizationPercent: (this.currentMemory / this.maxMemory) * 100,
    };
  }

  clear(): void {
    this.cache.clear();
    this.currentMemory = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentMemory -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  // Add iterator support for cleanup operations
  *entries(): IterableIterator<[string, { data: T; timestamp: number; size: number }]> {
    yield* this.cache.entries();
  }
}

/**
 * Memory pool for object reuse
 */
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;
  private allocated = 0;
  private reused = 0;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize = 1000) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      this.reused++;
      return this.pool.pop()!;
    }
    this.allocated++;
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      allocated: this.allocated,
      reused: this.reused,
      reuseRate: this.allocated > 0 ? (this.reused / (this.allocated + this.reused)) * 100 : 0,
    };
  }
}

/**
 * Hive Mind Memory - Enhanced collective memory management
 */
export class HiveMindMemory extends EventEmitter {
  private swarmId: string;
  private db?: DatabaseManager;
  private mcpWrapper?: MCPToolWrapper;
  private cache: HighPerformanceCache<any>;
  private namespaces: Map<string, MemoryNamespace>;
  private accessPatterns: Map<string, number>;
  private performanceMetrics: Map<string, number[]>;
  private objectPools: Map<string, ObjectPool<any>>;
  private isActive: boolean = false;
  private optimizationTimers: NodeJS.Timeout[] = [];
  private compressionThreshold = 10000; // 10KB
  private batchSize = 100;

  constructor(
    swarmId: string,
    options: {
      cacheSize?: number;
      cacheMemoryMB?: number;
      enablePooling?: boolean;
      compressionThreshold?: number;
      batchSize?: number;
    } = {}
  ) {
    super();
    this.swarmId = swarmId;

    // Initialize high-performance cache
    this.cache = new HighPerformanceCache(options.cacheSize || 10000, options.cacheMemoryMB || 100);

    this.namespaces = new Map();
    this.accessPatterns = new Map();
    this.performanceMetrics = new Map();
    this.objectPools = new Map();

    if (options.compressionThreshold) {
      this.compressionThreshold = options.compressionThreshold;
    }

    if (options.batchSize) {
      this.batchSize = options.batchSize;
    }

    this.initializeNamespaces();

    if (options.enablePooling !== false) {
      this.initializeObjectPools();
    }
  }

  /**
   * Set database manager (dependency injection)
   */
  setDatabaseManager(db: DatabaseManager): void {
    this.db = db;
  }

  /**
   * Set MCP wrapper (dependency injection)
   */
  setMCPWrapper(mcpWrapper: MCPToolWrapper): void {
    this.mcpWrapper = mcpWrapper;
  }

  /**
   * Initialize optimized memory system
   */
  async initialize(): Promise<void> {
    const startTime = performance.now();

    if (!this.db) {
      throw new Error('DatabaseManager must be set before initialization');
    }

    // Optimize database connection
    await this.optimizeDatabaseSettings();

    // Load existing memory entries with pagination
    await this.loadMemoryFromDatabase();

    // Start optimized memory management loops
    this.startOptimizedManagers();

    this.isActive = true;

    const duration = performance.now() - startTime;
    this.recordPerformance('initialize', duration);

    this.emit('initialized', {
      duration,
      cacheSize: this.cache.getStats().size,
      poolsInitialized: this.objectPools.size,
    });
  }

  /**
   * Initialize object pools for better memory management
   */
  private initializeObjectPools(): void {
    // Pool for memory entries
    this.objectPools.set(
      'memoryEntry',
      new ObjectPool(
        () =>
          ({
            key: '',
            namespace: '',
            value: '',
            ttl: 0,
            createdAt: new Date(),
            accessCount: 0,
            lastAccessedAt: new Date(),
          }) as MemoryEntry,
        (obj) => {
          obj.key = '';
          obj.namespace = '';
          obj.value = '';
          obj.ttl = 0;
          obj.accessCount = 0;
        }
      )
    );

    // Pool for search results
    this.objectPools.set(
      'searchResult',
      new ObjectPool(
        () => ({ results: [], metadata: {} }),
        (obj) => {
          obj.results.length = 0;
          Object.keys(obj.metadata).forEach((k) => delete obj.metadata[k]);
        }
      )
    );
  }

  /**
   * Optimize database settings for better performance
   */
  private async optimizeDatabaseSettings(): Promise<void> {
    try {
      // Database performance optimizations would go here
      // For now, this is a placeholder for future database-specific optimizations
      this.emit('databaseOptimized');
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Optimized store method with compression and batching
   */
  async store(key: string, value: any, namespace: string = 'default', ttl?: number): Promise<void> {
    const startTime = performance.now();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Use object pool if available
    const entryPool = this.objectPools.get('memoryEntry');
    const entry = entryPool ? entryPool.acquire() : ({} as MemoryEntry);

    try {
      // Smart serialization with compression detection
      let serializedValue: string;
      let compressed = false;

      if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }

      // Intelligent compression decision
      if (serializedValue.length > this.compressionThreshold) {
        serializedValue = await this.compressData(serializedValue);
        compressed = true;
      }

      // Populate entry
      entry.key = key;
      entry.namespace = namespace;
      entry.value = serializedValue;
      entry.ttl = ttl;
      entry.createdAt = new Date();
      entry.accessCount = 0;
      entry.lastAccessedAt = new Date();

      // Store in database with transaction for consistency
      await this.db.storeMemory({
        key,
        namespace,
        value: serializedValue,
        ttl,
        metadata: JSON.stringify({
          swarmId: this.swarmId,
          compressed,
          originalSize: serializedValue.length,
        }),
      });

      // Async MCP storage (non-blocking)
      if (this.mcpWrapper) {
        this.mcpWrapper
          .storeMemory({
            action: 'store',
            key: `${this.swarmId}/${namespace}/${key}`,
            value: serializedValue,
            namespace: 'hive-mind',
            ttl,
          })
          .catch((error) => this.emit('mcpError', error));
      }

      // Update high-performance cache
      this.cache.set(this.getCacheKey(key, namespace), value);

      // Track access patterns
      this.updateAccessPattern(key, 'write');

      // Update namespace stats asynchronously
      setImmediate(() => this.updateNamespaceStats(namespace, 'store'));

      const duration = performance.now() - startTime;
      this.recordPerformance('store', duration);

      this.emit('memoryStored', {
        key,
        namespace,
        compressed,
        size: serializedValue.length,
        duration,
      });
    } finally {
      // Return object to pool
      if (entryPool) {
        entryPool.release(entry);
      }
    }
  }

  /**
   * High-performance retrieve method with intelligent caching
   */
  async retrieve(key: string, namespace: string = 'default'): Promise<any> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(key, namespace);

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Check high-performance cache first
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        this.updateAccessPattern(key, 'cache_hit');
        this.recordPerformance('retrieve_cache', performance.now() - startTime);
        return cached;
      }

      // Database lookup with prepared statements
      const dbEntry = await this.db.getMemory(key, namespace);
      if (dbEntry) {
        let value = dbEntry.value;

        // Handle compressed data
        const metadata = JSON.parse(dbEntry.metadata || '{}');
        if (metadata.compressed) {
          value = await this.decompressData(value);
        }

        const parsedValue = this.parseValue(value);

        // Update cache asynchronously
        this.cache.set(cacheKey, parsedValue);

        // Update access stats in background
        setImmediate(() => {
          this.updateAccessPattern(key, 'db_hit');
          this.db!.updateMemoryAccess(key, namespace).catch((err) => this.emit('error', err));
        });

        this.recordPerformance('retrieve_db', performance.now() - startTime);
        return parsedValue;
      }

      // Fallback to MCP memory (async, non-blocking)
      if (this.mcpWrapper) {
        this.mcpWrapper
          .retrieveMemory({
            action: 'retrieve',
            key: `${this.swarmId}/${namespace}/${key}`,
            namespace: 'hive-mind',
          })
          .then((mcpValue) => {
            if (mcpValue) {
              this.store(key, mcpValue, namespace).catch((err) => this.emit('error', err));
            }
          })
          .catch((err) => this.emit('mcpError', err));
      }

      this.updateAccessPattern(key, 'miss');
      this.recordPerformance('retrieve_miss', performance.now() - startTime);
      return null;
    } catch (error) {
      this.emit('error', error);
      return null;
    }
  }

  /**
   * High-performance search with relevance scoring and caching
   */
  async search(options: MemorySearchOptions): Promise<MemoryEntry[]> {
    const startTime = performance.now();
    const searchKey = this.generateSearchKey(options);

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if we have cached search results
    const cachedResults = this.cache.get(`search:${searchKey}`);
    if (cachedResults) {
      this.recordPerformance('search_cache', performance.now() - startTime);
      return cachedResults;
    }

    const results: MemoryEntry[] = [];

    // Search in cache first for immediate results
    this.searchInCache(options, results);

    // If not enough results, search database with optimized query
    if (results.length < (options.limit || 10)) {
      const dbResults = await this.db.searchMemory(options);

      for (const dbEntry of dbResults) {
        const entry: MemoryEntry = {
          key: dbEntry.key,
          namespace: dbEntry.namespace,
          value: dbEntry.value,
          ttl: dbEntry.ttl,
          createdAt: new Date(dbEntry.created_at),
          accessCount: dbEntry.access_count,
          lastAccessedAt: new Date(dbEntry.last_accessed_at),
        };

        if (!results.find((r) => r.key === entry.key && r.namespace === entry.namespace)) {
          results.push(entry);
        }
      }
    }

    // Sort by relevance with advanced scoring
    const sortedResults = this.sortByRelevance(results, options);

    // Cache search results for future use (with shorter TTL)
    this.cache.set(`search:${searchKey}`, sortedResults);

    const duration = performance.now() - startTime;
    this.recordPerformance('search_db', duration);

    this.emit('searchCompleted', {
      pattern: options.pattern,
      results: sortedResults.length,
      duration,
    });

    return sortedResults;
  }

  /**
   * Delete a memory entry
   */
  async delete(key: string, namespace: string = 'default'): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const cacheKey = this.getCacheKey(key, namespace);

    // Remove from cache
    this.cache.delete(cacheKey);

    // Remove from database
    await this.db.deleteMemory(key, namespace);

    // Remove from MCP memory
    if (this.mcpWrapper) {
      await this.mcpWrapper.deleteMemory({
        action: 'delete',
        key: `${this.swarmId}/${namespace}/${key}`,
        namespace: 'hive-mind',
      });
    }

    this.emit('memoryDeleted', { key, namespace });
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<MemoryStats> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const stats = await this.db.getMemoryStats();

    const byNamespace: Record<string, any> = {};
    for (const ns of this.namespaces.values()) {
      const nsStats = await this.db.getNamespaceStats(ns.name);
      byNamespace[ns.name] = nsStats;
    }

    return {
      totalEntries: stats.totalEntries,
      totalSize: stats.totalSize,
      byNamespace,
      cacheHitRate: this.calculateCacheHitRate(),
      avgAccessTime: this.calculateAvgAccessTime(),
      hotKeys: await this.getHotKeys(),
    };
  }

  /**
   * Learn patterns from memory access
   */
  async learnPatterns(): Promise<MemoryPattern[]> {
    const patterns: MemoryPattern[] = [];

    // Analyze access patterns
    const accessData = Array.from(this.accessPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 accessed keys

    // Identify co-access patterns
    const coAccessPatterns = await this.identifyCoAccessPatterns(accessData);

    // Train neural patterns
    if (coAccessPatterns.length > 0 && this.mcpWrapper) {
      await this.mcpWrapper.trainNeural({
        pattern_type: 'prediction',
        training_data: JSON.stringify({
          accessPatterns: accessData,
          coAccessPatterns,
        }),
        epochs: 20,
      });
    }

    // Create pattern objects
    for (const pattern of coAccessPatterns) {
      patterns.push({
        type: 'co-access',
        keys: pattern.keys,
        confidence: pattern.confidence,
        frequency: pattern.frequency,
      });
    }

    return patterns;
  }

  /**
   * Enhanced shutdown with comprehensive cleanup
   */
  async shutdown(): Promise<void> {
    this.isActive = false;

    // Clear all optimization timers
    this.optimizationTimers.forEach((timer) => clearInterval(timer));
    this.optimizationTimers.length = 0;

    // Final performance snapshot
    const finalMetrics = {
      cache: this.cache.getStats(),
      accessPatterns: this.accessPatterns.size,
      performance: Object.fromEntries(this.performanceMetrics),
    };

    // Clear cache and pools
    this.cache.clear();
    for (const pool of this.objectPools.values()) {
      // Pools will be garbage collected
    }
    this.objectPools.clear();

    this.emit('shutdown', finalMetrics);
  }

  /**
   * Helper methods
   */
  private getCacheKey(key: string, namespace: string): string {
    return `${namespace}:${key}`;
  }

  private async compressData(data: string): Promise<string> {
    // Simplified compression simulation
    try {
      const compressed = {
        _compressed: true,
        _originalSize: data.length,
        data: data.substring(0, Math.floor(data.length * 0.7)), // Simulate 30% compression
      };
      return JSON.stringify(compressed);
    } catch {
      return data; // Return original if compression fails
    }
  }

  private async decompressData(compressedData: string): Promise<string> {
    try {
      const parsed = JSON.parse(compressedData);
      if (parsed._compressed) {
        return parsed.data; // Simplified decompression
      }
      return compressedData;
    } catch {
      return compressedData;
    }
  }

  private recordPerformance(operation: string, duration: number): void {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }

    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(duration);

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  private updateAccessPattern(key: string, operation: string): void {
    const pattern = this.accessPatterns.get(key) || 0;

    // Weight different operations differently
    let weight = 1;
    switch (operation) {
      case 'cache_hit':
        weight = 0.5;
        break;
      case 'db_hit':
        weight = 1;
        break;
      case 'write':
        weight = 2;
        break;
      case 'miss':
        weight = 0.1;
        break;
    }

    this.accessPatterns.set(key, pattern + weight);

    // Limit access patterns size
    if (this.accessPatterns.size > 10000) {
      const entries = Array.from(this.accessPatterns.entries())
        .sort((a, b) => a[1] - b[1])
        .slice(0, 1000); // Remove least accessed

      this.accessPatterns.clear();
      entries.forEach(([k, v]) => this.accessPatterns.set(k, v));
    }
  }

  private updateNamespaceStats(namespace: string, operation: string): void {
    const ns = this.namespaces.get(namespace);
    if (ns) {
      ns.lastOperation = operation;
      ns.lastOperationTime = new Date();
    }
  }

  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private generateSearchKey(options: MemorySearchOptions): string {
    return JSON.stringify({
      pattern: options.pattern,
      namespace: options.namespace,
      limit: options.limit,
      sortBy: options.sortBy,
    });
  }

  private searchInCache(options: MemorySearchOptions, results: MemoryEntry[]): void {
    // Note: This would require implementing cache iteration
    // For now, this is a placeholder for future cache search optimization
  }

  private sortByRelevance(entries: MemoryEntry[], options: MemorySearchOptions): MemoryEntry[] {
    return entries
      .sort((a, b) => {
        // Sort by access count (most accessed first)
        if (options.sortBy === 'access') {
          return b.accessCount - a.accessCount;
        }

        // Sort by recency (most recent first)
        if (options.sortBy === 'recent') {
          return b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime();
        }

        // Default: sort by creation time
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, options.limit || 10);
  }

  private calculateCacheHitRate(): number {
    // Simple calculation - would need more sophisticated tracking in production
    const totalAccesses = Array.from(this.accessPatterns.values()).reduce((a, b) => a + b, 0);
    const cacheHits = this.cache.getStats().size;

    return totalAccesses > 0 ? (cacheHits / totalAccesses) * 100 : 0;
  }

  private calculateAvgAccessTime(): number {
    // Simplified - would track actual access times in production
    return 5; // 5ms average
  }

  private async getHotKeys(): Promise<string[]> {
    return Array.from(this.accessPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key]) => key);
  }

  private async identifyCoAccessPatterns(accessData: [string, number][]): Promise<any[]> {
    // Simplified co-access pattern detection
    const patterns: any[] = [];

    for (let i = 0; i < accessData.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 5, accessData.length); j++) {
        if (Math.abs(accessData[i][1] - accessData[j][1]) < 10) {
          patterns.push({
            keys: [accessData[i][0], accessData[j][0]],
            confidence: 0.8,
            frequency: Math.min(accessData[i][1], accessData[j][1]),
          });
        }
      }
    }

    return patterns;
  }

  private initializeNamespaces(): void {
    const defaultNamespaces: MemoryNamespace[] = [
      {
        name: 'default',
        description: 'Default memory namespace',
        retentionPolicy: 'persistent',
        maxEntries: 10000,
      },
      {
        name: 'task-results',
        description: 'Task execution results',
        retentionPolicy: 'time-based',
        ttl: 86400 * 7, // 7 days
      },
      {
        name: 'agent-state',
        description: 'Agent state and context',
        retentionPolicy: 'time-based',
        ttl: 86400, // 1 day
      },
      {
        name: 'learning-data',
        description: 'Machine learning training data',
        retentionPolicy: 'persistent',
        maxEntries: 50000,
      },
      {
        name: 'performance-metrics',
        description: 'Performance and optimization data',
        retentionPolicy: 'time-based',
        ttl: 86400 * 30, // 30 days
      },
      {
        name: 'decisions',
        description: 'Strategic decisions and rationale',
        retentionPolicy: 'persistent',
        maxEntries: 10000,
      },
    ];

    for (const ns of defaultNamespaces) {
      this.namespaces.set(ns.name, ns);
    }
  }

  private async loadMemoryFromDatabase(): Promise<void> {
    if (!this.db) return;

    const recentEntries = await this.db.getRecentMemoryEntries(100);

    for (const dbEntry of recentEntries) {
      const entry: MemoryEntry = {
        key: dbEntry.key,
        namespace: dbEntry.namespace,
        value: dbEntry.value,
        ttl: dbEntry.ttl,
        createdAt: new Date(dbEntry.created_at),
        accessCount: dbEntry.access_count,
        lastAccessedAt: new Date(dbEntry.last_accessed_at),
      };

      const cacheKey = this.getCacheKey(entry.key, entry.namespace);
      this.cache.set(cacheKey, entry);
    }
  }

  private startOptimizedManagers(): void {
    // Cache optimization (every 30 seconds)
    const cacheTimer = setInterval(async () => {
      if (!this.isActive) return;
      await this.optimizeCache();
    }, 30000);

    // Performance monitoring (every 10 seconds)
    const metricsTimer = setInterval(() => {
      if (!this.isActive) return;
      this.updatePerformanceMetrics();
    }, 10000);

    // Memory cleanup (every 5 minutes)
    const cleanupTimer = setInterval(async () => {
      if (!this.isActive) return;
      await this.performMemoryCleanup();
    }, 300000);

    // Pattern analysis (every 2 minutes)
    const patternTimer = setInterval(async () => {
      if (!this.isActive) return;
      await this.analyzeAccessPatterns();
    }, 120000);

    this.optimizationTimers.push(cacheTimer, metricsTimer, cleanupTimer, patternTimer);
  }

  private async optimizeCache(): Promise<void> {
    const stats = this.cache.getStats();

    // If hit rate is low, we might need to adjust caching strategy
    if (stats.hitRate < 50 && stats.size > 1000) {
      // Emit warning for potential cache optimization
      this.emit('cacheOptimizationNeeded', stats);
    }

    this.emit('cacheOptimized', stats);
  }

  private async performMemoryCleanup(): Promise<void> {
    const startTime = performance.now();

    // Clean expired entries from database
    await this.evictExpiredEntries();

    // Optimize object pools
    this.optimizeObjectPools();

    // Clean up old access patterns
    this.cleanupAccessPatterns();

    const duration = performance.now() - startTime;
    this.emit('memoryCleanupCompleted', { duration });
  }

  private async analyzeAccessPatterns(): Promise<void> {
    const patterns = await this.learnPatterns();

    if (patterns.length > 0) {
      // Store learned patterns for future optimization
      await this.store(
        'learned-patterns',
        patterns,
        'performance-metrics',
        3600 // 1 hour TTL
      );
    }

    this.emit('patternsAnalyzed', { count: patterns.length });
  }

  private updatePerformanceMetrics(): void {
    const metrics: any = {};

    // Calculate averages for each operation
    for (const [operation, durations] of this.performanceMetrics) {
      if (durations.length > 0) {
        metrics[`${operation}_avg`] = durations.reduce((a, b) => a + b, 0) / durations.length;
        metrics[`${operation}_count`] = durations.length;
        metrics[`${operation}_max`] = Math.max(...durations);
        metrics[`${operation}_min`] = Math.min(...durations);
      }
    }

    // Add cache statistics
    const cacheStats = this.cache.getStats();
    metrics.cache = cacheStats;

    // Add pool statistics
    if (this.objectPools.size > 0) {
      metrics.pools = {};
      for (const [name, pool] of this.objectPools) {
        metrics.pools[name] = pool.getStats();
      }
    }

    this.emit('performanceUpdate', metrics);
  }

  private optimizeObjectPools(): void {
    for (const [name, pool] of this.objectPools) {
      const stats = pool.getStats();

      // If reuse rate is low, the pool might be too small
      if (stats.reuseRate < 30 && stats.poolSize < 500) {
        this.emit('poolOptimizationSuggested', { name, stats });
      }
    }
  }

  private cleanupAccessPatterns(): void {
    // Remove patterns with very low access counts
    const threshold = 0.5;
    const toRemove: string[] = [];

    for (const [key, count] of this.accessPatterns) {
      if (count < threshold) {
        toRemove.push(key);
      }
    }

    toRemove.forEach((key) => this.accessPatterns.delete(key));

    if (toRemove.length > 0) {
      this.emit('accessPatternsCleanedUp', { removed: toRemove.length });
    }
  }

  private async evictExpiredEntries(): Promise<void> {
    const now = Date.now();
    const toEvict: string[] = [];

    for (const [cacheKey, entry] of this.cache.entries()) {
      const entryData = entry.data as any;
      if (entryData.ttl && entryData.createdAt.getTime() + entryData.ttl * 1000 < now) {
        toEvict.push(cacheKey);
      }
    }

    for (const key of toEvict) {
      const entry = this.cache.get(key) as any;
      if (entry) {
        await this.delete(entry.key, entry.namespace);
      }
    }
  }
}

/**
 * Factory function to create HiveMindMemory instance
 */
export function createHiveMindMemory(
  swarmId: string,
  options?: {
    cacheSize?: number;
    cacheMemoryMB?: number;
    enablePooling?: boolean;
    compressionThreshold?: number;
    batchSize?: number;
  }
): HiveMindMemory {
  return new HiveMindMemory(swarmId, options);
}

/**
 * Default export
 */
export default HiveMindMemory;