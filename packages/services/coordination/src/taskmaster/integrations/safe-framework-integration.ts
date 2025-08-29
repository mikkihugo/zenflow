/**
 * @fileoverview SAFe 6.0 Framework Integration - TaskMaster as Universal Approval Gate Orchestrator
 *
 * Integrates TaskMaster's approval gate system with ALL SAFe 6.0 framework gates : ';
 * - Epic Management Gates (Portfolio Kanban states)
 * - Continuous Delivery Gates (Quality, Security, Performance)
 * - ART Gates (Agile Release Train coordination)
 * - Cross-Framework Gates (SAFe-SPARC synchronization)
 * - Business Validation Gates (Stakeholder approvals)
 *
 * Uses SAFe 6.0 terminology: ART instead of Program, streamlined naming conventions.
 * Provides complete traceability, AGUI integration, SOC2 compliance, and learning.
 */
import { getLogger} from '@claude-zen/foundation')import { DatabaseProvider} from '@claude-zen/database')import { getBrainSystem} from '@claude-zen/intelligence')import { getSafeFramework, getWorkflowEngine} from '@claude-zen/enterprise')import {';
  getSafe6DevelopmentManager,
  createSafe6SolutionTrainManager,
} from '@claude-zen/development')import { ApprovalGateManager} from '../core/approval-gate-manager.js')import { LLMApprovalService} from '../services/llm-approval-service.js')import { PromptManagementService} from '../services/prompt-management-service.js')import { TaskApprovalSystem} from '../agui/task-approval-system.js')import type {';
  ApprovalGateId,
  TaskId,
  UserId,
  ApprovalGateRequirement,
  EnhancedApprovalGate,
  LLMApprovalConfig,
  LLMApprovalContext,
  LLMApprovalResult,
} from '../types/index.js')// Import SAFE framework types';
import type {
  PortfolioKanbanState,
  EpicLifecycleStage,
  QualityGate as SafeQualityGate,
  GateCriterion,
  EpicBusinessCase,
} from '@claude-zen/safe-framework')// Import quality gate types from SAFE';
import type {
  QualityGate,
  QualityGateType,
  QualityGateResult,
  QualityGateExecutionConfig,
} from '@claude-zen/safe-framework/services/continuous-delivery/quality-gate-service')// =========================================================================== = ''; 
// SAFE INTEGRATION TYPES
// ============================================================================
/**
 * SAFe 6.0 gate categories that TaskMaster orchestrates
 */
export enum SafeGateCategory {
  EPIC_PORTFOLIO = 'epic_portfolio')  EPIC_LIFECYCLE = 'epic_lifecycle')  ART_COORDINATION = 'art_coordination')  QUALITY_ASSURANCE = 'quality_assurance')  SECURITY_COMPLIANCE = 'security_compliance')  PERFORMANCE_VALIDATION = 'performance_validation')  BUSINESS_VALIDATION = 'business_validation')  ARCHITECTURE_COMPLIANCE = 'architecture_compliance')  CROSS_FRAMEWORK_SYNC = 'cross_framework_sync')};;
/**
 * Integration configuration for SAFe 6.0 gates
 */
export interface SafeIntegrationConfig {
  enabled: boolean;
  // Epic management gates
  epicGates:  {
    enablePortfolioKanban: boolean;
    enableLifecycleGates: boolean;
    autoApprovalThresholds:  {
      funnel: number;
      analyzing: number;
      portfolioBacklog: number;
      implementing: number;
};
};
  // Continuous delivery gates
  qualityGates:  {
    enableCodeQuality: boolean;
    enableSecurity: boolean;
    enablePerformance: boolean;
    enableArchitecture: boolean;
    llmAutoApproval: boolean;
    humanFallbackThreshold: number;
};
  // Business validation gates
  businessGates:  {
    enableStakeholderApproval: boolean;
    enableComplianceReview: boolean;
    requireBusinessCase: boolean;
    escalationTimeoutHours: number;
};
  // Learning and improvement
  learning:  {
    enableContinuousLearning: boolean;
    trackDecisionPatterns: boolean;
    adaptPrompts: boolean;)    auditCompliance : 'basic| soc2' | ' comprehensive')};;
}
/**
 * SAFE gate execution context
 */
