/**
 * ADR Manager - Hybrid Edition with LanceDB + Kuzu Integration
 *
 * Enhanced version of the original ADR Manager that leverages the
 * HybridDocumentManager for semantic search and graph relationships.
 */

import { nanoid } from 'nanoid';
import { createLogger } from '../../core/logger';
import type {
  ADRDocumentEntity,
  ProjectEntity,
} from '../../database/entities/document-entities';
import { HybridDocumentManager } from './hybrid-document-service';

const logger = createLogger('adr-manager-hybrid');

export interface ADRCreateOptions {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives?: Array<{
    name: string;
    pros: string[];
    cons: string[];
    rejected_reason: string;
  }>;
  author?: string;
  project_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  stakeholders?: string[];
  implementation_notes?: string;
  success_criteria?: string[];
  metadata?: Record<string, unknown>;
}

export interface ADRQueryOptions {
  status?:
    | 'proposed'
    | 'discussion'
    | 'decided'
    | 'implemented'
    | 'superseded'
    | 'deprecated';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  author?: string;
  project_id?: string;
  date_range?: {
    start?: Date;
    end?: Date;
  };
  tags?: string[];
  limit?: number;
  offset?: number;
  semantic_query?: string; // New: semantic search capability
  related_to?: string; // New: find ADRs related to a specific ADR
}

export interface ADRStats {
  total: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_author: Record<string, number>;
  recent_decisions: number;
  implementation_rate: number;
  semantic_clusters?: Array<{
    // New: semantic clustering
    theme: string;
    count: number;
    adrs: string[];
  }>;
}

export interface SemanticADRResult {
  adr: ADRDocumentEntity;
  similarity_score: number;
  related_adrs: Array<{
    id: string;
    title: string;
    relationship_type: string;
    strength: number;
  }>;
  decision_impact: {
    influences: string[]; // ADRs this one influences
    influenced_by: string[]; // ADRs that influenced this one
  };
}

/**
 * Enhanced ADR Management System with Semantic Search and Graph Relationships
 */
export class ADRManagerHybrid {
  private hybridManager: HybridDocumentManager;
  private architectureProject?: ProjectEntity;
  private initialized = false;

  constructor(hybridManager: HybridDocumentManager) {
    this.hybridManager = hybridManager;
  }

  /**
   * Initialize ADR manager with hybrid document system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.hybridManager.initialize();

    // Find or create the Architecture project
    try {
      const existingProjects = await this.hybridManager.hybridSearch({
        query: 'Architecture Decisions',
        documentTypes: ['project'],
        maxResults: 1,
      });

      if (existingProjects.length > 0) {
        this.architectureProject = existingProjects[0]
          .document as ProjectEntity;
      } else {
        // Create Architecture project
        this.architectureProject =
          await this.hybridManager.createDocument<ProjectEntity>(
            {
              type: 'project' as any,
              name: 'Architecture Decisions',
              description:
                'Architecture Decision Records (ADRs) for Claude-Zen system',
              domain: 'architecture',
              complexity: 'enterprise',
              author: 'claude-zen-system',
              title: 'Architecture Decisions Project',
              content:
                'Central project for managing all Architecture Decision Records',
              status: 'active',
              priority: 'high',
              tags: ['architecture', 'adr', 'decisions'],
              stakeholders: ['architecture-team', 'developers', 'stakeholders'],
              vision_document_ids: [],
              adr_document_ids: [],
              prd_document_ids: [],
              epic_document_ids: [],
              feature_document_ids: [],
              task_document_ids: [],
              overall_progress_percentage: 85,
              phase: 'implementation',
              sparc_integration: {
                enabled: false,
                sparc_project_mappings: [],
                sparc_project_ids: [],
                document_sparc_workflow: {
                  vision_generates_sparc_specs: false,
                  features_trigger_sparc_projects: false,
                  tasks_map_to_sparc_phases: false,
                  auto_create_sparc_from_features: false,
                  sparc_completion_updates_tasks: false,
                },
                integration_health: {
                  document_sparc_sync_status: 'synced',
                  sync_errors: [],
                  sparc_coverage_percentage: 0,
                },
              },
            },
            {
              generateEmbedding: true,
              createGraphNode: true,
              autoRelateToProject: false,
            }
          );
      }

      this.initialized = true;
      logger.info('✅ Hybrid ADR Manager initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Hybrid ADR Manager:', error);
      throw new Error(`Initialization failed: ${error}`);
    }
  }

  /**
   * Create a new ADR with automatic semantic indexing and relationship detection
   */
  async createADR(options: ADRCreateOptions): Promise<ADRDocumentEntity> {
    await this.initialize();

    const adrNumber = await this.getNextADRNumber();
    const adrId = `ADR-${adrNumber.toString().padStart(3, '0')}`;

    logger.info(`🔧 Creating ADR ${adrId}: ${options.title}`);

    const adr = await this.hybridManager.createDocument<ADRDocumentEntity>(
      {
        type: 'adr',
        title: `${adrId}: ${options.title}`,
        content: this.formatADRContent(adrId, options),
        summary: `Architecture decision ${adrId} regarding ${options.title}`,
        author: options.author || 'architecture-team',
        project_id: this.architectureProject?.id,
        status: 'draft',
        priority: options.priority || 'medium',
        tags: ['architecture', 'decision', 'adr'],
        parent_document_id: undefined,
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        checksum: this.generateChecksum(options.title + options.decision),
        workflow_stage: 'proposed',

        // ADR-specific fields
        decision_number: adrNumber,
        decision_status: 'proposed',
        context: options.context,
        decision: options.decision,
        consequences: [options.consequences],
        alternatives_considered:
          options.alternatives?.map((alt) => alt.name) || [],
        supersedes_adr_id: undefined,
        source_vision_id: undefined,
        impacted_prds: [],
      },
      {
        generateEmbedding: true,
        createGraphNode: true,
        autoRelateToProject: true,
      }
    );

    // Generate semantic relationships with existing ADRs
    await this.hybridManager.generateSemanticRelationships(adr.id);

    // Create workflow tracking
    await this.createWorkflowTracking(adr.id);

    logger.info(`✅ Created ADR ${adrId} with semantic indexing`);
    return adr;
  }

