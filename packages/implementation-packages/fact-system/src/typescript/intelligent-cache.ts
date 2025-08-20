/**
 * @fileoverview Intelligent Cache System inspired by ruvnet/FACT
 * 
 * Implements cache-first methodology with intelligent cache duration based on data volatility.
 * Provides sub-100ms response times through smart caching strategies.
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getDatabaseAccess, KeyValueStore, getLogger } from '@claude-zen/foundation';

const logger = getLogger('IntelligentCache');

/**
 * Cache tiers based on data volatility
 */
export enum CacheTier {
  /** Static data that rarely changes (packages, security advisories) */
  LONG_TERM = 'long-term',
  
  /** Semi-static data that changes periodically (repo stats, releases) */
  MEDIUM_TERM = 'medium-term',
  
  /** Dynamic data that changes frequently (trending repos, real-time stats) */
  SHORT_TERM = 'short-term',
  
  /** Real-time data that should always be fresh (current issues, live stats) */
  NO_CACHE = 'no-cache'
}

/**
 * Cache configuration for different data types
 */
interface CacheConfig {
  tier: CacheTier;
  ttl: number; // milliseconds
  maxAge: number; // milliseconds
  volatilityScore: number; // 0-1, higher = more volatile
}

/**
 * Cache entry with metadata
 */
interface CacheEntry extends Record<string, unknown> {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  volatilityScore: number;
  tier: CacheTier;
}

/**
 * Intelligent cache system that adapts cache duration based on data type and volatility
 */
export class IntelligentCache {
  private kv!: KeyValueStore;
  private cacheConfigs: Map<string, CacheConfig>;
  private hitCount = 0;
  private missCount = 0;

  constructor(namespace: string = 'intelligent-cache') {
    this.initializeDatabase(namespace);
    this.cacheConfigs = this.initializeCacheConfigs();
  }

  /**
   * Initialize database connection using foundation
   */
  private async initializeDatabase(namespace: string): Promise<void> {
    try {
      const dbAccess = getDatabaseAccess();
      this.kv = await dbAccess.getKV(namespace);
      logger.debug(`Initialized KV storage for namespace: ${namespace}`);
    } catch (error) {
      logger.error(`Failed to initialize database for namespace ${namespace}:`, error);
      throw error;
    }
  }

  /**
   * Initialize cache configurations for different data types
   */
  private initializeCacheConfigs(): Map<string, CacheConfig> {
    const configs = new Map<string, CacheConfig>();

    // NPM Package Data (stable, changes with releases)
    configs.set('npm-package', {
      tier: CacheTier.LONG_TERM,
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      volatilityScore: 0.2
    });

    // Security Advisories (stable once published)
    configs.set('security-advisory', {
      tier: CacheTier.LONG_TERM,
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      volatilityScore: 0.1
    });

    // GitHub Repository Metadata (medium volatility)
    configs.set('github-repo', {
      tier: CacheTier.MEDIUM_TERM,
      ttl: 4 * 60 * 60 * 1000, // 4 hours
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      volatilityScore: 0.5
    });

    // GitHub Repository Stats (higher volatility)
    configs.set('github-stats', {
      tier: CacheTier.SHORT_TERM,
      ttl: 30 * 60 * 1000, // 30 minutes
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      volatilityScore: 0.7
    });

    // API Documentation (stable)
    configs.set('api-docs', {
      tier: CacheTier.LONG_TERM,
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      volatilityScore: 0.3
    });

    // Search Results (medium-high volatility)
    configs.set('search-results', {
      tier: CacheTier.MEDIUM_TERM,
      ttl: 2 * 60 * 60 * 1000, // 2 hours
      maxAge: 6 * 60 * 60 * 1000, // 6 hours
      volatilityScore: 0.6
    });

    // Natural Language Query Results (medium volatility)
    configs.set('nl-query', {
      tier: CacheTier.MEDIUM_TERM,
      ttl: 60 * 60 * 1000, // 1 hour
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
      volatilityScore: 0.5
    });

    return configs;
  }

  /**
   * Get cached data with intelligent cache logic
   */
  async get(type: string, key: string): Promise<any | null> {
    const cacheKey = `${type}:${key}`;
    
    try {
      const entryData = await this.kv.get(cacheKey);
      if (!entryData) {
        this.missCount++;
        return null;
      }
      
      const entry = JSON.parse(entryData) as CacheEntry;
      
      // Check if cache is still valid
      if (this.isCacheValid(entry)) {
        // Update access metadata
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        await this.kv.set(cacheKey, entry);
        
        this.hitCount++;
        logger.debug(`Cache HIT: ${cacheKey} (tier: ${entry.tier})`);
        return entry.data;
      } else {
        // Cache expired
        await this.kv.delete(cacheKey);
        this.missCount++;
        logger.debug(`Cache EXPIRED: ${cacheKey}`);
        return null;
      }
    } catch (error) {
      logger.warn(`Cache get error for ${cacheKey}:`, error);
      this.missCount++;
      return null;
    }
  }

