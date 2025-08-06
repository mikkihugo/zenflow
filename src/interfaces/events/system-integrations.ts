/**
 * UEL (Unified Event Layer) - System Integration Layer
 *
 * Comprehensive system integration layer that enhances existing EventEmitter-based
 * systems with UEL capabilities while maintaining 100% backward compatibility.
 *
 * This module provides migration utilities and enhanced versions of core systems
 * that can gradually adopt UEL features without breaking existing functionality.
 *
 * @file System Integration and Migration Implementation
 */

import { EventEmitter } from 'node:events';
import { EventEmitterMigrationHelper, type UELCompatibleEventEmitter } from './compatibility';
import type {
  EventManagerConfig,
  EventManagerType,
  IEventManager,
  SystemEvent,
} from './core/interfaces';

import { EventManagerTypes } from './core/interfaces';
import { UEL } from './index';
import type { EventManager } from './manager';
import { EventRegistry } from './registry';
import type {
  CommunicationEvent,
  CoordinationEvent,
  MonitoringEvent,
  SystemLifecycleEvent,
} from './types';

/**
 * Enhanced Event Bus with UEL integration
 * Provides backward compatibility with existing event-bus.ts while adding UEL features
 *
 * @example
 */
export class UELEnhancedEventBus extends EventEmitter {
  private uelManager?: IEventManager;
  private migrationHelper?: EventEmitterMigrationHelper;
  private uelEnabled = false;
  private eventMappings = new Map<string, string>();
  private logger?: any;

  constructor(
    options: {
      enableUEL?: boolean;
      uelIntegration?: {
        eventManager?: EventManager;
        managerType?: EventManagerType;
        managerName?: string;
      };
      logger?: any;
      maxListeners?: number;
    } = {}
  ) {
    super();

    this.logger = options.logger;
    this.setMaxListeners(options.maxListeners || 100);

    if (options.enableUEL && options.uelIntegration?.eventManager) {
      this.initializeUELIntegration(options.uelIntegration);
    }
  }

  /**
   * Initialize UEL integration for the event bus
   *
   * @param integration
   * @param integration.eventManager
   * @param integration.managerType
   * @param integration.managerName
   */
  private async initializeUELIntegration(integration: {
    eventManager: EventManager;
    managerType?: EventManagerType;
    managerName?: string;
  }): Promise<void> {
    try {
      // Create UEL event manager for this bus
      this.uelManager = await integration.eventManager.createEventManager({
        type: integration.managerType || EventManagerTypes.SYSTEM,
        name: integration.managerName || 'enhanced-event-bus',
        autoStart: true,
      });

      // Initialize migration helper
      this.migrationHelper = new EventEmitterMigrationHelper(integration.eventManager, this.logger);

      this.uelEnabled = true;
      this.logger?.info('✅ UEL integration initialized for Enhanced Event Bus');
    } catch (error) {
      this.logger?.error('❌ Failed to initialize UEL integration:', error);
    }
  }

  /**
   * Enhanced emit with UEL integration and metrics
   *
   * @param eventName
   * @param {...any} args
   */
  emit(eventName: string | symbol, ...args: any[]): boolean {
    const startTime = Date.now();

    // Standard EventEmitter behavior
    const result = super.emit(eventName, ...args);

    // UEL integration if enabled
    if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
      this.emitToUEL(eventName, args, startTime).catch((error) => {
        this.logger?.warn(`UEL emit failed for ${eventName}:`, error);
      });
    }

