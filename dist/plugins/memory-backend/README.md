# Memory Backend Plugin

Pluggable storage backends for Claude Zen's memory system.

## Supported Backends

### SQLite Backend (Default)
- Embedded SQL database with excellent performance
- ACID compliance, concurrent reads, WAL mode
- No server required, perfect for local development
- Automatic indexing and query optimization

### ChromaDB Backend (Recommended for AI/Vector Storage)
- Vector database optimized for embeddings and semantic search
- Perfect for storing AI-generated content, ADRs, documentation
- Built-in similarity search and metadata filtering
- Excellent for architectural knowledge and pattern storage

### Redis Backend
- In-memory database with persistence
- Excellent performance and scalability
- Requires Redis server

### PostgreSQL Backend
- Full relational database backend
- ACID compliance and complex queries
- Requires PostgreSQL server

### JSON Backend (Fallback)
- File-based storage using JSON
- Great for simple development scenarios
- Automatic persistence and recovery

## Usage

```javascript
import { MemoryBackendPlugin } from './index.js';

const plugin = new MemoryBackendPlugin({
  backend: 'json',
  path: './data/memory',
  maxSize: 5000000 // 5MB
});

await plugin.initialize();

// Store data
await plugin.store('user:123', { name: 'John' }, 'users');

// Retrieve data  
const user = await plugin.retrieve('user:123', 'users');

// Search
const results = await plugin.search('user:*', 'users');
```

## Configuration

- `backend`: Storage backend ('json', 'redis', 'postgresql')
- `path`: Storage path for file-based backends
- `maxSize`: Maximum storage size in bytes
- `compression`: Enable compression (boolean)

## Backend-Specific Config

### Redis
```javascript
{
  backend: 'redis',
  host: 'localhost',
  port: 6379,
  password: 'secret',
  db: 0
}
```

### PostgreSQL
```javascript
{
  backend: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'claude_zen',
  username: 'user',
  password: 'pass'
}
```

## API Methods

- `store(key, value, namespace)` - Store data
- `retrieve(key, namespace)` - Get data
- `search(pattern, namespace)` - Search keys
- `delete(key, namespace)` - Remove data
- `listNamespaces()` - List all namespaces
- `getStats()` - Get storage statistics