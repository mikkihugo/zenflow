/**
 * UEL Event Adapters - Unified Exports.
 *
 * Provides unified exports for all UEL event adapters, following the same.
 * patterns as UACL client adapters and USL service adapters.
 */
/**
 * @file adapters module exports
 */



export type {
  EventBatch,
  EventEmissionOptions,
  EventFilter,
  EventListener,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventQueryOptions,
  EventSubscription,
  EventTransform,
  IEventManager,
  SystemEvent,
} from '../core/interfaces';
// Re-export UEL core for adapter integration
export {
  EventManagerPresets,
  EventManagerTypes,
  EventTypeGuards,
} from '../core/interfaces';
// Type exports for convenience
export type {
  CommunicationEvent,
  CoordinationEvent,
  EventPriority,
  EventProcessingStrategy,
  MonitoringEvent,
  SystemLifecycleEvent,
} from '../types';
export {
  DefaultEventManagerConfigs,
  EventCategories,
  EventConstants,
  EventPriorityMap,
  EventSources,
  UELTypeGuards,
} from '../types';

// Communication Event Adapter - Main export
export {
  CommunicationEventAdapter,
  type CommunicationEventAdapterConfig,
  CommunicationEventHelpers,
  createCommunicationEventAdapter,
  createDefaultCommunicationEventAdapterConfig,
} from './communication-event-adapter';

// Communication Event Factory - Factory pattern
export {
  CommunicationEventFactory,
  communicationEventFactory,
  createComprehensiveCommunicationAdapter,
  createHTTPCommunicationAdapter,
  createMCPCommunicationAdapter,
  createProtocolCommunicationAdapter,
  createWebSocketCommunicationAdapter,
} from './communication-event-factory';
// Coordination Event Adapter - Main export
export {
  CoordinationEventAdapter,
  type CoordinationEventAdapterConfig,
  CoordinationEventHelpers,
  createCoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig,
} from './coordination-event-adapter';
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
} from './coordination-event-factory';
// Monitoring Event Adapter - Main export
export {
  createDefaultMonitoringEventAdapterConfig,
  createMonitoringEventAdapter,
  MonitoringEventAdapter,
  type MonitoringEventAdapterConfig,
  MonitoringEventHelpers,
} from './monitoring-event-adapter';
// Monitoring Event Factory - Factory pattern
export {
  MonitoringEventAdapterFactory,
  MonitoringEventConfigs,
  MonitoringEventFactory,
  MonitoringEventManager,
  MonitoringEventRegistry,
} from './monitoring-event-factory';
// System Event Adapter - Main export
export {
  createDefaultSystemEventAdapterConfig,
  createSystemEventAdapter,
  SystemEventAdapter,
  type SystemEventAdapterConfig,
  SystemEventHelpers,
} from './system-event-adapter';
// System Event Factory - Factory pattern
export {
  createApplicationCoordinatorEventManager,
  createComprehensiveSystemEventManager,
  createCoreSystemEventManager,
  createErrorRecoveryEventManager,
  createSystemEventManager,
  SystemEventManagerFactory,
} from './system-event-factory';

/**
 * Adapter type registry for type-safe adapter creation.
 */
export const EventAdapterTypes = {
  SYSTEM: 'system',
  COORDINATION: 'coordination',
  COMMUNICATION: 'communication',
  MONITORING: 'monitoring',
} as const;

export type EventAdapterType = (typeof EventAdapterTypes)[keyof typeof EventAdapterTypes];

/**
 * Adapter factory registry for easy access to all adapter factories.
 */
export const EventAdapterFactories = {
  [EventAdapterTypes.SYSTEM]: SystemEventManagerFactory,
  [EventAdapterTypes.COORDINATION]: CoordinationEventManagerFactory,
  [EventAdapterTypes.COMMUNICATION]: CommunicationEventFactory,
  [EventAdapterTypes.MONITORING]: MonitoringEventFactory,
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
  createSystemAdapter: (name: string, overrides?: Partial<SystemEventAdapterConfig>) => {
    const config = createDefaultSystemEventAdapterConfig(name, overrides);
    return createSystemEventAdapter(config);
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
    const config = createDefaultCoordinationEventAdapterConfig(name, overrides);
    return createCoordinationEventAdapter(config);
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
    const config = createDefaultCommunicationEventAdapterConfig(name, overrides);
    return createCommunicationEventAdapter(config);
  },

  /**
   * Create monitoring event adapter with sensible defaults.
   *
   * @param name
   * @param overrides
   */
  createMonitoringAdapter: (name: string, overrides?: Partial<MonitoringEventAdapterConfig>) => {
    const config = createDefaultMonitoringEventAdapterConfig(name, overrides);
    return createMonitoringEventAdapter(config);
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
  createMonitoringFactory: () => MonitoringEventFactory,

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
  SystemEventAdapter,
  SystemEventManagerFactory,
  CoordinationEventAdapter,
  CoordinationEventManagerFactory,
  CommunicationEventAdapter,
  CommunicationEventFactory,
  MonitoringEventAdapter,
  MonitoringEventFactory,
  EventAdapterTypes,
  EventAdapterFactories,
  EventAdapterUtils,
  SystemEventHelpers,
  CoordinationEventHelpers,
  CommunicationEventHelpers,
  MonitoringEventHelpers,
};
