# MCP Tools Reference

Claude Code Flow provides 87+ Model Context Protocol (MCP) tools organized by category for comprehensive AI orchestration.

## Tool Categories

### 🐙 GitHub Integration (GitHub Swarm Tools)
Advanced GitHub operations with swarm intelligence.

### 🐝 Swarm Coordination  
Core swarm management and orchestration tools.

### 🧠 AI Providers
Multi-model AI provider integration and management.

### 📊 Workflow Management
Task orchestration and workflow automation.

### 💾 Memory & Storage
Database operations and memory management.

### 🔍 Analysis & Monitoring
System analysis, monitoring, and diagnostics.

## Core Swarm Tools

### `swarm_init`
Initialize a new swarm with specified topology and configuration.

**Input Schema:**
```json
{
  "topology": {
    "type": "string",
    "enum": ["mesh", "hierarchical", "ring", "star"],
    "description": "Swarm topology type"
  },
  "maxAgents": {
    "type": "number",
    "default": 8,
    "description": "Maximum number of agents"
  },
  "strategy": {
    "type": "string", 
    "enum": ["auto", "balanced", "specialized"],
    "default": "auto",
    "description": "Agent coordination strategy"
  }
}
```

**Example Usage:**
```javascript
await mcpClient.callTool('swarm_init', {
  topology: 'hierarchical',
  maxAgents: 12,
  strategy: 'specialized'
});
```

**Response:**
```
🐝 Swarm initialized: hierarchical topology with 12 max agents
├── Strategy: specialized coordination
├── Queens: 2 active
├── Agents: 0/12 spawned
└── Status: Ready for task assignment
```

### `agent_spawn` 
Create specialized AI agents with specific capabilities.

**Input Schema:**
```json
{
  "type": {
    "type": "string",
    "enum": [
      "coordinator", "researcher", "coder", "analyst", 
      "architect", "tester", "reviewer", "optimizer", 
      "documenter", "monitor", "specialist"
    ],
    "description": "Agent type"
  },
  "name": {
    "type": "string",
    "description": "Agent name"
  },
  "capabilities": {
    "type": "array",
    "items": {"type": "string"},
    "description": "Agent capabilities"
  }
}
```

**Example Usage:**
```javascript
await mcpClient.callTool('agent_spawn', {
  type: 'coder',
  name: 'CodeGen-Alpha',
  capabilities: ['javascript', 'rust', 'documentation', 'testing']
});
```

### `task_orchestrate`
Orchestrate complex workflows across multiple agents.

**Input Schema:**
```json
{
  "task": {
    "type": "string", 
    "description": "Task description"
  },
  "strategy": {
    "type": "string",
    "enum": ["parallel", "sequential", "adaptive", "balanced"],
    "default": "adaptive"
  },
  "priority": {
    "type": "string", 
    "enum": ["low", "medium", "high", "critical"],
    "default": "medium"
  }
}
```

**Example Usage:**
```javascript
await mcpClient.callTool('task_orchestrate', {
  task: 'Optimize database queries and implement caching',
  strategy: 'parallel',
  priority: 'high'
});
```

### `swarm_status`
Monitor swarm health and performance metrics.

**Input Schema:**
```json
{
  "detailed": {
    "type": "boolean",
    "default": false,
    "description": "Show detailed status"
  }
}
```

**Example Response (Detailed):**
```
📊 Swarm Status: ACTIVE
├── Topology: hierarchical
├── Agents: 6/8 active  
├── Tasks: 3 completed, 2 in-progress
└── Memory: 512KB used

Agent Details:
├── 🟢 coordinator: Managing workflow
├── 🟢 researcher: Data analysis
├── 🟢 coder: Implementation
├── 🟡 analyst: Waiting for data
├── 🟢 tester: Running tests
└── 🔴 optimizer: Idle
```

## Agent Management Tools

### `agent_list`
List all active agents and their capabilities.

**Input Schema:**
```json
{
  "type": {
    "type": "string",
    "description": "Filter by agent type"
  }
}
```

### `agent_metrics`
Get performance metrics for specific agents.

**Input Schema:**
```json
{
  "agentId": {
    "type": "string",
    "description": "Specific agent ID"
  }
}
```

**Example Response:**
```
📈 Agent Metrics (coder-3):
├── Tasks completed: 15
├── Success rate: 94.2%
├── Avg response time: 1.2s
└── Memory usage: 128KB
```

### `swarm_monitor`
Real-time swarm monitoring with configurable intervals.

**Input Schema:**
```json
{
  "interval": {
    "type": "number",
    "default": 30,
    "description": "Monitoring interval (seconds)"
  }
}
```

## Topology Management Tools

### `topology_optimize`
Auto-optimize swarm topology based on performance metrics.

**Input Schema:**
```json
{
  "strategy": {
    "type": "string",
    "enum": ["performance", "resilience", "cost", "balanced"],
    "default": "balanced"
  },
  "constraints": {
    "type": "object",
    "properties": {
      "maxLatency": {"type": "number"},
      "minRedundancy": {"type": "number"},
      "budgetLimit": {"type": "number"}
    }
  }
}
```

### `topology_visualize`
Generate visual representation of current swarm topology.

**Example Response:**
```
🕸️ Swarm Topology: hierarchical
      [Queen-1]
     /    |    \
[Agent-1][Agent-2][Agent-3]
    |        |        |
[Agent-4][Agent-5][Agent-6]
```

## Memory & Storage Tools

### `memory_search`
Semantic search across swarm memory using vector embeddings.

**Input Schema:**
```json
{
  "query": {
    "type": "string",
    "description": "Search query"
  },
  "limit": {
    "type": "number", 
    "default": 10,
    "description": "Maximum results"
  },
  "threshold": {
    "type": "number",
    "default": 0.8,
    "description": "Similarity threshold"
  }
}
```

