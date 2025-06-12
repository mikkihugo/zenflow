# 🌊 Claude-Flow: Agent Orchestration Platform for Claude-Code 

<div align="center">

[![🌟 Star on GitHub](https://img.shields.io/github/stars/ruvnet/claude-code-flow?style=for-the-badge&logo=github&color=gold)](https://github.com/ruvnet/claude-code-flow)
[![📦 NPX Ready](https://img.shields.io/npm/v/claude-flow?style=for-the-badge&logo=npm&color=blue&label=NPX%20INSTALL)](https://www.npmjs.com/package/claude-flow)
[![✅ 95% Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen?style=for-the-badge&logo=codecov)](./test-results/coverage-html/index.html)
[![🦕 Deno Powered](https://img.shields.io/badge/deno-v1.40+-blue?style=for-the-badge&logo=deno)](https://deno.land/)
[![⚡ TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![📖 Documentation](https://img.shields.io/badge/docs-comprehensive-green?style=for-the-badge&logo=gitbook)](./docs/)
[![🛡️ MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=opensourceinitiative)](https://opensource.org/licenses/MIT)

</div>

## 🎉 **What's New in v1.0.41**

- **🚀 Simplified SPARC Syntax**: `npx claude-flow sparc "build app"` (no more double sparc!)
- **⚡ Auto-Skip Permissions**: `--dangerously-skip-permissions` by default (use `--enable-permissions` to restore prompts)
- **🔄 BatchTool Integration**: Parallel execution with boomerang orchestration patterns
- **📁 Directory Safety**: Enhanced guidance to prevent files in node_modules
- **🤖 Non-Interactive Mode**: Full automation support with `--non-interactive` flag
- **🎯 17+ SPARC Modes**: Including new `sparc-orchestrator` for complex workflows
- **📂 Local Executable**: `init` now creates `./claude-flow` wrapper to ensure correct working directory
- **🔧 Fixed SPARC Path Resolution**: `.roomodes` now correctly found in project directory
- **🌐 Remote Environment Support**: Improved wrapper script for npm/npx installations
- **📝 Better SPARC Error Messages**: Clear guidance when `.roomodes` is missing


## 🎯 **Transform Your Development Workflow**

**Claude-Flow** is the ultimate multi-terminal orchestration platform that revolutionizes how you work with Claude Code. Imagine coordinating **dozens of AI agents** simultaneously, each working on different aspects of your project while sharing knowledge through an intelligent memory bank.

> 🔥 **One command to rule them all**: `npx claude-flow` - Deploy a full AI agent coordination system in seconds!

### 🌟 **Why Claude-Flow?**

- **🚀 10x Faster Development**: Parallel AI agent execution with intelligent task distribution
- **🧠 Persistent Memory**: Agents learn and share knowledge across sessions
- **⚡ SPARC Methodology**: Systematic development with Specification → Pseudocode → Architecture → Refinement → Completion
- **🔄 Zero Configuration**: Works out-of-the-box with sensible defaults
- **🤖 VSCode Native**: Seamless integration with your favorite IDE
- **🔒 Enterprise Ready**: Production-grade security, monitoring, and scaling
- **🌐 MCP Compatible**: Full Model Context Protocol support for tool integration

## 📦 **Installation**

```bash
# 🚀 Get started in 30 seconds
npx claude-flow@latest init --sparc      # Initialize with SPARC modes
npx claude-flow start

# ⚡ SPARC Development Workflow (NEW: Simplified!)
npx claude-flow sparc "build a todo app" # Orchestrator mode (default)
npx claude-flow sparc modes              # List 17+ development modes
npx claude-flow sparc tdd "user auth"    # Run TDD workflow
npx claude-flow sparc run code "API"     # Specific mode execution

# 🚀 Parallel Execution with BatchTool
batchtool run --parallel \
  "npx claude-flow sparc run code 'frontend' --non-interactive" \
  "npx claude-flow sparc run code 'backend' --non-interactive" \
  "npx claude-flow sparc run tdd 'tests' --non-interactive"

# 🤖 Spawn a research team
npx claude-flow agent spawn researcher --name "Senior Researcher"
npx claude-flow agent spawn analyst --name "Data Analyst"
npx claude-flow agent spawn implementer --name "Code Developer"

# 📋 Create and execute tasks
npx claude-flow task create research "Research AI optimization techniques"
npx claude-flow task list

# 📊 Monitor in real-time
npx claude-flow status
npx claude-flow monitor
```

## 🏗️ **Core Features**

<table>
<tr>
<td width="33%" align="center">

### 🤖 **Multi-Agent Orchestration**
Coordinate dozens of AI agents with different specializations, each running in isolated terminal sessions with intelligent load balancing.

</td>
<td width="33%" align="center">

### 🧠 **Intelligent Memory Bank**
Advanced CRDT-based memory system with SQLite performance and Markdown readability. Agents learn and share knowledge across sessions.

</td>
<td width="33%" align="center">

### ⚡ **SPARC Development**
Systematic AI-assisted development using Specification → Pseudocode → Architecture → Refinement → Completion methodology with 16+ specialized modes.

</td>
</tr>
<tr>
<td width="33%" align="center">

### 🎯 **Smart Task Scheduling**
Priority-based task queues with dependency resolution, deadlock detection, and automatic retry with exponential backoff.

</td>
<td width="33%" align="center">

### 🔒 **Enterprise Security**
Token-based authentication, rate limiting, circuit breakers, audit logging, and role-based access control.

</td>
<td width="33%" align="center">

### 🌐 **MCP Integration**
Full Model Context Protocol support with stdio and HTTP transports, enabling seamless integration with external tools.

</td>
</tr>
</table>

## ⚡ **Quick Start**

### 🎯 **Option 1: NPX (Recommended)**
```bash
# Install and run in one command
npx claude-flow

# Or install globally for repeated use
npm install -g claude-flow
claude-flow --version
```

### 🦕 **Option 2: Deno (For Developers)**
```bash
# Install via Deno
deno install --allow-all --name claude-flow \
  https://raw.githubusercontent.com/ruvnet/claude-code-flow/main/src/cli/index.ts

# Or run directly
deno run --allow-all \
  https://raw.githubusercontent.com/ruvnet/claude-code-flow/main/src/cli/index.ts
```

### 🔧 **Option 3: From Source (For Contributors)**
```bash
git clone https://github.com/ruvnet/claude-code-flow.git
cd claude-code-flow
deno task build && deno task install
```

## 📚 **Documentation**

Comprehensive documentation is available to help you get the most out of Claude-Flow:

- **[Getting Started Guide](./docs/01-getting-started.md)** - Quick setup and first steps
- **[Architecture Overview](./docs/02-architecture-overview.md)** - System design and components
- **[Configuration Guide](./docs/03-configuration-guide.md)** - Detailed configuration options
- **[Agent Management](./docs/04-agent-management.md)** - Working with AI agents
- **[Task Coordination](./docs/05-task-coordination.md)** - Task scheduling and workflows
- **[Memory Bank Usage](./docs/06-memory-bank-usage.md)** - Persistent memory system
- **[MCP Integration](./docs/07-mcp-integration.md)** - Model Context Protocol tools
- **[Terminal Management](./docs/08-terminal-management.md)** - Terminal pooling and sessions
- **[Troubleshooting](./docs/09-troubleshooting.md)** - Common issues and solutions
- **[Advanced Usage](./docs/10-advanced-usage.md)** - Power user features
- **[Claude Spawning](./docs/11-claude-spawning.md)** - Spawning Claude instances
- **[CLI Reference](./docs/cli-reference.md)** - Complete command documentation

## 💡 **Quick Start Guide**

### 1. **Initialize Claude Code Integration**
```bash
# Basic init (without SPARC modes)
npx claude-flow init

# Recommended: Initialize with SPARC development modes
npx claude-flow init --sparc
```
The `--sparc` flag creates:
- `CLAUDE.md` - SPARC-enhanced Claude Code configuration
- `memory-bank.md` - Memory system documentation
- `coordination.md` - Agent coordination documentation
- `.roomodes` - SPARC development mode configurations
- `.roo/` - SPARC templates and workflows
- Memory folder structure with placeholders
- `./claude-flow` - Local executable wrapper (use instead of npx)

### 2. **Start the Orchestrator**
```bash
# After init, use the local wrapper:
./claude-flow start

# Or run as daemon
./claude-flow start --daemon

# If not initialized yet, use npx:
npx claude-flow start
```

### 3. **Spawn Agents**
```bash
# Spawn different agent types with specific capabilities
npx claude-flow agent spawn researcher --name "Research Assistant" --priority 8
npx claude-flow agent spawn implementer --name "Code Developer" --priority 7
npx claude-flow agent spawn analyst --name "Data Analyst" --priority 6
npx claude-flow agent spawn coordinator --name "Project Manager" --priority 9

# List all active agents
npx claude-flow agent list

# Get detailed information about an agent
npx claude-flow agent info agent-123
```

### 4. **Create and Manage Tasks**
```bash
# Create tasks with different priorities
npx claude-flow task create research "Analyze authentication best practices" --priority 8
npx claude-flow task create implementation "Build JWT authentication" --priority 9
npx claude-flow task create analysis "Review security vulnerabilities" --priority 10

# Create task with dependencies
npx claude-flow task create implementation "Build user management" \
  --priority 7 --deps task-123,task-456

# Assign tasks to agents
npx claude-flow task assign task-123 agent-456

# List all tasks
npx claude-flow task list
npx claude-flow task list --verbose  # Show detailed task information

# Check specific task status
npx claude-flow task status task-123

# Cancel a task
npx claude-flow task cancel task-789
```

### 5. **Spawn Claude Instances** 🆕
```bash
# Spawn Claude with enhanced Claude-Flow guidance
npx claude-flow claude spawn "implement user authentication" --research --parallel

# Backend-only mode with high coverage
npx claude-flow claude spawn "create REST API" --mode backend-only --coverage 95

# Frontend development with feature commits
npx claude-flow claude spawn "build React components" --mode frontend-only --commit feature

# Full stack with all options
npx claude-flow claude spawn "build complete app" --research --parallel --coverage 90 --verbose

# Execute batch workflow
npx claude-flow claude batch examples/claude-workflow.json --dry-run
```

**Enhanced Claude Instances receive:**
- Detailed Claude-Flow system guidance
- Proper `npx claude-flow` command syntax
- Mode-specific instructions (backend/frontend/api/full)
- Memory bank operations with examples
- Configuration-aware development guidance

### 6. **Monitor System Status**
```bash
# Check system health
npx claude-flow status

# Real-time monitoring
npx claude-flow monitor

# View MCP tools
npx claude-flow mcp tools
```

## 🚀 **SPARC Development Methodology**

Claude-Flow integrates the **SPARC** (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic AI-assisted development:

### **Available SPARC Modes**
```bash
# List all development modes
npx claude-flow sparc modes

# Key modes include:
# 🏗️ architect      - System design and architecture
# 🧠 code           - Clean, modular implementation  
# 🧪 tdd            - Test-driven development
# 🛡️ security-review - Security analysis
# 📚 docs-writer    - Documentation creation
# 🔗 integration    - System integration
```

### **SPARC Workflow**
```bash
# Simplified orchestration (NEW!)
npx claude-flow sparc "build complete authentication system"

# Or use specific modes:
# 1. Specification - Define requirements
npx claude-flow sparc run spec-pseudocode "user authentication system"

# 2. Architecture - Design system structure  
npx claude-flow sparc run architect "auth service architecture"

# 3. Refinement - TDD implementation
npx claude-flow sparc tdd "implement JWT authentication"

# 4. Integration - Connect components
npx claude-flow sparc run integration "auth with user management"

# 5. Completion - Documentation and validation
npx claude-flow sparc run docs-writer "authentication API docs"
```

### **Parallel Execution with BatchTool**
```bash
# Run multiple SPARC modes concurrently
batchtool run --parallel \
  "npx claude-flow sparc run code 'user service' --non-interactive" \
  "npx claude-flow sparc run code 'auth service' --non-interactive" \
  "npx claude-flow sparc run tdd 'test suite' --non-interactive"

# Boomerang orchestration pattern
batchtool orchestrate --boomerang \
  --research "npx claude-flow sparc run ask 'requirements' --non-interactive" \
  --design "npx claude-flow sparc run architect 'system' --non-interactive" \
  --implement "npx claude-flow sparc run code 'features' --non-interactive" \
  --test "npx claude-flow sparc run tdd 'validation' --non-interactive"
```

### **SPARC Features**
- **17+ Specialized AI Modes** for different development phases
- **Memory Persistence** across SPARC sessions with namespaced storage
- **TDD Enforcement** with Red-Green-Refactor cycle automation
- **Modular Design** with <500 line file constraints
- **Environment Safety** preventing credential exposure
- **BatchTool Integration** for parallel and boomerang orchestration
- **Non-Interactive Mode** for automation and CI/CD integration
- **Auto-Skip Permissions** by default (use --enable-permissions to prompt)
- **Quality Gates** with automated code analysis and security review

## Architecture

Claude-Flow uses a modular architecture with the following components:

- **Orchestrator**: Central coordinator managing all system components
- **Terminal Manager**: Handles terminal sessions with pooling and recycling
- **Memory Manager**: Persistent storage with caching and indexing
- **Coordination Manager**: Task scheduling and resource management
- **MCP Server**: Tool integration via Model Context Protocol

## Configuration

Default configuration file (`claude-flow.config.json`):

```json
{
  "orchestrator": {
    "maxConcurrentAgents": 10,
    "taskQueueSize": 100,
    "healthCheckInterval": 30000,
    "shutdownTimeout": 30000
  },
  "terminal": {
    "type": "auto",
    "poolSize": 5,
    "recycleAfter": 10,
    "healthCheckInterval": 60000,
    "commandTimeout": 300000
  },
  "memory": {
    "backend": "hybrid",
    "cacheSizeMB": 100,
    "syncInterval": 5000,
    "conflictResolution": "crdt",
    "retentionDays": 30
  },
  "coordination": {
    "maxRetries": 3,
    "retryDelay": 1000,
    "deadlockDetection": true,
    "resourceTimeout": 60000,
    "messageTimeout": 30000
  },
  "mcp": {
    "transport": "stdio",
    "port": 3000,
    "tlsEnabled": false
  },
  "logging": {
    "level": "info",
    "format": "json",
    "destination": "console"
  }
}
```

## Agent Types

Claude-Flow supports multiple agent types:

- **Coordinator**: Plans and delegates tasks to other agents
- **Researcher**: Gathers and analyzes information
- **Implementer**: Writes code and creates solutions
- **Analyst**: Identifies patterns and generates insights
- **Custom**: User-defined agent types

## 🛠️ **CLI Commands**

Claude-Flow provides a comprehensive CLI for managing your AI orchestration system. For detailed command documentation, see the [CLI Reference](./docs/cli-reference.md).

### 🌐 **Global Options**
- `-c, --config <path>`: Path to configuration file
- `-v, --verbose`: Enable verbose logging
- `--log-level <level>`: Set log level (debug, info, warn, error)
- `--version`: Show version information
- `--help`: Show help for any command

### 📋 **Core Commands**

#### `init` - Initialize Claude Code Integration
```bash
npx claude-flow@latest init [options]
  -s, --sparc               Initialize with SPARC development environment (recommended)
  -f, --force               Overwrite existing files
  -m, --minimal             Create minimal configuration files
```

**Recommended first-time setup:**
```bash
npx claude-flow@latest init --sparc
```

Creates:
- `CLAUDE.md` - AI-readable project instructions
- `.roomodes` - 17 pre-configured SPARC development modes
- `memory-bank.md` - Persistent memory documentation
- `coordination.md` - Agent coordination guide
- Complete folder structure for development

#### `start` - Start Orchestration System
```bash
npx claude-flow start [options]
  -d, --daemon              Run as daemon in background
  -p, --port <port>         MCP server port (default: 3000)
```

#### `status` - Show System Status
```bash
npx claude-flow status [options]
  -v, --verbose             Show detailed status information
```

#### `agent` - Manage AI Agents
```bash
npx claude-flow agent <subcommand>
  spawn <type>              Spawn a new agent (researcher/implementer/analyst/coordinator)
    --name <name>           Agent name
    --priority <1-10>       Agent priority
    --max-tasks <n>         Max concurrent tasks
  list                      List all active agents
  info <agent-id>          Get detailed agent information
  terminate <agent-id>      Terminate an agent
```

#### `task` - Manage Tasks
```bash
npx claude-flow task <subcommand>
  create <type> <desc>      Create a new task
    --priority <1-10>       Task priority
    --deps <task-ids>       Comma-separated dependency IDs
  list                      List all tasks
    --verbose               Show task descriptions
  status <task-id>          Get task status
  cancel <task-id>          Cancel a task
  workflow <file>           Execute workflow from file
    --async                 Run workflow asynchronously
```

#### `memory` - Manage Memory Bank
```bash
npx claude-flow memory <subcommand>
  query <search>            Search memory entries
    --namespace <ns>        Filter by namespace
    --limit <n>             Limit results
  store <key> <value>       Store information
    --namespace <ns>        Target namespace
  export <file>             Export memory to file
  import <file>             Import memory from file
  stats                     Show memory statistics
  cleanup                   Clean up old entries
    --days <n>              Entries older than n days
```

#### `mcp` - MCP Server Management
```bash
npx claude-flow mcp <subcommand>
  status                    Show MCP server status
  tools                     List available MCP tools
  config                    Show MCP configuration
  logs                      View MCP server logs
    --lines <n>             Number of log lines (default: 50)
```

#### `monitor` - Real-time Monitoring
```bash
npx claude-flow monitor [options]
  -i, --interval <seconds>  Update interval (default: 2)
  -c, --compact             Compact view mode
  -f, --focus <component>   Focus on specific component
```

#### `sparc` - SPARC Development Methodology 🆕
```bash
npx claude-flow sparc [subcommand] [options]
  "<task>"                  Run SPARC orchestrator (default mode)
  modes [--verbose]         List available SPARC development modes
  info <mode>               Show detailed mode information
  run <mode> "<task>"       Execute specific SPARC mode
  tdd "<feature>"           Run full TDD workflow
    --namespace <ns>        Use custom memory namespace
    --dry-run               Show configuration without executing
    --verbose               Show detailed output
    --non-interactive       Run with stream-json output (for automation)
    --enable-permissions    Enable permission prompts (default: skip)
```

**Default Behavior Updates:**
- Simplified syntax: `npx claude-flow sparc "build app"` (no need for `run sparc`)
- Permissions auto-skipped by default (use `--enable-permissions` to prompt)
- Non-interactive mode for BatchTool orchestration

#### `claude` - Spawn Claude Instances with Enhanced Guidance 🆕
```bash
npx claude-flow claude <subcommand>
  spawn <task>              Spawn Claude with enhanced Claude-Flow guidance
    -t, --tools <tools>     Allowed tools (comma-separated)
    --no-permissions        Use --dangerously-skip-permissions flag
    -c, --config <file>     MCP config file path
    -m, --mode <mode>       Development mode (full/backend-only/frontend-only/api-only)
    --parallel              Enable parallel execution with multi-agent support
    --research              Enable web research with WebFetchTool
    --coverage <n>          Test coverage target percentage (default: 80)
    --commit <freq>         Commit frequency (phase/feature/manual)
    -v, --verbose           Enable verbose output
    -d, --dry-run           Show what would be executed without running
    
  batch <workflow-file>     Execute multiple Claude instances from workflow
    --dry-run               Show what would be executed without running
```

**Each spawned Claude instance receives comprehensive guidance including:**
- Claude-Flow memory operations (`npx claude-flow memory store/query`)
- System management commands (`npx claude-flow status/monitor`)
- Agent coordination (when --parallel is used)
- Mode-specific development focus
- Coverage and commit strategy awareness
- Example commands ready to use with the Bash tool

#### `config` - Configuration Management
```bash
npx claude-flow config <subcommand>
  show                      Show current configuration
  get <path>                Get specific config value
  set <path> <value>        Set config value
  init [file]               Initialize config file
  validate <file>           Validate config file
```

#### `session` - Session Management
```bash
npx claude-flow session <subcommand>
  list                      List active sessions
  info <session-id>         Get session information
  terminate <session-id>    End a session
```

#### `workflow` - Workflow Execution
```bash
npx claude-flow workflow <file> [options]
  --validate                Validate workflow without executing
  --async                   Run workflow asynchronously
  --watch                   Watch workflow progress
```

#### `help` - Get Help
```bash
npx claude-flow help [command]
```

### 🎯 **Common Use Cases**

**Complete Agent & Task Workflow:**
```bash
# Initialize and start the system
npx claude-flow init
npx claude-flow start --daemon

# Spawn a team of agents
npx claude-flow agent spawn researcher --name "Senior Researcher" --priority 8
npx claude-flow agent spawn analyst --name "Data Analyst" --priority 7
npx claude-flow agent spawn implementer --name "Lead Developer" --priority 9

# Create research task
TASK1=$(npx claude-flow task create research "Analyze authentication patterns" --priority 8 | grep "Task ID" | awk '{print $3}')

# Create analysis task dependent on research
TASK2=$(npx claude-flow task create analysis "Security audit findings" --priority 7 --deps $TASK1 | grep "Task ID" | awk '{print $3}')

# Create implementation task dependent on analysis
TASK3=$(npx claude-flow task create implementation "Build secure auth system" --priority 9 --deps $TASK2 | grep "Task ID" | awk '{print $3}')

# Assign tasks to appropriate agents
npx claude-flow task assign $TASK1 $(npx claude-flow agent list | grep researcher | awk '{print $2}')
npx claude-flow task assign $TASK2 $(npx claude-flow agent list | grep analyst | awk '{print $2}')
npx claude-flow task assign $TASK3 $(npx claude-flow agent list | grep implementer | awk '{print $2}')

# Monitor the workflow
npx claude-flow monitor
```

**Code Development Workflow:**
```bash
npx claude-flow agent spawn implementer --name "Backend Dev" --max-tasks 3
npx claude-flow agent spawn implementer --name "Frontend Dev" --max-tasks 3
npx claude-flow agent spawn coordinator --name "Tech Lead"
npx claude-flow workflow development-pipeline.json --watch
```

**SPARC Development Workflow:**
```bash
# Initialize SPARC environment
npx claude-flow init --sparc

# Complete feature development using SPARC methodology
npx claude-flow sparc run spec-pseudocode "user authentication system"
npx claude-flow sparc run architect "JWT auth service design"
npx claude-flow sparc tdd "implement secure authentication"
npx claude-flow sparc run security-review "auth vulnerability scan"
npx claude-flow sparc run integration "connect auth to user service"

# TDD-focused development
npx claude-flow sparc tdd "payment processing system"
npx claude-flow sparc tdd "real-time notifications"

# Architecture and design
npx claude-flow sparc run architect "microservices architecture"
npx claude-flow sparc run docs-writer "API documentation"
```

**Enhanced Claude Spawn Examples:**
```bash
# Backend API development with high test coverage
npx claude-flow claude spawn "build REST API with authentication" \
  --mode backend-only --coverage 95 --commit feature

# Frontend development with research capabilities
npx claude-flow claude spawn "create responsive dashboard" \
  --mode frontend-only --research --verbose

# Full-stack development with parallel execution
npx claude-flow claude spawn "implement user management system" \
  --parallel --coverage 90 --commit phase

# API design focus with custom tools
npx claude-flow claude spawn "design GraphQL schema" \
  --mode api-only --tools "View,Edit,GrepTool,LS"
```

**Workflow Execution:**
```bash
# Execute a predefined workflow
npx claude-flow workflow examples/development-config.json

# Execute workflow with monitoring
npx claude-flow workflow examples/research-workflow.json --watch

# Validate workflow before execution
npx claude-flow workflow my-workflow.json --validate
```

## Workflow Example

Create a workflow file (`example-workflow.json`):

```json
{
  "name": "Research and Analysis Workflow",
  "tasks": [
    {
      "id": "research-1",
      "type": "research",
      "description": "Research quantum computing basics",
      "assignTo": "researcher"
    },
    {
      "id": "analyze-1",
      "type": "analysis",
      "description": "Analyze research findings",
      "dependencies": ["research-1"],
      "assignTo": "analyst"
    },
    {
      "id": "report-1",
      "type": "report",
      "description": "Generate summary report",
      "dependencies": ["analyze-1"],
      "assignTo": "coordinator"
    }
  ]
}
```

Execute the workflow:
```bash
claude-flow task workflow example-workflow.json
```

## Development

### Prerequisites
- Deno 1.38+ or Node.js 16+ (Install Deno: https://deno.land/#installation)
- Git

### Setup
```bash
git clone https://github.com/ruvnet/claude-code-flow.git
cd claude-flow
deno task dev
```

### Testing
```bash
deno task test
```

### Building
```bash
deno task build
```

## API Usage

Claude-Flow can also be used programmatically:

```typescript
import { Orchestrator } from 'claude-flow';

const orchestrator = new Orchestrator(config);
await orchestrator.initialize();

// Spawn an agent
const sessionId = await orchestrator.spawnAgent({
  id: 'agent-1',
  name: 'Research Agent',
  type: 'researcher',
  // ... other properties
});

// Create and assign a task
await orchestrator.assignTask({
  id: 'task-1',
  type: 'research',
  description: 'Research AI trends',
  // ... other properties
});
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔌 **Integration with Claude Code**

Claude-Flow seamlessly integrates with Claude Code through the `CLAUDE.md` file created by `npx claude-flow init`. This enables:

- **Automatic Context Loading**: Claude Code reads your project configuration
- **Build Command Integration**: All build/test commands are available to Claude
- **Memory Persistence**: Claude remembers context across sessions
- **Enhanced Guidance**: Spawned Claude instances receive detailed Claude-Flow instructions
- **SPARC Methodology**: Built-in support for systematic development with 16+ specialized AI modes

Use with Claude Code:
```bash
# Initialize integration
npx claude-flow init

# Spawn Claude with enhanced Claude-Flow guidance
npx claude-flow claude spawn "your task here" --research --parallel

# Claude receives:
# - Instructions on using npx claude-flow commands
# - Memory operations (store/query)
# - Agent coordination capabilities
# - Mode-specific development guidance
```

## 🏢 **Enterprise Features**

- **🔐 Security**: Token-based auth, rate limiting, audit logging
- **📊 Monitoring**: Real-time metrics, performance tracking, health checks
- **🔄 Reliability**: Circuit breakers, automatic retries, graceful degradation
- **📈 Scalability**: Horizontal scaling, load balancing, resource pooling
- **🛡️ Compliance**: Audit trails, data retention policies, access controls

## 📖 **Resources**

### Documentation
- **[Complete Documentation](./docs/)** - All guides and references
- **[API Documentation](./docs/api/)** - Programmatic usage
- **[Examples](./examples/)** - Sample configurations and workflows
- **[Memory System Docs](./memory/docs/)** - In-depth memory bank documentation

### Community & Support
- **[GitHub Issues](https://github.com/ruvnet/claude-code-flow/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/ruvnet/claude-code-flow/discussions)** - Community forum
- **[Discord Server](https://discord.gg/claude-flow)** - Real-time chat and support
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/claude-flow)** - Q&A

### Tutorials & Guides
- **[Video Tutorials](https://youtube.com/claude-flow)** - Step-by-step video guides
- **[Blog Posts](https://claude-flow.dev/blog)** - Tips, tricks, and use cases
- **[Case Studies](https://claude-flow.dev/case-studies)** - Real-world implementations

## 🚀 **Roadmap**

### Q1 2025
- [x] Initial release with core orchestration
- [x] Memory bank implementation
- [x] MCP integration
- [x] Claude Code integration (`init` command)
- [ ] Web UI for visual orchestration
- [ ] Plugin system for custom agent types

### Q2 2025
- [ ] Distributed orchestration support
- [ ] Enhanced monitoring dashboard
- [ ] Integration with more AI models
- [ ] Workflow templates library
- [ ] Cloud deployment options

### Q3 2025
- [ ] Enterprise SSO integration
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
- [ ] GraphQL API
- [ ] Mobile app for monitoring

## 🤝 **Contributing**

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for:
- Code of Conduct
- Development setup
- Submission guidelines
- Coding standards
- Testing requirements

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built on top of Claude Code and Anthropic's Claude AI
- Inspired by the SPARC methodology
- Thanks to all contributors and the Claude community

## 📊 **Stats**

![GitHub stars](https://img.shields.io/github/stars/ruvnet/claude-code-flow?style=social)
![npm downloads](https://img.shields.io/npm/dm/claude-flow)
![Contributors](https://img.shields.io/github/contributors/ruvnet/claude-code-flow)
![Last commit](https://img.shields.io/github/last-commit/ruvnet/claude-code-flow)

---

Built with ❤️ by [rUv](https://github.com/ruvnet) for the Claude community
