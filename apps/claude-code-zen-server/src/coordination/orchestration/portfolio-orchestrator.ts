/**
 * @file Portfolio Level Orchestrator - Phase 2, Day 8 (Tasks 7.1-7.3)
 *
 * Strategic-level orchestration for portfolio management with human-controlled PRD decomposition,
 * investment tracking, and strategic milestone management. Integrates with AGUI for business decisions.
 *
 * ARCHITECTURE:
 * - Strategic backlog management with OKR tracking
 * - Vision to PRD decomposition with parallel processing
 * - Portfolio resource allocation and governance
 * - Strategic decision tracking with ROI measurement
 * - Integration with WorkflowGatesManager for business gates
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import type { TypeSafeEventBus } from '@claude-zen/infrastructure';
import type { BrainCoordinator } from '@claude-zen/intelligence';

import type {
  BusinessCase,
  FlowMetrics,
  PortfolioItem,
  PortfolioItemStatus,
  PortfolioMetrics,
  PortfolioPriority,
  PortfolioTimeline,
  ResourceRequirements,
  WorkflowStream
} from "./multi-level-types";
import { WorkflowGatesManager } from "./workflow-gates";

// ============================================================================
// PORTFOLIO ORCHESTRATOR CONFIGURATION
// ============================================================================

/**
 * Portfolio orchestrator configuration
 */
export interface PortfolioOrchestratorConfig {
  readonly enableInvestmentTracking: boolean;
  readonly enableOKRIntegration: boolean;
  readonly enableStrategicReporting: boolean;
  readonly enableAutoDecomposition: boolean;
  readonly maxConcurrentPRDs: number;
  readonly investmentApprovalThreshold: number; // Amount requiring approval
  readonly strategicReviewInterval: number; // milliseconds
  readonly portfolioHealthCheckInterval: number; // milliseconds
}

/**
 * Strategic backlog configuration
 */
export interface StrategicBacklogConfig {
  readonly maxBacklogSize: number;
  readonly prioritizationCriteria: PrioritizationCriterion[];
  readonly autoRanking: boolean;
  readonly strategicThemes: StrategicTheme[];
}

/**
 * Prioritization criteria
 */
export interface PrioritizationCriterion {
  readonly name: string;
  readonly weight: number; // 0-1
  readonly description: string;
  readonly evaluator: (item: PortfolioItem) => number;
}

/**
 * Strategic themes for portfolio alignment
 */
export interface StrategicTheme {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly objectives: string[];
  readonly keyMetrics: string[];
  readonly priority: PortfolioPriority;
  readonly timeline: { start: Date; end: Date };
  readonly budget: number;
  readonly owner: string;
}

/**
 * OKR (Objectives and Key Results) integration
 */
export interface OKRIntegration {
  readonly objective: string;
  readonly keyResults: KeyResult[];
  readonly quarter: string;
  readonly owner: string;
  readonly progress: number; // 0-1
  readonly lastUpdated: Date;
}

/**
 * Key result tracking
 */
export interface KeyResult {
  readonly description: string;
  readonly target: number;
  readonly current: number;
  readonly unit: string;
  readonly confidence: number; // 0-1
  readonly lastUpdated: Date;
}

/**
 * Portfolio health indicators
 */
export interface PortfolioHealth {
  readonly overallScore: number; // 0-100
  readonly strategicAlignment: number;
  readonly resourceUtilization: number;
  readonly deliveryHealth: number;
  readonly riskScore: number;
  readonly innovation: number;
  readonly lastUpdated: Date;
  readonly recommendations: HealthRecommendation[];
}

/**
 * Health recommendations
 */
export interface HealthRecommendation {
  readonly type: 'strategic' | 'resource' | 'risk' | 'delivery';
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly actionItems: string[];
  readonly expectedImpact: number;
  readonly effort: number;
}

/**
 * Investment tracking
 */
export interface InvestmentTracking {
  readonly totalBudget: number;
  readonly allocatedBudget: number;
  readonly spentBudget: number;
  readonly forecastSpend: number;
  readonly roi: ROIMetrics;
  readonly investments: Investment[];
}

/**
 * ROI metrics
 */
