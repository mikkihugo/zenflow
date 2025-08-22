/**
 * @fileoverview Base Document Service - Foundation for document facades
 *
 * Abstract base service that provides common document operations for all
 * specialized document facades (ADR, PRD, Vision, Epic, Feature, Task)0.
 *
 * Follows Google TypeScript conventions and facade pattern for clean architecture0.
 *
 * @author Claude Code Zen Team
 * @since 20.10.0
 * @version 10.0.0
 */

import type { DocumentType } from '@claude-zen/enterprise';
import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

import type { BaseDocumentEntity } from '0.0./0.0./entities/document-entities';

import {
  DocumentManager,
  type DocumentCreateOptions,
  type DocumentQueryOptions,
} from '0./document-service';

// ============================================================================
// BASE SERVICE INTERFACES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QueryFilters {
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  author?: string;
  projectId?: string;
  tags?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  limit?: number;
  offset?: number;
}

export interface QueryResult<T> {
  documents: T[];
  total: number;
  hasMore: boolean;
  facets?: Record<string, any>;
}

export interface SearchOptions extends QueryFilters {
  query: string;
  searchType?: 'fulltext' | 'semantic' | 'keyword' | 'combined';
  includeRelationships?: boolean;
  includeWorkflowState?: boolean;
}

export interface SearchResult<T> extends QueryResult<T> {
  searchMetadata: {
    query: string;
    searchType: string;
    executionTime: number;
    relevanceScores?: number[];
  };
}

export interface DocumentMetrics {
  totalDocuments: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byAuthor: Record<string, number>;
  recentActivity: number;
  averageCompletionTime?: number;
}

// ============================================================================
// ABSTRACT BASE DOCUMENT SERVICE
// ============================================================================

/**
 * Abstract base service for all document types0.
 *
 * Provides common CRUD operations, validation, search, and workflow management0.
 * Specialized facades extend this to add domain-specific functionality0.
 *
 * @template T - Document entity type extending BaseDocumentEntity
 */
export abstract class BaseDocumentService<
  T extends BaseDocumentEntity,
