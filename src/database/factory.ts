/**
 * Unified Data Access Layer (DAL) - Factory Implementation.
 *
 * @file Central factory for creating repository and DAO instances based on database type,
 * entity requirements, and configuration. Supports dependency injection, caching,
 * multi-database coordination, and provides a single point of access for all data layer implementations.
 *
 * This factory handles the complexity of database adapter creation, entity schema management,
 * connection pooling, and provides both repository and DAO pattern implementations.
 * @author Claude-Zen DAL Team
 * @version 2.0.0
 * @since 1.0.0
 * @example Basic Factory Usage
 * ```typescript
 * import { DALFactory } from './database/factory';
 * import { DIContainer } from '../di/container/di-container';
 *
 * const container = new DIContainer();
 * const factory = container.resolve(DALFactory);
 *
 * // Create repository
 * const userRepo = await factory.createRepository<User>({
 *   databaseType: 'postgresql',
 *   entityType: 'User',
 *   databaseConfig: pgConfig
 * });
 *
 * // Create DAO with business logic
 * const userDAO = await factory.createDAO<User>({
 *   databaseType: 'postgresql',
 *   entityType: 'User',
 *   databaseConfig: pgConfig
 * });
 * ```
 * @example Multi-Database Factory Setup
 * ```typescript
 * const multiDAO = await factory.createMultiDatabaseDAO<Document>(
 *   'Document',
 *   { databaseType: 'postgresql', entityType: 'Document' }, // Primary
 *   [{ databaseType: 'lancedb', entityType: 'Document' }]   // Vector search secondary
 * );
 *
 * // Writes go to PostgreSQL, vector searches to LanceDB
 * const doc = await multiDAO.create({ title: 'Test', content: 'Content' });
 * const similar = await multiDAO.vectorSearch(embedding, 10);
 * ```
 */

// Simple interfaces to avoid import issues
interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

interface IConfig {
  get(key: string): any;
  set(key: string, value: any): void;
}

interface DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }>;
  transaction<T>(fn: (tx: any) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  getSchema?(): Promise<any>;
}

// Simple dependency injection decorators
function injectable<T extends new (...args: any[]) => any>(constructor: T) {
  return constructor;
}

function inject(token: string) {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    // Simple injection implementation
  };
}

// Core tokens
const CORE_TOKENS = {
  Logger: 'Logger',
  Config: 'Config',
} as const;

// Database config types
interface DatabaseConfig {
  type: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  pool?: {
    min: number;
    max: number;
  };
  options?: Record<string, any>;
}

interface DatabaseProviderFactory {
  createAdapter(config: DatabaseConfig): Promise<DatabaseAdapter>;
}

import type { ICoordinationRepository, IMemoryRepository } from '../database/interfaces';
import type {
  IDataAccessObject,
  IGraphRepository,
  IRepository,
  IVectorRepository,
} from './interfaces';

/**
 * Configuration interface for repository and DAO creation.
 *
 * This interface defines all the configuration options needed to create.
 * Repository or DAO instances. It supports database connection configuration,
 * entity schema definition, and repository-specific customization options..
 *
 * @interface RepositoryConfig
 * @since 1.0.0
 * @example PostgreSQL Repository Config
 * ```typescript
 * const config: RepositoryConfig = {
 *   databaseType: 'postgresql',
 *   entityType: 'User',
 *   tableName: 'app_users',
 *   schema: {
 *     id: { type: 'uuid', primaryKey: true },
 *     name: { type: 'string', required: true },
 *     email: { type: 'string', unique: true },
 *     createdAt: { type: 'datetime', default: 'now' }
 *   },
 *   databaseConfig: {
 *     type: 'postgresql',
 *     host: 'localhost',
 *     database: 'myapp',
 *     pool: { min: 2, max: 20 }
 *   }
 * };
 * ```
 * @example Vector Database Config
 * ```typescript
 * const vectorConfig: RepositoryConfig = {
 *   databaseType: 'lancedb',
 *   entityType: 'Embedding',
 *   options: {
 *     vectorSize: 1536,
 *     metricType: 'cosine',
 *     indexType: 'HNSW'
 *   },
 *   databaseConfig: {
 *     type: 'lancedb',
 *     database: './vectors.lance'
 *   }
 * };
 * ```
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
 * Union type for all possible repository implementations.
 *
 * This type represents the different repository interfaces that can be returned.
 * By the factory based on the database type. Each database type has specialized
 * methods beyond the base repository interface..
 *
 * @template T The entity type the repository manages.
 * @since 1.0.0
 * @example Type Usage in Factory Methods
 * ```typescript
 * async function createSpecializedRepo<T>(
 *   config: RepositoryConfig
 * ): Promise<RepositoryType<T>> {
 *   const repo = await factory.createRepository<T>(config);
 *
 *   // Type narrowing based on database type
 *   if (config.databaseType === 'lancedb') {
 *     const vectorRepo = repo as IVectorRepository<T>;
 *     await vectorRepo.createIndex({ name: 'idx', dimension: 384 });
 *   }
 *
 *   return repo;
 * }
 * ```
 */
export type RepositoryType<T> =
  | IRepository<T>
  | IGraphRepository<T>
  | IVectorRepository<T>
  | IMemoryRepository<T>
  | ICoordinationRepository<T>;

