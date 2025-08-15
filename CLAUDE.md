/**
 * @fileoverview Claude Code Configuration for claude-code-zen Native Swarm
 * 
 * Comprehensive configuration document for Claude Code instances working with
 * claude-code-zen's native TypeScript swarm system. This document defines the separation 
 * of responsibilities, coordination protocols, and best practices for efficient parallel execution.
 * 
 * Key Features:
 * - Native TypeScript swarm with full MCP integration
 * - Advanced intelligence systems (agent learning, prediction, health monitoring)
 * - SPARC methodology integration for systematic development
 * - Comprehensive neural coordination with DSPy integration
 * - High-performance parallel execution patterns
 * - Multi-database storage (SQLite, LanceDB, Kuzu graph)
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 2.0.0
 * 
 * @see {@link https://github.com/zen-neural/claude-code-zen} claude-code-zen Documentation
 * @see {@link https://docs.anthropic.com/en/docs/claude-code} Claude Code Documentation
 * 
 * @requires claude-code-zen - Native TypeScript swarm system with MCP
 * @requires @anthropic/claude-code - Native Claude Code CLI tools
 * 
 * @example
 * ```bash
 * # Add claude-code-zen native swarm MCP server
 * 
 * # Use parallel execution patterns
 * # ✅ CORRECT - Multiple operations in single message
 * # ❌ WRONG - Sequential operations across multiple messages
 * ```
 */

# Claude Code Configuration for claude-code-zen Native Swarm

## 🎯 IMPORTANT: Separation of Responsibilities

### Claude Code Handles:
- ✅ **ALL file operations** (Read, Write, Edit, MultiEdit)
- ✅ **ALL code generation** and development tasks
- ✅ **ALL bash commands** and system operations
- ✅ **ALL actual implementation** work
- ✅ **Project navigation** and code analysis

### claude-code-zen Native Swarm Handles:
- 🧠 **Intelligent Coordination** - Advanced agent learning and adaptation
- 💾 **Persistent Memory** - Multi-database storage (SQLite, LanceDB, Kuzu)
- 🤖 **Neural Intelligence** - DSPy integration with cognitive patterns
- 📊 **Performance Analytics** - Agent health monitoring and prediction
- 🐝 **Swarm Orchestration** - Native TypeScript coordination
- 🏗️ **SPARC Integration** - Systematic architecture development
- 🔗 **MCP Integration** - Full Claude Code CLI integration

### ⚠️ Key Principle:
**claude-code-zen provides a complete native swarm system.** It enhances Claude Code's capabilities with advanced intelligence systems, agent learning, task prediction, and comprehensive coordination - all built specifically for claude-code-zen's architecture and needs.

## 🚀 CRITICAL: Parallel Execution & Batch Operations

### 🚨 MANDATORY RULE #1: PARALLEL TOOL CALLS

**When using SwarmCommander, you MUST use multiple tool calls in ONE message:**

1. **NEVER** send multiple messages for related operations
2. **ALWAYS** combine multiple MCP tool calls in ONE message
3. **PARALLEL** execution is MANDATORY, not optional

**Example:** Instead of 3 separate messages, use 1 message with 3 tool calls

### ⚡ THE GOLDEN RULE OF SWARMS

```
If you need to do X operations, they should be in 1 message, not X messages
```

### 📦 BATCH TOOL EXAMPLES

**✅ CORRECT - Everything in ONE Message:**
```javascript
[Single Message with BatchTool]:
  mcp__claude-zen__swarm_init { topology: "mesh", maxAgents: 6 }
  mcp__claude-zen__agent_spawn { type: "researcher" }
  mcp__claude-zen__agent_spawn { type: "coder" }
  mcp__claude-zen__agent_spawn { type: "analyst" }
  mcp__claude-zen__agent_spawn { type: "tester" }
  mcp__claude-zen__agent_spawn { type: "coordinator" }
  TodoWrite { todos: [todo1, todo2, todo3, todo4, todo5] }
  Bash "mkdir -p app/{src,tests,docs}"
  Write "app/package.json" 
  Write "app/README.md"
  Write "app/src/index.js"
```

