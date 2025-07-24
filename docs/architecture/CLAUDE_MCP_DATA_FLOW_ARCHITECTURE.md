# Claude MCP Data Flow Architecture

## 🧠 The Core Question: Where Should Claude Get Memory/State Data?

When Claude (via Claude Code/Desktop) needs data like memory, task state, or coordination info, we have two options:

## 📋 Option A: Direct from Each Service (Current Fragmented Approach)

```
Claude Code ─┬─► RuvSwarm MCP Server (swarm data)
             ├─► Task Master MCP (task data)  
             ├─► Memory Service MCP (memory data)
             └─► Other Service MCP (other data)
```

**Problems:**
- Multiple MCP connections
- Inconsistent data access patterns
- Complex authentication across services
- Claude needs to know which service has what data

## 📋 Option B: Unified through RuvSwarm (Orchestrator Pattern)

```
Claude Code ──► RuvSwarm MCP Server ──┬─► Memory data
                (Single Entry Point)   ├─► Task data
                                      ├─► Agent data
                                      └─► Coordination data
```

## 🚀 Recommended Architecture: RuvSwarm as MCP Orchestrator

### **RuvSwarm Already Has:**
- `memory_usage` tool for memory operations
- `task_orchestrate`, `task_status` for task management
- `agent_list`, `agent_metrics` for agent data
- Established MCP server infrastructure

### **Enhanced RuvSwarm MCP Tools:**

```javascript
// In RuvSwarm's MCP tools
const enhancedTools = {
  // Existing swarm tools
  swarm_init: { /* ... */ },
  agent_spawn: { /* ... */ },
  
  // Enhanced memory integration
  memory_usage: {
    description: "Unified memory access across all services",
    inputSchema: {
      type: "object",
      properties: {
        action: { enum: ["store", "retrieve", "list", "delete"] },
        key: { type: "string" },
        value: { type: "string" },
        service: { enum: ["swarm", "task", "llm", "global"] }
      }
    },
    handler: async (params) => {
      // Route to appropriate service
      switch(params.service) {
        case "task":
          return await taskServiceMemory(params);
        case "swarm":
          return await swarmServiceMemory(params);
        default:
          return await globalMemory(params);
      }
    }
  },
  
  // Unified task management
  task_master_operations: {
    description: "Access Task Master functionality through RuvSwarm",
    inputSchema: {
      type: "object", 
      properties: {
        operation: { enum: ["create", "list", "update", "dependencies"] },
        data: { type: "object" }
      }
    },
    handler: async (params) => {
      // Proxy to Task Master service
      return await callTaskMasterService(params);
    }
  },
  
  // Cross-service queries
  global_state: {
    description: "Get unified view of system state",
    handler: async () => {
      const [swarmState, taskState, memoryState] = await Promise.all([
        getSwarmState(),
        getTaskState(), 
        getMemoryState()
      ]);
      
      return {
        swarm: swarmState,
        tasks: taskState,
        memory: memoryState,
        timestamp: Date.now()
      };
    }
  }
};
```

### **Implementation in Elixir Bridge:**

```elixir
defmodule SwarmService.UnifiedMCP do
  @moduledoc """
  RuvSwarm acts as MCP orchestrator for all data access
  """
  
  def handle_memory_request(params) do
    case params["service"] do
      "task" ->
        # Get from Task Master service via Partisan
        task_pid = :global.whereis_name(:task_master)
        GenServer.call(task_pid, {:memory_operation, params})
        
      "swarm" ->
        # Local swarm memory
        SwarmService.Memory.execute(params)
        
      "llm" ->
        # Get from LLM Router service
        llm_pid = :global.whereis_name(:llm_router)
        GenServer.call(llm_pid, {:memory_operation, params})
        
      _ ->
        # Global distributed memory via Horde
        SwarmService.DistributedMemory.execute(params)
    end
  end
  
  def handle_task_master_request(params) do
    # Proxy to Task Master service
    case Horde.Registry.lookup(SwarmService.Registry, :task_master) do
      [{pid, _}] -> 
        GenServer.call(pid, {:mcp_request, params})
      [] ->
        {:error, "Task Master service unavailable"}
    end
  end
  
  def get_global_state do
    # Gather state from all services via Partisan
    tasks = [
      Task.async(fn -> get_swarm_state() end),
      Task.async(fn -> get_task_state() end),
      Task.async(fn -> get_memory_state() end),
      Task.async(fn -> get_agent_state() end)
    ]
    
    results = Task.await_many(tasks, 5000)
    
    %{
      swarm: Enum.at(results, 0),
      tasks: Enum.at(results, 1),
      memory: Enum.at(results, 2),
      agents: Enum.at(results, 3),
      timestamp: DateTime.utc_now()
    }
  end
end
```

## 🎯 Benefits of RuvSwarm as MCP Orchestrator

### **1. Single Entry Point for Claude**
```bash
# Claude only needs one MCP connection
claude mcp add ruv-swarm "npx ruv-swarm mcp"

# All data accessible through RuvSwarm tools
mcp__ruv_swarm__memory_usage
mcp__ruv_swarm__task_master_operations
mcp__ruv_swarm__global_state
```

### **2. Unified Authentication**
- Claude authenticates once with RuvSwarm
- RuvSwarm handles internal service auth
- Simpler credential management

### **3. Cross-Service Operations**
```javascript
// Get coordinated view across services
const state = await mcp__ruv_swarm__global_state();

// Access any service's memory through one interface
const taskMemory = await mcp__ruv_swarm__memory_usage({
  action: "retrieve",
  key: "current_tasks",
  service: "task"
});
```

### **4. Performance Optimization**
- RuvSwarm can cache frequently accessed data
- Batch requests to reduce round trips
- Use Partisan for fast internal communication

## 📊 Data Flow Examples

### **Example 1: Claude Needs Task Information**
```
Claude → RuvSwarm MCP (task_master_operations) → Task Master Service → Response
```

### **Example 2: Claude Stores Memory**
```
Claude → RuvSwarm MCP (memory_usage) → Appropriate Service → Horde Registry → Stored
```

### **Example 3: Claude Needs Global State**
```
Claude → RuvSwarm MCP (global_state) → Parallel queries via Partisan → Aggregated Response
```

## 🚀 Implementation Strategy

### **Phase 1: Enhance RuvSwarm MCP Tools**
1. Add `task_master_operations` tool
2. Enhance `memory_usage` for multi-service support
3. Add `global_state` tool for unified views

### **Phase 2: Internal Service Integration**
1. Connect RuvSwarm to Task Master via Partisan
2. Add memory routing logic
3. Implement state aggregation

### **Phase 3: Optimize Performance**
1. Add caching layer in RuvSwarm
2. Implement request batching
3. Add metrics and monitoring

## 🎯 Conclusion

**Yes, send data through RuvSwarm!** It should act as the **MCP orchestrator** that:
- Provides a single entry point for Claude
- Routes requests to appropriate services
- Aggregates data from multiple sources
- Maintains consistent authentication
- Optimizes performance with caching

This gives Claude a **unified, powerful interface** while maintaining clean service boundaries internally.