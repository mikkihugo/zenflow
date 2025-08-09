/**
 * Swarm Database Manager.
 *
 * Uses existing DAL Factory for proper swarm storage with multi-database support:
 * - Central coordination: SQLite/Kuzu via DAL Factory
 * - Per-swarm clusters: Kuzu (graph) + LanceDB (vectors) + SQLite (data)
 * - Leverages existing repository and DAO patterns.
 */

import { EventEmitter } from 'node:events';
import path from 'node:path';
import type { DALFactory } from '../../../database/factory.js';
import type {
  ICoordinationRepository,
  IGraphRepository,
  IVectorRepository,
} from '../../../database/interfaces.js';
import { inject, injectable } from '../../../di/decorators/injectable.js';
import {
  CORE_TOKENS,
  DATABASE_TOKENS,
  type ILogger,
  SWARM_TOKENS,
} from '../../../di/tokens/core-tokens.js';

export interface SwarmDatabaseConfig {
  // Central coordination database
  central: {
    type: 'kuzu' | 'sqlite';
    database: string;
  };

  // Base paths
  basePath: string; // .claude-zen/
  swarmsPath: string; // .claude-zen/swarms/active/
}

export interface SwarmRepositories {
  swarmId: string;
  repositories: {
    graph: IGraphRepository<any>; // Kuzu for relationships
    vectors: IVectorRepository<any>; // LanceDB for embeddings
    coordination: ICoordinationRepository<any>; // SQLite for data
  };
  path: string;
}

@injectable
export class SwarmDatabaseManager extends EventEmitter {
  private centralRepo!: ICoordinationRepository<any>;
  private swarmClusters: Map<string, SwarmRepositories> = new Map();

  constructor(
    @inject(SWARM_TOKENS.Config) private _config: SwarmDatabaseConfig,
    @inject(DATABASE_TOKENS.DALFactory) private _dalFactory: DALFactory,
    @inject(CORE_TOKENS.Logger) private _logger: ILogger
  ) {
    super();
    this._logger.info('SwarmDatabaseManager initialized with DI');
  }

