/**
 * Memory Backend Plugin Interface
 * Pluggable storage backends for the main system
 */

export class MemoryBackendPlugin {
  constructor(config = {}) {
    this.config = {
      backend: 'chroma',           // ChromaDB for AI/semantic content
      path: './memory',
      maxSize: 1000000, // 1MB
      compression: false,
      // ChromaDB specific config
      chromaConfig: {
        path: './memory/chroma_db',  // File-based ChromaDB
        collection: 'claude_zen_memory',
        persistDirectory: './memory/chroma_persist'
      },
      ...config
    };
    
    this.storage = null;
  }

  async initialize() {
    console.log(`💾 Memory Backend Plugin initialized (${this.config.backend})`);
    
    // Initialize the appropriate backend
    switch (this.config.backend) {
      case 'chroma':
        this.storage = new ChromaDBBackend(this.config);
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
      default:
        throw new Error(`Unsupported backend: ${this.config.backend}`);
    }
    
    await this.storage.initialize();
  }

  async store(key, value, namespace = 'default') {
    return this.storage.store(key, value, namespace);
  }

  async retrieve(key, namespace = 'default') {
    return this.storage.retrieve(key, namespace);
  }

  async search(pattern, namespace = 'default') {
    return this.storage.search(pattern, namespace);
  }

  async delete(key, namespace = 'default') {
    return this.storage.delete(key, namespace);
  }

  async listNamespaces() {
    return this.storage.listNamespaces();
  }

  async getStats() {
    return {
      backend: this.config.backend,
      ...(await this.storage.getStats())
    };
  }

  async cleanup() {
    if (this.storage?.cleanup) {
      await this.storage.cleanup();
    }
    console.log('💾 Memory Backend Plugin cleaned up');
  }
}

/**
 * ChromaDB Backend (Default - Optimized for AI/Vector Storage)
 */
