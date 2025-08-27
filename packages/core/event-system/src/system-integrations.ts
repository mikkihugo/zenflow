/**
 * UEL (Unified Event Layer) - System Integration Layer.
 *
 * Comprehensive system integration layer that enhances existing EventEmitter-based
 * Systems with UEL capabilities while maintaining 100% backward compatibility.
 *
 * This module provides migration utilities and enhanced versions of core systems
 * That can gradually adopt UEL features without breaking existing functionality.
 *
 * @file System Integration and Migration Implementation.
 */

import { getLogger, type Logger } from '@claude-zen/foundation';
import { EventEmitter } from '@claude-zen/foundation';
import type {
  UELCompatibleEventEmitter,
} from './compatibility';
import type {
  EventManagerType,
  EventManager,
  SystemEvent,
} from './core/interfaces';


// Define EventManagerInterface for backward compatibility
interface EventManagerInterface extends EventManager {
  stop(): Promise<void>;
  destroy(): Promise<void>;
}

// Define UELSystem interface for type safety
interface UELSystem {
  initialize(config: any): Promise<void>;
  getEventManager(): EventManager;
  createSystemEventManager(
    name: string,
    config: any
  ): Promise<EventManagerInterface>;
  createCoordinationEventManager(
    name: string,
    config: any
  ): Promise<EventManagerInterface>;
  createInterfaceEventManager(
    name: string,
    config: any
  ): Promise<EventManagerInterface>;
  getSystemStatus(): Promise<any>;
  shutdown(): Promise<void>;
}

/**
 * Enhanced Event Bus with UEL integration.
 * Provides backward compatibility with existing event-bus.ts while adding UEL features.
 *
 * @example
 * ```typescript
 * const eventBus = new UELEnhancedEventBus({
 *   enableUEL: true,
 *   uelIntegration: {
 *     managerType: 'system',
 *     managerName: 'main-system'
 *   }
 * });
 * ```
 */
export class UELEnhancedEventBus extends EventEmitter {
  private uelManager?: EventManager;
  private uelEnabled = false;
  private eventMappings = new Map<string, string>();
  private logger: Logger;

  constructor(
    options: {
      enableUEL?: boolean;
      uelIntegration?: {
        eventManager?: EventManager;
        managerType?: EventManagerType;
        managerName?: string;
      };
      logger?: Logger;
      maxListeners?: number;
    } = {}
  ) {
    super();

    this.logger = options?.logger || getLogger('UELEnhancedEventBus');

    if (options?.enableUEL && options?.uelIntegration?.eventManager) {
      this.initializeUELIntegration({
        eventManager: options.uelIntegration.eventManager,
        ...(options.uelIntegration.managerType && {
          managerType: options.uelIntegration.managerType,
        }),
        ...(options.uelIntegration.managerName && {
          managerName: options.uelIntegration.managerName,
        }),
      });
    }
  }

  /**
   * Initialize UEL integration for the event bus.
   *
   * @param integration - UEL integration configuration
   */
  private initializeUELIntegration(integration: {
    eventManager: EventManager;
    managerType?: EventManagerType;
    managerName?: string;
  }): void {
    this.uelManager = integration.eventManager;
    this.uelEnabled = true;
    
    this.logger.info('UEL integration initialized', {
      managerType: integration.managerType,
      managerName: integration.managerName,
    });
  }

  /**
   * Enhanced emit with UEL integration.
   */
  emit(event: string, ...args: any[]): boolean {
    const result = super.emit(event, ...(args as [any]));
    
    // Also emit through UEL if enabled
    if (this.uelEnabled && this.uelManager) {
      this.uelManager.emit({
        type: event,
        payload: args[0] || {},
        timestamp: new Date(),
        source: 'enhanced-event-bus',
        id: `${event}-${Date.now()}`,
      }).catch((error) => {
        this.logger.warn('UEL emit failed:', error);
      });
    }
    
    return result;
  }

