# Event System Architecture - Foundation-Based Integration

## Overview

The claude-code-zen event system has been **completely unified** under the `@claude-zen/foundation` package. The separate `@claude-zen/event-system` package has been **removed** and all packages now use the foundation's comprehensive event system.

## 🏗️ Architecture

### **Foundation Event System (Single Source of Truth)**

```
@claude-zen/foundation
├── EventBus - Modern TypeScript event system with middleware
├── EventEmitter - High-performance event emitter
├── DynamicEventRegistry - Runtime event discovery and metrics
├── EventCatalog - 50+ event types with validation
├── EventLogger - Structured logging with flow tracking
└── Event Validation - Type-safe event names and categories
```

### **Package Integration Pattern**

All packages now follow this integration pattern:

1. **Import from foundation**: `import { EventBus } from '@claude-zen/foundation'`
2. **Use foundation EventBus**: `EventBus.getInstance()`
3. **Register with DynamicEventRegistry**: For monitoring and discovery
4. **Emit validated events**: Using foundation's event validation

## 📦 Package Status

### **✅ FULLY INTEGRATED**

| Package | Status | Integration Method |
|---------|--------|-------------------|
| `@claude-zen/foundation` | ✅ **Complete** | Core event system |
| `@claude-zen/brain` | ✅ **Complete** | Direct foundation usage |
| `@claude-zen/load-balancing` | ✅ **Complete** | Direct foundation usage |
| `@claude-zen/coordination` | ✅ **Complete** | WebSocket Hub + foundation |
| `@claude-zen/web-dashboard` | ✅ **Complete** | Event system service |

### **✅ BRIDGED INTEGRATION**

| Package | Status | Bridge Method |
|---------|--------|---------------|
| `@claude-zen/system-monitoring` | ✅ **Complete** | Event bridge to foundation |
| `@claude-zen/agent-monitoring` | ✅ **Complete** | Event bridge to foundation |
| `@claude-zen/telemetry` | ✅ **Complete** | Event bridge to foundation |
| `@claude-zen/knowledge` | ✅ **Complete** | Event bridge to foundation |

### **✅ ENHANCED INTEGRATION**

| Package | Status | Enhancement |
|---------|--------|-------------|
| `@claude-zen/memory` | ✅ **Complete** | Foundation EventEmitter + getEventSystem |
| `@claude-zen/code-analyzer` | ✅ **Complete** | Foundation EventBus with fallback |

## 🔄 Integration Methods

### **Method 1: Direct Foundation Usage**

```typescript
import { EventBus, EventLogger } from '@claude-zen/foundation';

export class MyService {
  private eventBus = EventBus.getInstance();
  
  async initialize() {
    // Register with DynamicEventRegistry
    await this.eventBus.emit('registry:module-register', {
      moduleId: 'my-service',
      moduleName: 'My Service',
      moduleType: 'service',
      supportedEvents: ['my:event']
    });
  }
  
  emitEvent(data: unknown) {
    this.eventBus.emit('my:event', data);
  }
}
```

### **Method 2: Event Bridge Pattern**

For packages that need to maintain "ZERO IMPORTS" architecture:

```typescript
// knowledge-event-bridge.ts
import { EventBus, EventLogger } from '@claude-zen/foundation';

export class KnowledgeEventBridge {
  private eventBus = EventBus.getInstance();
  
  async start() {
    // Register module
    this.eventBus.emit('registry:module-register', {
      moduleId: 'knowledge',
      moduleName: 'Knowledge Management',
      moduleType: 'knowledge-bridge',
      supportedEvents: ['knowledge:*']
    });
    
    // Set up event forwarding
    await this.setupEventForwarding();
  }
}
```

### **Method 3: WebSocket Hub Integration**

For real-time event broadcasting:

```typescript
// websocket-hub.ts
import { EventBus, DynamicEventRegistry, dynamicEventRegistry } from '@claude-zen/foundation';

export class WebsocketHub {
  async initialize() {
    // Register with DynamicEventRegistry
    await dynamicEventRegistry.registerModule({
      name: 'websocket-hub',
      version: '1.0.0',
      capabilities: ['websocket-broadcasting', 'event-forwarding'],
      status: 'active'
    });
    
    // Subscribe to foundation EventBus
    this.eventBus.on('*', this.handleEvent.bind(this));
  }
}
```

