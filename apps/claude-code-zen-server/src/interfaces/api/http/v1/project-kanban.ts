/**
 * @fileoverview Project Kanban REST API
 * 
 * SAFe-compatible REST API for project user story management using the project kanban system.
 * Provides CRUD operations for user stories with progressive feature enhancement based on project mode.
 * 
 * Follows existing API patterns and integrates with project configuration system.
 * 
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { 
  createProjectKanbanService,
  type ProjectUserStory, 
  type StoryCreateOptions,
  type ProjectKanbanConfig,
  type StoryQueryFilters
} from '../../../../services/project/project-kanban-service';
import { getLogger } from '../../../../config/logging-config';
import type { Logger } from '@claude-zen/foundation';

/**
 * Project Kanban API Controller - SAFe Compatible
 */
export class ProjectKanbanController {
  private logger: Logger;
  private kanbanServices = new Map<string, any>(); // Project-specific service instances

  constructor() {
    this.logger = getLogger('ProjectKanbanController');
  }

  /**
   * Get or create kanban service for project
   */
  private async getKanbanService(projectId: string, mode: 'kanban' | 'agile' | 'safe' = 'kanban') {
    if (!this.kanbanServices.has(projectId)) {
      const service = createProjectKanbanService(mode, projectId);
      await service.initialize();
      this.kanbanServices.set(projectId, service);
    }
    return this.kanbanServices.get(projectId);
  }

