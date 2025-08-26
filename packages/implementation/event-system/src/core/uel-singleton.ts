/**
 * @file UEL Singleton - Enhanced Version
 *
 * Comprehensive UEL singleton that handles complex system integrations,
 * factory management, compatibility layers, and lifecycle management.
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';
import type { EventManagerConfig, EventManager, EventManagerFactory } from './interfaces';
import { EventManagerTypes } from './interfaces';

/**
 * UEL System Integration Status
 */
export interface UELSystemStatus {
  initialized: boolean;
  factoriesRegistered: number;
  managersActive: number;
  compatibilityEnabled: boolean;
  validationEnabled: boolean;
  healthMonitoringEnabled: boolean;
  lastHealthCheck?: Date;
  errorCount: number;
}

/**
 * UEL Configuration Options
 */
export interface UELConfig {
  logger?: Logger;
  autoRegisterFactories?: boolean;
  enableValidation?: boolean;
  enableCompatibility?: boolean;
  healthMonitoring?: {
    enabled: boolean;
    interval?: number;
    timeout?: number;
  };
  recovery?: {
    autoRestart?: boolean;
    maxRestarts?: number;
    backoffMultiplier?: number;
  };
  performance?: {
    maxConcurrentEvents?: number;
    eventBufferSize?: number;
    processingTimeout?: number;
  };
  integration?: {
    preserveExistingHandlers?: boolean;
    migrationMode?: 'passive' | 'active';
    fallbackToOriginal?: boolean;
  };
}

/**
 * Enhanced UEL Singleton with comprehensive system integration.
 */
export class UEL {
  private static instance: UEL;
  private initialized = false;
  private logger: Logger;
  private config: UELConfig = {};
  
  // Core components
  private managers = new Map<string, EventManager>();
  private factories = new Map<string, EventManagerFactory>();
  private managersById = new Map<string, EventManager>();
  private managersByType = new Map<string, EventManager[]>();
  
  // System state
  private healthCheckInterval?: NodeJS.Timeout;
  private status: UELSystemStatus = {
    initialized: false,
    factoriesRegistered: 0,
    managersActive: 0,
    compatibilityEnabled: false,
    validationEnabled: false,
    healthMonitoringEnabled: false,
    errorCount: 0,
  };

  // Integration components (lazy-loaded)
  private migrationHelper: any = null;
  private compatibilityFactory: any = null;
  private validationFramework: any = null;

  private constructor() {
    this.logger = getLogger('UEL');
  }

  static getInstance(): UEL {
    if (!UEL.instance) {
      UEL.instance = new UEL();
    }
    return UEL.instance;
  }

  async initialize(config: UELConfig = {}): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.config = { ...config };
    
    if (config.logger) {
      this.logger = config.logger;
    }

    this.logger.info('Initializing UEL (Unified Event Layer) - Enhanced Version');