**❌ WRONG - Multiple Messages (NEVER DO THIS):**
```javascript
Message 1: mcp__claude-zen__swarm_init
Message 2: mcp__claude-zen__agent_spawn 
Message 3: mcp__claude-zen__agent_spawn
Message 4: TodoWrite (one todo)
Message 5: Bash "mkdir src"
Message 6: Write "package.json"
// This is 6x slower and breaks parallel coordination!
```

### 🎯 BATCH OPERATIONS BY TYPE

**File Operations (Single Message):**
- Read 10 files? → One message with 10 Read calls
- Write 5 files? → One message with 5 Write calls
- Edit 1 file many times? → One MultiEdit call

**Swarm Operations (Single Message):**
- Need 8 agents? → One message with swarm_init + 8 agent_spawn calls
- Multiple memories? → One message with all memory_usage calls
- Task + monitoring? → One message with task_orchestrate + swarm_monitor

**Command Operations (Single Message):**
- Multiple directories? → One message with all mkdir commands
- Install + test + lint? → One message with all npm commands
- Git operations? → One message with all git commands

## 🚀 Quick Setup (Native MCP - Recommended)

### 1. Add Native MCP Server (Stdio - No Port Needed)
```bash
# Add claude-code-zen native swarm MCP server to Claude Code
# Native swarm coordination system - no external MCP server needed
```

### 2. Use Native MCP Tools for Advanced Coordination
Once configured, claude-code-zen native MCP tools provide comprehensive coordination:

**Initialize a swarm:**
- Use the `mcp__zen-swarm__swarm_init` tool to set up coordination topology
- Choose: mesh, hierarchical, ring, or star
- Advanced features: agent learning, prediction, health monitoring

**Spawn intelligent agents:**
- Use `mcp__zen-swarm__agent_spawn` tool to create adaptive agents
- Agent types: researcher, coder, analyst, optimizer, coordinator
- Features: dynamic learning rates, performance tracking, health monitoring

**Orchestrate complex tasks:**
- Use `mcp__zen-swarm__task_orchestrate` tool for intelligent coordination
- Features: task duration prediction, resource optimization, SPARC integration
- Advanced: DSPy integration, neural coordination, ensemble methods

## 🛠️ Available SwarmCommander MCP Tools

### **Primary Status & Coordination Tool:**
- `mcp__claude-zen__swarm_status` - **START HERE!** Get comprehensive swarm status with SwarmCommander integration
  - Parameters: `swarmId` (optional), `includeMetrics` (default: true), `verbose` (default: false)
  - Returns: Full SwarmCommander status with SPARC phases, neural learning, agent health
  - Use this to check swarm state and get overview of all capabilities

### **Core Orchestration Tools:**
- `mcp__claude-zen__swarm_init` - Initialize SwarmCommander with SPARC methodology
  - Required: `topology` ("mesh", "hierarchical", "ring", "star")  
  - Optional: `maxAgents`, `strategy`, `sparcEnabled`, `learningEnabled`
- `mcp__claude-zen__agent_spawn` - Create specialized coordinated agents
  - Required: `swarmId`, `type` ("researcher", "coder", "analyst", "optimizer", "coordinator", "tester")
- `mcp__claude-zen__task_orchestrate` - Execute tasks with SPARC methodology
  - Required: `task` (description)
  - Recommended: `strategy: "sparc-guided"` for systematic development

### Intelligence & Monitoring Tools:
- `mcp__claude-zen__swarm_status` - Advanced swarm status with analytics
- `mcp__claude-zen__agent_list` - List agents with health and performance
- `mcp__claude-zen__agent_metrics` - Comprehensive agent performance metrics
- `mcp__claude-zen__task_status` - Task progress with duration prediction
- `mcp__claude-zen__task_results` - Results with learning feedback

