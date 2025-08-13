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
