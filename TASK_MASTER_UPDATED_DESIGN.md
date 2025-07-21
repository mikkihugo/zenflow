# Task Master Implementation - Updated with LLM Router Integration

## 🚀 Key Architecture Change: LLM Router for AI Operations

Instead of using RuvSwarm for AI operations, we'll use the **llm-router** service at `../llm-router` which provides:
- OpenAI-compatible API at `http://localhost:4000/v1/chat/completions`
- Multi-provider routing (OpenAI, Anthropic, Google AI, GitHub Models, Groq, Mistral)
- Cost optimization and automatic failover
- Type-safe operations through Gleam

## 📋 Updated Implementation Architecture

### 1. LLM Router Client Module

```elixir
defmodule SwarmService.LLMClient do
  @moduledoc """
  Client for interacting with the llm-router service.
  Provides AI operations for task management.
  """
  
  @llm_router_base "http://localhost:4000"
  @chat_endpoint "/v1/chat/completions"
  
  def generate_task_from_prompt(prompt) do
    messages = [
      %{
        role: "system",
        content: "You are a task management assistant. Generate structured task details from user prompts."
      },
      %{
        role: "user", 
        content: """
        Generate a task from this prompt: #{prompt}
        
        Return as JSON with fields:
        - title: Brief task title
        - description: Detailed description
        - details: Implementation details
        - testStrategy: How to test this task
        - priority: high/medium/low
        - estimatedHours: Number
        """
      }
    ]
    
    request_body = %{
      model: "gpt-4o",  # Can be any model supported by llm-router
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }
    
    case HTTPoison.post("#{@llm_router_base}#{@chat_endpoint}", 
                        Jason.encode!(request_body),
                        [{"Content-Type", "application/json"}]) do
      {:ok, %{status_code: 200, body: body}} ->
        response = Jason.decode!(body)
        content = get_in(response, ["choices", Access.at(0), "message", "content"])
        {:ok, Jason.decode!(content)}
        
      {:ok, %{status_code: status, body: body}} ->
        {:error, "LLM router returned status #{status}: #{body}"}
        
      {:error, error} ->
        {:error, "Failed to connect to LLM router: #{inspect(error)}"}
    end
  end
  
  def parse_prd_to_tasks(prd_content, num_tasks) do
    messages = [
      %{
        role: "system",
        content: """
        You are a project planning assistant. Parse PRD documents and generate comprehensive task lists.
        Create exactly #{num_tasks} top-level tasks with appropriate subtasks.
        """
      },
      %{
        role: "user",
        content: """
        Parse this PRD and generate #{num_tasks} tasks:
        
        #{prd_content}
        
        Return as JSON array where each task has:
        - id: Sequential number starting from 1
        - title: Task title
        - description: What needs to be done
        - details: Implementation approach
        - testStrategy: Testing approach
        - priority: high/medium/low
        - status: "pending"
        - dependencies: Array of task IDs this depends on
        - subtasks: Array of subtasks (optional)
        """
      }
    ]
    
    request_body = %{
      model: "gpt-4o",
      messages: messages,
      temperature: 0.5,
      max_tokens: 4000
    }
    
    case HTTPoison.post("#{@llm_router_base}#{@chat_endpoint}", 
                        Jason.encode!(request_body),
                        [{"Content-Type", "application/json"}]) do
      {:ok, %{status_code: 200, body: body}} ->
        response = Jason.decode!(body)
        content = get_in(response, ["choices", Access.at(0), "message", "content"])
        {:ok, Jason.decode!(content)}
        
      error ->
        {:error, "Failed to parse PRD: #{inspect(error)}"}
    end
  end
  
  def expand_task_to_subtasks(task) do
    messages = [
      %{
        role: "system",
        content: "You are a task decomposition expert. Break down tasks into actionable subtasks."
      },
      %{
        role: "user",
        content: """
        Expand this task into subtasks:
        
        Title: #{task.title}
        Description: #{task.description}
        Details: #{task.details || ""}
        
        Generate 3-7 subtasks. Return as JSON array with:
        - id: Sequential (e.g., "1.1", "1.2" for task 1's subtasks)
        - title: Subtask title
        - description: What to do
        - priority: high/medium/low
        - status: "pending"
        """
      }
    ]
    
    request_body = %{
      model: "gpt-4o-mini",  # Use cheaper model for subtasks
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500
    }
    
    case HTTPoison.post("#{@llm_router_base}#{@chat_endpoint}", 
                        Jason.encode!(request_body),
                        [{"Content-Type", "application/json"}]) do
      {:ok, %{status_code: 200, body: body}} ->
        response = Jason.decode!(body)
        content = get_in(response, ["choices", Access.at(0), "message", "content"])
        {:ok, Jason.decode!(content)}
        
      error ->
        {:error, "Failed to expand task: #{inspect(error)}"}
    end
  end
  
  def research_topic(topic, context) do
    messages = [
      %{
        role: "system",
        content: """
        You are a research assistant. Provide comprehensive information about technical topics.
        Include best practices, common patterns, and implementation considerations.
        """
      },
      %{
        role: "user",
        content: """
        Research this topic: #{topic}
        
        Context: #{context}
        
        Provide:
        1. Overview and key concepts
        2. Best practices and patterns
        3. Common pitfalls to avoid
        4. Recommended tools/libraries
        5. Example implementations
        """
      }
    ]
    
    # Use a research-optimized model via llm-router
    request_body = %{
      model: "claude-3-sonnet-20240229",  # Good for research
      messages: messages,
      temperature: 0.3,  # Lower temp for factual research
      max_tokens: 3000
    }
    
    case HTTPoison.post("#{@llm_router_base}#{@chat_endpoint}", 
                        Jason.encode!(request_body),
                        [{"Content-Type", "application/json"}]) do
      {:ok, %{status_code: 200, body: body}} ->
        response = Jason.decode!(body)
        content = get_in(response, ["choices", Access.at(0), "message", "content"])
        {:ok, %{findings: content, sources: ["llm-router research"]}}
        
      error ->
        {:error, "Research failed: #{inspect(error)}"}
    end
  end
  
  def analyze_complexity(tasks) do
    task_descriptions = Enum.map(tasks, fn task ->
      "- #{task.title}: #{task.description}"
    end) |> Enum.join("\n")
    
    messages = [
      %{
        role: "system",
        content: "You are a project complexity analyst. Analyze task lists and provide insights."
      },
      %{
        role: "user",
        content: """
        Analyze the complexity of these tasks:
        
        #{task_descriptions}
        
        Provide:
        1. Overall complexity score (1-10)
        2. Estimated total hours
        3. Critical path analysis
        4. Risk factors
        5. Recommended team size
        6. Suggested timeline
        """
      }
    ]
    
    request_body = %{
      model: "gpt-4o",
      messages: messages,
      temperature: 0.5,
      max_tokens: 2000
    }
    
    case HTTPoison.post("#{@llm_router_base}#{@chat_endpoint}", 
                        Jason.encode!(request_body),
                        [{"Content-Type", "application/json"}]) do
      {:ok, %{status_code: 200, body: body}} ->
        response = Jason.decode!(body)
        content = get_in(response, ["choices", Access.at(0), "message", "content"])
        {:ok, content}
        
      error ->
        {:error, "Complexity analysis failed: #{inspect(error)}"}
    end
  end
end
```

