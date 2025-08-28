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
import { getLogger } from '@claude-zen/foundation';
import { EventEmitter } from 'events';

// EventBus for event emissions
class EventBus extends EventEmitter {
  emit(event: string, data: any): boolean {
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
    status: 'healthy' | 'warning' | 'critical' | 'halted';
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
 * Provides unified API for task flow management with: new TaskFlowController({
 *   wipLimits: 'Is this task ready for testing?';
 *     }
 *   },
 *   systemLimits: await taskFlow.moveTask('TASK-123','testing);
 * `;
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
      type: "approval",
    });
    this.approvalSystem = new TaskApprovalSystem({
      enableBatchMode: true
    });
    
    this.initializeDatabase();
    this.setupEventHandlers();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const dbSystem = await DatabaseProvider.create();
      this.dbProvider = dbSystem.createProvider('sqlite');
      
      // Create task flow tables if they dont exist
      await this.dbProvider.execute(`CREATE TABLE IF NOT EXISTS task_flow_states (
          task_id TEXT PRIMARY KEY,
          current_state TEXT NOT NULL,
          previous_state TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          confidence REAL DEFAULT 0.5,
          metadata TEXT
        )`);
      
      await this.dbProvider.execute(`CREATE TABLE IF NOT EXISTS task_flow_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          state TEXT NOT NULL,
          task_count INTEGER NOT NULL,
          wip_utilization REAL NOT NULL,
          bottleneck_score REAL DEFAULT 0.0,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
      
      await this.dbProvider.execute(`CREATE TABLE IF NOT EXISTS approval_queue_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id TEXT NOT NULL,
          state TEXT NOT NULL,
          queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          processed_at DATETIME,
          wait_time_ms INTEGER,
          approval_result TEXT
        )`);
      
      await this.dbProvider.execute(`CREATE TABLE IF NOT EXISTS system_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_type TEXT NOT NULL,
          event_data TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          severity TEXT DEFAULT 'info'
        )`);
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
    // 1. Check system capacity before movement
    const systemStatus = await this.getSystemStatus();
    if (systemStatus.systemCapacity.status === 'critical') {
      this.logger.warn('System at critical capacity - halting task movement', {
        taskId,
        toState,
        systemCapacity: systemStatus.systemCapacity
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
  
  async getSystemStatus(): Promise<TaskFlowStatus> {
    const wipUsage: Record<TaskFlowState, { current: number; limit: number; utilization: number }> = {} as any;
    const approvalQueues: Record<string, { pending: number; avgWaitTime: number }> = {};
    // Calculate WIP usage for each state
    for (const [state, limit] of Object.entries(this.config.wipLimits)) {
      const current = this.kanban.getStateTaskCount(state as TaskFlowState);
      wipUsage[state as TaskFlowState] = {
        current,
        limit,
        utilization: current / limit
      };
    }

    // Calculate approval queue status
    for (const [state, gate] of Object.entries(this.config.gates)) {
      if (gate && gate.enabled) {
        const pending = await this.getGateQueueDepth(state as TaskFlowState);
        approvalQueues[`${state}-gate`] = {
          pending,
          avgWaitTime: await this.getAverageWaitTime(state as TaskFlowState)
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
      recommendations.push('Consider pausing task intake - approaching capacity limits');
    }
    for (const bottleneck of bottlenecks) {
      recommendations.push(`Bottleneck detected in ${bottleneck} - consider increasing WIP limit`);
    }

    return {
      wipUsage,
      approvalQueues,
      systemCapacity: {
        totalPending,
        maxPending,
        utilizationPercent,
        status
      },
      bottlenecks,
      recommendations
    };
  }

  private async getGateQueueDepth(state: TaskFlowState): Promise<number> {
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

  private async getAverageWaitTime(state: TaskFlowState): Promise<number> {
    if (!this.dbProvider) return 300000; // 5 minutes default
    
    try {
      const result = await this.dbProvider.query(
        'SELECT AVG(wait_time_ms) as avg_wait_time FROM approval_queue_history WHERE state = ? AND processed_at IS NOT NULL AND queued_at > datetime("now", "-7 days")',
        [state]
      );
      return result.rows[0]?.avg_wait_time || 300000;
    } catch (error) {
      this.logger.error('Error calculating average wait time', { state, error });
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
        threshold: gate.autoApproveThreshold
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
        id: `${taskId}-${toState}`,
        question: gate.approvalQuestion,
        metadata: { taskId, toState, confidence }
      });
      return response.approved === true;
    } catch (error) {
      this.logger.error('Error processing approval gate', { taskId, toState, error });
      return false;
    }
  }

  private async handleQueueOverflow(
    taskId: string,
    toState: TaskFlowState,
    gate: TaskFlowGate
  ): Promise<boolean> {
    const gate_cast = gate as TaskFlowGate;
    
    if (gate_cast?.onQueueFull === 'spillover' && gate_cast.spilloverTarget) {
      this.logger.info('WIP limit reached - redirecting to spillover state', {
        taskId,
        originalState: toState,
        spilloverState: gate_cast.spilloverTarget
      });
      return this.moveTask(taskId, gate_cast.spilloverTarget);
    }

    if (gate_cast?.onQueueFull === 'escalate') {
      return this.escalateCapacityDecision(taskId, toState);
    }

    if (gate_cast?.onQueueFull === 'auto-approve') {
      this.logger.info('Auto-approving due to queue overflow', { taskId, toState });
      return true;
    }

    // Default: halt
    this.logger.warn('Halting task due to queue overflow', { taskId, toState });
    return false;
  }

  private async escalateCapacityDecision(taskId: string, toState: TaskFlowState): Promise<boolean> {
    // Placeholder for capacity escalation logic
    this.logger.info('Escalating capacity decision', { taskId, toState });
    return false;
  }

  private calculateInMemoryQueueDepth(state: TaskFlowState): number {
    const currentTasks = this.kanban.getStateTaskCount(state);
    const wipLimit = this.config.wipLimits[state];
    return Math.max(0, currentTasks - wipLimit);
  }

  private async calculateRecentWaitTimeTrend(state: TaskFlowState): Promise<number | null> {
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

  private async analyzeBottleneckPatterns(bottlenecks: TaskFlowState[]): Promise<any[]> {
    const enhancedBottlenecks: any[] = [];
    
    for (const state of bottlenecks) {
      const analysis = {
        state,
        severity: 'medium' as const,
        impact: 0.5,
        recommendations: [`Increase WIP limit for ${state}`, `Review process efficiency`]
      };
      enhancedBottlenecks.push(analysis);
    }
    
    return enhancedBottlenecks;
  }

  private async resumeSystem(): Promise<void> {
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
        threshold: gate.autoApproveThreshold
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
        id: `${taskId}-${toState}`,
        question: gate.approvalQuestion,
        metadata: { taskId, toState, confidence }
      });
      return response.approved === true;
    } catch (error) {
      this.logger.error('Error processing approval gate', { taskId, toState, error });
      return false;
    }
  }
      
      const row = result.rows[0];
      const avgWaitTime = row?.avg_wait_time||300000; // Default 5 minutes
      const sampleSize = row?.sample_size||0;
      
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
      ';
      this.logger.debug('Average wait time calculated', {
        state,
        avgWaitTime: await this.getSystemStatus();
    
    // Persist bottleneck analysis to database for historical tracking
    if (this.dbProvider) {
      try {
        for (const [state, usage] of Object.entries(status.wipUsage)) {
          await this.dbProvider.execute(';
           'INSERT INTO task_flow_metrics (state, task_count, wip_utilization, bottleneck_score) VALUES (?, ?, ?, ?)';
            [state, usage.current, usage.utilization, usage.utilization > 0.9 ? 1.0: await this.analyzeBottleneckPatterns(status.bottlenecks);
    
    for (const bottleneck of enhancedBottlenecks) {
      // Record bottleneck event in database
      await this.recordBottleneckEvent(bottleneck);
      
      // Generate intelligent recommendations based on historical data
      const recommendations = await this.generateBottleneckRecommendations(bottleneck.state);
      ';
      this.emit('bottleneckDetected', {
        state: bottleneck.state,
        utilization: bottleneck.utilization,
        severity: bottleneck.severity,
        historicalFrequency: bottleneck.historicalFrequency,
        recommendations,
        timestamp: Date.now(),
      });
      ';
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

  private calculateInMemoryQueueDepth(state: this.kanban.getStateTaskCount(state);
    const wipLimit = this.config.wipLimits[state];
    return Math.max(0, currentTasks - wipLimit);
  }
  private async calculateRecentWaitTimeTrend(state: await this.dbProvider.query(';
        'SELECT AVG(wait_time_ms) as avg_wait FROM approval_queue_history WHERE state = ? AND queued_at > datetime("now", "-1 day")';
        [state]
      );

      const previousResult = await this.dbProvider.query(';
        'SELECT AVG(wait_time_ms) as avg_wait FROM approval_queue_history WHERE state = ? AND queued_at BETWEEN datetime("now", "-2 days") AND datetime("now", "-1 day")';
        [state]
      );

      const recentAvg = recentResult.rows[0]?.avg_wait;
      const previousAvg = previousResult.rows[0]?.avg_wait;

      if (recentAvg && previousAvg && previousAvg > 0) {
        return recentAvg / previousAvg; // Trend multiplier
      }
      return null;
    } catch (error) {';
      this.logger.error('Error calculating wait time trend', { state, error });
      return null;
    }
  }
  private async analyzeBottleneckPatterns(bottlenecks: [];

    for (const state of bottlenecks) {
      const utilization = this.kanban.getStateTaskCount(state) / this.config.wipLimits[state];
      
      // Calculate historical frequency from database
      let historicalFrequency = 0.5; // Default
      if (this.dbProvider) {
        try {';
          const result = await this.dbProvider.query('SELECT COUNT(*) as bottleneck_count, (SELECT COUNT(*) FROM task_flow_metrics WHERE state = ?) as total_measurements FROM task_flow_metrics WHERE state = ? AND bottleneck_score > 0.5 AND timestamp > datetime("now", "-30 days")', [state, state]);
          
          const row = result.rows[0];
          if (row && row.total_measurements > 0) {
            historicalFrequency = row.bottleneck_count / row.total_measurements;
          }
        } catch (error) {';
          this.logger.error('Error calculating historical bottleneck frequency', error);
        }
      }
      // Determine severity based on utilization and historical frequency';
      let severity: 'low;';
      if (utilization > 0.95 || historicalFrequency > 0.8) severity = 'critical;';
      else if (utilization > 0.9 || historicalFrequency > 0.6) severity = 'high;';
      else if (utilization > 0.85 || historicalFrequency > 0.4) severity  = 'medium;
      enhancedBottlenecks.push({
        state,
        utilization,
        severity,
        historicalFrequency
      });
    }
    return enhancedBottlenecks;
  }
  private async recordBottleneckEvent(bottleneck: [];
    const currentCount = this.kanban.getStateTaskCount(state);
    const wipLimit = this.config.wipLimits[state];
    const utilization = currentCount / wipLimit'; 

    // Analyze historical resolution patterns if database is available
    if (this.dbProvider) {
      try {';
        const statePattern = %"state:`${state}%`;';
        const historicalResolutions = await this.dbProvider.query(SELECT event_data, COUNT(*) as frequency FROM system_events WHERE event_type = ? AND event_data LIKE ? AND timestamp > datetime("now", "-90 days) GROUP BY event_data ORDER BY frequency DESC LIMIT 3`, [`bottleneck_resolved, statePattern]);

        for (const resolution of historicalResolutions.rows) {
          try {
            const data = JSON.parse(resolution.event_data);
            if (data.resolution_strategy) {
              recommendations.push(`Historical success: new Date().getHours();
    if (currentHour >= 9 && currentHour <= 17) {';
      recommendations.push('Consider escalating during business hours for faster resolution');
    } else {';
      recommendations.push('Schedule bottleneck review for next business day');
    }
    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
  // Additional helper methods for the enhanced handleWIPLimitReached method
  private async recordWIPLimitViolation(taskId: {
      spilloverSuccessRate: '%"from_state:`${state}%;
      const spilloverResult = await this.dbProvider.query(';
        'SELECT COUNT(*) as total_spillovers, SUM(CASE WHEN event_data LIKE ? THEN 1 ELSE 0 END) as successful_spillovers FROM system_events WHERE event_type = ? AND event_data LIKE ? AND timestamp > datetime("now", "-30 days")',;';
        ['%"success":true%', 'spillover_executed, fromStatePattern];;
      );

      const spilloverData = spilloverResult.rows[0];
      const spilloverSuccessRate = spilloverData?.total_spillovers > 0 ;
        ? spilloverData.successful_spillovers / spilloverData.total_spillovers: [];
    const utilization = this.kanban.getStateTaskCount(state) / this.config.wipLimits[state];

    recommendations.push(`Current utilization: json_set(COALESCE(metadata,`{};),`${.}paused_at,datetime(``now'));
        WHERE current_state IN ('analysis,'development,'testing');
      ');

      // Record pause event
      await this.dbProvider.execute(';
       'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)',;';
        ['task_processing_halted',JSON.stringify({ timestamp: {
        config: this.config,
        taskCounts: Object.fromEntries(
          Object.keys(this.config.wipLimits).map(state => [
            state,
            this.kanban.getStateTaskCount(state as TaskFlowState)
          ];
        ),
        haltTimestamp: '2.0.0';
      }
      await this.dbProvider.execute(';
       'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)',;';
        ['system_state_persisted',JSON.stringify(systemState),'info'];;
      );
';
      this.logger.info('System state persisted for recovery');
    } catch (error) {';
      this.logger.error('Error persisting system state', error);
      throw error;
    }
  }
  private async notifySystemHaltToServices(reason: 'unknown';
      });

      // Could also integrate with external notification systems here
      // e.g., Slack, email, monitoring systems
      ';
      this.logger.info('System halt notifications sent to all services');
    } catch (error) {';
      this.logger.error('Error notifying services of system halt', error);';
      // Don't throw - this shouldn't prevent halt;
    }
  }
  private async updateSystemStatusInDatabase(status: string, reason: string): Promise<void>  {
    if (!this.dbProvider) return;

    try {
      await this.dbProvider.execute(';
       'INSERT INTO system_events (event_type, event_data, severity) VALUES (?, ?, ?)';
        [';
         'system_status_changed';
          JSON.stringify({ 
            new_status: status, 
            reason, 
            timestamp: Date.now() 
          }),';
          status === 'halted' ? 'warning' : [];
    let score = 1.0;

    try {
      // Check database connectivity
      if (!this.dbProvider) {';
        issues.push('Database provider not initialized');
        score -= 0.3;
      } else {
        try {';
          await this.dbProvider.query('SELECT 1 as test');
        } catch (error) {';
          issues.push('Database connection failed');
          score -= 0.4;
        }
      }
      // Check component health
      if (!this.kanban) {';
        issues.push('Kanban system not initialized');
        score -= 0.2;
      }
      if (!this.agui) {';
        issues.push('AGUI system not initialized');
        score -= 0.1;
      }
      return {
        healthy: issues.length === 0 && score > 0.7,
        issues,
        score: await this.dbProvider.query(';
        'SELECT event_data FROM system_events WHERE event_type = ? ORDER BY timestamp DESC LIMIT 1',;';
        ['system_state_persisted'];;
      );

      if (result.rows.length > 0) {
        const stateData = JSON.parse(result.rows[0].event_data);
        const totalTasks = Object.values(stateData.taskCounts as Record<string, number>);
          .reduce((sum, count) => sum + count, 0);
        ';
        this.logger.info('System state restored from storage, { ;
          taskCounts: json_remove(metadata, `${.}paused_at``) WHERE json_extract(metadata, `${.}paused_at``) IS NOT NULL');

      // Clear any stale approval queue entries';
      await this.dbProvider.execute('UPDATE approval_queue_history SET processed_at = datetime("now"), approval_result = "cancelled_on_resume" WHERE processed_at IS NULL AND queued_at < datetime("now", "-1 hour")');
';
      this.logger.info('Task processing queues reinitialized');
    } catch (error) {';
      this.logger.error('Error reinitializing task processing queues', error);
      throw error;
    }
  }
  private async reconnectToExternalServices(): Promise<void> {
    try {
      // Reinitialize components that might have been disconnected
      // This could include database connections, external APIs, etc.';
      this.logger.info('External services reconnection completed');
    } catch (error) {';
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
export function _createTaskFlowController(
  config: TaskFlowConfig
): TaskFlowController {
  return new TaskFlowController(config);
}
// =============================================================================
// EXPORTS
// =============================================================================

export type { TaskFlowState, TaskFlowGate, TaskFlowConfig, TaskFlowStatus };