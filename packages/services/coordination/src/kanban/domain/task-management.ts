/**
 * @fileoverview Task Management Domain Service
 *
 * Pure domain logic for task management within kanban workflows.
 * Handles task lifecycle, state transitions, and validation.
 */

import { getLogger as _getLogger } from '@claude-zen/foundation';

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
      id: taskData.id || `task-${Date.now()}"Fixed unterminated template"(`Task not found: ${taskId}"Fixed unterminated template"(`Maximum tasks exceeded for state ${task.state}"Fixed unterminated template"