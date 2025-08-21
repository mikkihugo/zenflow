/**
 * @fileoverview Project Kanban Service - SAFe-Compatible User Story Management
 * 
 * Extends the comprehensive @claude-zen/kanban package to provide project-specific
 * user story management following SAFe document patterns. Features are configurable
 * through the ProjectModeManager system.
 * 
 * Follows Google TypeScript conventions and facade pattern.
 * Compatible across Kanban → Agile → SAFe modes with progressive enhancement.
 * 
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 1.0.0
 */

import { EventEmitter } from 'node:events';
import type { WorkflowKanban, WorkflowTask, TaskState } from '@claude-zen/kanban';
import { createWorkflowKanban } from '@claude-zen/kanban';
import { BaseDocumentService, type ValidationResult, type QueryFilters, type QueryResult } from '../document/base-document-service';
import type { StoryEntity } from '../../entities/document-entities';
import { getLogger } from '../../config/logging-config';
import type { Logger } from '@claude-zen/foundation';
import { nanoid } from 'nanoid';

// ============================================================================
// PROJECT KANBAN INTERFACES - SAFe Compatible
// ============================================================================

/**
 * Project User Story - SAFe compatible with progressive enhancement
 */
export interface ProjectUserStory {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: 'backlog' | 'ready' | 'in_progress' | 'review' | 'done';
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly storyType: 'user_story' | 'enabler_story';
  readonly storyPoints?: number;
  readonly businessValue?: number;
  readonly assignedTo?: string;
  readonly assignedTeam?: string;
  readonly acceptanceCriteria: string[];
  readonly tags: string[];
  readonly dependencies: string[];
  readonly dueDate?: Date;
  readonly projectId?: string;
  readonly featureId?: string; // Parent feature (SAFe)
  readonly epicId?: string; // Parent epic (SAFe)
  readonly persona?: string; // For user stories
  readonly enablerType?: 'infrastructure' | 'architectural' | 'exploration' | 'compliance';
  readonly swimlane?: string; // Visual organization by type/team/priority
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * Story creation options - follows SAFe story service pattern
 */
export interface StoryCreateOptions {
  title: string;
  description?: string;
  storyType?: 'user_story' | 'enabler_story';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints?: number;
  businessValue?: number;
  assignedTo?: string;
  assignedTeam?: string;
  acceptanceCriteria?: string[];
  tags?: string[];
  dependencies?: string[];
  dueDate?: Date;
  projectId?: string;
  featureId?: string;
  epicId?: string;
  persona?: string;
  enablerType?: 'infrastructure' | 'architectural' | 'exploration' | 'compliance';
  swimlane?: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

/**
 * Project Kanban configuration - integrated with project mode system
 */
export interface ProjectKanbanConfig {
  // Feature toggles from project mode
  enableAdvancedFeatures?: boolean; // Controlled by project mode
  enableSAFeIntegration?: boolean; // SAFe mode features
  enableAIOptimization?: boolean; // AI/AGI enhancements
  enableSwimlanes?: boolean; // Visual organization toggle
  
  // WIP limits per column
  maxBacklog?: number;
  maxReady?: number;
  maxInProgress?: number;
  maxReview?: number;
  
  // Advanced features
  enableTimeTracking?: boolean;
  enableNotifications?: boolean;
  enableFlowMetrics?: boolean;
  enableBottleneckDetection?: boolean;
  
  // Swimlane configuration (when enabled)
  swimlaneTypes?: ('team' | 'priority' | 'story_type' | 'custom')[];
  customSwimlanes?: string[];
  
