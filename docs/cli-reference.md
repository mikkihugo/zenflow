# CLI Reference

**Complete command-line interface reference for Claude Code Flow.**

## 📋 **Command Overview**

```bash
claude-zen <command> [options] [arguments]
```

### **Global Options**
- `--help, -h` - Show help information
- `--version, -v` - Show version number
- `--debug` - Enable debug mode with verbose logging
- `--quiet, -q` - Suppress non-essential output
- `--format <type>` - Output format: `json`, `yaml`, `table` (default: `table`)

## 🚀 **Core Commands**

### **`init` - Initialize New Project**

Create a new Claude Code Flow project with templates and configuration.

```bash
claude-zen init <project-name> [options]
```

**Options:**
- `--template <type>` - Project template: `basic`, `advanced`, `neural`, `swarm` (default: `basic`)
- `--directory <path>` - Target directory (default: current directory)
- `--git` - Initialize git repository
- `--install` - Install dependencies after creation

**Examples:**
```bash
# Basic project setup
claude-zen init my-project

# Advanced project with neural capabilities
claude-zen init ai-assistant --template=advanced --git --install

# Swarm-focused project
claude-zen init swarm-coordinator --template=swarm
```

**Generated Structure:**
- `docs/` - Document-driven development structure
- `src/` - Source code directory
- `tests/` - Test suites
- `.claude/` - Claude Code integration files
- `package.json` - Project configuration

---

### **`status` - System Status**

Display comprehensive system status and health information.

```bash
claude-zen status [options]
```

**Options:**
- `--detailed` - Show detailed component information
- `--watch` - Continuously monitor status (updates every 5s)
- `--component <name>` - Show specific component: `mcp`, `swarm`, `web`, `memory`

**Examples:**
```bash
# Basic status
claude-zen status

# Detailed status in JSON format
claude-zen status --detailed --format json

# Watch system status continuously
claude-zen status --watch

# Check specific component
claude-zen status --component swarm
```

**Output Includes:**
- System health and version
- Active components (MCP, swarm, web)
- Resource usage (CPU, memory)
- Recent activity and performance metrics

---

## 🐝 **Swarm Management**

### **`swarm` - Swarm Operations**

Manage AI agent swarms for coordinated task execution.

```bash
claude-zen swarm <action> [options]
```

#### **Swarm Actions**

#### **`swarm init` - Initialize Swarm**
```bash
claude-zen swarm init [options]
```

**Options:**
- `--topology <type>` - Swarm topology: `mesh`, `hierarchical`, `ring`, `star` (default: `mesh`)
- `--agents <count>` - Number of agents: 1-20 (default: 4)
- `--strategy <type>` - Coordination strategy: `parallel`, `sequential`, `adaptive` (default: `parallel`)
- `--memory` - Enable persistent memory across sessions

**Examples:**
```bash
# Basic mesh swarm
claude-zen swarm init

# Hierarchical swarm with 8 agents
claude-zen swarm init --topology hierarchical --agents 8

# Advanced swarm with memory persistence
claude-zen swarm init --topology mesh --agents 6 --strategy adaptive --memory
```

#### **`swarm status` - Swarm Status**
```bash
claude-zen swarm status [options]
```

**Options:**
- `--agents` - Show individual agent status
- `--tasks` - Show active task information
- `--metrics` - Show performance metrics

#### **`swarm stop` - Stop Swarm**
```bash
claude-zen swarm stop [swarm-id]
```

#### **`swarm list` - List All Swarms**
```bash
claude-zen swarm list [options]
```

**Options:**
- `--active` - Show only active swarms
- `--history` - Include completed swarms

---

## 🌐 **MCP Server Management**

### **`mcp` - MCP Server Operations**

Manage Model Context Protocol servers for Claude integration.

```bash
claude-zen mcp <action> [options]
```

#### **MCP Actions**

#### **`mcp start` - Start MCP Server**
```bash
claude-zen mcp start [options]
```

**Options:**
- `--port <number>` - Server port (default: 3000)
- `--host <address>` - Server host (default: localhost)
- `--protocol <type>` - Protocol type: `http`, `stdio` (default: `http`)
- `--daemon` - Run as background daemon

**Examples:**
```bash
# Start HTTP MCP server for Claude Desktop
claude-zen mcp start

# Start on custom port
claude-zen mcp start --port 3001

# Start as daemon
claude-zen mcp start --daemon
```

#### **`mcp status` - MCP Server Status**
```bash
claude-zen mcp status
```

#### **`mcp stop` - Stop MCP Server**
```bash
claude-zen mcp stop
```

#### **`mcp tools` - List Available MCP Tools**
```bash
claude-zen mcp tools [options]
```

**Options:**
- `--category <name>` - Filter by category: `swarm`, `neural`, `system`, `memory`
- `--detailed` - Show tool descriptions and parameters

---

## 🖥️ **Web Dashboard**

### **`web` - Web Interface Management**

Manage the browser-based real-time dashboard.

```bash
claude-zen web <action> [options]
```

#### **Web Actions**

