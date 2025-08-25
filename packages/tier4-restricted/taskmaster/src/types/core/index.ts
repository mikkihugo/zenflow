/**
 * @fileoverview Core Types for TaskMaster - GOLD STANDARD Enterprise Implementation
 *
 * Comprehensive type system for enterprise task flow management with:
 * - Complete domain modeling
 * - Production-grade error handling
 * - Advanced performance tracking
 * - Security and audit types
 * - Real-time monitoring types
 * - WASM integration types
 */

import type { TypedEventBase, EventEmitter } from '@claude-zen/foundation';
import type { Actor, StateValue } from 'xstate';
import type { z } from 'zod';

// =============================================================================
// CORE DOMAIN TYPES
// =============================================================================

/**
 * Unique identifier for tasks with enhanced type safety
 */
export type TaskId = string & { readonly __brand: 'TaskId' };

/**
 * Unique identifier for approval gates
 */
export type ApprovalGateId = string & { readonly __brand: 'ApprovalGateId' };

/**
 * Unique identifier for workflow instances
 */
export type WorkflowId = string & { readonly __brand: 'WorkflowId' };

/**
 * Unique identifier for users
 */
export type UserId = string & { readonly __brand: 'UserId' };

/**
 * Task priority levels with numerical weights for algorithms
 */
export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Numerical priority weights for WASM performance calculations
 */
export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  [TaskPriority.CRITICAL]: 1000,
  [TaskPriority.HIGH]: 100,
  [TaskPriority.MEDIUM]: 10,
  [TaskPriority.LOW]: 1,
} as const;

/**
 * Comprehensive task states with enterprise workflow support
 */
export enum TaskState {
  // Core workflow states
  BACKLOG = 'backlog',
  PLANNING = 'planning',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  APPROVAL = 'approval',
  DEPLOYMENT = 'deployment',
  DONE = 'done',

  // Special states
  BLOCKED = 'blocked',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  FAILED = 'failed',

  // Approval gate states
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

/**
 * State transition directions for flow analysis
 */
export enum TransitionDirection {
  FORWARD = 'forward',
  BACKWARD = 'backward',
  LATERAL = 'lateral',
  EXCEPTION = 'exception',
}

/**
 * Task complexity estimation for WASM performance prediction
 */
export enum TaskComplexity {
  TRIVIAL = 'trivial', // < 1 hour
  SIMPLE = 'simple', // 1-4 hours
  MODERATE = 'moderate', // 4-16 hours
  COMPLEX = 'complex', // 16-40 hours
  EPIC = 'epic', // > 40 hours
}

/**
 * WIP limit violation severity levels
 */
export enum WIPViolationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

// =============================================================================
// ENTERPRISE TASK DEFINITION
// =============================================================================

/**
 * Core task metadata with enterprise requirements
 */
export interface TaskMetadata {
  /** Task unique identifier */
  readonly id: TaskId;

  /** Human-readable task title */
  title: string;

  /** Detailed task description with markdown support */
  description?: string;

  /** Task priority level */
  priority: TaskPriority;

  /** Current workflow state */
  state: TaskState;

  /** Estimated complexity for performance prediction */
  complexity: TaskComplexity;

  /** Estimated effort in hours */
  estimatedHours?: number;

  /** Actual effort logged in hours */
  actualHours?: number;

  /** Task tags for categorization */
  tags: string[];

  /** Assigned user ID */
  assigneeId?: UserId;

  /** User who created the task */
  createdBy: UserId;

  /** Creation timestamp */
  createdAt: Date;

  /** Last modification timestamp */
  updatedAt: Date;

  /** Due date for task completion */
  dueDate?: Date;

  /** Parent task ID for sub-tasks */
  parentTaskId?: TaskId;

  /** Dependent task IDs that must complete first */
  dependencies: TaskId[];

  /** Approval gate requirements */
  approvalGates: ApprovalGateRequirement[];

