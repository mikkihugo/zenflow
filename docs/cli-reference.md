# CLI Reference

Complete reference for all Claude Zen command-line interface commands, options, and usage patterns.

## Global Options

These options can be used with any command:

```bash
claude-zen [global-options] <command> [command-options]
```

### Global Flags

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config <path>` | `-c` | Path to configuration file | `./claude-zen.config.json` |
| `--verbose` | `-v` | Enable verbose logging | `false` |
| `--quiet` | `-q` | Suppress non-essential output | `false` |
| `--log-level <level>` | | Set log level (debug, info, warn, error) | `info` |
| `--no-color` | | Disable colored output | `false` |
| `--json` | | Output in JSON format where applicable | `false` |
| `--profile <name>` | | Use named configuration profile | |
| `--help` | `-h` | Show help information | |
| `--version` | `-V` | Show version information | |

### Examples

```bash
# Use custom config with verbose output
claude-zen --config ./my-config.json --verbose agent list

# JSON output with debug logging
claude-zen --json --log-level debug task list

# Quiet mode for scripts
claude-zen --quiet --no-color start --daemon
```

## Core Commands

### `start` - Start Orchestrator

Start the Claude-Flow orchestration system.

```bash
claude-zen start [options]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--daemon`, `-d` | Run as daemon in background | `false` |
| `--port <port>`, `-p` | MCP server port | `3000` |
| `--mcp-transport <type>` | MCP transport (stdio, http, websocket) | `stdio` |
| `--workers <count>` | Number of worker processes | `auto` |
| `--memory-limit <mb>` | Memory limit in MB | `512` |
| `--health-check-port <port>` | Health check HTTP port | `8080` |
| `--pid-file <path>` | Write process ID to file | |
| `--log-file <path>` | Log file path (daemon mode) | |

#### Examples

```bash
# Start with default settings
claude-zen start

# Start as daemon with custom port
claude-zen start --daemon --port 3001

# Start with HTTP MCP transport
claude-zen start --mcp-transport http --port 8000

# Start with custom worker count
claude-zen start --workers 4 --memory-limit 1024
```

#### Output

```
🧠 Claude-Flow v1.0.0 - Advanced AI Agent Orchestration System

✅ Configuration loaded: ./claude-zen.config.json
✅ Memory system initialized (SQLite backend)
✅ Terminal pool created (3 terminals)
✅ MCP server started on stdio transport
✅ Health check server listening on :8080
✅ Orchestrator ready - PID: 12345

Press Ctrl+C to stop
```

---

### `agent` - Agent Management

Manage AI agents in the system.

```bash
claude-zen agent <subcommand> [options]
```

#### Subcommands

#### `spawn` - Create New Agent

```bash
claude-zen agent spawn <type> [options]
```

**Agent Types:**
- `researcher` - Research and information gathering
- `analyst` - Data analysis and pattern recognition  
- `implementer` - Code writing and implementation
- `coordinator` - Task coordination and management
- `custom` - User-defined agent type

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--name <name>` | Human-readable agent name | Auto-generated |
| `--description <desc>` | Agent description | |
| `--config <json>` | Agent-specific configuration | `{}` |
| `--capabilities <list>` | Comma-separated capability list | Type defaults |
| `--memory-namespace <ns>` | Memory namespace for isolation | `default` |
| `--max-tasks <count>` | Maximum concurrent tasks | `5` |
| `--timeout <ms>` | Default task timeout in milliseconds | `300000` |
| `--auto-assign` | Enable automatic task assignment | `false` |
| `--tags <list>` | Comma-separated tags | |

**Examples:**

```bash
# Basic researcher agent
claude-zen agent spawn researcher --name "Research Bot"

# Advanced analyst with custom config
claude-zen agent spawn analyst \
  --name "Data Analyst" \
  --description "Specializes in statistical analysis" \
  --capabilities "statistics,visualization,reporting" \
  --memory-namespace "analytics" \
  --max-tasks 3

# Custom agent with JSON config
claude-zen agent spawn custom \
  --name "Special Agent" \
  --config '{"model":"claude-3-opus","temperature":0.7}'
```

#### `list` - List Agents

```bash
claude-zen agent list [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--status <status>` | Filter by status (active, idle, busy, terminated) |
| `--type <type>` | Filter by agent type |
| `--namespace <ns>` | Filter by memory namespace |
| `--sort <field>` | Sort by field (name, created, type, status) |
| `--format <fmt>` | Output format (table, json, csv) |
| `--limit <count>` | Limit number of results |

**Examples:**

```bash
# List all agents
claude-zen agent list

# List only active researchers
claude-zen agent list --status active --type researcher

# JSON output sorted by creation time
claude-zen agent list --format json --sort created
```

#### `info` - Agent Information

