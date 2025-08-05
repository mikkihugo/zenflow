/**
 * UEL (Unified Event Layer) - Main Exports
 * 
 * Central export point for all UEL functionality including:
 * - Event manager registry and factory
 * - Event type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization
 * 
 * @fileoverview Main UEL exports
 */

// Core UEL components
export { 
  UELFactory,
  UELRegistry,
  type EventManagerFactoryConfig,
  type EventManagerTypeMap,
  type EventManagerRegistry,
  type EventManagerTransaction,
  type ISystemEventManager,
  type ICoordinationEventManager,
  type ICommunicationEventManager,
  type IMonitoringEventManager,
  type IInterfaceEventManager,
  type INeuralEventManager,
  type IDatabaseEventManager,
  type IMemoryEventManager,
  type IWorkflowEventManager
} from './factories';

// Core interfaces for UEL
export type { 
  IEventManager,
  IEventManagerFactory,
  IEventManagerRegistry,
  EventManagerConfig,
  EventManagerStatus,
  EventManagerMetrics,
  EventManagerType,
  SystemEvent,
  EventSubscription,
  EventFilter,
  EventTransform,
  EventRetryConfig,
  EventHealthConfig,
  EventMonitoringConfig,
  EventListener,
  EventBatch,
  EventEmissionOptions,
  EventQueryOptions,
  EventPriority,
  EventProcessingStrategy
} from './core/interfaces';

export {
  EventManagerTypes,
  EventTypeGuards,
  EventManagerPresets,
  EventError,
  EventSubscriptionError,
  EventEmissionError,
  EventFilterError,
  EventTimeoutError,
  EventRetryExhaustedError
} from './core/interfaces';

// Event type definitions
export type {
  UELEvent,
  SystemLifecycleEvent,
  CoordinationEvent,
  CommunicationEvent,
  MonitoringEvent,
  InterfaceEvent,
  NeuralEvent,
  DatabaseEvent,
  MemoryEvent,
  WorkflowEvent
} from './types';

export {
  EventCategories,
  EventTypePatterns,
  DefaultEventManagerConfigs,
  EventPriorityMap,
  EventSources,
  UELTypeGuards,
  EventConstants
} from './types';

// Legacy compatibility - re-export from observer system
export {
  SystemEventManager,
  WebSocketObserver,
  DatabaseObserver,
  LoggerObserver,
  MetricsObserver,
  EventBuilder,
  type SwarmEvent,
  type MCPEvent,
  type NeuralEvent as LegacyNeuralEvent,
  type DatabaseEvent as LegacyDatabaseEvent,
  type MemoryEvent as LegacyMemoryEvent,
  type InterfaceEvent as LegacyInterfaceEvent,
  type AllSystemEvents,
  type SystemObserver,
  type ObserverType,
  type SwarmStatus,
  type SwarmMetrics,
  type ToolResult,
  type SwarmTopology
} from './observer-system';

// Factory convenience functions
export {
  createEventManager,
  createSystemEventBus,
  createCoordinationEventBus,
  createCommunicationEventBus,
  createMonitoringEventBus
} from './factories';

/**
 * UEL Main Interface
 * 
 * Primary interface for interacting with the Unified Event Layer.
 * Provides high-level methods for event manager creation and operations.
 */
export class UEL {
  private static instance: UEL;
  private initialized = false;
  private factory: UELFactory | null = null;
  private registry: UELRegistry | null = null;

  private constructor() {}

  /**
   * Get singleton UEL instance
   */
  static getInstance(): UEL {
    if (!UEL.instance) {
      UEL.instance = new UEL();
    }
    return UEL.instance;
  }

  /**
   * Initialize UEL system
   */
  async initialize(config?: {
    logger?: any;
    config?: any;
    autoRegisterFactories?: boolean;
  }): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize factory and registry
    const { UELFactory, UELRegistry } = await import('./factories');
    const { DIContainer } = await import('../../di/container/di-container');
    const { CORE_TOKENS } = await import('../../di/tokens/core-tokens');
    
    const container = new DIContainer();
    
    // Register dependencies
    container.register(CORE_TOKENS.Logger, () => config?.logger || {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error
    });
    
    container.register(CORE_TOKENS.Config, () => config?.config || {});
    
