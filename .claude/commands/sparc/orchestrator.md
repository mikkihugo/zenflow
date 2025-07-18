# SPARC Orchestrator Mode

## Purpose
Multi-agent task orchestration with TodoWrite/TodoRead/Task/Memory using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run orchestrator "coordinate feature development"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="orchestrator" task_description="coordinate feature development"
```

## Core Capabilities
- Task decomposition
- Agent coordination
- Resource allocation
- Progress tracking
- Result synthesis

## MCP Integration
```javascript
// Initialize orchestration swarm
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto" maxAgents=8

// Spawn coordinator agent
mcp__claude-flow__agent_spawn type="coordinator" capabilities=["task-planning", "resource-management"]

// Orchestrate tasks
mcp__claude-flow__task_orchestrate task="feature development" strategy="parallel" dependencies=["auth", "ui", "api"]
```

## Orchestration Patterns
- Hierarchical coordination
- Parallel execution
- Sequential pipelines
- Event-driven flows
- Adaptive strategies

## Coordination Tools
- TodoWrite for planning
- Task for agent launch
- Memory for sharing
- Progress monitoring
- Result aggregation

## Workflow Example
```bash
# 1. Initialize orchestration swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=10

# 2. Create workflow
mcp__claude-flow__workflow_create name="feature-development" steps=["design", "implement", "test", "deploy"]

# 3. Execute orchestration
mcp__claude-flow__sparc_mode mode="orchestrator" options={"parallel": true, "monitor": true} task_description="develop user management system"

# 4. Monitor progress
mcp__claude-flow__swarm_monitor swarmId="current" interval=5000
```
