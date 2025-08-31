/**
 * @fileoverview Architecture Decision Management Service - ADR management and decision tracking.
 *
 * Provides specialized architecture decision record (ADR) management with AI-powered
 * decision analysis, automated tracking, stakeholder coordination, and decision governance.
 *
 * Integrates with: * - @claude-zen/brain: BrainCoordinator for intelligent decision analysis and recommendation
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for decision approval workflows
 * - @claude-zen/agui: Human-in-loop approvals for critical decisions
 * - ../../teamwork: ConversationOrchestrator for stakeholder collaboration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger} from '@claude-zen/foundation');
// ARCHITECTURE DECISION MANAGEMENT INTERFACES
// ============================================================================
/**
 * Architecture Decision Record with enhanced tracking
 */
export interface ArchitectureDecisionRecord {
  id: string;
}
/**
 * ADR status enumeration
 */
export type ADRStatus =| draft| proposed| under_review| accepted| rejected| deprecated| superseded|'amended');
 * Decision categories for organization
 */
export type DecisionCategory =| architecture_pattern| technology_selection| integration_approach| security_policy| performance_standard| data_management| deployment_strategy| quality_standard| governance_policy|'infrastructure_decision');
 * Decision impact assessment
 */
export interface DecisionImpact {
  readonly scope : 'local| system| enterprise' | ' ecosystem')strategic')low| medium| high' | ' critical');
  readonly technicalComplexity: number; // 0-10 scale
  readonly implementationEffort: number; // story points or hours
  readonly maintenanceOverhead: number; // 0-10 scale
}
/**
 * Alternative solution considered
 */
export interface Alternative {
  readonly alternativeId: string;
  readonly name: string;
  readonly description: string;
  readonly pros: string[];
  readonly cons: string[];
  readonly cost: CostAnalysis;
  readonly feasibility: FeasibilityAssessment;
  readonly riskAssessment: RiskAssessment;
  readonly recommendationScore: number; // AI-generated score
}
/**
 * Cost analysis for alternatives
 */
export interface CostAnalysis {
  readonly implementationCost: number;
  readonly maintenanceCost: number;
  readonly opportunityCost: number;
  readonly currency: string;
  readonly timeframe : 'annual' | ' project'|' lifetime');
}
/**
 * Feasibility assessment
 */
export interface FeasibilityAssessment {
  readonly technical: number; // 0-10 scale
  readonly operational: number; // 0-10 scale
  readonly economic: number; // 0-10 scale
  readonly legal: number; // 0-10 scale
  readonly timeline: number; // 0-10 scale
  readonly resource: number; // 0-10 scale
}
/**
 * Risk assessment for alternatives
 */
export interface RiskAssessment {
  readonly risks: Risk[];
  readonly overallRiskScore: number; // 0-10 scale
  readonly riskMitigationPlan: string;
  readonly contingencyPlan: string;
}
/**
 * Individual risk item
 */
export interface Risk {
  readonly riskId: string;
  readonly description: string;
  readonly probability: number; // 0-1 scale
  readonly impact: number; // 0-10 scale
  readonly riskScore: number; // probability * impact
  readonly mitigation: string;
  readonly owner: string;
}
/**
 * Review cycle for decision governance
 */
export interface ReviewCycle {
  readonly frequency : 'one_time| quarterly| annually' | ' on_change');
  readonly reviewCriteria: string[];
  readonly reviewers: string[];
  readonly escalationPath: string[];
}
/**
 * Decision attachment (documents, diagrams, etc.)
 */
export interface Attachment {
  readonly attachmentId: string;
  readonly name: string;
  readonly type : 'document| diagram| code| link' | ' image')improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' declining') | ' critical')low' | ' medium'|' high')frequency];
  readonly maxAlternatives: number;
  readonly minStakeholders: number;
  readonly criticalDecisionThreshold: number;];
  readonly autoApprovalThreshold: number;)};
/**
 * ADR analytics dashboard data
 */
export interface ADRDashboard {
  readonly totalDecisions: number;
  readonly decisionsByStatus: Record<ADRStatus, number>;
  readonly decisionsByCategory: Record<DecisionCategory, number>;
  readonly averageDecisionTime: number; // days
  readonly stakeholderEngagement: StakeholderEngagement[];
  readonly decisionEffectiveness: EffectivenessMetric[];
  readonly upcomingReviews: ArchitectureDecisionRecord[];
  readonly trendAnalysis: DecisionTrend[];
}
/**
 * Stakeholder engagement metrics
 */
export interface StakeholderEngagement {
  readonly stakeholder: string;
  readonly participationRate: number; // percentage
  readonly avgResponseTime: number; // hours
  readonly influenceScore: number; // 0-10 scale
  readonly expertiseAreas: DecisionCategory[];
}
/**
 * Decision effectiveness tracking
 */
export interface EffectivenessMetric {
  readonly decisionId: string;
  readonly title: string;
  readonly implementationSuccess: number; // 0-10 scale
  readonly outcomeAlignment: number; // 0-10 scale
  readonly stakeholderSatisfaction: number; // 0-10 scale
  readonly technicalOutcome: number; // 0-10 scale
  readonly businessOutcome: number; // 0-10 scale
}
/**
 * Decision trend analysis
 */
