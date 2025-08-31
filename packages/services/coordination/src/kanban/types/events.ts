/**
 * @fileoverview Kanban Events Type Definitions
 *
 * Type definitions for Kanban-related events and event payloads.
 */

/**
 * Base event interface
 */
export interface BaseEvent {
  id: string;
  timestamp: number;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Task events
 */
export interface TaskCreatedEvent extends BaseEvent {
  type: 'task:created';
  payload: {
    taskId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    columnId: string;
  };
}

export interface TaskUpdatedEvent extends BaseEvent {
  type: 'task:updated';
  payload: {
    taskId: string;
    changes: Record<string, any>;
    previousValues: Record<string, any>;
  };
}

export interface TaskMovedEvent extends BaseEvent {
  type: 'task:moved';
  payload: {
    taskId: string;
    fromColumnId: string;
    toColumnId: string;
    newPosition: number;
  };
}

export interface TaskDeletedEvent extends BaseEvent {
  type: 'task:deleted';
  payload: {
    taskId: string;
    columnId: string;
  };
}

/**
 * Column events
 */
export interface ColumnCreatedEvent extends BaseEvent {
  type: 'column:created';
  payload: {
    columnId: string;
    title: string;
    position: number;
    wipLimit?: number;
  };
}

export interface ColumnUpdatedEvent extends BaseEvent {
  type: 'column:updated';
  payload: {
    columnId: string;
    changes: Record<string, any>;
  };
}

export interface ColumnDeletedEvent extends BaseEvent {
  type: 'column:deleted';
  payload: {
    columnId: string;
  };
}

/**
 * Board events
 */
export interface BoardCreatedEvent extends BaseEvent {
  type: 'board:created';
  payload: {
    boardId: string;
    title: string;
    description?: string;
  };
}

export interface BoardUpdatedEvent extends BaseEvent {
  type: 'board:updated';
  payload: {
    boardId: string;
    changes: Record<string, any>;
  };
}

/**
 * Performance events
 */
export interface PerformanceEvent extends BaseEvent {
  type: 'performance:metric';
  payload: {
    metricName: string;
    value: number;
    unit: string;
    tags?: Record<string, string>;
  };
}

/**
 * Union type for all Kanban events
 */
export type KanbanEvent =
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskMovedEvent
  | TaskDeletedEvent
  | ColumnCreatedEvent
  | ColumnUpdatedEvent
  | ColumnDeletedEvent
  | BoardCreatedEvent
  | BoardUpdatedEvent
  | PerformanceEvent;

/**
 * Event handler function type
 */
export type EventHandler<T extends BaseEvent = BaseEvent> = (event: T) => void | Promise<void>;

/**
 * Event listener configuration
 */
export interface EventListenerConfig {
  eventType: string;
  handler: EventHandler;
  once?: boolean;
  priority?: number;
}