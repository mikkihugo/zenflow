/**
 * @fileoverview Base Document Service - Foundation for document facades
 * 
 * Abstract base service that provides common document operations for all
 * specialized document facades (ADR, PRD, Vision, Epic, Feature, Task).
 * 
 * Follows Google TypeScript conventions and facade pattern for clean architecture.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */

import { EventEmitter } from 'eventemitter3';
import { nanoid } from 'nanoid';
import { getLogger } from '../../config/logging-config';
import type { Logger } from '@claude-zen/foundation';
import type { DocumentType } from '../../workflows/types';
import type { BaseDocumentEntity } from '../../entities/document-entities';
import { DocumentManager, type DocumentCreateOptions, type DocumentQueryOptions } from './document-service';

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
 * Abstract base service for all document types.
 * 
 * Provides common CRUD operations, validation, search, and workflow management.
 * Specialized facades extend this to add domain-specific functionality.
 * 
 * @template T - Document entity type extending BaseDocumentEntity
 */
export abstract class BaseDocumentService<T extends BaseDocumentEntity> extends EventEmitter {
  protected logger: Logger;
  protected documentManager: DocumentManager;
  protected initialized = false;

  constructor(
    protected serviceId: string,
    documentManager?: DocumentManager
  ) {
    super();
    this.logger = getLogger(`${serviceId}-service`);
    this.documentManager = documentManager || new DocumentManager();
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
    if (this.initialized) return;

    try {
      await this.documentManager.initialize();
      this.initialized = true;
      this.logger.info(`${this.serviceId} service initialized successfully`);
      this.emit('initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize ${this.serviceId} service:`, error);
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
    if (!this.initialized) await this.initialize();

    // Validate document data
    const validation = this.validateDocument(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    try {
      // Generate document content and keywords
      const content = this.formatDocumentContent(data);
      const keywords = this.generateKeywords(data);

      // Prepare document with base fields
      const documentData = {
        ...data,
        type: this.getDocumentType(),
        content,
        keywords,
        searchable_content: this.createSearchableContent(data, content),
        checksum: this.generateChecksum(content),
        version: data.version || '1.0.0',
        completion_percentage: data.completion_percentage || 0,
        created_at: new Date(),
        updated_at: new Date()
      } as Partial<T>;

      // Create document through document manager
      const document = await this.documentManager.createDocument<T>(
        this.getDocumentType(),
        documentData,
        {
          autoGenerateRelationships: true,
          startWorkflow: this.getDefaultWorkflow(),
          generateSearchIndex: true,
          ...options
        }
      );

      this.logger.info(`Created ${this.getDocumentType()} document: ${document.id}`);
      this.emit('documentCreated', document);

      return document;

    } catch (error) {
      this.logger.error(`Failed to create ${this.getDocumentType()} document:`, error);
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
    if (!this.initialized) await this.initialize();

    try {
      const document = await this.documentManager.getDocument<T>(id, options);
      
      if (document && document.type !== this.getDocumentType()) {
        throw new Error(`Document ${id} is not a ${this.getDocumentType()} document`);
      }

      return document;

    } catch (error) {
      this.logger.error(`Failed to get ${this.getDocumentType()} document:`, error);
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
    if (!this.initialized) await this.initialize();

    // Validate updates if content is being changed
    if (updates.content || updates.title) {
      const validation = this.validateDocument(updates);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    try {
      // Update content and keywords if necessary
      const updateData = { ...updates };

      if (updates.content || updates.title) {
        updateData.content = this.formatDocumentContent(updateData);
        updateData.keywords = this.generateKeywords(updateData);
        updateData.searchable_content = this.createSearchableContent(updateData, updateData.content);
        updateData.checksum = this.generateChecksum(updateData.content);
      }

      updateData.updated_at = new Date();

      const document = await this.documentManager.updateDocument<T>(
        id,
        updateData,
        triggerWorkflow
      );

      this.logger.info(`Updated ${this.getDocumentType()} document: ${id}`);
      this.emit('documentUpdated', { document, updates });

      return document;

    } catch (error) {
      this.logger.error(`Failed to update ${this.getDocumentType()} document:`, error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    try {
      await this.documentManager.deleteDocument(id);
      
      this.logger.info(`Deleted ${this.getDocumentType()} document: ${id}`);
      this.emit('documentDeleted', { documentId: id, documentType: this.getDocumentType() });

    } catch (error) {
      this.logger.error(`Failed to delete ${this.getDocumentType()} document:`, error);
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
    if (!this.initialized) await this.initialize();

    try {
      const searchOptions = {
        searchType: 'combined' as const,
        query: '*', // Match all
        documentTypes: [this.getDocumentType()],
        projectId: filters.projectId,
        status: filters.status ? [filters.status] : undefined,
        priority: filters.priority ? [filters.priority] : undefined,
        dateRange: filters.dateRange ? {
          ...filters.dateRange,
          field: 'created_at' as const
        } : undefined,
        limit: filters.limit,
        offset: filters.offset,
        includeRelationships: false,
        includeWorkflowState: false
      };

      const result = await this.documentManager.searchDocuments<T>(searchOptions);

      // Apply additional filters that can't be handled at the database level
      let filteredDocuments = result.documents;

      if (filters.author) {
        filteredDocuments = filteredDocuments.filter(doc => doc.author === filters.author);
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredDocuments = filteredDocuments.filter(doc =>
          filters.tags!.some(tag => doc.tags.includes(tag))
        );
      }

      return {
        documents: filteredDocuments,
        total: filteredDocuments.length,
        hasMore: result.total > (filters.offset || 0) + filteredDocuments.length,
        facets: result.facets
      };

    } catch (error) {
      this.logger.error(`Failed to query ${this.getDocumentType()} documents:`, error);
      throw error;
    }
  }

  /**
   * Search documents with advanced options
   */
  async searchDocuments(options: SearchOptions): Promise<SearchResult<T>> {
    if (!this.initialized) await this.initialize();

    try {
      const searchOptions = {
        searchType: options.searchType || 'combined' as const,
        query: options.query,
        documentTypes: [this.getDocumentType()],
        projectId: options.projectId,
        status: options.status ? [options.status] : undefined,
        priority: options.priority ? [options.priority] : undefined,
        dateRange: options.dateRange ? {
          ...options.dateRange,
          field: 'created_at' as const
        } : undefined,
        limit: options.limit,
        offset: options.offset,
        includeRelationships: options.includeRelationships || false,
        includeWorkflowState: options.includeWorkflowState || false
      };

      const startTime = Date.now();
      const result = await this.documentManager.searchDocuments<T>(searchOptions);
      const executionTime = Date.now() - startTime;

      // Apply additional filters
      let filteredDocuments = result.documents;

      if (options.author) {
        filteredDocuments = filteredDocuments.filter(doc => doc.author === options.author);
      }

      if (options.tags && options.tags.length > 0) {
        filteredDocuments = filteredDocuments.filter(doc =>
          options.tags!.some(tag => doc.tags.includes(tag))
        );
      }

      return {
        documents: filteredDocuments,
        total: filteredDocuments.length,
        hasMore: result.total > (options.offset || 0) + filteredDocuments.length,
        facets: result.facets,
        searchMetadata: {
          query: options.query,
          searchType: options.searchType || 'combined',
          executionTime
        }
      };

    } catch (error) {
      this.logger.error(`Failed to search ${this.getDocumentType()} documents:`, error);
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
    if (!this.initialized) await this.initialize();

    try {
      const documents = await this.documentManager.getDocumentsByProject<T>(projectId, options);
      
      // Filter to only this document type
      return documents.filter(doc => doc.type === this.getDocumentType());

    } catch (error) {
      this.logger.error(`Failed to get ${this.getDocumentType()} documents by project:`, error);
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
    if (!this.initialized) await this.initialize();

    try {
      return await this.documentManager.getDocumentWorkflowStatus(documentId);
    } catch (error) {
      this.logger.error(`Failed to get workflow status for ${this.getDocumentType()} document:`, error);
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
    if (!this.initialized) await this.initialize();

    try {
      await this.documentManager.transitionDocumentWorkflow(documentId, toStage, metadata);
      
      this.logger.info(`Advanced ${this.getDocumentType()} document ${documentId} to stage: ${toStage}`);
      this.emit('workflowAdvanced', { documentId, toStage, documentType: this.getDocumentType() });

    } catch (error) {
      this.logger.error(`Failed to advance workflow for ${this.getDocumentType()} document:`, error);
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
    if (!this.initialized) await this.initialize();

    try {
      const { documents } = await this.queryDocuments({ limit: 1000 });

      const metrics: DocumentMetrics = {
        totalDocuments: documents.length,
        byStatus: {},
        byPriority: {},
        byAuthor: {},
        recentActivity: 0
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const doc of documents) {
        // Status distribution
        if (doc.status) {
          metrics.byStatus[doc.status] = (metrics.byStatus[doc.status] || 0) + 1;
        }

        // Priority distribution
        if (doc.priority) {
          metrics.byPriority[doc.priority] = (metrics.byPriority[doc.priority] || 0) + 1;
        }

        // Author distribution
        if (doc.author) {
          metrics.byAuthor[doc.author] = (metrics.byAuthor[doc.author] || 0) + 1;
        }

        // Recent activity
        if (new Date(doc.updated_at) >= thirtyDaysAgo) {
          metrics.recentActivity++;
        }
      }

      return metrics;

    } catch (error) {
      this.logger.error(`Failed to get metrics for ${this.getDocumentType()} documents:`, error);
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
      data.title || '',
      content || '',
      data.tags?.join(' ') || '',
      data.author || ''
    ].filter(Boolean).join(' ');

    return searchableText.toLowerCase();
  }

  /**
   * Generate checksum for content
   */
  protected generateChecksum(content: string): string {
    // Simple checksum - in production, use a proper hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get default workflow for this document type
   */
  protected getDefaultWorkflow(): string {
    return `${this.getDocumentType()}_workflow`;
  }

  /**
   * Get service metrics
   */
  getServiceMetrics(): any {
    return this.documentManager.getDocumentMetrics();
  }

  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    try {
      this.removeAllListeners();
      this.logger.info(`${this.serviceId} service shutdown completed`);
    } catch (error) {
      this.logger.error(`Error during ${this.serviceId} service shutdown:`, error);
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
  type DocumentType
};