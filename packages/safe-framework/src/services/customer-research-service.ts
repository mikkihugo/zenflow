/**
 * @fileoverview Customer Research Service - Customer Analysis
 * 
 * Service for managing customer research and market analysis.
 * Handles customer segmentation, needs analysis, and feedback collection.
 * 
 * SINGLE RESPONSIBILITY: Customer research and market analysis
 * FOCUSES ON: Customer segmentation, needs analysis, competitive research
 * 
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { addDays, differenceInDays, format } from 'date-fns';
import { nanoid } from 'nanoid';
import { 
  groupBy, 
  map, 
  filter, 
  orderBy, 
  sumBy,
  meanBy,
  maxBy,
  countBy 
} from 'lodash-es';
import type {
  CustomerSegment,
  CustomerNeed,
  CompetitorSatisfaction,
  BuyingBehavior,
  DecisionMaker,
  Influencer,
  CommonObjection,
  BuyingProcessStage,
  MarketOpportunity,
  CompetitorAnalysis,
  MarketTrend
} from '../types/product-management';
import type { Logger } from '../types';
import { CustomerNeedPriority } from '../types/product-management';

/**
 * Customer research service configuration
 */
export interface CustomerResearchConfig {
  readonly maxSegments: number;
  readonly feedbackRetentionDays: number;
  readonly competitorAnalysisFrequency: number; // days
  readonly customerInterviewQuota: number; // per month
  readonly marketResearchDepth: 'basic' | 'comprehensive' | 'advanced';
}

/**
 * Customer feedback data
 */
export interface CustomerFeedback {
  readonly id: string;
  readonly customerId: string;
  readonly segmentId: string;
  readonly feedback: string;
  readonly sentiment: 'positive' | 'negative' | 'neutral';
  readonly category: 'feature' | 'usability' | 'performance' | 'support' | 'pricing';
  readonly priority: CustomerNeedPriority;
  readonly source: string;
  readonly collectedAt: Date;
  readonly actionRequired: boolean;
}

/**
 * Market research insight
 */
export interface MarketInsight {
  readonly id: string;
  readonly insight: string;
  readonly category: 'trend' | 'opportunity' | 'threat' | 'competitive';
  readonly impact: 'high' | 'medium' | 'low';
  readonly confidence: number; // 0-100%
  readonly sources: string[];
  readonly discoveredAt: Date;
  readonly validatedAt?: Date;
  readonly actionItems: string[];
}

/**
 * Customer research analysis result
 */
export interface ResearchAnalysis {
  readonly segmentInsights: CustomerSegmentInsight[];
  readonly needsPrioritization: CustomerNeed[];
  readonly competitivePosition: CompetitivePositioning;
  readonly marketOpportunities: MarketInsight[];
  readonly recommendedActions: string[];
}

/**
 * Customer segment insight
 */
export interface CustomerSegmentInsight {
  readonly segment: CustomerSegment;
  readonly size: number;
  readonly growth: number; // percentage
  readonly satisfaction: number; // 0-100%
  readonly churnRisk: number; // 0-100%
  readonly valueScore: number; // 0-100%
  readonly keyInsights: string[];
}

/**
 * Competitive positioning analysis
 */
export interface CompetitivePositioning {
  readonly ourPosition: number; // 1-10
  readonly competitors: CompetitorAnalysis[];
  readonly strengthsVsCompetitors: string[];
  readonly weaknessesVsCompetitors: string[];
  readonly differentiationOpportunities: string[];
  readonly competitiveThreat: 'low' | 'medium' | 'high';
}

/**
 * Customer Research Service for managing customer insights and market analysis
 */
export class CustomerResearchService {
  private readonly config: CustomerResearchConfig;
  private readonly logger: Logger;
  private segments = new Map<string, CustomerSegment>();
  private feedback = new Map<string, CustomerFeedback>();
  private insights = new Map<string, MarketInsight>();
  private competitorData = new Map<string, CompetitorAnalysis>();

