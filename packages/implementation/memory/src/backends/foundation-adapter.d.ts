/**
 * Foundation Storage Adapter for Memory Backend - Simplified Implementation
 */
import type { JSONValue } from '../core/memory-system';
import type { MemoryConfig } from '../providers/memory-providers';
import { BaseMemoryBackend, type BackendCapabilities } from './base-backend';
interface FoundationMemoryConfig extends MemoryConfig {
    storageType: 'kv|database|hybrid';
    databaseType?: 'sqlite|lancedb|kuzu';
}
export declare class FoundationMemoryBackend extends BaseMemoryBackend {
    private logger;
    private kvStore?;
    private initialized;
    protected memoryConfig: FoundationMemoryConfig;
    constructor(config: FoundationMemoryConfig);
    initialize(): Promise<void>;
    store(key: string, value: JSONValue, namespace?: string): Promise<void>;
    set(key: string, value: JSONValue): Promise<void>;
    retrieve<T = JSONValue>(key: string, namespace?: string): Promise<T | null>;
    get<T = JSONValue>(key: string): Promise<T | null>;
    delete(key: string, namespace?: string): Promise<boolean>;
    list(pattern?: string, namespace?: string): Promise<string[]>;
    clear(namespace?: string): Promise<void>;
    close(): Promise<void>;
    getCapabilities(): BackendCapabilities;
    listNamespaces(): Promise<string[]>;
    private ensureInitialized;
    private calculateSize;
    private validateKey;
    private updateStats;
    private matchesPattern;
}
export {};
//# sourceMappingURL=foundation-adapter.d.ts.map