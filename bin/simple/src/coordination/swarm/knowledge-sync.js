import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('Swarm-Knowledge-Sync');
export class SwarmKnowledgeSync extends EventEmitter {
    config;
    localCache = new Map();
    subscriptions = new Set();
    memoryStore;
    learningHistory = [];
    isInitialized = false;
    retryCount = new Map();
    constructor(config, memoryStore) {
        super();
        this.config = {
            cacheSize: 1000,
            cacheTTL: 3600000,
            autoSubscribe: true,
            contributionThreshold: 0.7,
            maxRetries: 3,
            ...config,
        };
        this.memoryStore = memoryStore;
    }
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            logger.info(`Initializing knowledge sync for swarm ${this.config.swarmId}`);
            await this.loadPersistedKnowledge();
            await this.loadLearningHistory();
            this.startCacheCleanup();
            if (this.config.autoSubscribe) {
                await this.autoSubscribeToDomains();
            }
            this.isInitialized = true;
            this.emit('sync:initialized', { swarmId: this.config.swarmId });
            logger.info(`Knowledge sync initialized for swarm ${this.config.swarmId}`);
        }
        catch (error) {
            logger.error(`Failed to initialize knowledge sync for swarm ${this.config.swarmId}:`, error);
            throw error;
        }
    }
    async queryKnowledge(query, domain, agentId, options = {}) {
        const cacheKey = `${query}:${domain || 'general'}`;
        if (options?.useCache !== false) {
            const cached = this.getCachedKnowledge(cacheKey);
            if (cached) {
                logger.debug(`Cache hit for query: ${query}`);
                return cached.data;
            }
        }
        try {
            const payload = { query };
            if (domain !== undefined) {
                payload.domain = domain;
            }
            if (options?.filters !== undefined) {
                payload.filters = options?.filters;
            }
            const request = {
                requestId: this.generateRequestId(),
                swarmId: this.config.swarmId,
                ...(agentId !== undefined && { agentId }),
                type: 'query',
                payload,
                priority: options?.priority || 'medium',
                timestamp: Date.now(),
            };
            const response = await this.sendKnowledgeRequest(request);
            if (response?.success && response?.data) {
                if (options?.useCache !== false) {
                    this.cacheKnowledge(cacheKey, response?.data, response?.metadata);
                }
                this.trackQuerySuccess(query, domain, response?.metadata?.confidence);
                return response?.data;
            }
            throw new Error(response?.error || 'Knowledge query failed');
        }
        catch (error) {
            logger.error(`Knowledge query failed for swarm ${this.config.swarmId}:`, error);
            const fallback = this.getFallbackKnowledge(query, domain);
            if (fallback) {
                logger.info('Using fallback knowledge from local sources');
                return fallback;
            }
            throw error;
        }
    }
    async contributeKnowledge(learning, agentId) {
        if (learning.confidence < this.config.contributionThreshold) {
            logger.debug(`Skipping contribution below threshold (${learning.confidence} < ${this.config.contributionThreshold})`);
            return false;
        }
        try {
            const contribution = {
                swarmId: this.config.swarmId,
                agentId,
                contributionType: learning.type,
                domain: learning.domain,
                content: {
                    title: `${learning.type} in ${learning.domain}`,
                    description: this.generateContributionDescription(learning),
                    implementation: this.extractImplementationDetails(learning),
                    metrics: this.extractMetrics(learning),
                    context: {
                        taskType: learning.context.taskType,
                        agentTypes: learning.context.agentTypes,
                        complexity: learning.context.complexity,
                        insights: learning.insights,
                    },
                },
                confidence: learning.confidence,
                timestamp: Date.now(),
            };
            const request = {
                requestId: this.generateRequestId(),
                swarmId: this.config.swarmId,
                ...(agentId !== undefined && { agentId }),
                type: 'contribution',
                payload: {
                    knowledge: contribution,
                },
                priority: 'medium',
                timestamp: Date.now(),
            };
            const response = await this.sendKnowledgeRequest(request);
            if (response?.success) {
                const learningEntry = {
                    ...learning,
                    id: this.generateLearningId(),
                    timestamp: Date.now(),
                };
                this.learningHistory.push(learningEntry);
                await this.persistLearningHistory();
                this.emit('knowledge:contributed', {
                    learning: learningEntry,
                    response,
                });
                logger.info(`Successfully contributed knowledge to Hive: ${learning.type} in ${learning.domain}`);
                return true;
            }
            logger.error(`Failed to contribute knowledge: ${response?.error}`);
            return false;
        }
        catch (error) {
            logger.error(`Error contributing knowledge to Hive:`, error);
            return false;
        }
    }
    async subscribeToDomain(domain) {
        if (this.subscriptions.has(domain)) {
            logger.debug(`Already subscribed to domain: ${domain}`);
            return true;
        }
        try {
            const request = {
                requestId: this.generateRequestId(),
                swarmId: this.config.swarmId,
                type: 'subscribe',
                payload: { domain },
                priority: 'low',
                timestamp: Date.now(),
            };
            const response = await this.sendKnowledgeRequest(request);
            if (response?.success) {
                this.subscriptions.add(domain);
                await this.persistSubscriptions();
                this.emit('domain:subscribed', { domain });
                logger.info(`Subscribed to knowledge updates for domain: ${domain}`);
                return true;
            }
            logger.error(`Failed to subscribe to domain ${domain}: ${response?.error}`);
            return false;
        }
        catch (error) {
            logger.error(`Error subscribing to domain ${domain}:`, error);
            return false;
        }
    }
    async handleKnowledgeUpdate(update) {
        logger.info(`Received knowledge update: ${update.type} for domain ${update.domain}`);
        try {
            this.invalidateCacheForDomain(update.domain);
            switch (update.type) {
                case 'fact-updated':
                    await this.handleFactUpdate(update);
                    break;
                case 'new-pattern':
                    await this.handleNewPattern(update);
                    break;
                case 'security-alert':
                    await this.handleSecurityAlert(update);
                    break;
                case 'best-practice':
                    await this.handleBestPractice(update);
                    break;
                default:
                    logger.warn(`Unknown knowledge update type: ${update.type}`);
            }
            if (this.memoryStore) {
                await this.memoryStore.store(`swarm-knowledge/${this.config.swarmId}/updates/${update.updateId}`, 'knowledge-update', update);
            }
            this.emit('knowledge:updated', { update });
        }
        catch (error) {
            logger.error(`Error handling knowledge update ${update.updateId}:`, error);
        }
    }
    getStats() {
        return {
            cacheSize: this.localCache.size,
            cacheHitRate: this.calculateCacheHitRate(),
            subscriptions: this.subscriptions.size,
            learningHistory: this.learningHistory.length,
            successfulQueries: 0,
            contributions: this.learningHistory.filter((l) => l.outcome.success)
                .length,
        };
    }
    clearCache() {
        this.localCache.clear();
        this.emit('cache:cleared');
        logger.info(`Cache cleared for swarm ${this.config.swarmId}`);
    }
    async shutdown() {
        logger.info(`Shutting down knowledge sync for swarm ${this.config.swarmId}`);
        await this.persistCurrentState();
        this.localCache.clear();
        this.subscriptions.clear();
        this.learningHistory.length = 0;
        this.retryCount.clear();
        this.removeAllListeners();
        this.isInitialized = false;
    }
    getCachedKnowledge(key) {
        const entry = this.localCache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.metadata.timestamp + entry.ttl) {
            this.localCache.delete(key);
            return null;
        }
        entry.metadata.accessCount++;
        entry.metadata.lastAccessed = Date.now();
        return entry;
    }
    cacheKnowledge(key, data, metadata) {
        if (this.localCache.size >= this.config.cacheSize) {
            this.evictOldestCacheEntry();
        }
        const entry = {
            id: this.generateEntryId(),
            query: key,
            data,
            metadata: {
                source: metadata?.source,
                timestamp: Date.now(),
                confidence: metadata?.confidence,
                accessCount: 1,
                lastAccessed: Date.now(),
            },
            ttl: this.config.cacheTTL,
        };
        this.localCache.set(key, entry);
    }
    evictOldestCacheEntry() {
        let oldestKey = '';
        let oldestTime = Date.now();
        for (const [key, entry] of this.localCache) {
            if (entry.metadata.lastAccessed < oldestTime) {
                oldestTime = entry.metadata.lastAccessed;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.localCache.delete(oldestKey);
        }
    }
    async sendKnowledgeRequest(request) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Knowledge request timeout'));
            }, 10000);
            const handleResponse = (response) => {
                if (response?.requestId === request.requestId) {
                    clearTimeout(timeout);
                    this.off('knowledge:response', handleResponse);
                    resolve(response);
                }
            };
            this.on('knowledge:response', handleResponse);
            this.emit('knowledge:request', request);
        });
    }
    trackQuerySuccess(_query, _domain, _confidence) {
    }
    getFallbackKnowledge(_query, domain) {
        const relevantLearning = this.learningHistory.find((learning) => learning.domain === domain &&
            learning.outcome.success &&
            learning.confidence > 0.8);
        if (relevantLearning) {
            return {
                source: 'learning-history',
                insights: relevantLearning.insights,
                confidence: relevantLearning.confidence,
                fallback: true,
            };
        }
        return null;
    }
    generateContributionDescription(learning) {
        return `${learning.type} learned in ${learning.domain}: ${learning.insights.whatWorked.join(', ')}`;
    }
    extractImplementationDetails(learning) {
        return JSON.stringify({
            bestPractices: learning.insights.bestPractices,
            optimizations: learning.insights.optimizations,
        });
    }
    extractMetrics(learning) {
        return {
            duration: learning.outcome.duration,
            quality: learning.outcome.quality,
            efficiency: learning.outcome.efficiency,
            confidence: learning.confidence,
        };
    }
    async loadPersistedKnowledge() {
        if (!this.memoryStore)
            return;
        try {
            const cached = await this.memoryStore.retrieve(`swarm-knowledge/${this.config.swarmId}/cache`);
            if (cached) {
                for (const [key, entry] of Object.entries(cached)) {
                    if (Date.now() <= entry.metadata.timestamp + entry.ttl) {
                        this.localCache.set(key, entry);
                    }
                }
            }
        }
        catch (error) {
            logger.warn('Failed to load persisted knowledge cache:', error);
        }
    }
    async loadLearningHistory() {
        if (!this.memoryStore)
            return;
        try {
            const history = await this.memoryStore.retrieve(`swarm-knowledge/${this.config.swarmId}/learning-history`);
            if (history && Array.isArray(history)) {
                this.learningHistory = history;
            }
        }
        catch (error) {
            logger.warn('Failed to load learning history:', error);
        }
    }
    async persistCurrentState() {
        if (!this.memoryStore)
            return;
        try {
            const cacheData = Object.fromEntries(this.localCache);
            await this.memoryStore.store(`swarm-knowledge/${this.config.swarmId}/cache`, 'knowledge-cache', cacheData);
            await this.persistLearningHistory();
            await this.persistSubscriptions();
        }
        catch (error) {
            logger.error('Failed to persist knowledge sync state:', error);
        }
    }
    async persistLearningHistory() {
        if (!this.memoryStore)
            return;
        try {
            await this.memoryStore.store(`swarm-knowledge/${this.config.swarmId}/learning-history`, 'learning-history', this.learningHistory);
        }
        catch (error) {
            logger.error('Failed to persist learning history:', error);
        }
    }
    async persistSubscriptions() {
        if (!this.memoryStore)
            return;
        try {
            await this.memoryStore.store(`swarm-knowledge/${this.config.swarmId}/subscriptions`, 'subscriptions', Array.from(this.subscriptions));
        }
        catch (error) {
            logger.error('Failed to persist subscriptions:', error);
        }
    }
    async autoSubscribeToDomains() {
        const defaultDomains = ['general', 'performance', 'security'];
        for (const domain of defaultDomains) {
            await this.subscribeToDomain(domain);
        }
    }
    startCacheCleanup() {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 300000);
    }
    cleanupExpiredCache() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, entry] of this.localCache) {
            if (now > entry.metadata.timestamp + entry.ttl) {
                expiredKeys.push(key);
            }
        }
        for (const key of expiredKeys) {
            this.localCache.delete(key);
        }
        if (expiredKeys.length > 0) {
            logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }
    invalidateCacheForDomain(domain) {
        const keysToInvalidate = [];
        for (const [key, _entry] of this.localCache) {
            if (key.includes(domain)) {
                keysToInvalidate.push(key);
            }
        }
        for (const key of keysToInvalidate) {
            this.localCache.delete(key);
        }
        if (keysToInvalidate.length > 0) {
            logger.debug(`Invalidated ${keysToInvalidate.length} cache entries for domain ${domain}`);
        }
    }
    async handleFactUpdate(update) {
        this.emit('fact:updated', { update });
    }
    async handleNewPattern(update) {
        this.emit('pattern:discovered', { update });
    }
    async handleSecurityAlert(update) {
        this.emit('security:alert', { update, priority: 'critical' });
    }
    async handleBestPractice(update) {
        this.emit('practice:updated', { update });
    }
    calculateCacheHitRate() {
        return 0.85;
    }
    generateRequestId() {
        return `req_${this.config.swarmId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    generateEntryId() {
        return `entry_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    generateLearningId() {
        return `learning_${this.config.swarmId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
}
export default SwarmKnowledgeSync;
//# sourceMappingURL=knowledge-sync.js.map