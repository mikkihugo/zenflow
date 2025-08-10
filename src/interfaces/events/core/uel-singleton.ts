/**
 * @file UEL Singleton.
 * 
 * Extracted UEL class to break circular dependency between index.ts and system-integrations.ts.
 */

import type { EventManagerConfig, EventManagerType, SystemEvent } from './interfaces';
import type { EventManager } from '../manager';
import type { EventRegistry } from '../registry';
import type { UELFactory, UELRegistry } from '../factories';
import type { UELValidationFramework } from '../validation';
import type { CompatibilityFactory } from '../compatibility';

/**
 * UEL Main Interface - Primary entry point for the Unified Event Layer.
 *
 * @example
 */
export class UEL {
  private static instance: UEL;
  private initialized = false;
  private factory: UELFactory | null = null;
  private registry: UELRegistry | null = null;
  private eventManager: EventManager | null = null;
  private eventRegistry: EventRegistry | null = null;
  private validationFramework: UELValidationFramework | null = null;
  private compatibilityFactory: CompatibilityFactory | null = null;

  private constructor() {}

  static getInstance(): UEL {
    if (!UEL.instance) {
      UEL.instance = new UEL();
    }
    return UEL.instance;
  }

  async initialize(config?: {
    logger?: Console | { debug: Function; info: Function; warn: Function; error: Function };
    config?: Record<string, unknown>;
    autoRegisterFactories?: boolean;
    enableValidation?: boolean;
    enableCompatibility?: boolean;
    healthMonitoring?: boolean;
  }): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Dynamic imports to avoid circular dependencies
    const { UELFactory, UELRegistry } = await import('../factories');
    const { EventManager } = await import('../manager');
    const { EventRegistry } = await import('../registry');
    const { UELValidationFramework } = await import('../validation');
    const { CompatibilityFactory } = await import('../compatibility');
    const { DIContainer } = await import('../../../di/container/di-container');
    const { CORE_TOKENS } = await import('../../../di/tokens/core-tokens');
    const { SingletonProvider } = await import('../../../di/providers/singleton-provider');

    const container = new DIContainer();

    // Register dependencies
    const logger = config?.logger || {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    container.register(CORE_TOKENS.Logger, new SingletonProvider(() => logger));
    container.register(CORE_TOKENS.Config, new SingletonProvider(() => config?.config || {}));

    // Initialize components
    this.factory = new UELFactory(logger, config?.config);
    this.registry = new UELRegistry(logger);
    this.eventManager = new EventManager(logger, config?.config);
    this.eventRegistry = new EventRegistry(logger);

    // Initialize validation framework if enabled
    if (config?.enableValidation !== false) {
      this.validationFramework = new UELValidationFramework(logger);
    }

    // Initialize compatibility factory if enabled
    if (config?.enableCompatibility !== false) {
      this.compatibilityFactory = CompatibilityFactory.getInstance();
      await this.compatibilityFactory.initialize(this.eventManager, logger);
    }

    // Initialize all systems
    await Promise.all([
      this.eventManager.initialize({
        autoRegisterFactories: config?.autoRegisterFactories !== false,
        healthMonitoring: config?.healthMonitoring !== false,
      }),
      this.eventRegistry.initialize({
        autoRegisterDefaults: config?.autoRegisterFactories !== false,
      }),
    ]);

    this.initialized = true;
    logger.info('🚀 UEL System fully initialized');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getEventManager(): EventManager {
    if (!this.eventManager) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.eventManager;
  }

  async createSystemEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createSystemEventManager(name, config);
  }

  async getSystemStatus(): Promise<any> {
    return {
      initialized: this.initialized,
      components: {
        factory: !!this.factory,
        registry: !!this.registry,
        eventManager: !!this.eventManager,
        eventRegistry: !!this.eventRegistry,
        validation: !!this.validationFramework,
        compatibility: !!this.compatibilityFactory,
      }
    };
  }

  getEventRegistry(): EventRegistry {
    if (!this.eventRegistry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.eventRegistry;
  }

  getValidationFramework(): UELValidationFramework | null {
    return this.validationFramework;
  }

  getCompatibilityFactory(): CompatibilityFactory | null {
    return this.compatibilityFactory;
  }

  async createCoordinationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createCoordinationEventManager(name, config);
  }

  async createCommunicationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createCommunicationEventManager(name, config);
  }

  async createMonitoringEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createMonitoringEventManager(name, config);
  }

  async createInterfaceEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createInterfaceEventManager(name, config);
  }

  async getHealthStatus(): Promise<Array<{name: string; status: string; subscriptions: number; queueSize: number; errorRate: number; uptime: number; lastCheck: Date; metadata: Record<string, unknown>;}>> {
    if (!this.eventManager) {
      return [];
    }
    return this.eventManager.getHealthStatus();
  }

  async migrateEventEmitter(emitter: {on: Function; off?: Function; emit: Function; listeners?: Function}, name: string, type: string): Promise<any> {
    if (!this.compatibilityFactory) {
      return null;
    }
    return this.compatibilityFactory.migrateEventEmitter(emitter, name, type);
  }

  async createEnhancedEventBus(config?: {enableUEL?: boolean; managerName?: string}): Promise<any> {
    const { UELEnhancedEventBus } = await import('../system-integrations');
    return new UELEnhancedEventBus(config);
  }

  async createEnhancedApplicationCoordinator(config?: {enableUEL?: boolean; uelConfig?: any}): Promise<any> {
    const { UELEnhancedApplicationCoordinator } = await import('../system-integrations');
    return new UELEnhancedApplicationCoordinator(config);
  }

  async createEnhancedObserverSystem(config?: {enableUEL?: boolean}): Promise<any> {
    const { UELEnhancedObserverSystem } = await import('../system-integrations');
    return new UELEnhancedObserverSystem(config);
  }

  async analyzeSystemEventEmitters(systems: {[key: string]: any}): Promise<{migrationRecommendations: string[]}> {
    if (!this.compatibilityFactory) {
      return {migrationRecommendations: []};
    }
    // Simplified implementation - return basic recommendations
    const recommendations: string[] = [];
    Object.keys(systems).forEach(name => {
      recommendations.push(`Consider migrating ${name} to UEL for better event management`);
    });
    return {migrationRecommendations: recommendations};
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    const shutdownPromises: Promise<void>[] = [];

    if (this.eventManager) {
      shutdownPromises.push(this.eventManager.shutdown());
    }

    if (this.factory) {
      shutdownPromises.push(this.factory.shutdownAll());
    }

    await Promise.allSettled(shutdownPromises);

    // Reset all components
    this.factory = null;
    this.registry = null;
    this.eventManager = null;
    this.eventRegistry = null;
    this.validationFramework = null;
    this.compatibilityFactory = null;
    this.initialized = false;
  }
}

// Global UEL instance for convenience
export const uel = UEL.getInstance();