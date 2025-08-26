/**
 * UEL (Unified Event Layer) - Event Registry System.
 *
 * Central registry for managing all event types, factories, and lifecycle management.
 */

import { getLogger, type Logger } from '@claude-zen/foundation';
import type {
  EventManagerConfig,
  EventManagerType,
  EventManager,
  EventManagerFactory,
} from './core/interfaces';

/**
 * Registry entry for managing event manager instances and their lifecycle.
 */
export interface EventRegistryEntry {
  /** The event manager instance */
  manager: EventManager;
  /** Factory used to create this manager */
  factory?: EventManagerFactory;
  /** Configuration used to create this manager */
  config: EventManagerConfig;
  /** Timestamp when this manager was created */
  created: Date;
  /** Timestamp of last access */
  lastAccessed: Date;
  /** Timestamp of last health check */
  lastHealthCheck?: Date;
  /** Current health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Usage statistics */
  usage: {
    accessCount: number;
    totalEvents: number;
    totalSubscriptions: number;
    errorCount: number;
  };
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Event Registry for centralized event manager lifecycle management.
 */
export class EventRegistry {
  private _managers = new Map<string, EventRegistryEntry>();
  private _factories = new Map<EventManagerType, EventManagerFactory>();
  private _logger: Logger;

  constructor(logger?: Logger) {
    this._logger = logger || getLogger('EventRegistry');
  }

  /**
   * Register an event manager factory for a specific type.
   */
  registerFactory(type: EventManagerType, factory: EventManagerFactory): void {
    this._factories.set(type, factory);
    this._logger.info(`Registered factory for type: ${type}`);
  }

  /**
   * Register an event manager instance.
   */
  register(manager: EventManager, config?: EventManagerConfig): void {
    const entry: EventRegistryEntry = {
      manager,
      config: config || manager.config,
      created: new Date(),
      lastAccessed: new Date(),
      status: 'healthy',
      usage: {
        accessCount: 0,
        totalEvents: 0,
        totalSubscriptions: 0,
        errorCount: 0,
      },
    };

    this._managers.set(manager.name, entry);
    this._logger.info(`Registered event manager: ${manager.name}`);
  }

  /**
   * Get an event manager by name.
   */
  get(name: string): EventManager | undefined {
    const entry = this._managers.get(name);
    if (entry) {
      entry.lastAccessed = new Date();
      entry.usage.accessCount++;
      return entry.manager;
    }
    return undefined;
  }

  /**
   * List all registered event manager names.
   */
  list(): string[] {
    return Array.from(this._managers.keys());
  }

  /**
   * Check if an event manager is registered.
   */
  has(name: string): boolean {
    return this._managers.has(name);
  }

