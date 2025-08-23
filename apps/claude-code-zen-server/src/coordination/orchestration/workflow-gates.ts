import { Logger, createEvent, EventPriority } from '@claude-zen/foundation';

// Enums and types
export enum WorkflowHumanGateType {
  STRATEGIC = 'strategic',
  ARCHITECTURAL = 'architectural',
  QUALITY = 'quality',
  BUSINESS = 'business',
  ETHICAL = 'ethical',
  EMERGENCY = 'emergency',
  CHECKPOINT = 'checkpoint',
  APPROVAL = 'approval',
}

export enum WorkflowHumanGateStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  ESCALATED = 'escalated',
}

export enum GateEscalationLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface WorkflowGateContext {
  domain: string;
  priority: string;
  workflowId: string;
  stepId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface GateOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  consequences?: string[];
}

export interface GateAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface WorkflowGateData {
  title: string;
  description: string;
  requirements: string[];
  options: GateOption[];
  requestData: Record<string, unknown>;
  attachments?: GateAttachment[];
  constraints?: Record<string, unknown>;
}

export interface GateEscalationConfig {
  level: GateEscalationLevel;
  timeoutMinutes: number;
  escalationPath: string[];
  autoEscalate: boolean;
}

export interface GateMetrics {
  reviewerCount: number;
  escalationCount: number;
  reopenCount: number;
  complexity: 'low' | 'medium' | 'high';
  responseTime?: number;
}

export interface WorkflowHumanGate {
  id: string;
  type: WorkflowHumanGateType;
  subtype?: string;
  title: string;
  description: string;
  status: WorkflowHumanGateStatus;
  createdAt: Date;
  updatedAt: Date;
  workflowContext: WorkflowGateContext;
  gateData: WorkflowGateData;
  approvers: string[];
  escalation: GateEscalationConfig;
  metrics: GateMetrics;
}

export interface WorkflowGateResult {
  gateId: string;
  status: WorkflowHumanGateStatus;
  decision: 'approve' | 'reject' | 'modify';
  reasoning: string;
  reviewerId: string;
  reviewerNotes?: string;
  modifications?: Record<string, unknown>;
  timestamp: Date;
}

// Mock interfaces for external dependencies
interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: WorkflowHumanGateType;
  priority: string;
  requiredApprovers: string[];
  data: Record<string, unknown>;
  attachments: Array<{ name: string; url: string; type: string }>;
  timeoutMs: number;
  allowDelegation: boolean;
}