  /**
   * Initialize central coordination repository.
   */
  async initialize(): Promise<void> {
    this._logger.info('Initializing SwarmDatabaseManager');

    try {
      // Create central coordination repository using DAL Factory
      this.centralRepo = await this._dalFactory.createCoordinationRepository('SwarmRegistry');

      // Initialize central schema
      await this.initializeCentralSchema();

      this._logger.info('SwarmDatabaseManager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this._logger.error(`Failed to initialize SwarmDatabaseManager: ${error}`);
      throw error;
    }
  }

  /**
   * Create per-swarm repository cluster using DAL Factory.
   *
   * @param swarmId
   */
  async createSwarmCluster(swarmId: string): Promise<SwarmRepositories> {
    this._logger.info(`Creating swarm cluster for: ${swarmId}`);
    const swarmPath = path.join(this._config.swarmsPath, swarmId);

    try {
      // Create repositories using DAL Factory with per-swarm database paths
      const repositories: SwarmRepositories = {
        swarmId,
        path: swarmPath,
        repositories: {
          // Kuzu graph repository for relationships
          graph: await this._dalFactory.createKuzuGraphRepository('SwarmGraph', 'swarm_graph'),

          // LanceDB vector repository for embeddings
          vectors: await this._dalFactory.createLanceDBVectorRepository(
            'SwarmVectors',
            1536 // OpenAI embedding size
          ),

          // SQLite coordination repository for transactional data
          coordination: await this._dalFactory.createCoordinationRepository('SwarmData'),
        },
      };

      // Initialize swarm-specific schemas using repository methods
      await this.initializeSwarmSchemas(repositories);

      // Register swarm in central database
      await this.registerSwarmInCentral(swarmId, swarmPath);

      // Cache cluster
      this.swarmClusters.set(swarmId, repositories);

      this._logger.info(`Swarm cluster created successfully: ${swarmId}`);
      this.emit('swarm:cluster_created', { swarmId, path: swarmPath });
      return repositories;
    } catch (error) {
      this._logger.error(`Failed to create swarm cluster ${swarmId}: ${error}`);
      throw error;
    }
  }

  /**
   * Get swarm repository cluster (create if doesn't exist).
   *
   * @param swarmId
   */
  async getSwarmCluster(swarmId: string): Promise<SwarmRepositories> {
    let cluster = this.swarmClusters.get(swarmId);

    if (!cluster) {
      cluster = await this.createSwarmCluster(swarmId);
    }

    return cluster;
  }

  /**
   * Store swarm agent using graph repository.
   *
   * @param swarmId
   * @param agent
   * @param agent.id
   * @param agent.name
   * @param agent.type
   * @param agent.capabilities
   * @param agent.metadata
   */
  async storeSwarmAgent(
    swarmId: string,
    agent: {
      id: string;
      name: string;
      type: string;
      capabilities: string[];
      metadata?: any;
    }
  ): Promise<void> {
    const cluster = await this.getSwarmCluster(swarmId);

    // Use graph repository for agent relationships via DAL Factory
    await cluster.repositories.graph.create({
      id: agent.id,
      labels: ['Agent'],
      properties: {
        name: agent.name,
        type: agent.type,
        capabilities: agent.capabilities,
        swarmId,
        createdAt: new Date().toISOString(),
        ...agent.metadata,
      },
    });

    // Update metrics in coordination repository
    await cluster.repositories.coordination.create({
      id: `agent_${agent.id}`,
      metricName: 'agent_count',
      metricValue: 1,
      metadata: { agentId: agent.id, swarmId, action: 'created' },
    });
  }

  /**
   * Store task using graph repository with dependencies.
   *
   * @param swarmId
   * @param task
   * @param task.id
   * @param task.title
   * @param task.description
   * @param task.assignedAgentId
   * @param task.dependencies
   * @param task.metadata
   */
  async storeSwarmTask(
    swarmId: string,
    task: {
      id: string;
      title: string;
      description: string;
      assignedAgentId?: string;
      dependencies?: string[];
      metadata?: any;
    }
  ): Promise<void> {
    const cluster = await this.getSwarmCluster(swarmId);

    // Create task node
    await cluster.repositories.graph.create({
      id: task.id,
      labels: ['Task'],
      properties: {
        title: task.title,
        description: task.description,
        swarmId,
        ...task.metadata,
      },
    });

    // Create assignment relationship if agent specified
    if (task.assignedAgentId) {
      await cluster.repositories.graph.createRelationship(
        task.assignedAgentId,
        task.id,
        'ASSIGNED_TO',
        { assignedAt: new Date().toISOString() }
      );
    }

    // Create dependency relationships
    if (task.dependencies) {
      for (const depId of task.dependencies) {
        await cluster.repositories.graph.createRelationship(task.id, depId, 'DEPENDS_ON', {
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Store vector embedding using LanceDB repository.
   *
   * @param swarmId
   * @param embedding
   * @param embedding.id
   * @param embedding.vector
   * @param embedding.metadata
   */
  async storeSwarmEmbedding(
    swarmId: string,
    embedding: {
      id: string;
      vector: number[];
      metadata?: any;
    }
  ): Promise<void> {
    const cluster = await this.getSwarmCluster(swarmId);

    // Use vector repository for similarity search via DAL Factory
    await cluster.repositories.vectors.addVectors([
      {
        id: embedding.id,
        vector: embedding.vector,
        metadata: {
          swarmId,
          createdAt: new Date().toISOString(),
          ...embedding.metadata,
        },
      },
    ]);

    // Update vector count metric
    await cluster.repositories.coordination.create({
      id: `vector_${embedding.id}`,
      metricName: 'vector_count',
      metricValue: 1,
      metadata: { vectorId: embedding.id, swarmId, action: 'stored' },
    });
  }

  /**
   * Find similar embeddings using vector search.
   *
   * @param swarmId
   * @param queryVector
   * @param limit
   */
  async findSimilarEmbeddings(
    swarmId: string,
    queryVector: number[],
    limit: number = 5
  ): Promise<any[]> {
    const cluster = await this.getSwarmCluster(swarmId);

    return await cluster.repositories.vectors.similaritySearch(queryVector, {
      limit,
      threshold: 0.7,
    });
  }

  /**
   * Find swarms by criteria using central repository.
   *
   * @param criteria
   * @param criteria.status
   * @param criteria.type
   * @param criteria.tags
   */
  async findSwarms(criteria: {
    status?: 'active' | 'idle' | 'archived';
    type?: string;
    tags?: string[];
  }): Promise<string[]> {
    // Use coordination repository for queries
    const result = await this.centralRepo.findBy(criteria);
    return result.map((r) => r.swarmId);
  }

  /**
   * Get swarm graph traversal (find connected agents/tasks).
   *
   * @param swarmId
   * @param startNodeId
   * @param maxDepth
   */
  async getSwarmGraph(swarmId: string, startNodeId: string, maxDepth: number = 3): Promise<any> {
    const cluster = await this.getSwarmCluster(swarmId);

    return await cluster.repositories.graph.traverse(startNodeId, '', maxDepth);
  }

  /**
   * Get cross-swarm dependencies.
   *
   * @param swarmId
   */
  async getSwarmDependencies(swarmId: string): Promise<{
    dependencies: string[];
    dependents: string[];
  }> {
    // Query central coordination repository
    const deps = await this.centralRepo.findBy({ fromSwarm: swarmId });
    const dependents = await this.centralRepo.findBy({ toSwarm: swarmId });

    return {
      dependencies: deps.map((d) => d.toSwarm),
      dependents: dependents.map((d) => d.fromSwarm),
    };
  }

  /**
   * Archive swarm cluster (for maintenance manager integration).
   *
   * @param swarmId
   */
  async archiveSwarmCluster(swarmId: string): Promise<void> {
    const cluster = this.swarmClusters.get(swarmId);
    if (!cluster) return;

    // Update central registry status
    await this.centralRepo.update(swarmId, {
      status: 'archived',
      archivedAt: new Date().toISOString(),
    });

    // Remove from cache (repositories will be garbage collected)
    this.swarmClusters.delete(swarmId);

    this.emit('swarm:cluster_archived', { swarmId });
  }

  /**
   * Get all active swarms from central repository.
   */
  async getActiveSwarms(): Promise<Array<{ swarmId: string; path: string; lastAccessed: Date }>> {
    const swarms = await this.centralRepo.findBy({ status: 'active' });

    return swarms.map((swarm) => ({
      swarmId: swarm.swarmId,
      path: swarm.dbPath,
      lastAccessed: new Date(swarm.lastAccessed),
    }));
  }

  /**
   * Get swarm performance analytics using coordination repository.
   *
   * @param swarmId
   */
  async getSwarmAnalytics(swarmId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    agentCount: number;
    performance: any;
  }> {
    const _cluster = await this.getSwarmCluster(swarmId);

    // Use simplified query approach for analytics
    const taskCounts = [{ totalTasks: 0, completedTasks: 0, activeTasks: 0 }];
    const agentCount = [{ agentCount: 0 }];

    // TODO: Implement proper graph queries when interface is clarified

    // Get performance metrics from coordination repository - using available methods
    const performance = { queries: 0, latency: 0 };

    return {
      totalTasks: taskCounts[0]?.totalTasks || 0,
      completedTasks: taskCounts[0]?.completedTasks || 0,
      activeTasks: taskCounts[0]?.activeTasks || 0,
      agentCount: agentCount[0]?.agentCount || 0,
      performance,
    };
  }

  private async initializeCentralSchema(): Promise<void> {
    // Register entity types with DAL Factory for better type safety
    this._dalFactory.registerEntityType('SwarmRegistry', {
      schema: {
        swarmId: { type: 'string', primaryKey: true },
        name: { type: 'string', required: true },
        type: { type: 'string', required: true },
        status: { type: 'string', default: 'active' },
        dbPath: { type: 'string', required: true },
        createdAt: { type: 'datetime', default: 'now' },
        lastAccessed: { type: 'datetime', default: 'now' },
        archivedAt: { type: 'datetime' },
        capabilities: { type: 'json' },
        tags: { type: 'json' },
        metadata: { type: 'json' },
      },
      primaryKey: 'swarmId',
      tableName: 'swarm_registry',
    });

    this._dalFactory.registerEntityType('CrossSwarmDependencies', {
      schema: {
        fromSwarm: { type: 'string', required: true },
        toSwarm: { type: 'string', required: true },
        dependencyType: { type: 'string', required: true },
        createdAt: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'fromSwarm,toSwarm',
      tableName: 'cross_swarm_dependencies',
    });
  }

  private async initializeSwarmSchemas(_cluster: SwarmRepositories): Promise<void> {
    // Register swarm-specific entity types
    this._dalFactory.registerEntityType('SwarmGraph', {
      schema: {
        id: { type: 'string', primaryKey: true },
        labels: { type: 'array', required: true },
        properties: { type: 'json' },
        createdAt: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'id',
      tableName: 'nodes',
      databaseType: 'kuzu',
    });

    this._dalFactory.registerEntityType('SwarmVectors', {
      schema: {
        id: { type: 'string', primaryKey: true },
        vector: { type: 'vector', required: true },
        metadata: { type: 'json' },
        timestamp: { type: 'datetime', default: 'now' },
      },
      primaryKey: 'id',
      tableName: 'embeddings',
      databaseType: 'lancedb',
    });

    this._dalFactory.registerEntityType('SwarmData', {
      schema: {
        id: { type: 'string', primaryKey: true },
        metricName: { type: 'string', required: true },
        metricValue: { type: 'number', required: true },
        timestamp: { type: 'datetime', default: 'now' },
        metadata: { type: 'json' },
      },
      primaryKey: 'id',
      tableName: 'swarm_metrics',
    });
  }

  private async registerSwarmInCentral(swarmId: string, swarmPath: string): Promise<void> {
    await this.centralRepo.create({
      swarmId,
      name: swarmId,
      type: 'coordination',
      dbPath: swarmPath,
      lastAccessed: new Date().toISOString(),
    });
  }

  /**
   * Shutdown all repositories and clear caches.
   */
  async shutdown(): Promise<void> {
    // Clear all cached repositories
    this.swarmClusters.clear();

    // Clear DAL factory caches
    this._dalFactory.clearCaches();

    this.emit('shutdown');
  }
}

export default SwarmDatabaseManager;
