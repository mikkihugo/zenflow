# SPARC Integration Usage Guide

## Overview

The SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology is now **deeply integrated** with Claude-Zen's existing sophisticated infrastructure. This guide shows you exactly how to use SPARC effectively.

## 🚀 Quick Start - How to Use SPARC

### 1. Via Direct Engine (Recommended)

```typescript
import { SPARC } from './sparc';

// Create a new SPARC project with full infrastructure integration
const project = await SPARC.createProject(
  'Intelligent Load Balancer',
  'swarm-coordination',
  [
    'Distribute load across 1000+ agents',
    'Sub-100ms response time',
    'Fault tolerance and recovery'
  ],
  'high'
);

// Execute specific phases directly
const sparcEngine = SPARC.getEngine();
const result = await sparcEngine.executePhase(project, 'architecture');

// Generate comprehensive project artifacts
const artifacts = await sparcEngine.generateArtifacts(project);
```

### 2. Via Task System Integration

```typescript
import { EnhancedTaskTool } from '../coordination/enhanced-task-tool.js';

const taskTool = EnhancedTaskTool.getInstance();

// Execute SPARC project as coordinated tasks
const sparcTask = await taskTool.executeTask({
  description: 'Execute SPARC methodology for neural network optimization',
  prompt: 'Create a SPARC project for optimizing neural network training performance',
  subagent_type: 'sparc-coordinator',
  use_claude_subagent: true,
  domain_context: 'neural-networks with WASM acceleration',
  priority: 'high',
  timeout_minutes: 240, // 4 hours for full SPARC cycle
});
```

### 3. Via Direct Engine Integration

```typescript
import { SPARCEngineCore } from '../sparc/core/sparc-engine.js';

const sparcEngine = new SPARCEngineCore();

// Initialize project with deep infrastructure integration
const project = await sparcEngine.initializeProject({
  name: 'Memory System Optimization',
  domain: 'memory-systems',
  complexity: 'enterprise',
  requirements: [
    'Multi-backend support (SQLite, LanceDB, JSON)',
    'Connection pooling optimization',
    'Cache coherency protocols'
  ],
  constraints: [
    'Must integrate with existing UnifiedMemorySystem',
    'Backward compatibility required',
    'Performance improvement >30%'
  ]
});

// Execute phases with swarm coordination
await sparcEngine.executePhase(project.id, 'specification');
await sparcEngine.executePhase(project.id, 'architecture');
```

## 🔧 Deep Infrastructure Integration

### DocumentDrivenSystem Integration

SPARC automatically integrates with the existing document workflow:

```
Vision Document → ADRs → PRDs → Epics → Features → Tasks → Code
     ↓              ↓      ↓      ↓        ↓        ↓      ↓
  SPARC Spec → Architecture → Implementation → Testing → Deployment
```

**What happens automatically:**
- ✅ Vision documents created and processed
- ✅ ADRs generated using existing `docs/adrs/adr-template.md`
- ✅ PRDs created with business requirements
- ✅ Epics mapped to SPARC phases
- ✅ Features broken down from specifications
- ✅ Tasks generated using existing TaskAPI

### Swarm Coordination Integration

SPARC leverages the existing 147+ agent types for distributed development:

```typescript
// Automatic agent assignment by phase
specification: ['requirements-analyst', 'sparc-coordinator', 'documentation-specialist']
pseudocode: ['implementer-sparc-coder', 'system-architect', 'sparc-coordinator']
architecture: ['system-architect', 'performance-engineer', 'security-engineer']
refinement: ['performance-engineer', 'security-engineer', 'test-engineer']
completion: ['implementer-sparc-coder', 'test-engineer', 'documentation-specialist']
```

### Memory System Integration

All SPARC data is persisted using existing infrastructure:

```typescript
// Automatic integration with UnifiedMemorySystem
- Project state → SQLite backend
- Vector embeddings → LanceDB backend  
- Configuration → JSON backend
- Cache management → Existing pooling system
```

## 📋 Generated Artifacts

When you run SPARC, it generates comprehensive project management artifacts:

### tasks.json Integration
```json
{
  "id": "SPARC-001",
  "title": "SPARC Architecture Phase - Neural Network Optimizer",
  "component": "sparc-neural-networks",
  "description": "Execute architecture phase with swarm coordination",
  "status": "in_progress",
  "priority": 3,
  "sparc_project_id": "proj-abc123",
  "assigned_agents": ["system-architect", "performance-engineer"]
}
```

### ADRs (Architecture Decision Records)
```markdown
# ADR-SPARC-001: Neural Network Architecture

## Status
Proposed

## Context
SPARC architecture phase for neural network optimization project.

## Decision
Implement WASM-accelerated training with distributed coordination.

## Consequences
- 300%+ performance improvement
- Better resource utilization
- Seamless integration with existing neural domain
```

