/**
 * @fileoverview Core types for Agent Manager package
 *
 * Essential type definitions extracted from the main application
 * for standalone agent management functionality.
 */

// ==========================================
// CORE AGENT TYPES
// ==========================================

export type AgentType =
  || 'researcher|coder|analyst|optimizer|coordinator|architect|tester | security'|data|ops | debug'|queen|specialist|developer|api-dev'||frontend-dev|fullstack-dev'||database-architect|devops-engineer'||documentation-specialist';

// Cognitive archetype for specialized thinking patterns (primary intelligence types)
export type CognitiveArchetype =|'researcher|coder|analyst|architect';

// ==========================================
// EPHEMERAL SWARM TYPES (ruvswarm-style)
// ==========================================

export interface SwarmCreationConfig {
  /** Task description that drives agent selection and coordination */
  task: string;
  /** Cognitive types to instantiate for cognitive diversity */
  cognitiveTypes: CognitiveArchetype[];
  /** Coordination topology for agent communication */
  topology: SwarmTopology;
  /** Auto-dissolve timeout in milliseconds (default: 3600000 = 1 hour) */
  maxDuration?: number;
  /** Task complexity level affecting agent behavior */
  complexity?: 'low|medium|high';
  /** Enable WASM neural processing for enhanced decisions */
  neuralAcceleration?: boolean;
  /** Session persistence - survive Claude CLI restarts (default: true) */
  persistent?: boolean;
  /** Maximum Claude SDK interactions (default: unlimited) */
  maxTurns?: number;
}

export interface EphemeralSwarm {
  /** Unique swarm identifier */
  id: string;
  /** Original task that created the swarm */
  task: string;
  /** Instantiated cognitive agents */
  agents: CognitiveAgent[];
  /** Coordination topology */
  topology: SwarmTopology;
  /** Swarm creation timestamp */
  created: Date;
  /** Auto-dissolution timestamp (can be extended) */
  expiresAt: Date;
  /** Current execution status */
  status: 'initializing|active|executing|paused|dissolved';
  /** Session persistence enabled */
  persistent: boolean;
  /** Performance metrics (ephemeral but recoverable) */
  performance: {
    decisions: number;
    averageDecisionTime: number;
    coordinationEvents: number;
    claudeInteractions: number;
    lastActivity: Date;
  };
  /** Resumption data for Claude CLI restarts */
  resumption?: {
    checkpoint: unknown;
    lastState: string;
    contextData: unknown;
  };
}

export interface CognitiveAgent {
  /** Unique agent identifier within swarm */
  id: string;
  /** Cognitive archetype defining thinking patterns */
  archetype: CognitiveArchetype;
  /** Current operational status */
  status: 'initializing|ready|thinking|coordinating|dissolved';
  /** Specialized capabilities based on archetype */
  capabilities: string[];
  /** Performance characteristics */
  performance: {
    decisions: number;
    averageThinkingTime: number;
    coordinationSuccess: number;
  };
  /** Network connections to other agents */
  connections: string[];
  /** Decision-making patterns and preferences */
  cognition: {
    patterns: string[];
    strengths: string[];
    decisionSpeed: number; // milliseconds
  };
}

export interface SwarmExecutionResult {
  /** Swarm identifier */
  swarmId: string;
  /** Execution success status */
  success: boolean;
  /** Total execution time */
  duration: number;
  /** Individual agent results */
  agentResults: {
    agentId: string;
    archetype: CognitiveArchetype;
    decisions: number;
    averageDecisionTime: number;
    insights: string[];
  }[];
  /** Coordination effectiveness metrics */
  coordination: {
    totalDecisions: number;
    consensusReached: boolean;
    conflictResolutions: number;
    emergentInsights: string[];
  };
  /** Neural acceleration metrics (if enabled) */
  neuralMetrics?: {
    wasmCallsExecuted: number;
    neuralDecisions: number;
    accelerationGain: number; // performance multiplier
  };
}

export interface SwarmDecision {
  /** Decision identifier */
  id: string;
  /** Agent that made the decision */
  agentId: string;
  /** Cognitive archetype of deciding agent */
  archetype: CognitiveArchetype;
  /** Decision content/result */
  decision: unknown;
  /** Time taken to make decision (ms) */
  thinkingTime: number;
  /** Confidence level (0-1) */
  confidence: number;
  /** Decision timestamp */
  timestamp: Date;
  /** Context that influenced the decision */
  context: {
    task: string;
    swarmState: string;
    availableData: unknown;
  };
}

export type AgentStatus =|'idle|busy|offline|error|initializing|terminated';

export type SwarmTopology = 'mesh|hierarchical|ring|star';

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
// SWARM TYPES
// ==========================================

export interface SwarmAgent {
  /** Unique identifier for the agent within the swarm */
  id: string;
  /** Agent type determining its role and capabilities */
  type: AgentType;
  /** Current operational status */
  status: AgentStatus;
  /** List of capabilities this agent can perform */
  capabilities: string[];
  /** Real-time performance metrics */
  performance: {
    tasksCompleted: number;
    averageResponseTime: number;
    errorRate: number;
  };
  /** Network connections to other agents for coordination */
  connections: string[];
}

export interface SwarmMetrics {
  agentCount: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  averageLatency: number;
  coordinationEfficiency: number;
  uptime: number;
}

export interface SwarmConfig {
  maxAgents?: number;
  topology?: SwarmTopology;
  timeout?: number;
  healthCheckInterval?: number;
  coordinationStrategy?: string;
}

export interface SwarmOptions {
  topology: SwarmTopology;
  maxAgents: number;
  timeout: number;
  retryAttempts?: number;
  coordinationStrategy?: 'adaptive|static';
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
// EVENT TYPES
// ==========================================

export interface SwarmCoordinationEvent {
  /** Unique event identifier for tracking and deduplication */
  id: string;
  /** Event type for routing and processing */
  type:|''agent_added|agent_removed|agent_status_changed|task_assigned|task_completed|coordination_event';
  /** Agent identifier associated with the event (optional) */
  agentId?: string;
  /** Task identifier associated with the event (optional) */
  taskId?: string;
  /** Event-specific payload containing detailed information */
  data: unknown;
  /** Timestamp when the event occurred */
  timestamp: Date;
}

// Re-export as SwarmEvent for compatibility
export interface SwarmEvent extends SwarmCoordinationEvent {}
