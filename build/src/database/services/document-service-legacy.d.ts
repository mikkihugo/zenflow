/**
 * TODO: LEGACY FILE - Review for migration or removal.
 * This is a legacy document service that needs review.
 *
 * Document Service - Pure Database-Driven Operations with DAL.
 *
 * REPLACES file-based DocumentDrivenSystem with database-first approach
 * Uses the unified DAL for all database operations across multiple adapters.
 * Provides CRUD operations for all document entities with relationships.
 */
/**
 * @file Database layer: document-service-legacy.
 */
import type { ADRDocumentEntity, BaseDocumentEntity, DocumentWorkflowStateEntity, EpicDocumentEntity, FeatureDocumentEntity, PRDDocumentEntity, ProjectEntity, TaskDocumentEntity, VisionDocumentEntity } from '../entities/document-entities.ts';
import type { DocumentType } from '../types/workflow-types';
export interface DocumentCreateOptions {
    autoGenerateRelationships?: boolean;
    startWorkflow?: string;
    notifyListeners?: boolean;
    generateSearchIndex?: boolean;
}
export interface DocumentQueryOptions {
    includeContent?: boolean;
    includeRelationships?: boolean;
    includeWorkflowState?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'updated_at' | 'title' | 'priority' | 'completion_percentage';
    sortOrder?: 'asc' | 'desc';
}
export interface DocumentSearchOptions extends DocumentQueryOptions {
    searchType: 'fulltext' | 'semantic' | 'keyword' | 'combined';
    query: string;
    documentTypes?: DocumentType[];
    projectId?: string;
    status?: string[];
    priority?: string[];
    dateRange?: {
        start: Date;
        end: Date;
        field: 'created_at' | 'updated_at';
    };
}
/**
 * Pure Database-Driven Document Service with DAL
 * Replaces file-based operations with database entities using unified DAL.
 *
 * @example
 */
export declare class DocumentService {
    private databaseType;
    private documentRepository;
    private projectRepository;
    private relationshipRepository;
    private workflowRepository;
    private documentDAO;
    private coordinator;
    constructor(databaseType?: 'postgresql' | 'sqlite' | 'mysql');
    /**
     * Initialize document service and repositories.
     */
    initialize(): Promise<void>;
    /**
     * Create a new document with automatic relationship generation using DAL.
     *
     * @param document
     * @param options
     */
    createDocument<T extends BaseDocumentEntity>(document: Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>, options?: DocumentCreateOptions): Promise<T>;
    /**
     * Get document by ID with optional relationships.
     *
     * @param id
     * @param options
     */
    getDocument<T extends BaseDocumentEntity>(id: string, options?: DocumentQueryOptions): Promise<T | null>;
    /**
     * Update document with automatic versioning.
     *
     * @param id
     * @param updates
     * @param options
     */
    updateDocument<T extends BaseDocumentEntity>(id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>>, options?: DocumentCreateOptions): Promise<T>;
    /**
     * Delete document and cleanup relationships.
     *
     * @param id
     */
    deleteDocument(id: string): Promise<void>;
    /**
     * Query documents with filters and pagination.
     *
     * @param filters
     * @param filters.type
     * @param filters.projectId
     * @param filters.status
     * @param filters.priority
     * @param filters.author
     * @param filters.tags
     * @param filters.parentDocumentId
     * @param filters.workflowStage
     * @param options
     */
    queryDocuments<T extends BaseDocumentEntity>(filters: {
        type?: DocumentType | DocumentType[];
        projectId?: string;
        status?: string | string[];
        priority?: string | string[];
        author?: string;
        tags?: string[];
        parentDocumentId?: string;
        workflowStage?: string;
    }, options?: DocumentQueryOptions): Promise<{
        documents: T[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Advanced document search with full-text and semantic capabilities.
     *
     * @param searchOptions
     */
    searchDocuments<T extends BaseDocumentEntity>(searchOptions: DocumentSearchOptions): Promise<{
        documents: T[];
        total: number;
        hasMore: boolean;
        searchMetadata: {
            searchType: string;
            query: string;
            processingTime: number;
            relevanceScores?: number[];
        };
    }>;
    /**
     * Create a new project with document structure.
     *
     * @param project
     */
    createProject(project: Omit<ProjectEntity, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectEntity>;
    /**
     * Get project with all related documents.
     *
     * @param projectId
     */
    getProjectWithDocuments(projectId: string): Promise<{
        project: ProjectEntity;
        documents: {
            visions: VisionDocumentEntity[];
            adrs: ADRDocumentEntity[];
            prds: PRDDocumentEntity[];
            epics: EpicDocumentEntity[];
            features: FeatureDocumentEntity[];
            tasks: TaskDocumentEntity[];
        };
    } | null>;
    /**
     * Start workflow for document.
     *
     * @param documentId
     * @param workflowName
     * @param initialStage
     */
    startDocumentWorkflow(documentId: string, workflowName: string, initialStage?: string): Promise<DocumentWorkflowStateEntity>;
    /**
     * Advance document workflow to next stage.
     *
     * @param documentId
     * @param nextStage
     * @param results
     */
    advanceDocumentWorkflow(documentId: string, nextStage: string, results?: Record<string, any>): Promise<DocumentWorkflowStateEntity>;
    private serializeDocument;
    private deserializeDocument;
    private generateChecksum;
    private buildQueryFilter;
    private buildFullTextSearchQuery;
    private buildSemanticSearchQuery;
    private buildKeywordSearchQuery;
    private buildCombinedSearchQuery;
    private buildSearchFilters;
    private encodeSearchQuery;
    private generateDocumentRelationships;
    private getDocumentRelationships;
    private getDocumentWorkflowState;
    private generateSearchIndex;
    private updateSearchIndex;
    private updateDocumentRelationships;
    private deleteDocumentRelationships;
    private deleteDocumentWorkflowState;
    private deleteSearchIndex;
}
//# sourceMappingURL=document-service-legacy.d.ts.map