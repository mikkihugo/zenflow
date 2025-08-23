/**
 * @fileoverview Agent Types for Foundation
 *
 * Core agent types and interfaces used throughout the claude-code-zen ecosystem.
 * These types define the fundamental structures for agent management, lifecycle,
 * and coordination across all packages.
 *
 * Key Features:
 * - Agent instance and configuration types
 * - Status and health monitoring interfaces
 * - Performance metrics and resource usage
 * - Capability discovery and assignment
 * - Error tracking and recovery
 *
 * @package @claude-zen/foundation
 * @since 2.1.0
 * @version 1.0.0
 *
 * @example Basic Usage
 * ```typescript
 * import type {
 *   AgentInstance,
 *   AgentRegistrationConfig,
 *   AgentStatus
 * } from '@claude-zen/foundation';
 *
 * const agent: AgentInstance = {
 *   id: 'agent-001',
 *   templateId: 'worker-template',
 *   name: 'Data Processor',
 *   type: 'worker',
 *   status: 'ready',
 *   // ... other properties
 * };
 * ```
 */

import type { ChildProcess } from 'node:child_process';

import type { UUID, Timestamp } from './primitives';

// Define local interfaces to avoid circular dependency
interface Identifiable<T = string> {
  id: T;
}

interface Timestamped {
  createdAt: number;
  updatedAt: number;
}

// =============================================================================
// AGENT STATUS AND LIFECYCLE
// =============================================================================

/**
 * Agent status enumeration representing the current state of an agent instance.
 *
 * Status Flow:
 * spawning → initializing → ready → active/idle/busy → terminating → terminated
 *
 * Error States: failed, degraded, unhealthy (can transition from any active state)
 */
export type AgentStatus =|'spawning'// Agent process is being created|'initializing'// Agent is setting up and loading configuration|'ready'// Agent is ready to accept tasks|'active'// Agent is actively processing tasks|'idle'// Agent is running but not processing tasks|'busy'// Agent is at capacity and cannot accept new tasks|'degraded'// Agent is running but with reduced performance|'unhealthy'// Agent is experiencing issues but still operational|'terminating'// Agent is shutting down gracefully|'terminated'// Agent has stopped|'failed'; // Agent encountered a fatal error

/**
 * Health status for comprehensive agent monitoring.
 * Provides detailed health metrics for different aspects of agent operation.
 */
export interface HealthStatus {
  /** Overall health score (0-1 scale, where 1 is perfect health) */
  overall: number;

  /** Detailed component health metrics */
  components: {
    /** How quickly the agent responds to requests (0-1) */
    responsiveness: number;

    /** Task processing performance efficiency (0-1) */
    performance: number;

    /** Success rate and error frequency (0-1) */
    reliability: number;

    /** Resource usage efficiency (0-1, higher is better) */
    resourceUsage: number;
  };

  /** Timestamp of last health check */
  lastCheck: Timestamp;

  /** Health trend over time ('improving|stable|degrading') */
  trend: 'improving|stable|degrading';
}

// =============================================================================
// PERFORMANCE AND RESOURCE METRICS
// =============================================================================

/**
 * Performance metrics for agent monitoring and optimization.
 * Tracks key performance indicators for agent efficiency.
 */
export interface PerformanceMetrics {
  /** Average task completion time in milliseconds */
  averageResponseTime: number;

  /** Number of tasks completed */
  tasksCompleted: number;

  /** Number of tasks that failed */
  tasksFailed: number;

  /** Success rate as percentage (0-100) */
  successRate: number;

  /** Current throughput (tasks per second) */
  throughput: number;

  /** Peak throughput achieved */
  peakThroughput: number;

  /** Average CPU usage percentage (0-100) */
  averageCpu: number;

  /** Average memory usage in bytes */
  averageMemory: number;

  /** Total uptime in milliseconds */
  uptime: number;
}

/**
 * Current resource usage for an agent instance.
 * Provides real-time resource consumption metrics.
 */
export interface ResourceUsage {
  /** Current CPU usage percentage (0-100) */
  cpu: number;

  /** Current memory usage in bytes */
  memory: number;

  /** Memory limit in bytes (if set) */
  memoryLimit?: number;

  /** Current disk usage in bytes */
  disk: number;

  /** Network bandwidth usage in bytes/second */
  network: {
    incoming: number;
    outgoing: number;
  };

  /** Number of active connections */
  connections: number;

  /** File descriptors in use */
  fileDescriptors: number;
}

// =============================================================================
// CAPABILITIES AND ASSIGNMENTS
// =============================================================================

/**
 * Discovered capabilities of an agent instance.
 * Represents what the agent can do and its current capacity.
 */
export interface DiscoveredCapabilities {
  /** List of supported operations/tasks */
  supportedOperations: string[];

  /** Maximum concurrent tasks the agent can handle */
  maxConcurrentTasks: number;

  /** Current number of active tasks */
  currentTasks: number;

  /** Specialized skills or features */
  specializations: string[];

  /** API version or capability version */
  version: string;

  /** Additional capability metadata */
  metadata: Record<string, unknown>;
}

/**
 * Task assignment for an agent.
 * Represents a specific task assigned to the agent.
 */
export interface TaskAssignment extends Timestamped, Identifiable<UUID> {
  /** Type of task being assigned */
  taskType: string;

  /** Priority level of the task */
  priority: 'low|medium|high|critical';

