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
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addMonths } = dateFns;
/**
 * Product Vision Service for managing product vision and strategic alignment
 */
export class ProductVisionService {
    config;
    logger;
    visions = new Map();
    validationCache = new Map();
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    /**
     * Create comprehensive product vision
     */
    async createProductVision(input) {
        this.logger.info('Creating product vision', { productId: input.productId });
        ';
        const vision = {
            id: `vision-${generateNanoId(12)}`,
        } `
      productId: input.productId,
      visionStatement: input.visionStatement,
      targetCustomers: input.targetCustomers,
      valueProposition: input.valueProposition,
      keyBenefits: input.keyBenefits,
      differentiators: input.differentiators,
      successCriteria: input.successCriteria,
      alignmentToStrategy: this.calculateStrategyAlignment(
        input.strategicThemes
      ),
      marketOpportunity: input.marketOpportunity,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      stakeholderAlignment: [],
    };

    // Validate vision before storing
    const validation = await this.validateVision(vision);
    if (!validation.isValid) {
      throw new Error(
        `, Vision, validation, failed, { validation, weaknesses, join };
        (', ');
    }
}
``;
;
this.visions.set(vision.id, vision);
this.logger.info('Product vision created successfully', { ': visionId, vision, : .id,
    score: validation.score,
});
return vision;
/**
 * Validate product vision comprehensiveness
 */
