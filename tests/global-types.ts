/**
 * Global type declarations for test setup files
 * 
 * This file provides type declarations for all global test utilities
 * and helpers used across different test setups.
 */

import type { Mock } from 'vitest';

// Extend global namespace with test utilities
declare global {
  // Note: Vitest globals (expect, describe, it, etc.) are automatically available
  // when globals: true is set in vitest.config.ts

  // London TDD utilities
  function createInteractionSpy(name: string): Mock;
  function verifyInteractions(spy: Mock, expectedCalls: Array<{args: unknown[]}>): void;
  function createMockFactory<T>(defaults?: Partial<T>): (overrides?: Partial<T>) => T;
  function waitForInteraction(spy: Mock, timeout?: number): Promise<void>;
  function simulateProtocolHandshake(mockProtocol: Mock): void;

  // Hybrid TDD utilities
  function createCoordinationMock<T>(defaults?: Partial<T>): (overrides?: Partial<T>) => T;
  function generateNeuralTestData(config: NeuralTestConfig): NeuralTestData[];
  function expectNearlyEqual(actual: number, expected: number, tolerance?: number): void;
  function testWithApproach(approach: 'london''' | '''classical', testFn: () => void'' | ''Promise<void>): void'' | ''Promise<void>;
  function createMemoryTestScenario(type:'sqlite | lancedb' | 'json'): any;

  // Classical TDD utilities
  function generateTestMatrix(rows: number, cols: number, fillFn?: (i: number, j: number) => number): number[][];
  function generateTestVector(size: number, fillFn?: (i: number) => number): number[];
  function generateXORData(): Array<{ input: number[]; output: number[] }>;
  function generateLinearData(samples: number, noise?: number): Array<{ input: number[]; output: number[] }>;
  function expectPerformance(fn: () => void, maxTimeMs: number): number;
  function expectMemoryUsage(fn: () => void, maxMemoryMB: number): number'' | ''undefined;
  function expectArrayNearlyEqual(actual: number[], expected: number[], tolerance?: number): void;
  function expectMatrixNearlyEqual(actual: number[][], expected: number[][], tolerance?: number): void;

  // Integration test utilities
  function createTestServer(port: number, routes?: Array<any>): Promise<unknown>;
  function createTestClient(baseURL: string): any;
  function waitForPort(port: number, timeout?: number): Promise<boolean>;
  function setupDatabaseFixtures(fixtures: any): Promise<void>;
  function createMockSwarm(agentCount?: number): any;
  function simulateSwarmWorkflow(swarm: any, tasks: unknown[]): Promise<unknown[]>;
  function createMockMCPClient(): any;
  function validateMCPProtocol(message: any): void;

  // E2E test utilities
  function createE2EClient(serviceName: string): any;
  function runE2EWorkflow(workflow: Array<any>): Promise<Array<any>>;
  function measureE2EPerformance(operation: () => Promise<unknown>, expectedMaxTime: number): Promise<any>;

  // Test state and configuration
  var testConfig: any;
  var testDatabases: any;
  var testFixtures: any;
  var mockFetch: Mock;
  var originalFetch: typeof fetch;
  var mockWebSocket: Mock;
  var originalWebSocket: typeof WebSocket;
  var mockSpawn: Mock;
  var e2eConfig: any;
  var testProcesses: Map<string, any>;
  var testMetrics: any;
  var e2eTestData: any;
  var testUtils: any;
  var restoreConsole: () => void;

  // Performance monitoring
  var testStartTime: number;
  var testStartMemory: NodeJS.MemoryUsage;
  var lastTestExecutionTime: number;
  var lastTestMemoryDelta: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };

  // GC function (optional for memory testing)
  type GCFunction = () => void;
  var gc: GCFunction'' | ''undefined;

  // Neural test types
  interface NeuralTestConfig {
    type:'xor''' | '''linear';
    samples?: number;
    noise?: number;
  }

  interface NeuralTestData {
    input: number[];
    output: number[];
  }
}

export {};