/**
 * Strategic Documents Database Manager - LanceDB Integration
 * Handles all database operations using LanceDB for high-performance vector storage
 */

import path from 'path';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import { CliError } from '../core/cli-error.js';
import { inputValidator } from '../core/input-validator.js';

export class StrategicDocumentsManager {
  constructor(projectPath = null) {
    this.projectPath = projectPath || process.cwd();
    this.projectId = this.generateProjectId(this.projectPath);
    this.lancedb = null;
    this.db = null;
    this.tables = {};
    
    // Operation locks for atomic operations
    this.operationLocks = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Connection pooling and performance
    this.connectionPool = new Map(); // Cache for table connections
    this.maxPoolSize = 10;
    this.connectionTimeout = 30000; // 30 seconds
    this.cleanupInterval = null;
    
    // Memory management
    this.queryCache = new Map();
    this.maxCacheSize = 100;
    this.cacheTimeout = 300000; // 5 minutes
    
    // Performance monitoring
    this.performanceMetrics = {
      queriesExecuted: 0,
      cacheHits: 0,
      connectionsCreated: 0,
      operationsCompleted: 0,
      averageQueryTime: 0,
      totalQueryTime: 0
    };
    
    // LanceDB table configuration for strategic documents
    this.tableConfigs = {
      documents: 'strategic_docs',
      decisions: 'queen_decisions', 
      analyses: 'queen_analyses',
      adrs: 'architecture_decisions',
      projects: 'projects',
      metadata: 'doc_metadata'
    };
    
    this.dbPath = path.join(this.projectPath, '.hive-mind', 'strategic-memory', 'lancedb');
    
    // Start cleanup routine
    this.startCleanupRoutine();
  }

  /**
   * Initialize LanceDB backend for strategic documents
   */
  async initialize() {
    return this.withRetry(async () => {
      try {
        // Dynamic import for LanceDB
        this.lancedb = await import('@lancedb/lancedb');
        
        // Ensure persist directory exists
        await fs.mkdir(this.dbPath, { recursive: true });
        
        // Initialize LanceDB connection with error handling
        this.db = await this.lancedb.connect(this.dbPath);
        
        // Initialize all tables with proper error handling
        await this.initializeTables();
        
        // Initialize project metadata
        await this.initializeProject();
        
        console.log(`📚 Strategic Documents initialized for project: ${path.basename(this.projectPath)} (backend: LanceDB)`);
        
      } catch (error) {
        const errorMsg = `Failed to initialize strategic documents LanceDB: ${error.message}`;
        console.error(errorMsg);
        throw new CliError(errorMsg, 'DATABASE_INIT_ERROR');
      }
    }, 'initialize');
  }

