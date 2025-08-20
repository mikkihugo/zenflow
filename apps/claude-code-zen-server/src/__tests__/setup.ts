/**
 * @fileoverview Jest Test Setup
 * 
 * Global test configuration and setup for all Jest tests
 */

import { jest, beforeAll, afterAll } from '@jest/globals';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise during testing
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.info = jest.fn(); 
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole);
});

// Global test utilities
global.testUtils = {
  // Helper to create mock epic proposals
  createMockEpic: (overrides = {}) => ({
    id: 'test-epic-001',
    title: 'Test Analytics Platform',
    businessCase: 'Build test analytics for improved decision making',
    estimatedValue: 1000000,
    estimatedCost: 400000,
    timeframe: '6 months',
    riskLevel: 'medium' as const,
    ...overrides
  }),

  // Helper to validate SAFe decision structure
  validateDecision: (decision: any) => {
    expect(decision.decision).toBeDefined();
    expect(['approve', 'reject', 'defer', 'more-information']).toContain(decision.decision);
    expect(decision.confidence).toBeGreaterThanOrEqual(0);
    expect(decision.confidence).toBeLessThanOrEqual(1);
    expect(decision.reasoning).toBeDefined();
    expect(typeof decision.reasoning).toBe('string');
  },

  // Helper to measure execution time
  measureTime: async (fn: () => Promise<any>) => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }
};

// Declare global types
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockEpic: (overrides?: any) => any;
        validateDecision: (decision: any) => void;
        measureTime: (fn: () => Promise<any>) => Promise<{ result: any; duration: number }>;
      };
    }
  }
}