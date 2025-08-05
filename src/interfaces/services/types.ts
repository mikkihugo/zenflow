/**
 * USL (Unified Service Layer) Types and Configuration
 * 
 * Centralized type definitions and configuration schemas for all service types
 * in the Claude-Zen ecosystem.
 */

import type { ServiceConfig } from './core/interfaces';

/**
 * Service type enumeration for all supported service categories
 */
export enum ServiceType {
  // Data Services
  DATA = 'data',
  WEB_DATA = 'web-data',
  DOCUMENT = 'document',
  
  // Coordination Services  
  SWARM = 'swarm',
  ORCHESTRATION = 'orchestration',
  DAA = 'daa', // Data Accessibility and Analysis
  SESSION_RECOVERY = 'session-recovery',
  ARCHITECTURE_STORAGE = 'architecture-storage',
  
  // Interface Services
  API = 'api',
  SAFE_API = 'safe-api',
  WEB = 'web',
  MCP = 'mcp',
  CLI = 'cli',
  TUI = 'tui',
  
  // Neural Services
  NEURAL = 'neural',
  LEARNING = 'learning',
  PATTERN_RECOGNITION = 'pattern-recognition',
  
  // Memory Services
  MEMORY = 'memory',
  CACHE = 'cache',
  SESSION = 'session',
  
  // Database Services
  DATABASE = 'database',
  VECTOR = 'vector',
  GRAPH = 'graph',
  
  // System Services
  HEALTH = 'health',
  MONITORING = 'monitoring',
  LOGGING = 'logging',
  SECURITY = 'security',
  
  // Workflow Services
  WORKFLOW = 'workflow',
  TASK = 'task',
  PIPELINE = 'pipeline',
  
  // Communication Services
  WEBSOCKET = 'websocket',
  MESSAGE_QUEUE = 'message-queue',
  EVENT_BUS = 'event-bus',
  
  // Custom service type
  CUSTOM = 'custom'
}

/**
 * Service priority levels for initialization and resource allocation
 */
export enum ServicePriority {
  CRITICAL = 0,    // System-critical services (database, logging)
  HIGH = 1,        // Important services (authentication, security)
  NORMAL = 2,      // Standard services (API, web)
  LOW = 3,         // Optional services (monitoring, analytics)
  BACKGROUND = 4   // Background services (cleanup, optimization)
}

/**
 * Service environment configuration
 */
export enum ServiceEnvironment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

/**
 * Base service configuration with common properties
 */
export interface BaseServiceConfig extends ServiceConfig {
  type: ServiceType | string;
  priority?: ServicePriority;
  environment?: ServiceEnvironment;
  tags?: string[];
}

/**
 * Data service configuration for data management services
 */
export interface DataServiceConfig extends BaseServiceConfig {
  type: ServiceType.DATA | ServiceType.WEB_DATA | ServiceType.DOCUMENT;
  dataSource?: {
    type: 'database' | 'memory' | 'file' | 'api';
    connection?: string;
    options?: Record<string, any>;
  };
  caching?: {
    enabled: boolean;
    ttl?: number;
    maxSize?: number;
  };
  validation?: {
    enabled: boolean;
    strict?: boolean;
    schemas?: Record<string, any>;
  };
}

/**
 * Web service configuration for HTTP/WebSocket services
 */
export interface WebServiceConfig extends BaseServiceConfig {
  type: ServiceType.WEB | ServiceType.API | ServiceType.SAFE_API | ServiceType.WEBSOCKET;
  server?: {
    host?: string;
    port?: number;
    ssl?: {
      enabled: boolean;
      cert?: string;
      key?: string;
    };
  };
  cors?: {
    enabled: boolean;
    origins?: string[];
    methods?: string[];
    headers?: string[];
  };
  rateLimit?: {
    enabled: boolean;
    requests?: number;
    window?: number; // milliseconds
    skipSuccessfulRequests?: boolean;
  };
  middleware?: {
    compression?: boolean;
    helmet?: boolean;
    morgan?: boolean;
    custom?: Array<{
      name: string;
      options?: any;
    }>;
  };
}

/**
 * Coordination service configuration for swarm and orchestration
 */
