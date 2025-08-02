# claude-code-zen - Development Instructions

## Project Overview
Advanced AI development platform with sophisticated agent coordination, neural networks, and MCP integration

**Mission**: Enable autonomous AI-driven development through comprehensive agent coordination and intelligent tooling

## Architecture
- **Pattern**: domain-driven
- **Principles**: SOLID, 
Clean Architecture, 
Domain Boundaries, 
Performance Optimization, 

## Key Technologies

- **Backend**: TypeScript with Node.js 20+
- **Package Manager**: npm



- **Frontend**: React with TypeScript



- **Neural Acceleration**: Rust/WASM with fact-core
- **Performance Rule**: always_use_wasm_for_heavy_computation


## Agent System
- **Total Agent Types**: 147+ across 16 categories
- **Specialization**: fine-grained task assignment
- **Coordination**: Advanced swarm intelligence patterns

## Domain Structure
```
src/
├── coordination/

├── neural/

├── interfaces/

├── memory/

├── database/

├── core/

├── intelligence/

├── workflows/

```

## Testing Strategy
- **Approach**: hybrid-tdd
- **London TDD**: 70% (interactions, protocols, coordination)
- **Classical TDD**: 30% (algorithms, neural networks, computations)
- **Coverage Target**: 85%

## MCP Integration
- **HTTP MCP**: Port 3000 for external tool integration

- **Stdio MCP**: Internal swarm coordination protocol


## Performance Requirements

- coordination_latency < 100ms


- neural_computation_uses_wasm


- api_response < 50ms


- concurrent_agents > 1000


- mcp_tool_execution < 10ms


## Development Guidelines

### Architectural Constraints

- Use existing 147 agent types, don't create generic implementations


- Follow domain-driven structure in src/


- Use WASM for performance-critical neural computations


- Maintain hybrid TDD approach (70% London, 30% Classical)


- Respect MCP protocol patterns for tool integration


### Performance Requirements

- Sub-100ms coordination overhead


- WASM acceleration for neural operations


- Efficient resource utilization through pooling


- Real-time updates via WebSocket connections


## Build Commands
```bash
npm ci

npm run build

npm test

npm run lint

npm run mcp:start

```

## Memory System
- **Backends**: sqlite, 
lancedb, 
json, 
- **Features**: Connection pooling, multi-backend abstraction, caching


## WASM Integration
- **Rust Core**: fact-core
- **Performance**: Always use WASM for heavy neural computations
- **Bindings**: JavaScript/WASM bridge with proper memory management


## Validation Rules

- **domain_boundaries**: Ensure coordination code doesn't mix with neural code


- **agent_type_usage**: Use existing AgentType union, don't create generic types


- **wasm_performance**: Use WASM for computational tasks in neural domain


- **testing_strategy**: Follow hybrid TDD approach


This is a sophisticated, production-grade AI platform. Maintain high standards and leverage the comprehensive systems already in place.