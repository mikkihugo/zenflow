/**
 * @fileoverview Coordination Events
 * 
 * Event system integration for coordination agents.
 */

// Event definitions
export type {
  CoordinationEvent,
  CoordinationEventType,
  QueenSpawnedEvent,
  QueenShutdownEvent,
  CommanderSpawnedEvent,
  CrossSwarmCoordinationEvent,
  CommanderInitializedEvent,
  MatronSpawnedEvent,
  TacticalOperationEvent,
  MatronInitializedEvent,
  DomainCoordinationEvent,
  CrossDomainCoordinationEvent,
  OperationCompletedEvent,
  DecisionMadeEvent,
  ObjectiveCreatedEvent,
  ObjectiveCompletedEvent,
  CoordinationSystemStartedEvent,
  CoordinationSystemShutdownEvent,
  PerformanceMetricsEvent
} from './coordination-events';

// Event bus
export { CoordinationEventBus } from './coordination-event-bus';