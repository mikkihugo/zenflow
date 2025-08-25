/**
 * @fileoverview Technical Debt Management Service - Technical debt tracking and remediation.
 *
 * Provides specialized technical debt management with AI-powered prioritization,
 * automated tracking, impact analysis, and integration with development workflows.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent debt prioritization and impact analysis
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for remediation workflows
 * - @claude-zen/agui: Human-in-loop approvals for high-impact debt items
 * - @claude-zen/brain: LoadBalancer for resource optimization (integrated)
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import type { Logger } from '@claude-zen/foundation';

// ============================================================================
// TECHNICAL DEBT MANAGEMENT INTERFACES
// ============================================================================

/**
 * Technical Debt Item with enhanced tracking
 */
export interface TechnicalDebtItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical|high|medium|low;
  impact: string;
  effort: number;
  component: string;
  status: 'identified|approved|planned|in-progress|resolved;
  category: TechnicalDebtCategory;
  priority: number; // AI-calculated priority score
  businessImpact: BusinessImpactLevel;
  technicalRisk: TechnicalRiskLevel;
  remediationPlan?: RemediationPlan;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Technical debt categories
 */
export type TechnicalDebtCategory =|code_quality|security_vulnerability|performance_issue|maintainability|scalability|architecture_drift|deprecated_technology|test_debt|documentation_gap|'infrastructure_debt;

/**
 * Business impact levels for technical debt
 */
export type BusinessImpactLevel = {
  readonly level: 'low|medium|high|critical;
  readonly customerImpact: number; // 0-10 scale
  readonly revenueImpact: number; // 0-10 scale
  readonly operationalImpact: number; // 0-10 scale
  readonly complianceRisk: number; // 0-10 scale
};

/**
 * Technical risk levels
 */
export type TechnicalRiskLevel = {
  readonly level: 'low|medium|high|critical;
  readonly securityRisk: number; // 0-10 scale
  readonly performanceRisk: number; // 0-10 scale
  readonly maintainabilityRisk: number; // 0-10 scale
  readonly scalabilityRisk: number; // 0-10 scale
};

/**
 * Remediation plan for technical debt
 */
export interface RemediationPlan {
  readonly planId: string;
  readonly approachType: 'incremental|big_bang|parallel|hybrid;
  readonly phases: RemediationPhase[];
  readonly timeline: {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly milestones: Milestone[];
  };
  readonly resources: ResourceRequirement[];
  readonly risks: RemediationRisk[];
  readonly successCriteria: SuccessMetric[];
}

/**
 * Remediation phase
 */
export interface RemediationPhase {
  readonly phaseId: string;
  readonly name: string;
  readonly description: string;
  readonly duration: number; // days
  readonly effort: number; // hours
  readonly dependencies: string[];
  readonly deliverables: string[];
  readonly validationCriteria: string[];
}

/**
 * Resource requirement for remediation
 */
export interface ResourceRequirement {
  readonly resourceType:|developer|architect|qa|devops|'security;
  readonly skillLevel: 'junior|mid|senior|expert;
  readonly hoursRequired: number;
  readonly timeframe: 'immediate|short_term|medium_term|long_term;
}

/**
 * Remediation risk
 */
export interface RemediationRisk {
  readonly riskId: string;
  readonly description: string;
  readonly probability: number; // 0-1 scale
  readonly impact: number; // 0-10 scale
  readonly mitigation: string;
  readonly contingency: string;
}

/**
 * Success metric for remediation
 */
export interface SuccessMetric {
  readonly metricId: string;
  readonly name: string;
  readonly description: string;
  readonly targetValue: number;
  readonly measurementMethod: string;
  readonly validationFrequency: 'daily' | 'weekly' | 'monthly';
}

/**
 * Milestone in remediation timeline
 */
export interface Milestone {
  readonly milestoneId: string;
  readonly name: string;
  readonly description: string;
  readonly targetDate: Date;
  readonly deliverables: string[];
  readonly acceptanceCriteria: string[];
}

