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

import { dateFns, generateNanoId } from '@claude-zen/foundation';
const { addMonths, differenceInMonths, format } = dateFns;
import {
  groupBy,
  map,
  filter,
  orderBy,
  sumBy,
  meanBy,
  maxBy,
  sortBy,
} from 'lodash-es';
import type {
  MarketOpportunity,
  CompetitorAnalysis,
  MarketTrend,
  MarketBarrier,
  MarketDriver,
  PricingStrategy,
} from '../types/product-management';
import type { Logger } from '../types';

/**
 * Market analysis configuration
 */
export interface MarketAnalysisConfig {
  readonly analysisDepth: 'basic' | 'standard' | 'comprehensive';
  readonly competitorTrackingCount: number;
  readonly trendAnalysisHorizon: number; // months
  readonly marketDataRefreshDays: number;
  readonly confidenceThreshold: number; // 0-100%
}

/**
 * Market sizing result
 */
export interface MarketSizing {
  readonly totalAddressableMarket: number;
  readonly serviceableAddressableMarket: number;
  readonly serviceableObtainableMarket: number;
  readonly marketPenetration: number; // 0-100%
  readonly growthProjection: number[]; // 5-year projection
  readonly assumptions: string[];
  readonly confidenceLevel: number; // 0-100%
}

/**
 * Competitive landscape analysis
 */
export interface CompetitiveLandscape {
  readonly leaders: CompetitorAnalysis[];
  readonly challengers: CompetitorAnalysis[];
  readonly niche: CompetitorAnalysis[];
  readonly emerging: CompetitorAnalysis[];
  readonly marketConcentration: number; // HHI index
  readonly competitiveIntensity: 'low|medium|high|extreme;
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
  readonly timeToImpact: number; // months
  readonly probabilityOfOccurrence: number; // 0-100%
  readonly potentialImpact: number; // -100 to +100
  readonly preparednessLevel: number; // 0-100%
  readonly requiredActions: string[];
}

/**
 * Market opportunity assessment
 */
export interface OpportunityAssessment {
  readonly opportunityScore: number; // 0-100
  readonly marketAttractiveness: number; // 0-100
  readonly competitivePosition: number; // 0-100
  readonly entryComplexity: number; // 0-100
  readonly timeToMarket: number; // months
  readonly investmentRequired: number;
  readonly expectedROI: number; // percentage
  readonly riskFactors: string[];
  readonly successFactors: string[];
}

/**
 * Market Analysis Service for comprehensive market intelligence
 */
export class MarketAnalysisService {
  private readonly config: MarketAnalysisConfig;
  private readonly logger: Logger;
  private marketData = new Map<string, MarketOpportunity>();
  private competitorProfiles = new Map<string, CompetitorAnalysis>();
  private trendDatabase = new Map<string, MarketTrend>();
  private analysisCache = new Map<string, any>();

