# 🗄️ Database Coordination Guide

## ⚠️ CRITICAL: Prevent Database Fragmentation

This guide prevents services from creating **fragmented databases** that can't cross-search effectively.

## 🎯 Database Architecture Principles

### ✅ RECOMMENDED: Unified Database + Specialized Stores

```typescript
// ✅ GOOD: Unified database + specialized stores
class MyService {
  private unifiedDatabase: DatabaseConnection; // Primary storage with coordinated indexes
  private vectorRAG?: VectorStore; // ONLY if you need semantic similarity/RAG
  
  // Unified schema with coordinated indexes
  async createSchema() {
    await this.unifiedDatabase.execute(`
      CREATE TABLE my_items (
        id TEXT PRIMARY KEY,
        content TEXT,
        type TEXT,
        -- All your data in ONE table
        
        -- Coordinated indexes for all access patterns
        INDEX idx_type (type),
        INDEX idx_content_search (content),
        INDEX idx_type_content (type, content)
      )
    `);
  }
}
```

### ❌ FORBIDDEN: Multiple Fragmented Databases

```typescript
// ❌ BAD: Creates index fragmentation
class BadService {
  private metadataStore: KeyValueStore;    // Fragmented index
  private searchStore: KeyValueStore;      // Separate index  
  private relationStore: GraphStore;       // Another index
  private vectorStore: VectorStore;        // Yet another index
  // Result: 4 separate indexes that can't coordinate!
}
```

## 🏗️ Coordination Patterns by Use Case

### 📊 **Pattern 1: Simple Data (Facts, Logs, Metrics)**
- **Use**: Single unified database only
- **Indexing**: All access patterns in coordinated SQL indexes
- **Example**: Fact system, audit logs, performance metrics

```typescript
// Facts only need unified database
private factDatabase: DatabaseConnection;
private async persistFact(fact: Fact) {
  // Single insert, all indexes automatically maintained
  await this.factDatabase.execute(`
    INSERT INTO facts (id, type, content, confidence, tags)
    VALUES (?, ?, ?, ?, ?)
  `, [fact.id, fact.type, fact.content, fact.confidence, JSON.stringify(fact.tags)]);
}
```

### 🧠 **Pattern 2: Knowledge/Content with RAG (Semantic Search)**
- **Use**: Unified database + specialized vector RAG 
- **Indexing**: SQL for metadata, Vector for similarity
- **Namespacing**: Use `service:type:id` for vector organization

```typescript
// Knowledge needs unified DB + vector RAG
private knowledgeDatabase: DatabaseConnection; // Primary storage
private vectorRAG: VectorStore; // RAG/similarity only

private async persistKnowledge(item: KnowledgeItem) {
  // 1. Unified database (primary)
  await this.knowledgeDatabase.execute(`INSERT INTO knowledge_items ...`);
  
  // 2. Vector RAG with namespacing
  const ragId = `knowledge:${item.type}:${item.id}`;
  await this.vectorRAG.insert(ragId, embedding, {
    ragNamespace: `knowledge:${item.type}`,
    originalId: item.id,
    // Metadata for retrieval context
  });
}
```

### 📈 **Pattern 3: Complex Relationships (Social, Workflows)**
- **Use**: Unified database + graph store for relationships
- **Indexing**: SQL for entities, Graph for relationships

## 🚫 What NOT to Create

### Multiple KeyValue Stores
```typescript
// ❌ DON'T DO THIS
private metadataStore: KeyValueStore;  // Fragmented
private searchStore: KeyValueStore;    // Fragmented  
private cacheStore: KeyValueStore;     // Fragmented

// ✅ DO THIS INSTEAD
private unifiedDatabase: DatabaseConnection; // Coordinated
// Add columns for metadata, search, cache in same table
```

### Multiple Vector Stores
```typescript
// ❌ DON'T DO THIS
private contentVectors: VectorStore;     // Fragmented
private metadataVectors: VectorStore;    // Fragmented
private relationVectors: VectorStore;    // Fragmented

// ✅ DO THIS INSTEAD  
private vectorRAG: VectorStore; // Single store with namespacing
// Use ragNamespace: 'content:type', 'metadata:type' etc.
```

## 🛠️ Foundation Database Access

### Get Unified Database
```typescript
import { getDatabaseAccess } from '@claude-zen/foundation';

const dbAccess = getDatabaseAccess();
const dbResult = await dbAccess.connect({
  type: 'sqlite',
  path: ':memory:' // or persistent path
});

if (dbResult.isOk()) {
  this.unifiedDatabase = dbResult.value;
  await this.createCoordinatedSchema();
}
```

### Get Specialized Stores (Only When Needed)
```typescript
import { createVectorStore } from '@claude-zen/foundation';

// ONLY create vector store if you need semantic similarity/RAG
if (this.needsSemanticSearch) {
  const vectorResult = await createVectorStore();
  if (vectorResult.isOk()) {
    this.vectorRAG = vectorResult.value;
  }
}
```

## 🔍 Cross-Service Search Coordination

### Unified Search Interface
Services should expose standardized search interfaces:

```typescript
interface UnifiedSearchResult {
  id: string;
  type: string;
  content: string;
  confidence: number;
  source: string; // Which service/table
  metadata: Record<string, unknown>;
}

// Each service implements
async searchUnified(query: string): Promise<UnifiedSearchResult[]> {
  // Search your unified database
  // Return standardized results
}
```

### Cross-Service Search Coordinator
```typescript
class SearchCoordinator {
  async searchAcrossServices(query: string): Promise<UnifiedSearchResult[]> {
    const results = await Promise.all([
      knowledgeService.searchUnified(query),
      factService.searchUnified(query), 
      // Other services...
    ]);
    
    return this.mergeAndRankResults(results.flat());
  }
}
```

## 📋 Checklist Before Creating Databases

Before creating ANY database stores, ask:

- [ ] **Do I really need multiple databases?** (Usually NO)
- [ ] **Can I use a unified database with coordinated indexes?** (Usually YES)
- [ ] **Do I need semantic similarity search?** (Only then add vector store)
- [ ] **Am I using proper namespacing in vector stores?** (`service:type:id`)
- [ ] **Will other services need to search my data?** (Use unified search interface)
- [ ] **Have I documented my indexing strategy?** (For maintenance)

## 🎯 Summary

**The Goal**: Each service has **ONE primary database** with **coordinated indexes**, plus **specialized stores only when absolutely necessary** (RAG, complex relationships).

**The Result**: 
- ✅ **Fast queries** - Coordinated indexes in single database
- ✅ **Cross-service search** - Standardized interfaces
- ✅ **No fragmentation** - Single source of truth per service
- ✅ **Maintainable** - Clear database responsibilities

**Services should have**: `UnifiedDB + (VectorRAG if needed)` **not** `4 separate fragmented stores`