/**
 * Event Adapter Registry - Breaks Circular Dependencies
 *
 * Central registry for event adapters to avoid circular imports
 * between factories.ts and individual adapter files.
 */

import type {
  EventManagerType,
  EventManager,
  EventManagerConfig,
} from './core/interfaces';
import { 
  getSharedConfig, 
  getLogger,
  type SharedConfig
} from '@claude-zen/foundation';

/**
 * Factory interface for event manager creation.
 */
interface EventManagerFactory {
  create(config: EventManagerConfig): Promise<EventManager>;
}

/**
 * Registry for event adapter factories.
 */
class EventAdapterRegistry {
  private adapters = new Map<string, () => Promise<EventManagerFactory>>();

  /**
   * Register an adapter factory.
   */
  register(name: string, loader: () => Promise<EventManagerFactory>): void {
    this.adapters.set(name, loader);
  }

  /**
   * Get an adapter factory.
   */
  async get(name: string): Promise<EventManagerFactory | null> {
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
    const module = await import('./adapters/workflow-event-factory');
    const logger = getLogger('WorkflowEventFactory');
    const config = getSharedConfig();
    return new module.WorkflowEventManagerFactory(logger, config);
  });

  // Register neural event factory
  adapterRegistry.register('neural', async () => {
    const module = await import('./adapters/neural-event-factory');
    const logger = getLogger('NeuralEventFactory');
    const config = getSharedConfig();
    return new module.NeuralEventManagerFactory(logger, config);
  });

  // Register memory event factory
  adapterRegistry.register('memory', async () => {
    const module = await import('./adapters/memory-event-factory');
    const logger = getLogger('MemoryEventFactory');
    const config = getSharedConfig();
    return new module.MemoryEventManagerFactory(logger, config);
  });

  // Register interface event factory
  adapterRegistry.register('interface', async () => {
    const module = await import('./adapters/interface-event-factory');
    const logger = getLogger('InterfaceEventFactory');
    const config = getSharedConfig();
    return new module.InterfaceEventManagerFactory(logger, config);
  });

  // Register database event factory
  adapterRegistry.register('database', async () => {
    const module = await import('./adapters/database-event-factory');
    const logger = getLogger('DatabaseEventFactory');
    const config = getSharedConfig();
    return new module.DatabaseEventManagerFactory(logger, config);
  });
}

/**
 * Initialize the adapter registry with default adapters.
 */
export function initializeAdapterRegistry(): void {
  registerDefaultAdapters();
}

export default adapterRegistry;
