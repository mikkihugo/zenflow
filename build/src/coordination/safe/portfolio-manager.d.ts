/**
 * @file Portfolio Manager - Phase 3, Day 15 (Task 14.1-14.3)
 *
 * Implements SAFe Lean Portfolio Management with portfolio budget allocation,
 * strategic theme tracking, epic investment planning, value stream funding,
 * and Lean-Agile budgeting with cost center integration.
 *
 * ARCHITECTURE:
 * - Portfolio budget planning and allocation
 * - Strategic theme definition and tracking
 * - Epic investment analysis and prioritization
 * - Value stream funding allocation
 * - Lean-Agile budget governance
 * - Cost center integration and tracking
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { PortfolioOrchestrator } from '../orchestration/portfolio-orchestrator.ts';
import type { ValueStreamMapper } from './value-stream-mapper.ts';
import type { ProgramIncrementManager } from './program-increment-manager.ts';
import type { Epic, Portfolio, StrategicTheme, ValueStream } from './index.ts';
/**
 * Portfolio Manager configuration
 */
export interface PortfolioManagerConfig {
    readonly enableBudgetTracking: boolean;
    readonly enableStrategicThemeTracking: boolean;
    readonly enableEpicInvestmentAnalysis: boolean;
    readonly enableValueStreamFunding: boolean;
    readonly enableLeanAgileBudgeting: boolean;
    readonly enableAGUIIntegration: boolean;
    readonly budgetPlanningCycle: 'quarterly' | 'annually' | 'continuous';
    readonly investmentAnalysisInterval: number;
    readonly budgetTrackingInterval: number;
    readonly portfolioReviewInterval: number;
    readonly maxEpicsInPortfolio: number;
    readonly maxValueStreamsPerPortfolio: number;
    readonly budgetThresholdAlertPercentage: number;
    readonly investmentApprovalThreshold: number;
}
/**
 * Portfolio budget configuration
 */
export interface PortfolioBudgetConfig {
    readonly portfolioId: string;
    readonly budgetCycle: BudgetCycle;
    readonly totalBudget: number;
    readonly allocations: BudgetAllocation[];
    readonly reserves: BudgetReserve[];
    readonly costCenters: CostCenter[];
    readonly approvalWorkflow: BudgetApprovalWorkflow;
    readonly trackingConfiguration: BudgetTrackingConfig;
}
/**
 * Budget cycle definition
 */
export interface BudgetCycle {
    readonly cycleId: string;
    readonly type: 'quarterly' | 'annual' | 'continuous';
    readonly startDate: Date;
    readonly endDate: Date;
    readonly planningPhases: BudgetPlanningPhase[];
    readonly reviewMilestones: BudgetReviewMilestone[];
}
/**
 * Budget planning phase
 */
export interface BudgetPlanningPhase {
    readonly phaseId: string;
    readonly name: string;
    readonly description: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly activities: string[];
    readonly deliverables: string[];
    readonly participants: string[];
    readonly aguiGateRequired: boolean;
}
/**
 * Budget allocation
 */
export interface BudgetAllocation {
    readonly allocationId: string;
    readonly name: string;
    readonly type: 'epic' | 'value-stream' | 'enabler' | 'operational' | 'innovation';
    readonly allocatedAmount: number;
    readonly spentAmount: number;
    readonly commitmentLevel: 'committed' | 'uncommitted' | 'exploration';
    readonly priority: number;
    readonly strategicAlignment: StrategicAlignment;
    readonly valueStreamId?: string;
    readonly epicIds?: string[];
    readonly costCenterId?: string;
    readonly owner: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly fundingSource: FundingSource;
}
/**
 * Strategic alignment assessment
 */
export interface StrategicAlignment {
    readonly themeAlignment: Record<string, number>;
    readonly businessValue: number;
    readonly strategicImportance: number;
    readonly timeCriticality: number;
    readonly riskAdjustment: number;
    readonly overallScore: number;
}
/**
 * Funding source
 */
export interface FundingSource {
    readonly sourceId: string;
    readonly name: string;
    readonly type: 'capex' | 'opex' | 'innovation' | 'maintenance';
    readonly totalFunding: number;
    readonly availableFunding: number;
    readonly constraints: string[];
    readonly renewalDate?: Date;
}
/**
 * Budget reserve
 */
