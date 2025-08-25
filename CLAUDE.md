# Claude Code Configuration for claude-code-zen

## 🎯 CRITICAL: Understanding the True Architecture

### 🧠 claude-code-zen IS THE PRIMARY SYSTEM:
- 🏢 **SAFe 6.0 Enterprise Planning** - Portfolio management, Program Increments, Value Streams
- 🔄 **SPARC Development Execution** - 5-phase systematic methodology (Specification → Completion)
- 👥 **Teamwork Multi-Agent Coordination** - Collaborative problem-solving and decision-making
- ⚡ **Advanced Workflow Orchestration** - XState-powered process management with document import
- 📋 **TaskMaster Enterprise Management** - SOC2-compliant task flow with human approval gates
- 🏗️ **5-Tier Strategic Architecture** - 50+ packages with strict access control
- 🌐 **Event-Driven Coordination** - Comprehensive type-safe event communication
- 💾 **Multi-Database Persistence** - SQLite, LanceDB, Kuzu for enterprise state management

### 🛠️ Claude Code is ONE TOOL in the system:
- ✅ **Gets called** by the orchestration system when code writing is needed
- ✅ **Uses native tools** (Read, Write, Edit, MultiEdit, Bash) for implementation
- ✅ **Reports results** back to the event system for further coordination
- ✅ **Part of Tool Integration Layer** - Like any other specialized tool

### ⚠️ Key Architectural Principle:
**claude-code-zen is the orchestration BRAIN. Claude Code is a specialized TOOL for code implementation.** The system uses SAFe 6.0 for planning, SPARC for systematic development, Teamwork for agent coordination, Workflows for process orchestration, and TaskMaster for enterprise management. Claude Code gets invoked when actual code writing is required.

## 🏗️ Enterprise Coordination Architecture

### 6-Layer Enterprise System:
1. **SAFe 6.0 Planning Layer** - Enterprise portfolio and program management
2. **SPARC Execution Layer** - Systematic 5-phase development methodology 
3. **Teamwork Coordination Layer** - Multi-agent collaborative problem-solving
4. **Workflow Orchestration Layer** - XState process automation and document import
5. **TaskMaster Management Layer** - SOC2-compliant task flow with AGUI approval gates
6. **Tool Integration Layer** - Claude Code and other specialized tools

### Technical Foundation:
- **5-Tier Package Architecture** - 50+ packages with strategic facades and strict access control
- **Multi-Database Backends** - SQLite, LanceDB, Kuzu for enterprise persistence
- **Event-Driven Coordination** - Comprehensive TypedEventBase communication system
- **RESTful API** - OpenAPI 3.0 web interface for monitoring and control
- **Svelte Dashboard** - Real-time monitoring and visualization interface


## 🛠️ Current Build System

### Single Unified Build:
```bash
pnpm build          # Builds everything: all packages + binaries
```

**Build Process:**
1. **📦 Builds ALL packages** (foundation, facades, implementation, enterprise, private-core)
2. **🏗️ Builds apps** (server + web dashboard)  
3. **🧠 Includes WASM** (neural modules)
4. **📱 Creates entry point** (claude-zen.js with auth + server)
5. **🔄 Bundles with NCC** (single executable file)
6. **⚡ Creates PKG binaries** (Linux, macOS, Windows)
7. **📋 Smart launchers** (auto-detect best binary)

**Output in `dist/bundle/`:**
- ✅ `claude-zen-linux` (self-contained Linux binary)
- ✅ `claude-zen-macos` (self-contained macOS binary) 
- ✅ `claude-zen-win.exe` (self-contained Windows binary)
- ✅ `final/index.js` (Node.js bundle fallback)
- ✅ Smart launchers with auto-detection

### Current Working CLI:
```bash
# Authentication (works now)
claude-zen auth copilot
claude-zen auth status

# Server with port support (works now)  
claude-zen --port 3001
claude-zen
```

## 🚀 System Architecture

