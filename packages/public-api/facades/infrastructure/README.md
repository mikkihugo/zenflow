# @claude-zen/infrastructure

**Strategic Infrastructure Interface Delegation Package**

Provides unified access to all system infrastructure and platform services through runtime delegation patterns. Part of the Strategic Architecture v2.0.0 five-layer delegation system.

## Overview

The Infrastructure package consolidates access to all system infrastructure in the Claude Code Zen ecosystem through a strategic interface delegation pattern. Instead of importing multiple infrastructure packages directly, applications can use this single package to access all infrastructure functionality.

## Architecture

**Strategic Layer: Infrastructure (System Platform)**

- Position: Layer 2 of 5 in the strategic architecture
- Role: Unified system infrastructure coordination
- Pattern: Runtime delegation with lazy loading

## Delegated Systems

### 💾 Database System (`@claude-zen/database`)

Multi-database abstraction layer with comprehensive data persistence:

- `DatabaseProvider` - Multi-database management (SQLite, LanceDB, Kuzu)
- `KVStorage` - Key-value storage with JSON serialization
- `SQLDatabase` - Structured query operations
- `VectorDatabase` - Vector embeddings and similarity search
- `GraphDatabase` - Graph relationships and traversal

### 📊 Telemetry System (`@claude-zen/monitoring`)

Telemetry, observability, metrics collection, and distributed tracing:

- `TelemetryManager` - Comprehensive telemetry coordination
- `ObservabilityFramework` - System observability management
- `MetricsCollector` - Metrics aggregation and analysis
- `TracingSystem` - Distributed tracing and span management

### 📡 Event System (`@claude-zen/event-system`)

Type-safe event system, messaging, and coordination:

- `EventBus` - Central event coordination
- `EventEmitter` - Event emission and handling
- `MessageBroker` - Message routing and delivery
- `EventCoordinator` - Event workflow coordination
- `TypeSafeEventSystem` - Type-safe event validation

### ⚖️ Load Balancing System (`@claude-zen/load-balancing`)

Load balancing algorithms, resource optimization, and intelligent routing:

- `LoadBalancer` - Request distribution and balancing
- `ResourceOptimizer` - Resource utilization optimization
- `IntelligentRouter` - Smart request routing
- `CapacityManager` - Resource capacity management
- `FailoverManager` - Automatic failover handling

## Usage

### Basic Usage

```typescript
import { infrastructureSystem } from '@claude-zen/infrastructure';

// Access database systems
const database = await infrastructureSystem.database();
const kvStorage = await database.getKVStorage('my-namespace');
await kvStorage.set('config', { debug: true });

// Access telemetry
const telemetry = await infrastructureSystem.telemetry();
const telemetryManager = await telemetry.getTelemetryManager({
  serviceName: 'my-service',
  enableTracing: true,
  enableMetrics: true,
});

// Access event system
const eventSystem = await infrastructureSystem.eventSystem();
const eventBus = await eventSystem.getEventBus({
  enableTypeValidation: true,
  enableEventPersistence: true,
});

// Access load balancing
const loadBalancing = await infrastructureSystem.loadBalancing();
const loadBalancer = await loadBalancing.getLoadBalancer({
  algorithm: 'resource-aware',
  enableHealthChecking: true,
});
```

### Unified Infrastructure System

```typescript
import { InfrastructureSystem } from '@claude-zen/infrastructure';

const infrastructure = new InfrastructureSystem({
  database: {
    enableKVStorage: true,
    enableSQLDatabase: true,
    enableVectorDatabase: true,
    enableGraphDatabase: true,
    defaultNamespace: 'app',
    connectionPoolSize: 10,
    enableCaching: true,
  },
  telemetry: {
    serviceName: 'my-application',
    enableTracing: true,
    enableMetrics: true,
    enableLogging: true,
    endpoint: 'http://localhost:4318',
    attributes: {
      environment: 'production',
      version: '1.0.0',
    },
  },
  eventSystem: {
    enableTypeValidation: true,
    enableEventPersistence: true,
    enableDistribution: true,
    maxEventHistory: 1000,
    eventTimeout: 30000,
    batchSize: 100,
  },
  loadBalancing: {
    algorithm: 'ml-predictive',
    enableHealthChecking: true,
    enableResourceOptimization: true,
    enableFailover: true,
    maxCapacity: 1000,
    healthCheckInterval: 30000,
    failoverTimeout: 5000,
  },
});

await infrastructure.initialize();

// Get system status
const status = await infrastructure.getStatus();
console.log('Infrastructure status:', status);

// Get performance metrics
const metrics = await infrastructure.getMetrics();
console.log('Performance metrics:', metrics);
```

### Individual System Access

```typescript
import {
  getKVStorage,
  getTelemetryManager,
  getEventBus,
  getLoadBalancer,
} from '@claude-zen/infrastructure';

// Direct access to specific systems
const storage = await getKVStorage('cache');
const telemetry = await getTelemetryManager({
  serviceName: 'worker',
  enableMetrics: true,
});
const events = await getEventBus({
  enableTypeValidation: true,
});
const balancer = await getLoadBalancer({
  algorithm: 'least-connections',
  enableHealthChecking: true,
});
```

