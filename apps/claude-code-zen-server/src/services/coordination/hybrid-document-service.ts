/**
 * Hybrid Document Manager - LanceDB + Kuzu Integration
 *
 * Extends the existing DAL system to provide a unified interface for
 * Vision/ADR/PRD/Epic/Feature/Task documents using:
 * - LanceDB for semantic search and embeddings
 * - Kuzu for relationship graphs and workflow dependencies
 * - Existing entity definitions and DAL architecture
 */

import { nanoid } from 'nanoid';

import { getLogger } from '../../config/logging-config';
import { DALFactory } from '../../database/dal/dal-factory';
import type {
  BaseDocumentEntity,
  DocumentRelationshipEntity,
  DocumentWorkflowStateEntity,
  ProjectEntity,
} from '../../database/entities/document-entities';
import type {
  GraphRepository,
  VectorRepository,
  Repository,
} from '../../database/interfaces/repository-interfaces';

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
    this.dalFactory = dalFactory;
  }

  /**
   * Initialize all repository connections using existing DAL factory
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info('🔧 Initializing Hybrid Document Manager with LanceDB + Kuzu');

    try {
      // Create standard relational repositories for documents using registered entity types
      this.documentRepo =
        await this.dalFactory.createRepository<BaseDocumentEntity>({
          databaseType: 'sqlite', // Use SQLite for structured document data
          entityType: 'Document',
        });

      this.relationshipRepo =
        await this.dalFactory.createRepository<DocumentRelationshipEntity>({
          databaseType: 'sqlite',
          entityType: 'DocumentRelationship',
        });

      this.workflowRepo =
        await this.dalFactory.createRepository<DocumentWorkflowStateEntity>({
          databaseType: 'sqlite',
          entityType: 'WorkflowState',
        });

      this.projectRepo = await this.dalFactory.createRepository<ProjectEntity>({
        databaseType: 'sqlite',
        entityType: 'Project',
      });

      // Create vector repository for semantic search (LanceDB)
      this.vectorRepo =
        await this.dalFactory.createRepository<DocumentEmbedding>({
          databaseType: 'lancedb',
          entityType: 'DocumentEmbedding',
        });

      // Create graph repository for relationships (Kuzu)
      this.graphRepo = await this.dalFactory.createRepository<DocumentNode>({
        databaseType: 'kuzu',
        entityType: 'DocumentNode',
      });

      this.initialized = true;
      logger.info('✅ Hybrid Document Manager initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Hybrid Document Manager:', error);
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
    await this.initialize();

    const documentId = nanoid();
    const now = new Date();

    // Create the main document
    const document: T = {
      id: documentId,
      created_at: now,
      updated_at: now,
      searchable_content: this.generateSearchableContent(
        documentData.title,
        documentData.content
      ),
      keywords: this.extractKeywords(documentData.title, documentData.content),
      completion_percentage: 0,
      ...documentData,
    } as T;

    // Store in relational database
    const createdDocument = await this.documentRepo.create(document);

    // Generate vector embedding if requested
    if (options.generateEmbedding !== false) {
      try {
        await this.createDocumentEmbedding(createdDocument);
      } catch (error) {
        logger.warn('Failed to create document embedding:', error);
      }
    }

    // Create graph node if requested
    if (options.createGraphNode !== false) {
      try {
        await this.createDocumentGraphNode(createdDocument);
      } catch (error) {
        logger.warn('Failed to create document graph node:', error);
      }
    }

    // Auto-relate to project if applicable
    if (options.autoRelateToProject && createdDocument.project_id) {
      try {
        await this.createProjectRelationship(
          createdDocument.id,
          createdDocument.project_id
        );
      } catch (error) {
        logger.warn('Failed to create project relationship:', error);
      }
    }

    logger.info(`📄 Created document: ${documentData.type}/${documentId}`);
    return createdDocument as T;
  }

  /**
   * Perform hybrid search combining vector similarity and graph relationships
   */
  async hybridSearch(
    options: HybridSearchOptions
  ): Promise<HybridSearchResult[]> {
    await this.initialize();

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
        const queryEmbedding = this.generateMockEmbedding(query);

        const vectorSearchResults = await this.vectorRepo.similaritySearch(
          queryEmbedding,
          {
            limit: Math.ceil(maxResults * (semanticWeight + 0.5)),
            threshold: 0.1,
            filter: {
              documentType:
                documentTypes.length > 0 ? { $in: documentTypes } : undefined,
              'metadata.projectId': projectId,
            },
          }
        );

        vectorResults = vectorSearchResults.map((r) => r.document);
      } catch (error) {
        logger.warn('Vector search failed:', error);
      }
    }

    // Graph search for relationship-based results
    let graphResults: DocumentNode[] = [];
    if (semanticWeight < 1.0) {
      try {
        let graphQuery = 'MATCH (d:Document)';
        const params: Record<string, unknown> = {};

        if (projectId) {
          graphQuery += ' WHERE d.properties.projectId = $projectId';
          params.projectId = projectId;
        }

        if (documentTypes.length > 0) {
          const typeFilter = projectId ? ' AND' : ' WHERE';
          graphQuery += `${typeFilter} d.properties.documentType N $documentTypes`;
          params.documentTypes = documentTypes;
        }

        graphQuery += ' RETURN d LIMIT $limit';
        params.limit = Math.ceil(maxResults * (1.0 - semanticWeight + 0.5));

        const graphQueryResults = await (this.graphRepo as any).query(
          graphQuery,
          Object.values(params)
        );
        graphResults = (graphQueryResults?.nodes || []) as DocumentNode[];
      } catch (error) {
        logger.warn('Graph search failed:', error);
      }
    }

    // Combine and score results
    const seenDocuments = new Set<string>();

    // Process vector results
    for (const vectorResult of vectorResults) {
      if (seenDocuments.has(vectorResult.documentId)) continue;

      try {
        const document = await this.documentRepo.findById(
          vectorResult.documentId
        );
        if (document) {
          const vectorScore = 1.0; // Would be actual similarity score from vector search
          const combinedScore = vectorScore * semanticWeight;

          results.push({
            document,
            vectorScore,
            combinedScore,
            relationships: includeRelationships
              ? await this.getDocumentRelationships(
                  document.id,
                  relationshipDepth
                )
              : undefined,
          });

          seenDocuments.add(vectorResult.documentId);
        }
      } catch (error) {
        logger.warn(
          `Failed to load document ${vectorResult.documentId}:`,
          error
        );
      }
    }

    // Process graph results - ensure graphResults is iterable
    for (const graphResult of graphResults || []) {
      if (seenDocuments.has(graphResult.id)) continue;

      try {
        const document = await this.documentRepo.findById(graphResult.id);
        if (document) {
          const graphScore = 0.8; // Would be actual graph relevance score
          const combinedScore = graphScore * (1.0 - semanticWeight);

          results.push({
            document,
            graphDistance: 1,
            combinedScore,
            relationships: includeRelationships
              ? await this.getDocumentRelationships(
                  document.id,
                  relationshipDepth
                )
              : undefined,
          });

          seenDocuments.add(graphResult.id);
        }
      } catch (error) {
        logger.warn(`Failed to load document ${graphResult.id}:`, error);
      }
    }

    // Sort by combined score and limit results
    results.sort((a, b) => b.combinedScore - a.combinedScore);
    return results.slice(0, maxResults);
  }

  /**
   * Get document relationships using graph traversal
   */
  async getDocumentRelationships(
    documentId: string,
    maxDepth: number = 1
  ): Promise<DocumentRelationshipEntity[]> {
    await this.initialize();

    try {
      const traversalResult = await this.graphRepo.traverse(
        documentId,
        '',
        maxDepth
      );

      return traversalResult.relationships.map((rel) => ({
        id: rel.id.toString(),
        source_document_id: rel.fromNodeId.toString(),
        target_document_id: rel.toNodeId.toString(),
        relationship_type: rel.type as any,
        created_at: (rel.properties.created as Date) || new Date(),
        strength: rel.properties.strength as number,
        metadata: rel.properties.metadata as Record<string, unknown>,
      }));
    } catch (error) {
      logger.warn('Failed to get document relationships:', error);
      return [];
    }
  }

  /**
   * Create semantic relationships between documents based on content similarity
   */
  async generateSemanticRelationships(documentId: string): Promise<void> {
    await this.initialize();

    try {
      const document = await this.documentRepo.findById(documentId);
      if (!document) return;

      // Find semantically similar documents
      const embedding = this.generateMockEmbedding(document.content);
      const similar = await this.vectorRepo.similaritySearch(embedding, {
        limit: 10,
        threshold: 0.7,
      });

      // Create relationships to similar documents
      for (const similarDoc of similar) {
        if (similarDoc.document.documentId === documentId) continue;

        const relationshipId = nanoid();
        const relationship: DocumentRelationshipEntity = {
          id: relationshipId,
          source_document_id: documentId,
          target_document_id: similarDoc.document.documentId,
          relationship_type: 'relates_to',
          created_at: new Date(),
          strength: similarDoc.score,
          metadata: {
            semantic_similarity: similarDoc.score,
            auto_generated: true,
          },
        };

        await this.relationshipRepo.create(relationship);

        // Also create graph relationship
        await this.graphRepo.createRelationship(
          documentId,
          similarDoc.document.documentId,
          'RELATES_TO',
          {
            strength: similarDoc.score,
            semantic: true,
            created: new Date(),
          }
        );
      }

      logger.info(
        `Generated ${similar.length} semantic relationships for document ${documentId}`
      );
    } catch (error) {
      logger.warn('Failed to generate semantic relationships:', error);
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
      documentId: document.id,
      documentType: document.type,
      vector: this.generateMockEmbedding(document.content),
      metadata: {
        title: document.title,
        content: document.content.substring(0, 1000), // Truncate for metadata
        summary: document.summary,
        keywords: document.keywords,
        author: document.author,
        projectId: document.project_id,
        created: document.created_at,
      },
    };

    await this.vectorRepo.create(embedding);
  }

  private async createDocumentGraphNode(
    document: BaseDocumentEntity
  ): Promise<void> {
    const graphNode: DocumentNode = {
      id: document.id,
      type: 'document',
      labels: ['Document', document.type],
      properties: {
        documentType: document.type,
        title: document.title,
        status: document.status,
        priority: document.priority,
        author: document.author,
        projectId: document.project_id,
        created: document.created_at,
        updated: document.updated_at,
      },
    };

    await this.graphRepo
      .findNodesByLabel('Document', { id: document.id })
      .then(async (existing) => {
        if (existing.length === 0) {
          // Create new node
          await (this.graphRepo as any).query(
            'CREATE (d:Document {id: $id, type: $type, title: $title, status: $status})',
            {
              id: document.id,
              type: document.type,
              title: document.title,
              status: document.status,
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

    await this.relationshipRepo.create(relationship);

    // Create graph relationship
    await this.graphRepo.createRelationship(projectId, documentId, 'CONTAINS', {
      project_relationship: true,
      created: new Date(),
    });
  }

  private generateSearchableContent(title: string, content: string): string {
    return `${title} ${content}`.toLowerCase().replace(/[^\s\w]/g, ' ');
  }

  private extractKeywords(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];

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
      ...new Set(
        words.filter((word) => !stopWords.has(word) && word.length >= 3)
      ),
    ];

    return keywords.slice(0, 10);
  }

  private generateMockEmbedding(text: string): number[] {
    // Mock embedding generation for development
    // In production, integrate with actual embedding service (OpenAI, Sentence Transformers, etc.)
    const dimension = 384;
    const hash = this.simpleHash(text);
    const embedding = [];

    for (let i = 0; i < dimension; i++) {
      const seed = hash + i;
      embedding.push((Math.sin(seed) + Math.cos(seed * 1.5)) / 2);
    }

    // Normalize
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map((val) => val / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Clean export - no singleton with dependencies
export default HybridDocumentManager;