  /** Custom metadata for extensions */
  customData: Record<string, unknown>;
}

/**
 * Task state transition history for audit trails
 */
export interface TaskStateTransition {
  /** Unique transition ID */
  readonly id: string;

  /** Task being transitioned */
  taskId: TaskId;

  /** Previous state */
  fromState: TaskState;

  /** New state */
  toState: TaskState;

  /** Transition direction classification */
  direction: TransitionDirection;

  /** User who performed transition */
  performedBy: UserId;

  /** Timestamp of transition */
  timestamp: Date;

  /** Optional reason for transition */
  reason?: string;

  /** Additional transition metadata */
  metadata: Record<string, unknown>;
}

/**
 * Approval gate requirement definition
 */
export interface ApprovalGateRequirement {
  /** Unique gate identifier */
  readonly id: ApprovalGateId;

  /** Gate name for display */
  name: string;

  /** Required approver user IDs */
  requiredApprovers: UserId[];

  /** Minimum number of approvals needed */
  minimumApprovals: number;

  /** Whether approval is required to proceed */
  isRequired: boolean;

  /** Gate timeout in hours */
  timeoutHours?: number;

  /** Auto-approval conditions */
  autoApprovalConditions?: ApprovalCondition[];
}

/**
 * Approval condition for automated gates
 */
export interface ApprovalCondition {
  /** Condition type */
  type: 'user_role|task_complexity|time_based|custom';

  /** Condition parameters */
  parameters: Record<string, unknown>;

  /** Condition evaluation script */
  evaluator?: string;
}

// =============================================================================
// WORKFLOW CONFIGURATION
// =============================================================================

/**
 * WIP limits configuration with intelligent adaptation
 */
export interface WIPLimitsConfig {
  /** Per-state WIP limits */
  limits: Record<TaskState, number>;

  /** Global WIP limit across all states */
  globalLimit: number;

  /** Whether to enable intelligent limit adaptation */
  enableIntelligentAdaptation: boolean;

  /** Adaptation sensitivity (0-1) */
  adaptationSensitivity: number;

  /** Minimum allowed limit per state */
  minimumLimits: Record<TaskState, number>;

  /** Maximum allowed limit per state */
  maximumLimits: Record<TaskState, number>;
}

/**
 * Performance thresholds for monitoring and alerting
 */
export interface PerformanceThresholds {
  /** Maximum cycle time in hours */
  maxCycleTimeHours: number;

  /** Maximum lead time in hours */
  maxLeadTimeHours: number;

  /** Minimum throughput tasks per day */
  minThroughputPerDay: number;

  /** Maximum WIP utilization (0-1) */
  maxWIPUtilization: number;

  /** Maximum blocked time percentage (0-1) */
  maxBlockedTimePercentage: number;

  /** Minimum flow efficiency (0-1) */
  minFlowEfficiency: number;
}

/**
 * TaskMaster configuration with enterprise features
 */
export interface TaskMasterConfig {
  /** Unique configuration ID */
  readonly id: string;

  /** Configuration name */
  name: string;

  /** WIP limits configuration */
  wipLimits: WIPLimitsConfig;

  /** Performance monitoring thresholds */
  performanceThresholds: PerformanceThresholds;

  /** Enable real-time monitoring */
  enableRealTimeMonitoring: boolean;

  /** Enable WASM performance acceleration */
  enableWASMAcceleration: boolean;

  /** Enable approval gates */
  enableApprovalGates: boolean;

  /** Enable automatic bottleneck detection */
  enableBottleneckDetection: boolean;

  /** Enable predictive analytics */
  enablePredictiveAnalytics: boolean;

  /** Monitoring intervals in milliseconds */
  monitoringIntervals: {
    wipCalculation: number;
    bottleneckDetection: number;
    performanceMetrics: number;
    predictiveAnalysis: number;
  };

  /** Security configuration */
  security: SecurityConfig;

  /** Integration configuration */
  integrations: IntegrationConfig;
}

/**
 * Security configuration for enterprise deployment
 */
export interface SecurityConfig {
  /** Enable authentication */
  enableAuthentication: boolean;

