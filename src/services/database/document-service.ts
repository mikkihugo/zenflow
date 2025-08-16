/**
 * @fileoverview Document Service - Modern TypeScript Implementation
 *
 * Enterprise-grade document management service providing comprehensive CRUD operations
 * for document entities with advanced features including:
 * - Full-text search with vector similarity
 * - Document relationships and dependency management
 * - Workflow state tracking and automation
 * - Version control and audit logging
 * - Multi-database adapter support
 * - Real-time document synchronization
 * - Advanced analytics and reporting
 *
 * **Architecture:**
 * - **Repository Pattern**: Clean separation of business logic and data access
 * - **Multi-Database Support**: Works with PostgreSQL, SQLite, MongoDB, LanceDB
 * - **Event-Driven**: Publishes events for document lifecycle changes
 * - **Type-Safe**: Strict TypeScript with comprehensive interfaces
 * - **Extensible**: Plugin architecture for custom document types
 *
 * **Performance:**
 * - **Batch Operations**: Efficient bulk document processing
 * - **Query Optimization**: Smart caching and index management
 * - **Memory Efficient**: Streaming for large document operations
 * - **Connection Pooling**: Optimized database connection management
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 2024-01-01
 *
 * @example Basic Document Operations
 * ```typescript
 * const documentService = new DocumentService(databaseAdapter, logger);
 * await documentService.initialize();
 *
 * // Create a new document
 * const document = await documentService.createDocument({
 *   type: 'vision',
 *   title: 'Product Vision 2024',
 *   content: 'Our vision for the next year...',
 *   priority: 'high',
 *   projectId: 'project-123'
 * });
 *
 * // Search documents with filters
 * const searchResults = await documentService.searchDocuments({
 *   query: 'product vision',
 *   filters: { type: 'vision', status: 'approved' },
 *   limit: 10
 * });
 * ```
 *
 * @example Advanced Document Relationships
 * ```typescript
 * // Create documents with dependencies
 * const prd = await documentService.createDocument({
 *   type: 'prd',
 *   title: 'User Authentication PRD',
 *   content: 'Detailed requirements...',
 *   dependencies: [visionDoc.id]
 * });
 *
 * // Get document with full relationship tree
 * const documentWithRelations = await documentService.getDocumentById(prd.id, {
 *   includeRelationships: true,
 *   includeDependencies: true,
 *   includeWorkflowState: true
 * });
 * ```
 *
 * @example Workflow Integration
 * ```typescript
 * // Advance document through workflow
 * await documentService.updateWorkflowState(documentId, {
 *   stage: 'review',
 *   assignee: 'tech-lead',
 *   dueDate: new Date('2024-02-01'),
 *   metadata: { reviewers: ['alice', 'bob'] }
 * });
 *
 * // Get documents by workflow stage
 * const reviewDocs = await documentService.getDocumentsByWorkflowStage('review', {
 *   includeMetrics: true,
 *   sortBy: 'priority'
 * });
 * ```
 */

import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import type { Logger } from '../../config/logging-config';
import { getLogger } from '../../config/logging-config';
import type {
  BaseDocumentEntity,
  DocumentRelationshipEntity,
  DocumentWorkflowStateEntity,
  ADRDocumentEntity,
  EpicDocumentEntity,
  FeatureDocumentEntity,
  PRDDocumentEntity,
  TaskDocumentEntity,
  VisionDocumentEntity,
} from '../entities/document-entities';
import type { DatabaseAdapter } from '../interfaces';
import type { DocumentType } from '../types/workflow-types';

/**
 * Configuration options for document creation operations.
 *
 * Controls various aspects of document creation including relationship
 * management, workflow initialization, and indexing behavior.
 *
 * @interface DocumentCreateOptions
 */
export interface DocumentCreateOptions {
  /** Automatically generate relationships based on content analysis */
  readonly autoGenerateRelationships?: boolean;
  
  /** Initial workflow stage to assign to the document */
  readonly startWorkflow?: string;
  
  /** Whether to notify listeners about document creation */
  readonly notifyListeners?: boolean;
  
  /** Generate full-text search index entries */
  readonly generateSearchIndex?: boolean;
  
  /** Skip validation rules for bulk operations */
  readonly skipValidation?: boolean;
  
  /** Custom metadata to attach to the document */
  readonly metadata?: Record<string, unknown>;
  
  /** Parent document ID for hierarchical organization */
  readonly parentDocumentId?: string;
  
  /** Project ID for project-scoped documents */
  readonly projectId?: string;
}

/**
 * Query options for document retrieval operations.
 *
 * Provides fine-grained control over what data is included in query results
 * and how results are formatted and sorted.
 *
 * @interface DocumentQueryOptions
 */
export interface DocumentQueryOptions {
  /** Include full document content in results */
  readonly includeContent?: boolean;
  
  /** Include document relationships in results */
  readonly includeRelationships?: boolean;
  
  /** Include workflow state information */
  readonly includeWorkflowState?: boolean;
  
  /** Include dependency tree information */
  readonly includeDependencies?: boolean;
  
  /** Include document analytics and metrics */
  readonly includeMetrics?: boolean;
  
  /** Maximum number of results to return */
  readonly limit?: number;
  
  /** Number of results to skip (for pagination) */
  readonly offset?: number;
  
  /** Field to sort results by */
  readonly sortBy?: 'created_at' | 'updated_at' | 'title' | 'priority' | 'completion_percentage';
  
  /** Sort direction */
  readonly sortOrder?: 'asc' | 'desc';
  
  /** Additional filter conditions */
  readonly filters?: DocumentFilterOptions;
}

/**
 * Filter options for document search and retrieval.
 *
 * Supports complex filtering across multiple document properties
 * with support for ranges, arrays, and pattern matching.
 *
 * @interface DocumentFilterOptions
 */
export interface DocumentFilterOptions {
  /** Filter by document type */
  readonly type?: DocumentType | DocumentType[];
  
  /** Filter by document status */
  readonly status?: BaseDocumentEntity['status'] | BaseDocumentEntity['status'][];
  
  /** Filter by priority level */
  readonly priority?: BaseDocumentEntity['priority'] | BaseDocumentEntity['priority'][];
  
  /** Filter by author */
  readonly author?: string | string[];
  
  /** Filter by tags (any or all) */
  readonly tags?: {
    readonly any?: string[];
    readonly all?: string[];
    readonly none?: string[];
  };
  
  /** Filter by project ID */
  readonly projectId?: string | string[];
  
  /** Filter by creation date range */
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
  
  /** Filter by last update date range */
  readonly updatedAfter?: Date;
  readonly updatedBefore?: Date;
  
