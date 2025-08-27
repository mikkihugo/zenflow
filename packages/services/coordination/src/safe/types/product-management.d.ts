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
    readonly enableProductVisionManagement: boolean;
    readonly enableRoadmapPlanning: boolean;
    readonly enableMarketResearch: boolean;
    readonly enableCustomerFeedbackIntegration: boolean;
    readonly enableGoToMarketStrategy: boolean;
    readonly enablePerformanceTracking: boolean;
    readonly enableCompetitiveAnalysis: boolean;
    readonly maxProductsManaged: number;
    readonly roadmapHorizonMonths: number;
    readonly customerFeedbackCycle: number;
    readonly marketAnalysisCycle: number;
    readonly performanceReviewCycle: number;
    readonly minimumViabilityThreshold: number;
    readonly customerSatisfactionTarget: number;
}
/**
 * Product lifecycle stages
 */
export declare enum ProductLifecycleStage {
    IDEATION = "ideation",
    VALIDATION = "validation",
    DEVELOPMENT = "development",
    LAUNCH = "launch",
    GROWTH = "growth",
    MATURITY = "maturity",
    DECLINE = "decline",
    SUNSET = "sunset"
}
/**
 * Product vision framework
 */
export interface ProductVision {
    readonly id: string;
    readonly productId: string;
    readonly visionStatement: string;
    readonly targetCustomers: CustomerSegment[];
    readonly valueProposition: string;
    readonly keyBenefits: string[];
    readonly differentiators: string[];
    readonly successCriteria: SuccessCriterion[];
    readonly alignmentToStrategy: StrategyAlignment;
    readonly marketOpportunity: MarketOpportunity;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: string;
    readonly stakeholderAlignment: StakeholderAlignment[];
}
/**
 * Customer segment definition
 */
export interface CustomerSegment {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly size: number;
    readonly characteristics: CustomerCharacteristic[];
    readonly needs: CustomerNeed[];
    readonly painPoints: string[];
    readonly currentSolutions: string[];
    readonly competitorSatisfaction: CompetitorSatisfaction[];
    readonly urgency: UrgencyLevel;
    readonly frequencyOfNeed: FrequencyPattern;
    readonly buyingBehavior: BuyingBehavior;
    readonly decisionMakers: DecisionMaker[];
    readonly influencers: Influencer[];
    readonly commonObjections: CommonObjection[];
    readonly buyingProcess: BuyingProcessStage[];
    readonly budgetCycles: BudgetCycle[];
}
/**
 * Customer characteristic
 */
export interface CustomerCharacteristic {
    readonly trait: string;
    readonly description: string;
    readonly importance: number;
}
/**
 * Customer need definition
 */
export interface CustomerNeed {
    readonly id: string;
    readonly description: string;
    readonly priority: CustomerNeedPriority;
    readonly frequency: FrequencyPattern;
    readonly currentlySatisfied: boolean;
    readonly satisfactionLevel: number;
    readonly willingnessToPay: number;
}
/**
 * Customer need priority levels
 */
export declare enum CustomerNeedPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    NICE_TO_HAVE = "nice_to_have"
}
/**
 * Competitor satisfaction analysis
 */
export interface CompetitorSatisfaction {
    readonly competitor: string;
    readonly satisfactionLevel: number;
    readonly marketShare: number;
    readonly strengths: string[];
    readonly weaknesses: string[];
}
/**
 * Urgency level for customer needs
 */
export declare enum UrgencyLevel {
    IMMEDIATE = "immediate",
    SHORT_TERM = "short_term",
    MEDIUM_TERM = "medium_term",
    LONG_TERM = "long_term",
    FUTURE = "future"
}
/**
 * Frequency pattern for customer behavior
 */
export declare enum FrequencyPattern {
    CONTINUOUS = "continuous",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    ANNUALLY = "annually",
    SPORADIC = "sporadic",
    ONE_TIME = "one_time"
}
/**
 * Buying behavior analysis
 */
export interface BuyingBehavior {
    readonly decisionTimeframe: number;
    readonly budgetRange: {
        min: number;
        max: number;
    };
    readonly decisionFactors: EvaluationCriterion[];
    readonly competitors: CompetitorPerformance[];
    readonly references: boolean;
    readonly pilotRequired: boolean;
    readonly contractualRequirements: string[];
}
/**
 * Decision maker profile
 */
export interface DecisionMaker {
    readonly role: string;
    readonly department: string;
    readonly influenceLevel: InfluenceLevel;
    readonly priorities: string[];
    readonly concerns: string[];
    readonly preferredCommunication: string;
}
/**
 * Influencer profile
 */
export interface Influencer {
    readonly role: string;
    readonly department: string;
    readonly influenceLevel: InfluenceLevel;
    readonly influenceType: 'technical|business|financial|strategic;;
    readonly relationshipToDecisionMaker: string;
    readonly keyMessages: string[];
}
/**
 * Influence level enumeration
 */
export declare enum InfluenceLevel {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    TERTIARY = "tertiary",
    MINIMAL = "minimal"
}
/**
 * Common objection handling
 */
export interface CommonObjection {
    readonly objection: string;
    readonly frequency: number;
    readonly severity: ObjectionSeverity;
    readonly responses: string[];
    readonly preventionStrategies: string[];
}
/**
 * Objection severity levels
 */
export declare enum ObjectionSeverity {
    DEAL_BREAKER = "deal_breaker",
    MAJOR = "major",
    MODERATE = "moderate",
    MINOR = "minor",
    EASILY_ADDRESSED = "easily_addressed"
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
    readonly pricing: 'premium' | 'competitive' | 'budget';
    readonly strengths: string[];
    readonly weaknesses: string[];
    readonly marketShare: number;
}
/**
 * Budget cycle information
 */
export interface BudgetCycle {
    readonly cycleType: 'annual|quarterly|project_based|continuous;;
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
    readonly impact: 'positive' | 'negative' | 'neutral';
    readonly timeframe: string;
    readonly confidence: number;
}
/**
 * Market barrier identification
 */
export interface MarketBarrier {
    readonly barrier: string;
    readonly severity: 'high' | 'medium' | 'low';
    readonly mitigation: string[];
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
    readonly model: 'premium|competitive|penetration|skimming;;
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
    readonly contributionLevel: 'direct' | 'indirect' | 'supporting';
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
    readonly supportLevel: 'champion|supporter|neutral|skeptic|blocker;;
}
//# sourceMappingURL=product-management.d.ts.map