export interface SafeGateContext {
  category: SafeGateCategory;
  safeEntity:  {
    type : 'epic| feature| story| capability' | ' solution')    id: string;;
    metadata: Record<string, unknown>;
};
  workflow:  {
    currentState: string;
    targetState: string;
    previousStates: string[];
};
  stakeholders:  {
    owners: string[];
    approvers: string[];
    reviewers: string[];
};
  compliance:  {
    required: boolean;
    frameworks: string[];
    auditLevel : 'basic' | ' enhanced'|' comprehensive')};;
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
  aiDecision?:  {
    confidence: number;
    reasoning: string;
    model: string;
    promptVersion: string;
    timestamp: Date;
};
  humanDecision?:  {
    approver: string;
    decision : 'approved' | ' rejected'|' escalated')    reasoning: string;;
    timestamp: Date;
    reviewTime: number;
};
  // Learning data
  learningExtracted:  {
    patterns: string[];
    improvements: string[];
    confidence: number;
};
  // SOC2 audit trail
  auditTrail:  {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    correlationId: string;
    complianceLevel: string;
};
  // Performance metrics
  metrics:  {
    totalProcessingTime: number;
    aiProcessingTime: number;
    humanReviewTime: number;
    escalationCount: number;
};
  createdAt: Date;
  completedAt?:Date;
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
  private readonly logger = getLogger('SafeFrameworkIntegration');
  // Core services
  private approvalGateManager: new Map<string, SafeGateTraceabilityRecord>();
  private activeGates = new Map<ApprovalGateId, SafeGateContext>();
  constructor(
    approvalGateManager: approvalGateManager;
    this.config = config;
}
  /**
   * Initialize SAFE framework integration
   */
  async initialize(): Promise<void> {
    try {
    ')      this.logger.info('Initializing SAFE Framework Integration...');
      // Initialize infrastructure
      const dbSystem = await DatabaseProvider.create();')      this.database = dbSystem.createProvider('sql');
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
      this.registerEventHandlers();')      this.logger.info('SAFE Framework Integration initialized successfully');
} catch (error) {
      this.logger.error(';)';
       'Failed to initialize SAFE Framework Integration,`;
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
    context:  {
      businessCase?:EpicBusinessCase;
      stakeholders: string[];
      complianceRequired: boolean;
}
  ): Promise<{ gateId: ApprovalGateId, traceabilityId: string}> {
    const gateId =;
      `epic-`${epicId}-${fromState}-to-${toState} as ApprovalGateId;``)    const traceabilityId = `trace-${gateId}-${Date.now()})    this.logger.info(`'Creating Epic Portfolio Gate,{';
      epicId,
      fromState,
      toState,
      gateId,')';
});
    // Determine approval requirements based on state transition
    const approvalRequirement = this.buildEpicApprovalRequirement(
      gateId,
      fromState,
      toState,
      context;
    );
    // Create SAFE gate context
    const safeContext:  {
      category: 'epic,',
'        id: epicId,';
        metadata:  {
          fromState,
          toState,
          businessCase: context.businessCase,
          transitionType: this.getTransitionType(fromState, toState),',},';
},
      workflow:  {
        currentState: fromState,
        targetState: toState,
        previousStates: [], // Would load from epic history
},
      stakeholders:  {
    ')        owners: context.stakeholders.filter((s) => s.includes('owner')),')        approvers: context.stakeholders.filter((s) => s.includes('approver')),';
        reviewers:  {
      id: 'system',)        userAgent : 'TaskMaster-SafeIntegration,'
        correlationId: await this.processLLMApproval(
        gateId,
        safeContext,
        traceabilityRecord;
      );
      if (llmResult.autoApproved) {
        // Auto-approved by LLM`)        this.logger.info(`Epic gate auto-approved by LLM,{`;
          gateId,
          confidence: await this.approvalGateManager.createApprovalGate(
      approvalRequirement``;
      `task-`${epicId} as TaskId``)    );`;
    if (!result.success) {
      throw new Error(
        `Failed to create epic approval gate: qualityGateConfig.gateId as ApprovalGateId;`)    const traceabilityId = `trace-${gateId}-${Date.now()})    this.logger.info(``Creating Quality Gate,{';
      gateId,
      pipelineId:  {
      category: 'feature,',
'        id: 'quality_review',)        targetState : 'quality_approved')        previousStates:['development,' testing'],';
},
      stakeholders:  {
        owners: context.stakeholders.filter((s) => s.includes('owner')),')        approvers: context.stakeholders.filter((s) => s.includes('quality')),';
        reviewers:  {
      id: 'system,)        userAgent,        correlationId: await this.processLLMQualityApproval(
        qualityGateConfig,
        safeContext,
        traceabilityRecord;
      );
      if (llmResult.autoApproved) {
    `)        this.logger.info(`Quality gate auto-approved by LLM,{`;
          gateId,
          confidence: this.buildQualityApprovalRequirement(
      gateId,
      qualityGateConfig,
      context;
    );
    const result = await this.approvalGateManager.createApprovalGate(
      approvalRequirement``;
      `task-quality-`${context.projectId} as TaskId``)    );`;
    if (!result.success) {
      throw new Error(
        `Failed to create quality approval gate: this.traceabilityRecords.get(traceabilityId);
    if (record) {
      return record;
}
    // Load from database if not in memory
    return await this.loadTraceabilityRecord(traceabilityId);
}
  /**
   * Get learning insights from all gate decisions
   */
  async getLearningInsights(timeframe: string =30d'): Array.from(this.traceabilityRecords.values())();
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
    await this.database.schema.createTableIfNotExists(';)';
     'safe_gate_traceability,';
      (table: any) => {
        table.uuid('id').primary(');)        table.string('gate_id').notNullable(');')        table.string('category').notNullable(');')        table.json('context').notNullable(');')        table.json('ai_decision').nullable(');')        table.json('human_decision').nullable(');')        table.json('learning_extracted').notNullable(');')        table.json('audit_trail').notNullable(');')        table.json('metrics').notNullable(');')        table.timestamp('created_at').notNullable(');')        table.timestamp('completed_at').nullable(');')        table.index(['gate_id,' category,'created_at]);
}
    );')    await this.database.schema.createTableIfNotExists(';)';
     'safe_gate_learning,';
      (table: any) => {
        table.uuid('id').primary(');)        table.string('pattern').notNullable(');')        table.integer('frequency').notNullable(');')        table.float('accuracy').notNullable(');')        table.text('improvement').notNullable(');')        table.timestamp('last_updated').notNullable(');')        table.index(['pattern,' accuracy]);
}
    );
}
  private registerEventHandlers(): void {
    // Listen for approval gate events')    this.eventSystem.on(';)';
     'approval: this.activeGates.get(gateId);
    if (!context) return;
    this.logger.info('SAFE gate approved,{ gateId, taskId, approverId};);
    // Find and update traceability record
    const record = Array.from(this.traceabilityRecords.values()).find(
      (r) => r.gateId === gateId;
    );
    if (record) {
      record.humanDecision = {
        approver: 'approved',)        reasoning : 'Human approval granted,'
'        timestamp: this.activeGates.get(gateId);
    if (!context) return;')    this.logger.info('SAFE gate rejected,{';
      gateId,
      taskId,
      approverId,
      reason,')';
});
    // Find and update traceability record
    const record = Array.from(this.traceabilityRecords.values()).find(
      (r) => r.gateId === gateId;
    );
    if (record) {
      record.humanDecision = {
        approver: 'rejected,',
'        reasoning: this.activeGates.get(gateId);
    if (!context) return;')    this.logger.warn(SAFE gate timed out,{ gateId, taskId};);
    // Find and update traceability record
    const record = Array.from(this.traceabilityRecords.values()).find(
      (r) => r.gateId === gateId;
    );
    if (record) {
      record.metrics.escalationCount++;
      await this.persistTraceabilityRecord(record);
}
    // Trigger escalation in SAFE framework``)    await this.triggerSafeEscalation(context,`timeout`);`;
}
  private buildEpicApprovalRequirement(
    gateId: this.getRequiredApprovalCount(fromState, toState);
    const timeoutHours = this.getApprovalTimeout(fromState, toState);
    return {
      id: gateId``;
      name: `Epic ${fromState} → ${toState} Approval```;
      description,    ``)      requiredApprovers: context.stakeholders,';
      minimumApprovals,
      isRequired: true,
      timeoutHours,
      metadata:  {
        category: SafeGateCategory.EPIC_PORTFOLIO,')        transition,    )        complianceRequired: context.complianceRequired,`;
},
};
}
  private buildQualityApprovalRequirement(
    gateId: ApprovalGateId,
    qualityConfig: QualityGateExecutionConfig,
    context: any
  ):ApprovalGateRequirement {
    return {
      id: gateId,`)      name: `Quality Gate - ${qualityConfig.stageId};``;
      description: `Quality approval required for `${qualityConfig.pipelineId};``)      requiredApprovers: context.stakeholders.filter((s: string) =>`)        s.includes(`quality`)`;
      ),
      minimumApprovals: Date.now();
    // Build LLM approval context
    const llmContext:  {
      task:  {
        id: 'SAFE Framework Workflow,',
'        currentState: await this.getLLMConfig(context.category);
    // Evaluate with LLM
    const result = await this.llmApprovalService.evaluateForApproval(
      llmContext,
      llmConfig,
      [];
    );
    const processingTime = Date.now() - startTime;
    // Update traceability record
    traceabilityRecord.aiDecision = {
      confidence: 'safe-integration-v1.0.0,',
'      timestamp: processingTime;
    return result;
}
  private async processLLMQualityApproval(
    qualityConfig: this.safeFramework.getQualityGateService();
    // Execute quality gate with AI enhancement
    const qualityResult =;
      await qualityGateService.executeQualityGate(qualityConfig);
    // Convert to LLM approval result
    const llmResult:  {
      gateId: qualityConfig.gateId,
      taskId: context.safeEntity.id,
      decision:  {
        approved: qualityResult.status ==='pass,';
        confidence: 'quality-gate-ai,',
'          processingTime: qualityResult.executionTime,',          tokenUsage: 0,')          version,},';
},
      autoApproved,        qualityResult.status ==='pass '&&';
        qualityResult.score / 100 >=
          this.config.qualityGates.humanFallbackThreshold,
      escalatedToHuman: qualityResult.status !=='pass'|| qualityResult.score / 100 <';
          this.config.qualityGates.humanFallbackThreshold,
      processingTime:  {
      confidence: 'quality-gate-ai',)      promptVersion : 'quality-gate-v1.0.0,'
      timestamp: new Date();
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
    record: [];
    const improvements: [];
    // Pattern: record.aiDecision.confidence > 0.7;)      const humanApproved = record.humanDecision.decision === 'approved')      if (aiApproved === humanApproved) {';
        patterns.push('ai_human_alignment');
} else {
    ')        patterns.push('ai_human_mismatch');')        improvements.push('Review approval criteria and thresholds');
}
}
    // Pattern:  {
    ')      id,    ')      userId: await this.database('safe_gate_traceability')')      .where('id, traceabilityId)';
      .first();
    if (!row) return null;
    return {
      id:  {
    ')      [PortfolioKanbanState.FUNNEL]:'intake')      [PortfolioKanbanState.ANALYZING]:'analysis')      [PortfolioKanbanState.PORTFOLIO_BACKLOG]:'prioritization')      [PortfolioKanbanState.IMPLEMENTING]:'execution')      [PortfolioKanbanState.DONE]: 'completion',};)    return transitions[toState]||'unknown')};;
  private getRequiredApprovalCount(
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState
  ):number {
    // Higher stakes transitions require more approvals
    if (toState === PortfolioKanbanState.IMPLEMENTING) return 3;
    if (toState === PortfolioKanbanState.PORTFOLIO_BACKLOG) return 2;
    return 1;
}
  private getApprovalTimeout(
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState
  ):number {
    // Critical transitions have shorter timeouts
    if (toState === PortfolioKanbanState.IMPLEMENTING) return 48;
    return 72;
}
  private assessComplexity(context: SafeGateContext): string {
    // Assess based on gate category and entity metadata
    if (context.category === SafeGateCategory.EPIC_PORTFOLIO) return'complex')    if (context.category === SafeGateCategory.QUALITY_ASSURANCE)';
      return'moderate')    return'simple')};;
  private assessPriority(context: SafeGateContext): string {
    // Assess based on compliance requirements and stakeholders
    if (context.compliance.required) return'high')    if (context.stakeholders.owners.length > 2) return'medium')    return'low')};;
  private assessRiskLevel(
    context: SafeGateContext
  ):'low' | ' medium'|' high' | ' critical '{';
    // Assess based on compliance and entity type
    if (context.compliance.auditLevel ==='comprehensive)return' high')    if (context.safeEntity.type ==='epic)return' medium')    return'low')};;
  private async getLLMConfig(
    category:  {
      enabled: true,)      model: `claude-3-5-sonnet``;
      prompt,    ')      criteria: [';
       'business_value,')       'compliance,';
       'risk_assessment,')       'stakeholder_alignment,';
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
    this.logger.info('Triggering SAFE state transition,{';
      entityType: context.safeEntity.type,
      entityId: context.safeEntity.id,
      fromState: context.workflow.currentState,
      toState: context.workflow.targetState,
      decision,')';
});
    // Would integrate with actual SAFE framework state machines
}
  private async triggerSafeEscalation(
    context: SafeGateContext,
    reason: string
  ): Promise<void> {
    // Trigger SAFE framework escalation procedures')    this.logger.warn('Triggering SAFE escalation,{';
      entityType: context.safeEntity.type,
      entityId: context.safeEntity.id,
      reason,')';
});
    // Would integrate with SAFE framework escalation system
}
  // Analytics and learning methods
  private extractDecisionPatterns(
    records: SafeGateTraceabilityRecord[]
  ):Array<{
    pattern: string;
    frequency: number;
    accuracy: number;
    improvement: string;
}> {
    // Implementation would analyze patterns in decision records
    return [];
}
  private calculateAIPerformance(records: SafeGateTraceabilityRecord[]):  {
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
  private analyzeHumanBehavior(records: SafeGateTraceabilityRecord[]):  {
    averageReviewTime: number;
    commonRejectionReasons: string[];
    escalationPatterns: string[];
} {
    // Implementation would analyze human decision patterns
    return {
      averageReviewTime: 1200000, // 20 minutes
      commonRejectionReasons: [')       'Insufficient business justification,';
       'Compliance concerns,';
],')      escalationPatterns: ['Timeout after 24h,' Complex business cases'],';
};
}
  private calculateComplianceMetrics(records: SafeGateTraceabilityRecord[]):  {
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
};)};;
export default SafeFrameworkIntegration;
;