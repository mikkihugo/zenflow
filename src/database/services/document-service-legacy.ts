/**
 * TODO: LEGACY FILE - Review for migration or removal
 * This is a legacy document service that needs review.
 * 
 * Document Service - Pure Database-Driven Operations with DAL.
 *
 * REPLACES file-based DocumentDrivenSystem with database-first approach
 * Uses the unified DAL for all database operations across multiple adapters
 * Provides CRUD operations for all document entities with relationships.
 */

import { nanoid } from 'nanoid';
import type { DocumentType } from '../../types/workflow-types';
import type {
  ADRDocumentEntity,
  BaseDocumentEntity,
  DocumentRelationshipEntity,
  DocumentWorkflowStateEntity,
  EpicDocumentEntity,
  FeatureDocumentEntity,
  PRDDocumentEntity,
  ProjectEntity,
  TaskDocumentEntity,
  VisionDocumentEntity,
} from '../entities/document-entities';
import { createDao } from '../index';
import type { DatabaseQuery, IRepository } from '../interfaces';

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
export class DocumentService {
  private documentRepository!: IRepository<BaseDocumentEntity>;
  private projectRepository!: IRepository<ProjectEntity>;
  private relationshipRepository!: IRepository<DocumentRelationshipEntity>;
  private workflowRepository!: IRepository<DocumentWorkflowStateEntity>;
  private documentDAO!: IRepository<BaseDocumentEntity>;
  private coordinator: any; // xxx NEEDS_HUMAN: Define proper coordinator type or import from a module

