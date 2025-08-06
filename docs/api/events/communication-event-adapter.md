# Communication Event Adapter

The **Communication Event Adapter** is part of the Unified Event Layer (UEL) system, providing a unified interface for managing communication-related events across Claude-Zen's communication infrastructure.

## Overview

The Communication Event Adapter unifies scattered EventEmitter patterns from:
- **WebSocket Communication** - Connection lifecycle, message routing, health monitoring
- **MCP Protocol Events** - Tool execution, protocol validation, external integration  
- **HTTP Communication** - Request/response handling, timeout management, retry logic
- **Protocol Management** - Multi-protocol coordination, switching, optimization

## Key Features

- 🔌 **WebSocket Integration** - Connection lifecycle and message routing events
- 🔧 **MCP Protocol Support** - Tool execution and protocol compliance tracking
- 🌐 **HTTP Communication** - Request/response monitoring and retry management
- 🔀 **Protocol Coordination** - Multi-protocol message routing and optimization
- 📊 **Performance Monitoring** - Communication metrics and latency tracking
- 🔗 **Event Correlation** - Cross-protocol event relationship tracking
- 🏥 **Health Monitoring** - Connection health and auto-recovery capabilities
- ⚡ **Real-time Optimization** - Dynamic protocol switching and performance tuning

## Quick Start

```typescript
import { 
  CommunicationEventAdapter, 
  createDefaultCommunicationEventAdapterConfig 
} from '@/interfaces/events/adapters/communication-event-adapter';

// Create adapter with default configuration
const config = createDefaultCommunicationEventAdapterConfig('my-comm-adapter');
const adapter = new CommunicationEventAdapter(config);

// Start the adapter
await adapter.start();

// Subscribe to WebSocket events
adapter.subscribeWebSocketCommunicationEvents((event) => {
  console.log('WebSocket event:', event.operation, event.details);
});

// Subscribe to MCP protocol events
adapter.subscribeMCPProtocolEvents((event) => {
  console.log('MCP event:', event.details?.toolName, event.details?.statusCode);
});

// Emit a communication event
await adapter.emitWebSocketCommunicationEvent({
  source: 'websocket-client',
  type: 'communication:websocket',
  operation: 'connect',
  protocol: 'ws',
  endpoint: 'ws://localhost:8080',
  details: {
    connectionId: 'conn-123',
    clientName: 'main-client'
  }
});
```

## Configuration

### Basic Configuration

```typescript
const config = createDefaultCommunicationEventAdapterConfig('comm-adapter', {
  // Enable/disable communication types
  websocketCommunication: {
    enabled: true,
    wrapConnectionEvents: true,
    wrapMessageEvents: true,
    wrapHealthEvents: true,
    clients: ['websocket-client']
  },
  
  mcpProtocol: {
    enabled: true,
    wrapServerEvents: true,
    wrapToolEvents: true,
    servers: ['http-mcp-server']
  },
  
  httpCommunication: {
    enabled: true,
    wrapRequestEvents: true,
    wrapTimeoutEvents: true
  },
  
  protocolCommunication: {
    enabled: true,
    wrapRoutingEvents: true,
    protocols: ['http', 'ws', 'stdio']
  }
});
```

### Performance Optimization

```typescript
const config = createDefaultCommunicationEventAdapterConfig('high-perf', {
  performance: {
    enableConnectionCorrelation: true,
    enableMessageTracking: true,
    maxConcurrentConnections: 2000,
    connectionTimeout: 30000
  },
  
  communicationOptimization: {
    enabled: true,
    optimizationInterval: 30000,
    performanceThresholds: {
      latency: 50,      // ms
      throughput: 1000, // ops/sec
      reliability: 0.99
    },
    connectionPooling: true,
    messageCompression: true
  }
});
```

### Event Correlation

```typescript
const config = createDefaultCommunicationEventAdapterConfig('corr-adapter', {
  communication: {
    enabled: true,
    strategy: 'websocket',
    correlationTTL: 300000, // 5 minutes
    correlationPatterns: [
      'communication:websocket->communication:mcp',
      'communication:http->communication:mcp'
    ],
    trackMessageFlow: true,
    trackConnectionHealth: true
  }
});
```

## Factory Usage

The Communication Event Factory provides convenient methods for creating specialized adapters:

