# SPARC Reviewer Mode

## Purpose
Code review using batch file analysis for comprehensive reviews using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run reviewer "review pull request #123"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="reviewer" task_description="review pull request #123"
```

## Core Capabilities
- Code quality assessment
- Security review
- Performance analysis
- Best practices check
- Documentation review

## MCP Integration
```javascript
// Initialize review swarm
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto"

// Spawn reviewer agents
mcp__claude-flow__agent_spawn type="reviewer" capabilities=["code-quality", "security-analysis"]

// Execute review mode
mcp__claude-flow__sparc_mode mode="reviewer" task_description="review codebase"
```

## Review Criteria
- Code correctness
- Design patterns
- Error handling
- Test coverage
- Maintainability

## Batch Analysis
- Parallel file review
- Pattern detection
- Dependency checking
- Consistency validation
- Automated reporting

## Workflow Example
```bash
# 1. Initialize review swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=6

# 2. Perform code review
mcp__claude-flow__sparc_mode mode="reviewer" options={"depth": "comprehensive", "security": true} task_description="review authentication module"

# 3. GitHub integration
mcp__claude-flow__github_code_review repo="owner/repo" pr=123

# 4. Quality assessment
mcp__claude-flow__quality_assess target="pull-request-123" criteria=["code-quality", "security", "performance"]
```