  /** Enable authorization */
  enableAuthorization: boolean;

  /** JWT secret key */
  jwtSecret: string;

  /** JWT expiration time */
  jwtExpirationHours: number;

  /** Rate limiting configuration */
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
  };

  /** CORS configuration */
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowCredentials: boolean;
  };

  /** Audit logging configuration */
  auditLogging: {
    enabled: boolean;
    logAllActions: boolean;
    retentionDays: number;
  };
}

/**
 * Integration configuration for external systems
 */
export interface IntegrationConfig {
  /** Database configuration */
  database: {
    type: 'postgresql|mysql|sqlite';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    poolSize: number;
  };

  /** Redis configuration for caching */
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    password?: string;
    database: number;
  };

  /** WebSocket configuration */
  websocket: {
    enabled: boolean;
    port: number;
    enableCompression: boolean;
  };

  /** Event system configuration */
  eventSystem: {
    enabled: boolean;
    maxListeners: number;
    enablePersistence: boolean;
  };
}

// =============================================================================
// PERFORMANCE AND ANALYTICS TYPES
// =============================================================================

/**
 * Flow metrics for performance monitoring
 */
export interface FlowMetrics {
  /** Current timestamp */
  timestamp: Date;

  /** Tasks per day throughput */
  throughput: number;

  /** Average cycle time in hours */
  avgCycleTime: number;

  /** Average lead time in hours */
  avgLeadTime: number;

  /** WIP efficiency (0-1) */
  wipEfficiency: number;

  /** Flow efficiency (value-add time / total time) */
  flowEfficiency: number;

  /** Blocked time percentage (0-1) */
  blockedTimePercentage: number;

  /** Predictability score (0-1) */
  predictability: number;

  /** Quality index (0-1) */
  qualityIndex: number;

  /** Resource utilization (0-1) */
  resourceUtilization: number;

  /** Customer satisfaction score (0-10) */
  customerSatisfaction?: number;
}

/**
 * Bottleneck detection result
 */
export interface BottleneckDetectionResult {
  /** Detection timestamp */
  timestamp: Date;

  /** Detected bottlenecks */
  bottlenecks: BottleneckInfo[];

  /** Overall system health (0-1) */
  systemHealth: number;

  /** Recommended actions */
  recommendations: BottleneckRecommendation[];

  /** Prediction confidence (0-1) */
  confidence: number;
}

/**
 * Individual bottleneck information
 */
export interface BottleneckInfo {
  /** State where bottleneck occurs */
  state: TaskState;

  /** Bottleneck severity (0-1) */
  severity: number;

  /** Number of tasks affected */
  affectedTaskCount: number;

  /** Estimated delay in hours */
  estimatedDelayHours: number;

  /** Bottleneck type classification */
  type: 'capacity|skill|dependency|process|resource';

  /** Contributing factors */
  factors: string[];

  /** Historical trend */
  trend: 'improving|stable|degrading';
}

/**
 * Bottleneck resolution recommendation
 */
export interface BottleneckRecommendation {
  /** Recommendation ID */
  readonly id: string;

  /** Affected state */
  state: TaskState;

  /** Recommended action */
  action: string;

  /** Action priority */
  priority: TaskPriority;

  /** Estimated impact (0-1) */
  estimatedImpact: number;

  /** Implementation effort hours */
  implementationEffort: number;

  /** Success probability (0-1) */
  successProbability: number;
}

// =============================================================================
// WASM INTEGRATION TYPES
// =============================================================================

/**
 * WASM performance prediction input
 */
export interface WASMPredictionInput {
  /** Tasks for analysis */
  tasks: TaskMetadata[];

  /** Historical flow metrics */
  historicalMetrics: FlowMetrics[];

  /** Current WIP limits */
  wipLimits: WIPLimitsConfig;

  /** Prediction horizon in days */
  predictionHorizonDays: number;
}

/**
 * WASM performance prediction result
 */
export interface WASMPredictionResult {
  /** Prediction timestamp */
  timestamp: Date;

