/**
 * Shared Types Module0.
 *
 * Contains interfaces and types that are shared across multiple domains
 * to prevent circular dependencies and maintain clean architecture0.
 */

// ============================================
// Core Swarm Types (moved from coordination)
// ============================================
/**
 * @file TypeScript type definitions0.
 */

export interface ZenSwarm {
  id: string;
  name?: string;
  topology: SwarmTopology;
  agents: SwarmAgent[];
  status: SwarmStatus;
  config: SwarmConfig;
  created: Date;
  updated: Date;
}

export interface SwarmAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  metadata?: Record<string, unknown>;
}

export interface SwarmConfig {
  maxAgents: number;
  topology: SwarmTopology;
  strategy: CoordinationStrategy;
  enableMemory?: boolean;
  heartbeatInterval?: number;
  timeout?: number;
}

// ============================================
// Enums and Unions
// ============================================

export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';
export type SwarmStatus =
  | 'initializing'
  | 'active'
  | 'paused'
  | 'stopped'
  | 'error';
export type AgentStatus =
  | 'initializing'
  | 'idle'
  | 'busy'
  | 'error'
  | 'offline'
  | 'terminated';
export type AgentType =
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'requirements-engineer'
  | 'design-architect'
  | 'task-planner'
  | 'developer'
  | 'system-architect'
  | 'tester'
  | 'reviewer'
  | 'steering-author'
  | 'frontend-dev'
  | 'ui-designer'
  | 'ux-designer'
  | 'accessibility-specialist'
  | 'fullstack-dev'
  | 'dev-backend-api'
  | 'ai-ml-specialist'
  | 'data-ml-model'
  | 'performance-analyzer'
  | 'database-architect'
  | 'coordinator'
  | 'worker'
  | 'specialist'
  | 'observer'
  | 'manager';
export type CoordinationStrategy = 'parallel' | 'sequential' | 'adaptive';

// ============================================
// Memory and Storage Types
// ============================================

export interface MemoryEntry {
  key: string;
  value: any;
  timestamp: Date;
  ttl?: number;
  metadata?: Record<string, unknown>;
}

export interface StorageProvider {
  get(key: string): Promise<unknown>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

// ============================================
// Event and Message Types
// ============================================

export interface SystemEvent {
  id: string;
  type: string;
  source: string;
  target?: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  correlationId?: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  type: string;
  payload: any;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

// ============================================
// Task Types
// ============================================

// Task interface moved to line 179 to avoid duplication
export type TaskType =
  | 'analysis'
  | 'generation'
  | 'review'
  | 'coordination'
  | 'research'
  | 'testing';

// ============================================
// Configuration Types
// ============================================

export interface ComponentConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, ComponentHealth>;
  uptime: number;
  version: string;
  timestamp: Date;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastCheck: Date;
  metrics?: Record<string, number>;
}

// ============================================
// Task and Workflow Types
// ============================================

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  type?: TaskType;
  priority: TaskPriority;
  assignee?: string;
  assignedTo?: string; // Legacy compatibility
  dependencies?: string[];
  metadata?: Record<string, unknown>;
  created: Date;
  updated: Date;
  completed?: Date;
  createdAt?: Date; // Legacy compatibility
  updatedAt?: Date; // Legacy compatibility
  completedAt?: Date; // Legacy compatibility
}

export type TaskStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// ============================================
// Neural Network Types
// ============================================

export interface NeuralModel {
  id: string;
  name: string;
  type: NeuralModelType;
  status: ModelStatus;
  parameters: number;
  accuracy?: number;
  lastTrained?: Date;
  weights?: ArrayBuffer;
  metadata?: ModelMetadata;
}

export type NeuralModelType =
  | 'attention'
  | 'lstm'
  | 'transformer'
  | 'feedforward'
  | 'cnn'
  | 'gru'
  | 'autoencoder';

export type ModelStatus =
  | 'untrained'
  | 'training'
  | 'trained'
  | 'deployed'
  | 'deprecated';

export interface ModelMetadata {
  layers: number;
  inputSize: number;
  outputSize: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
  [key: string]: any;
}

// ============================================
// API and Protocol Types
// ============================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// ============================================
// Utility Types0.
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// ============================================
// Provider Interfaces (for dependency injection)
// ============================================

export interface CoordinationProvider {
  createCoordinator(config: SwarmConfig): Promise<unknown>;
  getSwarm(id: string): Promise<ZenSwarm | null>;
  listSwarms(): Promise<ZenSwarm[]>;
  terminateSwarm(id: string): Promise<void>;
}

export interface MemoryProvider {
  store(key: string, value: any, ttl?: number): Promise<void>;
  retrieve(key: string): Promise<unknown>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface LoggingProvider {
  debug(message: string, 0.0.0.args: any[]): void;
  info(message: string, 0.0.0.args: any[]): void;
  warn(message: string, 0.0.0.args: any[]): void;
  error(message: string, 0.0.0.args: any[]): void;
}