export interface ROIMetrics {
  readonly currentROI: number;
  readonly projectedROI: number;
  readonly paybackPeriod: number; // months
  readonly netPresentValue: number;
  readonly riskAdjustedROI: number;
}

/**
 * Individual investment
 */
export interface Investment {
  readonly id: string;
  readonly portfolioItemId: string;
  readonly amount: number;
  readonly category: 'development' | 'infrastructure' | 'research' | 'marketing';
  readonly approvalStatus: 'pending' | 'approved' | 'rejected';
  readonly approvedBy?: string;
  readonly approvalDate?: Date;
  readonly actualSpend: number;
  readonly roi: number;
}

// ============================================================================
// PORTFOLIO ORCHESTRATOR STATE
// ============================================================================

/**
 * Portfolio orchestrator state
 */
export interface PortfolioOrchestratorState {
  readonly portfolioItems: Map<string, PortfolioItem>;
  readonly strategicBacklog: PortfolioItem[];
  readonly activeStreams: Map<string, WorkflowStream<PortfolioItem>>;
  readonly strategicThemes: StrategicTheme[];
  readonly okrIntegration: OKRIntegration[];
  readonly investmentTracking: InvestmentTracking;
  readonly portfolioHealth: PortfolioHealth;
  readonly flowMetrics: FlowMetrics;
  readonly lastUpdated: Date;
}

// ============================================================================
// PORTFOLIO ORCHESTRATOR - Main Implementation
// ============================================================================

/**
 * Portfolio Level Orchestrator - Strategic orchestration for portfolio management
 */
