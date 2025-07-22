# Advanced Memory Management System

The Claude Flow Advanced Memory Management System provides comprehensive capabilities for storing, querying, and managing data across swarm operations with advanced features including indexing, compression, cross-agent sharing, and intelligent cleanup.

## Features

### 🔍 Advanced Querying
- **Flexible Search**: Multiple search criteria including full-text, patterns, and metadata
- **Indexing**: Automatic indexing for efficient queries
- **Aggregation**: Generate statistics and aggregations by namespace, type, owner, or tags
- **Pagination**: Support for offset/limit pagination
- **Sorting**: Sort results by any field in ascending or descending order

### 📤 Export/Import Capabilities
- **Multiple Formats**: JSON, CSV, XML, YAML support
- **Compression**: Optional data compression during export
- **Encryption**: Basic encryption support for sensitive data
- **Validation**: Data validation during import
- **Transformation**: Custom data transformation during import
- **Conflict Resolution**: Multiple strategies for handling conflicts

### 📊 Comprehensive Statistics
- **Usage Analytics**: Detailed memory usage and performance metrics
- **Distribution Analysis**: Data distribution across namespaces, types, and owners
- **Temporal Analysis**: Activity patterns over time
- **Health Monitoring**: System health indicators and corruption detection
- **Optimization Suggestions**: AI-powered recommendations for system improvements

### 🧹 Intelligent Cleanup
- **Retention Policies**: Configurable retention rules by namespace/type
- **Archiving**: Archive old entries before deletion
- **Deduplication**: Remove duplicate entries intelligently
- **Compression**: Compress eligible entries to save space
- **Orphan Cleanup**: Remove broken references and orphaned data

### 🔗 Cross-Agent Sharing
- **Memory Indexing**: Fast lookups across large datasets
- **Compression**: Automatic compression for large entries
- **Cross-agent coordination**: Shared memory spaces between agents
- **Persistence**: Data survives system restarts

## Command Reference

### Basic Operations

#### Store Data
```bash
# Basic storage
claude-zen memory store "user_preferences" '{"theme": "dark", "lang": "en"}' \
  --namespace "app_config" \
  --type "preferences" \
  --tags "user,config" \
  --access-level "shared"

# With metadata and TTL
claude-zen memory store "session_data" '{"user_id": 123, "token": "abc"}' \
  --namespace "sessions" \
  --type "auth" \
  --metadata '{"version": "1.0", "encrypted": false}' \
  --ttl 3600000 \
  --compress
```

#### Retrieve Data
```bash
# Basic retrieval
claude-zen memory get "user_preferences" --namespace "app_config"

# JSON format output
claude-zen memory get "user_preferences" --format json
```

#### Update Data
```bash
# Update entry (requires separate implementation)
claude-zen memory update "user_preferences" '{"theme": "light"}' \
  --namespace "app_config" \
  --merge
```

#### Delete Data
```bash
# Delete with confirmation
claude-zen memory delete "user_preferences" --namespace "app_config" --confirm
```

### Advanced Querying

#### Basic Query
```bash
# Simple search
claude-zen memory query "user" --namespace "app_config"

# Full-text search
claude-zen memory query "dark theme" --full-text "theme preferences"
```

#### Complex Queries
```bash
# Multi-criteria search
claude-zen memory query "config" \
  --namespace "app_config" \
  --type "preferences" \
  --tags "user,settings" \
  --created-after "2024-01-01" \
  --size-gt 100 \
  --limit 50 \
  --sort-by "updatedAt" \
  --sort-order "desc"

# Pattern matching
claude-zen memory query "user_*" \
  --key-pattern "^user_[0-9]+$" \
  --value-search "premium" \
  --include-expired
```

#### Aggregation Queries
```bash
# Generate aggregations
claude-zen memory query "*" \
  --aggregate-by "namespace" \
  --format "table"

# Statistics by type
claude-zen memory query "*" \
  --aggregate-by "type" \
  --include-metadata \
  --format "json"
```

### Export Operations

#### Basic Export
```bash
# JSON export
claude-zen memory export "./backups/memory_backup.json" \
  --format json \
  --include-metadata

# CSV export with filtering
claude-zen memory export "./reports/user_data.csv" \
  --format csv \
  --namespace "users" \
  --type "profile"
```

#### Advanced Export
```bash
# Compressed export
claude-zen memory export "./backups/compressed_backup.json" \
  --format json \
  --compression \
  --include-metadata

# Encrypted export
claude-zen memory export "./secure/encrypted_backup.json" \
  --format json \
  --encrypt \
  --encrypt-key "your-secret-key"

# Filtered export with complex query
claude-zen memory export "./analytics/recent_activity.json" \
  --format json \
  --filter-query '{"createdAfter": "2024-01-01", "tags": ["analytics"], "sizeGreaterThan": 1024}'
```

#### Multi-format Export
```bash
# XML export
claude-zen memory export "./data/memory_data.xml" --format xml

# YAML export
claude-zen memory export "./config/memory_config.yaml" --format yaml
```