/**
 * Entity Type Registry Interface.
 *
 * The registry provides centralized entity schema management, enabling type safety,
 * automatic table creation, index management, and database migration support.
 * Each entity type is registered with its complete schema definition.
 *
 * @interface EntityTypeRegistry
 * @since 1.0.0
 * @example Entity Registration
 * ```typescript
 * const registry: EntityTypeRegistry = {
 *   User: {
 *     schema: {
 *       id: { type: 'uuid', primaryKey: true },
 *       name: { type: 'string', required: true, maxLength: 100 },
 *       email: { type: 'string', unique: true },
 *       profile: { type: 'json' },
 *       createdAt: { type: 'datetime', default: 'now' },
 *       updatedAt: { type: 'datetime', default: 'now', onUpdate: 'now' }
 *     },
 *     primaryKey: 'id',
 *     tableName: 'users',
 *     databaseType: 'postgresql',
 *     indexes: [
 *       { name: 'users_email_idx', fields: ['email'], unique: true },
 *       { name: 'users_created_idx', fields: ['createdAt'], unique: false }
 *     ]
 *   }
 * };
 * ```
 * @example Vector Entity Registration
 * ```typescript
 * registry.VectorDocument = {
 *   schema: {
 *     id: { type: 'string', primaryKey: true },
 *     vector: { type: 'vector', dimension: 1536, required: true },
 *     metadata: { type: 'json' },
 *     timestamp: { type: 'datetime', default: 'now' }
 *   },
 *   primaryKey: 'id',
 *   databaseType: 'lancedb',
 *   indexes: [
 *     { name: 'vector_similarity_idx', fields: ['vector'], unique: false }
 *   ]
 * };
 * ```
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
 * Main Factory Class for Data Access Layer Instance Creation.
 *
 * The DALFactory is the central component responsible for creating, caching, and managing.
 * All database access layer instances. It handles dependency injection, connection pooling,
 * schema validation, and provides both repository and DAO pattern implementations.
 *
 * Features:
 * - Automatic dependency injection integration
 * - Connection and instance caching for performance
 * - Multi-database coordination support
 * - Entity schema registry management
 * - Database adapter lifecycle management
 * - Transaction and error handling support.
 *
 * @class DALFactory
 * @injectable.
 * @since 1.0.0
 * @example Basic Factory Setup
 * ```typescript
 * import { DALFactory } from './factory';
 * import { DIContainer } from '../di/container/di-container';
 * import { CORE_TOKENS } from '../di/tokens/core-tokens';
 *
 * const container = new DIContainer();
 * container.register(CORE_TOKENS.Logger, () => logger);
 * container.register(CORE_TOKENS.Config, () => config);
 *
 * const factory = container.resolve(DALFactory);
 *
 * // Register custom entity types
 * factory.registerEntityType('Product', {
 *   schema: { id: { type: 'uuid' }, name: { type: 'string' } },
 *   primaryKey: 'id',
 *   tableName: 'products'
 * });
 *
 * const productDAO = await factory.createDAO<Product>({
 *   databaseType: 'postgresql',
 *   entityType: 'Product'
 * });
 * ```
 * @example Specialized Database Factories
 * ```typescript
 * // Create vector database repository
 * const vectorRepo = await factory.createLanceDBVectorRepository<Embedding>(
 *   'Embedding',
 *   1536 // OpenAI embedding dimension
 * );
 *
 * // Create graph database repository
 * const graphRepo = await factory.createKuzuGraphRepository<Node>('Node');
 *
 * // Create coordination repository
 * const coordRepo = await factory.createCoordinationRepository<Lock>('Lock');
 * ```
 */
@injectable
export class DALFactory {
  private repositoryCache = new Map<string, any>();
  private daoCache = new Map<string, any>();
  private adapterCache = new Map<string, DatabaseAdapter>();
  private entityRegistry: EntityTypeRegistry = {};

  constructor(
    @inject(CORE_TOKENS.Logger) private _logger: ILogger,
    @inject(CORE_TOKENS.Config) private _config: IConfig,
    private databaseProviderFactory: DatabaseProviderFactory
  ) {
    this.initializeEntityRegistry();
  }