  constructor(config: MarketAnalysisConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Perform comprehensive market sizing analysis
   */
  async performMarketSizing(input: {
    marketCategory: string;
    geographicScope: string[];
    targetSegments: string[];
    pricingModel: PricingStrategy;
    assumptions: string[];
  }): Promise<MarketSizing> {
    this.logger.info('Performing market sizing analysis', {'
      category: input.marketCategory,
      scope: input.geographicScope.length,
    });

    // Calculate TAM (Total Addressable Market)
    const tam = this.calculateTAM(input);

    // Calculate SAM (Serviceable Addressable Market)
    const sam = this.calculateSAM(
      tam,
      input.geographicScope,
      input.targetSegments
    );

    // Calculate SOM (Serviceable Obtainable Market)
    const som = this.calculateSOM(sam, input.pricingModel);

    // Generate growth projections
    const growthProjection = this.projectMarketGrowth(tam, 5);

    // Calculate confidence level
    const confidenceLevel = this.assessConfidence(input.assumptions);

    const sizing: MarketSizing = {
      totalAddressableMarket: tam,
      serviceableAddressableMarket: sam,
      serviceableObtainableMarket: som,
      marketPenetration: (som / sam) * 100,
      growthProjection,
      assumptions: input.assumptions,
      confidenceLevel,
    };

    this.logger.info('Market sizing completed', {'
      tam: tam,
      sam: sam,
      som: som,
      confidence: confidenceLevel,
    });

    return sizing;
  }

  /**
   * Analyze competitive landscape comprehensively
   */
  async analyzeCompetitiveLandscape(
    competitors: CompetitorAnalysis[]
  ): Promise<CompetitiveLandscape> {
    this.logger.info('Analyzing competitive landscape', {'
      competitorCount: competitors.length,
    });

    // Store competitor data
    competitors.forEach((competitor) => {
      this.competitorProfiles.set(competitor.name, competitor);
    });

    // Categorize competitors by position
    const categorized = this.categorizeCompetitors(competitors);

    // Calculate market concentration (HHI)
    const marketConcentration = this.calculateHHI(competitors);

    // Assess competitive intensity
    const competitiveIntensity = this.assessCompetitiveIntensity(competitors);

    // Evaluate barriers to entry
    const barrierToEntry = this.evaluateBarrierToEntry(competitors);

    return {
      leaders: categorized.leaders,
      challengers: categorized.challengers,
      niche: categorized.niche,
      emerging: categorized.emerging,
      marketConcentration,
      competitiveIntensity,
      barrierToEntry,
    };
  }

  /**
   * Perform comprehensive trend analysis
   */
  async analyzeTrends(trends: MarketTrend[]): Promise<TrendAnalysis> {
    this.logger.info('Analyzing market trends', { trendCount: trends.length });'

    // Store trends
    trends.forEach((trend) => {
      this.trendDatabase.set(trend.trend, trend);
    });

    // Categorize trends by trajectory
    const emergingTrends = filter(
      trends,
      (t) => t.confidence > 70 && t.impact === 'positive''
    );
    const decliningTrends = filter(
      trends,
      (t) => t.confidence > 60 && t.impact === 'negative''
    );
    const stableTrends = filter(trends, (t) => t.impact === 'neutral');'

    // Create trend impact matrix
    const trendImpactMatrix = map(trends, (trend) =>
      this.assessTrendImpact(trend)
    );

    // Generate strategic implications
    const strategicImplications =
      this.deriveStrategicImplications(trendImpactMatrix);

    return {
      emergingTrends,
      decliningTrends,
      stableTrends,
      trendImpactMatrix,
      strategicImplications,
    };
  }

  /**
   * Assess market opportunity comprehensively
   */
  async assessOpportunity(
    marketData: MarketOpportunity,
    competitivePosition: number,
    investmentCapacity: number
  ): Promise<OpportunityAssessment> {
    this.logger.info('Assessing market opportunity');'

    const marketAttractiveness = this.calculateMarketAttractiveness(marketData);
    const entryComplexity = this.assessEntryComplexity(marketData);
    const timeToMarket = this.estimateTimeToMarket(marketData, entryComplexity);
    const investmentRequired = this.estimateInvestmentRequired(
      marketData,
      entryComplexity
    );
    const expectedROI = this.calculateExpectedROI(
      marketData,
      investmentRequired
    );

    // Calculate composite opportunity score
    const opportunityScore =
      marketAttractiveness * 0.4 +
      competitivePosition * 0.3 +
      (100 - entryComplexity) * 0.2 +
      Math.min(100, expectedROI) * 0.1;

    const riskFactors = this.identifyRiskFactors(marketData, entryComplexity);
    const successFactors = this.identifySuccessFactors(
      marketData,
      competitivePosition
    );

    return {
      opportunityScore,
      marketAttractiveness,
      competitivePosition,
      entryComplexity,
      timeToMarket,
      investmentRequired,
      expectedROI,
      riskFactors,
      successFactors,
    };
  }

  // Private helper methods

  /**
   * Calculate Total Addressable Market
   */
  private calculateTAM(input: any): number {
    // Simplified TAM calculation - in reality would use industry data
    const baseMarket = 1000000000; // $1B base market
    const segmentMultiplier = input.targetSegments.length * 0.3;
    const geoMultiplier = input.geographicScope.length * 0.2;

    return baseMarket * (1 + segmentMultiplier + geoMultiplier);
  }

  /**
   * Calculate Serviceable Addressable Market
   */
  private calculateSAM(
    tam: number,
    geoScope: string[],
    segments: string[]
  ): number {
    // SAM is typically 10-50% of TAM based on addressable constraints
    const geoConstraint = Math.min(1, geoScope.length / 10); // Max 10 regions
    const segmentConstraint = Math.min(1, segments.length / 5); // Max 5 segments

    return tam * 0.3 * geoConstraint * segmentConstraint;
  }

  /**
   * Calculate Serviceable Obtainable Market
   */
  private calculateSOM(sam: number, pricingModel: PricingStrategy): number {
    // SOM is typically 10-25% of SAM based on competitive reality
    const pricingMultiplier =
      pricingModel.model === 'premium''
        ? 0.15
        : pricingModel.model === 'competitive''
          ? 0.2
          : 0.25;

    return sam * pricingMultiplier;
  }

  /**
   * Project market growth over time
   */
  private projectMarketGrowth(currentMarket: number, years: number): number[] {
    const projections: number[] = [currentMarket];
    const baseGrowthRate = 0.12; // 12% annual growth

    for (let i = 1; i <= years; i++) {
      const growthRate = baseGrowthRate * (1 - i * 0.01); // Declining growth rate
      projections.push(projections[i - 1] * (1 + growthRate));
    }

    return projections;
  }

  /**
   * Assess confidence in analysis
   */
  private assessConfidence(assumptions: string[]): number {
    let confidence = 70; // Base confidence

    // More assumptions generally reduce confidence
    confidence -= Math.max(0, (assumptions.length - 5) * 5);

    // Quality assessment of assumptions would be more sophisticated
    const hasQuantitativeData = assumptions.some((a) => /\d+/.test(a));
    if (hasQuantitativeData) confidence += 15;

    return Math.max(30, Math.min(95, confidence));
  }

  /**
   * Categorize competitors by market position
   */
  private categorizeCompetitors(competitors: CompetitorAnalysis[]): {
    leaders: CompetitorAnalysis[];
    challengers: CompetitorAnalysis[];
    niche: CompetitorAnalysis[];
    emerging: CompetitorAnalysis[];
  } {
    const sorted = orderBy(competitors, 'marketShare', 'desc');'

    return {
      leaders: sorted.slice(0, 3),
      challengers: sorted.slice(3, 8),
      niche: filter(
        sorted,
        (c) => c.marketShare < 5 && c.customerSegments.length <= 2
      ),
      emerging: filter(sorted, (c) => c.recentMoves.length > 0),
    };
  }

  /**
   * Calculate Herfindahl-Hirschman Index for market concentration
   */
  private calculateHHI(competitors: CompetitorAnalysis[]): number {
    const totalShare = sumBy(competitors, 'marketShare');'
    return sumBy(competitors, (c) =>
      Math.pow((c.marketShare / totalShare) * 100, 2)
    );
  }

  /**
   * Assess competitive intensity
   */
  private assessCompetitiveIntensity(
    competitors: CompetitorAnalysis[]
  ): 'low|medium|high|extreme' {'
    const hhi = this.calculateHHI(competitors);

    if (hhi > 2500) return 'low'; // Highly concentrated'
    if (hhi > 1500) return 'medium'; // Moderately concentrated'
    if (hhi > 1000) return 'high'; // Competitive'
    return 'extreme'; // Very competitive'
  }

  /**
   * Evaluate barriers to market entry
   */
  private evaluateBarrierToEntry(
    competitors: CompetitorAnalysis[]
  ): 'low|medium|high' {'
    const avgMarketShare = meanBy(competitors, 'marketShare');'
    const topCompetitorShare =
      maxBy(competitors, 'marketShare')?.marketShare||0;'

    if (topCompetitorShare > 40) return'high;
    if (avgMarketShare > 15) return 'medium;
    return 'low;
  }

  /**
   * Assess trend impact on business
   */
  private assessTrendImpact(trend: MarketTrend): TrendImpact {
    const timeToImpact = this.parseTimeframe(trend.timeframe);
    const impactScore =
      trend.impact === 'positive' ? 75 : trend.impact === 'negative' ? -50 : 0;'

    return {
      trend,
      timeToImpact,
      probabilityOfOccurrence: trend.confidence,
      potentialImpact: impactScore,
      preparednessLevel: 40, // Mock preparedness level
      requiredActions: [`Monitor ${trend.trend}`, `Assess implications`],`
    };
  }

  /**
   * Parse timeframe string to months
   */
  private parseTimeframe(timeframe: string): number {
    if (timeframe.includes('year')) return parseInt(timeframe) * 12||24;'
    if (timeframe.includes('month')) return parseInt(timeframe)||12;'
    if (timeframe.includes('quarter')) return parseInt(timeframe) * 3||6;'
    return 12; // Default 1 year
  }

  /**
   * Derive strategic implications from trends
   */
  private deriveStrategicImplications(trendImpacts: TrendImpact[]): string[] {
    const implications: string[] = [];

    const highImpactTrends = filter(
      trendImpacts,
      (t) => Math.abs(t.potentialImpact) > 60
    );
    if (highImpactTrends.length > 0) {
      implications.push('High-impact trends require strategic response');'
    }

    const nearTermTrends = filter(trendImpacts, (t) => t.timeToImpact <= 12);
    if (nearTermTrends.length > 2) {
      implications.push(
        'Multiple near-term trends require immediate attention''
      );
    }

    return implications;
  }

  /**
   * Calculate market attractiveness score
   */
  private calculateMarketAttractiveness(marketData: MarketOpportunity): number {
    const sizeScore = Math.min(
      100,
      (marketData.serviceableObtainableMarket / 10000000) * 100
    );
    const growthScore = Math.min(100, marketData.marketGrowthRate * 5);
    const competitiveScore = Math.max(
      0,
      100 - marketData.competitiveLandscape.length * 10
    );

    return sizeScore * 0.4 + growthScore * 0.4 + competitiveScore * 0.2;
  }

  /**
   * Assess market entry complexity
   */
  private assessEntryComplexity(marketData: MarketOpportunity): number {
    let complexity = 30; // Base complexity

    complexity += marketData.barriers.length * 15;
    complexity += Math.max(0, (marketData.competitiveLandscape.length - 5) * 5);

    return Math.min(100, complexity);
  }

  /**
   * Estimate time to market
   */
  private estimateTimeToMarket(
    marketData: MarketOpportunity,
    complexity: number
  ): number {
    const baseTime = 12; // 12 months base
    const complexityMultiplier = 1 + complexity / 100;

    return Math.ceil(baseTime * complexityMultiplier);
  }

  /**
   * Estimate required investment
   */
  private estimateInvestmentRequired(
    marketData: MarketOpportunity,
    complexity: number
  ): number {
    const baseInvestment = 1000000; // $1M base
    const marketMultiplier = marketData.serviceableObtainableMarket / 100000000; // Scale by market size
    const complexityMultiplier = 1 + complexity / 50;

    return baseInvestment * marketMultiplier * complexityMultiplier;
  }

  /**
   * Calculate expected ROI
   */
  private calculateExpectedROI(
    marketData: MarketOpportunity,
    investment: number
  ): number {
    const expectedRevenue = marketData.serviceableObtainableMarket * 0.05; // 5% market capture
    return ((expectedRevenue - investment) / investment) * 100;
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(
    marketData: MarketOpportunity,
    complexity: number
  ): string[] {
    const risks: string[] = [];

    if (complexity > 70) risks.push('High market entry complexity');'
    if (marketData.competitiveLandscape.length > 10)
      risks.push('Intense competition');'
    if (marketData.marketGrowthRate < 5) risks.push('Slow market growth');'

    return risks;
  }

  /**
   * Identify success factors
   */
  private identifySuccessFactors(
    marketData: MarketOpportunity,
    competitivePosition: number
  ): string[] {
    const factors: string[] = [];

    if (competitivePosition > 70) factors.push('Strong competitive position');'
    if (marketData.marketGrowthRate > 15) factors.push('High market growth');'
    if (marketData.opportunities.length > 3)
      factors.push('Multiple market opportunities');'

    return factors;
  }
}
