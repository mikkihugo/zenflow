/**
 * @fileoverview Modern Dependency Injection using TSyringe
 * 
 * Professional DI system using the battle-tested TSyringe library.
 * Provides decorators, lifecycle management, and container features
 * with better ecosystem support and maintenance.
 * 
 * Features:
 * - Decorator-based injection with @injectable and @inject
 * - Singleton, transient, and scoped lifetimes
 * - Token-based dependency resolution
 * - Circular dependency detection
 * - Container hierarchies and child containers
 * 
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import 'reflect-metadata';
import { 
  container as tsyringeGlobalContainer, 
  injectable, 
  inject, 
  singleton,
  scoped,
  Lifecycle,
  DependencyContainer,
  InjectionToken,
  instanceCachingFactory,
  instancePerContainerCachingFactory
} from 'tsyringe';

import { getLogger } from './logging';

const logger = getLogger('di');

// Re-export TSyringe decorators and types
export { 
  injectable, 
  inject, 
  singleton,
  scoped,
  instanceCachingFactory,
  instancePerContainerCachingFactory
};
export type { 
  Lifecycle,
  DependencyContainer,
  InjectionToken
};

/**
 * DI container with logging and error handling
 */
export class DIContainer {
  private container: DependencyContainer;
  private readonly name: string;

  constructor(name: string = 'default', parentContainer?: DependencyContainer) {
    this.name = name;
    this.container = parentContainer ? parentContainer.createChildContainer() : tsyringeGlobalContainer;
    logger.debug(`Created DI container: ${name}`);
  }

  /**
   * Register a class with the container
   */
  register<T>(
    token: InjectionToken<T>,
    target: any,
    options?: {
      lifecycle?: Lifecycle;
    }
  ): this {
    try {
      const lifecycle = options?.lifecycle || Lifecycle.Transient;
      
      switch (lifecycle) {
        case Lifecycle.Singleton:
          this.container.registerSingleton(token, target);
          break;
        case Lifecycle.ContainerScoped:
          this.container.register(token, target, { lifecycle: Lifecycle.ContainerScoped });
          break;
        case Lifecycle.ResolutionScoped:
          this.container.register(token, target, { lifecycle: Lifecycle.ResolutionScoped });
          break;
        default:
          this.container.register(token, target);
      }
      
      logger.debug(`Registered ${String(token)} with lifecycle ${lifecycle}`);
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
      this.container.registerSingleton(token, target);
      logger.debug(`Registered singleton: ${String(token)}`);
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
      this.container.registerInstance(token, instance);
      logger.debug(`Registered instance: ${String(token)}`);
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
    factory: (container: DependencyContainer) => T,
    options?: { lifecycle?: Lifecycle }
  ): this {
    try {
      const lifecycle = options?.lifecycle || Lifecycle.Transient;
      
      this.container.register(token, factory as any, { lifecycle });
      
      logger.debug(`Registered factory for ${String(token)} with lifecycle ${lifecycle}`);
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
      const instance = this.container.resolve(token);
      logger.debug(`Resolved: ${String(token)}`);
      return instance;
    } catch (error) {
      logger.error(`Failed to resolve ${String(token)}:`, error);
      throw new DependencyResolutionError(`Failed to resolve ${String(token)}`, { cause: error });
    }
  }

  /**
   * Check if a token is registered
   */
  isRegistered<T>(token: InjectionToken<T>): boolean {
    return this.container.isRegistered(token);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.container.clearInstances();
    logger.debug(`Cleared container: ${this.name}`);
  }

  /**
   * Create a child container
   */
  createChild(name?: string): DIContainer {
    const childName = name || `${this.name}-child-${Date.now()}`;
    return new DIContainer(childName, this.container);
  }

  /**
   * Get the underlying TSyringe container for advanced usage
   */
  getRawContainer(): DependencyContainer {
    return this.container;
  }

  /**
   * Reset to the global container
   */
  reset(): void {
    this.container.reset();
    logger.debug(`Reset container: ${this.name}`);
  }

  /**
   * Get container name
   */
  getName(): string {
    return this.name;
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
   * Create a typed injection token
   */
  static create<T>(description: string): InjectionToken<T> {
    return Symbol(description) as InjectionToken<T>;
  }

  /**
   * Create a string-based token
   */
  static createString<T>(name: string): InjectionToken<T> {
    return name as InjectionToken<T>;
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
  options?: { lifecycle?: Lifecycle }
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
 * Helper decorators with logging
 */
export function loggingInjectable<T extends new (...args: any[]) => any>(target: T): T {
  injectable()(target);
  logger.debug(`Made injectable: ${target.name}`);
  return target;
}

export function loggingSingleton<T extends new (...args: any[]) => any>(target: T): T {
  singleton()(target);
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
    lifecycle?: Lifecycle;
  }>;
  instances?: Array<{
    token: InjectionToken<any>;
    instance: any;
  }>;
  factories?: Array<{
    token: InjectionToken<any>;
    factory: (container: DependencyContainer) => any;
    lifecycle?: Lifecycle;
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

// Export the global container as default
export default getGlobalContainer();