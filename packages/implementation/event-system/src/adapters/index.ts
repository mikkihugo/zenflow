/**
 * UEL Event Adapters - Unified Exports.
 *
 * Provides unified exports for all UEL event adapters, following the same.
 * Patterns as UACL client adapters and USL service adapters.
 */
/**
 * @file Adapters module exports.
 */

import {
  createCommunicationEventAdapter as _createCommunicationEventAdapter,
  createDefaultCommunicationEventAdapterConfig as _createDefaultCommunicationEventAdapterConfig,
  CommunicationEventAdapter,
  type CommunicationEventAdapterConfig,
  CommunicationEventHelpers,
} from './communication-event-adapter;
import { CommunicationEventFactory } from './communication-event-factory;
import {
  createCoordinationEventAdapter as _createCoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig as _createDefaultCoordinationEventAdapterConfig,
  CoordinationEventAdapter,
  type CoordinationEventAdapterConfig,
  CoordinationEventHelpers,
} from './coordination-event-adapter;
import { CoordinationEventManagerFactory } from './coordination-event-factory;
import {
  createDefaultMonitoringEventAdapterConfig as _createDefaultMonitoringEventAdapterConfig,
  createMonitoringEventAdapter as _createMonitoringEventAdapter,
  MonitoringEventAdapter,
  type MonitoringEventAdapterConfig,
  MonitoringEventHelpers,
} from './monitoring-event-adapter;
import { MonitoringEventFactory } from './monitoring-event-factory;
// Import functions and types for local use in EventAdapterUtils
import {
  createDefaultSystemEventAdapterConfig as _createDefaultSystemEventAdapterConfig,
  createSystemEventAdapter as _createSystemEventAdapter,
  SystemEventAdapter,
  type SystemEventAdapterConfig,
  SystemEventHelpers,
} from './system-event-adapter;
// Import factory classes first to ensure they're available'
import { SystemEventManagerFactory } from './system-event-factory;

// Type exports for convenience
export type {
  EventBatch,
  EventEmissionOptions,
  EventFilter,
  EventListener,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventPriority,
  EventProcessingStrategy,
  EventQueryOptions,
  EventSubscription,
  EventTransform,
  EventManager,
  SystemEvent,
} from '../core/interfaces;
// Re-export UEL core for adapter integration
export {
  EventManagerPresets,
  EventManagerTypes,
  EventTypeGuards,
} from '../core/interfaces;
export type {
  CommunicationEvent,
  CoordinationEvent,
  MonitoringEvent,
  SystemLifecycleEvent,
} from '../types;
export {
  DefaultEventManagerConfigs,
  EventCategories,
  EventConstants,
  EventPriorityMap,
  EventSources,
  UELTypeGuards,
} from '../types;

// Communication Event Adapter - Main export
export {
  createCommunicationEventAdapter,
  createDefaultCommunicationEventAdapterConfig,
} from './communication-event-adapter;
export type {
  CommunicationEventAdapter,
  CommunicationEventAdapterConfig,
  CommunicationEventHelpers,
};
export type { CommunicationEventAdapterConfig as CommunicationEventAdapterConfigType } from './communication-event-adapter;
// Communication Event Factory - Factory pattern
// Re-export CommunicationEventFactory for compatibility
export {
  CommunicationEventFactory,
  CommunicationEventFactory as CommunicationEventFactoryImpl,
  communicationEventFactory,
  createComprehensiveCommunicationAdapter,
  createHTTPCommunicationAdapter,
  createMCPCommunicationAdapter,
  createProtocolCommunicationAdapter,
  createWebSocketCommunicationAdapter,
} from './communication-event-factory;
// Coordination Event Adapter - Main export
export {
  createCoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig,
} from './coordination-event-adapter;
export type {
  CoordinationEventAdapter,
  CoordinationEventAdapterConfig,
  CoordinationEventHelpers,
};
export type { CoordinationEventAdapterConfig as CoordinationEventAdapterConfigType } from './coordination-event-adapter;
// Coordination Event Factory - Factory pattern
export {
  CoordinationEventManagerFactory,
  createAgentManagementEventManager,
  createComprehensiveCoordinationEventManager,
  createCoordinationEventManager,
  createDevelopmentCoordinationEventManager,
  createHighPerformanceCoordinationEventManager,
  createProtocolManagementEventManager,
  createSwarmCoordinationEventManager,
  createTaskOrchestrationEventManager,
} from './coordination-event-factory;
// Monitoring Event Adapter - Main export
export {
  createDefaultMonitoringEventAdapterConfig,
  createMonitoringEventAdapter,
} from './monitoring-event-adapter;
export type {
  MonitoringEventAdapter,
  MonitoringEventAdapterConfig,
  MonitoringEventHelpers,
};
export type { MonitoringEventAdapterConfig as MonitoringEventAdapterConfigType } from './monitoring-event-adapter;
// Monitoring Event Factory - Factory pattern
export {
  MonitoringEventAdapterFactory,
  MonitoringEventConfigs,
  MonitoringEventFactory,
  MonitoringEventManager,
  MonitoringEventRegistry,
} from './monitoring-event-factory;
// System Event Adapter - Main export
export {
  createDefaultSystemEventAdapterConfig,
  createSystemEventAdapter,
} from './system-event-adapter;
export type {
  SystemEventAdapter,
  SystemEventAdapterConfig,
  SystemEventHelpers,
};
export type { SystemEventAdapterConfig as SystemEventAdapterConfigType } from './system-event-adapter;
// System Event Factory - Factory pattern
export {
  createApplicationCoordinatorEventManager,
  createComprehensiveSystemEventManager,
  createCoreSystemEventManager,
  createErrorRecoveryEventManager,
  createSystemEventManager,
  SystemEventManagerFactory,
} from './system-event-factory;

