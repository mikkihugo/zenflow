/**
 * Memory Domain Dependency Injection Providers.
 * Implements comprehensive DI patterns for memory management.
 *
 * @file Memory-providers.ts.
 * @description Enhanced memory providers with DI integration for Issue #63.
 */
import type { DALFactory } from '../../database/factory';
import { type Config, type Logger } from '../../di/tokens/core-tokens';
/**
 * Interface for memory backend implementations.
 * Updated to be compatible with BaseMemoryBackend.
 *
 * @example
 */
export interface MemoryBackend {
    /** Store a value with the given key */
    store(key: string, value: unknown): Promise<void>;
    /** Retrieve a value by key */
    retrieve<T = unknown>(key: string): Promise<T | null>;
    /** Delete a value by key - returns true if key existed and was deleted, false otherwise */
    delete(key: string): Promise<boolean>;
    /** Clear all stored data */
    clear(): Promise<void>;
    /** Get the number of stored items */
    size(): Promise<number>;
    /** Get health status of the backend */
    health(): Promise<boolean>;
}
/**
 * Configuration interface for memory providers.
 *
 * @example
 */
export interface MemoryConfig {
    /** Type of memory backend to use */
    type: 'sqlite' | 'lancedb' | 'json' | 'memory';
    /** Optional path for file-based backends */
    path?: string;
    /** Maximum size limit */
    maxSize?: number;
    /** Time-to-live for entries in milliseconds */
    ttl?: number;
    /** Enable compression for stored data */
    compression?: boolean;
}
/**
 * Factory for creating memory backend providers.
 * Uses dependency injection for logger, configuration, and DAL Factory.
 *
 * @example
 */
export declare class MemoryProviderFactory {
    private logger;
    private config;
    private dalFactory;
    constructor(logger: Logger, config: Config, dalFactory: DALFactory);
    /**
     * Create a memory provider based on configuration.
     *
     * @param config Memory configuration.
     * @returns Appropriate memory backend implementation.
     */
    createProvider(config: MemoryConfig): MemoryBackend;
}
export declare class SqliteMemoryBackend implements MemoryBackend {
    private config;
    private logger;
    private dalFactory;
    private repository;
    private initialized;
    constructor(config: MemoryConfig, logger: Logger, dalFactory: DALFactory);
    store(key: string, value: unknown): Promise<void>;
    retrieve<T = unknown>(key: string): Promise<T | null>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    health(): Promise<boolean>;
    private ensureInitialized;
}
export declare class LanceDBMemoryBackend implements MemoryBackend {
    private config;
    private logger;
    private dalFactory;
    private repository;
    private initialized;
    constructor(config: MemoryConfig, logger: Logger, dalFactory: DALFactory);
    store(key: string, value: unknown): Promise<void>;
    retrieve<T = unknown>(key: string): Promise<T | null>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    health(): Promise<boolean>;
    private ensureInitialized;
    private generateVectorFromValue;
}
/**
 * JSON file-based memory backend implementation.
 *
 * @example
 */
export declare class JsonMemoryBackend implements MemoryBackend {
    private config;
    private logger;
    private data;
    private initialized;
    constructor(config: MemoryConfig, logger: Logger);
    store(key: string, value: unknown): Promise<void>;
    retrieve<T = unknown>(key: string): Promise<T | null>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    health(): Promise<boolean>;
    private ensureInitialized;
    private loadFromFile;
    private persistToFile;
}
/**
 * In-memory backend implementation (fastest, no persistence).
 *
 * @example
 */
export declare class InMemoryBackend implements MemoryBackend {
    private config;
    private logger;
    private data;
    private readonly maxSize;
    constructor(config: MemoryConfig, logger: Logger);
    store(key: string, value: unknown): Promise<void>;
    retrieve<T = unknown>(key: string): Promise<T | null>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
    health(): Promise<boolean>;
}
//# sourceMappingURL=memory-providers.d.ts.map