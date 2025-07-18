# SPARC Workflow Manager Mode

## Purpose
Process automation with TodoWrite planning and Task execution using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run workflow-manager "automate deployment"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="workflow-manager" task_description="automate deployment"
```

## Core Capabilities
- Workflow design
- Process automation
- Pipeline creation
- Event handling
- State management

## MCP Integration
```javascript
// Initialize workflow swarm
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto"

// Create workflow
mcp__claude-flow__workflow_create name="deployment-pipeline" steps=["build", "test", "deploy"] triggers=["push", "merge"]

// Execute workflow
mcp__claude-flow__workflow_execute workflowId="deployment-pipeline" params={"branch": "main"}
```

## Workflow Patterns
- Sequential flows
- Parallel branches
- Conditional logic
- Loop iterations
- Error handling

## Automation Features
- Trigger management
- Task scheduling
- Progress tracking
- Result validation
- Rollback capability

## Workflow Example
```bash
# 1. Initialize workflow swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=8

# 2. Design automation workflow
mcp__claude-flow__sparc_mode mode="workflow-manager" options={"automation": true} task_description="create CI/CD pipeline"

# 3. Setup automation
mcp__claude-flow__automation_setup rules=[{"trigger": "commit", "action": "test"}, {"trigger": "merge", "action": "deploy"}]

# 4. Create pipeline
mcp__claude-flow__pipeline_create config={"stages": ["lint", "test", "build", "deploy"]}
```
