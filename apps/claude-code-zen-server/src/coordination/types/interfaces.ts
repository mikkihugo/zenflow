/**
 * @file Coordination Interface Types
 * Core interface definitions for coordination layer components
 */

/**
 * Priority levels for tasks and operations
 */
export type Priority = 'low | medium' | 'high | critical';

/**
 * Risk level assessment
 */
export type RiskLevel = 'low | medium' | 'high | critical';

/**
 * Server instance interface - wraps Express.Server with additional metadata
 */
export interface ServerInstance {
  id: string;
  status: 'starting | running' | 'stopping | stopped' | 'error';
  port?: number;
  host?: string;
  uptime?: number;
  // Express server instance methods
  close?: (callback?: (err?: Error) => void) => void;
  on?: (event: string, listener: (args: any[]) => void) => void;
}

/**
 * Base error interface
 */
export interface BaseError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * Test result interface - flexible for comprehensive testing
 */
export interface TestResult {
  id?: string;
  name?: string;
  status?: 'passed | failed' | 'skipped | pending';
  success: boolean;
  duration?: number;
  error?: BaseError | string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Command result interface - flexible for CLI execution results
 */
export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: BaseError;
  timestamp: Date;
  // CLI execution specific fields
  stdout?: string;
  stderr?: string;
}

/**
 * Base API response interface
 */
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: BaseError;
  timestamp: Date;
  requestId?: string;
}

/**
 * Basic neural configuration for coordination components
 */
export interface NeuralConfig {
  modelType: 'feedforward | recurrent' | 'transformer';
  layers: number[];
  activations: string[];
  learningRate: number;
  batchSize?: number;
  epochs?: number;
}

/**
 * Neural network interface for coordination layer
 */
export interface NeuralNetworkInterface {
  id: string;
  config: NeuralConfig;
  isInitialized: boolean;

  /**
   * Initialize the neural network
   */
  initialize(config: NeuralConfig): Promise<void>;

  /**
   * Train the network with data
   */
  train(
    inputs: number[][],
    outputs: number[][]
  ): Promise<{
    finalError: number;
    epochsCompleted: number;
    duration: number;
    converged: boolean;
  }>;

  /**
   * Predict output for given input
   */
  predict(inputs: number[]): Promise<number[]>;

  /**
   * Get network status
   */
  getStatus(): {
    isReady: boolean;
    accuracy?: number;
    lastTrained?: Date;
  };

  /**
   * Destroy the network and cleanup resources
   */
  destroy(): Promise<void>;

  /**
   * Export network configuration and weights
   */
  export?(): Promise<{
    weights: number[][];
    biases: number[][];
    config: NeuralConfig;
  }>;

  /**
   * Import network configuration and weights
   */
  import?(data: {
    weights: number[][];
    biases: number[][];
    config: NeuralConfig;
  }): Promise<void>;

  /**
   * Get performance metrics (optional method)
   */
  getMetrics?(): Promise<{
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    lastTrainingTime?: number;
    inferenceTime?: number;
  }>;
}

/**
 * WASM neural binding interface for coordination
 */
export interface WasmNeuralBinding {
  /**
   * Load WASM module
   */
  loadWasm(): Promise<WebAssembly.Module | Record<string, unknown>>;

  /**
   * Check if WASM is available
   */
  isWasmAvailable(): boolean;

  /**
   * Get WASM capabilities
   */
  getWasmCapabilities(): string[];

  /**
   * Create neural network instance
   */
  createNeuralNetwork(config: NeuralConfig): Promise<NeuralNetworkInterface>;
}

/**
 * Agent-related types
 */