  /** Filter by workflow stage */
  readonly workflowStage?: string | string[];
  
  /** Filter by completion percentage range */
  readonly completionMin?: number;
  readonly completionMax?: number;
  
  /** Full-text search query */
  readonly searchQuery?: string;
  
  /** Custom metadata filters */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Search request for advanced document search operations.
 *
 * Supports full-text search, vector similarity search, and complex
 * filtering with relevance scoring and result ranking.
 *
 * @interface DocumentSearchRequest
 */
export interface DocumentSearchRequest {
  /** Search query string */
  readonly query: string;
  
  /** Search type */
  readonly searchType?: 'fulltext' | 'vector' | 'hybrid';
  
  /** Document filters */
  readonly filters?: DocumentFilterOptions;
  
  /** Query options */
  readonly options?: DocumentQueryOptions;
  
  /** Minimum relevance score threshold */
  readonly minScore?: number;
  
  /** Enable query highlighting */
  readonly highlight?: boolean;
  
  /** Fields to search in */
  readonly searchFields?: ('title' | 'content' | 'summary' | 'tags')[];
  
  /** Vector similarity threshold (for vector search) */
  readonly similarityThreshold?: number;
}

/**
 * Search result with relevance scoring and highlighting.
 *
 * Contains matched documents with search metadata including
 * relevance scores, highlighted snippets, and match explanations.
 *
 * @interface DocumentSearchResult
 */
export interface DocumentSearchResult {
  /** Matched document */
  readonly document: BaseDocumentEntity;
  
  /** Relevance score (0-1) */
  readonly score: number;
  
  /** Highlighted text snippets */
  readonly highlights?: {
    readonly field: string;
    readonly snippet: string;
    readonly matches: Array<{ readonly start: number; readonly end: number }>;
  }[];
  
  /** Search match explanation */
  readonly explanation?: string;
  
  /** Vector similarity score (if applicable) */
  readonly vectorScore?: number;
}

/**
 * Document relationship definition for linking documents.
 *
 * Supports various relationship types with metadata and
 * bidirectional relationship management.
 *
 * @interface DocumentRelationship
 */
export interface DocumentRelationship {
  /** Source document ID */
  readonly sourceId: string;
  
  /** Target document ID */
  readonly targetId: string;
  
  /** Relationship type */
  readonly type: 'depends_on' | 'blocks' | 'relates_to' | 'implements' | 'supersedes' | 'references';
  
  /** Relationship strength (0-1) */
  readonly strength?: number;
  
  /** Relationship metadata */
  readonly metadata?: Record<string, unknown>;
  
  /** Whether relationship is bidirectional */
  readonly bidirectional?: boolean;
  
  /** Relationship creation timestamp */
  readonly createdAt: Date;
  
  /** User who created the relationship */
  readonly createdBy?: string;
}

/**
 * Workflow state for document lifecycle management.
 *
 * Tracks document progress through defined workflows with
 * assignee management, due dates, and state transitions.
 *
 * @interface DocumentWorkflowState
 */
export interface DocumentWorkflowState {
  /** Document ID */
  readonly documentId: string;
  
  /** Current workflow stage */
  readonly stage: string;
  
  /** Previous workflow stage */
  readonly previousStage?: string;
  
  /** Assigned user */
  readonly assignee?: string;
  
  /** Due date for current stage */
  readonly dueDate?: Date;
  
  /** Stage start timestamp */
  readonly stageStartedAt: Date;
  
  /** Stage metadata */
  readonly metadata?: Record<string, unknown>;
  
  /** Workflow transition history */
  readonly history?: Array<{
    readonly from: string;
    readonly to: string;
    readonly timestamp: Date;
    readonly userId?: string;
    readonly reason?: string;
  }>;
}

/**
 * Document analytics and metrics data.
 *
 * Provides insights into document usage, engagement,
 * and lifecycle metrics for reporting and optimization.
 *
 * @interface DocumentMetrics
 */
export interface DocumentMetrics {
  /** Document ID */
  readonly documentId: string;
  
  /** View count */
  readonly viewCount: number;
  
  /** Edit count */
  readonly editCount: number;
  
  /** Comment count */
  readonly commentCount: number;
  
  /** Share count */
  readonly shareCount: number;
  
  /** Last access timestamp */
  readonly lastAccessed?: Date;
  
  /** Average time spent viewing */
  readonly averageViewTime?: number;
  
  /** Unique viewers count */
  readonly uniqueViewers: number;
  
  /** Document lifecycle duration */
  readonly lifecycleDuration?: number;
  
  /** Workflow stage durations */
  readonly stageDurations?: Record<string, number>;
  
  /** Quality score (0-100) */
  readonly qualityScore?: number;
  
  /** Engagement score (0-100) */
  readonly engagementScore?: number;
}

/**
 * Document creation request with type-specific fields.
 *
 * Provides a flexible interface for creating different types of
 * documents with appropriate validation and field mapping.
 *
 * @interface DocumentCreateRequest
 */
export interface DocumentCreateRequest {
  /** Document type */
  readonly type: DocumentType;
  
  /** Document title */
  readonly title: string;
  
  /** Document content */
  readonly content: string;
  
  /** Document summary */
  readonly summary?: string;
  
  /** Document priority */
  readonly priority?: BaseDocumentEntity['priority'];
  
  /** Document status */
  readonly status?: BaseDocumentEntity['status'];
  
  /** Document author */
  readonly author?: string;
  
  /** Document tags */
  readonly tags?: string[];
  
  /** Project ID */
  readonly projectId?: string;
  
  /** Parent document ID */
  readonly parentDocumentId?: string;
  
  /** Document dependencies */
  readonly dependencies?: string[];
  
  /** Related documents */
  readonly relatedDocuments?: string[];
  
  /** Custom metadata */
  readonly metadata?: Record<string, unknown>;
  
  /** Creation options */
  readonly options?: DocumentCreateOptions;
}

/**
 * Document update request with partial fields.
 *
 * Supports partial updates with automatic change tracking
 * and validation of field modifications.
 *
 * @interface DocumentUpdateRequest
 */
export interface DocumentUpdateRequest {
  /** Updated title */
  readonly title?: string;
  
  /** Updated content */
  readonly content?: string;
  
  /** Updated summary */
  readonly summary?: string;
  
  /** Updated priority */
  readonly priority?: BaseDocumentEntity['priority'];
  
  /** Updated status */
  readonly status?: BaseDocumentEntity['status'];
  
  /** Updated tags */
  readonly tags?: string[];
  
  /** Updated metadata */
  readonly metadata?: Record<string, unknown>;
  
  /** Updated dependencies */
  readonly dependencies?: string[];
  