export interface BudgetReserve {
    readonly reserveId: string;
    readonly name: string;
    readonly purpose: 'contingency' | 'innovation' | 'strategic-opportunity' | 'compliance';
    readonly amount: number;
    readonly usedAmount: number;
    readonly triggerCriteria: string[];
    readonly approvalRequired: boolean;
    readonly expirationDate?: Date;
}
/**
 * Cost center
 */
export interface CostCenter {
    readonly costCenterId: string;
    readonly name: string;
    readonly description: string;
    readonly manager: string;
    readonly budget: number;
    readonly actualSpend: number;
    readonly forecastSpend: number;
    readonly allocations: string[];
    readonly trackingCategories: CostCategory[];
    readonly reportingFrequency: 'weekly' | 'monthly' | 'quarterly';
}
/**
 * Cost category
 */
export interface CostCategory {
    readonly categoryId: string;
    readonly name: string;
    readonly budget: number;
    readonly actualSpend: number;
    readonly forecasted: number;
    readonly variance: number;
    readonly variancePercentage: number;
}
/**
 * Epic investment analysis
 */
export interface EpicInvestmentAnalysis {
    readonly analysisId: string;
    readonly epicId: string;
    readonly analysisDate: Date;
    readonly investmentSummary: InvestmentSummary;
    readonly businessCase: BusinessCase;
    readonly financialProjection: FinancialProjection;
    readonly riskAssessment: InvestmentRiskAssessment;
    readonly recommendedAction: InvestmentRecommendation;
    readonly comparisonMetrics: EpicComparisonMetrics;
    readonly sensitivityAnalysis: SensitivityAnalysis;
}
/**
 * Investment summary
 */
export interface InvestmentSummary {
    readonly totalInvestment: number;
    readonly expectedReturn: number;
    readonly roi: number;
    readonly paybackPeriod: number;
    readonly npv: number;
    readonly irr: number;
    readonly investmentHorizon: number;
    readonly riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}
/**
 * Business case
 */
export interface BusinessCase {
    readonly problemStatement: string;
    readonly proposedSolution: string;
    readonly businessObjectives: string[];
    readonly successCriteria: string[];
    readonly assumptions: string[];
    readonly constraints: string[];
    readonly alternativesConsidered: string[];
    readonly recommendedApproach: string;
}
/**
 * Financial projection
 */
export interface FinancialProjection {
    readonly projectionPeriod: number;
    readonly developmentCosts: CostBreakdown;
    readonly operationalCosts: CostBreakdown;
    readonly revenueProjection: RevenueProjection;
    readonly cashFlow: CashFlowProjection[];
    readonly breakEvenPoint: number;
    readonly financialRisks: FinancialRisk[];
}
/**
 * Cost breakdown
 */
export interface CostBreakdown {
    readonly personnel: number;
    readonly technology: number;
    readonly infrastructure: number;
    readonly external: number;
    readonly overhead: number;
    readonly contingency: number;
    readonly total: number;
}
/**
 * Revenue projection
 */
export interface RevenueProjection {
    readonly directRevenue: number;
    readonly indirectRevenue: number;
    readonly costSavings: number;
    readonly riskMitigation: number;
    readonly strategicValue: number;
    readonly total: number;
}
/**
 * Cash flow projection
 */
export interface CashFlowProjection {
    readonly period: number;
    readonly investment: number;
    readonly returns: number;
    readonly netCashFlow: number;
    readonly cumulativeCashFlow: number;
}
/**
 * Investment risk assessment
 */
export interface InvestmentRiskAssessment {
    readonly overallRiskScore: number;
    readonly riskCategories: RiskCategory[];
    readonly mitigationStrategies: RiskMitigation[];
    readonly riskTolerance: 'low' | 'medium' | 'high';
    readonly contingencyRecommendations: string[];
}
/**
 * Risk category
 */
export interface RiskCategory {
    readonly category: 'technical' | 'market' | 'execution' | 'financial' | 'regulatory';
    readonly riskScore: number;
    readonly impact: 'low' | 'medium' | 'high' | 'critical';
    readonly probability: 'low' | 'medium' | 'high' | 'very-high';
    readonly description: string;
    readonly mitigationActions: string[];
}
/**
 * Risk mitigation
 */
export interface RiskMitigation {
    readonly riskId: string;
    readonly mitigationStrategy: string;
    readonly estimatedCost: number;
    readonly timeline: number;
    readonly effectiveness: number;
    readonly responsible: string;
}
/**
 * Investment recommendation
 */
