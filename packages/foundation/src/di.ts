/**
 * @fileoverview Modern Dependency Injection using Awilix
 * 
 * Professional DI system using the battle-tested Awilix library.
 * Provides service discovery, lifecycle management, scoping, and
 * health checking capabilities with modern patterns.
 * 
 * Features:
 * - Auto-discovery and registration of services
 * - Lifecycle management (singleton, scoped, transient)
 * - Service health checking and monitoring
 * - Type-safe service resolution
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

import { 
  asClass, 
  asFunction, 
  asValue,
  Lifetime,
  type AwilixContainer
} from 'awilix';

import { getLogger } from './logging';
import { ServiceContainer, createServiceContainer } from './di/service-container';

const logger = getLogger('di');

// Re-export Awilix types and patterns for external use
export { 
  Lifetime,
  asClass,
  asFunction,
  asValue
};
export type { 
  AwilixContainer
};

// Re-export ServiceContainer classes and types
export {
  ServiceContainer,
  createServiceContainer,
  getGlobalServiceContainer,
  type ServiceRegistrationOptions,
  type ServiceDiscoveryOptions,
  type ServiceInfo,
  type ServiceHealthReport,
  ServiceContainerError
} from './di/service-container';

/**
 * Modern injection token type (compatible with both awilix and legacy APIs)
 */
export type InjectionToken<T> = string | symbol | (new (...args: any[]) => T);

/**
 * Lifecycle options for compatibility with legacy APIs
 */
export enum LifecycleCompat {
  Transient = 'TRANSIENT',
  Singleton = 'SINGLETON', 
  ContainerScoped = 'SCOPED',
  ResolutionScoped = 'SCOPED'
}

/**
 * DI container with logging and error handling - now powered by Awilix
 */
export class DIContainer {
  private serviceContainer: ServiceContainer;
  private readonly name: string;

  constructor(name: string = 'default', parentContainer?: ServiceContainer) {
    this.name = name;
    this.serviceContainer = parentContainer ? parentContainer.createChild(name) : createServiceContainer(name);
    logger.debug(`Created DI container: ${name}`);
  }

  /**
   * Register a class with the container
   */
  register<T>(
    token: InjectionToken<T>,
    target: any,
    options?: {
      lifecycle?: LifecycleCompat;
    }
  ): this {
    try {
      const lifecycle = this.mapLifecycle(options?.lifecycle || LifecycleCompat.Transient);
      const tokenName = this.getTokenName(token);
      
      const result = this.serviceContainer.registerService(tokenName, target, { lifetime: lifecycle });
      
      if (result.isErr()) {
        throw result.error;
      }
      
      logger.debug(`Registered ${tokenName} with lifecycle ${lifecycle}`);
      return this;
    } catch (error) {
      logger.error(`Failed to register ${String(token)}:`, error);
      throw error;
    }
  }

  /**
   * Register a singleton instance
   */
  registerSingleton<T>(token: InjectionToken<T>, target: any): this {
    try {
      const tokenName = this.getTokenName(token);
      const result = this.serviceContainer.registerService(tokenName, target, { lifetime: Lifetime.SINGLETON });
      
      if (result.isErr()) {
        throw result.error;
      }
      
      logger.debug(`Registered singleton: ${tokenName}`);
      return this;
    } catch (error) {
      logger.error(`Failed to register singleton ${String(token)}:`, error);
      throw error;
    }
  }

  /**
   * Register an instance directly
   */
  registerInstance<T>(token: InjectionToken<T>, instance: T): this {
    try {
      const tokenName = this.getTokenName(token);
      const result = this.serviceContainer.registerInstance(tokenName, instance);
      
      if (result.isErr()) {
        throw result.error;
      }
      
      logger.debug(`Registered instance: ${tokenName}`);
      return this;
    } catch (error) {
      logger.error(`Failed to register instance ${String(token)}:`, error);
      throw error;
    }
  }

  /**
   * Register a factory function
   */
  registerFactory<T>(
    token: InjectionToken<T>,
    factory: (container: AwilixContainer) => T,
    options?: { lifecycle?: LifecycleCompat | typeof Lifetime }
  ): this {
    try {
      const lifecycle = this.mapLifecycle(options?.lifecycle || LifecycleCompat.Transient);
      const tokenName = this.getTokenName(token);
      
      const result = this.serviceContainer.registerFactory(tokenName, factory, { lifetime: lifecycle });
      
      if (result.isErr()) {
        throw result.error;
      }
      
      logger.debug(`Registered factory for ${tokenName} with lifecycle ${lifecycle}`);
      return this;
    } catch (error) {
      logger.error(`Failed to register factory for ${String(token)}:`, error);
      throw error;
    }
  }

  /**
   * Resolve a dependency
   */
  resolve<T>(token: InjectionToken<T>): T {
    try {
      const tokenName = this.getTokenName(token);
      const result = this.serviceContainer.resolve<T>(tokenName);
      
      if (result.isErr()) {
        throw result.error;
      }
      
      logger.debug(`Resolved: ${tokenName}`);
      return result.value;
    } catch (error) {
      logger.error(`Failed to resolve ${String(token)}:`, error);
      throw new DependencyResolutionError(`Failed to resolve ${String(token)}`, { cause: error });
    }
  }

