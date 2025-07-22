---
name: claude-zen-help
description: Show Claude-Flow commands and usage
---

# Claude-Flow Commands

## 🌊 Claude-Flow: Agent Orchestration Platform

Claude-Flow is the ultimate multi-terminal orchestration platform that revolutionizes how you work with Claude Code.

## Core Commands

### 🚀 System Management
- `./claude-zen start` - Start orchestration system
- `./claude-zen start --ui` - Start with interactive process management UI
- `./claude-zen status` - Check system status
- `./claude-zen monitor` - Real-time monitoring
- `./claude-zen stop` - Stop orchestration

### 🤖 Agent Management
- `./claude-zen agent spawn <type>` - Create new agent
- `./claude-zen agent list` - List active agents
- `./claude-zen agent info <id>` - Agent details
- `./claude-zen agent terminate <id>` - Stop agent

### 📋 Task Management
- `./claude-zen task create <type> "description"` - Create task
- `./claude-zen task list` - List all tasks
- `./claude-zen task status <id>` - Task status
- `./claude-zen task cancel <id>` - Cancel task
- `./claude-zen task workflow <file>` - Execute workflow

### 🧠 Memory Operations
- `./claude-zen memory store "key" "value"` - Store data
- `./claude-zen memory query "search"` - Search memory
- `./claude-zen memory stats` - Memory statistics
- `./claude-zen memory export <file>` - Export memory
- `./claude-zen memory import <file>` - Import memory

### ⚡ SPARC Development
- `./claude-zen sparc "task"` - Run SPARC orchestrator
- `./claude-zen sparc modes` - List all 17+ SPARC modes
- `./claude-zen sparc run <mode> "task"` - Run specific mode
- `./claude-zen sparc tdd "feature"` - TDD workflow
- `./claude-zen sparc info <mode>` - Mode details

### 🐝 Swarm Coordination
- `./claude-zen swarm "task" --strategy <type>` - Start swarm
- `./claude-zen swarm "task" --background` - Long-running swarm
- `./claude-zen swarm "task" --monitor` - With monitoring
- `./claude-zen swarm "task" --ui` - Interactive UI
- `./claude-zen swarm "task" --distributed` - Distributed coordination

### 🌍 MCP Integration
- `./claude-zen mcp status` - MCP server status
- `./claude-zen mcp tools` - List available tools
- `./claude-zen mcp config` - Show configuration
- `./claude-zen mcp logs` - View MCP logs

### 🤖 Claude Integration
- `./claude-zen claude spawn "task"` - Spawn Claude with enhanced guidance
- `./claude-zen claude batch <file>` - Execute workflow configuration

## 🌟 Quick Examples

### Initialize with SPARC:
```bash
npx -y claude-zen@latest init --sparc
```

### Start a development swarm:
```bash
./claude-zen swarm "Build REST API" --strategy development --monitor --review
```

### Run TDD workflow:
```bash
./claude-zen sparc tdd "user authentication"
```

### Store project context:
```bash
./claude-zen memory store "project_requirements" "e-commerce platform specs" --namespace project
```

### Spawn specialized agents:
```bash
./claude-zen agent spawn researcher --name "Senior Researcher" --priority 8
./claude-zen agent spawn developer --name "Lead Developer" --priority 9
```

## 🎯 Best Practices
- Use `./claude-zen` instead of `npx claude-zen` after initialization
- Store important context in memory for cross-session persistence
- Use swarm mode for complex tasks requiring multiple agents
- Enable monitoring for real-time progress tracking
- Use background mode for tasks > 30 minutes

## 📚 Resources
- Documentation: https://github.com/ruvnet/claude-code-flow/docs
- Examples: https://github.com/ruvnet/claude-code-flow/examples
- Issues: https://github.com/ruvnet/claude-code-flow/issues
