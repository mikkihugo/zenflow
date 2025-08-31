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
  emit(event: string, data: unknown): boolean {
    return super.emit(event, data);
  }
}

import { DatabaseProvider } from '@claude-zen/database';
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
 * Provides unified API for task flow management with: new TaskFlowController({
 *   wipLimits: 'Is this task ready for testing?';
 *     }
 *   },
 *   systemLimits: await taskFlow.moveTask('TASK-123'testing);
 * ";"
 */
export class TaskFlowController extends EventBus {
  private readonly logger: Logger;
  private readonly config: TaskFlowConfig;
  private readonly kanban: WorkflowKanban;
  private readonly aguiSystem: AGUISystem;
  private readonly approvalSystem: TaskApprovalSystem;
  private readonly dbProvider: DatabaseProvider | null = null;
  private isHalted: boolean = false;

  constructor(config: TaskFlowConfig) {
    super();
    this.logger = getLogger('TaskFlowController');
    this.config = config;

    // Initialize Kanban workflow engine
    this.kanban = new WorkflowKanban({
      states: Object.keys(config.wipLimits) as TaskFlowState[],
    });
    this.aguiSystem = new AGUISystem({
      type: 'approval',
    });
    this.approvalSystem = new TaskApprovalSystem({
      enableBatchMode: true,
    });

    this.initializeDatabase();
    this.setupEventHandlers();
  }

