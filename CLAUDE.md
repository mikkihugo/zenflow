# Claude Flow Project

This project is configured for Claude Code integration.

## Getting Started

Run `claude-zen --help` to see available commands.


---

# Claude Code Configuration for ruv-swarm

## 🎯 IMPORTANT: Separation of Responsibilities

### Claude Code Handles:
- ✅ **ALL file operations** (Read, Write, Edit, MultiEdit)
- ✅ **ALL code generation** and development tasks
- ✅ **ALL bash commands** and system operations
- ✅ **ALL actual implementation** work
- ✅ **Project navigation** and code analysis

### ruv-swarm MCP Tools Handle:
- 🧠 **Coordination only** - Orchestrating Claude Code's actions
- 💾 **Memory management** - Persistent state across sessions
- 🤖 **Neural features** - Cognitive patterns and learning
- 📊 **Performance tracking** - Monitoring and metrics
- 🐝 **Swarm orchestration** - Multi-agent coordination

### ⚠️ Key Principle:
**MCP tools DO NOT create content or write code.** They coordinate and enhance Claude Code's native capabilities. Think of them as an orchestration layer that helps Claude Code work more efficiently.

## 🚀 CRITICAL: Parallel Execution & Batch Operations

### 🚨 MANDATORY RULE #1: BATCH EVERYTHING

**When using swarms, you MUST use BatchTool for ALL operations:**

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
  mcp__ruv-swarm__swarm_init { topology: "mesh", maxAgents: 6 }
  mcp__ruv-swarm__agent_spawn { type: "researcher" }
  mcp__ruv-swarm__agent_spawn { type: "coder" }
  mcp__ruv-swarm__agent_spawn { type: "analyst" }
  mcp__ruv-swarm__agent_spawn { type: "tester" }
  mcp__ruv-swarm__agent_spawn { type: "coordinator" }
  TodoWrite { todos: [todo1, todo2, todo3, todo4, todo5] }
  Bash "mkdir -p app/{src,tests,docs}"
  Write "app/package.json" 
  Write "app/README.md"
  Write "app/src/index.js"
```

**❌ WRONG - Multiple Messages (NEVER DO THIS):**
```javascript
Message 1: mcp__ruv-swarm__swarm_init
Message 2: mcp__ruv-swarm__agent_spawn 
Message 3: mcp__ruv-swarm__agent_spawn
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

## 🚀 Quick Setup (Stdio MCP - Recommended)

### 1. Add MCP Server (Stdio - No Port Needed)
```bash
# Add ruv-swarm MCP server to Claude Code using stdio
claude mcp add ruv-swarm npx ruv-swarm mcp start
```

### 2. Use MCP Tools for Coordination in Claude Code
Once configured, ruv-swarm MCP tools enhance Claude Code's coordination:

**Initialize a swarm:**
- Use the `mcp__ruv-swarm__swarm_init` tool to set up coordination topology
- Choose: mesh, hierarchical, ring, or star
- This creates a coordination framework for Claude Code's work

**Spawn agents:**
- Use `mcp__ruv-swarm__agent_spawn` tool to create specialized coordinators
- Agent types represent different thinking patterns, not actual coders
- They help Claude Code approach problems from different angles

**Orchestrate tasks:**
- Use `mcp__ruv-swarm__task_orchestrate` tool to coordinate complex workflows
- This breaks down tasks for Claude Code to execute systematically
- The agents don't write code - they coordinate Claude Code's actions

## Available MCP Tools for Coordination

### Coordination Tools:
- `mcp__ruv-swarm__swarm_init` - Set up coordination topology for Claude Code
- `mcp__ruv-swarm__agent_spawn` - Create cognitive patterns to guide Claude Code
- `mcp__ruv-swarm__task_orchestrate` - Break down and coordinate complex tasks

### Monitoring Tools:
- `mcp__ruv-swarm__swarm_status` - Monitor coordination effectiveness
- `mcp__ruv-swarm__agent_list` - View active cognitive patterns
- `mcp__ruv-swarm__agent_metrics` - Track coordination performance
- `mcp__ruv-swarm__task_status` - Check workflow progress
- `mcp__ruv-swarm__task_results` - Review coordination outcomes

### Memory & Neural Tools:
- `mcp__ruv-swarm__memory_usage` - Persistent memory across sessions
- `mcp__ruv-swarm__neural_status` - Neural pattern effectiveness
- `mcp__ruv-swarm__neural_train` - Improve coordination patterns
- `mcp__ruv-swarm__neural_patterns` - Analyze thinking approaches

### System Tools:
- `mcp__ruv-swarm__benchmark_run` - Measure coordination efficiency
- `mcp__ruv-swarm__features_detect` - Available capabilities
- `mcp__ruv-swarm__swarm_monitor` - Real-time coordination tracking

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

## Performance Benefits

When using ruv-swarm coordination with Claude Code:
- **84.8% SWE-Bench solve rate** - Better problem-solving through coordination
- **32.3% token reduction** - Efficient task breakdown reduces redundancy
- **2.8-4.4x speed improvement** - Parallel coordination strategies
- **27+ neural models** - Diverse cognitive approaches

## Support

- Documentation: https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm
- Issues: https://github.com/ruvnet/ruv-FANN/issues
- Examples: https://github.com/ruvnet/ruv-FANN/tree/main/ruv-swarm/examples

---

Remember: **ruv-swarm coordinates, Claude Code creates!** Start with `mcp__ruv-swarm__swarm_init` to enhance your development workflow.

---

## Commands

- `claude-zen init` - Initialize project
- `claude-zen status` - Show project status
- `claude-zen help` - Show help

## Configuration

This project uses Claude Flow v2.0.0 for enhanced development workflows.
