
/**
 * Memory Backend Plugin Interface - TypeScript Edition
 * Pluggable storage backends for the main system with comprehensive type safety
 */

import { BasePlugin } from '../base-plugin.js';
import LanceDBInterface from '../../database/lancedb-interface.js';

// Add VectorDocument interface for LanceDB
interface VectorDocument {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
  timestamp?: number;
}
import type { 
  Plugin, 
  PluginContext, 
  PluginManifest, 
  PluginConfig,
  HealthStatus
} from '../types.js';

type HealthCheckResult = HealthStatus;

// Types for memory backend
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

export interface MemoryBackendConfig extends BackendConfig {}

export interface StorageResult {
  id: string;
  timestamp: number;
  status: 'success' | 'error';
  error?: string;
}

interface BackendStats {
  entries: number;
  size: number;
  lastModified: number;
  namespaces?: number;
}

interface BackendConfig extends PluginConfig {
  type: 'lancedb' | 'sqlite' | 'json' | 'kuzu';
  path: string;
  [key: string]: any;
}

interface BackendInterface {
  initialize(): Promise<void>;
  store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  delete(key: string, namespace?: string): Promise<boolean>;
  listNamespaces(): Promise<string[]>;
  getStats(): Promise<BackendStats>;
  healthCheck?(): Promise<HealthCheckResult>;
}

// Base backend class
abstract class BaseBackend implements BackendInterface {
  protected config: BackendConfig;
  
  constructor(config: BackendConfig) {
    this.config = config;
  }
  
  abstract initialize(): Promise<void>;
  abstract store(key: string, value: JSONValue, namespace?: string): Promise<StorageResult>;
  abstract retrieve(key: string, namespace?: string): Promise<JSONValue | null>;
  abstract search(pattern: string, namespace?: string): Promise<Record<string, JSONValue>>;
  abstract delete(key: string, namespace?: string): Promise<boolean>;
  abstract listNamespaces(): Promise<string[]>;
  abstract getStats(): Promise<BackendStats>;
  
  async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: 'healthy',
      score: 100,
      issues: [],
      lastCheck: new Date()
    };
  }
}

// Main Memory Backend Plugin
export class MemoryBackendPlugin extends BasePlugin {
  private storage?: BackendInterface;
  declare public config: BackendConfig;
  private initialized = false;
  
  constructor(config: BackendConfig) {
    const manifest: PluginManifest = {
      name: 'memory-backend',
      version: '1.0.0',
      description: 'Memory backend storage plugin',
      author: 'claude-flow',
      license: 'MIT',
      keywords: ['storage', 'memory'],
      main: 'index.js',
      dependencies: { system: [], plugins: {} },
      configuration: { schema: {}, required: [], defaults: {} },
      permissions: [],
      apis: [],
      hooks: []
    };

    const pluginConfig: PluginConfig = {
      enabled: config.enabled ?? true,
      priority: config.priority ?? 50,
      settings: config.settings ?? {}
    };

    const context: PluginContext = {
      logger: {
        debug: (message: string, meta?: unknown) => console.debug(`[memory-backend] ${message}`, meta),
        info: (message: string, meta?: unknown) => console.info(`[memory-backend] ${message}`, meta),
        warn: (message: string, meta?: unknown) => console.warn(`[memory-backend] ${message}`, meta),
        error: (message: string, error?: unknown) => console.error(`[memory-backend] ${message}`, error)
      },
      apis: {
        logger: {
          info: (message: string) => console.info(`[memory-backend] ${message}`),
          error: (message: string) => console.error(`[memory-backend] ${message}`)
        }
      },
      resources: { limits: [] }
    };

    super(manifest, pluginConfig, context);
    
    this.config = {
      enabled: config.enabled ?? true,
      priority: config.priority ?? 50,
      settings: config.settings ?? {},
      type: config.type || 'lancedb',
      path: config.path || './data'
    };
  }
  
