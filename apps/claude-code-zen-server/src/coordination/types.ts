/**
 * @file Coordination Domain Types - Comprehensive Agent and Swarm Types
 *
 * Single source of truth for all coordination-related types including the comprehensive
 * AgentType enumeration (140+ types), swarm configurations, and task orchestration.
 *
 * Following domain architecture standard with complete type definitions.
 */

// Re-export comprehensive AgentType from master registry (140+ types)
// This prevents "Type X is not assignable" errors in coordination domain
// Import SwarmAgent type from shared types
import type { SwarmAgent } from '../types/shared-types';

export type { AgentType } from '../types/agent-types';

// Additional agent-related types
export type AgentId = string;
export type AgentStatus =
  | 'idle'
  | 'busy'
  | 'active'
  | 'inactive'
  | 'error'
  | 'initializing'
  | 'offline'
  | 'terminated';
export interface AgentCapabilities {
  codeGeneration: boolean;
  codeReview: boolean;
  testing: boolean;
  documentation: boolean;
  research: boolean;
  analysis: boolean;
  webSearch: boolean;
  apiIntegration: boolean;
  fileSystem: boolean;
  terminalAccess: boolean;
  languages: string[];
  frameworks: string[];
  domains: string[];
  tools: string[];
  maxConcurrentTasks: number;
  maxMemoryUsage: number;
  maxExecutionTime: number;
  reliability: number;
  speed: number;
  quality: number;
}

export interface AgentMetrics {
  tasksCompleted: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  lastActivity: Date;
  tasksFailed: number;
  averageExecutionTime?: number;
  tasksInProgress?: number;
  successRate?: number;
  resourceUsage?: {
    memory?: number;
    cpu?: number;
    disk?: number;
  };
}

export interface AgentState {
  status: AgentStatus;
  currentTask?: string | null;
  lastUpdate: Date;
  health: 'healthy' | 'degraded' | 'error' | number;
  lastHeartbeat?: Date;
  metrics?: AgentMetrics;
  name?: string;
  type?: AgentType;
  id?: { id: string; swarmId?: string; type?: AgentType; instance?: number };
  environment?: AgentEnvironment;
  config?: AgentConfig;
  workload?: number;
  errorHistory?: AgentError[];
  performance?: Record<string, unknown>;
  capabilities?: AgentCapabilities;
  load?: number;
}

export interface AgentEnvironment {
  workingDirectory?: string;
  environment?: Record<string, string>;
  resources?: {
    memory?: number;
    cpu?: number;
  };
  runtime?: string;
  version?: string;
  tempDirectory?: string;
  logDirectory?: string;
  apiEndpoints?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  availableTools?: string[];
  toolConfigs?: Record<string, unknown>;
}

export interface AgentError {
  code: string;
  message: string;
  timestamp: Date;
  stack?: string;
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  resolved?: boolean;
}

export interface AgentConfig {
  id?: string;
  type?: AgentType;
  name?: string;
  swarmId?: string;
  autonomyLevel?: number;
  learningEnabled?: boolean;
  adaptationEnabled?: boolean;
  maxTasksPerHour?: number;
  maxConcurrentTasks?: number;
  timeoutThreshold?: number;
  reportingInterval?: number;
  heartbeatInterval?: number;
  permissions?: string[];
  trustedAgents?: string[];
  expertise?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  cognitiveProfile?: unknown;
  memory?: unknown;
  capabilities?: AgentCapabilities;
}

export interface Message {
  id: string;
  type: MessageType;
  payload: unknown;
  timestamp: Date;
  sender?: string;
  recipient?: string;
  fromAgentId?: string;
  toAgentId?: string;
  swarmId?: string;
}

export type MessageType =
  | 'task'
  | 'response'
  | 'error'
  | 'status'
  | 'heartbeat'
  | 'task_assignment'
  | 'coordination'
  | 'knowledge_share'
  | 'status_update'
  | 'result';

export interface ExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  timestamp: Date;
  metrics?: {
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  data?: unknown;
  executionTime?: number;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  capabilities: AgentCapabilities;
  status: AgentStatus;
  state?: AgentState;
  config?: AgentConfig;
  shutdown?: () => Promise<void>;
}

export interface Task {
  id: string;
  description: string;
  strategy: 'parallel' | 'sequential' | 'adaptive' | 'consensus';
  dependencies: string[];
  requiredCapabilities: string[];
  maxAgents: number;
  requireConsensus: boolean;
}

export interface PhaseAssignment {
  phase: string;
  agentId: string;
  capabilities: AgentCapabilities;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ExecutionCheckpoint {
  id: string;
  phase: string;
  timestamp: Date;
  status: 'pending' | 'completed';
  data?: Record<string, unknown>;
}

export interface ExecutionPlan {
  taskId: string;
  phases: string[];
  phaseAssignments: PhaseAssignment[];
  parallelizable: boolean;
  checkpoints: ExecutionCheckpoint[];
}

// Agent configuration interface (duplicate removed - using main definition above)

// Union type for agent compatibility
export type CompatibleAgent = Agent | SwarmAgent;

export interface SwarmStrategy {
  createAgent(config: AgentConfig): Promise<CompatibleAgent>;
  destroyAgent(agentId: string): Promise<void>;
  assignTaskToAgent(agentId: string, task: Task): Promise<void>;
  getAgents(): Promise<CompatibleAgent[]>;
}