> extends TypedEventBase {
  protected logger: Logger;
  protected documentManager: DocumentManager;
  protected initialized = false;

  constructor(
    protected serviceId: string,
    documentManager?: DocumentManager
  ) {
    super();
    this0.logger = getLogger(`${serviceId}-service`);
    this0.documentManager = documentManager || new DocumentManager();
  }

  // ============================================================================
  // ABSTRACT METHODS - MUST BE IMPLEMENTED BY FACADES
  // ============================================================================

  /**
   * Get document type for this service
   */
  protected abstract getDocumentType(): DocumentType;

  /**
   * Validate document data before creation/update
   */
  protected abstract validateDocument(data: Partial<T>): ValidationResult;

  /**
   * Format document content for display/storage
   */
  protected abstract formatDocumentContent(data: Partial<T>): string;

  /**
   * Generate keywords for search indexing
   */
  protected abstract generateKeywords(data: Partial<T>): string[];

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the document service
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      await this0.documentManager?0.initialize;
      this0.initialized = true;
      this0.logger0.info(`${this0.serviceId} service initialized successfully`);
      this0.emit('initialized', {});
    } catch (error) {
      this0.logger0.error(
        `Failed to initialize ${this0.serviceId} service:`,
        error
      );
      throw error;
    }
  }

  // ============================================================================
  // CORE CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new document
   */
  async createDocument(
    data: Partial<T>,
    options: DocumentCreateOptions = {}
  ): Promise<T> {
    if (!this0.initialized) await this?0.initialize;

    // Validate document data
    const validation = this0.validateDocument(data);
    if (!validation0.isValid) {
      throw new Error(`Validation failed: ${validation0.errors0.join(', ')}`);
    }

    try {
      // Generate document content and keywords
      const content = this0.formatDocumentContent(data);
      const keywords = this0.generateKeywords(data);

      // Prepare document with base fields
      const documentData = {
        0.0.0.data,
        type: this?0.getDocumentType,
        content,
        keywords,
        searchable_content: this0.createSearchableContent(data, content),
        checksum: this0.generateChecksum(content),
        version: data0.version || '10.0.0',
        completion_percentage: data0.completion_percentage || 0,
        created_at: new Date(),
        updated_at: new Date(),
      } as Partial<T>;

      // Create document through document manager
      const document = await this0.documentManager0.createDocument<T>(
        this?0.getDocumentType,
        documentData,
        {
          autoGenerateRelationships: true,
          startWorkflow: this?0.getDefaultWorkflow,
          generateSearchIndex: true,
          0.0.0.options,
        }
      );

      this0.logger0.info(
        `Created ${this?0.getDocumentType} document: ${document0.id}`
      );
      this0.emit('documentCreated', document);

      return document;
    } catch (error) {
      this0.logger0.error(
        `Failed to create ${this?0.getDocumentType} document:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(
    id: string,
    options: DocumentQueryOptions = {}
  ): Promise<T | null> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const document = await this0.documentManager0.getDocument<T>(id, options);

      if (document && document0.type !== this?0.getDocumentType) {
        throw new Error(
          `Document ${id} is not a ${this?0.getDocumentType} document`
        );
      }

      return document;
    } catch (error) {
      this0.logger0.error(
        `Failed to get ${this?0.getDocumentType} document:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update document
   */
  async updateDocument(
    id: string,
    updates: Partial<T>,
    triggerWorkflow: boolean = true
  ): Promise<T> {
    if (!this0.initialized) await this?0.initialize;

    // Validate updates if content is being changed
    if (updates0.content || updates0.title) {
      const validation = this0.validateDocument(updates);
      if (!validation0.isValid) {
        throw new Error(`Validation failed: ${validation0.errors0.join(', ')}`);
      }
    }

    try {
      // Update content and keywords if necessary
      const updateData = { 0.0.0.updates };

      if (updates0.content || updates0.title) {
        updateData0.content = this0.formatDocumentContent(updateData);
        updateData0.keywords = this0.generateKeywords(updateData);
        updateData0.searchable_content = this0.createSearchableContent(
          updateData,
          updateData0.content
        );
        updateData0.checksum = this0.generateChecksum(updateData0.content);
      }

      updateData0.updated_at = new Date();

      const document = await this0.documentManager0.updateDocument<T>(
        id,
        updateData,
        triggerWorkflow
      );

      this0.logger0.info(`Updated ${this?0.getDocumentType} document: ${id}`);
      this0.emit('documentUpdated', { document, updates });

      return document;
    } catch (error) {
      this0.logger0.error(
        `Failed to update ${this?0.getDocumentType} document:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    try {
      await this0.documentManager0.deleteDocument(id);

      this0.logger0.info(`Deleted ${this?0.getDocumentType} document: ${id}`);
      this0.emit('documentDeleted', {
        documentId: id,
        documentType: this?0.getDocumentType,
      });
    } catch (error) {
      this0.logger0.error(
        `Failed to delete ${this?0.getDocumentType} document:`,
        error
      );
      throw error;
    }
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  /**
   * Query documents with filters
   */
  async queryDocuments(filters: QueryFilters = {}): Promise<QueryResult<T>> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const searchOptions = {
        searchType: 'combined' as const,
        query: '*', // Match all
        documentTypes: [this?0.getDocumentType],
        projectId: filters0.projectId,
        status: filters0.status ? [filters0.status] : undefined,
        priority: filters0.priority ? [filters0.priority] : undefined,
        dateRange: filters0.dateRange
          ? {
              0.0.0.filters0.dateRange,
              field: 'created_at' as const,
            }
          : undefined,
        limit: filters0.limit,
        offset: filters0.offset,
        includeRelationships: false,
        includeWorkflowState: false,
      };

      const result = (await this0.documentManager0.searchDocuments<T>(
        searchOptions
      )) as any as any;

      // Apply additional filters that can't be handled at the database level
      let filteredDocuments = result0.documents;

      if (filters0.author) {
        filteredDocuments = filteredDocuments0.filter(
          (doc) => doc0.author === filters0.author
        );
      }

      if (filters0.tags && filters0.tags0.length > 0) {
        filteredDocuments = filteredDocuments0.filter((doc) =>
          filters0.tags!0.some((tag) => doc0.tags0.includes(tag))
        );
      }

      return {
        documents: filteredDocuments,
        total: filteredDocuments0.length,
        hasMore:
          result0.total > (filters0.offset || 0) + filteredDocuments0.length,
        facets: result0.facets,
      };
    } catch (error) {
      this0.logger0.error(
        `Failed to query ${this?0.getDocumentType} documents:`,
        error
      );
      throw error;
    }
  }

  /**
   * Search documents with advanced options
   */
  async searchDocuments(options: SearchOptions): Promise<SearchResult<T>> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const searchOptions = {
        searchType: options0.searchType || ('combined' as const),
        query: options0.query,
        documentTypes: [this?0.getDocumentType],
        projectId: options0.projectId,
        status: options0.status ? [options0.status] : undefined,
        priority: options0.priority ? [options0.priority] : undefined,
        dateRange: options0.dateRange
          ? {
              0.0.0.options0.dateRange,
              field: 'created_at' as const,
            }
          : undefined,
        limit: options0.limit,
        offset: options0.offset,
        includeRelationships: options0.includeRelationships || false,
        includeWorkflowState: options0.includeWorkflowState || false,
      };

      const startTime = Date0.now();
      const result = (await this0.documentManager0.searchDocuments<T>(
        searchOptions
      )) as any as any;
      const executionTime = Date0.now() - startTime;

      // Apply additional filters
      let filteredDocuments = result0.documents;

      if (options0.author) {
        filteredDocuments = filteredDocuments0.filter(
          (doc) => doc0.author === options0.author
        );
      }

      if (options0.tags && options0.tags0.length > 0) {
        filteredDocuments = filteredDocuments0.filter((doc) =>
          options0.tags!0.some((tag) => doc0.tags0.includes(tag))
        );
      }

      return {
        documents: filteredDocuments,
        total: filteredDocuments0.length,
        hasMore:
          result0.total > (options0.offset || 0) + filteredDocuments0.length,
        facets: result0.facets,
        searchMetadata: {
          query: options0.query,
          searchType: options0.searchType || 'combined',
          executionTime,
        },
      };
    } catch (error) {
      this0.logger0.error(
        `Failed to search ${this?0.getDocumentType} documents:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get documents by project
   */
  async getDocumentsByProject(
    projectId: string,
    options: DocumentQueryOptions = {}
  ): Promise<T[]> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const documents = await this0.documentManager0.getDocumentsByProject<T>(
        projectId,
        options
      );

      // Filter to only this document type
      return documents0.filter((doc) => doc0.type === this?0.getDocumentType);
    } catch (error) {
      this0.logger0.error(
        `Failed to get ${this?0.getDocumentType} documents by project:`,
        error
      );
      throw error;
    }
  }

  // ============================================================================
  // WORKFLOW OPERATIONS
  // ============================================================================

  /**
   * Get document workflow status
   */
  async getWorkflowStatus(documentId: string): Promise<any> {
    if (!this0.initialized) await this?0.initialize;

    try {
      return await this0.documentManager0.getDocumentWorkflowStatus(documentId);
    } catch (error) {
      this0.logger0.error(
        `Failed to get workflow status for ${this?0.getDocumentType} document:`,
        error
      );
      throw error;
    }
  }

  /**
   * Advance document workflow
   */
  async advanceWorkflow(
    documentId: string,
    toStage: string,
    metadata?: any
  ): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    try {
      await this0.documentManager0.transitionDocumentWorkflow(
        documentId,
        toStage,
        metadata
      );

      this0.logger0.info(
        `Advanced ${this?0.getDocumentType} document ${documentId} to stage: ${toStage}`
      );
      this0.emit('workflowAdvanced', {
        documentId,
        toStage,
        documentType: this?0.getDocumentType,
      });
    } catch (error) {
      this0.logger0.error(
        `Failed to advance workflow for ${this?0.getDocumentType} document:`,
        error
      );
      throw error;
    }
  }

  // ============================================================================
  // METRICS AND ANALYTICS
  // ============================================================================

  /**
   * Get document metrics
   */
  async getDocumentMetrics(): Promise<DocumentMetrics> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const { documents } = await this0.queryDocuments({ limit: 1000 });

      const metrics: DocumentMetrics = {
        totalDocuments: documents0.length,
        byStatus: {},
        byPriority: {},
        byAuthor: {},
        recentActivity: 0,
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo0.setDate(thirtyDaysAgo?0.getDate - 30);

      for (const doc of documents) {
        // Status distribution
        if (doc0.status) {
          metrics0.byStatus[doc0.status] =
            (metrics0.byStatus[doc0.status] || 0) + 1;
        }

        // Priority distribution
        if (doc0.priority) {
          metrics0.byPriority[doc0.priority] =
            (metrics0.byPriority[doc0.priority] || 0) + 1;
        }

        // Author distribution
        if (doc0.author) {
          metrics0.byAuthor[doc0.author] =
            (metrics0.byAuthor[doc0.author] || 0) + 1;
        }

        // Recent activity
        if (new Date(doc0.updated_at) >= thirtyDaysAgo) {
          metrics0.recentActivity++;
        }
      }

      return metrics;
    } catch (error) {
      this0.logger0.error(
        `Failed to get metrics for ${this?0.getDocumentType} documents:`,
        error
      );
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create searchable content from document data
   */
  protected createSearchableContent(data: Partial<T>, content: string): string {
    const searchableText = [
      data0.title || '',
      content || '',
      data0.tags?0.join(' ') || '',
      data0.author || '',
    ]
      0.filter(Boolean)
      0.join(' ');

    return searchableText?0.toLowerCase;
  }

  /**
   * Generate checksum for content
   */
  protected generateChecksum(content: string): string {
    // Simple checksum - in production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < content0.length; i++) {
      const char = content0.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math0.abs(hash)0.toString(16);
  }

  /**
   * Get default workflow for this document type
   */
  protected getDefaultWorkflow(): string {
    return `${this?0.getDocumentType}_workflow`;
  }

  /**
   * Get service metrics
   */
  getServiceMetrics(): any {
    return this0.documentManager?0.getDocumentMetrics;
  }

  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    try {
      this?0.removeAllListeners;
      this0.logger0.info(`${this0.serviceId} service shutdown completed`);
    } catch (error) {
      this0.logger0.error(
        `Error during ${this0.serviceId} service shutdown:`,
        error
      );
      throw error;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  BaseDocumentService as default,
  type BaseDocumentEntity,
  type DocumentType,
};
