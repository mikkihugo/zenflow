import { getLogger } from '../core/logger.ts';
const logger = getLogger('src-memory-memory-integration');
import { DIContainer } from '../di/container/di-container.ts';
import { CORE_TOKENS, DATABASE_TOKENS, MEMORY_TOKENS, } from '../di/tokens/core-tokens.ts';
import { MemoryController } from './controllers/memory-controller.ts';
import { MemoryProviderFactory } from './providers/memory-providers.ts';
export const defaultMemoryConfigurations = {
    cache: {
        type: 'memory',
        maxSize: 10000,
        ttl: 300000,
        compression: false,
    },
    session: {
        type: 'sqlite',
        path: './.claude-zen/memory/sessions',
        maxSize: 50000,
        ttl: 86400000,
        compression: true,
    },
    semantic: {
        type: 'lancedb',
        path: './.claude-zen/memory/vectors',
        maxSize: 100000,
        compression: false,
    },
    debug: {
        type: 'json',
        path: './.claude-zen/memory/debug.json',
        maxSize: 1000,
        compression: false,
    },
};
export const memoryBackendSpecs = {
    memory: {
        speed: 'fastest',
        persistence: false,
        searchCapability: 'exact-match',
        bestFor: 'caching, temporary data',
    },
    sqlite: {
        speed: 'fast',
        persistence: true,
        searchCapability: 'SQL queries',
        bestFor: 'session data, structured storage',
    },
    lancedb: {
        speed: 'fast',
        persistence: true,
        searchCapability: 'similarity search',
        bestFor: 'semantic memory, embeddings',
    },
    json: {
        speed: 'slower',
        persistence: true,
        searchCapability: 'none',
        bestFor: 'development, debugging',
    },
};
export function registerMemoryProviders(container, customConfigs) {
    container.register(MEMORY_TOKENS['ProviderFactory'], {
        type: 'singleton',
        create: (container) => new MemoryProviderFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config), container.resolve(DATABASE_TOKENS?.DALFactory)),
    });
    for (const [name, defaultConfig] of Object.entries(defaultMemoryConfigurations)) {
        const tokenName = `${name.charAt(0).toUpperCase()}${name.slice(1)}Config`;
        container.register(MEMORY_TOKENS[tokenName] || MEMORY_TOKENS.Config, {
            type: 'singleton',
            create: () => ({
                ...defaultConfig,
                ...customConfigs?.[name],
            }),
        });
    }
    container.register(MEMORY_TOKENS.Controller, {
        type: 'singleton',
        create: (container) => new MemoryController(container.resolve(MEMORY_TOKENS['ProviderFactory']), container.resolve(MEMORY_TOKENS.Config), container.resolve(CORE_TOKENS.Logger)),
    });
}
export async function createMemoryBackends(container) {
    const factory = container.resolve(MEMORY_TOKENS['ProviderFactory']);
    return {
        cache: factory.createProvider(defaultMemoryConfigurations?.cache),
        session: factory.createProvider(defaultMemoryConfigurations?.session),
        semantic: factory.createProvider(defaultMemoryConfigurations?.semantic),
        debug: factory.createProvider(defaultMemoryConfigurations?.debug),
    };
}
export async function initializeMemorySystem(container, options = {
    enableCache: true,
    enableSessions: true,
    enableSemantic: true,
    enableDebug: true,
}) {
    const logger = container.resolve(CORE_TOKENS.Logger);
    logger.info('Initializing memory system with DAL Factory integration');
    const controller = container.resolve(MEMORY_TOKENS.Controller);
    const backends = {};
    const enabledBackends = [];
    if (options?.['enableCache']) {
        backends.cache = container.resolve(MEMORY_TOKENS['ProviderFactory']).createProvider(defaultMemoryConfigurations?.cache);
        enabledBackends.push('cache');
    }
    if (options?.['enableSessions']) {
        backends.session = container.resolve(MEMORY_TOKENS['ProviderFactory']).createProvider(defaultMemoryConfigurations?.session);
        enabledBackends.push('session');
    }
    if (options?.['enableSemantic']) {
        backends.semantic = container.resolve(MEMORY_TOKENS['ProviderFactory']).createProvider(defaultMemoryConfigurations?.semantic);
        enabledBackends.push('semantic');
    }
    if (options?.['enableDebug']) {
        backends.debug = container.resolve(MEMORY_TOKENS['ProviderFactory']).createProvider(defaultMemoryConfigurations?.debug);
        enabledBackends.push('debug');
    }
    const healthChecks = await Promise.allSettled(Object.entries(backends).map(async ([name, backend]) => {
        const healthy = await backend.health();
        return { name, healthy };
    }));
    const healthyBackends = healthChecks
        .filter((result) => result?.status === 'fulfilled' && result?.value?.healthy)
        .map((result) => result?.value?.name);
    logger.info(`Memory system initialized: ${healthyBackends.length}/${enabledBackends.length} backends healthy`);
    return {
        controller,
        backends,
        metrics: {
            totalBackends: enabledBackends.length,
            enabledBackends,
            performance: memoryBackendSpecs,
        },
    };
}
export function createMemoryContainer(customConfigs) {
    const container = new DIContainer();
    container.register(CORE_TOKENS.Logger, {
        type: 'singleton',
        create: () => ({
            debug: (msg) => { },
            info: (msg) => { },
            warn: (msg) => logger.warn(`[MEMORY WARN] ${msg}`),
            error: (msg) => logger.error(`[MEMORY ERROR] ${msg}`),
        }),
    });
    container.register(CORE_TOKENS.Config, {
        type: 'singleton',
        create: () => ({
            get: (key, defaultValue) => defaultValue,
            set: (key, value) => { },
            has: (key) => false,
        }),
    });
    container.register(DATABASE_TOKENS?.DALFactory, {
        type: 'singleton',
        create: (container) => {
            const { DALFactory } = require('../database/factory.js');
            const { DatabaseProviderFactory, } = require('../database/providers/database-providers.js');
            return new DALFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config), new DatabaseProviderFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config)));
        },
    });
    registerMemoryProviders(container, customConfigs);
    return container;
}
export const memoryUsageGuide = {
    cache: {
        example: 'Storing API responses, computed results, temporary user state',
        performance: '~100,000 ops/sec',
        limitations: 'No persistence, memory limited',
    },
    session: {
        example: 'User sessions, application state, configuration data',
        performance: '~10,000 ops/sec',
        limitations: 'File-based, single-writer',
    },
    semantic: {
        example: 'Document embeddings, semantic memory, AI context',
        performance: '~5,000 ops/sec',
        limitations: 'Vector operations only',
    },
    debug: {
        example: 'Development data, debugging, configuration files',
        performance: '~1,000 ops/sec',
        limitations: 'Slow, not production-ready',
    },
};
export default {
    registerMemoryProviders,
    createMemoryBackends,
    initializeMemorySystem,
    createMemoryContainer,
    defaultMemoryConfigurations,
    memoryBackendSpecs,
    memoryUsageGuide,
};
//# sourceMappingURL=memory-integration.js.map