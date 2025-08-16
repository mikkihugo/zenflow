/**
 * @fileoverview Claude Code Configuration for claude-code-zen Swarm System
 * 
 * Comprehensive configuration document for Claude Code instances working with
 * claude-code-zen's TypeScript/Rust swarm system. This document defines the separation 
 * of responsibilities, coordination protocols, and best practices for efficient parallel execution.
 * 
 * Key Features:
 * - TypeScript/Rust swarm coordination system
 * - Advanced intelligence systems (agent learning, prediction, health monitoring)
 * - SPARC methodology integration for systematic development
 * - Comprehensive neural coordination with DSPy integration
 * - High-performance parallel execution patterns
 * - Multi-database storage (SQLite, LanceDB, Kuzu graph)
 * - RESTful API with OpenAPI 3.0 documentation
 * - Svelte web dashboard interface
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.0.0
 * 
 * @see {@link https://github.com/zen-neural/claude-code-zen} claude-code-zen Documentation
 * @see {@link https://docs.anthropic.com/en/docs/claude-code} Claude Code Documentation
 * 
 * @requires claude-code-zen - TypeScript/Rust swarm coordination system
 * @requires @anthropic/claude-code - Native Claude Code CLI tools
 * 
 * @example
 * ```bash
 * # claude-code-zen swarm system
 * # Backend: TypeScript/Rust API service
 * # Frontend: Svelte web interface
 * # Integration: REST API with OpenAPI 3.0
 * ```
 */

# Claude Code Configuration for claude-code-zen Swarm System

## 🎯 IMPORTANT: Separation of Responsibilities

### Claude Code Handles:
- ✅ **ALL file operations** (Read, Write, Edit, MultiEdit)
- ✅ **ALL code generation** and development tasks
- ✅ **ALL bash commands** and system operations
- ✅ **ALL actual implementation** work
- ✅ **Project navigation** and code analysis

### claude-code-zen Swarm System Handles:
- 🧠 **Intelligent Coordination** - Advanced agent learning and adaptation
- 💾 **Persistent Memory** - Multi-database storage (SQLite, LanceDB, Kuzu)
- 🤖 **Neural Intelligence** - DSPy integration with cognitive patterns
- 📊 **Performance Analytics** - Agent health monitoring and prediction
- 🐝 **Swarm Orchestration** - Internal coordination via events and direct calls
- 🏗️ **SPARC Integration** - Systematic architecture development
- ⚡ **Event System** - Comprehensive type-safe event-driven coordination
- 🌐 **Web API** - RESTful API with OpenAPI 3.0 (web interface ONLY)
- 🎨 **Svelte Frontend** - Web-based dashboard and interface

### ⚠️ Key Principle:
**claude-code-zen provides a complete swarm coordination system.** It uses **internal event-driven coordination** for agent communication and **REST API only for web interface**. The coordination system includes development system components: queens, commanders, cubes, and matrons working together through events and direct method calls.

## 📦 **EXTRACTED LIBRARIES STATUS**

### **Current Library Structure in `/src/lib/`**

The claude-code-zen codebase has already extracted **8 production-ready libraries** with proper `@zen-ai` namespace:

#### **✅ Core Infrastructure Libraries**
1. **`@zen-ai/shared`** - Common utilities, logging, DI container, LLM provider interfaces
2. **`@zen-ai/event-system`** - Comprehensive type-safe event system with domain validation
3. **`@zen-ai/database`** - Multi-database abstraction (SQLite, LanceDB, Kuzu, PostgreSQL, MySQL)

#### **✅ AI/ML Intelligence Libraries**  
4. **`@zen-ai/dspy-engine`** - DSPy Stanford implementation for neural programming
5. **`@zen-ai/adaptive-learning`** - ML-driven behavioral optimization and pattern recognition
6. **`@zen-ai/conversation-framework`** - Multi-agent conversation orchestration

#### **✅ Production Operations Libraries**
7. **`@zen-ai/chaos-engineering`** - System resilience testing and failure injection
8. **`@zen-ai/task-approval`** - Human-in-the-loop workflow management

