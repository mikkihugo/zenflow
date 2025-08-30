# Vector RAG Backend - Knowledge System Enhancement

This document describes the Vector RAG (Retrieval-Augmented Generation) backend implementation that enhances the knowledge cache system with semantic search and architectural decision support.

## Overview

The Vector RAG backend provides advanced semantic search capabilities by combining:

- **SQLite Backend**: Fast exact matches, metadata filtering, and structured storage
- **Vector Embeddings**: Semantic similarity search for natural language queries
- **Hybrid Search**: Best of both exact and semantic search approaches
- **Architectural Knowledge**: Pre-ingested architectural decisions and patterns
- **Multi-modal Support**: Facts, decisions, code patterns, and documentation

## Key Features

### 🔍 Semantic Search
- Vector embeddings for natural language understanding
- Similarity-based retrieval for related knowledge
- Configurable similarity thresholds
- Support for multiple embedding models

### 🏗️ Architectural Knowledge Integration
- Pre-ingested architectural decisions and patterns
- Agent type information and coordination patterns
- Orchestration architecture and design decisions
- Code patterns and implementation guidance

### 🔄 Hybrid Search Strategy
- Combine exact text matching with semantic similarity
- Configurable weighting between approaches
- Ranked results using hybrid scoring
- Support for different search modes (exact, semantic, hybrid)

### 📊 Enhanced Analytics
- Vector storage statistics and metrics
- Embedding model information
- Search performance tracking
- Knowledge type distribution analysis

## Configuration

### Environment Variables

```bash
# Enable Vector RAG backend
KNOWLEDGE_CACHE_BACKEND=vector-rag

# Vector configuration
VECTOR_DIMENSIONS=384
EMBEDDING_MODEL=text-embedding-3-small
SIMILARITY_THRESHOLD=0.7
MAX_VECTOR_RESULTS=10
HYBRID_SEARCH_WEIGHT=0.5

# Architectural knowledge
ENABLE_ARCHITECTURAL_KNOWLEDGE=true
ARCHITECTURAL_DOCS_PATH=./docs/architecture

# SQLite backend configuration (inherited)
SQLITE_DB_PATH=./knowledge-cache.db
SQLITE_ENABLE_WAL=true
SQLITE_ENABLE_FTS=true
```

### Programmatic Configuration

```typescript
import { VectorRAGBackend } from '@claude-zen/knowledge';

const backend = new VectorRAGBackend({
  // Base configuration
  backend: 'vector-rag',
  maxMemoryCacheSize: 10000,
  defaultTTL: 3600000,
  cleanupInterval: 60000,
  maxEntryAge: 86400000,
  
  // Vector-specific configuration
  vectorDimensions: 384,
  embeddingModel: 'text-embedding-3-small',
  similarityThreshold: 0.7,
  maxVectorResults: 10,
  hybridSearchWeight: 0.5, // 50% text, 50% semantic
  
  // Architectural knowledge
  enableArchitecturalKnowledge: true,
  architecturalDocsPath: './docs/architecture',
  
  // Backend-specific options
  backendConfig: {
    dbPath: './knowledge-cache.db',
    enableWAL: true,
    enableFullTextSearch: true,
  },
});

await backend.initialize();
```

## Usage Examples

### Basic Knowledge Storage

```typescript
import { VectorRAGBackend, type VectorKnowledgeEntry } from '@claude-zen/knowledge';

const backend = new VectorRAGBackend(config);
await backend.initialize();

// Store knowledge with semantic tags
const knowledgeEntry: VectorKnowledgeEntry = {
  id: 'neural-networks-basics',
  query: 'What are neural networks and how do they work?',
  result: {
    definition: 'Neural networks are computing systems inspired by biological neural networks',
    keyComponents: ['neurons', 'weights', 'activation functions', 'layers'],
    applications: ['classification', 'regression', 'pattern recognition']
  },
  source: 'AI textbook',
  timestamp: Date.now(),
  ttl: 86400000, // 24 hours
  accessCount: 0,
  lastAccessed: Date.now(),
  knowledgeType: 'documentation',
  metadata: {
    type: 'educational',
    domains: ['machine-learning', 'neural-networks'],
    confidence: 0.95,
    version: '1.0.0'
  },
  semanticTags: ['neural-networks', 'machine-learning', 'artificial-intelligence', 'deep-learning']
};

await backend.store(knowledgeEntry);
```

### Semantic Search

```typescript
// Natural language semantic search
const semanticResults = await backend.search({
  query: 'How can I optimize machine learning model training?',
  searchType: 'semantic',
  maxResults: 5,
  similarityThreshold: 0.7
});

console.log('Semantic search results:', semanticResults.map(r => ({
  id: r.id,
  query: r.query,
  knowledgeType: r.knowledgeType,
  domains: r.metadata.domains
})));
```

