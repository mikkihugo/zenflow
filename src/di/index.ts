/**
 * Dependency Injection System Entry Point
 * Provides a comprehensive, type-safe DI container for Claude Code Zen
 */

// Container implementations
export { DIContainer } from './container/di-container.js';
export { DIScope } from './container/di-scope.js';
export { getInjectionToken, hasInjectionToken, inject } from './decorators/inject.js';
// Decorators
export { getInjectionMetadata, injectable, isInjectable } from './decorators/injectable.js';
export { FactoryProvider } from './providers/factory-provider.js';
export { ScopedProvider } from './providers/scoped-provider.js';
// Provider implementations
export { SingletonProvider } from './providers/singleton-provider.js';
export { TransientProvider } from './providers/transient-provider.js';
// Re-export interfaces for convenience
export type {
  IConfig,
  IDatabase,
  IEventBus,
  IHttpClient,
  ILogger,
} from './tokens/core-tokens.js';
// Core system tokens
export { CORE_TOKENS } from './tokens/core-tokens.js';
export type {
  IDataLoader,
  IMetricsCollector,
  IModelStorage,
  INeuralNetworkTrainer,
  IOptimizationEngine,
} from './tokens/neural-tokens.js';
export { NEURAL_TOKENS } from './tokens/neural-tokens.js';
export type {
  IAgentRegistry,
  ILoadBalancer,
  IMessageBroker,
  ISwarmCoordinator,
  ITopologyManager,
} from './tokens/swarm-tokens.js';
export { SWARM_TOKENS } from './tokens/swarm-tokens.js';
// Token utilities
export {
  createToken,
  createTokenFromClass,
  getTokenName,
  isDIToken,
  tokensEqual,
} from './tokens/token-factory.js';
// Core types and interfaces
export * from './types/di-types.js';

/**
 * Global DI container instance (singleton pattern for convenience)
 */
let globalContainer: DIContainer | undefined;

/**
 * Get or create the global DI container
 */
export function getGlobalContainer(): DIContainer {
  if (!globalContainer) {
    globalContainer = new DIContainer();
  }
  return globalContainer;
}

/**
 * Set the global DI container (useful for testing)
 */
export function setGlobalContainer(container: DIContainer): void {
  globalContainer = container;
}

/**
 * Clear the global DI container
 */
export function clearGlobalContainer(): void {
  globalContainer = undefined;
}

/**
 * Quick registration helpers
 */
export class DIContainerBuilder {
  private container = new DIContainer();

  /**
   * Register a singleton service
   */
  singleton<T>(
    token: import('./types/di-types.js').DIToken<T>,
    factory: (container: DIContainer) => T
  ): this {
    this.container.register(token, new SingletonProvider(factory));
    return this;
  }

  /**
   * Register a transient service
   */
  transient<T>(
    token: import('./types/di-types.js').DIToken<T>,
    factory: (container: DIContainer) => T
  ): this {
    this.container.register(token, new TransientProvider(factory));
    return this;
  }

  /**
   * Register a scoped service
   */
  scoped<T>(
    token: import('./types/di-types.js').DIToken<T>,
    factory: (container: DIContainer) => T
  ): this {
    this.container.register(token, new ScopedProvider(factory));
    return this;
  }

  /**
   * Build the configured container
   */
  build(): DIContainer {
    return this.container;
  }
}

/**
 * Create a new container builder
 */
export function createContainerBuilder(): DIContainerBuilder {
  return new DIContainerBuilder();
}

// Export integration examples
export {
  CompleteSystemIntegration,
  runCompleteIntegration,
} from './examples/complete-system-integration.js';