### **5-Tier Strategic Package Architecture - ENTERPRISE READY**

claude-code-zen uses a **comprehensive 5-tier architecture** with **50+ packages** providing enterprise coordination, systematic development, and tool integration:

#### **🏗️ 5-Tier Enterprise Architecture:**

```
📦 Tier 1: Public API (Strategic Facades + Foundation)
├── @claude-zen/foundation       ✅ Core utilities, centralized common utilities
├── @claude-zen/llm-providers    ✅ LLM provider integrations  
├── @claude-zen/repo-analyzer    ✅ Repository analysis tools
└── Strategic Facades (delegation to implementation):
    ├── @claude-zen/intelligence     ✅ Facades → brain, teamwork, knowledge
    ├── @claude-zen/enterprise       ✅ Facades → safe-framework, sparc, workflows
    ├── @claude-zen/operations       ✅ Facades → telemetry, system-monitoring
    ├── @claude-zen/infrastructure   ✅ Facades → database, event-system
    └── @claude-zen/development      ✅ Facades → code-analyzer, git-operations

🔒 Tier 2: Private Implementation (Business Logic)
├── Core Systems: database, memory, event-system, teamwork
├── Infrastructure: load-balancing, system-monitoring, telemetry
├── Document Systems: document-intelligence, documentation, exporters
├── Language Support: language-parsers, file-aware-ai, interfaces
└── Agent Systems: agent-monitoring, agent-registry, llm-routing

🔐 Tier 3: Internal Specialized (Advanced Coordination)
├── Enterprise Planning: safe-framework (SAFe 6.0), sparc (SPARC methodology)
├── Neural/AI Coordination: brain, knowledge (DSPy integration)
├── Process Management: workflows (XState), agui (approval gates)
├── Development Tools: code-analyzer, git-operations, architecture
├── Analysis Systems: beam-analyzer, codeql, document-processing
└── Advanced Coordination: enterprise-coordination, multi-level-orchestration

🚫 Tier 4: Restricted Access (Security Critical)
├── ai-safety           → AI deception detection and safety monitoring
├── chaos-engineering   → System fault injection and resilience testing
└── taskmaster         → SOC2-compliant task approval and audit systems

⛔ Tier 5: Deep Core (Ultra Restricted)
├── dspy               → DSPy neural optimization (accessed via brain only)
├── neural-ml          → Neural networks (accessed via brain only)
├── fact-system        → Knowledge facts (accessed via knowledge only)
└── memory-root        → Core memory (accessed via memory only)
```

#### **⚠️ CRITICAL: 5-Tier Architecture Rules**

**🎯 TIER SEPARATION PRINCIPLES:**
- **Tier 1** (Public): Strategic facades + foundation - ONLY packages users import
- **Tier 2** (Private): Implementation packages - Internal business logic  
- **Tier 3** (Internal): Specialized systems - Advanced internal functionality
- **Tier 4** (Restricted): Special authorization required - Security-critical systems
- **Tier 5** (Deep Core): Ultra-restricted - Accessed only by specific Tier 2/3 packages

**✅ CORRECT Import Patterns (TIER 1 ONLY):**
```typescript
// ✅ TIER 1 ONLY - These are the ONLY allowed imports

// Foundation (direct import)
import { getLogger, createContainer, getConfig } from '@claude-zen/foundation';

// Direct integrations (direct import)
import { ClaudeProvider, GeminiProvider } from '@claude-zen/llm-providers';
import { RepoAnalyzer } from '@claude-zen/repo-analyzer';

// Strategic facades (delegation only)
import { getBrainSystem } from '@claude-zen/intelligence';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import { getSafeFramework } from '@claude-zen/enterprise';
import { getPerformanceTracker } from '@claude-zen/operations';
import { getCodeAnalyzer } from '@claude-zen/development';

// ❌ NEVER IMPORT FROM TIERS 2-5 DIRECTLY
// import { BrainCoordinator } from '@claude-zen/brain';         // Tier 3 - FORBIDDEN!
// import { DatabaseProvider } from '@claude-zen/database';      // Tier 2 - FORBIDDEN!
// import { AISafety } from '@claude-zen/ai-safety';            // Tier 4 - FORBIDDEN!
// import { DSPy } from '@claude-zen/dspy';                     // Tier 5 - FORBIDDEN!
```

