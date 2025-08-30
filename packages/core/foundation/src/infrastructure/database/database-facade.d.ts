/**
 * @fileoverview Database Facade - Foundation-based Database Access
 *
 * Provides access to database functionality through foundation package,
 * maintaining proper tier separation while offering convenient access.
 * Uses lazy loading and graceful fallbacks when database package unavailable.
 */
import { CapabilityLevel } from '../facades/system.status.manager.js';
import { type Result } from '../../error-handling/index.js';
import type { DatabaseAdapter, DatabaseConfig, KeyValueStorage, VectorStorage, GraphStorage } from './types.js';
export type { DatabaseConnection, DatabaseAdapter, DatabaseConfig, KeyValueStorage as KeyValueStore, VectorStorage as VectorStore, GraphStorage as GraphStore, HealthStatus, QueryResult, QueryParams, } from './types.js';
/**
 * Database Facade providing unified access to database functionality
 */
export declare class DatabaseFacade {
    private static instance;
    private databasePackage;
    private capability;
    private constructor();
    static getInstance(): DatabaseFacade;
    private initializeFacade;
    private loadDatabasePackage;
    /**
     * Get database capability level
     */
    getCapability(): CapabilityLevel;
    /**
     * Create a database adapter
     */
    createAdapter(type: DatabaseConfig['type']): Promise<Result<DatabaseAdapter, Error>>;
    /**
     * Create fallback adapter when database package unavailable
     */
    private createFallbackAdapter;
    /**
     * Create key-value store
     */
    createKeyValueStore(): Promise<Result<KeyValueStorage, Error>>;
    /**
     * Create fallback key-value store
     */
    private createFallbackKeyValueStore;
    /**
     * Create vector store
     */
    createVectorStore(): Promise<Result<VectorStorage, Error>>;
    /**
     * Create fallback vector store
     */
    private createFallbackVectorStore;
    /**
     * Simple cosine similarity calculation for fallback
     */
    private cosineSimilarity;
    /**
     * Create graph store
     */
    createGraphStore(): Promise<Result<GraphStorage, Error>>;
    /**
     * Create fallback graph store
     */
    private createFallbackGraphStore;
}
export declare const databaseFacade: DatabaseFacade;
export declare function createDatabaseAdapter(type: DatabaseConfig['type']): Promise<Result<DatabaseAdapter, Error>>;
export declare function createKeyValueStore(): Promise<Result<KeyValueStorage, Error>>;
export declare function createVectorStore(): Promise<Result<VectorStorage, Error>>;
export declare function createGraphStore(): Promise<Result<GraphStorage, Error>>;
export declare function getDatabaseCapability(): CapabilityLevel;
//# sourceMappingURL=database-facade.d.ts.map