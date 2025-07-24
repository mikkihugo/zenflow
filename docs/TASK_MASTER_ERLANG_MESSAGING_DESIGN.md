# Task Master with Erlang Messaging Architecture

## 🚀 Native BEAM Communication

Since both the swarm-service and llm-router are Elixir/OTP applications running on the same BEAM VM, we can use Erlang's native message passing for ultra-fast, type-safe communication.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BEAM VM (Erlang)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐        ┌─────────────────────┐       │
│  │   Swarm Service     │        │    LLM Router      │       │
│  │                     │        │                     │       │
│  │  TaskManager        │<------>│  LLMRouter.Server  │       │
│  │  GenServer          │ Erlang │  GenServer          │       │
│  │                     │  Msgs  │                     │       │
│  └─────────────────────┘        └─────────────────────┘       │
│            ↑                              ↑                     │
│            │                              │                     │
│            └──────────────────────────────┘                     │
│                    Process Registry                             │
│                 (:task_manager, :llm_router)                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Implementation Design

### 1. LLM Router GenServer Interface

```elixir
defmodule LLMRouter.Server do
  @moduledoc """
  GenServer interface for LLM Router that accepts Erlang messages
  """
  use GenServer
  
  # Register with a known name for easy access
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: {:global, :llm_router})
  end
  
  # Client API - These can be called from swarm-service
  def generate_task(prompt, caller_pid) do
    GenServer.cast({:global, :llm_router}, {:generate_task, prompt, caller_pid})
  end
  
  def parse_prd(content, num_tasks, caller_pid) do
    GenServer.cast({:global, :llm_router}, {:parse_prd, content, num_tasks, caller_pid})
  end
  
  def expand_task(task, caller_pid) do
    GenServer.cast({:global, :llm_router}, {:expand_task, task, caller_pid})
  end
  
  def research(topic, context, caller_pid) do
    GenServer.cast({:global, :llm_router}, {:research, topic, context, caller_pid})
  end
  
  # Server callbacks
  def handle_cast({:generate_task, prompt, caller_pid}, state) do
    # Process asynchronously
    Task.start(fn ->
      result = process_task_generation(prompt)
      send(caller_pid, {:llm_result, :generate_task, result})
    end)
    
    {:noreply, state}
  end
  
  def handle_cast({:parse_prd, content, num_tasks, caller_pid}, state) do
    Task.start(fn ->
      result = process_prd_parsing(content, num_tasks)
      send(caller_pid, {:llm_result, :parse_prd, result})
    end)
    
    {:noreply, state}
  end
  
  def handle_cast({:expand_task, task, caller_pid}, state) do
    Task.start(fn ->
      result = process_task_expansion(task)
      send(caller_pid, {:llm_result, :expand_task, result})
    end)
    
    {:noreply, state}
  end
  
  def handle_cast({:research, topic, context, caller_pid}, state) do
    Task.start(fn ->
      result = process_research(topic, context)
      send(caller_pid, {:llm_result, :research, result})
    end)
    
    {:noreply, state}
  end
  
  # Internal processing functions that use the existing Gleam router
  defp process_task_generation(prompt) do
    # Call into Gleam routing logic
    case :gleam_router.route_completion(%{
      model: "gpt-4o",
      messages: [
        %{role: "system", content: "Generate task from prompt"},
        %{role: "user", content: prompt}
      ],
      temperature: 0.7
    }) do
      {:ok, response} -> {:ok, parse_task_response(response)}
      {:error, reason} -> {:error, reason}
    end
  end
  
  # Similar implementations for other operations...
end
```

### 2. Task Manager with Erlang Messaging

```elixir
defmodule SwarmService.TaskManager do
  @moduledoc """
  Task Manager that communicates with LLM Router via Erlang messages
  """
  use GenServer
  
  defstruct tasks: %{}, 
            pending_requests: %{},
            request_id: 0
  
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end
  
  # Public API
  def generate_task_from_prompt(prompt) do
    GenServer.call(__MODULE__, {:generate_task, prompt}, 30_000)
  end
  
  def parse_prd(content, num_tasks) do
    GenServer.call(__MODULE__, {:parse_prd, content, num_tasks}, 60_000)
  end
  
  def expand_task(task_id) do
    GenServer.call(__MODULE__, {:expand_task, task_id}, 30_000)
  end
  
  # GenServer callbacks
  def init(_opts) do
    {:ok, %__MODULE__{}}
  end
  
  def handle_call({:generate_task, prompt}, from, state) do
    # Send message to LLM Router
    LLMRouter.Server.generate_task(prompt, self())
    
    # Store pending request
    request_id = state.request_id + 1
    pending = Map.put(state.pending_requests, {:generate_task, request_id}, from)
    
    {:noreply, %{state | pending_requests: pending, request_id: request_id}}
  end
  
  def handle_call({:parse_prd, content, num_tasks}, from, state) do
    LLMRouter.Server.parse_prd(content, num_tasks, self())
    
    request_id = state.request_id + 1
    pending = Map.put(state.pending_requests, {:parse_prd, request_id}, from)
    
    {:noreply, %{state | pending_requests: pending, request_id: request_id}}
  end
  
  # Handle responses from LLM Router
  def handle_info({:llm_result, operation, result}, state) do
    # Find the waiting client
    case find_pending_request(state.pending_requests, operation) do
      {{^operation, request_id}, from} ->
        # Reply to waiting client
        GenServer.reply(from, result)
        
        # Remove from pending
        pending = Map.delete(state.pending_requests, {operation, request_id})
        {:noreply, %{state | pending_requests: pending}}
        
      nil ->
        # No matching request, ignore
        {:noreply, state}
    end
  end
  
  defp find_pending_request(pending, operation) do
    Enum.find(pending, fn {{op, _}, _} -> op == operation end)
  end
end
```

