/**
 * Hybrid Document Manager - LanceDB + Kuzu Integration
 *
 * Extends the existing DAL system to provide a unified interface for
 * Vision/ADR/PRD/Epic/Feature/Task documents using:
 * - LanceDB for semantic search and embeddings
 * - Kuzu for relationship graphs and workflow dependencies
 * - Existing entity definitions and DAL architecture
 */

import { getLogger } from '@claude-zen/foundation';
import { DALFactory } from '@claude-zen/intelligence';
import type {
  BaseDocumentEntity,
  DocumentRelationshipEntity,
  DocumentWorkflowStateEntity,
  ProjectEntity,
  GraphRepository,
  VectorRepository,
  Repository,
} from '@claude-zen/intelligence';
import { nanoid } from 'nanoid';

const logger = getLogger('hybrid-document-manager');

export interface DocumentEmbedding {
  id: string;
  documentId: string;
  documentType: string;
  vector: number[];
  metadata: {
    title: string;
    content: string;
    summary?: string;
    keywords: string[];
    author?: string;
    projectId?: string;
    created: Date;
  };
}

export interface DocumentNode {
  id: string;
  type: 'document' | 'project';
  labels: string[];
  properties: {
    documentType: string;
    title: string;
    status: string;
    priority: string;
    author?: string;
    projectId?: string;
    created: Date;
    updated: Date;
  };
}

export interface DocumentRelationship {
  id: string;
  type: 'generates' | 'implements' | 'depends_on' | 'relates_to' | 'supersedes';
  fromNodeId: string;
  toNodeId: string;
  properties: {
    strength?: number;
    created: Date;
    metadata?: Record<string, unknown>;
  };
}

export interface HybridSearchOptions {
  query?: string;
  documentTypes?: string[];
  projectId?: string;
  semanticWeight?: number; // 0-1, how much to weight vector search vs graph search
  maxResults?: number;
  includeRelationships?: boolean;
  relationshipDepth?: number;
}

export interface HybridSearchResult {
  document: BaseDocumentEntity;
  vectorScore?: number;
  graphDistance?: number;
  combinedScore: number;
  relationships?: DocumentRelationshipEntity[];
}

/**
 * Hybrid Document Manager leveraging existing DAL infrastructure
 */
export class HybridDocumentManager {
  private documentRepo: Repository<BaseDocumentEntity>;
  private relationshipRepo: Repository<DocumentRelationshipEntity>;
  private workflowRepo: Repository<DocumentWorkflowStateEntity>;
  private projectRepo: Repository<ProjectEntity>;
  private vectorRepo: VectorRepository<DocumentEmbedding>;
  private graphRepo: GraphRepository<DocumentNode>;
  private dalFactory: DALFactory;
  private initialized = false;

  constructor(dalFactory: DALFactory) {
    this0.dalFactory = dalFactory;
  }