### **Library Characteristics**
- **Production-Ready**: All have proper package.json, exports, TypeScript configs
- **Standalone**: Can be extracted as independent npm packages
- **Namespace Consistent**: All use `@zen-ai` organization namespace
- **Well-Documented**: Each has README, examples, API documentation
- **Type-Safe**: Full TypeScript support with strict typing
- **Test-Ready**: Configured for Vitest testing framework

### **🎯 MONOREPO MIGRATION PLAN (Future)**
**Current**: `/src/lib/[package]/` (working location)  
**Future**: `/packages/[package]/` (standard monorepo structure)

The system now uses **pnpm workspaces** with monorepo `/packages/` structure for better organization and dependency management.

### **📊 LIBRARY vs APPLICATION ANALYSIS**

#### **✅ Successfully Extracted as Libraries (Reusable)**
These components were successfully extracted because they are **domain-agnostic** and **reusable**:

- **Infrastructure**: Event systems, databases, shared utilities
- **AI/ML Algorithms**: Neural networks, learning systems, DSPy optimization  
- **Operations**: Chaos engineering, approval workflows, conversation handling

#### **🏗️ Remaining Application Code (claude-code-zen Specific)**
These components remain in the main application because they are **business logic specific**:

- **Coordination System**: Queens, Commanders, Cubes, Matrons hierarchy
- **SPARC Methodology**: Specification, Pseudocode, Architecture, Refinement, Completion  
- **Swarm Orchestration**: Task distribution, agent management, workflow coordination
- **Development Workflow**: Project-specific coordination patterns and business rules
- **Web Interface**: Svelte dashboard with claude-code-zen specific features

#### **🎯 Perfect Library Extraction Strategy**
The current extraction follows **clean architecture principles** with **pnpm workspace management**:

```
📁 Applications (Business Logic) - pnpm workspace packages
├── 🐝 claude-code-zen swarm system (queens, commanders, cubes, matrons)
├── 🎯 SPARC methodology workflows  
└── 🎨 Svelte web dashboard

📦 Libraries (Reusable Components) - pnpm workspace packages  
├── 🔧 @claude-zen/foundation (utilities, logging, DI, LLM)
├── ⚡ @zen-ai/event-system (type-safe events)
├── 💾 @zen-ai/database (multi-DB abstraction)
├── 🧠 @claude-zen/brain (neural programming, DSPy integration)
├── 📈 @zen-ai/adaptive-learning (ML optimization)
├── 💬 @zen-ai/conversation-framework (multi-agent chat)
├── 🔥 @zen-ai/chaos-engineering (resilience testing)
└── ✅ @zen-ai/task-approval (human-in-loop workflows)
```

**Result**: Clean separation between **reusable libraries** and **application-specific business logic** managed with **pnpm workspaces**.

## 🚀 CRITICAL: Parallel Execution & Batch Operations

### 🚨 MANDATORY RULE #1: BATCH EVERYTHING

**When working with the swarm system, you MUST use parallel operations:**

1. **NEVER** send multiple messages for related operations
2. **ALWAYS** combine multiple tool calls in ONE message
3. **PARALLEL** execution is MANDATORY, not optional

### ⚡ THE GOLDEN RULE OF SWARMS

```
If you need to do X operations, they should be in 1 message, not X messages
```

### 📦 BATCH TOOL EXAMPLES

**✅ CORRECT - Everything in ONE Message:**
```javascript
[Single Message with BatchTool]:
  // File operations
  Read("file1.ts")
  Read("file2.ts") 
  Write("output.ts", content)
  Edit("config.ts", oldStr, newStr)
  
  // API coordination
  // Call swarm API endpoints for coordination
  // All operations batched together
```

**❌ WRONG - Multiple Messages (NEVER DO THIS):**
```javascript
Message 1: Read file
Message 2: Process data
Message 3: Write output
Message 4: Update config
// This is 4x slower and breaks coordination!
```

### 🎯 BATCH OPERATIONS BY TYPE

**File Operations (Single Message):**
- Read 10 files? → One message with 10 Read calls
- Write 5 files? → One message with 5 Write calls
- Edit 1 file many times? → One MultiEdit call

