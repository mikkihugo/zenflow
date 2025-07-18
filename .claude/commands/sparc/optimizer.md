# SPARC Optimizer Mode

## Purpose
Performance optimization with systematic analysis and improvements using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run optimizer "optimize application performance"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="optimizer" task_description="optimize application performance"
```

## Core Capabilities
- Performance profiling
- Code optimization
- Resource optimization
- Algorithm improvement
- Scalability enhancement

## MCP Integration
```javascript
// Initialize optimization swarm
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto"

// Spawn optimizer agents
mcp__claude-flow__agent_spawn type="optimizer" capabilities=["performance-analysis", "code-optimization"]

// Run optimization
mcp__claude-flow__daa_optimization target="application" metrics=["speed", "memory", "cpu"]
```

## Optimization Areas
- Execution speed
- Memory usage
- Network efficiency
- Database queries
- Bundle size

## Systematic Approach
1. Baseline measurement
2. Bottleneck identification
3. Optimization implementation
4. Impact verification
5. Continuous monitoring

## Workflow Example
```bash
# 1. Initialize optimization swarm
mcp__claude-flow__swarm_init topology="star" maxAgents=6

# 2. Analyze bottlenecks
mcp__claude-flow__bottleneck_analyze component="api-server" metrics=["response-time", "throughput"]

# 3. Execute optimization
mcp__claude-flow__sparc_mode mode="optimizer" options={"target": "performance", "aggressive": true} task_description="optimize API response times"

# 4. Verify improvements
mcp__claude-flow__performance_report format="detailed" timeframe="24h"
```
