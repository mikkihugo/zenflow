/**
 * Core type definitions for Claude-Flow.
 */

// Configuration interface
/**
 * @file TypeScript type definitions for core.
 */

export interface Config {
  env: 'development|production|test';
  logLevel: 'debug|info|warn|error';
  enableMetrics?: boolean;
  orchestrator?: {
    dataDir?: string;
    maxAgents?: number;
    taskTimeout?: number;
    persistSessions?: boolean;
    shutdownTimeout?: number;
    maxConcurrentAgents?: number;
  };
  logging?: LoggingConfig;
  terminal?: {
    shell?: string;
    timeout?: number;
    maxSessions?: number;
  };
  memory?: {
    backend?: 'sqlite|memory'';
    ttl?: number;
    maxEntries?: number;
  };
  coordination?: {
    enabled?: boolean;
    maxConnections?: number;
  };
  database?: {
    url: string;
    poolSize?: number;
  };
  redis?: {
    url: string;
    keyPrefix?: string;
  };
  api?: {
    port: number;
    host: string;
    cors?: {
      origin: string[];
      credentials: boolean;
    };
  };
  agents?: {
    maxConcurrent: number;
    timeout: number;
  };
  security?: {
    jwtSecret: string;
    encryptionKey: string;
  };
}

// Logging configuration interface
export interface LoggingConfig {
  level: 'debug|info|warn|error';
  format: 'text|json'';
  destination: 'console|file|both';
  file?: {
    path: string;
    maxSize: number;
    maxFiles: number;
  };
  enableTimestamps?: boolean;
  enableContext?: boolean;
}

// Import orchestrator metrics type
export interface OrchestratorMetrics {
  uptime: number;
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  queuedTasks: number;
  avgTaskDuration: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  timestamp: Date;
}

// Agent-related types
export interface AgentProfile {
  id: string;
  name: string;
  type: 'coordinator|researcher|implementer|analyst|custom';
  capabilities: string[];
  systemPrompt?: string;
  maxConcurrentTasks: number;
  priority?: number;
  environment?: Record<string, string>;
  workingDirectory?: string;
  shell?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentSession {
  id: string;
  agentId: string;
  terminalId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active|idle|terminated|error';
  lastActivity: Date;
  memoryBankId: string;
}

// Task-related types
export interface Task {
  id: string;
  type: string;
  description: string;
  priority: number;
  dependencies: string[];
  assignedAgent?: string;
  status: TaskStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: Error;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
}

export type TaskStatus =|'pending|queued|assigned|running|completed|failed|cancelled'';

// Memory-related types
export interface MemoryEntry {
  id: string;
  agentId: string;
  sessionId: string;
  type: 'observation|insight|decision|artifact|error';
  content: string;
  context: Record<string, unknown>;
  timestamp: Date;
  tags: string[];
  version: number;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryQuery {
  agentId?: string;
  sessionId?: string;
  type?: MemoryEntry['type'];
  tags?: string[];
  startTime?: Date;
  endTime?: Date;
  search?: string;
  limit?: number;
  offset?: number;
  namespace?: string;
}

// Event-related types
export enum SystemEvents {
  // Agent events
  AGENT_SPAWNED = 'agent:spawned',
  AGENT_TERMINATED = 'agent:terminated',
  AGENT_ERROR = 'agent:error',
  AGENT_IDLE = 'agent:idle',
  AGENT_ACTIVE = 'agent:active',

  // Task events
  TASK_CREATED = 'task:created',
  TASK_ASSIGNED = 'task:assigned',
  TASK_STARTED = 'task:started',
  TASK_COMPLETED = 'task:completed',
  TASK_FAILED = 'task:failed',
  TASK_CANCELLED = 'task:cancelled',

  // Memory events
  MEMORY_CREATED = 'memory:created',
  MEMORY_UPDATED = 'memory:updated',
  MEMORY_DELETED = 'memory:deleted',
  MEMORY_SYNCED = 'memory:synced',

  // System events
  SYSTEM_READY = 'system:ready',
  SYSTEM_SHUTDOWN = 'system:shutdown',
  SYSTEM_ERROR = 'system:error',
  SYSTEM_HEALTHCHECK = 'system:healthcheck',

