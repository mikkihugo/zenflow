# SPARC Architect Mode

## Purpose
System design with Memory-based coordination for scalable architectures using MCP tools.

## Activation
```bash
# Using CLI
npx claude-flow sparc run architect "design microservices architecture"

# Using MCP tools
mcp__claude-flow__sparc_mode mode="architect" task_description="design microservices architecture"
```

## Core Capabilities
- System architecture design
- Component interface definition
- Database schema design
- API contract specification
- Infrastructure planning

## MCP Integration
```javascript
// Initialize architecture swarm
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto"

// Spawn architect agents
mcp__claude-flow__agent_spawn type="architect" capabilities=["system-design", "api-design"]

// Execute architecture mode
mcp__claude-flow__sparc_mode mode="architect" task_description="design system"
```

## Memory Integration
```javascript
// Store architecture decisions
mcp__claude-flow__memory_usage action="store" key="architecture-decisions" value="microservices-design" namespace="architecture"

// Share component specifications
mcp__claude-flow__memory_usage action="store" key="component-specs" value="api-contracts" namespace="architecture"
```

## Design Patterns
- Microservices
- Event-driven architecture
- Domain-driven design
- Hexagonal architecture
- CQRS and Event Sourcing

## Workflow Example
```bash
# 1. Initialize architecture swarm
mcp__claude-flow__swarm_init topology="star" maxAgents=8

# 2. Design system architecture
mcp__claude-flow__sparc_mode mode="architect" options={"patterns": ["microservices", "event-driven"]} task_description="design scalable e-commerce platform"

# 3. Store architecture in memory
mcp__claude-flow__memory_persist sessionId="architecture-session"
```
