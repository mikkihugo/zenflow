import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-clients-factories-http-client-factory');
import { HTTPClientAdapter } from '../adapters/http-client-adapter.ts';
export class HTTPClientFactory {
    clients = new Map();
    isShuttingDown = false;
    async create(config) {
        if (this.isShuttingDown) {
            throw new Error('Factory is shutting down, cannot create new clients');
        }
        if (this.clients.has(config?.name)) {
            throw new Error(`Client with name '${config?.name}' already exists`);
        }
        const client = new HTTPClientAdapter(config);
        this.setupClientHandlers(client);
        this.clients.set(config?.name, client);
        if (config?.monitoring?.enabled || config?.health) {
            try {
                await client.connect();
            }
            catch (error) {
                this.clients.delete(config?.name);
                throw error;
            }
        }
        return client;
    }
    async createMultiple(configs) {
        const clients = [];
        const errors = [];
        const promises = configs.map(async (config) => {
            try {
                const client = await this.create(config);
                clients.push(client);
                return client;
            }
            catch (error) {
                errors.push({ config, error: error });
                throw error;
            }
        });
        const _results = await Promise.allSettled(promises);
        if (errors.length > 0) {
            for (const client of clients) {
                try {
                    await client.destroy();
                    this.clients.delete(client.name);
                }
                catch (cleanupError) {
                    logger.error(`Failed to cleanup client ${client.name}:`, cleanupError);
                }
            }
            const errorMessages = errors
                .map(({ config, error }) => `${config?.name}: ${error.message}`)
                .join('; ');
            throw new Error(`Failed to create ${errors.length} clients: ${errorMessages}`);
        }
        return clients;
    }
    get(name) {
        return this.clients.get(name);
    }
    list() {
        return Array.from(this.clients.values());
    }
    has(name) {
        return this.clients.has(name);
    }
    async remove(name) {
        const client = this.clients.get(name);
        if (!client) {
            return false;
        }
        try {
            await client.destroy();
            this.clients.delete(name);
            return true;
        }
        catch (error) {
            logger.error(`Failed to remove client ${name}:`, error);
            this.clients.delete(name);
            return true;
        }
    }
    async healthCheckAll() {
        const results = new Map();
        const promises = Array.from(this.clients.entries()).map(async ([name, client]) => {
            try {
                const status = await client.healthCheck();
                results?.set(name, status);
            }
            catch (error) {
                results?.set(name, {
                    name,
                    status: 'unhealthy',
                    lastCheck: new Date(),
                    responseTime: 0,
                    errorRate: 1,
                    uptime: 0,
                    metadata: {
                        error: error.message,
                    },
                });
            }
        });
        await Promise.allSettled(promises);
        return results;
    }
    async getMetricsAll() {
        const results = new Map();
        const promises = Array.from(this.clients.entries()).map(async ([name, client]) => {
            try {
                const metrics = await client.getMetrics();
                results?.set(name, metrics);
            }
            catch (_error) {
                results?.set(name, {
                    name,
                    requestCount: 0,
                    successCount: 0,
                    errorCount: 0,
                    averageLatency: 0,
                    p95Latency: 0,
                    p99Latency: 0,
                    throughput: 0,
                    timestamp: new Date(),
                });
            }
        });
        await Promise.allSettled(promises);
        return results;
    }
    async shutdown() {
        this.isShuttingDown = true;
        const shutdownPromises = Array.from(this.clients.values()).map(async (client) => {
            try {
                await client.destroy();
            }
            catch (error) {
                logger.error(`Failed to shutdown client ${client.name}:`, error);
            }
        });
        await Promise.allSettled(shutdownPromises);
        this.clients.clear();
    }
    getActiveCount() {
        return this.clients.size;
    }
    async createWithAuth(name, baseURL, authType, credentials) {
        let authentication;
        switch (authType) {
            case 'bearer':
                authentication = {
                    type: 'bearer',
                    token: credentials,
                };
                break;
            case 'apikey':
                authentication = {
                    type: 'apikey',
                    apiKey: credentials,
                };
                break;
            case 'basic': {
                const basicCreds = credentials;
                authentication = {
                    type: 'basic',
                    username: basicCreds.username,
                    password: basicCreds.password,
                };
                break;
            }
        }
        const config = {
            name,
            baseURL,
            authentication,
            retry: {
                attempts: 3,
                delay: 1000,
                backoff: 'exponential',
            },
            monitoring: {
                enabled: true,
                metricsInterval: 60000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
            },
        };
        return this.create(config);
    }
    async createWithRetry(name, baseURL, retryConfig) {
        const config = {
            name,
            baseURL,
            retry: {
                attempts: retryConfig?.attempts,
                delay: retryConfig?.delay,
                backoff: retryConfig?.backoff || 'exponential',
            },
        };
        return this.create(config);
    }
    async createWithMonitoring(name, baseURL, monitoringConfig) {
        const config = {
            name,
            baseURL,
            monitoring: {
                enabled: true,
                metricsInterval: monitoringConfig?.metricsInterval || 60000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
            },
            health: monitoringConfig?.healthCheckInterval
                ? {
                    endpoint: monitoringConfig?.healthEndpoint || '/health',
                    interval: monitoringConfig?.healthCheckInterval,
                    timeout: 5000,
                    failureThreshold: 3,
                    successThreshold: 2,
                }
                : undefined,
        };
        return this.create(config);
    }
    async createLoadBalanced(baseName, baseURLs, options) {
        const configs = baseURLs.map((baseURL, index) => ({
            name: `${baseName}-${index}`,
            baseURL,
            monitoring: {
                enabled: options?.healthCheck !== false,
                metricsInterval: 30000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
            },
            health: options?.healthCheck !== false
                ? {
                    endpoint: '/health',
                    interval: 10000,
                    timeout: 5000,
                    failureThreshold: 3,
                    successThreshold: 2,
                }
                : undefined,
        }));
        return this.createMultiple(configs);
    }
    async getClientsByStatus(status) {
        const healthResults = await this.healthCheckAll();
        const matchingClients = [];
        for (const [name, clientStatus] of healthResults) {
            if (clientStatus.status === status) {
                const client = this.clients.get(name);
                if (client) {
                    matchingClients.push(client);
                }
            }
        }
        return matchingClients;
    }
    getStats() {
        let connectedCount = 0;
        const totalResponseTime = 0;
        const healthyCount = 0;
        const totalRequests = 0;
        const totalErrors = 0;
        for (const client of this.clients.values()) {
            if (client.isConnected()) {
                connectedCount++;
            }
        }
        return {
            totalClients: this.clients.size,
            connectedClients: connectedCount,
            averageResponseTime: healthyCount > 0 ? totalResponseTime / healthyCount : 0,
            totalRequests,
            totalErrors,
        };
    }
    setupClientHandlers(client) {
        client.on('error', (error) => {
            logger.error(`Client ${client.name} error:`, error);
        });
        client.on('connect', () => { });
        client.on('disconnect', () => { });
        client.on('retry', (_info) => { });
    }
}
export const httpClientFactory = new HTTPClientFactory();
export const createHTTPClient = async (config) => {
    return httpClientFactory.create(config);
};
export const createHTTPClients = async (configs) => {
    return httpClientFactory.createMultiple(configs);
};
//# sourceMappingURL=http-client-factory.js.map