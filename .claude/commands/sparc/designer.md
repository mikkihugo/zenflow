# SPARC Designer Mode

## Purpose
UI/UX design with Memory coordination for consistent experiences using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run designer "create dashboard UI"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="designer" task_description="create dashboard UI"
```

## Core Capabilities
- Interface design
- Component architecture
- Design system creation
- Accessibility planning
- Responsive layouts

## MCP Integration
```javascript
// Initialize design swarm
mcp__claude-flow__swarm_init topology="star" strategy="auto"

// Spawn designer agents
mcp__claude-flow__agent_spawn type="specialist" capabilities=["ui-design", "ux-research"]

// Execute design mode
mcp__claude-flow__sparc_mode mode="designer" task_description="design responsive dashboard"
```

## Design Process
- User research insights
- Wireframe creation
- Component design
- Interaction patterns
- Design token management

## Memory Coordination
- Store design decisions
- Share component specs
- Maintain consistency
- Track design evolution

## Workflow Example
```bash
# 1. Initialize design swarm
mcp__claude-flow__swarm_init topology="star" maxAgents=5

# 2. Create design system
mcp__claude-flow__sparc_mode mode="designer" options={"system": true, "responsive": true} task_description="create comprehensive design system"

# 3. Store design tokens
mcp__claude-flow__memory_usage action="store" key="design-tokens" value="color-typography-spacing" namespace="design"

# 4. Share across teams
mcp__claude-flow__memory_sync target="frontend-team"
```
