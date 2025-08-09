import { getLogger } from '../config/logging-config';

const logger = getLogger('interfaces-events-index');

/**
 * UEL (Unified Event Layer) - Main Exports.
 *
 * Central export point for all UEL functionality including:
 * - Event manager registry and factory
 * - Event type definitions and configurations
 * - Helper functions and utilities.
 * - Global instances and initialization.
 *
 * @file Main UEL exports.
 */

// UEL Event Adapters - Unified Event Adapter Integration
export {
  // Communication Event Adapters
  CommunicationEventAdapter,
  type CommunicationEventAdapterConfig,
  CommunicationEventFactory,
  CommunicationEventHelpers,
  // Coordination Event Adapters
  CoordinationEventAdapter,
  type CoordinationEventAdapterConfig,
  CoordinationEventHelpers,
  CoordinationEventManagerFactory,
  createAgentManagementEventManager,
  createApplicationCoordinatorEventManager,
  createCommunicationEventAdapter,
  createComprehensiveCommunicationAdapter,
  createComprehensiveCoordinationEventManager,
  createComprehensiveSystemEventManager,
  createCoordinationEventAdapter,
  createCoordinationEventManager,
  createCoreSystemEventManager,
  createDefaultCommunicationEventAdapterConfig,
  createDefaultCoordinationEventAdapterConfig,
  createDefaultMonitoringEventAdapterConfig,
  createDefaultSystemEventAdapterConfig,
  createDevelopmentCoordinationEventManager,
  createErrorRecoveryEventManager,
  createHighPerformanceCoordinationEventManager,
  createHTTPCommunicationAdapter,
  createMCPCommunicationAdapter,
  createMonitoringEventAdapter,
  createProtocolCommunicationAdapter,
  createProtocolManagementEventManager,
  createSwarmCoordinationEventManager,
  createSystemEventAdapter,
  createSystemEventManager,
  createTaskOrchestrationEventManager,
  createWebSocketCommunicationAdapter,
  EventAdapterFactories,
  type EventAdapterType,
  // Adapter Framework
  EventAdapterTypes,
  EventAdapterUtils,
  // Monitoring Event Adapters
  MonitoringEventAdapter,
  type MonitoringEventAdapterConfig,
  MonitoringEventHelpers,
  MonitoringEventManagerFactory,
  // System Event Adapters
  SystemEventAdapter,
  // Types
  type SystemEventAdapterConfig,
  SystemEventHelpers,
  SystemEventManagerFactory,
} from './adapters';

// Core interfaces for UEL
export type {
  EventBatch,
  EventEmissionOptions,
  EventFilter,
  EventHealthConfig,
  EventListener,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventManagerType,
  EventMonitoringConfig,
  EventPriority,
  EventProcessingStrategy,
  EventQueryOptions,
  EventRetryConfig,
  EventSubscription,
  EventTransform,
  IEventManager,
  IEventManagerFactory,
  IEventManagerRegistry,
  SystemEvent,
} from './core/interfaces';

export {
  EventEmissionError,
  EventError,
  EventFilterError,
  EventManagerPresets,
  EventManagerTypes,
  EventRetryExhaustedError,
  EventSubscriptionError,
  EventTimeoutError,
  EventTypeGuards,
} from './core/interfaces';
// Core UEL components
export {
  type EventManagerFactoryConfig,
  type EventManagerRegistry,
  type EventManagerTransaction,
  type EventManagerTypeMap,
  type ICommunicationEventManager,
  type ICoordinationEventManager,
  type IDatabaseEventManager,
  type IInterfaceEventManager,
  type IMemoryEventManager,
  type IMonitoringEventManager,
  type INeuralEventManager,
  type ISystemEventManager,
  type IWorkflowEventManager,
  UELFactory,
  UELRegistry,
} from './factories';
// Event type definitions
export type {
  CommunicationEvent,
  CoordinationEvent,
  DatabaseEvent,
  InterfaceEvent,
  MemoryEvent,
  MonitoringEvent,
  NeuralEvent,
  SystemLifecycleEvent,
  UELEvent,
  WorkflowEvent,
} from './types';
export {
  DefaultEventManagerConfigs,
  EventCategories,
  EventConstants,
  EventPriorityMap,
  EventSources,
  EventTypePatterns,
  UELTypeGuards,
} from './types';

// Import types for internal use
import type {
  CommunicationEventAdapter,
  CommunicationEventAdapterConfig,
  CoordinationEventAdapter,
  CoordinationEventAdapterConfig,
  SystemEventAdapter,
  SystemEventAdapterConfig,
} from './adapters';

export {
  CompatibilityFactory,
  CompatibleEventEmitter,
  createCompatibleEventEmitter,
  EventEmitterMigrationHelper,
  MigrationHelper,
  // Backward Compatibility Layer
  UELCompatibleEventEmitter,
  wrapWithUEL,
} from './compatibility';
// Factory convenience functions
export {
  createCommunicationEventBus,
  createCoordinationEventBus,
  createEventManager,
  createMonitoringEventBus,
  createSystemEventBus,
} from './factories';

export {
  type ConnectionManager,
  type CoordinationSettings,
  // Event Manager System
  EventManager,
  type EventManagerCreationOptions,
  type ManagerStatistics,
} from './manager';
// Legacy compatibility - re-export from observer system
export {
  type AllSystemEvents,
  type DatabaseEvent as LegacyDatabaseEvent,
  DatabaseObserver,
  EventBuilder,
  type InterfaceEvent as LegacyInterfaceEvent,
  LoggerObserver,
  type MCPEvent,
  type MemoryEvent as LegacyMemoryEvent,
  MetricsObserver,
  type NeuralEvent as LegacyNeuralEvent,
  type ObserverType,
  type SwarmEvent,
  type SwarmMetrics,
  type SwarmStatus,
  type SwarmTopology,
  SystemEventManager,
  type SystemObserver,
  type ToolResult,
  WebSocketObserver,
} from './observer-system';
// UEL Integration Layer - Complete System Components
export {
  type EventDiscoveryConfig,
  // Event Registry System
  EventRegistry,
  type EventRegistryEntry,
  type EventTypeRegistry,
  type FactoryRegistry,
  type HealthMonitoringConfig,
} from './registry';

