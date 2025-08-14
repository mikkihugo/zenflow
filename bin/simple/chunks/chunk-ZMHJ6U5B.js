
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __decorateClass,
  __decorateParam,
  __name
} from "./chunk-O4JO3PGD.js";

// src/database/factory.ts
function injectable(constructor) {
  return constructor;
}
__name(injectable, "injectable");
function inject(token) {
  return (target, propertyKey, parameterIndex) => {
  };
}
__name(inject, "inject");
var CORE_TOKENS = {
  Logger: "Logger",
  Config: "Config"
};
var DALFactory = class {
  constructor(_logger, _config, databaseProviderFactory) {
    this._logger = _logger;
    this._config = _config;
    this.databaseProviderFactory = databaseProviderFactory;
    this.initializeEntityRegistry();
  }
  repositoryCache = /* @__PURE__ */ new Map();
  daoCache = /* @__PURE__ */ new Map();
  adapterCache = /* @__PURE__ */ new Map();
  entityRegistry = {};
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
  async createRepository(config) {
    const cacheKey = this.generateCacheKey(config);
    if (this.repositoryCache.has(cacheKey)) {
      this["_logger"]?.debug(`Returning cached repository: ${cacheKey}`);
      return this.repositoryCache.get(cacheKey);
    }
    this["_logger"]?.info(
      `Creating new repository: ${config?.["entityType"]} (${config?.["databaseType"]})`
    );
    try {
      const adapter = await this.getOrCreateAdapter(config);
      const repository = await this.createRepositoryInstance(config, adapter);
      this.repositoryCache.set(cacheKey, repository);
      return repository;
    } catch (error) {
      this["_logger"]?.error(`Failed to create repository: ${error}`);
      throw new Error(
        `Repository creation failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
  async createDAO(config) {
    const cacheKey = this.generateCacheKey(config, "dao");
    if (this.daoCache.has(cacheKey)) {
      this["_logger"]?.debug(`Returning cached DAO: ${cacheKey}`);
      return this.daoCache.get(cacheKey);
    }
    this["_logger"]?.info(
      `Creating new DAO: ${config?.["entityType"]} (${config?.["databaseType"]})`
    );
    try {
      const repository = await this.createRepository(config);
      const adapter = await this.getOrCreateAdapter(config);
      const dao = await this.createDAOInstance(config, repository, adapter);
      this.daoCache.set(cacheKey, dao);
      return dao;
    } catch (error) {
      this["_logger"]?.error(`Failed to create DAO: ${error}`);
      throw new Error(
        `DAO creation failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
  registerEntityType(entityType, config) {
    this["_logger"]?.debug(`Registering entity type: ${entityType}`);
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
  getEntityConfig(entityType) {
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
  async createKuzuGraphRepository(entityType, tableName) {
    const config = {
      databaseType: "kuzu",
      entityType,
      tableName: tableName || entityType,
      databaseConfig: this.getDefaultKuzuConfig()
    };
    return await this.createRepository(config);
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
  async createLanceDBVectorRepository(entityType, vectorDimension = 384) {
    const config = {
      databaseType: "lancedb",
      entityType,
      tableName: entityType,
      databaseConfig: this.getDefaultLanceDBConfig(vectorDimension)
    };
    return await this.createRepository(config);
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
  async createCoordinationRepository(entityType) {
    const config = {
      databaseType: "coordination",
      entityType,
      tableName: entityType,
      databaseConfig: {
        type: "sqlite",
        // Use SQLite for coordination by default
        database: "./data/coordination.db"
      }
    };
    return await this.createRepository(config);
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
  async createMemoryRepository(entityType) {
    const config = {
      databaseType: "memory",
      entityType,
      tableName: entityType,
      options: {
        maxSize: 1e3,
        ttlDefault: 3600
        // 1 hour default TTL
      }
    };
    return await this.createRepository(config);
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
  async createMultiDatabaseDAO(entityType, primaryConfig, secondaryConfigs) {
    this["_logger"]?.info(`Creating multi-database DAO for: ${entityType}`);
    const primaryDAO = await this.createDAO(primaryConfig);
    const secondaryDAOs = [];
    if (secondaryConfigs) {
      for (const config of secondaryConfigs) {
        const dao = await this.createDAO(config);
        secondaryDAOs.push(dao);
      }
    }
    return new MultiDatabaseDAO(primaryDAO, secondaryDAOs, this["_logger"]);
  }
  /**
   * Clear all caches.
   */
  clearCaches() {
    this["_logger"]?.info("Clearing DAL factory caches");
    this.repositoryCache.clear();
    this.daoCache.clear();
    this.adapterCache.clear();
  }
  /**
   * Get cache statistics.
   */
  getCacheStats() {
    return {
      repositories: this.repositoryCache.size,
      daos: this.daoCache.size,
      adapters: this.adapterCache.size
    };
  }
  /**
   * Private methods for internal operations.
   */
  async getOrCreateAdapter(config) {
    if (config?.["existingAdapter"]) {
      return config?.["existingAdapter"];
    }
    const adapterCacheKey = this.generateAdapterCacheKey(config);
    if (this.adapterCache.has(adapterCacheKey)) {
      return this.adapterCache.get(adapterCacheKey);
    }
    if (!config?.["databaseConfig"]) {
      throw new Error("Database configuration required when creating new adapter");
    }
    const adapter = await this.databaseProviderFactory.createAdapter(config?.["databaseConfig"]);
    this.adapterCache.set(adapterCacheKey, adapter);
    return adapter;
  }
  async createRepositoryInstance(config, adapter) {
    const { RelationalDao } = await import("./relational.dao-IWXCUAMZ.js");
    const { GraphDao } = await import("./graph.dao-PAE4KG7M.js");
    const { VectorDao } = await import("./vector.dao-NSL76PYH.js");
    const { MemoryDao } = await import("./memory.dao-NTTYSVPO.js");
    const { CoordinationDao } = await import("./coordination.dao-RVGEGISL.js");
    const tableName = config?.["tableName"] || config?.["entityType"];
    const entitySchema = config?.["schema"] || this.entityRegistry[config?.["entityType"]]?.schema;
    switch (config?.["databaseType"]) {
      case "kuzu":
        return new GraphDao(
          adapter,
          this["_logger"],
          tableName,
          entitySchema
        );
      case "lancedb":
        return new VectorDao(
          adapter,
          this["_logger"],
          tableName,
          entitySchema
        );
      case "memory":
        return new MemoryDao(
          // TODO: TypeScript error TS2345 - Argument of type 'DatabaseAdapter' is not assignable to parameter of type 'IMemoryRepository<T>' (AI unsure of safe fix - human review needed)
          adapter,
          this["_logger"],
          tableName,
          entitySchema
        );
      case "coordination":
        return new CoordinationDao(
          // TODO: TypeScript error TS2345 - Argument of type 'DatabaseAdapter' is not assignable to parameter of type 'ICoordinationRepository<T>' (AI unsure of safe fix - human review needed)
          adapter,
          this["_logger"],
          tableName,
          entitySchema
        );
      default:
        return new RelationalDao(
          adapter,
          this["_logger"],
          tableName,
          entitySchema
        );
    }
  }
  async createDAOInstance(config, repository, adapter) {
    const { RelationalDao } = await import("./relational.dao-IWXCUAMZ.js");
    const { GraphDao } = await import("./graph.dao-PAE4KG7M.js");
    const { VectorDao } = await import("./vector.dao-NSL76PYH.js");
    const { MemoryDao } = await import("./memory.dao-NTTYSVPO.js");
    const { CoordinationDao } = await import("./coordination.dao-RVGEGISL.js");
    switch (config?.["databaseType"]) {
      case "kuzu":
        return new GraphDao(repository, adapter, this["_logger"]);
      case "lancedb":
        return new VectorDao(repository, adapter, this["_logger"]);
      case "memory":
        return new MemoryDao(repository, adapter, this["_logger"]);
      case "coordination":
        return new CoordinationDao(
          repository,
          adapter,
          this["_logger"]
        );
      default:
        return new RelationalDao(repository, adapter, this["_logger"]);
    }
  }
  generateCacheKey(config, type = "repo") {
    const parts = [
      type,
      config?.["databaseType"],
      config?.["entityType"],
      config?.["tableName"] || config?.["entityType"],
      JSON.stringify(config?.["options"] || {})
    ];
    return parts.join(":");
  }
  generateAdapterCacheKey(config) {
    if (config?.["existingAdapter"]) {
      return `existing:${Date.now()}`;
    }
    return [
      config?.["databaseType"],
      config?.["databaseConfig"]?.host || "localhost",
      config?.["databaseConfig"]?.database || "default",
      config?.["databaseConfig"]?.port || "default"
    ].join(":");
  }
  getDefaultKuzuConfig() {
    return {
      type: "kuzu",
      database: "./data/kuzu-graph.db",
      options: {
        bufferPoolSize: "1GB",
        maxNumThreads: 4
      }
    };
  }
  getDefaultLanceDBConfig(vectorDimension) {
    return {
      type: "lancedb",
      database: "./data/lancedb-vectors.db",
      options: {
        vectorSize: vectorDimension,
        metricType: "cosine",
        indexType: "IVF_PQ"
      }
    };
  }
  initializeEntityRegistry() {
    this.registerEntityType("SwarmAgent", {
      schema: {
        id: { type: "string", primaryKey: true },
        name: { type: "string", required: true },
        type: { type: "string", required: true },
        status: { type: "string", default: "inactive" },
        metadata: { type: "json" },
        createdAt: { type: "datetime", default: "now" },
        updatedAt: { type: "datetime", default: "now" }
      },
      primaryKey: "id",
      tableName: "swarm_agents",
      databaseType: "coordination"
    });
    this.registerEntityType("MemoryEntry", {
      schema: {
        id: { type: "string", primaryKey: true },
        key: { type: "string", required: true, unique: true },
        value: { type: "json", required: true },
        ttl: { type: "number" },
        createdAt: { type: "datetime", default: "now" },
        accessedAt: { type: "datetime" }
      },
      primaryKey: "id",
      tableName: "memory_entries",
      databaseType: "memory"
    });
    this.registerEntityType("VectorDocument", {
      schema: {
        id: { type: "string", primaryKey: true },
        vector: { type: "vector", required: true },
        metadata: { type: "json" },
        timestamp: { type: "datetime", default: "now" }
      },
      primaryKey: "id",
      tableName: "vector_documents",
      databaseType: "lancedb"
    });
    this.registerEntityType("GraphNode", {
      schema: {
        id: { type: "string", primaryKey: true },
        labels: { type: "array" },
        properties: { type: "json" },
        createdAt: { type: "datetime", default: "now" }
      },
      primaryKey: "id",
      tableName: "nodes",
      databaseType: "kuzu"
    });
  }
};
__name(DALFactory, "DALFactory");
DALFactory = __decorateClass([
  injectable,
  __decorateParam(0, inject(CORE_TOKENS.Logger)),
  __decorateParam(1, inject(CORE_TOKENS.Config))
], DALFactory);
var MultiDatabaseDAO = class {
  constructor(primaryDAO, secondaryDAOs, logger) {
    this.primaryDAO = primaryDAO;
    this.secondaryDAOs = secondaryDAOs;
    this.logger = logger;
  }
  static {
    __name(this, "MultiDatabaseDAO");
  }
  getRepository() {
    return this.primaryDAO.getRepository();
  }
  async executeTransaction(operations) {
    const primaryResult = await this.primaryDAO.executeTransaction(operations);
    this.replicateToSecondaries(operations).catch((error) => {
      this.logger.warn(`Secondary replication failed: ${error}`);
    });
    return primaryResult;
  }
  async getMetadata() {
    const primary = await this.primaryDAO.getMetadata();
    const secondaries = await Promise.allSettled(
      this.secondaryDAOs.map((dao) => dao.getMetadata())
    );
    return {
      primary,
      secondaries: secondaries.map(
        (result) => result?.status === "fulfilled" ? result?.value : { error: result?.reason }
      )
    };
  }
  async healthCheck() {
    const primary = await this.primaryDAO.healthCheck();
    const secondaries = await Promise.allSettled(
      this.secondaryDAOs.map((dao) => dao.healthCheck())
    );
    return {
      primary,
      secondaries: secondaries.map(
        (result) => result?.status === "fulfilled" ? result?.value : { healthy: false, error: result?.reason }
      ),
      overall: primary.healthy && secondaries.some((s) => s.status === "fulfilled")
    };
  }
  async getMetrics() {
    const primary = await this.primaryDAO.getMetrics();
    const secondaries = await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.getMetrics()));
    return {
      primary,
      secondaries: secondaries.map(
        (result) => result?.status === "fulfilled" ? result?.value : { error: result?.reason }
      )
    };
  }
  async replicateToSecondaries(operations) {
    if (this.secondaryDAOs.length === 0) return;
    await Promise.allSettled(this.secondaryDAOs.map((dao) => dao.executeTransaction(operations)));
  }
};
var factory_default = DALFactory;

export {
  DALFactory,
  MultiDatabaseDAO,
  factory_default
};
//# sourceMappingURL=chunk-ZMHJ6U5B.js.map
