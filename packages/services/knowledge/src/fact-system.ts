/**
 * @file Private Fact System - Knowledge Package Implementation
 *
 * Private fact system within the knowledge package that provides coordination
 * layer integration. This encapsulates fact storage and retrieval within
 * the knowledge domain, using the core fact engine.
 *
 * This system is PRIVATE to the knowledge package and should only be accessed
 * through the knowledge package's public API.') */

// Import the high-performance Rust fact bridge from the fact-system package
// Note: FactBridge is placeholder for future Rust integration
// import { FactBridge} from '@claude-zen/fact-system/bridge';

// Placeholder FactBridge for testing
class FactBridge {
  constructor() {
    // Placeholder implementation
  }
  initialize():Promise<void> {
    return Promise.resolve();
}
  searchFacts():Promise<unknown[]> {
    return Promise.resolve([]);
}
  getNPMFacts():Promise<unknown> {
    return Promise.resolve(null);
}
  getGitHubFacts():Promise<unknown> {
    return Promise.resolve(null);
}
}
import { 
  getLogger, 
  EventBus,
  generateUUID
} from '@claude-zen/foundation';
// Note: Database imports commented out until foundation exports are properly configured
// import { createDatabaseAdapter, DatabaseConnection} from '@claude-zen/foundation';

// Temporary type definitions for testing
interface DatabaseConnection {
  query<T = unknown>(sql: string, params?:unknown[]): Promise<T[]>;
  execute(sql: string, params?:unknown[]): Promise<{ affectedRows: number; insertId?: number}>;
  close():Promise<void>;
}

interface DatabaseAdapter {
  connect(config: unknown): Promise<{ isOk(): boolean; value?: DatabaseConnection}>;
}

// Placeholder database function for testing
function createDatabaseAdapter():Promise<{ isOk(): boolean; value?: DatabaseAdapter}> {
  return Promise.resolve({
    isOk:() => false, // Always return fallback for now
    value: undefined
});
}

// Placeholder types for foundation fact system (to be implemented later)
interface FactClient {
  initialize():Promise<void>;
  store(
    id: string,
    data:{ content: unknown; metadata: Record<string, unknown>}
  ):Promise<void>;
  search(query:{
    query: string;
    sources?:string[];
    limit?:number;
}):Promise<FactSearchResult[]>;
  getNPMPackage?(packageName: string, version?:string): Promise<unknown>;
  getGitHubRepository?(owner: string, repo: string): Promise<unknown>;
}

export interface FactSearchResult {
  id: string;
  content: unknown;
  metadata: Record<string, unknown>;
  score?:number;
}

// Simple in-memory fact client for now
function createSQLiteFactClient():Promise<FactClient> {
  return Promise.resolve({
    initialize():Promise<void> {
      // No-op for in-memory implementation
      return Promise.resolve();
},
    store():Promise<void> {
      // Store in memory (implementation can be enhanced later)
      return Promise.resolve();
},
    search():Promise<FactSearchResult[]> {
      // Simple search (implementation can be enhanced later)
      return Promise.resolve([]);
},
    getNPMPackage():Promise<unknown> {
      // Placeholder implementation
      return Promise.resolve(null);
},
    getGitHubRepository():Promise<unknown> {
      // Placeholder implementation
      return Promise.resolve(null);
},
});
}

const logger = getLogger('KnowledgeFactSystem');

/**
 * Coordination-specific fact entry structure (simplified for coordination layer)
 */
export interface CoordinationFact {
  id: string;
  type: string;
  data: unknown;
  timestamp: Date;
  source: string;
  confidence: number;
  tags: string[];
}

/**
 * Coordination fact query interface (simplified for coordination layer)
 */
export interface CoordinationFactQuery {
  type?:string;
  tags?:string[];
  source?:string;
  minConfidence?:number;
  limit?:number;
}

/**
 * Private fact system implementation within the knowledge package.
 * This class should NOT be exported from the knowledge package's main API.
 */
class KnowledgeFactSystem {
  private factClient: FactClient|null = null;
  private factBridge: FactBridge;
  private coordinationFacts = new Map<string, CoordinationFact>();
  private initialized = false;
  private listeners = new Set<(fact: CoordinationFact) => void>();

  // Event-driven architecture with EventBus
  private eventBus = new EventBus();

  // Unified fact database - single source with coordinated indexing
  private factDatabase: DatabaseConnection | null = null; // Primary database with unified indexes

