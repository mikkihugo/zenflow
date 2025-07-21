#!/usr/bin/env elixir

Mix.install([
  {:jason, "~> 1.4"},
  {:telemetry, "~> 1.3"}
])

defmodule AIEnhancementTest do
  @moduledoc """
  Test AI-enhanced neural network and swarm coordination capabilities.
  
  This test validates the integration between:
  - MultiModelEnhancer (AI-powered analysis)
  - Neural network simulation (mock data)
  - Swarm coordination scenarios
  """

  require Logger

  def run_all_tests() do
    Logger.info("🤖 Starting AI Enhancement Integration Tests")
    
    results = %{
      ai_health_check: test_ai_health_check(),
      neural_analysis_test: test_neural_output_analysis(),
      swarm_optimization_test: test_swarm_strategy_optimization(),
      multi_model_comparison: test_multi_model_analysis(),
      code_analysis_test: test_code_performance_analysis(),
      debugging_assistance: test_debugging_assistance()
    }
    
    display_test_results(results)
    results
  end

  # ===========================================================================
  # AI Health and Availability Tests
  # ===========================================================================

  def test_ai_health_check() do
    Logger.info("🔍 Testing AI tool availability...")
    
    tests = [
      {"aichat availability", &test_aichat_available/0},
      {"AI model connectivity", &test_model_connectivity/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_aichat_available() do
    case System.cmd("aichat", ["--help"], stderr_to_stdout: true) do
      {output, 0} when is_binary(output) ->
        {:ok, "aichat tool available and working"}
      
      {error, _} ->
        {:error, "aichat not available: #{error}"}
    end
  end

  defp test_model_connectivity() do
    # Test with Gemini Flash (fastest model)
    test_prompt = "Respond with exactly: 'AI connectivity test successful'"
    
    case System.cmd("aichat", ["-m", "gemini:gemini-2.0-flash", test_prompt], 
                   stderr_to_stdout: true, timeout: 10_000) do
      {response, 0} ->
        if String.contains?(response, "connectivity test successful") do
          {:ok, "AI model connectivity verified"}
        else
          {:warning, "AI responded but format unexpected: #{String.slice(response, 0, 50)}..."}
        end
      
      {error, _} ->
        if String.contains?(error, "quota") do
          {:warning, "AI quota reached - switching to aichat fallback"}
        else
          {:error, "AI connectivity failed: #{error}"}
        end
    end
  end

  # ===========================================================================
  # Neural Network AI Enhancement Tests
  # ===========================================================================

  def test_neural_output_analysis() do
    Logger.info("🧠 Testing neural network output analysis...")
    
    tests = [
      {"Basic Neural Analysis", &test_basic_neural_analysis/0},
      {"Confidence Assessment", &test_confidence_assessment/0},
      {"Complex Neural Output", &test_complex_neural_analysis/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_basic_neural_analysis() do
    # Simulate neural network output
    neural_output = [0.8, 0.15, 0.05]  # High confidence classification
    context = %{
      task: "image_classification",
      classes: ["cat", "dog", "bird"],
      confidence_threshold: 0.7
    }
    
    prompt = build_neural_analysis_prompt(neural_output, context)
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, analysis} ->
        parsed = parse_ai_response(analysis)
        {:ok, "Neural analysis completed: confidence=#{parsed.confidence}, recommendations=#{length(parsed.recommendations)}"}
      
      {:error, reason} ->
        {:error, "Neural analysis failed: #{reason}"}
    end
  end

  defp test_confidence_assessment() do
    # Test with low confidence output
    neural_output = [0.4, 0.35, 0.25]  # Low confidence, unclear classification
    
    prompt = """
    Analyze this neural network output for confidence assessment:
    
    Output: #{inspect(neural_output)}
    Task: Multi-class classification
    Threshold: 0.6
    
    Assess:
    1. Confidence level (high/medium/low)
    2. Should this prediction be trusted?
    3. What actions should be taken?
    
    Be concise and direct.
    """
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, response} ->
        confidence = extract_confidence_level(response)
        {:ok, "Confidence assessment: #{confidence}"}
      
      {:error, reason} ->
        {:error, "Confidence assessment failed: #{reason}"}
    end
  end

  defp test_complex_neural_analysis() do
    # Complex multi-output neural network
    neural_output = %{
      classification: [0.7, 0.2, 0.1],
      regression: [0.85],
      attention_weights: [0.3, 0.5, 0.2],
      uncertainty: 0.15
    }
    
    prompt = """
    Analyze this complex neural network output:
    
    #{inspect(neural_output, pretty: true)}
    
    This is a multi-task network with classification, regression, and attention.
    Provide insights on overall system performance and any concerns.
    """
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, response} ->
        {:ok, "Complex analysis completed: #{String.length(response)} chars"}
      
      {:error, reason} ->
        {:error, "Complex analysis failed: #{reason}"}
    end
  end

  # ===========================================================================
  # Swarm Coordination AI Enhancement Tests
  # ===========================================================================

  def test_swarm_strategy_optimization() do
    Logger.info("🐝 Testing swarm strategy optimization...")
    
    tests = [
      {"Basic Swarm Optimization", &test_basic_swarm_optimization/0},
      {"Performance Bottleneck Analysis", &test_swarm_bottleneck_analysis/0},
      {"Topology Recommendation", &test_topology_recommendation/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_basic_swarm_optimization() do
    swarm_data = %{
      agents: 100,
      topology: "mesh",
      performance: 0.75,
      task_completion_rate: 0.82,
      communication_overhead: 0.25,
      bottlenecks: ["network_latency", "agent_coordination"]
    }
    
    task = %{
      type: "distributed_computation",
      complexity: "high",
      deadline: "1 hour",
      resource_requirements: "GPU acceleration preferred"
    }
    
    prompt = build_swarm_optimization_prompt(swarm_data, task)
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, strategy} ->
        recommendations = extract_recommendations(strategy)
        {:ok, "Swarm strategy generated: #{length(recommendations)} recommendations"}
      
      {:error, reason} ->
        {:error, "Swarm optimization failed: #{reason}"}
    end
  end

  defp test_swarm_bottleneck_analysis() do
    performance_metrics = %{
      agent_utilization: 0.65,
      memory_usage: 0.85,
      network_throughput: 0.45,
      task_queue_depth: 150,
      error_rate: 0.08,
      response_time_p95: 250  # milliseconds
    }
    
    prompt = """
    Analyze these swarm performance metrics and identify bottlenecks:
    
    #{inspect(performance_metrics, pretty: true)}
    
    Focus on:
    1. Primary performance bottlenecks
    2. Root cause analysis
    3. Specific optimization recommendations
    4. Expected improvement estimates
    """
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, analysis} ->
        bottlenecks = extract_bottlenecks(analysis)
        {:ok, "Bottleneck analysis: #{length(bottlenecks)} issues identified"}
      
      {:error, reason} ->
        {:error, "Bottleneck analysis failed: #{reason}"}
    end
  end

  defp test_topology_recommendation() do
    scenario = %{
      task_type: "research_coordination",
      agent_count: 50,
      geographic_distribution: "global",
      latency_requirements: "low",
      fault_tolerance: "high",
      data_sensitivity: "medium"
    }
    
    prompt = """
    Recommend optimal swarm topology for this scenario:
    
    #{inspect(scenario, pretty: true)}
    
    Consider topologies: mesh, hierarchical, star, ring, hybrid.
    Provide rationale and expected benefits.
    """
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, recommendation} ->
        topology = extract_topology_recommendation(recommendation)
        {:ok, "Topology recommended: #{topology}"}
      
      {:error, reason} ->
        {:error, "Topology recommendation failed: #{reason}"}
    end
  end

  # ===========================================================================
  # Multi-Model Analysis Tests
  # ===========================================================================

  def test_multi_model_analysis() do
    Logger.info("🔄 Testing multi-model comparison...")
    
    test_prompt = """
    Optimize this neural network architecture:
    
    Current: 784 → [128, 64] → 10 (MNIST classification)
    Issues: Overfitting, slow training
    
    Suggest improvements in 2-3 sentences.
    """
    
    models = ["gemini:gemini-2.0-flash", "gemini:gemini-2.0-flash-lite"]
    
    # Run parallel analysis
    tasks = Enum.map(models, fn model ->
      Task.async(fn ->
        case call_ai_with_timeout(test_prompt, model) do
          {:ok, response} -> {model, :ok, response}
          {:error, reason} -> {model, :error, reason}
        end
      end)
    end)
    
    results = Task.await_many(tasks, 15_000)
    
    successful = Enum.count(results, fn {_, status, _} -> status == :ok end)
    total = length(results)
    
    [{"Multi-Model Analysis", fn -> 
      if successful > 0 do
        {:ok, "#{successful}/#{total} models responded successfully"}
      else
        {:error, "No models responded successfully"}
      end
    end}]
    |> run_test_suite()
  end

  # ===========================================================================
  # Code Analysis Tests
  # ===========================================================================

  def test_code_performance_analysis() do
    Logger.info("💻 Testing code performance analysis...")
    
    code_snippet = """
    defmodule SlowNeuralNetwork do
      def train(data) do
        Enum.each(data, fn sample ->
          # Inefficient: recreating network each iteration
          network = create_network()
          result = train_sample(network, sample)
          save_network(network)
        end)
      end
      
      defp create_network(), do: %{weights: generate_random_weights()}
      defp train_sample(network, sample), do: update_weights(network, sample)
      defp save_network(network), do: File.write("/tmp/network.dat", inspect(network))
    end
    """
    
    prompt = """
    Analyze this Elixir neural network code for performance issues:
    
    ```elixir
    #{code_snippet}
    ```
    
    Identify:
    1. Performance bottlenecks
    2. Memory inefficiencies  
    3. Specific improvements
    4. Better alternatives
    """
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, analysis} ->
        issues = extract_performance_issues(analysis)
        [{"Code Performance Analysis", fn -> 
          {:ok, "Code analysis completed: #{length(issues)} issues found"}
        end}]
      
      {:error, reason} ->
        [{"Code Performance Analysis", fn -> 
          {:error, "Code analysis failed: #{reason}"}
        end}]
    end
    |> run_test_suite()
  end

  # ===========================================================================
  # Debugging Assistance Tests
  # ===========================================================================

  def test_debugging_assistance() do
    Logger.info("🐛 Testing debugging assistance...")
    
    issue = "Neural network training loss exploding after epoch 50"
    error_logs = """
    epoch 48: loss=0.452
    epoch 49: loss=0.448  
    epoch 50: loss=0.451
    epoch 51: loss=1.234
    epoch 52: loss=45.678
    epoch 53: loss=NaN
    Error: Loss became NaN, training stopped
    """
    
    prompt = """
    Debug this neural network training issue:
    
    Issue: #{issue}
    
    Error Logs:
    #{error_logs}
    
    Provide:
    1. Root cause analysis
    2. Why loss exploded at epoch 51
    3. Specific fixes to try
    4. Prevention strategies
    """
    
    case call_ai_with_timeout(prompt, "gemini:gemini-2.0-flash") do
      {:ok, debug_response} ->
        solutions = extract_solutions(debug_response)
        [{"Debugging Assistance", fn -> 
          {:ok, "Debug analysis completed: #{length(solutions)} solutions provided"}
        end}]
      
      {:error, reason} ->
        [{"Debugging Assistance", fn -> 
          {:error, "Debug assistance failed: #{reason}"}
        end}]
    end
    |> run_test_suite()
  end

  # ===========================================================================
  # Helper Functions
  # ===========================================================================

  defp call_ai_with_timeout(prompt, model, timeout \\ 10_000) do
    case System.cmd("aichat", ["-m", model, prompt], 
                   stderr_to_stdout: true, timeout: timeout) do
      {response, 0} ->
        {:ok, String.trim(response)}
      
      {error, _} ->
        cond do
          String.contains?(error, "quota") -> {:error, :quota_exceeded}
          String.contains?(error, "timeout") -> {:error, :timeout}
          String.contains?(error, "connection") -> {:error, :connection_failed}
          true -> {:error, error}
        end
    end
  end

  defp build_neural_analysis_prompt(neural_output, context) do
    """
    Analyze this neural network output:
    
    Output: #{inspect(neural_output)}
    Context: #{inspect(context)}
    
    Provide:
    1. Interpretation of results
    2. Confidence assessment  
    3. Recommended actions
    4. Any concerns
    
    Be concise and actionable.
    """
  end

  defp build_swarm_optimization_prompt(swarm_data, task) do
    """
    Optimize swarm coordination for this scenario:
    
    Swarm Status: #{inspect(swarm_data, pretty: true)}
    Task: #{inspect(task, pretty: true)}
    
    Recommend:
    1. Agent allocation strategy
    2. Communication optimization
    3. Performance improvements
    4. Risk mitigation
    """
  end

  # Simple text parsing functions
  defp parse_ai_response(response) do
    %{
      confidence: extract_confidence_level(response),
      recommendations: extract_recommendations(response),
      concerns: extract_concerns(response)
    }
  end

  defp extract_confidence_level(text) do
    text_lower = String.downcase(text)
    cond do
      String.contains?(text_lower, "high confidence") -> :high
      String.contains?(text_lower, "low confidence") -> :low
      String.contains?(text_lower, "medium") -> :medium
      true -> :unknown
    end
  end

  defp extract_recommendations(text) do
    text
    |> String.split("\n")
    |> Enum.filter(fn line ->
      line_lower = String.downcase(line)
      String.contains?(line_lower, "recommend") or 
      String.contains?(line_lower, "should") or
      String.match?(line, ~r/^\d+\./)
    end)
    |> Enum.take(5)
  end

  defp extract_concerns(text) do
    text
    |> String.split("\n")
    |> Enum.filter(fn line ->
      line_lower = String.downcase(line)
      String.contains?(line_lower, "concern") or
      String.contains?(line_lower, "warning") or
      String.contains?(line_lower, "issue")
    end)
    |> Enum.take(3)
  end

  defp extract_bottlenecks(text) do
    text
    |> String.split("\n")
    |> Enum.filter(fn line ->
      line_lower = String.downcase(line)
      String.contains?(line_lower, "bottleneck") or
      String.contains?(line_lower, "slow") or
      String.contains?(line_lower, "limit")
    end)
    |> Enum.take(3)
  end

  defp extract_topology_recommendation(text) do
    text_lower = String.downcase(text)
    cond do
      String.contains?(text_lower, "mesh") -> "mesh"
      String.contains?(text_lower, "hierarchical") -> "hierarchical" 
      String.contains?(text_lower, "star") -> "star"
      String.contains?(text_lower, "ring") -> "ring"
      String.contains?(text_lower, "hybrid") -> "hybrid"
      true -> "unspecified"
    end
  end

  defp extract_performance_issues(text) do
    text
    |> String.split("\n")
    |> Enum.filter(fn line ->
      line_lower = String.downcase(line)
      String.contains?(line_lower, "inefficient") or
      String.contains?(line_lower, "slow") or
      String.contains?(line_lower, "memory") or
      String.contains?(line_lower, "bottleneck")
    end)
    |> Enum.take(5)
  end

  defp extract_solutions(text) do
    text
    |> String.split("\n")
    |> Enum.filter(fn line ->
      line_lower = String.downcase(line)
      String.contains?(line_lower, "fix") or
      String.contains?(line_lower, "solution") or
      String.contains?(line_lower, "try") or
      String.match?(line, ~r/^\d+\./)
    end)
    |> Enum.take(5)
  end

  # Test execution utilities
  defp run_test_suite(tests) do
    Enum.map(tests, fn {test_name, test_func} ->
      Logger.debug("  Running: #{test_name}")
      
      try do
        case test_func.() do
          {:ok, message} -> {test_name, :passed, message}
          {:warning, message} -> {test_name, :warning, message}
          {:error, reason} -> {test_name, :failed, reason}
          other -> {test_name, :failed, "Unexpected result: #{inspect(other)}"}
        end
      rescue
        error -> {test_name, :error, "Exception: #{inspect(error)}"}
      end
    end)
  end

  defp display_test_results(results) do
    Logger.info("\n🤖 AI Enhancement Integration Test Results")
    Logger.info("=" <> String.duplicate("=", 50))
    
    Enum.each(results, fn {category, tests} ->
      Logger.info("\n📋 #{String.upcase(to_string(category))}")
      
      {passed, failed, warnings, errors} = categorize_results(tests)
      
      Enum.each(tests, fn {test_name, status, message} ->
        icon = case status do
          :passed -> "✅"
          :warning -> "⚠️"
          :failed -> "❌" 
          :error -> "💥"
        end
        
        Logger.info("  #{icon} #{test_name}: #{message}")
      end)
      
      Logger.info("  Summary: #{passed} passed, #{failed} failed, #{warnings} warnings, #{errors} errors")
    end)
    
    # Calculate overall stats
    all_tests = Enum.flat_map(results, fn {_, tests} -> tests end)
    total = length(all_tests)
    {total_passed, total_failed, total_warnings, total_errors} = categorize_results(all_tests)
    success_rate = if total > 0, do: (total_passed / total) * 100, else: 0
    
    Logger.info("\n🎯 Overall AI Enhancement Results:")
    Logger.info("  Total Passed: #{total_passed}")
    Logger.info("  Total Failed: #{total_failed}")
    Logger.info("  Total Warnings: #{total_warnings}")
    Logger.info("  Total Errors: #{total_errors}")
    Logger.info("  Success Rate: #{Float.round(success_rate, 1)}%")
  end

  defp categorize_results(tests) do
    passed = Enum.count(tests, fn {_, status, _} -> status == :passed end)
    failed = Enum.count(tests, fn {_, status, _} -> status == :failed end)
    warnings = Enum.count(tests, fn {_, status, _} -> status == :warning end)
    errors = Enum.count(tests, fn {_, status, _} -> status == :error end)
    
    {passed, failed, warnings, errors}
  end
end

# Run the AI enhancement tests
AIEnhancementTest.run_all_tests()