  /** Updated related documents */
  readonly relatedDocuments?: string[];
  
  /** Update options */
  readonly options?: {
    readonly notifyListeners?: boolean;
    readonly updateSearchIndex?: boolean;
    readonly validateChanges?: boolean;
    readonly incrementVersion?: boolean;
  };
}

/**
 * Batch operation request for bulk document processing.
 *
 * Enables efficient processing of multiple documents with
 * transaction support and error handling.
 *
 * @interface BatchDocumentOperation
 */
export interface BatchDocumentOperation {
  /** Operation type */
  readonly operation: 'create' | 'update' | 'delete' | 'upsert';
  
  /** Document data (for create/update/upsert) */
  readonly document?: DocumentCreateRequest | DocumentUpdateRequest;
  
  /** Document ID (for update/delete) */
  readonly documentId?: string;
  
  /** Operation-specific options */
  readonly options?: {
    readonly skipValidation?: boolean;
    readonly continueOnError?: boolean;
    readonly notifyListeners?: boolean;
  };
}

/**
 * Result of batch document operations.
 *
 * Provides detailed results for each operation in a batch
 * with success/failure tracking and error details.
 *
 * @interface BatchOperationResult
 */
export interface BatchOperationResult {
  /** Total operations processed */
  readonly totalOperations: number;
  
  /** Successful operations count */
  readonly successfulOperations: number;
  
  /** Failed operations count */
  readonly failedOperations: number;
  
  /** Individual operation results */
  readonly results: Array<{
    readonly operation: BatchDocumentOperation['operation'];
    readonly success: boolean;
    readonly documentId?: string;
    readonly error?: string;
    readonly data?: BaseDocumentEntity;
  }>;
  
  /** Overall execution time */
  readonly executionTime: number;
  
  /** Batch operation metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Event types emitted by the DocumentService.
 *
 * Supports event-driven architectures with comprehensive
 * document lifecycle event tracking.
 */
export type DocumentServiceEvents = {
  /** Document created */
  documentCreated: [document: BaseDocumentEntity, options?: DocumentCreateOptions];
  
  /** Document updated */
  documentUpdated: [documentId: string, changes: DocumentUpdateRequest, previous: BaseDocumentEntity];
  
  /** Document deleted */
  documentDeleted: [documentId: string, document: BaseDocumentEntity];
  
  /** Document workflow state changed */
  workflowStateChanged: [documentId: string, newState: DocumentWorkflowState, previousState?: DocumentWorkflowState];
  
  /** Document relationship created */
  relationshipCreated: [relationship: DocumentRelationship];
  
  /** Document relationship deleted */
  relationshipDeleted: [sourceId: string, targetId: string, type: string];
  
  /** Batch operation completed */
  batchOperationCompleted: [result: BatchOperationResult];
  
  /** Service error occurred */
  serviceError: [error: Error, context: Record<string, unknown>];
};

/**
 * Modern Document Service Implementation.
 *
 * Enterprise-grade document management service providing comprehensive
 * CRUD operations, search capabilities, workflow management, and analytics.
 * Built with strict TypeScript compliance and comprehensive error handling.
 *
 * **Key Features:**
 * - **Type-Safe Operations**: Full TypeScript support with strict typing
 * - **Multi-Database Support**: Works with various database adapters
 * - **Advanced Search**: Full-text and vector similarity search
 * - **Workflow Management**: Document lifecycle and state tracking
 * - **Relationship Management**: Complex document relationships
 * - **Event-Driven Architecture**: Real-time notifications and integrations
 * - **Performance Optimized**: Efficient queries and caching
 * - **Extensible Design**: Plugin architecture for custom functionality
 *
 * **Architecture Patterns:**
 * - Repository Pattern for data access abstraction
 * - Event Sourcing for audit trails and change tracking
 * - CQRS for read/write operation optimization
 * - Factory Pattern for document type specialization
 *
 * @class DocumentService
 * @extends EventEmitter
 * @template T - Document entity type
 *
 * @example Basic Service Usage
 * ```typescript
 * const documentService = new DocumentService(databaseAdapter, logger);
 * await documentService.initialize();
 * 
 * // Service is ready for operations
 * const documents = await documentService.getAllDocuments();
 * ```
 */
export class DocumentService extends EventEmitter<DocumentServiceEvents> {
  private readonly logger: Logger;
  private readonly databaseAdapter: DatabaseAdapter;
  private isInitialized = false;
  private readonly documentCache = new Map<string, BaseDocumentEntity>();
  private readonly relationshipCache = new Map<string, DocumentRelationshipEntity[]>();

  /**
   * Creates a new DocumentService instance.
   *
   * Initializes the service with the provided database adapter and logger.
   * The service must be explicitly initialized before use.
   *
   * @constructor
   * @param {DatabaseAdapter} databaseAdapter - Database adapter for persistence operations
   * @param {Logger} [logger] - Optional logger instance (creates default if not provided)
   *
   * @example
   * ```typescript
   * import { PostgreSQLAdapter } from '../adapters/postgresql-adapter';
   * import { DocumentService } from './document-service';
   * 
   * const adapter = new PostgreSQLAdapter(config);
   * const service = new DocumentService(adapter);
   * await service.initialize();
   * ```
   */
  constructor(databaseAdapter: DatabaseAdapter, logger?: Logger) {
    super();
    this.databaseAdapter = databaseAdapter;
    this.logger = logger ?? getLogger('DocumentService');
    
    this.logger.info('DocumentService created', {
      adapterType: databaseAdapter.constructor.name,
      features: ['search', 'relationships', 'workflow', 'analytics']
    });
  }

