# Simple MCP + Swarm Architecture

## 🎯 The Simplest Solution: Pure Elixir/Gleam

Since we have Partisan for scaling, let's skip the complexity of Rust NIFs and NPX!

## 📋 Architecture Decision

### **Pure Elixir Implementation**
```elixir
defmodule SwarmService.MCP do
  @moduledoc """
  All RuvSwarm functionality implemented natively in Elixir.
  No Rust, no NPX, no external processes.
  """
  
  use GenServer
  
  # All 27+ MCP tools as Elixir functions
  def swarm_init(params) do
    swarm_id = UUID.uuid4()
    
    # Create swarm state
    swarm = %{
      id: swarm_id,
      topology: params["topology"],
      agents: create_agents(params["maxAgents"]),
      strategy: params["strategy"],
      created_at: DateTime.utc_now()
    }
    
    # Store in ETS (fast) and Mnesia (persistent)
    :ets.insert(:swarms, {swarm_id, swarm})
    
    # Let Queen know about new swarm
    Queen.register_swarm(swarm_id, swarm)
    
    %{success: true, swarmId: swarm_id}
  end
  
  def agent_spawn(params) do
    agent = %{
      id: UUID.uuid4(),
      type: params["type"],
      name: params["name"],
      state: :idle,
      capabilities: agent_capabilities(params["type"])
    }
    
    # Simple agent creation - no neural networks needed
    :ets.insert(:agents, {agent.id, agent})
    
    %{success: true, agentId: agent.id}
  end
  
  def task_orchestrate(params) do
    # Queen does the real orchestration
    {:ok, plan} = Queen.create_execution_plan(params["task"])
    
    # Execute plan with available agents
    results = execute_plan(plan)
    
    %{success: true, results: results}
  end
  
  def memory_usage(params) do
    case params["action"] do
      "store" ->
        :ets.insert(:memory, {params["key"], params["value"]})
        %{success: true}
        
      "retrieve" ->
        case :ets.lookup(:memory, params["key"]) do
          [{_, value}] -> %{success: true, value: value}
          [] -> %{success: false, error: "Not found"}
        end
    end
  end
end
```

## 🚀 Direct Claude Integration

### **Option 1: TCP MCP Server (Recommended)**
```elixir
defmodule SwarmService.MCPTCPServer do
  @moduledoc """
  Direct TCP server for Claude MCP protocol.
  No stdio, no NPX - just TCP sockets.
  """
  
  def start_link(port \\ 8765) do
    {:ok, socket} = :gen_tcp.listen(port, [:binary, active: false])
    spawn(fn -> accept_loop(socket) end)
  end
  
  defp accept_loop(socket) do
    {:ok, client} = :gen_tcp.accept(socket)
    spawn(fn -> handle_client(client) end)
    accept_loop(socket)
  end
  
  defp handle_client(socket) do
    case :gen_tcp.recv(socket, 0) do
      {:ok, data} ->
        # Parse JSON-RPC request
        request = Jason.decode!(data)
        
        # Route to appropriate MCP function
        response = handle_mcp_method(request["method"], request["params"])
        
        # Send JSON-RPC response
        :gen_tcp.send(socket, Jason.encode!(response))
        handle_client(socket)
        
      {:error, :closed} ->
        :ok
    end
  end
end
```

### **Option 2: Direct GenServer for Claude CLI**
```elixir
defmodule SwarmService.ClaudeCLI do
  @moduledoc """
  If Claude CLI runs on same node, skip MCP entirely!
  Direct Elixir function calls.
  """
  
  def swarm(command, args) do
    case command do
      "init" -> SwarmService.MCP.swarm_init(args)
      "spawn" -> SwarmService.MCP.agent_spawn(args)
      "task" -> SwarmService.MCP.task_orchestrate(args)
      "status" -> SwarmService.MCP.swarm_status(args)
    end
  end
end
```

## 🎯 Why This is Better

### **Simplicity Wins:**
- **No Rust compilation** - Pure BEAM languages
- **No NPX subprocess** - Everything in one VM
- **No WASM complexity** - Just Elixir/Gleam functions
- **No external dependencies** - Self-contained

### **Performance is Fine:**
- **ETS**: Microsecond lookups for 100 swarms
- **Partisan**: Scale to 1000+ nodes if needed
- **Mnesia**: Distributed persistence built-in
- **OTP**: Battle-tested concurrency

### **Real Architecture:**
```
Claude Desktop/CLI
       ↓
TCP or Direct Call
       ↓
SwarmService.MCP (Pure Elixir)
       ↓
Queen + Task Master + Memory
       ↓
ETS (fast) + Mnesia (persistent)
       ↓
Partisan (distributed coordination)
```

## 📊 Realistic Performance

For 100 swarms:
- **Swarm creation**: ~1ms each = 100ms total
- **Agent operations**: ~100μs each 
- **Memory lookup**: ~1μs (ETS)
- **Task orchestration**: ~10ms (includes Queen planning)

With Partisan distribution:
- **Linear scaling** across nodes
- **Automatic failover**
- **No single bottleneck**

## 🏗️ Implementation Priority

1. **Implement MCP tools in pure Elixir** (swarm_init, agent_spawn, etc.)
2. **Add TCP server for Claude Desktop** 
3. **Integrate with existing Queen**
4. **Use ETS for speed, Mnesia for persistence**
5. **Test with Claude CLI/Desktop**

## 🧠 The Insight

You don't need Rust/WASM/NPX when you have:
- **OTP concurrency** (millions of processes)
- **ETS speed** (microsecond operations)
- **Partisan scale** (1000+ nodes)
- **BEAM reliability** (decades of production use)

Keep it simple, keep it in Elixir/Gleam, and let the BEAM do what it does best!