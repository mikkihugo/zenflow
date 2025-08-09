/**
 * Scoped dependency injection container implementation
 * Provides hierarchical scoping for service lifetimes
 */

import type { DIScope as IDIScope } from '../types/di-types';

export class DIScope implements IDIScope {
  private readonly scopedProviders = new Map<symbol, Provider<any>>();
  private readonly scopedInstances = new Map<symbol, any>();
  private readonly children = new Set<DIScope>();

  constructor(public readonly parent: DIContainer) {}

  /**
   * Register a service provider in this scope
   *
   * @param token
   * @param provider
   */
  register<T>(token: DIToken<T>, provider: Provider<T>): void {
    this.scopedProviders.set(token.symbol, provider);
  }

  /**
   * Resolve a service, checking scope hierarchy
   *
   * @param token
   */
  resolve<T>(token: DIToken<T>): T {
    // First check scoped providers
    const scopedProvider = this.scopedProviders.get(token.symbol);
    if (scopedProvider) {
      return this.resolveScoped(token, scopedProvider);
    }

    // Fallback to parent container
    return this.parent.resolve(token);
  }

  /**
   * Create a child scope
   */
  createScope(): IDIScope {
    const child = new DIScope(this);
    this.children.add(child);
    return child;
  }

  /**
   * Create a child scope (alias for createScope)
   */
  createChild(): IDIScope {
    return this.createScope();
  }

  /**
   * Dispose scope and all child scopes
   */
  async dispose(): Promise<void> {
    const disposalPromises: Promise<void>[] = [];

    // Dispose all scoped instances
    for (const [symbol, instance] of this.scopedInstances) {
      const provider = this.scopedProviders.get(symbol);
      if (provider?.dispose) {
        disposalPromises.push(provider.dispose(instance));
      }
    }

    // Dispose all child scopes
    for (const child of this.children) {
      disposalPromises.push(child?.dispose());
    }

    await Promise.all(disposalPromises);

    this.scopedInstances.clear();
    this.scopedProviders.clear();
    this.children.clear();
  }

  /**
   * Check if a service is registered in this scope
   *
   * @param token
   */
  isRegisteredInScope<T>(token: DIToken<T>): boolean {
    return this.scopedProviders.has(token.symbol);
  }

  /**
   * Resolve a scoped service with instance caching
   *
   * @param token
   * @param provider
   */
  private resolveScoped<T>(token: DIToken<T>, provider: Provider<T>): T {
    if (this.scopedInstances.has(token.symbol)) {
      return this.scopedInstances.get(token.symbol);
    }

    const instance = provider.create(this);
    this.scopedInstances.set(token.symbol, instance);
    return instance;
  }
}