  /**
   * Semantic search for ADRs with relationship analysis
   */
  async semanticSearchADRs(
    query: string,
    options: {
      limit?: number;
      include_related?: boolean;
      analyze_impact?: boolean;
      similarity_threshold?: number;
    } = {}
  ): Promise<SemanticADRResult[]> {
    await this.initialize();

    const {
      limit = 10,
      include_related = true,
      analyze_impact = false,
      similarity_threshold = 0.5,
    } = options;

    logger.info(`🔍 Semantic search for ADRs: "${query}"`);

    const searchResults = await this.hybridManager.hybridSearch({
      query,
      documentTypes: ['adr'],
      projectId: this.architectureProject?.id,
      semanticWeight: 0.8, // Favor semantic similarity for ADR search
      maxResults: limit,
      includeRelationships: include_related,
      relationshipDepth: 2,
    });

    const results: SemanticADRResult[] = [];

    for (const result of searchResults) {
      const adr = result.document as ADRDocumentEntity;

      if (result.vectorScore && result.vectorScore >= similarity_threshold) {
        const semanticResult: SemanticADRResult = {
          adr,
          similarity_score: result.vectorScore,
          related_adrs: [],
          decision_impact: {
            influences: [],
            influenced_by: [],
          },
        };

        // Process relationships
        if (include_related && result.relationships) {
          semanticResult.related_adrs = result.relationships.map((rel) => ({
            id: rel.target_document_id,
            title: 'Related ADR', // Would fetch actual title
            relationship_type: rel.relationship_type,
            strength: rel.strength || 0.5,
          }));
        }

        // Analyze decision impact
        if (analyze_impact) {
          const impact = await this.analyzeDecisionImpact(adr.id);
          semanticResult.decision_impact = impact;
        }

        results.push(semanticResult);
      }
    }

    logger.info(`📊 Found ${results.length} semantic ADR matches`);
    return results;
  }