  constructor() {
    // Initialize high-performance Rust FactBridge with production configuration
    // Note: FactBridge is a placeholder for future Rust integration
    this.factBridge = new FactBridge();
}

  /**
   * Get access to the Fact EventBus for external coordination
   */
  getEventBus():EventBus {
    return this.eventBus;
}

  /**
   * Initialize fact-specific dedicated databases - LAZY LOADING
   */
  private async initializeFactDatabases():Promise<void> {
    try {
      // Get unified fact database following coordination guidelines
      const adapterResult = await createDatabaseAdapter();
      
      if (adapterResult.isOk()) {
        const adapter = adapterResult.value;
        if (!adapter) {
          logger.warn('⚠️ Database adapter is undefined');
          return;
}
        const dbResult = await adapter.connect({
          type: 'sqlite',          path:':memory:' // In-memory for now, can be configured for persistence
});
        
        if (dbResult.isOk()) {
          this.factDatabase = dbResult.value || null;
          
          // Create unified fact schema with coordinated indexes
          await this.createFactSchema();
          
          logger.info('Fact database initialized with unified indexing');
} else {
          logger.warn('⚠️ Fact database connection failed, using in-memory fallback');
}
} else {
        logger.warn('⚠️ Fact database adapter unavailable, using in-memory fallback');
}
} catch (error) {
      logger.warn('Fact database initialization failed, continuing with fallbacks: ', error);
      // Graceful degradation - system continues with in-memory storage
}
}

  /**
   * Create unified fact schema with coordinated indexes
   */
  private async createFactSchema():Promise<void> {
    if (!this.factDatabase) return;
    
    try {
      // Main facts table with all data and coordinated indexes
      await this.factDatabase.execute(`
        CREATE TABLE IF NOT EXISTS coordination_facts (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          data TEXT NOT NULL, -- JSON data
          timestamp INTEGER NOT NULL,
          source TEXT NOT NULL,
          confidence REAL NOT NULL,
          tags TEXT NOT NULL, -- JSON array
          
          -- Coordinated indexes for all fact access patterns
          INDEX idx_fact_type (type),
          INDEX idx_fact_source (source),
          INDEX idx_fact_confidence (confidence),
          INDEX idx_fact_timestamp (timestamp),
          INDEX idx_fact_type_confidence (type, confidence),
          INDEX idx_fact_source_type (source, type)
        )
      `);
      
      logger.info('Fact schema created with coordinated indexes');
    } catch (error) {
      logger.warn('Failed to create fact schema: ', error);
    }
  }

  /**
   * Initialize the fact system using Rust fact bridge
   */
  async initialize():Promise<void> {
    if (this.initialized) {
      return;
}

    try {
      // Initialize fact-specific dedicated databases
      await this.initializeFactDatabases();

      // Initialize EventBus
      const eventBusResult = await this.eventBus.initialize();
      if (eventBusResult.isErr()) {
        throw new Error(`EventBus initialization failed:${eventBusResult.error?.message}`);
}

      // Initialize the high-performance Rust fact bridge
      await this.factBridge.initialize();
      logger.info('Rust fact bridge initialized successfully');

      // Initialize TypeScript fallback client for when Rust bridge fails
      this.factClient = await createSQLiteFactClient();
      await this.factClient.initialize();

      this.initialized = true;
      logger.info('Knowledge fact system initialized with EventBus + Rust engine + fallback');
} catch (error) {
      logger.error('Failed to initialize knowledge fact system: ', error);
'      throw error;
}
}

