// init/sparc-environment.ts - SPARC development environment setup
export async function createSparcEnvironment(): Promise<void> {
  const fs = await import('fs/promises');
  
  // Create .roomodes file with 17 pre-configured modes
  const roomodes = createRoomodes();
  await fs.writeFile('.roomodes', JSON.stringify(roomodes, null, 2));
  console.log('  ✅ Created .roomodes file with 17 pre-configured modes');
  
  // Create comprehensive CLAUDE.md with batch tools integration
  const claudeMd = createClaudeMd();
  await fs.writeFile('CLAUDE.md', claudeMd);
  console.log('  ✅ Created CLAUDE.md with batch tools and swarm orchestration');
  
  console.log('  ✅ SPARC environment configured with batch tools integration');
}

function createRoomodes() {
  return {
    "orchestrator": {
      "description": "Multi-agent task orchestration and coordination",
      "prompt": "SPARC: orchestrator\\nYou are an AI orchestrator coordinating multiple specialized agents to complete complex tasks efficiently using TodoWrite, TodoRead, Task, and Memory tools.",
      "tools": ["TodoWrite", "TodoRead", "Task", "Memory", "Bash"]
    },
    "coder": {
      "description": "Autonomous code generation and implementation", 
      "prompt": "SPARC: coder\\nYou are an expert programmer focused on writing clean, efficient, and well-documented code using batch file operations.",
      "tools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep", "TodoWrite"]
    },
    "researcher": {
      "description": "Deep research and comprehensive analysis",
      "prompt": "SPARC: researcher\\nYou are a research specialist focused on gathering comprehensive information using parallel WebSearch/WebFetch and Memory coordination.",
      "tools": ["WebSearch", "WebFetch", "Read", "Write", "Memory", "TodoWrite", "Task"]
    },
    "tdd": {
      "description": "Test-driven development methodology",
      "prompt": "SPARC: tdd\\nYou follow strict test-driven development practices using TodoWrite for test planning and batch operations for test execution.",
      "tools": ["Read", "Write", "Edit", "Bash", "TodoWrite", "Task"]
    },
    "architect": {
      "description": "System design and architecture planning",
      "prompt": "SPARC: architect\\nYou are a software architect focused on designing scalable, maintainable system architectures using Memory for design coordination.",
      "tools": ["Read", "Write", "Glob", "Memory", "TodoWrite", "Task"]
    },
    "reviewer": {
      "description": "Code review and quality optimization",
      "prompt": "SPARC: reviewer\\nYou are a code reviewer focused on improving code quality using batch file analysis and systematic review processes.",
      "tools": ["Read", "Edit", "Grep", "Bash", "TodoWrite", "Memory"]
    },
    "debugger": {
      "description": "Debug and fix issues systematically",
      "prompt": "SPARC: debugger\\nYou are a debugging specialist using TodoWrite for systematic debugging and Memory for tracking issue patterns.",
      "tools": ["Read", "Edit", "Bash", "Grep", "TodoWrite", "Memory"]
    },
    "tester": {
      "description": "Comprehensive testing and validation",
      "prompt": "SPARC: tester\\nYou are a testing specialist using TodoWrite for test planning and parallel execution for comprehensive coverage.",
      "tools": ["Read", "Write", "Edit", "Bash", "TodoWrite", "Task"]
    },
    "analyzer": {
      "description": "Code and data analysis specialist",
      "prompt": "SPARC: analyzer\\nYou are an analysis specialist using batch operations for efficient data processing and Memory for insight coordination.",
      "tools": ["Read", "Grep", "Bash", "Write", "Memory", "TodoWrite", "Task"]
    },
    "optimizer": {
      "description": "Performance optimization specialist",
      "prompt": "SPARC: optimizer\\nYou are a performance optimization specialist using systematic analysis and TodoWrite for optimization planning.",
      "tools": ["Read", "Edit", "Bash", "Grep", "TodoWrite", "Memory"]
    },
    "documenter": {
      "description": "Documentation generation and maintenance",
      "prompt": "SPARC: documenter\\nYou are a documentation specialist using batch file operations and Memory for comprehensive documentation coordination.",
      "tools": ["Read", "Write", "Glob", "Memory", "TodoWrite"]
    },
    "designer": {
      "description": "UI/UX design and user experience",
      "prompt": "SPARC: designer\\nYou are a UI/UX designer using Memory for design coordination and TodoWrite for design process management.",
      "tools": ["Read", "Write", "Edit", "Memory", "TodoWrite"]
    },
    "innovator": {
      "description": "Creative problem solving and innovation",
      "prompt": "SPARC: innovator\\nYou are an innovation specialist using WebSearch for inspiration and Memory for idea coordination across sessions.",
      "tools": ["Read", "Write", "WebSearch", "Memory", "TodoWrite", "Task"]
    },
    "swarm-coordinator": {
      "description": "Swarm coordination and management",
      "prompt": "SPARC: swarm-coordinator\\nYou coordinate swarms of AI agents using TodoWrite for task management, Task for agent launching, and Memory for coordination.",
      "tools": ["TodoWrite", "TodoRead", "Task", "Memory", "Bash"]
    },
    "memory-manager": {
      "description": "Memory and knowledge management",
      "prompt": "SPARC: memory-manager\\nYou manage knowledge and memory systems using Memory tools for persistent storage and TodoWrite for knowledge organization.",
      "tools": ["Memory", "Read", "Write", "TodoWrite", "TodoRead"]
    },
    "batch-executor": {
      "description": "Parallel task execution specialist",
      "prompt": "SPARC: batch-executor\\nYou excel at executing multiple tasks in parallel using batch tool operations and Task coordination for maximum efficiency.",
      "tools": ["Task", "Bash", "Read", "Write", "TodoWrite", "Memory"]
    },
    "workflow-manager": {
      "description": "Workflow automation and process management",
      "prompt": "SPARC: workflow-manager\\nYou design and manage automated workflows using TodoWrite for process planning and Task coordination for execution.",
      "tools": ["TodoWrite", "TodoRead", "Task", "Bash", "Memory"]
    }
  };
}

