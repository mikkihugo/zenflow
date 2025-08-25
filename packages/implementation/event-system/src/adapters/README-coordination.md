# Coordination Event Adapter - UEL Integration

## Overview

The CoordinationEventAdapter is Agent 3's contribution to the Unified Event Layer (UEL), providing comprehensive event management for coordination-related activities throughout the Claude-Zen system. Following the exact patterns established by Agent 1 (core interfaces) and Agent 2 (system events), this adapter unifies scattered EventEmitter patterns across the coordination domain.

## Purpose

The coordination system in Claude-Zen has complex event patterns across multiple components:
- **Swarm Coordination**: Lifecycle, topology, performance, and health events
- **Agent Management**: Agent lifecycle, registry, health, and communication events  
- **Task Orchestration**: Task distribution, execution, completion, and failure events
- **Protocol Management**: Inter-swarm communication, topology changes, lifecycle events

Before this adapter, these events were managed through scattered EventEmitter instances with inconsistent patterns, making it difficult to:
- Monitor coordination health across the system
- Correlate related coordination events
- Implement unified performance tracking
- Provide consistent error handling and recovery

## Architecture

### Core Integration Pattern

```typescript
// Before: Scattered EventEmitter patterns
swarmCoordinator.on('swarm:initialized', handler);
agentManager.on('agent:created', handler);
orchestrator.on('taskCompleted', handler);

// After: Unified UEL coordination events
coordinationAdapter.subscribeSwarmLifecycleEvents(handler);
coordinationAdapter.subscribeAgentManagementEvents(handler);
coordinationAdapter.subscribeTaskOrchestrationEvents(handler);
```

### Event Unification

The adapter wraps and unifies these coordination components:

1. **SwarmCoordinator** - Swarm lifecycle and topology management
2. **SPARCSwarmCoordinator** - SPARC methodology coordination
3. **AgentManager** - Agent lifecycle and health management
4. **Orchestrator** - Task distribution and execution
5. **SessionManager** - Session state and persistence
6. **TaskDistributionEngine** - Task assignment optimization
7. **TopologyManager** - Network topology management
8. **AgentLifecycleManager** - Agent state transitions
9. **CommunicationProtocols** - Inter-agent communication

### Key Features

#### 1. Event Correlation
```typescript
// Automatic correlation of related coordination events
coordinationAdapter.config.coordination = {
  enabled: true,
  correlationPatterns: [
    'coordination:swarm->coordination:agent',
    'coordination:task->coordination:agent',
    'coordination:topology->coordination:swarm'
  ]
};
```

#### 2. Health Monitoring
```typescript
// Component-specific health thresholds
const healthStatus = await coordinationAdapter.getCoordinationHealthStatus();
// Returns health for swarm coordinators, agent managers, orchestrators
```

#### 3. Performance Tracking
```typescript
// Coordination-specific metrics
const swarmMetrics = coordinationAdapter.getSwarmMetrics('swarm-id');
const agentMetrics = coordinationAdapter.getAgentMetrics('agent-id');
const taskMetrics = coordinationAdapter.getTaskMetrics('task-id');
```

#### 4. Swarm Optimization
```typescript
// Automatic performance optimization
coordinationAdapter.config.swarmOptimization = {
  enabled: true,
  performanceThresholds: {
    latency: 50,    // ms
    throughput: 200, // ops/sec
    reliability: 0.98
  }
};
```

## Factory Integration

The CoordinationEventManagerFactory provides specialized configurations:

### Swarm-Only Configuration
```typescript
const swarmAdapter = await createSwarmCoordinationEventManager('swarm-events');
// Only swarm lifecycle and topology events
```

### Agent-Only Configuration  
```typescript
const agentAdapter = await createAgentManagementEventManager('agent-events');
// Only agent lifecycle and health events
```

### Task-Only Configuration
```typescript
const taskAdapter = await createTaskOrchestrationEventManager('task-events');
// Only task distribution and execution events
```

### Comprehensive Configuration
```typescript
const comprehensiveAdapter = await createComprehensiveCoordinationEventManager();
// All coordination events with full monitoring
```

### High-Performance Configuration
```typescript
const performanceAdapter = await createHighPerformanceCoordinationEventManager();
// Optimized for production workloads with minimal overhead
```

### Development Configuration
```typescript
const devAdapter = await createDevelopmentCoordinationEventManager();
// Enhanced debugging with detailed correlation and metrics
```

## Usage Examples

### Basic Coordination Monitoring

```typescript
import { createCoordinationEventManager } from './coordination-event-adapter';

const adapter = await createCoordinationEventManager('main-coordination');
await adapter.start();

// Subscribe to all coordination events
adapter.subscribeSwarmLifecycleEvents((event) => {
  console.log(`Swarm ${event.operation}: ${event.targetId}`);
});

adapter.subscribeAgentManagementEvents((event) => {
  console.log(`Agent ${event.operation}: ${event.targetId}`);
});

adapter.subscribeTaskOrchestrationEvents((event) => {
  console.log(`Task ${event.operation}: ${event.targetId}`);
});
```

### Event Correlation Tracking

```typescript
// Track related coordination events
const correlatedEvents = adapter.getCoordinationCorrelatedEvents('correlation-id');
console.log('Related events:', correlatedEvents?.events.length);

// Monitor active correlations
const activeCorrelations = adapter.getActiveCoordinationCorrelations();
activeCorrelations.forEach(correlation => {
  console.log(`Correlation ${correlation.correlationId}: ${correlation.events.length} events`);
});
```