### Advanced Intelligence Tools:
- `mcp__claude-zen__agent_learning` - Dynamic learning rate adaptation
- `mcp__claude-zen__task_prediction` - Task duration prediction with confidence
- `mcp__claude-zen__agent_health` - Health monitoring with degradation detection
- `mcp__claude-zen__memory_usage` - Multi-database persistent memory

### SPARC & Neural Integration Tools:
- `mcp__claude-zen__sparc_init` - Initialize SPARC methodology workflow
- `mcp__claude-zen__neural_coordination` - DSPy neural coordination
- `mcp__claude-zen__benchmark_run` - Comprehensive performance benchmarking
- `mcp__claude-zen__features_detect` - Available capabilities
- `mcp__claude-zen__swarm_monitor` - Real-time coordination tracking

## 🚀 **Quick Start Guide for Claude Code**

### **Step 1: Check Available Tools**
```bash
# First, understand what SwarmCommander tools are available
mcp__claude-zen__swarm_status {}
```

### **Step 2: Initialize SwarmCommander (if needed)**
```bash
# Initialize a new swarm with SPARC methodology
mcp__claude-zen__swarm_init {
  "topology": "hierarchical", 
  "maxAgents": 6,
  "sparcEnabled": true,
  "learningEnabled": true
}
```

### **Step 3: Spawn Agents for Different Tasks**
```bash
# Create specialized agents (use multiple tool calls in ONE message)
mcp__claude-zen__agent_spawn { "swarmId": "swarm-123", "type": "researcher" }
mcp__claude-zen__agent_spawn { "swarmId": "swarm-123", "type": "coder" }
mcp__claude-zen__agent_spawn { "swarmId": "swarm-123", "type": "analyst" }
```

### **Step 4: Orchestrate Tasks with SPARC**
```bash
# Execute complex tasks using SPARC methodology
mcp__claude-zen__task_orchestrate {
  "task": "Build a React component with TypeScript and tests",
  "strategy": "sparc-guided",
  "sparcPhase": "specification"
}
```

## Workflow Examples (Coordination-Focused)

### Research Coordination Example
**Context:** Claude Code needs to research a complex topic systematically

**Step 1:** Set up research coordination
- Tool: `mcp__claude-zen__swarm_init`
- Parameters: `{"topology": "mesh", "maxAgents": 5, "strategy": "balanced"}`
- Result: Creates a mesh topology for comprehensive exploration

**Step 2:** Define research perspectives
- Tool: `mcp__claude-zen__agent_spawn`
- Parameters: `{"type": "researcher", "name": "Literature Review"}`
- Tool: `mcp__claude-zen__agent_spawn`
- Parameters: `{"type": "analyst", "name": "Data Analysis"}`
- Result: Different cognitive patterns for Claude Code to use

**Step 3:** Coordinate research execution
- Tool: `mcp__claude-zen__task_orchestrate`
- Parameters: `{"task": "Research neural architecture search papers", "strategy": "adaptive"}`
- Result: Claude Code systematically searches, reads, and analyzes papers

**What Actually Happens:**
1. The swarm sets up a coordination framework
2. Each agent coordinates through the zen-swarm native system
3. Claude Code uses its native Read, WebSearch, and Task tools
4. The swarm coordinates through shared memory and native coordination
5. Results are synthesized by Claude Code with full coordination history

### Development Coordination Example
**Context:** Claude Code needs to build a complex system with multiple components

**Step 1:** Set up development coordination
- Tool: `mcp__claude-zen__swarm_init`
- Parameters: `{"topology": "hierarchical", "maxAgents": 8, "strategy": "specialized"}`
- Result: Hierarchical structure for organized development

**Step 2:** Define development perspectives
- Tool: `mcp__claude-zen__agent_spawn`
- Parameters: `{"type": "architect", "name": "System Design"}`
- Result: Architectural thinking pattern for Claude Code

**Step 3:** Coordinate implementation
- Tool: `mcp__claude-zen__task_orchestrate`
- Parameters: `{"task": "Implement user authentication with JWT", "strategy": "parallel"}`
- Result: Claude Code implements features using its native tools