  private async initializeDatabase(Promise<void> {
    try {
      const dbSystem = await DatabaseProvider.create();
      this.dbProvider = dbSystem.createProvider('sqlite');

      // Create task flow tables if they dont exist
      await this.dbProvider
        .execute("CREATE TABLE IF NOT EXISTS task_flow_states ("
          task_id TEXT PRIMARY KEY,
          current_state TEXT NOT NULL,
          previous_state TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          confidence REAL DEFAULT 0.5,
          metadata TEXT
        )");"

      await this.dbProvider
        .execute("CREATE TABLE IF NOT EXISTS task_flow_metrics ("
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          state TEXT NOT NULL,
          task_count INTEGER NOT NULL,
          wip_utilization REAL NOT NULL,
          bottleneck_score REAL DEFAULT 0.0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )");"

      await this.dbProvider
        .execute("CREATE TABLE IF NOT EXISTS approval_queue_history ("
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id TEXT NOT NULL,
          state TEXT NOT NULL,
          queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          processed_at DATETIME,
          wait_time_ms INTEGER,
          approval_result TEXT
        )");"

      await this.dbProvider.execute("CREATE TABLE IF NOT EXISTS system_events ("
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          event_data TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          severity TEXT DEFAULT 'info'
        )");"
      this.logger.info(
        'Database initialized successfully for TaskFlowController'
      );
    } catch (error) {
      this.logger.error('Failed to initialize database:', error);
      // Continue without database - graceful degradation
    }
  }
  /**
   * Move a task to a new state with approval gate checking
   */
  async moveTask(Promise<boolean> {
    // 1. Check system capacity before movement
    const systemStatus = await this.getSystemStatus();
    if (systemStatus.systemCapacity.status === 'critical') {
      this.logger.warn('System at critical capacity - halting task movement', {
        taskId,
        toState,
        systemCapacity: systemStatus.systemCapacity,
      });
      return false;
    }

    // 2. Check approval gate
    const gate = this.config.gates[toState];
    if (gate?.enabled) {
      const approved = await this.processApprovalGate(
        taskId,
        toState,
        confidence,
        gate
      );
      if (!approved) {
        this.logger.info('Task movement rejected by approval gate', {
          taskId,
          toState,
          confidence,
        });
        return false;
      }
    }

    // 3. Execute movement through Kanban
    const moved = await this.kanban.moveTask(taskId, toState);

    if (moved) {
      this.emit('taskMoved', { taskId, toState, timestamp: new Date() });
      return true;
    }

    return false;
  }

  async getSystemStatus(Promise<TaskFlowStatus> {
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
    for (const [state, limit] of Object.entries(this.config.wipLimits)) {
      const current = this.kanban.getStateTaskCount(state as TaskFlowState);
      wipUsage[state as TaskFlowState] = {
        current,
        limit,
        utilization: current / limit,
      };
    }

    // Calculate approval queue status
    for (const [state, gate] of Object.entries(this.config.gates)) {
      if (gate && gate.enabled) {
        const pending = await this.getGateQueueDepth(state as TaskFlowState);
        approvalQueues["${state}-gate"] = {"
          pending,
          avgWaitTime: await this.getAverageWaitTime(state as TaskFlowState),
        };
      }
    }

    // Calculate system capacity
    const totalPending = Object.values(approvalQueues).reduce(
      (sum, queue) => sum + queue.pending,
      0
    );
    const maxPending = this.config.systemLimits.maxTotalPending;
    const utilizationPercent = (totalPending / maxPending) * 100;

    let status: 'healthy' | 'warning' | 'critical' | 'halted' = 'healthy';
    if (this.isHalted) status = 'halted';
    else if (utilizationPercent > 90) status = 'critical';
    else if (utilizationPercent > 70) status = 'warning';

    // Detect bottlenecks
    const bottlenecks = Object.entries(wipUsage)
      .filter(([, usage]) => usage.utilization > 0.9)
      .map(([state]) => state as TaskFlowState);

    // Generate recommendations
    const recommendations: string[] = [];
    if (totalPending > maxPending * 0.8) {
      recommendations.push(
        'Consider pausing task intake - approaching capacity limits'
      );
    }
    for (const bottleneck of bottlenecks) " + JSON.stringify({
      recommendations.push(
        `Bottleneck detected in ${bottleneck}) + " - consider increasing WIP limit""
      );
    }

    return {
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

  private async getGateQueueDepth(Promise<number> {
    if (!this.dbProvider) {
      return this.calculateInMemoryQueueDepth(state);
    }

    try {
      const result = await this.dbProvider.query(
        'SELECT COUNT(*) as queue_depth FROM approval_queue_history WHERE state = ? AND processed_at IS NULL',
        [state]
      );
      return result.rows[0]?.queue_depth || 0;
    } catch (error) {
      this.logger.error('Error querying gate queue depth', { state, error });
      return this.calculateInMemoryQueueDepth(state);
    }
  }

  private async getAverageWaitTime(Promise<number> {
    if (!this.dbProvider) return 300000; // 5 minutes default

    try {
      const result = await this.dbProvider.query(
        'SELECT AVG(wait_time_ms) as avg_wait_time FROM approval_queue_history WHERE state = ? AND processed_at IS NOT NULL AND queued_at > datetime("now", "-7 days")',
        [state]
      );
      return result.rows[0]?.avg_wait_time || 300000;
    } catch (error) {
      this.logger.error('Error calculating average wait time', {
        state,
        error,
      });
      return 300000;
    }
  }

  private setupEventHandlers(): void {
    // Listen to Kanban events
    this.kanban.on('bottleneckDetected', (data) => {
      this.emit('bottleneckDetected', data);
      this.logger.warn('Bottleneck detected', data);
    });

    // Listen to AGUI events
    this.aguiSystem.on('approvalRequested', (data) => {
      this.emit('approvalRequested', data);
    });
  }

  private async processApprovalGate(Promise<boolean> {
    // Check if we can auto-approve
    if (confidence >= gate.autoApproveThreshold) {
      this.logger.info('Auto-approving task movement', {
        taskId,
        toState,
        confidence,
        threshold: gate.autoApproveThreshold,
      });
      return true;
    }

    // Check queue depth
    const queueDepth = await this.getGateQueueDepth(toState);
    if (queueDepth >= gate.maxQueueDepth) {
      return this.handleQueueOverflow(taskId, toState, gate);
    }

    // Request human approval
    try {
      const response = await this.aguiSystem.askQuestion({
        id: "${taskId}-${toState}","
        question: gate.approvalQuestion,
        metadata: { taskId, toState, confidence },
      });
      return response.approved === true;
    } catch (error) {
      this.logger.error('Error processing approval gate', {
        taskId,
        toState,
        error,
      });
      return false;
    }
  }

  private async handleQueueOverflow(Promise<boolean> {
    const gateCast = gate as TaskFlowGate;

    if (gateCast?.onQueueFull === 'spillover' && gateCast.spilloverTarget) {
      this.logger.info('WIP limit reached - redirecting to spillover state', {
        taskId,
        originalState: toState,
        spilloverState: gateCast.spilloverTarget,
      });
      return await this.moveTask(taskId, gateCast.spilloverTarget);
    }

    if (gateCast?.onQueueFull === 'escalate') {
      return await this.escalateCapacityDecision(taskId, toState);
    }

    if (gateCast?.onQueueFull === 'auto-approve') {
      this.logger.info('Auto-approving due to queue overflow', {
        taskId,
        toState,
      });
      return true;
    }

    // Default: halt
    this.logger.warn('Halting task due to queue overflow', { taskId, toState });
    return false;
  }

  private async escalateCapacityDecision(Promise<boolean> {
    // Placeholder for capacity escalation logic
    this.logger.info('Escalating capacity decision', { taskId, toState });

    // Simulate async escalation process
    await new Promise((resolve) => setTimeout(resolve, 100));

    return false;
  }

  private calculateInMemoryQueueDepth(state: TaskFlowState): number {
    const currentTasks = this.kanban.getStateTaskCount(state);
    const wipLimit = this.config.wipLimits[state];
    return Math.max(0, currentTasks - wipLimit);
  }

  private async calculateRecentWaitTimeTrend(Promise<number | null> {
    if (!this.dbProvider) return null;

    try {
      const recentResult = await this.dbProvider.query(
        'SELECT AVG(wait_time_ms) as avg_wait FROM approval_queue_history WHERE state = ? AND queued_at > datetime("now", "-1 day")',
        [state]
      );

      const previousResult = await this.dbProvider.query(
        'SELECT AVG(wait_time_ms) as avg_wait FROM approval_queue_history WHERE state = ? AND queued_at BETWEEN datetime("now", "-2 days") AND datetime("now", "-1 day")',
        [state]
      );

      const recentAvg = recentResult.rows[0]?.avg_wait;
      const previousAvg = previousResult.rows[0]?.avg_wait;

      if (recentAvg && previousAvg && previousAvg > 0) {
        return recentAvg / previousAvg;
      }
      return null;
    } catch (error) {
      this.logger.error('Error calculating wait time trend', { state, error });
      return null;
    }
  }

  // Duplicate analyzeBottleneckPatterns method removed - kept the most complete implementation

  private async resumeSystem(Promise<void> {
    try {
      // Restart task processing queues
      await this.reinitializeTaskProcessingQueues();

      // Reconnect to external services
      await this.reconnectToExternalServices();

      this.isHalted = false;
      this.emit('systemResumed', { timestamp: new Date() });
    } catch (error) {
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
  private async persistBottleneckAnalysis(Promise<void> {
    if (this.dbProvider) {
      try {
        for (const [state, usage] of Object.entries(status.wipUsage)) {
          await this.dbProvider.execute(
            'INSERT INTO task_flow_metrics (state, task_count, wip_utilization, bottleneck_score) VALUES (?, ?, ?, ?)',
            [
              state,
              usage.current,
              usage.utilization,
              usage.utilization > 0.9 ? 1.0 : 0.0,
            ]
          );
        }

        const enhancedBottlenecks = await this.analyzeBottleneckPatterns(
          status.bottlenecks
        );

        for (const bottleneck of enhancedBottlenecks) {
          // Record bottleneck event in database
          await this.recordBottleneckEvent(bottleneck);
        }
      } catch (error) {
        this.logger.error('Error persisting bottleneck analysis', { error });
      }
    }
  }

  // Second duplicate analyzeBottleneckPatterns method removed

  /**
   * Record bottleneck event
   */
  private async recordBottleneckEvent(Promise<void> {
    try {
      // Generate intelligent recommendations based on historical data
      const recommendations = await this.generateBottleneckRecommendations(
        bottleneck.state
      );

      this.emit('bottleneckDetected', {
        state: bottleneck.state,
        utilization: bottleneck.utilization,
        severity: bottleneck.severity,
        historicalFrequency: bottleneck.historicalFrequency,
        recommendations,
        timestamp: Date.now(),
      });

      this.logger.warn('Bottleneck detected with enhanced analysis', {
        state: bottleneck.state,
        utilization: bottleneck.utilization,
        severity: bottleneck.severity,
        recommendations: recommendations.slice(0, 3), // Log top 3 recommendations
      });
    } catch (error) {
      this.logger.error('Error recording bottleneck event', {
        error,
        bottleneck,
      });
    }
  }

  /**
   * Generate bottleneck recommendations
   */
  private async generateBottleneckRecommendations(Promise<string[]> {
    // Implementation for generating recommendations

    // Simulate async recommendation generation
    await new Promise((resolve) => setTimeout(resolve, 50));

    return [
      "Consider increasing WIP limit for ${state}""Add more resources to ${state} processing""Review process efficiency for ${state}","
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
  private async analyzeBottleneckPatterns(Promise<BottleneckAnalysis[]> {
    const enhancedBottlenecks: BottleneckAnalysis[] = [];

    for (const state of bottlenecks) {
      const utilization =
        this.kanban.getStateTaskCount(state) / this.config.wipLimits[state];

      // Calculate historical frequency from database
      let historicalFrequency = 0.5; // Default
      if (this.dbProvider) {
        try {
          const result = await this.dbProvider.query(
            'SELECT COUNT(*) as bottleneck_count, (SELECT COUNT(*) FROM task_flow_metrics WHERE state = ?) as total_measurements FROM task_flow_metrics WHERE state = ? AND bottleneck_score > 0.5 AND timestamp > datetime("now", "-30 days")',
            [state, state]
          );

          const row = result.rows[0];
          if (row && row.total_measurements > 0) {
            historicalFrequency = row.bottleneck_count / row.total_measurements;
          }
        } catch (error) {
          this.logger.error(
            'Error calculating historical bottleneck frequency',
            " + JSON.stringify({ error, state }) + "
          );
        }
      }

      // Determine severity based on utilization and historical frequency
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (utilization > 0.95 || historicalFrequency > 0.8)
        severity = 'critical';
      else if (utilization > 0.9 || historicalFrequency > 0.6)
        severity = 'high';
      else if (utilization > 0.85 || historicalFrequency > 0.4)
        severity = 'medium';

      enhancedBottlenecks.push({
        state,
        severity,
        impact: utilization,
        recommendations: [
          "Historical bottleneck frequency: ${historicalFrequency.toFixed(2)}","
        ],
        timestamp: new Date(),
      });
    }
    return enhancedBottlenecks;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new Task Flow Controller with the specified configuration
 */
export function createTaskFlowController(
  config: TaskFlowConfig
): TaskFlowController {
  return new TaskFlowController(config);
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { TaskFlowState, TaskFlowGate, TaskFlowConfig, TaskFlowStatus };
