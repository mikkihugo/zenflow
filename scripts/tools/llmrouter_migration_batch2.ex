defmodule LLMRouter.Core.ClientMigrationBatch2 do
  @moduledoc """
  Migration Batch 2: Adding services 11-20 (functions 1-8) from DevmgmtAI007.Client to LLMRouter.Core.Client
  
  This module contains the functions that need to be added to LLMRouter.Core.Client
  to complete the migration from DevmgmtAI007.Client.
  
  Functions to migrate:
  1. batch_requests/2 (line 178)
  2. bumblebee_emergency_chat_completion/1 (line 239)
  3. embedding/2 (line 124)
  4. emergency_chat_completion/2 (line 97)
  5. llm_service_chat_completion/1 (line 218)
  6. singularity_llm_completion/3 (line 250)
  7. stream_completion/2 (line 200)
  8. structured_completion/3 (line 152)
  """
  
  # Add these functions to LLMRouter.Core.Client after line 327 (before GenServer Implementation)
  
  @doc """
  Emergency chat completion with automatic local model fallback.
  
  Compatible with DevelopmentService.Services.AI.BumblebeeService.emergency_chat_completion/1
  Prioritizes local models and provides fast emergency responses.
  """
  @spec emergency_chat_completion(list() | String.t(), map()) :: {:ok, map()} | {:error, term()}
  def emergency_chat_completion(messages, options \\ %{}) do
    emergency_options = Map.merge(options, %{
      prefer_local: true,
      fallback_strategy: :local_only,
      timeout: 10_000,
      model: "local/emergency"
    })
    
    case chat_completion(messages, emergency_options) do
      {:ok, response} -> {:ok, transform_to_bumblebee_format(response)}
      error -> error
    end
  end
  
  @doc """
  Generate embeddings with automatic provider selection and dimension normalization.
  
  ## Parameters
  - `input` - Text string or list of strings to embed
  - `options` - Configuration options
  
  ## Options
  - `:model` - Embedding model ("auto" for intelligent selection)
  - `:dimensions` - Target embedding dimensions
  - `:encoding_format` - "float" or "base64"
  """
  @spec embedding(String.t() | list(), map()) :: {:ok, map()} | {:error, term()}
  def embedding(input, options \\ %{}) do
    request_params = %{
      input: input,
      model: Map.get(options, :model, "auto"),
      dimensions: Map.get(options, :dimensions, 1536),
      encoding_format: Map.get(options, :encoding_format, "float")
    }
    
    request(__MODULE__, :post, "/v1/embeddings", request_params)
  end
  
  @doc """
  Generate structured output with schema validation.
  
  Compatible with DevelopmentService.Services.LLM.InstructorService patterns.
  Provides guaranteed structured outputs with schema validation.
  
  ## Parameters
  - `messages` - Conversation messages
  - `schema` - JSON schema for output validation
  - `options` - Configuration options
  """
  @spec structured_completion(list(), map(), map()) :: {:ok, map()} | {:error, term()}
  def structured_completion(messages, schema, options \\ %{}) do
    with {:ok, normalized_messages} <- normalize_messages(messages) do
      request_params = %{
        messages: normalized_messages,
        schema: schema,
        model: Map.get(options, :model, "auto"),
        temperature: Map.get(options, :temperature, 0.3),
        validation_mode: Map.get(options, :validation_mode, "strict")
      }
      
      request(__MODULE__, :post, "/v1/ai/structured", request_params)
    end
  end
  
  @doc """
  Batch process multiple requests efficiently.
  
  Compatible with request batching patterns used throughout the system.
  Optimizes multiple AI requests for cost and performance.
  """
  @spec batch_requests(list(), map()) :: {:ok, list()} | {:error, term()}
  def batch_requests(requests, options \\ %{}) do
    request_params = %{
      requests: requests,
      batch_strategy: Map.get(options, :batch_strategy, "optimal"),
      max_concurrency: Map.get(options, :max_concurrency, 5)
    }
    
    request(__MODULE__, :post, "/v1/ai/batch", request_params)
  end
  
  @doc """
  Stream chat completion responses for real-time applications.
  
  Returns a stream of server-sent events for real-time AI responses.
  Compatible with existing streaming implementations.
  """
  @spec stream_completion(list(), map()) :: {:ok, Stream.t()} | {:error, term()}
  def stream_completion(messages, options \\ %{}) do
    options_with_stream = Map.put(options, :stream, true)
    
    case chat_completion(messages, options_with_stream) do
      {:ok, stream} -> {:ok, process_stream(stream)}
      error -> error
    end
  end
  
  # Legacy Compatibility Layers
  
  @doc """
  LLM Service compatibility layer.
  
  Drop-in replacement for DevelopmentService.Services.LLM.UnifiedService.chat_completion/1
  Maintains exact response format and behavior for seamless migration.
  """
  @spec llm_service_chat_completion(map()) :: {:ok, map()} | {:error, term()}
  def llm_service_chat_completion(params) do
    options = %{
      model: Map.get(params, :model, "auto"),
      temperature: Map.get(params, :temperature, 0.7),
      max_tokens: Map.get(params, :max_tokens, 1000),
      stream: Map.get(params, :stream, false)
    }
    
    case chat_completion(Map.get(params, :messages, []), options) do
      {:ok, response} -> {:ok, transform_to_llm_service_format(response)}
      error -> error
    end
  end
  
  @doc """
  BumblebeeService compatibility layer.
  
  Drop-in replacement for DevelopmentService.Services.AI.BumblebeeService.emergency_chat_completion/1
  Maintains emergency response patterns with local model preference.
  """
  @spec bumblebee_emergency_chat_completion(list()) :: {:ok, map()} | {:error, term()}
  def bumblebee_emergency_chat_completion(messages) do
    emergency_chat_completion(messages)
  end
  
  @doc """
  SingularityLLM compatibility layer.
  
  Drop-in replacement for SingularityLLM.Chat.completion/3
  Maintains exact API signature and response format.
  """
  @spec singularity_llm_completion(String.t(), map(), list()) :: {:ok, map()} | {:error, term()}
  def singularity_llm_completion(model, params, _opts) do
    options = %{
      model: model,
      temperature: Map.get(params, :temperature),
      max_tokens: Map.get(params, :max_tokens)
    }
    
    messages = Map.get(params, :messages, [])
    
    case chat_completion(messages, options) do
      {:ok, response} -> {:ok, transform_to_singularity_format(response)}
      error -> error
    end
  end
  
  # Helper functions that need to be added to LLMRouter.Core.Client
  
  defp process_stream(stream) do
    # Process server-sent events stream
    Stream.unfold(stream, fn
      nil -> nil
      stream_state -> 
        case read_sse_chunk(stream_state) do
          {:ok, chunk, new_state} -> {chunk, new_state}
          :done -> nil
        end
    end)
  end
  
  defp read_sse_chunk(stream_state) do
    # Implementation for reading SSE chunks
    # This would depend on the actual streaming implementation
    {:ok, %{data: "chunk"}, stream_state}
  end
  
  defp transform_to_bumblebee_format(response) do
    # Transform standard response to Bumblebee format
    %{
      text: get_in(response, ["choices", Access.at(0), "message", "content"]) || "",
      model: Map.get(response, "model", "unknown"),
      usage: Map.get(response, "usage", %{}),
      emergency_mode: true
    }
  end
  
  defp transform_to_llm_service_format(response) do
    # Transform to LLM service format for compatibility
    %{
      response: get_in(response, ["choices", Access.at(0), "message", "content"]) || "",
      model: Map.get(response, "model"),
      usage: Map.get(response, "usage", %{}),
      metadata: %{
        finish_reason: get_in(response, ["choices", Access.at(0), "finish_reason"]),
        created: Map.get(response, "created")
      }
    }
  end
  
  defp transform_to_singularity_format(response) do
    # Transform to SingularityLLM format
    %{
      content: get_in(response, ["choices", Access.at(0), "message", "content"]) || "",
      model: Map.get(response, "model"),
      tokens: Map.get(response, "usage", %{}),
      completion_id: Map.get(response, "id")
    }
  end
end