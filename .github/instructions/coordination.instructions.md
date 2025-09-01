# Coordination System Development Instructions

## Domain Focus

The coordination domain handles agent management, load balancing, distributed protocols, and multi-agent orchestration. This is the core of claude-code-zen's AI coordination capabilities.

## Key Subdirectories

```
src/coordination/
├── agents/          # Agent management, registry, lifecycle
├── load-balancing/  # Load distribution, resource allocation
├── maestro/         # High-level orchestration patterns
├── protocols/       # Communication and consensus protocols
└── strategies/      # Coordination strategies and algorithms
```

## Architecture Patterns

### Agent Management

- **Use existing AgentType** from coordination types (5 core types: coordinator, worker, specialist, monitor, proxy)
- **Follow registry patterns** in `src/coordination/agents/agent-registry.ts`
- **Respect agent capabilities** and specialization boundaries
- **Use agent pools** for efficient resource management

### Agent Coordination

- **Implement collective behavior** using established coordination patterns
- **Use consensus protocols** for distributed decision making
- **Follow load balancing** algorithms for task distribution
- **Maintain coordination health** through monitoring and recovery

## Testing Strategy - London TDD (Mockist)

Use London TDD for coordination code - focus on interactions between components:

```typescript
// Example: Test agent coordination interactions
describe('AgentCoordinator', () => {
  it('should distribute tasks to appropriate agents', async () => {
    const mockRegistry = { findAgents: jest.fn() };
    const mockLoadBalancer = { selectOptimal: jest.fn() };

    const coordinator = new AgentCoordinator(mockRegistry, mockLoadBalancer);
    await coordinator.distributeTask(task);

    expect(mockRegistry.findAgents).toHaveBeenCalledWith(task.requirements);
    expect(mockLoadBalancer.selectOptimal).toHaveBeenCalledWith(
      availableAgents
    );
  });
});
```

## Performance Requirements

### Coordination Efficiency

- **Sub-100ms coordination overhead** for agent selection
- **Concurrent task distribution** using async/await patterns
- **Efficient resource utilization** through pooling and caching
- **Real-time updates** via WebSocket connections

### Scalability Targets

- **1000+ concurrent agents** coordination capability
- **10,000+ tasks/minute** distribution capacity
- **<5ms average latency** for agent selection
- **99.9% uptime** for coordination services

## Common Patterns

### Agent Selection

```typescript
// Use existing agent selection patterns
const agents = await agentRegistry.findCapableAgents({
  type: requiredAgentType, // Use AgentType union
  capabilities: requiredSkills,
  maxLoadFactor: 0.8,
});

const selectedAgent = loadBalancer.selectOptimal(agents, task);
```

### Agent Orchestration

```typescript
// Follow established coordination patterns
const coordination = await coordinationManager.orchestrate({
  topology: 'hierarchical', // or 'mesh', 'ring', 'star'
  size: optimalSize,
  strategy: 'adaptive',
});

await coordination.executeCoordinatedTask(complexTask);
```

### Protocol Communication

```typescript
// Use established protocol patterns
const consensus = await consensusEngine.proposeDecision({
  proposal: taskDistribution,
  quorum: 0.67,
  timeout: 5000,
});
```

## Integration Points

### With Neural Domain

- **Coordinate neural training** across distributed agents
- **Balance computational load** for neural operations
- **Manage neural agent specialization** and capabilities

### With Interfaces Domain

- **Expose coordination APIs** through established interfaces
- **Provide MCP tools** for external coordination
- **Support real-time monitoring** via WebSocket APIs

### With Memory Domain

- **Coordinate memory access** across agents
- **Manage distributed caching** for coordination state
- **Persist coordination decisions** and outcomes

## Quality Standards

### Code Quality

- **Follow async/await patterns** for all coordination operations
- **Use established error handling** patterns from core domain
- **Implement proper logging** for coordination decisions
- **Add comprehensive metrics** for performance monitoring

### Testing Requirements

- **Mock external dependencies** (other domains, services)
- **Test interaction patterns** between coordination components
- **Validate protocol compliance** for communication
- **Benchmark coordination performance** against targets

### Documentation

- **Document coordination algorithms** and decision logic
- **Maintain API documentation** for coordination interfaces
- **Update coordination pattern documentation** for new strategies
- **Provide troubleshooting guides** for coordination issues

## Common Anti-Patterns to Avoid

- **Don't bypass agent registry** - always use established patterns
- **Don't create new agent types** - use existing 5 core types (coordinator, worker, specialist, monitor, proxy)
- **Don't implement synchronous coordination** - use async patterns
- **Don't ignore load balancing** - always consider resource distribution
- **Don't skip consensus** - use established protocols for decisions

## Monitoring and Debugging

- **Use coordination metrics** for performance monitoring
- **Implement health checks** for all coordination components
- **Log coordination decisions** with appropriate detail level
- **Provide debugging tools** for coordination state inspection

The coordination domain is critical for system performance and reliability. Maintain high standards and leverage the sophisticated patterns already established.
- **Log coordination decisions** with appropriate detail level
- **Provide debugging tools** for coordination state inspection

The coordination domain is critical for system performance and reliability. Maintain high standards and leverage the sophisticated patterns already established.
