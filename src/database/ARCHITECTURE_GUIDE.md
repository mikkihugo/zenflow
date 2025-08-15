# Database Architecture Guide

## 🏗️ **Understanding the Database Layer Architecture**

The claude-code-zen database system uses a **3-layer architecture** with embedded DSL capabilities:

```
📱 Application Code
       ↓
🏛️ DAO Layer (Data Access Objects + Embedded DSL)
       ↓  
🔌 Database Adapters (Connection Management + SQL Execution)
       ↓
💾 Raw Drivers (better-sqlite3, LanceDB, Kuzu)
```

## 📚 **Layer Responsibilities**

### **1. DAO Layer** (`src/database/dao/`)
- **Entity Mapping**: TypeScript objects ↔ database rows
- **Embedded Query DSL**: Type-safe query building (`buildFindByQuery`, `buildWhereClause`, etc.)
- **Business Logic**: Validation, caching, relationships
- **SQL Injection Protection**: Parameterized queries

### **2. Database Adapters** (`src/database/adapters/`)  
- **Connection Management**: Pool handling, reconnection logic
- **Raw SQL Execution**: Direct database operations
- **Multi-Database Support**: SQLite, PostgreSQL, Kuzu, LanceDB
- **Transaction Management**: ACID compliance

### **3. Raw Drivers**
- **better-sqlite3**: High-performance synchronous SQLite
- **LanceDB**: Vector similarity search
- **Kuzu**: Graph database operations

## 🎯 **When to Use Each Layer**

### **✅ Use DAO Layer** - Most Application Code
```typescript
// For business logic, entity operations, type safety
const userDao = new UserDao(sqliteAdapter, logger);
const activeUsers = await userDao.findBy({ status: 'active' }, { 
  sort: [{ field: 'createdAt', direction: 'desc' }], 
  limit: 10 
});
```

### **✅ Use Adapters Directly** - Infrastructure Code
```typescript
// For raw queries, database management, migrations
const result = await sqliteAdapter.query(
  'SELECT COUNT(*) FROM users WHERE created_at > ?', 
  [startDate]
);
```

### **✅ Use Raw Drivers** - Performance-Critical Paths
```typescript
// Core system components (memory-system, workflow-gates)
const db = new Database(dbPath);
db.prepare('INSERT INTO memory (key, value) VALUES (?, ?)').run(key, value);
```

## 🔧 **The Embedded DSL Pattern**

The DAO layer includes an **embedded Domain Specific Language** for query building:

### **Query DSL Methods:**
- `buildFindByQuery()` → `SELECT * FROM table WHERE ... ORDER BY ... LIMIT ...`
- `buildCreateQuery()` → `INSERT INTO table (...) VALUES (...)`
- `buildUpdateQuery()` → `UPDATE table SET ... WHERE id = ?`
- `buildWhereClause()` → `WHERE field1 = ? AND field2 = ?`
- `buildOrderClause()` → `ORDER BY field1 DESC, field2 ASC`
- `buildLimitClause()` → `LIMIT 10 OFFSET 20`

### **Example DSL Usage:**
```typescript
class UserDao extends BaseDao<User> {
  protected mapEntityToRow(user: Partial<User>) {
    return {
      first_name: user.firstName,  // camelCase → snake_case
      email: user.email,
      created_at: user.createdAt?.toISOString()
    };
  }
  
  protected mapRowToEntity(row: any): User {
    return {
      id: row.id,
      firstName: row.first_name,   // snake_case → camelCase  
      email: row.email,
      createdAt: new Date(row.created_at)
    };
  }
}

// DSL automatically generates:
// "SELECT * FROM users WHERE status = ? AND age > ? ORDER BY created_at DESC LIMIT 10"
// With params: ['active', 18]
```

## 🚀 **Complete Usage Examples**

### **Example 1: Relational Data DAO (SQLite/PostgreSQL)**
```typescript
import { BaseDao } from '../database/base.dao';
import { SqliteAdapter } from '../database/adapters/sqlite-adapter';

interface User {
  id: string;
  firstName: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

class UserDao extends BaseDao<User> {
  constructor(adapter: SqliteAdapter, logger: ILogger) {
    super(adapter, logger, 'users');
  }
  
  protected mapEntityToRow(user: Partial<User>) {
    return {
      first_name: user.firstName,
      email: user.email, 
      status: user.status,
      created_at: user.createdAt?.toISOString()
    };
  }
  
  protected mapRowToEntity(row: any): User {
    return {
      id: row.id,
      firstName: row.first_name,
      email: row.email,
      status: row.status as 'active' | 'inactive',
      createdAt: new Date(row.created_at)
    };
  }
  
  // Custom business logic
  async findActiveUsers(limit = 50): Promise<User[]> {
    return this.findBy({ status: 'active' }, { 
      sort: [{ field: 'created_at', direction: 'desc' }],
      limit 
    });
  }
  
  async getUserStats(): Promise<{ active: number; inactive: number }> {
    const activeCount = await this.count({ status: 'active' });
    const inactiveCount = await this.count({ status: 'inactive' });
    return { active: activeCount, inactive: inactiveCount };
  }
}
```

