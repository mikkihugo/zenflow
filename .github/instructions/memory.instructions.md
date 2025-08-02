---
applies_to: "src/memory/**/*"
---

# Memory Management System Development Instructions

## Domain Focus
The memory domain handles persistent storage, caching, multi-backend memory systems, and data retrieval optimization. This provides the foundation for all persistent state in claude-code-zen.

## Key Subdirectories
```
src/memory/
├── backends/        # Storage backend implementations
│   ├── sqlite.backend.ts    # SQLite backend
│   ├── lancedb.backend.ts   # LanceDB vector backend
│   └── json.backend.ts      # JSON file backend
├── stores/          # Memory store implementations
├── patterns/        # Memory patterns and optimization
└── config/          # Memory configuration management
```

## Architecture Patterns

### Multi-Backend Strategy
- **SQLite backend** for structured data and agent state
- **LanceDB backend** for vector embeddings and similarity search
- **JSON backend** for simple key-value storage and configuration
- **Backend abstraction** for seamless switching and fallbacks

### Memory Store Patterns
- **Pooled connections** for database efficiency
- **Caching layers** for frequently accessed data
- **Async/await patterns** for all memory operations
- **Transaction support** for data consistency

## Testing Strategy - Hybrid Approach
Use Classical TDD for memory systems - test actual storage and retrieval:

```typescript
// Example: Test actual memory operations
describe('MemoryStore', () => {
  it('should persist and retrieve agent state correctly', async () => {
    const store = new AgentMemoryStore(testConfig);
    const agentState = createTestAgentState();
    
    await store.save('agent-123', agentState);
    const retrieved = await store.get('agent-123');
    
    expect(retrieved).toEqual(agentState);
    expect(retrieved.lastUpdated).toBeInstanceOf(Date);
  });
  
  it('should handle concurrent access safely', async () => {
    const store = new ConcurrentMemoryStore(testConfig);
    const operations = Array(100).fill(0).map((_, i) => 
      store.save(`key-${i}`, { value: i })
    );
    
    await Promise.all(operations);
    const results = await Promise.all(
      operations.map((_, i) => store.get(`key-${i}`))
    );
    
    results.forEach((result, i) => {
      expect(result.value).toBe(i);
    });
  });
});
```

## Performance Requirements

### Storage Performance
- **<10ms average latency** for memory operations
- **Concurrent access support** for multiple agents
- **Connection pooling** to optimize database connections
- **Caching strategies** for frequently accessed data

### Data Consistency
- **ACID compliance** for critical agent state
- **Transaction support** for complex operations
- **Backup and recovery** mechanisms
- **Data validation** and integrity checks

### Scalability Targets
- **10,000+ concurrent memory operations** per second
- **1M+ agent states** storage capacity
- **Vector similarity search** for large embedding datasets
- **Efficient memory usage** and garbage collection

## Backend-Specific Patterns

### SQLite Backend
```typescript
// SQLite operations pattern
export class SQLiteBackend implements MemoryBackend {
  async save(key: string, data: unknown): Promise<void> {
    const db = await this.getConnection();
    await db.run(
      'INSERT OR REPLACE INTO memory (key, data, updated_at) VALUES (?, ?, ?)',
      [key, JSON.stringify(data), new Date().toISOString()]
    );
  }
  
  async get(key: string): Promise<unknown | null> {
    const db = await this.getConnection();
    const row = await db.get('SELECT data FROM memory WHERE key = ?', [key]);
    return row ? JSON.parse(row.data) : null;
  }
}
```

### LanceDB Vector Backend
```typescript
// Vector operations pattern
export class LanceDBBackend implements VectorBackend {
  async storeEmbedding(id: string, embedding: number[], metadata: object): Promise<void> {
    await this.table.add([{
      id,
      vector: embedding,
      metadata: JSON.stringify(metadata),
      created_at: new Date().toISOString()
    }]);
  }
  
  async similaritySearch(query: number[], limit: number = 10): Promise<SimilarityResult[]> {
    const results = await this.table
      .search(query)
      .limit(limit)
      .toArray();
    
    return results.map(row => ({
      id: row.id,
      score: row._distance,
      metadata: JSON.parse(row.metadata)
    }));
  }
}
```

### JSON File Backend
```typescript
// Simple file-based storage
export class JSONBackend implements MemoryBackend {
  async save(key: string, data: unknown): Promise<void> {
    const filePath = this.getFilePath(key);
    await fs.writeFile(filePath, JSON.stringify({
      data,
      updated_at: new Date().toISOString()
    }), 'utf8');
  }
  
  async get(key: string): Promise<unknown | null> {
    try {
      const filePath = this.getFilePath(key);
      const content = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(content);
      return parsed.data;
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }
}
```

