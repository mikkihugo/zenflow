# SPARC Modes Overview

SPARC (Specification, Planning, Architecture, Review, Code) is a comprehensive development methodology with 17 specialized modes, all integrated with MCP tools for enhanced coordination and execution.

## Available Modes

### Core Orchestration Modes
- **orchestrator**: Multi-agent task orchestration
- **swarm-coordinator**: Specialized swarm management
- **workflow-manager**: Process automation
- **batch-executor**: Parallel task execution

### Development Modes  
- **coder**: Autonomous code generation
- **architect**: System design
- **reviewer**: Code review
- **tdd**: Test-driven development

### Analysis and Research Modes
- **researcher**: Deep research capabilities
- **analyzer**: Code and data analysis
- **optimizer**: Performance optimization

### Creative and Support Modes
- **designer**: UI/UX design
- **innovator**: Creative problem solving
- **documenter**: Documentation generation
- **debugger**: Systematic debugging
- **tester**: Comprehensive testing
- **memory-manager**: Knowledge management

## Usage

### CLI Commands
```bash
# Run a specific mode
npx claude-flow sparc run <mode> "task description"

# List all modes
npx claude-flow sparc modes

# Get help for a mode
npx claude-flow sparc help <mode>

# Run with options
npx claude-flow sparc run <mode> "task" --parallel --monitor
```

### MCP Tool Integration
```javascript
// Initialize swarm for SPARC mode
mcp__claude-flow__swarm_init topology="hierarchical" strategy="auto" maxAgents=8

// Execute SPARC mode
mcp__claude-flow__sparc_mode mode="<mode>" task_description="<task>" options={}

// Spawn specialized agents
mcp__claude-flow__agent_spawn type="<agent-type>" capabilities=["<capability1>", "<capability2>"]

// Monitor execution
mcp__claude-flow__swarm_monitor swarmId="current" interval=5000
```

## Common Workflows

### Full Development Cycle
```bash
# 1. Initialize development swarm
mcp__claude-flow__swarm_init topology="hierarchical" maxAgents=12

# 2. Architecture design
mcp__claude-flow__sparc_mode mode="architect" task_description="design microservices"

# 3. Implementation
mcp__claude-flow__sparc_mode mode="coder" task_description="implement services"

# 4. Testing
mcp__claude-flow__sparc_mode mode="tdd" task_description="test all services"

# 5. Review
mcp__claude-flow__sparc_mode mode="reviewer" task_description="review implementation"
```

### Research and Innovation
```bash
# 1. Research phase
mcp__claude-flow__sparc_mode mode="researcher" task_description="research best practices"

# 2. Innovation
mcp__claude-flow__sparc_mode mode="innovator" task_description="propose novel solutions"

# 3. Documentation
mcp__claude-flow__sparc_mode mode="documenter" task_description="document findings"
```
