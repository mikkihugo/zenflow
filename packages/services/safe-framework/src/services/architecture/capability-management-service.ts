/**
 * @fileoverview Capability Management Service - Architecture capability tracking and management.
 *
 * Provides specialized architecture capability management with AI-powered maturity assessment,
 * capability roadmapping, dependency tracking, and performance monitoring.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent capability analysis and roadmap planning
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for capability development workflows
 * - @claude-zen/agui: Human-in-loop approvals for capability investments
 * - @claude-zen/brain: LoadBalancer for resource optimization across capabilities
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import type { Logger } from '@claude-zen/foundation';

// ============================================================================
// CAPABILITY MANAGEMENT INTERFACES
// ============================================================================

/**
 * Architecture Capability with enhanced tracking
 */
export interface ArchitectureCapability {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  maturityLevel: number; // 1-5 scale
  status: CapabilityStatus;
  enablers: string[]; // References to runway items
  dependencies: string[];
  kpis: CapabilityKPI[];
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  stakeholders: string[];
  businessValue: BusinessValueAssessment;
  technicalComplexity: TechnicalComplexityAssessment;
  investmentPlan: InvestmentPlan;
  roadmap: CapabilityRoadmap;
  metrics: CapabilityMetric[];
}

/**
 * Capability categories for organization
 */
export type CapabilityCategory =|business_capability|technology_capability|process_capability|data_capability|security_capability|integration_capability|platform_capability|infrastructure_capability|governance_capability|'innovation_capability;

/**
 * Capability status enumeration
 */
export type CapabilityStatus =|planning|developing|active|optimizing|retiring|deprecated|'suspended;

/**
 * Capability KPI with enhanced tracking
 */
export interface CapabilityKPI {
  id: string;
  name: string;
  description: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  trend: KPITrend;
  frequency: MeasurementFrequency;
  threshold: PerformanceThreshold;
  historicalData: HistoricalDataPoint[];
  lastMeasured: Date;
  dataSource: DataSource;
}

/**
 * KPI trend analysis
 */
export type KPITrend =|improving|'improving' | 'stable' | 'declining'|declining|volatile|'unknown;

/**
 * Measurement frequency options
 */
export type MeasurementFrequency =|real_time|hourly|daily|weekly|monthly|quarterly|'annually;

/**
 * Performance threshold configuration
 */
export interface PerformanceThreshold {
  readonly excellent: number; // Top performance
  readonly good: number; // Acceptable performance
  readonly warning: number; // Warning threshold
  readonly critical: number; // Critical threshold
  readonly direction: 'higher_is_better|lower_is_better;
}

/**
 * Historical data point for KPI tracking
 */
export interface HistoricalDataPoint {
  readonly timestamp: Date;
  readonly value: number;
  readonly context: string;
  readonly anomaly: boolean;
  readonly confidence: number; // 0-1 scale
}

/**
 * Data source configuration for KPIs
 */
export interface DataSource {
  readonly sourceId: string;
  readonly name: string;
  readonly type: 'database|api|file|manual|stream;
  readonly endpoint?: string;
  readonly refreshRate: number; // minutes
  readonly reliability: number; // 0-1 scale
}

/**
 * Business value assessment for capabilities
 */
export interface BusinessValueAssessment {
  readonly strategicAlignment: number; // 0-10 scale
  readonly revenueImpact: number; // 0-10 scale
  readonly costReduction: number; // 0-10 scale
  readonly riskMitigation: number; // 0-10 scale
  readonly marketAdvantage: number; // 0-10 scale
  readonly customerSatisfaction: number; // 0-10 scale
  readonly overallValue: number; // Calculated composite score
  readonly confidence: number; // 0-1 scale
  readonly lastAssessed: Date;
}

/**
 * Technical complexity assessment
 */
export interface TechnicalComplexityAssessment {
  readonly architecturalComplexity: number; // 0-10 scale
  readonly integrationComplexity: number; // 0-10 scale
  readonly dataComplexity: number; // 0-10 scale
  readonly securityComplexity: number; // 0-10 scale
  readonly scalabilityRequirements: number; // 0-10 scale
  readonly maintenanceOverhead: number; // 0-10 scale
  readonly overallComplexity: number; // Calculated composite score
  readonly confidence: number; // 0-1 scale
  readonly lastAssessed: Date;
}

