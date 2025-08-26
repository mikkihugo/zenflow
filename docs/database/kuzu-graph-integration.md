# Kuzu Graph Database Integration Guide

## Overview

The Kuzu graph database adapter is now fully integrated into Claude Code Zen, providing powerful graph database capabilities with high-performance Cypher-like queries, graph algorithms, and comprehensive analytics.

## Features

### ✅ Core Capabilities

- **Graph Queries**: Execute Cypher-like queries for complex graph traversals
- **Node Management**: Create, read, update, and delete graph nodes
- **Relationship Management**: Manage relationships between nodes with properties
- **Graph Analytics**: Built-in graph statistics and performance metrics
- **Batch Operations**: Execute multiple graph operations efficiently
- **Auto-Detection**: Automatic routing of Cypher queries in regular endpoints
- **Schema Introspection**: Comprehensive graph schema information

### ✅ REST API Endpoints

#### Graph-Specific Endpoints

```http
POST /api/database/graph/query       # Execute Cypher queries
GET  /api/database/graph/schema      # Get graph schema information
GET  /api/database/graph/stats       # Get graph analytics
POST /api/database/graph/batch       # Batch graph operations
```

#### Standard Endpoints (with Cypher support)

```http
POST /api/database/query             # Auto-detects and routes Cypher queries
POST /api/database/execute           # Standard SQL/DDL operations
GET  /api/database/status            # Database health and status
GET  /api/database/analytics         # General database analytics
```

## Configuration

### Basic Configuration

```typescript
const kuzuConfig: DatabaseConfig = {
  type: 'kuzu',
  database: './data/graph.kuzu',
  options: {
    bufferPoolSize: '1GB',
    maxNumThreads: 4,
  },
};
```

### Environment-Specific Configurations

#### Development

```typescript
{
  type: 'kuzu',
  database: './data/dev-graph.kuzu',
  options: {
    bufferPoolSize: '512MB',
    maxNumThreads: 2
  }
}
```

#### Production

```typescript
{
  type: 'kuzu',
  database: './data/prod-graph.kuzu',
  options: {
    bufferPoolSize: '4GB',
    maxNumThreads: 8
  }
}
```

#### Testing

```typescript
{
  type: 'kuzu',
  database: ':memory:',
  options: {
    bufferPoolSize: '256MB',
    maxNumThreads: 1
  }
}
```

## Usage Examples

### 1. Basic Graph Operations

#### Creating Nodes and Relationships

```typescript
import { DatabaseController } from '../database/controllers/database-controller';

const controller = new DatabaseController(factory, kuzuConfig, logger);

// Create nodes
await controller.executeGraphQuery({
  cypher: 'CREATE (alice:Person {name: "Alice", age: 30, role: "Developer"})',
  params: [],
});

await controller.executeGraphQuery({
  cypher:
    'CREATE (company:Organization {name: "TechCorp", type: "Technology"})',
  params: [],
});

// Create relationship
await controller.executeGraphQuery({
  cypher:
    'MATCH (p:Person {name: "Alice"}), (o:Organization {name: "TechCorp"}) CREATE (p)-[:WORKS_FOR {since: "2022"}]->(o)',
  params: [],
});
```

#### Querying the Graph

```typescript
// Find all person-organization relationships
const result = await controller.executeGraphQuery({
  cypher: 'MATCH (p:Person)-[r:WORKS_FOR]->(o:Organization) RETURN p, r, o',
  params: [],
});

console.log(
  `Found ${result.data.nodeCount} nodes and ${result.data.relationshipCount} relationships`
);
```

### 2. Advanced Graph Queries

#### Graph Traversal

```typescript
// Find all connections within 2 degrees
await controller.executeGraphQuery({
  cypher:
    'MATCH (start:Person {name: $name})-[*1..2]-(connected) RETURN DISTINCT connected',
  params: ['Alice'],
});

// Find shortest path between nodes
await controller.executeGraphQuery({
  cypher:
    'MATCH path = shortestPath((a:Person {name: $from})-[*]-(b:Person {name: $to})) RETURN path',
  params: ['Alice', 'Bob'],
});
```

#### Aggregation and Analytics

```typescript
// Count connections per person
await controller.executeGraphQuery({
  cypher:
    'MATCH (p:Person)-[r]-(connected) RETURN p.name, count(r) as connections ORDER BY connections DESC',
  params: [],
});

// Find most connected organizations
await controller.executeGraphQuery({
  cypher:
    'MATCH (o:Organization)<-[r]-(p:Person) RETURN o.name, count(p) as employee_count ORDER BY employee_count DESC',
  params: [],
});
```