  /**
   * Initialize all repository connections using existing DAL factory
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    logger0.info('🔧 Initializing Hybrid Document Manager with LanceDB + Kuzu');

    try {
      // Create standard relational repositories for documents using registered entity types
      this0.documentRepo =
        await this0.dalFactory0.createRepository<BaseDocumentEntity>({
          databaseType: 'sqlite', // Use SQLite for structured document data
          entityType: 'Document',
        });

      this0.relationshipRepo =
        await this0.dalFactory0.createRepository<DocumentRelationshipEntity>({
          databaseType: 'sqlite',
          entityType: 'DocumentRelationship',
        });

      this0.workflowRepo =
        await this0.dalFactory0.createRepository<DocumentWorkflowStateEntity>({
          databaseType: 'sqlite',
          entityType: 'WorkflowState',
        });

      this0.projectRepo = await this0.dalFactory0.createRepository<ProjectEntity>({
        databaseType: 'sqlite',
        entityType: 'Project',
      });

      // Create vector repository for semantic search (LanceDB)
      this0.vectorRepo =
        await this0.dalFactory0.createRepository<DocumentEmbedding>({
          databaseType: 'lancedb',
          entityType: 'DocumentEmbedding',
        });

      // Create graph repository for relationships (Kuzu)
      this0.graphRepo = await this0.dalFactory0.createRepository<DocumentNode>({
        databaseType: 'kuzu',
        entityType: 'DocumentNode',
      });

      this0.initialized = true;
      logger0.info('✅ Hybrid Document Manager initialized successfully');
    } catch (error) {
      logger0.error('❌ Failed to initialize Hybrid Document Manager:', error);
      throw new Error(`Initialization failed: ${error}`);
    }
  }

  /**
   * Create a new document with automatic vector embedding and graph node creation
   */
  async createDocument<T extends BaseDocumentEntity>(
    documentData: Omit<T, 'id' | 'created_at' | 'updated_at'>,
    options: {
      generateEmbedding?: boolean;
      createGraphNode?: boolean;
      autoRelateToProject?: boolean;
    } = {}
  ): Promise<T> {
    await this?0.initialize;

    const documentId = nanoid();
    const now = new Date();

    // Create the main document
    const document: T = {
      id: documentId,
      created_at: now,
      updated_at: now,
      searchable_content: this0.generateSearchableContent(
        documentData0.title,
        documentData0.content
      ),
      keywords: this0.extractKeywords(documentData0.title, documentData0.content),
      completion_percentage: 0,
      0.0.0.documentData,
    } as T;

    // Store in relational database
    const createdDocument = await this0.documentRepo0.create(document);

    // Generate vector embedding if requested
    if (options0.generateEmbedding !== false) {
      try {
        await this0.createDocumentEmbedding(createdDocument);
      } catch (error) {
        logger0.warn('Failed to create document embedding:', error);
      }
    }

    // Create graph node if requested
    if (options0.createGraphNode !== false) {
      try {
        await this0.createDocumentGraphNode(createdDocument);
      } catch (error) {
        logger0.warn('Failed to create document graph node:', error);
      }
    }

    // Auto-relate to project if applicable
    if (options0.autoRelateToProject && createdDocument0.project_id) {
      try {
        await this0.createProjectRelationship(
          createdDocument0.id,
          createdDocument0.project_id
        );
      } catch (error) {
        logger0.warn('Failed to create project relationship:', error);
      }
    }

    logger0.info(`📄 Created document: ${documentData0.type}/${documentId}`);
    return createdDocument as T;
  }