### Hybrid Search for Best Results

```typescript
// Combine exact and semantic search
const hybridResults = await backend.search({
  query: 'distributed coordination patterns',
  searchType: 'hybrid',
  maxResults: 10,
  domains: ['coordination', 'architecture'],
  type: 'architectural-decision'
});

console.log('Hybrid search results:', hybridResults);
```

### Architectural Knowledge Queries

```typescript
// Query architectural decisions
const architecturalKnowledge = await backend.search({
  query: 'What agent types are available for coordination?',
  type: 'architectural-decision',
  domains: ['coordination'],
  maxResults: 5
});

// Query orchestration patterns
const orchestrationPatterns = await backend.search({
  query: 'multi-level orchestration architecture',
  knowledgeType: 'architectural-decision',
  maxResults: 3
});
```

### Advanced Search with Filters

```typescript
// Search with multiple filters and confidence thresholds
const filteredResults = await backend.search({
  query: 'neural network optimization techniques',
  type: 'documentation',
  domains: ['machine-learning', 'optimization'],
  minConfidence: 0.8,
  maxResults: 15,
  timeRange: {
    start: Date.now() - 86400000 * 30, // Last 30 days
    end: Date.now()
  }
});
```

## Knowledge Types

The Vector RAG backend supports multiple knowledge types for better organization:

### 📋 Fact
Basic factual information and data

```typescript
const factEntry: VectorKnowledgeEntry = {
  id: 'fact-typescript-version',
  query: 'What is the current TypeScript version?',
  result: { version: '5.3.0', releaseDate: '2023-11-16' },
  knowledgeType: 'fact',
  // ... other properties
};
```

### 🏗️ Architectural Decision
Design decisions and architectural patterns

```typescript
const architecturalEntry: VectorKnowledgeEntry = {
  id: 'arch-microservices-pattern',
  query: 'How should microservices communicate?',
  result: {
    pattern: 'Event-driven architecture with message queues',
    benefits: ['loose coupling', 'scalability', 'fault tolerance'],
    implementation: 'Use Apache Kafka or RabbitMQ for async communication'
  },
  knowledgeType: 'architectural-decision',
  // ... other properties
};
```

### 💻 Code Pattern
Programming patterns and code examples

```typescript
const codePatternEntry: VectorKnowledgeEntry = {
  id: 'pattern-singleton',
  query: 'How to implement singleton pattern in TypeScript?',
  result: {
    pattern: 'Singleton with static instance',
    code: `class Singleton {
      private static instance: Singleton;
      private constructor() {}
      static getInstance(): Singleton {
        if (!Singleton.instance) {
          Singleton.instance = new Singleton();
        }
        return Singleton.instance;
      }
    }`
  },
  knowledgeType: 'code-pattern',
  // ... other properties
};
```

### 📚 Documentation
Reference documentation and guides

```typescript
const documentationEntry: VectorKnowledgeEntry = {
  id: 'docs-api-authentication',
  query: 'How to authenticate API requests?',
  result: {
    methods: ['JWT tokens', 'API keys', 'OAuth 2.0'],
    recommended: 'JWT with refresh tokens',
    security: 'Always use HTTPS and validate tokens server-side'
  },
  knowledgeType: 'documentation',
  // ... other properties
};
```

## Search Strategies

### Exact Search
Fast text-based search using SQLite FTS5:

```typescript
const exactResults = await backend.search({
  query: 'TypeScript interface',
  searchType: 'exact',
  maxResults: 10
});
```

### Semantic Search
Vector similarity search for related concepts:

```typescript
const semanticResults = await backend.search({
  query: 'object-oriented programming principles',
  searchType: 'semantic',
  similarityThreshold: 0.7,
  maxResults: 15
});
```

### Hybrid Search (Recommended)
Combines both approaches for comprehensive results:

```typescript
const hybridResults = await backend.search({
  query: 'neural network training optimization',
  searchType: 'hybrid', // Default
  maxResults: 20
});
```

## Integration with Existing Systems

### LanceDB Vector Storage
The backend integrates with the existing LanceDB infrastructure:

```typescript
// Vector storage configuration is handled automatically
// Uses existing LanceDB adapters for production deployment
const backend = new VectorRAGBackend({
  // ... configuration
  backendConfig: {
    vectorStorageConfig: {
      // Automatically uses existing LanceDB setup
      useExistingVectorStorage: true,
      vectorCollectionName: 'knowledge_embeddings'
    }
  }
});
```

### SQLite Backend Compatibility
Full compatibility with existing SQLite backend:

```typescript
// Can be used as a drop-in replacement
const config = {
  backend: 'vector-rag', // Changed from 'sqlite'
  // ... all existing SQLite configuration works
};
```

