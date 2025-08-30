/**
 * Shared Types
 *
 * Cross-domain types and utilities used throughout the system.
 * Consolidated from:shared-types.ts, global.d.ts, singletons.ts, event-types.ts
 */

// ============================================================================
// Base Types
// ============================================================================

export type UUID = string;
export type Timestamp = number;
export type ISODateString = string;

export interface BaseEntity {
  id: UUID;
  created: Date;
  updated: Date;
  metadata?: Record<string, unknown>;
}

export interface Identifiable {
  id: string;
}

export interface Timestamped {
  timestamp: Date;
}

export interface Versioned {
  version: string;
  previousVersion?: string;
}

// ============================================================================
// Event System Types
// ============================================================================

export interface SystemEvent extends Timestamped {
  id: UUID;
  type: EventType;
  source: string;
  target?: string;
  payload: unknown;
  priority: EventPriority;
  correlationId?: string;
}

export type EventType =
  | 'system.startup'
  | 'system.shutdown'
  | 'system.error'
  | 'system.config-change'
  | 'swarm.created'
  | 'swarm.updated'
  | 'swarm.deleted'
  | 'agent.connected'
  | 'agent.disconnected'
  | 'task.created'
  | 'task.completed'
  | 'task.failed'
  | 'api.request'
  | 'api.response'
  | 'custom';

export type EventPriority = 'low' | ' medium' | ' high' | ' critical';

export interface EventEmitter {
  emit(event: SystemEvent): void;
  on(type: EventType, handler: EventHandler): void;
  off(type: EventType, handler?: EventHandler): void;
  once(type: EventType, handler: EventHandler): void;
}

export type EventHandler = (event: SystemEvent) => void | Promise<void>;

// ============================================================================
// Service Types
// ============================================================================

export interface Service {
  name: string;
  version: string;
  status: ServiceStatus;
  health: ServiceHealth;
  dependencies: string[];
}

export type ServiceStatus =
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error';

export interface ServiceHealth {
  status: 'healthy' | ' degraded' | ' unhealthy';
  checks: HealthCheck[];
  lastCheck: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | ' fail' | ' warn';
  duration: number;
  message?: string;
}

// ============================================================================
// Integration Types
// ============================================================================

export interface ServiceIntegration {
  service: string;
  version: string;
  endpoint: string;
  auth?: ServiceAuth;
  config: IntegrationConfig;
}

export interface ServiceAuth {
  type: 'none' | ' bearer' | ' basic' | ' api-key';
  credentials?: Record<string, string>;
}

export interface IntegrationConfig {
  timeout: number;
  retries: number;
  circuitBreaker?: CircuitBreakerConfig;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  monitoringPeriod: number;
}

// ============================================================================
// Data Types
// ============================================================================

export interface DataSource {
  type: 'memory' | ' file' | ' database' | ' remote';
  config: DataSourceConfig;
  schema?: DataSchema;
}

export interface DataSourceConfig {
  connection: string;
  options?: Record<string, unknown>;
  credentials?: Record<string, string>;
}

export interface DataSchema {
  version: string;
  fields: SchemaField[];
  indexes?: SchemaIndex[];
}

export interface SchemaField {
  name: string;
  type: 'string' | ' number' | ' boolean' | ' date' | ' object' | ' array';
  required: boolean;
  validation?: ValidationRule[];
}

export interface SchemaIndex {
  name: string;
  fields: string[];
  unique: boolean;
}

export interface ValidationRule {
  type: 'regex' | ' range' | ' length' | ' custom';
  value: unknown;
  message?: string;
}

// ============================================================================
// Security Types
// ============================================================================

export interface SecurityContext {
  userId?: string;
  roles: string[];
  permissions: string[];
  sessionId?: string;
  apiKey?: string;
}

export interface AccessControl {
  resource: string;
  action: string;
  conditions?: AccessCondition[];
}

export interface AccessCondition {
  field: string;
  operator: 'eq' | ' ne' | ' in' | ' not-in' | ' gt' | ' lt';
  value: unknown;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type Awaitable<T> = T | Promise<T>;

export type Constructor<T = {}> = new (...args: unknown[]) => T;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// ============================================================================
// Result & Error Types
// ============================================================================

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}

export function success<T>(data: T): Success<T> {
  return { success: true, data };
}

export function failure<E>(error: E): Failure<E> {
  return { success: false, error };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isBaseEntity(obj: unknown): obj is BaseEntity {
  return (
    obj &&
    typeof obj.id === 'string' &&
    obj.created instanceof Date &&
    obj.updated instanceof Date
  );
}

export function isSystemEvent(obj: unknown): obj is SystemEvent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.source === 'string' &&
    obj.timestamp instanceof Date
  );
}

export function isService(obj: unknown): obj is Service {
  return (
    obj &&
    typeof obj.name === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.status === 'string'
  );
}

export function isSuccess<T>(result: Result<T, unknown>): result is Success<T> {
  return result.success === true;
}

export function isFailure<E>(result: Result<unknown, E>): result is Failure<E> {
  return result.success === false;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const EVENT_PRIORITIES: Record<EventPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const SERVICE_STATUSES: Record<ServiceStatus, string> = {
  starting: 'Starting',
  running: 'Running',
  stopping: 'Stopping',
  stopped: 'Stopped',
  error: 'Error',
};