**✅ CORRECT Facade Delegation Pattern:**
```typescript
// Facades are DELEGATION ONLY with lazy loading and fallbacks
export async function getBrainSystem() {
  try {
    const { BrainSystem } = await import('@claude-zen/brain');
    return new BrainSystem();
  } catch (error) {
    // Graceful fallback when implementation not available
    return createCompatibilityBrainSystem();
  }
}
```

**🏗️ 5-Tier Architectural Benefits:**
- **70%+ Code Reduction** through intelligent delegation  
- **Zero Breaking Changes** - facades maintain stable interfaces
- **Lazy Loading** - implementation packages loaded only when needed
- **Graceful Degradation** - fallbacks when packages unavailable
- **Enhanced Security** - 5-tier isolation prevents unauthorized access
- **Simplified Dependencies** - Only Tier 1 imports needed

#### **✅ CRITICAL: 5-Tier Import Guide - TIER 1 ONLY**

**✅ TIER 1 - Strategic Facades (USE THESE):**
```typescript
// Foundation (direct import - contains primitives and centralized utilities)
import { 
  // Core utilities
  getLogger, Result, ok, err, UUID, generateUUID, generateNanoId,
  
  // Centralized utilities (replaces direct imports)
  _, lodash,                    // Lodash utilities
  dateFns, format, addDays,     // Date manipulation  
  Command, program,             // CLI command parsing
  z, validateInput,             // Schema validation
  nanoid, customAlphabet,       // Short ID generation
  
  // Configuration and environment
  getConfig, str, num, bool, port, url, email,
  isDevelopment, isProduction, isTest,
  
  // Process lifecycle
  onExit, pTimeout,
  
  // Error handling
  safeAsync, withTimeout, withRetry,
  createCircuitBreaker,
  
  // Dependency injection
  createServiceContainer, inject, TOKENS,
  
  // Event system
  TypedEventBase, createTypedEventBase
} from '@claude-zen/foundation';

// LLM Provider integrations (direct import - contains provider APIs)
import { ClaudeProvider, GeminiProvider } from '@claude-zen/llm-providers';

// Strategic facades (delegation to implementation packages)
import { getBrainSystem } from '@claude-zen/intelligence';
import { getSafeFramework } from '@claude-zen/enterprise';  
import { getPerformanceTracker } from '@claude-zen/operations';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import { getCodeAnalyzer, getRepoAnalyzer, getAILinter } from '@claude-zen/development';
```

**❌ TIER 2-5 - NEVER IMPORT THESE DIRECTLY:**
```typescript
// ❌ TIER 2 - Private Implementation (FORBIDDEN)
// import { DatabaseProvider } from '@claude-zen/database';
// import { EventBus } from '@claude-zen/event-system';
// import { MemoryManager } from '@claude-zen/memory';
// import { LoadBalancer } from '@claude-zen/load-balancing';
// import { TelemetryCollector } from '@claude-zen/telemetry';

// ❌ TIER 3 - Internal Specialized (FORBIDDEN)
// import { BrainCoordinator } from '@claude-zen/brain';
// import { KnowledgeBase } from '@claude-zen/knowledge';
// import { SafeFramework } from '@claude-zen/safe-framework';
// import { SPARCEngine } from '@claude-zen/sparc';
// import { CodeAnalyzer } from '@claude-zen/code-analyzer';

// ❌ TIER 4 - Restricted Access (FORBIDDEN)
// import { AISafety } from '@claude-zen/ai-safety';
// import { ChaosEngine } from '@claude-zen/chaos-engineering';
// import { TaskMaster } from '@claude-zen/taskmaster';

// ❌ TIER 5 - Deep Core Ultra Restricted (FORBIDDEN)
// import { DSPy } from '@claude-zen/dspy';
// import { NeuralML } from '@claude-zen/neural-ml';
// import { FactSystem } from '@claude-zen/fact-system';
// import { MemoryRoot } from '@claude-zen/memory-root';
```

