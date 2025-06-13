# Claude Code Integration Guide

This document provides comprehensive guidance to Claude when working with the Claude-Flow codebase - an advanced multi-agent orchestration platform for Claude Code.

## Project Overview

**Claude-Flow** is the ultimate multi-terminal orchestration platform that revolutionizes how you work with Claude Code. It enables coordinating dozens of AI agents simultaneously, each working on different aspects of your project while sharing knowledge through an intelligent memory bank.

### Key Features
- **🐝 Advanced Swarm Orchestration**: Complete multi-agent coordination system with timeout-free execution
- **🧠 Distributed Memory Sharing**: Cross-agent knowledge sharing with persistent state management
- **⚡ SPARC Methodology**: Systematic development with 17+ specialized modes
- **🔄 Intelligent Task Scheduling**: 7+ algorithms with dependency resolution and load balancing
- **🛡️ Enterprise Security**: Encryption, access control, audit logging, and input validation
- **📊 Real-Time Monitoring**: Comprehensive metrics, health checks, and performance tracking

## Architecture

Claude-Flow uses a modular architecture with the following components:

### Core Systems
- **Orchestrator**: Central coordinator managing all system components (`src/core/orchestrator.ts`)
- **Swarm System**: Advanced multi-agent coordination with timeout-free execution (`src/swarm/`)
- **Terminal Manager**: Handles terminal sessions with pooling and recycling (`src/terminal/`)
- **Memory Manager**: Persistent storage with caching and indexing (`src/memory/`)
- **Coordination Manager**: Task scheduling and resource management (`src/coordination/`)
- **MCP Server**: Tool integration via Model Context Protocol (`src/mcp/`)

### SPARC Modes
Located in `src/cli/simple-commands/sparc-modes/`, includes:
- **🏗️ architect**: System design and architecture
- **🧠 code**: Clean, modular implementation
- **🧪 tdd**: Test-driven development
- **🛡️ security-review**: Security analysis
- **📚 docs-writer**: Documentation creation
- **🔗 integration**: System integration
- **🐝 swarm**: Advanced multi-agent coordination (NEW!)

## Code Conventions