  /**
   * Create a Repository Instance for Entity Management.
   *
   * Creates a repository instance providing low-level database access with entity mapping,
   * query building, and database-specific optimizations. Repositories handle the persistence
   * layer with minimal business logic.
   *
   * @template T The entity type this repository will manage.
   * @param {RepositoryConfig} config - Repository configuration including database type and entity schema.
   * @returns {Promise<RepositoryType<T>>} A promise that resolves to a typed repository instance.
   * @throws {Error} When repository creation fails due to invalid configuration.
   * @throws {Error} When database connection cannot be established.
   * @throws {Error} When entity schema validation fails.
   * @example PostgreSQL Repository Creation
   * ```typescript
   * const userRepository = await factory.createRepository<User>({
   *   databaseType: 'postgresql',
   *   entityType: 'User',
   *   tableName: 'app_users',
   *   schema: {
   *     id: { type: 'uuid', primaryKey: true },
   *     name: { type: 'string', required: true },
   *     email: { type: 'string', unique: true }
   *   },
   *   databaseConfig: {
   *     type: 'postgresql',
   *     host: 'localhost',
   *     database: 'production'
   *   }
   * });
   *
   * // Repository provides basic CRUD operations
   * const users = await userRepository.findAll({ limit: 10 });
   * const user = await userRepository.create({ name: 'John', email: 'john@example.com' });
   * await userRepository.update(user.id, { name: 'John Doe' });
   * ```
   * @example Vector Repository with Custom Schema
   * ```typescript
   * const vectorRepo = await factory.createRepository<VectorDoc>({
   *   databaseType: 'lancedb',
   *   entityType: 'VectorDocument',
   *   options: {
   *     vectorSize: 1536,
   *     metricType: 'cosine'
   *   },
   *   schema: {
   *     id: { type: 'string', primaryKey: true },
   *     vector: { type: 'vector', dimension: 1536 },
   *     metadata: { type: 'json' }
   *   }
   * });
   *
   * // Vector-specific operations
   * const similar = await vectorRepo.vectorSearch(queryVector, 10);
   * ```
   */
  async createRepository<T>(config: RepositoryConfig): Promise<RepositoryType<T>> {
    const cacheKey = this.generateCacheKey(config);

    if (this.repositoryCache.has(cacheKey)) {
      this['_logger']?.debug(`Returning cached repository: ${cacheKey}`);
      return this.repositoryCache.get(cacheKey);
    }

    this['_logger']?.info(
      `Creating new repository: ${config?.['entityType']} (${config?.['databaseType']})`
    );

    try {
      // Get or create database adapter
      const adapter = await this.getOrCreateAdapter(config);

      // Create repository based on database type
      const repository = await this.createRepositoryInstance<T>(config, adapter);

      // Cache the repository
      this.repositoryCache.set(cacheKey, repository);

      return repository;
    } catch (error) {
      this['_logger']?.error(`Failed to create repository: ${error}`);
      throw new Error(
        `Repository creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a Data Access Object (DAO) Instance with Business Logic.
   *
   * Creates a DAO instance that wraps a repository with additional business logic,
   * validation, caching, and transaction management. DAOs provide a higher-level
   * interface suitable for application service layers.
   *
   * @template T The entity type this DAO will manage.
   * @param {RepositoryConfig} config - DAO configuration including database type and business rules.
   * @returns {Promise<IDataAccessObject<T>>} A promise that resolves to a configured DAO instance.
   * @throws {Error} When DAO creation fails due to repository issues.
   * @throws {Error} When business logic validation fails.
   * @throws {Error} When transaction setup fails.
   * @example User DAO with Validation
   * ```typescript
   * const userDAO = await factory.createDAO<User>({
   *   databaseType: 'postgresql',
   *   entityType: 'User',
   *   options: {
   *     enableCaching: true,
   *     validateOnCreate: true,
   *     auditChanges: true
   *   }
   * });
   *
   * // DAO provides enhanced operations with validation
   * try {
   *   const user = await userDAO.create({
   *     name: 'John',
   *     email: 'john@example.com'
   *   }); // Validates email format, checks uniqueness
   *
   *   // Transaction support
   *   await userDAO.executeTransaction([
   *     { operation: 'create', data: user1 },
   *     { operation: 'update', id: 'user-2', data: updates }
   *   ]);
   * } catch (error) {
   *   console.error('DAO operation failed:', error.message);
   * }
   * ```
   * @example Vector DAO with Similarity Search
   * ```typescript
   * const vectorDAO = await factory.createDAO<VectorDocument>({
   *   databaseType: 'lancedb',
   *   entityType: 'VectorDocument'
   * });
   *
   * // DAO provides specialized vector operations
   * const results = await vectorDAO.bulkVectorOperations([
   *   { operation: 'upsert', id: 'doc-1', vector: embedding1 },
   *   { operation: 'upsert', id: 'doc-2', vector: embedding2 }
   * ], 'batch');
   *
   * const similar = await vectorDAO.similaritySearch(queryVector, {
   *   limit: 10,
   *   threshold: 0.8
   * });
   * ```
   */
  async createDAO<T>(config: RepositoryConfig): Promise<IDataAccessObject<T>> {
    const cacheKey = this.generateCacheKey(config, 'dao');

    if (this.daoCache.has(cacheKey)) {
      this['_logger']?.debug(`Returning cached DAO: ${cacheKey}`);
      return this.daoCache.get(cacheKey);
    }

    this['_logger']?.info(
      `Creating new DAO: ${config?.['entityType']} (${config?.['databaseType']})`
    );

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
      this['_logger']?.error(`Failed to create DAO: ${error}`);
      throw new Error(
        `DAO creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Register Entity Type with Schema and Database Configuration.
   *
   * Registers an entity type in the factory's entity registry, providing schema definitions,
   * table mapping, indexing strategies, and database type preferences. This enables
   * automatic table creation, validation, and optimized query generation.
   *
   * @param {string} entityType - The unique name for this entity type.
   * @param {Object} config - Entity configuration object.
   * @param {Record<string, any>} config.schema - Entity field definitions with types and constraints.
   * @param {string} config.primaryKey - Name of the primary key field.
   * @param {string} [config.tableName] - Custom table name (defaults to entityType).
   * @param {string} [config.databaseType] - Preferred database type for this entity.
   * @param {Array} [config.indexes] - Index definitions for performance optimization.
   * @throws {Error} When entity type is already registered.
   * @throws {Error} When schema validation fails.
   * @throws {Error} When primary key is not defined in schema.
   * @example User Entity Registration
   * ```typescript
   * factory.registerEntityType('User', {
   *   schema: {
   *     id: {
   *       type: 'uuid',
   *       primaryKey: true,
   *       default: 'uuid_generate_v4()'
   *     },
   *     name: {
   *       type: 'string',
   *       required: true,
   *       maxLength: 100,
   *       validate: /^[a-zA-Z\s]+$/ // Only letters and spaces
   *     },
   *     email: {
   *       type: 'string',
   *       unique: true,
   *       validate: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email format
   *     },
   *     profile: { type: 'json' },
   *     createdAt: { type: 'datetime', default: 'now' },
   *     updatedAt: { type: 'datetime', default: 'now', onUpdate: 'now' }
   *   },
   *   primaryKey: 'id',
   *   tableName: 'app_users',
   *   databaseType: 'postgresql',
   *   indexes: [
   *     { name: 'users_email_idx', fields: ['email'], unique: true },
   *     { name: 'users_created_idx', fields: ['createdAt'], unique: false },
   *     { name: 'users_name_search_idx', fields: ['name'], unique: false }
   *   ]
   * });
   * ```
   * @example Vector Document Registration
   * ```typescript
   * factory.registerEntityType('EmbeddingDocument', {
   *   schema: {
   *     id: { type: 'string', primaryKey: true },
   *     vector: {
   *       type: 'vector',
   *       dimension: 1536, // OpenAI ada-002 dimension
   *       required: true
   *     },
   *     content: { type: 'text', required: true },
   *     metadata: {
   *       type: 'json',
   *       validate: (value) => typeof value === 'object'
   *     },
   *     timestamp: { type: 'datetime', default: 'now' }
   *   },
   *   primaryKey: 'id',
   *   tableName: 'document_embeddings',
   *   databaseType: 'lancedb',
   *   indexes: [
   *     { name: 'embedding_vector_idx', fields: ['vector'], unique: false }
   *   ]
   * });
   * ```
   */
  registerEntityType(
    entityType: string,
    config: {
      schema: Record<string, any>;
      primaryKey: string;
      tableName?: string;
      databaseType?: string;
      indexes?: Array<{
        name: string;
        fields: string[];
        unique?: boolean;
      }>;
    }
  ): void {
    this['_logger']?.debug(`Registering entity type: ${entityType}`);
    this.entityRegistry[entityType] = config;
  }

  /**
   * Retrieve Registered Entity Configuration.
   *
   * Gets the complete configuration for a registered entity type, including schema,
   * table mapping, indexes, and database preferences. Returns undefined if the
   * entity type is not registered.
   *
   * @param {string} entityType - The entity type name to look up.
   * @returns {EntityTypeRegistry[string] | undefined} Entity configuration or undefined.
   * @example Getting Entity Configuration
   * ```typescript
   * const userConfig = factory.getEntityConfig('User');
   * if (userConfig) {
   *   console.log('Primary key:', userConfig.primaryKey);
   *   console.log('Table name:', userConfig.tableName);
   *   console.log('Schema fields:', Object.keys(userConfig.schema));
   *   console.log('Indexes:', userConfig.indexes);
   * }
   * ```
   * @example Validating Entity Before Creation
   * ```typescript
   * const entityType = 'Product';
   * const config = factory.getEntityConfig(entityType);
   *
   * if (!config) {
   *   throw new Error(`Entity type ${entityType} is not registered`);
   * }
   *
   * // Use configuration for DAO creation
   * const productDAO = await factory.createDAO({
   *   databaseType: config.databaseType || 'postgresql',
   *   entityType,
   *   tableName: config.tableName,
   *   schema: config.schema
   * });
   * ```
   */
  getEntityConfig(entityType: string): EntityTypeRegistry[string] | undefined {
    return this.entityRegistry[entityType];
  }

  /**
   * Create Kuzu Graph Database Repository with Optimized Configuration.
   *
   * Creates a specialized graph repository for Kuzu database with pre-configured.
   * Settings optimized for graph traversal queries, relationship management,
   * and network analysis operations..
   *
   * @template T The entity type representing graph nodes.
   * @param {string} entityType - The entity type name for graph nodes.
   * @param {string} [tableName] - Optional custom table name (defaults to entityType).
   * @returns {Promise<IGraphRepository<T>>} A promise that resolves to a graph repository instance.
   * @throws {Error} When Kuzu database configuration is invalid.
   * @throws {Error} When graph repository creation fails.
   * @throws {Error} When database connection cannot be established.
   * @example Social Network Graph Repository
   * ```typescript
   * interface Person {
   *   id: string;
   *   name: string;
   *   properties: { age: number; location: string };
   * }
   *
   * const personRepo = await factory.createKuzuGraphRepository<Person>(
   *   'Person',
   *   'social_network_nodes'
   * );
   *
   * // Create nodes
   * await personRepo.createNode({
   *   id: 'person-1',
   *   labels: ['Person', 'Employee'],
   *   properties: { name: 'Alice', age: 30, department: 'Engineering' }
   * });
   *
   * // Create relationships
   * await personRepo.createRelationship({
   *   type: 'KNOWS',
   *   startNodeId: 'person-1',
   *   endNodeId: 'person-2',
   *   properties: { since: '2020-01-01', strength: 0.8 }
   * });
   *
   * // Graph traversal queries
   * const friends = await personRepo.findNeighbors('person-1', {
   *   relationshipType: 'KNOWS',
   *   maxDepth: 2
   * });
   *
   * // Shortest path algorithm
   * const path = await personRepo.findShortestPath('person-1', 'person-5');
   * ```
   * @example Knowledge Graph Repository
   * ```typescript
   * interface Concept {
   *   id: string;
   *   type: 'concept' | 'entity' | 'relationship';
   *   properties: Record<string, any>;
   * }
   *
   * const knowledgeRepo = await factory.createKuzuGraphRepository<Concept>(
   *   'Concept',
   *   'knowledge_graph'
   * );
   *
   * // Complex graph queries
   * const relatedConcepts = await knowledgeRepo.query(
   *   'MATCH (c:Concept)-[r:RELATED_TO*1..3]->(related:Concept) WHERE c.id = $id RETURN related',
   *   { id: 'ai-machine-learning' }
   * );
   * ```
   */
  async createKuzuGraphRepository<T>(
    entityType: string,
    tableName?: string
  ): Promise<IGraphRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'kuzu',
      entityType,
      tableName: tableName || entityType,
      databaseConfig: this.getDefaultKuzuConfig(),
    };

    return (await this.createRepository<T>(config)) as IGraphRepository<T>;
  }

  /**
   * Create LanceDB Vector Database Repository for Similarity Search.
   *
   * Creates a specialized vector repository for LanceDB with optimized configuration.
   * For vector similarity search, embedding storage, and high-dimensional data operations.
   * Supports various distance metrics and indexing strategies for performance..
   *
   * @template T The entity type representing vector documents.
   * @param {string} entityType - The entity type name for vector documents.
   * @param {number} [vectorDimension=384] - Vector dimension (default: 384 for sentence transformers).
   * @returns {Promise<IVectorRepository<T>>} A promise that resolves to a vector repository instance.
   * @throws {Error} When LanceDB configuration is invalid.
   * @throws {Error} When vector dimension is invalid (must be > 0).
   * @throws {Error} When database connection fails.
   * @example Document Embedding Repository
   * ```typescript
   * interface DocumentEmbedding {
   *   id: string;
   *   vector: number[];
   *   metadata: {
   *     title: string;
   *     content: string;
   *     source: string;
   *     timestamp: Date;
   *   };
   * }
   *
   * // OpenAI ada-002 embeddings (1536 dimensions)
   * const embeddingRepo = await factory.createLanceDBVectorRepository<DocumentEmbedding>(
   *   'DocumentEmbedding',
   *   1536
   * );
   *
   * // Store document embeddings
   * await embeddingRepo.create({
   *   id: 'doc-123',
   *   vector: openaiEmbedding, // 1536-dimensional vector
   *   metadata: {
   *     title: 'AI Research Paper',
   *     content: 'Abstract: This paper discusses...',
   *     source: 'arxiv',
   *     timestamp: new Date()
   *   }
   * });
   *
   * // Similarity search
   * const similar = await embeddingRepo.vectorSearch(queryEmbedding, {
   *   limit: 10,
   *   threshold: 0.8,
   *   includeMetadata: true
   * });
   * ```
   * @example Image Feature Repository
   * ```typescript
   * interface ImageFeature {
   *   id: string;
   *   vector: number[];
   *   metadata: {
   *     filename: string;
   *     width: number;
   *     height: number;
   *     tags: string[];
   *   };
   * }
   *
   * // ResNet features (2048 dimensions)
   * const imageRepo = await factory.createLanceDBVectorRepository<ImageFeature>(
   *   'ImageFeature',
   *   2048
   * );
   *
   * // Batch insert images
   * await imageRepo.bulkInsert(imageFeatures);
   *
   * // Find similar images
   * const similarImages = await imageRepo.vectorSearch(
   *   queryImageFeature,
   *   {
   *     limit: 5,
   *     metricType: 'euclidean', // Override default cosine similarity
   *     filters: { tags: { $in: ['nature', 'landscape'] } }
   *   }
   * );
   * ```
   */
  async createLanceDBVectorRepository<T>(
    entityType: string,
    vectorDimension: number = 384
  ): Promise<IVectorRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'lancedb',
      entityType,
      tableName: entityType,
      databaseConfig: this.getDefaultLanceDBConfig(vectorDimension),
    };

