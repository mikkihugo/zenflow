/**
 * Agent type definitions for the agent management system
 */

export interface AgentId {
  id: string;
  swarmId: string;
  type: AgentType;
  instance: number;
}

export type AgentType =
  // Core Foundation Agents
  | 'coder'
  | 'analyst'
  | 'researcher'
  | 'coordinator'
  | 'tester'
  | 'architect'
  | 'debug'
  | 'queen'
  | 'specialist'
  | 'reviewer'
  | 'optimizer'
  | 'documenter'
  | 'monitor'
  | 'planner'

  // Development Agents
  | 'requirements-engineer'
  | 'design-architect'
  | 'task-planner'
  | 'developer'
  | 'system-architect'
  | 'steering-author'
  | 'dev-backend-api'
  | 'frontend-dev'
  | 'fullstack-dev'
  | 'api-dev'

  // Testing Agents
  | 'unit-tester'
  | 'integration-tester'
  | 'e2e-tester'
  | 'performance-tester'
  | 'tdd-london-swarm'
  | 'production-validator'

  // Architecture Agents
  | 'arch-system-design'
  | 'database-architect'
  | 'cloud-architect'
  | 'security-architect'

  // DevOps Agents
  | 'ops-cicd-github'
  | 'infrastructure-ops'
  | 'monitoring-ops'
  | 'deployment-ops'

  // Documentation Agents
  | 'docs-api-openapi'
  | 'user-guide-writer'
  | 'technical-writer'
  | 'readme-writer'

  // Analysis Agents
  | 'analyze-code-quality'
  | 'performance-analyzer'
  | 'security-analyzer'
  | 'refactoring-analyzer'

  // Data Agents
  | 'data-ml-model'
  | 'etl-specialist'
  | 'analytics-specialist'
  | 'visualization-specialist'

  // Specialized Agents
  | 'spec-mobile-react-native'
  | 'embedded-specialist'
  | 'blockchain-specialist'
  | 'ai-ml-specialist'

  // DSPy Neural Enhancement Agents
  | 'prompt-optimizer'      // DSPy prompt optimization specialist
  | 'example-generator'     // DSPy few-shot example generation
  | 'metric-analyzer'       // DSPy performance metrics analysis
  | 'pipeline-tuner'        // DSPy LM pipeline optimization
  | 'neural-enhancer'       // DSPy neural workflow enhancement

  // UI/UX Enhancement Agents
  | 'ux-designer' // User experience design
  | 'ui-designer' // User interface design
  | 'accessibility-specialist' // Accessibility compliance

  // GitHub Integration Agents
  | 'code-review-swarm'
  | 'github-modes'
  | 'issue-tracker'
  | 'multi-repo-swarm'
  | 'pr-manager'
  | 'project-board-sync'
  | 'release-manager'
  | 'release-swarm'
  | 'repo-architect'
  | 'swarm-issue'
  | 'swarm-pr'
  | 'sync-coordinator'
  | 'workflow-automation'
  | 'github-pr-manager'

  // Swarm Coordination Agents
  | 'adaptive-coordinator'
  | 'hierarchical-coordinator'
  | 'mesh-coordinator'
  | 'coordinator-swarm-init'
  | 'orchestrator-task'
  | 'memory-coordinator'
  | 'swarm-memory-manager'
  | 'collective-intelligence-coordinator'

  // Consensus & Distributed Systems
  | 'byzantine-coordinator'
  | 'consensus-builder'
  | 'crdt-synchronizer'
  | 'gossip-coordinator'
  | 'performance-benchmarker'
  | 'quorum-manager'
  | 'raft-manager'
  | 'security-manager'

  // Performance & Optimization
  | 'benchmark-suite'
  | 'load-balancer'
  | 'performance-monitor'
  | 'resource-allocator'
  | 'topology-optimizer'
  | 'cache-optimizer' // Caching strategy optimization
  | 'memory-optimizer' // Memory usage optimization
  | 'latency-optimizer' // Latency reduction specialist
  | 'bottleneck-analyzer' // Performance bottleneck detection

  // SPARC Methodology Agents
  | 'specification'
  | 'architecture'
  | 'refinement'
  | 'pseudocode'
  | 'sparc-coordinator'
  | 'implementer-sparc-coder'
  | 'quality-gate-agent' // Quality assurance checkpoints
  | 'validation-specialist' // Cross-phase validation

  // Smart Automation Agents
  | 'automation-smart-agent'
  | 'base-template-generator'
  | 'migration-plan'

  // Migration & Planning Agents
  | 'legacy-analyzer' // Legacy system analysis
  | 'modernization-agent' // Technology modernization
  | 'migration-coordinator' // Migration strategy coordination

  // Maestro specs-driven agent types (legacy compatibility)
  | 'requirements_analyst'
  | 'design_architect'
  | 'task_planner'
  | 'implementation_coder'
  | 'quality_reviewer'
  | 'steering_documenter';