  async onInitialize(): Promise<void> {
    // Create appropriate backend based on config
    switch (this.config.type) {
      case 'lancedb':
        this.storage = new LanceDBBackend(this.config);
        break;
      case 'sqlite':
        this.storage = new SQLiteBackend(this.config);
        break;
      case 'json':
        this.storage = new JSONBackend(this.config);
        break;
      case 'kuzu':
        this.storage = new KuzuBackend(this.config);
        break;
      default:
        throw new Error(`Unknown backend type: ${this.config.type}`);
    }
    
    await this.storage.initialize();
    this.initialized = true;
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Memory backend plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Memory backend plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.context.logger.info('Memory backend plugin destroyed');
    this.initialized = false;
    this.storage = undefined;
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
  
  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    await this.ensureInitialized();
    return this.storage!.delete(key, namespace);
  }
  
  async listNamespaces(): Promise<string[]> {
    await this.ensureInitialized();
    return this.storage!.listNamespaces();
  }
  
  async getStats(): Promise<BackendStats> {
    await this.ensureInitialized();
    return this.storage!.getStats();
  }
  
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.onInitialize();
    }
  }
}

/** LanceDB Backend (Default - Local Vector Database) */
class LanceDBBackend extends BaseBackend {
  private lanceInterface: LanceDBInterface;
  
  constructor(config: BackendConfig) {
    super(config);
    this.lanceInterface = new LanceDBInterface({
      dbPath: `${config.path}/lancedb`
    });
  }
  
  async initialize(): Promise<void> {
    await this.lanceInterface.initialize();
  }
  
  async store(key: string, value: JSONValue, namespace: string = 'default'): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    
    // Serialize value for storage
    const serializedValue = JSON.stringify(value);
    
    // For LanceDB, we need to store documents as text content for embeddings
    const documentText = (typeof value === 'object' && value && 'content' in value) 
      ? (value as any).content 
      : serializedValue;

    const document = {
      id: fullKey,
      content: documentText,
      source: namespace,
      title: (typeof value === 'object' && value && 'title' in value) ? (value as any).title : key,
      metadata: JSON.stringify({
        key,
        namespace,
        timestamp,
        serialized_data: serializedValue
      })
    };
    
    // Use insertVectors method instead of addDocuments
    const vectorDoc = {
      id: fullKey,
      vector: new Array(384).fill(0), // placeholder vector
      metadata: {
        key,
        namespace,
        timestamp,
        serialized_data: serializedValue,
        content: documentText
      }
    };
    
    await this.lanceInterface.insertVectors('documents', [vectorDoc]);
    