  // Project context
  projectId?: string;
  mode: 'kanban' | 'agile' | 'safe';
}

/**
 * Story query filters - extends base query filters
 */
export interface StoryQueryFilters extends QueryFilters {
  status?: ProjectUserStory['status'];
  storyType?: ProjectUserStory['storyType'];
  priority?: ProjectUserStory['priority'];
  assignedTo?: string;
  assignedTeam?: string;
  projectId?: string;
  featureId?: string;
  epicId?: string;
  tags?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
  storyPointsMin?: number;
  storyPointsMax?: number;
  swimlane?: string;
}

// ============================================================================
// PROJECT KANBAN SERVICE
// ============================================================================

/**
 * Project Kanban Service - SAFe-Compatible User Story Management
 * 
 * Provides project-specific kanban functionality using the comprehensive
 * @claude-zen/kanban package. Features are progressively enhanced based
 * on project mode configuration.
 */
export class ProjectKanbanService extends EventEmitter {
  private logger: Logger;
  private workflowKanban: WorkflowKanban | null = null;
  private config: ProjectKanbanConfig;
  private initialized = false;

  constructor(config: ProjectKanbanConfig) {
    super();
    this.logger = getLogger('ProjectKanbanService');
    this.config = {
      enableAdvancedFeatures: false,
      enableSAFeIntegration: false,
      enableAIOptimization: false,
      maxBacklog: 100,
      maxReady: 20,
      maxInProgress: 5,
      maxReview: 10,
      enableTimeTracking: true,
      enableNotifications: false,
      enableFlowMetrics: false,
      enableBottleneckDetection: false,
      mode: 'kanban',
      ...config
    };
  }

  // ========================================================================
  // INITIALIZATION & LIFECYCLE
  // ========================================================================

  /**
   * Initialize the project kanban system with mode-specific features
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Configure workflow kanban based on project mode and features
      this.workflowKanban = createWorkflowKanban({
        enableIntelligentWIP: this.config.enableAIOptimization || false,
        enableBottleneckDetection: this.config.enableBottleneckDetection || false,
        enableFlowOptimization: this.config.enableAdvancedFeatures || false,
        enablePredictiveAnalytics: this.config.enableAIOptimization || false,
        enableRealTimeMonitoring: this.config.enableAdvancedFeatures || false,
        defaultWIPLimits: {
          backlog: this.config.maxBacklog || 100,
          analysis: this.config.maxReady || 20,
          development: this.config.maxInProgress || 5,
          testing: this.config.maxReview || 10,
          review: 0,
          deployment: 0,
          done: 1000,
          blocked: 0,
          expedite: 0,
          total: (this.config.maxBacklog || 100) + (this.config.maxReady || 20) + 
                 (this.config.maxInProgress || 5) + (this.config.maxReview || 10) + 1000
        },
        performanceThresholds: this.config.enableFlowMetrics ? [
          { metric: 'throughput', operator: 'lt', value: 1, severity: 'high', alertMessage: 'Low throughput detected', enabled: true },
          { metric: 'cycleTime', operator: 'gt', value: 168, severity: 'medium', alertMessage: 'Cycle time exceeds 1 week', enabled: true }
        ] : [],
        adaptationRate: this.config.enableAIOptimization ? 0.1 : 0
      });

      await this.workflowKanban.initialize();

      // Set up event forwarding with SAFe-compatible event names
      this.workflowKanban.on('task:created', (task: WorkflowTask) => {
        const story = this.convertToProjectStory(task);
        this.emit('story:created', story);
        if (this.config.enableSAFeIntegration) {
          this.emit('safe:story:created', story);
        }
      });

      this.workflowKanban.on('task:moved', (task: WorkflowTask) => {
        const story = this.convertToProjectStory(task);
        this.emit('story:status_changed', story);
        if (this.config.enableSAFeIntegration) {
          this.emit('safe:story:moved', story);
        }
      });

      this.workflowKanban.on('wip:exceeded', (state: string, count: number, limit: number) => {
        this.emit('wip:limit_exceeded', { status: this.mapStatusFromWorkflow(state), count, limit });
      });

      if (this.config.enableAdvancedFeatures) {
        this.workflowKanban.on('bottleneck:detected', (bottleneck: any) => {
          this.emit('flow:bottleneck_detected', bottleneck);
        });

        this.workflowKanban.on('health:critical', (health: number) => {
          this.emit('system:health_critical', { health, projectId: this.config.projectId });
        });
      }

      this.initialized = true;
      this.logger.info('Project Kanban Service initialized successfully', {
        mode: this.config.mode,
        advancedFeatures: this.config.enableAdvancedFeatures,
        safeIntegration: this.config.enableSAFeIntegration,
        aiOptimization: this.config.enableAIOptimization
      });

    } catch (error) {
      this.logger.error('Failed to initialize Project Kanban Service:', error);
      throw error;
    }
  }

  /**
   * Shutdown the kanban system gracefully
   */
  async shutdown(): Promise<void> {
    if (this.workflowKanban) {
      await this.workflowKanban.shutdown();
    }
    this.initialized = false;
    this.logger.info('Project Kanban Service shutdown completed');
  }