/**
 * Investment plan for capability development
 */
export interface InvestmentPlan {
  readonly planId: string;
  readonly phases: InvestmentPhase[];
  readonly totalInvestment: number;
  readonly timeline: InvestmentTimeline;
  readonly roi: ROIProjection;
  readonly riskAssessment: InvestmentRiskAssessment;
  readonly approvals: ApprovalStatus[];
}

/**
 * Investment phase details
 */
export interface InvestmentPhase {
  readonly phaseId: string;
  readonly name: string;
  readonly description: string;
  readonly investment: number;
  readonly duration: number; // days
  readonly expectedOutcomes: string[];
  readonly successCriteria: string[];
  readonly risks: string[];
}

/**
 * Investment timeline
 */
export interface InvestmentTimeline {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly milestones: InvestmentMilestone[];
  readonly dependencies: TimelineDependency[];
}

/**
 * Investment milestone
 */
export interface InvestmentMilestone {
  readonly milestoneId: string;
  readonly name: string;
  readonly description: string;
  readonly targetDate: Date;
  readonly deliverables: string[];
  readonly successMetrics: string[];
}

/**
 * Timeline dependency
 */
export interface TimelineDependency {
  readonly dependencyId: string;
  readonly description: string;
  readonly type: 'capability|resource|approval|external;
  readonly criticality: 'low|medium|high|critical;
  readonly mitigation: string;
}

/**
 * ROI projection for investments
 */
export interface ROIProjection {
  readonly method:|net_present_value|internal_rate_of_return|payback_period|'benefit_cost_ratio;
  readonly timeHorizon: number; // years
  readonly discountRate: number; // percentage
  readonly expectedROI: number; // percentage
  readonly confidenceInterval: [number, number]; // [low, high] percentages
  readonly breakEvenPoint: number; // months
  readonly assumptions: string[];
}

/**
 * Investment risk assessment
 */
export interface InvestmentRiskAssessment {
  readonly risks: InvestmentRisk[];
  readonly overallRiskScore: number; // 0-10 scale
  readonly riskMitigation: string[];
  readonly contingencyPlan: string;
  readonly monitoringPlan: string[];
}

/**
 * Individual investment risk
 */
export interface InvestmentRisk {
  readonly riskId: string;
  readonly description: string;
  readonly category:|technical|financial|market|operational|'regulatory;
  readonly probability: number; // 0-1 scale
  readonly impact: number; // 0-10 scale
  readonly riskScore: number; // probability * impact
  readonly mitigation: string;
  readonly contingency: string;
  readonly owner: string;
}

/**
 * Approval status for investments
 */
export interface ApprovalStatus {
  readonly approvalId: string;
  readonly approver: string;
  readonly status: 'pending|approved|rejected|conditional;
  readonly conditions?: string[];
  readonly comments?: string;
  readonly timestamp: Date;
}

/**
 * Capability roadmap with strategic planning
 */
export interface CapabilityRoadmap {
  readonly roadmapId: string;
  readonly timeHorizon: number; // years
  readonly initiatives: CapabilityInitiative[];
  readonly dependencies: RoadmapDependency[];
  readonly riskFactors: RoadmapRisk[];
  readonly assumptionsAndConstraints: string[];
  readonly lastUpdated: Date;
}

/**
 * Capability initiative within roadmap
 */
export interface CapabilityInitiative {
  readonly initiativeId: string;
  readonly name: string;
  readonly description: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly investment: number;
  readonly expectedBenefits: string[];
  readonly deliverables: string[];
  readonly owner: string;
  readonly status: 'planned|active|completed|cancelled;
}

/**
 * Roadmap dependency
 */
export interface RoadmapDependency {
  readonly dependencyId: string;
  readonly fromInitiative: string;
  readonly toInitiative: string;
  readonly type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
  readonly lag: number; // days
  readonly criticality: 'low|medium|high|critical;
}

/**
 * Roadmap risk factor
 */
export interface RoadmapRisk {
  readonly riskId: string;
  readonly description: string;
  readonly probability: number; // 0-1 scale
  readonly impact: number; // 0-10 scale
  readonly affectedInitiatives: string[];
  readonly mitigation: string;
  readonly contingency: string;
}

