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
import type { Logger } from '../../config/logging-config';
import type { BaseDocumentEntity } from '../entities/document-entities';
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
        readonly matches: Array<{
            readonly start: number;
            readonly end: number;
        }>;
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
export declare class DocumentService extends EventEmitter<DocumentServiceEvents> {
    private readonly logger;
    private readonly databaseAdapter;
    private isInitialized;
    private readonly documentCache;
    private readonly relationshipCache;
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
    constructor(databaseAdapter: DatabaseAdapter, logger?: Logger);
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
    initialize(): Promise<void>;
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
    createDocument(request: DocumentCreateRequest): Promise<BaseDocumentEntity>;
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
    getDocumentById(documentId: string, options?: DocumentQueryOptions): Promise<BaseDocumentEntity | null>;
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
    searchDocuments(request: DocumentSearchRequest): Promise<DocumentSearchResult[]>;
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
    updateDocument(documentId: string, updates: DocumentUpdateRequest): Promise<BaseDocumentEntity>;
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
    deleteDocument(documentId: string, options?: {
        readonly cascadeDelete?: boolean;
        readonly preserveRelationships?: boolean;
        readonly notifyListeners?: boolean;
    }): Promise<boolean>;
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
    getAllDocuments(options?: DocumentQueryOptions): Promise<BaseDocumentEntity[]>;
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
    batchOperation(operations: BatchDocumentOperation[], options?: {
        readonly useTransaction?: boolean;
        readonly continueOnError?: boolean;
        readonly notifyListeners?: boolean;
    }): Promise<BatchOperationResult>;
    private ensureInitialized;
    private initializeSchema;
    private setupEventListeners;
    private validateDocumentRequest;
    private validateDocumentUpdates;
    private buildDocumentEntity;
    private buildUpdatedDocument;
    private generateChecksum;
    private generateSearchableContent;
    private extractKeywords;
    private handlePostCreationTasks;
    private handlePostUpdateTasks;
    private buildDocumentQuery;
    private buildWhereClause;
    private buildOrderClause;
    private buildLimitClause;
    private buildQueryParams;
    private buildUpdateSetClause;
    private buildUpdateValues;
    private mapRowToDocument;
    private loadDocumentRelationships;
    private loadWorkflowState;
    private loadDocumentMetrics;
    private performFullTextSearch;
    private performVectorSearch;
    private performHybridSearch;
    private applySearchFilters;
    private handleCascadeDelete;
    private deleteDocumentRelationships;
    private deleteWorkflowState;
    private deleteDocumentMetrics;
    private executeOperation;
    private generateAutomaticRelationships;
    private updateSearchIndex;
    private initializeWorkflowState;
}
/**
 * Default export for backward compatibility.
 */
export default DocumentService;
//# sourceMappingURL=document-service.d.ts.map