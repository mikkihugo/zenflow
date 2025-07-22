# Getting Started with Claude Zen

Welcome to Claude Zen, an advanced AI agent orchestration system designed for sophisticated multi-agent collaboration, task coordination, and memory management. This guide will help you get up and running quickly.

## Quick Installation

### Option 1: NPX (Recommended for First-Time Users)
```bash
# Run directly without installation
npx claude-zen

# Or install globally for persistent use
npm install -g claude-zen
claude-zen --version
```

### Option 2: Deno Installation
```bash
# Install with Deno
deno install --allow-all --name claude-zen https://raw.githubusercontent.com/ruvnet/claude-code-flow/main/src/cli/index.ts

# Verify installation
claude-zen --help
```

### Option 3: From Source
```bash
# Clone the repository
git clone https://github.com/ruvnet/claude-code-flow.git
cd claude-code-flow

# Install dependencies and build
deno task install

# Run from source
deno task dev
```

## Initial Setup

### 1. Initialize Configuration
```bash
# Create default configuration file
claude-zen config init

# Verify configuration
claude-zen config show
```

### 2. Start the Orchestrator
```bash
# Basic start
claude-zen start

# Start with daemon mode for background operation
claude-zen start --daemon

# Start with custom port
claude-zen start --port 3000
```

### 3. Verify System Health
```bash
# Check system status
claude-zen agent list
claude-zen memory stats
claude-zen mcp status
```

## Your First Workflow

Let's create a simple research workflow to demonstrate Claude-Flow's capabilities:

### Step 1: Spawn a Research Agent
```bash
# Create a research agent
claude-zen agent spawn researcher --name "Research Assistant"

# Verify agent is active
claude-zen agent list
```

### Step 2: Create a Research Task
```bash
# Create a research task
claude-zen task create research "Analyze current trends in AI development tools" \
  --priority high \
  --estimated-duration 2h

# Check task status
claude-zen task list
```

### Step 3: Monitor Progress
```bash
# Monitor task execution
claude-zen task monitor --follow

# Check agent activity
claude-zen agent info <agent-id>
```

### Step 4: Review Results
```bash
# Query memory for research findings
claude-zen memory query --filter "AI development tools" --recent

# Export findings
claude-zen memory export --filter "research-results" --output research-findings.json
```

## Interactive Exploration

For learning and experimentation, use the interactive REPL mode:

```bash
# Start interactive session
claude-zen repl
```

In REPL mode, you can:
```bash
# Get help
> help

# Spawn agents interactively
> agent spawn coordinator --name "Project Manager"

# Create tasks
> task create analysis "Evaluate system performance"

# Query memory
> memory query --recent --limit 5

# Exit REPL
> exit
```

## Basic Concepts

### Agents
Agents are specialized AI workers with specific capabilities:
- **Researcher**: Information gathering and analysis
- **Implementer**: Code development and technical tasks
- **Analyst**: Data analysis and pattern recognition
- **Coordinator**: Planning and task delegation

### Tasks
Tasks represent work to be done:
- **Research**: Information gathering
- **Implementation**: Code development
- **Analysis**: Data processing
- **Coordination**: Planning and management

### Memory Bank
The memory system stores:
- Agent discoveries and insights
- Task progress and results
- Shared knowledge across agents
- Project history and context

### MCP Integration
Model Context Protocol enables:
- External tool integration
- API connectivity
- Custom tool development
- Secure tool execution

## Common Commands Reference

### Agent Management
```bash
# List all agents
claude-zen agent list

# Get detailed agent info
claude-zen agent info <agent-id>

# Terminate an agent
claude-zen agent terminate <agent-id>
```

### Task Management
```bash
# List all tasks
claude-zen task list

# Check task status
claude-zen task status <task-id>

# Cancel a task
claude-zen task cancel <task-id>
```

### Memory Operations
```bash
# Search memory
claude-zen memory query --search "keyword"

# View memory stats
claude-zen memory stats

# Clean up old entries
claude-zen memory cleanup --older-than 30d
```

### Configuration
```bash
# View current config
claude-zen config show

# Update settings
claude-zen config set orchestrator.maxConcurrentAgents 15

# Reset to defaults
claude-zen config init --force
```

## Next Steps

1. **Explore the Architecture**: Read [02-architecture-overview.md](./02-architecture-overview.md) to understand how Claude-Flow works
2. **Configure Your System**: See [03-configuration-guide.md](./03-configuration-guide.md) for detailed configuration options
3. **Learn Agent Management**: Check [04-agent-management.md](./04-agent-management.md) for advanced agent patterns
4. **Create Complex Workflows**: Study [05-task-coordination.md](./05-task-coordination.md) for workflow orchestration

## Getting Help

- Use `claude-zen help` for command-line help
- Join our [Discord community](https://discord.gg/claude-zen)
- Check [GitHub Issues](https://github.com/ruvnet/claude-code-flow/issues)
- Review the [full documentation](https://claude-zen.dev/docs)

## Troubleshooting Common Issues

### Installation Problems
If you encounter permission issues:
```bash
# For NPM
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# For Deno
export PATH="$HOME/.deno/bin:$PATH"
```

### Configuration Issues
If configuration fails to initialize:
```bash
# Check directory permissions
ls -la $(pwd)

# Manually create config
touch claude-zen.config.json
claude-zen config init --force
```

### Agent Startup Issues
If agents fail to start:
```bash
# Check system resources
claude-zen system resources

# Increase limits
claude-zen config set orchestrator.maxConcurrentAgents 5

# Check logs
claude-zen logs --level debug
```

You're now ready to start using Claude-Flow! Continue to the next sections for more advanced features and configuration options.