export type AgentStatus = 'initializing' | 'idle' | 'busy' | 'error' | 'terminated' | 'offline';

export interface AgentState {
  id: AgentId;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapabilities;
  metrics: AgentMetrics;
  workload: number;
  health: number;
  config: AgentConfig;
  environment: AgentEnvironment;
  endpoints: string[];
  lastHeartbeat: Date;
  taskHistory: string[];
  errorHistory: AgentError[];
  childAgents: AgentId[];
  collaborators: AgentId[];
  currentTask?: string | null;
  load?: number;
  performance?: any;
}

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

export interface AgentConfig {
  id?: string;
  name: string;
  type: AgentType;
  swarmId: string;
  capabilities?: string[];
  autonomyLevel: number;
  learningEnabled: boolean;
  adaptationEnabled: boolean;
  maxTasksPerHour: number;
  maxConcurrentTasks: number;
  timeoutThreshold: number;
  reportingInterval: number;
  heartbeatInterval: number;
  permissions: string[];
  trustedAgents: string[];
  expertise: Record<string, number>;
  preferences: Record<string, any>;
  cognitiveProfile?: any;
  memory?: any;
}

export interface AgentEnvironment {
  runtime: 'deno' | 'node' | 'claude' | 'browser';
  version: string;
  workingDirectory: string;
  tempDirectory: string;
  logDirectory: string;
  apiEndpoints: Record<string, string>;
  credentials: Record<string, string>;
  availableTools: string[];
  toolConfigs: Record<string, any>;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
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
  tasksInProgress?: number;
  resourceUsage?: {
    memory: number;
    cpu: number;
  };
  lastHealthCheck?: Date;
}

export interface AgentError {
  timestamp: Date;
  type: string;
  message: string;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  code?: string;
  agentId?: string;
  taskId?: string;
}

// Additional types for agent system functionality
export interface ExecutionResult {
  success: boolean;
  data: any;
  executionTime: number;
  agentId: string;
  metadata?: Record<string, any>;
}

export interface AgentCapability {
  name: string;
  version: string;
  description: string;
  requirements: string[];
}

export interface Task {
  id: string;
  swarmId: string;
  description: string;
  priority: string;
  strategy: string;
  status: string;
  progress: number;
  dependencies: string[];
  assignedAgents: string[];
  requireConsensus: boolean;
  maxAgents: number;
  requiredCapabilities: string[];
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  fromAgentId: string;
  toAgentId: string | null;
  swarmId: string;
  type: MessageType;
  content: any;
  timestamp: Date;
  requiresResponse: boolean;
  from?: string;
  payload?: any;
}

export type MessageType =
  | 'task_assignment'
  | 'status_update'
  | 'result'
  | 'error'
  | 'coordination'
  | 'memory_store'
  | 'memory_retrieve'
  | 'ping'
  | 'pong'
  | 'knowledge_share';

export interface Agent {
  id: string;
  type: AgentType;
  state: AgentState;
  config: AgentConfig;
  metrics: AgentMetrics;

  initialize(): Promise<void>;
  execute(task: Task): Promise<ExecutionResult>;
  handleMessage(message: Message): Promise<void>;
  updateState(updates: Partial<AgentState>): void;
  getStatus(): AgentStatus;
  shutdown(): Promise<void>;
}
