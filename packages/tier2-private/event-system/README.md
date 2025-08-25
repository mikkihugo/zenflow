# @zen-ai/event-system

Type-safe event system with domain validation, unified event layer (UEL), and advanced coordination capabilities.

## Features

- **Type-safe event system** with compile-time and runtime validation
- **Domain boundary validation** for cross-domain event coordination
- **UEL (Unified Event Layer)** with multiple adapters (communication, coordination, monitoring)
- **Event factories and registries** for organized event management
- **Comprehensive validation framework** with schema validation
- **Migration helpers and compatibility layers** for legacy system integration
- **Health monitoring and metrics** for production deployments
- **Cross-domain event coordination** for multi-agent systems

## Installation

```bash
npm install @zen-ai/event-system
```

## Quick Start

```typescript
import { UEL, createSystemEventManager } from '@zen-ai/event-system';

// Initialize the Unified Event Layer
await UEL.initialize();

// Create an event manager
const eventManager = await createSystemEventManager('my-app');

// Listen for events
eventManager.on('system:startup', (event) => {
  console.log('System started:', event);
});

// Emit events
eventManager.emit('system:startup', {
  id: 'startup-1',
  timestamp: new Date(),
  source: 'my-app',
  type: 'system:startup',
  status: 'success'
});
```

## Core Components

### Type-Safe Event System

```typescript
import { TypeSafeEventBus, Domain } from '@zen-ai/event-system';

const eventBus = new TypeSafeEventBus({
  domain: Domain.SYSTEM,
  enableValidation: true
});

// Type-safe event emission with validation
await eventBus.emit({
  id: 'event-1',
  type: 'user:action',
  domain: Domain.SYSTEM,
  timestamp: new Date(),
  data: { action: 'click', target: 'button' }
});
```

### Event Adapters

```typescript
import { 
  createCommunicationEventAdapter,
  createCoordinationEventAdapter,
  createMonitoringEventAdapter 
} from '@zen-ai/event-system';

// Communication events (HTTP, WebSocket, MCP)
const commAdapter = createCommunicationEventAdapter({
  protocols: ['http', 'websocket'],
  enableMetrics: true
});

// Coordination events (agent coordination, swarm management)
const coordAdapter = createCoordinationEventAdapter({
  topology: 'mesh',
  enableLearning: true
});

// Monitoring events (health checks, performance metrics)
const monitorAdapter = createMonitoringEventAdapter({
  intervals: { health: 30000, metrics: 5000 }
});
```

### Domain Validation

```typescript
import { validateCrossDomain, Domain } from '@zen-ai/event-system';

// Validate cross-domain event transfer
const result = validateCrossDomain(
  Domain.SYSTEM,
  Domain.COORDINATION,
  eventData
);

if (result.success) {
  // Safe to transfer event
  await targetEventBus.emit(result.data);
}
```

## Advanced Usage

### Migration from EventEmitter

```typescript
import { UEL } from '@zen-ai/event-system';

// Migrate existing EventEmitter to UEL
const enhanced = await UEL.migrateEventEmitter(
  existingEventEmitter,
  'legacy-system',
  'system'
);

// Get migration recommendations
const analysis = UEL.analyzeEventEmitter(existingEventEmitter);
console.log('Migration recommendations:', analysis.recommendations);
```

### Health Monitoring

```typescript
import { UEL } from '@zen-ai/event-system';

// Get system health status
const healthStatus = await UEL.getHealthStatus();

healthStatus.forEach(status => {
  console.log(`${status.name}: ${status.status}`);
  if (status.status !== 'healthy') {
    console.warn('Issues:', status.details);
  }
});
```

### Custom Event Validation

```typescript
import { createEventValidator } from '@zen-ai/event-system';

const validator = createEventValidator({
  schemas: {
    'user:action': {
      type: 'object',
      required: ['action', 'target'],
      properties: {
        action: { type: 'string' },
        target: { type: 'string' }
      }
    }
  }
});

// Events are automatically validated against schemas
```

## API Reference

### Core Classes

- `TypeSafeEventBus` - Main event bus with type safety and validation
- `UEL` - Unified Event Layer singleton for system-wide coordination
- `EventAdapter` - Base class for specialized event adapters
- `EventValidator` - Schema-based event validation

### Adapters

- `CommunicationEventAdapter` - HTTP, WebSocket, MCP protocol events
- `CoordinationEventAdapter` - Agent coordination and swarm events
- `MonitoringEventAdapter` - Health checks and performance metrics
- `SystemEventAdapter` - System lifecycle and infrastructure events

### Utilities

- `createEventBuilder()` - Fluent event construction
- `migrateEventEmitter()` - Legacy system migration
- `validateCrossDomain()` - Cross-domain validation
- `analyzeSystemHealth()` - Health monitoring

## Configuration

```typescript
// Initialize with custom configuration
await UEL.initialize({
  enableValidation: true,
  enableCompatibility: true,
  healthMonitoring: true,
  autoRegisterFactories: true,
  logger: customLogger
});
```

## Performance

- **High-throughput**: Optimized for production workloads
- **Type safety**: Zero-runtime-cost type checking with TypeScript
- **Memory efficient**: Event pooling and cleanup
- **Async first**: Non-blocking event processing
- **Metrics included**: Built-in performance monitoring

## TypeScript Support

Full TypeScript support with strict typing:

```typescript
interface MyEventData {
  userId: string;
  action: 'create' | 'update' | 'delete';
  resourceId: string;
}

// Fully typed event handling
eventBus.on<MyEventData>('user:action', (event) => {
  // event.data is typed as MyEventData
  console.log(`User ${event.data.userId} performed ${event.data.action}`);
});
```

## License

MIT

## Contributing

See the main [claude-code-zen](https://github.com/zen-ai/claude-code-zen) repository for contribution guidelines.