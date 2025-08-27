/**
 * @fileoverview Market Analysis Service - Market Intelligence
 *
 * Service for market analysis, competitive intelligence, and opportunity assessment.
 * Handles market sizing, trend analysis, and competitive positioning.
 *
 * SINGLE RESPONSIBILITY: Market analysis and competitive intelligence
 * FOCUSES ON: Market sizing, trend analysis, competitive benchmarking
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../types';
import type { CompetitorAnalysis, MarketOpportunity, MarketTrend, PricingStrategy } from '../types/product-management';
/**
 * Market analysis configuration
 */
export interface MarketAnalysisConfig {
    readonly analysisDepth: 'basic' | 'standard' | 'comprehensive';
    readonly competitorTrackingCount: number;
    readonly trendAnalysisHorizon: number;
    readonly marketDataRefreshDays: number;
    readonly confidenceThreshold: number;
}
/**
 * Market sizing result
 */
export interface MarketSizing {
    readonly totalAddressableMarket: number;
    readonly serviceableAddressableMarket: number;
    readonly serviceableObtainableMarket: number;
    readonly marketPenetration: number;
    readonly growthProjection: number[];
    readonly assumptions: string[];
    readonly confidenceLevel: number;
}
/**
 * Competitive landscape analysis
 */
export interface CompetitiveLandscape {
    readonly leaders: CompetitorAnalysis[];
    readonly challengers: CompetitorAnalysis[];
    readonly niche: CompetitorAnalysis[];
    readonly emerging: CompetitorAnalysis[];
    readonly marketConcentration: number;
    readonly competitiveIntensity: 'low|medium|high|extreme;;
    readonly barrierToEntry: 'low' | 'medium' | 'high';
}
/**
 * Market trend analysis
 */
export interface TrendAnalysis {
    readonly emergingTrends: MarketTrend[];
    readonly decliningTrends: MarketTrend[];
    readonly stableTrends: MarketTrend[];
    readonly trendImpactMatrix: TrendImpact[];
    readonly strategicImplications: string[];
}
/**
 * Trend impact assessment
 */
export interface TrendImpact {
    readonly trend: MarketTrend;
    readonly timeToImpact: number;
    readonly probabilityOfOccurrence: number;
    readonly potentialImpact: number;
    readonly preparednessLevel: number;
    readonly requiredActions: string[];
}
/**
 * Market opportunity assessment
 */
export interface OpportunityAssessment {
    readonly opportunityScore: number;
    readonly marketAttractiveness: number;
    readonly competitivePosition: number;
    readonly entryComplexity: number;
    readonly timeToMarket: number;
    readonly investmentRequired: number;
    readonly expectedROI: number;
    readonly riskFactors: string[];
    readonly successFactors: string[];
}
/**
 * Market Analysis Service for comprehensive market intelligence
 */
export declare class MarketAnalysisService {
    private readonly logger;
    private competitorProfiles;
    private trendDatabase;
    constructor(config: MarketAnalysisConfig, logger: Logger);
    /**
     * Perform comprehensive market sizing analysis
     */
    performMarketSizing(input: {
        marketCategory: string;
        geographicScope: string[];
        targetSegments: string[];
        pricingModel: PricingStrategy;
        assumptions: string[];
    }): Promise<MarketSizing>;
    /**
     * Analyze competitive landscape comprehensively
     */
    analyzeCompetitiveLandscape(competitors: CompetitorAnalysis[]): Promise<CompetitiveLandscape>;
    /**
     * Perform comprehensive trend analysis
     */
    analyzeTrends(trends: MarketTrend[]): Promise<TrendAnalysis>;
    /**
     * Assess market opportunity comprehensively
     */
    assessOpportunity(marketData: MarketOpportunity, competitivePosition: number, _investmentCapacity: number): Promise<OpportunityAssessment>;
    /**
     * Calculate Total Addressable Market
     */
    private calculateTAM;
    /**
     * Calculate Serviceable Addressable Market
     */
    private calculateSAM;
    /**
     * Calculate Serviceable Obtainable Market
     */
    private calculateSOM;
    /**
     * Project market growth over time
     */
    private projectMarketGrowth;
    /**
     * Assess confidence in analysis
     */
    private assessConfidence;
    /**
     * Categorize competitors by market position
     */
    private categorizeCompetitors;
    /**
     * Calculate Herfindahl-Hirschman Index for market concentration
     */
    private calculateHHI;
    /**
     * Assess competitive intensity
     */
    private assessCompetitiveIntensity;
    /**
     * Evaluate barriers to market entry
     */
    private evaluateBarrierToEntry;
    /**
     * Assess trend impact on business
     */
    private assessTrendImpact;
}
//# sourceMappingURL=market-analysis-service.d.ts.map