/**
 * Base Backend Abstract Class for Memory Storage.
 *
 * Abstract base class defining the interface for all memory storage backends.
 * Supports multiple backend types: sqlite, jsonb, file, memory.
 */
/**
 * @file Memory management: base-backend.
 */
import { EventEmitter } from '@claude-zen/foundation';
import type { MemoryConfig } from '../types';
import type { JSONValue } from '../core/memory-system';
export interface BackendCapabilities {
    persistent: boolean;
    searchable: boolean;
    transactional: boolean;
    vectorized: boolean;
    distributed: boolean;
    concurrent: boolean;
    compression: boolean;
    encryption: boolean;
}
export interface MemoryEntry {
    key: string;
    value: unknown;
    metadata: Record<string, unknown>;
    timestamp: number;
    size: number;
    type: string;
}
export interface MemoryQueryOptions {
    pattern?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
}
export interface MemorySearchResult {
    key: string;
    value: unknown;
    score?: number;
    metadata?: Record<string, unknown>;
}
export interface MemoryStats {
    totalEntries: number;
    totalSize: number;
    cacheHits: number;
    cacheMisses: number;
    lastAccessed: number;
    created: number;
    modified: number;
}
export declare abstract class BaseMemoryBackend extends EventEmitter {
    protected memoryConfig: MemoryConfig;
    protected isInitialized: boolean;
    protected stats: MemoryStats;
    constructor(config: MemoryConfig);
    abstract initialize(): Promise<void>;
    abstract store(key: string, value: unknown): Promise<void>;
    abstract retrieve<T = unknown>(key: string): Promise<T | null>;
    abstract delete(key: string): Promise<boolean>;
    abstract list(pattern?: string): Promise<string[]>;
    abstract clear(): Promise<void>;
    abstract close(): Promise<void>;
    abstract getCapabilities(): BackendCapabilities;
    abstract get<T = unknown>(key: string): Promise<T | null>;
    abstract set(key: string, value: unknown): Promise<void>;
    abstract listNamespaces(): Promise<string[]>;
    protected ensureInitialized(): Promise<void>;
    getStats(): Promise<MemoryStats>;
    getStatsSync(): MemoryStats;
    getConfig(): MemoryConfig;
    isReady(): boolean;
    protected updateStats(operation: 'read' | 'write' | 'delete' | 'size_check' | 'cleanup', size?: number): void;
    protected createMemoryEntry(key: string, value: unknown, metadata?: Record<string, unknown>): MemoryEntry;
    protected calculateSize(value: unknown): number;
    protected detectType(value: unknown): string;
    protected validateKey(key: string): void;
    protected matchesPattern(key: string, pattern?: string): boolean;
    protected emitError(error: Error, operation: string): void;
    protected emitOperation(operation: string, key: string, success: boolean): void;
    healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        capabilities: BackendCapabilities;
        stats: MemoryStats;
    }>;
    batchStore(entries: Array<{
        key: string;
        value: unknown;
        metadata?: Record<string, unknown>;
    }>): Promise<void>;
    batchRetrieve<T = unknown>(keys: string[]): Promise<Record<string, T | null>>;
    batchDelete(keys: string[]): Promise<Record<string, boolean>>;
    protected serialize(value: unknown): string;
    protected deserialize<T = unknown>(value: string): T;
    /**
     * Concrete implementation of search for BackendInterface compatibility.
     *
     * @param pattern - Search pattern to match keys
     * @param namespace - Optional namespace (unused in base implementation)
     */
    search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
    /** Get size for MemoryBackend interface compatibility */
    size(): Promise<number>;
    /** Get health status for MemoryBackend interface compatibility */
    health(): Promise<boolean>;
    protected cleanup(): Promise<void>;
}
export default BaseMemoryBackend;
//# sourceMappingURL=base-backend.d.ts.map