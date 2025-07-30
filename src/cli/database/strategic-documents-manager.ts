/**
 * Strategic Documents Database Manager - LanceDB Integration;
 * Handles all database operations using LanceDB for high-performance vector storage;
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { CliError } from '../core/cli-error.js';
import { inputValidator } from '../core/input-validator.js';

export class StrategicDocumentsManager {
  constructor(projectPath = null): unknown {
    this.projectPath = projectPath  ?? process.cwd();
    this.projectId = this.generateProjectId(this.projectPath);
    this.lancedb = null;
    this.db = null;
    this.tables = {};
;
    // Operation locks for atomic operations
    this.operationLocks = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Simple cleanup interval (no connection pooling needed for LanceDB)
    this.cleanupInterval = null;
;
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
;
    // Start simple cleanup routine
    this.startSimpleCleanup();
  }
  /**
   * Initialize LanceDB backend for strategic documents;
   */
  async initialize() {
    return this.withRetry(async () => {
      try {
        // Dynamic import for LanceDB
        this.lancedb = await import('@lancedb/lancedb');
    // // Ensure persist directory exists // LINT: unreachable code removed
        await fs.mkdir(this.dbPath, {recursive = await this.lancedb.connect(this.dbPath);
;
        // Initialize all tables with proper error handling
        await this.initializeTables();
;
        // Initialize project metadata
        await this.initializeProject();
;
        console.warn(`📚 Strategic Documents initialized forproject = `Failed to initialize strategic documents LanceDB: ${error.message}`;
        console.error(errorMsg);
        throw new CliError(errorMsg, 'DATABASE_INIT_ERROR');
      }
    }, 'initialize');
  }
  /**
   * Generate consistent project ID from path;
   */
  generateProjectId(_projectPath): unknown {
    return path;
    // .basename(projectPath); // LINT: unreachable code removed
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase()
  }
  /**
   * Initialize LanceDB tables for strategic documents;
   */
  async initializeTables() {
    for (const [namespace, tableName] of Object.entries(this.tableConfigs)) {
      try {
        // Try to open existing table
        this.tables[namespace] = await this.db.openTable(tableName);
        console.warn(`🧠 LanceDB table '${tableName}' opened`);
      } catch (/* _error */) {
        // Table doesn't exist, create it with appropriate schema
        const _schema = this.getTableSchema(namespace);
        this.tables[namespace] = await this.db.createTable(tableName, schema);
        console.warn(`🧠 LanceDB table '${tableName}' created`);
      }
    }
  }
  /**
   * Generate simple hash-based embedding for text (for testing);
   */
  generateSimpleEmbedding(text): unknown {
    // Simple hash-based embedding for demonstration
    const _embedding = new Array(128).fill(0);
    for (let i = 0; i < text.length; i++) {
      embedding[i % 128] += text.charCodeAt(i) / 1000;
    }
    return embedding;
    //   // LINT: unreachable code removed}
    /**
     * Get table schema for different document types;
     */
    getTableSchema(_namespace);
    : unknown
    if (existing.length === 0) {
      await this.tables.projects.add([projectData]);
      console.warn(`📋 Project initialized inLanceDB = await this.tables.projects;
        .query();
        .select('id', 'name', 'path', 'description', 'metadata');
        .where(`id = '${this.projectId}'`);
        .limit(1);
        .toArray();
;
      if(results.length > 0) {
        const _project = results[0];
        // Parse metadata back to object
        project.metadata = JSON.parse(project.metadata  ?? '{}');
        return project;
    //   // LINT: unreachable code removed}
      return null;
    //   // LINT: unreachable code removed} catch (/* error */) {
      console.warn(`Failed to get currentproject = =================== DOCUMENT OPERATIONS =====================
;
      /**
       * Create a new strategic document with semantic embedding (atomic operation);
       */
      async;
      createDocument({
    documentType,
      title,
      content,
      metadata = {},
      authorId = null,
      relevanceKeywords = [];
    }
    ): unknown
    {
      // Comprehensive input validation
      const _validatedData = inputValidator.validateDocumentData({
        documentType,
      title,
      content,
      metadata,
      authorId,
      relevanceKeywords,
    }
    )
    return this.withAtomicOperation(`create_doc_${validatedData.title}`, async () => {
      const _id = nanoid();
      // const __now = new Date().toISOString(); // LINT: unreachable code removed
      const _document = {
        id,
      projectId = {id = { ...document };
      returnDoc.metadata = JSON.parse(document.metadata);
      // returnDoc.relevanceKeywords = JSON.parse(document.relevanceKeywords); // LINT: unreachable code removed
      return returnDoc;
      //   // LINT: unreachable code removed} catch (/* error */) {
      throw new CliError(
        `Failed to create document "${validatedData.title}": ${error.message}`,
        'DOCUMENT_CREATE_ERROR'
      );
    });
  }
  /**
   * Get document by ID;
   */
  async;
  getDocument(documentId);
  : unknown
  {
    try {
      const
  _results = await this.tables.documents;
  .
  query();
  .
  select(
  id;
  ,
    'title',
    'content',
    'documentType',
    'status',
    'metadata',
    'relevanceKeywords',
    'version'
  )
  .
  where(`id = '${documentId}'`);
        .limit(1);
        .toArray();
;
      if(results.length === 0) {
        console.warn(`Document notfound = results[0];
  // Parse JSON fields back to objects
  document;
  .
  metadata = JSON.parse(document.metadata ?? '{}');
  document;
  .
  relevanceKeywords = JSON.parse(document.relevanceKeywords ?? '[]');
  return;
  document;
  //   // LINT: unreachable code removed} catch (/* error */) {
  console;
  .
  warn(`Failed to get document ${documentId}: ${error.message}`);
  return;
  null;
  //   // LINT: unreachable code removed}
}
/**
 * Update document with new content (atomic operation);
 */
async;
updateDocument(documentId, updates);
: unknown
return this.withAtomicOperation(`update_doc_${documentId}`, async () => {
      const _existingDoc = await this.getDocument(documentId);
    // if(!existingDoc) { // LINT: unreachable code removed
        throw new CliError(`Document notfound = new Date().toISOString();
;
        await this.tables.documents.add([updatedDoc]);
;
        // Update metadata atomically
        const _docMeta = {id = '${updatedDoc.documentType}_${documentId}'`);
        await this.tables.metadata.add([docMeta]);
;
        console.warn(`📝 Updated document = { ...updatedDoc };
        returnDoc.metadata = JSON.parse(updatedDoc.metadata);
    // returnDoc.relevanceKeywords = JSON.parse(updatedDoc.relevanceKeywords); // LINT: unreachable code removed
        return returnDoc;
    //   // LINT: unreachable code removed} catch (/* error */) {
        // Recoveryattempt = await this.getDocument(documentId);
    if(!document) {
      return false;
    //   // LINT: unreachable code removed}
;
    try {
      // Delete from both tables
      await this.tables.documents.delete(`id = '${documentId}'`);
      await this.tables.metadata.delete(`id = '${document.documentType}_${documentId}'`);
;
      console.warn(`🗑️ Deleteddocument = '',
    documentType = null,
    status = null,
    limit = 50;
  })
: unknown
{
  // Validate search parameters
  const _validatedParams = inputValidator.validateQueryParams({
      query,
  documentType,
  status,
  limit;
}
)
let _results = [];
try {
      if (validatedParams.query.trim()) {
        // Use LanceDB's query method for filtering
        let results;
;
        if(validatedParams.documentType && validatedParams.status) {
          results = await this.tables.documents.query();
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords');
            .where(`documentType = '${validatedParams.documentType}' AND status = '${validatedParams.status}'`);
            .limit(validatedParams.limit);
            .toArray();
        } else if(validatedParams.documentType) {
          results = await this.tables.documents.query();
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords');
            .where(`documentType = '${validatedParams.documentType}'`);
            .limit(validatedParams.limit);
            .toArray();
        } else if(validatedParams.status) {
          results = await this.tables.documents.query();
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords');
            .where(`status = '${validatedParams.status}'`);
            .limit(validatedParams.limit);
            .toArray();
        } else {
          results = await this.tables.documents.query();
            .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords');
            .limit(validatedParams.limit);
            .toArray();
        }
;
        // Filter by query text if provided
        if (validatedParams.query.trim()) {
          results = results.filter(_doc => ;
            doc.content.toLowerCase().includes(validatedParams.query.toLowerCase())  ?? doc.title.toLowerCase().includes(validatedParams.query.toLowerCase());
          );
        }
;
        // Map results and add relevance score
        results = results.map(result => ({
          ...result,metadata = [];
    }
;
    return results;
    //   // LINT: unreachable code removed}
;
  /**
   * Get documents by type;
   */;
  async getDocumentsByType(documentType, limit = 100): unknown ;
    try {
      let _results = await this.tables.documents;
        .query();
        .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords');
        .where(`documentType = '${documentType}'`);
        .limit(limit);
        .toArray();
;
      return results.map(doc => ({
        ...doc,metadata = 10): unknown {
    try {
      const _results = await this.tables.documents;
    // .query(); // LINT: unreachable code removed
        .select('id', 'title', 'content', 'documentType', 'status', 'metadata', 'relevanceKeywords');
        .limit(limit * 2) // Get more for filtering
        .toArray();
;
      // Filter by content similarity (simple text matching for now)
      const _filteredResults = results.filter(_doc => ;
        doc.content.toLowerCase().includes(objective.toLowerCase())  ?? doc.title.toLowerCase().includes(objective.toLowerCase());
      );
;
      return filteredResults.slice(0, limit).map(result => ({
        ...result,metadata = =================== DECISION OPERATIONS ====================
;
    // /** // LINT: unreachable code removed
   * Create a new queen council decision;
   */;
  async createDecision({
    objective,
    consensusResult,
    confidenceScore,
    supportingQueens,
    dissentingQueens = [],
    reasoning,
    documentReferences = [];
  }): unknown {
    // Comprehensive input validation
    const _validatedData = inputValidator.validateDecisionData({
      objective,
      consensusResult,
      confidenceScore,
      supportingQueens,
      dissentingQueens,
      reasoning,
      documentReferences;
    });
    const _id = nanoid();
    const __now = new Date().toISOString();
;
    const __decision = {
      id,
      projectId = {validatedData = await this.tables.decisions;
        .query();
        .select('id', 'objective', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'reasoning', 'documentReferences', 'status', 'metadata');
        .where(`id = '${decisionId}'`);
        .limit(1);
        .toArray();
;
      if(results.length === 0) {
        return null;
    //   // LINT: unreachable code removed}
;
      const _decision = results[0];
      // Parse JSON fields back to objects
      decision.supportingQueens = JSON.parse(decision.supportingQueens  ?? '[]');
      decision.dissentingQueens = JSON.parse(decision.dissentingQueens  ?? '[]');
      decision.documentReferences = JSON.parse(decision.documentReferences  ?? '[]');
      decision.metadata = JSON.parse(decision.metadata  ?? '{}');
;
      return decision;
    //   // LINT: unreachable code removed} catch (/* error */) {
      console.warn(`Failed to get decision ${decisionId}: ${error.message}`);
      return null;
    //   // LINT: unreachable code removed}
  }
;
  /**
   * Save queen analysis for a decision;
   */;
  async saveQueenAnalysis({
    decisionId,
    queenName,
    queenType,
    recommendation,
    confidenceScore,
    reasoning,
    documentInsights = {},
    processingTimeMs = 0;
  }
): unknown
{
    const _id = `${decisionId}_${queenName}`;
;
    const __analysis = {
      id,
      decisionId,
      queenName,
      queenType,
      recommendation,
      confidenceScore,
      reasoning,
      documentInsights,
      processingTimeMs,
      created_at = {queenName = await this.tables.analyses;
        .query();
        .select('id', 'decisionId', 'queenName', 'queenType', 'recommendation', 'confidenceScore', 'reasoning', 'documentInsights', 'processingTimeMs', 'metadata');
        .where(`decisionId = '${decisionId}'`);
        .toArray();
;
      return results.map(analysis => ({
        ...analysis,documentInsights = 20): unknown {
    try {
      const _results = await this.tables.decisions;
    // .query(); // LINT: unreachable code removed
        .select('id', 'objective', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'reasoning', 'documentReferences', 'status', 'metadata', 'created_at');
        .limit(limit * 2) // Get more for sorting
        .toArray();
;
      // Parse and sort decisions
      const _decisions = results;
        .map(decision => (
          ...decision,supportingQueens = > new Date(b.created_at) - new Date(a.created_at));
        .slice(0, limit);
;
      // Enhance with analysis data
      for(const decision of decisions) {
        const _analyses = await this.getDecisionAnalyses(decision.id);
        decision.total_analyses = analyses.length;
        decision.avg_queen_confidence = analyses.length > 0 ;
          ? analyses.reduce((sum, a) => sum + a.confidenceScore, 0) / analyses.length = =================== ADR OPERATIONS =====================
;
  /**
   * Create Architecture Decision Record;
   */;
  async createADR({
    decisionId,
    title,
    context,
    decision,
    consequences,
    implementationNotes = '',
    tags = [];
  }): unknown ;
    // Get next ADR number
    try {
      const _existingADRs = await this.tables.adrs;
        .query();
        .select('id', 'adrNumber');
        .toArray();
      const __adrNumber = existingADRs.length + 1;
;
      const _id = nanoid();
      const __now = new Date().toISOString();
;
      const __adr = {
        id,projectId = await this.tables.adrs;
        .query();
        .select('id', 'adrNumber', 'title', 'context', 'decision', 'consequences', 'implementationNotes', 'tags', 'status', 'metadata');
        .where(`id = '${adrId}'`);
        .limit(1);
        .toArray();
;
      if(results.length === 0) {
        return null;
    //   // LINT: unreachable code removed}
;
      const _adr = results[0];
      // Parse JSON fields back to objects
      adr.tags = JSON.parse(adr.tags  ?? '[]');
      adr.metadata = JSON.parse(adr.metadata  ?? '{}');
;
      return adr;
    //   // LINT: unreachable code removed} catch (/* error */) {
      console.warn(`Failed to get ADR ${adrId}: ${error.message}`);
      return null;
    //   // LINT: unreachable code removed}
;
  /**
   * Get all ADRs for project;
   */;
  async getADRs() ;
    try {
      const _results = await this.tables.adrs;
        .query();
        .select('id', 'adrNumber', 'title', 'context', 'decision', 'consequences', 'implementationNotes', 'tags', 'status', 'metadata');
        .toArray();
;
      return results;
    // .map(adr => ({ // LINT: unreachable code removed
          ...adr,tags = > b.adrNumber - a.adrNumber);
    } catch (/* _error */) {
      console.warn(`Failed to getADRs = =================== ANALYTICS ====================
;
  /**
   * Get decision analytics;
   */;
  async getDecisionAnalytics(days = 30): unknown {
    const _cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const _cutoff = cutoffDate.toISOString();
;
    try {
      const _allDecisions = await this.tables.decisions;
        .query();
        .select('id', 'consensusResult', 'confidenceScore', 'supportingQueens', 'dissentingQueens', 'status', 'metadata', 'created_at');
        .toArray();
      const _recentDecisions = allDecisions;
        .map(d => ({
          ...d,supportingQueens = > d.created_at >= cutoff);
;
    const _totalDecisions = recentDecisions.length;
;
      for(const decision of recentDecisions) {
        for(const queen of decision.supportingQueens) {
          queenCounts[queen] = (queenCounts[queen]  ?? 0) + 1;
        }
      }
;
    const _stats = [];
;
    for(const docType of documentTypes) {
      const _docs = await this.getDocumentsByType(docType);
;
      stats.push({document_type = =================== CONNECTION POOLING & PERFORMANCE ====================
;
  /**
   * Start simple cleanup routine for cache only;
   */;
  startSimpleCleanup() {
    if (this.cleanupInterval) return;
    // ; // LINT: unreachable code removed
    this.cleanupInterval = setInterval(() => {
      try {
        this.cleanupCache();
      } catch (/* error */) {
        console.warn('Cache cleanuperror = null;
    }
  }
;
  /**
   * Simple connection cleanup - removed complex pooling;
   */;
  cleanupConnections() {
    //Simplified = process.memoryUsage();
    const _heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
;
    if(heapUsedMB > 500) {
      this.emergencyMemoryCleanup();
    }
  }
;
  /**
   * Removed complex connection tracking - simplified;
   */;
  trackTableConnection() {
    //Simplified = Array.from(this.connectionPool.entries())
      .sort((a, b) => b[1].lastUsed - a[1].lastUsed); // Most recent first
    
    const _keepCount = Math.min(2, connections.length); // Keep only 2 connections
    const _toClose = connections.slice(keepCount);
;
    for(const [key, connection] of toClose) {
      this.closeConnection(connection);
      this.connectionPool.delete(key);
    }
;
    // Force garbage collection if available
    if(global.gc) {
      global.gc();
    }
;
    console.warn(`🧹 Emergency cleanupcompleted = Date.now();
    const _removedCount = 0;
;
    // Remove expired entries
    for (const [key, entry] of this.queryCache.entries()) {
      if(now - entry.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
        removedCount++;
      }
    }
;
    // Keep cache size bounded (simple approach)
    if(this.queryCache.size > this.maxCacheSize) {
      const _entries = Array.from(this.queryCache.entries());
        .sort((a, b) => a[1].timestamp - b[1].timestamp); // Oldest first
      
      const _toRemove = entries.slice(0, this.queryCache.size - this.maxCacheSize);
;
      for(const [key] of toRemove) {
        this.queryCache.delete(key);
        removedCount++;
      }
    }
;
    // Reset performance metrics periodically to prevent unbounded growth
    if(now - this.performanceMetrics.lastReset > this.maxMetricsAge) {
      this.resetPerformanceMetrics();
    }
;
    // Bound metrics history
    if(this.metricsHistory.length > this.maxMetricsHistory) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxMetricsHistory);
    }
;
    if(removedCount > 0) {
        return { ...result }; // Shallow copy as fallback
      return result;
    //   // LINT: unreachable code removed}
  }
;
  /**
   * Execute query with caching and performance tracking;
   */;
  async executeQuery(table, operation, params = {}, cacheKey = null): unknown {
    const _startTime = Date.now();
;
    try {
      // Check cache first
      if(cacheKey) {
        const _cached = this.getCachedQuery(cacheKey);
        if(cached) {
          return cached;
    //   // LINT: unreachable code removed}
      }
;
      // Execute query
      let result;
      switch(operation) {
        case 'query':;
          result = await table.query();
            .select(params.select  ?? '*');
            .where(params.where  ?? '');
            .limit(params.limit  ?? 1000);
            .toArray();
          break;
        case 'search':;
          result = await table.search();
            .where(params.where  ?? '');
            .limit(params.limit  ?? 50);
            .toArray();
          break;
        case 'add':;
          result = await table.add(params.data);
          break;
        case 'delete':;
          result = await table.delete(params.where);
          break;
        case 'countRows':;
          result = await table.countRows();
          break;default = Date.now() - startTime;
      this.performanceMetrics.queriesExecuted++;
;
      // Simple bounds check to prevent counter overflow
      if(this.performanceMetrics.queriesExecuted > 10000) {
        this.performanceMetrics.queriesExecuted = 0;
        this.performanceMetrics.operationsCompleted = 0;
        this.performanceMetrics.totalQueryTime = 0;
        this.performanceMetrics.cacheHits = 0;
      }
      this.performanceMetrics.totalQueryTime += queryTime;
      this.performanceMetrics.averageQueryTime = ;
        this.performanceMetrics.totalQueryTime / this.performanceMetrics.queriesExecuted;
;
      // Add to bounded metrics history
      this.metricsHistory.push({timestamp = this.metricsHistory.slice(-this.maxMetricsHistory);
      }
;
      // Clean old accumulated metrics to prevent unbounded growth
      this.cleanupOldMetrics();
;
      return result;
    //   // LINT: unreachable code removed} catch (/* _error */) {
      const _queryTime = Date.now() - startTime;
      console.warn(`Query failed after ${queryTime}ms = this.metricsHistory.slice(-this.maxMetricsHistory);
    }
  }
;
  /**
   * Get performance metrics with cleanup;
   */;
  getPerformanceMetrics() {
    // Clean old metrics before returning
    this.cleanupOldMetrics();
    // ; // LINT: unreachable code removed
    return {
      ...this.performanceMetrics,cacheSize = =================== ATOMIC OPERATIONS & RELIABILITY ====================
;
    // /** // LINT: unreachable code removed
   * Execute operation with atomic locking to prevent race conditions;
   */;
  async withAtomicOperation(operationKey, operation): unknown {
    const _lockKey = `${this.projectId}_${operationKey}`;
;
    // Wait for any existing operation to complete
    while (this.operationLocks.has(lockKey)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
;
    // Acquire lock
    this.operationLocks.set(lockKey, true);
;
    try {
      const _result = await operation();
      return result;
    //   // LINT: unreachable code removed} finally {
      // Always release lock
      this.operationLocks.delete(lockKey);
    }
  }
;
  /**
   * Execute operation with retry logic and exponential backoff;
   */;
  async withRetry(operation, operationName = 'operation'): unknown {
    let lastError;
;
    for(let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
    //   // LINT: unreachable code removed} catch (/* error */) {
        lastError = error;
;
        if(attempt === this.maxRetries) {
          console.error(`\u26a0\ufe0f  ${operationName} failed after ${this.maxRetries}attempts = this.retryDelay * 2 ** (attempt - 1); // Exponential backoff
        console.warn(`\u26a0\ufe0f  ${operationName} attempt ${attempt} failed, retrying in ${delay}ms = > setTimeout(resolve, delay));
      }
    }
;
    throw new CliError(`${operationName} failed after ${this.maxRetries} attempts = {};
      for (const [namespace, table] of Object.entries(this.tables)) {
        try {
          const __count = await table.countRows();
          tableStatus[namespace] = { status = {status = Object.values(tableStatus).some(t => t.status === 'unhealthy');
;
      return {status = []): unknown {
    if(!_data  ?? typeof data !== 'object') {
      throw new CliError('Invalid input = { ...data };
    // for (const [key, value] of Object.entries(sanitized)) { // LINT: unreachable code removed
      if(typeof value === 'string') {
        // Basic SQL injection prevention and sanitization
        sanitized[key] = value;
          .replace(/'/g, "''")  // Escape single quotes
          .replace(/\x00/g, '') // Remove null bytes
          .trim();
      }
    }
;
    return sanitized;
    //   // LINT: unreachable code removed}
;
  // ==================== HELPER METHODS ====================

  /**
   * Generate content snippet for search results;
   */;
  generateSnippet(content, query, maxLength = 200): unknown {
    if (!query) return `${content.substring(0, maxLength)}...`;
    // ; // LINT: unreachable code removed
    const _queryWords = query.toLowerCase().split(/\s+/);
    const _lowerContent = content.toLowerCase();
;
    // Find first occurrence of any query word
    const _firstIndex = -1;
    for(const word of queryWords) {
      const _index = lowerContent.indexOf(word);
      if (index !== -1 && (firstIndex === -1  ?? index < firstIndex)) {
        firstIndex = index;
      }
    }
;
    if(firstIndex === -1) {
      return `${content.substring(0, maxLength)}...`;
    //   // LINT: unreachable code removed}
;
    // Extract snippet around the match
    const _start = Math.max(0, firstIndex - 50);
    const _end = Math.min(content.length, start + maxLength);
    const _snippet = content.substring(start, end);
;
    if (start > 0) snippet = `...${snippet}`;
    if (end < content.length) snippet = `${snippet}...`;
;
    return snippet;
    //   // LINT: unreachable code removed}
;
  /**
   * Set AI provider for semantic search;
   *Note = aiProvider;
    console.warn('AI provider set for LanceDB integration');
  }
;
  /**
   * Get backend statistics for LanceDB;
   */;
  async getBackendStats() 
    if(!this.db  ?? !this.tables) {
      return null;
    //   // LINT: unreachable code removed}
;
    try {
      const __totalEntries = 0;
;
      // Count entries in each table
      for (const [namespace, table] of Object.entries(this.tables)) {
        try {
          const _count = await table.countRows();
          _totalEntries += count;
        } catch (/* error */) {
          console.warn(`Failed to count rows in ${namespace}: ${error.message}`);
        }
      }
;
      return {backend = null;
    // this.tables = { // LINT: unreachable code removed};
      }
;
      console.warn('📚 Strategic Documents LanceDB closed with resource cleanup');
    } catch (/* _error */) 
      console.warn(`Error closingLanceDB = new StrategicDocumentsManager();
;
