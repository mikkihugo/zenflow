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
  FUNNEL ='funnel,
  ANALYZING ='analyzing,
  PORTFOLIO_BACKLOG ='portfolio_backlog,
  IMPLEMENTING ='implementing,
  DONE ='done,
  CANCELLED ='cancelled,
}

/**
 * Epic priority levels using WSJF
 */
export interface WSJFScore {
  readonly businessValue: number; // 1-20
  readonly urgency: number; // 1-20
  readonly riskReduction: number; // 1-20
  readonly opportunityEnablement: number; // 1-20
  readonly size: number; // 1-20 (job size)
  readonly wsjfScore: number; // calculated (CoD/size)
  readonly lastUpdated: Date;
  readonly scoredBy: string;
  readonly confidence: number; // 0-100%
}

/**
 * Epic lifecycle stage tracking
 */
export interface EpicLifecycleStage {
  readonly stage: PortfolioKanbanState;
  readonly enteredAt: Date;
  readonly exitedAt?: Date;
  readonly duration?: number; // days
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
  readonly status:'pending| in_progress| completed'|'blocked';
  readonly owner: string;
  readonly dueDate: Date;
  readonly completionDate?: Date;
  readonly evidence: string[];
  readonly blockingIssues: string[];
}

/**
 * Epic blocker tracking
 */
export interface EpicBlocker {
  readonly id: string;
  readonly description: string;
  readonly category:|'technical| business| resource| external'|'regulatory';
  readonly severity: low| medium| high'|'critical';
  readonly identifiedAt: Date;
  readonly resolvedAt?: Date;
  readonly owner: string;
  readonly resolutionPlan: string[];
  readonly impact: string;
  readonly dependencies: string[];
}

// =============================================================================
// BUSINESS CASE FRAMEWORK
// =============================================================================

/**
 * Epic business case structure
 */
export interface EpicBusinessCase {
  readonly id: string;
  readonly epicId: string;
  readonly businessHypothesis: BusinessHypothesis;
  readonly marketAnalysis: MarketAnalysis;
  readonly financialProjection: FinancialProjection;
  readonly financialViability: FinancialViability;
  readonly riskAssessment: RiskAssessment;
  readonly implementationPlan: ImplementationPlan;
  readonly successMetrics: SuccessMetric[];
  readonly alternativeSolutions: AlternativeSolution[];
  readonly recommendedAction:'proceed| defer| pivot'|'stop';
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: string;
  readonly approvalStatus: ApprovalStatus;
}

/**
 * Financial viability assessment
 */
export interface FinancialViability {
  readonly netPresentValue: number;
  readonly npv: number; // Alias for netPresentValue
  readonly returnOnInvestment: number;
  readonly roi: number; // Alias for returnOnInvestment
  readonly paybackPeriod: number;
  readonly breakEvenPoint: number;
  readonly riskAdjustedReturn: number;
  readonly confidenceLevel: number;
  readonly financialScore: number;
  readonly isViable: boolean; // Overall financial viability assessment
}

/**
 * Business hypothesis framework
 */
export interface BusinessHypothesis {
  readonly problemStatement: string;
  readonly targetCustomers: string[];
  readonly proposedSolution: string;
  readonly expectedOutcome: string;
  readonly assumptionsList: BusinessAssumption[];
  readonly validationPlan: ValidationStep[];
  readonly riskMitigations: string[];
}

/**
 * Business assumption tracking
 */
export interface BusinessAssumption {
  readonly assumption: string;
  readonly criticality:'high'|'medium'|'low';
  readonly validationMethod: string;
  readonly validationStatus:|'unvalidated| validating| validated'|'invalidated';
  readonly validationResult?: string;
  readonly impactIfIncorrect: string;
}

/**
 * Validation step definition
 */
export interface ValidationStep {
  readonly step: string;
  readonly method:|'customer_interview| market_research| prototype| mvp'|'analytics';
  readonly timeline: number; // days
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
  readonly frequency:'daily| weekly| monthly| quarterly'|'annually';
}

/**
 * Market entry strategy
 */
export interface MarketEntryStrategy {
  readonly approach:'direct| partnership| acquisition'|'gradual';
  readonly timeline: number; // months
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
  readonly overallRiskLevel:'low| medium| high'|'critical';
  readonly riskMitigationPlan: RiskMitigation[];
  readonly contingencyPlans: ContingencyPlan[];
  readonly riskOwners: string[];
}

