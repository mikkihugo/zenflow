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
import type { Logger } from '../types';
import type { CompetitorAnalysis, CustomerNeed, CustomerSegment } from '../types/product-management';
import { CustomerNeedPriority } from '../types/product-management';
/**
 * Customer research service configuration
 */
export interface CustomerResearchConfig {
    readonly maxSegments: number;
    readonly feedbackRetentionDays: number;
    readonly competitorAnalysisFrequency: number;
    readonly customerInterviewQuota: number;
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
    readonly category: 'feature|usability|performance|support|pricing;;
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
    readonly category: 'trend|opportunity|threat|competitive;;
    readonly impact: 'high' | 'medium' | 'low';
    readonly confidence: number;
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
    readonly growth: number;
    readonly satisfaction: number;
    readonly churnRisk: number;
    readonly valueScore: number;
    readonly keyInsights: string[];
}
/**
 * Competitive positioning analysis
 */
export interface CompetitivePositioning {
    readonly ourPosition: number;
    readonly competitors: CompetitorAnalysis[];
    readonly strengthsVsCompetitors: string[];
    readonly weaknessesVsCompetitors: string[];
    readonly differentiationOpportunities: string[];
    readonly competitiveThreat: 'low' | 'medium' | 'high';
}
/**
 * Customer Research Service for managing customer insights and market analysis
 */
export declare class CustomerResearchService {
    private readonly config;
    private segments;
    constructor(config: CustomerResearchConfig, logger: Logger);
    /**
     * Create detailed customer segment
     */
    createCustomerSegment(_segmentData: Omit<CustomerSegment, 'id'>, : any): CustomerSegment;
}
//# sourceMappingURL=customer-research-service.d.ts.map