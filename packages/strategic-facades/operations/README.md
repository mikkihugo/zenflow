# @claude-zen/operations

**Strategic Operations Interface Delegation Package**

Provides unified access to all monitoring, performance, and operational systems through runtime delegation patterns. Part of the Strategic Architecture v2.0.0 four-layer delegation system.

## Overview

The Operations package consolidates access to all monitoring, performance, and operational systems in the Claude Code Zen ecosystem through a strategic interface delegation pattern. Instead of importing multiple operational packages directly, applications can use this single package to access all operations functionality.

## Architecture

**Strategic Layer: Operations (Monitoring & Performance)**
- Position: Layer 4 of 4 in the strategic architecture
- Role: Unified operational system coordination
- Pattern: Runtime delegation with lazy loading

## Delegated Systems

### 🔍 Agent Monitoring System (`@claude-zen/agent-monitoring`)
Comprehensive agent health monitoring, intelligence systems, and performance tracking:
- `IntelligenceSystem` - Agent intelligence monitoring
- `IntelligenceFactory` - Intelligence system factory
- `PerformanceTracker` - Agent performance monitoring
- `TaskPredictor` - Task completion prediction
- `AgentHealthMonitor` - Agent health and status monitoring

### 🔥 Chaos Engineering System (`@claude-zen/chaos-engineering`)
System resilience testing, failure simulation, and chaos experiments:
- `ChaosEngine` - Chaos experiment orchestration
- `ResilienceTestSuite` - System resilience testing
- `FailureSimulator` - Controlled failure simulation
- `ExperimentRunner` - Chaos experiment management

### 📊 Monitoring System (`@claude-zen/monitoring`)
System monitoring, observability, telemetry, and metrics collection:
- `MonitoringFacade` - Unified monitoring interface
- `ObservabilityFramework` - System observability management
- `TelemetryCollector` - Telemetry data collection
- `MetricsAggregator` - Metrics aggregation and analysis
- `HealthChecker` - System health monitoring

### 💾 Memory System (`@claude-zen/memory`)
Memory orchestration, persistence management, and memory coordination:
- `MemoryOrchestrator` - Memory system orchestration
- `MemoryCoordinator` - Memory operation coordination
- `PersistenceManager` - Data persistence management
- `MemoryController` - Memory operation control
- `MemorySystemCore` - Core memory system functionality

## Usage

### Basic Usage

```typescript
import { operationsSystem } from '@claude-zen/operations';

// Access agent monitoring
const agentMonitoring = await operationsSystem.agentMonitoring();
const intelligenceSystem = await agentMonitoring.getIntelligenceSystem({
  enableIntelligenceTracking: true,
  enablePerformanceMonitoring: true,
  monitoringInterval: 5000
});

// Access chaos engineering
const chaosEngineering = await operationsSystem.chaosEngineering();
const chaosEngine = await chaosEngineering.getChaosEngine({
  enableChaosExperiments: true,
  safetyChecks: true,
  experimentDuration: 30000
});

// Access monitoring
const monitoring = await operationsSystem.monitoring();
const observabilityFramework = await monitoring.getObservabilityFramework({
  enableObservability: true,
  enableTelemetryCollection: true
});

// Access memory system
const memory = await operationsSystem.memory();
const memoryOrchestrator = await memory.getMemoryOrchestrator({
  enableMemoryOrchestration: true,
  enablePersistence: true
});
```

### Unified Operations System

```typescript
import { OperationsSystem } from '@claude-zen/operations';

const operations = new OperationsSystem({
  agentMonitoring: {
    enableIntelligenceTracking: true,
    enablePerformanceMonitoring: true,
    enableHealthMonitoring: true,
    enableTaskPrediction: true,
    monitoringInterval: 5000,
    healthThreshold: 0.8,
    performanceMetrics: ['cpu', 'memory', 'response_time']
  },
  chaosEngineering: {
    enableChaosExperiments: true,
    enableResilienceTesting: true,
    enableFailureSimulation: true,
    experimentDuration: 60000,
    failureRate: 0.1,
    recoveryTime: 10000,
    safetyChecks: true
  },
  monitoring: {
    enableObservability: true,
    enableTelemetryCollection: true,
    enableMetricsAggregation: true,
    enableHealthChecking: true,
    monitoringInterval: 1000,
    metricsRetention: 86400000,
    telemetryBuffer: 1000,
    healthCheckInterval: 30000
  },
  memory: {
    enableMemoryOrchestration: true,
    enablePersistence: true,
    enableMemoryCoordination: true,
    enableMemoryControl: true,
    memoryRetention: 3600000,
    persistenceInterval: 10000,
    coordinationTimeout: 5000,
    maxMemorySize: 1073741824,
    compressionEnabled: true
  }
});

await operations.initialize();

// Get system status
const status = await operations.getStatus();
console.log('Operations status:', status);

// Get performance metrics
const metrics = await operations.getMetrics();
console.log('Performance metrics:', metrics);
```

### Individual System Access

