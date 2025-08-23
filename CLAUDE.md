# Claude Code Configuration for claude-code-zen

## 🎯 IMPORTANT: Separation of Responsibilities

### Claude Code Handles:
- ✅ **ALL file operations** (Read, Write, Edit, MultiEdit)
- ✅ **ALL code generation** and development tasks
- ✅ **ALL bash commands** and system operations
- ✅ **ALL actual implementation** work
- ✅ **Project navigation** and code analysis

### claude-code-zen Event System Handles:
- 🧠 **Intelligent Coordination** - Advanced learning and adaptation
- 💾 **Persistent Memory** - Multi-database storage (SQLite, LanceDB, Kuzu)
- 🤖 **Neural Intelligence** - DSPy integration with cognitive patterns
- 📊 **Performance Analytics** - System health monitoring and prediction
- ⚡ **Event System** - Comprehensive type-safe event-driven coordination
- 🏗️ **SPARC Integration** - Systematic architecture development
- 🌐 **Web API** - RESTful API with OpenAPI 3.0 (web interface ONLY)
- 🎨 **Svelte Frontend** - Web-based dashboard and interface

### ⚠️ Key Principle:
**claude-code-zen provides an event-driven coordination system.** All coordination happens through **type-safe events** managed by the event system. The standalone agent manager is separate and not used in the main system.

## System Architecture

The system uses a TypeScript swarm coordination system with:
- Multi-database backends (SQLite, LanceDB, Kuzu graph)  
- Event-driven coordination with 28 specialized packages
- RESTful API with OpenAPI 3.0 documentation
- Svelte web dashboard interface


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

### **3-Tier Strategic Package Architecture - PRODUCTION READY**

claude-code-zen uses a **battle-tested 3-tier architecture** with **50+ packages** organized for maximum maintainability:

#### **🏗️ 3-Tier Architecture Overview:**

```
📦 Tier 1: Public API (Strategic Facades + Foundation)
├── @claude-zen/foundation       ✅ Core utilities, logging, type-safe primitives
├── @claude-zen/llm-providers    ✅ LLM provider integrations (Claude, Gemini, Cursor, GitHub)
├── @claude-zen/intelligence     ✅ AI/Neural coordination, brain systems  
├── @claude-zen/enterprise       ✅ Business workflows, SAFE framework
├── @claude-zen/operations       ✅ Performance tracking, monitoring
├── @claude-zen/infrastructure   ✅ Database abstraction, event systems
└── @claude-zen/development      ✅ Development tools, code analysis, repo analysis, language parsers, AI linting

🔒 Tier 2: Internal Implementation Packages (Private)
├── Core: brain, database, memory, event-system, workflows
├── Intelligence: teamwork, ai-safety, knowledge, agent-manager
├── Infrastructure: load-balancing, system-monitoring, telemetry
└── Enterprise: safe-framework, sparc, agui, chaos-engineering

🔐 Tier 3: Deep Internal Packages (Restricted Access)
├── @claude-zen/dspy          → Only accessible via @claude-zen/brain
├── @claude-zen/neural-ml     → Only accessible via @claude-zen/brain  
└── @claude-zen/fact-system   → Only accessible via @claude-zen/knowledge
```

#### **⚠️ CRITICAL: 3-Tier Architecture Rules**

**🎯 TIER SEPARATION PRINCIPLES:**
- **Tier 1** (Public): Strategic facades + foundation - ONLY packages users import
- **Tier 2** (Private): Implementation packages - Internal business logic
- **Tier 3** (Restricted): Deep internals - Accessed only by specific Tier 2 packages

