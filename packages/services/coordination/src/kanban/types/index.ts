/**
 * @fileoverview Kanban Types Index
 *
 * Main export file for all Kanban-related type definitions.
 */

// Export event types
export * from './events';

/**
 * Task priority levels for workflow coordination
 */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Flow direction for task movement
 */
export type FlowDirection = 'forward' | 'backward';

/**
 * Task state enumeration
 */
export type TaskState = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'archived';

/**
 * Column type for Kanban boards
 */
export type ColumnType = 'input' | 'process' | 'output' | 'buffer';

/**
 * WIP (Work In Progress) limits configuration
 */
export interface WIPLimits {
  [columnId: string]: {
    min?: number;
    max: number;
    warn?: number;
  };
}

/**
 * Workflow bottleneck detection
 */
export interface WorkflowBottleneck {
  columnId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  taskCount: number;
  maxCapacity: number;
  avgProcessingTime?: number;
  recommendations?: string[];
}

/**
 * Kanban configuration for workflows
 */
export interface WorkflowKanbanConfig {
  enableWIPLimits: boolean;
  enableBottleneckDetection: boolean;
  enableAutomatedMovement: boolean;
  wipLimits: WIPLimits;
  defaultTaskPriority: TaskPriority;
}

/**
 * Workflow task definition
 */
export interface WorkflowTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  state: TaskState;
  assigneeId?: string;
  columnId: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}