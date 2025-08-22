/**
 * @fileoverview Jest Primary Test Setup for AI Development
 * 
 * This file sets up the Jest testing environment specifically for AI-focused
 * development workflows. It includes enhanced matchers, AI tool mocks, and
 * environment configuration optimized for claude-code-cli, gemini-cli testing.
 * 
 * Features:
 * - Enhanced matchers for AI workflow assertions
 * - Mock configurations for LLM providers
 * - Test utilities for async AI operations
 * - Environment setup for AI tools
 * - Memory leak prevention for long-running AI tests
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.44
 * @version 2.0.0
 */

import 'jest-extended';

// Global Jest configuration
import { jest } from '@jest/globals';

// Set up proper event handling to prevent memory leaks
import { EventEmitter } from 'eventemitter3';

// Increase max listeners globally to prevent warnings during AI operations
EventEmitter.defaultMaxListeners = 50;

// Mock process.exit to prevent tests from actually exiting
const mockExit = jest.fn();
Object.defineProperty(process, 'exit', {
  value: mockExit,
  writable: true,
});

// Set up timeout handling for AI operations
const originalSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = ((callback: (...args: any[]) => void, delay?: number, ...args: any[]) => {
  // Limit timeouts to max 120 seconds for AI operations
  const safeDelay = Math.min(delay||0, 120000);
  return originalSetTimeout(callback, safeDelay, ...args);
}) as typeof setTimeout;

// Enhanced matchers for AI testing
expect.extend({
  /**
   * Test if a value is within a specific range (useful for AI confidence scores)
   */
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    }
    return {
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false,
    };
  },

  /**
   * Test if an AI response contains expected structure
   */
  toMatchAIResponse(received: any, expected: { 
    confidence?: number; 
    reasoning?: string; 
    data?: any; 
  }) {
    const hasConfidence = typeof received?.confidence ==='number';
    const hasReasoning = typeof received?.reasoning === 'string';
    const hasData = received?.data !== undefined;
    
    const pass = hasConfidence && hasReasoning && hasData;
    
    return {
      message: () =>
        pass
          ? `expected AI response not to match structure`
          : `expected AI response to have confidence (number), reasoning (string), and data fields`,
      pass,
    };
  },

  /**
   * Test if a promise resolves within AI operation timeout
   */
  async toResolveWithinAITimeout(received: Promise<any>, timeoutMs: number = 60000) {
    let timeoutId: NodeJS.Timeout;
    try {
      const result = await Promise.race([
        received,
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('AI operation timeout')), timeoutMs);
        })
      ]);
      
      clearTimeout(timeoutId);
      return {
        message: () => `expected promise not to resolve within ${timeoutMs}ms`,
        pass: true,
      };
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      return {
        message: () => `expected promise to resolve within ${timeoutMs}ms but got: ${error}`,
        pass: false,
      };
    }
  },

  /**
   * Test if LLM call was made with proper parameters
   */
  toHaveBeenCalledWithLLMParams(received: any, expected: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }) {
    const calls = received.mock?.calls||[];
    const validCall = calls.some((call: any[]) => {
      const params = call[0];
      return (
        (!expected.model||params?.model === expected.model) &&
        (!expected.temperature||Math.abs(params?.temperature - expected.temperature) < 0.01) &&
        (!expected.maxTokens||params?.maxTokens === expected.maxTokens) &&
        (!expected.systemPrompt||params?.systemPrompt?.includes(expected.systemPrompt))
      );
    });

    return {
      message: () =>
        validCall
          ? `expected LLM not to be called with parameters ${JSON.stringify(expected)}`
          : `expected LLM to be called with parameters ${JSON.stringify(expected)}`,
      pass: validCall,
    };
  },
});

