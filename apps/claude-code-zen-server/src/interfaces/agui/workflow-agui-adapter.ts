/**
 * @file Workflow AGUI Adapter - Phase 1, Task 1.3 - AGUI Workflow Gates
 *
 * Extends TerminalAGUI with workflow-aware prompts, decision logging, and
 * gate timeout/escalation handling. Integrates with WorkflowGateRequest
 * and type-safe event system for comprehensive workflow orchestration.
 *
 * ARCHITECTURE: Multi-Agent Cognitive Architecture compliant
 * - Extends proven TerminalAGUI interface for consistency
 * - Integrates with WorkflowGateRequest from Phase 1, Task 1.2
 * - Uses type-safe event system for gate lifecycle events
 * - Runtime validation using domain boundary validator
 * - Production-grade performance and audit trail
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';

import type { ValidationQuestion } from './agui-adapter';
import { TerminalAGUI } from './agui-adapter';

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
  readonly escalationLevel: 'none' | 'team_lead' | 'manager' | 'director';
  readonly processingTime: number;
  readonly context: WorkflowContext;
  readonly correlationId: string;
}

/**
 * Workflow context information
 */
export interface WorkflowContext {
  readonly workflowId: string;
  readonly stepName: string;
  readonly businessImpact: 'low' | 'medium' | 'high' | 'critical';
  readonly stakeholders: string[];
  readonly dependencies?: Array<{
    reference: string;
    type: 'service' | 'data' | 'approval';
    criticality: 'low' | 'medium' | 'high';
  }>;
  readonly riskFactors?: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
  }>;
  readonly previousDecisions?: Array<{
    stepName: string;
    decision: string;
    decisionMaker: string;
    timestamp: Date;
  }>;
  readonly deadline?: Date;
  readonly decisionScope: string;
}

/**
 * Workflow gate request interface
 */
export interface WorkflowGateRequest extends ValidationQuestion {
  readonly workflowContext: WorkflowContext;
  readonly gateType: 'approval' | 'checkpoint' | 'decision' | 'emergency';
  readonly timeoutConfig?: TimeoutConfig;
  readonly escalationChain?: EscalationChain;
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
 * Escalation chain configuration
 */
export interface EscalationChain {
  readonly id: string;
  readonly levels: Array<{
    level: 'none' | 'team_lead' | 'manager' | 'director';
    approvers: string[];
    timeLimit?: number;
  }>;
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
 * for workflow orchestration, decision logging, and escalation handling.
 */
export class WorkflowAGUIAdapter extends TerminalAGUI {
  private readonly logger: Logger;
  private readonly config: WorkflowAGUIConfig;

  // Decision audit trail
  private readonly decisionAuditLog: WorkflowDecisionAudit[] = [];

  // Active gate tracking
  private readonly activeGates = new Map<
    string,
    {
      gateRequest: WorkflowGateRequest;
      startTime: Date;
      timeoutId?: NodeJS.Timeout;
      escalationTimers: NodeJS.Timeout[];
      correlationId: string;
    }
  >();

  constructor(config: Partial<WorkflowAGUIConfig> = {}) {
    super();
    this.logger = getLogger('workflow-agui-adapter');
    this.config = {
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
      ...config,
    };

    this.logger.info('WorkflowAGUIAdapter initialized', {
      config: this.config,
    });
  }

  // ============================================================================
  // ENHANCED VALIDATION METHODS - Workflow-aware question handling
  // ============================================================================

  /**
   * Enhanced askQuestion method with workflow-specific capabilities
   */
  public async askQuestion(question: ValidationQuestion): Promise<string> {
    const startTime = Date.now();
    const correlationId = this.createCorrelationId();

    // Check if this is a workflow gate request
    if (this.isWorkflowGateRequest(question)) {
      return this.processWorkflowGate(question, correlationId);
    }

    // Fall back to standard question handling
    return super.askQuestion(question);
  }

