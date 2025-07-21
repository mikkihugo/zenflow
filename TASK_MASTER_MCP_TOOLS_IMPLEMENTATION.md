# Task Master MCP Tools Implementation for Swarm Service

## 📋 Complete List of MCP Tools to Implement

Based on Task Master's implementation, here are all 38 MCP tools grouped by functionality:

### Group 1: Initialization & Setup (4 tools)
1. **initialize_project** - Set up project structure with .taskmaster directory
2. **models** - Configure AI models (main, research, fallback)
3. **rules** - Manage project-specific rules and guidelines
4. **parse_prd** - Parse PRD document to generate initial tasks

### Group 2: Task Analysis & Expansion (4 tools)
5. **analyze** - Analyze project complexity and generate reports
6. **expand_task** - Break down a task into subtasks using AI
7. **expand_all** - Expand all tasks that need expansion
8. **complexity_report** - Generate/view task complexity analysis

### Group 3: Task Listing & Viewing (4 tools)
9. **list_tasks** - List all tasks with filtering options
10. **get_task** - Show details of specific task(s)
11. **next_task** - Find the next task to work on
12. **get_operation_status** - Check status of async operations

### Group 4: Task Status & Management (2 tools)
13. **set_task_status** - Update task status (pending/in-progress/done/etc)
14. **generate** - Generate task files in .taskmaster/tasks/

### Group 5: Task Creation & Modification (9 tools)
15. **add_task** - Add new task using AI or manual fields
16. **add_subtask** - Add subtask to existing task
17. **update** - Update multiple tasks from a given ID
18. **update_task** - Update single task details
19. **update_subtask** - Update subtask details
20. **remove_task** - Remove a task and handle dependencies
21. **remove_subtask** - Remove a subtask
22. **clear_subtasks** - Clear all subtasks from a task
23. **move_task** - Reorder tasks in the list

### Group 6: Dependency Management (5 tools)
24. **add_dependency** - Add dependency between tasks
25. **remove_dependency** - Remove task dependency
26. **validate_dependencies** - Check for circular/invalid dependencies
27. **fix_dependencies** - Auto-fix dependency issues
28. **response_language** - Set response language preference

### Group 7: Tag Management (6 tools)
29. **list_tags** - List all available tags/branches
30. **add_tag** - Create new tag from current state
31. **delete_tag** - Delete a tag
32. **use_tag** - Switch to a different tag
33. **rename_tag** - Rename existing tag
34. **copy_tag** - Copy tag to new name

### Group 8: Research & Utilities (2 tools)
35. **research** - Use AI to research topics with context
36. **rules** - Add/view/manage project rules

## 🏗️ Implementation Architecture

### 1. MCP Controller Extension

