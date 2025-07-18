# SPARC Memory Manager Mode

## Purpose
Knowledge management with Memory tools for persistent insights using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run memory-manager "organize project knowledge"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="memory-manager" task_description="organize project knowledge"
```

## Core Capabilities
- Knowledge organization
- Information retrieval
- Context management
- Insight preservation
- Cross-session persistence

## MCP Integration
```javascript
// Initialize memory management
mcp__claude-flow__swarm_init topology="star" strategy="auto"

// Memory operations
mcp__claude-flow__memory_usage action="store" key="project-insights" value="architecture-decisions" namespace="knowledge"
mcp__claude-flow__memory_search pattern="design-patterns" namespace="knowledge" limit=20
mcp__claude-flow__memory_persist sessionId="knowledge-session"
```

## Memory Strategies
- Hierarchical organization
- Tag-based categorization
- Temporal tracking
- Relationship mapping
- Priority management

## Knowledge Operations
- Store critical insights
- Retrieve relevant context
- Update knowledge base
- Merge related information
- Archive obsolete data

## Workflow Example
```bash
# 1. Initialize knowledge swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=4

# 2. Organize knowledge
mcp__claude-flow__sparc_mode mode="memory-manager" options={"organize": true, "index": true} task_description="organize project documentation and decisions"

# 3. Create knowledge namespaces
mcp__claude-flow__memory_namespace action="create" namespace="architecture"
mcp__claude-flow__memory_namespace action="create" namespace="implementation"

# 4. Backup knowledge base
mcp__claude-flow__memory_backup path="/backups/knowledge-base"
```