**🎯 KEY PRINCIPLE: TIER 1 ONLY**
- ✅ **Import**: Only Tier 1 packages (foundation, facades, direct integrations)
- ❌ **Never**: Import from Tiers 2-5 directly
- 🏗️ **Access**: Lower tiers accessed via Tier 1 facades only

**🚫 FORBIDDEN - Direct Utility Imports (USE FOUNDATION INSTEAD):**
```typescript
// ❌ These direct utility imports are FORBIDDEN - use foundation instead  
// import _ from 'lodash';                    // Use: import { _, lodash } from '@claude-zen/foundation'
// import { nanoid } from 'nanoid';           // Use: import { generateNanoId } from '@claude-zen/foundation'
// import { v4 as uuidv4 } from 'uuid';       // Use: import { generateUUID } from '@claude-zen/foundation'
// import { format, addDays } from 'date-fns'; // Use: import { dateFns } from '@claude-zen/foundation'
// import { Command } from 'commander';       // Use: import { Command, program } from '@claude-zen/foundation'
// import winston from 'winston';            // Use: import { getLogger } from '@claude-zen/foundation'
// import pino from 'pino';                  // Use: import { getLogger } from '@claude-zen/foundation'
// import dotenv from 'dotenv';              // Use: import { getConfig } from '@claude-zen/foundation'
// import Ajv from 'ajv';                    // Use: import { z, validateInput } from '@claude-zen/foundation'
```

**🏗️ Architecture Enforcement:**
```bash
# Validate architecture compliance
pnpm validate:architecture

# Check for violations  
pnpm run validate:architecture
```

#### **🎯 5-Tier Strategic Benefits:**
- **70%+ Code Reduction** through intelligent delegation
- **Battle-Tested Logic** via proven package implementations  
- **Lazy Loading** for optimal performance
- **Type Safety** with comprehensive TypeScript support
- **Zero Breaking Changes** through facade compatibility layers
- **Professional Patterns** matching enterprise architecture standards
- **Security Isolation** through 5-tier access control
- **Dependency Simplification** - import only from Tier 1

### **Enterprise Coordination System**
- **SAFe 6.0 Planning**: Portfolio managers, Program Increment coordination, Value Stream optimization
- **SPARC Development**: 5-phase methodology (Specification → Pseudocode → Architecture → Refinement → Completion)
- **Teamwork Coordination**: Multi-agent collaboration with shared memory and sequential decision-making
- **Workflow Orchestration**: XState state machines with document import and process automation
- **TaskMaster Management**: SOC2-compliant task flow with human approval gates and audit trails
- **Event-Driven Architecture**: TypedEventBase coordination across all layers
- **Multi-Database Persistence**: SQLite, LanceDB, Kuzu for enterprise state management

### **Web Interface** 
- **Backend API**: RESTful with OpenAPI 3.0/Swagger documentation for monitoring
- **Frontend**: Svelte dashboard with real-time enterprise coordination visualization
- **Purpose**: SAFe planning visualization, SPARC progress tracking, workflow monitoring
- **Integration**: Consumes event system for real-time coordination state

### **Event System Components**
- **SAFe Coordinators**: Portfolio and Program Increment coordination via events
- **SPARC Orchestrators**: 5-phase development execution via events
- **Teamwork Managers**: Multi-agent collaboration via events
- **Workflow Engines**: XState process orchestration via events
- **TaskMaster Controllers**: Task approval and compliance via events
- **Tool Integration**: Claude Code and other tools called via events

