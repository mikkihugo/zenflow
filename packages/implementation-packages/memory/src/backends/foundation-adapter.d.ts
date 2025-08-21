/**
 * Foundation Storage Adapter for Memory Backend
 *
 * Adapter that bridges Memory package with Foundation's storage system.
 * Leverages Foundation's database abstraction for SQLite, LanceDB, and Kuzu.
 */
import type { RetryOptions, CircuitBreakerOptions } from '@claude-zen/foundation';
import { BaseMemoryBackend, type BackendCapabilities } from './base-backend';
import type { MemoryConfig } from '../providers/memory-providers';
import type { JSONValue, MemoryStats } from '../core/memory-system';
interface FoundationMemoryConfig extends MemoryConfig {
    storageType: 'kv' | 'database' | 'hybrid';
    databaseType?: 'sqlite' | 'lancedb' | 'kuzu';
    retry?: RetryOptions;
    circuitBreaker?: CircuitBreakerOptions;
}
export declare class FoundationMemoryBackend extends BaseMemoryBackend {
    private logger;
    private kvStore?;
    private dbAccess?;
    private storage;
    private initialized;
    private retryWithOptions;
    private circuitBreaker;
    constructor(config: FoundationMemoryConfig);
    initialize(): Promise<void>;
    store(key: string, value: JSONValue, namespace?: string): Promise<void>;
    set(key: string, value: JSONValue): Promise<void>;
    retrieve<T = JSONValue>(key: string, namespace?: string): Promise<T | null>;
    get<T = JSONValue>(key: string): Promise<T | null>;
    delete(key: string, namespace?: string): Promise<boolean>;
    list(pattern?: string, namespace?: string): Promise<string[]>;
    search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
    clear(namespace?: string): Promise<void>;
    close(): Promise<void>;
    getCapabilities(): BackendCapabilities;
    listNamespaces(): Promise<string[]>;
    private initializeSchema;
    protected ensureInitialized(): Promise<void>;
    getSize(): Promise<number>;
    healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        capabilities: BackendCapabilities;
        stats: MemoryStats;
    }>;
}
export {};
//# sourceMappingURL=foundation-adapter.d.ts.map