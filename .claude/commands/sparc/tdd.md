# SPARC TDD Mode

## Purpose
Test-driven development with TodoWrite planning and comprehensive testing using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run tdd "shopping cart feature"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="tdd" task_description="shopping cart feature"
```

## Core Capabilities
- Test-first development
- Red-green-refactor cycle
- Test suite design
- Coverage optimization
- Continuous testing

## MCP Integration
```javascript
// Initialize TDD swarm
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto"

// Spawn TDD agents
mcp__claude-flow__agent_spawn type="tester" capabilities=["unit-testing", "integration-testing"]
mcp__claude-flow__agent_spawn type="coder" capabilities=["implementation", "refactoring"]

// Execute TDD mode
mcp__claude-flow__sparc_mode mode="tdd" task_description="implement shopping cart"
```

## TDD Workflow
1. Write failing tests
2. Implement minimum code
3. Make tests pass
4. Refactor code
5. Repeat cycle

## Testing Strategies
- Unit testing
- Integration testing
- End-to-end testing
- Performance testing
- Security testing

## Workflow Example
```bash
# 1. Initialize TDD swarm
mcp__claude-flow__swarm_init topology="star" maxAgents=6

# 2. Create test plan
mcp__claude-flow__workflow_create name="tdd-cycle" steps=["write-tests", "implement", "refactor"]

# 3. Execute TDD cycle
mcp__claude-flow__sparc_mode mode="tdd" options={"coverage": "100%", "parallel-tests": true} task_description="implement user authentication with JWT"

# 4. Validate quality
mcp__claude-flow__quality_assess target="authentication" criteria=["test-coverage", "code-quality", "performance"]
```