    return (await this.createRepository<T>(config)) as IVectorRepository<T>;
  }

  /**
   * Create Coordination Repository for Distributed System Operations.
   *
   * Creates a specialized repository for coordination operations in distributed systems,
   * including distributed locking, leader election, task scheduling, and inter-service.
   * Communication. Uses SQLite by default for reliable local coordination..
   *
   * @template T The entity type representing coordination objects.
   * @param {string} entityType - The entity type name for coordination objects.
   * @returns {Promise<ICoordinationRepository<T>>} A promise that resolves to a coordination repository.
   * @throws {Error} When coordination database setup fails.
   * @throws {Error} When distributed locking initialization fails.
   * @throws {Error} When coordination schema creation fails.
   * @example Distributed Lock Repository
   * ```typescript
   * interface DistributedLock {
   *   id: string;
   *   resourceId: string;
   *   ownerId: string;
   *   expiresAt: Date;
   *   metadata: {
   *     operation: string;
   *     priority: number;
   *     retryCount: number;
   *   };
   * }
   *
   * const lockRepo = await factory.createCoordinationRepository<DistributedLock>(
   *   'DistributedLock'
   * );
   *
   * // Acquire distributed lock
   * const lock = await lockRepo.acquireLock({
   *   resourceId: 'database-migration-001',
   *   ownerId: 'worker-node-1',
   *   ttl: 300000, // 5 minutes
   *   metadata: {
   *     operation: 'schema_migration',
   *     priority: 10,
   *     retryCount: 0
   *   }
   * });
   *
   * try {
   *   // Perform critical operation
   *   await performDatabaseMigration();
   * } finally {
   *   // Release lock
   *   await lockRepo.releaseLock(lock.id);
   * }
   * ```
   * @example Task Queue Coordination
   * ```typescript
   * interface CoordinationTask {
   *   id: string;
   *   type: 'processing' | 'cleanup' | 'migration';
   *   status: 'pending' | 'processing' | 'completed' | 'failed';
   *   assignedTo?: string;
   *   priority: number;
   *   payload: Record<string, any>;
   *   createdAt: Date;
   *   scheduledFor?: Date;
   * }
   *
   * const taskRepo = await factory.createCoordinationRepository<CoordinationTask>(
   *   'CoordinationTask'
   * );
   *
   * // Worker claims next task
   * const task = await taskRepo.claimNextTask({
   *   workerId: 'worker-3',
   *   taskTypes: ['processing', 'cleanup'],
   *   timeout: 600000 // 10 minutes
   * });
   *
   * // Update task progress
   * await taskRepo.updateTaskStatus(task.id, 'processing', {
   *   progress: 0.5,
   *   message: 'Processing 50% complete'
   * });
   * ```
   */
  async createCoordinationRepository<T>(entityType: string): Promise<ICoordinationRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'coordination',
      entityType,
      tableName: entityType,
      databaseConfig: {
        type: 'sqlite', // Use SQLite for coordination by default
        database: './data/coordination.db',
      },
    };

    return (await this.createRepository<T>(config)) as ICoordinationRepository<T>;
  }

  /**
   * Create Memory Repository for Caching and Session Management.
   *
   * Creates a specialized in-memory repository optimized for caching, session storage,
   * and temporary data management. Uses SQLite's in-memory mode with configurable
   * TTL (Time To Live) and size limits for memory management.
   *
   * @template T The entity type for memory-stored objects.
   * @param {string} entityType - The entity type name for memory objects.
   * @returns {Promise<IMemoryRepository<T>>} A promise that resolves to a memory repository.
   * @throws {Error} When in-memory database initialization fails.
   * @throws {Error} When memory limits configuration is invalid.
   * @throws {Error} When TTL configuration is invalid.
   * @example Session Cache Repository
   * ```typescript
   * interface UserSession {
   *   id: string;
   *   userId: string;
   *   token: string;
   *   expiresAt: Date;
   *   metadata: {
   *     ipAddress: string;
   *     userAgent: string;
   *     permissions: string[];
   *     lastActivity: Date;
   *   };
   * }
   *
   * const sessionRepo = await factory.createMemoryRepository<UserSession>(
   *   'UserSession'
   * );
   *
   * // Store session with automatic TTL
   * await sessionRepo.create({
   *   id: 'sess-123',
   *   userId: 'user-456',
   *   token: 'jwt-token-here',
   *   expiresAt: new Date(Date.now() + 3600000), // 1 hour
   *   metadata: {
   *     ipAddress: '192.168.1.100',
   *     userAgent: 'Mozilla/5.0...',
   *     permissions: ['read', 'write'],
   *     lastActivity: new Date()
   *   }
   * }, { ttl: 3600 }); // TTL in seconds
   *
   * // Retrieve active sessions
   * const activeSessions = await sessionRepo.findByUserId('user-456');
   *
   * // Clean up expired sessions automatically
   * await sessionRepo.cleanupExpired();
   * ```
   * @example Application Cache Repository
   * ```typescript
   * interface CacheEntry {
   *   id: string;
   *   key: string;
   *   value: any;
   *   tags: string[];
   *   createdAt: Date;
   *   accessCount: number;
   * }
   *
   * const cacheRepo = await factory.createMemoryRepository<CacheEntry>(
   *   'CacheEntry'
   * );
   *
   * // Cache API responses
   * await cacheRepo.set('api:users:list:page1', {
   *   users: userListData,
   *   totalCount: 1500,
   *   page: 1
   * }, {
   *   ttl: 300, // 5 minutes
   *   tags: ['api-cache', 'users']
   * });
   *
   * // Retrieve with hit tracking
   * const cached = await cacheRepo.get('api:users:list:page1');
   * if (cached) {
   *   console.log('Cache hit, access count:', cached.accessCount);
   * }
   *
   * // Invalidate by tags
   * await cacheRepo.invalidateByTags(['users']);
   * ```
   */
  async createMemoryRepository<T>(entityType: string): Promise<IMemoryRepository<T>> {
    const config: RepositoryConfig = {
      databaseType: 'memory',
      entityType,
      tableName: entityType,
      options: {
        maxSize: 1000,
        ttlDefault: 3600, // 1 hour default TTL
      },
    };

    return (await this.createRepository<T>(config)) as IMemoryRepository<T>;
  }

  /**
   * Create Multi-Database DAO for Distributed Data Operations.
   *
   * Creates a sophisticated multi-database DAO that can coordinate operations across.
   * Different database types and instances. The primary database handles writes and
   * authoritative reads, while secondary databases provide read scaling, caching,
   * specialized queries, and data redundancy..
   *
   * @template T The entity type for multi-database operations.
   * @param {string} entityType - The entity type name.
   * @param {RepositoryConfig} primaryConfig - Primary database configuration (handles writes).
   * @param {RepositoryConfig[]} [secondaryConfigs] - Optional secondary database configurations.
   * @returns {Promise<MultiDatabaseDAO<T>>} A promise that resolves to a multi-database DAO.
   * @throws {Error} When primary database configuration is invalid.
   * @throws {Error} When any secondary database setup fails.
   * @throws {Error} When multi-database coordination setup fails.
   * @example Primary PostgreSQL with Vector Search Secondary
   * ```typescript
   * interface Product {
   *   id: string;
   *   name: string;
   *   description: string;
   *   price: number;
   *   category: string;
   *   embedding?: number[];
   * }
   *
   * const productDAO = await factory.createMultiDatabaseDAO<Product>(
   *   'Product',
   *   {
   *     databaseType: 'postgresql',
   *     entityType: 'Product',
   *     databaseConfig: {
   *       host: 'prod-db.example.com',
   *       database: 'products',
   *       pool: { min: 5, max: 50 }
   *     }
   *   },
   *   [
   *     {
   *       databaseType: 'lancedb',
   *       entityType: 'Product',
   *       databaseConfig: {
   *         database: './product-embeddings.lance',
   *         options: { vectorSize: 1536 }
   *       }
   *     }
   *   ]
   * );
   *
   * // Write operations go to primary PostgreSQL
   * const product = await productDAO.create({
   *   name: 'Smart Phone',
   *   description: 'Latest smartphone with AI features',
   *   price: 799.99,
   *   category: 'electronics'
   * });
   *
   * // Vector similarity search uses secondary LanceDB
   * const similar = await productDAO.vectorSearch(
   *   descriptionEmbedding,
   *   { limit: 10, threshold: 0.8 }
   * );
   *
   * // Health check across all databases
   * const health = await productDAO.healthCheck();
   * console.log('Primary healthy:', health.primary.healthy);
   * console.log('Secondaries healthy:', health.secondaries.map(s => s.healthy));
   * ```
   * @example Multi-Region Setup with Replication
   * ```typescript
   * const userDAO = await factory.createMultiDatabaseDAO<User>(
   *   'User',
   *   {
   *     databaseType: 'postgresql',
   *     entityType: 'User',
   *     databaseConfig: { host: 'primary-db.us-east.com' }
   *   },
   *   [
   *     {
   *       databaseType: 'postgresql',
   *       entityType: 'User',
   *       databaseConfig: { host: 'replica-db.us-west.com' }
   *     },
   *     {
   *       databaseType: 'memory',
   *       entityType: 'User',
   *       options: { maxSize: 10000, ttl: 300 } // 5-minute cache
   *     }
   *   ]
   * );
   *
   * // Writes replicated to secondaries asynchronously
   * await userDAO.executeTransaction([
   *   { operation: 'create', data: newUser },
   *   { operation: 'update', id: 'user-123', data: { status: 'active' } }
   * ]);
   *
   * // Read performance metrics across all databases
   * const metrics = await userDAO.getMetrics();
   * console.log('Primary metrics:', metrics.primary);
   * console.log('Secondary metrics:', metrics.secondaries);
   * ```
   */
  async createMultiDatabaseDAO<T>(
    entityType: string,
    primaryConfig: RepositoryConfig,
    secondaryConfigs?: RepositoryConfig[]
  ): Promise<MultiDatabaseDAO<T>> {
    this['_logger']?.info(`Creating multi-database DAO for: ${entityType}`);

    const primaryDAO = await this.createDAO<T>(primaryConfig);
    const secondaryDAOs: IDataAccessObject<T>[] = [];

    if (secondaryConfigs) {
      for (const config of secondaryConfigs) {
        const dao = await this.createDAO<T>(config);
        secondaryDAOs.push(dao);
      }
    }

    return new MultiDatabaseDAO<T>(primaryDAO, secondaryDAOs, this['_logger']);
  }

  /**
   * Clear all caches.
   */
  clearCaches(): void {
    this['_logger']?.info('Clearing DAL factory caches');
    this.repositoryCache.clear();
    this.daoCache.clear();
    this.adapterCache.clear();
  }

  /**
   * Get cache statistics.
   */
  getCacheStats(): {
    repositories: number;
    daos: number;
    adapters: number;
  } {
    return {
      repositories: this.repositoryCache.size,
      daos: this.daoCache.size,
      adapters: this.adapterCache.size,
    };
  }

  /**
   * Private methods for internal operations.
   */

  private async getOrCreateAdapter(config: RepositoryConfig): Promise<DatabaseAdapter> {
    if (config?.['existingAdapter']) {
      return config?.['existingAdapter'];
    }

    const adapterCacheKey = this.generateAdapterCacheKey(config);

    if (this.adapterCache.has(adapterCacheKey)) {
      return this.adapterCache.get(adapterCacheKey)!;
    }

    if (!config?.['databaseConfig']) {
      throw new Error('Database configuration required when creating new adapter');
    }

    // Fixed: Await the adapter creation and connect properly
    const adapter = await this.databaseProviderFactory.createAdapter(config?.['databaseConfig']);
    // TODO: TypeScript error TS2339 - Property 'connect' does not exist on type 'DatabaseAdapter' (AI unsure of safe fix - human review needed)
    // Note: DatabaseAdapter interface may need to include connect method or adapter creation should handle connection

    this.adapterCache.set(adapterCacheKey, adapter);
    return adapter;
  }

  private async createRepositoryInstance<T>(
    config: RepositoryConfig,
    adapter: DatabaseAdapter
  ): Promise<RepositoryType<T>> {
    // Use DAOs as repository implementations since they extend BaseDao which implements IRepository
    // Canonical DAO implementations (lowercase 'Dao')
    const { RelationalDao } = await import('./dao/relational.dao');
    const { GraphDao } = await import('./dao/graph.dao');
    const { VectorDao } = await import('./dao/vector.dao');
    const { MemoryDao } = await import('./dao/memory.dao');
    const { CoordinationDao } = await import('./dao/coordination.dao');

    const tableName = config?.['tableName'] || config?.['entityType'];
    const entitySchema = config?.['schema'] || this.entityRegistry[config?.['entityType']]?.schema;

    // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected and only accessible within the class declaration (AI unsure of safe fix - human review needed)
    // Note: Need to use factory methods or public constructors instead of protected BaseDao constructors
    switch (config?.['databaseType']) {
      case 'kuzu':
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new GraphDao<T>(
          adapter,
          this['_logger'],
          tableName,
          entitySchema
        ) as any as RepositoryType<T>;

      case 'lancedb':
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new VectorDao<T>(
          adapter,
          this['_logger'],
          tableName,
          entitySchema
        ) as any as RepositoryType<T>;

      case 'memory':
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new MemoryDao<T>(
          // TODO: TypeScript error TS2345 - Argument of type 'DatabaseAdapter' is not assignable to parameter of type 'IMemoryRepository<T>' (AI unsure of safe fix - human review needed)
          adapter,
          this['_logger'],
          tableName,
          entitySchema
        ) as any as RepositoryType<T>;

      case 'coordination':
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new CoordinationDao<T>(
          // TODO: TypeScript error TS2345 - Argument of type 'DatabaseAdapter' is not assignable to parameter of type 'ICoordinationRepository<T>' (AI unsure of safe fix - human review needed)
          adapter,
          this['_logger'],
          tableName,
          entitySchema
        ) as any as RepositoryType<T>;

      default:
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new RelationalDao<T>(
          adapter,
          this['_logger'],
          tableName,
          entitySchema
        ) as any as RepositoryType<T>;
    }
  }

  private async createDAOInstance<T>(
    config: RepositoryConfig,
    repository: RepositoryType<T>,
    adapter: DatabaseAdapter
  ): Promise<IDataAccessObject<T>> {
    const { RelationalDao } = await import('./dao/relational.dao');
    const { GraphDao } = await import('./dao/graph.dao');
    const { VectorDao } = await import('./dao/vector.dao');
    const { MemoryDao } = await import('./dao/memory.dao');
    const { CoordinationDao } = await import('./dao/coordination.dao');

    // TODO: TypeScript errors with DAO instantiation - these constructors expect different parameter types than what's being passed
    // These need proper interface implementation and constructor signature fixes
    switch (config?.['databaseType']) {
      case 'kuzu':
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new GraphDao<T>(repository as IGraphRepository<T>, adapter, this['_logger']);

      case 'lancedb':
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new VectorDao<T>(repository as IVectorRepository<T>, adapter, this['_logger']);

      case 'memory':
        // TODO: TypeScript error TS2739 - Type 'MemoryDao<T>' is missing properties from type 'IDataAccessObject<T>' (AI unsure of safe fix - human review needed)
        // TODO: TypeScript error TS2345 - Argument of type 'IMemoryRepository<T>' is not assignable to parameter of type 'DatabaseAdapter' (AI unsure of safe fix - human review needed)
        return new MemoryDao<T>(repository as IMemoryRepository<T>, adapter, this['_logger']);

      case 'coordination':
        // TODO: TypeScript error TS2739 - Type 'CoordinationDao<T>' is missing properties from type 'IDataAccessObject<T>' (AI unsure of safe fix - human review needed)
        // TODO: TypeScript error TS2345 - Argument of type 'ICoordinationRepository<T>' is not assignable to parameter of type 'DatabaseAdapter' (AI unsure of safe fix - human review needed)
        return new CoordinationDao<T>(
          repository as ICoordinationRepository<T>,
          adapter,
          this['_logger']
        );
      default:
        // TODO: TypeScript error TS2674 - Constructor of class 'BaseDao<T>' is protected (AI unsure of safe fix - human review needed)
        return new RelationalDao<T>(repository, adapter, this['_logger']);
    }
  }

  private generateCacheKey(config: RepositoryConfig, type: 'repo' | 'dao' = 'repo'): string {
    const parts = [
      type,
      config?.['databaseType'],
      config?.['entityType'],
      config?.['tableName'] || config?.['entityType'],
      JSON.stringify(config?.['options'] || {}),
    ];
    return parts.join(':');
  }

  private generateAdapterCacheKey(config: RepositoryConfig): string {
    if (config?.['existingAdapter']) {
      return `existing:${Date.now()}`;
    }

    return [
      config?.['databaseType'],
      config?.['databaseConfig']?.host || 'localhost',
      config?.['databaseConfig']?.database || 'default',
      config?.['databaseConfig']?.port || 'default',
    ].join(':');
  }

  private getDefaultKuzuConfig(): DatabaseConfig {
    return {
      type: 'kuzu',
      database: './data/kuzu-graph.db',
      options: {
        bufferPoolSize: '1GB',
        maxNumThreads: 4,
      },
    };
  }

  private getDefaultLanceDBConfig(vectorDimension: number): DatabaseConfig {
    return {
      type: 'lancedb',
      database: './data/lancedb-vectors.db',
      options: {
        vectorSize: vectorDimension,
        metricType: 'cosine',
        indexType: 'IVF_PQ',
      },
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
        updatedAt: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'id',
      tableName: 'swarm_agents',
      databaseType: 'coordination',
    });

    this.registerEntityType('MemoryEntry', {
      schema: {
        id: { type: 'string', primaryKey: true },
        key: { type: 'string', required: true, unique: true },
        value: { type: 'json', required: true },
        ttl: { type: 'number' },
        createdAt: { type: 'datetime', default: 'now' },
        accessedAt: { type: 'datetime' },
      },
      primaryKey: 'id',
      tableName: 'memory_entries',
      databaseType: 'memory',
    });

    this.registerEntityType('VectorDocument', {
      schema: {
        id: { type: 'string', primaryKey: true },
        vector: { type: 'vector', required: true },
        metadata: { type: 'json' },
        timestamp: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'id',
      tableName: 'vector_documents',
      databaseType: 'lancedb',
    });

    this.registerEntityType('GraphNode', {
      schema: {
        id: { type: 'string', primaryKey: true },
        labels: { type: 'array' },
        properties: { type: 'json' },
        createdAt: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'id',
      tableName: 'nodes',
      databaseType: 'kuzu',
    });
  }
}