/**
 * Epic risk definition
 */
export interface EpicRisk {
  readonly id: string;
  readonly description: string;
  readonly category:|'technical| market| financial| regulatory'|'operational';
  readonly probability: number; // 0-100%
  readonly impact: number; // 1-10
  readonly riskScore: number; // probability * impact
  readonly owner: string;
  readonly identifiedAt: Date;
  readonly status:|'identified| assessing| mitigating| monitoring'|'closed';
}

/**
 * Risk mitigation strategy
 */
export interface RiskMitigation {
  readonly riskId: string;
  readonly mitigationStrategy: string;
  readonly actions: string[];
  readonly owner: string;
  readonly timeline: number; // days
  readonly cost: number;
  readonly effectiveness: number; // 0-100%
}

/**
 * Contingency planning
 */
export interface ContingencyPlan {
  readonly trigger: string;
  readonly response: string;
  readonly actions: string[];
  readonly owner: string;
  readonly activationCriteria: string[];
  readonly resourcesRequired: string[];
}

/**
 * Implementation plan structure
 */
export interface ImplementationPlan {
  readonly phases: ImplementationPhase[];
  readonly timeline: number; // months
  readonly resourceRequirements: ResourceRequirement[];
  readonly dependencies: EpicDependency[];
  readonly milestones: EpicMilestone[];
  readonly qualityGates: QualityGate[];
}

/**
 * Implementation phase definition
 */
export interface ImplementationPhase {
  readonly phase: string;
  readonly duration: number; // months
  readonly objectives: string[];
  readonly deliverables: string[];
  readonly resources: string[];
  readonly dependencies: string[];
  readonly successCriteria: string[];
  readonly riskFactors: string[];
}

/**
 * Resource requirement specification
 */
export interface ResourceRequirement {
  readonly resourceType:'human| technology| budget'|'infrastructure';
  readonly description: string;
  readonly quantity: number;
  readonly duration: number; // months
  readonly cost: number;
  readonly availability:'available| partial| unavailable'|'pending';
}

/**
 * Epic dependency tracking
 */
export interface EpicDependency {
  readonly id: string;
  readonly type:'epic| feature| capability| enabler'|'external';
  readonly dependsOn: string;
  readonly relationship:'blocks| enables| influences'|'related';
  readonly criticality:'critical| high| medium'|'low';
  readonly status:'pending| in_progress| resolved'|'blocked';
  readonly owner: string;
  readonly targetDate: Date;
}

/**
 * Epic milestone tracking
 */
export interface EpicMilestone {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetDate: Date;
  readonly actualDate?: Date;
  readonly status:|'upcoming| in_progress| completed| missed'|'cancelled';
  readonly deliverables: string[];
  readonly owner: string;
  readonly stakeholders: string[];
}

/**
 * Quality gate definition
 */
export interface QualityGate {
  readonly gate: string;
  readonly criteria: QualityCriterion[];
  readonly owner: string;
  readonly status:'pending| in_review| passed| failed'|'waived';
  readonly reviewDate: Date;
  readonly evidence: string[];
}

/**
 * Quality criterion specification
 */
export interface QualityCriterion {
  readonly criterion: string;
  readonly threshold: string;
  readonly measurement: string;
  readonly actual?: string;
  readonly status:'pass'|'fail'|'pending';
}

// =============================================================================
// SUCCESS METRICS AND VALUE REALIZATION
// =============================================================================

/**
 * Success metric definition
 */
export interface SuccessMetric {
  readonly metric: string;
  readonly category:'financial| customer| operational'|'strategic';
  readonly target: number;
  readonly baseline: number;
  readonly current?: number;
  readonly unit: string;
  readonly measurementFrequency:'daily| weekly| monthly'|'quarterly';
  readonly owner: string;
  readonly achievementDate?: Date;
}

/**
 * Alternative solution analysis
 */
export interface AlternativeSolution {
  readonly solution: string;
  readonly description: string;
  readonly cost: number;
  readonly timeline: number; // months
  readonly benefits: string[];
  readonly risks: string[];
  readonly recommendationScore: number; // 0-100%
}

/**
 * Approval status tracking
 */
export interface ApprovalStatus {
  readonly status:|'draft| pending| approved| rejected'|'conditional';
  readonly approver: string;
  readonly approvedAt?: Date;
  readonly conditions?: string[];
  readonly rejectionReason?: string;
  readonly nextReviewDate?: Date;
}