export interface CoordinationServiceConfig extends BaseServiceConfig {
  type: ServiceType.SWARM | ServiceType.ORCHESTRATION | ServiceType.DAA | ServiceType.SESSION_RECOVERY;
  coordination?: {
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    maxAgents?: number;
    strategy?: 'parallel' | 'sequential' | 'adaptive';
    timeout?: number;
  };
  persistence?: {
    enabled: boolean;
    storage?: 'memory' | 'database' | 'file';
    compression?: boolean;
  };
  recovery?: {
    enabled: boolean;
    checkInterval?: number;
    maxRetries?: number;
    backupInterval?: number;
  };
}

/**
 * Neural service configuration for AI and ML services
 */
export interface NeuralServiceConfig extends BaseServiceConfig {
  type: ServiceType.NEURAL | ServiceType.LEARNING | ServiceType.PATTERN_RECOGNITION;
  model?: {
    type: 'neural-network' | 'transformer' | 'custom';
    path?: string;
    config?: Record<string, any>;
  };
  training?: {
    enabled: boolean;
    dataPath?: string;
    batchSize?: number;
    epochs?: number;
    learningRate?: number;
  };
  inference?: {
    batchSize?: number;
    timeout?: number;
    caching?: boolean;
  };
  gpu?: {
    enabled: boolean;
    deviceId?: number;
    memoryLimit?: number;
  };
}

/**
 * Memory service configuration for caching and session management
 */
export interface MemoryServiceConfig extends BaseServiceConfig {
  type: ServiceType.MEMORY | ServiceType.CACHE | ServiceType.SESSION;
  storage?: {
    type: 'memory' | 'redis' | 'memcached' | 'database';
    connection?: string;
    maxMemory?: number;
  };
  eviction?: {
    policy: 'lru' | 'lfu' | 'fifo' | 'ttl';
    maxSize?: number;
    ttl?: number;
  };
  serialization?: {
    type: 'json' | 'msgpack' | 'custom';
    compression?: boolean;
  };
  persistence?: {
    enabled: boolean;
    interval?: number;
    path?: string;
  };
}

/**
 * Database service configuration for database integrations
 */
export interface DatabaseServiceConfig extends BaseServiceConfig {
  type: ServiceType.DATABASE | ServiceType.VECTOR | ServiceType.GRAPH;
  connection?: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    poolSize?: number;
  };
  migrations?: {
    enabled: boolean;
    path?: string;
    autoRun?: boolean;
  };
  backup?: {
    enabled: boolean;
    interval?: number;
    retention?: number;
    path?: string;
  };
  performance?: {
    queryTimeout?: number;
    connectionTimeout?: number;
    idleTimeout?: number;
    maxRetries?: number;
  };
}

/**
 * Interface service configuration for CLI, TUI, MCP services
 */
export interface InterfaceServiceConfig extends BaseServiceConfig {
  type: ServiceType.CLI | ServiceType.TUI | ServiceType.MCP;
  interface?: {
    interactive?: boolean;
    colors?: boolean;
    prompt?: string;
    history?: boolean;
  };
  commands?: {
    prefix?: string;
    aliases?: Record<string, string>;
    plugins?: string[];
  };
  output?: {
    format?: 'text' | 'json' | 'yaml' | 'table';
    verbosity?: 'minimal' | 'normal' | 'verbose' | 'debug';
    streaming?: boolean;
  };
}

/**
 * Monitoring service configuration for health and performance tracking
 */
export interface MonitoringServiceConfig extends BaseServiceConfig {
  type: ServiceType.HEALTH | ServiceType.MONITORING | ServiceType.LOGGING;
  metrics?: {
    enabled: boolean;
    interval?: number;
    retention?: number;
    aggregation?: 'none' | 'avg' | 'sum' | 'max' | 'min';
  };
  alerts?: {
    enabled: boolean;
    thresholds?: Record<string, number>;
    channels?: Array<{
      type: 'email' | 'webhook' | 'console';
      config: Record<string, any>;
    }>;
  };
  storage?: {
    type: 'memory' | 'database' | 'file' | 'external';
    connection?: string;
    compression?: boolean;
  };
}

/**
 * Workflow service configuration for task and pipeline management
 */
