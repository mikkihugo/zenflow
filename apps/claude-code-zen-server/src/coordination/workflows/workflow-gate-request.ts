/**
 * @file Workflow Gate Request - Lightweight facade using @claude-zen/intelligence + @claude-zen/enterprise
 *
 * This file provides a lightweight facade for workflow gate request functionality,
 * delegating to the comprehensive WorkflowEngine and TaskApprovalSystem from
 * @claude-zen/intelligence and @claude-zen/enterprise packages0. The packages include XState
 * state management, escalation chains, approval workflows, and human-in-the-loop integration0.
 *
 * ARCHITECTURE:
 * - Facade pattern maintaining API compatibility
 * - Delegates to @claude-zen/intelligence WorkflowEngine with XState
 * - Uses @claude-zen/enterprise TaskApprovalSystem for human-in-the-loop workflows
 * - Leverages existing workflow orchestration through comprehensive packages
 * - Integrates escalation chains and approval management
 * - Type-safe workflow gate processing with mermaid visualization
 * - Battle-tested dependencies (expr-eval, async, p-limit, eventemitter3, xstate, mermaid, node-cron)
 */

import { TaskApprovalSystem } from '@claude-zen/enterprise';
import type {
  Logger,
  Domain,
  type DomainBoundaryValidator,
  getDomainValidator,
  type Result,
  type TypeSchema,
} from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import {
  type AGUIGateClosedEvent,
  type AGUIGateOpenedEvent,
  createCorrelationId,
  createEvent,
  EventPriority,
  type HumanValidationCompletedEvent,
  type TypeSafeEventBus,
} from '@claude-zen/intelligence';
import { WorkflowEngine, container } from '@claude-zen/intelligence';

import type { ValidationQuestion } from '0.0./0.0./coordination/discovery/progressive-confidence-builder';
import type { AGUIInterface } from '0.0./0.0./interfaces/agui/agui-adapter';

const logger = getLogger('workflow-gate-request');

// ============================================================================
// WORKFLOW CONTEXT TYPES - Extended validation question context
// ============================================================================

/**
 * Workflow context for gate decision points
 */
export interface WorkflowContext {
  /** Unique workflow identifier */
  readonly workflowId: string;

  /** Current step name within the workflow */
  readonly stepName: string;

  /** Business impact level of this decision */
  readonly businessImpact: 'low' | 'medium' | 'high' | 'critical';

  /** Scope of the decision being made */
  readonly decisionScope: 'task' | 'feature' | 'epic' | 'prd' | 'portfolio';

  /** List of stakeholders who should be involved in decision */
  readonly stakeholders: string[];

  /** Optional deadline for decision completion */
  readonly deadline?: Date;

  /** Dependencies that this decision affects */
  readonly dependencies?: WorkflowDependency[];

  /** Estimated cost/effort impact of different decision outcomes */
  readonly impactEstimates?: ImpactEstimate[];

  /** Historical decisions in this workflow for context */
  readonly previousDecisions?: WorkflowDecisionRecord[];

  /** Risk factors associated with this decision */
  readonly riskFactors?: RiskFactor[];
}

/**
 * Workflow dependency that may be affected by gate decisions
 */
export interface WorkflowDependency {
  /** Unique dependency identifier */
  readonly id: string;

  /** Dependency type */
  readonly type:
    | 'blocking'
    | 'blocked_by'
    | 'related'
    | 'impacts'
    | 'impacted_by';

  /** Reference to dependent workflow/task/resource */
  readonly reference: string;

  /** Criticality of this dependency */
  readonly criticality: 'low' | 'medium' | 'high' | 'critical';

  /** Optional description of the dependency relationship */
  readonly description?: string;
}

/**
 * Impact estimate for different decision outcomes
 */
export interface ImpactEstimate {
  /** Decision outcome being estimated */
  readonly outcome: string;

  /** Time impact (in hours) */
  readonly timeImpact: number;

  /** Resource cost impact */
  readonly costImpact: number;

  /** Quality/risk impact score (0-1) */
  readonly qualityImpact: number;

  /** Confidence in this estimate (0-1) */
  readonly confidence: number;
}

/**
 * Risk factor associated with a workflow gate decision
 */
export interface RiskFactor {
  /** Unique risk identifier */
  readonly id: string;

  /** Risk category */
  readonly category:
    | 'technical'
    | 'business'
    | 'compliance'
    | 'security'
    | 'operational';

  /** Risk severity */
  readonly severity: 'low' | 'medium' | 'high' | 'critical';

  /** Probability of risk occurring (0-1) */
  readonly probability: number;

  /** Risk description */
  readonly description: string;

  /** Mitigation strategies available */
  readonly mitigation?: string[];
}

/**
 * Record of a previous workflow decision for context
 */
export interface WorkflowDecisionRecord {
  /** When the decision was made */
  readonly timestamp: Date;

  /** Who made the decision */
  readonly decisionMaker: string;

  /** Step where decision was made */
  readonly stepName: string;

  /** Decision that was made */
  readonly decision: string;

  /** Rationale provided */
  readonly rationale?: string;

  /** Outcome/result of the decision */
  readonly outcome?: string;
}

// ============================================================================
// GATE ESCALATION TYPES - Decision escalation chains
// ============================================================================

/**
 * Escalation level for workflow gates
 */
