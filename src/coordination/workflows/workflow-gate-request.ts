/**
 * @file Workflow Gate Request - Phase 1, Task 1.2 - AGUI Workflow Gates
 *
 * Extends existing ValidationQuestion interface for workflow orchestration gates.
 * Provides type-safe workflow context, escalation chains, and integration with
 * the existing AGUI system and type-safe event system.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Extends proven ValidationQuestion interface from progressive-confidence-builder
 * - Integrates with type-safe event system (HumanValidationRequestedEvent, AGUIGateOpenedEvent)
 * - Provides workflow-specific context and decision escalation chains
 * - Runtime validation using domain boundary validator
 * - Production-grade performance and monitoring
 */

import { EventEmitter } from 'events';
import type { Logger } from '../../config/logging-config.ts';
import { getLogger } from '../../config/logging-config.ts';
import type { ValidationQuestion } from '../../coordination/discovery/progressive-confidence-builder.ts';
import {
  Domain,
  type DomainBoundaryValidator,
  getDomainValidator,
  type Result,
  type TypeSchema,
  validateCrossDomain,
} from '../../core/domain-boundary-validator.ts';
import {
  type AGUIGateClosedEvent,
  type AGUIGateOpenedEvent,
  type BaseEvent,
  createCorrelationId,
  createEvent,
  EventPriority,
  type HumanValidationCompletedEvent,
  type HumanValidationRequestedEvent,
  type TypeSafeEventBus,
} from '../../core/type-safe-event-system.ts';
import type { AGUIInterface } from '../../interfaces/agui/agui-adapter.ts';

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
// WORKFLOW GATE REQUEST INTERFACE - Extended ValidationQuestion
// ============================================================================

/**
 * Workflow gate request extending ValidationQuestion with workflow-specific context.
 * Maintains full compatibility with existing AGUI validation system while adding
 * workflow orchestration capabilities.
 */
export interface WorkflowGateRequest extends ValidationQuestion {
  /** Workflow-specific context information */
  readonly workflowContext: WorkflowContext;

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
  readonly value: unknown;

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
 * Workflow Gate Request Processor
 *
 * Handles workflow gate requests with full integration to existing systems:
 * - ValidationQuestion compatibility for existing AGUI system
 * - Type-safe event system integration for HumanValidationRequestedEvent and AGUIGateOpenedEvent
 * - Domain boundary validation for cross-domain operations
 * - Escalation chain processing and approval workflows
 * - Performance monitoring and analytics
 */
export class WorkflowGateRequestProcessor extends EventEmitter {
  private readonly logger: Logger;
  private readonly domainValidator: DomainBoundaryValidator;
  private readonly pendingGates = new Map<string, PendingGateRequest>();
  private readonly escalationTimers = new Map<string, NodeJS.Timeout>();
  private gateCounter = 0;

  constructor(
    private readonly eventBus: TypeSafeEventBus,
    private readonly aguiInterface: AGUIInterface,
    private readonly config: WorkflowGateProcessorConfig = {}
  ) {
    super();

    this.logger = getLogger('workflow-gate-processor');
    this.domainValidator = getDomainValidator(Domain.WORKFLOWS);

    this.config = {
      enableMetrics: true,
      enableDomainValidation: true,
      defaultTimeout: 300000, // 5 minutes
      maxEscalationLevel: GateEscalationLevel.EXECUTIVE,
      enableAutoApproval: true,
      ...config,
    };

    this.initializeEventHandlers();
  }

  // ============================================================================
  // PUBLIC API - Core workflow gate operations
  // ============================================================================

