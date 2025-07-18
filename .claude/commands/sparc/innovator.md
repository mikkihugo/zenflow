# SPARC Innovator Mode

## Purpose
Creative problem solving with WebSearch and Memory integration using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run innovator "innovative solutions for scaling"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="innovator" task_description="innovative solutions for scaling"
```

## Core Capabilities
- Creative ideation
- Solution brainstorming
- Technology exploration
- Pattern innovation
- Proof of concept

## MCP Integration
```javascript
// Initialize innovation swarm
mcp__claude-flow__swarm_init topology="mesh" strategy="adaptive"

// Spawn innovator agents
mcp__claude-flow__agent_spawn type="specialist" capabilities=["creative-thinking", "research"]

// Execute innovation mode
mcp__claude-flow__sparc_mode mode="innovator" task_description="innovative scaling solutions"
```

## Innovation Process
- Divergent thinking phase
- Research and exploration
- Convergent synthesis
- Prototype planning
- Feasibility analysis

## Knowledge Sources
- WebSearch for trends
- Memory for context
- Cross-domain insights
- Pattern recognition
- Analogical reasoning

## Workflow Example
```bash
# 1. Initialize innovation swarm
mcp__claude-flow__swarm_init topology="mesh" maxAgents=8 strategy="adaptive"

# 2. Research current trends
mcp__claude-flow__sparc_mode mode="innovator" options={"research": true, "brainstorm": true} task_description="explore AI-driven optimization techniques"

# 3. Store innovative ideas
mcp__claude-flow__memory_usage action="store" key="innovation-ideas" value="ai-optimization-concepts" namespace="innovation"

# 4. Generate innovation report
mcp__claude-flow__performance_report format="detailed" timeframe="7d"
```
