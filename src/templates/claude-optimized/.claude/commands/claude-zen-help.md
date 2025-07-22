---
name: claude-zen-help
description: Show Claude-Flow commands and usage with batchtools optimization
---

# Claude-Flow Commands (Batchtools Optimized)

## Core Commands with Batch Operations

### System Management (Batch Operations)

- `npx claude-zen start` - Start orchestration system
- `npx claude-zen status` - Check system status
- `npx claude-zen monitor` - Real-time monitoring
- `npx claude-zen stop` - Stop orchestration

**Batch Operations:**

```bash
# Check multiple system components in parallel
npx claude-zen batch status --components "agents,tasks,memory,connections"

# Start multiple services concurrently
npx claude-zen batch start --services "monitor,scheduler,coordinator"
```

### Agent Management (Parallel Operations)

- `npx claude-zen agent spawn <type>` - Create new agent
- `npx claude-zen agent list` - List active agents
- `npx claude-zen agent info <id>` - Agent details
- `npx claude-zen agent terminate <id>` - Stop agent

**Batch Operations:**

```bash
# Spawn multiple agents in parallel
npx claude-zen agent batch-spawn "code:3,test:2,review:1"

# Get info for multiple agents concurrently
npx claude-zen agent batch-info "agent1,agent2,agent3"

# Terminate multiple agents
npx claude-zen agent batch-terminate --pattern "test-*"
```

### Task Management (Concurrent Processing)

- `npx claude-zen task create <type> "description"` - Create task
- `npx claude-zen task list` - List all tasks
- `npx claude-zen task status <id>` - Task status
- `npx claude-zen task cancel <id>` - Cancel task

**Batch Operations:**

```bash
# Create multiple tasks from file
npx claude-zen task batch-create tasks.json

# Check status of multiple tasks concurrently
npx claude-zen task batch-status --ids "task1,task2,task3"

# Process task queue in parallel
npx claude-zen task process-queue --parallel 5
```

### Memory Operations (Bulk Processing)

- `npx claude-zen memory store "key" "value"` - Store data
- `npx claude-zen memory query "search"` - Search memory
- `npx claude-zen memory stats` - Memory statistics
- `npx claude-zen memory export <file>` - Export memory

**Batch Operations:**

```bash
# Bulk store from JSON file
npx claude-zen memory batch-store data.json

# Parallel query across namespaces
npx claude-zen memory batch-query "search term" --namespaces "all"

# Export multiple namespaces concurrently
npx claude-zen memory batch-export --namespaces "project,agents,tasks"
```

### SPARC Development (Parallel Workflows)

- `npx claude-zen sparc modes` - List SPARC modes
- `npx claude-zen sparc run <mode> "task"` - Run mode
- `npx claude-zen sparc tdd "feature"` - TDD workflow
- `npx claude-zen sparc info <mode>` - Mode details

**Batch Operations:**

```bash
# Run multiple SPARC modes in parallel
npx claude-zen sparc batch-run --modes "spec:task1,architect:task2,code:task3"

# Execute parallel TDD for multiple features
npx claude-zen sparc batch-tdd features.json

# Analyze multiple components concurrently
npx claude-zen sparc batch-analyze --components "auth,api,database"
```

### Swarm Coordination (Enhanced Parallelization)

- `npx claude-zen swarm "task" --strategy <type>` - Start swarm
- `npx claude-zen swarm "task" --background` - Long-running swarm
- `npx claude-zen swarm "task" --monitor` - With monitoring

**Batch Operations:**

```bash
# Launch multiple swarms for different components
npx claude-zen swarm batch --config swarms.json

# Coordinate parallel swarm strategies
npx claude-zen swarm multi-strategy "project" --strategies "dev:frontend,test:backend,docs:api"
```

## Advanced Batch Examples

### Parallel Development Workflow:

```bash
# Initialize complete project setup in parallel
npx claude-zen batch init --actions "memory:setup,agents:spawn,tasks:queue"

# Run comprehensive analysis
npx claude-zen batch analyze --targets "code:quality,security:audit,performance:profile"
```

### Concurrent Testing Suite:

```bash
# Execute parallel test suites
npx claude-zen sparc batch-test --suites "unit,integration,e2e" --parallel

# Generate reports concurrently
npx claude-zen batch report --types "coverage,performance,security"
```

### Bulk Operations:

```bash
# Process multiple files in parallel
npx claude-zen batch process --files "*.ts" --action "lint,format,analyze"

# Parallel code generation
npx claude-zen batch generate --templates "api:users,api:products,api:orders"
```

## Performance Tips

- Use `--parallel` flag for concurrent operations
- Batch similar operations to reduce overhead
- Leverage `--async` for non-blocking execution
- Use `--stream` for real-time progress updates
- Enable `--cache` for repeated operations

## Monitoring Batch Operations

```bash
# Real-time batch monitoring
npx claude-zen monitor --batch

# Batch operation statistics
npx claude-zen stats --batch-ops

# Performance profiling
npx claude-zen profile --batch-execution
```
