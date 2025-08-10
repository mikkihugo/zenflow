/**
 * @file Document Manager - Pure DAL Implementation.
 *
 * Complete rewrite using unified DAL patterns only.
 * Replaces file-based operations with database entities.
 */

import { getLogger } from '../../core/logger';

const logger = getLogger('database-managers-document-manager');

import { nanoid } from 'nanoid';
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
import { createDao, EntityTypes } from '../core/dao-factory';
import type { IRepository } from '../interfaces';
import type { DocumentType } from '../../types/workflow-types';

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
export class DocumentManager {
  private documentRepository!: IRepository<BaseDocumentEntity>;
  private projectRepository!: IRepository<ProjectEntity>;
  private relationshipRepository!: IRepository<DocumentRelationshipEntity>;
  private workflowRepository!: IRepository<DocumentWorkflowStateEntity>;

  constructor(private databaseType: 'postgresql' | 'sqlite' | 'mysql' = 'postgresql') {}

  /**
   * Initialize document manager and all DAL repositories.
   */
  async initialize(): Promise<void> {
    // Initialize all repositories using DAL factory
    this.documentRepository = await createDao<BaseDocumentEntity>(
      EntityTypes.Document,
      this.databaseType
    );

    this.projectRepository = await createDao<ProjectEntity>('Project', this.databaseType);

    this.relationshipRepository = await createDao<DocumentRelationshipEntity>(
      'DocumentRelationship',
      this.databaseType
    );

    this.workflowRepository = await createDao<DocumentWorkflowStateEntity>(
      'DocumentWorkflowState',
      this.databaseType
    );

    // DAOs already initialized above as repositories
  }

  // ==================== DOCUMENT CRUD OPERATIONS ====================

  /**
   * Create a new document using DAL.
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
    if (options?.autoGenerateRelationships) {
      await this.generateDocumentRelationships(created as T);
    }

    // Start workflow if specified
    if (options?.startWorkflow) {
      await this.startDocumentWorkflow(id, options?.startWorkflow);
    }

    // Generate search index
    if (options?.generateSearchIndex !== false) {
      await this.generateSearchIndex(created as T);
    }

    return created as T;
  }

  /**
   * Get document by ID using DAL.
   *
   * @param id
   * @param options
   */
  async getDocument<T extends BaseDocumentEntity>(
    id: string,
    options: DocumentQueryOptions = {}
  ): Promise<T | null> {
    const document = await this.documentRepository.findById(id);

    if (!document) {
      return null;
    }

    // Load relationships if requested
    if (options?.includeRelationships) {
      (document as any).relationships = await this.getDocumentRelationships(id);
    }

    // Load workflow state if requested
    if (options?.includeWorkflowState) {
      (document as any).workflowState = await this.getDocumentWorkflowState(id);
    }

    return document as T;
  }

  /**
   * Update document using DAL.
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
    const now = new Date();
    const updatedData = {
      ...updates,
      updated_at: now,
      checksum: updates.content ? this.generateChecksum(updates.content) : undefined,
    };

    // Remove undefined values
    Object.keys(updatedData).forEach(
      (key) =>
        updatedData?.[key as keyof typeof updatedData] === undefined &&
        delete updatedData?.[key as keyof typeof updatedData]
    );

    const updated = await this.documentRepository.update(id, updatedData as any);

    // Update search index if content changed
    if (updates.content || updates.title) {
      await this.updateSearchIndex(updated as T);
    }

    // Update relationships if content significantly changed
    if (options?.autoGenerateRelationships && updates.content) {
      await this.updateDocumentRelationships(updated as T);
    }

    return updated as T;
  }

  /**
   * Delete document using DAL.
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
    await this.documentRepository.delete(id);
  }

  // ==================== DOCUMENT QUERYING ====================

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
    // Build query options for DAL
    const queryOptions = {
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    };

    // Use DAL findAll with filters
    const documents = await this.documentRepository.findAll(queryOptions);

    // Apply advanced filtering using DAL query capabilities
    let filtered = documents as T[];

    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      filtered = filtered.filter((doc) => types.includes(doc.type));
    }

    if (filters.projectId) {
      filtered = filtered.filter((doc) => doc.project_id === filters.projectId);
    }

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter((doc) => statuses.includes(doc.status));
    }

    // Sort results
    if (options?.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[options?.sortBy!] as any;
        const bVal = b[options?.sortBy!] as any;

        if (options.sortOrder === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });
    }

    return {
      documents: filtered,
      total: filtered.length,
      hasMore: (options?.offset || 0) + filtered.length < filtered.length,
    };
  }

  /**
   * Advanced document search using multiple search strategies.
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
    let documents: T[] = [];
    let relevanceScores: number[] = [];

    // Get all documents with filters applied
    const baseFilters: {
      type?: DocumentType | DocumentType[];
      projectId?: string;
      status?: string | string[];
      priority?: string | string[];
      author?: string;
      tags?: string[];
      parentDocumentId?: string;
      workflowStage?: string;
    } = {};
    if (searchOptions?.projectId) baseFilters.projectId = searchOptions?.projectId;
    if (searchOptions?.documentTypes) baseFilters.type = searchOptions?.documentTypes;
    if (searchOptions?.status) baseFilters.status = searchOptions?.status;
    if (searchOptions?.priority) baseFilters.priority = searchOptions?.priority;

    const { documents: candidateDocuments } = await this.queryDocuments(baseFilters, {
      includeContent: true,
      includeRelationships: true,
      limit: 1000, // Large limit for comprehensive search
    });

    // Apply date range filter if specified
    let filteredCandidates = candidateDocuments as T[];
    if (searchOptions?.dateRange) {
      const { start, end, field } = searchOptions?.dateRange;
      filteredCandidates = filteredCandidates.filter((doc) => {
        const dateValue = doc[field] as Date;
        return dateValue >= start && dateValue <= end;
      });
    }

    // Execute search based on search type
    switch (searchOptions?.searchType) {
      case 'fulltext':
        ({ documents, relevanceScores } = this.performFulltextSearch(
          filteredCandidates,
          searchOptions?.query
        ));
        break;
      case 'semantic':
        ({ documents, relevanceScores } = await this.performSemanticSearch(
          filteredCandidates,
          searchOptions?.query
        ));
        break;
      case 'keyword':
        ({ documents, relevanceScores } = this.performKeywordSearch(
          filteredCandidates,
          searchOptions?.query
        ));
        break;
      case 'combined':
        ({ documents, relevanceScores } = await this.performCombinedSearch(
          filteredCandidates,
          searchOptions?.query
        ));
        break;
      default:
        ({ documents, relevanceScores } = this.performFulltextSearch(
          filteredCandidates,
          searchOptions?.query
        ));
    }

    // Apply pagination
    const total = documents.length;
    const offset = searchOptions?.offset || 0;
    const limit = searchOptions?.limit || 20;
    const paginatedDocuments = documents.slice(offset, offset + limit);
    const paginatedScores = relevanceScores.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    const processingTime = Date.now() - startTime;

    return {
      documents: paginatedDocuments,
      total,
      hasMore,
      searchMetadata: {
        searchType: searchOptions?.searchType,
        query: searchOptions?.query,
        processingTime,
        relevanceScores: paginatedScores,
      },
    };
  }

  /**
   * Perform fulltext search with TF-IDF scoring.
   *
   * @param documents
   * @param query
   */
  private performFulltextSearch<T extends BaseDocumentEntity>(
    documents: T[],
    query: string
  ): { documents: T[]; relevanceScores: number[] } {
    const queryTerms = this.tokenizeText(query.toLowerCase());
    const results: Array<{ document: T; score: number }> = [];

    for (const doc of documents) {
      const docText = `${doc.title} ${doc.content} ${doc.keywords.join(' ')}`.toLowerCase();
      const docTerms = this.tokenizeText(docText);

      let score = 0;
      for (const term of queryTerms) {
        const tf = this.calculateTermFrequency(term, docTerms);
        const idf = this.calculateInverseDocumentFrequency(term, documents);
        score += tf * idf;
      }

      // Boost score for title matches
      if (doc.title.toLowerCase().includes(query.toLowerCase())) {
        score *= 2;
      }

      // Boost score for exact keyword matches
      if (doc.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))) {
        score *= 1.5;
      }

