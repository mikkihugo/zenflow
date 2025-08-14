var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { EventEmitter } from 'node:events';
import path from 'node:path';
import { inject, injectable } from '../../../di/decorators/injectable.ts';
import { CORE_TOKENS, DATABASE_TOKENS, SWARM_TOKENS, } from '../../../di/tokens/core-tokens.ts';
let SwarmDatabaseManager = class SwarmDatabaseManager extends EventEmitter {
    _config;
    _dalFactory;
    _logger;
    centralRepo;
    swarmClusters = new Map();
    constructor(_config, _dalFactory, _logger) {
        super();
        this._config = _config;
        this._dalFactory = _dalFactory;
        this._logger = _logger;
        this._logger.info('SwarmDatabaseManager initialized with DI');
    }
    async initialize() {
        this._logger.info('Initializing SwarmDatabaseManager');
        try {
            this.centralRepo = await this._dalFactory.createCoordinationRepository('SwarmRegistry');
            await this.initializeCentralSchema();
            this._logger.info('SwarmDatabaseManager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this._logger.error(`Failed to initialize SwarmDatabaseManager: ${error}`);
            throw error;
        }
    }
    async createSwarmCluster(swarmId) {
        this._logger.info(`Creating swarm cluster for: ${swarmId}`);
        const swarmPath = path.join(this._config.swarmsPath, swarmId);
        try {
            const repositories = {
                swarmId,
                path: swarmPath,
                repositories: {
                    graph: await this._dalFactory.createKuzuGraphRepository('SwarmGraph', 'swarm_graph'),
                    vectors: await this._dalFactory.createLanceDBVectorRepository('SwarmVectors', 1536),
                    coordination: await this._dalFactory.createCoordinationRepository('SwarmData'),
                },
            };
            await this.initializeSwarmSchemas(repositories);
            await this.registerSwarmInCentral(swarmId, swarmPath);
            this.swarmClusters.set(swarmId, repositories);
            this._logger.info(`Swarm cluster created successfully: ${swarmId}`);
            this.emit('swarm:cluster_created', { swarmId, path: swarmPath });
            return repositories;
        }
        catch (error) {
            this._logger.error(`Failed to create swarm cluster ${swarmId}: ${error}`);
            throw error;
        }
    }
    async getSwarmCluster(swarmId) {
        let cluster = this.swarmClusters.get(swarmId);
        if (!cluster) {
            cluster = await this.createSwarmCluster(swarmId);
        }
        return cluster;
    }
    async storeSwarmAgent(swarmId, agent) {
        const cluster = await this.getSwarmCluster(swarmId);
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
        await cluster.repositories.coordination.create({
            id: `agent_${agent.id}`,
            metricName: 'agent_count',
            metricValue: 1,
            metadata: { agentId: agent.id, swarmId, action: 'created' },
        });
    }
    async storeSwarmTask(swarmId, task) {
        const cluster = await this.getSwarmCluster(swarmId);
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
        if (task.assignedAgentId) {
            await cluster.repositories.graph.createRelationship(task.assignedAgentId, task.id, 'ASSIGNED_TO', { assignedAt: new Date().toISOString() });
        }
        if (task.dependencies) {
            for (const depId of task.dependencies) {
                await cluster.repositories.graph.createRelationship(task.id, depId, 'DEPENDS_ON', {
                    createdAt: new Date().toISOString(),
                });
            }
        }
    }
    async storeSwarmEmbedding(swarmId, embedding) {
        const cluster = await this.getSwarmCluster(swarmId);
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
        await cluster.repositories.coordination.create({
            id: `vector_${embedding.id}`,
            metricName: 'vector_count',
            metricValue: 1,
            metadata: { vectorId: embedding.id, swarmId, action: 'stored' },
        });
    }
    async findSimilarEmbeddings(swarmId, queryVector, limit = 5) {
        const cluster = await this.getSwarmCluster(swarmId);
        return await cluster.repositories.vectors.similaritySearch(queryVector, {
            limit,
            threshold: 0.7,
        });
    }
    async findSwarms(criteria) {
        const result = await this.centralRepo.findBy(criteria);
        return result?.map((r) => r.swarmId);
    }
    async getSwarmGraph(swarmId, startNodeId, maxDepth = 3) {
        const cluster = await this.getSwarmCluster(swarmId);
        return await cluster.repositories.graph.traverse(startNodeId, '', maxDepth);
    }
    async getSwarmDependencies(swarmId) {
        const deps = await this.centralRepo.findBy({ fromSwarm: swarmId });
        const dependents = await this.centralRepo.findBy({ toSwarm: swarmId });
        return {
            dependencies: deps.map((d) => d.toSwarm),
            dependents: dependents.map((d) => d.fromSwarm),
        };
    }
    async archiveSwarmCluster(swarmId) {
        const cluster = this.swarmClusters.get(swarmId);
        if (!cluster)
            return;
        await this.centralRepo.update(swarmId, {
            status: 'archived',
            archivedAt: new Date().toISOString(),
        });
        this.swarmClusters.delete(swarmId);
        this.emit('swarm:cluster_archived', { swarmId });
    }
    async getActiveSwarms() {
        const swarms = await this.centralRepo.findBy({ status: 'active' });
        return swarms.map((swarm) => ({
            swarmId: swarm.swarmId,
            path: swarm.dbPath,
            lastAccessed: new Date(swarm.lastAccessed),
        }));
    }
    async getSwarmAnalytics(swarmId) {
        const _cluster = await this.getSwarmCluster(swarmId);
        const taskCounts = [{ totalTasks: 0, completedTasks: 0, activeTasks: 0 }];
        const agentCount = [{ agentCount: 0 }];
        const performance = { queries: 0, latency: 0 };
        return {
            totalTasks: taskCounts[0]?.totalTasks || 0,
            completedTasks: taskCounts[0]?.completedTasks || 0,
            activeTasks: taskCounts[0]?.activeTasks || 0,
            agentCount: agentCount[0]?.agentCount || 0,
            performance,
        };
    }
    async initializeCentralSchema() {
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
    async initializeSwarmSchemas(_cluster) {
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
    async registerSwarmInCentral(swarmId, swarmPath) {
        await this.centralRepo.create({
            swarmId,
            name: swarmId,
            type: 'coordination',
            dbPath: swarmPath,
            lastAccessed: new Date().toISOString(),
        });
    }
    async shutdown() {
        this.swarmClusters.clear();
        this._dalFactory.clearCaches();
        this.emit('shutdown');
    }
};
SwarmDatabaseManager = __decorate([
    injectable,
    __param(0, inject(SWARM_TOKENS.Config)),
    __param(1, inject(DATABASE_TOKENS.DALFactory)),
    __param(2, inject(CORE_TOKENS.Logger)),
    __metadata("design:paramtypes", [Object, Function, Object])
], SwarmDatabaseManager);
export { SwarmDatabaseManager };
export default SwarmDatabaseManager;
//# sourceMappingURL=swarm-database-manager.js.map