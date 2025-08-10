/**
 * @file UEL (Unified Event Layer) - Main Exports.
 *
 * Central export point for all UEL functionality including:
 * - Event manager registry and factory
 * - Event type definitions and configurations
 * - Helper functions and utilities.
 * - Global instances and initialization.
 */

import { createLogger } from '../../core/logger';

const logger = createLogger('interfaces-events-index');

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
  MonitoringEventAdapterFactory,
  MonitoringEventHelpers,
  // System Event Adapters
  SystemEventAdapter,
  // Types
  type SystemEventAdapterConfig,
  SystemEventHelpers,
  SystemEventManagerFactory,
} from './adapters';
export { CompatibilityFactory } from './compatibility';
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
// Additional exports for UEL system - Remove duplicates
export { EventManager } from './manager';
export { EventRegistry } from './registry';
export {
  UELEnhancedApplicationCoordinator,
  UELEnhancedEventBus,
  UELEnhancedObserverSystem,
} from './system-integrations';
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
export { UELValidationFramework } from './validation';

// Import types for internal use
import type {
  CommunicationEventAdapter,
  CommunicationEventAdapterConfig,
  CoordinationEventAdapter,
  CoordinationEventAdapterConfig,
  SystemEventAdapter,
  SystemEventAdapterConfig,
} from './adapters';
import type { CompatibilityFactory, UELCompatibleEventEmitter } from './compatibility';
// Import missing types
import type {
  EventManagerConfig,
  EventManagerStatus,
  EventManagerType,
  EventManagerTypes,
  SystemEvent,
} from './core/interfaces';
// Import core components for UEL class
import type { UELFactory, UELRegistry } from './factories';
import type { EventManager } from './manager';
import type { EventRegistry } from './registry';
import type {
  UELEnhancedApplicationCoordinator,
  UELEnhancedEventBus,
  UELEnhancedObserverSystem,
} from './system-integrations';
import type { UELValidationFramework } from './validation';