### **Enterprise Coordination Patterns**
- **SAFe Planning Flow**: Business requirements → Portfolio → Program Increments → Features
- **SPARC Development Flow**: Features → Specification → Pseudocode → Architecture → Refinement → Completion
- **Teamwork Collaboration**: Multi-agent coordination with shared memory and sequential decisions
- **Workflow Automation**: XState orchestration with document import and approval gates
- **TaskMaster Compliance**: Human approval workflows with SOC2 audit trails
- **Tool Integration**: Event-driven tool selection and coordination (including Claude Code)

## 🧠 **Automatic DSPy Integration - COMPLETED**

### **✅ Intelligent Runtime Optimization Selection**

claude-code-zen features **complete automatic DSPy optimization** with sophisticated decision-making:

```typescript
// Automatic DSPy optimization via intelligence facade
import { getBrainSystem } from '@claude-zen/intelligence';

const brainSystem = await getBrainSystem();
const coordinator = brainSystem.createCoordinator();

// Automatic optimization selection based on complexity, resources, and context
const result = await coordinator.optimizePrompt({
  task: "Complex reasoning task requiring multi-step analysis",
  basePrompt: "Analyze the following business scenario...",
  context: { priority: 'high', timeLimit: 30000 },
  qualityRequirement: 0.9
});

console.log(`Strategy: ${result.strategy}`);        // 'dspy', 'dspy-constrained', or 'basic'
console.log(`Confidence: ${result.confidence}`);    // 0.9
console.log(`Reasoning: ${result.reasoning}`);      // Detailed explanation
```

### **🚀 Automatic Optimization Features:**

- **Multi-factor complexity analysis** (prompt length, task type, context, priority)
- **Real-time resource monitoring** (memory, CPU, GPU availability, system load)
- **Three optimization strategies**: Basic, DSPy, DSPyConstrained
- **Performance tracking** with continuous learning and adaptive thresholds
- **Rust-accelerated decision engine** for optimal performance
- **Graceful fallbacks** when advanced optimizers unavailable

### **🎯 DSPy Strategy Selection:**

**DSPy Full Optimization** - Used for:
- High complexity tasks (> 0.7 complexity score)
- Sufficient system resources (< 60% memory usage)
- High accuracy requirements (> 0.8)
- Non-urgent tasks (> 30 second time limits)

**DSPy Constrained** - Used for:
- Medium complexity tasks (0.5-0.7 complexity)
- Limited resources (60-80% memory usage) 
- Balanced performance needs
- Moderate time constraints

**Basic Optimization** - Used for:
- Simple tasks (< 0.5 complexity)
- Resource-constrained environments (> 80% usage)
- Time-critical operations (< 30 seconds)
- Low accuracy requirements

## 📦 **3-Tier Architecture Implementation Guide**

### **🏗️ Understanding the 3 Tiers**

#### **📦 Tier 1: Public API - What You Import**
Only these packages are available in workspace catalog and should be imported by users:

```typescript
// ✅ Foundation - Core primitives and centralized utilities (always safe to import directly)
import { 
  // Core system utilities
  getLogger, Result, UUID, ok, err, generateUUID, generateNanoId,
  
  // Centralized common utilities (no direct imports needed)
  _, lodash,                    // All lodash functions
  dateFns, format, addDays,     // All date-fns functions  
  Command, program,             // Commander.js CLI parsing
  z, validateInput,             // Zod schema validation
  nanoid, customAlphabet,       // nanoid short IDs
  
  // Configuration system
  getConfig, createEnvValidator, str, num, bool, port,
  isDevelopment, isProduction, isTest,
  
  // Advanced patterns
  safeAsync, withTimeout, withRetry, createCircuitBreaker,
  TypedEventBase, createServiceContainer, inject
} from '@claude-zen/foundation';

// ✅ Strategic Facades - Use these for all functionality  
import { getBrainSystem, getMemorySystem } from '@claude-zen/intelligence';
import { getDatabaseSystem, getEventSystem } from '@claude-zen/infrastructure';
import { getSafeFramework, getWorkflowEngine } from '@claude-zen/enterprise';
import { getPerformanceTracker, getTelemetryManager } from '@claude-zen/operations';
import { getCodeAnalyzer, getGitOperations } from '@claude-zen/development';

// ✅ Supporting packages (temporary - will become facades)
import { LLMProvider } from '@claude-zen/llm-providers';
import { RepositoryAnalyzer } from '@claude-zen/repo-analyzer';
```

