/**
 * @file Coordination system: singleton-container.
 */

import { getLogger } from '../../../config/logging-config.ts';

const logger = getLogger('coordination-swarm-core-singleton-container');
/**
 * Registration options for singleton container.
 *
 * @example
 */
interface RegistrationOptions {
  lazy?: boolean;
  singleton?: boolean;
  dependencies?: string[];
}

/**
 * Singleton Container - Dependency Injection Pattern.
 * Replaces global state management with proper IoC container.
 *
 * @example
 */
class SingletonContainer {
  public instances: Map<string, any>;
  public factories: Map<string, any>;
  public isDestroying: boolean;

  constructor() {
    this.instances = new Map();
    this.factories = new Map();
    this.isDestroying = false;
  }

  /**
   * Register a singleton factory.
   *
   * @param {string} key - Service identifier.
   * @param {Function} factory - Factory function to create instance.
   * @param {Object} options - Configuration options.
   */
  register(
    key: string,
    factory: (...args: unknown[]) => any,
    options: RegistrationOptions = {},
  ) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for '${key}' must be a function`);
    }

    this.factories.set(key, {
      factory,
      lazy: options?.lazy !== false, // Default to lazy loading
      singleton: options?.singleton !== false, // Default to singleton
      dependencies: options?.dependencies || [],
    });
  }

  /**
   * Get or create singleton instance.
   *
   * @param {string} key - Service identifier.
   * @returns {*} Singleton instance.
   */
  get<T = any>(key: string): T {
    if (this.isDestroying) {
      throw new Error(
        `Cannot get instance '${key}' during container destruction`,
      );
    }

    // Return existing instance if available
    if (this.instances.has(key)) {
      return this.instances.get(key);
    }

    // Get factory configuration
    const config = this.factories.get(key);
    if (!config) {
      throw new Error(`No factory registered for '${key}'`);
    }

    // Resolve dependencies
    const dependencies = config?.dependencies?.map((dep: any) => this.get(dep));

    try {
      // Create instance using factory
      const instance = config?.factory(...dependencies);

      // Store singleton instance
      if (config?.singleton) {
        this.instances.set(key, instance);
      }

      return instance;
    } catch (error) {
      throw new Error(`Failed to create instance '${key}': ${error.message}`);
    }
  }

  /**
   * Check if service is registered.
   *
   * @param {string} key - Service identifier.
   * @returns {boolean} True if registered.
   */
  has(key: string): boolean {
    return this.factories.has(key) || this.instances.has(key);
  }

  /**
   * Clear specific instance (force recreation).
   *
   * @param {string} key - Service identifier.
   */
  clear(key: string): void {
    const instance = this.instances.get(key);
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    this.instances.delete(key);
  }

  /**
   * Destroy all instances and clear container.
   */
  destroy(): void {
    this.isDestroying = true;

    // Destroy instances in reverse order of creation
    const instances = Array.from(this.instances.entries()).reverse();

    for (const [key, instance] of instances) {
      try {
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
      } catch (error) {
        logger.warn(`Error destroying instance '${key}':`, error.message);
      }
    }

    this.instances.clear();
    this.factories.clear();

    // Keep destroying flag to prevent new instance creation
    // Reset only when explicitly requested
  }

  /**
   * Reset container state (for testing).
   */
  reset(): void {
    this.destroy();
    this.isDestroying = false;
  }

  /**
   * Get container statistics.
   *
   * @returns {Object} Container stats.
   */
  getStats(): any {
    return {
      registeredServices: this.factories.size,
      activeInstances: this.instances.size,
      services: Array.from(this.factories.keys()),
      instances: Array.from(this.instances.keys()),
    };
  }
}

// Global container instance (properly managed)
let globalContainer: SingletonContainer | null = null;

/**
 * Get or create global container.
 *
 * @returns {SingletonContainer} Global container instance.
 * @example
 */
export function getContainer(): SingletonContainer {
  if (!globalContainer) {
    globalContainer = new SingletonContainer();

    // Register cleanup on process exit
    if (typeof process !== 'undefined') {
      process.on('exit', () => {
        if (globalContainer) {
          globalContainer.destroy();
          globalContainer = null;
        }
      });

      process.on('SIGINT', () => {
        if (globalContainer) {
          globalContainer.destroy();
          globalContainer = null;
        }
        process.exit(0);
      });
    }
  }

  return globalContainer;
}

/**
 * Reset global container (for testing).
 *
 * @example
 */
export function resetContainer(): void {
  if (globalContainer) {
    globalContainer.destroy();
  }
  globalContainer = null;
}

export { SingletonContainer };