### 2. Updated Task Master Controller

```elixir
defmodule SwarmServiceWeb.TaskMasterController do
  @moduledoc """
  MCP endpoints for Task Master functionality.
  Now uses LLMClient for all AI operations instead of RuvSwarm.
  """
  
  use SwarmServiceWeb, :controller
  alias SwarmService.{TaskManager, TaskValidator, LLMClient}
  
  # Parse PRD using LLM Router
  def parse_prd(conn, params) do
    with {:ok, prd_path} <- validate_file_path(params["input"]),
         {:ok, prd_content} <- File.read(prd_path),
         {:ok, num_tasks} <- validate_num_tasks(params["numTasks"] || "10"),
         {:ok, tasks} <- LLMClient.parse_prd_to_tasks(prd_content, num_tasks),
         {:ok, saved_tasks} <- TaskManager.save_tasks(tasks) do
      
      json(conn, %{
        success: true,
        message: "PRD parsed successfully",
        tasksGenerated: length(tasks),
        tasks: tasks
      })
    else
      {:error, reason} ->
        json(conn, %{
          success: false,
          error: reason
        })
    end
  end
  
  # Add task with AI generation
  def add_task(conn, params) do
    task_attrs = if params["prompt"] do
      # Use LLM Router to generate task from prompt
      case LLMClient.generate_task_from_prompt(params["prompt"]) do
        {:ok, attrs} -> attrs
        {:error, reason} -> 
          conn
          |> put_status(400)
          |> json(%{success: false, error: reason})
          |> halt()
      end
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
      {:error, reason} ->
        json(conn, %{
          success: false,
          error: reason
        })
    end
  end
  
  # Expand task using LLM Router
  def expand_task(conn, params) do
    with {:ok, task_id} <- validate_task_id(params["taskId"]),
         {:ok, task} <- TaskManager.get_task(task_id),
         {:ok, subtasks} <- LLMClient.expand_task_to_subtasks(task),
         {:ok, updated_task} <- TaskManager.add_subtasks(task_id, subtasks) do
      
      json(conn, %{
        success: true,
        taskId: task_id,
        subtasksAdded: length(subtasks),
        task: updated_task
      })
    else
      {:error, reason} ->
        json(conn, %{
          success: false,
          error: reason
        })
    end
  end
  
  # Research using LLM Router
  def research(conn, params) do
    with {:ok, topic} <- validate_topic(params["topic"]),
         context <- params["context"] || "",
         {:ok, result} <- LLMClient.research_topic(topic, context) do
      
      json(conn, %{
        success: true,
        topic: topic,
        findings: result.findings,
        sources: result.sources
      })
    else
      {:error, reason} ->
        json(conn, %{
          success: false,
          error: reason
        })
    end
  end
  
  # Analyze complexity using LLM Router
  def analyze_complexity(conn, _params) do
    with {:ok, tasks} <- TaskManager.list_all_tasks(),
         {:ok, analysis} <- LLMClient.analyze_complexity(tasks) do
      
      json(conn, %{
        success: true,
        analysis: analysis,
        taskCount: length(tasks)
      })
    else
      {:error, reason} ->
        json(conn, %{
          success: false,
          error: reason
        })
    end
  end
end
```

