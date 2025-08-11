/**
 * @file Memory management: memory-integration.
 */
import { getLogger } from '../core/logger.ts';
const logger = getLogger('src-memory-memory-integration');
import { DIContainer } from '../di/container/di-container.ts';
import { CORE_TOKENS, DATABASE_TOKENS, MEMORY_TOKENS } from '../di/tokens/core-tokens.ts';
import { MemoryController } from './controllers/memory-controller.ts';
import { MemoryProviderFactory } from './providers/memory-providers.ts';
/**
 * Default memory configurations for different use cases.
 */
export const defaultMemoryConfigurations = {
    // High-performance cache (in-memory)
    cache: {
        type: 'memory',
        maxSize: 10000,
        ttl: 300000, // 5 minutes
        compression: false,
    },
    // Persistent session storage (SQLite via DAL Factory)
    session: {
        type: 'sqlite',
        path: './.claude-zen/memory/sessions',
        maxSize: 50000,
        ttl: 86400000, // 24 hours
        compression: true,
    },
    // Vector-based semantic memory (LanceDB via DAL Factory)
    semantic: {
        type: 'lancedb',
        path: './.claude-zen/memory/vectors',
        maxSize: 100000,
        compression: false,
    },
    // Development/debugging (JSON)
    debug: {
        type: 'json',
        path: './.claude-zen/memory/debug.json',
        maxSize: 1000,
        compression: false,
    },
};
/**
 * Memory backend performance characteristics.
 */
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
/**
 * Register memory providers with DI container.
 *
 * @param container
 * @example
 */
export function registerMemoryProviders(container, customConfigs) {
    // Register memory provider factory (uses DAL Factory)
    container.register(MEMORY_TOKENS['ProviderFactory'], {
        type: 'singleton',
        create: (container) => new MemoryProviderFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config), container.resolve(DATABASE_TOKENS?.DALFactory)),
    });
    // Register default memory configurations
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
    // Register memory controller
    container.register(MEMORY_TOKENS.Controller, {
        type: 'singleton',
        create: (container) => new MemoryController(container.resolve(MEMORY_TOKENS['ProviderFactory']), container.resolve(MEMORY_TOKENS.Config), container.resolve(CORE_TOKENS.Logger)),
    });
}
/**
 * Create specialized memory backends for different use cases.
 *
 * @param container
 * @example
 */
export async function createMemoryBackends(container) {
    const factory = container.resolve(MEMORY_TOKENS['ProviderFactory']);
    return {
        cache: factory.createProvider(defaultMemoryConfigurations?.cache),
        session: factory.createProvider(defaultMemoryConfigurations?.session),
        semantic: factory.createProvider(defaultMemoryConfigurations?.semantic),
        debug: factory.createProvider(defaultMemoryConfigurations?.debug),
    };
}
/**
 * Initialize memory system with comprehensive setup.
 *
 * @param container
 * @param options
 * @param options.enableCache
 * @param options.enableSessions
 * @param options.enableSemantic
 * @param options.enableDebug
 * @example
 */
export async function initializeMemorySystem(container, options = {
    enableCache: true,
    enableSessions: true,
    enableSemantic: true,
    enableDebug: true,
}) {
    const logger = container.resolve(CORE_TOKENS.Logger);
    logger.info('Initializing memory system with DAL Factory integration');
    // Create controller
    const controller = container.resolve(MEMORY_TOKENS.Controller);
    // Create backends based on options
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
    // Test all backends
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
/**
 * Utility function to create a pre-configured memory DI container.
 *
 * @param customConfigs
 * @example
 */
export function createMemoryContainer(customConfigs) {
    const container = new DIContainer();
    // Register core services (would normally come from main app)
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
    // Register DAL Factory
    container.register(DATABASE_TOKENS?.DALFactory, {
        type: 'singleton',
        create: (container) => {
            const { DALFactory } = require('../database/factory.js');
            const { DatabaseProviderFactory } = require('../database/providers/database-providers.js');
            return new DALFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config), new DatabaseProviderFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config)));
        },
    });
    // Register memory providers
    registerMemoryProviders(container, customConfigs);
    return container;
}
/**
 * Memory system usage examples and recommendations.
 */
export const memoryUsageGuide = {
    // Use in-memory backend for frequently accessed data
    cache: {
        example: 'Storing API responses, computed results, temporary user state',
        performance: '~100,000 ops/sec',
        limitations: 'No persistence, memory limited',
    },
    // Use SQLite backend for persistent structured data
    session: {
        example: 'User sessions, application state, configuration data',
        performance: '~10,000 ops/sec',
        limitations: 'File-based, single-writer',
    },
    // Use LanceDB backend for semantic/similarity searches
    semantic: {
        example: 'Document embeddings, semantic memory, AI context',
        performance: '~5,000 ops/sec',
        limitations: 'Vector operations only',
    },
    // Use JSON backend for development and debugging
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
