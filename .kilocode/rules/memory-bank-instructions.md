# Claude Code Zen - Memory Bank Instructions

This document serves as the comprehensive memory bank for the Claude Code Zen project, containing essential project instructions, architecture decisions, and development guidelines.

## 🚀 CRITICAL: Claude Flow AI-Driven Development

### Claude Code Handles:
- ✅ **ALL file operations** (Read, Write, Edit, MultiEdit)
- ✅ **ALL code generation** and development tasks
- ✅ **ALL bash commands** and system operations
- ✅ **ALL actual implementation** work
- ✅ **Project navigation** and code analysis

### Claude Flow MCP Tools Handle:
- 🧠 **Coordination only** - Orchestrating Claude Code's actions
- 💾 **Memory management** - Persistent state across sessions
- 🤖 **Neural features** - Cognitive patterns and learning
- 📊 **Performance tracking** - Monitoring and metrics
- 🐝 **Swarm orchestration** - Multi-agent coordination
- 🔗 **GitHub integration** - Advanced repository management

### ⚠️ Key Principle:
**MCP tools DO NOT create content or write code.** They coordinate and enhance Claude Code's native capabilities. Think of them as an orchestration layer that helps Claude Code work more efficiently.

## 🚨 MANDATORY RULE #1: BATCH EVERYTHING

**When using swarms, you MUST use BatchTool for ALL operations:**

1. **NEVER** send multiple messages for related operations
2. **ALWAYS** combine multiple tool calls in ONE message
3. **PARALLEL** execution is MANDATORY, not optional

### ⚡ THE GOLDEN RULE OF SWARMS

```
If you need to do X operations, they should be in 1 message, not X messages
```

## 🔗 MCP Architecture - Dual System Integration

**Claude-Zen operates two distinct MCP servers:**

1. **HTTP MCP Server** (`src/interfaces/mcp/`) - **Port 3000**
   - **Purpose**: Claude Desktop integration via HTTP-based MCP protocol
   - **Target**: Human-facing Claude Desktop application
   - **Tools**: Core project management, system info, project initialization

2. **Stdio MCP Server** (`src/coordination/mcp/`) - **Stdio Protocol**
   - **Purpose**: Swarm coordination and agent orchestration
   - **Target**: Automated swarm coordination and AI agent management
   - **Tools**: Swarm initialization, agent spawning, task orchestration

## 📁 **FINAL DOMAIN STRUCTURE**

```
src/
├── coordination/            # 🚀 ALL coordination functionality
│   ├── agents/             # Agent management
│   ├── swarm/              # 🔥 CORE SWARM FUNCTIONALITY
│   │   ├── core/           # Core swarm functionality & types
│   │   ├── chaos-engineering/
│   │   ├── cognitive-patterns/
│   │   ├── connection-management/
│   │   └── claude-zen/     # Enhanced Claude Zen integration
│   └── mcp/                # 🎯 Swarm MCP (stdio)
├── interfaces/              # 🔌 ALL user interfaces
│   ├── api/                # REST API
│   ├── cli/                # CLI interface
│   ├── mcp/                # 🌐 HTTP MCP (port 3000) - Claude Desktop
│   ├── terminal/           # Terminal interface
│   ├── tui/                # TUI interface
│   └── web/                # Web interface
├── database/                # 🗄️ ALL persistence functionality
├── memory/                  # 🧠 ALL memory functionality
├── neural/                  # 🤖 COMPLETE neural + WASM system
├── core/                    # Core system functionality
├── integration/             # Integration systems
├── types/                   # TypeScript type definitions
├── utils/                   # Shared utilities and helpers
└── workflows/               # Workflow execution systems
```

## 🏗️ **DESIGN PATTERNS IMPLEMENTATION**

Claude-Zen implements **6 core design patterns**:

1. **Strategy Pattern** - Swarm coordination topologies (mesh, hierarchical, ring, star)
2. **Observer Pattern** - Real-time event system with typed events and priority handling
3. **Command Pattern** - MCP tool execution with undo support and batch operations
4. **Facade Pattern** - System integration layer with dependency injection
5. **Adapter Pattern** - Multi-protocol support and legacy integration
6. **Composite Pattern** - Agent hierarchies and uniform interfaces

## 🧪 Testing Strategy - Hybrid TDD Approach

**70% London (Mockist) + 30% Classical (Detroit)**

### Use London TDD for:
- MCP Protocol Compliance
- WebSocket Real-time Communication
- Swarm Coordination & Agent Messaging
- Inter-service Integration Boundaries

### Use Classical TDD for:
- Neural Network Algorithms
- WASM Computation Kernels
- Mathematical Operations
- Pure Function Logic

## 🛠️ **DEVELOPMENT COMMANDS**

### Primary Development Environment
```bash
# Claude Code Zen project development
npm run dev                           # Start development mode
npm test                             # Run test suites
npm run build                        # Build project

# MCP Server Operations
npx claude-zen mcp start             # HTTP MCP (Claude Desktop)
claude mcp add claude-zen-swarm npx claude-zen swarm mcp start  # Stdio MCP

# Multi-Interface Startup
claude-zen web start --daemon         # Web dashboard (port 3456)
claude-zen tui                       # Terminal UI
```

### Template and Workspace Operations
```bash
# Project Initialization
claude-zen init <project> --template advanced

# Document-Driven Development
claude-zen workspace init <project>
claude-zen workspace process docs/vision/product.md
claude-zen create prd "User Authentication"

# Status and Monitoring
claude-zen status --format json
claude-zen swarm status
claude-zen workspace status
```

## ✅ **HOOKS ARCHITECTURE**

All hooks are properly located in `templates/claude-zen/hooks/` with:
- **PreToolUse**: Task coordination and memory loading
- **PostToolUse**: Auto-formatting and command logging
- **Stop**: Session summaries and cleanup
- **Subagent Stop**: Cross-agent coordination and learning

## 🌟 **UNIFIED ARCHITECTURE SYSTEM**

Complete unified system with four layers:
1. **DAL (Data Access Layer)** - Unified database operations
2. **UACL (Unified API Client Layer)** - Unified client management
3. **USL (Unified Service Layer)** - Unified service management
4. **UEL (Unified Event Layer)** - Unified event management

## 🎯 **KEY DEVELOPMENT PRINCIPLES**

1. **Domain-Driven Structure**: All code organized by business domain
2. **Template Distribution**: Configurations distributed via `claude-zen init`
3. **MCP Integration**: Dual system for human planning + AI execution
4. **Parallel Execution**: Always batch operations, never sequential
5. **Type Safety**: Full TypeScript implementation throughout
6. **Testing Strategy**: Hybrid TDD based on component type
7. **Performance Focus**: Optimize for distributed AI systems

## 📚 **CRITICAL FILES TO REMEMBER**

- `CLAUDE.md` - Master project configuration (this file)
- `templates/claude-zen/` - Template system for new projects
- `src/coordination/` - All coordination functionality
- `src/interfaces/` - All user interfaces (CLI, web, MCP, etc.)
- `.claude/settings.json` - Claude Code integration configuration
- `docs/` - Document-driven development structure

## 🚨 **EMERGENCY REFERENCES**

If any critical system information is needed:
1. Check this memory bank first
2. Reference the main CLAUDE.md files in project roots
3. Verify MCP server status with `pm2 status`
4. Monitor system health via web dashboard or CLI status commands

This memory bank contains the essential operational knowledge for maintaining and developing the Claude Code Zen project effectively.