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
 * Follows Google TypeScript conventions and facade pattern0.
 * Compatible across Kanban → Agile → SAFe modes0.
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 10.0.0
 */

import type { DocumentType } from '@claude-zen/enterprise';
import { nanoid } from 'nanoid';

import {
  BaseDocumentService,
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from '0./base-document-service';
import { documentSchemaManager } from '0./document-schemas';
import { DocumentManager } from '0./document-service';

// ============================================================================
// BUSINESS EPIC INTERFACES
// ============================================================================

export interface FunctionalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  complexity?: 'low' | 'medium' | 'high' | 'very_high';
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
    | 'maintainability';
  description: string;
  metrics: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  testable: boolean;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
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
  priority?: 'low' | 'medium' | 'high' | 'critical';
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
    | 'wont_have';
  hasUserStories?: boolean;
  completionStatus?:
    | 'planning'
    | 'in_progress'
    | 'review'
    | 'approved'
    | 'implemented';
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
 * for common operations like CRUD, search, and workflow management0.
 * Compatible across Kanban → Agile → SAFe modes0.
 */
export class BusinessEpicService extends BaseDocumentService<any> {
  private currentMode: 'kanban' | 'agile' | 'safe' = 'kanban';

  constructor(
    documentManager?: DocumentManager,
    mode: 'kanban' | 'agile' | 'safe' = 'kanban'
  ) {
    super('business-epic', documentManager);
    this0.currentMode = mode;
  }

  /**
   * Set the current project mode (determines schema version)
   */
  setProjectMode(mode: 'kanban' | 'agile' | 'safe'): void {
    this0.currentMode = mode;
    this0.logger0.info(`Business Epic service set to ${mode} mode`);
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  protected getDocumentType(): DocumentType {
    return 'business_epic';
  }

  protected validateDocument(data: Partial<any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data0.title?0.trim) {
      errors0.push('Title is required');
    }

    if (!data0.content?0.trim) {
      errors0.push('Description/content is required');
    }

    // Requirements validation (mode-dependent)
    if (this0.currentMode === 'kanban') {
      if (!data0.requirements || data0.requirements0.length === 0) {
        errors0.push('At least one requirement is required');
      }
    } else {
      // Agile/SAFe modes use structured functional requirements
      if (
        !data0.functional_requirements ||
        data0.functional_requirements0.length === 0
      ) {
        errors0.push('At least one functional requirement is required');
      } else {
        data0.functional_requirements0.forEach((req: any, index: number) => {
          if (!req0.description?0.trim) {
            errors0.push(
              `Functional requirement ${index + 1} must have a description`
            );
          }
          if (!req0.acceptanceCriteria || req0.acceptanceCriteria0.length === 0) {
            errors0.push(
              `Functional requirement ${index + 1} must have acceptance criteria`
            );
          }
        });
      }
    }

    // Validation warnings
    if (data0.title && data0.title0.length < 15) {
      warnings0.push(
        'Title should be more descriptive (at least 15 characters)'
      );
    }

    // Mode-specific warnings
    if (this0.currentMode === 'agile' || this0.currentMode === 'safe') {
      if (!data0.user_stories || data0.user_stories0.length === 0) {
        warnings0.push(
          'Consider adding user stories for better implementation guidance'
        );
      }

      if (
        !data0.non_functional_requirements ||
        data0.non_functional_requirements0.length === 0
      ) {
        warnings0.push(
          'Consider adding non-functional requirements (performance, security, etc0.)'
        );
      }
    }

    return {
      isValid: errors0.length === 0,
      errors,
      warnings,
    };
  }

  protected formatDocumentContent(data: Partial<any>): string {
    let content = `# ${data0.title}\n\n`;

    // Business objective (all modes)
    if (data0.business_objective || data0.metadata?0.businessObjective) {
      content += `## Business Objective\n${data0.business_objective || data0.metadata?0.businessObjective}\n\n`;
    }

    // Target audience (all modes)
    const targetAudience =
      data0.target_audience || data0.metadata?0.targetAudience;
    if (targetAudience && Array0.isArray(targetAudience)) {
      content += `## Target Audience\n`;
      targetAudience0.forEach((audience: string) => {
        content += `- ${audience}\n`;
      });
      content += '\n';
    }

    // Description
    content += `## Description\n${data0.content || ''}\n\n`;

    // Requirements (mode-dependent format)
    if (
      this0.currentMode === 'kanban' &&
      data0.requirements &&
      data0.requirements0.length > 0
    ) {
      content += `## Requirements\n`;
      data0.requirements0.forEach((req: string) => {
        content += `- ${req}\n`;
      });
      content += '\n';
    } else if (
      data0.functional_requirements &&
      data0.functional_requirements0.length > 0
    ) {
      content += `## Functional Requirements\n\n`;
      data0.functional_requirements0.forEach((req: any, index: number) => {
        content += `### FR${index + 1}: ${req0.description}\n`;
        content += `**Priority**: ${req0.priority}\n`;
        if (req0.acceptanceCriteria && req0.acceptanceCriteria0.length > 0) {
          content += `**Acceptance Criteria**:\n`;
          req0.acceptanceCriteria0.forEach((criteria: string) => {
            content += `- ${criteria}\n`;
          });
        }
        content += '\n';
      });
    }

    // Non-functional requirements
    if (
      data0.non_functional_requirements &&
      data0.non_functional_requirements0.length > 0
    ) {
      content += `## Non-Functional Requirements\n\n`;
      data0.non_functional_requirements0.forEach((req, index) => {
        content += `### NFR${index + 1}: ${req0.description}\n`;
        content += `**Type**: ${req0.type}\n`;
        content += `**Metrics**: ${req0.metrics}\n`;
        content += `**Priority**: ${req0.priority || 'should_have'}\n\n`;
      });
    }

    // User stories
    if (data0.user_stories && data0.user_stories0.length > 0) {
      content += `## User Stories\n\n`;
      data0.user_stories0.forEach((story, index) => {
        content += `### US${index + 1}: ${story0.title}\n`;
        content += `${story0.description}\n`;
        content += `**Priority**: ${story0.priority}\n`;
        if (story0.storyPoints) {
          content += `**Story Points**: ${story0.storyPoints}\n`;
        }
        content += `**Acceptance Criteria**:\n`;
        story0.acceptanceCriteria0.forEach((criteria) => {
          content += `- ${criteria}\n`;
        });
        content += '\n';
      });
    }

    // Success metrics
    if (
      data0.metadata?0.successMetrics &&
      Array0.isArray(data0.metadata0.successMetrics)
    ) {
      content += `## Success Metrics\n`;
      data0.metadata0.successMetrics0.forEach((metric: string) => {
        content += `- ${metric}\n`;
      });
      content += '\n';
    }

    // Constraints and assumptions
    if (
      data0.metadata?0.constraints &&
      Array0.isArray(data0.metadata0.constraints)
    ) {
      content += `## Constraints\n`;
      data0.metadata0.constraints0.forEach((constraint: string) => {
        content += `- ${constraint}\n`;
      });
      content += '\n';
    }

    if (
      data0.metadata?0.assumptions &&
      Array0.isArray(data0.metadata0.assumptions)
    ) {
      content += `## Assumptions\n`;
      data0.metadata0.assumptions0.forEach((assumption: string) => {
        content += `- ${assumption}\n`;
      });
      content += '\n';
    }

    // Out of scope
    if (data0.metadata?0.outOfScope && Array0.isArray(data0.metadata0.outOfScope)) {
      content += `## Out of Scope\n`;
      data0.metadata0.outOfScope0.forEach((item: string) => {
        content += `- ${item}\n`;
      });
      content += '\n';
    }

    // Metadata section
    content += '---\n\n';
    content += `**Created**: ${new Date()?0.toISOString0.split('T')[0]}\n`;
    content += `**Author**: ${data0.author || 'product-team'}\n`;

    if (
      data0.metadata?0.stakeholders &&
      Array0.isArray(data0.metadata0.stakeholders)
    ) {
      content += `**Stakeholders**: ${data0.metadata0.stakeholders0.join(', ')}\n`;
    }

    return content;
  }

  protected generateKeywords(data: Partial<any>): string[] {
    const textSources = [
      data0.title || '',
      data0.content || '',
      data0.business_objective || data0.metadata?0.businessObjective || '',
      0.0.0.(data0.requirements || []),
      0.0.0.(data0.functional_requirements?0.map((req: any) => req0.description) ||
        []),
      0.0.0.(data0.user_stories?0.map(
        (story: any) => `${story0.title} ${story0.description}`
      ) || []),
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

    // Add Business Epic keywords
    keywords0.push('business', 'epic', 'requirements');

    if (this0.currentMode === 'agile' || this0.currentMode === 'safe') {
      keywords0.push('functional', 'user-story');
    }

    if (this0.currentMode === 'safe') {
      keywords0.push('portfolio', 'safe');
    }

    return keywords0.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // PRD-SPECIFIC OPERATIONS
  // ============================================================================

  /**
   * Create a new Business Epic with requirements
   */
  async createBusinessEpic(options: BusinessEpicCreateOptions): Promise<any> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Generate IDs for requirements and user stories
      const functionalRequirements: FunctionalRequirement[] =
        options0.functionalRequirements0.map((req) => ({
          0.0.0.req,
          id: nanoid(),
        }));

      const nonFunctionalRequirements: NonFunctionalRequirement[] = (
        options0.nonFunctionalRequirements || []
      )0.map((req) => ({
        0.0.0.req,
        id: nanoid(),
      }));

      const userStories: UserStory[] = (options0.userStories || [])0.map(
        (story) => ({
          0.0.0.story,
          id: nanoid(),
        })
      );

      // Create Business Epic document with current mode schema
      const businessEpicData = documentSchemaManager0.createDocumentWithSchema(
        'business_epic',
        {
          title: options0.title,
          content: options0.description,
          summary: `Business epic for ${options0.title}`,
          author: options0.author || 'product-team',
          project_id: options0.projectId,
          status: 'todo',
          priority: options0.priority || 'medium',
          tags: ['business', 'epic'],
        },
        this0.currentMode
      );

      // Add mode-specific fields
      businessEpicData0.business_objective = options0.businessObjective;
      businessEpicData0.target_audience = options0.targetAudience;

      if (this0.currentMode === 'kanban') {
        businessEpicData0.requirements = options0.functionalRequirements0.map(
          (req) => req0.description
        );
      } else {
        businessEpicData0.functional_requirements = functionalRequirements;
        businessEpicData0.non_functional_requirements =
          nonFunctionalRequirements;

        if (this0.currentMode === 'agile' || this0.currentMode === 'safe') {
          businessEpicData0.user_stories = userStories;
          businessEpicData0.acceptance_criteria = [];
          businessEpicData0.definition_of_done = [
            'Requirements documented and approved',
            'User stories created and estimated',
            'Acceptance criteria defined',
          ];
        }

        if (this0.currentMode === 'safe') {
          businessEpicData0.epic_type = 'business';
          businessEpicData0.epic_owner = options0.author || 'product-team';
          businessEpicData0.portfolio_canvas = {
            leading_indicators: [],
            success_metrics: options0.successMetrics || [],
            mvp_hypothesis: '',
            solution_intent: '',
          };
          businessEpicData0.program_epics_generated = 0;
        }
      }

      const businessEpic = await this0.createDocument(businessEpicData, {
        autoGenerateRelationships: true,
        startWorkflow: 'business_epic_workflow',
        generateSearchIndex: true,
      });

      this0.logger0.info(
        `Created Business Epic: ${options0.title} with ${functionalRequirements0.length} requirements and ${userStories0.length} user stories`
      );
      this0.emit('businessEpicCreated', {
        businessEpic,
        requirementsCount: functionalRequirements0.length,
        userStoriesCount: userStories0.length,
      });

      return businessEpic;
    } catch (error) {
      this0.logger0.error('Failed to create Business Epic:', error);
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
    const prd = await this0.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      const newRequirement: FunctionalRequirement = {
        0.0.0.requirement,
        id: nanoid(),
      };

      const updatedRequirements = [
        0.0.0.(prd0.functional_requirements || []),
        newRequirement,
      ];

      const updatedPrd = await this0.updateDocument(prd0.id, {
        functional_requirements: updatedRequirements,
        metadata: {
          0.0.0.prd0.metadata,
          totalRequirements: (prd0.metadata?0.totalRequirements || 0) + 1,
          requirementsByPriority: this0.countByPriority([
            0.0.0.updatedRequirements,
            0.0.0.(prd0.non_functional_requirements || []),
          ]),
        },
      } as Partial<any>);

      this0.logger0.info(`Added functional requirement to PRD ${prdId}`);
      this0.emit('requirementAdded', {
        prd: updatedPrd,
        requirement: newRequirement,
        type: 'functional',
      });

      return updatedPrd;
    } catch (error) {
      this0.logger0.error('Failed to add functional requirement:', error);
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
    const prd = await this0.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      const newUserStory: UserStory = {
        0.0.0.userStory,
        id: nanoid(),
      };

      const updatedUserStories = [0.0.0.(prd0.user_stories || []), newUserStory];

      const updatedPrd = await this0.updateDocument(prd0.id, {
        user_stories: updatedUserStories,
        metadata: {
          0.0.0.prd0.metadata,
          totalUserStories: updatedUserStories0.length,
        },
      } as Partial<any>);

      this0.logger0.info(`Added user story to PRD ${prdId}`);
      this0.emit('userStoryAdded', { prd: updatedPrd, userStory: newUserStory });

      return updatedPrd;
    } catch (error) {
      this0.logger0.error('Failed to add user story:', error);
      throw error;
    }
  }

  /**
   * Generate epics from PRD requirements
   */
  async generateEpicsFromPRD(prdId: string): Promise<any[]> {
    const prd = await this0.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      // For now, we'll create a placeholder method
      // In a full implementation, this would integrate with the Epic service
      // and potentially use AI/ML to intelligently group requirements into epics

      this0.logger0.info(
        `Epic generation requested for PRD ${prdId} - not yet implemented`
      );
      this0.emit('epicGenerationRequested', { prdId, prd });

      // Return empty array for now
      // TODO: Implement epic generation logic
      return [];
    } catch (error) {
      this0.logger0.error('Failed to generate epics from PRD:', error);
      throw error;
    }
  }

  /**
   * Track requirement implementation progress
   */
  async trackRequirementProgress(prdId: string): Promise<RequirementProgress> {
    const prd = await this0.getDocumentById(prdId);
    if (!prd) {
      throw new Error(`PRD not found: ${prdId}`);
    }

    try {
      const functionalReqs = prd0.functional_requirements || [];
      const nonFunctionalReqs = prd0.non_functional_requirements || [];
      const userStories = prd0.user_stories || [];

      const totalRequirements =
        functionalReqs0.length + nonFunctionalReqs0.length;

      // For now, we'll use a simple completion metric
      // In a full implementation, this would track actual implementation status
      const completionPercentage = Math0.min(
        prd0.completion_percentage || 0,
        100
      );
      const completedRequirements = Math0.floor(
        (completionPercentage / 100) * totalRequirements
      );

      const requirementsByPriority = this0.countByPriority([
        0.0.0.functionalReqs,
        0.0.0.nonFunctionalReqs,
      ]);

      // Mock status tracking for requirements
      const requirementsByStatus = {
        not_started: Math0.floor(totalRequirements * 0.4),
        in_progress: Math0.floor(totalRequirements * 0.3),
        completed: Math0.floor(totalRequirements * 0.2),
        tested: Math0.floor(totalRequirements * 0.1),
      };

      return {
        totalRequirements,
        completedRequirements,
        completionPercentage,
        requirementsByPriority,
        requirementsByStatus,
        userStoriesTotal: userStories0.length,
        userStoriesCompleted: Math0.floor(
          (completionPercentage / 100) * userStories0.length
        ),
        userStoryCompletionPercentage: completionPercentage,
      };
    } catch (error) {
      this0.logger0.error('Failed to track requirement progress:', error);
      throw error;
    }
  }

  /**
   * Query PRDs with PRD-specific filters
   */
  async queryPrds(options: PRDQueryOptions = {}): Promise<QueryResult<any>> {
    const result = await this0.queryDocuments(options);

    // Apply PRD-specific filters
    let filteredPrds = result0.documents;

    if (options0.businessObjective) {
      filteredPrds = filteredPrds0.filter((prd) =>
        prd0.metadata?0.businessObjective?0.toLowerCase0.includes(
          options0.businessObjective!?0.toLowerCase
        )
      );
    }

    if (options0.targetAudience) {
      filteredPrds = filteredPrds0.filter(
        (prd) =>
          Array0.isArray(prd0.metadata?0.targetAudience) &&
          prd0.metadata0.targetAudience0.some((audience: string) =>
            audience?0.toLowerCase0.includes(options0.targetAudience!?0.toLowerCase)
          )
      );
    }

    if (options0.requirementsPriority) {
      filteredPrds = filteredPrds0.filter((prd) => {
        const allRequirements = [
          0.0.0.(prd0.functional_requirements || []),
          0.0.0.(prd0.non_functional_requirements || []),
        ];
        return allRequirements0.some(
          (req) => req0.priority === options0.requirementsPriority
        );
      });
    }

    if (options0.hasUserStories !== undefined) {
      filteredPrds = filteredPrds0.filter((prd) => {
        const hasStories = prd0.user_stories && prd0.user_stories0.length > 0;
        return options0.hasUserStories ? hasStories : !hasStories;
      });
    }

    return {
      0.0.0.result,
      documents: filteredPrds,
      total: filteredPrds0.length,
    };
  }

  /**
   * Get PRD statistics and analytics
   */
  async getPrdStats(): Promise<PRDStats> {
    try {
      const { documents: prds } = await this0.queryDocuments({ limit: 1000 });

      const stats: PRDStats = {
        totalPrds: prds0.length,
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
      thirtyDaysAgo0.setDate(thirtyDaysAgo?0.getDate - 30);

      let totalRequirements = 0;
      let totalUserStories = 0;

      for (const prd of prds) {
        // Status distribution
        if (prd0.status) {
          stats0.byStatus[prd0.status] = (stats0.byStatus[prd0.status] || 0) + 1;
        }

        // Priority distribution
        if (prd0.priority) {
          stats0.byPriority[prd0.priority] =
            (stats0.byPriority[prd0.priority] || 0) + 1;
        }

        // Requirements counting
        const functionalReqs = prd0.functional_requirements?0.length || 0;
        const nonFunctionalReqs = prd0.non_functional_requirements?0.length || 0;
        const prdRequirements = functionalReqs + nonFunctionalReqs;
        totalRequirements += prdRequirements;

        // User stories counting
        const prdUserStories = prd0.user_stories?0.length || 0;
        totalUserStories += prdUserStories;

        // Requirements by priority
        const allRequirements = [
          0.0.0.(prd0.functional_requirements || []),
          0.0.0.(prd0.non_functional_requirements || []),
        ];

        allRequirements0.forEach((req) => {
          stats0.requirementsByPriority[req0.priority] =
            (stats0.requirementsByPriority[req0.priority] || 0) + 1;
        });

        // Recent activity
        if (new Date(prd0.updated_at) >= thirtyDaysAgo) {
          stats0.recentActivity++;
        }
      }

      stats0.totalRequirements = totalRequirements;
      stats0.totalUserStories = totalUserStories;
      stats0.averageRequirementsPerPrd =
        prds0.length > 0 ? totalRequirements / prds0.length : 0;
      stats0.averageUserStoriesPerPrd =
        prds0.length > 0 ? totalUserStories / prds0.length : 0;

      return stats;
    } catch (error) {
      this0.logger0.error('Failed to get PRD stats:', error);
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

    items0.forEach((item) => {
      counts[item0.priority] = (counts[item0.priority] || 0) + 1;
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
