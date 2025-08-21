/**
 * @file Memory management: memory-integration.
 */
import { DIContainer } from '@claude-zen/foundation';
import type { MemoryConfig } from '../memory/interfaces';
/**
 * Default memory configurations for different use cases.
 */
export declare const defaultMemoryConfigurations: {
    readonly cache: {
        readonly type: "memory";
        readonly maxSize: 10000;
        readonly ttl: 300000;
        readonly compression: false;
    };
    readonly session: {
        readonly type: "sqlite";
        readonly path: "./.claude-zen/memory/sessions";
        readonly maxSize: 50000;
        readonly ttl: 86400000;
        readonly compression: true;
    };
    readonly semantic: {
        readonly type: "lancedb";
        readonly path: "./.claude-zen/memory/vectors";
        readonly maxSize: 100000;
        readonly compression: false;
    };
    readonly debug: {
        readonly type: "json";
        readonly path: "./.claude-zen/memory/debug.json";
        readonly maxSize: 1000;
        readonly compression: false;
    };
};
/**
 * Memory backend performance characteristics.
 */
export declare const memoryBackendSpecs: {
    readonly memory: {
        readonly speed: "fastest";
        readonly persistence: false;
        readonly searchCapability: "exact-match";
        readonly bestFor: "caching, temporary data";
    };
    readonly sqlite: {
        readonly speed: "fast";
        readonly persistence: true;
        readonly searchCapability: "SQL queries";
        readonly bestFor: "session data, structured storage";
    };
    readonly lancedb: {
        readonly speed: "fast";
        readonly persistence: true;
        readonly searchCapability: "similarity search";
        readonly bestFor: "semantic memory, embeddings";
    };
    readonly json: {
        readonly speed: "slower";
        readonly persistence: true;
        readonly searchCapability: "none";
        readonly bestFor: "development, debugging";
    };
};
/**
 * Register memory providers with DI container.
 *
 * @param container
 * @example
 */
export declare function registerMemoryProviders(container: DIContainer, customConfigs?: {
    [key: string]: Partial<MemoryConfig>;
}): void;
/**
 * Create specialized memory backends for different use cases.
 *
 * @param container
 * @example
 */
export declare function createMemoryBackends(container: DIContainer): Promise<{
    cache: unknown;
    session: unknown;
    semantic: unknown;
    debug: unknown;
}>;
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
export declare function initializeMemorySystem(container: DIContainer, options?: {
    enableCache: boolean;
    enableSessions: boolean;
    enableSemantic: boolean;
    enableDebug: boolean;
}): Promise<{
    controller: unknown;
    backends: Record<string, unknown>;
    metrics: {
        totalBackends: number;
        enabledBackends: string[];
        performance: typeof memoryBackendSpecs;
    };
}>;
/**
 * Utility function to create a pre-configured memory DI container.
 *
 * @param customConfigs
 * @example
 */
export declare function createMemoryContainer(customConfigs?: Parameters<typeof registerMemoryProviders>[1]): DIContainer;
/**
 * Memory system usage examples and recommendations.
 */
export declare const memoryUsageGuide: {
    readonly cache: {
        readonly example: "Storing API responses, computed results, temporary user state";
        readonly performance: "~100,000 ops/sec";
        readonly limitations: "No persistence, memory limited";
    };
    readonly session: {
        readonly example: "User sessions, application state, configuration data";
        readonly performance: "~10,000 ops/sec";
        readonly limitations: "File-based, single-writer";
    };
    readonly semantic: {
        readonly example: "Document embeddings, semantic memory, AI context";
        readonly performance: "~5,000 ops/sec";
        readonly limitations: "Vector operations only";
    };
    readonly debug: {
        readonly example: "Development data, debugging, configuration files";
        readonly performance: "~1,000 ops/sec";
        readonly limitations: "Slow, not production-ready";
    };
};
declare const _default: {
    registerMemoryProviders: typeof registerMemoryProviders;
    createMemoryBackends: typeof createMemoryBackends;
    initializeMemorySystem: typeof initializeMemorySystem;
    createMemoryContainer: typeof createMemoryContainer;
    defaultMemoryConfigurations: {
        readonly cache: {
            readonly type: "memory";
            readonly maxSize: 10000;
            readonly ttl: 300000;
            readonly compression: false;
        };
        readonly session: {
            readonly type: "sqlite";
            readonly path: "./.claude-zen/memory/sessions";
            readonly maxSize: 50000;
            readonly ttl: 86400000;
            readonly compression: true;
        };
        readonly semantic: {
            readonly type: "lancedb";
            readonly path: "./.claude-zen/memory/vectors";
            readonly maxSize: 100000;
            readonly compression: false;
        };
        readonly debug: {
            readonly type: "json";
            readonly path: "./.claude-zen/memory/debug.json";
            readonly maxSize: 1000;
            readonly compression: false;
        };
    };
    memoryBackendSpecs: {
        readonly memory: {
            readonly speed: "fastest";
            readonly persistence: false;
            readonly searchCapability: "exact-match";
            readonly bestFor: "caching, temporary data";
        };
        readonly sqlite: {
            readonly speed: "fast";
            readonly persistence: true;
            readonly searchCapability: "SQL queries";
            readonly bestFor: "session data, structured storage";
        };
        readonly lancedb: {
            readonly speed: "fast";
            readonly persistence: true;
            readonly searchCapability: "similarity search";
            readonly bestFor: "semantic memory, embeddings";
        };
        readonly json: {
            readonly speed: "slower";
            readonly persistence: true;
            readonly searchCapability: "none";
            readonly bestFor: "development, debugging";
        };
    };
    memoryUsageGuide: {
        readonly cache: {
            readonly example: "Storing API responses, computed results, temporary user state";
            readonly performance: "~100,000 ops/sec";
            readonly limitations: "No persistence, memory limited";
        };
        readonly session: {
            readonly example: "User sessions, application state, configuration data";
            readonly performance: "~10,000 ops/sec";
            readonly limitations: "File-based, single-writer";
        };
        readonly semantic: {
            readonly example: "Document embeddings, semantic memory, AI context";
            readonly performance: "~5,000 ops/sec";
            readonly limitations: "Vector operations only";
        };
        readonly debug: {
            readonly example: "Development data, debugging, configuration files";
            readonly performance: "~1,000 ops/sec";
            readonly limitations: "Slow, not production-ready";
        };
    };
};
export default _default;
//# sourceMappingURL=memory-integration.d.ts.map