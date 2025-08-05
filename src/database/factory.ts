/**
 * Unified Data Access Layer (DAL) - Factory Implementation
 * 
 * Central factory for creating repository and DAO instances based on database type,
 * entity requirements, and configuration. Supports dependency injection and
 * provides a single point of access for all data layer implementations.
 */

import type {
  IRepository,
  IDataAccessObject,
  IGraphRepository,
  IVectorRepository,
  IMemoryRepository,
  ICoordinationRepository,
} from './interfaces';

import type { DatabaseAdapter } from '../../core/interfaces/base-interfaces';
import type { ILogger, IConfig } from '../../core/interfaces/base-interfaces';
import { DatabaseProviderFactory, type DatabaseConfig } from '../providers/database-providers';
import { injectable, inject } from '../../di/decorators/injectable';
import { CORE_TOKENS, DATABASE_TOKENS } from '../../di/tokens/core-tokens';

/**
 * Configuration for repository creation
 */
export interface RepositoryConfig {
  /** Database type to use */
  databaseType: 'postgresql' | 'sqlite' | 'kuzu' | 'lancedb' | 'mysql' | 'memory' | 'coordination';
  
  /** Entity type name */
  entityType: string;
  
  /** Table/collection name (defaults to entityType) */
  tableName?: string;
  
  /** Entity schema definition */
  schema?: Record<string, any>;
  
  /** Repository-specific options */
  options?: Record<string, any>;
  
  /** Database configuration (if creating new adapter) */
  databaseConfig?: DatabaseConfig;
  
  /** Use existing adapter instance */
  existingAdapter?: DatabaseAdapter;
}

/**
 * Repository type mapping
 */
export type RepositoryType<T> = 
  | IRepository<T>
  | IGraphRepository<T>
  | IVectorRepository<T>
  | IMemoryRepository<T>
  | ICoordinationRepository<T>;

/**
 * Entity type registry for better type safety and schema management
 */
export interface EntityTypeRegistry {
  [entityType: string]: {
    schema: Record<string, any>;
    primaryKey: string;
    tableName?: string;
    databaseType?: string;
    indexes?: Array<{
      name: string;
      fields: string[];
      unique?: boolean;
    }>;
  };
}

/**
 * Main factory class for creating DAL instances
 */
