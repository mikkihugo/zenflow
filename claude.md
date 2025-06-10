# Claude-Flow: Advanced AI Agent Orchestration System Guide

This document provides comprehensive guidance to Claude Code when working with the Claude-Flow system - an advanced multi-agent orchestration platform created by rUv for managing complex AI workflows with sophisticated coordination, memory management, and task allocation capabilities.

## System Overview

Claude-Flow is a sophisticated multi-agent orchestration system built with Deno and TypeScript that enables:

- **Multi-Agent Coordination**: Spawn and manage multiple Claude agents with different roles
- **Advanced Task Scheduling**: Priority-based scheduling with dependency management
- **Persistent Memory Management**: Hybrid SQLite/Markdown backends with CRDT conflict resolution
- **Terminal Session Management**: Efficient pooling and session management
- **Resource Coordination**: Deadlock detection and prevention
- **MCP Integration**: Model Context Protocol server for tool integration
- **Interactive CLI**: Rich command-line interface with REPL mode

## Installation and Setup

### Using NPX (Recommended)
```bash
npx claude-flow
```

### Installing Globally
```bash
npm install -g claude-flow
```

### From Source
```bash
git clone https://github.com/ruvnet/claude-code-flow.git
cd claude-flow
deno task install
```

## Core CLI Commands and Usage

### 1. System Initialization

**Initialize Configuration**
```bash
claude-flow config init
```
This creates the default configuration file with optimized settings for agent orchestration.

**Show Current Configuration**
```bash
claude-flow config show
```

**Validate Configuration**
```bash
claude-flow config validate [file]
```

### 2. Starting the Orchestrator

**Basic Start**
```bash
claude-flow start
```

**Advanced Start Options**
```bash
claude-flow start --daemon --port 3000 --mcp-transport http
```

Options:
- `-d, --daemon`: Run as background daemon
- `-p, --port <port>`: Specify MCP server port
- `--mcp-transport <type>`: Set transport (stdio, http)

### 3. Agent Management

**Spawn a New Agent**
```bash
claude-flow agent spawn <type> --name "Agent Name"
```

Agent types available:
- `coordinator`: Plans and delegates tasks
- `researcher`: Gathers and analyzes information
- `implementer`: Writes code and creates solutions
- `analyst`: Identifies patterns and generates insights
- `custom`: User-defined agent types

**List All Agents**
```bash
claude-flow agent list
```

**Get Agent Information**
```bash
claude-flow agent info <agent-id>
```

**Terminate an Agent**
```bash
claude-flow agent terminate <agent-id>
```

### 4. Task Management

**Create a New Task**
```bash
claude-flow task create <type> "<description>"
```

Task types:
- `research`: Information gathering and analysis
- `implementation`: Code development
- `analysis`: Data analysis and pattern recognition
- `coordination`: Task planning and delegation

**List All Tasks**
```bash
claude-flow task list
```

**Check Task Status**
```bash
claude-flow task status <task-id>
```

**Cancel a Task**
```bash
claude-flow task cancel <task-id>
```

**Execute Workflow from File**
```bash
claude-flow task workflow <workflow-file.json>
```

### 5. Memory Management

**Query Memory Entries**
```bash
claude-flow memory query --filter "keyword" --agent-id "agent-1"
```

**Export Memory**
```bash
claude-flow memory export memory-backup.json
```

**Import Memory**
```bash
claude-flow memory import memory-backup.json
```

**Show Memory Statistics**
```bash
claude-flow memory stats
```

**Clean Up Old Entries**
```bash
claude-flow memory cleanup --older-than "30d"
```

## When and How to Use Claude-Flow

### Starting a New Development Session

1. **Initialize the system**:
   ```bash
   claude-flow config init
   claude-flow start
   ```

2. **Check system status**:
   ```bash
   claude-flow agent list
   claude-flow task list
   ```

3. **Spawn appropriate agents based on your needs**:
   ```bash
   # For research tasks
   claude-flow agent spawn researcher --name "Research Assistant"
   
   # For development tasks
   claude-flow agent spawn implementer --name "Code Developer"
   
   # For coordination
   claude-flow agent spawn coordinator --name "Task Coordinator"
   ```

### Creating New Terminal Sessions

The system automatically manages terminal sessions, but you can control session allocation:

**Check Terminal Pool Status**
```bash
claude-flow start --verbose  # Shows terminal pool information
```

**Terminal sessions are automatically created when**:
- Spawning new agents
- Executing tasks that require terminal access
- Running parallel operations

### Task Allocation and Orchestration

**Priority-Based Task Creation**
```bash
claude-flow task create research "Analyze market trends" --priority high --assign-to researcher-agent-id
```

**Workflow Orchestration Example**
Create a workflow file (`research-workflow.json`):
```json
{
  "name": "Research and Analysis Workflow",
  "tasks": [
    {
      "id": "research-1",
      "type": "research",
      "description": "Research quantum computing basics",
      "priority": 90,
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
      "id": "implement-1",
      "type": "implementation", 
      "description": "Create proof of concept",
      "dependencies": ["analyze-1"],
      "assignTo": "implementer"
    }
  ]
}
```

Execute the workflow:
```bash
claude-flow task workflow research-workflow.json
```

## Monitoring and Status Checking

### Agent Status Monitoring

**Real-time Agent Monitoring**
```bash
# Check all agents
claude-flow agent list --detailed

# Monitor specific agent
claude-flow agent info <agent-id> --watch
```

