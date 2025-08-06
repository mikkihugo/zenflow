/**
 * Core system tokens for dependency injection
 * Defines tokens for fundamental system services
 */

import { createToken } from './token-factory';

// Core infrastructure interfaces (to be implemented)
export interface ILogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

export interface IConfig {
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: any): void;
  has(key: string): boolean;
}

export interface IEventBus {
  emit(event: string, data: any): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
}

export interface IDatabase {
  initialize?(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>;
  shutdown?(): Promise<void>;

  // Task management methods
  createTask(task: any): Promise<void>;
  updateTask(taskId: string, updates: any): Promise<void>;
  getSwarmTasks(swarmId: string, status?: string): Promise<any[]>;

  // Agent management methods
  updateAgent(agentId: string, updates: any): Promise<void>;

  // Metrics methods
  getMetrics(entityId: string, metricType: string): Promise<any[]>;
}

export interface IHttpClient {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
}

// Core system tokens
export const CORE_TOKENS = {
  Logger: createToken<ILogger>('Logger'),
  Config: createToken<IConfig>('Config'),
  EventBus: createToken<IEventBus>('EventBus'),
  Database: createToken<IDatabase>('Database'),
  HttpClient: createToken<IHttpClient>('HttpClient'),
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