export interface InvestmentRecommendation {
    readonly recommendation: 'approve' | 'approve-conditional' | 'defer' | 'reject';
    readonly rationale: string;
    readonly conditions?: string[];
    readonly alternativeOptions?: string[];
    readonly nextSteps: string[];
    readonly reviewDate?: Date;
    readonly confidenceLevel: number;
}
/**
 * Epic comparison metrics
 */
export interface EpicComparisonMetrics {
    readonly valueScore: number;
    readonly feasibilityScore: number;
    readonly riskScore: number;
    readonly strategicFitScore: number;
    readonly competitiveRanking: number;
    readonly priorityWeightedScore: number;
}
/**
 * Sensitivity analysis
 */
export interface SensitivityAnalysis {
    readonly scenarios: InvestmentScenario[];
    readonly keyVariables: SensitivityVariable[];
    readonly breakEvenAnalysis: BreakEvenAnalysis;
    readonly monteCarlo?: MonteCarloResults;
}
/**
 * Investment scenario
 */
export interface InvestmentScenario {
    readonly scenarioName: string;
    readonly probability: number;
    readonly assumptions: Record<string, number>;
    readonly projectedRoi: number;
    readonly projectedNpv: number;
    readonly projectedPayback: number;
}
/**
 * Sensitivity variable
 */
export interface SensitivityVariable {
    readonly variable: string;
    readonly baseValue: number;
    readonly lowValue: number;
    readonly highValue: number;
    readonly impactOnRoi: number;
    readonly impactOnNpv: number;
}
/**
 * Strategic theme tracking
 */
export interface StrategicThemeTracking {
    readonly themeId: string;
    readonly trackingPeriod: DateRange;
    readonly progressMetrics: ThemeProgressMetrics;
    readonly budgetUtilization: ThemeBudgetUtilization;
    readonly epicContributions: EpicContribution[];
    readonly kpiPerformance: KPIPerformance[];
    readonly milestoneTracking: MilestoneTracking[];
    readonly riskIndicators: ThemeRiskIndicator[];
}
/**
 * Theme progress metrics
 */
export interface ThemeProgressMetrics {
    readonly overallProgress: number;
    readonly epicsProgress: number;
    readonly milestonesAchieved: number;
    readonly totalMilestones: number;
    readonly valueDelivered: number;
    readonly targetValue: number;
    readonly scheduleVariance: number;
    readonly scopeVariance: number;
}
/**
 * Theme budget utilization
 */
export interface ThemeBudgetUtilization {
    readonly allocatedBudget: number;
    readonly committedBudget: number;
    readonly actualSpend: number;
    readonly forecastedSpend: number;
    readonly burnRate: number;
    readonly projectedCompletion: Date;
    readonly budgetVariance: number;
    readonly costPerformanceIndex: number;
}
/**
 * Epic contribution to theme
 */
export interface EpicContribution {
    readonly epicId: string;
    readonly epicName: string;
    readonly contributionPercentage: number;
    readonly currentProgress: number;
    readonly budgetContribution: number;
    readonly valueContribution: number;
    readonly riskContribution: number;
    readonly strategicAlignment: number;
}
/**
 * KPI performance
 */
export interface KPIPerformance {
    readonly kpiId: string;
    readonly kpiName: string;
    readonly targetValue: number;
    readonly currentValue: number;
    readonly previousValue: number;
    readonly trend: 'improving' | 'stable' | 'declining';
    readonly performanceGap: number;
    readonly achievementRate: number;
}
/**
 * Milestone tracking
 */
export interface MilestoneTracking {
    readonly milestoneId: string;
    readonly milestoneName: string;
    readonly plannedDate: Date;
    readonly forecastedDate: Date;
    readonly actualDate?: Date;
    readonly status: 'not-started' | 'in-progress' | 'at-risk' | 'completed' | 'delayed';
    readonly criticalPath: boolean;
    readonly dependencies: string[];
    readonly deliverables: string[];
}
/**
 * Theme risk indicator
 */
export interface ThemeRiskIndicator {
    readonly indicatorId: string;
    readonly riskType: 'budget' | 'schedule' | 'scope' | 'quality' | 'strategic';
    readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly impact: string;
    readonly mitigation: string;
    readonly owner: string;
    readonly dueDate: Date;
}
/**
 * Portfolio Manager state
 */