### Naming Conventions
- **Files**: kebab-case (e.g., `swarm-coordinator.ts`)
- **Functions**: camelCase (e.g., `createObjective`)
- **Classes**: PascalCase (e.g., `SwarmCoordinator`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SWARM_CONSTANTS`)
- **Types/Interfaces**: PascalCase (e.g., `SwarmConfig`, `AgentState`)

### Code Style
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Deno**: Native Deno runtime with modern ES modules
- **File Size**: Keep files under 500 lines for maintainability
- **Modularity**: Break complex components into smaller, focused modules
- **Error Handling**: Comprehensive error handling with proper logging

### Design Patterns
- **Event-Driven Architecture**: Extensive use of EventEmitter for system communication
- **Factory Pattern**: Agent and task creation with configurable types
- **Observer Pattern**: Real-time monitoring and metrics collection
- **Strategy Pattern**: Pluggable coordination and execution strategies
- **Circuit Breaker**: Fault tolerance with automatic recovery

### Testing Approach
- **Unit Tests**: Located in `tests/unit/` directory
- **Integration Tests**: Located in `tests/integration/` directory
- **E2E Tests**: End-to-end testing of complete workflows
- **Coverage Target**: Maintain 95%+ test coverage
- **Test Framework**: Deno's built-in testing framework

## Directory Structure

```
claude-code-flow/
├── src/                          # Source code
│   ├── cli/                      # CLI commands and interfaces
│   │   └── simple-commands/      # Command implementations
│   │       └── sparc-modes/      # SPARC development modes
│   │           ├── swarm.js      # 🐝 Swarm coordination mode
│   │           ├── architect.js  # 🏗️ Architecture mode
│   │           ├── code.js       # 🧠 Code implementation mode
│   │           └── index.js      # Mode orchestration loader
│   ├── core/                     # Core system components
│   │   ├── orchestrator.ts       # Main system orchestrator
│   │   └── logger.ts             # Centralized logging
│   ├── swarm/                    # Advanced swarm system
│   │   ├── coordinator.ts        # Swarm coordination engine
│   │   ├── types.ts              # Swarm type definitions
│   │   └── agent-manager.ts      # Agent lifecycle management
│   ├── terminal/                 # Terminal management
│   ├── memory/                   # Memory bank system
│   ├── coordination/             # Task coordination
│   └── mcp/                      # MCP server integration
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
├── docs/                         # Documentation
├── .roomodes                     # SPARC mode configurations
└── CLAUDE.md                     # This file
```

## Development Workflow

### 1. SPARC Development Process
Claude-Flow integrates the **SPARC** methodology (Specification, Pseudocode, Architecture, Refinement, Completion):

```bash
# Simplified orchestration
npx claude-flow sparc "build complete authentication system"

# Run specific SPARC modes
npx claude-flow sparc run code "implement API"
npx claude-flow sparc run tdd "auth tests"
npx claude-flow sparc run architect "system design"
```

### 2. Swarm Coordination Workflow
For complex, long-running tasks that require multiple agents:

```bash
# Basic development swarm
npx claude-flow swarm "Build a REST API" --strategy development --monitor

# Research swarm with distributed coordination
npx claude-flow swarm "Research AI trends" --strategy research --distributed --ui

# Background optimization swarm (timeout-free)
npx claude-flow swarm "Optimize performance" --strategy optimization --background --monitor

# Enterprise swarm with all features
npx claude-flow swarm "Complex project development" \
  --strategy development \
  --mode distributed \
  --max-agents 10 \
  --parallel \
  --monitor \
  --review \
  --testing \
  --encryption \
  --verbose
```

### 3. Testing Process
```bash
# Run all tests
deno task test

# Run with coverage
deno task test:coverage

# Run specific test suite
deno test tests/unit/swarm/

# Run integration tests
deno test tests/integration/
```

### 4. Build and Deploy
```bash
# Build the project
deno task build

# Install globally
deno task install

# Create distribution package
deno task package
```

## 🐝 Swarm SPARC Mode

The swarm mode is designed for complex, long-running tasks that benefit from multi-agent coordination with timeout-free execution.

### When to Use Swarm Mode
- Complex multi-step projects requiring parallel processing
- Large-scale development tasks that might timeout with single agents
- Research projects needing multiple specialized agents
- Long-running optimization and refactoring tasks
- Comprehensive testing and quality assurance workflows
- Documentation and analysis projects with multiple components

### Swarm Strategies
- **development**: Code implementation with quality checks
- **research**: Information gathering and analysis
- **analysis**: Data processing and insights
- **testing**: Comprehensive quality assurance
- **optimization**: Performance improvements
- **maintenance**: System updates and fixes

### Agent Types Available
- **coordinator**: Plans and delegates tasks to other agents
- **developer**: Writes code and implements solutions
- **researcher**: Gathers and analyzes information
- **analyzer**: Identifies patterns and generates insights
- **tester**: Creates and runs tests for quality assurance
- **reviewer**: Performs code and design reviews
- **documenter**: Creates documentation and guides
- **monitor**: Tracks performance and system health
- **specialist**: Domain-specific expert agents

### Coordination Modes
- **centralized**: Single coordinator manages all agents (recommended for start)
- **distributed**: Multiple coordinators share management
- **hierarchical**: Tree structure with nested coordination
- **mesh**: Peer-to-peer agent collaboration
- **hybrid**: Mixed coordination strategies

### Timeout Prevention Features
- **Background Execution**: Use `--background` flag for tasks over 60 minutes
- **State Persistence**: All progress saved continuously
- **Task Chunking**: Large tasks automatically decomposed
- **Memory Sharing**: Cross-agent collaboration through distributed memory
- **Real-time Monitoring**: Track progress with `--monitor` flag

## Important Considerations

### Security Requirements
- **Never hardcode secrets**: Use environment variables and config files
- **Input validation**: All user inputs must be validated and sanitized
- **Access control**: Role-based permissions for different agent types
- **Audit logging**: All actions logged for security compliance
- **Encryption**: Enable with `--encryption` flag for sensitive data

### Performance Requirements
- **File size limits**: Keep all files under 500 lines
- **Memory management**: Efficient resource utilization with pooling
- **Concurrent execution**: Support for up to 10 simultaneous agents
- **Timeout handling**: Background mode for long-running tasks
- **Circuit breakers**: Automatic failure recovery and retry mechanisms

### Compatibility Requirements
- **Deno 1.40+**: Native Deno runtime environment
- **TypeScript**: Strict mode with comprehensive type checking
- **Claude Code**: Full integration with Claude Code IDE
- **MCP Protocol**: Model Context Protocol for tool integration
- **Cross-platform**: Works on Linux, macOS, and Windows

## Common Tasks

### Add a New SPARC Mode
1. Create new mode file in `src/cli/simple-commands/sparc-modes/`
2. Implement mode configuration and orchestration function
3. Add import and mapping in `index.js`
4. Add mode entry to `.roomodes` file
5. Test with `npx claude-flow sparc run <mode-name> "test task"`

### Fix a Bug
1. Identify the component using monitoring tools
2. Create reproducer test case
3. Use appropriate SPARC mode (debug/tdd) for fixing
4. Ensure all tests pass before merging
5. Update metrics and monitoring

### Update Documentation
1. Use `docs-writer` SPARC mode for consistency
2. Keep documentation under 500 lines per file
3. Include examples and use cases
4. Update README.md and relevant guides
5. Validate with `npx claude-flow sparc run docs-writer "update docs"`

### Optimize Performance
1. Use swarm mode with optimization strategy:
   ```bash
   npx claude-flow swarm "Optimize system performance" \
     --strategy optimization --background --testing
   ```
2. Monitor with real-time metrics
3. Use work stealing for load balancing
4. Implement circuit breakers for fault tolerance

## Dependencies

### Core Dependencies
- **Deno**: Runtime environment (1.40+)
- **TypeScript**: Type system and compilation
- **Node.js EventEmitter**: Event-driven architecture
- **SQLite**: Memory bank persistence layer

### Development Dependencies
- **Deno Test**: Built-in testing framework
- **Deno Lint**: Code quality and style checking
- **Deno Format**: Code formatting
- **Deno Bundle**: Build and packaging

### Runtime Dependencies
- **Claude Code**: IDE integration and spawning
- **MCP Protocol**: Tool and service integration
- **Terminal Emulation**: Cross-platform terminal support

## Memory Operations

Claude-Flow includes a sophisticated memory system for cross-agent collaboration:

```bash
# Store information for agent sharing
npx claude-flow memory store "swarm_findings" "key insights and decisions"

# Store progress updates
npx claude-flow memory store "swarm_progress" "current completion status"

# Query shared knowledge
npx claude-flow memory query "swarm" --limit 10

# Export memory for backup
npx claude-flow memory export swarm-backup.json
```

## Troubleshooting

### Common Issues

**Swarm fails to start**
- Check if Claude-Flow is initialized: `npx claude-flow init --sparc`
- Verify Deno version: `deno --version` (requires 1.40+)
- Check system resources and permissions

**Agents not coordinating**
- Ensure memory namespace is consistent across agents
- Check network connectivity for distributed coordination
- Verify agent capabilities match task requirements

**Timeout concerns**
- Use `--background` flag for long tasks (>30 minutes)
- Enable monitoring with `--monitor` flag
- Break large tasks into smaller chunks

**Performance issues**
- Reduce `--max-agents` count for resource constraints
- Use work stealing with `--parallel` flag
- Monitor resource usage with `npx claude-flow monitor`

### Debug Commands
```bash
# Check system status
npx claude-flow status

# Monitor real-time activity
npx claude-flow monitor

# View agent information
npx claude-flow agent list

# Check memory statistics
npx claude-flow memory stats

# View MCP tools
npx claude-flow mcp tools
```

### Best Practices
- Start with centralized coordination mode for simplicity
- Use dry-run first to validate configuration: `--dry-run`
- Monitor resource usage with `--monitor` flag
- Store important findings in memory for cross-agent access
- Use background mode for tasks over 30 minutes
- Break complex objectives into manageable tasks
- Maintain quality thresholds with review processes

## Integration with Claude Code

Claude-Flow provides seamless integration with Claude Code through:

1. **Automatic Context Loading**: Claude Code reads project configuration
2. **Enhanced Guidance**: Spawned Claude instances receive detailed instructions
3. **Memory Persistence**: Context maintained across sessions
4. **Build Command Integration**: All commands available to Claude
5. **SPARC Support**: Built-in systematic development methodology
6. **Swarm Access**: Multi-agent coordination for complex tasks

Use with Claude Code:
```bash
# Initialize integration
npx claude-flow init --sparc

# Spawn Claude with enhanced guidance
npx claude-flow claude spawn "your task here" --research --parallel

# Claude receives comprehensive instructions on:
# - Claude-Flow memory operations
# - Agent coordination capabilities
# - Swarm system access
# - Mode-specific development guidance
```

This comprehensive setup ensures Claude has all the context needed to work effectively with the Claude-Flow orchestration platform.
