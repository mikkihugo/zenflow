/**
 * @fileoverview Project SAFe LPM REST API
 *
 * SAFe Lean Portfolio Management REST API for enterprise story management.
 * Provides CRUD operations for user stories with AI-enhanced SAFe LPM features.
 *
 * Follows SAFe enterprise patterns with neural intelligence integration.
 *
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 2"..0' - SAFe LPM
 */

import { getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
import { Request, Response } from 'express';

import {
  createProjectSAFeLPMService,
  type ProjectUserStory,
  type StoryCreateOptions,
  type StoryQueryFilters,
} from './../../../services/project/project-service';

/**
 * Project SAFe LPM API Controller - AI-Enhanced Enterprise Portfolio Management
 */
export class ProjectSAFeLPMController {
  private logger: Logger;
  private projectServices = new Map<string, any>(); // Project-specific service instances

  constructor() {
    this.logger = getLogger('ProjectSAFeLPMController');
  }

  /**
   * Get or create project service for project
   */
  private async getProjectService(projectId: string, mode: 'safe = safe') {
    if (!this.projectServices.has(projectId)) {
      const service = createProjectSAFeLPMService(mode, projectId);
      await service?.initialize()
      this.projectServices.set(projectId, service);
    }
    return this.projectServices.get(projectId);
  }

  /**
   * GET /api/v1/projects/:projectId/safe-lpm/stories
   * Get stories with AI-enhanced SAFe LPM filtering options
   */
  async getStories(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const {
        status,
        storyType,
        priority,
        assignedTo,
        assignedTeam,
        featureId,
        epicId,
        tags,
        dueBefore,
        dueAfter,
        storyPointsMin,
        storyPointsMax,
        swimlane,
        offset,
        limit,
        mode = 'safe',
      } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const validStatuses = [
        'backlog',
        'ready',
        'in_progress',
        'review',
        'done',
      ];
      if (status && !validStatuses.includes(status as string)) {
        res.status(400).json({
          success: false,
          error:
            'Invalid status. Must be: backlog, ready, in_progress, review, or done',
        });
        return;
      }

      const projectService = await this.getProjectService(
        projectId,
        mode as any
      );

      const filters: StoryQueryFilters = {
        ...(status && { status: status as ProjectUserStory['status'] }),
        ...(storyType && {
          storyType: storyType as ProjectUserStory['storyType'],
        }),
        ...(priority && { priority: priority as ProjectUserStory['priority'] }),
        ...(assignedTo && { assignedTo: assignedTo as string }),
        ...(assignedTeam && { assignedTeam: assignedTeam as string }),
        ...(featureId && { featureId: featureId as string }),
        ...(epicId && { epicId: epicId as string }),
        ...(tags && { tags: (tags as string).split(',') }),
        ...(dueBefore && { dueBefore: new Date(dueBefore as string) }),
        ...(dueAfter && { dueAfter: new Date(dueAfter as string) }),
        ...(storyPointsMin && {
          storyPointsMin: parseInt(storyPointsMin as string),
        }),
        ...(storyPointsMax && {
          storyPointsMax: parseInt(storyPointsMax as string),
        }),
        ...(swimlane && { swimlane: swimlane as string }),
        ...(offset && { offset: parseInt(offset as string) }),
        ...(limit && { limit: parseInt(limit as string) }),
        projectId,
      };

      const result = await projectService.getStories(filters);

      res.json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          offset: result.offset,
          limit: result.limit,
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      this.logger.error('Failed to get stories:', error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to retrieve stories',
      });
    }
  }

  /**
   * POST /api/v1/projects/:projectId/safe-lpm/stories
   * Create a new story with AI-enhanced SAFe LPM features
   */
  async createStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const {
        title,
        description,
        storyType = 'user_story',
        priority = 'medium',
        storyPoints,
        businessValue,
        assignedTo,
        assignedTeam,
        acceptanceCriteria = [],
        tags = [],
        dependencies = [],
        dueDate,
        featureId,
        epicId,
        persona,
        enablerType,
        swimlane,
        createdBy,
        mode = 'safe',
      } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      if (!title) {
        res.status(400).json({
          success: false,
          error: 'Title is required',
        });
        return;
      }

      if (!createdBy) {
        res.status(400).json({
          success: false,
          error: 'Creator is required',
        });
        return;
      }

      const validPriorities = ['low, medium', 'high, urgent'];
      if (priority && !validPriorities.includes(priority)) {
        res.status(400).json({
          success: false,
          error: 'Invalid priority. Must be: low, medium, high, or urgent',
        });
        return;
      }

      const validStoryTypes = ['user_story, enabler_story'];
      if (storyType && !validStoryTypes.includes(storyType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid story type. Must be: user_story or enabler_story',
        });
        return;
      }

      const projectService = await this.getProjectService(
        projectId,
        mode as any
      );

      const story = await projectService.createStory({
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
        createdBy,
      });

      res.status(201).json({
        success: true,
        data: story,
      });
    } catch (error) {
      this.logger.error('Failed to create story:', error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create story',
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/safe-lpm/stories/:id/move
   * Move a story through SAFe LPM workflow with AI-enhanced tracking
   */
  async moveStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const { status, reason, mode = 'safe' } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const validStatuses = [
        'backlog',
        'ready',
        'in_progress',
        'review',
        'done',
      ];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error:
            'Invalid status. Must be: backlog, ready, in_progress, review, or done',
        });
        return;
      }

      const projectService = await this.getProjectService(
        projectId,
        mode as any
      );
      const story = await projectService.moveStory(id, status, reason);

      res.json({
        success: true,
        data: story,
      });
    } catch (error) {
      this.logger.error('Failed to move story:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to move story',
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/safe-lpm/stories/:id
   * Update a story with AI-enhanced SAFe LPM capabilities
   */
  async updateStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const {
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
        dueDate,
        featureId,
        epicId,
        persona,
        enablerType,
        mode = 'safe',
      } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      if (priority) {
        const validPriorities = ['low, medium', 'high, urgent'];
        if (!validPriorities.includes(priority)) {
          res.status(400).json({
            success: false,
            error: 'Invalid priority. Must be: low, medium, high, or urgent',
          });
          return;
        }
      }

      if (storyType) {
        const validStoryTypes = ['user_story, enabler_story'];
        if (!validStoryTypes.includes(storyType)) {
          res.status(400).json({
            success: false,
            error: 'Invalid story type. Must be: user_story or enabler_story',
          });
          return;
        }
      }

      const projectService = await this.getProjectService(
        projectId,
        mode as any
      );

      const updates: Partial<StoryCreateOptions> = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (storyType !== undefined) updates.storyType = storyType;
      if (priority !== undefined) updates.priority = priority;
      if (storyPoints !== undefined) updates.storyPoints = storyPoints;
      if (businessValue !== undefined) updates.businessValue = businessValue;
      if (assignedTo !== undefined) updates.assignedTo = assignedTo;
      if (assignedTeam !== undefined) updates.assignedTeam = assignedTeam;
      if (acceptanceCriteria !== undefined)
        updates.acceptanceCriteria = acceptanceCriteria;
      if (tags !== undefined) updates.tags = tags;
      if (dependencies !== undefined) updates.dependencies = dependencies;
      if (dueDate !== undefined)
        updates.dueDate = dueDate ? new Date(dueDate) : undefined;
      if (featureId !== undefined) updates.featureId = featureId;
      if (epicId !== undefined) updates.epicId = epicId;
      if (persona !== undefined) updates.persona = persona;
      if (enablerType !== undefined) updates.enablerType = enablerType;

      const story = await projectService.updateStory(id, updates);

      res.json({
        success: true,
        data: story,
      });
    } catch (error) {
      this.logger.error('Failed to update story:', error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update story',
      });
    }
  }

  /**
   * DELETE /api/v1/projects/:projectId/safe-lpm/stories/:id
   * Delete a story with AI-enhanced audit tracking
   */
  async deleteStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req.params;
      const { reason, mode = 'safe' } = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this.getProjectService(
        projectId,
        mode as any
      );
      await projectService.deleteStory(id, reason);

      res.json({
        success: true,
        message: 'Story deleted successfully',
      });
    } catch (error) {
      this.logger.error('Failed to delete story:', error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete story',
      });
    }
  }

  /**
   * GET /api/v1/projects/:projectId/safe-lmp/stats
   * Get comprehensive SAFe LPM statistics with AI-enhanced metrics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { mode = 'safe' } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this.getProjectService(
        projectId,
        mode as any
      );
      const stats = await projectService.getSAFeLPMStats(projectId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      this.logger.error('Failed to get stats:', error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve statistics',
      });
    }
  }

  /**
   * GET /api/v1/projects/:projectId/safe-lpm/flow-health
   * Get SAFe LPM flow health metrics with AI-enhanced insights
   */
  async getFlowHealth(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const { mode = 'safe' } = req.query;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this.getProjectService(
        projectId,
        mode as any
      );
      const health = await projectService?.getFlowHealth()

      if (health === null) {
        res.status(200).json({
          success: true,
          data: null,
          message: 'Flow health metrics not available in current mode',
        });
        return;
      }

      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      this.logger.error('Failed to get flow health:', error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve flow health',
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/safe-lpm/config
   * Update project SAFe LPM configuration with AI optimization
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.params;
      const config = req.body;

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this.getProjectService(projectId);
      await projectService.updateConfig(config);

      res.json({
        success: true,
        message: 'Configuration updated successfully',
      });
    } catch (error) {
      this.logger.error('Failed to update config:', error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update configuration',
      });
    }
  }
}