```elixir
defmodule SwarmServiceWeb.TaskMasterController do
  @moduledoc """
  MCP endpoints for Task Master functionality.
  Provides all 38 tools as MCP-compatible endpoints.
  """
  
  use SwarmServiceWeb, :controller
  alias SwarmService.TaskManager
  alias SwarmService.TaskValidator
  alias SwarmService.RuvSwarm
  
  # Group 1: Initialization & Setup
  
  def initialize_project(conn, params) do
    with {:ok, project_root} <- validate_project_root(params["projectRoot"]),
         {:ok, result} <- TaskManager.initialize_project(project_root, params) do
      json(conn, %{
        success: true,
        message: "Project initialized successfully",
        projectRoot: project_root,
        structure: result.created_files
      })
    end
  end
  
  def parse_prd(conn, params) do
    with {:ok, prd_path} <- validate_file_path(params["input"]),
         {:ok, num_tasks} <- validate_num_tasks(params["numTasks"]),
         {:ok, tasks} <- TaskManager.parse_prd(prd_path, num_tasks, params) do
      json(conn, %{
        success: true,
        message: "PRD parsed successfully",
        tasksGenerated: length(tasks),
        tasks: tasks
      })
    end
  end
  
  # Group 2: Task Analysis & Expansion
  
  def expand_task(conn, params) do
    with {:ok, task_id} <- validate_task_id(params["taskId"]),
         {:ok, expanded} <- TaskManager.expand_task(task_id, params) do
      json(conn, %{
        success: true,
        taskId: task_id,
        subtasksAdded: length(expanded.subtasks),
        task: expanded
      })
    end
  end
  
  # Group 3: Task Listing & Viewing
  
  def list_tasks(conn, params) do
    filters = build_task_filters(params)
    {:ok, tasks} = TaskManager.list_tasks(filters)
    
    json(conn, %{
      success: true,
      tasks: tasks,
      total: length(tasks),
      filters: filters
    })
  end
  
  def next_task(conn, params) do
    case TaskManager.find_next_task() do
      {:ok, task} ->
        json(conn, %{
          success: true,
          task: task,
          message: "Found next task to work on"
        })
      {:error, :no_eligible_tasks} ->
        json(conn, %{
          success: true,
          task: nil,
          message: "No eligible tasks found"
        })
    end
  end
  
  # Group 4: Task Status & Management
  
  def set_task_status(conn, params) do
    with {:ok, task_id} <- validate_task_id(params["taskId"]),
         {:ok, status} <- validate_status(params["status"]),
         :ok <- TaskManager.update_task_status(task_id, status) do
      json(conn, %{
        success: true,
        taskId: task_id,
        newStatus: status,
        message: "Task status updated"
      })
    end
  end
  
  # Group 5: Task Creation & Modification
  
  def add_task(conn, params) do
    task_attrs = if params["prompt"] do
      # Use AI to generate task from prompt
      {:ok, attrs} = generate_task_from_prompt(params["prompt"])
      attrs
    else
      # Manual task creation
      build_task_attrs(params)
    end
    
    case TaskManager.add_task(task_attrs) do
      {:ok, task} ->
        json(conn, %{
          success: true,
          task: task,
          message: "Task added successfully"
        })
    end
  end
  
  def add_subtask(conn, params) do
    with {:ok, parent_id} <- validate_task_id(params["parentId"]),
         {:ok, subtask_attrs} <- build_subtask_attrs(params),
         {:ok, subtask} <- TaskManager.add_subtask(parent_id, subtask_attrs) do
      json(conn, %{
        success: true,
        parentId: parent_id,
        subtask: subtask,
        message: "Subtask added successfully"
      })
    end
  end
  
  # Group 6: Dependency Management
  
  def add_dependency(conn, params) do
    with {:ok, task_id} <- validate_task_id(params["taskId"]),
         {:ok, dep_id} <- validate_task_id(params["dependencyId"]),
         :ok <- TaskManager.add_dependency(task_id, dep_id) do
      json(conn, %{
        success: true,
        taskId: task_id,
        dependencyId: dep_id,
        message: "Dependency added successfully"
      })
    end
  end
  
  def validate_dependencies(conn, _params) do
    case TaskManager.validate_dependencies() do
      {:ok, message} ->
        json(conn, %{
          success: true,
          valid: true,
          message: message
        })
      {:error, issues} ->
        json(conn, %{
          success: true,
          valid: false,
          issues: issues,
          message: "Found dependency issues"
        })
    end
  end
  
  # Group 7: Tag Management
  
  def list_tags(conn, _params) do
    {:ok, tags} = TaskManager.list_tags()
    json(conn, %{
      success: true,
      tags: tags,
      current: TaskManager.current_tag()
    })
  end
  
  def use_tag(conn, params) do
    with {:ok, tag} <- validate_tag(params["tag"]),
         :ok <- TaskManager.switch_tag(tag) do
      json(conn, %{
        success: true,
        tag: tag,
        message: "Switched to tag: #{tag}"
      })
    end
  end
  
  # Group 8: Research & Utilities
  
  def research(conn, params) do
    with {:ok, topic} <- validate_topic(params["topic"]),
         {:ok, result} <- perform_research(topic, params) do
      json(conn, %{
        success: true,
        topic: topic,
        findings: result,
        sources: result.sources
      })
    end
  end
  
  # Private helper functions
  
  defp generate_task_from_prompt(prompt) do
    # Use RuvSwarm to generate task details from prompt
    case RuvSwarm.orchestrate_task(
      "Generate task details from: #{prompt}",
      :adaptive,
      :medium
    ) do
      {:ok, task_id} ->
        # Retrieve generated task from memory
        {:ok, result} = RuvSwarm.retrieve_memory("task_generation/#{task_id}")
        {:ok, result.task_attrs}
    end
  end
  
  defp perform_research(topic, params) do
    # Use RuvSwarm with research-optimized settings
    context = params["context"] || ""
    prompt = "Research: #{topic}. Context: #{context}"
    
    case RuvSwarm.orchestrate_task(prompt, :adaptive, :high) do
      {:ok, task_id} ->
        # Get research results
        {:ok, RuvSwarm.retrieve_memory("research/#{task_id}")}
    end
  end
end
```

### 2. Router Updates

