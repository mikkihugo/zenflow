---
applies_to: 'packages/core/database/**/*'
---

# Database System Development Instructions

## Domain Focus

The database domain handles persistent data storage, database adapters, connection management, and data modeling. This provides the foundation for all structured data persistence in claude-code-zen across multiple database technologies.

## Key Subdirectories

```
packages/core/database/
├── src/
│   ├── adapters/          # Database adapter implementations
│   │   ├── sqlite-adapter.ts    # SQLite adapter
│   │   ├── lancedb-adapter.ts   # LanceDB vector adapter
│   │   └── kuzu-adapter.ts      # Kuzu graph adapter
│   ├── controllers/       # Database controllers and orchestration
│   ├── types/            # Database types and interfaces
│   └── logger.ts         # Database-specific logging
└── docs/                 # Database documentation
```

## Architecture Patterns

### Multi-Adapter Strategy

- **SQLite adapter** for structured relational data and agent state
- **LanceDB adapter** for vector embeddings and similarity search
- **Kuzu adapter** for graph data and complex relationship modeling
- **Adapter abstraction** for seamless database switching and fallbacks

### Database Operations

- **Connection pooling** for efficient database resource management
- **Transaction support** for data consistency across operations
- **Schema management** and migration support
- **Health monitoring** and performance metrics

## Testing Strategy - Classical TDD (Detroit)

Use Classical TDD for database code - test actual database operations:

```typescript
// Example: Test actual database operations
describe('KuzuAdapter', () => {
  it('should execute graph queries correctly', async () => {
    const adapter = new KuzuAdapter(testConfig);
    await adapter.connect();

    // Create test nodes and relationships
    await adapter.query(`
      CREATE (a:Agent {name: 'TestAgent', type: 'worker'})
      CREATE (b:Task {name: 'TestTask', status: 'pending'})
      CREATE (a)-[:ASSIGNED_TO]->(b)
    `);

    // Query the graph
    const result = await adapter.query(`
      MATCH (a:Agent)-[:ASSIGNED_TO]->(t:Task)
      WHERE a.name = 'TestAgent'
      RETURN a.name, t.name, t.status
    `);

    expect(result.records).toHaveLength(1);
    expect(result.records[0]).toEqual({
      'a.name': 'TestAgent',
      't.name': 'TestTask',
      't.status': 'pending'
    });
  });

  it('should handle connection failures gracefully', async () => {
    const adapter = new KuzuAdapter({ database: '/invalid/path' });
    
    await expect(adapter.connect()).rejects.toThrow(ConnectionError);
  });
});
```

## Performance Requirements

### Database Performance

- **<10ms query latency** for simple operations
- **Connection pooling** for concurrent access optimization
- **Query optimization** for complex graph traversals
- **Batch operations** for high-throughput scenarios

### Data Consistency

- **ACID compliance** for critical data operations
- **Transaction isolation** for complex multi-step operations
- **Backup and recovery** mechanisms
- **Data validation** and integrity constraints

### Scalability Targets

- **10,000+ concurrent connections** support
- **1M+ graph nodes** storage capacity
- **Complex graph queries** with sub-second response times
- **Vector similarity search** for large embedding datasets

## Adapter-Specific Patterns

### SQLite Adapter

```typescript
// SQLite operations pattern
export class SQLiteAdapter implements DatabaseAdapter {
  async query(sql: string, params: any[] = []): Promise<QueryResult> {
    const connection = await this.getConnection();
    try {
      const result = await connection.all(sql, params);
      return {
        records: result,
        rowCount: result.length,
        executionTime: performance.now() - startTime
      };
    } finally {
      this.releaseConnection(connection);
    }
  }

  async transaction<T>(operations: (conn: Connection) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    await connection.run('BEGIN TRANSACTION');
    try {
      const result = await operations(connection);
      await connection.run('COMMIT');
      return result;
    } catch (error) {
      await connection.run('ROLLBACK');
      throw error;
    } finally {
      this.releaseConnection(connection);
    }
  }
}
```

### Kuzu Graph Adapter

```typescript
// Kuzu graph operations pattern
export class KuzuAdapter implements DatabaseAdapter {
  async createNode(label: string, properties: object): Promise<string> {
    const propString = Object.entries(properties)
      .map(([key, value]) => `${key}: $${key}`)
      .join(', ');
    
    const query = `CREATE (n:${label} {${propString}}) RETURN n`;
    const result = await this.query(query, properties);
    return result.records[0].n.id;
  }

  async createRelationship(
    fromId: string,
    toId: string,
    type: string,
    properties: object = {}
  ): Promise<void> {
    const propString = Object.keys(properties).length > 0
      ? `{${Object.entries(properties).map(([k, v]) => `${k}: $${k}`).join(', ')}}`
      : '';
    
    const query = `
      MATCH (a) WHERE id(a) = $fromId
      MATCH (b) WHERE id(b) = $toId
      CREATE (a)-[:${type} ${propString}]->(b)
    `;
    
    await this.query(query, { fromId, toId, ...properties });
  }

  async graphAnalytics(): Promise<GraphStats> {
    const nodeCountResult = await this.query('MATCH (n) RETURN count(n) as nodeCount');
    const relationshipCountResult = await this.query('MATCH ()-[r]->() RETURN count(r) as relCount');
    
    return {
      nodeCount: nodeCountResult.records[0].nodeCount,
      relationshipCount: relationshipCountResult.records[0].relCount,
      timestamp: new Date()
    };
  }
}
```

