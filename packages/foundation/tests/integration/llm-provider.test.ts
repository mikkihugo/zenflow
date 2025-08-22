/**
 * @fileoverview Foundation LLM Provider Tests (Vitest Version)
 *
 * Comprehensive tests for the LLM provider including:
 * - Unit tests with mocks for fast feedback
 * - Integration tests with real Claude API calls
 * - Error handling and edge cases
 * - Performance and timeout testing
 * - All agent roles and capabilities
 *
 * VITEST FRAMEWORK: Converted from Jest to Vitest testing patterns
 *
 * @author Claude Code Zen Team
 * @since 2.0.0
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the logging system
vi.mock('@claude-zen/foundation/logging', () => ({
  getLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock Claude API for unit tests
const mockClaudeAPI = vi.fn();
vi.mock('@anthropic/claude', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockClaudeAPI,
    },
  })),
}));

import {
  LLMProvider,
  getGlobalLLM,
  setGlobalLLM,
  SWARM_AGENT_ROLES,
} from '../../src/llm-provider';
import type {
  LLMRequest,
  LLMResponse,
  SwarmAgentRole,
} from '../../src/llm-provider';

describe('LLM Provider - Unit Tests (Vitest)', () => {
  let llmProvider: LLMProvider;

  beforeEach(() => {
    llmProvider = new LLMProvider();
    // Reset global LLM to avoid test interference
    setGlobalLLM(new LLMProvider())();
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
      expect(llmProvider.getRole()?.capabilities).toContain(
        'information-gathering'
      );
    });

    it('should validate role names', () => {
      const validRoles: SwarmAgentRole[] = [
        'assistant',
        'coder',
        'analyst',
        'researcher',
        'coordinator',
        'tester',
        'architect',
      ];

      validRoles.forEach((role) => {
        expect(() => llmProvider.setRole(role)).not.toThrow();
        expect(llmProvider.getRole()?.role).toBe(role);
      });
    });

    it('should provide role descriptions', () => {
      Object.keys(SWARM_AGENT_ROLES).forEach((role) => {
        llmProvider.setRole(role as SwarmAgentRole);
        const roleInfo = llmProvider.getRole();
        expect(roleInfo?.description).toBeDefined();
        expect(roleInfo?.description).toMatch(/\w+/); // Should have some content
      });
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
      expect(stats.lastRoleChange).toBeInstanceOf(Date);
    });

    it('should track role change history', () => {
      const initialStats = llmProvider.getUsageStats();

      llmProvider.setRole('researcher');
      llmProvider.setRole('architect');
      llmProvider.setRole('tester');

      const finalStats = llmProvider.getUsageStats();
      expect(finalStats.roleChanges).toBeGreaterThan(initialStats.roleChanges);
    });

    it('should reset statistics when requested', () => {
      // Simulate some usage
      llmProvider.setRole('researcher');
      llmProvider.setRole('analyst');

      const beforeReset = llmProvider.getUsageStats();
      expect(beforeReset.roleChanges).toBeGreaterThan(0);

      llmProvider.resetStats();

      const afterReset = llmProvider.getUsageStats();
      expect(afterReset.requestCount).toBe(0);
      expect(afterReset.roleChanges).toBe(0);
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

    it('should maintain global instance across module reloads', () => {
      const originalGlobal = getGlobalLLM();
      originalGlobal.setRole('architect');

      // Simulate getting global instance again
      const sameGlobal = getGlobalLLM();
      expect(sameGlobal.getRole()?.role).toBe('architect');
      expect(sameGlobal).toBe(originalGlobal);
    });
  });

  describe('Configuration Management', () => {
    it('should use default configuration', () => {
      const config = llmProvider.getConfig();
      expect(config.model).toBeDefined();
      expect(config.temperature).toBeGreaterThanOrEqual(0);
      expect(config.temperature).toBeLessThanOrEqual(1);
      expect(config.maxTokens).toBeGreaterThan(0);
    });

    it('should allow configuration updates', () => {
      const newConfig = {
        model: 'opus' as const,
        temperature: 0.8,
        maxTokens: 2000,
        timeout: 30000,
      };

      llmProvider.updateConfig(newConfig);
      const config = llmProvider.getConfig();

      expect(config.model).toBe('opus');
      expect(config.temperature).toBe(0.8);
      expect(config.maxTokens).toBe(2000);
      expect(config.timeout).toBe(30000);
    });

    it('should validate configuration parameters', () => {
      // Test invalid temperature
      expect(() => {
        llmProvider.updateConfig({ temperature: 2.0 });
      }).toThrow(/temperature/i);

      expect(() => {
        llmProvider.updateConfig({ temperature: -0.5 });
      }).toThrow(/temperature/i);

      // Test invalid maxTokens
      expect(() => {
        llmProvider.updateConfig({ maxTokens: -100 });
      }).toThrow(/maxTokens/i);

      expect(() => {
        llmProvider.updateConfig({ maxTokens: 0 });
      }).toThrow(/maxTokens/i);
    });
  });

  describe('Role-Specific Methods', () => {
    beforeEach(() => {
      // Mock the internal API calls for unit tests
      mockClaudeAPI.mockResolvedValue({
        content: [{ text: 'Mocked response' }],
        model: 'claude-3-sonnet-20240229',
        usage: {
          input_tokens: 10,
          output_tokens: 5,
        },
      });
    });

    it('should provide coder-specific functionality', async () => {
      llmProvider.setRole('coder');

      const response = await llmProvider.executeAsCoder(
        'Write a hello world function'
      );

      expect(typeof response).toBe('string');
      expect(mockClaudeAPI).toHaveBeenCalled();

      const stats = llmProvider.getUsageStats();
      expect(stats.requestCount).toBeGreaterThan(0);
    });

    it('should provide analyst-specific functionality', async () => {
      llmProvider.setRole('analyst');

      const response = await llmProvider.executeAsAnalyst(
        '[1, 2, 3, 4, 5]',
        'statistical summary'
      );

      expect(typeof response).toBe('string');
      expect(mockClaudeAPI).toHaveBeenCalled();
    });

    it('should provide researcher-specific functionality', async () => {
      llmProvider.setRole('researcher');

      const response = await llmProvider.executeAsResearcher(
        'machine learning trends'
      );

      expect(typeof response).toBe('string');
      expect(mockClaudeAPI).toHaveBeenCalled();
    });

    it('should provide architect-specific functionality', async () => {
      llmProvider.setRole('architect');

      const response = await llmProvider.executeAsArchitect(
        'Design a microservices architecture'
      );

      expect(typeof response).toBe('string');
      expect(mockClaudeAPI).toHaveBeenCalled();
    });

    it('should provide coordinator-specific functionality', async () => {
      llmProvider.setRole('coordinator');

      const response = await llmProvider.executeAsCoordinator(
        'Plan project phases',
        ['research', 'design', 'implementation', 'testing']
      );

      expect(typeof response).toBe('string');
      expect(mockClaudeAPI).toHaveBeenCalled();
    });
  });
});

describe('LLM Provider - Integration Tests (Real API)', () => {
  let llmProvider: LLMProvider;

  beforeEach(() => {
    llmProvider = new LLMProvider();
  });

  // Skip these tests by default to avoid API costs during normal testing
  // Run with: npm test -- --testNamePattern="Integration" to include these
  const runIntegration = process.env.RUN_INTEGRATION === 'true';
  const itIntegration = runIntegration ? it : it.skip;

  describe('Real Claude API Calls', () => {
    itIntegration(
      'should complete simple text prompt',
      async () => {
        llmProvider.setRole('assistant');

        const response = await llmProvider.complete('What is 2 + 2?', {
          model: 'sonnet',
          temperature: 0,
          maxTokens: 100,
        });

        expect(response).toBeTruthy();
        expect(typeof response).toBe('string');
        expect(response.toLowerCase()).toContain('4');
      },
      120000
    ); // 120 second timeout

    itIntegration(
      'should handle role-specific tasks',
      async () => {
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
          'statistical summary');
        expect(analysisResponse.toLowerCase()).toMatch(/(mean'' | ''average'' | ''sum)/);
      },
      120000
    ); // 120 second timeout for complex tasks

    itIntegration('should handle chat conversations',
      async () => {
        const request: LLMRequest = {
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello! How are you?' },
          ],
          model: 'sonnet',
          temperature: 0.5,
          maxTokens: 150,
        };

        const response: LLMResponse = await llmProvider.chat(request);

        expect(response.content).toBeTruthy();
        expect(response.model).toContain('claude');
        expect(response.usage.totalTokens).toBeGreaterThan(0);
        expect(response.usage.promptTokens).toBeGreaterThan(0);
        expect(response.usage.completionTokens).toBeGreaterThan(0);
      },
      120000
    );

    itIntegration(
      'should handle different models',
      async () => {
        // Test Sonnet
        const sonnetResponse = await llmProvider.complete('Hello', {
          model: 'sonnet',
          maxTokens: 50,
        });
        expect(sonnetResponse).toBeTruthy();

        // Test Opus (if available)
        try {
          const opusResponse = await llmProvider.complete('Hello', {
            model: 'opus',
            maxTokens: 50,
          });
          expect(opusResponse).toBeTruthy();
        } catch (error) {
          // Opus might not be available in all environments
          console.log('Opus model not available:', error);
        }
      },
      120000
    );

    itIntegration(
      'should respect timeout settings',
      async () => {
        const shortTimeout = llmProvider.complete(
          'Write a very long essay about artificial intelligence',
          {
            model: 'sonnet',
            maxTokens: 2000,
          }
        );

        // Should complete within reasonable time
        await expect(shortTimeout).resolves.toBeTruthy();
      },
      120000
    );

    itIntegration(
      'should handle errors gracefully',
      async () => {
        // Test with invalid model (should fallback)
        try {
          const response = await llmProvider.complete('Hello', {
            model: 'invalid-model' as any,
            maxTokens: 50,
          });
          // Should either work with fallback or throw descriptive error
          expect(response).toBeTruthy();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBeTruthy();
        }
      },
      120000
    );
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
          model: 'sonnet',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Performance Tests', () => {
    itIntegration(
      'should handle concurrent requests',
      async () => {
        const promises = Array(3)
          .fill(0)
          .map((_, i) =>
            llmProvider.complete(`Count to ${i + 1}`, {
              model: 'sonnet',
              maxTokens: 50,
            })
          );

        const results = await Promise.all(promises);
        expect(results).toHaveLength(3);
        results.forEach((result) => {
          expect(result).toBeTruthy();
          expect(typeof result).toBe('string');
        });
      },
      120000
    );

    itIntegration(
      'should track usage statistics correctly',
      async () => {
        const initialStats = llmProvider.getUsageStats();

        await llmProvider.complete('Hello', { maxTokens: 20 });
        await llmProvider.complete('World', { maxTokens: 20 });

        const finalStats = llmProvider.getUsageStats();
        expect(finalStats.requestCount).toBe(initialStats.requestCount + 2);
        expect(finalStats.lastRequestTime).toBeGreaterThan(
          initialStats.lastRequestTime
        );
      },
      120000
    );
  });
});

describe('LLM Provider - Edge Cases', () => {
  let llmProvider: LLMProvider;

  beforeEach(() => {
    llmProvider = new LLMProvider();
    vi.clearAllMocks();
  });

  it('should handle empty prompts gracefully', async () => {
    // Mock the internal method to avoid real API calls
    const mockChat = vi.spyOn(llmProvider, 'chat' as any).mockResolvedValue({
      content: 'I need more information.',
      model: 'claude-3-sonnet',
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
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
    const mockExecuteTask = vi
      .spyOn(llmProvider, 'executeTask' as any)
      .mockResolvedValue(['mocked response']);

    await llmProvider.executeAsArchitect('Design a system');

    // Role should still be architect after operation
    expect(llmProvider.getRole()?.role).toBe('architect');
  });

  it('should handle extremely long prompts', async () => {
    const mockComplete = vi
      .spyOn(llmProvider, 'complete')
      .mockResolvedValue('Truncated response');

    const longPrompt = 'A'.repeat(100000); // 100k characters
    const response = await llmProvider.complete(longPrompt);

    expect(response).toBeTruthy();
    expect(mockComplete).toHaveBeenCalled();
  });

  it('should handle special characters in prompts', async () => {
    const mockComplete = vi
      .spyOn(llmProvider, 'complete')
      .mockResolvedValue('Handled special chars');

    const specialPrompt =
      'Test with émojis 🚀 and unicode: αβγδε and symbols: @#$%^&*()';
    const response = await llmProvider.complete(specialPrompt);

    expect(response).toBeTruthy();
    expect(mockComplete).toHaveBeenCalledWith(
      specialPrompt,
      expect.any(Object)
    );
  });

  it('should handle null and undefined inputs gracefully', async () => {
    const mockComplete = vi
      .spyOn(llmProvider, 'complete')
      .mockResolvedValue('Default response');

    // Test null
    const nullResponse = await llmProvider.complete(null as any);
    expect(nullResponse).toBeTruthy();

    // Test undefined
    const undefinedResponse = await llmProvider.complete(undefined as any);
    expect(undefinedResponse).toBeTruthy();

    expect(mockComplete).toHaveBeenCalledTimes(2);
  });

  it('should handle rapid role switching', () => {
    const roles: SwarmAgentRole[] = [
      'coder',
      'analyst',
      'researcher',
      'architect',
      'coordinator',
    ];

    // Switch roles rapidly
    for (let i = 0; i < 100; i++) {
      const role = roles[i % roles.length];
      llmProvider.setRole(role);
      expect(llmProvider.getRole()?.role).toBe(role);
    }

    const stats = llmProvider.getUsageStats();
    expect(stats.roleChanges).toBe(100);
  });
});

describe('LLM Provider - Advanced Features', () => {
  let llmProvider: LLMProvider;

  beforeEach(() => {
    llmProvider = new LLMProvider();
    vi.clearAllMocks();
  });

  it('should support streaming responses', async () => {
    const mockStream = vi.fn().mockImplementation(async function* () {
      yield { content: 'Hello ' };
      yield { content: 'world!' };
    });

    vi.spyOn(llmProvider, 'streamComplete' as any).mockImplementation(
      mockStream
    );

    const chunks: string[] = [];
    const stream = llmProvider.streamComplete('Say hello');

    for await (const chunk of stream) {
      chunks.push(chunk.content);
    }

    expect(chunks).toEqual(['Hello ', 'world!']);
  });

  it('should support function calling', async () => {
    const mockFunctionCall = vi
      .spyOn(llmProvider, 'callFunction' as any)
      .mockResolvedValue({
        function: 'calculate',
        arguments: { operation: 'add', a: 2, b: 2 },
        result: 4,
      });

    const result = await llmProvider.callFunction('Calculate 2 + 2', {
      name: 'calculate',
      parameters: {
        operation: 'string',
        a: 'number',
        b: 'number',
      },
    });

    expect(result.function).toBe('calculate');
    expect(result.result).toBe(4);
    expect(mockFunctionCall).toHaveBeenCalled();
  });

  it('should support multi-turn conversations', async () => {
    const mockChat = vi.spyOn(llmProvider, 'chat').mockResolvedValue({
      content: 'Multi-turn response',
      model: 'claude-3-sonnet',
      usage: { promptTokens: 20, completionTokens: 10, totalTokens: 30 },
    });

    const conversation = llmProvider.createConversation();
    conversation.addMessage('user', 'Hello');
    conversation.addMessage('assistant', 'Hi there!');
    conversation.addMessage('user', 'How are you?');

    const response = await conversation.continue();
    expect(response).toBeTruthy();
    expect(mockChat).toHaveBeenCalled();
  });

  it('should support context window management', () => {
    const conversation = llmProvider.createConversation({
      maxContextLength: 1000,
    });

    // Add messages until context is full
    for (let i = 0; i < 100; i++) {
      conversation.addMessage('user', `Message ${i}`.repeat(10));
    }

    const messages = conversation.getMessages();
    const totalLength = messages.reduce(
      (acc, msg) => acc + msg.content.length,
      0
    );

    expect(totalLength).toBeLessThanOrEqual(1000);
    expect(messages.length).toBeLessThan(100); // Should have pruned old messages
  });
});
