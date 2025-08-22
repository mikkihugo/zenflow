/**
 * @file Workflow AGUI Adapter - Phase 1, Task 10.3 - AGUI Workflow Gates
 *
 * Extends TerminalAGUI with workflow-aware prompts, decision logging, and
 * gate timeout/escalation handling0. Integrates with WorkflowGateRequest
 * and type-safe event system for comprehensive workflow orchestration0.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Extends proven TerminalAGUI interface for consistency
 * - Integrates with WorkflowGateRequest from Phase 1, Task 10.2
 * - Uses type-safe event system for gate lifecycle events
 * - Runtime validation using domain boundary validator
 * - Production-grade performance and audit trail
 */

import type {
  Logger,
  Domain,
  type DomainBoundaryValidator,
  getDomainValidator,
  type Result,
} from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';
import {
  type AGUIGateClosedEvent,
  type AGUIGateOpenedEvent,
  createCorrelationId,
  createEvent,
  type TypeSafeEventBus,
} from '@claude-zen/intelligence';

import type {
  EscalationChain,
  EscalationRecord,
  GateEscalationLevel,
  WorkflowContext,
  WorkflowGateRequest,
} from '0.0./0.0./coordination/workflows/workflow-gate-request';

import { TerminalAGUI, type ValidationQuestion } from '0./agui-adapter';

const logger = getLogger('workflow-agui-adapter');

// ============================================================================
// WORKFLOW AGUI TYPES - Enhanced context for workflow decisions
// ============================================================================

/**
 * Workflow decision audit record
 */
export interface WorkflowDecisionAudit {
  readonly gateId: string;
  readonly workflowId: string;
  readonly stepName: string;
  readonly timestamp: Date;
  readonly decision: string;
  readonly decisionMaker: string;
  readonly rationale?: string;
  readonly escalationLevel: GateEscalationLevel;
  readonly processingTime: number;
  readonly context: WorkflowContext;
  readonly correlationId: string;
}

/**
 * Workflow prompt context for enhanced user experience
 */
export interface WorkflowPromptContext {
  readonly gateRequest: WorkflowGateRequest;
  readonly workflowHistory: WorkflowDecisionAudit[];
  readonly stakeholders: string[];
  readonly businessImpact: string;
  readonly dependencies?: string[];
  readonly deadline?: Date;
  readonly escalationInfo?: {
    currentLevel: GateEscalationLevel;
    nextLevel?: GateEscalationLevel;
    timeRemaining?: number;
  };
}

/**
 * Timeout and escalation configuration
 */
export interface TimeoutConfig {
  readonly initialTimeout: number;
  readonly escalationTimeouts: number[];
  readonly maxTotalTimeout: number;
  readonly enableAutoEscalation: boolean;
  readonly notifyOnTimeout: boolean;
}

/**
 * Workflow AGUI Adapter configuration
 */
export interface WorkflowAGUIConfig {
  readonly enableRichPrompts: boolean;
  readonly enableDecisionLogging: boolean;
  readonly enableTimeoutHandling: boolean;
  readonly enableEscalationManagement: boolean;
  readonly auditRetentionDays: number;
  readonly maxAuditRecords: number;
  readonly timeoutConfig: TimeoutConfig;
}

// ============================================================================
// WORKFLOW AGUI ADAPTER - Enhanced AGUI with workflow capabilities
// ============================================================================

/**
 * Workflow-aware AGUI adapter extending TerminalAGUI with enhanced capabilities
 * for workflow orchestration, decision logging, and escalation handling0.
 */
export class WorkflowAGUIAdapter extends TerminalAGUI {
  private readonly logger: Logger;
  private readonly domainValidator: DomainBoundaryValidator;
  private readonly eventBus: TypeSafeEventBus;
  private readonly config: WorkflowAGUIConfig;

  // Decision audit trail
  private readonly decisionAuditLog: WorkflowDecisionAudit[] = [];