  /** Current status of the task */
  status: 'pending|in_progress|completed|failed|cancelled';

  /** Task-specific parameters */
  parameters: Record<string, unknown>;

  /** Expected completion time (if known) */
  estimatedCompletion?: Timestamp;

  /** Actual completion time */
  completedAt?: Timestamp;

  /** Error details if task failed */
  error?: string;
}

// =============================================================================
// ERROR TRACKING
// =============================================================================

/**
 * Agent error information for debugging and recovery.
 */
export interface AgentError extends Timestamped {
  /** Unique identifier for this error instance */
  id: UUID;

  /** Error type or category */
  type: string;

  /** Human-readable error message */
  message: string;

  /** Error severity level */
  severity: 'low|medium|high|critical';

  /** Stack trace (if available) */
  stack?: string;

  /** Context information when error occurred */
  context: Record<string, unknown>;

  /** Whether this error was recovered from */
  recovered: boolean;

  /** Recovery action taken (if any) */
  recoveryAction?: string;
}

// =============================================================================
// MAIN AGENT INTERFACES
// =============================================================================

/**
 * Complete agent instance representing a running agent in the system.
 *
 * This interface defines the full state and metadata for an active agent,
 * including process information, health metrics, and operational data.
 */
export interface AgentInstance extends Timestamped, Identifiable<UUID> {
  /** Template ID used to create this agent */
  templateId: string;

  /** Human-readable name for the agent */
  name: string;

  /** Agent type/category (e.g., 'worker', 'coordinator', 'specialist') */
  type: string;

  /** Current operational status */
  status: AgentStatus;

  /** Child process reference (if applicable) */
  process?: ChildProcess;

  /** Process ID (if running as separate process) */
  pid?: number;

  /** When the agent was started */
  startTime: Date;

  /** Last time the agent was seen/responded */
  lastSeen: Date;

  /** Current health status and metrics */
  health: HealthStatus;

  /** Performance metrics and statistics */
  performance: PerformanceMetrics;

  /** Current resource usage */
  resources: ResourceUsage;

  /** Discovered capabilities and capacity */
  capabilities: DiscoveredCapabilities;

  /** Currently assigned tasks */
  assignments: TaskAssignment[];

  /** Error history for debugging */
  errors: AgentError[];

  /** Additional metadata and configuration */
  metadata: Record<string, unknown>;
}

/**
 * Configuration for registering a new agent.
 *
 * Defines the parameters needed to create and register an agent instance
 * in the agent management system.
 */
export interface AgentRegistrationConfig {
  /** Unique identifier for the agent (auto-generated if not provided) */
  id?: UUID;

  /** Template ID to use for agent creation */
  templateId: string;

  /** Human-readable name for the agent */
  name: string;

  /** Agent type/category */
  type: string;

  /** Initial configuration parameters */
  config: Record<string, unknown>;

  /** Resource limits for the agent */
  resources?: {
    maxMemory?: number;
    maxCpu?: number;
    maxTasks?: number;
  };

  /** Tags for categorization and discovery */
  tags?: string[];

  /** Priority level for resource allocation */
  priority?: 'low|medium|high|critical';

  /** Auto-start the agent after registration */
  autoStart?: boolean;

  /** Health check configuration */
  healthCheck?: {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
  };

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// =============================================================================
// AGENT TEMPLATE TYPES
// =============================================================================

/**
 * Agent template for creating standardized agent instances.
 */
export interface AgentTemplate extends Timestamped, Identifiable<UUID> {
  /** Template name */
  name: string;

  /** Template version */
  version: string;

  /** Agent type this template creates */
  agentType: string;

  /** Default configuration */
  defaultConfig: Record<string, unknown>;

  /** Required capabilities */
  requiredCapabilities: string[];

  /** Resource requirements */
  resourceRequirements: {
    minMemory: number;
    minCpu: number;
    maxMemory?: number;
    maxCpu?: number;
  };

  /** Template description */
  description: string;

  /** Template tags */
  tags: string[];

  /** Whether template is active */
  isActive: boolean;
}

// =============================================================================
// QUERY AND FILTER TYPES
// =============================================================================

/**
 * Query parameters for finding agents.
 */
export interface AgentQuery {
  /** Filter by agent type */
  type?: string;

  /** Filter by status */
  status?: AgentStatus|AgentStatus[];

  /** Filter by tags */
  tags?: string[];

  /** Filter by template ID */
  templateId?: string;

  /** Text search in name or metadata */
  search?: string;

  /** Health score threshold (minimum) */
  minHealth?: number;

  /** Performance threshold (minimum) */
  minPerformance?: number;

  /** Limit number of results */
  limit?: number;

  /** Skip number of results */
  offset?: number;

  /** Sort order */
  sort?: {
    field: keyof AgentInstance;
    direction:'asc|desc';
  };
}

// =============================================================================
// RESULT TYPES
// =============================================================================

/**
 * Result of agent operations.
 */
export interface AgentOperationResult<T = unknown> {
  /** Whether operation succeeded */
  success: boolean;

  /** Result data (if successful) */
  data?: T;

  /** Error message (if failed) */
  error?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Paginated agent query results.
 */
export interface AgentQueryResult {
  /** Found agents */
  agents: AgentInstance[];

  /** Total number of agents matching query */
  totalCount: number;

  /** Current page number */
  page: number;

  /** Number of agents per page */
  pageSize: number;

  /** Total number of pages */
  totalPages: number;
}