export enum GateEscalationLevel {
  NONE = 0, // No escalation needed
  TEAM_LEAD = 1, // Escalate to team lead
  MANAGER = 2, // Escalate to manager
  DIRECTOR = 3, // Escalate to director
  EXECUTIVE = 4, // Escalate to executive level
  BOARD = 5, // Escalate to board level
}

/**
 * Escalation trigger conditions
 */
export interface EscalationTrigger {
  /** Condition type */
  readonly type:
    | 'timeout'
    | 'business_impact'
    | 'cost_threshold'
    | 'risk_level'
    | 'stakeholder_conflict';

  /** Threshold value for triggering escalation */
  readonly threshold: number | string;

  /** Time delay before escalating (in milliseconds) */
  readonly delay?: number;

  /** Whether to skip levels based on urgency */
  readonly skipLevels?: boolean;
}

/**
 * Escalation chain configuration
 */
export interface EscalationChain {
  /** Chain identifier */
  readonly id: string;

  /** Ordered list of escalation levels */
  readonly levels: EscalationLevel[];

  /** Conditions that trigger escalation */
  readonly triggers: EscalationTrigger[];

  /** Maximum escalation level allowed */
  readonly maxLevel: GateEscalationLevel;

  /** Whether to notify all levels when escalating */
  readonly notifyAllLevels?: boolean;
}

/**
 * Individual escalation level configuration
 */
export interface EscalationLevel {
  /** Level in the escalation chain */
  readonly level: GateEscalationLevel;

  /** Approvers at this level */
  readonly approvers: string[];

  /** Required number of approvals at this level */
  readonly requiredApprovals?: number;

  /** Time limit for decision at this level */
  readonly timeLimit?: number;

  /** Special permissions or context at this level */
  readonly permissions?: string[];

  /** Notification configuration */
  readonly notifications?: NotificationConfig;
}

/**
 * Notification configuration for escalations
 */
export interface NotificationConfig {
  /** Notification channels to use */
  readonly channels: ('email' | 'slack' | 'teams' | 'webhook' | 'sms')[];

  /** Notification priority */
  readonly priority: 'low' | 'normal' | 'high' | 'urgent';

  /** Follow-up notification intervals */
  readonly followUpIntervals?: number[];

  /** Custom notification templates */
  readonly templates?: Record<string, string>;
}

/**
 * Approval chain result
 */
export interface ApprovalChainResult {
  /** Whether the chain completed successfully */
  readonly completed: boolean;

  /** Final approval status */
  readonly approved: boolean;

  /** Level at which decision was made */
  readonly decisionLevel: GateEscalationLevel;

  /** Who made the final decision */
  readonly decisionMaker: string;

  /** Time taken for the approval process */
  readonly processingTime: number;

  /** All approvals collected during the process */
  readonly approvals: ApprovalRecord[];

  /** Any escalations that occurred */
  readonly escalations: EscalationRecord[];
}

/**
 * Individual approval record
 */
export interface ApprovalRecord {
  /** Who provided the approval */
  readonly approver: string;

  /** When the approval was given */
  readonly timestamp: Date;

  /** Approval decision */
  readonly decision: 'approve' | 'reject' | 'delegate' | 'escalate';

  /** Comments or rationale */
  readonly comments?: string;

  /** Escalation level of the approver */
  readonly level: GateEscalationLevel;

  /** Time taken to make decision */
  readonly responseTime: number;
}

/**
 * Escalation record
 */
export interface EscalationRecord {
  /** When the escalation occurred */
  readonly timestamp: Date;

  /** Why escalation was triggered */
  readonly reason: string;

  /** From which level to which level */
  readonly fromLevel: GateEscalationLevel;
  readonly toLevel: GateEscalationLevel;

  /** Who triggered the escalation */
  readonly triggeredBy?: string;

  /** Escalation trigger that fired */
  readonly trigger: EscalationTrigger;
}

// ============================================================================
// WORKFLOW GATE REQUEST NTERFACE - Extended ValidationQuestion
// ============================================================================

/**
 * Workflow gate request extending ValidationQuestion with workflow-specific context0.
 * Maintains full compatibility with existing AGUI validation system while adding
 * workflow orchestration capabilities0.
 */
export interface WorkflowGateRequest extends ValidationQuestion {
  /** Workflow-specific context information */
  readonly workflowContext: WorkflowContext;

  /** Required ValidationQuestion context property */
  readonly context: any;

  /** Escalation chain configuration for this gate */
  readonly escalationChain?: EscalationChain;

  /** Gate type for categorization and handling */
  readonly gateType:
    | 'approval'
    | 'checkpoint'
    | 'review'
    | 'decision'
    | 'escalation'
    | 'emergency';

  /** Required approval level for this gate */
  readonly requiredApprovalLevel?: GateEscalationLevel;

  /** Timeout configuration */
  readonly timeoutConfig?: {
    /** Initial timeout before escalation (ms) */
    readonly initialTimeout: number;
    /** Escalation timeout intervals (ms) */
    readonly escalationTimeouts: number[];
    /** Maximum total time allowed (ms) */
    readonly maxTotalTimeout: number;
  };

  /** Integration configuration with existing systems */
  readonly integrationConfig?: {
    /** Event bus correlation ID */
    readonly correlationId?: string;
    /** AGUI interface to use */
    readonly aguiInterface?: string;
    /** Domain validation requirements */
    readonly domainValidation?: boolean;
    /** Performance monitoring */
    readonly enableMetrics?: boolean;
  };

