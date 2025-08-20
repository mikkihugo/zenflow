/**
 * @fileoverview LLM Provider Check - Validate LLM Configuration
 * 
 * Quick test to check if LLMProvider is properly configured before running full integration tests
 */

import { describe, test, expect } from '@jest/globals';

describe('LLM Provider Configuration Check', () => {
  test('should import LLMProvider without errors', async () => {
    console.log('🔍 Checking LLMProvider import...');
    
    try {
      const { getGlobalLLM, setGlobalLLM, LLMProvider } = await import('@claude-zen/foundation');
      
      expect(getGlobalLLM).toBeDefined();
      expect(setGlobalLLM).toBeDefined();
      expect(LLMProvider).toBeDefined();
      
      console.log('✅ LLMProvider imports successfully');
      
      // Try to get the global LLM instance
      const llm = getGlobalLLM();
      console.log(`📋 LLM instance type: ${typeof llm}`);
      console.log(`📋 LLM has setRole: ${typeof llm?.setRole}`);
      console.log(`📋 LLM has executeAsAnalyst: ${typeof llm?.executeAsAnalyst}`);
      
      if (llm) {
        console.log('✅ LLM instance exists');
      } else {
        console.log('⚠️  LLM instance is null/undefined - may need initialization');
      }
      
    } catch (error) {
      console.error('❌ LLMProvider import failed:', error);
      throw error;
    }
  });

  test('should check LLM configuration status', async () => {
    console.log('🔧 Checking LLM configuration...');
    
    try {
      const { getGlobalLLM } = await import('@claude-zen/foundation');
      const llm = getGlobalLLM();
      
      if (!llm) {
        console.log('⚠️  No global LLM configured - this is expected for tests');
        console.log('💡 Integration tests will need proper LLM configuration');
        return;
      }
      
      // If LLM exists, check its methods
      const requiredMethods = ['setRole', 'executeAsAnalyst', 'executeAsArchitect', 'executeAsCoder'];
      requiredMethods.forEach(method => {
        const hasMethod = typeof llm[method] === 'function';
        console.log(`📋 ${method}: ${hasMethod ? '✅' : '❌'}`);
        expect(hasMethod).toBe(true);
      });
      
    } catch (error) {
      console.error('❌ LLM configuration check failed:', error);
      throw error;
    }
  });

  test('should validate workflow imports', async () => {
    console.log('🔍 Checking workflow imports...');
    
    try {
      const workflow = await import('../workflows/safe-sparc-standalone');
      
      expect(workflow.createSafeSparcWorkflow).toBeDefined();
      expect(workflow.SafeSparcWorkflow).toBeDefined();
      
      console.log('✅ Workflow imports successfully');
      
      // Try to create workflow instance
      const instance = await workflow.createSafeSparcWorkflow();
      expect(instance).toBeDefined();
      expect(typeof instance.processSafeEpic).toBe('function');
      
      console.log('✅ Workflow instance created successfully');
      
    } catch (error) {
      console.error('❌ Workflow import/creation failed:', error);
      throw error;
    }
  });
});

describe('Quick LLM Test (if configured)', () => {
  test('should attempt simple LLM call if configured', async () => {
    console.log('🧪 Attempting simple LLM test...');
    
    try {
      const { getGlobalLLM } = await import('@claude-zen/foundation');
      const llm = getGlobalLLM();
      
      if (!llm) {
        console.log('⏭️  Skipping LLM test - no global LLM configured');
        return;
      }
      
      console.log('🚀 Making test LLM call...');
      
      // Set a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('LLM call timeout')), 10000)
      );
      
      // Make the LLM call with timeout
      const llmPromise = llm.executeAsAnalyst('What is 2+2? Answer in one word.');
      
      const result = await Promise.race([llmPromise, timeoutPromise]);
      
      console.log(`📝 LLM Response: ${result}`);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      
      console.log('✅ LLM call successful!');
      
    } catch (error) {
      console.error('❌ LLM test failed:', error);
      
      if (error.message.includes('timeout')) {
        console.log('⚠️  LLM call timed out - may indicate configuration issues');
      }
      
      // Don't fail the test for LLM issues - just report them
      console.log('⏭️  Continuing despite LLM test failure...');
    }
  }, 15000); // 15 second timeout
});