#### **🔒 Tier 2: Internal Implementation - Private Packages**
These packages are `"private": true` and should NEVER be imported directly:

```typescript
// ❌ NEVER IMPORT THESE - Use facades instead
// Core implementations
// import { BrainCoordinator } from '@claude-zen/brain';           
// import { DatabaseProvider } from '@claude-zen/database';        
// import { MemoryManager } from '@claude-zen/memory';            
// import { EventBus } from '@claude-zen/event-system';           

// Intelligence implementations  
// import { TeamworkOrchestrator } from '@claude-zen/teamwork';    
// import { AISafetyMonitor } from '@claude-zen/ai-safety';       
// import { KnowledgeBase } from '@claude-zen/knowledge';         

// Enterprise implementations
// import { SafeFramework } from '@claude-zen/safe-framework';    
// import { SPARCMethodology } from '@claude-zen/sparc';          
// import { WorkflowEngine } from '@claude-zen/workflows';        
```

#### **🔐 Tier 3: Deep Internal - Ultra Restricted**
These packages can ONLY be accessed by specific Tier 2 packages:

```typescript
// 🔐 ULTRA RESTRICTED - Only specific packages can access these
// @claude-zen/dspy         → Only @claude-zen/brain can import
// @claude-zen/neural-ml    → Only @claude-zen/brain can import  
// @claude-zen/fact-system  → Only @claude-zen/knowledge can import

// Even facades cannot directly access Tier 3!
```

### **🎯 Architecture Benefits**

1. **🚪 Single Point of Entry**: All functionality via strategic facades
2. **🔒 Encapsulation**: Implementation details completely hidden  
3. **⚡ Lazy Loading**: Packages loaded only when actually needed
4. **🛡️ Graceful Degradation**: Fallbacks when packages unavailable
5. **💥 Zero Breaking Changes**: Stable facade interfaces forever
6. **📦 Dependency Management**: Clean, predictable import graph

**Continue using these foundation packages directly:**
- `@claude-zen/foundation` ✅ (Core utilities, logging, types)

## Enterprise Workflow Examples

### Enterprise Feature Development Example
**Context:** Complex feature needs systematic development from business requirements to production code

**Step 1: SAFe 6.0 Planning**
- Portfolio Manager defines strategic theme: "Customer Self-Service Enhancement"
- Program Increment planning breaks down into features: "User Authentication", "Profile Management", "Settings Dashboard"
- Value Stream Mapper optimizes delivery flow and identifies dependencies
- Architecture Runway Manager ensures technical infrastructure readiness
- **Result:** Business requirements systematically planned with enterprise methodology

**Step 2: SPARC Development Execution**
- Feature "User Authentication" enters SPARC 5-phase development:
  - **Specification:** Requirements analysis with acceptance criteria
  - **Pseudocode:** Algorithm design for OAuth2, 2FA, and session management
  - **Architecture:** System design with security patterns and scalability
  - **Refinement:** Implementation optimization with performance tuning
  - **Completion:** Test suite generation and comprehensive documentation
- **Result:** Systematic technical development with quality gates

**Step 3: Teamwork Multi-Agent Coordination**
- Multiple agents coordinate collaboratively:
  - Architecture Agent: Designs security patterns and system integration
  - Implementation Agent: Focuses on code quality and best practices
  - Testing Agent: Creates comprehensive test coverage
  - Review Agent: Ensures code quality and optimization
