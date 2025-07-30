/**
 * Core System Types
 * Fundamental types used throughout the Claude Code Flow system
 */

import { EventEmitter } from 'events';

// =============================================================================
// BASIC TYPES
// =============================================================================

export type UUID = string;
export type Timestamp = number;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

export interface Identifiable {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timestamped {
  timestamp: Timestamp;
  date: Date;
}

export interface Versioned {
  version: string;
  schemaVersion: string;
}

// =============================================================================
// SYSTEM CONFIGURATION
// =============================================================================

export interface CoreConfig {
  // System identification
  instanceId: string;
  name: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  
  // Core directories
  dataDir: string;
  logsDir: string;
  cacheDir: string;
  tempDir: string;
  
  // Performance settings
  maxConcurrency: number;
  maxMemoryMB: number;
  maxWorkers: number;
  defaultTimeout: number;
  
  // Feature flags
  features: {
    enableNeuralProcessing: boolean;
    enableGPUAcceleration: boolean;  
    enableVectorSearch: boolean;
    enableGraphDatabase: boolean;
    enableWebAssembly: boolean;
    enableHotReload: boolean;
    enableDebugMode: boolean;
  };
  
  // Networking
  network: {
    host: string;
    port: number;
    secure: boolean;
    cors: {
      enabled: boolean;
      origins: string[];
    };
  };
}

// =============================================================================
// SYSTEM STATUS & HEALTH
// =============================================================================

export type SystemStatus = 'initializing' | 'healthy' | 'degraded' | 'offline' | 'error';

export interface HealthCheck {
  name: string;
  status: SystemStatus;
  message?: string;
  timestamp: Date;
  responseTime?: number;
  metadata?: JSONObject;
}

export interface SystemHealth {
  overall: SystemStatus;
  checks: HealthCheck[];
  uptime: number;
  lastCheck: Date;
  nextCheck: Date;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export interface ErrorDetails {
  code: string;
  message: string;
  category: 'system' | 'user' | 'external' | 'network' | 'database' | 'plugin';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  stack?: string;
  context?: JSONObject;
  userFriendly?: string;
  retryable?: boolean;
  recoveryActions?: string[];
}

export class SystemError extends Error {
  constructor(
    public details: ErrorDetails,
    cause?: Error
  ) {
    super(details.message);
    this.name = 'SystemError';
    this.cause = cause;
  }
}

// =============================================================================
// RESOURCE MANAGEMENT
// =============================================================================

export interface ResourceLimits {
  memory: {
    max: number;      // bytes
    warning: number;  // bytes
  };
  cpu: {
    max: number;      // percentage (0-100)
    warning: number;  // percentage (0-100)
  };
  disk: {
    max: number;      // bytes
    warning: number;  // bytes
  };
  network: {
    maxBandwidth: number;    // bytes/sec
    maxConnections: number;
  };
  handles: {
    maxFileHandles: number;
    maxSocketHandles: number;
  };
}

export interface ResourceUsage {
  memory: {
    used: number;
    available: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpu: {
    usage: number;        // percentage
    userTime: number;     // microseconds
    systemTime: number;   // microseconds
  };
  disk: {
    used: number;
    available: number;
    percentage: number;
    reads: number;
    writes: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
    bandwidth: number;
  };
  handles: {
    files: number;
    sockets: number;
  };
  timestamp: Date;
}

// =============================================================================
// ASYNC OPERATIONS
// =============================================================================

export type OperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AsyncOperation<T = any> extends Identifiable {
  name: string;
  description?: string;
  status: OperationStatus;
  progress: number; // 0-100
  result?: T;
  error?: ErrorDetails;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  cancellable: boolean;
  retryable: boolean;
  attemptCount: number;
  maxAttempts: number;
  metadata?: JSONObject;
}

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  duration: number;
  timestamp: Date;
  metadata?: JSONObject;
}

// =============================================================================
// LIFECYCLE MANAGEMENT
// =============================================================================

export type LifecycleState = 'created' | 'initializing' | 'running' | 'stopping' | 'stopped' | 'error';

export interface LifecycleManager extends EventEmitter {
  readonly state: LifecycleState;
  readonly startTime?: Date;
  readonly stopTime?: Date;
  
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  getHealth(): Promise<HealthCheck>;
}

export interface LifecycleEvents {
  'state-changed': (oldState: LifecycleState, newState: LifecycleState) => void;
  'initialized': () => void;
  'started': () => void;
  'stopped': () => void;
  'error': (error: SystemError) => void;
  'health-check': (health: HealthCheck) => void;
}

// =============================================================================
// CONFIGURATION MANAGEMENT
// =============================================================================

export interface ConfigurationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    default?: any;
    validation?: (value: any) => boolean | string;
    description?: string;
    sensitive?: boolean; // For secrets/passwords
  };
}

export interface ConfigurationManager {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  validate(schema: ConfigurationSchema): ValidationResult[];
  reload(): Promise<void>;
  save(): Promise<void>;
  watch(key: string, callback: (value: any) => void): () => void;
}

export interface ValidationResult {
  key: string;
  valid: boolean;
  message?: string;
  value?: any;
}

// =============================================================================
// LOGGING & OBSERVABILITY
// =============================================================================

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  module?: string;
  function?: string;
  metadata?: JSONObject;
  tags?: string[];
  traceId?: string;
  spanId?: string;
  error?: ErrorDetails;
}

export interface Logger {
  trace(message: string, metadata?: JSONObject): void;
  debug(message: string, metadata?: JSONObject): void;
  info(message: string, metadata?: JSONObject): void;
  warn(message: string, metadata?: JSONObject): void;
  error(message: string, error?: Error, metadata?: JSONObject): void;
  fatal(message: string, error?: Error, metadata?: JSONObject): void;
  
  child(metadata: JSONObject): Logger;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

// =============================================================================
// CACHING
// =============================================================================

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  expiresAt?: Date;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
  size: number;
  metadata?: JSONObject;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  maxSize: number;
  hitRate: number;
  avgAccessTime: number;
}

export interface Cache<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
  stats(): Promise<CacheStats>;
}

// =============================================================================
// SERIALIZATION
// =============================================================================

export interface Serializable {
  serialize(): JSONObject;
  deserialize(data: JSONObject): void;
}

export interface SerializationResult {
  success: boolean;
  data?: JSONObject;
  error?: string;
  size: number;
}

export interface Serializer {
  serialize<T>(obj: T): SerializationResult;
  deserialize<T>(data: JSONObject, type?: new () => T): T | null;
  canSerialize(obj: any): boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Constructor<T = {}> = new (...args: any[]) => T;

export type Mixin<T extends Constructor> = T & Constructor;

export type EventMap = Record<string, (...args: any[]) => void>;

export interface TypedEventEmitter<T extends EventMap> extends EventEmitter {
  on<K extends keyof T>(event: K, listener: T[K]): this;
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
  once<K extends keyof T>(event: K, listener: T[K]): this;
  off<K extends keyof T>(event: K, listener: T[K]): this;
  removeAllListeners<K extends keyof T>(event?: K): this;
}