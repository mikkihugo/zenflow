/**
 * UEL Event Adapters - Unified Exports.
 *
 * Provides unified exports for all UEL event adapters, following the same.
 * Patterns as UACL client adapters and USL service adapters.
 */
/**
 * @file Adapters module exports.
 */
import { CommunicationEventAdapter, CommunicationEventAdapterConfig, CommunicationEventHelpers } from './communication-event-adapter.ts';
import { CommunicationEventFactory } from './communication-event-factory.ts';
import { CoordinationEventAdapter, CoordinationEventAdapterConfig, CoordinationEventHelpers } from './coordination-event-adapter.ts';
import { CoordinationEventManagerFactory } from './coordination-event-factory.ts';
import { MonitoringEventAdapter, MonitoringEventAdapterConfig, MonitoringEventHelpers } from './monitoring-event-adapter.ts';
import { MonitoringEventFactory } from './monitoring-event-factory.ts';
import { SystemEventAdapter, SystemEventAdapterConfig, SystemEventHelpers } from './system-event-adapter.ts';
import { SystemEventManagerFactory } from './system-event-factory.ts';
export type { EventBatch, EventEmissionOptions, EventFilter, EventListener, EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventPriority, EventProcessingStrategy, EventQueryOptions, EventSubscription, EventTransform, IEventManager, SystemEvent, } from '../core/interfaces.ts';
export { EventManagerPresets, EventManagerTypes, EventTypeGuards, } from '../core/interfaces.ts';
export type { CommunicationEvent, CoordinationEvent, MonitoringEvent, SystemLifecycleEvent, } from '../types.ts';
export { DefaultEventManagerConfigs, EventCategories, EventConstants, EventPriorityMap, EventSources, UELTypeGuards, } from '../types.ts';
export { createCommunicationEventAdapter, createDefaultCommunicationEventAdapterConfig, } from './communication-event-adapter.ts';
export { CommunicationEventAdapter, CommunicationEventAdapterConfig, CommunicationEventHelpers };
export type { CommunicationEventAdapterConfig as CommunicationEventAdapterConfigType } from './communication-event-adapter.ts';
export { CommunicationEventFactory, CommunicationEventFactory as CommunicationEventFactoryImpl, communicationEventFactory, createComprehensiveCommunicationAdapter, createHTTPCommunicationAdapter, createMCPCommunicationAdapter, createProtocolCommunicationAdapter, createWebSocketCommunicationAdapter, } from './communication-event-factory.ts';
export { createCoordinationEventAdapter, createDefaultCoordinationEventAdapterConfig, } from './coordination-event-adapter.ts';
export { CoordinationEventAdapter, CoordinationEventAdapterConfig, CoordinationEventHelpers };
export type { CoordinationEventAdapterConfig as CoordinationEventAdapterConfigType } from './coordination-event-adapter.ts';
export { CoordinationEventManagerFactory, createAgentManagementEventManager, createComprehensiveCoordinationEventManager, createCoordinationEventManager, createDevelopmentCoordinationEventManager, createHighPerformanceCoordinationEventManager, createProtocolManagementEventManager, createSwarmCoordinationEventManager, createTaskOrchestrationEventManager, } from './coordination-event-factory.ts';
export { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, } from './monitoring-event-adapter.ts';
export { MonitoringEventAdapter, MonitoringEventAdapterConfig, MonitoringEventHelpers };
export type { MonitoringEventAdapterConfig as MonitoringEventAdapterConfigType } from './monitoring-event-adapter.ts';
export { MonitoringEventAdapterFactory, MonitoringEventConfigs, MonitoringEventFactory, MonitoringEventManager, MonitoringEventRegistry, } from './monitoring-event-factory.ts';
export { createDefaultSystemEventAdapterConfig, createSystemEventAdapter, } from './system-event-adapter.ts';
export { SystemEventAdapter, SystemEventAdapterConfig, SystemEventHelpers };
export type { SystemEventAdapterConfig as SystemEventAdapterConfigType } from './system-event-adapter.ts';
export { createApplicationCoordinatorEventManager, createComprehensiveSystemEventManager, createCoreSystemEventManager, createErrorRecoveryEventManager, createSystemEventManager, SystemEventManagerFactory, } from './system-event-factory.ts';
/**
 * Adapter type registry for type-safe adapter creation.
 */
