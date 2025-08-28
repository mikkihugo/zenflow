/**
 * @fileoverview Kanban Domain Types - Professional Workflow Coordination
 *
 * Comprehensive type definitions for workflow coordination, WIP management,
 * and bottleneck detection. Designed for internal coordination systems, not web UI.
 *
 * **DOMAIN FOCUS: **
 * - Workflow coordination (Queens/Commanders/Cubes)
 * - WIP limit optimization
 * - Bottleneck detection and resolution
 * - Flow metrics and analytics
 * - Task state management
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// =============================================================================
// CORE WORKFLOW TYPES - Import shared types to avoid circular dependency
// =============================================================================
// Import shared types from events to avoid circular dependency
export type {
  FlowMetrics,
  OptimizationStrategy,
  TaskState,
  WIPLimits,
  WorkflowBottleneck,
  WorkflowKanbanConfig,
  WorkflowTask;
} from './events'/**
 * Task priority levels for workflow coordination
 */'
export type TaskPriority = 'critical| high| medium| low'/**
 * Flow direction for task movement
 */'
export type FlowDirection = 'forward| backward| lateral'// OptimizationStrategy imported from events.ts;
// =============================================================================
// TASK DOMAIN TYPES
// =============================================================================
// WorkflowTask imported from events.ts
/**
 * Task state transition event
 */
export interface TaskStateTransition {
  readonly taskId: string;
  readonly fromState: TaskState;
  readonly toState: TaskState;
  readonly timestamp: Date;
  readonly triggeredBy: string; // agent ID
  readonly reason?:string;
  readonly duration?:number; // milliseconds in previous state
}
/**
 * Task assignment information
 */
export interface TaskAssignment {
  readonly taskId: string;
  readonly agentId: string;
  readonly assignedAt: Date;
  readonly estimatedCompletion: Date;
  readonly workloadImpact: number; // 0-1
}
// =============================================================================
// WIP LIMITS & OPTIMIZATION
// =============================================================================
/**
 * WIP (Work In Progress) limits configuration
 */
export interface WIPLimits {
  readonly backlog: number;
  readonly analysis: number;
  readonly development: number;
  readonly testing: number;
  readonly review: number;
  readonly deployment: number;
  readonly done: number;
  readonly blocked: number;
  readonly expedite: number;
  readonly total: number;
  // Index signature to allow Record<string, number> compatibility
  readonly [key: string]: number;
}
/**
 * Intelligent WIP limits with optimization data
 */
export interface IntelligentWIPLimits {
  readonly current: WIPLimits;
  readonly optimal: WIPLimits;
  readonly historical: WIPLimits[];
  readonly optimizationScore: number; // 0-1
  readonly lastOptimized: Date;
  readonly optimizationStrategy: OptimizationStrategy;
}
/**
 * WIP violation detection
 */
export interface WIPViolation {
  readonly state: TaskState;
  readonly currentCount: number;
  readonly limit: number;'
  readonly violationType : 'soft' | ' hard'  readonly detectedAt: Date;;'
  readonly severity: low' | ' medium'|' high' | ' critical'  readonly recommendedAction: string;;
}
// =============================================================================
// BOTTLENECK DETECTION & ANALYSIS
// =============================================================================
/**
 * Bottleneck detection in workflow
 */
export interface WorkflowBottleneck {
  readonly id: string;
  readonly state: TaskState;'
  readonly type : 'capacity| dependency| resource| skill' | ' process'  readonly severity: low'|' medium' | ' high'|' critical'  readonly impactScore: number; // 0-1;
  readonly detectedAt: Date;
  readonly affectedTasks: string[];
  readonly estimatedDelay: number; // hours
  readonly recommendedResolution: string;
  readonly metadata: Record<string, unknown>;
}
/**
 * Bottleneck analysis report
 */
export interface BottleneckReport {
  readonly reportId: string;
  readonly generatedAt: Date;
  readonly timeRange: {
    readonly start: Date;
    readonly end: Date;
}
  readonly bottlenecks: WorkflowBottleneck[];
  readonly systemHealth: number; // 0-1
  readonly recommendations: BottleneckResolution[];
  readonly trends: BottleneckTrend[];
}
/**
 * Bottleneck resolution strategy
 */
export interface BottleneckResolution {
  readonly bottleneckId: string;
  readonly strategy: OptimizationStrategy;
  readonly description: string;
  readonly estimatedImpact: number; // 0-1
  readonly implementationEffort: number; // hours
  readonly priority: TaskPriority;
  readonly prerequisites: string[];
}
/**
 * Bottleneck trend analysis
 */
export interface BottleneckTrend {
  readonly state: TaskState;'
  readonly trend : 'improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' degrading'  readonly trendScore: number; // -1 to 1;
  readonly dataPoints: number;
  readonly timeRange: {
    readonly start: Date;
    readonly end: Date;
}
}
// =============================================================================
// FLOW METRICS & ANALYTICS
// =============================================================================
/**
 * Flow metrics for workflow analysis
 */
export interface FlowMetrics {
  readonly throughput: number; // tasks per day
  readonly cycleTime: number; // average hours per task
  readonly leadTime: number; // hours from creation to completion
  readonly wipEfficiency: number; // 0-1
  readonly blockageRate: number; // percentage of time blocked
  readonly flowEfficiency: number; // 0-1
  readonly predictability: number; // 0-1
  readonly qualityIndex: number; // 0-1
}
/**
 * Flow state snapshot for monitoring
 */
