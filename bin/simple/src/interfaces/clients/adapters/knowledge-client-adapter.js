import { EventEmitter } from 'node:events';
import { FACTIntegration, } from '../../../knowledge/knowledge-client.ts';
import { ClientStatuses, ProtocolTypes } from '../types.ts';
export class KnowledgeClientAdapter extends EventEmitter {
    config;
    factIntegration;
    _connected = false;
    _status = ClientStatuses.DISCONNECTED;
    metrics;
    startTime;
    queryCounter = 0;
    constructor(config) {
        super();
        this.config = config;
        this.startTime = new Date();
        this.metrics = this.initializeMetrics();
        const factConfig = this.convertToFACTConfig(config);
        this.factIntegration = new FACTIntegration(factConfig);
        this.setupEventForwarding();
    }
    getConfig() {
        return this.config;
    }
    isConnected() {
        return this._connected;
    }
    async connect() {
        if (this._connected) {
            return;
        }
        try {
            this._status = ClientStatuses.CONNECTING;
            this.emit('connecting');
            await this.factIntegration.initialize();
            this._connected = true;
            this._status = ClientStatuses.CONNECTED;
            this.emit('connect');
        }
        catch (error) {
            this._status = ClientStatuses.ERROR;
            this.emit('error', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this._connected) {
            return;
        }
        try {
            await this.factIntegration.shutdown();
            this._connected = false;
            this._status = ClientStatuses.DISCONNECTED;
            this.emit('disconnect');
        }
        catch (error) {
            this._status = ClientStatuses.ERROR;
            this.emit('error', error);
            throw error;
        }
    }
    async send(data) {
        if (!this._connected) {
            await this.connect();
        }
        const startTime = Date.now();
        this.metrics.totalRequests++;
        try {
            const factQuery = {
                query: data?.query,
                tools: data?.tools,
                useCache: this.config.caching?.enabled !== false,
                metadata: data?.metadata,
            };
            const factResult = await this.factIntegration.query(factQuery);
            const response = {
                response: factResult?.response,
                queryId: factResult?.queryId,
                executionTimeMs: factResult?.executionTimeMs,
                cacheHit: factResult?.cacheHit,
                toolsUsed: factResult?.toolsUsed,
                cost: factResult?.cost,
                confidence: this.calculateConfidence(factResult),
                sources: this.extractSources(factResult),
                metadata: factResult?.metadata,
            };
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, true);
            return response;
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, false);
            this.metrics.failedRequests++;
            this.emit('error', error);
            throw error;
        }
    }
    async health() {
        try {
            if (!this._connected) {
                return false;
            }
            const healthQuery = {
                query: 'health check',
                type: 'exact',
                tools: [],
                metadata: { type: 'health_check' },
            };
            await this.send(healthQuery);
            return true;
        }
        catch (_error) {
            return false;
        }
    }
    async getMetadata() {
        const factMetrics = await this.factIntegration.getMetrics();
        return {
            protocol: this.config.protocol,
            version: '1.0.0',
            features: [
                'fact-integration',
                'caching',
                'semantic-search',
                'vector-search',
                'tool-execution',
            ],
            connection: {
                url: this.config.url,
                connected: this._connected,
                lastConnected: this.startTime,
                connectionDuration: Date.now() - this.startTime.getTime(),
            },
            metrics: this.metrics,
            custom: {
                provider: this.config.provider,
                factMetrics,
                cacheConfig: this.config.caching,
                tools: this.config.tools,
            },
        };
    }
    async query(query, options) {
        const request = {
            query,
            type: 'semantic',
            tools: this.config.tools || undefined,
            options: options || undefined,
            metadata: { queryType: 'knowledge_query' },
        };
        return await this.send(request);
    }
    async search(searchTerm, options) {
        const request = {
            query: searchTerm,
            type: options?.fuzzy ? 'fuzzy' : 'exact',
            tools: ['web_scraper', 'documentation_parser'],
            options: options || undefined,
            metadata: { queryType: 'search' },
        };
        const response = await this.send(request);
        return [response];
    }
    async getEntry(id) {
        try {
            const request = {
                query: `Get entry with ID: ${id}`,
                type: 'exact',
                tools: ['database_lookup'],
                metadata: { queryType: 'get_entry', entryId: id },
            };
            return await this.send(request);
        }
        catch (_error) {
            return null;
        }
    }
    async addEntry(data) {
        const request = {
            query: `Add knowledge entry: ${JSON.stringify(data)}`,
            type: 'exact',
            tools: ['database_insert'],
            metadata: { queryType: 'add_entry', data },
        };
        const response = await this.send(request);
        return response?.queryId;
    }
    async updateEntry(id, data) {
        try {
            const request = {
                query: `Update entry ${id}: ${JSON.stringify(data)}`,
                type: 'exact',
                tools: ['database_update'],
                metadata: { queryType: 'update_entry', entryId: id, data },
            };
            await this.send(request);
            return true;
        }
        catch (_error) {
            return false;
        }
    }
    async deleteEntry(id) {
        try {
            const request = {
                query: `Delete entry with ID: ${id}`,
                type: 'exact',
                tools: ['database_delete'],
                metadata: { queryType: 'delete_entry', entryId: id },
            };
            await this.send(request);
            return true;
        }
        catch (_error) {
            return false;
        }
    }
    async getKnowledgeStats() {
        const factMetrics = await this.factIntegration.getMetrics();
        return {
            totalEntries: factMetrics.totalQueries,
            totalSize: 0,
            lastUpdated: new Date(),
            categories: {
                'fact-queries': factMetrics.totalQueries,
                'cached-results': Math.floor(factMetrics.totalQueries * factMetrics.cacheHitRate),
            },
            averageResponseTime: factMetrics.averageLatency,
            indexHealth: factMetrics.errorRate < 0.1 ? 1.0 : 0.5,
        };
    }
    async semanticSearch(query, options) {
        const request = {
            query,
            type: 'semantic',
            tools: options?.vectorSearch
                ? ['vector_search', 'semantic_analyzer']
                : ['semantic_analyzer'],
            options: options || undefined,
            metadata: {
                queryType: 'semantic_search',
                vectorSearch: options?.vectorSearch || undefined,
            },
        };
        const response = await this.send(request);
        return [response];
    }
    convertToFACTConfig(config) {
        return {
            pythonPath: config?.factConfig?.pythonPath,
            factRepoPath: config?.factConfig?.factRepoPath || './FACT',
            anthropicApiKey: config?.factConfig?.anthropicApiKey ||
                process.env['ANTHROPIC_API_KEY'] ||
                '',
            cacheConfig: config?.caching
                ? {
                    prefix: config?.caching?.prefix,
                    minTokens: config?.caching?.minTokens,
                    maxSize: '100MB',
                    ttlSeconds: config?.caching?.ttlSeconds,
                }
                : undefined,
            enableCache: config?.caching?.enabled ?? true,
            databasePath: './data/knowledge.db',
        };
    }
    setupEventForwarding() {
        this.factIntegration.on('initialized', () => {
            this.emit('initialized');
        });
        this.factIntegration.on('queryCompleted', (result) => {
            this.emit('queryCompleted', result);
        });
        this.factIntegration.on('queryError', (error) => {
            this.emit('queryError', error);
        });
        this.factIntegration.on('shutdown', () => {
            this.emit('shutdown');
        });
    }
    initializeMetrics() {
        return {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastRequestTime: undefined,
            uptime: 0,
            bytesSent: 0,
            bytesReceived: 0,
        };
    }
    updateMetrics(responseTime, success) {
        if (success) {
            this.metrics.successfulRequests++;
        }
        const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) +
            responseTime;
        this.metrics.averageResponseTime =
            totalResponseTime / this.metrics.totalRequests;
        this.metrics.lastRequestTime = new Date();
        this.metrics.uptime = Date.now() - this.startTime.getTime();
    }
    calculateConfidence(result) {
        let confidence = 0.5;
        if (result?.cacheHit)
            confidence += 0.2;
        if (result?.toolsUsed.length > 0)
            confidence += 0.2;
        if (result?.executionTimeMs < 5000)
            confidence += 0.1;
        return Math.min(confidence, 1.0);
    }
    extractSources(result) {
        return result?.toolsUsed.map((tool, index) => ({
            title: `${tool} result`,
            url: `fact://tool/${tool}`,
            relevance: 1.0 - index * 0.1,
        }));
    }
}
export class KnowledgeClientFactory {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async create(protocol, config) {
        this.logger?.info(`Creating Knowledge client with protocol: ${protocol}`);
        if (!this.validateConfig(protocol, config)) {
            throw new Error(`Invalid configuration for Knowledge client with protocol: ${protocol}`);
        }
        const knowledgeConfig = config;
        if (!knowledgeConfig?.provider) {
            knowledgeConfig.provider = 'fact';
        }
        const client = new KnowledgeClientAdapter(knowledgeConfig);
        this.logger?.info(`Successfully created Knowledge client`);
        return client;
    }
    supports(protocol) {
        return [
            ProtocolTypes.HTTP,
            ProtocolTypes.HTTPS,
            ProtocolTypes.CUSTOM,
        ].includes(protocol);
    }
    getSupportedProtocols() {
        return [ProtocolTypes.HTTP, ProtocolTypes.HTTPS, ProtocolTypes.CUSTOM];
    }
    validateConfig(protocol, config) {
        if (!this.supports(protocol)) {
            return false;
        }
        const knowledgeConfig = config;
        if (!knowledgeConfig?.url) {
            return false;
        }
        if (knowledgeConfig?.provider === 'fact') {
            if (!knowledgeConfig?.factConfig?.factRepoPath) {
                return false;
            }
            if (!(knowledgeConfig?.factConfig?.anthropicApiKey ||
                process.env['ANTHROPIC_API_KEY'])) {
                return false;
            }
        }
        return true;
    }
}
export async function createFACTClient(factRepoPath, anthropicApiKey, options) {
    const config = {
        protocol: ProtocolTypes.CUSTOM,
        url: 'fact://local',
        provider: 'fact',
        factConfig: {
            factRepoPath,
            anthropicApiKey: anthropicApiKey || process.env['ANTHROPIC_API_KEY'] || '',
            pythonPath: 'python3',
        },
        caching: {
            enabled: true,
            prefix: 'claude-zen-knowledge',
            ttlSeconds: 3600,
            minTokens: 500,
        },
        tools: [
            'web_scraper',
            'documentation_parser',
            'api_documentation_scraper',
            'changelog_scraper',
            'stackoverflow_search',
            'github_search',
        ],
        timeout: 30000,
        ...options,
    };
    return new KnowledgeClientAdapter(config);
}
export async function createCustomKnowledgeClient(url, options) {
    const config = {
        protocol: url.startsWith('https')
            ? ProtocolTypes.HTTPS
            : ProtocolTypes.HTTP,
        url,
        provider: 'custom',
        caching: {
            enabled: true,
            prefix: 'claude-zen-knowledge',
            ttlSeconds: 1800,
            minTokens: 300,
        },
        timeout: 15000,
        ...options,
    };
    return new KnowledgeClientAdapter(config);
}
export const KnowledgeHelpers = {
    async getDocumentation(client, framework, version) {
        return await client.query(`Get comprehensive documentation for ${framework} ${version ? `version ${version}` : '(latest version)'}`, {
            includeMetadata: true,
            filters: { type: 'documentation', framework, version },
        });
    },
    async getAPIReference(client, api, endpoint) {
        const query = endpoint
            ? `Get detailed API reference for ${api} endpoint: ${endpoint}`
            : `Get comprehensive API reference for ${api}`;
        return await client.query(query, {
            includeMetadata: true,
            filters: { type: 'api_reference', api, endpoint },
        });
    },
    async searchCommunity(client, topic, tags) {
        const query = `Search developer communities for: ${topic}${tags ? ` tags: ${tags.join(', ')}` : ''}`;
        return await client.search(query, {
            fuzzy: true,
            fields: ['title', 'content', 'tags'],
            filters: { type: 'community', topic, tags },
        });
    },
};
export default KnowledgeClientAdapter;
//# sourceMappingURL=knowledge-client-adapter.js.map