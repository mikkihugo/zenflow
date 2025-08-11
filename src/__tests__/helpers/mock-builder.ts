/**
 * Mock Builder - London School TDD Support
 *
 * Creates sophisticated mocks for interaction-focused testing
 */

import { vi } from 'vitest';
import type { MockConfiguration, MockObject } from './types.ts';

export class MockBuilder {
  private static instance: MockBuilder;
  private globalConfig: MockConfiguration;

  constructor(config: MockConfiguration = { strategy: 'hybrid' }) {
    this.globalConfig = config;
  }

  static getInstance(config?: MockConfiguration): MockBuilder {
    if (!MockBuilder.instance) {
      MockBuilder.instance = new MockBuilder(config);
    }
    return MockBuilder.instance;
  }

  /**
   * Create a mock object for a class/interface - London School approach
   *
   * @param type
   * @param config
   */
  create<T>(type: new (...args: any[]) => T, config: MockConfiguration = this.globalConfig): T {
    const mockObj: MockObject = {};
    const prototype = type.prototype;

    // Get all methods from the prototype
    const methods = this.extractMethods(prototype);

    for (const method of methods) {
      mockObj[method] = this.createMethodMock(method, config);
    }

    // Add interaction tracking for London School
    if (config?.trackInteractions) {
      this.addInteractionTracking(mockObj);
    }

    return mockObj as T;
  }

  /**
   * Create a partial mock with specific overrides
   *
   * @param overrides
   * @param config
   */
  createPartial<T>(overrides: Partial<T>, config: MockConfiguration = this.globalConfig): T {
    const mockObj: MockObject = {};

    Object.keys(overrides).forEach((key) => {
      const value = overrides[key as keyof T];
      if (typeof value === 'function') {
        mockObj[key] = vi.fn(value as any);
      } else {
        mockObj[key] = value;
      }
    });

    if (config?.trackInteractions) {
      this.addInteractionTracking(mockObj);
    }

    return mockObj as T;
  }

  /**
   * Create spies on an existing object - Hybrid approach
   *
   * @param obj
   * @param methods
   */
  createSpy<T extends object>(obj: T, methods?: (keyof T)[]): T {
    const spy = { ...obj };
    const methodsToSpy = methods || Object.getOwnPropertyNames(Object.getPrototypeOf(obj));

    methodsToSpy.forEach((method) => {
      if (typeof obj[method] === 'function') {
        spy[method] = vi.spyOn(obj, method as any);
      }
    });

    return spy;
  }

  /**
   * Create common dependency mocks for Claude Code Flow
   */
  createCommonMocks() {
    return {
      // Memory Store mock
      memoryStore: this.create(
        class MemoryStore {
          initialize() {}
          store() {}
          retrieve() {}
          delete() {}
          query() {}
          close() {}
        }
      ),

      // Neural Engine mock
      neuralEngine: this.create(
        class NeuralEngine {
          initialize() {}
          processInput() {}
          trainModel() {}
          predict() {}
          optimize() {}
        }
      ),

      // Swarm Orchestrator mock
      swarmOrchestrator: this.create(
        class SwarmOrchestrator {
          initialize() {}
          spawnAgent() {}
          orchestrateTask() {}
          getAgentStatus() {}
          terminateAgent() {}
          getSwarmStatus() {}
        }
      ),

      // MCP Server mock
      mcpServer: this.create(
        class MCPServer {
          initialize() {}
          handleMessage() {}
          registerTool() {}
          shutdown() {}
        }
      ),

      // Database mock
      database: this.create(
        class Database {
          connect() {}
          disconnect() {}
          query() {}
          transaction() {}
        }
      ),

      // File System mock
      fileSystem: this.create(
        class FileSystem {
          readFile() {}
          writeFile() {}
          mkdir() {}
          exists() {}
          stat() {}
        }
      ),
    };
  }

