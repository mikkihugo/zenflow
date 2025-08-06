/**
 * @file Default Configuration Values
 *
 * Central definition of all default configuration values
 */

import type { SystemConfiguration } from './types';

/**
 * Default system configuration
 */
export const DEFAULT_CONFIG: SystemConfiguration = {
  core: {
    logger: {
      level: 'info',
      console: true,
      structured: false,
    },
    performance: {
      enableMetrics: true,
      metricsInterval: 10000,
      enableProfiling: false,
    },
    security: {
      enableSandbox: true,
      allowShellAccess: false,
      trustedHosts: ['localhost', '127.0.0.1'],
    },
  },

  interfaces: {
    shared: {
      theme: 'dark',
      verbosity: 'normal',
      autoCompletion: true,
      realTimeUpdates: true,
      refreshInterval: 5000,
      maxCommandHistory: 100,
      pageSize: 25,
    },
    terminal: {
      timeout: 30000,
      maxConcurrentProcesses: 10,
      enableColors: true,
      enableProgressBars: true,
    },
    web: {
      port: 3456,
      host: 'localhost',
      enableHttps: false,
      corsOrigins: ['http://localhost:3000', 'http://localhost:3456'],
      staticPath: './public',
      enableCompression: true,
    },
    mcp: {
      http: {
        port: 3000,
        host: 'localhost',
        timeout: 30000,
        maxRequestSize: '10mb',
        enableCors: true,
      },
      stdio: {
        timeout: 30000,
        maxBufferSize: 1024 * 1024, // 1MB
      },
      tools: {
        enableAll: true,
        enabledTools: [],
        disabledTools: [],
      },
    },
  },

  storage: {
    memory: {
      backend: 'sqlite',
      directory: './data/memory',
      namespace: 'claude-zen',
      enableCompression: false,
      maxMemorySize: 100 * 1024 * 1024, // 100MB
      cacheSize: 10 * 1024 * 1024, // 10MB
      enableBackup: true,
      backupInterval: 3600000, // 1 hour
    },
    database: {
      sqlite: {
        path: './data/claude-zen.db',
        enableWAL: true,
        maxConnections: 10,
        timeout: 30000,
      },
      lancedb: {
        path: './data/lancedb',
        enableVectorIndex: true,
        indexType: 'ivf',
      },
      persistence: {
        maxReaders: 6,
        maxWorkers: 3,
        mmapSize: 268435456, // 256MB
        cacheSize: -64000, // 64MB
        enableBackup: false,
        healthCheckInterval: 60000, // 1 minute
      },
    },
  },

  coordination: {
    maxAgents: 50,
    heartbeatInterval: 10000,
    timeout: 30000,
    topology: 'mesh',
    enableLoadBalancing: true,
    enableFailover: true,
    enableMetrics: true,
  },

  neural: {
    enableWASM: true,
    enableSIMD: true,
    enableCUDA: false,
    modelPath: './data/neural',
    maxModelSize: 100 * 1024 * 1024, // 100MB
    enableTraining: false,
    enableInference: true,
    backend: 'wasm',
  },

  optimization: {
    enablePerformanceMonitoring: true,
    enableResourceOptimization: true,
    enableMemoryOptimization: true,
    enableNetworkOptimization: false,
    benchmarkInterval: 60000, // 1 minute
  },
};

/**
 * Environment variable mappings
 */