**Task Queue Monitoring**
```bash
# View task queue
claude-flow task list --status pending

# Monitor task progress
claude-flow task status <task-id> --follow
```

### Memory System Monitoring

**Check Memory Usage**
```bash
claude-flow memory stats --detailed
```

**Query Recent Agent Activities**
```bash
claude-flow memory query --recent --limit 10
```

### System Health Monitoring

**Overall System Status**
```bash
claude-flow start --status
```

This shows:
- Active agents count
- Task queue size
- Memory usage
- Terminal pool status
- MCP server status

## Advanced Usage Patterns

### Multi-Agent Coordination

**Coordinated Research Project**
```bash
# Spawn specialized agents
claude-flow agent spawn researcher --name "Primary Researcher" --capabilities "web-search,analysis"
claude-flow agent spawn researcher --name "Technical Researcher" --capabilities "code-analysis,documentation"
claude-flow agent spawn analyst --name "Data Analyst" --capabilities "statistical-analysis"
claude-flow agent spawn coordinator --name "Project Coordinator"

# Create coordinated tasks
claude-flow task create research "Research AI frameworks" --assign-to primary-researcher
claude-flow task create research "Analyze existing implementations" --assign-to technical-researcher
claude-flow task create analysis "Synthesize research findings" --dependencies "research-1,research-2" --assign-to data-analyst
```

### Memory-Backed Development

**Persistent Context Management**
```bash
# Start a development session with memory context
claude-flow agent spawn implementer --name "Backend Developer" --memory-context "backend-development"

# Create implementation task with memory persistence
claude-flow task create implementation "Develop API endpoints" --assign-to backend-developer --persist-memory
```

### Resource Coordination

**Managing Shared Resources**
```bash
# Create tasks that require exclusive resource access
claude-flow task create implementation "Database migration" --resource-lock "database" --priority high
claude-flow task create implementation "Schema updates" --resource-lock "database" --dependencies "migration-task"
```

## Configuration Management

### Default Configuration Structure

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
  }
}
```

### Customizing Configuration

**Set Specific Values**
```bash
claude-flow config set orchestrator.maxConcurrentAgents 20
claude-flow config set memory.cacheSizeMB 200
claude-flow config set coordination.deadlockDetection false
```

**Get Specific Values**
```bash
claude-flow config get orchestrator.maxConcurrentAgents
claude-flow config get memory.backend
```

## Interactive REPL Mode

**Start REPL Session**
```bash
claude-flow repl
```

In REPL mode, you can:
- Interactively manage agents and tasks
- Real-time monitoring
- Dynamic configuration changes
- Live debugging and troubleshooting

REPL commands:
```bash
> agent spawn researcher --name "Interactive Researcher"
> task create research "Real-time analysis task"
> memory query --filter "recent"
> status
> help
```

## Error Handling and Troubleshooting

### Common Status Checks

**System Health Check**
```bash
claude-flow start --health-check
```

**Component Status**
```bash
# Check orchestrator status
claude-flow agent list --health

# Check memory system
claude-flow memory stats --health

# Check task queue
claude-flow task list --queue-status
```

### Debugging Failed Tasks

**View Task Logs**
```bash
claude-flow task status <task-id> --logs
```

**Check Agent Logs**
```bash
claude-flow agent info <agent-id> --logs --tail 50
```

**Memory Conflict Resolution**
```bash
claude-flow memory query --conflicts
claude-flow memory export --conflicts-only conflict-analysis.json
```

## Best Practices

### Agent Management
1. **Specialized Agents**: Create agents with specific roles and capabilities
2. **Resource Monitoring**: Regularly check agent performance and resource usage
3. **Graceful Shutdown**: Always terminate agents properly to preserve memory state

### Task Organization
1. **Priority Assignment**: Use priority levels to ensure critical tasks are processed first
2. **Dependency Management**: Clearly define task dependencies for complex workflows
3. **Resource Coordination**: Use resource locks for tasks requiring exclusive access

### Memory Management
1. **Regular Cleanup**: Periodically clean up old memory entries
2. **Conflict Resolution**: Monitor and resolve memory conflicts promptly
3. **Backup Strategy**: Regular memory exports for disaster recovery

### System Monitoring
1. **Health Checks**: Regular system health monitoring
2. **Performance Metrics**: Track agent performance and task completion times
3. **Capacity Planning**: Monitor resource usage and plan for scaling

## Integration with Claude Code

When working with Claude Code, use Claude-Flow to:

1. **Orchestrate Complex Development Tasks**: Break down large development projects into coordinated agent tasks
2. **Manage Persistent Context**: Use memory management for maintaining context across development sessions
3. **Coordinate Multiple Development Streams**: Parallel development with proper resource coordination
4. **Quality Assurance**: Dedicated agents for testing, code review, and validation

**Example Development Workflow Integration**:
```bash
# Start Claude-Flow orchestrator
claude-flow start --daemon

# Spawn development team
claude-flow agent spawn coordinator --name "Development Coordinator"
claude-flow agent spawn implementer --name "Backend Developer" 
claude-flow agent spawn implementer --name "Frontend Developer"
claude-flow agent spawn analyst --name "QA Analyst"

# Create coordinated development workflow
claude-flow task workflow development-pipeline.json
```

This comprehensive guide enables effective utilization of Claude-Flow's advanced multi-agent orchestration capabilities for complex AI-driven development workflows.

---

**Created by rUv** - [github.com/ruvnet/claude-code-flow](https://github.com/ruvnet/claude-code-flow)