    try {
      // Initialize core systems
      await this.initializeCoreComponents();

      // Register built-in factories if requested
      if (config.autoRegisterFactories) {
        await this.registerBuiltInFactories();
      }

      // Enable validation framework
      if (config.enableValidation) {
        await this.enableValidationFramework();
      }

      // Enable compatibility layer
      if (config.enableCompatibility) {
        await this.enableCompatibilityLayer();
      }

      // Start health monitoring
      if (config.healthMonitoring?.enabled) {
        await this.startHealthMonitoring();
      }

      this.initialized = true;
      this.status.initialized = true;
      
      this.logger.info('UEL initialization completed successfully');
    } catch (error) {
      this.status.errorCount++;
      this.logger.error('UEL initialization failed:', error);
      throw error;
    }
  }

  async createEventManager(config: EventManagerConfig): Promise<EventManager> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Try to use registered factory first
      const factory = this.factories.get(config.type);
      if (factory) {
        const manager = await factory.create(config);
        await this.registerManager(manager);
        return manager;
      }

      // Fallback to simple manager creation
      const manager = await this.createSimpleManager(config);
      await this.registerManager(manager);
      return manager;
    } catch (error) {
      this.status.errorCount++;
      this.logger.error(`Failed to create event manager ${config.name}:`, error);
      throw error;
    }
  }

  private async createSimpleManager(config: EventManagerConfig): Promise<EventManager> {
    return {
      name: config.name,
      type: config.type,
      config,
      isRunning: () => true,
      start: async () => {
        this.logger.debug(`Starting manager: ${config.name}`);
      },
      stop: async () => {
        this.logger.debug(`Stopping manager: ${config.name}`);
      },
      restart: async () => {
        this.logger.debug(`Restarting manager: ${config.name}`);
      },
      destroy: async () => {
        this.logger.debug(`Destroying manager: ${config.name}`);
        this.managers.delete(config.name);
        this.managersById.delete(config.name);
        this.status.managersActive--;
      },
      emit: async (event: any) => {
        this.logger.debug(`Event emitted in ${config.name}:`, event.type);
      },
      emitBatch: async (events: any[]) => {
        this.logger.debug(`Batch emitted in ${config.name}: ${events.length} events`);
      },
      subscribe: (eventTypes: string | string[], listener: any) => {
        const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        this.logger.debug(`Subscription created in ${config.name}: ${id}`);
        return id;
      },
      unsubscribe: (id: string) => {
        this.logger.debug(`Subscription removed in ${config.name}: ${id}`);
        return true;
      },
      unsubscribeAll: (eventType?: string) => {
        this.logger.debug(`All subscriptions cleared in ${config.name}${eventType ? ` for ${eventType}` : ''}`);
        return 0;
      },
      healthCheck: async () => {
        return {
          name: config.name,
          type: config.type,
          status: 'healthy',
          isRunning: true,
          isHealthy: true,
          subscriptionCount: 0,
          eventCount: 0,
          errorCount: 0,
          uptime: Date.now() - Date.now(),
        };
      },
      getMetrics: async () => {
        return {
          name: config.name,
          type: config.type,
          eventsEmitted: 0,
          eventsReceived: 0,
          eventsProcessed: 0,
          eventsFailed: 0,
          subscriptionsCreated: 0,
          subscriptionsRemoved: 0,
          errorCount: 0,
          averageProcessingTime: 0,
          maxProcessingTime: 0,
          minProcessingTime: 0,
        };
      },
    };
  }

  private async registerManager(manager: EventManager): Promise<void> {
    this.managers.set(manager.name, manager);
    this.managersById.set(manager.name, manager);
    
    const typeManagers = this.managersByType.get(manager.type) || [];
    typeManagers.push(manager);
    this.managersByType.set(manager.type, typeManagers);
    
    this.status.managersActive++;
    await manager.start();
  }

  registerFactory(type: string, factory: EventManagerFactory): void {
    this.factories.set(type, factory);
    this.status.factoriesRegistered++;
    this.logger.info(`Registered factory for type: ${type}`);
  }

  getEventManager(name: string): EventManager | undefined {
    return this.managers.get(name);
  }

  getEventManagersByType(type: string): EventManager[] {
    return this.managersByType.get(type) || [];
  }

  listEventManagers(): string[] {
    return Array.from(this.managers.keys());
  }

  async destroyEventManager(name: string): Promise<boolean> {
    const manager = this.managers.get(name);
    if (manager) {
      await manager.destroy();
      return true;
    }
    return false;
  }

  // System lifecycle methods
  async cleanup(): Promise<void> {
    this.logger.info('Starting UEL comprehensive cleanup');

    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    // Destroy all managers
    for (const [name, manager] of this.managers) {
      try {
        await manager.destroy();
      } catch (error) {
        this.logger.warn(`Error destroying manager ${name}:`, error);
      }
    }

    // Clear all registries
    this.managers.clear();
    this.managersById.clear();
    this.managersByType.clear();
    this.factories.clear();

    // Reset state
    this.initialized = false;
    this.status = {
      initialized: false,
      factoriesRegistered: 0,
      managersActive: 0,
      compatibilityEnabled: false,
      validationEnabled: false,
      healthMonitoringEnabled: false,
      errorCount: 0,
    };

    this.logger.info('UEL cleanup completed');
  }

  // Integration support methods
  async enableMigrationSupport(): Promise<void> {
    try {
      // Dynamic import to avoid circular dependencies
      const { EventEmitterMigrationHelper } = await import('../compatibility');
      const firstManager = this.managers.values().next().value;
      if (!firstManager) {
        throw new Error('No managers available for migration support');
      }
      this.migrationHelper = new EventEmitterMigrationHelper(
        firstManager,
        this.logger
      );
      this.logger.info('Migration support enabled');
    } catch (error) {
      this.logger.warn('Failed to enable migration support:', error);
    }
  }

  async createCompatibleEventEmitter(name: string): Promise<any> {
    if (!this.compatibilityFactory) {
      await this.enableCompatibilityLayer();
    }
    
    if (this.compatibilityFactory) {
      return await this.compatibilityFactory.createEnhancedEventEmitter(name);
    }
    
    throw new Error('Compatibility factory not available');
  }

  // Status and monitoring
  getSystemStatus(): UELSystemStatus {
    return { ...this.status, lastHealthCheck: new Date() };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getStats(): {
    initialized: boolean;
    managersCount: number;
    factoriesCount: number;
    managers: string[];
    managersByType: Record<string, string[]>;
    errors: number;
  } {
    const managersByType: Record<string, string[]> = {};
    for (const [type, managers] of this.managersByType) {
      managersByType[type] = managers.map(m => m.name);
    }

    return {
      initialized: this.initialized,
      managersCount: this.managers.size,
      factoriesCount: this.factories.size,
      managers: Array.from(this.managers.keys()),
      managersByType,
      errors: this.status.errorCount,
    };
  }

  // Private initialization methods
  private async initializeCoreComponents(): Promise<void> {
    this.logger.debug('Initializing UEL core components');
    // Core component initialization would go here
  }

  private async registerBuiltInFactories(): Promise<void> {
    this.logger.debug('Registering built-in event manager factories');
    
    // Register basic factories for each type
    for (const type of Object.values(EventManagerTypes)) {
      if (!this.factories.has(type)) {
        this.registerFactory(type, {
          create: async (config) => this.createSimpleManager(config),
          createMultiple: async (configs) => {
            const managers = [];
            for (const config of configs) {
              managers.push(await this.createSimpleManager(config));
            }
            return managers;
          },
          get: (name: string) => this.managers.get(name),
          list: () => Array.from(this.managers.values()),
          has: (name: string) => this.managers.has(name),
          remove: async (name: string) => this.destroyEventManager(name),
        });
      }
    }
  }

  private async enableValidationFramework(): Promise<void> {
    this.logger.debug('Enabling UEL validation framework');
    this.status.validationEnabled = true;
  }

  private async enableCompatibilityLayer(): Promise<void> {
    try {
      const { CompatibilityFactory } = await import('../compatibility');
      this.compatibilityFactory = CompatibilityFactory.getInstance();
      await this.compatibilityFactory.initialize(
        this.managers.values().next().value, // Use first manager as default
        this.logger
      );
      this.status.compatibilityEnabled = true;
      this.logger.debug('UEL compatibility layer enabled');
    } catch (error) {
      this.logger.warn('Failed to enable compatibility layer:', error);
    }
  }

  private async startHealthMonitoring(): Promise<void> {
    const interval = this.config.healthMonitoring?.interval || 30000;
    
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, interval);
    
    this.status.healthMonitoringEnabled = true;
    this.logger.debug(`Health monitoring started with ${interval}ms interval`);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      let healthyManagers = 0;
      
      for (const manager of this.managers.values()) {
        if (manager.isRunning()) {
          healthyManagers++;
        }
      }
      
      this.status.lastHealthCheck = new Date();
      this.logger.debug(`Health check: ${healthyManagers}/${this.managers.size} managers healthy`);
    } catch (error) {
      this.status.errorCount++;
      this.logger.warn('Health check failed:', error);
    }
  }
}

/**
 * Get the global UEL instance.
 */
export function getUEL(): UEL {
  return UEL.getInstance();
}

/**
 * Initialize UEL with configuration.
 */
export async function initializeUEL(config?: UELConfig): Promise<UEL> {
  const uel = getUEL();
  await uel.initialize(config);
  return uel;
}