  /**
   * Create expectation builders for London School interaction testing
   *
   * @param mock
   */
  createExpectations<T>(mock: T) {
    const expectations = {
      // Verify method was called with specific arguments
      toHaveBeenCalledWith: (method: keyof T, ...args: any[]) => {
        const mockMethod = (mock as any)[method];
        expect(mockMethod).toHaveBeenCalledWith(...args);
        return expectations;
      },

      // Verify call order for interaction sequences
      toHaveBeenCalledInOrder: (methods: (keyof T)[]) => {
        const calls = methods.map((method) => {
          const mockMethod = (mock as any)[method];
          return mockMethod.mock.invocationCallOrder[0];
        });

        for (let i = 1; i < calls.length; i++) {
          expect(calls[i - 1]).toBeLessThan(calls[i]);
        }
        return expectations;
      },

      // Verify interaction patterns
      toHaveInteractionPattern: (pattern: string) => {
        const interactions = (mock as any).__interactions || [];
        const patternFound = this.matchInteractionPattern(interactions, pattern);
        expect(patternFound).toBe(true);
        return expectations;
      },

      // Verify no unexpected interactions
      toHaveNoUnexpectedInteractions: () => {
        const interactions = (mock as any).__interactions || [];
        const expected = (mock as any).__expectedInteractions || [];
        const unexpected = interactions.filter((i: any) => !expected.includes(i.method));
        expect(unexpected).toHaveLength(0);
        return expectations;
      },
    };

    return expectations;
  }

  /**
   * Reset all mocks - useful for test isolation
   *
   * @param mocks
   */
  resetAllMocks(mocks: Record<string, any>) {
    Object.values(mocks).forEach((mock) => {
      if (mock && typeof mock === 'object') {
        Object.values(mock).forEach((method) => {
          if (vi.isMockFunction(method)) {
            (method as vi.Mock).mockReset();
          }
        });

        // Clear interaction tracking
        if (mock.__interactions) {
          mock.__interactions = [];
        }
      }
    });
  }

  private extractMethods(prototype: any): string[] {
    const methods: string[] = [];
    let current = prototype;

    while (current && current !== Object.prototype) {
      Object.getOwnPropertyNames(current).forEach((name) => {
        if (name !== 'constructor' && typeof current?.[name] === 'function') {
          if (!methods.includes(name)) {
            methods.push(name);
          }
        }
      });
      current = Object.getPrototypeOf(current);
    }

    return methods;
  }

  private createMethodMock(methodName: string, config: MockConfiguration): vi.Mock {
    const mock = vi.fn();

    if (config?.autoGenerate) {
      // Auto-generate reasonable return values based on method name
      if (methodName.startsWith('get') || methodName.startsWith('find')) {
        mock.mockResolvedValue({});
      } else if (methodName.startsWith('is') || methodName.startsWith('has')) {
        mock.mockReturnValue(true);
      } else if (methodName.startsWith('create') || methodName.startsWith('save')) {
        mock.mockResolvedValue({ id: 'generated-id' });
      }
    }

    return mock;
  }

  private addInteractionTracking(mockObj: MockObject) {
    const interactions: any[] = [];
    mockObj.__interactions = interactions;

    // Wrap all mock functions to track interactions
    Object.keys(mockObj).forEach((key) => {
      const originalMock = mockObj[key];
      if (vi.isMockFunction(originalMock)) {
        mockObj[key] = vi.fn((...args: any[]) => {
          interactions.push({
            method: key,
            args,
            timestamp: Date.now(),
          });
          return originalMock(...args);
        });
      }
    });
  }

  private matchInteractionPattern(interactions: any[], pattern: string): boolean {
    // Simple pattern matching for interaction sequences
    // Pattern format: "method1 -> method2 -> method3"
    const expectedSequence = pattern.split(' -> ').map((s) => s.trim());
    const actualSequence = interactions.map((i) => i.method);

    // Check if expected sequence exists in actual sequence
    for (let i = 0; i <= actualSequence.length - expectedSequence.length; i++) {
      let matches = true;
      for (let j = 0; j < expectedSequence.length; j++) {
        if (actualSequence[i + j] !== expectedSequence[j]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }

    return false;
  }
}

// Convenience functions for common patterns
export const mockBuilder = MockBuilder.getInstance();

export function createLondonMocks(config?: Partial<MockConfiguration>) {
  const londonConfig: MockConfiguration = {
    strategy: 'strict',
    trackInteractions: true,
    autoGenerate: true,
    autoReset: true,
    ...config,
  };

  return new MockBuilder(londonConfig);
}

export function createClassicalMocks(config?: Partial<MockConfiguration>) {
  const classicalConfig: MockConfiguration = {
    strategy: 'minimal',
    trackInteractions: false,
    autoGenerate: false,
    autoReset: false,
    ...config,
  };

  return new MockBuilder(classicalConfig);
}
