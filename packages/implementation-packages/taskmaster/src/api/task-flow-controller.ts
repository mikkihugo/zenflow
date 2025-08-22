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

import { TypedEventBase } from '@claude-zen/foundation';
import { WorkflowKanban } from './workflow-kanban';
import { TaskApprovalSystem } from '../agui/task-approval-system';
import { AGUISystem } from '../agui/main';
import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';

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
  wipUsage: Record<TaskFlowState, { current: number; limit: number; utilization: number }>;
  
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
  private isHalted: boolean = false;

  constructor(config: TaskFlowConfig) {
    super();
    this.logger = getLogger('TaskFlowController');
    this.config = config;
    
    // Initialize Kanban workflow engine
    this.kanban = new WorkflowKanban({
      states: Object.keys(config.wipLimits) as TaskFlowState[],
      wipLimits: config.wipLimits,
      bottleneckThreshold: config.optimization.enableBottleneckDetection ? 0.8 : 1.0
    });
    
    // Initialize AGUI approval system
    this.agui = new AGUISystem({
      type: 'terminal',
      enableBatchMode: true,
      batchSize: 5
    });
    
    this.approvalSystem = new TaskApprovalSystem({
      enableBatchMode: true,
      batchSize: 3,
      autoApproveThreshold: 0.8
    });
    
    this.setupEventHandlers();
    this.logger.info('TaskFlowController initialized', {
      wipLimits: config.wipLimits,
      gatesEnabled: Object.keys(config.gates).length,
      systemLimits: config.systemLimits
    });
  }

  /**
   * Move a task to a new state with approval gate checking
   */
  async moveTask(taskId: string, toState: TaskFlowState, confidence: number = 0.5): Promise<boolean> {
    if (this.isHalted) {
      throw new Error('Task flow is halted - cannot move tasks');
    }

    try {
      // 1. Check system capacity first
      const systemStatus = await this.getSystemStatus();
      if (systemStatus.systemCapacity.status === 'critical') {
        this.logger.warn('System at critical capacity - halting task movement', {
          taskId,
          toState,
          systemCapacity: systemStatus.systemCapacity
        });
        return false;
      }

      // 2. Check WIP limits
      if (!this.kanban.canEnterState(toState)) {
        return this.handleWIPLimitReached(taskId, toState);
      }

      // 3. Check approval gate requirements
      const gate = this.config.gates[toState];
      if (gate?.enabled) {
        const approved = await this.processApprovalGate(taskId, toState, confidence, gate);
        if (!approved) {
          this.logger.info('Task movement rejected by approval gate', {
            taskId,
            toState,
            confidence
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
        utilization: current / limit
      };
    }

    // Calculate approval queue status
    const approvalQueues: Record<string, any> = {};
    for (const [state, gate] of Object.entries(this.config.gates)) {
      if (gate.enabled) {
        const pending = await this.getGateQueueDepth(state as TaskFlowState);
        approvalQueues[`${state}-gate`] = {
          pending,
          avgWaitTime: await this.getAverageWaitTime(state as TaskFlowState)
        };
      }
    }

    // Calculate system capacity
    const totalPending = Object.values(approvalQueues).reduce((sum, queue) => sum + queue.pending, 0);
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

  /**
   * Halt all task flow operations
   */
  async haltSystem(reason: string): Promise<void> {
    this.isHalted = true;
    this.emit('systemHalted', { reason, timestamp: Date.now() });
    this.logger.warn('Task flow system halted', { reason });
  }

  /**
   * Resume task flow operations
   */
  async resumeSystem(): Promise<void> {
    this.isHalted = false;
    this.emit('systemResumed', { timestamp: Date.now() });
    this.logger.info('Task flow system resumed');
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
        threshold: gate.autoApproveThreshold
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
          queueDepth
        },
        confidence,
        priority: confidence > 0.7 ? 'high' : 'medium'
      });

      return response.toLowerCase().includes('yes') || response.toLowerCase().includes('approve');
    } catch (error) {
      this.logger.error('Error processing approval gate', { taskId, toState, error });
      return false;
    }
  }

  private async handleWIPLimitReached(taskId: string, toState: TaskFlowState): Promise<boolean> {
    const gate = this.config.gates[toState];
    
    if (gate?.onQueueFull === 'spillover' && gate.spilloverTarget) {
      this.logger.info('WIP limit reached - redirecting to spillover state', {
        taskId,
        originalState: toState,
        spilloverState: gate.spilloverTarget
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
      wipLimit: this.config.wipLimits[toState]
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
        this.logger.warn('Queue overflow - auto-approving task', { taskId, toState });
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
          maxDepth: gate.maxQueueDepth
        });
        return false;
    }
    
    return false;
  }

  private async escalateCapacityDecision(taskId: string, toState: TaskFlowState): Promise<boolean> {
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
          wipLimit: this.config.wipLimits[toState]
        },
        confidence: 0.5,
        priority: 'high'
      });

      return response.toLowerCase().includes('yes') || response.toLowerCase().includes('override');
    } catch (error) {
      this.logger.error('Error escalating capacity decision', { taskId, toState, error });
      return false;
    }
  }

  private async escalateQueueDecision(taskId: string, toState: TaskFlowState): Promise<boolean> {
    // Human decision on queue management
    try {
      const response = await this.agui.askQuestion({
        id: `queue-escalation-${taskId}`,
        type: 'escalation', 
        question: `Approval queue full for ${toState}. Add task ${taskId} to queue anyway?`,
        context: {
          taskId,
          toState,
          queueDepth: await this.getGateQueueDepth(toState)
        },
        confidence: 0.5,
        priority: 'high'
      });

      return response.toLowerCase().includes('yes') || response.toLowerCase().includes('add');
    } catch (error) {
      this.logger.error('Error escalating queue decision', { taskId, toState, error });
      return false;
    }
  }

  private async getGateQueueDepth(state: TaskFlowState): Promise<number> {
    // This would integrate with the approval system to get queue depth
    // For now, return a placeholder
    return 0;
  }

  private async getAverageWaitTime(state: TaskFlowState): Promise<number> {
    // This would calculate average wait time from approval metrics
    // For now, return a placeholder
    return 300000; // 5 minutes in milliseconds
  }

  private async checkForBottlenecks(): Promise<void> {
    const status = await this.getSystemStatus();
    
    for (const bottleneck of status.bottlenecks) {
      this.emit('bottleneckDetected', {
        state: bottleneck,
        utilization: status.wipUsage[bottleneck].utilization,
        timestamp: Date.now()
      });
    }
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new Task Flow Controller with the specified configuration
 */
export function createTaskFlowController(config: TaskFlowConfig): TaskFlowController {
  return new TaskFlowController(config);
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  TaskFlowState,
  TaskFlowGate,
  TaskFlowConfig,
  TaskFlowStatus
};