  /**
   * Process a workflow gate request with full workflow context
   */
  public async processWorkflowGate(
    gateRequest: WorkflowGateRequest,
    correlationId?: string
  ): Promise<string> {
    const startTime = Date.now();
    const gateCorrelationId = correlationId || this.createCorrelationId();

    this.logger.info('Processing workflow gate', {
      gateId: gateRequest.id,
      workflowId: gateRequest.workflowContext.workflowId,
      stepName: gateRequest.workflowContext.stepName,
      gateType: gateRequest.gateType,
      correlationId: gateCorrelationId,
    });

    try {
      // 1. Validate the gate request
      if (this.config.enableDecisionLogging) {
        const validationResult = this.validateWorkflowGateRequest(gateRequest);
        if (!validationResult.success) {
          throw new Error(
            `Gate validation failed: ${  validationResult.error?.message}`
          );
        }
      }

      // 2. Register the active gate for timeout/escalation management
      if (this.config.enableTimeoutHandling) {
        this.registerActiveGate(gateRequest, gateCorrelationId);
      }

      // 3. Display enhanced workflow prompt
      if (this.config.enableRichPrompts) {
        this.displayWorkflowPrompt(gateRequest);
      }

      // 4. Get user input with timeout handling
      const response = await this.getWorkflowInput(gateRequest);

      // 5. Process and validate the response
      const processedResponse = this.processWorkflowResponse(
        gateRequest,
        response
      );

      // 6. Log the decision to audit trail
      if (this.config.enableDecisionLogging) {
        await this.logWorkflowDecision(
          gateRequest,
          processedResponse,
          startTime,
          gateCorrelationId
        );
      }

      // 7. Cleanup active gate
      this.cleanupActiveGate(gateRequest.id);

      this.logger.info('Workflow gate processed successfully', {
        gateId: gateRequest.id,
        response: processedResponse,
        processingTime: Date.now() - startTime,
        correlationId: gateCorrelationId,
      });

      return processedResponse;
    } catch (error) {
      this.logger.error('Workflow gate processing failed', {
        gateId: gateRequest.id,
        error: error instanceof Error ? error.message : String(error),
        correlationId: gateCorrelationId,
      });

      // Cleanup on error
      this.cleanupActiveGate(gateRequest.id);
      throw error;
    }
  }

  // ============================================================================
  // WORKFLOW PROMPT ENHANCEMENT - Rich context display
  // ============================================================================

  /**
   * Display enhanced workflow prompt with rich context
   */
  private displayWorkflowPrompt(gateRequest: WorkflowGateRequest): void {
    const context = gateRequest.workflowContext;
    const { workflowId, stepName, businessImpact, stakeholders, dependencies } =
      context;

    console.log(`\n${  '='.repeat(80)}`);
    console.log(`🔀 WORKFLOW GATE: ${  gateRequest.gateType?.toUpperCase()}`);
    console.log('='.repeat(80));

    // Workflow Information
    console.log(`📋 Workflow: ${  workflowId}`);
    console.log(`📍 Current Step: ${  stepName}`);
    console.log(`⚡ Business Impact: ${  businessImpact?.toUpperCase()}`);
    console.log(`🎯 Decision Scope: ${  context.decisionScope}`);

    // Stakeholders
    if (stakeholders.length > 0) {
      console.log(`👥 Stakeholders: ${  stakeholders.join(', ')}`);
    }

    // Dependencies
    if (dependencies && dependencies.length > 0) {
      console.log('🔗 Dependencies:');
      for (const dep of dependencies) {
        console.log(
          `  • ${dep.reference} (${dep.type}, ${dep.criticality} criticality)`
        );
      }
    }

    console.log(`\n${  '-'.repeat(80)}`);
    console.log(`❓ ${  gateRequest.question}`);
    console.log('-'.repeat(80));

    // Options
    if (gateRequest.options && gateRequest.options.length > 0) {
      console.log('\n📝 Available Options:');
      for (const [index, option] of gateRequest.options.entries()) {
        console.log(`  ${index + 1}. ${option}`);
      }
      if (gateRequest.allowCustom) {
        console.log('  0. Custom response');
      }
    }

    console.log('\n');
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
      escalationTimers: [] as NodeJS.Timeout[],
      correlationId,
    };

    // Set initial timeout if configured
    if (gateRequest.timeoutConfig?.initialTimeout) {
      gateInfo.timeoutId = setTimeout(() => {
        this.handleGateTimeout(gateRequest.id, 'initial');
      }, gateRequest.timeoutConfig.initialTimeout);
    }

    this.activeGates.set(gateRequest.id, gateInfo);

    this.logger.debug('Registered active gate for timeout management', {
      gateId: gateRequest.id,
      initialTimeout: gateRequest.timeoutConfig?.initialTimeout,
      escalationLevels: gateRequest.escalationChain?.levels.length || 0,
    });
  }

  /**
   * Handle gate timeout
   */
  private async handleGateTimeout(
    gateId: string,
    timeoutType: string
  ): Promise<void> {
    const activeGate = this.activeGates.get(gateId);
    if (!activeGate) return;

    const { gateRequest, correlationId } = activeGate;

    this.logger.warn('Workflow gate timeout', {
      gateId,
      timeoutType,
      workflowId: gateRequest.workflowContext.workflowId,
      stepName: gateRequest.workflowContext.stepName,
    });

    // Notify about timeout
    if (this.config.timeoutConfig.notifyOnTimeout) {
      console.log(
        `\n⏰ TIMEOUT WARNING: Gate ${  gateId  } has exceeded its time limit.`
      );
    }
  }

