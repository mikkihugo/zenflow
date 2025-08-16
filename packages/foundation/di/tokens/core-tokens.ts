/**
 * Core system tokens for dependency injection.
 * Defines tokens for fundamental system services.
 */
/**
 * @file Core-tokens implementation.
 */

import { createToken } from './token-factory';
// Define SystemEvent interface locally for DI system
export interface SystemEvent {
  type: string;
  payload?: unknown;
  timestamp?: Date;
}

// Core infrastructure interfaces (to be implemented)
export interface Logger {
  debug(message: string, meta?: unknown): void;
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export interface Config {
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
}

export interface EventBus {
  emit(event: string, data: unknown): boolean;
  emitSystemEvent(event: SystemEvent): boolean;
  on(event: string, handler: (data: unknown) => void): this;
  off(event: string, handler: (data: unknown) => void): this;
}

export interface Database {
  initialize?(): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  transaction<T>(fn: (db: Database) => Promise<T>): Promise<T>;
  shutdown?(): Promise<void>;

  // Task management methods
  createTask(task: unknown): Promise<void>;
  updateTask(taskId: string, updates: unknown): Promise<void>;
  getSwarmTasks(swarmId: string, status?: string): Promise<any[]>;

  // Agent management methods
  updateAgent(agentId: string, updates: unknown): Promise<void>;

  // Metrics methods
  getMetrics(entityId: string, metricType: string): Promise<any[]>;
}

export interface HttpClient {
  get<T>(url: string, config?: unknown): Promise<T>;
  post<T>(url: string, data?: unknown, config?: unknown): Promise<T>;
  put<T>(url: string, data?: unknown, config?: unknown): Promise<T>;
  delete<T>(url: string, config?: unknown): Promise<T>;
}

// Core system tokens
export const CORE_TOKENS = {
  Logger: createToken<Logger>('Logger'),
  Config: createToken<Config>('Config'),
  EventBus: createToken<EventBus>('EventBus'),
  Database: createToken<Database>('Database'),
  HttpClient: createToken<HttpClient>('HttpClient'),
} as const;

// Memory domain tokens
export const MEMORY_TOKENS = {
  Backend: createToken('MemoryBackend'),
  Provider: createToken('MemoryProvider'),
  ProviderFactory: createToken('MemoryProviderFactory'),
  Config: createToken('MemoryConfig'),
  Controller: createToken('MemoryController'),
} as const;

// Database domain tokens
export const DATABASE_TOKENS = {
  Adapter: createToken('DatabaseAdapter'),
  Provider: createToken('DatabaseProvider'),
  ProviderFactory: createToken('DatabaseProviderFactory'),
  Config: createToken('DatabaseConfig'),
  Controller: createToken('DatabaseController'),
  DALFactory: createToken('DALFactory'),
} as const;

// Swarm coordination tokens
export const SWARM_TOKENS = {
  DatabaseManager: createToken('SwarmDatabaseManager'),
  MaintenanceManager: createToken('SwarmMaintenanceManager'),
  BackupManager: createToken('SwarmBackupManager'),
  Config: createToken('SwarmConfig'),
  StoragePath: createToken('SwarmStoragePath'),
} as const;
