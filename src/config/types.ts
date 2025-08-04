/**
 * @fileoverview Unified Configuration Types
 *
 * Central type definitions for all configuration across Claude-Zen
 */

/**
 * Core system configuration
 */
export interface CoreConfig {
  logger: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    file?: string;
    structured: boolean;
  };
  performance: {
    enableMetrics: boolean;
    metricsInterval: number;
    enableProfiling: boolean;
  };
  security: {
    enableSandbox: boolean;
    allowShellAccess: boolean;
    trustedHosts: string[];
  };
}

/**
 * Interface-specific configuration
 */
export interface InterfaceConfig {
  theme: 'dark' | 'light' | 'auto';
  verbosity: 'quiet' | 'normal' | 'verbose' | 'debug';
  autoCompletion: boolean;
  realTimeUpdates: boolean;
  refreshInterval: number;
  maxCommandHistory: number;
  pageSize: number;
}

/**
 * Terminal interface configuration
 */
export interface TerminalConfig {
  shell?: string;
  timeout: number;
  maxConcurrentProcesses: number;
  enableColors: boolean;
  enableProgressBars: boolean;
}

/**
 * Web interface configuration
 */
export interface WebConfig {
  port: number;
  host: string;
  enableHttps: boolean;
  corsOrigins: string[];
  staticPath: string;
  enableCompression: boolean;
}

/**
 * MCP server configuration
 */
export interface MCPConfig {
  http: {
    port: number;
    host: string;
    timeout: number;
    maxRequestSize: string;
    enableCors: boolean;
  };
  stdio: {
    timeout: number;
    maxBufferSize: number;
  };
  tools: {
    enableAll: boolean;
    enabledTools: string[];
    disabledTools: string[];
  };
}

/**
 * Memory system configuration
 */
export interface MemoryConfig {
  backend: 'sqlite' | 'lancedb' | 'json';
  directory: string;
  namespace: string;
  enableCompression: boolean;
  maxMemorySize: number;
  cacheSize: number;
  enableBackup: boolean;
  backupInterval: number;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  sqlite: {
    path: string;
    enableWAL: boolean;
    maxConnections: number;
    timeout: number;
  };
  lancedb: {
    path: string;
    enableVectorIndex: boolean;
    indexType: 'ivf' | 'hnsw';
  };
  persistence: {
    maxReaders: number;
    maxWorkers: number;
    mmapSize: number;
    cacheSize: number;
    enableBackup: boolean;
    healthCheckInterval: number;
  };
}

/**
 * Coordination/Swarm configuration
 */
export interface CoordinationConfig {
  maxAgents: number;
  heartbeatInterval: number;
  timeout: number;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  enableLoadBalancing: boolean;
  enableFailover: boolean;
  enableMetrics: boolean;
}

/**
 * Neural network configuration
 */
export interface NeuralConfig {
  enableWASM: boolean;
  enableSIMD: boolean;
  enableCUDA: boolean;
  modelPath: string;
  maxModelSize: number;
  enableTraining: boolean;
  enableInference: boolean;
  backend: 'wasm' | 'native' | 'fallback';
}

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  enablePerformanceMonitoring: boolean;
  enableResourceOptimization: boolean;
  enableMemoryOptimization: boolean;
  enableNetworkOptimization: boolean;
  benchmarkInterval: number;
}

/**
 * Unified system configuration
 */
export interface SystemConfiguration {
  core: CoreConfig;
  interfaces: {
    shared: InterfaceConfig;
    terminal: TerminalConfig;
    web: WebConfig;
    mcp: MCPConfig;
  };
  storage: {
    memory: MemoryConfig;
    database: DatabaseConfig;
  };
  coordination: CoordinationConfig;
  neural: NeuralConfig;
  optimization: OptimizationConfig;
}

/**
 * Configuration source types
 */
export interface ConfigurationSource {
  type: 'file' | 'env' | 'cli' | 'defaults';
  priority: number;
  data: Partial<SystemConfiguration>;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  path: string;
  oldValue: any;
  newValue: any;
  source: string;
  timestamp: number;
}

/**
 * Environment variable mappings
 */
export interface EnvironmentMappings {
  [key: string]: {
    path: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    parser?: (value: string) => any;
  };
}