## Performance Optimization

### Caching Strategy
- **L1 Cache**: In-memory embedding cache for frequently accessed queries
- **L2 Cache**: Vector similarity cache for recent searches
- **L3 Storage**: Persistent SQLite and vector storage

### Indexing
- **SQLite FTS5**: Full-text search indexing for exact matches
- **Vector Indexing**: Efficient similarity search using LanceDB
- **Metadata Indexing**: Fast filtering by domains and types

### Query Optimization
- **Parallel Search**: Concurrent execution of exact and semantic searches
- **Result Ranking**: Intelligent scoring combining relevance and confidence
- **Threshold Optimization**: Adaptive similarity thresholds based on query type

## Monitoring and Analytics

### Statistics
Get comprehensive backend statistics:

```typescript
const stats = await backend.getStats();
console.log('Vector RAG Statistics:', {
  totalEntries: stats.persistentEntries,
  vectorEntries: stats.vectorEntries,
  embeddingModel: stats.embeddingModel,
  storageHealth: stats.storageHealth,
  cacheHitRate: stats.cacheHitRate
});
```

### Performance Metrics
Monitor search performance and quality:

```typescript
// Search with performance tracking
const startTime = Date.now();
const results = await backend.search({ query: 'optimization techniques' });
const searchTime = Date.now() - startTime;

console.log(`Search completed in ${searchTime}ms with ${results.length} results`);
```

## Migration from SQLite Backend

### Step 1: Update Configuration
```typescript
// Before
const config = { backend: 'sqlite', /* ... */ };

// After
const config = { 
  backend: 'vector-rag',
  vectorDimensions: 384,
  embeddingModel: 'text-embedding-3-small',
  // ... existing SQLite config still works
};
```

### Step 2: Enable Architectural Knowledge
```typescript
const config = {
  // ... existing config
  enableArchitecturalKnowledge: true,
  architecturalDocsPath: './docs/architecture'
};
```

### Step 3: Update Search Queries
```typescript
// Enhanced search with semantic capabilities
const results = await backend.search({
  query: 'natural language query here',
  searchType: 'hybrid', // New capability
  maxResults: 10
});
```

## Best Practices

### 1. Use Appropriate Knowledge Types
Choose the right knowledge type for better organization:

```typescript
// For design decisions
knowledgeType: 'architectural-decision'

// For code examples
knowledgeType: 'code-pattern'

// For factual data
knowledgeType: 'fact'

// For documentation
knowledgeType: 'documentation'
```

### 2. Add Semantic Tags
Include relevant semantic tags for better search:

```typescript
semanticTags: [
  'primary-topic',
  'related-concept',
  'implementation-detail',
  'domain-specific-term'
]
```

### 3. Optimize Search Queries
Use hybrid search for best results:

```typescript
// Good: Specific, contextual query
const results = await backend.search({
  query: 'How to implement distributed consensus in microservices?',
  type: 'architectural-decision',
  domains: ['distributed-systems', 'consensus'],
  searchType: 'hybrid'
});
```

### 4. Configure Similarity Thresholds
Adjust thresholds based on use case:

```typescript
// Strict matching for critical decisions
similarityThreshold: 0.8

// Broader matching for exploration
similarityThreshold: 0.6
```

## Troubleshooting

### Common Issues

1. **Low Search Quality**
   - Increase vector dimensions
   - Adjust similarity threshold
   - Add more semantic tags
   - Use hybrid search

2. **Slow Performance**
   - Enable caching
   - Optimize vector storage
   - Use appropriate maxResults limits
   - Monitor embedding generation

3. **Missing Results**
   - Check similarity threshold (may be too high)
   - Verify knowledge type filters
   - Ensure proper initialization
   - Check domain filters

### Debug Mode
Enable detailed logging for troubleshooting:

```typescript
const backend = new VectorRAGBackend({
  // ... config
  backendConfig: {
    // ... other config
    enableDebugLogging: true,
    logSearchPerformance: true
  }
});
```

## Future Enhancements

### Planned Features
- **Multi-model Embeddings**: Support for different embedding models per knowledge type
- **Real-time Learning**: Continuous learning from search patterns
- **Cross-domain Transfer**: Knowledge transfer between different domains
- **Federated Search**: Distributed search across multiple knowledge bases

### Integration Roadmap
- **LLM Integration**: Direct integration with language models for enhanced understanding
- **Knowledge Graphs**: Graph-based knowledge representation and reasoning
- **Collaborative Filtering**: User behavior-based knowledge recommendations
- **Version Control**: Knowledge versioning and change tracking

The Vector RAG backend represents a significant enhancement to the knowledge system, providing the semantic search capabilities needed for AI coordination and architectural decision support.