  /** Conditional logic for dynamic gate behavior */
  readonly conditionalLogic?: {
    /** Conditions that must be met before presenting gate */
    readonly prerequisites?: GateCondition[];
    /** Dynamic options based on context */
    readonly dynamicOptions?: (context: WorkflowContext) => string[];
    /** Auto-approval conditions */
    readonly autoApprovalConditions?: GateCondition[];
  };
}

/**
 * Gate condition for conditional logic
 */
export interface GateCondition {
  /** Condition identifier */
  readonly id: string;

  /** Condition type */
  readonly type:
    | 'workflow_state'
    | 'user_role'
    | 'time_constraint'
    | 'dependency'
    | 'risk_threshold'
    | 'custom';

  /** Condition operator */
  readonly operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'matches'
    | 'exists';

  /** Value to compare against */
  readonly value: any;

  /** Field or property to evaluate */
  readonly field: string;

  /** Whether this condition is required or optional */
  readonly required?: boolean;
}

// ============================================================================
// WORKFLOW GATE REQUEST SCHEMA - Runtime validation
// ============================================================================

/**
 * TypeSchema for WorkflowGateRequest runtime validation
 */
export const WorkflowGateRequestSchema: TypeSchema<WorkflowGateRequest> = {
  type: 'object',
  required: true,
  properties: {
    // ValidationQuestion base properties
    id: { type: 'string', required: true },
    type: {
      type: 'string',
      required: true,
      enum: [
        'relevance',
        'boundary',
        'relationship',
        'naming',
        'priority',
        'checkpoint',
        'review',
      ],
    },
    question: { type: 'string', required: true },
    context: { type: 'object', required: true },
    options: {
      type: 'array',
      required: false,
      items: { type: 'string' },
    },
    allowCustom: { type: 'boolean', required: false },
    confidence: { type: 'number', required: true },
    priority: {
      type: 'string',
      required: false,
      enum: ['critical', 'high', 'medium', 'low'],
    },
    validationReason: { type: 'string', required: false },
    expectedImpact: { type: 'number', required: false },

    // WorkflowGateRequest specific properties
    workflowContext: {
      type: 'object',
      required: true,
      properties: {
        workflowId: { type: 'string', required: true },
        stepName: { type: 'string', required: true },
        businessImpact: {
          type: 'string',
          required: true,
          enum: ['low', 'medium', 'high', 'critical'],
        },
        decisionScope: {
          type: 'string',
          required: true,
          enum: ['task', 'feature', 'epic', 'prd', 'portfolio'],
        },
        stakeholders: {
          type: 'array',
          required: true,
          items: { type: 'string' },
        },
        deadline: { type: 'object', required: false },
        dependencies: {
          type: 'array',
          required: false,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', required: true },
              type: {
                type: 'string',
                required: true,
                enum: [
                  'blocking',
                  'blocked_by',
                  'related',
                  'impacts',
                  'impacted_by',
                ],
              },
              reference: { type: 'string', required: true },
              criticality: {
                type: 'string',
                required: true,
                enum: ['low', 'medium', 'high', 'critical'],
              },
              description: { type: 'string', required: false },
            },
          },
        },
      },
    },

    gateType: {
      type: 'string',
      required: true,
      enum: [
        'approval',
        'checkpoint',
        'review',
        'decision',
        'escalation',
        'emergency',
      ],
    },

    requiredApprovalLevel: {
      type: 'number',
      required: false,
      enum: [0, 1, 2, 3, 4, 5], // GateEscalationLevel values
    },

    escalationChain: {
      type: 'object',
      required: false,
      properties: {
        id: { type: 'string', required: true },
        levels: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            properties: {
              level: { type: 'number', required: true },
              approvers: {
                type: 'array',
                required: true,
                items: { type: 'string' },
              },
              requiredApprovals: { type: 'number', required: false },
              timeLimit: { type: 'number', required: false },
            },
          },
        },
        triggers: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                required: true,
                enum: [
                  'timeout',
                  'business_impact',
                  'cost_threshold',
                  'risk_level',
                  'stakeholder_conflict',
                ],
              },
              threshold: { type: 'any', required: true },
              delay: { type: 'number', required: false },
              skipLevels: { type: 'boolean', required: false },
            },
          },
        },
        maxLevel: { type: 'number', required: true },
        notifyAllLevels: { type: 'boolean', required: false },
      },
    },

    timeoutConfig: {
      type: 'object',
      required: false,
      properties: {
        initialTimeout: { type: 'number', required: true },
        escalationTimeouts: {
          type: 'array',
          required: true,
          items: { type: 'number' },
        },
        maxTotalTimeout: { type: 'number', required: true },
      },
    },

    integrationConfig: {
      type: 'object',
      required: false,
      properties: {
        correlationId: { type: 'string', required: false },
        aguiInterface: { type: 'string', required: false },
        domainValidation: { type: 'boolean', required: false },
        enableMetrics: { type: 'boolean', required: false },
      },
    },

    conditionalLogic: {
      type: 'object',
      required: false,
      properties: {
        prerequisites: {
          type: 'array',
          required: false,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', required: true },
              type: {
                type: 'string',
                required: true,
                enum: [
                  'workflow_state',
                  'user_role',
                  'time_constraint',
                  'dependency',
                  'risk_threshold',
                  'custom',
                ],
              },
              operator: {
                type: 'string',
                required: true,
                enum: [
                  'equals',
                  'not_equals',
                  'greater_than',
                  'less_than',
                  'contains',
                  'matches',
                  'exists',
                ],
              },
              value: { type: 'any', required: true },
              field: { type: 'string', required: true },
              required: { type: 'boolean', required: false },
            },
          },
        },
        autoApprovalConditions: {
          type: 'array',
          required: false,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', required: true },
              type: { type: 'string', required: true },
              operator: { type: 'string', required: true },
              value: { type: 'any', required: true },
              field: { type: 'string', required: true },
              required: { type: 'boolean', required: false },
            },
          },
        },
      },
    },
  },
};