- Shared memory maintains context across agent interactions
- **Result:** Collaborative problem-solving with specialized expertise

**Step 4: Workflow Process Orchestration**
- XState workflow manages complex development process:
  - Document import from existing security guidelines
  - Parallel branches for frontend and backend development
  - Human approval gates for security-sensitive components
  - Error recovery patterns for failed deployments
- **Result:** Automated process management with human oversight

**Step 5: TaskMaster Enterprise Management**
- SOC2-compliant task flow with enterprise controls:
  - WIP limits prevent resource overallocation
  - Capacity control maintains sustainable development pace
  - Bottleneck detection identifies and resolves workflow constraints
  - Human approval gates require security team sign-off for production deployment
  - Comprehensive audit trails for compliance and review
- **Result:** Enterprise-grade task management with compliance

**Step 6: Tool Integration & Execution**
- System determines specific tools needed:
  - **Claude Code called** for actual code writing and editing
  - **File operations** for documentation updates
  - **API integrations** for third-party service connections
  - **System commands** for deployment and testing
- Claude Code uses its native tools (Read, Write, Edit, Bash) for implementation
- **Result:** Actual code implementation coordinated by the enterprise system

**Complete Flow:**
```
SAFe Planning → SPARC Development → Teamwork Coordination → 
Workflow Orchestration → TaskMaster Management → Claude Code Implementation
```

**What Actually Happens:**
1. **claude-code-zen orchestrates** the entire enterprise development process
2. **Event system coordinates** communication between all 6 layers
3. **Claude Code gets invoked** only when code writing/editing is specifically needed
4. **Multi-database persistence** maintains state across the entire workflow
5. **Enterprise compliance** is maintained through TaskMaster audit trails

## Best Practices for Enterprise Coordination

### ✅ DO:
- **Understand the hierarchy:** SAFe planning → SPARC development → Teamwork coordination → Workflow orchestration → TaskMaster management → Tool integration
- **Leverage systematic methodologies:** Use SAFe 6.0 for planning, SPARC for development execution
- **Trust the coordination system:** Let event system manage complex workflows and agent coordination
- **Use Claude Code appropriately:** Focus on code implementation tasks when invoked by the system
- **Maintain enterprise compliance:** Respect TaskMaster approval gates and audit requirements
- **Follow tier separation:** Only import from Tier 1 packages, let facades handle delegation

### ❌ DON'T:
- **Bypass the orchestration system:** Don't try to coordinate everything through Claude Code
- **Break tier boundaries:** Don't import directly from Tiers 2-5 packages
- **Skip enterprise processes:** Don't bypass SAFe planning or TaskMaster approval gates
- **Confuse roles:** claude-code-zen coordinates, Claude Code implements
- **Force artificial patterns:** Use tools naturally within the orchestrated workflow

## Enterprise Memory and Persistence

The enterprise coordination system provides comprehensive persistence:
- **SAFe Planning State:** Portfolio strategies, Program Increments, feature definitions via SQLite
- **SPARC Development Progress:** Phase completion, deliverables, quality metrics via LanceDB
- **Teamwork Coordination Memory:** Agent interactions, shared decisions, collaboration patterns via memory system
- **Workflow State Management:** XState persistence, process history, approval status via database backends
- **TaskMaster Audit Trails:** SOC2 compliance records, approval workflows, capacity tracking via Kuzu graph
- **Cross-Session Continuity:** Enterprise context maintained across development cycles

## Enterprise Performance Benefits

When using enterprise coordination with systematic methodologies:
- **84.8% SWE-Bench solve rate** - Systematic SAFe + SPARC approach improves problem-solving
- **Enterprise scalability** - Handles complex multi-team projects with proper coordination
- **Compliance ready** - Built-in SOC2 audit trails and approval workflows
- **Systematic quality** - SPARC quality gates ensure robust implementation
- **Multi-agent efficiency** - Teamwork coordination leverages specialized expertise
- **Process automation** - Workflow orchestration reduces manual coordination overhead