export type AgentId = string;
export type AgentType =
  // Core hierarchy types
  | 'queen'
  | 'commander'
  | 'drone'
  | 'worker'
  // Queen types
  | 'primary'
  | 'secondary'
  | 'backup'
  // Specialized agent types
  | 'coder'
  | 'analyst'
  | 'researcher'
  | 'architect'
  | 'optimizer'
  | 'ui-designer'
  | 'ux-designer'
  | 'accessibility-specialist'
  | 'ops'
  | 'coordinator'
  | 'data'
  // Performance specialized
  | 'performance-analyzer'
  | 'cache-optimizer'
  | 'memory-optimizer'
  | 'latency-optimizer'
  | 'bottleneck-analyzer'
  // Migration and modernization
  | 'legacy-analyzer'
  | 'modernization-agent'
  | 'migration-coordinator'
  | 'migration-plan'
  | 'system-architect'
  | 'database-architect'
  // Testing specialists
  | 'unit-tester'
  | 'integration-tester'
  | 'e2e-tester'
  | 'performance-tester'
  | 'tdd-london-swarm'
  | 'production-validator'
  // Development specialists
  | 'developer'
  | 'fullstack-dev'
  | 'dev-backend-api'
  | 'api-dev'
  | 'analyze-code-quality'
  | 'security-analyzer'
  | 'refactoring-analyzer'
  | 'user-guide-writer';

export type AgentStatus =
  // Basic states
  | 'idle'
  | 'active'
  | 'busy'
  | 'error'
  | 'offline'
  // Extended states
  | 'initializing'
  | 'terminated';

export interface AgentCapabilities {
  canCoordinate: boolean;
  canExecute: boolean;
  canAnalyze: boolean;
  maxConcurrency: number;
  supportedTaskTypes: string[];
  // Extended capabilities for agent registry compatibility
  languages?: string[];
  frameworks?: string[];
  domains?: string[];
  tools?: string[];
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  errorRate: number;
  lastActivity: Date;
  uptime: number;
  // Extended metrics for agent registry compatibility
  successRate?: number;
  averageResponseTime?: number;
  tasksInProgress?: number;
  cpuUsage?: number; // CPU usage for queen-coordinator
  memoryUsage?: number; // Memory usage for queen-coordinator
  diskUsage?: number; // Disk usage for queen-coordinator
  resourceUsage?: {
    memory: number;
    cpu: number;
    disk: number;
    network?: number;
  };
}

export interface AgentError extends BaseError {
  agentId: AgentId;
  agentType: AgentType;
  recoverable: boolean;
  type?: string; // Optional type property used by queen-coordinator
  context?: Record<string, unknown>; // Optional context used by queen-coordinator
  severity?: string; // Optional severity used by queen-coordinator
  resolved?: boolean; // Optional resolved flag used by queen-coordinator
}

/**
 * Queen-specific types
 */
export interface QueenCommanderConfig {
  maxAgents: number;
  coordinationTimeout: number;
  failoverEnabled: boolean;
}

export interface QueenTemplate {
  id: string;
  name: string;
  description: string;
  type: AgentType; // Used by queen-coordinator
  defaultConfig: QueenCommanderConfig;
  // Additional properties used by queen-coordinator
  capabilities?: AgentCapabilities;
  config?: {
    autonomyLevel?: number;
    learningEnabled?: boolean;
    adaptationEnabled?: boolean;
    [key: string]: any;
  };
  environment?: Partial<QueenEnvironment>;
}

export interface QueenCluster {
  id: string;
  queens: QueenId[];
  coordinationStrategy: string;
  agents?: Map<string, CompleteAgentState>; // Agent map for queen-coordinator
}

export interface QueenPool {
  available: QueenId[] | number; // Can be array or count
  busy: QueenId[];
  offline: QueenId[];
  // Extended properties used by queen-coordinator
  availableAgents: Array<{
    id: string;
    swarmId: string;
    type: AgentType;
    instance: number;
  }>;
  currentSize: number;
  minSize: number;
  maxSize: number;
  template: QueenTemplate;
  name: string;
  // Additional properties for pool management
  id?: string;
  type?: AgentType;
  capacity?: number;
  queens?: QueenId[];
  busyAgents?: Array<{
    id: string;
    swarmId: string;
    type: AgentType;
    instance: number;
  }>;
}

export interface QueenHealth {
  status: 'healthy | degraded' | 'critical | unhealthy';
  lastCheck: Date;
  issues: string[];
  queenId?: string; // Queen ID for queen-coordinator
  metrics?: Record<string, unknown>; // Health metrics for queen-coordinator
  components?: Record<
    string,
    {
      status: 'healthy | degraded' | 'critical | unhealthy';
      lastCheck?: Date;
      metrics?: Record<string, unknown>;
    }
  >; // Optional components used by queen-coordinator
  overall?: {
    status: 'healthy | degraded' | 'critical | unhealthy';
    score: number;
  }; // Optional overall health used by queen-coordinator
}

