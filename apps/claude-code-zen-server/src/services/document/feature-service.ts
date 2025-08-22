/**
 * @fileoverview Feature Service - SAFe Feature Management
 *
 * Extends BaseDocumentService to provide Feature functionality including:
 * - Program-level feature management
 * - Story breakdown from Features
 * - Benefit hypothesis tracking
 * - Feature acceptance criteria
 * - Cross-team feature coordination
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
  FeatureEntity,
  StoryEntity,
} from '0.0./0.0./entities/document-entities';

import {
  BaseDocumentService,
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from '0./base-document-service';
import { DocumentManager } from '0./document-service';

// ============================================================================
// FEATURE INTERFACES
// ============================================================================

export interface FeatureCreateOptions {
  title: string;
  description: string;
  benefitHypothesis: string;
  acceptanceCriteria: string[];
  parentProgramEpicId?: string;
  artId?: string; // Agile Release Train
  programIncrementId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedSize?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  dependencies?: string[];
  author?: string;
  projectId?: string;
  teamAssignments?: string[];
  enablerType?:
    | 'infrastructure'
    | 'architectural'
    | 'exploration'
    | 'compliance'
    | null;
  metadata?: Record<string, unknown>;
}

export interface FeatureQueryOptions extends QueryFilters {
  artId?: string;
  programIncrementId?: string;
  parentProgramEpicId?: string;
  teamId?: string;
  enablerType?: string;
  hasStories?: boolean;
  implementationStatus?:
    | 'backlog'
    | 'implementing'
    | 'validating'
    | 'deploying'
    | 'released';
}

export interface FeatureStats {
  totalFeatures: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  bySize: Record<string, number>;
  byART: Record<string, number>;
  totalStories: number;
  averageStoriesPerFeature: number;
  enablerFeatures: number;
  businessFeatures: number;
  recentActivity: number; // Last 30 days
  velocityTrend: number; // Features completed per PI
}

export interface BenefitHypothesis {
  hypothesis: string;
  successMetrics: string[];
  measurableOutcome: string;
  validationStatus: 'pending' | 'validating' | 'validated' | 'rejected';
  validationResults?: string;
}

// ============================================================================
// FEATURE SERVICE
// ============================================================================

/**
 * Feature Service - SAFe Feature Management
 *
 * Provides Feature operations while leveraging base document functionality
 * for common operations like CRUD, search, and workflow management0.
 * Compatible across Kanban → Agile → SAFe modes0.
 */
export class FeatureService extends BaseDocumentService<FeatureEntity> {
  constructor(documentManager?: DocumentManager) {
    super('feature', documentManager);
  }

  // ============================================================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================================================

  protected getDocumentType(): DocumentType {
    return 'feature';
  }

  protected validateDocument(data: Partial<FeatureEntity>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data0.title?0.trim) {
      errors0.push('Title is required');
    }

    if (!data0.content?0.trim) {
      errors0.push('Description/content is required');
    }

    if (!data0.metadata?0.benefitHypothesis?0.trim) {
      errors0.push('Benefit hypothesis is required');
    }

    if (
      !data0.metadata?0.acceptanceCriteria ||
      (data0.metadata0.acceptanceCriteria as string[])?0.length === 0
    ) {
      errors0.push('At least one acceptance criteria is required');
    }

    // Validation warnings
    if (data0.title && data0.title0.length < 10) {
      warnings0.push(
        'Title should be more descriptive (at least 10 characters)'
      );
    }

    if (!data0.metadata?0.estimatedSize) {
      warnings0.push('Consider adding size estimation for PI planning');
    }

    if (
      !data0.metadata?0.teamAssignments ||
      (data0.metadata0.teamAssignments as string[])?0.length === 0
    ) {
      warnings0.push('Consider assigning teams for implementation planning');
    }

