/**
 * @file Document Manager - Pure DAL Implementation.
 *
 * Complete rewrite using unified DAL patterns only.
 * Replaces file-based operations with database entities.
 */
import type { DocumentType } from '../../workflows/types.ts';
import type { ADRDocumentEntity, BaseDocumentEntity, DocumentWorkflowStateEntity, EpicDocumentEntity, FeatureDocumentEntity, PRDDocumentEntity, ProjectEntity, TaskDocumentEntity, VisionDocumentEntity } from '../entities/document-entities.ts';
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
 * Pure DAL-Based Document Manager.
 * Uses unified DAL for all database operations.
 *
 * @example
 */
export declare class DocumentManager {
    private databaseType;
    private documentRepository;
    private projectRepository;
    private relationshipRepository;
    private workflowRepository;
    constructor(databaseType?: 'postgresql' | 'sqlite' | 'mysql');
    /**
     * Initialize document manager and all DAL repositories.
     */
    initialize(): Promise<void>;
    /**
     * Create a new document using DAL.
     *
     * @param document
     * @param options
     */
    createDocument<T extends BaseDocumentEntity>(document: Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>, options?: DocumentCreateOptions): Promise<T>;
    /**
     * Get document by ID using DAL.
     *
     * @param id
     * @param options
     */
    getDocument<T extends BaseDocumentEntity>(id: string, options?: DocumentQueryOptions): Promise<T | null>;
    /**
     * Update document using DAL.
     *
     * @param id
     * @param updates
     * @param options
     */
    updateDocument<T extends BaseDocumentEntity>(id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>>, options?: DocumentCreateOptions): Promise<T>;
    /**
     * Delete document using DAL.
     *
     * @param id
     */
    deleteDocument(id: string): Promise<void>;
    /**
     * Query documents with filters using DAL.
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
     * Advanced document search using multiple search strategies.
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
     * Perform fulltext search with TF-IDF scoring.
     *
     * @param documents
     * @param query
     */
    private performFulltextSearch;
    /**
     * Perform semantic search using content similarity.
     *
     * @param documents
     * @param query
     */
    private performSemanticSearch;
    /**
     * Perform keyword-based search.
     *
     * @param documents
     * @param query
     */
    private performKeywordSearch;
    /**
     * Perform combined search using multiple strategies.
     *
     * @param documents
     * @param query
     */
    private performCombinedSearch;
    /**
     * Create a new project using DAL.
     *
     * @param project
     */
    createProject(project: Omit<ProjectEntity, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectEntity>;
    /**
     * Get project with all related documents using DAL.
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
     * Start workflow for document using DAL with automated stage progression.
     *
     * @param documentId
     * @param workflowName
     * @param initialStage
     */
    startDocumentWorkflow(documentId: string, workflowName: string, initialStage?: string): Promise<DocumentWorkflowStateEntity>;
    /**
     * Advance document workflow with automated rule checking.
     *
     * @param documentId
     * @param nextStage
     * @param results
     */
    advanceDocumentWorkflow(documentId: string, nextStage: string, results?: Record<string, any>): Promise<DocumentWorkflowStateEntity>;
    /**
     * Check and trigger workflow automation based on predefined rules.
     *
     * @param documentId
     */
    checkAndTriggerWorkflowAutomation(documentId: string): Promise<void>;
    /**
     * Evaluate if an automation rule should trigger.
     *
     * @param document
     * @param rule
     */
    private evaluateAutomationRule;
    /**
     * Execute automation action when rule triggers.
     *
     * @param document
     * @param rule
     */
    private executeAutomationAction;
    /**
     * Execute create document automation action.
     *
     * @param sourceDocument
     * @param actionConfig
     * @param actionConfig.documentType
     * @param actionConfig.template
     * @param actionConfig.title
     * @param actionConfig.assignTo
     * @param actionConfig.priority
     * @param actionConfig.status
     * @param actionConfig.inheritKeywords
     */
    private executeCreateDocumentAction;
    /**
     * Generate workflow artifacts.
     *
     * @param document
     * @param artifactTypes
     */
    private generateWorkflowArtifacts;
    /**
     * Send workflow notification.
     *
     * @param document
     * @param notificationConfig
     * @param notificationConfig.recipients
     * @param notificationConfig.template
     * @param notificationConfig.channel
     * @param notificationConfig.urgency
     * @param _document
     * @param _notificationConfig
     * @param _notificationConfig.recipients
     * @param _notificationConfig.template
     * @param _notificationConfig.channel
     * @param _notificationConfig.urgency
     */
    private sendWorkflowNotification;
    /**
     * Get workflow definition for a workflow type.
     *
     * @param workflowName
     */
    private getWorkflowDefinition;
    /**
     * Evaluate a condition with operator.
     *
     * @param value
     * @param operator
     * @param expected
     */
    private evaluateCondition;
    /**
     * Get default template for document type.
     *
     * @param documentType
     */
    private getDefaultTemplate;
    private generateSummaryReport;
    private generateChecklist;
    private generateTimeline;
    private generateStakeholderMatrix;
    private generateChecksum;
    /**
     * Generate document relationships based on content analysis and workflow stage.
     *
     * @param document
     */
    private generateDocumentRelationships;
    /**
     * Find parent documents based on document type hierarchy.
     *
     * @param document
     */
    private findParentDocuments;
    /**
     * Find semantic relationships based on content analysis.
     *
     * @param document
     */
    private findSemanticRelationships;
    /**
     * Find workflow-based relationships.
     *
     * @param document
     */
    private findWorkflowRelationships;
    /**
     * Calculate relationship strength between two documents.
     *
     * @param doc1
     * @param doc2
     */
    private calculateRelationshipStrength;
    /**
     * Calculate keyword overlap between two arrays.
     *
     * @param keywords1
     * @param keywords2
     */
    private calculateKeywordOverlap;
    /**
     * Get workflow generation rules for document type.
     *
     * @param documentType
     */
    private getWorkflowGenerationRules;
    private getDocumentRelationships;
    private getDocumentWorkflowState;
    private generateSearchIndex;
    private updateSearchIndex;
    /**
     * Update document relationships when content changes significantly.
     *
     * @param document
     */
    private updateDocumentRelationships;
    private deleteDocumentRelationships;
    private deleteDocumentWorkflowState;
    private deleteSearchIndex;
    private tokenizeText;
    private calculateTermFrequency;
    private calculateInverseDocumentFrequency;
    private expandTokensWithSynonyms;
    private calculateJaccardSimilarity;
    private calculateConceptualSimilarity;
    private extractPhrases;
}
export declare const documentManager: DocumentManager;
export default documentManager;
//# sourceMappingURL=document-manager.d.ts.map