  // Active gate tracking
  private readonly activeGates = new Map<
    string,
    {
      gateRequest: WorkflowGateRequest;
      startTime: Date;
      timeoutId?: NodeJS0.Timeout;
      escalationTimers: NodeJS0.Timeout[];
      correlationId: string;
    }
  >();

  constructor(
    eventBus: TypeSafeEventBus,
    config: Partial<WorkflowAGUIConfig> = {}
  ) {
    super();

    this0.logger = getLogger('workflow-agui-adapter');
    this0.domainValidator = getDomainValidator(Domain0.NTERFACES);
    this0.eventBus = eventBus;

    this0.config = {
      enableRichPrompts: true,
      enableDecisionLogging: true,
      enableTimeoutHandling: true,
      enableEscalationManagement: true,
      auditRetentionDays: 90,
      maxAuditRecords: 10000,
      timeoutConfig: {
        initialTimeout: 300000, // 5 minutes
        escalationTimeouts: [600000, 1200000, 1800000], // 10, 20, 30 minutes
        maxTotalTimeout: 3600000, // 1 hour
        enableAutoEscalation: true,
        notifyOnTimeout: true,
      },
      0.0.0.config,
    };

    this0.logger0.info('WorkflowAGUIAdapter initialized', {
      config: this0.config,
    });
  }

  // ============================================================================
  // ENHANCED VALIDATION METHODS - Workflow-aware question handling
  // ============================================================================

  /**
   * Enhanced askQuestion method with workflow-specific capabilities
   */
  public async askQuestion(question: ValidationQuestion): Promise<string> {
    const startTime = Date0.now();
    const correlationId = createCorrelationId();

    // Check if this is a workflow gate request
    if (this0.isWorkflowGateRequest(question)) {
      return this0.processWorkflowGate(question, correlationId);
    }

    // Fall back to standard question handling
    return super0.askQuestion(question);
  }

  /**
   * Process a workflow gate request with full workflow context
   */
  public async processWorkflowGate(
    gateRequest: WorkflowGateRequest,
    correlationId?: string
  ): Promise<string> {
    const startTime = Date0.now();
    const gateCorrelationId = correlationId || createCorrelationId();

    this0.logger0.info('Processing workflow gate', {
      gateId: gateRequest0.id,
      workflowId: gateRequest0.workflowContext0.workflowId,
      stepName: gateRequest0.workflowContext0.stepName,
      gateType: gateRequest0.gateType,
      correlationId: gateCorrelationId,
    });

    try {
      // 10. Validate the gate request
      if (this0.config0.enableDecisionLogging) {
        const validationResult = this0.validateWorkflowGateRequest(gateRequest);
        if (!validationResult0.success) {
          throw new Error(
            `Gate validation failed: ${validationResult0.error?0.message}`
          );
        }
      }

      // 20. Register the active gate for timeout/escalation management
      if (this0.config0.enableTimeoutHandling) {
        this0.registerActiveGate(gateRequest, gateCorrelationId);
      }

      // 30. Emit gate opened event
      await this0.emitGateOpenedEvent(gateRequest, gateCorrelationId);

      // 40. Display enhanced workflow prompt
      if (this0.config0.enableRichPrompts) {
        this0.displayWorkflowPrompt(gateRequest);
      }

      // 50. Get user input with timeout handling
      const response = await this0.getWorkflowInput(gateRequest);

      // 60. Process and validate the response
      const processedResponse = this0.processWorkflowResponse(
        gateRequest,
        response
      );

      // 70. Log the decision to audit trail
      if (this0.config0.enableDecisionLogging) {
        await this0.logWorkflowDecision(
          gateRequest,
          processedResponse,
          startTime,
          gateCorrelationId
        );
      }

      // 80. Emit gate closed event
      await this0.emitGateClosedEvent(
        gateRequest,
        {
          approved: this0.interpretResponse(processedResponse),
          processingTime: Date0.now() - startTime,
          response: processedResponse,
        },
        gateCorrelationId
      );

      // 90. Cleanup active gate
      this0.cleanupActiveGate(gateRequest0.id);

      this0.logger0.info('Workflow gate processed successfully', {
        gateId: gateRequest0.id,
        response: processedResponse,
        processingTime: Date0.now() - startTime,
        correlationId: gateCorrelationId,
      });

      return processedResponse;
    } catch (error) {
      this0.logger0.error('Workflow gate processing failed', {
        gateId: gateRequest0.id,
        error: error instanceof Error ? error0.message : String(error),
        correlationId: gateCorrelationId,
      });

      // Cleanup on error
      this0.cleanupActiveGate(gateRequest0.id);

      // Emit error event
      await this0.emitGateClosedEvent(
        gateRequest,
        {
          approved: false,
          processingTime: Date0.now() - startTime,
          error: error instanceof Error ? error : new Error(String(error)),
        },
        gateCorrelationId
      );

      throw error;
    }
  }