## 🎯 Event Flow Patterns

### **Real-Time Event Flow**

```
Service → Foundation EventBus → DynamicEventRegistry → WebSocket Hub → Web Dashboard
```

### **Event Validation Flow**

```
Event Emission → isValidEventName() → EventCatalog → EventBus → Listeners
```

### **Module Registration Flow**

```
Package → Event Bridge → registry:module-register → DynamicEventRegistry → Monitoring
```

## 📊 Monitoring & Metrics

### **Dynamic Event Registry**

- **Active Modules**: Real-time module discovery
- **Event Flows**: Event routing and latency tracking
- **Event Metrics**: Performance and health monitoring
- **System Health**: Overall event system status

### **Web Dashboard Integration**

- **Real-Time Events**: Live event visualization
- **Module Status**: Active module monitoring
- **Performance Metrics**: Event latency and throughput
- **System Health**: Overall system status

## 🧪 Testing

### **Integration Test**

Run the comprehensive integration test:

```bash
node test-event-system-integration.mjs
```

This test validates:
- Foundation EventBus functionality
- All package bridges
- WebSocket Hub integration
- Event catalog validation
- Tool integrations

### **Manual Testing**

1. **Start the system**: `pnpm dev`
2. **Check Web Dashboard**: Monitor real-time events
3. **Verify Package Logs**: Ensure events are flowing
4. **Test Event Validation**: Verify catalog compliance

## 🚀 Benefits of New Architecture

### **1. Single Source of Truth**
- All events flow through foundation EventBus
- Consistent event validation and logging
- Unified monitoring and metrics

### **2. Real-Time Visibility**
- Live event flow visualization
- Active module monitoring
- Performance metrics tracking

### **3. Type Safety**
- Comprehensive event catalog
- Runtime event validation
- IDE autocomplete support

### **4. Scalability**
- Dynamic module registration
- Event routing optimization
- Performance monitoring

### **5. Maintainability**
- Centralized event system
- Consistent patterns across packages
- Easy debugging and monitoring

## 🔧 Configuration

### **Environment Variables**

```bash
# Enable WebSocket Hub bridge (default: on)
ZEN_EVENT_HUB_BRIDGE=on

# Event logging level
NODE_ENV=development  # Enables debug logging
DEBUG=true           # Enables detailed event logging
```

### **Event Catalog Categories**

- **sparc**: SPARC methodology events
- **llm**: LLM inference events
- **claude-code**: Claude Code execution events
- **teamwork**: Teamwork collaboration events
- **safe**: SAFe framework events
- **git**: Git operation events
- **database**: Database operation events
- **brain**: Brain coordination events
- **registry**: Module registration events
- **system**: System-level events

## 📝 Migration Guide

### **For Package Maintainers**

1. **Remove old imports**: Replace `@claude-zen/event-system` with `@claude-zen/foundation`
2. **Update event usage**: Use foundation EventBus methods
3. **Add module registration**: Register with DynamicEventRegistry
4. **Test integration**: Verify events flow correctly

### **For Application Developers**

1. **Import from foundation**: `import { EventBus } from '@claude-zen/foundation'`
2. **Use foundation patterns**: Follow established event patterns
3. **Monitor events**: Use Web Dashboard for real-time monitoring
4. **Validate events**: Use foundation event validation

## 🎉 Conclusion

The event system unification is **complete** and provides:

- **Unified Architecture**: Single foundation-based event system
- **Real-Time Monitoring**: Live event visualization and metrics
- **Type Safety**: Comprehensive event validation and catalog
- **Performance**: Optimized event routing and processing
- **Scalability**: Dynamic module registration and discovery

All packages now use the foundation event system, providing a consistent, reliable, and observable event-driven architecture across the entire claude-code-zen ecosystem.

---

**Next Steps**: 
1. Run integration tests to verify functionality
2. Monitor Web Dashboard for real-time events
3. Use foundation patterns for new event implementations
4. Leverage DynamicEventRegistry for monitoring and discovery