async;
validateVision(vision, ProductVision);
Promise < VisionValidationResult > {
    const: cacheKey = `${vision.id}-${vision.updatedAt.getTime()}`
} `

    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    this.logger.debug('Validating product vision', { visionId: vision.id });'

    const metrics = this.calculateVisionMetrics(vision);
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze vision clarity
    if (metrics.clarity >= 80) {
      strengths.push('Clear and compelling vision statement');'
    } else if (metrics.clarity < 60) {
      weaknesses.push('Vision statement lacks clarity');'
      recommendations.push('Refine vision statement for better clarity');'
    }

    // Analyze market alignment
    if (metrics.marketAlignment >= 75) {
      strengths.push('Strong market opportunity alignment');'
    } else {
      weaknesses.push('Limited market alignment evidence');'
      recommendations.push('Strengthen market research and validation');'
    }

    // Analyze stakeholder alignment
    if (
      metrics.stakeholderAlignment >= this.config.stakeholderAlignmentTarget
    ) {
      strengths.push('Excellent stakeholder alignment');'
    } else {
      weaknesses.push('Stakeholder alignment below target');'
      recommendations.push('Increase stakeholder engagement and communication');'
    }

    // Analyze strategic coherence
    if (metrics.strategicCoherence >= 70) {
      strengths.push('Strong strategic alignment');'
    } else {
      weaknesses.push('Strategic alignment needs improvement');'
      recommendations.push('Clarify connection to organizational strategy');'
    }

    // Identify alignment gaps
    const alignmentGaps = filter(
      vision.stakeholderAlignment,
      (sa) => sa.alignmentLevel < this.config.stakeholderAlignmentTarget
    );

    const result: VisionValidationResult = {
      isValid: metrics.overallScore >= this.config.visionValidationThreshold,
      score: metrics.overallScore,
      strengths,
      weaknesses,
      recommendations,
      alignmentGaps,
    };

    this.validationCache.set(cacheKey, result);
    return result;
  }

  /**
   * Calculate comprehensive vision metrics
   */
  private calculateVisionMetrics(vision: ProductVision): VisionMetrics {
    // Calculate clarity (based on vision statement quality)
    const clarity = this.assessVisionClarity(vision.visionStatement);

    // Calculate feasibility (based on success criteria and market opportunity)
    const feasibility = this.assessFeasibility(
      vision.successCriteria,
      vision.marketOpportunity
    );

    // Calculate market alignment (based on customer segments and market opportunity)
    const marketAlignment = this.assessMarketAlignment(
      vision.targetCustomers,
      vision.marketOpportunity
    );

    // Calculate stakeholder alignment (average alignment levels)
    const stakeholderAlignment =
      vision.stakeholderAlignment.length > 0
        ? meanBy(vision.stakeholderAlignment, 'alignmentLevel')'
        : 0;

    // Calculate strategic coherence
    const strategicCoherence = vision.alignmentToStrategy.alignmentScore;

    // Calculate overall score (weighted average)
    const overallScore =
      clarity * 0.25 +
      feasibility * 0.2 +
      marketAlignment * 0.25 +
      stakeholderAlignment * 0.15 +
      strategicCoherence * 0.15;

    return {
      clarity,
      feasibility,
      marketAlignment,
      stakeholderAlignment,
      strategicCoherence,
      overallScore,
    };
  }

  /**
   * Assess vision statement clarity
   */
  private assessVisionClarity(visionStatement: string): number {
    let score = 50; // Base score

    // Length check (not too short, not too long)
    if (
      visionStatement.length >= 50 &&
      visionStatement.length <= this.config.maxVisionLength
    ) {
      score += 20;
    }

    // Check for key elements
    const hasWho = /customer|user|client/i.test(visionStatement);
    const hasWhat = /provide|deliver|enable|create/i.test(visionStatement);
    const hasWhy = /because|to|for|so that/i.test(visionStatement);

    if (hasWho) score += 10;
    if (hasWhat) score += 10;
    if (hasWhy) score += 10;

    return Math.min(100, score);
  }

  /**
   * Assess vision feasibility
   */
  private assessFeasibility(
    successCriteria: SuccessCriterion[],
    marketOpportunity: MarketOpportunity
  ): number {
    let score = 30; // Base score

    // Check if success criteria are well-defined
    if (successCriteria.length >= 3) {
      score += 30;
    }

    // Check market size feasibility
    const marketSize = marketOpportunity.serviceableObtainableMarket;
    if (marketSize > 1000000) {
      // $1M+ market
      score += 25;
    } else if (marketSize > 100000) {
      // $100K+ market
      score += 15;
    }

    // Check competitive landscape
    if (marketOpportunity.competitiveLandscape.length <= 5) {
      score += 15; // Not overly crowded
    }

    return Math.min(100, score);
  }

  /**
   * Assess market alignment
   */
  private assessMarketAlignment(
    targetCustomers: CustomerSegment[],
    marketOpportunity: MarketOpportunity
  ): number {
    let score = 20; // Base score

    // Check customer segment definition
    if (targetCustomers.length >= 1 && targetCustomers.length <= 3) {
      score += 30; // Focused but not too narrow
    }

    // Check market growth potential
    if (marketOpportunity.marketGrowthRate > 10) {
      score += 25; // High growth market
    } else if (marketOpportunity.marketGrowthRate > 5) {
      score += 15; // Moderate growth
    }

    // Check for market drivers
    if (marketOpportunity.opportunities.length >= 3) {
      score += 25;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate strategy alignment
   */
  private calculateStrategyAlignment(
    strategicThemes: string[]
  ): StrategyAlignment 
    return {
      strategicTheme: strategicThemes.join(', '),
      alignmentScore: strategicThemes.length > 0 ? 75 : 25,
      contributionLevel: strategicThemes.length > 0 ? 'direct' : 'indirect',
      strategicImportance: Math.min(10, strategicThemes.length * 3),
    };

  /**
   * Update stakeholder alignment
   */
  async updateStakeholderAlignment(
    visionId: string,
    alignments: StakeholderAlignment[]
  ): Promise<void> {
    const vision = this.visions.get(visionId);
    if (!vision) {
      throw new Error(`;
Vision;
not;
found: $;
{
    visionId;
}
`);`;
const updatedVision = {
    ...vision,
    stakeholderAlignment: alignments,
    updatedAt: new Date(),
};
this.visions.set(visionId, updatedVision);
// Clear validation cache
this.validationCache.clear();
this.logger.info('Stakeholder alignment updated', { ': visionId,
    alignmentCount: alignments.length,
});
/**
 * Get vision by ID
 */
getVision(visionId, string);
ProductVision | undefined;
{
    return this.visions.get(visionId);
}
/**
 * List visions by product
 */
getVisionsByProduct(productId, string);
ProductVision[];
{
    return filter(Array.from(this.visions.values()), (vision) => vision.productId === productId);
}
/**
 * Get vision metrics
 */
async;
getVisionMetrics(visionId, string);
Promise < VisionMetrics | null > {
    const: vision = this.visions.get(visionId),
    if(, vision) {
        return null;
    },
    return: this.calculateVisionMetrics(vision)
};
