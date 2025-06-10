# 🧠 Claude-Flow: Advanced AI Agent Orchestration System for Claude Code

[![CI](https://github.com/ruvnet/claude-code-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/ruvnet/claude-code-flow/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](./test-results/coverage-html/index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deno](https://img.shields.io/badge/deno-v1.40+-blue)](https://deno.land/)
[![NPM](https://img.shields.io/npm/v/claude-flow)](https://www.npmjs.com/package/claude-flow)

> **A sophisticated multi-agent orchestration system built with Deno and TypeScript, featuring advanced coordination, memory management, and terminal integration with 100% test coverage.**

## Features

- **Multi-Agent Orchestration**: Spawn and manage multiple Claude agents with different roles and capabilities
- **Task Scheduling**: Advanced task queue with priority-based scheduling and dependency management
- **Memory Management**: Persistent memory storage with hybrid SQLite/Markdown backends
- **Terminal Management**: Efficient terminal pooling and session management
- **Resource Coordination**: Deadlock detection and prevention for shared resources
- **MCP Support**: Model Context Protocol server for tool integration
- **Interactive CLI**: Rich command-line interface with REPL mode

## Installation

### Using NPM (recommended)

```bash
npx claude-flow
```

Or install globally:

```bash
npm install -g claude-flow
```

### Using Deno

```bash
deno install --allow-all --name claude-flow https://raw.githubusercontent.com/ruvnet/claude-code-flow/main/src/cli/index.ts
```

### From Source

```bash
git clone https://github.com/ruvnet/claude-code-flow.git
cd claude-flow
deno task install
```

## Quick Start

1. **Initialize configuration**:
   ```bash
   claude-flow config init
   ```

2. **Start the orchestrator**:
   ```bash
   claude-flow start
   ```

3. **Spawn an agent**:
   ```bash
   claude-flow agent spawn researcher --name "Research Assistant"
   ```

4. **Create a task**:
   ```bash
   claude-flow task create research "Find information about quantum computing"
   ```

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

## CLI Commands

### Global Options
- `-c, --config <path>`: Path to configuration file
- `-v, --verbose`: Enable verbose logging
- `--log-level <level>`: Set log level (debug, info, warn, error)

### Commands

#### `start`
Start the Claude-Flow orchestration system
```bash
claude-flow start [options]
  -d, --daemon              Run as daemon in background
  -p, --port <port>         MCP server port
  --mcp-transport <type>    MCP transport type (stdio, http)
```

#### `agent`
Manage agents
```bash
claude-flow agent <subcommand>
  spawn <type>              Spawn a new agent
  list                      List all agents
  terminate <agent-id>      Terminate an agent
  info <agent-id>          Get agent information
```

#### `task`
Manage tasks
```bash
claude-flow task <subcommand>
  create <type> <desc>      Create a new task
  list                      List all tasks
  status <task-id>          Get task status
  cancel <task-id>          Cancel a task
  workflow <file>           Execute workflow from file
```

#### `memory`
Manage agent memory
```bash
claude-flow memory <subcommand>
  query                     Query memory entries
  export <file>             Export memory to file
  import <file>             Import memory from file
  stats                     Show memory statistics
  cleanup                   Clean up old entries
```

#### `config`
Manage configuration
```bash
claude-flow config <subcommand>
  show                      Show current configuration
  get <path>                Get specific config value
  set <path> <value>        Set config value
  init [file]               Initialize config file
  validate <file>           Validate config file
```

#### `repl`
Start interactive REPL mode
```bash
claude-flow repl
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
- Deno 1.38+ or Node.js 16+
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

## Support

- Documentation: [https://claude-flow.dev/docs](https://claude-flow.dev/docs)
- Issues: [GitHub Issues](https://github.com/ruvnet/claude-code-flow/issues)
- Discussions: [GitHub Discussions](https://github.com/ruvnet/claude-code-flow/discussions)

## Roadmap

- [ ] Web UI for visual orchestration
- [ ] Plugin system for custom agent types
- [ ] Distributed orchestration support
- [ ] Enhanced monitoring and analytics
- [ ] Integration with more AI models
- [ ] Workflow templates library

---

Built with ❤️ by [rUv](https://github.com/ruvnet) for the Claude community