#### **`web start` - Start Web Dashboard**
```bash
claude-zen web start [options]
```

**Options:**
- `--port <number>` - Server port (default: 3456)
- `--host <address>` - Server host (default: 0.0.0.0)
- `--daemon` - Run as background daemon
- `--theme <type>` - UI theme: `dark`, `light` (default: `dark`)
- `--no-realtime` - Disable WebSocket real-time updates

**Examples:**
```bash
# Start web dashboard
claude-zen web start

# Start on custom port with light theme
claude-zen web start --port 4000 --theme light

# Start as daemon
claude-zen web start --daemon
```

#### **`web status` - Web Dashboard Status**
```bash
claude-zen web status
```

#### **`web stop` - Stop Web Dashboard**
```bash
claude-zen web stop
```

---

## 📋 **Workspace Management**

### **`workspace` - Document-Driven Development**

Manage document-driven development workflows.

```bash
claude-zen workspace <action> [options]
```

#### **Workspace Actions**

#### **`workspace init` - Initialize Workspace**
```bash
claude-zen workspace init <name> [options]
```

**Options:**
- `--template <type>` - Workspace template: `basic`, `advanced`, `research` (default: `advanced`)

#### **`workspace process` - Process Documents**
```bash
claude-zen workspace process <document-path> [options]
```

**Options:**
- `--output <path>` - Output directory for generated files
- `--format <type>` - Output format: `markdown`, `json`, `yaml`

**Examples:**
```bash
# Process vision document
claude-zen workspace process docs/01-vision/product-vision.md

# Process PRD with custom output
claude-zen workspace process docs/03-prds/user-auth.md --output generated/
```

#### **`workspace status` - Workspace Status**
```bash
claude-zen workspace status [options]
```

**Options:**
- `--progress` - Show document processing progress
- `--metrics` - Show productivity metrics

#### **`workspace implement` - Implement Features**
```bash
claude-zen workspace implement <feature-document> [options]
```

**Options:**
- `--swarm` - Use swarm coordination for implementation
- `--test` - Generate tests alongside implementation

---

## 🖼️ **Terminal UI**

### **`tui` - Terminal User Interface**

Launch interactive terminal interface for system management.

```bash
claude-zen tui [options]
```

**Options:**
- `--mode <type>` - Initial mode: `overview`, `swarm-manager`, `task-manager`, `system-monitor`
- `--theme <type>` - TUI theme: `dark`, `light`, `auto` (default: `auto`)

**Examples:**
```bash
# Launch TUI with overview
claude-zen tui

# Launch directly in swarm management mode
claude-zen tui --mode swarm-manager

# Launch with light theme
claude-zen tui --theme light
```

**TUI Features:**
- **Overview Dashboard** - System status and quick actions
- **Swarm Manager** - Visual swarm coordination and monitoring
- **Task Manager** - Interactive task creation and tracking
- **System Monitor** - Real-time performance monitoring
- **Command Palette** - Fuzzy search for all available actions

---

## 📝 **Document Creation**

### **`create` - Create Documents**

Create new documents following the document-driven development workflow.

```bash
claude-zen create <type> <title> [options]
```

**Document Types:**
- `vision` - Strategic vision document
- `adr` - Architecture Decision Record
- `prd` - Product Requirements Document
- `epic` - Epic-level feature set
- `feature` - Individual feature specification
- `task` - Implementation task
- `spec` - Technical specification

**Options:**
- `--template <name>` - Custom template to use
- `--author <name>` - Document author
- `--output <path>` - Custom output location

**Examples:**
```bash
# Create vision document
claude-zen create vision "AI-Powered Code Assistant"

# Create ADR with custom template
claude-zen create adr "Database Architecture Decision" --template enterprise

# Create feature specification
claude-zen create feature "User Authentication System"
```

---

## 🧪 **Task Management**

### **`task` - Task Operations**

Manage individual tasks and their execution.

```bash
claude-zen task <action> [options]
```

#### **Task Actions**

#### **`task create` - Create Task**
```bash
claude-zen task create <description> [options]
```

**Options:**
- `--priority <level>` - Task priority: `low`, `medium`, `high`, `critical` (default: `medium`)
- `--assignee <agent>` - Assign to specific agent or agent type
- `--deadline <date>` - Task deadline (ISO format)
- `--dependencies <tasks>` - Comma-separated list of dependency task IDs

**Examples:**
```bash
# Create basic task
claude-zen task create "Implement user authentication"

# Create high-priority task with deadline
claude-zen task create "Fix security vulnerability" --priority critical --deadline 2024-12-31

# Create task with dependencies
claude-zen task create "Deploy to production" --dependencies task-123,task-124
```

#### **`task list` - List Tasks**
```bash
claude-zen task list [options]
```

**Options:**
- `--status <type>` - Filter by status: `pending`, `active`, `completed`, `blocked`
- `--priority <level>` - Filter by priority
- `--assignee <agent>` - Filter by assignee
- `--limit <number>` - Limit number of results

