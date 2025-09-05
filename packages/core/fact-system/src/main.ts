/**
 * @fileoverview FACT System - Execution Result Caching
 *
 * Domain-specific caching system for execution results (API calls, computations, etc.)
 * Provides fast storage and retrieval of previously computed results.
 * 
 * Domain: Execution results, computational caching, API response storage
 * Usage: Through coordination packages (TaskMaster, SPARC, etc.)
 * 
 * Uses @claude-zen/foundation for logging and events, @claude-zen/database for storage.
 */

import { getLogger, EventBus } from '@claude-zen/foundation';
import { createDatabase } from '@claude-zen/database';
import type { DatabaseAdapter } from '@claude-zen/database';
import type {
  FactSearchQuery,
  FactSourceType,
  FactSystemConfig,
  FactSystemStats,
} from './typescript/types';

// Define our own search results interface for the search method
interface FactSearchResults {
  facts: any[];
  totalCount: number;
  queryTime: number;
}

const logger = getLogger('fact-system');

// Get singleton EventBus instance for FACT system
export const eventBus = EventBus.getInstance();

// =============================================================================
// FACT CLIENT - Main implementation using proper database and foundation
// =============================================================================
export class FactClient {
  private database: DatabaseAdapter | null = null;
  private config: FactSystemConfig;
  private initialized = false;

  constructor(config: FactSystemConfig) {
    this.config = config;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Listen for FACT-specific events from coordination packages (TaskMaster, SPARC, etc.)
    eventBus.on('fact:store', async (data: any) => {
      await this.handleStoreRequest(data);
    });

    eventBus.on('fact:query', async (data: any) => {
      await this.handleQueryRequest(data);
    });

    eventBus.on('fact:status', async (data: any) => {
      await this.handleStatusRequest(data);
    });
  }

  private async handleStoreRequest(data: any): Promise<void> {
    try {
      await this.ensureInitialized();
      const id = await this.storeFact(data);
      logger.info(`Stored FACT: ${id}`);
    } catch (error) {
      logger.error('Failed to store FACT:', error);
    }
  }

  private async handleQueryRequest(data: any): Promise<void> {
    try {
      await this.ensureInitialized();
      const results = await this.search(data);
      
      // Emit response with request ID for correlation
      eventBus.emit(`fact:query:response:${data.requestId}`, results);
      logger.info(`Query completed for request: ${data.requestId}`);
    } catch (error) {
      logger.error('Failed to query FACTs:', error);
      eventBus.emit(`fact:query:response:${data.requestId}`, {
        facts: [],
        totalCount: 0,
        queryTime: 0,
        error: (error as Error).message,
      });
    }
  }

