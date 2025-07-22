---
name: claude-zen-memory
description: Interact with Claude-Flow memory system
---

# 🧠 Claude-Flow Memory System

The memory system provides persistent storage for cross-session and cross-agent collaboration with CRDT-based conflict resolution.

## Store Information
```bash
# Store with default namespace
./claude-zen memory store "key" "value"

# Store with specific namespace
./claude-zen memory store "architecture_decisions" "microservices with API gateway" --namespace arch
```

## Query Memory
```bash
# Search across all namespaces
./claude-zen memory query "authentication"

# Search with filters
./claude-zen memory query "API design" --namespace arch --limit 10
```

## Memory Statistics
```bash
# Show overall statistics
./claude-zen memory stats

# Show namespace-specific stats
./claude-zen memory stats --namespace project
```

## Export/Import
```bash
# Export all memory
./claude-zen memory export full-backup.json

# Export specific namespace
./claude-zen memory export project-backup.json --namespace project

# Import memory
./claude-zen memory import backup.json
```

## Cleanup Operations
```bash
# Clean entries older than 30 days
./claude-zen memory cleanup --days 30

# Clean specific namespace
./claude-zen memory cleanup --namespace temp --days 7
```

## 🗂️ Namespaces
- **default** - General storage
- **agents** - Agent-specific data and state
- **tasks** - Task information and results
- **sessions** - Session history and context
- **swarm** - Swarm coordination and objectives
- **project** - Project-specific context
- **spec** - Requirements and specifications
- **arch** - Architecture decisions
- **impl** - Implementation notes
- **test** - Test results and coverage
- **debug** - Debug logs and fixes

## 🎯 Best Practices

### Naming Conventions
- Use descriptive, searchable keys
- Include timestamp for time-sensitive data
- Prefix with component name for clarity

### Organization
- Use namespaces to categorize data
- Store related data together
- Keep values concise but complete

### Maintenance
- Regular backups with export
- Clean old data periodically
- Monitor storage statistics
- Compress large values

## Examples

### Store SPARC context:
```bash
./claude-zen memory store "spec_auth_requirements" "OAuth2 + JWT with refresh tokens" --namespace spec
./claude-zen memory store "arch_api_design" "RESTful microservices with GraphQL gateway" --namespace arch
./claude-zen memory store "test_coverage_auth" "95% coverage, all tests passing" --namespace test
```

### Query project decisions:
```bash
./claude-zen memory query "authentication" --namespace arch --limit 5
./claude-zen memory query "test results" --namespace test
```

### Backup project memory:
```bash
./claude-zen memory export project-$(date +%Y%m%d).json --namespace project
```