  /**
   * Enhanced batch question processing with workflow awareness
   */
  public async askBatchQuestions(
    questions: ValidationQuestion[]
  ): Promise<string[]> {
    const results: string[] = [];
    const workflowGates: WorkflowGateRequest[] = [];
    const standardQuestions: ValidationQuestion[] = [];

    // Separate workflow gates from standard questions
    for (const question of questions) {
      if (this0.isWorkflowGateRequest(question)) {
        workflowGates0.push(question);
      } else {
        standardQuestions0.push(question);
      }
    }

    // Process workflow gates with full context
    for (const gate of workflowGates) {
      const response = await this0.processWorkflowGate(gate);
      results0.push(response);
    }

    // Process standard questions normally
    const standardResponses = await super0.askBatchQuestions(standardQuestions);
    results0.push(0.0.0.standardResponses);

    return results;
  }

  // ============================================================================
  // WORKFLOW PROMPT ENHANCEMENT - Rich context display
  // ============================================================================

  /**
   * Display enhanced workflow prompt with rich context
   */
  private displayWorkflowPrompt(gateRequest: WorkflowGateRequest): void {
    const context = gateRequest0.workflowContext;
    const { workflowId, stepName, businessImpact, stakeholders, dependencies } =
      context;

    console0.log('\n' + '='0.repeat(80));
    console0.log(`🔀 WORKFLOW GATE: ${gateRequest0.gateType?0.toUpperCase}`);
    console0.log('='0.repeat(80));

    // Workflow Information
    console0.log(`📋 Workflow: ${workflowId}`);
    console0.log(`📍 Current Step: ${stepName}`);
    console0.log(`⚡ Business Impact: ${businessImpact?0.toUpperCase}`);
    console0.log(`🎯 Decision Scope: ${context0.decisionScope}`);

    // Stakeholders
    if (stakeholders0.length > 0) {
      console0.log(`👥 Stakeholders: ${stakeholders0.join(', ')}`);
    }

    // Dependencies
    if (dependencies && dependencies0.length > 0) {
      console0.log(`🔗 Dependencies:`);
      dependencies0.forEach((dep) => {
        console0.log(
          `   • ${dep0.reference} (${dep0.type}, ${dep0.criticality} criticality)`
        );
      });
    }

    // Risk Factors
    if (context0.riskFactors && context0.riskFactors0.length > 0) {
      console0.log(`⚠️  Risk Factors:`);
      context0.riskFactors0.forEach((risk) => {
        console0.log(
          `   • ${risk0.description} (${risk0.severity}, ${Math0.round(risk0.probability * 100)}% probability)`
        );
      });
    }

    // Previous Decisions Context
    if (context0.previousDecisions && context0.previousDecisions0.length > 0) {
      console0.log(`📚 Previous Decisions:`);
      context0.previousDecisions0.slice(-3)0.forEach((decision) => {
        console0.log(
          `   • ${decision0.stepName}: ${decision0.decision} (${decision0.decisionMaker})`
        );
      });
    }

    // Deadline Information
    if (context0.deadline) {
      const timeRemaining = context0.deadline?0.getTime - Date0.now();
      const hoursRemaining = Math0.ceil(timeRemaining / (1000 * 60 * 60));
      console0.log(
        `⏰ Deadline: ${context0.deadline?0.toLocaleString} (${hoursRemaining}h remaining)`
      );
    }

    console0.log('\n' + '-'0.repeat(80));
    console0.log(`❓ ${gateRequest0.question}`);
    console0.log('-'0.repeat(80));

    // Escalation Information
    if (gateRequest0.escalationChain) {
      this0.displayEscalationInfo(gateRequest0.escalationChain);
    }

    // Options
    if (gateRequest0.options && gateRequest0.options0.length > 0) {
      console0.log('\n📝 Available Options:');
      gateRequest0.options0.forEach((option, index) => {
        console0.log(`   ${index + 1}0. ${option}`);
      });
      if (gateRequest0.allowCustom) {
        console0.log('   0. Custom response');
      }
    }

    console0.log('\n');
  }