// Additional compatibility exports
export {
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

export type {
  ConnectionManager,
  CoordinationSettings,
  // Event Manager System
  EventManagerCreationOptions,
  ManagerStatistics,
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
export type {
  EventDiscoveryConfig,
  // Event Registry System
  EventRegistryEntry,
  EventTypeRegistry,
  FactoryRegistry,
  HealthMonitoringConfig,
} from './registry';

export {
  analyzeSystemEventEmitterUsage,
  enhanceWithUEL,
  SystemIntegrationFactory,
  UELSystemIntegration,
} from './system-integrations';

export type {
  EventTypeSchema,
  HealthValidationConfig,
  IntegrationValidationConfig,
  // Validation Framework
  ValidationError,
  ValidationRecommendation,
  ValidationResult,
  ValidationWarning,
} from './validation';

// Import UEL from singleton to avoid circular dependency
export { UEL, uel } from './core/uel-singleton';

// Import for use in this file
import { UEL, uel } from './core/uel-singleton';

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
    // Fix exactOptionalPropertyTypes issue by using explicit undefined handling
    await uel.initialize({
      enableValidation: config.enableValidation !== false,
      enableCompatibility: config.enableCompatibility !== false,
      healthMonitoring: config.healthMonitoring !== false,
      autoRegisterFactories: config.autoRegisterFactories !== false,
      logger: config.logger || undefined,
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
    system?: any;
    coordination?: any;
    communication?: any;
    monitoring?: any;
    interface?: any;
  }> {
    await uel.initialize();

    const managers: {
      system?: any;
      coordination?: any;
      communication?: any;
      monitoring?: any;
      interface?: any;
    } = {};

    try {
      // Use integrated event manager if available and requested
      const eventManager = config?.useIntegratedManager ? uel.getEventManager() : null;

      if (config?.systemEvents !== false) {
        managers.system = eventManager
          ? await eventManager.createSystemEventManager(
              'common-system',
              config?.customConfig?.['system']
            )
          : await uel.createSystemEventManager('common-system', config?.customConfig?.['system']);
      }

      if (config?.coordinationEvents !== false) {
        managers.coordination = eventManager
          ? await eventManager.createCoordinationEventManager(
              'common-coordination',
              config?.customConfig?.['coordination']
            )
          : await uel.createCoordinationEventManager(
              'common-coordination',
              config?.customConfig?.['coordination']
            );
      }

      if (config?.communicationEvents !== false) {
        managers.communication = eventManager
          ? await eventManager.createCommunicationEventManager(
              'common-communication',
              config?.customConfig?.['communication']
            )
          : await uel.createCommunicationEventManager(
              'common-communication',
              config?.customConfig?.['communication']
            );
      }

      if (config?.monitoringEvents !== false) {
        managers.monitoring = eventManager
          ? await eventManager.createMonitoringEventManager(
              'common-monitoring',
              config?.customConfig?.['monitoring']
            )
          : await uel.createMonitoringEventManager(
              'common-monitoring',
              config?.customConfig?.['monitoring']
            );
      }

      if (config?.interfaceEvents !== false) {
        managers.interface = eventManager
          ? await eventManager.createInterfaceEventManager(
              'common-interface',
              config?.customConfig?.['interface']
            )
          : await uel.createInterfaceEventManager(
              'common-interface',
              config?.customConfig?.['interface']
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

      // Migrate EventEmitter if it exists - using proper type casting
      if (observerSystem && typeof (observerSystem as any).emit === 'function') {
        const compatible = await uel.migrateEventEmitter(
          observerSystem as unknown as { on: Function; off?: Function; emit: Function; listeners?: Function },
          'migrated-observer',
          'system'
        );
        if (compatible) {
          results.migratedManagers.push('migrated-observer');
        } else {
          results.errors.push('Failed to migrate main observer system');
        }
      }

      // Analyze and provide recommendations
      if (observerSystem) {
        const analysis = uel
          .getCompatibilityFactory()
          ?.getMigrationHelper()
          ?.analyzeEventEmitter(observerSystem);
        if (analysis) {
          results.recommendations.push(...analysis.recommendations);
        }
      }

      results.success = results.errors.length === 0;
      return results;
    } catch (error) {
      results.success = false;
      results.errors.push(
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

      // Fix exactOptionalPropertyTypes issue
      return {
        validationResult: validationResult,
        reportPath: reportPath || undefined,
        summary: {
          passed: summary.passed,
          score: summary.score,
          criticalIssues: summary.criticalIssues,
          recommendations: summary.recommendations,
        },
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
    system: (operation: string, status: string, details?: any) => any;
    coordination: (operation: string, targetId: string, details?: any) => any;
    communication: (operation: string, protocol: string, details?: any) => any;
    monitoring: (operation: string, component: string, details?: any) => any;
    interface: (operation: string, interfaceType: string, details?: any) => any;
  } {
    return {
      // TODO: Fix event type casting - these need proper type definitions instead of 'as any'
      system: (operation: string, status: string, details?: any): any => ({
        id: `system-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-system',
        type: `system:${operation}` as any,
        operation: operation as any,
        status: status as any,
        details,
      }),

      coordination: (operation: string, targetId: string, details?: any): any => ({
        id: `coord-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-coordination',
        type: `coordination:${operation}` as any,
        operation: operation as any,
        targetId,
        details,
      }),

      communication: (operation: string, protocol: string, details?: any): any => ({
        id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-communication',
        type: `communication:${operation}` as any,
        operation: operation as any,
        protocol: protocol as any,
        details,
      }),

      monitoring: (operation: string, component: string, details?: any): any => ({
        id: `mon-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date(),
        source: 'uel-monitoring',
        type: `monitoring:${operation}` as any,
        operation: operation as any,
        component,
        details,
      }),

      interface: (operation: string, interfaceType: string, details?: any): any => ({
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
