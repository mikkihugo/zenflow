/**
 * @fileoverview Task Management Domain Service
 *
 * Pure domain logic for task management within kanban workflows.
 * Handles task lifecycle, state transitions, and validation.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('TaskManagement');

/**
 * Task management configuration
 */
export interface TaskManagementConfig {
  allowedStates: string[];
  defaultState: string;
  enableValidation: boolean;
  maxTasksPerState?: number;
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  state: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

const DEFAULT_CONFIG: TaskManagementConfig = {
  allowedStates: ['backlog', 'todo', 'in-progress', 'review', 'done'],
  defaultState: 'backlog',
  enableValidation: true,
};

/**
 * Service for managing tasks in kanban workflow
 */
export class TaskManagementService {
  private config: TaskManagementConfig;
  private tasks: Map<string, Task> = new Map();

  constructor(config: Partial<TaskManagementConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('TaskManagementService initialized', this.config);
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Partial<Task>): Promise<Task> {
    const task: Task = {
      id: taskData.id || `task-${Date.now()}`,
      title: taskData.title || 'Untitled Task',
      description: taskData.description,
      state: taskData.state || this.config.defaultState,
      assignee: taskData.assignee,
      priority: taskData.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: taskData.dueDate,
      tags: taskData.tags || [],
      metadata: taskData.metadata || {},
    };

    if (this.config.enableValidation) {
      this.validateTask(task);
    }

    this.tasks.set(task.id, task);
    logger.info('Task created', { taskId: task.id, state: task.state });

    return task;
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const existingTask = this.tasks.get(taskId);
    if (!existingTask) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      id: existingTask.id, // Prevent ID changes
      updatedAt: new Date(),
    };

    if (this.config.enableValidation) {
      this.validateTask(updatedTask);
    }

    this.tasks.set(taskId, updatedTask);
    logger.info('Task updated', { taskId, updates: Object.keys(updates) });

    return updatedTask;
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by state
   */
  async getTasksByState(state: string): Promise<Task[]> {
    const allTasks = await this.getAllTasks();
    return allTasks.filter((task) => task.state === state);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const deleted = this.tasks.delete(taskId);
    if (deleted) {
      logger.info('Task deleted', { taskId });
    }
    return deleted;
  }

  private validateTask(task: Task): void {
    if (!task.title?.trim()) {
      throw new Error('Task title is required');
    }

    if (!this.config.allowedStates.includes(task.state)) {
      throw new Error(
        `Invalid task state: ${task.state}. Allowed states: ${this.config.allowedStates.join(', ')}`
      );
    }

    if (this.config.maxTasksPerState) {
      const tasksInState = Array.from(this.tasks.values()).filter(
        (t) => t.state === task.state
      );
      if (tasksInState.length >= this.config.maxTasksPerState) {
        throw new Error(`Maximum tasks exceeded for state ${task.state}`);
      }
    }
  }
}