  /** Predicted throughput */
  predictedThroughput: number;

  /** Predicted cycle time */
  predictedCycleTime: number;

  /** Predicted bottlenecks */
  predictedBottlenecks: BottleneckInfo[];

  /** Confidence score (0-1) */
  confidence: number;

  /** Model version used */
  modelVersion: string;

  /** Computation time in milliseconds */
  computationTimeMs: number;
}

/**
 * WASM module interface for performance calculations
 */
export interface WASMTaskFlowPredictor {
  /** Initialize the predictor with configuration */
  initialize(config: TaskMasterConfig): Promise<void>;

  /** Predict flow performance */
  predictPerformance(input: WASMPredictionInput): Promise<WASMPredictionResult>;

  /** Detect bottlenecks using ML algorithms */
  detectBottlenecks(
    tasks: TaskMetadata[],
    metrics: FlowMetrics[]
  ): Promise<BottleneckDetectionResult>;

  /** Optimize WIP limits */
  optimizeWIPLimits(
    currentLimits: WIPLimitsConfig,
    metrics: FlowMetrics[]
  ): Promise<WIPLimitsConfig>;

  /** Calculate flow metrics efficiently */
  calculateMetrics(
    tasks: TaskMetadata[],
    timeRange: TimeRange
  ): Promise<FlowMetrics>;

  /** Free WASM memory resources */
  destroy(): Promise<void>;
}

// =============================================================================
// API AND INTEGRATION TYPES
// =============================================================================

/**
 * Time range for queries and analytics
 */
export interface TimeRange {
  /** Start date */
  start: Date;

  /** End date */
  end: Date;

  /** Time zone */
  timezone?: string;
}

/**
 * API response wrapper with enterprise error handling
 */
export interface APIResponse<T = unknown> {
  /** Request success status */
  success: boolean;

  /** Response data */
  data?: T;

  /** Error information */
  error?: APIError;

  /** Response metadata */
  metadata: {
    timestamp: Date;
    requestId: string;
    version: string;
    processingTimeMs: number;
  };
}

/**
 * Comprehensive API error information
 */
export interface APIError {
  /** Error code */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Detailed error description */
  details?: string;

  /** Stack trace for debugging */
  stack?: string;

  /** Error metadata */
  metadata: Record<string, unknown>;

  /** Correlation ID for tracing */
  correlationId: string;
}

/**
 * Audit log entry for compliance
 */
export interface AuditLogEntry {
  /** Unique log entry ID */
  readonly id: string;

  /** Action performed */
  action: string;

  /** User who performed action */
  userId: UserId;

  /** Affected resource type */
  resourceType: 'task|workflow|user|config';

  /** Affected resource ID */
  resourceId: string;

  /** Action timestamp */
  timestamp: Date;

  /** Client IP address */
  clientIp?: string;

  /** User agent */
  userAgent?: string;

  /** Action details */
  details: Record<string, unknown>;

  /** Action result */
  result: 'success|failure|partial';
}

// =============================================================================
// EVENT SYSTEM TYPES
// =============================================================================

/**
 * TaskMaster event types for real-time coordination
 */
export interface TaskMasterEventMap {
  // Task lifecycle events
  'task:created': (task: TaskMetadata) => void;
  'task:updated': (task: TaskMetadata, previousState: TaskMetadata) => void;
  'task:deleted': (taskId: TaskId) => void;
  'task:state_changed': (transition: TaskStateTransition) => void;

  // Workflow events
  'workflow:started': (workflowId: WorkflowId, tasks: TaskMetadata[]) => void;
  'workflow:completed': (workflowId: WorkflowId, metrics: FlowMetrics) => void;
  'workflow:failed': (workflowId: WorkflowId, error: APIError) => void;

