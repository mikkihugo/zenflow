# 🧠 Advanced MCP Tools Guide

This guide explains how to use the 45+ advanced MCP tools implemented in Phase 1 of the claude-zen expansion.

## 🚀 Quick Start

### 1. Enable Advanced Tools in Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "claude-zen": {
      "command": "npx",
      "args": ["claude-zen", "mcp", "start"]
    }
  }
}
```

### 2. Discover Available Tools

Use Claude Desktop to run:
```
List all advanced MCP tools
```
This calls `advanced_tools_list` and shows all 45+ tools organized by category.

### 3. Execute Advanced Tools

Use Claude Desktop to run:
```
Initialize a hierarchical swarm with 8 agents
```
This calls `advanced_tool_execute` with the swarm_init tool.

## 📋 Tool Categories

### 🤝 Coordination Tools (12 tools)

**Purpose**: Advanced swarm management, topology optimization, fault tolerance

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `swarm_init` | Initialize coordination topology | "Create a mesh topology swarm with 10 agents" |
| `agent_spawn` | Create specialized agents | "Spawn a code architect agent named 'SystemDesigner'" |
| `task_orchestrate` | Coordinate complex tasks | "Orchestrate a parallel code review task" |
| `swarm_coordination` | Multi-swarm synchronization | "Synchronize swarms 'frontend' and 'backend'" |
| `hive_mind_init` | Queen-led hierarchical coordination | "Initialize a 3-level hive mind structure" |
| `cognitive_sync` | Cross-agent knowledge sharing | "Sync knowledge between all architect agents" |
| `consensus_builder` | Distributed decision making | "Build consensus on microservices architecture" |
| `load_balancer` | Intelligent task distribution | "Balance load across available agents" |
| `fault_tolerance` | Error recovery mechanisms | "Check fault tolerance status and run recovery" |
| `adaptive_topology` | Dynamic topology optimization | "Optimize topology for performance" |
| `workflow_orchestrator` | Complex workflow management | "Orchestrate a multi-step deployment workflow" |
| `resource_optimizer` | System-wide optimization | "Optimize resource usage across the system" |

### 📊 Monitoring Tools (15 tools)

**Purpose**: Real-time monitoring, performance analytics, health assessment

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `swarm_status` | Real-time swarm monitoring | "Show detailed swarm status with history" |
| `agent_list` | Active agent inventory | "List all active agents with metrics" |
| `agent_metrics` | Individual agent performance | "Show performance metrics for agent_1" |
| `performance_dashboard` | System overview dashboard | "Create a real-time performance dashboard" |
| `health_monitor` | Comprehensive health assessment | "Run a comprehensive health check with auto-fix" |
| `bottleneck_analyzer` | Performance bottleneck detection | "Analyze system bottlenecks and suggest optimizations" |
| `resource_monitor` | Resource usage tracking | "Monitor CPU and memory usage across components" |
| `error_tracker` | Error pattern analysis | "Track error patterns over the last 24 hours" |
| `latency_monitor` | Response time tracking | "Monitor latency across all services" |
| `throughput_analyzer` | System throughput metrics | "Analyze system throughput and capacity" |
| `capacity_planner` | Future capacity planning | "Plan capacity for expected 50% growth" |
| `alert_manager` | Intelligent alerting | "Configure alerts for high CPU usage" |
| `dashboard_generator` | Custom dashboard creation | "Generate a custom monitoring dashboard" |
| `task_status` | Task execution monitoring | "Show status of all running tasks" |
| `task_results` | Task completion analysis | "Analyze results of completed tasks" |

### 🧠 Memory & Neural Tools (18 tools)

**Purpose**: Pattern recognition, neural optimization, cognitive analytics

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `memory_usage` | Advanced memory operations | "Store session data with compression enabled" |
| `neural_status` | Neural network monitoring | "Show detailed neural network status" |
| `neural_train` | Pattern learning and adaptation | "Start training neural network with new data" |
| `neural_patterns` | Cognitive pattern analysis | "Analyze behavioral patterns over the last week" |
| `memory_bank` | Large-scale memory management | "Optimize memory bank storage and compression" |
| `pattern_recognition` | Behavioral pattern detection | "Run real-time pattern recognition analysis" |
| `context_manager` | Context preservation | "Load context for project 'microservices-app'" |
| `learning_optimizer` | Learning algorithm optimization | "Optimize learning rate for better convergence" |
| `memory_compression` | Memory storage optimization | "Compress and optimize memory storage" |
| `neural_evolution` | Evolutionary neural improvement | "Evolve neural network for better performance" |
| `cognitive_analytics` | Cognitive performance analysis | "Analyze cognitive performance across agents" |
| `memory_clustering` | Memory organization | "Cluster related memories for faster access" |
| `pattern_synthesis` | Pattern combination | "Synthesize new patterns from existing data" |
| `neural_pruning` | Neural network optimization | "Prune neural network for efficiency" |
| `memory_indexing` | Fast memory retrieval | "Build index for faster memory searches" |
| `cognitive_fusion` | Multi-agent cognitive integration | "Fuse cognitive models across agent pool" |
| `neural_benchmarking` | Neural performance testing | "Benchmark neural network performance" |
| `memory_analytics` | Memory usage analysis | "Analyze memory usage patterns and optimization" |

## 💡 Usage Examples

### Swarm Coordination Workflow

```plaintext
1. "Initialize a hierarchical swarm with 8 agents"
   → Calls swarm_init with hierarchy topology

