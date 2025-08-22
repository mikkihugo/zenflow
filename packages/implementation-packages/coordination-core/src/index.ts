/**
 * @fileoverview Coordination Core
 *
 * Strategic multi-swarm coordination system with clean, minimal dependencies.
 */

// Core agents
export { QueenCoordinator, SwarmCommander, Matron } from './agents';

export type {
  QueenConfig,
  CommanderConfig,
  MatronConfig,
  MatronCoordinationRequest,
} from './agents';

// Events
export { CoordinationEventBus } from './events';
export type {
  CoordinationEvent,
  CoordinationEventType,
  QueenSpawnedEvent,
  CommanderSpawnedEvent,
  MatronInitializedEvent,
  DomainCoordinationEvent,
  CrossDomainCoordinationEvent,
  DecisionMadeEvent,
} from './events';

// Types
export type {
  CoordinationRole,
  MatronDomain,
  CoordinationAgent,
  StrategicObjective,
  CoordinationDecision,
  CoordinationConfig,
  CoordinationMetrics,
} from './types';
