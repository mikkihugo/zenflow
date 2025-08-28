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
import type { Logger} from '@claude-zen/foundation')// =========================================================================== = ';
// ARCHITECTURE DECISION MANAGEMENT INTERFACES
// ============================================================================
/**
 * Architecture Decision Record with enhanced tracking
 */
export interface ArchitectureDecisionRecord {
  id: string;
  title: string;
  status: ADRStatus;
  context: string;
  decision: string;
  consequences: string[];
  alternatives: Alternative[];
  createdAt: Date;
  updatedAt: Date;
  author: string;
  stakeholders: string[];
  category: DecisionCategory;
  impact: DecisionImpact;
  confidenceLevel: number; // 0-100 scale
  reviewCycle: ReviewCycle;
  dependencies: string[]; // IDs of related ADRs
  supersededBy?:string; // ID of superseding ADR
  supersedes?:string[]; // IDs of superseded ADRs
  tags: string[];
  attachments: Attachment[];
  metrics: DecisionMetric[]'; 
}
/**
 * ADR status enumeration
 */
export type ADRStatus =| draft| proposed| under_review| accepted| rejected| deprecated| superseded|'amended')/**';
 * Decision categories for organization
 */
export type DecisionCategory =| architecture_pattern| technology_selection| integration_approach| security_policy| performance_standard| data_management| deployment_strategy| quality_standard| governance_policy|'infrastructure_decision')/**';
 * Decision impact assessment
 */
export interface DecisionImpact {
  readonly scope : 'local| system| enterprise' | ' ecosystem')  readonly timeHorizon:| short_term| medium_term| long_term|'strategic')  readonly riskLevel : 'low| medium| high' | ' critical')  readonly businessImpact: number; // 0-10 scale';
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
  readonly timeframe : 'annual' | ' project'|' lifetime')  readonly confidence: number; // 0-100 scale';
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
  readonly frequency : 'one_time| quarterly| annually' | ' on_change')  readonly nextReviewDate?:Date;';
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
  readonly type : 'document| diagram| code| link' | ' image')  readonly url: string;;
  readonly description: string;
  readonly uploadedBy: string;
  readonly uploadedAt: Date;
}
/**
 * Decision metrics for tracking effectiveness
 */
export interface DecisionMetric {
  readonly metricId: string;
  readonly name: string;
  readonly description: string;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly unit: string;
  readonly trend : 'improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' declining')  readonly lastMeasured: Date;;
}
/**
 * Decision request for new ADRs
 */
export interface DecisionRequest {
  readonly title: string;
  readonly description: string;
  readonly context: string;
  readonly options: DecisionOption[];
  readonly requester: string;
  readonly stakeholders: string[];
  readonly deadline?:Date;
  readonly priority: low| medium| high' | ' critical')  readonly businessJustification: string;;
}
/**
 * Decision option within a request
 */
export interface DecisionOption {
  readonly title: string;
  readonly description: string;
  readonly pros: string[];
  readonly cons: string[];
  readonly estimatedCost: number;
  readonly estimatedEffort: number;
  readonly riskLevel : 'low' | ' medium'|' high')};;
/**
 * ADR management configuration
 */
export interface ADRConfig {
  readonly enableAIAnalysis: boolean;
  readonly enableAutomatedReviews: boolean;
  readonly enableStakeholderNotifications: boolean;
  readonly enableMetricsTracking: boolean;
  readonly defaultReviewCycle: ReviewCycle['frequency];;
  readonly maxAlternatives: number;
  readonly minStakeholders: number;
  readonly criticalDecisionThreshold: number;];;
  readonly autoApprovalThreshold: number;)};;
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
  readonly qualityTrend : 'improving' | ' stable'|' declining' | ' improving'|' stable' | ' declining'|' declining')};;
// ============================================================================
// ARCHITECTURE DECISION MANAGEMENT SERVICE IMPLEMENTATION
// ============================================================================
/**
 * Architecture Decision Management Service - ADR management and decision tracking
 *
 * Provides comprehensive architecture decision record management with AI-powered
 * decision analysis, automated tracking, stakeholder coordination, and decision governance.
 */
