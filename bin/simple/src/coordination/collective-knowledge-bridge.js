import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
import { getHiveFACT, } from './hive-fact-integration.ts';
const logger = getLogger('Hive-Knowledge-Bridge');
export class CollectiveKnowledgeBridge extends EventEmitter {
    hiveFact;
    hiveCoordinator;
    memoryStore;
    subscribedSwarms = new Map();
    pendingRequests = new Map();
    contributionQueue = new Map();
    isInitialized = false;
    constructor(hiveCoordinator, memoryStore) {
        super();
        if (hiveCoordinator !== undefined) {
            this.hiveCoordinator = hiveCoordinator;
        }
        if (memoryStore !== undefined) {
            this.memoryStore = memoryStore;
        }
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            logger.info('Initializing Hive Knowledge Bridge...');
            const fact = getHiveFACT();
            if (!fact) {
                throw new Error('HiveFACT system not available. Initialize HiveSwarmCoordinator first.');
            }
            this.hiveFact = fact;
            this.setupEventHandlers();
            this.startContributionProcessor();
            this.setupKnowledgeDistribution();
            this.isInitialized = true;
            this.emit('bridge:initialized');
            logger.info('Hive Knowledge Bridge initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Hive Knowledge Bridge:', error);
            throw error;
        }
    }
    async registerSwarm(swarmId, interests = []) {
        logger.info(`Registering swarm ${swarmId} with knowledge bridge`);
        if (!this.subscribedSwarms.has(swarmId)) {
            this.subscribedSwarms.set(swarmId, new Set());
        }
        const swarmInterests = this.subscribedSwarms.get(swarmId);
        interests.forEach((domain) => swarmInterests.add(domain));
        if (this.memoryStore) {
            await this.memoryStore.store(`hive-bridge/swarms/${swarmId}`, 'registration', {
                swarmId,
                interests: Array.from(swarmInterests),
                registeredAt: Date.now(),
            });
        }
        this.emit('swarm:registered', { swarmId, interests });
    }
    async processKnowledgeRequest(request) {
        const startTime = Date.now();
        logger.debug(`Processing knowledge request ${request.requestId} from swarm ${request.swarmId}`);
        try {
            this.pendingRequests.set(request.requestId, request);
            let response;
            switch (request.type) {
                case 'query':
                    response = await this.handleKnowledgeQuery(request);
                    break;
                case 'contribution':
                    response = await this.handleKnowledgeContribution(request);
                    break;
                case 'update':
                    response = await this.handleKnowledgeUpdate(request);
                    break;
                case 'subscribe':
                    response = await this.handleKnowledgeSubscription(request);
                    break;
                default:
                    throw new Error(`Unsupported request type: ${request.type}`);
            }
            if (response) {
                response.metadata.timestamp = Date.now();
            }
            this.pendingRequests.delete(request.requestId);
            const duration = Date.now() - startTime;
            logger.debug(`Knowledge request ${request.requestId} completed in ${duration}ms`);
            return response;
        }
        catch (error) {
            logger.error(`Failed to process knowledge request ${request.requestId}:`, error);
            this.pendingRequests.delete(request.requestId);
            return {
                requestId: request.requestId,
                swarmId: request.swarmId,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    source: 'hive-fact',
                    timestamp: Date.now(),
                    confidence: 0,
                    cacheHit: false,
                },
            };
        }
    }
    async handleKnowledgeQuery(request) {
        const { query, domain, filters = {} } = request.payload;
        if (!query) {
            throw new Error('Query is required for knowledge query request');
        }
        const searchQuery = {
            query,
            limit: filters['limit'] || 10,
            sortBy: filters['sortBy'] ||
                'relevance',
        };
        if (domain) {
            searchQuery.domains = [domain];
        }
        const searchResults = (await this.hiveFact?.searchFacts(searchQuery)) ?? [];
        const enhancedResults = await this.enhanceResultsWithSwarmContext(searchResults ?? [], request.swarmId, request.agentId);
        return {
            requestId: request.requestId,
            swarmId: request.swarmId,
            success: true,
            data: {
                results: enhancedResults,
                total: searchResults?.length ?? 0,
                query,
                domain,
            },
            metadata: {
                source: 'hive-fact',
                timestamp: Date.now(),
                confidence: this.calculateAverageConfidence(searchResults ?? []),
                cacheHit: searchResults?.some((r) => (r.accessCount ?? 0) > 1) ??
                    false,
            },
        };
    }
    async handleKnowledgeContribution(request) {
        const contribution = request.payload.knowledge;
        if (!contribution) {
            throw new Error('Knowledge contribution data is required');
        }
        if (!this.contributionQueue.has(request.swarmId)) {
            this.contributionQueue.set(request.swarmId, []);
        }
        this.contributionQueue.get(request.swarmId)?.push({
            ...contribution,
            swarmId: request.swarmId,
            timestamp: Date.now(),
        });
        if (this.memoryStore) {
            await this.memoryStore.store(`hive-bridge/contributions/${request.swarmId}/${Date.now()}`, 'contribution', contribution);
        }
        this.emit('knowledge:contributed', {
            swarmId: request.swarmId,
            contribution,
        });
        return {
            requestId: request.requestId,
            swarmId: request.swarmId,
            success: true,
            data: {
                contributionId: `${request.swarmId}_${Date.now()}`,
                status: 'queued-for-processing',
            },
            metadata: {
                source: 'swarm-contribution',
                timestamp: Date.now(),
                confidence: contribution.confidence,
                cacheHit: false,
            },
        };
    }
    async handleKnowledgeUpdate(request) {
        const updateData = request.payload.knowledge;
        if (!(updateData && updateData?.factId)) {
            throw new Error('Fact ID is required for knowledge update');
        }
        this.emit('knowledge:update-requested', {
            swarmId: request.swarmId,
            factId: updateData?.factId,
            updates: updateData?.updates,
            timestamp: Date.now(),
        });
        return {
            requestId: request.requestId,
            swarmId: request.swarmId,
            success: true,
            data: {
                status: 'update-queued',
                factId: updateData?.factId,
            },
            metadata: {
                source: 'swarm-contribution',
                timestamp: Date.now(),
                confidence: 0.8,
                cacheHit: false,
            },
        };
    }
    async handleKnowledgeSubscription(request) {
        const { domain } = request.payload;
        if (!domain) {
            throw new Error('Domain is required for knowledge subscription');
        }
        await this.registerSwarm(request.swarmId, [domain]);
        return {
            requestId: request.requestId,
            swarmId: request.swarmId,
            success: true,
            data: {
                subscribed: true,
                domain,
                status: 'active',
            },
            metadata: {
                source: 'hive-fact',
                timestamp: Date.now(),
                confidence: 1.0,
                cacheHit: false,
            },
        };
    }
    async enhanceResultsWithSwarmContext(results, swarmId, agentId) {
        const enhancedResults = [];
        for (const fact of results) {
            const enhanced = {
                ...fact,
                swarmContext: {
                    relevanceScore: this.calculateSwarmRelevance(fact, swarmId),
                    usageHistory: fact.swarmAccess.has(swarmId)
                        ? 'previously-used'
                        : 'new',
                    agentCompatibility: agentId
                        ? this.calculateAgentCompatibility(fact, agentId)
                        : undefined,
                },
            };
            enhancedResults?.push(enhanced);
        }
        return enhancedResults?.sort((a, b) => b.swarmContext.relevanceScore - a.swarmContext.relevanceScore);
    }
    calculateSwarmRelevance(fact, swarmId) {
        let relevance = fact.metadata.confidence;
        if (fact.swarmAccess.has(swarmId)) {
            relevance += 0.2;
        }
        const relatedSwarms = this.findRelatedSwarms(swarmId);
        const usedByRelated = Array.from(fact.swarmAccess).some((id) => relatedSwarms.includes(id));
        if (usedByRelated) {
            relevance += 0.1;
        }
        return Math.min(1.0, relevance);
    }
    calculateAgentCompatibility(_fact, _agentId) {
        return 0.8;
    }
    findRelatedSwarms(_swarmId) {
        return [];
    }
    calculateAverageConfidence(results) {
        if (results.length === 0)
            return 0;
        const total = results.reduce((sum, fact) => sum + fact.metadata.confidence, 0);
        return total / results.length;
    }
    setupEventHandlers() {
        if (this.hiveFact) {
            this.hiveFact.on('fact-updated', (data) => {
                this.distributeKnowledgeUpdate({
                    updateId: `fact-update-${Date.now()}`,
                    type: 'fact-updated',
                    domain: data?.type,
                    priority: 'medium',
                    content: data?.fact,
                    timestamp: Date.now(),
                });
            });
            this.hiveFact.on('fact-refreshed', (data) => {
                this.distributeKnowledgeUpdate({
                    updateId: `fact-refresh-${Date.now()}`,
                    type: 'fact-updated',
                    domain: data?.fact?.type,
                    priority: 'low',
                    content: data?.fact,
                    timestamp: Date.now(),
                });
            });
        }
        if (this.hiveCoordinator) {
            this.hiveCoordinator.on('swarm:registered', (data) => {
                this.registerSwarm(data?.swarmId, []).catch((error) => {
                    logger.error(`Failed to register swarm ${data?.swarmId}:`, error);
                });
            });
        }
    }
    startContributionProcessor() {
        setInterval(() => {
            this.processContributionQueue().catch((error) => {
                logger.error('Error processing contribution queue:', error);
            });
        }, 10000);
    }
    async processContributionQueue() {
        for (const [swarmId, contributions] of this.contributionQueue) {
            if (contributions.length === 0)
                continue;
            logger.debug(`Processing ${contributions.length} contributions from swarm ${swarmId}`);
            const processedContributions = [];
            for (const contribution of contributions) {
                try {
                    await this.processSwarmContribution(contribution);
                    processedContributions.push(contribution);
                }
                catch (error) {
                    logger.error(`Failed to process contribution from ${swarmId}:`, error);
                }
            }
            this.contributionQueue.set(swarmId, contributions.filter((c) => !processedContributions.includes(c)));
        }
    }
    async processSwarmContribution(contribution) {
        if (contribution.confidence < 0.6) {
            logger.debug(`Skipping low-confidence contribution from ${contribution.swarmId}`);
            return;
        }
        const fact = {
            type: 'general',
            subject: contribution.content.title,
            content: {
                type: contribution.contributionType,
                description: contribution.content.description,
                implementation: contribution.content.implementation,
                metrics: contribution.content.metrics,
                context: contribution.content.context,
                contributedBy: {
                    swarmId: contribution.swarmId,
                    agentId: contribution.agentId,
                    timestamp: contribution.timestamp,
                },
            },
            metadata: {
                source: `swarm-${contribution.swarmId}`,
                timestamp: contribution.timestamp,
                confidence: contribution.confidence,
            },
        };
        if (this.memoryStore) {
            await this.memoryStore.store(`hive-bridge/processed-contributions/${contribution.swarmId}/${contribution.timestamp}`, 'processed-contribution', fact);
        }
        this.emit('contribution:processed', { contribution, fact });
    }
    setupKnowledgeDistribution() {
        this.on('knowledge:distribute', (update) => {
            this.distributeKnowledgeUpdate(update);
        });
    }
    async distributeKnowledgeUpdate(update) {
        const relevantSwarms = this.findSwarmsInterestedInDomain(update.domain);
        if (update.affectedSwarms) {
            update.affectedSwarms.forEach((swarmId) => relevantSwarms.add(swarmId));
        }
        logger.info(`Distributing knowledge update ${update.updateId} to ${relevantSwarms.size} swarms`);
        for (const swarmId of relevantSwarms) {
            try {
                if (this.hiveCoordinator) {
                    this.hiveCoordinator.emit('knowledge:update', {
                        swarmId,
                        update,
                        timestamp: Date.now(),
                    });
                }
                if (this.memoryStore) {
                    await this.memoryStore.store(`hive-bridge/updates/${swarmId}/${update.updateId}`, 'knowledge-update', update);
                }
            }
            catch (error) {
                logger.error(`Failed to distribute update to swarm ${swarmId}:`, error);
            }
        }
        this.emit('knowledge:distributed', {
            update,
            swarmCount: relevantSwarms.size,
        });
    }
    findSwarmsInterestedInDomain(domain) {
        const interestedSwarms = new Set();
        for (const [swarmId, interests] of this.subscribedSwarms) {
            if (interests.has(domain) || interests.has('*')) {
                interestedSwarms.add(swarmId);
            }
        }
        return interestedSwarms;
    }
    getStats() {
        const queuedContributions = Array.from(this.contributionQueue.values()).reduce((sum, queue) => sum + queue.length, 0);
        return {
            registeredSwarms: this.subscribedSwarms.size,
            pendingRequests: this.pendingRequests.size,
            queuedContributions,
            totalRequests: 0,
            averageResponseTime: 0,
        };
    }
    async shutdown() {
        logger.info('Shutting down Hive Knowledge Bridge');
        this.pendingRequests.clear();
        this.contributionQueue.clear();
        this.subscribedSwarms.clear();
        this.removeAllListeners();
        this.isInitialized = false;
        this.emit('bridge:shutdown');
    }
}
export default CollectiveKnowledgeBridge;
//# sourceMappingURL=collective-knowledge-bridge.js.map