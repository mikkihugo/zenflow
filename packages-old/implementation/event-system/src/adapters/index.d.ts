/**
 * UEL Event Adapters - Unified Exports.
 *
 * Provides unified exports for all UEL event adapters, following the same
 * patterns as UACL client adapters and USL service adapters.
 */
/**
 * @file Adapters module exports.
 */
export type { EventFilter, EventListener, EventManagerConfig, EventManagerMetrics, EventManagerStatus, EventPriority, EventProcessingStrategy, EventSubscription, EventTransform, EventManager, SystemEvent, } from '../core/interfaces';
export { EventManagerPresets, EventManagerTypes, EventTypeGuards, } from '../core/interfaces';
export type { SystemLifecycleEvent, } from '../types';
export { DefaultEventManagerConfigs, EventCategories, EventConstants, EventPriorityMap, EventSources, UELTypeGuards, } from '../types';
export { createCoordinationEventAdapter, createDefaultCoordinationEventAdapterConfig, CoordinationEventAdapter, CoordinationEventHelpers, } from './coordination';
export type { CoordinationEventAdapterConfig, } from './coordination';
export { CoordinationEventFactory, createCoordinationEventFactory, createCoordinationAdapter, createSwarmCoordinationAdapter, createAgentManagementAdapter, createTaskOrchestrationAdapter, createProtocolManagementAdapter, createComprehensiveCoordinationAdapter, coordinationEventFactory, } from './coordination-factory';
import { CoordinationEventAdapter } from './coordination';
import type { CoordinationEventAdapterConfig } from './coordination';
import { CoordinationEventFactory } from './coordination-factory';
/**
 * Adapter type registry for type-safe adapter creation.
 */
export declare const EventAdapterTypes: {
    readonly COORDINATION: "coordination";
};
export type EventAdapterType = (typeof EventAdapterTypes)[keyof typeof EventAdapterTypes];
/**
 * Adapter factory registry for easy access to all adapter factories.
 */
export declare const EventAdapterFactories: {
    readonly coordination: typeof CoordinationEventFactory;
};
/**
 * Quick access functions for common adapter operations.
 */
export declare const EventAdapterUtils: {
    /**
     * Create coordination event adapter with sensible defaults.
     */
    readonly createCoordinationAdapter: (name: string, overrides?: Partial<CoordinationEventAdapterConfig>) => CoordinationEventAdapter;
    /**
     * Create coordination event adapter factory.
     */
    readonly createCoordinationFactory: () => CoordinationEventFactory;
    /**
     * Get all available adapter types.
     */
    readonly getAdapterTypes: () => "coordination"[];
    /**
     * Check if adapter type is supported.
     */
    readonly isAdapterTypeSupported: (type: string) => type is EventAdapterType;
};
declare const _default: {
    CoordinationEventAdapter: typeof CoordinationEventAdapter;
    CoordinationEventFactory: typeof CoordinationEventFactory;
    EventAdapterTypes: {
        readonly COORDINATION: "coordination";
    };
    EventAdapterFactories: {
        readonly coordination: typeof CoordinationEventFactory;
    };
    EventAdapterUtils: {
        /**
         * Create coordination event adapter with sensible defaults.
         */
        readonly createCoordinationAdapter: (name: string, overrides?: Partial<CoordinationEventAdapterConfig>) => CoordinationEventAdapter;
        /**
         * Create coordination event adapter factory.
         */
        readonly createCoordinationFactory: () => CoordinationEventFactory;
        /**
         * Get all available adapter types.
         */
        readonly getAdapterTypes: () => "coordination"[];
        /**
         * Check if adapter type is supported.
         */
        readonly isAdapterTypeSupported: (type: string) => type is EventAdapterType;
    };
    CoordinationEventHelpers: {
        createSwarmInitEvent(swarmId: string, topology: "mesh" | "hierarchical" | "ring" | "star", details?: unknown): Omit<import("..").CoordinationEvent, "id" | "timestamp">;
        createAgentSpawnEvent(agentId: string, swarmId: string, details?: unknown): Omit<import("..").CoordinationEvent, "id" | "timestamp">;
        createTaskDistributionEvent(taskId: string, assignedTo: string[], details?: unknown): Omit<import("..").CoordinationEvent, "id" | "timestamp">;
        createTopologyChangeEvent(swarmId: string, topology: "mesh" | "hierarchical" | "ring" | "star", details?: unknown): Omit<import("..").CoordinationEvent, "id" | "timestamp">;
        createCoordinationErrorEvent(component: string, targetId: string, error: Error, details?: unknown): Omit<import("..").CoordinationEvent, "id" | "timestamp">;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map