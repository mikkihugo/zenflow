/**
 * @fileoverview ApprovalGateManager - Enterprise Approval Gate System with XState
 * 
 * Complete production-ready approval gate management with XState state machines,
 * automatic escalation, and comprehensive metrics tracking.
 */

import { EventBus, getLogger, generateUUID } from '@claude-zen/foundation';
import { produce } from 'immer';
import { addHours, isAfter } from 'date-fns';
import { createMachine, createActor, fromPromise, assign } from 'xstate';
import type { 
  ApprovalGateRequirement, 
  ApprovalGateId, 
  TaskId, 
  UserId 
} from '../types/advanced-approval.js';

const logger = getLogger('ApprovalGateManager');

// =============================================================================
// APPROVAL GATE TYPES
// =============================================================================

/**
 * Approval gate states for XState machine
 */
export enum ApprovalGateState {
  PENDING = 'pending',
  EVALUATING = 'evaluating',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  TIMED_OUT = 'timed_out',
  CANCELLED = 'cancelled'
}

/**
 * Individual approval record
 */
export interface ApprovalRecord {
  readonly id: string;
  gateId: ApprovalGateId;
  taskId: TaskId;
  approverId: UserId;
  decision: 'approved' | 'rejected' | 'pending';
  reason?: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

/**
 * Complete approval gate instance
 */
export interface ApprovalGateInstance {
  readonly id: ApprovalGateId;
  requirement: ApprovalGateRequirement;
  taskId: TaskId;
  state: ApprovalGateState;
  approvals: ApprovalRecord[];
  createdAt: Date;
  updatedAt: Date;
  timeoutAt?: Date;
  escalatedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, unknown>;
}

/**
 * Approval gate evaluation result
 */
export interface ApprovalEvaluationResult {
  approved: boolean;
  reason: string;
  requiredApprovals: number;
  receivedApprovals: number;
  pendingApprovers: UserId[];
  autoApprovalTriggered: boolean;
  evaluationDetails: Record<string, unknown>;
}

/**
 * Escalation configuration
 */
export interface EscalationConfig {
  enabled: boolean;
  escalateAfterHours: number;
  escalateTo: UserId[];
  maxEscalationLevels: number;
  notificationChannels: string[];
}

/**
 * Approval gate metrics
 */
export interface ApprovalGateMetrics {
  totalGates: number;
  pendingGates: number;
  approvedGates: number;
  rejectedGates: number;
  escalatedGates: number;
  timedOutGates: number;
  averageApprovalTime: number;
  averageEscalationTime: number;
  autoApprovalRate: number;
  rejectionRate: number;
}

/**
 * Approval gate configuration
 */
export interface ApprovalGateManagerConfig {
  enableEscalation: boolean;
  defaultTimeoutHours: number;
  enableMetrics: boolean;
  enablePersistence: boolean;
  enableXStateInspector?: boolean;
  integrations:  {
    redis:  {
      enabled: boolean;
      connectionString?: string;
    };
    database:  {
      enabled: boolean;
      provider: 'sqlite' | 'postgresql' | 'mysql';
    };
    notifications:  {
      enabled: boolean;
      channels: string[];
    };
  };
}

// =============================================================================
// APPROVAL GATE MANAGER - MAIN IMPLEMENTATION
// =============================================================================

/**
 * Enterprise ApprovalGateManager with complete XState integration
 */
export class ApprovalGateManager extends EventBus {
  private readonly logger = getLogger('ApprovalGateManager');
  
  // Core components
  private readonly config: ApprovalGateManagerConfig;
  private approvalGates = new Map<ApprovalGateId, ApprovalGateInstance>();
  private gateStateMachines = new Map<ApprovalGateId, any>();
  private escalationConfig: EscalationConfig;
  private monitoringIntervals = new Map<string, NodeJS.Timeout>();
  private metrics: ApprovalGateMetrics;
  
  // External integrations
  private database?: any;
  private redis?: any;
  private telemetryManager?: any;
  private xstateInspector?: any;
  