// ============================================================================
// WORKFLOW GATE REQUEST PROCESSOR - Main orchestration class
// ============================================================================

/**
 * Workflow Gate Request Processor - Lightweight facade using WorkflowEngine + TaskApprovalSystem
 *
 * This facade maintains API compatibility while delegating workflow gate request processing,
 * escalation chain management, and approval workflows to the comprehensive
 * WorkflowEngine and TaskApprovalSystem from @claude-zen/intelligence and @claude-zen/enterprise packages0.
 *
 * Key features provided by packages:
 * - WorkflowEngine with XState state management and Mermaid visualization
 * - TaskApprovalSystem for human-in-the-loop workflows
 * - Comprehensive escalation chain processing
 * - Type-safe workflow orchestration
 * - Battle-tested dependencies (expr-eval, async, p-limit, eventemitter3, xstate, mermaid, node-cron)
 * - Auto-scaling workflow capacity and approval routing
 * - Real-time workflow monitoring and analytics
 */
export class WorkflowGateRequestProcessor extends TypedEventBase {
  private readonly logger: Logger;
  private readonly domainValidator: DomainBoundaryValidator;
  private readonly workflowEngine: WorkflowEngine;
  private readonly taskApprovalSystem: TaskApprovalSystem;
  private readonly pendingGates = new Map<string, PendingGateRequest>();
  private readonly escalationTimers = new Map<string, NodeJS0.Timeout>();
  private gateCounter = 0;

  constructor(
    private readonly eventBus: TypeSafeEventBus,
    private readonly aguiInterface: AGUIInterface,
    private readonly settings: WorkflowGateProcessorConfig = {}
  ) {
    super();

    this0.logger = getLogger('workflow-gate-processor');
    this0.domainValidator = getDomainValidator(Domain0.WORKFLOWS);
    this0.workflowEngine = container0.resolve(WorkflowEngine);
    this0.taskApprovalSystem = container0.resolve(TaskApprovalSystem);

    this0.settings = {
      enableMetrics: true,
      enableDomainValidation: true,
      defaultTimeout: 300000, // 5 minutes
      maxEscalationLevel: GateEscalationLevel0.EXECUTIVE,
      enableAutoApproval: true,
      0.0.0.config,
    };

    this?0.initializeEventHandlers;
  }

  // ============================================================================
  // PUBLIC API - Core workflow gate operations
  // ============================================================================

  /**
   * Process a workflow gate request using WorkflowEngine + TaskApprovalSystem
   */
  async processWorkflowGate(
    gateRequest: WorkflowGateRequest,
    options: {
      skipValidation?: boolean;
      timeout?: number;
      escalationOverride?: EscalationChain;
    } = {}
  ): Promise<WorkflowGateResult> {
    const startTime = Date0.now();
    const correlationId =
      gateRequest0.integrationConfig?0.correlationId || createCorrelationId();

    this0.logger0.info(
      'Processing workflow gate request via WorkflowEngine + TaskApprovalSystem',
      {
        gateId: gateRequest0.id,
        workflowId: gateRequest0.workflowContext0.workflowId,
        stepName: gateRequest0.workflowContext0.stepName,
        gateType: gateRequest0.gateType,
        businessImpact: gateRequest0.workflowContext0.businessImpact,
        correlationId,
      }
    );

    try {
      // 10. Validate using packages if needed
      if (!options0.skipValidation && this0.settings0.enableDomainValidation) {
        const validationResult = await this0.validateGateRequest(gateRequest);
        if (!validationResult0.success) {
          throw new Error(
            `Gate validation failed: ${validationResult0.error?0.message}`
          );
        }
      }

      // 20. Convert gate request to workflow definition for WorkflowEngine
      const workflowDefinition =
        await this0.convertGateToWorkflowDefinition(gateRequest);

      // 30. Use TaskApprovalSystem for approval workflow
      const approvalRequest =
        await this0.convertGateToApprovalRequest(gateRequest);

      // 40. Execute workflow with approval integration
      const workflowExecution = await this0.workflowEngine0.executeWorkflow(
        workflowDefinition,
        {
          correlationId,
          context: gateRequest0.workflowContext,
        }
      );

      // 50. Process approval through TaskApprovalSystem
      const approvalResult =
        await this0.taskApprovalSystem0.requestApproval(approvalRequest);

      // 60. Combine results from both systems
      const finalResult = await this0.combineWorkflowAndApprovalResults(
        gateRequest,
        workflowExecution,
        approvalResult,
        startTime,
        correlationId
      );

      // 70. Emit events through packages
      await this0.emitGateOpenedEvent(gateRequest, correlationId);
      await this0.emitGateClosedEvent(gateRequest, finalResult, correlationId);

      // 80. Cleanup
      this0.cleanup(gateRequest0.id);

      this0.logger0.info(
        'Workflow gate processing completed via WorkflowEngine + TaskApprovalSystem',
        {
          gateId: gateRequest0.id,
          approved: finalResult0.approved,
          escalationLevel: finalResult0.escalationLevel,
          processingTime: Date0.now() - startTime,
          correlationId,
        }
      );

      return finalResult;
    } catch (error) {
      this0.logger0.error('Workflow gate processing failed', {
        gateId: gateRequest0.id,
        error: error instanceof Error ? error0.message : String(error),
        correlationId,
      });

      // Cleanup on error
      this0.cleanup(gateRequest0.id);

      return {
        success: false,
        gateId: gateRequest0.id,
        approved: false,
        processingTime: Date0.now() - startTime,
        error: error instanceof Error ? error : new Error(String(error)),
        escalationLevel: GateEscalationLevel0.NONE,
        correlationId,
      };
    }
  }