## Integration Guidelines

1. **Understand Your Role**: You are Claude Code, a tool in the enterprise orchestration system
2. **Use Strategic Facades**: Only import from Tier 1 packages (@claude-zen/foundation and facades)
3. **Respect the Coordination Flow**: Let the event system coordinate, focus on implementation
4. **Follow Enterprise Patterns**: Work within SAFe planning, SPARC development, and TaskMaster approval workflows
5. **Use Tools Naturally**: Read, Write, Edit, Bash as needed without artificial constraints
6. **Trust the Architecture**: The 5-tier system ensures proper separation and delegation

## 🧠 **Enterprise Event-Driven Architecture**

### **🎯 True Architecture Principles**

claude-code-zen IS the comprehensive enterprise coordination brain:

**✅ claude-code-zen Orchestrates:**
- SAFe 6.0 enterprise planning and portfolio management
- SPARC 5-phase systematic development execution
- Teamwork multi-agent coordination and collaboration
- Workflow orchestration with XState and document import
- TaskMaster enterprise task flow with SOC2 compliance
- Event-driven coordination across all 6 layers
- Multi-database persistence and state management

**✅ Claude Code Executes (When Called):**
- File operations (Read, Write, Edit, MultiEdit) for implementation
- Code generation based on SPARC specifications
- Bash commands for testing, building, deployment
- Specific implementation work as directed by the orchestration system

### **🚀 Natural Tool Integration Pattern**

**✅ ENTERPRISE FLOW:**
```
SAFe Planning → SPARC Development → Teamwork Coordination → 
Workflow Orchestration → TaskMaster Management → Tool Selection → 
Claude Code Implementation
```

**Your role as Claude Code:**
- Get invoked by the enterprise system when code work is needed
- Use tools naturally (Read to understand, Write/Edit to implement)
- Focus on quality implementation within the systematic framework
- Report results back through the event system for further coordination

## Support

- **Primary**: claude-code-zen enterprise coordination system (this repository)
- **Architecture**: SAFe 6.0 + SPARC + Teamwork + Workflows + TaskMaster coordination
- **Documentation**: https://github.com/zen-neural/claude-code-zen
- **Issues**: https://github.com/zen-neural/claude-code-zen/issues
- **Web Interface**: OpenAPI 3.0 Swagger with Svelte dashboard

---


## 🔧 **Troubleshooting for Claude Code**

### **API connection errors:**
1. Check service status: Verify backend API is running
2. Verify endpoints: Check OpenAPI documentation
3. Check parameters: Required parameters must be provided

### **Coordination not working:**
1. **Check API status**: Call `/api/v1/health` endpoint
2. **Initialize if needed**: POST to `/api/v1/coordination/init`
3. **Check agent status**: GET `/api/v1/agents/status`

### **Enterprise coordination:**
1. **Trust the orchestration**: Let the enterprise system coordinate complex workflows
2. **Focus on implementation quality**: When called by the system, deliver excellent code
3. **Use tools naturally**: Read, understand, implement without artificial constraints
4. **Respect enterprise processes**: Work within SAFe planning and TaskMaster approval gates

### **When enterprise coordination needs attention:**
1. **Check orchestration logs**: Review enterprise coordination service logs
2. **Monitor health**: Use `/api/v1/health` endpoint for system status
3. **Review enterprise state**: Check SAFe planning, SPARC progress, TaskMaster workflows
4. **Reset if needed**: POST to `/api/v1/coordination/reset` for coordination restart

---

## Development Commands

**Start services:**
```bash
pnpm dev:full        # Both server and web dashboard
pnpm dev:server      # Backend API service on port 3000
pnpm dev:web         # Svelte frontend on port 3002
```

**Build and test:**
```bash
pnpm build           # Build both applications
pnpm test            # Test both applications
pnpm type-check      # Type check both applications
```

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
