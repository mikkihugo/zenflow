/**
 * @fileoverview Task Management Domain Service
 *
 * Pure domain logic for task lifecycle management.
 * Handles task creation, state transitions, and business rules.
 *
 * **Responsibilities:**
 * - Task creation and validation
 * - State transition logic
 * - Business rule enforcement
 * - Task querying and filtering
 *
 * **Dependencies:**
 * - Foundation utilities for validation and logging
 * - Domain types for type safety
 * - Immutable utilities for safe state updates
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  KanbanOperationResult,
  TaskMovementResult,
  TaskState,
  WorkflowTask,
} from '../types/index';
import { ImmutableTaskUtils, ValidationUtils } from '../utilities/index';
const logger = getLogger('TaskManagement'');

/**
 * Task creation input interface
 */
export interface TaskCreationInput {
  title: string;
  description?: string;
  priority: critical'|'high'|'medium'|'low';
  estimatedEffort: number;
  assignedAgent?: string;
  dependencies?: string[];
  tags?: string[];
}

/**
 * Task Management Domain Service
 *
 * Handles all task lifecycle operations with pure domain logic.
 * No infrastructure concerns - focused on business rules.
 */
export class TaskManagementService {
  private readonly taskIndex = new Map<string, WorkflowTask>();

  constructor() {
    logger.info('TaskManagementService initialized'');
  }

  /**
   * Create a new workflow task with validation
   */
  async createTask(taskData: TaskCreationInput): Promise<KanbanOperationResult<WorkflowTask>> {
    const startTime = performance.now();

    try {
      // Validate input with domain rules
      const validationResult = ValidationUtils.validateTaskCreation(taskData);
      if (!validationResult.success) {
        throw new Error(
          `Invalid task data: ${validationResult.error.issues.map((i) => i.message).join(,')}`
        );
      }

      const validatedData = validationResult.data;

      // Create task with domain defaults
      const task: WorkflowTask = {
        id: this.generateTaskId(),
        title: validatedData.title,
        description: validatedData.description,
        state:'backlog,// Domain rule: all tasks start in backlog
        priority: validatedData.priority,
        assignedAgent: validatedData.assignedAgent,
        estimatedEffort: validatedData.estimatedEffort,
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: validatedData.dependencies,
        tags: validatedData.tags,
        metadata: {},
      };

      // Store in domain index
      this.taskIndex.set(task.id, task);

      logger.info(`Task created: ${task.id} - ${task.title}`);

      return {
        success: true,
        data: task,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to create task:,error');

      return {
        success: false,
        error: error instanceof Error ? error.message :'Unknown error,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update task state with business rule validation
   */
  async moveTask(
    taskId: string,
    toState: TaskState,
    reason?: string
  ): Promise<KanbanOperationResult<TaskMovementResult>> {
    try {
      const task = this.taskIndex.get(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const fromState = task.state;

      // Business rule: validate state transition
      if (!this.isValidStateTransition(fromState, toState)) {
        throw new Error(`Invalid state transition from ${fromState} to ${toState}`);
      }

      // Update task using immutable operations
      const updatedTask = ImmutableTaskUtils.updateTask(
        [task],
        taskId,
        (draft) => {
          draft.state = toState;
          draft.updatedAt = new Date();

          // Business rules for specific states
          if (toState ==='development '&& !draft.startedAt) {
            draft.startedAt = new Date();
          }
          if (toState ==='done){
            draft.completedAt = new Date();
          }
          if (toState ==='blocked){
            draft.blockedAt = new Date();
            draft.blockingReason = reason;
          }
        }
      )[0];

      // Update domain index
      this.taskIndex.set(taskId, updatedTask);

      const result: TaskMovementResult = {
        success: true,
        taskId,
        fromState,
        toState,
        timestamp: new Date(),
      };

      logger.info(`Task moved: ${taskId} from ${fromState} to ${toState}`);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to move task:,error');

      return {
        success: false,
        error: error instanceof Error ? error.message :'Unknown error,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<WorkflowTask| null> {
    return this.taskIndex.get(taskId)|| null;
  }

  /**
   * Get tasks by state
   */
  async getTasksByState(state: TaskState): Promise<WorkflowTask[]> {
    const tasks: WorkflowTask[] = [];
    for (const task of this.taskIndex.values()) {
      if (task.state === state) {
        tasks.push(task);
      }
    }
    return tasks;
  }

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<WorkflowTask[]> {
    return Array.from(this.taskIndex.values();
  }

  /**
   * Get tasks by priority
   */
  async getTasksByPriority(priority:  WorkflowTask[priority']): Promise<WorkflowTask[]> {
    const tasks: WorkflowTask[] = [];
    for (const task of this.taskIndex.values()) {
      if (task.priority === priority) {
        tasks.push(task);
      }
    }
    return tasks;
  }

  /**
   * Get tasks by assignee
   */
  async getTasksByAssignee(assignedAgent: string): Promise<WorkflowTask[]> {
    const tasks: WorkflowTask[] = [];
    for (const task of this.taskIndex.values()) {
      if (task.assignedAgent === assignedAgent) {
        tasks.push(task);
      }
    }
    return tasks;
  }

  // =============================================================================
  // PRIVATE DOMAIN LOGIC
  // =============================================================================

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidStateTransition(fromState: TaskState, toState: TaskState): boolean {
    // Domain business rules for valid transitions
    const validTransitions: Record<TaskState, TaskState[]> = {
      backlog: ['analysis,'blocked'],
      analysis: ['development,'backlog,'blocked'],
      development: ['testing,'analysis,'blocked'],
      testing: ['review,'development,'blocked'],
      review: ['deployment,'testing,'blocked'],
      deployment: ['done,'review,'blocked'],
      done: [], // Terminal state
      blocked: ['backlog,'analysis,'development,'testing,'review,'deployment'],
      expedite: ['development,'testing,'review,'deployment,'done'], // Can skip to any active state
    };

    const allowedStates = validTransitions[fromState]|| [];
    return allowedStates.includes(toState);
  }
}