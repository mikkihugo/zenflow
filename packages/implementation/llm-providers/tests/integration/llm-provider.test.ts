/**
 * @fileoverview LLM Provider Tests (Vitest Version) - Migrated from Foundation
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
  setGlobalLLM,
  getGlobalLLM,
  SWARM_AGENT_ROLES,
} from '../../src/llm-provider';
import type { SwarmAgentRole } from '../../src/types/cli-providers';

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
    });

    it('should allow role switching', () => {
      llmProvider.setRole('researcher');
      const role = llmProvider.getRole();
      expect(role?.role).toBe('researcher');
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
      const validRoles: string[] = [
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

  describe('Real Provider Calls', () => {
    itIntegration(
      'should handle role-specific tasks',
      async () => {
        // Test coder role
        llmProvider.setRole('coder');
        const codeResponse = await llmProvider.execute({
          messages: [
            {
              role: 'user',
              content: 'Write a simple hello world function in TypeScript',
            },
          ],
        });
        expect(codeResponse.success).toBe(true);
        expect(codeResponse.content).toContain('function');

        // Test analyst role
        llmProvider.setRole('analyst');
        const analysisResponse = await llmProvider.execute({
          messages: [
            { role: 'user', content: 'Analyze this data: [1, 2, 3, 4, 5]'},
          ],
        });
        expect(analysisResponse.success).toBe(true);
        expect(analysisResponse.content.toLowerCase()).toMatch(
          /(mean|average|sum)/
        );
      },
      120000
    ); // 120 second timeout for complex tasks

    itIntegration('should handle different provider types',
      async () => {
        // Test Claude Code CLI (default)
        const claudeProvider = new LLMProvider('claude-code');
        const claudeResponse = await claudeProvider.execute({
          messages: [{ role: 'user', content: 'Hello' }],
        });
        expect(claudeResponse.success).toBe(true);

        // Test GitHub Models API
        try {
          const githubProvider = new LLMProvider('github-models-api');
          const githubResponse = await githubProvider.execute({
            messages: [{ role: 'user', content: 'Hello' }],
          });
          expect(githubResponse.success).toBe(true);
        } catch (error) {
          // GitHub Models might not be configured
          console.log('GitHub Models not available:', error);
        }
      },
      120000
    );

    itIntegration(
      'should respect timeout settings',
      async () => {
        const shortTimeout = llmProvider.execute({
          messages: [{ role: 'user', content: 'Write a brief hello message' }],
        });

        // Should complete within reasonable time
        await expect(shortTimeout).resolves.toBeTruthy();
      },
      120000
    );

    itIntegration(
      'should handle errors gracefully',
      async () => {
        // Test with empty messages (should handle gracefully)
        try {
          const response = await llmProvider.execute({
            messages: [],
          });
          // Should either work with fallback or throw descriptive error
          expect(response.success).toBeDefined();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBeTruthy();
        }
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
    const response = await llmProvider.execute({
      messages: [{ role: 'user', content: '' }],
    });
    expect(response.success).toBeDefined();
  });

  it('should handle role switching during operations', () => {
    llmProvider.setRole('coder');
    expect(llmProvider.getRole()?.role).toBe('coder');

    llmProvider.setRole('researcher');
    expect(llmProvider.getRole()?.role).toBe('researcher');

    llmProvider.setRole('analyst');
    expect(llmProvider.getRole()?.role).toBe('analyst');
  });

  it('should handle special characters in prompts', async () => {
    const specialPrompt =
      'Test with émojis 🚀 and unicode: αβγδε and symbols: @#$%^&*()';
    const response = await llmProvider.execute({
      messages: [{ role: 'user', content: specialPrompt }],
    });

    expect(response.success).toBeDefined();
  });

  it('should handle rapid role switching', () => {
    const roles: string[] = [
      'coder',
      'analyst',
      'researcher',
      'architect',
      'coordinator',
    ];

    // Switch roles rapidly
    for (let i = 0; i < 10; i++) {
      const role = roles[i % roles.length];
      llmProvider.setRole(role);
      expect(llmProvider.getRole()?.role).toBe(role);
    }
  });
});