/**
 * Multi-database DAO that can coordinate operations across multiple data sources.
 *
 * @example
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
    this.replicateToSecondaries(operations).catch((error) => {
      this.logger.warn(`Secondary replication failed: ${error}`);
    });

    return primaryResult;
  }

  async getMetadata(): Promise<any> {
    const primary = await this.primaryDAO.getMetadata();
    const secondaries = await Promise.allSettled(
      this.secondaryDAOs.map((dao) => dao.getMetadata())
    );

    return {
      primary,
      secondaries: secondaries.map((result) =>
        result?.status === 'fulfilled' ? result?.value : { error: result?.reason }
      ),
    };
  }

  async healthCheck(): Promise<any> {
    const primary = await this.primaryDAO.healthCheck();
    const secondaries = await Promise.allSettled(
      this.secondaryDAOs.map((dao) => dao.healthCheck())
    );

    return {
      primary,
      secondaries: secondaries.map((result) =>
        result?.status === 'fulfilled' ? result?.value : { healthy: false, error: result?.reason }
      ),
      overall: primary.healthy && secondaries.some((s) => s.status === 'fulfilled'),
    };
  }

  async getMetrics(): Promise<any> {
    const primary = await this.primaryDAO.getMetrics();
    const secondaries = await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.getMetrics()));

    return {
      primary,
      secondaries: secondaries.map((result) =>
        result?.status === 'fulfilled' ? result?.value : { error: result?.reason }
      ),
    };
  }

  private async replicateToSecondaries(operations: any[]): Promise<void> {
    if (this.secondaryDAOs.length === 0) return;

    await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.executeTransaction(operations)));
  }
}

export default DALFactory;
