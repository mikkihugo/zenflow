#!/usr/bin/env elixir

# Test script to verify Migration Batch 2 - Functions from DevmgmtAI007.Client to LLMRouter.Core.Client

defmodule MigrationBatch2Test do
  require Logger

  @migrated_functions [
    {:batch_requests, 2},
    {:bumblebee_emergency_chat_completion, 1},
    {:embedding, 2},
    {:emergency_chat_completion, 2},
    {:llm_service_chat_completion, 1},
    {:singularity_llm_completion, 3},
    {:stream_completion, 2},
    {:structured_completion, 3}
  ]

  def test_all_functions_exist do
    Logger.info("🧪 Testing Migration Batch 2: Verifying all 8 functions exist in LLMRouter.Core.Client")
    
    results = Enum.map(@migrated_functions, fn {func_name, arity} ->
      exists = function_exported?(LLMRouter.Core.Client, func_name, arity)
      
      if exists do
        Logger.info("✅ #{func_name}/#{arity} - FOUND")
        {:ok, func_name}
      else
        Logger.error("❌ #{func_name}/#{arity} - MISSING")
        {:error, func_name}
      end
    end)
    
    success_count = Enum.count(results, fn {status, _} -> status == :ok end)
    total_count = length(results)
    
    Logger.info("\n📊 Migration Summary:")
    Logger.info("   Total functions: #{total_count}")
    Logger.info("   Successfully migrated: #{success_count}")
    Logger.info("   Missing: #{total_count - success_count}")
    
    if success_count == total_count do
      Logger.info("\n✅ MIGRATION BATCH 2 COMPLETE: All functions successfully migrated!")
      :success
    else
      Logger.error("\n❌ MIGRATION INCOMPLETE: #{total_count - success_count} functions still missing")
      :incomplete
    end
  end

  def test_function_signatures do
    Logger.info("\n🔍 Testing function signatures and basic compatibility...")
    
    # Test emergency_chat_completion
    Logger.info("\n1. Testing emergency_chat_completion/2")
    try do
      # Should not crash with proper arguments
      case LLMRouter.Core.Client.emergency_chat_completion([%{"role" => "user", "content" => "test"}]) do
        {:error, _} -> Logger.info("   ✅ Function callable (expected error without running service)")
        {:ok, _} -> Logger.info("   ✅ Function callable (unexpected success)")
      end
    rescue
      error -> Logger.error("   ❌ Function failed: #{inspect(error)}")
    end
    
    # Test embedding
    Logger.info("\n2. Testing embedding/2")
    try do
      case LLMRouter.Core.Client.embedding("test text") do
        {:error, _} -> Logger.info("   ✅ Function callable (expected error without running service)")
        {:ok, _} -> Logger.info("   ✅ Function callable (unexpected success)")
      end
    rescue
      error -> Logger.error("   ❌ Function failed: #{inspect(error)}")
    end
    
    # Test structured_completion
    Logger.info("\n3. Testing structured_completion/3")
    try do
      schema = %{"type" => "object", "properties" => %{"name" => %{"type" => "string"}}}
      messages = [%{"role" => "user", "content" => "test"}]
      
      case LLMRouter.Core.Client.structured_completion(messages, schema) do
        {:error, _} -> Logger.info("   ✅ Function callable (expected error without running service)")
        {:ok, _} -> Logger.info("   ✅ Function callable (unexpected success)")
      end
    rescue
      error -> Logger.error("   ❌ Function failed: #{inspect(error)}")
    end
    
    # Test batch_requests
    Logger.info("\n4. Testing batch_requests/2")
    try do
      requests = [%{endpoint: "/test", data: %{}}]
      
      case LLMRouter.Core.Client.batch_requests(requests) do
        {:error, _} -> Logger.info("   ✅ Function callable (expected error without running service)")
        {:ok, _} -> Logger.info("   ✅ Function callable (unexpected success)")
      end
    rescue
      error -> Logger.error("   ❌ Function failed: #{inspect(error)}")
    end
    
    # Test legacy compatibility functions
    Logger.info("\n5. Testing legacy compatibility layers")
    
    # llm_service_chat_completion
    try do
      params = %{messages: [%{"role" => "user", "content" => "test"}], model: "gpt-4"}
      case LLMRouter.Core.Client.llm_service_chat_completion(params) do
        {:error, _} -> Logger.info("   ✅ llm_service_chat_completion/1 callable")
        {:ok, _} -> Logger.info("   ✅ llm_service_chat_completion/1 callable")
      end
    rescue
      error -> Logger.error("   ❌ llm_service_chat_completion failed: #{inspect(error)}")
    end
    
    # singularity_llm_completion
    try do
      params = %{messages: [%{"role" => "user", "content" => "test"}]}
      case LLMRouter.Core.Client.singularity_llm_completion("gpt-4", params, []) do
        {:error, _} -> Logger.info("   ✅ singularity_llm_completion/3 callable")
        {:ok, _} -> Logger.info("   ✅ singularity_llm_completion/3 callable")
      end
    rescue
      error -> Logger.error("   ❌ singularity_llm_completion failed: #{inspect(error)}")
    end
  end

  def run_tests do
    Logger.info("🚀 Starting Migration Batch 2 Verification Tests")
    Logger.info("=" <> String.duplicate("=", 50))
    
    # Test 1: Check all functions exist
    existence_result = test_all_functions_exist()
    
    # Test 2: Check function signatures
    test_function_signatures()
    
    Logger.info("\n" <> String.duplicate("=", 50))
    
    case existence_result do
      :success ->
        Logger.info("✅ MIGRATION BATCH 2 VERIFICATION: PASSED")
        Logger.info("All 8 functions have been successfully migrated from DevmgmtAI007.Client to LLMRouter.Core.Client")
        :passed
      :incomplete ->
        Logger.error("❌ MIGRATION BATCH 2 VERIFICATION: FAILED")
        Logger.error("Some functions are still missing from LLMRouter.Core.Client")
        :failed
    end
  end
end

# Run the tests
MigrationBatch2Test.run_tests()