### Health and Performance Monitoring

```typescript
// Check coordination health
const healthStatus = await adapter.getCoordinationHealthStatus();
Object.entries(healthStatus).forEach(([component, health]) => {
  console.log(`${component}: ${health.status} (${health.reliability * 100}% reliable)`);
});

// Get performance metrics
const metrics = await adapter.getMetrics();
console.log(`Coordination Events: ${metrics.eventsProcessed}`);
console.log(`Average Latency: ${metrics.averageLatency}ms`);
console.log(`Throughput: ${metrics.throughput} events/sec`);
```

### Event Emission with Helpers

```typescript
import { CoordinationEventHelpers } from './coordination-event-adapter';

// Emit swarm initialization
await adapter.emitSwarmCoordinationEvent(
  CoordinationEventHelpers.createSwarmInitEvent('new-swarm', 'mesh', {
    agentCount: 8
  })
);

// Emit agent spawn
await adapter.emitSwarmCoordinationEvent(
  CoordinationEventHelpers.createAgentSpawnEvent('agent-1', 'new-swarm', {
    capabilities: ['research', 'analysis']
  })
);

// Emit task distribution
await adapter.emitSwarmCoordinationEvent(
  CoordinationEventHelpers.createTaskDistributionEvent('task-1', ['agent-1', 'agent-2'])
);
```

## Integration with UEL System

### Factory Registration

```typescript
// The CoordinationEventManagerFactory is automatically registered with UELFactory
const uelFactory = new UELFactory(logger, config);
const coordinationManager = await uelFactory.createCoordinationEventManager('coordination');
```

### Cross-Domain Event Correlation

```typescript
// Coordination events can correlate with system events
const systemAdapter = await uelFactory.createSystemEventManager('system');
const coordinationAdapter = await uelFactory.createCoordinationEventManager('coordination');

// Both adapters can share correlation IDs for cross-domain event tracking
```

### Unified Monitoring

```typescript
// Health check across all UEL adapters
const allStatuses = await uelFactory.healthCheckAll();
const coordinationStatus = allStatuses.find(s => s.type === 'coordination');
console.log('Coordination Health:', coordinationStatus?.status);
```

## Event Types and Operations

### Coordination Event Types
- `coordination:swarm` - Swarm lifecycle and management
- `coordination:agent` - Agent management and health  
- `coordination:task` - Task distribution and execution
- `coordination:topology` - Network topology changes

### Operations
- `init` - Initialize/create operations
- `spawn` - Create new entities (agents, tasks)
- `destroy` - Remove/cleanup operations
- `coordinate` - Coordination and synchronization
- `distribute` - Task/resource distribution
- `complete` - Successful completion
- `fail` - Error or failure events

## Configuration Options

### Swarm Coordination
```typescript
swarmCoordination: {
  enabled: true,
  wrapLifecycleEvents: true,
  wrapPerformanceEvents: true,
  wrapTopologyEvents: true,
  wrapHealthEvents: true,
  coordinators: ['default', 'sparc', 'hierarchical']
}
```

### Agent Management
```typescript
agentManagement: {
  enabled: true,
  wrapAgentEvents: true,
  wrapHealthEvents: true,
  wrapRegistryEvents: true,
  wrapLifecycleEvents: true
}
```

### Performance Optimization
```typescript
performance: {
  enableSwarmCorrelation: true,
  enableAgentTracking: true,
  enableTaskMetrics: true,
  maxConcurrentCoordinations: 100,
  coordinationTimeout: 30000,
  enablePerformanceTracking: true
}
```

## Testing Strategy

Following the hybrid TDD approach (70% London + 30% Classical):

### London TDD (Mockist) - 70%
- Event subscription and emission interactions
- Component wrapper verification
- Factory integration testing
- Error handling and edge cases

### Classical TDD (Detroit) - 30%
- Event correlation algorithms
- Performance metric calculations
- Health monitoring computations
- Actual coordination latency measurements

## Benefits

1. **Unified Interface**: Single API for all coordination events across the system
2. **Event Correlation**: Automatic tracking of related coordination workflows
3. **Performance Monitoring**: Detailed metrics and optimization capabilities
4. **Health Tracking**: Component-specific health monitoring and auto-recovery
5. **Consistent Patterns**: Same interface as system events, following UEL standards
6. **Backward Compatibility**: Existing EventEmitter patterns continue to work
7. **Type Safety**: Full TypeScript support with proper event typing
8. **Flexible Configuration**: Multiple specialized configurations for different use cases

## Future Enhancements

1. **Real-time Dashboard**: Web interface for coordination monitoring
2. **Alerting Integration**: Webhook/notification support for critical events
3. **Machine Learning**: Pattern recognition for coordination optimization
4. **Distributed Events**: Support for cross-node coordination events
5. **Performance Prediction**: Predictive analytics for coordination bottlenecks

## Conclusion

The CoordinationEventAdapter completes the coordination domain integration with UEL, providing a robust, performant, and feature-rich event management system. It follows the established patterns while adding coordination-specific capabilities like swarm optimization, agent health monitoring, and task correlation tracking.

This adapter enables sophisticated coordination monitoring and optimization while maintaining backward compatibility and following the unified architecture patterns established by the UEL system.