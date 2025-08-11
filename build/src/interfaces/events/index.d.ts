/**
 * @file UEL (Unified Event Layer) - Main Exports.
 *
 * Central export point for all UEL functionality including:
 * - Event manager registry and factory
 * - Event type definitions and configurations
 * - Helper functions and utilities.
 * - Global instances and initialization.
 */
export { CommunicationEventAdapter, type CommunicationEventAdapterConfig, CommunicationEventFactory, CommunicationEventHelpers, CoordinationEventAdapter, type CoordinationEventAdapterConfig, CoordinationEventHelpers, CoordinationEventManagerFactory, createAgentManagementEventManager, createApplicationCoordinatorEventManager, createCommunicationEventAdapter, createComprehensiveCommunicationAdapter, createComprehensiveCoordinationEventManager, createComprehensiveSystemEventManager, createCoordinationEventAdapter, createCoordinationEventManager, createCoreSystemEventManager, createDefaultCommunicationEventAdapterConfig, createDefaultCoordinationEventAdapterConfig, createDefaultMonitoringEventAdapterConfig, createDefaultSystemEventAdapterConfig, createDevelopmentCoordinationEventManager, createErrorRecoveryEventManager, createHighPerformanceCoordinationEventManager, createHTTPCommunicationAdapter, createMCPCommunicationAdapter, createMonitoringEventAdapter, createProtocolCommunicationAdapter, createProtocolManagementEventManager, createSwarmCoordinationEventManager, createSystemEventAdapter, createSystemEventManager, createTaskOrchestrationEventManager, createWebSocketCommunicationAdapter, EventAdapterFactories, type EventAdapterType, EventAdapterTypes, EventAdapterUtils, MonitoringEventAdapter, type MonitoringEventAdapterConfig, MonitoringEventAdapterFactory, MonitoringEventHelpers, SystemEventAdapter, type SystemEventAdapterConfig, SystemEventHelpers, SystemEventManagerFactory, } from './adapters';
export { CompatibilityFactory } from './compatibility.ts';
export type { EventBatch, EventEmissionOptions, EventFilter, EventHealthConfig, EventListener, EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventManagerType, EventMonitoringConfig, EventPriority, EventProcessingStrategy, EventQueryOptions, EventRetryConfig, EventSubscription, EventTransform, IEventManager, IEventManagerFactory, IEventManagerRegistry, SystemEvent, } from './core/interfaces.ts';
export { EventEmissionError, EventError, EventFilterError, EventManagerPresets, EventManagerTypes, EventRetryExhaustedError, EventSubscriptionError, EventTimeoutError, EventTypeGuards, } from './core/interfaces.ts';
export { type EventManagerFactoryConfig, type EventManagerRegistry, type EventManagerTransaction, type EventManagerTypeMap, type ICommunicationEventManager, type ICoordinationEventManager, type IDatabaseEventManager, type IInterfaceEventManager, type IMemoryEventManager, type IMonitoringEventManager, type INeuralEventManager, type ISystemEventManager, type IWorkflowEventManager, UELFactory, UELRegistry, } from './factories.ts';
export { EventManager } from './manager.ts';
export { EventRegistry } from './registry.ts';
export { UELEnhancedApplicationCoordinator, UELEnhancedEventBus, UELEnhancedObserverSystem, } from './system-integrations.ts';
export type { CommunicationEvent, CoordinationEvent, DatabaseEvent, InterfaceEvent, MemoryEvent, MonitoringEvent, NeuralEvent, SystemLifecycleEvent, UELEvent, WorkflowEvent, } from './types.ts';
export { DefaultEventManagerConfigs, EventCategories, EventConstants, EventPriorityMap, EventSources, EventTypePatterns, UELTypeGuards, } from './types.ts';
export { UELValidationFramework } from './validation.ts';
import type { EventManagerConfig } from './core/interfaces.ts';
import type { UELEnhancedApplicationCoordinator, UELEnhancedEventBus, UELEnhancedObserverSystem } from './system-integrations.ts';
export { CompatibleEventEmitter, createCompatibleEventEmitter, EventEmitterMigrationHelper, MigrationHelper, UELCompatibleEventEmitter, wrapWithUEL, } from './compatibility.ts';
export { UEL, uel } from './core/uel-singleton.ts';
export { createCommunicationEventBus, createCoordinationEventBus, createEventManager, createMonitoringEventBus, createSystemEventBus, } from './factories.ts';
export type { ConnectionManager, CoordinationSettings, EventManagerCreationOptions, ManagerStatistics, } from './manager.ts';
export { type AllSystemEvents, type DatabaseEvent as LegacyDatabaseEvent, DatabaseObserver, EventBuilder, type InterfaceEvent as LegacyInterfaceEvent, LoggerObserver, type MCPEvent, type MemoryEvent as LegacyMemoryEvent, MetricsObserver, type NeuralEvent as LegacyNeuralEvent, type ObserverType, type SwarmEvent, type SwarmMetrics, type SwarmStatus, type SwarmTopology, SystemEventManager, type SystemObserver, type ToolResult, WebSocketObserver, } from './observer-system.ts';
export type { EventDiscoveryConfig, EventRegistryEntry, EventTypeRegistry, FactoryRegistry, HealthMonitoringConfig, } from './registry.ts';
export { analyzeSystemEventEmitterUsage, enhanceWithUEL, SystemIntegrationFactory, UELSystemIntegration, } from './system-integrations.ts';
export type { EventTypeSchema, HealthValidationConfig, IntegrationValidationConfig, ValidationError, ValidationRecommendation, ValidationResult, ValidationWarning, } from './validation.ts';
import { type UEL, uel } from './core/uel-singleton.ts';
/**
 * Initialize UEL with default configuration.
 *
 * @param config
 */