  // Coordination events
  RESOURCE_ACQUIRED = 'resource:acquired',
  RESOURCE_RELEASED = 'resource:released',
  DEADLOCK_DETECTED = 'deadlock:detected',
  MESSAGE_SENT = 'message:sent',
  MESSAGE_RECEIVED = 'message:received',
}

export interface EventMap extends Record<string, unknown> {
  'agent:spawned': {
    agentId: string;
    profile: AgentProfile;
    sessionId: string;
  };
  'agent:terminated': { agentId: string; reason: string };
  'agent:error': { agentId: string; error: Error };
  'agent:idle': { agentId: string };
  'agent:active': { agentId: string; taskId: string };

  'task:created': { task: Task };
  'task:assigned': { taskId: string; agentId: string };
  'task:started': { taskId: string; agentId: string };
  'task:completed': { taskId: string; result: unknown };
  'task:failed': { taskId: string; error: Error };
  'task:cancelled': { taskId: string; reason: string };

  'memory:created': { entry: MemoryEntry };
  'memory:updated': {
    entry: MemoryEntry;
    previousVersion: number;
  };
  'memory:deleted': { entryId: string };
  'memory:synced': { entries: MemoryEntry[] };

  'system:ready': { timestamp: Date };
  'system:shutdown': { reason: string };
  'system:error': { error: Error; component: string };
  'system:healthcheck': { status: HealthStatus };

  'resource:acquired': { resourceId: string; agentId: string };
  'resource:released': { resourceId: string; agentId: string };
  'deadlock:detected': {
    agents: string[];
    resources: string[];
  };
  'message:sent': {
    from: string;
    to: string;
    message: Message;
  };
  'message:received': {
    from: string;
    to: string;
    message: Message;
  };

  // Additional events
  'metrics:collected': OrchestratorMetrics;
}

// System Configuration types (renamed to avoid conflict)
export interface SystemConfig {
  orchestrator: OrchestratorConfig;
  terminal: TerminalConfig;
  memory: MemoryConfig;
  coordination: CoordinationConfig;
  logging: LoggingConfig;
  credentials?: CredentialsConfig;
  security?: SecurityConfig;
}

export interface OrchestratorConfig {
  maxConcurrentAgents: number;
  taskQueueSize: number;
  healthCheckInterval: number;
  shutdownTimeout: number;
  maintenanceInterval?: number;
  metricsInterval?: number;
  persistSessions?: boolean;
  dataDir?: string;
  sessionRetentionMs?: number;
  taskHistoryRetentionMs?: number;
  taskMaxRetries?: number;
}

export interface TerminalConfig {
  type: 'vscode|native|auto';
  poolSize: number;
  recycleAfter: number;
  healthCheckInterval: number;
  commandTimeout: number;
}

export interface MemoryConfig {
  backend: 'sqlite|markdown|hybrid';
  cacheSizeMB: number;
  syncInterval: number;
  conflictResolution: 'last-write|crdt'||manual';
  retentionDays: number;
  sqlitePath?: string;
  markdownDir?: string;
}

export interface CoordinationConfig {
  maxRetries: number;
  retryDelay: number;
  deadlockDetection: boolean;
  resourceTimeout: number;
  messageTimeout: number;
}

// Health and monitoring types
export interface HealthStatus {
  status: 'healthy|degraded|unhealthy';
  components: Record<string, ComponentHealth>;
  timestamp: Date;
}

export interface ComponentHealth {
  name: string;
  status: 'healthy|degraded|unhealthy';
  lastCheck: Date;
  error?: string;
  metrics?: Record<string, number>;
}

// Message passing types
export interface Message {
  id: string;
  type: string;
  payload: unknown;
  timestamp: Date;
  priority: number;
  expiry?: Date;
}

// Resource management types
export interface Resource {
  id: string;
  type: string;
  owner?: string;
  locked: boolean;
  lockedBy?: string;
  lockedAt?: Date;
  metadata?: Record<string, unknown>;
}

// Interface declarations for dependency injection
export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: unknown): void;
  configure(config: LoggingConfig): Promise<void>;
}

export interface EventBus {
  emit(event: string, data?: unknown): void;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
  once(event: string, handler: (data: unknown) => void): void;
}

// Terminal types
export interface Terminal {
  id: string;
  pid?: number;
  type: 'vscode|native'';
  status: 'active|idle|dead';
}

export interface TerminalCommand {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  timeout?: number;
}

// Additional configuration interfaces
export interface CredentialsConfig {
  apiKey?: string;
  token?: string;
  password?: string;
  secret?: string;
  [key: string]: string | undefined;
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  auditLogging: boolean;
  maskSensitiveValues: boolean;
  allowEnvironmentOverrides: boolean;
}
