/**
 * Singleton provider implementation.
 * Ensures only one instance of a service exists throughout the application lifetime.
 */
/**
 * @file singleton-provider implementation
 */



import type { Provider } from '../types/di-types';

export class SingletonProvider<T> implements Provider<T> {
  readonly type = 'singleton' as const;
  private instance: T | undefined;
  private isCreating = false;

  constructor(
    private readonly factory: (container: DIContainer) => T,
    private readonly disposeFn?: (instance: T) => Promise<void>
  ) {}

  create(container: DIContainer): T {
    if (this.instance !== undefined) {
      return this.instance;
    }

    if (this.isCreating) {
      throw new Error('Circular dependency detected during singleton creation');
    }

    this.isCreating = true;
    try {
      this.instance = this.factory(container);
      return this.instance;
    } finally {
      this.isCreating = false;
    }
  }

  async dispose(instance: T): Promise<void> {
    if (this.disposeFn) {
      await this.disposeFn(instance);
    }
    this.instance = undefined;
  }

  /**
   * Check if instance has been created.
   */
  get hasInstance(): boolean {
    return this.instance !== undefined;
  }

  /**
   * Get the instance without creating it (returns undefined if not created).
   */
  get currentInstance(): T | undefined {
    return this.instance;
  }
}
