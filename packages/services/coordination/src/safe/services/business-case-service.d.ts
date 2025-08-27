/**
 * @fileoverview Business Case Service - Epic Investment Analysis
 *
 * Service for managing epic business cases, financial analysis, and investment decisions.
 * Handles business hypothesis validation, ROI calculation, and risk assessment.
 *
 * SINGLE RESPONSIBILITY: Business case development and financial analysis
 * FOCUSES ON: ROI calculation, risk assessment, business hypothesis validation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../types';
import type { BusinessHypothesis, EpicBusinessCase, EpicRisk, FinancialViability } from '../types/epic-management';
/**
 * Business case service configuration
 */
export interface BusinessCaseConfig {
    readonly discountRate: number;
    readonly analysisHorizon: number;
    readonly riskThreshold: number;
    readonly roiThreshold: number;
    readonly paybackPeriodLimit: number;
    readonly confidenceThreshold: number;
}
/**
 * Business case analysis result
 */
export interface BusinessCaseAnalysis {
    readonly businessCase: EpicBusinessCase;
    readonly financialViability: FinancialViability;
    readonly riskProfile: RiskProfile;
    readonly recommendation: BusinessRecommendation;
    readonly sensitivityAnalysis: SensitivityAnalysis;
    readonly competitivePosition: CompetitivePosition;
}
/**
 * Risk profile assessment
 */
export interface RiskProfile {
    readonly overallRiskLevel: 'low|medium|high|critical;;
    readonly riskScore: number;
    readonly criticalRisks: EpicRisk[];
    readonly mitigationCoverage: number;
    readonly residualRisk: number;
    readonly riskTrend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | worsening;
}
/**
 * Business recommendation
 */
export interface BusinessRecommendation {
    readonly recommendation: 'proceed|defer|pivot|stop;;
    readonly confidence: number;
    readonly reasoning: string[];
    readonly conditions: string[];
    readonly alternativeOptions: string[];
    readonly nextSteps: string[];
}
/**
 * Sensitivity analysis
 */
export interface SensitivityAnalysis {
    readonly scenarios: BusinessScenario[];
    readonly keyDrivers: FinancialDriver[];
    readonly breakpoints: BreakpointAnalysis[];
    readonly recommendedActions: string[];
}
/**
 * Business scenario analysis
 */
export interface BusinessScenario {
    readonly scenario: 'optimistic' | 'realistic' | 'pessimistic';
    readonly probability: number;
    readonly roi: number;
    readonly npv: number;
    readonly paybackPeriod: number;
    readonly keyAssumptions: string[];
}
/**
 * Financial driver analysis
 */
export interface FinancialDriver {
    readonly driver: string;
    readonly impact: number;
    readonly likelihood: number;
    readonly category: 'revenue|cost|timeline|market;;
}
/**
 * Breakpoint analysis
 */
export interface BreakpointAnalysis {
    readonly variable: string;
    readonly breakpoint: number;
    readonly currentValue: number;
    readonly margin: number;
    readonly riskLevel: 'low' | 'medium' | 'high';
}
/**
 * Competitive position analysis
 */
export interface CompetitivePosition {
    readonly marketPosition: number;
    readonly competitiveAdvantage: string[];
    readonly competitiveDisadvantage: string[];
    readonly marketShare: number;
    readonly competitorResponse: CompetitorResponse[];
}
/**
 * Competitor response analysis
 */
export interface CompetitorResponse {
    readonly competitor: string;
    readonly likelyResponse: string;
    readonly impact: 'positive' | 'negative' | 'neutral';
    readonly timeframe: number;
    readonly mitigation: string[];
}
/**
 * Business Case Service for comprehensive business case development
 */
export declare class BusinessCaseService {
    private readonly logger;
    private businessCases;
    constructor(config: BusinessCaseConfig, logger: Logger);
    /**
     * Create comprehensive business case
     */
    createBusinessCase(input: {
        epicId: string;
        businessHypothesis: Omit<BusinessHypothesis, 'assumptionsList|validationPlan|riskMitigations'>;
        ': any;
    }): any;
}
//# sourceMappingURL=business-case-service.d.ts.map