/**
 * Technical debt management configuration
 */
export interface TechnicalDebtConfig {
  readonly maxDebtItems: number;
  readonly criticalSeverityThreshold: number;
  readonly autoApprovalThreshold: number;
  readonly remediationPlanningThreshold: number;
  readonly prioritizationStrategy:|severity_based|impact_based|ai_optimized|'business_value;
  readonly trackingGranularity:|component|module|system|'enterprise;
}

/**
 * Technical debt analytics dashboard data
 */
export interface TechnicalDebtDashboard {
  readonly totalDebtItems: number;
  readonly debtByCategory: Record<TechnicalDebtCategory, number>;
  readonly debtBySeverity: Record<string, number>;
  readonly debtByStatus: Record<string, number>;
  readonly totalEffortRequired: number;
  readonly businessImpactScore: number;
  readonly technicalRiskScore: number;
  readonly remediationProgress: RemediationProgress[];
  readonly trendAnalysis: TrendData[];
  readonly topPriorityItems: TechnicalDebtItem[];
}

/**
 * Remediation progress tracking
 */
export interface RemediationProgress {
  readonly remediationId: string;
  readonly debtItemId: string;
  readonly currentPhase: string;
  readonly overallProgress: number; // percentage
  readonly timelineAdherence: number; // percentage
  readonly budgetAdherence: number; // percentage
  readonly qualityMetrics: QualityMetric[];
}

/**
 * Quality metric for remediation
 */
export interface QualityMetric {
  readonly metricName: string;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly trend: 'improving' | 'stable' | 'declining'|'improving' | 'stable' | 'declining'|declining;
  readonly measurement: string;
}

/**
 * Trend data for analytics
 */
export interface TrendData {
  readonly period: string;
  readonly debtIntroduced: number;
  readonly debtResolved: number;
  readonly netDebtChange: number;
  readonly velocityTrend: 'accelerating|'improving' | 'stable' | 'declining'|decelerating;
}

// ============================================================================
// TECHNICAL DEBT MANAGEMENT SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Technical Debt Management Service - Technical debt tracking and remediation
 *
 * Provides comprehensive technical debt management with AI-powered prioritization,
 * automated tracking, impact analysis, and integration with development workflows.
 */
export class TechnicalDebtManagementService {
  private readonly logger: Logger;
  private brainCoordinator?: any;
  private performanceTracker?: any;
  private telemetryManager?: any;
  private workflowEngine?: any;
  private aguiService?: any;
  private loadBalancer?: any;
  private initialized = false;

  // Technical debt state
  private debtItems = new Map<string, TechnicalDebtItem>();
  private remediationPlans = new Map<string, RemediationPlan>();
  private config: TechnicalDebtConfig;

  constructor(logger: Logger, config: Partial<TechnicalDebtConfig> = {}) {
    this.logger = logger;
    this.config = {
      maxDebtItems: 1000,
      criticalSeverityThreshold: 1000, // effort threshold
      autoApprovalThreshold: 100, // effort threshold
      remediationPlanningThreshold: 500, // effort threshold
      prioritizationStrategy: 'ai_optimized',
      trackingGranularity: 'component',
      ...config,
    };
  }