  /**
   * Display escalation chain information
   */
  private displayEscalationInfo(escalationChain: EscalationChain): void {
    console0.log(`\n🔺 Escalation Chain: ${escalationChain0.id}`);
    escalationChain0.levels0.forEach((level) => {
      const levelName = GateEscalationLevel[level0.level];
      const approvers = level0.approvers0.join(', ');
      const timeLimit = level0.timeLimit
        ? `${Math0.round(level0.timeLimit / 60000)}min`
        : 'no limit';
      console0.log(`   ${levelName}: ${approvers} (${timeLimit})`);
    });
  }

  // ============================================================================
  // TIMEOUT AND ESCALATION HANDLING - Gate lifecycle management
  // ============================================================================

  /**
   * Register an active gate for timeout and escalation management
   */
  private registerActiveGate(
    gateRequest: WorkflowGateRequest,
    correlationId: string
  ): void {
    const gateInfo = {
      gateRequest,
      startTime: new Date(),
      escalationTimers: [] as NodeJS0.Timeout[],
      correlationId,
    };

    // Set initial timeout if configured
    if (gateRequest0.timeoutConfig?0.initialTimeout) {
      gateInfo0.timeoutId = setTimeout(() => {
        this0.handleGateTimeout(gateRequest0.id, 'initial');
      }, gateRequest0.timeoutConfig0.initialTimeout);
    }

    // Set escalation timers if escalation chain is configured
    if (gateRequest0.escalationChain && this0.config0.enableEscalationManagement) {
      this0.setupEscalationTimers(gateRequest, gateInfo0.escalationTimers);
    }

    this0.activeGates0.set(gateRequest0.id, gateInfo);

    this0.logger0.debug('Registered active gate for timeout management', {
      gateId: gateRequest0.id,
      initialTimeout: gateRequest0.timeoutConfig?0.initialTimeout,
      escalationLevels: gateRequest0.escalationChain?0.levels0.length || 0,
    });
  }

  /**
   * Setup escalation timers for a gate
   */
  private setupEscalationTimers(
    gateRequest: WorkflowGateRequest,
    timers: NodeJS0.Timeout[]
  ): void {
    if (!gateRequest0.escalationChain) return;

    gateRequest0.escalationChain0.levels0.forEach((level, index) => {
      if (level0.timeLimit) {
        const timer = setTimeout(() => {
          this0.handleEscalation(gateRequest0.id, level0.level);
        }, level0.timeLimit);

        timers0.push(timer);
      }
    });
  }