export class ArchitectureDecisionManagementService {
  private readonly logger: false;
  // ADR state
  private decisionRecords = new Map<string, ArchitectureDecisionRecord>();
  private config: {}) {
    this.logger = logger;
    this.config = {
      enableAIAnalysis: 'annually,',
'      maxAlternatives: await import('@claude-zen/brain');
      this.brainCoordinator = new BrainCoordinator(
          enabled: await import(';')';
       '@claude-zen/foundation'));
      this.performanceTracker = new PerformanceTracker();
      this.telemetryManager = new TelemetryManager({
        serviceName : 'architecture-decision-management,'
'        enableTracing: await import('@claude-zen/workflows');
      this.workflowEngine = new WorkflowEngine(
        maxConcurrentWorkflows: await import('@claude-zen/agui');
      const aguiSystemResult = await AGUISystem({
    ')        aguiType : 'terminal,'
'        taskApprovalConfig: aguiSystemResult.agui;
      // Lazy load ../../teamwork for stakeholder collaboration')      const { ConversationOrchestrator} = await import('../../teamwork');
      this.conversationOrchestrator = new ConversationOrchestrator();
      await this.conversationOrchestrator.initialize();
      this.initialized = true;
      this.logger.info(';')';
       'Architecture Decision Management Service initialized successfully'));
} catch (error) {
      this.logger.error(
       'Failed to initialize Architecture Decision Management Service:,';
        error
      );
      throw error;')';
}
}
  /**
   * Create architecture decision record with AI-powered analysis
   */
  async createArchitectureDecisionRecord(
    decision: this.performanceTracker.startTimer(
     'create_architecture_decision'));
    try {
      this.logger.info(';')';
       'Creating architecture decision record with AI analysis,';
        { title: decision.title}
      );
      // Use brain coordinator for decision analysis and alternative generation
      const decisionAnalysis =
        await this.brainCoordinator.analyzeArchitectureDecision({
          decision,
          context: await this.generateAlternatives(
        decision,
        decisionAnalysis;
      );
      // Calculate confidence level based on analysis
      const confidenceLevel = this.calculateConfidenceLevel(
        decision,
        decisionAnalysis,
        alternatives;
      );
      // Create ADR with AI-enhanced data
      const adr: {
        ...decision,
        id,    ')        status : 'draft,'
'        confidenceLevel,';
        alternatives,
        reviewCycle: {
          frequency: this.config.defaultReviewCycle,
          reviewCriteria: this.generateReviewCriteria(decision),
          reviewers: decision.stakeholders,
          escalationPath: [],',},';
        dependencies: decisionAnalysis.dependencies|| [],
        tags: decisionAnalysis.recommendedTags|| [],
        attachments: [],
        metrics: this.generateDecisionMetrics(decision),
        createdAt: new Date(),
        updatedAt: new Date(),
};
      // Check if critical decision requires immediate review
      if (
        decision.impact.implementationEffort >
        this.config.criticalDecisionThreshold
      ) {
    ')        adr.status =proposed')        await this.initiateStakeholderReview(adr);
}
      // Store decision record
      this.decisionRecords.set(adr.id, adr);
      this.performanceTracker.endTimer('create_architecture_decision');')      this.telemetryManager.recordCounter('architecture_decisions_created,1');')      this.logger.info('Architecture decision record created successfully,';
        adrId: this.performanceTracker.startTimer(
     'request_architecture_decision'));
    try {
    ')      this.logger.info('Processing architecture decision request,{';
        title: await this.brainCoordinator.analyzeDecisionOptions(
        {
          request,
          context: this.requiresHumanApproval(
        request,
        optionAnalysis;
      );
      if (requiresApproval) {
        // Create approval task with stakeholder collaboration
        const approval = await this.aguiService.createApprovalTask({
    ')          taskType: `architecture_decision_request``;
          description,    ')          context: { request, optionAnalysis},';
          approvers: request.stakeholders,
          timeout: 2700000, // 45 minutes
          collaborationMode: true,
});
        if (approval.approved && approval.selectedOption !== undefined) {
          // Create ADR from approved option
          const adr = await this.createADRFromRequest(
            request,
            approval.selectedOption,
            optionAnalysis;
          );')          this.performanceTracker.endTimer('request_architecture_decision');
          return {
            approved: ')',approval.comments||'Decision not approved by stakeholders,';
};
} else {
        // Auto-approve based on AI recommendation
        const recommendedOption = optionAnalysis.recommendedOptionIndex|| 0;
        const adr = await this.createADRFromRequest(
          request,
          recommendedOption,
          optionAnalysis;
        );
        this.performanceTracker.endTimer('request_architecture_decision');
        return {
          approved: this.performanceTracker.startTimer('update_adr_status);
    try {
      const adr = this.decisionRecords.get(adrId);
      if (!adr) {
    `)        throw new Error(`Architecture Decision Record not found: `${adrId});``)};;
      // Use workflow engine for status transition validation
      const statusTransition =
        await this.workflowEngine.validateStatusTransition({
          fromStatus: {
        ...adr,
        status: this.performanceTracker.startTimer('generate_adr_dashboard');
    try {
      const allDecisions = Array.from(this.decisionRecords.values())();
      // Use brain coordinator for intelligent dashboard insights
      const dashboardInsights =
        await this.brainCoordinator.generateADRDashboardInsights({
          decisions: {
        totalDecisions: false;')    this.logger.info(Architecture Decision Management Service shutdown complete`);`;
}
  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================
  private generateAlternatives(_decision: analysis.alternatives|| [];
    return alternatives.map((alt: any, index: number) => ({
    `)      alternativeId:`alt-${index};``;
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
    if (decision.impact.riskLevel ===low)confidence += 10')    if (decision.impact.riskLevel === 'high)confidence -= 10')    return Math.min(95, Math.max(30, confidence);
}
  private generateReviewCriteria(decision: [
     'Decision outcomes align with expected results,')     'Implementation proceeded as planned,';
     'Stakeholder satisfaction remains high,';
];
    // Add category-specific criteria')    if (decision.category ==='technology_selection){';
    ')      criteria.push('Technology performance meets expectations');
};)    if (decision.category ==='security_policy){';
    ')      criteria.push('Security requirements are being met');
}
    return criteria;
}
  private generateDecisionMetrics(decision: [
      {
    ')        metricId : 'implementation-success')        name : 'Implementation Success')        description : 'Success rate of decision implementation,'
'        targetValue: 'percentage',)        trend : 'stable,'
'        lastMeasured: 'stakeholder-satisfaction',)        name : 'Stakeholder Satisfaction')        description : 'Satisfaction level of decision stakeholders,'
'        targetValue: 'percentage',)        trend : 'stable,'
'        lastMeasured: new Date(),',},';
];
    // Add category-specific metrics')    if (decision.category ==='performance_standard){';
    ')      baseMetrics.push(';')';
        metricId : 'performance-improvement')        name : 'Performance Improvement')        description : 'Performance improvement achieved,'
'        targetValue: 'percentage',)        trend : 'stable,'
        lastMeasured: new Date(),);',};;
    return baseMetrics;
}
  private async initiateStakeholderReview(
    adr: ArchitectureDecisionRecord
  ):Promise<void> {
    try {
    ')      await this.conversationOrchestrator.startConversation({';
    ')        conversationId,    ')        participants: adr.stakeholders,')        topic,    ')        context: { adr},';
        timeout: 86400000, // 24 hours
});
} catch (error) {
    ')      this.logger.error('Failed to initiate stakeholder review:, error');
}
}
  private requiresHumanApproval(
    request: DecisionRequest,
    analysis: any
  ):boolean {
    // High-priority or high-impact decisions require approval')    if (request.priority === 'critical)return true';)    if (request.priority == = 'high)return true)    // Large effort decisions require approval`;
    const totalEffort = request.options.reduce(
      (sum, opt) => sum + opt.estimatedEffort,
      0;
    );
    if (totalEffort > this.config.autoApprovalThreshold) return true;
    // AI confidence below threshold requires approval
    if (analysis.confidence && analysis.confidence < 0.8) return true;
    return false;
}
  private async createADRFromRequest(
    request: request.options[selectedOption]'; 
    return await this.createArchitectureDecisionRecord({
      title: 'annually,',
'        nextReviewDate: request.title.toLowerCase();
    if (title.includes('technology)|| title.includes(' tech'))')      return'technology_selection')    if (title.includes('security')) return' security_policy')    if (title.includes('performance')) return' performance_standard')    if (title.includes('architecture)|| title.includes(' pattern'))')      return'architecture_pattern')    return'architecture_pattern'; // Default';
}
  private calculateImpact(
    option: 'USD',)      timeframe : 'project,'
'      confidence: 50,',};;
}
  private generateDefaultFeasibility():FeasibilityAssessment {
    return {
      technical: 7,
      operational: 7,
      economic: 7,
      legal: 8,
      timeline: 7,
      resource: 6,
};
}
  private generateDefaultRiskAssessment():RiskAssessment {
    return {
      risks: [],
      overallRiskScore: 3,
      riskMitigationPlan,       'Standard risk mitigation procedures will be followed,';
      contingencyPlan,};;
}
  private groupDecisionsByStatus(
    decisions: ArchitectureDecisionRecord[]
  ):Record<ADRStatus, number> {
    return decisions.reduce(
      (groups, decision) => {
        groups[decision.status] = (groups[decision.status]|| 0) + 1;
        return groups;
},
      {} as Record<ADRStatus, number>
    );
}
  private groupDecisionsByCategory(
    decisions: ArchitectureDecisionRecord[]
  ):Record<DecisionCategory, number> {
    return decisions.reduce(
      (groups, decision) => {
        groups[decision.category] = (groups[decision.category]|| 0) + 1;
        return groups;
},
      {} as Record<DecisionCategory, number>
    );
}
  private calculateAverageDecisionTime(
    decisions: ArchitectureDecisionRecord[]
  ):number {
    ')    if (decisions.length === 0) return 0;)    const acceptedDecisions = decisions.filter((d) => d.status ===accepted');`;
    if (acceptedDecisions.length === 0) return 0;
    const totalTime = acceptedDecisions.reduce((sum, decision) => {
      const timeToDecision =
        decision.updatedAt.getTime() - decision.createdAt.getTime();
      return sum + timeToDecision / (24 * 60 * 60 * 1000); // Convert to days
}, 0);
    return totalTime / acceptedDecisions.length;
}
  private getUpcomingReviews(
    decisions: new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000;
    );
    return decisions
      .filter((decision) => {
        const nextReview = decision.reviewCycle.nextReviewDate;
        return (
          nextReview && nextReview >= now && nextReview <= thirtyDaysFromNow
        );
};
      .slice(0, 10); // Limit to 10 most urgent
};)};;
export default ArchitectureDecisionManagementService;
;