**✅ CORRECT Import Patterns:**
```typescript
// ✅ USE STRATEGIC FACADES (Tier 1)
import { getBrainSystem } from '@claude-zen/intelligence';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import { getLogger } from '@claude-zen/foundation';

// ❌ NEVER IMPORT IMPLEMENTATION PACKAGES DIRECTLY  
// import { BrainCoordinator } from '@claude-zen/brain';        // WRONG!
// import { DatabaseProvider } from '@claude-zen/database';     // WRONG!
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

**🏗️ Architectural Benefits:**
- **70%+ Code Reduction** through intelligent delegation  
- **Zero Breaking Changes** - facades maintain stable interfaces
- **Lazy Loading** - implementation packages loaded only when needed
- **Graceful Degradation** - fallbacks when packages unavailable

#### **✅ CRITICAL: 3-Tier Import Guide**

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

**❌ TIER 2 - Implementation Packages (INTERNAL ONLY):**
```typescript
// ❌ NEVER IMPORT THESE DIRECTLY - They are private/restricted
// import { BrainCoordinator } from '@claude-zen/brain';           
// import { WorkflowEngine } from '@claude-zen/workflows';         
// import { DatabaseProvider } from '@claude-zen/database';        
// import { EventBus } from '@claude-zen/event-system';           
// import { SafeFramework } from '@claude-zen/safe-framework';
// import { RepoAnalyzer } from '@claude-zen/repo-analyzer';       // Use development.getRepoAnalyzer()
// import { LanguageParser } from '@claude-zen/language-parsers';  // Use development.getLanguageParsers() 
// import { AILinter } from '@claude-zen/ai-linter';               // Use development.getAILinter()
```

**🔐 TIER 3 - Deep Internal Packages (ULTRA RESTRICTED):**
```typescript
// 🔐 ONLY specific packages can access these:
// @claude-zen/dspy         → ONLY via @claude-zen/brain
// @claude-zen/neural-ml    → ONLY via @claude-zen/brain  
// @claude-zen/fact-system  → ONLY via @claude-zen/knowledge
```

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

#### **🎯 Strategic Facade Benefits:**
- **70%+ Code Reduction** through intelligent delegation
- **Battle-Tested Logic** via proven package implementations  
- **Lazy Loading** for optimal performance
- **Type Safety** with comprehensive TypeScript support
- **Zero Breaking Changes** through facade compatibility layers
- **Professional Patterns** matching enterprise architecture standards

### **Internal Coordination System**
- **Technology**: TypeScript with comprehensive event system and strategic facades
- **Coordination**: Direct method calls and type-safe event-driven communication via facades
- **Database**: Multi-backend (SQLite, LanceDB, Kuzu graph) via @claude-zen/infrastructure
- **Architecture**: Queens → Commanders → Cubes → Matrons → Agents/Drones
- **Features**: Agent coordination, memory management, neural processing via strategic facades

### **Web Interface** 
- **Backend API**: RESTful with OpenAPI 3.0/Swagger documentation (web interface ONLY)
- **Frontend**: Svelte web application dashboard
- **Purpose**: Monitoring, visualization, and external control
- **Integration**: API consumes internal coordination system

### **Event System Components**
- **Event Coordinators**: Strategic coordination via type-safe events
- **Task Orchestrators**: Task planning and routing through events
- **Memory Managers**: Persistent storage via event-driven patterns
- **Neural Coordinators**: Learning and adaptation via events
- **Performance Monitors**: System health tracking via events

### **Coordination Patterns**
- **Event-driven communication** via comprehensive type-safe event system
- **Memory persistence** across sessions through database backends  
- **Task orchestration** with SPARC methodology via events
- **Neural coordination** with DSPy integration via events
- **Performance monitoring** via event-driven patterns

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

1. **Start Simple**: Begin with foundation utilities and strategic facades
2. **Use Facades**: Access all functionality through Tier 1 strategic facades
3. **Leverage Foundation**: Use centralized utilities for consistency
4. **Batch Operations**: Combine multiple file operations in single messages
5. **Follow Architecture**: Respect 3-tier separation and import rules

## 🧠 **Event-Driven Coordination**

### **🎯 Coordination Principles**

claude-code-zen provides **event-driven coordination** while Claude Code handles all actual implementation work:

**✅ Event System Handles:**
- Task planning and coordination
- Type-safe event communication
- Memory persistence across sessions
- Neural pattern learning and adaptation
- Performance monitoring and optimization

**✅ Claude Code Handles:**
- ALL file operations (Read, Write, Edit, MultiEdit)
- ALL code generation and implementation
- ALL bash commands and system operations
- ALL actual development work

### **🚀 Efficient Tool Usage Patterns**

**✅ RECOMMENDED - Batch Operations:**
```javascript
// Single message with multiple related operations
[BatchTool]:
  - Read("file1.ts", "file2.ts", "file3.ts")    // Multiple file reads
  - Write("output.ts", content)                  // Create new file
  - Edit("config.ts", oldStr, newStr)            // Update configuration
  - Bash("npm test && npm run lint")             // Combined commands
```

**❌ INEFFICIENT - Sequential Operations:**
```javascript
// Multiple messages (slower, breaks coordination context)
Message 1: Read file
Message 2: Process data  
Message 3: Write output
Message 4: Update config
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
