/**
 * Dependency Injection System Entry Point.
 * Provides a comprehensive, type-safe DI container for Claude Code Zen.
 */
// Container implementations - Import for internal use and export
/**
 * @file Di module exports.
 */
import { DIContainer } from './container/di-container';
import { ScopedProvider } from './providers/scoped-provider';
import { SingletonProvider } from './providers/singleton-provider';
import { TransientProvider } from './providers/transient-provider';
// Re-export for external use
export { DIContainer } from './container/di-container';
export { DIScope } from './container/di-scope';
export { getInjectionToken, hasInjectionToken, inject, } from './decorators/inject';
// Decorators
export { getInjectionMetadata, injectable, isInjectable, } from './decorators/injectable';
export { FactoryProvider } from './providers/factory-provider';
export { ScopedProvider } from './providers/scoped-provider';
// Provider implementations
export { SingletonProvider } from './providers/singleton-provider';
export { TransientProvider } from './providers/transient-provider';
// Core system tokens
export { CORE_TOKENS } from './tokens/core-tokens';
export { NEURAL_TOKENS } from './tokens/neural-tokens';
export { SWARM_TOKENS } from './tokens/swarm-tokens';
// Token utilities
export { createToken, createTokenFromClass, getTokenName, isDIToken, tokensEqual, } from './tokens/token-factory';
// Core types and interfaces
export * from './types/di-types';
/**
 * Global DI container instance (singleton pattern for convenience).
 */
let globalContainer;
/**
 * Get or create the global DI container.
 *
 * @example
 */
export function getGlobalContainer() {
    if (!globalContainer) {
        globalContainer = new DIContainer();
    }
    return globalContainer;
}
/**
 * Set the global DI container (useful for testing).
 *
 * @param container
 * @example
 */
export function setGlobalContainer(container) {
    globalContainer = container;
}
/**
 * Clear the global DI container.
 *
 * @example
 */
export function clearGlobalContainer() {
    globalContainer = undefined;
}
/**
 * Quick registration helpers.
 *
 * @example
 */
export class DIContainerBuilder {
    container = new DIContainer();
    /**
     * Register a singleton service.
     *
     * @param token
     * @param factory
     */
    singleton(token, factory) {
        this.container.register(token, new SingletonProvider(factory));
        return this;
    }
    /**
     * Register a transient service.
     *
     * @param token
     * @param factory
     */
    transient(token, factory) {
        this.container.register(token, new TransientProvider(factory));
        return this;
    }
    /**
     * Register a scoped service.
     *
     * @param token
     * @param factory
     */
    scoped(token, factory) {
        this.container.register(token, new ScopedProvider(factory));
        return this;
    }
    /**
     * Build the configured container.
     */
    build() {
        return this.container;
    }
}
/**
 * Create a new container builder.
 *
 * @example
 */
export function createContainerBuilder() {
    return new DIContainerBuilder();
}
// Note: Integration examples are available in ./examples/ directory
// Import them directly when needed to avoid circular dependencies
//# sourceMappingURL=index.js.map