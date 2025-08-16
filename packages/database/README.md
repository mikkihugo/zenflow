# @claude-zen/database

Multi-database abstraction layer with dependency injection support for TypeScript applications.

## Features

- **Multi-Database Support**: SQLite, PostgreSQL, MySQL, LanceDB (vector), Kuzu (graph)
- **Dependency Injection**: Complete DI integration with factory patterns
- **TypeScript First**: Strict typing with zero `any` types
- **DAO Pattern**: Specialized data access objects for different database types
- **Connection Pooling**: Enterprise-grade resource management
- **Transaction Support**: ACID compliance with rollback capabilities

## Installation

```bash
npm install @claude-zen/database
# or
yarn add @claude-zen/database
# or
pnpm add @claude-zen/database
```

## Quick Start

```typescript
import { 
  DatabaseProviderFactory, 
  SqliteAdapter, 
  RelationalDao 
} from '@claude-zen/database';

// Configure database
const config = {
  type: 'sqlite' as const,
  database: './app.db'
};

// Create adapter
const factory = new DatabaseProviderFactory();
const adapter = factory.createAdapter(config);

// Use DAO for type-safe operations
const userDao = new RelationalDao(adapter, logger, 'users');
const users = await userDao.findAll();
```

## Database Adapters

### SQLite
```typescript
const config = {
  type: 'sqlite',
  database: './data/app.db',
  options: { 
    readonly: false,
    timeout: 5000 
  }
};
```

### PostgreSQL
```typescript
const config = {
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  username: 'user',
  password: 'pass',
  pool: { min: 2, max: 20 }
};
```

### LanceDB (Vector)
```typescript
const config = {
  type: 'lancedb',
  database: './vectors.lance',
  options: {
    vectorSize: 384,
    metricType: 'cosine'
  }
};
```

### Kuzu (Graph)
```typescript
const config = {
  type: 'kuzu',
  database: './graph.kuzu',
  options: {
    bufferPoolSize: '1GB',
    maxNumThreads: 4
  }
};
```

## Specialized DAOs

### Relational Data
```typescript
import { RelationalDao } from '@claude-zen/database';

const userDao = new RelationalDao(adapter, logger, 'users');

// Type-safe queries
const activeUsers = await userDao.findBy({ status: 'active' });
const userCount = await userDao.count({ status: 'active' });
```

### Vector Operations
```typescript
import { VectorDao } from '@claude-zen/database';

const docDao = new VectorDao(lancedbAdapter, logger, 'documents');

// Similarity search
const similar = await docDao.similaritySearch(queryVector, {
  limit: 10,
  threshold: 0.7
});
```

### Graph Operations
```typescript
import { GraphDao } from '@claude-zen/database';

const socialDao = new GraphDao(kuzuAdapter, logger, 'User');

// Graph traversals
const network = await socialDao.traverse('user123', 'FOLLOWS', 3);
```

## Dependency Injection

```typescript
import { DIContainer } from '@claude-zen/foundation';
import { DatabaseProviderFactory } from '@claude-zen/database';

const container = new DIContainer();
container.register('DatabaseFactory', DatabaseProviderFactory);

const factory = container.resolve('DatabaseFactory');
```

## License

MIT