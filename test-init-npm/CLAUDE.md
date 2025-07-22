# Claude Code Configuration

## Build Commands
- `npm run build`: Build the project
- `npm run test`: Run the full test suite
- `npm run lint`: Run ESLint and format checks
- `npm run typecheck`: Run TypeScript type checking
- `./claude-zen --help`: Show all available commands

## Claude-Flow Complete Command Reference

### Core System Commands
- `./claude-zen start [--ui] [--port 3000] [--host localhost]`: Start orchestration system with optional web UI
- `./claude-zen status`: Show comprehensive system status
- `./claude-zen monitor`: Real-time system monitoring dashboard
- `./claude-zen config <subcommand>`: Configuration management (show, get, set, init, validate)

### Agent Management
- `./claude-zen agent spawn <type> [--name <name>]`: Create AI agents (researcher, coder, analyst, etc.)
- `./claude-zen agent list`: List all active agents
- `./claude-zen spawn <type>`: Quick agent spawning (alias for agent spawn)

### Task Orchestration
- `./claude-zen task create <type> [description]`: Create and manage tasks
- `./claude-zen task list`: View active task queue
- `./claude-zen workflow <file>`: Execute workflow automation files

### Memory Management
- `./claude-zen memory store <key> <data>`: Store persistent data across sessions
- `./claude-zen memory get <key>`: Retrieve stored information
- `./claude-zen memory list`: List all memory keys
- `./claude-zen memory export <file>`: Export memory to file
- `./claude-zen memory import <file>`: Import memory from file
- `./claude-zen memory stats`: Memory usage statistics
- `./claude-zen memory cleanup`: Clean unused memory entries

### SPARC Development Modes
- `./claude-zen sparc "<task>"`: Run orchestrator mode (default)
- `./claude-zen sparc run <mode> "<task>"`: Run specific SPARC mode
- `./claude-zen sparc tdd "<feature>"`: Test-driven development mode
- `./claude-zen sparc modes`: List all 17 available SPARC modes

Available SPARC modes: orchestrator, coder, researcher, tdd, architect, reviewer, debugger, tester, analyzer, optimizer, documenter, designer, innovator, swarm-coordinator, memory-manager, batch-executor, workflow-manager

### Swarm Coordination
- `./claude-zen swarm "<objective>" [options]`: Multi-agent swarm coordination
- `--strategy`: research, development, analysis, testing, optimization, maintenance
- `--mode`: centralized, distributed, hierarchical, mesh, hybrid
- `--max-agents <n>`: Maximum number of agents (default: 5)
- `--parallel`: Enable parallel execution
- `--monitor`: Real-time monitoring
- `--output <format>`: json, sqlite, csv, html

### MCP Server Integration
- `./claude-zen mcp start [--port 3000] [--host localhost]`: Start MCP server
- `./claude-zen mcp status`: Show MCP server status
- `./claude-zen mcp tools`: List available MCP tools

### Claude Integration
- `./claude-zen claude auth`: Authenticate with Claude API
- `./claude-zen claude models`: List available Claude models
- `./claude-zen claude chat`: Interactive chat mode

### Session Management
- `./claude-zen session`: Manage terminal sessions
- `./claude-zen repl`: Start interactive REPL mode

### Enterprise Features
- `./claude-zen project <subcommand>`: Project management (Enterprise)
- `./claude-zen deploy <subcommand>`: Deployment operations (Enterprise)
- `./claude-zen cloud <subcommand>`: Cloud infrastructure management (Enterprise)
- `./claude-zen security <subcommand>`: Security and compliance tools (Enterprise)
- `./claude-zen analytics <subcommand>`: Analytics and insights (Enterprise)

### Project Initialization
- `./claude-zen init`: Initialize Claude-Flow project
- `./claude-zen init --sparc`: Initialize with full SPARC development environment

## Quick Start Workflows

### Research Workflow
```bash
# Start a research swarm with distributed coordination
./claude-zen swarm "Research modern web frameworks" --strategy research --mode distributed --parallel --monitor

# Or use SPARC researcher mode for focused research
./claude-zen sparc run researcher "Analyze React vs Vue vs Angular performance characteristics"

# Store findings in memory for later use
./claude-zen memory store "research_findings" "Key insights from framework analysis"
```

