# Memory Management API

Claude Code Flow provides a multi-layered memory architecture with SQLite, LanceDB, and Kuzu for comprehensive data persistence and retrieval.

## Architecture Overview

```
┌─────────────────────┐
│    Application      │
├─────────────────────┤
│   Memory Manager    │
├─────────────────────┤
│ SQLite │ LanceDB    │  Primary & Vector Storage
├─────────────────────┤
│      Kuzu          │  Graph Relationships
└─────────────────────┘
```

## SQLite Memory Store

Primary persistent storage for hive-mind coordination and agent state.

### Basic Operations

```javascript
import { SqliteMemoryStore } from '@claude-zen/monorepo';

const memoryStore = new SqliteMemoryStore({
  dbName: 'claude-zen-memory.db',
  options: {
    enableWAL: true,
    enableForeignKeys: true,
    cacheSize: 10000
  }
});

await memoryStore.initialize();
```

### Store Data
```javascript
// Store simple key-value data
await memoryStore.store('user-preferences', {
  theme: 'dark',
  language: 'en',
  notifications: true
});

// Store with metadata
await memoryStore.store('session-data', {
  userId: 'user-123',
  sessionId: 'sess-456',
  startTime: new Date()
}, {
  namespace: 'sessions',
  ttl: 3600, // 1 hour
  tags: ['user-session', 'active']
});
```

### Retrieve Data
```javascript
// Get by key
const preferences = await memoryStore.retrieve('user-preferences');

// Get with namespace
const sessionData = await memoryStore.retrieve('session-data', 'sessions');

// Get multiple keys
const data = await memoryStore.retrieveMultiple([
  'user-preferences',
  'session-data'
]);
```

### Search Operations
```javascript
// Search by pattern
const userSessions = await memoryStore.search('user-*', {
  namespace: 'sessions',
  limit: 10
});

// Search by tags
const activeSessions = await memoryStore.searchByTags(['active'], {
  namespace: 'sessions'
});

// Advanced search with filters
const results = await memoryStore.advancedSearch({
  pattern: 'task-*',
  tags: ['high-priority'],
  createdAfter: new Date('2024-01-01'),
  limit: 50
});
```

## LanceDB Vector Store

High-performance vector database for semantic search and embeddings.

### Initialization
```javascript
import { LanceDBStore } from '@claude-zen/monorepo';

const vectorStore = new LanceDBStore({
  path: './data/vectors',
  dimensions: 1536, // OpenAI embeddings
  metric: 'cosine'
});

await vectorStore.initialize();
```

### Store Embeddings
```javascript
// Store text with automatic embedding
await vectorStore.storeText('optimization-strategy', 
  'Use database connection pooling and caching for better performance',
  {
    category: 'performance',
    source: 'best-practices',
    priority: 'high'
  }
);

// Store pre-computed embedding
await vectorStore.storeEmbedding('custom-embedding', 
  [0.1, 0.2, 0.3, ...], // 1536-dimensional vector
  {
    text: 'Custom embedded content',
    metadata: { type: 'custom' }
  }
);
```

### Semantic Search
```javascript
// Search by text query
const results = await vectorStore.searchByText(
  'database optimization techniques',
  {
    limit: 10,
    threshold: 0.8,
    filter: { category: 'performance' }
  }
);

// Search by embedding
const embedding = await vectorStore.generateEmbedding('query text');
const vectorResults = await vectorStore.searchByVector(embedding, {
  limit: 5,
  threshold: 0.85
});

// Hybrid search (text + filters)
const hybridResults = await vectorStore.hybridSearch({
  query: 'swarm coordination patterns',
  filters: {
    category: 'architecture',
    priority: ['high', 'medium']
  },
  limit: 15
});
```

## Kuzu Graph Database

Graph database for modeling complex relationships between entities.

### Initialization
```javascript
import { KuzuGraphStore } from '@claude-zen/monorepo';

const graphStore = new KuzuGraphStore({
  path: './data/graphs',
  schema: {
    nodes: {
      Agent: ['id', 'name', 'type', 'capabilities'],
      Task: ['id', 'title', 'status', 'priority'],
      Swarm: ['id', 'topology', 'strategy']
    },
    relationships: {
      ASSIGNED_TO: ['Agent', 'Task'],
      BELONGS_TO: ['Agent', 'Swarm'],
      DEPENDS_ON: ['Task', 'Task'],
      COORDINATES: ['Agent', 'Agent']
    }
  }
});

await graphStore.initialize();
```