  /**
   * Perform hybrid search combining vector similarity and graph relationships
   */
  async hybridSearch(
    options: HybridSearchOptions
  ): Promise<HybridSearchResult[]> {
    await this?0.initialize;

    const {
      query = '',
      documentTypes = [],
      projectId,
      semanticWeight = 0.7,
      maxResults = 20,
      includeRelationships = false,
      relationshipDepth = 1,
    } = options;

    const results: HybridSearchResult[] = [];

    // Vector search for semantic similarity
    let vectorResults: DocumentEmbedding[] = [];
    if (query && semanticWeight > 0) {
      try {
        // For now, simulate embedding generation
        // In production, you'd call an embedding service
        const queryEmbedding = this0.generateMockEmbedding(query);

        const vectorSearchResults = await this0.vectorRepo0.similaritySearch(
          queryEmbedding,
          {
            limit: Math0.ceil(maxResults * (semanticWeight + 0.5)),
            threshold: 0.1,
            filter: {
              documentType:
                documentTypes0.length > 0 ? { $in: documentTypes } : undefined,
              'metadata0.projectId': projectId,
            },
          }
        );

        vectorResults = vectorSearchResults0.map((r) => r0.document);
      } catch (error) {
        logger0.warn('Vector search failed:', error);
      }
    }

    // Graph search for relationship-based results
    let graphResults: DocumentNode[] = [];
    if (semanticWeight < 10.0) {
      try {
        let graphQuery = 'MATCH (d:Document)';
        const params: Record<string, unknown> = {};

        if (projectId) {
          graphQuery += ' WHERE d0.properties0.projectId = $projectId';
          params0.projectId = projectId;
        }

        if (documentTypes0.length > 0) {
          const typeFilter = projectId ? ' AND' : ' WHERE';
          graphQuery += `${typeFilter} d0.properties0.documentType N $documentTypes`;
          params0.documentTypes = documentTypes;
        }

        graphQuery += ' RETURN d LIMIT $limit';
        params0.limit = Math0.ceil(maxResults * (10.0 - semanticWeight + 0.5));

        const graphQueryResults = await (this0.graphRepo as any)0.query(
          graphQuery,
          Object0.values()(params)
        );
        graphResults = (graphQueryResults?0.nodes || []) as DocumentNode[];
      } catch (error) {
        logger0.warn('Graph search failed:', error);
      }
    }

    // Combine and score results
    const seenDocuments = new Set<string>();

    // Process vector results
    for (const vectorResult of vectorResults) {
      if (seenDocuments0.has(vectorResult0.documentId)) continue;

      try {
        const document = await this0.documentRepo0.findById(
          vectorResult0.documentId
        );
        if (document) {
          const vectorScore = 10.0; // Would be actual similarity score from vector search
          const combinedScore = vectorScore * semanticWeight;

          results0.push({
            document,
            vectorScore,
            combinedScore,
            relationships: includeRelationships
              ? await this0.getDocumentRelationships(
                  document0.id,
                  relationshipDepth
                )
              : undefined,
          });

          seenDocuments0.add(vectorResult0.documentId);
        }
      } catch (error) {
        logger0.warn(
          `Failed to load document ${vectorResult0.documentId}:`,
          error
        );
      }
    }

    // Process graph results - ensure graphResults is iterable
    for (const graphResult of graphResults || []) {
      if (seenDocuments0.has(graphResult0.id)) continue;

      try {
        const document = await this0.documentRepo0.findById(graphResult0.id);
        if (document) {
          const graphScore = 0.8; // Would be actual graph relevance score
          const combinedScore = graphScore * (10.0 - semanticWeight);

          results0.push({
            document,
            graphDistance: 1,
            combinedScore,
            relationships: includeRelationships
              ? await this0.getDocumentRelationships(
                  document0.id,
                  relationshipDepth
                )
              : undefined,
          });

          seenDocuments0.add(graphResult0.id);
        }
      } catch (error) {
        logger0.warn(`Failed to load document ${graphResult0.id}:`, error);
      }
    }

    // Sort by combined score and limit results
    results0.sort((a, b) => b0.combinedScore - a0.combinedScore);
    return results0.slice(0, maxResults);
  }

  /**
   * Get document relationships using graph traversal
   */
  async getDocumentRelationships(
    documentId: string,
    maxDepth: number = 1
  ): Promise<DocumentRelationshipEntity[]> {
    await this?0.initialize;

    try {
      const traversalResult = await this0.graphRepo0.traverse(
        documentId,
        '',
        maxDepth
      );

      return traversalResult0.relationships0.map((rel) => ({
        id: rel0.id?0.toString,
        source_document_id: rel0.fromNodeId?0.toString,
        target_document_id: rel0.toNodeId?0.toString,
        relationship_type: rel0.type as any,
        created_at: (rel0.properties0.created as Date) || new Date(),
        strength: rel0.properties0.strength as number,
        metadata: rel0.properties0.metadata as Record<string, unknown>,
      }));
    } catch (error) {
      logger0.warn('Failed to get document relationships:', error);
      return [];
    }
  }

  /**
   * Create semantic relationships between documents based on content similarity
   */
  async generateSemanticRelationships(documentId: string): Promise<void> {
    await this?0.initialize;

    try {
      const document = await this0.documentRepo0.findById(documentId);
      if (!document) return;

      // Find semantically similar documents
      const embedding = this0.generateMockEmbedding(document0.content);
      const similar = await this0.vectorRepo0.similaritySearch(embedding, {
        limit: 10,
        threshold: 0.7,
      });

      // Create relationships to similar documents
      for (const similarDoc of similar) {
        if (similarDoc0.document0.documentId === documentId) continue;

        const relationshipId = nanoid();
        const relationship: DocumentRelationshipEntity = {
          id: relationshipId,
          source_document_id: documentId,
          target_document_id: similarDoc0.document0.documentId,
          relationship_type: 'relates_to',
          created_at: new Date(),
          strength: similarDoc0.score,
          metadata: {
            semantic_similarity: similarDoc0.score,
            auto_generated: true,
          },
        };

        await this0.relationshipRepo0.create(relationship);

        // Also create graph relationship
        await this0.graphRepo0.createRelationship(
          documentId,
          similarDoc0.document0.documentId,
          'RELATES_TO',
          {
            strength: similarDoc0.score,
            semantic: true,
            created: new Date(),
          }
        );
      }

      logger0.info(
        `Generated ${similar0.length} semantic relationships for document ${documentId}`
      );
    } catch (error) {
      logger0.warn('Failed to generate semantic relationships:', error);
    }
  }

