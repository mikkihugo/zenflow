# @claude-zen/sparc

**SPARC Methodology** - Systematic development workflow (Specification, Pseudocode, Architecture, Refinement, Completion)

## 🎯 **Overview**

`@claude-zen/sparc` provides a clean, standalone implementation of the SPARC methodology for systematic AI-assisted development. This package was **extracted from coordination** to be its own focused methodology system.

### **SPARC Phases**

```
SPECIFICATION → PSEUDOCODE → ARCHITECTURE → REFINEMENT → COMPLETION
```

- **Specification**: Goals, scope, constraints, success criteria
- **Pseudocode**: Algorithms, data structures, workflows  
- **Architecture**: Components, relationships, patterns, technologies
- **Refinement**: Optimizations, improvements, changes
- **Completion**: Implementation, tests, documentation, deployment

## 🚀 **Features**

### **Clean Implementation**
- **Standalone Package**: No complex coordination dependencies
- **Minimal Dependencies**: Only foundation and event-system packages
- **Type-Safe**: Full TypeScript support with comprehensive interfaces
- **Engine-Based**: Core SPARC engine with phase handlers

### **Comprehensive Types**
- Complete SPARC project definitions
- All phase result interfaces
- Progress tracking and metrics
- Implementation artifacts

## 📦 **Installation**

```bash
pnpm add @claude-zen/sparc
```

## 🔧 **Usage**

### **Quick SPARC Project**

```typescript
import { SPARC } from '@claude-zen/sparc';

// Create a new SPARC project
const project = await SPARC.createProject(
  'user-authentication-system',
  'rest-api',
  ['JWT tokens', 'password hashing', 'rate limiting'],
  'moderate'
);

// Execute full SPARC workflow
const results = await SPARC.executeFullWorkflow(project.id);

console.log('SPARC phases completed:', results.length);
results.forEach(result => {
  console.log(`${result.phase}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
});
```

### **Manual Phase Execution**

```typescript
import { SPARCEngineCore } from '@claude-zen/sparc';

const engine = new SPARCEngineCore({
  defaultTimeout: 300000, // 5 minutes
  enableMetrics: true,
  maxProjects: 100
});

// Initialize project
const project = await engine.initializeProject({
  name: 'microservice-api',
  domain: 'rest-api',
  complexity: 'high',
  requirements: ['GraphQL', 'authentication', 'rate limiting', 'caching']
});

// Execute individual phases
const specResult = await engine.executePhase(project, 'specification');
const pseudoResult = await engine.executePhase(project, 'pseudocode');
const archResult = await engine.executePhase(project, 'architecture');
const refineResult = await engine.executePhase(project, 'refinement');
const completeResult = await engine.executePhase(project, 'completion');
```

### **Project Progress Tracking**

```typescript
// Get project details
const project = SPARC.getProject(projectId);

if (project) {
  console.log('Current phase:', project.currentPhase);
  console.log('Overall progress:', project.progress.overallProgress);
  console.log('Phases completed:', project.progress.phasesCompleted);
  console.log('Time spent:', project.progress.timeSpent);
}

// List all projects
const allProjects = SPARC.listProjects();
console.log(`Total projects: ${allProjects.length}`);
```

## 🏗️ **Architecture**

### **Core Components**

- **`SPARCEngineCore`**: Main SPARC methodology engine
- **Phase Handlers**: Individual handlers for each SPARC phase
- **Project Management**: Creation, tracking, and progress monitoring
- **Type System**: Comprehensive TypeScript interfaces

### **Supported Domains**

```typescript
type ProjectDomain = 
  | 'swarm-coordination'
  | 'neural-networks' 
  | 'wasm-integration'
  | 'rest-api'
  | 'memory-systems'
  | 'interfaces'
  | 'general'
```

### **Complexity Levels**

```typescript
type ProjectComplexity = 'simple' | 'moderate' | 'high' | 'complex' | 'enterprise'
```

## 📊 **Project Structure**

A complete SPARC project includes:

```typescript
interface SPARCProject {
  id: string;
  name: string;
  domain: ProjectDomain;
  complexity: ProjectComplexity;
  requirements: string[];
  currentPhase: SPARCPhase;
  
  // Phase outputs
  specification?: ProjectSpecification;
  pseudocode?: ProjectPseudocode;
  architecture?: ProjectArchitecture;  
  refinements?: ProjectRefinement[];
  implementation?: ProjectImplementation;
  
  // Tracking
  progress: SPARCProgress;
  metadata: Record<string, unknown>;
}
```

## 🔄 **Phase Results**

Each phase returns structured results:

```typescript
interface PhaseResult {
  phase: SPARCPhase;
  success: boolean;
  data?: unknown;      // Phase-specific output
  duration: number;    // Execution time in ms
  timestamp: number;   // Completion timestamp
}
```

## 🎯 **Why Separate Package?**

**SPARC was extracted from coordination** because:

1. **Focused Methodology**: SPARC is a complete development methodology, not just coordination
2. **Reusable System**: Can be used independently of swarm coordination
3. **Clean Dependencies**: No circular dependencies with coordination systems
4. **Standalone Value**: Valuable as its own systematic development tool

## 🔗 **Integration**

### **With Coordination Systems**

```typescript
import { SPARC } from '@claude-zen/sparc';
import { SwarmCommander } from '@claude-zen/coordination-core';

// Use SPARC within coordination workflows
const commander = new SwarmCommander({...});
const project = await SPARC.createProject('system-integration', 'general', ['requirement1'], 'moderate');

// Execute SPARC phases as part of coordination
const results = await SPARC.executeFullWorkflow(project.id);
```

### **With Foundation Utilities**

```typescript
import { getLogger } from '@claude-zen/foundation';
import { SPARCEngineCore } from '@claude-zen/sparc';

const logger = getLogger('sparc-workflow');
const engine = new SPARCEngineCore();

// Logging is integrated throughout SPARC execution
```

## 🧪 **Testing**

```bash
# Run tests
pnpm test

# Build package
pnpm build

# Clean dist
pnpm clean
```

## 🤝 **Related Packages**

- **[@claude-zen/coordination-core](../coordination-core)** - Strategic coordination (can use SPARC)
- **[@claude-zen/foundation](../foundation)** - Core utilities and logging
- **[@claude-zen/event-system](../event-system)** - Type-safe events (future integration)

## 📄 **License**

MIT - See [LICENSE](../../LICENSE) file for details.

---

**Systematic AI Development Made Simple** 🎯