### 3. Batch Operations

```typescript
const batchResult = await controller.executeGraphBatch({
  operations: [
    {
      cypher: 'CREATE (bob:Person {name: "Bob", age: 28, role: "Designer"})',
      params: [],
    },
    {
      cypher:
        'CREATE (charlie:Person {name: "Charlie", age: 35, role: "Manager"})',
      params: [],
    },
    {
      cypher:
        'MATCH (p:Person {name: "Bob"}), (o:Organization {name: "TechCorp"}) CREATE (p)-[:WORKS_FOR {since: "2023"}]->(o)',
      params: [],
    },
  ],
  continueOnError: false,
  includeData: true,
});
```

### 4. Graph Analytics

#### Schema Information

```typescript
const schema = await controller.getGraphSchema();
console.log(`Node types: ${schema.data.graphStatistics.nodeTypes.join(', ')}`);
console.log(
  `Relationship types: ${schema.data.graphStatistics.relationshipTypes.join(', ')}`
);
```

#### Performance Analytics

```typescript
const analytics = await controller.getGraphAnalytics();
const stats = analytics.data.graphStatistics;

console.log(`Graph density: ${stats.graphDensity}`);
console.log(`Average connections: ${stats.averageConnections}`);
console.log(`Connected nodes: ${stats.connectivity.nodesWithConnections}`);
```

### 5. Automatic Cypher Detection

The system automatically detects Cypher queries in standard endpoints:

```typescript
// This will be automatically routed to the graph adapter
const result = await controller.executeQuery({
  sql: 'MATCH (n:Person) RETURN n.name, n.age ORDER BY n.age DESC',
  params: [],
});
```

## Use Cases

### 1. Social Networks

```cypher
-- Create social connections
CREATE (alice:Person {name: "Alice", age: 30})
CREATE (bob:Person {name: "Bob", age: 25})
MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"})
CREATE (a)-[:FRIENDS {since: "2020"}]->(b)

-- Find mutual friends
MATCH (a:Person {name: "Alice"})-[:FRIENDS]-(mutual)-[:FRIENDS]-(b:Person {name: "Bob"})
RETURN mutual.name
```

### 2. Knowledge Graphs

```cypher
-- Create concept hierarchy
CREATE (ai:Concept {name: "Artificial Intelligence", type: "Technology"})
CREATE (ml:Concept {name: "Machine Learning", type: "Technology"})
MATCH (ai:Concept {name: "Artificial Intelligence"}), (ml:Concept {name: "Machine Learning"})
CREATE (ai)-[:INCLUDES]->(ml)

-- Find related concepts
MATCH (concept:Concept)-[:INCLUDES*]-(related:Concept)
RETURN concept.name, related.name
```

### 3. Dependency Analysis

```cypher
-- Create software dependencies
CREATE (api:Module {name: "API", version: "1.5"})
CREATE (auth:Module {name: "Authentication", version: "1.0"})
MATCH (api:Module {name: "API"}), (auth:Module {name: "Authentication"})
CREATE (api)-[:DEPENDS_ON]->(auth)

-- Find dependency chain
MATCH (m:Module)-[:DEPENDS_ON*]-(dep:Module)
RETURN m.name, dep.name
```

### 4. Organizational Charts

```cypher
-- Create organizational hierarchy
CREATE (ceo:Employee {name: "CEO", level: "Executive"})
CREATE (cto:Employee {name: "CTO", level: "Executive"})
MATCH (ceo:Employee {name: "CEO"}), (cto:Employee {name: "CTO"})
CREATE (cto)-[:REPORTS_TO]->(ceo)

-- Find reporting chain
MATCH (e:Employee)-[:REPORTS_TO*]-(manager:Employee)
RETURN e.name, manager.name
```

## Integration Status

✅ **Completed Features**

- [x] KuzuAdapter implementation and integration
- [x] Graph-specific REST API endpoints
- [x] Cypher query detection and routing
- [x] Graph schema introspection
- [x] Graph analytics and statistics
- [x] Batch graph operations
- [x] Comprehensive test coverage
- [x] Documentation and examples

🎯 **Ready for Production**
The Kuzu graph database integration is complete and ready for production use with all features fully implemented and tested.
