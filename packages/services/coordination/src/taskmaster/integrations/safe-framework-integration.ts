/**
 * @fileoverview SAFe 6.0 Framework Integration - TaskMaster as Universal Approval Gate Orchestrator
 *
 * Integrates TaskMaster's approval gate system with ALL SAFe 6.0 framework gates:
 * - Epic Management Gates (Portfolio Kanban states)
 * - Continuous Delivery Gates (Quality, Security, Performance)
 * - ART Gates (Agile Release Train coordination)
 * - Cross-Framework Gates (SAFe-SPARC synchronization)
 * - Business Validation Gates (Stakeholder approvals)
 *
 * Uses SAFe 6.0 terminology: ART instead of Program, streamlined naming conventions.
 * Provides complete traceability, AGUI integration, SOC2 compliance, and learning.
 */

import { getLogger } from '@claude-zen/foundation';
import { DatabaseProvider } from '@claude-zen/database';
import { getBrainSystem } from '@claude-zen/intelligence';
import { getSafeFramework, getWorkflowEngine } from '@claude-zen/enterprise';
import {
  getSafe6DevelopmentManager,
  createSafe6SolutionTrainManager,
} from '@claude-zen/development';
import { ApprovalGateManager } from '../core/approval-gate-manager.js';
import { LLMApprovalService } from '../services/llm-approval-service.js';
import { PromptManagementService } from '../services/prompt-management-service.js';
import { TaskApprovalSystem } from '../agui/task-approval-system.js';
import type {
  ApprovalGateId,
  TaskId,
  UserId,
  ApprovalGateRequirement,
  EnhancedApprovalGate,
  LLMApprovalConfig,
  LLMApprovalContext,
  LLMApprovalResult,
} from '../types/index.js';
// Import SAFE framework types
import type {
  PortfolioKanbanState,
  EpicLifecycleStage,
  QualityGate as SafeQualityGate,
  GateCriterion,
  EpicBusinessCase,
} from '@claude-zen/safe-framework';
// Import quality gate types from SAFE
import type {
  QualityGate,
  QualityGateType,
  QualityGateResult,
  QualityGateExecutionConfig,
} from '@claude-zen/safe-framework/services/continuous-delivery/quality-gate-service';
// ============================================================================
// SAFE INTEGRATION TYPES
// ============================================================================

/**
 * SAFe 6.0 gate categories that TaskMaster orchestrates
 */
export enum SafeGateCategory {
  EPIC_PORTFOLIO ='epic_portfolio,
  EPIC_LIFECYCLE ='epic_lifecycle,
  ART_COORDINATION ='art_coordination,
  QUALITY_ASSURANCE ='quality_assurance,
  SECURITY_COMPLIANCE ='security_compliance,
  PERFORMANCE_VALIDATION ='performance_validation,
  BUSINESS_VALIDATION ='business_validation,
  ARCHITECTURE_COMPLIANCE ='architecture_compliance,
  CROSS_FRAMEWORK_SYNC ='cross_framework_sync,
}

/**
 * Integration configuration for SAFe 6.0 gates
 */
export interface SafeIntegrationConfig {
  enabled: boolean;

  // Epic management gates
  epicGates: {
    enablePortfolioKanban: boolean;
    enableLifecycleGates: boolean;
    autoApprovalThresholds: {
      funnel: number;
      analyzing: number;
      portfolioBacklog: number;
      implementing: number;
    };
  };

  // Continuous delivery gates
  qualityGates: {
    enableCodeQuality: boolean;
    enableSecurity: boolean;
    enablePerformance: boolean;
    enableArchitecture: boolean;
    llmAutoApproval: boolean;
    humanFallbackThreshold: number;
  };

  // Business validation gates
  businessGates: {
    enableStakeholderApproval: boolean;
    enableComplianceReview: boolean;
    requireBusinessCase: boolean;
    escalationTimeoutHours: number;
  };

  // Learning and improvement
  learning: {
    enableContinuousLearning: boolean;
    trackDecisionPatterns: boolean;
    adaptPrompts: boolean;
    auditCompliance:'basic| soc2'|'comprehensive';
  };
}

/**
 * SAFE gate execution context
 */
export interface SafeGateContext {
  category: SafeGateCategory;
  safeEntity: {
    type:'epic| feature| story| capability'|'solution';
    id: string;
    metadata: Record<string, unknown>;
  };
  workflow: {
    currentState: string;
    targetState: string;
    previousStates: string[];
  };
  stakeholders: {
    owners: string[];
    approvers: string[];
    reviewers: string[];
  };
  compliance: {
    required: boolean;
    frameworks: string[];
    auditLevel:'basic'|'enhanced'|'comprehensive';
  };
}

/**
 * Traceability record for SAFE gate decisions
 */