### Development Workflow
```bash
# Start orchestration system with web UI
./claude-zen start --ui --port 3000

# Run TDD workflow for new feature
./claude-zen sparc tdd "User authentication system with JWT tokens"

# Development swarm for complex projects
./claude-zen swarm "Build e-commerce API with payment integration" --strategy development --mode hierarchical --max-agents 8 --monitor

# Check system status
./claude-zen status
```

### Analysis Workflow
```bash
# Analyze codebase performance
./claude-zen sparc run analyzer "Identify performance bottlenecks in current codebase"

# Data analysis swarm
./claude-zen swarm "Analyze user behavior patterns from logs" --strategy analysis --mode mesh --parallel --output sqlite

# Store analysis results
./claude-zen memory store "performance_analysis" "Bottlenecks identified in database queries"
```

### Maintenance Workflow
```bash
# System maintenance with safety controls
./claude-zen swarm "Update dependencies and security patches" --strategy maintenance --mode centralized --monitor

# Security review
./claude-zen sparc run reviewer "Security audit of authentication system"

# Export maintenance logs
./claude-zen memory export maintenance_log.json
```

## Integration Patterns

### Memory-Driven Coordination
Use Memory to coordinate information across multiple SPARC modes and swarm operations:

```bash
# Store architecture decisions
./claude-zen memory store "system_architecture" "Microservices with API Gateway pattern"

# All subsequent operations can reference this decision
./claude-zen sparc run coder "Implement user service based on system_architecture in memory"
./claude-zen sparc run tester "Create integration tests for microservices architecture"
```

### Multi-Stage Development
Coordinate complex development through staged execution:

```bash
# Stage 1: Research and planning
./claude-zen sparc run researcher "Research authentication best practices"
./claude-zen sparc run architect "Design authentication system architecture"

# Stage 2: Implementation
./claude-zen sparc tdd "User registration and login functionality"
./claude-zen sparc run coder "Implement JWT token management"

# Stage 3: Testing and deployment
./claude-zen sparc run tester "Comprehensive security testing"
./claude-zen swarm "Deploy authentication system" --strategy maintenance --mode centralized
```

### Enterprise Integration
For enterprise environments with additional tooling:

```bash
# Project management integration
./claude-zen project create "authentication-system"
./claude-zen project switch "authentication-system"

# Security compliance
./claude-zen security scan
./claude-zen security audit

# Analytics and monitoring
./claude-zen analytics dashboard
./claude-zen deploy production --monitor
```

## Advanced Batch Tool Patterns

### TodoWrite Coordination
Always use TodoWrite for complex task coordination:

```javascript
TodoWrite([
  {
    id: "architecture_design",
    content: "Design system architecture and component interfaces",
    status: "pending",
    priority: "high",
    dependencies: [],
    estimatedTime: "60min",
    assignedAgent: "architect"
  },
  {
    id: "frontend_development", 
    content: "Develop React components and user interface",
    status: "pending",
    priority: "medium",
    dependencies: ["architecture_design"],
    estimatedTime: "120min",
    assignedAgent: "frontend_team"
  }
]);
```

### Task and Memory Integration
Launch coordinated agents with shared memory:

```javascript
// Store architecture in memory
Task("System Architect", "Design architecture and store specs in Memory");

// Other agents use memory for coordination
Task("Frontend Team", "Develop UI using Memory architecture specs");
Task("Backend Team", "Implement APIs according to Memory specifications");
```

## Code Style Preferences
- Use ES modules (import/export) syntax
- Destructure imports when possible
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use async/await instead of Promise chains
- Prefer const/let over var

## Workflow Guidelines
- Always run typecheck after making code changes
- Run tests before committing changes
- Use meaningful commit messages
- Create feature branches for new functionality
- Ensure all tests pass before merging

## Important Notes
- **Use TodoWrite extensively** for all complex task coordination
- **Leverage Task tool** for parallel agent execution on independent work
- **Store all important information in Memory** for cross-agent coordination
- **Use batch file operations** whenever reading/writing multiple files
- **Check .claude/commands/** for detailed command documentation
- **All swarm operations include automatic batch tool coordination**
- **Monitor progress** with TodoRead during long-running operations
- **Enable parallel execution** with --parallel flags for maximum efficiency

This configuration ensures optimal use of Claude Code's batch tools for swarm orchestration and parallel task execution with full Claude-Flow capabilities.
