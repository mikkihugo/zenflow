/**
 * @fileoverview THE COLLECTIVE Queen Coordinator Types
 * 
 * Comprehensive type definitions for THE COLLECTIVE hierarchical AI coordination system.
 * This module defines the Queen Coordinator level - strategic multi-swarm coordination
 * within the Borg-inspired architecture.
 * 
 * ## Hierarchy Overview
 * ```
 * THE COLLECTIVE (Neural Hub)
 *     ↓
 * CUBES (Domain Specialists: DEV-CUBE, OPS-CUBE, SECURITY-CUBE)
 *     ↓
 * CUBE MATRONS (Domain Leaders)
 *     ↓
 * QUEEN COORDINATORS (Strategic Multi-Swarm Coordination) ← THIS LEVEL
 *     ↓
 * SWARMCOMMANDERS (Tactical Coordination)
 *     ↓
 * AGENTS/DRONES (Execution)
 * ```
 * 
 * ## Queen Coordinator Responsibilities
 * - **Strategic Planning**: Cross-swarm resource allocation and coordination
 * - **Multi-Swarm Orchestration**: Managing multiple SwarmCommanders simultaneously
 * - **Resource Management**: Optimizing computational resources across swarms
 * - **Performance Monitoring**: Advanced metrics and health monitoring
 * - **Escalation Handling**: Complex issues requiring strategic intervention
 * - **Inter-Swarm Communication**: Coordinating knowledge sharing between swarms
 * 
 * ## Security Model
 * - **File Operations**: Read access for analysis, no direct file writing
 * - **Coordination Only**: Strategic oversight without direct implementation
 * - **Resource Limits**: Configurable limits to prevent resource exhaustion
 * - **Borg Protocol**: Optional enhanced coordination protocol
 * 
 * ## Usage Examples
 * ```typescript
 * // Initialize Queen Coordinator
 * const queenConfig: QueenConfig = {
 *   id: 'queen-strategic-coordinator',
 *   name: 'Strategic Multi-Swarm Queen',
 *   capabilities: {
 *     maxAgents: 100,
 *     supportedTypes: ['researcher', 'coder', 'analyst'],
 *     codeGeneration: false, // Queens coordinate, don't implement
 *     research: true,
 *     analysis: true
 *   },
 *   environment: {
 *     platform: 'claude-code-zen',
 *     version: '2.0.0',
 *     runtime: 'claude'
 *   }
 * };
 * 
 * // Queen metrics monitoring
 * const metrics: QueenMetrics = await queen.getMetrics();
 * console.log(`Managing ${metrics.agentCount} agents across ${metrics.activeSwarms} swarms`);
 * ```
 * 
 * @author Claude Code Zen Team
 * @since 2.0.0
 * @version 2.0.0
 * 
 * @see {@link SwarmCommander} For tactical-level coordination
 * @see {@link CubeMatron} For domain-level leadership
 * @see {@link TheCollective} For top-level neural hub
 * 
 * @module QueenCoordinator
 * @namespace TheCollective.QueenCoordinator
 */

/**
 * Base agent interface for THE COLLECTIVE coordination system.
 * 
 * Agents are the execution units in the hierarchy, managed by SwarmCommanders
 * and ultimately coordinated by Queen Coordinators for strategic alignment.
 * 
 * @interface Agent
 * @memberof TheCollective.QueenCoordinator
 * @since 2.0.0
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

/**
 * Agent specialization types supported by THE COLLECTIVE.
 * 
 * These types define the specialized capabilities of agents within the hierarchy.
 * Queen Coordinators use these types for strategic resource allocation and
 * task distribution across multiple swarms.
 * 
 * @typedef {string} AgentType
 * @memberof TheCollective.QueenCoordinator
 * @since 2.0.0
 * 
 * @example
 * ```typescript
 * // Strategic allocation by Queens
 * const researchSwarm = await queen.allocateAgents(['researcher', 'analyst']);
 * const devSwarm = await queen.allocateAgents(['coder', 'tester', 'architect']);
 * ```
 */
export type AgentType =
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'optimizer'
  | 'coordinator'
  | 'tester'
  | 'architect'
  | 'specialist'
  | 'specialized';

/**
 * Agent operational status within THE COLLECTIVE.
 * 
 * Queen Coordinators monitor these statuses across all managed swarms
 * for strategic resource planning and health monitoring.
 * 
 * @typedef {string} AgentStatus
 * @memberof TheCollective.QueenCoordinator
 * @since 2.0.0
 */
export type AgentStatus =
  | 'idle'
  | 'busy'
  | 'offline'
  | 'error'
  | 'initializing'
  | 'terminated';

