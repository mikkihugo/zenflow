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
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { BusinessCase, FlowMetrics, PortfolioItem, PortfolioItemStatus, PortfolioPriority, ResourceRequirements, WorkflowStream } from './multi-level-types.ts';
import type { WorkflowGatesManager } from './workflow-gates.ts';
/**
 * Portfolio orchestrator configuration
 */
export interface PortfolioOrchestratorConfig {
    readonly enableInvestmentTracking: boolean;
    readonly enableOKRIntegration: boolean;
    readonly enableStrategicReporting: boolean;
    readonly enableAutoDecomposition: boolean;
    readonly maxConcurrentPRDs: number;
    readonly investmentApprovalThreshold: number;
    readonly strategicReviewInterval: number;
    readonly portfolioHealthCheckInterval: number;
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
    readonly weight: number;
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
    readonly timeline: {
        start: Date;
        end: Date;
    };
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
    readonly progress: number;
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
    readonly confidence: number;
    readonly lastUpdated: Date;
}
/**
 * Portfolio health indicators
 */
export interface PortfolioHealth {
    readonly overallScore: number;
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
    readonly paybackPeriod: number;
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
/**
 * Portfolio Level Orchestrator - Strategic orchestration for portfolio management
 */
export declare class PortfolioOrchestrator extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly config;
    private state;
    private strategicReviewTimer?;
    private healthCheckTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, config?: Partial<PortfolioOrchestratorConfig>);
    /**
     * Initialize the portfolio orchestrator
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the orchestrator
     */
    shutdown(): Promise<void>;
    /**
     * Add item to strategic backlog
     */
    addToStrategicBacklog(title: string, businessCase: BusinessCase, resourceRequirements: ResourceRequirements, strategicThemeId?: string): Promise<PortfolioItem>;
    /**
     * Prioritize the strategic backlog
     */
    prioritizeStrategicBacklog(): Promise<void>;
    /**
     * Get strategic backlog with filtering
     */
    getStrategicBacklog(filters?: {
        status?: PortfolioItemStatus[];
        priority?: PortfolioPriority[];
        strategicTheme?: string;
    }): Promise<PortfolioItem[]>;
    /**
     * Track OKR integration
     */
    updateOKRProgress(objective: string, keyResultUpdates: Array<{
        description: string;
        current: number;
        confidence: number;
    }>): Promise<void>;
    /**
     * Decompose vision to PRDs with parallel processing
     */
    decomposeVisionToPRDs(visionId: string, visionDescription: string, strategicContext: {
        themes: string[];
        objectives: string[];
        constraints: string[];
    }): Promise<PortfolioItem[]>;
    /**
     * Create portfolio workflow stream
     */
    createPortfolioWorkflowStream(portfolioItem: PortfolioItem): Promise<string>;
    /**
     * Implement resource allocation across portfolio
     */
    allocatePortfolioResources(): Promise<void>;
    /**
     * Track strategic milestones
     */
    trackStrategicMilestones(): Promise<void>;
    /**
     * Monitor portfolio health
     */
    calculatePortfolioHealth(): Promise<PortfolioHealth>;
    /**
     * Track strategic decisions and their outcomes
     */
    trackStrategicDecision(gateId: string, decision: 'approved' | 'rejected' | 'deferred', rationale: string, expectedOutcomes: string[], decisionMaker: string): Promise<void>;
    /**
     * Generate portfolio performance report
     */
    generatePortfolioReport(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<PortfolioReport>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private startStrategicReviewProcess;
    private startPortfolioHealthMonitoring;
    private registerEventHandlers;
    private calculateStrategicPriority;
    private calculateStrategicAlignment;
    private calculateRiskScore;
    private estimatePortfolioTimeline;
    private initializePortfolioMetrics;
    private getStrategicBacklogConfig;
    private calculateStrategicScore;
    private getItemStrategicTheme;
    private initializeDefaultStrategicThemes;
    private createInvestmentDecisionGate;
    private createVisionDecompositionGate;
    private generatePRDConcepts;
    private calculateAvailableResources;
    private allocateResourcesToItem;
    private updatePortfolioItemStatus;
    private evaluateMilestoneCriteria;
    private createMilestoneReviewGate;
    private calculateStrategicAlignmentScore;
    private calculateResourceUtilizationScore;
    private calculateDeliveryHealthScore;
    private calculateOverallRiskScore;
    private calculateInnovationScore;
    private generateHealthRecommendations;
    private calculateDecisionImpact;
    private calculatePortfolioMetrics;
    private generateKeyInsights;
    private generateStrategicRecommendations;
    private conductStrategicReview;
    private handleGateApproval;
}
/**
 * Portfolio report interface
 */
export interface PortfolioReport {
    readonly generatedAt: Date;
    readonly timeRange?: {
        start: Date;
        end: Date;
    };
    readonly health: PortfolioHealth;
    readonly metrics: any;
    readonly investmentSummary: InvestmentTracking;
    readonly okrProgress: OKRIntegration[];
    readonly keyInsights: string[];
    readonly recommendations: string[];
}
export default PortfolioOrchestrator;
export type { PortfolioOrchestratorConfig, StrategicBacklogConfig, StrategicTheme, OKRIntegration, KeyResult, PortfolioHealth, HealthRecommendation, InvestmentTracking, ROIMetrics, Investment, PortfolioOrchestratorState, PortfolioReport, };
//# sourceMappingURL=portfolio-orchestrator.d.ts.map