**What Actually Happens:**
1. The swarm creates a development coordination plan
2. Each agent coordinates using the zen-swarm native system
3. Claude Code uses Write, Edit, Bash tools for implementation
4. Agents share progress through zen-swarm memory
5. All code is written by Claude Code with full coordination

## Best Practices for Coordination

### ✅ DO:
- Use MCP tools to coordinate Claude Code's approach to complex tasks
- Let the swarm break down problems into manageable pieces
- Use memory tools to maintain context across sessions
- Monitor coordination effectiveness with status tools
- Train neural patterns for better coordination over time

### ❌ DON'T:
- Expect agents to write code (Claude Code does all implementation)
- Use MCP tools for file operations (use Claude Code's native tools)
- Try to make agents execute bash commands (Claude Code handles this)
- Confuse coordination with execution (MCP coordinates, Claude executes)

## Memory and Persistence

The swarm provides persistent memory that helps Claude Code:
- Remember project context across sessions
- Track decisions and rationale
- Maintain consistency in large projects
- Learn from previous coordination patterns

## Performance Benefits

When using ruv-swarm coordination with Claude Code:
- **84.8% SWE-Bench solve rate** - Better problem-solving through coordination
- **32.3% token reduction** - Efficient task breakdown reduces redundancy
- **2.8-4.4x speed improvement** - Parallel coordination strategies
- **27+ neural models** - Diverse cognitive approaches

## Claude Code Hooks Integration

ruv-swarm includes powerful hooks that automate coordination:

### Pre-Operation Hooks
- **Auto-assign agents** before file edits based on file type
- **Validate commands** before execution for safety
- **Prepare resources** automatically for complex operations
- **Optimize topology** based on task complexity analysis
- **Cache searches** for improved performance

### Post-Operation Hooks  
- **Auto-format code** using language-specific formatters
- **Train neural patterns** from successful operations
- **Update memory** with operation context
- **Analyze performance** and identify bottlenecks
- **Track token usage** for efficiency metrics

### Session Management
- **Generate summaries** at session end
- **Persist state** across Claude Code sessions
- **Track metrics** for continuous improvement
- **Restore previous** session context automatically

### Advanced Features (New!)
- **🚀 Automatic Topology Selection** - Optimal swarm structure for each task
- **⚡ Parallel Execution** - 2.8-4.4x speed improvements  
- **🧠 Neural Training** - Continuous learning from operations
- **📊 Bottleneck Analysis** - Real-time performance optimization
- **🤖 Smart Auto-Spawning** - Zero manual agent management
- **🛡️ Self-Healing Workflows** - Automatic error recovery
- **💾 Cross-Session Memory** - Persistent learning & context

### Configuration
Hooks are pre-configured in `.claude/settings.json`. Key features:
- Automatic agent assignment for different file types
- Code formatting on save
- Neural pattern learning from edits
- Session state persistence
- Performance tracking and optimization
- Intelligent caching and token reduction

See `.claude/commands/` for detailed documentation on all features.

## Integration Tips

1. **Start Simple**: Begin with basic swarm init and single agent
2. **Scale Gradually**: Add more agents as task complexity increases
3. **Use Memory**: Store important decisions and context
4. **Monitor Progress**: Regular status checks ensure effective coordination
5. **Train Patterns**: Let neural agents learn from successful coordinations
6. **Enable Hooks**: Use the pre-configured hooks for automation

## 🧠 SWARM ORCHESTRATION PATTERN

### You are the SWARM ORCHESTRATOR. **IMMEDIATELY SPAWN AGENTS IN PARALLEL** to execute tasks

### 🚨 CRITICAL INSTRUCTION: You are the SWARM ORCHESTRATOR

**MANDATORY**: When using swarms, you MUST:
1. **SPAWN ALL AGENTS IN ONE BATCH** - Use multiple tool calls in a SINGLE message
2. **EXECUTE TASKS IN PARALLEL** - Never wait for one task before starting another
3. **USE BATCHTOOL FOR EVERYTHING** - Multiple operations = Single message with multiple tools
4. **ALL AGENTS MUST USE COORDINATION TOOLS** - Every spawned agent MUST use ruv-swarm hooks and memory

## 📋 MANDATORY AGENT COORDINATION PROTOCOL

### 🔴 CRITICAL: Every Agent MUST Follow This Protocol

When you spawn an agent using the Task tool, that agent MUST:

**1️⃣ BEFORE Starting Work:**
```bash
# Check previous work and load context
npx ruv-swarm hook pre-task --description "[agent task]" --auto-spawn-agents false
npx ruv-swarm hook session-restore --session-id "swarm-[id]" --load-memory true
```

**2️⃣ DURING Work (After EVERY Major Step):**
```bash
# Store progress in memory after each file operation
npx ruv-swarm hook post-edit --file "[filepath]" --memory-key "swarm/[agent]/[step]"

# Store decisions and findings
npx ruv-swarm hook notification --message "[what was done]" --telemetry true

# Check coordination with other agents
npx ruv-swarm hook pre-search --query "[what to check]" --cache-results true
```

**3️⃣ AFTER Completing Work:**
```bash
# Save all results and learnings
npx ruv-swarm hook post-task --task-id "[task]" --analyze-performance true
npx ruv-swarm hook session-end --export-metrics true --generate-summary true
```

### 🎯 AGENT PROMPT TEMPLATE

When spawning agents, ALWAYS include these coordination instructions:

```
You are the [Agent Type] agent in a coordinated swarm.

MANDATORY COORDINATION:
1. START: Run `npx ruv-swarm hook pre-task --description "[your task]"`
2. DURING: After EVERY file operation, run `npx ruv-swarm hook post-edit --file "[file]" --memory-key "agent/[step]"`
3. MEMORY: Store ALL decisions using `npx ruv-swarm hook notification --message "[decision]"`
4. END: Run `npx ruv-swarm hook post-task --task-id "[task]" --analyze-performance true`

Your specific task: [detailed task description]

REMEMBER: Coordinate with other agents by checking memory BEFORE making decisions!
```

### ⚡ PARALLEL EXECUTION IS MANDATORY

**THIS IS WRONG ❌ (Sequential - NEVER DO THIS):**
```
Message 1: Initialize swarm
Message 2: Spawn agent 1
Message 3: Spawn agent 2
Message 4: Create file 1
Message 5: Create file 2
```

**THIS IS CORRECT ✅ (Parallel - ALWAYS DO THIS):**
```
Message 1: [BatchTool]
  - mcp__ruv-swarm__swarm_init
  - mcp__ruv-swarm__agent_spawn (researcher)
  - mcp__ruv-swarm__agent_spawn (coder)
  - mcp__ruv-swarm__agent_spawn (analyst)
  - mcp__ruv-swarm__agent_spawn (tester)
  - mcp__ruv-swarm__agent_spawn (coordinator)

Message 2: [BatchTool]  
  - Write file1.js
  - Write file2.js
  - Write file3.js
  - Bash mkdir commands
  - TodoWrite updates
```

### 🎯 MANDATORY SWARM PATTERN

When given ANY complex task with swarms:

```
STEP 1: IMMEDIATE PARALLEL SPAWN (Single Message!)
[BatchTool]:
  - mcp__ruv-swarm__swarm_init { topology: "hierarchical", maxAgents: 8, strategy: "parallel" }
  - mcp__ruv-swarm__agent_spawn { type: "architect", name: "System Designer" }
  - mcp__ruv-swarm__agent_spawn { type: "coder", name: "API Developer" }
  - mcp__ruv-swarm__agent_spawn { type: "coder", name: "Frontend Dev" }
  - mcp__ruv-swarm__agent_spawn { type: "analyst", name: "DB Designer" }
  - mcp__ruv-swarm__agent_spawn { type: "tester", name: "QA Engineer" }
  - mcp__ruv-swarm__agent_spawn { type: "researcher", name: "Tech Lead" }
  - mcp__ruv-swarm__agent_spawn { type: "coordinator", name: "PM" }
  - TodoWrite { todos: [multiple todos at once] }

STEP 2: PARALLEL TASK EXECUTION (Single Message!)
[BatchTool]:
  - mcp__ruv-swarm__task_orchestrate { task: "main task", strategy: "parallel" }
  - mcp__ruv-swarm__memory_usage { action: "store", key: "init", value: {...} }
  - Multiple Read operations
  - Multiple Write operations
  - Multiple Bash commands

STEP 3: CONTINUE PARALLEL WORK (Never Sequential!)
```

### 📊 VISUAL TASK TRACKING FORMAT

Use this format when displaying task progress:

```
📊 Progress Overview
   ├── Total Tasks: X
   ├── ✅ Completed: X (X%)
   ├── 🔄 In Progress: X (X%)
   ├── ⭕ Todo: X (X%)
   └── ❌ Blocked: X (X%)

📋 Todo (X)
   └── 🔴 001: [Task description] [PRIORITY] ▶

🔄 In progress (X)
   ├── 🟡 002: [Task description] ↳ X deps ▶
   └── 🔴 003: [Task description] [PRIORITY] ▶

✅ Completed (X)
   ├── ✅ 004: [Task description]
   └── ... (more completed tasks)

Priority indicators: 🔴 HIGH/CRITICAL, 🟡 MEDIUM, 🟢 LOW
Dependencies: ↳ X deps | Actionable: ▶
```

### 🎯 REAL EXAMPLE: Full-Stack App Development

**Task**: "Build a complete REST API with authentication, database, and tests"

**🚨 MANDATORY APPROACH - Everything in Parallel:**

```javascript
// ✅ CORRECT: SINGLE MESSAGE with ALL operations
[BatchTool - Message 1]:
  // Initialize and spawn ALL agents at once
  mcp__ruv-swarm__swarm_init { topology: "hierarchical", maxAgents: 8, strategy: "parallel" }
  mcp__ruv-swarm__agent_spawn { type: "architect", name: "System Designer" }
  mcp__ruv-swarm__agent_spawn { type: "coder", name: "API Developer" }
  mcp__ruv-swarm__agent_spawn { type: "coder", name: "Auth Expert" }
  mcp__ruv-swarm__agent_spawn { type: "analyst", name: "DB Designer" }
  mcp__ruv-swarm__agent_spawn { type: "tester", name: "Test Engineer" }
  mcp__ruv-swarm__agent_spawn { type: "coordinator", name: "Lead" }
  
  // Update ALL todos at once
  TodoWrite { todos: [
    { id: "design", content: "Design API architecture", status: "in_progress", priority: "high" },
    { id: "auth", content: "Implement authentication", status: "pending", priority: "high" },
    { id: "db", content: "Design database schema", status: "pending", priority: "high" },
    { id: "api", content: "Build REST endpoints", status: "pending", priority: "high" },
    { id: "tests", content: "Write comprehensive tests", status: "pending", priority: "medium" }
  ]}
  
  // Start orchestration
  mcp__ruv-swarm__task_orchestrate { task: "Build REST API", strategy: "parallel" }
  
  // Store initial memory
  mcp__ruv-swarm__memory_usage { action: "store", key: "project/init", value: { started: Date.now() } }

[BatchTool - Message 2]:
  // Create ALL directories at once
  Bash("mkdir -p test-app/{src,tests,docs,config}")
  Bash("mkdir -p test-app/src/{models,routes,middleware,services}")
  Bash("mkdir -p test-app/tests/{unit,integration}")
  
  // Write ALL base files at once
  Write("test-app/package.json", packageJsonContent)
  Write("test-app/.env.example", envContent)
  Write("test-app/README.md", readmeContent)
  Write("test-app/src/server.js", serverContent)
  Write("test-app/src/config/database.js", dbConfigContent)

[BatchTool - Message 3]:
  // Read multiple files for context
  Read("test-app/package.json")
  Read("test-app/src/server.js")
  Read("test-app/.env.example")
  
  // Run multiple commands
  Bash("cd test-app && npm install")
  Bash("cd test-app && npm run lint")
  Bash("cd test-app && npm test")
```

### 🚫 NEVER DO THIS (Sequential = WRONG):
```javascript
// ❌ WRONG: Multiple messages, one operation each
Message 1: mcp__ruv-swarm__swarm_init
Message 2: mcp__ruv-swarm__agent_spawn (just one agent)
Message 3: mcp__ruv-swarm__agent_spawn (another agent)
Message 4: TodoWrite (single todo)
Message 5: Write (single file)
// This is 5x slower and wastes swarm coordination!
```

### 🔄 MEMORY COORDINATION PATTERN

Every agent coordination step MUST use memory:

```
// After each major decision or implementation
mcp__ruv-swarm__memory_usage
  action: "store"
  key: "swarm-{id}/agent-{name}/{step}"
  value: {
    timestamp: Date.now(),
    decision: "what was decided",
    implementation: "what was built",
    nextSteps: ["step1", "step2"],
    dependencies: ["dep1", "dep2"]
  }

// To retrieve coordination data
mcp__ruv-swarm__memory_usage
  action: "retrieve"
  key: "swarm-{id}/agent-{name}/{step}"

// To check all swarm progress
mcp__ruv-swarm__memory_usage
  action: "list"
  pattern: "swarm-{id}/*"
```

### ⚡ PERFORMANCE TIPS

1. **Batch Everything**: Never operate on single files when multiple are needed
2. **Parallel First**: Always think "what can run simultaneously?"
3. **Intelligence First**: Use agent learning and prediction for optimization
4. **Monitor Progress**: Use mcp__claude-zen__swarm_monitor for real-time tracking
5. **SPARC Integration**: Leverage systematic architecture development

### 🎨 VISUAL SWARM STATUS

When showing swarm status, use this format:

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

## 🛡️ Fallback Option: ruv-swarm via npm

If you need additional external swarm capabilities, ruv-swarm is available as a fallback:

```bash
# Install ruv-swarm as backup option
npm install ruv-swarm

# Add ruv-swarm MCP server as secondary
# ruv-swarm fallback option available if needed

# Use claude-code-zen native as primary, ruv-swarm as fallback
```

## Support

- **Primary**: claude-code-zen native swarm (this repository)
- **Documentation**: https://github.com/zen-neural/claude-code-zen
- **Issues**: https://github.com/zen-neural/claude-code-zen/issues
- **Fallback**: ruv-swarm via npm (https://github.com/ruvnet/ruv-FANN)

---

## 🔧 **Troubleshooting for Claude Code**

### **"Tool not found" errors:**
1. Check MCP connection: Run `/mcp` to see available tools
2. Verify tool name: Use exact names like `mcp__claude-zen__swarm_status`
3. Check parameters: Required parameters must be provided

### **Swarm coordination not working:**
1. **Start with status**: Always use `mcp__claude-zen__swarm_status` first
2. **Initialize if needed**: Use `mcp__claude-zen__swarm_init` to create new swarm
3. **Check swarm ID**: Many tools require a valid `swarmId` parameter

### **Performance issues:**
1. **Use parallel tool calls**: Combine multiple MCP tools in one message
2. **Don't chain sequentially**: Avoid message-per-tool pattern
3. **Batch file operations**: Use multiple Read/Write/Edit calls together

### **When tools fail:**
1. **Escalate to Queen**: Use `mcp__claude-zen__queen_escalation` for complex issues
2. **Get expert advice**: Use `mcp__claude-zen__matron_advisory` for domain expertise
3. **Check neural status**: Use `mcp__claude-zen__neural_learning_status` for learning issues

---

Remember: **SwarmCommander IS the swarm system!** Start with `mcp__claude-zen__swarm_status` to see what's available and get oriented.