  // Approval gate events
  'approval:requested': (gateId: ApprovalGateId, taskId: TaskId) => void;
  'approval:granted': (
    gateId: ApprovalGateId,
    taskId: TaskId,
    approver: UserId
  ) => void;
  'approval:rejected': (
    gateId: ApprovalGateId,
    taskId: TaskId,
    approver: UserId,
    reason: string
  ) => void;
  'approval:timeout': (gateId: ApprovalGateId, taskId: TaskId) => void;

  // Performance events
  'performance:threshold_exceeded': (
    metric: keyof FlowMetrics,
    value: number,
    threshold: number
  ) => void;
  'performance:bottleneck_detected': (bottleneck: BottleneckInfo) => void;
  'performance:wip_violation': (
    state: TaskState,
    count: number,
    limit: number,
    severity: WIPViolationSeverity
  ) => void;

  // System events
  'system:started': (config: TaskMasterConfig) => void;
  'system:shutdown': () => void;
  'system:error': (error: APIError) => void;
  'system:health_check': (health: SystemHealthStatus) => void;

  // Security events
  'security:authentication_failed': (userId: string, clientIp: string) => void;
  'security:authorization_denied': (
    userId: UserId,
    resource: string,
    action: string
  ) => void;
  'security:rate_limit_exceeded': (clientIp: string, endpoint: string) => void;
}

/**
 * System health status for monitoring
 */
export interface SystemHealthStatus {
  /** Overall health score (0-1) */
  overallHealth: number;

  /** Component health status */
  components: {
    database: ComponentHealth;
    redis: ComponentHealth;
    websocket: ComponentHealth;
    wasm: ComponentHealth;
    eventSystem: ComponentHealth;
  };

  /** Active alerts */
  alerts: SystemAlert[];

  /** Health check timestamp */
  timestamp: Date;
}

/**
 * Individual component health
 */
export interface ComponentHealth {
  /** Component status */
  status: 'healthy|degraded|unhealthy|unknown';

  /** Response time in milliseconds */
  responseTimeMs: number;

  /** Error rate (0-1) */
  errorRate: number;

  /** Last check timestamp */
  lastCheck: Date;

  /** Additional details */
  details?: string;
}

/**
 * System alert for monitoring
 */
export interface SystemAlert {
  /** Alert ID */
  readonly id: string;

  /** Alert severity */
  severity: 'info|warning|error|critical';

  /** Alert message */
  message: string;

  /** Affected component */
  component: string;

  /** Alert timestamp */
  timestamp: Date;

  /** Resolution timestamp */
  resolvedAt?: Date;

  /** Alert metadata */
  metadata: Record<string, unknown>;
}

// =============================================================================
// TYPE UTILITIES AND HELPERS
// =============================================================================

/**
 * Type-safe event emitter for TaskMaster events
 */
export type TaskMasterEventEmitter = EventEmitter<TaskMasterEventMap>;

/**
 * Deep partial type for configuration updates
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Type guard for TaskId
 */
export function isTaskId(value: unknown): value is TaskId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for UserId
 */
export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for API response
 */
export function isAPIResponse<T>(value: unknown): value is APIResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'metadata' in value &&
    typeof (value as any).success === 'boolean');
}

/**
 * Helper to create TaskId from string
 */
export function createTaskId(value: string): TaskId {
  if (!value || value.trim().length === 0) {
    throw new Error('TaskId cannot be empty');
  }
  return value.trim() as TaskId;
}

/**
 * Helper to create UserId from string
 */
export function createUserId(value: string): UserId {
  if (!value || value.trim().length === 0) {
    throw new Error('UserId cannot be empty');
  }
  return value.trim() as UserId;
}

/**
 * Helper to create ApprovalGateId from string
 */
export function createApprovalGateId(value: string): ApprovalGateId {
  if (!value || value.trim().length === 0) {
    throw new Error('ApprovalGateId cannot be empty');
  }
  return value.trim() as ApprovalGateId;
}

/**
 * Helper to create WorkflowId from string
 */
export function createWorkflowId(value: string): WorkflowId {
  if (!value || value.trim().length === 0) {
    throw new Error('WorkflowId cannot be empty');
  }
  return value.trim() as WorkflowId;
}
