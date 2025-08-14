import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-clients-adapters-mcp-integration-example');
import { EventEmitter } from 'node:events';
import { createMCPConfigFromLegacy, MCPClientFactory, } from './mcp-client-adapter.ts';
class ExternalMCPClient {
    async connectAll() {
        return {};
    }
    getServerStatus() {
        return {};
    }
    async executeTool(serverName, toolName, parameters) {
        return { success: true, result: null };
    }
    getAvailableTools() {
        return {};
    }
    async disconnectAll() {
    }
}
export class MCPIntegrationManager {
    legacyClient;
    uaclFactory;
    uaclClients = new Map();
    eventEmitter = new EventEmitter();
    constructor() {
        this.legacyClient = new ExternalMCPClient();
        this.uaclFactory = new MCPClientFactory();
        this.setupEventHandlers();
    }
    async initialize() {
        try {
            const _legacyResults = await this.legacyClient.connectAll();
            await this.migrateLegacyToUACL();
            this.setupUnifiedInterface();
            this.eventEmitter.emit('initialized');
        }
        catch (error) {
            logger.error('❌ Failed to initialize MCP Integration Manager:', error);
            throw error;
        }
    }
    async migrateLegacyToUACL() {
        const legacyServers = this.legacyClient.getServerStatus();
        for (const [serverName, serverStatus] of Object.entries(legacyServers)) {
            try {
                const uaclConfig = this.createUACLConfigFromLegacyServer(serverName, serverStatus);
                const uaclClient = await this.uaclFactory.create(uaclConfig);
                this.uaclClients.set(serverName, uaclClient);
            }
            catch (error) {
                logger.warn(`⚠️  Failed to migrate ${serverName}:`, error);
            }
        }
    }
    createUACLConfigFromLegacyServer(serverName, serverStatus) {
        const _protocol = serverStatus.type === 'http' ? 'http' : 'stdio';
        const baseConfig = {
            url: serverStatus.url,
            type: serverStatus.type,
            timeout: 30000,
            capabilities: serverStatus.capabilities || [],
        };
        const uaclConfig = createMCPConfigFromLegacy(serverName, baseConfig);
        uaclConfig.monitoring = {
            enabled: true,
            metricsInterval: 60000,
            trackLatency: true,
            trackThroughput: true,
            trackErrors: true,
        };
        uaclConfig.tools = {
            timeout: 30000,
            retries: 3,
            discovery: true,
        };
        return uaclConfig;
    }
    setupUnifiedInterface() {
        this.eventEmitter.on('execute-tool', async (params) => {
            const { serverName, toolName, parameters, useUACL } = params;
            try {
                let result;
                if (useUACL && this.uaclClients.has(serverName)) {
                    const client = this.uaclClients.get(serverName);
                    result = await client.post(toolName, parameters);
                    this.eventEmitter.emit('tool-executed', {
                        serverName,
                        toolName,
                        success: true,
                        source: 'UACL',
                        result: result?.data,
                        metrics: {
                            responseTime: result?.metadata?.responseTime,
                            status: result?.status,
                        },
                    });
                }
                else {
                    result = await this.legacyClient.executeTool(serverName, toolName, parameters);
                    this.eventEmitter.emit('tool-executed', {
                        serverName,
                        toolName,
                        success: result?.success,
                        source: 'Legacy',
                        result: result?.result,
                        error: result?.error,
                    });
                }
            }
            catch (error) {
                this.eventEmitter.emit('tool-error', {
                    serverName,
                    toolName,
                    error: error.message,
                    source: useUACL ? 'UACL' : 'Legacy',
                });
            }
        });
    }
    setupEventHandlers() {
        this.eventEmitter.on('tool-executed', (data) => {
            if (data?.metrics) {
            }
        });
        this.eventEmitter.on('tool-error', (data) => {
            logger.error(`❌ Tool error: ${data?.toolName} on ${data?.serverName} (${data?.source}): ${data?.error}`);
        });
    }
    async executeToolWithFailover(serverName, toolName, parameters) {
        if (this.uaclClients.has(serverName)) {
            try {
                const client = this.uaclClients.get(serverName);
                const result = await client.post(toolName, parameters);
                return {
                    success: true,
                    source: 'UACL',
                    data: result?.data,
                    metadata: result?.metadata,
                };
            }
            catch (_error) {
                logger.warn(`⚠️  UACL execution failed for ${toolName}, falling back to legacy...`);
            }
        }
        try {
            const result = await this.legacyClient.executeTool(serverName, toolName, parameters);
            return {
                success: result?.success,
                source: 'Legacy',
                data: result?.result,
                error: result?.error,
            };
        }
        catch (error) {
            throw new Error(`Both UACL and Legacy execution failed: ${error.message}`);
        }
    }
    async getSystemStatus() {
        const legacyStatus = this.legacyClient.getServerStatus();
        const legacyTools = this.legacyClient.getAvailableTools();
        const uaclHealth = await this.uaclFactory.healthCheckAll();
        const uaclMetrics = await this.uaclFactory.getMetricsAll();
        const comparison = {
            totalServers: {
                legacy: Object.keys(legacyStatus).length,
                uacl: this.uaclClients.size,
            },
            healthyServers: {
                legacy: Object.values(legacyStatus).filter((s) => s.connected)
                    .length,
                uacl: Array.from(uaclHealth.values()).filter((h) => h.status === 'healthy').length,
            },
            totalTools: {
                legacy: Object.values(legacyTools).reduce((sum, tools) => sum + tools.length, 0),
                uacl: this.uaclClients.size * 2,
            },
        };
        return {
            legacy: { status: legacyStatus, tools: legacyTools },
            uacl: {
                health: Object.fromEntries(uaclHealth),
                metrics: Object.fromEntries(uaclMetrics),
            },
            comparison,
        };
    }
    async performanceComparison(serverName, toolName, parameters, iterations = 5) {
        const legacyTimes = [];
        const uaclTimes = [];
        let legacySuccesses = 0;
        let uaclSuccesses = 0;
        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            try {
                await this.legacyClient.executeTool(serverName, toolName, parameters);
                legacyTimes.push(Date.now() - startTime);
                legacySuccesses++;
            }
            catch (_error) {
                legacyTimes.push(Date.now() - startTime);
            }
        }
        const uaclClient = this.uaclClients.get(serverName);
        if (uaclClient) {
            for (let i = 0; i < iterations; i++) {
                const startTime = Date.now();
                try {
                    await uaclClient.post(toolName, parameters);
                    uaclTimes.push(Date.now() - startTime);
                    uaclSuccesses++;
                }
                catch (_error) {
                    uaclTimes.push(Date.now() - startTime);
                }
            }
        }
        const legacyAvg = legacyTimes.reduce((a, b) => a + b, 0) / legacyTimes.length;
        const uaclAvg = uaclTimes.reduce((a, b) => a + b, 0) / uaclTimes.length;
        const legacySuccessRate = legacySuccesses / iterations;
        const uaclSuccessRate = uaclSuccesses / iterations;
        let winner = 'tie';
        if (uaclAvg < legacyAvg && uaclSuccessRate >= legacySuccessRate) {
            winner = 'uacl';
        }
        else if (legacyAvg < uaclAvg && legacySuccessRate >= uaclSuccessRate) {
            winner = 'legacy';
        }
        return {
            legacy: { averageTime: legacyAvg, successRate: legacySuccessRate },
            uacl: { averageTime: uaclAvg, successRate: uaclSuccessRate },
            winner,
        };
    }
    async startGradualMigration(migrationConfig) {
        const { servers, batchSize, delayBetweenBatches, rollbackOnFailure } = migrationConfig;
        const batches = [];
        for (let i = 0; i < servers.length; i += batchSize) {
            batches.push(servers.slice(i, i + batchSize));
        }
        const migratedServers = [];
        try {
            for (const [batchIndex, batch] of batches.entries()) {
                for (const serverName of batch) {
                    try {
                        const legacyStatus = this.legacyClient.getServerStatus()[serverName];
                        if (!legacyStatus) {
                            logger.warn(`⚠️  Server ${serverName} not found in legacy system`);
                            continue;
                        }
                        const uaclConfig = this.createUACLConfigFromLegacyServer(serverName, legacyStatus);
                        const uaclClient = await this.uaclFactory.create(uaclConfig);
                        await uaclClient.connect();
                        const health = await uaclClient.healthCheck();
                        if (health.status === 'healthy') {
                            this.uaclClients.set(serverName, uaclClient);
                            migratedServers.push(serverName);
                        }
                        else {
                            throw new Error(`Health check failed: ${health.status}`);
                        }
                    }
                    catch (error) {
                        logger.error(`❌ Failed to migrate ${serverName}:`, error);
                        if (rollbackOnFailure) {
                            for (const rolledBackServer of migratedServers.slice(-batch.length)) {
                                await this.uaclFactory.remove(rolledBackServer);
                                this.uaclClients.delete(rolledBackServer);
                            }
                            throw error;
                        }
                    }
                }
                if (batchIndex < batches.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
                }
            }
        }
        catch (error) {
            logger.error('💥 Migration failed:', error);
            throw error;
        }
    }
    async shutdown() {
        try {
            await this.uaclFactory.shutdown();
            this.uaclClients.clear();
            await this.legacyClient.disconnectAll();
            this.eventEmitter.removeAllListeners();
        }
        catch (error) {
            logger.error('❌ Error during shutdown:', error);
            throw error;
        }
    }
    on(event, handler) {
        this.eventEmitter.on(event, handler);
    }
    off(event, handler) {
        this.eventEmitter.off(event, handler);
    }
}
export async function demonstrateMCPIntegration() {
    const manager = new MCPIntegrationManager();
    try {
        await manager.initialize();
        const _status = await manager.getSystemStatus();
        const _result = await manager.executeToolWithFailover('context7', 'research_analysis', {
            query: 'UACL architecture benefits',
        });
        const _comparison = await manager.performanceComparison('context7', 'research_analysis', { query: 'performance test' }, 3);
        await manager.startGradualMigration({
            servers: ['context7', 'deepwiki'],
            batchSize: 1,
            delayBetweenBatches: 1000,
            rollbackOnFailure: false,
        });
    }
    catch (error) {
        logger.error('💥 Integration demonstration failed:', error);
    }
    finally {
        await manager.shutdown();
    }
}
//# sourceMappingURL=mcp-integration-example.js.map