  /**
   * GET /api/v1/projects/:projectId/kanban/stories
   * Get stories with advanced filtering options
   */
  async getStories(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { 
        status, storyType, priority, assignedTo, assignedTeam, 
        featureId, epicId, tags, dueBefore, dueAfter,
        storyPointsMin, storyPointsMax, swimlane, offset, limit,
        mode = 'kanban'
      } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const validStatuses = ['backlog', 'ready', 'in_progress', 'review', 'done'];
      if (status && !validStatuses.includes(status as string)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: backlog, ready, in_progress, review, or done'
        });
        return;
      }

      const kanban = await this.getKanbanService(projectId, mode as any);

      const filters: StoryQueryFilters = {
        ...(status && { status: status as ProjectUserStory['status'] }),
        ...(storyType && { storyType: storyType as ProjectUserStory['storyType'] }),
        ...(priority && { priority: priority as ProjectUserStory['priority'] }),
        ...(assignedTo && { assignedTo: assignedTo as string }),
        ...(assignedTeam && { assignedTeam: assignedTeam as string }),
        ...(featureId && { featureId: featureId as string }),
        ...(epicId && { epicId: epicId as string }),
        ...(tags && { tags: (tags as string).split(',') }),
        ...(dueBefore && { dueBefore: new Date(dueBefore as string) }),
        ...(dueAfter && { dueAfter: new Date(dueAfter as string) }),
        ...(storyPointsMin && { storyPointsMin: parseInt(storyPointsMin as string) }),
        ...(storyPointsMax && { storyPointsMax: parseInt(storyPointsMax as string) }),
        ...(swimlane && { swimlane: swimlane as string }),
        ...(offset && { offset: parseInt(offset as string) }),
        ...(limit && { limit: parseInt(limit as string) }),
        projectId
      };

      const result = await kanban.getStories(filters);
      
      res.json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          offset: result.offset,
          limit: result.limit,
          hasMore: result.hasMore
        }
      });

    } catch (error) {
      this.logger.error('Failed to get stories:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve stories'
      });
    }
  }

  /**
   * POST /api/v1/projects/:projectId/kanban/stories
   * Create a new story with SAFe-compatible fields
   */
  async createStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { 
        title, description, storyType = 'user_story', priority = 'medium', 
        storyPoints, businessValue, assignedTo, assignedTeam,
        acceptanceCriteria = [], tags = [], dependencies = [],
        dueDate, featureId, epicId, persona, enablerType, swimlane,
        createdBy, mode = 'kanban'
      } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      if (!title) {
        res.status(400).json({
          success: false,
          error: 'Title is required'
        });
        return;
      }

      if (!createdBy) {
        res.status(400).json({
          success: false,
          error: 'Creator is required'
        });
        return;
      }

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (priority && !validPriorities.includes(priority)) {
        res.status(400).json({
          success: false,
          error: 'Invalid priority. Must be: low, medium, high, or urgent'
        });
        return;
      }

      const validStoryTypes = ['user_story', 'enabler_story'];
      if (storyType && !validStoryTypes.includes(storyType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid story type. Must be: user_story or enabler_story'
        });
        return;
      }

      const kanban = await this.getKanbanService(projectId, mode as any);

      const story = await kanban.createStory({
        title,
        description,
        storyType,
        priority,
        storyPoints,
        businessValue,
        assignedTo,
        assignedTeam,
        acceptanceCriteria,
        tags,
        dependencies,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId,
        featureId,
        epicId,
        persona,
        enablerType,
        swimlane,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: story
      });

    } catch (error) {
      this.logger.error('Failed to create story:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create story'
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/kanban/stories/:id/move
   * Move a story to a different status with reason tracking
   */
  async moveStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const { status, reason, mode = 'kanban' } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const validStatuses = ['backlog', 'ready', 'in_progress', 'review', 'done'];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: backlog, ready, in_progress, review, or done'
        });
        return;
      }

      const kanban = await this.getKanbanService(projectId, mode as any);
      const story = await kanban.moveStory(id, status, reason);

      res.json({
        success: true,
        data: story
      });

    } catch (error) {
      this.logger.error('Failed to move story:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to move story'
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/kanban/stories/:id
   * Update a story with SAFe-compatible fields
   */
  async updateStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const { 
        title, description, storyType, priority, storyPoints, businessValue,
        assignedTo, assignedTeam, acceptanceCriteria, tags, dependencies,
        dueDate, featureId, epicId, persona, enablerType, mode = 'kanban'
      } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      if (priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
          res.status(400).json({
            success: false,
            error: 'Invalid priority. Must be: low, medium, high, or urgent'
          });
          return;
        }
      }

      if (storyType) {
        const validStoryTypes = ['user_story', 'enabler_story'];
        if (!validStoryTypes.includes(storyType)) {
          res.status(400).json({
            success: false,
            error: 'Invalid story type. Must be: user_story or enabler_story'
          });
          return;
        }
      }

      const kanban = await this.getKanbanService(projectId, mode as any);

      const updates: Partial<StoryCreateOptions> = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (storyType !== undefined) updates.storyType = storyType;
      if (priority !== undefined) updates.priority = priority;
      if (storyPoints !== undefined) updates.storyPoints = storyPoints;
      if (businessValue !== undefined) updates.businessValue = businessValue;
      if (assignedTo !== undefined) updates.assignedTo = assignedTo;
      if (assignedTeam !== undefined) updates.assignedTeam = assignedTeam;
      if (acceptanceCriteria !== undefined) updates.acceptanceCriteria = acceptanceCriteria;
      if (tags !== undefined) updates.tags = tags;
      if (dependencies !== undefined) updates.dependencies = dependencies;
      if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : undefined;
      if (featureId !== undefined) updates.featureId = featureId;
      if (epicId !== undefined) updates.epicId = epicId;
      if (persona !== undefined) updates.persona = persona;
      if (enablerType !== undefined) updates.enablerType = enablerType;

      const story = await kanban.updateStory(id, updates);

      res.json({
        success: true,
        data: story
      });

    } catch (error) {
      this.logger.error('Failed to update story:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update story'
      });
    }
  }

  /**
   * DELETE /api/v1/projects/:projectId/kanban/stories/:id
   * Delete a story with reason tracking
   */
  async deleteStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const { reason, mode = 'kanban' } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const kanban = await this.getKanbanService(projectId, mode as any);
      await kanban.deleteStory(id, reason);

      res.json({
        success: true,
        message: 'Story deleted successfully'
      });

    } catch (error) {
      this.logger.error('Failed to delete story:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete story'
      });
    }
  }

  /**
   * GET /api/v1/projects/:projectId/kanban/stats
   * Get comprehensive kanban statistics with SAFe metrics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { mode = 'kanban' } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const kanban = await this.getKanbanService(projectId, mode as any);
      const stats = await kanban.getKanbanStats(projectId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      this.logger.error('Failed to get stats:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve statistics'
      });
    }
  }

  /**
   * GET /api/v1/projects/:projectId/kanban/flow-health
   * Get flow health metrics (advanced features)
   */
  async getFlowHealth(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { mode = 'kanban' } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const kanban = await this.getKanbanService(projectId, mode as any);
      const health = await kanban.getFlowHealth();

      if (health === null) {
        res.status(200).json({
          success: true,
          data: null,
          message: 'Flow health metrics not available in current mode'
        });
        return;
      }

      res.json({
        success: true,
        data: health
      });

    } catch (error) {
      this.logger.error('Failed to get flow health:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve flow health'
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/kanban/config
   * Update project kanban configuration
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const config = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
        return;
      }

      const kanban = await this.getKanbanService(projectId);
      await kanban.updateConfig(config);

      res.json({
        success: true,
        message: 'Configuration updated successfully'
      });

    } catch (error) {
      this.logger.error('Failed to update config:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update configuration'
      });
    }
  }
}

/**
 * Project Kanban API Routes Factory
 * 
 * Creates bound controller methods for project-scoped kanban endpoints.
 * Supports progressive enhancement from kanban to agile to safe modes.
 */
export function createProjectKanbanRoutes() {
  const controller = new ProjectKanbanController();

  return {
    // GET /api/v1/projects/:projectId/kanban/stories
    getStories: controller.getStories.bind(controller),
    
    // POST /api/v1/projects/:projectId/kanban/stories
    createStory: controller.createStory.bind(controller),
    
    // PUT /api/v1/projects/:projectId/kanban/stories/:id/move
    moveStory: controller.moveStory.bind(controller),
    
    // PUT /api/v1/projects/:projectId/kanban/stories/:id
    updateStory: controller.updateStory.bind(controller),
    
    // DELETE /api/v1/projects/:projectId/kanban/stories/:id
    deleteStory: controller.deleteStory.bind(controller),
    
    // GET /api/v1/projects/:projectId/kanban/stats
    getStats: controller.getStats.bind(controller),
    
    // GET /api/v1/projects/:projectId/kanban/flow-health
    getFlowHealth: controller.getFlowHealth.bind(controller),
    
    // PUT /api/v1/projects/:projectId/kanban/config
    updateConfig: controller.updateConfig.bind(controller)
  };
}