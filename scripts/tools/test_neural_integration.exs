#!/usr/bin/env elixir

Mix.install([
  {:rustler, "~> 0.32"}
])

# Load the local neural bridge module
Code.require_file("lib/swarm_service/neural/bridge.ex", "/home/mhugo/code/singularity-engine/active-services/swarm-service")

defmodule NeuralIntegrationTest do
  @moduledoc """
  Comprehensive test suite for ruv-FANN neural network integration.
  
  This test validates:
  - Neural network creation and configuration
  - Training with sample data
  - Inference and prediction
  - Swarm coordination with neural networks
  - GPU acceleration (if available)
  - Performance benchmarks
  """

  require Logger

  def run_all_tests() do
    Logger.info("🧠 Starting ruv-FANN Neural Network Integration Tests")
    
    results = %{
      neural_network_tests: test_neural_networks(),
      swarm_coordination_tests: test_swarm_coordination(),
      gpu_acceleration_tests: test_gpu_acceleration(),
      performance_tests: test_performance(),
      integration_tests: test_full_integration()
    }
    
    display_test_results(results)
    results
  end

  # ===========================================================================
  # Neural Network Core Tests
  # ===========================================================================

  def test_neural_networks() do
    Logger.info("🔬 Testing neural network operations...")
    
    tests = [
      {"Create Neural Network", &test_create_network/0},
      {"Train Neural Network", &test_train_network/0},
      {"Run Inference", &test_run_inference/0},
      {"Network Information", &test_network_info/0},
      {"Save/Load Network", &test_save_load_network/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_create_network() do
    case SwarmService.Neural.Bridge.create_network(3, [10, 5], 2) do
      {:ok, network_id} when is_binary(network_id) ->
        Process.put(:test_network_id, network_id)
        {:ok, "Network created with ID: #{network_id}"}
      
      {:error, reason} ->
        {:error, "Failed to create network: #{reason}"}
      
      other ->
        {:error, "Unexpected response: #{inspect(other)}"}
    end
  end

  defp test_train_network() do
    network_id = Process.get(:test_network_id)
    
    if network_id do
      # XOR training data
      inputs = [
        [0.0, 0.0, 1.0],
        [0.0, 1.0, 1.0], 
        [1.0, 0.0, 1.0],
        [1.0, 1.0, 1.0]
      ]
      
      outputs = [
        [0.0, 1.0],  # 0 XOR 0 = 0
        [1.0, 0.0],  # 0 XOR 1 = 1
        [1.0, 0.0],  # 1 XOR 0 = 1
        [0.0, 1.0]   # 1 XOR 1 = 0
      ]
      
      case SwarmService.Neural.Bridge.train_network(network_id, inputs, outputs, 100) do
        {:ok, message} ->
          {:ok, "Training completed: #{message}"}
        
        {:error, reason} ->
          {:error, "Training failed: #{reason}"}
      end
    else
      {:error, "No network ID available for training test"}
    end
  end

  defp test_run_inference() do
    network_id = Process.get(:test_network_id)
    
    if network_id do
      test_input = [1.0, 0.0, 1.0]  # Should predict XOR result
      
      case SwarmService.Neural.Bridge.run_network(network_id, test_input) do
        {:ok, outputs} when is_list(outputs) ->
          {:ok, "Inference successful: #{inspect(outputs)}"}
        
        {:error, reason} ->
          {:error, "Inference failed: #{reason}"}
      end
    else
      {:error, "No network ID available for inference test"}
    end
  end

  defp test_network_info() do
    network_id = Process.get(:test_network_id)
    
    if network_id do
      case SwarmService.Neural.Bridge.get_network_info(network_id) do
        {:ok, info} when is_map(info) ->
          {:ok, "Network info retrieved: #{inspect(info)}"}
        
        {:error, reason} ->
          {:error, "Failed to get network info: #{reason}"}
      end
    else
      {:error, "No network ID available for info test"}
    end
  end

  defp test_save_load_network() do
    network_id = Process.get(:test_network_id)
    
    if network_id do
      temp_file = "/tmp/test_network_#{:rand.uniform(10000)}.fann"
      
      case SwarmService.Neural.Bridge.save_network(network_id, temp_file) do
        {:ok, _message} ->
          case SwarmService.Neural.Bridge.load_network(temp_file) do
            {:ok, new_network_id} ->
              File.rm(temp_file)  # Cleanup
              {:ok, "Save/load successful: #{new_network_id}"}
            
            {:error, reason} ->
              {:error, "Load failed: #{reason}"}
          end
        
        {:error, reason} ->
          {:error, "Save failed: #{reason}"}
      end
    else
      {:error, "No network ID available for save/load test"}
    end
  end

  # ===========================================================================
  # Swarm Coordination Tests
  # ===========================================================================

  def test_swarm_coordination() do
    Logger.info("🐝 Testing swarm coordination...")
    
    tests = [
      {"Create Swarm", &test_create_swarm/0},
      {"Spawn Intelligent Agent", &test_spawn_agent/0},
      {"Coordinate Swarm", &test_coordinate_swarm/0},
      {"Swarm Status", &test_swarm_status/0},
      {"Update Agent Brain", &test_update_agent_brain/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_create_swarm() do
    swarm_id = "test_swarm_#{:rand.uniform(10000)}"
    
    case SwarmService.Neural.Bridge.create_swarm(swarm_id, 10, "mesh") do
      {:ok, returned_id} when returned_id == swarm_id ->
        Process.put(:test_swarm_id, swarm_id)
        {:ok, "Swarm created: #{swarm_id}"}
      
      {:error, reason} ->
        {:error, "Failed to create swarm: #{reason}"}
      
      other ->
        {:error, "Unexpected response: #{inspect(other)}"}
    end
  end

  defp test_spawn_agent() do
    swarm_id = Process.get(:test_swarm_id)
    
    if swarm_id do
      agent_config = %{
        inputs: 5,
        hidden: [10, 5],
        outputs: 3,
        capabilities: ["learning", "coordination"]
      }
      
      case SwarmService.Neural.Bridge.spawn_agent(swarm_id, agent_config) do
        {:ok, agent_id} when is_binary(agent_id) ->
          Process.put(:test_agent_id, agent_id)
          {:ok, "Agent spawned: #{agent_id}"}
        
        {:error, reason} ->
          {:error, "Failed to spawn agent: #{reason}"}
      end
    else
      {:error, "No swarm ID available for agent spawn test"}
    end
  end

  defp test_coordinate_swarm() do
    swarm_id = Process.get(:test_swarm_id)
    
    if swarm_id do
      task_data = %{
        type: "coordination_test",
        complexity: "medium",
        expected_agents: 1
      }
      
      case SwarmService.Neural.Bridge.coordinate_swarm(swarm_id, task_data) do
        {:ok, message} ->
          {:ok, "Coordination successful: #{message}"}
        
        {:error, reason} ->
          {:error, "Coordination failed: #{reason}"}
      end
    else
      {:error, "No swarm ID available for coordination test"}
    end
  end

  defp test_swarm_status() do
    swarm_id = Process.get(:test_swarm_id)
    
    if swarm_id do
      case SwarmService.Neural.Bridge.get_swarm_status(swarm_id) do
        {:ok, status} when is_map(status) ->
          {:ok, "Status retrieved: #{inspect(status)}"}
        
        {:error, reason} ->
          {:error, "Failed to get status: #{reason}"}
      end
    else
      {:error, "No swarm ID available for status test"}
    end
  end

  defp test_update_agent_brain() do
    agent_id = Process.get(:test_agent_id)
    
    if agent_id do
      neural_data = [0.1, 0.2, 0.3, 0.4, 0.5]  # Sample weight updates
      
      case SwarmService.Neural.Bridge.update_agent_brain(agent_id, neural_data) do
        {:ok, message} ->
          {:ok, "Brain update successful: #{message}"}
        
        {:error, reason} ->
          {:error, "Brain update failed: #{reason}"}
      end
    else
      {:error, "No agent ID available for brain update test"}
    end
  end

  # ===========================================================================
  # GPU Acceleration Tests
  # ===========================================================================

  def test_gpu_acceleration() do
    Logger.info("🚀 Testing GPU acceleration...")
    
    tests = [
      {"Initialize GPU", &test_initialize_gpu/0},
      {"GPU Status", &test_gpu_status/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_initialize_gpu() do
    case SwarmService.Neural.Bridge.initialize_gpu(1000) do
      {:ok, message} ->
        {:ok, "GPU initialized: #{message}"}
      
      {:error, reason} ->
        # GPU failure is acceptable in test environments
        {:warning, "GPU not available: #{reason}"}
    end
  end

  defp test_gpu_status() do
    case SwarmService.Neural.Bridge.get_gpu_status() do
      {:ok, status} ->
        {:ok, "GPU status: #{status}"}
      
      {:error, reason} ->
        {:warning, "GPU status check failed: #{reason}"}
    end
  end

  # ===========================================================================
  # Performance Tests
  # ===========================================================================

  def test_performance() do
    Logger.info("⚡ Testing performance...")
    
    tests = [
      {"Network Creation Speed", &test_creation_speed/0},
      {"Training Performance", &test_training_speed/0},
      {"Inference Latency", &test_inference_speed/0},
      {"Swarm Coordination Speed", &test_swarm_speed/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_creation_speed() do
    start_time = :os.system_time(:microsecond)
    
    # Create multiple networks
    results = Enum.map(1..10, fn _i ->
      SwarmService.Neural.Bridge.create_network(5, [10], 3)
    end)
    
    end_time = :os.system_time(:microsecond)
    duration_ms = (end_time - start_time) / 1000
    
    successful = Enum.count(results, fn
      {:ok, _} -> true
      _ -> false
    end)
    
    if successful == 10 do
      {:ok, "Created 10 networks in #{Float.round(duration_ms, 2)}ms"}
    else
      {:error, "Only #{successful}/10 networks created successfully"}
    end
  end

  defp test_training_speed() do
    case SwarmService.Neural.Bridge.create_network(3, [10], 2) do
      {:ok, network_id} ->
        inputs = [[1.0, 0.0, 1.0], [0.0, 1.0, 0.0]]
        outputs = [[1.0, 0.0], [0.0, 1.0]]
        
        start_time = :os.system_time(:microsecond)
        result = SwarmService.Neural.Bridge.train_network(network_id, inputs, outputs, 50)
        end_time = :os.system_time(:microsecond)
        
        duration_ms = (end_time - start_time) / 1000
        
        case result do
          {:ok, _} ->
            {:ok, "Training completed in #{Float.round(duration_ms, 2)}ms"}
          {:error, reason} ->
            {:error, "Training failed: #{reason}"}
        end
      
      {:error, reason} ->
        {:error, "Failed to create network for training test: #{reason}"}
    end
  end

  defp test_inference_speed() do
    case SwarmService.Neural.Bridge.create_network(5, [15, 10], 3) do
      {:ok, network_id} ->
        test_input = [1.0, 0.5, 0.0, 0.8, 0.3]
        
        # Run multiple inferences to get average time
        times = Enum.map(1..100, fn _i ->
          start_time = :os.system_time(:microsecond)
          SwarmService.Neural.Bridge.run_network(network_id, test_input)
          end_time = :os.system_time(:microsecond)
          end_time - start_time
        end)
        
        avg_time_us = Enum.sum(times) / length(times)
        avg_time_ms = avg_time_us / 1000
        
        {:ok, "Average inference time: #{Float.round(avg_time_ms, 3)}ms"}
      
      {:error, reason} ->
        {:error, "Failed to create network for inference test: #{reason}"}
    end
  end

  defp test_swarm_speed() do
    swarm_id = "perf_test_swarm"
    
    case SwarmService.Neural.Bridge.create_swarm(swarm_id, 5, "mesh") do
      {:ok, _} ->
        start_time = :os.system_time(:microsecond)
        
        # Spawn multiple agents
        agent_results = Enum.map(1..5, fn _i ->
          SwarmService.Neural.Bridge.spawn_agent(swarm_id, %{})
        end)
        
        end_time = :os.system_time(:microsecond)
        duration_ms = (end_time - start_time) / 1000
        
        successful_agents = Enum.count(agent_results, fn
          {:ok, _} -> true
          _ -> false
        end)
        
        {:ok, "Spawned #{successful_agents}/5 agents in #{Float.round(duration_ms, 2)}ms"}
      
      {:error, reason} ->
        {:error, "Failed to create swarm for performance test: #{reason}"}
    end
  end

  # ===========================================================================
  # Full Integration Tests
  # ===========================================================================

  def test_full_integration() do
    Logger.info("🔗 Testing full system integration...")
    
    tests = [
      {"System Health Check", &test_system_health/0},
      {"Complete Workflow", &test_complete_workflow/0},
      {"Stress Test", &test_stress_scenario/0}
    ]
    
    run_test_suite(tests)
  end

  defp test_system_health() do
    case SwarmService.Neural.Bridge.health_check() do
      {:ok, health_data} when is_map(health_data) ->
        {:ok, "System health: #{inspect(health_data)}"}
      
      {:error, reason} ->
        {:error, "Health check failed: #{reason}"}
    end
  end

  defp test_complete_workflow() do
    workflow_id = "workflow_#{:rand.uniform(10000)}"
    
    with {:ok, network_id} <- SwarmService.Neural.Bridge.create_network(4, [8, 4], 2),
         {:ok, swarm_id} <- SwarmService.Neural.Bridge.create_swarm(workflow_id, 3, "star"),
         {:ok, agent_id} <- SwarmService.Neural.Bridge.spawn_agent(swarm_id, %{}),
         {:ok, _} <- SwarmService.Neural.Bridge.train_network(network_id, 
                       [[1.0, 0.0, 1.0, 0.0]], [[1.0, 0.0]], 10),
         {:ok, _} <- SwarmService.Neural.Bridge.run_network(network_id, [1.0, 0.0, 1.0, 0.0]),
         {:ok, _} <- SwarmService.Neural.Bridge.coordinate_swarm(swarm_id, %{task: "test"}),
         {:ok, _} <- SwarmService.Neural.Bridge.update_agent_brain(agent_id, [0.1, 0.2, 0.3]) do
      
      {:ok, "Complete workflow executed successfully"}
    else
      {:error, reason} ->
        {:error, "Workflow failed: #{reason}"}
      
      other ->
        {:error, "Unexpected workflow result: #{inspect(other)}"}
    end
  end

  defp test_stress_scenario() do
    # Test system under moderate load
    tasks = Enum.map(1..5, fn i ->
      Task.async(fn ->
        network_id = "stress_network_#{i}"
        case SwarmService.Neural.Bridge.create_network(3, [5], 2) do
          {:ok, _} -> :ok
          {:error, _} -> :error
        end
      end)
    end)
    
    results = Task.await_many(tasks, 5000)
    successful = Enum.count(results, &(&1 == :ok))
    
    if successful >= 3 do
      {:ok, "Stress test passed: #{successful}/5 operations successful"}
    else
      {:error, "Stress test failed: only #{successful}/5 operations successful"}
    end
  end

  # ===========================================================================
  # Test Utilities
  # ===========================================================================

  defp run_test_suite(tests) do
    Enum.map(tests, fn {test_name, test_func} ->
      Logger.debug("  Running: #{test_name}")
      
      try do
        case test_func.() do
          {:ok, message} ->
            {test_name, :passed, message}
          
          {:warning, message} ->
            {test_name, :warning, message}
          
          {:error, reason} ->
            {test_name, :failed, reason}
          
          other ->
            {test_name, :failed, "Unexpected result: #{inspect(other)}"}
        end
      rescue
        error ->
          {test_name, :error, "Exception: #{inspect(error)}"}
      end
    end)
  end

  defp display_test_results(results) do
    Logger.info("\n🧪 Neural Network Integration Test Results")
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
    
    total_stats = calculate_total_stats(results)
    Logger.info("\n🎯 Overall Results:")
    Logger.info("  Total Passed: #{total_stats.passed}")
    Logger.info("  Total Failed: #{total_stats.failed}")
    Logger.info("  Total Warnings: #{total_stats.warnings}")
    Logger.info("  Total Errors: #{total_stats.errors}")
    Logger.info("  Success Rate: #{Float.round(total_stats.success_rate, 1)}%")
  end

  defp categorize_results(tests) do
    passed = Enum.count(tests, fn {_, status, _} -> status == :passed end)
    failed = Enum.count(tests, fn {_, status, _} -> status == :failed end)
    warnings = Enum.count(tests, fn {_, status, _} -> status == :warning end)
    errors = Enum.count(tests, fn {_, status, _} -> status == :error end)
    
    {passed, failed, warnings, errors}
  end

  defp calculate_total_stats(results) do
    all_tests = Enum.flat_map(results, fn {_, tests} -> tests end)
    total = length(all_tests)
    
    {passed, failed, warnings, errors} = categorize_results(all_tests)
    success_rate = if total > 0, do: (passed / total) * 100, else: 0
    
    %{
      passed: passed,
      failed: failed,
      warnings: warnings,
      errors: errors,
      total: total,
      success_rate: success_rate
    }
  end
end

# Run the tests
NeuralIntegrationTest.run_all_tests()