### 3. Key Benefits of Using LLM Router

1. **Multi-Provider Support**: Automatically routes to best available provider
2. **Cost Optimization**: Routes to cheapest provider that meets requirements
3. **Automatic Failover**: If one provider fails, automatically tries others
4. **OpenAI Compatibility**: Standard API format works with any OpenAI client
5. **Performance Monitoring**: Built-in telemetry and metrics
6. **Type Safety**: Gleam provides compile-time guarantees

### 4. Configuration for Different Use Cases

```elixir
defmodule SwarmService.LLMClient.Config do
  @moduledoc """
  Configuration for different AI operation types
  """
  
  def model_for_operation(operation) do
    case operation do
      :task_generation -> "gpt-4o"           # High quality for task creation
      :subtask_expansion -> "gpt-4o-mini"    # Cheaper for simple expansions
      :prd_parsing -> "gpt-4o"               # High quality for complex parsing
      :research -> "claude-3-sonnet-20240229" # Good for research tasks
      :complexity_analysis -> "gpt-4o"        # Needs reasoning capabilities
      _ -> "gpt-3.5-turbo"                  # Default fallback
    end
  end
  
  def temperature_for_operation(operation) do
    case operation do
      :research -> 0.3          # Low temperature for factual content
      :complexity_analysis -> 0.5 # Medium for balanced analysis
      _ -> 0.7                  # Higher for creative task generation
    end
  end
end
```

## 🎯 Integration Summary

The updated design:
1. **Removes RuvSwarm dependency** for AI operations
2. **Uses llm-router** at `http://localhost:4000` for all AI inference
3. **Maintains compatibility** with Task Master's 38 MCP tools
4. **Leverages multi-provider routing** for reliability and cost optimization
5. **Provides type-safe operations** through the hybrid Elixir/Gleam architecture

This aligns with your architecture where:
- **Swarm Service** handles task management and MCP endpoints
- **LLM Router** provides AI inference with multi-provider support
- **RuvSwarm** remains available for swarm coordination (not AI inference)