export type QueenType = 'primary | secondary' | 'backup';

export interface QueenCapabilities extends AgentCapabilities {
  canManageSwarms: boolean;
  maxSwarms: number;
}

export interface QueenConfig {
  type: QueenType;
  capabilities: QueenCapabilities;
  failoverConfig: {
    enabled: boolean;
    timeout: number;
  };
  // Additional coordination configuration
  autonomyLevel?: number;
  learningEnabled?: boolean;
  adaptationEnabled?: boolean;
  maxTasksPerHour?: number;
  maxConcurrentTasks?: number;
  timeoutThreshold?: number;
  reportingInterval?: number;
  heartbeatInterval?: number;
  permissions?: string[];
  trustedAgents?: string[];
  expertise?: string[];
  preferences?: Record<string, unknown>;
}

export interface QueenEnvironment {
  production: boolean;
  region: string;
  cluster: string;
  // Additional environment properties
  platform?: string;
  runtime?: string;
  version?: string;
  workingDirectory?: string;
  tempDirectory?: string;
  logDirectory?: string;
  apiEndpoints?: Record<string, string>;
  credentials?: Record<string, unknown>;
  availableTools?: string[];
  toolConfigs?: Record<string, unknown>;
  resources?: {
    availableMemory?: number;
    availableCpu?: number;
    availableDisk?: number;
    [key: string]: any;
  };
}

export interface QueenState {
  id: QueenId;
  status: AgentStatus;
  activeSwarms: number;
  lastActivity: Date;
}

/**
 * Complete agent state interface - includes all properties used by queen-coordinator
 */
export interface CompleteAgentState {
  id: {
    id: string;
    swarmId: string;
    type: AgentType;
    instance: number;
  };
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  metrics: AgentMetrics;
  workload: number;
  health: number;
  config: {
    name: string;
    type: AgentType;
    swarmId: string;
    autonomyLevel: number;
    learningEnabled: boolean;
    adaptationEnabled: boolean;
    [key: string]: any;
  };
  environment: {
    platform?: string;
    runtime?: string;
    version?: string;
    workingDirectory?: string;
    tempDirectory?: string;
    logDirectory?: string;
    [key: string]: any;
  };
  lastHeartbeat: Date;
  errors: Array<{
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
  }>;
}

/**
 * Simple AgentState interface - for basic agent state operations
 */
export interface AgentState {
  id: string;
  type: AgentType;
  status: AgentStatus;
  health: number;
  lastHeartbeat: Date;
  workload: number;
}

/**
 * Legacy AgentState alias for CompleteAgentState compatibility
 */
export type CompleteAgentStateAlias = CompleteAgentState;

export type QueenId = string;

export interface QueenMetrics extends AgentMetrics {
  swarmsManaged: number;
  coordinationSuccessRate: number;
}

export interface TaskCompletionData {
  taskId: string;
  result: any;
  duration: number;
  success: boolean;
  swarmId: string;
  priority?: string;
  metrics?: {
    qualityScore?: number;
    resourceUsage?: Record<string, unknown>;
    resourceSavings?: {
      cpu?: number;
      memory?: number;
    };
    timeReduction?: number;
    resourceUtilization?: number;
  };
  collaboratedWith?: string[];
  taskType?: string;
  domain?: string;
  agentTypes?: string[];
  agentCount?: number;
  commanderType?: string;
}

export interface SwarmDegradationData {
  swarmId: string;
  degradationLevel: number;
  affectedAgents: AgentId[];
  reason: string;
}

export type QueenStatus = AgentStatus;

/**
 * Event Bus and Logger interfaces
 * Re-export from event-system package for better integration
 */
export type { SystemEvent } from '@claude-zen/intelligence';

// Use the comprehensive EventBus from event-system package instead of basic interface
export interface EventBus {
  emit(event: string | symbol, args: any[]): boolean;
  on(event: string | symbol, handler: (args: any[]) => void): this;
  off(event: string | symbol, handler: (args: any[]) => void): this;
  // Add the missing emitSystemEvent method
  emitSystemEvent(event: SystemEvent): boolean;
}

export interface Logger {
  debug(message: string, args: any[]): void;
  info(message: string, args: any[]): void;
  warn(message: string, args: any[]): void;
  error(message: string, args: any[]): void;
}