### Node Operations
```javascript
// Create nodes
await graphStore.createNode('Agent', {
  id: 'agent-001',
  name: 'CodeAnalyzer',
  type: 'analyst',
  capabilities: ['code-review', 'optimization']
});

await graphStore.createNode('Task', {
  id: 'task-001',
  title: 'Optimize database queries',
  status: 'in-progress',
  priority: 'high'
});

// Update node
await graphStore.updateNode('Agent', 'agent-001', {
  status: 'active',
  lastSeen: new Date()
});
```

### Relationship Operations
```javascript
// Create relationships
await graphStore.createRelationship(
  'ASSIGNED_TO',
  { type: 'Agent', id: 'agent-001' },
  { type: 'Task', id: 'task-001' },
  { assignedAt: new Date(), role: 'primary' }
);

await graphStore.createRelationship(
  'DEPENDS_ON',
  { type: 'Task', id: 'task-002' },
  { type: 'Task', id: 'task-001' }
);
```

### Graph Queries
```javascript
// Find agent assignments
const assignments = await graphStore.query(`
  MATCH (a:Agent)-[r:ASSIGNED_TO]->(t:Task)
  WHERE a.type = 'analyst'
  RETURN a.name, t.title, r.assignedAt
`);

// Find task dependencies
const dependencies = await graphStore.query(`
  MATCH (t1:Task)-[r:DEPENDS_ON]->(t2:Task)
  WHERE t2.status = 'completed'
  RETURN t1.title, t2.title
`);

// Complex swarm analysis
const swarmStructure = await graphStore.query(`
  MATCH (s:Swarm)<-[b:BELONGS_TO]-(a:Agent)-[c:COORDINATES]->(a2:Agent)
  WHERE s.topology = 'hierarchical'
  RETURN s.id, a.name, a2.name, count(*) as connections
  ORDER BY connections DESC
`);
```

## Unified Memory Manager

High-level interface that coordinates all memory stores.

### Configuration
```javascript
import { UnifiedMemoryManager } from '@claude-zen/monorepo';

const memoryManager = new UnifiedMemoryManager({
  sqlite: {
    dbName: 'claude-zen.db',
    enableWAL: true
  },
  lancedb: {
    path: './vectors',
    dimensions: 1536
  },
  kuzu: {
    path: './graphs',
    enableOptimizations: true
  }
});

await memoryManager.initialize();
```

### Cross-Store Operations
```javascript
// Store with automatic distribution
await memoryManager.store('agent-profile', {
  id: 'agent-001',
  name: 'CodeAnalyzer',
  description: 'Specialized agent for code analysis and optimization',
  capabilities: ['javascript', 'performance-analysis'],
  metadata: {
    created: new Date(),
    version: '1.0'
  }
});

// This automatically:
// 1. Stores basic data in SQLite
// 2. Creates vector embedding for description
// 3. Creates graph node for relationships
```

### Intelligent Search
```javascript
// Multi-modal search
const results = await memoryManager.intelligentSearch({
  query: 'agents capable of performance optimization',
  searchModes: ['text', 'semantic', 'graph'],
  filters: {
    capabilities: 'performance-analysis',
    status: 'active'
  },
  limit: 10
});

// Results contain data from all stores with relevance scoring
console.log(results);
```

## Memory Patterns

### Session Management
```javascript
class SessionManager {
  constructor(memoryManager) {
    this.memory = memoryManager;
  }

  async createSession(userId, metadata = {}) {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await this.memory.store(`session:${sessionId}`, {
      id: sessionId,
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      ...metadata
    }, {
      namespace: 'sessions',
      ttl: 86400, // 24 hours
      tags: ['session', 'active']
    });

    return sessionId;
  }

  async updateActivity(sessionId) {
    await this.memory.update(`session:${sessionId}`, {
      lastActivity: new Date()
    }, 'sessions');
  }

  async getActiveSessions(userId) {
    return await this.memory.search(`session:*`, {
      namespace: 'sessions',
      filters: { userId, tags: ['active'] }
    });
  }
}
```