export interface DecisionTrend {
  readonly period: string;
  readonly decisionsCreated: number;
  readonly decisionsAccepted: number;
  readonly decisionsRejected: number;
  readonly avgTimeToDecision: number; // days
  readonly qualityTrend : 'improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' declining')annually,',
'      maxAlternatives: await import(): void { title: decision.title}
      );
      // Use brain coordinator for decision analysis and alternative generation
      const decisionAnalysis =
        await this.brainCoordinator.analyzeArchitectureDecision(): void {
        ...decision,
        id,    ')draft,'
'        confidenceLevel,';
        alternatives,
        reviewCycle:  {
          frequency: this.config.defaultReviewCycle,
          reviewCriteria: this.generateReviewCriteria(): void {
    '))        await this.initiateStakeholderReview(): void {';
        title: await this.brainCoordinator.analyzeDecisionOptions(): void {
        // Create approval task with stakeholder collaboration
        const approval = await this.aguiService.createApprovalTask(): void { request, optionAnalysis},';
          approvers: request.stakeholders,
          timeout: 2700000, // 45 minutes
          collaborationMode: true,
});
        if (approval.approved && approval.selectedOption !== undefined) {
          // Create ADR from approved option
          const adr = await this.createADRFromRequest(): void {
        // Auto-approve based on AI recommendation
        const recommendedOption = optionAnalysis.recommendedOptionIndex|| 0;
        const adr = await this.createADRFromRequest(): void {
      const adr = this.decisionRecords.get(): void {
          fromStatus:  {
        ...adr,
        status: this.performanceTracker.startTimer(): void {
    ")      alternativeId:"alt-${index}"";"
      name: 70; // Base confidence
    // Adjust based on analysis quality
    if (analysis.confidence) confidence += analysis.confidence * 0.3;
    // Adjust based on alternatives count
    if (alternatives.length >= 2) confidence += 10;
    if (alternatives.length >= 3) confidence += 5;
    // Adjust based on stakeholder count
    if (decision.stakeholders.length >= this.config.minStakeholders)
      confidence += 10;
    // Adjust based on impact level
    if (decision.impact.riskLevel ===low)confidence += 10')high)confidence -= 10')Decision outcomes align with expected results,')Implementation proceeded as planned,';
     'Stakeholder satisfaction remains high,';
];
    // Add category-specific criteria')technology_selection){';
    ')Technology performance meets expectations')security_policy){';
    ')Security requirements are being met'))        metricId : 'implementation-success')Implementation Success')Success rate of decision implementation,'
'        targetValue: 'percentage',)        trend : 'stable,'
'        lastMeasured: 'stakeholder-satisfaction',)        name : 'Stakeholder Satisfaction')Satisfaction level of decision stakeholders,'
'        targetValue: 'percentage',)        trend : 'stable,'
'        lastMeasured: new Date(): void {';
    ');)';
        metricId : 'performance-improvement')Performance Improvement')Performance improvement achieved,'
'        targetValue: 'percentage',)        trend : 'stable,'
        lastMeasured: new Date(): void {
    try {
    ');
    '))        participants: adr.stakeholders,'))        context:  { adr},';
        timeout: 86400000, // 24 hours
});
} catch (error) {
    ')Failed to initiate stakeholder review:, error'))    if (request.priority === 'critical)return true';)    if (request.priority == = 'high)return true)    // Large effort decisions require approval";
    const totalEffort = request.options.reduce(): void {
      title: 'annually,',
'        nextReviewDate: request.title.toLowerCase(): void {
    return {
      technical: 7,
      operational: 7,
      economic: 7,
      legal: 8,
      timeline: 7,
      resource: 6,
};
}
  private generateDefaultRiskAssessment(): void {
    return {
      risks: [],
      overallRiskScore: 3,
      riskMitigationPlan,       'Standard risk mitigation procedures will be followed,';
      contingencyPlan,};
}
  private groupDecisionsByStatus(): void {
    return decisions.reduce(): void {
        groups[decision.status] = (groups[decision.status]|| 0) + 1;
        return groups;
},
      {} as Record<ADRStatus, number>
    );
}
  private groupDecisionsByCategory(): void {
    return decisions.reduce(): void {
        groups[decision.category] = (groups[decision.category]|| 0) + 1;
        return groups;
},
      {} as Record<DecisionCategory, number>
    );
}
  private calculateAverageDecisionTime(): void {
    '))";
    if (acceptedDecisions.length === 0) return 0;
    const totalTime = acceptedDecisions.reduce(): void {
      const timeToDecision =
        decision.updatedAt.getTime(): void {
        const nextReview = decision.reviewCycle.nextReviewDate;
        return (
          nextReview && nextReview >= now && nextReview <= thirtyDaysFromNow
        );
};
      .slice(0, 10); // Limit to 10 most urgent
};)};
export default ArchitectureDecisionManagementService;