/**
 * Plugin system type definitions
 */

export interface Plugin {
  readonly metadata: PluginMetadata;
  readonly config: PluginConfig;
  readonly state: PluginState;
  
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  
  on(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage?: string;
  keywords: string[];
  status: 'loaded' | 'initialized' | 'active' | 'disabled' | 'error' | 'unloaded';
  errorCount: number;
  lastActivity: Date;
  restartCount: number;
  health?: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    issues: string[];
    lastCheck: Date;
  };
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage?: string;
  keywords: string[];
  main: string;
  dependencies: {
    system: string[];
    plugins: Record<string, string>;
  };
  configuration: {
    schema: Record<string, unknown>;
    required: string[];
    defaults: Record<string, unknown>;
  };
  permissions: string[];
  apis: Array<{
    name: string;
    version: string;
    methods: Array<{
      name: string;
      parameters: Record<string, unknown>;
      returns: Record<string, unknown>;
    }>;
  }>;
  hooks: string[];
}

export interface PluginConfig {
  enabled: boolean;
  priority: number;
  settings: Record<string, unknown>;
  monitoring?: {
    enabled: boolean;
    interval: number;
  };
}

export interface PluginContext {
  logger: {
    debug(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    error(message: string, error?: unknown): void;
  };
  apis: {
    logger: {
      info(message: string): void;
      error(message: string): void;
    };
  };
  resources: {
    limits: Array<{
      type: string;
      maximum: number;
      recommended: number;
    }>;
  };
  mcp?: {
    call(method: string, params: any): Promise<any>;
    notify(method: string, params: any): void;
  };
  hooks?: {
    register(type: string, handler: Function): Promise<void>;
    unregister(type: string, handler: Function): Promise<void>;
    execute(type: string, data: any): Promise<any>;
  };
}

export type PluginState = 
  | 'uninitialized'
  | 'loaded'
  | 'initialized'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'destroying'
  | 'destroyed'
  | 'error';

export interface ResourceUsage {
  memory: number;
  cpu: number;
  disk: number;
  network: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  issues: Array<{
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp?: Date;
  }>;
  lastCheck: Date;
}

export interface HealthIssue {
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
}

export interface HealthMetrics {
  timestamp: Date;
  pluginName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  responseTime: number;
  issues: HealthIssue[];
  performance: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  resources: {
    memory: number;
    cpu: number;
  };
  dependencies?: Record<string, string>;
}

// Stream interfaces for AI providers
export interface StreamChunk {
  content: string;
  done: boolean;
  metadata?: Record<string, any>;
}

// Configuration interfaces
export interface AIProviderConfig extends PluginConfig {
  providers?: Record<string, any>;
  defaultProvider?: string;
  caching?: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  rateLimiting?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
    requestsPerMinute?: number;
    concurrent?: number;
  };
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    maxLogs?: number;
    path?: string;
  };
  autoEnhance?: boolean;
  queryExpansion?: boolean;
  fallbackProviders?: string[];
}