### `memory_store`
Store information in persistent swarm memory.

**Input Schema:**
```json
{
  "key": {"type": "string"},
  "value": {"type": "object"},
  "tags": {
    "type": "array",
    "items": {"type": "string"}
  },
  "ttl": {
    "type": "number",
    "description": "Time to live (seconds)"
  }
}
```

### `memory_recall`
Retrieve specific memories by key or pattern.

**Input Schema:**
```json
{
  "key": {"type": "string"},
  "pattern": {"type": "string"},
  "includeMetadata": {
    "type": "boolean",
    "default": false
  }
}
```

## Analysis & Monitoring Tools

### `system_analyze`
Comprehensive system analysis and health checks.

**Input Schema:**
```json
{
  "scope": {
    "type": "string",
    "enum": ["performance", "security", "architecture", "all"],
    "default": "all"
  },
  "depth": {
    "type": "string",
    "enum": ["shallow", "medium", "deep"], 
    "default": "medium"
  }
}
```

### `performance_benchmark`
Run performance benchmarks on swarm operations.

**Input Schema:**
```json
{
  "operations": {
    "type": "array",
    "items": {"type": "string"},
    "description": "Operations to benchmark"
  },
  "iterations": {
    "type": "number",
    "default": 100
  },
  "concurrency": {
    "type": "number", 
    "default": 10
  }
}
```

### `diagnostics_run`
Execute diagnostic checks on swarm components.

**Example Response:**
```
🔍 System Diagnostics:
├── ✅ Database connectivity: OK
├── ✅ Memory usage: 45% (Normal)
├── ⚠️  Network latency: 150ms (High)
├── ✅ Agent health: 8/8 responsive
└── ✅ Queen consensus: Active
```

## GitHub Integration Tools

### `github_swarm_clone`
Clone repositories with swarm-enhanced analysis.

**Input Schema:**
```json
{
  "repository": {"type": "string"},
  "branch": {"type": "string", "default": "main"},
  "analyze": {"type": "boolean", "default": true},
  "agentCount": {"type": "number", "default": 3}
}
```

### `github_swarm_analyze`
Multi-agent repository analysis with specialized roles.

**Input Schema:**
```json
{
  "repository": {"type": "string"},
  "analysisTypes": {
    "type": "array",
    "items": {
      "type": "string",
      "enum": ["architecture", "security", "performance", "documentation", "testing"]
    }
  }
}
```

## AI Provider Tools

### `ai_provider_add`
Add new AI provider to the swarm configuration.

**Input Schema:**
```json
{
  "name": {"type": "string"},
  "type": {
    "type": "string",
    "enum": ["openai", "anthropic", "google", "local", "custom"]
  },
  "config": {"type": "object"},
  "capabilities": {
    "type": "array",
    "items": {"type": "string"}
  }
}
```

### `ai_provider_balance`
Load balance requests across multiple AI providers.

**Input Schema:**
```json
{
  "strategy": {
    "type": "string", 
    "enum": ["round-robin", "least-latency", "cost-optimal", "capability-based"],
    "default": "capability-based"
  },
  "providers": {
    "type": "array",
    "items": {"type": "string"}
  }
}
```

## Usage Examples

### Complete Swarm Workflow

```javascript
// 1. Initialize swarm
await mcpClient.callTool('swarm_init', {
  topology: 'hierarchical',
  maxAgents: 8,
  strategy: 'adaptive'
});

// 2. Spawn specialized agents
await mcpClient.callTool('agent_spawn', {
  type: 'coordinator',
  name: 'TaskMaster',
  capabilities: ['orchestration', 'monitoring']
});

await mcpClient.callTool('agent_spawn', {
  type: 'coder', 
  name: 'CodeGen',
  capabilities: ['javascript', 'rust', 'testing']
});

// 3. Orchestrate complex task
await mcpClient.callTool('task_orchestrate', {
  task: 'Analyze repository and implement optimizations',
  strategy: 'parallel',
  priority: 'high'
});

// 4. Monitor progress
setInterval(async () => {
  const status = await mcpClient.callTool('swarm_status', {
    detailed: true
  });
  console.log(status);
}, 5000);
```

### Memory-Enhanced Workflow

```javascript
// Store context
await mcpClient.callTool('memory_store', {
  key: 'project-context',
  value: {
    repository: 'claude-code-zen',
    objectives: ['performance', 'documentation'],
    constraints: ['minimal-changes', 'preserve-api']
  },
  tags: ['project', 'context']
});

// Search for relevant memories  
const memories = await mcpClient.callTool('memory_search', {
  query: 'performance optimization strategies',
  limit: 5,
  threshold: 0.85
});

// Recall specific context
const context = await mcpClient.callTool('memory_recall', {
  key: 'project-context',
  includeMetadata: true
});
```

## Error Handling

All MCP tools return structured responses with error handling:

```javascript
try {
  const result = await mcpClient.callTool('swarm_init', {
    topology: 'invalid-topology'
  });
} catch (error) {
  console.error('MCP Tool Error:', {
    tool: 'swarm_init',
    error: error.message,
    code: error.code
  });
}
```

Common error codes:
- `INVALID_INPUT` - Input validation failed
- `TOOL_NOT_FOUND` - Requested tool doesn't exist
- `EXECUTION_ERROR` - Tool execution failed
- `TIMEOUT` - Tool execution timed out
- `PERMISSION_DENIED` - Insufficient permissions

## Performance Considerations

- Tools are optimized for concurrent execution
- Memory tools use vector search for sub-millisecond queries
- Agent spawning is limited by system resources
- Monitoring tools have configurable intervals to balance accuracy vs. performance