/**
 * Adapter type registry for type-safe adapter creation.
 */
export const EventAdapterTypes = {
  SYSTEM: 'system',
  COORDINATION: 'coordination',
  COMMUNICATION: 'communication',
  MONITORING: 'monitoring',
} as const;

export type EventAdapterType =
  (typeof EventAdapterTypes)[keyof typeof EventAdapterTypes];

/**
 * Adapter factory registry for easy access to all adapter factories.
 */
export const EventAdapterFactories = {
  [EventAdapterTypes['SYSTEM']]: SystemEventManagerFactory,
  [EventAdapterTypes['COORDINATION']]: CoordinationEventManagerFactory,
  [EventAdapterTypes['COMMUNICATION']]: CommunicationEventFactory,
  [EventAdapterTypes['MONITORING']]: MonitoringEventFactory,
} as const;

/**
 * Quick access functions for common adapter operations.
 */
export const EventAdapterUtils = {
  /**
   * Create system event adapter with sensible defaults.
   *
   * @param name
   * @param overrides
   */
  createSystemAdapter: (
    name: string,
    overrides?: Partial<SystemEventAdapterConfig>
  ) => {
    const config = _createDefaultSystemEventAdapterConfig(name, overrides);
    return _createSystemEventAdapter(config);
  },

  /**
   * Create coordination event adapter with sensible defaults.
   *
   * @param name
   * @param overrides
   */
  createCoordinationAdapter: (
    name: string,
    overrides?: Partial<CoordinationEventAdapterConfig>
  ) => {
    const config = _createDefaultCoordinationEventAdapterConfig(
      name,
      overrides
    );
    return _createCoordinationEventAdapter(config);
  },

  /**
   * Create communication event adapter with sensible defaults.
   *
   * @param name
   * @param overrides
   */
  createCommunicationAdapter: (
    name: string,
    overrides?: Partial<CommunicationEventAdapterConfig>
  ) => {
    const config = _createDefaultCommunicationEventAdapterConfig(
      name,
      overrides
    );
    return _createCommunicationEventAdapter(config);
  },

  /**
   * Create monitoring event adapter with sensible defaults.
   *
   * @param name
   * @param overrides
   */
  createMonitoringAdapter: (
    name: string,
    overrides?: Partial<MonitoringEventAdapterConfig>
  ) => {
    const config = _createDefaultMonitoringEventAdapterConfig(name, overrides);
    return _createMonitoringEventAdapter(config);
  },

  /**
   * Create system event adapter factory.
   */
  createSystemFactory: () => new SystemEventManagerFactory(),

  /**
   * Create coordination event adapter factory.
   */
  createCoordinationFactory: () => new CoordinationEventManagerFactory(),

  /**
   * Create communication event adapter factory.
   */
  createCommunicationFactory: () => new CommunicationEventFactory(),

  /**
   * Create monitoring event adapter factory.
   */
  createMonitoringFactory: () => new MonitoringEventFactory(),

  /**
   * Get all available adapter types.
   */
  getAdapterTypes: () => Object.values(EventAdapterTypes),

  /**
   * Check if adapter type is supported.
   *
   * @param type
   */
  isAdapterTypeSupported: (type: string): type is EventAdapterType => {
    return Object.values(EventAdapterTypes).includes(type as EventAdapterType);
  },
} as const;

// Default exports for convenience
export default {
  SystemEventAdapter: SystemEventAdapter,
  SystemEventManagerFactory: SystemEventManagerFactory,
  CoordinationEventAdapter: CoordinationEventAdapter,
  CoordinationEventManagerFactory: CoordinationEventManagerFactory,
  CommunicationEventAdapter: CommunicationEventAdapter,
  CommunicationEventFactory: CommunicationEventFactory,
  MonitoringEventAdapter: MonitoringEventAdapter,
  MonitoringEventFactory: MonitoringEventFactory,
  EventAdapterTypes: EventAdapterTypes,
  EventAdapterFactories: EventAdapterFactories,
  EventAdapterUtils: EventAdapterUtils,
  SystemEventHelpers,
  CoordinationEventHelpers,
  CommunicationEventHelpers,
  MonitoringEventHelpers,
};