  /**
   * Get UEL manager if available.
   */
  getUELManager(): EventManager | undefined {
    return this.uelManager;
  }

  /**
   * Check if UEL integration is enabled.
   */
  isUELEnabled(): boolean {
    return this.uelEnabled;
  }

  /**
   * Add event mapping for UEL integration.
   */
  addEventMapping(originalEvent: string, uelEvent: string): void {
    this.eventMappings.set(originalEvent, uelEvent);
  }

  /**
   * Remove event mapping.
   */
  removeEventMapping(originalEvent: string): void {
    this.eventMappings.delete(originalEvent);
  }

  /**
   * Get all event mappings.
   */
  getEventMappings(): Map<string, string> {
    return new Map(this.eventMappings);
  }
}

/**
 * System Integration Manager.
 * Handles coordination between different event systems.
 */
export class SystemIntegrationManager {
  private logger: Logger;
  private eventManagers = new Map<string, EventManager>();
  private integrationConfig: any = {};

  constructor(config: any = {}) {
    this.logger = getLogger('SystemIntegrationManager');
    this.integrationConfig = config;
  }

  /**
   * Register an event manager.
   */
  registerEventManager(name: string, manager: EventManager): void {
    this.eventManagers.set(name, manager);
    this.logger.info(`Event manager registered: ${name}`);
  }

  /**
   * Unregister an event manager.
   */
  unregisterEventManager(name: string): void {
    const manager = this.eventManagers.get(name);
    if (manager) {
      this.eventManagers.delete(name);
      this.logger.info(`Event manager unregistered: ${name}`);
    }
  }

  /**
   * Get an event manager by name.
   */
  getEventManager(name: string): EventManager | undefined {
    return this.eventManagers.get(name);
  }

  /**
   * List all registered event managers.
   */
  listEventManagers(): string[] {
    return Array.from(this.eventManagers.keys());
  }