export declare const EventAdapterTypes: {
    readonly SYSTEM: "system";
    readonly COORDINATION: "coordination";
    readonly COMMUNICATION: "communication";
    readonly MONITORING: "monitoring";
};
export type EventAdapterType = (typeof EventAdapterTypes)[keyof typeof EventAdapterTypes];
/**
 * Adapter factory registry for easy access to all adapter factories.
 */
export declare const EventAdapterFactories: {
    readonly system: typeof SystemEventManagerFactory;
    readonly coordination: typeof CoordinationEventManagerFactory;
    readonly communication: typeof CommunicationEventFactory;
    readonly monitoring: typeof MonitoringEventFactory;
};
/**
 * Quick access functions for common adapter operations.
 */
export declare const EventAdapterUtils: {
    /**
     * Create system event adapter with sensible defaults.
     *
     * @param name
     * @param overrides
     */
    readonly createSystemAdapter: (name: string, overrides?: Partial<SystemEventAdapterConfig>) => SystemEventAdapter;
    /**
     * Create coordination event adapter with sensible defaults.
     *
     * @param name
     * @param overrides
     */
    readonly createCoordinationAdapter: (name: string, overrides?: Partial<CoordinationEventAdapterConfig>) => CoordinationEventAdapter;
    /**
     * Create communication event adapter with sensible defaults.
     *
     * @param name
     * @param overrides
     */
    readonly createCommunicationAdapter: (name: string, overrides?: Partial<CommunicationEventAdapterConfig>) => CommunicationEventAdapter;
    /**
     * Create monitoring event adapter with sensible defaults.
     *
     * @param name
     * @param overrides
     */
    readonly createMonitoringAdapter: (name: string, overrides?: Partial<MonitoringEventAdapterConfig>) => MonitoringEventAdapter;
    /**
     * Create system event adapter factory.
     */
    readonly createSystemFactory: () => SystemEventManagerFactory;
    /**
     * Create coordination event adapter factory.
     */
    readonly createCoordinationFactory: () => CoordinationEventManagerFactory;
    /**
     * Create communication event adapter factory.
     */
    readonly createCommunicationFactory: () => CommunicationEventFactory;
    /**
     * Create monitoring event adapter factory.
     */
    readonly createMonitoringFactory: () => MonitoringEventFactory;
    /**
     * Get all available adapter types.
     */
    readonly getAdapterTypes: () => ("system" | "coordination" | "communication" | "monitoring")[];
    /**
     * Check if adapter type is supported.
     *
     * @param type
     */
    readonly isAdapterTypeSupported: (type: string) => type is EventAdapterType;
};
declare const _default: {
    SystemEventAdapter: typeof SystemEventAdapter;
    SystemEventManagerFactory: typeof SystemEventManagerFactory;
    CoordinationEventAdapter: typeof CoordinationEventAdapter;
    CoordinationEventManagerFactory: typeof CoordinationEventManagerFactory;
    CommunicationEventAdapter: typeof CommunicationEventAdapter;
    CommunicationEventFactory: typeof CommunicationEventFactory;
    MonitoringEventAdapter: typeof MonitoringEventAdapter;
    MonitoringEventFactory: typeof MonitoringEventFactory;
    EventAdapterTypes: {
        readonly SYSTEM: "system";
        readonly COORDINATION: "coordination";
        readonly COMMUNICATION: "communication";
        readonly MONITORING: "monitoring";
    };
    EventAdapterFactories: {
        readonly system: typeof SystemEventManagerFactory;
        readonly coordination: typeof CoordinationEventManagerFactory;
        readonly communication: typeof CommunicationEventFactory;
        readonly monitoring: typeof MonitoringEventFactory;
    };
    EventAdapterUtils: {
        /**
         * Create system event adapter with sensible defaults.
         *
         * @param name
         * @param overrides
         */
        readonly createSystemAdapter: (name: string, overrides?: Partial<SystemEventAdapterConfig>) => SystemEventAdapter;
        /**
         * Create coordination event adapter with sensible defaults.
         *
         * @param name
         * @param overrides
         */
        readonly createCoordinationAdapter: (name: string, overrides?: Partial<CoordinationEventAdapterConfig>) => CoordinationEventAdapter;
        /**
         * Create communication event adapter with sensible defaults.
         *
         * @param name
         * @param overrides
         */
        readonly createCommunicationAdapter: (name: string, overrides?: Partial<CommunicationEventAdapterConfig>) => CommunicationEventAdapter;
        /**
         * Create monitoring event adapter with sensible defaults.
         *
         * @param name
         * @param overrides
         */
        readonly createMonitoringAdapter: (name: string, overrides?: Partial<MonitoringEventAdapterConfig>) => MonitoringEventAdapter;
        /**
         * Create system event adapter factory.
         */
        readonly createSystemFactory: () => SystemEventManagerFactory;
        /**
         * Create coordination event adapter factory.
         */
        readonly createCoordinationFactory: () => CoordinationEventManagerFactory;
        /**
         * Create communication event adapter factory.
         */
        readonly createCommunicationFactory: () => CommunicationEventFactory;
        /**
         * Create monitoring event adapter factory.
         */
        readonly createMonitoringFactory: () => MonitoringEventFactory;
        /**
         * Get all available adapter types.
         */
        readonly getAdapterTypes: () => ("system" | "coordination" | "communication" | "monitoring")[];
        /**
         * Check if adapter type is supported.
         *
         * @param type
         */
        readonly isAdapterTypeSupported: (type: string) => type is EventAdapterType;
    };
    SystemEventHelpers: {
        createStartupEvent(component: string, details?: any): Omit<import("../types.ts").SystemLifecycleEvent, "id" | "timestamp">;
        createShutdownEvent(component: string, details?: any): Omit<import("../types.ts").SystemLifecycleEvent, "id" | "timestamp">;
        createHealthEvent(component: string, healthScore: number, details?: any): Omit<import("../types.ts").SystemLifecycleEvent, "id" | "timestamp">;
        createErrorEvent(component: string, error: Error, details?: any): Omit<import("../types.ts").SystemLifecycleEvent, "id" | "timestamp">;
    };
    CoordinationEventHelpers: {
        createSwarmInitEvent(swarmId: string, topology: string, details?: any): Omit<import("../types.ts").CoordinationEvent, "id" | "timestamp">;
        createAgentSpawnEvent(agentId: string, swarmId: string, details?: any): Omit<import("../types.ts").CoordinationEvent, "id" | "timestamp">;
        createTaskDistributionEvent(taskId: string, assignedTo: string[], details?: any): Omit<import("../types.ts").CoordinationEvent, "id" | "timestamp">;
        createTopologyChangeEvent(swarmId: string, topology: string, details?: any): Omit<import("../types.ts").CoordinationEvent, "id" | "timestamp">;
        createCoordinationErrorEvent(component: string, targetId: string, error: Error, details?: any): Omit<import("../types.ts").CoordinationEvent, "id" | "timestamp">;
    };
    CommunicationEventHelpers: {
        createWebSocketConnectionEvent(connectionId: string, url: string, details?: any): Omit<import("../types.ts").CommunicationEvent, "id" | "timestamp">;
        createMCPToolExecutionEvent(toolName: string, requestId: string, details?: any): Omit<import("../types.ts").CommunicationEvent, "id" | "timestamp">;
        createHTTPRequestEvent(method: string, url: string, details?: any): Omit<import("../types.ts").CommunicationEvent, "id" | "timestamp">;
        createProtocolSwitchingEvent(fromProtocol: string, toProtocol: string, details?: any): Omit<import("../types.ts").CommunicationEvent, "id" | "timestamp">;
        createCommunicationErrorEvent(component: string, protocol: string, error: Error, details?: any): Omit<import("../types.ts").CommunicationEvent, "id" | "timestamp">;
    };
    MonitoringEventHelpers: {
        createPerformanceMetricsEvent(metricName: string, metricValue: number, component: string, details?: any): Omit<import("../types.ts").MonitoringEvent, "id" | "timestamp">;
        createHealthStatusEvent(component: string, healthScore: number, status: string, details?: any): Omit<import("../types.ts").MonitoringEvent, "id" | "timestamp">;
        createAlertEvent(alertId: string, severity: "info" | "warning" | "error" | "critical", component: string, details?: any): Omit<import("../types.ts").MonitoringEvent, "id" | "timestamp">;
        createAnalyticsInsightEvent(component: string, insights: any, details?: any): Omit<import("../types.ts").MonitoringEvent, "id" | "timestamp">;
        createMonitoringErrorEvent(component: string, error: Error, _operation: string, details?: any): Omit<import("../types.ts").MonitoringEvent, "id" | "timestamp">;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map