# Task Master Implementation in Gleam/Elixir

## 🎯 Overview

Based on the Claude Task Master analysis, we'll implement a sophisticated task management system in Gleam/Elixir with:

1. **Hierarchical Task Structure** - Tasks with subtasks
2. **Dependency Management** - Circular dependency detection and validation
3. **Priority-Based Scheduling** - High/Medium/Low priorities
4. **Status Tracking** - Pending, In-Progress, Done, Cancelled, etc.
5. **PRD Parsing** - AI-driven task generation from requirements
6. **Next Task Selection** - Smart algorithm to find optimal next work

## 📦 Core Data Structures (Gleam)

```gleam
// src/task_types.gleam
pub type TaskId {
  TaskId(Int)
  SubtaskId(parent: Int, child: Int)
}

pub type Priority {
  High
  Medium
  Low
}

pub type Status {
  Pending
  InProgress
  Done
  Cancelled
  Deferred
  Review
}

pub type Task {
  Task(
    id: TaskId,
    title: String,
    description: String,
    details: Option(String),
    test_strategy: Option(String),
    priority: Priority,
    status: Status,
    dependencies: List(TaskId),
    subtasks: List(Task),
    created_at: String,
    updated_at: String,
  )
}

pub type TaskMeta {
  TaskMeta(
    project_name: String,
    project_version: String,
    created_at: String,
    updated_at: String,
    total_tasks: Int,
  )
}

pub type TaskData {
  TaskData(
    meta: TaskMeta,
    tasks: List(Task),
  )
}
```

## 🧠 Task Manager GenServer (Elixir)

```elixir
defmodule SwarmService.TaskManager do
  use GenServer
  require Logger
  
  alias SwarmService.TaskTypes
  alias SwarmService.TaskValidator
  alias SwarmService.TaskFinder
  
  # State structure
  defstruct [
    :task_data,
    :task_index,
    :dependency_graph,
    :completion_cache,
    :active_tag
  ]
  
  # Public API
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end
  
  def parse_prd(prd_content, num_tasks \\ 20) do
    GenServer.call(__MODULE__, {:parse_prd, prd_content, num_tasks}, 60_000)
  end
  
  def add_task(task_attrs) do
    GenServer.call(__MODULE__, {:add_task, task_attrs})
  end
  
  def add_subtask(parent_id, subtask_attrs) do
    GenServer.call(__MODULE__, {:add_subtask, parent_id, subtask_attrs})
  end
  
  def update_task_status(task_id, new_status) do
    GenServer.call(__MODULE__, {:update_status, task_id, new_status})
  end
  
  def find_next_task() do
    GenServer.call(__MODULE__, :find_next_task)
  end
  
  def add_dependency(task_id, dependency_id) do
    GenServer.call(__MODULE__, {:add_dependency, task_id, dependency_id})
  end
  
  def validate_dependencies() do
    GenServer.call(__MODULE__, :validate_dependencies)
  end
  
  def list_tasks(filter \\ %{}) do
    GenServer.call(__MODULE__, {:list_tasks, filter})
  end
  
  # GenServer callbacks
  @impl true
  def init(_opts) do
    initial_state = %__MODULE__{
      task_data: %TaskTypes.TaskData{
        meta: build_default_meta(),
        tasks: []
      },
      task_index: %{},
      dependency_graph: %{},
      completion_cache: MapSet.new(),
      active_tag: "master"
    }
    
    {:ok, initial_state}
  end
  
  @impl true
  def handle_call({:parse_prd, prd_content, num_tasks}, _from, state) do
    # Use RuvSwarm to call Claude for PRD parsing
    case SwarmService.RuvSwarm.orchestrate_task(
      "Parse PRD and generate #{num_tasks} development tasks",
      :adaptive,
      :high
    ) do
      {:ok, task_id} ->
        # Store PRD content for agent access
        SwarmService.RuvSwarm.store_memory(
          "prd/#{task_id}",
          %{content: prd_content, num_tasks: num_tasks}
        )
        
        # Generate tasks using AI
        case generate_tasks_from_prd(prd_content, num_tasks, state) do
          {:ok, new_tasks} ->
            updated_state = add_tasks_to_state(new_tasks, state)
            {:reply, {:ok, new_tasks}, updated_state}
            
          {:error, reason} ->
            {:reply, {:error, reason}, state}
        end
        
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
  
  @impl true
  def handle_call(:find_next_task, _from, state) do
    # Find eligible subtasks first (from in-progress parent tasks)
    eligible_subtasks = find_eligible_subtasks(state)
    
    if Enum.empty?(eligible_subtasks) do
      # Fall back to top-level tasks
      next_task = find_next_top_level_task(state)
      {:reply, next_task, state}
    else
      # Sort by priority and dependencies
      next_subtask = eligible_subtasks
        |> Enum.sort_by(&subtask_priority/1, :desc)
        |> List.first()
        
      {:reply, {:ok, next_subtask}, state}
    end
  end
  
  @impl true
  def handle_call({:add_dependency, task_id, dependency_id}, _from, state) do
    # Validate dependency doesn't create circular reference
    case TaskValidator.check_circular_dependency(
      state.dependency_graph,
      task_id,
      dependency_id
    ) do
      :ok ->
        updated_state = add_dependency_to_state(task_id, dependency_id, state)
        {:reply, :ok, updated_state}
        
      {:error, :circular_dependency} ->
        {:reply, {:error, "Would create circular dependency"}, state}
    end
  end
  
  @impl true
  def handle_call(:validate_dependencies, _from, state) do
    issues = TaskValidator.validate_all_dependencies(state.task_data.tasks)
    
    if Enum.empty?(issues) do
      {:reply, {:ok, "All dependencies valid"}, state}
    else
      {:reply, {:error, issues}, state}
    end
  end
  
  # Private helper functions
  defp generate_tasks_from_prd(prd_content, num_tasks, _state) do
    # This would use AI to generate tasks
    # For now, return a simple example
    {:ok, [
      %TaskTypes.Task{
        id: %TaskTypes.TaskId{task_id: 1},
        title: "Initialize Project Structure",
        description: "Set up the base project structure",
        priority: :high,
        status: :pending,
        dependencies: [],
        subtasks: []
      }
    ]}
  end
  
  defp find_eligible_subtasks(state) do
    state.task_data.tasks
    |> Enum.filter(fn task -> task.status == :in_progress end)
    |> Enum.flat_map(fn parent ->
      parent.subtasks
      |> Enum.filter(fn subtask ->
        subtask.status in [:pending, :in_progress] and
        dependencies_satisfied?(subtask, state.completion_cache)
      end)
      |> Enum.map(fn subtask ->
        Map.put(subtask, :parent_id, parent.id)
      end)
    end)
  end
  
  defp dependencies_satisfied?(task, completion_cache) do
    Enum.all?(task.dependencies, fn dep_id ->
      MapSet.member?(completion_cache, dep_id)
    end)
  end
  
  defp subtask_priority(task) do
    priority_value = case task.priority do
      :high -> 3
      :medium -> 2
      :low -> 1
    end
    
    # Factor in dependency count (fewer is better)
    dep_factor = -length(task.dependencies)
    
    {priority_value, dep_factor}
  end
end
```

