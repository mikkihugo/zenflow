/**
 * Swarm Database Manager.
 *
 * Uses existing DAL Factory for proper swarm storage with multi-database support:
 * - Central coordination: SQLite/Kuzu via DAL Factory.
 * - Per-swarm clusters: Kuzu (graph) + LanceDB (vectors) + SQLite (data)
 * - Leverages existing repository and DAO patterns.
 */
/**
 * @file Swarm-database management system.
 */
import { EventEmitter } from 'node:events';
import type { DALFactory } from '../../../database/factory.ts';
import type { ICoordinationRepository, IGraphRepository, IVectorRepository } from '../../../database/interfaces.ts';
import { type ILogger } from '../../../di/tokens/core-tokens.ts';
export interface SwarmDatabaseConfig {
    central: {
        type: 'kuzu' | 'sqlite';
        database: string;
    };
    basePath: string;
    swarmsPath: string;
}
export interface SwarmRepositories {
    swarmId: string;
    repositories: {
        graph: IGraphRepository<any>;
        vectors: IVectorRepository<any>;
        coordination: ICoordinationRepository<any>;
    };
    path: string;
}
export declare class SwarmDatabaseManager extends EventEmitter {
    private _config;
    private _dalFactory;
    private _logger;
    private centralRepo;
    private swarmClusters;
    constructor(_config: SwarmDatabaseConfig, _dalFactory: DALFactory, _logger: ILogger);
    /**
     * Initialize central coordination repository.
     */
    initialize(): Promise<void>;
    /**
     * Create per-swarm repository cluster using DAL Factory.
     *
     * @param swarmId
     */
    createSwarmCluster(swarmId: string): Promise<SwarmRepositories>;
    /**
     * Get swarm repository cluster (create if doesn't exist).
     *
     * @param swarmId
     */
    getSwarmCluster(swarmId: string): Promise<SwarmRepositories>;
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
    storeSwarmAgent(swarmId: string, agent: {
        id: string;
        name: string;
        type: string;
        capabilities: string[];
        metadata?: any;
    }): Promise<void>;
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
    storeSwarmTask(swarmId: string, task: {
        id: string;
        title: string;
        description: string;
        assignedAgentId?: string;
        dependencies?: string[];
        metadata?: any;
    }): Promise<void>;
    /**
     * Store vector embedding using LanceDB repository.
     *
     * @param swarmId
     * @param embedding
     * @param embedding.id
     * @param embedding.vector
     * @param embedding.metadata
     */
    storeSwarmEmbedding(swarmId: string, embedding: {
        id: string;
        vector: number[];
        metadata?: any;
    }): Promise<void>;
    /**
     * Find similar embeddings using vector search.
     *
     * @param swarmId
     * @param queryVector
     * @param limit
     */
    findSimilarEmbeddings(swarmId: string, queryVector: number[], limit?: number): Promise<any[]>;
    /**
     * Find swarms by criteria using central repository.
     *
     * @param criteria
     * @param criteria.status
     * @param criteria.type
     * @param criteria.tags
     */
    findSwarms(criteria: {
        status?: 'active' | 'idle' | 'archived';
        type?: string;
        tags?: string[];
    }): Promise<string[]>;
    /**
     * Get swarm graph traversal (find connected agents/tasks).
     *
     * @param swarmId
     * @param startNodeId
     * @param maxDepth
     */
    getSwarmGraph(swarmId: string, startNodeId: string, maxDepth?: number): Promise<any>;
    /**
     * Get cross-swarm dependencies.
     *
     * @param swarmId
     */
    getSwarmDependencies(swarmId: string): Promise<{
        dependencies: string[];
        dependents: string[];
    }>;
    /**
     * Archive swarm cluster (for maintenance manager integration).
     *
     * @param swarmId
     */
    archiveSwarmCluster(swarmId: string): Promise<void>;
    /**
     * Get all active swarms from central repository.
     */
    getActiveSwarms(): Promise<Array<{
        swarmId: string;
        path: string;
        lastAccessed: Date;
    }>>;
    /**
     * Get swarm performance analytics using coordination repository.
     *
     * @param swarmId
     */
    getSwarmAnalytics(swarmId: string): Promise<{
        totalTasks: number;
        completedTasks: number;
        activeTasks: number;
        agentCount: number;
        performance: any;
    }>;
    private initializeCentralSchema;
    private initializeSwarmSchemas;
    private registerSwarmInCentral;
    /**
     * Shutdown all repositories and clear caches.
     */
    shutdown(): Promise<void>;
}
export default SwarmDatabaseManager;
//# sourceMappingURL=swarm-database-manager.d.ts.map