@injectable
export class DALFactory {
  private repositoryCache = new Map<string, any>();
  private daoCache = new Map<string, any>();
  private adapterCache = new Map<string, DatabaseAdapter>();
  private entityRegistry: EntityTypeRegistry = {};

  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig,
    private databaseProviderFactory: DatabaseProviderFactory
  ) {
    this.initializeEntityRegistry();
  }

  /**
   * Create a repository instance
   */
  async createRepository<T>(config: RepositoryConfig): Promise<RepositoryType<T>> {
    const cacheKey = this.generateCacheKey(config);
    
    if (this.repositoryCache.has(cacheKey)) {
      this.logger.debug(`Returning cached repository: ${cacheKey}`);
      return this.repositoryCache.get(cacheKey);
    }

    this.logger.info(`Creating new repository: ${config.entityType} (${config.databaseType})`);

    try {
      // Get or create database adapter
      const adapter = await this.getOrCreateAdapter(config);
      
      // Create repository based on database type
      const repository = await this.createRepositoryInstance<T>(config, adapter);
      
      // Cache the repository
      this.repositoryCache.set(cacheKey, repository);
      
      return repository;
    } catch (error) {
      this.logger.error(`Failed to create repository: ${error}`);
      throw new Error(`Repository creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a Data Access Object instance
   */
  async createDAO<T>(config: RepositoryConfig): Promise<IDataAccessObject<T>> {
    const cacheKey = this.generateCacheKey(config, 'dao');
    
    if (this.daoCache.has(cacheKey)) {
      this.logger.debug(`Returning cached DAO: ${cacheKey}`);
      return this.daoCache.get(cacheKey);
    }

    this.logger.info(`Creating new DAO: ${config.entityType} (${config.databaseType})`);

    try {
      // Get repository first
      const repository = await this.createRepository<T>(config);
      
      // Get or create database adapter
      const adapter = await this.getOrCreateAdapter(config);
      
      // Create DAO instance
      const dao = await this.createDAOInstance<T>(config, repository, adapter);
      
      // Cache the DAO
      this.daoCache.set(cacheKey, dao);
      
      return dao;
    } catch (error) {
      this.logger.error(`Failed to create DAO: ${error}`);
      throw new Error(`DAO creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Register entity type with schema and configuration
   */
  registerEntityType(entityType: string, config: {
    schema: Record<string, any>;
    primaryKey: string;
    tableName?: string;
    databaseType?: string;
    indexes?: Array<{
      name: string;
      fields: string[];
      unique?: boolean;
    }>;
  }): void {
    this.logger.debug(`Registering entity type: ${entityType}`);
    this.entityRegistry[entityType] = config;
  }

  /**
   * Get registered entity configuration
   */
  getEntityConfig(entityType: string): EntityTypeRegistry[string] | undefined {
    return this.entityRegistry[entityType];
  }

  /**
   * Create repository for a specific use case with predefined configuration
   */
  async createKuzuGraphRepository<T>(entityType: string, tableName?: string): Promise<IGraphRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'kuzu',
      entityType,
      tableName: tableName || entityType,
      databaseConfig: this.getDefaultKuzuConfig()
    };

    return await this.createRepository<T>(config) as IGraphRepository<T>;
  }

  /**
   * Create repository for LanceDB vector operations
   */
  async createLanceDBVectorRepository<T>(entityType: string, vectorDimension: number = 384): Promise<IVectorRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'lancedb',
      entityType,
      tableName: entityType,
      databaseConfig: this.getDefaultLanceDBConfig(vectorDimension)
    };

    return await this.createRepository<T>(config) as IVectorRepository<T>;
  }

  /**
   * Create repository for coordination operations
   */
  async createCoordinationRepository<T>(entityType: string): Promise<ICoordinationRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'coordination',
      entityType,
      tableName: entityType,
      databaseConfig: {
        type: 'sqlite', // Use SQLite for coordination by default
        database: './data/coordination.db'
      }
    };

    return await this.createRepository<T>(config) as ICoordinationRepository<T>;
  }

  /**
   * Create repository for memory operations
   */
  async createMemoryRepository<T>(entityType: string): Promise<IMemoryRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'memory',
      entityType,
      tableName: entityType,
      options: {
        maxSize: 1000,
        ttlDefault: 3600 // 1 hour default TTL
      }
    };

    return await this.createRepository<T>(config) as IMemoryRepository<T>;
  }

  /**
   * Create multi-database DAO that can work across different data sources
   */
  async createMultiDatabaseDAO<T>(
    entityType: string,
    primaryConfig: RepositoryConfig,
    secondaryConfigs?: RepositoryConfig[]
  ): Promise<MultiDatabaseDAO<T>> {
    this.logger.info(`Creating multi-database DAO for: ${entityType}`);

    const primaryDAO = await this.createDAO<T>(primaryConfig);
    const secondaryDAOs: IDataAccessObject<T>[] = [];

    if (secondaryConfigs) {
      for (const config of secondaryConfigs) {
        const dao = await this.createDAO<T>(config);
        secondaryDAOs.push(dao);
      }
    }

    return new MultiDatabaseDAO<T>(primaryDAO, secondaryDAOs, this.logger);
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.logger.info('Clearing DAL factory caches');
    this.repositoryCache.clear();
    this.daoCache.clear();
    this.adapterCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    repositories: number;
    daos: number;
    adapters: number;
  } {
    return {
      repositories: this.repositoryCache.size,
      daos: this.daoCache.size,
      adapters: this.adapterCache.size
    };
  }

  /**
   * Private methods for internal operations
   */
  
  private async getOrCreateAdapter(config: RepositoryConfig): Promise<DatabaseAdapter> {
    if (config.existingAdapter) {
      return config.existingAdapter;
    }

    const adapterCacheKey = this.generateAdapterCacheKey(config);
    
    if (this.adapterCache.has(adapterCacheKey)) {
      return this.adapterCache.get(adapterCacheKey)!;
    }

    if (!config.databaseConfig) {
      throw new Error('Database configuration required when creating new adapter');
    }

    const adapter = this.databaseProviderFactory.createAdapter(config.databaseConfig);
    await adapter.connect();
    
    this.adapterCache.set(adapterCacheKey, adapter);
    return adapter;
  }

  private async createRepositoryInstance<T>(
    config: RepositoryConfig, 
    adapter: DatabaseAdapter
  ): Promise<RepositoryType<T>> {
    const { RelationalRepository } = await import('./repositories/relational-repository');
    const { GraphRepository } = await import('./repositories/graph-repository');
    const { VectorRepository } = await import('./repositories/vector-repository');
    const { MemoryRepository } = await import('./repositories/memory-repository');
    const { CoordinationRepository } = await import('./repositories/coordination-repository');

    const tableName = config.tableName || config.entityType;
    const entitySchema = config.schema || this.entityRegistry[config.entityType]?.schema;

    switch (config.databaseType) {
      case 'kuzu':
        return new GraphRepository<T>(adapter, this.logger, tableName, entitySchema);
        
      case 'lancedb':
        return new VectorRepository<T>(adapter, this.logger, tableName, entitySchema);
        
      case 'memory':
        return new MemoryRepository<T>(adapter, this.logger, tableName, entitySchema, config.options);
        
      case 'coordination':
        return new CoordinationRepository<T>(adapter, this.logger, tableName, entitySchema);
        
      case 'postgresql':
      case 'sqlite':
      case 'mysql':
      default:
        return new RelationalRepository<T>(adapter, this.logger, tableName, entitySchema);
    }
  }

  private async createDAOInstance<T>(
    config: RepositoryConfig,
    repository: RepositoryType<T>,
    adapter: DatabaseAdapter
  ): Promise<IDataAccessObject<T>> {
    const { RelationalDAO } = await import('./daos/relational-dao');
    const { GraphDAO } = await import('./daos/graph-dao');
    const { VectorDAO } = await import('./daos/vector-dao');
    const { MemoryDAO } = await import('./daos/memory-dao');
    const { CoordinationDAO } = await import('./daos/coordination-dao');

    switch (config.databaseType) {
      case 'kuzu':
        return new GraphDAO<T>(repository as IGraphRepository<T>, adapter, this.logger);
        
      case 'lancedb':
        return new VectorDAO<T>(repository as IVectorRepository<T>, adapter, this.logger);
        
      case 'memory':
        return new MemoryDAO<T>(repository as IMemoryRepository<T>, adapter, this.logger);
        
      case 'coordination':
        return new CoordinationDAO<T>(repository as ICoordinationRepository<T>, adapter, this.logger);
        
      case 'postgresql':
      case 'sqlite':
      case 'mysql':
      default:
        return new RelationalDAO<T>(repository, adapter, this.logger);
    }
  }

  private generateCacheKey(config: RepositoryConfig, type: 'repo' | 'dao' = 'repo'): string {
    const parts = [
      type,
      config.databaseType,
      config.entityType,
      config.tableName || config.entityType,
      JSON.stringify(config.options || {})
    ];
    return parts.join(':');
  }

  private generateAdapterCacheKey(config: RepositoryConfig): string {
    if (config.existingAdapter) {
      return 'existing:' + Date.now();
    }
    
    return [
      config.databaseType,
      config.databaseConfig?.host || 'localhost',
      config.databaseConfig?.database || 'default',
      config.databaseConfig?.port || 'default'
    ].join(':');
  }

  private getDefaultKuzuConfig(): DatabaseConfig {
    return {
      type: 'kuzu',
      database: './data/kuzu-graph.db',
      options: {
        bufferPoolSize: '1GB',
        maxNumThreads: 4
      }
    };
  }

  private getDefaultLanceDBConfig(vectorDimension: number): DatabaseConfig {
    return {
      type: 'lancedb',
      database: './data/lancedb-vectors.db',
      options: {
        vectorSize: vectorDimension,
        metricType: 'cosine',
        indexType: 'IVF_PQ'
      }
    };
  }

  private initializeEntityRegistry(): void {
    // Initialize with common entity types
    this.registerEntityType('SwarmAgent', {
      schema: {
        id: { type: 'string', primaryKey: true },
        name: { type: 'string', required: true },
        type: { type: 'string', required: true },
        status: { type: 'string', default: 'inactive' },
        metadata: { type: 'json' },
        createdAt: { type: 'datetime', default: 'now' },
        updatedAt: { type: 'datetime', default: 'now' }
      },
      primaryKey: 'id',
      tableName: 'swarm_agents',
      databaseType: 'coordination'
    });

    this.registerEntityType('MemoryEntry', {
      schema: {
        id: { type: 'string', primaryKey: true },
        key: { type: 'string', required: true, unique: true },
        value: { type: 'json', required: true },
        ttl: { type: 'number' },
        createdAt: { type: 'datetime', default: 'now' },
        accessedAt: { type: 'datetime' }
      },
      primaryKey: 'id',
      tableName: 'memory_entries',
      databaseType: 'memory'
    });

    this.registerEntityType('VectorDocument', {
      schema: {
        id: { type: 'string', primaryKey: true },
        vector: { type: 'vector', required: true },
        metadata: { type: 'json' },
        timestamp: { type: 'datetime', default: 'now' }
      },
      primaryKey: 'id',
      tableName: 'vector_documents',
      databaseType: 'lancedb'
    });

    this.registerEntityType('GraphNode', {
      schema: {
        id: { type: 'string', primaryKey: true },
        labels: { type: 'array' },
        properties: { type: 'json' },
        createdAt: { type: 'datetime', default: 'now' }
      },
      primaryKey: 'id',
      tableName: 'nodes',
      databaseType: 'kuzu'
    });
  }
}

