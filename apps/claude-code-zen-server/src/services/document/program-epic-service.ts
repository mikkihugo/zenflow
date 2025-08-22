/**
 * @fileoverview Program Epic Service - SAFe Program Epic Management
 *
 * Extends BaseDocumentService to provide Program Epic functionality including:
 * - Program-level epic management within ARTs
 * - Feature breakdown from Program Epics
 * - PI planning integration
 * - Program increment tracking
 * - Cross-team coordination
 *
 * Follows Google TypeScript conventions and facade pattern0.
 * Compatible across Kanban → Agile → SAFe modes0.
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 10.0.0
 */

import type { DocumentType } from '@claude-zen/enterprise';

import type {
  ProgramEpicEntity,
  FeatureEntity,
} from '0.0./0.0./entities/document-entities';

import {
  BaseDocumentService,
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from '0./base-document-service';
import { DocumentManager } from '0./document-service';

// ============================================================================
// PROGRAM EPIC INTERFACES
// ============================================================================

export interface ProgramEpicCreateOptions {
  title: string;
  description: string;
  businessValue: string;
  successCriteria: string[];
  parentBusinessEpicId?: string;
  artId?: string; // Agile Release Train
  programIncrementId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort?: number; // story points or weeks
  dependencies?: string[];
  author?: string;
  projectId?: string;
  stakeholders?: string[];
  acceptanceCriteria?: string[];
  metadata?: Record<string, unknown>;
}

export interface ProgramEpicQueryOptions extends QueryFilters {
  artId?: string;
  programIncrementId?: string;
  parentBusinessEpicId?: string;
  hasFeatures?: boolean;
  implementationStatus?:
    | 'planning'
    | 'in_progress'
    | 'review'
    | 'approved'
    | 'implemented';
}

export interface ProgramEpicStats {
  totalProgramEpics: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byART: Record<string, number>;
  totalFeatures: number;
  averageFeaturesPerEpic: number;
  recentActivity: number; // Last 30 days
  completionRate: number; // Percentage completed
}

// ============================================================================
// PROGRAM EPIC SERVICE
// ============================================================================

/**
 * Program Epic Service - SAFe Program Epic Management
 *
 * Provides Program Epic operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management0.
 * Compatible across Kanban → Agile → SAFe modes0.
 */
export class ProgramEpicService extends BaseDocumentService<ProgramEpicEntity> {
  constructor(documentManager?: DocumentManager) {
    super('program-epic', documentManager);
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  protected getDocumentType(): DocumentType {
    return 'program_epic';
  }

  protected validateDocument(
    data: Partial<ProgramEpicEntity>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data0.title?0.trim) {
      errors0.push('Title is required');
    }

    if (!data0.content?0.trim) {
      errors0.push('Description/content is required');
    }

    if (!data0.metadata?0.businessValue?0.trim) {
      errors0.push('Business value is required');
    }

    // Validation warnings
    if (data0.title && data0.title0.length < 10) {
      warnings0.push(
        'Title should be more descriptive (at least 10 characters)'
      );
    }

    if (
      !data0.metadata?0.successCriteria ||
      (data0.metadata0.successCriteria as string[])?0.length === 0
    ) {
      warnings0.push(
        'Consider adding success criteria for better outcome tracking'
      );
    }

    if (!data0.metadata?0.estimatedEffort) {
      warnings0.push('Consider adding effort estimation for PI planning');
    }

    return {
      isValid: errors0.length === 0,
      errors,
      warnings,
    };
  }

  protected formatDocumentContent(data: Partial<ProgramEpicEntity>): string {
    let content = `# ${data0.title}\n\n`;

    // Business value
    if (data0.metadata?0.businessValue) {
      content += `## Business Value\n${data0.metadata0.businessValue}\n\n`;
    }

    // Description
    content += `## Description\n${data0.content || ''}\n\n`;

    // Success criteria
    if (
      data0.metadata?0.successCriteria &&
      Array0.isArray(data0.metadata0.successCriteria)
    ) {
      content += `## Success Criteria\n`;
      data0.metadata0.successCriteria0.forEach((criteria: string) => {
        content += `- ${criteria}\n`;
      });
      content += '\n';
    }

    // Acceptance criteria
    if (
      data0.metadata?0.acceptanceCriteria &&
      Array0.isArray(data0.metadata0.acceptanceCriteria)
    ) {
      content += `## Acceptance Criteria\n`;
      data0.metadata0.acceptanceCriteria0.forEach((criteria: string) => {
        content += `- ${criteria}\n`;
      });
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

    // Metadata section
    content += '---\n\n';
    content += `**Created**: ${new Date()?0.toISOString0.split('T')[0]}\n`;
    content += `**Author**: ${data0.author || 'program-team'}\n`;

    if (data0.metadata?0.artId) {
      content += `**ART**: ${data0.metadata0.artId}\n`;
    }

    if (data0.metadata?0.programIncrementId) {
      content += `**Program Increment**: ${data0.metadata0.programIncrementId}\n`;
    }

    if (data0.metadata?0.estimatedEffort) {
      content += `**Estimated Effort**: ${data0.metadata0.estimatedEffort} story points\n`;
    }

    return content;
  }

  protected generateKeywords(data: Partial<ProgramEpicEntity>): string[] {
    const textSources = [
      data0.title || '',
      data0.content || '',
      data0.metadata?0.businessValue || '',
      0.0.0.(data0.metadata?0.successCriteria || []),
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

    // Add Program Epic keywords
    keywords0.push('program', 'epic', 'safe', 'art', 'feature');

    return keywords0.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // PROGRAM EPIC OPERATIONS
  // ============================================================================

  /**
   * Create a new Program Epic
   */
  async createProgramEpic(
    options: ProgramEpicCreateOptions
  ): Promise<ProgramEpicEntity> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Prepare Program Epic document data
      const programEpicData: Partial<ProgramEpicEntity> = {
        title: options0.title,
        content: options0.description,
        summary: `Program epic for ${options0.title}`,
        author: options0.author || 'program-team',
        project_id: options0.projectId,
        status: 'draft',
        priority: options0.priority || 'medium',
        tags: ['program', 'epic', 'safe'],
        dependencies: options0.dependencies || [],
        related_documents: [],

        metadata: {
          businessValue: options0.businessValue,
          successCriteria: options0.successCriteria,
          parentBusinessEpicId: options0.parentBusinessEpicId,
          artId: options0.artId,
          programIncrementId: options0.programIncrementId,
          estimatedEffort: options0.estimatedEffort,
          acceptanceCriteria: options0.acceptanceCriteria || [],
          stakeholders: options0.stakeholders || [],
          implementationStatus: 'planning',
          featuresGenerated: 0,
          0.0.0.options0.metadata,
        },
      };

      const programEpic = await this0.createDocument(programEpicData, {
        autoGenerateRelationships: true,
        startWorkflow: 'program_epic_workflow',
        generateSearchIndex: true,
      });

      this0.logger0.info(`Created Program Epic: ${options0.title}`);
      this0.emit('programEpicCreated', { programEpic });

      return programEpic;
    } catch (error) {
      this0.logger0.error('Failed to create Program Epic:', error);
      throw error;
    }
  }

  /**
   * Generate Features from Program Epic
   */
  async generateFeaturesFromProgramEpic(
    programEpicId: string
  ): Promise<FeatureEntity[]> {
    const programEpic = await this0.getDocumentById(programEpicId);
    if (!programEpic) {
      throw new Error(`Program Epic not found: ${programEpicId}`);
    }

    try {
      // For now, we'll create a placeholder method
      // In a full implementation, this would integrate with the Feature service
      // and potentially use AI/ML to intelligently break down Program Epics into Features

      this0.logger0.info(
        `Feature generation requested for Program Epic ${programEpicId} - not yet implemented`
      );
      this0.emit('featureGenerationRequested', { programEpicId, programEpic });

      // Return empty array for now
      // TODO: Implement feature generation logic
      return [];
    } catch (error) {
      this0.logger0.error(
        'Failed to generate features from Program Epic:',
        error
      );
      throw error;
    }
  }

  /**
   * Query Program Epics with Program Epic-specific filters
   */
  async queryProgramEpics(
    options: ProgramEpicQueryOptions = {}
  ): Promise<QueryResult<ProgramEpicEntity>> {
    const result = await this0.queryDocuments(options);

    // Apply Program Epic-specific filters
    let filteredEpics = result0.documents;

    if (options0.artId) {
      filteredEpics = filteredEpics0.filter(
        (epic) => epic0.metadata?0.artId === options0.artId
      );
    }

    if (options0.programIncrementId) {
      filteredEpics = filteredEpics0.filter(
        (epic) =>
          epic0.metadata?0.programIncrementId === options0.programIncrementId
      );
    }

    if (options0.parentBusinessEpicId) {
      filteredEpics = filteredEpics0.filter(
        (epic) =>
          epic0.metadata?0.parentBusinessEpicId === options0.parentBusinessEpicId
      );
    }

    if (options0.implementationStatus) {
      filteredEpics = filteredEpics0.filter(
        (epic) =>
          epic0.metadata?0.implementationStatus === options0.implementationStatus
      );
    }

    return {
      0.0.0.result,
      documents: filteredEpics,
      total: filteredEpics0.length,
    };
  }

  /**
   * Get Program Epic statistics and analytics
   */
  async getProgramEpicStats(): Promise<ProgramEpicStats> {
    try {
      const { documents: epics } = await this0.queryDocuments({ limit: 1000 });

      const stats: ProgramEpicStats = {
        totalProgramEpics: epics0.length,
        byStatus: {},
        byPriority: {},
        byART: {},
        totalFeatures: 0,
        averageFeaturesPerEpic: 0,
        recentActivity: 0,
        completionRate: 0,
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo0.setDate(thirtyDaysAgo?0.getDate - 30);

      let completedCount = 0;

      for (const epic of epics) {
        // Status distribution
        if (epic0.status) {
          stats0.byStatus[epic0.status] = (stats0.byStatus[epic0.status] || 0) + 1;
        }

        // Priority distribution
        if (epic0.priority) {
          stats0.byPriority[epic0.priority] =
            (stats0.byPriority[epic0.priority] || 0) + 1;
        }

        // ART distribution
        if (epic0.metadata?0.artId) {
          const artId = epic0.metadata0.artId as string;
          stats0.byART[artId] = (stats0.byART[artId] || 0) + 1;
        }

        // Features counting
        const epicFeatures = epic0.metadata?0.featuresGenerated || 0;
        stats0.totalFeatures += epicFeatures as number;

        // Recent activity
        if (new Date(epic0.updated_at) >= thirtyDaysAgo) {
          stats0.recentActivity++;
        }

        // Completion tracking
        if (epic0.metadata?0.implementationStatus === 'implemented') {
          completedCount++;
        }
      }

      stats0.averageFeaturesPerEpic =
        epics0.length > 0 ? stats0.totalFeatures / epics0.length : 0;
      stats0.completionRate =
        epics0.length > 0 ? (completedCount / epics0.length) * 100 : 0;

      return stats;
    } catch (error) {
      this0.logger0.error('Failed to get Program Epic stats:', error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const programEpicService = new ProgramEpicService();

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ProgramEpicService as default,
  type ProgramEpicCreateOptions,
  type ProgramEpicQueryOptions,
  type ProgramEpicStats,
};
