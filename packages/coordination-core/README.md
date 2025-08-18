# @claude-zen/coordination-core

Strategic multi-swarm coordination system with **clean, generic Matrons** and minimal dependencies.

## 🎯 **Overview**

`@claude-zen/coordination-core` provides the strategic coordination layer for multi-swarm AI systems with a clean, minimal approach:

- **Generic Matron System**: One flexible Matron class instead of separate dev/ops files
- **Minimal Dependencies**: Only depends on foundation packages
- **Clean Architecture**: Simple, focused coordination without complex business logic

### **Architecture Layers**

```
QUEENS (Strategic Multi-Swarm Coordination)
    ↓
COMMANDERS (Tactical Swarm Coordination) 
    ↓
GENERIC MATRONS (Universal Domain Specialization)
```

## 🚀 **Features**

### **Strategic Coordination**
- **Queen Coordinators**: Multi-swarm resource allocation and priority management
- **Swarm Commanders**: Tactical coordination for individual swarms
- **Generic Matrons**: Universal domain specialists (dev, ops, security, testing, analytics, research)

### **Clean Design**
- **No Business Logic**: Pure coordination primitives
- **Generic Components**: One Matron handles all domains
- **Minimal Dependencies**: Just foundation packages
- **Type-Safe**: Full TypeScript support

## 📦 **Installation**

```bash
pnpm add @claude-zen/coordination-core
```

## 🔧 **Usage**

### **Basic Strategic Coordination**

```typescript
import { QueenCoordinator, SwarmCommander, GenericMatron } from '@claude-zen/coordination-core';

// Create strategic coordinator
const queen = new QueenCoordinator({
  domain: 'multi-swarm',
  maxSwarms: 5,
  resourceLimits: { cpu: 0.8, memory: '2GB' }
});

await queen.initialize();

// Create tactical commander
const commanderId = await queen.spawnCommander({
  type: 'development',
  domain: 'software-engineering',
  capabilities: ['code-generation', 'review', 'testing']
});
```

### **Generic Matron System**

```typescript
// Development domain matron
const devMatron = new GenericMatron({
  domain: 'development',
  specialization: 'backend-systems',
  capabilities: ['typescript', 'rust', 'python']
});

await devMatron.initialize();

// Operations domain matron  
const opsMatron = new GenericMatron({
  domain: 'operations',
  specialization: 'deployment-automation', 
  capabilities: ['docker', 'kubernetes', 'aws']
});

await opsMatron.initialize();

// Security domain matron
const securityMatron = new GenericMatron({
  domain: 'security',
  specialization: 'vulnerability-assessment',
  capabilities: ['threat-analysis', 'compliance', 'auditing']
});

// Cross-domain coordination
await devMatron.coordinateWith(opsMatron, {
  objective: 'deploy-microservice',
  requirements: ['blue-green-deployment', 'health-checks']
});
```

### **All Domain Types**

The `GenericMatron` supports all domains through the `MatronDomain` type:

```typescript
type MatronDomain = 
  | 'development'  // Code, architecture, testing coordination
  | 'operations'   // Deployment, infrastructure, monitoring
  | 'security'     // Security assessment, compliance, threat analysis  
  | 'testing'      // Test planning, quality assurance, automation
  | 'analytics'    // Data analysis, metrics collection, reporting
  | 'research'     // Literature review, experimentation, synthesis
```

## 🏗️ **Architecture Benefits**

### **✅ Generic vs Specific Files**
- **Before**: Separate DevCubeMatron, OpsCubeMatron, SecurityMatron files
- **After**: One `GenericMatron` handles all domains dynamically
- **Result**: Cleaner codebase, easier maintenance, better scalability

### **✅ Minimal Dependencies** 
- **Only depends on**: `@claude-zen/foundation`, `@claude-zen/event-system`, `@claude-zen/agent-manager`
- **No complex business logic**: Pure coordination primitives
- **Clean extraction**: No circular dependencies or missing files

### **✅ Type Safety**
- Full TypeScript support with strict typing
- Domain-specific capability generation
- Comprehensive coordination interfaces

## 🔗 **Integration**

### **With Other Packages**

```typescript
// Works with operational agent management
import { AgentManager } from '@claude-zen/agent-manager';

// Uses foundation utilities
import { getLogger } from '@claude-zen/foundation';

// Integrates with event system (for future event-based coordination)
import { TypeSafeEventBus } from '@claude-zen/event-system';
```

## 🧪 **Testing**

```bash
# Run tests
pnpm test

# Build package
pnpm build
```

## 🤝 **Related Packages**

- **[@claude-zen/sparc](../sparc)** - SPARC methodology (extracted separately)
- **[@claude-zen/agent-manager](../agent-manager)** - Operational agent management
- **[@claude-zen/foundation](../foundation)** - Core utilities and interfaces
- **[@claude-zen/event-system](../event-system)** - Type-safe event coordination

## 📄 **License**

MIT - See [LICENSE](../../LICENSE) file for details.

---

**Clean Strategic AI Coordination** 🎯