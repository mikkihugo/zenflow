/**
 * @fileoverview Epic Management Types - SAFe Epic Domain Types
 *
 * TypeScript type definitions for SAFe epic management and portfolio Kanban.
 * Provides comprehensive types for epic ownership and lifecycle management.
 *
 * SINGLE RESPONSIBILITY: Type definitions for epic management domain
 * FOCUSES ON: Epic lifecycle, portfolio Kanban, WSJF prioritization, business cases
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
// =============================================================================
// EPIC OWNER CONFIGURATION
// =============================================================================
/**
 * Epic Owner Manager configuration
 */
export interface EpicOwnerManagerConfig {
  readonly enablePortfolioKanban: boolean;
  readonly enableWSJFPrioritization: boolean;
  readonly enableBusinessCaseManagement: boolean;
  readonly enableEpicSplitting: boolean;
  readonly enableValueRealization: boolean;
  readonly enableStakeholderEngagement: boolean;
  readonly maxActiveEpics: number;
  readonly wsjfUpdateFrequency: number; // days
  readonly businessCaseReviewCycle: number; // days
  readonly valueRealizationTracking: boolean;
  readonly stakeholderFeedbackCycle: number; // days
  readonly epicAnalysisTimeLimit: number; // days
  readonly autoApprovalWSJFThreshold: number;
}
// =============================================================================
// EPIC LIFECYCLE AND STATES
// =============================================================================
/**
 * Portfolio Kanban states for epic lifecycle
 */
export enum PortfolioKanbanState {
  FUNNEL = 'funnel')analyzing')portfolio_backlog')implementing')done')cancelled'))};
/**
 * Epic lifecycle stage tracking
 */
export interface EpicLifecycleStage {
  readonly stage: PortfolioKanbanState;
  readonly enteredAt: Date;
  readonly exitedAt?:Date;
  readonly duration?:number; // days
  readonly gatesCriteria: GateCriterion[];
  readonly completionPercentage: number; // 0-100%
  readonly blockers: EpicBlocker[];
  readonly keyActivities: string[];
  readonly stakeholdersInvolved: string[];
}
/**
 * Gate criteria for epic progression
 */
export interface GateCriterion {
  readonly criterion: string;
  readonly status : 'pending| in_progress| completed' | ' blocked')technical| business| resource| external' | ' regulatory')|' critical')proceed| defer| pivot' | ' stop')high' | ' medium'|' low')unvalidated| validating| validated' | ' invalidated')customer_interview| market_research| prototype| mvp' | ' analytics');
  readonly owner: string;
  readonly successCriteria: string[];
  readonly resources: string[];
}
/**
 * Market analysis for epic
 */
export interface MarketAnalysis {
  readonly marketSize: number;
  readonly targetMarketSegment: string[];
  readonly competitiveAnalysis: CompetitorInsight[];
  readonly marketTrends: string[];
  readonly customerNeeds: EpicCustomerNeed[];
  readonly marketEntry: MarketEntryStrategy;
}
/**
 * Competitor insight
 */
export interface CompetitorInsight {
  readonly competitor: string;
  readonly marketPosition: string;
  readonly strengths: string[];
  readonly weaknesses: string[];
  readonly marketShare: number; // 0-100%
  readonly pricing: number;
  readonly customerSatisfaction: number; // 0-100%
}
/**
 * Customer need definition
 */
export interface EpicCustomerNeed {
  readonly need: string;
  readonly urgency: number; // 1-10
  readonly currentSatisfaction: number; // 0-100%
  readonly willingnessToPay: number;
  readonly frequency : 'daily| weekly| monthly| quarterly' | ' annually')direct| partnership| acquisition' | ' gradual');
  readonly investmentRequired: number;
  readonly expectedMarketShare: number; // 0-100%
  readonly keySuccessFactors: string[];
}
/**
 * Financial projection structure
 */
export interface FinancialProjection {
  readonly investmentRequired: number;
  readonly developmentCost: number;
  readonly operationalCost: number;
  readonly revenueProjection: RevenueProjection[];
  readonly costProjection: CostProjection[];
  readonly roiCalculation: ROICalculation;
  readonly paybackPeriod: number; // months
  readonly netPresentValue: number;
  readonly internalRateReturn: number; // percentage
}
/**
 * Revenue projection by period
 */
export interface RevenueProjection {
  readonly period: string; // Q1 2024, etc.
  readonly revenue: number;
  readonly customerCount: number;
  readonly averageRevenuePerCustomer: number;
  readonly assumptions: string[];
}
/**
 * Cost projection by period
 */
export interface CostProjection {
  readonly period: string;
  readonly developmentCost: number;
  readonly operationalCost: number;
  readonly marketingCost: number;
  readonly supportCost: number;
  readonly totalCost: number;
}
/**
 * ROI calculation details
 */
export interface ROICalculation {
  readonly totalInvestment: number;
  readonly totalReturn: number;
  readonly roi: number; // percentage
  readonly calculationMethod: string;
  readonly timeHorizon: number; // years
  readonly discountRate: number; // percentage
}
// =============================================================================
// RISK AND STAKEHOLDER MANAGEMENT
// =============================================================================
/**
 * Risk assessment framework
 */
export interface RiskAssessment {
  readonly risks: EpicRisk[];
  readonly overallRiskLevel : 'low| medium| high' | ' critical')technical| market| financial| regulatory' | ' operational');
  readonly impact: number; // 1-10
  readonly riskScore: number; // probability * impact
  readonly owner: string;
  readonly identifiedAt: Date;
  readonly status: |'identified| assessing| mitigating| monitoring' | ' closed')human| technology| budget' | ' infrastructure')available| partial| unavailable' | ' pending')epic| feature| capability| enabler' | ' external')blocks| enables| influences' | ' related')critical| high| medium' | ' low')pending| in_progress| resolved' | ' blocked')upcoming| in_progress| completed| missed' | ' cancelled')pending| in_review| passed| failed' | ' waived')pass' | ' fail'|' pending')financial| customer| operational' | ' strategic')daily| weekly| monthly' | ' quarterly')draft| pending| approved| rejected' | ' conditional')  readonly approver: string;
  readonly approvedAt?:Date;
  readonly conditions?:string[];
  readonly rejectionReason?:string;
  readonly nextReviewDate?:Date;
};