## Memory Patterns

### Agent State Management
```typescript
// Agent memory patterns
export class AgentMemoryManager {
  async persistAgentState(agentId: string, state: AgentState): Promise<void> {
    // Validate state before persistence
    const validatedState = this.validateAgentState(state);
    
    // Use appropriate backend based on data type
    const backend = this.selectBackend(state);
    await backend.save(`agent:${agentId}`, validatedState);
    
    // Update cache for quick access
    this.cache.set(`agent:${agentId}`, validatedState);
  }
  
  async getAgentState(agentId: string): Promise<AgentState | null> {
    // Check cache first
    const cached = this.cache.get(`agent:${agentId}`);
    if (cached) return cached;
    
    // Fallback to persistent storage
    const state = await this.backend.get(`agent:${agentId}`);
    if (state) {
      this.cache.set(`agent:${agentId}`, state);
    }
    return state;
  }
}
```

### Coordination Memory
```typescript
// Swarm coordination memory
export class SwarmMemoryManager {
  async storeCoordinationDecision(
    swarmId: string, 
    decision: CoordinationDecision
  ): Promise<void> {
    // Store decision with timestamp and context
    const record = {
      ...decision,
      timestamp: new Date(),
      swarmId
    };
    
    await this.backend.save(`coordination:${swarmId}:${decision.id}`, record);
  }
  
  async getCoordinationHistory(swarmId: string): Promise<CoordinationDecision[]> {
    // Retrieve all coordination decisions for swarm
    const pattern = `coordination:${swarmId}:*`;
    const decisions = await this.backend.getByPattern(pattern);
    
    return decisions
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-100); // Keep recent 100 decisions
  }
}
```

## Integration Points

### With Coordination Domain
- **Agent state persistence** for coordination decisions
- **Swarm memory** for collective intelligence
- **Task history** and execution context
- **Performance metrics** storage and retrieval

### With Neural Domain
- **Model checkpoints** and training state
- **Neural pattern storage** for learned behaviors
- **WASM state** persistence across sessions
- **Training data** and embedding storage

### With Interfaces Domain
- **Session state** for user interactions
- **Configuration persistence** for interface settings
- **Cache management** for API responses
- **User preferences** and personalization

## Quality Standards

### Data Integrity
- **Validation** of all stored data
- **Backup strategies** for critical data
- **Recovery procedures** for data corruption
- **Audit trails** for important state changes

### Performance Optimization
- **Connection pooling** for database efficiency
- **Query optimization** for complex retrievals
- **Caching strategies** for hot data
- **Memory usage monitoring** and optimization

### Concurrency Safety
- **Thread-safe operations** for concurrent access
- **Lock-free algorithms** where possible
- **Transaction isolation** for critical operations
- **Deadlock prevention** and detection

## Common Memory Patterns

### Caching Strategy
```typescript
// Multi-layer caching
export class MemoryCacheManager {
  private l1Cache = new Map(); // In-memory cache
  private l2Cache: RedisClient; // Distributed cache
  private l3Storage: MemoryBackend; // Persistent storage
  
  async get(key: string): Promise<unknown | null> {
    // L1: Check in-memory cache
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // L2: Check distributed cache
    const l2Result = await this.l2Cache.get(key);
    if (l2Result) {
      this.l1Cache.set(key, l2Result);
      return l2Result;
    }
    
    // L3: Check persistent storage
    const l3Result = await this.l3Storage.get(key);
    if (l3Result) {
      this.l1Cache.set(key, l3Result);
      await this.l2Cache.set(key, l3Result, { ttl: 3600 });
      return l3Result;
    }
    
    return null;
  }
}
```

## Common Anti-Patterns to Avoid
- **Don't bypass validation** - always validate data before storage
- **Don't ignore transactions** - use transactions for multi-step operations
- **Don't leak connections** - properly close database connections
- **Don't store sensitive data unencrypted** - encrypt sensitive information
- **Don't ignore performance** - monitor and optimize memory operations

## Monitoring and Debugging
- **Performance metrics** for all memory operations
- **Connection pool monitoring** and optimization
- **Cache hit/miss ratios** and efficiency analysis
- **Storage usage** and capacity planning
- **Error rate monitoring** and alerting

The memory domain is critical for system reliability and performance. Maintain data integrity and optimize for the high-throughput coordination requirements of claude-code-zen.