  /**
   * Create a workflow gate request from basic parameters
   */
  createWorkflowGateRequest(
    workflowId: string,
    stepName: string,
    gateType: WorkflowGateRequest['gateType'],
    question: string,
    context: any,
    workflowContext: Partial<WorkflowContext>,
    options: {
      priority?: ValidationQuestion['priority'];
      expectedImpact?: number;
      escalationChain?: EscalationChain;
      timeoutConfig?: WorkflowGateRequest['timeoutConfig'];
      integrationConfig?: WorkflowGateRequest['integrationConfig'];
    } = {}
  ): WorkflowGateRequest {
    const gateId = `gate-${Date0.now()}-${++this0.gateCounter}`;

    const fullWorkflowContext: WorkflowContext = {
      workflowId,
      stepName,
      businessImpact: 'medium',
      decisionScope: 'task',
      stakeholders: [],
      0.0.0.workflowContext,
    };

    return {
      // ValidationQuestion base properties
      id: gateId,
      type: 'checkpoint',
      question,
      context,
      confidence: 0.8,
      priority: options0.priority || 'medium',
      validationReason: `Workflow gate for ${stepName}`,
      expectedImpact: options0.expectedImpact || 0.1,

      // WorkflowGateRequest specific properties
      workflowContext: fullWorkflowContext,
      gateType,
      escalationChain: options0.escalationChain,
      timeoutConfig: options0.timeoutConfig,
      integrationConfig: options0.integrationConfig,
    };
  }

  /**
   * Get status of all pending gates
   */
  getPendingGates(): Map<string, PendingGateRequest> {
    return new Map(this0.pendingGates);
  }

  /**
   * Cancel a pending gate request
   */
  async cancelGate(gateId: string, reason: string): Promise<boolean> {
    const pendingGate = this0.pendingGates0.get(gateId);
    if (!pendingGate) {
      return false;
    }

    this0.logger0.info('Canceling workflow gate', { gateId, reason });

    // Clear any escalation timers
    this0.clearEscalationTimers(gateId);

    // Mark as cancelled
    pendingGate0.status = 'cancelled';

    // Emit gate closed event with cancellation
    await this0.emitGateClosedEvent(
      pendingGate0.gateRequest,
      {
        success: false,
        gateId,
        approved: false,
        processingTime: Date0.now() - pendingGate0.startTime?0.getTime,
        escalationLevel: pendingGate0.currentLevel,
        error: new Error(`Gate cancelled: ${reason}`),
        correlationId: pendingGate0.correlationId,
      },
      pendingGate0.correlationId
    );

    // Cleanup
    this0.cleanup(gateId);

    return true;
  }

  // ============================================================================
  // PRIVATE MPLEMENTATION METHODS
  // ============================================================================