### Import Operations

#### Basic Import
```bash
# JSON import
claude-zen memory import "./data/backup.json" \
  --format json \
  --namespace "imported" \
  --conflict-resolution "skip"

# CSV import with validation
claude-zen memory import "./data/user_data.csv" \
  --format csv \
  --validation \
  --conflict-resolution "merge"
```

#### Advanced Import
```bash
# Import with transformation
claude-zen memory import "./data/legacy_data.json" \
  --format json \
  --key-mapping '{"old_key": "new_key", "legacy_id": "id"}' \
  --value-transform "return value.toUpperCase();" \
  --metadata-extract "return {imported: true, source: 'legacy'};"

# Dry run import
claude-zen memory import "./data/test_data.json" \
  --dry-run \
  --conflict-resolution "overwrite"
```

#### Conflict Resolution Strategies
```bash
# Different conflict resolution strategies
claude-zen memory import "./data/conflicts.json" --conflict-resolution "overwrite"
claude-zen memory import "./data/conflicts.json" --conflict-resolution "skip"
claude-zen memory import "./data/conflicts.json" --conflict-resolution "merge"
claude-zen memory import "./data/conflicts.json" --conflict-resolution "rename"
```

### Statistics and Analytics

#### Basic Statistics
```bash
# Overview statistics
claude-zen memory stats

# Detailed statistics
claude-zen memory stats --detailed

# JSON format for processing
claude-zen memory stats --format json
```

#### Export Statistics
```bash
# Export statistics to file
claude-zen memory stats --format json --export "./reports/memory_stats.json"

# Generate detailed report
claude-zen memory stats --detailed --export "./reports/detailed_stats.json"
```

### Cleanup Operations

#### Basic Cleanup
```bash
# Standard cleanup
claude-zen memory cleanup

# Dry run to see what would be cleaned
claude-zen memory cleanup --dry-run
```

#### Advanced Cleanup
```bash
# Aggressive cleanup
claude-zen memory cleanup --aggressive

# Custom cleanup rules
claude-zen memory cleanup \
  --remove-older-than 30 \
  --remove-unaccessed 7 \
  --remove-duplicates \
  --compress-eligible \
  --archive-old \
  --archive-older-than 90 \
  --archive-path "./archives"
```

#### Retention Policy Cleanup
```bash
# Custom retention policies
claude-zen memory cleanup \
  --retention-policies '[
    {
      "namespace": "sessions",
      "maxAge": 1,
      "maxCount": 1000
    },
    {
      "namespace": "cache",
      "maxAge": 7,
      "sizeLimit": 104857600
    }
  ]'
```

### Utility Commands

#### List Resources
```bash
# List all namespaces
claude-zen memory namespaces

# List all data types
claude-zen memory types

# List all tags
claude-zen memory tags
```

#### List Entries
```bash
# List recent entries
claude-zen memory list --limit 20 --sort-by "updatedAt" --sort-order "desc"

# List by namespace
claude-zen memory list --namespace "users" --type "profile"

# Paginated listing
claude-zen memory list --limit 10 --offset 20
```

#### Configuration
```bash
# Show current configuration
claude-zen memory config --show

# Update configuration
claude-zen memory config --set '{"autoCompress": true, "autoCleanup": false}'
```

## Advanced Usage Patterns

### Research Workflow Integration
```bash
# Store research findings
claude-zen memory store "research_findings_ai_trends" '{
  "topic": "AI Trends 2024",
  "findings": [...],
  "sources": [...],
  "confidence": 0.85
}' --namespace "research" --type "findings" --tags "ai,trends,2024"

# Query research by topic
claude-zen memory query "AI Trends" \
  --namespace "research" \
  --type "findings" \
  --sort-by "createdAt" \
  --include-metadata

# Export research for reporting
claude-zen memory export "./reports/ai_research_2024.json" \
  --namespace "research" \
  --filter-query '{"tags": ["ai", "2024"]}'
```

### Development Workflow Integration
```bash
# Store architecture decisions
claude-zen memory store "arch_decision_microservices" '{
  "decision": "Use microservices architecture",
  "rationale": "Better scalability and maintainability",
  "alternatives": ["monolith", "serverless"],
  "status": "approved"
}' --namespace "architecture" --type "decision" --tags "microservices,backend"

# Store and query test results
claude-zen memory store "test_results_v1.2.0" '{
  "version": "1.2.0",
  "passed": 156,
  "failed": 2,
  "coverage": 94.5,
  "duration": 45.2
}' --namespace "testing" --type "results" --tags "release,v1.2.0"
```

### Cross-Agent Coordination
```bash
# Agent A stores task status
claude-zen memory store "task_processing_status" '{
  "taskId": "task_123",
  "status": "in_progress",
  "assignedTo": "agent_a",
  "progress": 45,
  "nextStep": "data_validation"
}' --namespace "coordination" --type "task_status" --owner "agent_a"

# Agent B queries for tasks
claude-zen memory query "task_" \
  --namespace "coordination" \
  --type "task_status" \
  --value-search "in_progress"

# Agent C updates task status
claude-zen memory update "task_processing_status" '{
  "status": "completed",
  "progress": 100,
  "completedBy": "agent_c",
  "result": "success"
}' --namespace "coordination" --merge
```