  // ========================================================================
  // STORY MANAGEMENT - SAFe Compatible
  // ========================================================================

  /**
   * Create a new user story following SAFe patterns
   */
  async createStory(options: StoryCreateOptions): Promise<ProjectUserStory> {
    if (!this.initialized) await this.initialize();

    // Validate required fields
    if (!options.title.trim()) {
      throw new Error('Story title is required');
    }

    if (!options.createdBy.trim()) {
      throw new Error('Story creator is required');
    }

    const result = await this.workflowKanban!.createTask({
      title: options.title,
      description: options.description,
      priority: this.mapPriorityToWorkflow(options.priority || 'medium'),
      estimatedEffort: options.storyPoints || 1,
      assignedAgent: options.assignedTo,
      tags: options.tags || [],
      metadata: {
        storyType: options.storyType || 'user_story',
        businessValue: options.businessValue,
        acceptanceCriteria: options.acceptanceCriteria || [],
        dependencies: options.dependencies || [],
        dueDate: options.dueDate,
        projectId: options.projectId,
        featureId: options.featureId,
        epicId: options.epicId,
        persona: options.persona,
        enablerType: options.enablerType,
        assignedTeam: options.assignedTeam,
        createdBy: options.createdBy,
        ...options.metadata
      }
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create story');
    }

    return this.convertToProjectStory(result.data);
  }

  /**
   * Get stories with advanced filtering options
   */
  async getStories(filters?: StoryQueryFilters): Promise<QueryResult<ProjectUserStory>> {
    if (!this.initialized) await this.initialize();

    let allTasks: any[] = [];

    if (filters?.status) {
      const workflowState = this.mapStatusToWorkflow(filters.status);
      allTasks = await this.workflowKanban!.getTasksByState(workflowState);
    } else {
      // Get stories from all statuses
      const backlogTasks = await this.workflowKanban!.getTasksByState('backlog');
      const readyTasks = await this.workflowKanban!.getTasksByState('analysis');
      const inProgressTasks = await this.workflowKanban!.getTasksByState('development');
      const reviewTasks = await this.workflowKanban!.getTasksByState('testing');
      const doneTasks = await this.workflowKanban!.getTasksByState('done');

      allTasks = [...backlogTasks, ...readyTasks, ...inProgressTasks, ...reviewTasks, ...doneTasks];
    }

    let stories = allTasks.map(task => this.convertToProjectStory(task));

    // Apply advanced filters
    if (filters) {
      if (filters.storyType) {
        stories = stories.filter(story => story.storyType === filters.storyType);
      }
      
      if (filters.priority) {
        stories = stories.filter(story => story.priority === filters.priority);
      }
      
      if (filters.assignedTo) {
        stories = stories.filter(story => story.assignedTo === filters.assignedTo);
      }
      
      if (filters.assignedTeam) {
        stories = stories.filter(story => story.assignedTeam === filters.assignedTeam);
      }
      
      if (filters.projectId) {
        stories = stories.filter(story => story.projectId === filters.projectId);
      }
      
      if (filters.featureId) {
        stories = stories.filter(story => story.featureId === filters.featureId);
      }
      
      if (filters.epicId) {
        stories = stories.filter(story => story.epicId === filters.epicId);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        stories = stories.filter(story => 
          filters.tags!.some(tag => story.tags.includes(tag))
        );
      }
      
      if (filters.dueBefore) {
        stories = stories.filter(story => 
          story.dueDate && story.dueDate <= filters.dueBefore!
        );
      }
      
      if (filters.dueAfter) {
        stories = stories.filter(story => 
          story.dueDate && story.dueDate >= filters.dueAfter!
        );
      }
      
      if (filters.storyPointsMin !== undefined) {
        stories = stories.filter(story => 
          story.storyPoints !== undefined && story.storyPoints >= filters.storyPointsMin!
        );
      }
      
      if (filters.storyPointsMax !== undefined) {
        stories = stories.filter(story => 
          story.storyPoints !== undefined && story.storyPoints <= filters.storyPointsMax!
        );
      }
    }

    // Apply pagination
    const total = stories.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginatedStories = stories.slice(offset, offset + limit);

    return {
      items: paginatedStories,
      total,
      offset,
      limit,
      hasMore: offset + limit < total
    };
  }

  /**
   * Move story to different status with reason tracking
   */
  async moveStory(
    storyId: string, 
    status: ProjectUserStory['status'], 
    reason?: string
  ): Promise<ProjectUserStory> {
    if (!this.initialized) await this.initialize();

    // Get current task for time tracking
    const currentTask = await this.workflowKanban!.getTask(storyId);
    if (!currentTask.data) {
      throw new Error('Story not found');
    }

    const workflowState = this.mapStatusToWorkflow(status);
    const result = await this.workflowKanban!.moveTask(storyId, workflowState, reason);

    if (!result.success) {
      throw new Error(result.error || 'Failed to move story');
    }

    const updatedTask = await this.workflowKanban!.getTask(storyId);
    if (!updatedTask.data) {
      throw new Error('Story not found after move');
    }

    // Update time tracking if enabled
    if (this.config.enableTimeTracking) {
      const now = new Date();
      const metadata = { ...updatedTask.data.metadata };
      
      if (status === 'in_progress' && !metadata.startedAt) {
        metadata.startedAt = now;
      }
      
      if (status === 'done' && !metadata.completedAt) {
        metadata.completedAt = now;
      }
    }

    return this.convertToProjectStory(updatedTask.data);
  }

  /**
   * Update story with validation
   */
  async updateStory(
    storyId: string, 
    updates: Partial<StoryCreateOptions>
  ): Promise<ProjectUserStory> {
    if (!this.initialized) await this.initialize();

    const currentTask = await this.workflowKanban!.getTask(storyId);
    if (!currentTask.data) {
      throw new Error('Story not found');
    }

    // Create updated task data
    const updatedMetadata = {
      ...currentTask.data.metadata,
      ...(updates.storyType && { storyType: updates.storyType }),
      ...(updates.businessValue !== undefined && { businessValue: updates.businessValue }),
      ...(updates.acceptanceCriteria && { acceptanceCriteria: updates.acceptanceCriteria }),
      ...(updates.dependencies && { dependencies: updates.dependencies }),
      ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
      ...(updates.projectId && { projectId: updates.projectId }),
      ...(updates.featureId && { featureId: updates.featureId }),
      ...(updates.epicId && { epicId: updates.epicId }),
      ...(updates.persona && { persona: updates.persona }),
      ...(updates.enablerType && { enablerType: updates.enablerType }),
      ...(updates.assignedTeam && { assignedTeam: updates.assignedTeam }),
      ...(updates.metadata && updates.metadata),
      updatedAt: new Date()
    };

    // For now, create a replacement task (in a full implementation, we'd have an update method)
    const result = await this.workflowKanban!.createTask({
      ...currentTask.data,
      title: updates.title || currentTask.data.title,
      description: updates.description !== undefined ? updates.description : currentTask.data.description,
      priority: updates.priority ? this.mapPriorityToWorkflow(updates.priority) : currentTask.data.priority,
      estimatedEffort: updates.storyPoints || currentTask.data.estimatedEffort,
      assignedAgent: updates.assignedTo !== undefined ? updates.assignedTo : currentTask.data.assignedAgent,
      tags: updates.tags || currentTask.data.tags,
      metadata: updatedMetadata
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update story');
    }

    return this.convertToProjectStory(result.data);
  }

  /**
   * Delete story (mark as archived)
   */
  async deleteStory(storyId: string, reason?: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    try {
      // Move to done status to simulate deletion
      await this.workflowKanban!.moveTask(storyId, 'done', reason || 'Story deleted');
      this.emit('story:deleted', { id: storyId, reason, deletedAt: new Date() });
    } catch (error) {
      throw new Error('Failed to delete story');
    }
  }

  // ========================================================================
  // ANALYTICS & REPORTING
  // ========================================================================

  /**
   * Get project kanban statistics
   */
  async getKanbanStats(projectId?: string): Promise<{
    statusCounts: Record<ProjectUserStory['status'], number>;
    storyTypeCounts: Record<ProjectUserStory['storyType'], number>;
    priorityCounts: Record<ProjectUserStory['priority'], number>;
    averageStoryPoints: number;
    totalBusinessValue: number;
    cycleTimeAverage?: number;
    throughput?: number;
  }> {
    if (!this.initialized) await this.initialize();

    const allStories = await this.getStories({ projectId });
    const stories = allStories.items;

    // Calculate status distribution
    const statusCounts = {
      backlog: 0,
      ready: 0,
      in_progress: 0,
      review: 0,
      done: 0
    };

    const storyTypeCounts = {
      user_story: 0,
      enabler_story: 0
    };

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    let totalStoryPoints = 0;
    let totalBusinessValue = 0;
    let storyPointsCount = 0;
    let businessValueCount = 0;

    for (const story of stories) {
      statusCounts[story.status]++;
      storyTypeCounts[story.storyType]++;
      priorityCounts[story.priority]++;

      if (story.storyPoints) {
        totalStoryPoints += story.storyPoints;
        storyPointsCount++;
      }

      if (story.businessValue) {
        totalBusinessValue += story.businessValue;
        businessValueCount++;
      }
    }

    const result: any = {
      statusCounts,
      storyTypeCounts,
      priorityCounts,
      averageStoryPoints: storyPointsCount > 0 ? totalStoryPoints / storyPointsCount : 0,
      totalBusinessValue
    };

    // Add advanced metrics if enabled
    if (this.config.enableFlowMetrics && this.workflowKanban) {
      try {
        const flowMetrics = await this.workflowKanban.getFlowMetrics();
        result.cycleTimeAverage = flowMetrics.cycleTime;
        result.throughput = flowMetrics.throughput;
      } catch (error) {
        this.logger.warn('Failed to get flow metrics:', error);
      }
    }

    return result;
  }

  /**
   * Get flow health report if advanced features are enabled
   */
  async getFlowHealth(): Promise<any | null> {
    if (!this.config.enableAdvancedFeatures || !this.workflowKanban) {
      return null;
    }

    try {
      const health = await this.workflowKanban.getHealthStatus();
      const bottlenecks = await this.workflowKanban.detectBottlenecks();
      
      return {
        overallHealth: health.overallHealth,
        componentHealth: health.componentHealth,
        activeBottlenecks: bottlenecks.bottlenecks.length,
        systemRecommendations: health.recommendations,
        bottleneckDetails: bottlenecks.bottlenecks
      };
    } catch (error) {
      this.logger.error('Failed to get flow health:', error);
      return null;
    }
  }

  // ========================================================================
  // CONFIGURATION MANAGEMENT
  // ========================================================================

  /**
   * Update configuration and reinitialize if needed
   */
  async updateConfig(newConfig: Partial<ProjectKanbanConfig>): Promise<void> {
    const configChanged = this.hasSignificantConfigChange(newConfig);
    
    this.config = { ...this.config, ...newConfig };
    
    if (configChanged && this.initialized) {
      this.logger.info('Significant configuration change detected, reinitializing...');
      this.initialized = false;
      await this.initialize();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ProjectKanbanConfig {
    return { ...this.config };
  }

  // ========================================================================
  // PRIVATE UTILITY METHODS
  // ========================================================================

  /**
   * Convert WorkflowTask to ProjectUserStory
   */
  private convertToProjectStory(task: WorkflowTask): ProjectUserStory {
    const metadata = task.metadata || {};
    
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: this.mapStatusFromWorkflow(task.state),
      priority: this.mapPriorityFromWorkflow(task.priority),
      storyType: metadata.storyType || 'user_story',
      storyPoints: task.estimatedEffort > 0 ? task.estimatedEffort : undefined,
      businessValue: metadata.businessValue,
      assignedTo: task.assignedAgent,
      assignedTeam: metadata.assignedTeam,
      acceptanceCriteria: metadata.acceptanceCriteria || [],
      tags: task.tags || [],
      dependencies: metadata.dependencies || [],
      dueDate: metadata.dueDate,
      projectId: metadata.projectId,
      featureId: metadata.featureId,
      epicId: metadata.epicId,
      persona: metadata.persona,
      enablerType: metadata.enablerType,
      createdBy: metadata.createdBy || 'unknown',
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      startedAt: metadata.startedAt || task.startedAt,
      completedAt: metadata.completedAt || task.completedAt,
      metadata: metadata
    };
  }

  /**
   * Map project statuses to workflow states
   */
  private mapStatusToWorkflow(status: ProjectUserStory['status']): TaskState {
    switch (status) {
      case 'backlog': return 'backlog';
      case 'ready': return 'analysis';
      case 'in_progress': return 'development';
      case 'review': return 'testing';
      case 'done': return 'done';
      default: return 'backlog';
    }
  }

  /**
   * Map workflow states to project statuses
   */
  private mapStatusFromWorkflow(state: TaskState): ProjectUserStory['status'] {
    switch (state) {
      case 'backlog': return 'backlog';
      case 'analysis': return 'ready';
      case 'development': return 'in_progress';
      case 'testing': return 'review';
      case 'done': return 'done';
      case 'review':
      case 'deployment':
        return 'review';
      case 'blocked':
      case 'expedite':
        return 'in_progress';
      default: return 'backlog';
    }
  }

  /**
   * Map project priorities to workflow priorities
   */
  private mapPriorityToWorkflow(priority: ProjectUserStory['priority']): 'low' | 'medium' | 'high' | 'critical' {
    switch (priority) {
      case 'urgent': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  /**
   * Map workflow priorities to project priorities
   */
  private mapPriorityFromWorkflow(priority: 'low' | 'medium' | 'high' | 'critical'): ProjectUserStory['priority'] {
    switch (priority) {
      case 'critical': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  /**
   * Check if config change requires reinitialization
   */
  private hasSignificantConfigChange(newConfig: Partial<ProjectKanbanConfig>): boolean {
    const significantKeys = [
      'enableAdvancedFeatures',
      'enableSAFeIntegration', 
      'enableAIOptimization',
      'enableFlowMetrics',
      'enableBottleneckDetection'
    ];
    
    return significantKeys.some(key => 
      newConfig[key as keyof ProjectKanbanConfig] !== undefined && 
      newConfig[key as keyof ProjectKanbanConfig] !== this.config[key as keyof ProjectKanbanConfig]
    );
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create Project Kanban Service instance with mode-specific configuration
 */
export function createProjectKanbanService(
  mode: 'kanban' | 'agile' | 'safe' = 'kanban',
  projectId?: string,
  customConfig?: Partial<ProjectKanbanConfig>
): ProjectKanbanService {
  const baseConfig: ProjectKanbanConfig = {
    mode,
    projectId,
    enableAdvancedFeatures: mode !== 'kanban',
    enableSAFeIntegration: mode === 'safe',
    enableAIOptimization: false, // Requires explicit enablement
    enableFlowMetrics: mode !== 'kanban',
    enableBottleneckDetection: mode === 'safe',
    enableTimeTracking: true,
    enableNotifications: false,
    maxBacklog: mode === 'safe' ? 200 : 100,
    maxReady: mode === 'safe' ? 50 : 20,
    maxInProgress: 5,
    maxReview: mode === 'safe' ? 20 : 10,
    ...customConfig
  };

  return new ProjectKanbanService(baseConfig);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  ProjectUserStory,
  StoryCreateOptions,
  ProjectKanbanConfig,
  StoryQueryFilters
};