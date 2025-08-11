/**
 * @file Session-based memory storage with pluggable backends.
 */
import { EventEmitter } from 'node:events';
import type { IMemoryStore, MemoryStats, StoreOptions } from '../core/interfaces/base-interfaces.ts';
interface BackendConfig {
    type: 'sqlite' | 'json' | 'lancedb' | 'memory';
    path?: string;
    maxSize?: number;
    ttl?: number;
}
interface SessionMemoryStoreOptions {
    backendConfig: BackendConfig;
    enableCache?: boolean;
    cacheSize?: number;
    cacheTTL?: number;
    enableVectorStorage?: boolean;
    vectorDimensions?: number;
}
export interface SessionState {
    sessionId: string;
    data: Record<string, unknown>;
    metadata: {
        created: number;
        updated: number;
        accessed: number;
        size: number;
        tags?: string[];
        priority?: 'low' | 'medium' | 'high';
        ttl?: number;
    };
    vectors?: Map<string, number[]>;
}
export interface CacheEntry {
    key: string;
    data: unknown;
    timestamp: number;
}
export declare class SessionMemoryStore extends EventEmitter implements IMemoryStore {
    private backend;
    private initialized;
    private sessions;
    private options;
    private cache;
    private cacheKeys;
    constructor(options: SessionMemoryStoreOptions);
    initialize(): Promise<void>;
    store(sessionId: string, key: string, data: unknown, options?: StoreOptions): Promise<void>;
    store(key: string, data: unknown, options?: StoreOptions): Promise<void>;
    retrieve<T = unknown>(sessionId: string, key: string): Promise<T | null>;
    retrieve<T = unknown>(key: string): Promise<T | null>;
    retrieveSession(sessionId: string): Promise<SessionState | null>;
    delete(sessionId: string, key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    getStats(): Promise<MemoryStats>;
    shutdown(): Promise<void>;
    private loadFromBackend;
    private saveToBackend;
    private updateCache;
    private getCachedData;
    private ensureInitialized;
}
export declare class MemoryManager {
    private store;
    constructor(options: SessionMemoryStoreOptions);
    initialize(): Promise<void>;
    storeData(key: string, data: unknown): Promise<void>;
    retrieve<T = unknown>(key: string): Promise<T | null>;
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=memory.d.ts.map