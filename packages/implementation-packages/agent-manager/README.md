# @claude-zen/agent-manager

Basic agent lifecycle management and simple swarm coordination for the Claude Code Zen ecosystem.

## Overview

The Agent Manager package provides essential agent lifecycle management capabilities including registration, status tracking, task assignment, and basic coordination. It serves as the foundation for CLI tools, APIs, and simple coordination scenarios without the complexity of advanced methodology frameworks.

## Features

- 🤖 **Agent Lifecycle Management** - Complete agent registration, status tracking, and removal
- 📊 **Performance Monitoring** - Real-time metrics and performance tracking
- 🎯 **Intelligent Task Assignment** - Capability-based agent selection algorithms
- 🕸️ **Topology Support** - Multiple coordination patterns (mesh, hierarchical, ring, star)
- ⚡ **Event-Driven Architecture** - Real-time coordination and monitoring
- 🔄 **Fault Tolerance** - Graceful error handling and recovery
- 📈 **Scalability** - Supports 1000+ concurrent agents
- 🛡️ **Claude SDK Integration** - AI-driven coordination with fallback

## Installation

```bash
# Using pnpm (recommended)
pnpm add @claude-zen/agent-manager

# Using npm
npm install @claude-zen/agent-manager

# Using yarn
yarn add @claude-zen/agent-manager
```

## Quick Start

```typescript
import { AgentManager, createAgent } from '@claude-zen/agent-manager';

// Create and initialize agent manager
const manager = new AgentManager();
await manager.initialize({
  topology: 'mesh',
  maxAgents: 100
});

// Add agents with different capabilities
await manager.addAgent(createAgent('coder-001', 'coder', 'TYPESCRIPT_DEV'));
await manager.addAgent(createAgent('analyst-001', 'analyst', 'DATA_ANALYST'));

// Assign a task
const agentId = await manager.assignTask({
  id: 'build-component',
  type: 'development',
  requirements: ['typescript', 'react'],
  priority: 5
});

console.log(`Task assigned to agent: ${agentId}`);

// Monitor events
manager.on('task:completed', (event) => {
  console.log(`Task ${event.taskId} completed in ${event.duration}ms`);
});

// Get performance metrics
const metrics = manager.getMetrics();
console.log(`Active agents: ${metrics.activeAgents}/${metrics.agentCount}`);
```

## Agent Types

The package supports a comprehensive set of agent types:

### Development Agents
- `coder` - General development tasks
- `architect` - System architecture and design
- `fullstack-dev` - Full-stack development
- `frontend-dev` - Frontend specialization
- `api-dev` - API development

### Analysis Agents
- `analyst` - Data analysis and insights
- `researcher` - Research and investigation
- `security-analyzer` - Security analysis
- `performance-analyzer` - Performance optimization

### Operations Agents
- `ops` - General operations
- `devops-engineer` - DevOps and infrastructure
- `monitoring-ops` - System monitoring
- `deployment-ops` - Deployment management

### Testing Agents
- `tester` - General testing
- `unit-tester` - Unit test specialization
- `integration-tester` - Integration testing
- `e2e-tester` - End-to-end testing

## Coordination Topologies

Choose the optimal topology for your use case:

### Mesh Topology
```typescript
await manager.coordinateAgents(agents, 'mesh');
```
- **Best for**: Flexible, peer-to-peer coordination
- **Characteristics**: High resilience, distributed decision-making
- **Use cases**: Research tasks, collaborative development

### Hierarchical Topology
```typescript
await manager.coordinateAgents(agents, 'hierarchical');
```
- **Best for**: Organized workflows, clear command structure
- **Characteristics**: Centralized coordination, efficient resource allocation
- **Use cases**: Large projects, enterprise workflows

### Ring Topology
```typescript
await manager.coordinateAgents(agents, 'ring');
```
- **Best for**: Sequential processing, pipeline workflows
- **Characteristics**: Ordered execution, predictable flow
- **Use cases**: Data pipelines, CI/CD workflows

### Star Topology
```typescript
await manager.coordinateAgents(agents, 'star');
```
- **Best for**: Simple coordination, central control
- **Characteristics**: Single point of coordination, easy management
- **Use cases**: Small teams, simple task distribution

## Task Assignment

The agent manager uses sophisticated algorithms for optimal task assignment:

```typescript
// Assign task with specific requirements
const result = await manager.assignTask({
  id: 'analyze-performance',
  type: 'analysis',
  requirements: ['data-analysis', 'performance-metrics', 'visualization'],
  priority: 8 // High priority (1-10 scale)
});

if (result) {
  console.log(`Task assigned to agent: ${result}`);
} else {
  console.warn('No suitable agent available');
}
```

### Assignment Criteria
- **Capability Matching** - Agent capabilities must include all task requirements
- **Performance History** - Agents with better success rates preferred
- **Current Workload** - Idle agents prioritized over busy ones
- **Error Rates** - Agents with lower error rates selected
- **Response Times** - Faster agents preferred for time-sensitive tasks

## Performance Monitoring

Real-time metrics provide comprehensive system insights:

```typescript
const metrics = manager.getMetrics();

console.log(`
📊 Swarm Performance Report
├── Agents: ${metrics.activeAgents}/${metrics.agentCount} active
├── Tasks: ${metrics.completedTasks} completed
├── Avg Latency: ${metrics.averageLatency}ms
├── Efficiency: ${(metrics.coordinationEfficiency * 100).toFixed(1)}%
└── Uptime: ${(metrics.uptime / 1000 / 60).toFixed(1)} minutes
`);
```

### Available Metrics
- `agentCount` - Total registered agents
- `activeAgents` - Currently available agents
- `totalTasks` - All tasks assigned
- `completedTasks` - Successfully completed tasks
- `averageLatency` - Average response time
- `coordinationEfficiency` - Agent utilization rate
- `uptime` - System uptime in milliseconds

## Event System

The agent manager provides comprehensive event monitoring:

```typescript
// Agent lifecycle events
manager.on('agent:added', (event) => {
  console.log(`Agent ${event.agent.id} joined the swarm`);
});

manager.on('agent:removed', (event) => {
  console.log(`Agent ${event.agentId} left the swarm`);
});

// Task events
manager.on('task:assigned', (event) => {
  console.log(`Task ${event.task.id} assigned to ${event.agentId}`);
});

manager.on('task:completed', (event) => {
  console.log(`Task ${event.taskId} completed in ${event.duration}ms`);
});

// Coordination events
manager.on('coordination:performance', (metrics) => {
  console.log(`Coordination performance: ${metrics.successRate * 100}%`);
});

manager.on('coordination:error', (error) => {
  console.error(`Coordination error for agent ${error.agentId}:`, error.error);
});
```

## Configuration Options

Customize the agent manager for your specific needs:

```typescript
await manager.initialize({
  // Maximum number of agents
  maxAgents: 200,
  
  // Coordination topology
  topology: 'hierarchical',
  
  // Operation timeout (ms)
  timeout: 30000,
  
  // Health check interval (ms)
  healthCheckInterval: 10000,
  
  // Coordination strategy
  coordinationStrategy: 'adaptive'
});
```

## Preset Configurations

Use predefined configurations for common scenarios:

```typescript
import { createAgentManager } from '@claude-zen/agent-manager';

// Small team (up to 10 agents, star topology)
const smallManager = createAgentManager('small');

// Medium project (up to 50 agents, mesh topology)
const mediumManager = createAgentManager('medium');

// Large enterprise (up to 200 agents, hierarchical topology)
const largeManager = createAgentManager('large');

// Enterprise scale (up to 1000 agents, optimized settings)
const enterpriseManager = createAgentManager('enterprise');
```

## Capability Sets

Predefined capability sets for quick agent creation:

```typescript
import { createAgent, CAPABILITY_SETS } from '@claude-zen/agent-manager';

// Create agents with predefined capabilities
const typescriptDev = createAgent('dev-001', 'coder', 'TYPESCRIPT_DEV');
const reactDev = createAgent('frontend-001', 'frontend-dev', 'REACT_DEV');
const backendDev = createAgent('api-001', 'api-dev', 'BACKEND_DEV');
const fullstackDev = createAgent('fullstack-001', 'fullstack-dev', 'FULLSTACK_DEV');
const dataAnalyst = createAgent('analyst-001', 'analyst', 'DATA_ANALYST');
const devopsEngineer = createAgent('ops-001', 'devops-engineer', 'DEVOPS');

// Available capability sets:
console.log(CAPABILITY_SETS.TYPESCRIPT_DEV); // ['typescript', 'node', 'testing', 'debugging']
console.log(CAPABILITY_SETS.REACT_DEV); // ['react', 'javascript', 'jsx', 'css', 'html']
```

