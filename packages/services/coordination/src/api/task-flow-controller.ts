import { getLogger as _getLogger } from '@claude-zen/foundation';
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
  emit(_event: string, _data: unknown): boolean {
    return super.emit(event, data);
  }
}

import { DatabaseProvider as _DatabaseProvider } from '@claude-zen/database';
import { AGUISystem as _AGUISystem } from '../agui/main';
import { TaskApprovalSystem as _TaskApprovalSystem } from '../agui/task-approval-system';
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
 * Provides unified API for task flow management with: new TaskFlowController({
 *   wipLimits: 'Is this task ready for testing?';
 *     }
 *   },
 *   systemLimits: await taskFlow.moveTask('TASK-123'testing);
 * "Fixed unterminated template"("Fixed unterminated template")"Fixed unterminated template"("Fixed unterminated template")"Fixed unterminated template"("Fixed unterminated template")"Fixed unterminated template"("Fixed unterminated template")"Fixed unterminated template"[`${state}-gate"Fixed unterminated template" `Bottleneck detected in ${bottleneck} - consider increasing WIP limit"Fixed unterminated template" `${taskId}-${toState}"Fixed unterminated template" `Consider increasing WIP limit for ${state}"Fixed unterminated template" `Add more resources to ${state} processing"Fixed unterminated template" `Review process efficiency for ${state}"Fixed unterminated template" `Historical bottleneck frequency: ${historicalFrequency.toFixed(2)}"Fixed unterminated template"