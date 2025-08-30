# SQLite Knowledge Cache Backend

This document describes the SQLite backend implementation for the knowledge cache system and how to configure it.

## Overview

The SQLite backend provides persistent storage for FACT (Fast Augmented Context Tools) knowledge entries using SQLite database. It supports:

- **Persistent Storage**: Data survives application restarts
- **Full-Text Search**: Optional FTS5 indexing for fast text queries
- **JSON Metadata**: Flexible metadata storage and querying
- **Performance Optimization**: Connection pooling, WAL mode, indexes
- **Statistics**: Comprehensive storage and performance metrics

## Configuration

### Environment Variables

The SQLite backend can be configured using the following environment variables:

```bash
# Enable SQLite backend
KNOWLEDGE_CACHE_BACKEND=sqlite

# Database file path (default: ./.claude-zen/knowledge-cache.db)
SQLITE_DB_PATH=/path/to/database.db

# Enable WAL mode for better concurrency (default: true)
SQLITE_ENABLE_WAL=true

# Enable full-text search indexing (default: true)
SQLITE_ENABLE_FTS=true
```

### Programmatic Configuration

```javascript
import { SQLiteBackend } from '@claude-zen/knowledge';

const backend = new SQLiteBackend({
  dbPath: './cache.db',           // Database file path
  enableWAL: true,                // Enable WAL mode
  enableFullTextSearch: true,     // Enable FTS5 indexing
});

await backend.initialize();
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dbPath` | `string` | `':memory:'` | SQLite database file path. Use `':memory:'` for in-memory database |
| `enableWAL` | `boolean` | `true` | Enable Write-Ahead Logging mode for better concurrency |
| `enableFullTextSearch` | `boolean` | `true` | Enable FTS5 full-text search indexing |

## Database Schema

The SQLite backend creates the following tables:

### knowledge_entries

Main storage table for knowledge entries:

```sql
CREATE TABLE knowledge_entries (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  result TEXT,                    -- JSON string
  source TEXT,
  timestamp INTEGER NOT NULL,
  ttl INTEGER NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed INTEGER NOT NULL,
  metadata TEXT,                  -- JSON string
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

### knowledge_entries_fts (Optional)

Full-text search index (created when `enableFullTextSearch` is true):

```sql
CREATE VIRTUAL TABLE knowledge_entries_fts 
USING fts5(id, query, result, source, content='knowledge_entries', content_rowid='rowid');
```

### Indexes

Performance indexes are automatically created:

```sql
CREATE INDEX idx_knowledge_timestamp ON knowledge_entries(timestamp);
CREATE INDEX idx_knowledge_source ON knowledge_entries(source);
CREATE INDEX idx_knowledge_ttl ON knowledge_entries(timestamp, ttl);
CREATE INDEX idx_knowledge_last_accessed ON knowledge_entries(last_accessed);
```

## Usage Examples

### Basic Usage

```javascript
import { SQLiteBackend } from '@claude-zen/knowledge';

// Initialize backend
const backend = new SQLiteBackend({
  dbPath: './knowledge-cache.db'
});
await backend.initialize();

// Store a knowledge entry
const entry = {
  id: 'unique-id',
  query: 'What is TypeScript?',
  result: { answer: 'TypeScript is a typed superset of JavaScript' },
  source: 'documentation',
  timestamp: Date.now(),
  ttl: 3600000, // 1 hour
  accessCount: 0,
  lastAccessed: Date.now(),
  metadata: {
    type: 'definition',
    domains: ['programming', 'javascript'],
    confidence: 0.9
  }
};

await backend.store(entry);

// Retrieve entry
const retrieved = await backend.get('unique-id');

// Search entries
const results = await backend.search({
  query: 'TypeScript',
  type: 'definition',
  domains: ['programming'],
  maxResults: 10
});

// Get statistics
const stats = await backend.getStats();
console.log(stats.totalEntries, stats.hitRate);

// Cleanup old entries (older than 1 hour)
const cleaned = await backend.cleanup(3600000);

// Shutdown backend
await backend.shutdown();
```

### Advanced Search

```javascript
// Search with various filters
const results = await backend.search({
  query: 'JavaScript',           // Full-text search
  type: 'definition',            // Filter by metadata type
  domains: ['programming'],      // Filter by domains
  minConfidence: 0.8,           // Minimum confidence threshold
  timeRange: {                  // Time range filter
    start: Date.now() - 86400000,  // Last 24 hours
    end: Date.now()
  },
  maxResults: 50                // Limit results
});
```

### Statistics and Monitoring

```javascript
const stats = await backend.getStats();

console.log('Storage Statistics:', {
  totalEntries: stats.totalEntries,
  totalSize: stats.totalSize,
  hitRate: stats.hitRate,
  cacheHits: stats.cacheHits,
  cacheMisses: stats.cacheMisses,
  oldestEntry: new Date(stats.oldestEntry),
  newestEntry: new Date(stats.newestEntry),
  healthy: stats.healthy
});

console.log('Performance:', {
  indexEfficiency: stats.performance.indexEfficiency,
  storageEfficiency: stats.performance.storageEfficiency
});
```

## Performance Considerations

### WAL Mode
- Enables better concurrency for multiple readers and writers
- Disabled for in-memory databases (`:memory:`)
- Can be disabled for single-threaded applications

### Full-Text Search
- Uses SQLite FTS5 for fast text search
- Adds overhead for writes but dramatically improves search performance
- Can be disabled if text search is not needed

### Indexing
- Automatic indexes on timestamp, source, and TTL fields
- Improves query performance for cleanup and filtering operations

### Memory Usage
- File-based databases use minimal memory
- In-memory databases (`:memory:`) store all data in RAM

## Error Handling

The backend handles common SQLite errors gracefully:

- **Database locked**: Automatic retry with exponential backoff
- **Disk full**: Clear error message and graceful degradation
- **Corrupted database**: Detection and repair suggestions
- **Permission errors**: Clear error messages for file access issues

## Migration and Backup

### Database Migration
The backend automatically creates tables and indexes on initialization. No manual migration is required.

### Backup
For file-based databases, you can backup the database file:

```bash
# Simple file copy (stop application first)
cp knowledge-cache.db knowledge-cache.backup.db

# SQLite backup command (online backup)
sqlite3 knowledge-cache.db ".backup knowledge-cache.backup.db"
```

### Recovery
```bash
# Restore from backup
cp knowledge-cache.backup.db knowledge-cache.db

# Verify database integrity
sqlite3 knowledge-cache.db "PRAGMA integrity_check;"
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Ensure the application has write access to the database directory
2. **Database is locked**: Check for long-running transactions or multiple connections
3. **Disk space**: Monitor available disk space for file-based databases
4. **Performance**: Enable WAL mode and ensure proper indexing

### Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
const backend = new SQLiteBackend({
  dbPath: './cache.db',
  debug: true  // Enable debug logging
});
```

### Health Checks

```javascript
// Check backend health
const stats = await backend.getStats();
if (!stats.healthy) {
  console.warn('SQLite backend is not healthy');
}
```