/**
 * UEL Event Adapters - Unified Exports.
 *
 * Provides unified exports for all UEL event adapters, following the same
 * patterns as UACL client adapters and USL service adapters.
 */
/**
 * @file Adapters module exports.
 */

// Type exports for convenience
export type {
  EventFilter,
  EventListener,
  EventManagerConfig,
  EventManagerMetrics,
  EventManagerStatus,
  EventPriority,
  EventProcessingStrategy,
  EventSubscription,
  EventTransform,
  EventManager,
  SystemEvent,
} from '../core/interfaces';

// Re-export UEL core for adapter integration
export {
  EventManagerPresets,
  EventManagerTypes,
  EventTypeGuards,
} from '../core/interfaces';

export type {
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

// Coordination Event Adapter - Main export
export {
  createCoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig,
  CoordinationEventAdapter,
  CoordinationEventHelpers,
} from './coordination';

export type {
  CoordinationEventAdapterConfig,
} from './coordination';

// Coordination Event Factory - Factory pattern
export {
  CoordinationEventFactory,
  createCoordinationEventFactory,
  createCoordinationAdapter,
  createSwarmCoordinationAdapter,
  createAgentManagementAdapter,
  createTaskOrchestrationAdapter,
  createProtocolManagementAdapter,
  createComprehensiveCoordinationAdapter,
  coordinationEventFactory,
} from './coordination-factory';

// Import classes for local use
import {
  createCoordinationEventAdapter,
  createDefaultCoordinationEventAdapterConfig,
  CoordinationEventAdapter,
  CoordinationEventHelpers,
} from './coordination';

import type {
  CoordinationEventAdapterConfig,
} from './coordination';

import {
  CoordinationEventFactory,
} from './coordination-factory';

/**
 * Adapter type registry for type-safe adapter creation.
 */
export const EventAdapterTypes = {
  COORDINATION: 'coordination',
} as const;

export type EventAdapterType =
  (typeof EventAdapterTypes)[keyof typeof EventAdapterTypes];

/**
 * Adapter factory registry for easy access to all adapter factories.
 */
export const EventAdapterFactories = {
  [EventAdapterTypes.COORDINATION]: CoordinationEventFactory,
} as const;

/**
 * Quick access functions for common adapter operations.
 */
export const EventAdapterUtils = {
  /**
   * Create coordination event adapter with sensible defaults.
   */
  createCoordinationAdapter: (
    name: string,
    overrides?: Partial<CoordinationEventAdapterConfig>
  ) => {
    const config = createDefaultCoordinationEventAdapterConfig(name, overrides);
    return createCoordinationEventAdapter(config);
  },

  /**
   * Create coordination event adapter factory.
   */
  createCoordinationFactory: () => new CoordinationEventFactory(),

  /**
   * Get all available adapter types.
   */
  getAdapterTypes: () => Object.values(EventAdapterTypes),

  /**
   * Check if adapter type is supported.
   */
  isAdapterTypeSupported: (type: string): type is EventAdapterType => Object.values(EventAdapterTypes).includes(type as EventAdapterType),
} as const;

// Default exports for convenience
export default {
  CoordinationEventAdapter,
  CoordinationEventFactory,
  EventAdapterTypes,
  EventAdapterFactories,
  EventAdapterUtils,
  CoordinationEventHelpers,
};