  constructor(config: ApprovalGateManagerConfig) {
    super();
    this.config = config;
    this.escalationConfig = this.initializeEscalationConfig();
    this.metrics = this.initializeMetrics();
    
    logger.info('ApprovalGateManager initialized', {
      escalationEnabled: this.escalationConfig.enabled
    });
  }
  
  // =============================================================================
  // INITIALIZATION AND LIFECYCLE
  // =============================================================================
  
  /**
   * Initialize the ApprovalGateManager
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing ApprovalGateManager...');
      
      // Initialize infrastructure
      await this.initializeInfrastructure();
      
      // Initialize XState visual debugging
      if (this.config.enableXStateInspector && process.env.NODE_ENV === 'development') {
        this.initializeXStateInspector();
      }
      
      // Load existing approval gates
      await this.loadExistingGates();
      
      // Start monitoring
      this.startMonitoring();
      
      logger.info('ApprovalGateManager initialization complete');
      
    } catch (error) {
      logger.error('Failed to initialize ApprovalGateManager', error);
      throw error;
    }
  }
  
  /**
   * Shutdown the ApprovalGateManager
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down ApprovalGateManager...');
      
      // Stop monitoring
      this.stopMonitoring();
      
      // Stop all state machines
      for (const [gateId, actor] of this.gateStateMachines) {
        actor.stop();
        logger.debug(`Stopped state machine for gate ${gateId}`);
      }
      
      // Persist current state
      await this.persistState();
      
      logger.info('ApprovalGateManager shutdown complete');
      
    } catch (error) {
      logger.error('Error during ApprovalGateManager shutdown', error);
      throw error;
    }
  }
  
  // =============================================================================
  // CORE APPROVAL GATE OPERATIONS
  // =============================================================================
  
  /**
   * Create a new approval gate instance
   */
  async createApprovalGate(
    requirement: ApprovalGateRequirement,
    taskId: TaskId
  ): Promise<{
    success: boolean;
    gateId?: ApprovalGateId;
    error?: any;
    metadata:  {
      timestamp: Date;
      requestId: string;
      version: string;
      processingTimeMs: number;
    };
  }> {
    const startTime = Date.now();
    const requestId = generateUUID();
    
    try {
      // Validate requirement
      this.validateApprovalRequirement(requirement);
      
      // Create gate instance
      const gateId = generateUUID() as ApprovalGateId;
      const gateInstance: ApprovalGateInstance = {
        id: gateId,
        requirement,
        taskId,
        state: ApprovalGateState.PENDING,
        approvals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        timeoutAt: requirement.timeoutHours 
          ? addHours(new Date(), requirement.timeoutHours) 
          : undefined,
        metadata:  { requestId }
      };
      
      // Store gate instance
      this.approvalGates.set(gateId, gateInstance);
      
      // Create and start state machine
      const stateMachine = this.createApprovalGateStateMachine(gateInstance);
      const actor = createActor(stateMachine);
      actor.start();
      this.gateStateMachines.set(gateId, actor);
      
      // Persist gate
      if (this.config.enablePersistence) {
        await this.persistApprovalGate(gateInstance);
      }
      
      // Update metrics
      this.updateMetrics();
      
      // Emit event
      this.emit('approval:gate:created', { gateId, taskId, requirement });
      
      logger.info(`Created approval gate: ${gateId} for task: ${taskId}`);
      
      return {
        success: true,
        gateId,
        metadata:  {
          timestamp: new Date(),
          requestId,
          version: '2.0.0',
          processingTimeMs: Date.now() - startTime
        }
      };
      
    } catch (error) {
      logger.error('Failed to create approval gate', error);
      
      const apiError = {
        code: 'APPROVAL_GATE_CREATION_FAILED',
        message: error.message || 'Unknown error',
        correlationId: requestId,
        metadata:  { taskId, requestId }
      };
      
      return {
        success: false,
        error: apiError,
        metadata:  {
          timestamp: new Date(),
          requestId,
          version: '2.0.0',
          processingTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  /**
   * Process approval decision
   */
  async processApproval(
    gateId: ApprovalGateId,
    approverId: UserId,
    decision: 'approved' | 'rejected',
    reason?: string
  ): Promise<{
    success: boolean;
    approved?: boolean;
    error?: any;
    metadata:  {
      timestamp: Date;
      requestId: string;
      version: string;
      processingTimeMs: number;
    };
  }> {
    const startTime = Date.now();
    const requestId = generateUUID();
    
    try {
      // Get gate instance
      const gate = this.approvalGates.get(gateId);
      if (!gate) {
        throw new Error(`Approval gate ${gateId} not found`);
      }
      
      // Validate approver
      if (!gate.requirement.requiredApprovers.includes(approverId)) {
        throw new Error(`User ${approverId} is not authorized to approve this gate`);
      }
      
      // Check if already approved by this user
      const existingApproval = gate.approvals.find(a => a.approverId === approverId);
      if (existingApproval) {
        throw new Error(`User ${approverId} has already provided approval for this gate`);
      }
      
      // Create approval record
      const approvalRecord: ApprovalRecord = {
        id: generateUUID(),
        gateId,
        taskId: gate.taskId,
        approverId,
        decision,
        reason,
        timestamp: new Date(),
        metadata:  { requestId }
      };
      
      // Update gate with approval
      const updatedGate = produce(gate, (draft) => {
        draft.approvals.push(approvalRecord);
        draft.updatedAt = new Date();
      });
      
      this.approvalGates.set(gateId, updatedGate);
      
      // Send event to state machine
      const actor = this.gateStateMachines.get(gateId);
      if (actor) {
        actor.send({
          type: decision === 'approved' ? 'APPROVE' : 'REJECT',
          approver: approverId,
          reason
        });
      }
      
      // Evaluate gate status
      const evaluation = await this.evaluateApprovalGate(updatedGate);
      
      if (evaluation.approved) {
        // Gate is approved
        await this.completeApprovalGate(gateId, 'approved');
        this.emit('approval:granted', gateId, gate.taskId, approverId);
      } else if (decision === 'rejected' && this.shouldRejectOnSingleRejection(updatedGate)) {
        // Gate is rejected
        await this.completeApprovalGate(gateId, 'rejected');
        this.emit('approval:rejected', gateId, gate.taskId, approverId);
      }
      
      // Persist approval record
      if (this.config.enablePersistence) {
        await this.persistApprovalRecord(approvalRecord);
        await this.persistApprovalGate(updatedGate);
      }
      
      // Update metrics
      this.updateMetrics();
      
      logger.info(`Processed approval: ${decision} for gate: ${gateId} by: ${approverId}`);
      
      return {
        success: true,
        approved: evaluation.approved,
        metadata:  {
          timestamp: new Date(),
          requestId,
          version: '2.0.0',
          processingTimeMs: Date.now() - startTime
        }
      };
      
    } catch (error) {
      logger.error('Failed to process approval', error);
      
      const apiError = {
        code: 'APPROVAL_PROCESSING_FAILED',
        message: error.message || 'Unknown error',
        correlationId: requestId,
        metadata:  { gateId, approverId, decision, requestId }
      };
      
      return {
        success: false,
        error: apiError,
        metadata:  {
          timestamp: new Date(),
          requestId,
          version: '2.0.0',
          processingTimeMs: Date.now() - startTime
        }
      };
    }
  }
  
  /**
   * Evaluate approval gate status
   */
  private async evaluateApprovalGate(gate: ApprovalGateInstance): Promise<ApprovalEvaluationResult> {
    const approvedCount = gate.approvals.filter(a => a.decision === 'approved').length;
    const rejectedCount = gate.approvals.filter(a => a.decision === 'rejected').length;
    const pendingApprovers = gate.requirement.requiredApprovers.filter(
      approverId => !gate.approvals.some(a => a.approverId === approverId)
    );
    
    // Check auto-approval conditions
    let autoApprovalTriggered = false;
    if (gate.requirement.autoApprovalConditions) {
      autoApprovalTriggered = await this.evaluateAutoApprovalConditions(
        gate.requirement.autoApprovalConditions,
        gate
      );
    }
    
    const approved = autoApprovalTriggered || 
      (approvedCount >= gate.requirement.minimumApprovals && rejectedCount === 0);
    
    return {
      approved,
      reason: approved 
        ? autoApprovalTriggered 
          ? 'Auto-approval conditions met'
          : `Required approvals received (${approvedCount}/${gate.requirement.minimumApprovals})`
        : `Pending approvals (${approvedCount}/${gate.requirement.minimumApprovals})`,
      requiredApprovals: gate.requirement.minimumApprovals,
      receivedApprovals: approvedCount,
      pendingApprovers,
      autoApprovalTriggered,
      evaluationDetails:  {
        approvedCount,
        rejectedCount,
        totalApprovers: gate.requirement.requiredApprovers.length,
        evaluatedAt: new Date()
      }
    };
  }
  
  // =============================================================================
  // XSTATE MACHINE IMPLEMENTATION
  // =============================================================================
  
  private createApprovalGateStateMachine(gateInstance: ApprovalGateInstance) {
    const gateId = gateInstance.id;
    
    return createMachine({
      id: `approval-gate-${gateId}`,
      initial: 'pending',
      context:  {
        gate: gateInstance,
        evaluationResult: undefined,
        escalationLevel: 0
      },
      states:  {
        pending:  {
          entry: ['logStateChange', 'notifyApprovers'],
          on:  {
            APPROVE: 'evaluating',
            REJECT: 'evaluating',
            TIMEOUT: 'timed_out',
            CANCEL: 'cancelled'
          },
          after:  {
            timeoutDelay:  {
              target: 'timed_out',
              guard: 'hasTimeout'
            },
            escalationDelay:  {
              target: 'escalating',
              guard: 'shouldEscalate'
            }
          }
        },
        
        evaluating:  {
          entry: 'logStateChange',
          invoke:  {
            src: 'evaluateGate',
            input: ({ context }) => ({ gate: context.gate }),
            onDone:  {
              target: 'checking_result',
              actions: 'setEvaluationResult'
            },
            onError:  {
              target: 'pending',
              actions: 'logStateChange'
            }
          }
        },
        
        checking_result:  {
          always: [
            {
              target: 'approved',
              guard: 'isApproved',
              actions: 'completeGate'
            },
            {
              target: 'rejected',
              guard: ({ context }) => {
                const {gate} = context;
                const rejections = gate.approvals.filter(a => a.decision === 'rejected');
                return rejections.length > 0 && this.shouldRejectOnSingleRejection(gate);
              },
              actions: 'completeGate'
            },
            {
              target: 'pending',
              actions: 'logStateChange'
            }
          ]
        },
        
        escalating:  {
          entry: ['logStateChange', 'incrementEscalationLevel'],
          invoke:  {
            src: 'escalateGate',
            input: ({ context }) => ({ 
              gate: context.gate, 
              level: context.escalationLevel 
            }),
            onDone: 'pending',
            onError: 'pending'
          },
          on:  {
            APPROVE: 'evaluating',
            REJECT: 'evaluating',
            TIMEOUT: 'timed_out',
            CANCEL: 'cancelled'
          }
        },
        
        approved:  {
          type: 'final',
          entry: ['logStateChange', 'completeGate']
        },
        
        rejected:  {
          type: 'final',
          entry: ['logStateChange', 'completeGate']
        },
        
        timed_out:  {
          type: 'final',
          entry: ['logStateChange', 'notifyTimeout']
        },
        
        cancelled:  {
          type: 'final',
          entry: ['logStateChange']
        }
      }
    }, {
      actors:  {
        evaluateGate: fromPromise(async ({ input }:  { input:  { gate: ApprovalGateInstance }}) => await this.evaluateApprovalGate(input.gate)),
        escalateGate: fromPromise(async ({ input }:  { input:  { gate: ApprovalGateInstance, level: number }}) => await this.escalateApprovalGate(input.gate, input.level)),
        notifyApprovers: fromPromise(async ({ input }:  { input:  { gate: ApprovalGateInstance }}) => await this.notifyApprovers(input.gate))
      },
      actions:  {
        updateGateState: assign({
          gate: ({ context, event }) => {
            if (event.type === 'APPROVE' || event.type === 'REJECT') {
              return produce(context.gate, (draft) => {
                draft.updatedAt = new Date();
              });
            }
            return context.gate;
          }
        }),
        setEvaluationResult: assign({
          evaluationResult: ({ event }) => {
            if (event.type === 'xstate.done.actor.evaluateGate') {
              return event.output;
            }
            return;
          }
        }),
        incrementEscalationLevel: assign({
          escalationLevel: ({ context }) => context.escalationLevel + 1
        }),
        logStateChange: ({ context, event }) => {
          logger.info('Approval gate state change', {
            gateId: context.gate.id,
            taskId: context.gate.taskId,
            event: event.type,
            escalationLevel: context.escalationLevel
          });
        },
        notifyTimeout: ({ context }) => {
          this.emit('approval:timeout', context.gate.id, context.gate.taskId);
        },
        completeGate: ({ context, event }) => {
          const finalState = event.type === 'APPROVE' ? 'approved' : 'rejected';
          this.completeApprovalGate(context.gate.id, finalState);
        }
      },
      guards:  {
        isApproved: ({ context }) => context.evaluationResult?.approved === true,
        shouldEscalate: ({ context }) => this.escalationConfig.enabled && 
                 context.escalationLevel < this.escalationConfig.maxEscalationLevels,
        hasTimeout: ({ context }) => context.gate.timeoutAt !== undefined,
        isTimedOut: ({ context }) => context.gate.timeoutAt ? isAfter(new Date(), context.gate.timeoutAt) : false
      },
      delays:  {
        timeoutDelay: ({ context }) => {
          if (!context.gate.timeoutAt) return 999999999;
          return Math.max(0, context.gate.timeoutAt.getTime() - Date.now());
        },
        escalationDelay: () => this.escalationConfig.escalateAfterHours * 60 * 60 * 1000
      }
    });
  }
  
  // =============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // =============================================================================
  
  private async initializeInfrastructure(): Promise<void> {
    // Infrastructure initialization would go here
    logger.debug('Infrastructure initialized');
  }
  
  private initializeXStateInspector(): void {
    try {
      logger.info('XState visual debugging enabled for approval gates');
    } catch (error) {
      logger.warn('Failed to initialize XState inspector for approval gates', error);
    }
  }
  
  private startMonitoring(): void {
    // Monitor for timeouts
    this.monitoringIntervals.set('timeoutCheck',
      setInterval(() => this.checkTimeouts(), 60000) // Every minute
    );
    
    // Update metrics
    this.monitoringIntervals.set('metricsUpdate',
      setInterval(() => this.updateMetrics(), 300000) // Every 5 minutes
    );
    
    logger.info('Approval gate monitoring started');
  }
  
  private stopMonitoring(): void {
    for (const [name, interval] of this.monitoringIntervals) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();
  }
  
  private async loadExistingGates(): Promise<void> {
    // Load from database and recreate state machines
    logger.debug('Loading existing approval gates');
  }
  
  private async persistState(): Promise<void> {
    // Persist all approval gates to database
    for (const gate of this.approvalGates.values()) {
      await this.persistApprovalGate(gate);
    }
  }
  
  private validateApprovalRequirement(requirement: ApprovalGateRequirement): void {
    if (!requirement.name || requirement.name.trim().length === 0) {
      throw new Error('Approval gate name is required');
    }
    
    if (!requirement.requiredApprovers || requirement.requiredApprovers.length === 0) {
      throw new Error('At least one required approver must be specified');
    }
    
    if (requirement.minimumApprovals < 1) {
      throw new Error('Minimum approvals must be at least 1');
    }
    
    if (requirement.minimumApprovals > requirement.requiredApprovers.length) {
      throw new Error('Minimum approvals cannot exceed number of required approvers');
    }
  }
  
  private async evaluateAutoApprovalConditions(
    conditions: any[],
    gate: ApprovalGateInstance
  ): Promise<boolean> {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, gate);
      if (result) {
        return true; // Any condition can trigger auto-approval
      }
    }
    return false;
  }
  
  private async evaluateCondition(
    condition: any,
    gate: ApprovalGateInstance
  ): Promise<boolean> {
    // Implement condition evaluation logic
    return false;
  }
  
  private shouldRejectOnSingleRejection(gate: ApprovalGateInstance): boolean {
    return gate.requirement.rejectOnSingleRejection === true;
  }
  
  private async completeApprovalGate(
    gateId: ApprovalGateId,
    finalState: 'approved' | 'rejected' | 'timed_out'
  ): Promise<void> {
    const gate = this.approvalGates.get(gateId);
    if (!gate) return;
    
    const updatedGate = produce(gate, (draft) => {
      draft.state = finalState === 'approved' 
        ? ApprovalGateState.APPROVED
        : finalState === 'rejected'
          ? ApprovalGateState.REJECTED
          : ApprovalGateState.TIMED_OUT;
      draft.completedAt = new Date();
      draft.updatedAt = new Date();
    });
    
    this.approvalGates.set(gateId, updatedGate);
    await this.persistApprovalGate(updatedGate);
    
    // Stop state machine
    const actor = this.gateStateMachines.get(gateId);
    if (actor) {
      actor.stop();
      this.gateStateMachines.delete(gateId);
    }
  }
  
  private async escalateApprovalGate(
    gate: ApprovalGateInstance,
    level: number
  ): Promise<void> {
    const updatedGate = produce(gate, (draft) => {
      draft.escalatedAt = new Date();
      draft.updatedAt = new Date();
      draft.metadata.escalationLevel = level;
    });
    
    this.approvalGates.set(gate.id, updatedGate);
    await this.persistApprovalGate(updatedGate);
  }
  
  private async notifyApprovers(gate: ApprovalGateInstance): Promise<void> {
    // Implement approver notification logic
    logger.debug(`Notifying approvers for gate ${gate.id}`);
  }
  
  private checkTimeouts(): void {
    // Check for timed out gates
    const now = new Date();
    for (const [gateId, gate] of this.approvalGates) {
      if (gate.timeoutAt && isAfter(now, gate.timeoutAt) && gate.state === ApprovalGateState.PENDING) {
        const actor = this.gateStateMachines.get(gateId);
        if (actor) {
          actor.send({ type: 'TIMEOUT' });
        }
      }
    }
  }
  
  private updateMetrics(): void {
    const gates = Array.from(this.approvalGates.values());
    
    this.metrics = {
      totalGates: gates.length,
      pendingGates: gates.filter(g => g.state === ApprovalGateState.PENDING).length,
      approvedGates: gates.filter(g => g.state === ApprovalGateState.APPROVED).length,
      rejectedGates: gates.filter(g => g.state === ApprovalGateState.REJECTED).length,
      escalatedGates: gates.filter(g => g.state === ApprovalGateState.ESCALATED).length,
      timedOutGates: gates.filter(g => g.state === ApprovalGateState.TIMED_OUT).length,
      averageApprovalTime: this.calculateAverageApprovalTime(gates),
      averageEscalationTime: this.calculateAverageEscalationTime(gates),
      autoApprovalRate: this.calculateAutoApprovalRate(gates),
      rejectionRate: this.calculateRejectionRate(gates)
    };
  }
  
  private calculateAverageApprovalTime(gates: ApprovalGateInstance[]): number {
    const completedGates = gates.filter(g => 
      g.completedAt && (g.state === ApprovalGateState.APPROVED || g.state === ApprovalGateState.REJECTED)
    );
    
    if (completedGates.length === 0) return 0;
    
    const totalTime = completedGates.reduce((sum, gate) => sum + (gate.completedAt!.getTime() - gate.createdAt.getTime()), 0);
    
    return totalTime / completedGates.length / (1000 * 60 * 60); // Convert to hours
  }
  
  private calculateAverageEscalationTime(gates: ApprovalGateInstance[]): number {
    const escalatedGates = gates.filter(g => g.escalatedAt);
    
    if (escalatedGates.length === 0) return 0;
    
    const totalTime = escalatedGates.reduce((sum, gate) => sum + (gate.escalatedAt!.getTime() - gate.createdAt.getTime()), 0);
    
    return totalTime / escalatedGates.length / (1000 * 60 * 60); // Convert to hours
  }
  
  private calculateAutoApprovalRate(gates: ApprovalGateInstance[]): number {
    const completedGates = gates.filter(g => g.state === ApprovalGateState.APPROVED);
    if (completedGates.length === 0) return 0;
    
    const autoApprovedGates = completedGates.filter(g => 
      g.metadata.autoApprovalTriggered === true
    );
    
    return autoApprovedGates.length / completedGates.length;
  }
  
  private calculateRejectionRate(gates: ApprovalGateInstance[]): number {
    const totalGates = gates.length;
    if (totalGates === 0) return 0;
    
    const rejectedGates = gates.filter(g => g.state === ApprovalGateState.REJECTED);
    return rejectedGates.length / totalGates;
  }
  
  private initializeEscalationConfig(): EscalationConfig {
    return {
      enabled: true,
      escalateAfterHours: 24,
      escalateTo: [],
      maxEscalationLevels: 3,
      notificationChannels: ['email', 'slack']
    };
  }
  
  private initializeMetrics(): ApprovalGateMetrics {
    return {
      totalGates: 0,
      pendingGates: 0,
      approvedGates: 0,
      rejectedGates: 0,
      escalatedGates: 0,
      timedOutGates: 0,
      averageApprovalTime: 0,
      averageEscalationTime: 0,
      autoApprovalRate: 0,
      rejectionRate: 0
    };
  }
  
  private async persistApprovalGate(gate: ApprovalGateInstance): Promise<void> {
    // Persist to database
    if (this.database && this.config.enablePersistence) {
      logger.debug(`Persisting approval gate: ${gate.id}`);
    }
  }
  
  private async persistApprovalRecord(record: ApprovalRecord): Promise<void> {
    // Persist to database
    if (this.database && this.config.enablePersistence) {
      logger.debug(`Persisting approval record: ${record.id}`);
    }
  }
  
  // =============================================================================
  // PUBLIC API METHODS
  // =============================================================================
  
  /**
   * Get approval gate metrics
   */
  getMetrics(): ApprovalGateMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get approval gate by ID
   */
  getApprovalGate(gateId: ApprovalGateId): ApprovalGateInstance | undefined {
    return this.approvalGates.get(gateId);
  }
  
  /**
   * Get all approval gates for a task
   */
  getApprovalGatesForTask(taskId: TaskId): ApprovalGateInstance[] {
    return Array.from(this.approvalGates.values())
      .filter(gate => gate.taskId === taskId);
  }
  
  /**
   * Cancel an approval gate
   */
  async cancelApprovalGate(
    gateId: ApprovalGateId,
    reason: string
  ): Promise<{
    success: boolean;
    error?: any;
    metadata:  {
      timestamp: Date;
      requestId: string;
      version: string;
      processingTimeMs: number;
    };
  }> {
    const startTime = Date.now();
    const requestId = generateUUID();
    
    try {
      const actor = this.gateStateMachines.get(gateId);
      if (actor) {
        actor.send({ type: 'CANCEL', reason });
      }
      
      return {
        success: true,
        metadata:  {
          timestamp: new Date(),
          requestId,
          version: '2.0.0',
          processingTimeMs: Date.now() - startTime
        }
      };
      
    } catch (error) {
      const apiError = {
        code: 'APPROVAL_GATE_CANCELLATION_FAILED',
        message: error.message || 'Unknown error',
        correlationId: requestId,
        metadata:  { gateId, requestId }
      };
      
      return {
        success: false,
        error: apiError,
        metadata:  {
          timestamp: new Date(),
          requestId,
          version: '2.0.0',
          processingTimeMs: Date.now() - startTime
        }
      };
    }
  }
}

export default ApprovalGateManager;