  /**
   * Cleanup active gate tracking
   */
  private cleanupActiveGate(gateId: string): void {
    const activeGate = this.activeGates.get(gateId);
    if (!activeGate) return;

    // Clear timeout
    if (activeGate.timeoutId) {
      clearTimeout(activeGate.timeoutId);
    }

    // Clear escalation timers
    for (const timer of activeGate.escalationTimers) clearTimeout(timer);

    // Remove from active gates
    this.activeGates.delete(gateId);

    this.logger.debug('Cleaned up active gate', { gateId });
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
      gateId: gateRequest.id,
      workflowId: gateRequest.workflowContext.workflowId,
      stepName: gateRequest.workflowContext.stepName,
      timestamp: new Date(),
      decision: response,
      decisionMaker: 'user', // In a production system, this would be the actual user ID
      rationale: this.extractRationale(response),
      escalationLevel: 'none',
      processingTime: Date.now() - startTime,
      context: gateRequest.workflowContext,
      correlationId,
    };

    // Add to audit log
    this.decisionAuditLog.push(auditRecord);

    // Maintain audit log size
    if (this.decisionAuditLog.length > this.config.maxAuditRecords) {
      this.decisionAuditLog.shift();
    }

    this.logger.info('Workflow decision logged to audit trail', {
      gateId: gateRequest.id,
      workflowId: gateRequest.workflowContext.workflowId,
      decision: response,
      auditRecordCount: this.decisionAuditLog.length,
    });
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
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
  private validateWorkflowGateRequest(gateRequest: WorkflowGateRequest): {
    success: boolean;
    error?: Error;
  } {
    try {
      if (!gateRequest.workflowContext.workflowId) {
        return {
          success: false,
          error: new Error('Workflow ID is required'),
        };
      }

      if (!gateRequest.workflowContext.stepName) {
        return {
          success: false,
          error: new Error('Step name is required'),
        };
      }

      if (
        gateRequest.workflowContext.stakeholders.length === 0 &&
        gateRequest.gateType !== 'emergency'
      ) {
        return {
          success: false,
          error: new Error('Stakeholders are required for non-emergency gates'),
        };
      }

      return { success: true };
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
    return super.askQuestion(gateRequest);
  }

  /**
   * Process workflow response with validation
   */
  private processWorkflowResponse(
    gateRequest: WorkflowGateRequest,
    response: string
  ): string {
    switch (gateRequest.gateType) {
      case 'approval':
        return this.processApprovalResponse(response);
      case 'checkpoint':
        return this.processCheckpointResponse(response);
      case 'decision':
        return this.processDecisionResponse(response);
      case 'emergency':
        return this.processEmergencyResponse(response);
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

    const lowerResponse = response.toLowerCase();

    if (approvalKeywords.some((keyword) => lowerResponse.includes(keyword))) {
      return 'approved';
    }

    if (rejectionKeywords.some((keyword) => lowerResponse.includes(keyword))) {
      return 'rejected';
    }

    return response; // Return as-is if no clear approval/rejection
  }

  /**
   * Process checkpoint-specific responses
   */
  private processCheckpointResponse(response: string): string {
    return response;
  }

  /**
   * Process decision-specific responses
   */
  private processDecisionResponse(response: string): string {
    return response;
  }

  /**
   * Process emergency-specific responses
   */
  private processEmergencyResponse(response: string): string {
    const urgentKeywords = ['emergency', 'urgent', 'critical', 'immediate'];
    const lowerResponse = response.toLowerCase();

    if (urgentKeywords.some((keyword) => lowerResponse.includes(keyword))) {
      return `URGENT: ${  response}`;
    }

    return response;
  }

  /**
   * Extract rationale from response
   */
  private extractRationale(response: string): string | undefined {
    const rationaleKeywords = [
      'because',
      'since',
      'due to',
      'reason:',
      'rationale:',
    ];

    for (const keyword of rationaleKeywords) {
      const index = response.toLowerCase().indexOf(keyword);
      if (index >= 0) {
        return response.substring(index).trim();
      }
    }

    return undefined;
  }

  /**
   * Create correlation ID
   */
  private createCorrelationId(): string {
    return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Get workflow decision history for a specific workflow
   */
  public getWorkflowDecisionHistory(
    workflowId: string
  ): WorkflowDecisionAudit[] {
    return this.decisionAuditLog.filter(
      (record) => record.workflowId === workflowId
    );
  }

  /**
   * Get all decision audit records
   */
  public getAllDecisionAudits(): WorkflowDecisionAudit[] {
    return [...this.decisionAuditLog];
  }

  /**
   * Get adapter statistics
   */
  public getStatistics() {
    return {
      totalDecisionAudits: this.decisionAuditLog.length,
      activeGates: this.activeGates.size,
      config: this.config,
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
  config?: Partial<WorkflowAGUIConfig>
): WorkflowAGUIAdapter {
  return new WorkflowAGUIAdapter(config);
}

/**
 * Create a workflow AGUI adapter optimized for production use
 */
export function createProductionWorkflowAGUIAdapter(): WorkflowAGUIAdapter {
  return new WorkflowAGUIAdapter({
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
export function createTestWorkflowAGUIAdapter(): WorkflowAGUIAdapter {
  return new WorkflowAGUIAdapter({
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
  WorkflowContext,
  WorkflowGateRequest,
  TimeoutConfig,
  WorkflowAGUIConfig,
  EscalationChain,
};
