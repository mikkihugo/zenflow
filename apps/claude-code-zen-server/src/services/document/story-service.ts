/**
 * @fileoverview Story Service - SAFe Story Management
 *
 * Extends BaseDocumentService to provide Story functionality including:
 * - User Story and Enabler Story management
 * - Task breakdown from Stories
 * - Acceptance criteria tracking
 * - Story point estimation
 * - Sprint/iteration assignment
 *
 * Follows Google TypeScript conventions and facade pattern0.
 * Compatible across Kanban → Agile → SAFe modes0.
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 10.0.0
 */

import type { DocumentType } from '@claude-zen/enterprise';
import { nanoid } from 'nanoid';

import type { StoryEntity, TaskEntity } from '0.0./0.0./entities/document-entities';

import {
  BaseDocumentService,
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from '0./base-document-service';
import { DocumentManager } from '0./document-service';

// ============================================================================
// STORY INTERFACES
// ============================================================================

export interface StoryCreateOptions {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyType: 'user_story' | 'enabler_story';
  parentFeatureId?: string;
  sprintId?: string;
  iterationId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  storyPoints?: number;
  businessValue?: number;
  assignedTeamId?: string;
  assignedUserId?: string;
  dependencies?: string[];
  author?: string;
  projectId?: string;
  persona?: string; // For user stories
  enablerType?:
    | 'infrastructure'
    | 'architectural'
    | 'exploration'
    | 'compliance'; // For enabler stories
  metadata?: Record<string, unknown>;
}

export interface StoryQueryOptions extends QueryFilters {
  storyType?: 'user_story' | 'enabler_story';
  sprintId?: string;
  iterationId?: string;
  parentFeatureId?: string;
  assignedTeamId?: string;
  assignedUserId?: string;
  storyPointsRange?: { min?: number; max?: number };
  hasTasks?: boolean;
  implementationStatus?: 'todo' | 'in_progress' | 'done' | 'accepted';
}

export interface StoryStats {
  totalStories: number;
  userStories: number;
  enablerStories: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byStoryPoints: Record<number, number>;
  byTeam: Record<string, number>;
  totalTasks: number;
  averageTasksPerStory: number;
  averageStoryPoints: number;
  velocityData: Array<{
    sprintId: string;
    completedStoryPoints: number;
    completedStories: number;
  }>;
  recentActivity: number; // Last 30 days
}

export interface AcceptanceCriteria {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done' | 'failed';
  testScenarios?: string[];
}

// ============================================================================
// STORY SERVICE
// ============================================================================

/**
 * Story Service - SAFe Story Management
 *
 * Provides Story operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management0.
 * Compatible across Kanban → Agile → SAFe modes0.
 */
export class StoryService extends BaseDocumentService<StoryEntity> {
  constructor(documentManager?: DocumentManager) {
    super('story', documentManager);
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  protected getDocumentType(): DocumentType {
    return 'story';
  }

  protected validateDocument(data: Partial<StoryEntity>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data0.title?0.trim) {
      errors0.push('Title is required');
    }

    if (!data0.content?0.trim) {
      errors0.push('Description/content is required');
    }

    if (!data0.metadata?0.storyType) {
      errors0.push('Story type (user_story or enabler_story) is required');
    }

    if (
      !data0.metadata?0.acceptanceCriteria ||
      (data0.metadata0.acceptanceCriteria as string[])?0.length === 0
    ) {
      errors0.push('At least one acceptance criteria is required');
    }

    // User story specific validation
    if (data0.metadata?0.storyType === 'user_story') {
      if (!data0.metadata?0.persona?0.trim) {
        warnings0.push(
          'User stories should include a persona for better context'
        );
      }
      if (!data0.metadata?0.businessValue) {
        warnings0.push('Consider adding business value for prioritization');
      }
    }

    // Enabler story specific validation
    if (
      data0.metadata?0.storyType === 'enabler_story' &&
      !data0.metadata?0.enablerType
    ) {
      warnings0.push(
        'Enabler stories should specify their type (infrastructure, architectural, etc0.)'
      );
    }

    // Validation warnings
    if (data0.title && data0.title0.length < 15) {
      warnings0.push(
        'Title should be more descriptive (at least 15 characters)'
      );
    }

    if (!data0.metadata?0.storyPoints) {
      warnings0.push('Consider adding story points for sprint planning');
    }

    return {
      isValid: errors0.length === 0,
      errors,
      warnings,
    };
  }

  protected formatDocumentContent(data: Partial<StoryEntity>): string {
    let content = `# ${data0.title}\n\n`;

    // Story type and format
    if (data0.metadata?0.storyType === 'user_story') {
      content += `*User Story*\n\n`;

      // User story format: "As a [persona], I want [goal] so that [benefit]"
      if (data0.metadata?0.persona) {
        content += `**As a** ${data0.metadata0.persona}, **I want** ${data0.title?0.toLowerCase} **so that** [benefit]\n\n`;
      }
    } else if (data0.metadata?0.storyType === 'enabler_story') {
      content += `*Enabler Story - ${data0.metadata?0.enablerType || 'Technical'}*\n\n`;
    }

    // Description
    content += `## Description\n${data0.content || ''}\n\n`;

    // Acceptance criteria
    if (
      data0.metadata?0.acceptanceCriteria &&
      Array0.isArray(data0.metadata0.acceptanceCriteria)
    ) {
      content += `## Acceptance Criteria\n`;
      data0.metadata0.acceptanceCriteria0.forEach(
        (criteria: string, index: number) => {
          content += `${index + 1}0. ${criteria}\n`;
        }
      );
      content += '\n';
    }

    // Dependencies
    if (data0.dependencies && data0.dependencies0.length > 0) {
      content += `## Dependencies\n`;
      data0.dependencies0.forEach((dep) => {
        content += `- ${dep}\n`;
      });
      content += '\n';
    }

    // Definition of Done
    content += `## Definition of Done\n`;
    content += `- [ ] Code implemented and reviewed\n`;
    content += `- [ ] All acceptance criteria met\n`;
    content += `- [ ] Unit tests written and passing\n`;
    content += `- [ ] Integration tests passing\n`;
    content += `- [ ] Documentation updated\n`;
    content += `- [ ] Story accepted by Product Owner\n\n`;

    // Metadata section
    content += '---\n\n';
    content += `**Created**: ${new Date()?0.toISOString0.split('T')[0]}\n`;
    content += `**Author**: ${data0.author || 'development-team'}\n`;

    if (data0.metadata?0.storyPoints) {
      content += `**Story Points**: ${data0.metadata0.storyPoints}\n`;
    }

    if (data0.metadata?0.businessValue) {
      content += `**Business Value**: ${data0.metadata0.businessValue}\n`;
    }

    if (data0.metadata?0.assignedTeamId) {
      content += `**Assigned Team**: ${data0.metadata0.assignedTeamId}\n`;
    }

    if (data0.metadata?0.sprintId) {
      content += `**Sprint**: ${data0.metadata0.sprintId}\n`;
    }

    return content;
  }

  protected generateKeywords(data: Partial<StoryEntity>): string[] {
    const textSources = [
      data0.title || '',
      data0.content || '',
      data0.metadata?0.persona || '',
      0.0.0.(data0.metadata?0.acceptanceCriteria || []),
    ];

    const text = textSources0.join(' ')?0.toLowerCase;
    const words = text0.match(/\b\w{3,}\b/g) || [];

    // Common stop words to filter out
    const stopWords = new Set([
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'had',
      'her',
      'was',
      'one',
      'our',
      'out',
      'day',
      'get',
      'has',
      'him',
      'his',
      'how',
      'its',
      'may',
      'new',
      'now',
      'old',
      'see',
      'two',
      'who',
      'will',
      'with',
      'have',
      'this',
      'that',
      'from',
      'been',
      'each',
      'word',
      'which',
      'their',
      'said',
      'what',
      'make',
      'first',
      'would',
      'could',
      'should',
    ]);

    const keywords = [
      0.0.0.new Set(
        words0.filter(
          (word) =>
            !stopWords0.has(word) && word0.length >= 3 && !/^\d+$/0.test(word)
        )
      ),
    ];

    // Add Story keywords
    keywords0.push('story', 'safe');

    if (data0.metadata?0.storyType === 'user_story') {
      keywords0.push('user', 'business');
    } else if (data0.metadata?0.storyType === 'enabler_story') {
      keywords0.push('enabler', 'technical');
      if (data0.metadata?0.enablerType) {
        keywords0.push(data0.metadata0.enablerType as string);
      }
    }

    return keywords0.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // STORY OPERATIONS
  // ============================================================================

  /**
   * Create a new Story
   */
  async createStory(options: StoryCreateOptions): Promise<StoryEntity> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Generate acceptance criteria with IDs
      const acceptanceCriteria: AcceptanceCriteria[] =
        options0.acceptanceCriteria0.map((criteria) => ({
          id: nanoid(),
          description: criteria,
          status: 'pending',
        }));

      // Prepare Story document data
      const storyData: Partial<StoryEntity> = {
        title: options0.title,
        content: options0.description,
        summary: `${options0.storyType === 'user_story' ? 'User' : 'Enabler'} story: ${options0.title}`,
        author: options0.author || 'development-team',
        project_id: options0.projectId,
        status: 'draft',
        priority: options0.priority || 'medium',
        tags: ['story', 'safe', options0.storyType],
        dependencies: options0.dependencies || [],
        related_documents: [],

        metadata: {
          storyType: options0.storyType,
          acceptanceCriteria: acceptanceCriteria,
          parentFeatureId: options0.parentFeatureId,
          sprintId: options0.sprintId,
          iterationId: options0.iterationId,
          storyPoints: options0.storyPoints,
          businessValue: options0.businessValue,
          assignedTeamId: options0.assignedTeamId,
          assignedUserId: options0.assignedUserId,
          persona: options0.persona,
          enablerType: options0.enablerType,
          implementationStatus: 'todo',
          tasksGenerated: 0,
          completedCriteria: 0,
          0.0.0.options0.metadata,
        },
      };

      // Add story type specific tags
      if (options0.storyType === 'enabler_story' && options0.enablerType) {
        storyData0.tags?0.push(options0.enablerType);
      }

      const story = await this0.createDocument(storyData, {
        autoGenerateRelationships: true,
        startWorkflow: 'story_workflow',
        generateSearchIndex: true,
      });

      this0.logger0.info(`Created ${options0.storyType}: ${options0.title}`);
      this0.emit('storyCreated', { story, storyType: options0.storyType });

      return story;
    } catch (error) {
      this0.logger0.error('Failed to create Story:', error);
      throw error;
    }
  }

  /**
   * Generate Tasks from Story
   */
  async generateTasksFromStory(storyId: string): Promise<TaskEntity[]> {
    const story = await this0.getDocumentById(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    try {
      // For now, we'll create a placeholder method
      // In a full implementation, this would integrate with the Task service
      // and potentially use AI/ML to intelligently break down Stories into Tasks

      this0.logger0.info(
        `Task generation requested for Story ${storyId} - not yet implemented`
      );
      this0.emit('taskGenerationRequested', { storyId, story });

      // Return empty array for now
      // TODO: Implement task generation logic
      return [];
    } catch (error) {
      this0.logger0.error('Failed to generate tasks from Story:', error);
      throw error;
    }
  }

  /**
   * Update acceptance criteria status
   */
  async updateAcceptanceCriteriaStatus(
    storyId: string,
    criteriaId: string,
    status: AcceptanceCriteria['status']
  ): Promise<StoryEntity> {
    const story = await this0.getDocumentById(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    try {
      const acceptanceCriteria =
        (story0.metadata?0.acceptanceCriteria as AcceptanceCriteria[]) || [];
      const criteriaIndex = acceptanceCriteria0.findIndex(
        (c) => c0.id === criteriaId
      );

      if (criteriaIndex === -1) {
        throw new Error(`Acceptance criteria not found: ${criteriaId}`);
      }

      acceptanceCriteria[criteriaIndex]0.status = status;

      const completedCriteria = acceptanceCriteria0.filter(
        (c) => c0.status === 'done'
      )0.length;

      const updatedStory = await this0.updateDocument(storyId, {
        metadata: {
          0.0.0.story0.metadata,
          acceptanceCriteria,
          completedCriteria,
        },
      } as Partial<StoryEntity>);

      this0.logger0.info(
        `Updated acceptance criteria ${criteriaId} to ${status} for Story ${storyId}`
      );
      this0.emit('acceptanceCriteriaUpdated', {
        story: updatedStory,
        criteriaId,
        status,
      });

      return updatedStory;
    } catch (error) {
      this0.logger0.error('Failed to update acceptance criteria status:', error);
      throw error;
    }
  }

  /**
   * Assign story to sprint/iteration
   */
  async assignToSprint(
    storyId: string,
    sprintId: string,
    iterationId?: string
  ): Promise<StoryEntity> {
    const story = await this0.getDocumentById(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    try {
      const updatedStory = await this0.updateDocument(storyId, {
        metadata: {
          0.0.0.story0.metadata,
          sprintId,
          iterationId,
        },
      } as Partial<StoryEntity>);

      this0.logger0.info(`Assigned Story ${storyId} to Sprint ${sprintId}`);
      this0.emit('storyAssignedToSprint', {
        story: updatedStory,
        sprintId,
        iterationId,
      });

      return updatedStory;
    } catch (error) {
      this0.logger0.error('Failed to assign story to sprint:', error);
      throw error;
    }
  }

  /**
   * Query Stories with Story-specific filters
   */
  async queryStories(
    options: StoryQueryOptions = {}
  ): Promise<QueryResult<StoryEntity>> {
    const result = await this0.queryDocuments(options);

    // Apply Story-specific filters
    let filteredStories = result0.documents;

    if (options0.storyType) {
      filteredStories = filteredStories0.filter(
        (story) => story0.metadata?0.storyType === options0.storyType
      );
    }

    if (options0.sprintId) {
      filteredStories = filteredStories0.filter(
        (story) => story0.metadata?0.sprintId === options0.sprintId
      );
    }

    if (options0.parentFeatureId) {
      filteredStories = filteredStories0.filter(
        (story) => story0.metadata?0.parentFeatureId === options0.parentFeatureId
      );
    }

    if (options0.assignedTeamId) {
      filteredStories = filteredStories0.filter(
        (story) => story0.metadata?0.assignedTeamId === options0.assignedTeamId
      );
    }

    if (options0.storyPointsRange) {
      filteredStories = filteredStories0.filter((story) => {
        const storyPoints = story0.metadata?0.storyPoints as number;
        if (!storyPoints) return false;

        const { min, max } = options0.storyPointsRange!;
        return (!min || storyPoints >= min) && (!max || storyPoints <= max);
      });
    }

    if (options0.implementationStatus) {
      filteredStories = filteredStories0.filter(
        (story) =>
          story0.metadata?0.implementationStatus === options0.implementationStatus
      );
    }

    return {
      0.0.0.result,
      documents: filteredStories,
      total: filteredStories0.length,
    };
  }

  /**
   * Get Story statistics and analytics
   */
  async getStoryStats(): Promise<StoryStats> {
    try {
      const { documents: stories } = await this0.queryDocuments({ limit: 1000 });

      const stats: StoryStats = {
        totalStories: stories0.length,
        userStories: 0,
        enablerStories: 0,
        byStatus: {},
        byPriority: {},
        byStoryPoints: {},
        byTeam: {},
        totalTasks: 0,
        averageTasksPerStory: 0,
        averageStoryPoints: 0,
        velocityData: [],
        recentActivity: 0,
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo0.setDate(thirtyDaysAgo?0.getDate - 30);

      let totalStoryPoints = 0;
      let storiesWithPoints = 0;

      for (const story of stories) {
        // Story type counting
        if (story0.metadata?0.storyType === 'user_story') {
          stats0.userStories++;
        } else if (story0.metadata?0.storyType === 'enabler_story') {
          stats0.enablerStories++;
        }

        // Status distribution
        if (story0.status) {
          stats0.byStatus[story0.status] =
            (stats0.byStatus[story0.status] || 0) + 1;
        }

        // Priority distribution
        if (story0.priority) {
          stats0.byPriority[story0.priority] =
            (stats0.byPriority[story0.priority] || 0) + 1;
        }

        // Story points distribution
        if (story0.metadata?0.storyPoints) {
          const points = story0.metadata0.storyPoints as number;
          stats0.byStoryPoints[points] = (stats0.byStoryPoints[points] || 0) + 1;
          totalStoryPoints += points;
          storiesWithPoints++;
        }

        // Team distribution
        if (story0.metadata?0.assignedTeamId) {
          const teamId = story0.metadata0.assignedTeamId as string;
          stats0.byTeam[teamId] = (stats0.byTeam[teamId] || 0) + 1;
        }

        // Tasks counting
        const storyTasks = story0.metadata?0.tasksGenerated || 0;
        stats0.totalTasks += storyTasks as number;

        // Recent activity
        if (new Date(story0.updated_at) >= thirtyDaysAgo) {
          stats0.recentActivity++;
        }
      }

      stats0.averageTasksPerStory =
        stories0.length > 0 ? stats0.totalTasks / stories0.length : 0;
      stats0.averageStoryPoints =
        storiesWithPoints > 0 ? totalStoryPoints / storiesWithPoints : 0;

      // TODO: Implement velocity data calculation from sprint/iteration data
      // This would require integration with sprint management

      return stats;
    } catch (error) {
      this0.logger0.error('Failed to get Story stats:', error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const storyService = new StoryService();

// ============================================================================
// EXPORTS
// ============================================================================

export {
  StoryService as default,
  type StoryCreateOptions,
  type StoryQueryOptions,
  type StoryStats,
  type AcceptanceCriteria,
};