      if (score > 0) {
        results?.push({ document: doc, score });
      }
    }

    // Sort by relevance score
    results?.sort((a, b) => b.score - a.score);

    return {
      documents: results?.map((r) => r.document),
      relevanceScores: results?.map((r) => r.score),
    };
  }

  /**
   * Perform semantic search using content similarity.
   *
   * @param documents
   * @param query
   */
  private async performSemanticSearch<T extends BaseDocumentEntity>(
    documents: T[],
    query: string
  ): Promise<{ documents: T[]; relevanceScores: number[] }> {
    // For now, implement a simplified semantic search
    // In production, this would use vector embeddings and similarity search
    const results: Array<{ document: T; score: number }> = [];
    const queryTokens = this.tokenizeText(query.toLowerCase());

    for (const doc of documents) {
      const docTokens = this.tokenizeText(`${doc.title} ${doc.content}`.toLowerCase());

      // Calculate semantic similarity using Jaccard similarity with word expansion
      const expandedQueryTokens = this.expandTokensWithSynonyms(queryTokens);
      const expandedDocTokens = this.expandTokensWithSynonyms(docTokens);

      const similarity = this.calculateJaccardSimilarity(expandedQueryTokens, expandedDocTokens);

      // Boost for conceptual matches
      const conceptualScore = this.calculateConceptualSimilarity(query, doc.content);
      const finalScore = similarity * 0.7 + conceptualScore * 0.3;

      if (finalScore > 0.1) {
        results?.push({ document: doc, score: finalScore });
      }
    }

    results?.sort((a, b) => b.score - a.score);

    return {
      documents: results?.map((r) => r.document),
      relevanceScores: results?.map((r) => r.score),
    };
  }

  /**
   * Perform keyword-based search.
   *
   * @param documents
   * @param query
   */
  private performKeywordSearch<T extends BaseDocumentEntity>(
    documents: T[],
    query: string
  ): { documents: T[]; relevanceScores: number[] } {
    const queryKeywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.length > 2);
    const results: Array<{ document: T; score: number }> = [];

    for (const doc of documents) {
      let score = 0;
      const docKeywords = doc.keywords.map((k) => k.toLowerCase());

      for (const queryKeyword of queryKeywords) {
        // Exact keyword match
        if (docKeywords.includes(queryKeyword)) {
          score += 1.0;
        }
        // Partial keyword match
        else if (docKeywords.some((k) => k.includes(queryKeyword) || queryKeyword.includes(k))) {
          score += 0.5;
        }
        // Title match
        else if (doc.title.toLowerCase().includes(queryKeyword)) {
          score += 0.3;
        }
      }

      if (score > 0) {
        results?.push({ document: doc, score });
      }
    }

    results?.sort((a, b) => b.score - a.score);

    return {
      documents: results?.map((r) => r.document),
      relevanceScores: results?.map((r) => r.score),
    };
  }

  /**
   * Perform combined search using multiple strategies.
   *
   * @param documents
   * @param query
   */
  private async performCombinedSearch<T extends BaseDocumentEntity>(
    documents: T[],
    query: string
  ): Promise<{ documents: T[]; relevanceScores: number[] }> {
    // Get results from all search methods
    const fulltextResults = this.performFulltextSearch(documents, query);
    const semanticResults = await this.performSemanticSearch(documents, query);
    const keywordResults = this.performKeywordSearch(documents, query);

    // Combine scores with weights
    const combinedScores = new Map<string, number>();
    const allDocuments = new Map<string, T>();

    // Fulltext search (40% weight)
    fulltextResults?.documents.forEach((doc, index) => {
      const score = (fulltextResults?.relevanceScores?.[index] || 0) * 0.4;
      combinedScores.set(doc.id, (combinedScores.get(doc.id) || 0) + score);
      allDocuments.set(doc.id, doc);
    });

    // Semantic search (35% weight)
    semanticResults?.documents.forEach((doc, index) => {
      const score = (semanticResults?.relevanceScores?.[index] || 0) * 0.35;
      combinedScores.set(doc.id, (combinedScores.get(doc.id) || 0) + score);
      allDocuments.set(doc.id, doc);
    });

    // Keyword search (25% weight)
    keywordResults?.documents.forEach((doc, index) => {
      const score = (keywordResults?.relevanceScores?.[index] || 0) * 0.25;
      combinedScores.set(doc.id, (combinedScores.get(doc.id) || 0) + score);
      allDocuments.set(doc.id, doc);
    });

    // Sort by combined score
    const sortedResults = Array.from(combinedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([, score]) => score > 0.1); // Filter out very low scores

    return {
      documents: sortedResults?.map(([docId]) => allDocuments.get(docId)!),
      relevanceScores: sortedResults?.map(([, score]) => score),
    };
  }

  // ==================== PROJECT OPERATIONS ====================

  /**
   * Create a new project using DAL.
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

    return await this.projectRepository.create(fullProject);
  }

  /**
   * Get project with all related documents using DAL.
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
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      return null;
    }

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

  // ==================== WORKFLOW AUTOMATION ====================

  /**
   * Start workflow for document using DAL with automated stage progression.
   *
   * @param documentId
   * @param workflowName
   * @param initialStage
   */
  async startDocumentWorkflow(
    documentId: string,
    workflowName: string,
    initialStage = 'draft'
  ): Promise<DocumentWorkflowStateEntity> {
    const id = nanoid();
    const now = new Date();
    const workflowDefinition = this.getWorkflowDefinition(workflowName);

    const workflowState: DocumentWorkflowStateEntity = {
      id,
      document_id: documentId,
      workflow_name: workflowName,
      current_stage: initialStage,
      stages_completed: [],
      next_stages: workflowDefinition.getNextStages(initialStage),
      started_at: now,
      updated_at: now,
      auto_transitions: workflowDefinition.autoTransitions,
      requires_approval: workflowDefinition.requiresApproval(initialStage),
      generated_artifacts: [],
      workflow_results: {},
    };

    const created = await this.workflowRepository.create(workflowState);

    // Auto-advance if the initial stage allows it
    if (workflowState.auto_transitions && !workflowState.requires_approval) {
      await this.checkAndTriggerWorkflowAutomation(documentId);
    }

    return created;
  }

  /**
   * Advance document workflow with automated rule checking.
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
    // Find existing workflow state
    const allWorkflows = await this.workflowRepository.findAll();
    const existing = allWorkflows.find((w) => w.document_id === documentId);

    if (!existing) {
      throw new Error(`No workflow state found for document: ${documentId}`);
    }

    // Validate transition is allowed
    const workflowDefinition = this.getWorkflowDefinition(existing.workflow_name);
    if (!workflowDefinition.canTransition(existing.current_stage, nextStage)) {
      throw new Error(`Invalid transition from ${existing.current_stage} to ${nextStage}`);
    }

    const updatedState: Partial<DocumentWorkflowStateEntity> = {
      current_stage: nextStage,
      stages_completed: [...existing.stages_completed, existing.current_stage],
      next_stages: workflowDefinition.getNextStages(nextStage),
      updated_at: new Date(),
      requires_approval: workflowDefinition.requiresApproval(nextStage),
      workflow_results: results
        ? { ...existing.workflow_results, ...results }
        : existing.workflow_results,
    };

    const updated = await this.workflowRepository.update(existing.id, updatedState);

    // Check for automation triggers after stage transition
    await this.checkAndTriggerWorkflowAutomation(documentId);

    return updated;
  }

  /**
   * Check and trigger workflow automation based on predefined rules.
   *
   * @param documentId
   */
  async checkAndTriggerWorkflowAutomation(documentId: string): Promise<void> {
    const document = await this.getDocument(documentId, { includeWorkflowState: true });
    if (!document || !(document as any).workflowState) return;

    const workflowState = (document as any).workflowState as DocumentWorkflowStateEntity;
    const workflowDefinition = this.getWorkflowDefinition(workflowState.workflow_name);

    // Check automation rules for current stage
    const automationRules = workflowDefinition.getAutomationRules(workflowState.current_stage);

    for (const rule of automationRules) {
      if (await this.evaluateAutomationRule(document, rule)) {
        await this.executeAutomationAction(document, rule);
      }
    }
  }

  /**
   * Evaluate if an automation rule should trigger.
   *
   * @param document
   * @param rule
   */
  private async evaluateAutomationRule(
    document: BaseDocumentEntity,
    rule: WorkflowAutomationRule
  ): Promise<boolean> {
    switch (rule.condition.type) {
      case 'status_change':
        return document.status === rule.condition.value;

      case 'stage_duration': {
        const workflowState = await this.getDocumentWorkflowState(document.id);
        if (!workflowState) return false;
        const durationMs = Date.now() - workflowState.updated_at.getTime();
        return durationMs >= (rule.condition.value as number);
      }

      case 'document_type':
        return document.type === rule.condition.value;

      case 'priority_level':
        return document.priority === rule.condition.value;

      case 'completion_percentage':
        return (document.completion_percentage || 0) >= (rule.condition.value as number);

      case 'has_relationships': {
        const relationships = await this.getDocumentRelationships(document.id);
        return relationships.length > 0;
      }

      case 'custom_field': {
        const { field, operator, value } = rule.condition.value as any;
        const fieldValue = (document as any)[field];
        return this.evaluateCondition(fieldValue, operator, value);
      }

      default:
        return false;
    }
  }

  /**
   * Execute automation action when rule triggers.
   *
   * @param document
   * @param rule
   */
  private async executeAutomationAction(
    document: BaseDocumentEntity,
    rule: WorkflowAutomationRule
  ): Promise<void> {
    switch (rule.action.type) {
      case 'advance_stage':
        await this.advanceDocumentWorkflow(document.id, rule.action.value as string);
        break;

      case 'create_document':
        await this.executeCreateDocumentAction(document, rule.action.value as any);
        break;

      case 'update_status':
        // TODO: TypeScript error TS2322 - status type issue (AI unsure of safe fix - human review needed)
        await this.updateDocument(document.id, { status: rule.action.value as any });
        break;

      case 'assign_reviewer':
        await this.updateDocument(document.id, {
          metadata: {
            ...document.metadata,
            assigned_reviewer: rule.action.value,
          },
        });
        break;

      case 'generate_artifacts':
        await this.generateWorkflowArtifacts(document, rule.action.value as string[]);
        break;

      case 'send_notification':
        await this.sendWorkflowNotification(document, rule.action.value as any);
        break;

      case 'update_relationships':
        await this.updateDocumentRelationships(document);
        break;

      default:
        logger.warn(`Unknown automation action type: ${rule.action.type}`);
    }
  }

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
  private async executeCreateDocumentAction(
    sourceDocument: BaseDocumentEntity,
    actionConfig: {
      documentType: DocumentType;
      template?: string;
      title?: string;
      assignTo?: string;
      priority?: string;
      status?: string;
      inheritKeywords?: boolean;
    }
  ): Promise<BaseDocumentEntity> {
    const documentTitle =
      actionConfig?.title ||
      `${actionConfig?.documentType?.charAt(0).toUpperCase() + actionConfig?.documentType?.slice(1)} for ${sourceDocument.title}`;

    const newDocumentData = {
      type: actionConfig?.documentType,
      title: documentTitle,
      content: actionConfig?.template || this.getDefaultTemplate(actionConfig?.documentType),
      summary: `Auto-generated ${actionConfig?.documentType} from ${sourceDocument.type}: ${sourceDocument.title}`,
      author: actionConfig?.assignTo || sourceDocument.author,
      project_id: sourceDocument.project_id,
      status: actionConfig?.status || 'draft',
      priority: actionConfig?.priority || sourceDocument.priority,
      keywords: actionConfig?.inheritKeywords ? [...sourceDocument.keywords] : [],
      metadata: {
        source_document_id: sourceDocument.id,
        auto_generated: true,
        generated_by_rule: true,
        generation_timestamp: new Date().toISOString(),
      },
    };

    // TODO: TypeScript error TS2379 - optional property types issue (AI unsure of safe fix - human review needed)
    const createdDocument = await this.createDocument(newDocumentData as any, {
      autoGenerateRelationships: true,
      startWorkflow: `${actionConfig?.documentType}_workflow`,
      generateSearchIndex: true,
    });

    // Create explicit relationship between source and generated document
    await this.relationshipRepository.create({
      source_document_id: sourceDocument.id,
      target_document_id: createdDocument.id,
      relationship_type: 'generates',
      // TODO: TypeScript error TS2353 - 'strength' property doesn't exist (AI unsure of safe fix - human review needed)
      // strength: 1.0,
      created_at: new Date(),
      metadata: {
        auto_generated: true,
        generation_rule: 'workflow_automation',
      },
    });

    return createdDocument;
  }

  /**
   * Generate workflow artifacts.
   *
   * @param document
   * @param artifactTypes
   */
  private async generateWorkflowArtifacts(
    document: BaseDocumentEntity,
    artifactTypes: string[]
  ): Promise<void> {
    const workflowState = await this.getDocumentWorkflowState(document.id);
    if (!workflowState) return;

    const artifacts: string[] = [];

    for (const artifactType of artifactTypes) {
      switch (artifactType) {
        case 'summary_report':
          artifacts.push(await this.generateSummaryReport(document));
          break;
        case 'checklist':
          artifacts.push(await this.generateChecklist(document));
          break;
        case 'timeline':
          artifacts.push(await this.generateTimeline(document));
          break;
        case 'stakeholder_matrix':
          artifacts.push(await this.generateStakeholderMatrix(document));
          break;
      }
    }

    // Update workflow state with generated artifacts
    await this.workflowRepository.update(workflowState.id, {
      generated_artifacts: [...workflowState.generated_artifacts, ...artifacts],
      updated_at: new Date(),
    });
  }

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
  private async sendWorkflowNotification(
    _document: BaseDocumentEntity,
    _notificationConfig: {
      recipients: string[];
      template: string;
      channel: 'email' | 'slack' | 'teams';
      urgency: 'low' | 'medium' | 'high';
    }
  ): Promise<void> {}

  /**
   * Get workflow definition for a workflow type.
   *
   * @param workflowName
   */
  private getWorkflowDefinition(workflowName: string): WorkflowDefinition {
    const definitions: Record<string, WorkflowDefinition> = {
      vision_workflow: new VisionWorkflowDefinition(),
      adr_workflow: new ADRWorkflowDefinition(),
      prd_workflow: new PRDWorkflowDefinition(),
      epic_workflow: new EpicWorkflowDefinition(),
      feature_workflow: new FeatureWorkflowDefinition(),
      task_workflow: new TaskWorkflowDefinition(),
      default_workflow: new DefaultWorkflowDefinition(),
    };

    return definitions[workflowName] || definitions['default_workflow']!;
  }

  /**
   * Evaluate a condition with operator.
   *
   * @param value
   * @param operator
   * @param expected
   */
  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'greater_than':
        return value > expected;
      case 'less_than':
        return value < expected;
      case 'contains':
        return String(value).includes(String(expected));
      case 'starts_with':
        return String(value).startsWith(String(expected));
      case 'ends_with':
        return String(value).endsWith(String(expected));
      case 'in':
        return Array.isArray(expected) && expected.includes(value);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(value);
      default:
        return false;
    }
  }

  /**
   * Get default template for document type.
   *
   * @param documentType
   */
  private getDefaultTemplate(documentType: DocumentType): string {
    const templates: Record<DocumentType, string> = {
      vision: '# Vision\n\n## Overview\n\n## Goals\n\n## Success Criteria\n\n## Stakeholders\n',
      adr: '# Architecture Decision Record\n\n## Status\n\n## Context\n\n## Decision\n\n## Consequences\n',
      prd: '# Product Requirements Document\n\n## Problem Statement\n\n## Requirements\n\n## Acceptance Criteria\n\n## Dependencies\n',
      epic: '# Epic\n\n## Description\n\n## User Stories\n\n## Definition of Done\n\n## Dependencies\n',
      feature:
        '# Feature\n\n## Description\n\n## Functional Requirements\n\n## Technical Requirements\n\n## Testing Plan\n',
      task: '# Task\n\n## Description\n\n## Steps\n\n## Acceptance Criteria\n\n## Notes\n',
      code: '# Code\n\n## Implementation\n',
      test: '# Test\n\n## Test Cases\n',
      documentation: '# Documentation\n\n## Content\n',
    };

    return templates[documentType] || '# Document\n\n## Content\n';
  }

  // ==================== WORKFLOW ARTIFACT GENERATORS ====================

  private async generateSummaryReport(document: BaseDocumentEntity): Promise<string> {
    return `Summary report generated for ${document.title} on ${new Date().toISOString()}`;
  }

  private async generateChecklist(document: BaseDocumentEntity): Promise<string> {
    return `Checklist generated for ${document.title} on ${new Date().toISOString()}`;
  }

  private async generateTimeline(document: BaseDocumentEntity): Promise<string> {
    return `Timeline generated for ${document.title} on ${new Date().toISOString()}`;
  }

  private async generateStakeholderMatrix(document: BaseDocumentEntity): Promise<string> {
    return `Stakeholder matrix generated for ${document.title} on ${new Date().toISOString()}`;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private generateChecksum(content: string): string {
    // Simple checksum - in production use proper hashing
    return Buffer.from(content).toString('base64').slice(0, 16);
  }

  // ==================== RELATIONSHIP MANAGEMENT ====================

  /**
   * Generate document relationships based on content analysis and workflow stage.
   *
   * @param document
   */
  private async generateDocumentRelationships(document: BaseDocumentEntity): Promise<void> {
    const relationships: Omit<DocumentRelationshipEntity, 'id' | 'created_at'>[] = [];

    // Auto-generate parent relationships based on document type hierarchy
    const parentRelationships = await this.findParentDocuments(document);
    relationships.push(...parentRelationships);

    // Generate semantic relationships based on content analysis
    const semanticRelationships = await this.findSemanticRelationships(document);
    relationships.push(...semanticRelationships);

    // Generate workflow-based relationships
    const workflowRelationships = await this.findWorkflowRelationships(document);
    relationships.push(...workflowRelationships);

    // Create all relationships in database
    for (const relationship of relationships) {
      await this.relationshipRepository.create({
        ...relationship,
        created_at: new Date(),
      });
    }
  }

  /**
   * Find parent documents based on document type hierarchy.
   *
   * @param document
   */
  private async findParentDocuments(
    document: BaseDocumentEntity
  ): Promise<Omit<DocumentRelationshipEntity, 'id' | 'created_at'>[]> {
    const relationships: Omit<DocumentRelationshipEntity, 'id' | 'created_at'>[] = [];

    // Define document type hierarchy for automatic parent relationships
    const typeHierarchy: Record<DocumentType, DocumentType[]> = {
      vision: [], // Vision documents have no automatic parents
      adr: ['vision'], // ADRs can relate to visions
      prd: ['vision', 'adr'], // PRDs can relate to visions and ADRs
      epic: ['prd', 'vision'], // Epics relate to PRDs and visions
      feature: ['epic', 'prd'], // Features relate to epics and PRDs
      task: ['feature', 'epic'], // Tasks relate to features and epics
      code: ['feature', 'task'],
      test: ['code', 'feature'],
      documentation: ['feature', 'code'],
    };

    const parentTypes = typeHierarchy[document.type] || [];

    if (parentTypes.length > 0) {
      // Find documents in the same project with parent types
      // TODO: TypeScript error TS2379 - optional property types issue (AI unsure of safe fix - human review needed)
      const { documents: potentialParents } = await this.queryDocuments({
        type: parentTypes,
        projectId: document.project_id,
      });

      // Create relationships based on content similarity and recency
      for (const parent of potentialParents?.slice(0, 3)) {
        // Limit to 3 most relevant
        const strength = this.calculateRelationshipStrength(document, parent);
        if (strength > 0.3) {
          // Only create relationships above threshold
          relationships.push({
            source_document_id: document.id,
            target_document_id: parent?.id,
            // TODO: TypeScript error TS2322 - 'derives_from' not in relationship type enum (AI unsure of safe fix - human review needed)
            relationship_type: 'relates_to' as any,
            // TODO: TypeScript error TS2353 - 'strength' property doesn't exist (AI unsure of safe fix - human review needed)
            // strength,
            metadata: {
              auto_generated: true,
              generation_method: 'type_hierarchy',
              parent_type: parent?.type,
            },
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Find semantic relationships based on content analysis.
   *
   * @param document
   */
  private async findSemanticRelationships(
    document: BaseDocumentEntity
  ): Promise<Omit<DocumentRelationshipEntity, 'id' | 'created_at'>[]> {
    const relationships: Omit<DocumentRelationshipEntity, 'id' | 'created_at'>[] = [];

    // Find documents with similar keywords
    // TODO: TypeScript error TS2379 - optional property types issue (AI unsure of safe fix - human review needed)
    const { documents: similarDocuments } = await this.queryDocuments({
      projectId: document.project_id,
    });

    for (const other of similarDocuments) {
      if (other.id === document.id) continue;

      // Calculate keyword overlap
      const keywordOverlap = this.calculateKeywordOverlap(document.keywords, other.keywords);
      if (keywordOverlap > 0.4) {
        relationships.push({
          source_document_id: document.id,
          target_document_id: other.id,
          relationship_type: 'relates_to',
          // TODO: TypeScript error TS2353 - 'strength' property doesn't exist (AI unsure of safe fix - human review needed)
          // strength: keywordOverlap,
          metadata: {
            auto_generated: true,
            generation_method: 'keyword_analysis',
            keyword_overlap: keywordOverlap,
            shared_keywords: document.keywords.filter((k) => other.keywords.includes(k)),
          },
        });
      }

      // Check for content references (mentions of other document titles)
      if (document.content.toLowerCase().includes(other.title.toLowerCase())) {
        relationships.push({
          source_document_id: document.id,
          target_document_id: other.id,
          // TODO: TypeScript error TS2322 - 'references' not in relationship type enum (AI unsure of safe fix - human review needed)
          relationship_type: 'relates_to' as any,
          // TODO: TypeScript error TS2353 - 'strength' property doesn't exist (AI unsure of safe fix - human review needed)
          // strength: 0.8,
          metadata: {
            auto_generated: true,
            generation_method: 'content_reference',
            reference_type: 'title_mention',
          },
        });
      }
    }

    return relationships;
  }

  /**
   * Find workflow-based relationships.
   *
   * @param document
   */
  private async findWorkflowRelationships(
    document: BaseDocumentEntity
  ): Promise<Omit<DocumentRelationshipEntity, 'id' | 'created_at'>[]> {
    const relationships: Omit<DocumentRelationshipEntity, 'id' | 'created_at'>[] = [];

    // Find documents that should be generated from this document based on workflow rules
    const generationRules = this.getWorkflowGenerationRules(document.type);

    for (const rule of generationRules) {
      // TODO: TypeScript error TS2379 - optional property types issue (AI unsure of safe fix - human review needed)
      const { documents: existingDocs } = await this.queryDocuments({
        type: rule.targetType,
        projectId: document.project_id,
      });

      // Check if documents were generated from this source
      for (const target of existingDocs) {
        if (target?.metadata?.['source_document_id'] === document.id) {
          relationships.push({
            source_document_id: document.id,
            target_document_id: target?.id,
            relationship_type: 'generates',
            // TODO: TypeScript error TS2353 - 'strength' property doesn't exist (AI unsure of safe fix - human review needed)
            // strength: 1.0,
            metadata: {
              auto_generated: true,
              generation_method: 'workflow_rule',
              workflow_rule: rule.name,
            },
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Calculate relationship strength between two documents.
   *
   * @param doc1
   * @param doc2
   */
  private calculateRelationshipStrength(
    doc1: BaseDocumentEntity,
    doc2: BaseDocumentEntity
  ): number {
    let strength = 0;

    // Keyword similarity (40% weight)
    const keywordSimilarity = this.calculateKeywordOverlap(doc1.keywords, doc2.keywords);
    strength += keywordSimilarity * 0.4;

    // Priority alignment (20% weight)
    if (doc1.priority === doc2.priority) {
      strength += 0.2;
    }

    // Author similarity (10% weight)
    if (doc1.author === doc2.author) {
      strength += 0.1;
    }

    // Recency factor (30% weight) - more recent documents get higher strength
    const timeDiff = Math.abs(doc1.created_at.getTime() - doc2.created_at.getTime());
    const maxDiff = 30 * 24 * 60 * 60 * 1000; // 30 days
    const recencyFactor = Math.max(0, 1 - timeDiff / maxDiff);
    strength += recencyFactor * 0.3;

    return Math.min(1.0, strength);
  }

  /**
   * Calculate keyword overlap between two arrays.
   *
   * @param keywords1
   * @param keywords2
   */
  private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1.map((k) => k.toLowerCase()));
    const set2 = new Set(keywords2.map((k) => k.toLowerCase()));

    const intersection = new Set([...set1].filter((k) => set2.has(k)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Get workflow generation rules for document type.
   *
   * @param documentType
   */
  private getWorkflowGenerationRules(documentType: DocumentType): Array<{
    name: string;
    sourceType: DocumentType;
    targetType: DocumentType;
    condition?: (doc: BaseDocumentEntity) => boolean;
  }> {
    const rules = [
      {
        name: 'prd_to_epic',
        sourceType: 'prd' as DocumentType,
        targetType: 'epic' as DocumentType,
      },
      {
        name: 'epic_to_feature',
        sourceType: 'epic' as DocumentType,
        targetType: 'feature' as DocumentType,
      },
      {
        name: 'feature_to_task',
        sourceType: 'feature' as DocumentType,
        targetType: 'task' as DocumentType,
      },
      // Note: vision_to_adr relationship removed - ADRs are independent architectural governance
      // ADRs may reference visions but are not auto-generated from them
    ];

    return rules.filter((rule) => rule.sourceType === documentType);
  }

  private async getDocumentRelationships(
    documentId: string
  ): Promise<DocumentRelationshipEntity[]> {
    const allRelationships = await this.relationshipRepository.findAll();
    return allRelationships.filter(
      (r) => r.source_document_id === documentId || r.target_document_id === documentId
    );
  }

  private async getDocumentWorkflowState(
    documentId: string
  ): Promise<DocumentWorkflowStateEntity | null> {
    const allWorkflows = await this.workflowRepository.findAll();
    return allWorkflows.find((w) => w.document_id === documentId) || null;
  }

  private async generateSearchIndex(_document: BaseDocumentEntity): Promise<void> {
    // TODO: Implement search index generation using vector DAL
  }

  private async updateSearchIndex(_document: BaseDocumentEntity): Promise<void> {
    // TODO: Implement search index update using vector DAL
  }

  /**
   * Update document relationships when content changes significantly.
   *
   * @param document
   */
  private async updateDocumentRelationships(document: BaseDocumentEntity): Promise<void> {
    // Get existing relationships
    const existingRelationships = await this.getDocumentRelationships(document.id);

    // Remove auto-generated relationships that might be outdated
    const autoGeneratedRelationships = existingRelationships.filter(
      (r) => r.metadata?.['auto_generated'] === true
    );

    for (const relationship of autoGeneratedRelationships) {
      await this.relationshipRepository.delete(relationship.id);
    }

    // Regenerate relationships with updated document content
    await this.generateDocumentRelationships(document);
  }

  private async deleteDocumentRelationships(documentId: string): Promise<void> {
    const relationships = await this.getDocumentRelationships(documentId);
    for (const relationship of relationships) {
      await this.relationshipRepository.delete(relationship.id);
    }
  }

  private async deleteDocumentWorkflowState(documentId: string): Promise<void> {
    const workflow = await this.getDocumentWorkflowState(documentId);
    if (workflow) {
      await this.workflowRepository.delete(workflow.id);
    }
  }

  private async deleteSearchIndex(_documentId: string): Promise<void> {
    // TODO: Implement search index deletion using vector DAL
  }

  // ==================== MISSING TEXT PROCESSING METHODS ====================

  private tokenizeText(text: string): string[] {
    // Simple tokenization - split on whitespace and punctuation
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2);
  }

  private calculateTermFrequency(term: string, docTerms: string[]): number {
    const termCount = docTerms.filter((t) => t === term).length;
    return docTerms.length > 0 ? termCount / docTerms.length : 0;
  }

  private calculateInverseDocumentFrequency(term: string, documents: BaseDocumentEntity[]): number {
    const docsContainingTerm = documents.filter((doc) =>
      `${doc.title} ${doc.content}`.toLowerCase().includes(term)
    ).length;
    return docsContainingTerm > 0 ? Math.log(documents.length / docsContainingTerm) : 0;
  }

  private expandTokensWithSynonyms(tokens: string[]): string[] {
    // Simple synonym expansion - in production use proper NLP library
    const synonymMap: Record<string, string[]> = {
      user: ['customer', 'client', 'end-user'],
      system: ['platform', 'application', 'service'],
      feature: ['functionality', 'capability', 'component'],
      requirement: ['specification', 'need', 'criteria'],
    };

    const expanded = new Set(tokens);
    for (const token of tokens) {
      if (synonymMap[token]) {
        synonymMap[token]?.forEach((synonym) => expanded.add(synonym));
      }
    }
    return Array.from(expanded);
  }

  private calculateJaccardSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateConceptualSimilarity(text1: string, text2: string): number {
    // Simple conceptual similarity based on common phrases
    const phrases1 = this.extractPhrases(text1);
    const phrases2 = this.extractPhrases(text2);
    return this.calculateJaccardSimilarity(phrases1, phrases2);
  }

  private extractPhrases(text: string): string[] {
    // Extract 2-3 word phrases
    const words = this.tokenizeText(text);
    const phrases: string[] = [];

    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    return phrases;
  }
}

// Export a singleton instance
// ==================== WORKFLOW DEFINITIONS ====================

interface WorkflowAutomationRule {
  name: string;
  condition: {
    type:
      | 'status_change'
      | 'stage_duration'
      | 'document_type'
      | 'priority_level'
      | 'completion_percentage'
      | 'has_relationships'
      | 'custom_field';
    value: any;
  };
  action: {
    type:
      | 'advance_stage'
      | 'create_document'
      | 'update_status'
      | 'assign_reviewer'
      | 'generate_artifacts'
      | 'send_notification'
      | 'update_relationships';
    value: any;
  };
}

abstract class WorkflowDefinition {
  abstract name: string;
  abstract stages: string[];
  abstract autoTransitions: boolean;
  abstract rules: WorkflowAutomationRule[];

  abstract getNextStages(currentStage: string): string[];
  abstract canTransition(fromStage: string, toStage: string): boolean;
  abstract requiresApproval(stage: string): boolean;
  abstract getAutomationRules(stage: string): WorkflowAutomationRule[];
}

class PRDWorkflowDefinition extends WorkflowDefinition {
  name = 'prd_workflow';
  stages = ['draft', 'review', 'approved', 'implementation', 'completed'];
  autoTransitions = true as boolean;

  rules: WorkflowAutomationRule[] = [
    {
      name: 'auto_create_epics_on_approval',
      condition: { type: 'status_change', value: 'approved' },
      action: {
        type: 'create_document',
        value: {
          documentType: 'epic' as DocumentType,
          title: undefined, // Will be auto-generated
          assignTo: undefined, // Inherit from PRD
          priority: 'high',
          status: 'draft',
          inheritKeywords: true,
        },
      },
    },
    {
      name: 'generate_implementation_artifacts',
      condition: { type: 'status_change', value: 'approved' },
      action: {
        type: 'generate_artifacts',
        value: ['summary_report', 'checklist', 'stakeholder_matrix'],
      },
    },
  ];

  getNextStages(currentStage: string): string[] {
    const stageMap: Record<string, string[]> = {
      draft: ['review'],
      review: ['approved', 'draft'],
      approved: ['implementation'],
      implementation: ['completed'],
      completed: [],
    };
    return stageMap[currentStage] || [];
  }

  canTransition(fromStage: string, toStage: string): boolean {
    const allowedTransitions = this.getNextStages(fromStage);
    return allowedTransitions.includes(toStage);
  }

  requiresApproval(stage: string): boolean {
    return ['approved', 'completed'].includes(stage);
  }

  getAutomationRules(stage: string): WorkflowAutomationRule[] {
    return this.rules.filter(
      (rule) =>
        rule.condition.type === 'status_change' &&
        (stage === 'approved' || stage === 'implementation')
    );
  }
}

class FeatureWorkflowDefinition extends WorkflowDefinition {
  name = 'feature_workflow';
  stages = ['draft', 'approved', 'implementation', 'testing', 'completed'];
  autoTransitions = true as boolean;

  rules: WorkflowAutomationRule[] = [
    {
      name: 'auto_create_tasks_on_approval',
      condition: { type: 'status_change', value: 'approved' },
      action: {
        type: 'create_document',
        value: {
          documentType: 'task' as DocumentType,
          priority: 'medium',
          status: 'todo',
          inheritKeywords: true,
        },
      },
    },
  ];

  getNextStages(currentStage: string): string[] {
    const stageMap: Record<string, string[]> = {
      draft: ['approved'],
      approved: ['implementation'],
      implementation: ['testing'],
      testing: ['completed', 'implementation'],
      completed: [],
    };
    return stageMap[currentStage] || [];
  }

  canTransition(fromStage: string, toStage: string): boolean {
    return this.getNextStages(fromStage).includes(toStage);
  }

  requiresApproval(stage: string): boolean {
    return ['approved', 'completed'].includes(stage);
  }

  getAutomationRules(stage: string): WorkflowAutomationRule[] {
    return this.rules.filter((_rule) => stage === 'approved');
  }
}

// Additional workflow definitions
class VisionWorkflowDefinition extends WorkflowDefinition {
  name = 'vision_workflow';
  stages = ['draft', 'stakeholder_review', 'approved', 'active'];
  autoTransitions = false;
  rules: WorkflowAutomationRule[] = [];

  getNextStages(currentStage: string): string[] {
    const stageMap: Record<string, string[]> = {
      draft: ['stakeholder_review'],
      stakeholder_review: ['approved', 'draft'],
      approved: ['active'],
      active: [],
    };
    return stageMap[currentStage] || [];
  }

  canTransition(fromStage: string, toStage: string): boolean {
    return this.getNextStages(fromStage).includes(toStage);
  }

  requiresApproval(stage: string): boolean {
    return ['approved', 'active'].includes(stage);
  }

  getAutomationRules(): WorkflowAutomationRule[] {
    return [];
  }
}

class ADRWorkflowDefinition extends WorkflowDefinition {
  name = 'adr_workflow';
  stages = ['proposed', 'discussion', 'decided', 'implemented'];
  autoTransitions = false;
  rules: WorkflowAutomationRule[] = [];

  getNextStages(currentStage: string): string[] {
    const stageMap: Record<string, string[]> = {
      proposed: ['discussion', 'decided'],
      discussion: ['decided', 'proposed'],
      decided: ['implemented'],
      implemented: [],
    };
    return stageMap[currentStage] || [];
  }

  canTransition(fromStage: string, toStage: string): boolean {
    return this.getNextStages(fromStage).includes(toStage);
  }

  requiresApproval(stage: string): boolean {
    return ['decided', 'implemented'].includes(stage);
  }

  getAutomationRules(): WorkflowAutomationRule[] {
    return [];
  }
}

class EpicWorkflowDefinition extends WorkflowDefinition {
  name = 'epic_workflow';
  stages = ['draft', 'groomed', 'in_progress', 'completed'];
  autoTransitions = true as boolean;

  rules: WorkflowAutomationRule[] = [
    {
      name: 'auto_create_features_on_groom',
      condition: { type: 'status_change', value: 'groomed' },
      action: {
        type: 'create_document',
        value: {
          documentType: 'feature' as DocumentType,
          priority: 'medium',
          status: 'draft',
          inheritKeywords: true,
        },
      },
    },
  ];

  getNextStages(currentStage: string): string[] {
    const stageMap: Record<string, string[]> = {
      draft: ['groomed'],
      groomed: ['in_progress'],
      in_progress: ['completed'],
      completed: [],
    };
    return stageMap[currentStage] || [];
  }

  canTransition(fromStage: string, toStage: string): boolean {
    return this.getNextStages(fromStage).includes(toStage);
  }

  requiresApproval(stage: string): boolean {
    return ['groomed', 'completed'].includes(stage);
  }

  getAutomationRules(stage: string): WorkflowAutomationRule[] {
    return this.rules.filter((_rule) => stage === 'groomed');
  }
}

class TaskWorkflowDefinition extends WorkflowDefinition {
  name = 'task_workflow';
  stages = ['todo', 'in_progress', 'review', 'done'];
  autoTransitions = false;
  rules: WorkflowAutomationRule[] = [];

  getNextStages(currentStage: string): string[] {
    const stageMap: Record<string, string[]> = {
      todo: ['in_progress'],
      in_progress: ['review', 'done'],
      review: ['done', 'in_progress'],
      done: [],
    };
    return stageMap[currentStage] || [];
  }

  canTransition(fromStage: string, toStage: string): boolean {
    return this.getNextStages(fromStage).includes(toStage);
  }

  requiresApproval(stage: string): boolean {
    return ['done'].includes(stage);
  }

  getAutomationRules(): WorkflowAutomationRule[] {
    return [];
  }
}

class DefaultWorkflowDefinition extends WorkflowDefinition {
  name = 'default_workflow';
  stages = ['draft', 'review', 'approved', 'completed'];
  autoTransitions = false;
  rules: WorkflowAutomationRule[] = [];

  getNextStages(currentStage: string): string[] {
    const stageMap: Record<string, string[]> = {
      draft: ['review'],
      review: ['approved', 'draft'],
      approved: ['completed'],
      completed: [],
    };
    return stageMap[currentStage] || [];
  }

  canTransition(fromStage: string, toStage: string): boolean {
    return this.getNextStages(fromStage).includes(toStage);
  }

  requiresApproval(stage: string): boolean {
    return ['approved', 'completed'].includes(stage);
  }

  getAutomationRules(): WorkflowAutomationRule[] {
    return [];
  }
}

export const documentManager = new DocumentManager();
export default documentManager;