  /**
   * Remove an event manager from the registry.
   */
  async remove(name: string): Promise<boolean> {
    const entry = this._managers.get(name);
    if (entry) {
      try {
        await entry.manager.destroy();
      } catch (error) {
        this._logger.warn(`Error destroying manager ${name}:`, error);
      }
      this._managers.delete(name);
      this._logger.info(`Removed event manager: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Create a new event manager using a registered factory.
   */
  async create(config: EventManagerConfig): Promise<EventManager> {
    const factory = this._factories.get(config.type);
    if (!factory) {
      throw new Error(`No factory registered for type: ${config.type}`);
    }

    const manager = await factory.create(config);
    this.register(manager, config);
    return manager;
  }

  /**
   * Get registry statistics.
   */
  getStats(): {
    totalManagers: number;
    totalFactories: number;
    managersByType: Record<EventManagerType, number>;
    healthyManagers: number;
    unhealthyManagers: number;
  } {
    const managersByType = {} as Record<EventManagerType, number>;
    let healthyManagers = 0;
    let unhealthyManagers = 0;

    for (const entry of this._managers.values()) {
      const {type} = entry.manager;
      managersByType[type] = (managersByType[type] || 0) + 1;
      
      if (entry.status === 'healthy') {
        healthyManagers++;
      } else {
        unhealthyManagers++;
      }
    }

    return {
      totalManagers: this._managers.size,
      totalFactories: this._factories.size,
      managersByType,
      healthyManagers,
      unhealthyManagers,
    };
  }

  /**
   * Perform health checks on all registered managers.
   */
  async performHealthChecks(): Promise<void> {
    const now = new Date();
    
    for (const [name, entry] of this._managers) {
      try {
        // Simple health check - verify manager is running
        const isHealthy = entry.manager.isRunning();
        entry.status = isHealthy ? 'healthy' : 'unhealthy';
        entry.lastHealthCheck = now;
      } catch (error) {
        this._logger.warn(`Health check failed for manager ${name}:`, error);
        entry.status = 'unhealthy';
        entry.usage.errorCount++;
      }
    }
  }

  /**
   * Initialize the registry.
   */
  async initialize(): Promise<void> {
    this._logger.info('Event registry initialized');
  }

  /**
   * Register a manager.
   */
  async registerManager(name: string, manager: EventManager, config: EventManagerConfig): Promise<void> {
    this._managers.set(name, {
      manager,
      config,
      created: new Date(),
      lastAccessed: new Date(),
      status: 'healthy',
      usage: {
        accessCount: 0,
        totalEvents: 0,
        totalSubscriptions: 0,
        errorCount: 0,
      },
    });
    this._logger.info(`Registered manager: ${name}`);
  }

  /**
   * Find event manager by name.
   */
  findEventManager(name: string): EventManager | undefined {
    const entry = this._managers.get(name);
    if (entry) {
      entry.lastAccessed = new Date();
      return entry.manager;
    }
    return undefined;
  }

  /**
   * Get event managers by type.
   */
  getEventManagersByType(type: EventManagerType): EventManager[] {
    return Array.from(this._managers.values())
      .filter(entry => entry.config.type === type)
      .map(entry => entry.manager);
  }

  /**
   * Health check all managers.
   */
  async healthCheckAll(): Promise<any> {
    const results: Record<string, any> = {};
    for (const [name, entry] of this._managers.entries()) {
      try {
        results[name] = await entry.manager.healthCheck();
      } catch (error) {
        results[name] = { status: 'error', error: String(error) };
      }
    }
    return results;
  }

  /**
   * Get global metrics.
   */
  async getGlobalMetrics(): Promise<any> {
    const metrics = {
      totalManagers: this._managers.size,
      activeManagers: 0,
      totalEvents: 0,
    };
    
    for (const entry of this._managers.values()) {
      try {
        if (entry.manager.isRunning()) {
          metrics.activeManagers++;
        }
        const managerMetrics = await entry.manager.getMetrics();
        metrics.totalEvents += managerMetrics.eventsEmitted || 0;
      } catch {
        // Ignore errors
      }
    }
    
    return metrics;
  }

  /**
   * Broadcast to type.
   */
  async broadcastToType(type: EventManagerType, event: any): Promise<void> {
    const managers = this.getEventManagersByType(type);
    await Promise.all(managers.map(m => m.emit(event).catch(() => {})));
  }

  /**
   * Broadcast to all.
   */
  async broadcast(event: any): Promise<void> {
    const promises = Array.from(this._managers.values()).map(entry => 
      entry.manager.emit(event).catch(() => {})
    );
    await Promise.all(promises);
  }

  /**
   * Get registry stats.
   */
  getRegistryStats(): any {
    return {
      totalManagers: this._managers.size,
      managers: Array.from(this._managers.keys()),
      factories: Array.from(this._factories.keys()),
    };
  }

  /**
   * Shutdown all managers.
   */
  async shutdownAll(): Promise<void> {
    for (const [name, entry] of this._managers.entries()) {
      try {
        await entry.manager.destroy();
        this._logger.info(`Shutdown manager: ${name}`);
      } catch (error) {
        this._logger.error(`Failed to shutdown manager ${name}:`, error);
      }
    }
    this._managers.clear();
  }

  /**
   * Get factory.
   */
  getFactory(type: EventManagerType): EventManagerFactory | undefined {
    return this._factories.get(type);
  }

  /**
   * Cleanup the registry and destroy all managers.
   */
  async cleanup(): Promise<void> {
    const managers = Array.from(this._managers.keys());
    
    for (const name of managers) {
      await this.remove(name);
    }
    
    this._factories.clear();
    this._logger.info('Event registry cleanup completed');
  }
}

// Global registry instance
let globalRegistry: EventRegistry | undefined;

/**
 * Get the global event registry instance.
 */
export function getEventRegistry(): EventRegistry {
  if (!globalRegistry) {
    globalRegistry = new EventRegistry();
  }
  return globalRegistry;
}

/**
 * Reset the global registry (mainly for testing).
 */
export function resetEventRegistry(): void {
  globalRegistry = undefined;
}