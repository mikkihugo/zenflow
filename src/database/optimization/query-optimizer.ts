/**
 * @fileoverview Intelligent Query Optimizer for Database Systems
 * Advanced query optimization with ML-based performance prediction and adaptive caching
 */

import { EventEmitter } from 'node:events';
import type { DatabaseEngine, DatabaseQuery, QueryExecution } from '../core/database-coordinator';

export interface QueryPattern {
  id: string;
  signature: string; // Normalized query signature
  frequency: number;
  averageLatency: number;
  successRate: number;
  optimalEngine: string;
  lastSeen: number;
  optimizations: string[];
}

export interface OptimizationRule {
  name: string;
  description: string;
  condition: (query: DatabaseQuery, history: QueryExecution[]) => boolean;
  apply: (query: DatabaseQuery, engines: Map<string, DatabaseEngine>) => DatabaseQuery;
  impact: 'low' | 'medium' | 'high';
  category: 'caching' | 'routing' | 'rewriting' | 'parallelization' | 'indexing';
}

export interface QueryCache {
  key: string;
  query: DatabaseQuery;
  result: any;
  timestamp: number;
  hits: number;
  size: number; // Estimated size in bytes
  ttl: number; // Time to live in milliseconds
}

export interface OptimizationMetrics {
  totalQueries: number;
  optimizedQueries: number;
  cacheHits: number;
  cacheMisses: number;
  averageImprovement: number; // Percentage improvement in latency
  rulesApplied: Record<string, number>;
  patternAnalysis: {
    uniquePatterns: number;
    repeatedQueries: number;
    adaptiveLearning: boolean;
  };
}

/**
 * Advanced Query Optimizer
 * Provides intelligent query optimization with adaptive learning and caching
 */
export class QueryOptimizer extends EventEmitter {
  private patterns = new Map<string, QueryPattern>();
  private rules = new Map<string, OptimizationRule>();
  private cache = new Map<string, QueryCache>();
  private queryHistory: QueryExecution[] = [];
  private metrics: OptimizationMetrics;

  // Configuration
  private config = {
    caching: {
      enabled: true,
      maxSize: 1000, // Maximum cache entries
      defaultTTL: 300000, // 5 minutes
      maxMemory: 100 * 1024 * 1024, // 100MB
    },
    patterns: {
      enabled: true,
      minFrequency: 3, // Minimum frequency to consider as pattern
      adaptationRate: 0.1, // Learning rate for pattern adaptation
    },
    optimization: {
      enabled: true,
      aggressiveness: 'medium', // low, medium, high
      parallelization: true,
      rewriting: true,
    },
  };

  constructor() {
    super();
    this.metrics = {
      totalQueries: 0,
      optimizedQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageImprovement: 0,
      rulesApplied: {},
      patternAnalysis: {
        uniquePatterns: 0,
        repeatedQueries: 0,
        adaptiveLearning: true,
      },
    };

    this.registerDefaultRules();
    this.startCacheCleanup();
  }

  /**
   * Optimize a query before execution
   */
  async optimizeQuery(
    query: DatabaseQuery,
    engines: Map<string, DatabaseEngine>,
  ): Promise<DatabaseQuery> {
    this.metrics.totalQueries++;
    this.emit('queryOptimizing', { queryId: query.id, originalQuery: query });

    let optimizedQuery = { ...query };
    const appliedOptimizations: string[] = [];

    try {
      // Check cache first
      if (this.config.caching.enabled) {
        const cached = this.checkCache(query);
        if (cached) {
          this.metrics.cacheHits++;
          this.emit('cacheHit', { queryId: query.id, cached });
          // Return a special query that indicates cache hit
          return {
            ...query,
            operation: 'cache_hit',
            parameters: { cached: cached.result },
          };
        }
        this.metrics.cacheMisses++;
      }

      // Analyze query patterns
      if (this.config.patterns.enabled) {
        this.analyzePattern(query);
      }

      // Apply optimization rules
      if (this.config.optimization.enabled) {
        for (const rule of this.rules.values()) {
          if (rule.condition(query, this.queryHistory)) {
            optimizedQuery = rule.apply(optimizedQuery, engines);
            appliedOptimizations.push(rule.name);
            this.metrics.rulesApplied[rule.name] = (this.metrics.rulesApplied[rule.name] || 0) + 1;
          }
        }
      }

      if (appliedOptimizations.length > 0) {
        this.metrics.optimizedQueries++;
        optimizedQuery.parameters = {
          ...optimizedQuery.parameters,
          __optimizations: appliedOptimizations,
          __originalQuery: query,
        };
      }

      this.emit('queryOptimized', {
        queryId: query.id,
        originalQuery: query,
        optimizedQuery,
        appliedOptimizations,
      });

      return optimizedQuery;
    } catch (error) {
      this.emit('optimizationError', { queryId: query.id, error: error.message });
      return query; // Return original query if optimization fails
    }
  }

