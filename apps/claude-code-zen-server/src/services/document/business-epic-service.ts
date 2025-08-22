/**
 * @fileoverview Business Epic Service - SAFe Business Epic Management
 *
 * Extends BaseDocumentService to provide Business Epic functionality including:
 * - Business value capture and requirements breakdown
 * - Program Epic generation from Business Epics
 * - User story creation and tracking
 * - Acceptance criteria validation
 * - Requirements prioritization (MoSCoW method)
 *
 * Follows Google TypeScript conventions and facade pattern.
 * Compatible across Kanban → Agile → SAFe modes.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1..0
 */

import type { DocumentType } from '@claude-zen/enterprise');
import { nanoid } from 'nanoid');

import {
  BaseDocumentService,
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from "./base-document-service";
import('/document-schemas');
import('/document-service');

// ============================================================================
// BUSINESS EPIC INTERFACES
// ============================================================================

export interface FunctionalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'must_have | should_have' | 'could_have | wont_have');
  complexity?: 'low | medium' | 'high | very_high');
  estimatedEffort?: number; // story points or hours
}

export interface NonFunctionalRequirement {
  id: string;
  type:
    | 'performance'
    | 'security'
    | 'usability'
    | 'reliability'
    | 'scalability'
    | 'maintainability');
  description: string;
  metrics: string;
  priority: 'must_have | should_have' | 'could_have | wont_have');
  testable: boolean;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
  priority: 'must_have | should_have' | 'could_have | wont_have');
  persona?: string; // user persona
  businessValue?: string;
}

export interface BusinessEpicCreateOptions {
  title: string;
  description: string;
  businessObjective: string;
  targetAudience: string[];
  functionalRequirements: Omit<FunctionalRequirement, 'id'>[];
  nonFunctionalRequirements?: Omit<NonFunctionalRequirement, 'id'>[];
  userStories?: Omit<UserStory, 'id'>[];
  successMetrics?: string[];
  constraints?: string[];
  assumptions?: string[];
  outOfScope?: string[];
  author?: string;
  projectId?: string;
  priority?: 'low | medium' | 'high | critical');
  stakeholders?: string[];
  deliveryTimeline?: {
    startDate?: Date;
    targetDate?: Date;
    milestones?: Array<{
      name: string;
      date: Date;
      description: string;
    }>;
  };
  metadata?: Record<string, unknown>;
}

export interface BusinessEpicQueryOptions extends QueryFilters {
  businessObjective?: string;
  targetAudience?: string;
  requirementsPriority?:
    | 'must_have'
    | 'should_have'
    | 'could_have'
    | 'wont_have');
  hasUserStories?: boolean;
  completionStatus?:
    | 'planning'
    | 'in_progress'
    | 'review'
    | 'approved'
    | 'implemented');
}

export interface RequirementProgress {
  totalRequirements: number;
  completedRequirements: number;
  completionPercentage: number;
  requirementsByPriority: Record<string, number>;
  requirementsByStatus: Record<string, number>;
  userStoriesTotal: number;
  userStoriesCompleted: number;
  userStoryCompletionPercentage: number;
}

export interface BusinessEpicStats {
  totalPrds: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  totalRequirements: number;
  requirementsByPriority: Record<string, number>;
  totalUserStories: number;
  averageRequirementsPerPrd: number;
  averageUserStoriesPerPrd: number;
  recentActivity: number; // Last 30 days
}

// ============================================================================
// BUSINESS EPIC SERVICE
// ============================================================================

/**
 * Business Epic Service - SAFe Business Epic Management
 *
 * Provides Business Epic operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management.
 * Compatible across Kanban → Agile → SAFe modes.
 */