```bash
claude-zen agent info <agent-id> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--detailed` | Show detailed information |
| `--stats` | Include performance statistics |
| `--memory` | Include memory usage |
| `--tasks` | Include current tasks |

**Example:**

```bash
claude-zen agent info agent_1704123456789_researcher --detailed --stats
```

#### `terminate` - Stop Agent

```bash
claude-zen agent terminate <agent-id> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--force` | Force termination without cleanup |
| `--reason <text>` | Termination reason |
| `--preserve-memory` | Keep agent memory after termination |

**Example:**

```bash
claude-zen agent terminate agent_123 --reason "Task completed"
```

#### `update` - Update Agent

```bash
claude-zen agent update <agent-id> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--name <name>` | Update agent name |
| `--description <desc>` | Update description |
| `--config <json>` | Update configuration |
| `--capabilities <list>` | Update capabilities |
| `--max-tasks <count>` | Update task limit |

---

### `task` - Task Management

Manage tasks and workflows.

```bash
claude-zen task <subcommand> [options]
```

#### `create` - Create Task

```bash
claude-zen task create <type> <description> [options]
```

**Task Types:**
- `research` - Information gathering and research
- `analysis` - Data analysis and insights
- `implementation` - Code writing and development
- `review` - Code or content review
- `testing` - Testing and validation
- `documentation` - Writing documentation
- `coordination` - Project coordination
- `custom` - User-defined task type

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--assign-to <agent-id>` | Assign to specific agent | Auto-assign |
| `--priority <level>` | Priority (low, normal, high, urgent) | `normal` |
| `--deadline <datetime>` | Task deadline (ISO 8601) | |
| `--dependencies <list>` | Comma-separated task dependencies | |
| `--timeout <ms>` | Task timeout in milliseconds | `300000` |
| `--retry-count <count>` | Maximum retry attempts | `3` |
| `--tags <list>` | Comma-separated tags | |
| `--metadata <json>` | Additional metadata as JSON | `{}` |
| `--input-file <path>` | Input file for task | |
| `--output-dir <path>` | Output directory | |
| `--parallel` | Allow parallel execution | `false` |

**Examples:**

```bash
# Simple research task
claude-zen task create research "Research quantum computing trends"

# High-priority analysis with deadline
claude-zen task create analysis "Analyze user behavior data" \
  --priority high \
  --deadline "2024-01-15T17:00:00Z" \
  --assign-to agent_123

# Implementation task with dependencies
claude-zen task create implementation "Implement user authentication" \
  --dependencies "task_1,task_2" \
  --timeout 600000 \
  --tags "backend,auth,security"