**API Operations (Single Message):**
- Multiple API calls? → One message with all HTTP requests
- Database operations? → One message with all queries
- Coordination tasks? → One message with all instructions

**Command Operations (Single Message):**
- Multiple directories? → One message with all mkdir commands
- Install + test + lint? → One message with all pnpm commands
- Git operations? → One message with all git commands

## 🚀 System Architecture

### **Internal Coordination System**
- **Technology**: TypeScript/Rust with comprehensive event system
- **Coordination**: Direct method calls and type-safe event-driven communication
- **Database**: Multi-backend (SQLite, LanceDB, Kuzu graph)
- **Architecture**: Queens → Commanders → Cubes → Matrons → Agents/Drones
- **Features**: Agent coordination, memory management, neural processing

### **Web Interface** 
- **Backend API**: RESTful with OpenAPI 3.0/Swagger documentation (web interface ONLY)
- **Frontend**: Svelte web application dashboard
- **Purpose**: Monitoring, visualization, and external control
- **Integration**: API consumes internal coordination system

### **Development System Components**
- **Queens**: Strategic multi-swarm coordination (read-only, no implementation)
- **Commanders**: Tactical coordination and task routing  
- **Cubes**: Domain specialists (dev-cube, ops-cube)
- **Matrons**: Domain leaders and specialized coordination
- **Agents/Drones**: Task execution and implementation

### **Coordination Patterns**
- Event-driven agent communication via comprehensive event system
- Direct method calls for performance-critical operations
- Task orchestration with SPARC methodology
- Memory persistence across sessions through database backends
- Neural network coordination with DSPy integration

## Workflow Examples (Event-Driven Internal Coordination)

### Research Coordination Example
**Context:** Claude Code needs to research a complex topic systematically

**Step 1:** Set up research coordination internally
- Queen Coordinator initializes multi-swarm topology via direct method calls
- Event system broadcasts coordination setup to all components
- Result: Creates internal coordination framework for comprehensive exploration

**Step 2:** Define research perspectives internally
- SwarmCommander spawns researcher agents through event system
- Neural coordination patterns activated via direct calls
- Result: Different cognitive patterns coordinate through events

**Step 3:** Coordinate research execution internally
- Task orchestration through SPARC methodology and event system
- Memory persistence through multi-database backends
- Result: Claude Code systematically searches, reads, and analyzes papers

**What Actually Happens:**
1. Queens/Commanders coordinate through internal event system and direct calls
2. Agents communicate via comprehensive event-driven architecture
3. Claude Code uses its native Read, WebSearch, and Task tools
4. Internal coordination through events, memory backends, and neural networks
5. Results synthesized by Claude Code with full internal coordination history

### Development Coordination Example
**Context:** Claude Code needs to build a complex system with multiple components

**Step 1:** Set up development coordination internally
- Cube Matrons initialize domain-specific coordination via direct calls
- Event system coordinates hierarchical agent topology
- Result: Hierarchical internal structure for organized development

**Step 2:** Define development perspectives internally
- SwarmCommanders spawn architect agents through event system
- Neural patterns configure specialized cognitive approaches
- Result: Architectural thinking patterns coordinate through internal events

**Step 3:** Coordinate implementation internally
- SPARC methodology orchestrates implementation through event system
- Memory backends persist progress and coordination state
- Result: Claude Code implements features using its native tools

**What Actually Happens:**
1. Queens/Commanders/Matrons create development plan through internal coordination
2. Agents coordinate using event system and database persistence
3. Claude Code uses Write, Edit, Bash tools for implementation
4. Internal coordination through events, memory, and neural networks
5. All code is written by Claude Code with full internal coordination

## Best Practices for Coordination

### ✅ DO:
- Use the internal coordination system to approach complex tasks systematically
- Let Queens/Commanders/Matrons break down problems through event system
- Leverage multi-database backends to maintain context across sessions
- Monitor coordination effectiveness through internal metrics
- Train neural patterns for better coordination over time
- Use the comprehensive event system for agent communication