  private async handleStatusRequest(data: any): Promise<void> {
    try {
      const status = {
        initialized: this.initialized,
        stats: this.getStats(),
      };
      eventBus.emit(`fact:status:response:${data.requestId}`, status);
    } catch (error) {
      logger.error('Failed to get status:', error);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing FACT system...');
      
      // Initialize database using @claude-zen/database
      if (this.config.database) {
        // Use provided database connection
        this.database = this.config.database as DatabaseAdapter;
      } else {
        // Create default SQLite database
        this.database = await createDatabase('sqlite', './facts.db');
      }

      // Create FACT storage tables
      await this.createTables();

      this.initialized = true;
      logger.info('FACT system initialized successfully');
      
      eventBus.emit('fact:system:initialized', { timestamp: Date.now() });
    } catch (error) {
      logger.error('Failed to initialize FACT system:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS facts (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        result TEXT NOT NULL,
        source TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        ttl INTEGER NOT NULL,
        access_count INTEGER DEFAULT 0,
        last_accessed INTEGER NOT NULL,
        metadata TEXT NOT NULL
      )
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_facts_query ON facts(query);
      CREATE INDEX IF NOT EXISTS idx_facts_source ON facts(source);
      CREATE INDEX IF NOT EXISTS idx_facts_timestamp ON facts(timestamp);
    `;

    await this.database.query(createTableSQL);
    await this.database.query(createIndexSQL);
    
    logger.info('FACT storage tables created');
  }

  async search(query: FactSearchQuery): Promise<FactSearchResults> {
    await this.ensureInitialized();
    const startTime = Date.now();
    
    try {
      logger.info('Searching FACTs:', query);
      
      if (!this.database) throw new Error('Database not initialized');

      let sql = 'SELECT * FROM facts WHERE 1=1';
      const params: any[] = [];

      if (query.query) {
        sql += ' AND query LIKE ?';
        params.push(`%${query.query}%`);
      }

      if (query.type) {
        sql += ' AND JSON_EXTRACT(metadata, "$.type") = ?';
        params.push(query.type);
      }


      sql += ' ORDER BY timestamp DESC, access_count DESC';
      
      if (query.limit) {
        sql += ' LIMIT ?';
        params.push(query.limit);
      }

      const rows = await this.database.query(sql, params) as Array<{
        id: string;
        query: string;
        result: string;
        source: string;
        timestamp: number;
        ttl: number;
        metadata: string;
      }>;
      
      const facts = rows.map(row => ({
        id: row.id,
        query: row.query,
        result: JSON.parse(row.result),
        source: row.source,
        timestamp: row.timestamp,
        ttl: row.ttl,
        metadata: JSON.parse(row.metadata),
      }));

      const queryTime = Date.now() - startTime;
      
      logger.info(`Found ${facts.length} FACTs in ${queryTime}ms`);
      
      return {
        facts,
        totalCount: facts.length,
        queryTime,
      };
    } catch (error) {
      logger.error('FACT search failed:', error);
      throw error;
    }
  }

  async storeFact(fact: any): Promise<string> {
    await this.ensureInitialized();
    
    try {
      if (!this.database) throw new Error('Database not initialized');

      const now = Date.now();
      const factData = {
        id: fact.id || crypto.randomUUID(),
        query: fact.query,
        result: JSON.stringify(fact.result),
        source: fact.source,
        timestamp: fact.timestamp || now,
        ttl: fact.ttl || 3600000, // 1 hour default
        access_count: 0,
        last_accessed: now,
        metadata: JSON.stringify(fact.metadata || {}),
      };

      const sql = `
        INSERT OR REPLACE INTO facts 
        (id, query, result, source, timestamp, ttl, access_count, last_accessed, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.database.query(sql, [
        factData.id,
        factData.query,
        factData.result,
        factData.source,
        factData.timestamp,
        factData.ttl,
        factData.access_count,
        factData.last_accessed,
        factData.metadata,
      ]);

      logger.info(`Stored FACT: ${factData.id}`);
      return factData.id;
    } catch (error) {
      logger.error('Failed to store FACT:', error);
      throw error;
    }
  }

  getStats(): FactSystemStats {
    return {
      cacheSize: 0,
      totalQueries: 0,
      cacheHitRate: 0,
      rustEngineActive: this.config.useRustEngine || false,
      initialized: this.initialized,
    };
  }

  async close(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
    this.initialized = false;
    logger.info('FACT system closed');
  }
}

// =============================================================================
// FACTORY FUNCTIONS - Using proper database backends
// =============================================================================
export async function createFactClient(config: FactSystemConfig): Promise<FactClient> {
  const client = new FactClient(config);
  await client.initialize();
  return client;
}

export async function createSQLiteFactClient(dbPath = './facts.db'): Promise<FactClient> {
  logger.info('Creating SQLite FACT client at:', dbPath);
  
  const database = await createDatabase('sqlite', dbPath);
  const client = new FactClient({
    database,
    useRustEngine: true,
  });
  
  await client.initialize();
  return client;
}


// =============================================================================
// ADVANCED COMPONENTS - Bridge and processing systems
// =============================================================================
export class FactBridge {
  constructor(_config: FactSystemConfig) {
  }

  async processWithRustEngine(data: any): Promise<any> {
    // TODO: Call actual Rust engine via WASM bindings
    logger.info('Processing with Rust engine (stub):', data);
    return data;
  }

  async gatherFromSources(sources: FactSourceType[]): Promise<any[]> {
    logger.info('Gathering from sources:', sources);
    // TODO: Implement actual source gathering
    return [];
  }
}

export class IntelligentCache {
  private storage: any;

  constructor() {
    // TODO: Initialize with proper cache backend
    this.storage = new Map();
  }

  async get(key: string): Promise<any> {
    return this.storage.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.storage.set(key, value);
    if (ttl) {
      setTimeout(() => this.storage.delete(key), ttl);
    }
  }
}

// =============================================================================
// CONNECTORS AND PROCESSORS - Stub implementations for now
// =============================================================================
export class LiveAPIConnector {
  async connect(apiUrl: string): Promise<void> {
    logger.info('Connecting to API:', apiUrl);
  }
}

export class DocumentationProcessor {
  async process(docs: string[]): Promise<any[]> {
    logger.info(`Processing documentation: ${docs.length} items`);
    return [];
  }
}

export class NaturalLanguageQuery {
  async parse(query: string): Promise<FactSearchQuery> {
    logger.info('Parsing natural language query:', query);
    return { query };
  }
}

// =============================================================================
// TYPE RE-EXPORTS
// =============================================================================
export type {
  FactSearchQuery,
  FactSourceType,
  FactSystemConfig,
  FactSystemStats,
} from './typescript/types';

// Additional types for new functionality
export interface APIDocumentationFactResult {
  url: string;
  content: string;
  lastUpdated: number;
}

export interface GitHubFactResult {
  repository: string;
  stars: number;
  lastCommit: string;
}

export interface NPMFactResult {
  package: string;
  version: string;
  downloads: number;
}

export interface SecurityFactResult {
  cve: string;
  severity: string;
  description: string;
}

export interface FactCacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
}

export interface RustEngineConfig {
  enabled: boolean;
  parallelism: number;
  timeout: number;
}