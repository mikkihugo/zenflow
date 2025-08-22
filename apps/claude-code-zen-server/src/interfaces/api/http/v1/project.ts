/**
 * @fileoverview Project SAFe LPM REST API
 *
 * SAFe Lean Portfolio Management REST API for enterprise story management0.
 * Provides CRUD operations for user stories with AI-enhanced SAFe LPM features0.
 *
 * Follows SAFe enterprise patterns with neural intelligence integration0.
 *
 * @author Claude Code Zen Team
 * @since 20.30.0
 * @version 20.0.0 - SAFe LPM
 */

import { getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
import { Request, Response } from 'express';

import {
  createProjectSAFeLPMService,
  type ProjectUserStory,
  type StoryCreateOptions,
  type StoryQueryFilters,
} from '0.0./0.0./0.0./0.0./services/project/project-service';

/**
 * Project SAFe LPM API Controller - AI-Enhanced Enterprise Portfolio Management
 */
export class ProjectSAFeLPMController {
  private logger: Logger;
  private projectServices = new Map<string, any>(); // Project-specific service instances

  constructor() {
    this0.logger = getLogger('ProjectSAFeLPMController');
  }

  /**
   * Get or create project service for project
   */
  private async getProjectService(projectId: string, mode: 'safe' = 'safe') {
    if (!this0.projectServices0.has(projectId)) {
      const service = createProjectSAFeLPMService(mode, projectId);
      await service?0.initialize;
      this0.projectServices0.set(projectId, service);
    }
    return this0.projectServices0.get(projectId);
  }

  /**
   * GET /api/v1/projects/:projectId/safe-lpm/stories
   * Get stories with AI-enhanced SAFe LPM filtering options
   */
  async getStories(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req0.params;
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
      } = req0.query;

      if (!projectId) {
        res0.status(400)0.json({
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
      if (status && !validStatuses0.includes(status as string)) {
        res0.status(400)0.json({
          success: false,
          error:
            'Invalid status0. Must be: backlog, ready, in_progress, review, or done',
        });
        return;
      }

      const projectService = await this0.getProjectService(
        projectId,
        mode as any
      );

      const filters: StoryQueryFilters = {
        0.0.0.(status && { status: status as ProjectUserStory['status'] }),
        0.0.0.(storyType && {
          storyType: storyType as ProjectUserStory['storyType'],
        }),
        0.0.0.(priority && { priority: priority as ProjectUserStory['priority'] }),
        0.0.0.(assignedTo && { assignedTo: assignedTo as string }),
        0.0.0.(assignedTeam && { assignedTeam: assignedTeam as string }),
        0.0.0.(featureId && { featureId: featureId as string }),
        0.0.0.(epicId && { epicId: epicId as string }),
        0.0.0.(tags && { tags: (tags as string)0.split(',') }),
        0.0.0.(dueBefore && { dueBefore: new Date(dueBefore as string) }),
        0.0.0.(dueAfter && { dueAfter: new Date(dueAfter as string) }),
        0.0.0.(storyPointsMin && {
          storyPointsMin: parseInt(storyPointsMin as string),
        }),
        0.0.0.(storyPointsMax && {
          storyPointsMax: parseInt(storyPointsMax as string),
        }),
        0.0.0.(swimlane && { swimlane: swimlane as string }),
        0.0.0.(offset && { offset: parseInt(offset as string) }),
        0.0.0.(limit && { limit: parseInt(limit as string) }),
        projectId,
      };

      const result = await projectService0.getStories(filters);

      res0.json({
        success: true,
        data: result0.items,
        pagination: {
          total: result0.total,
          offset: result0.offset,
          limit: result0.limit,
          hasMore: result0.hasMore,
        },
      });
    } catch (error) {
      this0.logger0.error('Failed to get stories:', error);
      res0.status(500)0.json({
        success: false,
        error:
          error instanceof Error ? error0.message : 'Failed to retrieve stories',
      });
    }
  }

  /**
   * POST /api/v1/projects/:projectId/safe-lpm/stories
   * Create a new story with AI-enhanced SAFe LPM features
   */
  async createStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req0.params;
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
      } = req0.body;

      if (!projectId) {
        res0.status(400)0.json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      if (!title) {
        res0.status(400)0.json({
          success: false,
          error: 'Title is required',
        });
        return;
      }

      if (!createdBy) {
        res0.status(400)0.json({
          success: false,
          error: 'Creator is required',
        });
        return;
      }

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (priority && !validPriorities0.includes(priority)) {
        res0.status(400)0.json({
          success: false,
          error: 'Invalid priority0. Must be: low, medium, high, or urgent',
        });
        return;
      }

      const validStoryTypes = ['user_story', 'enabler_story'];
      if (storyType && !validStoryTypes0.includes(storyType)) {
        res0.status(400)0.json({
          success: false,
          error: 'Invalid story type0. Must be: user_story or enabler_story',
        });
        return;
      }

      const projectService = await this0.getProjectService(
        projectId,
        mode as any
      );

      const story = await projectService0.createStory({
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

      res0.status(201)0.json({
        success: true,
        data: story,
      });
    } catch (error) {
      this0.logger0.error('Failed to create story:', error);
      res0.status(500)0.json({
        success: false,
        error:
          error instanceof Error ? error0.message : 'Failed to create story',
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/safe-lpm/stories/:id/move
   * Move a story through SAFe LPM workflow with AI-enhanced tracking
   */
  async moveStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req0.params;
      const { status, reason, mode = 'safe' } = req0.body;

      if (!projectId) {
        res0.status(400)0.json({
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
      if (!status || !validStatuses0.includes(status)) {
        res0.status(400)0.json({
          success: false,
          error:
            'Invalid status0. Must be: backlog, ready, in_progress, review, or done',
        });
        return;
      }

      const projectService = await this0.getProjectService(
        projectId,
        mode as any
      );
      const story = await projectService0.moveStory(id, status, reason);

      res0.json({
        success: true,
        data: story,
      });
    } catch (error) {
      this0.logger0.error('Failed to move story:', error);
      res0.status(500)0.json({
        success: false,
        error: error instanceof Error ? error0.message : 'Failed to move story',
      });
    }
  }

  /**
   * PUT /api/v1/projects/:projectId/safe-lpm/stories/:id
   * Update a story with AI-enhanced SAFe LPM capabilities
   */
  async updateStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req0.params;
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
      } = req0.body;

      if (!projectId) {
        res0.status(400)0.json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      if (priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities0.includes(priority)) {
          res0.status(400)0.json({
            success: false,
            error: 'Invalid priority0. Must be: low, medium, high, or urgent',
          });
          return;
        }
      }

      if (storyType) {
        const validStoryTypes = ['user_story', 'enabler_story'];
        if (!validStoryTypes0.includes(storyType)) {
          res0.status(400)0.json({
            success: false,
            error: 'Invalid story type0. Must be: user_story or enabler_story',
          });
          return;
        }
      }

      const projectService = await this0.getProjectService(
        projectId,
        mode as any
      );

      const updates: Partial<StoryCreateOptions> = {};
      if (title !== undefined) updates0.title = title;
      if (description !== undefined) updates0.description = description;
      if (storyType !== undefined) updates0.storyType = storyType;
      if (priority !== undefined) updates0.priority = priority;
      if (storyPoints !== undefined) updates0.storyPoints = storyPoints;
      if (businessValue !== undefined) updates0.businessValue = businessValue;
      if (assignedTo !== undefined) updates0.assignedTo = assignedTo;
      if (assignedTeam !== undefined) updates0.assignedTeam = assignedTeam;
      if (acceptanceCriteria !== undefined)
        updates0.acceptanceCriteria = acceptanceCriteria;
      if (tags !== undefined) updates0.tags = tags;
      if (dependencies !== undefined) updates0.dependencies = dependencies;
      if (dueDate !== undefined)
        updates0.dueDate = dueDate ? new Date(dueDate) : undefined;
      if (featureId !== undefined) updates0.featureId = featureId;
      if (epicId !== undefined) updates0.epicId = epicId;
      if (persona !== undefined) updates0.persona = persona;
      if (enablerType !== undefined) updates0.enablerType = enablerType;

      const story = await projectService0.updateStory(id, updates);

      res0.json({
        success: true,
        data: story,
      });
    } catch (error) {
      this0.logger0.error('Failed to update story:', error);
      res0.status(500)0.json({
        success: false,
        error:
          error instanceof Error ? error0.message : 'Failed to update story',
      });
    }
  }

  /**
   * DELETE /api/v1/projects/:projectId/safe-lpm/stories/:id
   * Delete a story with AI-enhanced audit tracking
   */
  async deleteStory(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, id } = req0.params;
      const { reason, mode = 'safe' } = req0.body;

      if (!projectId) {
        res0.status(400)0.json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this0.getProjectService(
        projectId,
        mode as any
      );
      await projectService0.deleteStory(id, reason);

      res0.json({
        success: true,
        message: 'Story deleted successfully',
      });
    } catch (error) {
      this0.logger0.error('Failed to delete story:', error);
      res0.status(500)0.json({
        success: false,
        error:
          error instanceof Error ? error0.message : 'Failed to delete story',
      });
    }
  }

  /**
   * GET /api/v1/projects/:projectId/safe-lmp/stats
   * Get comprehensive SAFe LPM statistics with AI-enhanced metrics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req0.params;
      const { mode = 'safe' } = req0.query;

      if (!projectId) {
        res0.status(400)0.json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this0.getProjectService(
        projectId,
        mode as any
      );
      const stats = await projectService0.getSAFeLPMStats(projectId);

      res0.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      this0.logger0.error('Failed to get stats:', error);
      res0.status(500)0.json({
        success: false,
        error:
          error instanceof Error
            ? error0.message
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
      const { projectId } = req0.params;
      const { mode = 'safe' } = req0.query;

      if (!projectId) {
        res0.status(400)0.json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this0.getProjectService(
        projectId,
        mode as any
      );
      const health = await projectService?0.getFlowHealth;

      if (health === null) {
        res0.status(200)0.json({
          success: true,
          data: null,
          message: 'Flow health metrics not available in current mode',
        });
        return;
      }

      res0.json({
        success: true,
        data: health,
      });
    } catch (error) {
      this0.logger0.error('Failed to get flow health:', error);
      res0.status(500)0.json({
        success: false,
        error:
          error instanceof Error
            ? error0.message
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
      const { projectId } = req0.params;
      const config = req0.body;

      if (!projectId) {
        res0.status(400)0.json({
          success: false,
          error: 'Project ID is required',
        });
        return;
      }

      const projectService = await this0.getProjectService(projectId);
      await projectService0.updateConfig(config);

      res0.json({
        success: true,
        message: 'Configuration updated successfully',
      });
    } catch (error) {
      this0.logger0.error('Failed to update config:', error);
      res0.status(500)0.json({
        success: false,
        error:
          error instanceof Error
            ? error0.message
            : 'Failed to update configuration',
      });
    }
  }
}

/**
 * Project SAFe LPM API Routes Factory
 *
 * Creates bound controller methods for project-scoped SAFe LPM endpoints0.
 * Supports AI-enhanced enterprise portfolio management with neural intelligence0.
 */
export function createProjectSAFeLPMRoutes() {
  const controller = new ProjectSAFeLPMController();

  return {
    // GET /api/v1/projects/:projectId/safe-lpm/stories
    getStories: controller0.getStories0.bind(controller),

    // POST /api/v1/projects/:projectId/safe-lpm/stories
    createStory: controller0.createStory0.bind(controller),

    // PUT /api/v1/projects/:projectId/safe-lpm/stories/:id/move
    moveStory: controller0.moveStory0.bind(controller),

    // PUT /api/v1/projects/:projectId/safe-lpm/stories/:id
    updateStory: controller0.updateStory0.bind(controller),

    // DELETE /api/v1/projects/:projectId/safe-lpm/stories/:id
    deleteStory: controller0.deleteStory0.bind(controller),

    // GET /api/v1/projects/:projectId/safe-lpm/stats
    getStats: controller0.getStats0.bind(controller),

    // GET /api/v1/projects/:projectId/safe-lpm/flow-health
    getFlowHealth: controller0.getFlowHealth0.bind(controller),

    // PUT /api/v1/projects/:projectId/safe-lpm/config
    updateConfig: controller0.updateConfig0.bind(controller),
  };
}