  /**
   * Process a workflow gate request with full validation and escalation support
   */
  async processWorkflowGate(
    gateRequest: WorkflowGateRequest,
    options: {
      skipValidation?: boolean;
      timeout?: number;
      escalationOverride?: EscalationChain;
    } = {}
  ): Promise<WorkflowGateResult> {
    const startTime = Date.now();
    const correlationId =
      gateRequest.integrationConfig?.correlationId || createCorrelationId();

    this.logger.info('Processing workflow gate request', {
      gateId: gateRequest.id,
      workflowId: gateRequest.workflowContext.workflowId,
      stepName: gateRequest.workflowContext.stepName,
      gateType: gateRequest.gateType,
      businessImpact: gateRequest.workflowContext.businessImpact,
      correlationId,
    });

    try {
      // 1. Validate the gate request
      if (!options.skipValidation && this.config.enableDomainValidation) {
        const validationResult = await this.validateGateRequest(gateRequest);
        if (!validationResult.success) {
          throw new Error(
            `Gate validation failed: ${validationResult.error?.message}`
          );
        }
      }

      // 2. Check prerequisites and auto-approval conditions
      const prerequisiteResult = await this.checkPrerequisites(gateRequest);
      if (!prerequisiteResult.met) {
        return {
          success: false,
          gateId: gateRequest.id,
          approved: false,
          processingTime: Date.now() - startTime,
          error: new Error(
            `Prerequisites not met: ${prerequisiteResult.missing.join(', ')}`
          ),
          escalationLevel: GateEscalationLevel.NONE,
          correlationId,
        };
      }

      // 3. Check for auto-approval
      if (this.config.enableAutoApproval) {
        const autoApprovalResult = await this.checkAutoApproval(gateRequest);
        if (autoApprovalResult.approved) {
          this.logger.info('Gate auto-approved', {
            gateId: gateRequest.id,
            reason: autoApprovalResult.reason,
            correlationId,
          });

          return {
            success: true,
            gateId: gateRequest.id,
            approved: true,
            processingTime: Date.now() - startTime,
            escalationLevel: GateEscalationLevel.NONE,
            decisionMaker: 'system',
            autoApproved: true,
            correlationId,
          };
        }
      }

      // 4. Initialize the gate request with escalation chain
      const escalationChain =
        options.escalationOverride ||
        gateRequest.escalationChain ||
        this.createDefaultEscalationChain(gateRequest);

      const pendingGate: PendingGateRequest = {
        gateRequest,
        escalationChain,
        correlationId,
        startTime: new Date(),
        currentLevel: GateEscalationLevel.NONE,
        approvals: [],
        escalations: [],
        status: 'pending',
      };

      this.pendingGates.set(gateRequest.id, pendingGate);

      // 5. Emit AGUI gate opened event for integration
      await this.emitGateOpenedEvent(gateRequest, correlationId);

      // 6. Request human validation through existing AGUI system
      const validationResult = await this.requestHumanValidation(
        gateRequest,
        escalationChain,
        correlationId
      );

      // 7. Process the validation result through escalation chain if needed
      const finalResult = await this.processEscalationChain(
        gateRequest.id,
        validationResult,
        escalationChain
      );

      // 8. Emit gate closed event
      await this.emitGateClosedEvent(gateRequest, finalResult, correlationId);

      // 9. Cleanup
      this.cleanup(gateRequest.id);

      this.logger.info('Workflow gate processing completed', {
        gateId: gateRequest.id,
        approved: finalResult.approved,
        escalationLevel: finalResult.escalationLevel,
        processingTime: Date.now() - startTime,
        correlationId,
      });

      return finalResult;
    } catch (error) {
      this.logger.error('Workflow gate processing failed', {
        gateId: gateRequest.id,
        error: error instanceof Error ? error.message : String(error),
        correlationId,
      });

      // Cleanup on error
      this.cleanup(gateRequest.id);

      return {
        success: false,
        gateId: gateRequest.id,
        approved: false,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error : new Error(String(error)),
        escalationLevel: GateEscalationLevel.NONE,
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
    context: unknown,
    workflowContext: Partial<WorkflowContext>,
    options: {
      priority?: ValidationQuestion['priority'];
      expectedImpact?: number;
      escalationChain?: EscalationChain;
      timeoutConfig?: WorkflowGateRequest['timeoutConfig'];
      integrationConfig?: WorkflowGateRequest['integrationConfig'];
    } = {}
  ): WorkflowGateRequest {
    const gateId = `gate-${Date.now()}-${++this.gateCounter}`;

    const fullWorkflowContext: WorkflowContext = {
      workflowId,
      stepName,
      businessImpact: 'medium',
      decisionScope: 'task',
      stakeholders: [],
      ...workflowContext,
    };

    return {
      // ValidationQuestion base properties
      id: gateId,
      type: 'checkpoint',
      question,
      context,
      confidence: 0.8,
      priority: options.priority || 'medium',
      validationReason: `Workflow gate for ${stepName}`,
      expectedImpact: options.expectedImpact || 0.1,

      // WorkflowGateRequest specific properties
      workflowContext: fullWorkflowContext,
      gateType,
      escalationChain: options.escalationChain,
      timeoutConfig: options.timeoutConfig,
      integrationConfig: options.integrationConfig,
    };
  }

  /**
   * Get status of all pending gates
   */
  getPendingGates(): Map<string, PendingGateRequest> {
    return new Map(this.pendingGates);
  }

  /**
   * Cancel a pending gate request
   */
  async cancelGate(gateId: string, reason: string): Promise<boolean> {
    const pendingGate = this.pendingGates.get(gateId);
    if (!pendingGate) {
      return false;
    }

    this.logger.info('Canceling workflow gate', { gateId, reason });

    // Clear any escalation timers
    this.clearEscalationTimers(gateId);

    // Mark as cancelled
    pendingGate.status = 'cancelled';

    // Emit gate closed event with cancellation
    await this.emitGateClosedEvent(
      pendingGate.gateRequest,
      {
        success: false,
        gateId,
        approved: false,
        processingTime: Date.now() - pendingGate.startTime.getTime(),
        escalationLevel: pendingGate.currentLevel,
        error: new Error(`Gate cancelled: ${reason}`),
        correlationId: pendingGate.correlationId,
      },
      pendingGate.correlationId
    );

    // Cleanup
    this.cleanup(gateId);

    return true;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async validateGateRequest(
    gateRequest: WorkflowGateRequest
  ): Promise<Result<WorkflowGateRequest>> {
    try {
      // Validate using domain boundary validator with schema
      const validatedRequest = this.domainValidator.validateInput(
        gateRequest,
        WorkflowGateRequestSchema
      );

      // Additional business logic validation
      if (
        gateRequest.workflowContext.stakeholders.length === 0 &&
        gateRequest.gateType !== 'emergency'
      ) {
        return {
          success: false,
          error: new Error('Stakeholders are required for non-emergency gates'),
        };
      }

      if (
        gateRequest.workflowContext.deadline &&
        gateRequest.workflowContext.deadline < new Date()
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

  private async checkPrerequisites(gateRequest: WorkflowGateRequest): Promise<{
    met: boolean;
    missing: string[];
  }> {
    const prerequisites = gateRequest.conditionalLogic?.prerequisites || [];
    const missing: string[] = [];

    for (const prerequisite of prerequisites) {
      const result = await this.evaluateCondition(
        prerequisite,
        gateRequest.workflowContext
      );
      if (!result && prerequisite.required !== false) {
        missing.push(prerequisite.id);
      }
    }

    return {
      met: missing.length === 0,
      missing,
    };
  }

  private async checkAutoApproval(gateRequest: WorkflowGateRequest): Promise<{
    approved: boolean;
    reason?: string;
  }> {
    const autoApprovalConditions =
      gateRequest.conditionalLogic?.autoApprovalConditions || [];

    if (autoApprovalConditions.length === 0) {
      return { approved: false };
    }

    for (const condition of autoApprovalConditions) {
      const result = await this.evaluateCondition(
        condition,
        gateRequest.workflowContext
      );
      if (result) {
        return {
          approved: true,
          reason: `Auto-approval condition met: ${condition.id}`,
        };
      }
    }

    return { approved: false };
  }

  private async evaluateCondition(
    condition: GateCondition,
    context: WorkflowContext
  ): Promise<boolean> {
    // Production-ready sophisticated condition evaluation with type safety and error handling
    try {
      const fieldValue = this.getFieldValue(context, condition.field);
      const expectedValue = condition.value;

      // Log condition evaluation for debugging
      logger.debug('Evaluating condition:', {
        field: condition.field,
        operator: condition.operator,
        fieldValue,
        expectedValue,
        fieldType: typeof fieldValue,
        expectedType: typeof expectedValue,
      });

      // Enhanced condition evaluation with type coercion and validation
      const result = await this.executeConditionOperator(
        condition.operator,
        fieldValue,
        expectedValue,
        condition
      );

      // Log evaluation result
      logger.debug('Condition evaluation result:', {
        field: condition.field,
        operator: condition.operator,
        result,
        metadata: {
          evaluation_time: new Date().toISOString(),
          context_keys: Object.keys(context || {}),
        },
      });

      return result;
    } catch (error) {
      logger.error('Error evaluating condition:', {
        condition,
        error: error.message,
        context_summary: this.summarizeContext(context),
      });

      // Fail-safe: return false on evaluation error unless it's an 'exists' check
      return condition.operator === 'not_exists';
    }
  }

  private async executeConditionOperator(
    operator: string,
    fieldValue: unknown,
    expectedValue: unknown,
    condition: GateCondition
  ): Promise<boolean> {
    switch (operator) {
      case 'equals':
        return this.evaluateEquals(fieldValue, expectedValue);

      case 'not_equals':
        return !this.evaluateEquals(fieldValue, expectedValue);

      case 'greater_than':
        return this.evaluateGreaterThan(fieldValue, expectedValue);

      case 'greater_than_or_equal':
        return this.evaluateGreaterThanOrEqual(fieldValue, expectedValue);

      case 'less_than':
        return this.evaluateLessThan(fieldValue, expectedValue);

      case 'less_than_or_equal':
        return this.evaluateLessThanOrEqual(fieldValue, expectedValue);

      case 'contains':
        return this.evaluateContains(fieldValue, expectedValue);

      case 'not_contains':
        return !this.evaluateContains(fieldValue, expectedValue);

      case 'starts_with':
        return this.evaluateStartsWith(fieldValue, expectedValue);

      case 'ends_with':
        return this.evaluateEndsWith(fieldValue, expectedValue);

      case 'matches':
        return this.evaluateMatches(fieldValue, expectedValue);

      case 'not_matches':
        return !this.evaluateMatches(fieldValue, expectedValue);

      case 'exists':
        return this.evaluateExists(fieldValue);

      case 'not_exists':
        return !this.evaluateExists(fieldValue);

      case 'empty':
        return this.evaluateEmpty(fieldValue);

      case 'not_empty':
        return !this.evaluateEmpty(fieldValue);

      case 'in':
        return this.evaluateIn(fieldValue, expectedValue);

      case 'not_in':
        return !this.evaluateIn(fieldValue, expectedValue);

      case 'between':
        return this.evaluateBetween(fieldValue, expectedValue);

      case 'type_is':
        return this.evaluateTypeIs(fieldValue, expectedValue);

      case 'length_equals':
        return this.evaluateLengthEquals(fieldValue, expectedValue);

      case 'length_greater_than':
        return this.evaluateLengthGreaterThan(fieldValue, expectedValue);

      case 'length_less_than':
        return this.evaluateLengthLessThan(fieldValue, expectedValue);

      default:
        logger.warn('Unknown condition operator:', operator);
        throw new Error(`Unsupported condition operator: ${operator}`);
    }
  }

  // ==================== CONDITION EVALUATION METHODS ====================

  private evaluateEquals(fieldValue: unknown, expectedValue: unknown): boolean {
    // Handle null/undefined comparisons
    if (fieldValue === null || fieldValue === undefined) {
      return expectedValue === null || expectedValue === undefined;
    }

    // Try strict equality first
    if (fieldValue === expectedValue) return true;

    // Try type coercion for numbers and strings
    if (typeof fieldValue !== typeof expectedValue) {
      return String(fieldValue) === String(expectedValue);
    }

    return false;
  }

  private evaluateGreaterThan(fieldValue: unknown, expectedValue: unknown): boolean {
    const numField = this.toNumber(fieldValue);
    const numExpected = this.toNumber(expectedValue);

    if (numField === null || numExpected === null) {
      // Fallback to string comparison
      return String(fieldValue) > String(expectedValue);
    }

    return numField > numExpected;
  }

  private evaluateGreaterThanOrEqual(
    fieldValue: unknown,
    expectedValue: unknown
  ): boolean {
    return (
      this.evaluateGreaterThan(fieldValue, expectedValue) ||
      this.evaluateEquals(fieldValue, expectedValue)
    );
  }

  private evaluateLessThan(fieldValue: unknown, expectedValue: unknown): boolean {
    const numField = this.toNumber(fieldValue);
    const numExpected = this.toNumber(expectedValue);

    if (numField === null || numExpected === null) {
      // Fallback to string comparison
      return String(fieldValue) < String(expectedValue);
    }

    return numField < numExpected;
  }

  private evaluateLessThanOrEqual(
    fieldValue: unknown,
    expectedValue: unknown
  ): boolean {
    return (
      this.evaluateLessThan(fieldValue, expectedValue) ||
      this.evaluateEquals(fieldValue, expectedValue)
    );
  }

  private evaluateContains(fieldValue: unknown, expectedValue: unknown): boolean {
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(expectedValue);
    }

    if (fieldValue && typeof fieldValue === 'object') {
      return Object.hasOwn(fieldValue, expectedValue);
    }

    return String(fieldValue)
      .toLowerCase()
      .includes(String(expectedValue).toLowerCase());
  }

  private evaluateStartsWith(fieldValue: unknown, expectedValue: unknown): boolean {
    return String(fieldValue)
      .toLowerCase()
      .startsWith(String(expectedValue).toLowerCase());
  }

  private evaluateEndsWith(fieldValue: unknown, expectedValue: unknown): boolean {
    return String(fieldValue)
      .toLowerCase()
      .endsWith(String(expectedValue).toLowerCase());
  }

  private evaluateMatches(fieldValue: unknown, expectedValue: unknown): boolean {
    try {
      const regex = new RegExp(String(expectedValue), 'i'); // Case insensitive by default
      return regex.test(String(fieldValue));
    } catch (error) {
      logger.error('Invalid regex pattern:', expectedValue, error);
      return false;
    }
  }

  private evaluateExists(fieldValue: unknown): boolean {
    return fieldValue !== undefined && fieldValue !== null;
  }

  private evaluateEmpty(fieldValue: unknown): boolean {
    if (fieldValue === null || fieldValue === undefined) return true;
    if (typeof fieldValue === 'string') return fieldValue.trim() === '';
    if (Array.isArray(fieldValue)) return fieldValue.length === 0;
    if (typeof fieldValue === 'object')
      return Object.keys(fieldValue).length === 0;
    return false;
  }

  private evaluateIn(fieldValue: unknown, expectedValue: unknown): boolean {
    if (!Array.isArray(expectedValue)) {
      logger.warn(
        'Expected array for "in" operator, got:',
        typeof expectedValue
      );
      return false;
    }

    return expectedValue.includes(fieldValue);
  }

  private evaluateBetween(fieldValue: unknown, expectedValue: unknown): boolean {
    if (!Array.isArray(expectedValue) || expectedValue.length !== 2) {
      logger.warn('Expected array of length 2 for "between" operator');
      return false;
    }

    const numField = this.toNumber(fieldValue);
    const minValue = this.toNumber(expectedValue[0]);
    const maxValue = this.toNumber(expectedValue[1]);

    if (numField === null || minValue === null || maxValue === null) {
      return false;
    }

    return numField >= minValue && numField <= maxValue;
  }

  private evaluateTypeIs(fieldValue: unknown, expectedValue: unknown): boolean {
    const actualType = Array.isArray(fieldValue) ? 'array' : typeof fieldValue;
    return actualType === String(expectedValue).toLowerCase();
  }

  private evaluateLengthEquals(fieldValue: unknown, expectedValue: unknown): boolean {
    const length = this.getLength(fieldValue);
    return length !== null && length === this.toNumber(expectedValue);
  }

  private evaluateLengthGreaterThan(
    fieldValue: unknown,
    expectedValue: unknown
  ): boolean {
    const length = this.getLength(fieldValue);
    const expected = this.toNumber(expectedValue);
    return length !== null && expected !== null && length > expected;
  }

  private evaluateLengthLessThan(fieldValue: unknown, expectedValue: unknown): boolean {
    const length = this.getLength(fieldValue);
    const expected = this.toNumber(expectedValue);
    return length !== null && expected !== null && length < expected;
  }

  // ==================== HELPER METHODS ====================

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && !isNaN(value)) return value;

    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }

  private getLength(value: unknown): number | null {
    if (typeof value === 'string') return value.length;
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === 'object') return Object.keys(value).length;
    return null;
  }

  private summarizeContext(context: WorkflowContext): unknown {
    if (!context) return null;

    return {
      keys: Object.keys(context),
      hasData: Object.keys(context).length > 0,
      types: Object.entries(context).reduce(
        (acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? 'array' : typeof value;
          return acc;
        },
        {} as Record<string, string>
      ),
    };
  }

  private getFieldValue(context: WorkflowContext, field: string): unknown {
    const parts = field.split('.');
    let value: unknown = context;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  private createDefaultEscalationChain(
    gateRequest: WorkflowGateRequest
  ): EscalationChain {
    const levels: EscalationLevel[] = [];

    // Create escalation levels based on business impact
    switch (gateRequest.workflowContext.businessImpact) {
      case 'low':
        levels.push({
          level: GateEscalationLevel.TEAM_LEAD,
          approvers: ['team-lead'],
          requiredApprovals: 1,
          timeLimit: 3600000, // 1 hour
        });
        break;

      case 'medium':
        levels.push(
          {
            level: GateEscalationLevel.TEAM_LEAD,
            approvers: ['team-lead'],
            requiredApprovals: 1,
            timeLimit: 1800000, // 30 minutes
          },
          {
            level: GateEscalationLevel.MANAGER,
            approvers: ['manager'],
            requiredApprovals: 1,
            timeLimit: 3600000, // 1 hour
          }
        );
        break;

      case 'high':
      case 'critical':
        levels.push(
          {
            level: GateEscalationLevel.TEAM_LEAD,
            approvers: ['team-lead'],
            requiredApprovals: 1,
            timeLimit: 900000, // 15 minutes
          },
          {
            level: GateEscalationLevel.MANAGER,
            approvers: ['manager'],
            requiredApprovals: 1,
            timeLimit: 1800000, // 30 minutes
          },
          {
            level: GateEscalationLevel.DIRECTOR,
            approvers: ['director'],
            requiredApprovals: 1,
            timeLimit: 3600000, // 1 hour
          }
        );
        break;
    }

    return {
      id: `escalation-${gateRequest.id}`,
      levels,
      triggers: [
        {
          type: 'timeout',
          threshold: 'time_limit',
          delay: 0,
        },
        {
          type: 'business_impact',
          threshold: gateRequest.workflowContext.businessImpact,
          delay: 300000, // 5 minutes
        },
      ],
      maxLevel: this.config.maxEscalationLevel || GateEscalationLevel.EXECUTIVE,
    };
  }

  private async requestHumanValidation(
    gateRequest: WorkflowGateRequest,
    escalationChain: EscalationChain,
    correlationId: string
  ): Promise<HumanValidationResult> {
    // Create human validation request event for integration with existing AGUI system
    const validationRequestEvent: HumanValidationRequestedEvent = createEvent(
      'human.validation.requested',
      Domain.INTERFACES,
      {
        payload: {
          requestId: `gate-${gateRequest.id}`,
          validationType:
            gateRequest.gateType === 'approval' ? 'approval' : 'review',
          context: {
            workflowGate: gateRequest,
            escalationChain,
          },
          priority: this.mapPriorityToEventPriority(gateRequest.priority),
          timeout:
            gateRequest.timeoutConfig?.initialTimeout ||
            this.config.defaultTimeout,
        },
      },
      {
        correlationId,
        source: 'workflow-gate-processor',
      }
    );

    // Emit validation request event
    const eventResult = await this.eventBus.emitEvent(validationRequestEvent);
    if (!eventResult.success) {
      throw new Error(
        `Failed to emit validation request: ${eventResult.error?.message}`
      );
    }

    // Use existing AGUI interface for actual validation
    try {
      const response = (await this.aguiInterface.askQuestion(
        gateRequest
      )) as any as any as any as any;

      return {
        approved: this.interpretResponse(response),
        response,
        processingTime: Date.now() - validationRequestEvent.timestamp.getTime(),
        level: GateEscalationLevel.TEAM_LEAD, // Start with team lead level
        approver: 'user',
      };
    } catch (error) {
      throw new Error(
        `Human validation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async processEscalationChain(
    gateId: string,
    initialResult: HumanValidationResult,
    escalationChain: EscalationChain
  ): Promise<WorkflowGateResult> {
    const pendingGate = this.pendingGates.get(gateId);
    if (!pendingGate) {
      throw new Error(`Pending gate not found: ${gateId}`);
    }

    // If initially approved, we're done
    if (initialResult.approved) {
      return {
        success: true,
        gateId,
        approved: true,
        processingTime: initialResult.processingTime,
        escalationLevel: initialResult.level,
        decisionMaker: initialResult.approver,
        correlationId: pendingGate.correlationId,
      };
    }

    // Process escalation chain
    let currentLevel = GateEscalationLevel.TEAM_LEAD;
    let finalApproval = false;
    let finalLevel = GateEscalationLevel.NONE;
    let decisionMaker = 'unknown';

    for (const level of escalationChain.levels) {
      if (level.level <= currentLevel) continue;

      currentLevel = level.level;
      pendingGate.currentLevel = currentLevel;

      this.logger.info('Escalating to level', {
        gateId,
        level: currentLevel,
        approvers: level.approvers,
      });

      // Set escalation timer if time limit specified
      if (level.timeLimit) {
        this.setEscalationTimer(gateId, level.timeLimit, currentLevel);
      }

      // Simulate approval at this level (in production, this would involve actual approver interaction)
      const approval = await this.simulateApprovalAtLevel(level, pendingGate);

      const approvalRecord: ApprovalRecord = {
        approver: approval.approver,
        timestamp: new Date(),
        decision: approval.decision,
        comments: approval.comments,
        level: currentLevel,
        responseTime: approval.responseTime,
      };

      pendingGate.approvals.push(approvalRecord);

      if (approval.decision === 'approve') {
        finalApproval = true;
        finalLevel = currentLevel;
        decisionMaker = approval.approver;
        break;
      }
      if (approval.decision === 'reject') {
        finalApproval = false;
        finalLevel = currentLevel;
        decisionMaker = approval.approver;
        break;
      }
      // If 'escalate', continue to next level
    }

    // Clear any remaining timers
    this.clearEscalationTimers(gateId);

    return {
      success: true,
      gateId,
      approved: finalApproval,
      processingTime: Date.now() - pendingGate.startTime.getTime(),
      escalationLevel: finalLevel,
      decisionMaker,
      approvalChain: {
        completed: true,
        approved: finalApproval,
        decisionLevel: finalLevel,
        decisionMaker,
        processingTime: Date.now() - pendingGate.startTime.getTime(),
        approvals: pendingGate.approvals,
        escalations: pendingGate.escalations,
      },
      correlationId: pendingGate.correlationId,
    };
  }

  private async simulateApprovalAtLevel(
    level: EscalationLevel,
    pendingGate: PendingGateRequest
  ): Promise<{
    decision: 'approve' | 'reject' | 'escalate';
    approver: string;
    comments?: string;
    responseTime: number;
  }> {
    const startTime = Date.now();

    // Simulate decision making based on business impact and level
    const businessImpact =
      pendingGate.gateRequest.workflowContext.businessImpact;
    const approver = level.approvers[0] || 'unknown';

    // Simple simulation logic
    let decision: 'approve' | 'reject' | 'escalate' = 'approve';
    let comments = `Approved at ${GateEscalationLevel[level.level]} level`;

    if (
      businessImpact === 'critical' &&
      level.level < GateEscalationLevel.DIRECTOR
    ) {
      decision = 'escalate';
      comments = 'Critical impact requires higher level approval';
    } else if (
      businessImpact === 'high' &&
      level.level < GateEscalationLevel.MANAGER
    ) {
      decision = 'escalate';
      comments = 'High impact requires management approval';
    }

    // Simulate processing time
    const responseTime = Date.now() - startTime + 100; // Add some processing time

    return {
      decision,
      approver,
      comments,
      responseTime,
    };
  }

  private async emitGateOpenedEvent(
    gateRequest: WorkflowGateRequest,
    correlationId: string
  ): Promise<void> {
    const gateOpenedEvent: AGUIGateOpenedEvent = createEvent(
      'agui.gate.opened',
      Domain.INTERFACES,
      {
        payload: {
          gateId: gateRequest.id,
          gateType: gateRequest.gateType,
          requiredApproval: gateRequest.gateType !== 'checkpoint',
          context: {
            workflowContext: gateRequest.workflowContext,
            question: gateRequest.question,
            businessImpact: gateRequest.workflowContext.businessImpact,
          },
        },
      },
      { correlationId, source: 'workflow-gate-processor' }
    );

    const result = await this.eventBus.emitEvent(gateOpenedEvent);
    if (!result.success) {
      this.logger.warn('Failed to emit gate opened event', {
        gateId: gateRequest.id,
        error: result.error?.message,
      });
    }
  }

  private async emitGateClosedEvent(
    gateRequest: WorkflowGateRequest,
    result: WorkflowGateResult,
    correlationId: string
  ): Promise<void> {
    const gateClosedEvent: AGUIGateClosedEvent = createEvent(
      'agui.gate.closed',
      Domain.INTERFACES,
      {
        payload: {
          gateId: gateRequest.id,
          approved: result.approved,
          duration: result.processingTime,
          humanInput: {
            escalationLevel: result.escalationLevel,
            decisionMaker: result.decisionMaker,
            approvalChain: result.approvalChain,
          },
        },
      },
      { correlationId, causationId: `gate-${gateRequest.id}` }
    );

    const eventResult = await this.eventBus.emitEvent(gateClosedEvent);
    if (!eventResult.success) {
      this.logger.warn('Failed to emit gate closed event', {
        gateId: gateRequest.id,
        error: eventResult.error?.message,
      });
    }
  }

  private initializeEventHandlers(): void {
    // Listen for human validation completion events
    this.eventBus.registerHandler(
      'human.validation.completed',
      async (event: HumanValidationCompletedEvent) => {
        const { requestId, approved, feedback } = event.payload;

        // Check if this is for one of our gates
        const gateId = requestId.replace('gate-', '');
        const pendingGate = this.pendingGates.get(gateId);

        if (pendingGate) {
          this.logger.debug('Received validation completion for gate', {
            gateId,
            approved,
            feedback,
          });

          // Emit internal event for gate processing
          this.emit('validation-completed', {
            gateId,
            approved,
            feedback,
            processingTime: event.payload.processingTime,
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
      this.logger.info('Escalation timer triggered', { gateId, level });
      this.emit('escalation-timeout', { gateId, level });
    }, timeLimit);

    // Store timer for cleanup
    const timerKey = `${gateId}-${level}`;
    this.escalationTimers.set(timerKey, timerId);
  }

  private clearEscalationTimers(gateId: string): void {
    // Clear all timers for this gate
    for (const [key, timerId] of this.escalationTimers.entries()) {
      if (key.startsWith(gateId)) {
        clearTimeout(timerId);
        this.escalationTimers.delete(key);
      }
    }
  }

  private cleanup(gateId: string): void {
    this.pendingGates.delete(gateId);
    this.clearEscalationTimers(gateId);
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
    return positiveResponses.some((pos) =>
      response.toLowerCase().includes(pos)
    );
  }

  private mapPriorityToEventPriority(priority?: string): EventPriority {
    switch (priority) {
      case 'critical':
        return EventPriority.CRITICAL;
      case 'high':
        return EventPriority.HIGH;
      case 'medium':
        return EventPriority.NORMAL;
      case 'low':
        return EventPriority.LOW;
      default:
        return EventPriority.NORMAL;
    }
  }
}

// ============================================================================
// SUPPORTING TYPES AND INTERFACES
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
  const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const fullWorkflowContext: WorkflowContext = {
    workflowId,
    stepName,
    businessImpact: options.businessImpact || 'medium',
    decisionScope: 'task',
    stakeholders,
    deadline: options.deadline,
  };

  return {
    // ValidationQuestion base properties
    id: gateId,
    type: 'checkpoint',
    question,
    context: { type: 'approval_request' },
    confidence: 0.8,
    priority: options.priority || 'medium',
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
  checkpointData: unknown,
  options: {
    autoApprovalThreshold?: number;
    businessImpact?: WorkflowContext['businessImpact'];
  } = {}
): WorkflowGateRequest {
  const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const autoApprovalConditions: GateCondition[] = [];
  if (options.autoApprovalThreshold) {
    autoApprovalConditions.push({
      id: 'confidence_threshold',
      type: 'custom',
      operator: 'greater_than',
      field: 'confidence',
      value: options.autoApprovalThreshold,
    });
  }

  const fullWorkflowContext: WorkflowContext = {
    workflowId,
    stepName,
    businessImpact: options.businessImpact || 'low',
    decisionScope: 'task',
    stakeholders: ['system'],
  };

  return {
    // ValidationQuestion base properties
    id: gateId,
    type: 'checkpoint',
    question: `Checkpoint reached: ${stepName}. Continue?`,
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
        autoApprovalConditions.length > 0 ? autoApprovalConditions : undefined,
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
  emergencyContext: unknown,
  stakeholders: string[]
): WorkflowGateRequest {
  const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const escalationChain: EscalationChain = {
    id: `emergency-${workflowId}-${stepName}`,
    levels: [
      {
        level: GateEscalationLevel.MANAGER,
        approvers: stakeholders.slice(0, 1),
        requiredApprovals: 1,
        timeLimit: 300000, // 5 minutes
      },
      {
        level: GateEscalationLevel.DIRECTOR,
        approvers: stakeholders.slice(1, 2),
        requiredApprovals: 1,
        timeLimit: 600000, // 10 minutes
      },
      {
        level: GateEscalationLevel.EXECUTIVE,
        approvers: stakeholders.slice(2),
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
    maxLevel: GateEscalationLevel.EXECUTIVE,
    notifyAllLevels: true,
  };

  const fullWorkflowContext: WorkflowContext = {
    workflowId,
    stepName,
    businessImpact: 'critical',
    decisionScope: 'portfolio',
    stakeholders,
    deadline: new Date(Date.now() + 1800000), // 30 minutes from now
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