/**
 * Capability metric for performance tracking
 */
export interface CapabilityMetric {
  readonly metricId: string;
  readonly name: string;
  readonly description: string;
  readonly type:|performance|efficiency|quality|adoption|'value;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly trend: KPITrend;
  readonly benchmarkValue?: number;
  readonly lastMeasured: Date;
}

/**
 * Capability management configuration
 */
export interface CapabilityConfig {
  readonly enableAIAnalysis: boolean;
  readonly enableAutomatedAssessment: boolean;
  readonly enableRoadmapPlanning: boolean;
  readonly enableInvestmentOptimization: boolean;
  readonly maturityAssessmentFrequency: 'monthly' | 'quarterly' | 'annually';
  readonly maxCapabilities: number;
  readonly minBusinessValueThreshold: number;
  readonly maxComplexityThreshold: number;
  readonly defaultInvestmentHorizon: number; // years
  readonly kpiUpdateFrequency: number; // minutes
}

/**
 * Capability analytics dashboard data
 */
export interface CapabilityDashboard {
  readonly totalCapabilities: number;
  readonly capabilitiesByCategory: Record<CapabilityCategory, number>;
  readonly capabilitiesByStatus: Record<CapabilityStatus, number>;
  readonly capabilitiesByMaturity: Record<number, number>;
  readonly averageMaturityLevel: number;
  readonly totalInvestment: number;
  readonly portfolioROI: number;
  readonly topPerformingCapabilities: ArchitectureCapability[];
  readonly investmentAllocation: InvestmentAllocation[];
  readonly maturityTrends: MaturityTrend[];
  readonly riskExposure: RiskExposure[];
}

/**
 * Investment allocation data
 */
export interface InvestmentAllocation {
  readonly category: CapabilityCategory;
  readonly allocation: number;
  readonly percentage: number;
  readonly roi: number;
  readonly riskLevel: 'low|medium|high|critical;
}

/**
 * Maturity trend data
 */
export interface MaturityTrend {
  readonly period: string;
  readonly averageMaturity: number;
  readonly improvementRate: number;
  readonly investmentEfficiency: number;
  readonly trend: 'accelerating|'improving' | 'stable' | 'declining'|decelerating;
}

/**
 * Risk exposure data
 */
export interface RiskExposure {
  readonly category: CapabilityCategory;
  readonly riskScore: number;
  readonly exposureValue: number;
  readonly mitigationCoverage: number; // percentage
  readonly residualRisk: number;
}

// ============================================================================
// CAPABILITY MANAGEMENT SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Capability Management Service - Architecture capability tracking and management
 *
 * Provides comprehensive architecture capability management with AI-powered maturity assessment,
 * capability roadmapping, dependency tracking, and performance monitoring.
 */
export class CapabilityManagementService {
  private readonly logger: Logger;
  private brainCoordinator?: any;
  private performanceTracker?: any;
  private telemetryManager?: any;
  private workflowEngine?: any;
  private aguiService?: any;
  private loadBalancer?: any;
  private initialized = false;

  // Capability state
  private capabilities = new Map<string, ArchitectureCapability>();
  private config: CapabilityConfig;

  constructor(logger: Logger, config: Partial<CapabilityConfig> = {}) {
    this.logger = logger;
    this.config = {
      enableAIAnalysis: true,
      enableAutomatedAssessment: true,
      enableRoadmapPlanning: true,
      enableInvestmentOptimization: true,
      maturityAssessmentFrequency: 'quarterly',
      maxCapabilities: 500,
      minBusinessValueThreshold: 3.0,
      maxComplexityThreshold: 8.0,
      defaultInvestmentHorizon: 3, // 3 years
      kpiUpdateFrequency: 60, // 1 hour
      ...config,
    };
  }