export class PortfolioOrchestrator extends TypedEventBase {
  private readonly logger: Logger;
  private readonly eventBus: TypeSafeEventBus;
  private readonly memory: BrainCoordinator;
  private readonly gatesManager: WorkflowGatesManager;
  private readonly settings: PortfolioOrchestratorConfig;
  private state: PortfolioOrchestratorState;
  private strategicReviewTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(
    eventBus: TypeSafeEventBus,
    memory: BrainCoordinator,
    gatesManager: WorkflowGatesManager,
    config: Partial<PortfolioOrchestratorConfig> = {}
  ) {
    super();
    this.logger = getLogger('portfolio-orchestrator');
    this.eventBus = eventBus;
    this.memory = memory;
    this.gatesManager = gatesManager;
    this.settings = {
      enableInvestmentTracking: true,
      enableOKRIntegration: true,
      enableStrategicReporting: true,
      enableAutoDecomposition: false, // Human-controlled by default
      maxConcurrentPRDs: 5,
      investmentApprovalThreshold: 100000, // $100k
      strategicReviewInterval: 604800000, // 1 week
      portfolioHealthCheckInterval: 86400000, // 1 day
      ...config,
    };
    this.state = this.initializeState();
  }

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Initialize the portfolio orchestrator
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Portfolio Orchestrator', {
      config: this.settings,
    });

    try {
      // Load persisted state
      await this.loadPersistedState();

      // Initialize strategic themes if empty
      if (this.state.strategicThemes.length === 0) {
        await this.initializeDefaultStrategicThemes();
      }

      // Start background processes
      this.startStrategicReviewProcess();
      this.startPortfolioHealthMonitoring();

      // Register event handlers
      this.registerEventHandlers();

      this.logger.info('Portfolio Orchestrator initialized successfully');
      this.emit('initialized', { timestamp: new Date() });
    } catch (error) {
      this.logger.error('Failed to initialize portfolio orchestrator', {
        error,
      });
      throw error;
    }
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Portfolio Orchestrator');

    if (this.strategicReviewTimer) {
      clearInterval(this.strategicReviewTimer);
    }
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    await this.persistState();
    this.removeAllListeners();

    this.logger.info('Portfolio Orchestrator shutdown complete');
  }

  // ============================================================================
  // STRATEGIC BACKLOG MANAGEMENT - Task 7.1
  // ============================================================================

  /**
   * Add item to strategic backlog
   */
  async addToStrategicBacklog(
    title: string,
    businessCase: BusinessCase,
    resourceRequirements: ResourceRequirements,
    strategicThemeId?: string
  ): Promise<PortfolioItem> {
    const portfolioItem: PortfolioItem = {
      id: `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      type: 'prd',
      status: 'proposed' as PortfolioItemStatus,
      priority: this.calculateStrategicPriority(
        businessCase,
        resourceRequirements
      ),
      businessValue: businessCase.marketOpportunity,
      strategicAlignment: this.calculateStrategicAlignment(
        strategicThemeId,
        businessCase
      ),
      riskScore: this.calculateRiskScore(businessCase.risks),
      resourceRequirements,
      timeline: this.estimatePortfolioTimeline(resourceRequirements),
      stakeholders: ['product-director', 'business-stakeholder', 'cto'],
      dependencies: [],
      businessCase,
      gates: [],
      metrics: this.initializePortfolioMetrics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to state
    this.state.portfolioItems.set(portfolioItem.id, portfolioItem);
    this.state.strategicBacklog.push(portfolioItem);

    // Create investment gate if threshold exceeded
    if (
      resourceRequirements.budgetRequired >= this.settings.investmentApprovalThreshold
    ) {
      await this.createInvestmentDecisionGate(portfolioItem);
    }

    // Re-prioritize backlog
    await this.prioritizeStrategicBacklog();

    this.logger.info('Portfolio item added to strategic backlog', {
      id: portfolioItem.id,
      title,
      priority: portfolioItem.priority,
    });

    this.emit('portfolio-item-added', portfolioItem);
    return portfolioItem;
  }

  /**
   * Prioritize the strategic backlog
   */
  async prioritizeStrategicBacklog(): Promise<void> {
    const backlogConfig = await this.getStrategicBacklogConfig();

    // Sort by strategic value calculation
    this.state.strategicBacklog.sort((a, b) => {
      const scoreA = this.calculateStrategicScore(
        a,
        backlogConfig.prioritizationCriteria
      );
      const scoreB = this.calculateStrategicScore(
        b,
        backlogConfig.prioritizationCriteria
      );
      return scoreB - scoreA;
    });

    // Update state
    this.state.lastUpdated = new Date();
    await this.persistState();

    this.logger.debug('Strategic backlog prioritized', {
      backlogSize: this.state.strategicBacklog.length,
    });

    this.emit('backlog-prioritized', this.state.strategicBacklog);
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private initializeState(): PortfolioOrchestratorState {
    return {
      portfolioItems: new Map(),
      strategicBacklog: [],
      activeStreams: new Map(),
      strategicThemes: [],
      okrIntegration: [],
      investmentTracking: {
        totalBudget: 0,
        allocatedBudget: 0,
        spentBudget: 0,
        forecastSpend: 0,
        roi: {
          currentROI: 0,
          projectedROI: 0,
          paybackPeriod: 0,
          netPresentValue: 0,
          riskAdjustedROI: 0,
        },
        investments: [],
      },
      portfolioHealth: {
        overallScore: 0,
        strategicAlignment: 0,
        resourceUtilization: 0,
        deliveryHealth: 0,
        riskScore: 0,
        innovation: 0,
        lastUpdated: new Date(),
        recommendations: [],
      },
      flowMetrics: {
        throughput: 0,
        cycleTime: 0,
        leadTime: 0,
        wipUtilization: 0,
        bottlenecks: [],
        flowEfficiency: 0,
      },
      lastUpdated: new Date(),
    };
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = await this.memory.retrieve('portfolio-orchestrator:state');
      if (persistedState) {
        // Reconstruct Maps from serialized data
        this.state = {
          ...this.state,
          ...persistedState,
          portfolioItems: new Map(persistedState.portfolioItems || []),
          activeStreams: new Map(persistedState.activeStreams || []),
        };
        this.logger.info('Portfolio orchestrator state loaded');
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted state', { error });
    }
  }

  private async persistState(): Promise<void> {
    try {
      // Convert Maps to arrays for serialization
      const stateToSerialize = {
        ...this.state,
        portfolioItems: Array.from(this.state.portfolioItems.entries()),
        activeStreams: Array.from(this.state.activeStreams.entries()),
      };
      await this.memory.store('portfolio-orchestrator:state', stateToSerialize);
    } catch (error) {
      this.logger.error('Failed to persist state', { error });
    }
  }

  private startStrategicReviewProcess(): void {
    this.strategicReviewTimer = setInterval(async () => {
      try {
        await this.conductStrategicReview();
      } catch (error) {
        this.logger.error('Strategic review failed', { error });
      }
    }, this.settings.strategicReviewInterval);
  }

  private startPortfolioHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.calculatePortfolioHealth();
      } catch (error) {
        this.logger.error('Portfolio health check failed', { error });
      }
    }, this.settings.portfolioHealthCheckInterval);
  }

  private registerEventHandlers(): void {
    this.eventBus.registerHandler('gate-resolved', async (event) => {
      // Handle gate resolution events
      if (event.payload.decision === 'approved') {
        await this.handleGateApproval(event.payload.gateId);
      }
    });
  }

  // Placeholder implementations for complex calculations
  private calculateStrategicPriority(
    businessCase: BusinessCase,
    resources: ResourceRequirements
  ): PortfolioPriority {
    const value = businessCase.marketOpportunity;
    const cost = resources.budgetRequired;
    const ratio = value / cost;

    if (ratio > 5) return PortfolioPriority.STRATEGIC;
    if (ratio > 3) return PortfolioPriority.HIGH;
    if (ratio > 1) return PortfolioPriority.MEDIUM;
    return PortfolioPriority.LOW;
  }

  private calculateStrategicAlignment(
    strategicThemeId: string | undefined,
    businessCase: BusinessCase
  ): number {
    // Placeholder - would implement theme alignment calculation
    return strategicThemeId ? 0.8 : 0.5;
  }

  private calculateRiskScore(
    risks: Array<{ probability: number; impact: number }>
  ): number {
    // Placeholder - would implement comprehensive risk scoring
    return (
      risks.reduce((score, risk) => score + risk.probability * risk.impact, 0) *
      100
    );
  }

  private estimatePortfolioTimeline(
    requirements: ResourceRequirements
  ): PortfolioTimeline {
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + requirements.developmentHours * 3600000
    );

    return {
      startDate,
      endDate,
      milestones: [], // Would be generated based on requirements
      phases: [], // Would be generated based on project type
    };
  }

  private initializePortfolioMetrics(): PortfolioMetrics {
    return {
      roi: 0,
      timeToMarket: 0,
      customerSatisfaction: 0,
      marketShare: 0,
      revenueImpact: 0,
      costSavings: 0,
    };
  }

  // Additional placeholder methods
  private async getStrategicBacklogConfig(): Promise<StrategicBacklogConfig> {
    return {
      maxBacklogSize: 50,
      prioritizationCriteria: [],
      autoRanking: true,
      strategicThemes: this.state.strategicThemes,
    };
  }

  private calculateStrategicScore(
    item: PortfolioItem,
    criteria: PrioritizationCriterion[]
  ): number {
    return (
      item.businessValue * item.strategicAlignment * (1 - item.riskScore / 100)
    );
  }

  private async initializeDefaultStrategicThemes(): Promise<void> {
    // Placeholder - would create default themes
  }

  private async createInvestmentDecisionGate(
    portfolioItem: PortfolioItem
  ): Promise<void> {
    // Would create investment approval gate
  }

  private async calculatePortfolioHealth(): Promise<PortfolioHealth> {
    // Placeholder implementation
    return this.state.portfolioHealth;
  }

  private async conductStrategicReview(): Promise<void> {
    // Placeholder - would conduct periodic strategic review
  }

  private async handleGateApproval(gateId: string): Promise<void> {
    // Handle approved gates - move items forward in workflow
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

/**
 * Portfolio report interface
 */
export interface PortfolioReport {
  readonly generatedAt: Date;
  readonly timeRange?: { start: Date; end: Date };
  readonly health: PortfolioHealth;
  readonly metrics: any;
  readonly investmentSummary: InvestmentTracking;
  readonly okrProgress: OKRIntegration[];
  readonly keyInsights: string[];
  readonly recommendations: string[];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PortfolioOrchestrator;

export type {
  PortfolioOrchestratorConfig,
  StrategicBacklogConfig,
  StrategicTheme,
  OKRIntegration,
  KeyResult,
  PortfolioHealth,
  HealthRecommendation,
  InvestmentTracking,
  ROIMetrics,
  Investment,
  PortfolioOrchestratorState,
  PortfolioReport,
};