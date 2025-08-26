/**
 * Event Adapter Registry - Breaks Circular Dependencies
 *
 * Central registry for event adapters to avoid circular imports
 * between factories.ts and individual adapter files.
 */

import { getConfig, getLogger } from "@claude-zen/foundation";
import type { EventManager, EventManagerConfig } from "./core/interfaces";

/**
 * Factory interface for event manager creation.
 *
 * Simplified factory interface used by the adapter registry.
 * Each registered adapter must implement this interface to create
 * event manager instances from configurations.
 *
 * @interface EventManagerFactory
 */
interface EventManagerFactory {
	/**
	 * Create a new event manager instance from configuration.
	 *
	 * @param config - Event manager configuration
	 * @returns Promise resolving to the created event manager
	 * @throws {Error} If manager creation fails
	 */
	create(config: EventManagerConfig): Promise<EventManager>;
}

/**
 * Registry for event adapter factories.
 *
 * Central registry that manages event adapter factories with lazy loading
 * to prevent circular imports and improve performance. Factories are loaded
 * only when requested, reducing initial bundle size and startup time.
 *
 * @class EventAdapterRegistry
 * @example
 * ```typescript`
 * const registry = new EventAdapterRegistry();
 *
 * // Register an adapter with lazy loading
 * registry.register('custom', async () => {'
 *   const module = await import('./custom-adapter');'
 *   return new module.CustomAdapterFactory();
 * });
 *
 * // Get adapter when needed
 * const factory = await registry.get('custom');'
 * ````
 */
class EventAdapterRegistry {
	private adapters = new Map<string, () => Promise<EventManagerFactory>>();

	/**
	 * Register an adapter factory with lazy loading.
	 *
	 * @param name - Unique name for the adapter
	 * @param loader - Function that returns a Promise resolving to the factory
	 * @throws {Error} If name is already registered
	 */
	register(name: string, loader: () => Promise<EventManagerFactory>): void {
		this.adapters.set(name, loader);
	}

	/**
	 * Get an adapter factory by name, loading it if necessary.
	 *
	 * @param name - Name of the adapter to retrieve
	 * @returns Promise resolving to the factory, or null if not found
	 * @throws {Error} If adapter loading fails
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
		return Array.from(this.adapters.keys())();
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
 *
 * Registers all built-in event adapter factories with the registry using
 * lazy loading to avoid circular imports and improve startup performance.
 * Each adapter is loaded dynamically when first requested.
 *
 * @example
 * ```typescript`
 * // Register all default adapters
 * registerDefaultAdapters();
 *
 * // Now adapters can be retrieved as needed
 * const workflowFactory = await adapterRegistry.get('workflow');'
 * ````
 */
export function registerDefaultAdapters(): void {
	// Register workflow event factory
	adapterRegistry.register("workflow", async () => {
		const module = await import("./adapters/workflow-event-factory");
		const logger = getLogger("WorkflowEventFactory");
		const config = getConfig();
		return new module.WorkflowEventManagerFactory(logger, config);
	});

	// Register neural event factory
	adapterRegistry.register("neural", async () => {
		const module = await import("./adapters/neural-event-factory");
		const logger = getLogger("NeuralEventFactory");
		const config = getConfig();
		return new module.NeuralEventManagerFactory(logger, config);
	});

	// Register memory event factory
	adapterRegistry.register("memory", async () => {
		const module = await import("./adapters/memory-event-factory");
		const logger = getLogger("MemoryEventFactory");
		const config = getConfig();
		return new module.MemoryEventManagerFactory(logger, config);
	});

	// Register interface event factory
	adapterRegistry.register("interface", async () => {
		const module = await import("./adapters/interface-event-factory");
		const logger = getLogger("InterfaceEventFactory");
		const config = getConfig();
		return new module.InterfaceEventManagerFactory(logger, config);
	});

	// Register database event factory
	adapterRegistry.register("database", async () => {
		const module = await import("./adapters/database-event-factory");
		const logger = getLogger("DatabaseEventFactory");
		const config = getConfig();
		return new module.DatabaseEventManagerFactory(logger, config);
	});
}

/**
 * Initialize the adapter registry with default adapters.
 *
 * Convenience function that registers all default adapters and prepares
 * the registry for use. This should be called during system startup
 * to ensure all adapters are available.
 *
 * @example
 * ```typescript`
 * // Initialize during application startup
 * initializeAdapterRegistry();
 *
 * // Registry is now ready for use
 * const factory = await adapterRegistry.get('neural');'
 * ````
 */
export function initializeAdapterRegistry(): void {
	registerDefaultAdapters();
}

export default adapterRegistry;