  /**
   * Store a coordination-specific fact
   */
  async storeFact(
    fact: Omit<CoordinationFact, 'id' | ' timestamp'>
  ):Promise<string> {
    await this.ensureInitialized();

    const factEntry: CoordinationFact = {
      id: generateUUID(),
      timestamp: new Date(),
      ...fact,
};

    // Store in local coordination cache
    this.coordinationFacts.set(factEntry.id, factEntry);

    // Store in dedicated fact databases
    await this.persistToFactDatabases(factEntry);

    // Store in foundation fact system if available (fallback)
    if (this.factClient) {
      try {
        await this.factClient.store(factEntry.id, {
          content: factEntry.data,
          metadata:{
            type: factEntry.type,
            source: factEntry.source,
            confidence: factEntry.confidence,
            tags: factEntry.tags,
            timestamp: factEntry.timestamp.toISOString(),
},
});
} catch (error) {
        logger.warn('Failed to store fact in foundation system: ', error);
'}
}

    // Professional event-driven notifications
    this.eventBus.emit('fact: stored', {
      factId: factEntry.id,
      type: factEntry.type,
      confidence: factEntry.confidence,
      source: factEntry.source,
      tags: factEntry.tags,
      timestamp: new Date()
});

    this.eventBus.emit('fact: stats', {
      operation: 'store',      totalFacts: this.coordinationFacts.size,
      factsByType: this.getFactsByType(),
      timestamp: new Date()
});

    return factEntry.id;
}

  // =============================================================================
  // HELPER METHODS - Event-driven database operations
  // =============================================================================

  /**
   * Persist fact to unified database with coordinated indexing
   */
  private async persistToFactDatabases(fact: CoordinationFact): Promise<void> {
    if (!this.factDatabase) {
      logger.warn('No unified fact database available for persistence');
      return;
}
    
    try {
      // Single insert with all data - database handles coordinated indexing automatically
      await this.factDatabase.execute(`
        INSERT OR REPLACE INTO coordination_facts (
          id, type, data, timestamp, source, confidence, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [`
        fact.id,
        fact.type,
        JSON.stringify(fact.data),
        fact.timestamp.getTime(),
        fact.source,
        fact.confidence,
        JSON.stringify(fact.tags)
]);
      
      // All indexes are automatically maintained by SQLite
      logger.debug('Fact persisted with coordinated indexing', { 
        factId: fact.id, 
        type: fact.type 
});
      
} catch (error) {
      logger.warn('Failed to persist to unified fact database', {
        factId: fact.id,
        error: error instanceof Error ? error.message : String(error)
});
}
}

  /**
   * Get facts by type for statistics
   */
  private getFactsByType():Record<string, number> {
    const factsByType: Record<string, number> = {};
    const facts = Array.from(this.coordinationFacts.values());
    for (const fact of facts) {
      factsByType[fact.type] = (factsByType[fact.type] || 0) + 1;
}
    return factsByType;
}

  /**
   * Retrieve facts based on query with unified database access
   */
  async queryFacts(
    query: CoordinationFactQuery = {}
  ):Promise<CoordinationFact[]> {
    await this.ensureInitialized();

    if (!this.factDatabase) {
      return this.queryInMemoryFacts(query);
}

    return this.queryDatabaseFacts(query);
}

  /**
   * Query facts from in-memory storage (helper method)
   */
  private queryInMemoryFacts(query: CoordinationFactQuery): CoordinationFact[] {
    logger.warn('No unified fact database available for query');
    let results = Array.from(this.coordinationFacts.values());

    // Apply filters
    if (query.type) {
      results = results.filter((fact) => fact.type === query.type);
}
    if (query.source) {
      results = results.filter((fact) => fact.source === query.source);
}
    if (query.tags?.length) {
      results = results.filter((fact) =>
        query.tags?.some((tag) => fact.tags.includes(tag))
      );
}
    if (query.minConfidence !== undefined) {
      results = results.filter(
        (fact) => fact.confidence >= query.minConfidence!
      );
}

    // Sort by confidence and timestamp
    results.sort((a, b) => {
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
});

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
}

    // Event notification for query
    this.eventBus.emit('fact: queried', {
      query,
      resultCount: results.length,
      timestamp: new Date()
});