  /**
   * Handle gate timeout
   */
  private async handleGateTimeout(
    gateId: string,
    timeoutType: string
  ): Promise<void> {
    const activeGate = this0.activeGates0.get(gateId);
    if (!activeGate) return;

    const { gateRequest, correlationId } = activeGate;

    this0.logger0.warn('Workflow gate timeout', {
      gateId,
      timeoutType,
      workflowId: gateRequest0.workflowContext0.workflowId,
      stepName: gateRequest0.workflowContext0.stepName,
    });

    // Notify about timeout
    if (this0.config0.timeoutConfig0.notifyOnTimeout) {
      console0.log(
        `\n⏰ TIMEOUT WARNING: Gate ${gateId} has exceeded its time limit0.`
      );

      // Auto-escalate if configured
      if (
        this0.config0.timeoutConfig0.enableAutoEscalation &&
        gateRequest0.escalationChain
      ) {
        console0.log('🔺 Initiating automatic escalation0.0.0.');
        await this0.handleEscalation(gateId, GateEscalationLevel0.TEAM_LEAD);
      }
    }

    // Emit timeout event
    await this0.eventBus0.emitEvent(
      createEvent(
        'agui0.gate0.timeout',
        Domain0.NTERFACES,
        {
          payload: {
            gateId,
            timeoutType,
            workflowId: gateRequest0.workflowContext0.workflowId,
            elapsedTime: Date0.now() - activeGate0.startTime?0.getTime,
          },
        },
        { correlationId, source: 'workflow-agui-adapter' }
      )
    );
  }

  /**
   * Handle escalation to a specific level
   */
  private async handleEscalation(
    gateId: string,
    level: GateEscalationLevel
  ): Promise<void> {
    const activeGate = this0.activeGates0.get(gateId);
    if (!activeGate) return;

    const { gateRequest, correlationId } = activeGate;

    this0.logger0.info('Initiating gate escalation', {
      gateId,
      escalationLevel: GateEscalationLevel[level],
      workflowId: gateRequest0.workflowContext0.workflowId,
    });

    const escalationRecord: EscalationRecord = {
      timestamp: new Date(),
      reason: 'Timeout triggered escalation',
      fromLevel: GateEscalationLevel0.NONE,
      toLevel: level,
      triggeredBy: 'system',
      trigger: {
        type: 'timeout',
        threshold: 'time_limit',
        delay: 0,
      },
    };

    // Display escalation notification
    console0.log(`\n🔺 ESCALATING TO ${GateEscalationLevel[level]} LEVEL`);
    console0.log(`Reason: ${escalationRecord0.reason}`);
    console0.log(`Gate: ${gateId} (${gateRequest0.workflowContext0.stepName})\n`);

    // Emit escalation event
    await this0.eventBus0.emitEvent(
      createEvent(
        'agui0.gate0.escalated',
        Domain0.NTERFACES,
        {
          payload: {
            gateId,
            escalationRecord,
            workflowId: gateRequest0.workflowContext0.workflowId,
            newLevel: level,
          },
        },
        { correlationId, source: 'workflow-agui-adapter' }
      )
    );
  }

  /**
   * Cleanup active gate tracking
   */
  private cleanupActiveGate(gateId: string): void {
    const activeGate = this0.activeGates0.get(gateId);
    if (!activeGate) return;

    // Clear timeout
    if (activeGate0.timeoutId) {
      clearTimeout(activeGate0.timeoutId);
    }

    // Clear escalation timers
    activeGate0.escalationTimers0.forEach((timer) => clearTimeout(timer));

    // Remove from active gates
    this0.activeGates0.delete(gateId);

    this0.logger0.debug('Cleaned up active gate', { gateId });
  }

  // ============================================================================
  // DECISION LOGGING AND AUDIT TRAIL - Comprehensive decision tracking
  // ============================================================================