    return result;
  }

  /**
   * Enhanced on with UEL subscription tracking
   *
   * @param eventName
   * @param listener
   */
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const result = super.on(eventName, listener);

    // Track UEL subscriptions if enabled
    if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
      this.trackUELSubscription(eventName, listener).catch((error) => {
        this.logger?.debug(`UEL subscription tracking failed for ${eventName}:`, error);
      });
    }

    return result;
  }

  /**
   * Get comprehensive event bus status including UEL integration
   */
  getStatus(): {
    eventEmitter: {
      maxListeners: number;
      eventNames: (string | symbol)[];
      listenerCount: number;
    };
    uel: {
      enabled: boolean;
      hasManager: boolean;
      mappedEvents: number;
    };
    integration: {
      compatible: boolean;
      migrationReady: boolean;
    };
  } {
    const eventNames = this.eventNames();
    const listenerCount = eventNames.reduce((total, name) => total + this.listenerCount(name), 0);

    return {
      eventEmitter: {
        maxListeners: this.getMaxListeners(),
        eventNames,
        listenerCount,
      },
      uel: {
        enabled: this.uelEnabled,
        hasManager: !!this.uelManager,
        mappedEvents: this.eventMappings.size,
      },
      integration: {
        compatible: true, // Always backward compatible
        migrationReady: this.uelEnabled && !!this.uelManager,
      },
    };
  }

  /**
   * Map event names to UEL event types for better categorization
   *
   * @param eventEmitterEvent
   * @param uelEventType
   */
  mapEventToUEL(eventEmitterEvent: string, uelEventType: string): void {
    this.eventMappings.set(eventEmitterEvent, uelEventType);
    this.logger?.debug(`Mapped event: ${eventEmitterEvent} -> ${uelEventType}`);
  }

  /**
   * Enable UEL mode for the event bus
   *
   * @param eventManager
   * @param options
   * @param options.managerType
   * @param options.managerName
   * @param options.migrateExistingListeners
   */
  async enableUELMode(
    eventManager: EventManager,
    options?: {
      managerType?: EventManagerType;
      managerName?: string;
      migrateExistingListeners?: boolean;
    }
  ): Promise<void> {
    if (this.uelEnabled) {
      this.logger?.warn('UEL already enabled for this event bus');
      return;
    }

    await this.initializeUELIntegration({
      eventManager,
      managerType: options?.managerType,
      managerName: options?.managerName,
    });

    if (options?.migrateExistingListeners) {
      await this.migrateExistingListeners();
    }
  }

  /**
   * Private methods for UEL integration
   */

  private async emitToUEL(eventName: string, args: any[], startTime: number): Promise<void> {
    if (!this.uelManager) return;

    try {
      const uelEventType = this.eventMappings.get(eventName) || `eventbus:${eventName}`;

      const uelEvent: SystemLifecycleEvent = {
        id: `bus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        source: 'enhanced-event-bus',
        type: uelEventType as any,
        operation: 'emit' as any,
        status: 'success' as any,
        details: {
          originalEvent: eventName,
          args: args.length,
          processingTime: Date.now() - startTime,
          listenerCount: this.listenerCount(eventName),
        },
      };

      await this.uelManager.emit(uelEvent);
    } catch (error) {
      this.logger?.debug(`UEL emit failed for ${eventName}:`, error);
    }
  }

  private async trackUELSubscription(
    eventName: string,
    listener: (...args: any[]) => void
  ): Promise<void> {
    if (!this.uelManager) return;

    try {
      const uelEventType = this.eventMappings.get(eventName) || `eventbus:${eventName}`;

      // Create UEL-compatible listener wrapper
      const uelListener = (event: SystemEvent) => {
        // Extract original args from UEL event if available
        const args =
          event.details?.originalEvent === eventName && event.details?.args
            ? new Array(event.details.args).fill(undefined)
            : [event];

        // Don't call the original listener here - it's already called by EventEmitter
        // This is just for UEL subscription tracking
      };

      const subscriptionId = this.uelManager.subscribe([uelEventType], uelListener);
      this.logger?.debug(`UEL subscription tracked: ${subscriptionId} for ${eventName}`);
    } catch (error) {
      this.logger?.debug(`UEL subscription tracking failed for ${eventName}:`, error);
    }
  }

  private async migrateExistingListeners(): Promise<void> {
    const eventNames = this.eventNames();
    let migratedCount = 0;

    for (const eventName of eventNames) {
      if (typeof eventName === 'string') {
        await this.trackUELSubscription(eventName, () => {});
        migratedCount++;
      }
    }

    this.logger?.info(`Migrated ${migratedCount} existing listeners to UEL tracking`);
  }
}

/**
 * Enhanced Application Coordinator with UEL integration
 * Maintains compatibility with existing application-coordinator.ts
 *
 * @example
 */
export class UELEnhancedApplicationCoordinator extends EventEmitter {
  private uelSystem?: UEL;
  private eventBus?: UELEnhancedEventBus;
  private systemManagers = new Map<string, IEventManager>();
  private logger?: any;

  constructor(
    options: {
      enableUEL?: boolean;
      logger?: any;
      uelConfig?: {
        enableValidation?: boolean;
        enableCompatibility?: boolean;
        healthMonitoring?: boolean;
      };
    } = {}
  ) {
    super();

    this.logger = options.logger || console;

    if (options.enableUEL) {
      this.initializeUEL(options.uelConfig);
    }
  }

  /**
   * Initialize UEL system for the application coordinator
   *
   * @param config
   * @param config.enableValidation
   * @param config.enableCompatibility
   * @param config.healthMonitoring
   */
  private async initializeUEL(config?: {
    enableValidation?: boolean;
    enableCompatibility?: boolean;
    healthMonitoring?: boolean;
  }): Promise<void> {
    try {
      this.uelSystem = UEL.getInstance();

      await this.uelSystem.initialize({
        enableValidation: config?.enableValidation !== false,
        enableCompatibility: config?.enableCompatibility !== false,
        healthMonitoring: config?.healthMonitoring !== false,
        autoRegisterFactories: true,
        logger: this.logger,
      });

      // Create enhanced event bus with UEL integration
      this.eventBus = new UELEnhancedEventBus({
        enableUEL: true,
        uelIntegration: {
          eventManager: this.uelSystem.getEventManager(),
          managerType: EventManagerTypes.SYSTEM,
          managerName: 'application-coordinator',
        },
        logger: this.logger,
      });

      // Set up common event mappings for application coordinator
      this.setupEventMappings();

      // Create system-specific event managers
      await this.createSystemManagers();

      this.logger.info('✅ UEL integration initialized for Application Coordinator');
    } catch (error) {
      this.logger.error('❌ Failed to initialize UEL for Application Coordinator:', error);
    }
  }

  /**
   * Set up event mappings for application coordinator events
   */
  private setupEventMappings(): void {
    if (!this.eventBus) return;

    const mappings = [
      ['system:start', 'system:lifecycle'],
      ['system:stop', 'system:lifecycle'],
      ['system:error', 'system:lifecycle'],
      ['memory:operation', 'system:lifecycle'],
      ['workflow:started', 'coordination:workflow'],
      ['workflow:completed', 'coordination:workflow'],
      ['interface:launched', 'interface:user'],
      ['export:completed', 'system:lifecycle'],
    ];

    for (const [eventName, uelType] of mappings) {
      this.eventBus.mapEventToUEL(eventName, uelType);
    }

    this.logger.debug(`Configured ${mappings.length} event mappings`);
  }

  /**
   * Create system-specific event managers
   */
  private async createSystemManagers(): Promise<void> {
    if (!this.uelSystem) return;

    try {
      // System events manager
      const systemManager = await this.uelSystem.createSystemEventManager('app-system-events', {
        maxListeners: 50,
        enableRetry: true,
        retryAttempts: 3,
      });
      this.systemManagers.set('system', systemManager);

      // Coordination events manager for workflows
      const coordinationManager = await this.uelSystem.createCoordinationEventManager(
        'app-coordination',
        {
          maxListeners: 30,
          queueSize: 1000,
        }
      );
      this.systemManagers.set('coordination', coordinationManager);

      // Interface events manager
      const interfaceManager = await this.uelSystem.createInterfaceEventManager('app-interfaces', {
        maxListeners: 20,
      });
      this.systemManagers.set('interface', interfaceManager);

      this.logger.info(`Created ${this.systemManagers.size} system event managers`);
    } catch (error) {
      this.logger.error('Failed to create system managers:', error);
    }
  }

  /**
   * Enhanced emit that routes to appropriate UEL managers
   *
   * @param eventName
   * @param {...any} args
   */
  emit(eventName: string | symbol, ...args: any[]): boolean {
    // Standard EventEmitter behavior
    const result = super.emit(eventName, ...args);

    // Route to enhanced event bus if available
    if (this.eventBus && typeof eventName === 'string') {
      this.eventBus.emit(eventName, ...args);
    }

    return result;
  }

  /**
   * Get comprehensive system status including UEL integration
   */
  async getSystemStatus(): Promise<{
    applicationCoordinator: {
      initialized: boolean;
      eventNames: (string | symbol)[];
      listenerCount: number;
    };
    uel: {
      enabled: boolean;
      systemStatus?: Awaited<ReturnType<UEL['getSystemStatus']>>;
      managersCreated: number;
    };
    eventBus?: ReturnType<UELEnhancedEventBus['getStatus']>;
  }> {
    const eventNames = this.eventNames();
    const listenerCount = eventNames.reduce((total, name) => total + this.listenerCount(name), 0);

    const status = {
      applicationCoordinator: {
        initialized: true,
        eventNames,
        listenerCount,
      },
      uel: {
        enabled: !!this.uelSystem,
        systemStatus: undefined as any,
        managersCreated: this.systemManagers.size,
      },
      eventBus: this.eventBus?.getStatus(),
    };

    if (this.uelSystem) {
      try {
        status.uel.systemStatus = await this.uelSystem.getSystemStatus();
      } catch (error) {
        this.logger.warn('Failed to get UEL system status:', error);
      }
    }

    return status;
  }

  /**
   * Create event manager for specific system component
   *
   * @param componentName
   * @param type
   * @param config
   */
  async createComponentManager(
    componentName: string,
    type: EventManagerType = EventManagerTypes.SYSTEM,
    config?: Partial<EventManagerConfig>
  ): Promise<IEventManager | null> {
    if (!this.uelSystem) {
      this.logger.warn('UEL not enabled - cannot create component manager');
      return null;
    }

    try {
      const manager = await this.uelSystem.getEventManager().createEventManager({
        type,
        name: `app-${componentName}`,
        config,
        autoStart: true,
      });

      this.systemManagers.set(componentName, manager);
      this.logger.info(`Created event manager for component: ${componentName}`);

      return manager;
    } catch (error) {
      this.logger.error(`Failed to create manager for ${componentName}:`, error);
      return null;
    }
  }

  /**
   * Validate system integration health
   */
  async validateIntegration(): Promise<{
    valid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check UEL integration
    if (!this.uelSystem) {
      issues.push('UEL system not initialized');
      score -= 30;
      recommendations.push('Enable UEL integration for enhanced event handling');
    } else {
      try {
        const uelStatus = await this.uelSystem.getSystemStatus();
        if (!uelStatus.initialized) {
          issues.push('UEL system not properly initialized');
          score -= 20;
        }

        if (uelStatus.healthPercentage < 80) {
          issues.push(`UEL system health degraded: ${uelStatus.healthPercentage}%`);
          score -= 15;
        }
      } catch (error) {
        issues.push('Failed to check UEL system status');
        score -= 10;
      }
    }

    // Check event bus integration
    if (!this.eventBus) {
      recommendations.push('Consider enabling enhanced event bus for better integration');
      score -= 10;
    }

    // Check system managers
    if (this.systemManagers.size === 0) {
      recommendations.push('Create system-specific event managers for better organization');
      score -= 5;
    }

    return {
      valid: issues.length === 0,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Shutdown UEL integration gracefully
   */
  async shutdown(): Promise<void> {
    try {
      // Shutdown system managers
      for (const [name, manager] of this.systemManagers) {
        try {
          await manager.stop();
          await manager.destroy();
        } catch (error) {
          this.logger.warn(`Failed to shutdown manager ${name}:`, error);
        }
      }
      this.systemManagers.clear();

      // Shutdown UEL system
      if (this.uelSystem) {
        await this.uelSystem.shutdown();
        this.uelSystem = undefined;
      }

      this.eventBus = undefined;
      this.logger.info('✅ Application Coordinator UEL integration shut down');
    } catch (error) {
      this.logger.error('❌ Failed to shutdown Application Coordinator UEL integration:', error);
    }
  }
}

/**
 * Observer System Enhancement with UEL integration
 * Maintains compatibility with existing observer-system.ts
 *
 * @example
 */
export class UELEnhancedObserverSystem extends EventEmitter {
  private uelEventManager?: IEventManager;
  private observers = new Map<string, EventEmitter>();
  private logger?: any;

  constructor(
    options: {
      enableUEL?: boolean;
      eventManager?: EventManager;
      logger?: any;
    } = {}
  ) {
    super();

    this.logger = options.logger;

    if (options.enableUEL && options.eventManager) {
      this.initializeUELIntegration(options.eventManager);
    }
  }

  /**
   * Initialize UEL integration for observer system
   *
   * @param eventManager
   */
  private async initializeUELIntegration(eventManager: EventManager): Promise<void> {
    try {
      this.uelEventManager = await eventManager.createMonitoringEventManager('observer-system', {
        maxListeners: 100,
        enableRetry: true,
        retryAttempts: 2,
      });

      this.logger?.info('✅ UEL integration initialized for Observer System');
    } catch (error) {
      this.logger?.error('❌ Failed to initialize UEL for Observer System:', error);
    }
  }

  /**
   * Create observer with optional UEL integration
   *
   * @param name
   * @param type
   */
  createObserver(name: string, type: string = 'custom'): EventEmitter {
    const observer = new EventEmitter();
    observer.setMaxListeners(50);

    // Wrap with UEL integration if available
    if (this.uelEventManager) {
      this.enhanceObserverWithUEL(observer, name, type);
    }

    this.observers.set(name, observer);
    this.emit('observer:created', { name, type });

    this.logger?.debug(`Created observer: ${name} (${type})`);
    return observer;
  }

  /**
   * Enhance observer with UEL capabilities
   *
   * @param observer
   * @param name
   * @param type
   */
  private enhanceObserverWithUEL(observer: EventEmitter, name: string, type: string): void {
    const originalEmit = observer.emit.bind(observer);

    observer.emit = (eventName: string | symbol, ...args: any[]): boolean => {
      const result = originalEmit(eventName, ...args);

      // Emit to UEL system
      if (this.uelEventManager && typeof eventName === 'string') {
        const uelEvent: MonitoringEvent = {
          id: `obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          source: `observer-${name}`,
          type: `monitoring:observer` as any,
          operation: 'observe' as any,
          component: type,
          details: {
            observerName: name,
            observerType: type,
            eventName: eventName.toString(),
            argsCount: args.length,
          },
        };

        this.uelEventManager.emit(uelEvent).catch((error) => {
          this.logger?.debug(`UEL observer event failed for ${name}:`, error);
        });
      }

      return result;
    };
  }

  /**
   * Get observer system status
   */
  getStatus(): {
    observerSystem: {
      totalObservers: number;
      observers: string[];
    };
    uel: {
      enabled: boolean;
      hasManager: boolean;
    };
  } {
    return {
      observerSystem: {
        totalObservers: this.observers.size,
        observers: Array.from(this.observers.keys()),
      },
      uel: {
        enabled: !!this.uelEventManager,
        hasManager: !!this.uelEventManager,
      },
    };
  }

  /**
   * Remove observer and clean up resources
   *
   * @param name
   */
  removeObserver(name: string): boolean {
    const observer = this.observers.get(name);
    if (observer) {
      observer.removeAllListeners();
      this.observers.delete(name);
      this.emit('observer:removed', { name });
      this.logger?.debug(`Removed observer: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Get observer by name
   *
   * @param name
   */
  getObserver(name: string): EventEmitter | undefined {
    return this.observers.get(name);
  }

  /**
   * List all observer names
   */
  listObservers(): string[] {
    return Array.from(this.observers.keys());
  }
}

/**
 * System Integration Factory
 * Provides factory methods for creating enhanced versions of core systems
 *
 * @example
 */
export class SystemIntegrationFactory {
  private static instance: SystemIntegrationFactory;
  private eventManager?: EventManager;
  private logger?: any;

  private constructor() {}

  static getInstance(): SystemIntegrationFactory {
    if (!SystemIntegrationFactory.instance) {
      SystemIntegrationFactory.instance = new SystemIntegrationFactory();
    }
    return SystemIntegrationFactory.instance;
  }

  /**
   * Initialize the factory with UEL event manager
   *
   * @param eventManager
   * @param logger
   */
  async initialize(eventManager: EventManager, logger?: any): Promise<void> {
    this.eventManager = eventManager;
    this.logger = logger;
  }

  /**
   * Create enhanced event bus with UEL integration
   *
   * @param options
   * @param options.enableUEL
   * @param options.managerType
   * @param options.managerName
   * @param options.maxListeners
   */
  createEnhancedEventBus(
    options: {
      enableUEL?: boolean;
      managerType?: EventManagerType;
      managerName?: string;
      maxListeners?: number;
    } = {}
  ): UELEnhancedEventBus {
    return new UELEnhancedEventBus({
      enableUEL: options.enableUEL && !!this.eventManager,
      uelIntegration: this.eventManager
        ? {
            eventManager: this.eventManager,
            managerType: options.managerType || EventManagerTypes.SYSTEM,
            managerName: options.managerName || 'enhanced-bus',
          }
        : undefined,
      logger: this.logger,
      maxListeners: options.maxListeners,
    });
  }

  /**
   * Create enhanced application coordinator with UEL integration
   *
   * @param options
   * @param options.enableUEL
   * @param options.uelConfig
   * @param options.uelConfig.enableValidation
   * @param options.uelConfig.enableCompatibility
   * @param options.uelConfig.healthMonitoring
   */
  createEnhancedApplicationCoordinator(
    options: {
      enableUEL?: boolean;
      uelConfig?: {
        enableValidation?: boolean;
        enableCompatibility?: boolean;
        healthMonitoring?: boolean;
      };
    } = {}
  ): UELEnhancedApplicationCoordinator {
    return new UELEnhancedApplicationCoordinator({
      enableUEL: options.enableUEL,
      logger: this.logger,
      uelConfig: options.uelConfig,
    });
  }

  /**
   * Create enhanced observer system with UEL integration
   *
   * @param options
   * @param options.enableUEL
   */
  createEnhancedObserverSystem(options: { enableUEL?: boolean } = {}): UELEnhancedObserverSystem {
    return new UELEnhancedObserverSystem({
      enableUEL: options.enableUEL && !!this.eventManager,
      eventManager: this.eventManager,
      logger: this.logger,
    });
  }

  /**
   * Check if UEL integration is available
   */
  isUELAvailable(): boolean {
    return !!this.eventManager;
  }

  /**
   * Get integration status
   */
  getStatus(): {
    initialized: boolean;
    uelAvailable: boolean;
    eventManagerReady: boolean;
  } {
    return {
      initialized: !!this.eventManager && !!this.logger,
      uelAvailable: !!this.eventManager,
      eventManagerReady: !!this.eventManager,
    };
  }
}

/**
 * Utility functions for system integration
 */

/**
 * Create UEL-enhanced version of any EventEmitter-based class
 *
 * @param originalInstance
 * @param name
 * @param eventManager
 * @param managerType
 * @param logger
 */
export async function enhanceWithUEL<T extends EventEmitter>(
  originalInstance: T,
  name: string,
  eventManager: EventManager,
  managerType: EventManagerType = EventManagerTypes.SYSTEM,
  logger?: any
): Promise<UELCompatibleEventEmitter> {
  const migrationHelper = new EventEmitterMigrationHelper(eventManager, logger);
  return await migrationHelper.wrapEventEmitter(originalInstance, name, managerType);
}

/**
 * Analyze existing EventEmitter usage across the system
 *
 * @param logger
 */
export function analyzeSystemEventEmitterUsage(
  systems: { [key: string]: EventEmitter },
  logger?: any
): {
  totalSystems: number;
  systemAnalyses: { [key: string]: ReturnType<EventEmitterMigrationHelper['analyzeEventEmitter']> };
  migrationRecommendations: string[];
  overallComplexity: 'low' | 'medium' | 'high';
} {
  const migrationHelper = new EventEmitterMigrationHelper(null as any, logger);
  const systemAnalyses: { [key: string]: any } = {};
  const migrationRecommendations: string[] = [];

  let totalListeners = 0;
  let totalEventTypes = 0;
  let highComplexitySystems = 0;

  for (const [systemName, system] of Object.entries(systems)) {
    try {
      const analysis = migrationHelper.analyzeEventEmitter(system);
      systemAnalyses[systemName] = analysis;

      totalListeners += Object.values(analysis.listenerCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      totalEventTypes += analysis.eventTypes.length;

      if (analysis.migrationComplexity === 'high') {
        highComplexitySystems++;
      }

      // Add system-specific recommendations
      if (analysis.migrationComplexity === 'high') {
        migrationRecommendations.push(`${systemName}: High complexity - plan careful migration`);
      }

      if (Object.values(analysis.listenerCounts).some((count) => count > 10)) {
        migrationRecommendations.push(
          `${systemName}: High listener count - UEL would improve performance`
        );
      }
    } catch (error) {
      logger?.warn(`Failed to analyze system ${systemName}:`, error);
    }
  }

  // Determine overall complexity
  const systemCount = Object.keys(systems).length;
  let overallComplexity: 'low' | 'medium' | 'high' = 'low';

  if (highComplexitySystems > systemCount * 0.3 || totalListeners > 100) {
    overallComplexity = 'high';
  } else if (highComplexitySystems > 0 || totalListeners > 50 || totalEventTypes > 50) {
    overallComplexity = 'medium';
  }

  // Add global recommendations
  if (totalListeners > 100) {
    migrationRecommendations.push('System-wide: High listener count - UEL integration recommended');
  }

  if (totalEventTypes > 50) {
    migrationRecommendations.push('System-wide: Many event types - UEL categorization would help');
  }

  return {
    totalSystems: systemCount,
    systemAnalyses,
    migrationRecommendations,
    overallComplexity,
  };
}

/**
 * Global system integration utilities
 */
export const UELSystemIntegration = {
  // Factory instance
  factory: SystemIntegrationFactory.getInstance(),

  // Enhanced classes
  EnhancedEventBus: UELEnhancedEventBus,
  EnhancedApplicationCoordinator: UELEnhancedApplicationCoordinator,
  EnhancedObserverSystem: UELEnhancedObserverSystem,

  // Utility functions
  enhanceWithUEL,
  analyzeSystemEventEmitterUsage,

  // Initialize system integration
  async initialize(eventManager: EventManager, logger?: any): Promise<void> {
    await SystemIntegrationFactory.getInstance().initialize(eventManager, logger);
  },
};

export default UELSystemIntegration;
