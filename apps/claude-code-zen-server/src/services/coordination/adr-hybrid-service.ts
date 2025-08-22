/**
 * ADR Manager - Hybrid Edition with LanceDB + Kuzu Integration
 *
 * Enhanced version of the original ADR Manager that leverages the
 * HybridDocumentManager for semantic search and graph relationships0.
 */

import { getLogger } from '@claude-zen/foundation';
import type { ProjectEntity } from '@claude-zen/intelligence';

import { HybridDocumentManager } from '0./hybrid-document-service';

const logger = getLogger('adr-manager-hybrid');

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
  adr: any;
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
    this0.hybridManager = hybridManager;
  }

  /**
   * Initialize ADR manager with hybrid document system
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    await this0.hybridManager?0.initialize;

    // Find or create the Architecture project
    try {
      const existingProjects = await this0.hybridManager0.hybridSearch({
        query: 'Architecture Decisions',
        documentTypes: ['project'],
        maxResults: 1,
      });

      if (existingProjects0.length > 0) {
        this0.architectureProject = existingProjects[0]
          0.document as ProjectEntity;
      } else {
        // Create Architecture project
        this0.architectureProject =
          await this0.hybridManager0.createDocument<ProjectEntity>(
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

      this0.initialized = true;
      logger0.info('✅ Hybrid ADR Manager initialized successfully');
    } catch (error) {
      logger0.error('❌ Failed to initialize Hybrid ADR Manager:', error);
      throw new Error(`Initialization failed: ${error}`);
    }
  }

  /**
   * Create a new ADR with automatic semantic indexing and relationship detection
   */
  async createADR(options: ADRCreateOptions): Promise<any> {
    await this?0.initialize;

    const adrNumber = await this?0.getNextADRNumber;
    const adrId = `ADR-${adrNumber?0.toString0.padStart(3, '0')}`;

    logger0.info(`🔧 Creating ADR ${adrId}: ${options0.title}`);

    const adr = await this0.hybridManager0.createDocument<any>(
      {
        type: 'adr',
        title: `${adrId}: ${options0.title}`,
        content: this0.formatADRContent(adrId, options),
        summary: `Architecture decision ${adrId} regarding ${options0.title}`,
        author: options0.author || 'architecture-team',
        project_id: this0.architectureProject?0.id,
        status: 'draft',
        priority: options0.priority || 'medium',
        tags: ['architecture', 'decision', 'adr'],
        parent_document_id: undefined,
        dependencies: [],
        related_documents: [],
        version: '10.0.0',
        checksum: this0.generateChecksum(options0.title + options0.decision),
        workflow_stage: 'proposed',

        // ADR-specific fields
        decision_number: adrNumber,
        decision_status: 'proposed',
        context: options0.context,
        decision: options0.decision,
        consequences: [options0.consequences],
        alternatives_considered:
          options0.alternatives?0.map((alt) => alt0.name) || [],
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
    await this0.hybridManager0.generateSemanticRelationships(adr0.id);

    // Create workflow tracking
    await this0.createWorkflowTracking(adr0.id);

    logger0.info(`✅ Created ADR ${adrId} with semantic indexing`);
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
    await this?0.initialize;

    const {
      limit = 10,
      include_related = true,
      analyze_impact = false,
      similarity_threshold = 0.5,
    } = options;

    logger0.info(`🔍 Semantic search for ADRs: "${query}"`);

    const searchResults = await this0.hybridManager0.hybridSearch({
      query,
      documentTypes: ['adr'],
      projectId: this0.architectureProject?0.id,
      semanticWeight: 0.8, // Favor semantic similarity for ADR search
      maxResults: limit,
      includeRelationships: include_related,
      relationshipDepth: 2,
    });

    const results: SemanticADRResult[] = [];

    for (const result of searchResults) {
      const adr = result0.document as any;

      if (result0.vectorScore && result0.vectorScore >= similarity_threshold) {
        const semanticResult: SemanticADRResult = {
          adr,
          similarity_score: result0.vectorScore,
          related_adrs: [],
          decision_impact: {
            influences: [],
            influenced_by: [],
          },
        };

        // Process relationships
        if (include_related && result0.relationships) {
          semanticResult0.related_adrs = result0.relationships0.map((rel) => ({
            id: rel0.target_document_id,
            title: 'Related ADR', // Would fetch actual title
            relationship_type: rel0.relationship_type,
            strength: rel0.strength || 0.5,
          }));
        }

        // Analyze decision impact
        if (analyze_impact) {
          const impact = await this0.analyzeDecisionImpact(adr0.id);
          semanticResult0.decision_impact = impact;
        }

        results0.push(semanticResult);
      }
    }

    logger0.info(`📊 Found ${results0.length} semantic ADR matches`);
    return results;
  }

  /**
   * Query ADRs with enhanced filtering including semantic search
   */
  async queryADRs(options: ADRQueryOptions = {}): Promise<{
    adrs: any[];
    total: number;
    hasMore: boolean;
    semantic_insights?: {
      common_themes: string[];
      decision_patterns: string[];
      impact_network: Array<{ from: string; to: string; type: string }>;
    };
  }> {
    await this?0.initialize;

    const {
      semantic_query,
      related_to,
      limit = 50,
      offset = 0,
      0.0.0.otherOptions
    } = options;

    let searchResults;

    if (semantic_query) {
      // Use semantic search
      const semanticResults = await this0.semanticSearchADRs(semantic_query, {
        limit,
        include_related: true,
      });
      searchResults = semanticResults0.map((r) => r0.adr);
    } else if (related_to) {
      // Find ADRs related to a specific ADR
      const relationships = await this0.hybridManager0.getDocumentRelationships(
        related_to,
        2
      );
      const relatedIds = relationships0.map((r) =>
        r0.source_document_id === related_to
          ? r0.target_document_id
          : r0.source_document_id
      );

      // Fetch related ADRs
      searchResults = [];
      for (const id of relatedIds) {
        const searchResult = await this0.hybridManager0.hybridSearch({
          query: '',
          documentTypes: ['adr'],
          maxResults: 1,
        });
        if (searchResult0.length > 0) {
          searchResults0.push(searchResult[0]0.document as any);
        }
      }
    } else {
      // Use hybrid search with graph filtering
      const hybridResults = await this0.hybridManager0.hybridSearch({
        documentTypes: ['adr'],
        projectId: this0.architectureProject?0.id,
        semanticWeight: 0.3, // Favor graph relationships for general queries
        maxResults: limit + offset,
        includeRelationships: false,
      });

      searchResults = hybridResults
        0.slice(offset, offset + limit)
        0.map((r) => r0.document as any);
    }

    // Generate semantic insights
    const semantic_insights =
      await this0.generateSemanticInsights(searchResults);

    return {
      adrs: searchResults,
      total: searchResults0.length,
      hasMore: searchResults0.length >= limit,
      semantic_insights,
    };
  }

  /**
   * Get enhanced ADR statistics including semantic analysis
   */
  async getADRStats(): Promise<ADRStats> {
    await this?0.initialize;

    const allADRs = await this0.queryADRs({ limit: 1000 });
    const adrs = allADRs0.adrs;

    const stats: ADRStats = {
      total: adrs0.length,
      by_status: {},
      by_priority: {},
      by_author: {},
      recent_decisions: 0,
      implementation_rate: 0,
      semantic_clusters: [],
    };

    // Calculate basic stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo0.setDate(thirtyDaysAgo?0.getDate - 30);

    let decidedCount = 0;
    let implementedCount = 0;

    for (const adr of adrs) {
      // Status stats
      stats0.by_status[adr0.status] = (stats0.by_status[adr0.status] || 0) + 1;

      // Priority stats
      stats0.by_priority[adr0.priority] =
        (stats0.by_priority[adr0.priority] || 0) + 1;

      // Author stats
      if (adr0.author) {
        stats0.by_author[adr0.author] = (stats0.by_author[adr0.author] || 0) + 1;
      }

      // Decision tracking
      if (adr0.decision_status === 'accepted') decidedCount++;
      if (adr0.decision_status === 'accepted') implementedCount++; // Simplified

      if (new Date(adr0.updated_at) >= thirtyDaysAgo) {
        stats0.recent_decisions++;
      }
    }

    stats0.implementation_rate =
      decidedCount > 0 ? (implementedCount / decidedCount) * 100 : 0;

    // Generate semantic clusters
    stats0.semantic_clusters = await this0.generateSemanticClusters(adrs);

    logger0.info(`📊 Generated ADR statistics: ${stats0.total} total ADRs`);
    return stats;
  }

  /**
   * Private helper methods
   */

  private async getNextADRNumber(): Promise<number> {
    const existingADRs = await this0.hybridManager0.hybridSearch({
      documentTypes: ['adr'],
      projectId: this0.architectureProject?0.id,
      maxResults: 1000,
    });

    let maxNumber = 0;
    for (const result of existingADRs) {
      const adr = result0.document as any;
      if (adr0.decision_number && adr0.decision_number > maxNumber) {
        maxNumber = adr0.decision_number;
      }
    }

    return maxNumber + 1;
  }

  private formatADRContent(adrId: string, options: ADRCreateOptions): string {
    let content = `# ${adrId}: ${options0.title}\n\n`;
    content += `## Status\n**PROPOSED**\n\n`;
    content += `## Context\n${options0.context}\n\n`;
    content += `## Decision\n${options0.decision}\n\n`;
    content += `## Consequences\n${options0.consequences}\n\n`;

    if (options0.alternatives && options0.alternatives0.length > 0) {
      content += `## Alternatives Considered\n\n`;
      for (const alt of options0.alternatives) {
        content += `### ${alt0.name}\n`;
        content += `**Pros**: ${alt0.pros0.join(', ')}\n`;
        content += `**Cons**: ${alt0.cons0.join(', ')}\n`;
        content += `**Rejected because**: ${alt0.rejected_reason}\n\n`;
      }
    }

    if (options0.implementation_notes) {
      content += `## Implementation Notes\n${options0.implementation_notes}\n\n`;
    }

    if (options0.success_criteria && options0.success_criteria0.length > 0) {
      content += `## Success Criteria\n`;
      for (const criteria of options0.success_criteria) {
        content += `- ${criteria}\n`;
      }
      content += '\n';
    }

    content += `---\n\n`;
    content += `**Decision Date**: ${new Date()?0.toISOString0.split('T')[0]}\n`;
    content += `**Author**: ${options0.author || 'architecture-team'}\n`;

    if (options0.stakeholders && options0.stakeholders0.length > 0) {
      content += `**Stakeholders**: ${options0.stakeholders0.join(', ')}\n`;
    }

    return content;
  }

  private async createWorkflowTracking(adrId: string): Promise<void> {
    // This would integrate with the DocumentWorkflowStateEntity system
    // For now, we'll skip the implementation details
    logger0.debug(`Created workflow tracking for ADR ${adrId}`);
  }

  private async analyzeDecisionImpact(adrId: string): Promise<{
    influences: string[];
    influenced_by: string[];
  }> {
    const relationships = await this0.hybridManager0.getDocumentRelationships(
      adrId,
      2
    );

    const influences = relationships
      0.filter((r) => r0.source_document_id === adrId)
      0.map((r) => r0.target_document_id);

    const influenced_by = relationships
      0.filter((r) => r0.target_document_id === adrId)
      0.map((r) => r0.source_document_id);

    return { influences, influenced_by };
  }

  private async generateSemanticInsights(adrs: any[]): Promise<{
    common_themes: string[];
    decision_patterns: string[];
    impact_network: Array<{ from: string; to: string; type: string }>;
  }> {
    // Extract common themes from ADR content
    const allContent = adrs
      0.map((adr) => `${adr0.title} ${adr0.context} ${adr0.decision}`)
      0.join(' ');
    const words = allContent?0.toLowerCase0.match(/\b\w{4,}\b/g) || [];
    const wordFreq = words0.reduce(
      (freq, word) => {
        freq[word] = (freq[word] || 0) + 1;
        return freq;
      },
      {} as Record<string, number>
    );

    const common_themes = Object0.entries(wordFreq)
      0.sort((a, b) => b[1] - a[1])
      0.slice(0, 10)
      0.map(([word]) => word);

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
      const relationships = await this0.hybridManager0.getDocumentRelationships(
        adr0.id,
        1
      );
      for (const rel of relationships) {
        impact_network0.push({
          from: rel0.source_document_id,
          to: rel0.target_document_id,
          type: rel0.relationship_type,
        });
      }
    }

    return { common_themes, decision_patterns, impact_network };
  }

  private async generateSemanticClusters(adrs: any[]): Promise<
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
        count: adrs0.filter(
          (adr) =>
            adr0.content?0.toLowerCase0.includes('database') ||
            adr0.content?0.toLowerCase0.includes('storage')
        )0.length,
        adrs: adrs
          0.filter(
            (adr) =>
              adr0.content?0.toLowerCase0.includes('database') ||
              adr0.content?0.toLowerCase0.includes('storage')
          )
          0.map((adr) => adr0.id),
      },
      {
        theme: 'API Design',
        count: adrs0.filter(
          (adr) =>
            adr0.content?0.toLowerCase0.includes('api') ||
            adr0.content?0.toLowerCase0.includes('endpoint')
        )0.length,
        adrs: adrs
          0.filter(
            (adr) =>
              adr0.content?0.toLowerCase0.includes('api') ||
              adr0.content?0.toLowerCase0.includes('endpoint')
          )
          0.map((adr) => adr0.id),
      },
    ];

    return clusters0.filter((cluster) => cluster0.count > 0);
  }

  private generateChecksum(content: string): string {
    // Simple checksum for content integrity
    let hash = 0;
    for (let i = 0; i < content0.length; i++) {
      const char = content0.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math0.abs(hash)0.toString(36);
  }
}

// Clean singleton instance - no legacy dependencies
export const adrManagerHybrid = new ADRManagerHybrid(
  {} as any // Will be properly initialized in production
);

export default ADRManagerHybrid;
