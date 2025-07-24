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
      default:
        throw new Error(`Unsupported backend: ${this.config.backend}`);
    }
    
    const result = await this.storage.initialize();
    
    // Handle fallback returns
    if (result && result !== this.storage) {
      this.storage = result;
    }
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
 * LanceDB Backend (Default - Local Vector Database)
 */
class LanceDBBackend {
  constructor(config) {
    this.config = config;
    this.db = null;
    this.table = null;
    this.lanceConfig = config.lanceConfig || config.chromaConfig; // Support both config names
  }

  async initialize() {
    try {
      // Dynamic import for LanceDB
      const lancedb = await import('@lancedb/lancedb');
      
      // Ensure persist directory exists
      const fs = await import('fs/promises');
      await fs.mkdir(this.lanceConfig.persistDirectory, { recursive: true });
      
      // Initialize LanceDB connection
      this.db = await lancedb.connect(this.lanceConfig.persistDirectory);
      
      // Create or get table
      const tableName = this.lanceConfig.collection || 'strategic_docs';
      
      try {
        this.table = await this.db.openTable(tableName);
        console.log(`🧠 LanceDB table '${tableName}' opened from: ${this.lanceConfig.persistDirectory}`);
      } catch (error) {
        // Table doesn't exist, create it
        this.table = await this.db.createTable(tableName, [
          { id: 'sample', text: 'sample text', metadata: {} }
        ]);
        console.log(`🧠 LanceDB table '${tableName}' created at: ${this.lanceConfig.persistDirectory}`);
      }
      
      console.log(`🧠 LanceDB vector database ready (file-based persistence)`);
    } catch (error) {
      console.warn(`⚠️ LanceDB not available, falling back to SQLite: ${error.message}`);
      // Fallback to SQLite if LanceDB fails
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
    
    // For Vectra, we need to store documents as text content for embeddings
    // Use the content field if it exists, otherwise use the serialized value
    const documentText = (typeof value === 'object' && value.content) 
      ? value.content 
      : (typeof value === 'string' ? value : serializedValue);
    
    const document = {
      id: fullKey,
      text: documentText,
      metadata: {
        namespace,
        key,
        timestamp,
        type: typeof value,
        size: serializedValue.length,
        serialized_data: serializedValue // Store the full object here
      }
    };
    
    await this.index.insertItem(document);
    
    return { 
      id: fullKey, 
      size: serializedValue.length,
      timestamp,
      hasEmbedding: true // Vectra automatically generates embeddings
    };
  }

  async retrieve(key, namespace) {
    const fullKey = `${namespace}:${key}`;
    
    try {
      const results = await this.collection.get({
        ids: [fullKey],
        include: ['metadatas']
      });
      
      if (!results.metadatas || results.metadatas.length === 0) {
        return null;
      }
      
      // Get the serialized data from metadata
      const metadata = results.metadatas[0];
      if (metadata.serialized_data) {
        return JSON.parse(metadata.serialized_data);
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to retrieve value for ${fullKey}: ${error.message}`);
      return null;
    }
  }

  async search(pattern, namespace) {
    const results = {};
    
    try {
      // Get all documents for the namespace
      const queryResults = await this.collection.get({
        where: { namespace: namespace },
        include: ['metadatas']
      });
      
      if (queryResults.metadatas) {
        for (const metadata of queryResults.metadatas) {
          // Simple pattern matching
          const key = metadata.key;
          if (pattern === '*' || key.includes(pattern.replace('*', ''))) {
            try {
              if (metadata.serialized_data) {
                results[key] = JSON.parse(metadata.serialized_data);
              }
            } catch (error) {
              console.warn(`Failed to parse stored value for ${namespace}:${key}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Search failed for pattern ${pattern} in namespace ${namespace}: ${error.message}`);
    }
    
    return results;
  }

  async semanticSearch(query, namespace, limit = 10) {
    try {
      // Use ChromaDB's built-in semantic search
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit,
        where: { namespace },
        include: ['metadatas', 'distances', 'documents']
      });
      
      const semanticResults = [];
      if (results.documents && results.metadatas && results.distances) {
        for (let i = 0; i < results.documents[0].length; i++) {
          try {
            const metadata = results.metadatas[0][i];
            const similarity = 1 - results.distances[0][i]; // Convert distance to similarity
            
            semanticResults.push({
              key: metadata.key,
              content: metadata.serialized_data ? JSON.parse(metadata.serialized_data) : results.documents[0][i],
              similarity: similarity,
              metadata: metadata
            });
          } catch (error) {
            console.warn(`Failed to parse semantic search result ${i}: ${error.message}`);
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
    try {
      const count = await this.collection.count();
      const results = await this.collection.get({
        include: ['metadatas']
      });
      
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
        hasSemanticSearch: true // ChromaDB has built-in semantic search
      };
    } catch (error) {
      console.warn(`Failed to get stats: ${error.message}`);
      return {
        entries: 0,
        size: 0,
        namespaces: 0,
        collection: this.chromaConfig.collection,
        hasSemanticSearch: true
      };
    }
  }

  async cleanup() {
    // LanceDB client cleanup
    if (this.db) {
      await this.db.close();
    }
    console.log('🧠 LanceDB backend cleaned up');
  }
}

/**
 * Kuzu Backend (Graph Database for Relationships)
 */
class KuzuBackend {
  constructor(config) {
    this.config = config;
    this.db = null;
    this.kuzuConfig = config.kuzuConfig || config.chromaConfig; // Support fallback config names
  }

  async initialize() {
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
    } catch (error) {
      console.warn(`⚠️ Kuzu not available, falling back to SQLite: ${error.message}`);
      // Fallback to SQLite if Kuzu fails
      const sqliteBackend = new SQLiteBackend(this.config);
      await sqliteBackend.initialize();
      return sqliteBackend;
    }
  }

  async initializeSchema() {
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
    } catch (error) {
      console.warn(`Schema initialization warning: ${error.message}`);
    }
  }

  async store(key, value, namespace) {
    const fullKey = `${namespace}:${key}`;
    const timestamp = Date.now();
    
    // Serialize value for storage
    const serializedValue = JSON.stringify(value);
    
    // Extract text content for graph analysis
    const documentText = (typeof value === 'object' && value.content) 
      ? value.content 
      : (typeof value === 'string' ? value : serializedValue);
    
    const title = (typeof value === 'object' && value.title) 
      ? value.title 
      : key;

    const docType = (typeof value === 'object' && value.documentType) 
      ? value.documentType 
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
        hasGraph: true // Kuzu provides graph relationships
      };
    } catch (error) {
      console.warn(`Failed to store in Kuzu: ${error.message}`);
      throw error;
    }
  }

  async retrieve(key, namespace) {
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
    } catch (error) {
      console.warn(`Failed to retrieve from Kuzu: ${error.message}`);
      return null;
    }
  }

  async search(pattern, namespace) {
    const results = {};
    
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
        } catch (error) {
          console.warn(`Failed to parse metadata for ${key}`);
        }
      }
    } catch (error) {
      console.warn(`Search failed in Kuzu: ${error.message}`);
    }
    
    return results;
  }

  async semanticSearch(query, namespace, limit = 10) {
    // Kuzu focuses on graph relationships rather than vector similarity
    // For semantic search, we'd typically combine with LanceDB
    // For now, return related documents through graph traversal
    
    try {
      const results = await this.conn.query(`
        MATCH (d:Document)-[:References*1..2]-(related:Document)
        WHERE d.namespace = $namespace AND d.content CONTAINS $query
        RETURN DISTINCT related.key, related.metadata, related.title
        LIMIT $limit
      `, { 
        namespace: namespace, 
        query: query,
        limit: limit 
      });

      return results.map(row => ({
        key: row['related.key'],
        content: JSON.parse(row['related.metadata']),
        similarity: 0.8, // Graph-based similarity
        metadata: { title: row['related.title'] }
      }));
    } catch (error) {
      console.warn(`Graph search failed: ${error.message}`);
      return [];
    }
  }

  async delete(key, namespace) {
    const fullKey = `${namespace}:${key}`;
    
    try {
      await this.conn.query(`
        MATCH (d:Document {id: $id})
        DETACH DELETE d
      `, { id: fullKey });
      
      return true;
    } catch (error) {
      console.warn(`Failed to delete from Kuzu: ${error.message}`);
      return false;
    }
  }

  async listNamespaces() {
    try {
      const result = await this.conn.query(`
        MATCH (d:Document)
        RETURN DISTINCT d.namespace
      `);
      
      return result.map(row => row['d.namespace']).sort();
    } catch (error) {
      console.warn(`Failed to list namespaces: ${error.message}`);
      return [];
    }
  }

  async getStats() {
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
        relationships: relCount[0]?.count || 0,
        namespaces: namespaceCount[0]?.count || 0,
        database: this.kuzuConfig.persistDirectory,
        hasGraph: true
      };
    } catch (error) {
      console.warn(`Failed to get stats: ${error.message}`);
      return {
        entries: 0,
        relationships: 0,
        namespaces: 0,
        database: this.kuzuConfig.persistDirectory,
        hasGraph: true
      };
    }
  }

  // Graph-specific methods
  async createRelationship(fromKey, toKey, relationshipType, namespace, strength = 1.0) {
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
    } catch (error) {
      console.warn(`Failed to create relationship: ${error.message}`);
      return false;
    }
  }

  async findRelatedDocuments(key, namespace, relationshipTypes = [], maxDepth = 2) {
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

      return result.map(row => ({
        key: row['related.key'],
        content: JSON.parse(row['related.metadata']),
        distance: row.distance,
        title: row['related.title']
      }));
    } catch (error) {
      console.warn(`Failed to find related documents: ${error.message}`);
      return [];
    }
  }

  async cleanup() {
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
class SQLiteBackend {
  constructor(config) {
    this.config = config;
    this.db = null;
    this.dbPath = `${config.path}/storage.db`;
  }

  async initialize() {
    try {
      // Ensure directory exists
      const fs = await import('fs/promises');
      const path = await import('path');
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      
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