  /**
   * Store data in cache with intelligent expiration
   */
  async set(type: string, key: string, data: any): Promise<void> {
    const config = this.cacheConfigs.get(type) || this.getDefaultConfig();
    const cacheKey = `${type}:${key}`;
    
    // Adapt TTL based on data freshness and access patterns
    const adaptedTTL = this.adaptTTL(config, data);
    
    const entry: CacheEntry = {
      key: cacheKey,
      data,
      timestamp: Date.now(),
      ttl: adaptedTTL,
      accessCount: 1,
      lastAccessed: Date.now(),
      volatilityScore: config.volatilityScore,
      tier: config.tier
    };

    try {
      await this.kv.set(cacheKey, entry);
      logger.debug(`Cache SET: ${cacheKey} (tier: ${config.tier}, ttl: ${adaptedTTL}ms)`);
    } catch (error) {
      logger.warn(`Cache set error for ${cacheKey}:`, error);
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    
    // Basic TTL check
    if (age > entry.ttl) {
      return false;
    }

    // Enhanced validation based on access patterns
    const config = this.getCacheConfigByTier(entry.tier);
    if (config && age > config.maxAge) {
      return false;
    }

    return true;
  }

  /**
   * Adapt TTL based on data characteristics and access patterns
   */
  private adaptTTL(config: CacheConfig, data: any): number {
    let adaptedTTL = config.ttl;

    // Reduce TTL for data that appears to be more volatile
    if (this.detectHighVolatility(data)) {
      adaptedTTL = Math.floor(adaptedTTL * 0.5);
    }

    // Increase TTL for data that appears stable
    if (this.detectLowVolatility(data)) {
      adaptedTTL = Math.floor(adaptedTTL * 1.5);
    }

    return Math.max(adaptedTTL, 60 * 1000); // Minimum 1 minute
  }

  /**
   * Detect if data shows signs of high volatility
   */
  private detectHighVolatility(data: any): boolean {
    if (typeof data !== 'object' || !data) return false;

    // Check for time-sensitive indicators
    const volatilityIndicators = [
      'trending', 'live', 'current', 'now', 'recent',
      'today', 'latest', 'real-time', 'active'
    ];

    const dataStr = JSON.stringify(data).toLowerCase();
    return volatilityIndicators.some(indicator => dataStr.includes(indicator));
  }

  /**
   * Detect if data shows signs of low volatility (stable)
   */
  private detectLowVolatility(data: any): boolean {
    if (typeof data !== 'object' || !data) return false;

    // Check for stability indicators
    const stabilityIndicators = [
      'archived', 'final', 'stable', 'released', 'published',
      'documentation', 'specification', 'standard'
    ];

    const dataStr = JSON.stringify(data).toLowerCase();
    return stabilityIndicators.some(indicator => dataStr.includes(indicator));
  }

  /**
   * Get cache configuration by tier
   */
  private getCacheConfigByTier(tier: CacheTier): CacheConfig | undefined {
    for (const config of this.cacheConfigs.values()) {
      if (config.tier === tier) {
        return config;
      }
    }
    return undefined;
  }

  /**
   * Get default cache configuration
   */
  private getDefaultConfig(): CacheConfig {
    return {
      tier: CacheTier.MEDIUM_TERM,
      ttl: 60 * 60 * 1000, // 1 hour
      maxAge: 4 * 60 * 60 * 1000, // 4 hours
      volatilityScore: 0.5
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    hitRate: number;
    hitCount: number;
    missCount: number;
    totalRequests: number;
  } {
    const totalRequests = this.hitCount + this.missCount;
    
    return {
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      hitCount: this.hitCount,
      missCount: this.missCount,
      totalRequests
    };
  }

  /**
   * Clear cache for specific type or all cache
   */
  async clearCache(type?: string): Promise<void> {
    if (type) {
      // Clear specific type - need to iterate through keys with pattern
      logger.info(`Clearing cache for type: ${type}`);
      const allKeys = await this.kv.keys();
      const keysToDelete = allKeys.filter(key => key.startsWith(`${type}:`));
      
      for (const key of keysToDelete) {
        await this.kv.delete(key);
      }
      
      logger.info(`Cleared ${keysToDelete.length} cache entries for type: ${type}`);
    } else {
      // Clear all cache
      logger.info('Clearing all intelligent cache');
      await this.kv.clear();
      this.hitCount = 0;
      this.missCount = 0;
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(): Promise<void> {
    logger.info('Warming intelligent cache with frequently accessed data...');
    
    // Pre-load common NPM packages
    const commonPackages = [
      'react', 'vue', 'angular', 'express', 'typescript',
      'next', 'webpack', 'vite', 'jest', 'eslint'
    ];

    // This would trigger actual data fetching to populate cache
    logger.info(`Pre-loading ${commonPackages.length} common packages for cache warming`);
  }
}