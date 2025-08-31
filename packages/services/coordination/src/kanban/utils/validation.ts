/**
 * @fileoverview Kanban Validation Utilities
 *
 * Validation functions for Kanban entities and operations.
 */

import { TaskPriority, TaskState } from '../types';

/**
 * Validate task ID format
 */
export function isValidTaskId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * Validate task priority
 */
export function isValidPriority(priority: any): priority is TaskPriority {
  return ['critical', 'high', 'medium', 'low'].includes(priority);
}

/**
 * Validate task state
 */
export function isValidState(state: any): state is TaskState {
  return ['backlog', 'todo', 'in-progress', 'review', 'done', 'archived'].includes(state);
}

/**
 * Validate task title
 */
export function isValidTitle(title: string): boolean {
  return typeof title === 'string' && title.trim().length > 0 && title.length <= 200;
}

/**
 * Validate WIP limit
 */
export function isValidWIPLimit(limit: number): boolean {
  return typeof limit === 'number' && limit > 0 && Number.isInteger(limit);
}

/**
 * Validate column ID
 */
export function isValidColumnId(columnId: string): boolean {
  return typeof columnId === 'string' && columnId.length > 0;
}

/**
 * Validate task data structure
 */
export function validateTaskData(task: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidTaskId(task.id)) {
    errors.push('Invalid task ID');
  }

  if (!isValidTitle(task.title)) {
    errors.push('Invalid task title');
  }

  if (task.priority && !isValidPriority(task.priority)) {
    errors.push('Invalid task priority');
  }

  if (task.state && !isValidState(task.state)) {
    errors.push('Invalid task state');
  }

  if (task.columnId && !isValidColumnId(task.columnId)) {
    errors.push('Invalid column ID');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}