export interface WorkflowServiceConfig extends BaseServiceConfig {
  type: ServiceType.WORKFLOW | ServiceType.TASK | ServiceType.PIPELINE;
  execution?: {
    parallel?: boolean;
    maxConcurrency?: number;
    timeout?: number;
    retries?: number;
  };
  scheduling?: {
    enabled: boolean;
    cron?: string;
    timezone?: string;
  };
  state?: {
    persistence: boolean;
    storage?: 'memory' | 'database' | 'file';
    compression?: boolean;
  };
  notifications?: {
    enabled: boolean;
    events?: string[];
    channels?: string[];
  };
}

/**
 * Union type for all service configurations
 */
export type AnyServiceConfig = 
  | DataServiceConfig
  | WebServiceConfig
  | CoordinationServiceConfig
  | NeuralServiceConfig
  | MemoryServiceConfig
  | DatabaseServiceConfig
  | InterfaceServiceConfig
  | MonitoringServiceConfig
  | WorkflowServiceConfig
  | BaseServiceConfig;

/**
 * Service configuration factory for creating typed configurations
 */
export class ServiceConfigFactory {
  /**
   * Create a data service configuration
   */
  static createDataServiceConfig(
    name: string,
    options?: Partial<DataServiceConfig>
  ): DataServiceConfig {
    return {
      name,
      type: ServiceType.DATA,
      enabled: true,
      priority: ServicePriority.NORMAL,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 30000,
      health: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: false
      },
      ...options
    };
  }

  /**
   * Create a web service configuration
   */
  static createWebServiceConfig(
    name: string,
    options?: Partial<WebServiceConfig>
  ): WebServiceConfig {
    return {
      name,
      type: ServiceType.WEB,
      enabled: true,
      priority: ServicePriority.HIGH,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 30000,
      server: {
        host: 'localhost',
        port: 3000
      },
      cors: {
        enabled: true,
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization']
      },
      rateLimit: {
        enabled: false,
        requests: 100,
        window: 60000
      },
      health: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: true
      },
      ...options
    };
  }

  /**
   * Create a coordination service configuration
   */
  static createCoordinationServiceConfig(
    name: string,
    options?: Partial<CoordinationServiceConfig>
  ): CoordinationServiceConfig {
    return {
      name,
      type: ServiceType.SWARM,
      enabled: true,
      priority: ServicePriority.HIGH,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 60000,
      coordination: {
        topology: 'mesh',
        maxAgents: 10,
        strategy: 'adaptive',
        timeout: 30000
      },
      persistence: {
        enabled: true,
        storage: 'memory',
        compression: false
      },
      recovery: {
        enabled: true,
        checkInterval: 10000,
        maxRetries: 3,
        backupInterval: 60000
      },
      health: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: true
      },
      ...options
    };
  }

  /**
   * Create a neural service configuration
   */
  static createNeuralServiceConfig(
    name: string,
    options?: Partial<NeuralServiceConfig>
  ): NeuralServiceConfig {
    return {
      name,
      type: ServiceType.NEURAL,
      enabled: true,
      priority: ServicePriority.NORMAL,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 120000,
      model: {
        type: 'neural-network',
        config: {}
      },
      training: {
        enabled: false,
        batchSize: 32,
        epochs: 100,
        learningRate: 0.001
      },
      inference: {
        batchSize: 1,
        timeout: 30000,
        caching: true
      },
      gpu: {
        enabled: false
      },
      health: {
        enabled: true,
        interval: 60000,
        timeout: 10000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: true,
        metricsInterval: 30000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: true
      },
      ...options
    };
  }

  /**
   * Create a memory service configuration
   */
  static createMemoryServiceConfig(
    name: string,
    options?: Partial<MemoryServiceConfig>
  ): MemoryServiceConfig {
    return {
      name,
      type: ServiceType.MEMORY,
      enabled: true,
      priority: ServicePriority.HIGH,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 30000,
      storage: {
        type: 'memory',
        maxMemory: 1024 * 1024 * 100 // 100MB
      },
      eviction: {
        policy: 'lru',
        maxSize: 10000,
        ttl: 3600000 // 1 hour
      },
      serialization: {
        type: 'json',
        compression: false
      },
      persistence: {
        enabled: false
      },
      health: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: true
      },
      ...options
    };
  }

  /**
   * Create a database service configuration
   */
  static createDatabaseServiceConfig(
    name: string,
    options?: Partial<DatabaseServiceConfig>
  ): DatabaseServiceConfig {
    return {
      name,
      type: ServiceType.DATABASE,
      enabled: true,
      priority: ServicePriority.CRITICAL,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 60000,
      connection: {
        host: 'localhost',
        port: 5432,
        poolSize: 10
      },
      migrations: {
        enabled: true,
        autoRun: false
      },
      backup: {
        enabled: false,
        interval: 86400000, // 24 hours
        retention: 7 // 7 days
      },
      performance: {
        queryTimeout: 30000,
        connectionTimeout: 10000,
        idleTimeout: 300000, // 5 minutes
        maxRetries: 3
      },
      health: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: true
      },
      ...options
    };
  }

  /**
   * Create a monitoring service configuration
   */
  static createMonitoringServiceConfig(
    name: string,
    options?: Partial<MonitoringServiceConfig>
  ): MonitoringServiceConfig {
    return {
      name,
      type: ServiceType.MONITORING,
      enabled: true,
      priority: ServicePriority.LOW,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 30000,
      metrics: {
        enabled: true,
        interval: 5000,
        retention: 86400000, // 24 hours
        aggregation: 'avg'
      },
      alerts: {
        enabled: false,
        thresholds: {
          'cpu.usage': 80,
          'memory.usage': 85,
          'error.rate': 5
        }
      },
      storage: {
        type: 'memory',
        compression: true
      },
      health: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: false, // Don't monitor the monitoring service itself
        metricsInterval: 30000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: true
      },
      ...options
    };
  }

  /**
   * Create a workflow service configuration
   */
  static createWorkflowServiceConfig(
    name: string,
    options?: Partial<WorkflowServiceConfig>
  ): WorkflowServiceConfig {
    return {
      name,
      type: ServiceType.WORKFLOW,
      enabled: true,
      priority: ServicePriority.NORMAL,
      environment: ServiceEnvironment.DEVELOPMENT,
      timeout: 300000, // 5 minutes
      execution: {
        parallel: true,
        maxConcurrency: 5,
        timeout: 120000, // 2 minutes
        retries: 3
      },
      scheduling: {
        enabled: false,
        timezone: 'UTC'
      },
      state: {
        persistence: true,
        storage: 'memory',
        compression: false
      },
      notifications: {
        enabled: false,
        events: ['started', 'completed', 'failed'],
        channels: ['console']
      },
      health: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 1
      },
      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
        trackMemoryUsage: true
      },
      ...options
    };
  }
}