  private async validateGateRequest(
    gateRequest: WorkflowGateRequest
  ): Promise<Result<WorkflowGateRequest>> {
    try {
      // Validate using domain boundary validator with schema
      const validatedRequest = this0.domainValidator0.validateInput(
        gateRequest,
        WorkflowGateRequestSchema
      );

      // Additional business logic validation
      if (
        gateRequest0.workflowContext0.stakeholders0.length === 0 &&
        gateRequest0.gateType !== 'emergency'
      ) {
        return {
          success: false,
          error: new Error('Stakeholders are required for non-emergency gates'),
        };
      }

      if (
        gateRequest0.workflowContext0.deadline &&
        gateRequest0.workflowContext0.deadline < new Date()
      ) {
        return {
          success: false,
          error: new Error('Gate deadline has already passed'),
        };
      }

      return {
        success: true,
        data: validatedRequest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Convert gate request to WorkflowEngine definition
   */
  private async convertGateToWorkflowDefinition(
    gateRequest: WorkflowGateRequest
  ): Promise<any> {
    return {
      id: `gate-workflow-${gateRequest0.id}`,
      name: `Gate: ${gateRequest0.workflowContext0.stepName}`,
      steps: [
        {
          id: 'validate',
          type: 'condition',
          name: 'Validate Prerequisites',
          condition: async (context: any) => {
            return await this0.checkPrerequisites(gateRequest);
          },
        },
        {
          id: 'approval',
          type: 'approval',
          name: 'Request Approval',
          approvalType: gateRequest0.gateType,
          escalationChain: gateRequest0.escalationChain,
        },
        {
          id: 'complete',
          type: 'completion',
          name: 'Complete Gate Processing',
        },
      ],
      context: gateRequest0.workflowContext,
    };
  }

  /**
   * Convert gate request to TaskApprovalSystem request
   */
  private async convertGateToApprovalRequest(
    gateRequest: WorkflowGateRequest
  ): Promise<any> {
    return {
      taskType: gateRequest0.gateType,
      description: gateRequest0.question,
      context: {
        workflowId: gateRequest0.workflowContext0.workflowId,
        stepName: gateRequest0.workflowContext0.stepName,
        businessImpact: gateRequest0.workflowContext0.businessImpact,
        stakeholders: gateRequest0.workflowContext0.stakeholders,
        gateRequest: gateRequest,
      },
      priority: gateRequest0.priority,
      timeout:
        gateRequest0.timeoutConfig?0.initialTimeout ||
        this0.settings0.defaultTimeout,
      escalationChain: gateRequest0.escalationChain,
    };
  }

  /**
   * Combine results from WorkflowEngine and TaskApprovalSystem
   */
  private async combineWorkflowAndApprovalResults(
    gateRequest: WorkflowGateRequest,
    workflowResult: any,
    approvalResult: any,
    startTime: number,
    correlationId: string
  ): Promise<WorkflowGateResult> {
    return {
      success: workflowResult0.success && approvalResult0.success,
      gateId: gateRequest0.id,
      approved: approvalResult0.approved || false,
      processingTime: Date0.now() - startTime,
      escalationLevel:
        approvalResult0.escalationLevel || GateEscalationLevel0.NONE,
      decisionMaker: approvalResult0.decisionMaker || 'system',
      autoApproved: approvalResult0.autoApproved,
      approvalChain: approvalResult0.approvalChain,
      correlationId,
    };
  }

  private async checkPrerequisites(gateRequest: WorkflowGateRequest): Promise<{
    met: boolean;
    missing: string[];
  }> {
    // Use WorkflowEngine's condition evaluation
    const prerequisites = gateRequest0.conditionalLogic?0.prerequisites || [];
    const missing: string[] = [];

    for (const prerequisite of prerequisites) {
      const result = await this0.workflowEngine0.evaluateCondition(
        prerequisite,
        gateRequest0.workflowContext
      );
      if (!result && prerequisite0.required !== false) {
        missing0.push(prerequisite0.id);
      }
    }

    return {
      met: missing0.length === 0,
      missing,
    };
  }

  /**
   * Simplified helper methods delegating to packages
   */
  private getFieldValue(context: WorkflowContext, field: string): any {
    return this0.workflowEngine0.getContextValue(context, field);
  }

  private summarizeContext(context: WorkflowContext): any {
    return this0.workflowEngine0.summarizeContext(context);
  }

  /**
   * Create default escalation chain using TaskApprovalSystem patterns
   */
  private createDefaultEscalationChain(
    gateRequest: WorkflowGateRequest
  ): EscalationChain {
    // Use TaskApprovalSystem to generate appropriate escalation chain
    return this0.taskApprovalSystem0.createEscalationChain({
      businessImpact: gateRequest0.workflowContext0.businessImpact,
      gateType: gateRequest0.gateType,
      stakeholders: gateRequest0.workflowContext0.stakeholders,
      deadline: gateRequest0.workflowContext0.deadline,
      maxLevel:
        this0.settings0.maxEscalationLevel || GateEscalationLevel0.EXECUTIVE,
    });
  }

  /**
   * Process escalation chain using TaskApprovalSystem
   */
  private async processEscalationChain(
    gateId: string,
    initialResult: HumanValidationResult,
    escalationChain: EscalationChain
  ): Promise<WorkflowGateResult> {
    const pendingGate = this0.pendingGates0.get(gateId);
    if (!pendingGate) {
      throw new Error(`Pending gate not found: ${gateId}`);
    }

    // If initially approved, we're done
    if (initialResult0.approved) {
      return {
        success: true,
        gateId,
        approved: true,
        processingTime: initialResult0.processingTime,
        escalationLevel: initialResult0.level,
        decisionMaker: initialResult0.approver,
        correlationId: pendingGate0.correlationId,
      };
    }

    // Use TaskApprovalSystem to process the escalation chain
    const escalationResult = await this0.taskApprovalSystem0.processEscalation({
      gateId,
      escalationChain,
      initialResult,
      context: pendingGate0.gateRequest0.workflowContext,
    });

    // Clear any remaining timers
    this0.clearEscalationTimers(gateId);

    return {
      success: true,
      gateId,
      approved: escalationResult0.approved,
      processingTime: Date0.now() - pendingGate0.startTime?0.getTime,
      escalationLevel: escalationResult0.finalLevel,
      decisionMaker: escalationResult0.decisionMaker,
      approvalChain: escalationResult0.approvalChain,
      correlationId: pendingGate0.correlationId,
    };
  }

  private async emitGateOpenedEvent(
    gateRequest: WorkflowGateRequest,
    correlationId: string
  ): Promise<void> {
    const gateOpenedEvent: AGUIGateOpenedEvent = createEvent(
      'agui0.gate0.opened',
      Domain0.NTERFACES,
      {
        payload: {
          gateId: gateRequest0.id,
          gateType: gateRequest0.gateType,
          requiredApproval: gateRequest0.gateType !== 'checkpoint',
          context: {
            workflowContext: gateRequest0.workflowContext,
            question: gateRequest0.question,
            businessImpact: gateRequest0.workflowContext0.businessImpact,
          },
        },
      },
      { correlationId, source: 'workflow-gate-processor' }
    );

    const result = await this0.eventBus0.emitEvent(gateOpenedEvent);
    if (!result0.success) {
      this0.logger0.warn('Failed to emit gate opened event', {
        gateId: gateRequest0.id,
        error: result0.error?0.message,
      });
    }
  }

  private async emitGateClosedEvent(
    gateRequest: WorkflowGateRequest,
    result: WorkflowGateResult,
    correlationId: string
  ): Promise<void> {
    const gateClosedEvent: AGUIGateClosedEvent = createEvent(
      'agui0.gate0.closed',
      Domain0.NTERFACES,
      {
        payload: {
          gateId: gateRequest0.id,
          approved: result0.approved,
          duration: result0.processingTime,
          humanInput: {
            escalationLevel: result0.escalationLevel,
            decisionMaker: result0.decisionMaker,
            approvalChain: result0.approvalChain,
          },
        },
      },
      { correlationId, causationId: `gate-${gateRequest0.id}` }
    );

    const eventResult = await this0.eventBus0.emitEvent(gateClosedEvent);
    if (!eventResult0.success) {
      this0.logger0.warn('Failed to emit gate closed event', {
        gateId: gateRequest0.id,
        error: eventResult0.error?0.message,
      });
    }
  }

  private initializeEventHandlers(): void {
    // Listen for human validation completion events
    this0.eventBus0.registerHandler(
      'human0.validation0.completed',
      async (event: HumanValidationCompletedEvent) => {
        const { requestId, approved, feedback } = event0.payload;

        // Check if this is for one of our gates
        const gateId = requestId0.replace('gate-', '');
        const pendingGate = this0.pendingGates0.get(gateId);

        if (pendingGate) {
          this0.logger0.debug('Received validation completion for gate', {
            gateId,
            approved,
            feedback,
          });

          // Emit internal event for gate processing
          this0.emit('validation-completed', {
            gateId,
            approved,
            feedback,
            processingTime: event0.payload0.processingTime,
          });
        }
      }
    );
  }

  private setEscalationTimer(
    gateId: string,
    timeLimit: number,
    level: GateEscalationLevel
  ): void {
    const timerId = setTimeout(() => {
      this0.logger0.info('Escalation timer triggered', { gateId, level });
      this0.emit('escalation-timeout', { gateId, level });
    }, timeLimit);

    // Store timer for cleanup
    const timerKey = `${gateId}-${level}`;
    this0.escalationTimers0.set(timerKey, timerId);
  }

  private clearEscalationTimers(gateId: string): void {
    // Clear all timers for this gate
    for (const [key, timerId] of this0.escalationTimers?0.entries) {
      if (key0.startsWith(gateId)) {
        clearTimeout(timerId);
        this0.escalationTimers0.delete(key);
      }
    }
  }

  private cleanup(gateId: string): void {
    this0.pendingGates0.delete(gateId);
    this0.clearEscalationTimers(gateId);
  }

  private interpretResponse(response: string): boolean {
    const positiveResponses = [
      'yes',
      'approve',
      'approved',
      'accept',
      'ok',
      'continue',
      '1',
    ];
    return positiveResponses0.some((pos) => response?0.toLowerCase0.includes(pos));
  }

  private mapPriorityToEventPriority(priority?: string): EventPriority {
    switch (priority) {
      case 'critical':
        return EventPriority0.CRITICAL;
      case 'high':
        return EventPriority0.HIGH;
      case 'medium':
        return EventPriority0.NORMAL;
      case 'low':
        return EventPriority0.LOW;
      default:
        return EventPriority0.NORMAL;
    }
  }
}

// ============================================================================
// SUPPORTING TYPES AND NTERFACES
// ============================================================================

/**
 * Configuration for WorkflowGateRequestProcessor
 */
export interface WorkflowGateProcessorConfig {
  enableMetrics?: boolean;
  enableDomainValidation?: boolean;
  defaultTimeout?: number;
  maxEscalationLevel?: GateEscalationLevel;
  enableAutoApproval?: boolean;
}

/**
 * Pending gate request tracking
 */
interface PendingGateRequest {
  gateRequest: WorkflowGateRequest;
  escalationChain: EscalationChain;
  correlationId: string;
  startTime: Date;
  currentLevel: GateEscalationLevel;
  approvals: ApprovalRecord[];
  escalations: EscalationRecord[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
}

/**
 * Human validation result
 */
interface HumanValidationResult {
  approved: boolean;
  response: string;
  processingTime: number;
  level: GateEscalationLevel;
  approver: string;
}

/**
 * Workflow gate processing result
 */
export interface WorkflowGateResult {
  success: boolean;
  gateId: string;
  approved: boolean;
  processingTime: number;
  escalationLevel: GateEscalationLevel;
  decisionMaker?: string;
  error?: Error;
  autoApproved?: boolean;
  approvalChain?: ApprovalChainResult;
  correlationId: string;
}

// ============================================================================
// FACTORY FUNCTIONS - Convenience functions for common usage
// ============================================================================

/**
 * Create a simple approval gate
 */
export function createApprovalGate(
  workflowId: string,
  stepName: string,
  question: string,
  stakeholders: string[],
  options: {
    businessImpact?: WorkflowContext['businessImpact'];
    deadline?: Date;
    priority?: ValidationQuestion['priority'];
  } = {}
): WorkflowGateRequest {
  const gateId = `gate-${Date0.now()}-${Math0.random()0.toString(36)0.substr(2, 9)}`;

  const fullWorkflowContext: WorkflowContext = {
    workflowId,
    stepName,
    businessImpact: options0.businessImpact || 'medium',
    decisionScope: 'task',
    stakeholders,
    deadline: options0.deadline,
  };

  return {
    // ValidationQuestion base properties
    id: gateId,
    type: 'checkpoint',
    question,
    context: { type: 'approval_request' },
    confidence: 0.8,
    priority: options0.priority || 'medium',
    validationReason: `Workflow gate for ${stepName}`,
    expectedImpact: 0.1,

    // WorkflowGateRequest specific properties
    workflowContext: fullWorkflowContext,
    gateType: 'approval',
  };
}

/**
 * Create a checkpoint gate for workflow progress validation
 */
export function createCheckpointGate(
  workflowId: string,
  stepName: string,
  checkpointData: any,
  options: {
    autoApprovalThreshold?: number;
    businessImpact?: WorkflowContext['businessImpact'];
  } = {}
): WorkflowGateRequest {
  const gateId = `gate-${Date0.now()}-${Math0.random()0.toString(36)0.substr(2, 9)}`;

  const autoApprovalConditions: GateCondition[] = [];
  if (options0.autoApprovalThreshold) {
    autoApprovalConditions0.push({
      id: 'confidence_threshold',
      type: 'custom',
      operator: 'greater_than',
      field: 'confidence',
      value: options0.autoApprovalThreshold,
    });
  }

  const fullWorkflowContext: WorkflowContext = {
    workflowId,
    stepName,
    businessImpact: options0.businessImpact || 'low',
    decisionScope: 'task',
    stakeholders: ['system'],
  };

  return {
    // ValidationQuestion base properties
    id: gateId,
    type: 'checkpoint',
    question: `Checkpoint reached: ${stepName}0. Continue?`,
    context: checkpointData,
    confidence: 0.8,
    priority: 'medium',
    validationReason: `Workflow gate for ${stepName}`,
    expectedImpact: 0.1,

    // WorkflowGateRequest specific properties
    workflowContext: fullWorkflowContext,
    gateType: 'checkpoint',
    conditionalLogic: {
      autoApprovalConditions:
        autoApprovalConditions0.length > 0 ? autoApprovalConditions : undefined,
    },
    integrationConfig: {
      domainValidation: true,
      enableMetrics: true,
    },
  };
}

/**
 * Create an emergency gate for critical decisions
 */
export function createEmergencyGate(
  workflowId: string,
  stepName: string,
  emergencyContext: any,
  stakeholders: string[]
): WorkflowGateRequest {
  const gateId = `gate-${Date0.now()}-${Math0.random()0.toString(36)0.substr(2, 9)}`;

  const escalationChain: EscalationChain = {
    id: `emergency-${workflowId}-${stepName}`,
    levels: [
      {
        level: GateEscalationLevel0.MANAGER,
        approvers: stakeholders0.slice(0, 1),
        requiredApprovals: 1,
        timeLimit: 300000, // 5 minutes
      },
      {
        level: GateEscalationLevel0.DIRECTOR,
        approvers: stakeholders0.slice(1, 2),
        requiredApprovals: 1,
        timeLimit: 600000, // 10 minutes
      },
      {
        level: GateEscalationLevel0.EXECUTIVE,
        approvers: stakeholders0.slice(2),
        requiredApprovals: 1,
        timeLimit: 900000, // 15 minutes
      },
    ],
    triggers: [
      {
        type: 'timeout',
        threshold: 'time_limit',
        delay: 0,
        skipLevels: true,
      },
    ],
    maxLevel: GateEscalationLevel0.EXECUTIVE,
    notifyAllLevels: true,
  };

  const fullWorkflowContext: WorkflowContext = {
    workflowId,
    stepName,
    businessImpact: 'critical',
    decisionScope: 'portfolio',
    stakeholders,
    deadline: new Date(Date0.now() + 1800000), // 30 minutes from now
  };

  return {
    // ValidationQuestion base properties
    id: gateId,
    type: 'checkpoint',
    question: 'EMERGENCY: Immediate decision required',
    context: emergencyContext,
    confidence: 0.8,
    priority: 'critical',
    validationReason: `Workflow gate for ${stepName}`,
    expectedImpact: 0.9,

    // WorkflowGateRequest specific properties
    workflowContext: fullWorkflowContext,
    gateType: 'emergency',
    escalationChain,
    timeoutConfig: {
      initialTimeout: 300000, // 5 minutes
      escalationTimeouts: [300000, 600000, 900000],
      maxTotalTimeout: 1800000, // 30 minutes total
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default WorkflowGateRequestProcessor;

export type {
  WorkflowContext,
  WorkflowDependency,
  ImpactEstimate,
  RiskFactor,
  WorkflowDecisionRecord,
  EscalationChain,
  EscalationLevel,
  EscalationTrigger,
  EscalationRecord,
  ApprovalRecord,
  ApprovalChainResult,
  GateCondition,
  WorkflowGateRequest,
  WorkflowGateResult,
  WorkflowGateProcessorConfig,
  NotificationConfig,
};
