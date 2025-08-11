/**
 * Event Adapter Registry - Breaks Circular Dependencies
 * 
 * Central registry for event adapters to avoid circular imports
 * between factories.ts and individual adapter files.
 */

import type { IEventManagerFactory, EventManagerType } from './core/interfaces.ts';

/**
 * Registry for event adapter factories.
 */
class EventAdapterRegistry {
  private adapters = new Map<string, () => Promise<IEventManagerFactory>>();

  /**
   * Register an adapter factory.
   */
  register(name: string, loader: () => Promise<IEventManagerFactory>): void {
    this.adapters.set(name, loader);
  }

  /**
   * Get an adapter factory.
   */
  async get(name: string): Promise<IEventManagerFactory | null> {
    const loader = this.adapters.get(name);
    if (!loader) return null;
    return loader();
  }

  /**
   * Get all registered adapter names.
   */
  getRegisteredNames(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if an adapter is registered.
   */
  has(name: string): boolean {
    return this.adapters.has(name);
  }
}

/**
 * Global adapter registry instance.
 */
export const adapterRegistry = new EventAdapterRegistry();

/**
 * Register all default adapters without importing them (lazy loading).
 */
export function registerDefaultAdapters(): void {
  // Register workflow event factory
  adapterRegistry.register('workflow', async () => {
    const module = await import('./adapters/workflow-event-factory.ts');
    return module.WorkflowEventFactory;
  });

  // Register neural event factory  
  adapterRegistry.register('neural', async () => {
    const module = await import('./adapters/neural-event-factory.ts');
    return module.NeuralEventFactory;
  });

  // Register memory event factory
  adapterRegistry.register('memory', async () => {
    const module = await import('./adapters/memory-event-factory.ts');
    return module.MemoryEventFactory;
  });

  // Register interface event factory
  adapterRegistry.register('interface', async () => {
    const module = await import('./adapters/interface-event-factory.ts');
    return module.InterfaceEventFactory;
  });

  // Register database event factory
  adapterRegistry.register('database', async () => {
    const module = await import('./adapters/database-event-factory.ts');
    return module.DatabaseEventFactory;
  });
}

/**
 * Initialize the adapter registry with default adapters.
 */
export function initializeAdapterRegistry(): void {
  registerDefaultAdapters();
}

export default adapterRegistry;