```typescript
import { 
  CommunicationEventFactory,
  createWebSocketCommunicationAdapter,
  createMCPCommunicationAdapter,
  createComprehensiveCommunicationAdapter
} from '@/interfaces/events/adapters/communication-event-factory';

const factory = new CommunicationEventFactory();

// Create WebSocket-focused adapter
const wsAdapter = await factory.createWebSocketAdapter('websocket-only');

// Create MCP-focused adapter  
const mcpAdapter = await factory.createMCPAdapter('mcp-only');

// Create comprehensive adapter (all communication types)
const comprehensiveAdapter = await factory.createComprehensiveAdapter('all-comms');

// Get health summary
const healthSummary = await factory.getCommunicationHealthSummary();
console.log(`${healthSummary.healthyAdapters}/${healthSummary.totalAdapters} adapters healthy`);
```

## Event Types

### WebSocket Events

```typescript
// Connection lifecycle
await adapter.emitWebSocketCommunicationEvent({
  source: 'websocket-client',
  type: 'communication:websocket',
  operation: 'connect',
  protocol: 'ws',
  endpoint: 'ws://localhost:8080',
  details: {
    connectionId: 'conn-123',
    reconnectAttempt: 0
  }
});

// Message events
await adapter.emitWebSocketCommunicationEvent({
  source: 'websocket-client', 
  type: 'communication:websocket',
  operation: 'send',
  protocol: 'ws',
  endpoint: 'ws://localhost:8080',
  details: {
    messageId: 'msg-456',
    messageType: 'text',
    dataSize: 1024
  }
});
```

### MCP Protocol Events

```typescript
// Tool execution
await adapter.emitMCPProtocolEvent({
  source: 'mcp-server',
  type: 'communication:mcp', 
  operation: 'send',
  protocol: 'http',
  endpoint: '/tools/system_info',
  details: {
    toolName: 'system_info',
    requestId: 'req-789',
    statusCode: 200,
    responseTime: 150
  }
});

// Protocol errors
await adapter.emitMCPProtocolEvent({
  source: 'mcp-client',
  type: 'communication:mcp',
  operation: 'error',
  protocol: 'stdio',
  endpoint: '/tools/failing_tool',
  priority: 'high',
  details: {
    toolName: 'failing_tool',
    errorCode: 'TOOL_EXECUTION_FAILED',
    errorMessage: 'Tool execution timeout'
  }
});
```

## Health Monitoring

```typescript
// Perform health check
const healthStatus = await adapter.healthCheck();
console.log(`Adapter status: ${healthStatus.status}`);
console.log(`Error rate: ${(healthStatus.errorRate * 100).toFixed(2)}%`);

// Get component health details
const componentHealth = await adapter.performCommunicationHealthCheck();
for (const [component, health] of Object.entries(componentHealth)) {
  console.log(`${component}: ${health.status} (${health.reliability * 100}% reliable)`);
}

// Monitor connection health
const connectionHealth = await adapter.getCommunicationHealthStatus();
for (const [component, health] of Object.entries(connectionHealth)) {
  console.log(`${component}: ${health.communicationLatency}ms latency`);
}
```

## Event Correlation

```typescript
// Events with same correlationId are automatically correlated
const correlationId = 'user-action-123';

await adapter.emitWebSocketCommunicationEvent({
  source: 'websocket-client',
  type: 'communication:websocket', 
  operation: 'connect',
  protocol: 'ws',
  correlationId,
  // ... other fields
});

await adapter.emitMCPProtocolEvent({
  source: 'mcp-server',
  type: 'communication:mcp',
  operation: 'send', 
  protocol: 'http',
  correlationId,
  // ... other fields
});

// Retrieve correlated events
const correlation = adapter.getCommunicationCorrelatedEvents(correlationId);
console.log(`Found ${correlation?.events.length} correlated events`);
console.log(`Communication efficiency: ${correlation?.performance.communicationEfficiency}`);
```

## Performance Metrics

```typescript
// Get adapter metrics
const metrics = await adapter.getMetrics();
console.log(`Processed ${metrics.eventsProcessed} events`);
console.log(`Average latency: ${metrics.averageLatency}ms`);
console.log(`Throughput: ${metrics.throughput} events/sec`);

// Get connection-specific metrics
const connectionMetrics = adapter.getConnectionMetrics('conn-123');
console.log(`Connection events: ${connectionMetrics.eventCount}`);

// Get protocol-specific metrics  
const protocolMetrics = adapter.getProtocolMetrics('ws');
console.log(`WebSocket events: ${protocolMetrics.eventCount}`);
```

## Helper Functions

```typescript
import { CommunicationEventHelpers } from './communication-event-adapter';

// Create WebSocket connection event
const wsEvent = CommunicationEventHelpers.createWebSocketConnectionEvent(
  'conn-123',
  'ws://localhost:8080',
  { clientVersion: '1.0.0' }
);

// Create MCP tool execution event
const mcpEvent = CommunicationEventHelpers.createMCPToolExecutionEvent(
  'system_info', 
  'req-456',
  { timeout: 30000 }
);

// Create HTTP request event
const httpEvent = CommunicationEventHelpers.createHTTPRequestEvent(
  'GET',
  'https://api.example.com/data',
  { headers: { 'User-Agent': 'Claude-Zen' } }
);

// Create protocol switching event
const switchEvent = CommunicationEventHelpers.createProtocolSwitchingEvent(
  'http',
  'ws', 
  { reason: 'real-time-requirements' }
);
```

