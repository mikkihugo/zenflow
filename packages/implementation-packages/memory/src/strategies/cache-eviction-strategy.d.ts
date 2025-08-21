/**
 * Cache Eviction Strategy - Advanced Cache Management
 *
 * Provides sophisticated cache eviction algorithms including LRU, LFU, adaptive
 * strategies with intelligent priority management and performance optimization.
 */
import { EventEmitter } from 'eventemitter3';
import type { CacheEvictionConfig, CacheEntry, EvictionReason } from './types';
export declare class CacheEvictionStrategy extends EventEmitter {
    private logger;
    private config;
    private cache;
    private accessOrder;
    private frequencyMap;
    private cleanupTimer?;
    private telemetry;
    private metrics;
    private accessCounter;
    constructor(config: CacheEvictionConfig);
    initialize(): Promise<void>;
    set(key: string, value: unknown, options?: {
        size?: number;
        priority?: number;
        ttl?: number;
        metadata?: Record<string, unknown>;
    }): boolean;
    get(key: string): unknown | undefined;
    delete(key: string): boolean;
    has(key: string): boolean;
    clear(): void;
    private canAccommodate;
    private performEviction;
    private selectEvictionCandidates;
    private selectLRUCandidates;
    private selectLFUCandidates;
    private selectFIFOCandidates;
    private selectTTLCandidates;
    private selectRandomCandidates;
    private selectAdaptiveCandidates;
    private calculateAdaptiveScore;
    private prioritizeEvictionCandidates;
    private findExpiredEntries;
    private isExpired;
    private evictEntry;
    private updateAccessTracking;
    private getCurrentMemoryUsage;
    private estimateSize;
    private getEvictionReason;
    private startPeriodicCleanup;
    private performCleanup;
    getStats(): {
        size: number;
        maxSize: number;
        memoryUsage: number;
        maxMemory: number;
        algorithm: "lru" | "lfu" | "fifo" | "ttl" | "adaptive" | "random";
        metrics: {
            totalEvictions: number;
            evictionsByReason: Record<EvictionReason, number>;
            averageEvictionTime: number;
            memoryReclaimed: number;
        };
    };
    getKeys(): string[];
    getEntries(): CacheEntry[];
    forceEviction(count?: number): number;
    updateConfig(newConfig: Partial<CacheEvictionConfig>): void;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=cache-eviction-strategy.d.ts.map