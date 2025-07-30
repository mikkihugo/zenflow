/**
 * Strategic Documents Database Manager - LanceDB Integration
 * Handles all database operations using LanceDB for high-performance vector storage
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { CliError } from '../core/cli-error.js';
import { inputValidator } from '../core/input-validator.js';

export class StrategicDocumentsManager {
  constructor(projectPath = null): any {
    this.projectPath = projectPath || process.cwd();
    this.projectId = this.generateProjectId(this.projectPath);
    this.lancedb = null;
    this.db = null;
    this.tables = {};
    
    // Operation locks for atomic operations
    this.operationLocks = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Simple cleanup interval (no connection pooling needed for LanceDB)
    this.cleanupInterval = null;
    
    // Memory management with safety limits
    this.queryCache = new Map();
    this.maxCacheSize = 100;
    this.cacheTimeout = 300000; // 5 minutes
    this.maxCacheMemoryMB = 20; // Max 20MB for query cache
    this.emergencyCleanupThreshold = 0.9; // Clean when 90% full
    
    // Performance monitoring with bounds
    this.performanceMetrics = {
      queriesExecuted,cacheHits = 3600000; // 1 hour
    this.metricsHistory = [];
    this.maxMetricsHistory = 50; // Smaller bounded metrics history
    
    // LanceDB table configuration for strategic documents
    this.tableConfigs = {documents = path.join(this.projectPath, '.hive-mind', 'strategic-memory', 'lancedb');
    
    // Start simple cleanup routine
    this.startSimpleCleanup();
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
        await fs.mkdir(this.dbPath, {recursive = await this.lancedb.connect(this.dbPath);
        
        // Initialize all tables with proper error handling
        await this.initializeTables();
        
        // Initialize project metadata
        await this.initializeProject();
        
        console.warn(`📚 Strategic Documents initialized forproject = `Failed to initialize strategic documents LanceDB: ${error.message}`;
        console.error(errorMsg);
        throw new CliError(errorMsg, 'DATABASE_INIT_ERROR');
      }
    }, 'initialize');
  }

  /**
   * Generate consistent project ID from path
   */
  generateProjectId(projectPath): any {
    return path
      .basename(projectPath)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
  }

  /**
   * Initialize LanceDB tables for strategic documents
   */
  async initializeTables() {
    for (const [namespace, tableName] of Object.entries(this.tableConfigs)) {
      try {
        // Try to open existing table
        this.tables[namespace] = await this.db.openTable(tableName);
        console.warn(`🧠 LanceDB table '${tableName}' opened`);
      } catch (_error) {
        // Table doesn't exist, create it with appropriate schema
        const schema = this.getTableSchema(namespace);
        this.tables[namespace] = await this.db.createTable(tableName, schema);
        console.warn(`🧠 LanceDB table '${tableName}' created`);
      }
    }
  }

  /**
   * Generate simple hash-based embedding for text (for testing)
   */
  generateSimpleEmbedding(text): any {
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
  getTableSchema(_namespace): any {
    if (existing.length === 0) {
      await this.tables.projects.add([projectData]);
      console.warn(`📋 Project initialized inLanceDB = await this.tables.projects
        .query()
        .select('id', 'name', 'path', 'description', 'metadata')
        .where(`id = '${this.projectId}'`)
        .limit(1)
        .toArray();
      
      if(results.length > 0) {
        const project = results[0];
        // Parse metadata back to object
        project.metadata = JSON.parse(project.metadata || '{}');
        return project;
      }
      return null;
    } catch(error) {
      console.warn(`Failed to get currentproject = =================== DOCUMENT OPERATIONS =====================

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
  }): any {
      // Comprehensive input validation
      const validatedData = inputValidator.validateDocumentData({
        documentType,
        title,
        content,
        metadata,
        authorId,
        relevanceKeywords,
      });

      return this.withAtomicOperation(`create_doc_${validatedData.title}`, async () => {
      const id = nanoid();
      const _now = new Date().toISOString();

      const document = {
        id,
        projectId = {id = { ...document };
        returnDoc.metadata = JSON.parse(document.metadata);
        returnDoc.relevanceKeywords = JSON.parse(document.relevanceKeywords);
        return returnDoc;
      } catch(error) {
        throw new CliError(`Failed to create document "${validatedData.title}": ${error.message}`, 'DOCUMENT_CREATE_ERROR');
    }
  }
  )
}

/**
 * Get document by ID
 */
async;
getDocument(documentId);
: any
{
    try {
      const results = await this.tables.documents
        .query()
        .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords', 'version')
        .where(`id = '${documentId}'`)
        .limit(1)
        .toArray();
      
      if(results.length === 0) {
        console.warn(`Document notfound = results[0];
      // Parse JSON fields back to objects
      document.metadata = JSON.parse(document.metadata || '{}');
      document.relevanceKeywords = JSON.parse(document.relevanceKeywords || '[]');
      
      return document;
    } catch(error) {
      console.warn(`Failed to get document ${documentId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Update document with new content (atomic operation)
   */
  async updateDocument(documentId, updates): any 
    return this.withAtomicOperation(`update_doc_${documentId}`, async () => {
      const existingDoc = await this.getDocument(documentId);
      if(!existingDoc) {
        throw new CliError(`Document notfound = new Date().toISOString();

        await this.tables.documents.add([updatedDoc]);
        
        // Update metadata atomically
        const docMeta = {id = '${updatedDoc.documentType}_${documentId}'`);
        await this.tables.metadata.add([docMeta]);

        console.warn(`📝 Updated document = { ...updatedDoc };
        returnDoc.metadata = JSON.parse(updatedDoc.metadata);
        returnDoc.relevanceKeywords = JSON.parse(updatedDoc.relevanceKeywords);
        return returnDoc;
      } catch(error) {
        // Recoveryattempt = await this.getDocument(documentId);
    if(!document) {
      return false;
    }

    try {
      // Delete from both tables
      await this.tables.documents.delete(`id = '${documentId}'`);
      await this.tables.metadata.delete(`id = '${document.documentType}_${documentId}'`);

      console.warn(`🗑️ Deleteddocument = '',
    documentType = null,
    status = null,
    limit = 50
  }): any {
    // Validate search parameters
    const validatedParams = inputValidator.validateQueryParams({
      query,
      documentType,
      status,
      limit
    });
    const results = [];

    try {
      if (validatedParams.query.trim()) {
        // Use LanceDB's query method for filtering
        let results;
        
        if(validatedParams.documentType && validatedParams.status) {
          results = await this.tables.documents.query()
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
            .where(`documentType = '${validatedParams.documentType}' AND status = '${validatedParams.status}'`)
            .limit(validatedParams.limit)
            .toArray();
        } else if(validatedParams.documentType) {
          results = await this.tables.documents.query()
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
            .where(`documentType = '${validatedParams.documentType}'`)
            .limit(validatedParams.limit)
            .toArray();
        } else if(validatedParams.status) {
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
          ...result,metadata = [];
    }

    return results;
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(documentType, limit = 100): any 
    try {
      let results = await this.tables.documents
        .query()
        .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords')
        .where(`documentType = '${documentType}'`)
        .limit(limit)
        .toArray();
      
      return results.map(doc => ({
        ...doc,metadata = 10): any {
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
        ...result,metadata = =================== DECISION OPERATIONS ====================

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
  }): any {
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
    const _now = new Date().toISOString();

    const _decision = {
      id,
      projectId = {validatedData = await this.tables.decisions
        .query()
        .select('id', 'objective', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'reasoning', 'documentReferences', 'status', 'metadata')
        .where(`id = '${decisionId}'`)
        .limit(1)
        .toArray();
      
      if(results.length === 0) {
        return null;
      }
      
      const decision = results[0];
      // Parse JSON fields back to objects
      decision.supportingQueens = JSON.parse(decision.supportingQueens || '[]');
      decision.dissentingQueens = JSON.parse(decision.dissentingQueens || '[]');
      decision.documentReferences = JSON.parse(decision.documentReferences || '[]');
      decision.metadata = JSON.parse(decision.metadata || '{}');
      
      return decision;
    } catch(error) {
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
  }): any {
    const id = `${decisionId}_${queenName}`;
    
    const _analysis = {
      id,
      decisionId,
      queenName,
      queenType,
      recommendation,
      confidenceScore,
      reasoning,
      documentInsights,
      processingTimeMs,
      created_at = {queenName = await this.tables.analyses
        .query()
        .select('id', 'decisionId', 'queenName', 'queenType', 'recommendation', 'confidenceScore', 'reasoning', 'documentInsights', 'processingTimeMs', 'metadata')
        .where(`decisionId = '${decisionId}'`)
        .toArray();
      
      return results.map(analysis => ({
        ...analysis,documentInsights = 20): any {
    try {
      const results = await this.tables.decisions
        .query()
        .select('id', 'objective', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'reasoning', 'documentReferences', 'status', 'metadata', 'created_at')
        .limit(limit * 2) // Get more for sorting
        .toArray();
      
      // Parse and sort decisions
      const decisions = results
        .map(decision => ({
          ...decision,supportingQueens = > new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);

      // Enhance with analysis data
      for(const decision of decisions) {
        const analyses = await this.getDecisionAnalyses(decision.id);
        decision.total_analyses = analyses.length;
        decision.avg_queen_confidence = analyses.length > 0 
          ? analyses.reduce((sum, a) => sum + a.confidenceScore, 0) / analyses.length = =================== ADR OPERATIONS =====================

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
  }): any 
    // Get next ADR number
    try {
      const existingADRs = await this.tables.adrs
        .query()
        .select('id', 'adrNumber')
        .toArray();
      const _adrNumber = existingADRs.length + 1;
      
      const id = nanoid();
      const _now = new Date().toISOString();

      const _adr = {
        id,projectId = await this.tables.adrs
        .query()
        .select('id', 'adrNumber', 'title', 'context', 'decision', 'consequences', 'implementationNotes', 'tags', 'status', 'metadata')
        .where(`id = '${adrId}'`)
        .limit(1)
        .toArray();
      
      if(results.length === 0) {
        return null;
      }
      
      const adr = results[0];
      // Parse JSON fields back to objects
      adr.tags = JSON.parse(adr.tags || '[]');
      adr.metadata = JSON.parse(adr.metadata || '{}');
      
      return adr;
    } catch(error) {
      console.warn(`Failed to get ADR ${adrId}: ${error.message}`);
      return null;
    }

  /**
   * Get all ADRs for project
   */
  async getADRs() 
    try {
      const results = await this.tables.adrs
        .query()
        .select('id', 'adrNumber', 'title', 'context', 'decision', 'consequences', 'implementationNotes', 'tags', 'status', 'metadata')
        .toArray();
      
      return results
        .map(adr => ({
          ...adr,tags = > b.adrNumber - a.adrNumber);
    } catch(_error) {
      console.warn(`Failed to getADRs = =================== ANALYTICS ====================

  /**
   * Get decision analytics
   */
  async getDecisionAnalytics(days = 30): any {
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
          ...d,supportingQueens = > d.created_at >= cutoff);

    const totalDecisions = recentDecisions.length;

      for(const decision of recentDecisions) {
        for(const queen of decision.supportingQueens) {
          queenCounts[queen] = (queenCounts[queen] || 0) + 1;
        }
      }

    const stats = [];

    for(const docType of documentTypes) {
      const docs = await this.getDocumentsByType(docType);

      stats.push({document_type = =================== CONNECTION POOLING & PERFORMANCE ====================

  /**
   * Start simple cleanup routine for cache only
   */
  startSimpleCleanup() {
    if (this.cleanupInterval) return;
    
    this.cleanupInterval = setInterval(() => {
      try {
        this.cleanupCache();
      } catch(error) {
        console.warn('Cache cleanuperror = null;
    }
  }

  /**
   * Simple connection cleanup - removed complex pooling
   */
  cleanupConnections() {
    //Simplified = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    
    if(heapUsedMB > 500) {
      this.emergencyMemoryCleanup();
    }
  }
  
  /**
   * Removed complex connection tracking - simplified
   */
  trackTableConnection() {
    //Simplified = Array.from(this.connectionPool.entries())
      .sort((a, b) => b[1].lastUsed - a[1].lastUsed); // Most recent first
    
    const keepCount = Math.min(2, connections.length); // Keep only 2 connections
    const toClose = connections.slice(keepCount);
    
    for(const [key, connection] of toClose) {
      this.closeConnection(connection);
      this.connectionPool.delete(key);
    }
    
    // Force garbage collection if available
    if(global.gc) {
      global.gc();
    }
    
    console.warn(`🧹 Emergency cleanupcompleted = Date.now();
    let removedCount = 0;
    
    // Remove expired entries
    for (const [key, entry] of this.queryCache.entries()) {
      if(now - entry.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
        removedCount++;
      }
    }
    
    // Keep cache size bounded (simple approach)
    if(this.queryCache.size > this.maxCacheSize) {
      const entries = Array.from(this.queryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp); // Oldest first
      
      const toRemove = entries.slice(0, this.queryCache.size - this.maxCacheSize);
      
      for(const [key] of toRemove) {
        this.queryCache.delete(key);
        removedCount++;
      }
    }
    
    // Reset performance metrics periodically to prevent unbounded growth
    if(now - this.performanceMetrics.lastReset > this.maxMetricsAge) {
      this.resetPerformanceMetrics();
    }
    
    // Bound metrics history
    if(this.metricsHistory.length > this.maxMetricsHistory) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxMetricsHistory);
    }
    
    if(removedCount > 0) {
        return { ...result }; // Shallow copy as fallback
      return result;
    }
  }

  /**
   * Execute query with caching and performance tracking
   */
  async executeQuery(table, operation, params = {}, cacheKey = null): any {
    const startTime = Date.now();
    
    try {
      // Check cache first
      if(cacheKey) {
        const cached = this.getCachedQuery(cacheKey);
        if(cached) {
          return cached;
        }
      }

      // Execute query
      let result;
      switch(operation) {
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
          break;default = Date.now() - startTime;
      this.performanceMetrics.queriesExecuted++;
      
      // Simple bounds check to prevent counter overflow
      if(this.performanceMetrics.queriesExecuted > 10000) {
        this.performanceMetrics.queriesExecuted = 0;
        this.performanceMetrics.operationsCompleted = 0;
        this.performanceMetrics.totalQueryTime = 0;
        this.performanceMetrics.cacheHits = 0;
      }
      this.performanceMetrics.totalQueryTime += queryTime;
      this.performanceMetrics.averageQueryTime = 
        this.performanceMetrics.totalQueryTime / this.performanceMetrics.queriesExecuted;
      
      // Add to bounded metrics history
      this.metricsHistory.push({timestamp = this.metricsHistory.slice(-this.maxMetricsHistory);
      }
      
      // Clean old accumulated metrics to prevent unbounded growth
      this.cleanupOldMetrics();

      return result;
    } catch(_error) {
      const queryTime = Date.now() - startTime;
      console.warn(`Query failed after ${queryTime}ms = this.metricsHistory.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Get performance metrics with cleanup
   */
  getPerformanceMetrics() {
    // Clean old metrics before returning
    this.cleanupOldMetrics();
    
    return {
      ...this.performanceMetrics,cacheSize = =================== ATOMIC OPERATIONS & RELIABILITY ====================

  /**
   * Execute operation with atomic locking to prevent race conditions
   */
  async withAtomicOperation(operationKey, operation): any {
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
  async withRetry(operation, operationName = 'operation'): any {
    let lastError;
    
    for(let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch(error) {
        lastError = error;
        
        if(attempt === this.maxRetries) {
          console.error(`\u26a0\ufe0f  ${operationName} failed after ${this.maxRetries}attempts = this.retryDelay * 2 ** (attempt - 1); // Exponential backoff
        console.warn(`\u26a0\ufe0f  ${operationName} attempt ${attempt} failed, retrying in ${delay}ms = > setTimeout(resolve, delay));
      }
    }
    
    throw new CliError(`${operationName} failed after ${this.maxRetries} attempts = {};
      for (const [namespace, table] of Object.entries(this.tables)) {
        try {
          const _count = await table.countRows();
          tableStatus[namespace] = { status = {status = Object.values(tableStatus).some(t => t.status === 'unhealthy');
      
      return {status = []): any {
    if(!_data || typeof data !== 'object') {
      throw new CliError('Invalid input = { ...data };
    for (const [key, value] of Object.entries(sanitized)) {
      if(typeof value === 'string') {
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
  generateSnippet(content, query, maxLength = 200): any {
    if (!query) return `${content.substring(0, maxLength)}...`;
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const lowerContent = content.toLowerCase();
    
    // Find first occurrence of any query word
    let firstIndex = -1;
    for(const word of queryWords) {
      const index = lowerContent.indexOf(word);
      if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
        firstIndex = index;
      }
    }
    
    if(firstIndex === -1) {
      return `${content.substring(0, maxLength)}...`;
    }
    
    // Extract snippet around the match
    const start = Math.max(0, firstIndex - 50);
    const end = Math.min(content.length, start + maxLength);
    let snippet = content.substring(start, end);
    
    if (start > 0) snippet = `...${snippet}`;
    if (end < content.length) snippet = `${snippet}...`;
    
    return snippet;
  }

  /**
   * Set AI provider for semantic search
   *Note = aiProvider;
    console.warn('AI provider set for LanceDB integration');
  }

  /**
   * Get backend statistics for LanceDB
   */
  async getBackendStats() {
    if(!this.db || !this.tables) {
      return null;
    }
    
    try {
      let _totalEntries = 0;

      // Count entries in each table
      for (const [namespace, table] of Object.entries(this.tables)) {
        try {
          const count = await table.countRows();
          _totalEntries += count;
        } catch(error) {
          console.warn(`Failed to count rows in ${namespace}: ${error.message}`);
        }
      }
      
      return {backend = null;
        this.tables = {};
      }
      
      console.warn('📚 Strategic Documents LanceDB closed with resource cleanup');
    } catch(_error) {
      console.warn(`Error closingLanceDB = new StrategicDocumentsManager();