2. "Spawn 3 architect agents and 5 coder agents" 
   → Calls agent_spawn multiple times

3. "Orchestrate a parallel code review task"
   → Calls task_orchestrate with parallel strategy

4. "Monitor swarm performance in real-time"
   → Calls swarm_status and performance_dashboard
```

### Neural Learning Workflow

```plaintext
1. "Check neural network status"
   → Calls neural_status for overview

2. "Analyze behavioral patterns from the last 24 hours"
   → Calls neural_patterns with timeRange: '24h'

3. "Start neural training with adaptive learning"
   → Calls neural_train with optimization config

4. "Monitor training progress and performance"
   → Calls neural_status with detailed metrics
```

### Performance Monitoring Workflow

```plaintext
1. "Create a comprehensive performance dashboard"
   → Calls performance_dashboard with real-time view

2. "Analyze system bottlenecks and performance issues"
   → Calls bottleneck_analyzer with deep analysis

3. "Run a complete health check with auto-fix"
   → Calls health_monitor with autoFix enabled

4. "Generate performance optimization recommendations"
   → Calls resource_optimizer for system-wide analysis
```

## 🔧 Integration Examples

### HTTP MCP Server Commands

```bash
# Start the HTTP MCP server with advanced tools
npx claude-zen mcp start

# The server automatically loads all 45+ advanced tools
# Access via Claude Desktop or direct HTTP calls
```

### Direct API Usage

```javascript
// Discover all tools
GET http://localhost:3000/advanced-tools

// Execute a specific tool
POST http://localhost:3000/advanced-tools/swarm_init
{
  "topology": "hierarchical",
  "maxAgents": 10,
  "strategy": "adaptive"
}

// Get tool statistics
GET http://localhost:3000/advanced-tools/stats?detailed=true
```

## 🎯 Best Practices

### 1. Tool Discovery
- Use `advanced_tools_list` to explore available tools
- Filter by category: "List all monitoring tools"
- Search by capability: "Find tools for pattern recognition"

### 2. Error Handling
- All tools include comprehensive error handling
- Check tool permissions before execution
- Use detailed parameters for better results

### 3. Performance Optimization
- Monitor tool execution with `advanced_tools_stats`
- Use caching for frequently accessed data
- Batch similar operations when possible

### 4. Integration Patterns
- Combine coordination and monitoring tools for complete workflows
- Use neural tools for adaptive optimization
- Leverage memory tools for persistent learning

## 📊 Monitoring and Analytics

### Tool Execution Statistics
```plaintext
Use: "Show advanced tools statistics"
Returns:
- Total tool calls and success rates
- Average execution times per tool
- Error rates and performance metrics
- Category usage patterns
```

### Performance Metrics
```plaintext
Use: "Create a performance dashboard"
Returns:
- Real-time system metrics
- Resource utilization
- Agent performance
- Bottleneck analysis
```

## 🔍 Troubleshooting

### Common Issues

1. **Tool Not Found**
   - Verify tool name with `advanced_tools_list`
   - Check spelling and category prefix

2. **Permission Errors**
   - Review tool permissions in tool metadata
   - Ensure proper access rights for resources

3. **Parameter Validation**
   - Check required parameters in tool schema
   - Validate parameter types and ranges

4. **Performance Issues**
   - Monitor execution times with statistics
   - Use bottleneck analyzer for optimization
   - Check resource utilization

### Debug Commands
```plaintext
- "List all coordination tools" → Tool discovery
- "Show tool statistics" → Performance analysis  
- "Check system health" → Health monitoring
- "Analyze performance bottlenecks" → Optimization
```

## 🚀 Future Enhancements (Phase 2)

### Planned Tool Categories

1. **GitHub Integration Tools** (20 tools)
   - Repository analysis and management
   - Automated PR enhancement and code review
   - Security scanning and team analytics

2. **System Tools** (12 tools) 
   - Performance benchmarking and profiling
   - System diagnostics and configuration management
   - Backup and migration assistance

3. **Orchestration Tools** (10 tools)
   - Visual workflow design and management
   - Deployment automation and microservice coordination
   - Event-driven processing and stream management

### Expected Timeline
- **Phase 2 Development**: 3-4 weeks
- **Testing and Validation**: 1-2 weeks  
- **Documentation and Release**: 1 week
- **Total**: 5-7 weeks for complete 87-tool implementation

## 📚 Additional Resources

- **API Documentation**: Generated from tool schemas and metadata
- **Examples Repository**: Comprehensive usage examples and tutorials
- **Performance Benchmarks**: Tool execution performance and optimization guides
- **Integration Guides**: Step-by-step integration with existing workflows

## ✨ Conclusion

Phase 1 delivers **45 production-ready advanced MCP tools** across 3 major categories, providing immediate value for:

- **Advanced swarm coordination** with intelligent topology management
- **Comprehensive monitoring** with real-time analytics and health assessment  
- **Neural processing** with pattern recognition and cognitive optimization

The foundation is established for completing all 87 tools in Phase 2, creating the most comprehensive MCP tool ecosystem available.

---

*For support and questions, please refer to the project documentation or submit issues on the GitHub repository.*