  constructor(private databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql') {}

  /**
   * Initialize document service and repositories.
   */
  async initialize(): Promise<void> {
    // Initialize repositories using DAL factory
    this.documentRepository = await createDao<BaseDocumentEntity>('Document', this.databaseType);
    this.projectRepository = await createDao<ProjectEntity>('Project', this.databaseType);
    this.relationshipRepository = await createDao<DocumentRelationshipEntity>(
      'DocumentRelationship',
      this.databaseType
    );
    this.workflowRepository = await createDao<DocumentWorkflowStateEntity>(
      'DocumentWorkflowState',
      this.databaseType
    );
    this.documentDAO = await createDao<BaseDocumentEntity>('Document', this.databaseType);
  }

  // ==================== DOCUMENT CRUD OPERATIONS ====================

  /**
   * Create a new document with automatic relationship generation using DAL.
   *
   * @param document
   * @param options
   */
  async createDocument<T extends BaseDocumentEntity>(
    document: Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>,
    options: DocumentCreateOptions = {}
  ): Promise<T> {
    const id = nanoid();
    const now = new Date();
    const checksum = this.generateChecksum(document.content);

    const fullDocument: T = {
      ...document,
      id,
      created_at: now,
      updated_at: now,
      checksum,
    } as T;

    // Create document using DAL repository
    const created = await this.documentRepository.create(fullDocument as any);

    // Auto-generate relationships if requested
    if (options.autoGenerateRelationships) {
      await this.generateDocumentRelationships(created as T);
    }

    // Start workflow if specified
    if (options.startWorkflow) {
      await this.startDocumentWorkflow(id, options.startWorkflow);
    }

    // Generate search index
    if (options.generateSearchIndex !== false) {
      await this.generateSearchIndex(created as T);
    }

    return created as T;
  }

  /**
   * Get document by ID with optional relationships.
   *
   * @param id
   * @param options
   */
  async getDocument<T extends BaseDocumentEntity>(
    id: string,
    options: DocumentQueryOptions = {}
  ): Promise<T | null> {
    const query: DatabaseQuery = {
      type: 'select',
      operation: 'document_find',
      parameters: {
        collection: 'documents',
        filter: { id },
        includeContent: options.includeContent !== false,
      },
      requirements: {
        consistency: 'eventual',
        timeout: 10000,
        priority: 'medium',
      },
      routing: {
        loadBalancing: 'performance_based',
      },
      timestamp: Date.now(),
    };

    const result = await this.coordinator.executeQuery(query);

    if (!result.result?.documents?.length) {
      return null;
    }

    const document: any = this.deserializeDocument<T>(result.result.documents[0]);

    // Load relationships if requested
    if (options.includeRelationships) {
      document.relationships = await this.getDocumentRelationships(id);
    }

    // Load workflow state if requested
    if (options.includeWorkflowState) {
      document.workflowState = await this.getDocumentWorkflowState(id);
    }

    return document as T;
  }

  /**
   * Update document with automatic versioning.
   *
   * @param id
   * @param updates
   * @param options
   */
  async updateDocument<T extends BaseDocumentEntity>(
    id: string,
    updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'checksum'>>,
    options: DocumentCreateOptions = {}
  ): Promise<T> {
    const existing = await this.getDocument<T>(id);
    if (!existing) {
      throw new Error(`Document not found: ${id}`);
    }

    const now = new Date();
    const updatedDocument: T = {
      ...existing,
      ...updates,
      updated_at: now,
      checksum: updates.content ? this.generateChecksum(updates.content) : existing.checksum,
    } as T;

    const updateQuery: DatabaseQuery = {
      type: 'update',
      operation: 'document_update',
      parameters: {
        collection: 'documents',
        filter: { id },
        update: this.serializeDocument(updatedDocument),
      },
      requirements: {
        consistency: 'strong',
        timeout: 30000,
        priority: 'high',
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };

    await this.coordinator.executeQuery(updateQuery);

    // Update search index if content changed
    if (updates.content || updates.title) {
      await this.updateSearchIndex(updatedDocument);
    }

    // Update relationships if content significantly changed
    if (options.autoGenerateRelationships && updates.content) {
      await this.updateDocumentRelationships(updatedDocument);
    }

    return updatedDocument;
  }

  /**
   * Delete document and cleanup relationships.
   *
   * @param id
   */
  async deleteDocument(id: string): Promise<void> {
    // Delete relationships first
    await this.deleteDocumentRelationships(id);

    // Delete workflow state
    await this.deleteDocumentWorkflowState(id);

    // Delete search index
    await this.deleteSearchIndex(id);

    // Delete document
    const deleteQuery: DatabaseQuery = {
      type: 'delete',
      operation: 'document_delete',
      parameters: {
        collection: 'documents',
        filter: { id },
      },
      requirements: {
        consistency: 'strong',
        timeout: 30000,
        priority: 'high',
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };

    await this.coordinator.executeQuery(deleteQuery);
  }

  // ==================== DOCUMENT QUERYING ====================

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
  async queryDocuments<T extends BaseDocumentEntity>(
    filters: {
      type?: DocumentType | DocumentType[];
      projectId?: string;
      status?: string | string[];
      priority?: string | string[];
      author?: string;
      tags?: string[];
      parentDocumentId?: string;
      workflowStage?: string;
    },
    options: DocumentQueryOptions = {}
  ): Promise<{
    documents: T[];
    total: number;
    hasMore: boolean;
  }> {
    const query: DatabaseQuery = {
      type: 'select',
      operation: 'document_find',
      parameters: {
        collection: 'documents',
        filter: this.buildQueryFilter(filters),
        options: {
          limit: options.limit || 50,
          offset: options.offset || 0,
          sort: {
            [options.sortBy || 'updated_at']: options.sortOrder || 'desc',
          },
          includeContent: options.includeContent !== false,
        },
      },
      requirements: {
        consistency: 'eventual',
        timeout: 15000,
        priority: 'medium',
      },
      routing: {
        loadBalancing: 'performance_based',
      },
      timestamp: Date.now(),
    };

    const result = await this.coordinator.executeQuery(query);
    const documents =
      result.result?.documents?.map((doc: any) => this.deserializeDocument<T>(doc)) || [];

    return {
      documents,
      total: result.result?.total || documents.length,
      hasMore: (options.offset || 0) + documents.length < (result.result?.total || 0),
    };
  }

  /**
   * Advanced document search with full-text and semantic capabilities.
   *
   * @param searchOptions
   */
  async searchDocuments<T extends BaseDocumentEntity>(
    searchOptions: DocumentSearchOptions
  ): Promise<{
    documents: T[];
    total: number;
    hasMore: boolean;
    searchMetadata: {
      searchType: string;
      query: string;
      processingTime: number;
      relevanceScores?: number[];
    };
  }> {
    const startTime = Date.now();

    let query: DatabaseQuery;

    switch (searchOptions.searchType) {
      case 'fulltext':
        query = this.buildFullTextSearchQuery(searchOptions);
        break;
      case 'semantic':
        query = this.buildSemanticSearchQuery(searchOptions);
        break;
      case 'keyword':
        query = this.buildKeywordSearchQuery(searchOptions);
        break;
      default:
        query = this.buildCombinedSearchQuery(searchOptions);
    }

    const result = await this.coordinator.executeQuery(query);
    const documents =
      result.result?.documents?.map((doc: any) => this.deserializeDocument<T>(doc)) || [];

    const processingTime = Date.now() - startTime;

    return {
      documents,
      total: result.result?.total || documents.length,
      hasMore: (searchOptions.offset || 0) + documents.length < (result.result?.total || 0),
      searchMetadata: {
        searchType: searchOptions.searchType,
        query: searchOptions.query,
        processingTime,
        relevanceScores: result.result?.relevanceScores,
      },
    };
  }

  // ==================== PROJECT OPERATIONS ====================

  /**
   * Create a new project with document structure.
   *
   * @param project
   */
  async createProject(
    project: Omit<ProjectEntity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ProjectEntity> {
    const id = nanoid();
    const now = new Date();

    const fullProject: ProjectEntity = {
      ...project,
      id,
      created_at: now,
      updated_at: now,
    };

    const insertQuery: DatabaseQuery = {
      type: 'insert',
      operation: 'document_insert',
      parameters: {
        collection: 'projects',
        document: fullProject,
      },
      requirements: {
        consistency: 'strong',
        timeout: 30000,
        priority: 'high',
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };

    await this.coordinator.executeQuery(insertQuery);
    return fullProject;
  }

  /**
   * Get project with all related documents.
   *
   * @param projectId
   */
  async getProjectWithDocuments(projectId: string): Promise<{
    project: ProjectEntity;
    documents: {
      visions: VisionDocumentEntity[];
      adrs: ADRDocumentEntity[];
      prds: PRDDocumentEntity[];
      epics: EpicDocumentEntity[];
      features: FeatureDocumentEntity[];
      tasks: TaskDocumentEntity[];
    };
  } | null> {
    // Get project
    const projectQuery: DatabaseQuery = {
      type: 'select',
      operation: 'document_find',
      parameters: {
        collection: 'projects',
        filter: { id: projectId },
      },
      requirements: {
        consistency: 'eventual',
        timeout: 10000,
        priority: 'medium',
      },
      routing: {
        loadBalancing: 'performance_based',
      },
      timestamp: Date.now(),
    };

    const projectResult = await this.coordinator.executeQuery(projectQuery);

    if (!projectResult.result?.documents?.length) {
      return null;
    }

    const project = projectResult.result.documents[0] as ProjectEntity;

    // Get all project documents
    const { documents } = await this.queryDocuments(
      { projectId },
      { includeContent: true, includeRelationships: true }
    );

    // Group documents by type
    const groupedDocuments = {
      visions: documents.filter((d) => d.type === 'vision') as VisionDocumentEntity[],
      adrs: documents.filter((d) => d.type === 'adr') as ADRDocumentEntity[],
      prds: documents.filter((d) => d.type === 'prd') as PRDDocumentEntity[],
      epics: documents.filter((d) => d.type === 'epic') as EpicDocumentEntity[],
      features: documents.filter((d) => d.type === 'feature') as FeatureDocumentEntity[],
      tasks: documents.filter((d) => d.type === 'task') as TaskDocumentEntity[],
    };

    return {
      project,
      documents: groupedDocuments,
    };
  }

  // ==================== WORKFLOW OPERATIONS ====================

  /**
   * Start workflow for document.
   *
   * @param documentId
   * @param workflowName
   * @param initialStage
   */
  async startDocumentWorkflow(
    documentId: string,
    workflowName: string,
    initialStage = 'started'
  ): Promise<DocumentWorkflowStateEntity> {
    const id = nanoid();
    const now = new Date();

    const workflowState: DocumentWorkflowStateEntity = {
      id,
      document_id: documentId,
      workflow_name: workflowName,
      current_stage: initialStage,
      stages_completed: [],
      next_stages: [initialStage],
      started_at: now,
      updated_at: now,
      auto_transitions: true,
      requires_approval: false,
      generated_artifacts: [],
    };

    const insertQuery: DatabaseQuery = {
      type: 'insert',
      operation: 'document_insert',
      parameters: {
        collection: 'document_workflow_states',
        document: workflowState,
      },
      requirements: {
        consistency: 'strong',
        timeout: 30000,
        priority: 'high',
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };

    await this.coordinator.executeQuery(insertQuery);
    return workflowState;
  }

  /**
   * Advance document workflow to next stage.
   *
   * @param documentId
   * @param nextStage
   * @param results
   */
  async advanceDocumentWorkflow(
    documentId: string,
    nextStage: string,
    results?: Record<string, any>
  ): Promise<DocumentWorkflowStateEntity> {
    const existing = await this.getDocumentWorkflowState(documentId);
    if (!existing) {
      throw new Error(`No workflow state found for document: ${documentId}`);
    }

    const updatedState: DocumentWorkflowStateEntity = {
      ...existing,
      current_stage: nextStage,
      stages_completed: [...existing.stages_completed, existing.current_stage],
      updated_at: new Date(),
      workflow_results: results
        ? { ...existing.workflow_results, ...results }
        : existing.workflow_results,
    } as DocumentWorkflowStateEntity;

    const updateQuery: DatabaseQuery = {
      type: 'update',
      operation: 'document_update',
      parameters: {
        collection: 'document_workflow_states',
        filter: { document_id: documentId },
        update: updatedState,
      },
      requirements: {
        consistency: 'strong',
        timeout: 30000,
        priority: 'high',
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };

    await this.coordinator.executeQuery(updateQuery);
    return updatedState;
  }

  private serializeDocument(document: BaseDocumentEntity): any {
    return {
      ...document,
      tags: JSON.stringify(document.tags),
      dependencies: JSON.stringify(document.dependencies),
      related_documents: JSON.stringify(document.related_documents),
      keywords: JSON.stringify(document.keywords),
    };
  }

  private deserializeDocument<T extends BaseDocumentEntity>(data: any): T {
    return {
      ...data,
      tags: JSON.parse(data.tags || '[]'),
      dependencies: JSON.parse(data.dependencies || '[]'),
      related_documents: JSON.parse(data.related_documents || '[]'),
      keywords: JSON.parse(data.keywords || '[]'),
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    } as T;
  }

  private generateChecksum(content: string): string {
    // Simple checksum - in production use proper hashing
    return Buffer.from(content).toString('base64').slice(0, 16);
  }

  private buildQueryFilter(filters: any): any {
    const filter: any = {};

    if (filters.type) {
      if (Array.isArray(filters.type)) {
        filter.type = { $in: filters.type };
      } else {
        filter.type = filters.type;
      }
    }

    if (filters.projectId) {
      filter.project_id = filters.projectId;
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filter.status = { $in: filters.status };
      } else {
        filter.status = filters.status;
      }
    }

    // Add more filter logic as needed

    return filter;
  }

  private buildFullTextSearchQuery(options: DocumentSearchOptions): DatabaseQuery {
    return {
      type: 'select',
      operation: 'fulltext_search',
      parameters: {
        collection: 'documents',
        query: options.query,
        fields: ['title', 'content', 'searchable_content'],
        filters: this.buildSearchFilters(options),
        limit: options.limit || 20,
        offset: options.offset || 0,
      },
      requirements: {
        consistency: 'eventual',
        timeout: 15000,
        priority: 'medium',
        capabilities: ['fulltext_search'],
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };
  }

  private buildSemanticSearchQuery(options: DocumentSearchOptions): DatabaseQuery {
    return {
      type: 'select',
      operation: 'vector_search',
      parameters: {
        collection: 'document_search_index',
        vector: this.encodeSearchQuery(options.query), // Would use embedding service
        limit: options.limit || 20,
        filters: this.buildSearchFilters(options),
      },
      requirements: {
        consistency: 'eventual',
        timeout: 15000,
        priority: 'medium',
        capabilities: ['vector_search'],
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };
  }

  private buildKeywordSearchQuery(options: DocumentSearchOptions): DatabaseQuery {
    return {
      type: 'select',
      operation: 'keyword_search',
      parameters: {
        collection: 'document_search_index',
        keywords: options.query.split(' '),
        filters: this.buildSearchFilters(options),
        limit: options.limit || 20,
        offset: options.offset || 0,
      },
      requirements: {
        consistency: 'eventual',
        timeout: 10000,
        priority: 'medium',
      },
      routing: {
        loadBalancing: 'performance_based',
      },
      timestamp: Date.now(),
    };
  }

  private buildCombinedSearchQuery(options: DocumentSearchOptions): DatabaseQuery {
    return {
      type: 'select',
      operation: 'hybrid_search',
      parameters: {
        collection: 'documents',
        textQuery: options.query,
        vectorQuery: this.encodeSearchQuery(options.query),
        keywordQuery: options.query.split(' '),
        weights: { text: 0.4, vector: 0.4, keyword: 0.2 },
        filters: this.buildSearchFilters(options),
        limit: options.limit || 20,
        offset: options.offset || 0,
      },
      requirements: {
        consistency: 'eventual',
        timeout: 20000,
        priority: 'medium',
        capabilities: ['fulltext_search', 'vector_search'],
      },
      routing: {
        loadBalancing: 'capability_based',
      },
      timestamp: Date.now(),
    };
  }

  private buildSearchFilters(options: DocumentSearchOptions): any {
    const filters: any = {};

    if (options.documentTypes?.length) {
      filters.document_type = { $in: options.documentTypes };
    }

    if (options.projectId) {
      filters.project_id = options.projectId;
    }

    if (options.status?.length) {
      filters.status = { $in: options.status };
    }

    if (options.priority?.length) {
      filters.priority = { $in: options.priority };
    }

    if (options.dateRange) {
      filters[options.dateRange.field] = {
        $gte: options.dateRange.start,
        $lte: options.dateRange.end,
      };
    }

    return filters;
  }

  private encodeSearchQuery(_query: string): number[] {
    // Placeholder - would use actual embedding service
    return new Array(768).fill(0).map(() => Math.random() - 0.5);
  }

  // Placeholder methods for relationship and workflow operations
  private async generateDocumentRelationships(_document: BaseDocumentEntity): Promise<void> {
    // Implementation would analyze document content and create relationships
  }

  private async getDocumentRelationships(
    _documentId: string
  ): Promise<DocumentRelationshipEntity[]> {
    // Implementation would query relationships table
    return [];
  }

  private async getDocumentWorkflowState(
    _documentId: string
  ): Promise<DocumentWorkflowStateEntity | null> {
    // Implementation would query workflow states table
    return null;
  }

  private async generateSearchIndex(_document: BaseDocumentEntity): Promise<void> {
    // Implementation would create search index entry
  }

  private async updateSearchIndex(_document: BaseDocumentEntity): Promise<void> {
    // Implementation would update search index
  }

  private async updateDocumentRelationships(_document: BaseDocumentEntity): Promise<void> {
    // Implementation would update relationships based on content changes
  }

  private async deleteDocumentRelationships(_documentId: string): Promise<void> {
    // Implementation would delete all relationships for document
  }

  private async deleteDocumentWorkflowState(_documentId: string): Promise<void> {
    // Implementation would delete workflow state
  }

  private async deleteSearchIndex(_documentId: string): Promise<void> {
    // Implementation would delete search index entry
  }
}