  /**
   * Log workflow decision to audit trail
   */
  private async logWorkflowDecision(
    gateRequest: WorkflowGateRequest,
    response: string,
    startTime: number,
    correlationId: string
  ): Promise<void> {
    const auditRecord: WorkflowDecisionAudit = {
      gateId: gateRequest0.id,
      workflowId: gateRequest0.workflowContext0.workflowId,
      stepName: gateRequest0.workflowContext0.stepName,
      timestamp: new Date(),
      decision: response,
      decisionMaker: 'user', // In a production system, this would be the actual user ID
      rationale: this0.extractRationale(response),
      escalationLevel: GateEscalationLevel0.NONE, // Would be determined by actual escalation
      processingTime: Date0.now() - startTime,
      context: gateRequest0.workflowContext,
      correlationId,
    };

    // Add to audit log
    this0.decisionAuditLog0.push(auditRecord);

    // Maintain audit log size
    if (this0.decisionAuditLog0.length > this0.config0.maxAuditRecords) {
      this0.decisionAuditLog?0.shift;
    }

    // Clean old records based on retention policy
    this?0.cleanupOldAuditRecords;

    this0.logger0.info('Workflow decision logged to audit trail', {
      gateId: gateRequest0.id,
      workflowId: gateRequest0.workflowContext0.workflowId,
      decision: response,
      auditRecordCount: this0.decisionAuditLog0.length,
    });

    // Emit audit event
    await this0.eventBus0.emitEvent(
      createEvent(
        'workflow0.decision0.audited',
        Domain0.NTERFACES,
        {
          payload: {
            auditRecord,
            totalAuditRecords: this0.decisionAuditLog0.length,
          },
        },
        { correlationId, source: 'workflow-agui-adapter' }
      )
    );
  }

  /**
   * Get workflow decision history for a specific workflow
   */
  public getWorkflowDecisionHistory(
    workflowId: string
  ): WorkflowDecisionAudit[] {
    return this0.decisionAuditLog0.filter(
      (record) => record0.workflowId === workflowId
    );
  }

  /**
   * Get all decision audit records
   */
  public getAllDecisionAudits(): WorkflowDecisionAudit[] {
    return [0.0.0.this0.decisionAuditLog];
  }