class ChromaDBBackend {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.collection = null;
    this.chromaConfig = config.chromaConfig;
  }

  async initialize() {
    try {
      // Dynamic import for ChromaDB - file-based mode
      const { ChromaClient } = await import('chromadb');
      
      // Initialize file-based ChromaDB client
      this.client = new ChromaClient({
        path: this.chromaConfig.persistDirectory
      });
      
      // Get or create collection
      try {
        this.collection = await this.client.getCollection({
          name: this.chromaConfig.collection
        });
      } catch (error) {
        // Collection doesn't exist, create it
        this.collection = await this.client.createCollection({
          name: this.chromaConfig.collection,
          metadata: {
            description: 'Claude Zen memory storage with semantic search',
            created: new Date().toISOString()
          }
        });
      }
      
      console.log(`🧠 ChromaDB collection '${this.chromaConfig.collection}' ready (file-based)`);
    } catch (error) {
      console.warn(`⚠️ ChromaDB not available, falling back to SQLite: ${error.message}`);
      // Fallback to SQLite if ChromaDB fails
      const sqliteBackend = new SQLiteBackend(this.config);
      await sqliteBackend.initialize();
      return sqliteBackend;
    }
  }

  async store(key, value, namespace) {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    
    // Serialize value for storage
    const serializedValue = JSON.stringify(value);
    
    // Generate embedding if AI provider available
    let embedding = null;
    if (this.config.aiProvider && typeof value === 'string') {
      try {
        embedding = await this.generateEmbedding(value);
      } catch (error) {
        console.warn(`Failed to generate embedding for ${fullKey}: ${error.message}`);
      }
    }
    
    const document = {
      id: fullKey,
      document: serializedValue,
      metadata: {
        namespace,
        key,
        timestamp,
        type: typeof value,
        size: serializedValue.length
      }
    };
    
    if (embedding) {
      document.embedding = embedding;
    }
    
    await this.collection.upsert([document]);
    
    return { 
      id: fullKey, 
      size: serializedValue.length,
      timestamp,
      hasEmbedding: !!embedding
    };
  }

  async retrieve(key, namespace) {
    const fullKey = `${namespace}:${key}`;
    
    const results = await this.collection.get({
      ids: [fullKey]
    });
    
    if (!results.documents || results.documents.length === 0) {
      return null;
    }
    
    try {
      return JSON.parse(results.documents[0]);
    } catch (error) {
      console.warn(`Failed to parse stored value for ${fullKey}`);
      return null;
    }
  }

  async search(pattern, namespace) {
    const results = {};
    
    // Use metadata filtering for pattern search
    const queryResults = await this.collection.get({
      where: {
        namespace: namespace,
        key: { $regex: pattern.replace('*', '.*') }
      }
    });
    
    if (queryResults.documents && queryResults.metadatas) {
      for (let i = 0; i < queryResults.documents.length; i++) {
        const doc = queryResults.documents[i];
        const metadata = queryResults.metadatas[i];
        
        try {
          results[metadata.key] = JSON.parse(doc);
        } catch (error) {
          console.warn(`Failed to parse stored value for ${namespace}:${metadata.key}`);
        }
      }
    }
    
    return results;
  }

  async semanticSearch(query, namespace, limit = 10) {
    if (!this.config.aiProvider) {
      console.warn('Semantic search requires AI provider for embeddings');
      return [];
    }
    
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: { namespace }
      });
      
      const semanticResults = [];
      if (results.documents && results.metadatas && results.distances) {
        for (let i = 0; i < results.documents[0].length; i++) {
          try {
            semanticResults.push({
              key: results.metadatas[0][i].key,
              content: JSON.parse(results.documents[0][i]),
              similarity: 1 - results.distances[0][i], // Convert distance to similarity
              metadata: results.metadatas[0][i]
            });
          } catch (error) {
            console.warn(`Failed to parse semantic search result ${i}`);
          }
        }
      }
      
      return semanticResults.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.warn(`Semantic search failed: ${error.message}`);
      return [];
    }
  }

  async generateEmbedding(text) {
    if (!this.config.aiProvider) {
      throw new Error('AI provider required for embeddings');
    }
    
    // Use AI provider to generate embeddings
    return this.config.aiProvider.generateEmbedding(text);
  }

  async delete(key, namespace) {
    const fullKey = `${namespace}:${key}`;
    
    try {
      await this.collection.delete({
        ids: [fullKey]
      });
      return true;
    } catch (error) {
      console.warn(`Failed to delete ${fullKey}: ${error.message}`);
      return false;
    }
  }

  async listNamespaces() {
    const results = await this.collection.get({});
    
    if (!results.metadatas) return [];
    
    const namespaces = new Set();
    for (const metadata of results.metadatas) {
      if (metadata.namespace) {
        namespaces.add(metadata.namespace);
      }
    }
    
    return Array.from(namespaces).sort();
  }

  async getStats() {
    const results = await this.collection.get({});
    const count = results.documents ? results.documents.length : 0;
    
    let totalSize = 0;
    const namespaces = new Set();
    
    if (results.metadatas) {
      for (const metadata of results.metadatas) {
        totalSize += metadata.size || 0;
        if (metadata.namespace) {
          namespaces.add(metadata.namespace);
        }
      }
    }
    
    return {
      entries: count,
      size: totalSize,
      namespaces: namespaces.size,
      collection: this.chromaConfig.collection,
      hasSemanticSearch: !!this.config.aiProvider
    };
  }

  async cleanup() {
    // ChromaDB client doesn't need explicit cleanup
    console.log('🧠 ChromaDB backend cleaned up');
  }
}

/**
 * SQLite Backend (Fallback)
 */
class SQLiteBackend {
  constructor(config) {
    this.config = config;
    this.db = null;
    this.dbPath = `${config.path}/storage.db`;
  }