### Conversation Memory
```javascript
class ConversationMemory {
  constructor(memoryManager) {
    this.memory = memoryManager;
  }

  async storeMessage(conversationId, message) {
    const messageId = `msg-${Date.now()}`;
    
    // Store in SQLite for quick access
    await this.memory.sqlite.store(`conv:${conversationId}:${messageId}`, {
      id: messageId,
      conversationId,
      content: message.content,
      role: message.role,
      timestamp: new Date()
    });

    // Store in vector DB for semantic search
    await this.memory.lancedb.storeText(
      `msg-${messageId}`,
      message.content,
      {
        conversationId,
        role: message.role,
        timestamp: new Date()
      }
    );
  }

  async findSimilarMessages(query, conversationId, limit = 5) {
    return await this.memory.lancedb.searchByText(query, {
      limit,
      filter: { conversationId }
    });
  }

  async getConversationHistory(conversationId, limit = 50) {
    return await this.memory.sqlite.search(`conv:${conversationId}:*`, {
      limit,
      orderBy: 'timestamp DESC'
    });
  }
}
```

### Knowledge Graph Building
```javascript
class KnowledgeGraphBuilder {
  constructor(memoryManager) {
    this.memory = memoryManager;
  }

  async addConcept(concept) {
    // Store concept in graph
    await this.memory.kuzu.createNode('Concept', {
      id: concept.id,
      name: concept.name,
      type: concept.type,
      description: concept.description
    });

    // Store semantic representation
    await this.memory.lancedb.storeText(
      `concept-${concept.id}`,
      `${concept.name}: ${concept.description}`,
      {
        type: 'concept',
        conceptId: concept.id
      }
    );
  }

  async relateConceptS(concept1Id, concept2Id, relationshipType, strength = 1.0) {
    await this.memory.kuzu.createRelationship(
      relationshipType,
      { type: 'Concept', id: concept1Id },
      { type: 'Concept', id: concept2Id },
      { strength, createdAt: new Date() }
    );
  }

  async findRelatedConcepts(conceptId, depth = 2) {
    return await this.memory.kuzu.query(`
      MATCH (c1:Concept)-[r*1..${depth}]-(c2:Concept)
      WHERE c1.id = '${conceptId}'
      RETURN c2.name, length(r) as distance, avg(r.strength) as avgStrength
      ORDER BY distance, avgStrength DESC
    `);
  }
}
```

## Performance Optimization

### Connection Pooling
```javascript
// SQLite connection pooling
const memoryStore = new SqliteMemoryStore({
  dbName: 'claude-zen.db',
  poolSize: 10,
  poolTimeout: 5000,
  enableWAL: true
});
```

### Vector Index Optimization
```javascript
// LanceDB index tuning
const vectorStore = new LanceDBStore({
  path: './vectors',
  indexConfig: {
    type: 'IVF_PQ',
    numPartitions: 256,
    numSubQuantizers: 16
  }
});
```

### Graph Query Optimization
```javascript
// Kuzu query optimization
const graphStore = new KuzuGraphStore({
  path: './graphs',
  optimizations: {
    enableQueryCache: true,
    cacheSize: 1000,
    enableStatistics: true
  }
});
```

## Monitoring & Metrics

### Memory Usage Tracking
```javascript
// Get memory statistics
const stats = await memoryManager.getStatistics();
console.log({
  sqlite: {
    size: stats.sqlite.dbSize,
    tables: stats.sqlite.tableCount,
    records: stats.sqlite.recordCount
  },
  lancedb: {
    vectors: stats.lancedb.vectorCount,
    indexSize: stats.lancedb.indexSize
  },
  kuzu: {
    nodes: stats.kuzu.nodeCount,
    relationships: stats.kuzu.relationshipCount
  }
});
```

### Performance Monitoring
```javascript
// Monitor query performance
memoryManager.on('query', (event) => {
  console.log(`Query: ${event.type} took ${event.duration}ms`);
});

memoryManager.on('slow-query', (event) => {
  console.warn(`Slow query detected: ${event.query} (${event.duration}ms)`);
});
```

## Best Practices

### Data Modeling
1. **Use appropriate store**: SQLite for transactional data, LanceDB for semantic search, Kuzu for relationships
2. **Normalize relationships**: Store entity relationships in Kuzu, not as embedded data
3. **Optimize embeddings**: Use appropriate dimensions and models for your use case
4. **Index strategically**: Create indexes for frequently queried fields

### Performance
1. **Batch operations**: Use batch inserts/updates when possible
2. **Connection pooling**: Configure appropriate pool sizes for your workload
3. **Cache frequently accessed data**: Implement application-level caching for hot data
4. **Monitor query performance**: Track slow queries and optimize

### Data Lifecycle
1. **Set appropriate TTLs**: Use time-to-live for temporary data
2. **Regular cleanup**: Implement cleanup routines for expired data
3. **Backup strategies**: Regular backups of all three stores
4. **Version migration**: Plan for schema changes and data migrations