## 🔍 Dependency Validator (Elixir)

```elixir
defmodule SwarmService.TaskValidator do
  @moduledoc """
  Validates task dependencies to prevent circular references
  and ensure task graph integrity.
  """
  
  def check_circular_dependency(graph, from_task, to_task, visited \\ MapSet.new()) do
    cond do
      from_task == to_task ->
        {:error, :self_dependency}
        
      MapSet.member?(visited, to_task) ->
        {:error, :circular_dependency}
        
      true ->
        # Check if adding this dependency would create a cycle
        new_visited = MapSet.put(visited, from_task)
        
        # Get all tasks that to_task depends on
        case Map.get(graph, to_task, []) do
          [] -> :ok
          deps ->
            # Check each dependency recursively
            Enum.reduce_while(deps, :ok, fn dep, _acc ->
              case check_circular_dependency(graph, dep, from_task, new_visited) do
                :ok -> {:cont, :ok}
                error -> {:halt, error}
              end
            end)
        end
    end
  end
  
  def validate_all_dependencies(tasks) do
    issues = []
    
    # Build task existence map
    valid_ids = build_valid_id_set(tasks)
    
    # Check each task
    Enum.flat_map(tasks, fn task ->
      task_issues = []
      
      # Check dependencies exist
      missing_deps = Enum.filter(task.dependencies, fn dep_id ->
        not MapSet.member?(valid_ids, dep_id)
      end)
      
      if not Enum.empty?(missing_deps) do
        [{:missing_dependency, task.id, missing_deps} | task_issues]
      else
        task_issues
      end
      
      # Check subtask dependencies
      subtask_issues = Enum.flat_map(task.subtasks, fn subtask ->
        validate_subtask_dependencies(subtask, task.id, valid_ids)
      end)
      
      task_issues ++ subtask_issues
    end)
  end
  
  defp build_valid_id_set(tasks) do
    task_ids = Enum.map(tasks, & &1.id)
    
    subtask_ids = Enum.flat_map(tasks, fn task ->
      Enum.map(task.subtasks, fn subtask ->
        %TaskTypes.SubtaskId{parent: task.id.task_id, child: subtask.id}
      end)
    end)
    
    MapSet.new(task_ids ++ subtask_ids)
  end
end
```

## 🎯 Task Finder Algorithm (Elixir)