    this.factory = container.resolve(UELFactory);
    this.registry = container.resolve(UELRegistry);
    
    // Auto-register factories if requested
    if (config?.autoRegisterFactories !== false) {
      await this.registerDefaultFactories();
    }
    
    this.initialized = true;
  }

  /**
   * Check if UEL is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the UEL factory instance
   */
  getFactory(): UELFactory {
    if (!this.factory) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.factory;
  }

  /**
   * Get the UEL registry instance
   */
  getRegistry(): UELRegistry {
    if (!this.registry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    return this.registry;
  }

  /**
   * Create and register system event manager
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
   * Create and register coordination event manager
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
   * Create and register communication event manager
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
   * Create and register monitoring event manager
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
   * Create and register interface event manager
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
   * Create and register neural event manager
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
   * Create and register database event manager
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
   * Create and register memory event manager
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
   * Create and register workflow event manager
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
   * Get event manager by name
   */
  getEventManager(name: string): IEventManager | null {
    if (!this.factory) return null;
    return this.factory.getEventManager(name);
  }

  /**
   * Get all event managers by type
   */
  getEventManagersByType(type: EventManagerType): IEventManager[] {
    if (!this.registry) return [];
    return this.registry.getEventManagersByType(type);
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<EventManagerStatus[]> {
    if (!this.factory) return [];
    return this.factory.healthCheckAll();
  }

  /**
   * Get global metrics
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
        errorRate: 0
      };
    }
    return this.registry.getGlobalMetrics();
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<{
    initialized: boolean;
    factoryStats: ReturnType<UELFactory['getStats']>;
    globalMetrics: Awaited<ReturnType<UELRegistry['getGlobalMetrics']>>;
    healthStatus: EventManagerStatus[];
  }> {
    const factoryStats = this.factory?.getStats() || {
      totalManagers: 0,
      managersByType: {} as any,
      managersByStatus: {},
      cacheSize: 0,
      transactions: 0
    };
    
    const globalMetrics = await this.getGlobalMetrics();
    const healthStatus = await this.getHealthStatus();
    
    return {
      initialized: this.initialized,
      factoryStats,
      globalMetrics,
      healthStatus
    };
  }

  /**
   * Broadcast event to all event managers
   */
  async broadcast<T extends SystemEvent>(event: T): Promise<void> {
    if (!this.registry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    await this.registry.broadcast(event);
  }

  /**
   * Broadcast event to specific event manager type
   */
  async broadcastToType<T extends SystemEvent>(type: EventManagerType, event: T): Promise<void> {
    if (!this.registry) {
      throw new Error('UEL not initialized. Call initialize() first.');
    }
    await this.registry.broadcastToType(type, event);
  }

  /**
   * Shutdown UEL system
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    if (this.factory) {
      await this.factory.shutdownAll();
    }
    
    if (this.registry) {
      await this.registry.shutdownAll();
    }
    
    this.factory = null;
    this.registry = null;
    this.initialized = false;
  }

  /**
   * Register default factories for all event manager types
   */
  private async registerDefaultFactories(): Promise<void> {
    if (!this.registry) return;
    
    // Note: In a real implementation, these would import actual factory classes
    // For now, we'll register placeholder factories
    
    // The actual factories would be loaded dynamically based on available implementations
    try {
      const factories = await Promise.allSettled([
        import('./implementations/system-event-manager-factory').catch(() => null),
        import('./implementations/coordination-event-manager-factory').catch(() => null),
        import('./implementations/communication-event-manager-factory').catch(() => null),
        import('./implementations/monitoring-event-manager-factory').catch(() => null),
        import('./implementations/interface-event-manager-factory').catch(() => null),
        import('./implementations/neural-event-manager-factory').catch(() => null),
        import('./implementations/database-event-manager-factory').catch(() => null),
        import('./implementations/memory-event-manager-factory').catch(() => null),
        import('./implementations/workflow-event-manager-factory').catch(() => null)
      ]);
      
      // Register factories that were successfully loaded
      factories.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const eventTypes = Object.values(EventManagerTypes);
          const eventType = eventTypes[index];
          if (eventType && result.value) {
            // Factory registration would happen here
            console.debug(`Would register factory for ${eventType}`);
          }
        }
      });
    } catch (error) {
      console.warn('Some event manager factories could not be loaded:', error);
    }
  }
}