export interface AgentConfig {
  name?: string;
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

/**
 * Queen Coordinator capabilities configuration.
 * 
 * Defines the strategic capabilities and resource limits for a Queen Coordinator.
 * Queens operate at the strategic level, coordinating multiple swarms without
 * direct implementation work.
 * 
 * ## Key Principles
 * - **Strategic Focus**: Analysis and coordination, not implementation
 * - **Resource Management**: Efficient allocation across multiple swarms
 * - **Read-Only Operations**: File read access for analysis, no writing
 * - **Scalable Coordination**: Support for large numbers of agents
 * 
 * @interface QueenCapabilities
 * @memberof TheCollective.QueenCoordinator
 * @since 2.0.0
 * 
 * @example
 * ```typescript
 * const capabilities: QueenCapabilities = {
 *   maxAgents: 200,
 *   supportedTypes: ['researcher', 'coder', 'analyst', 'tester'],
 *   codeGeneration: false, // Queens don't write code
 *   research: true,        // Strategic research and analysis
 *   analysis: true,        // Cross-swarm performance analysis
 *   fileSystem: true,      // Read access for codebase understanding
 *   terminalAccess: false  // No direct terminal access
 * };
 * ```
 */
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

/**
 * Queen Coordinator configuration.
 * 
 * Complete configuration for initializing a Queen Coordinator within
 * THE COLLECTIVE hierarchy. Queens manage strategic coordination across
 * multiple SwarmCommanders and their agent teams.
 * 
 * ## Configuration Sections
 * - **Identity**: Unique identification and naming
 * - **Capabilities**: Strategic capabilities and resource limits
 * - **Environment**: Runtime environment and resource constraints
 * - **Autonomy**: Decision-making and learning configuration
 * - **Security**: Access controls and operational limits
 * 
 * @interface QueenConfig
 * @memberof TheCollective.QueenCoordinator
 * @since 2.0.0
 * 
 * @example
 * ```typescript
 * const queenConfig: QueenConfig = {
 *   id: 'queen-dev-coordinator',
 *   name: 'Development Strategic Coordinator',
 *   capabilities: {
 *     maxAgents: 150,
 *     supportedTypes: ['researcher', 'coder', 'architect', 'tester'],
 *     codeGeneration: false,
 *     analysis: true,
 *     research: true
 *   },
 *   environment: {
 *     platform: 'claude-code-zen',
 *     runtime: 'claude',
 *     resources: {
 *       availableMemory: 8192,
 *       availableCpu: 8,
 *       availableDisk: 1024
 *     }
 *   },
 *   autonomyLevel: 8, // High strategic autonomy
 *   learningEnabled: true,
 *   borgProtocol: true // Enhanced coordination
 * };
 * ```
 */
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

/**
 * Queen Coordinator performance and operational metrics.
 * 
 * Comprehensive metrics for monitoring Queen Coordinator performance,
 * resource utilization, and strategic coordination effectiveness across
 * multiple swarms within THE COLLECTIVE.
 * 
 * ## Metrics Categories
 * - **Agent Management**: Agent counts and distribution
 * - **Task Coordination**: Task assignment and completion statistics
 * - **Resource Utilization**: CPU, memory, and disk usage
 * - **Performance**: Throughput, latency, and error rates
 * - **Strategic Effectiveness**: Cross-swarm coordination success
 * 
 * @interface QueenMetrics
 * @memberof TheCollective.QueenCoordinator
 * @since 2.0.0
 * 
 * @example
 * ```typescript
 * const metrics: QueenMetrics = await queen.getMetrics();
 * 
 * console.log(`Strategic Coordination Status:
 *   Agents: ${metrics.activeAgents}/${metrics.agentCount}
 *   Tasks: ${metrics.tasksCompleted} completed (${metrics.performance.errorRate}% error rate)
 *   Resource Usage: ${metrics.resourceUtilization.cpu}% CPU, ${metrics.resourceUtilization.memory}% Memory
 *   Uptime: ${metrics.uptime}ms
 * `);
 * 
 * // Alert if performance degrades
 * if (metrics.performance.errorRate > 5) {
 *   await queen.escalateToMatron('high-error-rate', metrics);
 * }
 * ```
 */
export interface QueenMetrics {
  agentCount: number;
  activeAgents: number;
  idleAgents: number;
  totalTasksAssigned: number;
  tasksCompleted: number;
  tasksFailed: number;
  averageTaskDuration: number;
  averageExecutionTime: number;
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
  defaultTimeout: number;
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
  priority?: string;
  metrics?: {
    qualityScore?: number;
    resourceUsage?: Record<string, unknown>;
    resourceSavings?: {
      cpu?: number;
      memory?: number;
    };
    timeReduction?: number;
    resourceUtilization?: number;
  };
  collaboratedWith?: string[];
  taskType?: string;
  domain?: string;
  agentTypes?: string[];
  agentCount?: number;
  commanderType?: string;
}

export interface SwarmDegradationData {
  swarmId: string;
  reason: string;
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
  code: string;
  timestamp: Date;
  type: string;
  message: string;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  stack?: string;
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
  agents: AgentId[];
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
  minSize: number;
  maxSize: number;
  currentSize: number;
  template: QueenTemplate;
  availableAgents: AgentId[];
  busyAgents: AgentId[];
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
  components: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
  };
}

// Missing interfaces that are needed by queen-coordinator
export interface AgentEnvironment {
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

export interface AgentId {
  id: string;
  swarmId: string;
  type: AgentType;
  instance: number;
}

export interface AgentState {
  id: AgentId;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: QueenCapabilities;
  metrics: AgentMetrics;
  workload: number;
  health: number;
  lastHeartbeat: Date;
  errors: AgentError[];
  config: AgentConfig;
  environment: AgentEnvironment;
}

export interface AgentError {
  code: string;
  timestamp: Date;
  type: string;
  message: string;
  context: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  tasksInProgress: number;
  averageExecutionTime: number;
  successRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  codeQuality: number;
  testCoverage: number;
  bugRate: number;
  userSatisfaction: number;
  totalUptime: number;
  lastActivity: Date;
  responseTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
}
