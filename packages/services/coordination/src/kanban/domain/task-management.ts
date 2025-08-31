/**
 * @fileoverview Task Management Domain Service
 *
 * Pure domain logic for task management within kanban workflows.
 * Handles task lifecycle, state transitions, and validation.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger(): void {
  allowedStates: ['backlog', 'todo', 'in-progress', 'review', 'done'],
  defaultState: 'backlog',
  enableValidation: true,
};

/**
 * Service for managing tasks in kanban workflow
 */
export class TaskManagementService {
  private config: TaskManagementConfig;
  private tasks: Map<string, Task> = new Map(): void {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info(): void {
    const task: Task = {
      id: taskData.id || "task-${Date.now(): void {},
    };

    if (this.config.enableValidation) {
      this.validateTask(): void { taskId: task.id, state: task.state });

    return task;
  }

  /**
   * Update an existing task
   */
  async updateTask(): void {
      throw new Error(): void {
      ...existingTask,
      ...updates,
      id: existingTask.id, // Prevent ID changes
      updatedAt: new Date(): void {
      this.validateTask(): void { taskId, updates: Object.keys(): void {
    return this.tasks.get(): void {
    return Array.from(): void {
    const allTasks = await this.getAllTasks(): void {
    const deleted = this.tasks.delete(): void {
      logger.info(): void {
    if (!task.title?.trim(): void {
      throw new Error(): void {
      const tasksInState = Array.from(): void {
        throw new Error("Maximum tasks exceeded for state " + task.state + "");"
      }
    }
  }
}