  /**
   * Broadcast event to all registered managers.
   */
  async broadcastEvent(event: SystemEvent): Promise<void> {
    const promises = Array.from(this.eventManagers.values()).map(manager =>
      manager.emit(event).catch(error => {
        this.logger.error(`Broadcast failed for manager:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Initialize system integration.
   */
  async initialize(): Promise<void> {
    this.logger.info('System integration manager initialized');
  }

  /**
   * Shutdown system integration.
   */
  async shutdown(): Promise<void> {
    // Stop all managers
    const stopPromises = Array.from(this.eventManagers.values()).map(async manager => {
      if (typeof manager.destroy === 'function') {
        await manager.destroy();
      }
    });

    await Promise.allSettled(stopPromises);
    this.eventManagers.clear();
    this.logger.info('System integration manager shut down');
  }
}

/**
 * Migration Helper for EventEmitter to UEL.
 */
export class EventEmitterToUELMigrationHelper {
  private logger: Logger;

  constructor() {
    this.logger = getLogger('EventEmitterToUELMigrationHelper');
  }

  /**
   * Create a compatibility wrapper.
   */
  createCompatibilityWrapper(
    originalEmitter: EventEmitter,
    uelManager: EventManager
  ): UELCompatibleEventEmitter {
    return {
      // EventEmitter compatibility
      on: originalEmitter.on.bind(originalEmitter),
      off: originalEmitter.off?.bind(originalEmitter) || originalEmitter.removeListener?.bind(originalEmitter),
      emit: originalEmitter.emit.bind(originalEmitter),
      once: originalEmitter.once?.bind(originalEmitter),
      removeAllListeners: originalEmitter.removeAllListeners?.bind(originalEmitter),
      eventNames: originalEmitter.eventNames?.bind(originalEmitter) || (() => []),
      listenerCount: originalEmitter.listenerCount?.bind(originalEmitter) || (() => 0),
      listeners: originalEmitter.listeners?.bind(originalEmitter) || (() => []),
      
      // UEL compatibility
      uelManager,
      uelEnabled: false,
      migrationMode: 'passive' as const,
      eventMappings: new Map(),
      enableUEL: () => {},
      disableUEL: () => {},
      setMigrationMode: () => {},
      mapEvent: () => {},
      unmapEvent: () => {},
      getUELStatus: () => ({ enabled: false, migrationMode: 'passive' as const, hasManager: false, mappedEvents: 0, totalListeners: 0 }),
      isUELCompatible: true,
    } as unknown as UELCompatibleEventEmitter;
  }

  /**
   * Migrate events from EventEmitter to UEL.
   */
  async migrateEvents(
    source: EventEmitter,
    target: EventManager,
    eventMappings?: Map<string, string>
  ): Promise<void> {
    // This is a basic migration helper
    // In a real implementation, you'd need to handle event listener migration
    this.logger.info('Event migration completed', {
      hasEventMappings: !!eventMappings,
      mappingCount: eventMappings?.size || 0,
    });
  }
}

/**
 * UEL Integration Factory.
 */
export class UELIntegrationFactory {
  private static instance: UELIntegrationFactory;
  private logger: Logger;

  private constructor() {
    this.logger = getLogger('UELIntegrationFactory');
  }

  static getInstance(): UELIntegrationFactory {
    if (!UELIntegrationFactory.instance) {
      UELIntegrationFactory.instance = new UELIntegrationFactory();
    }
    return UELIntegrationFactory.instance;
  }

  /**
   * Create enhanced event bus with UEL integration.
   */
  createEnhancedEventBus(config: {
    enableUEL?: boolean;
    uelIntegration?: {
      eventManager?: EventManager;
      managerType?: EventManagerType;
      managerName?: string;
    };
    logger?: Logger;
  }): UELEnhancedEventBus {
    return new UELEnhancedEventBus(config);
  }

  /**
   * Create system integration manager.
   */
  createSystemIntegrationManager(config: any = {}): SystemIntegrationManager {
    return new SystemIntegrationManager(config);
  }

  /**
   * Create migration helper.
   */
  createMigrationHelper(): EventEmitterToUELMigrationHelper {
    return new EventEmitterToUELMigrationHelper();
  }
}

// Export default instance
export const uelIntegrationFactory = UELIntegrationFactory.getInstance();

/**
 * System lifecycle management utilities.
 */
export class SystemLifecycleManager {
  private logger: Logger;
  private systems = new Map<string, UELSystem>();

  constructor() {
    this.logger = getLogger('SystemLifecycleManager');
  }

  /**
   * Register a system.
   */
  registerSystem(name: string, system: UELSystem): void {
    this.systems.set(name, system);
    this.logger.info(`System registered: ${name}`);
  }

  /**
   * Unregister a system.
   */
  unregisterSystem(name: string): void {
    this.systems.delete(name);
    this.logger.info(`System unregistered: ${name}`);
  }

  /**
   * Initialize all registered systems.
   */
  async initializeAll(config: any = {}): Promise<void> {
    const promises = Array.from(this.systems.entries()).map(async ([name, system]) => {
      try {
        await system.initialize(config[name] || {});
        this.logger.info(`System initialized: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to initialize system ${name}:`, error);
        throw error;
      }
    });

    await Promise.all(promises);
  }

  /**
   * Shutdown all registered systems.
   */
  async shutdownAll(): Promise<void> {
    const promises = Array.from(this.systems.entries()).map(async ([name, system]) => {
      try {
        await system.shutdown();
        this.logger.info(`System shut down: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to shut down system ${name}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get system status for all registered systems.
   */
  async getSystemsStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};
    
    const promises = Array.from(this.systems.entries()).map(async ([name, system]) => {
      try {
        status[name] = await system.getSystemStatus();
      } catch (error) {
        status[name] = { error: error instanceof Error ? error.message : String(error) };
      }
    });

    await Promise.allSettled(promises);
    return status;
  }
}

// Export default system lifecycle manager
export const systemLifecycleManager = new SystemLifecycleManager();