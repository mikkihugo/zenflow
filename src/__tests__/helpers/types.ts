/**
 * Type definitions for test helper utilities
 */

export interface MockConfiguration {
  /** Mock strategy: 'strict' for London School, 'minimal' for Classical */
  strategy: 'strict' | 'minimal' | 'hybrid';
  /** Auto-generate return values based on method signatures */
  autoGenerate?: boolean;
  /** Track all method calls for interaction verification */
  trackInteractions?: boolean;
  /** Reset mocks between tests automatically */
  autoReset?: boolean;
}

export interface TestDataOptions {
  /** Seed for reproducible random data generation */
  seed?: number;
  /** Size constraints for generated data */
  size?: {
    min?: number;
    max?: number;
    default?: number;
  };
  /** Data validation rules */
  validation?: {
    required?: string[];
    optional?: string[];
    constraints?: Record<string, any>;
  };
}

export interface PerformanceTestOptions {
  /** Number of iterations for performance tests */
  iterations?: number;
  /** Warm-up iterations before measurement */
  warmup?: number;
  /** Maximum acceptable execution time (ms) */
  maxExecutionTime?: number;
  /** Memory usage thresholds */
  memoryThresholds?: {
    heap?: number;
    external?: number;
  };
  /** Statistical analysis options */
  statistics?: {
    percentiles?: number[];
    includeVariance?: boolean;
    includeDeviation?: boolean;
  };
}

export interface IntegrationTestConfig {
  /** Test environment setup */
  environment?: {
    database?: 'memory' | 'sqlite' | 'postgres';
    filesystem?: 'mock' | 'temp' | 'real';
    network?: 'mock' | 'localhost' | 'integration';
  };
  /** Service dependencies to start */
  services?: string[];
  /** Cleanup strategy */
  cleanup?: 'aggressive' | 'conservative' | 'manual';
  /** Timeout for integration operations */
  timeout?: number;
}

export interface AssertionOptions {
  /** Precision for floating point comparisons */
  precision?: number;
  /** Tolerance for performance assertions */
  tolerance?: number;
  /** Custom error messages */
  messages?: Record<string, string>;
  /** Retry configuration for flaky assertions */
  retry?: {
    attempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
  };
}

// Mock object types
export interface MockObject {
  [key: string]: jest.Mock | MockObject;
}

export interface MockBuilder {
  create<T>(type: new (...args: any[]) => T, config?: MockConfiguration): T;
  createPartial<T>(overrides: Partial<T>): T;
  createSpy<T extends object>(obj: T, methods?: (keyof T)[]): T;
}

// Test data types
export interface UserTestData {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ProjectTestData {
  name: string;
  path: string;
  type: 'typescript' | 'javascript' | 'python' | 'rust';
  structure: Record<string, any>;
  dependencies?: string[];
}

export interface SwarmTestData {
  id: string;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  agents: AgentTestData[];
  configuration: Record<string, any>;
}

export interface AgentTestData {
  id: string;
  type: 'researcher' | 'coder' | 'analyst' | 'tester' | 'coordinator';
  capabilities: string[];
  state: 'idle' | 'working' | 'error' | 'completed';
}

// Performance measurement types
export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: {
    heap: number;
    external: number;
    total: number;
  };
  cpuUsage?: number;
  throughput?: number;
  statistics?: {
    mean: number;
    median: number;
    p95: number;
    p99: number;
    variance: number;
    standardDeviation: number;
  };
}

// Integration test types
export interface DatabaseTestHelper {
  setup(): Promise<void>;
  cleanup(): Promise<void>;
  seed(data: any[]): Promise<void>;
  reset(): Promise<void>;
  getConnection(): any;
}

export interface FileSystemTestHelper {
  createTempDir(): Promise<string>;
  createFile(path: string, content: string): Promise<void>;
  cleanup(): Promise<void>;
  mockFileSystem(): void;
  restoreFileSystem(): void;
}

export interface NetworkTestHelper {
  startMockServer(port?: number): Promise<void>;
  stopMockServer(): Promise<void>;
  mockRequest(path: string, response: any): void;
  captureRequests(): any[];
  clearRequests(): void;
}