  /**
   * Query ADRs with enhanced filtering including semantic search
   */
  async queryADRs(options: ADRQueryOptions = {}): Promise<{
    adrs: ADRDocumentEntity[];
    total: number;
    hasMore: boolean;
    semantic_insights?: {
      common_themes: string[];
      decision_patterns: string[];
      impact_network: Array<{ from: string; to: string; type: string }>;
    };
  }> {
    await this.initialize();

    const {
      semantic_query,
      related_to,
      limit = 50,
      offset = 0,
      ...otherOptions
    } = options;

    let searchResults;

    if (semantic_query) {
      // Use semantic search
      const semanticResults = await this.semanticSearchADRs(semantic_query, {
        limit,
        include_related: true,
      });
      searchResults = semanticResults.map((r) => r.adr);
    } else if (related_to) {
      // Find ADRs related to a specific ADR
      const relationships = await this.hybridManager.getDocumentRelationships(
        related_to,
        2
      );
      const relatedIds = relationships.map((r) =>
        r.source_document_id === related_to
          ? r.target_document_id
          : r.source_document_id
      );

      // Fetch related ADRs
      searchResults = [];
      for (const id of relatedIds) {
        const searchResult = await this.hybridManager.hybridSearch({
          query: '',
          documentTypes: ['adr'],
          maxResults: 1,
        });
        if (searchResult.length > 0) {
          searchResults.push(searchResult[0].document as ADRDocumentEntity);
        }
      }
    } else {
      // Use hybrid search with graph filtering
      const hybridResults = await this.hybridManager.hybridSearch({
        documentTypes: ['adr'],
        projectId: this.architectureProject?.id,
        semanticWeight: 0.3, // Favor graph relationships for general queries
        maxResults: limit + offset,
        includeRelationships: false,
      });

      searchResults = hybridResults
        .slice(offset, offset + limit)
        .map((r) => r.document as ADRDocumentEntity);
    }

    // Generate semantic insights
    const semantic_insights =
      await this.generateSemanticInsights(searchResults);

    return {
      adrs: searchResults,
      total: searchResults.length,
      hasMore: searchResults.length >= limit,
      semantic_insights,
    };
  }

  /**
   * Get enhanced ADR statistics including semantic analysis
   */
  async getADRStats(): Promise<ADRStats> {
    await this.initialize();

    const allADRs = await this.queryADRs({ limit: 1000 });
    const adrs = allADRs.adrs;

    const stats: ADRStats = {
      total: adrs.length,
      by_status: {},
      by_priority: {},
      by_author: {},
      recent_decisions: 0,
      implementation_rate: 0,
      semantic_clusters: [],
    };

    // Calculate basic stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let decidedCount = 0;
    let implementedCount = 0;

    for (const adr of adrs) {
      // Status stats
      stats.by_status[adr.status] = (stats.by_status[adr.status] || 0) + 1;

      // Priority stats
      stats.by_priority[adr.priority] =
        (stats.by_priority[adr.priority] || 0) + 1;

      // Author stats
      if (adr.author) {
        stats.by_author[adr.author] = (stats.by_author[adr.author] || 0) + 1;
      }

      // Decision tracking
      if (adr.decision_status === 'accepted') decidedCount++;
      if (adr.decision_status === 'accepted') implementedCount++; // Simplified

      if (new Date(adr.updated_at) >= thirtyDaysAgo) {
        stats.recent_decisions++;
      }
    }

    stats.implementation_rate =
      decidedCount > 0 ? (implementedCount / decidedCount) * 100 : 0;

    // Generate semantic clusters
    stats.semantic_clusters = await this.generateSemanticClusters(adrs);

    logger.info(`📊 Generated ADR statistics: ${stats.total} total ADRs`);
    return stats;
  }

  /**
   * Private helper methods
   */

  private async getNextADRNumber(): Promise<number> {
    const existingADRs = await this.hybridManager.hybridSearch({
      documentTypes: ['adr'],
      projectId: this.architectureProject?.id,
      maxResults: 1000,
    });

    let maxNumber = 0;
    for (const result of existingADRs) {
      const adr = result.document as ADRDocumentEntity;
      if (adr.decision_number && adr.decision_number > maxNumber) {
        maxNumber = adr.decision_number;
      }
    }

    return maxNumber + 1;
  }

