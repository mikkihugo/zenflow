# SPARC Researcher Mode

## Purpose
Deep research with parallel WebSearch/WebFetch and Memory coordination using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run researcher "research AI trends 2024"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="researcher" task_description="research AI trends 2024"
```

## Core Capabilities
- Information gathering
- Source evaluation
- Trend analysis
- Competitive research
- Technology assessment

## MCP Integration
```javascript
// Initialize research swarm
mcp__claude-flow__swarm_init topology="mesh" strategy="adaptive"

// Spawn researcher agents
mcp__claude-flow__agent_spawn type="researcher" capabilities=["web-research", "analysis"]

// Execute research mode
mcp__claude-flow__sparc_mode mode="researcher" task_description="research latest trends"
```

## Research Methods
- Parallel web searches
- Academic paper analysis
- Industry report synthesis
- Expert opinion gathering
- Data compilation

## Memory Integration
- Store research findings
- Build knowledge graphs
- Track information sources
- Cross-reference insights
- Maintain research history

## Workflow Example
```bash
# 1. Initialize research swarm
mcp__claude-flow__swarm_init topology="mesh" maxAgents=8 strategy="adaptive"

# 2. Conduct research
mcp__claude-flow__sparc_mode mode="researcher" options={"depth": "comprehensive", "sources": "academic,industry"} task_description="research quantum computing applications"

# 3. Store findings
mcp__claude-flow__memory_usage action="store" key="research-quantum" value="findings-2024" namespace="research"

# 4. Search and analyze
mcp__claude-flow__memory_search pattern="quantum" namespace="research" limit=50
```
