/**
 * Dependency Injection System Entry Point.
 * Provides a comprehensive, type-safe DI container for Claude Code Zen.
 */
/**
 * @file Di module exports.
 */
import { DIContainer } from './container/di-container';
export { DIContainer } from './container/di-container';
export { getInjectionToken, hasInjectionToken, inject, } from './decorators/inject';
export { getInjectionMetadata, injectable, isInjectable, } from './decorators/injectable';
export { SingletonProvider } from './providers/singleton-provider';
export { TransientProvider } from './providers/transient-provider';
export { ScopedProvider } from './providers/scoped-provider';
export type { Config, Database, EventBus, HttpClient, Logger, } from './tokens/core-tokens';
export { CORE_TOKENS } from './tokens/core-tokens';
export type { DataLoader, MetricsCollector, ModelStorage, NeuralNetworkTrainer, OptimizationEngine, } from './tokens/neural-tokens';
export { NEURAL_TOKENS } from './tokens/neural-tokens';
export type { AgentRegistry, LoadBalancer, MessageBroker, SwarmCoordinator, TopologyManager, } from './tokens/swarm-tokens';
export { SWARM_TOKENS } from './tokens/swarm-tokens';
export { createToken, createTokenFromClass, getTokenName, isDIToken, tokensEqual, } from './tokens/token-factory';
export * from './types/di-types';
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
    singleton<T>(token: import('./types/di-types').DIToken<T>, factory: (container: import('./types/di-types').DIContainer) => T): this;
    /**
     * Register a transient service.
     *
     * @param token
     * @param factory
     */
    transient<T>(token: import('./types/di-types').DIToken<T>, factory: (container: import('./types/di-types').DIContainer) => T): this;
    /**
     * Register a scoped service.
     *
     * @param token
     * @param factory
     */
    scoped<T>(token: import('./types/di-types').DIToken<T>, factory: (container: import('./types/di-types').DIContainer) => T): this;
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