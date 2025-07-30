/**
 * Memory Backend Plugin Interface - TypeScript Edition
 * Pluggable storage backends for the main system with comprehensive type safety
 */

import { PluginInterface } from '../base-plugin';
import { VectorOperations, VectorEntry, VectorQuery, VectorSearchResult, VectorConfig, VectorIndex } from '../../types/database';
import { JSONObject, JSONValue, OperationResult, UUID } from '../../types/core';
import LanceDBInterface from '../../database/lancedb-interface';
import SQLiteConnectionPool from '../../memory/sqlite-connection-pool';

interface MemoryBackendConfig {
  backend: 'lance' | 'lancedb' | 'kuzu' | 'graph' | 'chroma' | 'sqlite' | 'json' | 'postgresql' | 'unified' | 'hybrid';
  path: string;
  maxSize: number;
  compression: boolean;
  
  // Backend-specific configurations
  chromaConfig?: {
    path: string;
    collection: string;
    persistDirectory: string;
  };
  lanceConfig?: {
    path: string;
    collection: string;
    persistDirectory: string;
  };
  kuzuConfig?: {
    path: string;
    collection: string;
    persistDirectory: string;
  };
  sqliteConfig?: {
    path: string;
    maxConnections: number;
    enableWAL: boolean;
  };
  [key: string]: any;
}

interface BackendInterface {
  initialize(): Promise<BackendInterface | void>;
  store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  delete(key: string, namespace?: string): Promise<boolean>;
  listNamespaces(): Promise<string[]>;
  getStats(): Promise<BackendStats>;
  cleanup?(): Promise<void>;
  
  // Vector operations (optional)
  vectorSearch?(embedding: number[], options?: any): Promise<VectorSearchResult[]>;
  semanticSearch?(query: string, namespace?: string, limit?: number): Promise<any[]>;
  
  // Graph operations (optional)
  graphQuery?(query: string, options?: any): Promise<any>;
  createRelationship?(fromKey: string, toKey: string, relationshipType: string, namespace: string, strength?: number): Promise<boolean>;
  findRelatedDocuments?(key: string, namespace: string, relationshipTypes?: string[], maxDepth?: number): Promise<any[]>;
}

interface StorageResult {
  id: string;
  size: number;
  timestamp: number;
  hasEmbedding?: boolean;
  hasGraph?: boolean;
}

interface BackendStats {
  entries: number;
  size: number;
  namespaces: number;
  collection?: string;
  dbPath?: string;
  database?: string;
  hasSemanticSearch?: boolean;
  hasGraph?: boolean;
}

export class MemoryBackendPlugin implements PluginInterface {
  private config: MemoryBackendConfig;
  private storage: BackendInterface | null = null;
  private initialized: boolean = false;

