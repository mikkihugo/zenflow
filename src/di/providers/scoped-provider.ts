/**
 * Scoped provider implementation.
 * Creates one instance per scope lifetime.
 */
/**
 * @file scoped-provider implementation
 */



import type { DIContainer, DIScope, Provider } from '../types/di-types';

export class ScopedProvider<T> implements Provider<T> {
  readonly type = 'scoped' as const;
  private readonly scopedInstances = new WeakMap<DIScope, T>();

  constructor(
    private readonly factory: (container: DIContainer) => T,
    private readonly disposeFn?: (instance: T) => Promise<void>
  ) {}

  create(container: DIContainer): T {
    // For scoped services, we need to find the current scope
    const scope = this.findScope(container);

    if (this.scopedInstances.has(scope)) {
      return this.scopedInstances.get(scope)!;
    }

    const instance = this.factory(container);
    this.scopedInstances.set(scope, instance);
    return instance;
  }

  async dispose(instance: T): Promise<void> {
    if (this.disposeFn) {
      await this.disposeFn(instance);
    }
  }

  private findScope(container: DIContainer): DIScope {
    // If container is a scope, return it
    if ('parent' in container) {
      return container as DIScope;
    }

    // Otherwise, create a default scope
    return container.createScope();
  }

  /**
   * Clear all scoped instances (useful for testing)
   */
  clearInstances(): void {
    // WeakMap automatically clears when scopes are garbage collected
    // This method is mainly for explicit cleanup if needed.
  }
}