```elixir
# In router.ex, add all task master endpoints

# Group 1: Initialization & Setup
post "/mcp/initialize_project", TaskMasterController, :initialize_project
post "/mcp/models", TaskMasterController, :configure_models
post "/mcp/rules", TaskMasterController, :manage_rules
post "/mcp/parse_prd", TaskMasterController, :parse_prd

# Group 2: Task Analysis & Expansion
post "/mcp/analyze", TaskMasterController, :analyze_complexity
post "/mcp/expand_task", TaskMasterController, :expand_task
post "/mcp/expand_all", TaskMasterController, :expand_all_tasks
get "/mcp/complexity_report", TaskMasterController, :complexity_report

# Group 3: Task Listing & Viewing
get "/mcp/list_tasks", TaskMasterController, :list_tasks
post "/mcp/get_task", TaskMasterController, :get_task
get "/mcp/next_task", TaskMasterController, :next_task
get "/mcp/operation_status/:id", TaskMasterController, :operation_status

# Group 4: Task Status & Management
post "/mcp/set_task_status", TaskMasterController, :set_task_status
post "/mcp/generate", TaskMasterController, :generate_task_files

# Group 5: Task Creation & Modification
post "/mcp/add_task", TaskMasterController, :add_task
post "/mcp/add_subtask", TaskMasterController, :add_subtask
post "/mcp/update", TaskMasterController, :update_tasks
post "/mcp/update_task", TaskMasterController, :update_task
post "/mcp/update_subtask", TaskMasterController, :update_subtask
delete "/mcp/remove_task", TaskMasterController, :remove_task
delete "/mcp/remove_subtask", TaskMasterController, :remove_subtask
post "/mcp/clear_subtasks", TaskMasterController, :clear_subtasks
post "/mcp/move_task", TaskMasterController, :move_task

# Group 6: Dependency Management
post "/mcp/add_dependency", TaskMasterController, :add_dependency
post "/mcp/remove_dependency", TaskMasterController, :remove_dependency
post "/mcp/validate_dependencies", TaskMasterController, :validate_dependencies
post "/mcp/fix_dependencies", TaskMasterController, :fix_dependencies
post "/mcp/response_language", TaskMasterController, :response_language

# Group 7: Tag Management
get "/mcp/list_tags", TaskMasterController, :list_tags
post "/mcp/add_tag", TaskMasterController, :add_tag
delete "/mcp/delete_tag", TaskMasterController, :delete_tag
post "/mcp/use_tag", TaskMasterController, :use_tag
post "/mcp/rename_tag", TaskMasterController, :rename_tag
post "/mcp/copy_tag", TaskMasterController, :copy_tag

# Group 8: Research & Utilities
post "/mcp/research", TaskMasterController, :research
```

### 3. Tool Registration for MCP Compatibility

```elixir
defmodule SwarmService.MCP.TaskMasterTools do
  @moduledoc """
  Registers all Task Master tools in MCP-compatible format
  """
  
  def tool_definitions do
    [
      %{
        name: "initialize_project",
        description: "Initialize a new project with task management structure",
        inputSchema: %{
          type: "object",
          properties: %{
            projectRoot: %{type: "string", description: "Project root directory"},
            projectName: %{type: "string"},
            description: %{type: "string"},
            author: %{type: "string"}
          },
          required: ["projectRoot"]
        }
      },
      %{
        name: "parse_prd",
        description: "Parse PRD document to generate initial tasks",
        inputSchema: %{
          type: "object",
          properties: %{
            input: %{type: "string", description: "Path to PRD file"},
            projectRoot: %{type: "string"},
            numTasks: %{type: "integer", description: "Number of tasks to generate"},
            force: %{type: "boolean"},
            research: %{type: "boolean", description: "Use research model"}
          },
          required: ["projectRoot"]
        }
      },
      %{
        name: "next_task",
        description: "Find the next task to work on based on dependencies and status",
        inputSchema: %{
          type: "object",
          properties: %{
            projectRoot: %{type: "string"},
            complexityReport: %{type: "string"}
          },
          required: ["projectRoot"]
        }
      },
      %{
        name: "add_task",
        description: "Add a new task using AI or manual fields",
        inputSchema: %{
          type: "object",
          properties: %{
            prompt: %{type: "string", description: "AI prompt for task generation"},
            title: %{type: "string"},
            description: %{type: "string"},
            details: %{type: "string"},
            testStrategy: %{type: "string"},
            dependencies: %{type: "string", description: "Comma-separated task IDs"},
            priority: %{type: "string", enum: ["high", "medium", "low"]},
            projectRoot: %{type: "string"}
          },
          required: ["projectRoot"]
        }
      },
      # ... all 38 tools with their schemas
    ]
  end
end
```

## 🎯 Key Implementation Notes

1. **AI Integration**: All AI operations (parse_prd, expand_task, research) use our existing RuvSwarm
2. **Path Handling**: All paths are validated and normalized like Task Master
3. **Error Responses**: Consistent error format matching Task Master
4. **Async Operations**: Long-running tasks return operation IDs for status checking
5. **Tag System**: Implements Git-like branching for task versions
6. **Validation**: All inputs validated with proper error messages

## 🚀 Benefits

By implementing all 38 MCP tools, our swarm service will:
- Have complete feature parity with Task Master
- Work seamlessly with Claude Desktop/Cursor 
- Provide the same developer experience
- Support all task management workflows
- Enable AI-powered project management