## Integration with UEL

The Communication Event Adapter integrates seamlessly with the broader UEL system:

```typescript
import { uel } from '@/interfaces/events';

// Initialize UEL and create communication adapter
await uel.initialize();
const adapter = await uel.createCommunicationEventAdapter('main-comm');

// The adapter is automatically registered and managed by UEL
const allAdapters = uel.getEventManagersByType('communication');
console.log(`Found ${allAdapters.length} communication adapters`);
```

## Best Practices

1. **Enable Appropriate Communication Types**: Only enable the communication types you actually use to reduce overhead.

2. **Use Event Correlation**: Leverage correlation IDs to track related events across different protocols.

3. **Monitor Health Regularly**: Set up health monitoring for proactive issue detection.

4. **Optimize Performance**: Use the performance optimization features for high-throughput scenarios.

5. **Handle Errors Gracefully**: Subscribe to error events and implement appropriate error handling.

6. **Use Factory Methods**: Use the factory methods for creating specialized adapters with sensible defaults.

7. **Clean Up Resources**: Always call `destroy()` when done to prevent memory leaks.

## API Reference

### CommunicationEventAdapter

#### Methods

- `start(): Promise<void>` - Start the adapter and initialize integrations
- `stop(): Promise<void>` - Stop the adapter and cleanup resources  
- `restart(): Promise<void>` - Restart the adapter
- `isRunning(): boolean` - Check if adapter is running
- `emit<T>(event: T, options?: EventEmissionOptions): Promise<void>` - Emit communication event
- `emitWebSocketCommunicationEvent(event): Promise<void>` - Emit WebSocket event
- `emitMCPProtocolEvent(event): Promise<void>` - Emit MCP protocol event
- `subscribe(eventTypes, listener, options?): string` - Subscribe to events
- `subscribeWebSocketCommunicationEvents(listener): string` - Subscribe to WebSocket events
- `subscribeMCPProtocolEvents(listener): string` - Subscribe to MCP events
- `subscribeHTTPCommunicationEvents(listener): string` - Subscribe to HTTP events
- `subscribeProtocolCommunicationEvents(listener): string` - Subscribe to protocol events
- `unsubscribe(subscriptionId): boolean` - Unsubscribe from events
- `healthCheck(): Promise<EventManagerStatus>` - Get adapter health status
- `getMetrics(): Promise<EventManagerMetrics>` - Get performance metrics
- `performCommunicationHealthCheck(): Promise<Record<string, CommunicationHealthEntry>>` - Check component health
- `getCommunicationCorrelatedEvents(correlationId): CommunicationCorrelation | null` - Get correlated events
- `getConnectionMetrics(connectionId?): Record<string, any>` - Get connection metrics
- `getMessageMetrics(messageId?): Record<string, any>` - Get message metrics
- `getProtocolMetrics(protocolType?): Record<string, any>` - Get protocol metrics
- `updateConfig(config): void` - Update adapter configuration
- `destroy(): Promise<void>` - Cleanup and destroy adapter

### CommunicationEventFactory

#### Methods

- `create(config): Promise<CommunicationEventAdapter>` - Create adapter with custom config
- `createWebSocketAdapter(name, config?): Promise<CommunicationEventAdapter>` - Create WebSocket-focused adapter
- `createMCPAdapter(name, config?): Promise<CommunicationEventAdapter>` - Create MCP-focused adapter  
- `createHTTPAdapter(name, config?): Promise<CommunicationEventAdapter>` - Create HTTP-focused adapter
- `createProtocolAdapter(name, config?): Promise<CommunicationEventAdapter>` - Create protocol-focused adapter
- `createComprehensiveAdapter(name, config?): Promise<CommunicationEventAdapter>` - Create full-featured adapter
- `get(name): CommunicationEventAdapter | undefined` - Get adapter by name
- `list(): CommunicationEventAdapter[]` - List all adapters
- `remove(name): Promise<boolean>` - Remove adapter by name
- `healthCheckAll(): Promise<Map<string, EventManagerStatus>>` - Health check all adapters
- `getCommunicationHealthSummary(): Promise<{...}>` - Get comprehensive health summary
- `getCommunicationMetricsSummary(): Promise<{...}>` - Get comprehensive metrics summary
- `shutdown(): Promise<void>` - Shutdown factory and all adapters