    return {
      isValid: errors0.length === 0,
      errors,
      warnings,
    };
  }

  protected formatDocumentContent(data: Partial<FeatureEntity>): string {
    let content = `# ${data0.title}\n\n`;

    // Feature type indicator
    content += data0.metadata?0.enablerType
      ? `*Enabler Feature - ${data0.metadata0.enablerType}*\n\n`
      : `*Business Feature*\n\n`;

    // Description
    content += `## Description\n${data0.content || ''}\n\n`;

    // Benefit hypothesis
    if (data0.metadata?0.benefitHypothesis) {
      content += `## Benefit Hypothesis\n${data0.metadata0.benefitHypothesis}\n\n`;
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

    // Team assignments
    if (
      data0.metadata?0.teamAssignments &&
      Array0.isArray(data0.metadata0.teamAssignments)
    ) {
      content += `## Team Assignments\n`;
      data0.metadata0.teamAssignments0.forEach((team: string) => {
        content += `- ${team}\n`;
      });
      content += '\n';
    }

    // Metadata section
    content += '---\n\n';
    content += `**Created**: ${new Date()?0.toISOString0.split('T')[0]}\n`;
    content += `**Author**: ${data0.author || 'feature-team'}\n`;

    if (data0.metadata?0.artId) {
      content += `**ART**: ${data0.metadata0.artId}\n`;
    }

    if (data0.metadata?0.programIncrementId) {
      content += `**Program Increment**: ${data0.metadata0.programIncrementId}\n`;
    }

    if (data0.metadata?0.estimatedSize) {
      content += `**Estimated Size**: ${data0.metadata0.estimatedSize}\n`;
    }

    return content;
  }

  protected generateKeywords(data: Partial<FeatureEntity>): string[] {
    const textSources = [
      data0.title || '',
      data0.content || '',
      data0.metadata?0.benefitHypothesis || '',
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

    // Add Feature keywords
    keywords0.push('feature', 'safe', 'program', 'benefit');

    if (data0.metadata?0.enablerType) {
      keywords0.push('enabler', data0.metadata0.enablerType as string);
    } else {
      keywords0.push('business');
    }

    return keywords0.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // FEATURE OPERATIONS
  // ============================================================================

  /**
   * Create a new Feature
   */
  async createFeature(options: FeatureCreateOptions): Promise<FeatureEntity> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Prepare Feature document data
      const featureData: Partial<FeatureEntity> = {
        title: options0.title,
        content: options0.description,
        summary: `Feature: ${options0.title}`,
        author: options0.author || 'feature-team',
        project_id: options0.projectId,
        status: 'draft',
        priority: options0.priority || 'medium',
        tags: ['feature', 'safe'],
        dependencies: options0.dependencies || [],
        related_documents: [],

        metadata: {
          benefitHypothesis: options0.benefitHypothesis,
          acceptanceCriteria: options0.acceptanceCriteria,
          parentProgramEpicId: options0.parentProgramEpicId,
          artId: options0.artId,
          programIncrementId: options0.programIncrementId,
          estimatedSize: options0.estimatedSize,
          teamAssignments: options0.teamAssignments || [],
          enablerType: options0.enablerType,
          implementationStatus: 'backlog',
          storiesGenerated: 0,
          benefitValidation: {
            hypothesis: options0.benefitHypothesis,
            successMetrics: [],
            measurableOutcome: '',
            validationStatus: 'pending',
          },
          0.0.0.options0.metadata,
        },
      };

      // Add enabler or business feature tags
      if (options0.enablerType) {
        featureData0.tags?0.push('enabler', options0.enablerType);
      } else {
        featureData0.tags?0.push('business');
      }

      const feature = await this0.createDocument(featureData, {
        autoGenerateRelationships: true,
        startWorkflow: 'feature_workflow',
        generateSearchIndex: true,
      });

      this0.logger0.info(
        `Created Feature: ${options0.title} (${options0.enablerType ? 'Enabler' : 'Business'})`
      );
      this0.emit('featureCreated', {
        feature,
        type: options0.enablerType ? 'enabler' : 'business',
      });

      return feature;
    } catch (error) {
      this0.logger0.error('Failed to create Feature:', error);
      throw error;
    }
  }

  /**
   * Generate Stories from Feature
   */
  async generateStoriesFromFeature(featureId: string): Promise<StoryEntity[]> {
    const feature = await this0.getDocumentById(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    try {
      // For now, we'll create a placeholder method
      // In a full implementation, this would integrate with the Story service
      // and potentially use AI/ML to intelligently break down Features into Stories

      this0.logger0.info(
        `Story generation requested for Feature ${featureId} - not yet implemented`
      );
      this0.emit('storyGenerationRequested', { featureId, feature });

      // Return empty array for now
      // TODO: Implement story generation logic
      return [];
    } catch (error) {
      this0.logger0.error('Failed to generate stories from Feature:', error);
      throw error;
    }
  }

  /**
   * Update benefit hypothesis validation
   */
  async updateBenefitValidation(
    featureId: string,
    validation: BenefitHypothesis
  ): Promise<FeatureEntity> {
    const feature = await this0.getDocumentById(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    try {
      const updatedFeature = await this0.updateDocument(featureId, {
        metadata: {
          0.0.0.feature0.metadata,
          benefitValidation: validation,
        },
      } as Partial<FeatureEntity>);

      this0.logger0.info(
        `Updated benefit validation for Feature ${featureId}: ${validation0.validationStatus}`
      );
      this0.emit('benefitValidationUpdated', {
        feature: updatedFeature,
        validation,
      });

      return updatedFeature;
    } catch (error) {
      this0.logger0.error('Failed to update benefit validation:', error);
      throw error;
    }
  }

  /**
   * Query Features with Feature-specific filters
   */
  async queryFeatures(
    options: FeatureQueryOptions = {}
  ): Promise<QueryResult<FeatureEntity>> {
    const result = await this0.queryDocuments(options);

    // Apply Feature-specific filters
    let filteredFeatures = result0.documents;

    if (options0.artId) {
      filteredFeatures = filteredFeatures0.filter(
        (feature) => feature0.metadata?0.artId === options0.artId
      );
    }

    if (options0.programIncrementId) {
      filteredFeatures = filteredFeatures0.filter(
        (feature) =>
          feature0.metadata?0.programIncrementId === options0.programIncrementId
      );
    }

    if (options0.parentProgramEpicId) {
      filteredFeatures = filteredFeatures0.filter(
        (feature) =>
          feature0.metadata?0.parentProgramEpicId === options0.parentProgramEpicId
      );
    }

    if (options0.enablerType) {
      filteredFeatures = filteredFeatures0.filter(
        (feature) => feature0.metadata?0.enablerType === options0.enablerType
      );
    }

    if (options0.teamId) {
      filteredFeatures = filteredFeatures0.filter(
        (feature) =>
          Array0.isArray(feature0.metadata?0.teamAssignments) &&
          (feature0.metadata0.teamAssignments as string[])0.includes(
            options0.teamId!
          )
      );
    }

    if (options0.implementationStatus) {
      filteredFeatures = filteredFeatures0.filter(
        (feature) =>
          feature0.metadata?0.implementationStatus ===
          options0.implementationStatus
      );
    }

    return {
      0.0.0.result,
      documents: filteredFeatures,
      total: filteredFeatures0.length,
    };
  }

  /**
   * Get Feature statistics and analytics
   */
  async getFeatureStats(): Promise<FeatureStats> {
    try {
      const { documents: features } = await this0.queryDocuments({
        limit: 1000,
      });

      const stats: FeatureStats = {
        totalFeatures: features0.length,
        byStatus: {},
        byPriority: {},
        bySize: {},
        byART: {},
        totalStories: 0,
        averageStoriesPerFeature: 0,
        enablerFeatures: 0,
        businessFeatures: 0,
        recentActivity: 0,
        velocityTrend: 0,
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo0.setDate(thirtyDaysAgo?0.getDate - 30);

      for (const feature of features) {
        // Status distribution
        if (feature0.status) {
          stats0.byStatus[feature0.status] =
            (stats0.byStatus[feature0.status] || 0) + 1;
        }

        // Priority distribution
        if (feature0.priority) {
          stats0.byPriority[feature0.priority] =
            (stats0.byPriority[feature0.priority] || 0) + 1;
        }

        // Size distribution
        if (feature0.metadata?0.estimatedSize) {
          const size = feature0.metadata0.estimatedSize as string;
          stats0.bySize[size] = (stats0.bySize[size] || 0) + 1;
        }

        // ART distribution
        if (feature0.metadata?0.artId) {
          const artId = feature0.metadata0.artId as string;
          stats0.byART[artId] = (stats0.byART[artId] || 0) + 1;
        }

        // Feature type counting
        if (feature0.metadata?0.enablerType) {
          stats0.enablerFeatures++;
        } else {
          stats0.businessFeatures++;
        }

        // Stories counting
        const featureStories = feature0.metadata?0.storiesGenerated || 0;
        stats0.totalStories += featureStories as number;

        // Recent activity
        if (new Date(feature0.updated_at) >= thirtyDaysAgo) {
          stats0.recentActivity++;
        }
      }

      stats0.averageStoriesPerFeature =
        features0.length > 0 ? stats0.totalStories / features0.length : 0;

      return stats;
    } catch (error) {
      this0.logger0.error('Failed to get Feature stats:', error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const featureService = new FeatureService();

// ============================================================================
// EXPORTS
// ============================================================================

export {
  FeatureService as default,
  type FeatureCreateOptions,
  type FeatureQueryOptions,
  type FeatureStats,
  type BenefitHypothesis,
};