export declare const initializeUEL: (config?: Parameters<UEL["initialize"]>[0]) => Promise<void>;
/**
 * Enhanced helpers for complete UEL system operations.
 */
export declare const UELHelpers: {
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
    initializeCompleteSystem(config?: {
        enableValidation?: boolean;
        enableCompatibility?: boolean;
        healthMonitoring?: boolean;
        autoRegisterFactories?: boolean;
        logger?: Console | {
            debug: Function;
            info: Function;
            warn: Function;
            error: Function;
        };
    }): Promise<UEL>;
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
    setupCommonEventManagers(config?: {
        systemEvents?: boolean;
        coordinationEvents?: boolean;
        communicationEvents?: boolean;
        monitoringEvents?: boolean;
        interfaceEvents?: boolean;
        customConfig?: Record<string, Partial<EventManagerConfig>>;
        useIntegratedManager?: boolean;
    }): Promise<{
        system?: any;
        coordination?: any;
        communication?: any;
        monitoring?: any;
        interface?: any;
    }>;
    /**
     * Migrate existing observer system to UEL.
     *
     * @param observerSystem
     * @param observerSystem.observers
     * @param observerSystem.notify
     */
    migrateObserverSystem(observerSystem: {
        observers: unknown[];
        notify: Function;
    }): Promise<{
        success: boolean;
        migratedManagers: string[];
        errors: string[];
        recommendations: string[];
    }>;
    /**
     * Get a quick status overview.
     */
    getQuickStatus(): Promise<{
        initialized: boolean;
        totalManagers: number;
        healthyManagers: number;
        healthPercentage: number;
        status: "healthy" | "warning" | "critical";
    }>;
    /**
     * Perform comprehensive health check on all event managers.
     */
    performHealthCheck(): Promise<Record<string, {
        healthy: boolean;
        details?: Record<string, unknown>;
    }>>;
    /**
     * Migrate entire system to UEL with enhanced capabilities.
     *
     * @param systems
     * @param systems.eventBus
     * @param systems.applicationCoordinator
     * @param systems.observerSystem
     */
    migrateSystemToUEL(systems: {
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
    }>;
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
    setupCompleteUELSystem(options?: {
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
    }>;
    /**
     * Perform comprehensive system validation.
     *
     * @param options
     * @param options.includeHealthCheck
     * @param options.includeIntegrationCheck
     * @param options.includeSampleEvents
     * @param options.exportReport
     */
    performCompleteValidation(options?: {
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
    }>;
    /**
     * Create event builder for common event types.
     */
    createEventBuilder(): {
        system: (operation: string, status: string, details?: any) => any;
        coordination: (operation: string, targetId: string, details?: any) => any;
        communication: (operation: string, protocol: string, details?: any) => any;
        monitoring: (operation: string, component: string, details?: any) => any;
        interface: (operation: string, interfaceType: string, details?: any) => any;
    };
};
/**
 * Default export for convenience.
 */
export default uel;
//# sourceMappingURL=index.d.ts.map