export interface PortfolioManagerState {
    readonly portfolios: Map<string, Portfolio>;
    readonly portfolioBudgets: Map<string, PortfolioBudgetConfig>;
    readonly strategicThemes: Map<string, StrategicTheme>;
    readonly epicInvestmentAnalyses: Map<string, EpicInvestmentAnalysis>;
    readonly themeTracking: Map<string, StrategicThemeTracking>;
    readonly budgetAllocations: Map<string, BudgetAllocation>;
    readonly costCenters: Map<string, CostCenter>;
    readonly fundingSources: Map<string, FundingSource>;
    readonly lastBudgetReview: Date;
    readonly lastThemeReview: Date;
    readonly lastInvestmentAnalysis: Date;
}
/**
 * Portfolio Manager - SAFe Lean Portfolio Management
 */
export declare class PortfolioManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly portfolioOrchestrator;
    private readonly valueStreamMapper;
    private readonly piManager;
    private readonly config;
    private state;
    private budgetTrackingTimer?;
    private investmentAnalysisTimer?;
    private portfolioReviewTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, portfolioOrchestrator: PortfolioOrchestrator, valueStreamMapper: ValueStreamMapper, piManager: ProgramIncrementManager, config?: Partial<PortfolioManagerConfig>);
    /**
     * Initialize the Portfolio Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Portfolio Manager
     */
    shutdown(): Promise<void>;
    /**
     * Plan portfolio budget allocation
     */
    planPortfolioBudget(portfolioId: string, budgetCycle: BudgetCycle, totalBudget: number, strategicThemes: StrategicTheme[], valueStreams: ValueStream[]): Promise<PortfolioBudgetConfig>;
    /**
     * Allocate budget to value streams
     */
    allocateValueStreamFunding(portfolioId: string, valueStreamId: string, fundingRequest: ValueStreamFundingRequest): Promise<BudgetAllocation>;
    /**
     * Track budget utilization and spend
     */
    trackBudgetUtilization(portfolioId: string): Promise<PortfolioBudgetUtilization>;
    /**
     * Define and track strategic themes
     */
    defineStrategicTheme(portfolioId: string, themeDefinition: StrategicThemeDefinition): Promise<StrategicTheme>;
    /**
     * Track strategic theme progress and alignment
     */
    trackStrategicThemeProgress(themeId: string): Promise<StrategicThemeTracking>;
    /**
     * Analyze epic investment and ROI
     */
    analyzeEpicInvestment(epicId: string, epic: Epic): Promise<EpicInvestmentAnalysis>;
    /**
     * Compare and prioritize epic investments
     */
    prioritizeEpicInvestments(portfolioId: string): Promise<EpicInvestmentPrioritization>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private startBudgetTracking;
    private startInvestmentAnalysis;
    private startPortfolioReview;
    private registerEventHandlers;
    private createBudgetPlanningWorkflow;
    private executeBudgetPlanningPhases;
    private createCostCenters;
    private createFundingSources;
    private calculateBudgetReserves;
    private createBudgetTrackingConfig;
    private createBudgetApprovalWorkflow;
    private analyzeValueStreamFundingRequest;
    private createFundingApprovalGate;
    private assessStrategicAlignment;
    private selectOptimalFundingSource;
    private updatePortfolioBudgetWithAllocation;
    private calculateUtilizationByCategory;
    private analyzeBurnRate;
    private identifyBudgetRisks;
    private generateBudgetAlerts;
    private calculateForecastAccuracy;
    private createBudgetThresholdAlert;
    private createThemeKPIs;
    private createThemeMilestones;
    private assessThemeRiskProfile;
    private setupThemeTracking;
    private createThemeApprovalGate;
    private calculateThemeProgressMetrics;
    private calculateThemeBudgetUtilization;
    private assessEpicContributionsToTheme;
    private trackThemeKPIPerformance;
    private updateThemeMilestoneTracking;
    private identifyThemeRiskIndicators;
    private createThemeProgressAlerts;
    private createEpicBusinessCase;
    private calculateEpicFinancialProjection;
    private calculateInvestmentSummary;
    private assessEpicInvestmentRisks;
    private generateEpicComparisonMetrics;
    private performSensitivityAnalysis;
    private generateInvestmentRecommendation;
    private createEpicInvestmentApprovalGate;
    private definePrioritizationCriteria;
    private scoreEpicsAgainstCriteria;
    private optimizeEpicPortfolio;
    private generateAlternativePortfolioScenarios;
    private updateAllBudgetUtilization;
    private updateAllInvestmentAnalyses;
    private performPortfolioHealthCheck;
    private handleEpicCompletion;
    private handleBudgetThresholdExceeded;
    private handleThemeMilestoneReached;
}
export interface BudgetApprovalWorkflow {
    readonly workflowId: string;
    readonly approvalSteps: ApprovalStep[];
    readonly escalationRules: EscalationRule[];
    readonly notificationConfig: NotificationConfig;
}
export interface ApprovalStep {
    readonly stepId: string;
    readonly name: string;
    readonly approvers: string[];
    readonly requiredApprovals: number;
    readonly timeoutHours: number;
    readonly escalationRules: string[];
}
export interface EscalationRule {
    readonly ruleId: string;
    readonly trigger: string;
    readonly escalateTo: string[];
    readonly delayHours: number;
    readonly maxEscalations: number;
}
export interface NotificationConfig {
    readonly channels: string[];
    readonly recipients: string[];
    readonly templates: Record<string, string>;
    readonly frequency: 'immediate' | 'daily' | 'weekly';
}
export interface BudgetTrackingConfig {
    readonly portfolioId: string;
    readonly trackingFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
    readonly alertThresholds: AlertThreshold[];
    readonly reportingSchedule: ReportingSchedule;
    readonly integrations: Integration[];
}
export interface AlertThreshold {
    readonly metric: string;
    readonly threshold: number;
    readonly severity: 'info' | 'warning' | 'critical';
    readonly actions: string[];
}
export interface ReportingSchedule {
    readonly frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    readonly recipients: string[];
    readonly format: 'dashboard' | 'email' | 'pdf' | 'api';
    readonly includeDetails: boolean;
}
export interface Integration {
    readonly system: string;
    readonly endpoint: string;
    readonly frequency: 'real-time' | 'hourly' | 'daily';
    readonly dataMapping: Record<string, string>;
}
export interface ValueStreamFundingRequest {
    readonly requestId: string;
    readonly name: string;
    readonly type: 'epic' | 'value-stream' | 'enabler' | 'operational' | 'innovation';
    readonly requestedAmount: number;
    readonly commitmentLevel: 'committed' | 'uncommitted' | 'exploration';
    readonly priority: number;
    readonly owner: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly epicIds?: string[];
    readonly costCenterId?: string;
    readonly justification: string;
    readonly expectedOutcomes: string[];
    readonly risks: string[];
}
export interface PortfolioBudgetUtilization {
    readonly portfolioId: string;
    readonly totalBudget: number;
    readonly totalAllocated: number;
    readonly totalSpent: number;
    readonly totalAvailable: number;
    readonly utilizationPercentage: number;
    readonly spendPercentage: number;
    readonly burnRate: number;
    readonly projectedCompletion: Date;
    readonly utilizationByCategory: Record<string, number>;
    readonly budgetRisks: any[];
    readonly budgetAlerts: any[];
    readonly forecastAccuracy: number;
    readonly lastUpdated: Date;
}
export interface StrategicThemeDefinition {
    readonly name: string;
    readonly description: string;
    readonly objectives: string[];
    readonly budgetAllocation: number;
    readonly timeHorizon: number;
    readonly owner: string;
    readonly stakeholders: string[];
}
export interface EpicInvestmentPrioritization {
    readonly portfolioId: string;
    readonly analysisDate: Date;
    readonly criteria: any;
    readonly scoredEpics: any[];
    readonly optimizationResult: any;
    readonly recommendedPortfolio: string[];
    readonly budgetUtilization: number;
    readonly expectedReturn: number;
    readonly riskProfile: any;
    readonly alternativeScenarios: any[];
}
export interface DateRange {
    readonly start: Date;
    readonly end: Date;
}
export interface BreakEvenAnalysis {
    readonly breakEvenPoint: number;
    readonly breakEvenValue: number;
    readonly sensitivity: number;
    readonly scenarios: any[];
}
export interface MonteCarloResults {
    readonly iterations: number;
    readonly confidenceInterval: {
        readonly low: number;
        readonly high: number;
    };
    readonly meanRoi: number;
    readonly standardDeviation: number;
    readonly riskOfLoss: number;
}
export default PortfolioManager;
export type { PortfolioManagerConfig, PortfolioBudgetConfig, BudgetCycle, BudgetAllocation, StrategicAlignment, FundingSource, BudgetReserve, CostCenter, EpicInvestmentAnalysis, InvestmentSummary, BusinessCase, FinancialProjection, InvestmentRiskAssessment, InvestmentRecommendation, StrategicThemeTracking, ThemeProgressMetrics, PortfolioManagerState, };
//# sourceMappingURL=portfolio-manager.d.ts.map