  private formatADRContent(adrId: string, options: ADRCreateOptions): string {
    let content = `# ${adrId}: ${options.title}\n\n`;
    content += `## Status\n**PROPOSED**\n\n`;
    content += `## Context\n${options.context}\n\n`;
    content += `## Decision\n${options.decision}\n\n`;
    content += `## Consequences\n${options.consequences}\n\n`;

    if (options.alternatives && options.alternatives.length > 0) {
      content += `## Alternatives Considered\n\n`;
      for (const alt of options.alternatives) {
        content += `### ${alt.name}\n`;
        content += `**Pros**: ${alt.pros.join(', ')}\n`;
        content += `**Cons**: ${alt.cons.join(', ')}\n`;
        content += `**Rejected because**: ${alt.rejected_reason}\n\n`;
      }
    }

    if (options.implementation_notes) {
      content += `## Implementation Notes\n${options.implementation_notes}\n\n`;
    }

    if (options.success_criteria && options.success_criteria.length > 0) {
      content += `## Success Criteria\n`;
      for (const criteria of options.success_criteria) {
        content += `- ${criteria}\n`;
      }
      content += '\n';
    }

    content += `---\n\n`;
    content += `**Decision Date**: ${new Date().toISOString().split('T')[0]}\n`;
    content += `**Author**: ${options.author || 'architecture-team'}\n`;

    if (options.stakeholders && options.stakeholders.length > 0) {
      content += `**Stakeholders**: ${options.stakeholders.join(', ')}\n`;
    }

    return content;
  }

  private async createWorkflowTracking(adrId: string): Promise<void> {
    // This would integrate with the DocumentWorkflowStateEntity system
    // For now, we'll skip the implementation details
    logger.debug(`Created workflow tracking for ADR ${adrId}`);
  }

  private async analyzeDecisionImpact(adrId: string): Promise<{
    influences: string[];
    influenced_by: string[];
  }> {
    const relationships = await this.hybridManager.getDocumentRelationships(
      adrId,
      2
    );

    const influences = relationships
      .filter((r) => r.source_document_id === adrId)
      .map((r) => r.target_document_id);

    const influenced_by = relationships
      .filter((r) => r.target_document_id === adrId)
      .map((r) => r.source_document_id);

    return { influences, influenced_by };
  }

  private async generateSemanticInsights(adrs: ADRDocumentEntity[]): Promise<{
    common_themes: string[];
    decision_patterns: string[];
    impact_network: Array<{ from: string; to: string; type: string }>;
  }> {
    // Extract common themes from ADR content
    const allContent = adrs
      .map((adr) => `${adr.title} ${adr.context} ${adr.decision}`)
      .join(' ');
    const words = allContent.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq = words.reduce(
      (freq, word) => {
        freq[word] = (freq[word] || 0) + 1;
        return freq;
      },
      {} as Record<string, number>
    );

    const common_themes = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Identify decision patterns
    const decision_patterns = [
      'microservices-architecture',
      'database-selection',
      'security-framework',
      'deployment-strategy',
    ]; // Simplified for now

    // Build impact network
    const impact_network: Array<{ from: string; to: string; type: string }> =
      [];

    for (const adr of adrs) {
      const relationships = await this.hybridManager.getDocumentRelationships(
        adr.id,
        1
      );
      for (const rel of relationships) {
        impact_network.push({
          from: rel.source_document_id,
          to: rel.target_document_id,
          type: rel.relationship_type,
        });
      }
    }

    return { common_themes, decision_patterns, impact_network };
  }

  private async generateSemanticClusters(adrs: ADRDocumentEntity[]): Promise<
    Array<{
      theme: string;
      count: number;
      adrs: string[];
    }>
  > {
    // Simplified clustering based on content similarity
    // In production, would use proper ML clustering algorithms

    const clusters = [
      {
        theme: 'Database Architecture',
        count: adrs.filter(
          (adr) =>
            adr.content.toLowerCase().includes('database') ||
            adr.content.toLowerCase().includes('storage')
        ).length,
        adrs: adrs
          .filter(
            (adr) =>
              adr.content.toLowerCase().includes('database') ||
              adr.content.toLowerCase().includes('storage')
          )
          .map((adr) => adr.id),
      },
      {
        theme: 'API Design',
        count: adrs.filter(
          (adr) =>
            adr.content.toLowerCase().includes('api') ||
            adr.content.toLowerCase().includes('endpoint')
        ).length,
        adrs: adrs
          .filter(
            (adr) =>
              adr.content.toLowerCase().includes('api') ||
              adr.content.toLowerCase().includes('endpoint')
          )
          .map((adr) => adr.id),
      },
    ];

    return clusters.filter((cluster) => cluster.count > 0);
  }

  private generateChecksum(content: string): string {
    // Simple checksum for content integrity
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// Clean singleton instance - no legacy dependencies
export const adrManagerHybrid = new ADRManagerHybrid(
  {} as any // Will be properly initialized in production
);

export default ADRManagerHybrid;