  /**
   * Initialize service with lazy-loaded dependencies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Lazy load @claude-zen/brain for LoadBalancer - intelligent prioritization
      const { BrainCoordinator } = await import('@claude-zen/brain');'
      this.brainCoordinator = new BrainCoordinator({
        autonomous: {
          enabled: true,
          learningRate: 0.1,
          adaptationThreshold: 0.7,
        },
      });
      await this.brainCoordinator.initialize();

      // Lazy load @claude-zen/foundation for performance tracking
      const { PerformanceTracker, TelemetryManager } = await import(
        '@claude-zen/foundation''
      );
      this.performanceTracker = new PerformanceTracker();
      this.telemetryManager = new TelemetryManager({
        serviceName: 'technical-debt-management',
        enableTracing: true,
        enableMetrics: true,
      });
      await this.telemetryManager.initialize();

      // Lazy load @claude-zen/workflows for remediation workflows
      const { WorkflowEngine } = await import('@claude-zen/workflows');'
      this.workflowEngine = new WorkflowEngine({
        maxConcurrentWorkflows: 5,
        enableVisualization: true,
      });
      await this.workflowEngine.initialize();

      // Lazy load @claude-zen/agui for approval workflows
      const { AGUISystem } = await import('@claude-zen/agui');'
      const aguiResult = await AGUISystem({
        aguiType: 'terminal',
        taskApprovalConfig: {
          enableRichDisplay: true,
          enableBatchMode: false,
          requireRationale: true,
        },
      });
      this.aguiService = aguiResult.agui;

      // Lazy load @claude-zen/brain for LoadBalancer - resource optimization (LoadBalancer integrated)
      const { LoadBalancer } = await import('@claude-zen/brain');'
      this.loadBalancer = new LoadBalancer({
        strategy: 'intelligent_distribution',
        enablePredictiveScaling: true,
      });
      await this.loadBalancer.initialize();

      this.initialized = true;
      this.logger.info(
        'Technical Debt Management Service initialized successfully''
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize Technical Debt Management Service:',
        error
      );
      throw error;
    }
  }

  /**
   * Add technical debt item with AI-powered prioritization and impact analysis
   */
  async addTechnicalDebtItem(
    item: Omit<
      TechnicalDebtItem,|id|createdAt|updatedAt|status|priority|businessImpact|'technicalRisk''
    >
  ): Promise<TechnicalDebtItem> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('add_technical_debt_item');'

