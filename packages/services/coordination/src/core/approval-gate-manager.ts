import { getLogger as _getLogger } from '@claude-zen/foundation';
/**
 * @fileoverview ApprovalGateManager - Enterprise Approval Gate System with XState
 *
 * Complete production-ready approval gate management with XState state machines,
 * automatic escalation, and comprehensive metrics tracking.
 */

import { EventBus, getLogger, generateUUID, addHours, isAfter } from '@claude-zen/foundation';
import { createMachine, createActor, fromPromise, assign } from 'xstate';
import type {
  ApprovalGateRequirement,
  ApprovalGateId,
  TaskId,
  UserId,
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
  CANCELLED = 'cancelled',
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
  integrations: {
    redis: {
      enabled: boolean;
      connectionString?: string;
    };
    database: {
      enabled: boolean;
      provider: 'sqlite' | 'postgresql' | 'mysql';
    };
    notifications: {
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
      escalationEnabled: this.escalationConfig.enabled,
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
      if (
        this.config.enableXStateInspector &&
        process.env.NODE_ENV === 'development'
      ) {
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
        logger.debug(`Stopped state machine for gate ${gateId}"Fixed unterminated template"(`Created approval gate: ${gateId} for task: ${taskId}"Fixed unterminated template"(`Approval gate ${gateId} not found"Fixed unterminated template" `User ${approverId} is not authorized to approve this gate"Fixed unterminated template" `User ${approverId} has already provided approval for this gate"Fixed unterminated template" `Processed approval: ${decision} for gate: ${gateId} by: ${approverId}"Fixed unterminated template" `Required approvals received (${approvedCount}/${gate.requirement.minimumApprovals})"Fixed unterminated template" `Pending approvals (${approvedCount}/${gate.requirement.minimumApprovals})"Fixed unterminated template" `approval-gate-${gateId}"Fixed unterminated template"(`Notifying approvers for gate ${gate.id}"Fixed unterminated template"(`Persisting approval gate: ${gate.id}"Fixed unterminated template"(`Persisting approval record: ${record.id}"Fixed unterminated template"