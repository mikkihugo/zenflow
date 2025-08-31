/**
 * @fileoverview Task Flow Controller - Main API for Task Flow Management
 *
 * Unified task flow control system combining Kanban WIP limits with AGUI approval gates.
 * Provides capacity management, bottleneck detection, and human-in-the-loop decision points.
 *
 * **PURPOSE: Task Flow Management (NOT Project Management)**
 * - Controls how individual tasks move through development pipeline
 * - Manages capacity and prevents human overwhelm
 * - Provides approval gates for quality control
 * - Monitors flow health and bottlenecks
 *
 * **DOMAIN FOCUS:**
 * - Task state transitions and approval workflows
 * - WIP limit enforcement and capacity protection
 * - Flow optimization and bottleneck resolution
 * - Human approval gates with auto-approval thresholds
 * - System capacity monitoring and protection
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0 - Task Flow Management System
 */

import { getLogger, EventEmitter, type Logger } from '@claude-zen/foundation';

// EventBus for event emissions
class EventBus extends EventEmitter {
  emit(): void {
    return super.emit(): void { DatabaseProvider } from '@claude-zen/database';
import { AGUISystem } from '../agui/main';
import { TaskApprovalSystem } from '../agui/task-approval-system';
import { KanbanEngine as WorkflowKanban } from '../kanban/api/kanban-engine';
// =============================================================================
// TASK FLOW TYPES
// =============================================================================

/**
 * Task flow states for development pipeline
 */
export type TaskFlowState =
  | 'backlog'
  | 'analysis'
  | 'development'
  | 'testing'
  | 'deployment'
  | 'done';
/**
 * Approval gate configuration for task flow control
 */
export interface TaskFlowGate {
  /** Whether this gate requires approval */
  enabled: boolean;

  /** Auto-approve if confidence above this threshold (0.0-1.0) */
  autoApproveThreshold: number;

  /** Maximum items waiting in approval queue */
  maxQueueDepth: number;

  /** Behavior when queue is full */
  onQueueFull: 'halt' | 'spillover' | 'escalate' | 'auto-approve';
  /** Target state for spillover */
  spilloverTarget?: TaskFlowState;

  /** Human-readable question for approval */
  approvalQuestion: string;
}
/**
 * Task flow configuration combining Kanban and AGUI capabilities
 */
export interface TaskFlowConfig {
  /** WIP limits for each state */
  wipLimits: Record<TaskFlowState, number>;

  /** Approval gates configuration */
  gates: Partial<Record<TaskFlowState, TaskFlowGate>>;

  /** Global system limits */
  systemLimits: {
    /** Maximum total pending approvals across all gates */
    maxTotalPending: number;

    /** Maximum items waiting at any single gate */
    maxPerGate: number;

    /** System halt threshold (0.0-1.0) */
    systemCapacityThreshold: number;
  };

  /** Flow optimization settings */
  optimization: {
    /** Enable automatic bottleneck detection */
    enableBottleneckDetection: boolean;

    /** Enable adaptive WIP limit adjustments */
    enableAdaptiveWIP: boolean;

    /** Enable flow metrics collection */
    enableFlowMetrics: boolean;
  };
}
/**
 * Task flow status information
 */
export interface TaskFlowStatus {
  /** Current WIP usage per state */
  wipUsage: Record<
    TaskFlowState,
    { current: number; limit: number; utilization: number }
  >;

  /** Approval queue status */
  approvalQueues: Record<string, { pending: number; avgWaitTime: number }>;

  /** System capacity status */
  systemCapacity: {
    totalPending: number;
    maxPending: number;
    utilizationPercent: number;
    status: 'healthy' | 'warning' | 'critical' | 'halted';
  };
  /** Detected bottlenecks */
  bottlenecks: TaskFlowState[];

  /** Flow health recommendations */
  recommendations: string[];
}

/**
 * Bottleneck analysis result
 */
export interface BottleneckAnalysis {
  state: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number;
  recommendations: string[];
  timestamp?: Date;
}

// =============================================================================
// TASK FLOW CONTROLLER
// =============================================================================

/**
 * Main Task Flow Controller combining Kanban and AGUI capabilities
 *
 * Provides unified API for task flow management with: new TaskFlowController(): void {
  private readonly logger: Logger;
  private readonly config: TaskFlowConfig;
  private readonly kanban: WorkflowKanban;
  private readonly aguiSystem: AGUISystem;
  private readonly approvalSystem: TaskApprovalSystem;
  private readonly dbProvider: DatabaseProvider | null = null;
  private isHalted: boolean = false;

  constructor(): void {
    super(): void {
      enableBatchMode: true,
    });

    this.initializeDatabase(): void {
    try {
      const dbSystem = await DatabaseProvider.create(): void {
      this.logger.error(): void {
    // 1. Check system capacity before movement
    const systemStatus = await this.getSystemStatus(): void {
      this.logger.warn(): void {
      const approved = await this.processApprovalGate(): void {
        this.logger.info(): void {
      this.emit(): void {
    const wipUsage: Record<
      TaskFlowState,
      { current: number; limit: number; utilization: number }
    > = {} as Record<
      TaskFlowState,
      { current: number; limit: number; utilization: number }
    >;
    const approvalQueues: Record<
      string,
      { pending: number; avgWaitTime: number }
    > = {};
    // Calculate WIP usage for each state
    for (const [state, limit] of Object.entries(): void {
      const current = this.kanban.getStateTaskCount(): void {
        current,
        limit,
        utilization: current / limit,
      };
    }

    // Calculate approval queue status
    for (const [state, gate] of Object.entries(): void {
      if (gate && gate.enabled) {
        const pending = await this.getGateQueueDepth(): void {state}-gate"] = {"
          pending,
          avgWaitTime: await this.getAverageWaitTime(): void {
      recommendations.push(): void {
      recommendations.push(): void {
      wipUsage,
      approvalQueues,
      systemCapacity: {
        totalPending,
        maxPending,
        utilizationPercent,
        status,
      },
      bottlenecks,
      recommendations,
    };
  }

  private async getGateQueueDepth(): void {
      return this.calculateInMemoryQueueDepth(): void {
      const result = await this.dbProvider.query(): void {
      this.logger.error(): void {
    if (!this.dbProvider): Promise<void> {
      const result = await this.dbProvider.query(): void {
      this.logger.error(): void {
    // Listen to Kanban events
    this.kanban.on(): void {
      this.emit(): void {
      this.emit(): void {
    // Check if we can auto-approve
    if (confidence >= gate.autoApproveThreshold): Promise<void> {
      this.logger.info(): void {
      return this.handleQueueOverflow(): void {
      const response = await this.aguiSystem.askQuestion(): void {
      this.logger.error(): void {
    const gateCast = gate as TaskFlowGate;

    if (gateCast?.onQueueFull === 'spillover' && gateCast.spilloverTarget): Promise<void> {
      this.logger.info(): void {
        taskId,
        toState,
      });
      return true;
    }

    // Default: halt
    this.logger.warn(): void {
    // Placeholder for capacity escalation logic
    this.logger.info(): void {
    const currentTasks = this.kanban.getStateTaskCount(): void {
    if (!this.dbProvider): Promise<void> {
      const recentResult = await this.dbProvider.query(): void {
        return recentAvg / previousAvg;
      }
      return null;
    } catch (error) {
      this.logger.error(): void {
    try {
      // Restart task processing queues
      await this.reinitializeTaskProcessingQueues(): void { timestamp: new Date(): void {
      // Keep system halted if resume fails
      this.isHalted = true;
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  // Duplicate setupEventHandlers method removed - kept the first one only
  // Duplicate processApprovalGate method removed - kept the first one only
  // Duplicate getAverageWaitTime method removed - kept the first implementation

  // Duplicate getSystemStatus method removed - kept the public implementation

  /**
   * Persist bottleneck analysis to database for historical tracking
   */
  private async persistBottleneckAnalysis(): void {
      try {
        for (const [state, usage] of Object.entries(): void {
          await this.dbProvider.execute(): void {
          // Record bottleneck event in database
          await this.recordBottleneckEvent(): void {
        this.logger.error(): void {
    try {
      // Generate intelligent recommendations based on historical data
      const recommendations = await this.generateBottleneckRecommendations(): void {
        state: bottleneck.state,
        utilization: bottleneck.utilization,
        severity: bottleneck.severity,
        historicalFrequency: bottleneck.historicalFrequency,
        recommendations,
        timestamp: Date.now(): void {
        state: bottleneck.state,
        utilization: bottleneck.utilization,
        severity: bottleneck.severity,
        recommendations: recommendations.slice(): void {
      this.logger.error(): void {
    // Implementation for generating recommendations

    // Simulate async recommendation generation
    await new Promise(): void {state}""Add more resources to ${state} processing""Review process efficiency for ${state}","
    ];
  }
  // =============================================================================
  // HELPER METHODS FOR DATABASE INTEGRATION
  // =============================================================================

  // Duplicate calculateInMemoryQueueDepth method removed

  // Duplicate calculateRecentWaitTimeTrend method removed - kept the more complete implementation

  /**
   * Analyze bottleneck patterns (overriding the earlier stub)
   */
  private async analyzeBottleneckPatterns(): void {
      const utilization =
        this.kanban.getStateTaskCount(): void {
        try {
          const result = await this.dbProvider.query(): void {
            historicalFrequency = row.bottleneck_count / row.total_measurements;
          }
        } catch (error) {
          this.logger.error(): void {
        state,
        severity,
        impact: utilization,
        recommendations: [
          "Historical bottleneck frequency: ${historicalFrequency.toFixed(): void {
  return new TaskFlowController(): void { TaskFlowState, TaskFlowGate, TaskFlowConfig, TaskFlowStatus };
