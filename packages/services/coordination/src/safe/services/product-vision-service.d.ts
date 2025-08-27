/**
 * @fileoverview Product Vision Service - Vision Management
 *
 * Service for managing product vision and strategic alignment.
 * Handles vision creation, validation, and stakeholder alignment.
 *
 * SINGLE RESPONSIBILITY: Product vision management and alignment
 * FOCUSES ON: Vision creation, stakeholder alignment, strategic coherence
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../types';
import type { CustomerSegment, MarketOpportunity, ProductVision, StakeholderAlignment, SuccessCriterion } from '../types/product-management';
/**
 * Product vision service configuration
 */
export interface ProductVisionServiceConfig {
    readonly visionValidationThreshold: number;
    readonly stakeholderAlignmentTarget: number;
    readonly visionReviewCycle: number;
    readonly maxVisionLength: number;
    readonly enableAutoAlignment: boolean;
}
/**
 * Vision validation result
 */
export interface VisionValidationResult {
    readonly isValid: boolean;
    readonly score: number;
    readonly strengths: string[];
    readonly weaknesses: string[];
    readonly recommendations: string[];
    readonly alignmentGaps: StakeholderAlignment[];
}
/**
 * Vision metrics
 */
export interface VisionMetrics {
    readonly clarity: number;
    readonly feasibility: number;
    readonly marketAlignment: number;
    readonly stakeholderAlignment: number;
    readonly strategicCoherence: number;
    readonly overallScore: number;
}
/**
 * Product Vision Service for managing product vision and strategic alignment
 */
export declare class ProductVisionService {
    private readonly config;
    private readonly logger;
    private visions;
    private validationCache;
    constructor(config: ProductVisionServiceConfig, logger: Logger);
    /**
     * Create comprehensive product vision
     */
    createProductVision(input: {
        productId: string;
        visionStatement: string;
        targetCustomers: CustomerSegment[];
        valueProposition: string;
        keyBenefits: string[];
        differentiators: string[];
        successCriteria: SuccessCriterion[];
        marketOpportunity: MarketOpportunity;
        strategicThemes: string[];
    }): Promise<ProductVision>;
}
//# sourceMappingURL=product-vision-service.d.ts.map