  async initialize() {
    try {
      // Dynamic import for better-sqlite3
      const Database = (await import('better-sqlite3')).default;
      this.db = new Database(this.dbPath);
      
      // Create tables
      this.db.exec(`
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
    } catch (error) {
      console.warn(`⚠️ SQLite not available, falling back to JSON: ${error.message}`);
      // Fallback to JSON if SQLite fails
      const jsonBackend = new JsonBackend(this.config);
      await jsonBackend.initialize();
      return jsonBackend;
    }
  }

  async store(key, value, namespace) {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    const serializedValue = JSON.stringify(value);
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO storage (id, namespace, key, value, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(fullKey, namespace, key, serializedValue, timestamp);
    
    return { 
      id: fullKey, 
      size: serializedValue.length,
      timestamp 
    };
  }

  async retrieve(key, namespace) {
    const stmt = this.db.prepare(`
      SELECT value FROM storage 
      WHERE namespace = ? AND key = ?
    `);
    
    const row = stmt.get(namespace, key);
    if (!row) return null;
    
    try {
      return JSON.parse(row.value);
    } catch (error) {
      console.warn(`Failed to parse stored value for ${namespace}:${key}`);
      return null;
    }
  }

  async search(pattern, namespace) {
    const results = {};
    
    const stmt = this.db.prepare(`
      SELECT key, value FROM storage 
      WHERE namespace = ? AND key LIKE ?
    `);
    
    const searchPattern = pattern.replace('*', '%');
    const rows = stmt.all(namespace, searchPattern);
    
    for (const row of rows) {
      try {
        results[row.key] = JSON.parse(row.value);
      } catch (error) {
        console.warn(`Failed to parse stored value for ${namespace}:${row.key}`);
      }
    }
    
    return results;
  }

  async delete(key, namespace) {
    const stmt = this.db.prepare(`
      DELETE FROM storage 
      WHERE namespace = ? AND key = ?
    `);
    
    const result = stmt.run(namespace, key);
    return result.changes > 0;
  }

  async listNamespaces() {
    const stmt = this.db.prepare(`
      SELECT DISTINCT namespace FROM storage
      ORDER BY namespace
    `);
    
    const rows = stmt.all();
    return rows.map(row => row.namespace);
  }

  async getStats() {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM storage');
    const sizeStmt = this.db.prepare('SELECT SUM(LENGTH(value)) as size FROM storage');
    const namespaceStmt = this.db.prepare('SELECT COUNT(DISTINCT namespace) as namespaces FROM storage');
    
    const count = countStmt.get().count;
    const size = sizeStmt.get().size || 0;
    const namespaces = namespaceStmt.get().namespaces;
    
    return {
      entries: count,
      size: size,
      namespaces: namespaces,
      dbPath: this.dbPath
    };
  }

  async cleanup() {
    if (this.db) {
      this.db.close();
    }
  }
}

/**
 * JSON File Backend (Fallback)
 */
class JsonBackend {
  constructor(config) {
    this.config = config;
    this.data = new Map();
    this.filepath = `${config.path}/storage.json`;
  }

  async initialize() {
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

  async store(key, value, namespace) {
    const fullKey = `${namespace}:${key}`;
    this.data.set(fullKey, { value, timestamp: Date.now() });
    await this.persist();
    return { id: fullKey, size: JSON.stringify(value).length };
  }

  async retrieve(key, namespace) {
    const fullKey = `${namespace}:${key}`;
    const entry = this.data.get(fullKey);
    return entry?.value || null;
  }

  async search(pattern, namespace) {
    const results = {};
    const prefix = `${namespace}:`;
    
    for (const [key, entry] of this.data) {
      if (key.startsWith(prefix) && key.includes(pattern)) {
        results[key.substring(prefix.length)] = entry.value;
      }
    }
    
    return results;
  }

  async delete(key, namespace) {
    const fullKey = `${namespace}:${key}`;
    const deleted = this.data.delete(fullKey);
    if (deleted) await this.persist();
    return deleted;
  }

  async listNamespaces() {
    const namespaces = new Set();
    for (const key of this.data.keys()) {
      const namespace = key.split(':')[0];
      namespaces.add(namespace);
    }
    return Array.from(namespaces);
  }

  async persist() {
    try {
      const fs = await import('fs/promises');
      const dataObj = Object.fromEntries(this.data);
      await fs.mkdir(this.config.path, { recursive: true });
      await fs.writeFile(this.filepath, JSON.stringify(dataObj, null, 2));
    } catch (error) {
      console.warn('Failed to persist JSON backend:', error.message);
    }
  }

  async getStats() {
    return {
      entries: this.data.size,
      size: JSON.stringify(Object.fromEntries(this.data)).length,
      namespaces: (await this.listNamespaces()).length
    };
  }
}

// Placeholder for PostgreSQL backend

class PostgreSQLBackend {
  constructor(config) {
    this.config = config;
  }
  
  async initialize() {
    throw new Error('PostgreSQL backend not yet implemented');
  }
}

export default MemoryBackendPlugin;