function createClaudeMd(): string {
  return `# Claude Code Configuration

## Build Commands
- \`npm run build\`: Build the project
- \`npm run test\`: Run the full test suite
- \`npm run lint\`: Run ESLint and format checks
- \`npm run typecheck\`: Run TypeScript type checking
- \`./claude-flow --help\`: Show all available commands

## Claude-Flow Complete Command Reference

### Core System Commands
- \`./claude-flow start [--ui] [--port 3000] [--host localhost]\`: Start orchestration system with optional web UI
- \`./claude-flow status\`: Show comprehensive system status
- \`./claude-flow monitor\`: Real-time system monitoring dashboard
- \`./claude-flow config <subcommand>\`: Configuration management (show, get, set, init, validate)

### Agent Management
- \`./claude-flow agent spawn <type> [--name <name>]\`: Create AI agents (researcher, coder, analyst, etc.)
- \`./claude-flow agent list\`: List all active agents
- \`./claude-flow spawn <type>\`: Quick agent spawning (alias for agent spawn)

### Task Orchestration
- \`./claude-flow task create <type> [description]\`: Create and manage tasks
- \`./claude-flow task list\`: View active task queue
- \`./claude-flow workflow <file>\`: Execute workflow automation files

### Memory Management
- \`./claude-flow memory store <key> <data>\`: Store persistent data across sessions
- \`./claude-flow memory get <key>\`: Retrieve stored information
- \`./claude-flow memory list\`: List all memory keys
- \`./claude-flow memory export <file>\`: Export memory to file
- \`./claude-flow memory import <file>\`: Import memory from file
- \`./claude-flow memory stats\`: Memory usage statistics
- \`./claude-flow memory cleanup\`: Clean unused memory entries

### SPARC Development Modes
- \`./claude-flow sparc "<task>"\`: Run orchestrator mode (default)
- \`./claude-flow sparc run <mode> "<task>"\`: Run specific SPARC mode
- \`./claude-flow sparc tdd "<feature>"\`: Test-driven development mode
- \`./claude-flow sparc modes\`: List all 17 available SPARC modes

Available SPARC modes: orchestrator, coder, researcher, tdd, architect, reviewer, debugger, tester, analyzer, optimizer, documenter, designer, innovator, swarm-coordinator, memory-manager, batch-executor, workflow-manager

### Swarm Coordination
- \`./claude-flow swarm "<objective>" [options]\`: Multi-agent swarm coordination
- \`--strategy\`: research, development, analysis, testing, optimization, maintenance
- \`--mode\`: centralized, distributed, hierarchical, mesh, hybrid
- \`--max-agents <n>\`: Maximum number of agents (default: 5)
- \`--parallel\`: Enable parallel execution
- \`--monitor\`: Real-time monitoring
- \`--output <format>\`: json, sqlite, csv, html

### MCP Server Integration
- \`./claude-flow mcp start [--port 3000] [--host localhost]\`: Start MCP server
- \`./claude-flow mcp status\`: Show MCP server status
- \`./claude-flow mcp tools\`: List available MCP tools

### Claude Integration
- \`./claude-flow claude auth\`: Authenticate with Claude API
- \`./claude-flow claude models\`: List available Claude models
- \`./claude-flow claude chat\`: Interactive chat mode

### Session Management
- \`./claude-flow session\`: Manage terminal sessions
- \`./claude-flow repl\`: Start interactive REPL mode

### Enterprise Features
- \`./claude-flow project <subcommand>\`: Project management (Enterprise)
- \`./claude-flow deploy <subcommand>\`: Deployment operations (Enterprise)
- \`./claude-flow cloud <subcommand>\`: Cloud infrastructure management (Enterprise)
- \`./claude-flow security <subcommand>\`: Security and compliance tools (Enterprise)
- \`./claude-flow analytics <subcommand>\`: Analytics and insights (Enterprise)

### Project Initialization
- \`./claude-flow init\`: Initialize Claude-Flow project
- \`./claude-flow init --sparc\`: Initialize with full SPARC development environment

## Quick Start Workflows

### Research Workflow
\`\`\`bash
# Start a research swarm with distributed coordination
./claude-flow swarm "Research modern web frameworks" --strategy research --mode distributed --parallel --monitor

# Or use SPARC researcher mode for focused research
./claude-flow sparc run researcher "Analyze React vs Vue vs Angular performance characteristics"

# Store findings in memory for later use
./claude-flow memory store "research_findings" "Key insights from framework analysis"
\`\`\`

### Development Workflow
\`\`\`bash
# Start orchestration system with web UI
./claude-flow start --ui --port 3000

# Run TDD workflow for new feature
./claude-flow sparc tdd "User authentication system with JWT tokens"

# Development swarm for complex projects
./claude-flow swarm "Build e-commerce API with payment integration" --strategy development --mode hierarchical --max-agents 8 --monitor

# Check system status
./claude-flow status
\`\`\`

### Analysis Workflow
\`\`\`bash
# Analyze codebase performance
./claude-flow sparc run analyzer "Identify performance bottlenecks in current codebase"

# Data analysis swarm
./claude-flow swarm "Analyze user behavior patterns from logs" --strategy analysis --mode mesh --parallel --output sqlite

# Store analysis results
./claude-flow memory store "performance_analysis" "Bottlenecks identified in database queries"
\`\`\`

### Maintenance Workflow
\`\`\`bash
# System maintenance with safety controls
./claude-flow swarm "Update dependencies and security patches" --strategy maintenance --mode centralized --monitor

# Security review
./claude-flow sparc run reviewer "Security audit of authentication system"

# Export maintenance logs
./claude-flow memory export maintenance_log.json
\`\`\`

## Integration Patterns

### Memory-Driven Coordination
Use Memory to coordinate information across multiple SPARC modes and swarm operations:

\`\`\`bash
# Store architecture decisions
./claude-flow memory store "system_architecture" "Microservices with API Gateway pattern"

# All subsequent operations can reference this decision
./claude-flow sparc run coder "Implement user service based on system_architecture in memory"
./claude-flow sparc run tester "Create integration tests for microservices architecture"
\`\`\`

### Multi-Stage Development
Coordinate complex development through staged execution:

\`\`\`bash
# Stage 1: Research and planning
./claude-flow sparc run researcher "Research authentication best practices"
./claude-flow sparc run architect "Design authentication system architecture"

# Stage 2: Implementation
./claude-flow sparc tdd "User registration and login functionality"
./claude-flow sparc run coder "Implement JWT token management"

# Stage 3: Testing and deployment
./claude-flow sparc run tester "Comprehensive security testing"
./claude-flow swarm "Deploy authentication system" --strategy maintenance --mode centralized
\`\`\`

### Enterprise Integration
For enterprise environments with additional tooling:

\`\`\`bash
# Project management integration
./claude-flow project create "authentication-system"
./claude-flow project switch "authentication-system"

# Security compliance
./claude-flow security scan
./claude-flow security audit

# Analytics and monitoring
./claude-flow analytics dashboard
./claude-flow deploy production --monitor
\`\`\`

## Batch Tools and Orchestration
This project is configured for advanced Claude Code batch operations and swarm orchestration:

### Batch Tool Usage Guidelines
- **Always use TodoWrite** at the start of complex operations for task coordination
- **Use Task tool** to launch parallel agents for independent work streams
- **Store results in Memory** for cross-agent coordination and knowledge sharing
- **Batch file operations** when reading/writing multiple files for efficiency
- **Use parallel execution** whenever possible with batch tool coordination

### Todo Tools for Advanced Orchestration
TodoWrite and TodoRead are the foundation of all swarm operations:

\`\`\`javascript
// Example: Comprehensive task breakdown for development
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
  },
  {
    id: "backend_services",
    content: "Implement backend APIs and business logic",
    status: "pending",
    priority: "medium", 
    dependencies: ["architecture_design"],
    estimatedTime: "150min",
    assignedAgent: "backend_team"
  },
  {
    id: "integration_testing",
    content: "Integration testing and system validation",
    status: "pending",
    priority: "high",
    dependencies: ["frontend_development", "backend_services"],
    estimatedTime: "90min",
    assignedAgent: "testing_team"
  }
]);

// Launch coordinated parallel agents
Task("System Architect", "Design scalable system architecture using Memory for component coordination");
Task("Frontend Development Team", "Build React components based on architecture stored in Memory");
Task("Backend Development Team", "Implement APIs according to architecture specifications in Memory");
\`\`\`

## SPARC Development Modes
This project includes 17 specialized SPARC modes optimized for batch operations:

### Core Orchestration Modes
- **orchestrator**: Multi-agent task orchestration with TodoWrite/TodoRead/Task/Memory
- **swarm-coordinator**: Specialized swarm management with batch coordination
- **workflow-manager**: Process automation with TodoWrite planning and Task execution
- **batch-executor**: Parallel task execution specialist using batch operations

### Development Modes
- **coder**: Autonomous code generation with batch file operations
- **architect**: System design with Memory-based coordination
- **reviewer**: Code review using batch file analysis
- **tdd**: Test-driven development with TodoWrite planning

### Analysis and Research Modes  
- **researcher**: Deep research with parallel WebSearch/WebFetch and Memory coordination
- **analyzer**: Code and data analysis with batch processing
- **optimizer**: Performance optimization with systematic analysis

### Creative and Support Modes
- **designer**: UI/UX design with Memory coordination
- **innovator**: Creative problem solving with WebSearch and Memory
- **documenter**: Documentation with batch file operations
- **debugger**: Systematic debugging with TodoWrite and Memory
- **tester**: Comprehensive testing with parallel execution
- **memory-manager**: Knowledge management with Memory tools

## Advanced Swarm Commands
Multi-agent coordination with comprehensive batch tools integration:

\`\`\`bash
# Research swarm with parallel execution and memory coordination
claude-flow swarm "Research microservices architecture" \\
  --strategy research --mode distributed --parallel --max-agents 6 --monitor

# Development swarm with hierarchical coordination
claude-flow swarm "Build e-commerce platform" \\
  --strategy development --mode hierarchical --parallel --max-agents 10 --monitor

# Analysis swarm with mesh coordination for complex data processing
claude-flow swarm "Analyze user behavior patterns" \\
  --strategy analysis --mode mesh --parallel --max-agents 8 --output sqlite

# Testing swarm with comprehensive parallel validation
claude-flow swarm "Comprehensive security testing" \\
  --strategy testing --mode distributed --parallel --max-agents 12 --monitor

# Optimization swarm with hybrid adaptive coordination
claude-flow swarm "Optimize system performance" \\
  --strategy optimization --mode hybrid --parallel --monitor --timeout 180

# Maintenance swarm with centralized safety controls
claude-flow swarm "System maintenance and updates" \\
  --strategy maintenance --mode centralized --monitor --output json
\`\`\`

### Automatic Batch Tool Integration
Every swarm command automatically uses:
- **TodoWrite**: Creates comprehensive task breakdowns with dependencies
- **Task**: Launches specialized parallel agents for different components
- **Memory**: Enables cross-agent knowledge sharing and coordination
- **Batch File Ops**: Concurrent Read/Write/Edit operations for efficiency
- **Parallel Search**: Simultaneous Glob/Grep operations for discovery

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

## Advanced Batch Tool Patterns

### Research and Analysis Pattern
\`\`\`javascript
// 1. Research coordination
TodoWrite([
  {id: "domain_research", content: "Research domain patterns", status: "pending", priority: "high"},
  {id: "competitive_analysis", content: "Analyze competitors", status: "pending", priority: "medium"},
  {id: "synthesis", content: "Synthesize findings", status: "pending", priority: "high"}
]);

// 2. Parallel research agents
Task("Domain Expert", "Research best practices using WebSearch and store in Memory");
Task("Competitive Analyst", "Analyze competitor solutions using WebFetch");
Task("Technology Evaluator", "Evaluate technology options using research coordination");

// 3. Knowledge synthesis
Task("Research Synthesizer", "Combine all Memory findings into comprehensive recommendations");
\`\`\`

### Development Coordination Pattern
\`\`\`javascript
// 1. Development planning
TodoWrite([
  {id: "architecture", content: "System architecture design", status: "pending", priority: "high"},
  {id: "frontend", content: "Frontend development", status: "pending", priority: "medium"},
  {id: "backend", content: "Backend development", status: "pending", priority: "medium"},
  {id: "integration", content: "System integration", status: "pending", priority: "high"}
]);

// 2. Coordinated development
Task("System Architect", "Design architecture and store specs in Memory");
Task("Frontend Team", "Develop UI components using Memory architecture specs");
Task("Backend Team", "Implement APIs according to Memory specifications");
Task("DevOps Team", "Setup deployment using coordinated specifications");
\`\`\`

### Analysis and Optimization Pattern
\`\`\`javascript
// 1. Analysis planning
TodoWrite([
  {id: "data_collection", content: "Collect performance data", status: "pending", priority: "high"},
  {id: "pattern_analysis", content: "Analyze patterns", status: "pending", priority: "medium"},
  {id: "optimization", content: "Implement optimizations", status: "pending", priority: "high"}
]);

// 2. Parallel analysis
Task("Data Collector", "Gather performance metrics using batch Read operations");
Task("Pattern Analyst", "Analyze patterns using Grep and statistical analysis");
Task("Optimization Specialist", "Implement improvements using batch Edit operations");
\`\`\`

## Important Notes
- **Use TodoWrite extensively** for all complex task coordination
- **Leverage Task tool** for parallel agent execution on independent work
- **Store all important information in Memory** for cross-agent coordination
- **Use batch file operations** whenever reading/writing multiple files
- **Check .claude/commands/swarm/** for detailed swarm documentation
- **All swarm operations include automatic batch tool coordination**
- **Monitor progress** with TodoRead during long-running operations
- **Enable parallel execution** with --parallel flags for maximum efficiency

This configuration ensures optimal use of Claude Code's batch tools for swarm orchestration and parallel task execution.
`;
}