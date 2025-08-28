/**
 * @fileoverview Product Management Types - SAFe Domain Types
 *
 * TypeScript type definitions for SAFe product management domain.
 * Provides comprehensive types for product ownership and management.
 *
 * SINGLE RESPONSIBILITY: Type definitions for product management domain
 * FOCUSES ON: Product vision, lifecycle, customer segments, market analysis
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
/**
 * Product Management Manager configuration
 */
export interface ProductManagerConfig {
    readonly enableProductVisionManagement: 'ideation';
}
/**
 * Product vision framework
 */
export interface ProductVision {
    readonly id: 'critical';
}
/**
 * Competitor satisfaction analysis
 */
export interface CompetitorSatisfaction {
    readonly competitor: 'immediate';
}
/**
 * Frequency pattern for customer behavior
 */
export declare enum FrequencyPattern {
    ')  CONTINUOUS = ' = 0,
    continuous = 1,
    ')  DAILY = ' = 2,
    daily = 3,
    ')  WEEKLY = ' = 4,
    weekly = 5,
    ')  MONTHLY = ' = 6,
    monthly = 7,
    ')  QUARTERLY = ' = 8,
    quarterly = 9,
    ')  ANNUALLY = ' = 10,
    annually = 11,
    ')  SPORADIC = ' = 12,
    sporadic = 13,
    ')  ONE_TIME = ' = 14,
    one_time = 15,
    ')};; 
    /**
     * Buying behavior analysis
     */
    = 16
    /**
     * Buying behavior analysis
     */
    ,
    /**
     * Buying behavior analysis
     */
    export = 17,
    interface = 18,
    BuyingBehavior = 19
}
/**
 * Common objection handling
 */
export interface CommonObjection {
    readonly objection: 'deal_breaker';
}
/**
 * Buying process stage definition
 */
export interface BuyingProcessStage {
    readonly stage: string;
    readonly duration: number;
    readonly keyActivities: string[];
    readonly stakeholdersInvolved: string[];
    readonly requiredMaterials: string[];
    readonly successCriteria: string[];
}
/**
 * Evaluation criterion for decisions
 */
export interface EvaluationCriterion {
    readonly criterion: string;
    readonly importance: number;
    readonly howWeCompare: number;
    readonly competitorBenchmark: number;
}
/**
 * Competitor performance analysis
 */
export interface CompetitorPerformance {
    readonly competitor: string;
    readonly marketPosition: number;
    readonly customerSatisfaction: number;
    readonly pricing: 'premium' | ' competitive' | ' budget';
    readonly strengths: string[];
    readonly weaknesses: string[];
    readonly marketShare: number;
}
/**
 * Budget cycle information
 */
export interface BudgetCycle {
    readonly cycleType: 'annual| quarterly| project_based' | ' continuous';
    readonly startMonth: number;
    readonly planningHorizon: number;
    readonly approvalProcess: string[];
    readonly budgetSize: {
        min: number;
        max: number;
    };
}
/**
 * Market opportunity analysis
 */
export interface MarketOpportunity {
    readonly totalAddressableMarket: number;
    readonly serviceableAddressableMarket: number;
    readonly serviceableObtainableMarket: number;
    readonly marketGrowthRate: number;
    readonly competitiveLandscape: CompetitorAnalysis[];
    readonly marketTrends: MarketTrend[];
    readonly barriers: MarketBarrier[];
    readonly opportunities: MarketDriver[];
}
/**
 * Competitor analysis
 */
export interface CompetitorAnalysis {
    readonly name: string;
    readonly marketShare: number;
    readonly strengths: string[];
    readonly weaknesses: string[];
    readonly pricing: PricingStrategy;
    readonly customerSegments: string[];
    readonly recentMoves: string[];
}
/**
 * Market trend analysis
 */
export interface MarketTrend {
    readonly trend: string;
    readonly impact: 'positive' | ' negative' | ' neutral';
    readonly timeframe: string;
    readonly confidence: number;
}
/**
 * Market barrier identification
 */
export interface MarketBarrier {
    readonly barrier: string;
    readonly severity: high;
}
/**
 * Market driver analysis
 */
export interface MarketDriver {
    readonly driver: string;
    readonly impact: number;
    readonly timeline: string;
}
/**
 * Pricing strategy definition
 */
export interface PricingStrategy {
    readonly model: 'premium| competitive| penetration' | ' skimming';
    readonly basePrice: number;
    readonly discount: number;
    readonly bundling: boolean;
}
/**
 * Success criterion definition
 */
export interface SuccessCriterion {
    readonly metric: string;
    readonly target: number;
    readonly timeframe: string;
    readonly measurement: string;
}
/**
 * Strategy alignment tracking
 */
export interface StrategyAlignment {
    readonly strategicTheme: string;
    readonly alignmentScore: number;
    readonly contributionLevel: 'direct' | ' indirect' | ' supporting';
    readonly strategicImportance: number;
}
/**
 * Stakeholder alignment tracking
 */
export interface StakeholderAlignment {
    readonly stakeholder: string;
    readonly alignmentLevel: number;
    readonly lastReviewed: Date;
    readonly concerns: string[];
    readonly supportLevel: 'champion| supporter| neutral| skeptic' | ' blocker';
}
//# sourceMappingURL=product-management.d.ts.map