    return {
      id: fullKey,
      timestamp,
      status: 'success'
    };
  }
  
  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    
    try {
      // Use searchSimilar method instead of semanticSearch
      const searchResult = await this.lanceInterface.searchSimilar('documents', new Array(384).fill(0), 1, {
        key: key,
        namespace: namespace
      });
      
      if (!searchResult || searchResult.length === 0) {
        return null;
      }
      
      const result = searchResult[0];
      const metadata = result.metadata || {};
      
      if (metadata.serialized_data) {
        return JSON.parse(metadata.serialized_data);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    
    try {
      // Use searchSimilar for pattern matching
      const searchResult = await this.lanceInterface.searchSimilar('documents', new Array(384).fill(0), 100, {
        namespace: namespace
      });
      
      for (const result of searchResult || []) {
        try {
          const metadata = result.metadata || {};
          if (metadata.namespace === namespace && metadata.serialized_data) {
            const key = metadata.key;
            if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
              results[key] = JSON.parse(metadata.serialized_data);
            }
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
    } catch (error) {
      // Return empty results on error
    }
    
    return results;
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
      const searchResult = await this.lanceInterface.searchSimilar('documents', new Array(384).fill(0), 1000);
      
      const namespaces = new Set<string>();
      for (const result of searchResult || []) {
        try {
          const metadata = result.metadata || {};
          if (metadata.namespace) {
            namespaces.add(metadata.namespace);
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
      
      return Array.from(namespaces);
    } catch (error) {
      return [];
    }
  }
  
  async getStats(): Promise<BackendStats> {
    const stats = await this.lanceInterface.getStats();
    return {
      entries: stats.totalVectors || 0,
      size: stats.indexedVectors || 0,
      lastModified: Date.now()
    };
  }
}

/** Kuzu Graph Database Backend */
class KuzuBackend extends BaseBackend {
  private db?: any;
  private conn?: any;
  
  constructor(config: BackendConfig) {
    super(config);
  }
  
  async initialize(): Promise<void> {
    try {
      // Dynamic import for Kuzu
      const kuzu = await import('kuzu');
      
      // Ensure persist directory exists
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const dbPath = path.join(this.config.path, 'kuzu');
      await fs.mkdir(dbPath, { recursive: true });
      
      this.db = new kuzu.Database(dbPath);
      this.conn = new kuzu.Connection(this.db);
      
      // Create node and relationship tables for strategic documents
      await this.initializeSchema();
      
      console.log('Kuzu graph database ready');
    } catch (error) {
      // If Kuzu not available, throw error
      throw new Error('Kuzu database initialization failed');
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

      console.log('Kuzu schema initialized for strategic documents');
    } catch (error) {
      console.error('Error initializing Kuzu schema:', error);
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
      : serializedValue;

    const title = (typeof value === 'object' && value && 'title' in value) 
      ? (value as any).title 
      : key;

    const docType = (typeof value === 'object' && value && 'documentType' in value) 
      ? (value as any).documentType 
      : 'generic';

    try {
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
        namespace,
        key,
        title,
        content: documentText,
        doc_type: docType,
        metadata: serializedValue,
        timestamp
      });

      return {
        id: fullKey,
        timestamp,
        status: 'success'
      };
    } catch (error) {
      return {
        id: fullKey,
        timestamp,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    
    try {
      const result = await this.conn.query(`
        MATCH (d:Document)
        WHERE d.id = $id
        RETURN d.metadata
      `, { id: fullKey });
      
      if (result && result.length > 0) {
        return JSON.parse(result[0]['d.metadata']);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    
    try {
      const queryResult = await this.conn.query(`
        MATCH (d:Document)
        WHERE d.namespace = $namespace
        RETURN d.key, d.metadata
      `, { namespace });
      
      for (const row of queryResult || []) {
        const key = row['d.key'];
        const metadata = row['d.metadata'];
        try {
          if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
            results[key] = JSON.parse(metadata);
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
    } catch (error) {
      // Return empty results on error
    }
    
    return results;
  }
  
  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const fullKey = `${namespace}:${key}`;
    
    try {
      await this.conn.query(`
        MATCH (d:Document)
        WHERE d.id = $id
        DELETE d
      `, { id: fullKey });
      
      return true;
    } catch (error) {
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
    } catch (error) {
      return [];
    }
  }
  
  async getStats(): Promise<BackendStats> {
    try {
      const result = await this.conn.query(`
        MATCH (d:Document) 
        RETURN count(d) as count
      `);
      
      return {
        entries: result[0]?.count || 0,
        size: 0,
        lastModified: Date.now()
      };
    } catch (error) {
      return {
        entries: 0,
        size: 0,
        lastModified: Date.now()
      };
    }
  }
}

/** SQLite Backend */
class SQLiteBackend extends BaseBackend {
  private db?: any;
  private dbPath: string;
  
  constructor(config: BackendConfig) {
    super(config);
    this.dbPath = `${config.path}/storage.db`;
  }
  
  async initialize(): Promise<void> {
    const { default: Database } = await import('better-sqlite3');
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    
    this.db = new (Database as any)(this.dbPath);
    
    // Create table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS storage (
        id TEXT PRIMARY KEY,
        namespace TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        UNIQUE(namespace, key)
      )
    `);
    
    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_namespace ON storage(namespace);
      CREATE INDEX IF NOT EXISTS idx_key ON storage(key);
    `);
  }
  
  async store(key: string, value: JSONValue, namespace: string = 'default'): Promise<StorageResult> {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    const serializedValue = JSON.stringify(value);
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO storage(id, namespace, key, value, timestamp)
      VALUES(?, ?, ?, ?, ?)
    `);
    
    stmt.run(fullKey, namespace, key, serializedValue, timestamp);
    
    return {
      id: fullKey,
      timestamp,
      status: 'success'
    };
  }
  
  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const stmt = this.db.prepare(`
      SELECT value FROM storage 
      WHERE namespace = ? AND key = ?
    `);
    
    const result = stmt.get(namespace, key);
    
    if (!result) return null;
    
    try {
      return JSON.parse(result.value);
    } catch (error) {
      return null;
    }
  }
  
  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    const searchPattern = pattern.replace('*', '%');
    
    const stmt = this.db.prepare(`
      SELECT key, value FROM storage 
      WHERE namespace = ? AND key LIKE ?
    `);
    
    const rows = stmt.all(namespace, searchPattern);
    
    for (const row of rows) {
      try {
        results[row.key] = JSON.parse(row.value);
      } catch (error) {
        // Skip invalid entries
      }
    }
    
    return results;
  }
  
  async delete(key: string, namespace: string = 'default'): Promise<boolean> {
    const stmt = this.db.prepare(`
      DELETE FROM storage 
      WHERE namespace = ? AND key = ?
    `);
    
    const result = stmt.run(namespace, key);
    return result.changes > 0;
  }
  
  async listNamespaces(): Promise<string[]> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT namespace FROM storage
      ORDER BY namespace
    `);
    
    const rows = stmt.all();
    return rows.map((row: any) => row.namespace);
  }
  
  async getStats(): Promise<BackendStats> {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM storage');
    const sizeStmt = this.db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
    
    const countResult = countStmt.get();
    const sizeResult = sizeStmt.get();
    
    return {
      entries: countResult.count,
      size: sizeResult.size,
      lastModified: Date.now()
    };
  }
}

// JSON file backend
export class JSONBackend extends BaseBackend {
  private data = new Map<string, { value: JSONValue; timestamp: number }>();
  private filepath: string;
  
  constructor(config: BackendConfig) {
    super(config);
    this.filepath = `${config.path}/memory-backend.json`;
  }
  
  async initialize(): Promise<void> {
    // Load existing data if available
    try {
      const fs = await import('node:fs/promises');
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
      timestamp,
      status: 'success'
    };
  }
  
  async retrieve(key: string, namespace: string = 'default'): Promise<JSONValue | null> {
    const fullKey = `${namespace}:${key}`;
    const entry = this.data.get(fullKey);
    return entry?.value ?? null;
  }

  async search(pattern: string, namespace: string = 'default'): Promise<Record<string, JSONValue>> {
    const results: Record<string, JSONValue> = {};
    const prefix = `${namespace}:`;
    for (const [key, entry] of Array.from(this.data.entries())) {
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
    for (const key of Array.from(this.data.keys())) {
      const namespace = key.split(':')[0];
      namespaces.add(namespace);
    }
    return Array.from(namespaces);
  }
  
  async getStats(): Promise<BackendStats> {
    return {
      entries: this.data.size,
      size: JSON.stringify(Array.from(this.data.entries())).length,
      lastModified: Date.now()
    };
  }
  
  private async persist(): Promise<void> {
    const fs = await import('node:fs/promises');
    const dir = this.filepath.substring(0, this.filepath.lastIndexOf('/'));
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Convert Map to object for JSON serialization
    const obj: Record<string, any> = {};
    for (const [key, value] of Array.from(this.data.entries())) {
      obj[key] = value;
    }
    
    await fs.writeFile(this.filepath, JSON.stringify(obj, null, 2));
  }
}


export default MemoryBackendPlugin;