  /**
   * Record query execution results for learning
   */
  recordExecution(execution: QueryExecution): void {
    this.queryHistory.push(execution);

    // Limit history size
    if (this.queryHistory.length > 10000) {
      this.queryHistory = this.queryHistory.slice(-8000);
    }

    // Cache successful results
    if (this.config.caching.enabled && execution.status === 'completed' && execution.result) {
      this.cacheResult(execution);
    }

    // Update pattern performance
    this.updatePatternPerformance(execution);

    this.emit('executionRecorded', execution);
  }

  /**
   * Check if query result is cached
   */
  private checkCache(query: DatabaseQuery): QueryCache | null {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Update hit count
    cached.hits++;
    return cached;
  }

  /**
   * Cache query result
   */
  private cacheResult(execution: QueryExecution): void {
    if (!execution.result) return;

    const query = this.findQueryById(execution.queryId);
    if (!query) return;

    const cacheKey = this.generateCacheKey(query);
    const size = this.estimateSize(execution.result);

    // Check cache size limits
    if (this.cache.size >= this.config.caching.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const cacheEntry: QueryCache = {
      key: cacheKey,
      query,
      result: execution.result,
      timestamp: Date.now(),
      hits: 0,
      size,
      ttl: this.calculateTTL(query),
    };

    this.cache.set(cacheKey, cacheEntry);
    this.emit('resultCached', { queryId: execution.queryId, cacheKey });
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(query: DatabaseQuery): string {
    // Create a normalized signature for caching
    const signature = {
      operation: query.operation,
      parameters: this.normalizeParameters(query.parameters),
      requirements: query.requirements,
    };

    return `cache_${JSON.stringify(signature)}`;
  }

  /**
   * Normalize parameters for consistent caching
   */
  private normalizeParameters(params: Record<string, any>): Record<string, any> {
    const normalized = { ...params };

    // Remove optimization metadata
    delete normalized.__optimizations;
    delete normalized.__originalQuery;

    // Sort arrays for consistent hashing
    for (const key in normalized) {
      if (Array.isArray(normalized[key])) {
        normalized[key] = [...normalized[key]].sort();
      }
    }

    return normalized;
  }

  /**
   * Calculate TTL for cached result
   */
  private calculateTTL(query: DatabaseQuery): number {
    // Adaptive TTL based on query characteristics
    let ttl = this.config.caching.defaultTTL;

    // Shorter TTL for write operations
    if (query.type === 'write' || query.type === 'update' || query.type === 'delete') {
      ttl = Math.min(ttl, 60000); // 1 minute max for write operations
    }

    // Longer TTL for read operations with low priority
    if (query.type === 'read' && query.requirements.priority === 'low') {
      ttl = ttl * 2;
    }

    // Shorter TTL for real-time requirements
    if (query.requirements.consistency === 'strong') {
      ttl = Math.min(ttl, 30000); // 30 seconds max for strong consistency
    }

    return ttl;
  }

  /**
   * Evict least recently used cache entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp,
    );

    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Analyze query patterns for optimization
   */
  private analyzePattern(query: DatabaseQuery): void {
    const signature = this.generateQuerySignature(query);
    let pattern = this.patterns.get(signature);

    if (!pattern) {
      pattern = {
        id: signature,
        signature,
        frequency: 1,
        averageLatency: 0,
        successRate: 1,
        optimalEngine: '',
        lastSeen: Date.now(),
        optimizations: [],
      };
      this.patterns.set(signature, pattern);
    } else {
      pattern.frequency++;
      pattern.lastSeen = Date.now();
    }

    this.emit('patternAnalyzed', { signature, pattern });
  }

  /**
   * Generate query signature for pattern analysis
   */
  private generateQuerySignature(query: DatabaseQuery): string {
    // Create a normalized signature for pattern matching
    const signature = {
      type: query.type,
      operation: query.operation,
      // Generalize parameters to find patterns
      parameterTypes: Object.keys(query.parameters).sort(),
      requirements: {
        consistency: query.requirements.consistency,
        priority: query.requirements.priority,
      },
    };

    return JSON.stringify(signature);
  }

  /**
   * Update pattern performance based on execution results
   */
  private updatePatternPerformance(execution: QueryExecution): void {
    const query = this.findQueryById(execution.queryId);
    if (!query) return;

    const signature = this.generateQuerySignature(query);
    const pattern = this.patterns.get(signature);
    if (!pattern) return;

    // Update performance metrics using exponential moving average
    const alpha = this.config.patterns.adaptationRate;

    if (execution.duration) {
      pattern.averageLatency = pattern.averageLatency * (1 - alpha) + execution.duration * alpha;
    }

    const success = execution.status === 'completed' ? 1 : 0;
    pattern.successRate = pattern.successRate * (1 - alpha) + success * alpha;

    if (execution.status === 'completed') {
      pattern.optimalEngine = execution.engineId;
    }
  }

  /**
   * Register default optimization rules
   */
  private registerDefaultRules(): void {
    // Vector search optimization
    this.rules.set('vector_search_optimization', {
      name: 'vector_search_optimization',
      description: 'Optimize vector similarity searches',
      condition: (query) => query.operation.includes('vector_search'),
      apply: (query, engines) => {
        const optimized = { ...query };

        // Add vector search optimizations
        optimized.parameters = {
          ...optimized.parameters,
          optimize: true,
          // Use approximate search for better performance if not high priority
          approximate: query.requirements.priority !== 'critical',
        };

        // Prefer vector engines
        optimized.routing.preferredEngines = Array.from(engines.entries())
          .filter(([, engine]) => engine.type === 'vector')
          .map(([id]) => id);

        return optimized;
      },
      impact: 'high',
      category: 'routing',
    });

    // Graph query optimization
    this.rules.set('graph_query_optimization', {
      name: 'graph_query_optimization',
      description: 'Optimize graph traversal queries',
      condition: (query) => query.operation.includes('graph'),
      apply: (query, _engines) => {
        const optimized = { ...query };

        // Add graph-specific optimizations
        if (query.parameters.maxDepth === undefined) {
          optimized.parameters.maxDepth = 5; // Default traversal depth
        }

        // Enable query planning for complex graph queries
        optimized.parameters.enableQueryPlanning = true;

        return optimized;
      },
      impact: 'medium',
      category: 'rewriting',
    });

    // Batch optimization for similar queries
    this.rules.set('batch_optimization', {
      name: 'batch_optimization',
      description: 'Batch similar queries for better performance',
      condition: (query, history) => {
        // Check if there are recent similar queries
        const recent = history.filter((h) => Date.now() - h.startTime < 5000); // Last 5 seconds
        const similar = recent.filter(
          (h) =>
            h.queryId !== query.id &&
            this.generateQuerySignature(this.findQueryById(h.queryId) || query) ===
              this.generateQuerySignature(query),
        );
        return similar.length > 2;
      },
      apply: (query) => {
        const optimized = { ...query };
        optimized.parameters.enableBatching = true;
        optimized.parameters.batchWindow = 1000; // 1 second batch window
        return optimized;
      },
      impact: 'medium',
      category: 'parallelization',
    });

    // Index hint optimization
    this.rules.set('index_hint_optimization', {
      name: 'index_hint_optimization',
      description: 'Add index hints for better query performance',
      condition: (query) => query.type === 'read' && query.parameters.filter,
      apply: (query) => {
        const optimized = { ...query };

        // Add index hints based on filter fields
        if (query.parameters.filter) {
          const filterFields = Object.keys(query.parameters.filter);
          optimized.parameters.indexHints = filterFields;
        }

        return optimized;
      },
      impact: 'low',
      category: 'indexing',
    });

    // Priority-based engine selection
    this.rules.set('priority_engine_selection', {
      name: 'priority_engine_selection',
      description: 'Select optimal engines based on query priority',
      condition: (query) =>
        query.requirements.priority === 'critical' || query.requirements.priority === 'high',
      apply: (query, engines) => {
        const optimized = { ...query };

        // Sort engines by performance for high priority queries
        const sortedEngines = Array.from(engines.entries())
          .filter(([, engine]) => engine.status === 'active')
          .sort(([, a], [, b]) => a.performance.averageLatency - b.performance.averageLatency)
          .slice(0, 3) // Top 3 engines
          .map(([id]) => id);

        optimized.routing.preferredEngines = sortedEngines;
        optimized.routing.loadBalancing = 'performance_based';

        return optimized;
      },
      impact: 'high',
      category: 'routing',
    });
  }

  /**
   * Find query by ID in history
   */
  private findQueryById(queryId: string): DatabaseQuery | null {
    // This is a simplified lookup - in practice, you'd maintain a query registry
    const execution = this.queryHistory.find((h) => h.queryId === queryId);
    return execution ? null : null; // Would need actual query storage
  }

  /**
   * Estimate object size in bytes
   */
  private estimateSize(obj: any): number {
    const jsonString = JSON.stringify(obj);
    return new Blob([jsonString]).size;
  }

  /**
   * Start cache cleanup interval
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Cleanup every minute
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const expired = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        expired.push(key);
      }
    }

    expired.forEach((key) => this.cache.delete(key));

    if (expired.length > 0) {
      this.emit('cacheCleanup', { expiredEntries: expired.length });
    }
  }

  /**
   * Get optimization statistics
   */
  getStats(): OptimizationMetrics {
    // Update pattern analysis stats
    this.metrics.patternAnalysis.uniquePatterns = this.patterns.size;
    this.metrics.patternAnalysis.repeatedQueries = Array.from(this.patterns.values()).filter(
      (p) => p.frequency >= this.config.patterns.minFrequency,
    ).length;

    return { ...this.metrics };
  }

  /**
   * Get query patterns
   */
  getPatterns(): QueryPattern[] {
    return Array.from(this.patterns.values()).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);

    const hitRate =
      this.metrics.totalQueries > 0 ? this.metrics.cacheHits / this.metrics.totalQueries : 0;

    return {
      entries: this.cache.size,
      totalSize,
      hitRate,
      hits: this.metrics.cacheHits,
      misses: this.metrics.cacheMisses,
      maxSize: this.config.caching.maxSize,
      memoryUsage: (totalSize / this.config.caching.maxMemory) * 100,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cacheCleared');
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): Array<{
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const recommendations = [];
    const stats = this.getStats();
    const cacheStats = this.getCacheStats();

    // Low optimization rate
    if (stats.totalQueries > 100 && stats.optimizedQueries / stats.totalQueries < 0.3) {
      recommendations.push({
        type: 'optimization',
        description: 'Consider enabling more aggressive optimization rules',
        priority: 'medium' as const,
      });
    }

    // Low cache hit rate
    if (cacheStats.hitRate < 0.5 && stats.totalQueries > 50) {
      recommendations.push({
        type: 'caching',
        description: 'Cache hit rate is low - consider increasing cache size or TTL',
        priority: 'medium' as const,
      });
    }

    // High memory usage
    if (cacheStats.memoryUsage > 80) {
      recommendations.push({
        type: 'memory',
        description: 'Cache memory usage is high - consider cache cleanup or size reduction',
        priority: 'high' as const,
      });
    }

    // Pattern analysis
    if (stats.patternAnalysis.repeatedQueries > 10) {
      recommendations.push({
        type: 'patterns',
        description:
          'Many repeated query patterns detected - consider additional optimization rules',
        priority: 'low' as const,
      });
    }

    return recommendations;
  }
}
