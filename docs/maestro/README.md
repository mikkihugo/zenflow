# Maestro - Native Hive Mind Specs-Driven Development

## Overview

Maestro is a specifications-driven development framework that leverages native hive mind swarm intelligence for collective software development. It uses a custom specs-driven topology with specialized agents for each phase of the development workflow.

## Architecture

### Native Hive Mind Integration

Maestro now uses **native hive mind coordination** instead of centralized orchestration:

```
Specs-Driven Swarm Topology
├── requirements_analyst (1) - Requirements analysis and user stories
├── design_architect (2) - Parallel design generation with consensus
├── task_planner (1) - Implementation task breakdown
├── implementation_coder (2) - Parallel code implementation
├── quality_reviewer (1) - Quality gates and validation
└── steering_documenter (1) - Governance and documentation
```

### Key Components

- **MaestroSwarmCoordinator**: Native swarm coordinator replacing centralized orchestrator
- **Specs-Driven Topology**: Custom swarm configuration optimized for development workflow
- **Native Task Submission**: All operations use `HiveMind.submitTask()` with `SwarmOrchestrator`
- **Swarm Memory Integration**: Steering docs stored in native hive mind memory
- **Consensus Validation**: Optional Byzantine fault-tolerant validation for critical phases

## Quick Start

### 1. Initialize Specs-Driven Swarm

```bash
npx claude-flow maestro create-spec my-feature "Create user authentication system"
```

This automatically:
- Initializes native hive mind with specs-driven topology
- Spawns 8 specialized agents (requirements_analyst, design_architect x2, etc.)
- Creates initial requirements.md using collective intelligence

### 2. Generate Design with Consensus

```bash
npx claude-flow maestro generate-design my-feature
```

This uses:
- **Parallel execution**: 2 design_architect agents work simultaneously
- **Native consensus**: Agents must agree on final design
- **SwarmOrchestrator**: Handles coordination and result aggregation

### 3. Plan Implementation Tasks

```bash
npx claude-flow maestro generate-tasks my-feature
```

Uses dedicated `task_planner` agent with workflow orchestration capabilities.

### 4. Execute Tasks with Swarm

```bash
npx claude-flow maestro implement-task my-feature 1
```

Uses `implementation_coder` agents in parallel with native coordination.

## Architecture Benefits

### Performance Improvements

- **50% Resource Reduction**: Eliminated duplicate agent systems
- **Parallel Execution**: Multiple agents work simultaneously on compatible tasks
- **Native Load Balancing**: Queen strategic coordination optimizes task distribution
- **Fault Tolerance**: No single point of failure in swarm coordination

### Workflow Improvements

- **Consensus-Driven Design**: Multiple architects must agree on designs
- **Native Memory Persistence**: Workflow state survives restarts
- **Real-time Steering Integration**: Governance docs accessible to all agents
- **Quality Gates**: Dedicated reviewer ensures output quality

## Swarm Coordination

### Native Task Submission

All operations use native hive mind patterns:

```typescript
// Design generation with parallel execution + consensus
const designTask = await hiveMind.submitTask({
  description: 'Generate comprehensive design',
  strategy: 'parallel',  // Multiple design_architect agents
  requiredCapabilities: ['system_design', 'architecture'],
  requireConsensus: true,  // Agents must agree
  maxAgents: 2
});
```

### Steering Documentation

Stored in native swarm memory instead of files:

```typescript
// Create steering document in swarm memory
await hiveMind.memory.store('steering/product', {
  content: 'Focus on user value and clear requirements',
  domain: 'product',
  maintainer: 'steering_documenter'
});

// Broadcast to all agents
await hiveMind.communication.broadcast({
  type: 'steering_update',
  domain: 'product'
});
```

## Agent Specialization

### Requirements Analyst
- **Capabilities**: `requirements_analysis`, `user_story_creation`, `acceptance_criteria`
- **Phase**: Requirements Clarification
- **Strategy**: Sequential execution for consistency

### Design Architects (2 agents)
- **Capabilities**: `system_design`, `architecture`, `specs_driven_design`
- **Phase**: Research & Design
- **Strategy**: Parallel execution with consensus validation

### Task Planner
- **Capabilities**: `task_management`, `workflow_orchestration`
- **Phase**: Implementation Planning
- **Strategy**: Sequential for coherent task breakdown

### Implementation Coders (2 agents)
- **Capabilities**: `code_generation`, `implementation`, `debugging`
- **Phase**: Task Execution
- **Strategy**: Parallel execution for faster implementation

