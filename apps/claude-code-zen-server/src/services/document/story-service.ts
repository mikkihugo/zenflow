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
 * Follows Google TypeScript conventions and facade pattern.
 * Compatible across Kanban → Agile → SAFe modes.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1..0
 */

import type { DocumentType } from '@claude-zen/enterprise';
import { nanoid } from 'nanoid';

import type { StoryEntity, TaskEntity } from './../entities/document-entities';

import {
  BaseDocumentService,
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from "./base-document-service";
import('./document-service';

// ============================================================================
// STORY INTERFACES
// ============================================================================

export interface StoryCreateOptions {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyType: 'user_story | enabler_story';
  parentFeatureId?: string;
  sprintId?: string;
  iterationId?: string;
  priority?: 'low | medium' | 'high | critical';
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
  storyType?: 'user_story | enabler_story';
  sprintId?: string;
  iterationId?: string;
  parentFeatureId?: string;
  assignedTeamId?: string;
  assignedUserId?: string;
  storyPointsRange?: { min?: number; max?: number };
  hasTasks?: boolean;
  implementationStatus?: 'todo | in_progress' | 'done | accepted';
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
  status: 'pending | in_progress' | 'done | failed';
  testScenarios?: string[];
}

// ============================================================================
// STORY SERVICE
// ============================================================================

/**
 * Story Service - SAFe Story Management
 *
 * Provides Story operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management.
 * Compatible across Kanban → Agile → SAFe modes.
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
    if (!data.title?.trim) {
      errors.push('Title is required');
    }

    if (!data.content?.trim) {
      errors.push('Description/content is required');
    }

    if (!data.metadata?.storyType) {
      errors.push('Story type (user_story or enabler_story) is required');
    }

    if (
      !data.metadata?.acceptanceCriteria ||
      (data.metadata.acceptanceCriteria as string[])?.length === 0
    ) {
      errors.push('At least one acceptance criteria is required');
    }

    // User story specific validation
    if (data.metadata?.storyType === 'user_story') {
      if (!data.metadata?.persona?.trim) {
        warnings.push(
          'User stories should include a persona for better context'
        );
      }
      if (!data.metadata?.businessValue) {
        warnings.push('Consider adding business value for prioritization');
      }
    }

    // Enabler story specific validation
    if (
      data.metadata?.storyType === 'enabler_story' &&
      !data.metadata?.enablerType
    ) {
      warnings.push(
        'Enabler stories should specify their type (infrastructure, architectural, etc.)'
      );
    }

    // Validation warnings
    if (data.title && data.title.length < 15) {
      warnings.push(
        'Title should be more descriptive (at least 15 characters)'
      );
    }

    if (!data.metadata?.storyPoints) {
      warnings.push('Consider adding story points for sprint planning');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  protected formatDocumentContent(data: Partial<StoryEntity>): string {
    let content = `# ${data.title}\n\n`;

    // Story type and format
    if (data.metadata?.storyType === 'user_story') {
      content += `*User Story*\n\n`;

      // User story format: "As a [persona], I want [goal] so that [benefit]"
      if (data.metadata?.persona) {
        content += `**As a** ${data.metadata.persona}, **I want** ${data.title?.toLowerCase} **so that** [benefit]\n\n`;
      }
    } else if (data.metadata?.storyType === 'enabler_story') {
      content += `*Enabler Story - ${data.metadata?.enablerType || 'Technical'}*\n\n`;
    }

    // Description
    content += `## Description\n${data.content || ''}\n\n`;

    // Acceptance criteria
    if (
      data.metadata?.acceptanceCriteria &&
      Array.isArray(data.metadata.acceptanceCriteria)
    ) {
      content += `## Acceptance Criteria\n`;
      data.metadata.acceptanceCriteria.forEach(
        (criteria: string, index: number) => {
          content += `${index + 1}. ${criteria}\n`;
        }
      );
      content += '\n';
    }

    // Dependencies
    if (data.dependencies && data.dependencies.length > 0) {
      content += `## Dependencies\n`;
      data.dependencies.forEach((dep) => {
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
    content += `**Created**: ${new Date()?.toISOString.split('T')[0]}\n`;
    content += `**Author**: ${data.author || 'development-team'}\n`;

    if (data.metadata?.storyPoints) {
      content += `**Story Points**: ${data.metadata.storyPoints}\n`;
    }

    if (data.metadata?.businessValue) {
      content += `**Business Value**: ${data.metadata.businessValue}\n`;
    }

    if (data.metadata?.assignedTeamId) {
      content += `**Assigned Team**: ${data.metadata.assignedTeamId}\n`;
    }

    if (data.metadata?.sprintId) {
      content += `**Sprint**: ${data.metadata.sprintId}\n`;
    }

    return content;
  }

  protected generateKeywords(data: Partial<StoryEntity>): string[] {
    const textSources = [
      data.title || '',
      data.content || '',
      data.metadata?.persona || '',
      ...(data.metadata?.acceptanceCriteria || []),
    ];

    const text = textSources.join(' ')?.toLowerCase()
    const words = text.match(/\b\w{3,}\b/g) || [];

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
      ...new Set(
        words.filter(
          (word) =>
            !stopWords.has(word) && word.length >= 3 && !/^\d+$/.test(word)
        )
      ),
    ];

    // Add Story keywords
    keywords.push('story, safe');

    if (data.metadata?.storyType === 'user_story') {
      keywords.push('user, business');
    } else if (data.metadata?.storyType === 'enabler_story') {
      keywords.push('enabler, technical');
      if (data.metadata?.enablerType) {
        keywords.push(data.metadata.enablerType as string);
      }
    }

    return keywords.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // STORY OPERATIONS
  // ============================================================================

  /**
   * Create a new Story
   */
  async createStory(options: StoryCreateOptions): Promise<StoryEntity> {
    if (!this.initialized) await this.initialize;

    try {
      // Generate acceptance criteria with IDs
      const acceptanceCriteria: AcceptanceCriteria[] =
        options.acceptanceCriteria.map((criteria) => ({
          id: nanoid(),
          description: criteria,
          status: 'pending',
        }));

      // Prepare Story document data
      const storyData: Partial<StoryEntity> = {
        title: options.title,
        content: options.description,
        summary: `${options.storyType === 'user_story ? User' : 'Enabler'} story: ${options.title}`,
        author: options.author || 'development-team',
        project_id: options.projectId,
        status: 'draft',
        priority: options.priority || 'medium',
        tags: ['story, safe', options.storyType],
        dependencies: options.dependencies || [],
        related_documents: [],

        metadata: {
          storyType: options.storyType,
          acceptanceCriteria: acceptanceCriteria,
          parentFeatureId: options.parentFeatureId,
          sprintId: options.sprintId,
          iterationId: options.iterationId,
          storyPoints: options.storyPoints,
          businessValue: options.businessValue,
          assignedTeamId: options.assignedTeamId,
          assignedUserId: options.assignedUserId,
          persona: options.persona,
          enablerType: options.enablerType,
          implementationStatus: 'todo',
          tasksGenerated: 0,
          completedCriteria: 0,
          ...options.metadata,
        },
      };

      // Add story type specific tags
      if (options.storyType === 'enabler_story' && options.enablerType) {
        storyData.tags?.push(options.enablerType);
      }

      const story = await this.createDocument(storyData, {
        autoGenerateRelationships: true,
        startWorkflow: 'story_workflow',
        generateSearchIndex: true,
      });

      this.logger.info(`Created ${options.storyType}: ${options.title}`);
      this.emit('storyCreated', { story, storyType: options.storyType });

      return story;
    } catch (error) {
      this.logger.error('Failed to create Story:', error);
      throw error;
    }
  }

  /**
   * Generate Tasks from Story
   */
  async generateTasksFromStory(storyId: string): Promise<TaskEntity[]> {
    const story = await this.getDocumentById(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    try {
      // For now, we'll create a placeholder method
      // In a full implementation, this would integrate with the Task service
      // and potentially use AI/ML to intelligently break down Stories into Tasks

      this.logger.info(
        `Task generation requested for Story ${storyId} - not yet implemented`
      );
      this.emit('taskGenerationRequested', { storyId, story });

      // Return empty array for now
      // TODO: Implement task generation logic
      return [];
    } catch (error) {
      this.logger.error('Failed to generate tasks from Story:', error);
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
    const story = await this.getDocumentById(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    try {
      const acceptanceCriteria =
        (story.metadata?.acceptanceCriteria as AcceptanceCriteria[]) || [];
      const criteriaIndex = acceptanceCriteria.findIndex(
        (c) => c.id === criteriaId
      );

      if (criteriaIndex === -1) {
        throw new Error(`Acceptance criteria not found: ${criteriaId}`);
      }

      acceptanceCriteria[criteriaIndex].status = status;

      const completedCriteria = acceptanceCriteria.filter(
        (c) => c.status === 'done'
      ).length;

      const updatedStory = await this.updateDocument(storyId, {
        metadata: {
          ...story.metadata,
          acceptanceCriteria,
          completedCriteria,
        },
      } as Partial<StoryEntity>);

      this.logger.info(
        `Updated acceptance criteria ${criteriaId} to ${status} for Story ${storyId}`
      );
      this.emit('acceptanceCriteriaUpdated', {
        story: updatedStory,
        criteriaId,
        status,
      });

      return updatedStory;
    } catch (error) {
      this.logger.error('Failed to update acceptance criteria status:', error);
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
    const story = await this.getDocumentById(storyId);
    if (!story) {
      throw new Error(`Story not found: ${storyId}`);
    }

    try {
      const updatedStory = await this.updateDocument(storyId, {
        metadata: {
          ...story.metadata,
          sprintId,
          iterationId,
        },
      } as Partial<StoryEntity>);

      this.logger.info(`Assigned Story ${storyId} to Sprint ${sprintId}`);
      this.emit('storyAssignedToSprint', {
        story: updatedStory,
        sprintId,
        iterationId,
      });

      return updatedStory;
    } catch (error) {
      this.logger.error('Failed to assign story to sprint:', error);
      throw error;
    }
  }

  /**
   * Query Stories with Story-specific filters
   */
  async queryStories(
    options: StoryQueryOptions = {}
  ): Promise<QueryResult<StoryEntity>> {
    const result = await this.queryDocuments(options);

    // Apply Story-specific filters
    let filteredStories = result.documents;

    if (options.storyType) {
      filteredStories = filteredStories.filter(
        (story) => story.metadata?.storyType === options.storyType
      );
    }

    if (options.sprintId) {
      filteredStories = filteredStories.filter(
        (story) => story.metadata?.sprintId === options.sprintId
      );
    }

    if (options.parentFeatureId) {
      filteredStories = filteredStories.filter(
        (story) => story.metadata?.parentFeatureId === options.parentFeatureId
      );
    }

    if (options.assignedTeamId) {
      filteredStories = filteredStories.filter(
        (story) => story.metadata?.assignedTeamId === options.assignedTeamId
      );
    }

    if (options.storyPointsRange) {
      filteredStories = filteredStories.filter((story) => {
        const storyPoints = story.metadata?.storyPoints as number;
        if (!storyPoints) return false;

        const { min, max } = options.storyPointsRange!;
        return (!min || storyPoints >= min) && (!max || storyPoints <= max);
      });
    }

    if (options.implementationStatus) {
      filteredStories = filteredStories.filter(
        (story) =>
          story.metadata?.implementationStatus === options.implementationStatus
      );
    }

    return {
      ...result,
      documents: filteredStories,
      total: filteredStories.length,
    };
  }

  /**
   * Get Story statistics and analytics
   */
  async getStoryStats(): Promise<StoryStats> {
    try {
      const { documents: stories } = await this.queryDocuments({ limit: 1000 });

      const stats: StoryStats = {
        totalStories: stories.length,
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
      thirtyDaysAgo.setDate(thirtyDaysAgo?.getDate - 30);

      let totalStoryPoints = 0;
      let storiesWithPoints = 0;

      for (const story of stories) {
        // Story type counting
        if (story.metadata?.storyType === 'user_story') {
          stats.userStories++;
        } else if (story.metadata?.storyType === 'enabler_story') {
          stats.enablerStories++;
        }

        // Status distribution
        if (story.status) {
          stats.byStatus[story.status] =
            (stats.byStatus[story.status] || 0) + 1;
        }

        // Priority distribution
        if (story.priority) {
          stats.byPriority[story.priority] =
            (stats.byPriority[story.priority] || 0) + 1;
        }

        // Story points distribution
        if (story.metadata?.storyPoints) {
          const points = story.metadata.storyPoints as number;
          stats.byStoryPoints[points] = (stats.byStoryPoints[points] || 0) + 1;
          totalStoryPoints += points;
          storiesWithPoints++;
        }

        // Team distribution
        if (story.metadata?.assignedTeamId) {
          const teamId = story.metadata.assignedTeamId as string;
          stats.byTeam[teamId] = (stats.byTeam[teamId] || 0) + 1;
        }

        // Tasks counting
        const storyTasks = story.metadata?.tasksGenerated || 0;
        stats.totalTasks += storyTasks as number;

        // Recent activity
        if (new Date(story.updated_at) >= thirtyDaysAgo) {
          stats.recentActivity++;
        }
      }

      stats.averageTasksPerStory =
        stories.length > 0 ? stats.totalTasks / stories.length : 0;
      stats.averageStoryPoints =
        storiesWithPoints > 0 ? totalStoryPoints / storiesWithPoints : 0;

      // TODO: Implement velocity data calculation from sprint/iteration data
      // This would require integration with sprint management

      return stats;
    } catch (error) {
      this.logger.error('Failed to get Story stats:', error);
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