  /**
   * Check if a token is registered
   */
  isRegistered<T>(token: InjectionToken<T>): boolean {
    const tokenName = this.getTokenName(token);
    return this.serviceContainer.hasService(tokenName);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    // Awilix doesn't have direct clearInstances, but we can create a new container
    this.serviceContainer = createServiceContainer(this.name);
    logger.debug(`Cleared container: ${this.name}`);
  }

  /**
   * Create a child container
   */
  createChild(name?: string): DIContainer {
    const childName = name || `${this.name}-child-${Date.now()}`;
    return new DIContainer(childName, this.serviceContainer);
  }

  /**
   * Get the underlying ServiceContainer for advanced usage
   */
  getRawContainer(): ServiceContainer {
    return this.serviceContainer;
  }

  /**
   * Get the underlying Awilix container for advanced usage
   */
  getAwilixContainer(): AwilixContainer {
    return this.serviceContainer.getRawContainer();
  }

  /**
   * Reset to a new container
   */
  reset(): void {
    this.serviceContainer = createServiceContainer(this.name);
    logger.debug(`Reset container: ${this.name}`);
  }

  /**
   * Get container name
   */
  getName(): string {
    return this.name;
  }

  // Private helper methods

  private getTokenName(token: InjectionToken<any>): string {
    if (typeof token === 'string') {
      return token;
    } else if (typeof token === 'symbol') {
      return token.toString();
    } else if (typeof token === 'function') {
      return token.name || 'AnonymousClass';
    } else {
      return String(token);
    }
  }

  private mapLifecycle(lifecycle: LifecycleCompat): typeof Lifetime.TRANSIENT | typeof Lifetime.SCOPED | typeof Lifetime.SINGLETON {
    if (typeof lifecycle === 'string' && lifecycle in Lifetime) {
      return Lifetime[lifecycle as keyof typeof Lifetime];
    }
    
    switch (lifecycle) {
      case LifecycleCompat.Singleton:
        return Lifetime.SINGLETON;
      case LifecycleCompat.ContainerScoped:
      case LifecycleCompat.ResolutionScoped:
        return Lifetime.SCOPED;
      case LifecycleCompat.Transient:
      default:
        return Lifetime.TRANSIENT;
    }
  }
}

/**
 * Custom error for dependency resolution failures
 */
export class DependencyResolutionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DependencyResolutionError';
  }
}

/**
 * Token factory for creating typed injection tokens
 */
export class TokenFactory {
  /**
   * Create a typed injection token (string-based for awilix compatibility)
   */
  static create<T>(description: string): InjectionToken<T> {
    return description as InjectionToken<T>;
  }

  /**
   * Create a string-based token
   */
  static createString<T>(name: string): InjectionToken<T> {
    return name as InjectionToken<T>;
  }

  /**
   * Create a symbol-based token (for legacy compatibility)
   */
  static createSymbol<T>(description: string): InjectionToken<T> {
    return Symbol(description) as InjectionToken<T>;
  }
}

/**
 * Core tokens for the claude-code-zen ecosystem
 */
export const TOKENS = {
  // Core services
  Logger: TokenFactory.create<any>('Logger'),
  Config: TokenFactory.create<any>('Config'),
  Database: TokenFactory.create<any>('Database'),
  
  // Storage services
  KeyValueStore: TokenFactory.create<any>('KeyValueStore'),
  VectorStore: TokenFactory.create<any>('VectorStore'),
  GraphStore: TokenFactory.create<any>('GraphStore'),
  
  // Neural services
  NeuralEngine: TokenFactory.create<any>('NeuralEngine'),
  LearningSystem: TokenFactory.create<any>('LearningSystem'),
  PredictionEngine: TokenFactory.create<any>('PredictionEngine'),
  
  // Swarm services
  SwarmCoordinator: TokenFactory.create<any>('SwarmCoordinator'),
  AgentManager: TokenFactory.create<any>('AgentManager'),
  TaskOrchestrator: TokenFactory.create<any>('TaskOrchestrator'),
  
  // Event services
  EventEmitter: TokenFactory.create<any>('EventEmitter'),
  EventBus: TokenFactory.create<any>('EventBus'),
  EventStore: TokenFactory.create<any>('EventStore'),
  
  // Monitoring services
  MetricsCollector: TokenFactory.create<any>('MetricsCollector'),
  HealthMonitor: TokenFactory.create<any>('HealthMonitor'),
  PerformanceTracker: TokenFactory.create<any>('PerformanceTracker'),
  
  // Telemetry services
  TelemetryManager: TokenFactory.create<any>('TelemetryManager'),
  TracingProvider: TokenFactory.create<any>('TracingProvider'),
  MetricsProvider: TokenFactory.create<any>('MetricsProvider')
} as const;

// Global container instance
let globalContainer: DIContainer | null = null;

/**
 * Get the global DI container
 */
