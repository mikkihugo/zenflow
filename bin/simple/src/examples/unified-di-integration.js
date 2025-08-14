import { initializeSwarmStorage, registerSwarmProviders, } from '../coordination/swarm/storage/swarm-providers.ts';
import { DALFactory } from '../database/factory.ts';
import { DatabaseProviderFactory } from '../database/providers/database-providers.ts';
import { DIContainer } from '../di/container/di-container.ts';
import { CORE_TOKENS, DATABASE_TOKENS } from '../di/tokens/core-tokens.ts';
import { initializeMemorySystem, registerMemoryProviders, } from '../memory/memory-integration.ts';
export async function unifiedIntegrationExample() {
    const container = new DIContainer({
        enableCircularDependencyDetection: true,
        enablePerformanceMetrics: true,
    });
    registerCoreServices(container);
    registerDatabaseServices(container);
    registerMemoryProviders(container, {
        session: { path: './example-data/memory/sessions' },
        semantic: { path: './example-data/memory/vectors' },
    });
    registerSwarmProviders(container, {
        swarm: { basePath: './example-data/swarms' },
        backup: { backupsPath: './example-data/backups' },
    });
    try {
        const memorySystem = await initializeMemorySystem(container);
        const swarmSystem = await initializeSwarmStorage(container);
        await memorySystem.backends['session']?.store('user:123', {
            id: 123,
            name: 'John Doe',
            preferences: { theme: 'dark' },
        });
        const userData = await memorySystem.backends['session']?.retrieve('user:123');
        const swarmId = 'example-swarm-001';
        const cluster = await swarmSystem.databaseManager.createSwarmCluster(swarmId);
        await swarmSystem.databaseManager.storeSwarmAgent(swarmId, {
            id: 'agent-001',
            name: 'Coordinator Agent',
            type: 'coordinator',
            capabilities: ['planning', 'monitoring'],
        });
        await swarmSystem.databaseManager.storeSwarmEmbedding(swarmId, {
            id: 'task-001',
            vector: new Array(1536).fill(0).map(() => Math.random()),
            metadata: { task: 'Initialize system', priority: 'high' },
        });
        const swarmMetadata = {
            swarmId,
            agents: 1,
            tasks: 1,
            status: 'active',
            lastUpdate: new Date().toISOString(),
        };
        await memorySystem.backends['cache']?.store(`swarm:${swarmId}:metadata`, swarmMetadata);
        await memorySystem.backends['semantic']?.store(`swarm:${swarmId}:context`, {
            purpose: 'Example swarm for unified DI demonstration',
            capabilities: ['coordination', 'task execution', 'monitoring'],
            domain: 'system integration',
        });
        for (const [name, spec] of Object.entries(memorySystem.metrics.performance)) {
        }
        const healthChecks = await Promise.allSettled([
            memorySystem.backends['session']?.health(),
            memorySystem.backends['cache']?.health(),
            swarmSystem.databaseManager.getActiveSwarms(),
        ]);
        const healthyServices = healthChecks
            .map((result, i) => ({
            name: ['Session Memory', 'Cache Memory', 'Swarm Database'][i],
            healthy: result?.status === 'fulfilled',
        }))
            .filter((service) => service.healthy);
    }
    catch (error) {
        console.error('❌ Integration example failed:', error);
        throw error;
    }
}
function registerCoreServices(container) {
    container.register(CORE_TOKENS.Logger, {
        type: 'singleton',
        create: () => ({
            debug: (msg, meta) => { },
            info: (msg, meta) => { },
            warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
            error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
        }),
    });
    container.register(CORE_TOKENS.Config, {
        type: 'singleton',
        create: () => ({
            get: (key, defaultValue) => {
                const configs = {
                    'database.sqlite.path': './example-data/database.db',
                    'database.kuzu.path': './example-data/graph.kuzu',
                    'database.lancedb.path': './example-data/vectors.lance',
                    'memory.ttl.default': 3600000,
                    'swarm.archive.days': 30,
                };
                return configs?.[key] ?? defaultValue;
            },
            set: (key, value) => { },
            has: (key) => key.startsWith('database.') ||
                key.startsWith('memory.') ||
                key.startsWith('swarm.'),
        }),
    });
}
function registerDatabaseServices(container) {
    container.register(DATABASE_TOKENS?.ProviderFactory, {
        type: 'singleton',
        create: (container) => new DatabaseProviderFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config)),
    });
    container.register(DATABASE_TOKENS?.DALFactory, {
        type: 'singleton',
        create: (container) => new DALFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config), container.resolve(DATABASE_TOKENS?.ProviderFactory)),
    });
}
export async function specializedUsageExamples() {
    const container = new DIContainer();
    registerCoreServices(container);
    registerDatabaseServices(container);
    registerMemoryProviders(container);
    registerSwarmProviders(container);
    const memorySystem = await initializeMemorySystem(container, {
        enableCache: true,
        enableSessions: false,
        enableSemantic: false,
        enableDebug: false,
    });
    const apiResponse = { data: 'expensive computation result', cached: true };
    await memorySystem.backends['cache']?.store('api:expensive-call', apiResponse);
    const _cachedResult = await memorySystem.backends['cache']?.retrieve('api:expensive-call');
    const swarmSystem = await initializeSwarmStorage(container);
    const parentSwarm = await swarmSystem.databaseManager.createSwarmCluster('parent-swarm');
    const childSwarm = await swarmSystem.databaseManager.createSwarmCluster('child-swarm');
    await swarmSystem.databaseManager.storeSwarmTask('parent-swarm', {
        id: 'task-001',
        title: 'Coordinate child swarms',
        description: 'Manage multiple child swarm operations',
        dependencies: [],
    });
    const semanticMemory = memorySystem.backends['semantic'];
    await semanticMemory.store('concept:ai-coordination', {
        domain: 'artificial intelligence',
        concepts: [
            'multi-agent systems',
            'swarm intelligence',
            'coordination protocols',
        ],
    });
}
export function productionDeploymentExample() {
    const container = new DIContainer({
        enableCircularDependencyDetection: true,
        enablePerformanceMetrics: true,
        maxResolutionDepth: 100,
    });
    const productionConfig = {
        memory: {
            cache: { type: 'memory', maxSize: 100000 },
            session: {
                type: 'sqlite',
                path: '/var/lib/claude-zen/memory/sessions.db',
            },
            semantic: {
                type: 'lancedb',
                path: '/var/lib/claude-zen/memory/vectors',
            },
        },
        swarm: {
            basePath: '/var/lib/claude-zen/swarms',
            backup: { backupsPath: '/var/lib/claude-zen/backups', retentionDays: 30 },
        },
        database: {
            central: {
                type: 'sqlite',
                database: '/var/lib/claude-zen/central.db',
            },
        },
    };
}
export default {
    unifiedIntegrationExample,
    specializedUsageExamples,
    productionDeploymentExample,
};
//# sourceMappingURL=unified-di-integration.js.map