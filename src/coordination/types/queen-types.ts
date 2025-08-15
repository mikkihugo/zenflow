/**
 * @file Agent types and interfaces for the coordination system
 */

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  capabilities: string[];
  status: AgentStatus;
  metadata: Record<string, unknown>;
  config?: AgentConfig;
  performance?: AgentPerformance;
}

export type AgentType =
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'optimizer'
  | 'coordinator'
  | 'tester'
  | 'architect'
  | 'specialist';

export type AgentStatus =
  | 'idle'
  | 'busy'
  | 'offline'
  | 'error'
  | 'initializing';

export interface AgentConfig {
  maxConcurrentTasks: number;
  specializations: string[];
  preferredTaskTypes: string[];
  timeout: number;
  retryAttempts: number;
  memoryLimit?: number;
  customParams?: Record<string, unknown>;
}

export interface AgentPerformance {
  tasksCompleted: number;
  averageCompletionTime: number;
  successRate: number;
  errorRate: number;
  lastActiveTime: Date;
  totalExecutionTime: number;
  efficiency?: number;
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  priority: TaskPriority;
  payload: Record<string, unknown>;
  requiredCapabilities: string[];
  deadline?: Date;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
  executionTime: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentRegistry {
  registerAgent(agent: Agent): Promise<void>;
  unregisterAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): Promise<Agent | null>;
  getAllAgents(): Promise<Agent[]>;
  getAvailableAgents(capabilities?: string[]): Promise<Agent[]>;
  updateAgentStatus(agentId: string, status: AgentStatus): Promise<void>;
  updateAgentPerformance(
    agentId: string,
    performance: Partial<AgentPerformance>
  ): Promise<void>;
}

export interface AgentCoordinator {
  assignTask(task: AgentTask): Promise<string>;
  getTaskStatus(taskId: string): Promise<TaskResult | null>;
  cancelTask(taskId: string): Promise<boolean>;
  getAgentWorkload(agentId: string): Promise<number>;
  balanceLoad(): Promise<void>;
  monitorAgents(): Promise<Agent[]>;
}

export interface QueenCapabilities {
  maxAgents?: number;
  supportedTypes?: AgentType[];
  resourceLimits?: {
    memory: number;
    cpu: number;
    disk: number;
  };
  features?: string[];
  codeGeneration?: boolean;
  documentation?: boolean;
  research?: boolean;
  analysis?: boolean;
  webSearch?: boolean;
  apiIntegration?: boolean;
  fileSystem?: boolean;
  terminalAccess?: boolean;
  languages?: string[];
  frameworks?: string[];
  domains?: string[];
  tools?: string[];
  maxConcurrentTasks?: number;
  maxMemoryUsage?: number;
  maxExecutionTime?: number;
  reliability?: number;
  speed?: number;
  quality?: number;
}

export interface QueenConfig {
  id: string;
  name: string;
  capabilities: QueenCapabilities;
  environment: QueenEnvironment;
  autonomyLevel?: number;
  learningEnabled?: boolean;
  adaptationEnabled?: boolean;
  borgProtocol?: boolean;
  maxTasksPerHour?: number;
  maxConcurrentTasks?: number;
  timeoutThreshold?: number;
  reportingInterval?: number;
  heartbeatInterval?: number;
  permissions?: string[];
  trustedAgents?: string[];
  expertise?: Record<string, number>;
  preferences?: Record<string, unknown>;
  security?: {
    enabled: boolean;
    allowedOrigins?: string[];
    maxConcurrentTasks?: number;
  };
}

export interface QueenEnvironment {
  platform: string;
  version: string;
  runtime?: 'deno' | 'node' | 'claude' | 'browser';
  workingDirectory?: string;
  tempDirectory?: string;
  logDirectory?: string;
  apiEndpoints?: Record<string, string>;
  credentials?: Record<string, unknown>;
  availableTools?: string[];
  toolConfigs?: Record<string, unknown>;
  resources: {
    availableMemory: number;
    availableCpu: number;
    availableDisk: number;
  };
  constraints?: Record<string, unknown>;
}

export type QueenId = string;

export class QueenError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'QueenError';
  }
}

export interface QueenMetrics {
  agentCount: number;
  activeAgents: number;
  idleAgents: number;
  totalTasksAssigned: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageTaskDuration: number;
  resourceUtilization: {
    memory: number;
    cpu: number;
    disk: number;
  };
  performance: {
    throughput: number;
    latency: number;
    errorRate: number;
  };
  uptime: number;
  lastActivity: Date;
}

export type QueenState = 
  | 'initializing'
  | 'active'
  | 'idle'
  | 'busy'
  | 'maintenance'
  | 'error'
  | 'shutting_down'
  | 'offline';

export type QueenStatus = QueenState; // Alias for compatibility

export type QueenType = 
  | 'coordinator'
  | 'specialized'
  | 'failover'
  | 'test'
  | 'development'
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
  | 'steering-author';

// Add missing types for queen coordinator
export interface QueenCommanderConfig {
  id: string;
  name: string;
  maxAgents: number;
  maxConcurrentQueens: number;
  healthCheckInterval: number;
  heartbeatInterval: number;
  autoRestart: boolean;
  resourceLimits: {
    memory: number;
    cpu: number;
    disk: number;
  };
  queenDefaults: {
    autonomyLevel: number;
    learningEnabled: boolean;
    adaptationEnabled: boolean;
    borgProtocol: boolean;
  };
  environmentDefaults: {
    runtime: 'deno' | 'node' | 'claude' | 'browser';
    workingDirectory: string;
    tempDirectory: string;
    logDirectory: string;
  };
  clusterConfig: {
    maxNodes: number;
    replicationFactor: number;
    balancingStrategy: 'round_robin' | 'least_loaded' | 'capability_based';
  };
}

// Fix the circular dependency by defining interfaces here
export interface QueenCoordinatorConfig extends QueenCommanderConfig {
  autonomyLevel?: number;
  learningEnabled?: boolean;
  adaptationEnabled?: boolean;
}

export interface TaskCompletionData {
  swarmId: string;
  duration: number;
  metrics?: {
    qualityScore?: number;
    resourceUsage?: Record<string, unknown>;
  };
  collaboratedWith?: string[];
  taskType?: string;
  domain?: string;
  agentTypes?: string[];
  agentCount?: number;
  commanderType?: string;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  successRate: number;
  cpuUsage: number;
  memoryUsage: number;
  lastActivity: Date;
  responseTime: number;
}

export interface AgentError {
  timestamp: Date;
  type: string;
  message: string;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface QueenTemplate {
  id: string;
  name: string;
  type: QueenType;
  capabilities: QueenCapabilities;
  config: Partial<QueenConfig>;
  environment: Partial<QueenEnvironment>;
  startupScript?: string;
  dependencies?: string[];
}

export interface QueenCluster {
  id: string;
  name: string;
  queens: string[];
  status: 'active' | 'inactive' | 'failed';
  loadBalancer: {
    strategy: 'round_robin' | 'least_loaded';
    weights: Record<string, number>;
  };
}

export interface QueenPool {
  id: string;
  name: string;
  type: QueenType;
  capacity: number;
  available: number;
  queens: string[];
}

export interface QueenHealth {
  queenId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
  };
  issues: string[];
}
