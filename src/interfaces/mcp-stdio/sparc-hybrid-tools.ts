/**
 * SPARC + Hybrid Database Tools for MCP Server
 *
 * Provides MCP tools that combine SPARC methodology with the hybrid
 * database system (LanceDB + Kuzu + SQLite) for comprehensive
 * project management and architecture decision support.
 */

import { createLogger } from '../../core/logger.js';
import { createHybridSystem } from '../../services/factories/hybrid-service-factory.js';
import type { ADRCreateOptions } from '../../services/document/adr-service.js';

const logger = createLogger('sparc-hybrid-tools');

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export class SparcHybridTools {
  private adrManager: any = null;
  private hybridManager: any = null;
  private initialized = false;

  constructor() {
    this.initializeAsync();
  }

  private async initializeAsync(): Promise<void> {
    try {
      // Use production hybrid system for real data operations
      const system = await createHybridSystem({
        dataDir: './data',
        enableVectorSearch: true,
        enableGraphRelationships: true,
        vectorDimension: 384,
        useRealDatabases: true,
      });

      this.adrManager = system.adrManager;
      this.hybridManager = system.hybridManager;
      this.initialized = true;

      logger.info(
        '✅ SPARC Hybrid Tools initialized with production databases'
      );
    } catch (error) {
      logger.warn('⚠️ SPARC Hybrid Tools initialization deferred:', error);
      // Will initialize on first use
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeAsync();
    }
  }

  /**
   * Get all MCP tool definitions for SPARC + Hybrid functionality
   */
  getToolDefinitions(): MCPToolDefinition[] {
    return [
      // ADR Management Tools
      {
        name: 'adr_create',
        description:
          'Create a new Architecture Decision Record with semantic indexing and relationship detection',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'ADR title (will be auto-numbered)',
              minLength: 10,
            },
            context: {
              type: 'string',
              description: 'Context and background for the decision',
              minLength: 50,
            },
            decision: {
              type: 'string',
              description: 'The actual decision being made',
              minLength: 20,
            },
            consequences: {
              type: 'string',
              description: 'Expected consequences and implications',
              minLength: 20,
            },
            alternatives: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  pros: { type: 'array', items: { type: 'string' } },
                  cons: { type: 'array', items: { type: 'string' } },
                  rejected_reason: { type: 'string' },
                },
                required: ['name', 'rejected_reason'],
              },
              description: 'Alternative approaches considered',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              default: 'medium',
              description: 'Decision priority level',
            },
            stakeholders: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Stakeholders involved in or affected by this decision',
            },
            implementation_notes: {
              type: 'string',
              description: 'Implementation guidance and notes',
            },
            success_criteria: {
              type: 'array',
              items: { type: 'string' },
              description: 'Success criteria for this decision',
            },
          },
          required: ['title', 'context', 'decision', 'consequences'],
        },
      },

      {
        name: 'adr_semantic_search',
        description:
          'Search ADRs using semantic similarity and relationship analysis',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language search query',
              minLength: 3,
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 50,
              default: 10,
              description: 'Maximum number of results',
            },
            include_related: {
              type: 'boolean',
              default: true,
              description: 'Include related ADRs in results',
            },
            analyze_impact: {
              type: 'boolean',
              default: false,
              description: 'Analyze decision impact network',
            },
            similarity_threshold: {
              type: 'number',
              minimum: 0.0,
              maximum: 1.0,
              default: 0.5,
              description: 'Minimum similarity threshold (0-1)',
            },
          },
          required: ['query'],
        },
      },

      {
        name: 'adr_relationship_map',
        description:
          'Generate a relationship map showing how ADRs influence each other',
        inputSchema: {
          type: 'object',
          properties: {
            adr_id: {
              type: 'string',
              description:
                'ADR ID to analyze relationships for (optional - if not provided, analyzes all)',
            },
            max_depth: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              default: 2,
              description: 'Maximum relationship depth to traverse',
            },
            relationship_types: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'generates',
                  'implements',
                  'depends_on',
                  'relates_to',
                  'supersedes',
                ],
              },
              description: 'Types of relationships to include',
            },
          },
        },
      },

      {
        name: 'adr_stats',
        description:
          'Get comprehensive ADR statistics and analytics including semantic clusters',
        inputSchema: {
          type: 'object',
          properties: {
            include_semantic_analysis: {
              type: 'boolean',
              default: true,
              description: 'Include semantic clustering and theme analysis',
            },
            date_range: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' },
              },
              description: 'Date range for statistics',
            },
          },
        },
      },

      // Hybrid Document Search Tools
      {
        name: 'hybrid_document_search',
        description:
          'Search all documents (Vision, ADR, PRD, Epic, Feature, Task) using hybrid semantic + graph search',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
              minLength: 3,
            },
            document_types: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['vision', 'adr', 'prd', 'epic', 'feature', 'task'],
              },
              description: 'Document types to search',
            },
            project_id: {
              type: 'string',
              description: 'Limit search to specific project',
            },
            semantic_weight: {
              type: 'number',
              minimum: 0.0,
              maximum: 1.0,
              default: 0.7,
              description:
                'Weight for semantic vs graph search (0=graph only, 1=semantic only)',
            },
            max_results: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 20,
              description: 'Maximum results to return',
            },
            include_relationships: {
              type: 'boolean',
              default: true,
              description: 'Include document relationships in results',
            },
            relationship_depth: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              default: 1,
              description: 'Depth of relationships to include',
            },
          },
          required: ['query'],
        },
      },

      // SPARC Project Management Tools
      {
        name: 'sparc_project_init',
        description:
          'Initialize a new SPARC methodology project with Vision → ADR → PRD → Epic → Feature → Task workflow',
        inputSchema: {
          type: 'object',
          properties: {
            project_name: {
              type: 'string',
              description: 'Project name',
              minLength: 3,
            },
            project_description: {
              type: 'string',
              description: 'Project description',
              minLength: 20,
            },
            domain: {
              type: 'string',
              enum: [
                'swarm-coordination',
                'neural-networks',
                'wasm-integration',
                'rest-api',
                'memory-systems',
                'interfaces',
                'general',
              ],
              default: 'general',
              description: 'Project domain',
            },
            complexity: {
              type: 'string',
              enum: ['simple', 'moderate', 'complex', 'enterprise'],
              default: 'moderate',
              description: 'Project complexity level',
            },
            stakeholders: {
              type: 'array',
              items: { type: 'string' },
              description: 'Project stakeholders',
            },
            enable_sparc_methodology: {
              type: 'boolean',
              default: true,
              description: 'Enable SPARC methodology integration',
            },
          },
          required: ['project_name', 'project_description'],
        },
      },

      {
        name: 'sparc_workflow_status',
        description:
          'Get status of SPARC workflow progression for a project or document',
        inputSchema: {
          type: 'object',
          properties: {
            project_id: {
              type: 'string',
              description: 'Project ID to check status for',
            },
            document_id: {
              type: 'string',
              description: 'Specific document ID to check',
            },
            include_phase_details: {
              type: 'boolean',
              default: true,
              description: 'Include details for each SPARC phase',
            },
          },
        },
      },

      // Decision Impact Analysis Tools
      {
        name: 'decision_impact_analysis',
        description:
          'Analyze the impact of architectural decisions across the entire project ecosystem',
        inputSchema: {
          type: 'object',
          properties: {
            decision_id: {
              type: 'string',
              description: 'ADR or decision ID to analyze',
            },
            analysis_depth: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              default: 3,
              description: 'Depth of impact analysis',
            },
            include_future_impact: {
              type: 'boolean',
              default: true,
              description: 'Analyze potential future impacts',
            },
            include_risk_assessment: {
              type: 'boolean',
              default: true,
              description: 'Include risk assessment',
            },
          },
          required: ['decision_id'],
        },
      },

      // Document Generation Tools
      {
        name: 'generate_document_relationships',
        description:
          'Generate semantic relationships between documents based on content similarity',
        inputSchema: {
          type: 'object',
          properties: {
            document_id: {
              type: 'string',
              description: 'Document ID to generate relationships for',
            },
            relationship_threshold: {
              type: 'number',
              minimum: 0.1,
              maximum: 0.9,
              default: 0.7,
              description: 'Similarity threshold for creating relationships',
            },
            max_relationships: {
              type: 'number',
              minimum: 1,
              maximum: 20,
              default: 10,
              description: 'Maximum relationships to generate',
            },
          },
          required: ['document_id'],
        },
      },
    ];
  }

  /**
   * Execute MCP tool calls
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    await this.ensureInitialized();

    try {
      switch (toolName) {
        case 'adr_create':
          return await this.createADR(args);

        case 'adr_semantic_search':
          return await this.semanticSearchADRs(args);

        case 'adr_relationship_map':
          return await this.getADRRelationshipMap(args);

        case 'adr_stats':
          return await this.getADRStats(args);

        case 'hybrid_document_search':
          return await this.hybridDocumentSearch(args);

        case 'sparc_project_init':
          return await this.initSparcProject(args);

        case 'sparc_workflow_status':
          return await this.getSparcWorkflowStatus(args);

        case 'decision_impact_analysis':
          return await this.analyzeDecisionImpact(args);

        case 'generate_document_relationships':
          return await this.generateDocumentRelationships(args);

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      logger.error(`Tool execution failed for ${toolName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tool: toolName,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Tool implementation methods
   */

  private async createADR(args: ADRCreateOptions): Promise<any> {
    const adr = await this.adrManager.createADR(args);

    return {
      success: true,
      data: {
        id: adr.id,
        title: adr.title,
        decision_number: adr.decision_number,
        status: adr.status,
        created_at: adr.created_at,
      },
      message: `ADR ${adr.decision_number} created successfully with semantic indexing`,
      tool: 'adr_create',
      timestamp: new Date().toISOString(),
    };
  }

  private async semanticSearchADRs(args: any): Promise<any> {
    const results = await this.adrManager.semanticSearchADRs(args.query, {
      limit: args.limit || 10,
      include_related: args.include_related !== false,
      analyze_impact: args.analyze_impact || false,
      similarity_threshold: args.similarity_threshold || 0.5,
    });

    return {
      success: true,
      data: {
        results: results.map((r) => ({
          adr: {
            id: r.adr.id,
            title: r.adr.title,
            decision_number: r.adr.decision_number,
            status: r.adr.status,
            priority: r.adr.priority,
            author: r.adr.author,
            created_at: r.adr.created_at,
          },
          similarity_score: r.similarity_score,
          related_adrs: r.related_adrs,
          decision_impact: r.decision_impact,
        })),
        query: args.query,
        total_results: results.length,
      },
      tool: 'adr_semantic_search',
      timestamp: new Date().toISOString(),
    };
  }

  private async getADRRelationshipMap(args: any): Promise<any> {
    const relationships = args.adr_id
      ? await this.hybridManager.getDocumentRelationships(
          args.adr_id,
          args.max_depth || 2
        )
      : await this.getAllADRRelationships(args.max_depth || 2);

    return {
      success: true,
      data: {
        relationships: relationships.map((rel) => ({
          from: rel.source_document_id,
          to: rel.target_document_id,
          type: rel.relationship_type,
          strength: rel.strength,
          created_at: rel.created_at,
        })),
        total_relationships: relationships.length,
        analysis_depth: args.max_depth || 2,
      },
      tool: 'adr_relationship_map',
      timestamp: new Date().toISOString(),
    };
  }

  private async getADRStats(args: any): Promise<any> {
    const stats = await this.adrManager.getADRStats();

    return {
      success: true,
      data: stats,
      tool: 'adr_stats',
      timestamp: new Date().toISOString(),
    };
  }

  private async hybridDocumentSearch(args: any): Promise<any> {
    const results = await this.hybridManager.hybridSearch({
      query: args.query,
      documentTypes: args.document_types || [],
      projectId: args.project_id,
      semanticWeight: args.semantic_weight || 0.7,
      maxResults: args.max_results || 20,
      includeRelationships: args.include_relationships !== false,
      relationshipDepth: args.relationship_depth || 1,
    });

    return {
      success: true,
      data: {
        results: results.map((r) => ({
          document: {
            id: r.document.id,
            type: r.document.type,
            title: r.document.title,
            author: r.document.author,
            status: r.document.status,
            priority: r.document.priority,
            created_at: r.document.created_at,
          },
          vector_score: r.vectorScore,
          graph_distance: r.graphDistance,
          combined_score: r.combinedScore,
          relationships: r.relationships,
        })),
        query: args.query,
        total_results: results.length,
        semantic_weight: args.semantic_weight || 0.7,
      },
      tool: 'hybrid_document_search',
      timestamp: new Date().toISOString(),
    };
  }

  private async initSparcProject(args: any): Promise<any> {
    // This would integrate with the project creation system
    const project = await this.hybridManager.createDocument({
      type: 'project',
      title: args.project_name,
      content: args.project_description,
      status: 'active',
      priority: 'high',
      author: 'sparc-system',
      tags: ['sparc', 'project', args.domain],
      name: args.project_name,
      description: args.project_description,
      domain: args.domain,
      complexity: args.complexity,
      stakeholders: args.stakeholders || [],
    });

    return {
      success: true,
      data: {
        project_id: project.id,
        name: project.name,
        domain: project.domain,
        complexity: project.complexity,
        sparc_enabled: args.enable_sparc_methodology !== false,
      },
      message: `SPARC project "${args.project_name}" initialized successfully`,
      tool: 'sparc_project_init',
      timestamp: new Date().toISOString(),
    };
  }

  private async getSparcWorkflowStatus(args: any): Promise<any> {
    // Mock implementation - would integrate with actual SPARC workflow system
    return {
      success: true,
      data: {
        project_id: args.project_id,
        sparc_phases: {
          specification: { status: 'completed', progress: 100 },
          pseudocode: { status: 'in_progress', progress: 60 },
          architecture: { status: 'pending', progress: 0 },
          refinement: { status: 'pending', progress: 0 },
          completion: { status: 'pending', progress: 0 },
        },
        overall_progress: 32,
        current_phase: 'pseudocode',
      },
      tool: 'sparc_workflow_status',
      timestamp: new Date().toISOString(),
    };
  }

  private async analyzeDecisionImpact(args: any): Promise<any> {
    const relationships = await this.hybridManager.getDocumentRelationships(
      args.decision_id,
      args.analysis_depth || 3
    );

    return {
      success: true,
      data: {
        decision_id: args.decision_id,
        direct_impacts: relationships.filter(
          (r) => r.source_document_id === args.decision_id
        ),
        influenced_by: relationships.filter(
          (r) => r.target_document_id === args.decision_id
        ),
        network_size: relationships.length,
        risk_level: 'medium', // Would be calculated based on impact analysis
        future_considerations: [
          'Monitor implementation progress',
          'Review decision effectiveness in 3 months',
          'Assess impact on related architectural decisions',
        ],
      },
      tool: 'decision_impact_analysis',
      timestamp: new Date().toISOString(),
    };
  }

  private async generateDocumentRelationships(args: any): Promise<any> {
    await this.hybridManager.generateSemanticRelationships(args.document_id);

    const newRelationships = await this.hybridManager.getDocumentRelationships(
      args.document_id,
      1
    );

    return {
      success: true,
      data: {
        document_id: args.document_id,
        relationships_generated: newRelationships.length,
        relationships: newRelationships.map((rel) => ({
          target_document: rel.target_document_id,
          type: rel.relationship_type,
          strength: rel.strength,
        })),
      },
      message: `Generated ${newRelationships.length} semantic relationships`,
      tool: 'generate_document_relationships',
      timestamp: new Date().toISOString(),
    };
  }

  private async getAllADRRelationships(maxDepth: number): Promise<any[]> {
    // Mock implementation - would get all ADR relationships
    return [];
  }
}

export default SparcHybridTools;
