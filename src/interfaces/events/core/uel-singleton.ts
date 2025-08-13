/**
 * @file UEL Singleton.
 *
 * Extracted UEL class to break circular dependency between index.ts and system-integrations.ts.
 */

import type { CompatibilityFactory } from '../compatibility.ts';
import type { UELFactory, UELRegistry } from '../factories.ts';
import type { EventManager } from '../manager.ts';
import type { EventRegistry } from '../registry.ts';
import type { UELValidationFramework } from '../validation.ts';
import type { EventManagerConfig } from './interfaces.ts';

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
    logger?:
      | Console
      | { debug: Function; info: Function; warn: Function; error: Function };
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
    const { UELFactory, UELRegistry } = await import('../factories.ts');
    const { EventManager } = await import('../manager.ts');
    const { EventRegistry } = await import('../registry.ts');
    const { UELValidationFramework } = await import('../validation.ts');
    const { CompatibilityFactory } = await import('../compatibility.ts');
    const { DIContainer } = await import(
      '../../../di/container/di-container.ts'
    );
    const { CORE_TOKENS } = await import('../../../di/tokens/core-tokens.ts');
    const { SingletonProvider } = await import(
      '../../../di/providers/singleton-provider.ts'
    );

    const container = new DIContainer();

    // Register dependencies
    const logger = config?.logger || {
      debug: (message: string, meta?: unknown) => console.debug(message, meta),
      info: (message: string, meta?: unknown) => console.info(message, meta),
      warn: (message: string, meta?: unknown) => console.warn(message, meta),
      error: (message: string, meta?: unknown) => console.error(message, meta),
    };

    container.register(CORE_TOKENS.Logger, new SingletonProvider(() => logger));
    container.register(
      CORE_TOKENS.Config,
      new SingletonProvider(() => {
        const configData = config?.config || {};
        return {
          get: <T>(key: string, defaultValue?: T): T => {
            return (configData as any)[key] ?? defaultValue;
          },
          set: (key: string, value: unknown): void => {
            (configData as any)[key] = value;
          },
          has: (key: string): boolean => {
            return key in configData;
          },
        };
      })
    );

    // Initialize components with proper DI
    this.factory = new UELFactory(logger as any, config?.config as any);
    this.registry = new UELRegistry(logger as any);
    // EventManager uses DI, create manually
    this.eventManager = new (EventManager as any)(
      logger,
      config?.config as any
    );
    this.eventRegistry = new EventRegistry(logger as any);

    // Initialize validation framework if enabled
    if (config?.enableValidation !== false) {
      this.validationFramework = new UELValidationFramework(logger as any);
    }

    // Initialize compatibility factory if enabled
    if (config?.enableCompatibility !== false) {
      this.compatibilityFactory = CompatibilityFactory.getInstance();
      // Basic initialization - some factories may not have initialize method
      try {
        if (
          this.compatibilityFactory &&
          'initialize' in this.compatibilityFactory
        ) {
          await (this.compatibilityFactory as any).initialize(
            this.eventManager,
            logger
          );
        }
      } catch (error) {
        logger.warn('Failed to initialize compatibility factory:', error);
      }
    }

    // Initialize all systems
    await Promise.all(
      [
        this.eventManager?.initialize({
          autoRegisterFactories: config?.autoRegisterFactories !== false,
          healthMonitoring: config?.healthMonitoring !== false,
        }),
        this.eventRegistry?.initialize({
          autoRegisterDefaults: config?.autoRegisterFactories !== false,
        }),
      ].filter(Boolean)
    );

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

  async createSystemEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<unknown> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createSystemEventManager(name, config);
  }

  async getSystemStatus(): Promise<unknown> {
    return {
      initialized: this.initialized,
      components: {
        factory: !!this.factory,
        registry: !!this.registry,
        eventManager: !!this.eventManager,
        eventRegistry: !!this.eventRegistry,
        validation: !!this.validationFramework,
        compatibility: !!this.compatibilityFactory,
      },
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

  async createCoordinationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<unknown> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createCoordinationEventManager(name, config);
  }

  async createCommunicationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<unknown> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createCommunicationEventManager(name, config);
  }

  async createMonitoringEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<unknown> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createMonitoringEventManager(name, config);
  }

  async createInterfaceEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<unknown> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.factory!.createInterfaceEventManager(name, config);
  }

  async getHealthStatus(): Promise<
    Array<{
      name: string;
      status: string;
      subscriptions: number;
      queueSize: number;
      errorRate: number;
      uptime: number;
      lastCheck: Date;
      metadata: Record<string, unknown>;
    }>
  > {
    if (!this.eventManager) {
      return [];
    }
    // Use performHealthCheck method which returns the expected format
    try {
      const healthData = await (this.eventManager as any).performHealthCheck();
      // Convert to expected format
      const healthStatus = Object.entries(healthData).map(
        ([name, data]: [string, any]) => ({
          name,
          status: data.healthy ? 'healthy' : 'unhealthy',
          subscriptions: 0,
          queueSize: 0,
          errorRate: 0,
          uptime: 0,
          lastCheck: new Date(),
          metadata: data.details || {},
        })
      );
      return healthStatus;
    } catch (error) {
      return [
        {
          name: 'event-manager',
          status: 'unhealthy',
          subscriptions: 0,
          queueSize: 0,
          errorRate: 1,
          uptime: 0,
          lastCheck: new Date(),
          metadata: { error: error?.toString() },
        },
      ];
    }
  }

  async migrateEventEmitter(
    emitter: {
      on: Function;
      off?: Function;
      emit: Function;
      listeners?: Function;
    },
    _name: string,
    _type: string
  ): Promise<unknown> {
    if (!this.compatibilityFactory) {
      return null;
    }
    // Basic migration implementation - wrap the EventEmitter
    const { UELCompatibleEventEmitter } = await import('../compatibility.ts');
    const compatibleEmitter = new UELCompatibleEventEmitter({
      enableUEL: true,
      uelManager: this.eventManager as any,
      logger: this.eventManager ? (this.eventManager as any).logger : undefined,
    });

    // Copy existing listeners
    const eventNames = emitter.listeners ? Object.keys(emitter) : [];
    eventNames.forEach((eventName) => {
      if (typeof emitter[eventName as keyof typeof emitter] === 'function') {
        compatibleEmitter.on(
          eventName,
          emitter[eventName as keyof typeof emitter] as any
        );
      }
    });

    return compatibleEmitter;
  }

  async createEnhancedEventBus(config?: {
    enableUEL?: boolean;
    managerName?: string;
  }): Promise<unknown> {
    const { UELEnhancedEventBus } = await import('../system-integrations.ts');
    return new UELEnhancedEventBus(config);
  }

  async createEnhancedApplicationCoordinator(config?: {
    enableUEL?: boolean;
    uelConfig?: unknown;
  }): Promise<unknown> {
    const { UELEnhancedApplicationCoordinator } = await import(
      '../system-integrations.ts'
    );
    return new UELEnhancedApplicationCoordinator(config);
  }

  async createEnhancedObserverSystem(config?: {
    enableUEL?: boolean;
  }): Promise<unknown> {
    const { UELEnhancedObserverSystem } = await import(
      '../system-integrations.ts'
    );
    return new UELEnhancedObserverSystem(config);
  }

  async analyzeSystemEventEmitters(systems: {
    [key: string]: unknown;
  }): Promise<{ migrationRecommendations: string[] }> {
    if (!this.compatibilityFactory) {
      return { migrationRecommendations: [] };
    }
    // Simplified implementation - return basic recommendations
    const recommendations: string[] = [];
    Object.keys(systems).forEach((name) => {
      recommendations.push(
        `Consider migrating ${name} to UEL for better event management`
      );
    });
    return { migrationRecommendations: recommendations };
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