  constructor(config: Partial<MemoryBackendConfig> = {}) {
    this.config = {
      backend: 'chroma', // ChromaDB for AI/semantic content
      path: './memory',
      maxSize: 1000000, // 1MB
      compression: false,
      // ChromaDB specific config
      chromaConfig: {
        path: './memory/chroma_db', // File-based ChromaDB
        collection: 'claude_zen_memory',
        persistDirectory: './memory/chroma_persist'
      },
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log(`💾 Memory Backend Plugin initialized (${this.config.backend})`);
    
    // Initialize the appropriate backend
    switch (this.config.backend) {
      case 'lance':
      case 'lancedb':
        this.storage = new LanceDBBackend(this.config);
        break;
      case 'kuzu':
      case 'graph':
        this.storage = new KuzuBackend(this.config);
        break;
      case 'chroma':
        this.storage = new LanceDBBackend(this.config); // Fallback ChromaDB to LanceDB
        break;
      case 'sqlite':
        this.storage = new SQLiteBackend(this.config);
        break;
      case 'json':
        this.storage = new JsonBackend(this.config);
        break;
      case 'postgresql':
        this.storage = new PostgreSQLBackend(this.config);
        break;
      case 'unified':
      case 'hybrid':
        // Unified/hybrid backend uses LanceDB as primary with fallback capabilities
        console.log('🔄 Using LanceDB as unified backend (hybrid memory simulation)');
        this.storage = new LanceDBBackend(this.config);
        break;
      default:
        throw new Error(`Unsupported backend: ${this.config.backend}`);
    }
    
    const result = await this.storage.initialize();
    
    // Handle fallback returns
    if (result && result !== this.storage) {
      this.storage = result;
    }

    this.initialized = true;
  }

  async store(key: string, value: JSONValue, namespace: string = 'default'): Promise<StorageResult> {
    await this.ensureInitialized();
    return this.storage!.store(key, value, namespace);
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    await this.ensureInitialized();
    return this.storage!.retrieve(key, namespace);
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    await this.ensureInitialized();
    return this.storage!.search(pattern, namespace);
  }

  // MEGASWARM: Add missing methods for hive-mind integration
  async vectorSearch(embedding: number[], options: any = {}): Promise<VectorSearchResult[]> {
    await this.ensureInitialized();
    // Delegate to search method with appropriate parameters
    if (this.storage!.vectorSearch) {
      return this.storage!.vectorSearch(embedding, options);
    }
    // Fallback to regular search
    const results = await this.storage!.search(embedding.toString(), options.namespace || 'default');
    return Object.entries(results).map(([key, value], index) => ({
      id: key as UUID,
      score: 0.8, // Default similarity
      distance: 0.2,
      metadata: { value },
      rank: index + 1
    }));
  }

  async graphQuery(query: string, options: any = {}): Promise<any> {
    await this.ensureInitialized();
    // Delegate to graph query if available
    if (this.storage!.graphQuery) {
      return this.storage!.graphQuery(query, options);
    }
    // Fallback to regular search
    return this.storage!.search(query, options.namespace || 'default');
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    await this.ensureInitialized();
    return this.storage!.delete(key, namespace);
  }

  async listNamespaces(): Promise<string[]> {
    await this.ensureInitialized();
    return this.storage!.listNamespaces();
  }

  async getStats(): Promise<BackendStats & { backend: string }> {
    await this.ensureInitialized();
    const stats = await this.storage!.getStats();
    return {
      backend: this.config.backend,
      ...stats
    };
  }

  async cleanup(): Promise<void> {
    if (this.storage?.cleanup) {
      await this.storage.cleanup();
    }
    console.log('💾 Memory Backend Plugin cleaned up');
  }

  // Plugin interface methods
  getName(): string {
    return 'memory-backend';
  }

  getVersion(): string {
    return '2.0.0';
  }

  getDescription(): string {
    return `Memory backend plugin using ${this.config.backend} storage`;
  }

  async isEnabled(): Promise<boolean> {
    return this.initialized;
  }

  async enable(): Promise<void> {
    await this.initialize();
  }

  async disable(): Promise<void> {
    await this.cleanup();
    this.initialized = false;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

/**
 * LanceDB Backend (Default - Local Vector Database)
 */
class LanceDBBackend implements BackendInterface {
  private config: MemoryBackendConfig;
  private lanceInterface: LanceDBInterface;
  private lanceConfig: any;

  constructor(config: MemoryBackendConfig) {
    this.config = config;
    this.lanceConfig = config.lanceConfig || config.chromaConfig; // Support both config names
    
    this.lanceInterface = new LanceDBInterface({
      dbPath: this.lanceConfig?.persistDirectory || config.path,
      dbName: this.lanceConfig?.collection || 'strategic_docs',
      vectorDim: 1536,
      similarity: 'cosine',
      batchSize: 1000,
      cacheSize: 10000
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.lanceInterface.initialize();
      console.log(`🧠 LanceDB vector database ready (file-based persistence)`);
    } catch (error: any) {
      console.warn(`⚠️ LanceDB not available, falling back to SQLite: ${error.message}`);
      // Fallback to SQLite if LanceDB fails
      const sqliteBackend = new SQLiteBackend(this.config);
      await sqliteBackend.initialize();
      return sqliteBackend as any;
    }
  }

  async store(key: string, value: JSONValue, namespace: string = 'default'): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    
    // Serialize value for storage
    const serializedValue = JSON.stringify(value);
    
    // For LanceDB, we need to store documents as text content for embeddings
    const documentText = (typeof value === 'object' && value && 'content' in value) 
      ? (value as any).content 
      : (typeof value === 'string' ? value : serializedValue);
    
    const document = {
      id: fullKey,
      content: documentText,
      title: (typeof value === 'object' && value && 'title' in value) ? (value as any).title : key,
      source: 'memory-backend',
      metadata: {
        namespace,
        key,
        timestamp,
        type: typeof value,
        size: serializedValue.length,
        serialized_data: serializedValue
      }
    };
    
    await this.lanceInterface.insertDocuments([document]);
    
    return { 
      id: fullKey, 
      size: serializedValue.length,
      timestamp,
      hasEmbedding: true
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    
    try {
      // Use semantic search to find the document
      const searchResult = await this.lanceInterface.semanticSearch(fullKey, {
        table: 'documents',
        limit: 1,
        includeEmbeddings: false
      });
      
      if (searchResult.results.length === 0) {
        return null;
      }
      
      const result = searchResult.results[0];
      const metadata = JSON.parse(result.metadata || '{}');
      
      if (metadata.serialized_data) {
        return JSON.parse(metadata.serialized_data);
      }
      
      return null;
    } catch (error: any) {
      console.warn(`Failed to retrieve value for ${fullKey}: ${error.message}`);
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    
    try {
      // Use semantic search with pattern
      const searchResult = await this.lanceInterface.semanticSearch(pattern, {
        table: 'documents',
        limit: 100,
        filter: `metadata LIKE '%"namespace":"${namespace}"%'`,
        includeEmbeddings: false
      });
      
      for (const result of searchResult.results) {
        try {
          const metadata = JSON.parse(result.metadata || '{}');
          if (metadata.namespace === namespace && metadata.serialized_data) {
            const key = metadata.key;
            if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
              results[key] = JSON.parse(metadata.serialized_data);
            }
          }
        } catch (error: any) {
          console.warn(`Failed to parse search result: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.warn(`Search failed for pattern ${pattern} in namespace ${namespace}: ${error.message}`);
    }
    
    return results;
  }

  async vectorSearch(embedding: number[], options: any = {}): Promise<VectorSearchResult[]> {
    const { namespace = 'default', limit = 10, threshold = 0.7 } = options;
    
    try {
      return await this.lanceInterface.similaritySearch({
        vector: embedding,
        k: limit,
        namespace,
        minScore: threshold,
        includeMetadata: true,
        includeVectors: false
      });
    } catch (error: any) {
      console.warn(`Vector search failed: ${error.message}`);
      return [];
    }
  }

  async semanticSearch(query: string, namespace: string = 'default', limit: number = 10): Promise<any[]> {
    try {
      const searchResult = await this.lanceInterface.semanticSearch(query, {
        table: 'documents',
        limit,
        filter: namespace !== 'default' ? `metadata LIKE '%"namespace":"${namespace}"%'` : undefined,
        threshold: 0.7,
        includeEmbeddings: false
      });
      
      return searchResult.results.map(result => {
        try {
          const metadata = JSON.parse(result.metadata || '{}');
          return {
            key: metadata.key,
            content: metadata.serialized_data ? JSON.parse(metadata.serialized_data) : result.content,
            similarity: 0.8, // Placeholder
            metadata: metadata
          };
        } catch (error: any) {
          console.warn(`Failed to parse semantic search result: ${error.message}`);
          return {
            key: 'unknown',
            content: result.content,
            similarity: 0.5,
            metadata: {}
          };
        }
      });
    } catch (error: any) {
      console.warn(`Semantic search failed: ${error.message}`);
      return [];
    }
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    // LanceDB doesn't have direct delete operations in this interface
    // This would need to be implemented at the LanceDB level
    console.warn('Delete operation not implemented for LanceDB backend');
    return false;
  }

  async listNamespaces(): Promise<string[]> {
    // Extract namespaces from stored metadata
    try {
      const searchResult = await this.lanceInterface.semanticSearch('*', {
        table: 'documents',
        limit: 1000,
        includeEmbeddings: false
      });
      
      const namespaces = new Set<string>();
      for (const result of searchResult.results) {
        try {
          const metadata = JSON.parse(result.metadata || '{}');
          if (metadata.namespace) {
            namespaces.add(metadata.namespace);
          }
        } catch (error: any) {
          // Skip invalid metadata
        }
      }
      
      return Array.from(namespaces).sort();
    } catch (error: any) {
      console.warn(`Failed to list namespaces: ${error.message}`);
      return ['default'];
    }
  }

  async getStats(): Promise<BackendStats> {
    try {
      const stats = await this.lanceInterface.getStats();
      return {
        entries: stats.totalVectors,
        size: 0, // Would need to calculate
        namespaces: (await this.listNamespaces()).length,
        collection: this.lanceConfig?.collection || 'strategic_docs',
        hasSemanticSearch: true
      };
    } catch (error: any) {
      console.warn(`Failed to get stats: ${error.message}`);
      return {
        entries: 0,
        size: 0,
        namespaces: 0,
        collection: this.lanceConfig?.collection || 'strategic_docs',
        hasSemanticSearch: true
      };
    }
  }

  async cleanup(): Promise<void> {
    await this.lanceInterface.close();
    console.log('🧠 LanceDB backend cleaned up');
  }
}

/**
 * Kuzu Backend (Graph Database for Relationships)
 */
class KuzuBackend implements BackendInterface {
  private config: MemoryBackendConfig;
  private db: any = null;
  private conn: any = null;
  private kuzuConfig: any;

  constructor(config: MemoryBackendConfig) {
    this.config = config;
    this.kuzuConfig = config.kuzuConfig || config.chromaConfig; // Support fallback config names
  }

  async initialize(): Promise<BackendInterface | void> {
    try {
      // Dynamic import for Kuzu
      const kuzu = await import('kuzu');
      
      // Ensure persist directory exists
      const fs = await import('fs/promises');
      await fs.mkdir(this.kuzuConfig.persistDirectory, { recursive: true });
      
      // Initialize Kuzu database
      const dbPath = this.kuzuConfig.persistDirectory;
      this.db = new kuzu.Database(dbPath);
      this.conn = new kuzu.Connection(this.db);
      
      // Create node and relationship tables for strategic documents
      await this.initializeSchema();
      
      console.log(`📊 Kuzu graph database ready at: ${dbPath}`);
    } catch (error: any) {
      console.warn(`⚠️ Kuzu not available, falling back to SQLite: ${error.message}`);
      // Fallback to SQLite if Kuzu fails
      const sqliteBackend = new SQLiteBackend(this.config);
      await sqliteBackend.initialize();
      return sqliteBackend;
    }
  }

  private async initializeSchema(): Promise<void> {
    try {
      // Create node tables for strategic documents
      await this.conn.query(`
        CREATE NODE TABLE IF NOT EXISTS Document(
          id STRING, 
          namespace STRING,
          key STRING,
          title STRING,
          content STRING,
          doc_type STRING,
          metadata STRING,
          timestamp INT64,
          PRIMARY KEY(id)
        )
      `);

      // Create relationship table for document connections
      await this.conn.query(`
        CREATE REL TABLE IF NOT EXISTS References(FROM Document TO Document, 
          relationship_type STRING,
          strength DOUBLE,
          created_at INT64
        )
      `);

      console.log('📊 Kuzu schema initialized for strategic documents');
    } catch (error: any) {
      console.warn(`Schema initialization warning: ${error.message}`);
    }
  }

  async store(key: string, value: JSONValue, namespace: string = 'default'): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    
    // Serialize value for storage
    const serializedValue = JSON.stringify(value);
    
    // Extract text content for graph analysis
    const documentText = (typeof value === 'object' && value && 'content' in value) 
      ? (value as any).content 
      : (typeof value === 'string' ? value : serializedValue);
    
    const title = (typeof value === 'object' && value && 'title' in value) 
      ? (value as any).title 
      : key;

    const docType = (typeof value === 'object' && value && 'documentType' in value) 
      ? (value as any).documentType 
      : 'unknown';

    try {
      // Insert or update document node
      await this.conn.query(`
        MERGE (d:Document {id: $id})
        SET d.namespace = $namespace,
            d.key = $key,
            d.title = $title,
            d.content = $content,
            d.doc_type = $doc_type,
            d.metadata = $metadata,
            d.timestamp = $timestamp
      `, {
        id: fullKey,
        namespace: namespace,
        key: key,
        title: title,
        content: documentText,
        doc_type: docType,
        metadata: serializedValue,
        timestamp: timestamp
      });

      return { 
        id: fullKey, 
        size: serializedValue.length,
        timestamp,
        hasGraph: true
      };
    } catch (error: any) {
      console.warn(`Failed to store in Kuzu: ${error.message}`);
      throw error;
    }
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    
    try {
      const result = await this.conn.query(`
        MATCH (d:Document {id: $id})
        RETURN d.metadata
      `, { id: fullKey });

      if (result && result.length > 0) {
        return JSON.parse(result[0]['d.metadata']);
      }
      
      return null;
    } catch (error: any) {
      console.warn(`Failed to retrieve from Kuzu: ${error.message}`);
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    
    try {
      const queryResult = await this.conn.query(`
        MATCH (d:Document)
        WHERE d.namespace = $namespace AND d.key CONTAINS $pattern
        RETURN d.key, d.metadata
      `, { 
        namespace: namespace, 
        pattern: pattern.replace('*', '') 
      });

      for (const row of queryResult) {
        const key = row['d.key'];
        const metadata = row['d.metadata'];
        try {
          results[key] = JSON.parse(metadata);
        } catch (error: any) {
          console.warn(`Failed to parse metadata for ${key}`);
        }
      }
    } catch (error: any) {
      console.warn(`Search failed in Kuzu: ${error.message}`);
    }
    
    return results;
  }

  async graphQuery(query: string, options: any = {}): Promise<any> {
    try {
      return await this.conn.query(query, options.params || {});
    } catch (error: any) {
      console.warn(`Graph query failed: ${error.message}`);
      throw error;
    }
  }

  async createRelationship(
    fromKey: string, 
    toKey: string, 
    relationshipType: string, 
    namespace: string, 
    strength: number = 1.0
  ): Promise<boolean> {
    const fromId = `${namespace}:${fromKey}`;
    const toId = `${namespace}:${toKey}`;
    
    try {
      await this.conn.query(`
        MATCH (from:Document {id: $fromId}), (to:Document {id: $toId})
        CREATE (from)-[:References {
          relationship_type: $type,
          strength: $strength,
          created_at: $timestamp
        }]->(to)
      `, {
        fromId: fromId,
        toId: toId,
        type: relationshipType,
        strength: strength,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error: any) {
      console.warn(`Failed to create relationship: ${error.message}`);
      return false;
    }
  }

  async findRelatedDocuments(
    key: string, 
    namespace: string, 
    relationshipTypes: string[] = [], 
    maxDepth: number = 2
  ): Promise<any[]> {
    const fullKey = `${namespace}:${key}`;
    
    try {
      let relationFilter = '';
      if (relationshipTypes.length > 0) {
        const typeList = relationshipTypes.map(t => `'${t}'`).join(', ');
        relationFilter = `WHERE r.relationship_type IN [${typeList}]`;
      }

      const result = await this.conn.query(`
        MATCH (start:Document {id: $id})-[r:References*1..${maxDepth}]-(related:Document)
        ${relationFilter}
        RETURN DISTINCT related.key, related.metadata, related.title, 
               length(r) as distance
        ORDER BY distance
      `, { id: fullKey });

      return result.map((row: any) => ({
        key: row['related.key'],
        content: JSON.parse(row['related.metadata']),
        distance: row.distance,
        title: row['related.title']
      }));
    } catch (error: any) {
      console.warn(`Failed to find related documents: ${error.message}`);
      return [];
    }
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const fullKey = `${namespace}:${key}`;
    
    try {
      await this.conn.query(`
        MATCH (d:Document {id: $id})
        DETACH DELETE d
      `, { id: fullKey });
      
      return true;
    } catch (error: any) {
      console.warn(`Failed to delete from Kuzu: ${error.message}`);
      return false;
    }
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const result = await this.conn.query(`
        MATCH (d:Document)
        RETURN DISTINCT d.namespace
      `);
      
      return result.map((row: any) => row['d.namespace']).sort();
    } catch (error: any) {
      console.warn(`Failed to list namespaces: ${error.message}`);
      return [];
    }
  }

  async getStats(): Promise<BackendStats> {
    try {
      const nodeCount = await this.conn.query(`
        MATCH (d:Document) RETURN count(d) as count
      `);
      
      const relCount = await this.conn.query(`
        MATCH ()-[r:References]->() RETURN count(r) as count
      `);

      const namespaceCount = await this.conn.query(`
        MATCH (d:Document) RETURN count(DISTINCT d.namespace) as count
      `);

      return {
        entries: nodeCount[0]?.count || 0,
        size: relCount[0]?.count || 0, // Using relationship count as size
        namespaces: namespaceCount[0]?.count || 0,
        database: this.kuzuConfig.persistDirectory,
        hasGraph: true
      };
    } catch (error: any) {
      console.warn(`Failed to get stats: ${error.message}`);
      return {
        entries: 0,
        size: 0,
        namespaces: 0,
        database: this.kuzuConfig.persistDirectory,
        hasGraph: true
      };
    }
  }

  async cleanup(): Promise<void> {
    if (this.conn) {
      this.conn.close();
    }
    if (this.db) {
      this.db.close();
    }
    console.log('📊 Kuzu graph database cleaned up');
  }
}

/**
 * SQLite Backend (Fallback)
 */
class SQLiteBackend implements BackendInterface {
  private config: MemoryBackendConfig;
  private connectionPool: SQLiteConnectionPool;
  private dbPath: string;

  constructor(config: MemoryBackendConfig) {
    this.config = config;
    this.dbPath = `${config.path}/storage.db`;
    
    this.connectionPool = new SQLiteConnectionPool(this.dbPath, {
      minConnections: 1,
      maxConnections: config.sqliteConfig?.maxConnections || 4,
      enableHealthChecks: true
    });
  }

  async initialize(): Promise<BackendInterface | void> {
    try {
      // Ensure directory exists
      const fs = await import('fs/promises');
      const path = await import('path');
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      
      // Initialize connection pool
      await this.connectionPool.initialize();
      
      // Create tables
      await this.connectionPool.execute(`
        CREATE TABLE IF NOT EXISTS storage (
          id TEXT PRIMARY KEY,
          namespace TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          UNIQUE(namespace, key)
        );
        
        CREATE INDEX IF NOT EXISTS idx_namespace ON storage(namespace);
        CREATE INDEX IF NOT EXISTS idx_key ON storage(key);
        CREATE INDEX IF NOT EXISTS idx_timestamp ON storage(timestamp);
      `);
      
      console.log(`🗃️ SQLite database initialized at ${this.dbPath}`);
    } catch (error: any) {
      console.warn(`⚠️ SQLite not available, falling back to JSON: ${error.message}`);
      // Fallback to JSON if SQLite fails
      const jsonBackend = new JsonBackend(this.config);
      await jsonBackend.initialize();
      return jsonBackend;
    }
  }

  async store(key: string, value: JSONValue, namespace: string = 'default'): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    const serializedValue = JSON.stringify(value);
    
    await this.connectionPool.execute(`
      INSERT OR REPLACE INTO storage (id, namespace, key, value, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `, [fullKey, namespace, key, serializedValue, timestamp]);
    
    return { 
      id: fullKey, 
      size: serializedValue.length,
      timestamp 
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const result = await this.connectionPool.execute(`
      SELECT value FROM storage 
      WHERE namespace = ? AND key = ?
    `, [namespace, key]);
    
    if (!result || result.length === 0) return null;
    
    try {
      return JSON.parse(result[0].value);
    } catch (error: any) {
      console.warn(`Failed to parse stored value for ${namespace}:${key}`);
      return null;
    }
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    
    const searchPattern = pattern.replace('*', '%');
    const rows = await this.connectionPool.execute(`
      SELECT key, value FROM storage 
      WHERE namespace = ? AND key LIKE ?
    `, [namespace, searchPattern]);
    
    for (const row of rows) {
      try {
        results[row.key] = JSON.parse(row.value);
      } catch (error: any) {
        console.warn(`Failed to parse stored value for ${namespace}:${row.key}`);
      }
    }
    
    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const result = await this.connectionPool.execute(`
      DELETE FROM storage 
      WHERE namespace = ? AND key = ?
    `, [namespace, key]);
    
    return (result as any).changes > 0;
  }

  async listNamespaces(): Promise<string[]> {
    const rows = await this.connectionPool.execute(`
      SELECT DISTINCT namespace FROM storage
      ORDER BY namespace
    `);
    
    return rows.map((row: any) => row.namespace);
  }

  async getStats(): Promise<BackendStats> {
    const countResult = await this.connectionPool.execute('SELECT COUNT(*) as count FROM storage');
    const sizeResult = await this.connectionPool.execute('SELECT SUM(LENGTH(value)) as size FROM storage');
    const namespaceResult = await this.connectionPool.execute('SELECT COUNT(DISTINCT namespace) as namespaces FROM storage');
    
    const count = countResult[0]?.count || 0;
    const size = sizeResult[0]?.size || 0;
    const namespaces = namespaceResult[0]?.namespaces || 0;
    
    return {
      entries: count,
      size: size,
      namespaces: namespaces,
      dbPath: this.dbPath
    };
  }

  async cleanup(): Promise<void> {
    await this.connectionPool.shutdown();
  }
}

/**
 * JSON File Backend (Fallback)
 */
class JsonBackend implements BackendInterface {
  private config: MemoryBackendConfig;
  private data: Map<string, { value: JSONValue; timestamp: number }> = new Map();
  private filepath: string;

  constructor(config: MemoryBackendConfig) {
    this.config = config;
    this.filepath = `${config.path}/storage.json`;
  }

  async initialize(): Promise<void> {
    // Load existing data if available
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(this.filepath, 'utf8');
      const parsed = JSON.parse(data);
      this.data = new Map(Object.entries(parsed));
    } catch {
      // File doesn't exist or is corrupted, start fresh
    }
  }

  async store(key: string, value: JSONValue, namespace: string = 'default'): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    
    this.data.set(fullKey, { value, timestamp });
    await this.persist();
    
    return { 
      id: fullKey, 
      size: JSON.stringify(value).length,
      timestamp
    };
  }

  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    const entry = this.data.get(fullKey);
    return entry?.value || null;
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    const prefix = `${namespace}:`;
    
    for (const [key, entry] of this.data) {
      if (key.startsWith(prefix) && key.includes(pattern)) {
        results[key.substring(prefix.length)] = entry.value;
      }
    }
    
    return results;
  }

  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const fullKey = `${namespace}:${key}`;
    const deleted = this.data.delete(fullKey);
    if (deleted) await this.persist();
    return deleted;
  }

  async listNamespaces(): Promise<string[]> {
    const namespaces = new Set<string>();
    for (const key of this.data.keys()) {
      const namespace = key.split(':')[0];
      namespaces.add(namespace);
    }
    return Array.from(namespaces);
  }

  async getStats(): Promise<BackendStats> {
    return {
      entries: this.data.size,
      size: JSON.stringify(Object.fromEntries(this.data)).length,
      namespaces: (await this.listNamespaces()).length
    };
  }

  private async persist(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const dataObj = Object.fromEntries(this.data);
      await fs.mkdir(this.config.path, { recursive: true });
      await fs.writeFile(this.filepath, JSON.stringify(dataObj, null, 2));
    } catch (error: any) {
      console.warn('Failed to persist JSON backend:', error.message);
    }
  }
}

/**
 * Placeholder for PostgreSQL backend
 */
class PostgreSQLBackend implements BackendInterface {
  private config: MemoryBackendConfig;
  
  constructor(config: MemoryBackendConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<void> {
    throw new Error('PostgreSQL backend not yet implemented');
  }

  async store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult> {
    throw new Error('PostgreSQL backend not yet implemented');
  }

  async retrieve(key: string, namespace?: string): Promise<JSONValue | null> {
    throw new Error('PostgreSQL backend not yet implemented');
  }

  async search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>> {
    throw new Error('PostgreSQL backend not yet implemented');
  }

  async delete(key: string, namespace?: string): Promise<boolean> {
    throw new Error('PostgreSQL backend not yet implemented');
  }

  async listNamespaces(): Promise<string[]> {
    throw new Error('PostgreSQL backend not yet implemented');
  }

  async getStats(): Promise<BackendStats> {
    throw new Error('PostgreSQL backend not yet implemented');
  }
}

export default MemoryBackendPlugin;