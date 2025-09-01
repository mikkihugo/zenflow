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
 readonly enableMarketAnalysis: boolean;
 readonly enableCustomerSegmentation: boolean;
 readonly enableCompetitiveIntelligence: boolean;
 readonly enableProductRoadmapPlanning: boolean;
 readonly enableValuePropositionDesign: boolean;
 readonly enableCustomerFeedbackIntegration: boolean;
 readonly maxActiveProducts: number;
 readonly visionReviewCycle: number;
 readonly marketAnalysisFrequency: number;
 readonly customerFeedbackCycle: number;
}
/**
 * Product vision framework
 */
export interface ProductVision {
 id: string;
 title: string;
 description: string;
 mission: string;
 visionStatement: string;
 targetAudience: string[];
 valueProposition: string;
 successMetrics: string[];
 strategicObjectives: string[];
 timeline: {
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
 };
 stakeholders: string[];
 createdAt: Date;
 updatedAt: Date;
 reviewedBy?: string;
}
/**
 * Competitor satisfaction analysis
 */
export interface CompetitorSatisfaction {
 readonly competitor: string;
 readonly overallSatisfaction: number;
 readonly featureSatisfaction: Record<string, number>;
 readonly easeOfUse: number;
 readonly supportQuality: number;
 readonly pricingSatisfaction: number;
 readonly recommendationLikelihood: number;
 readonly strengths: string[];
 readonly weaknesses: string[];
}
/**
 * Frequency pattern for customer behavior
 */
export declare enum FrequencyPattern {
 continuous = 1,
 daily = 3,
 weekly = 5,
 monthly = 7,
 quarterly = 9,
 annually = 11,
 sporadic = 13,
 one_time = 15
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
 readonly conversionRate?: number;
 readonly dropOffRate?: number;
}
/**
 * Evaluation criterion for decisions
 */
export interface EvaluationCriterion {
 readonly criterion: string;
 readonly importance: number;
 readonly howWeCompare: number;
 readonly competitorBenchmark: number;
 readonly improvementNeeded: boolean;
 readonly actionPlan?: string;
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
 readonly growthRate: number;
 readonly innovationScore: number;
}
/**
 * Budget cycle information
 */
export interface BudgetCycle {
 readonly cycleType: 'annual' | 'quarterly' | 'project_based' | 'continuous';
 readonly startMonth: number;
 readonly planningHorizon: number;
 readonly approvalProcess: string[];
 readonly budgetSize: {
  min: number;
  max: number;
  average: number;
 };
 readonly allocationStrategy: string;
 readonly contingencyPercentage: number;
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
 readonly marketEntryStrategy: string;
 readonly riskAssessment: string;
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
 readonly threatLevel: 'low' | 'medium' | 'high';
 readonly marketPosition: string;
}
/**
 * Market trend analysis
 */
export interface MarketTrend {
 readonly trend: string;
 readonly impact: 'positive' | 'negative' | 'neutral';
 readonly timeframe: string;
 readonly confidence: number;
 readonly sources: string[];
 readonly implications: string[];
}
/**
 * Market barrier identification
 */
export interface MarketBarrier {
 readonly barrier: string;
 readonly severity: 'low' | 'medium' | 'high' | 'critical';
 readonly category: 'regulatory' | 'technological' | 'economic' | 'cultural';
 readonly impact: string;
 readonly mitigationStrategies: string[];
}
/**
 * Market driver analysis
 */
export interface MarketDriver {
 readonly driver: string;
 readonly impact: number;
 readonly timeline: string;
 readonly confidence: number;
 readonly supportingEvidence: string[];
}
/**
 * Pricing strategy definition
 */
export interface PricingStrategy {
 readonly model: 'premium' | 'competitive' | 'penetration' | 'skimming';
 readonly basePrice: number;
 readonly discount: number;
 readonly bundling: boolean;
 readonly dynamicPricing: boolean;
 readonly psychologicalPricing: boolean;
}
/**
 * Success criterion definition
 */
export interface SuccessCriterion {
 readonly metric: string;
 readonly target: number;
 readonly timeframe: string;
 readonly measurement: string;
 readonly baseline?: number;
 readonly owner: string;
 readonly dataSource: string;
}
/**
 * Strategy alignment tracking
 */
export interface StrategyAlignment {
 readonly strategicTheme: string;
 readonly alignmentScore: number;
 readonly contributionLevel: 'direct' | 'indirect' | 'supporting';
 readonly strategicImportance: number;
 readonly businessImpact: string;
 readonly executionPriority: number;
}
/**
 * Stakeholder alignment tracking
 */
export interface StakeholderAlignment {
 readonly stakeholder: string;
 readonly alignmentLevel: number;
 readonly lastReviewed: Date;
 readonly concerns: string[];
 readonly supportLevel: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker';
 readonly influenceLevel: 'high' | 'medium' | 'low';
 readonly communicationFrequency: string;
}
//# sourceMappingURL=product-management.d.ts.map