/**
 * Type guard functions for service configurations
 */
export function isDataServiceConfig(config: AnyServiceConfig): config is DataServiceConfig {
  return [ServiceType.DATA, ServiceType.WEB_DATA, ServiceType.DOCUMENT].includes(config.type as ServiceType);
}

export function isWebServiceConfig(config: AnyServiceConfig): config is WebServiceConfig {
  return [ServiceType.WEB, ServiceType.API, ServiceType.SAFE_API, ServiceType.WEBSOCKET].includes(config.type as ServiceType);
}

export function isCoordinationServiceConfig(config: AnyServiceConfig): config is CoordinationServiceConfig {
  return [ServiceType.SWARM, ServiceType.ORCHESTRATION, ServiceType.DAA, ServiceType.SESSION_RECOVERY].includes(config.type as ServiceType);
}

export function isNeuralServiceConfig(config: AnyServiceConfig): config is NeuralServiceConfig {
  return [ServiceType.NEURAL, ServiceType.LEARNING, ServiceType.PATTERN_RECOGNITION].includes(config.type as ServiceType);
}

export function isMemoryServiceConfig(config: AnyServiceConfig): config is MemoryServiceConfig {
  return [ServiceType.MEMORY, ServiceType.CACHE, ServiceType.SESSION].includes(config.type as ServiceType);
}

export function isDatabaseServiceConfig(config: AnyServiceConfig): config is DatabaseServiceConfig {
  return [ServiceType.DATABASE, ServiceType.VECTOR, ServiceType.GRAPH].includes(config.type as ServiceType);
}

export function isMonitoringServiceConfig(config: AnyServiceConfig): config is MonitoringServiceConfig {
  return [ServiceType.HEALTH, ServiceType.MONITORING, ServiceType.LOGGING].includes(config.type as ServiceType);
}