/**
 * Global UEL instance for convenience
 */
export const uel = UEL.getInstance();

/**
 * Initialize UEL with default configuration
 */
export const initializeUEL = async (config?: Parameters<UEL['initialize']>[0]): Promise<void> => {
  await uel.initialize(config);
};

/**
 * Quick access functions for common operations
 */
export const UELHelpers = {
  /**
   * Initialize and create common event managers for a typical setup
   */
  async setupCommonEventManagers(config: {
    systemEvents?: boolean;
    coordinationEvents?: boolean;
    communicationEvents?: boolean;
    monitoringEvents?: boolean;
    interfaceEvents?: boolean;
    customConfig?: Record<string, Partial<EventManagerConfig>>;
  } = {}): Promise<{
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
      if (config.systemEvents !== false) {
        managers.system = await uel.createSystemEventManager(
          'common-system',
          config.customConfig?.system
        );
      }

      if (config.coordinationEvents !== false) {
        managers.coordination = await uel.createCoordinationEventManager(
          'common-coordination',
          config.customConfig?.coordination
        );
      }

      if (config.communicationEvents !== false) {
        managers.communication = await uel.createCommunicationEventManager(
          'common-communication',
          config.customConfig?.communication
        );
      }

      if (config.monitoringEvents !== false) {
        managers.monitoring = await uel.createMonitoringEventManager(
          'common-monitoring',
          config.customConfig?.monitoring
        );
      }

      if (config.interfaceEvents !== false) {
        managers.interface = await uel.createInterfaceEventManager(
          'common-interface',
          config.customConfig?.interface
        );
      }

      return managers;
    } catch (error) {
      console.error('❌ Failed to setup common event managers:', error);
      throw error;
    }
  },

  /**
   * Get a quick status overview
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
        status: 'critical'
      };
    }

    const healthStatus = await uel.getHealthStatus();
    const healthyManagers = healthStatus.filter(status => status.status === 'healthy').length;
    const totalManagers = healthStatus.length;
    const healthPercentage = totalManagers > 0 ? (healthyManagers / totalManagers) * 100 : 100;
    
    const status = healthPercentage >= 80 ? 'healthy' 
      : healthPercentage >= 50 ? 'warning' 
      : 'critical';

    return {
      initialized: true,
      totalManagers,
      healthyManagers,
      healthPercentage,
      status
    };
  },

  /**
   * Perform comprehensive health check on all event managers
   */
  async performHealthCheck(): Promise<Record<string, { healthy: boolean; details?: any }>> {
    const healthStatus = await uel.getHealthStatus();
    
    return healthStatus.reduce((acc, status) => {
      acc[status.name] = {
        healthy: status.status === 'healthy',
        details: {
          status: status.status,
          subscriptions: status.subscriptions,
          queueSize: status.queueSize,
          errorRate: status.errorRate,
          uptime: status.uptime,
          lastCheck: status.lastCheck,
          metadata: status.metadata
        }
      };
      return acc;
    }, {} as Record<string, { healthy: boolean; details?: any }>);
  },

  /**
   * Create event builder for common event types
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
        id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        source: 'uel-system',
        type: `system:${operation}` as any,
        operation: operation as any,
        status: status as any,
        details
      }),
      
      coordination: (operation: string, targetId: string, details?: any): CoordinationEvent => ({
        id: `coord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        source: 'uel-coordination',
        type: `coordination:${operation}` as any,
        operation: operation as any,
        targetId,
        details
      }),
      
      communication: (operation: string, protocol: string, details?: any): CommunicationEvent => ({
        id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        source: 'uel-communication',
        type: `communication:${operation}` as any,
        operation: operation as any,
        protocol: protocol as any,
        details
      }),
      
      monitoring: (operation: string, component: string, details?: any): MonitoringEvent => ({
        id: `mon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        source: 'uel-monitoring',
        type: `monitoring:${operation}` as any,
        operation: operation as any,
        component,
        details
      }),
      
      interface: (operation: string, interfaceType: string, details?: any): InterfaceEvent => ({
        id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        source: 'uel-interface',
        type: `interface:${operation}` as any,
        operation: operation as any,
        interface: interfaceType as any,
        details
      })
    };
  }
};

/**
 * Default export for convenience
 */
export default uel;