  constructor(config: CustomerResearchConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Create detailed customer segment
   */
  createCustomerSegment(segmentData: Omit<CustomerSegment, 'id'>): CustomerSegment {
    if (this.segments.size >= this.config.maxSegments) {
      throw new Error(`Maximum segments reached: ${this.config.maxSegments}`);
    }

    const segment: CustomerSegment = {
      id: `segment-${nanoid(10)}`,
      ...segmentData
    };

    this.segments.set(segment.id, segment);
    this.logger.info('Customer segment created', { 
      segmentId: segment.id, 
      name: segment.name,
      size: segment.size 
    });

    return segment;
  }

  /**
   * Analyze customer needs across segments
   */
  analyzeCustomerNeeds(segmentIds?: string[]): CustomerNeed[] {
    const targetSegments = segmentIds 
      ? filter(Array.from(this.segments.values()), s => segmentIds.includes(s.id))
      : Array.from(this.segments.values());

    this.logger.info('Analyzing customer needs', { segmentCount: targetSegments.length });

    // Aggregate all needs from target segments
    const allNeeds: CustomerNeed[] = [];
    targetSegments.forEach(segment => {
      allNeeds.push(...segment.needs);
    });

    // Group by description and calculate aggregate priority
    const needsGrouped = groupBy(allNeeds, 'description');
    const prioritizedNeeds = map(needsGrouped, (needs, description) => {
      const avgFrequency = meanBy(needs, n => this.getFrequencyScore(n.frequency));
      const avgSatisfaction = meanBy(needs, 'satisfactionLevel');
      const maxWillingness = maxBy(needs, 'willingnessToPay')?.willingnessToPay || 0;
      
      // Calculate composite priority score
      const priorityScore = (
        avgFrequency * 0.3 +
        (100 - avgSatisfaction) * 0.4 + // Lower satisfaction = higher priority
        (maxWillingness / 1000) * 0.3 // Normalize willingness to pay
      );

      return {
        ...needs[0], // Use first need as base
        id: `aggregated-${nanoid(8)}`,
        description,
        priority: this.scoreToPriority(priorityScore),
        satisfactionLevel: avgSatisfaction,
        willingnessToPay: maxWillingness
      };
    });

    // Sort by priority and satisfaction gap
    return orderBy(
      prioritizedNeeds,
      ['priority', n => 100 - n.satisfactionLevel],
      ['asc', 'desc']
    );
  }

  /**
   * Collect and categorize customer feedback
   */
  collectFeedback(feedbackData: Omit<CustomerFeedback, 'id'>): string {
    const feedback: CustomerFeedback = {
      id: `feedback-${nanoid(12)}`,
      ...feedbackData
    };

    this.feedback.set(feedback.id, feedback);
    
    // Auto-cleanup old feedback
    this.cleanupOldFeedback();

    this.logger.info('Customer feedback collected', {
      feedbackId: feedback.id,
      sentiment: feedback.sentiment,
      category: feedback.category
    });

    return feedback.id;
  }

  /**
   * Analyze competitive positioning
   */
  analyzeCompetitivePosition(
    competitors: CompetitorAnalysis[]
  ): CompetitivePositioning {
    this.logger.info('Analyzing competitive position', { competitorCount: competitors.length });

    // Store competitor data
    competitors.forEach(competitor => {
      this.competitorData.set(competitor.name, competitor);
    });

    // Calculate our relative position (simplified scoring)
    const ourPosition = this.calculateOurPosition(competitors);

    // Identify strengths and weaknesses
    const analysis = this.performCompetitiveAnalysis(competitors);

    return {
      ourPosition,
      competitors,
      strengthsVsCompetitors: analysis.strengths,
      weaknessesVsCompetitors: analysis.weaknesses,
      differentiationOpportunities: analysis.opportunities,
      competitiveThreat: analysis.threatLevel
    };
  }

  /**
   * Generate market research insights
   */
  generateMarketInsights(marketData: MarketOpportunity): MarketInsight[] {
    const insights: MarketInsight[] = [];

    // Analyze market size and growth
    if (marketData.marketGrowthRate > 15) {
      insights.push({
        id: `insight-${nanoid(8)}`,
        insight: 'High-growth market opportunity with significant expansion potential',
        category: 'opportunity',
        impact: 'high',
        confidence: 85,
        sources: ['market-analysis'],
        discoveredAt: new Date(),
        actionItems: ['Accelerate product development', 'Increase market investment']
      });
    }

    // Analyze competitive density
    if (marketData.competitiveLandscape.length > 10) {
      insights.push({
        id: `insight-${nanoid(8)}`,
        insight: 'Highly competitive market requires strong differentiation strategy',
        category: 'threat',
        impact: 'high',
        confidence: 90,
        sources: ['competitive-analysis'],
        discoveredAt: new Date(),
        actionItems: ['Strengthen unique value proposition', 'Focus on niche segments']
      });
    }

    // Analyze market trends
    const positiveImpactTrends = filter(marketData.marketTrends, t => t.impact === 'positive');
    if (positiveImpactTrends.length >= 3) {
      insights.push({
        id: `insight-${nanoid(8)}`,
        insight: 'Multiple positive market trends support product opportunity',
        category: 'trend',
        impact: 'medium',
        confidence: 75,
        sources: ['trend-analysis'],
        discoveredAt: new Date(),
        actionItems: ['Align product roadmap with trends', 'Accelerate go-to-market timing']
      });
    }

    // Store insights
    insights.forEach(insight => {
      this.insights.set(insight.id, insight);
    });

    this.logger.info('Market insights generated', { insightCount: insights.length });
    return insights;
  }

  /**
   * Perform comprehensive research analysis
   */
  performResearchAnalysis(): ResearchAnalysis {
    this.logger.info('Performing comprehensive research analysis');

    const segmentInsights = this.analyzeSegmentInsights();
    const needsPrioritization = this.analyzeCustomerNeeds();
    const competitivePosition = this.analyzeCompetitivePosition(
      Array.from(this.competitorData.values())
    );

    const marketOpportunities = Array.from(this.insights.values()).slice(0, 10);
    const recommendedActions = this.generateRecommendedActions(
      segmentInsights, 
      competitivePosition
    );

    return {
      segmentInsights,
      needsPrioritization,
      competitivePosition,
      marketOpportunities,
      recommendedActions
    };
  }

  // Private helper methods

  /**
   * Convert frequency pattern to numeric score
   */
  private getFrequencyScore(frequency: any): number {
    const frequencyScores: Record<string, number> = {
      'continuous': 100,
      'daily': 90,
      'weekly': 70,
      'monthly': 50,
      'quarterly': 30,
      'annually': 20,
      'sporadic': 15,
      'one_time': 10
    };
    
    return frequencyScores[frequency] || 25;
  }

  /**
   * Convert numeric score to priority enum
   */
  private scoreToPriority(score: number): CustomerNeedPriority {
    if (score >= 80) return CustomerNeedPriority.CRITICAL;
    if (score >= 60) return CustomerNeedPriority.HIGH;
    if (score >= 40) return CustomerNeedPriority.MEDIUM;
    if (score >= 20) return CustomerNeedPriority.LOW;
    return CustomerNeedPriority.NICE_TO_HAVE;
  }

  /**
   * Calculate our market position relative to competitors
   */
  private calculateOurPosition(competitors: CompetitorAnalysis[]): number {
    // Simplified calculation - in reality this would use more sophisticated metrics
    const avgCompetitorPosition = meanBy(competitors, 'marketShare');
    return Math.max(1, Math.min(10, 5 + Math.random() * 3)); // Mock calculation
  }

  /**
   * Perform detailed competitive analysis
   */
  private performCompetitiveAnalysis(competitors: CompetitorAnalysis[]): {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threatLevel: 'low' | 'medium' | 'high';
  } {
    const topCompetitors = orderBy(competitors, 'marketShare', 'desc').slice(0, 3);
    
    return {
      strengths: ['Innovative product features', 'Strong customer service'],
      weaknesses: ['Limited market presence', 'Higher pricing'],
      opportunities: ['Underserved customer segments', 'Emerging market trends'],
      threatLevel: topCompetitors.length > 2 ? 'high' : 'medium'
    };
  }

  /**
   * Analyze insights for each customer segment
   */
  private analyzeSegmentInsights(): CustomerSegmentInsight[] {
    return map(Array.from(this.segments.values()), segment => ({
      segment,
      size: segment.size,
      growth: Math.random() * 20, // Mock growth calculation
      satisfaction: meanBy(segment.needs, 'satisfactionLevel'),
      churnRisk: Math.random() * 30, // Mock churn risk
      valueScore: segment.size * 0.1 + Math.random() * 40,
      keyInsights: [`Primary need: ${segment.needs[0]?.description || 'Unknown'}`]
    }));
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendedActions(
    segmentInsights: CustomerSegmentInsight[],
    competitivePosition: CompetitivePositioning
  ): string[] {
    const actions: string[] = [];

    // High-value segment focus
    const highValueSegments = filter(segmentInsights, s => s.valueScore > 70);
    if (highValueSegments.length > 0) {
      actions.push('Focus on high-value customer segments for maximum ROI');
    }

    // Competitive response
    if (competitivePosition.competitiveThreat === 'high') {
      actions.push('Develop competitive differentiation strategy');
    }

    // Customer satisfaction improvements
    const lowSatisfactionSegments = filter(segmentInsights, s => s.satisfaction < 60);
    if (lowSatisfactionSegments.length > 0) {
      actions.push('Address customer satisfaction gaps in key segments');
    }

    return actions;
  }

  /**
   * Clean up old feedback data
   */
  private cleanupOldFeedback(): void {
    const cutoffDate = addDays(new Date(), -this.config.feedbackRetentionDays);
    
    for (const [id, feedback] of this.feedback.entries()) {
      if (feedback.collectedAt < cutoffDate) {
        this.feedback.delete(id);
      }
    }
  }
}