export function getGlobalContainer(): DIContainer {
  if (!globalContainer) {
    globalContainer = new DIContainer('global');
    logger.debug('Created global DI container');
  }
  return globalContainer;
}

/**
 * Create a new container
 */
export function createContainer(name?: string, parent?: DIContainer): DIContainer {
  const containerName = name || `container-${Date.now()}`;
  return new DIContainer(containerName, parent?.getRawContainer());
}

/**
 * Register a service with the global container
 */
export function registerGlobal<T>(
  token: InjectionToken<T>,
  target: any,
  options?: { lifecycle?: LifecycleCompat | typeof Lifetime }
): void {
  getGlobalContainer().register(token, target, options);
}

/**
 * Register a singleton with the global container
 */
export function registerGlobalSingleton<T>(token: InjectionToken<T>, target: any): void {
  getGlobalContainer().registerSingleton(token, target);
}

/**
 * Register an instance with the global container
 */
export function registerGlobalInstance<T>(token: InjectionToken<T>, instance: T): void {
  getGlobalContainer().registerInstance(token, instance);
}

/**
 * Resolve from the global container
 */
export function resolveGlobal<T>(token: InjectionToken<T>): T {
  return getGlobalContainer().resolve(token);
}

/**
 * Check if registered in global container
 */
export function isRegisteredGlobal<T>(token: InjectionToken<T>): boolean {
  return getGlobalContainer().isRegistered(token);
}

/**
 * Clear the global container
 */
export function clearGlobal(): void {
  getGlobalContainer().clear();
}

/**
 * Reset the global container completely
 */
export function resetGlobal(): void {
  getGlobalContainer().reset();
  globalContainer = null;
}

/**
 * Compatibility decorators for legacy code migration
 */
export function injectable<T extends new (...args: any[]) => any>(target: T): T {
  // Awilix doesn't need explicit decorators, but we keep for compatibility
  logger.debug(`Made injectable (awilix-compatible): ${target.name}`);
  return target;
}

export function inject(token: InjectionToken<any>) {
  // Return a property decorator for compatibility
  return function (target: any, propertyKey: string | symbol | undefined) {
    // Store injection metadata for potential future use
    logger.debug(`Marked for injection: ${String(propertyKey)} with token ${String(token)}`);
  };
}

export function singleton<T extends new (...args: any[]) => any>(target: T): T {
  // Register as singleton when used
  logger.debug(`Made singleton (awilix-compatible): ${target.name}`);
  return target;
}

export function scoped<T extends new (...args: any[]) => any>(target: T): T {
  // Register as scoped when used
  logger.debug(`Made scoped (awilix-compatible): ${target.name}`);
  return target;
}

// Compatibility functions
export function instanceCachingFactory<T>(factory: () => T): () => T {
  let instance: T;
  let hasInstance = false;
  
  return () => {
    if (!hasInstance) {
      instance = factory();
      hasInstance = true;
    }
    return instance;
  };
}

export function instancePerContainerCachingFactory<T>(factory: () => T): () => T {
  // For awilix, this is similar to instance caching but scoped
  return instanceCachingFactory(factory);
}

/**
 * Helper decorators with logging
 */
export function loggingInjectable<T extends new (...args: any[]) => any>(target: T): T {
  injectable(target);
  logger.debug(`Made injectable: ${target.name}`);
  return target;
}

export function loggingSingleton<T extends new (...args: any[]) => any>(target: T): T {
  singleton(target);
  logger.debug(`Made singleton: ${target.name}`);
  return target;
}

/**
 * Configuration helper for quick DI setup
 */
export interface DIConfiguration {
  services: Array<{
    token: InjectionToken<any>;
    implementation: any;
    lifecycle?: LifecycleCompat | Lifetime;
  }>;
  instances?: Array<{
    token: InjectionToken<any>;
    instance: any;
  }>;
  factories?: Array<{
    token: InjectionToken<any>;
    factory: (container: AwilixContainer) => any;
    lifecycle?: LifecycleCompat | Lifetime;
  }>;
}

/**
 * Configure DI container from configuration object
 */
export function configureDI(config: DIConfiguration, container?: DIContainer): DIContainer {
  const targetContainer = container || getGlobalContainer();
  
  // Register services
  for (const service of config.services) {
    targetContainer.register(service.token, service.implementation, {
      lifecycle: service.lifecycle
    });
  }
  
  // Register instances
  if (config.instances) {
    for (const instance of config.instances) {
      targetContainer.registerInstance(instance.token, instance.instance);
    }
  }
  
  // Register factories
  if (config.factories) {
    for (const factory of config.factories) {
      targetContainer.registerFactory(factory.token, factory.factory, {
        lifecycle: factory.lifecycle
      });
    }
  }
  
  logger.info(`Configured DI container with ${config.services.length} services, ${config.instances?.length || 0} instances, ${config.factories?.length || 0} factories`);
  
  return targetContainer;
}

// Export types for external compatibility
export type DependencyContainer = ServiceContainer;
export type Lifecycle = LifecycleCompat;

// Export the global container as default
export default getGlobalContainer();