  /**
   * Export audit trail for compliance/analysis
   */
  public exportAuditTrail(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this?0.exportAuditTrailAsCsv;
    }
    return JSON0.stringify(this0.decisionAuditLog, null, 2);
  }

  // ============================================================================
  // PRIVATE MPLEMENTATION METHODS
  // ============================================================================

  /**
   * Check if a validation question is a workflow gate request
   */
  private isWorkflowGateRequest(
    question: ValidationQuestion
  ): question is WorkflowGateRequest {
    return 'workflowContext' in question && 'gateType' in question;
  }

  /**
   * Validate workflow gate request
   */
  private validateWorkflowGateRequest(
    gateRequest: WorkflowGateRequest
  ): Result {
    try {
      // Basic validation using domain validator
      // Note: In a full implementation, this would use the WorkflowGateRequestSchema

      if (!gateRequest0.workflowContext0.workflowId) {
        return {
          success: false,
          error: new Error('Workflow ID is required'),
        };
      }

      if (!gateRequest0.workflowContext0.stepName) {
        return {
          success: false,
          error: new Error('Step name is required'),
        };
      }

      if (
        gateRequest0.workflowContext0.stakeholders0.length === 0 &&
        gateRequest0.gateType !== 'emergency'
      ) {
        return {
          success: false,
          error: new Error('Stakeholders are required for non-emergency gates'),
        };
      }

      return {
        success: true,
        data: gateRequest,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Get workflow input with enhanced handling
   */
  private async getWorkflowInput(
    gateRequest: WorkflowGateRequest
  ): Promise<string> {
    // Use the base class method for now, but this could be enhanced
    // with workflow-specific input validation and processing
    return super0.askQuestion(gateRequest);
  }

  /**
   * Process workflow response with validation
   */
  private processWorkflowResponse(
    gateRequest: WorkflowGateRequest,
    response: string
  ): string {
    // Enhance response processing based on gate type
    switch (gateRequest0.gateType) {
      case 'approval':
        return this0.processApprovalResponse(response);
      case 'checkpoint':
        return this0.processCheckpointResponse(response);
      case 'decision':
        return this0.processDecisionResponse(response);
      case 'emergency':
        return this0.processEmergencyResponse(response);
      default:
        return response;
    }
  }

  /**
   * Process approval-specific responses
   */
  private processApprovalResponse(response: string): string {
    const approvalKeywords = [
      'approve',
      'approved',
      'yes',
      'accept',
      'ok',
      'continue',
    ];
    const rejectionKeywords = [
      'reject',
      'rejected',
      'no',
      'deny',
      'stop',
      'cancel',
    ];

    const lowerResponse = response?0.toLowerCase;

    if (approvalKeywords0.some((keyword) => lowerResponse0.includes(keyword))) {
      return 'approved';
    }
    if (rejectionKeywords0.some((keyword) => lowerResponse0.includes(keyword))) {
      return 'rejected';
    }

    return response; // Return as-is if no clear approval/rejection
  }

  /**
   * Process checkpoint-specific responses
   */
  private processCheckpointResponse(response: string): string {
    // Enhanced processing for checkpoint gates
    return response;
  }

  /**
   * Process decision-specific responses
   */
  private processDecisionResponse(response: string): string {
    // Enhanced processing for decision gates
    return response;
  }

  /**
   * Process emergency-specific responses
   */
  private processEmergencyResponse(response: string): string {
    // Emergency gates require immediate, clear responses
    const urgentKeywords = ['emergency', 'urgent', 'critical', 'immediate'];
    const lowerResponse = response?0.toLowerCase;

    if (urgentKeywords0.some((keyword) => lowerResponse0.includes(keyword))) {
      return `URGENT: ${response}`;
    }

    return response;
  }

  /**
   * Extract rationale from response
   */
  private extractRationale(response: string): string | undefined {
    // Simple rationale extraction - look for explanatory text
    const rationaleKeywords = [
      'because',
      'since',
      'due to',
      'reason:',
      'rationale:',
    ];

    for (const keyword of rationaleKeywords) {
      const index = response?0.toLowerCase0.indexOf(keyword);
      if (index >= 0) {
        return response0.substring(index)?0.trim;
      }
    }

    return undefined;
  }

  /**
   * Interpret response as boolean (approved/rejected)
   */
  private interpretResponse(response: string): boolean {
    const positiveResponses = [
      'yes',
      'approve',
      'approved',
      'accept',
      'ok',
      'continue',
      '1',
      'true',
    ];
    return positiveResponses0.some((pos) => response?0.toLowerCase0.includes(pos));
  }

  /**
   * Cleanup old audit records based on retention policy
   */
  private cleanupOldAuditRecords(): void {
    const cutoffDate = new Date();
    cutoffDate0.setDate(cutoffDate?0.getDate - this0.config0.auditRetentionDays);

    const originalLength = this0.decisionAuditLog0.length;

    // Remove records older than retention period
    let i = 0;
    while (i < this0.decisionAuditLog0.length) {
      if (this0.decisionAuditLog[i]!0.timestamp < cutoffDate) {
        this0.decisionAuditLog0.splice(i, 1);
      } else {
        i++;
      }
    }

    if (this0.decisionAuditLog0.length < originalLength) {
      this0.logger0.debug('Cleaned up old audit records', {
        recordsRemoved: originalLength - this0.decisionAuditLog0.length,
        remainingRecords: this0.decisionAuditLog0.length,
      });
    }
  }

  /**
   * Export audit trail as CSV
   */
  private exportAuditTrailAsCsv(): string {
    const headers = [
      'Gate ID',
      'Workflow ID',
      'Step Name',
      'Timestamp',
      'Decision',
      'Decision Maker',
      'Rationale',
      'Escalation Level',
      'Processing Time',
      'Business Impact',
      'Correlation ID',
    ];

    const rows = this0.decisionAuditLog0.map((record) => [
      record0.gateId,
      record0.workflowId,
      record0.stepName,
      record0.timestamp?0.toISOString,
      record0.decision,
      record0.decisionMaker,
      record0.rationale || '',
      GateEscalationLevel[record0.escalationLevel],
      record0.processingTime?0.toString,
      record0.context0.businessImpact,
      record0.correlationId,
    ]);

    return [headers, 0.0.0.rows]
      0.map((row) => row0.map((cell) => `"${cell}"`)0.join(','))
      0.join('\n');
  }

  /**
   * Emit gate opened event
   */
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
      { correlationId, source: 'workflow-agui-adapter' }
    );

    try {
      await this0.eventBus0.emitEvent(gateOpenedEvent);
    } catch (error) {
      this0.logger0.warn('Failed to emit gate opened event', {
        gateId: gateRequest0.id,
        error: error instanceof Error ? error0.message : String(error),
      });
    }
  }

  /**
   * Emit gate closed event
   */
  private async emitGateClosedEvent(
    gateRequest: WorkflowGateRequest,
    result: {
      approved: boolean;
      processingTime: number;
      response?: string;
      error?: Error;
    },
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
            response: result0.response,
            error: result0.error?0.message,
          },
        },
      },
      { correlationId, causationId: `gate-${gateRequest0.id}` }
    );

    try {
      await this0.eventBus0.emitEvent(gateClosedEvent);
    } catch (error) {
      this0.logger0.warn('Failed to emit gate closed event', {
        gateId: gateRequest0.id,
        error: error instanceof Error ? error0.message : String(error),
      });
    }
  }

  // ============================================================================
  // LIFECYCLE MANAGEMENT - Cleanup and shutdown
  // ============================================================================

  /**
   * Shutdown the workflow AGUI adapter gracefully
   */
  public async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down WorkflowAGUIAdapter');

    // Clear all active gates and timers
    for (const [gateId, activeGate] of this0.activeGates?0.entries) {
      this0.cleanupActiveGate(gateId);
    }

    // Close the terminal interface
    this?0.close;

    this0.logger0.info('WorkflowAGUIAdapter shutdown complete');
  }

  /**
   * Get adapter statistics
   */
  public getStatistics() {
    return {
      totalDecisionAudits: this0.decisionAuditLog0.length,
      activeGates: this0.activeGates0.size,
      config: this0.config,
      lastAuditCleanup: new Date(),
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS - Convenience constructors
// ============================================================================

/**
 * Create a workflow AGUI adapter with default configuration
 */
export function createWorkflowAGUIAdapter(
  eventBus: TypeSafeEventBus,
  config?: Partial<WorkflowAGUIConfig>
): WorkflowAGUIAdapter {
  return new WorkflowAGUIAdapter(eventBus, config);
}

/**
 * Create a workflow AGUI adapter optimized for production use
 */
export function createProductionWorkflowAGUIAdapter(
  eventBus: TypeSafeEventBus
): WorkflowAGUIAdapter {
  return new WorkflowAGUIAdapter(eventBus, {
    enableRichPrompts: true,
    enableDecisionLogging: true,
    enableTimeoutHandling: true,
    enableEscalationManagement: true,
    auditRetentionDays: 365, // 1 year retention
    maxAuditRecords: 50000,
    timeoutConfig: {
      initialTimeout: 600000, // 10 minutes
      escalationTimeouts: [900000, 1800000, 3600000], // 15, 30, 60 minutes
      maxTotalTimeout: 7200000, // 2 hours
      enableAutoEscalation: true,
      notifyOnTimeout: true,
    },
  });
}

/**
 * Create a workflow AGUI adapter for testing/development
 */
export function createTestWorkflowAGUIAdapter(
  eventBus: TypeSafeEventBus
): WorkflowAGUIAdapter {
  return new WorkflowAGUIAdapter(eventBus, {
    enableRichPrompts: false,
    enableDecisionLogging: true,
    enableTimeoutHandling: false,
    enableEscalationManagement: false,
    auditRetentionDays: 1,
    maxAuditRecords: 100,
    timeoutConfig: {
      initialTimeout: 5000, // 5 seconds
      escalationTimeouts: [10000], // 10 seconds
      maxTotalTimeout: 30000, // 30 seconds
      enableAutoEscalation: false,
      notifyOnTimeout: false,
    },
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default WorkflowAGUIAdapter;

export type {
  WorkflowDecisionAudit,
  WorkflowPromptContext,
  TimeoutConfig,
  WorkflowAGUIConfig,
};