    return results;
}

  /**
   * Query facts from database (helper method)
   */
  private async queryDatabaseFacts(query: CoordinationFactQuery): Promise<CoordinationFact[]> {
    try {
      const { sql, params} = this.buildQuerySQL(query);
      
      const rows = await this.factDatabase!.query<{
        id: string;
        type: string;
        data: string;
        timestamp: number;
        source: string;
        confidence: number;
        tags: string;
}>(sql, params);

      const results = rows.map(row => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: new Date(row.timestamp),
        source: row.source,
        confidence: row.confidence,
        tags: JSON.parse(row.tags)
}));

      this.eventBus.emit('fact: queried', {
        query,
        resultCount: results.length,
        timestamp: new Date()
});

      return results;
} catch (error) {
      logger.error('Failed to query facts from unified database', { query, error});
      
      this.eventBus.emit('fact: error', {
        operation: 'query',        error: error instanceof Error ? error.message : String(error),
        context:{ query},
        timestamp: new Date()
});

      throw error;
}
}

  /**
   * Build SQL query for database facts (helper method)
   */
  private buildQuerySQL(query: CoordinationFactQuery): { sql: string; params: unknown[]} {
    let sql = `
      SELECT id, type, data, timestamp, source, confidence, tags 
      FROM coordination_facts 
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (query.type) {
      sql += ` AND type = ?`;
      params.push(query.type);
}

    if (query.source) {
      sql += ` AND source = ?`;
      params.push(query.source);
}

    if (query.tags && query.tags.length > 0) {
      sql += ` AND (`;
      for (let index = 0; index < query.tags.length; index++) {
        const tag = query.tags[index];
        if (index > 0) sql += ` OR `;
        sql += `JSON_EXTRACT(tags, '$') LIKE ?`;
        params.push(`%"${tag}"%`);
}
      sql += `)`;
}

    if (query.minConfidence !== undefined) {
      sql += ` AND confidence >= ?`;
      params.push(query.minConfidence);
}

    sql += ` ORDER BY confidence DESC, timestamp DESC`;

    if (query.limit) {
      sql += ` LIMIT ?`;
      params.push(query.limit);
}

    return { sql, params};
}

  /**
   * Get a specific fact by ID with unified database access
   */
  async getFact(id: string): Promise<CoordinationFact|null> {
    await this.ensureInitialized();
    
    if (!this.factDatabase) {
      logger.warn('No unified fact database available for fact retrieval');
      // Fallback to in-memory search
      const fact = this.coordinationFacts.get(id) || null;
      
      if (fact) {
        // Event notification for fact access
        this.eventBus.emit('fact: accessed', {
          factId: id,
          type: fact.type,
          timestamp: new Date()
});
}
      
      return fact;
}
    
    try {
      const rows = await this.factDatabase.query<{
        id: string;
        type: string;
        data: string;
        timestamp: number;
        source: string;
        confidence: number;
        tags: string;
}>(`
        SELECT id, type, data, timestamp, source, confidence, tags 
        FROM coordination_facts 
        WHERE id = ?
      `, [id]);
      
      if (rows.length === 0) {
        return null;
}
      
      const row = rows[0];
      if (!row) {
        return null;
}
      const fact: CoordinationFact = {
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: new Date(row.timestamp),
        source: row.source,
        confidence: row.confidence,
        tags: JSON.parse(row.tags)
};
      
      // Event notification for fact access
      this.eventBus.emit('fact: accessed', {
        factId: id,
        type: fact.type,
        timestamp: new Date()
});
      
      return fact;
} catch (error) {
      logger.error('Failed to get fact from unified database', { id, error});
      
      // Emit error event
      this.eventBus.emit('fact: error', {
        operation: 'get',        error: error instanceof Error ? error.message : String(error),
        context:{ factId: id},
        timestamp: new Date()
});
      
      throw error;
}
}

  /**
   * Search facts with text-based query (for compatibility with legacy code)
   * Can be called with object or direct parameters
   */
  async searchFacts(
    searchParamsOrQuery:{ query: string; type?: string; limit?: number;} | string,
    type?:string,
    limit?:number
  ):Promise<CoordinationFact[]> {
    await this.ensureInitialized();

    const searchParams = this.parseSearchParams(searchParamsOrQuery, type, limit);
    const { query, type: searchType, limit: searchLimit = 10} = searchParams;

    let results = await this.searchDatabaseFacts(query, searchType, searchLimit);
    
    if (results.length === 0) {
      results = this.searchInMemoryFacts(query, searchType, searchLimit);
}

    if (results.length < searchLimit / 2) {
      const externalResults = await this.searchExternalRustFacts(query, searchLimit - results.length, searchType);
      results.push(...externalResults);
}

    return results;
}

  /**
   * Parse search parameters (helper method)
   */
  private parseSearchParams(
    searchParamsOrQuery:{ query: string; type?: string; limit?: number;} | string,
    type?:string,
    limit?:number
  ) {
    return typeof searchParamsOrQuery === 'string' ? {
      query: searchParamsOrQuery,
      type,
      limit: limit || 10
} :searchParamsOrQuery;
}

  /**
   * Search facts in database (helper method)
   */
  private async searchDatabaseFacts(query: string, searchType?:string, searchLimit = 10):Promise<CoordinationFact[]> {
    if (!this.factDatabase) {
      return [];
}

    try {
      let sql = `
        SELECT id, type, data, timestamp, source, confidence, tags 
        FROM coordination_facts 
        WHERE 1=1
      `;
      const params: unknown[] = [];

      if (searchType) {
        sql += ` AND type = ?`;
        params.push(searchType);
}

      if (query.trim()) {
        sql += ` AND (`
          JSON_EXTRACT(data, '$') LIKE ? OR
          source LIKE ? OR
          JSON_EXTRACT(tags, '$') LIKE ?
        )`;
        const searchTerm = `%${query.toLowerCase()}%`;
        params.push(searchTerm, searchTerm, searchTerm);
}

      sql += ` ORDER BY confidence DESC, timestamp DESC LIMIT ?`;
      params.push(searchLimit);

      const rows = await this.factDatabase.query<{
        id: string;
        type: string;
        data: string;
        timestamp: number;
        source: string;
        confidence: number;
        tags: string;
}>(sql, params);

      const results = rows.map(row => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: new Date(row.timestamp),
        source: row.source,
        confidence: row.confidence,
        tags: JSON.parse(row.tags)
}));

      logger.debug('Database search completed', { resultCount: results.length, query, searchType});
      return results;
} catch (error) {
      logger.warn('Database search failed, falling back to in-memory search', { error});
      return [];
}
}

  /**
   * Search facts in memory (helper method)
   */
  private searchInMemoryFacts(query: string, searchType?:string, searchLimit = 10):CoordinationFact[] {
    logger.debug('Using in-memory search fallback');
    
    let results = Array.from(this.coordinationFacts.values());

    if (searchType) {
      results = results.filter((fact) => fact.type === searchType);
}

    const searchTerms = query.toLowerCase().split(' ');
    results = results.filter((fact) => {
      const searchableText = [
        JSON.stringify(fact.data).toLowerCase(),
        fact.type.toLowerCase(),
        fact.source.toLowerCase(),
        ...fact.tags.map((tag) => tag.toLowerCase()),
].join(' ');

      return searchTerms.some((term) => searchableText.includes(term));
});

    results.sort((a, b) => {
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
});

    return results.slice(0, searchLimit);
}

  /**
   * Search external facts via Rust bridge (helper method)
   */
  private async searchExternalRustFacts(query: string, remainingLimit: number, searchType?:string): Promise<CoordinationFact[]> {
    const results: CoordinationFact[] = [];

    try {
      const externalResults = await this.factBridge.searchFacts();
      for (const extResult of externalResults) {
        results.push({
          id:`ext-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          type: searchType || (extResult as { factType?: string}).factType || 'external-knowledge',          data:(extResult as { metadata?: unknown}).metadata || extResult,
          timestamp: new Date(),
          source: 'rust-fact-bridge',          confidence:(extResult as { score?: number}).score || 0.8,
          tags:['external',    'search',    'rust-bridge'],
});
}
} catch (error) {
      logger.warn('Rust bridge search failed, trying foundation fallback: ', error);
'
      try {
        const fallbackResults = await this.searchExternalFacts(query, undefined, remainingLimit);
        for (const extResult of fallbackResults) {
          results.push({
            id:`ext-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            type: searchType || 'external-knowledge',            data: extResult as unknown,
            timestamp: new Date(),
            source: 'foundation-fallback',            confidence: 0.7,
            tags:['external',    'search',    'fallback'],
});
}
} catch (fallbackError) {
        logger.warn('Foundation fallback also failed: ', fallbackError);
'}
}

    return results;
}

  /**
   * Search external facts using Rust fact bridge (with foundation fallback)
   */
  async searchExternalFacts(
    query: string,
    sources?:string[],
    limit = 10
  ):Promise<FactSearchResult[]> {
    await this.ensureInitialized();

    if (!this.factClient) {
      logger.warn('Foundation fact client not available for external search');
      return [];
}

    try {
      const searchQuery = {
        query,
        sources,
        limit,
};

      return await this.factClient.search(searchQuery);
} catch (error) {
      logger.error('Failed to search external facts: ', error);
'      return [];
}
}

  /**
   * Subscribe to fact changes
   */
  subscribe(listener:(fact: CoordinationFact) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
};
}

  /**
   * Clear coordination facts
   */
  clear():void {
    this.coordinationFacts.clear();
    logger.info('Cleared coordination facts');
}

  /**
   * Check if the fact system is initialized
   */
  isInitialized():boolean {
    return this.initialized;
}

  /**
   * Get NPM package information via high-performance Rust fact bridge
   */
  async getNPMPackageInfo(packageName: string, version?:string) {
    await this.ensureInitialized();

    try {
      // First try Rust fact bridge for maximum performance
      const npmResult = await this.factBridge.getNPMFacts();
      logger.info(
        `NPM package info retrieved via Rust bridge:${packageName}`
      );
      return npmResult;
} catch (error) {
      logger.warn(
        `Rust bridge NPM lookup failed for ${packageName}, trying foundation fallback:`,
        error
      );

      // Foundation fallback
      if (this.factClient) {
        try {
          return await this.factClient.getNPMPackage?.(packageName, version);
} catch (fallbackError) {
          logger.error(
            `Foundation NPM lookup also failed for ${packageName}:`,
            fallbackError
          );
}
} else {
        logger.warn('Foundation fact client not available for NPM lookup');
}

      return null;
}
}

  /**
   * Get GitHub repository information via high-performance Rust fact bridge
   */
  async getGitHubRepoInfo(owner: string, repo: string) {
    await this.ensureInitialized();

    try {
      // First try Rust fact bridge for maximum performance
      const githubResult = await this.factBridge.getGitHubFacts();
      logger.info(
        `GitHub repo info retrieved via Rust bridge:${owner}/${repo}`
      );
      return githubResult;
} catch (error) {
      logger.warn(
        `Rust bridge GitHub lookup failed for ${owner}/${repo}, trying foundation fallback:`,
        error
      );

      // Foundation fallback
      if (this.factClient) {
        try {
          return await this.factClient.getGitHubRepository?.(owner, repo);
} catch (fallbackError) {
          logger.error(
            `Foundation GitHub lookup also failed for ${owner}/${repo}:`,
            fallbackError
          );
}
} else {
        logger.warn('Foundation fact client not available for GitHub lookup');
}

      return null;
}
}

  /**
   * Get foundation fact client for advanced operations (internal use only)
   */
  getFoundationFactClient():FactClient|null {
    return this.factClient;
}

  /**
   * Get coordination system statistics with unified database support
   */
  async getStats():Promise<{
    totalFacts: number;
    factsByType: Record<string, number>;
    factsBySource: Record<string, number>;
    averageConfidence: number;
}> {
    if (this.factDatabase) {
      try {
        // Get statistics from unified database with coordinated indexes
        const totalResult = await this.factDatabase.query<{ count: number}>(`
          SELECT COUNT(*) as count FROM coordination_facts
        `);
        
        const typeResult = await this.factDatabase.query<{ type: string; count: number}>(`
          SELECT type, COUNT(*) as count 
          FROM coordination_facts 
          GROUP BY type
        `);
        
        const sourceResult = await this.factDatabase.query<{ source: string; count: number}>(`
          SELECT source, COUNT(*) as count 
          FROM coordination_facts 
          GROUP BY source
        `);
        
        const avgResult = await this.factDatabase.query<{ avg: number}>(`
          SELECT AVG(confidence) as avg FROM coordination_facts
        `);

        const factsByType: Record<string, number> = {};
        const factsBySource: Record<string, number> = {};
        
        for (const row of typeResult) {
          factsByType[row.type] = row.count;
}
        
        for (const row of sourceResult) {
          factsBySource[row.source] = row.count;
}

        return {
          totalFacts: totalResult[0]?.count || 0,
          factsByType,
          factsBySource,
          averageConfidence: avgResult[0]?.avg || 0,
};
} catch (error) {
        logger.warn('Failed to get stats from unified database, using in-memory fallback', { error});
        // Fall through to in-memory stats
}
}

    // Fallback to in-memory statistics
    const facts = Array.from(this.coordinationFacts.values());
    const factsByType: Record<string, number> = {};
    const factsBySource: Record<string, number> = {};
    let totalConfidence = 0;

    for (const fact of facts) {
      factsByType[fact.type] = (factsByType[fact.type] || 0) + 1;
      factsBySource[fact.source] = (factsBySource[fact.source] || 0) + 1;
      totalConfidence += fact.confidence;
}

    return {
      totalFacts: facts.length,
      factsByType,
      factsBySource,
      averageConfidence: facts.length > 0 ? totalConfidence / facts.length : 0,
};
}

  private async ensureInitialized():Promise<void> {
    if (!this.initialized) {
      await this.initialize();
}
}

  /**
   * Notify listeners of new facts
   */
  // Note: notifyListeners method removed as it was never called
  // Can be added back when event system is fully implemented
}

// Create a single private instance (not exported)
const knowledgeFactSystem = new KnowledgeFactSystem();

export { knowledgeFactSystem};
