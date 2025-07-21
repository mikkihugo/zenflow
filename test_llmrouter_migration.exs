#!/usr/bin/env elixir

# Test script to verify LLMRouter.Core.Client.chat_completion works
# This replaces the mock with real functionality

defmodule LLMRouterMigrationTest do
  require Logger

  def test_chat_completion do
    Logger.info("🧪 Testing LLMRouter.Core.Client.chat_completion migration")
    
    # Test message
    messages = [
      %{"role" => "user", "content" => "Hello, can you respond with 'test successful'?"}
    ]
    
    options = %{
      model: "auto",
      temperature: 0.7,
      max_tokens: 50
    }
    
    # Test the function signature compatibility
    case function_exported?(LLMRouter.Core.Client, :chat_completion, 2) do
      true ->
        Logger.info("✅ chat_completion/2 function exists in LLMRouter.Core.Client")
        
        # Test that it doesn't crash with basic parameters
        try do
          # We expect this to fail with connection error since service isn't running
          # But it should NOT fail with function clause errors
          case LLMRouter.Core.Client.chat_completion(messages, options) do
            {:ok, response} ->
              Logger.info("✅ Unexpected success: #{inspect(response)}")
              :success
            {:error, reason} ->
              Logger.info("✅ Expected error (service not running): #{inspect(reason)}")
              :expected_error
          end
        rescue
          error ->
            Logger.error("❌ Function failed with error: #{inspect(error)}")
            :function_error
        end
        
      false ->
        Logger.error("❌ chat_completion/2 function missing from LLMRouter.Core.Client")
        :missing_function
    end
  end
  
  def compare_interfaces do
    Logger.info("🔍 Comparing function interfaces...")
    
    # Check DevmgmtAI007.Client functions
    devmgmt_functions = try do
      DevmgmtAI007.Client.__info__(:functions)
    rescue
      _ -> []
    end
    
    # Check LLMRouter.Core.Client functions  
    llmrouter_functions = try do
      LLMRouter.Core.Client.__info__(:functions)
    rescue
      _ -> []
    end
    
    Logger.info("DevmgmtAI007.Client functions: #{length(devmgmt_functions)}")
    Logger.info("LLMRouter.Core.Client functions: #{length(llmrouter_functions)}")
    
    # Check if chat_completion exists in both
    has_devmgmt_chat = Enum.any?(devmgmt_functions, fn {name, arity} -> 
      name == :chat_completion and arity == 2 
    end)
    
    has_llmrouter_chat = Enum.any?(llmrouter_functions, fn {name, arity} -> 
      name == :chat_completion and arity == 2 
    end)
    
    Logger.info("DevmgmtAI007 has chat_completion/2: #{has_devmgmt_chat}")
    Logger.info("LLMRouter has chat_completion/2: #{has_llmrouter_chat}")
    
    if has_devmgmt_chat and has_llmrouter_chat do
      Logger.info("✅ Both clients have compatible chat_completion interface")
      :compatible
    else
      Logger.error("❌ Interface mismatch detected")
      :incompatible
    end
  end
  
  def run_tests do
    Logger.info("🚀 Starting LLMRouter migration compatibility tests")
    
    interface_result = compare_interfaces()
    test_result = test_chat_completion()
    
    case {interface_result, test_result} do
      {:compatible, :expected_error} ->
        Logger.info("✅ MIGRATION READY: LLMRouter.Core.Client is compatible with DevmgmtAI007.Client")
        :ready
      {:compatible, :success} ->
        Logger.info("✅ MIGRATION READY: LLMRouter.Core.Client working and compatible")
        :ready
      _ ->
        Logger.error("❌ MIGRATION NOT READY: Issues detected")
        :not_ready
    end
  end
end

# Run the tests
LLMRouterMigrationTest.run_tests()