/**
 * Multi-database DAO that can coordinate operations across multiple data sources
 */
export class MultiDatabaseDAO<T> implements IDataAccessObject<T> {
  constructor(
    private primaryDAO: IDataAccessObject<T>,
    private secondaryDAOs: IDataAccessObject<T>[],
    private logger: ILogger
  ) {}

  getRepository(): IRepository<T> {
    return this.primaryDAO.getRepository();
  }

  async executeTransaction<R>(operations: any[]): Promise<R> {
    // Execute on primary first
    const primaryResult = await this.primaryDAO.executeTransaction<R>(operations);
    
    // Replicate to secondaries (fire and forget for performance)
    this.replicateToSecondaries(operations).catch(error => {
      this.logger.warn(`Secondary replication failed: ${error}`);
    });
    
    return primaryResult;
  }

  async getMetadata(): Promise<any> {
    const primary = await this.primaryDAO.getMetadata();
    const secondaries = await Promise.allSettled(
      this.secondaryDAOs.map(dao => dao.getMetadata())
    );
    
    return {
      primary,
      secondaries: secondaries.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      )
    };
  }

  async healthCheck(): Promise<any> {
    const primary = await this.primaryDAO.healthCheck();
    const secondaries = await Promise.allSettled(
      this.secondaryDAOs.map(dao => dao.healthCheck())
    );
    
    return {
      primary,
      secondaries: secondaries.map(result => 
        result.status === 'fulfilled' ? result.value : { healthy: false, error: result.reason }
      ),
      overall: primary.healthy && secondaries.some(s => s.status === 'fulfilled')
    };
  }

  async getMetrics(): Promise<any> {
    const primary = await this.primaryDAO.getMetrics();
    const secondaries = await Promise.allSettled(
      this.secondaryDAOs.map(dao => dao.getMetrics())
    );
    
    return {
      primary,
      secondaries: secondaries.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      )
    };
  }

  private async replicateToSecondaries(operations: any[]): Promise<void> {
    if (this.secondaryDAOs.length === 0) return;
    
    await Promise.allSettled(
      this.secondaryDAOs.map(dao => dao.executeTransaction(operations))
    );
  }
}

export default DALFactory;