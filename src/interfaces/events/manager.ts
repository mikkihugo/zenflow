/**
 * UEL (Unified Event Layer) - Event Manager System
 * 
 * Comprehensive event manager for lifecycle management, factory registration,
 * and coordinated event processing across all UEL components.
 * 
 * @fileoverview Event Manager Implementation following UACL/USL patterns
 */

import type {
  IEventManager,
  IEventManagerFactory,
  IEventManagerRegistry,
  EventManagerConfig,
  EventManagerStatus,
  EventManagerMetrics,
  EventManagerType,
  SystemEvent,
  EventSubscription
} from './core/interfaces';

import type {
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

import {
  EventManagerTypes,
  EventTypeGuards,
  EventManagerPresets
} from './core/interfaces';

import {
  EventCategories,
  DefaultEventManagerConfigs,
  EventPriorityMap,
  EventConstants,
  UELTypeGuards
} from './types';

import type {
  ISystemEventManager,
  ICoordinationEventManager,
  ICommunicationEventManager,
  IMonitoringEventManager,
  IInterfaceEventManager,
  INeuralEventManager,
  IDatabaseEventManager,
  IMemoryEventManager,
  IWorkflowEventManager
} from './factories';

import { EventRegistry } from './registry';
import type { ILogger, IConfig } from '../../core/interfaces/base-interfaces';
import { injectable, inject } from '../../di/decorators/injectable';
import { CORE_TOKENS } from '../../di/tokens/core-tokens';

/**
 * Event manager creation options
 */
export interface EventManagerCreationOptions {
  /** Manager type to create */
  type: EventManagerType;
  
  /** Manager name/identifier */
  name: string;
  
  /** Configuration options */
  config?: Partial<EventManagerConfig>;
  
  /** Preset to apply */
  preset?: keyof typeof EventManagerPresets;
  
  /** Auto-start the manager */
  autoStart?: boolean;
  
  /** Health monitoring settings */
  healthMonitoring?: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  
  /** Recovery settings */
  recovery?: {
    autoRestart: boolean;
    maxRestarts: number;
    backoffMultiplier: number;
  };
}

/**
 * Connection management for event manager integration
 */
export interface ConnectionManager {
  /** Active connections by type */
  connections: Map<EventManagerType, Set<IEventManager>>;
  
  /** Connection health status */
  health: Map<string, { healthy: boolean; lastCheck: Date; failures: number }>;
  
  /** Auto-reconnect settings */
  autoReconnect: boolean;
  
  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;
  
  /** Connection timeout */
  connectionTimeout: number;
}

/**
 * Event manager coordination settings
 */
export interface CoordinationSettings {
  /** Enable cross-manager event routing */
  crossManagerRouting: boolean;
  
  /** Event deduplication */
  eventDeduplication: boolean;
  
  /** Batch event processing */
  batchProcessing: {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
  };
  
  /** Priority queue settings */
  priorityQueue: {
    enabled: boolean;
    maxSize: number;
    processingDelay: number;
  };
}

/**
 * Manager statistics and metrics
 */
export interface ManagerStatistics {
  /** Total managers created */
  totalCreated: number;
  
  /** Active managers */
  activeManagers: number;
  
  /** Failed managers */
  failedManagers: number;
  
  /** Recovery attempts */
  recoveryAttempts: number;
  
  /** Successful recoveries */
  successfulRecoveries: number;
  
  /** Average startup time */
  averageStartupTime: number;
  
  /** Total events processed */
  totalEventsProcessed: number;
  
  /** Events per second */
  eventsPerSecond: number;
  
  /** Average latency */
  averageLatency: number;
}

/**
 * Main event manager class for comprehensive UEL management
 */
@injectable
export class EventManager {
  private registry: EventRegistry;
  private activeManagers = new Map<string, IEventManager>();
  private factoryCache = new Map<EventManagerType, IEventManagerFactory>();
  private connectionManager: ConnectionManager;
  private coordinationSettings: CoordinationSettings;
  private statistics: ManagerStatistics;
  private initialized = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private recoveryAttempts = new Map<string, number>();

  constructor(
    @inject(CORE_TOKENS.Logger) private logger: ILogger,
    @inject(CORE_TOKENS.Config) private config: IConfig
  ) {
    this.registry = new EventRegistry(this.logger);
    
    this.connectionManager = {
      connections: new Map(),
      health: new Map(),
      autoReconnect: true,
      maxReconnectAttempts: 5,
      connectionTimeout: 30000
    };
    
    this.coordinationSettings = {
      crossManagerRouting: true,
      eventDeduplication: true,
      batchProcessing: {
        enabled: true,
        batchSize: 100,
        flushInterval: 5000
      },
      priorityQueue: {
        enabled: true,
        maxSize: 10000,
        processingDelay: 10
      }
    };
    
    this.statistics = {
      totalCreated: 0,
      activeManagers: 0,
      failedManagers: 0,
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      averageStartupTime: 0,
      totalEventsProcessed: 0,
      eventsPerSecond: 0,
      averageLatency: 0
    };

    // Initialize connection maps for all manager types
    Object.values(EventManagerTypes).forEach(type => {
      this.connectionManager.connections.set(type, new Set());
    });
  }

  /**
   * Initialize the event manager system
   */
  async initialize(options?: {
    autoRegisterFactories?: boolean;
    healthMonitoring?: boolean;
    coordination?: Partial<CoordinationSettings>;
    connection?: Partial<ConnectionManager>;
  }): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize registry
    await this.registry.initialize({
      autoRegisterDefaults: options?.autoRegisterFactories !== false
    });

    // Apply configuration overrides
    if (options?.coordination) {
      this.coordinationSettings = { ...this.coordinationSettings, ...options.coordination };
    }
    
    if (options?.connection) {
      this.connectionManager = { ...this.connectionManager, ...options.connection };
    }

    // Register default factories
    if (options?.autoRegisterFactories !== false) {
      await this.registerDefaultFactories();
    }

    // Start health monitoring if enabled
    if (options?.healthMonitoring !== false) {
      this.startHealthMonitoring();
    }

    this.initialized = true;
    this.logger.info('🚀 Event Manager system initialized successfully');
  }

  /**
   * Create and register a new event manager
   */
  async createEventManager<T extends EventManagerType>(
    options: EventManagerCreationOptions & { type: T }
  ): Promise<IEventManager> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`🏗️ Creating event manager: ${options.name} (${options.type})`);
      
      // Get or create factory
      const factory = await this.getOrCreateFactory(options.type);
      
      // Merge configuration with defaults and presets
      const config = this.mergeConfiguration(options);
      
      // Create manager instance
      const manager = await factory.create(config);
      
      // Register with registry
      this.registry.registerManager(options.name, manager, factory, config);
      
      // Add to active managers
      this.activeManagers.set(options.name, manager);
      
      // Update connection tracking
      this.connectionManager.connections.get(options.type)?.add(manager);
      this.connectionManager.health.set(options.name, {
        healthy: true,
        lastCheck: new Date(),
        failures: 0
      });
      
      // Auto-start if requested
      if (options.autoStart !== false) {
        await manager.start();
      }
      
      // Update statistics
      this.statistics.totalCreated++;
      this.statistics.activeManagers++;
      const duration = Date.now() - startTime;
      this.statistics.averageStartupTime = 
        (this.statistics.averageStartupTime * (this.statistics.totalCreated - 1) + duration) / this.statistics.totalCreated;
      
      this.logger.info(`✅ Event manager created successfully: ${options.name} (${duration}ms)`);
      return manager;
      
    } catch (error) {
      this.statistics.failedManagers++;
      this.logger.error(`❌ Failed to create event manager ${options.name}:`, error);
      throw new Error(`Event manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create system event manager with UEL integration
   */
  async createSystemEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<ISystemEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.SYSTEM,
      name,
      config,
      preset: 'REAL_TIME'
    });
    
    return manager as ISystemEventManager;
  }

  /**
   * Create coordination event manager for swarm operations
   */
  async createCoordinationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<ICoordinationEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.COORDINATION,
      name,
      config,
      preset: 'HIGH_THROUGHPUT'
    });
    
    return manager as ICoordinationEventManager;
  }

  /**
   * Create communication event manager for protocols
   */
  async createCommunicationEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<ICommunicationEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.COMMUNICATION,
      name,
      config,
      preset: 'REAL_TIME'
    });
    
    return manager as ICommunicationEventManager;
  }

  /**
   * Create monitoring event manager for metrics and health
   */
  async createMonitoringEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IMonitoringEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.MONITORING,
      name,
      config,
      preset: 'BATCH_PROCESSING'
    });
    
    return manager as IMonitoringEventManager;
  }

  /**
   * Create interface event manager for UI interactions
   */
  async createInterfaceEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IInterfaceEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.INTERFACE,
      name,
      config,
      preset: 'REAL_TIME'
    });
    
    return manager as IInterfaceEventManager;
  }

  /**
   * Create neural event manager for AI operations
   */
  async createNeuralEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<INeuralEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.NEURAL,
      name,
      config,
      preset: 'RELIABLE'
    });
    
    return manager as INeuralEventManager;
  }

  /**
   * Create database event manager for DB operations
   */
  async createDatabaseEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IDatabaseEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.DATABASE,
      name,
      config,
      preset: 'BATCH_PROCESSING'
    });
    
    return manager as IDatabaseEventManager;
  }

  /**
   * Create memory event manager for cache operations
   */
  async createMemoryEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IMemoryEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.MEMORY,
      name,
      config
    });
    
    return manager as IMemoryEventManager;
  }

  /**
   * Create workflow event manager for orchestration
   */
  async createWorkflowEventManager(
    name: string,
    config?: Partial<EventManagerConfig>
  ): Promise<IWorkflowEventManager> {
    const manager = await this.createEventManager({
      type: EventManagerTypes.WORKFLOW,
      name,
      config,
      preset: 'RELIABLE'
    });
    
    return manager as IWorkflowEventManager;
  }

  /**
   * Get event manager by name
   */
  getEventManager(name: string): IEventManager | undefined {
    return this.activeManagers.get(name) || this.registry.findEventManager(name);
  }

  /**
   * Get all event managers by type
   */
  getEventManagersByType(type: EventManagerType): IEventManager[] {
    return this.registry.getEventManagersByType(type);
  }

  /**
   * Get all active event managers
   */
  getAllEventManagers(): Map<string, IEventManager> {
    return new Map(this.activeManagers);
  }

  /**
   * Remove and destroy event manager
   */
  async removeEventManager(name: string): Promise<void> {
    const manager = this.activeManagers.get(name);
    
    if (manager) {
      try {
        await manager.stop();
        await manager.destroy();
        
        // Remove from tracking
        this.activeManagers.delete(name);
        this.connectionManager.health.delete(name);
        
        // Remove from connection tracking
        this.connectionManager.connections.forEach(managers => {
          managers.delete(manager);
        });
        
        this.statistics.activeManagers--;
        this.logger.info(`🗑️ Event manager removed: ${name}`);
        
      } catch (error) {
        this.logger.error(`❌ Failed to remove event manager ${name}:`, error);
        throw error;
      }
    }
  }

  /**
   * Restart event manager with recovery logic
   */
  async restartEventManager(name: string): Promise<void> {
    const manager = this.activeManagers.get(name);
    
    if (!manager) {
      throw new Error(`Event manager not found: ${name}`);
    }

    const attempts = this.recoveryAttempts.get(name) || 0;
    this.recoveryAttempts.set(name, attempts + 1);
    this.statistics.recoveryAttempts++;

    try {
      this.logger.info(`🔄 Restarting event manager: ${name} (attempt ${attempts + 1})`);
      
      await manager.stop();
      await manager.start();
      
      // Update health status
      this.connectionManager.health.set(name, {
        healthy: true,
        lastCheck: new Date(),
        failures: 0
      });
      
      this.statistics.successfulRecoveries++;
      this.logger.info(`✅ Event manager restarted successfully: ${name}`);
      
    } catch (error) {
      this.logger.error(`❌ Failed to restart event manager ${name}:`, error);
      
      // Mark as unhealthy
      this.connectionManager.health.set(name, {
        healthy: false,
        lastCheck: new Date(),
        failures: attempts + 1
      });
      
      throw error;
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<Map<string, EventManagerStatus>> {
    return await this.registry.healthCheckAll();
  }

  /**
   * Get global system metrics
   */
  async getGlobalMetrics(): Promise<{
    registry: Awaited<ReturnType<EventRegistry['getGlobalMetrics']>>;
    manager: ManagerStatistics;
    connections: {
      totalConnections: number;
      healthyConnections: number;
      connectionsByType: Record<EventManagerType, number>;
    };
  }> {
    const registryMetrics = await this.registry.getGlobalMetrics();
    
    // Calculate connection metrics
    let totalConnections = 0;
    let healthyConnections = 0;
    const connectionsByType: Record<EventManagerType, number> = {} as any;
    
    Object.values(EventManagerTypes).forEach(type => {
      const connections = this.connectionManager.connections.get(type)?.size || 0;
      connectionsByType[type] = connections;
      totalConnections += connections;
    });
    
    this.connectionManager.health.forEach(health => {
      if (health.healthy) {
        healthyConnections++;
      }
    });
    
    // Update real-time statistics
    this.statistics.activeManagers = this.activeManagers.size;
    
    return {
      registry: registryMetrics,
      manager: { ...this.statistics },
      connections: {
        totalConnections,
        healthyConnections,
        connectionsByType
      }
    };
  }

  /**
   * Broadcast event to all managers or specific type
   */
  async broadcast<T extends SystemEvent>(
    event: T,
    options?: { type?: EventManagerType; excludeManagers?: string[] }
  ): Promise<void> {
    if (options?.type) {
      await this.registry.broadcastToType(options.type, event);
    } else {
      await this.registry.broadcast(event);
    }
    
    this.statistics.totalEventsProcessed++;
  }

  /**
   * Register event manager factory
   */
  registerFactory<T extends EventManagerConfig>(
    type: EventManagerType,
    factory: IEventManagerFactory<T>
  ): void {
    this.factoryCache.set(type, factory as IEventManagerFactory);
    this.registry.registerFactory(type, factory);
    
    this.logger.debug(`🏭 Registered factory for type: ${type}`);
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<{
    initialized: boolean;
    totalManagers: number;
    healthyManagers: number;
    healthPercentage: number;
    status: 'healthy' | 'warning' | 'critical';
    registry: ReturnType<EventRegistry['getRegistryStats']>;
    statistics: ManagerStatistics;
    uptime: number;
  }> {
    const healthStatus = await this.performHealthCheck();
    const healthyManagers = Array.from(healthStatus.values())
      .filter(status => status.status === 'healthy').length;
    const totalManagers = healthStatus.size;
    const healthPercentage = totalManagers > 0 ? (healthyManagers / totalManagers) * 100 : 100;
    
    const status = healthPercentage >= 80 ? 'healthy' 
      : healthPercentage >= 50 ? 'warning' 
      : 'critical';
    
    const registryStats = this.registry.getRegistryStats();
    
    return {
      initialized: this.initialized,
      totalManagers,
      healthyManagers,
      healthPercentage,
      status,
      registry: registryStats,
      statistics: { ...this.statistics },
      uptime: registryStats.uptime
    };
  }

  /**
   * Shutdown all event managers and cleanup
   */
  async shutdown(): Promise<void> {
    this.logger.info('🔄 Shutting down Event Manager system...');
    
    // Stop health monitoring
    this.stopHealthMonitoring();
    
    // Shutdown all active managers
    const shutdownPromises = Array.from(this.activeManagers.entries()).map(async ([name, manager]) => {
      try {
        await manager.stop();
        await manager.destroy();
      } catch (error) {
        this.logger.error(`❌ Failed to shutdown manager ${name}:`, error);
      }
    });
    
    await Promise.allSettled(shutdownPromises);
    
    // Shutdown registry
    await this.registry.shutdownAll();
    
    // Clear all tracking
    this.activeManagers.clear();
    this.factoryCache.clear();
    this.connectionManager.connections.clear();
    this.connectionManager.health.clear();
    this.recoveryAttempts.clear();
    
    this.initialized = false;
    this.logger.info('✅ Event Manager system shut down');
  }

  /**
   * Private methods for internal operations
   */
  
  private async getOrCreateFactory(type: EventManagerType): Promise<IEventManagerFactory> {
    // Check cache first
    const cached = this.factoryCache.get(type);
    if (cached) {
      return cached;
    }
    
    // Try to get from registry
    const factory = this.registry.getFactory(type);
    if (factory) {
      this.factoryCache.set(type, factory);
      return factory;
    }
    
    // Dynamic import based on manager type
    let FactoryClass: new (...args: any[]) => IEventManagerFactory;
    
    try {
      switch (type) {
        case EventManagerTypes.SYSTEM:
          const { SystemEventManagerFactory } = await import('./adapters/system-event-factory');
          FactoryClass = SystemEventManagerFactory;
          break;
          
        case EventManagerTypes.COORDINATION:
          const { CoordinationEventManagerFactory } = await import('./adapters/coordination-event-factory');
          FactoryClass = CoordinationEventManagerFactory;
          break;
          
        case EventManagerTypes.COMMUNICATION:
          const { CommunicationEventFactory } = await import('./adapters/communication-event-factory');
          FactoryClass = CommunicationEventFactory;
          break;
          
        case EventManagerTypes.MONITORING:
          const { MonitoringEventManagerFactory } = await import('./adapters/monitoring-event-factory');
          FactoryClass = MonitoringEventManagerFactory;
          break;
          
        default:
          throw new Error(`No factory available for event manager type: ${type}`);
      }
      
      const newFactory = new FactoryClass(this.logger, this.config);
      this.factoryCache.set(type, newFactory);
      this.registry.registerFactory(type, newFactory);
      
      return newFactory;
      
    } catch (importError) {
      this.logger.error(`❌ Failed to load factory for ${type}:`, importError);
      throw new Error(`Factory not available for event manager type: ${type}`);
    }
  }

  private mergeConfiguration(options: EventManagerCreationOptions): EventManagerConfig {
    const defaults = DefaultEventManagerConfigs[options.type] || DefaultEventManagerConfigs[EventCategories.SYSTEM];
    const presetConfig = options.preset ? EventManagerPresets[options.preset] : {};
    
    return {
      name: options.name,
      type: options.type,
      ...defaults,
      ...presetConfig,
      ...options.config,
      // Ensure required fields are not overwritten
      name: options.name,
      type: options.type
    } as EventManagerConfig;
  }

  private async registerDefaultFactories(): Promise<void> {
    // Register available factories
    const factoryTypes = [EventManagerTypes.SYSTEM, EventManagerTypes.COORDINATION];
    
    for (const type of factoryTypes) {
      try {
        await this.getOrCreateFactory(type);
      } catch (error) {
        this.logger.warn(`⚠️ Could not register factory for ${type}:`, error);
      }
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        const healthStatus = await this.performHealthCheck();
        
        // Process health results and trigger recovery if needed
        for (const [name, status] of healthStatus) {
          const health = this.connectionManager.health.get(name);
          
          if (status.status !== 'healthy' && health?.healthy && this.connectionManager.autoReconnect) {
            const attempts = this.recoveryAttempts.get(name) || 0;
            
            if (attempts < this.connectionManager.maxReconnectAttempts) {
              this.logger.warn(`⚠️ Manager ${name} unhealthy, attempting recovery...`);
              try {
                await this.restartEventManager(name);
              } catch (error) {
                this.logger.error(`❌ Recovery failed for ${name}:`, error);
              }
            }
          }
        }
      } catch (error) {
        this.logger.error('❌ Health monitoring cycle failed:', error);
      }
    }, 30000); // Every 30 seconds
    
    this.logger.debug('💓 Health monitoring started');
  }

  private stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
    
    this.logger.debug('💓 Health monitoring stopped');
  }
}

export default EventManager;