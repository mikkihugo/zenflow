/**
 * Dependency Injection System Entry Point.
 * Provides a comprehensive, type-safe DI container for Claude Code Zen.
 */
/**
 * @file Di module exports.
 */
import { DIContainer } from './container/di-container.ts';
export { DIContainer } from './container/di-container.ts';
export { DIScope } from './container/di-scope.ts';
export { getInjectionToken, hasInjectionToken, inject, } from './decorators/inject.ts';
export { getInjectionMetadata, injectable, isInjectable, } from './decorators/injectable.ts';
export { FactoryProvider } from './providers/factory-provider.ts';
export { ScopedProvider } from './providers/scoped-provider.ts';
export { SingletonProvider } from './providers/singleton-provider.ts';
export { TransientProvider } from './providers/transient-provider.ts';
export type { IConfig, IDatabase, IEventBus, IHttpClient, ILogger, } from './tokens/core-tokens.ts';
export { CORE_TOKENS } from './tokens/core-tokens.ts';
export type { IDataLoader, IMetricsCollector, IModelStorage, INeuralNetworkTrainer, IOptimizationEngine, } from './tokens/neural-tokens.ts';
export { NEURAL_TOKENS } from './tokens/neural-tokens.ts';
export type { IAgentRegistry, ILoadBalancer, IMessageBroker, ISwarmCoordinator, ITopologyManager, } from './tokens/swarm-tokens.ts';
export { SWARM_TOKENS } from './tokens/swarm-tokens.ts';
export { createToken, createTokenFromClass, getTokenName, isDIToken, tokensEqual, } from './tokens/token-factory.ts';
export * from './types/di-types.ts';
/**
 * Get or create the global DI container.
 *
 * @example
 */
export declare function getGlobalContainer(): DIContainer;
/**
 * Set the global DI container (useful for testing).
 *
 * @param container
 * @example
 */
export declare function setGlobalContainer(container: DIContainer): void;
/**
 * Clear the global DI container.
 *
 * @example
 */
export declare function clearGlobalContainer(): void;
/**
 * Quick registration helpers.
 *
 * @example
 */
export declare class DIContainerBuilder {
    private container;
    /**
     * Register a singleton service.
     *
     * @param token
     * @param factory
     */
    singleton<T>(token: import('./types/di-types.ts').DIToken<T>, factory: (container: import('./types/di-types.ts').DIContainer) => T): this;
    /**
     * Register a transient service.
     *
     * @param token
     * @param factory
     */
    transient<T>(token: import('./types/di-types.ts').DIToken<T>, factory: (container: import('./types/di-types.ts').DIContainer) => T): this;
    /**
     * Register a scoped service.
     *
     * @param token
     * @param factory
     */
    scoped<T>(token: import('./types/di-types.ts').DIToken<T>, factory: (container: import('./types/di-types.ts').DIContainer) => T): this;
    /**
     * Build the configured container.
     */
    build(): DIContainer;
}
/**
 * Create a new container builder.
 *
 * @example
 */
export declare function createContainerBuilder(): DIContainerBuilder;
//# sourceMappingURL=index.d.ts.map