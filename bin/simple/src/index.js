export * as Config from './config/index.js';
export * as Core from './core/index.ts';
export * as Types from './types/agent-types.ts';
export * as Utils from './utils/index.ts';
export * as Coordination from './coordination/index.ts';
export * as SPARC from './coordination/swarm/sparc/index.ts';
export * as Database from './database/index.ts';
export * as Memory from './memory/index.ts';
export * as Neural from './neural/index.ts';
export * as Optimization from './optimization/index.ts';
export * as Workflows from './workflows/index.ts';
export * as Interfaces from './interfaces/index.ts';
export * as Bindings from './bindings/index.ts';
export * as Integration from './integration/index.ts';
export * from './coordination/public-api.ts';
export * from './coordination/swarm/mcp/mcp-server.ts';
export * from './coordination/swarm/mcp/mcp-tool-registry.ts';
export * from './core/logger.ts';
export * from './interfaces/terminal/index.js';
export { NeuralAgent, } from './neural/agents/neural-agent.ts';
export * from './neural/neural-bridge.ts';
export * as SharedTypes from './types/index.ts';
export const defaultConfig = {
    mcp: {
        http: {
            enabled: true,
            port: 3000,
            host: 'localhost',
        },
        stdio: {
            enabled: false,
        },
    },
    swarm: {
        maxAgents: 8,
        topology: 'hierarchical',
        strategy: 'parallel',
    },
    neural: {
        enabled: true,
        wasmPath: './wasm',
        gpuAcceleration: false,
    },
    sparc: {
        enabled: true,
        aiAssisted: true,
        templateLibrary: './templates',
    },
    persistence: {
        provider: 'sqlite',
    },
    plugins: {
        paths: ['./plugins'],
        autoLoad: true,
    },
};
export async function initializeClaudeZen(config = {}) {
    const finalConfig = { ...defaultConfig, ...config };
    if (finalConfig?.mcp?.http?.enabled) {
        const { HTTPMCPServer } = await import('./interfaces/mcp/http-mcp-server.ts');
        const httpMcpServer = new HTTPMCPServer({
            ...(finalConfig?.mcp?.http?.port !== undefined && {
                port: finalConfig?.mcp?.http?.port,
            }),
            ...(finalConfig?.mcp?.http?.host !== undefined && {
                host: finalConfig?.mcp?.http?.host,
            }),
        });
        await httpMcpServer.start();
        global.httpMcpServer = httpMcpServer;
    }
    if (finalConfig?.mcp?.stdio?.enabled) {
        const { MCPServer } = await import('./coordination/swarm/mcp/mcp-server.ts');
        const stdioMcpServer = new MCPServer();
        await stdioMcpServer.start();
        global.stdioMcpServer = stdioMcpServer;
    }
    try {
        const coordinationModule = await import('./coordination/public-api.ts');
        const swarmCoordinator = await coordinationModule.createPublicSwarmCoordinator({
            topology: finalConfig?.swarm?.topology || 'hierarchical',
            maxAgents: finalConfig?.swarm?.maxAgents || 8,
            strategy: finalConfig?.swarm?.strategy || 'parallel',
        });
        global.swarmCoordinator = swarmCoordinator;
        console.log('✅ Swarm coordination system initialized', {
            id: swarmCoordinator.getSwarmId(),
            state: swarmCoordinator.getState(),
            agentCount: swarmCoordinator.getAgentCount(),
        });
    }
    catch (error) {
        console.log('⚠️ SwarmOrchestrator initialization failed:', error);
    }
    try {
        const { MemorySystemFactory } = await import('./memory/index.ts');
        const memorySystem = await MemorySystemFactory.createBasicMemorySystem([
            {
                id: 'primary',
                type: finalConfig?.persistence?.provider || 'sqlite',
                config: finalConfig?.persistence?.connectionString
                    ? { connectionString: finalConfig.persistence.connectionString }
                    : { path: './data/claude-zen-memory.db' },
            },
        ]);
        global.memorySystem = memorySystem;
        console.log('✅ Memory system initialized with', finalConfig?.persistence?.provider || 'sqlite');
    }
    catch (error) {
        console.error('⚠️ Memory system initialization failed:', error);
    }
    if (finalConfig?.neural?.enabled) {
        const { NeuralBridge } = await import('./neural/neural-bridge.ts');
        const neuralBridge = NeuralBridge.getInstance(finalConfig?.neural);
        await neuralBridge.initialize();
    }
    if (finalConfig?.sparc?.enabled) {
        const { SPARC } = await import('./coordination/swarm/sparc/index.ts');
        const _sparcEngine = SPARC.getEngine();
    }
    if (finalConfig?.plugins?.autoLoad) {
    }
}
export async function shutdownClaudeZen() {
    console.log('🔄 Initiating Claude-Zen system shutdown...');
    const shutdownResults = [];
    try {
        const swarmCoordinator = global.swarmCoordinator;
        if (swarmCoordinator && typeof swarmCoordinator.shutdown === 'function') {
            try {
                await swarmCoordinator.shutdown();
                shutdownResults.push({
                    component: 'SwarmCoordinator',
                    status: 'success',
                });
                console.log('✅ Swarm coordinator shutdown complete');
            }
            catch (error) {
                shutdownResults.push({
                    component: 'SwarmCoordinator',
                    status: 'error',
                    error: error.message,
                });
                console.error('❌ Swarm coordinator shutdown failed:', error);
            }
        }
        try {
            const { NeuralBridge } = await import('./neural/neural-bridge.ts');
            const neuralBridge = NeuralBridge.getInstance();
            if (neuralBridge && typeof neuralBridge.shutdown === 'function') {
                await neuralBridge.shutdown();
                shutdownResults.push({ component: 'NeuralBridge', status: 'success' });
                console.log('✅ Neural bridge shutdown complete');
            }
        }
        catch (error) {
            shutdownResults.push({
                component: 'NeuralBridge',
                status: 'error',
                error: error.message,
            });
            console.error('❌ Neural bridge shutdown failed:', error);
        }
        try {
            if (global.httpMcpServer) {
                await global.httpMcpServer.stop();
                shutdownResults.push({ component: 'HTTPMCPServer', status: 'success' });
                console.log('✅ HTTP MCP server shutdown complete');
            }
            if (global.stdioMcpServer) {
                await global.stdioMcpServer.stop();
                shutdownResults.push({
                    component: 'StdioMCPServer',
                    status: 'success',
                });
                console.log('✅ stdio MCP server shutdown complete');
            }
        }
        catch (error) {
            shutdownResults.push({
                component: 'MCPServers',
                status: 'error',
                error: error.message,
            });
            console.error('❌ MCP servers shutdown failed:', error);
        }
        try {
            const { MemorySystemFactory } = await import('./memory/index.ts');
            if (global.memorySystem &&
                typeof global.memorySystem.shutdown === 'function') {
                await global.memorySystem.shutdown();
                shutdownResults.push({ component: 'MemorySystem', status: 'success' });
                console.log('✅ Memory system shutdown complete');
            }
        }
        catch (error) {
            shutdownResults.push({
                component: 'MemorySystem',
                status: 'error',
                error: error.message,
            });
            console.error('❌ Memory system shutdown failed:', error);
        }
        delete global.swarmCoordinator;
        delete global.httpMcpServer;
        delete global.stdioMcpServer;
        delete global.memorySystem;
        const successCount = shutdownResults.filter((r) => r.status === 'success').length;
        const errorCount = shutdownResults.filter((r) => r.status === 'error').length;
        console.log(`🏁 Claude-Zen shutdown complete: ${successCount} components shutdown successfully, ${errorCount} errors`);
        if (errorCount > 0) {
            console.warn('⚠️ Some components failed to shutdown gracefully:', shutdownResults.filter((r) => r.status === 'error'));
        }
    }
    catch (error) {
        console.error('❌ Critical error during shutdown orchestration:', error);
        throw error;
    }
}
export async function healthCheck() {
    const timestamp = new Date().toISOString();
    const healthStatus = {
        status: 'healthy',
        timestamp,
        components: {},
        metrics: {
            uptime: process.uptime() * 1000,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
        },
    };
    let overallHealthy = true;
    let degradedComponents = 0;
    try {
        healthStatus.components.core = {
            status: 'healthy',
            details: {
                nodeVersion: process.version,
                platform: process.platform,
                pid: process.pid,
            },
        };
    }
    catch (error) {
        healthStatus.components.core = {
            status: 'unhealthy',
            error: error.message,
        };
        overallHealthy = false;
    }
    try {
        const { MemorySystemFactory } = await import('./memory/index.ts');
        const memorySystem = global.memorySystem;
        if (memorySystem && typeof memorySystem.getHealthReport === 'function') {
            const healthReport = memorySystem.getHealthReport();
            healthStatus.components.memory = {
                status: healthReport.overall === 'healthy'
                    ? 'healthy'
                    : healthReport.overall === 'warning'
                        ? 'degraded'
                        : 'unhealthy',
                details: healthReport,
            };
            if (healthReport.overall !== 'healthy') {
                if (healthReport.overall === 'critical')
                    overallHealthy = false;
                else
                    degradedComponents++;
            }
        }
        else {
            healthStatus.components.memory = {
                status: 'unknown',
                details: { message: 'Memory system not initialized or unavailable' },
            };
            degradedComponents++;
        }
    }
    catch (error) {
        healthStatus.components.memory = {
            status: 'unhealthy',
            error: error.message,
        };
        overallHealthy = false;
    }
    try {
        const { NeuralBridge } = await import('./neural/neural-bridge.ts');
        const neuralBridge = NeuralBridge.getInstance();
        if (neuralBridge && typeof neuralBridge.getHealth === 'function') {
            const neuralHealth = await neuralBridge.getHealth();
            healthStatus.components.neural = {
                status: neuralHealth.status,
                details: neuralHealth,
            };
            if (neuralHealth.status !== 'healthy') {
                if (neuralHealth.status === 'unhealthy')
                    overallHealthy = false;
                else
                    degradedComponents++;
            }
        }
        else {
            healthStatus.components.neural = {
                status: 'unknown',
                details: { message: 'Neural bridge not initialized or unavailable' },
            };
            degradedComponents++;
        }
    }
    catch (error) {
        healthStatus.components.neural = {
            status: 'degraded',
            error: error.message,
        };
        degradedComponents++;
    }
    try {
        const { createDatabaseManager } = await import('./database/index.ts');
        healthStatus.components.database = {
            status: 'healthy',
            details: { message: 'Database interface available' },
        };
    }
    catch (error) {
        healthStatus.components.database = {
            status: 'degraded',
            error: error.message,
        };
        degradedComponents++;
    }
    try {
        const swarmCoordinator = global.swarmCoordinator;
        if (swarmCoordinator && typeof swarmCoordinator.getStatus === 'function') {
            const coordinationStatus = swarmCoordinator.getStatus();
            healthStatus.components.coordination = {
                status: coordinationStatus.state === 'active' ? 'healthy' : 'degraded',
                details: coordinationStatus,
            };
            if (coordinationStatus.state !== 'active') {
                degradedComponents++;
            }
        }
        else {
            healthStatus.components.coordination = {
                status: 'unknown',
                details: { message: 'Swarm coordinator not initialized' },
            };
            degradedComponents++;
        }
    }
    catch (error) {
        healthStatus.components.coordination = {
            status: 'degraded',
            error: error.message,
        };
        degradedComponents++;
    }
    try {
        let interfaceStatus = 'healthy';
        const interfaceDetails = {};
        const httpMcpServer = global.httpMcpServer;
        if (httpMcpServer && typeof httpMcpServer.isRunning === 'function') {
            interfaceDetails.httpMcp = httpMcpServer.isRunning()
                ? 'running'
                : 'stopped';
            if (!httpMcpServer.isRunning())
                interfaceStatus = 'degraded';
        }
        else {
            interfaceDetails.httpMcp = 'not_initialized';
            interfaceStatus = 'degraded';
        }
        const stdioMcpServer = global.stdioMcpServer;
        if (stdioMcpServer && typeof stdioMcpServer.isRunning === 'function') {
            interfaceDetails.stdioMcp = stdioMcpServer.isRunning()
                ? 'running'
                : 'stopped';
        }
        else {
            interfaceDetails.stdioMcp = 'not_initialized';
        }
        healthStatus.components.interfaces = {
            status: interfaceStatus,
            details: interfaceDetails,
        };
        if (interfaceStatus !== 'healthy') {
            degradedComponents++;
        }
    }
    catch (error) {
        healthStatus.components.interfaces = {
            status: 'unhealthy',
            error: error.message,
        };
        overallHealthy = false;
    }
    if (!overallHealthy) {
        healthStatus.status = 'unhealthy';
    }
    else if (degradedComponents > 0) {
        healthStatus.status = 'degraded';
    }
    else {
        healthStatus.status = 'healthy';
    }
    return healthStatus;
}
export function getVersion() {
    return {
        version: process.env['npm_package_version'] || '2.0.0',
        build: process.env['BUILD_ID'] || 'development',
        timestamp: new Date().toISOString(),
    };
}
export default {
    initializeClaudeZen,
    shutdownClaudeZen,
    healthCheck,
    getVersion,
    Core,
    Memory,
    Neural,
    Database,
    Coordination,
    SPARC,
    Interfaces,
    Integration,
    Bindings,
    Workflows,
    Optimization,
    Utils,
    Types,
    Config,
};
//# sourceMappingURL=index.js.map