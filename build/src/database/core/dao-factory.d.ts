/**
 * @file DAO Factory - Core Database Factory Functions.
 *
 * Extracted from index.ts to break circular dependencies.
 * Contains factory functions and entity type definitions.
 */
import type { DatabaseTypes, IDao } from '../interfaces.ts';
/**
 * Multi-database DAO interface for cross-database operations.
 *
 * @example
 */
export interface IMultiDatabaseDao<T> {
    primary: IDao<T>;
    fallbacks: IDao<T>[];
    readPreference: 'primary' | 'fallback' | 'balanced';
    writePolicy: 'primary-only' | 'replicated';
    failoverTimeout: number;
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    create(entity: Omit<T, 'id'>): Promise<T>;
    update(id: string, updates: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    findBy(filter: Partial<T>): Promise<T[]>;
    count(filter?: Partial<T>): Promise<number>;
}
/**
 * Entity type constant mapping for type safety.
 */
export declare const EntityTypeValues: {
    User: "user";
    Agent: "agent";
    Memory: "memory";
    Swarm: "swarm";
    Task: "task";
    Workflow: "workflow";
    Document: "document";
    Context: "context";
    Event: "event";
    Node: "node";
    Edge: "edge";
    Vector: "vector";
    Embedding: "embedding";
    Coordination: "coordination";
    Product: "product";
    Project: "project";
    Epic: "epic";
    Feature: "feature";
    PRD: "prd";
    ADR: "adr";
    Vision: "vision";
    Relationship: "relationship";
    WorkflowState: "workflowState";
};
export type EntityTypeKey = keyof typeof EntityTypeValues;
export type EntityTypeValue = (typeof EntityTypeValues)[EntityTypeKey];
export type EntityType = EntityTypeValue;
/**
 * Database configuration interface.
 *
 * @example
 */
export interface DatabaseConfig {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    connectionString?: string;
    [key: string]: any;
}
/**
 * Create a Data Access Object (DAO) for a specific entity type and database.
 *
 * This is a factory function that creates appropriate DAO instances based on
 * the entity type and database configuration provided.
 *
 * @template T - The entity type interface.
 * @param entityType - Type of entity (from EntityTypes enum).
 * @param databaseType - Type of database to connect to.
 * @param config - Database configuration object.
 * @param options.tableName
 * @param options.primaryKey
 * @param options.enableCaching
 * @param options.connectionPoolSize
 * @param options.logger
 * @param options - Optional settings for DAO creation.
 * @returns Promise resolving to configured DAO instance.
 * @example Basic DAO Creation
 * ```typescript
 * const userDao = await createDao<User>(
 *   EntityTypes.User,
 *   DatabaseTypes.PostgreSQL,
 *   {
 *     host: 'localhost',
 *     port: 5432,
 *     database: 'myapp',
 *     username: 'user',
 *     password: 'pass'
 *   }
 * );
 * ```
 */
export declare function createDao<T>(entityType: EntityType, databaseType: DatabaseTypes, config: DatabaseConfig, options?: {
    tableName?: string;
    primaryKey?: string;
    enableCaching?: boolean;
    connectionPoolSize?: number;
    logger?: Console | {
        debug: Function;
        info: Function;
        warn: Function;
        error: Function;
    };
}): Promise<IDao<T>>;
/**
 * Create a multi-database setup with primary database and fallbacks.
 *
 * This function creates a DAO that can work across multiple databases,
 * with a primary database for writes and optional fallback databases
 * for reads and caching.
 *
 * @template T - The entity type interface.
 * @param entityType - Type of entity (from EntityTypes enum).
 * @param primaryDatabase - Primary database configuration.
 * @param primaryDatabase.databaseType
 * @param fallbackDatabases - Array of fallback database configurations.
 * @param primaryDatabase.config
 * @param options.readPreference
 * @param options.writePolicy
 * @param options.failoverTimeout
 * @param options.logger
 * @param options - Optional settings for multi-database setup.
 * @returns Promise resolving to multi-database DAO instance.
 * @example Multi-Database Setup
 * ```typescript
 * const multiDao = await createMultiDatabaseSetup<User>(
 *   EntityTypes.User,
 *   { databaseType: 'postgresql', config: pgConfig },
 *   [{ databaseType: 'memory', config: cacheConfig }]
 * );
 * ```
 */
export declare function createMultiDatabaseSetup<T>(entityType: EntityType, primaryDatabase: {
    databaseType: DatabaseTypes;
    config: DatabaseConfig;
}, fallbackDatabases?: Array<{
    databaseType: DatabaseTypes;
    config: DatabaseConfig;
}>, options?: {
    readPreference?: 'primary' | 'fallback' | 'balanced';
    writePolicy?: 'primary-only' | 'replicated';
    failoverTimeout?: number;
    logger?: Console | {
        debug: Function;
        info: Function;
        warn: Function;
        error: Function;
    };
}): Promise<IMultiDatabaseDao<T>>;
//# sourceMappingURL=dao-factory.d.ts.map