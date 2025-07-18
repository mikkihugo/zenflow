# SPARC Analyzer Mode

## Purpose
Deep code and data analysis with batch processing capabilities using MCP tools and swarm coordination.

## Activation
```bash
# Using CLI
npx claude-flow sparc run analyzer "analyze codebase performance"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="analyzer" task_description="analyze codebase performance"
```

## Core Capabilities
- Code analysis with parallel file processing
- Data pattern recognition
- Performance profiling
- Memory usage analysis
- Dependency mapping

## MCP Integration
```javascript
// Initialize swarm for analysis
mcp__claude-flow__swarm_init topology="mesh" strategy="auto"

// Spawn analysis agents
mcp__claude-flow__agent_spawn type="analyst" capabilities=["code-analysis", "performance-profiling"]

// Execute analysis
mcp__claude-flow__sparc_mode mode="analyzer" task_description="analyze codebase"
```

## Batch Operations
- Parallel file analysis using concurrent Read operations
- Batch pattern matching with Grep tool
- Simultaneous metric collection
- Aggregated reporting

## Workflow Example
```bash
# 1. Initialize analysis swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=5

# 2. Run comprehensive analysis
mcp__claude-flow__sparc_mode mode="analyzer" options={"parallel": true} task_description="analyze performance bottlenecks"

# 3. Collect results
mcp__claude-flow__performance_report format="detailed" timeframe="24h"
```

## Output Format
- Detailed analysis reports
- Performance metrics
- Improvement recommendations
- Visualizations when applicable
