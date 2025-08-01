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
  }>;
  lastCheck: Date;
}