### Performance Optimization

#### Indexing Best Practices
- Use consistent naming conventions for keys
- Tag entries systematically for efficient querying
- Use appropriate namespaces to partition data
- Leverage type fields for categorization

#### Memory Usage Optimization
```bash
# Enable compression for large entries
claude-zen memory config --set '{"autoCompress": true, "compressionThreshold": 1024}'

# Set up automatic cleanup
claude-zen memory config --set '{"autoCleanup": true, "cleanupInterval": 3600000}'

# Configure cache settings
claude-zen memory config --set '{"cacheSize": 10000, "cacheTtl": 300000}'
```

#### Query Optimization
```bash
# Use specific namespaces to narrow search space
claude-zen memory query "search_term" --namespace "specific_namespace"

# Limit results and use pagination for large datasets
claude-zen memory query "*" --limit 100 --offset 0

# Use aggregation for statistics instead of processing all entries
claude-zen memory query "*" --aggregate-by "type" --limit 0
```

## Integration with SPARC Modes

### Automatic Memory Usage in SPARC
```javascript
// In SPARC orchestrator mode
TodoWrite([
  {
    id: "research_phase",
    content: "Store research findings in memory for later analysis",
    memoryKey: "research_findings_session_123"
  }
]);

// Store research results
Task("Research Agent", "Research topic and store findings in memory namespace 'research'");

// Query existing research
Task("Analysis Agent", "Query memory for related research using tags and full-text search");
```

### Memory-Driven Coordination
```bash
# Store coordination data between SPARC modes
claude-zen memory store "sparc_session_context" '{
  "sessionId": "sparc_123",
  "mode": "development",
  "phase": "implementation",
  "context": {...}
}' --namespace "sparc_coordination" --type "session_context"

# Query for session context in subsequent operations
claude-zen memory query "sparc_session_context" \
  --namespace "sparc_coordination" \
  --type "session_context" \
  --include-metadata
```

## Error Handling and Troubleshooting

### Common Issues and Solutions

#### Memory Not Persisting
```bash
# Check configuration
claude-zen memory config --show

# Ensure persistence is enabled
claude-zen memory config --set '{"persistenceEnabled": true}'
```

#### Performance Issues
```bash
# Check statistics for bottlenecks
claude-zen memory stats --detailed

# Rebuild index if needed
claude-zen memory cleanup --dry-run

# Optimize configuration
claude-zen memory config --set '{
  "indexingEnabled": true,
  "cacheSize": 20000,
  "autoCompress": true
}'
```

#### Data Corruption
```bash
# Check for corrupted entries
claude-zen memory stats | grep "Corrupted"

# Run comprehensive cleanup
claude-zen memory cleanup --remove-orphaned --remove-duplicates
```

#### Import/Export Issues
```bash
# Validate data before import
claude-zen memory import "./data.json" --validation --dry-run

# Check export with different formats
claude-zen memory export "./test.json" --format json --namespace "test"
```

## API Integration

The Advanced Memory Manager can be used programmatically:

```typescript
import { AdvancedMemoryManager } from './src/memory/advanced-memory-manager.js';
import { Logger } from './src/core/logger.js';

// Initialize
const logger = Logger.getInstance();
const memory = new AdvancedMemoryManager({
  autoCompress: true,
  indexingEnabled: true,
  persistenceEnabled: true
}, logger);

await memory.initialize();

// Store data
const entryId = await memory.store('key', { data: 'value' }, {
  namespace: 'api',
  type: 'data',
  tags: ['api', 'integration']
});

// Query data
const results = await memory.query({
  namespace: 'api',
  tags: ['integration'],
  limit: 10
});

// Export data
const exportResult = await memory.export('./backup.json', {
  format: 'json',
  namespace: 'api'
});

// Cleanup
await memory.cleanup({
  removeOlderThan: 30,
  compressEligible: true
});
```

## Best Practices

### 1. Namespace Organization
- Use hierarchical namespaces: `project.module.component`
- Separate different data types into different namespaces
- Use consistent naming conventions

### 2. Tagging Strategy
- Use descriptive, searchable tags
- Include version tags for temporal queries
- Tag by data source, purpose, and category

### 3. Data Lifecycle Management
- Set appropriate TTL for temporary data
- Use retention policies for automated cleanup
- Archive important historical data

### 4. Performance Optimization
- Enable indexing for frequently queried data
- Use compression for large entries
- Monitor statistics and optimize based on usage patterns

### 5. Security Considerations
- Use appropriate access levels (private/shared/public)
- Enable encryption for sensitive data exports
- Implement proper backup and recovery procedures

This advanced memory management system provides the foundation for sophisticated data handling in Claude Flow, enabling complex swarm operations with efficient data sharing and coordination.