### Epics and Features
```json
{
  "epics": [
    {
      "id": "epic-sparc-neural",
      "title": "Neural Network Optimization",
      "business_value": "Faster training, better resource utilization",
      "sparc_project_id": "proj-abc123"
    }
  ],
  "features": [
    {
      "id": "feature-wasm-integration",
      "title": "WASM Acceleration",
      "epic_id": "epic-sparc-neural",
      "sparc_project_id": "proj-abc123"
    }
  ]
}
```

## 🎯 Domain-Specific Templates

SPARC includes pre-built templates for common Claude-Zen patterns:

### 1. Swarm Coordination Template
```typescript
const swarmProject = await SPARC.createProject(
  'Intelligent Agent Swarm',
  'swarm-coordination',
  ['Agent coordination', 'Load balancing', 'Fault tolerance']
);
```

**Generates:**
- Agent registry optimization
- Load balancing algorithms
- Consensus protocols
- Health monitoring systems

### 2. Neural Networks Template
```typescript
const neuralProject = await SPARC.createProject(
  'WASM-Accelerated Training',
  'neural-networks',
  ['Training optimization', 'WASM integration', 'Distributed coordination']
);
```

**Generates:**
- WASM computational kernels
- Training pipeline optimization
- Model management systems
- Performance profiling tools

### 3. Memory Systems Template
```typescript
const memoryProject = await SPARC.createProject(
  'Multi-Backend Storage',
  'memory-systems',
  ['Connection pooling', 'Cache coherency', 'Performance optimization']
);
```

**Generates:**
- Connection pool management
- Cache invalidation strategies
- Consistency protocols
- Monitoring dashboards

### 4. REST API Template
```typescript
const apiProject = await SPARC.createProject(
  'Enterprise API Gateway',
  'rest-api',
  ['Authentication', 'Rate limiting', 'Documentation']
);
```

**Generates:**
- Authentication middleware
- Rate limiting algorithms
- OpenAPI specifications
- Monitoring endpoints

## 🔄 Workflow Integration

### Existing vs SPARC Workflows

**Before SPARC:**
```
Manual development → Ad-hoc architecture → Implementation issues
```

**With SPARC Integration:**
```
SPARC Methodology → Existing Infrastructure → Production-Ready Code
       ↓                      ↓                        ↓
  Systematic design → DocumentDrivenSystem → Swarm Coordination
       ↓                      ↓                        ↓
  Quality assurance → UnifiedWorkflowEngine → TaskAPI execution
```

### Automated Execution

SPARC executes automatically through existing systems:

1. **Vision Processing** → DocumentDrivenSystem
2. **Task Creation** → TaskAPI and EnhancedTaskTool
3. **Swarm Coordination** → Existing agent types and protocols
4. **Memory Management** → UnifiedMemorySystem
5. **Workflow Execution** → UnifiedWorkflowEngine

## 💡 When to Use SPARC

### ✅ Use SPARC When:
- **Complex projects** requiring systematic approach
- **Architecture decisions** need documentation (ADRs)
- **Team coordination** across multiple agents/developers
- **Quality assurance** and systematic testing required
- **Performance optimization** is critical
- **Integration** with existing Claude-Zen infrastructure needed

### ⚠️ Consider Alternatives When:
- **Simple bug fixes** or minor features
- **Prototyping** where speed > structure
- **Emergency hotfixes** requiring immediate deployment
- **Deprecated systems** not worth systematic renovation

### 🎯 SPARC Adds Value Through:
- **Systematic methodology** prevents architecture drift
- **Swarm coordination** enables distributed development
- **Infrastructure integration** leverages existing sophisticated systems
- **Comprehensive artifacts** provide complete project documentation
- **Quality gates** ensure production readiness

## 🚀 Getting Started Checklist

- [ ] Choose your integration method (MCP tools, Task system, or Direct engine)
- [ ] Select appropriate domain template
- [ ] Define project requirements and constraints
- [ ] Initialize SPARC project with infrastructure integration
- [ ] Monitor progress through existing task management
- [ ] Review generated artifacts (ADRs, epics, features, tasks)
- [ ] Deploy using generated implementation artifacts

## 📊 Monitoring and Status

Check SPARC project status:

```typescript
// Get comprehensive project status
const status = await sparcEngine.getSPARCProjectStatus('project-id');

console.log({
  project: status.project,
  swarmStatus: status.swarmStatus,
  infrastructureIntegration: status.infrastructureIntegration
});
```

**SPARC enhances Claude-Zen development by providing systematic methodology while fully integrating with and extending existing sophisticated infrastructure.**