### 3. Distributed Process Registry

```elixir
defmodule SwarmService.ProcessRegistry do
  @moduledoc """
  Manages process registration and discovery across services
  """
  
  def register_service(name, pid) do
    :global.register_name(name, pid)
  end
  
  def get_service(name) do
    case :global.whereis_name(name) do
      :undefined -> {:error, :not_found}
      pid -> {:ok, pid}
    end
  end
  
  def call_service(name, message, timeout \\ 5000) do
    case get_service(name) do
      {:ok, pid} ->
        try do
          GenServer.call(pid, message, timeout)
        catch
          :exit, reason -> {:error, reason}
        end
      {:error, reason} -> {:error, reason}
    end
  end
  
  def cast_service(name, message) do
    case get_service(name) do
      {:ok, pid} -> GenServer.cast(pid, message)
      {:error, _} -> :ok
    end
  end
end
```

### 4. Optimized Message Protocol

```elixir
defmodule SwarmService.MessageProtocol do
  @moduledoc """
  Defines the message protocol between services
  """
  
  # Request messages (Task Manager -> LLM Router)
  defmodule GenerateTaskRequest do
    defstruct [:prompt, :caller_pid, :request_id, :timeout]
  end
  
  defmodule ParsePRDRequest do
    defstruct [:content, :num_tasks, :caller_pid, :request_id]
  end
  
  defmodule ExpandTaskRequest do
    defstruct [:task, :caller_pid, :request_id]
  end
  
  defmodule ResearchRequest do
    defstruct [:topic, :context, :caller_pid, :request_id]
  end
  
  # Response messages (LLM Router -> Task Manager)
  defmodule TaskResponse do
    defstruct [:request_id, :result, :error]
  end
  
  defmodule PRDResponse do
    defstruct [:request_id, :tasks, :error]
  end
  
  defmodule ExpansionResponse do
    defstruct [:request_id, :subtasks, :error]
  end
  
  defmodule ResearchResponse do
    defstruct [:request_id, :findings, :sources, :error]
  end
end
```

### 5. Supervision Tree Integration

```elixir
defmodule SwarmService.Application do
  use Application
  
  def start(_type, _args) do
    children = [
      # Existing services
      {SwarmService.Repo, []},
      {SwarmServiceWeb.Endpoint, []},
      
      # Task management services
      {SwarmService.TaskManager, []},
      {SwarmService.TaskPersistence, []},
      
      # Process registry
      {SwarmService.ProcessRegistry, []},
      
      # Health monitor for LLM Router connection
      {SwarmService.LLMRouterMonitor, []}
    ]
    
    opts = [strategy: :one_for_one, name: SwarmService.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### 6. Health Monitoring

```elixir
defmodule SwarmService.LLMRouterMonitor do
  @moduledoc """
  Monitors LLM Router availability and handles failures
  """
  use GenServer
  
  def start_link(_opts) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end
  
  def init(_) do
    # Check every 5 seconds
    :timer.send_interval(5000, :check_health)
    {:ok, %{available: false, last_check: nil}}
  end
  
  def handle_info(:check_health, state) do
    available = case :global.whereis_name(:llm_router) do
      :undefined -> false
      pid when is_pid(pid) -> Process.alive?(pid)
    end
    
    if available != state.available do
      Logger.info("LLM Router availability changed: #{available}")
      notify_availability_change(available)
    end
    
    {:noreply, %{state | available: available, last_check: DateTime.utc_now()}}
  end
  
  defp notify_availability_change(available) do
    Phoenix.PubSub.broadcast(
      SwarmService.PubSub,
      "llm_router:status",
      {:llm_router_status, available}
    )
  end
end
```

## 🎯 Benefits of Erlang Messaging

1. **Ultra-Low Latency**: No HTTP overhead, direct process communication
2. **Type Safety**: Structured messages with compile-time checks
3. **Fault Tolerance**: Supervised processes with automatic restart
4. **Backpressure**: Natural flow control through mailbox management
5. **Location Transparency**: Services can move between nodes seamlessly
6. **Native Integration**: Leverages BEAM's built-in capabilities

## 🚀 Performance Characteristics

- **Message Latency**: ~1-10 microseconds (vs ~1-10ms for HTTP)
- **Throughput**: 1M+ messages/second per process
- **Memory**: Minimal overhead (just the message data)
- **Reliability**: Built-in supervision and error handling
- **Scalability**: Can distribute across multiple BEAM nodes

## 📊 Usage Example

```elixir
# In a controller or other module
def create_task_from_prd(prd_content) do
  # This now uses Erlang messaging internally
  case SwarmService.TaskManager.parse_prd(prd_content, 10) do
    {:ok, tasks} ->
      Logger.info("Created #{length(tasks)} tasks from PRD")
      {:ok, tasks}
      
    {:error, reason} ->
      Logger.error("Failed to parse PRD: #{reason}")
      {:error, reason}
  end
end
```

## 🔄 Migration Path

1. **Phase 1**: Add GenServer interfaces to both services
2. **Phase 2**: Implement message protocol with backward compatibility
3. **Phase 3**: Gradually migrate from HTTP to Erlang messaging
4. **Phase 4**: Remove HTTP client code once stable

This architecture provides the best of both worlds:
- **External APIs** remain HTTP-based for compatibility
- **Internal communication** uses native Erlang messaging for performance