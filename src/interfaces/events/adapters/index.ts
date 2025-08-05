/**
 * UEL Event Adapters - Unified Exports
 * 
 * Provides unified exports for all UEL event adapters, following the same
 * patterns as UACL client adapters and USL service adapters.
 */

// System Event Adapter - Main export
export {
  SystemEventAdapter,
  createSystemEventAdapter,
  createDefaultSystemEventAdapterConfig,
  SystemEventHelpers,
  type SystemEventAdapterConfig
} from './system-event-adapter';

// System Event Factory - Factory pattern
export {
  SystemEventManagerFactory,
  createSystemEventManager,
  createCoreSystemEventManager,
  createApplicationCoordinatorEventManager,
  createErrorRecoveryEventManager,
  createComprehensiveSystemEventManager
} from './system-event-factory';

// Coordination Event Adapter - Main export
export {
  CoordinationEventAdapter,
  createCoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig,
  CoordinationEventHelpers,
  type CoordinationEventAdapterConfig
} from './coordination-event-adapter';

// Coordination Event Factory - Factory pattern
export {
  CoordinationEventManagerFactory,
  createCoordinationEventManager,
  createSwarmCoordinationEventManager,
  createAgentManagementEventManager,
  createTaskOrchestrationEventManager,
  createProtocolManagementEventManager,
  createComprehensiveCoordinationEventManager,
  createHighPerformanceCoordinationEventManager,
  createDevelopmentCoordinationEventManager
} from './coordination-event-factory';

// Type exports for convenience
export type {
  SystemLifecycleEvent,
  CoordinationEvent,
  EventPriority,
  EventProcessingStrategy
} from '../types';

export type {
  IEventManager,
  EventManagerConfig,
  EventManagerStatus,
  EventManagerMetrics,
  SystemEvent,
  EventSubscription,
  EventListener,
  EventFilter,
  EventTransform,
  EventBatch,
  EventEmissionOptions,
  EventQueryOptions
} from '../core/interfaces';

// Re-export UEL core for adapter integration
export {
  EventManagerTypes,
  EventTypeGuards,
  EventManagerPresets
} from '../core/interfaces';

export {
  EventCategories,
  DefaultEventManagerConfigs,
  EventPriorityMap,
  EventSources,
  UELTypeGuards,
  EventConstants
} from '../types';

/**
 * Adapter type registry for type-safe adapter creation
 */
export const EventAdapterTypes = {
  SYSTEM: 'system',
  COORDINATION: 'coordination'
} as const;

export type EventAdapterType = typeof EventAdapterTypes[keyof typeof EventAdapterTypes];

/**
 * Adapter factory registry for easy access to all adapter factories
 */
export const EventAdapterFactories = {
  [EventAdapterTypes.SYSTEM]: SystemEventManagerFactory,
  [EventAdapterTypes.COORDINATION]: CoordinationEventManagerFactory
} as const;

/**
 * Quick access functions for common adapter operations
 */
export const EventAdapterUtils = {
  /**
   * Create system event adapter with sensible defaults
   */
  createSystemAdapter: (name: string, overrides?: Partial<SystemEventAdapterConfig>) => {
    const config = createDefaultSystemEventAdapterConfig(name, overrides);
    return createSystemEventAdapter(config);
  },

  /**
   * Create coordination event adapter with sensible defaults
   */
  createCoordinationAdapter: (name: string, overrides?: Partial<CoordinationEventAdapterConfig>) => {
    const config = createDefaultCoordinationEventAdapterConfig(name, overrides);
    return createCoordinationEventAdapter(config);
  },

  /**
   * Create system event adapter factory
   */
  createSystemFactory: () => new SystemEventManagerFactory(),

  /**
   * Create coordination event adapter factory
   */
  createCoordinationFactory: () => new CoordinationEventManagerFactory(),

  /**
   * Get all available adapter types
   */
  getAdapterTypes: () => Object.values(EventAdapterTypes),

  /**
   * Check if adapter type is supported
   */
  isAdapterTypeSupported: (type: string): type is EventAdapterType => {
    return Object.values(EventAdapterTypes).includes(type as EventAdapterType);
  }
} as const;

// Default exports for convenience
export default {
  SystemEventAdapter,
  SystemEventManagerFactory,
  CoordinationEventAdapter,
  CoordinationEventManagerFactory,
  EventAdapterTypes,
  EventAdapterFactories,
  EventAdapterUtils,
  SystemEventHelpers,
  CoordinationEventHelpers
};