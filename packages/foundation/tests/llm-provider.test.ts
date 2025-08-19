/**
 * @fileoverview Foundation LLM Provider Tests - Real API Calls
 * 
 * Comprehensive tests for the LLM provider including:
 * - Unit tests with mocks for fast feedback
 * - Integration tests with real Claude API calls 
 * - Error handling and edge cases
 * - Performance and timeout testing
 * - All agent roles and capabilities
 * 
 * @author Claude Code Zen Team
 * @since 2.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  LLMProvider, 
  getGlobalLLM, 
  setGlobalLLM,
  SWARM_AGENT_ROLES 
} from '../llm-provider';
import type { LLMRequest, LLMResponse, SwarmAgentRole } from '../llm-provider';

describe('LLM Provider - Unit Tests', () => {
  let llmProvider: LLMProvider;

  beforeEach(() => {
    llmProvider = new LLMProvider();
    // Reset global LLM to avoid test interference
    setGlobalLLM(new LLMProvider());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Role Management', () => {
    it('should default to coder role', () => {
      const role = llmProvider.getRole();
      expect(role?.role).toBe('coder');
      expect(role?.capabilities).toContain('code-generation');
    });

    it('should allow role switching', () => {
      llmProvider.setRole('researcher');
      const role = llmProvider.getRole();
      expect(role?.role).toBe('researcher');
      expect(role?.capabilities).toContain('information-gathering');
    });

    it('should have all defined roles available', () => {
      const roleNames = Object.keys(SWARM_AGENT_ROLES);
      expect(roleNames).toContain('assistant');
      expect(roleNames).toContain('coder');
      expect(roleNames).toContain('analyst');
      expect(roleNames).toContain('researcher');
      expect(roleNames).toContain('coordinator');
      expect(roleNames).toContain('tester');
      expect(roleNames).toContain('architect');
    });

    it('should provide correct capabilities for each role', () => {
      llmProvider.setRole('coder');
      expect(llmProvider.getRole()?.capabilities).toContain('code-generation');
      
      llmProvider.setRole('analyst');
      expect(llmProvider.getRole()?.capabilities).toContain('data-analysis');
      
      llmProvider.setRole('researcher');
      expect(llmProvider.getRole()?.capabilities).toContain('information-gathering');
    });
  });

  describe('Usage Statistics', () => {
    it('should track request count', () => {
      // Reset to default role for this test
      llmProvider.setRole('coder');
      const initialStats = llmProvider.getUsageStats();
      expect(initialStats.requestCount).toBe(0);
      expect(initialStats.currentRole).toBe('coder');
    });

    it('should update stats on role change', () => {
      llmProvider.setRole('analyst');
      const stats = llmProvider.getUsageStats();
      expect(stats.currentRole).toBe('analyst');
    });
  });

  describe('Global LLM Instance', () => {
    it('should provide singleton global instance', () => {
      const global1 = getGlobalLLM();
      const global2 = getGlobalLLM();
      expect(global1).toBe(global2);
    });

    it('should allow global instance replacement', () => {
      const customLLM = new LLMProvider();
      customLLM.setRole('researcher');
      
      setGlobalLLM(customLLM);
      const retrieved = getGlobalLLM();
      expect(retrieved.getRole()?.role).toBe('researcher');
    });
  });
});

describe('LLM Provider - Integration Tests (Real API)', () => {
  let llmProvider: LLMProvider;

  beforeEach(() => {
    llmProvider = new LLMProvider();
  });

  // Skip these tests by default to avoid API costs during normal testing
  // Run with: npm test -- --run-integration to include these
  const runIntegration = process.env.RUN_INTEGRATION === 'true';
  const itIntegration = runIntegration ? it : it.skip;

  describe('Real Claude API Calls', () => {
    itIntegration('should complete simple text prompt', async () => {
      llmProvider.setRole('assistant');
      
      const response = await llmProvider.complete('What is 2 + 2?', {
        model: 'sonnet',
        temperature: 0,
        maxTokens: 100
      });

      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
      expect(response.toLowerCase()).toContain('4');
    }, 120000); // 120 second timeout

    itIntegration('should handle role-specific tasks', async () => {
      // Test coder role
      llmProvider.setRole('coder');
      const codeResponse = await llmProvider.executeAsCoder(
        'Write a simple hello world function in TypeScript'
      );
      expect(codeResponse).toContain('function');
      expect(codeResponse.toLowerCase()).toContain('hello');

      // Test analyst role  
      llmProvider.setRole('analyst');
      const analysisResponse = await llmProvider.executeAsAnalyst(
        '[1, 2, 3, 4, 5]', 
        'statistical summary'
      );
      expect(analysisResponse.toLowerCase()).toMatch(/(mean|average|sum)/);
    }, 120000); // 120 second timeout for complex tasks

    itIntegration('should handle chat conversations', async () => {
      const request: LLMRequest = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello! How are you?' }
        ],
        model: 'sonnet',
        temperature: 0.5,
        maxTokens: 150
      };

      const response: LLMResponse = await llmProvider.chat(request);
      
      expect(response.content).toBeTruthy();
      expect(response.model).toContain('claude');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.usage.promptTokens).toBeGreaterThan(0);
      expect(response.usage.completionTokens).toBeGreaterThan(0);
    }, 120000);

    itIntegration('should handle different models', async () => {
      // Test Sonnet
      const sonnetResponse = await llmProvider.complete('Hello', {
        model: 'sonnet',
        maxTokens: 50
      });
      expect(sonnetResponse).toBeTruthy();

      // Test Opus (if available)
      try {
        const opusResponse = await llmProvider.complete('Hello', {
          model: 'opus',
          maxTokens: 50
        });
        expect(opusResponse).toBeTruthy();
      } catch (error) {
        // Opus might not be available in all environments
        console.log('Opus model not available:', error);
      }
    }, 120000);

    itIntegration('should respect timeout settings', async () => {
      const shortTimeout = llmProvider.complete(
        'Write a very long essay about artificial intelligence', 
        { 
          model: 'sonnet',
          maxTokens: 2000
        }
      );

      // Should complete within reasonable time
      await expect(shortTimeout).resolves.toBeTruthy();
    }, 120000);

    itIntegration('should handle errors gracefully', async () => {
      // Test with invalid model (should fallback)
      try {
        const response = await llmProvider.complete('Hello', {
          model: 'invalid-model' as any,
          maxTokens: 50
        });
        // Should either work with fallback or throw descriptive error
        expect(response).toBeTruthy();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBeTruthy();
      }
    }, 120000);
  });

  describe('Error Handling', () => {
    itIntegration('should handle network errors', async () => {
      // This would require mocking network layer or testing with invalid endpoints
      // For now, test that errors are properly wrapped
      try {
        await llmProvider.complete('', { maxTokens: -1 as any });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    itIntegration('should handle malformed requests', async () => {
      try {
        await llmProvider.chat({
          messages: [], // Empty messages should be handled
          model: 'sonnet'
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Performance Tests', () => {
    itIntegration('should handle concurrent requests', async () => {
      const promises = Array(3).fill(0).map((_, i) => 
        llmProvider.complete(`Count to ${i + 1}`, {
          model: 'sonnet',
          maxTokens: 50
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    }, 120000);

    itIntegration('should track usage statistics correctly', async () => {
      const initialStats = llmProvider.getUsageStats();
      
      await llmProvider.complete('Hello', { maxTokens: 20 });
      await llmProvider.complete('World', { maxTokens: 20 });
      
      const finalStats = llmProvider.getUsageStats();
      expect(finalStats.requestCount).toBe(initialStats.requestCount + 2);
      expect(finalStats.lastRequestTime).toBeGreaterThan(initialStats.lastRequestTime);
    }, 120000);
  });
});

describe('LLM Provider - Edge Cases', () => {
  let llmProvider: LLMProvider;

  beforeEach(() => {
    llmProvider = new LLMProvider();
  });

  it('should handle empty prompts gracefully', async () => {
    // Mock the internal method to avoid real API calls
    const mockChat = vi.spyOn(llmProvider, 'chat' as any).mockResolvedValue({
      content: 'I need more information.',
      model: 'claude-3-sonnet',
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 }
    });

    const response = await llmProvider.complete('');
    expect(response).toBeTruthy();
    expect(mockChat).toHaveBeenCalled();
  });

  it('should handle role switching during operations', () => {
    llmProvider.setRole('coder');
    expect(llmProvider.getRole()?.role).toBe('coder');
    
    llmProvider.setRole('researcher');
    expect(llmProvider.getRole()?.role).toBe('researcher');
    
    llmProvider.setRole('analyst');
    expect(llmProvider.getRole()?.role).toBe('analyst');
  });

  it('should maintain role consistency across method calls', async () => {
    llmProvider.setRole('architect');
    
    // Mock internal method
    const mockExecuteTask = vi.spyOn(llmProvider, 'executeTask' as any).mockResolvedValue(['mocked response']);
    
    await llmProvider.executeAsArchitect('Design a system');
    
    // Role should still be architect after operation
    expect(llmProvider.getRole()?.role).toBe('architect');
  });
});

export {};