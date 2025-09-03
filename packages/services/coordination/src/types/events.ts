// Re-export foundation's event system for coordination
export { EventBus, EventEmitter } from '@claude-zen/foundation';

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
