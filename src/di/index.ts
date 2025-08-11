/**
 * Dependency Injection System Entry Point.
 * Provides a comprehensive, type-safe DI container for Claude Code Zen.
 */

// Container implementations - Import for internal use and export
/**
 * @file Di module exports.
 */

import { DIContainer } from './container/di-container.ts';
import { DIScope } from './container/di-scope.ts';
import { FactoryProvider } from './providers/factory-provider.ts';
import { ScopedProvider } from './providers/scoped-provider.ts';
import { SingletonProvider } from './providers/singleton-provider.ts';
import { TransientProvider } from './providers/transient-provider.ts';

// Re-export for external use
export { DIContainer } from './container/di-container.ts';
export { DIScope } from './container/di-scope.ts';
export {
  getInjectionToken,
  hasInjectionToken,
  inject,
} from './decorators/inject.ts';
// Decorators
export {
  getInjectionMetadata,
  injectable,
  isInjectable,
} from './decorators/injectable.ts';
export { FactoryProvider } from './providers/factory-provider.ts';
export { ScopedProvider } from './providers/scoped-provider.ts';
// Provider implementations
export { SingletonProvider } from './providers/singleton-provider.ts';
export { TransientProvider } from './providers/transient-provider.ts';
// Re-export interfaces for convenience
export type {
  IConfig,
  IDatabase,
  IEventBus,
  IHttpClient,
  ILogger,
} from './tokens/core-tokens.ts';
// Core system tokens
export { CORE_TOKENS } from './tokens/core-tokens.ts';
export type {
  IDataLoader,
  IMetricsCollector,
  IModelStorage,
  INeuralNetworkTrainer,
  IOptimizationEngine,
} from './tokens/neural-tokens.ts';
export { NEURAL_TOKENS } from './tokens/neural-tokens.ts';
export type {
  IAgentRegistry,
  ILoadBalancer,
  IMessageBroker,
  ISwarmCoordinator,
  ITopologyManager,
} from './tokens/swarm-tokens.ts';
export { SWARM_TOKENS } from './tokens/swarm-tokens.ts';
// Token utilities
export {
  createToken,
  createTokenFromClass,
  getTokenName,
  isDIToken,
  tokensEqual,
} from './tokens/token-factory.ts';
// Core types and interfaces
export * from './types/di-types.ts';

/**
 * Global DI container instance (singleton pattern for convenience).
 */
let globalContainer: DIContainer | undefined;

/**
 * Get or create the global DI container.
 *
 * @example
 */
export function getGlobalContainer(): DIContainer {
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
export function setGlobalContainer(container: DIContainer): void {
  globalContainer = container;
}

/**
 * Clear the global DI container.
 *
 * @example
 */
export function clearGlobalContainer(): void {
  globalContainer = undefined;
}

/**
 * Quick registration helpers.
 *
 * @example
 */
export class DIContainerBuilder {
  private container = new DIContainer();

  /**
   * Register a singleton service.
   *
   * @param token
   * @param factory
   */
  singleton<T>(
    token: import('./types/di-types.ts').DIToken<T>,
    factory: (container: import('./types/di-types.ts').DIContainer) => T
  ): this {
    this.container.register(token, new SingletonProvider(factory));
    return this;
  }

  /**
   * Register a transient service.
   *
   * @param token
   * @param factory
   */
  transient<T>(
    token: import('./types/di-types.ts').DIToken<T>,
    factory: (container: import('./types/di-types.ts').DIContainer) => T
  ): this {
    this.container.register(token, new TransientProvider(factory));
    return this;
  }

  /**
   * Register a scoped service.
   *
   * @param token
   * @param factory
   */
  scoped<T>(
    token: import('./types/di-types.ts').DIToken<T>,
    factory: (container: import('./types/di-types.ts').DIContainer) => T
  ): this {
    this.container.register(token, new ScopedProvider(factory));
    return this;
  }

  /**
   * Build the configured container.
   */
  build(): DIContainer {
    return this.container;
  }
}

/**
 * Create a new container builder.
 *
 * @example
 */
export function createContainerBuilder(): DIContainerBuilder {
  return new DIContainerBuilder();
}

// Note: Integration examples are available in ./examples/ directory
// Import them directly when needed to avoid circular dependencies