### LanceDB Vector Adapter

```typescript
// LanceDB vector operations pattern
export class LanceDBAdapter implements VectorDatabaseAdapter {
  async storeEmbedding(
    id: string,
    vector: number[],
    metadata: object
  ): Promise<void> {
    await this.table.add([{
      id,
      vector,
      metadata: JSON.stringify(metadata),
      created_at: new Date().toISOString()
    }]);
  }

  async vectorSearch(
    queryVector: number[],
    limit: number = 10,
    filter?: object
  ): Promise<VectorSearchResult[]> {
    let query = this.table.search(queryVector).limit(limit);
    
    if (filter) {
      const filterString = Object.entries(filter)
        .map(([key, value]) => `metadata.${key} = '${value}'`)
        .join(' AND ');
      query = query.where(filterString);
    }
    
    const results = await query.toArray();
    return results.map(row => ({
      id: row.id,
      score: 1 - row._distance, // Convert distance to similarity
      metadata: JSON.parse(row.metadata)
    }));
  }
}
```

## Database Patterns

### Connection Management

```typescript
// Database connection management
export class DatabaseConnectionManager {
  private pools: Map<string, ConnectionPool> = new Map();

  async getConnection(adapterType: string): Promise<DatabaseConnection> {
    if (!this.pools.has(adapterType)) {
      this.pools.set(adapterType, this.createPool(adapterType));
    }
    
    const pool = this.pools.get(adapterType)!;
    return await pool.acquire();
  }

  async executeWithConnection<T>(
    adapterType: string,
    operation: (conn: DatabaseConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection(adapterType);
    try {
      return await operation(connection);
    } finally {
      await this.releaseConnection(adapterType, connection);
    }
  }
}
```

### Schema Management

```typescript
// Database schema management
export class SchemaManager {
  async applyMigrations(adapter: DatabaseAdapter): Promise<MigrationResult[]> {
    const appliedMigrations = await this.getAppliedMigrations(adapter);
    const pendingMigrations = this.getPendingMigrations(appliedMigrations);
    
    const results: MigrationResult[] = [];
    
    for (const migration of pendingMigrations) {
      try {
        await adapter.transaction(async (conn) => {
          await this.executeMigration(conn, migration);
          await this.recordMigration(conn, migration);
        });
        
        results.push({ migration: migration.id, status: 'success' });
      } catch (error) {
        results.push({ migration: migration.id, status: 'failed', error });
        break; // Stop on first failure
      }
    }
    
    return results;
  }
}
```

## Integration Points

### With Memory Domain

- **Caching layer** for frequently accessed database results
- **Connection sharing** between memory and database operations
- **Performance optimization** through intelligent caching strategies

### With Coordination Domain

- **Agent state persistence** in relational and graph formats
- **Swarm coordination history** storage and retrieval
- **Task distribution tracking** and analytics

### With Neural Domain

- **Model checkpoints** storage in appropriate database backends
- **Training data** persistence and retrieval
- **Neural network metadata** and performance tracking

### With Interfaces Domain

- **API data persistence** for user interactions
- **Configuration storage** for interface settings
- **Session management** and user preferences

## Quality Standards

### Data Integrity

- **Schema validation** for all data operations
- **Referential integrity** across database boundaries
- **Backup and recovery** procedures
- **Data encryption** for sensitive information

### Performance Optimization

- **Query optimization** and indexing strategies
- **Connection pooling** for resource efficiency
- **Batch operations** for high-throughput scenarios
- **Performance monitoring** and alerting

### Error Handling

- **Graceful degradation** for database failures
- **Retry mechanisms** for transient errors
- **Comprehensive logging** for debugging
- **Health checks** and monitoring

## Common Database Patterns

### Multi-Database Operations

```typescript
// Coordinate operations across multiple databases
export class MultiDatabaseCoordinator {
  async coordinatedSave(
    agentState: AgentState,
    relationships: Relationship[],
    embeddings: Embedding[]
  ): Promise<void> {
    // Save to SQLite for structured data
    await this.sqliteAdapter.transaction(async (conn) => {
      await this.saveAgentState(conn, agentState);
    });

    // Save to Kuzu for relationships
    await this.kuzuAdapter.transaction(async (conn) => {
      await this.saveRelationships(conn, agentState.id, relationships);
    });

    // Save to LanceDB for embeddings
    await this.lancedbAdapter.batchInsert(
      embeddings.map(emb => ({
        id: `${agentState.id}_${emb.type}`,
        vector: emb.vector,
        metadata: { agentId: agentState.id, type: emb.type }
      }))
    );
  }
}
```

## Common Anti-Patterns to Avoid

- **Don't bypass connection pooling** - always use managed connections
- **Don't ignore transactions** - use transactions for multi-step operations
- **Don't mix adapter concerns** - keep database-specific logic in adapters
- **Don't skip schema validation** - validate data before persistence
- **Don't ignore performance** - monitor and optimize database operations

## Monitoring and Debugging

- **Query performance metrics** for all database operations
- **Connection pool monitoring** and resource utilization
- **Error rate tracking** and alerting
- **Schema drift detection** and validation
- **Backup and recovery verification**

The database domain is critical for data integrity and system performance. Maintain high standards for data consistency and optimize for the multi-database coordination requirements of claude-code-zen.