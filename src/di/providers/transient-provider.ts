/**
 * Transient provider implementation
 * Creates a new instance every time the service is resolved
 */

import type { Provider, DIContainer } from '../types/di-types.js';

export class TransientProvider<T> implements Provider<T> {
  readonly type = 'transient' as const;

  constructor(
    private readonly factory: (container: DIContainer) => T,
    private readonly disposeFn?: (instance: T) => Promise<void>
  ) {}

  create(container: DIContainer): T {
    return this.factory(container);
  }

  async dispose(instance: T): Promise<void> {
    if (this.disposeFn) {
      await this.disposeFn(instance);
    }
  }
}