```

#### `list` - List Tasks

```bash
claude-zen task list [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--status <status>` | Filter by status (pending, running, completed, failed, cancelled) |
| `--type <type>` | Filter by task type |
| `--agent <agent-id>` | Filter by assigned agent |
| `--priority <level>` | Filter by priority |
| `--tags <list>` | Filter by tags |
| `--since <datetime>` | Tasks created since date |
| `--until <datetime>` | Tasks created until date |
| `--sort <field>` | Sort by field (created, priority, deadline, status) |
| `--format <fmt>` | Output format (table, json, csv) |
| `--limit <count>` | Limit results |

#### `status` - Task Status

```bash
claude-zen task status <task-id> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--watch` | Watch for status changes |
| `--detailed` | Show detailed information |
| `--logs` | Include execution logs |
| `--output` | Show task output |

#### `cancel` - Cancel Task

```bash
claude-zen task cancel <task-id> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--reason <text>` | Cancellation reason |
| `--force` | Force cancellation |

#### `retry` - Retry Failed Task

```bash
claude-zen task retry <task-id> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--reset-retries` | Reset retry counter |
| `--new-agent` | Assign to different agent |

---

### `memory` - Memory Management

Manage agent memory and knowledge base.

```bash
claude-zen memory <subcommand> [options]
```

#### `query` - Query Memory

```bash
claude-zen memory query [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--category <cat>` | Filter by category |
| `--namespace <ns>` | Filter by namespace |
| `--tags <list>` | Filter by tags |
| `--content <text>` | Search content |
| `--agent <agent-id>` | Filter by agent |
| `--since <datetime>` | Items since date |
| `--until <datetime>` | Items until date |
| `--limit <count>` | Limit results |
| `--format <fmt>` | Output format (table, json, markdown) |
| `--vector-search <text>` | Semantic vector search |
| `--similarity <threshold>` | Similarity threshold (0-1) |

**Examples:**

```bash
# Query by category
claude-zen memory query --category research --limit 10

# Semantic search
claude-zen memory query --vector-search "machine learning algorithms"

# Complex query with filters
claude-zen memory query \
  --category analysis \
  --tags "data,statistics" \
  --since "2024-01-01" \
  --format json
```

#### `stats` - Memory Statistics

```bash
claude-zen memory stats [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--detailed` | Show detailed statistics |
| `--by-agent` | Group by agent |
| `--by-category` | Group by category |
| `--by-namespace` | Group by namespace |

#### `export` - Export Memory

```bash
claude-zen memory export <file> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--format <fmt>` | Export format (json, markdown, csv) |
| `--category <cat>` | Export specific category |
| `--namespace <ns>` | Export specific namespace |
| `--compress` | Compress output file |
| `--include-vectors` | Include vector embeddings |

#### `import` - Import Memory

```bash
claude-zen memory import <file> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--format <fmt>` | Import format (json, markdown, csv) |
| `--namespace <ns>` | Target namespace |
| `--merge` | Merge with existing data |
| `--validate` | Validate before import |

#### `cleanup` - Clean Memory

```bash
claude-zen memory cleanup [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--older-than <days>` | Remove items older than N days |
| `--category <cat>` | Clean specific category |
| `--dry-run` | Show what would be removed |
| `--vacuum` | Optimize database |

---

### `config` - Configuration Management

Manage system configuration.

```bash
claude-zen config <subcommand> [options]
```

#### `init` - Initialize Configuration

```bash
claude-zen config init [file] [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--template <name>` | Use configuration template |
| `--force` | Overwrite existing file |
| `--minimal` | Create minimal configuration |

#### `show` - Show Configuration

```bash
claude-zen config show [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--format <fmt>` | Output format (json, yaml, table) |
| `--section <name>` | Show specific section |

#### `get` - Get Config Value

```bash
claude-zen config get <path> [options]
```

**Examples:**

```bash
claude-zen config get orchestrator.maxConcurrentAgents
claude-zen config get memory.backend
```

#### `set` - Set Config Value

```bash
claude-zen config set <path> <value> [options]
```

**Examples:**

```bash
claude-zen config set orchestrator.maxConcurrentAgents 10
claude-zen config set memory.cacheSizeMB 200
```

#### `validate` - Validate Configuration

```bash
claude-zen config validate [file] [options]
```

---

### `workflow` - Workflow Management

Manage complex multi-task workflows.

```bash
claude-zen workflow <subcommand> [options]
```

#### `execute` - Execute Workflow

```bash
claude-zen workflow execute <file> [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--validate` | Validate workflow before execution |
| `--dry-run` | Show execution plan without running |
| `--timeout <ms>` | Overall workflow timeout |
| `--parallel` | Enable parallel task execution |
| `--continue-on-error` | Continue workflow on task failure |

#### `status` - Workflow Status

```bash
claude-zen workflow status <workflow-id> [options]
```

#### `list` - List Workflows

```bash
claude-zen workflow list [options]
```

#### `template` - Workflow Templates

```bash
claude-zen workflow template <subcommand>
```

**Subcommands:**
- `list` - List available templates
- `create <name>` - Create new template
- `apply <name>` - Apply template to create workflow

---

### `status` - System Status

Show system status and health information.

```bash
claude-zen status [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--detailed` | Show detailed status |
| `--watch` | Watch for changes |
| `--format <fmt>` | Output format (table, json) |
| `--health-check` | Run full health check |

---

### `monitor` - Live Monitoring Dashboard

Start the real-time monitoring dashboard to track system performance and activity.

```bash
claude-zen monitor [options]
```

**Options:**

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--interval` | `-i` | Update interval in seconds | `2` |
| `--compact` | `-c` | Compact view mode (hide lists) | `false` |
| `--focus` | `-f` | Focus on specific component | |

**Examples:**

```bash
# Start monitor with default settings
claude-zen monitor

# Monitor with 5-second updates
claude-zen monitor --interval 5

# Compact mode for smaller screens
claude-zen monitor --compact

# Focus on specific component
claude-zen monitor --focus orchestrator
```

---

### `claude` - Spawn Claude Instances

Spawn and manage Claude Code instances with specific configurations, similar to claude-sparc.sh but integrated into the orchestration system.

```bash
claude-zen claude <subcommand> [options]
```

#### `spawn` - Spawn Single Claude Instance

```bash
claude-zen claude spawn <task> [options]
```

**Options:**

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--tools` | `-t` | Comma-separated list of allowed tools | `View,Edit,Replace,GlobTool,GrepTool,LS,Bash` |
| `--no-permissions` | | Use --dangerously-skip-permissions flag | `false` |
| `--config` | `-c` | MCP config file path | |
| `--mode` | `-m` | Development mode (full/backend-only/frontend-only/api-only) | `full` |
| `--parallel` | | Enable parallel execution with BatchTool | `false` |
| `--research` | | Enable web research with WebFetchTool | `false` |
| `--coverage` | | Test coverage target percentage | `80` |
| `--commit` | | Commit frequency (phase/feature/manual) | `phase` |
| `--verbose` | `-v` | Enable verbose output | `false` |
| `--dry-run` | `-d` | Show what would be executed without running | `false` |

**Examples:**

```bash
# Basic task
claude-zen claude spawn "implement user authentication"

# Research task
claude-zen claude spawn "research microservices patterns" --research --parallel

# Backend development
claude-zen claude spawn "create REST API" --mode backend-only --coverage 90

# Frontend with no permissions
claude-zen claude spawn "build dashboard" --mode frontend-only --no-permissions

# Dry run
claude-zen claude spawn "refactor code" --dry-run
```

#### `batch` - Execute Workflow File

```bash
claude-zen claude batch <workflow-file> [options]
```

Execute multiple Claude instances from a JSON workflow file.

**Workflow Format:**

```json
{
  "name": "Workflow Name",
  "parallel": true,
  "tasks": [{
    "id": "task-1",
    "description": "Task description",
    "tools": ["View", "Edit"],
    "skipPermissions": true
  }]
}
```

**Example:**

```bash
# Execute workflow
claude-zen claude batch workflow.json

# Dry run
claude-zen claude batch workflow.json --dry-run
```

---

### `session` - Session Management

Manage terminal sessions and REPL.

```bash
claude-zen session <subcommand> [options]
```

#### `list` - List Sessions

```bash
claude-zen session list
```

#### `attach` - Attach to Session

```bash
claude-zen session attach <session-id>
```

#### `terminate` - Terminate Session

```bash
claude-zen session terminate <session-id>
```

---

### `repl` - Interactive Mode

Start interactive REPL mode.

```bash
claude-zen repl [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--no-banner` | Skip welcome banner |
| `--history-file <path>` | Custom history file |
| `--auto-complete` | Enable command auto-completion |

**REPL Commands:**

In REPL mode, you can use any command without the `claude-zen` prefix:

```
claude-zen> agent list
claude-zen> task create research "AI trends"
claude-zen> memory query --category research
claude-zen> help agent
claude-zen> exit
```

## Environment Variables

Claude-Flow recognizes these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_FLOW_CONFIG` | Default configuration file path | `./claude-zen.config.json` |
| `CLAUDE_FLOW_LOG_LEVEL` | Default log level | `info` |
| `CLAUDE_FLOW_NO_COLOR` | Disable colored output | `false` |
| `CLAUDE_FLOW_DEBUG` | Enable debug mode | `false` |
| `CLAUDE_FLOW_HOME` | Application home directory | `~/.claude-zen` |
| `CLAUDE_FLOW_CACHE_DIR` | Cache directory | `$CLAUDE_FLOW_HOME/cache` |
| `CLAUDE_FLOW_DATA_DIR` | Data directory | `$CLAUDE_FLOW_HOME/data` |

## Exit Codes

Claude-Flow uses standard exit codes:

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Configuration error |
| `3` | Connection error |
| `4` | Permission error |
| `5` | Resource not found |
| `6` | Timeout error |
| `130` | Interrupted by user (Ctrl+C) |

## Shell Completion

Generate shell completion scripts:

```bash
# Bash
claude-zen completion bash > /usr/local/etc/bash_completion.d/claude-zen

# Zsh
claude-zen completion zsh > /usr/local/share/zsh/site-functions/_claude-zen

# Fish
claude-zen completion fish > ~/.config/fish/completions/claude-zen.fish

# PowerShell
claude-zen completion powershell > $PROFILE
```

Or install automatically:

```bash
claude-zen completion --install
```

## Tips and Best Practices

### Command Aliases

Create helpful aliases:

```bash
alias cf='claude-zen'
alias cfs='claude-zen status'
alias cfa='claude-zen agent'
alias cft='claude-zen task'
alias cfm='claude-zen memory'
```

### Script Integration

For use in scripts:

```bash
#!/bin/bash
set -e

# Use quiet mode and JSON output
claude-zen --quiet --json agent list > agents.json

# Check exit code
if claude-zen --quiet task status $TASK_ID; then
    echo "Task completed successfully"
else
    echo "Task failed"
    exit 1
fi
```

### Configuration Management

Use different configs for different environments:

```bash
# Development
claude-zen --config dev.config.json start

# Production
claude-zen --config prod.config.json start --daemon

# Testing
claude-zen --config test.config.json task create test "Run tests"
```

### Performance Tips

- Use `--json` for script parsing
- Use `--quiet` to reduce output overhead
- Set appropriate `--limit` values for large datasets
- Use `--watch` sparingly to avoid resource usage
- Consider `--parallel` for workflow execution

This completes the comprehensive CLI reference for Claude-Flow. Each command includes detailed options, examples, and best practices for effective usage.