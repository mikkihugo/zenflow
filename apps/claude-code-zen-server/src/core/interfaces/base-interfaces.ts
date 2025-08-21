/**
 * @fileoverview Core Base Interfaces
 * 
 * Essential type definitions and interfaces used throughout the coordination system.
 * Provides consistent type contracts for the coordination infrastructure.
 */

// =============================================================================
// COORDINATION INTERFACES
// =============================================================================

export interface CoordinationRequest {
  readonly id: string;
  readonly type: string;
  readonly payload: unknown;
  readonly priority?: 'low' | 'medium' | 'high';
  readonly timeout?: number;
  readonly timestamp: number;
}

export interface CoordinationResponse {
  readonly id: string;
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: string;
  readonly timestamp: number;
  readonly processingTime: number;
}

export interface CoordinationContext {
  readonly sessionId: string;
  readonly userId?: string;
  readonly requestId: string;
  readonly metadata: Record<string, unknown>;
  readonly timestamp: number;
}

// =============================================================================
// AGENT INTERFACES
// =============================================================================

export interface AgentCapability {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly parameters?: Record<string, unknown>;
}

export interface AgentStatus {
  readonly id: string;
  readonly name: string;
  readonly status: 'active' | 'idle' | 'busy' | 'error' | 'offline';
  readonly load: number;
  readonly capabilities: readonly AgentCapability[];
  readonly lastUpdate: string;
  readonly uptime: number;
}

export interface AgentConfig {
  readonly id?: string;
  readonly name: string;
  readonly type: string;
  readonly capabilities: readonly AgentCapability[];
  readonly maxConcurrency?: number;
  readonly timeout?: number;
  readonly retryCount?: number;
}

// =============================================================================
// TASK INTERFACES
// =============================================================================

export interface Task {
  readonly id: string;
  readonly type: string;
  readonly description: string;
  readonly payload: unknown;
  readonly requirements: readonly string[];
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly estimatedDuration?: number;
  readonly dependencies?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TaskResult {
  readonly taskId: string;
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: string;
  readonly agentId: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly duration: number;
}

export interface TaskExecution {
  readonly task: Task;
  readonly agent: AgentStatus;
  readonly status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  readonly progress?: number;
  readonly estimatedCompletion?: string;
}

// =============================================================================
// SYSTEM INTERFACES
// =============================================================================

export interface SystemHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly uptime: number;
  readonly version: string;
  readonly timestamp: string;
  readonly components: Record<string, ComponentHealth>;
}

export interface ComponentHealth {
  readonly name: string;
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly message?: string;
  readonly lastCheck: string;
  readonly metrics?: Record<string, number>;
}

export interface SystemMetrics {
  readonly cpu: {
    readonly usage: number;
    readonly cores: number;
  };
  readonly memory: {
    readonly used: number;
    readonly total: number;
    readonly free: number;
  };
  readonly disk: {
    readonly used: number;
    readonly total: number;
    readonly free: number;
  };
  readonly network: {
    readonly bytesIn: number;
    readonly bytesOut: number;
  };
}

// =============================================================================
// EVENT INTERFACES
// =============================================================================

export interface SystemEvent {
  readonly id: string;
  readonly type: string;
  readonly source: string;
  readonly target?: string;
  readonly payload: unknown;
  readonly timestamp: string;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventHandler<T = unknown> {
  (event: SystemEvent & { payload: T }): void | Promise<void>;
}

export interface EventSubscription {
  readonly id: string;
  readonly eventType: string;
  readonly handler: EventHandler;
  readonly createdAt: string;
}

export interface EventBus {
  emit(event: string | symbol, ...args: any[]): boolean;
  on(event: string | symbol, handler: (...args: any[]) => void): this;
  off(event: string | symbol, handler: (...args: any[]) => void): this;
  once(event: string | symbol, handler: (...args: any[]) => void): this;
  removeAllListeners(event?: string | symbol): this;
  publish(event: string, data: any): void;
  subscribe(event: string, handler: (data: any) => void): void;
  unsubscribe(event: string, handler: (data: any) => void): void;
}

// =============================================================================
// CONFIGURATION INTERFACES
// =============================================================================

export interface BaseConfig {
  readonly debug?: boolean;
  readonly timeout?: number;
  readonly retryCount?: number;
  readonly enableLogging?: boolean;
  readonly logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface DatabaseConfig extends BaseConfig {
  readonly type: 'sqlite' | 'postgres' | 'mysql' | 'memory';
  readonly connectionString?: string;
  readonly poolSize?: number;
  readonly ssl?: boolean;
}

export interface NetworkConfig extends BaseConfig {
  readonly host: string;
  readonly port: number;
  readonly protocol: 'http' | 'https' | 'ws' | 'wss';
  readonly maxConnections?: number;
  readonly keepAlive?: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export type Optional<T> = T | null | undefined;

export type Timestamp = string; // ISO 8601 format

export type Duration = number; // milliseconds

export type Percentage = number; // 0-100

// =============================================================================
// FACTORY TYPES
// =============================================================================

export interface Factory<T, C = unknown> {
  create(config?: C): T;
  createAsync(config?: C): Promise<T>;
}

export interface Registry<T> {
  register(id: string, item: T): void;
  unregister(id: string): boolean;
  get(id: string): T | null;
  getAll(): readonly T[];
  has(id: string): boolean;
  clear(): void;
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  trace(message: string, ...args: any[]): void;
}

export interface KeyValueStore {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  size(): Promise<number>;
}

export interface Lifecycle {
  initialize(): Promise<void>;
  start?(): Promise<void>;
  stop?(): Promise<void>;
  shutdown(): Promise<void>;
  isRunning(): boolean;
  getStatus(): SystemHealth | ComponentHealth;
}

// =============================================================================
// EXPORT ALL INTERFACES
// =============================================================================

export default {
  // Coordination
  CoordinationRequest,
  CoordinationResponse,
  CoordinationContext,
  
  // Agents
  AgentCapability,
  AgentStatus,
  AgentConfig,
  
  // Tasks
  Task,
  TaskResult,
  TaskExecution,
  
  // System
  SystemHealth,
  ComponentHealth,
  SystemMetrics,
  
  // Events
  SystemEvent,
  EventHandler,
  EventSubscription,
  
  // Configuration
  BaseConfig,
  DatabaseConfig,
  NetworkConfig,
  
  // Patterns
  Factory,
  Registry,
  Lifecycle
};