  /**
   * Initialize service with lazy-loaded dependencies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Lazy load @claude-zen/brain for LoadBalancer - intelligent capability analysis
      const { BrainCoordinator } = await import('@claude-zen/brain');'
      this.brainCoordinator = new BrainCoordinator(
          enabled: true,
          learningRate: 0.1,
          adaptationThreshold: 0.7,,);
      await this.brainCoordinator.initialize();

      // Lazy load @claude-zen/foundation for performance tracking
      const { PerformanceTracker, TelemetryManager } = await import(
        '@claude-zen/foundation''
      );
      this.performanceTracker = new PerformanceTracker();
      this.telemetryManager = new TelemetryManager({
        serviceName: 'capability-management',
        enableTracing: true,
        enableMetrics: true,
      });
      await this.telemetryManager.initialize();

      // Lazy load @claude-zen/workflows for capability development workflows
      const { WorkflowEngine } = await import('@claude-zen/workflows');'
      this.workflowEngine = new WorkflowEngine(
        maxConcurrentWorkflows: 5,
        enableVisualization: true,);
      await this.workflowEngine.initialize();

      // Lazy load @claude-zen/agui for investment approval workflows
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

      // Lazy load @claude-zen/brain for LoadBalancer - resource optimization
      const { LoadBalancer } = await import('@claude-zen/brain');'
      this.loadBalancer = new LoadBalancer(
        strategy: 'intelligent_distribution',
        enablePredictiveScaling: true,);
      await this.loadBalancer.initialize();

      this.initialized = true;
      this.logger.info(
        'Capability Management Service initialized successfully''
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize Capability Management Service:',
        error
      );
      throw error;
    }
  }

  /**
   * Add architecture capability with AI-powered maturity assessment
   */
  async addCapability(
    capability: Omit<
      ArchitectureCapability,|id|createdAt|updatedAt|businessValue|technicalComplexity|investmentPlan|roadmap|'metrics''
    >
  ): Promise<ArchitectureCapability> {
    if (!this.initialized) await this.initialize();

    const _timer = this.performanceTracker.startTimer('add_capability');'

    try {
      this.logger.info('Adding architecture capability with AI analysis', {'
        name: capability.name,
      });

      // Use brain coordinator for maturity assessment and analysis
      const capabilityAnalysis = await this.brainCoordinator.analyzeCapability({
        capability,
        existingCapabilities: Array.from(this.capabilities.values()),
        context: {
          category: capability.category,
          enablers: capability.enablers,
          dependencies: capability.dependencies,
        },
      });

      // Calculate business value assessment
      const businessValue = this.calculateBusinessValue(
        capability,
        capabilityAnalysis
      );

      // Calculate technical complexity assessment
      const technicalComplexity = this.calculateTechnicalComplexity(
        capability,
        capabilityAnalysis
      );

      // Generate investment plan
      const investmentPlan = this.generateInvestmentPlan(
        capability,
        businessValue,
        technicalComplexity
      );

      // Generate capability roadmap
      const roadmap = this.generateCapabilityRoadmap(
        capability,
        capabilityAnalysis
      );

      // Generate capability metrics
      const metrics = this.generateCapabilityMetrics(
        capability,
        capabilityAnalysis
      );

      // Create capability with AI-enhanced data
      const newCapability: ArchitectureCapability = {
        id: `capability-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,`
        businessValue,
        technicalComplexity,
        investmentPlan,
        roadmap,
        metrics,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...capability,
      };

      // Check if investment requires approval
      if (investmentPlan.totalInvestment > 50000) {
        // $50K threshold
        const approval = await this.requestInvestmentApproval(newCapability);
        if (!approval.approved) {
          throw new Error(
            `Capability investment approval rejected: ${approval.reason}``
          );
        }
      }

      // Store capability
      this.capabilities.set(newCapability.id, newCapability);
      this.roadmaps.set(roadmap.roadmapId, roadmap);

      this.performanceTracker.endTimer('add_capability');'
      this.telemetryManager.recordCounter('capabilities_added', 1);'

      this.logger.info('Architecture capability added successfully', {'
        capabilityId: newCapability.id,
        name: newCapability.name,
        category: newCapability.category,
        maturityLevel: newCapability.maturityLevel,
        businessValue: newCapability.businessValue.overallValue,
      });

      return newCapability;
    } catch (error) {
      this.performanceTracker.endTimer('add_capability');'
      this.logger.error('Failed to add architecture capability:', error);'
      throw error;
    }
  }

  /**
   * Update capability status with workflow automation
   */
  async updateCapabilityStatus(
    capabilityId: string,
    newStatus: CapabilityStatus,
    context?: any
  ): Promise<ArchitectureCapability> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer(
      'update_capability_status''
    );

    try {
      const capability = this.capabilities.get(capabilityId);
      if (!capability) {
        throw new Error(`Architecture capability not found: ${capabilityId}`);`
      }

      // Use workflow engine for status transition validation
      const statusTransition =
        await this.workflowEngine.validateStatusTransition({
          fromStatus: capability.status,
          toStatus: newStatus,
          context: { capability, ...context },
        });

      if (!statusTransition.isValid) {
        throw new Error(
          `Invalid status transition: $statusTransition.reason``
        );
      }

      // Update capability with new status
      const updatedCapability: ArchitectureCapability = {
        ...capability,
        status: newStatus,
        updatedAt: new Date(),
      };

      this.capabilities.set(capabilityId, updatedCapability);

      this.performanceTracker.endTimer('update_capability_status');'
      this.telemetryManager.recordCounter('capability_status_updates', 1);'

      this.logger.info('Capability status updated', '
        capabilityId,
        oldStatus: capability.status,
        newStatus,
        name: capability.name,);

      return updatedCapability;
    } catch (error) 
      this.performanceTracker.endTimer('update_capability_status');'
      this.logger.error('Failed to update capability status:', error);'
      throw error;
  }

  /**
   * Generate capability analytics dashboard with AI insights
   */
  async getCapabilityDashboard(): Promise<CapabilityDashboard> {
    if (!this.initialized) await this.initialize();

    const _timer = this.performanceTracker.startTimer(
      'generate_capability_dashboard');'

    try {
      const allCapabilities = Array.from(this.capabilities.values())();

      // Use brain coordinator for intelligent dashboard insights
      const dashboardInsights =
        await this.brainCoordinator.generateCapabilityDashboardInsights({
          capabilities: allCapabilities,
          config: this.config,
        });

      const dashboard: CapabilityDashboard = {
        totalCapabilities: allCapabilities.length,
        capabilitiesByCategory:
          this.groupCapabilitiesByCategory(allCapabilities),
        capabilitiesByStatus: this.groupCapabilitiesByStatus(allCapabilities),
        capabilitiesByMaturity:
          this.groupCapabilitiesByMaturity(allCapabilities),
        averageMaturityLevel: this.calculateAverageMaturity(allCapabilities),
        totalInvestment: this.calculateTotalInvestment(allCapabilities),
        portfolioROI: this.calculatePortfolioROI(allCapabilities),
        topPerformingCapabilities: allCapabilities
          .sort(
            (a, b) =>
              b.businessValue.overallValue - a.businessValue.overallValue
          )
          .slice(0, 10),
        investmentAllocation: dashboardInsights.investmentAllocation || [],
        maturityTrends: dashboardInsights.maturityTrends || [],
        riskExposure: dashboardInsights.riskExposure || [],
      };

      this.performanceTracker.endTimer('generate_capability_dashboard');'

      this.logger.info('Capability dashboard generated', '
        totalCapabilities: dashboard.totalCapabilities,
        averageMaturity: dashboard.averageMaturityLevel,
        portfolioROI: dashboard.portfolioROI,);

      return dashboard;
    } catch (error) {
      this.performanceTracker.endTimer('generate_capability_dashboard');'
      this.logger.error('Failed to generate capability dashboard:', error);'
      throw error;
    }
  }

  /**
   * Get all architecture capabilities
   */
  getAllCapabilities(): ArchitectureCapability[] 
    return Array.from(this.capabilities.values())();

  /**
   * Get architecture capability by ID
   */
  getCapability(capabilityId: string): ArchitectureCapability | undefined 
    return this.capabilities.get(capabilityId);

  /**
   * Shutdown service gracefully
   */
  async shutdown(): Promise<void> 
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
    this.logger.info('Capability Management Service shutdown complete');'

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async requestInvestmentApproval(
    capability: ArchitectureCapability
  ): Promise<any> 
    try {
      const approval = await this.aguiService.createApprovalTask({
        taskType: 'capability_investment_approval',
        description: `High-value capability investment requires approval: ${capability.name}`,`
        context: { capability },
        approvers: ['enterprise-architect', 'cto', 'finance-director'],
        timeout: 3600000, // 60 minutes
      });

      return approval;
    } catch (error) {
      this.logger.error(
        'Capability investment approval request failed:',
        error
      );
      return { approved: false, reason: 'approval_system_error'};'
    }

  private calculateBusinessValue(
    capability: any,
    analysis: any
  ): BusinessValueAssessment {
    // AI-enhanced business value calculation
    const strategicAlignment =
      analysis.businessValue?.strategicAlignment || this.assessStrategicAlignment(capability);
    const revenueImpact =
      analysis.businessValue?.revenueImpact || this.assessRevenueImpact(capability);
    const costReduction =
      analysis.businessValue?.costReduction || this.assessCostReduction(capability);
    const riskMitigation =
      analysis.businessValue?.riskMitigation || this.assessRiskMitigation(capability);
    const marketAdvantage =
      analysis.businessValue?.marketAdvantage || this.assessMarketAdvantage(capability);
    const customerSatisfaction =
      analysis.businessValue?.customerSatisfaction || this.assessCustomerSatisfaction(capability);

    const overallValue =
      (strategicAlignment +
        revenueImpact +
        costReduction +
        riskMitigation +
        marketAdvantage +
        customerSatisfaction) /
      6;

    return {
      strategicAlignment,
      revenueImpact,
      costReduction,
      riskMitigation,
      marketAdvantage,
      customerSatisfaction,
      overallValue,
      confidence: analysis.businessValue?.confidence || 0.7,
      lastAssessed: new Date(),
    };
  }

  private calculateTechnicalComplexity(
    capability: any,
    analysis: any
  ): TechnicalComplexityAssessment {
    // AI-enhanced technical complexity calculation
    const architecturalComplexity =
      analysis.technicalComplexity?.architecturalComplexity || this.assessArchitecturalComplexity(capability);
    const integrationComplexity =
      analysis.technicalComplexity?.integrationComplexity || this.assessIntegrationComplexity(capability);
    const dataComplexity =
      analysis.technicalComplexity?.dataComplexity || this.assessDataComplexity(capability);
    const securityComplexity =
      analysis.technicalComplexity?.securityComplexity || this.assessSecurityComplexity(capability);
    const scalabilityRequirements =
      analysis.technicalComplexity?.scalabilityRequirements || this.assessScalabilityRequirements(capability);
    const maintenanceOverhead =
      analysis.technicalComplexity?.maintenanceOverhead || this.assessMaintenanceOverhead(capability);

    const overallComplexity =
      (architecturalComplexity +
        integrationComplexity +
        dataComplexity +
        securityComplexity +
        scalabilityRequirements +
        maintenanceOverhead) /
      6;

    return {
      architecturalComplexity,
      integrationComplexity,
      dataComplexity,
      securityComplexity,
      scalabilityRequirements,
      maintenanceOverhead,
      overallComplexity,
      confidence: analysis.technicalComplexity?.confidence || 0.7,
      lastAssessed: new Date(),
    };
  }

  private generateInvestmentPlan(
    capability: any,
    businessValue: BusinessValueAssessment,
    technicalComplexity: TechnicalComplexityAssessment
  ): InvestmentPlan {
    // Generate investment phases based on complexity and value
    const phases: InvestmentPhase[] = [
      {
        phaseId:'assessment-phase',
        name: 'Assessment & Planning',
        description: 'Detailed assessment and planning phase',
        investment: 25000,
        duration: 30,
        expectedOutcomes: [
          'Detailed requirements',
          'Architecture design',
          'Implementation plan',
        ],
        successCriteria: [
          'Stakeholder approval',
          'Technical feasibility confirmed',
        ],
        risks: ['Requirements changes', 'Technical challenges'],
      },
      {
        phaseId: 'development-phase',
        name: 'Development & Implementation',
        description: 'Core capability development and implementation',
        investment: 150000,
        duration: 180,
        expectedOutcomes: [
          'Working capability',
          'Integration complete',
          'Testing complete',
        ],
        successCriteria: ['Performance targets met', 'Quality gates passed'],
        risks: ['Integration issues', 'Performance problems'],
      },
      {
        phaseId: 'deployment-phase',
        name: 'Deployment & Optimization',
        description: 'Production deployment and optimization',
        investment: 50000,
        duration: 60,
        expectedOutcomes: [
          'Production deployment',
          'Performance optimization',
          'User training',
        ],
        successCriteria: ['Production stability', 'User adoption targets met'],
        risks: ['Production issues', 'User adoption challenges'],
      },
    ];

    const totalInvestment = phases.reduce(
      (sum, phase) => sum + phase.investment,
      0
    );

    const timeline: InvestmentTimeline = {
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Start in 30 days
      endDate: new Date(
        Date.now() + (30 + 180 + 60 + 30) * 24 * 60 * 60 * 1000
      ), // Total duration + buffer
      milestones: [
        {
          milestoneId: 'planning-complete',
          name: 'Planning Complete',
          description: 'Assessment and planning phase completed',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          deliverables: ['Technical architecture', 'Implementation plan'],
          successMetrics: ['Stakeholder sign-off', 'Budget approval'],
        },
      ],
      dependencies: [],
    };

    const roi: ROIProjection = {
      method: 'net_present_value',
      timeHorizon: this.config.defaultInvestmentHorizon,
      discountRate: 8, // 8% discount rate
      expectedROI: businessValue.overallValue * 20, // Simplified calculation
      confidenceInterval: [
        businessValue.overallValue * 15,
        businessValue.overallValue * 25,
      ],
      breakEvenPoint: 18, // 18 months
      assumptions: [
        'Market conditions remain stable',
        'Technology adoption proceeds as planned',
      ],
    };

    const riskAssessment: InvestmentRiskAssessment = {
      risks: [],
      overallRiskScore: technicalComplexity.overallComplexity,
      riskMitigation: [
        'Regular progress reviews',
        'Technical advisory board',
        'Phased delivery approach',
      ],
      contingencyPlan: 'Scale back scope if budget constraints arise',
      monitoringPlan: [
        'Monthly progress reviews',
        'Quarterly ROI assessment',
        'Risk register updates',
      ],
    };

    return {
      planId: `investment-plan-${Date.now()}`,`
      phases,
      totalInvestment,
      timeline,
      roi,
      riskAssessment,
      approvals: [],
    };
  }

  private generateCapabilityRoadmap(
    capability: any,
    analysis: any
  ): CapabilityRoadmap {
    // Generate AI-powered roadmap
    const initiatives: CapabilityInitiative[] = analysis.roadmap
      ?.initiatives || [
      {
        initiativeId:'init-1',
        name: 'Foundation Development',
        description: 'Build foundational capability components',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        investment: 100000,
        expectedBenefits: [
          'Core functionality established',
          'Base infrastructure in place',
        ],
        deliverables: ['Core components', 'Basic integration'],
        owner: capability.owner,
        status: 'planned',
      },
    ];

    return {
      roadmapId: `roadmap-${Date.now()}`,`
      timeHorizon: this.config.defaultInvestmentHorizon,
      initiatives,
      dependencies: [],
      riskFactors: [],
      assumptionsAndConstraints: [
        'Budget approval obtained',
        'Resources available as planned',
      ],
      lastUpdated: new Date(),
    };
  }

  private generateCapabilityMetrics(
    capability: any,
    analysis: any
  ): CapabilityMetric[] {
    const baseMetrics: CapabilityMetric[] = [
      {
        metricId: 'adoption-rate',
        name: 'Adoption Rate',
        description:
          'Percentage of intended users actively using the capability',
        type: 'adoption',
        currentValue: 0,
        targetValue: 80,
        unit: 'percentage',
        trend: 'stable',
        lastMeasured: new Date(),
      },
      {
        metricId: 'performance-score',
        name: 'Performance Score',
        description: 'Overall performance score based on key metrics',
        type: 'performance',
        currentValue: 0,
        targetValue: 85,
        unit: 'score',
        trend: 'stable',
        lastMeasured: new Date(),
      },
    ];

    // Add category-specific metrics
    if (capability.category === 'technology_capability') {'
      baseMetrics.push(
        metricId: 'availability',
        name: 'System Availability',
        description: 'Percentage uptime of the technology capability',
        type: 'quality',
        currentValue: 0,
        targetValue: 99.9,
        unit: 'percentage',
        trend: 'stable',
        benchmarkValue: 99.5,
        lastMeasured: new Date(),);
    }

    return baseMetrics;
  }

  // Assessment helper methods
  private assessStrategicAlignment(capability: any): number {
    // Strategic alignment based on category and description
    const categoryWeights: Record<CapabilityCategory, number> = {
      business_capability: 9,
      technology_capability: 7,
      process_capability: 6,
      data_capability: 8,
      security_capability: 8,
      integration_capability: 7,
      platform_capability: 7,
      infrastructure_capability: 6,
      governance_capability: 5,
      innovation_capability: 9,
    };
    return categoryWeights[capability.category] || 5;
  }

  private assessRevenueImpact(capability: any): number 
    // Revenue impact based on category
    return capability.category ==='business_capability''
      ? 8
      : capability.category === 'innovation_capability''
        ? 7
        : 4;

  private assessCostReduction(capability: any): number 
    // Cost reduction potential
    return capability.category === 'process_capability''
      ? 8
      : capability.category === 'technology_capability''
        ? 6
        : 3;

  private assessRiskMitigation(capability: any): number 
    // Risk mitigation value
    return capability.category === 'security_capability''
      ? 9
      : capability.category === 'governance_capability''
        ? 7
        : 4;

  private assessMarketAdvantage(capability: any): number 
    // Market advantage potential
    return capability.category === 'innovation_capability''
      ? 9
      : capability.category === 'business_capability''
        ? 7
        : 3;

  private assessCustomerSatisfaction(capability: any): number 
    // Customer satisfaction impact
    return capability.category === 'business_capability'? 8 : 5;'

  private assessArchitecturalComplexity(capability: any): number {
    // Complexity based on dependencies and enablers
    const dependencyCount = capability.dependencies?.length || 0;
    const enablerCount = capability.enablers?.length || 0;
    return Math.min(10, Math.max(1, (dependencyCount + enablerCount) / 2));
  }

  private assessIntegrationComplexity(capability: any): number 
    return capability.category ==='integration_capability' ? 8 : 4;'

  private assessDataComplexity(capability: any): number 
    return capability.category === 'data_capability' ? 7 : 3;'

  private assessSecurityComplexity(capability: any): number 
    return capability.category === 'security_capability' ? 8 : 4;'

  private assessScalabilityRequirements(capability: any): number 
    return capability.category === 'platform_capability' ? 8 : 5;'

  private assessMaintenanceOverhead(capability: any): number 
    return capability.category === 'infrastructure_capability' ? 7 : 4;'

  // Analytics helper methods
  private groupCapabilitiesByCategory(
    capabilities: ArchitectureCapability[]
  ): Record<CapabilityCategory, number> 
    return capabilities.reduce(
      (groups, capability) => {
        groups[capability.category] = (groups[capability.category] || 0) + 1;
        return groups;
      },
      {} as Record<CapabilityCategory, number>
    );

  private groupCapabilitiesByStatus(
    capabilities: ArchitectureCapability[]
  ): Record<CapabilityStatus, number> 
    return capabilities.reduce(
      (groups, capability) => {
        groups[capability.status] = (groups[capability.status] || 0) + 1;
        return groups;
      },
      {} as Record<CapabilityStatus, number>
    );

  private groupCapabilitiesByMaturity(
    capabilities: ArchitectureCapability[]
  ): Record<number, number> 
    return capabilities.reduce(
      (groups, capability) => {
        groups[capability.maturityLevel] =
          (groups[capability.maturityLevel] || 0) + 1;
        return groups;
      },
      {} as Record<number, number>
    );

  private calculateAverageMaturity(
    capabilities: ArchitectureCapability[]
  ): number {
    if (capabilities.length === 0) return 0;
    const totalMaturity = capabilities.reduce(
      (sum, capability) => sum + capability.maturityLevel,
      0
    );
    return totalMaturity / capabilities.length;
  }

  private calculateTotalInvestment(
    capabilities: ArchitectureCapability[]
  ): number 
    return capabilities.reduce(
      (total, capability) => total + capability.investmentPlan.totalInvestment,
      0
    );

  private calculatePortfolioROI(
    capabilities: ArchitectureCapability[]
  ): number {
    if (capabilities.length === 0) return 0;
    const totalROI = capabilities.reduce(
      (sum, capability) => sum + capability.investmentPlan.roi.expectedROI,
      0
    );
    return totalROI / capabilities.length;
  }
}

export default CapabilityManagementService;