export const ENV_MAPPINGS = {
  // Core
  CLAUDE_LOG_LEVEL: { path: 'core.logger.level', type: 'string' as const },
  CLAUDE_LOG_CONSOLE: { path: 'core.logger.console', type: 'boolean' as const },
  CLAUDE_LOG_FILE: { path: 'core.logger.file', type: 'string' as const },
  CLAUDE_ENABLE_METRICS: { path: 'core.performance.enableMetrics', type: 'boolean' as const },
  CLAUDE_METRICS_INTERVAL: { path: 'core.performance.metricsInterval', type: 'number' as const },

  // Interfaces
  CLAUDE_WEB_PORT: { path: 'interfaces.web.port', type: 'number' as const },
  CLAUDE_WEB_HOST: { path: 'interfaces.web.host', type: 'string' as const },
  CLAUDE_MCP_PORT: { path: 'interfaces.mcp.http.port', type: 'number' as const },
  CLAUDE_MCP_HOST: { path: 'interfaces.mcp.http.host', type: 'string' as const },
  CLAUDE_MCP_TIMEOUT: { path: 'interfaces.mcp.http.timeout', type: 'number' as const },

  // Storage
  CLAUDE_MEMORY_BACKEND: { path: 'storage.memory.backend', type: 'string' as const },
  CLAUDE_MEMORY_DIR: { path: 'storage.memory.directory', type: 'string' as const },
  CLAUDE_DB_PATH: { path: 'storage.database.sqlite.path', type: 'string' as const },
  CLAUDE_LANCEDB_PATH: { path: 'storage.database.lancedb.path', type: 'string' as const },

  // Persistence Pool
  POOL_MAX_READERS: { path: 'storage.database.persistence.maxReaders', type: 'number' as const },
  POOL_MAX_WORKERS: { path: 'storage.database.persistence.maxWorkers', type: 'number' as const },
  POOL_MMAP_SIZE: { path: 'storage.database.persistence.mmapSize', type: 'number' as const },
  POOL_CACHE_SIZE: { path: 'storage.database.persistence.cacheSize', type: 'number' as const },
  POOL_ENABLE_BACKUP: {
    path: 'storage.database.persistence.enableBackup',
    type: 'boolean' as const,
  },

  // Coordination
  CLAUDE_MAX_AGENTS: { path: 'coordination.maxAgents', type: 'number' as const },
  CLAUDE_HEARTBEAT_INTERVAL: { path: 'coordination.heartbeatInterval', type: 'number' as const },
  CLAUDE_COORDINATION_TIMEOUT: { path: 'coordination.timeout', type: 'number' as const },
  CLAUDE_SWARM_TOPOLOGY: { path: 'coordination.topology', type: 'string' as const },

  // Neural
  CLAUDE_ENABLE_WASM: { path: 'neural.enableWASM', type: 'boolean' as const },
  CLAUDE_ENABLE_SIMD: { path: 'neural.enableSIMD', type: 'boolean' as const },
  CLAUDE_ENABLE_CUDA: { path: 'neural.enableCUDA', type: 'boolean' as const },
  CLAUDE_NEURAL_BACKEND: { path: 'neural.backend', type: 'string' as const },
  CLAUDE_MODEL_PATH: { path: 'neural.modelPath', type: 'string' as const },

  // Security
  CLAUDE_ENABLE_SANDBOX: { path: 'core.security.enableSandbox', type: 'boolean' as const },
  CLAUDE_ALLOW_SHELL: { path: 'core.security.allowShellAccess', type: 'boolean' as const },
  CLAUDE_TRUSTED_HOSTS: {
    path: 'core.security.trustedHosts',
    type: 'array' as const,
    parser: (value: string) => value.split(',').map((h) => h.trim()),
  },
} as const;

/**
 * Configuration validation schema
 */
export const VALIDATION_RULES = {
  'core.logger.level': {
    type: 'string',
    enum: ['debug', 'info', 'warn', 'error'],
  },
  'interfaces.web.port': {
    type: 'number',
    min: 1,
    max: 65535,
  },
  'interfaces.mcp.http.port': {
    type: 'number',
    min: 1,
    max: 65535,
  },
  'coordination.maxAgents': {
    type: 'number',
    min: 1,
    max: 1000,
  },
  'coordination.topology': {
    type: 'string',
    enum: ['mesh', 'hierarchical', 'ring', 'star'],
  },
  'neural.backend': {
    type: 'string',
    enum: ['wasm', 'native', 'fallback'],
  },
  'storage.memory.backend': {
    type: 'string',
    enum: ['sqlite', 'lancedb', 'json'],
  },
} as const;