### **Example 2: Vector Database DAO (LanceDB)**
```typescript
import { VectorDao } from '../database/dao/vector.dao';
import { LanceDBAdapter } from '../database/adapters/lancedb-adapter';

interface EmbeddedDocument {
  id: string;
  content: string;
  vector: number[];
  metadata: { source: string; timestamp: Date };
}

class DocumentEmbeddingDao extends VectorDao<EmbeddedDocument> {
  constructor(adapter: LanceDBAdapter, logger: ILogger) {
    super(adapter, logger, 'document_embeddings');
  }
  
  // Business logic for document similarity
  async findSimilarDocuments(queryText: string, limit = 10): Promise<EmbeddedDocument[]> {
    // Get embedding for query text (external embedding service)
    const queryVector = await this.getTextEmbedding(queryText);
    
    const results = await this.similaritySearch(queryVector, { 
      limit,
      threshold: 0.7 // Similarity threshold
    });
    
    return results.map(result => result.document);
  }
  
  async addDocumentBatch(documents: EmbeddedDocument[]): Promise<void> {
    const vectorDocs = documents.map(doc => ({
      id: doc.id,
      vector: doc.vector,
      metadata: {
        content: doc.content,
        source: doc.metadata.source,
        timestamp: doc.metadata.timestamp.toISOString()
      }
    }));
    
    await this.addVectors(vectorDocs);
  }
  
  private async getTextEmbedding(text: string): Promise<number[]> {
    // Integration with embedding service (OpenAI, etc.)
    // This would be implemented based on your embedding provider
    return new Array(384).fill(0); // Placeholder
  }
}
```

### **Example 3: Graph Database DAO (Kuzu)**
```typescript
import { GraphDao } from '../database/dao/graph.dao';
import { KuzuAdapter } from '../database/adapters/kuzu-adapter';

interface User {
  id: string;
  name: string;
  email: string;
  followerCount: number;
}

class UserGraphDao extends GraphDao<User> {
  constructor(adapter: KuzuAdapter, logger: ILogger) {
    super(adapter, logger, 'User');
  }
  
  // Business logic for user relationships and connections
  async findInfluencers(minFollowers = 1000): Promise<User[]> {
    const result = await this.executeCypher(`
      MATCH (u:User)
      WHERE u.followerCount > $minFollowers
      RETURN u
      ORDER BY u.followerCount DESC
      LIMIT 50
    `, { minFollowers });
    
    return result.nodes.map(node => node.properties as User);
  }
  
  async getSocialNetwork(userId: string, depth = 2): Promise<{
    connections: User[];
    relationships: Array<{ from: string; to: string; type: string }>;
  }> {
    const traversal = await this.traverse(userId, 'FOLLOWS', depth);
    
    return {
      connections: traversal.nodes.map(node => node.properties as User),
      relationships: traversal.relationships.map(rel => ({
        from: rel.from,
        to: rel.to,
        type: rel.type
      }))
    };
  }
  
  async createFriendship(fromUserId: string, toUserId: string): Promise<void> {
    await this.createRelationship(fromUserId, toUserId, 'FRIENDS', {
      createdAt: new Date().toISOString(),
      status: 'active'
    });
  }
  
  async findMutualConnections(userId1: string, userId2: string): Promise<User[]> {
    const result = await this.executeCypher(`
      MATCH (u1:User {id: $userId1})-[:FOLLOWS]->(mutual:User)<-[:FOLLOWS]-(u2:User {id: $userId2})
      RETURN DISTINCT mutual
    `, { userId1, userId2 });
    
    return result.nodes.map(node => node.properties as User);
  }
}

### **Example 4: Multi-Database Setup**
```typescript
// Setup different adapters for different use cases
const sqliteAdapter = new SqliteAdapter({ 
  type: 'sqlite', 
  database: './app.db' 
});

const lancedbAdapter = new LanceDBAdapter({
  type: 'lancedb',
  database: './vectors.lance'
});

const kuzuAdapter = new KuzuAdapter({
  type: 'kuzu',
  database: './graph.kuzu'
});