### ❌ DON'T:
- Expect agents to write code (Claude Code does all implementation)
- Use internal coordination for file operations (use Claude Code's native tools)
- Try to make agents execute bash commands (Claude Code handles this)
- Confuse internal coordination with execution (Events coordinate, Claude executes)
- Use API for internal coordination (API is web interface only)

## Memory and Persistence

The swarm provides persistent memory through multi-database backends that helps Claude Code:
- Remember project context across sessions via SQLite/LanceDB/Kuzu
- Track decisions and rationale through event system persistence
- Maintain consistency in large projects through shared memory
- Learn from previous coordination patterns through neural network training

## Performance Benefits

When using swarm coordination with Claude Code:
- **84.8% SWE-Bench solve rate** - Better problem-solving through coordination
- **32.3% token reduction** - Efficient task breakdown reduces redundancy
- **2.8-4.4x speed improvement** - Parallel coordination strategies
- **27+ neural models** - Diverse cognitive approaches

## Integration Tips

1. **Start Simple**: Begin with basic API calls and single agent coordination
2. **Scale Gradually**: Add more agents as task complexity increases
3. **Use Memory**: Store important decisions and context via API
4. **Monitor Progress**: Regular API status checks ensure effective coordination
5. **Train Patterns**: Let neural agents learn from successful coordinations

## 🧠 SWARM ORCHESTRATION PATTERN

### You are the SWARM ORCHESTRATOR. **IMMEDIATELY USE API CALLS** to coordinate tasks

### 🚨 CRITICAL INSTRUCTION: You are the SWARM ORCHESTRATOR

**MANDATORY**: When using swarms, you MUST:
1. **BATCH ALL API CALLS** - Use multiple API requests in ONE message
2. **EXECUTE TASKS IN PARALLEL** - Never wait for one task before starting another
3. **USE COORDINATION API** - All agents must use the swarm REST API

## 📋 COORDINATION PROTOCOL

### 🔴 CRITICAL: Every Coordination Step Must Use API

When coordinating complex tasks:

**1️⃣ BEFORE Starting Work:**
```typescript
// Call coordination API to set up context
POST /api/v1/coordination/init
GET /api/v1/memory/session/restore
```

**2️⃣ DURING Work (After EVERY Major Step):**
```typescript
// Store progress via API after each file operation
POST /api/v1/memory/store
POST /api/v1/coordination/progress
GET /api/v1/coordination/status
```

**3️⃣ AFTER Completing Work:**
```typescript
// Save results via API
POST /api/v1/coordination/complete
POST /api/v1/analytics/performance
GET /api/v1/coordination/summary
```

### ⚡ PARALLEL EXECUTION IS MANDATORY

**THIS IS WRONG ❌ (Sequential - NEVER DO THIS):**
```
Message 1: Initialize coordination
Message 2: Call API endpoint 1
Message 3: Call API endpoint 2
Message 4: Create file 1
Message 5: Create file 2
```

**THIS IS CORRECT ✅ (Parallel - ALWAYS DO THIS):**
```
Message 1: [BatchTool]
  - POST /api/v1/coordination/init
  - POST /api/v1/agents/spawn (researcher)
  - POST /api/v1/agents/spawn (coder)
  - POST /api/v1/agents/spawn (analyst)

Message 2: [BatchTool]  
  - Write file1.js
  - Write file2.js
  - Write file3.js
  - Bash mkdir commands
  - TodoWrite updates
```

### 🎯 COORDINATION API PATTERNS

When given ANY complex task:

```
STEP 1: IMMEDIATE PARALLEL COORDINATION (Single Message!)
[BatchTool]:
  - POST /api/v1/coordination/init { topology: "hierarchical", maxAgents: 8 }
  - POST /api/v1/agents/spawn { type: "architect", name: "System Designer" }
  - POST /api/v1/agents/spawn { type: "coder", name: "API Developer" }
  - POST /api/v1/agents/spawn { type: "analyst", name: "DB Designer" }
  - TodoWrite { todos: [multiple todos at once] }

STEP 2: PARALLEL TASK EXECUTION (Single Message!)
[BatchTool]:
  - POST /api/v1/tasks/orchestrate { task: "main task", strategy: "parallel" }
  - POST /api/v1/memory/store { key: "init", value: {...} }
  - Multiple Read operations
  - Multiple Write operations
  - Multiple Bash commands
```

### 🎨 VISUAL COORDINATION STATUS

When showing coordination status, use this format:

```
🐝 claude-code-zen Swarm Status: ACTIVE
├── 🏗️ Topology: hierarchical
├── 👥 Agents: 6/8 active (3 learning, 2 optimized)
├── ⚡ Mode: intelligent parallel execution
├── 📊 Tasks: 12 total (4 complete, 6 in-progress, 2 pending)
├── 🧠 Intelligence: Agent learning active, predictions accurate
├── 🏥 Health: All agents healthy, performance optimal
└── 💾 Memory: SQLite + LanceDB + Kuzu integration active

Agent Activity:
├── 🟢 architect: Designing with SPARC methodology...
├── 🟢 coder-1: Implementing with duration prediction...
├── 🟢 coder-2: Building with health monitoring...
├── 🟢 analyst: Optimizing with learning feedback...
├── 🟡 tester: Adapting learning rate (success: 85%)...
└── 🟢 coordinator: Neural coordination active...
```

## Support

- **Primary**: claude-code-zen swarm system (this repository)
- **Documentation**: https://github.com/zen-neural/claude-code-zen
- **Issues**: https://github.com/zen-neural/claude-code-zen/issues
- **API Documentation**: OpenAPI 3.0 Swagger interface

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

### **Performance issues:**
1. **Use parallel API calls**: Combine multiple requests in one message
2. **Don't chain sequentially**: Avoid message-per-request pattern
3. **Batch file operations**: Use multiple Read/Write/Edit calls together

### **When coordination fails:**
1. **Check API logs**: Review backend service logs
2. **Monitor health**: Use `/api/v1/health` endpoint
3. **Reset if needed**: POST to `/api/v1/coordination/reset`

---

## 📦 LIBRARY EXTRACTION STRATEGY

### Current Architecture Understanding

claude-code-zen is a comprehensive **development coordination system** with:

**Internal Architecture:**
- **Event-Driven Coordination**: Type-safe event system for agent communication
- **Hierarchy**: Queens → Commanders → Cubes → Matrons → Agents/Drones  
- **Multi-Database**: SQLite + LanceDB + Kuzu graph storage
- **Neural Integration**: DSPy Stanford integration with cognitive patterns
- **SPARC Methodology**: Systematic architecture development
- **Web Interface**: Svelte dashboard + OpenAPI 3.0 API (external only)

### Existing Library Structure

```
/src/lib/ (Already Modularized)
├── adaptive-learning/     # ML/AI learning systems ✅ READY FOR EXTRACTION
├── chaos-engineering/     # System resilience testing ✅ READY FOR EXTRACTION  
├── conversation/          # Conversation orchestration ✅ READY FOR EXTRACTION
├── database/             # Multi-database abstractions ✅ READY FOR EXTRACTION
├── dspy/                 # DSPy Stanford integration ✅ READY FOR EXTRACTION
├── event-system/         # COMPREHENSIVE event system ✅ READY FOR EXTRACTION
├── shared/               # Common utilities ✅ READY FOR EXTRACTION
└── task-approval/        # Task approval workflows ✅ READY FOR EXTRACTION
```

### Library Extraction Analysis

#### ✅ **Prime Candidates for Extraction (Reusable Libraries)**

1. **`@zen-ai/event-system`** - The comprehensive event system 
   - **Location**: `/src/lib/event-system/`
   - **Value**: Type-safe EventEmitter with adapters, factories, and middleware
   - **Reusability**: High - Universal event-driven communication

2. **`@zen-ai/memory`** - Multi-database memory system
   - **Location**: `/src/memory/` + `/src/lib/database/`
   - **Value**: Unified interface over SQLite/LanceDB/Kuzu
   - **Reusability**: High - Database abstraction is universally useful

3. **`@zen-ai/neural`** - Neural network primitives
   - **Location**: `/src/neural/` (excluding application-specific coordination)
   - **Value**: WASM bindings, cognitive patterns, DSPy integration
   - **Reusability**: High - Neural building blocks without orchestration logic

4. **`@zen-ai/shared`** - Core utilities
   - **Location**: `/src/lib/shared/`
   - **Value**: Logging, configuration, storage utilities
   - **Reusability**: High - Foundational utilities

5. **`@zen-ai/types`** - Shared TypeScript definitions
   - **Location**: `/src/types/` (filtered for reusable types)
   - **Value**: Common type definitions without application specifics
   - **Reusability**: High - Prevents circular dependencies

6. **`@zen-ai/ui-components`** - Reusable Svelte components
   - **Location**: `/src/components/` + `/src/interfaces/web/` (generic parts)
   - **Value**: Design system components (buttons, modals, charts)
   - **Reusability**: High - Visual language components

#### 🚫 **Do NOT Extract (Application-Specific Core)**

1. **Coordination System** (`/src/coordination/`)
   - **Reason**: This IS the application - Queens/Commanders/Cubes/Matrons hierarchy
   - **Application-Specific**: Unique orchestration logic and business rules
   - **Decision**: Remains in `apps/claude-code-zen-server`

2. **SPARC Integration** (`/src/sparc-*`)
   - **Reason**: Tightly coupled to this specific development methodology
   - **Application-Specific**: Implementation workflow logic
   - **Decision**: Remains in main application

3. **Core Orchestration** (`/src/core/`)
   - **Reason**: Main application logic and DI container
   - **Application-Specific**: System initialization and coordination
   - **Decision**: Remains in main application

### Proposed Monorepo Structure

```
/
├── apps/
│   ├── claude-code-zen-server/    # Main application
│   │   └── src/
│   │       ├── coordination/      # Queens, Commanders, Cubes, Matrons
│   │       ├── core/              # Main orchestration and DI
│   │       ├── sparc/             # SPARC methodology integration
│   │       └── interfaces/api/    # REST API routes
│   └── web-dashboard/             # Svelte frontend
│       └── src/
│           ├── routes/            # Application-specific pages
│           └── app.html           # Main Svelte app
└── packages/
    ├── zen-ai-event-system/       # @zen-ai/event-system
    ├── zen-ai-memory/             # @zen-ai/memory  
    ├── zen-ai-neural/             # @zen-ai/neural
    ├── zen-ai-shared/             # @zen-ai/shared
    ├── zen-ai-types/              # @zen-ai/types
    └── zen-ai-ui-components/      # @zen-ai/ui-components
```

### Migration Strategy

**Phase 1: Foundation Libraries** (Low Dependencies)
1. Extract `@zen-ai/shared` - Core utilities
2. Extract `@zen-ai/types` - Shared type definitions  
3. Extract `@zen-ai/event-system` - Event infrastructure

**Phase 2: Domain Libraries** (Medium Dependencies)
4. Extract `@zen-ai/memory` - Database abstractions
5. Extract `@zen-ai/neural` - Neural primitives (excluding coordination)
6. Extract `@zen-ai/ui-components` - Reusable Svelte components

**Phase 3: Application Restructure**
7. Move coordination logic to `apps/claude-code-zen-server`
8. Move Svelte app to `apps/web-dashboard`
9. Update imports and dependency management

### Key Principles

1. **Libraries = Tools, Application = Product**
   - Libraries provide capabilities (event system, memory, neural primitives)
   - Application orchestrates tools (queens, commanders, specific workflows)

2. **Dependency Flow**
   - `apps/` can depend on `packages/`
   - `packages/` can depend on other `packages/`
   - `packages/` MUST NOT depend on `apps/`

3. **Generic vs Specific**
   - Generic: Event system, database abstraction, neural primitives
   - Specific: Queen coordination logic, SPARC workflows, application API

4. **Event-Driven Architecture Preserved**
   - Internal coordination continues through events and direct calls
   - Libraries communicate through event system
   - API remains web interface only

This strategy maintains the sophisticated coordination system while extracting genuinely reusable components into focused, well-bounded libraries.

---

Remember: **claude-code-zen IS the swarm system!** Internal coordination through events and direct calls, API for web interface only.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
