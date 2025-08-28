/**
 * @fileoverview Database Facade - Foundation-based Database Access
 *
 * Provides access to database functionality through foundation package,
 * maintaining proper tier separation while offering convenient access.
 * Uses lazy loading and graceful fallbacks when database package unavailable.
 */
import { CapabilityLevel } from '../facades/system.status.manager.js';
import { type Result } from '../../error-handling/index.js';
export interface DatabaseConnection {
    query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
    execute(sql: string, params?: unknown[]): Promise<{
        affectedRows: number;
        insertId?: number;
    }>;
    close(): Promise<void>;
}
export interface DatabaseAdapter {
    connect(config: DatabaseConfig): Promise<Result<DatabaseConnection, Error>>;
    getHealth(): Promise<{
        healthy: boolean;
        message?: string;
    }>;
    disconnect(): Promise<void>;
}
export interface DatabaseConfig {
    type: 'sqlite' | ' postgres' | ' mysql';
    path?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
}
export interface KeyValueStore {
    get<T = unknown>(key: string): Promise<T | null>;
    set<T = unknown>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    keys(pattern?: string): Promise<string[]>;
}
export interface VectorStore {
    insert(id: string, vector: number[], metadata?: Record<string, unknown>): Promise<void>;
    search(query: number[], limit?: number): Promise<Array<{
        id: string;
        score: number;
        metadata?: Record<string, unknown>;
    }>>;
    delete(id: string): Promise<boolean>;
    clear(): Promise<void>;
}
export interface GraphStore {
    addNode(id: string, properties?: Record<string, unknown>): Promise<void>;
    addEdge(from: string, to: string, type: string, properties?: Record<string, unknown>): Promise<void>;
    queryNodes(cypher: string): Promise<unknown[]>;
    queryPaths(from: string, to: string, maxDepth?: number): Promise<unknown[]>;
}
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
    createKeyValueStore(): Promise<Result<KeyValueStore, Error>>;
    /**
     * Create fallback key-value store
     */
    private createFallbackKeyValueStore;
    /**
     * Create vector store
     */
    createVectorStore(): Promise<Result<VectorStore, Error>>;
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
    createGraphStore(): Promise<Result<GraphStore, Error>>;
    /**
     * Create fallback graph store
     */
    private createFallbackGraphStore;
}
export declare const databaseFacade: DatabaseFacade;
export declare function createDatabaseAdapter(type: DatabaseConfig['type']): Promise<Result<DatabaseAdapter, Error>>;
export declare function createKeyValueStore(): Promise<Result<KeyValueStore, Error>>;
export declare function createVectorStore(): Promise<Result<VectorStore, Error>>;
export declare function createGraphStore(): Promise<Result<GraphStore, Error>>;
export declare function getDatabaseCapability(): CapabilityLevel;
//# sourceMappingURL=database-facade.d.ts.map