import { getLogger } from "../../config/logging-config";
const logger = getLogger("di-container-di-container");
/**
 * Main dependency injection container implementation
 * Provides type-safe service registration and resolution.
 */

import type { DIScope, DIContainer as IDIContainer } from '../types/di-types';
import { CircularDependencyError, DIError, ServiceNotFoundError } from '../types/di-types';

export class DIContainer implements IDIContainer {
  private readonly providers = new Map<symbol, Provider<any>>();
  private readonly singletonInstances = new Map<symbol, any>();
  private readonly scopes = new WeakSet<DIScope>();
  private readonly resolutionStack: symbol[] = [];
  private readonly options: Required<DIContainerOptions>;

  constructor(options: DIContainerOptions = {}) {
    this.options = {
      enableCircularDependencyDetection: options?.["enableCircularDependencyDetection"] ?? true,
      maxResolutionDepth: options?.["maxResolutionDepth"] ?? 50,
      enablePerformanceMetrics: options?.["enablePerformanceMetrics"] ?? false,
      autoRegisterByConvention: options?.["autoRegisterByConvention"] ?? false,
    };
  }

  /**
   * Register a service provider with the container.
   *
   * @param token
   * @param provider
   */
  register<T>(token: DIToken<T>, provider: Provider<T>): void {
    if (this.providers.has(token.symbol)) {
      logger.warn(`Provider for token '${token.name}' is being overwritten`);
    }

    this.providers.set(token.symbol, provider);
  }

  /**
   * Resolve a service from the container.
   *
   * @param token
   */
  resolve<T>(token: DIToken<T>): T {
    const startTime = this.options.enablePerformanceMetrics ? Date.now() : 0;

    try {
      const result = this.resolveInternal(token);

      if (this.options.enablePerformanceMetrics) {
        const duration = Date.now() - startTime;
        this.recordResolutionMetric(token, duration);
      }

      return result;
    } catch (error) {
      if (error instanceof DIError) {
        throw error;
      }
      throw new DIError(`Failed to resolve service '${token.name}': ${error}`, 'RESOLUTION_FAILED');
    }
  }

  /**
   * Create a new scope.
   */
  createScope(): DIScope {
    // Import DIScope dynamically to avoid circular dependency
    const DIScopeModule = require('./di-scope.js');
    const DIScopeImpl = DIScopeModule.DIScope;
    const scope = new DIScopeImpl(this);
    this.scopes.add(scope);
    return scope;
  }

  /**
   * Dispose all singleton instances and clean up resources.
   */
  async dispose(): Promise<void> {
    const disposalPromises: Promise<void>[] = [];

    // Dispose all singleton instances
    for (const [symbol, instance] of this.singletonInstances) {
      const provider = this.providers.get(symbol);
      if (provider?.dispose) {
        disposalPromises.push(provider.dispose(instance));
      }
    }

    await Promise.all(disposalPromises);

    this.singletonInstances.clear();
    this.providers.clear();
  }

  /**
   * Check if a service is registered.
   *
   * @param token
   */
  isRegistered<T>(token: DIToken<T>): boolean {
    return this.providers.has(token.symbol);
  }

  /**
   * Get all registered tokens (for debugging).
   */
  getRegisteredTokens(): string[] {
    return Array.from(this.providers.entries()).map(([symbol, _]) => {
      // Find token name by symbol (reverse lookup)
      for (const [tokenSymbol, _provider] of this.providers) {
        if (tokenSymbol === symbol) {
          return symbol.toString();
        }
      }
      return symbol.toString();
    });
  }

  /**
   * Internal resolution with circular dependency detection.
   *
   * @param token
   */
  private resolveInternal<T>(token: DIToken<T>): T {
    // Check circular dependency
    if (this.options.enableCircularDependencyDetection) {
      if (this.resolutionStack.includes(token.symbol)) {
        const chain = this.resolutionStack.map((s) => s.toString()).concat(token.name);
        throw new CircularDependencyError(chain);
      }

      if (this.resolutionStack.length >= this.options.maxResolutionDepth) {
        throw new DIError(
          `Maximum resolution depth exceeded (${this.options.maxResolutionDepth})`,
          'MAX_DEPTH_EXCEEDED'
        );
      }
    }

    const provider = this.providers.get(token.symbol);
    if (!provider) {
      throw new ServiceNotFoundError(token.name);
    }

    this.resolutionStack.push(token.symbol);

    try {
      switch (provider.type) {
        case 'singleton':
          return this.resolveSingleton(token, provider);
        case 'transient':
          return provider.create(this);
        case 'scoped':
          return provider.create(this);
        default:
          throw new DIError(
            `Unknown provider type: ${(provider as any).type}`,
            'UNKNOWN_PROVIDER_TYPE'
          );
      }
    } finally {
      this.resolutionStack.pop();
    }
  }

  /**
   * Resolve singleton with instance caching.
   *
   * @param token
   * @param provider
   */
  private resolveSingleton<T>(token: DIToken<T>, provider: Provider<T>): T {
    if (this.singletonInstances.has(token.symbol)) {
      return this.singletonInstances.get(token.symbol);
    }

    const instance = provider.create(this);
    this.singletonInstances.set(token.symbol, instance);
    return instance;
  }

  /**
   * Record performance metrics for service resolution.
   *
   * @param token - The service token that was resolved.
   * @param duration - Resolution time in milliseconds.
   */
  private recordResolutionMetric<T>(token: DIToken<T>, duration: number): void {
    // Log performance metric - could be extended to use proper metrics collector
    logger.debug(`DI Resolution: ${token.name} resolved in ${duration}ms`);
  }
}