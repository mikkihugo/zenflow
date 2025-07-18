# SPARC Tester Mode

## Purpose
Comprehensive testing with parallel execution capabilities using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run tester "full regression suite"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="tester" task_description="full regression suite"
```

## Core Capabilities
- Test planning
- Test execution
- Bug detection
- Coverage analysis
- Report generation

## MCP Integration
```javascript
// Initialize testing swarm
mcp__claude-flow__swarm_init topology="mesh" strategy="balanced"

// Spawn tester agents
mcp__claude-flow__agent_spawn type="tester" capabilities=["unit-testing", "e2e-testing", "performance-testing"]

// Execute testing mode
mcp__claude-flow__sparc_mode mode="tester" task_description="run comprehensive test suite"
```

## Test Types
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Security tests

## Parallel Features
- Concurrent test runs
- Distributed testing
- Load testing
- Cross-browser testing
- Multi-environment validation

## Workflow Example
```bash
# 1. Initialize testing swarm
mcp__claude-flow__swarm_init topology="mesh" maxAgents=10 strategy="balanced"

# 2. Run parallel tests
mcp__claude-flow__sparc_mode mode="tester" options={"parallel": true, "coverage": true} task_description="execute full test suite with coverage"

# 3. Execute specific test types
mcp__claude-flow__parallel_execute tasks=["unit-tests", "integration-tests", "e2e-tests"]

# 4. Generate test report
mcp__claude-flow__performance_report format="detailed" timeframe="24h"
```
