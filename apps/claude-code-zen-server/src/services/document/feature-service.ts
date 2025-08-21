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
 * Follows Google TypeScript conventions and facade pattern.
 * Compatible across Kanban → Agile → SAFe modes.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */

import type { FeatureEntity, StoryEntity } from '../../entities/document-entities';
import type { DocumentType } from '../../workflows/types';

import { BaseDocumentService, type ValidationResult, type QueryFilters, type QueryResult } from './base-document-service';
import { DocumentManager } from './document-service';


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
  enablerType?: 'infrastructure' | 'architectural' | 'exploration' | 'compliance' | null;
  metadata?: Record<string, unknown>;
}

export interface FeatureQueryOptions extends QueryFilters {
  artId?: string;
  programIncrementId?: string;
  parentProgramEpicId?: string;
  teamId?: string;
  enablerType?: string;
  hasStories?: boolean;
  implementationStatus?: 'backlog' | 'implementing' | 'validating' | 'deploying' | 'released';
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
 * for common operations like CRUD, search, and workflow management.
 * Compatible across Kanban → Agile → SAFe modes.
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
    if (!data.title?.trim()) {
      errors.push('Title is required');
    }

    if (!data.content?.trim()) {
      errors.push('Description/content is required');
    }

    if (!data.metadata?.benefitHypothesis?.trim()) {
      errors.push('Benefit hypothesis is required');
    }

    if (!data.metadata?.acceptanceCriteria || (data.metadata.acceptanceCriteria as string[])?.length === 0) {
      errors.push('At least one acceptance criteria is required');
    }

    // Validation warnings
    if (data.title && data.title.length < 10) {
      warnings.push('Title should be more descriptive (at least 10 characters)');
    }

    if (!data.metadata?.estimatedSize) {
      warnings.push('Consider adding size estimation for PI planning');
    }