// Use appropriate DAO for each data type
const userDao = new UserDao(sqliteAdapter, logger);           // Relational data in SQLite
const embeddingDao = new DocumentEmbeddingDao(lancedbAdapter, logger);  // Vectors in LanceDB  
const userGraphDao = new UserGraphDao(kuzuAdapter, logger);  // Graph relationships in Kuzu
```

### **Example 5: Advanced Multi-Database Queries**
```typescript
class OrderAnalyticsDao extends BaseDao<Order> {
  constructor(
    private relationalAdapter: SqliteAdapter,
    private vectorAdapter: LanceDBAdapter,
    private graphAdapter: KuzuAdapter,
    logger: ILogger
  ) {
    super(relationalAdapter, logger, 'orders');
  }

  async findOrdersWithRecommendations(userId: string): Promise<{
    orders: Order[];
    recommendations: Product[];
    connectedUsers: User[];
  }> {
    // 1. Get recent orders (relational data)
    const orders = await this.findBy({ user_id: userId }, {
      sort: [{ field: 'created_at', direction: 'desc' }],
      limit: 10
    });

    // 2. Get product recommendations (vector similarity)
    const embeddingDao = new DocumentEmbeddingDao(this.vectorAdapter, this.logger);
    const orderProducts = orders.flatMap(order => order.products);
    const recommendations = await embeddingDao.findSimilarDocuments(
      orderProducts.join(' '), 5
    );

    // 3. Get user connections (graph traversal)
    const userGraphDao = new UserGraphDao(this.graphAdapter, this.logger);
    const userNetwork = await userGraphDao.getSocialNetwork(userId, 2);
    
    return {
      orders,
      recommendations: recommendations as Product[],
      connectedUsers: userNetwork.connections
    };
  }
}
```

## 🎯 **Best Practices**

### **✅ DO:**
1. **Use DAO for business logic** - Entity operations, validation, relationships
2. **Use adapters for infrastructure** - Migrations, health checks, raw queries
3. **Use raw drivers for performance** - Memory systems, high-frequency operations  
4. **Implement proper entity mapping** - Handle field name conversion, type safety
5. **Leverage the embedded DSL** - Type-safe queries with parameterization

### **❌ DON'T:**
1. **Mix abstraction levels** - Don't use raw SQL in DAO business methods
2. **Bypass parameter binding** - Always use parameterized queries
3. **Ignore entity mapping** - Map between camelCase/snake_case consistently
4. **Create DAOs for everything** - Simple operations can use adapters directly
5. **Over-engineer the DSL** - Keep query building simple and predictable

## 🔄 **Migration Path**

If you're working with existing code that bypasses the architecture:

### **Step 1: Identify Current Usage**
```bash
# Find direct SQLite usage
grep -r "new Database\|\.prepare\|\.exec" src/ --include="*.ts"

# Find adapter usage  
grep -r "adapter\.query\|adapter\.execute" src/ --include="*.ts"
```

### **Step 2: Choose Appropriate Layer**
- **Business logic** → Create/use DAO
- **Infrastructure** → Use adapters  
- **Performance critical** → Keep raw drivers

### **Step 3: Gradual Migration**
```typescript
// BEFORE: Direct SQLite usage in business logic
const db = new Database(dbPath);
const users = db.prepare('SELECT * FROM users WHERE status = ?').all('active');

// AFTER: Use DAO with embedded DSL
const userDao = new UserDao(sqliteAdapter, logger);
const users = await userDao.findBy({ status: 'active' });
```

## 📈 **Performance Characteristics**

| Layer | Query Speed | Type Safety | SQL Injection Protection | Maintainability |
|-------|-------------|-------------|-------------------------|-----------------|
| **DAO + DSL** | Good | Excellent | Excellent | Excellent |
| **Adapters** | Very Good | Good | Good | Good |  
| **Raw Drivers** | Excellent | Poor | Manual | Poor |

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Entity mapping errors** - Check `mapEntityToRow` and `mapRowToEntity` implementations
2. **Query parameter mismatches** - Verify DSL parameter binding  
3. **Performance issues** - Consider bypassing DAO for high-frequency operations
4. **Type errors** - Ensure entity interfaces match database schema

### **Debugging DSL Queries:**
```typescript
// Enable debug logging to see generated SQL
const userDao = new UserDao(adapter, debugLogger);
const users = await userDao.findBy({ status: 'active' });
// Logs: "SELECT * FROM users WHERE status = ?" with params: ['active']
```

---

**The embedded DAO+DSL pattern provides the best balance of type safety, maintainability, and performance for most use cases while allowing performance-critical paths to bypass abstraction when needed.** 🚀