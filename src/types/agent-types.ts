/**
 * @file Agent type definitions for the agent management system
 * Comprehensive TypeScript definitions for agent-related types
 */

// ==========================================
// CORE AGENT TYPES
// ==========================================

export type AgentType =
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'optimizer'
  | 'coordinator'
  | 'architect'
  | 'tester'
  | 'security'
  | 'data'
  | 'ops'
  // Performance optimization agents
  | 'cache-optimizer'
  | 'memory-optimizer'
  | 'latency-optimizer'
  | 'bottleneck-analyzer'
  | 'performance-analyzer'
  // Migration and planning agents
  | 'legacy-analyzer'
  | 'modernization-agent'
  | 'migration-coordinator'
  // SPARC methodology agents
  | 'quality-gate-agent'
  | 'validation-specialist'
  // UI/UX enhancement agents
  | 'ux-designer'
  | 'ui-designer'
  | 'accessibility-specialist'
  // Additional specialized agents
  | 'database-architect'
  | 'devops-engineer'
  | 'documentation-specialist';

export type AgentStatus =
  | 'idle'
  | 'busy'
  | 'offline'
  | 'error'
  | 'initializing'
  | 'terminated';

export type AgentId = string;

// ==========================================
// AGENT INTERFACES
// ==========================================

export interface AgentMetrics {
  tasksCompleted: number;
  averageExecutionTime: number;
  successRate: number;
  errorCount: number;
  lastActivity: Date;
  performance: number; // 0-1 scale
}

export interface AgentCapability {
  id: string;
  name: string;
  type: string;
  level: number; // 1-10 scale
  description?: string;
  requirements?: string[];
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  type: AgentType;
  capabilities: AgentCapability[];
  maxConcurrentTasks: number;
  timeout: number;
  retryCount: number;
  priority: number;
}

export interface Agent {
  id: AgentId;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapability[];
  currentTasks: string[];
  metrics: AgentMetrics;
  config: AgentConfig;
  created: Date;
  lastHeartbeat: Date;
  swarmId?: string;
}

// ==========================================
// TASK RELATED TYPES
// ==========================================

export interface TaskAssignment {
  taskId: string;
  agentId: AgentId;
  assignedAt: Date;
  priority: number;
  estimatedDuration?: number;
}

export interface AgentPool {
  agents: Agent[];
  capacity: number;
  activeCount: number;
  availableCount: number;
}

// ==========================================
// EXPORT TYPES FOR COMPATIBILITY
// ==========================================

export type {
  AgentType,
  AgentStatus,
  AgentId,
  AgentMetrics,
  AgentCapability,
  AgentConfig,
  Agent,
  TaskAssignment,
  AgentPool,
};