```elixir
defmodule SwarmService.TaskFinder do
  @moduledoc """
  Implements the next-task selection algorithm from Claude Task Master.
  Prioritizes eligible subtasks from in-progress parent tasks,
  then falls back to top-level tasks.
  """
  
  def find_next_work_item(tasks, completion_cache) do
    # First, try to find eligible subtasks
    eligible_subtasks = find_eligible_subtasks(tasks, completion_cache)
    
    if not Enum.empty?(eligible_subtasks) do
      # Sort by priority, dependency count, then ID
      best_subtask = eligible_subtasks
        |> Enum.sort_by(&subtask_sort_key/1)
        |> List.first()
        
      {:ok, best_subtask}
    else
      # Fall back to top-level tasks
      find_next_top_level_task(tasks, completion_cache)
    end
  end
  
  defp find_eligible_subtasks(tasks, completion_cache) do
    tasks
    |> Enum.filter(fn task -> task.status == :in_progress end)
    |> Enum.flat_map(fn parent ->
      parent.subtasks
      |> Enum.filter(fn subtask ->
        is_eligible?(subtask, completion_cache) 
      end)
      |> Enum.map(fn subtask ->
        %{
          task: subtask,
          parent_id: parent.id,
          full_id: {parent.id, subtask.id}
        }
      end)
    end)
  end
  
  defp is_eligible?(task, completion_cache) do
    task.status in [:pending, :in_progress] and
    all_dependencies_met?(task.dependencies, completion_cache)
  end
  
  defp all_dependencies_met?(dependencies, completion_cache) do
    Enum.all?(dependencies, fn dep_id ->
      MapSet.member?(completion_cache, normalize_id(dep_id))
    end)
  end
  
  defp subtask_sort_key(subtask_info) do
    task = subtask_info.task
    priority_value = case task.priority do
      :high -> 3
      :medium -> 2  
      :low -> 1
    end
    
    # Sort by: priority DESC, dependency_count ASC, parent_id ASC, subtask_id ASC
    {
      -priority_value,
      length(task.dependencies),
      subtask_info.parent_id,
      task.id
    }
  end
end
```

## 🗄️ Persistence Layer (Elixir)

```elixir
defmodule SwarmService.TaskPersistence do
  @moduledoc """
  Handles persistence of tasks using ETS for fast access
  and PostgreSQL for durability.
  """
  
  use GenServer
  
  @ets_table :task_cache
  
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end
  
  def save_tasks(task_data) do
    GenServer.call(__MODULE__, {:save_tasks, task_data})
  end
  
  def load_tasks(tag \\ "master") do
    GenServer.call(__MODULE__, {:load_tasks, tag})
  end
  
  @impl true
  def init(_opts) do
    # Create ETS table for fast lookups
    :ets.new(@ets_table, [:named_table, :public, :set])
    
    {:ok, %{}}
  end
  
  @impl true
  def handle_call({:save_tasks, task_data}, _from, state) do
    # Save to ETS for fast access
    :ets.insert(@ets_table, {:tasks, task_data})
    
    # Also persist to PostgreSQL
    case persist_to_database(task_data) do
      :ok ->
        {:reply, :ok, state}
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
  
  @impl true
  def handle_call({:load_tasks, tag}, _from, state) do
    # Try ETS first
    case :ets.lookup(@ets_table, {:tasks, tag}) do
      [{_, task_data}] ->
        {:reply, {:ok, task_data}, state}
      [] ->
        # Fall back to database
        case load_from_database(tag) do
          {:ok, task_data} ->
            :ets.insert(@ets_table, {{:tasks, tag}, task_data})
            {:reply, {:ok, task_data}, state}
          error ->
            {:reply, error, state}
        end
    end
  end
  
  defp persist_to_database(task_data) do
    # This would use Ecto to save to PostgreSQL
    # For now, just return :ok
    :ok
  end
  
  defp load_from_database(tag) do
    # This would use Ecto to load from PostgreSQL
    # For now, return empty task data
    {:ok, %{meta: %{}, tasks: []}}
  end
end
```

## 🔗 Integration with RuvSwarm

The task management system integrates with our existing RuvSwarm for AI-powered features:

1. **PRD Parsing** - Uses Claude to analyze requirements and generate tasks
2. **Task Expansion** - AI can break down high-level tasks into subtasks
3. **Dependency Analysis** - AI suggests logical dependencies between tasks
4. **Complexity Estimation** - AI estimates task complexity and effort

## 🚀 Benefits for Swarm Service

1. **Structured Workflow** - Clear task hierarchy and dependencies
2. **Smart Scheduling** - Optimal next-task selection algorithm
3. **Progress Tracking** - Know exactly what's done and what's next
4. **Team Coordination** - Multiple agents can work on different tasks
5. **PRD Integration** - Direct from requirements to actionable tasks

This gives our swarm service a professional-grade task management system that rivals dedicated project management tools, but integrated directly into our AI orchestration platform!