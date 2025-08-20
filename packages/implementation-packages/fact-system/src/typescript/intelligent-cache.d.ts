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
/**
 * Cache tiers based on data volatility
 */
export declare enum CacheTier {
    /** Static data that rarely changes (packages, security advisories) */
    LONG_TERM = "long-term",
    /** Semi-static data that changes periodically (repo stats, releases) */
    MEDIUM_TERM = "medium-term",
    /** Dynamic data that changes frequently (trending repos, real-time stats) */
    SHORT_TERM = "short-term",
    /** Real-time data that should always be fresh (current issues, live stats) */
    NO_CACHE = "no-cache"
}
/**
 * Intelligent cache system that adapts cache duration based on data type and volatility
 */
export declare class IntelligentCache {
    private kv;
    private cacheConfigs;
    private hitCount;
    private missCount;
    constructor(namespace?: string);
    /**
     * Initialize database connection using foundation
     */
    private initializeDatabase;
    /**
     * Initialize cache configurations for different data types
     */
    private initializeCacheConfigs;
    /**
     * Get cached data with intelligent cache logic
     */
    get(type: string, key: string): Promise<any | null>;
    /**
     * Store data in cache with intelligent expiration
     */
    set(type: string, key: string, data: any): Promise<void>;
    /**
     * Check if cache entry is still valid
     */
    private isCacheValid;
    /**
     * Adapt TTL based on data characteristics and access patterns
     */
    private adaptTTL;
    /**
     * Detect if data shows signs of high volatility
     */
    private detectHighVolatility;
    /**
     * Detect if data shows signs of low volatility (stable)
     */
    private detectLowVolatility;
    /**
     * Get cache configuration by tier
     */
    private getCacheConfigByTier;
    /**
     * Get default cache configuration
     */
    private getDefaultConfig;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        hitRate: number;
        hitCount: number;
        missCount: number;
        totalRequests: number;
    };
    /**
     * Clear cache for specific type or all cache
     */
    clearCache(type?: string): Promise<void>;
    /**
     * Warm cache with frequently accessed data
     */
    warmCache(): Promise<void>;
}
//# sourceMappingURL=intelligent-cache.d.ts.map