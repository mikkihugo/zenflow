/**
 * @fileoverview Architecture Decision Management Service - ADR management and decision tracking.
 *
 * Provides specialized architecture decision record (ADR) management with AI-powered
 * decision analysis, automated tracking, stakeholder coordination, and decision governance.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent decision analysis and recommendation
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for decision approval workflows
 * - @claude-zen/agui: Human-in-loop approvals for critical decisions
 * - ../../teamwork: ConversationOrchestrator for stakeholder collaboration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
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
    logger;
    brainCoordinator;
    performanceTracker;
    telemetryManager;
    workflowEngine;
    aguiService;
    conversationOrchestrator;
    initialized = false;
    // ADR state
    decisionRecords = new Map();
    config;
    constructor(logger, config = {}) {
        this.logger = logger;
        this.config = {
            enableAIAnalysis: true,
            enableAutomatedReviews: true,
            enableStakeholderNotifications: true,
            enableMetricsTracking: true,
            defaultReviewCycle: 'annually',
            maxAlternatives: 10,
            minStakeholders: 2,
            criticalDecisionThreshold: 1000, // effort threshold
            autoApprovalThreshold: 100, // effort threshold
            ...config,
        };
    }
    /**
     * Initialize service with lazy-loaded dependencies
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Lazy load @claude-zen/brain for LoadBalancer - intelligent decision analysis
            const { BrainCoordinator } = await import('@claude-zen/brain');
            ';
            this.brainCoordinator = new BrainCoordinator(enabled, true, learningRate, 0.1, adaptationThreshold, 0.7);
            await this.brainCoordinator.initialize();
            // Lazy load @claude-zen/foundation for performance tracking
            const { PerformanceTracker, TelemetryManager } = await import('@claude-zen/foundation', ');
            this.performanceTracker = new PerformanceTracker();
            this.telemetryManager = new TelemetryManager({
                serviceName: 'architecture-decision-management',
                enableTracing: true,
                enableMetrics: true,
            });
            await this.telemetryManager.initialize();
            // Lazy load @claude-zen/workflows for decision approval workflows
            const { WorkflowEngine } = await import('@claude-zen/workflows');
            ';
            this.workflowEngine = new WorkflowEngine(maxConcurrentWorkflows, 10, enableVisualization, true);
            await this.workflowEngine.initialize();
            // Lazy load @claude-zen/agui for approval workflows
            const { AGUISystem } = await import('@claude-zen/agui');
            ';
            const aguiSystemResult = await AGUISystem({
                aguiType: 'terminal',
                taskApprovalConfig: {
                    enableRichDisplay: true,
                    enableBatchMode: false,
                    requireRationale: true,
                },
            });
            this.aguiService = aguiSystemResult.agui;
            // Lazy load ../../teamwork for stakeholder collaboration
            const { ConversationOrchestrator } = await import('../../teamwork');
            ';
            this.conversationOrchestrator = new ConversationOrchestrator();
            await this.conversationOrchestrator.initialize();
            this.initialized = true;
            this.logger.info('Architecture Decision Management Service initialized successfully', ');
        }
        catch (error) {
            this.logger.error('Failed to initialize Architecture Decision Management Service:', error);
            throw error;
        }
    }
}
    >
;
Promise < ArchitectureDecisionRecord > {
    : .initialized, await, this: .initialize(),
    const: _timer = this.performanceTracker.startTimer('create_architecture_decision', '),
    try: {
        this: .logger.info('Creating architecture decision record with AI analysis', { title: decision.title }),
        // Use brain coordinator for decision analysis and alternative generation
        const: decisionAnalysis =
            await this.brainCoordinator.analyzeArchitectureDecision({
                decision,
                context: {
                    existingDecisions: Array.from(this.decisionRecords.values()),
                    category: decision.category,
                    impact: decision.impact,
                },
            }),
        // Generate alternatives using AI analysis
        const: alternatives = await this.generateAlternatives(decision, decisionAnalysis),
        // Calculate confidence level based on analysis
        const: confidenceLevel = this.calculateConfidenceLevel(decision, decisionAnalysis, alternatives),
        // Create ADR with AI-enhanced data
        const: adr, ArchitectureDecisionRecord = {
            ...decision,
            id: `adr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        } `
        status: 'draft',
        confidenceLevel,
        alternatives,
        reviewCycle: {
          frequency: this.config.defaultReviewCycle,
          reviewCriteria: this.generateReviewCriteria(decision),
          reviewers: decision.stakeholders,
          escalationPath: [],
        },
        dependencies: decisionAnalysis.dependencies || [],
        tags: decisionAnalysis.recommendedTags || [],
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
        adr.status ='proposed;
        await this.initiateStakeholderReview(adr);
      }

      // Store decision record
      this.decisionRecords.set(adr.id, adr);

      this.performanceTracker.endTimer('create_architecture_decision');'
      this.telemetryManager.recordCounter('architecture_decisions_created', 1);'

      this.logger.info('Architecture decision record created successfully', '
        adrId: adr.id,
        title: adr.title,
        category: adr.category,
        confidenceLevel: adr.confidenceLevel,);

      return adr;
    } catch (error) {
      this.performanceTracker.endTimer('create_architecture_decision');'
      this.logger.error(
        'Failed to create architecture decision record:',
        error
      );
      throw error;
    }
  }

  /**
   * Request architecture decision with AI-powered option analysis
   */
  async requestArchitectureDecision(
    request: DecisionRequest
  ): Promise<{
    approved: boolean;
    selectedOption?: number;
    adrId?: string;
    comments?: string;
  }> {
    if (!this.initialized) await this.initialize();

    const _timer = this.performanceTracker.startTimer(
      'request_architecture_decision''
    );

    try {
      this.logger.info('Processing architecture decision request', {'
        title: request.title,
      });

      // Use brain coordinator for option analysis
      const optionAnalysis = await this.brainCoordinator.analyzeDecisionOptions(
        {
          request,
          context: {
            existingDecisions: Array.from(this.decisionRecords.values()),
            stakeholders: request.stakeholders,
          },
        }
      );

      // Determine if decision requires human approval
      const requiresApproval = this.requiresHumanApproval(
        request,
        optionAnalysis
      );

      if (requiresApproval) {
        // Create approval task with stakeholder collaboration
        const approval = await this.aguiService.createApprovalTask({
          taskType: 'architecture_decision_request',
          description: `, Architecture, decision, requires, approval: $
    }
};
{
    request.title;
}
`,`;
context: {
    request, optionAnalysis;
}
approvers: request.stakeholders,
    timeout;
2700000, // 45 minutes
    collaborationMode;
true,
;
;
if (approval.approved && approval.selectedOption !== undefined) {
    // Create ADR from approved option
    const adr = await this.createADRFromRequest(request, approval.selectedOption, optionAnalysis);
    this.performanceTracker.endTimer('request_architecture_decision');
    ';
    return {
        approved: true,
        selectedOption: approval.selectedOption,
        adrId: adr.id,
        comments: approval.comments,
    };
}
this.performanceTracker.endTimer('request_architecture_decision');
';
return {
    approved: false,
    comments: approval.comments || 'Decision not approved by stakeholders',
};
{
    // Auto-approve based on AI recommendation
    const recommendedOption = optionAnalysis.recommendedOptionIndex || 0;
    const adr = await this.createADRFromRequest(request, recommendedOption, optionAnalysis);
    this.performanceTracker.endTimer('request_architecture_decision');
    ';
    return {
        approved: true,
        selectedOption: recommendedOption,
        adrId: adr.id,
        comments: 'Auto-approved based on AI analysis',
    };
}
try { }
catch (error) {
    this.performanceTracker.endTimer('request_architecture_decision');
    ';
    this.logger.error('Failed to process architecture decision request:', error);
    throw error;
}
/**
 * Update ADR status with workflow automation
 */
async;
updateADRStatus(adrId, string, newStatus, ADRStatus, _context ?  : any);
Promise < ArchitectureDecisionRecord > {
    : .initialized, await, this: .initialize(),
    const: _timer = this.performanceTracker.startTimer('update_adr_status'), ': ,
    try: {
        const: adr = this.decisionRecords.get(adrId),
        if(, adr) {
            throw new Error(`Architecture Decision Record not found: ${adrId}`);
            `
      }

      // Use workflow engine for status transition validation
      const statusTransition =
        await this.workflowEngine.validateStatusTransition({
          fromStatus: adr.status,
          toStatus: newStatus,
          context: { adr, ...context },
        });

      if (!statusTransition.isValid) {
        throw new Error(
          `;
            Invalid;
            status;
            transition: $statusTransition.reason ``;
            ;
        }
        // Update ADR with new status
        ,
        // Update ADR with new status
        const: updatedADR, ArchitectureDecisionRecord = {
            ...adr,
            status: newStatus,
            updatedAt: new Date(),
        },
        this: .decisionRecords.set(adrId, updatedADR),
        this: .performanceTracker.endTimer('update_adr_status'), ': this.telemetryManager.recordCounter('adr_status_updates', 1), ': this.logger.info('ADR status updated', ', adrId, oldStatus, adr.status, newStatus, title, adr.title),
        return: updatedADR
    }, catch(error) {
        this.performanceTracker.endTimer('update_adr_status');
        ';
        this.logger.error('Failed to update ADR status:', error);
        ';
        throw error;
    }
};
/**
 * Generate ADR analytics dashboard with AI insights
 */
async;
getADRDashboard();
Promise < ADRDashboard > {
    : .initialized, await, this: .initialize(),
    const: _timer = this.performanceTracker.startTimer('generate_adr_dashboard'), ': ,
    try: {
        const: allDecisions = Array.from(this.decisionRecords.values())(),
        // Use brain coordinator for intelligent dashboard insights
        const: dashboardInsights =
            await this.brainCoordinator.generateADRDashboardInsights({
                decisions: allDecisions,
                config: this.config,
            }),
        const: dashboard, ADRDashboard = {
            totalDecisions: allDecisions.length,
            decisionsByStatus: this.groupDecisionsByStatus(allDecisions),
            decisionsByCategory: this.groupDecisionsByCategory(allDecisions),
            averageDecisionTime: this.calculateAverageDecisionTime(allDecisions),
            stakeholderEngagement: dashboardInsights.stakeholderEngagement || [],
            decisionEffectiveness: dashboardInsights.decisionEffectiveness || [],
            upcomingReviews: this.getUpcomingReviews(allDecisions),
            trendAnalysis: dashboardInsights.trendAnalysis || [],
        },
        this: .performanceTracker.endTimer('generate_adr_dashboard'), ': this.logger.info('ADR dashboard generated', ', totalDecisions, dashboard.totalDecisions, pendingReviews, dashboard.upcomingReviews.length),
        return: dashboard
    }, catch(error) {
        this.performanceTracker.endTimer('generate_adr_dashboard');
        ';
        this.logger.error('Failed to generate ADR dashboard:', error);
        ';
        throw error;
    }
};
/**
 * Get all architecture decision records
 */
getAllDecisionRecords();
ArchitectureDecisionRecord[];
{
    return Array.from(this.decisionRecords.values())();
}
/**
 * Get ADR by ID
 */
getDecisionRecord(adrId, string);
ArchitectureDecisionRecord | undefined;
{
    return this.decisionRecords.get(adrId);
}
/**
 * Shutdown service gracefully
 */
async;
shutdown();
Promise < void  > {
    : .brainCoordinator?.shutdown
};
{
    await this.brainCoordinator.shutdown();
}
if (this.workflowEngine?.shutdown) {
    await this.workflowEngine.shutdown();
}
if (this.aguiService?.shutdown) {
    await this.aguiService.shutdown();
}
if (this.conversationOrchestrator?.shutdown) {
    await this.conversationOrchestrator.shutdown();
}
if (this.telemetryManager?.shutdown) {
    await this.telemetryManager.shutdown();
}
this.initialized = false;
this.logger.info('Architecture Decision Management Service shutdown complete');
';
generateAlternatives(_decision, any, analysis, any);
Alternative[];
{
    // AI-powered alternative generation
    const alternatives = analysis.alternatives || [];
    return alternatives.map((alt, index) => ({
        alternativeId: `alt-${index}`,
    } `
      name: alt.name || `), Alternative, $, { index } + 1);
}
`,`;
description: alt.description || '',
    pros;
alt.pros || [],
    cons;
alt.cons || [],
    cost;
alt.cost || this.generateDefaultCostAnalysis(),
    feasibility;
alt.feasibility || this.generateDefaultFeasibility(),
    riskAssessment;
alt.riskAssessment || this.generateDefaultRiskAssessment(),
    recommendationScore;
alt.score || 5.0,
;
;
calculateConfidenceLevel(decision, any, analysis, any, alternatives, Alternative[]);
number;
{
    // Calculate confidence based on various factors
    let confidence = 70; // Base confidence
    // Adjust based on analysis quality
    if (analysis.confidence)
        confidence += analysis.confidence * 0.3;
    // Adjust based on alternatives count
    if (alternatives.length >= 2)
        confidence += 10;
    if (alternatives.length >= 3)
        confidence += 5;
    // Adjust based on stakeholder count
    if (decision.stakeholders.length >= this.config.minStakeholders)
        confidence += 10;
    // Adjust based on impact level
    if (decision.impact.riskLevel === 'low')
        confidence += 10;
    ';
    if (decision.impact.riskLevel === 'high')
        confidence -= 10;
    ';
    return Math.min(95, Math.max(30, confidence));
}
generateReviewCriteria(decision, any);
string[];
{
    const criteria = [
        'Decision outcomes align with expected results',
        'Implementation proceeded as planned',
        'Stakeholder satisfaction remains high',
    ];
    // Add category-specific criteria
    if (decision.category === 'technology_selection') {
        ';
        criteria.push('Technology performance meets expectations');
        ';
    }
    if (decision.category === 'security_policy') {
        ';
        criteria.push('Security requirements are being met');
        ';
    }
    return criteria;
}
generateDecisionMetrics(decision, any);
DecisionMetric[];
{
    const baseMetrics = [
        {
            metricId: 'implementation-success',
            name: 'Implementation Success',
            description: 'Success rate of decision implementation',
            targetValue: 90,
            currentValue: 0,
            unit: 'percentage',
            trend: 'stable',
            lastMeasured: new Date(),
        },
        {
            metricId: 'stakeholder-satisfaction',
            name: 'Stakeholder Satisfaction',
            description: 'Satisfaction level of decision stakeholders',
            targetValue: 85,
            currentValue: 0,
            unit: 'percentage',
            trend: 'stable',
            lastMeasured: new Date(),
        },
    ];
    // Add category-specific metrics
    if (decision.category === 'performance_standard') {
        ';
        baseMetrics.push(metricId, 'performance-improvement', name, 'Performance Improvement', description, 'Performance improvement achieved', targetValue, 20, currentValue, 0, unit, 'percentage', trend, 'stable', lastMeasured, new Date());
    }
    return baseMetrics;
}
async;
initiateStakeholderReview(adr, ArchitectureDecisionRecord);
Promise < void  > {
    try: {
        await, this: .conversationOrchestrator.startConversation({
            conversationId: `adr-review-${adr.id}`,
        } `
        participants: adr.stakeholders,
        topic: `, Review, $, { adr, : .title } `,`, context, { adr }, timeout, 86400000) // 24 hours
    }
};
try { }
catch (error) {
    this.logger.error('Failed to initiate stakeholder review:', error);
    ';
}
requiresHumanApproval(request, DecisionRequest, analysis, any);
boolean;
{
    // High-priority or high-impact decisions require approval
    if (request.priority === 'critical')
        return true;
    ';
    if (request.priority === 'high')
        return true;
    ';
    // Large effort decisions require approval
    const totalEffort = request.options.reduce((sum, opt) => sum + opt.estimatedEffort, 0);
    if (totalEffort > this.config.autoApprovalThreshold)
        return true;
    // AI confidence below threshold requires approval
    if (analysis.confidence && analysis.confidence < 0.8)
        return true;
    return false;
}
async;
createADRFromRequest(request, DecisionRequest, selectedOption, number, analysis, any);
Promise < ArchitectureDecisionRecord > {
    const: option = request.options[selectedOption],
    return: await this.createArchitectureDecisionRecord({
        title: request.title,
        context: request.context,
        decision: option.description,
        consequences: [`Selected: ${option.title}`, ...option.pros],
    } `
      author: request.requester,
      stakeholders: request.stakeholders,
      category: this.inferCategory(request, analysis),
      impact: this.calculateImpact(option, analysis),
      dependencies: [],
      supersedes: [],
      tags: [],
      reviewCycle: {
        frequency: 'annually',
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        reviewCriteria: [
          'business_value',
          'technical_feasibility',
          'compliance',
        ],
        reviewers: request.stakeholders,
        escalationPath: ['team_lead', 'architecture_board', 'cto'],
      },
      attachments: [],
      metrics: [],
    });
  }

  private inferCategory(
    request: DecisionRequest,
    analysis: any
  ): DecisionCategory {
    // AI-powered category inference or fallback to heuristics
    if (analysis.recommendedCategory) return analysis.recommendedCategory;

    // Simple keyword-based inference
    const title = request.title.toLowerCase();
    if (title.includes('technology') || title.includes('tech'))'
      return 'technology_selection;
    if (title.includes('security')) return 'security_policy;
    if (title.includes('performance')) return 'performance_standard;
    if (title.includes('architecture') || title.includes('pattern'))'
      return 'architecture_pattern;

    return 'architecture_pattern'; // Default'
  }

  private calculateImpact(
    option: DecisionOption,
    analysis: any
  ): DecisionImpact {
    return {
      scope: this.inferScope(option.estimatedCost),
      timeHorizon: this.inferTimeHorizon(option.estimatedEffort),
      riskLevel: option.riskLevel,
      businessImpact: analysis.businessImpact || 5,
      technicalComplexity: analysis.technicalComplexity || 5,
      implementationEffort: option.estimatedEffort,
      maintenanceOverhead: analysis.maintenanceOverhead || 3,
    };
  }

  private inferScope(cost: number): DecisionImpact['scope'] {'
    if (cost > 100000) return 'enterprise;
    if (cost > 50000) return 'system;
    if (cost > 10000) return 'system;
    return 'local;
  }

  private inferTimeHorizon(effort: number): DecisionImpact['timeHorizon'] {'
    if (effort > 2000) return 'strategic;
    if (effort > 500) return 'long_term;
    if (effort > 100) return 'medium_term;
    return 'short_term;
  }

  private generateDefaultCostAnalysis(): CostAnalysis {
    return {
      implementationCost: 0,
      maintenanceCost: 0,
      opportunityCost: 0,
      currency: 'USD',
      timeframe: 'project',
      confidence: 50,
    };
  }

  private generateDefaultFeasibility(): FeasibilityAssessment {
    return {
      technical: 7,
      operational: 7,
      economic: 7,
      legal: 8,
      timeline: 7,
      resource: 6,
    };
  }

  private generateDefaultRiskAssessment(): RiskAssessment {
    return {
      risks: [],
      overallRiskScore: 3,
      riskMitigationPlan:
        'Standard risk mitigation procedures will be followed',
      contingencyPlan: 'Fallback to previous approach if issues arise',
    };
  }

  private groupDecisionsByStatus(
    decisions: ArchitectureDecisionRecord[]
  ): Record<ADRStatus, number> {
    return decisions.reduce(
      (groups, decision) => {
        groups[decision.status] = (groups[decision.status] || 0) + 1;
        return groups;
      },
      {} as Record<ADRStatus, number>
    );
  }

  private groupDecisionsByCategory(
    decisions: ArchitectureDecisionRecord[]
  ): Record<DecisionCategory, number> {
    return decisions.reduce(
      (groups, decision) => {
        groups[decision.category] = (groups[decision.category] || 0) + 1;
        return groups;
      },
      {} as Record<DecisionCategory, number>
    );
  }

  private calculateAverageDecisionTime(
    decisions: ArchitectureDecisionRecord[]
  ): number {
    if (decisions.length === 0) return 0;

    const acceptedDecisions = decisions.filter((d) => d.status ==='accepted');'
    if (acceptedDecisions.length === 0) return 0;

    const totalTime = acceptedDecisions.reduce((sum, decision) => {
      const timeToDecision =
        decision.updatedAt.getTime() - decision.createdAt.getTime();
      return sum + timeToDecision / (24 * 60 * 60 * 1000); // Convert to days
    }, 0);

    return totalTime / acceptedDecisions.length;
  }

  private getUpcomingReviews(
    decisions: ArchitectureDecisionRecord[]
  ): ArchitectureDecisionRecord[] {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return decisions
      .filter((decision) => {
        const nextReview = decision.reviewCycle.nextReviewDate;
        return (
          nextReview && nextReview >= now && nextReview <= thirtyDaysFromNow
        );
      })
      .slice(0, 10); // Limit to 10 most urgent
  }
}

export default ArchitectureDecisionManagementService;
    )
};