    if (!data.metadata?.teamAssignments || (data.metadata.teamAssignments as string[])?.length === 0) {
      warnings.push('Consider assigning teams for implementation planning');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  protected formatDocumentContent(data: Partial<FeatureEntity>): string {
    let content = `# ${data.title}\n\n`;
    
    // Feature type indicator
    content += data.metadata?.enablerType ? `*Enabler Feature - ${data.metadata.enablerType}*\n\n` : `*Business Feature*\n\n`;
    
    // Description
    content += `## Description\n${data.content || ''}\n\n`;
    
    // Benefit hypothesis
    if (data.metadata?.benefitHypothesis) {
      content += `## Benefit Hypothesis\n${data.metadata.benefitHypothesis}\n\n`;
    }
    
    // Acceptance criteria
    if (data.metadata?.acceptanceCriteria && Array.isArray(data.metadata.acceptanceCriteria)) {
      content += `## Acceptance Criteria\n`;
      data.metadata.acceptanceCriteria.forEach((criteria: string) => {
        content += `- ${criteria}\n`;
      });
      content += '\n';
    }
    
    // Dependencies
    if (data.dependencies && data.dependencies.length > 0) {
      content += `## Dependencies\n`;
      data.dependencies.forEach(dep => {
        content += `- ${dep}\n`;
      });
      content += '\n';
    }
    
    // Team assignments
    if (data.metadata?.teamAssignments && Array.isArray(data.metadata.teamAssignments)) {
      content += `## Team Assignments\n`;
      data.metadata.teamAssignments.forEach((team: string) => {
        content += `- ${team}\n`;
      });
      content += '\n';
    }
    
    // Metadata section
    content += '---\n\n';
    content += `**Created**: ${new Date().toISOString().split('T')[0]}\n`;
    content += `**Author**: ${data.author || 'feature-team'}\n`;
    
    if (data.metadata?.artId) {
      content += `**ART**: ${data.metadata.artId}\n`;
    }
    
    if (data.metadata?.programIncrementId) {
      content += `**Program Increment**: ${data.metadata.programIncrementId}\n`;
    }
    
    if (data.metadata?.estimatedSize) {
      content += `**Estimated Size**: ${data.metadata.estimatedSize}\n`;
    }
    
    return content;
  }

  protected generateKeywords(data: Partial<FeatureEntity>): string[] {
    const textSources = [
      data.title || '',
      data.content || '',
      data.metadata?.benefitHypothesis || '',
      ...(data.metadata?.acceptanceCriteria || [])
    ];
    
    const text = textSources.join(' ').toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];

    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'will',
      'with', 'have', 'this', 'that', 'from', 'been', 'each', 'word', 'which',
      'their', 'said', 'what', 'make', 'first', 'would', 'could', 'should'
    ]);

    const keywords = [
      ...new Set(
        words.filter(word =>
          !stopWords.has(word) && 
          word.length >= 3 && 
          !/^\d+$/.test(word)
        )
      )
    ];

    // Add Feature keywords
    keywords.push('feature', 'safe', 'program', 'benefit');
    
    if (data.metadata?.enablerType) {
      keywords.push('enabler', data.metadata.enablerType as string);
    } else {
      keywords.push('business');
    }

    return keywords.slice(0, 15); // Limit to 15 keywords
  }

  // ============================================================================
  // FEATURE OPERATIONS
  // ============================================================================

  /**
   * Create a new Feature
   */
  async createFeature(options: FeatureCreateOptions): Promise<FeatureEntity> {
    if (!this.initialized) await this.initialize();

    try {
      // Prepare Feature document data
      const featureData: Partial<FeatureEntity> = {
        title: options.title,
        content: options.description,
        summary: `Feature: ${options.title}`,
        author: options.author || 'feature-team',
        project_id: options.projectId,
        status: 'draft',
        priority: options.priority || 'medium',
        tags: ['feature', 'safe'],
        dependencies: options.dependencies || [],
        related_documents: [],
        
        metadata: {
          benefitHypothesis: options.benefitHypothesis,
          acceptanceCriteria: options.acceptanceCriteria,
          parentProgramEpicId: options.parentProgramEpicId,
          artId: options.artId,
          programIncrementId: options.programIncrementId,
          estimatedSize: options.estimatedSize,
          teamAssignments: options.teamAssignments || [],
          enablerType: options.enablerType,
          implementationStatus: 'backlog',
          storiesGenerated: 0,
          benefitValidation: {
            hypothesis: options.benefitHypothesis,
            successMetrics: [],
            measurableOutcome: '',
            validationStatus: 'pending'
          },
          ...options.metadata
        }
      };

      // Add enabler or business feature tags
      if (options.enablerType) {
        featureData.tags?.push('enabler', options.enablerType);
      } else {
        featureData.tags?.push('business');
      }

      const feature = await this.createDocument(featureData, {
        autoGenerateRelationships: true,
        startWorkflow: 'feature_workflow',
        generateSearchIndex: true
      });

      this.logger.info(`Created Feature: ${options.title} (${options.enablerType ? 'Enabler' : 'Business'})`);
      this.emit('featureCreated', { feature, type: options.enablerType ? 'enabler' : 'business' });

      return feature;

    } catch (error) {
      this.logger.error('Failed to create Feature:', error);
      throw error;
    }
  }

  /**
   * Generate Stories from Feature
   */
  async generateStoriesFromFeature(featureId: string): Promise<StoryEntity[]> {
    const feature = await this.getDocumentById(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    try {
      // For now, we'll create a placeholder method
      // In a full implementation, this would integrate with the Story service
      // and potentially use AI/ML to intelligently break down Features into Stories
      
      this.logger.info(`Story generation requested for Feature ${featureId} - not yet implemented`);
      this.emit('storyGenerationRequested', { featureId, feature });
      
      // Return empty array for now
      // TODO: Implement story generation logic
      return [];

    } catch (error) {
      this.logger.error('Failed to generate stories from Feature:', error);
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
    const feature = await this.getDocumentById(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    try {
      const updatedFeature = await this.updateDocument(featureId, {
        metadata: {
          ...feature.metadata,
          benefitValidation: validation
        }
      } as Partial<FeatureEntity>);

      this.logger.info(`Updated benefit validation for Feature ${featureId}: ${validation.validationStatus}`);
      this.emit('benefitValidationUpdated', { feature: updatedFeature, validation });

      return updatedFeature;

    } catch (error) {
      this.logger.error('Failed to update benefit validation:', error);
      throw error;
    }
  }

  /**
   * Query Features with Feature-specific filters
   */
  async queryFeatures(options: FeatureQueryOptions = {}): Promise<QueryResult<FeatureEntity>> {
    const result = await this.queryDocuments(options);

    // Apply Feature-specific filters
    let filteredFeatures = result.documents;

    if (options.artId) {
      filteredFeatures = filteredFeatures.filter(feature => 
        feature.metadata?.artId === options.artId
      );
    }

    if (options.programIncrementId) {
      filteredFeatures = filteredFeatures.filter(feature => 
        feature.metadata?.programIncrementId === options.programIncrementId
      );
    }

    if (options.parentProgramEpicId) {
      filteredFeatures = filteredFeatures.filter(feature => 
        feature.metadata?.parentProgramEpicId === options.parentProgramEpicId
      );
    }

    if (options.enablerType) {
      filteredFeatures = filteredFeatures.filter(feature => 
        feature.metadata?.enablerType === options.enablerType
      );
    }

    if (options.teamId) {
      filteredFeatures = filteredFeatures.filter(feature => 
        Array.isArray(feature.metadata?.teamAssignments) &&
        (feature.metadata.teamAssignments as string[]).includes(options.teamId!)
      );
    }

    if (options.implementationStatus) {
      filteredFeatures = filteredFeatures.filter(feature => 
        feature.metadata?.implementationStatus === options.implementationStatus
      );
    }

    return {
      ...result,
      documents: filteredFeatures,
      total: filteredFeatures.length
    };
  }

  /**
   * Get Feature statistics and analytics
   */
  async getFeatureStats(): Promise<FeatureStats> {
    try {
      const { documents: features } = await this.queryDocuments({ limit: 1000 });
      
      const stats: FeatureStats = {
        totalFeatures: features.length,
        byStatus: {},
        byPriority: {},
        bySize: {},
        byART: {},
        totalStories: 0,
        averageStoriesPerFeature: 0,
        enablerFeatures: 0,
        businessFeatures: 0,
        recentActivity: 0,
        velocityTrend: 0
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const feature of features) {
        // Status distribution
        if (feature.status) {
          stats.byStatus[feature.status] = (stats.byStatus[feature.status] || 0) + 1;
        }

        // Priority distribution
        if (feature.priority) {
          stats.byPriority[feature.priority] = (stats.byPriority[feature.priority] || 0) + 1;
        }

        // Size distribution
        if (feature.metadata?.estimatedSize) {
          const size = feature.metadata.estimatedSize as string;
          stats.bySize[size] = (stats.bySize[size] || 0) + 1;
        }

        // ART distribution
        if (feature.metadata?.artId) {
          const artId = feature.metadata.artId as string;
          stats.byART[artId] = (stats.byART[artId] || 0) + 1;
        }

        // Feature type counting
        if (feature.metadata?.enablerType) {
          stats.enablerFeatures++;
        } else {
          stats.businessFeatures++;
        }

        // Stories counting
        const featureStories = feature.metadata?.storiesGenerated || 0;
        stats.totalStories += featureStories as number;

        // Recent activity
        if (new Date(feature.updated_at) >= thirtyDaysAgo) {
          stats.recentActivity++;
        }
      }

      stats.averageStoriesPerFeature = features.length > 0 ? stats.totalStories / features.length : 0;

      return stats;

    } catch (error) {
      this.logger.error('Failed to get Feature stats:', error);
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
  type BenefitHypothesis
};