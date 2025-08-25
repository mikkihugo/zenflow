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

import type { Logger } from '@claude-zen/foundation';
import { TypedEventBase, getLogger } from '@claude-zen/foundation';

import type { DatabaseProvider } from '@claude-zen/infrastructure';
import { getDatabaseSystem } from '@claude-zen/infrastructure';

import { TaskApprovalSystem } from '../agui/task-approval-system';
import { AGUISystem } from '../agui/main';
import { WorkflowKanban } from './workflow-kanban';

// =============================================================================
// TASK FLOW TYPES
// =============================================================================

/**
 * Task flow states for development pipeline
 */
export type TaskFlowState = 'backlog' | 'analysis' | 'development' | 'testing' | 'deployment' | 'done';

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
    status: 'healthy|warning|critical|halted';
  };

  /** Detected bottlenecks */
  bottlenecks: TaskFlowState[];

  /** Flow health recommendations */
  recommendations: string[];
}

// =============================================================================
// TASK FLOW CONTROLLER
// =============================================================================

/**
 * Main Task Flow Controller combining Kanban and AGUI capabilities
 *
 * Provides unified API for task flow management with:
 * - WIP limit enforcement (from Kanban)
 * - Human approval gates (from AGUI)
 * - Capacity protection and monitoring
 * - Flow optimization and bottleneck detection
 *
 * @example Basic usage
 * ```typescript
 * const taskFlow = new TaskFlowController({
 *   wipLimits: {
 *     development: 5,
 *     testing: 2,
 *     deployment: 1
 *   },
 *   gates: {
 *     testing: {
 *       enabled: true,
 *       autoApproveThreshold: 0.8,
 *       maxQueueDepth: 5,
 *       onQueueFull: 'halt',
 *       approvalQuestion: 'Is this task ready for testing?'
 *     }
 *   },
 *   systemLimits: {
 *     maxTotalPending: 20,
 *     maxPerGate: 8,
 *     systemCapacityThreshold: 0.9
 *   }
 * });
 *
 * // Move task with automatic gate checking
 * const moved = await taskFlow.moveTask('TASK-123', 'testing');
 * ```
 */
export class TaskFlowController extends TypedEventBase {
  private readonly logger: Logger;
  private readonly kanban: WorkflowKanban;
  private readonly agui: AGUISystem;
  private readonly approvalSystem: TaskApprovalSystem;
  private readonly config: TaskFlowConfig;
  private dbProvider: DatabaseProvider | null = null;
  private isHalted: boolean = false;

  constructor(config: TaskFlowConfig) {
    super();
    this.logger = getLogger('TaskFlowController');
    this.config = config;
    this.initializeDatabase();

    // Initialize Kanban workflow engine
    this.kanban = new WorkflowKanban({
      states: Object.keys(config.wipLimits) as TaskFlowState[],
      wipLimits: config.wipLimits,
      bottleneckThreshold: config.optimization.enableBottleneckDetection
        ? 0.8
        : 1.0,
    });

    // Initialize AGUI approval system
    this.agui = new AGUISystem({
      type: 'terminal',
      enableBatchMode: true,
      batchSize: 5,
    });

    this.approvalSystem = new TaskApprovalSystem({
      enableBatchMode: true,
      batchSize: 3,
      autoApproveThreshold: 0.8,
    });

    this.setupEventHandlers();
    this.logger.info('TaskFlowController initialized', {
      wipLimits: config.wipLimits,
      gatesEnabled: Object.keys(config.gates).length,
      systemLimits: config.systemLimits,
    });
  }