interface WorkflowEngine {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

interface TaskApprovalSystem {
  initialize(): Promise<void>;
  submitApprovalRequest(request: ApprovalRequest): Promise<void>;
  processApproval(gateId: string, approval: any): Promise<any>;
  cancelApprovalRequest(gateId: string, reason: string): Promise<void>;
}

const logger: Logger = {
  info: (msg: string, ...args: any[]) => console.log(msg, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(msg, ...args),
  error: (msg: string, ...args: any[]) => console.error(msg, ...args),
  debug: (msg: string, ...args: any[]) => console.debug(msg, ...args),
};

const kvStore = {
  set: async (key: string, value: any): Promise<void> => {
    // Mock implementation
  },
  get: async (key: string): Promise<any> => {
    // Mock implementation
    return null;
  },
};

// Mock factory functions
function createWorkflowEngine(): WorkflowEngine {
  return {
    async initialize() {
      // Mock implementation
    },
    async shutdown() {
      // Mock implementation
    },
  };
}

function createTaskApprovalSystem(config: any): TaskApprovalSystem {
  return {
    async initialize() {
      // Mock implementation
    },
    async submitApprovalRequest(request: ApprovalRequest) {
      // Mock implementation
    },
    async processApproval(gateId: string, approval: any) {
      // Mock implementation
      return { approved: true };
    },
    async cancelApprovalRequest(gateId: string, reason: string) {
      // Mock implementation
    },
  };
}

/**
 * Enhanced Workflow Gates Manager with package integration
 */
export class WorkflowGatesManager {
  private pendingGates = new Map<string, WorkflowHumanGate>();
  private completedGates = new Map<string, WorkflowHumanGate>();
  private workflowEngine?: WorkflowEngine;
  private approvalSystem!: TaskApprovalSystem;
  private isInitialized = false;
  private eventBus: any;

  constructor(
    eventBus: any,
    config: {
      enableAutoEscalation?: boolean;
      defaultTimeoutMinutes?: number;
      enablePersistence?: boolean;
      enableScheduling?: boolean;
    } = {}
  ) {
    this.eventBus = eventBus;

    // Initialize workflow engine with comprehensive capabilities
    this.workflowEngine = createWorkflowEngine();

    // Initialize approval system with AGUI integration
    const approvalConfig = {
      systemName: 'WorkflowGates',
      autoEscalation: config.enableAutoEscalation ?? true,
      defaultTimeout: (config.defaultTimeoutMinutes ?? 30) * 60 * 1000,
      persistence: config.enablePersistence ?? true,
      scheduling: config.enableScheduling ?? true,
    };

    this.approvalSystem = createTaskApprovalSystem(approvalConfig);

    logger.info('WorkflowGatesManager initialized with package integration', {
      config,
      packagesUsed: ['@claude-zen/intelligence', '@claude-zen/enterprise'],
    });
  }

  /**
   * Initialize the workflow gates manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize package components
      await this.workflowEngine?.initialize();
      await this.approvalSystem?.initialize();

      // Load persisted gates
      await this.loadPersistedGates();

      this.isInitialized = true;
      logger.info('WorkflowGatesManager fully initialized');

      this.emit('initialized', { timestamp: Date.now() });
    } catch (error) {
      logger.error('Failed to initialize WorkflowGatesManager', error);
      throw error;
    }
  }

  /**
   * Create and trigger a workflow gate using approval system
   */
  async createGate(
    type: WorkflowHumanGateType,
    context: WorkflowGateContext,
    gateData: WorkflowGateData,
    approvers: string[] = []
  ): Promise<string> {
    const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const gate: WorkflowHumanGate = {
        id: gateId,
        type,
        subtype: this.determineSubtype(type, gateData),
        title: this.generateGateTitle(type, context),
        description: this.generateGateDescription(type, gateData),
        status: WorkflowHumanGateStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        workflowContext: context,
        gateData,
        approvers: approvers.length > 0 ? approvers : this.getDefaultApprovers(type),
        escalation: this.createEscalationConfig(type, context.priority),
        metrics: {
          reviewerCount: 0,
          escalationCount: 0,
          reopenCount: 0,
          complexity: this.assessComplexity(gateData),
        },
      };

      // Store gate
      this.pendingGates.set(gateId, gate);
      await this.persistGate(gate);

      // Create approval request using AGUI system
      const approvalRequest: ApprovalRequest = {
        id: gateId,
        title: gate.title,
        description: gate.description,
        type: type,
        priority: context.priority,
        requiredApprovers: gate.approvers,
        data: gateData.requestData,
        attachments:
          gateData.attachments?.map((a) => ({
            name: a.name,
            url: a.url,
            type: a.type,
          })) || [],
        timeoutMs: gate.escalation.timeoutMinutes * 60 * 1000,
        allowDelegation: true,
      };

      // Submit to approval system
      await this.approvalSystem.submitApprovalRequest(approvalRequest);

      logger.info('Workflow gate created', {
        gateId,
        type,
        approvers: gate.approvers,
        priority: context.priority,
      });

      // Emit gate created event
      const event = createEvent(
        'WorkflowGateCreated',
        {
          gateId,
          type,
          context,
          timestamp: Date.now(),
        },
        EventPriority.High
      );

      this.eventBus.emit(event);
      this.emit('gateCreated', gate);

      return gateId;
    } catch (error) {
      logger.error('Failed to create workflow gate', { gateId, type, error });
      throw error;
    }
  }

  /**
   * Process gate approval/rejection using AGUI system
   */
  async processGateDecision(
    gateId: string,
    reviewerId: string,
    decision: 'approve' | 'reject' | 'modify',
    reasoning: string,
    modifications?: Record<string, unknown>
  ): Promise<WorkflowGateResult> {
    const gate = this.pendingGates.get(gateId);
    if (!gate) {
      throw new Error(`Gate ${gateId} not found`);
    }

    try {
      // Process through AGUI approval system
      const approvalResult = await this.approvalSystem.processApproval(gateId, {
        approverId: reviewerId,
        decision: decision === 'approve' ? 'approved' : 'rejected',
        comments: reasoning,
        timestamp: new Date(),
        metadata: modifications,
      });

      // Update gate status based on decision
      const newStatus = this.mapDecisionToStatus(decision);
      gate.status = newStatus;
      gate.updatedAt = new Date();
      gate.metrics.reviewerCount++;

      // Move gate to completed
      this.pendingGates.delete(gateId);
      this.completedGates.set(gateId, gate);

      // Persist changes
      await this.persistGate(gate);

      const result: WorkflowGateResult = {
        gateId,
        status: newStatus,
        decision,
        reasoning,
        reviewerId,
        reviewerNotes: reasoning,
        modifications,
        timestamp: new Date(),
      };

      logger.info('Gate decision processed', {
        gateId,
        decision,
        reviewerId,
        status: newStatus,
      });

      // Emit decision event
      const event = createEvent(
        'WorkflowGateDecision',
        {
          gateId,
          decision,
          reviewerId,
          timestamp: Date.now(),
        },
        EventPriority.High
      );

      this.eventBus.emit(event);
      this.emit('gateDecision', result);

      return result;
    } catch (error) {
      logger.error('Failed to process gate decision', {
        gateId,
        decision,
        error,
      });
      throw error;
    }
  }

  /**
   * Get gate by ID
   */
  getGate(gateId: string): WorkflowHumanGate | null {
    return this.pendingGates.get(gateId) || this.completedGates.get(gateId) || null;
  }

  /**
   * Get all pending gates
   */
  getPendingGates(): WorkflowHumanGate[] {
    return Array.from(this.pendingGates.values());
  }

  /**
   * Get gates by type
   */
  getGatesByType(type: WorkflowHumanGateType): WorkflowHumanGate[] {
    const allGates = [
      ...this.pendingGates.values(),
      ...this.completedGates.values(),
    ];
    return allGates.filter((gate) => gate.type === type);
  }

  /**
   * Cancel a pending gate
   */
  async cancelGate(gateId: string, reason: string = 'Cancelled by system'): Promise<boolean> {
    const gate = this.pendingGates.get(gateId);
    if (!gate) {
      return false;
    }

    try {
      // Cancel in approval system
      await this.approvalSystem.cancelApprovalRequest(gateId, reason);

      // Update gate status
      gate.status = WorkflowHumanGateStatus.CANCELLED;
      gate.updatedAt = new Date();

      // Move to completed
      this.pendingGates.delete(gateId);
      this.completedGates.set(gateId, gate);

      await this.persistGate(gate);

      logger.info('Gate cancelled', { gateId, reason });
      this.emit('gateCancelled', { gateId, reason });

      return true;
    } catch (error) {
      logger.error('Failed to cancel gate', { gateId, error });
      return false;
    }
  }

  /**
   * Get comprehensive gate metrics
   */
  getGateMetrics(): {
    totalGates: number;
    pendingGates: number;
    completedGates: number;
    averageResponseTime: number;
    approvalRate: number;
    escalationRate: number;
  } {
    const totalGates = this.pendingGates.size + this.completedGates.size;
    const pendingGates = this.pendingGates.size;
    const completedGates = this.completedGates.size;

    const completedGatesArray = Array.from(this.completedGates.values());
    const approvedGates = completedGatesArray.filter(
      (g) => g.status === WorkflowHumanGateStatus.APPROVED
    );
    const escalatedGates = completedGatesArray.filter(
      (g) => g.metrics.escalationCount > 0
    );

    const avgResponseTime =
      completedGatesArray.length > 0
        ? completedGatesArray.reduce(
            (sum, g) => sum + (g.metrics.responseTime || 0),
            0
          ) / completedGatesArray.length
        : 0;

    const approvalRate = completedGates > 0 ? approvedGates.length / completedGates : 0;
    const escalationRate = totalGates > 0 ? escalatedGates.length / totalGates : 0;

    return {
      totalGates,
      pendingGates,
      completedGates,
      averageResponseTime: avgResponseTime,
      approvalRate,
      escalationRate,
    };
  }

  /**
   * Shutdown and cleanup
   */
  async shutdown(): Promise<void> {
    try {
      // Cancel all pending gates
      for (const gateId of this.pendingGates.keys()) {
        await this.cancelGate(gateId, 'System shutdown');
      }

      // Shutdown package components
      await this.workflowEngine?.shutdown();
      // TaskApprovalSystem doesn't need explicit shutdown

      this.isInitialized = false;
      logger.info('WorkflowGatesManager shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown', error);
    }
  }

  // Private helper methods
  private emit(event: string, data: any): void {
    // Mock implementation - would emit to event system
  }

  private determineSubtype(
    type: WorkflowHumanGateType,
    gateData: WorkflowGateData
  ): string {
    if (gateData.requirements.length > 5) return 'complex';
    if (gateData.options.length > 3) return 'multi-option';
    return 'standard';
  }

  private generateGateTitle(
    type: WorkflowHumanGateType,
    context: WorkflowGateContext
  ): string {
    const typeLabels = {
      [WorkflowHumanGateType.STRATEGIC]: 'Strategic Decision Required',
      [WorkflowHumanGateType.ARCHITECTURAL]: 'Architecture Review Needed',
      [WorkflowHumanGateType.QUALITY]: 'Quality Gate Checkpoint',
      [WorkflowHumanGateType.BUSINESS]: 'Business Approval Required',
      [WorkflowHumanGateType.ETHICAL]: 'Ethics Review Required',
      [WorkflowHumanGateType.EMERGENCY]: 'Emergency Gate Triggered',
      [WorkflowHumanGateType.CHECKPOINT]: 'Workflow Checkpoint',
      [WorkflowHumanGateType.APPROVAL]: 'Approval Required',
    };

    return `${typeLabels[type]} - ${context.domain}`;
  }

  private generateGateDescription(
    type: WorkflowHumanGateType,
    gateData: WorkflowGateData
  ): string {
    return `${type} gate with ${gateData.requirements.length} requirements and ${gateData.options.length} options`;
  }

  private getDefaultApprovers(type: WorkflowHumanGateType): string[] {
    const defaultApprovers = {
      [WorkflowHumanGateType.STRATEGIC]: ['strategy-lead'],
      [WorkflowHumanGateType.ARCHITECTURAL]: ['architect-lead'],
      [WorkflowHumanGateType.QUALITY]: ['qa-lead'],
      [WorkflowHumanGateType.BUSINESS]: ['business-lead'],
      [WorkflowHumanGateType.ETHICAL]: ['ethics-officer'],
      [WorkflowHumanGateType.EMERGENCY]: ['emergency-coordinator'],
      [WorkflowHumanGateType.CHECKPOINT]: ['workflow-manager'],
      [WorkflowHumanGateType.APPROVAL]: ['approval-manager'],
    };

    return defaultApprovers[type] || ['default-approver'];
  }

  private createEscalationConfig(
    type: WorkflowHumanGateType,
    priority: string
  ): GateEscalationConfig {
    const timeoutMap = {
      low: 240, // 4 hours
      medium: 120, // 2 hours
      high: 60, // 1 hour
      critical: 30, // 30 minutes
    };

    const levelMap = {
      low: GateEscalationLevel.LOW,
      medium: GateEscalationLevel.MEDIUM,
      high: GateEscalationLevel.HIGH,
      critical: GateEscalationLevel.CRITICAL,
    };

    return {
      level: levelMap[priority as keyof typeof levelMap] || GateEscalationLevel.MEDIUM,
      timeoutMinutes: timeoutMap[priority as keyof typeof timeoutMap] || 120,
      escalationPath: ['manager', 'director', 'vp'],
      autoEscalate: priority === 'critical' || priority === 'high',
    };
  }

  private assessComplexity(gateData: WorkflowGateData): 'low' | 'medium' | 'high' {
    const requirementCount = gateData.requirements.length;
    const optionCount = gateData.options.length;
    const hasAttachments = (gateData.attachments?.length || 0) > 0;

    const complexity = requirementCount + optionCount + (hasAttachments ? 2 : 0);

    if (complexity >= 8) return 'high';
    if (complexity >= 4) return 'medium';
    return 'low';
  }

  private mapDecisionToStatus(decision: 'approve' | 'reject' | 'modify'): WorkflowHumanGateStatus {
    const statusMap = {
      approve: WorkflowHumanGateStatus.APPROVED,
      reject: WorkflowHumanGateStatus.REJECTED,
      modify: WorkflowHumanGateStatus.IN_REVIEW,
    };

    return statusMap[decision];
  }

  private async persistGate(gate: WorkflowHumanGate): Promise<void> {
    try {
      await kvStore.set(`gate:${gate.id}`, gate);
    } catch (error) {
      logger.warn('Failed to persist gate', { gateId: gate.id, error });
    }
  }

  private async loadPersistedGates(): Promise<void> {
    try {
      // Implementation would load gates from persistence layer
      logger.info('Loaded persisted gates');
    } catch (error) {
      logger.warn('Failed to load persisted gates', error);
    }
  }
}

// ============================================================================
// EXPORTS - Maintain API Compatibility
// ============================================================================

export default WorkflowGatesManager;

// Re-export all types and enums for compatibility
export type {
  WorkflowHumanGate,
  WorkflowGateContext,
  WorkflowGateData,
  GateOption,
  GateAttachment,
  GateEscalationConfig,
  GateMetrics,
  WorkflowGateResult,
};

// Legacy compatibility exports
export { WorkflowHumanGateType, WorkflowHumanGateStatus, GateEscalationLevel };