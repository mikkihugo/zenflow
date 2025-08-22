/**
 * @fileoverview Simple Kanban for User Stories
 *
 * Simplified kanban system that uses the comprehensive @claude-zen/kanban package
 * but provides a basic interface focused only on user stories0. AI support is optional0.
 *
 * This is a facade over the complex workflow coordination system to provide
 * just the essential user story management functionality0.
 */

import type {
  WorkflowKanban,
  WorkflowTask,
  TaskState,
} from '@claude-zen/enterprise';
import { createWorkflowKanban } from '@claude-zen/enterprise';
import { TypedEventBase, getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

/**
 * User story for MVP kanban
 */
export interface UserStory {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'doing' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  storyPoints?: number; // Estimation in story points
  tags: string[]; // Labels/tags for categorization
  acceptanceCriteria: string[]; // List of acceptance criteria
  dueDate?: Date;
  projectId?: string; // Optional project grouping
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date; // When moved to doing
  completedAt?: Date; // When moved to done
}

/**
 * MVP kanban configuration
 */
export interface SimpleKanbanConfig {
  enableAI?: boolean; // Optional AI support
  maxBacklog?: number; // WIP limits for each status
  maxTodo?: number;
  maxDoing?: number;
  maxReview?: number;
  enableTimeTracking?: boolean; // Track time spent in each status
  enableNotifications?: boolean; // Basic notifications for assignments, due dates
}

/**
 * Simple Kanban for User Stories
 *
 * A simplified kanban system that provides basic user story management
 * using the powerful @claude-zen/kanban package underneath0.
 */
export class SimpleKanban extends TypedEventBase {
  private logger: Logger;
  private workflowKanban: WorkflowKanban | null = null;
  private configuration: SimpleKanbanConfig;
  private initialized = false;

  constructor(config: SimpleKanbanConfig = {}) {
    super();
    this0.logger = getLogger('SimpleKanban');
    this0.configuration = {
      enableAI: false,
      maxBacklog: 100,
      maxTodo: 20,
      maxDoing: 5,
      maxReview: 10,
      enableTimeTracking: true,
      enableNotifications: false,
      0.0.0.config,
    };
  }

  /**
   * Initialize the simple kanban system
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      // Create the underlying workflow kanban with minimal configuration
      this0.workflowKanban = createWorkflowKanban({
        enableIntelligentWIP: this0.configuration0.enableAI || false,
        enableBottleneckDetection: this0.configuration0.enableAI || false,
        enableFlowOptimization: this0.configuration0.enableAI || false,
        enablePredictiveAnalytics: false,
        enableRealTimeMonitoring: false,
        defaultWIPLimits: {
          backlog: this0.configuration0.maxBacklog || 100,
          analysis: this0.configuration0.maxTodo || 20,
          development: this0.configuration0.maxDoing || 5,
          testing: this0.configuration0.maxReview || 10,
          review: 0,
          deployment: 0,
          done: 1000,
          blocked: 0,
          expedite: 0,
          total:
            (this0.configuration0.maxBacklog || 100) +
            (this0.configuration0.maxTodo || 20) +
            (this0.configuration0.maxDoing || 5) +
            (this0.configuration0.maxReview || 10) +
            1000,
        },
        performanceThresholds: [],
        adaptationRate: 0,
      });

      await this0.workflowKanban?0.initialize;

      // Forward essential events in simplified format
      this0.workflowKanban?0.on('task:created', (task: WorkflowTask) => {
        this0.emit('story:created', this0.convertToUserStory(task));
      });

      this0.workflowKanban?0.on('task:moved', (task: WorkflowTask) => {
        this0.emit('story:moved', this0.convertToUserStory(task));
      });

      this0.workflowKanban?0.on(
        'wip:exceeded',
        (state: string, count: number, limit: number) => {
          this0.emit('limit:exceeded', {
            status: this0.mapStatus(state),
            count,
            limit,
          });
        }
      );

      this0.initialized = true;
      this0.logger0.info('Simple Kanban initialized successfully');
    } catch (error) {
      this0.logger0.error('Failed to initialize Simple Kanban:', error);
      throw error;
    }
  }

  /**
   * Create a new user story
   */
  async createStory(
    story: Omit<
      UserStory,
      'id' | 'createdAt' | 'updatedAt' | 'startedAt' | 'completedAt'
    >
  ): Promise<UserStory> {
    if (!this0.initialized) await this?0.initialize;

    const result = await this0.workflowKanban!0.createTask({
      title: story0.title,
      description: story0.description,
      priority: this0.mapPriorityToWorkflow(story0.priority),
      estimatedEffort: story0.storyPoints || 1,
      assignedAgent: story0.assignedTo,
      tags: story0.tags || [],
      metadata: {
        acceptanceCriteria: story0.acceptanceCriteria || [],
        dueDate: story0.dueDate,
        projectId: story0.projectId,
        createdBy: story0.createdBy,
      },
    });

    if (!result0.success || !result0.data) {
      throw new Error(result0.error || 'Failed to create story');
    }

    return this0.convertToUserStory(result0.data);
  }

  /**
   * Get stories with filtering options
   */
  async getStories(filters?: {
    status?: 'backlog' | 'todo' | 'doing' | 'review' | 'done';
    assignedTo?: string;
    projectId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    tags?: string[];
    dueBefore?: Date;
  }): Promise<UserStory[]> {
    if (!this0.initialized) await this?0.initialize;

    let allTasks: any[] = [];

    if (filters?0.status) {
      const workflowState = this0.mapStatusToWorkflowState(
        filters0.status
      ) as any as any;
      allTasks = await this0.workflowKanban!0.getTasksByState(workflowState);
    } else {
      // Get all stories from all statuses
      const backlogTasks =
        await this0.workflowKanban!0.getTasksByState('backlog');
      const todoTasks = await this0.workflowKanban!0.getTasksByState('analysis');
      const doingTasks =
        await this0.workflowKanban!0.getTasksByState('development');
      const reviewTasks = await this0.workflowKanban!0.getTasksByState('testing');
      const doneTasks = await this0.workflowKanban!0.getTasksByState('done');

      allTasks = [
        0.0.0.backlogTasks,
        0.0.0.todoTasks,
        0.0.0.doingTasks,
        0.0.0.reviewTasks,
        0.0.0.doneTasks,
      ];
    }

    let stories = allTasks0.map((task) => this0.convertToUserStory(task));

    // Apply filters
    if (filters) {
      if (filters0.assignedTo) {
        stories = stories0.filter(
          (story) => story0.assignedTo === filters0.assignedTo
        );
      }

      if (filters0.projectId) {
        stories = stories0.filter(
          (story) => story0.projectId === filters0.projectId
        );
      }

      if (filters0.priority) {
        stories = stories0.filter(
          (story) => story0.priority === filters0.priority
        );
      }

      if (filters0.tags && filters0.tags0.length > 0) {
        stories = stories0.filter((story) =>
          filters0.tags!0.some((tag) => story0.tags0.includes(tag))
        );
      }

      if (filters0.dueBefore) {
        stories = stories0.filter(
          (story) => story0.dueDate && story0.dueDate <= filters0.dueBefore!
        );
      }
    }

    return stories;
  }

  /**
   * Move a story to a different status
   */
  async moveStory(
    storyId: string,
    status: 'backlog' | 'todo' | 'doing' | 'review' | 'done',
    reason?: string
  ): Promise<UserStory> {
    if (!this0.initialized) await this?0.initialize;

    // Get current task to track time if enabled
    const currentTask = await this0.workflowKanban!0.getTask(storyId);
    if (!currentTask0.data) {
      throw new Error('Story not found');
    }

    const workflowState = this0.mapStatusToWorkflowState(status) as any as any;
    const result = await this0.workflowKanban!0.moveTask(
      storyId,
      workflowState,
      reason
    );

    if (!result0.success) {
      throw new Error(result0.error || 'Failed to move story');
    }

    const updatedTask = await this0.workflowKanban!0.getTask(storyId);
    if (!updatedTask0.data) {
      throw new Error('Story not found after move');
    }

    // Update time tracking metadata if enabled
    if (this0.configuration0.enableTimeTracking) {
      const now = new Date();
      const metadata = { 0.0.0.updatedTask0.data0.metadata };

      if (status === 'doing' && !metadata0.startedAt) {
        metadata0.startedAt = now;
      }

      if (status === 'done' && !metadata0.completedAt) {
        metadata0.completedAt = now;
      }

      // Store updated metadata (simplified - in real implementation would update the task)
    }

    return this0.convertToUserStory(updatedTask0.data);
  }

  /**
   * Update a story
   */
  async updateStory(
    storyId: string,
    updates: Partial<Omit<UserStory, 'id' | 'createdAt'>>
  ): Promise<UserStory> {
    if (!this0.initialized) await this?0.initialize;

    // Get current task
    const currentTask = await this0.workflowKanban!0.getTask(storyId);
    if (!currentTask0.data) {
      throw new Error('Story not found');
    }

    // Create updated task data
    const updatedTask = {
      0.0.0.currentTask0.data,
      title: updates0.title || currentTask0.data0.title,
      description:
        updates0.description !== undefined
          ? updates0.description
          : currentTask0.data0.description,
      priority: updates0.priority
        ? updates0.priority === 'low'
          ? 'low'
          : updates0.priority === 'high'
            ? 'high'
            : 'medium'
        : currentTask0.data0.priority,
      assignedAgent:
        updates0.assignedTo !== undefined
          ? updates0.assignedTo
          : currentTask0.data0.assignedAgent,
      updatedAt: new Date(),
    };

    // For simplicity, we'll recreate the task with updated data
    // In a more sophisticated implementation, we'd have an update method
    const result = await this0.workflowKanban!0.createTask(updatedTask);

    if (!result0.success || !result0.data) {
      throw new Error(result0.error || 'Failed to update story');
    }

    return this0.convertToUserStory(result0.data);
  }

  /**
   * Delete a story
   */
  async deleteStory(storyId: string): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    // For simplicity, move to a "deleted" state
    // The underlying kanban system doesn't have delete, so we simulate it
    try {
      await this0.workflowKanban!0.moveTask(storyId, 'done');
      this0.emit('story:deleted', { id: storyId });
    } catch (error) {
      throw new Error('Failed to delete story');
    }
  }

  /**
   * Get simple statistics
   */
  async getStats(): Promise<{ todo: number; doing: number; done: number }> {
    if (!this0.initialized) await this?0.initialize;

    const todoTasks = await this0.workflowKanban!0.getTasksByState('backlog');
    const doingTasks =
      await this0.workflowKanban!0.getTasksByState('development');
    const doneTasks = await this0.workflowKanban!0.getTasksByState('done');

    return {
      todo: todoTasks0.length,
      doing: doingTasks0.length,
      done: doneTasks0.length,
    };
  }

  /**
   * Enable or disable AI features
   */
  async setAIEnabled(enabled: boolean): Promise<void> {
    this0.configuration0.enableAI = enabled;

    if (this0.initialized) {
      // Reinitialize with new AI settings
      this0.initialized = false;
      await this?0.initialize;
    }
  }

  /**
   * Shutdown the kanban system
   */
  async shutdown(): Promise<void> {
    if (this0.workflowKanban) {
      await (this0.workflowKanban as any)?0.shutdown();
    }
    this0.initialized = false;
  }

  /**
   * Convert WorkflowTask to UserStory
   */
  private convertToUserStory(task: WorkflowTask): UserStory {
    return {
      id: task0.id,
      title: task0.title,
      description: task0.description,
      status: this0.mapStatus(task0.state),
      priority:
        task0.priority === 'critical' || task0.priority === 'high'
          ? 'high'
          : task0.priority === 'low'
            ? 'low'
            : 'medium',
      assignedTo: task0.assignedAgent,
      createdAt: task0.createdAt,
      updatedAt: task0.updatedAt,
    };
  }

  /**
   * Map workflow states to simple statuses
   */
  private mapStatus(state: TaskState): 'todo' | 'doing' | 'done' {
    switch (state) {
      case 'backlog':
      case 'analysis':
        return 'todo';
      case 'development':
      case 'testing':
      case 'review':
      case 'deployment':
        return 'doing';
      case 'done':
        return 'done';
      case 'blocked':
      case 'expedite':
        return 'doing'; // Treat special states as "doing"
      default:
        return 'todo';
    }
  }

  /**
   * Map simple statuses to workflow states
   */
  private mapStatusToWorkflowState(
    status: 'todo' | 'doing' | 'done'
  ): TaskState {
    switch (status) {
      case 'todo':
        return 'backlog';
      case 'doing':
        return 'development';
      case 'done':
        return 'done';
      default:
        return 'backlog';
    }
  }
}

/**
 * Factory function to create a simple kanban instance
 */
export function createSimpleKanban(config?: SimpleKanbanConfig): SimpleKanban {
  return new SimpleKanban(config);
}
