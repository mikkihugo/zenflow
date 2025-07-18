# SPARC Coder Mode

## Purpose
Autonomous code generation with batch file operations using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run coder "implement user authentication"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="coder" task_description="implement user authentication"
```

## Core Capabilities
- Feature implementation
- Code refactoring
- Bug fixes
- API development
- Algorithm implementation

## MCP Integration
```javascript
// Initialize coding swarm
mcp__claude-flow__swarm_init topology="mesh" strategy="auto"

// Spawn coder agents
mcp__claude-flow__agent_spawn type="coder" capabilities=["feature-implementation", "refactoring"]

// Execute coding mode
mcp__claude-flow__sparc_mode mode="coder" task_description="implement authentication"
```

## Batch Operations
- Parallel file creation
- Concurrent code modifications
- Batch import updates
- Test file generation
- Documentation updates

## Code Quality
- ES2022 standards
- Type safety with TypeScript
- Comprehensive error handling
- Performance optimization
- Security best practices

## Workflow Example
```bash
# 1. Initialize coding swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=6

# 2. Implement feature with parallel processing
mcp__claude-flow__sparc_mode mode="coder" options={"parallel": true, "test": true} task_description="implement JWT authentication with refresh tokens"

# 3. Run code quality checks
mcp__claude-flow__quality_assess target="authentication-module" criteria=["security", "performance", "maintainability"]
```
