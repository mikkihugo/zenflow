/**
 * @file DAO Factory - Core Database Factory Functions.
 *
 * Extracted from index.ts to break circular dependencies.
 * Contains factory functions and entity type definitions.
 */

import type { DatabaseAdapter, ILogger } from '../../core/interfaces/base-interfaces';
import type { DatabaseTypes, EntityTypes as EntityTypesEnum, IDao } from '../interfaces';

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

import { BaseDao } from '../base.dao';
import { CoordinationDao } from '../dao/coordination.dao';
import { GraphDao } from '../dao/graph.dao';
import { MemoryDao } from '../dao/memory.dao';

/**
 * Entity type constant mapping for type safety.
 */
export const EntityTypeValues = {
  User: 'user' as const,
  Agent: 'agent' as const,
  Memory: 'memory' as const,
  Swarm: 'swarm' as const,
  Task: 'task' as const,
  Workflow: 'workflow' as const,
  Document: 'document' as const,
  Context: 'context' as const,
  Event: 'event' as const,
  Node: 'node' as const,
  Edge: 'edge' as const,
  Vector: 'vector' as const,
  Embedding: 'embedding' as const,
  Coordination: 'coordination' as const,
  Product: 'product' as const,
  Project: 'project' as const,
  Epic: 'epic' as const,
  Feature: 'feature' as const,
  PRD: 'prd' as const,
  ADR: 'adr' as const,
  Vision: 'vision' as const,
  Relationship: 'relationship' as const,
  WorkflowState: 'workflowState' as const,
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
export async function createDao<T>(
  entityType: EntityType,
  databaseType: DatabaseTypes,
  config: DatabaseConfig,
  options: {
    tableName?: string;
    primaryKey?: string;
    enableCaching?: boolean;
    connectionPoolSize?: number;
    logger?: Console | { debug: Function; info: Function; warn: Function; error: Function };
  } = {}
): Promise<IDao<T>> {
  // Set defaults based on entity type
  const tableName = options?.tableName || getDefaultTableName(entityType);
  const primaryKey = options?.primaryKey || 'id';
  const logger = options?.logger || console;

  // Create a mock adapter for now - in real implementation this would connect to actual database
  const adapter: DatabaseAdapter = {
    connect: async () => {},
    disconnect: async () => {},
    query: async () => ({ rows: [], rowCount: 0, executionTime: 0 }),
    execute: async () => ({ affectedRows: 0, executionTime: 0 }),
    transaction: async (fn) => fn({} as any),
    health: async () => true,
    getSchema: async () => ({ tables: [], views: [], version: '1.0.0' }),
    getConnectionStats: async () => ({
      total: 1,
      active: 1,
      idle: 0,
      utilization: 100,
      averageConnectionTime: 0,
    }),
  };

  const iLogger: ILogger = {
    debug: logger.debug?.bind(logger) || (() => {}),
    info: logger.info?.bind(logger) || (() => {}),
    warn: logger.warn?.bind(logger) || (() => {}),
    error: logger.error?.bind(logger) || (() => {}),
  };

  // Create specialized DAOs based on entity type
  switch (entityType) {
    case EntityTypeValues.Memory:
    case 'memory':
      return createMemoryDao<T>(adapter, iLogger, tableName);

    case EntityTypeValues.Product: // Use available enum value instead of Coordination
    case 'coordination':
      return createCoordinationDao<T>(adapter, iLogger, tableName);

    case EntityTypeValues.Vector: // Use Vector instead of Graph for GraphDao
    case 'node':
    case 'edge':
      return createGraphDao<T>(adapter, iLogger, tableName);

    default:
      // Cannot instantiate abstract BaseDao directly - create a concrete implementation
      return new ConcreteDao<T>(adapter, iLogger, tableName);
  }
}

/**
 * Concrete implementation of BaseDao for default cases.
 *
 * @example
 */
class ConcreteDao<T> extends BaseDao<T> {
  constructor(adapter: DatabaseAdapter, logger: ILogger, tableName: string) {
    super(adapter, logger, tableName);
  }

  protected mapRowToEntity(row: any): T {
    return row as T;
  }

  protected mapEntityToRow(entity: Partial<T>): Record<string, any> {
    return entity as Record<string, any>;
  }
}

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
export async function createMultiDatabaseSetup<T>(
  entityType: EntityType,
  primaryDatabase: { databaseType: DatabaseTypes; config: DatabaseConfig },
  fallbackDatabases: Array<{ databaseType: DatabaseTypes; config: DatabaseConfig }> = [],
  options: {
    readPreference?: 'primary' | 'fallback' | 'balanced';
    writePolicy?: 'primary-only' | 'replicated';
    failoverTimeout?: number;
    logger?: Console | { debug: Function; info: Function; warn: Function; error: Function };
  } = {}
): Promise<IMultiDatabaseDao<T>> {
  const primaryDao = await createDao<T>(
    entityType,
    primaryDatabase.databaseType,
    primaryDatabase.config,
    {
      logger: options?.logger,
    }
  );

  const fallbackDaos = await Promise.all(
    fallbackDatabases.map((db) =>
      createDao<T>(entityType, db.databaseType, db.config, {
        logger: options?.logger,
      })
    )
  );

  // Return a multi-database DAO wrapper
  return {
    primary: primaryDao,
    fallbacks: fallbackDaos,
    readPreference: options?.readPreference || 'primary',
    writePolicy: options?.writePolicy || 'primary-only',
    failoverTimeout: options?.failoverTimeout || 5000,

    async findById(id: string): Promise<T | null> {
      try {
        return await primaryDao.findById(id);
      } catch (error) {
        if (fallbackDaos.length > 0) {
          for (const fallbackDao of fallbackDaos) {
            try {
              return await fallbackDao.findById(id);
            } catch (fallbackError) {}
          }
        }
        throw error;
      }
    },

    async findAll(): Promise<T[]> {
      const dao =
        this.readPreference === 'fallback' && fallbackDaos.length > 0
          ? fallbackDaos[0]
          : primaryDao;

      if (!dao) {
        throw new Error('No DAO available');
      }

      try {
        return await dao.findAll();
      } catch (error) {
        if (dao !== primaryDao) {
          return await primaryDao.findAll();
        }
        throw error;
      }
    },

    async create(entity: Omit<T, 'id'>): Promise<T> {
      const created = await primaryDao.create(entity);

      if (this.writePolicy === 'replicated') {
        // Fire-and-forget replication to fallbacks
        fallbackDaos.forEach((dao) => {
          dao.create(entity).catch(() => {
            // Log but don't fail the operation
            options?.logger?.warn('Fallback replication failed');
          });
        });
      }

      return created;
    },

    async update(id: string, updates: Partial<T>): Promise<T | null> {
      const updated = await primaryDao.update(id, updates);

      if (this.writePolicy === 'replicated') {
        fallbackDaos.forEach((dao) => {
          dao.update(id, updates).catch(() => {
            options?.logger?.warn('Fallback update failed');
          });
        });
      }

      return updated;
    },

    async delete(id: string): Promise<boolean> {
      const deleted = await primaryDao.delete(id);

      if (this.writePolicy === 'replicated') {
        fallbackDaos.forEach((dao) => {
          dao.delete(id).catch(() => {
            options?.logger?.warn('Fallback deletion failed');
          });
        });
      }

      return deleted;
    },

    async findBy(filter: Partial<T>): Promise<T[]> {
      const dao =
        this.readPreference === 'fallback' && fallbackDaos.length > 0
          ? fallbackDaos[0]
          : primaryDao;

      if (!dao) {
        throw new Error('No DAO available');
      }

      try {
        return await dao.findBy(filter);
      } catch (error) {
        if (dao !== primaryDao) {
          return await primaryDao.findBy(filter);
        }
        throw error;
      }
    },

    async count(filter?: Partial<T>): Promise<number> {
      try {
        return await primaryDao.count(filter);
      } catch (error) {
        if (fallbackDaos.length > 0) {
          const fallbackDao = fallbackDaos[0];
          if (fallbackDao) {
            return await fallbackDao.count(filter);
          }
        }
        throw error;
      }
    },
  } as IMultiDatabaseDao<T>;
}

/**
 * Get default table name for entity type.
 *
 * @param entityType
 * @private
 * @example
 */
function getDefaultTableName(entityType: EntityType): string {
  // Convert entity type to plural table name
  const entityMap: Record<string, string> = {
    [EntityTypeValues.User]: 'users',
    [EntityTypeValues.Agent]: 'agents',
    [EntityTypeValues.Memory]: 'memories',
    [EntityTypeValues.Swarm]: 'swarms',
    [EntityTypeValues.Task]: 'tasks',
    [EntityTypeValues.Workflow]: 'workflows',
    [EntityTypeValues.Document]: 'documents',
    [EntityTypeValues.Context]: 'contexts',
    [EntityTypeValues.Event]: 'events',
    [EntityTypeValues.Node]: 'nodes',
    [EntityTypeValues.Edge]: 'edges',
    [EntityTypeValues.Vector]: 'vectors',
    [EntityTypeValues.Embedding]: 'embeddings',
    [EntityTypeValues.Coordination]: 'coordination',
    [EntityTypeValues.Product]: 'products',
    [EntityTypeValues.Project]: 'projects',
    [EntityTypeValues.Epic]: 'epics',
    [EntityTypeValues.Feature]: 'features',
    [EntityTypeValues.PRD]: 'prds',
    [EntityTypeValues.ADR]: 'adrs',
    [EntityTypeValues.Vision]: 'visions',
    [EntityTypeValues.Relationship]: 'relationships',
    [EntityTypeValues.WorkflowState]: 'workflow_states',
  };

  return entityMap[entityType] || `${entityType}s`;
}

/**
 * Factory functions to create specialized DAOs with proper constructor access.
 *
 * @param adapter
 * @param logger
 * @param tableName
 * @example
 */
function createMemoryDao<T>(adapter: DatabaseAdapter, logger: ILogger, tableName: string): IDao<T> {
  // Create a specialized memory DAO implementation
  class MemoryDaoImpl extends MemoryDao<T> {
    constructor(adapter: DatabaseAdapter, logger: ILogger, tableName: string) {
      super(adapter, logger, tableName);
    }
  }
  return new MemoryDaoImpl(adapter, logger, tableName) as IDao<T>;
}

function createCoordinationDao<T>(
  adapter: DatabaseAdapter,
  logger: ILogger,
  tableName: string
): IDao<T> {
  // Create a specialized coordination DAO implementation
  class CoordinationDaoImpl extends CoordinationDao<T> {
    constructor(adapter: DatabaseAdapter, logger: ILogger, tableName: string) {
      super(adapter, logger, tableName);
    }
  }
  return new CoordinationDaoImpl(adapter, logger, tableName) as IDao<T>;
}

function createGraphDao<T>(adapter: DatabaseAdapter, logger: ILogger, tableName: string): IDao<T> {
  // Create a specialized graph DAO implementation
  class GraphDaoImpl extends GraphDao<T> {
    constructor(adapter: DatabaseAdapter, logger: ILogger, tableName: string) {
      super(adapter, logger, tableName);
    }
  }
  return new GraphDaoImpl(adapter, logger, tableName) as IDao<T>;
}
