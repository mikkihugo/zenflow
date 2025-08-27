/**
 * @fileoverview Kanban Domain Types - Professional Workflow Coordination
 *
 * Comprehensive type definitions for workflow coordination, WIP management,
 * and bottleneck detection. Designed for internal coordination systems, not web UI.
 *
 * **DOMAIN FOCUS:**
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
export type { FlowMetrics, OptimizationStrategy, TaskState, WIPLimits, WorkflowBottleneck, WorkflowKanbanConfig, WorkflowTask, } from './events';
/**
 * Task priority levels for workflow coordination
 */
export type TaskPriority = 'critical|high|medium|low';
/**
 * Flow direction for task movement
 */
export type FlowDirection = 'forward|backward|lateral';
/**
 * Task state transition event
 */
export interface TaskStateTransition {
    readonly taskId: string;
    readonly fromState: TaskState;
    readonly toState: TaskState;
    readonly timestamp: Date;
    readonly triggeredBy: string;
    readonly reason?: string;
    readonly duration?: number;
}
/**
 * Task assignment information
 */
export interface TaskAssignment {
    readonly taskId: string;
    readonly agentId: string;
    readonly assignedAt: Date;
    readonly estimatedCompletion: Date;
    readonly workloadImpact: number;
}
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
    readonly [key: string]: number;
}
/**
 * Intelligent WIP limits with optimization data
 */
export interface IntelligentWIPLimits {
    readonly current: WIPLimits;
    readonly optimal: WIPLimits;
    readonly historical: WIPLimits[];
    readonly optimizationScore: number;
    readonly lastOptimized: Date;
    readonly optimizationStrategy: OptimizationStrategy;
}
/**
 * WIP violation detection
 */
export interface WIPViolation {
    readonly state: TaskState;
    readonly currentCount: number;
    readonly limit: number;
    readonly violationType: 'soft' | 'hard;;
    readonly detectedAt: Date;
    readonly severity: 'low' | 'medium' | 'high' | 'critical;;
    readonly recommendedAction: string;
}
/**
 * Bottleneck detection in workflow
 */
export interface WorkflowBottleneck {
    readonly id: string;
    readonly state: TaskState;
    readonly type: 'capacity|dependency|resource|skill|process;;
    readonly severity: 'low' | 'medium' | 'high' | 'critical;;
    readonly impactScore: number;
    readonly detectedAt: Date;
    readonly affectedTasks: string[];
    readonly estimatedDelay: number;
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
    };
    readonly bottlenecks: WorkflowBottleneck[];
    readonly systemHealth: number;
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
    readonly estimatedImpact: number;
    readonly implementationEffort: number;
    readonly priority: TaskPriority;
    readonly prerequisites: string[];
}
/**
 * Bottleneck trend analysis
 */
export interface BottleneckTrend {
    readonly state: TaskState;
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | degrading;
    readonly trendScore: number;
    readonly dataPoints: number;
    readonly timeRange: {
        readonly start: Date;
        readonly end: Date;
    };
}
/**
 * Flow metrics for workflow analysis
 */
export interface FlowMetrics {
    readonly throughput: number;
    readonly cycleTime: number;
    readonly leadTime: number;
    readonly wipEfficiency: number;
    readonly blockageRate: number;
    readonly flowEfficiency: number;
    readonly predictability: number;
    readonly qualityIndex: number;
}
/**
 * Flow state snapshot for monitoring
 */
export interface FlowState {
    readonly timestamp: Date;
    readonly taskCounts: Record<TaskState, number>;
    readonly wipUtilization: Record<TaskState, number>;
    readonly activeBottlenecks: number;
    readonly systemLoad: number;
    readonly flowHealth: number;
    readonly trends: {
        readonly throughput: 'up' | 'down' | 'stable';
        readonly cycleTime: 'up' | 'down' | 'stable';
        readonly blockageRate: 'up' | 'down' | 'stable';
    };
}
/**
 * Performance threshold for alerts
 */
export interface PerformanceThreshold {
    readonly metric: keyof FlowMetrics;
    readonly operator: 'gt|lt|eq|gte|lte;;
    readonly value: number;
    readonly severity: 'low' | 'medium' | 'high' | 'critical;;
    readonly alertMessage: string;
    readonly enabled: boolean;
}
/**
 * Workflow kanban configuration
 */
export interface WorkflowKanbanConfig {
    readonly enableIntelligentWIP: boolean;
    readonly enableBottleneckDetection: boolean;
    readonly enableFlowOptimization: boolean;
    readonly enablePredictiveAnalytics: boolean;
    readonly enableRealTimeMonitoring: boolean;
    readonly wipCalculationInterval: number;
    readonly bottleneckDetectionInterval: number;
    readonly optimizationAnalysisInterval: number;
    readonly maxConcurrentTasks: number;
    readonly defaultWIPLimits: WIPLimits;
    readonly performanceThresholds: PerformanceThreshold[];
    readonly adaptationRate: number;
}
/**
 * Workflow coordination context
 */
export interface WorkflowContext {
    readonly sessionId: string;
    readonly orchestratorType: 'queen|commander|cube|matron;;
    readonly orchestratorId: string;
    readonly timestamp: Date;
    readonly metadata: Record<string, unknown>;
}
/**
 * Workflow events for XState machine coordination (re-exported from events module)
 */
export type { BottleneckDetectedEvent, BottleneckResolvedEvent, ConfigurationUpdatedEvent, EnterMaintenanceEvent, ErrorOccurredEvent, FlowAnalysisCompleteEvent, OptimizationTriggeredEvent, RestartSystemEvent, ResumeOperationEvent, SystemHealthCheckEvent, SystemHealthUpdatedEvent, TaskBlockedEvent, TaskCompletedEvent, TaskCreatedEvent, TaskMovedEvent, TaskUpdatedEvent, WIPLimitExceededEvent, WIPLimitsUpdatedEvent, WorkflowEvent, WorkflowEventUtils, } from './events';
/**
 * Task movement result
 */
export interface TaskMovementResult {
    readonly success: boolean;
    readonly taskId: string;
    readonly fromState: TaskState;
    readonly toState: TaskState;
    readonly timestamp: Date;
    readonly wipImpact?: WIPViolation;
    readonly bottleneckImpact?: WorkflowBottleneck;
    readonly error?: string;
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
    readonly improvementScore: number;
    readonly recommendations: BottleneckResolution[];
    readonly implementationPlan: string;
}
/**
 * System health check result
 */
export interface HealthCheckResult {
    readonly timestamp: Date;
    readonly overallHealth: number;
    readonly componentHealth: {
        readonly wipManagement: number;
        readonly bottleneckDetection: number;
        readonly flowOptimization: number;
        readonly taskCoordination: number;
    };
    readonly activeIssues: WorkflowBottleneck[];
    readonly recommendations: string[];
}
/**
 * Workflow kanban operation result
 */
export interface KanbanOperationResult<T = void> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: string;
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
    readonly timeRange: TimeRange;
}
//# sourceMappingURL=index.d.ts.map