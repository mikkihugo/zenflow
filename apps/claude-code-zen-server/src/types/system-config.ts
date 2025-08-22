/**
 * @fileoverview System Configuration Types
 *
 * System-level configuration types for hardware detection,
 * capability assessment, and performance optimization0.
 */

import type { ClaudeZenCoreConfig } from '0./core-config';

/**
 * System Information Interface
 */
export interface SystemInfo {
  memory: number; // Total system memory in MB
  cpus: number; // Number of CPU cores
  platform: string; // Operating system platform
  architecture: string; // System architecture (x64, arm64, etc0.)
  nodeVersion: string; // Node0.js version
  processes: number; // Number of running processes
}

/**
 * System Capabilities Interface
 */
export interface SystemCapabilities {
  hasGPU: boolean; // GPU acceleration available
  hasDocker: boolean; // Docker container runtime available
  hasKubernetes: boolean; // Kubernetes orchestration available
  hasWASM: boolean; // WebAssembly runtime support
  hasRedis: boolean; // Redis cache server available
  hasPostgreSQL: boolean; // PostgreSQL database available
}

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  memoryUsage: number; // Current memory usage percentage
  cpuUsage: number; // Current CPU usage percentage
  networkLatency: number; // Network round-trip latency in ms
  diskIO: number; // Disk I/O operations per second
  activeConnections: number; // Number of active network connections
}

/**
 * Complete System Configuration
 */
export interface SystemConfiguration extends ClaudeZenCoreConfig {
  core: {
    logger: {
      level: string;
      console: boolean;
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
  };
  interfaces: {
    shared: {
      theme: string;
      verbosity: string;
      autoCompletion: boolean;
      realTimeUpdates: boolean;
      refreshInterval: number;
      maxCommandHistory: number;
      pageSize: number;
    };
    terminal: {
      timeout: number;
      maxConcurrentProcesses: number;
      enableColors: boolean;
      enableProgressBars: boolean;
    };
    web: {
      port: number;
      host: string;
      enableHttps: boolean;
      corsOrigins: string[];
      staticPath: string;
      enableCompression: boolean;
    };
    mcp?: {
      http?: {
        port?: number;
      };
    };
  };
  storage: {
    memory: {
      backend: string;
      directory: string;
      namespace: string;
      enableCompression: boolean;
      maxMemorySize: number;
      cacheSize: number;
      enableBackup: boolean;
      backupInterval: number;
    };
    database: {
      sqlite: {
        path: string;
        enableWAL: boolean;
        maxConnections: number;
        timeout: number;
      };
      lancedb: {
        path: string;
        enableVectorIndex: boolean;
        indexType: string;
      };
      persistence: {
        maxReaders: number;
        maxWorkers: number;
        mmapSize: number;
        cacheSize: number;
        enableBackup: boolean;
        healthCheckInterval: number;
      };
    };
  };
  coordination: {
    maxAgents: number;
    heartbeatInterval: number;
    timeout: number;
    topology: string;
    enableLoadBalancing: boolean;
    enableFailover: boolean;
    enableMetrics: boolean;
  };
  services: {
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
  };
  monitoring: {
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
  };
  network: {
    defaultTimeout: number;
    maxRetries: number;
    retryDelay: number;
    enableKeepAlive: boolean;
  };
  environment: {
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    allowUnsafeOperations: boolean;
    enableDebugEndpoints: boolean;
    strictValidation: boolean;
  };
  neural: {
    enableWASM: boolean;
    enableSIMD: boolean;
    enableCUDA: boolean;
    modelPath: string;
    maxModelSize: number;
    enableTraining: boolean;
    enableInference: boolean;
    backend: string;
  };
  optimization: {
    autoScale: boolean;
    maxWorkers: number;
    memoryThreshold: number;
    cpuThreshold: number;
  };
  systemInfo?: SystemInfo;
  capabilities?: SystemCapabilities;
  metrics?: PerformanceMetrics;
}

/**
 * System Resource Recommendations
 */
export interface ResourceRecommendations {
  recommended: {
    workers: number;
    memoryLimit: number;
    concurrency: number;
    cacheSize: number;
  };
  minimum: {
    workers: number;
    memoryLimit: number;
    concurrency: number;
    cacheSize: number;
  };
  optimal: {
    workers: number;
    memoryLimit: number;
    concurrency: number;
    cacheSize: number;
  };
}

// Default system configuration
export const DEFAULT_SYSTEM_CONFIG: Partial<SystemConfiguration> = {
  optimization: {
    autoScale: true,
    maxWorkers: 4,
    memoryThreshold: 0.8,
    cpuThreshold: 0.7,
  },
};