```typescript
import {
  getIntelligenceSystem,
  getChaosEngine,
  getObservabilityFramework,
  getMemoryOrchestrator
} from '@claude-zen/operations';

// Direct access to specific systems
const intelligence = await getIntelligenceSystem({ 
  enableIntelligenceTracking: true,
  monitoringInterval: 5000
});

const chaos = await getChaosEngine({ 
  enableChaosExperiments: true,
  safetyChecks: true
});

const observability = await getObservabilityFramework({ 
  enableObservability: true,
  enableTelemetryCollection: true
});

const memory = await getMemoryOrchestrator({ 
  enableMemoryOrchestration: true,
  enablePersistence: true
});
```

## Configuration

### OperationsSystemConfig

```typescript
interface OperationsSystemConfig {
  agentMonitoring?: {
    enableIntelligenceTracking?: boolean;
    enablePerformanceMonitoring?: boolean;
    enableHealthMonitoring?: boolean;
    enableTaskPrediction?: boolean;
    monitoringInterval?: number;
    healthThreshold?: number;
    performanceMetrics?: string[];
  };
  
  chaosEngineering?: {
    enableChaosExperiments?: boolean;
    enableResilienceTesting?: boolean;
    enableFailureSimulation?: boolean;
    experimentDuration?: number;
    failureRate?: number;
    recoveryTime?: number;
    safetyChecks?: boolean;
  };
  
  monitoring?: {
    enableObservability?: boolean;
    enableTelemetryCollection?: boolean;
    enableMetricsAggregation?: boolean;
    enableHealthChecking?: boolean;
    monitoringInterval?: number;
    metricsRetention?: number;
    telemetryBuffer?: number;
    healthCheckInterval?: number;
  };
  
  memory?: {
    enableMemoryOrchestration?: boolean;
    enablePersistence?: boolean;
    enableMemoryCoordination?: boolean;
    enableMemoryControl?: boolean;
    memoryRetention?: number;
    persistenceInterval?: number;
    coordinationTimeout?: number;
    maxMemorySize?: number;
    compressionEnabled?: boolean;
  };
}
```

## System Objects

Each operational system provides a professional object for convenient access:

### Agent Monitoring System Object
```typescript
import { agentMonitoringSystem } from '@claude-zen/operations';

// Convenient access to agent monitoring functionality
const access = agentMonitoringSystem.getAccess();
const intelligence = await agentMonitoringSystem.getIntelligenceSystem(config);
const performance = await agentMonitoringSystem.getPerformanceTracker(config);
const health = await agentMonitoringSystem.getHealthMonitor(config);
```

### Chaos Engineering System Object
```typescript
import { chaosEngineeringSystem } from '@claude-zen/operations';

// Convenient access to chaos engineering functionality
const access = chaosEngineeringSystem.getAccess();
const engine = await chaosEngineeringSystem.getEngine(config);
const testSuite = await chaosEngineeringSystem.getTestSuite(config);
const simulator = await chaosEngineeringSystem.getSimulator(config);
```

### Monitoring System Object
```typescript
import { monitoringSystem } from '@claude-zen/operations';

// Convenient access to monitoring functionality
const access = monitoringSystem.getAccess();
const facade = await monitoringSystem.getFacade(config);
const observability = await monitoringSystem.getObservabilityFramework(config);
const telemetry = await monitoringSystem.getTelemetryCollector(config);
```

### Memory System Object
```typescript
import { memorySystem } from '@claude-zen/operations';

// Convenient access to memory functionality
const access = memorySystem.getAccess();
const orchestrator = await memorySystem.getOrchestrator(config);
const coordinator = await memorySystem.getCoordinator(config);
const persistence = await memorySystem.getPersistenceManager(config);
```

## Runtime Delegation

The Operations package uses runtime delegation to prevent circular dependencies and enable lazy loading:

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
  AgentMonitoringSystemError,
  ChaosEngineeringSystemError,
  MonitoringSystemError,
  MemorySystemError
} from '@claude-zen/operations';

try {
  const system = await getIntelligenceSystem(config);
} catch (error) {
  if (error instanceof AgentMonitoringSystemError) {
    console.error('Agent monitoring system error:', error.message);
  }
}
```

## Dependencies

### Core Dependencies
- `@claude-zen/foundation` - Core utilities and logging

### Peer Dependencies (Optional)
- `@claude-zen/agent-monitoring` - Agent monitoring system (required)
- `@claude-zen/chaos-engineering` - Chaos engineering system (optional)
- `@claude-zen/monitoring` - Monitoring system (required)
- `@claude-zen/memory` - Memory system (optional)

## Integration

Part of the Strategic Architecture v2.0.0:

1. **Foundation** (`@claude-zen/foundation`) - Infrastructure
2. **Intelligence** (`@claude-zen/intelligence`) - AI/Neural/ML
3. **Enterprise** (`@claude-zen/enterprise`) - Business Processes
4. **Operations** (`@claude-zen/operations`) - Monitoring/Performance ← **This Package**

## Examples

See the `examples/` directory for complete usage examples including:
- Agent monitoring and performance tracking
- Chaos engineering and resilience testing
- System observability and telemetry
- Memory orchestration and persistence
- Unified operations system management

## License

MIT - See LICENSE file for details

## Contributing

See CONTRIBUTING.md for development guidelines and architectural patterns.