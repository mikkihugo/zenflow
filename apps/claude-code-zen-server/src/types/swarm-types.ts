/**
 * @fileoverview Shared Type Definitions for Swarm Operations
 *
 * Common types used across all interfaces(
  stdio MCP,
  HTTP API,
  HTTP MCP
)
 * to ensure consistency in swarm coordination functionality.
 */

export interface SwarmConfig {
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  maxAgents?: number;
  strategy?: 'balanced' | 'specialized' | 'adaptive' | 'parallel';
  features?: {
    cognitive_diversity?: boolean;
    neural_networks?: boolean;
    forecasting?: boolean;
    simd_support?: boolean;
  };
}

export interface AgentConfig {
  type:
    | 'researcher'
    | 'coder'
    | 'analyst'
    | 'optimizer'
    | 'coordinator'
    | 'tester';
  name?: string;
  capabilities?: string[];
  cognitive_pattern?:
    | 'convergent'
    | 'divergent'
    | 'lateral'
    | 'systems'
    | 'critical'
    | 'adaptive';
  learning_rate?: number;
  enable_memory?: boolean;
}

export interface TaskOrchestrationConfig {
  task: string;
  strategy?: 'parallel' | 'sequential' | 'adaptive';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  maxAgents?: number;
  timeout?: number;
  requirements?: {
    agent_types?: string[];
    capabilities?: string[];
    min_agents?: number;
    max_agents?: number;
  };
}

export type SwarmStatus = 'initializing' | 'active' | 'paused' | 'terminated';
export type AgentStatus = 'idle' | 'busy' | 'error' | 'offline';
export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface MemoryConfig {
  action: 'store' | 'retrieve' | 'list' | 'delete';
  key?: string;
  value?: any;
  pattern?: string;
  namespace?: string;
}

export interface NeuralConfig {
  agent_id?: string;
  pattern?:
    | 'convergent'
    | 'divergent'
    | 'lateral'
    | 'systems'
    | 'critical'
    | 'adaptive';
  iterations?: number;
  training_data?: any[];
}

export interface BenchmarkConfig {
  type?: 'all' | 'wasm' | 'swarm' | 'agent' | 'task' | 'neural';
  iterations?: number;
  duration?: number;
  agents?: number;
}

export interface MonitoringConfig {
  duration?: number;
  interval?: number;
  metrics?: string[];
  filter?: {
    swarm_id?: string;
    agent_type?: string;
    task_status?: TaskStatus;
  };
}

// Common response interfaces

export interface SwarmResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    request_id?: string;
    execution_time_ms?: number;
  };
}

export interface PaginatedResponse<T> extends SwarmResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

// Service interfaces

export interface SwarmServiceInterface {
  initializeSwarm(config: SwarmConfig): Promise<unknown>;
  spawnAgent(swarmId: string, config: AgentConfig): Promise<unknown>;
  orchestrateTask(config: TaskOrchestrationConfig): Promise<unknown>;
  getSwarmStatus(swarmId?: string): Promise<unknown>;
  getTaskStatus(taskId?: string): Promise<unknown>;
  getStats(): any;
  shutdown(): Promise<void>;
}

export interface MemoryServiceInterface {
  store(key: string, value: any, namespace?: string): Promise<unknown>;
  retrieve(key: string, namespace?: string): Promise<unknown>;
  list(pattern?: string, namespace?: string): Promise<unknown>;
  delete(key: string, namespace?: string): Promise<unknown>;
  clear(namespace?: string): Promise<unknown>;
}

export interface NeuralServiceInterface {
  getStatus(agentId?: string): Promise<unknown>;
  train(config: NeuralConfig): Promise<unknown>;
  getPatterns(pattern?: string): Promise<unknown>;
  analyze(agentId: string): Promise<unknown>;
}

// Validation schemas (for API endpoints)

export const SwarmConfigSchema = {
  type: 'object',
  properties: {
    topology: {
      type: 'string',
      enum: ['mesh', 'hierarchical', 'ring', 'star'],
    },
    maxAgents: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      default: 5,
    },
    strategy: {
      type: 'string',
      enum: ['balanced', 'specialized', 'adaptive', 'parallel'],
      default: 'adaptive',
    },
  },
  required: ['topology'],
  additionalProperties: false,
} as const;

export const AgentConfigSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: [
        'researcher',
        'coder',
        'analyst',
        'optimizer',
        'coordinator',
        'tester',
      ],
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    capabilities: {
      type: 'array',
      items: { type: 'string' },
    },
    cognitive_pattern: {
      type: 'string',
      enum: [
        'convergent',
        'divergent',
        'lateral',
        'systems',
        'critical',
        'adaptive',
      ],
      default: 'adaptive',
    },
  },
  required: ['type'],
  additionalProperties: false,
} as const;

export const TaskOrchestrationSchema = {
  type: 'object',
  properties: {
    task: {
      type: 'string',
      minLength: 10,
      maxLength: 1000,
    },
    strategy: {
      type: 'string',
      enum: ['parallel', 'sequential', 'adaptive'],
      default: 'adaptive',
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    maxAgents: {
      type: 'number',
      minimum: 1,
      maximum: 10,
      default: 5,
    },
  },
  required: ['task'],
  additionalProperties: false,
} as const;
