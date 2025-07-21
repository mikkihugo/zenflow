# Task Master - Lightweight Erlang RPC Design

## 🚀 Why Not Phoenix PubSub?

You're correct - Phoenix PubSub is heavy for inter-service communication:
- Designed for browser websocket connections
- Adds unnecessary overhead for service-to-service calls
- We already have Partisan channels and Erlang RPC

## 📋 Lightweight Architecture with Pure Erlang

### 1. Direct Erlang RPC for LLM Communication

```elixir
defmodule SwarmService.LLMRPCClient do
  @moduledoc """
  Lightweight LLM client using pure Erlang RPC.
  No Phoenix, no HTTP - just BEAM-to-BEAM communication.
  """
  
  @llm_router_service {:global, :llm_router}
  
  def generate_task_from_prompt(prompt) do
    # Direct RPC call to llm-router service
    case :rpc.call(get_llm_node(), LLMRouter.Server, :generate_task, [prompt]) do
      {:ok, task_data} -> {:ok, task_data}
      {:badrpc, reason} -> {:error, reason}
      error -> {:error, error}
    end
  end
  
  def parse_prd(content, num_tasks) do
    # Async RPC for long-running operations
    :rpc.async_call(get_llm_node(), LLMRouter.Server, :parse_prd, [content, num_tasks])
  end
  
  def expand_task(task) do
    # Cast for fire-and-forget with callback
    caller = self()
    :rpc.cast(get_llm_node(), LLMRouter.Server, :expand_task, [task, caller])
  end
  
  defp get_llm_node do
    # Use global registry or Horde to find the node
    case :global.whereis_name(:llm_router) do
      :undefined -> 
        # Fallback to any node running llm-router
        {name, node} = Horde.Registry.lookup(SwarmService.DistributedRegistry, :llm_router)
                       |> hd()
        node
      pid ->
        node(pid)
    end
  end
end
```

### 2. GenServer-to-GenServer Direct Messaging

```elixir
defmodule SwarmService.TaskManagerLite do
  @moduledoc """
  Lightweight task manager using direct process messaging.
  No pubsub, just pure Erlang message passing.
  """
  
  use GenServer
  
  # Direct message protocol
  def handle_call({:parse_prd, content, num_tasks}, from, state) do
    # Send direct message to LLM router process
    llm_pid = :global.whereis_name(:llm_router)
    send(llm_pid, {:prd_request, self(), from, content, num_tasks})
    
    # Store pending request
    {:noreply, put_pending(state, from, :parse_prd)}
  end
  
  # Handle direct response from LLM router
  def handle_info({:prd_response, result}, state) do
    {from, state} = pop_pending(state, :parse_prd)
    GenServer.reply(from, result)
    {:noreply, state}
  end
  
  # Even simpler - use gen_server call directly
  def generate_task_simple(prompt) do
    llm_pid = :global.whereis_name(:llm_router)
    GenServer.call(llm_pid, {:generate_task, prompt}, 30_000)
  end
end
```

### 3. Partisan Channels for Distributed Operations

```elixir
defmodule SwarmService.PartisanTaskOps do
  @moduledoc """
  Use Partisan's built-in channels instead of PubSub.
  More efficient for service-to-service communication.
  """
  
  @task_channel {:task_ops, [:monotonic]}
  
  def init do
    # Create dedicated channel for task operations
    :partisan.channel_create(@task_channel)
  end
  
  def broadcast_task_update(task_id, update) do
    # Use Partisan's efficient broadcast
    :partisan.broadcast(
      @task_channel,
      {:task_update, task_id, update},
      :partisan.membership()
    )
  end
  
  def forward_to_node(node, message) do
    # Direct node-to-node messaging via Partisan
    :partisan.forward_message(
      node,
      @task_channel,
      message
    )
  end
end
```

### 4. What We Actually Need Events For

The only events we truly need are for:

```elixir
defmodule SwarmService.MinimalEvents do
  @moduledoc """
  Minimal event system - only what's actually needed.
  """
  
  # 1. Service lifecycle (handled by Horde listeners)
  def service_started(name, node), do: :ok  # Horde handles this
  def service_stopped(name, node), do: :ok  # Horde handles this
  
  # 2. Cluster membership (handled by Partisan)
  def node_joined(node), do: :ok  # Partisan callbacks
  def node_left(node), do: :ok    # Partisan callbacks
  
  # 3. Task updates (direct messaging)
  def task_completed(task_id) do
    # Direct message to interested processes
    interested = :ets.lookup(:task_watchers, task_id)
    Enum.each(interested, fn {_, pid} ->
      send(pid, {:task_completed, task_id})
    end)
  end
end
```

### 5. Ultra-Lightweight LLM Router Integration

```elixir
defmodule LLMRouter.DirectServer do
  @moduledoc """
  Direct GenServer interface for LLM operations.
  No HTTP, no Phoenix, just BEAM.
  """
  
  use GenServer
  
  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: {:global, :llm_router})
  end
  
  # Direct calls from other services
  def handle_call({:generate_task, prompt}, _from, state) do
    result = process_with_gleam_router(prompt)
    {:reply, result, state}
  end
  
  def handle_call({:parse_prd, content, num_tasks}, from, state) do
    # Async processing for long operations
    Task.start(fn ->
      result = process_prd_async(content, num_tasks)
      GenServer.reply(from, result)
    end)
    {:noreply, state}
  end
  
  # Direct integration with Gleam router
  defp process_with_gleam_router(prompt) do
    :gleam_router.route_completion(%{
      model: "gpt-4o",
      messages: [
        %{role: "system", content: "Generate task from prompt"},
        %{role: "user", content: prompt}
      ]
    })
  end
end
```

## 🎯 Benefits of Lightweight Approach

### Performance
- **RPC latency**: ~100 microseconds (same node) to ~1ms (cross-node)
- **Direct messaging**: ~1-10 microseconds
- **No serialization**: Native Erlang terms
- **No HTTP overhead**: Pure BEAM communication

### Simplicity
- No Phoenix dependency
- No PubSub configuration
- No topic management
- Just processes talking to processes

### Reliability
- Built-in supervision
- Automatic reconnection
- Node monitoring via Erlang
- Process linking for failure detection

## 📊 When to Use What

### Use Erlang RPC when:
- Making synchronous calls between services
- Need return values
- Operations are request/response style
- Example: `generate_task_from_prompt`

### Use Direct Process Messaging when:
- Async notifications
- Fire-and-forget operations
- Multiple recipients
- Example: Task completion notifications

### Use Partisan Channels when:
- Broadcasting to all nodes
- Need ordering guarantees
- Cross-datacenter communication
- Example: Cluster-wide task updates

### Skip Phoenix PubSub entirely for:
- Service-to-service communication
- Internal cluster events
- High-performance scenarios

## 🚀 Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BEAM VM Cluster                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐          │
│  │  Swarm Service  │   RPC   │   LLM Router    │          │
│  │                 │<------->│                  │          │
│  │  Task Manager   │  Direct │  Gleam Router   │          │
│  │                 │   Msg   │                  │          │
│  └─────────────────┘         └─────────────────┘          │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│               Global Registry                               │
│              (:task_manager,                                │
│               :llm_router)                                  │
│                       │                                     │
│           ┌───────────┴───────────┐                        │
│           │                       │                         │
│    Partisan Channels       Horde Registry                  │
│    (cluster events)       (service discovery)              │
└─────────────────────────────────────────────────────────────┘
```

This gives us everything we need without the Phoenix overhead!