/**
 * Project SAFe LPM API Routes Factory
 *
 * Creates bound controller methods for project-scoped SAFe LPM endpoints.
 * Supports AI-enhanced enterprise portfolio management with neural intelligence.
 */
export function createProjectSAFeLPMRoutes() {
  const controller = new ProjectSAFeLPMController();

  return {
    // GET /api/v1/projects/:projectId/safe-lpm/stories
    getStories: controller.getStories.bind(controller),

    // POST /api/v1/projects/:projectId/safe-lpm/stories
    createStory: controller.createStory.bind(controller),

    // PUT /api/v1/projects/:projectId/safe-lpm/stories/:id/move
    moveStory: controller.moveStory.bind(controller),

    // PUT /api/v1/projects/:projectId/safe-lpm/stories/:id
    updateStory: controller.updateStory.bind(controller),

    // DELETE /api/v1/projects/:projectId/safe-lpm/stories/:id
    deleteStory: controller.deleteStory.bind(controller),

    // GET /api/v1/projects/:projectId/safe-lpm/stats
    getStats: controller.getStats.bind(controller),

    // GET /api/v1/projects/:projectId/safe-lpm/flow-health
    getFlowHealth: controller.getFlowHealth.bind(controller),

    // PUT /api/v1/projects/:projectId/safe-lpm/config
    updateConfig: controller.updateConfig.bind(controller),
  };
}