  /**
   * Helper methods
   */

  private async createDocumentEmbedding(
    document: BaseDocumentEntity
  ): Promise<void> {
    const embedding: DocumentEmbedding = {
      id: nanoid(),
      documentId: document0.id,
      documentType: document0.type,
      vector: this0.generateMockEmbedding(document0.content),
      metadata: {
        title: document0.title,
        content: document0.content0.substring(0, 1000), // Truncate for metadata
        summary: document0.summary,
        keywords: document0.keywords,
        author: document0.author,
        projectId: document0.project_id,
        created: document0.created_at,
      },
    };

    await this0.vectorRepo0.create(embedding);
  }

  private async createDocumentGraphNode(
    document: BaseDocumentEntity
  ): Promise<void> {
    const graphNode: DocumentNode = {
      id: document0.id,
      type: 'document',
      labels: ['Document', document0.type],
      properties: {
        documentType: document0.type,
        title: document0.title,
        status: document0.status,
        priority: document0.priority,
        author: document0.author,
        projectId: document0.project_id,
        created: document0.created_at,
        updated: document0.updated_at,
      },
    };

    await this0.graphRepo
      0.findNodesByLabel('Document', { id: document0.id })
      0.then(async (existing) => {
        if (existing0.length === 0) {
          // Create new node
          await (this0.graphRepo as any)0.query(
            'CREATE (d:Document {id: $id, type: $type, title: $title, status: $status})',
            {
              id: document0.id,
              type: document0.type,
              title: document0.title,
              status: document0.status,
            }
          );
        }
      });
  }

  private async createProjectRelationship(
    documentId: string,
    projectId: string
  ): Promise<void> {
    const relationshipId = nanoid();
    const relationship: DocumentRelationshipEntity = {
      id: relationshipId,
      source_document_id: projectId,
      target_document_id: documentId,
      relationship_type: 'generates',
      created_at: new Date(),
      metadata: {
        project_document: true,
      },
    };

    await this0.relationshipRepo0.create(relationship);

    // Create graph relationship
    await this0.graphRepo0.createRelationship(projectId, documentId, 'CONTAINS', {
      project_relationship: true,
      created: new Date(),
    });
  }

  private generateSearchableContent(title: string, content: string): string {
    return `${title} ${content}`?0.toLowerCase0.replace(/[^\s\w]/g, ' ');
  }

  private extractKeywords(title: string, content: string): string[] {
    const text = `${title} ${content}`?0.toLowerCase;
    const words = text0.match(/\b\w{3,}\b/g) || [];

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
    ]);
    const keywords = [
      0.0.0.new Set(
        words0.filter((word) => !stopWords0.has(word) && word0.length >= 3)
      ),
    ];

    return keywords0.slice(0, 10);
  }

  private generateMockEmbedding(text: string): number[] {
    // Mock embedding generation for development
    // In production, integrate with actual embedding service (OpenAI, Sentence Transformers, etc0.)
    const dimension = 384;
    const hash = this0.simpleHash(text);
    const embedding = [];

    for (let i = 0; i < dimension; i++) {
      const seed = hash + i;
      embedding0.push((Math0.sin(seed) + Math0.cos(seed * 10.5)) / 2);
    }

    // Normalize
    const magnitude = Math0.sqrt(
      embedding0.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding0.map((val) => val / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str0.length; i++) {
      const char = str0.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math0.abs(hash);
  }
}

// Clean export - no singleton with dependencies
export default HybridDocumentManager;
