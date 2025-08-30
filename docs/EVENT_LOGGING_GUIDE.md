# Event-Based Logging Usage Guide

The zenflow repository includes a comprehensive event-based logging system that provides structured, contextual logging for development and debugging. This guide demonstrates how to use the existing event logging infrastructure.

## Overview

The event-based logging system consists of:

- **EventLogger**: Core logging class with environment-based enablement
- **DynamicEventRegistry**: Real-time event discovery and monitoring
- **EventBus**: Modern TypeScript event system with middleware support
- **Integration with OpenTelemetry**: For production telemetry and metrics

## Quick Start

### Basic Event Logging

```typescript
import { EventLogger, logEvent, logFlow, logError } from '@claude-zen/foundation';

// Basic event logging
EventLogger.log('user-action', { action: 'button-click', userId: '123' });

// Or use convenience functions
logEvent('api-request', { endpoint: '/users', method: 'GET' });
```

### Flow Tracking

```typescript
import { logFlow } from '@claude-zen/foundation';

// Track data flow between components
logFlow('UserService', 'DatabaseService', 'user-query');
logFlow('Controller', 'BusinessLogic', 'process-request');
```

### Contextual Logging

```typescript
import { EventLogger } from '@claude-zen/foundation';

// Log with rich context
EventLogger.logWithContext('database-operation', 
  { query: 'SELECT * FROM users', duration: 45 },
  {
    component: 'DatabaseService',
    phase: 'execution',
    timestamp: new Date()
  }
);
```

### Error Event Logging

```typescript
import { EventLogger, logError } from '@claude-zen/foundation';

try {
  // Some operation
} catch (error) {
  EventLogger.logError('operation-failed', error, {
    component: 'PaymentService',
    phase: 'charge-processing'
  });
  
  // Or use convenience function
  logError('validation-error', error, 'UserValidator');
}
```

## Configuration

### Environment-Based Enablement

Event logging is automatically enabled when:

```bash
# Development environment
NODE_ENV=development

# Or explicit enablement
CLAUDE_EVENT_LOGGING=true
```

### Programmatic Control

```typescript
import { EventLogger } from '@claude-zen/foundation';

// Force enable regardless of environment
EventLogger.enable();

// Check current status
if (EventLogger.isEnabled()) {
  console.log('Event logging is active');
}

// Disable when needed
EventLogger.disable();
```

## Advanced Usage

### Event-Driven Services

The system includes event-driven telemetry and monitoring:

```typescript
// Event-driven telemetry automatically captures system events
// No direct imports needed - uses event system internally

// System monitoring emits events like:
// - 'system:cpu-usage'
// - 'system:memory-usage'
// - 'system:disk-usage'
```

### Dynamic Event Discovery

```typescript
import { DynamicEventRegistry } from '@claude-zen/foundation';

// Register a module for event tracking
DynamicEventRegistry.registerModule({
  moduleId: 'my-service',
  moduleName: 'MyService',
  moduleType: 'business-logic',
  supportedEvents: ['user-created', 'order-processed']
});

// Get real-time metrics
const metrics = DynamicEventRegistry.getMetrics();
console.log('Total events:', metrics.totalEvents);
console.log('Events per second:', metrics.eventsPerSecond);
console.log('System health:', metrics.systemHealth);
```

### Custom Event Bus Usage

```typescript
import { EventBus } from '@claude-zen/foundation';

// Define typed events
interface MyEvents {
  'user-registered': { userId: string; email: string };
  'order-placed': { orderId: string; amount: number };
}

// Create event bus
const eventBus = new EventBus<MyEvents>();

// Listen for events
eventBus.on('user-registered', (data) => {
  logEvent('user-registration-processed', data);
});

// Emit events
eventBus.emit('user-registered', {
  userId: '123',
  email: 'user@example.com'
});
```

## Integration Examples

### Neural Network Training

```typescript
import { logEvent, logFlow } from '@claude-zen/foundation';

class NeuralTrainingService {
  async trainModel(config: TrainingConfig) {
    logEvent('training-started', { 
      modelType: config.modelType,
      epochs: config.epochs 
    });
    
    try {
      logFlow('TrainingService', 'NeuralEngine', 'forward-pass');
      const result = await this.neuralEngine.train(config);
      
      logEvent('training-completed', {
        finalAccuracy: result.accuracy,
        duration: result.duration
      });
      
      return result;
    } catch (error) {
      logError('training-failed', error, 'NeuralTrainingService');
      throw error;
    }
  }
}
```

### Coordination Service

```typescript
import { EventLogger } from '@claude-zen/foundation';

class AgentCoordinationService {
  async coordinateAgents(topology: CoordinationTopology) {
    EventLogger.logWithContext('coordination-init', 
      { topology: topology.type, agentCount: topology.agents.length },
      { component: 'CoordinationService', phase: 'initialization' }
    );
    
    // Coordination logic...
    
    EventLogger.logFlow('CoordinationService', 'AgentManager', 'task-distribution');
  }
}
```

## Best Practices

### 1. Use Consistent Event Names

```typescript
// Good: Hierarchical naming
logEvent('user:authentication:success', { userId, loginMethod });
logEvent('order:payment:failed', { orderId, errorCode });

// Avoid: Inconsistent naming
logEvent('userLogin', data);
logEvent('pay_error', data);
```

### 2. Include Rich Context

```typescript
// Good: Rich context
EventLogger.logWithContext('api-request',
  { endpoint: '/api/users', method: 'POST', responseTime: 150 },
  { component: 'APIGateway', phase: 'request-processing' }
);

// Basic: Minimal context (still useful)
logEvent('api-request', { endpoint: '/api/users' });
```

### 3. Track Component Flows

```typescript
// Track data flow through system
logFlow('WebController', 'BusinessService', 'user-creation');
logFlow('BusinessService', 'DatabaseService', 'user-persistence');
logFlow('DatabaseService', 'CacheService', 'cache-invalidation');
```

### 4. Use Appropriate Log Levels

```typescript
// Use logError for actual errors
logError('payment-processing-failed', error, 'PaymentService');

// Use regular logEvent for informational events
logEvent('user-profile-updated', { userId, fields: ['email', 'name'] });
```

## Monitoring and Analytics

The event logging system integrates with:

- **OpenTelemetry Collector**: For production telemetry export
- **System Monitoring**: Real-time system metrics
- **Dynamic Event Registry**: Event flow analysis and health monitoring

Events are automatically captured and can be exported to external monitoring systems like Jaeger, Prometheus, or custom analytics platforms.

## Troubleshooting

### Event Logging Not Working

1. Check environment variables:
   ```bash
   echo $NODE_ENV
   echo $CLAUDE_EVENT_LOGGING
   ```

2. Verify programmatic enablement:
   ```typescript
   import { EventLogger } from '@claude-zen/foundation';
   console.log('Logging enabled:', EventLogger.isEnabled());
   ```

3. Force enable for testing:
   ```typescript
   EventLogger.enable();
   ```

### Performance Considerations

- Event logging has minimal overhead when disabled
- Use structured data in payloads for better analysis
- Avoid logging sensitive information (PII, credentials)
- Consider sampling for high-frequency events in production

## Conclusion

The zenflow event-based logging system provides a robust foundation for debugging, monitoring, and analytics. It's designed to be lightweight, type-safe, and easily configurable for different environments.

For more advanced usage patterns, refer to the source code in `packages/core/foundation/src/events/` and the existing integration examples in the services packages.