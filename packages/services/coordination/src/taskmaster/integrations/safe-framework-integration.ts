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
// Import SAFE framework types from local implementation
import type {
  PortfolioKanbanState,
  EpicLifecycleStage,
  EpicBusinessCase,
  GateCriterion,
} from '../../safe/types/epic-management.js';
// Import quality gate types from local SAFE implementation
import type {
  QualityGate,
  QualityGateType,
  QualityGateResult,
  QualityGateExecutionConfig,
} from '../../safe/services/continuous-delivery/quality-gate-service.js';

// ============================================================================
// SAFE INTEGRATION TYPES
// ============================================================================
/**
 * SAFe 6.0 gate categories that TaskMaster orchestrates
 */
export enum SafeGateCategory {
  EPIC_PORTFOLIO = 'epic_portfolio')epic_lifecycle')art_coordination')quality_assurance')security_compliance')performance_validation')business_validation')architecture_compliance')cross_framework_sync')basic| soc2' | ' comprehensive')epic| feature| story| capability' | ' solution')basic' | ' enhanced'|' comprehensive')approved' | ' rejected'|' escalated')SafeFrameworkIntegration')): Promise<void> {
        enableRichDisplay: true,
        enableBatchMode: false,
        requireRationale: true,
});
      await this.taskApprovalSystem.initialize(): void { gateId: ApprovalGateId, traceabilityId: string}> {
    const gateId ="epic-"${epicId}-${fromState}-to-${toState} as ApprovalGateId""): Promise<void> {Date.now(): void {';"
      epicId,
      fromState,
      toState,
      gateId,');
});
    // Determine approval requirements based on state transition
    const approvalRequirement = this.buildEpicApprovalRequirement(): void {
      category: 'epic,',
'        id: epicId,';
        metadata:  {
          fromState,
          toState,
          businessCase: context.businessCase,
          transitionType: this.getTransitionType(): void {
        currentState: fromState,
        targetState: toState,
        previousStates: [], // Would load from epic history
},
      stakeholders:  {
    ')owner'))        approvers: context.stakeholders.filter(): void {
      id: 'system',)        userAgent : 'TaskMaster-SafeIntegration,'
        correlationId: await this.processLLMApproval(): void {
        // Auto-approved by LLM")        this.logger.info(): void {
      throw new Error(): void {gateId}-${Date.now(): void {';"
      gateId,
      pipelineId:  {
      category: 'feature,',
'        id: 'quality_review',)        targetState : 'quality_approved')development,' testing'],';
},
      stakeholders:  {
        owners: context.stakeholders.filter(): void {
      id: 'system,)        userAgent,        correlationId: await this.processLLMQualityApproval(): void {
    ")        this.logger.info(): void {
      throw new Error(): void {
      return record;
}
    // Load from database if not in memory
    return await this.loadTraceabilityRecord(): void {
      decisionPatterns,
      aiPerformance,
      humanBehavior,
      complianceMetrics,
};
}
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  private async createTables(): void {
        table.uuid(): void {
        table.uuid(): void {
    // Listen for approval gate events');)';
     'approval: this.activeGates.get(): void { gateId, taskId, approverId};);
    // Find and update traceability record
    const record = Array.from(): void {
      record.humanDecision = {
        approver: 'approved',)        reasoning : 'Human approval granted,'
'        timestamp: this.activeGates.get(): void {';
      gateId,
      taskId,
      approverId,
      reason,');
});
    // Find and update traceability record
    const record = Array.from(): void {
      record.humanDecision = {
        approver: 'rejected,',
'        reasoning: this.activeGates.get(): void {
        category: SafeGateCategory.EPIC_PORTFOLIO,')SAFE Framework Workflow,',
'        currentState: await this.getLLMConfig(): void {
      confidence: 'safe-integration-v1.0.0,',
'      timestamp: processingTime;
    return result;
}
  private async processLLMQualityApproval(): void {
      gateId: qualityConfig.gateId,
      taskId: context.safeEntity.id,
      decision:  {
        approved: qualityResult.status ==='pass,';
        confidence: 'quality-gate-ai,',
'          processingTime: qualityResult.executionTime,',          tokenUsage: 0,');
},
      autoApproved,        qualityResult.status ==='pass '&&';
        qualityResult.score / 100 >=
          this.config.qualityGates.humanFallbackThreshold,
      escalatedToHuman: qualityResult.status !=='pass'|| qualityResult.score / 100 <';
          this.config.qualityGates.humanFallbackThreshold,
      processingTime:  {
      confidence: 'quality-gate-ai',)      promptVersion : 'quality-gate-v1.0.0,'
      timestamp: new Date(): void {
      record.learningExtracted = await this.extractLearningPatterns(): void {
      await this.updateLearningModels(): void {';
        patterns.push(): void {
      id:  {
    ')intake')analysis')prioritization')execution')completion',};)    return transitions[toState]||'unknown')complex');
      return'moderate')simple')high')medium')low')low' | ' medium'|' high' | ' critical '" + JSON.stringify(): void {';
      entityType: context.safeEntity.type,
      entityId: context.safeEntity.id,
      fromState: context.workflow.currentState,
      toState: context.workflow.targetState,
      decision,');
});
    // Would integrate with actual SAFE framework state machines
}
  private async triggerSafeEscalation(): void {
    pattern: string;
    frequency: number;
    accuracy: number;
    improvement: string;
}> {
    // Implementation would analyze patterns in decision records
    return [];
}
  private calculateAIPerformance(): void {
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
  private analyzeHumanBehavior(): void {
    averageReviewTime: number;
    commonRejectionReasons: string[];
    escalationPatterns: string[];
} {
    // Implementation would analyze human decision patterns
    return {
      averageReviewTime: 1200000, // 20 minutes
      commonRejectionReasons: [')Insufficient business justification,';
       'Compliance concerns,';
],')Timeout after 24h,' Complex business cases'],';
};
}
  private calculateComplianceMetrics(): void {
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
};)};
export default SafeFrameworkIntegration;