export interface FlowState {
  readonly timestamp: Date;
  readonly taskCounts: Record<TaskState, number>;
  readonly wipUtilization: Record<TaskState, number>; // 0-1
  readonly activeBottlenecks: number;
  readonly systemLoad: number; // 0-1
  readonly flowHealth: number; // 0-1
  readonly trends: {'
    readonly throughput : 'up' | ' down'|' stable'    readonly cycleTime : 'up' | ' down'|' stable'    readonly blockageRate : 'up' | ' down'|' stable';
}
/**
 * Performance threshold for alerts
 */
export interface PerformanceThreshold {
  readonly metric: keyof FlowMetrics;'
  readonly operator : 'gt| lt| eq| gte' | ' lte'  readonly value: number;;'
  readonly severity: low' | ' medium'|' high' | ' critical'  readonly alertMessage: string;;
  readonly enabled: boolean;
}
// =============================================================================
// WORKFLOW COORDINATION CONFIGURATION
// =============================================================================
/**
 * Workflow kanban configuration
 */
export interface WorkflowKanbanConfig {
  readonly enableIntelligentWIP: boolean;
  readonly enableBottleneckDetection: boolean;
  readonly enableFlowOptimization: boolean;
  readonly enablePredictiveAnalytics: boolean;
  readonly enableRealTimeMonitoring: boolean;
  readonly wipCalculationInterval: number; // milliseconds
  readonly bottleneckDetectionInterval: number; // milliseconds
  readonly optimizationAnalysisInterval: number; // milliseconds
  readonly maxConcurrentTasks: number;
  readonly defaultWIPLimits: WIPLimits;
  readonly performanceThresholds: PerformanceThreshold[];
  readonly adaptationRate: number; // 0-1
}
/**
 * Workflow coordination context
 */
export interface WorkflowContext {
  readonly sessionId: string;'
  readonly orchestratorType : 'queen| commander| cube' | ' matron'  readonly orchestratorId: string;;
  readonly timestamp: Date;
  readonly metadata: Record<string, unknown>;
}
// =============================================================================
// EVENT TYPES FOR XSTATE INTEGRATION
// =============================================================================
/**
 * Workflow events for XState machine coordination (re-exported from events module)
 */
export type {
  BottleneckDetectedEvent,
  BottleneckResolvedEvent,
  ConfigurationUpdatedEvent,
  EnterMaintenanceEvent,
  ErrorOccurredEvent,
  FlowAnalysisCompleteEvent,
  OptimizationTriggeredEvent,
  RestartSystemEvent,
  ResumeOperationEvent,
  SystemHealthCheckEvent,
  SystemHealthUpdatedEvent,
  TaskBlockedEvent,
  TaskCompletedEvent,
  TaskCreatedEvent,
  TaskMovedEvent,
  TaskUpdatedEvent,
  WIPLimitExceededEvent,
  WIPLimitsUpdatedEvent,
  WorkflowEvent,
  WorkflowEventUtils,;'
} from './events'// =============================================================================;
// RESULT & RESPONSE TYPES
// =============================================================================
/**
 * Task movement result
 */
export interface TaskMovementResult {
  readonly success: boolean;
  readonly taskId: string;
  readonly fromState: TaskState;
  readonly toState: TaskState;
  readonly timestamp: Date;
  readonly wipImpact?:WIPViolation;
  readonly bottleneckImpact?:WorkflowBottleneck;
  readonly error?:string;
}
/**
 * Optimization analysis result
 */
export interface OptimizationResult {
  readonly analysisId: string;
  readonly timestamp: Date;
  readonly strategy: OptimizationStrategy;
  readonly currentMetrics: FlowMetrics;
  readonly projectedMetrics: FlowMetrics;
  readonly improvementScore: number; // 0-1
  readonly recommendations: BottleneckResolution[];
  readonly implementationPlan: string;
}
/**
 * System health check result
 */
export interface HealthCheckResult {
  readonly timestamp: Date;
  readonly overallHealth: number; // 0-1
  readonly componentHealth: {
    readonly wipManagement: number;
    readonly bottleneckDetection: number;
    readonly flowOptimization: number;
    readonly taskCoordination: number;
}
  readonly activeIssues: WorkflowBottleneck[];
  readonly recommendations: string[];
}
// =============================================================================
// UTILITY TYPES
// =============================================================================
/**
 * Workflow kanban operation result
 */
export interface KanbanOperationResult<T = void> {
  readonly success: boolean;
  readonly data?:T;
  readonly error?:string;
  readonly timestamp: Date;
}
/**
 * Flow analysis time range
 */
export interface TimeRange {
  readonly start: Date;
  readonly end: Date;
}
/**
 * Workflow statistics
 */
export interface WorkflowStatistics {
  readonly totalTasks: number;
  readonly completedTasks: number;
  readonly blockedTasks: number;
  readonly averageCycleTime: number;
  readonly averageLeadTime: number;
  readonly throughput: number;
  readonly wipEfficiency: number;
  readonly timeRange: TimeRange;'
}