export class BusinessEpicService extends BaseDocumentService<any> {
  private currentMode: 'kanban | agile' | 'safe = kanban');

  constructor(
    documentManager?: DocumentManager,
    mode: 'kanban | agile' | 'safe = kanban'
  ) {
    super('business-epic', documentManager);
    this.currentMode = mode;
  }

  /**
   * Set the current project mode (determines schema version)
   */
  setProjectMode(mode: 'kanban | agile' | 'safe'): void {
    this.currentMode = mode;
    this.logger.info(`Business Epic service set to ${mode} mode`);
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  protected getDocumentType(): DocumentType {
    return 'business_epic');
  }

  protected validateDocument(data: Partial<any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data.title?.trim) {
      errors.push('Title is required');
    }

    if (!data.content?.trim) {
      errors.push('Description/content is required');
    }

    // Requirements validation (mode-dependent)
    if (this.currentMode === 'kanban') {
      if (!data.requirements || data.requirements.length === 0) {
        errors.push('At least one requirement is required');
      }
    } else {
      // Agile/SAFe modes use structured functional requirements
      if (
        !data.functional_requirements ||
        data.functional_requirements.length === 0
      ) {
        errors.push('At least one functional requirement is required');
      } else {
        data.functional_requirements.forEach((req: any, index: number) => {
          if (!req.description?.trim) {
            errors.push(
              `Functional requirement ${index + 1} must have a description`
            );
          }
          if (!req.acceptanceCriteria || req.acceptanceCriteria.length === 0) {
            errors.push(
              `Functional requirement ${index + 1} must have acceptance criteria`
            );
          }
        });
      }
    }

    // Validation warnings
    if (data.title && data.title.length < 15) {
      warnings.push(
        'Title should be more descriptive (at least 15 characters)'
      );
    }

    // Mode-specific warnings
    if (this.currentMode === 'agile || this.currentMode === safe') {
      if (!data.user_stories || data.user_stories.length === 0) {
        warnings.push(
          'Consider adding user stories for better implementation guidance'
        );
      }

      if (
        !data.non_functional_requirements ||
        data.non_functional_requirements.length === 0
      ) {
        warnings.push(
          'Consider adding non-functional requirements (performance, security, etc.)'
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  protected formatDocumentContent(data: Partial<any>): string {
    let content = `# ${data.title}\n\n`;

    // Business objective (all modes)
    if (data.business_objective || data.metadata?.businessObjective) {
      content += `## Business Objective\n${data.business_objective || data.metadata?.businessObjective}\n\n`;
    }

    // Target audience (all modes)
    const targetAudience =
      data.target_audience || data.metadata?.targetAudience()
    if (targetAudience && Array.isArray(targetAudience)) {
      content += `## Target Audience\n`;
      targetAudience.forEach((audience: string) => {
        content += `- ${audience}\n`;
      });
      content += '\n');
    }

    // Description
    content += `## Description\n${data.content || ''}\n\n`;

    // Requirements (mode-dependent format)
    if (
      this.currentMode === 'kanban' &&
      data.requirements &&
      data.requirements.length > 0
    ) {
      content += `## Requirements\n`;
      data.requirements.forEach((req: string) => {
        content += `- ${req}\n`;
      });
      content += '\n');
    } else if (
      data.functional_requirements &&
      data.functional_requirements.length > 0
    ) {
      content += `## Functional Requirements\n\n`;
      data.functional_requirements.forEach((req: any, index: number) => {
        content += `### FR${index + 1}: ${req.description}\n`;
        content += `**Priority**: ${req.priority}\n`;
        if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
          content += `**Acceptance Criteria**:\n`;
          req.acceptanceCriteria.forEach((criteria: string) => {
            content += `- ${criteria}\n`;
          });
        }
        content += '\n');
      });
    }

    // Non-functional requirements
    if (
      data.non_functional_requirements &&
      data.non_functional_requirements.length > 0
    ) {
      content += `## Non-Functional Requirements\n\n`;
      data.non_functional_requirements.forEach((req, index) => {
        content += `### NFR${index + 1}: ${req.description}\n`;
        content += `**Type**: ${req.type}\n`;
        content += `**Metrics**: ${req.metrics}\n`;
        content += `**Priority**: ${req.priority || 'should_have'}\n\n`;
      });
    }

    // User stories
    if (data.user_stories && data.user_stories.length > 0) {
      content += `## User Stories\n\n`;
      data.user_stories.forEach((story, index) => {
        content += `### US${index + 1}: ${story.title}\n`;
        content += `${story.description}\n`;
        content += `**Priority**: ${story.priority}\n`;
        if (story.storyPoints) {
          content += `**Story Points**: ${story.storyPoints}\n`;
        }
        content += `**Acceptance Criteria**:\n`;
        story.acceptanceCriteria.forEach((criteria) => {
          content += `- ${criteria}\n`;
        });
        content += '\n');
      });
    }

    // Success metrics
    if (
      data.metadata?.successMetrics &&
      Array.isArray(data.metadata.successMetrics)
    ) {
      content += `## Success Metrics\n`;
      data.metadata.successMetrics.forEach((metric: string) => {
        content += `- ${metric}\n`;
      });
      content += '\n');
    }

    // Constraints and assumptions
    if (
      data.metadata?.constraints &&
      Array.isArray(data.metadata.constraints)
    ) {
      content += `## Constraints\n`;
      data.metadata.constraints.forEach((constraint: string) => {
        content += `- ${constraint}\n`;
      });
      content += '\n');
    }

    if (
      data.metadata?.assumptions &&
      Array.isArray(data.metadata.assumptions)
    ) {
      content += `## Assumptions\n`;
      data.metadata.assumptions.forEach((assumption: string) => {
        content += `- ${assumption}\n`;
      });
      content += '\n');
    }

    // Out of scope
    if (data.metadata?.outOfScope && Array.isArray(data.metadata.outOfScope)) {
      content += `## Out of Scope\n`;
      data.metadata.outOfScope.forEach((item: string) => {
        content += `- ${item}\n`;
      });
      content += '\n');
    }

    // Metadata section
    content += '---\n\n');
    content += `**Created**: ${new Date()?.toISOString.split('T')[0]}\n`;
    content += `**Author**: ${data.author || 'product-team'}\n`;

    if (
      data.metadata?.stakeholders &&
      Array.isArray(data.metadata.stakeholders)
    ) {
      content += `**Stakeholders**: ${data.metadata.stakeholders.join(', ')}\n`;
    }

    return content;
  }

  protected generateKeywords(data: Partial<any>): string[] {
    const textSources = [
      data.title || '',
      data.content || '',
      data.business_objective || data.metadata?.businessObjective || '',
      ...(data.requirements || []),
      ...(data.functional_requirements?.map((req: any) => req.description) ||
        []),
      ...(data.user_stories?.map(
        (story: any) => `${story.title} ${story.description}`
      ) || []),
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

    // Add Business Epic keywords
    keywords.push('business, epic', 'requirements');

    if (this.currentMode === 'agile || this.currentMode === safe') {
      keywords.push('functional, user-story');
    }

    if (this.currentMode === 'safe') {
      keywords.push('portfolio, safe');
    }

    return keywords.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // PRD-SPECIFIC OPERATIONS
  // ============================================================================

  /**
   * Create a new Business Epic with requirements
   */
  async createBusinessEpic(options: BusinessEpicCreateOptions): Promise<any> {
    if (!this.initialized) await this.initialize;

    try {
      // Generate IDs for requirements and user stories
      const functionalRequirements: FunctionalRequirement[] =
        options.functionalRequirements.map((req) => ({
          ...req,
          id: nanoid(),
        }));

      const nonFunctionalRequirements: NonFunctionalRequirement[] = (
        options.nonFunctionalRequirements || []
      ).map((req) => ({
        ...req,
        id: nanoid(),
      }));

      const userStories: UserStory[] = (options.userStories || []).map(
        (story) => ({
          ...story,
          id: nanoid(),
        })
      );

      // Create Business Epic document with current mode schema
      const businessEpicData = documentSchemaManager.createDocumentWithSchema(
        'business_epic',
        {
          title: options.title,
          content: options.description,
          summary: `Business epic for ${options.title}`,
          author: options.author || 'product-team',
          project_id: options.projectId,
          status: 'todo',
          priority: options.priority || 'medium',
          tags: ['business, epic'],
        },
        this.currentMode
      );

      // Add mode-specific fields
      businessEpicData.business_objective = options.businessObjective;
      businessEpicData.target_audience = options.targetAudience;

      if (this.currentMode === 'kanban') {
        businessEpicData.requirements = options.functionalRequirements.map(
          (req) => req.description
        );
      } else {
        businessEpicData.functional_requirements = functionalRequirements;
        businessEpicData.non_functional_requirements =
          nonFunctionalRequirements;

        if (this.currentMode === 'agile || this.currentMode === safe') {
          businessEpicData.user_stories = userStories;
          businessEpicData.acceptance_criteria = [];
          businessEpicData.definition_of_done = [
            'Requirements documented and approved',
            'User stories created and estimated',
            'Acceptance criteria defined',
          ];
        }

        if (this.currentMode === 'safe') {
          businessEpicData.epic_type = 'business');
          businessEpicData.epic_owner = options.author || 'product-team');
          businessEpicData.portfolio_canvas = {
            leading_indicators: [],
            success_metrics: options.successMetrics || [],
            mvp_hypothesis: '',
            solution_intent: '',
          };
          businessEpicData.program_epics_generated = 0;
        }
      }

      const businessEpic = await this.createDocument(businessEpicData, {
        autoGenerateRelationships: true,
        startWorkflow: 'business_epic_workflow',
        generateSearchIndex: true,
      });

      this.logger.info(
        `Created Business Epic: ${options.title} with ${functionalRequirements.length} requirements and ${userStories.length} user stories`
      );
      this.emit('businessEpicCreated', {
        businessEpic,
        requirementsCount: functionalRequirements.length,
        userStoriesCount: userStories.length,
      });

      return businessEpic;
    } catch (error) {
      this.logger.error('Failed to create Business Epic:', error);
      throw error;
    }
  }

  /**
   * Add functional requirement to existing PRD
   */
  async addFunctionalRequirement(
    prdId: string,
    requirement: Omit<FunctionalRequirement, 'id'>
  ): Promise<any> {
    const prd = await this.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      const newRequirement: FunctionalRequirement = {
        ...requirement,
        id: nanoid(),
      };

      const updatedRequirements = [
        ...(prd.functional_requirements || []),
        newRequirement,
      ];

      const updatedPrd = await this.updateDocument(prd.id, {
        functional_requirements: updatedRequirements,
        metadata: {
          ...prd.metadata,
          totalRequirements: (prd.metadata?.totalRequirements || 0) + 1,
          requirementsByPriority: this.countByPriority([
            ...updatedRequirements,
            ...(prd.non_functional_requirements || []),
          ]),
        },
      } as Partial<any>);

      this.logger.info(`Added functional requirement to PRD ${prdId}`);
      this.emit('requirementAdded', {
        prd: updatedPrd,
        requirement: newRequirement,
        type: 'functional',
      });

      return updatedPrd;
    } catch (error) {
      this.logger.error('Failed to add functional requirement:', error);
      throw error;
    }
  }

  /**
   * Add user story to existing PRD
   */
  async addUserStory(
    prdId: string,
    userStory: Omit<UserStory, 'id'>
  ): Promise<any> {
    const prd = await this.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      const newUserStory: UserStory = {
        ...userStory,
        id: nanoid(),
      };

      const updatedUserStories = [...(prd.user_stories || []), newUserStory];

      const updatedPrd = await this.updateDocument(prd.id, {
        user_stories: updatedUserStories,
        metadata: {
          ...prd.metadata,
          totalUserStories: updatedUserStories.length,
        },
      } as Partial<any>);

      this.logger.info(`Added user story to PRD ${prdId}`);
      this.emit('userStoryAdded', { prd: updatedPrd, userStory: newUserStory });

      return updatedPrd;
    } catch (error) {
      this.logger.error('Failed to add user story:', error);
      throw error;
    }
  }

  /**
   * Generate epics from PRD requirements
   */
  async generateEpicsFromPRD(prdId: string): Promise<any[]> {
    const prd = await this.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      // For now, we'll create a placeholder method
      // In a full implementation, this would integrate with the Epic service
      // and potentially use AI/ML to intelligently group requirements into epics

      this.logger.info(
        `Epic generation requested for PRD ${prdId} - not yet implemented`
      );
      this.emit('epicGenerationRequested', { prdId, prd });

      // Return empty array for now
      // TODO: Implement epic generation logic
      return [];
    } catch (error) {
      this.logger.error('Failed to generate epics from PRD:', error);
      throw error;
    }
  }

  /**
   * Track requirement implementation progress
   */
  async trackRequirementProgress(prdId: string): Promise<RequirementProgress> {
    const prd = await this.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      const functionalReqs = prd.functional_requirements || [];
      const nonFunctionalReqs = prd.non_functional_requirements || [];
      const userStories = prd.user_stories || [];

      const totalRequirements =
        functionalReqs.length + nonFunctionalReqs.length;

      // For now, we'll use a simple completion metric
      // In a full implementation, this would track actual implementation status
      const completionPercentage = Math.min(
        prd.completion_percentage || 0,
        100
      );
      const completedRequirements = Math.floor(
        (completionPercentage / 100) * totalRequirements
      );

      const requirementsByPriority = this.countByPriority([
        ...functionalReqs,
        ...nonFunctionalReqs,
      ]);

      // Mock status tracking for requirements
      const requirementsByStatus = {
        not_started: Math.floor(totalRequirements * .4),
        in_progress: Math.floor(totalRequirements * .3),
        completed: Math.floor(totalRequirements * .2),
        tested: Math.floor(totalRequirements * .1),
      };

      return {
        totalRequirements,
        completedRequirements,
        completionPercentage,
        requirementsByPriority,
        requirementsByStatus,
        userStoriesTotal: userStories.length,
        userStoriesCompleted: Math.floor(
          (completionPercentage / 100) * userStories.length
        ),
        userStoryCompletionPercentage: completionPercentage,
      };
    } catch (error) {
      this.logger.error('Failed to track requirement progress:', error);
      throw error;
    }
  }

  /**
   * Query PRDs with PRD-specific filters
   */
  async queryPrds(options: PRDQueryOptions = {}): Promise<QueryResult<any>> {
    const result = await this.queryDocuments(options);

    // Apply PRD-specific filters
    let filteredPrds = result.documents;

    if (options.businessObjective) {
      filteredPrds = filteredPrds.filter((prd) =>
        prd.metadata?.businessObjective?.toLowerCase.includes(
          options.businessObjective!?.toLowerCase
        )
      );
    }

    if (options.targetAudience) {
      filteredPrds = filteredPrds.filter(
        (prd) =>
          Array.isArray(prd.metadata?.targetAudience) &&
          prd.metadata.targetAudience.some((audience: string) =>
            audience?.toLowerCase.includes(options.targetAudience!?.toLowerCase)
          )
      );
    }

    if (options.requirementsPriority) {
      filteredPrds = filteredPrds.filter((prd) => {
        const allRequirements = [
          ...(prd.functional_requirements || []),
          ...(prd.non_functional_requirements || []),
        ];
        return allRequirements.some(
          (req) => req.priority === options.requirementsPriority
        );
      });
    }

    if (options.hasUserStories !== undefined) {
      filteredPrds = filteredPrds.filter((prd) => {
        const hasStories = prd.user_stories && prd.user_stories.length > 0;
        return options.hasUserStories ? hasStories : !hasStories;
      });
    }

    return {
      ...result,
      documents: filteredPrds,
      total: filteredPrds.length,
    };
  }

  /**
   * Get PRD statistics and analytics
   */
  async getPrdStats(): Promise<PRDStats> {
    try {
      const { documents: prds } = await this.queryDocuments({ limit: 1000 });

      const stats: PRDStats = {
        totalPrds: prds.length,
        byStatus: {},
        byPriority: {},
        totalRequirements: 0,
        requirementsByPriority: {},
        totalUserStories: 0,
        averageRequirementsPerPrd: 0,
        averageUserStoriesPerPrd: 0,
        recentActivity: 0,
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo?.getDate - 30);

      let totalRequirements = 0;
      let totalUserStories = 0;

      for (const prd of prds) {
        // Status distribution
        if (prd.status) {
          stats.byStatus[prd.status] = (stats.byStatus[prd.status] || 0) + 1;
        }

        // Priority distribution
        if (prd.priority) {
          stats.byPriority[prd.priority] =
            (stats.byPriority[prd.priority] || 0) + 1;
        }

        // Requirements counting
        const functionalReqs = prd.functional_requirements?.length || 0;
        const nonFunctionalReqs = prd.non_functional_requirements?.length || 0;
        const prdRequirements = functionalReqs + nonFunctionalReqs;
        totalRequirements += prdRequirements;

        // User stories counting
        const prdUserStories = prd.user_stories?.length || 0;
        totalUserStories += prdUserStories;

        // Requirements by priority
        const allRequirements = [
          ...(prd.functional_requirements || []),
          ...(prd.non_functional_requirements || []),
        ];

        allRequirements.forEach((req) => {
          stats.requirementsByPriority[req.priority] =
            (stats.requirementsByPriority[req.priority] || 0) + 1;
        });

        // Recent activity
        if (new Date(prd.updated_at) >= thirtyDaysAgo) {
          stats.recentActivity++;
        }
      }

      stats.totalRequirements = totalRequirements;
      stats.totalUserStories = totalUserStories;
      stats.averageRequirementsPerPrd =
        prds.length > 0 ? totalRequirements / prds.length : 0;
      stats.averageUserStoriesPerPrd =
        prds.length > 0 ? totalUserStories / prds.length : 0;

      return stats;
    } catch (error) {
      this.logger.error('Failed to get PRD stats:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Count items by priority
   */
  private countByPriority(
    items: Array<{ priority: string }>
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    items.forEach((item) => {
      counts[item.priority] = (counts[item.priority] || 0) + 1;
    });

    return counts;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const businessEpicService = new BusinessEpicService();

// ============================================================================
// EXPORTS
// ============================================================================

export {
  BusinessEpicService as default,
  type BusinessEpicCreateOptions,
  type BusinessEpicQueryOptions,
  type BusinessEpicStats,
  type FunctionalRequirement,
  type NonFunctionalRequirement,
  type UserStory,
  type RequirementProgress,
};