export {
  analyzeSystemEventEmitterUsage,
  enhanceWithUEL,
  SystemIntegrationFactory,
  UELEnhancedApplicationCoordinator,
  // System Integration Layer - Enhanced Versions of Core Systems
  UELEnhancedEventBus,
  UELEnhancedObserverSystem,
  UELSystemIntegration,
} from './system-integrations';
export {
  type EventTypeSchema,
  type HealthValidationConfig,
  type IntegrationValidationConfig,
  // Validation Framework
  UELValidationFramework,
  type ValidationError,
  type ValidationRecommendation,
  type ValidationResult,
  type ValidationWarning,
} from './validation';

/**
 * UEL Main Interface - Primary entry point for the Unified Event Layer.
 *
 * Provides high-level methods for event manager creation, operations, and system management.
 * Implements the singleton pattern to ensure system-wide consistency.
 *
 * @class UEL
 * @example
 * ```typescript
 * // Initialize UEL system
 * const uel = UEL.getInstance();
 * await uel.initialize({
 *   enableValidation: true,
 *   enableCompatibility: true,
 *   healthMonitoring: true
 * });
 *
 * // Create event managers
 * const systemManager = await uel.createSystemEventManager('main-system');
 * const coordManager = await uel.createCoordinationEventManager('swarm-coord');
 *
 * // Broadcast events globally
 * await uel.broadcast({
 *   id: 'global-event',
 *   timestamp: new Date(),
 *   source: 'uel-system',
 *   type: 'system:announcement'
 * });
 * ```
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

  /**
   * Get the singleton UEL instance.
   *
   * @returns The global UEL instance.
   * @example
   * ```typescript
   * const uel = UEL.getInstance();
   * if (!uel.isInitialized()) {
   *   await uel.initialize();
   * }
   * ```
   */
  static getInstance(): UEL {
    if (!UEL.instance) {
      UEL.instance = new UEL();
    }
    return UEL.instance;
  }

  /**
   * Initialize UEL system with complete integration.
   *
   * Sets up all UEL components including factories, registries, event managers,
   * validation framework, and compatibility layer.
   *
   * @param config - Configuration options for UEL initialization.
   * @param config.logger - Custom logger instance (defaults to console).
   * @param config.config - Configuration object for dependency injection.
   * @param config.autoRegisterFactories - Whether to auto-register default factories (default: true).
   * @param config.enableValidation - Whether to enable validation framework (default: true).
   * @param config.enableCompatibility - Whether to enable compatibility layer (default: true).
   * @param config.healthMonitoring - Whether to enable health monitoring (default: true).
   * @throws {Error} If initialization fails.
   * @example
   * ```typescript
   * await uel.initialize({
   *   logger: customLogger,
   *   enableValidation: true,
   *   enableCompatibility: true,
   *   healthMonitoring: true,
   *   autoRegisterFactories: true
   * });
   * ```
   */
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

    // Initialize factory and registry (legacy)
    const { UELFactory, UELRegistry } = await import('./factories');
    const { EventManager } = await import('./manager');
    const { EventRegistry } = await import('./registry');
    const { UELValidationFramework } = await import('./validation');
    const { CompatibilityFactory } = await import('./compatibility');
    const { DIContainer } = await import('../../di/container/di-container');
    const { CORE_TOKENS } = await import('../../di/tokens/core-tokens');

    const container = new DIContainer();

    // Register dependencies
    const logger = config?.logger || {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    container.register(CORE_TOKENS.Logger, () => logger);
    container.register(CORE_TOKENS.Config, () => config?.config || {});

    // Initialize legacy components
    this.factory = container.resolve(UELFactory);
    this.registry = container.resolve(UELRegistry);

    // Initialize new integration components
    this.eventManager = container.resolve(EventManager);
    this.eventRegistry = container.resolve(EventRegistry);

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

    // Auto-register factories if requested (legacy)
    if (config?.autoRegisterFactories !== false) {
      await this.registerDefaultFactories();
    }

    this.initialized = true;
    logger.info('🚀 UEL System fully initialized with complete integration layer');
  }

  /**
   * Check if UEL is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the UEL factory instance.
   */
  getFactory(): UELFactory {
    if (!this.factory) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.factory;
  }

  /**
   * Get the UEL registry instance.
   */
  getRegistry(): UELRegistry {
    if (!this.registry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.registry;
  }

  /**
   * Get the event manager instance.
   */
  getEventManager(): EventManager {
    if (!this.eventManager) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.eventManager;
  }

  /**
   * Get the event registry instance.
   */
  getEventRegistry(): EventRegistry {
    if (!this.eventRegistry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.eventRegistry;
  }

  /**
   * Get the validation framework instance.
   */
  getValidationFramework(): UELValidationFramework {
    if (!this.validationFramework) {
      throw new Error('Validation framework not enabled. Initialize with enableValidation: true');
    }
    return this.validationFramework;
  }

  /**
   * Get the compatibility factory instance.
   */
  getCompatibilityFactory(): CompatibilityFactory {
    if (!this.compatibilityFactory) {
      throw new Error(
        'Compatibility factory not enabled. Initialize with enableCompatibility: true'
      );
    }
    return this.compatibilityFactory;
  }

  /**
   * Create and register a system event manager.
   *
   * Creates an event manager optimized for system lifecycle events with real-time processing.
   *
   * @param name - Unique name for the event manager (default: 'default-system').
   * @param config - Optional configuration overrides.
   * @returns Promise resolving to the created system event manager.
   * @throws {Error} If manager creation fails.
   * @example
   * ```typescript
   * const systemManager = await uel.createSystemEventManager('core-system', {
   *   processing: { strategy: 'immediate' },
   *   maxListeners: 1000
   * });
   *
   * await systemManager.emitSystemEvent({
   *   id: 'sys-001',
   *   timestamp: new Date(),
   *   source: 'core',
   *   type: 'system:startup',
   *   operation: 'initialize',
   *   status: 'success'
   * });
   * ```
   */
  async createSystemEventManager(
    name: string = 'default-system',
    config?: Partial<EventManagerConfig>
  ): Promise<ISystemEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createSystemEventManager(name, config);
  }

  /**
   * Create system event adapter with UEL integration.
   *
   * @param name
   * @param config
   */
  async createSystemEventAdapter(
    name: string,
    config?: Partial<SystemEventAdapterConfig>
  ): Promise<SystemEventAdapter> {
    const { createSystemEventAdapter, createDefaultSystemEventAdapterConfig } = await import(
      './adapters'
    );
    const adapterConfig = createDefaultSystemEventAdapterConfig(name, config);
    return createSystemEventAdapter(adapterConfig);
  }

  /**
   * Create coordination event adapter with UEL integration.
   *
   * @param name
   * @param config
   */
  async createCoordinationEventAdapter(
    name: string,
    config?: Partial<CoordinationEventAdapterConfig>
  ): Promise<CoordinationEventAdapter> {
    const { createCoordinationEventAdapter, createDefaultCoordinationEventAdapterConfig } =
      await import('./adapters');
    const adapterConfig = createDefaultCoordinationEventAdapterConfig(name, config);
    return createCoordinationEventAdapter(adapterConfig);
  }

  /**
   * Create communication event adapter with UEL integration.
   *
   * @param name
   * @param config
   */
  async createCommunicationEventAdapter(
    name: string,
    config?: Partial<CommunicationEventAdapterConfig>
  ): Promise<CommunicationEventAdapter> {
    const { createCommunicationEventAdapter, createDefaultCommunicationEventAdapterConfig } =
      await import('./adapters');
    const adapterConfig = createDefaultCommunicationEventAdapterConfig(name, config);
    return createCommunicationEventAdapter(adapterConfig);
  }

  /**
   * Create and register coordination event manager.
   *
   * @param name
   * @param config
   */
  async createCoordinationEventManager(
    name: string = 'default-coordination',
    config?: Partial<EventManagerConfig>
  ): Promise<ICoordinationEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createCoordinationEventManager(name, config);
  }

  /**
   * Create and register communication event manager.
   *
   * @param name
   * @param config
   */
  async createCommunicationEventManager(
    name: string = 'default-communication',
    config?: Partial<EventManagerConfig>
  ): Promise<ICommunicationEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createCommunicationEventManager(name, config);
  }

  /**
   * Create and register monitoring event manager.
   *
   * @param name
   * @param config
   */
  async createMonitoringEventManager(
    name: string = 'default-monitoring',
    config?: Partial<EventManagerConfig>
  ): Promise<IMonitoringEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createMonitoringEventManager(name, config);
  }

  /**
   * Create and register interface event manager.
   *
   * @param name
   * @param config
   */
  async createInterfaceEventManager(
    name: string = 'default-interface',
    config?: Partial<EventManagerConfig>
  ): Promise<IInterfaceEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createInterfaceEventManager(name, config);
  }

  /**
   * Create and register neural event manager.
   *
   * @param name
   * @param config
   */
  async createNeuralEventManager(
    name: string = 'default-neural',
    config?: Partial<EventManagerConfig>
  ): Promise<INeuralEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createNeuralEventManager(name, config);
  }

  /**
   * Create and register database event manager.
   *
   * @param name
   * @param config
   */
  async createDatabaseEventManager(
    name: string = 'default-database',
    config?: Partial<EventManagerConfig>
  ): Promise<IDatabaseEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createDatabaseEventManager(name, config);
  }

  /**
   * Create and register memory event manager.
   *
   * @param name
   * @param config
   */
  async createMemoryEventManager(
    name: string = 'default-memory',
    config?: Partial<EventManagerConfig>
  ): Promise<IMemoryEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createMemoryEventManager(name, config);
  }

  /**
   * Create and register workflow event manager.
   *
   * @param name
   * @param config
   */
  async createWorkflowEventManager(
    name: string = 'default-workflow',
    config?: Partial<EventManagerConfig>
  ): Promise<IWorkflowEventManager> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.getFactory().createWorkflowEventManager(name, config);
  }

  /**
   * Get event manager by name.
   *
   * @param name
   */
  getEventManager(name: string): IEventManager | null {
    if (!this.factory) return null;
    return this.factory.getEventManager(name);
  }

  /**
   * Get all event managers by type.
   *
   * @param type
   */
  getEventManagersByType(type: EventManagerType): IEventManager[] {
    if (!this.registry) return [];
    return this.registry.getEventManagersByType(type);
  }

  /**
   * Get system health status.
   */
  async getHealthStatus(): Promise<EventManagerStatus[]> {
    if (!this.factory) return [];
    return this.factory.healthCheckAll();
  }

  /**
   * Get global metrics.
   */
  async getGlobalMetrics(): Promise<{
    totalManagers: number;
    totalEvents: number;
    totalSubscriptions: number;
    averageLatency: number;
    errorRate: number;
  }> {
    if (!this.registry) {
      return {
        totalManagers: 0,
        totalEvents: 0,
        totalSubscriptions: 0,
        averageLatency: 0,
        errorRate: 0,
      };
    }
    return this.registry.getGlobalMetrics();
  }

  /**
   * Get comprehensive system status with all integration components.
   */
  async getSystemStatus(): Promise<{
    initialized: boolean;
    components: {
      factory: boolean;
      registry: boolean;
      eventManager: boolean;
      eventRegistry: boolean;
      validation: boolean;
      compatibility: boolean;
    };
    factoryStats: ReturnType<UELFactory['getStats']>;
    globalMetrics: Awaited<ReturnType<UELRegistry['getGlobalMetrics']>>;
    healthStatus: EventManagerStatus[];
    integrationStats?: Awaited<ReturnType<EventManager['getSystemStatus']>>;
    registryStats?: ReturnType<EventRegistry['getRegistryStats']>;
    validationStatus?: {
      enabled: boolean;
      historyCount: number;
    };
  }> {
    const factoryStats = this.factory?.getStats() || {
      totalManagers: 0,
      managersByType: {} as Record<string, number>,
      managersByStatus: {},
      cacheSize: 0,
      transactions: 0,
    };

    const globalMetrics = await this.getGlobalMetrics();
    const healthStatus = await this.getHealthStatus();

    // Get integration component stats if available
    const integrationStats = this.eventManager
      ? await this.eventManager.getSystemStatus()
      : undefined;
    const registryStats = this.eventRegistry ? this.eventRegistry.getRegistryStats() : undefined;
    const validationStatus = this.validationFramework
      ? {
          enabled: true,
          historyCount: this.validationFramework.getValidationHistory().length,
        }
      : { enabled: false, historyCount: 0 };

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
      factoryStats,
      globalMetrics,
      healthStatus,
      integrationStats,
      registryStats,
      validationStatus,
    };
  }

  /**
   * Perform comprehensive validation of the entire UEL system.
   *
   * @param options
   * @param options.includeHealthCheck
   * @param options.includeIntegrationCheck
   * @param options.sampleEvents
   */
  async validateSystem(options?: {
    includeHealthCheck?: boolean;
    includeIntegrationCheck?: boolean;
    sampleEvents?: SystemEvent[];
  }): Promise<ReturnType<UELValidationFramework['validateComplete']> | null> {
    if (!this.validationFramework || !this.eventManager || !this.eventRegistry) {
      return null;
    }

    return await this.validationFramework.validateComplete(
      this.eventManager,
      this.eventRegistry,
      options?.sampleEvents
    );
  }

  /**
   * Create backward-compatible EventEmitter with UEL integration.
   *
   * @param name
   * @param type
   * @param options
   * @param options.enableUEL
   * @param options.migrationMode
   */
  async createCompatibleEventEmitter(
    name: string,
    type: EventManagerType = EventManagerTypes.SYSTEM,
    options?: {
      enableUEL?: boolean;
      migrationMode?: 'disabled' | 'passive' | 'active';
    }
  ): Promise<UELCompatibleEventEmitter | null> {
    if (!this.compatibilityFactory) {
      return null;
    }

    return await this.compatibilityFactory.createEnhancedEventEmitter(name, type, options);
  }

  /**
   * Create enhanced event bus with UEL integration.
   *
   * @param options
   * @param options.enableUEL
   * @param options.managerType
   * @param options.managerName
   * @param options.maxListeners
   */
  async createEnhancedEventBus(options?: {
    enableUEL?: boolean;
    managerType?: EventManagerType;
    managerName?: string;
    maxListeners?: number;
  }): Promise<UELEnhancedEventBus | null> {
    if (!this.eventManager) {
      return null;
    }

    const { UELSystemIntegration } = await import('./system-integrations');
    await UELSystemIntegration.initialize(this.eventManager, this.logger);

    return UELSystemIntegration.factory.createEnhancedEventBus({
      enableUEL: options?.enableUEL !== false,
      managerType: options?.managerType,
      managerName: options?.managerName || 'uel-enhanced-bus',
      maxListeners: options?.maxListeners,
    });
  }

  /**
   * Create enhanced application coordinator with UEL integration.
   *
   * @param options
   * @param options.enableUEL
   * @param options.uelConfig
   * @param options.uelConfig.enableValidation
   * @param options.uelConfig.enableCompatibility
   * @param options.uelConfig.healthMonitoring
   */
  async createEnhancedApplicationCoordinator(options?: {
    enableUEL?: boolean;
    uelConfig?: {
      enableValidation?: boolean;
      enableCompatibility?: boolean;
      healthMonitoring?: boolean;
    };
  }): Promise<UELEnhancedApplicationCoordinator | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const { UELSystemIntegration } = await import('./system-integrations');
    await UELSystemIntegration.initialize(this.eventManager!, this.logger);

    return UELSystemIntegration.factory.createEnhancedApplicationCoordinator({
      enableUEL: options?.enableUEL !== false,
      uelConfig: options?.uelConfig,
    });
  }

  /**
   * Create enhanced observer system with UEL integration.
   *
   * @param options
   * @param options.enableUEL
   */
  async createEnhancedObserverSystem(options?: {
    enableUEL?: boolean;
  }): Promise<UELEnhancedObserverSystem | null> {
    if (!this.eventManager) {
      return null;
    }

    const { UELSystemIntegration } = await import('./system-integrations');
    await UELSystemIntegration.initialize(this.eventManager, this.logger);

    return UELSystemIntegration.factory.createEnhancedObserverSystem({
      enableUEL: options?.enableUEL !== false,
    });
  }

  /**
   * Analyze existing system EventEmitter usage.
   */
  async analyzeSystemEventEmitters(systems: { [key: string]: unknown }): Promise<{
    totalSystems: number;
    systemAnalyses: { [key: string]: { emitters: number; listeners: number; complexity: string } };
    migrationRecommendations: string[];
    overallComplexity: 'low' | 'medium' | 'high';
  }> {
    const { analyzeSystemEventEmitterUsage } = await import('./system-integrations');
    return analyzeSystemEventEmitterUsage(systems, this.logger);
  }

  /**
   * Enhance existing EventEmitter with UEL capabilities.
   *
   * @param originalInstance
   * @param name
   * @param managerType
   */
  async enhanceExistingSystem<T>(
    originalInstance: T,
    name: string,
    managerType: EventManagerType = EventManagerTypes.SYSTEM
  ): Promise<UELCompatibleEventEmitter | null> {
    if (!this.eventManager) {
      return null;
    }

    const { enhanceWithUEL } = await import('./system-integrations');
    return await enhanceWithUEL(
      originalInstance,
      name,
      this.eventManager,
      managerType,
      this.logger
    );
  }

  /**
   * Migrate existing EventEmitter to UEL.
   *
   * @param emitter
   * @param emitter.on
   * @param name
   * @param emitter.off
   * @param type
   * @param emitter.emit
   * @param emitter.listeners
   */
  async migrateEventEmitter(
    emitter: { on: Function; off?: Function; emit: Function; listeners?: Function }, // EventEmitter-like interface
    name: string,
    type: EventManagerType = EventManagerTypes.SYSTEM
  ): Promise<UELCompatibleEventEmitter | null> {
    if (!this.compatibilityFactory) {
      return null;
    }

    return await this.compatibilityFactory.wrapExistingEmitter(emitter, name, type);
  }

  /**
   * Register event type for validation.
   *
   * @param eventType
   * @param schema
   */
  registerEventTypeSchema(eventType: string, schema: Record<string, unknown>): void {
    if (this.validationFramework) {
      this.validationFramework.registerEventTypeSchema(eventType, schema);
    }

    if (this.eventRegistry) {
      this.eventRegistry.registerEventType(eventType, {
        category: 'custom',
        managerTypes: [EventManagerTypes.SYSTEM],
        schema,
      });
    }
  }

  /**
   * Broadcast event to all event managers.
   *
   * @param event
   */
  async broadcast<T extends SystemEvent>(event: T): Promise<void> {
    if (!this.registry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    await this.registry.broadcast(event);
  }

  /**
   * Broadcast event to specific event manager type.
   *
   * @param type
   * @param event
   */
  async broadcastToType<T extends SystemEvent>(type: EventManagerType, event: T): Promise<void> {
    if (!this.registry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    await this.registry.broadcastToType(type, event);
  }

  /**
   * Shutdown UEL system with all integration components.
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Shutdown all components in proper order
    const shutdownPromises = [];

    if (this.eventManager) {
      shutdownPromises.push(this.eventManager.shutdown());
    }

    if (this.eventRegistry) {
      shutdownPromises.push(this.eventRegistry.shutdownAll());
    }

    if (this.factory) {
      shutdownPromises.push(this.factory.shutdownAll());
    }

    if (this.registry) {
      shutdownPromises.push(this.registry.shutdownAll());
    }

    await Promise.allSettled(shutdownPromises);

    // Clear validation history
    if (this.validationFramework) {
      this.validationFramework.clearValidationHistory();
    }

    // Reset all components
    this.factory = null;
    this.registry = null;
    this.eventManager = null;
    this.eventRegistry = null;
    this.validationFramework = null;
    this.compatibilityFactory = null;
    this.initialized = false;
  }

  /**
   * Register default factories for all event manager types.
   */
  private async registerDefaultFactories(): Promise<void> {
    if (!this.registry) return;

    // Note: In a real implementation, these would import actual factory classes
    // For now, we'll register placeholder factories

    // The actual factories would be loaded dynamically based on available implementations
    try {
      const factories = await Promise.allSettled([
        import('./adapters/system-event-factory').catch(() => null),
        import('./adapters/coordination-event-factory').catch(() => null),
        import('./adapters/communication-event-factory').catch(() => null),
        import('./adapters/monitoring-event-factory').catch(() => null),
        // xxx NEEDS_HUMAN: Missing factories below - returning null for now
        Promise.resolve(null), // interface-event-manager-factory
        Promise.resolve(null), // neural-event-manager-factory
        Promise.resolve(null), // database-event-manager-factory
        Promise.resolve(null), // memory-event-manager-factory
        Promise.resolve(null), // workflow-event-manager-factory
      ]);

      // Register factories that were successfully loaded
      factories.forEach((result, index) => {
        if (result?.status === 'fulfilled' && result?.value) {
          const eventTypes = Object.values(EventManagerTypes);
          const eventType = eventTypes[index];
          if (eventType && result?.value) {
          }
        }
      });
    } catch (error) {
      logger.warn('Some event manager factories could not be loaded:', error);
    }
  }
}

/**
 * Global UEL instance for convenience.
 */
export const uel = UEL.getInstance();

/**
 * Initialize UEL with default configuration.
 *
 * @param config
 */
export const initializeUEL = async (config?: Parameters<UEL['initialize']>[0]): Promise<void> => {
  await uel.initialize(config);
};

/**
 * Enhanced helpers for complete UEL system operations.
 */
export const UELHelpers = {
  /**
   * Initialize complete UEL system with all components.
   *
   * @param config
   * @param config.enableValidation
   * @param config.enableCompatibility
   * @param config.healthMonitoring
   * @param config.autoRegisterFactories
   * @param config.logger
   */
  async initializeCompleteSystem(
    config: {
      enableValidation?: boolean;
      enableCompatibility?: boolean;
      healthMonitoring?: boolean;
      autoRegisterFactories?: boolean;
      logger?: Console | { debug: Function; info: Function; warn: Function; error: Function };
    } = {}
  ): Promise<UEL> {
    await uel.initialize({
      enableValidation: config?.enableValidation !== false,
      enableCompatibility: config?.enableCompatibility !== false,
      healthMonitoring: config?.healthMonitoring !== false,
      autoRegisterFactories: config?.autoRegisterFactories !== false,
      logger: config?.logger,
    });

    return uel;
  },

  /**
   * Initialize and create common event managers for a typical setup.
   *
   * @param config
   * @param config.systemEvents
   * @param config.coordinationEvents
   * @param config.communicationEvents
   * @param config.monitoringEvents
   * @param config.interfaceEvents
   * @param config.customConfig
   * @param config.useIntegratedManager
   */
  async setupCommonEventManagers(
    config: {
      systemEvents?: boolean;
      coordinationEvents?: boolean;
      communicationEvents?: boolean;
      monitoringEvents?: boolean;
      interfaceEvents?: boolean;
      customConfig?: Record<string, Partial<EventManagerConfig>>;
      useIntegratedManager?: boolean;
    } = {}
  ): Promise<{
    system?: ISystemEventManager;
    coordination?: ICoordinationEventManager;
    communication?: ICommunicationEventManager;
    monitoring?: IMonitoringEventManager;
    interface?: IInterfaceEventManager;
  }> {
    await uel.initialize();

    const managers: {
      system?: ISystemEventManager;
      coordination?: ICoordinationEventManager;
      communication?: ICommunicationEventManager;
      monitoring?: IMonitoringEventManager;
      interface?: IInterfaceEventManager;
    } = {};

    try {
      // Use integrated event manager if available and requested
      const eventManager = config?.useIntegratedManager ? uel.getEventManager() : null;

      if (config?.systemEvents !== false) {
        managers.system = eventManager
          ? await eventManager.createSystemEventManager(
              'common-system',
              config?.customConfig?.system
            )
          : await uel.createSystemEventManager('common-system', config?.customConfig?.system);
      }

      if (config?.coordinationEvents !== false) {
        managers.coordination = eventManager
          ? await eventManager.createCoordinationEventManager(
              'common-coordination',
              config?.customConfig?.coordination
            )
          : await uel.createCoordinationEventManager(
              'common-coordination',
              config?.customConfig?.coordination
            );
      }

      if (config?.communicationEvents !== false) {
        managers.communication = eventManager
          ? await eventManager.createCommunicationEventManager(
              'common-communication',
              config?.customConfig?.communication
            )
          : await uel.createCommunicationEventManager(
              'common-communication',
              config?.customConfig?.communication
            );
      }

      if (config?.monitoringEvents !== false) {
        managers.monitoring = eventManager
          ? await eventManager.createMonitoringEventManager(
              'common-monitoring',
              config?.customConfig?.monitoring
            )
          : await uel.createMonitoringEventManager(
              'common-monitoring',
              config?.customConfig?.monitoring
            );
      }

      if (config?.interfaceEvents !== false) {
        managers.interface = eventManager
          ? await eventManager.createInterfaceEventManager(
              'common-interface',
              config?.customConfig?.interface
            )
          : await uel.createInterfaceEventManager(
              'common-interface',
              config?.customConfig?.interface
            );
      }

      return managers;
    } catch (error) {
      logger.error('❌ Failed to setup common event managers:', error);
      throw error;
    }
  },

  /**
   * Migrate existing observer system to UEL.
   *
   * @param observerSystem
   * @param observerSystem.observers
   * @param observerSystem.notify
   */
  async migrateObserverSystem(observerSystem: { observers: unknown[]; notify: Function }): Promise<{
    success: boolean;
    migratedManagers: string[];
    errors: string[];
    recommendations: string[];
  }> {
    const results = {
      success: true,
      migratedManagers: [] as string[],
      errors: [] as string[],
      recommendations: [] as string[],
    };

    try {
      // Initialize UEL with compatibility enabled
      await uel.initialize({ enableCompatibility: true });

      // Migrate EventEmitter if it exists
      if (observerSystem && typeof observerSystem.emit === 'function') {
        const compatible = await uel.migrateEventEmitter(
          observerSystem,
          'migrated-observer',
          EventManagerTypes.SYSTEM
        );
        if (compatible) {
          results?.migratedManagers.push('migrated-observer');
        } else {
          results?.errors.push('Failed to migrate main observer system');
        }
      }

      // Analyze and provide recommendations
      if (observerSystem) {
        const analysis = uel
          .getCompatibilityFactory()
          ?.getMigrationHelper()
          ?.analyzeEventEmitter(observerSystem);
        if (analysis) {
          results?.recommendations.push(...analysis.recommendations);
        }
      }

      results.success = results?.errors.length === 0;
      return results;
    } catch (error) {
      results.success = false;
      results?.errors.push(
        `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return results;
    }
  },

  /**
   * Get a quick status overview.
   */
  async getQuickStatus(): Promise<{
    initialized: boolean;
    totalManagers: number;
    healthyManagers: number;
    healthPercentage: number;
    status: 'healthy' | 'warning' | 'critical';
  }> {
    if (!uel.isInitialized()) {
      return {
        initialized: false,
        totalManagers: 0,
        healthyManagers: 0,
        healthPercentage: 0,
        status: 'critical',
      };
    }

    const healthStatus = await uel.getHealthStatus();
    const healthyManagers = healthStatus.filter((status) => status.status === 'healthy').length;
    const totalManagers = healthStatus.length;
    const healthPercentage = totalManagers > 0 ? (healthyManagers / totalManagers) * 100 : 100;

    const status =
      healthPercentage >= 80 ? 'healthy' : healthPercentage >= 50 ? 'warning' : 'critical';

    return {
      initialized: true,
      totalManagers,
      healthyManagers,
      healthPercentage,
      status,
    };
  },

  /**
   * Perform comprehensive health check on all event managers.
   */
  async performHealthCheck(): Promise<
    Record<string, { healthy: boolean; details?: Record<string, unknown> }>
  > {
    const healthStatus = await uel.getHealthStatus();

    return healthStatus.reduce(
      (acc, status) => {
        acc[status.name] = {
          healthy: status.status === 'healthy',
          details: {
            status: status.status,
            subscriptions: status.subscriptions,
            queueSize: status.queueSize,
            errorRate: status.errorRate,
            uptime: status.uptime,
            lastCheck: status.lastCheck,
            metadata: status.metadata,
          },
        };
        return acc;
      },
      {} as Record<string, { healthy: boolean; details?: Record<string, unknown> }>
    );
  },

  /**
   * Migrate entire system to UEL with enhanced capabilities.
   *
   * @param systems
   * @param systems.eventBus
   * @param systems.applicationCoordinator
   * @param systems.observerSystem
   */
  async migrateSystemToUEL(systems: {
    eventBus?: any;
    applicationCoordinator?: any;
    observerSystem?: any;
    [key: string]: any;
  }): Promise<{
    eventBus?: UELEnhancedEventBus;
    applicationCoordinator?: UELEnhancedApplicationCoordinator;
    observerSystem?: UELEnhancedObserverSystem;
    migrationReport: {
      success: boolean;
      migratedSystems: string[];
      errors: string[];
      recommendations: string[];
    };
  }> {
    await uel.initialize({
      enableValidation: true,
      enableCompatibility: true,
      healthMonitoring: true,
    });

    const migrationReport = {
      success: true,
      migratedSystems: [] as string[],
      errors: [] as string[],
      recommendations: [] as string[],
    };

    const result: any = {};

    try {
      // Migrate Event Bus
      if (systems.eventBus) {
        try {
          result.eventBus = await uel.createEnhancedEventBus({
            enableUEL: true,
            managerName: 'migrated-event-bus',
          });
          migrationReport.migratedSystems.push('eventBus');
        } catch (error) {
          migrationReport.errors.push(
            `Event Bus migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Migrate Application Coordinator
      if (systems.applicationCoordinator) {
        try {
          result.applicationCoordinator = await uel.createEnhancedApplicationCoordinator({
            enableUEL: true,
            uelConfig: {
              enableValidation: true,
              enableCompatibility: true,
              healthMonitoring: true,
            },
          });
          migrationReport.migratedSystems.push('applicationCoordinator');
        } catch (error) {
          migrationReport.errors.push(
            `Application Coordinator migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Migrate Observer System
      if (systems.observerSystem) {
        try {
          result.observerSystem = await uel.createEnhancedObserverSystem({
            enableUEL: true,
          });
          migrationReport.migratedSystems.push('observerSystem');
        } catch (error) {
          migrationReport.errors.push(
            `Observer System migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Analyze remaining systems
      const otherSystems: { [key: string]: any } = {};
      Object.entries(systems).forEach(([name, system]) => {
        if (!['eventBus', 'applicationCoordinator', 'observerSystem'].includes(name)) {
          otherSystems[name] = system;
        }
      });

      if (Object.keys(otherSystems).length > 0) {
        const analysis = await uel.analyzeSystemEventEmitters(otherSystems);
        migrationReport.recommendations.push(...analysis.migrationRecommendations);
      }

      migrationReport.success = migrationReport.errors.length === 0;

      return {
        ...result,
        migrationReport,
      };
    } catch (error) {
      migrationReport.success = false;
      migrationReport.errors.push(
        `System migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return { migrationReport };
    }
  },

  /**
   * Create comprehensive UEL system setup.
   *
   * @param options
   * @param options.systemComponents
   * @param options.systemComponents.eventBus
   * @param options.systemComponents.applicationCoordinator
   * @param options.systemComponents.observerSystem
   * @param options.eventManagers
   * @param options.eventManagers.system
   * @param options.eventManagers.coordination
   * @param options.eventManagers.communication
   * @param options.eventManagers.monitoring
   * @param options.eventManagers.interface
   * @param options.validation
   * @param options.compatibility
   * @param options.healthMonitoring
   */
  async setupCompleteUELSystem(options?: {
    systemComponents?: {
      eventBus?: boolean;
      applicationCoordinator?: boolean;
      observerSystem?: boolean;
    };
    eventManagers?: {
      system?: boolean;
      coordination?: boolean;
      communication?: boolean;
      monitoring?: boolean;
      interface?: boolean;
    };
    validation?: boolean;
    compatibility?: boolean;
    healthMonitoring?: boolean;
  }): Promise<{
    uel: UEL;
    systems: {
      eventBus?: UELEnhancedEventBus;
      applicationCoordinator?: UELEnhancedApplicationCoordinator;
      observerSystem?: UELEnhancedObserverSystem;
    };
    eventManagers: {
      system?: any;
      coordination?: any;
      communication?: any;
      monitoring?: any;
      interface?: any;
    };
    status: {
      initialized: boolean;
      componentsCreated: number;
      errors: string[];
    };
  }> {
    const status = {
      initialized: false,
      componentsCreated: 0,
      errors: [] as string[],
    };

    try {
      // Initialize UEL
      await uel.initialize({
        enableValidation: options?.validation !== false,
        enableCompatibility: options?.compatibility !== false,
        healthMonitoring: options?.healthMonitoring !== false,
        autoRegisterFactories: true,
      });

      status.initialized = true;

      // Create system components
      const systems: any = {};
      const eventManagers: any = {};

      // Create enhanced systems
      if (options?.systemComponents?.eventBus !== false) {
        try {
          systems.eventBus = await uel.createEnhancedEventBus();
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `Event Bus creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      if (options?.systemComponents?.applicationCoordinator !== false) {
        try {
          systems.applicationCoordinator = await uel.createEnhancedApplicationCoordinator();
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `Application Coordinator creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      if (options?.systemComponents?.observerSystem !== false) {
        try {
          systems.observerSystem = await uel.createEnhancedObserverSystem();
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `Observer System creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Create event managers
      const managerOptions = options?.eventManagers || {};

      if (managerOptions?.system !== false) {
        try {
          eventManagers.system = await uel.createSystemEventManager('complete-system');
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `System Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      if (managerOptions?.coordination !== false) {
        try {
          eventManagers.coordination =
            await uel.createCoordinationEventManager('complete-coordination');
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `Coordination Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      if (managerOptions?.communication !== false) {
        try {
          eventManagers.communication =
            await uel.createCommunicationEventManager('complete-communication');
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `Communication Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      if (managerOptions?.monitoring !== false) {
        try {
          eventManagers.monitoring = await uel.createMonitoringEventManager('complete-monitoring');
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `Monitoring Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      if (managerOptions?.interface !== false) {
        try {
          eventManagers.interface = await uel.createInterfaceEventManager('complete-interface');
          status.componentsCreated++;
        } catch (error) {
          status.errors.push(
            `Interface Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return {
        uel,
        systems,
        eventManagers,
        status,
      };
    } catch (error) {
      status.errors.push(
        `Complete UEL setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return {
        uel,
        systems: {},
        eventManagers: {},
        status,
      };
    }
  },

  /**
   * Perform comprehensive system validation.
   *
   * @param options
   * @param options.includeHealthCheck
   * @param options.includeIntegrationCheck
   * @param options.includeSampleEvents
   * @param options.exportReport
   */
  async performCompleteValidation(options?: {
    includeHealthCheck?: boolean;
    includeIntegrationCheck?: boolean;
    includeSampleEvents?: boolean;
    exportReport?: boolean;
  }): Promise<{
    validationResult: any;
    reportPath?: string;
    summary: {
      passed: boolean;
      score: number;
      criticalIssues: number;
      recommendations: number;
    };
  }> {
    try {
      if (!uel.isInitialized()) {
        await uel.initialize({
          enableValidation: true,
          enableCompatibility: true,
        });
      }

      const validationFramework = uel.getValidationFramework();
      const eventManager = uel.getEventManager();
      const eventRegistry = uel.getEventRegistry();

      // Sample events for testing
      const sampleEvents = options?.includeSampleEvents
        ? [
            {
              id: 'test-1',
              timestamp: new Date(),
              source: 'validation-test',
              type: 'system:lifecycle',
              operation: 'test',
              status: 'success',
            } as any,
            {
              id: 'test-2',
              timestamp: new Date(),
              source: 'validation-test',
              type: 'coordination:swarm',
              operation: 'test',
              targetId: 'test-target',
            } as any,
          ]
        : undefined;

      const validationResult = await validationFramework.validateComplete(
        eventManager,
        eventRegistry,
        sampleEvents
      );

      const summary = {
        passed: validationResult?.overall?.valid,
        score: validationResult?.summary?.totalScore,
        criticalIssues: validationResult?.summary?.criticalIssues,
        recommendations: validationResult?.summary?.recommendations,
      };

      let reportPath: string | undefined;
      if (options?.exportReport) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        reportPath = `uel-validation-complete-${timestamp}.json`;
        // In a real implementation, would write to file system
      }

      return {
        validationResult,
        reportPath,
        summary,
      };
    } catch (_error) {
      return {
        validationResult: null,
        summary: {
          passed: false,
          score: 0,
          criticalIssues: 1,
          recommendations: 0,
        },
      };
    }
  },

  /**
   * Create event builder for common event types.
   */
  createEventBuilder(): {
    system: (operation: string, status: string, details?: any) => SystemLifecycleEvent;
    coordination: (operation: string, targetId: string, details?: any) => CoordinationEvent;
    communication: (operation: string, protocol: string, details?: any) => CommunicationEvent;
    monitoring: (operation: string, component: string, details?: any) => MonitoringEvent;
    interface: (operation: string, interfaceType: string, details?: any) => InterfaceEvent;
  } {
    return {
      system: (operation: string, status: string, details?: any): SystemLifecycleEvent => ({
        id: `system-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-system',
        type: `system:${operation}` as any,
        operation: operation as any,
        status: status as any,
        details,
      }),

      coordination: (operation: string, targetId: string, details?: any): CoordinationEvent => ({
        id: `coord-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-coordination',
        type: `coordination:${operation}` as any,
        operation: operation as any,
        targetId,
        details,
      }),

      communication: (operation: string, protocol: string, details?: any): CommunicationEvent => ({
        id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-communication',
        type: `communication:${operation}` as any,
        operation: operation as any,
        protocol: protocol as any,
        details,
      }),

      monitoring: (operation: string, component: string, details?: any): MonitoringEvent => ({
        id: `mon-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-monitoring',
        type: `monitoring:${operation}` as any,
        operation: operation as any,
        component,
        details,
      }),

      interface: (operation: string, interfaceType: string, details?: any): InterfaceEvent => ({
        id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-interface',
        type: `interface:${operation}` as any,
        operation: operation as any,
        interface: interfaceType as any,
        details,
      }),
    };
  },
};

/**
 * Default export for convenience.
 */
export default uel;