#### **`task status` - Task Status**
```bash
claude-zen task status <task-id>
```

#### **`task complete` - Mark Task Complete**
```bash
claude-zen task complete <task-id> [options]
```

**Options:**
- `--notes <text>` - Completion notes
- `--artifacts <paths>` - Generated artifacts (files, reports)

---

## 🔧 **Configuration**

### **`config` - Configuration Management**

Manage system configuration and settings.

```bash
claude-zen config <action> [options]
```

#### **Configuration Actions**

#### **`config get` - Get Configuration**
```bash
claude-zen config get [key] [options]
```

**Examples:**
```bash
# Get all configuration
claude-zen config get

# Get specific setting
claude-zen config get swarm.defaultTopology
```

#### **`config set` - Set Configuration**
```bash
claude-zen config set <key> <value> [options]
```

**Options:**
- `--global` - Set global configuration
- `--project` - Set project-specific configuration

**Examples:**
```bash
# Set default swarm topology
claude-zen config set swarm.defaultTopology hierarchical

# Set web dashboard theme
claude-zen config set web.theme light
```

#### **`config reset` - Reset Configuration**
```bash
claude-zen config reset [key] [options]
```

---

## 📊 **Monitoring and Logs**

### **`logs` - View System Logs**

Display system logs and debug information.

```bash
claude-zen logs [options]
```

**Options:**
- `--component <name>` - Filter by component: `mcp`, `swarm`, `web`, `neural`
- `--level <type>` - Log level: `debug`, `info`, `warn`, `error`
- `--tail <number>` - Show last N lines (default: 50)
- `--follow, -f` - Follow log output (like `tail -f`)
- `--since <time>` - Show logs since timestamp

**Examples:**
```bash
# View recent logs
claude-zen logs

# Follow swarm logs
claude-zen logs --component swarm --follow

# View error logs from last hour
claude-zen logs --level error --since "1 hour ago"
```

### **`metrics` - Performance Metrics**

Display system performance metrics and analytics.

```bash
claude-zen metrics [options]
```

**Options:**
- `--component <name>` - Specific component metrics
- `--timeframe <period>` - Time period: `1h`, `6h`, `24h`, `7d` (default: `1h`)
- `--export <format>` - Export metrics: `json`, `csv`

---

## 🆘 **Help and Debugging**

### **`help` - Get Help**

Display help information for commands.

```bash
claude-zen help [command]
```

**Examples:**
```bash
# General help
claude-zen help

# Specific command help
claude-zen help swarm
claude-zen help workspace process
```

### **`doctor` - System Diagnostics**

Run comprehensive system diagnostics and health checks.

```bash
claude-zen doctor [options]
```

**Options:**
- `--fix` - Attempt to fix detected issues automatically
- `--verbose` - Show detailed diagnostic information

**Checks Include:**
- Node.js and npm version compatibility
- Required dependencies installation
- Configuration file validity
- Network connectivity for MCP services
- File system permissions
- Port availability

---

## 📚 **Environment Variables**

### **Configuration via Environment**

Claude Code Flow can be configured using environment variables:

```bash
# MCP server configuration
export CLAUDE_ZEN_MCP_PORT=3000
export CLAUDE_ZEN_MCP_HOST=localhost

# Web dashboard configuration
export CLAUDE_ZEN_WEB_PORT=3456
export CLAUDE_ZEN_WEB_THEME=dark

# Swarm configuration
export CLAUDE_ZEN_SWARM_MAX_AGENTS=20
export CLAUDE_ZEN_SWARM_DEFAULT_TOPOLOGY=mesh

# Logging configuration
export CLAUDE_ZEN_LOG_LEVEL=info
export CLAUDE_ZEN_DEBUG=false
```

---

## 🔗 **Exit Codes**

Claude Code Flow uses standard exit codes for automation and scripting:

- `0` - Success
- `1` - General error
- `2` - Misuse of shell command
- `3` - Configuration error
- `4` - Network/connectivity error
- `5` - Insufficient permissions
- `6` - Resource unavailable (port in use, etc.)
- `7` - Timeout error

---

## 💡 **Tips and Best Practices**

### **Command Chaining**
```bash
# Initialize project and start services
claude-zen init my-project --template advanced && \
cd my-project && \
claude-zen mcp start --daemon && \
claude-zen web start --daemon && \
claude-zen swarm init --topology mesh
```

### **JSON Output for Automation**
```bash
# Get status in JSON for scripts
STATUS=$(claude-zen status --format json)
AGENT_COUNT=$(echo $STATUS | jq '.swarm.agents')
```

### **Background Operations**
```bash
# Start services in background
claude-zen mcp start --daemon
claude-zen web start --daemon

# Check if running
ps aux | grep claude-zen
```

### **Monitoring and Alerting**
```bash
# Continuous monitoring with alerts
claude-zen status --watch | grep -E "(ERROR|CRITICAL)" | mail -s "Claude-Zen Alert" admin@example.com
```

---

**For more detailed information, see the [User Guide](user-guide.md) and [API Reference](api/README.md).**