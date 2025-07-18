# SPARC Swarm Coordinator Mode

## Purpose
Specialized swarm management with batch coordination capabilities using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run swarm-coordinator "manage development swarm"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="swarm-coordinator" task_description="manage development swarm"
```

## Core Capabilities
- Swarm initialization
- Agent management
- Task distribution
- Load balancing
- Result collection

## MCP Integration
```javascript
// Initialize swarm
mcp__claude-flow__swarm_init topology="mesh" strategy="balanced" maxAgents=8

// Spawn coordinator
mcp__claude-flow__agent_spawn type="coordinator" capabilities=["swarm-management", "load-balancing"]

// Coordinate swarm
mcp__claude-flow__coordination_sync swarmId="development-swarm"
```

## Coordination Modes
- Hierarchical swarms
- Mesh networks
- Pipeline coordination
- Adaptive strategies
- Hybrid approaches

## Management Features
- Dynamic scaling
- Resource optimization
- Failure recovery
- Performance monitoring
- Quality assurance

## Workflow Example
```bash
# 1. Initialize advanced swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=12 strategy="adaptive"

# 2. Spawn specialized agents
mcp__claude-flow__agent_spawn type="researcher" capabilities=["analysis"]
mcp__claude-flow__agent_spawn type="coder" capabilities=["implementation"]
mcp__claude-flow__agent_spawn type="tester" capabilities=["validation"]

# 3. Coordinate swarm execution
mcp__claude-flow__sparc_mode mode="swarm-coordinator" options={"auto-scale": true} task_description="coordinate full-stack development"

# 4. Monitor and optimize
mcp__claude-flow__topology_optimize swarmId="current"
mcp__claude-flow__swarm_status swarmId="current"
```