    try {
      this.logger.info('Adding technical debt item with AI analysis', {'
        title: item.title,
      });

      // Use brain coordinator for intelligent prioritization and impact analysis
      const prioritizationAnalysis =
        await this.brainCoordinator.analyzeTechnicalDebt({
          item,
          existingDebt: Array.from(this.debtItems.values()),
          strategy: this.config.prioritizationStrategy,
        });

      // Calculate business impact
      const businessImpact = this.calculateBusinessImpact(
        item,
        prioritizationAnalysis
      );

      // Calculate technical risk
      const technicalRisk = this.calculateTechnicalRisk(
        item,
        prioritizationAnalysis
      );

      // Create technical debt item with AI-enhanced data
      const debtItem: TechnicalDebtItem = {
        id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,`
        status: 'identified',
        priority:
          prioritizationAnalysis.priorityScore || this.calculateFallbackPriority(item),
        businessImpact,
        technicalRisk,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...item,
      };

      // Check if approval is needed for high-impact items
      if (item.effort > this.config.autoApprovalThreshold) {
        const approval = await this.requestDebtApproval(debtItem);
        if (!approval.approved) {
          throw new Error(
            `Technical debt item approval rejected: ${approval.reason}``
          );
        }
      }

      // Store debt item
      this.debtItems.set(debtItem.id, debtItem);

      // Create remediation plan if above threshold
      if (item.effort > this.config.remediationPlanningThreshold) {
        const remediationPlan = await this.generateRemediationPlan(debtItem);
        this.remediationPlans.set(remediationPlan.planId, remediationPlan);
        debtItem.remediationPlan = remediationPlan;
      }

      this.performanceTracker.endTimer('add_technical_debt_item');'
      this.telemetryManager.recordCounter('technical_debt_items_added', 1);'

      this.logger.info('Technical debt item added successfully', {'
        itemId: debtItem.id,
        priority: debtItem.priority,
        severity: debtItem.severity,
        category: debtItem.category,
      });

      return debtItem;
    } catch (error) {
      this.performanceTracker.endTimer('add_technical_debt_item');'
      this.logger.error('Failed to add technical debt item:', error);'
      throw error;
    }
  }

  /**
   * Update technical debt item status with workflow automation
   */
  async updateDebtItemStatus(
    itemId: string,
    newStatus: TechnicalDebtItem['status'],
    context?: any
  ): Promise<TechnicalDebtItem> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('update_debt_item_status');'

    try {
      const item = this.debtItems.get(itemId);
      if (!item) {
        throw new Error(`Technical debt item not found: ${itemId}`);`
      }

      // Use workflow engine for status transition validation
      const statusTransition =
        await this.workflowEngine.validateStatusTransition({
          fromStatus: item.status,
          toStatus: newStatus,
          context: { item, ...context },
        });

      if (!statusTransition.isValid) {
        throw new Error(
          `Invalid status transition: ${statusTransition.reason}``
        );
      }

      // Update item with new status
      const updatedItem: TechnicalDebtItem = {
        ...item,
        status: newStatus,
        updatedAt: new Date(),
      };

      this.debtItems.set(itemId, updatedItem);

      this.performanceTracker.endTimer('update_debt_item_status');'
      this.telemetryManager.recordCounter('debt_status_updates', 1);'

      this.logger.info('Technical debt item status updated', {'
        itemId,
        oldStatus: item.status,
        newStatus,
        title: item.title,
      });

      return updatedItem;
    } catch (error) {
      this.performanceTracker.endTimer('update_debt_item_status');'
      this.logger.error('Failed to update technical debt item status:', error);'
      throw error;
    }
  }

  /**
   * Generate technical debt analytics dashboard with AI insights
   */
  async getTechnicalDebtDashboard(): Promise<TechnicalDebtDashboard> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('generate_debt_dashboard');'

    try {
      const allDebtItems = Array.from(this.debtItems.values())();

      // Use brain coordinator for intelligent dashboard insights
      const dashboardInsights =
        await this.brainCoordinator.generateDebtDashboardInsights({
          debtItems: allDebtItems,
          remediationPlans: Array.from(this.remediationPlans.values()),
          config: this.config,
        });

      const dashboard: TechnicalDebtDashboard = {
        totalDebtItems: allDebtItems.length,
        debtByCategory: this.groupDebtByCategory(allDebtItems),
        debtBySeverity: this.groupDebtBySeverity(allDebtItems),
        debtByStatus: this.groupDebtByStatus(allDebtItems),
        totalEffortRequired: this.calculateTotalEffort(allDebtItems),
        businessImpactScore: this.calculateOverallBusinessImpact(allDebtItems),
        technicalRiskScore: this.calculateOverallTechnicalRisk(allDebtItems),
        remediationProgress: dashboardInsights.remediationProgress || [],
        trendAnalysis: dashboardInsights.trendAnalysis || [],
        topPriorityItems: allDebtItems
          .sort((a, b) => b.priority - a.priority)
          .slice(0, 10),
      };

      this.performanceTracker.endTimer('generate_debt_dashboard');'

      this.logger.info('Technical debt dashboard generated', {'
        totalItems: dashboard.totalDebtItems,
        highSeverityItems: dashboard.debtBySeverity['high'] || 0,
      });

      return dashboard;
    } catch (error) {
      this.performanceTracker.endTimer('generate_debt_dashboard');'
      this.logger.error('Failed to generate technical debt dashboard:', error);'
      throw error;
    }
  }

  /**
   * Generate AI-powered remediation plan
   */
  async generateRemediationPlan(
    debtItem: TechnicalDebtItem
  ): Promise<RemediationPlan> {
    if (!this.initialized) await this.initialize();

    try {
      // Use brain coordinator for intelligent remediation planning
      const planningAnalysis =
        await this.brainCoordinator.generateRemediationPlan({
          debtItem,
          constraints: {
            maxDuration: 90, // days
            maxEffort: debtItem.effort * 1.2, // 20% buffer
            resourceConstraints: true,
          },
        });

      const remediationPlan: RemediationPlan = {
        planId: `remediation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,`
        approachType: planningAnalysis.recommendedApproach || 'incremental',
        phases: planningAnalysis.phases || this.generateDefaultPhases(debtItem),
        timeline:
          planningAnalysis.timeline || this.generateDefaultTimeline(debtItem),
        resources:
          planningAnalysis.resources || this.generateDefaultResources(debtItem),
        risks: planningAnalysis.risks || [],
        successCriteria:
          planningAnalysis.successCriteria || this.generateDefaultSuccessCriteria(debtItem),
      };

      return remediationPlan;
    } catch (error) {
      this.logger.error('Failed to generate remediation plan:', error);'
      throw error;
    }
  }

  /**
   * Get all technical debt items
   */
  getAllDebtItems(): TechnicalDebtItem[] {
    return Array.from(this.debtItems.values())();
  }

  /**
   * Get technical debt item by ID
   */
  getDebtItem(itemId: string): TechnicalDebtItem | undefined {
    return this.debtItems.get(itemId);
  }

  /**
   * Shutdown service gracefully
   */
  async shutdown(): Promise<void> {
    if (this.brainCoordinator?.shutdown) {
      await this.brainCoordinator.shutdown();
    }
    if (this.workflowEngine?.shutdown) {
      await this.workflowEngine.shutdown();
    }
    if (this.aguiService?.shutdown) {
      await this.aguiService.shutdown();
    }
    if (this.loadBalancer?.shutdown) {
      await this.loadBalancer.shutdown();
    }
    if (this.telemetryManager?.shutdown) {
      await this.telemetryManager.shutdown();
    }
    this.initialized = false;
    this.logger.info('Technical Debt Management Service shutdown complete');'
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async requestDebtApproval(item: TechnicalDebtItem): Promise<any> {
    try {
      const approval = await this.aguiService.createApprovalTask({
        taskType: 'technical_debt_approval',
        description: `High-effort technical debt item requires approval: ${item.title}`,`
        context: { item },
        approvers: ['tech-lead', 'architect'],
        timeout: 1800000,
      });

      return approval;
    } catch (error) {
      this.logger.error('Technical debt approval request failed:', error);'
      return { approved: false, reason: 'approval_system_error'};'
    }
  }

  private calculateBusinessImpact(
    item: any,
    analysis: any
  ): BusinessImpactLevel {
    // AI-enhanced business impact calculation
    const customerImpact =
      analysis.businessImpact?.customerImpact || this.calculateCustomerImpact(item);
    const revenueImpact =
      analysis.businessImpact?.revenueImpact || this.calculateRevenueImpact(item);
    const operationalImpact =
      analysis.businessImpact?.operationalImpact || this.calculateOperationalImpact(item);
    const complianceRisk =
      analysis.businessImpact?.complianceRisk || this.calculateComplianceRisk(item);

    const avgImpact =
      (customerImpact + revenueImpact + operationalImpact + complianceRisk) / 4;

    return {
      level:
        avgImpact >= 8
          ?'critical''
          : avgImpact >= 6
            ? 'high''
            : avgImpact >= 3
              ? 'medium''
              : 'low',
      customerImpact,
      revenueImpact,
      operationalImpact,
      complianceRisk,
    };
  }

  private calculateTechnicalRisk(item: any, analysis: any): TechnicalRiskLevel {
    // AI-enhanced technical risk calculation
    const securityRisk =
      analysis.technicalRisk?.securityRisk || this.calculateSecurityRisk(item);
    const performanceRisk =
      analysis.technicalRisk?.performanceRisk || this.calculatePerformanceRisk(item);
    const maintainabilityRisk =
      analysis.technicalRisk?.maintainabilityRisk || this.calculateMaintainabilityRisk(item);
    const scalabilityRisk =
      analysis.technicalRisk?.scalabilityRisk || this.calculateScalabilityRisk(item);

    const avgRisk =
      (securityRisk + performanceRisk + maintainabilityRisk + scalabilityRisk) /
      4;

    return {
      level:
        avgRisk >= 8
          ?'critical''
          : avgRisk >= 6
            ? 'high''
            : avgRisk >= 3
              ? 'medium''
              : 'low',
      securityRisk,
      performanceRisk,
      maintainabilityRisk,
      scalabilityRisk,
    };
  }

  private calculateFallbackPriority(item: any): number {
    // Fallback priority calculation if AI analysis fails
    const severityWeight =
      item.severity === 'critical''
        ? 10
        : item.severity === 'high''
          ? 7
          : item.severity === 'medium'? 5'
            : 2;
    const effortWeight = Math.max(1, 10 - item.effort / 100); // Inverse relationship with effort
    const categoryWeight = this.getCategoryWeight(item.category);

    return severityWeight * 0.4 + effortWeight * 0.3 + categoryWeight * 0.3;
  }

  private getCategoryWeight(category: TechnicalDebtCategory): number {
    const weights: Record<TechnicalDebtCategory, number> = {
      security_vulnerability: 10,
      performance_issue: 8,
      scalability: 7,
      maintainability: 6,
      code_quality: 5,
      architecture_drift: 6,
      deprecated_technology: 4,
      test_debt: 3,
      documentation_gap: 2,
      infrastructure_debt: 5,
    };
    return weights[category] || 3;
  }

  private calculateCustomerImpact(item: any): number {
    // Simple heuristic - can be enhanced with AI
    return item.category ==='performance_issue''
      ? 8
      : item.category === 'security_vulnerability''
        ? 7
        : 3;
  }

  private calculateRevenueImpact(item: any): number {
    return item.severity === 'critical' ? 8 : item.severity === 'high' ? 5 : 2;'
  }

  private calculateOperationalImpact(item: any): number {
    return item.category === 'maintainability''
      ? 7
      : item.category === 'scalability''
        ? 6
        : 3;
  }

  private calculateComplianceRisk(item: any): number {
    return item.category === 'security_vulnerability' ? 9 : 2;'
  }

  private calculateSecurityRisk(item: any): number {
    return item.category === 'security_vulnerability' ? 9 : 2;'
  }

  private calculatePerformanceRisk(item: any): number {
    return item.category === 'performance_issue' ? 8 : 3;'
  }

  private calculateMaintainabilityRisk(item: any): number {
    return item.category === 'maintainability''
      ? 7
      : item.category === 'code_quality''
        ? 6
        : 3;
  }

  private calculateScalabilityRisk(item: any): number {
    return item.category === 'scalability' ? 8 : 3;'
  }

  private generateDefaultPhases(
    debtItem: TechnicalDebtItem
  ): RemediationPhase[] {
    return [
      {
        phaseId: 'analysis-phase',
        name: 'Analysis & Planning',
        description: 'Detailed analysis and planning of remediation approach',
        duration: 3,
        effort: debtItem.effort * 0.2,
        dependencies: [],
        deliverables: ['Analysis Report', 'Detailed Plan'],
        validationCriteria: ['Analysis completeness', 'Plan approval'],
      },
      {
        phaseId: 'implementation-phase',
        name: 'Implementation',
        description: 'Execute remediation plan',
        duration: 10,
        effort: debtItem.effort * 0.6,
        dependencies: ['analysis-phase'],
        deliverables: ['Remediated Code', 'Test Results'],
        validationCriteria: ['Code quality metrics', 'Test coverage'],
      },
      {
        phaseId: 'validation-phase',
        name: 'Validation & Closure',
        description: 'Validate remediation and close debt item',
        duration: 2,
        effort: debtItem.effort * 0.2,
        dependencies: ['implementation-phase'],
        deliverables: ['Validation Report', 'Closure Documentation'],
        validationCriteria: ['Success criteria met', 'Stakeholder approval'],
      },
    ];
  }

  private generateDefaultTimeline(
    debtItem: TechnicalDebtItem
  ): RemediationPlan['timeline'] {'
    const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Start in 1 week
    const endDate = new Date(startDate.getTime() + 21 * 24 * 60 * 60 * 1000); // 3 weeks duration

    return {
      startDate,
      endDate,
      milestones: [
        {
          milestoneId: 'analysis-complete',
          name: 'Analysis Complete',
          description: 'Initial analysis and planning completed',
          targetDate: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          deliverables: ['Analysis Report'],
          acceptanceCriteria: ['Stakeholder review completed'],
        },
      ],
    };
  }

  private generateDefaultResources(
    debtItem: TechnicalDebtItem
  ): ResourceRequirement[] {
    return [
      {
        resourceType: 'developer',
        skillLevel: debtItem.severity === 'critical' ? 'senior' : 'mid',
        hoursRequired: debtItem.effort * 0.7,
        timeframe: 'short_term',
      },
      {
        resourceType: 'architect',
        skillLevel: 'expert',
        hoursRequired: debtItem.effort * 0.2,
        timeframe: 'immediate',
      },
      {
        resourceType: 'qa',
        skillLevel: 'mid',
        hoursRequired: debtItem.effort * 0.1,
        timeframe: 'short_term',
      },
    ];
  }

  private generateDefaultSuccessCriteria(
    debtItem: TechnicalDebtItem
  ): SuccessMetric[] {
    return [
      {
        metricId: 'debt-resolution',
        name: 'Debt Item Resolution',
        description: 'Technical debt item is fully resolved',
        targetValue: 100,
        measurementMethod: 'Binary completion status',
        validationFrequency: 'weekly',
      },
    ];
  }

  private groupDebtByCategory(
    items: TechnicalDebtItem[]
  ): Record<TechnicalDebtCategory, number> {
    return items.reduce(
      (groups, item) => {
        groups[item.category] = (groups[item.category] || 0) + 1;
        return groups;
      },
      {} as Record<TechnicalDebtCategory, number>
    );
  }

  private groupDebtBySeverity(
    items: TechnicalDebtItem[]
  ): Record<string, number> {
    return items.reduce(
      (groups, item) => {
        groups[item.severity] = (groups[item.severity] || 0) + 1;
        return groups;
      },
      {} as Record<string, number>
    );
  }

  private groupDebtByStatus(
    items: TechnicalDebtItem[]
  ): Record<string, number> {
    return items.reduce(
      (groups, item) => {
        groups[item.status] = (groups[item.status] || 0) + 1;
        return groups;
      },
      {} as Record<string, number>
    );
  }

  private calculateTotalEffort(items: TechnicalDebtItem[]): number {
    return items.reduce((total, item) => total + item.effort, 0);
  }

  private calculateOverallBusinessImpact(items: TechnicalDebtItem[]): number {
    if (items.length === 0) return 0;
    const totalImpact = items.reduce((total, item) => {
      const avgImpact =
        (item.businessImpact.customerImpact +
          item.businessImpact.revenueImpact +
          item.businessImpact.operationalImpact +
          item.businessImpact.complianceRisk) /
        4;
      return total + avgImpact;
    }, 0);
    return totalImpact / items.length;
  }

  private calculateOverallTechnicalRisk(items: TechnicalDebtItem[]): number {
    if (items.length === 0) return 0;
    const totalRisk = items.reduce((total, item) => {
      const avgRisk =
        (item.technicalRisk.securityRisk +
          item.technicalRisk.performanceRisk +
          item.technicalRisk.maintainabilityRisk +
          item.technicalRisk.scalabilityRisk) /
        4;
      return total + avgRisk;
    }, 0);
    return totalRisk / items.length;
  }
}

export default TechnicalDebtManagementService;
