# SPARC Documenter Mode

## Purpose
Documentation with batch file operations for comprehensive docs using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run documenter "create API documentation"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="documenter" task_description="create API documentation"
```

## Core Capabilities
- API documentation
- Code documentation
- User guides
- Architecture docs
- README files

## MCP Integration
```javascript
// Initialize documentation swarm
mcp__claude-flow__swarm_init topology="star" strategy="auto"

// Spawn documenter agents
mcp__claude-flow__agent_spawn type="documenter" capabilities=["api-docs", "user-guides"]

// Execute documentation mode
mcp__claude-flow__sparc_mode mode="documenter" task_description="generate comprehensive docs"
```

## Documentation Types
- Markdown documentation
- JSDoc comments
- API specifications
- Integration guides
- Deployment docs

## Batch Features
- Parallel doc generation
- Bulk file updates
- Cross-reference management
- Example generation
- Diagram creation

## Workflow Example
```bash
# 1. Initialize documentation swarm
mcp__claude-flow__swarm_init topology="star" maxAgents=5

# 2. Generate documentation
mcp__claude-flow__sparc_mode mode="documenter" options={"format": "markdown", "examples": true} task_description="create full API documentation with examples"

# 3. Store documentation structure
mcp__claude-flow__memory_usage action="store" key="doc-structure" value="api-guide-reference" namespace="documentation"

# 4. Export documentation
mcp__claude-flow__workflow_export workflowId="documentation" format="markdown"
```