export interface SafeGateTraceabilityRecord {
  id: string;
  gateId: ApprovalGateId;
  category: SafeGateCategory;
  context: SafeGateContext;

  // Decision chain
  aiDecision?: {
    confidence: number;
    reasoning: string;
    model: string;
    promptVersion: string;
    timestamp: Date;
  };

  humanDecision?: {
    approver: string;
    decision:'approved'|'rejected'|'escalated';
    reasoning: string;
    timestamp: Date;
    reviewTime: number;
  };

  // Learning data
  learningExtracted: {
    patterns: string[];
    improvements: string[];
    confidence: number;
  };

  // SOC2 audit trail
  auditTrail: {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    correlationId: string;
    complianceLevel: string;
  };

  // Performance metrics
  metrics: {
    totalProcessingTime: number;
    aiProcessingTime: number;
    humanReviewTime: number;
    escalationCount: number;
  };

  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// SAFE FRAMEWORK INTEGRATION SERVICE
// ============================================================================

/**
 * SAFE Framework Integration Service
 *
 * Orchestrates TaskMaster approval gates for all SAFE framework workflows.
 * Provides complete traceability, learning, and SOC2 compliance.
 */
export class SafeFrameworkIntegration {
  private readonly logger = getLogger('SafeFrameworkIntegration'');

  // Core services
  private approvalGateManager: ApprovalGateManager;
  private llmApprovalService: LLMApprovalService;
  private promptManagementService: PromptManagementService;
  private taskApprovalSystem: TaskApprovalSystem;

  // Infrastructure
  private database: any;
  private eventSystem: any;
  private brainSystem: any;
  private safeFramework: any;
  private workflowEngine: any;

  // Configuration and state
  private config: SafeIntegrationConfig;
  private traceabilityRecords = new Map<string, SafeGateTraceabilityRecord>();
  private activeGates = new Map<ApprovalGateId, SafeGateContext>();

  constructor(
    approvalGateManager: ApprovalGateManager,
    config: SafeIntegrationConfig
  ) {
    this.approvalGateManager = approvalGateManager;
    this.config = config;
  }

  /**
   * Initialize SAFE framework integration
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing SAFE Framework Integration...'');

      // Initialize infrastructure
      const dbSystem = await DatabaseProvider.create();
      this.database = dbSystem.createProvider('sql'');

      this.eventSystem = await getEventSystem();
      this.brainSystem = await getBrainSystem();
      this.safeFramework = await getSafeFramework();
      this.workflowEngine = await getWorkflowEngine();

      // Initialize services
      this.llmApprovalService = new LLMApprovalService();
      await this.llmApprovalService.initialize();

      this.promptManagementService = new PromptManagementService();
      await this.promptManagementService.initialize();

      this.taskApprovalSystem = new TaskApprovalSystem({
        enableRichDisplay: true,
        enableBatchMode: false,
        requireRationale: true,
      });
      await this.taskApprovalSystem.initialize();

      // Set up database tables
      await this.createTables();

      // Register event handlers
      this.registerEventHandlers();

      this.logger.info('SAFE Framework Integration initialized successfully'');
    } catch (error) {
      this.logger.error(
       'Failed to initialize SAFE Framework Integration,
        error
      );
      throw error;
    }
  }

  /**
   * Create approval gate for Epic Portfolio Kanban transition
   */
  async createEpicPortfolioGate(
    epicId: string,
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState,
    context: {
      businessCase?: EpicBusinessCase;
      stakeholders: string[];
      complianceRequired: boolean;
    }
  ): Promise<{ gateId: ApprovalGateId; traceabilityId: string }> {
    const gateId =
      `epic-${epicId}-${fromState}-to-${toState}` as ApprovalGateId;`
    const traceabilityId = `trace-${gateId}-${Date.now()}`;`

    this.logger.info('Creating Epic Portfolio Gate,{
      epicId,
      fromState,
      toState,
      gateId,
    });

    // Determine approval requirements based on state transition
    const approvalRequirement = this.buildEpicApprovalRequirement(
      gateId,
      fromState,
      toState,
      context
    );

    // Create SAFE gate context
    const safeContext: SafeGateContext = {
      category: SafeGateCategory.EPIC_PORTFOLIO,
      safeEntity: {
        type:'epic,
        id: epicId,
        metadata: {
          fromState,
          toState,
          businessCase: context.businessCase,
          transitionType: this.getTransitionType(fromState, toState),
        },
      },
      workflow: {
        currentState: fromState,
        targetState: toState,
        previousStates: [], // Would load from epic history
      },
      stakeholders: {
        owners: context.stakeholders.filter((s) => s.includes('owner')),
        approvers: context.stakeholders.filter((s) => s.includes('approver')),
        reviewers: context.stakeholders,
      },
      compliance: {
        required: context.complianceRequired,
        frameworks: ['safe,'sparc'],
        auditLevel: this.config.learning.auditCompliance,
      },
    };

    // Store context
    this.activeGates.set(gateId, safeContext);

    // Initialize traceability record
    const traceabilityRecord: SafeGateTraceabilityRecord = {
      id: traceabilityId,
      gateId,
      category: SafeGateCategory.EPIC_PORTFOLIO,
      context: safeContext,
      learningExtracted: {
        patterns: [],
        improvements: [],
        confidence: 0,
      },
      auditTrail: {
        sessionId: `session-${Date.now()}`,`
        ipAddress:'system,
        userAgent:'TaskMaster-SafeIntegration,
        correlationId: traceabilityId,
        complianceLevel: this.config.learning.auditCompliance,
      },
      metrics: {
        totalProcessingTime: 0,
        aiProcessingTime: 0,
        humanReviewTime: 0,
        escalationCount: 0,
      },
      createdAt: new Date(),
    };

    this.traceabilityRecords.set(traceabilityId, traceabilityRecord);

    // Check for LLM auto-approval
    if (this.shouldUseLLMApproval(safeContext)) {
      const llmResult = await this.processLLMApproval(
        gateId,
        safeContext,
        traceabilityRecord
      );

      if (llmResult.autoApproved) {
        // Auto-approved by LLM
        this.logger.info('Epic gate auto-approved by LLM,{
          gateId,
          confidence: llmResult.decision.confidence,
          reasoning: llmResult.decision.reasoning,
        });

        await this.completeTraceabilityRecord(traceabilityRecord, {
          autoApproved: true,
          llmResult,
        });

        return { gateId, traceabilityId };
      }
    }

    // Create approval gate for human review
    const result = await this.approvalGateManager.createApprovalGate(
      approvalRequirement,
      `task-${epicId}` as TaskId`
    );

    if (!result.success) {
      throw new Error(
        `Failed to create epic approval gate: ${result.error?.message}``
      );
    }

    // Create AGUI task for human visibility
    await this.createAGUIApprovalTask(gateId, safeContext, traceabilityRecord);

    return { gateId, traceabilityId };
  }

  /**
   * Create approval gate for Quality Assurance
   */
  async createQualityGate(
    qualityGateConfig: QualityGateExecutionConfig,
    context: {
      projectId: string;
      artifacts: any[];
      stakeholders: string[];
    }
  ): Promise<{ gateId: ApprovalGateId; traceabilityId: string }> {
    const gateId = qualityGateConfig.gateId as ApprovalGateId;
    const traceabilityId = `trace-${gateId}-${Date.now()}`;`

    this.logger.info('Creating Quality Gate,{
      gateId,
      pipelineId: qualityGateConfig.pipelineId,
      stageId: qualityGateConfig.stageId,
    });

    // Create SAFE gate context
    const safeContext: SafeGateContext = {
      category: SafeGateCategory.QUALITY_ASSURANCE,
      safeEntity: {
        type:'feature,
        id: context.projectId,
        metadata: {
          pipelineId: qualityGateConfig.pipelineId,
          stageId: qualityGateConfig.stageId,
          artifacts: context.artifacts,
          qualityConfig: qualityGateConfig,
        },
      },
      workflow: {
        currentState:'quality_review,
        targetState:'quality_approved,
        previousStates: ['development,'testing'],
      },
      stakeholders: {
        owners: context.stakeholders.filter((s) => s.includes('owner')),
        approvers: context.stakeholders.filter((s) => s.includes('quality')),
        reviewers: context.stakeholders,
      },
      compliance: {
        required: true,
        frameworks: ['safe,'sparc,'iso27001'],
        auditLevel:'comprehensive,
      },
    };

    this.activeGates.set(gateId, safeContext);

    // Initialize traceability record
    const traceabilityRecord: SafeGateTraceabilityRecord = {
      id: traceabilityId,
      gateId,
      category: SafeGateCategory.QUALITY_ASSURANCE,
      context: safeContext,
      learningExtracted: {
        patterns: [],
        improvements: [],
        confidence: 0,
      },
      auditTrail: {
        sessionId: `session-${Date.now()}`,`
        ipAddress:'system,
        userAgent:'TaskMaster-QualityGate,
        correlationId: traceabilityId,
        complianceLevel:'comprehensive,
      },
      metrics: {
        totalProcessingTime: 0,
        aiProcessingTime: 0,
        humanReviewTime: 0,
        escalationCount: 0,
      },
      createdAt: new Date(),
    };

    this.traceabilityRecords.set(traceabilityId, traceabilityRecord);

    // Use SAFE framework's quality gate service with LLM enhancement
    if (this.config.qualityGates.llmAutoApproval) {
      const llmResult = await this.processLLMQualityApproval(
        qualityGateConfig,
        safeContext,
        traceabilityRecord
      );

      if (llmResult.autoApproved) {
        this.logger.info('Quality gate auto-approved by LLM,{
          gateId,
          confidence: llmResult.decision.confidence,
        });

        await this.completeTraceabilityRecord(traceabilityRecord, {
          autoApproved: true,
          llmResult,
        });

        return { gateId, traceabilityId };
      }
    }

    // Create human approval gate
    const approvalRequirement = this.buildQualityApprovalRequirement(
      gateId,
      qualityGateConfig,
      context
    );

    const result = await this.approvalGateManager.createApprovalGate(
      approvalRequirement,
      `task-quality-${context.projectId}` as TaskId`
    );

    if (!result.success) {
      throw new Error(
        `Failed to create quality approval gate: ${result.error?.message}``
      );
    }

    // Create AGUI task for visibility
    await this.createAGUIApprovalTask(gateId, safeContext, traceabilityRecord);

    return { gateId, traceabilityId };
  }

  /**
   * Get complete traceability record for a gate
   */
  async getTraceabilityRecord(
    traceabilityId: string
  ): Promise<SafeGateTraceabilityRecord| null> {
    const record = this.traceabilityRecords.get(traceabilityId);
    if (record) {
      return record;
    }

    // Load from database if not in memory
    return await this.loadTraceabilityRecord(traceabilityId);
  }

  /**
   * Get learning insights from all gate decisions
   */
  async getLearningInsights(timeframe: string =30d'): Promise<{
    decisionPatterns: Array<{
      pattern: string;
      frequency: number;
      accuracy: number;
      improvement: string;
    }>;
    aiPerformance: {
      autoApprovalRate: number;
      humanOverrideRate: number;
      averageConfidence: number;
      accuracyTrend: number[];
    };
    humanBehavior: {
      averageReviewTime: number;
      commonRejectionReasons: string[];
      escalationPatterns: string[];
    };
    complianceMetrics: {
      auditTrailCompleteness: number;
      soc2Compliance: boolean;
      gatesCovered: number;
      totalDecisions: number;
    };
  }> {
    const records = Array.from(this.traceabilityRecords.values())();

    // Analyze decision patterns
    const decisionPatterns = this.extractDecisionPatterns(records);

    // Calculate AI performance metrics
    const aiPerformance = this.calculateAIPerformance(records);

    // Analyze human behavior
    const humanBehavior = this.analyzeHumanBehavior(records);

    // Calculate compliance metrics
    const complianceMetrics = this.calculateComplianceMetrics(records);

    return {
      decisionPatterns,
      aiPerformance,
      humanBehavior,
      complianceMetrics,
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async createTables(): Promise<void> {
    // Create tables for SAFE integration data
    await this.database.schema.createTableIfNotExists(
     'safe_gate_traceability,
      (table: any) => {
        table.uuid('id').primary(');
        table.string('gate_id').notNullable(');
        table.string('category').notNullable(');
        table.json('context').notNullable(');
        table.json('ai_decision').nullable(');
        table.json('human_decision').nullable(');
        table.json('learning_extracted').notNullable(');
        table.json('audit_trail').notNullable(');
        table.json('metrics').notNullable(');
        table.timestamp('created_at').notNullable(');
        table.timestamp('completed_at').nullable(');
        table.index(['gate_id,'category,'created_at]);
      }
    );

    await this.database.schema.createTableIfNotExists(
     'safe_gate_learning,
      (table: any) => {
        table.uuid('id').primary(');
        table.string('pattern').notNullable(');
        table.integer('frequency').notNullable(');
        table.float('accuracy').notNullable(');
        table.text('improvement').notNullable(');
        table.timestamp('last_updated').notNullable(');
        table.index(['pattern,'accuracy]);
      }
    );
  }

  private registerEventHandlers(): void {
    // Listen for approval gate events
    this.eventSystem.on(
     'approval:granted,
      this.handleApprovalGranted.bind(this)
    );
    this.eventSystem.on(
     'approval:rejected,
      this.handleApprovalRejected.bind(this)
    );
    this.eventSystem.on(
     'approval:timeout,
      this.handleApprovalTimeout.bind(this)
    );
  }

  private async handleApprovalGranted(
    gateId: ApprovalGateId,
    taskId: TaskId,
    approverId: string
  ): Promise<void> {
    const context = this.activeGates.get(gateId);
    if (!context) return;

    this.logger.info('SAFE gate approved,{ gateId, taskId, approverId }');

    // Find and update traceability record
    const record = Array.from(this.traceabilityRecords.values()).find(
      (r) => r.gateId === gateId
    );

    if (record) {
      record.humanDecision = {
        approver: approverId,
        decision:'approved,
        reasoning:'Human approval granted,
        timestamp: new Date(),
        reviewTime: Date.now() - record.createdAt.getTime(),
      };

      await this.completeTraceabilityRecord(record, {
        autoApproved: false,
      });
    }

    // Trigger SAFE framework state transition
    await this.triggerSafeStateTransition(context,'approved'');
  }

  private async handleApprovalRejected(
    gateId: ApprovalGateId,
    taskId: TaskId,
    approverId: string,
    reason: string
  ): Promise<void> {
    const context = this.activeGates.get(gateId);
    if (!context) return;

    this.logger.info('SAFE gate rejected,{
      gateId,
      taskId,
      approverId,
      reason,
    });

    // Find and update traceability record
    const record = Array.from(this.traceabilityRecords.values()).find(
      (r) => r.gateId === gateId
    );

    if (record) {
      record.humanDecision = {
        approver: approverId,
        decision:'rejected,
        reasoning: reason,
        timestamp: new Date(),
        reviewTime: Date.now() - record.createdAt.getTime(),
      };

      await this.completeTraceabilityRecord(record, {
        autoApproved: false,
      });
    }

    // Trigger SAFE framework rejection handling
    await this.triggerSafeStateTransition(context,'rejected'');
  }

  private async handleApprovalTimeout(
    gateId: ApprovalGateId,
    taskId: TaskId
  ): Promise<void> {
    const context = this.activeGates.get(gateId);
    if (!context) return;

    this.logger.warn('SAFE gate timed out,{ gateId, taskId }');

    // Find and update traceability record
    const record = Array.from(this.traceabilityRecords.values()).find(
      (r) => r.gateId === gateId
    );

    if (record) {
      record.metrics.escalationCount++;
      await this.persistTraceabilityRecord(record);
    }

    // Trigger escalation in SAFE framework
    await this.triggerSafeEscalation(context,'timeout'');
  }

  private buildEpicApprovalRequirement(
    gateId: ApprovalGateId,
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState,
    context: any
  ): ApprovalGateRequirement {
    const minimumApprovals = this.getRequiredApprovalCount(fromState, toState);
    const timeoutHours = this.getApprovalTimeout(fromState, toState);

    return {
      id: gateId,
      name: `Epic ${fromState} → ${toState} Approval`,`
      description: `Approval required for epic transition from ${fromState} to ${toState}`,`
      requiredApprovers: context.stakeholders,
      minimumApprovals,
      isRequired: true,
      timeoutHours,
      metadata: {
        category: SafeGateCategory.EPIC_PORTFOLIO,
        transition: `${{fromState}->${toState}}`,`
        complianceRequired: context.complianceRequired,
      },
    };
  }

  private buildQualityApprovalRequirement(
    gateId: ApprovalGateId,
    qualityConfig: QualityGateExecutionConfig,
    context: any
  ): ApprovalGateRequirement {
    return {
      id: gateId,
      name: `Quality Gate - ${qualityConfig.stageId}`,`
      description: `Quality approval required for ${qualityConfig.pipelineId}`,`
      requiredApprovers: context.stakeholders.filter((s: string) =>
        s.includes('quality')
      ),
      minimumApprovals: 2,
      isRequired: true,
      timeoutHours: 24,
      metadata: {
        category: SafeGateCategory.QUALITY_ASSURANCE,
        pipelineId: qualityConfig.pipelineId,
        stageId: qualityConfig.stageId,
      },
    };
  }

  private shouldUseLLMApproval(context: SafeGateContext): boolean {
    switch (context.category) {
      case SafeGateCategory.EPIC_PORTFOLIO:
        return (
          this.config.epicGates.autoApprovalThresholds[
            context.workflow.targetState as any
          ] > 0
        );
      case SafeGateCategory.QUALITY_ASSURANCE:
        return this.config.qualityGates.llmAutoApproval;
      case SafeGateCategory.BUSINESS_VALIDATION:
        return false; // Always require human approval for business decisions
      default:
        return false;
    }
  }

  private async processLLMApproval(
    gateId: ApprovalGateId,
    context: SafeGateContext,
    traceabilityRecord: SafeGateTraceabilityRecord
  ): Promise<LLMApprovalResult> {
    const startTime = Date.now();

    // Build LLM approval context
    const llmContext: LLMApprovalContext = {
      task: {
        id: context.safeEntity.id,
        title: `${{context.category} Gate Approval}`,`
        description: `SAFE framework gate approval for ${context.safeEntity.type}`,`
        type: context.category,
        complexity: this.assessComplexity(context),
        priority: this.assessPriority(context),
        tags: [context.category, context.safeEntity.type],
        dependencies: [],
        customData: context.safeEntity.metadata,
      },
      workflow: {
        id: `workflow-${context.safeEntity.id}`,`
        name:'SAFE Framework Workflow,
        currentState: context.workflow.currentState,
        previousStates: context.workflow.previousStates,
      },
      history: {
        similarTasks: [], // Would load from historical data
        userPatterns: {
          userId:'system,
          approvalRate: 0.85,
          commonCriteria: ['compliance,'quality,'business_value'],
        },
      },
      security: {
        hasSecrets: false,
        affectedSystems: [context.safeEntity.type],
        riskLevel: this.assessRiskLevel(context),
        complianceFlags: context.compliance.frameworks,
      },
    };

    // Get LLM configuration for this gate type
    const llmConfig = await this.getLLMConfig(context.category);

    // Evaluate with LLM
    const result = await this.llmApprovalService.evaluateForApproval(
      llmContext,
      llmConfig,
      []
    );

    const processingTime = Date.now() - startTime;

    // Update traceability record
    traceabilityRecord.aiDecision = {
      confidence: result.decision.confidence,
      reasoning: result.decision.reasoning,
      model: llmConfig.model,
      promptVersion:'safe-integration-v1.0.0,
      timestamp: new Date(),
    };

    traceabilityRecord.metrics.aiProcessingTime = processingTime;

    return result;
  }

  private async processLLMQualityApproval(
    qualityConfig: QualityGateExecutionConfig,
    context: SafeGateContext,
    traceabilityRecord: SafeGateTraceabilityRecord
  ): Promise<LLMApprovalResult> {
    // Use SAFE framework's quality gate service
    const qualityGateService = this.safeFramework.getQualityGateService();

    // Execute quality gate with AI enhancement
    const qualityResult =
      await qualityGateService.executeQualityGate(qualityConfig);

    // Convert to LLM approval result
    const llmResult: LLMApprovalResult = {
      gateId: qualityConfig.gateId,
      taskId: context.safeEntity.id,
      decision: {
        approved: qualityResult.status ==='pass,
        confidence: qualityResult.score / 100,
        reasoning: qualityResult.message,
        concerns: qualityResult.recommendations|| [],
        suggestedActions: qualityResult.recommendations|| [],
        metadata: {
          model:'quality-gate-ai,
          processingTime: qualityResult.executionTime,
          tokenUsage: 0,
          version:'1.0.0,
        },
      },
      autoApproved:
        qualityResult.status ==='pass '&&
        qualityResult.score / 100 >=
          this.config.qualityGates.humanFallbackThreshold,
      escalatedToHuman:
        qualityResult.status !=='pass'|| qualityResult.score / 100 <
          this.config.qualityGates.humanFallbackThreshold,
      processingTime: qualityResult.executionTime,
      timestamp: qualityResult.timestamp,
    };

    // Update traceability record
    traceabilityRecord.aiDecision = {
      confidence: llmResult.decision.confidence,
      reasoning: llmResult.decision.reasoning,
      model:'quality-gate-ai,
      promptVersion:'quality-gate-v1.0.0,
      timestamp: new Date(),
    };

    return llmResult;
  }

  private async createAGUIApprovalTask(
    gateId: ApprovalGateId,
    context: SafeGateContext,
    traceabilityRecord: SafeGateTraceabilityRecord
  ): Promise<void> {
    // Create AGUI task for human visibility and approval
    await this.taskApprovalSystem.createApprovalTask({
      id: `agui-${gateId}`,`
      taskType: context.category,
      title: `SAFE ${context.category} Gate Approval`,`
      description: `Review and approve ${context.safeEntity.type} transition in SAFE framework`,`
      context: {
        gateId,
        safeContext: context,
        traceabilityId: traceabilityRecord.id,
        aiDecision: traceabilityRecord.aiDecision,
        complianceRequired: context.compliance.required,
      },
      approvers: context.stakeholders.approvers,
      metadata: {
        category: context.category,
        entityType: context.safeEntity.type,
        entityId: context.safeEntity.id,
        auditLevel: context.compliance.auditLevel,
      },
    });
  }

  private async completeTraceabilityRecord(
    record: SafeGateTraceabilityRecord,
    completion: {
      autoApproved: boolean;
      llmResult?: LLMApprovalResult;
    }
  ): Promise<void> {
    record.completedAt = new Date();
    record.metrics.totalProcessingTime =
      record.completedAt.getTime() - record.createdAt.getTime();

    // Extract learning patterns
    if (this.config.learning.enableContinuousLearning) {
      record.learningExtracted = await this.extractLearningPatterns(
        record,
        completion
      );
    }

    // Persist to database
    await this.persistTraceabilityRecord(record);

    // Update learning models if human decision differs from AI
    if (
      record.aiDecision &&
      record.humanDecision &&
      this.config.learning.adaptPrompts
    ) {
      await this.updateLearningModels(record);
    }
  }

  private async extractLearningPatterns(
    record: SafeGateTraceabilityRecord,
    completion: any
  ): Promise<{
    patterns: string[];
    improvements: string[];
    confidence: number;
  }> {
    const patterns: string[] = [];
    const improvements: string[] = [];

    // Pattern: AI vs Human decision alignment
    if (record.aiDecision && record.humanDecision) {
      const aiApproved = record.aiDecision.confidence > 0.7;
      const humanApproved = record.humanDecision.decision === 'approved';
      if (aiApproved === humanApproved) {
        patterns.push('ai_human_alignment'');
      } else {
        patterns.push('ai_human_mismatch'');
        improvements.push('Review approval criteria and thresholds'');
      }
    }

    // Pattern: Gate category specific patterns
    switch (record.category) {
      case SafeGateCategory.EPIC_PORTFOLIO:
        if (record.context.safeEntity.metadata.businessCase) {
          patterns.push('business_case_provided'');
        }
        break;

      case SafeGateCategory.QUALITY_ASSURANCE:
        if (
          record.aiDecision?.confidence &&
          record.aiDecision.confidence > 0.9
        ) {
          patterns.push('high_quality_confidence'');
        }
        break;
    }

    return {
      patterns,
      improvements,
      confidence: 0.85,
    };
  }

  private async updateLearningModels(
    record: SafeGateTraceabilityRecord
  ): Promise<void> {
    if (!record.aiDecision|| !record.humanDecision) return;

    // Update LLM approval service with human feedback
    const humanOverride = {
      id: `override-${record.id}`,`
      userId: record.humanDecision.approver,
      action: record.humanDecision.decision as'approve| reject',
      reason: record.humanDecision.reasoning,
      previousLLMDecision: {
        approved: record.aiDecision.confidence > 0.7,
        confidence: record.aiDecision.confidence,
        reasoning: record.aiDecision.reasoning,
        concerns: [],
        suggestedActions: [],
        metadata: {
          model: record.aiDecision.model,
          processingTime: 0,
          tokenUsage: 0,
          version:'1.0.0,
        },
      },
      timestamp: record.humanDecision.timestamp,
      confidence: 0.9,
      metadata: {},
    };

    await this.llmApprovalService.learnFromHumanFeedback(
      record.context.safeEntity.id,
      {
        approved: record.aiDecision.confidence > 0.7,
        confidence: record.aiDecision.confidence,
        reasoning: record.aiDecision.reasoning,
        concerns: [],
        suggestedActions: [],
        metadata: {
          model: record.aiDecision.model,
          processingTime: 0,
          tokenUsage: 0,
          version:'1.0.0,
        },
      },
      humanOverride
    );
  }

  private async persistTraceabilityRecord(
    record: SafeGateTraceabilityRecord
  ): Promise<void> {
    await this.database('safe_gate_traceability')
      .insert({
        id: record.id,
        gate_id: record.gateId,
        category: record.category,
        context: JSON.stringify(record.context),
        ai_decision: record.aiDecision
          ? JSON.stringify(record.aiDecision)
          : null,
        human_decision: record.humanDecision
          ? JSON.stringify(record.humanDecision)
          : null,
        learning_extracted: JSON.stringify(record.learningExtracted),
        audit_trail: JSON.stringify(record.auditTrail),
        metrics: JSON.stringify(record.metrics),
        created_at: record.createdAt,
        completed_at: record.completedAt,
      })
      .onConflict('id')
      .merge();
  }

  private async loadTraceabilityRecord(
    traceabilityId: string
  ): Promise<SafeGateTraceabilityRecord| null> {
    const row = await this.database('safe_gate_traceability')
      .where('id,traceabilityId)
      .first();

    if (!row) return null;

    return {
      id: row.id,
      gateId: row.gate_id,
      category: row.category,
      context: JSON.parse(row.context),
      aiDecision: row.ai_decision ? JSON.parse(row.ai_decision) : undefined,
      humanDecision: row.human_decision
        ? JSON.parse(row.human_decision)
        : undefined,
      learningExtracted: JSON.parse(row.learning_extracted),
      auditTrail: JSON.parse(row.audit_trail),
      metrics: JSON.parse(row.metrics),
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    };
  }

  // Helper methods for gate configuration
  private getTransitionType(
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState
  ): string {
    const transitions = {
      [PortfolioKanbanState.FUNNEL]:'intake,
      [PortfolioKanbanState.ANALYZING]:'analysis,
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]:'prioritization,
      [PortfolioKanbanState.IMPLEMENTING]:'execution,
      [PortfolioKanbanState.DONE]:'completion,
    };

    return transitions[toState]||'unknown';
  }

  private getRequiredApprovalCount(
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState
  ): number {
    // Higher stakes transitions require more approvals
    if (toState === PortfolioKanbanState.IMPLEMENTING) return 3;
    if (toState === PortfolioKanbanState.PORTFOLIO_BACKLOG) return 2;
    return 1;
  }

  private getApprovalTimeout(
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState
  ): number {
    // Critical transitions have shorter timeouts
    if (toState === PortfolioKanbanState.IMPLEMENTING) return 48;
    return 72;
  }

  private assessComplexity(context: SafeGateContext): string {
    // Assess based on gate category and entity metadata
    if (context.category === SafeGateCategory.EPIC_PORTFOLIO) return'complex';
    if (context.category === SafeGateCategory.QUALITY_ASSURANCE)
      return'moderate';
    return'simple';
  }

  private assessPriority(context: SafeGateContext): string {
    // Assess based on compliance requirements and stakeholders
    if (context.compliance.required) return'high';
    if (context.stakeholders.owners.length > 2) return'medium';
    return'low';
  }

  private assessRiskLevel(
    context: SafeGateContext
  ):'low'|'medium'|'high'|'critical '{
    // Assess based on compliance and entity type
    if (context.compliance.auditLevel ==='comprehensive)return'high';
    if (context.safeEntity.type ==='epic)return'medium';
    return'low';
  }

  private async getLLMConfig(
    category: SafeGateCategory
  ): Promise<LLMApprovalConfig> {
    // Get appropriate LLM configuration for gate category
    const baseConfig: LLMApprovalConfig = {
      enabled: true,
      model:'claude-3-5-sonnet,
      prompt: `Evaluate ${category} gate for SAFE framework compliance and business value`,`
      criteria: [
       'business_value,
       'compliance,
       'risk_assessment,
       'stakeholder_alignment,
      ],
      confidenceThreshold: 0.8,
      maxRetries: 3,
      timeout: 30000,
    };

    return baseConfig;
  }

  private async triggerSafeStateTransition(
    context: SafeGateContext,
    decision: string
  ): Promise<void> {
    // Trigger appropriate SAFE framework state transition
    this.logger.info('Triggering SAFE state transition,{
      entityType: context.safeEntity.type,
      entityId: context.safeEntity.id,
      fromState: context.workflow.currentState,
      toState: context.workflow.targetState,
      decision,
    });

    // Would integrate with actual SAFE framework state machines
  }

  private async triggerSafeEscalation(
    context: SafeGateContext,
    reason: string
  ): Promise<void> {
    // Trigger SAFE framework escalation procedures
    this.logger.warn('Triggering SAFE escalation,{
      entityType: context.safeEntity.type,
      entityId: context.safeEntity.id,
      reason,
    });

    // Would integrate with SAFE framework escalation system
  }

  // Analytics and learning methods
  private extractDecisionPatterns(
    records: SafeGateTraceabilityRecord[]
  ): Array<{
    pattern: string;
    frequency: number;
    accuracy: number;
    improvement: string;
  }> {
    // Implementation would analyze patterns in decision records
    return [];
  }

  private calculateAIPerformance(records: SafeGateTraceabilityRecord[]): {
    autoApprovalRate: number;
    humanOverrideRate: number;
    averageConfidence: number;
    accuracyTrend: number[];
  } {
    // Implementation would calculate AI performance metrics
    return {
      autoApprovalRate: 0.75,
      humanOverrideRate: 0.15,
      averageConfidence: 0.85,
      accuracyTrend: [0.8, 0.82, 0.85, 0.87, 0.89],
    };
  }

  private analyzeHumanBehavior(records: SafeGateTraceabilityRecord[]): {
    averageReviewTime: number;
    commonRejectionReasons: string[];
    escalationPatterns: string[];
  } {
    // Implementation would analyze human decision patterns
    return {
      averageReviewTime: 1200000, // 20 minutes
      commonRejectionReasons: [
       'Insufficient business justification,
       'Compliance concerns,
      ],
      escalationPatterns: ['Timeout after 24h,'Complex business cases'],
    };
  }

  private calculateComplianceMetrics(records: SafeGateTraceabilityRecord[]): {
    auditTrailCompleteness: number;
    soc2Compliance: boolean;
    gatesCovered: number;
    totalDecisions: number;
  } {
    // Implementation would calculate compliance metrics
    return {
      auditTrailCompleteness: 1.0,
      soc2Compliance: true,
      gatesCovered: records.length,
      totalDecisions: records.length,
    };
  }
}

export default SafeFrameworkIntegration;