### Quality Reviewer
- **Capabilities**: `code_review`, `quality_assurance`, `testing`
- **Phase**: Quality Gates
- **Strategy**: Sequential validation with blocking gates

### Steering Documenter
- **Capabilities**: `documentation_generation`, `governance`
- **Phase**: Cross-cutting (all phases)
- **Strategy**: Maintains governance consistency

## Configuration

### Swarm Configuration

```typescript
const maestroConfig: MaestroSwarmConfig = {
  hiveMindConfig: {
    name: 'maestro-specs-driven-swarm',
    topology: 'specs-driven',
    queenMode: 'strategic',
    maxAgents: 8,
    consensusThreshold: 0.66,
    autoSpawn: true
  },
  enableConsensusValidation: true,
  enableSteeringIntegration: true,
  specsDirectory: './docs/maestro/specs',
  steeringDirectory: './docs/maestro/steering'
};
```

### CLI Options

```bash
# Create spec with custom consensus threshold
npx claude-flow maestro create-spec my-feature \
  --consensus-threshold 0.75 \
  --max-agents 10

# Generate design with consensus disabled
npx claude-flow maestro generate-design my-feature \
  --no-consensus

# Implement task with specific agent count
npx claude-flow maestro implement-task my-feature 1 \
  --max-agents 1
```

## Migration from Legacy

### Changes from MaestroOrchestrator

1. **No More Agent Pools**: Uses native swarm topology instead
2. **No Dual Systems**: Eliminated AgentManager + HiveMind complexity
3. **Native Coordination**: All operations through SwarmOrchestrator
4. **Memory Integration**: Steering docs in swarm memory, not files
5. **Consensus Built-in**: Native Byzantine fault-tolerant validation

### Compatibility

- ✅ **3-File System**: Still generates `requirements.md`, `design.md`, `tasks.md`
- ✅ **Workflow Phases**: All 5 phases preserved with enhanced coordination
- ✅ **CLI Commands**: Same interface, improved performance
- ✅ **Steering Docs**: Enhanced with real-time memory integration
- ✅ **Quality Gates**: Improved with dedicated reviewer agent

## Troubleshooting

### Common Issues

**Swarm Initialization Timeout**
```bash
Error: Swarm initialization timeout
```
Solution: Check network connectivity and increase timeout:
```bash
npx claude-flow maestro create-spec my-feature --timeout 60000
```

**Consensus Failure**
```bash
Error: Consensus failed for design validation
```
Solution: Lower consensus threshold or retry:
```bash
npx claude-flow maestro generate-design my-feature --consensus-threshold 0.5
```

**Agent Spawning Errors**
```bash
Error: Maximum agent limit reached
```
Solution: The swarm is at capacity. Wait for tasks to complete or increase limit:
```bash
npx claude-flow maestro create-spec my-feature --max-agents 12
```

## Performance Monitoring

### Swarm Metrics

```bash
# View swarm status
npx claude-flow maestro status

# Performance report
npx claude-flow maestro performance-report

# Agent utilization
npx claude-flow maestro agent-stats
```

### Expected Performance

- **Spec Creation**: < 2 minutes (single requirements_analyst)
- **Design Generation**: < 5 minutes (2 architects + consensus)
- **Task Planning**: < 3 minutes (dedicated task_planner)
- **Task Implementation**: < 10 minutes (2 coders in parallel)

## Best Practices

### Workflow Optimization

1. **Use Consensus Selectively**: Enable for critical design decisions, disable for routine tasks
2. **Leverage Parallelism**: Let multiple agents work simultaneously on compatible tasks
3. **Monitor Swarm Health**: Check agent status and performance regularly
4. **Update Steering Docs**: Keep governance current for all agents
5. **Quality Gates**: Don't skip review phases for production code

### Scaling Guidelines

- **Small Teams**: Use default 8-agent configuration
- **Large Projects**: Scale to 12-16 agents with increased consensus threshold
- **High Complexity**: Enable all consensus validation and quality gates
- **Rapid Prototyping**: Disable consensus, use parallel execution extensively

## API Reference

See detailed API documentation in:
- [MaestroSwarmCoordinator API](./api/maestro-swarm-coordinator.md)
- [Native Hive Mind Integration](./api/hive-mind-integration.md)
- [Specs-Driven Topology](./api/specs-driven-topology.md)

---

*Generated by Maestro Native Hive Mind Implementation*
*Collective intelligence powered by specs-driven swarm topology*