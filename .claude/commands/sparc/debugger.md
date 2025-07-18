# SPARC Debugger Mode

## Purpose
Systematic debugging with TodoWrite and Memory integration using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run debugger "fix authentication issues"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="debugger" task_description="fix authentication issues"
```

## Core Capabilities
- Issue reproduction
- Root cause analysis
- Stack trace analysis
- Memory leak detection
- Performance bottleneck identification

## MCP Integration
```javascript
// Initialize debugging swarm
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto"

// Spawn debugger agents
mcp__claude-flow__agent_spawn type="debugger" capabilities=["error-analysis", "performance-profiling"]

// Execute debugging mode
mcp__claude-flow__sparc_mode mode="debugger" task_description="fix memory leak"
```

## Debugging Workflow
1. Create debugging plan with TodoWrite
2. Systematic issue investigation
3. Store findings in Memory
4. Track fix progress
5. Verify resolution

## Tools Integration
- Error log analysis
- Breakpoint simulation
- Variable inspection
- Call stack tracing
- Memory profiling

## Workflow Example
```bash
# 1. Initialize debugging swarm
mcp__claude-flow__swarm_init topology="star" maxAgents=4

# 2. Analyze error patterns
mcp__claude-flow__error_analysis logs=["error.log", "debug.log"]

# 3. Run debugging session
mcp__claude-flow__sparc_mode mode="debugger" options={"trace": true, "profile": true} task_description="debug authentication failure"

# 4. Store findings
mcp__claude-flow__memory_usage action="store" key="debug-findings" value="auth-issue-analysis" namespace="debugging"
```