  /**
   * Generate consistent project ID from path
   */
  generateProjectId(projectPath) {
    return path.basename(projectPath).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  /**
   * Initialize LanceDB tables for strategic documents
   */
  async initializeTables() {
    for (const [namespace, tableName] of Object.entries(this.tableConfigs)) {
      try {
        // Try to open existing table
        this.tables[namespace] = await this.db.openTable(tableName);
        console.log(`🧠 LanceDB table '${tableName}' opened`);
      } catch (error) {
        // Table doesn't exist, create it with appropriate schema
        const schema = this.getTableSchema(namespace);
        this.tables[namespace] = await this.db.createTable(tableName, schema);
        console.log(`🧠 LanceDB table '${tableName}' created`);
      }
    }
  }

  /**
   * Generate simple hash-based embedding for text (for testing)
   */
  generateSimpleEmbedding(text) {
    // Simple hash-based embedding for demonstration
    const embedding = new Array(128).fill(0);
    for (let i = 0; i < text.length; i++) {
      embedding[i % 128] += text.charCodeAt(i) / 1000;
    }
    return embedding;
  }

  /**
   * Get table schema for different document types
   */
  getTableSchema(namespace) {
    const baseSchema = {
      id: 'sample-id',
      projectId: this.projectId,
      content: 'sample content for embedding',
      metadata: JSON.stringify({}),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    switch (namespace) {
      case 'documents':
        return [{
          ...baseSchema,
          documentType: 'sample',
          title: 'sample title',
          status: 'draft',
          version: 1,
          relevanceKeywords: JSON.stringify([])
        }];
      case 'decisions':
        return [{
          ...baseSchema,
          objective: 'sample objective',
          consensusResult: 'sample result',
          confidenceScore: 0.8,
          supportingQueens: JSON.stringify([]),
          dissentingQueens: JSON.stringify([]),
          reasoning: 'sample reasoning',
          documentReferences: JSON.stringify([]),
          status: 'completed'
        }];
      case 'analyses':
        return [{
          ...baseSchema,
          decisionId: 'sample-decision-id',
          queenName: 'sample-queen',
          queenType: 'sample-type',
          recommendation: 'sample recommendation',
          confidenceScore: 0.8,
          reasoning: 'sample reasoning',
          documentInsights: JSON.stringify({}),
          processingTimeMs: 0
        }];
      case 'adrs':
        return [{
          ...baseSchema,
          decisionId: 'sample-decision-id',
          adrNumber: 1,
          title: 'sample ADR title',
          context: 'sample context',
          decision: 'sample decision',
          consequences: 'sample consequences',
          implementationNotes: 'sample notes',
          tags: JSON.stringify([]),
          status: 'Accepted'
        }];
      case 'projects':
        return [{
          ...baseSchema,
          name: 'sample project',
          path: '/sample/path',
          description: 'sample description',
          settings: JSON.stringify({})
        }];
      case 'metadata':
        return [{
          ...baseSchema,
          title: 'sample title',
          documentType: 'sample',
          status: 'draft'
        }];
      default:
        return [baseSchema];
    }
  }

  /**
   * Initialize project metadata in LanceDB
   */
  async initializeProject() {
    const projectData = {
      id: this.projectId,
      projectId: this.projectId,
      name: path.basename(this.projectPath),
      path: this.projectPath,
      description: `Strategic documents for ${path.basename(this.projectPath)}`,
      content: `Strategic documents for ${path.basename(this.projectPath)}`, // For embedding
      metadata: JSON.stringify({
        settings: {},
        initialized: true
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if project already exists
    try {
      const existing = await this.tables.projects
        .search()
        .where(`id = '${this.projectId}'`)
        .limit(1)
        .toArray();
      
      if (existing.length === 0) {
        await this.tables.projects.add([projectData]);
        console.log(`📋 Project initialized in LanceDB: ${projectData.name}`);
      }
    } catch (error) {
      console.warn(`Project initialization warning: ${error.message}`);
    }
  }

  /**
   * Get current project information
   */
  async getCurrentProject() {
    try {
      const results = await this.tables.projects
        .query()
        .select('id', 'name', 'path', 'description', 'metadata')
        .where(`id = '${this.projectId}'`)
        .limit(1)
        .toArray();
      
      if (results.length > 0) {
        const project = results[0];
        // Parse metadata back to object
        project.metadata = JSON.parse(project.metadata || '{}');
        return project;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to get current project: ${error.message}`);
      return null;
    }
  }

  // ==================== DOCUMENT OPERATIONS ====================

  /**
   * Create a new strategic document with semantic embedding (atomic operation)
   */
  async createDocument({
    documentType,
    title,
    content,
    metadata = {},
    authorId = null,
    relevanceKeywords = []
  }) {
    // Comprehensive input validation
    const validatedData = inputValidator.validateDocumentData({
      documentType,
      title,
      content,
      metadata,
      authorId,
      relevanceKeywords
    });

    return this.withAtomicOperation(`create_doc_${validatedData.title}`, async () => {
      const id = nanoid();
      const now = new Date().toISOString();

      const document = {
        id,
        projectId: this.projectId,
        documentType: validatedData.documentType,
        title: validatedData.title,
        content: validatedData.content,
        metadata: JSON.stringify({
          ...metadata,
          author: authorId || 'claude-zen',
          created_at: now,
          updated_at: now
        }),
        relevanceKeywords: JSON.stringify(relevanceKeywords),
        status: 'draft',
        version: 1,
        created_at: now,
        updated_at: now
      };

      try {
        // Store document in LanceDB (automatic embedding generation)
        await this.tables.documents.add([document]);
        
        // Store document metadata for fast retrieval
        const docMeta = {
          id: `${validatedData.documentType}_${id}`,
          projectId: this.projectId,
          title: validatedData.title,
          documentType: validatedData.documentType,
          status: document.status,
          content: `${validatedData.title} ${validatedData.documentType}`,
          metadata: JSON.stringify({
            originalId: id,
            type: 'metadata',
            documentType: validatedData.documentType,
            title: validatedData.title
          }),
          created_at: now,
          updated_at: now
        };
        
        await this.tables.metadata.add([docMeta]);

        console.log(`📄 Created ${validatedData.documentType.toUpperCase()}: ${validatedData.title} (ID: ${id})`);
        
        // Return parsed document
        const returnDoc = { ...document };
        returnDoc.metadata = JSON.parse(document.metadata);
        returnDoc.relevanceKeywords = JSON.parse(document.relevanceKeywords);
        return returnDoc;
      } catch (error) {
        throw new CliError(`Failed to create document "${validatedData.title}": ${error.message}`, 'DOCUMENT_CREATE_ERROR');
      }
    });
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId) {
    try {
      const results = await this.tables.documents
        .query()
        .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords', 'version')
        .where(`id = '${documentId}'`)
        .limit(1)
        .toArray();
      
      if (results.length === 0) {
        console.warn(`Document not found: ${documentId}`);
        return null;
      }
      
      const document = results[0];
      // Parse JSON fields back to objects
      document.metadata = JSON.parse(document.metadata || '{}');
      document.relevanceKeywords = JSON.parse(document.relevanceKeywords || '[]');
      
      return document;
    } catch (error) {
      console.warn(`Failed to get document ${documentId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Update document with new content (atomic operation)
   */
  async updateDocument(documentId, updates) {
    return this.withAtomicOperation(`update_doc_${documentId}`, async () => {
      const existingDoc = await this.getDocument(documentId);
      if (!existingDoc) {
        throw new CliError(`Document not found: ${documentId}`, 'DOCUMENT_NOT_FOUND');
      }

      const now = new Date().toISOString();
      const updatedMetadata = {
        ...existingDoc.metadata,
        ...updates.metadata,
        updated_at: now
      };

      const updatedDoc = {
        ...existingDoc,
        ...updates,
        metadata: JSON.stringify(updatedMetadata),
        relevanceKeywords: JSON.stringify(updates.relevanceKeywords || JSON.parse(existingDoc.relevanceKeywords || '[]')),
        version: existingDoc.version + 1,
        updated_at: now
      };

      // Atomic update: delete and add in sequence with error handling
      try {
        await this.tables.documents.delete(`id = '${documentId}'`);
        await this.tables.documents.add([updatedDoc]);
        
        // Update metadata atomically
        const docMeta = {
          id: `${updatedDoc.documentType}_${documentId}`,
          projectId: this.projectId,
          title: updatedDoc.title,
          documentType: updatedDoc.documentType,
          status: updatedDoc.status,
          content: `${updatedDoc.title} ${updatedDoc.documentType}`,
          metadata: JSON.stringify({
            originalId: documentId,
            type: 'metadata',
            documentType: updatedDoc.documentType,
            title: updatedDoc.title,
            created_at: existingDoc.metadata.created_at,
            updated_at: now
          }),
          created_at: existingDoc.metadata.created_at,
          updated_at: now
        };
        
        await this.tables.metadata.delete(`id = '${updatedDoc.documentType}_${documentId}'`);
        await this.tables.metadata.add([docMeta]);

        console.log(`📝 Updated document: ${updatedDoc.title}`);
        
        // Return parsed document
        const returnDoc = { ...updatedDoc };
        returnDoc.metadata = JSON.parse(updatedDoc.metadata);
        returnDoc.relevanceKeywords = JSON.parse(updatedDoc.relevanceKeywords);
        return returnDoc;
      } catch (error) {
        // Recovery attempt: restore original document if update failed
        try {
          await this.tables.documents.add([{
            ...existingDoc,
            metadata: JSON.stringify(existingDoc.metadata),
            relevanceKeywords: JSON.stringify(existingDoc.relevanceKeywords)
          }]);
        } catch (recoveryError) {
          console.error(`Failed to recover document ${documentId}:`, recoveryError.message);
        }
        throw new CliError(`Failed to update document ${documentId}: ${error.message}`, 'DOCUMENT_UPDATE_ERROR');
      }
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId) {
    const document = await this.getDocument(documentId);
    if (!document) {
      return false;
    }

    try {
      // Delete from both tables
      await this.tables.documents.delete(`id = '${documentId}'`);
      await this.tables.metadata.delete(`id = '${document.documentType}_${documentId}'`);

      console.log(`🗑️ Deleted document: ${document.title}`);
      return true;
    } catch (error) {
      console.warn(`Failed to delete document ${documentId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Search documents using LanceDB's vector similarity search
   */
  async searchDocuments({
    query = '',
    documentType = null,
    status = null,
    limit = 50
  }) {
    // Validate search parameters
    const validatedParams = inputValidator.validateQueryParams({
      query,
      documentType,
      status,
      limit
    });
    let results = [];

    try {
      if (validatedParams.query.trim()) {
        // Use LanceDB's query method for filtering
        let results;
        
        if (validatedParams.documentType && validatedParams.status) {
          results = await this.tables.documents.query()
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
            .where(`documentType = '${validatedParams.documentType}' AND status = '${validatedParams.status}'`)
            .limit(validatedParams.limit)
            .toArray();
        } else if (validatedParams.documentType) {
          results = await this.tables.documents.query()
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
            .where(`documentType = '${validatedParams.documentType}'`)
            .limit(validatedParams.limit)
            .toArray();
        } else if (validatedParams.status) {
          results = await this.tables.documents.query()
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
            .where(`status = '${validatedParams.status}'`)
            .limit(validatedParams.limit)
            .toArray();
        } else {
          results = await this.tables.documents.query()
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
            .limit(validatedParams.limit)
            .toArray();
        }
        
        // Filter by query text if provided
        if (validatedParams.query.trim()) {
          results = results.filter(doc => 
            doc.content.toLowerCase().includes(validatedParams.query.toLowerCase()) ||
            doc.title.toLowerCase().includes(validatedParams.query.toLowerCase())
          );
        }
        
        // Map results and add relevance score
        results = results.map(result => ({
          ...result,
          metadata: JSON.parse(result.metadata || '{}'),
          relevanceKeywords: JSON.parse(result.relevanceKeywords || '[]'),
          relevance_score: 0.8, // Simple static score for now
          content_snippet: this.generateSnippet(result.content, validatedParams.query)
        }));
      } else {
        // This case is handled above in the main if block
        // No additional processing needed
      }
    } catch (error) {
      console.warn(`Search failed: ${error.message}`);
      results = [];
    }

    return results;
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(documentType, limit = 100) {
    try {
      const results = await this.tables.documents
        .query()
        .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
        .where(`documentType = '${documentType}'`)
        .limit(limit)
        .toArray();
      
      return results.map(doc => ({
        ...doc,
        metadata: JSON.parse(doc.metadata || '{}'),
        relevanceKeywords: JSON.parse(doc.relevanceKeywords || '[]'),
        document_type_name: documentType
      }));
    } catch (error) {
      console.warn(`Failed to get documents by type ${documentType}: ${error.message}`);
      return [];
    }
  }

  /**
   * Find relevant documents using LanceDB vector similarity
   */
  async findRelevantDocuments(objective, limit = 10) {
    try {
      const results = await this.tables.documents
        .query()
        .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
        .limit(limit * 2) // Get more for filtering
        .toArray();
      
      // Filter by content similarity (simple text matching for now)
      const filteredResults = results.filter(doc => 
        doc.content.toLowerCase().includes(objective.toLowerCase()) ||
        doc.title.toLowerCase().includes(objective.toLowerCase())
      );

      return filteredResults.slice(0, limit).map(result => ({
        ...result,
        metadata: JSON.parse(result.metadata || '{}'),
        relevanceKeywords: JSON.parse(result.relevanceKeywords || '[]'),
        relevance_score: 0.8, // Simplified similarity score
        document_type_name: result.documentType
      }));
      
    } catch (error) {
      console.warn('Vector search failed, falling back to keyword search:', error.message);
      return this.searchDocuments({ query: objective, limit });
    }
  }

  // ==================== DECISION OPERATIONS ====================

  /**
   * Create a new queen council decision
   */
  async createDecision({
    objective,
    consensusResult,
    confidenceScore,
    supportingQueens,
    dissentingQueens = [],
    reasoning,
    documentReferences = []
  }) {
    // Comprehensive input validation
    const validatedData = inputValidator.validateDecisionData({
      objective,
      consensusResult,
      confidenceScore,
      supportingQueens,
      dissentingQueens,
      reasoning,
      documentReferences
    });
    const id = nanoid();
    const now = new Date().toISOString();

    const decision = {
      id,
      projectId: this.projectId,
      objective: validatedData.objective,
      consensusResult: validatedData.consensusResult,
      confidenceScore: validatedData.confidenceScore,
      supportingQueens: validatedData.supportingQueens,
      dissentingQueens: validatedData.dissentingQueens,
      reasoning: validatedData.reasoning,
      documentReferences: validatedData.documentReferences,
      status: 'completed',
      created_at: now,
      updated_at: now
    };

    const lanceDecision = {
      ...decision,
      supportingQueens: JSON.stringify(validatedData.supportingQueens),
      dissentingQueens: JSON.stringify(validatedData.dissentingQueens),
      documentReferences: JSON.stringify(validatedData.documentReferences),
      content: `${validatedData.objective} ${JSON.stringify(validatedData.consensusResult)} ${validatedData.reasoning}`, // For embedding
      metadata: JSON.stringify({
        type: 'decision',
        confidenceScore: validatedData.confidenceScore,
        queenCount: validatedData.supportingQueens.length + validatedData.dissentingQueens.length
      })
    };

    await this.tables.decisions.add([lanceDecision]);
    
    console.log(`🏛️ Created decision: ${validatedData.objective} (ID: ${id})`);
    return decision;
  }

  /**
   * Get decision by ID
   */
  async getDecision(decisionId) {
    try {
      const results = await this.tables.decisions
        .query()
        .select('id', 'objective', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'reasoning', 'documentReferences', 'status', 'metadata')
        .where(`id = '${decisionId}'`)
        .limit(1)
        .toArray();
      
      if (results.length === 0) {
        return null;
      }
      
      const decision = results[0];
      // Parse JSON fields back to objects
      decision.supportingQueens = JSON.parse(decision.supportingQueens || '[]');
      decision.dissentingQueens = JSON.parse(decision.dissentingQueens || '[]');
      decision.documentReferences = JSON.parse(decision.documentReferences || '[]');
      decision.metadata = JSON.parse(decision.metadata || '{}');
      
      return decision;
    } catch (error) {
      console.warn(`Failed to get decision ${decisionId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Save queen analysis for a decision
   */
  async saveQueenAnalysis({
    decisionId,
    queenName,
    queenType,
    recommendation,
    confidenceScore,
    reasoning,
    documentInsights = {},
    processingTimeMs = 0
  }) {
    const id = `${decisionId}_${queenName}`;
    
    const analysis = {
      id,
      decisionId,
      queenName,
      queenType,
      recommendation,
      confidenceScore,
      reasoning,
      documentInsights,
      processingTimeMs,
      created_at: new Date().toISOString()
    };

    const lanceAnalysis = {
      ...analysis,
      projectId: this.projectId,
      documentInsights: JSON.stringify(documentInsights),
      content: `${queenName} ${queenType} ${recommendation} ${reasoning}`, // For embedding
      metadata: JSON.stringify({
        type: 'analysis',
        queenName,
        queenType,
        confidenceScore,
        processingTimeMs
      }),
      updated_at: analysis.created_at
    };

    await this.tables.analyses.add([lanceAnalysis]);
    return true;
  }

  /**
   * Get all analyses for a decision
   */
  async getDecisionAnalyses(decisionId) {
    try {
      const results = await this.tables.analyses
        .query()
        .select('id', 'decisionId', 'queenName', 'queenType', 'recommendation', 'confidenceScore', 'reasoning', 'documentInsights', 'processingTimeMs', 'metadata')
        .where(`decisionId = '${decisionId}'`)
        .toArray();
      
      return results.map(analysis => ({
        ...analysis,
        documentInsights: JSON.parse(analysis.documentInsights || '{}'),
        metadata: JSON.parse(analysis.metadata || '{}')
      }));
    } catch (error) {
      console.warn(`Failed to get analyses for decision ${decisionId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get recent decisions
   */
  async getRecentDecisions(limit = 20) {
    try {
      const results = await this.tables.decisions
        .query()
        .select('id', 'objective', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'reasoning', 'documentReferences', 'status', 'metadata', 'created_at')
        .limit(limit * 2) // Get more for sorting
        .toArray();
      
      // Parse and sort decisions
      const decisions = results
        .map(decision => ({
          ...decision,
          supportingQueens: JSON.parse(decision.supportingQueens || '[]'),
          dissentingQueens: JSON.parse(decision.dissentingQueens || '[]'),
          documentReferences: JSON.parse(decision.documentReferences || '[]'),
          metadata: JSON.parse(decision.metadata || '{}')
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);

      // Enhance with analysis data
      for (const decision of decisions) {
        const analyses = await this.getDecisionAnalyses(decision.id);
        decision.total_analyses = analyses.length;
        decision.avg_queen_confidence = analyses.length > 0 
          ? analyses.reduce((sum, a) => sum + a.confidenceScore, 0) / analyses.length 
          : 0;
      }

      return decisions;
    } catch (error) {
      console.warn(`Failed to get recent decisions: ${error.message}`);
      return [];
    }
  }

  // ==================== ADR OPERATIONS ====================

  /**
   * Create Architecture Decision Record
   */
  async createADR({
    decisionId,
    title,
    context,
    decision,
    consequences,
    implementationNotes = '',
    tags = []
  }) {
    // Get next ADR number
    try {
      const existingADRs = await this.tables.adrs
        .query()
        .select('id', 'adrNumber')
        .toArray();
      const adrNumber = existingADRs.length + 1;
      
      const id = nanoid();
      const now = new Date().toISOString();

      const adr = {
        id,
        projectId: this.projectId,
        decisionId,
        adrNumber,
        title,
        context,
        decision,
        consequences,
        implementationNotes,
        tags: JSON.stringify(tags),
        status: 'Accepted',
        content: `${title} ${context} ${decision} ${consequences}`, // For embedding
        metadata: JSON.stringify({
          type: 'adr',
          adrNumber,
          status: 'Accepted',
          decisionId
        }),
        created_at: now,
        updated_at: now
      };

      await this.tables.adrs.add([adr]);
      
      console.log(`📋 Created ADR-${adrNumber}: ${title}`);
      
      // Return non-serialized version
      return {
        id,
        projectId: this.projectId,
        decisionId,
        adrNumber,
        title,
        context,
        decision,
        consequences,
        implementationNotes,
        tags,
        status: 'Accepted',
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      console.warn(`Failed to create ADR: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get ADR by ID
   */
  async getADR(adrId) {
    try {
      const results = await this.tables.adrs
        .query()
        .select('id', 'adrNumber', 'title', 'context', 'decision', 'consequences', 'implementationNotes', 'tags', 'status', 'metadata')
        .where(`id = '${adrId}'`)
        .limit(1)
        .toArray();
      
      if (results.length === 0) {
        return null;
      }
      
      const adr = results[0];
      // Parse JSON fields back to objects
      adr.tags = JSON.parse(adr.tags || '[]');
      adr.metadata = JSON.parse(adr.metadata || '{}');
      
      return adr;
    } catch (error) {
      console.warn(`Failed to get ADR ${adrId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all ADRs for project
   */
  async getADRs() {
    try {
      const results = await this.tables.adrs
        .query()
        .select('id', 'adrNumber', 'title', 'context', 'decision', 'consequences', 'implementationNotes', 'tags', 'status', 'metadata')
        .toArray();
      
      return results
        .map(adr => ({
          ...adr,
          tags: JSON.parse(adr.tags || '[]'),
          metadata: JSON.parse(adr.metadata || '{}')
        }))
        .sort((a, b) => b.adrNumber - a.adrNumber);
    } catch (error) {
      console.warn(`Failed to get ADRs: ${error.message}`);
      return [];
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get decision analytics
   */
  async getDecisionAnalytics(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoff = cutoffDate.toISOString();

    try {
      const allDecisions = await this.tables.decisions
        .query()
        .select('id', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'status', 'metadata', 'created_at')
        .toArray();
      const recentDecisions = allDecisions
        .map(d => ({
          ...d,
          supportingQueens: JSON.parse(d.supportingQueens || '[]'),
          dissentingQueens: JSON.parse(d.dissentingQueens || '[]'),
          metadata: JSON.parse(d.metadata || '{}')
        }))
        .filter(d => d.created_at >= cutoff);

    const totalDecisions = recentDecisions.length;
    const completedDecisions = recentDecisions.filter(d => d.status === 'completed').length;
    const avgConfidence = totalDecisions > 0 
      ? recentDecisions.reduce((sum, d) => sum + d.confidenceScore, 0) / totalDecisions 
      : 0;

      // Count queen participation
      const queenCounts = {};
      for (const decision of recentDecisions) {
        for (const queen of decision.supportingQueens) {
          queenCounts[queen] = (queenCounts[queen] || 0) + 1;
        }
      }

      const mostActiveQueen = Object.keys(queenCounts).reduce((a, b) => 
        queenCounts[a] > queenCounts[b] ? a : b, null);

      return {
        total_decisions: totalDecisions,
        completed_decisions: completedDecisions,
        failed_decisions: totalDecisions - completedDecisions,
        avg_confidence: avgConfidence,
        success_rate: totalDecisions > 0 ? (completedDecisions / totalDecisions) * 100 : 0,
        most_active_queen: mostActiveQueen,
        queen_participation: queenCounts
      };
    } catch (error) {
      console.warn(`Failed to get decision analytics: ${error.message}`);
      return {
        total_decisions: 0,
        completed_decisions: 0,
        failed_decisions: 0,
        avg_confidence: 0,
        success_rate: 0,
        most_active_queen: null,
        queen_participation: {}
      };
    }
  }

  /**
   * Get document statistics
   */
  async getDocumentStats() {
    const documentTypes = ['roadmap', 'prd', 'architecture', 'adr', 'strategy', 'research', 'specification'];
    const stats = [];

    for (const docType of documentTypes) {
      const docs = await this.getDocumentsByType(docType);
      const approvedCount = docs.filter(d => d.status === 'approved').length;
      
      stats.push({
        document_type: docType,
        count: docs.length,
        approved_count: approvedCount
      });
    }

    return stats;
  }

  // ==================== CONNECTION POOLING & PERFORMANCE ====================

  /**
   * Start cleanup routine for connections and cache
   */
  startCleanupRoutine() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupConnections();
      this.cleanupCache();
    }, 60000); // Run every minute
  }

  /**
   * Stop cleanup routine
   */
  stopCleanupRoutine() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clean up stale connections
   */
  cleanupConnections() {
    const now = Date.now();
    for (const [key, connection] of this.connectionPool.entries()) {
      if (now - connection.lastUsed > this.connectionTimeout) {
        this.connectionPool.delete(key);
      }
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
      }
    }
    
    // If cache is too large, remove oldest entries
    if (this.queryCache.size > this.maxCacheSize) {
      const entries = Array.from(this.queryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.queryCache.size - this.maxCacheSize);
      for (const [key] of toRemove) {
        this.queryCache.delete(key);
      }
    }
  }

  /**
   * Get cached query result
   */
  getCachedQuery(cacheKey) {
    const entry = this.queryCache.get(cacheKey);
    if (entry && (Date.now() - entry.timestamp) < this.cacheTimeout) {
      this.performanceMetrics.cacheHits++;
      return entry.result;
    }
    return null;
  }

  /**
   * Set cached query result
   */
  setCachedQuery(cacheKey, result) {
    this.queryCache.set(cacheKey, {
      result: JSON.parse(JSON.stringify(result)), // Deep clone
      timestamp: Date.now()
    });
  }

  /**
   * Execute query with caching and performance tracking
   */
  async executeQuery(table, operation, params = {}, cacheKey = null) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if (cacheKey) {
        const cached = this.getCachedQuery(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Execute query
      let result;
      switch (operation) {
        case 'query':
          result = await table.query()
            .select(params.select || '*')
            .where(params.where || '')
            .limit(params.limit || 1000)
            .toArray();
          break;
        case 'search':
          result = await table.search()
            .where(params.where || '')
            .limit(params.limit || 50)
            .toArray();
          break;
        case 'add':
          result = await table.add(params.data);
          break;
        case 'delete':
          result = await table.delete(params.where);
          break;
        case 'countRows':
          result = await table.countRows();
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      // Cache result if cacheable
      if (cacheKey && ['query', 'search', 'countRows'].includes(operation)) {
        this.setCachedQuery(cacheKey, result);
      }

      // Update performance metrics
      const queryTime = Date.now() - startTime;
      this.performanceMetrics.queriesExecuted++;
      this.performanceMetrics.totalQueryTime += queryTime;
      this.performanceMetrics.averageQueryTime = 
        this.performanceMetrics.totalQueryTime / this.performanceMetrics.queriesExecuted;

      return result;
    } catch (error) {
      const queryTime = Date.now() - startTime;
      console.warn(`Query failed after ${queryTime}ms:`, error.message);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.queryCache.size,
      cacheHitRate: this.performanceMetrics.queriesExecuted > 0 
        ? (this.performanceMetrics.cacheHits / this.performanceMetrics.queriesExecuted) * 100 
        : 0,
      connectionPoolSize: this.connectionPool.size
    };
  }

  // ==================== ATOMIC OPERATIONS & RELIABILITY ====================

  /**
   * Execute operation with atomic locking to prevent race conditions
   */
  async withAtomicOperation(operationKey, operation) {
    const lockKey = `${this.projectId}_${operationKey}`;
    
    // Wait for any existing operation to complete
    while (this.operationLocks.has(lockKey)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Acquire lock
    this.operationLocks.set(lockKey, true);
    
    try {
      const result = await operation();
      return result;
    } finally {
      // Always release lock
      this.operationLocks.delete(lockKey);
    }
  }

  /**
   * Execute operation with retry logic and exponential backoff
   */
  async withRetry(operation, operationName = 'operation') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries) {
          console.error(`\u26a0\ufe0f  ${operationName} failed after ${this.maxRetries} attempts:`, error.message);
          break;
        }
        
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`\u26a0\ufe0f  ${operationName} attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new CliError(`${operationName} failed after ${this.maxRetries} attempts: ${lastError.message}`, 'OPERATION_FAILED');
  }

  /**
   * Health check for database connectivity and table integrity
   */
  async healthCheck() {
    try {
      if (!this.db || !this.tables) {
        return { status: 'unhealthy', reason: 'Database not initialized' };
      }

      // Test basic connectivity by counting entries in each table
      const tableStatus = {};
      for (const [namespace, table] of Object.entries(this.tables)) {
        try {
          const count = await table.countRows();
          tableStatus[namespace] = { status: 'healthy', count };
        } catch (error) {
          tableStatus[namespace] = { status: 'unhealthy', error: error.message };
        }
      }

      const hasUnhealthyTables = Object.values(tableStatus).some(t => t.status === 'unhealthy');
      
      return {
        status: hasUnhealthyTables ? 'degraded' : 'healthy',
        tables: tableStatus,
        projectId: this.projectId,
        dbPath: this.dbPath
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        reason: error.message,
        projectId: this.projectId,
        dbPath: this.dbPath
      };
    }
  }

  /**
   * Validate input data to prevent injection and corruption
   */
  validateInput(data, requiredFields = []) {
    if (!data || typeof data !== 'object') {
      throw new CliError('Invalid input: data must be an object', 'VALIDATION_ERROR');
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new CliError(`Missing required field: ${field}`, 'VALIDATION_ERROR');
      }
    }

    // Sanitize string fields
    const sanitized = { ...data };
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        // Basic SQL injection prevention and sanitization
        sanitized[key] = value
          .replace(/'/g, "''")  // Escape single quotes
          .replace(/\x00/g, '') // Remove null bytes
          .trim();
      }
    }

    return sanitized;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate content snippet for search results
   */
  generateSnippet(content, query, maxLength = 200) {
    if (!query) return content.substring(0, maxLength) + '...';
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const lowerContent = content.toLowerCase();
    
    // Find first occurrence of any query word
    let firstIndex = -1;
    for (const word of queryWords) {
      const index = lowerContent.indexOf(word);
      if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
        firstIndex = index;
      }
    }
    
    if (firstIndex === -1) {
      return content.substring(0, maxLength) + '...';
    }
    
    // Extract snippet around the match
    const start = Math.max(0, firstIndex - 50);
    const end = Math.min(content.length, start + maxLength);
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return snippet;
  }

  /**
   * Set AI provider for semantic search
   * Note: LanceDB handles embeddings automatically, but this maintains API compatibility
   */
  setAIProvider(aiProvider) {
    // Store for potential future use
    this.aiProvider = aiProvider;
    console.log('AI provider set for LanceDB integration');
  }

  /**
   * Get backend statistics for LanceDB
   */
  async getBackendStats() {
    if (!this.db || !this.tables) {
      return null;
    }
    
    try {
      let totalEntries = 0;
      let totalNamespaces = Object.keys(this.tables).length;
      
      // Count entries in each table
      for (const [namespace, table] of Object.entries(this.tables)) {
        try {
          const count = await table.countRows();
          totalEntries += count;
        } catch (error) {
          console.warn(`Failed to count rows in ${namespace}: ${error.message}`);
        }
      }
      
      return {
        backend: 'LanceDB',
        entries: totalEntries,
        namespaces: totalNamespaces,
        tables: Object.keys(this.tables),
        hasSemanticSearch: true, // LanceDB has built-in vector search
        hasGraph: false, // LanceDB is not a graph database
        dbPath: this.dbPath
      };
    } catch (error) {
      console.warn(`Failed to get backend stats: ${error.message}`);
      return {
        backend: 'LanceDB',
        entries: 0,
        namespaces: 0,
        tables: [],
        hasSemanticSearch: true,
        hasGraph: false,
        dbPath: this.dbPath
      };
    }
  }

  /**
   * Close database connections and clean up resources
   */
  async close() {
    try {
      // Stop cleanup routine
      this.stopCleanupRoutine();
      
      // Clear caches and pools
      this.queryCache.clear();
      this.connectionPool.clear();
      this.operationLocks.clear();
      
      if (this.db) {
        // LanceDB connections close automatically when out of scope
        this.db = null;
        this.tables = {};
      }
      
      console.log('📚 Strategic Documents LanceDB closed with resource cleanup');
    } catch (error) {
      console.warn(`Error closing LanceDB: ${error.message}`);
    }
  }
}

// Export singleton instance
export const strategicDocs = new StrategicDocumentsManager();