# UEL (Unified Event Layer) - Complete Implementation Guide

## 🚀 Overview

UEL (Unified Event Layer) is a comprehensive event management system that provides a unified interface for all event handling across claude-zen. It follows the same patterns as UACL (Unified Access Control Layer) and USL (Unified Storage Layer), providing type-safe, factory-based event management with backward compatibility.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Components](#core-components)
- [Event Types & Categories](#event-types--categories)
- [Factory Pattern Implementation](#factory-pattern-implementation)
- [Integration Patterns](#integration-patterns)
- [Backward Compatibility](#backward-compatibility)
- [Migration Guide](#migration-guide)
- [Usage Examples](#usage-examples)
- [Validation & Monitoring](#validation--monitoring)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Architecture Overview

UEL follows a layered architecture designed for maximum flexibility and compatibility:

```
┌─────────────────────────────────────────────────────────┐
│                    UEL Main Interface                   │
│              (Singleton + Factory Pattern)              │
├─────────────────────────────────────────────────────────┤
│  Enhanced System Integration  │  Backward Compatibility │
│  - UELEnhancedEventBus       │  - UELCompatibleEventEmitter│
│  - UELEnhancedAppCoordinator │  - EventEmitterMigrationHelper│
│  - UELEnhancedObserverSystem │  - CompatibilityFactory    │
├─────────────────────────────────────────────────────────┤
│    Event Management Layer    │    Validation Framework   │
│    - EventManager            │    - UELValidationFramework│
│    - EventRegistry           │    - Event Type Validation  │
│    - Event Type Factories    │    - Health Monitoring      │
├─────────────────────────────────────────────────────────┤
│                 Event Adapters Layer                    │
│  System │ Coordination │ Communication │ Monitoring     │
│  Events │   Events     │    Events     │   Events       │
├─────────────────────────────────────────────────────────┤
│               Core Interfaces & Types                   │
│        IEventManager │ EventManagerTypes │ Events       │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. UEL Main Interface (`UEL`)

The primary interface for all UEL operations:

```typescript
import { UEL, initializeUEL } from './interfaces/events';

// Singleton pattern
const uel = UEL.getInstance();

// Initialize with full features
await uel.initialize({
  enableValidation: true,
  enableCompatibility: true,
  healthMonitoring: true,
  autoRegisterFactories: true
});

// Create event managers
const systemManager = await uel.createSystemEventManager('my-system');
const coordManager = await uel.createCoordinationEventManager('my-coordination');
```

### 2. Event Manager System (`EventManager`)

Comprehensive event manager for lifecycle management:

```typescript
import { EventManager } from './interfaces/events';

const eventManager = new EventManager(logger, config);

// Initialize with options
await eventManager.initialize({
  autoRegisterFactories: true,
  healthMonitoring: true,
  coordination: {
    crossManagerRouting: true,
    eventDeduplication: true
  }
});

// Create typed event managers
const systemEvents = await eventManager.createSystemEventManager('core-system');
const coordEvents = await eventManager.createCoordinationEventManager('swarm-coord');
```

### 3. Event Registry (`EventRegistry`)

Central registry for all event types and factories:

```typescript
import { EventRegistry } from './interfaces/events';

const registry = new EventRegistry(logger);

// Register event types
registry.registerEventType('system:startup', {
  category: 'system',
  managerTypes: ['system'],
  priority: 3
});

// Register custom factory
registry.registerFactory('system', new MySystemEventFactory());

// Health monitoring
const healthStatus = await registry.healthCheckAll();
const globalMetrics = await registry.getGlobalMetrics();
```

### 4. Validation Framework (`UELValidationFramework`)

Comprehensive validation and quality assurance:

```typescript
import { UELValidationFramework } from './interfaces/events';

const validator = new UELValidationFramework(logger);

// Validate event types
const eventResult = validator.validateEventType(myEvent, schema);

// Validate manager configuration
const configResult = validator.validateManagerConfig(config);

// Validate system health
const healthResult = await validator.validateSystemHealth(eventManager);

// Complete system validation
const completeResult = await validator.validateComplete(eventManager, registry);
```

## Event Types & Categories

UEL supports comprehensive event categorization:

### Event Categories

```typescript
export const EventCategories = {
  SYSTEM: 'system',           // System lifecycle events
  COORDINATION: 'coordination', // Swarm & agent coordination  
  COMMUNICATION: 'communication', // Protocol & network events
  MONITORING: 'monitoring',   // Metrics & health events
  INTERFACE: 'interface',     // UI & API interaction events
  NEURAL: 'neural',          // AI & neural network events
  DATABASE: 'database',      // Database operation events
  MEMORY: 'memory',          // Memory & cache events
  WORKFLOW: 'workflow'       // Workflow execution events
};
```

### Event Type Examples

```typescript
// System lifecycle event
const systemEvent: SystemLifecycleEvent = {
  id: 'sys-001',
  timestamp: new Date(),
  source: 'application-coordinator',
  type: 'system:startup',
  operation: 'start',
  status: 'success',
  details: { component: 'event-bus', startupTime: 1250 }
};

// Coordination event
const coordEvent: CoordinationEvent = {
  id: 'coord-001',
  timestamp: new Date(),
  source: 'swarm-manager',
  type: 'coordination:agent',
  operation: 'spawn',
  targetId: 'agent-researcher-001',
  details: { agentType: 'researcher', capabilities: ['analysis'] }
};

// Communication event
const commEvent: CommunicationEvent = {
  id: 'comm-001',
  timestamp: new Date(),
  source: 'websocket-adapter',
  type: 'communication:websocket',
  operation: 'message',
  protocol: 'websocket',
  details: { messageType: 'coordination', size: 1024 }
};
```

## Factory Pattern Implementation

UEL uses the factory pattern for type-safe event manager creation:

### Event Manager Factories

```typescript
// System Event Factory
export class SystemEventManagerFactory implements IEventManagerFactory<SystemEventConfig> {
  async create(config: SystemEventConfig): Promise<ISystemEventManager> {
    const manager = new SystemEventManager(config, this.logger);
    await manager.initialize();
    return manager;
  }
  
  getSupportedEventTypes(): string[] {
    return ['system:startup', 'system:shutdown', 'system:error', 'system:health'];
  }
}

// Factory Registration
const factory = new SystemEventManagerFactory(logger, config);
registry.registerFactory(EventManagerTypes.SYSTEM, factory);

// Factory Usage
const systemManager = await registry.getFactory(EventManagerTypes.SYSTEM)?.create({
  name: 'main-system',
  type: EventManagerTypes.SYSTEM,
  maxListeners: 100
});
```

### Factory Registry Pattern

```typescript
// Auto-registration of factories
await uel.initialize({
  autoRegisterFactories: true  // Registers all available factories
});

// Manual factory registration
uel.getRegistry().registerFactory(EventManagerTypes.COORDINATION, coordinationFactory);
uel.getRegistry().registerFactory(EventManagerTypes.COMMUNICATION, communicationFactory);

// Factory discovery
const availableFactories = uel.getRegistry().listFactoryTypes();
console.log('Available factories:', availableFactories);
```

## Integration Patterns

### 1. Enhanced System Integration

UEL provides enhanced versions of existing systems with backward compatibility:

```typescript
import { UELSystemIntegration } from './interfaces/events';

// Initialize system integration
await UELSystemIntegration.initialize(eventManager, logger);

// Create enhanced event bus (backward compatible)
const enhancedEventBus = UELSystemIntegration.factory.createEnhancedEventBus({
  enableUEL: true,
  managerType: EventManagerTypes.SYSTEM,
  managerName: 'main-event-bus'
});

// Enhanced application coordinator
const enhancedCoordinator = UELSystemIntegration.factory.createEnhancedApplicationCoordinator({
  enableUEL: true,
  uelConfig: {
    enableValidation: true,
    enableCompatibility: true,
    healthMonitoring: true
  }
});

// Enhanced observer system
const enhancedObserver = UELSystemIntegration.factory.createEnhancedObserverSystem({
  enableUEL: true
});
```

### 2. Gradual Migration Pattern

```typescript
// Analyze existing EventEmitter usage
const systems = {
  eventBus: existingEventBus,
  coordinator: existingCoordinator,
  observers: existingObservers
};

const analysis = await uel.analyzeSystemEventEmitters(systems);
console.log('Migration complexity:', analysis.overallComplexity);
console.log('Recommendations:', analysis.migrationRecommendations);

// Perform gradual migration
const migrationResult = await UELHelpers.migrateSystemToUEL(systems);

if (migrationResult.migrationReport.success) {
  console.log('Successfully migrated:', migrationResult.migrationReport.migratedSystems);
  
  // Use enhanced systems
  const { eventBus, applicationCoordinator, observerSystem } = migrationResult;
  
  // Enhanced systems provide both EventEmitter API and UEL features
  eventBus?.emit('system:ready'); // EventEmitter compatibility
  eventBus?.mapEventToUEL('legacy-event', 'system:lifecycle'); // UEL enhancement
}
```

### 3. Complete System Setup Pattern

```typescript
// One-command complete UEL setup
const completeSystem = await UELHelpers.setupCompleteUELSystem({
  systemComponents: {
    eventBus: true,
    applicationCoordinator: true,
    observerSystem: true
  },
  eventManagers: {
    system: true,
    coordination: true,
    communication: true,
    monitoring: true,
    interface: true
  },
  validation: true,
  compatibility: true,
  healthMonitoring: true
});

console.log('System setup status:', completeSystem.status);
console.log('Components created:', completeSystem.status.componentsCreated);

// Access all created components
const { uel, systems, eventManagers } = completeSystem;
```

## Backward Compatibility

UEL maintains 100% backward compatibility with existing EventEmitter code:

### 1. Compatible EventEmitter

```typescript
import { UELCompatibleEventEmitter } from './interfaces/events';

// Create compatible EventEmitter with UEL features
const compatibleEmitter = new UELCompatibleEventEmitter({
  enableUEL: true,
  uelManager: await uel.createSystemEventManager('compatible'),
  migrationMode: 'passive', // or 'active', 'disabled'
  logger: logger
});

// Standard EventEmitter API works unchanged
compatibleEmitter.on('data', (data) => console.log('Received:', data));
compatibleEmitter.emit('data', { message: 'Hello World' });

// Additional UEL features available
compatibleEmitter.mapEventToUEL('data', 'system:data-received');
const status = compatibleEmitter.getUELStatus();
```

### 2. Migration Helper

```typescript
import { EventEmitterMigrationHelper } from './interfaces/events';

const migrationHelper = new EventEmitterMigrationHelper(eventManager, logger);

// Analyze existing EventEmitter
const analysis = migrationHelper.analyzeEventEmitter(existingEmitter);
console.log('Migration complexity:', analysis.migrationComplexity);
console.log('Recommendations:', analysis.recommendations);

// Generate migration plan
const plan = migrationHelper.generateMigrationPlan(analysis);
console.log('Migration phases:', plan.phases);
console.log('Estimated timeline:', plan.timeline);

// Wrap existing EventEmitter
const wrappedEmitter = await migrationHelper.wrapEventEmitter(
  existingEmitter,
  'wrapped-emitter',
  EventManagerTypes.SYSTEM
);

// Create new compatible instance
const newCompatible = await migrationHelper.createCompatibleEventEmitter(
  'new-compatible',
  EventManagerTypes.SYSTEM,
  { enableUEL: true, migrationMode: 'active' }
);
```

### 3. Compatibility Factory

```typescript
import { CompatibilityFactory } from './interfaces/events';

// Initialize compatibility factory
const compatibilityFactory = CompatibilityFactory.getInstance();
await compatibilityFactory.initialize(eventManager, logger);

// Create enhanced EventEmitter with UEL
const enhanced = await compatibilityFactory.createEnhancedEventEmitter(
  'enhanced-system',
  EventManagerTypes.SYSTEM,
  { enableUEL: true, migrationMode: 'passive' }
);

// Wrap existing EventEmitter
const wrapped = await compatibilityFactory.wrapExistingEmitter(
  existingEventEmitter,
  'wrapped-system',
  EventManagerTypes.SYSTEM
);
```

## Migration Guide

### Phase 1: Analysis & Planning

```typescript
// Step 1: Analyze current system
const systems = {
  eventBus: currentEventBus,
  coordinator: currentCoordinator,
  // ... other EventEmitter-based systems
};

const analysis = await UEL.getInstance().analyzeSystemEventEmitters(systems);

// Step 2: Review migration complexity and recommendations
console.log('Overall complexity:', analysis.overallComplexity);
analysis.migrationRecommendations.forEach(rec => console.log('💡', rec));

// Step 3: Plan migration phases based on complexity
if (analysis.overallComplexity === 'low') {
  // Direct migration possible
} else if (analysis.overallComplexity === 'medium') {
  // Gradual migration recommended
} else {
  // Careful planning and phased approach required
}
```

### Phase 2: Gradual Integration

```typescript
// Step 1: Initialize UEL with compatibility enabled
await uel.initialize({
  enableValidation: true,
  enableCompatibility: true,
  healthMonitoring: true
});

// Step 2: Enable UEL for high-traffic systems first
const enhancedEventBus = await uel.createEnhancedEventBus({
  enableUEL: true,
  managerName: 'main-event-bus'
});

// Step 3: Gradually replace existing systems
// Old code continues to work:
enhancedEventBus.on('data', handler);  // EventEmitter API
enhancedEventBus.emit('data', payload); // EventEmitter API

// New UEL features available:
enhancedEventBus.mapEventToUEL('data', 'system:data-processing');
const status = enhancedEventBus.getStatus();
```

### Phase 3: Full UEL Adoption

```typescript
// Step 1: Migrate remaining systems
const fullMigrationResult = await UELHelpers.migrateSystemToUEL({
  eventBus: existingEventBus,
  coordinator: existingCoordinator,
  observers: existingObservers,
  customSystem: myCustomEventEmitter
});

// Step 2: Enable active UEL mode for enhanced features
if (fullMigrationResult.migrationReport.success) {
  // All systems now support both EventEmitter API and UEL features
  const { eventBus, applicationCoordinator, observerSystem } = fullMigrationResult;
  
  // Step 3: Start using advanced UEL features
  await eventBus?.enableUELMode(eventManager, {
    migrateExistingListeners: true
  });
}
```

### Phase 4: Optimization & Advanced Features

```typescript
// Step 1: Enable advanced validation and monitoring
const validationResult = await UELHelpers.performCompleteValidation({
  includeHealthCheck: true,
  includeIntegrationCheck: true,
  includeSampleEvents: true,
  exportReport: true
});

console.log('System validation score:', validationResult.summary.score);

// Step 2: Set up comprehensive monitoring
const systemStatus = await uel.getSystemStatus();
const healthStatus = await uel.getHealthStatus();
const globalMetrics = await uel.getGlobalMetrics();

// Step 3: Implement custom event types and validation
uel.registerEventTypeSchema('custom:workflow', {
  required: ['id', 'timestamp', 'workflowId', 'stage'],
  properties: {
    workflowId: { type: 'string' },
    stage: { type: 'string', enum: ['start', 'progress', 'complete', 'error'] }
  },
  additionalProperties: true
});
```

## Usage Examples

### Basic Usage

```typescript
import { UEL, UELHelpers } from './interfaces/events';

// Initialize UEL
const uel = UEL.getInstance();
await uel.initialize();

// Create event managers
const systemManager = await uel.createSystemEventManager('app-system');
const coordManager = await uel.createCoordinationEventManager('app-coordination');

// Emit events
await systemManager.emit({
  id: 'sys-001',
  timestamp: new Date(),
  source: 'app-system',
  type: 'system:startup',
  operation: 'start',
  status: 'success'
});

// Subscribe to events
const subscription = systemManager.subscribe(['system:*'], (event) => {
  console.log('System event:', event.type, event.details);
});
```

### Advanced Integration

```typescript
import { UELSystemIntegration } from './interfaces/events';

// Create complete integrated system
const integratedSystem = await UELHelpers.setupCompleteUELSystem({
  systemComponents: {
    eventBus: true,
    applicationCoordinator: true,
    observerSystem: true
  },
  eventManagers: {
    system: true,
    coordination: true,
    communication: true,
    monitoring: true
  },
  validation: true,
  compatibility: true,
  healthMonitoring: true
});

// Access integrated components
const { uel, systems, eventManagers, status } = integratedSystem;

// Enhanced event bus with both APIs
systems.eventBus?.on('custom-event', handler);  // EventEmitter API
systems.eventBus?.mapEventToUEL('custom-event', 'system:custom'); // UEL enhancement

// Enhanced application coordinator
const coordinatorStatus = await systems.applicationCoordinator?.getSystemStatus();
```

### Event Validation

```typescript
import { UELValidationFramework } from './interfaces/events';

const validator = new UELValidationFramework(logger);

// Define custom event schema
validator.registerEventTypeSchema('workflow:task', {
  required: ['id', 'timestamp', 'taskId', 'status'],
  properties: {
    taskId: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
    progress: { type: 'number', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
});

// Validate events
const event = {
  id: 'task-001',
  timestamp: new Date(),
  source: 'workflow-engine',
  type: 'workflow:task',
  taskId: 'build-project',
  status: 'running',
  progress: 45
};

const result = validator.validateEventType(event);
console.log('Validation passed:', result.valid);
console.log('Score:', result.score);
if (result.errors.length > 0) {
  console.log('Errors:', result.errors);
}
```

## Validation & Monitoring

### System Health Monitoring

```typescript
// Automated health monitoring (enabled during initialization)
await uel.initialize({ healthMonitoring: true });

// Manual health checks
const healthStatus = await uel.getHealthStatus();
healthStatus.forEach(status => {
  console.log(`${status.name}: ${status.status} (${status.subscriptions} subscriptions)`);
});

// Global metrics
const metrics = await uel.getGlobalMetrics();
console.log(`Total events: ${metrics.totalEvents}`);
console.log(`Average latency: ${metrics.averageLatency}ms`);
console.log(`Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
```

### Performance Monitoring

```typescript
// Built-in performance tracking
const systemStatus = await uel.getSystemStatus();
console.log('Health percentage:', systemStatus.healthPercentage);
console.log('Total managers:', systemStatus.totalManagers);

// Detailed component status
console.log('Factory stats:', systemStatus.factoryStats);
console.log('Registry stats:', systemStatus.registryStats);
console.log('Integration stats:', systemStatus.integrationStats);

// Performance analytics
const quickStatus = await UELHelpers.getQuickStatus();
console.log('System status:', quickStatus.status); // 'healthy' | 'warning' | 'critical'
```

### Validation CLI Tool

```bash
# Run comprehensive validation
node scripts/validate-uel.js --verbose

# Health check only
node scripts/validate-uel.js --health

# Export detailed report
node scripts/validate-uel.js --format=json --export-report

# Fix issues automatically
node scripts/validate-uel.js --fix-issues
```

## Best Practices

### 1. Event Design

```typescript
// ✅ Good: Well-structured event with clear type and details
const goodEvent: SystemLifecycleEvent = {
  id: `sys-${Date.now()}-${crypto.randomUUID()}`,
  timestamp: new Date(),
  source: 'application-coordinator',
  type: 'system:component-startup',
  operation: 'start',
  status: 'success',
  details: {
    component: 'event-bus',
    version: '1.0.0',
    startupTime: 1250,
    configuration: { maxListeners: 100 }
  }
};

// ❌ Avoid: Poorly structured event
const badEvent = {
  id: 'event1',
  type: 'stuff-happened',
  data: 'some data'
};
```

### 2. Factory Registration

```typescript
// ✅ Good: Register factories during initialization
await uel.initialize({
  autoRegisterFactories: true  // Automatically registers available factories
});

// Or register manually with proper error handling
try {
  uel.getRegistry().registerFactory(EventManagerTypes.CUSTOM, customFactory);
} catch (error) {
  logger.error('Failed to register custom factory:', error);
}

// ❌ Avoid: Late factory registration without error handling
uel.getRegistry().registerFactory(type, factory); // No error handling
```

### 3. Migration Strategy

```typescript
// ✅ Good: Gradual migration with analysis
const analysis = await uel.analyzeSystemEventEmitters(existingSystems);

if (analysis.overallComplexity === 'high') {
  // Implement gradual migration
  const phase1Systems = { eventBus: existingSystems.eventBus };
  const phase1Result = await UELHelpers.migrateSystemToUEL(phase1Systems);
  
  // Monitor and validate before proceeding
  const validationResult = await UELHelpers.performCompleteValidation();
  
  if (validationResult.summary.passed) {
    // Proceed with phase 2
  }
}

// ❌ Avoid: Immediate full migration without analysis
const result = await UELHelpers.migrateSystemToUEL(allSystems); // Risky
```

### 4. Error Handling

```typescript
// ✅ Good: Comprehensive error handling
try {
  const manager = await uel.createSystemEventManager('critical-system', {
    maxListeners: 50,
    enableRetry: true,
    retryAttempts: 3
  });
  
  await manager.start();
  logger.info('System manager started successfully');
  
} catch (error) {
  logger.error('Failed to create system manager:', error);
  
  // Fallback to basic EventEmitter if UEL fails
  const fallbackEmitter = new EventEmitter();
  fallbackEmitter.setMaxListeners(50);
  return fallbackEmitter;
}

// ❌ Avoid: No error handling
const manager = await uel.createSystemEventManager('system'); // No error handling
```

### 5. Resource Management

```typescript
// ✅ Good: Proper cleanup and resource management
class MyApplication {
  private uel?: UEL;
  private managers = new Map<string, IEventManager>();

  async initialize() {
    this.uel = UEL.getInstance();
    await this.uel.initialize();
    
    // Create and track managers
    const systemManager = await this.uel.createSystemEventManager('app-system');
    this.managers.set('system', systemManager);
  }

  async shutdown() {
    // Shutdown all managers
    for (const [name, manager] of this.managers) {
      try {
        await manager.stop();
        await manager.destroy();
      } catch (error) {
        console.warn(`Failed to shutdown ${name}:`, error);
      }
    }
    
    // Shutdown UEL system
    if (this.uel) {
      await this.uel.shutdown();
    }
  }
}

// ❌ Avoid: No cleanup
class BadApplication {
  async initialize() {
    const uel = UEL.getInstance();
    await uel.initialize();
    // No cleanup strategy
  }
}
```

## API Reference

### UEL Main Interface

```typescript
class UEL {
  // Singleton pattern
  static getInstance(): UEL;
  
  // Initialization
  async initialize(config?: UELInitConfig): Promise<void>;
  isInitialized(): boolean;
  
  // Core component access
  getFactory(): UELFactory;
  getRegistry(): UELRegistry;
  getEventManager(): EventManager;
  getEventRegistry(): EventRegistry;
  getValidationFramework(): UELValidationFramework;
  getCompatibilityFactory(): CompatibilityFactory;
  
  // Event manager creation
  async createSystemEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<ISystemEventManager>;
  async createCoordinationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<ICoordinationEventManager>;
  async createCommunicationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<ICommunicationEventManager>;
  async createMonitoringEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<IMonitoringEventManager>;
  // ... other event manager types
  
  // Enhanced system creation
  async createEnhancedEventBus(options?: EnhancedEventBusOptions): Promise<UELEnhancedEventBus>;
  async createEnhancedApplicationCoordinator(options?: EnhancedCoordinatorOptions): Promise<UELEnhancedApplicationCoordinator>;
  async createEnhancedObserverSystem(options?: EnhancedObserverOptions): Promise<UELEnhancedObserverSystem>;
  
  // Compatibility and migration
  async createCompatibleEventEmitter(name: string, type?: EventManagerType, options?: CompatibilityOptions): Promise<UELCompatibleEventEmitter>;
  async migrateEventEmitter(emitter: EventEmitter, name: string, type?: EventManagerType): Promise<UELCompatibleEventEmitter>;
  async analyzeSystemEventEmitters(systems: Record<string, EventEmitter>): Promise<SystemAnalysis>;
  
  // System operations
  async getHealthStatus(): Promise<EventManagerStatus[]>;
  async getGlobalMetrics(): Promise<GlobalMetrics>;
  async getSystemStatus(): Promise<SystemStatus>;
  async validateSystem(options?: ValidationOptions): Promise<ValidationResult>;
  async broadcast<T extends SystemEvent>(event: T): Promise<void>;
  async shutdown(): Promise<void>;
}
```

### UELHelpers Utility Functions

```typescript
const UELHelpers = {
  // Complete system setup
  async initializeCompleteSystem(config?: CompleteSystemConfig): Promise<UEL>;
  async setupCommonEventManagers(config?: CommonManagersConfig): Promise<EventManagers>;
  async setupCompleteUELSystem(options?: CompleteSetupOptions): Promise<CompleteSystemResult>;
  
  // Migration utilities
  async migrateObserverSystem(observerSystem: any): Promise<MigrationResult>;
  async migrateSystemToUEL(systems: SystemsMap): Promise<SystemMigrationResult>;
  
  // Monitoring and validation
  async getQuickStatus(): Promise<QuickStatus>;
  async performHealthCheck(): Promise<HealthCheckResult>;
  async performCompleteValidation(options?: ValidationOptions): Promise<CompleteValidationResult>;
  
  // Event utilities
  createEventBuilder(): EventBuilder;
};
```

### Event Manager Types

```typescript
const EventManagerTypes = {
  SYSTEM: 'system',
  COORDINATION: 'coordination',
  COMMUNICATION: 'communication',
  MONITORING: 'monitoring',
  INTERFACE: 'interface',
  NEURAL: 'neural',
  DATABASE: 'database',
  MEMORY: 'memory',
  WORKFLOW: 'workflow'
} as const;
```

### Event Categories

```typescript
const EventCategories = {
  SYSTEM: 'system',
  COORDINATION: 'coordination',
  COMMUNICATION: 'communication',
  MONITORING: 'monitoring',
  INTERFACE: 'interface',
  NEURAL: 'neural',
  DATABASE: 'database',
  MEMORY: 'memory',
  WORKFLOW: 'workflow'
} as const;
```

## Integration with Claude-Zen Systems

UEL integrates seamlessly with all claude-zen systems:

- **Swarm Coordination**: Events for agent lifecycle, task coordination, and swarm management
- **Memory System**: Events for cache operations, memory allocation, and persistence
- **Neural Networks**: Events for training, prediction, and model management
- **Interfaces**: Events for CLI, TUI, Web, and API interactions
- **Database**: Events for queries, migrations, and performance monitoring
- **Workflows**: Events for workflow execution, state changes, and error handling

## Conclusion

UEL provides a comprehensive, type-safe, and backward-compatible event management system for claude-zen. Its layered architecture, factory patterns, and migration utilities make it easy to adopt gradually while providing immediate benefits for event handling, monitoring, and system integration.

For detailed usage examples and advanced patterns, see the `examples/` directory and refer to the inline documentation in each module.