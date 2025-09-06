// Foundation unified event system
export { EventBus, EventEmitter } from '@claude-zen/foundation';
export {
  BRAIN_COORDINATION_EVENT_CATALOG,
  DOCUMENT_IMPORT_COORDINATION_EVENT_CATALOG,
  type BrainCoordinationEventMap,
  type DocumentImportCoordinationEventMap,
  type BrainSafeWorkflowSupportEvent,
  type BrainSparcPhaseReadyEvent,
  type BrainExistingProjectWorkflowRequestEvent,
  type CoordinationWorkflowApprovedEvent,
  type CoordinationPriorityEscalatedEvent,
  type CoordinationResourceAllocatedEvent,
  type DocumentIntelligenceImportCompleteEvent,
  type DocumentIntelligenceImportIntegrationReadyEvent,
  type DocumentIntelligenceImportErrorEscalatedEvent,
  type CoordinationImportApprovedEvent,
  type CoordinationImportWorkflowAssignedEvent,
  type CoordinationImportContextProvidedEvent
} from '@claude-zen/foundation/events';

// Simple event type definitions for coordination domains
export type CoordinationEventType = 
  | 'safe:agent-registered'
  | 'safe:pi-planning-requested'
  | 'taskmaster:approval-requested'
  | 'taskmaster:task-submitted'
  | 'teamwork:collaboration-requested'
  | 'kanban:optimization-requested'
  | 'kanban:board:created'
  | 'kanban:board:updated'  
  | 'kanban:column:created'
  | 'kanban:column:moved'
  | 'kanban:card:created'
  | 'kanban:card:moved'
  | 'kanban:card:updated'
  | 'kanban:card:completed'
  | 'kanban:workflow:optimized'
  | 'kanban:metrics:calculated'
  | 'sparc:phase-coordination-requested'
  | 'sparc:specification:started'
  | 'sparc:specification:complete'
  | 'sparc:pseudocode:started'
  | 'sparc:pseudocode:complete'
  | 'sparc:architecture:started'
  | 'sparc:architecture:complete'
  | 'sparc:refinement:started'
  | 'sparc:refinement:complete'
  | 'sparc:completion:started'
  | 'sparc:completion:complete'
  | 'sparc:workflow:phase-transition'
  | 'sparc:workflow:complete'
  | 'workflow:execution-started'
  | 'orchestration:coordination-requested'
  | 'assessment:completed'
  | 'state-machine:transition';

// Event handler type using foundation's EventBus
export type CoordinationEventHandler = (eventType: CoordinationEventType, payload: unknown) => void | Promise<void>;