## Configuration

### InfrastructureSystemConfig

```typescript
interface InfrastructureSystemConfig {
  database?: {
    enableKVStorage?: boolean;
    enableSQLDatabase?: boolean;
    enableVectorDatabase?: boolean;
    enableGraphDatabase?: boolean;
    defaultNamespace?: string;
    connectionPoolSize?: number;
    enableCaching?: boolean;
  };

  telemetry?: {
    serviceName: string;
    enableTracing?: boolean;
    enableMetrics?: boolean;
    enableLogging?: boolean;
    endpoint?: string;
    attributes?: Record<string, string | number | boolean>;
  };

  eventSystem?: {
    enableTypeValidation?: boolean;
    enableEventPersistence?: boolean;
    enableDistribution?: boolean;
    maxEventHistory?: number;
    eventTimeout?: number;
    batchSize?: number;
  };

  loadBalancing?: {
    algorithm?:
      | 'round-robin'
      | 'least-connections'
      | 'weighted'
      | 'resource-aware'
      | 'ml-predictive';
    enableHealthChecking?: boolean;
    enableResourceOptimization?: boolean;
    enableFailover?: boolean;
    maxCapacity?: number;
    healthCheckInterval?: number;
    failoverTimeout?: number;
  };
}
```

## System Objects

Each infrastructure system provides a professional object for convenient access:

### Database System Object

```typescript
import { databaseSystem } from '@claude-zen/infrastructure';

// Convenient access to database functionality
const access = databaseSystem.getAccess();
const kv = await databaseSystem.getKV('namespace');
const sql = await databaseSystem.getSQL('namespace');
const vector = await databaseSystem.getVector('namespace');
const graph = await databaseSystem.getGraph('namespace');
```

### Telemetry System Object

```typescript
import { telemetrySystem } from '@claude-zen/infrastructure';

// Convenient access to telemetry functionality
const access = telemetrySystem.getAccess();
const manager = await telemetrySystem.getManager(config);
const observability = await telemetrySystem.getObservabilityFramework(config);
const metrics = await telemetrySystem.getMetricsCollector(config);
```

### Event System Object

```typescript
import { eventSystem } from '@claude-zen/infrastructure';

// Convenient access to event functionality
const access = eventSystem.getAccess();
const bus = await eventSystem.getBus(config);
const emitter = await eventSystem.getEmitter(config);
const broker = await eventSystem.getBroker(config);
```

### Load Balancing System Object

```typescript
import { loadBalancingSystem } from '@claude-zen/infrastructure';

// Convenient access to load balancing functionality
const access = loadBalancingSystem.getAccess();
const balancer = await loadBalancingSystem.getBalancer(config);
const optimizer = await loadBalancingSystem.getOptimizer(config);
const router = await loadBalancingSystem.getRouter(config);
```

## Runtime Delegation

The Infrastructure package uses runtime delegation to prevent circular dependencies and enable lazy loading:

- **Lazy Loading**: Systems are only loaded when first accessed
- **Runtime Imports**: Dynamic imports prevent build-time circular dependencies
- **Error Handling**: Graceful handling when optional systems are unavailable
- **Singleton Pattern**: Global access with consistent instances

## Performance

- **Lazy Loading**: Only load systems that are actually used
- **Runtime Delegation**: Avoid circular dependency build issues
- **Professional Caching**: Singleton pattern for efficient resource usage
- **Strategic Access**: Unified interface reduces complexity

## Error Handling

Each system provides specific error types for better error handling:

```typescript
import {
  DatabaseSystemError,
  TelemetrySystemError,
  EventSystemError,
  LoadBalancingSystemError,
} from '@claude-zen/infrastructure';

try {
  const storage = await getKVStorage('namespace');
} catch (error) {
  if (error instanceof DatabaseSystemError) {
    console.error('Database system error:', error.message);
  }
}
```

## Dependencies

### Core Dependencies

- `@claude-zen/foundation` - Core utilities and logging

### Peer Dependencies (Optional)

- `@claude-zen/database` - Multi-database abstraction (required)
- `@claude-zen/monitoring` - Telemetry and observability (required)
- `@claude-zen/event-system` - Type-safe events (required)
- `@claude-zen/load-balancing` - Load balancing and optimization (optional)

## Integration

Part of the Strategic Architecture v2.0.0:

1. **Foundation** (`@claude-zen/foundation`) - Core Utilities
2. **Infrastructure** (`@claude-zen/infrastructure`) - System Infrastructure ← **This Package**
3. **Intelligence** (`@claude-zen/intelligence`) - AI/Neural/ML
4. **Enterprise** (`@claude-zen/enterprise`) - Business Processes
5. **Operations** (`@claude-zen/operations`) - Monitoring/Performance

## Examples

See the `examples/` directory for complete usage examples including:

- Multi-database applications with KV, SQL, vector, and graph storage
- Comprehensive telemetry and observability setup
- Event-driven architectures with type-safe messaging
- Load-balanced applications with intelligent routing
- Unified infrastructure system management

## License

MIT - See LICENSE file for details

## Contributing

See CONTRIBUTING.md for development guidelines and architectural patterns.
