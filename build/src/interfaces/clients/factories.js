/**
 * Unified API Client Layer (UACL) - Factory Implementation.
 *
 * Central factory for creating client instances based on client type,
 * protocol requirements, and configuration. Supports dependency injection and
 * provides a single point of access for all client implementations.
 */
/**
 * @file Interface implementation: factories.
 */
import { ClientConfigs, ClientErrorCodes, ClientTypes, ProtocolToClientTypeMap, ProtocolTypes, TypeGuards, } from './types.ts';
/**
 * Main factory class for creating UACL client instances.
 *
 * @example
 */
export class UACLFactory {
    _logger;
    _config;
    clientCache = new Map();
    factoryCache = new Map();
    clientRegistry = {};
    transactionLog = new Map();
    constructor(_logger, _config) {
        this._logger = _logger;
        this._config = _config;
        this.initializeFactories();
    }
    /**
     * Create a client instance.
     *
     * @param factoryConfig
     */
    async createClient(factoryConfig) {
        const { clientType, protocol, url, name, config, reuseExisting = true } = factoryConfig;
        const cacheKey = this.generateCacheKey(clientType, protocol, url, name);
        if (reuseExisting && this.clientCache.has(cacheKey)) {
            this._logger.debug(`Returning cached client: ${cacheKey}`);
            const cachedClient = this.clientCache.get(cacheKey);
            this.updateClientUsage(cacheKey);
            return cachedClient;
        }
        this._logger.info(`Creating new client: ${clientType}/${protocol} (${url})`);
        try {
            // Validate configuration
            this.validateClientConfig(clientType, protocol, config);
            // Get or create client factory
            const factory = await this.getOrCreateFactory(clientType);
            // Merge with default configuration
            const mergedConfig = this.mergeWithDefaults(clientType, protocol, url, config);
            // Create client instance
            const client = await factory.create(protocol, mergedConfig);
            // Register and cache the client
            const clientId = this.registerClient(client, mergedConfig, cacheKey);
            this.clientCache.set(cacheKey, client);
            this._logger.info(`Successfully created client: ${clientId}`);
            return client;
        }
        catch (error) {
            this._logger.error(`Failed to create client: ${error}`);
            throw new Error(`Client creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create HTTP client with convenience methods.
     *
     * @param url
     * @param config
     */
    async createHttpClient(url, config) {
        const protocol = url.startsWith('https') ? ProtocolTypes.HTTPS : ProtocolTypes.HTTP;
        return (await this.createClient({
            clientType: ClientTypes.HTTP,
            protocol,
            url,
            config: config || undefined,
        }));
    }
    /**
     * Create WebSocket client with real-time capabilities.
     *
     * @param url
     * @param config
     */
    async createWebSocketClient(url, config) {
        const protocol = url.startsWith('wss') ? ProtocolTypes.WSS : ProtocolTypes.WS;
        return (await this.createClient({
            clientType: ClientTypes.WEBSOCKET,
            protocol,
            url,
            config: config || undefined,
        }));
    }
    /**
     * Create Knowledge client for FACT integration.
     *
     * @param url
     * @param config
     */
    async createKnowledgeClient(url, config) {
        return (await this.createClient({
            clientType: ClientTypes.KNOWLEDGE,
            protocol: url.startsWith('https') ? ProtocolTypes.HTTPS : ProtocolTypes.HTTP,
            url,
            config: config || undefined,
        }));
    }
    /**
     * Create MCP client for Model Context Protocol.
     *
     * @param url
     * @param config
     */
    async createMcpClient(url, config) {
        // Determine protocol based on URL format
        let protocol;
        if (url.startsWith('stdio://')) {
            protocol = ProtocolTypes.STDIO;
        }
        else if (url.startsWith('ws')) {
            protocol = url.startsWith('wss') ? ProtocolTypes.WSS : ProtocolTypes.WS;
        }
        else {
            protocol = url.startsWith('https') ? ProtocolTypes.HTTPS : ProtocolTypes.HTTP;
        }
        return (await this.createClient({
            clientType: ClientTypes.MCP,
            protocol,
            url,
            config: config || undefined,
        }));
    }
    /**
     * Create generic client for custom protocols.
     *
     * @param protocol
     * @param url
     * @param config
     */
    async createGenericClient(protocol, url, config) {
        return await this.createClient({
            clientType: ClientTypes.GENERIC,
            protocol,
            url,
            config: config || undefined,
        });
    }
    /**
     * Get client by ID from registry.
     *
     * @param clientId
     */
    getClient(clientId) {
        return this.clientRegistry[clientId]?.client || null;
    }
    /**
     * List all registered clients.
     */
    listClients() {
        return { ...this.clientRegistry };
    }
    /**
     * Health check for all clients.
     */
    async healthCheckAll() {
        const results = [];
        for (const [_clientId, entry] of Object.entries(this.clientRegistry)) {
            try {
                const startTime = Date.now();
                const healthy = await entry.client.health();
                const responseTime = Date.now() - startTime;
                results.push({
                    healthy,
                    protocol: entry.config.protocol,
                    url: entry.config.url,
                    responseTime,
                    lastCheck: new Date(),
                });
                // Update client status
                entry.status = healthy ? 'connected' : 'error';
            }
            catch (error) {
                results.push({
                    healthy: false,
                    protocol: entry.config.protocol,
                    url: entry.config.url,
                    responseTime: -1,
                    lastCheck: new Date(),
                    errors: [error instanceof Error ? error.message : 'Unknown error'],
                });
                entry.status = 'error';
            }
        }
        return results;
    }
    /**
     * Execute transaction across multiple clients.
     *
     * @param operations
     */
    async executeTransaction(operations) {
        const transactionId = this.generateTransactionId();
        const transaction = {
            id: transactionId,
            operations,
            status: 'executing',
            startTime: new Date(),
        };
        this.transactionLog.set(transactionId, transaction);
        try {
            // Execute operations in parallel
            const results = await Promise.allSettled(operations.map(async (op) => {
                const client = this.getClient(op.client);
                if (!client) {
                    throw new Error(`Client not found: ${op.client}`);
                }
                return await client.send(op.data);
            }));
            // Update operation results
            operations.forEach((op, index) => {
                const result = results[index];
                if (result?.status === 'fulfilled') {
                    op.result = result?.value;
                }
                else {
                    op.error = {
                        name: 'ClientError',
                        message: result?.reason?.message || 'Unknown error',
                        code: ClientErrorCodes.UNKNOWN_ERROR,
                        protocol: 'unknown',
                    };
                }
            });
            transaction.status = 'completed';
            transaction.endTime = new Date();
        }
        catch (error) {
            transaction.status = 'failed';
            transaction.endTime = new Date();
            transaction.error = {
                name: 'TransactionError',
                message: error instanceof Error ? error.message : 'Transaction failed',
                code: ClientErrorCodes.UNKNOWN_ERROR,
                protocol: 'unknown',
            };
            this._logger.error(`Transaction failed: ${transactionId}`, error);
        }
        return transaction;
    }
    /**
     * Disconnect and clean up all clients.
     */
    async disconnectAll() {
        this._logger.info('Disconnecting all clients');
        const disconnectPromises = Object.values(this.clientRegistry).map(async (entry) => {
            try {
                await entry.client.disconnect();
                entry.status = 'disconnected';
            }
            catch (error) {
                this._logger.warn(`Failed to disconnect client: ${error}`);
            }
        });
        await Promise.allSettled(disconnectPromises);
        // Clear caches
        this.clientCache.clear();
        this.clientRegistry = {};
        this.factoryCache.clear();
    }
    /**
     * Get factory statistics.
     */
    getStats() {
        const clientsByType = {};
        const clientsByStatus = {};
        // Initialize counters
        Object.values(ClientTypes).forEach((type) => {
            clientsByType[type] = 0;
        });
        ['disconnected', 'connecting', 'connected', 'reconnecting', 'error', 'suspended'].forEach((status) => {
            clientsByStatus[status] = 0;
        });
        // Count clients
        Object.values(this.clientRegistry).forEach((entry) => {
            const clientType = this.getClientTypeFromConfig(entry.config);
            if (clientType) {
                clientsByType[clientType]++;
            }
            clientsByStatus[entry.status]++;
        });
        return {
            totalClients: Object.keys(this.clientRegistry).length,
            clientsByType,
            clientsByStatus,
            cacheSize: this.clientCache.size,
            transactions: this.transactionLog.size,
        };
    }
    /**
     * Private methods for internal operations.
     */
    async initializeFactories() {
        // Initialize default factories for each client type
        // These would be imported from specific implementation files
        // Note: In a real implementation, these would import actual factory classes
        this._logger.debug('Initializing client factories');
        // Placeholder for factory initialization
        // Real implementation would load specific factory classes
    }
    async getOrCreateFactory(clientType) {
        if (this.factoryCache.has(clientType)) {
            return this.factoryCache.get(clientType);
        }
        // Dynamic import based on client type
        let FactoryClass;
        switch (clientType) {
            case ClientTypes.HTTP: {
                const { HTTPClientFactory } = await import('./factories/http-client-factory.ts');
                FactoryClass = HTTPClientFactory;
                break;
            }
            case ClientTypes.WEBSOCKET: {
                const { WebSocketClientFactory } = await import('./adapters/websocket-client-factory.ts');
                FactoryClass = WebSocketClientFactory;
                break;
            }
            case ClientTypes.KNOWLEDGE: {
                const { KnowledgeClientFactory } = await import('./implementations/knowledge-client-factory.ts');
                FactoryClass = KnowledgeClientFactory;
                break;
            }
            case ClientTypes.MCP: {
                // TODO NEEDS_HUMAN: MCP client factory not found - needs implementation
                throw new Error('MCP client factory not yet implemented');
            }
            default: {
                // TODO NEEDS_HUMAN: Generic client factory not found - needs implementation
                throw new Error('Generic client factory not yet implemented');
            }
        }
        const factory = new FactoryClass(this._logger, this._config);
        this.factoryCache.set(clientType, factory);
        return factory;
    }
    validateClientConfig(clientType, protocol, _config) {
        if (!TypeGuards.isClientType(clientType)) {
            throw new Error(`Invalid client type: ${clientType}`);
        }
        if (!TypeGuards.isProtocolType(protocol)) {
            throw new Error(`Invalid protocol type: ${protocol}`);
        }
        // Additional validation logic would go here
    }
    mergeWithDefaults(clientType, protocol, url, config) {
        const defaults = ClientConfigs?.[clientType] || ClientConfigs?.[ClientTypes.GENERIC];
        return {
            ...defaults,
            ...config,
            // Ensure required fields are not overwritten
            protocol,
            url,
        };
    }
    registerClient(client, config, cacheKey) {
        const clientId = this.generateClientId(config);
        this.clientRegistry[clientId] = {
            client,
            config,
            created: new Date(),
            lastUsed: new Date(),
            status: 'connected',
            metadata: {
                cacheKey,
                version: '1.0.0',
            },
        };
        return clientId;
    }
    updateClientUsage(cacheKey) {
        // Find client by cache key and update last used time
        for (const entry of Object.values(this.clientRegistry)) {
            if (entry.metadata['cacheKey'] === cacheKey) {
                entry.lastUsed = new Date();
                break;
            }
        }
    }
    generateCacheKey(clientType, protocol, url, name) {
        const parts = [clientType, protocol, url];
        if (name)
            parts.push(name);
        return parts.join(':');
    }
    generateClientId(config) {
        return `${config?.protocol}:${config?.url}:${Date.now()}`;
    }
    generateTransactionId() {
        return `tx:${Date.now()}:${Math.random().toString(36).substring(2, 11)}`;
    }
    getClientTypeFromConfig(config) {
        return ProtocolToClientTypeMap[config?.protocol] || null;
    }
}
/**
 * Multi-client coordinator for handling operations across different client types.
 *
 * @example
 */
export class MultiClientCoordinator {
    factory;
    logger;
    constructor(factory, logger) {
        this.factory = factory;
        this.logger = logger;
    }
    /**
     * Execute operation on multiple clients with different protocols.
     *
     * @param clients
     * @param operation
     */
    async executeMultiProtocol(clients, operation) {
        this.logger.info(`Executing multi-protocol operation on ${clients.length} clients`);
        // Create all clients
        const clientInstances = await Promise.all(clients.map((clientConfig) => this.factory.createClient({
            clientType: clientConfig?.type,
            protocol: clientConfig?.protocol,
            url: clientConfig?.url,
            config: clientConfig?.config || undefined,
        })));
        // Execute operation on all clients
        const results = await Promise.allSettled(clientInstances.map((client) => operation(client)));
        // Process results
        const successfulResults = [];
        const errors = [];
        results.forEach((result, index) => {
            if (result?.status === 'fulfilled') {
                successfulResults.push(result?.value);
            }
            else {
                errors.push(new Error(`Client ${index} failed: ${result?.reason}`));
            }
        });
        if (errors.length > 0) {
            this.logger.warn(`${errors.length} clients failed during multi-protocol operation`);
        }
        return successfulResults;
    }
    /**
     * Create load-balanced client setup.
     *
     * @param clientConfigs
     * @param strategy
     */
    async createLoadBalanced(clientConfigs, strategy = 'round-robin') {
        const clients = await Promise.all(clientConfigs?.map(async (config) => ({
            client: await this.factory.createClient({
                clientType: config?.type,
                protocol: config?.protocol,
                url: config?.url,
                config: config?.config || undefined,
            }),
            weight: config?.weight || 1,
            url: config?.url,
        })));
        return new LoadBalancedClient(clients, strategy);
    }
}
/**
 * Load-balanced client wrapper.
 *
 * @example
 */
export class LoadBalancedClient {
    clients;
    strategy;
    currentIndex = 0;
    requestCount = 0;
    constructor(clients, strategy) {
        this.clients = clients;
        this.strategy = strategy;
    }
    async connect() {
        await Promise.all(this.clients.map((c) => c.client.connect()));
    }
    async disconnect() {
        await Promise.all(this.clients.map((c) => c.client.disconnect()));
    }
    async send(data) {
        const client = this.selectClient();
        this.requestCount++;
        return await client.send(data);
    }
    async health() {
        const healthChecks = await Promise.allSettled(this.clients.map((c) => c.client.health()));
        return healthChecks.some((check) => check.status === 'fulfilled' && check.value);
    }
    getConfig() {
        return this.clients[0]?.client.getConfig() || {};
    }
    isConnected() {
        return this.clients.some((c) => c.client.isConnected());
    }
    async getMetadata() {
        const client = this.selectClient();
        return await client.getMetadata();
    }
    selectClient() {
        switch (this.strategy) {
            case 'round-robin': {
                const client = this.clients[this.currentIndex];
                this.currentIndex = (this.currentIndex + 1) % this.clients.length;
                return client?.client || this.clients[0].client;
            }
            case 'random': {
                const randomIndex = Math.floor(Math.random() * this.clients.length);
                return this.clients[randomIndex]?.client || this.clients[0].client;
            }
            case 'weighted': {
                // Weighted random selection
                const totalWeight = this.clients.reduce((sum, c) => sum + c.weight, 0);
                let random = Math.random() * totalWeight;
                for (const clientEntry of this.clients) {
                    random -= clientEntry.weight;
                    if (random <= 0) {
                        return clientEntry.client;
                    }
                }
                return this.clients[0].client; // Fallback
            }
            default:
                return this.clients[0].client;
        }
    }
}
// Convenience factory functions (following DAL pattern)
/**
 * Create a simple client for quick setup.
 *
 * @param clientType
 * @param protocol
 * @param url
 * @param config
 * @example
 */
export async function createClient(clientType, protocol, url, config) {
    // Create basic logger and config
    const logger = {
        debug: console.debug.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
    };
    const appConfig = {};
    const factory = new UACLFactory(logger, appConfig);
    return await factory.createClient({
        clientType,
        protocol,
        url,
        config,
    });
}
/**
 * Create HTTP client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export async function createHttpClient(url, config) {
    const protocol = url.startsWith('https') ? ProtocolTypes.HTTPS : ProtocolTypes.HTTP;
    return (await createClient(ClientTypes.HTTP, protocol, url, config));
}
/**
 * Create WebSocket client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export async function createWebSocketClient(url, config) {
    const protocol = url.startsWith('wss') ? ProtocolTypes.WSS : ProtocolTypes.WS;
    return (await createClient(ClientTypes.WEBSOCKET, protocol, url, config));
}
/**
 * Create MCP client with convenience.
 *
 * @param url
 * @param config
 * @example
 */
export async function createMcpClient(url, config) {
    let protocol;
    if (url.startsWith('stdio://')) {
        protocol = ProtocolTypes.STDIO;
    }
    else if (url.startsWith('ws')) {
        protocol = url.startsWith('wss') ? ProtocolTypes.WSS : ProtocolTypes.WS;
    }
    else {
        protocol = url.startsWith('https') ? ProtocolTypes.HTTPS : ProtocolTypes.HTTP;
    }
    return (await createClient(ClientTypes.MCP, protocol, url, config));
}
export default UACLFactory;