## Integration with Claude SDK

The agent manager integrates with Claude SDK for AI-driven coordination:

```typescript
// Coordination automatically uses Claude SDK for intelligent decision-making
const result = await manager.coordinateAgents(agents, 'hierarchical');

// Falls back to basic coordination if Claude SDK is unavailable
// Monitor coordination success through events
manager.on('coordination:success', (event) => {
  console.log(`AI coordination successful for ${event.agentId}`);
  console.log(`Insights: ${event.insights?.join(', ')}`);
});
```

## Error Handling

Robust error handling with graceful degradation:

```typescript
try {
  const result = await manager.coordinateAgents(agents, 'mesh');
  
  if (result.success) {
    console.log(`Coordination successful: ${result.successRate * 100}%`);
  } else {
    console.warn(`Coordination partially failed: ${result.successRate * 100}% success`);
    // Implement fallback strategy
  }
} catch (error) {
  console.error('Coordination failed:', error);
  // Handle critical errors
}

// Monitor errors through events
manager.on('coordination:error', (event) => {
  console.error(`Agent ${event.agentId} coordination failed:`, event.error);
  // Implement recovery logic
});
```

## Best Practices

### 1. Initialize Before Use
Always initialize the agent manager before adding agents or assigning tasks:

```typescript
const manager = new AgentManager();
await manager.initialize(); // Required!
```

### 2. Monitor Performance
Regularly check metrics to ensure optimal performance:

```typescript
setInterval(() => {
  const metrics = manager.getMetrics();
  if (metrics.coordinationEfficiency < 0.8) {
    console.warn('Low coordination efficiency detected');
  }
}, 30000);
```

### 3. Handle Events
Implement comprehensive event handling for better monitoring:

```typescript
manager.on('coordination:error', handleCoordinationError);
manager.on('task:completed', trackTaskCompletion);
manager.on('agent:added', logAgentJoined);
```

### 4. Graceful Shutdown
Always shutdown gracefully to prevent resource leaks:

```typescript
process.on('SIGINT', async () => {
  console.log('Shutting down agent manager...');
  await manager.shutdown();
  process.exit(0);
});
```

### 5. Use Appropriate Topology
Choose topology based on your coordination needs:
- **Mesh**: Research, collaborative work
- **Hierarchical**: Large projects, enterprise workflows
- **Ring**: Sequential processing, pipelines
- **Star**: Simple coordination, small teams

## API Reference

### AgentManager Class

#### Methods
- `initialize(config?)` - Initialize the agent manager
- `shutdown()` - Gracefully shutdown and cleanup
- `addAgent(agent)` - Register a new agent
- `removeAgent(agentId)` - Remove an agent
- `getAgent(agentId)` - Get agent by ID
- `getAgents()` - Get all agents
- `getActiveAgents()` - Get active agent IDs
- `assignTask(task)` - Assign task to best agent
- `completeTask(taskId, result)` - Mark task as completed
- `coordinateAgents(agents, topology?)` - Coordinate multiple agents
- `getMetrics()` - Get performance metrics
- `getState()` - Get current state
- `getSwarmId()` - Get unique swarm identifier
- `getAgentCount()` - Get total agent count
- `getTaskCount()` - Get active task count
- `getUptime()` - Get system uptime

#### Events
- `swarm:initialized` - Swarm initialization complete
- `swarm:shutdown` - Swarm shutdown complete
- `agent:added` - New agent registered
- `agent:removed` - Agent removed
- `task:assigned` - Task assigned to agent
- `task:completed` - Task completed by agent
- `coordination:performance` - Coordination metrics
- `coordination:error` - Coordination error
- `coordination:success` - Successful AI coordination

### Utility Functions
- `createAgent(id, type, category?)` - Create agent with predefined capabilities
- `createAgentManager(preset?)` - Create manager with preset configuration

## Dependencies

- `@claude-zen/foundation` - Core utilities and Claude SDK integration
- `node:events` - Node.js EventEmitter

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

- 📚 [Documentation](https://github.com/zen-neural/claude-code-zen)
- 🐛 [Issues](https://github.com/zen-neural/claude-code-zen/issues)
- 💬 [Discussions](https://github.com/zen-neural/claude-code-zen/discussions)