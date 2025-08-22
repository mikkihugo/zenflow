/**
 * @fileoverview Configuration Types - Consolidated Config Exports
 *
 * Central export point for all configuration types used throughout
 * the claude-code-zen server application.
 */

// Core configuration types
export type {
  ClaudeZenCoreConfig,
  RepoConfig,
  SystemConfig,
} from "./core-config";

// System configuration types
export type {
  SystemInfo,
  SystemCapabilities,
  PerformanceMetrics,
  SystemConfiguration,
  ResourceRecommendations,
} from "./system-config";

// Foundation configuration types (Config is available)
export type { Config as FoundationConfig } from '@claude-zen/foundation');

// Default exports
export { DEFAULT_CORE_CONFIG } from "./core-config";
export { DEFAULT_SYSTEM_CONFIG } from "./system-config";

/**
 * Health Check Configuration
 */
export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
  endpoints: string[];
}

/**
 * Configuration Health Report
 */
export interface ConfigHealthReport {
  isHealthy: boolean;
  timestamp: number;
  environment?: string;
  status: 'healthy | warning' | 'critical');
  score: number;
  details: Record<string, boolean>;
  recommendations: string[];
  checks: Record<string, ValidationResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  valid?: boolean; // Alias for isValid for compatibility
  errors: string[];
  warnings: string[];
  message?: string;
  securityIssues: string[];
  portConflicts: string[];
  performanceWarnings: string[];
  productionReady: boolean;
  failsafeApplied: string[];
}

/**
 * Configuration Change Event
 */
export interface ConfigChangeEvent {
  type: 'created | updated' | 'deleted');
  path: string;
  oldValue?: any;
  newValue?: any;
  timestamp: number;
  source?: ConfigurationSource;
}

/**
 * Configuration Source
 */
export interface ConfigurationSource {
  type:
    | 'file'
    | 'environment'
    | 'default'
    | 'override'
    | 'defaults'
    | 'env'
    | 'cli');
  path?: string;
  data?: any;
  priority: number;
}

/**
 * Configuration Validation Result
 */
export interface ConfigValidationResult extends ValidationResult {
  source: ConfigurationSource;
  affectedPaths: string[];
}

/**
 * Core Configuration Types
 */
export type CoreConfig = ClaudeZenCoreConfig;

/**
 * Coordination Configuration
 */
export interface CoordinationConfig {
  maxAgents: number;
  timeout: number;
  retryAttempts: number;
  loadBalancing: boolean;
}

/**
 * Database Configuration
 */
export interface DatabaseConfig {
  type: 'sqlite | postgresql' | 'mysql');
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

/**
 * Memory Configuration
 */
export interface MemoryConfig {
  maxHeapSize: number;
  gcInterval: number;
  enableCompression: boolean;
}

/**
 * Neural Configuration
 */
export interface NeuralConfig {
  modelPath: string;
  accelerator: 'cpu | gpu' | 'tpu');
  batchSize: number;
  learningRate: number;
}

/**
 * Optimization Configuration
 */
export interface OptimizationConfig {
  enabled: boolean;
  level: number;
  strategy: string;
}

/**
 * Terminal Configuration
 */
export interface TerminalConfig {
  shell: string;
  encoding: string;
  rows: number;
  cols: number;
}

/**
 * Web Configuration
 */
export interface WebConfig {
  enabled: boolean;
  host: string;
  port: number;
  enableHttps: boolean;
  corsOrigins: string[];
}

/**
 * MCP Configuration
 */
export interface MCPConfig {
  enabled: boolean;
  http?: {
    port?: number;
    timeout?: number;
  };
  tools?: {
    enableAll?: boolean;
    disabledTools?: string[];
  };
}

/**
 * Interface Configuration
 */
export interface InterfaceConfig {
  web: WebConfig;
  api: {
    enabled: boolean;
    prefix: string;
    version: string;
  };
  mcp?: MCPConfig;
  shared?: {
    theme: string;
    verbosity: string;
    autoCompletion: boolean;
    realTimeUpdates: boolean;
    refreshInterval: number;
    maxCommandHistory: number;
    pageSize: number;
  };
  terminal?: {
    timeout: number;
    maxConcurrentProcesses: number;
    enableColors: boolean;
    enableProgressBars: boolean;
  };
}

/**
 * Environment Mappings
 */
export interface EnvironmentMappings {
  development: Record<string, string>;
  production: Record<string, string>;
  test: Record<string, string>;
}

/**
 * API Configuration
 */
export interface APIConfig {
  version: string;
  prefix: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  swagger: {
    enabled: boolean;
    path: string;
  };
}

/**
 * Storage Configuration
 */
export interface StorageConfiguration {
  database: {
    provider: 'sqlite | postgresql' | 'mysql');
    connection: string;
    pool?: {
      min: number;
      max: number;
    };
  };
  cache: {
    provider: 'memory | redis');
    connection?: string;
    ttl: number;
  };
  files: {
    uploads: string;
    temp: string;
    logs: string;
  };
}

/**
 * Security Configuration
 */
export interface SecurityConfig {
  authentication: {
    enabled: boolean;
    provider: string;
    secret: string;
  };
  authorization: {
    enabled: boolean;
    roles: string[];
  };
  encryption: {
    algorithm: string;
    keyLength: number;
  };
  ssl: {
    enabled: boolean;
    cert?: string;
    key?: string;
  };
}

// Default configurations
export const DEFAULT_HEALTH_CONFIG: HealthCheckConfig = {
  enabled: true,
  interval: 30000,
  timeout: 5000,
  retries: 3,
  endpoints: ['/api/health, /api/status'],
};

export const DEFAULT_API_CONFIG: APIConfig = {
  version: '1..0',
  prefix: '/api/v1',
  rateLimit: {
    windowMs: 900000, // 15 minutes
    max: 100,
  },
  cors: {
    origin: ['http://localhost:3000, http://localhost:5173'],
    credentials: true,
  },
  swagger: {
    enabled: true,
    path: '/api/docs',
  },
};