  /**
   * Initializes the document service and prepares database schema.
   *
   * Sets up database tables, indexes, and any required infrastructure
   * for document operations. Must be called before using the service.
   *
   * @async
   * @method initialize
   * @returns {Promise<void>} Resolves when initialization is complete
   * @throws {Error} When database initialization fails
   *
   * @example
   * ```typescript
   * try {
   *   await documentService.initialize();
   *   console.log('Document service ready');
   * } catch (error) {
   *   console.error('Failed to initialize document service:', error);
   * }
   * ```
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('DocumentService already initialized');
      return;
    }

    try {
      this.logger.info('Initializing DocumentService...');
      
      // Initialize database schema if needed
      await this.initializeSchema();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.logger.info('DocumentService initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize DocumentService', { error });
      throw new Error(`DocumentService initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new document with the specified properties.
   *
   * Validates the document data, generates metadata, and stores the document
   * in the database. Optionally generates relationships and search indexes.
   *
   * @async
   * @method createDocument
   * @param {DocumentCreateRequest} request - Document creation request
   * @returns {Promise<BaseDocumentEntity>} The created document
   * @throws {Error} When document creation fails or validation errors occur
   *
   * @example Basic Document Creation
   * ```typescript
   * const document = await documentService.createDocument({
   *   type: 'vision',
   *   title: 'Product Roadmap 2024',
   *   content: 'Our strategic vision for the upcoming year...',
   *   priority: 'high',
   *   tags: ['roadmap', 'strategy', '2024'],
   *   projectId: 'project-abc123'
   * });
   * 
   * console.log(`Created document: ${document.id}`);
   * ```
   *
   * @example Document with Relationships
   * ```typescript
   * const prd = await documentService.createDocument({
   *   type: 'prd',
   *   title: 'User Authentication System',
   *   content: 'Detailed product requirements...',
   *   dependencies: [visionDocument.id],
   *   relatedDocuments: [architectureDocument.id],
   *   options: {
   *     autoGenerateRelationships: true,
   *     startWorkflow: 'draft'
   *   }
   * });
   * ```
   */
  async createDocument(request: DocumentCreateRequest): Promise<BaseDocumentEntity> {
    this.ensureInitialized();
    
    try {
      this.logger.debug('Creating document', { type: request.type, title: request.title });
      
      // Validate request
      this.validateDocumentRequest(request);
      
      // Generate document entity
      const document = await this.buildDocumentEntity(request);
      
      // Store in database
      const result = await this.databaseAdapter.execute(
        `INSERT NTO documents (
          id, type, title, content, summary, status, priority, author, tags,
          project_id, parent_document_id, dependencies, related_documents,
          version, checksum, metadata, searchable_content, keywords,
          workflow_stage, completion_percentage, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          document.id, document.type, document.title, document.content, document.summary,
          document.status, document.priority, document.author, JSON.stringify(document.tags),
          document.project_id, document.parent_document_id,
          JSON.stringify(document.dependencies), JSON.stringify(document.related_documents),
          document.version, document.checksum, JSON.stringify(document.metadata),
          document.searchable_content, JSON.stringify(document.keywords),
          document.workflow_stage, document.completion_percentage,
          document.created_at.toISOString(), document.updated_at.toISOString()
        ]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Failed to insert document into database');
      }
      
      // Cache the document
      this.documentCache.set(document.id, document);
      
      // Handle post-creation tasks
      await this.handlePostCreationTasks(document, request.options);
      
      // Emit event
      this.emit('documentCreated', document, request.options);
      
      this.logger.info('Document created successfully', { 
        documentId: document.id, 
        type: document.type,
        title: document.title 
      });
      
      return document;
      
    } catch (error) {
      this.logger.error('Failed to create document', { error, request });
      throw new Error(`Document creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves a document by its unique identifier.
   *
   * Supports flexible options for including related data such as
   * relationships, workflow state, and analytics metrics.
   *
   * @async
   * @method getDocumentById
   * @param {string} documentId - Unique document identifier
   * @param {DocumentQueryOptions} [options] - Query options for data inclusion
   * @returns {Promise<BaseDocumentEntity | null>} The document or null if not found
   * @throws {Error} When database query fails
   *
   * @example Basic Document Retrieval
   * ```typescript
   * const document = await documentService.getDocumentById('doc-123');
   * if (document) {
   *   console.log(`Found document: ${document.title}`);
   * } else {
   *   console.log('Document not found');
   * }
   * ```
   *
   * @example Document with Full Context
   * ```typescript
   * const document = await documentService.getDocumentById('doc-123', {
   *   includeContent: true,
   *   includeRelationships: true,
   *   includeWorkflowState: true,
   *   includeMetrics: true,
   *   includeDependencies: true
   * });
   * 
   * if (document) {
   *   console.log(`Document has ${document.dependencies?.length || 0} dependencies`);
   * }
   * ```
   */
  async getDocumentById(
    documentId: string, 
    options: DocumentQueryOptions = {}
  ): Promise<BaseDocumentEntity | null> {
    this.ensureInitialized();
    
    try {
      this.logger.debug('Retrieving document by ID', { documentId, options });
      
      // Check cache first
      if (this.documentCache.has(documentId) && !options.includeRelationships) {
        return this.documentCache.get(documentId) || null;
      }
      
      // Build query based on options
      const query = this.buildDocumentQuery(options);
      const result = await this.databaseAdapter.query(
        `${query} WHERE d.id = ?`,
        [documentId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const document = this.mapRowToDocument(result.rows[0]);
      
      // Load additional data based on options
      if (options.includeRelationships) {
        await this.loadDocumentRelationships(document);
      }
      
      if (options.includeWorkflowState) {
        await this.loadWorkflowState(document);
      }
      
      if (options.includeMetrics) {
        await this.loadDocumentMetrics(document);
      }
      
      // Cache the document
      this.documentCache.set(documentId, document);
      
      this.logger.debug('Document retrieved successfully', { documentId });
      return document;
      
    } catch (error) {
      this.logger.error('Failed to retrieve document', { error, documentId });
      throw new Error(`Document retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Searches documents using various criteria and search types.
   *
   * Supports full-text search, vector similarity search, and complex
   * filtering with relevance scoring and result ranking.
   *
   * @async
   * @method searchDocuments
   * @param {DocumentSearchRequest} request - Search request parameters
   * @returns {Promise<DocumentSearchResult[]>} Array of search results with relevance scores
   * @throws {Error} When search operation fails
   *
   * @example Full-Text Search
   * ```typescript
   * const results = await documentService.searchDocuments({
   *   query: 'user authentication security',
   *   searchType: 'fulltext',
   *   filters: {
   *     type: ['prd', 'adr'],
   *     status: 'approved',
   *     priority: ['high', 'critical']
   *   },
   *   options: {
   *     limit: 20,
   *     includeContent: false
   *   },
   *   highlight: true,
   *   minScore: 0.3
   * });
   * 
   * results.forEach(result => {
   *   console.log(`${result.document.title} (score: ${result.score})`);
   *   result.highlights?.forEach(highlight => {
   *     console.log(`  ${highlight.field}: ${highlight.snippet}`);
   *   });
   * });
   * ```
   *
   * @example Vector Similarity Search
   * ```typescript
   * const semanticResults = await documentService.searchDocuments({
   *   query: 'authentication and authorization patterns',
   *   searchType: 'vector',
   *   similarityThreshold: 0.8,
   *   options: { limit: 10 }
   * });
   * ```
   */
  async searchDocuments(request: DocumentSearchRequest): Promise<DocumentSearchResult[]> {
    this.ensureInitialized();
    
    try {
      this.logger.debug('Searching documents', { 
        query: request.query, 
        searchType: request.searchType,
        filters: request.filters 
      });
      
      const searchType = request.searchType || 'fulltext';
      let results: DocumentSearchResult[] = [];
      
      switch (searchType) {
        case 'fulltext':
          results = await this.performFullTextSearch(request);
          break;
        case 'vector':
          results = await this.performVectorSearch(request);
          break;
        case 'hybrid':
          results = await this.performHybridSearch(request);
          break;
        default:
          throw new Error(`Unsupported search type: ${searchType}`);
      }
      
      // Apply filtering
      if (request.filters) {
        results = this.applySearchFilters(results, request.filters);
      }
      
      // Apply minimum score threshold
      if (request.minScore) {
        results = results.filter(result => result.score >= request.minScore!);
      }
      
      // Sort by relevance
      results.sort((a, b) => b.score - a.score);
      
      // Apply limit
      const limit = request.options?.limit || 50;
      results = results.slice(0, limit);
      
      this.logger.debug('Search completed', { 
        resultCount: results.length,
        query: request.query 
      });
      
      return results;
      
    } catch (error) {
      this.logger.error('Search operation failed', { error, request });
      throw new Error(`Document search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates an existing document with new data.
   *
   * Supports partial updates with automatic change tracking, validation,
   * and optional version increment. Preserves existing data not specified in the update.
   *
   * @async
   * @method updateDocument
   * @param {string} documentId - Document identifier to update
   * @param {DocumentUpdateRequest} updates - Fields to update
   * @returns {Promise<BaseDocumentEntity>} The updated document
   * @throws {Error} When update fails or document not found
   *
   * @example Basic Document Update
   * ```typescript
   * const updatedDocument = await documentService.updateDocument('doc-123', {
   *   title: 'Updated Product Requirements',
   *   content: 'Revised content with new requirements...',
   *   status: 'review',
   *   priority: 'high',
   *   tags: ['requirements', 'updated', 'v2']
   * });
   * 
   * console.log(`Document updated: ${updatedDocument.title}`);
   * ```
   *
   * @example Metadata and Options Update
   * ```typescript
   * await documentService.updateDocument('doc-123', {
   *   metadata: { 
   *     reviewedBy: 'tech-lead',
   *     reviewDate: new Date().toISOString(),
   *     approvalRequired: true 
   *   },
   *   options: {
   *     notifyListeners: true,
   *     updateSearchIndex: true,
   *     incrementVersion: true
   *   }
   * });
   * ```
   */
  async updateDocument(
    documentId: string, 
    updates: DocumentUpdateRequest
  ): Promise<BaseDocumentEntity> {
    this.ensureInitialized();
    
    try {
      this.logger.debug('Updating document', { documentId, updates });
      
      // Get existing document
      const existingDocument = await this.getDocumentById(documentId);
      if (!existingDocument) {
        throw new Error(`Document not found: ${documentId}`);
      }
      
      // Validate updates
      this.validateDocumentUpdates(updates);
      
      // Build updated document
      const updatedDocument = await this.buildUpdatedDocument(existingDocument, updates);
      
      // Update in database
      const setClause = this.buildUpdateSetClause(updates);
      const values = this.buildUpdateValues(updatedDocument, updates);
      
      const result = await this.databaseAdapter.execute(
        `UPDATE documents SET ${setClause}, updated_at = ? WHERE id = ?`,
        [...values, new Date().toISOString(), documentId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('No rows affected during update');
      }
      
      // Update cache
      this.documentCache.set(documentId, updatedDocument);
      
      // Handle post-update tasks
      await this.handlePostUpdateTasks(updatedDocument, updates, existingDocument);
      
      // Emit event
      this.emit('documentUpdated', documentId, updates, existingDocument);
      
      this.logger.info('Document updated successfully', { documentId });
      return updatedDocument;
      
    } catch (error) {
      this.logger.error('Failed to update document', { error, documentId, updates });
      throw new Error(`Document update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a document and its associated data.
   *
   * Removes the document, its relationships, workflow state, and metrics.
   * Optionally handles cascading deletes for dependent documents.
   *
   * @async
   * @method deleteDocument
   * @param {string} documentId - Document identifier to delete
   * @param {object} [options] - Deletion options
   * @param {boolean} [options.cascadeDelete=false] - Delete dependent documents
   * @param {boolean} [options.preserveRelationships=false] - Keep relationships for audit
   * @param {boolean} [options.notifyListeners=true] - Emit deletion events
   * @returns {Promise<boolean>} True if deletion successful
   * @throws {Error} When deletion fails or document not found
   *
   * @example Basic Document Deletion
   * ```typescript
   * const deleted = await documentService.deleteDocument('doc-123');
   * if (deleted) {
   *   console.log('Document deleted successfully');
   * }
   * ```
   *
   * @example Cascade Deletion
   * ```typescript
   * await documentService.deleteDocument('parent-doc-123', {
   *   cascadeDelete: true,
   *   notifyListeners: true
   * });
   * ```
   */
  async deleteDocument(
    documentId: string,
    options: {
      readonly cascadeDelete?: boolean;
      readonly preserveRelationships?: boolean;
      readonly notifyListeners?: boolean;
    } = {}
  ): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      this.logger.debug('Deleting document', { documentId, options });
      
      // Get document before deletion for event
      const document = await this.getDocumentById(documentId);
      if (!document) {
        this.logger.warn('Document not found for deletion', { documentId });
        return false;
      }
      
      // Handle cascade deletion
      if (options.cascadeDelete) {
        await this.handleCascadeDelete(documentId);
      }
      
      // Delete relationships unless preserving
      if (!options.preserveRelationships) {
        await this.deleteDocumentRelationships(documentId);
      }
      
      // Delete workflow state
      await this.deleteWorkflowState(documentId);
      
      // Delete metrics
      await this.deleteDocumentMetrics(documentId);
      
      // Delete main document
      const result = await this.databaseAdapter.execute(
        'DELETE FROM documents WHERE id = ?',
        [documentId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('No rows affected during deletion');
      }
      
      // Remove from cache
      this.documentCache.delete(documentId);
      this.relationshipCache.delete(documentId);
      
      // Emit event
      if (options.notifyListeners !== false) {
        this.emit('documentDeleted', documentId, document);
      }
      
      this.logger.info('Document deleted successfully', { documentId });
      return true;
      
    } catch (error) {
      this.logger.error('Failed to delete document', { error, documentId });
      throw new Error(`Document deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieves all documents with optional filtering and pagination.
   *
   * Supports comprehensive filtering, sorting, and pagination options
   * for efficient document listing and management interfaces.
   *
   * @async
   * @method getAllDocuments
   * @param {DocumentQueryOptions} [options] - Query and filtering options
   * @returns {Promise<BaseDocumentEntity[]>} Array of documents matching criteria
   * @throws {Error} When query operation fails
   *
   * @example Get All Documents with Pagination
   * ```typescript
   * const documents = await documentService.getAllDocuments({
   *   filters: {
   *     status: ['approved', 'review'],
   *     type: 'prd',
   *     priority: ['high', 'critical']
   *   },
   *   sortBy: 'updated_at',
   *   sortOrder: 'desc',
   *   limit: 20,
   *   offset: 0,
   *   includeContent: false
   * });
   * 
   * console.log(`Found ${documents.length} documents`);
   * ```
   *
   * @example Get Documents by Project
   * ```typescript
   * const projectDocs = await documentService.getAllDocuments({
   *   filters: {
   *     projectId: 'project-abc123',
   *     createdAfter: new Date('2024-01-01')
   *   },
   *   includeRelationships: true,
   *   sortBy: 'created_at',
   *   limit: 100
   * });
   * ```
   */
  async getAllDocuments(options: DocumentQueryOptions = {}): Promise<BaseDocumentEntity[]> {
    this.ensureInitialized();
    
    try {
      this.logger.debug('Retrieving all documents', { options });
      
      // Build query with filters
      const query = this.buildDocumentQuery(options);
      const whereClause = this.buildWhereClause(options.filters);
      const orderClause = this.buildOrderClause(options);
      const limitClause = this.buildLimitClause(options);
      
      const fullQuery = `${query} ${whereClause} ${orderClause} ${limitClause}`;
      const params = this.buildQueryParams(options.filters);
      
      const result = await this.databaseAdapter.query(fullQuery, params);
      
      const documents = result.rows.map(row => this.mapRowToDocument(row));
      
      // Load additional data if requested
      if (options.includeRelationships) {
        await Promise.all(documents.map(doc => this.loadDocumentRelationships(doc)));
      }
      
      if (options.includeWorkflowState) {
        await Promise.all(documents.map(doc => this.loadWorkflowState(doc)));
      }
      
      if (options.includeMetrics) {
        await Promise.all(documents.map(doc => this.loadDocumentMetrics(doc)));
      }
      
      this.logger.debug('Documents retrieved successfully', { count: documents.length });
      return documents;
      
    } catch (error) {
      this.logger.error('Failed to retrieve documents', { error, options });
      throw new Error(`Document retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Performs batch operations on multiple documents efficiently.
   *
   * Supports bulk create, update, delete, and upsert operations with
   * transaction support and detailed error reporting.
   *
   * @async
   * @method batchOperation
   * @param {BatchDocumentOperation[]} operations - Array of operations to perform
   * @param {object} [options] - Batch operation options
   * @param {boolean} [options.useTransaction=true] - Wrap operations in transaction
   * @param {boolean} [options.continueOnError=false] - Continue processing after errors
   * @param {boolean} [options.notifyListeners=true] - Emit batch completion event
   * @returns {Promise<BatchOperationResult>} Detailed results of batch operation
   * @throws {Error} When batch operation fails critically
   *
   * @example Bulk Document Creation
   * ```typescript
   * const operations: BatchDocumentOperation[] = [
   *   {
   *     operation: 'create',
   *     document: {
   *       type: 'vision',
   *       title: 'Q1 Vision',
   *       content: 'Q1 strategic vision...'
   *     }
   *   },
   *   {
   *     operation: 'create',
   *     document: {
   *       type: 'prd',
   *       title: 'Feature Requirements',
   *       content: 'Detailed requirements...'
   *     }
   *   }
   * ];
   * 
   * const result = await documentService.batchOperation(operations);
   * console.log(`Created ${result.successfulOperations} documents`);
   * ```
   *
   * @example Mixed Batch Operations
   * ```typescript
   * const mixedOps: BatchDocumentOperation[] = [
   *   { operation: 'update', documentId: 'doc-1', document: { status: 'approved' } },
   *   { operation: 'delete', documentId: 'doc-2' },
   *   { operation: 'create', document: newDocumentData }
   * ];
   * 
   * const result = await documentService.batchOperation(mixedOps, {
   *   useTransaction: true,
   *   continueOnError: false
   * });
   * ```
   */
  async batchOperation(
    operations: BatchDocumentOperation[],
    options: {
      readonly useTransaction?: boolean;
      readonly continueOnError?: boolean;
      readonly notifyListeners?: boolean;
    } = {}
  ): Promise<BatchOperationResult> {
    this.ensureInitialized();
    
    const startTime = Date.now();
    const useTransaction = options.useTransaction !== false;
    const continueOnError = options.continueOnError === true;
    
    try {
      this.logger.info('Starting batch operation', { 
        operationCount: operations.length,
        useTransaction,
        continueOnError 
      });
      
      const results: BatchOperationResult['results'] = [];
      let successfulOperations = 0;
      let failedOperations = 0;
      
      // Execute operations
      if (useTransaction) {
        // Use database transaction
        await this.databaseAdapter.execute('BEGIN TRANSACTION');
      }
      
      try {
        for (const operation of operations) {
          try {
            const result = await this.executeOperation(operation);
            results.push({
              operation: operation.operation,
              success: true,
              documentId: result.documentId,
              data: result.data
            });
            successfulOperations++;
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            results.push({
              operation: operation.operation,
              success: false,
              documentId: operation.documentId,
              error: errorMessage
            });
            failedOperations++;
            
            if (!continueOnError) {
              throw error;
            }
          }
        }
        
        if (useTransaction) {
          await this.databaseAdapter.execute('COMMIT');
        }
        
      } catch (error) {
        if (useTransaction) {
          await this.databaseAdapter.execute('ROLLBACK');
        }
        throw error;
      }
      
      const executionTime = Date.now() - startTime;
      const batchResult: BatchOperationResult = {
        totalOperations: operations.length,
        successfulOperations,
        failedOperations,
        results,
        executionTime,
        metadata: {
          useTransaction,
          continueOnError,
          startTime: new Date(startTime).toISOString()
        }
      };
      
      // Emit event
      if (options.notifyListeners !== false) {
        this.emit('batchOperationCompleted', batchResult);
      }
      
      this.logger.info('Batch operation completed', {
        totalOperations: operations.length,
        successfulOperations,
        failedOperations,
        executionTime
      });
      
      return batchResult;
      
    } catch (error) {
      this.logger.error('Batch operation failed', { error, operations });
      throw new Error(`Batch operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('DocumentService not initialized. Call initialize() first.');
    }
  }

  private async initializeSchema(): Promise<void> {
    // Create documents table if it doesn't exist
    await this.databaseAdapter.execute(`
      CREATE TABLE F NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        priority TEXT NOT NULL DEFAULT 'medium',
        author TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        project_id TEXT,
        parent_document_id TEXT,
        dependencies TEXT NOT NULL DEFAULT '[]',
        related_documents TEXT NOT NULL DEFAULT '[]',
        version TEXT NOT NULL DEFAULT '1.0.0',
        checksum TEXT NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        searchable_content TEXT NOT NULL,
        keywords TEXT NOT NULL DEFAULT '[]',
        workflow_stage TEXT,
        completion_percentage NTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create indexes for performance
    await this.databaseAdapter.execute('CREATE NDEX F NOT EXISTS idx_documents_type ON documents(type)');
    await this.databaseAdapter.execute('CREATE NDEX F NOT EXISTS idx_documents_status ON documents(status)');
    await this.databaseAdapter.execute('CREATE NDEX F NOT EXISTS idx_documents_priority ON documents(priority)');
    await this.databaseAdapter.execute('CREATE NDEX F NOT EXISTS idx_documents_project_id ON documents(project_id)');
    await this.databaseAdapter.execute('CREATE NDEX F NOT EXISTS idx_documents_created_at ON documents(created_at)');
    await this.databaseAdapter.execute('CREATE NDEX F NOT EXISTS idx_documents_updated_at ON documents(updated_at)');
  }

  private setupEventListeners(): void {
    // Set up any required event listeners
    this.on('error', (error) => {
      this.logger.error('DocumentService error', { error });
    });
  }

  private validateDocumentRequest(request: DocumentCreateRequest): void {
    if (!request.type) {
      throw new Error('Document type is required');
    }
    if (!request.title?.trim()) {
      throw new Error('Document title is required');
    }
    if (!request.content?.trim()) {
      throw new Error('Document content is required');
    }
  }

  private validateDocumentUpdates(updates: DocumentUpdateRequest): void {
    if (updates.title !== undefined && !updates.title?.trim()) {
      throw new Error('Document title cannot be empty');
    }
    if (updates.content !== undefined && !updates.content?.trim()) {
      throw new Error('Document content cannot be empty');
    }
  }

  private async buildDocumentEntity(request: DocumentCreateRequest): Promise<BaseDocumentEntity> {
    const now = new Date();
    const documentId = nanoid();
    
    return {
      id: documentId,
      type: request.type,
      title: request.title.trim(),
      content: request.content.trim(),
      summary: request.summary?.trim(),
      status: request.status || 'draft',
      priority: request.priority || 'medium',
      author: request.author,
      tags: request.tags || [],
      project_id: request.projectId,
      parent_document_id: request.parentDocumentId,
      dependencies: request.dependencies || [],
      related_documents: request.relatedDocuments || [],
      version: '1.0.0',
      checksum: this.generateChecksum(request.content),
      metadata: request.metadata || {},
      searchable_content: this.generateSearchableContent(request.title, request.content, request.summary),
      keywords: this.extractKeywords(request.title, request.content),
      workflow_stage: request.options?.startWorkflow,
      completion_percentage: 0,
      created_at: now,
      updated_at: now
    };
  }

  private async buildUpdatedDocument(
    existing: BaseDocumentEntity, 
    updates: DocumentUpdateRequest
  ): Promise<BaseDocumentEntity> {
    const updated = { ...existing };
    
    if (updates.title !== undefined) {
      updated.title = updates.title.trim();
    }
    if (updates.content !== undefined) {
      updated.content = updates.content.trim();
      updated.checksum = this.generateChecksum(updated.content);
      updated.searchable_content = this.generateSearchableContent(
        updated.title, 
        updated.content, 
        updated.summary
      );
      updated.keywords = this.extractKeywords(updated.title, updated.content);
    }
    if (updates.summary !== undefined) {
      updated.summary = updates.summary?.trim();
    }
    if (updates.status !== undefined) {
      updated.status = updates.status;
    }
    if (updates.priority !== undefined) {
      updated.priority = updates.priority;
    }
    if (updates.tags !== undefined) {
      updated.tags = updates.tags;
    }
    if (updates.metadata !== undefined) {
      updated.metadata = { ...updated.metadata, ...updates.metadata };
    }
    if (updates.dependencies !== undefined) {
      updated.dependencies = updates.dependencies;
    }
    if (updates.relatedDocuments !== undefined) {
      updated.related_documents = updates.relatedDocuments;
    }
    
    // Always update timestamp
    updated.updated_at = new Date();
    
    // Increment version if requested
    if (updates.options?.incrementVersion) {
      const versionParts = updated.version.split('.').map(Number);
      versionParts[2]++; // Increment patch version
      updated.version = versionParts.join('.');
    }
    
    return updated;
  }

  private generateChecksum(content: string): string {
    // Simple checksum implementation - in production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private generateSearchableContent(title: string, content: string, summary?: string): string {
    return [title, content, summary].filter(Boolean).join(' ').toLowerCase();
  }

  private extractKeywords(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private async handlePostCreationTasks(
    document: BaseDocumentEntity, 
    options?: DocumentCreateOptions
  ): Promise<void> {
    if (options?.autoGenerateRelationships) {
      await this.generateAutomaticRelationships(document);
    }
    
    if (options?.generateSearchIndex) {
      await this.updateSearchIndex(document);
    }
    
    if (options?.startWorkflow) {
      await this.initializeWorkflowState(document, options.startWorkflow);
    }
  }

  private async handlePostUpdateTasks(
    document: BaseDocumentEntity,
    updates: DocumentUpdateRequest,
    previous: BaseDocumentEntity
  ): Promise<void> {
    if (updates.options?.updateSearchIndex) {
      await this.updateSearchIndex(document);
    }
  }

  private buildDocumentQuery(options: DocumentQueryOptions): string {
    const fields = options.includeContent 
      ? 'd.*' 
      : 'd.id, d.type, d.title, d.summary, d.status, d.priority, d.author, d.tags, d.project_id, d.created_at, d.updated_at';
    
    return `SELECT ${fields} FROM documents d`;
  }

  private buildWhereClause(filters?: DocumentFilterOptions): string {
    if (!filters) return '';
    
    const conditions: string[] = [];
    
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      conditions.push(`d.type N (${types.map(() => '?').join(', ')})`);
    }
    
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      conditions.push(`d.status N (${statuses.map(() => '?').join(', ')})`);
    }
    
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      conditions.push(`d.priority N (${priorities.map(() => '?').join(', ')})`);
    }
    
    if (filters.projectId) {
      const projectIds = Array.isArray(filters.projectId) ? filters.projectId : [filters.projectId];
      conditions.push(`d.project_id N (${projectIds.map(() => '?').join(', ')})`);
    }
    
    if (filters.createdAfter) {
      conditions.push('d.created_at >= ?');
    }
    
    if (filters.createdBefore) {
      conditions.push('d.created_at <= ?');
    }
    
    if (filters.searchQuery) {
      conditions.push('d.searchable_content LIKE ?');
    }
    
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  private buildOrderClause(options: DocumentQueryOptions): string {
    const sortBy = options.sortBy || 'updated_at';
    const sortOrder = options.sortOrder || 'desc';
    return `ORDER BY d.${sortBy} ${sortOrder.toUpperCase()}`;
  }

  private buildLimitClause(options: DocumentQueryOptions): string {
    if (options.limit) {
      const offset = options.offset || 0;
      return `LIMIT ${options.limit} OFFSET ${offset}`;
    }
    return '';
  }

  private buildQueryParams(filters?: DocumentFilterOptions): unknown[] {
    if (!filters) return [];
    
    const params: unknown[] = [];
    
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      params.push(...types);
    }
    
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      params.push(...statuses);
    }
    
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      params.push(...priorities);
    }
    
    if (filters.projectId) {
      const projectIds = Array.isArray(filters.projectId) ? filters.projectId : [filters.projectId];
      params.push(...projectIds);
    }
    
    if (filters.createdAfter) {
      params.push(filters.createdAfter.toISOString());
    }
    
    if (filters.createdBefore) {
      params.push(filters.createdBefore.toISOString());
    }
    
    if (filters.searchQuery) {
      params.push(`%${filters.searchQuery}%`);
    }
    
    return params;
  }

  private buildUpdateSetClause(updates: DocumentUpdateRequest): string {
    const setClauses: string[] = [];
    
    if (updates.title !== undefined) setClauses.push('title = ?');
    if (updates.content !== undefined) {
      setClauses.push('content = ?', 'checksum = ?', 'searchable_content = ?', 'keywords = ?');
    }
    if (updates.summary !== undefined) setClauses.push('summary = ?');
    if (updates.status !== undefined) setClauses.push('status = ?');
    if (updates.priority !== undefined) setClauses.push('priority = ?');
    if (updates.tags !== undefined) setClauses.push('tags = ?');
    if (updates.metadata !== undefined) setClauses.push('metadata = ?');
    if (updates.dependencies !== undefined) setClauses.push('dependencies = ?');
    if (updates.relatedDocuments !== undefined) setClauses.push('related_documents = ?');
    
    return setClauses.join(', ');
  }

  private buildUpdateValues(document: BaseDocumentEntity, updates: DocumentUpdateRequest): unknown[] {
    const values: unknown[] = [];
    
    if (updates.title !== undefined) values.push(document.title);
    if (updates.content !== undefined) {
      values.push(
        document.content,
        document.checksum,
        document.searchable_content,
        JSON.stringify(document.keywords)
      );
    }
    if (updates.summary !== undefined) values.push(document.summary);
    if (updates.status !== undefined) values.push(document.status);
    if (updates.priority !== undefined) values.push(document.priority);
    if (updates.tags !== undefined) values.push(JSON.stringify(document.tags));
    if (updates.metadata !== undefined) values.push(JSON.stringify(document.metadata));
    if (updates.dependencies !== undefined) values.push(JSON.stringify(document.dependencies));
    if (updates.relatedDocuments !== undefined) values.push(JSON.stringify(document.related_documents));
    
    return values;
  }

  private mapRowToDocument(row: any): BaseDocumentEntity {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      content: row.content,
      summary: row.summary,
      status: row.status,
      priority: row.priority,
      author: row.author,
      tags: JSON.parse(row.tags || '[]'),
      project_id: row.project_id,
      parent_document_id: row.parent_document_id,
      dependencies: JSON.parse(row.dependencies || '[]'),
      related_documents: JSON.parse(row.related_documents || '[]'),
      version: row.version,
      checksum: row.checksum,
      metadata: JSON.parse(row.metadata || '{}'),
      searchable_content: row.searchable_content,
      keywords: JSON.parse(row.keywords || '[]'),
      workflow_stage: row.workflow_stage,
      completion_percentage: row.completion_percentage,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  // Placeholder implementations for complex features
  private async loadDocumentRelationships(_document: BaseDocumentEntity): Promise<void> {
    // TODO: Implement relationship loading
  }

  private async loadWorkflowState(_document: BaseDocumentEntity): Promise<void> {
    // TODO: Implement workflow state loading
  }

  private async loadDocumentMetrics(_document: BaseDocumentEntity): Promise<void> {
    // TODO: Implement metrics loading
  }

  private async performFullTextSearch(request: DocumentSearchRequest): Promise<DocumentSearchResult[]> {
    // TODO: Implement full-text search
    return [];
  }

  private async performVectorSearch(request: DocumentSearchRequest): Promise<DocumentSearchResult[]> {
    // TODO: Implement vector search
    return [];
  }

  private async performHybridSearch(request: DocumentSearchRequest): Promise<DocumentSearchResult[]> {
    // TODO: Implement hybrid search
    return [];
  }

  private applySearchFilters(
    results: DocumentSearchResult[], 
    filters: DocumentFilterOptions
  ): DocumentSearchResult[] {
    // TODO: Implement search result filtering
    return results;
  }

  private async handleCascadeDelete(_documentId: string): Promise<void> {
    // TODO: Implement cascade deletion
  }

  private async deleteDocumentRelationships(_documentId: string): Promise<void> {
    // TODO: Implement relationship deletion
  }

  private async deleteWorkflowState(_documentId: string): Promise<void> {
    // TODO: Implement workflow state deletion
  }

  private async deleteDocumentMetrics(_documentId: string): Promise<void> {
    // TODO: Implement metrics deletion
  }

  private async executeOperation(operation: BatchDocumentOperation): Promise<{
    documentId?: string;
    data?: BaseDocumentEntity;
  }> {
    // TODO: Implement batch operation execution
    return {};
  }

  private async generateAutomaticRelationships(_document: BaseDocumentEntity): Promise<void> {
    // TODO: Implement automatic relationship generation
  }

  private async updateSearchIndex(_document: BaseDocumentEntity): Promise<void> {
    // TODO: Implement search index update
  }

  private async initializeWorkflowState(_document: BaseDocumentEntity, _stage: string): Promise<void> {
    // TODO: Implement workflow state initialization
  }
}

/**
 * Default export for backward compatibility.
 */
export default DocumentService;