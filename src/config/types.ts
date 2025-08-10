/**
 * @file Unified Configuration Types.
 *
 * Central type definitions for all configuration across Claude-Zen.
 */

/**
 * Core system configuration.
 *
 * @example
 */
export interface Config {
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
 * Core system configuration.
 *
 * @example
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
 * Interface-specific configuration.
 *
 * @example
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
 * Terminal interface configuration.
 *
 * @example
 */
export interface TerminalConfig {
  shell?: string;
  timeout: number;
  maxConcurrentProcesses: number;
  enableColors: boolean;
  enableProgressBars: boolean;
}

/**
 * Web interface configuration.
 *
 * @example
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
 * MCP server configuration.
 *
 * @example
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
 * Memory system configuration.
 *
 * @example
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
 * Database configuration.
 *
 * @example
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
 * Coordination/Swarm configuration.
 *
 * @example
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
 * Neural network configuration.
 *
 * @example
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
 * Optimization configuration.
 *
 * @example
 */
export interface OptimizationConfig {
  enablePerformanceMonitoring: boolean;
  enableResourceOptimization: boolean;
  enableMemoryOptimization: boolean;
  enableNetworkOptimization: boolean;
  benchmarkInterval: number;
}

/**
 * External services configuration.
 *
 * @example
 */
export interface ServicesConfig {
  anthropic: {
    apiKey: string | null;
    baseUrl: string;
    timeout: number;
    maxRetries: number;
  };
  openai: {
    apiKey: string | null;
    baseUrl: string;
    timeout: number;
  };
  github: {
    token: string | null;
    baseUrl: string;
  };
  search: {
    apiKey: string | null;
    baseUrl: string | null;
  };
}

/**
 * Monitoring configuration.
 *
 * @example
 */
export interface MonitoringConfig {
  dashboard: {
    port: number;
    host: string;
    enableMetrics: boolean;
    metricsInterval: number;
  };
  logging: {
    level: string;
    format: string;
    file: string;
    enableConsole: boolean;
    enableFile: boolean;
  };
  performance: {
    enableProfiling: boolean;
    sampleRate: number;
    enableTracing: boolean;
  };
}

/**
 * Network configuration.
 *
 * @example
 */
export interface NetworkConfig {
  defaultTimeout: number;
  maxRetries: number;
  retryDelay: number;
  enableKeepAlive: boolean;
}

/**
 * Environment configuration.
 *
 * @example
 */
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  allowUnsafeOperations: boolean;
  enableDebugEndpoints: boolean;
  strictValidation: boolean;
}

/**
 * Unified system configuration.
 *
 * @example
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
  services: ServicesConfig;
  monitoring: MonitoringConfig;
  network: NetworkConfig;
  environment: EnvironmentConfig;
}

/**
 * Configuration source types.
 *
 * @example
 */
export interface ConfigurationSource {
  type: 'file' | 'env' | 'cli' | 'defaults';
  priority: number;
  data: Partial<SystemConfiguration>;
}

/**
 * Configuration validation result.
 *
 * @example
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Enhanced validation result with production information.
 *
 * @example
 */
export interface ValidationResult extends ConfigValidationResult {
  productionReady: boolean;
  securityIssues: string[];
  portConflicts: string[];
  performanceWarnings: string[];
  failsafeApplied: string[];
}

/**
 * Configuration health report.
 *
 * @example
 */
export interface ConfigHealthReport {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  details: {
    structure: boolean;
    security: boolean;
    performance: boolean;
    production: boolean;
  };
  recommendations: string[];
  timestamp: number;
  environment: string;
}

/**
 * Configuration change event.
 *
 * @example
 */
export interface ConfigChangeEvent {
  path: string;
  oldValue: any;
  newValue: any;
  source: string;
  timestamp: number;
}

/**
 * Environment variable mappings.
 *
 * @example
 */
export interface EnvironmentMappings {
  [key: string]: {
    path: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    parser?: (value: string) => any;
  };
}