// Global AI test utilities
(globalThis as any).aiTestUtils = {
  /**
   * Create a mock LLM provider for testing
   */
  createMockLLMProvider: (responses: string[] = ['Mock AI response']) => ({
    name: 'mock-provider',
    generateText: jest.fn().mockImplementation(() => Promise.resolve({
      text: responses[0]||'Mock AI response',
      confidence: 0.9,
      reasoning: 'AI analysis complete with high confidence',
      data: { analysis: responses[0]||'Mock AI response'},
      usage: { inputTokens: 100, outputTokens: 50 },
    })),
    generateStream: jest.fn().mockImplementation(async function*() {
      const response = responses[0]||'Mock AI response';
      for (const char of response) {
        yield { text: char, confidence: 0.9 };
      }
    }),
  }),

  /**
   * Create a mock AI tool chain
   */
  createMockToolChain: (tools: string[] = ['read', 'write', 'execute']) => ({
    tools,
    execute: jest.fn().mockImplementation((toolName: string, params: any) => 
      Promise.resolve({
        tool: toolName,
        result: `Mock result for ${toolName}`,
        success: true,
        params,
      })
    ),
    chain: jest.fn().mockImplementation((operations: any[]) =>
      Promise.resolve({
        operations,
        results: operations.map(op => ({ ...op, success: true })),
        overallSuccess: true,
      })
    ),
  }),

  /**
   * Create a mock Claude Code CLI instance
   */
  createMockClaudeCode: () => ({
    execute: jest.fn().mockImplementation((command: string) =>
      Promise.resolve({
        command,
        output: `Mock output for: ${command}`,
        success: true,
        exitCode: 0,
      })
    ),
    readFile: jest.fn().mockImplementation((path: string) =>
      Promise.resolve(`Mock file content for: ${path}`)
    ),
    writeFile: jest.fn().mockImplementation((path: string, content: string) =>
      Promise.resolve({ path, success: true })
    ),
  }),

  /**
   * Create a mock configuration object for AI testing
   */
  createMockAIConfig: (overrides: any = {}) => ({
    llm: {
      provider: 'mock',
      model: 'mock-model',
      temperature: 0.7,
      maxTokens: 4000,
      ...overrides.llm,
    },
    tools: {
      enabled: true,
      timeout: 30000,
      ...overrides.tools,
    },
    memory: {
      type: 'memory',
      maxSize: 1000,
      ...overrides.memory,
    },
    neural: {
      enabled: false,
      ...overrides.neural,
    },
    ...overrides,
  }),

  /**
   * Wait for AI operation to complete
   */
  waitForAIOperation: (ms: number = 1000) => 
    new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create a temporary directory for AI testing
   */
  createTempDir: async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const os = await import('node:os');

    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'claude-zen-jest-')
    );
    return tempDir;
  },

  /**
   * Clean up temporary directory
   */
  cleanupTempDir: async (dirPath: string) => {
    const fs = await import('node:fs/promises');
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors in tests
    }
  },

  /**
   * Mock logger for AI operations
   */
  createMockLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  }),
};

// Mock console methods for cleaner test output
const originalConsole = { ...console };
(globalThis as any).restoreConsole = () => {
  Object.assign(console, originalConsole);
};

// Suppress console output during tests (can be restored per test)
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
console.info = jest.fn();
console.debug = jest.fn();

// Environment variables for AI testing
process.env.NODE_ENV = 'test';
process.env.ZEN_TEST_MODE = 'true';
process.env.AI_TEST_MODE = 'true';
process.env.CLAUDE_CODE_TEST = 'true';

// Global timeout for AI operations in tests
jest.setTimeout(60000);

// Clean up after tests to prevent memory leaks
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clean up any test timeouts
  if ((globalThis as any).cleanupTestTimeouts) {
    (globalThis as any).cleanupTestTimeouts();
  }
  
  // Reset modules for fresh imports in each test
  // jest.resetModules(); // Uncomment if needed for isolation
});

// Global teardown
afterAll(() => {
  // Restore console
  Object.assign(console, originalConsole);
  
  // Clean up event listeners
  EventEmitter.defaultMaxListeners = 10;
});