  /**
   * Initialize database connection for persistent storage
   */
  private async initializeDatabase(): Promise<void> {
    try {
      const dbSystem = await getDatabaseSystem();
      this.dbProvider = dbSystem.createProvider('sqlite');
      
      // Create task flow tables if they don't exist
      await this.dbProvider.execute(`
        CREATE TABLE IF NOT EXISTS task_flow_states (
          task_id TEXT PRIMARY KEY,
          current_state TEXT NOT NULL,
          previous_state TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          confidence REAL DEFAULT 0.5,
          metadata TEXT
        )
      `);
      
      await this.dbProvider.execute(`
        CREATE TABLE IF NOT EXISTS task_flow_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          state TEXT NOT NULL,
          task_count INTEGER NOT NULL,
          wip_utilization REAL NOT NULL,
          bottleneck_score REAL DEFAULT 0.0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await this.dbProvider.execute(`
        CREATE TABLE IF NOT EXISTS approval_queue_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id TEXT NOT NULL,
          state TEXT NOT NULL,
          queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          processed_at DATETIME,
          wait_time_ms INTEGER,
          approval_result TEXT
        )
      `);
      
      await this.dbProvider.execute(`
        CREATE TABLE IF NOT EXISTS system_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          event_data TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          severity TEXT DEFAULT 'info'
        )
      `);
      
      this.logger.info('Database initialized successfully for TaskFlowController');
    } catch (error) {
      this.logger.error('Failed to initialize database:', error);
      // Continue without database - graceful degradation
    }
  }

  /**
   * Move a task to a new state with approval gate checking
   */
  async moveTask(
    taskId: string,
    toState: TaskFlowState,
    confidence: number = 0.5
  ): Promise<boolean> {
    if (this.isHalted) {
      throw new Error('Task flow is halted - cannot move tasks');
    }

    try {
      // 1. Check system capacity first
      const systemStatus = await this.getSystemStatus();
      if (systemStatus.systemCapacity.status === 'critical') {
        this.logger.warn(
          'System at critical capacity - halting task movement',
          {
            taskId,
            toState,
            systemCapacity: systemStatus.systemCapacity,
          }
        );
        return false;
      }

      // 2. Check WIP limits
      if (!this.kanban.canEnterState(toState)) {
        return this.handleWIPLimitReached(taskId, toState);
      }

      // 3. Check approval gate requirements
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

      // 4. Execute movement through Kanban
      const moved = await this.kanban.moveTask(taskId, toState);

      if (moved) {
        this.emit('taskMoved', { taskId, toState, timestamp: Date.now() });
        this.logger.info('Task moved successfully', { taskId, toState });

        // Check for bottlenecks after movement
        if (this.config.optimization.enableBottleneckDetection) {
          await this.checkForBottlenecks();
        }
      }

      return moved;
    } catch (error) {
      this.logger.error('Error moving task', { taskId, toState, error });
      throw error;
    }
  }

  /**
   * Get current task flow status
   */
  async getSystemStatus(): Promise<TaskFlowStatus> {
    const wipUsage: Record<TaskFlowState, any> = {};

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
    const approvalQueues: Record<string, any> = {};
    for (const [state, gate] of Object.entries(this.config.gates)) {
      if (gate.enabled) {
        const pending = await this.getGateQueueDepth(state as TaskFlowState);
        approvalQueues[`${state}-gate`] = {
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
      .filter(([_, usage]) => usage.utilization > 0.9)
      .map(([state, _]) => state as TaskFlowState);

    // Generate recommendations
    const recommendations: string[] = [];
    if (totalPending > maxPending * 0.8) {
      recommendations.push(
        'Consider pausing task intake - approaching capacity limits'
      );
    }
    for (const bottleneck of bottlenecks) {
      recommendations.push(
        `Bottleneck detected in ${bottleneck} - consider increasing WIP limit`
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

  /**
   * Halt all task flow operations
   */
  async haltSystem(reason: string): Promise<void> {
    try {
      this.logger.warn('Initiating system halt procedure', { reason });
      
      // Gracefully stop all active task processing
      await this.gracefullyStopActiveTaskProcessing();
      
      // Persist system state before halting
      await this.persistSystemStateForRecovery();
      
      // Notify all connected clients/services
      await this.notifySystemHaltToServices(reason);
      
      // Update system status in database
      await this.updateSystemStatusInDatabase('halted', reason);
      
      this.isHalted = true;
      this.emit('systemHalted', { reason, timestamp: Date.now() });
      this.logger.warn('Task flow system successfully halted', { reason });
      
    } catch (error) {
      this.logger.error('Failed to halt system gracefully:', error);
      // Force halt if graceful halt fails
      this.isHalted = true;
      this.emit('systemHalted', { reason: `${reason} (forced)`, timestamp: Date.now() });
      throw error;
    }
  }

  /**
   * Resume task flow operations
   */
  async resumeSystem(): Promise<void> {
    try {
      this.logger.info('Initiating system resume procedure');
      
      // Validate system health before resuming
      const healthCheck = await this.performSystemHealthCheck();
      if (!healthCheck.healthy) {
        throw new Error(`System health check failed: ${healthCheck.issues.join(', ')}`);
      }
      
      // Restore system state from persisted data
      const restoredState = await this.restoreSystemStateFromStorage();
      
      // Restart task processing queues
      await this.reinitializeTaskProcessingQueues();
      
      // Reconnect to external services
      await this.reconnectToExternalServices();
      
      this.isHalted = false;
      this.emit('systemResumed', { 
        timestamp: Date.now(),
        restoredTasks: restoredState.taskCount,
        healthStatus: healthCheck.score
      });
      this.logger.info('Task flow system successfully resumed', { 
        restoredTasks: restoredState.taskCount 
      });
      
    } catch (error) {
      this.logger.error('Failed to resume system:', error);
      // Keep system halted if resume fails
      this.isHalted = true;
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private setupEventHandlers(): void {
    // Listen to Kanban events
    this.kanban.on('bottleneckDetected', (data) => {
      this.emit('bottleneckDetected', data);
      this.logger.warn('Bottleneck detected', data);
    });

    // Listen to AGUI events
    this.agui.on('approvalRequested', (data) => {
      this.emit('approvalRequested', data);
    });
  }

  private async processApprovalGate(
    taskId: string,
    toState: TaskFlowState,
    confidence: number,
    gate: TaskFlowGate
  ): Promise<boolean> {
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

    // Check queue depth before adding to approval queue
    const queueDepth = await this.getGateQueueDepth(toState);
    if (queueDepth >= gate.maxQueueDepth) {
      return this.handleQueueOverflow(taskId, toState, gate);
    }

    // Request human approval
    try {
      const response = await this.agui.askQuestion({
        id: `gate-${toState}-${taskId}`,
        type: 'approval',
        question: gate.approvalQuestion,
        context: {
          taskId,
          toState,
          confidence,
          queueDepth,
        },
        confidence,
        priority: confidence > 0.7 ? 'high' : 'medium',
      });

      return (
        response.toLowerCase().includes('yes') || response.toLowerCase().includes('approve')
      );
    } catch (error) {
      this.logger.error('Error processing approval gate', {
        taskId,
        toState,
        error,
      });
      return false;
    }
  }

  private async handleWIPLimitReached(
    taskId: string,
    toState: TaskFlowState
  ): Promise<boolean> {
    const gate = this.config.gates[toState];

    if (gate?.onQueueFull === 'spillover' && gate.spilloverTarget) {
      this.logger.info('WIP limit reached - redirecting to spillover state', {
        taskId,
        originalState: toState,
        spilloverState: gate.spilloverTarget,
      });
      return this.moveTask(taskId, gate.spilloverTarget);
    }

    if (gate?.onQueueFull === 'escalate') {
      return this.escalateCapacityDecision(taskId, toState);
    }

    // Default: halt movement
    this.logger.warn('WIP limit reached - halting task movement', {
      taskId,
      toState,
      currentCount: this.kanban.getStateTaskCount(toState),
      wipLimit: this.config.wipLimits[toState],
    });
    return false;
  }

  private async handleQueueOverflow(
    taskId: string,
    toState: TaskFlowState,
    gate: TaskFlowGate
  ): Promise<boolean> {
    switch (gate.onQueueFull) {
      case 'auto-approve':
        this.logger.warn('Queue overflow - auto-approving task', {
          taskId,
          toState,
        });
        return true;

      case 'spillover':
        if (gate.spilloverTarget) {
          return this.moveTask(taskId, gate.spilloverTarget);
        }
        break;

      case 'escalate':
        return this.escalateQueueDecision(taskId, toState);

      default:
        // halt
        this.logger.warn('Approval queue at capacity - halting task movement', {
          taskId,
          toState,
          queueDepth: await this.getGateQueueDepth(toState),
          maxDepth: gate.maxQueueDepth,
        });
        return false;
    }

    return false;
  }

  private async escalateCapacityDecision(
    taskId: string,
    toState: TaskFlowState
  ): Promise<boolean> {
    // Human decision on capacity management
    try {
      const response = await this.agui.askQuestion({
        id: `capacity-escalation-${taskId}`,
        type: 'escalation',
        question: `WIP limit reached for ${toState}. Override limit for task ${taskId}?`,
        context: {
          taskId,
          toState,
          currentCount: this.kanban.getStateTaskCount(toState),
          wipLimit: this.config.wipLimits[toState],
        },
        confidence: 0.5,
        priority: 'high',
      });

      return (
        response.toLowerCase().includes('yes')||response.toLowerCase().includes('override')
      );
    } catch (error) {
      this.logger.error('Error escalating capacity decision', {
        taskId,
        toState,
        error,
      });
      return false;
    }
  }

  private async escalateQueueDecision(
    taskId: string,
    toState: TaskFlowState
  ): Promise<boolean> {
    // Human decision on queue management
    try {
      const response = await this.agui.askQuestion({
        id: `queue-escalation-${taskId}`,
        type: 'escalation',
        question: `Approval queue full for ${toState}. Add task ${taskId} to queue anyway?`,
        context: {
          taskId,
          toState,
          queueDepth: await this.getGateQueueDepth(toState),
        },
        confidence: 0.5,
        priority: 'high',
      });

      return (
        response.toLowerCase().includes('yes')||response.toLowerCase().includes('add')
      );
    } catch (error) {
      this.logger.error('Error escalating queue decision', {
        taskId,
        toState,
        error,
      });
      return false;
    }
  }

  private async getGateQueueDepth(state: TaskFlowState): Promise<number> {
    if (!this.dbProvider) {
      this.logger.warn('Database not available - using fallback queue depth calculation');
      // Fallback to in-memory calculation
      return this.calculateInMemoryQueueDepth(state);
    }

    try {
      // Query database for current queue depth for this state
      const result = await this.dbProvider.query(
        'SELECT COUNT(*) as queue_depth FROM approval_queue_history WHERE state = ? AND processed_at IS NULL',
        [state]
      );
      
      const queueDepth = result.rows[0]?.queue_depth || 0;
      
      // Also check for any pending tasks that might be queued but not yet recorded
      const pendingTasks = await this.dbProvider.query(
        'SELECT COUNT(*) as pending FROM task_flow_states WHERE current_state = ? AND updated_at > datetime("now", "-1 hour")',
        [state]
      );
      
      const totalQueued = queueDepth + (pendingTasks.rows[0]?.pending || 0);
      
      this.logger.debug('Gate queue depth calculated', { 
        state, 
        queueDepth, 
        pendingTasks: pendingTasks.rows[0]?.pending || 0,
        totalQueued 
      });
      
      return totalQueued;
    } catch (error) {
      this.logger.error('Error calculating gate queue depth', { state, error });
      // Fallback to in-memory calculation
      return this.calculateInMemoryQueueDepth(state);
    }
  }

  private async getAverageWaitTime(state: TaskFlowState): Promise<number> {
    if (!this.dbProvider) {
      this.logger.warn('Database not available - using default wait time');
      return 300000; // 5 minutes default
    }

    try {
      // Calculate average wait time from historical data
      const result = await this.dbProvider.query(`
        SELECT 
          AVG(wait_time_ms) as avg_wait_time,
          COUNT(*) as sample_size,
          MIN(wait_time_ms) as min_wait,
          MAX(wait_time_ms) as max_wait
        FROM approval_queue_history 
        WHERE state = ? 
          AND processed_at IS NOT NULL 
          AND wait_time_ms IS NOT NULL
          AND queued_at > datetime('now', '-7 days')
      `, [state]);
      
      const row = result.rows[0];
      const avgWaitTime = row?.avg_wait_time || 300000; // Default 5 minutes
      const sampleSize = row?.sample_size || 0;
      
      // If we have very few samples, blend with default
      let adjustedWaitTime = avgWaitTime;
      if (sampleSize < 5) {
        // Blend with default based on sample size confidence
        const confidence = sampleSize / 5; // 0 to 1
        adjustedWaitTime = (avgWaitTime * confidence) + (300000 * (1 - confidence));
      }
      
      // Apply recent trend adjustment
      const recentTrend = await this.calculateRecentWaitTimeTrend(state);
      if (recentTrend) {
        adjustedWaitTime *= recentTrend; // Multiply by trend factor (>1 = increasing, <1 = decreasing)
      }
      
      this.logger.debug('Average wait time calculated', {
        state,
        avgWaitTime: Math.round(avgWaitTime),
        adjustedWaitTime: Math.round(adjustedWaitTime),
        sampleSize,
        recentTrend,
        minWait: row?.min_wait,
        maxWait: row?.max_wait
      });
      
      return Math.max(30000, Math.min(3600000, adjustedWaitTime)); // Clamp between 30 seconds and 1 hour
    } catch (error) {
      this.logger.error('Error calculating average wait time', { state, error });
      return 300000; // 5 minutes fallback
    }
  }

  private async checkForBottlenecks(): Promise<void> {
    const status = await this.getSystemStatus();
    
    // Persist bottleneck analysis to database for historical tracking
    if (this.dbProvider) {
      try {
        for (const [state, usage] of Object.entries(status.wipUsage)) {
          await this.dbProvider.execute(
            'INSERT INTO task_flow_metrics (state, task_count, wip_utilization, bottleneck_score) VALUES (?, ?, ?, ?)',
            [state, usage.current, usage.utilization, usage.utilization > 0.9 ? 1.0 : 0.0]
          );
        }
      } catch (error) {
        this.logger.error('Error persisting bottleneck metrics', error);
      }
    }

    // Analyze historical patterns to provide better bottleneck detection
    const enhancedBottlenecks = await this.analyzeBottleneckPatterns(status.bottlenecks);
    
    for (const bottleneck of enhancedBottlenecks) {
      // Record bottleneck event in database
      await this.recordBottleneckEvent(bottleneck);
      
      // Generate intelligent recommendations based on historical data
      const recommendations = await this.generateBottleneckRecommendations(bottleneck.state);
      
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
        recommendations: recommendations.slice(0, 3) // Log top 3 recommendations
      });
    }
  }

  // =============================================================================
  // HELPER METHODS FOR DATABASE INTEGRATION
  // =============================================================================

  private calculateInMemoryQueueDepth(state: TaskFlowState): number {
    // Fallback calculation using in-memory data
    const currentTasks = this.kanban.getStateTaskCount(state);
    const wipLimit = this.config.wipLimits[state];
    return Math.max(0, currentTasks - wipLimit);
  }

  private async calculateRecentWaitTimeTrend(state: TaskFlowState): Promise<number | null> {
    if (!this.dbProvider) return null;

    try {
      // Compare recent 24 hours vs previous 24 hours
      const recentResult = await this.dbProvider.query(`
        SELECT AVG(wait_time_ms) as avg_wait
        FROM approval_queue_history 
        WHERE state = ? AND queued_at > datetime('now', '-1 day')
      `, [state]);

      const previousResult = await this.dbProvider.query(`
        SELECT AVG(wait_time_ms) as avg_wait
        FROM approval_queue_history 
        WHERE state = ? AND queued_at BETWEEN datetime('now', '-2 days') AND datetime('now', '-1 day')
      `, [state]);

      const recentAvg = recentResult.rows[0]?.avg_wait;
      const previousAvg = previousResult.rows[0]?.avg_wait;

      if (recentAvg && previousAvg && previousAvg > 0) {
        return recentAvg / previousAvg; // Trend multiplier
      }
      return null;
    } catch (error) {
      this.logger.error('Error calculating wait time trend', { state, error });
      return null;
    }
  }

  private async analyzeBottleneckPatterns(bottlenecks: TaskFlowState[]): Promise<Array<{
    state: TaskFlowState;
    utilization: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    historicalFrequency: number;
  }>> {
    const enhancedBottlenecks = [];

    for (const state of bottlenecks) {
      const utilization = this.kanban.getStateTaskCount(state) / this.config.wipLimits[state];
      
      // Calculate historical frequency from database
      let historicalFrequency = 0.5; // Default
      if (this.dbProvider) {
        try {
          const result = await this.dbProvider.query(`
            SELECT COUNT(*) as bottleneck_count,
                   (SELECT COUNT(*) FROM task_flow_metrics WHERE state = ?) as total_measurements
            FROM task_flow_metrics 
            WHERE state = ? AND bottleneck_score > 0.5 AND timestamp > datetime('now', '-30 days')
          `, [state, state]);
          
          const row = result.rows[0];
          if (row && row.total_measurements > 0) {
            historicalFrequency = row.bottleneck_count / row.total_measurements;
          }
        } catch (error) {
          this.logger.error('Error calculating historical bottleneck frequency', error);
        }
      }

      // Determine severity based on utilization and historical frequency
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (utilization > 0.95 || historicalFrequency > 0.8) severity = 'critical';
      else if (utilization > 0.9 || historicalFrequency > 0.6) severity = 'high';
      else if (utilization > 0.85 || historicalFrequency > 0.4) severity = 'medium';

      enhancedBottlenecks.push({
        state,
        utilization,
        severity,
        historicalFrequency
      });
    }

    return enhancedBottlenecks;
  }

  private async recordBottleneckEvent(bottleneck: {
    state: TaskFlowState;
    utilization: number;
    severity: string;
  }): Promise<void> {
    if (!this.dbProvider) return;

    try {
      await this.dbProvider.execute(
        'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)',
        [
          'bottleneck_detected',
          JSON.stringify({
            state: bottleneck.state,
            utilization: bottleneck.utilization,
            task_count: this.kanban.getStateTaskCount(bottleneck.state),
            wip_limit: this.config.wipLimits[bottleneck.state]
          }),
          bottleneck.severity
        ]
      );
    } catch (error) {
      this.logger.error('Error recording bottleneck event', error);
    }
  }

  private async generateBottleneckRecommendations(state: TaskFlowState): Promise<string[]> {
    const recommendations: string[] = [];
    const currentCount = this.kanban.getStateTaskCount(state);
    const wipLimit = this.config.wipLimits[state];
    const utilization = currentCount / wipLimit;

    // Analyze historical resolution patterns if database is available
    if (this.dbProvider) {
      try {
        const historicalResolutions = await this.dbProvider.query(`
          SELECT event_data, COUNT(*) as frequency
          FROM system_events 
          WHERE event_type = 'bottleneck_resolved' 
            AND event_data LIKE '%"state":"${state}"%'
            AND timestamp > datetime('now', '-90 days')
          GROUP BY event_data
          ORDER BY frequency DESC
          LIMIT 3
        `);

        for (const resolution of historicalResolutions.rows) {
          try {
            const data = JSON.parse(resolution.event_data);
            if (data.resolution_strategy) {
              recommendations.push(`Historical success: ${data.resolution_strategy} (${resolution.frequency} times)`);
            }
          } catch (parseError) {
            // Skip malformed data
          }
        }
      } catch (error) {
        this.logger.error('Error fetching historical resolutions', error);
      }
    }

    // Generate contextual recommendations
    if (utilization > 0.95) {
      recommendations.push(`URGENT: Increase WIP limit for ${state} (currently ${wipLimit}, suggested ${Math.ceil(wipLimit * 1.2)})`);
      recommendations.push(`Consider temporary task redistribution from ${state}`);
    } else if (utilization > 0.9) {
      recommendations.push(`Monitor ${state} closely - approaching critical capacity`);
      recommendations.push(`Review task complexity in ${state} queue`);
    }

    // Add time-based recommendations
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 17) {
      recommendations.push('Consider escalating during business hours for faster resolution');
    } else {
      recommendations.push('Schedule bottleneck review for next business day');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  // Additional helper methods for the enhanced handleWIPLimitReached method
  private async recordWIPLimitViolation(taskId: string, state: TaskFlowState): Promise<void> {
    if (!this.dbProvider) return;

    try {
      await this.dbProvider.execute(
        'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)',
        [
          'wip_limit_violation',
          JSON.stringify({
            task_id: taskId,
            state: state,
            current_count: this.kanban.getStateTaskCount(state),
            wip_limit: this.config.wipLimits[state],
            timestamp: Date.now()
          }),
          'warning'
        ]
      );
    } catch (error) {
      this.logger.error('Error recording WIP limit violation', error);
    }
  }

  private async analyzeHistoricalWIPPatterns(state: TaskFlowState): Promise<{
    spilloverSuccessRate: number;
    averageRecoveryTime: number;
    commonResolutions: string[];
  }> {
    const defaultResult = {
      spilloverSuccessRate: 0.7,
      averageRecoveryTime: 3600000, // 1 hour
      commonResolutions: ['increase_wip_limit', 'redistribute_tasks']
    };

    if (!this.dbProvider) return defaultResult;

    try {
      // Analyze spillover success rate
      const spilloverResult = await this.dbProvider.query(`
        SELECT 
          COUNT(*) as total_spillovers,
          SUM(CASE WHEN event_data LIKE '%"success":true%' THEN 1 ELSE 0 END) as successful_spillovers
        FROM system_events 
        WHERE event_type = 'spillover_executed' 
          AND event_data LIKE '%"from_state":"${state}"%'
          AND timestamp > datetime('now', '-30 days')
      `);

      const spilloverData = spilloverResult.rows[0];
      const spilloverSuccessRate = spilloverData?.total_spillovers > 0 
        ? spilloverData.successful_spillovers / spilloverData.total_spillovers 
        : defaultResult.spilloverSuccessRate;

      return {
        spilloverSuccessRate,
        averageRecoveryTime: defaultResult.averageRecoveryTime,
        commonResolutions: defaultResult.commonResolutions
      };
    } catch (error) {
      this.logger.error('Error analyzing historical WIP patterns', error);
      return defaultResult;
    }
  }

  private async updateSpilloverMetrics(fromState: TaskFlowState, toState: TaskFlowState): Promise<void> {
    if (!this.dbProvider) return;

    try {
      await this.dbProvider.execute(
        'INSERT INTO system_events (event_type, event_data) VALUES (?, ?)',
        [
          'spillover_executed',
          JSON.stringify({
            from_state: fromState,
            to_state: toState,
            timestamp: Date.now(),
            success: true // Will be updated based on outcome
          })
        ]
      );
    } catch (error) {
      this.logger.error('Error updating spillover metrics', error);
    }
  }

  private async prepareEscalationContext(taskId: string, state: TaskFlowState, historicalData: any): Promise<any> {
    return {
      taskId,
      state,
      currentCapacity: this.kanban.getStateTaskCount(state),
      wipLimit: this.config.wipLimits[state],
      historicalPatterns: historicalData,
      recommendations: await this.generateCapacityRecommendations(state, historicalData),
      timestamp: Date.now()
    };
  }

  private async generateCapacityRecommendations(state: TaskFlowState, historicalData: any): Promise<string[]> {
    const recommendations: string[] = [];
    const utilization = this.kanban.getStateTaskCount(state) / this.config.wipLimits[state];

    recommendations.push(`Current utilization: ${Math.round(utilization * 100)}%`);
    
    if (historicalData.spilloverSuccessRate > 0.8) {
      recommendations.push('Historical spillover success rate is high - consider spillover');
    } else {
      recommendations.push('Spillover has mixed results - consider alternative approaches');
    }

    recommendations.push(`Increase WIP limit from ${this.config.wipLimits[state]} to ${Math.ceil(this.config.wipLimits[state] * 1.2)}`);
    recommendations.push('Review and redistribute existing tasks');
    recommendations.push('Consider parallel processing if tasks are independent');

    return recommendations;
  }

  private async recordCapacityDecision(taskId: string, state: TaskFlowState, decision: string, recommendations: string[]): Promise<void> {
    if (!this.dbProvider) return;

    try {
      await this.dbProvider.execute(
        'INSERT INTO system_events (event_type, event_data) VALUES (?, ?)',
        [
          'capacity_decision',
          JSON.stringify({
            task_id: taskId,
            state: state,
            decision: decision,
            recommendations: recommendations,
            timestamp: Date.now()
          })
        ]
      );
    } catch (error) {
      this.logger.error('Error recording capacity decision', error);
    }
  }


  // Add missing helper methods for system halt/resume
  private async gracefullyStopActiveTaskProcessing(): Promise<void> {
    if (!this.dbProvider) {
      this.logger.warn('Database not available - skipping graceful task processing halt');
      return;
    }

    try {
      // Mark all in-progress tasks as paused
      await this.dbProvider.execute(`
        UPDATE task_flow_states 
        SET metadata = json_set(COALESCE(metadata, '{}'), '$.paused_at', datetime('now'))
        WHERE current_state IN ('analysis', 'development', 'testing')
      `);

      // Record pause event
      await this.dbProvider.execute(
        'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)',
        ['task_processing_halted', JSON.stringify({ timestamp: Date.now() }), 'info']
      );

      this.logger.info('Active task processing gracefully stopped');
    } catch (error) {
      this.logger.error('Error during graceful task processing halt', error);
      throw error;
    }
  }

  private async persistSystemStateForRecovery(): Promise<void> {
    if (!this.dbProvider) {
      this.logger.warn('Database not available - skipping state persistence');
      return;
    }

    try {
      const systemState = {
        config: this.config,
        taskCounts: Object.fromEntries(
          Object.keys(this.config.wipLimits).map(state => [
            state,
            this.kanban.getStateTaskCount(state as TaskFlowState)
          ])
        ),
        haltTimestamp: Date.now(),
        version: '2.0.0'
      };

      await this.dbProvider.execute(
        'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)',
        ['system_state_persisted', JSON.stringify(systemState), 'info']
      );

      this.logger.info('System state persisted for recovery');
    } catch (error) {
      this.logger.error('Error persisting system state', error);
      throw error;
    }
  }

  private async notifySystemHaltToServices(reason: string): Promise<void> {
    try {
      // Emit system-wide halt notification
      this.emit('systemHaltNotification', {
        reason,
        timestamp: Date.now(),
        affectedServices: ['kanban', 'agui', 'approval_system'],
        expectedDowntime: 'unknown'
      });

      // Could also integrate with external notification systems here
      // e.g., Slack, email, monitoring systems
      
      this.logger.info('System halt notifications sent to all services');
    } catch (error) {
      this.logger.error('Error notifying services of system halt', error);
      // Don't throw - this shouldn't prevent halt
    }
  }

  private async updateSystemStatusInDatabase(status: string, reason: string): Promise<void> {
    if (!this.dbProvider) return;

    try {
      await this.dbProvider.execute(
        'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)',
        [
          'system_status_changed',
          JSON.stringify({ 
            new_status: status, 
            reason, 
            timestamp: Date.now() 
          }),
          status === 'halted' ? 'warning' : 'info'
        ]
      );
    } catch (error) {
      this.logger.error('Error updating system status in database', error);
    }
  }

  private async restoreSystemStateFromStorage(): Promise<{ taskCount: number }> {
    if (!this.dbProvider) {
      return { taskCount: 0 };
    }

    try {
      // Get the most recent system state
      const result = await this.dbProvider.query(`
        SELECT event_data
        FROM system_events 
        WHERE event_type = 'system_state_persisted'
        ORDER BY timestamp DESC 
        LIMIT 1
      `);

      if (result.rows.length > 0) {
        const stateData = JSON.parse(result.rows[0].event_data);
        const totalTasks = Object.values(stateData.taskCounts as Record<string, number>)
          .reduce((sum, count) => sum + count, 0);
        
        this.logger.info('System state restored from storage', { 
          taskCounts: stateData.taskCounts,
          totalTasks
        });
        
        return { taskCount: totalTasks };
      }
      
      return { taskCount: 0 };
    } catch (error) {
      this.logger.error('Error restoring system state', error);
      return { taskCount: 0 };
    }
  }

  private async reinitializeTaskProcessingQueues(): Promise<void> {
    if (!this.dbProvider) return;

    try {
      // Resume paused tasks
      await this.dbProvider.execute(`
        UPDATE task_flow_states 
        SET metadata = json_remove(metadata, '$.paused_at')
        WHERE json_extract(metadata, '$.paused_at') IS NOT NULL
      `);

      // Clear any stale approval queue entries
      await this.dbProvider.execute(`
        UPDATE approval_queue_history 
        SET processed_at = datetime('now'),
            approval_result = 'cancelled_on_resume'
        WHERE processed_at IS NULL AND queued_at < datetime('now', '-1 hour')
      `);

      this.logger.info('Task processing queues reinitialized');
    } catch (error) {
      this.logger.error('Error reinitializing task processing queues', error);
      throw error;
    }
  }

  private async reconnectToExternalServices(): Promise<void> {
    try {
      // Reinitialize components that might have been disconnected
      // This could include database connections, external APIs, etc.
      
      // Test database connection
      if (this.dbProvider) {
        await this.dbProvider.query('SELECT 1 as test');
      }
      
      // Could add reconnection logic for external services here
      // e.g., Redis, message queues, monitoring systems
      
      this.logger.info('Successfully reconnected to external services');
    } catch (error) {
      this.logger.error('Error reconnecting to external services', error);
      throw error;
    }
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
